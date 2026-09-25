/* UI for the Odoo quote checker (shared by EN + BN pages). */
(function () {
  var Q = MHCalc.quote, L = MH.isBn ? 'bn' : 'en', $ = function (id) { return document.getElementById(id); };
  var T = {
    en: { crit: 'Critical', imp: 'Important', good: 'Good practice', low: 'Well below the usual range. Check what has been left out.', high: 'Above the usual range. Fine if the scope is genuinely bigger, so ask for the breakdown.',
          in: 'Within the usual range for this size and industry.', range: 'Usual implementation range', none: 'Nothing critical missing. This is a well-scoped quote.',
          copied: 'Questions copied ✓', copy: 'Copy questions for the vendor', ask: 'Ask', hidden: 'Typical cost if added later', contract: 'Contract risk',
          subject: 'Questions on your Odoo implementation proposal', noPrice: 'Enter the quoted fee to compare it with the market', risk: function (n) { return n + ' critical gap' + (n === 1 ? '' : 's'); } },
    bn: { crit: 'জরুরি', imp: 'গুরুত্বপূর্ণ', good: 'ভালো অভ্যাস', low: 'সাধারণ রেঞ্জের অনেক নিচে। কী কী বাদ পড়েছে দেখে নিন।', high: 'সাধারণ রেঞ্জের ওপরে। স্কোপ সত্যিই বড় হলে ঠিক আছে, তবে ভেঙে দেখাতে বলুন।',
          in: 'এই আকার আর ইন্ডাস্ট্রির সাধারণ রেঞ্জের মধ্যে।', range: 'সাধারণ বাস্তবায়ন রেঞ্জ', none: 'জরুরি কিছু বাদ নেই। স্কোপ ভালোভাবে সাজানো কোটেশন।',
          copied: 'প্রশ্নগুলো কপি হয়েছে ✓', copy: 'ভেন্ডরের জন্য প্রশ্নগুলো কপি করুন', ask: 'জিজ্ঞেস করুন', hidden: 'পরে যোগ করলে সাধারণ খরচ', contract: 'চুক্তির ঝুঁকি',
          subject: 'আপনার Odoo বাস্তবায়ন প্রস্তাব নিয়ে কিছু প্রশ্ন', noPrice: 'বাজারের সঙ্গে তুলনা করতে কোটেশনের ফি লিখুন', risk: function (n) { return n + 'টি জরুরি ফাঁক'; } }
  }[L];
  var W = { 3: T.crit, 2: T.imp, 1: T.good }, WC = { 3: 'bad', 2: 'warn', 1: '' };

  // Build the checklist from data
  $('qc-list').innerHTML = Q.GROUPS.map(function (g) {
    return '<fieldset><legend>' + MH.esc(g[L]) + '</legend><div class="tl-checks one">' +
      Q.ITEMS.filter(function (i) { return i.g === g.id; }).map(function (i) {
        return '<div class="tl-check"><input type="checkbox" id="qi-' + i.id + '" data-item="' + i.id + '"><label for="qi-' + i.id + '">' + MH.esc(i[L]) + '<small>' + W[i.w] + '</small></label></div>';
      }).join('') + '</div></fieldset>';
  }).join('');

  var lastMissing = [];
  function render() {
    var ticked = {};
    document.querySelectorAll('[data-item]').forEach(function (c) { if (c.checked) ticked[c.getAttribute('data-item')] = true; });
    var r = Q.check({ ticked: ticked, price: MH.val('qc-price'), band: $('qc-band').value, industry: $('qc-ind').value });
    lastMissing = r.missing;
    MH.setText('qc-cov', r.coverage + '%');
    MH.setText('qc-crit', T.risk(r.criticalMissing));
    $('qc-crit').className = 'tl-pill ' + (r.criticalMissing ? 'bad' : 'good');
    MH.setText('qc-hidden', r.hidden[1] ? MH.bdt(r.hidden[0]) + ' – ' + MH.bdt(r.hidden[1]) : '৳0');
    MH.setText('qc-real', r.realistic ? MH.bdt(r.realistic[0]) + ' – ' + MH.bdt(r.realistic[1]) : '—');
    MH.setText('qc-rangev', r.range ? MH.bdt(r.range[0]) + ' – ' + MH.bdt(r.range[1]) : '—');
    $('qc-pos').innerHTML = r.position ? '<span class="tl-pill ' + (r.position === 'in' ? 'good' : 'warn') + '">' + MH.esc(T[r.position]) + '</span>' : '<span class="tl-hint">' + T.noPrice + '</span>';
    $('qc-missing').innerHTML = r.missing.length
      ? r.missing.map(function (i) {
          var c = i.cost[1] ? T.hidden + ': ' + MH.bdt(i.cost[0]) + ' – ' + MH.bdt(i.cost[1]) : T.contract;
          return '<li class="' + WC[i.w] + '"><strong>' + MH.esc(i[L]) + '</strong> <span class="tl-pill ' + WC[i.w] + '">' + W[i.w] + '</span><br><span style="color:var(--text-3);font-size:12.5px">' + c + '</span><br>' + T.ask + ': <em>' + MH.esc(i.q[L]) + '</em></li>';
        }).join('')
      : '<li>' + T.none + '</li>';
  }
  $('qc-form').addEventListener('change', render);
  $('qc-form').addEventListener('input', render);
  $('qc-copy').addEventListener('click', function () {
    var btn = this, label = btn.textContent;
    var text = T.subject + '\n\n' + lastMissing.map(function (i, n) { return (n + 1) + '. ' + i.q[L]; }).join('\n');
    var done = function () { btn.textContent = T.copied; btn.classList.add('done'); setTimeout(function () { btn.textContent = label; btn.classList.remove('done'); }, 2200); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { window.prompt('', text); });
    else window.prompt('', text);
  });
  render();
})();
