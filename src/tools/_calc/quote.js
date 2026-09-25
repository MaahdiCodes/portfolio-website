/* Odoo implementation quote checker — Bangladesh. Bilingual.
   A checklist of what a complete quote should cover, weighted by how often the
   omission turns into a change request, with typical BDT cost if bought later.
   Price benchmark uses the same size bands as the Odoo Cost Estimator. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.MHCalc = root.MHCalc || {}; root.MHCalc.quote = api; }
})(typeof self !== 'undefined' ? self : this, function () {

  var GROUPS = [
    { id: 'scope', en: 'Scope & method', bn: 'স্কোপ ও পদ্ধতি' },
    { id: 'data', en: 'Data', bn: 'ডেটা' },
    { id: 'bd', en: 'Bangladesh compliance', bn: 'বাংলাদেশের কমপ্লায়েন্স' },
    { id: 'people', en: 'Training & testing', bn: 'ট্রেনিং ও টেস্টিং' },
    { id: 'live', en: 'Go-live & support', bn: 'গো-লাইভ ও সাপোর্ট' },
    { id: 'contract', en: 'Commercial & contract', bn: 'বাণিজ্যিক শর্ত ও চুক্তি' }
  ];

  // w: 3 critical, 2 important, 1 good practice. cost: [low, high] BDT if bought later (0 = contract risk, not cost)
  var ITEMS = [
    { g: 'scope', id: 'discovery', w: 3, cost: [150000, 400000],
      en: 'A paid discovery / gap-analysis phase with a written deliverable', bn: 'লিখিত ডেলিভারেবল সহ পেইড ডিসকভারি বা গ্যাপ অ্যানালাইসিস ধাপ',
      q: { en: 'What exactly do we receive at the end of discovery, and can we stop there if we disagree with the design?', bn: 'ডিসকভারির শেষে ঠিক কী ডকুমেন্ট পাব? ডিজাইনে একমত না হলে কি সেখানেই থামতে পারব?' } },
    { g: 'scope', id: 'modules', w: 3, cost: [0, 0],
      en: 'Modules and processes listed explicitly (not just "ERP implementation")', bn: 'মডিউল আর প্রসেসগুলো আলাদা করে লেখা (শুধু "ERP বাস্তবায়ন" নয়)',
      q: { en: 'Please list every process in scope per module, and what is explicitly out of scope.', bn: 'প্রতিটি মডিউলে কোন কোন প্রসেস স্কোপে আছে, আর কোনগুলো স্পষ্টভাবে স্কোপের বাইরে, তার তালিকা দিন।' } },
    { g: 'scope', id: 'custom', w: 3, cost: [200000, 800000],
      en: 'Customisations listed one by one with effort, not "as required"', bn: 'প্রতিটি কাস্টমাইজেশন আলাদা করে, সময়সহ লেখা ("প্রয়োজন অনুযায়ী" নয়)',
      q: { en: 'Which requirements need custom development, how many days each, and who owns the source code?', bn: 'কোন রিকোয়ারমেন্টে কাস্টম ডেভেলপমেন্ট লাগবে, প্রতিটিতে কত দিন, আর সোর্স কোডের মালিক কে হবে?' } },
    { g: 'scope', id: 'reports', w: 2, cost: [80000, 250000],
      en: 'Custom reports and print formats counted (invoice, challan, delivery, payslip)', bn: 'কাস্টম রিপোর্ট আর প্রিন্ট ফরম্যাটের সংখ্যা উল্লেখ (ইনভয়েস, চালান, ডেলিভারি, পে-স্লিপ)',
      q: { en: 'How many reports and print formats are included? Please name them.', bn: 'কয়টি রিপোর্ট আর প্রিন্ট ফরম্যাট অন্তর্ভুক্ত? নামসহ জানান।' } },
    { g: 'scope', id: 'integrations', w: 2, cost: [100000, 400000],
      en: 'Integrations named (bank, attendance device, e-commerce, SMS, courier)', bn: 'ইন্টিগ্রেশনের নাম উল্লেখ (ব্যাংক, হাজিরা ডিভাইস, ই-কমার্স, SMS, কুরিয়ার)',
      q: { en: 'Which integrations are included, who provides the API access, and what happens if the third party changes its API?', bn: 'কোন ইন্টিগ্রেশনগুলো অন্তর্ভুক্ত, API অ্যাক্সেস কে দেবে, আর তৃতীয় পক্ষ API বদলালে কী হবে?' } },

    { g: 'data', id: 'migration', w: 3, cost: [150000, 500000],
      en: 'Data migration: which objects, how many years, who cleans the data', bn: 'ডেটা মাইগ্রেশন: কোন ডেটা, কত বছরের, পরিষ্কার করবে কে',
      q: { en: 'Which master and opening data will you migrate, in how many trial loads, and who is responsible for cleansing?', bn: 'কোন মাস্টার আর ওপেনিং ডেটা মাইগ্রেট করবেন, কয়বার ট্রায়াল লোড হবে, আর পরিষ্কারের দায়িত্ব কার?' } },
    { g: 'data', id: 'opening', w: 2, cost: [50000, 150000],
      en: 'Opening balances and stock reconciliation at cut-over', bn: 'কাট-ওভারের সময় ওপেনিং ব্যালেন্স আর স্টক মেলানো',
      q: { en: 'Who reconciles opening stock and ledger balances against the old system at cut-over?', bn: 'কাট-ওভারে পুরোনো সিস্টেমের সঙ্গে ওপেনিং স্টক আর লেজার ব্যালেন্স কে মেলাবে?' } },
    { g: 'data', id: 'boms', w: 1, cost: [50000, 200000],
      en: 'Help building BOMs / routings (manufacturers)', bn: 'BOM বা রাউটিং তৈরিতে সহায়তা (উৎপাদকদের জন্য)',
      q: { en: 'Is BOM and routing set-up included, or do we have to supply them ready to import?', bn: 'BOM আর রাউটিং সেটআপ কি অন্তর্ভুক্ত, নাকি আমাদেরই ইমপোর্টের জন্য তৈরি করে দিতে হবে?' } },

    { g: 'bd', id: 'mushak', w: 3, cost: [80000, 200000],
      en: 'Mushak 6.3 / 6.1 / 6.2 / 9.1 output (and quarterly return data)', bn: 'Mushak 6.3 / 6.1 / 6.2 / 9.1 আউটপুট (আর ত্রৈমাসিক রিটার্নের ডেটা)',
      q: { en: 'Show us the Mushak 6.3 and the 9.1 data from a live client. Is the Finance Act 2026 quarterly return covered?', bn: 'একজন লাইভ ক্লায়েন্টের Mushak 6.3 আর 9.1-এর ডেটা দেখান। অর্থ আইন ২০২৬-এর ত্রৈমাসিক রিটার্ন কি কভার করা আছে?' } },
    { g: 'bd', id: 'vds', w: 2, cost: [50000, 100000],
      en: 'VDS / TDS withholding and certificates', bn: 'VDS / TDS উৎসে কর্তন আর সনদ',
      q: { en: 'How are VDS and TDS deducted on vendor payments, and can Odoo print Mushak 6.6 and TDS certificates?', bn: 'ভেন্ডর পেমেন্টে VDS আর TDS কীভাবে কাটা হবে? Odoo কি Mushak 6.6 আর TDS সনদ প্রিন্ট করতে পারবে?' } },
    { g: 'bd', id: 'payroll', w: 2, cost: [150000, 400000],
      en: 'Bangladesh payroll rules (wage-board grades, OT, festival bonus, tax)', bn: 'বাংলাদেশের পে-রোল নিয়ম (ওয়েজ বোর্ডের গ্রেড, OT, উৎসব বোনাস, কর)',
      q: { en: 'Which payroll rules are configured: grades, increments, OT at basic÷208×2, festival bonus, salary tax, bank transfer file?', bn: 'কোন পে-রোল নিয়মগুলো কনফিগার হবে: গ্রেড, ইনক্রিমেন্ট, basic÷208×2 হারে OT, উৎসব বোনাস, বেতনের কর, ব্যাংক ট্রান্সফার ফাইল?' } },
    { g: 'bd', id: 'lc', w: 1, cost: [80000, 500000],
      en: 'LC / import-export workflow and landed costs (if you trade internationally)', bn: 'LC / আমদানি-রপ্তানি ওয়ার্কফ্লো আর ল্যান্ডেড কস্ট (আন্তর্জাতিক বাণিজ্য থাকলে)',
      q: { en: 'How will LCs, bills of entry and landed costs (CD/RD/SD) be tracked against purchase orders?', bn: 'পারচেজ অর্ডারের সঙ্গে LC, বিল অব এন্ট্রি আর ল্যান্ডেড কস্ট (CD/RD/SD) কীভাবে ট্র্যাক হবে?' } },

    { g: 'people', id: 'training', w: 3, cost: [100000, 300000],
      en: 'Role-based end-user training (hours, batches, language)', bn: 'দায়িত্বভিত্তিক এন্ড-ইউজার ট্রেনিং (ঘণ্টা, ব্যাচ, ভাষা)',
      q: { en: 'How many training hours per role, how many batches, in Bangla or English, and with what materials?', bn: 'প্রতিটি দায়িত্বে কত ঘণ্টা ট্রেনিং, কয়টি ব্যাচ, বাংলায় না ইংরেজিতে, আর কী কী উপকরণসহ?' } },
    { g: 'people', id: 'uat', w: 3, cost: [80000, 200000],
      en: 'UAT with written test scripts and formal sign-off', bn: 'লিখিত টেস্ট স্ক্রিপ্ট আর আনুষ্ঠানিক সাইন-অফ সহ UAT',
      q: { en: 'Who writes the UAT scripts, how many cycles are included, and what are the exit criteria?', bn: 'UAT স্ক্রিপ্ট কে লিখবে, কয়টি সাইকেল অন্তর্ভুক্ত, আর শেষ করার শর্ত কী?' } },
    { g: 'people', id: 'superuser', w: 2, cost: [60000, 150000],
      en: 'Superuser / admin training so you are not dependent on the vendor', bn: 'সুপারইউজার / অ্যাডমিন ট্রেনিং, যাতে ভেন্ডরের ওপর নির্ভর করতে না হয়',
      q: { en: 'Will our superusers be trained to configure users, rights, products and reports themselves?', bn: 'আমাদের সুপারইউজাররা কি নিজেরাই ইউজার, অ্যাক্সেস রাইটস, প্রোডাক্ট আর রিপোর্ট কনফিগার করতে শিখবেন?' } },

    { g: 'live', id: 'cutover', w: 2, cost: [50000, 150000],
      en: 'Cut-over plan and go / no-go criteria', bn: 'কাট-ওভার প্ল্যান আর go / no-go শর্ত',
      q: { en: 'What are the go/no-go criteria, and what is the rollback plan if go-live fails?', bn: 'go/no-go শর্তগুলো কী, আর গো-লাইভ ব্যর্থ হলে ফিরে যাওয়ার পরিকল্পনা কী?' } },
    { g: 'live', id: 'hypercare', w: 3, cost: [150000, 400000],
      en: 'Hypercare: on-site / priority support for 4–8 weeks after go-live', bn: 'হাইপারকেয়ার: গো-লাইভের পর ৪–৮ সপ্তাহ অন-সাইট বা অগ্রাধিকারভিত্তিক সাপোর্ট',
      q: { en: 'How many weeks of hypercare are included, on-site or remote, and with what response times?', bn: 'কত সপ্তাহের হাইপারকেয়ার অন্তর্ভুক্ত, অন-সাইট না রিমোট, আর রেসপন্স টাইম কত?' } },
    { g: 'live', id: 'amc', w: 2, cost: [200000, 500000],
      en: 'Annual support (AMC) price, SLA and what counts as a "bug" vs a change', bn: 'বার্ষিক সাপোর্টের (AMC) দাম, SLA, আর কোনটা "বাগ" আর কোনটা পরিবর্তন',
      q: { en: 'What does the annual support cost after year 1, what is the SLA, and how do you define a bug vs a change request?', bn: '১ম বছরের পর বার্ষিক সাপোর্টের খরচ কত, SLA কী, আর বাগ আর চেঞ্জ রিকোয়েস্ট কীভাবে আলাদা করেন?' } },
    { g: 'live', id: 'upgrade', w: 1, cost: [150000, 600000],
      en: 'Version-upgrade policy for customisations', bn: 'কাস্টমাইজেশনের ভার্সন আপগ্রেড নীতি',
      q: { en: 'When Odoo releases a new version, who pays to migrate our custom modules?', bn: 'Odoo নতুন ভার্সন ছাড়লে আমাদের কাস্টম মডিউল মাইগ্রেটের খরচ কে দেবে?' } },

    { g: 'contract', id: 'licence', w: 2, cost: [0, 0],
      en: 'Odoo licence shown separately, in your company’s name', bn: 'Odoo লাইসেন্স আলাদাভাবে দেখানো, আপনার কোম্পানির নামে',
      q: { en: 'Is the Odoo Enterprise subscription in our name, bought at Odoo’s published price, and shown separately from your fee?', bn: 'Odoo Enterprise সাবস্ক্রিপশন কি আমাদের নামে, Odoo-র প্রকাশিত দামে, আর আপনার ফি থেকে আলাদা করে দেখানো?' } },
    { g: 'contract', id: 'milestones', w: 2, cost: [0, 0],
      en: 'Payments tied to milestones / sign-offs, not dates', bn: 'পেমেন্ট তারিখে নয়, মাইলস্টোন বা সাইন-অফের সঙ্গে যুক্ত',
      q: { en: 'Can payments be linked to signed-off milestones (e.g. UAT sign-off, go-live) rather than calendar dates?', bn: 'পেমেন্ট কি ক্যালেন্ডারের তারিখের বদলে সাইন-অফ করা মাইলস্টোনের সঙ্গে যুক্ত করা যায় (যেমন UAT সাইন-অফ, গো-লাইভ)?' } },
    { g: 'contract', id: 'cr', w: 2, cost: [0, 0],
      en: 'Change-request rate card (daily rate) agreed upfront', bn: 'চেঞ্জ রিকোয়েস্টের রেট কার্ড (দৈনিক রেট) আগে থেকে ঠিক করা',
      q: { en: 'What is your daily rate for change requests, and is it fixed for the project duration?', bn: 'চেঞ্জ রিকোয়েস্টের জন্য আপনার দৈনিক রেট কত, আর পুরো প্রজেক্টের সময় কি সেটা একই থাকবে?' } },
    { g: 'contract', id: 'access', w: 3, cost: [0, 0],
      en: 'You own admin access, database backups and custom source code', bn: 'অ্যাডমিন অ্যাক্সেস, ডেটাবেস ব্যাকআপ আর কাস্টম সোর্স কোড আপনার মালিকানায়',
      q: { en: 'Confirm in the contract that we hold admin access, receive backups, and own the source code of all custom modules.', bn: 'চুক্তিতে নিশ্চিত করুন যে অ্যাডমিন অ্যাক্সেস আমাদের, ব্যাকআপ আমরা পাব, আর সব কাস্টম মডিউলের সোর্স কোডের মালিক আমরা।' } },
    { g: 'contract', id: 'team', w: 1, cost: [0, 0],
      en: 'Named team (functional lead, developer) and their Odoo certification', bn: 'নির্দিষ্ট টিম (ফাংশনাল লিড, ডেভেলপার) আর তাঁদের Odoo সার্টিফিকেশন',
      q: { en: 'Who exactly will work on our project, what are their certifications, and can they be replaced without our consent?', bn: 'আমাদের প্রজেক্টে ঠিক কারা কাজ করবেন, তাঁদের সার্টিফিকেশন কী, আর আমাদের সম্মতি ছাড়া কি তাঁদের বদলানো যাবে?' } }
  ];

  // Implementation fee bands (BDT) by users — same as the cost estimator (before industry multipliers).
  var BANDS = {
    '1-10': [200000, 500000], '11-25': [500000, 1200000], '26-50': [1200000, 2500000],
    '51-100': [2500000, 4500000], '101-200': [4500000, 8000000], '200+': [8000000, 15000000]
  };
  var INDUSTRY = { trading: 1.0, services: 0.95, manufacturing: 1.15, textile: 1.25, rmg: 1.3, pharma: 1.5 };

  function check(state) {
    // state: { ticked: {id:true}, price: number, band: '26-50', industry: 'manufacturing' }
    var ticked = state.ticked || {};
    var got = 0, max = 0, missing = [], hiddenLow = 0, hiddenHigh = 0, criticalMissing = 0;
    ITEMS.forEach(function (it) {
      max += it.w;
      if (ticked[it.id]) { got += it.w; return; }
      missing.push(it);
      hiddenLow += it.cost[0]; hiddenHigh += it.cost[1];
      if (it.w === 3) criticalMissing++;
    });
    missing.sort(function (a, b) { return b.w - a.w; });
    var band = BANDS[state.band], mult = INDUSTRY[state.industry] || 1, price = Number(state.price) || 0, position = null, range = null;
    if (band && price > 0) {
      range = [band[0] * mult, band[1] * mult];
      position = price < range[0] * 0.8 ? 'low' : price > range[1] * 1.2 ? 'high' : 'in';
    }
    return {
      coverage: max ? Math.round(got / max * 100) : 0, missing: missing, criticalMissing: criticalMissing,
      hidden: [hiddenLow, hiddenHigh], range: range, position: position,
      realistic: price > 0 ? [price + hiddenLow, price + hiddenHigh] : null
    };
  }

  return { GROUPS: GROUPS, ITEMS: ITEMS, BANDS: BANDS, INDUSTRY: INDUSTRY, check: check };
});
