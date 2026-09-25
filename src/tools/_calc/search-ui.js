/* Site search (EN + BN). Loads /search-index.json or /bn/search-index.json on
   first use and ranks results client-side: title > headings > description > body. */
(function () {
  var isBn = document.documentElement.lang.indexOf('bn') === 0;
  var $q = document.getElementById('s-q'), $out = document.getElementById('s-results'), $meta = document.getElementById('s-meta');
  var KIND = isBn ? { lab: 'ল্যাব', tool: 'টুল', guide: 'গাইড', industry: 'ইন্ডাস্ট্রি', course: 'কোর্স', service: 'সেবা' }
                  : { lab: 'Lab', tool: 'Tool', guide: 'Guide', industry: 'Industry', course: 'Course', service: 'Service' };
  var data = null, loading = null;

  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) loading = fetch((isBn ? '/bn' : '') + '/search-index.json').then(function (r) { return r.json(); }).then(function (j) {
      data = j.map(function (d) { d._t = (d.t || '').toLowerCase(); d._h = (d.h || '').toLowerCase(); d._d = (d.d || '').toLowerCase(); d._x = (d.x || '').toLowerCase(); return d; });
      return data;
    });
    return loading;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function hl(text, words) {
    var out = esc(text);
    words.forEach(function (w) { if (w.length < 2) return; var re = new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'); out = out.replace(re, '<mark>$1</mark>'); });
    return out;
  }
  function snippet(d, words) {
    var src = d.d || '';
    var body = d.x || '';
    var i = -1;
    for (var k = 0; k < words.length && i < 0; k++) i = body.toLowerCase().indexOf(words[k]);
    if (i >= 0 && d._d.indexOf(words[0]) < 0) src = (i > 60 ? '…' : '') + body.slice(Math.max(0, i - 60), i + 160) + '…';
    return hl(src, words);
  }
  function search(q) {
    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    var res = [];
    data.forEach(function (d) {
      var s = 0, all = true;
      words.forEach(function (w) {
        var hit = 0;
        if (d._t.indexOf(w) >= 0) hit += 10;
        if (d._h.indexOf(w) >= 0) hit += 4;
        if (d._d.indexOf(w) >= 0) hit += 3;
        if (d._x.indexOf(w) >= 0) hit += 1;
        if (!hit) all = false;
        s += hit;
      });
      if (d.n && words.length === 1 && d.n === words[0].padStart(4, '0')) s += 50;
      if (s > 0) { if (all) s *= 2; if (d.k === 'tool') s += 2; res.push({ d: d, s: s }); }
    });
    res.sort(function (a, b) { return b.s - a.s; });
    return res.slice(0, 30);
  }
  function render() {
    var q = $q.value.trim();
    if (!q) { $out.innerHTML = ''; $meta.textContent = ''; return; }
    load().then(function () {
      var words = q.toLowerCase().split(/\s+/).filter(Boolean);
      var r = search(q);
      $meta.textContent = r.length ? (isBn ? r.length + 'টি ফলাফল' : r.length + ' result' + (r.length === 1 ? '' : 's')) : (isBn ? 'কিছু পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।' : 'Nothing found. Try another word.');
      $out.innerHTML = r.map(function (x) {
        var d = x.d;
        return '<a class="s-res" href="' + esc(d.u) + '"><span class="s-kind">' + KIND[d.k] + (d.n ? ' · ' + d.n : '') + '</span><h3>' + hl(d.t, words) + '</h3><p>' + snippet(d, words) + '</p></a>';
      }).join('');
      history.replaceState(null, '', location.pathname + '?q=' + encodeURIComponent(q));
    });
  }
  var timer;
  $q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(render, 120); });
  $q.addEventListener('focus', load, { once: true });
  document.querySelectorAll('[data-try]').forEach(function (b) { b.addEventListener('click', function () { $q.value = b.getAttribute('data-try'); render(); }); });
  var p = new URLSearchParams(location.search).get('q');
  if (p) { $q.value = p; render(); }
})();
