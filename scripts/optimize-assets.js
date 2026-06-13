/**
 * Download and optimize images for agg.homes. Run: node scripts/optimize-assets.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'images');
const PROP = path.join(IMG, 'properties');

const ASSETS = [
  {
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1280&q=75',
    out: 'hero.webp',
    width: 1280,
  },
  {
    url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=640&q=75',
    out: 'properties/c1.webp',
    width: 640,
  },
  {
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=640&q=75',
    out: 'properties/c2.webp',
    width: 640,
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=640&q=75',
    out: 'properties/c3.webp',
    width: 640,
  },
  {
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=640&q=75',
    out: 'properties/c4.webp',
    width: 640,
  },
  {
    url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=640&q=75',
    out: 'properties/c5.webp',
    width: 640,
  },
  {
    url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=640&q=75',
    out: 'properties/c6.webp',
    width: 640,
  },
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
  {
    url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3WmX5slCNuHLi8bLeY9MK7whWMhyjYrEP5-SlNxMU.woff2',
    out: 'cormorant-italic.woff2',
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

  for (const asset of ASSETS) {
    const tmp = path.join(IMG, `_tmp_${path.basename(asset.out, '.webp')}`);
    const dest = path.join(IMG, asset.out);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    console.log(`Downloading ${asset.out}…`);
    const buf = await download(asset.url);
    fs.writeFileSync(tmp, buf);
    execSync(
      `npx --yes sharp-cli -i "${tmp}" -o "${dest}" -f webp resize ${asset.width}`,
      { stdio: 'inherit' }
    );
    fs.unlinkSync(tmp);
  }

  const photoSrc = path.join(ROOT, 'photo.png');
  if (fs.existsSync(photoSrc)) {
    console.log('Optimizing photo.webp…');
    execSync(
      `npx --yes sharp-cli -i "${photoSrc}" -o "${path.join(IMG, 'photo.webp')}" -f webp resize 560`,
      { stdio: 'inherit' }
    );
  }

  for (const font of FONTS) {
    const dest = path.join(ROOT, 'fonts', font.out);
    try {
      console.log(`Font ${font.out}…`);
      const buf = await download(font.url);
      fs.writeFileSync(dest, buf);
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