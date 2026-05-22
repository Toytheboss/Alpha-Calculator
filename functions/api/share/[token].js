import { filterStateByAccount, loadFullState } from "../../utils/share.js";

export async function onRequestGet(context) {
  const token = context.params.token;
  if (!token || !/^[a-f0-9]{32}$/.test(token)) {
    return Response.json({ error: "Invalid token" }, { status: 400 });
  }

  const kv = context.env.ALPHA_KV;
  if (!kv) {
    return Response.json({ error: "KV not configured" }, { status: 500 });
  }

  const metaRaw = await kv.get(`share:token:${token}`);
  if (!metaRaw) {
    return Response.json({ error: "Share not found or revoked" }, { status: 404 });
  }

  const meta = JSON.parse(metaRaw);
  if (meta.expiresAt && meta.expiresAt < Date.now()) {
    return Response.json({ error: "Share expired" }, { status: 410 });
  }

  const full = await loadFullState(kv);
  const filtered = filterStateByAccount(full, meta.accountId);
  if (!filtered) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  return Response.json({
    share: meta,
    ...filtered,
  });
}
