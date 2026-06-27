/**
 * ============================================================
 * AIT EXAM 2026 — Google Apps Script Backend
 * File: google-apps-script/Code.gs
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project named "AIT Exam 2026"
 * 3. Paste this entire file into Code.gs
 * 4. Update SHEET_ID below with your Google Sheet ID
 * 5. Click Deploy > New Deployment > Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the deployment URL and paste into js/api.js → SCRIPT_URL
 *
 * GOOGLE SHEET SETUP:
 * Create a Google Sheet with these tab names:
 *   - Registrations
 *   - CheatLog
 *   - Progress
 * ============================================================
 */

// ============================================================
// CONFIGURATION — Update this with your Google Sheet ID
// ============================================================
const CONFIG = {
  // Replace with your Google Sheet ID (from the URL)
  SHEET_ID: '1y5Kp0-9sDCh-eaIk6PMK1BX5LH8UmGggqpKUMc8S5Ks',

  // Sheet tab names
  SHEETS: {
    REGISTRATIONS: 'Registrations',
    CHEAT_LOG: 'CheatLog',
    PROGRESS: 'Progress',
  },

  // Allowed origins (for CORS)
  ALLOWED_ORIGIN: '*',
};

// ============================================================
// MAIN ENTRY POINTS
// ============================================================

/**
 * Handle GET requests (checkEmail, registerCandidate)
 */
