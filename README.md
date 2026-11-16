# harsh_portfolio

Personal portfolio of **Harsh Kaptan**: engineer, mostly yapping about AI & Web3, occasionally shipping it.

Plain HTML, CSS and JavaScript. No build step.

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173. Clean routes like `/favourites` need Vercel's rewrites (see `vercel.json`); locally, start from `/` and use the nav.

## Deploy

Works as-is on Vercel, Netlify or Cloudflare Pages. `vercel.json` (Vercel) and `_headers` / `_redirects` (Netlify, Cloudflare Pages) set clean URLs, security and caching headers.

After editing `assets/style.css`, `common.js` or `home.js`, run `python3 scripts/build.py`. It inlines the CSS into `index.html` (faster first paint) and stamps fresh `?v=` versions on the scripts.

## Structure

- `index.html`: the whole site in one page. Clean routes (`/about`, `/work`, `/projects`, `/contact`, `/favourites`) switch views without reloading, so the music keeps playing.
- `harsh-kaptan.md`: plain-text version of the portfolio (used by the ⌘K "Open in Markdown" command)
- `assets/`: styles, scripts, fonts, icons and images
- `api/views.js`: page-view counter (Vercel Function + Upstash Redis). Connect Upstash for Redis to the project in Vercel → Storage; until then the site falls back to the free Abacus counter.
