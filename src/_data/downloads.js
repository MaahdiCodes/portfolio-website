// Downloadable templates (built by scripts/build-templates.py into src/assets/downloads/).
// Sizes are read at build time so the page never lies about them.
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "assets", "downloads");

const items = [
  { file: "odoo-project-charter-template.docx", article: "0047-odoo-project-charter-template",
    en: { t: "Odoo Project Charter", d: "Objective, measurable success criteria, scope in/out, milestones, budget, governance, change control and sign-off." },
    bn: { t: "Odoo প্রজেক্ট চার্টার", d: "লক্ষ্য, মাপা যায় এমন সাফল্যের মানদণ্ড, স্কোপের ভেতর-বাহির, মাইলফলক, বাজেট, পরিচালনা, চেঞ্জ কন্ট্রোল আর সাইন-অফ।" } },
  { file: "erp-business-requirements-document-template.docx", article: "0045-erp-requirements-document-template",
    en: { t: "Business Requirements Document (BRD)", d: "Context, objectives, as-is processes, MoSCoW requirements, Bangladesh compliance, reports, non-functional needs and sign-off." },
    bn: { t: "বিজনেস রিকোয়ারমেন্টস ডকুমেন্ট (BRD)", d: "প্রেক্ষাপট, লক্ষ্য, বর্তমান প্রসেস, MoSCoW রিকোয়ারমেন্ট, বাংলাদেশের কমপ্লায়েন্স, রিপোর্ট, অকার্যকরী প্রয়োজন আর সাইন-অফ।" } },
  { file: "erp-requirements-register-moscow.xlsx", article: "0045-erp-requirements-document-template",
    en: { t: "Requirements register (MoSCoW) + vendor fit", d: "Numbered requirements with priorities; vendors mark Native / Workaround / Customisation and the summary scores each proposal." },
    bn: { t: "রিকোয়ারমেন্ট রেজিস্টার (MoSCoW) ও ভেন্ডর ফিট", d: "অগ্রাধিকারসহ নম্বরযুক্ত রিকোয়ারমেন্ট। ভেন্ডররা Native / Workaround / Customisation চিহ্ন দেন, আর সারাংশ প্রতিটি প্রস্তাবের নম্বর দেখায়।" } },
  { file: "odoo-rfp-document-template.docx", article: "0029-odoo-rfp-template-bangladesh",
    en: { t: "Odoo RFP document", d: "The 7-section request for proposal: scope, compliance, technical, commercial, vendor qualifications, method and evaluation." },
    bn: { t: "Odoo RFP ডকুমেন্ট", d: "৭ অংশের রিকোয়েস্ট ফর প্রপোজাল: স্কোপ, কমপ্লায়েন্স, টেকনিক্যাল, বাণিজ্যিক শর্ত, ভেন্ডরের যোগ্যতা, পদ্ধতি আর মূল্যায়ন।" } },
  { file: "odoo-rfp-vendor-scoring-matrix.xlsx", article: "0029-odoo-rfp-template-bangladesh",
    en: { t: "Vendor scoring matrix", d: "14 weighted criteria scored for up to 3 vendors, red-flag disqualifiers, pre-qualification and reference-check questions." },
    bn: { t: "ভেন্ডর স্কোরিং ম্যাট্রিক্স", d: "৩টি পর্যন্ত ভেন্ডরের জন্য ১৪টি ভারিত মানদণ্ড, বাদ দেওয়ার লাল পতাকা, প্রাক-যোগ্যতা আর রেফারেন্স যাচাইয়ের প্রশ্ন।" } },
  { file: "erp-business-case-roi-model.xlsx", article: "0044-erp-business-case-bangladesh",
    en: { t: "Business case & ROI model", d: "Five benefit categories, 3-year TCO with contingency, ROI, payback and a draft executive summary." },
    bn: { t: "বিজনেস কেস ও ROI মডেল", d: "পাঁচ ধরনের লাভ, কন্টিনজেন্সিসহ ৩ বছরের TCO, ROI, পেব্যাক আর নির্বাহী সারাংশের খসড়া।" } },
  { file: "as-is-to-be-process-mapping-worksheet.xlsx", article: "0043-as-is-to-be-process-mapping-erp",
    en: { t: "As-is / to-be process mapping worksheet", d: "Step-by-step current and future process, pain points, Odoo feature and Fit / Workaround / Gap, with a fit-rate summary." },
    bn: { t: "বর্তমান / ভবিষ্যৎ প্রসেস ম্যাপিং ওয়ার্কশিট", d: "ধাপে ধাপে বর্তমান আর ভবিষ্যৎ প্রসেস, সমস্যা, Odoo ফিচার আর Fit / Workaround / Gap, ফিট-রেটের সারাংশসহ।" } },
  { file: "odoo-implementation-roadmap-gantt.xlsx", article: "0028-odoo-implementation-roadmap-bangladesh",
    en: { t: "12-week roadmap (Gantt), RACI & go/no-go", d: "5 phases with auto-drawing Gantt bars, RACI matrix and a go-live decision checklist." },
    bn: { t: "১২ সপ্তাহের রোডম্যাপ (গ্যান্ট), RACI ও go/no-go", d: "স্বয়ংক্রিয় গ্যান্ট বারসহ ৫টি ধাপ, RACI ম্যাট্রিক্স আর গো-লাইভ সিদ্ধান্তের চেকলিস্ট।" } },
  { file: "odoo-data-migration-checklist.xlsx", article: "0008-excel-odoo-migration-checklist",
    en: { t: "Data migration checklist", d: "The 40-item Excel → Odoo checklist, Bangladesh master-data checks (BIN, TIN/TDS, physical stock) and a reconciliation sheet." },
    bn: { t: "ডেটা মাইগ্রেশন চেকলিস্ট", d: "৪০ আইটেমের Excel → Odoo চেকলিস্ট, বাংলাদেশের মাস্টার ডেটা যাচাই (BIN, TIN/TDS, বাস্তব স্টক) আর মিলকরণ শিট।" } },
  { file: "odoo-uat-test-script-template.xlsx", article: "0009-uat-script-200-users-ago",
    en: { t: "UAT test scripts & defect log", d: "12 Bangladesh-specific sample cases (TDS, VDS, landed cost, 6.3, payroll), defect log with S1–S4 and an exit summary." },
    bn: { t: "UAT টেস্ট স্ক্রিপ্ট ও ত্রুটির লগ", d: "বাংলাদেশের ১২টি নমুনা কেস (TDS, VDS, ল্যান্ডেড কস্ট, 6.3, পে-রোল), S1–S4 সহ ত্রুটির লগ আর শেষ করার সারাংশ।" } },
  { file: "odoo-training-plan-signoff.xlsx", article: "0031-odoo-training-plan-template",
    en: { t: "Training plan & sign-off matrix", d: "Role × module depth matrix, session schedule (with language) and per-user practical sign-off." },
    bn: { t: "ট্রেনিং প্ল্যান ও সাইন-অফ ম্যাট্রিক্স", d: "দায়িত্ব × মডিউল গভীরতার ম্যাট্রিক্স, সেশনের সময়সূচি (ভাষাসহ) আর প্রতিটি ইউজারের ব্যবহারিক সাইন-অফ।" } },
  { file: "odoo-user-access-rights-matrix.xlsx", article: "0042-odoo-user-access-rights-configuration",
    en: { t: "User access rights matrix", d: "Role × app access levels, record rules and approval limits, user register and quarterly access review." },
    bn: { t: "ইউজার অ্যাক্সেস রাইটস ম্যাট্রিক্স", d: "দায়িত্ব × অ্যাপের অ্যাক্সেস স্তর, রেকর্ড রুল আর অনুমোদনের সীমা, ইউজার রেজিস্টার আর ত্রৈমাসিক অ্যাক্সেস পর্যালোচনা।" } },
  { file: "mushak-vat-odoo-configuration-map.xlsx", article: "0018-mushak-63-odoo-bangladesh",
    en: { t: "Mushak & VAT configuration map (2026)", d: "Every Mushak form mapped to Odoo, VAT accounts, tax set-up tests and common errors, updated for quarterly returns and 9.1.1." },
    bn: { t: "মূসক ও VAT কনফিগারেশন ম্যাপ (২০২৬)", d: "প্রতিটি মূসক ফর্ম Odoo-র সঙ্গে ম্যাপ করা, VAT অ্যাকাউন্ট, ট্যাক্স সেটআপের টেস্ট আর সাধারণ ভুল। ত্রৈমাসিক রিটার্ন আর 9.1.1-এর জন্য হালনাগাদ।" } },
  { file: "odoo-hypercare-plan-issue-log.xlsx", article: "0032-odoo-post-go-live-hypercare-bangladesh",
    en: { t: "Hypercare plan & issue log", d: "Severity SLAs, L1–L3 tiers, issue log with a daily summary, first month-end close and exit criteria." },
    bn: { t: "হাইপারকেয়ার প্ল্যান ও ইস্যু লগ", d: "সিভিয়ারিটি SLA, L1–L3 স্তর, দৈনিক সারাংশসহ ইস্যু লগ, প্রথম মাস-শেষের ক্লোজিং আর শেষ করার শর্ত।" } }
];

module.exports = items.map((it) => {
  let size = "";
  try {
    const b = fs.statSync(path.join(DIR, it.file)).size;
    size = b > 1024 * 1024 ? (b / 1048576).toFixed(1) + " MB" : Math.round(b / 1024) + " KB";
  } catch (e) { size = ""; }
  return Object.assign({ type: it.file.endsWith(".docx") ? "Word" : "Excel", size, href: "/assets/downloads/" + it.file }, it);
});
