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

const { W, H, esc, wrapText, buildSvg } = require('./lib/og-card');

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
