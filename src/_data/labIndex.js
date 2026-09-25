// Build-time index of every Lab article (EN + BN): slug, title, description.
// Used by the industry hubs (to print real article titles) and the Lab search index.
const fs = require("fs");
const path = require("path");

function readDir(dir) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    if (!/^\d{4}-.*\.html$/.test(f)) continue;
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    const fm = src.split(/^---\s*$/m)[1] || "";
    const get = (k) => {
      const m = fm.match(new RegExp("^" + k + ':\\s*"((?:[^"\\\\]|\\\\.)*)"', "m")) || fm.match(new RegExp("^" + k + ":\\s*'([^']*)'", "m"));
      return m ? m[1].replace(/\\"/g, '"') : "";
    };
    const slug = f.replace(/\.html$/, "");
    const title = (get("h1") || get("ogTitle") || get("title")).replace(/<[^>]+>/g, "").replace(/\s*\|\s*Mehedi Hasan.*$/, "").trim().replace(/[.।]$/, "");
    // Strip tags from the body for the search index (kept short).
    const body = src.split(/^---\s*$/m).slice(2).join("---")
      .replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
    const headings = [...src.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").trim()).slice(0, 14);
    out[slug] = {
      slug, num: slug.slice(0, 4), title,
      seoTitle: get("title").replace(/\s*\|\s*Mehedi Hasan.*$/, ""),
      description: get("description"),
      headings, text: body.slice(0, 2500)
    };
  }
  return out;
}

module.exports = () => {
  const root = path.join(__dirname, "..");
  return { en: readDir(path.join(root, "lab")), bn: readDir(path.join(root, "bn", "lab")) };
};
