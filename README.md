# Skdiv.Studios — Live Dashboard Backend

Next.js backend that powers the `/skdivlive` route on [skdiv.com](https://skdiv.com)..

Fetches data from YouTube, Instagram, Spotify, Apple Podcasts and TikTok APIs,
caches results for 5 minutes, and serves them as JSON at `/api/metrics`.
The skdiv-website (Vite + React) calls this endpoint from the browser.

---

## How it works

```
skdiv.com/skdivlive  →  fetch /api/metrics  →  This server (Vercel)
                                                  ├── YouTube API
                                                  ├── Instagram Graph API
                                                  ├── Spotify API
                                                  ├── Apple iTunes API
                                                  └── TikTok API
```

Every provider is independent — if one API is not configured or fails,
the rest still work. Nothing breaks the page.

---

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the keys you have
npm run dev
```

Open `http://localhost:3000`. Works with zero keys — unconfigured sources
show as "Not configured" rather than crashing.

---

## Environment variables

Copy `.env.example` and fill in what you have.
Add the same variables in **Vercel → Project → Settings → Environment Variables**.

| Variable | Description |
|---|---|
| `YOUTUBE_API_KEY` | Google Cloud → YouTube Data API v3 key |
| `YOUTUBE_CHANNEL_ID` | Already set: `UCLPOTDs8UWyy6m-ZzkS82Xg` |
| `INSTAGRAM_USER_ID` | Instagram Business account numeric ID |
| `INSTAGRAM_ACCESS_TOKEN` | Meta long-lived token (refreshes every 60 days) |
| `INSTAGRAM_GRAPH_VERSION` | Defaults to `v21.0` |
| `SPOTIFY_CLIENT_ID` | Spotify Developer Dashboard |
| `SPOTIFY_CLIENT_SECRET` | Spotify Developer Dashboard |
| `SPOTIFY_SHOW_ID` | Already set: `033VW8uMzevcsKbUVL1cB8` |
| `APPLE_PODCAST_ID` | Already set: `6794767948` |
| `REVALIDATE_SECRET` | Any random string — protects the cron endpoint |

---

## Deploying to Vercel

1. Push this repo to GitHub (already done)
2. Vercel auto-deploys on every push to `main`
3. Add all environment variables in Vercel dashboard
4. Set `VITE_LIVE_API_URL` in skdiv-website to your Vercel deployment URL

---

## Project structure

```
app/
  page.tsx                  Server-rendered dashboard page
  layout.tsx                Root layout
  globals.css               Dashboard styles
  api/metrics/route.ts      JSON endpoint — skdiv-website fetches this
  api/revalidate/route.ts   Cron target — keeps cache warm every 6h
  components/               Dashboard UI (Dashboard, Tiles, Funnel, PlatformCards, ClipChart)
lib/
  providers/                One file per platform (youtube, instagram, spotify, tiktok, apple)
  aggregate.ts              Runs all providers in parallel
  types.ts                  Shared TypeScript types
  util.ts                   Helpers (fetch, error handling, date utils)
data/
  manual.json               Hand-entered numbers (Instagram insights, Apple rating)
public/
  banner.jpg                Skdiv.Studios banner image
vercel.json                 Cron schedule (every 6 hours)
next.config.mjs             CORS headers for cross-origin fetch from skdiv-website
```

---

Built for Skdiv.Studios.