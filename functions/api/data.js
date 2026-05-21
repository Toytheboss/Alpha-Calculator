const KV_KEY = "state";

export async function onRequest(context) {
  const kv = context.env.ALPHA_KV;
  if (!kv) {
    return Response.json({ error: "KV not configured" }, { status: 500 });
  }

  if (context.request.method === "GET") {
    const raw = await kv.get(KV_KEY);
    const body = raw || JSON.stringify({ accounts: [], records: [] });
    return new Response(body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }

  if (context.request.method === "PUT") {
    const body = await context.request.text();
    try {
      JSON.parse(body);
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    await kv.put(KV_KEY, body);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
