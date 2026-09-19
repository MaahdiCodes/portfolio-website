// Mechanical extraction: original lab/*.html -> src/lab/*.html (front matter + body).
// Uses a real HTML parser (cheerio) since formatting varies across writing batches
// (indentation, line-wrapped attributes, missing hreflang/favicon tags, differing
// og:site_name text). Every output must still be re-verified against the original
// via the diff-check script before being trusted -- this script does not skip that.
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SRC_DIR = process.argv[2] || 'lab';
const OUT_DIR = process.argv[3] || 'src/lab';
const files = process.argv.slice(4);

function yamlStr(s) {
  if (s == null) return '""';
  return JSON.stringify(s);
}

function textOf($, sel) {
  const el = $(sel).first();
  return el.length ? el.text().trim() : null;
}
function htmlOf($, sel) {
  const el = $(sel).first();
  return el.length ? el.html().trim() : null;
}
function attrOf($, sel, attr) {
  const el = $(sel).first();
  return el.length ? el.attr(attr) : null;
}

function extract(file) {
  const html = fs.readFileSync(file, 'utf-8').replace(/^﻿/, '');
  const $ = cheerio.load(html, { decodeEntities: false });

  const title = textOf($, 'title');
  const description = attrOf($, 'meta[name="description"]', 'content');
  const robots = attrOf($, 'meta[name="robots"]', 'content');
  const canonical = attrOf($, 'link[rel="canonical"]', 'href');
  const hreflangBn = attrOf($, 'link[rel="alternate"][hreflang="bn-BD"]', 'href');
  const ogTitleRaw = attrOf($, 'meta[property="og:title"]', 'content');
  const ogDescriptionRaw = attrOf($, 'meta[property="og:description"]', 'content');
  const ogTitle = ogTitleRaw && ogTitleRaw !== title ? ogTitleRaw : null;
  const ogDescription = ogDescriptionRaw && ogDescriptionRaw !== description ? ogDescriptionRaw : null;
  const twitterTitleRaw = attrOf($, 'meta[name="twitter:title"]', 'content');
  const twitterDescriptionRaw = attrOf($, 'meta[name="twitter:description"]', 'content');
  const twitterTitle = twitterTitleRaw && twitterTitleRaw !== (ogTitle || title) ? twitterTitleRaw : null;
  const twitterDescription = twitterDescriptionRaw && twitterDescriptionRaw !== (ogDescription || description) ? twitterDescriptionRaw : null;
  const ogImage = attrOf($, 'meta[property="og:image"]', 'content');
  const ogSiteName = attrOf($, 'meta[property="og:site_name"]', 'content');
  const ogLocale = attrOf($, 'meta[property="og:locale"]', 'content');
  const lang = attrOf($, 'html', 'lang');
  const hreflangEn = attrOf($, 'link[rel="alternate"][hreflang="en"]', 'href');
  const datePublished = attrOf($, 'meta[property="article:published_time"]', 'content');
  const dateModified = attrOf($, 'meta[property="article:modified_time"]', 'content');
  const articleSection = attrOf($, 'meta[property="article:section"]', 'content');

  // Anything in <head> not covered by an already-modeled field (keywords,
  // article:tag lists, etc. appear on some articles but not others) is kept
  // verbatim so nothing is silently dropped.
  const KNOWN_HEAD_SELECTORS = [
    'meta[charset]', 'meta[name="viewport"]',
    'link[rel="icon"]', 'link[rel="apple-touch-icon"]',
    'meta[name="description"]', 'meta[name="robots"]', 'meta[name="author"]',
    'title', 'link[rel="canonical"]', 'link[rel="alternate"]',
    'link[rel="preconnect"]', 'link[rel="stylesheet"]',
    'script[type="application/ld+json"]', 'style', 'script',
  ];
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
      if (name === 'description' || name === 'robots' || name === 'author' || name === 'viewport') return;
      if (name === 'twitter:title' || name === 'twitter:description' || name === 'twitter:card' || name === 'twitter:image') return;
      if ($el.attr('charset') != null) return;
      if (prop.startsWith('twitter:') || name.startsWith('twitter:')) return;
      extraHeadParts.push($.html(el));
      return;
    }
    if (tag === 'link') {
      const rel = $el.attr('rel') || '';
      if (['icon', 'apple-touch-icon', 'canonical', 'alternate', 'preconnect', 'stylesheet'].includes(rel)) return;
      extraHeadParts.push($.html(el));
      return;
    }
    // title, script, style are all otherwise accounted for structurally.
  });
  const extraHead = extraHeadParts.length ? extraHeadParts.join('\n') : null;

  const jsonLdEl = $('script[type="application/ld+json"]').first();
  if (!jsonLdEl.length) throw new Error('no JSON-LD script found');
  const jsonLd = jsonLdEl.html().trim();

  const styleEl = $('head > style').first();
  const styleBlock = styleEl.length ? styleEl.html().trim() : null;

  const eyebrowText = textOf($, '.post-head .eyebrow');
  if (!eyebrowText) throw new Error('no .post-head .eyebrow found');
  const eyebrowNum = eyebrowText.split('·').pop().trim();

  const h1 = htmlOf($, '.post-head h1');
  const lede = htmlOf($, '.post-head .lede');
  if (!h1 || !lede) throw new Error('missing h1/lede');

  const chips = $('.post-head .post-meta .chip').map((i, el) => $(el).text().trim()).get();

  const bylineSpans = $('.post-head .byline > span');
  if (bylineSpans.length < 4) throw new Error('byline has fewer than 4 spans');
  function spanLabelValue(i) {
    const el = $(bylineSpans[i]);
    const b = el.find('b').first();
    const value = b.length ? b.html().trim() : null;
    const fullHtml = el.html();
    const label = fullHtml.split('<b')[0].trim();
    return { label, value };
  }
  const bylineItems = [];
  for (let i = 0; i < bylineSpans.length; i++) {
    bylineItems.push(spanLabelValue(i));
  }

  const articleEl = $('article.post').first();
  if (!articleEl.length) throw new Error('no article.post found');
  const body = articleEl.html().trim();

  const cards = $('footer .next .next-card').map((i, el) => {
    const $el = $(el);
    return {
      disabled: ($el.attr('class') || '').includes('disabled'),
      href: $el.attr('href'),
      dir: htmlOf($, `footer .next .next-card:eq(${i}) .dir`),
      title: htmlOf($, `footer .next .next-card:eq(${i}) h4`),
      desc: htmlOf($, `footer .next .next-card:eq(${i}) p`),
    };
  }).get();
  const nextCard = cards[0] && !cards[0].disabled ? cards[0] : null;
  const prevCard = cards[1] && !cards[1].disabled ? cards[1] : null;
  const extraCards = cards.slice(2).filter(c => !c.disabled);

  const hreflangEnOut = hreflangEn && hreflangEn !== canonical ? hreflangEn : null;

  return {
    title, description, robots, canonical, hreflangBn, hreflangEn: hreflangEnOut,
    ogTitle, ogDescription, twitterTitle, twitterDescription,
    ogImage, ogSiteName, ogLocale, lang, extraHead,
    datePublished, dateModified, articleSection, jsonLd, styleBlock,
    eyebrowNum, h1, lede, chips, bylineItems,
    body, nextCard, prevCard, extraCards,
  };
}

