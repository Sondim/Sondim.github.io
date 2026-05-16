/**
 * Google Apps Script web app for receiving a drawing from the browser,
 * saving it to Drive, and emailing a link.
 *
 * Deployment notes are in google-drive-apps-script.md.
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const name = (payload.name || 'Anonymous').substring(0, 200);
    const email = (payload.email || '').substring(0, 200);
    const message = (payload.message || '').substring(0, 4000);
    const filename = payload.filename || 'drawing.png';
    const fileBase64 = payload.fileBase64;
    const notifyEmail = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
    const folderId = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
    const allowedSecret = PropertiesService.getScriptProperties().getProperty('SCRIPT_SECRET');

    if (allowedSecret && payload.secret !== allowedSecret) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }
    if (!notifyEmail) {
      return jsonResponse({ success: false, error: 'Missing NOTIFY_EMAIL property.' }, 400);
    }
    if (!fileBase64) {
      return jsonResponse({ success: false, error: 'Missing fileBase64 payload field.' }, 400);
    }

    const file = createDriveFile(fileBase64, filename, folderId);
    const fileUrl = file.getUrl();
    const fileName = file.getName();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Message: ${message}`,
      '',
      `Image link: ${fileUrl}`,
      `Drive file: ${fileName}`,
    ].join('\n');

    MailApp.sendEmail({
      to: notifyEmail,
      subject: `Sondim draw board — ${name}`,
      body,
      replyTo: email || notifyEmail,
    });

    return jsonResponse({ success: true, fileUrl });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message || String(err) }, 500);
  }
}

function createDriveFile(base64, filename, folderId) {
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, 'image/png', filename);
  const file = folderId ? DriveApp.getFolderById(folderId).createFile(blob) : DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file;
}

function jsonResponse(obj, status) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  if (typeof status === 'number') {
    output.setSecurityLevel(ContentService.SecurityLevel.NONE);
  }
  return output;
}
