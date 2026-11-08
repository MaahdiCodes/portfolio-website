# Bangla translation style guide — mhasan.me

This site is being fully translated into natural, professional Bangla under `/bn/`. Read this before translating any file. Two reference translations already exist and set the quality bar:

- `bn/lab/0001-why-erp-fails-bangladesh.html`
- `bn/lab/0012-odoo-erp-cost-bangladesh.html`
- `bn/index.html` (homepage)
- `bn/tools/odoo-cost-estimator/index.html`

Read at least one of these fully before starting. Match its register and sentence rhythm, not just its vocabulary choices.

## The core problem to avoid

The first draft of this translation scored ~20/100 on readability because it mirrored English sentence structure clause-by-clause — long em-dash-stacked sentences, gerund phrases translated literally, three-item lists crammed into one breathless sentence. That is NOT what natural Bangla business writing looks like. Fix this by:

- **Break long English sentences into 2-3 shorter Bangla sentences.** English marketing copy loves one 40-word sentence with two em-dashes; Bangla reads better as three short declarative sentences.
- **Don't translate em-dash interruptions literally.** `"Business owners — rightly skeptical of cost — compress timelines"` should NOT become `ব্যবসার মালিকরা — যৌক্তিকভাবে সন্দিহান — টাইমলাইন সংকুচিত করেন`. Restructure: `ব্যবসার মালিকরাও খরচ নিয়ে যুক্তিসঙ্গতভাবেই সন্দিহান থাকেন, তাই টাইমলাইন কমিয়ে ফেলেন।`
- **Use natural Bangla connectors**, not literal ones: তাই, ফলে, তারপর, আর, কিন্তু, যেহেতু — instead of chaining clauses with colons and dashes the way English does.
- **Prefer active, direct sentences.** "একটি ফোকাসড Odoo রোলআউট... আমি হ্যান্ডেল করি" reads better than passive/nominalized constructions.
- **It's fine to reorder or lightly restructure a sentence** as long as the meaning and facts (numbers, names, claims) are unchanged. Translate the *meaning and tone*, not the *sentence shape*.
- Short technical lists (feature bullets, table rows, form labels) are fine to keep terse/parallel — the "stiff" problem is mainly in prose paragraphs (intros, essay bodies, case-study summaries), not in bullet lists.

## Terminology — keep in English (Latin script)

Brand names, product names, and industry acronyms stay in English exactly as written — this is how Bangladeshi business/technical audiences actually read and search for them:

`Odoo`, `ERP`, `BOM`, `UAT`, `CRM`, `KPI`, `MRP`, `VAT`, `TDS`, `LC`, `SKU`, `SME`, `RMG`, `BPMN`, `HR`, `IoT`, `API`, `TCO`, `ROI`, `FIFO`, `AVCO`, `BGMEA`, `EPZ`, `SEZ`, `NBR`, `Mushak 6.3`, module names (`Manufacturing`, `Inventory`, `Sales`, `Purchase`, `Accounting`, `Studio`, etc.), `Odoo S.A.`, `Odoo Community`, `Odoo Enterprise`, people's names, company names.

