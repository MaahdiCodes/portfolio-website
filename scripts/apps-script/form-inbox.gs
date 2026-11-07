/**
 * @OnlyCurrentDoc
 *
 * mhasan.me: form inbox
 * ------------------------------------------------------------------
 * One endpoint for every form on the website (contact, rescue enquiry,
 * cost-estimate request, course sign-up, newsletter).
 *
 * Each submission is:
 *   1. saved as a row in THIS Google Sheet ("Submissions" tab), and
 *   2. sent to you as a Gmail notification (Reply goes straight to the visitor), and
 *   3. sent to you as a Telegram message, if a bot is connected.
 *
 * This script must be created from inside its Sheet (Extensions → Apps Script).
 * The @OnlyCurrentDoc tag above limits its access to that one Sheet only:
 * it cannot see or change any of your other spreadsheets.
 *
 * Settings are stored in Project Settings → Script properties (never in code):
 *   SHEET_ID          set automatically by setup() (used for the "Open sheet" link)
 *   NOTIFY_EMAIL      set automatically by setup() to your Google account; edit to change
 *   TELEGRAM_TOKEN    paste the token @BotFather gave you (optional)
 *   TELEGRAM_CHAT_ID  set automatically by connectTelegram()
 *
 * One-time setup: run setup(), deploy as a Web app, then (optional) add
 * TELEGRAM_TOKEN and run connectTelegram(). Full steps are in
 * scripts/apps-script/README.md in the website repo.
 *
 * After editing this code, publish the change with
 * Deploy → Manage deployments → (pencil) Edit → Version: New version → Deploy.
 * That keeps the same web-app URL, so the website doesn't need changing.
 */

const TZ = 'Asia/Dhaka';
const TAB = 'Submissions';
const COLUMNS = ['Received (Dhaka)', 'Type', 'Name', 'Email', 'Phone / WhatsApp', 'Company',
  'Interested in', 'Message', 'Budget', 'Timeline', 'Details', 'Page', 'Status'];
const LABELS = {
  contact: 'Contact',
  rescue: 'Rescue enquiry',
  estimator: 'Cost estimate request',
  course: 'Course sign-up',
  newsletter: 'Newsletter subscriber'
};
// Maximum stored length per field (anything longer is cut).
const MAX = { name: 120, email: 200, phone: 40, company: 160, need: 80, message: 5000,
  budget: 60, timeline: 60, details: 4000, page: 300 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------- web app

function doGet() {
  return ContentService.createTextOutput('OK');
}

function doPost(e) {
  try {
    const d = parse_(e);
    // Honeypot: real visitors never fill this hidden field. Bots get a fake success.
    if (d.company_website) return json_({ ok: true });

    const type = LABELS[d.type] ? d.type : 'contact';
    const r = {};
    Object.keys(MAX).forEach(function (k) { r[k] = clean_(d[k], MAX[k]); });
    if (!EMAIL_RE.test(r.email)) return json_({ ok: false, error: 'email' });
    if (isDuplicate_(type, r.email)) return json_({ ok: true, duplicate: true });
    if (isFlood_()) return json_({ ok: false, error: 'busy' });

    const when = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sh = sheet_(spreadsheet_());
      sh.appendRow([when, LABELS[type], r.name, r.email, r.phone, r.company, r.need, r.message,
        r.budget, r.timeline, r.details, r.page, 'New'].map(safeCell_));
    } finally {
      lock.releaseLock();
    }

    notify_(type, r, when);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  }
}

// ---------------------------------------------------------------- setup helpers (run from the editor)

/** Run once. Creates the inbox sheet and sets your notification email. */
function setup() {
  const p = props_();
  const ss = spreadsheet_();
  sheet_(ss);
  if (!p.getProperty('NOTIFY_EMAIL')) p.setProperty('NOTIFY_EMAIL', Session.getEffectiveUser().getEmail());
  Logger.log('Inbox sheet: ' + ss.getUrl());
  Logger.log('Email notifications go to: ' + p.getProperty('NOTIFY_EMAIL'));
  Logger.log('Next: Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).');
}

/**
 * Run after adding TELEGRAM_TOKEN in Script properties AND pressing Start
 * on your bot in Telegram. Finds your chat ID, saves it, sends a test message.
 */
function connectTelegram() {
  const p = props_();
  const token = p.getProperty('TELEGRAM_TOKEN');
  if (!token) throw new Error('Add TELEGRAM_TOKEN in Project Settings → Script properties first.');
  const res = JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/getUpdates',
    { muteHttpExceptions: true }).getContentText());
  if (!res.ok) throw new Error('Telegram rejected the token: ' + res.description);
  const msgs = (res.result || []).map(function (u) { return u.message || u.channel_post; }).filter(Boolean);
  if (!msgs.length) throw new Error('No messages yet. Open your bot in Telegram, press Start (or send "hi"), then run connectTelegram again.');
  const chat = msgs[msgs.length - 1].chat;
  p.setProperty('TELEGRAM_CHAT_ID', String(chat.id));
  Logger.log('Connected to Telegram chat: ' + (chat.username || chat.first_name || chat.title) + ' (' + chat.id + ')');
  sendTestNotification();
}

