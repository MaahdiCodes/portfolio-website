/* VAT & Mushak helper — Bangladesh (VAT & SD Act 2012, VAT & SD Rules 2016,
   as amended by the Finance Act 2026). Works out which registration, registers,
   invoices and returns apply to a business profile, and maps each to Odoo.
   Bilingual. Pure data/functions — window.MHCalc.mushak / module.exports. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.MHCalc = root.MHCalc || {}; root.MHCalc.mushak = api; }
})(typeof self !== 'undefined' ? self : this, function () {

  // Turnover thresholds (BDT) after the Finance Act 2026: enlistment is now
  // mandatory for any turnover up to 50 lakh (the 30 lakh "no obligation" band
  // was deleted); above 50 lakh, VAT registration is mandatory.
  var ENLIST_MAX = 5000000;

  var FORMS = {
    '2.1':  { en: 'Registration / enlistment application', bn: 'নিবন্ধন / তালিকাভুক্তির আবেদন', odoo: { en: 'One-time, filed on the e-VAT portal. Store your BIN on the company record.', bn: 'একবারই, e-VAT পোর্টালে জমা দিতে হয়। কোম্পানির রেকর্ডে BIN সংরক্ষণ করুন।' } },
    '4.3':  { en: 'Input-output coefficient declaration (price declaration)', bn: 'উপকরণ-উৎপাদ সহগ ঘোষণা (মূল্য ঘোষণা)', odoo: { en: 'Built from your BOMs plus a costing report. Accurate BOMs make this a report, not a spreadsheet.', bn: 'BOM আর কস্টিং রিপোর্ট থেকে তৈরি হয়। BOM সঠিক থাকলে এটা স্প্রেডশিটের কাজ নয়, একটা রিপোর্ট মাত্র।' } },
    '4.3.1':{ en: 'Input-output coefficient for VAT on actual value addition (new, Finance Act 2026)', bn: 'প্রকৃত মূল্য সংযোজনের ভিত্তিতে VAT-এর উপকরণ-উৎপাদ সহগ (নতুন, অর্থ আইন ২০২৬)', odoo: { en: 'Same data as 4.3, used when exempt/reduced-rate goods are later sold at 15% on value added.', bn: '4.3-এর মতোই ডেটা। অব্যাহতিপ্রাপ্ত বা হ্রাসকৃত হারের পণ্য পরে মূল্য সংযোজনের ওপর ১৫% হারে বিক্রির সময় লাগে।' } },
    '6.1':  { en: 'Purchase register', bn: 'ক্রয় হিসাব পুস্তক', odoo: { en: 'Report on vendor bills with tax grids per VAT rate.', bn: 'প্রতিটি VAT হারের জন্য ট্যাক্স গ্রিড সহ ভেন্ডর বিল থেকে রিপোর্ট।' } },
    '6.2':  { en: 'Sales register', bn: 'বিক্রয় হিসাব পুস্তক', odoo: { en: 'Report on customer invoices with tax grids per VAT/SD rate.', bn: 'প্রতিটি VAT/SD হারের জন্য ট্যাক্স গ্রিড সহ কাস্টমার ইনভয়েস থেকে রিপোর্ট।' } },
    '6.2.1':{ en: 'Purchase-sales register (traders)', bn: 'ক্রয়-বিক্রয় হিসাব পুস্তক (ব্যবসায়ী)', odoo: { en: 'Combined stock-movement + tax report per product.', bn: 'প্রতিটি পণ্যের স্টক মুভমেন্ট আর ট্যাক্সের সম্মিলিত রিপোর্ট।' } },
    '6.3':  { en: 'Tax invoice (every taxable supply)', bn: 'কর চালানপত্র (প্রতিটি করযোগ্য সরবরাহে)', odoo: { en: 'Customer invoice / delivery print format. The Finance Act 2026 lets you issue and keep 6.3 electronically from your ERP.', bn: 'কাস্টমার ইনভয়েস বা ডেলিভারির প্রিন্ট ফরম্যাট। অর্থ আইন ২০২৬ অনুযায়ী ERP থেকেই ইলেকট্রনিকভাবে 6.3 ইস্যু ও সংরক্ষণ করা যায়।' } },
    '6.4':  { en: 'Contractual production challan', bn: 'চুক্তিভিত্তিক উৎপাদনের চালানপত্র', odoo: { en: 'Subcontracting receipts/deliveries print format.', bn: 'সাবকন্ট্র্যাক্টিংয়ের রিসিপ্ট/ডেলিভারির প্রিন্ট ফরম্যাট।' } },
    '6.5':  { en: 'Transfer challan (between your own units/branches)', bn: 'হস্তান্তর চালানপত্র (নিজস্ব ইউনিট/শাখার মধ্যে)', odoo: { en: 'Inter-warehouse transfer print format.', bn: 'এক ওয়্যারহাউস থেকে আরেক ওয়্যারহাউসে ট্রান্সফারের প্রিন্ট ফরম্যাট।' } },
    '6.6':  { en: 'VAT deduction at source (VDS) certificate', bn: 'উৎসে কর কর্তন সনদপত্র (VDS)', odoo: { en: 'Withholding tax on vendor payments + certificate report.', bn: 'ভেন্ডর পেমেন্টে উইথহোল্ডিং ট্যাক্স আর সনদের রিপোর্ট।' } },
    '6.7':  { en: 'Credit note', bn: 'ক্রেডিট নোট', odoo: { en: 'Customer credit note print format with original 6.3 reference.', bn: 'মূল 6.3-এর রেফারেন্স সহ কাস্টমার ক্রেডিট নোটের প্রিন্ট ফরম্যাট।' } },
    '6.8':  { en: 'Debit note', bn: 'ডেবিট নোট', odoo: { en: 'Vendor refund / debit note print format.', bn: 'ভেন্ডর রিফান্ড বা ডেবিট নোটের প্রিন্ট ফরম্যাট।' } },
    '6.10': { en: 'Statement of purchases/sales above ৳2 lakh per invoice', bn: 'প্রতি চালানে ৳২ লাখের বেশি ক্রয়/বিক্রয়ের বিবরণী', odoo: { en: 'Filtered invoice report (amount > 200,000).', bn: 'ফিল্টার করা ইনভয়েস রিপোর্ট (পরিমাণ > ২,০০,০০০)।' } },
    '9.1':  { en: 'VAT return (manufacturers, service providers, traders claiming input credit)', bn: 'VAT রিটার্ন (উৎপাদক, সেবা প্রদানকারী, উপকরণ কর রেয়াত নেওয়া ব্যবসায়ী)', odoo: { en: 'Tax report mapped to return lines. SD reporting now sits inside the return too.', bn: 'রিটার্নের লাইনের সঙ্গে ম্যাপ করা ট্যাক্স রিপোর্ট। SD-র হিসাবও এখন রিটার্নের ভেতরেই।' } },
    '9.1.1':{ en: 'VAT return for registered traders (new, Finance Act 2026; check NBR guidance if you claim input credit)', bn: 'নিবন্ধিত ব্যবসায়ীদের VAT রিটার্ন (নতুন, অর্থ আইন ২০২৬; উপকরণ কর রেয়াত নিলে NBR-এর নির্দেশনা দেখে নিন)', odoo: { en: 'Same tax report, trader layout.', bn: 'একই ট্যাক্স রিপোর্ট, ব্যবসায়ীর ফরম্যাটে।' } },
    '9.2':  { en: 'Turnover tax return', bn: 'টার্নওভার কর রিটার্ন', odoo: { en: 'Simple sales total per period. Odoo Invoicing is enough.', bn: 'প্রতি মেয়াদের মোট বিক্রয়। শুধু Odoo Invoicing-ই যথেষ্ট।' } }
  };

  /* profile: { turnover: number BDT/yr, activities: ['mfg','trade','service','import','export'],
               withholding: bool (you are a VDS withholding entity), subcontract: bool,
               branches: bool, exemptResale: bool } */
  function evaluate(p) {
    var a = p.activities || [];
    var has = function (x) { return a.indexOf(x) !== -1; };
    var out = { regime: null, forms: [], notes: [] };
    var exportOnly = has('export') && a.length === 1;

    if (!exportOnly && p.turnover <= ENLIST_MAX && !has('import')) {
      out.regime = 'turnover';
      out.forms = ['2.1', '6.3', '9.2'];
      out.notes.push('turnover');
    } else {
      out.regime = 'vat';
      var f = ['2.1', '6.3', '6.7', '6.8', '6.10'];
      if (has('mfg')) f.push('4.3', '6.1', '6.2');
      if (has('mfg') && p.exemptResale) f.push('4.3.1');
      if (has('service') && !has('mfg')) f.push('6.1', '6.2');
      if (has('trade')) f.push('6.2.1');
      if (p.subcontract) f.push('6.4');
      if (p.branches) f.push('6.5');
      if (p.withholding) f.push('6.6');
      var traderOnly = has('trade') && !has('mfg') && !has('service');
      // Finance Act 2026 split the return: registered traders file 9.1.1.
      f.push(traderOnly ? '9.1.1' : '9.1');
      // de-duplicate, keep order
      out.forms = f.filter(function (x, i) { return f.indexOf(x) === i; });
      out.notes.push('quarterly');
      if (has('export')) out.notes.push('export');
      if (has('import')) out.notes.push('import');
      if (p.withholding) out.notes.push('vds');
    }
    if (p.turnover > ENLIST_MAX || has('import')) out.notes.push('bin');
    return out;
  }

  var NOTES = {
    turnover: { en: 'With turnover up to ৳50 lakh you must be enlisted (turnover tax). The Finance Act 2026 removed the old "up to ৳30 lakh, no obligation" band. Turnover tax is moving from 4% of turnover to a fixed amount set by NBR (capped at ৳2 lakh), with a four-month tax period and a yearly return.',
                bn: '৳৫০ লাখ পর্যন্ত টার্নওভার হলে তালিকাভুক্তি (টার্নওভার কর) বাধ্যতামূলক। অর্থ আইন ২০২৬ "৳৩০ লাখ পর্যন্ত কোনো বাধ্যবাধকতা নেই" অংশটি বাতিল করেছে। টার্নওভার কর টার্নওভারের ৪% থেকে NBR-নির্ধারিত নির্দিষ্ট অঙ্কে যাচ্ছে (সর্বোচ্চ ৳২ লাখ)। করমেয়াদ চার মাস, রিটার্ন বছরে একবার।' },
    quarterly: { en: 'Returns are now quarterly: file within 15 days after each three-month cycle. Each month, deposit one-third of the previous quarter’s tax within 15 days as an advance, then settle in the return. You can still choose to file monthly. Plan your month-end close around this.',
                 bn: 'রিটার্ন এখন ত্রৈমাসিক: প্রতি তিন মাসের চক্র শেষ হওয়ার ১৫ দিনের মধ্যে জমা দিতে হবে। প্রতি মাসে আগের ত্রৈমাসিকের করের এক-তৃতীয়াংশ ১৫ দিনের মধ্যে অগ্রিম জমা দিয়ে, রিটার্নে সমন্বয় করতে হবে। চাইলে মাসিক রিটার্নও দেওয়া যায়। মাস-শেষের ক্লোজিং এই হিসাবে সাজান।' },
    export: { en: 'Exports are zero-rated, but you still file returns and can claim input VAT credit or refund. Keep export 6.3s, bills of export and LC documents linked in the ERP.',
              bn: 'রপ্তানি শূন্য হারের, তবু রিটার্ন দিতে হয় আর উপকরণ কর রেয়াত বা ফেরত দাবি করা যায়। রপ্তানির 6.3, বিল অব এক্সপোর্ট আর LC-র কাগজ ERP-তে একসঙ্গে যুক্ত রাখুন।' },
    import: { en: 'VAT and AT paid at import are claimed as input credit through the bill of entry. Your ERP must carry the BoE number and tax amounts on the vendor bill or landed-cost record.',
              bn: 'আমদানিতে দেওয়া VAT আর AT বিল অব এন্ট্রির মাধ্যমে উপকরণ কর রেয়াত হিসেবে দাবি করা হয়। ERP-তে ভেন্ডর বিল বা ল্যান্ডেড কস্টের রেকর্ডে BoE নম্বর আর করের অঙ্ক থাকতে হবে।' },
    vds: { en: 'As a withholding entity you deduct VAT from supplier bills, deposit it by treasury challan, and issue Mushak 6.6. VAT on office rent must now be deposited separately through an automated challan.',
           bn: 'উৎসে কর্তনকারী সত্তা হিসেবে সরবরাহকারীর বিল থেকে VAT কেটে ট্রেজারি চালানে জমা দেবেন, আর Mushak 6.6 দেবেন। অফিস ভাড়ার VAT এখন স্বয়ংক্রিয় চালানের মাধ্যমে আলাদাভাবে জমা দিতে হয়।' },
    bin: { en: 'A valid BIN is now required to open or run a business bank account, take a loan, renew a trade licence, open an MFS merchant account, get utility connections and register vehicles.',
           bn: 'ব্যবসায়িক ব্যাংক হিসাব খোলা বা চালানো, ঋণ নেওয়া, ট্রেড লাইসেন্স নবায়ন, MFS মার্চেন্ট অ্যাকাউন্ট খোলা, গ্যাস-বিদ্যুৎ সংযোগ আর গাড়ি নিবন্ধনে এখন বৈধ BIN লাগবে।' }
  };

  /* VAT / SD calculation on a supply.
     mode 'exclusive': amount is value before taxes. 'inclusive': amount includes SD + VAT. */
  function vat(amount, vatPct, sdPct, mode, vdsPct) {
    var v = Number(vatPct) / 100, s = Number(sdPct || 0) / 100, A = Number(amount) || 0;
    var base = mode === 'inclusive' ? A / ((1 + s) * (1 + v)) : A;
    var sd = base * s;
    var vatAmt = (base + sd) * v;
    var total = base + sd + vatAmt;
    var vds = vatAmt * (Number(vdsPct) || 0) / 100;
    return { base: base, sd: sd, vat: vatAmt, total: total, vds: vds, payableToSupplier: total - vds };
  }

  return { ENLIST_MAX: ENLIST_MAX, FORMS: FORMS, NOTES: NOTES, evaluate: evaluate, vat: vat };
});
