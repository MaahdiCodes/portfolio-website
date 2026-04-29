(function () {
  'use strict';

  const LS_KEY = 'course_01_rg_user';
  const TOTAL  = 9;

  function getUser()   { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (_) { return {}; } }
  function saveUser(u) { localStorage.setItem(LS_KEY, JSON.stringify(u)); }
  function getCompleted() { return getUser().completedLessons || []; }
  function isCompleted(n) { return getCompleted().includes(n); }
  function pad(n) { return String(n).padStart(2, '0'); }

  function markComplete(n) {
    const u    = getUser();
    const done = u.completedLessons || [];
    if (!done.includes(n)) { done.push(n); u.completedLessons = done; saveUser(u); }
  }

  /* ── inject shared CSS ── */
  const css = document.createElement('style');
  css.textContent = `
    .lc-shell{max-width:var(--max,1280px);margin:0 auto;padding:0 var(--gutter,24px);position:relative;z-index:1}
    .lc-bar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:0 0 0;padding:24px 28px;border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg,rgba(21,24,29,0.6),rgba(14,16,19,0.6))}
    .lc-bar.is-done{border-color:oklch(0.80 0.17 155 / 0.4);background:linear-gradient(180deg,oklch(0.80 0.17 155 / 0.07),oklch(0.80 0.17 155 / 0.03))}
    .lc-label{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--text-2,#9BA1AA);font-family:var(--sans)}
    .lc-check-icon{width:22px;height:22px;border-radius:50%;background:oklch(0.80 0.17 155);display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#04140B;flex:none;line-height:1}
    .lc-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
    .lc-btn{padding:10px 22px;border-radius:8px;background:oklch(0.80 0.17 155);color:#04140B;font-family:var(--sans);font-weight:500;font-size:14px;border:none;cursor:pointer;transition:opacity .15s,transform .12s;letter-spacing:-0.01em;white-space:nowrap}
    .lc-btn:hover{opacity:.88;transform:translateY(-1px)}
    .lc-next-link{font-family:var(--mono);font-size:12px;color:oklch(0.80 0.17 155);letter-spacing:0.04em;padding:10px 16px;border:1px solid oklch(0.80 0.17 155 / 0.4);border-radius:8px;white-space:nowrap;transition:background .15s}
    .lc-next-link:hover{background:oklch(0.80 0.17 155 / 0.08)}
    .lc-skip-link{font-family:var(--mono);font-size:11.5px;color:var(--text-3,#5D6470);letter-spacing:0.04em;white-space:nowrap;transition:color .15s}
    .lc-skip-link:hover{color:var(--text-2,#9BA1AA)}
    .lesson-item.lesson-done .lesson-icon{color:oklch(0.80 0.17 155)!important}
    .lesson-item.lesson-done .lesson-title{color:var(--text-2,#9BA1AA)}
    .continue-badge{font-family:var(--mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:oklch(0.80 0.17 155);border:1px solid oklch(0.80 0.17 155 / 0.4);border-radius:4px;padding:2px 7px;margin-left:10px;vertical-align:middle;white-space:nowrap}
    .lc-progress-count{font-family:var(--mono);font-size:11px;color:var(--text-3,#5D6470);letter-spacing:0.06em;margin-left:auto}
  `;
  document.head.appendChild(css);

  /* ── detect page: lesson vs index ── */
  const urlMatch  = location.pathname.match(/lesson-(\d+)\.html/i);
  const lessonNum = urlMatch ? parseInt(urlMatch[1], 10) : 0;

  /* ══════════════════════════════════════
     LESSON PAGE
  ══════════════════════════════════════ */
  if (lessonNum) {
    const user = getUser();
    if (!user.name || !user.email) return; /* not enrolled — no button */

    const postFoot = document.querySelector('.post-foot');
    if (!postFoot) return;
    const footShell = postFoot.closest('.shell') || postFoot.parentElement;

    const wrapper = document.createElement('div');
    wrapper.className = 'lc-shell';
    wrapper.style.marginBottom = '32px';
    footShell.parentElement.insertBefore(wrapper, footShell);

    renderLessonBar(wrapper);

    function renderLessonBar(container) {
      const done      = isCompleted(lessonNum);
      const nextNum   = lessonNum < TOTAL ? lessonNum + 1 : null;
      const nextHref  = nextNum ? 'lesson-' + pad(nextNum) + '.html' : 'index.html';
      const nextLabel = nextNum ? 'Lesson ' + nextNum : 'Course Overview';

      if (done) {
        container.innerHTML =
          '<div class="lc-bar is-done">' +
            '<span class="lc-label"><span class="lc-check-icon">✓</span>Lesson ' + lessonNum + ' completed</span>' +
            '<div class="lc-actions"><a href="' + nextHref + '" class="lc-next-link">' + nextLabel + ' →</a></div>' +
          '</div>';
      } else {
        container.innerHTML =
          '<div class="lc-bar">' +
            '<span class="lc-label">Finished reading this lesson?</span>' +
            '<div class="lc-actions">' +
              '<button class="lc-btn" id="lc-mark-btn">Mark as Complete</button>' +
              '<a href="' + nextHref + '" class="lc-skip-link">Skip → ' + nextLabel + '</a>' +
            '</div>' +
          '</div>';
        document.getElementById('lc-mark-btn').addEventListener('click', function () {
          markComplete(lessonNum);
          renderLessonBar(container);
        });
      }
    }
  }

  /* ══════════════════════════════════════
     INDEX / OVERVIEW PAGE
     Runs after the inline script has already called unlockUI (if enrolled).
  ══════════════════════════════════════ */
  else {
    const user      = getUser();
    if (!user.name || !user.email) return;

    const completed = getCompleted();
    if (!completed.length) return;

    /* find the first incomplete lesson to mark as "continue" */
    let nextIncomplete = null;
    for (let i = 1; i <= TOTAL; i++) {
      if (!isCompleted(i)) { nextIncomplete = i; break; }
    }

    /* update lesson row icons */
    for (let i = 1; i <= TOTAL; i++) {
      const li  = document.getElementById('li-' + pad(i));
      const ico = document.getElementById('ico-' + pad(i));
      if (!li || li.classList.contains('locked')) continue;

      if (isCompleted(i)) {
        li.classList.add('lesson-done');
        if (ico) { ico.textContent = '✓'; ico.style.color = 'oklch(0.80 0.17 155)'; }
      } else {
        /* unlocked but not yet completed */
        if (ico) { ico.textContent = '→'; ico.style.color = 'var(--text-3,#5D6470)'; }
        if (i === nextIncomplete) {
          const titleEl = li.querySelector('.lesson-title');
          if (titleEl && !titleEl.querySelector('.continue-badge')) {
            const badge = document.createElement('span');
            badge.className = 'continue-badge';
            badge.textContent = 'Continue';
            titleEl.appendChild(badge);
          }
        }
      }
    }

    /* append progress counter to the enrolled banner */
    const banner = document.getElementById('enrolled-banner');
    if (banner && !banner.querySelector('.lc-progress-count')) {
      const span = document.createElement('span');
      span.className = 'lc-progress-count';
      span.textContent = completed.length === TOTAL
        ? 'Course complete ✓'
        : completed.length + ' of ' + TOTAL + ' completed';
      if (completed.length === TOTAL) span.style.color = 'oklch(0.80 0.17 155)';
      banner.appendChild(span);
    }
  }

})();
