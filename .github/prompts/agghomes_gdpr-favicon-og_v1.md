# PROMPT: agg.homes — GDPR Policy, Favicon Set & Social OG Image
**Version:** 1.0  
**Trigger:** Run when any of the three deliverables is missing or needs updating.

## Deliverables
1. `/en/privacy/index.html` and `/nl/privacy/index.html` — RGPD/GDPR Art. 13 policy pages
2. Favicon set: `favicon.svg`, PNG sizes, `site.webmanifest`, `<head>` snippet
3. OG image: `images/og-social.svg` + `images/og-social.jpg` (1200×630)

## Source of truth
- Privacy content: `content/privacy/{en,nl}/index.html`
- Brand assets: `favicon.svg`, `images/og-social.svg`
- Export: `node scripts/generate-brand-assets.js`
- Build: `node scripts/build-lang-pages.js`

## Execution order
1. OG image → 2. Favicon set → 3. GDPR pages (include favicon snippet in privacy templates)

See full prompt spec in CTO Agent documentation (Dedalo101 · 2026-06-14).