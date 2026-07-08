import "./lib/error-capture";

import { extname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { deleteUpload, readContent, validateContent, writeContent, writeUpload } from "./lib/content-store";
import { DEFAULT_SITE_CONTENT } from "./lib/site-content-data";
import { Resend } from "resend";

// Validate Resend environment variables on startup
const REQUIRED_RESEND_VARS = ["RESEND_API_KEY", "CONTACT_EMAIL"];
const missingResendVarsOnStart = REQUIRED_RESEND_VARS.filter((varName) => !process.env[varName]);
if (missingResendVarsOnStart.length > 0) {
  console.warn(`[RESEND CONFIGURATION WARNING] The following environment variables are missing for contact form functionality: ${missingResendVarsOnStart.join(", ")}`);
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
    const requiredVars = ["RESEND_API_KEY", "CONTACT_EMAIL"];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
      const errorMsg = `Resend email service is misconfigured. Missing environment variables: ${missingVars.join(", ")}`;
      console.error(`[Configuration Error] ${errorMsg}`);
      return json(
        { ok: false, error: errorMsg },
        { status: 500, headers: corsCredentialsHeaders(request) }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY!;
    const contactEmail = process.env.CONTACT_EMAIL!;

    console.log(`[Resend Info] Initializing Resend API client`);
    console.log(`[Resend Info] Target recipient email: ${contactEmail}`);

    try {
      const resend = new Resend(resendApiKey);

      const formattedDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        dateStyle: "full",
        timeStyle: "long",
      });

      const mailOptions = {
        from: `Mrora Website <onboarding@resend.dev>`,
        to: contactEmail,
        replyTo: body.email,
        subject: `Mrora Inquiry: ${body.service} from ${body.name}`,
        text: `New Project Inquiry from Mrora Website\n\n` +
              `Name: ${body.name}\n` +
              `Email: ${body.email}\n` +
              `Phone: ${body.phone || "N/A"}\n` +
              `Service: ${body.service}\n` +
              `Date & Time: ${formattedDate}\n\n` +
              `Message:\n${body.message}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background-color: #0c0c0c; color: #ffffff; border: 1px solid #1a1a1a; border-radius: 16px;">
            <h2 style="color: #c6ff3d; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #222222; padding-bottom: 15px;">
              New Project Inquiry
            </h2>
            
            <div style="background-color: #121212; padding: 20px; border-radius: 12px; border: 1px solid #222222; margin-bottom: 25px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #888888; width: 30%;">Full Name</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #ffffff; font-weight: bold;">${body.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #888888;">Email Address</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #c6ff3d; font-weight: bold;"><a href="mailto:${body.email}" style="color: #c6ff3d; text-decoration: none;">${body.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #888888;">Phone Number</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #ffffff;">${body.phone || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #888888;">Selected Service</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #ffffff;"><span style="background-color: #c6ff3d; color: #000000; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: bold;">${body.service}</span></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #888888;">Date & Time</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #ffffff;">${formattedDate}</td>
                </tr>
              </table>
            </div>

            <div style="margin-bottom: 10px;">
              <h3 style="color: #ffffff; font-size: 16px; margin-top: 0; margin-bottom: 10px; font-weight: 700;">Project details & message</h3>
              <div style="background-color: #121212; padding: 20px; border-radius: 12px; border: 1px solid #222222; font-size: 14px; line-height: 1.6; color: #dddddd; white-space: pre-wrap;">${body.message}</div>
            </div>

            <p style="font-size: 11px; color: #555555; text-align: center; margin-top: 30px; border-top: 1px solid #222222; padding-top: 15px; margin-bottom: 0;">
              This inquiry was securely delivered directly from your website contact form via Resend.
            </p>
          </div>
        `
      };

      console.log("Resend email payload configuration:", {
        from: mailOptions.from,
        to: mailOptions.to,
        replyTo: mailOptions.replyTo,
        subject: mailOptions.subject,
        textLength: mailOptions.text.length,
        htmlLength: mailOptions.html.length,
      });

      const { data, error } = await resend.emails.send(mailOptions);

      if (error) {
        throw error;
      }

      console.log(`[Resend Info] Email successfully sent to recipient: ${contactEmail}. Resend ID: ${data?.id}`);
      return json({ ok: true, recipient: contactEmail }, { headers: corsCredentialsHeaders(request) });
    } catch (error: any) {
      const dispatchErrorMsg = `Resend API Dispatch Failed: ${error?.message || error}`;
      console.error(`[Resend Dispatch Error] ${dispatchErrorMsg}`, error);
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
