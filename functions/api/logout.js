import { clearSessionCookieHeader } from "../utils/auth.js";

export async function onRequestPost() {
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": clearSessionCookieHeader(),
        "Content-Type": "application/json",
      },
    }
  );
}
