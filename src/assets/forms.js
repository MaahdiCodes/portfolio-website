/* mhasan.me: shared form handler.
 * ------------------------------------------------------------------
 * Every form that sends data uses this one script and one endpoint
 * (the Google Apps Script in scripts/apps-script/form-inbox.gs, configured as
 * `formsEndpoint` in src/_data/site.js and passed in via data-endpoint).
 *
 * Mark a form with data-mh-form="<type>", where type is one of:
 *   contact | rescue | estimator | course | newsletter
 * and give inputs these names (all optional except email):
 *   name, email, phone, company, need, message, budget, timeline, details
 * plus a hidden honeypot input named company_website.
 *
 * Optional attributes on the <form>:
 *   data-status="id"         element for messages (default: [data-mh-status] inside the form)
 *   data-ok-class / data-err-class   classes put on that element (default ok / error)
 *   data-msg-ok, data-msg-error, data-busy   custom texts
 *
 * Events, for pages that need to add data or react afterwards:
 *   mh:collect  detail.data is the payload; listeners may add fields before it's sent
 *   mh:done     detail.ok (true/false) and detail.data, fired after the request ends
 */
(function () {
  var script = document.currentScript;
  var ENDPOINT = (script && script.getAttribute('data-endpoint')) || '';
  var FALLBACK = 'mhasanju46@gmail.com';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var FIELDS = ['name', 'email', 'phone', 'company', 'need', 'message', 'budget', 'timeline', 'details'];

  function value(form, name) {
    var el = form.elements[name];
    return el && el.value ? String(el.value).trim() : '';
  }

  function emit(form, name, detail) {
    var ev;
    try { ev = new CustomEvent(name, { detail: detail }); }
    catch (_) { ev = document.createEvent('CustomEvent'); ev.initCustomEvent(name, false, false, detail); }
    form.dispatchEvent(ev);
  }

  function bind(form) {
    var statusId = form.getAttribute('data-status');
    var status = form.querySelector('[data-mh-status]') || (statusId && document.getElementById(statusId));
    var okClass = form.getAttribute('data-ok-class') || 'ok';
    var errClass = form.getAttribute('data-err-class') || 'error';
    var btn = form.querySelector('[type="submit"]');
    var btnHTML = btn ? btn.innerHTML : '';
    var busy = false;

    function say(kind, text) {
      if (!status) return;
      status.classList.remove(okClass, errClass);
      if (kind === 'ok') status.classList.add(okClass);
      if (kind === 'error') status.classList.add(errClass);
      status.textContent = text || '';
    }

    function setBusy(on) {
      busy = on;
      form.setAttribute('aria-busy', on ? 'true' : 'false');
      if (!btn) return;
      btn.disabled = on;
      if (on) btn.textContent = form.getAttribute('data-busy') || 'Sending…';
      else btn.innerHTML = btnHTML;
    }

    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      var okText = form.getAttribute('data-msg-ok') || 'Thanks. I\'ll be in touch soon.';
      var errText = form.getAttribute('data-msg-error') ||
        'Couldn\'t send this. Please email ' + FALLBACK + ' or message me on WhatsApp so I don\'t miss you.';

      var hp = form.elements.company_website;
      if (hp && hp.value) { form.reset(); say('ok', okText); return; }

      var missing = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (el) {
        return !String(el.value || '').trim();
      });
      if (missing.length) {
        say('error', form.getAttribute('data-msg-required') || 'Please fill in the required fields.');
        missing[0].focus();
        return;
      }
      var email = value(form, 'email');
      if (!EMAIL_RE.test(email)) {
        say('error', 'Please enter a valid email address.');
        if (form.elements.email) form.elements.email.focus();
        return;
      }

      var data = { type: form.getAttribute('data-mh-form') || 'contact', page: location.pathname };
      FIELDS.forEach(function (f) { var v = value(form, f); if (v) data[f] = v; });
      var detail = { data: data, form: form };
      emit(form, 'mh:collect', detail);

      if (!ENDPOINT) { say('error', errText); emit(form, 'mh:done', { ok: false, data: data }); return; }

      setBusy(true);
      say('', '');
      fetch(ENDPOINT, {
        method: 'POST',
        // text/plain keeps this a "simple" request (no CORS preflight), which Apps Script requires.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(detail.data)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function (res) {
        if (!res || !res.ok) throw new Error((res && res.error) || 'rejected');
        say('ok', okText);
        form.reset();
        emit(form, 'mh:done', { ok: true, data: detail.data });
      }).catch(function (err) {
        say('error', err && err.message === 'email' ? 'Please enter a valid email address.' : errText);
        emit(form, 'mh:done', { ok: false, data: detail.data });
      }).then(function () { setBusy(false); });
    });
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('form[data-mh-form]'), bind);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
