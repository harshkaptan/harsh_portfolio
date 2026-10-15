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

When you edit `assets/style.css`, `common.js` or `home.js`, bump the `?v=` value in `index.html` so visitors get the new file.

## Structure

- `index.html`: the whole site in one page. Clean routes (`/about`, `/work`, `/projects`, `/contact`, `/favourites`) switch views without reloading, so the music keeps playing.
- `harsh-kaptan.md`: plain-text version of the portfolio (used by the ⌘K "Open in Markdown" command)
- `assets/`: styles, scripts, fonts, icons and images
