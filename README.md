# Today — a two-day to-do app

Offline-first PWA. Today, tomorrow, and a backlog. Nothing else.

## Get it on your phone (~2 minutes)

1. Go to **app.netlify.com/drop** (free, no account needed to start) and drag this whole folder onto the page. You'll get a URL like `https://something.netlify.app`.
   - Alternative: GitHub Pages, Vercel, or any static host.
2. Open that URL in **Safari** on your iPhone.
3. Tap **Share → Add to Home Screen**.
4. Open it from the home screen once while online — after that it works fully offline.

## How it works

- **Swipe** left/right on blank paper to flip between Today and Tomorrow.
- **Tap** the `+ add a new task` line to add (new tasks go to the top).
- **Tap** a task to cross it out; tap again to un-cross.
- **Arrow** on a task sends it to the other day.
- **Swipe left on a task** for delete / send to backlog.
- **Long-press and drag** to reorder.
- **edit** button: tap tasks to rename them.
- **backlog** button: permanent tasks live here. Tap to select several, then
  `add N to today/tomorrow`. Items sent to backlog from a day (shown in italic)
  leave the backlog once used; items created in the backlog stay forever.
- At **midnight**: crossed-out tasks disappear, unfinished ones roll into the new
  today, tomorrow becomes today.

All data is stored on-device (localStorage). No server, no account, no tracking.
