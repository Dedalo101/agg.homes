/**
 * Build /en/ and /nl/ indexable pages from the bilingual source template.
 * Run: node scripts/build-lang-pages.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'index.template.html');
const BASE = 'https://agg.homes';

const META = {
  en: {
    lang: 'en',
    title: 'A. Gonzalez · agg.homes — Costa del Sol property introductions',
    description:
      'A. Gonzalez introduces Dutch and international buyers to trusted Marbella, Nueva Andalucía, Estepona and Benahávis agents. Personal, free introductions via agg.homes.',
    canonical: `${BASE}/en/`,
    logo: 'AGG<em>.homes</em>',
    logoAria: 'AGG.homes',
    footer: '© 2026 AGG.homes · A. Gonzalez',
    photoAlt:
      'A. Gonzalez, independent property consultant in Marbella, Costa del Sol',
    otherLang: { href: '/nl/', label: 'NL', code: 'nl' },
    schemaDesc:
      'Independent property consultant connecting buyers with trusted Costa del Sol real estate specialists.',
    faq: [
      {
        q: 'How quickly will A. Gonzalez respond?',
        a: 'You typically receive a personal reply within 24 hours.',
      },
      {
        q: 'Is there an extra cost for the introduction?',
        a: 'No — introductions through agg.homes are free for buyers.',
      },
      {
        q: 'Why use an intermediary instead of going directly to an agency?',
        a: 'Each partner agency specialises in different areas and price ranges. A. Gonzalez matches you to the one that fits your profile — so you are not passed between agents who do not know your search.',
      },
    ],
  },
  nl: {
    lang: 'nl',
    title: 'A. Gonzalez · agg.homes — Woningen aan de Costa del Sol',
    description:
      'A. Gonzalez begeleidt Nederlandse en internationale kopers naar betrouwbare makelaars in Marbella, Nueva Andalucía, Estepona en Benahávis. Persoonlijke, gratis introducties via agg.homes.',
    canonical: `${BASE}/nl/`,
    logo: 'AGG<em>.homes</em>',
    logoAria: 'AGG.homes',
    footer: '© 2026 AGG.homes · A. Gonzalez',
    photoAlt:
      'A. Gonzalez, onafhankelijk woonadviseur in Marbella, Costa del Sol',
    otherLang: { href: '/en/', label: 'EN', code: 'en' },
    schemaDesc:
      'Onafhankelijk woonadviseur die kopers koppelt aan betrouwbare makelaars aan de Costa del Sol.',
    faq: [
      {
        q: 'Hoe snel reageert A. Gonzalez?',
        a: 'U ontvangt doorgaans binnen 24 uur een persoonlijk antwoord.',
      },
      {
        q: 'Zijn er extra kosten voor de introductie?',
        a: 'Nee — introducties via agg.homes zijn gratis voor kopers.',
      },
      {
        q: 'Waarom een tussenpersoon in plaats van rechtstreeks naar een makelaar?',
        a: 'Elk partnerkantoor specialiseert zich in andere gebieden en prijssegmenten. A. Gonzalez koppelt u aan degene die bij uw profiel past — zodat u niet wordt doorverwezen tussen makelaars die uw zoektocht niet kennen.',
      },
    ],
  },
};

function stripOtherLanguage(html, lang) {
  const other = lang === 'en' ? 'nl' : 'en';
  let out = html.replace(
    new RegExp(
      `<span data-i18n="${other}"[^>]*>[\\s\\S]*?<\\/span>`,
      'gi'
    ),
    ''
  );
  out = out.replace(
    new RegExp(`<(strong|em) data-i18n="${other}"[^>]*>[\\s\\S]*?<\\/\\1>`, 'gi'),
    ''
  );
  out = out.replace(
    new RegExp(`<span data-i18n="${lang}"([^>]*)>([\\s\\S]*?)<\\/span>`, 'gi'),
    '$2'
  );
  out = out.replace(
    new RegExp(`<(strong|em) data-i18n="${lang}"([^>]*)>([\\s\\S]*?)<\\/\\1>`, 'gi'),
    '<$1$2>$3</$1>'
  );
  return out;
}

function schemaJson(meta) {
  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'RealEstateAgent',
          '@id': `${meta.canonical}#agent`,
          name: 'A. Gonzalez',
          url: meta.canonical,
          image: `${BASE}/images/photo.webp`,
          telephone: '+31-6-17622375',
          email: 'info@agg.homes',
          description: meta.schemaDesc,
          areaServed: [
            'Marbella',
            'Nueva Andalucía',
            'Estepona',
            'Benahávis',
            'Málaga',
          ],
          knowsLanguage: ['en', 'nl', 'es'],
          parentOrganization: { '@id': `${meta.canonical}#org` },
        },
        {
          '@type': ['Organization', 'LocalBusiness'],
          '@id': `${meta.canonical}#org`,
          name: 'AGG.homes',
          url: BASE,
          logo: `${BASE}/images/photo.webp`,
          description: meta.schemaDesc,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Marbella',
            addressRegion: 'Andalucía',
            addressCountry: 'ES',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'info@agg.homes',
            telephone: '+31-6-17622375',
            availableLanguage: ['English', 'Dutch', 'Spanish'],
          },
        },
        {
          '@type': 'FAQPage',
          mainEntity: meta.faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        },
      ],
    },
    null,
    2
  );
}

function buildPage(lang) {
  const meta = META[lang];
  let html = fs.readFileSync(TEMPLATE, 'utf8');
  html = stripOtherLanguage(html, lang);

  html = html.replace(/<html lang="en" data-lang="en">/i, `<html lang="${meta.lang}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*">/i,
    `<meta name="description" content="${meta.description}">`
  );

  const seoBlock = `
<link rel="canonical" href="${meta.canonical}">
<link rel="alternate" hreflang="en" href="${BASE}/en/">
<link rel="alternate" hreflang="nl" href="${BASE}/nl/">
<link rel="alternate" hreflang="x-default" href="${BASE}/en/">
<meta property="og:type" content="website">
<meta property="og:url" content="${meta.canonical}">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:image" content="${BASE}/images/photo.webp">
<script type="application/ld+json">${schemaJson(meta)}</script>`;

  html = html.replace(/<meta name="description"[^>]*>/i, (m) => m + seoBlock);

  html = html.replace(
    /span\[data-i18n\][\s\S]*?html\[data-lang="nl"\][^\n]+\n/,
    ''
  );

  html = html.replace(
    /<div class="logo">[\s\S]*?<\/div>/,
    `<div class="logo" aria-label="${meta.logoAria}">${meta.logo}</div>`
  );

  html = html.replace(
    /<div class="lang-toggle"[\s\S]*?<\/div>/,
    `<nav class="lang-toggle" aria-label="Language">
    <a href="${meta.canonical}" class="active" hreflang="${meta.lang}" lang="${meta.lang}">${lang.toUpperCase()}</a>
    <a href="${meta.otherLang.href}" hreflang="${meta.otherLang.code}" lang="${meta.otherLang.code}">${meta.otherLang.label}</a>
  </nav>`
  );

  html = html.replace(
    /\.lang-toggle button\{[\s\S]*?\}\s*\.lang-toggle button\.active\{[\s\S]*?\}/,
    `.lang-toggle{display:flex;gap:8px;}
  .lang-toggle a{
    font-family:var(--sans);font-size:12px;font-weight:600;letter-spacing:0.08em;
    padding:6px 14px;border:1px solid rgba(255,255,255,0.35);background:transparent;
    color:#FFF;border-radius:0;
    transition:background 0.15s, color 0.15s, border-color 0.15s;
  }
  .lang-toggle a.active,.lang-toggle a:hover{background:#FFF;color:var(--ink);border-color:#FFF;}`
  );

  html = html.replace(
    'alt="A. Gonzalez, independent property consultant in Marbella"',
    `alt="${meta.photoAlt}"`
  );

  html = html.replace(
    /<a class="property-card([^"]*)" href="#" target="_blank" rel="noopener">/g,
    '<a class="property-card$1" href="#contact">'
  );

  html = html.replace(
    /rel="noopener"/g,
    'rel="nofollow noopener noreferrer"'
  );

  const guideHref = lang === 'en' ? '/en/guides/marbella' : '/nl/gidsen/marbella';
  const guideLabel = lang === 'en' ? 'Marbella buying guide' : 'Marbella-koopgids';
  const privacyHref = lang === 'en' ? '/en/privacy' : '/nl/privacy';
  const privacyLabel = lang === 'en' ? 'Privacy' : 'Privacy';
  html = html.replace(
    /&copy; 2026 Marbella Match &middot; A\. Gonzalez/,
    `${meta.footer} &middot; <a href="${guideHref}">${guideLabel}</a> &middot; <a href="${privacyHref}">${privacyLabel}</a>`
  );

  html = html.replace(
    /<script>[\s\S]*?data-set-lang[\s\S]*?<\/script>\s*/,
    ''
  );

  return html;
}

