(function () {
  'use strict';

  /* Completions stored independently from enrollment so the Mark-as-Complete
     button works on lesson pages even before (or without) enrollment. */
  const PROGRESS_KEY = 'course_01_rg_progress';
  const USER_KEY     = 'course_01_rg_user';
  const TOTAL        = 9;

  /* ── storage ── */
  function getCompleted() {
    try {
      var d = JSON.parse(localStorage.getItem(PROGRESS_KEY));
      return (d && d.completedLessons) || [];
    } catch (_) { return []; }
  }
  function saveCompleted(arr) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ completedLessons: arr }));
  }
  function isCompleted(n)  { return getCompleted().includes(n); }
  function markComplete(n) {
    const done = getCompleted();
    if (!done.includes(n)) { done.push(n); saveCompleted(done); }
  }
  function unmarkComplete(n) { saveCompleted(getCompleted().filter(function (x) { return x !== n; })); }
  function getUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)) || {}; } catch (_) { return {}; } }
  function pad(n)    { return String(n).padStart(2, '0'); }

  /* ── inject CSS once ── */
  var css = document.createElement('style');
  css.textContent = [
    /* lesson page bar */
    '.lc-shell{max-width:var(--max,1280px);margin:0 auto;padding:0 var(--gutter,24px);position:relative;z-index:1}',
    '.lc-bar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:22px 28px;border:1px solid var(--border,#1E2228);border-radius:14px;background:linear-gradient(180deg,rgba(21,24,29,0.6),rgba(14,16,19,0.6))}',
    '.lc-bar.is-done{border-color:oklch(0.80 0.17 155 / 0.4);background:linear-gradient(180deg,oklch(0.80 0.17 155 / 0.07),oklch(0.80 0.17 155 / 0.03))}',
    '.lc-label{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--text-2,#9BA1AA);font-family:var(--sans)}',
    '.lc-check-icon{width:22px;height:22px;border-radius:50%;background:oklch(0.80 0.17 155);display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#04140B;flex:none}',
    '.lc-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
    '.lc-btn{padding:11px 24px;border-radius:8px;background:oklch(0.80 0.17 155);color:#04140B;font-family:var(--sans);font-weight:500;font-size:14px;border:none;cursor:pointer;transition:opacity .15s,transform .12s;letter-spacing:-0.01em;white-space:nowrap}',
    '.lc-btn:hover{opacity:.88;transform:translateY(-1px)}',
    '.lc-next-link{font-family:var(--mono,monospace);font-size:12px;color:oklch(0.80 0.17 155);letter-spacing:0.04em;padding:10px 16px;border:1px solid oklch(0.80 0.17 155 / 0.4);border-radius:8px;white-space:nowrap;transition:background .15s}',
    '.lc-next-link:hover{background:oklch(0.80 0.17 155 / 0.08)}',
    '.lc-undo-btn{background:none;border:none;cursor:pointer;font-family:var(--mono,monospace);font-size:11px;color:var(--text-3,#5D6470);letter-spacing:0.06em;padding:0;transition:color .15s}',
    '.lc-undo-btn:hover{color:var(--text-2,#9BA1AA)}',
    /* index page */
    '.lp-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-family:var(--mono,monospace);font-size:11px;color:var(--text-3,#5D6470);letter-spacing:0.06em}',
    '.lp-bar-track{height:3px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;margin-bottom:20px}',
    '.lp-bar-fill{height:100%;background:oklch(0.80 0.17 155);border-radius:4px;transition:width .35s ease}',
    '.lesson-item.lesson-done .lesson-title{color:var(--text-2,#9BA1AA)}',
    '.lc-ico-btn{font-size:16px;flex:none;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;cursor:pointer;border:none;background:none;padding:0;transition:transform .15s,opacity .15s;line-height:1}',
    '.lc-ico-btn:hover{transform:scale(1.25);opacity:.8}',
    '.lc-ico-btn[data-done="true"]{color:oklch(0.80 0.17 155)}',
    '.lc-ico-btn[data-done="false"]{color:var(--text-3,#5D6470)}',
    '.continue-badge{font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:oklch(0.80 0.17 155);border:1px solid oklch(0.80 0.17 155 / 0.4);border-radius:4px;padding:2px 7px;margin-left:10px;vertical-align:middle;white-space:nowrap}',
    '.lc-progress-count{font-family:var(--mono,monospace);font-size:11px;color:var(--text-3,#5D6470);letter-spacing:0.06em;margin-left:auto}',
  ].join('');
  document.head.appendChild(css);

  /* ── page detection ── */
  var urlMatch  = location.pathname.match(/lesson-(\d+)\.html/i);
  var lessonNum = urlMatch ? parseInt(urlMatch[1], 10) : 0;

  /* ══════════════════════════════════════════
     LESSON PAGE
  ══════════════════════════════════════════ */
  if (lessonNum) {
    var postFoot = document.querySelector('.post-foot');
    if (!postFoot) return;
    var footShell = postFoot.closest ? postFoot.closest('.shell') : postFoot.parentElement;

    var wrapper = document.createElement('div');
    wrapper.className = 'lc-shell';
    wrapper.style.cssText = 'margin-top:0;margin-bottom:32px';
    footShell.parentElement.insertBefore(wrapper, footShell);

    renderLessonBar(wrapper, lessonNum);

    function renderLessonBar(container, n) {
      var done      = isCompleted(n);
      var nextNum   = n < TOTAL ? n + 1 : null;
      var nextHref  = nextNum ? 'lesson-' + pad(nextNum) + '.html' : 'index.html';
      var nextLabel = nextNum ? 'Lesson ' + nextNum : 'Course Overview';

      if (done) {
        container.innerHTML =
          '<div class="lc-bar is-done">' +
            '<span class="lc-label"><span class="lc-check-icon">✓</span>Lesson ' + n + ' completed</span>' +
            '<div class="lc-actions">' +
              '<a href="' + nextHref + '" class="lc-next-link">' + nextLabel + ' →</a>' +
              '<button class="lc-undo-btn" id="lc-undo">Undo</button>' +
            '</div>' +
          '</div>';
        document.getElementById('lc-undo').addEventListener('click', function () {
          unmarkComplete(n);
          renderLessonBar(container, n);
        });
      } else {
        container.innerHTML =
          '<div class="lc-bar">' +
            '<span class="lc-label">Finished reading this lesson?</span>' +
            '<div class="lc-actions">' +
              '<button class="lc-btn" id="lc-mark-btn">Mark as Complete</button>' +
              '<a href="' + nextHref + '" style="font-family:var(--mono,monospace);font-size:11.5px;color:var(--text-3,#5D6470);letter-spacing:0.04em;white-space:nowrap">Skip → ' + nextLabel + '</a>' +
            '</div>' +
          '</div>';
        document.getElementById('lc-mark-btn').addEventListener('click', function () {
          markComplete(n);
          renderLessonBar(container, n);
        });
      }
    }
  }

  /* ══════════════════════════════════════════
     INDEX PAGE
     Runs after the inline script has called unlockUI (if enrolled).
     Lessons must be unlocked before we can show completion UI.
  ══════════════════════════════════════════ */
  else {
    var user = getUser();
    if (!user.name || !user.email) return; /* lessons are still locked; nothing to enhance */

    setupIndexProgress();

    function setupIndexProgress() {
      /* replace each lesson-icon span with a clickable toggle button */
      for (var i = 1; i <= TOTAL; i++) {
        var li  = document.getElementById('li-' + pad(i));
        var ico = document.getElementById('ico-' + pad(i));
        if (!li || li.classList.contains('locked') || !ico) continue;
        if (ico.dataset.lcSetup) continue; /* already wired */

        /* swap the static icon span for an interactive button */
        var btn = document.createElement('button');
        btn.id          = 'ico-' + pad(i);
        btn.className   = 'lc-ico-btn';
        btn.dataset.lcSetup = '1';
        btn.title       = 'Click to mark complete / incomplete';
        ico.parentNode.replaceChild(btn, ico);

        (function (lessonIdx, listItem, iconBtn) {
          iconBtn.addEventListener('click', function (e) {
            e.stopPropagation(); /* don't trigger lesson navigation */
            if (isCompleted(lessonIdx)) { unmarkComplete(lessonIdx); }
            else                        { markComplete(lessonIdx); }
            refreshIndexUI();
          });
        })(i, li, btn);
      }

      refreshIndexUI();
    }

    function refreshIndexUI() {
      var completed     = getCompleted();
      var completedCount = completed.length;

      /* find first incomplete unlocked lesson */
      var nextIncomplete = null;
      for (var i = 1; i <= TOTAL; i++) {
        var li = document.getElementById('li-' + pad(i));
        if (li && !li.classList.contains('locked') && !isCompleted(i)) {
          nextIncomplete = i;
          break;
        }
      }

      /* progress bar (create once, update every time) */
      var lessonList   = document.getElementById('lesson-list');
      var progressWrap = document.getElementById('lc-index-progress');
      if (!progressWrap && lessonList) {
        progressWrap    = document.createElement('div');
        progressWrap.id = 'lc-index-progress';
        lessonList.parentElement.insertBefore(progressWrap, lessonList);
      }
      if (progressWrap) {
        var pct = Math.round((completedCount / TOTAL) * 100);
        progressWrap.innerHTML =
          '<div class="lp-meta"><span>' + completedCount + ' of ' + TOTAL + ' lessons completed</span><span>' + pct + '%</span></div>' +
          '<div class="lp-bar-track"><div class="lp-bar-fill" style="width:' + pct + '%"></div></div>';
      }

      /* update each lesson row */
      for (var j = 1; j <= TOTAL; j++) {
        var rowLi  = document.getElementById('li-' + pad(j));
        var rowBtn = document.getElementById('ico-' + pad(j));
        if (!rowLi || rowLi.classList.contains('locked') || !rowBtn) continue;

        /* remove existing continue badge so we can re-add if needed */
        var oldBadge = rowLi.querySelector('.continue-badge');
        if (oldBadge) oldBadge.remove();

        if (isCompleted(j)) {
          rowLi.classList.add('lesson-done');
          rowBtn.textContent      = '✓';
          rowBtn.dataset.done     = 'true';
          rowBtn.title            = 'Completed — click to unmark';
        } else {
          rowLi.classList.remove('lesson-done');
          rowBtn.textContent      = '○';
          rowBtn.dataset.done     = 'false';
          rowBtn.title            = 'Click to mark complete';

          if (j === nextIncomplete) {
            var titleEl = rowLi.querySelector('.lesson-title');
            if (titleEl) {
              var badge       = document.createElement('span');
              badge.className = 'continue-badge';
              badge.textContent = completedCount === 0 ? 'Start here' : 'Continue';
              titleEl.appendChild(badge);
            }
          }
        }
      }

      /* progress count on enrolled banner — only once at least one lesson is done */
      var banner = document.getElementById('enrolled-banner');
      if (banner) {
        var existing = banner.querySelector('.lc-progress-count');
        if (existing) existing.remove();
        if (completedCount > 0) {
          var span       = document.createElement('span');
          span.className = 'lc-progress-count';
          if (completedCount === TOTAL) {
            span.textContent  = 'Course complete ✓';
            span.style.color  = 'oklch(0.80 0.17 155)';
          } else {
            span.textContent = completedCount + ' / ' + TOTAL + ' done';
          }
          banner.appendChild(span);
        }
      }
    }
  }

})();
