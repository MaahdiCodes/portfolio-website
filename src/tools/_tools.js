/* Shared runtime for mhasan.me tools: theme toggle, number formatting,
   share links, print-to-PDF. Exposes window.MH. No dependencies. */
(function () {
  var root = document.documentElement;
  var isBn = (root.getAttribute('lang') || '').indexOf('bn') === 0;

  // ----- Theme toggle (same cycle as the rest of the site) -----
  function initTheme() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var order = ['dark-navy', 'dark', 'light'];
    function current() { return root.getAttribute('data-theme') || 'dark'; }
    btn.addEventListener('click', function () {
      var next = order[(order.indexOf(current()) + 1) % order.length];
      if (next === 'dark') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', next);
      try { localStorage.setItem('mh-theme', next); } catch (e) {}
    });
  }

  // ----- Formatting -----
  function trimZeros(s) { return s.replace(/\.?0+$/, ''); }
  function num(n, digits) {
    if (!isFinite(n)) return '—';
    return Number(n).toLocaleString('en-IN', { maximumFractionDigits: digits == null ? 0 : digits, minimumFractionDigits: 0 });
  }
  // ৳ with lakh / crore for large values (how Bangladeshi finance teams read numbers)
  function bdt(n, opts) {
    opts = opts || {};
    if (!isFinite(n)) return '—';
    var neg = n < 0; n = Math.abs(n);
    var out;
    if (!opts.exact && n >= 10000000) out = '৳' + trimZeros((n / 10000000).toFixed(2)) + (isBn ? ' কোটি' : ' crore');
    else if (!opts.exact && n >= 100000) out = '৳' + trimZeros((n / 100000).toFixed(2)) + (isBn ? ' লাখ' : ' lakh');
    else out = '৳' + num(Math.round(n));
    return (neg ? '−' : '') + out;
  }
  function bdtExact(n) { return bdt(n, { exact: true }); }
  function pct(n, digits) { return isFinite(n) ? trimZeros(Number(n).toFixed(digits == null ? 1 : digits)) + '%' : '—'; }
  function val(id) { var el = document.getElementById(id); var v = el ? parseFloat(String(el.value).replace(/,/g, '')) : NaN; return isFinite(v) ? v : 0; }
  function setText(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  // ----- URL state (shareable links) -----
  function readParams() { var o = {}; new URLSearchParams(location.search).forEach(function (v, k) { o[k] = v; }); return o; }
  function buildLink(obj) {
    var p = new URLSearchParams();
    Object.keys(obj).forEach(function (k) { if (obj[k] !== '' && obj[k] != null) p.set(k, obj[k]); });
    return location.origin + location.pathname + '?' + p.toString();
  }
  function copyLink(btn, url) {
    var label = btn.textContent;
    function done() {
      btn.textContent = isBn ? 'লিংক কপি হয়েছে ✓' : 'Link copied ✓';
      btn.classList.add('done');
      setTimeout(function () { btn.textContent = label; btn.classList.remove('done'); }, 2200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () { window.prompt(isBn ? 'এই লিংকটি কপি করুন:' : 'Copy this link:', url); });
    } else { window.prompt(isBn ? 'এই লিংকটি কপি করুন:' : 'Copy this link:', url); }
  }

  // ----- Print / Save as PDF -----
  function printReport() {
    var ph = document.getElementById('print-head');
    if (ph) {
      var d = new Date();
      var date = d.toLocaleDateString(isBn ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      ph.innerHTML = '<b>' + esc(document.title.split('|')[0].trim()) + '</b><br>' +
        (isBn ? 'তৈরি: ' : 'Generated: ') + date + ' · mhasan.me' + location.pathname +
        '<br>' + (isBn ? 'এটি একটি আনুমানিক হিসাব — চূড়ান্ত সিদ্ধান্তের আগে যাচাই করুন।' : 'Indicative figures — verify before making final decisions.');
    }
    window.print();
  }

  // Inputs marked data-money get a live "= ৳3 crore" readout underneath.
  function moneyHints() {
    document.querySelectorAll('input[data-money]').forEach(function (inp) {
      var hint = document.createElement('span');
      hint.className = 'tl-money';
      inp.insertAdjacentElement('afterend', hint);
      function upd() { var v = parseFloat(inp.value); hint.textContent = isFinite(v) && v >= 100000 ? '= ' + bdt(v) : ''; }
      inp.addEventListener('input', upd); inp.addEventListener('change', upd); upd();
      inp._mhMoney = upd;
    });
  }
  function refreshMoney() { document.querySelectorAll('input[data-money]').forEach(function (i) { if (i._mhMoney) i._mhMoney(); }); }

  function wireCommon() {
    initTheme();
    moneyHints();
    document.querySelectorAll('[data-print]').forEach(function (b) { b.addEventListener('click', printReport); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireCommon);
  else wireCommon();

  window.MH = {
    isBn: isBn, num: num, bdt: bdt, bdtExact: bdtExact, pct: pct, val: val, setText: setText, esc: esc,
    refreshMoney: refreshMoney, readParams: readParams, buildLink: buildLink, copyLink: copyLink, printReport: printReport
  };
})();
