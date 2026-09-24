// Build-time image prep for testimonial/recommender avatars, mirroring
// process-people-images.js conventions. LinkedIn profile photo exports are
// already square, so no cropping is needed — just resize/compress/strip EXIF.
//
// Usage: node scripts/process-testimonial-avatars.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'assets', 'people');

const SOURCES = {
  'jony-ghosh': 'C:/Users/shuvo/OneDrive/Documents/Linkedin Recommendation/Jony.jfif',
  'md-kamrul-hassan': 'C:/Users/shuvo/OneDrive/Documents/Linkedin Recommendation/Kamrul.jfif',
  'md-iqram-hossain-rabbi': 'C:/Users/shuvo/OneDrive/Documents/Linkedin Recommendation/Iqram.jfif',
};

const fmt = {
  webp: { quality: 78, effort: 6 },
  jpg: { quality: 80, mozjpeg: true },
};

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const log = [];
  for (const [slug, src] of Object.entries(SOURCES)) {
    const base = sharp(src).rotate();
    for (const f of ['webp', 'jpg']) {
      const file = `${slug}-avatar-160.${f}`;
      const p = base.clone().resize({ width: 160, height: 160, fit: 'cover' });
      if (f === 'webp') p.webp(fmt.webp);
      if (f === 'jpg') p.jpeg(fmt.jpg);
      const info = await p.toFile(path.join(OUT, file));
      log.push(`${file} ${(info.size / 1024).toFixed(0)} KB (${info.width}x${info.height})`);
    }
  }
  console.log(log.join('\n'));
}

main().catch(e => { console.error(e); process.exit(1); });
