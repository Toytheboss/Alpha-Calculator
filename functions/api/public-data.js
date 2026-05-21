const KV_KEY = "state";

/** 访客只读：公开读取统计数据（不含写入） */
export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const kv = context.env.ALPHA_KV;
  if (!kv) {
    return Response.json({ error: "KV not configured" }, { status: 500 });
  }

  const raw = await kv.get(KV_KEY);
  return new Response(raw || JSON.stringify({ accounts: [], records: [] }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });
}
