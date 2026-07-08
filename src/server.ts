import "./lib/error-capture";

import { extname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { deleteUpload, readContent, validateContent, writeContent, writeUpload } from "./lib/content-store";
import { DEFAULT_SITE_CONTENT } from "./lib/site-content-data";
// Validate Web3Forms environment variables on startup
const REQUIRED_WEB3FORMS_VARS = ["WEB3FORMS_ACCESS_KEY"];
const missingWeb3FormsVarsOnStart = REQUIRED_WEB3FORMS_VARS.filter((varName) => !process.env[varName]);
if (missingWeb3FormsVarsOnStart.length > 0) {
  console.warn(`[WEB3FORMS CONFIGURATION WARNING] The following environment variables are missing for contact form functionality: ${missingWeb3FormsVarsOnStart.join(", ")}`);
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
const ADMIN_SESSION_VALUE = "mrora-admin-session";

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init.headers ?? {}) },
  });
}

function corsCredentialsHeaders(request: Request) {
  return {
    "access-control-allow-origin": request.headers.get("origin") ?? "http://127.0.0.1:8080",
    "access-control-allow-credentials": "true",
  };
}

function getCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

function isAuthed(request: Request) {
  return getCookie(request, "mrora_admin") === ADMIN_SESSION_VALUE;
}

async function handleApi(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  
  if (url.pathname === "/api/contact" && request.method === "POST") {
    const body = await request.json().catch(() => null) as {
      name?: string;
      phone?: string;
      email?: string;
      service?: string;
      message?: string;
    } | null;

    // Validate required fields
    if (!body?.name || !body?.email || !body?.message || !body?.service) {
      console.error("[Validation Error] Missing fields in inquiry request body:", body);
      return json({ ok: false, error: "Missing required fields (name, email, service, and message are required)" }, { status: 400, headers: corsCredentialsHeaders(request) });
    }

    // Check environment variables at runtime
    const requiredVars = ["WEB3FORMS_ACCESS_KEY"];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
      const errorMsg = `Web3Forms email service is misconfigured. Missing environment variables: ${missingVars.join(", ")}`;
      console.error(`[Configuration Error] ${errorMsg}`);
      return json(
        { ok: false, error: errorMsg },
        { status: 500, headers: corsCredentialsHeaders(request) }
      );
    }

    const accessKey = process.env.WEB3FORMS_ACCESS_KEY!;

    console.log(`[Web3Forms Info] Forwarding submission to Web3Forms API...`);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: body.name,
          email: body.email,
          phone: body.phone || "N/A",
          subject: `Mrora Inquiry: ${body.service} from ${body.name}`,
          from_name: "Mrora Website",
          replyto: body.email,
          message: `Selected Service: ${body.service}\n\nProject Details:\n${body.message}`
        })
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        console.log(`[Web3Forms Info] Submission succeeded. Message: ${data.message}`);
        return json({ ok: true, recipient: "configured Web3Forms inbox" }, { headers: corsCredentialsHeaders(request) });
      } else {
        throw new Error(data?.message || "Failed to submit to Web3Forms API.");
      }
    } catch (error: any) {
      const dispatchErrorMsg = `Web3Forms Dispatch Failed: ${error?.message || error}`;
      console.error(`[Web3Forms Dispatch Error] ${dispatchErrorMsg}`, error);
      return json(
        { ok: false, error: dispatchErrorMsg },
        { status: 500, headers: corsCredentialsHeaders(request) }
      );
    }
  }

  if (url.pathname === "/api/content" && request.method === "GET") {
    return json(await readContent(), { headers: corsCredentialsHeaders(request) });
  }

  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    const body = await request.json().catch(() => null) as { password?: string } | null;
    if (body?.password !== "mrora-admin") {
      return json({ ok: false, error: "Invalid password" }, { status: 401, headers: corsCredentialsHeaders(request) });
    }
    return json({ ok: true }, {
      headers: {
        ...corsCredentialsHeaders(request),
        "set-cookie": `mrora_admin=${ADMIN_SESSION_VALUE}; Path=/; HttpOnly; SameSite=Lax`,
      },
    });
  }

  if (url.pathname === "/api/admin/session" && request.method === "GET") {
    return json({ authed: isAuthed(request) }, { headers: corsCredentialsHeaders(request) });
  }

  if (url.pathname === "/api/admin/logout" && request.method === "POST") {
    return json({ ok: true }, {
      headers: {
        ...corsCredentialsHeaders(request),
        "set-cookie": `mrora_admin=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`,
      },
    });
  }

  if (url.pathname === "/api/admin/content" && request.method === "POST") {
    if (!isAuthed(request)) return json({ ok: false, error: "Unauthorized" }, { status: 401, headers: corsCredentialsHeaders(request) });
    const body = await request.json().catch(() => null);
    if (!validateContent(body)) return json({ ok: false, error: "Invalid content" }, { status: 400, headers: corsCredentialsHeaders(request) });
    await writeContent(body);
    return json({ ok: true }, { headers: corsCredentialsHeaders(request) });
  }

  if (url.pathname === "/api/admin/content/reset" && request.method === "POST") {
    if (!isAuthed(request)) return json({ ok: false, error: "Unauthorized" }, { status: 401, headers: corsCredentialsHeaders(request) });
    await writeContent(DEFAULT_SITE_CONTENT);
    return json({ ok: true }, { headers: corsCredentialsHeaders(request) });
  }

  if (url.pathname === "/api/admin/upload" && request.method === "POST") {
    if (!isAuthed(request)) return json({ ok: false, error: "Unauthorized" }, { status: 401, headers: corsCredentialsHeaders(request) });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return json({ ok: false, error: "No file uploaded" }, { status: 400, headers: corsCredentialsHeaders(request) });
    if (!file.type.startsWith("image/")) return json({ ok: false, error: "Images only" }, { status: 400, headers: corsCredentialsHeaders(request) });
    if (file.size > 5 * 1024 * 1024) return json({ ok: false, error: "Max 5MB" }, { status: 400, headers: corsCredentialsHeaders(request) });
    const ext = extname(file.name) || `.${file.type.split("/")[1] ?? "png"}`;
    const name = `${Date.now()}-${randomUUID()}${ext}`;
    const url = await writeUpload(name, new Uint8Array(await file.arrayBuffer()));
    return json({ ok: true, url, filename: name }, { headers: corsCredentialsHeaders(request) });
  }

  if (url.pathname.startsWith("/api/uploads/") && request.method === "GET") {
    const filename = decodeURIComponent(url.pathname.split("/").pop() || "");
    const filePath = resolve(process.cwd(), ".data", "uploads", filename);
    const file = await readFile(filePath).catch(() => null);
    if (!file) return new Response("Not found", { status: 404 });
    return new Response(file, { headers: { "content-type": "application/octet-stream" } });
  }

  if (url.pathname === "/api/admin/upload" && request.method === "DELETE") {
    if (!isAuthed(request)) return json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => null) as { filename?: string; url?: string } | null;
    const identifier = body?.url ?? body?.filename;
    if (!identifier) return json({ ok: false, error: "Missing filename" }, { status: 400, headers: corsCredentialsHeaders(request) });
    await deleteUpload(identifier);
    return json({ ok: true }, { headers: corsCredentialsHeaders(request) });
  }
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const apiResponse = await handleApi(request);
      if (apiResponse) return apiResponse;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      if (new URL(request.url).pathname.startsWith("/api/")) {
        return json(
          { ok: false, error: error instanceof Error ? error.message : "Server error" },
          { status: 500, headers: corsCredentialsHeaders(request) },
        );
      }
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
