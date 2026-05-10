// B1: Social share buttons — inject LinkedIn + X links after .byline in lab articles.
(function(){
  function injectShare(){
    var byline = document.querySelector('.post-head .byline');
    if(!byline) return;
    var canonical = document.querySelector('link[rel="canonical"]');
    var url   = encodeURIComponent(canonical ? canonical.href : location.href);
    var title = encodeURIComponent(document.title);
    // On mobile, _self lets the OS Universal Links / App Links open the native app.
    // On desktop, _blank opens a new tab as expected.
    var target = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? '_self' : '_blank';
    var row = document.createElement('div');
    row.className = 'share-row';
    row.innerHTML =
      '<span class="share-label">Share</span>' +
      '<a class="share-btn share-li" href="https://www.linkedin.com/sharing/share-offsite/?url='+url+'" target="'+target+'" rel="noopener noreferrer" aria-label="Share on LinkedIn">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' +
        'LinkedIn' +
      '</a>' +
      '<a class="share-btn share-x" href="https://x.com/intent/tweet?url='+url+'&text='+title+'" target="'+target+'" rel="noopener noreferrer" aria-label="Share on X">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' +
        'X / Twitter' +
      '</a>';
    byline.insertAdjacentElement('afterend', row);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', injectShare);
  else injectShare();
})();

// B2: Copy-code button — inject on every <pre> block inside .post .body.
(function(){
  function injectCopyButtons(){
    var pres = document.querySelectorAll('.post .body pre');
    if(!pres.length) return;
    pres.forEach(function(pre){
      var wrap = document.createElement('div');
      wrap.className = 'code-block';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Copy code');
      btn.textContent = 'Copy';
      wrap.appendChild(btn);
      btn.addEventListener('click', function(){
        var code = pre.querySelector('code');
        var text = (code ? code : pre).textContent;
        if(navigator.clipboard){
          navigator.clipboard.writeText(text).then(function(){
            btn.textContent = 'Copied!';
            setTimeout(function(){ btn.textContent = 'Copy'; }, 2000);
          });
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch(e){}
          document.body.removeChild(ta);
          btn.textContent = 'Copied!';
          setTimeout(function(){ btn.textContent = 'Copy'; }, 2000);
        }
      });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', injectCopyButtons);
  else injectCopyButtons();
})();
