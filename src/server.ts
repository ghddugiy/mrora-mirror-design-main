import "./lib/error-capture";

import { extname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { deleteUpload, readContent, validateContent, writeContent, writeUpload } from "./lib/content-store";
import { DEFAULT_SITE_CONTENT } from "./lib/site-content-data";

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
    const content = await readContent();
    const emailTo = content?.contact?.email || "mroraai11@gmail.com";
    const body = await request.json().catch(() => null) as {
      name?: string;
      phone?: string;
      email?: string;
      service?: string;
      message?: string;
    } | null;

    if (!body?.name || !body?.email || !body?.message || !body?.service) {
      return json({ ok: false, error: "Missing required fields" }, { status: 400, headers: corsCredentialsHeaders(request) });
    }

    let sent = false;

    // Check if RESEND_API_KEY is available
    if (process.env.RESEND_API_KEY) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: "Mrora Contact Form <onboarding@resend.dev>",
            to: emailTo,
            subject: `Project Inquiry from ${body.name}`,
            html: `<p><strong>Name:</strong> ${body.name}</p>
                   <p><strong>Phone:</strong> ${body.phone || 'N/A'}</p>
                   <p><strong>Email:</strong> ${body.email}</p>
                   <p><strong>Service Needed:</strong> ${body.service}</p>
                   <p><strong>Project Details:</strong><br/>${body.message.replace(/\n/g, '<br/>')}</p>`
          })
        });
        if (response.ok) {
          sent = true;
        } else {
          const errText = await response.text();
          console.error("Resend send failed:", errText);
        }
      } catch (e) {
        console.error("Resend send error:", e);
      }
    }

    // Fallback to FormSubmit.co proxy
    if (!sent) {
      try {
        const formSubmitHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          "Accept": "application/json"
        };
        const referer = request.headers.get("referer");
        if (referer) {
          formSubmitHeaders["Referer"] = referer;
        }
        const origin = request.headers.get("origin");
        if (origin) {
          formSubmitHeaders["Origin"] = origin;
        }

        const response = await fetch(`https://formsubmit.co/ajax/${emailTo}`, {
          method: "POST",
          headers: formSubmitHeaders,
          body: JSON.stringify({
            _subject: `Project Inquiry from ${body.name}`,
            _replyto: body.email,
            Name: body.name,
            Phone: body.phone || "N/A",
            Email: body.email,
            Service: body.service,
            Message: body.message
          })
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success === "true" || result.success === true) {
            sent = true;
          } else if (result.message && (result.message.includes("Activation") || result.message.includes("Activate"))) {
            return json({ ok: true, activationRequired: true }, { headers: corsCredentialsHeaders(request) });
          } else {
            console.error("FormSubmit send failed:", result);
          }
        } else {
          const errText = await response.text();
          console.error("FormSubmit send failed with HTTP status:", response.status, errText);
        }
      } catch (e) {
        console.error("FormSubmit send error:", e);
      }
    }

    if (sent) {
      return json({ ok: true }, { headers: corsCredentialsHeaders(request) });
    }
    return json({ ok: false, error: "Failed to send message via mail services." }, { status: 500, headers: corsCredentialsHeaders(request) });
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
