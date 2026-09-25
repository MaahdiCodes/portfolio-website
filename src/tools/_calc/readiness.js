/* ERP Readiness Assessment — question bank + scoring. Bilingual (en/bn).
   Pure data + functions; used by /tools/erp-readiness-assessment/ and its
   /bn/ twin, and unit-testable in Node. Each option scores 0–3. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.MHCalc = root.MHCalc || {}; root.MHCalc.readiness = api; }
})(typeof self !== 'undefined' ? self : this, function () {

  var DIMENSIONS = [
    { id: 'lead', en: 'Leadership & ownership', bn: 'নেতৃত্ব ও দায়িত্ব' },
    { id: 'proc', en: 'Process clarity', bn: 'প্রসেসের স্বচ্ছতা' },
    { id: 'data', en: 'Data readiness', bn: 'ডেটার প্রস্তুতি' },
    { id: 'people', en: 'People & change', bn: 'মানুষ ও পরিবর্তন' },
    { id: 'infra', en: 'Budget, IT & partner', bn: 'বাজেট, IT ও পার্টনার' }
  ];

  // flag: shown as a red flag when the answer scores <= flagAt (default 0)
  var QUESTIONS = [
    // ---------- Leadership ----------
    { d: 'lead', id: 'q1',
      en: 'Who will own the ERP project inside your company?',
      bn: 'কোম্পানির ভেতরে ERP প্রজেক্টের মালিকানা কার হাতে থাকবে?',
      o: [
        [0, 'Nobody specific. The vendor will run it.', 'নির্দিষ্ট কেউ নেই। ভেন্ডরই চালাবে।'],
        [1, 'The IT person or an accounts officer, part-time', 'IT-র কেউ বা একজন অ্যাকাউন্টস অফিসার, পার্ট-টাইমে'],
        [2, 'A senior manager, alongside their normal job', 'একজন সিনিয়র ম্যানেজার, নিজের নিয়মিত কাজের পাশাপাশি'],
        [3, 'A named senior owner with real time allocated and authority to decide', 'নির্দিষ্ট একজন সিনিয়র মালিক আছেন। তাঁর হাতে সময় আর সিদ্ধান্ত নেওয়ার ক্ষমতা দুটোই আছে']],
      flag: { en: 'No internal owner. Projects run by the vendor alone are the #1 failure pattern in Bangladesh.', bn: 'ভেতরের কোনো মালিক নেই। শুধু ভেন্ডরের হাতে চলা প্রজেক্টই বাংলাদেশে ব্যর্থতার সবচেয়ে বড় কারণ।', link: '/lab/0001-why-erp-fails-bangladesh' } },
    { d: 'lead', id: 'q2',
      en: 'How involved is the owner / MD?',
      bn: 'মালিক বা MD কতটা যুক্ত থাকবেন?',
      o: [
        [0, 'They signed off the budget and moved on', 'বাজেটে সই করেছেন, তারপর আর খোঁজ নেই'],
        [1, 'They ask for updates occasionally', 'মাঝে মাঝে আপডেট জানতে চান'],
        [2, 'They attend monthly steering meetings', 'প্রতি মাসের স্টিয়ারিং মিটিংয়ে থাকেন'],
        [3, 'They visibly champion it and will enforce "if it’s not in Odoo, it didn’t happen"', 'প্রকাশ্যে প্রজেক্টের পক্ষে দাঁড়ান। "Odoo-তে না থাকলে কাজটা হয়নি" নিয়মটা নিজেই কার্যকর করবেন']],
      flag: { en: 'Owner is not engaged. Without top-down enforcement, people drift back to Excel within weeks of go-live.', bn: 'মালিক যুক্ত নন। ওপর থেকে চাপ না থাকলে গো-লাইভের কয়েক সপ্তাহের মধ্যেই সবাই আবার Excel-এ ফিরে যায়।', link: '/lab/0007-change-management-isnt-a-memo' } },
    { d: 'lead', id: 'q3',
      en: 'Can you state, in numbers, what the ERP must achieve?',
      bn: 'ERP দিয়ে কী অর্জন করতে চান, সেটা কি সংখ্যা দিয়ে বলতে পারবেন?',
      o: [
        [0, 'Not really. We just need a proper system', 'আসলে না। একটা ভালো সিস্টেম দরকার, এটুকুই'],
        [1, 'We have general goals like "better control"', '"ভালো কন্ট্রোল"-এর মতো সাধারণ লক্ষ্য আছে'],
        [2, 'We have 2–3 goals, not yet measured', '২–৩টা লক্ষ্য আছে, কিন্তু এখনো মাপা হয়নি'],
        [3, 'Yes: baseline + target KPIs (e.g. month-end close 12 → 4 days)', 'হ্যাঁ। বর্তমান অবস্থা আর লক্ষ্য দুটোই KPI আকারে আছে (যেমন মাস-শেষের ক্লোজিং ১২ দিন থেকে ৪ দিন)']],
      flag: { en: 'No measurable objectives. Scope will expand to fill the budget, and nobody will be able to say whether it worked.', bn: 'মাপা যায় এমন লক্ষ্য নেই। বাজেট যতটা আছে স্কোপ ততটাই বাড়বে, আর শেষে কেউ বলতে পারবে না প্রজেক্ট সফল হলো কি না।', link: '/lab/0044-erp-business-case-bangladesh' } },
    { d: 'lead', id: 'q4',
      en: 'Who makes the final call when two departments disagree about a process?',
      bn: 'কোনো প্রসেস নিয়ে দুই ডিপার্টমেন্ট একমত না হলে চূড়ান্ত সিদ্ধান্ত কে নেবেন?',
      o: [
        [0, 'Unclear. It usually escalates and stalls', 'পরিষ্কার না। সাধারণত ওপরে যায়, তারপর আটকে থাকে'],
        [1, 'The MD, whenever they are available', 'MD, যখন সময় পান'],
        [2, 'A steering group, but it meets irregularly', 'একটা স্টিয়ারিং গ্রুপ আছে, তবে নিয়মিত বসে না'],
        [3, 'A defined steering committee with a decision SLA (e.g. 48 hours)', 'নির্দিষ্ট স্টিয়ারিং কমিটি আছে, সিদ্ধান্তের সময়সীমাও ঠিক করা (যেমন ৪৮ ঘণ্টা)']],
      flag: { en: 'No decision path. Unresolved process disputes are what quietly turn a 6-month project into 14 months.', bn: 'সিদ্ধান্তের কোনো পথ নেই। অমীমাংসিত প্রসেস-বিরোধই চুপচাপ ৬ মাসের প্রজেক্টকে ১৪ মাসে নিয়ে যায়।', link: '/lab/0047-odoo-project-charter-template' } },
    { d: 'lead', id: 'q5',
      en: 'Why now? What is driving the project?',
      bn: 'এখনই কেন? প্রজেক্টের পেছনে আসল কারণ কী?',
      o: [
        [0, 'A vendor pitched it / competitors have one', 'একজন ভেন্ডর প্রস্তাব দিয়েছে, বা প্রতিযোগীদের আছে'],
        [1, 'General feeling that we should modernise', 'সাধারণভাবে মনে হচ্ছে আধুনিক হওয়া দরকার'],
        [2, 'Specific pain: stock mismatches, late reports, audit trouble', 'নির্দিষ্ট সমস্যা আছে: স্টকের গরমিল, দেরিতে রিপোর্ট, অডিটে ঝামেলা'],
        [3, 'Specific pain + a deadline (buyer requirement, expansion, NBR/VAT change)', 'নির্দিষ্ট সমস্যা, সঙ্গে একটা ডেডলাইন (বায়ারের শর্ত, সম্প্রসারণ, NBR/VAT পরিবর্তন)']] },

    // ---------- Process ----------
    { d: 'proc', id: 'q6',
      en: 'Are your core processes (order-to-cash, procure-to-pay, production) written down?',
      bn: 'মূল প্রসেসগুলো (অর্ডার থেকে টাকা আদায়, কেনা থেকে পেমেন্ট, প্রোডাকশন) কি লিখিত আছে?',
      o: [
        [0, 'No. It lives in people’s heads', 'না। সব মানুষের মাথায় আছে'],
        [1, 'Partly. A few SOPs exist but nobody follows them', 'আংশিক। কিছু SOP আছে, কিন্তু কেউ মানে না'],
        [2, 'Mostly documented, some gaps', 'বেশিরভাগই লিখিত, কিছু ফাঁক আছে'],
        [3, 'Documented and mapped (flowcharts / BPMN), owners named', 'লিখিত ও ম্যাপ করা (ফ্লোচার্ট / BPMN), প্রতিটির মালিক ঠিক করা']],
      flag: { en: 'Processes are undocumented. You will end up paying consultants to discover your own business. Map it first.', bn: 'প্রসেস লিখিত নেই। নিজের ব্যবসা বোঝার জন্যই কনসালট্যান্টকে টাকা দিতে হবে। আগে ম্যাপ করুন।', link: '/lab/0043-as-is-to-be-process-mapping-erp' } },
    { d: 'proc', id: 'q7',
      en: 'Do different branches / units do the same process the same way?',
      bn: 'বিভিন্ন ইউনিট বা ব্রাঞ্চ কি একই কাজ একই নিয়মে করে?',
      o: [
        [0, 'No. Every unit has its own way', 'না। প্রতিটা ইউনিটের নিজস্ব নিয়ম'],
        [1, 'Similar, but lots of local exceptions', 'মোটামুটি এক, তবে প্রচুর স্থানীয় ব্যতিক্রম'],
        [2, 'Mostly standard', 'বেশিরভাগই একই রকম'],
        [3, 'Standardised, or we only have one unit', 'একই নিয়ম, অথবা আমাদের একটাই ইউনিট']] },
    { d: 'proc', id: 'q8',
      en: 'How much do you expect to customise Odoo?',
      bn: 'Odoo কতটা কাস্টমাইজ করতে হবে বলে মনে করেন?',
      o: [
        [0, 'A lot. Odoo must work exactly like we work today', 'অনেক। আজ যেভাবে কাজ করি, Odoo-কে ঠিক সেভাবেই চলতে হবে'],
        [1, 'Quite a bit. Our business is unique', 'বেশ খানিকটা। আমাদের ব্যবসা আলাদা ধরনের'],
        [2, 'Some reports and a few fields', 'কিছু রিপোর্ট আর কয়েকটা ফিল্ড'],
        [3, 'Minimal. We’ll adopt standard Odoo processes wherever reasonable', 'সামান্য। যেখানে সম্ভব Odoo-র স্ট্যান্ডার্ড প্রসেসই গ্রহণ করব']],
      flag: { en: 'Heavy customisation expected. Every custom module is a cost you pay again at every version upgrade.', bn: 'ভারী কাস্টমাইজেশনের পরিকল্পনা। প্রতিটা কাস্টম মডিউলের খরচ প্রতিবার ভার্সন আপগ্রেডে আবার দিতে হয়।', link: '/lab/0046-scope-creep-erp-project-management' } },
    { d: 'proc', id: 'q9',
      en: 'Have you listed your Bangladesh-specific compliance needs (Mushak 6.3/9.1, VDS/TDS, wage board, LC, bond)?',
      bn: 'বাংলাদেশের নিজস্ব কমপ্লায়েন্সের প্রয়োজনগুলো (Mushak 6.3/9.1, VDS/TDS, ওয়েজ বোর্ড, LC, বন্ড) কি তালিকা করেছেন?',
      o: [
        [0, 'No. We assumed the ERP handles it', 'না। ধরে নিয়েছি ERP-ই সামলাবে'],
        [1, 'We know some are needed, no detail', 'কিছু যে লাগবে জানি, বিস্তারিত জানি না'],
        [2, 'Listed, not yet checked against Odoo', 'তালিকা আছে, Odoo-র সঙ্গে মিলিয়ে দেখা হয়নি'],
        [3, 'Listed and mapped to Odoo features or known gaps', 'তালিকা আছে, আর Odoo-র ফিচার বা জানা গ্যাপের সঙ্গে ম্যাপ করা']],
      flag: { en: 'Compliance requirements not captured. Mushak and VDS gaps discovered after go-live are expensive and embarrassing.', bn: 'কমপ্লায়েন্সের রিকোয়ারমেন্ট ধরা হয়নি। গো-লাইভের পরে Mushak বা VDS-এর গ্যাপ ধরা পড়লে খরচও বেশি, বিব্রতকরও।', link: '/lab/0018-mushak-63-odoo-bangladesh' } },
    { d: 'proc', id: 'q10',
      en: 'Do you have a written requirements document to give vendors?',
      bn: 'ভেন্ডরদের দেওয়ার মতো লিখিত রিকোয়ারমেন্ট ডকুমেন্ট আছে কি?',
      o: [
        [0, 'No. We’ll explain in meetings', 'না। মিটিংয়ে বুঝিয়ে বলব'],
        [1, 'A short list of modules we want', 'কোন মডিউল চাই তার একটা ছোট তালিকা'],
        [2, 'A draft requirements document', 'রিকোয়ারমেন্ট ডকুমেন্টের একটা খসড়া'],
        [3, 'A prioritised requirements document / RFP with must-have vs nice-to-have', 'অগ্রাধিকার অনুযায়ী সাজানো রিকোয়ারমেন্ট ডকুমেন্ট বা RFP। কোনটা অবশ্যই লাগবে আর কোনটা থাকলে ভালো, দুটো আলাদা করা']],
      flag: { en: 'No written requirements. Quotes from different vendors won’t be comparable, and "that wasn’t in scope" arguments are guaranteed.', bn: 'লিখিত রিকোয়ারমেন্ট নেই। বিভিন্ন ভেন্ডরের কোটেশন তুলনা করা যাবে না, আর পরে "এটা স্কোপে ছিল না" তর্ক নিশ্চিত।', link: '/lab/0045-erp-requirements-document-template' } },

    // ---------- Data ----------
    { d: 'data', id: 'q11',
      en: 'How clean is your item / product master?',
      bn: 'আইটেম বা প্রোডাক্ট মাস্টার কতটা পরিষ্কার?',
      o: [
        [0, 'Duplicates everywhere, no naming rules', 'সবখানে ডুপ্লিকেট, নামকরণের কোনো নিয়ম নেই'],
        [1, 'One list exists but it’s messy', 'একটা তালিকা আছে, তবে এলোমেলো'],
        [2, 'Mostly clean, codes exist', 'মোটামুটি পরিষ্কার, কোড আছে'],
        [3, 'Clean, coded, units of measure consistent, owner assigned', 'পরিষ্কার, কোড করা, মাপের একক একই রকম, একজন দায়িত্বে আছেন']],
      flag: { en: 'Item master is messy. Dirty master data is the most common reason inventory numbers are wrong after go-live.', bn: 'আইটেম মাস্টার এলোমেলো। গো-লাইভের পর স্টকের হিসাব ভুল আসার সবচেয়ে সাধারণ কারণ এই অপরিষ্কার মাস্টার ডেটা।', link: '/lab/0030-data-migration-checklist-odoo-bangladesh' } },
    { d: 'data', id: 'q12',
      en: 'How far off is the physical stock count from your books?',
      bn: 'বাস্তবে গোনা স্টক আর খাতার স্টকের মধ্যে ফারাক কতটা?',
      o: [
        [0, 'We don’t know / we never reconcile', 'জানি না / কখনো মিলাই না'],
        [1, 'Big differences every count', 'প্রতিবার গোনার সময় বড় ফারাক'],
        [2, 'Some differences, investigated', 'কিছু ফারাক থাকে, খুঁজে দেখা হয়'],
        [3, 'Within a few percent, counted regularly', 'কয়েক শতাংশের মধ্যে, নিয়মিত গোনা হয়']],
      flag: { en: 'Stock isn’t reconciled. Loading unverified opening balances into Odoo just digitises the problem. Do a full count before cut-over.', bn: 'স্টক মেলানো হয় না। যাচাই না করা ওপেনিং ব্যালেন্স Odoo-তে তুললে সমস্যাটা শুধু ডিজিটাল হবে। কাট-ওভারের আগে পুরো স্টক গুনুন।', link: '/lab/0008-excel-odoo-migration-checklist' } },
    { d: 'data', id: 'q13',
      en: 'Do you have accurate Bills of Materials (BOMs) / recipes?',
      bn: 'সঠিক BOM (বিল অব ম্যাটেরিয়ালস) বা রেসিপি আছে কি?',
      o: [
        [0, 'No. Production issues material by experience', 'না। প্রোডাকশন অভিজ্ঞতা দেখে ম্যাটেরিয়াল নেয়'],
        [1, 'For some products, rarely updated', 'কিছু প্রোডাক্টের আছে, কালেভদ্রে আপডেট হয়'],
        [2, 'For most products, mostly accurate', 'বেশিরভাগ প্রোডাক্টের আছে, মোটামুটি সঠিক'],
        [3, 'Yes, maintained with wastage %, or we don’t manufacture', 'হ্যাঁ, ওয়েস্টেজ % সহ নিয়মিত আপডেট হয়, অথবা আমরা ম্যানুফ্যাকচার করি না']],
      flag: { en: 'No reliable BOMs. MRP, costing and consumption control all depend on them. Budget time for BOM building before go-live.', bn: 'নির্ভরযোগ্য BOM নেই। MRP, কস্টিং আর কনজাম্পশন কন্ট্রোল সবই এর ওপর নির্ভর করে। গো-লাইভের আগে BOM তৈরির সময় রাখুন।', link: '/lab/0013-odoo-manufacturing-module-bangladesh' } },
    { d: 'data', id: 'q14',
      en: 'Where does your accounting live today?',
      bn: 'এখন হিসাব কোথায় রাখা হয়?',
      o: [
        [0, 'Paper ledgers / scattered Excel', 'কাগজের খাতা / ছড়ানো-ছিটানো Excel'],
        [1, 'Excel, closed irregularly', 'Excel-এ, ক্লোজিং অনিয়মিত'],
        [2, 'Tally or similar, closed monthly with delays', 'Tally বা এরকম কিছুতে, মাসিক ক্লোজিং হয় তবে দেরিতে'],
        [3, 'Accounting software, closed on time, audited', 'অ্যাকাউন্টিং সফটওয়্যারে, সময়মতো ক্লোজিং, অডিট করা']] },
    { d: 'data', id: 'q15',
      en: 'How much history do you plan to migrate?',
      bn: 'কত বছরের পুরোনো ডেটা মাইগ্রেট করতে চান?',
      o: [
        [0, 'Everything, all years, all transactions', 'সবকিছু, সব বছরের, সব লেনদেন'],
        [1, 'Several years of transactions', 'কয়েক বছরের লেনদেন'],
        [2, 'Opening balances + current year', 'ওপেনিং ব্যালেন্স আর চলতি বছর'],
        [3, 'Masters + opening balances + open documents only (old data archived)', 'শুধু মাস্টার, ওপেনিং ব্যালেন্স আর চলমান ডকুমেন্ট (পুরোনো ডেটা আর্কাইভ করা)']],
      flag: { en: 'Migrating all history. It multiplies cost and risk for data nobody will query. Archive it and migrate balances.', bn: 'সব পুরোনো ডেটা মাইগ্রেট করার পরিকল্পনা। এতে খরচ আর ঝুঁকি কয়েক গুণ বাড়ে, অথচ ওই ডেটা কেউ খুলেও দেখবে না। আর্কাইভ করে শুধু ব্যালেন্স আনুন।', link: '/lab/0030-data-migration-checklist-odoo-bangladesh' } },

    // ---------- People ----------
    { d: 'people', id: 'q16',
      en: 'How comfortable are your operational staff with computers?',
      bn: 'অপারেশনের কর্মীরা কম্পিউটার ব্যবহারে কতটা স্বচ্ছন্দ?',
      o: [
        [0, 'Many rarely use one', 'অনেকে প্রায় ব্যবহারই করেন না'],
        [1, 'Basic. Mostly Excel and email', 'মৌলিক। মূলত Excel আর ইমেইল'],
        [2, 'Comfortable with business software', 'বিজনেস সফটওয়্যারে স্বচ্ছন্দ'],
        [3, 'Comfortable, and we have a few power users', 'স্বচ্ছন্দ, আর কয়েকজন দক্ষ পাওয়ার ইউজারও আছেন']] },
    { d: 'people', id: 'q17',
      en: 'Can key users be released for the project (discovery, testing, training)?',
      bn: 'মূল ইউজারদের কি প্রজেক্টের জন্য সময় দেওয়া যাবে (ডিসকভারি, টেস্টিং, ট্রেনিং)?',
      o: [
        [0, 'No. Everyone is fully loaded', 'না। সবাই পুরো কাজে ব্যস্ত'],
        [1, 'Only after hours / occasionally', 'শুধু অফিসের পরে, বা মাঝেমধ্যে'],
        [2, 'A few hours a week', 'সপ্তাহে কয়েক ঘণ্টা'],
        [3, 'Yes: named key users with 20–50% time protected', 'হ্যাঁ। নির্দিষ্ট মূল ইউজার আছেন, তাঁদের ২০–৫০% সময় প্রজেক্টের জন্য রাখা']],
      flag: { en: 'Key users can’t be released. Without their time, UAT becomes a formality and problems surface in live operations.', bn: 'মূল ইউজারদের সময় দেওয়া যাচ্ছে না। তাঁদের সময় ছাড়া UAT শুধু আনুষ্ঠানিকতা হয়ে যায়, আর সমস্যা ধরা পড়ে লাইভ অপারেশনে গিয়ে।', link: '/lab/0009-uat-script-200-users-ago' } },
    { d: 'people', id: 'q18',
      en: 'How has your company handled past system changes?',
      bn: 'আগে কোনো সিস্টেম বদলানোর সময় কোম্পানির অভিজ্ঞতা কেমন ছিল?',
      o: [
        [0, 'A previous ERP/software attempt failed', 'আগের একটা ERP বা সফটওয়্যারের চেষ্টা ব্যর্থ হয়েছে'],
        [1, 'Strong resistance, slow adoption', 'প্রবল আপত্তি, ধীরে গ্রহণ'],
        [2, 'Some grumbling, adopted eventually', 'কিছু আপত্তি ছিল, শেষে মেনে নিয়েছে'],
        [3, 'Changes land well: we train and follow up', 'পরিবর্তন ভালোভাবে কার্যকর হয়। আমরা ট্রেনিং দিই আর ফলো-আপ করি']],
      flag: { en: 'A previous attempt failed. Find out exactly why before starting again, because the same causes are usually still there.', bn: 'আগের চেষ্টা ব্যর্থ হয়েছে। আবার শুরুর আগে ঠিক কেন ব্যর্থ হয়েছিল তা খুঁজে বের করুন। সাধারণত সেই কারণগুলো এখনো রয়ে গেছে।', link: '/lab/0100-switching-odoo-partners-mid-implementation-bangladesh' } },
    { d: 'people', id: 'q19',
      en: 'Who will support users after the consultants leave?',
      bn: 'কনসালট্যান্টরা চলে যাওয়ার পর ইউজারদের সাপোর্ট কে দেবে?',
      o: [
        [0, 'The vendor. We’ll call them', 'ভেন্ডর। দরকার হলে ফোন করব'],
        [1, 'Our IT person', 'আমাদের IT-র লোক'],
        [2, 'We’ll train one internal superuser', 'একজন ইন্টারনাল সুপারইউজার তৈরি করব'],
        [3, 'A superuser in each department + an internal Odoo lead', 'প্রতিটা ডিপার্টমেন্টে একজন সুপারইউজার, সঙ্গে একজন ইন্টারনাল Odoo লিড']],
      flag: { en: 'No internal support plan. Every small question becomes a paid ticket and a delay.', bn: 'ভেতরের সাপোর্টের কোনো পরিকল্পনা নেই। প্রতিটা ছোট প্রশ্নই টাকা দিয়ে টিকিট আর অপেক্ষা হয়ে দাঁড়াবে।', link: '/lab/0102-building-in-house-odoo-superuser-team-bangladesh' } },
    { d: 'people', id: 'q20',
      en: 'Is there a training plan (who, what, when, in which language)?',
      bn: 'ট্রেনিংয়ের কোনো পরিকল্পনা আছে কি (কে, কী, কখন, কোন ভাষায়)?',
      o: [
        [0, 'No. The vendor will do a demo', 'না। ভেন্ডর একটা ডেমো দেখাবে'],
        [1, 'A general training session is planned', 'একটা সাধারণ ট্রেনিং সেশনের পরিকল্পনা আছে'],
        [2, 'Role-based training planned', 'দায়িত্ব অনুযায়ী আলাদা ট্রেনিংয়ের পরিকল্পনা আছে'],
        [3, 'Role-based, in Bangla where needed, with practice data and sign-off', 'দায়িত্ব অনুযায়ী, দরকার হলে বাংলায়, প্র্যাকটিস ডেটা আর সাইন-অফ সহ']],
      flag: { en: 'No training plan. A demo is not training, and users who weren’t trained will build Excel workarounds.', bn: 'ট্রেনিংয়ের পরিকল্পনা নেই। ডেমো দেখানো ট্রেনিং নয়। যাঁরা ট্রেনিং পাননি, তাঁরা Excel দিয়ে বিকল্প পথ বানিয়ে নেবেন।', link: '/lab/0031-odoo-training-plan-template' } },

    // ---------- Infra / budget / partner ----------
    { d: 'infra', id: 'q21',
      en: 'How was the budget set?',
      bn: 'বাজেট কীভাবে ঠিক করা হয়েছে?',
      o: [
        [0, 'No budget yet / "as cheap as possible"', 'এখনো বাজেট নেই / "যত কম খরচে সম্ভব"'],
        [1, 'Based on one vendor quote', 'একজন ভেন্ডরের কোটেশন দেখে'],
        [2, 'Based on several quotes', 'কয়েকটা কোটেশন দেখে'],
        [3, '3-year TCO incl. internal time, hidden costs and a 15–25% contingency', '৩ বছরের TCO ধরে, ভেতরের সময়, লুকানো খরচ আর ১৫–২৫% কন্টিনজেন্সি সহ']],
      flag: { en: 'No realistic budget. Under-budgeted projects cut training and data work first, and those cuts cause the failure.', bn: 'বাস্তবসম্মত বাজেট নেই। কম বাজেটের প্রজেক্টে প্রথমেই ট্রেনিং আর ডেটার কাজ কাটা হয়, আর ব্যর্থতার কারণ হয় ঠিক সেটাই।', link: '/lab/0050-hidden-erp-costs-bangladesh' } },
    { d: 'infra', id: 'q22',
      en: 'How are you choosing the implementation partner?',
      bn: 'ইমপ্লিমেন্টেশন পার্টনার কীভাবে বাছাই করছেন?',
      o: [
        [0, 'Lowest price', 'সবচেয়ে কম দাম'],
        [1, 'A referral, no formal comparison', 'কারো রেফারেন্সে, আনুষ্ঠানিক তুলনা ছাড়া'],
        [2, 'Compared 2–3 vendors on price and demo', '২–৩টা ভেন্ডরকে দাম আর ডেমো দেখে তুলনা করেছি'],
        [3, 'Scored on method, industry references, team, support terms, then price', 'মেথড, একই ইন্ডাস্ট্রির রেফারেন্স, টিম আর সাপোর্টের শর্তে নম্বর দিয়ে, তারপর দাম']],
      flag: { en: 'Choosing on price alone. The cheapest quote usually excludes the work that decides success (data, training, hypercare).', bn: 'শুধু দাম দেখে বাছাই। সবচেয়ে সস্তা কোটেশনে সাধারণত সেই কাজগুলোই বাদ থাকে যেগুলো সাফল্য ঠিক করে (ডেটা, ট্রেনিং, হাইপারকেয়ার)।', link: '/lab/0049-odoo-partner-selection-bangladesh' } },
    { d: 'infra', id: 'q23',
      en: 'What is your internet & hardware situation at the sites that will use Odoo?',
      bn: 'যেসব সাইটে Odoo চলবে, সেখানে ইন্টারনেট আর হার্ডওয়্যারের অবস্থা কেমন?',
      o: [
        [0, 'Unreliable internet, shared or old PCs', 'ইন্টারনেট ভরসার অযোগ্য, পুরোনো বা ভাগাভাগি করা PC'],
        [1, 'Office is fine, factory/warehouse is weak', 'অফিসে ঠিক আছে, ফ্যাক্টরি বা ওয়্যারহাউসে দুর্বল'],
        [2, 'Decent everywhere, no backup link', 'সব জায়গায় মোটামুটি ভালো, ব্যাকআপ লাইন নেই'],
        [3, 'Reliable with a backup connection; devices/scanners planned', 'নির্ভরযোগ্য, ব্যাকআপ কানেকশনও আছে; ডিভাইস আর স্ক্যানারের পরিকল্পনা করা']],
      flag: { en: 'Weak connectivity at operational sites. Budget for a backup link and devices, or the warehouse will keep a paper system.', bn: 'অপারেশনের জায়গায় কানেকশন দুর্বল। ব্যাকআপ লাইন আর ডিভাইসের জন্য বাজেট রাখুন, নইলে ওয়্যারহাউস কাগজের সিস্টেমেই থেকে যাবে।', link: '/lab/0025-odoo-on-premise-vs-cloud-bangladesh' } },
    { d: 'infra', id: 'q24',
      en: 'What does the go-live plan look like?',
      bn: 'গো-লাইভের পরিকল্পনা কেমন?',
      o: [
        [0, 'Everything, everywhere, on one date that’s already fixed', 'সবকিছু, সব জায়গায়, একটা আগে থেকে ঠিক করা তারিখে'],
        [1, 'Not planned yet', 'এখনো পরিকল্পনা হয়নি'],
        [2, 'Phased, dates are rough', 'ধাপে ধাপে, তারিখ মোটামুটি ঠিক'],
        [3, 'Phased, with go/no-go criteria, cut-over plan and hypercare', 'ধাপে ধাপে, go/no-go শর্ত, কাট-ওভার প্ল্যান আর হাইপারকেয়ার সহ']],
      flag: { en: 'Big-bang go-live on a fixed date. Use go/no-go criteria instead of a calendar date.', bn: 'একটা নির্দিষ্ট তারিখে সবকিছু একসঙ্গে চালু। ক্যালেন্ডারের তারিখের বদলে go/no-go শর্ত ব্যবহার করুন।', link: '/lab/0028-odoo-implementation-roadmap-bangladesh' } },
    { d: 'infra', id: 'q25',
      en: 'Who will own the Odoo contract, licences and hosting access?',
      bn: 'Odoo-র চুক্তি, লাইসেন্স আর হোস্টিংয়ের অ্যাক্সেস কার নামে থাকবে?',
      o: [
        [0, 'The vendor. They handle everything', 'ভেন্ডরের। সব তারাই দেখে'],
        [1, 'Haven’t thought about it', 'এ নিয়ে ভাবা হয়নি'],
        [2, 'Our name, but the vendor holds the admin access', 'আমাদের নামে, তবে অ্যাডমিন অ্যাক্সেস ভেন্ডরের কাছে'],
        [3, 'Our name, our admin access, source code and backups in our control', 'আমাদের নামে, অ্যাডমিন অ্যাক্সেস আমাদের, সোর্স কোড আর ব্যাকআপও আমাদের নিয়ন্ত্রণে']],
      flag: { en: 'The vendor controls your system. If the relationship ends, you could lose access to your own data. Fix this in the contract.', bn: 'সিস্টেমের নিয়ন্ত্রণ ভেন্ডরের হাতে। সম্পর্ক শেষ হলে নিজের ডেটাতেই অ্যাক্সেস হারাতে পারেন। চুক্তিতেই এটা ঠিক করুন।', link: '/lab/0052-odoo-vendor-red-flags-bangladesh' } }
  ];

  var LEVELS = [
    { min: 80, id: 'ready', en: 'Ready to start', bn: 'শুরু করার জন্য প্রস্তুত',
      enD: 'Strong foundations. Focus on partner selection and a disciplined, phased plan.', bnD: 'ভিত্তি মজবুত। এখন পার্টনার বাছাই আর শৃঙ্খলাবদ্ধ, ধাপে ধাপে পরিকল্পনায় মনোযোগ দিন।' },
    { min: 60, id: 'gaps', en: 'Ready, with gaps to close', bn: 'প্রস্তুত, তবে কিছু ফাঁক পূরণ করতে হবে',
      enD: 'You can start, but close the red flags below during discovery, before signing a fixed scope.', bnD: 'শুরু করা যায়। তবে নির্দিষ্ট স্কোপে সই করার আগে, ডিসকভারির সময়েই নিচের লাল পতাকাগুলো মিটিয়ে নিন।' },
    { min: 40, id: 'prep', en: 'Prepare first', bn: 'আগে প্রস্তুতি নিন',
      enD: 'Spend 4–8 weeks on preparation (process maps, data clean-up, ownership) before buying. It will save you more than it costs.', bnD: 'কেনার আগে ৪–৮ সপ্তাহ প্রস্তুতিতে দিন (প্রসেস ম্যাপ, ডেটা পরিষ্কার, দায়িত্ব ঠিক করা)। এতে যা খরচ হবে, তার চেয়ে বেশি বাঁচবে।' },
    { min: 0, id: 'risk', en: 'High risk of failure', bn: 'ব্যর্থতার ঝুঁকি বেশি',
      enD: 'Starting now would likely repeat the classic ERP failure pattern. Fix ownership, goals and data first.', bnD: 'এখন শুরু করলে সম্ভবত ERP ব্যর্থতার পরিচিত গল্পটাই আবার ঘটবে। আগে মালিকানা, লক্ষ্য আর ডেটা ঠিক করুন।' }
  ];

  // Recommended next steps per weakest dimension
  var NEXT = {
    lead: { en: 'Write a one-page project charter: owner, goals with numbers, steering committee, decision SLA.', bn: 'এক পাতার প্রজেক্ট চার্টার লিখুন: মালিক, সংখ্যায় লক্ষ্য, স্টিয়ারিং কমিটি, সিদ্ধান্তের সময়সীমা।', link: '/lab/0047-odoo-project-charter-template' },
    proc: { en: 'Map your top 5 processes as-is (who, what, which document) before talking to any vendor.', bn: 'কোনো ভেন্ডরের সঙ্গে কথা বলার আগে প্রধান ৫টা প্রসেস এখন যেভাবে চলে সেভাবে ম্যাপ করুন (কে, কী, কোন ডকুমেন্ট)।', link: '/lab/0043-as-is-to-be-process-mapping-erp' },
    data: { en: 'Start data clean-up now: item master, customers, vendors, BOMs, and a full physical stock count.', bn: 'এখনই ডেটা পরিষ্কার শুরু করুন: আইটেম মাস্টার, কাস্টমার, ভেন্ডর, BOM, আর পুরো স্টক গণনা।', link: '/lab/0030-data-migration-checklist-odoo-bangladesh' },
    people: { en: 'Name your key users and superusers now, and protect their time in writing.', bn: 'মূল ইউজার আর সুপারইউজারদের এখনই ঠিক করুন, আর তাঁদের সময় লিখিতভাবে নিশ্চিত করুন।', link: '/lab/0102-building-in-house-odoo-superuser-team-bangladesh' },
    infra: { en: 'Build a 3-year TCO with contingency and score partners on method before price.', bn: 'কন্টিনজেন্সি সহ ৩ বছরের TCO তৈরি করুন, আর দামের আগে মেথড দেখে পার্টনারদের নম্বর দিন।', link: '/tools/odoo-cost-estimator/' }
  };

  function score(answers) {
    // answers: { q1: optionIndex, ... }
    var dims = {};
    DIMENSIONS.forEach(function (d) { dims[d.id] = { got: 0, max: 0, answered: 0 }; });
    var flags = [];
    var answered = 0;
    QUESTIONS.forEach(function (q) {
      var a = answers[q.id];
      dims[q.d].max += 3;
      if (a == null || a < 0 || a >= q.o.length) return;
      answered++;
      dims[q.d].answered++;
      var s = q.o[a][0];
      dims[q.d].got += s;
      if (q.flag && s <= (q.flagAt || 0)) flags.push({ q: q.id, d: q.d, flag: q.flag });
    });
    var got = 0, max = 0, dimPct = {};
    DIMENSIONS.forEach(function (d) {
      got += dims[d.id].got; max += dims[d.id].max;
      dimPct[d.id] = dims[d.id].max ? Math.round(dims[d.id].got / dims[d.id].max * 100) : 0;
    });
    var pct = max ? Math.round(got / max * 100) : 0;
    // Any 2+ red flags in leadership caps the verdict at "prep": weak ownership sinks projects regardless of other scores.
    var leadFlags = flags.filter(function (f) { return f.d === 'lead'; }).length;
    var level = LEVELS.filter(function (l) { return pct >= l.min; })[0];
    if (leadFlags >= 2 && (level.id === 'ready' || level.id === 'gaps')) level = LEVELS[2];
    var weakest = DIMENSIONS.slice().sort(function (a, b) { return dimPct[a.id] - dimPct[b.id]; });
    return { pct: pct, dims: dimPct, flags: flags, level: level, answered: answered, total: QUESTIONS.length, weakest: weakest.map(function (d) { return d.id; }) };
  }

  // Compact share encoding: one char per question ("0"-"3", "-" unanswered)
  function encode(answers) { return QUESTIONS.map(function (q) { var a = answers[q.id]; return a == null ? '-' : String(a); }).join(''); }
  function decode(str) {
    var out = {};
    if (!str) return out;
    QUESTIONS.forEach(function (q, i) { var c = str.charAt(i); if (/[0-3]/.test(c)) out[q.id] = Number(c); });
    return out;
  }

  return { DIMENSIONS: DIMENSIONS, QUESTIONS: QUESTIONS, LEVELS: LEVELS, NEXT: NEXT, score: score, encode: encode, decode: decode };
});
