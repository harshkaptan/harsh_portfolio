# harsh_portfolio

Personal portfolio of **Harsh Kaptan**: engineer, mostly yapping about AI & Web3, occasionally shipping it.

Plain HTML, CSS and JavaScript. No build step.

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Deploy

Works as-is on Vercel, Netlify or Cloudflare Pages. `vercel.json` and `_headers` set the security and caching headers.

## Structure

- `index.html`: home page
- `favourites.html`: favourite movies, series and anime
- `harsh-kaptan.md`: plain-text version of the portfolio (used by the ⌘K "Open in Markdown" command)
- `assets/`: styles, scripts, fonts, icons and images