function writeRedirectIndex() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0;url=/en/">
<link rel="canonical" href="https://agg.homes/en/">
<link rel="alternate" hreflang="en" href="https://agg.homes/en/">
<link rel="alternate" hreflang="nl" href="https://agg.homes/nl/">
<link rel="alternate" hreflang="x-default" href="https://agg.homes/en/">
<title>AGG.homes — Redirecting…</title>
<script>location.replace('/en/');</script>
</head>
<body><p><a href="/en/">Continue to AGG.homes</a></p></body>
</html>`;
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
}

function writeRobots() {
  fs.writeFileSync(
    path.join(ROOT, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`
  );
}

function writeSitemap() {
  const pages = [
    {
      loc: `${BASE}/en/`,
      alternates: [
        { hreflang: 'en', href: `${BASE}/en/` },
        { hreflang: 'nl', href: `${BASE}/nl/` },
        { hreflang: 'x-default', href: `${BASE}/en/` },
      ],
      priority: '1.0',
      changefreq: 'monthly',
    },
    {
      loc: `${BASE}/nl/`,
      alternates: [
        { hreflang: 'en', href: `${BASE}/en/` },
        { hreflang: 'nl', href: `${BASE}/nl/` },
        { hreflang: 'x-default', href: `${BASE}/en/` },
      ],
      priority: '1.0',
      changefreq: 'monthly',
    },
    {
      loc: `${BASE}/en/guides/marbella`,
      alternates: [
        { hreflang: 'en', href: `${BASE}/en/guides/marbella` },
        { hreflang: 'nl', href: `${BASE}/nl/gidsen/marbella` },
        { hreflang: 'x-default', href: `${BASE}/en/guides/marbella` },
      ],
      priority: '0.7',
      changefreq: 'monthly',
    },
    {
      loc: `${BASE}/nl/gidsen/marbella`,
      alternates: [
        { hreflang: 'en', href: `${BASE}/en/guides/marbella` },
        { hreflang: 'nl', href: `${BASE}/nl/gidsen/marbella` },
        { hreflang: 'x-default', href: `${BASE}/en/guides/marbella` },
      ],
      priority: '0.7',
      changefreq: 'monthly',
    },
    {
      loc: `${BASE}/en/privacy`,
      alternates: [
        { hreflang: 'en', href: `${BASE}/en/privacy` },
        { hreflang: 'nl', href: `${BASE}/nl/privacy` },
        { hreflang: 'x-default', href: `${BASE}/en/privacy` },
      ],
      priority: '0.3',
      changefreq: 'yearly',
    },
    {
      loc: `${BASE}/nl/privacy`,
      alternates: [
        { hreflang: 'en', href: `${BASE}/en/privacy` },
        { hreflang: 'nl', href: `${BASE}/nl/privacy` },
        { hreflang: 'x-default', href: `${BASE}/en/privacy` },
      ],
      priority: '0.3',
      changefreq: 'yearly',
    },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages
  .map(
    (page) => `  <url>
    <loc>${page.loc}</loc>
${page.alternates
  .map(
    (alt) =>
      `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}"/>`
  )
  .join('\n')}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
}

