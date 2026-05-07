// Apply stored theme immediately — runs before DOMContentLoaded to avoid flash.
(function(){
  if(localStorage.getItem('mh-theme')==='light')
    document.documentElement.setAttribute('data-theme','light');
})();

// Inject theme toggle button into lab/course navs and wire up the click handler.
(function(){
  function injectThemeToggle(){
    var navInner = document.querySelector('.nav-inner');
    if(!navInner || navInner.querySelector('.theme-toggle')) return;
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label','Toggle light/dark theme');
    btn.title = 'Toggle light/dark theme';
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
    btn.addEventListener('click', function(){
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if(isLight){
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('mh-theme','dark');
      } else {
        document.documentElement.setAttribute('data-theme','light');
        localStorage.setItem('mh-theme','light');
      }
    });
  }
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded', injectThemeToggle);
  else injectThemeToggle();
})();

// Lab post TOC: mobile collapse + scroll-spy + reading progress.
(function(){
  function init(){
    var toc = document.querySelector('.post .toc');
    if(!toc) return;
    var ol = toc.querySelector('ol');
    if(!ol) return;
    var links = Array.prototype.slice.call(ol.querySelectorAll('a[href^="#"]'));
    if(!links.length) return;

    // ---- Build mobile toggle (only one set of markup, CSS handles visibility)
    var firstLabel = links[0].textContent.trim();
    var toggle = document.createElement('button');
    toggle.className = 'toc-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML =
      '<span class="label">Contents</span>' +
      '<span class="current">' + firstLabel + '</span>' +
      '<span class="chev" aria-hidden="true">▾</span>';
    toc.insertBefore(toggle, toc.firstChild);

    // mobile progress sliver under the toggle
    var mProg = document.createElement('div');
    mProg.className = 'toc-progress-mobile';
    mProg.innerHTML = '<i></i>';
    toc.appendChild(mProg);

    // desktop progress block
    var dProg = document.createElement('div');
    dProg.className = 'toc-progress';
    dProg.innerHTML = '<span>Read</span><span class="bar"><i></i></span><span class="pct">0%</span>';
    toc.appendChild(dProg);

    var bars = toc.querySelectorAll('.bar i, .toc-progress-mobile i');
    var pctEl = toc.querySelector('.toc-progress .pct');
    var currentEl = toggle.querySelector('.current');

    toc.dataset.open = 'false';
    toggle.addEventListener('click', function(){
      var open = toc.dataset.open === 'true';
      toc.dataset.open = open ? 'false' : 'true';
      toggle.setAttribute('aria-expanded', String(!open));
    });

    // close on link click (mobile)
    links.forEach(function(a){
      a.addEventListener('click', function(){
        if(window.matchMedia('(max-width:1000px)').matches){
          toc.dataset.open = 'false';
          toggle.setAttribute('aria-expanded','false');
        }
      });
    });

    // ---- Scroll spy + progress
    var sections = links.map(function(a){
      var id = a.getAttribute('href').slice(1);
      return { a: a, el: document.getElementById(id) };
    }).filter(function(s){ return s.el; });

    function setActive(idx){
      links.forEach(function(a){ a.classList.remove('is-active'); });
      if(idx >= 0 && sections[idx]){
        sections[idx].a.classList.add('is-active');
        currentEl.textContent = sections[idx].a.textContent.trim();
      }
    }

    function onScroll(){
      var scrollY = window.scrollY || window.pageYOffset;
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docH > 0 ? Math.max(0, Math.min(1, scrollY / docH)) : 0;
      bars.forEach(function(b){ b.style.width = (pct*100).toFixed(1) + '%'; });
      if(pctEl) pctEl.textContent = Math.round(pct*100) + '%';

      var probe = scrollY + 140;
      var active = 0;
      for(var i=0;i<sections.length;i++){
        if(sections[i].el.offsetTop <= probe) active = i;
      }
      // Near bottom of page → force the last section active so the
      // last TOC item still highlights even when its heading is high above the probe line.
      if((scrollY + window.innerHeight) >= (document.documentElement.scrollHeight - 80)){
        active = sections.length - 1;
      }
      setActive(active);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
