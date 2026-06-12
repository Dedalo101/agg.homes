# Marbella Match — agg.homes

A single-page bilingual (EN/NL) lead-generation site for A. Gonzalez, an independent
property consultant in Marbella connecting Dutch buyers with established local
Resales Online network agencies.

## Files

- `index.html` — the entire site (HTML, CSS, JS in one file)
- `robots.txt` — allows all crawlers, points to sitemap
- `sitemap.xml` — single-page sitemap
- `photo.jpg` — **add this yourself**: your headshot, square-ish (used at 280x280px
  in the agent introduction band). Falls back to a stock placeholder via `onerror`
  until this file exists.

## Before going live — checklist

### Replace stock photography
All images currently use hotlinked Unsplash placeholders. Search for `images.unsplash.com`
in `index.html` to find every instance:
- `.hero` — full-bleed background image (1 location, in `<style>`)
- `.property-card.c1` through `.c6` — six property card backgrounds (in `<style>`)
- `.agent-photo` `onerror` fallback (removable once `photo.jpg` exists)

Self-host real photos rather than relying on Unsplash long-term — hotlinking isn't
guaranteed permanent.

### Confirm partner agencies
The "network" section currently links to:
- Marbella-Resales
- Marbella For Sale
- Orangestate Properties
- Resales Online network (general)

These were chosen because they're verified Resales Online network members, but
**confirm each has an actual colab/referral agreement with you** before publishing.
Swap names/links/specialties in the `.network-visual` block (search for `partner-row`).

### Wire up Formspree
Form already posts to `https://formspree.io/f/mwvjrnyv` via AJAX
(`@formspree/ajax` CDN script at the bottom of the page). In the Formspree
dashboard:
- Confirm notification email goes where you want leads to land
- Enable spam filtering / reCAPTCHA (public lead form)
- Consider an autoresponder confirming receipt to the buyer

## Adding live Resales Online listings (future)

The "Featured properties" section (search for `PROPERTIES-GRID` comment in
`index.html`) is currently 6 static placeholder cards. To go live with real data:

1. **Backend needed** — Resales Online's API requires a server-side call (API keys
   shouldn't be exposed client-side, and CORS typically blocks direct browser
   calls). This means moving off a pure static file to hosting that supports
   PHP/Node, or a serverless function (Netlify/Vercel functions, Cloudflare
   Workers, etc.)
2. **Per-listing mapping** — each `.property-card` maps to one listing:
   - `.property-photo` background → listing main image URL
   - `.property-price` → listing price
   - `.location` → area/town
   - `<h3>` → listing title (bilingual EN/NL if Resales Online provides translated
     fields, otherwise use the same text for both `data-i18n` spans)
   - `.property-meta` spans → bedrooms / bathrooms / m²
   - outer `<a href>` → link to listing detail page (either on Resales Online or
     a detail page you build)
3. **Render loop** — generate the property card blocks server-side or via a small
   client-side fetch to your own backend endpoint that proxies the Resales Online API.

## Structure notes

- All bilingual text uses `<span data-i18n="en">...</span>` / `<span data-i18n="nl">...</span>`
  pairs. The active language is set via `data-lang` attribute on `<html>`,
  toggled by the EN/NL buttons in the header (vanilla JS, bottom of file).
- No build step — single HTML file, Google Fonts loaded via `<link>`, no
  bundler/framework.
- Color system, type scale, and spacing are defined as CSS custom properties
  at the top of `<style>` (`--ink`, `--gold`, `--cream`, `--serif`, `--sans`, etc.)
  if you want to adjust the palette globally.
