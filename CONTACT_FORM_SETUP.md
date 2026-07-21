# Contact form → Gmail + Google Sheet setup

The contact form (`src/pages/ContactPage.tsx`) posts to a Google Apps Script
web app instead of a third-party email service. The script emails every
submission to a Gmail address and logs it as a row in a Google Sheet.

## 1. Create the Sheet

1. Create a new Google Sheet.
2. Rename the first tab to `Submissions`.
3. Add a header row: `Timestamp | Company | Email | Date | Time | Message`.

## 2. Add the script

1. In that Sheet, go to **Extensions → Apps Script**.
2. Delete any placeholder code and paste:

```javascript
function doPost(e) {
  try {
    var data = e.parameter;

    // Honeypot — the site's hidden 'website' field is always empty for real
    // visitors. If it's filled in, silently pretend success and stop.
    if (data.website) {
      return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Submissions');
    sheet.appendRow([
      new Date(),
      data.company || '',
      data.email || '',
      data.date || '',
      data.time || '',
      data.message || '',
    ]);

    var emailBody =
      'New contact form submission:\n\n' +
      'Company: ' + (data.company || '') + '\n' +
      'Email: ' + (data.email || '') + '\n' +
      'Preferred Date: ' + (data.date || '') + '\n' +
      'Preferred Time: ' + (data.time || '') + '\n' +
      'Message:\n' + (data.message || '');

    MailApp.sendEmail({
      to: 'yourgmail@gmail.com', // replace with the real inbox
      subject: 'New KhanConcepts Website Inquiry',
      replyTo: data.email || '',
      body: emailBody,
    });

    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Replace `yourgmail@gmail.com` with the real destination inbox.
4. Save (floppy disk icon).

## 3. Deploy as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → **Web app**.
3. Set: Description `Website Form Handler` · Execute as `Me` · Who has access `Anyone`.
4. Click **Deploy**, then **Authorize access** → choose your Google account →
   **Advanced** → **Go to (project name) (unsafe)** → allow. This warning is
   Google's generic message for any script you wrote yourself; it's expected.
5. Copy the **Web app URL** from the final screen.

## 4. Wire it into the site

Add the URL to `.env.local` (not committed to git):

```
VITE_CONTACT_SCRIPT_URL=<paste the web app URL here>
```

Add the same variable in the hosting provider's dashboard (Cloudflare Pages →
project → Settings → Environment variables) so it's set for the deployed
build too.

## Notes

- Gmail's `MailApp.sendEmail` has a daily send quota (100/day on a plain
  Gmail account) — fine for normal contact-form volume, but a spam burst
  could exhaust it. The honeypot field cuts down obvious bot spam; if real
  spam still gets through, add a CAPTCHA (e.g. Cloudflare Turnstile) in front
  of the form as a next step.
- If you ever redeploy the script with code changes, you must create a **new
  deployment version** (Deploy → Manage deployments → edit → new version) —
  editing the code alone doesn't update the live web app URL's behavior.
