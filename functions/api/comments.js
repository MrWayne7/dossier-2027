// Cloudflare Pages Function -> /api/comments
// GET  /api/comments            -> todos los comentarios
// GET  /api/comments?section=ID -> comentarios de una sección
// POST /api/comments            -> { section, name, text }

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    const section = url.searchParams.get("section");
    let res;
    if (section) {
      res = await env.DB
        .prepare("SELECT id, section, name, text, created FROM comments WHERE section = ? ORDER BY id ASC")
        .bind(section)
        .all();
    } else {
      res = await env.DB
        .prepare("SELECT id, section, name, text, created FROM comments ORDER BY id ASC")
        .all();
    }
    return json({ ok: true, comments: res.results || [] });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const section = String(body.section || "").slice(0, 80);
    const name = String(body.name || "").slice(0, 60);
    const text = String(body.text || "").trim().slice(0, 2000);
    if (!section || !text) return json({ ok: false, error: "faltan datos" }, 400);
    await env.DB
      .prepare("INSERT INTO comments (section, name, text, created) VALUES (?, ?, ?, ?)")
      .bind(section, name, text, new Date().toISOString())
      .run();
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
