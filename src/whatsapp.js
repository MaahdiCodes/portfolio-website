/* WhatsApp floating button — injected on every page */
(function () {
  var PHONE = '8801521414851';
  var MSG   = encodeURIComponent('Hi Mehedi, I found your website and would like to connect.');
  var HREF  = 'https://wa.me/' + PHONE + '?text=' + MSG;

  var css = [
    '#mh-wa{',
      'position:fixed;bottom:80px;right:24px;z-index:998;',
      'width:44px;height:44px;border-radius:50%;',
      'background:#25D366;',
      'color:#fff;',
      'display:grid;place-items:center;',
      'box-shadow:0 4px 16px rgba(37,211,102,0.38),0 2px 6px rgba(0,0,0,0.35);',
      'text-decoration:none;',
      'transition:background 0.15s,box-shadow 0.15s,transform 0.15s;',
    '}',
    '#mh-wa:hover{',
      'background:#1ebe5d;',
      'box-shadow:0 6px 20px rgba(37,211,102,0.52),0 2px 8px rgba(0,0,0,0.4);',
      'transform:scale(1.07);',
    '}',
    '#mh-wa:active{transform:scale(0.95)}',
    '#mh-wa svg{width:24px;height:24px;pointer-events:none}',
    '@media(max-width:600px){',
      '#mh-wa{bottom:70px;right:16px;width:42px;height:42px}',
      '#mh-wa svg{width:22px;height:22px}',
    '}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var link = document.createElement('a');
  link.id   = 'mh-wa';
  link.href  = HREF;
  link.target = '_blank';
  link.rel    = 'noopener noreferrer';
  link.setAttribute('aria-label', 'Chat on WhatsApp');
  link.setAttribute('title', 'Chat on WhatsApp');
  /* Official WhatsApp logo path */
  link.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15'
    + '-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475'
    + '-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52'
    + '.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207'
    + '-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372'
    + '-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074'
    + '.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625'
    + '.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413'
    + '.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>'
    + '<path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.845L.057 23.492'
    + 'a.5.5 0 0 0 .614.614l5.764-1.498A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12'
    + 'S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.368l-.36-.214-3.717.966.993-3.62'
    + '-.234-.373A9.818 9.818 0 0 1 12 2.182c5.426 0 9.818 4.392 9.818 9.818'
    + 's-4.392 9.818-9.818 9.818z"/>'
    + '</svg>';

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(link);
  });
})();