function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || '';

  let result;

  try {
    switch (action) {
      case 'checkEmail':
        result = checkEmail(params.email);
        break;
      case 'registerCandidate':
        result = registerCandidate(params);
        break;
      default:
        result = { success: false, message: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  return buildResponse(result);
}

/**
 * Handle POST requests (submitExam, saveProgress, logCheat)
 */
function doPost(e) {
  let body = {};

  try {
    const raw = (e.postData && e.postData.contents) ? e.postData.contents : '{}';
    body = JSON.parse(raw);
  } catch (err) {
    // Try to get from parameters as fallback
    body = e.parameter || {};
  }

  const action = body.action || '';
  let result;

  try {
    switch (action) {
      case 'submitExam':
        result = submitExam(body);
        break;
      case 'saveProgress':
        result = saveProgress(body);
        break;
      case 'logCheat':
        result = logCheat(body);
        break;
      default:
        result = { success: false, message: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  return buildResponse(result);
}

// ============================================================
// ACTION HANDLERS
// ============================================================

/**
 * checkEmail — Check if a candidate has already registered
 * @param {string} email
 * @returns {{ exists: boolean, status: string }}
 */
function checkEmail(email) {
  if (!email) return { exists: false };

  const sheet = getSheet(CONFIG.SHEETS.REGISTRATIONS);
  const data = sheet.getDataRange().getValues();
  const emailCol = 2; // Column C (0-indexed = 2) — Email column

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][emailCol]).toLowerCase().trim() === email.toLowerCase().trim()) {
      return { exists: true, status: data[i][23] || 'REGISTERED' }; // Status column
    }
  }

  return { exists: false };
}

/**
 * registerCandidate — Add candidate to the registrations sheet
 */
function registerCandidate(params) {
  const sheet = getSheet(CONFIG.SHEETS.REGISTRATIONS);

  // Check for duplicate
  const check = checkEmail(params.email);
  if (check.exists) {
    return { success: false, exists: true, message: 'Email already registered.' };
  }

  const timestamp = new Date();
  const row = [
    timestamp,                // A: Timestamp
    params.name || '',        // B: Name
    params.email || '',       // C: Email
    params.phone || '',       // D: Phone
    params.college || '',     // E: College
    params.district || '',    // F: District
    params.course || '',      // G: Course
    params.startTime || '',   // H: Start Time
    '',                       // I: End Time (filled on submit)
    '',                       // J: Duration
    '',                       // K: Score
    '',                       // L: Percentage
    '',                       // M: Scholarship
    '',                       // N: Questions Attempted
    '',                       // O: Correct
    '',                       // P: Wrong
    '',                       // Q: Tab Switch Count
    '',                       // R: Fullscreen Exit Count
    '',                       // S: Copy Attempts
    '',                       // T: Paste Attempts
    '',                       // U: Refresh Attempts
    '',                       // V: DevTools Attempts
    '',                       // W: Warnings
    'REGISTERED',             // X: Status
    params.browser || '',     // Y: Browser
    params.os || '',          // Z: OS
    params.device || '',      // AA: Device
  ];

  sheet.appendRow(row);

  return { success: true, message: 'Candidate registered successfully.' };
}

/**
 * submitExam — Record final exam submission and calculate score
 */
function submitExam(body) {
  const sheet = getSheet(CONFIG.SHEETS.REGISTRATIONS);
  const data = sheet.getDataRange().getValues();
  const emailCol = 2;

  const email = (body.email || '').toLowerCase().trim();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][emailCol]).toLowerCase().trim() === email) {
      rowIndex = i + 1; // 1-based for Sheets API
      break;
    }
  }

  // Determine scholarship
  const percentage = parseFloat(body.percentage) || 0;
  const scholarship = getScholarshipLabel(percentage);

  // Duration in minutes
  const durationMins = Math.floor((parseInt(body.durationSeconds) || 0) / 60);

  if (rowIndex > 0) {
    // Update existing row
    const sheetRow = sheet.getRange(rowIndex, 1, 1, 27).getValues()[0];

    sheet.getRange(rowIndex, 9).setValue(body.endTime || new Date().toISOString());   // End Time
    sheet.getRange(rowIndex, 10).setValue(durationMins + ' min');                     // Duration
    sheet.getRange(rowIndex, 11).setValue(parseInt(body.correct) || 0);              // Score
    sheet.getRange(rowIndex, 12).setValue(percentage + '%');                         // Percentage
    sheet.getRange(rowIndex, 13).setValue(scholarship);                              // Scholarship
    sheet.getRange(rowIndex, 14).setValue(parseInt(body.questionsAttempted) || 0);  // Attempted
    sheet.getRange(rowIndex, 15).setValue(parseInt(body.correct) || 0);             // Correct
    sheet.getRange(rowIndex, 16).setValue(parseInt(body.wrong) || 0);               // Wrong
    sheet.getRange(rowIndex, 17).setValue(parseInt(body.tabSwitchCount) || 0);      // Tab Switches
    sheet.getRange(rowIndex, 18).setValue(parseInt(body.fullscreenExitCount) || 0); // FS Exits
    sheet.getRange(rowIndex, 19).setValue(parseInt(body.copyAttempts) || 0);        // Copy Attempts
    sheet.getRange(rowIndex, 20).setValue(parseInt(body.pasteAttempts) || 0);       // Paste Attempts
    sheet.getRange(rowIndex, 21).setValue(parseInt(body.refreshAttempts) || 0);     // Refresh Attempts
    sheet.getRange(rowIndex, 22).setValue(parseInt(body.devToolsAttempts) || 0);    // DevTools Attempts
    sheet.getRange(rowIndex, 23).setValue(parseInt(body.warnings) || 0);            // Warnings
    sheet.getRange(rowIndex, 24).setValue(body.status || 'SUBMITTED');              // Status

  } else {
    // Candidate not pre-registered — add new row
    const row = [
      new Date(),
      body.name || '',
      email,
      body.phone || '',
      body.college || '',
      body.district || '',
      body.course || '',
      body.startTime || '',
      body.endTime || '',
      durationMins + ' min',
      parseInt(body.correct) || 0,
      percentage + '%',
      scholarship,
      parseInt(body.questionsAttempted) || 0,
      parseInt(body.correct) || 0,
      parseInt(body.wrong) || 0,
      parseInt(body.tabSwitchCount) || 0,
      parseInt(body.fullscreenExitCount) || 0,
      parseInt(body.copyAttempts) || 0,
      parseInt(body.pasteAttempts) || 0,
      parseInt(body.refreshAttempts) || 0,
      parseInt(body.devToolsAttempts) || 0,
      parseInt(body.warnings) || 0,
      body.status || 'SUBMITTED',
      body.browser || '',
      body.os || '',
      body.device || '',
    ];
    sheet.appendRow(row);
  }

  // Apply conditional formatting based on percentage
  applyScholarshipFormatting(sheet, rowIndex > 0 ? rowIndex : sheet.getLastRow(), percentage);

  return { success: true, message: 'Exam submitted successfully.' };
}

