import {
  generateShareToken,
  filterStateByAccount,
  loadFullState,
} from "../utils/share.js";

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const accountId = body?.accountId;
  if (!accountId) {
    return Response.json({ error: "accountId required" }, { status: 400 });
  }

  const kv = context.env.ALPHA_KV;
  if (!kv) {
    return Response.json({ error: "KV not configured" }, { status: 500 });
  }

  const full = await loadFullState(kv);
  const acc = full.accounts.find((a) => a.id === accountId);
  if (!acc) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  const oldToken = await kv.get(`share:by-account:${accountId}`);
  if (oldToken) {
    await kv.delete(`share:token:${oldToken}`);
  }

  const token = generateShareToken();
  const meta = {
    accountId,
    accountName: acc.name,
    createdAt: Date.now(),
    expiresAt: null,
  };

  await kv.put(`share:token:${token}`, JSON.stringify(meta));
  await kv.put(`share:by-account:${accountId}`, token);

  const origin = new URL(context.request.url).origin;
  const shareUrl = `${origin}/share.html?token=${token}`;

  return Response.json({
    ok: true,
    token,
    shareUrl,
    accountName: acc.name,
  });
}

export async function onRequestDelete(context) {
  const url = new URL(context.request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return Response.json({ error: "token required" }, { status: 400 });
  }

  const kv = context.env.ALPHA_KV;
  const raw = await kv.get(`share:token:${token}`);
  if (raw) {
    const meta = JSON.parse(raw);
    await kv.delete(`share:token:${token}`);
    if (meta.accountId) {
      const current = await kv.get(`share:by-account:${meta.accountId}`);
      if (current === token) {
        await kv.delete(`share:by-account:${meta.accountId}`);
      }
    }
  }

  return Response.json({ ok: true });
}