function writeRedirects() {
  fs.writeFileSync(
    path.join(ROOT, '_redirects'),
    `/ /en/ 301
/en/guides/marbella.html /en/guides/marbella 301
/nl/gidsen/marbella.html /nl/gidsen/marbella 301
/en/privacy.html /en/privacy 301
/nl/privacy.html /nl/privacy 301
`
  );
}

function copyContentPage(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing content source: ${src}`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

if (!fs.existsSync(TEMPLATE)) {
  const legacy = path.join(ROOT, 'index.html');
  if (!fs.existsSync(legacy)) {
    throw new Error('Missing index.template.html — restore bilingual source first.');
  }
  fs.copyFileSync(legacy, TEMPLATE);
  console.log('Saved bilingual source to index.template.html');
}

for (const lang of ['en', 'nl']) {
  const dir = path.join(ROOT, lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), buildPage(lang));
}

copyContentPage(
  path.join(ROOT, 'content', 'guides', 'marbella.en.html'),
  path.join(ROOT, 'en', 'guides', 'marbella.html')
);
copyContentPage(
  path.join(ROOT, 'content', 'guides', 'marbella.nl.html'),
  path.join(ROOT, 'nl', 'gidsen', 'marbella.html')
);
copyContentPage(
  path.join(ROOT, 'content', 'privacy', 'en.html'),
  path.join(ROOT, 'en', 'privacy.html')
);
copyContentPage(
  path.join(ROOT, 'content', 'privacy', 'nl.html'),
  path.join(ROOT, 'nl', 'privacy.html')
);

writeRedirectIndex();
writeRobots();
writeSitemap();
writeRedirects();

console.log('Built /en/, /nl/, guides, robots.txt, sitemap.xml, _redirects');