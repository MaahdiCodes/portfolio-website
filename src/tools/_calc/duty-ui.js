/* UI for the import duty calculator (shared by EN + BN pages). */
(function () {
  var D = MHCalc.duty, L = MH.isBn ? 'bn' : 'en', $ = function (id) { return document.getElementById(id); };
  var T = {
    en: { cif: 'CIF value', land: 'Landing charge (1% of CIF)', av: 'Assessable value (AV)', cd: 'Customs duty (CD)', rd: 'Regulatory duty (RD)',
          sd: 'Supplementary duty (SD)', vat: 'VAT', ait: 'Advance income tax (AIT)', at: 'Advance tax (AT)', taxes: 'Total taxes at import',
          sunk: 'sunk cost', rec: 'creditable in VAT return', adj: 'adjustable against income tax', notrec: 'not recoverable (not VAT-registered)',
          perUnit: 'Landed cost per unit', noQty: 'Enter quantity for a per-unit cost', uplift: 'over CIF' },
    bn: { cif: 'CIF মূল্য', land: 'ল্যান্ডিং চার্জ (CIF-এর ১%)', av: 'শুল্কায়নযোগ্য মূল্য (AV)', cd: 'কাস্টমস ডিউটি (CD)', rd: 'রেগুলেটরি ডিউটি (RD)',
          sd: 'সম্পূরক শুল্ক (SD)', vat: 'VAT', ait: 'অগ্রিম আয়কর (AIT)', at: 'অগ্রিম কর (AT)', taxes: 'আমদানিতে মোট কর',
          sunk: 'ফেরতযোগ্য নয়', rec: 'VAT রিটার্নে রেয়াত নেওয়া যায়', adj: 'আয়করের সঙ্গে সমন্বয়যোগ্য', notrec: 'ফেরতযোগ্য নয় (VAT নিবন্ধিত নন)',
          perUnit: 'প্রতি ইউনিট ল্যান্ডেড কস্ট', noQty: 'প্রতি ইউনিটের খরচ দেখতে পরিমাণ দিন', uplift: 'CIF-এর ওপর' }
  }[L];
  var FIELDS = ['fob', 'freight', 'insurance', 'fx', 'qty', 'cd', 'rd', 'sd', 'vat', 'ait', 'at', 'localCosts'];

  function read() {
    var o = {}; FIELDS.forEach(function (f) { o[f] = MH.val('d-' + f); });
    o.vatRegistered = $('d-vatreg').checked;
    return o;
  }
  function row(label, v, note, cls) {
    return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + label + (note ? '<small>' + note + '</small>' : '') + '</td><td class="num">' + v + '</td></tr>';
  }
  function render() {
    var i = read(), r = D.calculate(i), tk = MH.bdtExact;
    var vatNote = i.vatRegistered ? T.rec : T.notrec;
    $('d-table').innerHTML =
      row(T.cif, tk(r.cif)) + row(T.land, tk(r.landing)) + row(T.av, tk(r.av), '', 'sub') +
      row(T.cd + ' · ' + MH.pct(i.cd), tk(r.cd), T.sunk) +
      (i.rd ? row(T.rd + ' · ' + MH.pct(i.rd), tk(r.rd), T.sunk) : '') +
      (i.sd ? row(T.sd + ' · ' + MH.pct(i.sd), tk(r.sd), T.sunk) : '') +
      row(T.vat + ' · ' + MH.pct(i.vat), tk(r.vat), vatNote) +
      row(T.ait + ' · ' + MH.pct(i.ait), tk(r.ait), T.adj) +
      (i.at ? row(T.at + ' · ' + MH.pct(i.at), tk(r.at), vatNote) : '') +
      row(T.taxes + ' · TTI ' + MH.pct(r.tti), tk(r.taxes), '', 'total');
    MH.setText('d-landed', MH.bdt(r.landed));
    MH.setText('d-landed-sub', MH.pct(r.landedUplift, 1) + ' ' + T.uplift + ' · ' + (r.perUnit != null ? T.perUnit + ': ' + tk(Math.round(r.perUnit * 100) / 100) : T.noQty));
    MH.setText('d-cash', MH.bdt(r.cashAtPort));
    MH.setText('d-sunk', MH.bdt(r.sunk));
    MH.setText('d-rec', MH.bdt(r.recoverable + r.adjustable));
  }
  function applyPreset(k) {
    var p = D.PRESETS[k]; if (!p) return;
    Object.keys(p).forEach(function (f) { $('d-' + f).value = p[f]; });
    render();
  }
  document.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('[data-preset]').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      applyPreset(b.getAttribute('data-preset'));
    });
  });
  var p = MH.readParams();
  FIELDS.forEach(function (f) { if (p[f] != null && isFinite(parseFloat(p[f]))) $('d-' + f).value = parseFloat(p[f]); });
  if (p.vr === '0') $('d-vatreg').checked = false;
  $('duty-form').addEventListener('input', render);
  $('duty-form').addEventListener('change', render);
  $('d-share').addEventListener('click', function () { var o = read(); o.vr = o.vatRegistered ? '1' : '0'; delete o.vatRegistered; MH.copyLink(this, MH.buildLink(o)); });
  render();
})();
