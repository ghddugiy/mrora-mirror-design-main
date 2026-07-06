import { mkdir, readFile, writeFile, copyFile, readdir, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { DEFAULT_SITE_CONTENT, siteContentSchema, type SiteContent } from "./site-content-data";

const CONTENT_FILE = resolve(process.cwd(), ".data", "site-content.json");
const BACKUP_DIR = resolve(process.cwd(), ".data", "backups");
const UPLOAD_DIR = resolve(process.cwd(), ".data", "uploads");

async function ensureDir() {
  await mkdir(dirname(CONTENT_FILE), { recursive: true });
  await mkdir(BACKUP_DIR, { recursive: true });
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function readContent(): Promise<SiteContent> {
  try {
    const raw = await readFile(CONTENT_FILE, "utf8");
    return JSON.parse(raw) as SiteContent;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function writeContent(content: SiteContent) {
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
  await ensureDir();
  const filePath = resolve(UPLOAD_DIR, filename);
  await writeFile(filePath, bytes);
  return filePath;
}

export async function deleteUpload(filename: string) {
  const filePath = resolve(UPLOAD_DIR, filename);
  await unlink(filePath).catch(() => {});
}

export async function listUploads() {
  await ensureDir();
  return await readdir(UPLOAD_DIR);
}
