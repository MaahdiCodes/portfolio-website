// Apply stored theme immediately — runs before DOMContentLoaded to avoid flash.
// Three themes: 'dark-navy' (default), 'dark' (original near-black, no attribute needed), 'light'.
(function(){
  var t = localStorage.getItem('mh-theme');
  if(t === 'light') document.documentElement.setAttribute('data-theme','light');
  else if(t !== 'dark') document.documentElement.setAttribute('data-theme','dark-navy');
})();

// Inject theme toggle button into lab/course navs and wire up the click handler.
(function(){
  var TITLES = {
    light: 'Theme: Light — click for Dark Navy',
    'dark-navy': 'Theme: Dark Navy — click for Dark (Classic)',
    dark: 'Theme: Dark (Classic) — click for Light'
  };
  function injectThemeToggle(){
    var navInner = document.querySelector('.nav-inner');
    if(!navInner || navInner.querySelector('.theme-toggle')) return;
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label','Cycle site theme');
    btn.innerHTML =
      '<svg class="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="5"/>' +
        '<line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>' +
        '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>' +
        '<line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>' +
        '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>' +
      '</svg>' +
      '<svg class="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
      '</svg>';
    var backLink = navInner.querySelector('.back-link');
    if(backLink) navInner.insertBefore(btn, backLink);
    else navInner.appendChild(btn);

    function currentTheme(){
      return document.documentElement.getAttribute('data-theme') || 'dark';
    }
    function setTitle(){
      btn.title = TITLES[currentTheme()];
    }
    setTitle();

    btn.addEventListener('click', function(){
      var order = ['dark-navy', 'dark', 'light'];
      var next = order[(order.indexOf(currentTheme()) + 1) % order.length];
      if(next === 'dark') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('mh-theme', next);
      setTitle();
    });
  }
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded', injectThemeToggle);
  else injectThemeToggle();
})();
