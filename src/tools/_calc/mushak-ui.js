/* UI for the VAT & Mushak helper (shared by EN + BN pages). */
(function () {
  var M = MHCalc.mushak, L = MH.isBn ? 'bn' : 'en', $ = function (id) { return document.getElementById(id); };
  var T = {
    en: { vat: 'VAT registration (15% standard, input credit)', turnover: 'Turnover tax enlistment', form: 'Mushak', inOdoo: 'In Odoo',
          base: 'Value before tax', sd: 'Supplementary duty', vatl: 'VAT', total: 'Invoice total (Mushak 6.3)', vds: 'VDS withheld by buyer', pay: 'Buyer pays supplier' },
    bn: { vat: 'VAT নিবন্ধন (১৫% মানক হার, উপকরণ কর রেয়াত)', turnover: 'টার্নওভার করে তালিকাভুক্তি', form: 'মূসক', inOdoo: 'Odoo-তে',
          base: 'করের আগের মূল্য', sd: 'সম্পূরক শুল্ক', vatl: 'VAT', total: 'চালানের মোট (Mushak 6.3)', vds: 'ক্রেতার উৎসে কর্তন (VDS)', pay: 'ক্রেতা সরবরাহকারীকে দেবেন' }
  }[L];

  function setMode(m) {
    document.querySelectorAll('[data-mode]').forEach(function (b) { var on = b.getAttribute('data-mode') === m; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    $('mode-forms').hidden = m !== 'forms'; $('mode-calc').hidden = m !== 'calc';
  }
  document.querySelectorAll('[data-mode]').forEach(function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); }); });

  function renderForms() {
    var acts = Array.prototype.map.call(document.querySelectorAll('input[name="act"]:checked'), function (e) { return e.value; });
    var r = M.evaluate({
      turnover: MH.val('m-turnover'), activities: acts, withholding: $('m-vds').checked,
      subcontract: $('m-sub').checked, branches: $('m-branch').checked, exemptResale: $('m-exempt').checked
    });
    MH.setText('m-regime', r.regime === 'vat' ? T.vat : T.turnover);
    MH.setText('m-count', r.forms.length + (L === 'bn' ? 'টি ফর্ম / রেজিস্টার' : ' forms & registers'));
    $('m-forms').innerHTML = r.forms.map(function (k) {
      var f = M.FORMS[k];
      return '<tr><td><span class="tl-pill good">' + T.form + ' ' + k + '</span></td><td>' + MH.esc(f[L]) + '<small>' + T.inOdoo + ': ' + MH.esc(f.odoo[L]) + '</small></td></tr>';
    }).join('');
    $('m-notes').innerHTML = r.notes.map(function (n) { return '<li>' + MH.esc(M.NOTES[n][L]) + '</li>'; }).join('');
  }

  function renderCalc() {
    var mode = document.querySelector('input[name="incl"]:checked').value;
    var r = M.vat(MH.val('c-amount'), MH.val('c-vat'), MH.val('c-sd'), mode, $('c-vdson').checked ? MH.val('c-vds') : 0);
    var tk = function (v) { return '৳' + MH.num(Math.round(v * 100) / 100, 2); };
    MH.setText('c-total', tk(r.total));
    MH.setText('c-vatamt', (L === 'bn' ? 'এর মধ্যে VAT: ' : 'of which VAT: ') + tk(r.vat));
    $('c-table').innerHTML =
      '<tr><td>' + T.base + '</td><td class="num">' + tk(r.base) + '</td></tr>' +
      (r.sd ? '<tr><td>' + T.sd + '</td><td class="num">' + tk(r.sd) + '</td></tr>' : '') +
      '<tr><td>' + T.vatl + '</td><td class="num">' + tk(r.vat) + '</td></tr>' +
      '<tr class="sub"><td>' + T.total + '</td><td class="num">' + tk(r.total) + '</td></tr>' +
      (r.vds ? '<tr><td>' + T.vds + '</td><td class="num">− ' + tk(r.vds) + '</td></tr><tr class="total"><td>' + T.pay + '</td><td class="num">' + tk(r.payableToSupplier) + '</td></tr>' : '');
  }

  $('forms-form').addEventListener('change', renderForms);
  $('forms-form').addEventListener('input', renderForms);
  $('calc-form').addEventListener('change', renderCalc);
  $('calc-form').addEventListener('input', renderCalc);
  document.querySelectorAll('[data-rate]').forEach(function (b) {
    b.addEventListener('click', function () { $('c-vat').value = b.getAttribute('data-rate'); renderCalc(); });
  });
  if (MH.readParams().mode === 'calc') setMode('calc');
  renderForms(); renderCalc();
})();