Numbers stay in Arabic numerals (৳3–5 লাখ style is fine, i.e. Bangla currency/unit words with Arabic digits) — do not convert to Bengali numerals except in short decorative UI labels where it already reads naturally (matches what's already in `bn/index.html`).

## Terminology — translate to Bangla

Ordinary connective/descriptive prose: business concepts, verbs, explanations, transitions. Common consistent choices already established:

- Business Analyst → বিজনেস অ্যানালিস্ট
- Manufacturing (as a general concept, not the module) → ম্যানুফ্যাকচারিং (keep — already established as a loanword, don't force ans "উৎপাদন")
- consultant → কনসালট্যান্ট
- implementation → বাস্তবায়ন
- discovery (phase) → ডিসকভারি
- deployment → ডেপ্লয়মেন্ট
- go-live → গো-লাইভ
- change management → চেঞ্জ ম্যানেজমেন্ট
- stakeholder → স্টেকহোল্ডার
- requirement(s) → রিকোয়ারমেন্ট
- cost/pricing → খরচ / মূল্য / দাম (vary naturally)
- Dhaka → ঢাকা, Bangladesh → বাংলাদেশ

When in doubt, prefer the term already used in the reference files above for consistency.

## Structural / technical rules (do not deviate)

1. **Only translate visible text and user-facing strings.** Never change: `id`, `name`, `value`, `class` attributes, CSS, JS logic/variable names, form field `value=` attributes that get submitted to a backend (e.g. `value="Under BDT 3L"` keeps its English value — only the visible `<option>` text changes).
2. **`<html lang="bn">`** on every translated page.
3. **Add hreflang alternates** in `<head>`: `hreflang="en"` → the English original URL, `hreflang="bn-BD"` → this page's own `/bn/...` URL, `hreflang="x-default"` → the English original URL. Also add the canonical `<link rel="canonical">` pointing to the `/bn/...` URL.
4. **Translate meta tags**: `<title>`, `meta description`, `og:title`, `og:description`, `og:url` (→ bn URL), `og:locale` (→ `bn_BD`), `og:site_name`, `twitter:title`, `twitter:description`. Keep `og:image` unchanged.
5. **JSON-LD**: translate `headline`/`name`/`description` fields to Bangla, update `url`/`mainEntityOfPage`/breadcrumb `item` URLs to the `/bn/...` equivalents, add `"inLanguage": "bn"`. For `BreadcrumbList`, translate `"Home"` → `"হোম"`, `"Lab"` → `"ল্যাব"`, etc. **Drop the `FAQPage` JSON-LD block entirely if present** (Google deprecated FAQ rich results May 2026 — it's dead weight) but **keep the visible on-page FAQ text**, translated.
6. **Font**: add `Noto+Sans+Bengali:wght@400;500;600;700` to the Google Fonts `<link>` (alongside the existing Geist/Instrument Serif families — see reference files for exact URL pattern), and add `body { font-family: 'Noto Sans Bengali', var(--sans); }` near the top of the page's `<style>` block.
7. **Stylesheet/script paths**: lab articles normally use relative paths (`_styles.css`, `_utils.js`, `_toc.js`, or `href="../"` for the brand link). Since the Bangla file lives one path segment deeper (under `/bn/lab/...` instead of `/lab/...`), **convert every relative path to absolute**: `_styles.css` → `/lab/_styles.css`, `_utils.js` → `/lab/_utils.js`, `_toc.js` → `/lab/_toc.js`, `href="../"` (brand/home link) → `href="/bn/"`, `href="../#lab"` → `href="/bn/#lab"`, `href="../#contact"` → `href="/bn/#contact"`. Do the equivalent for whatever page type you're translating (courses, services, etc. — work out the correct relative-to-absolute conversion for that file's new location under `/bn/`).
8. **Internal links to other site content**: since the **entire site** is being translated, always link to the Bangla path of the target page (`/bn/lab/000X-...`, `/bn/services/...`, `/bn/courses/...`, `/bn/tools/odoo-cost-estimator/`, `/bn/#contact`, etc.) — even if that target page's Bangla version doesn't exist yet at the moment you're translating (other batches are creating it in parallel). Do not add "(ইংরেজি)" markers or fall back to English paths. Assets and floating widgets (`/whatsapp.js`, `/scroll-top.js`, `/favicon.ico` etc.) stay as absolute root paths, unchanged.
9. **Forms**: if the page has a form that POSTs to a Google Apps Script endpoint (contact form, newsletter, lead-capture), it already has a honeypot field (`tabindex="-1"`, visually hidden, checked in the submit handler before proceeding) — keep that logic intact, just translate the visible labels/placeholders and any JS-driven status messages (e.g. "Sending…", "Please enter a valid email").
10. **robots meta**: keep `index, follow` (or whatever the English original has) unless the original is `noindex` (e.g. gated course lesson pages — keep those `noindex, follow` too).
11. Do not touch any CSS/JS logic, only text nodes and the specific attributes named above.

## After translating each file

Quickly self-check: does `node -e "JSON.parse(...)"`-style validity hold for the JSON-LD (no trailing commas, quotes balanced)? Are all internal links absolute (`/bn/...` or `/...`) not relative? Does the page still read as clearly organized as the English original (same headings, same list structure)?
