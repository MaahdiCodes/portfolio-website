// Which interactive tools / resources to suggest at the end of each Lab article.
// Keyed by article number. Values are keys of TOOLS below.
const TOOLS = {
  consult: { href: "/services/business-consultant-bangladesh/", en: ["Free 45-minute conversation", "About an operations problem in your business"], bn: ["ফ্রি ৪৫ মিনিটের আলাপ", "আপনার ব্যবসার অপারেশনস সমস্যা নিয়ে"] },
  manuf: { href: "/services/manufacturing-erp-consultant/", en: ["Talk through a factory problem", "Free first conversation on stock, costing or payroll"], bn: ["কারখানার সমস্যা নিয়ে কথা বলুন", "স্টক, কস্টিং বা পে-রোল নিয়ে ফ্রি প্রথম আলাপ"] },
  reorder: { href: "/tools/reorder-point-calculator/", en: ["Reorder Point Calculator", "Safety stock, reorder level and order quantity"], bn: ["রিঅর্ডার পয়েন্ট ক্যালকুলেটর", "সেফটি স্টক, রিঅর্ডার লেভেল ও অর্ডারের পরিমাণ"] },
  cyclecount: { href: "/assets/downloads/cycle-count-planner-inventory-accuracy.xlsx", en: ["Cycle count planner (Excel)", "ABC classes, tolerances and accuracy dashboard"], bn: ["সাইকেল কাউন্ট প্ল্যানার (Excel)", "ABC শ্রেণি, টলারেন্স ও নির্ভুলতার ড্যাশবোর্ড"] },
  payclose: { href: "/assets/downloads/factory-payroll-close-calendar-checklist.xlsx", en: ["Payroll close checklist (Excel)", "Cut-off calendar, checks and variance review"], bn: ["পে-রোল ক্লোজ চেকলিস্ট (Excel)", "কাট-অফ ক্যালেন্ডার, যাচাই ও তুলনা"] },
  rescue: { href: "/services/odoo-rescue/#scorecard", en: ["Rescue self-check", "12 warning signs in 2 minutes"], bn: ["রেসকিউ সেলফ-চেক", "২ মিনিটে ১২টি সতর্ক সংকেত"] },
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
  "0001": ["rescue", "consult"], "0002": ["consult", "templates"], "0003": ["vat", "watch"], "0004": ["estimator", "readiness"],
  "0005": ["rescue", "estimator"], "0007": ["rescue", "course2"], "0008": ["templates", "course2"], "0009": ["templates", "rescue"],
  "0010": ["consult", "templates"], "0012": ["estimator", "benchmarks"], "0014": ["vat", "watch"], "0016": ["payclose", "wage"],
  "0018": ["vat", "watch"], "0019": ["duty", "watch"], "0020": ["duty"], "0021": ["duty"], "0022": ["wage", "payclose"],
  "0024": ["estimator"], "0028": ["templates", "course2"], "0029": ["templates", "quote"], "0030": ["templates", "rescue"],
  "0031": ["templates", "course2"], "0032": ["rescue", "templates"], "0033": ["manuf", "wage"], "0036": ["duty", "vat"],
  "0041": ["duty", "watch"], "0043": ["consult", "templates"], "0044": ["roi", "templates"], "0045": ["templates", "quote"],
  "0046": ["quote"], "0047": ["templates", "readiness"], "0048": ["roi", "estimator"], "0049": ["quote", "benchmarks"],
  "0050": ["estimator", "benchmarks"], "0051": ["estimator", "benchmarks"], "0052": ["quote", "benchmarks"],
  "0062": ["consult", "benchmarks"], "0063": ["wage"], "0071": ["watch", "vat"], "0072": ["duty"], "0073": ["duty"],
  "0077": ["quote"], "0082": ["vat", "watch"], "0084": ["vat"], "0099": ["rescue", "benchmarks"], "0100": ["rescue", "quote"],
  "0102": ["course2", "rescue"],
  "0103": ["rescue", "templates"], "0104": ["rescue", "consult"],
  "0011": ["reorder", "manuf"], "0013": ["manuf", "reorder"], "0015": ["reorder", "consult"], "0034": ["manuf", "reorder"],
  "0037": ["manuf"], "0038": ["manuf"], "0039": ["reorder", "cyclecount"], "0040": ["manuf"], "0055": ["consult"],
  "0060": ["rescue", "consult"], "0061": ["manuf"], "0063": ["wage", "manuf"], "0065": ["cyclecount", "reorder"],
  "0068": ["manuf", "reorder"], "0085": ["manuf"], "0096": ["payclose"], "0097": ["consult"],
  "0105": ["cyclecount", "manuf"], "0106": ["cyclecount", "reorder"], "0107": ["manuf", "consult"],
  "0108": ["payclose", "wage"], "0109": ["consult", "readiness"], "0110": ["reorder", "manuf"]
};

module.exports = { TOOLS, MAP };
