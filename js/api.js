/**
 * ============================================================
 * AIT EXAM 2026 - API Layer
 * Google Apps Script Integration
 * File: js/api.js
 * ============================================================
 */

'use strict';

const AIT_CONFIG = {
  SCRIPT_URL: 'https://script.google.com/macros/library/d/1ZAbo6GuJ0quDIz3UkDQH01Qi1y7Q8_7CB8RCvc7LJyLwFYj6XLK_WGds/4',

  EXAM_DURATION_MINUTES: 90,
  TOTAL_QUESTIONS: 50,
  AUTOSAVE_INTERVAL_SECONDS: 30,

  WARNING_LIMIT: 3,
  TIMER_WARNING_MINUTES: 15,
  TIMER_DANGER_MINUTES: 5,

  SESSION_KEYS: {
    CANDIDATE: 'ait_candidate',
    ANSWERS: 'ait_answers',
    START_TIME: 'ait_start_time',
    MARKED: 'ait_marked',
    QUESTION_ORDER: 'ait_q_order',
    OPTION_ORDERS: 'ait_o_orders',
    WARNINGS: 'ait_warnings',
    CHEAT_LOG: 'ait_cheat_log',
    SUBMITTED: 'ait_submitted',
  }
};

/* ============================================================
   CORE: All API calls use no-cors POST (GAS requirement)
   checkEmail uses GET with redirect follow for JSON response
   ============================================================ */

/**
 * POST to GAS with no-cors (fire-and-forget style)
 * Returns { success: true } always (opaque response)
 */
async function aitPost(action, payload = {}) {
  try {
    await fetch(AIT_CONFIG.SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, ...payload }),
    });
    return { success: true };
  } catch (err) {
    console.warn('API post error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * GET from GAS — follows redirects, parses JSON
 * Used only for checkEmail (needs a real response)
 */
async function aitGet(action, params = {}) {
  try {
    const qs = new URLSearchParams({ action, ...params });
    const res = await fetch(`${AIT_CONFIG.SCRIPT_URL}?${qs}`, {
      method: 'GET',
      mode: 'cors',
    });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    // If CORS blocks even GET, fall back to no duplicate check
    console.warn('GET API error (CORS):', err);
    return null; // null = cannot verify, allow proceed
  }
}

/* ============================================================
   PUBLIC API FUNCTIONS
   ============================================================ */

/**
 * Check if email already attempted exam.
 * Returns { exists: true/false } or null if unreachable.
 */
async function apiCheckEmail(email) {
  return aitGet('checkEmail', { email: email.trim().toLowerCase() });
}

/**
 * Register candidate — fire and forget
 */
async function apiRegisterCandidate(data) {
  const info = getBrowserInfo();
  return aitPost('registerCandidate', {
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone,
    college: data.college,
    district: data.district,
    course: data.course,
    startTime: new Date().toISOString(),
    browser: info.browser,
    os: info.os,
    device: info.device,
  });
}

/**
 * Auto-save progress — fire and forget
 */
async function apiSaveProgress(email, answers) {
  return aitPost('saveProgress', {
    email: email.toLowerCase(),
    answers: JSON.stringify(answers),
    savedAt: new Date().toISOString(),
  });
}

/**
 * Final exam submission — fire and forget
 */
async function apiSubmitExam(data) {
  return aitPost('submitExam', {
    ...data,
    submittedAt: new Date().toISOString(),
  });
}

/**
 * Log cheat event — fire and forget
 */
async function apiLogCheat(email, eventType, meta = {}) {
  const info = getBrowserInfo();
  return aitPost('logCheat', {
    email: email.toLowerCase(),
    event: eventType,
    timestamp: new Date().toISOString(),
    browser: info.browser,
    os: info.os,
    device: info.device,
    ...meta,
  });
}

/* ============================================================
   BROWSER / DEVICE DETECTION
   ============================================================ */
function getBrowserInfo() {
  const ua = navigator.userAgent;

  let browser = 'Unknown';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
  else if (ua.includes('Chrome/') && !ua.includes('Chromium')) browser = 'Google Chrome';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Apple Safari';

  let os = 'Unknown OS';
  if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  let device = 'Desktop';
  if (/Android|iPhone|iPod|BlackBerry|IEMobile/i.test(ua)) device = 'Mobile';
  else if (/iPad|Tablet/i.test(ua)) device = 'Tablet';

  return { browser, os, device };
}

/* ============================================================
   STORAGE HELPERS
   ============================================================ */
function aitStore(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e2) {}
  }
}

function aitRead(key) {
  try {
    const v = sessionStorage.getItem(key) || localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch (e) { return null; }
}

function aitRemove(key) {
  try { sessionStorage.removeItem(key); localStorage.removeItem(key); } catch (e) {}
}

function aitClearSession() {
  Object.values(AIT_CONFIG.SESSION_KEYS).forEach(k => aitRemove(k));
}

/* ============================================================
   NETWORK STATUS
   ============================================================ */
let isOnline = navigator.onLine;
window.addEventListener('online',  () => { isOnline = true;  document.dispatchEvent(new CustomEvent('ait:online'));  });
window.addEventListener('offline', () => { isOnline = false; document.dispatchEvent(new CustomEvent('ait:offline')); });
function checkNetwork() { return isOnline; }
