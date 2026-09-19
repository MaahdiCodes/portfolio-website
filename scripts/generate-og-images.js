// Build-time OG image generator. Reads each HTML page's <title> / eyebrow,
// renders a branded 1200x630 SVG card, rasterizes it with sharp, and rewrites
// the page's og:image / twitter:image meta tags to point at the new file.
//
// Usage: node scripts/generate-og-images.js [--dry-run] [--limit N]

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'og');
const DRY_RUN = process.argv.includes('--dry-run');
const limitArg = process.argv.find(a => a.startsWith('--limit'));
const LIMIT = limitArg ? parseInt(process.argv[process.argv.indexOf(limitArg) + 1] || limitArg.split('=')[1], 10) : Infinity;

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

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  if (!m) return null;
  return m[1].split('|')[0].trim();
}

function extractBadge(html, fallback, useEyebrow) {
  if (useEyebrow) {
    const m = html.match(/<span class="eyebrow">([^<]*)<\/span>/i);
    if (m) return m[1].trim();
  }
  return fallback;
}

async function processFile(file, fallbackBadge, ogDir, ogUrlPrefix, slug, useEyebrow) {
  const html = fs.readFileSync(file, 'utf-8');
  if (!html.includes('og:image')) return { file, skipped: 'no og:image tag' };
  const title = extractTitle(html);
  if (!title) return { file, skipped: 'no <title>' };
  const badge = extractBadge(html, fallbackBadge, useEyebrow);

  const outName = slug + '.png';
  const outPath = path.join(ogDir, outName);
  const ogUrl = `https://mhasan.me${ogUrlPrefix}${outName}`;

  if (!DRY_RUN) {
    fs.mkdirSync(ogDir, { recursive: true });
    const svg = buildSvg({ title, badge });
    await sharp(Buffer.from(svg)).png().toFile(outPath);

    let updated = html.replace(
      /<meta property="og:image" content="[^"]*"\s*\/>/,
      `<meta property="og:image" content="${ogUrl}" />`
    );
    updated = updated.replace(
      /<meta name="twitter:image" content="[^"]*"\s*\/>/,
      `<meta name="twitter:image" content="${ogUrl}" />`
    );
    if (updated !== html) fs.writeFileSync(file, updated, 'utf-8');
  }

  return { file, title, badge, outPath, ogUrl };
}

async function main() {
  const jobs = [];

  // Lab articles — single .eyebrow per page (e.g. "Technical Lab · 0001"), safe to sniff.
  const labDir = path.join(ROOT, 'lab');
  for (const f of fs.readdirSync(labDir)) {
    if (f.endsWith('.html')) {
      jobs.push({ file: path.join(labDir, f), fallback: 'TECHNICAL LAB', ogDir: path.join(OUT_DIR, 'lab'), prefix: '/assets/og/lab/', slug: path.basename(f, '.html'), useEyebrow: true });
    }
  }
  // Services
  for (const d of ['manufacturing-erp-consultant', 'odoo-partner-consultant']) {
    jobs.push({ file: path.join(ROOT, 'services', d, 'index.html'), fallback: 'SERVICE', ogDir: path.join(OUT_DIR, 'services'), prefix: '/assets/og/services/', slug: d, useEyebrow: true });
  }
  // Tools
  jobs.push({ file: path.join(ROOT, 'tools', 'odoo-cost-estimator', 'index.html'), fallback: 'FREE TOOL', ogDir: path.join(OUT_DIR, 'tools'), prefix: '/assets/og/tools/', slug: 'odoo-cost-estimator', useEyebrow: false });
  // Courses
  jobs.push({ file: path.join(ROOT, 'courses', '01-requirements-gathering', 'index.html'), fallback: 'COURSE', ogDir: path.join(OUT_DIR, 'courses'), prefix: '/assets/og/courses/', slug: '01-requirements-gathering', useEyebrow: false });
  for (const f of fs.readdirSync(path.join(ROOT, 'courses', '01-requirements-gathering'))) {
    if (/^lesson-\d+\.html$/.test(f)) {
      jobs.push({ file: path.join(ROOT, 'courses', '01-requirements-gathering', f), fallback: 'COURSE LESSON', ogDir: path.join(OUT_DIR, 'courses'), prefix: '/assets/og/courses/', slug: path.basename(f, '.html'), useEyebrow: false });
    }
  }
  // Standalone pages
  for (const [dir, fallback] of [['resources', 'RESOURCES'], ['start-here', 'START HERE'], ['testimonials', 'TESTIMONIALS']]) {
    jobs.push({ file: path.join(ROOT, dir, 'index.html'), fallback, ogDir: path.join(OUT_DIR, dir), prefix: `/assets/og/${dir}/`, slug: dir, useEyebrow: false });
  }
  // Homepage
  jobs.push({ file: path.join(ROOT, 'index.html'), fallback: 'ODOO ERP CONSULTANT · BANGLADESH', ogDir: OUT_DIR, prefix: '/assets/og/', slug: 'home', useEyebrow: false });

  const results = [];
  let n = 0;
  for (const j of jobs) {
    if (n >= LIMIT) break;
    if (!fs.existsSync(j.file)) { results.push({ file: j.file, skipped: 'MISSING FILE' }); continue; }
    const r = await processFile(j.file, j.fallback, j.ogDir, j.prefix, j.slug, j.useEyebrow);
    results.push(r);
    n++;
  }

  const ok = results.filter(r => !r.skipped);
  const skipped = results.filter(r => r.skipped);
  console.log(`Processed: ${ok.length}, Skipped: ${skipped.length}, Total jobs: ${jobs.length}`);
  if (skipped.length) console.log('SKIPPED:\n' + skipped.map(r => `  ${r.file} :: ${r.skipped}`).join('\n'));
  if (DRY_RUN) console.log('\n(dry run — no files written)');
}

main().catch(e => { console.error(e); process.exit(1); });
