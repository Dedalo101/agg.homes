/**
 * Build /en/ and /nl/ indexable pages from the bilingual source template.
 * Run: node scripts/build-lang-pages.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'index.template.html');
const BASE = 'https://agg.homes';
const DEFAULT_LANG = 'nl';
const X_DEFAULT = `${BASE}/nl/`;

const BRAND_HEAD = `<link rel="icon" type="image/png" href="/favicon-96x96.png?v=20260617" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=20260617" />
<link rel="shortcut icon" href="/favicon.ico?v=20260617" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20260617" />
<meta name="apple-mobile-web-app-title" content="Agg.homes" />
<link rel="manifest" href="/site.webmanifest?v=20260617" />
<meta name="theme-color" content="#0a1a0f">`;

const OG_IMAGE_META = `<meta property="og:image" content="${BASE}/images/og-social.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:alt" content="AGG.homes — Costa del Sol property introductions by A. Gonzalez">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${BASE}/images/og-social.jpg">`;

const META = {
  en: {
    lang: 'en',
    title: 'A. Gonzalez · agg.homes — Costa del Sol property introductions',
    description:
      'A. Gonzalez introduces Dutch and international buyers to trusted Marbella, Nueva Andalucía, Estepona and Benahávis agents. Personal, free introductions via agg.homes.',
    canonical: `${BASE}/en/`,
    logo: 'AGG<em>.homes</em>',
    logoAria: 'AGG.homes',
    footer: '© 2026 AGG.homes · A. Gonzalez · Johannes Boersma',
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
    title:
      'Woning kopen Marbella & Costa del Sol | Nieuwbouw & off-market | AGG.homes',
    description:
      'Woning kopen in Marbella, Estepona of Benahávis? Nederlandse begeleiding bij nieuwbouw, off-market villa\'s en exclusief vastgoed. Gratis introductie bij de juiste makelaar — sinds 2011.',
    keywords:
      'woning kopen Marbella, woning kopen Spanje, Costa del Sol vastgoed, nieuwbouw Marbella, villa kopen Marbella, off-market woningen, tweede woning Spanje, appartement kopen Costa del Sol, vastgoed belegging Spanje, kosten koper Spanje',
    canonical: `${BASE}/nl/`,
    logo: 'AGG<em>.homes</em>',
    logoAria: 'AGG.homes',
    footer: '© 2026 AGG.homes · A. Gonzalez · Johannes Boersma',
    photoAlt:
      'A. Gonzalez, Nederlands sprekend woonadviseur voor woning kopen in Marbella en Costa del Sol',
    otherLang: { href: '/en/', label: 'EN', code: 'en' },
    schemaDesc:
      'Nederlands sprekend woonadviseur voor woning kopen aan de Costa del Sol: nieuwbouw Marbella, off-market villa\'s, appartementen en exclusief vastgoed voor Nederlandse kopers.',
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
      {
        q: 'Waar vind ik nieuwbouw in Marbella en Estepona?',
        a: 'Via ons netwerk heeft u toegang tot nieuwbouwprojecten en recent opgeleverde woningen in Marbella, Estepona, Nueva Andalucía en Benahávis — vaak vóór publicatie op grote portals.',
      },
      {
        q: 'Wat zijn off-market woningen aan de Costa del Sol?',
        a: 'Off-market woningen (verborgen aanbod) zijn villa\'s en appartementen die niet op openbare websites staan. Partnermakelaars delen deze exclusieve objecten met serieuze kopers via hun netwerk.',
      },
      {
        q: 'Wat kost woning kopen in Spanje voor Nederlanders?',
        a: 'Reken op 10–13% boven de koopprijs aan kosten koper: overdrachtsbelasting, notaris, advocaat en eventuele hypotheekkosten. Wij koppelen u aan een makelaar die uw budget en fiscaliteit begrijpt.',
      },
      {
        q: 'Kan ik als Nederlander een hypotheek krijgen voor een woning in Spanje?',
        a: 'Ja. Spaanse banken verstrekken hypotheken aan niet-ingezetenen, meestal tot 60–70% van de waarde. Onze partners begeleiden u bij de voorbereiding, inclusief NIE-nummer en taxatie.',
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
          knowsLanguage: ['en', 'es'],
          parentOrganization: { '@id': `${meta.canonical}#org` },
        },
        {
          '@type': ['Organization', 'LocalBusiness'],
          '@id': `${meta.canonical}#org`,
          name: 'AGG.homes',
          url: BASE,
          employee: [
            { '@type': 'Person', name: 'A. Gonzalez', jobTitle: 'Property consultant', knowsLanguage: ['en', 'es'] },
            { '@type': 'Person', name: 'Johannes Boersma', jobTitle: 'Property consultant', knowsLanguage: ['nl', 'en', 'es'] },
          ],
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

  const keywordsTag = meta.keywords
    ? `\n<meta name="keywords" content="${meta.keywords}">`
    : '';
  const localeTag =
    meta.lang === 'nl'
      ? `\n<meta property="og:locale" content="nl_NL">\n<meta property="og:locale:alternate" content="en_GB">`
      : `\n<meta property="og:locale" content="en_GB">\n<meta property="og:locale:alternate" content="nl_NL">`;

  const seoBlock = `
<link rel="canonical" href="${meta.canonical}">
<link rel="alternate" hreflang="nl" href="${BASE}/nl/">
<link rel="alternate" hreflang="en" href="${BASE}/en/">
<link rel="alternate" hreflang="x-default" href="${X_DEFAULT}">${keywordsTag}${localeTag}
<meta property="og:type" content="website">
<meta property="og:url" content="${meta.canonical}">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
${OG_IMAGE_META}
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

  const nlLink =
    meta.lang === 'nl'
      ? `<a href="${BASE}/nl/" class="active" hreflang="nl" lang="nl">NL</a>`
      : `<a href="${BASE}/nl/" hreflang="nl" lang="nl">NL</a>`;
  const enLink =
    meta.lang === 'en'
      ? `<a href="${BASE}/en/" class="active" hreflang="en" lang="en">EN</a>`
      : `<a href="${BASE}/en/" hreflang="en" lang="en">EN</a>`;
  html = html.replace(
    /<div class="lang-toggle"[\s\S]*?<\/div>/,
    `<nav class="lang-toggle" aria-label="Language">
    ${nlLink}
    ${enLink}
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
  const privacyHref = lang === 'en' ? '/en/privacy/' : '/nl/privacy/';
  const privacyLabel = lang === 'en' ? 'Privacy' : 'Privacy';
  html = html.replace(
    /&copy; 2026 Marbella Match &middot; A\. Gonzalez/,
    `${meta.footer} &middot; <a href="${guideHref}">${guideLabel}</a> &middot; <a href="${privacyHref}">${privacyLabel}</a>`
  );

  html = html.replace(
    /<script>[\s\S]*?data-set-lang[\s\S]*?<\/script>\s*/,
    ''
  );

  if (lang === 'en') {
    const waEn = encodeURIComponent(
      "Hi A. Gonzalez, I'm interested in a property on the Costa del Sol."
    );
    html = html.replace(
      /href="https:\/\/wa\.me\/31617622375\?text=[^"]*"/,
      `href="https://wa.me/31617622375?text=${waEn}"`
    );
  }

  return html;
}

