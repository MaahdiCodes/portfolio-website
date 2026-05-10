/* Scroll-to-top button — injected on every page */
(function () {
  var css = [
    '#mh-top{',
      'position:fixed;bottom:24px;right:24px;z-index:999;',
      'width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;',
      'background:oklch(0.80 0.17 155);',
      'color:#04140B;',
      'display:grid;place-items:center;',
      'box-shadow:0 4px 16px oklch(0.80 0.17 155/0.28),0 2px 6px rgba(0,0,0,0.35);',
      'opacity:0;pointer-events:none;',
      'transform:translateY(10px);',
      'transition:opacity 0.22s ease,transform 0.22s ease,background 0.15s,box-shadow 0.15s;',
    '}',
    '#mh-top.visible{opacity:1;pointer-events:auto;transform:translateY(0)}',
    '#mh-top:hover{',
      'background:oklch(0.88 0.17 155);',
      'box-shadow:0 6px 20px oklch(0.80 0.17 155/0.44),0 2px 8px rgba(0,0,0,0.4);',
    '}',
    '#mh-top:active{transform:translateY(1px) scale(0.96)}',
    '#mh-top svg{width:18px;height:18px;pointer-events:none}',
    '@media(max-width:600px){',
      '#mh-top{bottom:16px;right:16px;width:42px;height:42px}',
    '}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.id = 'mh-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.setAttribute('title', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(btn);
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        btn.classList.toggle('visible', window.scrollY > 300);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();
