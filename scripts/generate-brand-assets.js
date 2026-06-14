/**
 * Export favicon PNGs and og-social.jpg from SVG sources.
 * Run: node scripts/generate-brand-assets.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');

async function exportPng(svgPath, outPath, size) {
  await sharp(svgPath).resize(size, size).png().toFile(outPath);
  console.log(`Wrote ${path.relative(ROOT, outPath)} (${size}x${size})`);
}

async function exportOgJpg() {
  const svg = path.join(ROOT, 'images', 'og-social.svg');
  const jpg = path.join(ROOT, 'images', 'og-social.jpg');
  await sharp(svg).resize(1200, 630).jpeg({ quality: 90 }).toFile(jpg);
  console.log(`Wrote ${path.relative(ROOT, jpg)} (1200x630)`);
}

async function main() {
  const favicon = path.join(ROOT, 'favicon.svg');
  await exportPng(favicon, path.join(ROOT, 'favicon-32.png'), 32);
  await exportPng(favicon, path.join(ROOT, 'favicon-180.png'), 180);
  await exportPng(favicon, path.join(ROOT, 'favicon-192.png'), 192);
  await exportPng(favicon, path.join(ROOT, 'favicon-512.png'), 512);
  await exportOgJpg();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});