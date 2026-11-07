# Website form inbox (Google Apps Script)

Every form on mhasan.me (contact, rescue enquiry, cost-estimate request, Course 01
sign-up, newsletter) posts to one Google Apps Script web app. Each submission is
saved to a Google Sheet and sent to you by Gmail and, optionally, Telegram. It's free:
a personal Gmail account can send 100 notification emails a day.

- Script source: [`form-inbox.gs`](form-inbox.gs)
- Website side: `src/assets/forms.js` (shared handler) and `src/_includes/partials/contact-form.njk`
- Endpoint setting: `formsEndpoint` in `src/_data/site.js`

## One-time setup (about 10 minutes)

### A. Create the Sheet and its script
The script is attached to one Sheet and can only access that Sheet (`@OnlyCurrentDoc`).
1. Sign in to the Google account that should own the inbox, open <https://sheets.new>,
   and name the new spreadsheet `mhasan.me — form inbox`.
2. In that Sheet: **Extensions → Apps Script**. Rename the project (top left) to `mhasan.me form inbox`.
3. Delete everything in `Code.gs`, paste the whole of `form-inbox.gs`, and press **Save** (Ctrl+S).
4. In the function dropdown next to **Run**, choose `setup` → **Run**.
   Google asks for permission: **Review permissions** → choose your account →
   **Advanced** → **Go to mhasan.me form inbox (unsafe)** → **Allow**.
   ("Unsafe" only means Google hasn't reviewed your own private script.) The permissions should read:
   - *View and manage spreadsheets that this application has been installed in*: this one Sheet only
   - *Send email as you*: the Gmail notifications (sent only to you)
   - *Connect to an external service*: the Telegram message
   - *See your primary Google Account email address*: to know where to send notifications
   If it asks to *see, edit, create and delete **all** your spreadsheets*, the `@OnlyCurrentDoc` line is missing from the top of the code.
5. The Sheet now has a **Submissions** tab with column headers.

### B. Publish it as a web app
1. **Deploy** → **New deployment** → gear icon → **Web app**.
2. Description `v1`, **Execute as: Me**, **Who has access: Anyone** → **Deploy**.
3. Copy the **Web app URL** (ends in `/exec`). This goes into `formsEndpoint` in `src/_data/site.js`.

### C. Telegram alerts (optional but recommended: instant phone push)
1. In Telegram, open **@BotFather** → send `/newbot` → pick a name (e.g. `mhasan.me alerts`)
   and a username ending in `bot`. BotFather replies with a **token** like `123456789:AA…`.
2. Open your new bot (BotFather links it) and press **Start**.
3. In the Apps Script editor: **Project Settings** (gear, left) → **Script properties** →
   **Add script property** → name `TELEGRAM_TOKEN`, value = the token → **Save**.
4. Back in **Editor**, choose `connectTelegram` → **Run**. You should get a test message
   in Telegram and a test email in Gmail.

Keep the token private. It lives only in Script properties, never in the website code.

## Changing things later
- **Different notification email:** edit `NOTIFY_EMAIL` in Script properties.
- **Turn Telegram off:** delete `TELEGRAM_TOKEN` in Script properties.
- **Test notifications any time:** run `sendTestNotification`.
- **After editing the code:** **Deploy → Manage deployments → pencil (Edit) → Version: New version → Deploy**.
  This keeps the same URL. (A *New deployment* creates a new URL, which would then need updating in `site.js`.)
- In the sheet, use the **Status** column (New / Replied / Won / Lost) to track follow-up.
