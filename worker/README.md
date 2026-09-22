# Cloud sync backend (Cloudflare Worker + KV)

This is the tiny server that stores each person's task list under their private
sync code. It's the only piece of this app that runs on the internet; the app
itself is still just static files.

## One-time setup (all in the browser, ~5 minutes)

1. **Create a free Cloudflare account** — <https://dash.cloudflare.com/sign-up>.
   No credit card needed for the free tier.

2. **Create the storage (KV namespace):**
   - In the left sidebar: **Storage & Databases → KV**.
   - Click **Create a namespace**. Name it `todo-sync`. Create.

3. **Create the Worker:**
   - Left sidebar: **Compute (Workers) → Workers & Pages**.
   - **Create application → Create Worker**. Give it a name, e.g. `todo-sync`.
     Cloudflare shows the URL it will live at, like
     `https://todo-sync.<your-subdomain>.workers.dev` — that's the URL the app
     will talk to. Click **Deploy** to create it, then **Edit code**.

4. **Paste the code:**
   - Replace everything in the editor with the contents of
     [`worker.js`](worker.js). Click **Deploy**.

5. **Connect the storage to the Worker (the binding):**
   - Open the Worker → **Settings → Bindings** (older UI: **Settings →
     Variables → KV Namespace Bindings**).
   - **Add binding → KV namespace.**
     - **Variable name:** `SYNC`  ← must be exactly this
     - **KV namespace:** `todo-sync`
   - Save. (If it was already running, redeploy so the binding takes effect.)

6. **Copy your Worker URL** (the `https://todo-sync.<subdomain>.workers.dev`
   one). That's what goes into the app's sync settings.

## Quick check it's alive

Open the Worker URL in a browser with no code — you should get a JSON error
`{"error":"missing or invalid sync code"}` and a 401. That error is the Worker
working correctly (it's refusing an unauthenticated request).

## Notes

- **Free tier:** 100,000 requests/day and ample KV storage. A personal to-do
  app uses a rounding error of this.
- **CORS** is open (`*`) because the sync code itself is the secret and no
  cookies are used. You can lock `Access-Control-Allow-Origin` to your Pages
  origin in `worker.js` later if you want.
- Updating the Worker later = paste new `worker.js` → **Deploy**.