/** Sends a test email (and Telegram message, if connected) without touching the sheet. */
function sendTestNotification() {
  notify_('contact', {
    name: 'Test notification',
    email: Session.getEffectiveUser().getEmail(),
    message: 'If you can read this, website form notifications are working.',
    page: '(sent from the Apps Script editor)'
  }, Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm'));
  Logger.log('Test sent. Check Gmail' + (props_().getProperty('TELEGRAM_CHAT_ID') ? ' and Telegram.' : '.'));
}

// ---------------------------------------------------------------- internals

function props_() { return PropertiesService.getScriptProperties(); }

// The Sheet this script is attached to. (Using the attached Sheet instead of
// opening one by ID is what allows the narrow @OnlyCurrentDoc permission.)
function spreadsheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('This script must be created from inside a Google Sheet: open the Sheet, then Extensions → Apps Script.');
  const p = props_();
  if (p.getProperty('SHEET_ID') !== ss.getId()) p.setProperty('SHEET_ID', ss.getId());
  return ss;
}

function sheet_(ss) {
  let sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB, 0);
    // Remove the empty default sheet a new spreadsheet comes with.
    ss.getSheets().forEach(function (s) {
      if (s.getName() !== TAB && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s);
    });
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    sh.setColumnWidth(8, 360);
    sh.setColumnWidth(11, 300);
  }
  return sh;
}

function parse_(e) {
  let d = {};
  const raw = e && e.postData && e.postData.contents;
  if (raw) { try { d = JSON.parse(raw) || {}; } catch (_) { d = {}; } }
  const params = (e && e.parameter) || {};
  Object.keys(params).forEach(function (k) { if (d[k] === undefined) d[k] = params[k]; });
  return d;
}

function clean_(v, max) {
  if (v === undefined || v === null) return '';
  return String(v).replace(/\u0000/g, '').trim().slice(0, max);
}

// Stop a value like "=HYPERLINK(...)" from being run as a spreadsheet formula.
function safeCell_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

// Same email + same form within 60 seconds = a double click; save it once.
function isDuplicate_(type, email) {
  const cache = CacheService.getScriptCache();
  const key = ('d:' + type + ':' + email.toLowerCase()).slice(0, 240);
  if (cache.get(key)) return true;
  cache.put(key, '1', 60);
  return false;
}

// More than 60 submissions in ~10 minutes is a bot, not a client.
function isFlood_() {
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get('flood') || 0) + 1;
  cache.put('flood', String(n), 600);
  return n > 60;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function notify_(type, r, when) {
  const p = props_();
  const label = LABELS[type] || 'Submission';
  const who = r.name || r.email;
  const sheetId = p.getProperty('SHEET_ID');
  const sheetUrl = sheetId ? 'https://docs.google.com/spreadsheets/d/' + sheetId + '/edit' : '';
  const rows = [
    ['Name', r.name], ['Email', r.email], ['Phone / WhatsApp', r.phone], ['Company', r.company],
    ['Interested in', r.need], ['Budget', r.budget], ['Timeline', r.timeline],
    ['Message', r.message], ['Details', r.details], ['Page', r.page], ['Received', when + ' (Dhaka)']
  ].filter(function (x) { return x[1]; });
  const digits = String(r.phone || '').replace(/\D/g, '');
  const waNumber = digits.length >= 10 ? (digits.length === 11 && digits[0] === '0' ? '88' + digits : digits) : '';

  // 1. Gmail
  try {
    const to = p.getProperty('NOTIFY_EMAIL');
    if (to) {
      const html =
        '<p style="font:600 15px Arial,sans-serif;margin:0 0 12px">New ' + esc_(label.toLowerCase()) + ' from mhasan.me</p>' +
        '<table cellpadding="6" style="border-collapse:collapse;font:14px Arial,sans-serif">' +
        rows.map(function (x) {
          return '<tr><td style="color:#666;vertical-align:top;white-space:nowrap;border-bottom:1px solid #eee">' + esc_(x[0]) +
            '</td><td style="border-bottom:1px solid #eee;white-space:pre-wrap">' + esc_(x[1]) + '</td></tr>';
        }).join('') + '</table>' +
        '<p style="font:13px Arial,sans-serif;color:#666;margin-top:14px">Press Reply to answer ' + esc_(who) + ' directly.' +
        (waNumber ? ' <a href="https://wa.me/' + waNumber + '">Open WhatsApp chat</a>.' : '') +
        (sheetUrl ? ' <a href="' + sheetUrl + '">Open the inbox sheet</a>.' : '') + '</p>';
      MailApp.sendEmail({
        to: to,
        subject: '[mhasan.me] ' + label + ': ' + who,
        body: rows.map(function (x) { return x[0] + ': ' + x[1]; }).join('\n'),
        htmlBody: html,
        replyTo: EMAIL_RE.test(r.email) ? r.email : to,
        name: 'mhasan.me forms'
      });
    }
  } catch (err) {
    console.error('Email notification failed: ' + err);
  }

  // 2. Telegram
  try {
    const token = p.getProperty('TELEGRAM_TOKEN');
    const chat = p.getProperty('TELEGRAM_CHAT_ID');
    if (token && chat) {
      // Each value is capped at 300 characters so the message stays under
      // Telegram's 4,096 limit without cutting an HTML tag in half. The full
      // text is in the email and the sheet.
      const text = '🔔 <b>' + esc_(label) + '</b>\n' + rows.map(function (x) {
        const v = String(x[1]);
        return '<b>' + esc_(x[0]) + ':</b> ' + esc_(v.length > 300 ? v.slice(0, 300) + '…' : v);
      }).join('\n');
      const buttons = [];
      if (waNumber) buttons.push({ text: 'WhatsApp', url: 'https://wa.me/' + waNumber });
      if (sheetUrl) buttons.push({ text: 'Open sheet', url: sheetUrl });
      const payload = { chat_id: chat, text: text, parse_mode: 'HTML', disable_web_page_preview: true };
      if (buttons.length) payload.reply_markup = { inline_keyboard: [buttons] };
      UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true
      });
    }
  } catch (err) {
    console.error('Telegram notification failed: ' + err);
  }
}
