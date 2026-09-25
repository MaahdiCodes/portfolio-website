/* UI for the ERP Readiness Assessment (shared by EN + BN pages). */
(function () {
  var R = MHCalc.readiness, L = MH.isBn ? 'bn' : 'en';
  var $ = function (id) { return document.getElementById(id); };
  var T = {
    en: { of: 'of', back: '← Back', next: 'Next →', finish: 'See my result →', skip: 'Skip', score: 'Readiness score',
          flags: 'Red flags to fix first', noFlags: 'No critical red flags. Nice work.', steps: 'Your next 3 steps',
          read: 'Read', retake: 'Start again', answered: 'answered', q: 'Question', incomplete: 'Unanswered questions count as zero.' },
    bn: { of: '/', back: '← আগের', next: 'পরের →', finish: 'ফলাফল দেখুন →', skip: 'বাদ দিন', score: 'প্রস্তুতির স্কোর',
          flags: 'আগে যে লাল পতাকাগুলো মেটাতে হবে', noFlags: 'কোনো গুরুতর লাল পতাকা নেই। দারুণ।', steps: 'আপনার পরের ৩টি ধাপ',
          read: 'পড়ুন', retake: 'আবার শুরু করুন', answered: 'টির উত্তর দেওয়া হয়েছে', q: 'প্রশ্ন', incomplete: 'উত্তর না দেওয়া প্রশ্নে শূন্য ধরা হয়েছে।' }
  }[L];
  var prefix = L === 'bn' ? '/bn' : '';
  function link(href) { return href.indexOf('/lab/') === 0 || href.indexOf('/tools/') === 0 ? prefix + href : href; }

  var answers = {}, idx = 0, Q = R.QUESTIONS;
  var dimName = {}; R.DIMENSIONS.forEach(function (d) { dimName[d.id] = d[L]; });

  function showQuestion() {
    var q = Q[idx];
    $('ra-tag').textContent = dimName[q.d] + ' · ' + T.q + ' ' + (idx + 1) + ' ' + T.of + ' ' + Q.length;
    $('ra-q').textContent = q[L];
    $('ra-fill').style.width = (idx / Q.length * 100) + '%';
    $('ra-plabel').textContent = Object.keys(answers).length + ' ' + (L === 'bn' ? T.answered : T.answered);
    var box = $('ra-options'); box.innerHTML = '';
    q.o.forEach(function (opt, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'tl-option' + (answers[q.id] === i ? ' is-selected' : '');
      b.textContent = opt[L === 'bn' ? 2 : 1];
      b.addEventListener('click', function () {
        answers[q.id] = i;
        if (idx < Q.length - 1) { idx++; showQuestion(); } else showResult();
      });
      box.appendChild(b);
    });
    $('ra-back').disabled = idx === 0;
    $('ra-next').textContent = idx === Q.length - 1 ? T.finish : T.skip + ' →';
    $('ra-quiz').hidden = false; $('ra-result').hidden = true;
  }

  function meter(label, pct) {
    var cls = pct >= 70 ? '' : pct >= 45 ? ' warn' : ' bad';
    return '<div class="tl-meter' + cls + '"><div class="m-top"><span>' + MH.esc(label) + '</span><b>' + pct + '%</b></div><div class="m-track"><div class="m-fill" style="width:' + pct + '%"></div></div></div>';
  }

  function showResult() {
    var r = R.score(answers);
    $('ra-quiz').hidden = true; $('ra-result').hidden = false;
    $('ra-fill').style.width = '100%';
    $('ra-plabel').textContent = r.answered + ' / ' + r.total;
    $('rr-score').textContent = r.pct + '%';
    $('rr-level').textContent = r.level[L];
    $('rr-desc').textContent = r.level[L + 'D'] + (r.answered < r.total ? ' ' + T.incomplete : '');
    var pill = $('rr-pill');
    pill.className = 'tl-pill ' + ({ ready: 'good', gaps: 'good', prep: 'warn', risk: 'bad' })[r.level.id];
    pill.textContent = r.level[L];
    $('rr-dims').innerHTML = R.DIMENSIONS.map(function (d) { return meter(d[L], r.dims[d.id]); }).join('');
    $('rr-flags').innerHTML = r.flags.length
      ? r.flags.map(function (f) { return '<li class="bad">' + MH.esc(f.flag[L]) + (f.flag.link ? ' <a href="' + link(f.flag.link) + '">' + T.read + ' →</a>' : '') + '</li>'; }).join('')
      : '<li>' + T.noFlags + '</li>';
    $('rr-steps').innerHTML = r.weakest.slice(0, 3).map(function (id, i) {
      var n = R.NEXT[id];
      return '<li><strong>' + (i + 1) + '. ' + MH.esc(dimName[id]) + ':</strong> ' + MH.esc(n[L]) + ' <a href="' + link(n.link) + '">' + T.read + ' →</a></li>';
    }).join('');
    history.replaceState(null, '', location.pathname + '?a=' + R.encode(answers));
    window.scrollTo({ top: $('ra-card').offsetTop - 90, behavior: 'smooth' });
  }

  $('ra-back').addEventListener('click', function () { if (idx > 0) { idx--; showQuestion(); } });
  $('ra-next').addEventListener('click', function () { if (idx < Q.length - 1) { idx++; showQuestion(); } else showResult(); });
  $('rr-retake').addEventListener('click', function () { answers = {}; idx = 0; history.replaceState(null, '', location.pathname); showQuestion(); });
  $('rr-share').addEventListener('click', function () { MH.copyLink(this, location.origin + location.pathname + '?a=' + R.encode(answers)); });

  var p = MH.readParams();
  if (p.a) { answers = R.decode(p.a); if (Object.keys(answers).length) { showResult(); return; } }
  showQuestion();
})();
