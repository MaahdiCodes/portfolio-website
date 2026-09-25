// Generate missing OG images for pages built by Eleventy.
// Scans _site/**/*.html (English pages only — Bangla pages reuse the English
// card), finds og:image URLs under https://mhasan.me/assets/og/ whose PNG does
// not exist yet in src/assets/og/, and renders one from the page's <title> and
// eyebrow. Existing images are never overwritten unless --force is passed.
//
// Usage: npm run build && node scripts/generate-og-new.js [--force]
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { buildSvg } = require('./lib/og-card');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, '_site');
const OG_SRC = path.join(ROOT, 'src', 'assets', 'og');
const FORCE = process.argv.includes('--force');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'bn' && e.name !== 'assets') walk(p, out); }
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');

(async () => {
  let made = 0;
  for (const file of walk(SITE)) {
    const html = fs.readFileSync(file, 'utf8');
    const m = html.match(/<meta property="og:image" content="https:\/\/mhasan\.me\/assets\/og\/([^"]+\.png)"/);
    if (!m) continue;
    const out = path.join(OG_SRC, m[1]);
    if (fs.existsSync(out) && !FORCE) continue;
    const t = html.match(/<meta property="og:title" content="([^"]*)"/) || html.match(/<title>([^<]*)<\/title>/);
    const title = decode(t[1]).split('|')[0].trim();
    const eb = html.match(/<span class="eyebrow">([^<]*)<\/span>/);
    const badge = eb ? decode(eb[1]).split('·').slice(0, 2).join('·').trim() : 'MHASAN.ME';
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await sharp(Buffer.from(buildSvg({ title, badge }))).png().toFile(out);
    console.log('og:', path.relative(ROOT, out), '←', title);
    made++;
  }
  console.log(made ? `${made} image(s) generated — rebuild to copy them into _site.` : 'No missing OG images.');
})();
