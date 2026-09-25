// Shared 1200x630 OG card renderer (used by generate-og-images.js and generate-og-new.js).
const W = 1200, H = 630;
const ACCENT = '#1FD9C4';
const ACCENT_DIM = 'rgba(31,217,196,0.14)';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Simple greedy word-wrap based on an average-character-width heuristic.
function wrapText(text, maxCharsPerLine, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    // Only start a new line if we haven't already reached the last allowed
    // line — once there, keep absorbing words into it rather than dropping them.
    if (next.length > maxCharsPerLine && cur && lines.length < maxLines - 1) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/[.,;:\s]*$/, '') + '…';
  }
  return lines;
}

function buildSvg({ title, badge }) {
  // Pick font size based on title length so long titles still fit.
  let fontSize = 56, maxChars = 22, maxLines = 3;
  if (title.length > 70) { fontSize = 44; maxChars = 28; maxLines = 3; }
  if (title.length > 100) { fontSize = 38; maxChars = 34; maxLines = 4; }
  const lines = wrapText(title, maxChars, maxLines);
  const lineHeight = fontSize * 1.22;
  const blockHeight = lines.length * lineHeight;
  const startY = 330 - blockHeight / 2 + fontSize * 0.8;

  const titleTspans = lines.map((l, i) =>
    `<tspan x="88" y="${(startY + i * lineHeight).toFixed(1)}">${esc(l)}</tspan>`
  ).join('');

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#061628"/>
      <stop offset="100%" stop-color="#0B2545"/>
    </linearGradient>
    <radialGradient id="glow" cx="82%" cy="8%" r="60%">
      <stop offset="0%" stop-color="rgba(31,217,196,0.22)"/>
      <stop offset="100%" stop-color="rgba(31,217,196,0)"/>
    </radialGradient>
    <linearGradient id="brandmark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${ACCENT}"/>
      <stop offset="100%" stop-color="#2E8F82"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>

  <!-- brand -->
  <rect x="88" y="64" width="44" height="44" rx="12" fill="url(#brandmark)"/>
  <text x="110" y="93" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#04140B" text-anchor="middle">MH</text>
  <text x="146" y="82" font-family="Arial, sans-serif" font-size="19" font-weight="600" fill="#EDEEF0">Mehedi Hasan</text>
  <text x="146" y="102" font-family="Arial, sans-serif" font-size="12.5" letter-spacing="1.5" fill="#6E7F9C">ERP · BUSINESS ANALYST</text>

  <!-- badge -->
  ${badge ? `<rect x="88" y="150" width="${Math.min(560, 24 + badge.length * 9.5)}" height="34" rx="17" fill="${ACCENT_DIM}" stroke="rgba(31,217,196,0.4)"/>
  <text x="106" y="172" font-family="Arial, sans-serif" font-size="13" letter-spacing="1.2" fill="${ACCENT}">${esc(badge.toUpperCase())}</text>` : ''}

  <!-- title -->
  <text font-family="Arial, sans-serif" font-weight="600" font-size="${fontSize}" fill="#F5F7FA">${titleTspans}</text>

  <!-- footer -->
  <text x="88" y="566" font-family="Arial, sans-serif" font-size="15" fill="#6E7F9C">mhasan.me</text>
  <text x="1112" y="566" font-family="Arial, sans-serif" font-size="15" fill="#6E7F9C" text-anchor="end">Odoo ERP Consultant · Bangladesh</text>
</svg>`;
}


module.exports = { W, H, esc, wrapText, buildSvg };
