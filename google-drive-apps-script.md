# Google Drive Apps Script Deployment

This file explains how to deploy a Google Apps Script endpoint that saves drawings to Drive and sends you an email link.

## Steps

1. Open [Google Apps Script](https://script.google.com/) and create a new project.
2. Copy the contents of `google-drive-apps-script.gs` into the script editor.
3. Set the script properties:
   - `NOTIFY_EMAIL`: the email address that should receive the notification.
   - `DRIVE_FOLDER_ID`: the Google Drive folder ID where drawings should be saved.
   - Optional: `SCRIPT_SECRET`: a secret string to protect the endpoint.

   To set properties: `Project Settings` > `Properties` > `Script properties`.

4. Deploy the script as a web app:
   - `Deploy` > `New deployment`
   - Select `Web app`
   - `Execute as`: `Me`
   - `Who has access`: `Anyone`
   - Click `Deploy` and copy the web app URL.

5. Update `js/site-config.js`:
   - Set `googleAppsScriptUrl` to the deployed Apps Script URL.
   - If using `SCRIPT_SECRET`, add a matching property to the client code or update the endpoint payload.

Example `site-config.js` entry:
```js
const SITE_CONFIG = {
  web3formsAccessKey: "806c0e6a-e47f-40e2-9b62-2d160326ee7e",
  notifyEmail: "magnus@sondim.com",
  googleAppsScriptUrl: "https://script.google.com/macros/s/XXXXXXXXXXXX/exec",
};
```

## How it works

- The browser sends the PNG as base64 to the Apps Script endpoint.
- Apps Script saves the file to your Drive folder and makes it viewable by link.
- Apps Script then emails you the link.

## Notes

- The endpoint runs under your Google account and uses your Drive/Email privileges.
- If the endpoint is public, anyone with the URL can submit drawings. Use `SCRIPT_SECRET` for extra protection.
- Keep the `googleAppsScriptUrl` value private.
