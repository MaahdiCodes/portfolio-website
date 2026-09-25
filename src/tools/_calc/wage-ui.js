/* UI for the RMG wage calculator (shared by EN + BN pages). */
(function () {
  var W = MHCalc.wage, L = MH.isBn ? 'bn' : 'en', $ = function (id) { return document.getElementById(id); };
  var T = {
    en: { basic: 'Basic', hr: 'House rent (50% of basic)', med: 'Medical', conv: 'Conveyance', food: 'Food', gross: 'Gross wage',
          ot: 'Overtime', att: 'Attendance bonus', abs: 'Absence deduction', stamp: 'Stamp / other deduction', net: 'Net pay this month',
          inc0: 'No increment yet (under one year on this structure)', incN: function (n, p) { return n + ' annual increment' + (n > 1 ? 's' : '') + ' of ' + p + '% applied to basic'; },
          fest: function (v) { return 'Festival bonus: 2 per year, each up to one month’s basic (' + v + ')'; }, festNo: 'Festival bonus: not yet eligible (needs 1 year of continuous service)',
          grade: 'Grade', heads: 'Workers', perHead: 'Per worker / month', total: 'Monthly total', hrs: 'h' },
    bn: { basic: 'মূল মজুরি', hr: 'বাড়ি ভাড়া (মূল মজুরির ৫০%)', med: 'চিকিৎসা', conv: 'যাতায়াত', food: 'খাদ্য', gross: 'মোট মজুরি',
          ot: 'ওভারটাইম', att: 'হাজিরা বোনাস', abs: 'অনুপস্থিতির কর্তন', stamp: 'স্ট্যাম্প / অন্যান্য কর্তন', net: 'এই মাসে হাতে পাবেন',
          inc0: 'এখনো কোনো ইনক্রিমেন্ট হয়নি (এই কাঠামোতে এক বছর পূর্ণ হয়নি)', incN: function (n, p) { return 'মূল মজুরিতে ' + p + '% হারে ' + n + 'টি বার্ষিক ইনক্রিমেন্ট যোগ হয়েছে'; },
          fest: function (v) { return 'উৎসব বোনাস: বছরে ২টি, প্রতিটি সর্বোচ্চ এক মাসের মূল মজুরি (' + v + ')'; }, festNo: 'উৎসব বোনাস: এখনো প্রাপ্য নয় (টানা ১ বছরের চাকরি লাগবে)',
          grade: 'গ্রেড', heads: 'শ্রমিক', perHead: 'প্রতি শ্রমিক / মাস', total: 'মাসিক মোট', hrs: 'ঘণ্টা' }
  }[L];
  var tk = MH.bdtExact;
  function row(label, v, cls) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + label + '</td><td class="num">' + v + '</td></tr>'; }

  // ----- Tabs -----
  function setMode(m) {
    document.querySelectorAll('[data-mode]').forEach(function (b) { var on = b.getAttribute('data-mode') === m; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    $('mode-worker').hidden = m !== 'worker'; $('mode-factory').hidden = m !== 'factory';
  }
  document.querySelectorAll('[data-mode]').forEach(function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); }); });

  // ----- Worker payslip -----
  var today = new Date();
  var asOfEl = $('w-asof');
  if (!asOfEl.value) asOfEl.value = today.toISOString().slice(0, 10);
  function dateVal(id) { var v = $(id).value; if (!v) return null; var p = v.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }

  function renderWorker() {
    var p = W.payslip({
      gradeId: $('w-grade').value, joined: dateVal('w-joined') || W.STRUCTURE_START, asOf: dateVal('w-asof') || today,
      incrementPct: MH.val('w-inc'), otHours: MH.val('w-ot'), absentDays: MH.val('w-abs'),
      attendanceBonus: MH.val('w-att'), workingDays: MH.val('w-days') || 30, stampDeduction: MH.val('w-stamp')
    });
    MH.setText('w-net', tk(p.net));
    MH.setText('w-gross-sub', T.gross + ': ' + tk(p.b.gross));
    $('w-otrate').textContent = '৳' + (Math.round(p.otRate * 100) / 100).toFixed(2) + (L === 'bn' ? ' / ঘণ্টা' : ' / hr');
    MH.setText('w-basic', tk(p.b.basic));
    MH.setText('w-annual', tk(p.b.gross * 12 + p.festivalBonusEach * 2));
    $('w-table').innerHTML =
      row(T.basic, tk(p.b.basic)) + row(T.hr, tk(p.b.houseRent)) + row(T.med, tk(p.b.medical)) + row(T.conv, tk(p.b.conveyance)) + row(T.food, tk(p.b.food)) +
      row(T.gross, tk(p.b.gross), 'sub') +
      (p.ot ? row(T.ot + ' (' + MH.num(MH.val('w-ot')) + ' ' + T.hrs + ')', '+ ' + tk(p.ot)) : '') +
      (p.attendance ? row(T.att, '+ ' + tk(p.attendance)) : '') +
      (p.absenceDeduction ? row(T.abs, '− ' + tk(p.absenceDeduction)) : '') +
      (p.stamp ? row(T.stamp, '− ' + tk(p.stamp)) : '') +
      row(T.net, tk(p.net), 'total');
    $('w-notes').innerHTML = '<li>' + (p.increments ? T.incN(p.increments, p.incrementPct) : T.inc0) + '</li>' +
      '<li>' + (p.festivalEligible ? T.fest(tk(p.festivalBonusEach)) : T.festNo) + '</li>';
  }

  // ----- Factory payroll -----
  function renderFactory() {
    var hc = {}; W.GRADES.forEach(function (g) { hc[g.id] = MH.val('f-' + g.id); });
    var r = W.factory({ headcount: hc, otHoursAvg: MH.val('f-ot'), incrementsAvg: MH.val('f-years'), incrementPct: MH.val('f-inc'), attendanceBonus: MH.val('f-att') });
    MH.setText('f-monthly', MH.bdt(r.monthly));
    MH.setText('f-annual', MH.bdt(r.annual));
    MH.setText('f-workers', MH.num(r.workers));
    MH.setText('f-otshare', r.monthly ? MH.pct(r.otMonthly / r.monthly * 100, 0) : '—');
    $('f-table').innerHTML = '<thead><tr><th>' + T.grade + '</th><th class="num">' + T.heads + '</th><th class="num">' + T.perHead + '</th><th class="num">' + T.total + '</th></tr></thead><tbody>' +
      r.rows.map(function (x) { return '<tr><td>' + x.grade[L] + '</td><td class="num">' + MH.num(x.n) + '</td><td class="num">' + tk(x.perHead) + '</td><td class="num">' + MH.bdt(x.total) + '</td></tr>'; }).join('') +
      '<tr class="total"><td>' + (L === 'bn' ? 'মোট' : 'Total') + '</td><td class="num">' + MH.num(r.workers) + '</td><td></td><td class="num">' + MH.bdt(r.monthly) + '</td></tr></tbody>';
  }

  // Grade reference table (static data, rendered once)
  var ref = $('grade-ref');
  if (ref) ref.innerHTML = W.GRADES.map(function (g) {
    var b = W.breakdown(g.basic);
    return '<tr><td>' + g[L] + '</td><td class="num">' + MH.num(b.basic) + '</td><td class="num">' + MH.num(b.houseRent) + '</td><td class="num">' + MH.num(b.gross) + '</td></tr>';
  }).join('');

  var p = MH.readParams();
  ['w-grade','w-joined','w-ot','w-abs','w-att'].forEach(function (id) { if (p[id] != null && $(id)) $(id).value = p[id]; });
  if (p.mode) setMode(p.mode);

  $('wage-worker-form').addEventListener('input', renderWorker);
  $('wage-worker-form').addEventListener('change', renderWorker);
  $('wage-factory-form').addEventListener('input', renderFactory);
  $('wage-factory-form').addEventListener('change', renderFactory);
  $('w-share').addEventListener('click', function () {
    MH.copyLink(this, MH.buildLink({ mode: 'worker', 'w-grade': $('w-grade').value, 'w-joined': $('w-joined').value, 'w-ot': $('w-ot').value, 'w-abs': $('w-abs').value, 'w-att': $('w-att').value }));
  });
  renderWorker(); renderFactory();
})();
