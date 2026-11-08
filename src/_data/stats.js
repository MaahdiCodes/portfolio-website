// Site-wide counts computed at build time, so copy like "Browse all N articles"
// never goes stale. Lab articles = numbered files in src/lab plus the hand-written
// pages in src/_static/lab (0011 cheatsheet, certification page).
const fs = require("fs");
const path = require("path");

const count = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.html$/.test(f) && f !== "index.html").length : 0;

module.exports = () => {
  const src = path.join(__dirname, "..");
  const numbered = fs.readdirSync(path.join(src, "lab")).filter((f) => /^\d{4}-.*\.html$/.test(f)).length;
  return { labArticles: numbered + count(path.join(src, "_static", "lab")) };
};