function toFrontMatter(d, permalink) {
  const lines = ['---'];
  lines.push(`permalink: ${yamlStr(permalink)}`);
  lines.push(`title: ${yamlStr(d.title)}`);
  lines.push(`description: ${yamlStr(d.description)}`);
  if (d.robots && d.robots !== 'index, follow') lines.push(`robots: ${yamlStr(d.robots)}`);
  lines.push(`canonical: ${yamlStr(d.canonical)}`);
  if (d.hreflangBn) lines.push(`hreflangBn: ${yamlStr(d.hreflangBn)}`);
  if (d.hreflangEn) lines.push(`hreflangEn: ${yamlStr(d.hreflangEn)}`);
  if (d.lang && d.lang !== 'en') lines.push(`lang: ${yamlStr(d.lang)}`);
  if (d.ogTitle) lines.push(`ogTitle: ${yamlStr(d.ogTitle)}`);
  if (d.ogDescription) lines.push(`ogDescription: ${yamlStr(d.ogDescription)}`);
  if (d.twitterTitle) lines.push(`twitterTitle: ${yamlStr(d.twitterTitle)}`);
  if (d.twitterDescription) lines.push(`twitterDescription: ${yamlStr(d.twitterDescription)}`);
  if (d.ogImage) lines.push(`ogImage: ${yamlStr(d.ogImage)}`);
  if (d.ogSiteName) lines.push(`ogSiteName: ${yamlStr(d.ogSiteName)}`);
  if (d.ogLocale && d.ogLocale !== 'en_US') lines.push(`ogLocale: ${yamlStr(d.ogLocale)}`);
  if (d.extraHead) {
    lines.push(`extraHead: |`);
    for (const l of d.extraHead.split('\n')) lines.push('  ' + l);
  }
  if (d.datePublished) lines.push(`datePublished: ${yamlStr(d.datePublished)}`);
  if (d.dateModified) lines.push(`dateModified: ${yamlStr(d.dateModified)}`);
  if (d.articleSection) lines.push(`articleSection: ${yamlStr(d.articleSection)}`);
  lines.push(`eyebrowNum: ${yamlStr(d.eyebrowNum)}`);
  lines.push(`h1: ${yamlStr(d.h1)}`);
  lines.push(`lede: ${yamlStr(d.lede)}`);
  lines.push(`chips: [${d.chips.map(yamlStr).join(', ')}]`);
  if (d.bylineItems.length) {
    lines.push('bylineItems:');
    for (const it of d.bylineItems) {
      lines.push(`  - label: ${yamlStr(it.label)}`);
      lines.push(`    value: ${yamlStr(it.value)}`);
    }
  }
  if (d.nextCard) {
    lines.push('nextArticle:');
    lines.push(`  href: ${yamlStr(d.nextCard.href)}`);
    lines.push(`  dir: ${yamlStr(d.nextCard.dir)}`);
    lines.push(`  title: ${yamlStr(d.nextCard.title)}`);
    lines.push(`  desc: ${yamlStr(d.nextCard.desc)}`);
  }
  if (d.prevCard) {
    lines.push('prevArticle:');
    lines.push(`  href: ${yamlStr(d.prevCard.href)}`);
    lines.push(`  dir: ${yamlStr(d.prevCard.dir)}`);
    lines.push(`  title: ${yamlStr(d.prevCard.title)}`);
    lines.push(`  desc: ${yamlStr(d.prevCard.desc)}`);
  }
  if (d.extraCards.length) {
    lines.push('extraCards:');
    for (const c of d.extraCards) {
      lines.push(`  - href: ${yamlStr(c.href)}`);
      lines.push(`    dir: ${yamlStr(c.dir)}`);
      lines.push(`    title: ${yamlStr(c.title)}`);
      lines.push(`    desc: ${yamlStr(c.desc)}`);
    }
  }
  lines.push(`jsonLd: |`);
  for (const l of d.jsonLd.split('\n')) lines.push('  ' + l);
  if (d.styleBlock) {
    lines.push(`extraStyles: |`);
    for (const l of d.styleBlock.split('\n')) lines.push('  ' + l);
  }
  lines.push('---');
  return lines.join('\n');
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const results = [];
for (const name of files) {
  const inFile = path.join(SRC_DIR, name);
  const outFile = path.join(OUT_DIR, name);
  try {
    const d = extract(inFile);
    const permalink = SRC_DIR.replace(/\\/g, '/').replace(/\/$/, '') + '/' + name;
    const out = toFrontMatter(d, permalink) + '\n' + d.body + '\n';
    fs.writeFileSync(outFile, out, 'utf-8');
    results.push({ name, ok: true });
  } catch (e) {
    results.push({ name, ok: false, error: e.message });
  }
}

for (const r of results) {
  console.log(r.ok ? 'OK   ' + r.name : 'FAIL ' + r.name + ' -- ' + r.error);
}
const fails = results.filter(r => !r.ok);
console.log(`\n${results.length - fails.length}/${results.length} extracted, ${fails.length} failed`);
