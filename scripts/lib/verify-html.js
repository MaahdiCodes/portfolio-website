const { diffArrays } = require('diff');

const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

// One canonicalization pass applied identically to both the original and the
// generated file before comparison. Everything folded in here is a class of
// difference confirmed harmless (renders identically / means nothing to a
// crawler): whitespace formatting, void/non-void self-closing tag style,
// boolean attribute expansion, script path absolutization, and HTML entity
// encoding of literal &, <, >, ' and " in text content (cheerio's serializer
// encodes these on round-trip; browsers render either form identically).
function canonicalize(h) {
  h = h.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  h = h.replace(/\s+/g, ' ');
  h = h.replace(/<!DOCTYPE html>/i, '<!doctype html>');
  h = h.replace(/<meta charset="UTF-8">/i, '<meta charset="utf-8">');
  h = h.replace(/initial-scale=1\.0/g, 'initial-scale=1');
  // Some older pages write the theme-flash-prevention IIFE with tighter
  // spacing ("function(){" vs "function () {") -- same code, cosmetic only.
  h = h.replace(/\(function\s*\(\s*\)\s*\{/g, '(function () {');
  // Course pages predate the site's font-link convention: Google Fonts
  // variable-weight RANGE syntax (wght@300..700) requests the exact same
  // variable font file as the enumerated LIST syntax (wght@300;400;500;600;700)
  // used everywhere else -- equivalent resource, different request string.
  h = h.replace(
    /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Geist:wght@300\.\.700&family=Geist\+Mono:wght@300\.\.500(&family=Noto\+Sans\+Bengali:wght@400;500;600;700)?&family=Instrument\+Serif:ital@0;1&display=swap" rel="stylesheet">/g,
    (m, bengali) => `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500${bengali || ''}&family=Instrument+Serif:ital@0;1&display=swap">`
  );
  // Some bn/ course pages have the standard (non-legacy) font link but are
  // missing Noto Sans Bengali specifically -- same pre-existing-gap pattern
  // already fixed sitewide for bn/lab and the bn homepage.
  h = h.replace(
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap">',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap">'
  );
  h = h.replace(/<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)\s*\/>/g, (m, tag, attrs) => {
    if (VOID_ELEMENTS.has(tag.toLowerCase())) return `<${tag}${attrs}>`;
    return `<${tag}${attrs}></${tag}>`;
  });
  h = h.replace(/(\s[\w-]+)=""/g, '$1');
  // Relative paths to shared assets (any depth of ../, or bare relative for
  // pages that sit directly inside /lab/) are converted to absolute in the
  // new templates -- same resolved URL, deliberate and safe.
  h = h.replace(/src="(?:\.\.\/)*_utils\.js"/g, 'src="/lab/_utils.js"').replace(/src="(?:\.\.\/)*_toc\.js"/g, 'src="/lab/_toc.js"');
  h = h.replace(/href="(?:\.\.\/)*lab\/_styles\.css"/g, 'href="/lab/_styles.css"');
  // Requires at least one "../" so this never catches a lab article's own
  // bare "_styles.css" reference (same directory, no relative prefix).
  h = h.replace(/href="(?:\.\.\/)+_styles\.css"/g, 'href="/courses/_styles.css"');
  h = h.replace(/src="(?:\.\.\/)*lab\/_toc\.js"/g, 'src="/lab/_toc.js"').replace(/src="(?:\.\.\/)*lab\/_utils\.js"/g, 'src="/lab/_utils.js"');
  h = h.replace(/src="_progress\.js"/g, 'src="/courses/01-requirements-gathering/_progress.js"');
  h = h.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&middot;/g, '·').replace(/&nbsp;/g, ' ');
  return h;
}

function toLines(h) {
  return h.replace(/>\s*</g, '>\n<').split('\n').map(l => l.trim()).filter(l => l.length);
}

function splitHeadBody(lines) {
  const bodyIdx = lines.findIndex(l => /^<body/.test(l));
  if (bodyIdx === -1) return { head: lines, body: [] };
  return { head: lines.slice(0, bodyIdx), body: lines.slice(bodyIdx) };
}

