module.exports = function (eleventyConfig) {
  // Static assets carried straight through to the build output, unchanged.
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/favicon.png");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/manifest.json");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/llms.txt");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/.well-known");
  eleventyConfig.addPassthroughCopy("src/whatsapp.js");
  eleventyConfig.addPassthroughCopy("src/scroll-top.js");
  eleventyConfig.addPassthroughCopy("src/lab/_styles.css");
  eleventyConfig.addPassthroughCopy("src/lab/_utils.js");
  eleventyConfig.addPassthroughCopy("src/lab/_toc.js");
  eleventyConfig.addPassthroughCopy("src/courses/01-requirements-gathering/_progress.js");
  eleventyConfig.addPassthroughCopy("src/courses/_styles.css");
  // Shared runtime + styles + pure calculation modules for the interactive tools.
  eleventyConfig.addPassthroughCopy("src/tools/_tools.css");
  eleventyConfig.addPassthroughCopy("src/tools/_tools.js");
  eleventyConfig.addPassthroughCopy("src/tools/_calc");

  // 0011 is a bespoke one-off "cheatsheet" page (tabbed doc UI, its own JS/CSS)
  // that doesn't fit the standard lab-article template. Mirrored straight from
  // its original location rather than forced into the shared layout.
  // odoo-18-functional-certification-bangladesh.html is a similar one-off
  // (credential/certificate page, different head structure and no nav) that
  // doesn't fit the standard lab-article template either.
  eleventyConfig.addPassthroughCopy({
    "lab/0011-odoo-inventory-valuation-cheatsheet.html": "lab/0011-odoo-inventory-valuation-cheatsheet.html",
    "lab/odoo-18-functional-certification-bangladesh.html": "lab/odoo-18-functional-certification-bangladesh.html",
    "bn/lab/0011-odoo-inventory-valuation-cheatsheet.html": "bn/lab/0011-odoo-inventory-valuation-cheatsheet.html",
    "bn/lab/odoo-18-functional-certification-bangladesh.html": "bn/lab/odoo-18-functional-certification-bangladesh.html",
  });

  // This is a fully author-controlled static site (no user-submitted content is
  // ever rendered through templates), so Nunjucks' default HTML-escaping only
  // corrupts legitimate apostrophes/ampersands/inline-HTML in migrated content.
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: false });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
