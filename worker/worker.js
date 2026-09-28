/*
 * Cloudflare Worker — anonymous cloud sync for the "Today" to-do app.
 *
 * What it does: stores ONE JSON blob per user, keyed by a secret "sync code".
 * There are no accounts. Whoever holds the code can read/write that blob — so
 * the code is treated like a password (sent in the Authorization header, never
 * in the URL) and is hashed here before it's used as a storage key, so the raw
 * secret is never written down on our side.
 *
 * Bindings required (set in the Cloudflare dashboard, see worker/README.md):
 *   - KV namespace bound as  SYNC
 *
 * Endpoints (the sync code goes in  Authorization: Bearer <code> ):
 *   GET  /   -> returns { state, updatedAt }  (or { state:null, updatedAt:0 } if new)
 *   PUT  /   body { state, updatedAt } -> saves the blob, returns { ok:true }
 */

// The sync code is the real secret, so we allow any web origin (no cookies are
// used, so this is safe). Lock this to your Pages origin later if you want.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};

const MAX_BYTES = 200_000; // our blob is a few KB; this is a generous guard

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Pull the sync code out of  Authorization: Bearer <code>
    const auth = request.headers.get('Authorization') || '';
    const code = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (code.length < 8) return json({ error: 'missing or invalid sync code' }, 401);

    const key = await keyFor(code);

    if (request.method === 'GET') {
      const stored = await env.SYNC.get(key);
      if (!stored) return json({ state: null, updatedAt: 0 }, 200);
      return new Response(stored, {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'PUT') {
      let body;
      try { body = await request.json(); }
      catch { return json({ error: 'bad json' }, 400); }
      if (typeof body?.updatedAt !== 'number') {
        return json({ error: 'updatedAt (number) required' }, 400);
      }
      const payload = JSON.stringify({ state: body.state ?? null, updatedAt: body.updatedAt });
      if (payload.length > MAX_BYTES) return json({ error: 'payload too large' }, 413);
      await env.SYNC.put(key, payload);
      return json({ ok: true, updatedAt: body.updatedAt }, 200);
    }

    return json({ error: 'method not allowed' }, 405);
  },
};

// Hash the code -> the KV key, so the raw secret is never stored as a key name.
async function keyFor(code) {
  const data = new TextEncoder().encode('todo-sync:' + code);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return 'blob:' + [...new Uint8Array(digest)]
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
