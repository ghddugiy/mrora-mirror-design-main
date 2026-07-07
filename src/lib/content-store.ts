import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, copyFile, readdir, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { del as deleteBlob, get, list, put } from "@vercel/blob";
import { DEFAULT_SITE_CONTENT, siteContentSchema, type SiteContent } from "./site-content-data";

const CONTENT_FILE = resolve(process.cwd(), ".data", "site-content.json");
const BACKUP_DIR = resolve(process.cwd(), ".data", "backups");
const UPLOAD_DIR = resolve(process.cwd(), ".data", "uploads");
const CONTENT_BLOB_PREFIX = "cms/site-content/";
const UPLOAD_BLOB_PREFIX = "uploads/";
const BLOB_ACCESS = "public";

function hasBlobStore() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN),
  );
}

function blobAuthOptions() {
  return process.env.BLOB_READ_WRITE_TOKEN
    ? { token: process.env.BLOB_READ_WRITE_TOKEN }
    : {};
}

async function ensureDir() {
  await mkdir(dirname(CONTENT_FILE), { recursive: true });
  await mkdir(BACKUP_DIR, { recursive: true });
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function readContent(): Promise<SiteContent> {
  if (hasBlobStore()) {
    const remoteContent = await readBlobContent().catch((error) => {
      console.error("Failed to read CMS content from Vercel Blob", error);
      return undefined;
    });
    if (remoteContent) return remoteContent;
  }

  try {
    const raw = await readFile(CONTENT_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return siteContentSchema.safeParse(parsed).success ? parsed as SiteContent : DEFAULT_SITE_CONTENT;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function writeContent(content: SiteContent) {
  if (hasBlobStore()) {
    await writeBlobContent(content);
    return;
  }

  await ensureDir();
  try {
    await copyFile(CONTENT_FILE, resolve(BACKUP_DIR, `site-content-${new Date().toISOString().replace(/[:.]/g, "-")}.json`));
  } catch {
    // No previous file yet.
  }
  await writeFile(CONTENT_FILE, JSON.stringify(content, null, 2), "utf8");
}

export function validateContent(value: unknown): value is SiteContent {
  return siteContentSchema.safeParse(value).success;
}

export async function writeUpload(filename: string, bytes: Uint8Array) {
  if (hasBlobStore()) {
    const blob = await put(`${UPLOAD_BLOB_PREFIX}${filename}`, bytes, {
      ...blobAuthOptions(),
      access: BLOB_ACCESS,
      addRandomSuffix: false,
      allowOverwrite: false,
    });
    return blob.url;
  }

  await ensureDir();
  const filePath = resolve(UPLOAD_DIR, filename);
  await writeFile(filePath, bytes);
  return `/api/uploads/${encodeURIComponent(filename)}`;
}

export async function deleteUpload(identifier: string) {
  if (hasBlobStore()) {
    await deleteBlob(identifier, blobAuthOptions()).catch(() => {});
    return;
  }

  const filename = decodeURIComponent(identifier.split("/").pop() ?? identifier);
  const filePath = resolve(UPLOAD_DIR, filename);
  await unlink(filePath).catch(() => {});
}

export async function listUploads() {
  await ensureDir();
  return await readdir(UPLOAD_DIR);
}

async function readBlobContent(): Promise<SiteContent | undefined> {
  const entries = await list({ ...blobAuthOptions(), prefix: CONTENT_BLOB_PREFIX, limit: 1000 });
  const latest = entries.blobs
    .filter((blob) => blob.pathname.endsWith(".json"))
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];

  if (!latest) return undefined;

  const result = await get(latest.pathname, { ...blobAuthOptions(), access: BLOB_ACCESS });
  if (!result?.stream) return undefined;

  const raw = await new Response(result.stream).text();
  const parsed = JSON.parse(raw);
  const validation = siteContentSchema.safeParse(parsed);
  return validation.success ? validation.data : undefined;
}

async function writeBlobContent(content: SiteContent) {
  const pathname = `${CONTENT_BLOB_PREFIX}${Date.now()}-${randomUUID()}.json`;
  await put(pathname, JSON.stringify(content, null, 2), {
    ...blobAuthOptions(),
    access: BLOB_ACCESS,
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
  });

  await pruneOldContentBlobs(pathname).catch((error) => {
    console.error("Failed to prune old CMS content blobs", error);
  });
}

async function pruneOldContentBlobs(keepPathname: string) {
  const entries = await list({ ...blobAuthOptions(), prefix: CONTENT_BLOB_PREFIX, limit: 1000 });
  const stale = entries.blobs
    .filter((blob) => blob.pathname !== keepPathname)
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    .slice(10)
    .map((blob) => blob.pathname);

  if (stale.length > 0) await deleteBlob(stale, blobAuthOptions());
}
