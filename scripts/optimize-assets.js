/**
 * Download and optimize images for agg.homes. Run: node scripts/optimize-assets.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'images');
const PROP = path.join(IMG, 'properties');

const PROP_W = 880;
const PROP_H = 660;
const PHOTO_W = 560;
const PHOTO_H = 560;

function sharpResize(inPath, outPath, format, width, height, quality) {
  const size = height ? `resize ${width} ${height}` : `resize ${width}`;
  const q = quality ? ` -q ${quality}` : '';
  execSync(
    `npx --yes sharp-cli -i "${inPath}" -o "${outPath}" -f ${format} ${size}${q}`,
    { stdio: 'inherit' }
  );
}

const HERO = {
  url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1280&q=75',
  tmp: path.join(IMG, '_tmp_hero'),
};

const PROPERTIES = [
  ['c1', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1760&q=75'],
  ['c2', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1760&q=75'],
  ['c3', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1760&q=75'],
  ['c4', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1760&q=75'],
  ['c5', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1760&q=75'],
  ['c6', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1760&q=75'],
];

const FONTS = [
  {
    url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
    out: 'inter-latin.woff2',
  },
  {
    url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtKky2F7g.woff2',
    out: 'cormorant-600.woff2',
  },
];

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function run() {
  fs.mkdirSync(PROP, { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'fonts'), { recursive: true });

  console.log('Hero images…');
  fs.writeFileSync(HERO.tmp, await download(HERO.url));
  sharpResize(HERO.tmp, path.join(IMG, 'hero-800.webp'), 'webp', 800, null, 58);
  sharpResize(HERO.tmp, path.join(IMG, 'hero-1280.webp'), 'webp', 1280, null, 64);
  fs.copyFileSync(path.join(IMG, 'hero-1280.webp'), path.join(IMG, 'hero.webp'));
  fs.unlinkSync(HERO.tmp);

  for (const [id, url] of PROPERTIES) {
    const tmp = path.join(PROP, `_tmp_${id}`);
    const dest = path.join(PROP, `${id}.webp`);
    console.log(`Property ${id} (${PROP_W}x${PROP_H})…`);
    fs.writeFileSync(tmp, await download(url));
    sharpResize(tmp, dest, 'webp', PROP_W, PROP_H);
    fs.unlinkSync(tmp);
  }

  const photoSrc = path.join(ROOT, 'photo.png');
  if (fs.existsSync(photoSrc)) {
    console.log(`Agent photo (${PHOTO_W}x${PHOTO_H})…`);
    sharpResize(photoSrc, path.join(IMG, 'photo.webp'), 'webp', PHOTO_W, PHOTO_H);
    sharpResize(photoSrc, path.join(IMG, 'photo.jpg'), 'jpeg', PHOTO_W, PHOTO_H);
  }

  for (const font of FONTS) {
    const dest = path.join(ROOT, 'fonts', font.out);
    try {
      console.log(`Font ${font.out}…`);
      fs.writeFileSync(dest, await download(font.url));
    } catch (err) {
      console.warn(`Skipping ${font.out}: ${err.message}`);
    }
  }

  console.log('Assets optimized.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});