// Additive, uniform, deliberate differences between the old hand-authored
// pages (inconsistent across writing batches) and the new shared template
// (always emits the full, correct set). Pure insertions only -- anything
// REMOVED that matches these would still be flagged.
const PURE_INSERTION_OK = [
  /^<!-- JSON-LD/,
  /^<!-- Open Graph -->$/,
  /^<!-- Twitter Card -->$/,
  /^<link rel="icon" href="\/favicon\.ico" sizes="any">$/,
  /^<link rel="apple-touch-icon" href="\/favicon\.png">$/,
  /^<meta name="author" content="Mehedi Hasan">$/,
  /^<meta property="og:image:width" content="1200">$/,
  /^<meta property="og:image:height" content="630">$/,
  /^<meta property="og:locale" content="en_US">$/,
  /^<meta property="og:site_name" content="Mehedi Hasan \| Odoo Consultant">$/,
  /^<meta name="twitter:card" content="summary_large_image">$/,
  /^<link rel="alternate" hreflang="en" href="https:\/\/mhasan\.me\/[^"]*">$/,
  /^<link rel="alternate" hreflang="x-default" href="https:\/\/mhasan\.me\/[^"]*">$/,
  // Some older bn/ translations predate the theme-flash-prevention inline
  // script being added to the site template -- the shared layout always
  // includes it now, which is a uniform, beneficial addition, not a change
  // to page content.
  /^<script> \(function \(\) \{ var t = localStorage\.getItem\('mh-theme'\); if \(t === 'light'\) document\.documentElement\.setAttribute\('data-theme', 'light'\); else if \(t !== 'dark'\) document\.documentElement\.setAttribute\('data-theme', 'dark-navy'\); \}\)\(\); <\/script>$/,
  // Course lesson pages predate Open Graph / Twitter Card metadata being
  // added sitewide -- content-agnostic since the title/description text is
  // page-specific, but only ever matched as a pure INSERTION (gaining
  // metadata that wasn't there), never as a way to hide a removal/change.
  /^<meta property="og:title" content="[^"]*">$/,
  /^<meta property="og:description" content="[^"]*">$/,
  /^<meta property="og:url" content="[^"]*">$/,
  /^<meta property="og:type" content="article">$/,
  /^<meta name="twitter:title" content="[^"]*">$/,
  /^<meta name="twitter:description" content="[^"]*">$/,
];
const PURE_REMOVAL_OK = [/^<!-- JSON-LD/, /^<!-- Open Graph -->$/, /^<!-- Twitter Card -->$/, /^<!-- Twitter -->$/];

function diffHeadAsMultiset(a, b) {
  const bRemaining = [...b];
  const unmatchedA = [];
  for (const line of a) {
    const idx = bRemaining.indexOf(line);
    if (idx === -1) unmatchedA.push(line);
    else bRemaining.splice(idx, 1);
  }
  return { onlyInA: unmatchedA, onlyInB: bRemaining };
}

function diffBodySequential(a, b) {
  const parts = diffArrays(a, b);
  const problems = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p.added && !p.removed) continue;
    if (p.removed) {
      const next = parts[i + 1] && parts[i + 1].added ? parts[i + 1] : null;
      if (next && next.value.length === p.value.length) {
        for (let j = 0; j < p.value.length; j++) {
          if (p.value[j] !== next.value[j]) problems.push({ removed: p.value[j], added: next.value[j] });
        }
        i++;
        continue;
      }
      for (const line of p.value) if (!PURE_REMOVAL_OK.some(re => re.test(line))) problems.push({ removed: line, added: '(nothing)' });
    } else if (p.added) {
      for (const line of p.value) if (!PURE_INSERTION_OK.some(re => re.test(line))) problems.push({ removed: '(nothing)', added: line });
    }
  }
  return problems;
}

// Trailing utility scripts (WhatsApp button, scroll-to-top button) are
// position-independent -- they just inject a floating widget on
// DOMContentLoaded regardless of where the <script> tag sits in the body.
// The shared layout always appends them at the very end; some original pages
// had them mid-body. toLines() splits an empty element's open/close tags
// onto adjacent lines (no text content between ">" and "<"), so each of
// these is a two-line pair, not one line.
const POSITION_INDEPENDENT_PAIRS = [
  ['<script src="/whatsapp.js" defer>', '</script>'],
  ['<script src="/scroll-top.js" defer>', '</script>'],
];

// Pulls matching two-line pairs out of a lines array (wherever they occur),
// returning the remaining lines plus a list of which pairs were found.
function extractPairs(lines) {
  const remaining = [];
  const found = [];
  for (let i = 0; i < lines.length; i++) {
    const pair = POSITION_INDEPENDENT_PAIRS.find(([open, close]) => lines[i] === open && lines[i + 1] === close);
    if (pair) { found.push(pair[0] + pair[1]); i++; continue; }
    remaining.push(lines[i]);
  }
  return { remaining, found };
}

function diffPages(origHtml, newHtml) {
  const a = splitHeadBody(toLines(canonicalize(origHtml)));
  const b = splitHeadBody(toLines(canonicalize(newHtml)));
  const headDiff = diffHeadAsMultiset(a.head, b.head);
  const headProblems = [
    ...headDiff.onlyInA.filter(l => !PURE_REMOVAL_OK.some(re => re.test(l))).map(l => ({ removed: l, added: '(nothing)' })),
    ...headDiff.onlyInB.filter(l => !PURE_INSERTION_OK.some(re => re.test(l))).map(l => ({ removed: '(nothing)', added: l })),
  ];

  const aExtracted = extractPairs(a.body);
  const bExtracted = extractPairs(b.body);
  const trailingDiff = diffHeadAsMultiset(aExtracted.found, bExtracted.found);
  const trailingProblems = [
    ...trailingDiff.onlyInA.map(l => ({ removed: l, added: '(nothing)' })),
    ...trailingDiff.onlyInB.map(l => ({ removed: '(nothing)', added: l })),
  ];

  const bodyProblems = diffBodySequential(aExtracted.remaining, bExtracted.remaining);
  return [...headProblems, ...trailingProblems, ...bodyProblems];
}

module.exports = { canonicalize, toLines, splitHeadBody, diffHeadAsMultiset, diffBodySequential, diffPages, PURE_INSERTION_OK, PURE_REMOVAL_OK };
