// Compliance Watch entries — newest first. Each entry is bilingual and says what
// changed, who it affects, and what to change in the ERP. Add new entries at the
// top; /compliance-watch/ and /bn/compliance-watch/ render from this file.
// status: "in-force" | "watch" (announced/demanded, not yet law)
module.exports = {
  lastReviewed: "2026-09-25",
  entries: [
    {
      date: "2026-08", area: "wages", status: "watch",
      en: { title: "Unions call for a new RMG Minimum Wage Board", what: "Garment unions and labour alliances urged the government to reconstitute the Minimum Wage Board without delay so a new wage structure can take effect by December, in line with the shorter three-year review cycle.", who: "RMG and textile factories, and anyone running worker payroll.", erp: "No change yet. Keep grade basics and the increment % as editable salary-rule parameters, not hard-coded values, so a new gazette means a configuration change, not development work." },
      bn: { title: "নতুন RMG ন্যূনতম মজুরি বোর্ড গঠনের দাবি", what: "ডিসেম্বরের মধ্যে যাতে নতুন মজুরি কাঠামো কার্যকর হতে পারে, সেজন্য গার্মেন্টস শ্রমিক ইউনিয়ন আর শ্রমিক জোটগুলো দেরি না করে ন্যূনতম মজুরি বোর্ড পুনর্গঠনের দাবি জানিয়েছে। এর পেছনে আছে তিন বছরের ছোট পর্যালোচনা চক্র।", who: "RMG ও টেক্সটাইল কারখানা, আর যাঁরা শ্রমিকদের পে-রোল চালান।", erp: "এখনই কিছু বদলাতে হবে না। গ্রেডের মূল মজুরি আর ইনক্রিমেন্টের % স্যালারি রুলে পরিবর্তনযোগ্য প্যারামিটার হিসেবে রাখুন, হার্ড-কোড করবেন না। তাহলে নতুন গেজেট এলে শুধু কনফিগারেশন বদলাবে, ডেভেলপমেন্ট লাগবে না।" },
      links: [{ href: "/tools/rmg-wage-calculator/", en: "RMG wage calculator", bn: "RMG মজুরি ক্যালকুলেটর" }],
      source: "Union statements reported August 2026"
    },
    {
      date: "2026-07", area: "vat", status: "in-force",
      en: { title: "VAT returns become quarterly, with monthly advance deposits", what: "The VAT return now covers three tax periods and is due within 15 days after the cycle ends. Within 15 days after each month, you deposit one-third of the previous quarter's tax as an advance, then settle it in the return. Monthly filing remains available voluntarily, and SD reporting is now inside the VAT return.", who: "Every VAT-registered business.", erp: "Add a quarterly tax-report period, and a monthly job or reminder that calculates one-third of last quarter's net VAT and records the advance deposit. Make sure the return data reconciles the advances against the quarter's actual liability." },
      bn: { title: "VAT রিটার্ন এখন ত্রৈমাসিক, সঙ্গে মাসিক অগ্রিম জমা", what: "VAT রিটার্ন এখন তিনটি করমেয়াদ জুড়ে, আর চক্র শেষ হওয়ার ১৫ দিনের মধ্যে জমা দিতে হয়। প্রতি মাস শেষের ১৫ দিনের মধ্যে আগের ত্রৈমাসিকের করের এক-তৃতীয়াংশ অগ্রিম জমা দিয়ে রিটার্নে সমন্বয় করতে হয়। চাইলে মাসিক রিটার্নও দেওয়া যায়, আর SD-র হিসাব এখন VAT রিটার্নের ভেতরেই।", who: "সব VAT-নিবন্ধিত প্রতিষ্ঠান।", erp: "ত্রৈমাসিক ট্যাক্স রিপোর্টের মেয়াদ যোগ করুন। সঙ্গে একটা মাসিক জব বা রিমাইন্ডার রাখুন, যা আগের ত্রৈমাসিকের নিট VAT-এর এক-তৃতীয়াংশ হিসাব করে অগ্রিম জমা রেকর্ড করবে। রিটার্নের ডেটায় অগ্রিমগুলো যেন ত্রৈমাসিকের প্রকৃত দায়ের সঙ্গে মেলে।" },
      links: [{ href: "/tools/vat-mushak-helper/", en: "VAT & Mushak helper", bn: "VAT ও মূসক হেল্পার" }, { href: "/lab/0003-nbr-vat-compliance-odoo-bangladesh", en: "NBR VAT compliance in Odoo", bn: "Odoo-তে NBR VAT কমপ্লায়েন্স" }],
      source: "Finance Act 2026 (Rahman Rahman Huq / KPMG, Salient features of Finance Bill 2026)"
    },
    {
      date: "2026-07", area: "vat", status: "in-force",
      en: { title: "Mushak 6.3 can be issued from your ERP, and ERP records count as evidence", what: "Tax invoices (Mushak 6.3) can be issued and preserved electronically through the company's ERP. Records kept on secure servers in ERP or NBR-approved VAT software are admissible as evidence. At the same time, tampering with data in approved VAT software now carries a penalty of one to two times the tax evaded.", who: "Every VAT-registered business, especially those still printing 6.3 from Excel or Word.", erp: "Move 6.3 printing into Odoo's invoice or delivery report. Keep the audit trail (chatter and tracking) switched on for invoices and tax configuration, and lock posted entries with a lock date." },
      bn: { title: "ERP থেকেই Mushak 6.3, আর ERP-র রেকর্ড এখন প্রমাণ", what: "কোম্পানির ERP থেকে ইলেকট্রনিকভাবে কর চালানপত্র (Mushak 6.3) ইস্যু ও সংরক্ষণ করা যায়। ERP বা NBR-অনুমোদিত VAT সফটওয়্যারে নিরাপদ সার্ভারে রাখা রেকর্ড আইনগত প্রমাণ হিসেবে গ্রহণযোগ্য। একই সঙ্গে অনুমোদিত VAT সফটওয়্যারে ডেটা বদলালে ফাঁকি দেওয়া করের এক থেকে দুই গুণ জরিমানা।", who: "সব VAT-নিবন্ধিত প্রতিষ্ঠান, বিশেষ করে যাঁরা এখনো Excel বা Word থেকে 6.3 প্রিন্ট করেন।", erp: "6.3 প্রিন্ট Odoo-র ইনভয়েস বা ডেলিভারি রিপোর্টে নিয়ে আসুন। ইনভয়েস আর ট্যাক্স কনফিগারেশনে অডিট ট্রেইল (চ্যাটার আর ট্র্যাকিং) চালু রাখুন, আর লক ডেট দিয়ে পোস্ট করা এন্ট্রি লক করুন।" },
      links: [{ href: "/lab/0018-mushak-63-odoo-bangladesh", en: "Mushak 6.3 in Odoo", bn: "Odoo-তে Mushak 6.3" }],
      source: "Finance Act 2026 (KPMG summary, VAT items 12, 14, 18)"
    },
    {
      date: "2026-07", area: "vat", status: "in-force",
      en: { title: "New return form Mushak 9.1.1 for registered traders", what: "The VAT return has been split: registered traders file Mushak 9.1.1 instead of 9.1. The registration form (2.1), registration certificate (2.3) and turnover tax return (9.2) were also amended by SRO.", who: "Trading companies, distributors, importers who resell.", erp: "Check that your tax report layout matches 9.1.1 if you are a trader. Multi-company groups with both a factory and a trading company need both layouts." },
      bn: { title: "নিবন্ধিত ব্যবসায়ীদের জন্য নতুন রিটার্ন ফর্ম Mushak 9.1.1", what: "VAT রিটার্ন ভাগ হয়েছে: নিবন্ধিত ব্যবসায়ীরা এখন 9.1-এর বদলে Mushak 9.1.1 জমা দেবেন। নিবন্ধনের ফর্ম (2.1), নিবন্ধন সনদ (2.3) আর টার্নওভার কর রিটার্ন (9.2)-ও SRO দিয়ে সংশোধন হয়েছে।", who: "ট্রেডিং কোম্পানি, ডিস্ট্রিবিউটর, আর যে আমদানিকারকেরা পুনরায় বিক্রি করেন।", erp: "ব্যবসায়ী হলে ট্যাক্স রিপোর্টের লেআউট 9.1.1-এর সঙ্গে মেলে কি না দেখুন। যে গ্রুপে কারখানা আর ট্রেডিং কোম্পানি দুটোই আছে, তাদের দুটো লেআউটই লাগবে।" },
      links: [{ href: "/tools/vat-mushak-helper/", en: "Which forms apply to you", bn: "কোন ফর্ম আপনার জন্য" }],
      source: "Finance Act 2026 (KPMG summary, VAT items 16–17)"
    },
    {
      date: "2026-07", area: "vat", status: "in-force",
      en: { title: "Enlistment for all turnover up to ৳50 lakh; turnover tax becomes a fixed amount", what: "The ৳30 lakh \"no obligation\" band is deleted, so every business with turnover up to ৳50 lakh must enlist, and above ৳50 lakh VAT registration is mandatory. Turnover tax moves from 4% of turnover to a fixed amount set by NBR by sector or region (capped at ৳2 lakh), with a four-month tax period and a yearly return.", who: "Small businesses, new ventures, and group companies with small sister concerns.", erp: "Small entities can stay on Odoo Invoicing. Make sure each company in a multi-company set-up has the right tax regime configured." },
      bn: { title: "৳৫০ লাখ পর্যন্ত টার্নওভারে তালিকাভুক্তি বাধ্যতামূলক; টার্নওভার কর এখন নির্দিষ্ট অঙ্ক", what: "৳৩০ লাখের \"কোনো বাধ্যবাধকতা নেই\" অংশটি বাতিল হয়েছে। তাই ৳৫০ লাখ পর্যন্ত টার্নওভারের সব ব্যবসাকে তালিকাভুক্ত হতে হবে, আর ৳৫০ লাখের ওপরে VAT নিবন্ধন বাধ্যতামূলক। টার্নওভার কর ৪% থেকে সরে NBR-নির্ধারিত খাত বা অঞ্চলভিত্তিক নির্দিষ্ট অঙ্কে যাচ্ছে (সর্বোচ্চ ৳২ লাখ), করমেয়াদ চার মাস, রিটার্ন বছরে একবার।", who: "ছোট ব্যবসা, নতুন উদ্যোগ, আর যে গ্রুপে ছোট সহযোগী প্রতিষ্ঠান আছে।", erp: "ছোট প্রতিষ্ঠান Odoo Invoicing-এই থাকতে পারে। মাল্টি-কোম্পানি সেটআপে প্রতিটি কোম্পানিতে সঠিক কর-ব্যবস্থা কনফিগার করা আছে কি না নিশ্চিত করুন।" },
      links: [],
      source: "Finance Act 2026 (KPMG summary, VAT items 3, 4, 10)"
    },
    {
      date: "2026-07", area: "vat", status: "in-force",
      en: { title: "Input tax credit widened: labour allowed, transport at 100%", what: "Labour is removed from the negative input list, and registered entities can claim 100% input credit on transport services (up from 80%). Goods exempt at production can be sold later at 15% VAT on actual value addition, using the new coefficient form Mushak 4.3.1.", who: "Manufacturers and service providers.", erp: "Review tax mappings on vendor bills for transport and labour-contract services so the full credit flows into the return." },
      bn: { title: "উপকরণ কর রেয়াত বেড়েছে: শ্রম অনুমোদিত, পরিবহনে ১০০%", what: "শ্রম নেতিবাচক উপকরণের তালিকা থেকে বাদ পড়েছে, আর পরিবহন সেবায় নিবন্ধিত প্রতিষ্ঠান এখন ১০০% রেয়াত নিতে পারবে (আগে ছিল ৮০%)। উৎপাদন পর্যায়ে অব্যাহতিপ্রাপ্ত পণ্য পরে নতুন সহগ ফর্ম Mushak 4.3.1 ব্যবহার করে প্রকৃত মূল্য সংযোজনের ওপর ১৫% VAT-এ বিক্রি করা যাবে।", who: "উৎপাদক আর সেবা প্রদানকারী।", erp: "পরিবহন আর শ্রম-চুক্তির সেবার ভেন্ডর বিলে ট্যাক্স ম্যাপিং আবার দেখুন, যাতে পুরো রেয়াত রিটার্নে যায়।" },
      links: [{ href: "/lab/0082-vat-input-tax-credit-rebate-odoo-bangladesh", en: "Input tax credit in Odoo", bn: "Odoo-তে উপকরণ কর রেয়াত" }],
      source: "Finance Act 2026 (KPMG summary, VAT items 1, 7, 8)"
    },
    {
      date: "2026-07", area: "vat", status: "in-force",
      en: { title: "VAT on imported services is now withheld by your bank", what: "The reverse-charge mechanism is removed. When you pay for an imported service, the bank withholds the VAT and deposits it by treasury challan in your name. That challan serves as your Mushak 6.3, and you claim it as input credit where eligible.", who: "Anyone paying for foreign software, SaaS (including Odoo licences), consultants or freight.", erp: "Record the bank's treasury challan against the vendor bill for foreign services, and stop self-assessing reverse-charge VAT on those bills." },
      bn: { title: "আমদানিকৃত সেবার VAT এখন ব্যাংক কেটে রাখে", what: "রিভার্স চার্জ পদ্ধতি বাতিল হয়েছে। আমদানিকৃত সেবার পেমেন্টের সময় ব্যাংক VAT কেটে আপনার নামে ট্রেজারি চালানে জমা দেয়। সেই চালানই আপনার Mushak 6.3, আর যোগ্য হলে সেটা উপকরণ কর রেয়াত হিসেবে দাবি করবেন।", who: "যাঁরা বিদেশি সফটওয়্যার, SaaS (Odoo লাইসেন্সসহ), কনসালট্যান্ট বা ফ্রেইটের জন্য পেমেন্ট করেন।", erp: "বিদেশি সেবার ভেন্ডর বিলের সঙ্গে ব্যাংকের ট্রেজারি চালান রেকর্ড করুন, আর ওই বিলে নিজে রিভার্স-চার্জ VAT হিসাব করা বন্ধ করুন।" },
      links: [],
      source: "Finance Act 2026 (KPMG summary, VAT item 6)"
    },
    {
      date: "2026-07", area: "tax", status: "in-force",
      en: { title: "Withholding tax changes: minimum tax withdrawn, new 0.2% on retail supplies", what: "The minimum tax concept is withdrawn and excess tax deducted at source becomes refundable. A new 0.2% advance tax applies to payments received from retailers for goods supplied by manufacturers, importers, distributors and warehouses. Several WHT rates change: transport, rental and repair services go from 5% to 2%, training fees and honoraria from 10% to 20%, and export cash subsidies from 10% to 5%. Withholding-tax return coverage expands to businesses with turnover above ৳10 crore in several sectors.", who: "Finance teams at manufacturers, distributors and exporters.", erp: "Update the TDS rate table on vendor categories, add the 0.2% advance tax on retailer collections for FMCG/distribution, and check your withholding-tax return report." },
      bn: { title: "উৎসে করে পরিবর্তন: ন্যূনতম কর উঠে গেছে, খুচরা সরবরাহে নতুন ০.২%", what: "ন্যূনতম করের ধারণা তুলে নেওয়া হয়েছে, আর উৎসে কাটা অতিরিক্ত কর এখন ফেরতযোগ্য। উৎপাদক, আমদানিকারক, ডিস্ট্রিবিউটর আর ওয়্যারহাউস খুচরা বিক্রেতাদের কাছ থেকে যে পেমেন্ট পায়, তাতে নতুন ০.২% অগ্রিম কর বসেছে। বেশ কিছু উৎসে করের হারও বদলেছে: পরিবহন, ভাড়া আর মেরামত সেবায় ৫% থেকে ২%, ট্রেনিং ফি আর সম্মানীতে ১০% থেকে ২০%, আর রপ্তানি নগদ সহায়তায় ১০% থেকে ৫%। কয়েকটি খাতে ৳১০ কোটির বেশি টার্নওভারের ব্যবসাকেও এখন উৎসে কর রিটার্ন দিতে হবে।", who: "উৎপাদক, ডিস্ট্রিবিউটর আর রপ্তানিকারকের ফিন্যান্স টিম।", erp: "ভেন্ডর ক্যাটাগরির TDS রেট টেবিল হালনাগাদ করুন। FMCG বা ডিস্ট্রিবিউশনে খুচরা বিক্রেতার কাছ থেকে আদায়ে ০.২% অগ্রিম কর যোগ করুন, আর উৎসে কর রিটার্নের রিপোর্ট দেখে নিন।" },
      links: [],
      source: "Finance Act 2026 (KPMG summary, income tax items 15–24)"
    },
    {
      date: "2026-07", area: "customs", status: "in-force",
      en: { title: "Cheaper ERP hardware: 0% import VAT on laptops, desktops, printers and monitors", what: "Import-stage VAT drops from 15% to 0% on portable computers, all-in-one computers, printers, monitors up to 30 inches and flash memory, and advance tax at import is withdrawn on POS machines. SD is cut on some cosmetics, and 10% SD is withdrawn on synthetic woven fabric.", who: "Anyone budgeting workstations, POS or warehouse hardware for an ERP roll-out.", erp: "Re-quote hardware in your ERP budget. The saving can be meaningful for a warehouse or POS roll-out." },
      bn: { title: "ERP হার্ডওয়্যারে সাশ্রয়: ল্যাপটপ, ডেস্কটপ, প্রিন্টার আর মনিটরে আমদানি VAT ০%", what: "পোর্টেবল কম্পিউটার, অল-ইন-ওয়ান কম্পিউটার, প্রিন্টার, ৩০ ইঞ্চি পর্যন্ত মনিটর আর ফ্ল্যাশ মেমোরিতে আমদানি পর্যায়ের VAT ১৫% থেকে ০% হয়েছে, আর POS মেশিনে আমদানিতে অগ্রিম কর তুলে নেওয়া হয়েছে। কিছু প্রসাধনীতে SD কমেছে, আর সিন্থেটিক ওভেন ফ্যাব্রিকে ১০% SD প্রত্যাহার হয়েছে।", who: "যাঁরা ERP রোলআউটের জন্য ওয়ার্কস্টেশন, POS বা ওয়্যারহাউস হার্ডওয়্যারের বাজেট করছেন।", erp: "ERP বাজেটে হার্ডওয়্যারের দাম নতুন করে নিন। ওয়্যারহাউস বা POS রোলআউটে সাশ্রয় উল্লেখযোগ্য হতে পারে।" },
      links: [{ href: "/tools/import-duty-calculator/", en: "Import duty calculator", bn: "আমদানি শুল্ক ক্যালকুলেটর" }],
      source: "Finance Act 2026 (KPMG summary, VAT items 27, 32) and Budget FY27 reporting"
    },
    {
      date: "2026-07", area: "vat", status: "in-force",
      en: { title: "A BIN is now needed for bank accounts, loans, trade licences and utilities", what: "A valid BIN or proof of registration is mandatory to open or operate a business current/STD account, take a loan, renew a trade licence, open an MFS merchant account, join a trade body, get electricity or gas connections, and register vehicles.", who: "Every business, and especially new companies in a group.", erp: "Store the BIN on every company and on key partners (customers and vendors). Mushak 6.3 needs both parties' BINs anyway." },
      bn: { title: "ব্যাংক হিসাব, ঋণ, ট্রেড লাইসেন্স আর ইউটিলিটিতে এখন BIN লাগবে", what: "ব্যবসায়িক চলতি বা STD হিসাব খোলা ও চালানো, ঋণ নেওয়া, ট্রেড লাইসেন্স নবায়ন, MFS মার্চেন্ট অ্যাকাউন্ট খোলা, ট্রেড সংগঠনের সদস্যপদ, গ্যাস-বিদ্যুৎ সংযোগ আর গাড়ি নিবন্ধনে বৈধ BIN বা নিবন্ধনের প্রমাণ বাধ্যতামূলক।", who: "সব ব্যবসা, বিশেষ করে গ্রুপের নতুন কোম্পানি।", erp: "প্রতিটি কোম্পানি আর প্রধান পার্টনারদের (কাস্টমার ও ভেন্ডর) রেকর্ডে BIN রাখুন। Mushak 6.3-তেও দুই পক্ষের BIN লাগে।" },
      links: [],
      source: "Finance Act 2026 (KPMG summary, VAT item 5)"
    },
    {
      date: "2026-07", area: "vat", status: "in-force",
      en: { title: "Registered startups: no VAT on sales until 2035, if records are kept in ERP", what: "Startups defined under the Income Tax Act 2023 and registered for VAT pay no VAT on local supplies, imported services or office rent, and aren't subject to VDS, from 1 July 2026 to 30 June 2035. The condition is that VAT documents are maintained in ERP software or NBR-nominated software.", who: "Tech and innovation startups.", erp: "Even a small Odoo Invoicing + Accounting set-up meets the \"maintain in ERP\" condition. Set it up from day one." },
      bn: { title: "নিবন্ধিত স্টার্টআপ: ২০৩৫ পর্যন্ত বিক্রয়ে VAT নেই, যদি রেকর্ড ERP-তে থাকে", what: "আয়কর আইন ২০২৩-এ সংজ্ঞায়িত আর VAT-নিবন্ধিত স্টার্টআপকে ১ জুলাই ২০২৬ থেকে ৩০ জুন ২০৩৫ পর্যন্ত স্থানীয় সরবরাহ, আমদানিকৃত সেবা বা অফিস ভাড়ায় VAT দিতে হবে না, আর VDS-ও প্রযোজ্য নয়। শর্ত হলো VAT-এর কাগজপত্র ERP সফটওয়্যার বা NBR-মনোনীত সফটওয়্যারে রাখতে হবে।", who: "টেক আর উদ্ভাবনী স্টার্টআপ।", erp: "ছোট একটা Odoo Invoicing আর Accounting সেটআপই \"ERP-তে রাখা\"র শর্ত পূরণ করে। প্রথম দিন থেকেই চালু করুন।" },
      links: [],
      source: "Finance Act 2026 (KPMG summary, VAT item 22)"
    },
    {
      date: "2025-07", area: "customs", status: "in-force",
      en: { title: "Advance tax on commercial imports rose to 7.5%", what: "From FY 2025-26, advance tax (AT) at import for commercial importers increased from 5% to 7.5%. Industrial raw-material imports by manufacturers are treated more favourably.", who: "Commercial importers and traders.", erp: "AT is creditable in the VAT return, so post it to a VAT-receivable account, not to product cost. Your landed-cost lines should carry only CD, RD, SD and local charges." },
      bn: { title: "বাণিজ্যিক আমদানিতে অগ্রিম কর বেড়ে ৭.৫%", what: "২০২৫-২৬ অর্থবছর থেকে বাণিজ্যিক আমদানিকারকদের আমদানি পর্যায়ের অগ্রিম কর (AT) ৫% থেকে বেড়ে ৭.৫% হয়েছে। উৎপাদকদের শিল্প কাঁচামাল আমদানিতে সুবিধাজনক হার প্রযোজ্য।", who: "বাণিজ্যিক আমদানিকারক আর ব্যবসায়ী।", erp: "AT VAT রিটার্নে রেয়াতযোগ্য। তাই এটা প্রোডাক্টের খরচে নয়, VAT-প্রাপ্য অ্যাকাউন্টে পোস্ট করুন। ল্যান্ডেড কস্টের লাইনে শুধু CD, RD, SD আর স্থানীয় খরচ থাকবে।" },
      links: [{ href: "/tools/import-duty-calculator/", en: "Import duty calculator", bn: "আমদানি শুল্ক ক্যালকুলেটর" }, { href: "/lab/0041-odoo-landed-costs-duty-drawback-bangladesh", en: "Landed costs in Odoo", bn: "Odoo-তে ল্যান্ডেড কস্ট" }],
      source: "Budget FY 2025-26 (The Business Standard, The Daily Star reporting)"
    },
    {
      date: "2024-12", area: "wages", status: "in-force",
      en: { title: "RMG annual increment raised from 5% to 9% of basic", what: "A government gazette (January 2025) fixed the annual increment for RMG workers at 9%, adding 4% to the existing 5%, effective 1 December 2024. It stays in place until the Minimum Wage Board announces the next structure.", who: "RMG factories.", erp: "Make the increment % a payroll parameter, and run increments as a dated salary-structure update each December rather than editing contracts by hand." },
      bn: { title: "RMG-এ বার্ষিক ইনক্রিমেন্ট মূল মজুরির ৫% থেকে ৯%", what: "সরকারি গেজেট (জানুয়ারি ২০২৫) RMG শ্রমিকদের বার্ষিক ইনক্রিমেন্ট ৯% নির্ধারণ করেছে: আগের ৫%-এর সঙ্গে ৪% যোগ, ১ ডিসেম্বর ২০২৪ থেকে কার্যকর। মজুরি বোর্ড পরের কাঠামো ঘোষণা না করা পর্যন্ত এটাই চলবে।", who: "RMG কারখানা।", erp: "ইনক্রিমেন্টের % পে-রোল প্যারামিটার হিসেবে রাখুন। প্রতি ডিসেম্বরে হাতে চুক্তি না বদলে তারিখসহ স্যালারি-স্ট্রাকচার আপডেট হিসেবে ইনক্রিমেন্ট চালান।" },
      links: [{ href: "/tools/rmg-wage-calculator/", en: "RMG wage calculator", bn: "RMG মজুরি ক্যালকুলেটর" }, { href: "/lab/0022-bgmea-wage-board-odoo-payroll", en: "Wage board in Odoo payroll", bn: "Odoo পে-রোলে ওয়েজ বোর্ড" }],
      source: "Ministry of Labour gazette, reported by The Business Standard"
    }
  ]
};
