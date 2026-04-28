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
