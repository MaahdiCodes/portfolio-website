// Build-time image prep for the personal photos (hero portrait, byline avatar,
// training photo). Crops, resizes, compresses and writes AVIF/WebP/JPEG into
// src/assets/people/. sharp drops all EXIF (incl. GPS) by default, so nothing
// from the camera original is carried into the site.
//
// Usage: node scripts/process-people-images.js <portrait-source> <training-source> [--preview <dir>]

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'assets', 'people');
const [portraitSrc, trainingSrc] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const previewIdx = process.argv.indexOf('--preview');
const PREVIEW_DIR = previewIdx > -1 ? process.argv[previewIdx + 1] : null;

if (!portraitSrc || !trainingSrc) {
  console.error('Usage: node scripts/process-people-images.js <portrait> <training> [--preview <dir>]');
  process.exit(1);
}

// Crop boxes are in the original 3072x4080 portrait's pixel space.
const PORTRAIT_CROP = { left: 612, top: 510, width: 2040, height: 2550 };  // 4:5, head + shoulders
const AVATAR_CROP = { left: 970, top: 610, width: 1440, height: 1440 };   // 1:1 around the face

const fmt = {
  avif: { quality: 50, effort: 6 },
  webp: { quality: 78, effort: 6 },
  jpg: { quality: 80, mozjpeg: true },
};

async function emit(pipeline, base, width, formats) {
  const out = [];
  for (const f of formats) {
    const file = `${base}-${width}.${f}`;
    const p = pipeline.clone().resize({ width, withoutEnlargement: true });
    if (f === 'avif') p.avif(fmt.avif);
    if (f === 'webp') p.webp(fmt.webp);
    if (f === 'jpg') p.jpeg(fmt.jpg);
    const info = await p.toFile(path.join(OUT, file));
    out.push(`${file} ${(info.size / 1024).toFixed(0)} KB (${info.width}x${info.height})`);
  }
  return out;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const log = [];

  // rotate() bakes in the EXIF orientation before the metadata is dropped.
  const portrait = sharp(portraitSrc).rotate().extract(PORTRAIT_CROP);
  const portraitBuf = await portrait.toBuffer();
  for (const w of [480, 800]) {
    log.push(...await emit(sharp(portraitBuf), 'mehedi-hasan-portrait', w, ['avif', 'webp', 'jpg']));
  }

  const avatar = sharp(await sharp(portraitSrc).rotate().extract(AVATAR_CROP).toBuffer());
  log.push(...await emit(avatar, 'mehedi-hasan-avatar', 160, ['webp', 'jpg']));

  const training = sharp(trainingSrc);
  for (const w of [720, 1200]) {
    log.push(...await emit(training, 'odoo-user-training', w, ['avif', 'webp', 'jpg']));
  }

  console.log(log.join('\n'));

  if (PREVIEW_DIR) {
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });
    await sharp(portraitBuf).resize({ width: 600 }).jpeg({ quality: 70 }).toFile(path.join(PREVIEW_DIR, 'portrait.jpg'));
    await avatar.clone().resize({ width: 300 }).jpeg({ quality: 70 }).toFile(path.join(PREVIEW_DIR, 'avatar.jpg'));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
