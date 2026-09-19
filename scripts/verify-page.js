const fs = require('fs');
const path = require('path');
const { diffPages } = require('./lib/verify-html');

// Standalone pages verified so far that have a documented, deliberately
// accepted diff count -- same idea as KNOWN_ACCEPTABLE_FILES in
// verify-lab-migration.js. Keyed by original file path.
const KNOWN_ACCEPTABLE = {
  // bn/index.html's font <link> predates Noto Sans Bengali being added to
  // the site's font stack (every bn/lab/* article already has it) -- the
  // shared template adds the complete, correct stack uniformly.
  'bn/index.html': 2,
  // Both testimonials pages predate twitter:title/twitter:description being
  // added -- the shared template fills them in from the page's own
  // title/description, which is correct, just page-specific text that can't
  // be a generic allowlist pattern.
  'testimonials/index.html': 2,
  'bn/testimonials/index.html': 2,
};

const [origPath, newPath] = process.argv.slice(2);
if (!origPath || !newPath) {
  console.error('Usage: node scripts/verify-page.js <original.html> <generated.html>');
  process.exit(2);
}
if (!fs.existsSync(newPath)) {
  console.log('MISSING BUILD OUTPUT:', newPath);
  process.exit(1);
}
const problems = diffPages(fs.readFileSync(origPath, 'utf-8'), fs.readFileSync(newPath, 'utf-8'));
const key = origPath.replace(/\\/g, '/');
if (problems.length && problems.length === KNOWN_ACCEPTABLE[key]) {
  console.log('OK (known-acceptable):', origPath, 'vs', newPath);
  process.exit(0);
}
if (!problems.length) {
  console.log('ALL GOOD:', origPath, 'vs', newPath);
  process.exit(0);
}
console.log(`DIFF (${problems.length} issue${problems.length > 1 ? 's' : ''}):`, origPath, 'vs', newPath);
for (const u of problems) {
  console.log('  - ' + u.removed);
  console.log('  + ' + u.added);
}
process.exit(1);
