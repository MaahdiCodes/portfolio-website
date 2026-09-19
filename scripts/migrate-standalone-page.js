// Mechanical extraction for one-off pages (homepage, services, courses, tool,
// testimonials, resources, start-here) that don't share the lab-article
// family structure. Extracts <head> meta into front matter (same fields as
// migrate-lab-article.js) but keeps the entire <body> as one verbatim blob --
// no decomposition, since there's no repetition to justify it for a single
// unique page. Output must still be verified against the original.
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const inFile = process.argv[2];
const outFile = process.argv[3];
const extraOpts = JSON.parse(process.argv[4] || '{}'); // { permalink, layout, lang, bareBody }

function yamlStr(s) {
  if (s == null) return '""';
  return JSON.stringify(s);
}
function textOf($, sel) {
  const el = $(sel).first();
  return el.length ? el.text().trim() : null;
}
function attrOf($, sel, attr) {
  const el = $(sel).first();
  return el.length ? el.attr(attr) : null;
}

const html = fs.readFileSync(inFile, 'utf-8').replace(/^﻿/, '');
const $ = cheerio.load(html, { decodeEntities: false });

const title = textOf($, 'title');
const description = attrOf($, 'meta[name="description"]', 'content');
const robots = attrOf($, 'meta[name="robots"]', 'content');
const canonical = attrOf($, 'link[rel="canonical"]', 'href');
const hreflangEnRaw = attrOf($, 'link[rel="alternate"][hreflang="en"]', 'href');
const hreflangBn = attrOf($, 'link[rel="alternate"][hreflang="bn-BD"]', 'href');
const hreflangEn = hreflangEnRaw && hreflangEnRaw !== canonical ? hreflangEnRaw : null;
const ogTitleRaw = attrOf($, 'meta[property="og:title"]', 'content');
const ogDescriptionRaw = attrOf($, 'meta[property="og:description"]', 'content');
const ogTitle = ogTitleRaw && ogTitleRaw !== title ? ogTitleRaw : null;
const ogDescription = ogDescriptionRaw && ogDescriptionRaw !== description ? ogDescriptionRaw : null;
const twitterTitleRaw = attrOf($, 'meta[name="twitter:title"]', 'content');
const twitterDescriptionRaw = attrOf($, 'meta[name="twitter:description"]', 'content');
const twitterTitle = twitterTitleRaw && twitterTitleRaw !== (ogTitle || title) ? twitterTitleRaw : null;
const twitterDescription = twitterDescriptionRaw && twitterDescriptionRaw !== (ogDescription || description) ? twitterDescriptionRaw : null;
const ogType = attrOf($, 'meta[property="og:type"]', 'content');
const ogImage = attrOf($, 'meta[property="og:image"]', 'content');
const ogSiteName = attrOf($, 'meta[property="og:site_name"]', 'content');
const ogLocale = attrOf($, 'meta[property="og:locale"]', 'content');
const lang = attrOf($, 'html', 'lang');

const jsonLdEl = $('script[type="application/ld+json"]').first();
const jsonLd = jsonLdEl.length ? jsonLdEl.html().trim() : null;

const styleEl = $('head > style').first();
const extraStyles = styleEl.length ? styleEl.html().trim() : null;

const KNOWN_PROPERTY_PREFIXES = ['og:', 'twitter:'];
const KNOWN_ARTICLE_PROPS = ['article:author', 'article:published_time', 'article:modified_time', 'article:section'];
const extraHeadParts = [];
$('head').children().each((i, el) => {
  const $el = $(el);
  const tag = el.tagName;
  if (tag === 'meta') {
    const prop = $el.attr('property') || '';
    const name = $el.attr('name') || '';
    if (KNOWN_PROPERTY_PREFIXES.some(p => prop.startsWith(p))) return;
    if (KNOWN_ARTICLE_PROPS.includes(prop)) return;
    if (['description', 'robots', 'author', 'viewport'].includes(name)) return;
    if (name.startsWith('twitter:')) return;
    if ($el.attr('charset') != null) return;
    extraHeadParts.push($.html(el));
    return;
  }
  if (tag === 'link') {
    const rel = $el.attr('rel') || '';
    if (['icon', 'apple-touch-icon', 'canonical', 'alternate', 'preconnect', 'stylesheet'].includes(rel)) return;
    extraHeadParts.push($.html(el));
    return;
  }
  if (tag === 'script') {
    if (($el.attr('type') || '') === 'application/ld+json') return;
    // The theme-flash-prevention snippet is already hardcoded identically in
    // the shared layout -- skip it here so it isn't duplicated.
    const text = $el.html() || '';
    if (text.includes("localStorage.getItem('mh-theme')") && text.includes('data-theme')) return;
    extraHeadParts.push($.html(el));
  }
});
const extraHead = extraHeadParts.length ? extraHeadParts.join('\n') : null;

// Body: everything inside <body>, minus the trailing whatsapp/scroll-top
// script tags that the shared layout already appends for every page.
let body = $('body').html().trim();
body = body.replace(/\s*<script src="\/whatsapp\.js" defer(?:="")?><\/script>/g, '');
body = body.replace(/\s*<script src="\/scroll-top\.js" defer(?:="")?><\/script>/g, '');
body = body.trim();

const lines = ['---'];
lines.push(`layout: ${yamlStr(extraOpts.layout || 'layouts/base.njk')}`);
lines.push(`permalink: ${yamlStr(extraOpts.permalink)}`);
lines.push(`bareBody: true`);
if (extraOpts.stylesheetHref === false) lines.push(`stylesheetHref: false`);
else if (extraOpts.stylesheetHref) lines.push(`stylesheetHref: ${yamlStr(extraOpts.stylesheetHref)}`);
if (extraOpts.lang || (lang && lang !== 'en')) lines.push(`lang: ${yamlStr(extraOpts.lang || lang)}`);
lines.push(`title: ${yamlStr(title)}`);
lines.push(`description: ${yamlStr(description)}`);
if (robots && robots !== 'index, follow') lines.push(`robots: ${yamlStr(robots)}`);
lines.push(`canonical: ${yamlStr(canonical)}`);
if (hreflangEn) lines.push(`hreflangEn: ${yamlStr(hreflangEn)}`);
if (hreflangBn) lines.push(`hreflangBn: ${yamlStr(hreflangBn)}`);
if (ogTitle) lines.push(`ogTitle: ${yamlStr(ogTitle)}`);
if (ogDescription) lines.push(`ogDescription: ${yamlStr(ogDescription)}`);
if (twitterTitle) lines.push(`twitterTitle: ${yamlStr(twitterTitle)}`);
if (twitterDescription) lines.push(`twitterDescription: ${yamlStr(twitterDescription)}`);
if (ogType) lines.push(`ogType: ${yamlStr(ogType)}`);
if (ogImage) lines.push(`ogImage: ${yamlStr(ogImage)}`);
if (ogSiteName) lines.push(`ogSiteName: ${yamlStr(ogSiteName)}`);
if (ogLocale && ogLocale !== 'en_US') lines.push(`ogLocale: ${yamlStr(ogLocale)}`);
if (extraHead) {
  lines.push('extraHead: |');
  for (const l of extraHead.split('\n')) lines.push('  ' + l);
}
if (jsonLd) {
  lines.push('jsonLd: |');
  for (const l of jsonLd.split('\n')) lines.push('  ' + l);
}
if (extraStyles) {
  lines.push('extraStyles: |');
  for (const l of extraStyles.split('\n')) lines.push('  ' + l);
}
lines.push('---');

const out = lines.join('\n') + '\n' + body + '\n';
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out, 'utf-8');
console.log('OK', outFile);