/**
 * saveProgress — Save intermediate answers
 */
function saveProgress(body) {
  const sheet = getSheet(CONFIG.SHEETS.PROGRESS);

  const timestamp = new Date();
  const email = (body.email || '').toLowerCase();

  // Check if row exists for this email
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === email) {
      rowIndex = i + 1;
      break;
    }
  }

  const row = [
    email,
    timestamp,
    body.answers || '',
    body.savedAt || '',
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, 4).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return { success: true };
}

/**
 * logCheat — Record a cheat event
 */
function logCheat(body) {
  const sheet = getSheet(CONFIG.SHEETS.CHEAT_LOG);

  const row = [
    new Date(),
    (body.email || '').toLowerCase(),
    body.event || '',
    body.timestamp || '',
    body.browser || '',
    body.os || '',
    body.device || '',
  ];

  sheet.appendRow(row);
  return { success: true };
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Get or create a sheet by name
 */
function getSheet(name) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    setupSheetHeaders(sheet, name);
  }

  return sheet;
}

/**
 * Set up column headers for each sheet
 */
function setupSheetHeaders(sheet, name) {
  if (name === CONFIG.SHEETS.REGISTRATIONS) {
    const headers = [
      'Timestamp', 'Name', 'Email', 'Phone', 'College', 'District', 'Course',
      'Start Time', 'End Time', 'Duration', 'Score', 'Percentage', 'Scholarship',
      'Questions Attempted', 'Correct', 'Wrong',
      'Tab Switch Count', 'Fullscreen Exit Count', 'Copy Attempts',
      'Paste Attempts', 'Refresh Attempts', 'DevTools Attempts', 'Warnings',
      'Status', 'Browser', 'Operating System', 'Device'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#1a3c6e')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  if (name === CONFIG.SHEETS.CHEAT_LOG) {
    const headers = ['Timestamp', 'Email', 'Event Type', 'Event Time', 'Browser', 'OS', 'Device'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#8b1a1a')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  if (name === CONFIG.SHEETS.PROGRESS) {
    const headers = ['Email', 'Last Saved', 'Answers JSON', 'Saved At'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#0f2444')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

/**
 * Determine scholarship label based on percentage
 */
function getScholarshipLabel(pct) {
  if (pct >= 90) return 'FREE Course + FREE Internship + FREE Certificate';
  if (pct >= 75) return '50% Scholarship + FREE Internship';
  return '25% Scholarship + 50% Internship Offer';
}

/**
 * Apply background color based on scholarship tier
 */
function applyScholarshipFormatting(sheet, rowIndex, percentage) {
  try {
    let color = '#fff9c4'; // Default: light yellow
    if (percentage >= 90) color = '#c8e6c9'; // Green: top tier
    else if (percentage >= 75) color = '#b3e5fc'; // Blue: mid tier

    sheet.getRange(rowIndex, 1, 1, 27).setBackground(color);
  } catch (e) {
    // Non-fatal
  }
}

/**
 * Build a JSON response with CORS headers
 * GAS automatically adds CORS for GET when deployed as "Anyone" web app
 */
function buildResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Handle CORS preflight OPTIONS request
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ============================================================
// MANUAL SETUP FUNCTION (run once from Apps Script editor)
// ============================================================

/**
 * Run this function once manually from the Apps Script editor
 * to initialize all sheets with proper headers.
 * Go to: Run > setupSheets
 */
function setupSheets() {
  Object.values(CONFIG.SHEETS).forEach(name => {
    getSheet(name);
  });
  Logger.log('All sheets initialized successfully.');
}
