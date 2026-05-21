import { createSessionToken, sessionCookieHeader } from "../utils/auth.js";

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const password = body?.password ?? "";
  const adminPassword = context.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return Response.json({ ok: false, error: "Server not configured" }, { status: 500 });
  }
  if (!context.env.SESSION_SECRET) {
    return Response.json({ ok: false, error: "Server not configured" }, { status: 500 });
  }

  if (password !== adminPassword) {
    return Response.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const token = await createSessionToken(context.env.SESSION_SECRET);
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": sessionCookieHeader(token),
        "Content-Type": "application/json",
      },
    }
  );
}
