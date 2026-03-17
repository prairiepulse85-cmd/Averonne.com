/**
 * Averonne Research and Consulting — Contact Form Handler
 * Google Apps Script Web App
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to script.google.com → New project → paste this code
 * 2. Edit SHEET_ID and EMAIL_RECIPIENTS below
 * 3. Click Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL → paste into index.html on the <form data-script-url="...">
 *
 * Each submission is logged to a Google Sheet row AND
 * an email notification is sent to the recipients below.
 */

// ── Configuration ──────────────────────────────────────────────
var CONFIG = {
  // Paste your Google Sheet ID here (from the Sheet URL: /d/SHEET_ID/edit)
  // Leave blank to auto-create a new sheet on first run
  SHEET_ID: '',

  // Sheet tab name (created automatically if it doesn't exist)
  SHEET_NAME: 'Enquiries',

  // Email addresses to notify on each new submission
  EMAIL_RECIPIENTS: [
    'Malkaz@averonne.com',
    'headoffice@averonne.com'
  ],

  // Site name shown in notification emails
  SITE_NAME: 'Averonne Research and Consulting'
};
// ───────────────────────────────────────────────────────────────


/**
 * Handles POST requests from the contact form.
 * Called automatically by Google when the form submits.
 */
function doPost(e) {
  try {
    var params = e.parameter;

    // Determine which form this is (contact or internship)
    var formType = params.form_type || 'contact';

    // Write to Google Sheet
    logToSheet(params, formType);

    // Send email notification
    sendNotificationEmail(params, formType);

    // Return success (opaque with no-cors fetch — processed server-side)
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Log error and return failure
    Logger.log('Error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * Writes a form submission as a new row in the Google Sheet.
 */
function logToSheet(params, formType) {
  var ss;

  if (CONFIG.SHEET_ID) {
    ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  } else {
    // Auto-create a spreadsheet on first run and log the ID
    ss = SpreadsheetApp.create('Averonne — Form Submissions');
    Logger.log('Created spreadsheet. Add this ID to CONFIG.SHEET_ID: ' + ss.getId());
    CONFIG.SHEET_ID = ss.getId();
  }

  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }

  // Add header row if the sheet is empty
  if (sheet.getLastRow() === 0) {
    if (formType === 'internship') {
      sheet.appendRow([
        'Timestamp', 'Form Type', 'Full Name', 'Institution',
        'Email', 'Programme / Degree', 'Area of Interest', 'Note'
      ]);
    } else {
      sheet.appendRow([
        'Timestamp', 'Form Type', 'Name', 'Organisation',
        'Email', 'Engagement Type', 'Description', 'Timeline'
      ]);
    }
    // Bold the header row
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  // Append data row
  var timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

  if (formType === 'internship') {
    sheet.appendRow([
      timestamp,
      'Internship',
      params.name        || '',
      params.institution || '',
      params.email       || '',
      params.programme   || '',
      params.interest    || '',
      params.note        || ''
    ]);
  } else {
    sheet.appendRow([
      timestamp,
      'Contact / Consultation',
      params.name              || '',
      params.organisation      || '',
      params.email             || '',
      params.engagement_type   || '',
      params.description       || '',
      params.timeline          || ''
    ]);
  }
}


/**
 * Sends an email notification to the configured recipients.
 */
function sendNotificationEmail(params, formType) {
  var subject, body;

  if (formType === 'internship') {
    subject = '[' + CONFIG.SITE_NAME + '] New Internship Application — ' + (params.name || 'Unknown');
    body = buildInternshipEmailBody(params);
  } else {
    subject = '[' + CONFIG.SITE_NAME + '] New Consultation Inquiry — ' + (params.name || 'Unknown');
    body = buildContactEmailBody(params);
  }

  MailApp.sendEmail({
    to: CONFIG.EMAIL_RECIPIENTS.join(','),
    subject: subject,
    htmlBody: body
  });
}


/**
 * HTML body for consultation inquiry email.
 */
function buildContactEmailBody(p) {
  return [
    '<div style="font-family:Arial,sans-serif;max-width:600px;color:#1a1a1a;">',
    '<div style="background:#0d1b2a;padding:24px 28px;border-radius:8px 8px 0 0;">',
    '  <h2 style="color:#c9a84c;margin:0;font-size:18px;">New Consultation Inquiry</h2>',
    '  <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;">Averonne Research and Consulting</p>',
    '</div>',
    '<div style="border:1px solid #e2e8f0;border-top:none;padding:28px;border-radius:0 0 8px 8px;">',
    row('Name',             p.name             || '—'),
    row('Organisation',     p.organisation     || '—'),
    row('Email',            p.email            || '—'),
    row('Engagement Type',  formatEngagementType(p.engagement_type)),
    row('Timeline',         p.timeline         || 'Not specified'),
    '<tr><td colspan="2" style="padding:8px 0;"><hr style="border:none;border-top:1px solid #e2e8f0;"/></td></tr>',
    '<tr><td style="padding:6px 12px 6px 0;font-size:13px;font-weight:600;color:#666;white-space:nowrap;vertical-align:top;">Description</td>',
    '<td style="padding:6px 0;font-size:14px;color:#1a1a1a;line-height:1.7;">' + escHtml(p.description || '—') + '</td></tr>',
    '</table>',
    '<p style="margin:20px 0 0;font-size:12px;color:#aaa;">',
    'Reply directly to this email to respond, or log in to your ',
    '<a href="https://docs.google.com/spreadsheets" style="color:#c9a84c;">Google Sheet</a> to view all submissions.',
    '</p>',
    '</div></div>'
  ].join('');
}


/**
 * HTML body for internship application email.
 */
function buildInternshipEmailBody(p) {
  return [
    '<div style="font-family:Arial,sans-serif;max-width:600px;color:#1a1a1a;">',
    '<div style="background:#0d1b2a;padding:24px 28px;border-radius:8px 8px 0 0;">',
    '  <h2 style="color:#c9a84c;margin:0;font-size:18px;">New Internship Application</h2>',
    '  <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;">Averonne Research and Consulting</p>',
    '</div>',
    '<div style="border:1px solid #e2e8f0;border-top:none;padding:28px;border-radius:0 0 8px 8px;">',
    '<table style="border-collapse:collapse;width:100%;">',
    row('Full Name',        p.name        || '—'),
    row('Institution',      p.institution || '—'),
    row('Email',            p.email       || '—'),
    row('Programme',        p.programme   || '—'),
    row('Area of Interest', p.interest    || '—'),
    p.note ? row('Note', p.note) : '',
    '</table>',
    '</div></div>'
  ].join('');
}


// ── Helpers ────────────────────────────────────────────────────

function row(label, value) {
  return '<tr>' +
    '<td style="padding:6px 12px 6px 0;font-size:13px;font-weight:600;color:#666;white-space:nowrap;">' + label + '</td>' +
    '<td style="padding:6px 0;font-size:14px;color:#1a1a1a;">' + escHtml(value) + '</td>' +
    '</tr>';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatEngagementType(val) {
  var map = {
    'academic-research':      'Academic Research Collaboration',
    'methodological-advisory':'Methodological Advisory',
    'field-research':         'Field Research Support',
    'publication-documentation': 'Publication & Documentation',
    'other':                  'Other / Not yet defined'
  };
  return map[val] || val || '—';
}
