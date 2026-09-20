// Home-page social card (1200x630) with the portrait on the right, so links
// shared on LinkedIn / WhatsApp show a face. Same brand chrome as the cards in
// generate-og-images.js. Written as JPEG (~70 KB) because a photographic PNG
// would blow past the size WhatsApp/LinkedIn comfortably fetch.
//
// Needs the portrait crop from process-people-images.js to exist first.
// Usage: node scripts/generate-home-og.js

const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const PORTRAIT = path.join(ROOT, 'src', 'assets', 'people', 'mehedi-hasan-portrait-800.jpg');
const OUT = path.join(ROOT, 'src', 'assets', 'og-home.jpg');

const W = 1200, H = 630;
const ACCENT = '#1FD9C4';
const PW = 344, PH = 430, PX = 768, PY = 100, R = 24;   // portrait box (4:5)

const lines = ['Odoo Certified', 'Functional Consultant', 'in Bangladesh'];
const fontSize = 52, lineHeight = fontSize * 1.2;
const startY = 330 - (lines.length * lineHeight) / 2 + fontSize * 0.8;
const tspans = lines.map((l, i) => `<tspan x="88" y="${(startY + i * lineHeight).toFixed(1)}">${l}</tspan>`).join('');

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#061628"/><stop offset="100%" stop-color="#0B2545"/>
    </linearGradient>
    <radialGradient id="glow" cx="82%" cy="8%" r="60%">
      <stop offset="0%" stop-color="rgba(31,217,196,0.22)"/><stop offset="100%" stop-color="rgba(31,217,196,0)"/>
    </radialGradient>
    <linearGradient id="brandmark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${ACCENT}"/><stop offset="100%" stop-color="#2E8F82"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <rect x="88" y="64" width="44" height="44" rx="12" fill="url(#brandmark)"/>
  <text x="110" y="93" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#04140B" text-anchor="middle">MH</text>
  <text x="146" y="82" font-family="Arial, sans-serif" font-size="19" font-weight="600" fill="#EDEEF0">Mehedi Hasan</text>
  <text x="146" y="102" font-family="Arial, sans-serif" font-size="12.5" letter-spacing="1.5" fill="#6E7F9C">ERP · BUSINESS ANALYST</text>
  <rect x="88" y="150" width="330" height="34" rx="17" fill="rgba(31,217,196,0.14)" stroke="rgba(31,217,196,0.4)"/>
  <text x="106" y="172" font-family="Arial, sans-serif" font-size="13" letter-spacing="1.2" fill="${ACCENT}">ODOO ERP CONSULTANT · BANGLADESH</text>
  <text font-family="Arial, sans-serif" font-weight="600" font-size="${fontSize}" fill="#F5F7FA">${tspans}</text>
  <text x="88" y="566" font-family="Arial, sans-serif" font-size="15" fill="#6E7F9C">mhasan.me</text>
  <rect x="${PX - 1}" y="${PY - 1}" width="${PW + 2}" height="${PH + 2}" rx="${R + 1}" fill="none" stroke="rgba(31,217,196,0.45)" stroke-width="2"/>
  <text x="${PX}" y="${PY + PH + 34}" font-family="Arial, sans-serif" font-size="15" letter-spacing="1.2" fill="#6E7F9C">DHAKA · ODOO S.A. CERTIFIED</text>
</svg>`;

async function main() {
  const mask = Buffer.from(`<svg width="${PW}" height="${PH}"><rect width="${PW}" height="${PH}" rx="${R}" fill="#fff"/></svg>`);
  const photo = await sharp(PORTRAIT)
    .resize(PW, PH, { fit: 'cover' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const info = await sharp(Buffer.from(svg))
    .composite([{ input: photo, left: PX, top: PY }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(OUT);
  console.log(`og-home.jpg ${(info.size / 1024).toFixed(0)} KB (${info.width}x${info.height})`);
}

main().catch(e => { console.error(e); process.exit(1); });