function writeRedirectIndex() {
  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
${BRAND_HEAD}
<meta http-equiv="refresh" content="0;url=/nl/">
<link rel="canonical" href="${X_DEFAULT}">
<link rel="alternate" hreflang="nl" href="${BASE}/nl/">
<link rel="alternate" hreflang="en" href="${BASE}/en/">
<link rel="alternate" hreflang="x-default" href="${X_DEFAULT}">
<title>AGG.homes — Doorverwijzen…</title>
<script>location.replace('/nl/');</script>
</head>
<body><p><a href="/nl/">Ga verder naar AGG.homes</a></p></body>
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
  const homeAlternates = [
    { hreflang: 'nl', href: `${BASE}/nl/` },
    { hreflang: 'en', href: `${BASE}/en/` },
    { hreflang: 'x-default', href: X_DEFAULT },
  ];
  const guideAlternates = [
    { hreflang: 'nl', href: `${BASE}/nl/gidsen/marbella` },
    { hreflang: 'en', href: `${BASE}/en/guides/marbella` },
    { hreflang: 'x-default', href: `${BASE}/nl/gidsen/marbella` },
  ];
  const privacyAlternates = [
    { hreflang: 'nl', href: `${BASE}/nl/privacy/` },
    { hreflang: 'en', href: `${BASE}/en/privacy/` },
    { hreflang: 'x-default', href: `${BASE}/nl/privacy/` },
  ];
  const pages = [
    {
      loc: `${BASE}/nl/`,
      alternates: homeAlternates,
      priority: '1.0',
      changefreq: 'weekly',
    },
    {
      loc: `${BASE}/en/`,
      alternates: homeAlternates,
      priority: '0.8',
      changefreq: 'monthly',
    },
    {
      loc: `${BASE}/nl/gidsen/marbella`,
      alternates: guideAlternates,
      priority: '0.9',
      changefreq: 'weekly',
    },
    {
      loc: `${BASE}/en/guides/marbella`,
      alternates: guideAlternates,
      priority: '0.7',
      changefreq: 'monthly',
    },
    {
      loc: `${BASE}/nl/privacy/`,
      alternates: privacyAlternates,
      priority: '0.3',
      changefreq: 'yearly',
    },
    {
      loc: `${BASE}/en/privacy/`,
      alternates: privacyAlternates,
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
    `/ /nl/ 301
/en/guides/marbella.html /en/guides/marbella 301
/nl/gidsen/marbella.html /nl/gidsen/marbella 301
/en/privacy.html /en/privacy/ 301
/nl/privacy.html /nl/privacy/ 301
/en/privacy /en/privacy/ 301
/nl/privacy /nl/privacy/ 301
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
  path.join(ROOT, 'content', 'privacy', 'en', 'index.html'),
  path.join(ROOT, 'en', 'privacy', 'index.html')
);
copyContentPage(
  path.join(ROOT, 'content', 'privacy', 'nl', 'index.html'),
  path.join(ROOT, 'nl', 'privacy', 'index.html')
);

for (const legacy of [
  path.join(ROOT, 'en', 'privacy.html'),
  path.join(ROOT, 'nl', 'privacy.html'),
]) {
  if (fs.existsSync(legacy)) fs.unlinkSync(legacy);
}

writeRedirectIndex();
writeRobots();
writeSitemap();
writeRedirects();

console.log('Built /en/, /nl/, guides, robots.txt, sitemap.xml, _redirects');