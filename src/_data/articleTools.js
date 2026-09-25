// Which interactive tools / resources to suggest at the end of each Lab article.
// Keyed by article number. Values are keys of TOOLS below.
const TOOLS = {
  estimator: { href: "/tools/odoo-cost-estimator/", en: ["Odoo Cost Estimator", "Get your own cost range in BDT"], bn: ["Odoo কস্ট এস্টিমেটর", "BDT-তে আপনার খরচের পরিসর জানুন"] },
  roi: { href: "/tools/odoo-roi-calculator/", en: ["ROI Calculator", "3-year ROI and break-even month"], bn: ["ROI ক্যালকুলেটর", "৩ বছরের ROI আর ব্রেক-ইভেনের মাস"] },
  readiness: { href: "/tools/erp-readiness-assessment/", en: ["ERP Readiness Assessment", "Score your readiness in 5 minutes"], bn: ["ERP প্রস্তুতি যাচাই", "৫ মিনিটে প্রস্তুতির স্কোর"] },
  quote: { href: "/tools/odoo-quote-checker/", en: ["Odoo Quote Checker", "Find the gaps in a vendor proposal"], bn: ["Odoo কোটেশন চেকার", "ভেন্ডরের প্রস্তাবের ফাঁক খুঁজুন"] },
  wage: { href: "/tools/rmg-wage-calculator/", en: ["RMG Wage Calculator", "Grades, 9% increment, OT, bonus"], bn: ["RMG মজুরি ক্যালকুলেটর", "গ্রেড, ৯% ইনক্রিমেন্ট, OT, বোনাস"] },
  duty: { href: "/tools/import-duty-calculator/", en: ["Import Duty Calculator", "CD, RD, SD, VAT, AIT, AT and landed cost"], bn: ["আমদানি শুল্ক ক্যালকুলেটর", "CD, RD, SD, VAT, AIT, AT আর ল্যান্ডেড কস্ট"] },
  vat: { href: "/tools/vat-mushak-helper/", en: ["VAT & Mushak Helper", "Which forms apply after the Finance Act 2026"], bn: ["VAT ও মূসক হেল্পার", "অর্থ আইন ২০২৬-এর পর কোন ফর্ম প্রযোজ্য"] },
  watch: { href: "/compliance-watch/", en: ["Compliance Watch", "Latest VAT, tax and wage changes"], bn: ["কমপ্লায়েন্স ওয়াচ", "VAT, কর আর মজুরির সর্বশেষ পরিবর্তন"] },
  benchmarks: { href: "/benchmarks/odoo-implementation-pricing-bangladesh/", en: ["Price benchmarks", "What a fair Odoo quote looks like"], bn: ["দামের মানদণ্ড", "ন্যায্য Odoo কোটেশন দেখতে কেমন"] },
  course2: { href: "/courses/02-uat-go-live/", en: ["Free course: UAT & go-live", "8 lessons on getting live safely"], bn: ["ফ্রি কোর্স: UAT ও গো-লাইভ", "নিরাপদে গো-লাইভের ৮টি লেসন"] },
  templates: { href: "/resources/#downloads", en: ["Download the templates", "Excel & Word, ready to use"], bn: ["টেমপ্লেট ডাউনলোড", "Excel ও Word, ব্যবহারের জন্য প্রস্তুত"] }
};

const MAP = {
  "0001": ["readiness", "course2"], "0002": ["templates", "readiness"], "0003": ["vat", "watch"], "0004": ["estimator", "readiness"],
  "0005": ["estimator", "course2"], "0007": ["course2", "readiness"], "0008": ["templates", "course2"], "0009": ["templates", "course2"],
  "0010": ["templates"], "0012": ["estimator", "benchmarks"], "0014": ["vat", "watch"], "0016": ["wage", "watch"],
  "0018": ["vat", "watch"], "0019": ["duty", "watch"], "0020": ["duty"], "0021": ["duty"], "0022": ["wage", "watch"],
  "0024": ["estimator"], "0028": ["templates", "course2"], "0029": ["templates", "quote"], "0030": ["templates", "course2"],
  "0031": ["templates", "course2"], "0032": ["templates", "course2"], "0033": ["wage", "estimator"], "0036": ["duty", "vat"],
  "0041": ["duty", "watch"], "0043": ["templates"], "0044": ["roi", "templates"], "0045": ["templates", "quote"],
  "0046": ["quote"], "0047": ["templates", "readiness"], "0048": ["roi", "estimator"], "0049": ["quote", "benchmarks"],
  "0050": ["estimator", "benchmarks"], "0051": ["estimator", "benchmarks"], "0052": ["quote", "benchmarks"],
  "0062": ["benchmarks", "readiness"], "0063": ["wage"], "0071": ["watch", "vat"], "0072": ["duty"], "0073": ["duty"],
  "0077": ["quote"], "0082": ["vat", "watch"], "0084": ["vat"], "0099": ["course2", "benchmarks"], "0100": ["quote", "readiness"],
  "0102": ["course2"]
};

module.exports = { TOOLS, MAP };
