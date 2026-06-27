/**
 * ============================================================
 * AIT EXAM 2026 - Exam Engine
 * File: js/exam.js
 * ============================================================
 */

'use strict';

/* ============================================================
   STATE
   ============================================================ */
const ExamState = {
  candidate: null,
  questions: [],
  answers: {},       // { [qIndex]: selectedOptionIndex }
  marked: new Set(), // question indices marked for review
  current: 0,
  timer: null,
  security: null,
  fullscreen: null,
  autosaveInterval: null,
  warnings: 0,
  isSubmitting: false,
  isSubmitted: false,
  startTime: null,
};

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initExam();
});

async function initExam() {
  // Verify candidate is logged in
  const candidate = aitRead(AIT_CONFIG.SESSION_KEYS.CANDIDATE);
  if (!candidate || !candidate.email) {
    window.location.replace('index.html');
    return;
  }

  ExamState.candidate = candidate;
  ExamState.startTime = aitRead(AIT_CONFIG.SESSION_KEYS.START_TIME) || Date.now();
  ExamState.warnings = aitRead(AIT_CONFIG.SESSION_KEYS.WARNINGS) || 0;

  // Check if already submitted
  if (aitRead(AIT_CONFIG.SESSION_KEYS.SUBMITTED)) {
    window.location.replace('thankyou.html');
    return;
  }

  // Prepare or restore questions
  await prepareQuestions();

  // Restore saved answers
  const savedAnswers = aitRead(AIT_CONFIG.SESSION_KEYS.ANSWERS);
  if (savedAnswers) ExamState.answers = savedAnswers;

  // Restore marked
  const savedMarked = aitRead(AIT_CONFIG.SESSION_KEYS.MARKED);
  if (savedMarked) ExamState.marked = new Set(savedMarked);

  // Render exam UI
  renderCandidateInfo();
  renderQuestion(ExamState.current);
  renderPalette();
  updateProgress();
  updateSummary();

  // Initialize timer
  initTimer();

  // Initialize security
  initSecurity();

  // Auto-save
  initAutosave();

  // Show fullscreen prompt
  showFullscreenPrompt();

  // Online/offline handling
  document.addEventListener('ait:offline', onOffline);
  document.addEventListener('ait:online', onOnline);
}

/* ============================================================
   QUESTION PREPARATION
   ============================================================ */
async function prepareQuestions() {
  // Check for cached question order
  const cachedOrder = aitRead(AIT_CONFIG.SESSION_KEYS.QUESTION_ORDER);
  const cachedOptionOrders = aitRead(AIT_CONFIG.SESSION_KEYS.OPTION_ORDERS);

  if (cachedOrder && cachedOptionOrders) {
    // Restore the same question order (important for saved answers)
    ExamState.questions = cachedOrder;
    return;
  }

  // Generate new question set
  const { questions, optionMaps } = prepareExamQuestions(AIT_CONFIG.TOTAL_QUESTIONS);
  ExamState.questions = questions;

  // Cache question order (so saved answers remain valid)
  aitStore(AIT_CONFIG.SESSION_KEYS.QUESTION_ORDER, questions);
  aitStore(AIT_CONFIG.SESSION_KEYS.OPTION_ORDERS, optionMaps);
}

/* ============================================================
   TIMER
   ============================================================ */
function initTimer() {
  const elapsed = Math.floor((Date.now() - ExamState.startTime) / 1000);

  ExamState.timer = new ExamTimer({
    durationMinutes: AIT_CONFIG.EXAM_DURATION_MINUTES,
    warningMinutes: AIT_CONFIG.TIMER_WARNING_MINUTES,
    dangerMinutes: AIT_CONFIG.TIMER_DANGER_MINUTES,

    onTick: (remaining) => {
      const timerEl = document.getElementById('timerDisplay');
      const timerVal = document.getElementById('timerValue');
      if (timerVal) timerVal.textContent = ExamTimer.formatTime(remaining);

      // Remove previous states
      if (timerEl) timerEl.className = 'timer-display';
    },

    onWarning: (remaining) => {
      const timerEl = document.getElementById('timerDisplay');
      if (timerEl) timerEl.classList.add('warning');
      showToast(`⚠️ Only ${ExamTimer.formatHuman(remaining)} remaining!`, 5000);
    },

    onDanger: (remaining) => {
      const timerEl = document.getElementById('timerDisplay');
      if (timerEl) {
        timerEl.className = 'timer-display danger';
      }
      showToast(`🚨 HURRY! Only ${ExamTimer.formatHuman(remaining)} left!`, 8000);
    },

    onExpire: () => {
      showToast('⏰ Time is up! Submitting your exam...', 3000);
      setTimeout(() => submitExam(true), 2000);
    }
  });

  ExamState.timer.start(elapsed);
}

/* ============================================================
   SECURITY
   ============================================================ */
function initSecurity() {
  ExamState.security = new ExamSecurity({
    email: ExamState.candidate.email,
    warningLimit: AIT_CONFIG.WARNING_LIMIT,

    onViolation: (type, count) => {
      ExamState.warnings = count;
      const msg = getViolationMessage(type, count);
      showToast(msg, 6000);
    },

    onAutoSubmit: (type, count) => {
      showToast(`🚨 Exam auto-submitted due to repeated violations!`, 3000);
      setTimeout(() => submitExam(true), 2000);
    }
  });

  ExamState.security.activate();

  // Fullscreen manager
  ExamState.fullscreen = new FullscreenManager(() => {
    // Fullscreen exited
    ExamState.security.logEvent('FULLSCREEN_EXIT');
    showToast('⚠️ Please return to fullscreen mode to continue.', 0);
    showFullscreenPromptInline();
  });
}

function getViolationMessage(type, count) {
  const remaining = AIT_CONFIG.WARNING_LIMIT - count;
  const prefix = {
    'TAB_SWITCH': '⚠️ Tab switching detected!',
    'WINDOW_BLUR': '⚠️ Window focus lost!',
    'BACK_BUTTON': '⚠️ Browser back button used!',
    'FULLSCREEN_EXIT': '⚠️ Fullscreen mode exited!',
    'REFRESH_ATTEMPT': '⚠️ Page refresh attempted!',
  }[type] || '⚠️ Suspicious activity detected!';

  if (remaining <= 0) return `${prefix} Auto-submitting exam now!`;
  return `${prefix} Warning ${count}/${AIT_CONFIG.WARNING_LIMIT}. ${remaining} warning(s) remaining.`;
}

/* ============================================================
   FULLSCREEN PROMPT
   ============================================================ */
function showFullscreenPrompt() {
  const prompt = document.getElementById('fullscreenPrompt');
  if (prompt) {
    prompt.classList.remove('hidden');
  }
}

function showFullscreenPromptInline() {
  const prompt = document.getElementById('fullscreenPromptInline');
  if (prompt) prompt.classList.remove('hidden');
}

function hideFullscreenPromptInline() {
  const prompt = document.getElementById('fullscreenPromptInline');
  if (prompt) prompt.classList.add('hidden');
}

window.enterFullscreen = async function () {
  await ExamState.fullscreen?.enter();
  const prompt = document.getElementById('fullscreenPrompt');
  if (prompt) prompt.classList.add('hidden');
};

window.reenterFullscreen = async function () {
  await ExamState.fullscreen?.enter();
  hideFullscreenPromptInline();
};

/* ============================================================
   AUTO SAVE
   ============================================================ */
function initAutosave() {
  ExamState.autosaveInterval = setInterval(async () => {
    await saveProgress();
  }, AIT_CONFIG.AUTOSAVE_INTERVAL_SECONDS * 1000);
}

async function saveProgress() {
  // Always save locally
  aitStore(AIT_CONFIG.SESSION_KEYS.ANSWERS, ExamState.answers);
  aitStore(AIT_CONFIG.SESSION_KEYS.MARKED, Array.from(ExamState.marked));

  // Try to save to server if online
  if (checkNetwork() && ExamState.candidate) {
    try {
      await apiSaveProgress(ExamState.candidate.email, ExamState.answers);
    } catch (e) {
      // Non-fatal: local save is sufficient
    }
  }
}

function onOffline() {
  showToast('📡 Internet disconnected. Answers are being saved locally.', 5000);
}

function onOnline() {
  showToast('✅ Internet restored. Syncing your progress...', 3000);
  saveProgress();
}

/* ============================================================
   RENDER FUNCTIONS
   ============================================================ */
function renderCandidateInfo() {
  const c = ExamState.candidate;

  const nameEl = document.getElementById('candidateName');
  const emailEl = document.getElementById('candidateEmail');
  const avatarEl = document.getElementById('candidateAvatar');

  if (nameEl) nameEl.textContent = c.name;
  if (emailEl) emailEl.textContent = c.email;
  if (avatarEl) avatarEl.textContent = c.name ? c.name.charAt(0).toUpperCase() : '?';
}

function renderQuestion(index) {
  const q = ExamState.questions[index];
  if (!q) return;

  // Update question meta
  const qNumEl = document.getElementById('questionNumber');
  const qTextEl = document.getElementById('questionText');
  const qSubjectEl = document.getElementById('questionSubject');
  const markBtn = document.getElementById('markReviewBtn');

  if (qNumEl) qNumEl.textContent = `Question ${index + 1} of ${ExamState.questions.length}`;
  if (qSubjectEl) qSubjectEl.textContent = q.subject;
  if (qTextEl) qTextEl.textContent = q.text;

  // Update mark for review button state
  if (markBtn) {
    const isMarked = ExamState.marked.has(index);
    markBtn.classList.toggle('active', isMarked);
    markBtn.textContent = isMarked ? '🔖 Marked' : '🔖 Mark for Review';
    markBtn.setAttribute('aria-pressed', isMarked);
  }

  // Render options
  const optionsList = document.getElementById('optionsList');
  if (!optionsList) return;

  optionsList.innerHTML = '';
  const optionKeys = ['A', 'B', 'C', 'D'];

  q.options.forEach((optionText, optIdx) => {
    const isSelected = ExamState.answers[index] === optIdx;

    const li = document.createElement('div');
    li.className = `option-item${isSelected ? ' selected' : ''}`;
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `Option ${optionKeys[optIdx]}: ${optionText}`);
    li.setAttribute('aria-pressed', isSelected);

    li.innerHTML = `
      <div class="option-key">${optionKeys[optIdx]}</div>
      <div class="option-text">${optionText}</div>
    `;

    li.addEventListener('click', () => selectOption(index, optIdx));
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectOption(index, optIdx);
      }
    });

    optionsList.appendChild(li);
  });

  // Update navigation buttons
  updateNavButtons(index);

  // Animate question card
  const card = document.getElementById('questionCard');
  if (card) {
    card.style.animation = 'none';
    card.offsetHeight; // trigger reflow
    card.style.animation = 'slideIn 0.3s ease';
  }
}

function selectOption(qIndex, optIndex) {
  ExamState.answers[qIndex] = optIndex;
  aitStore(AIT_CONFIG.SESSION_KEYS.ANSWERS, ExamState.answers);

  renderQuestion(qIndex); // re-render to show selection
  renderPalette();
  updateSummary();
}

function renderPalette() {
  const grid = document.getElementById('paletteGrid');
  if (!grid) return;

  grid.innerHTML = '';

  ExamState.questions.forEach((_, idx) => {
    const btn = document.createElement('button');
    btn.textContent = idx + 1;
    btn.className = 'palette-btn';
    btn.setAttribute('aria-label', `Go to question ${idx + 1}`);

    if (idx === ExamState.current) btn.classList.add('current');
    else if (ExamState.marked.has(idx)) btn.classList.add('marked');
    else if (ExamState.answers[idx] !== undefined) btn.classList.add('answered');

    btn.addEventListener('click', () => navigateTo(idx));
    grid.appendChild(btn);
  });
}

function updateNavButtons(index) {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitExamBtn');

  const isLast = index === ExamState.questions.length - 1;
  const isFirst = index === 0;

  if (prevBtn) prevBtn.disabled = isFirst;
  if (nextBtn) {
    nextBtn.style.display = isLast ? 'none' : 'flex';
  }
  if (submitBtn) {
    submitBtn.style.display = isLast ? 'flex' : 'none';
  }
}

function updateProgress() {
  const answered = Object.keys(ExamState.answers).length;
  const total = ExamState.questions.length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  const fill = document.getElementById('progressFill');
  const label = document.getElementById('progressLabel');

  if (fill) fill.style.width = `${pct}%`;
  if (label) label.textContent = `${answered} / ${total} Answered`;
}

function updateSummary() {
  const answered = Object.keys(ExamState.answers).length;
  const total = ExamState.questions.length;
  const notAnswered = total - answered;
  const marked = ExamState.marked.size;

  const set = (id, val, cls) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = val;
      if (cls) el.className = `summary-val ${cls}`;
    }
  };

  set('summaryTotal', total);
  set('summaryAnswered', answered, 'green');
  set('summaryNotAnswered', notAnswered, notAnswered > 0 ? 'yellow' : '');
  set('summaryMarked', marked, marked > 0 ? 'yellow' : '');

  updateProgress();
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function navigateTo(index) {
  if (index < 0 || index >= ExamState.questions.length) return;
  ExamState.current = index;
  renderQuestion(index);
  renderPalette();
}

window.prevQuestion = function () {
  navigateTo(ExamState.current - 1);
};

window.nextQuestion = function () {
  navigateTo(ExamState.current + 1);
};

window.toggleMarkReview = function () {
  const idx = ExamState.current;
  if (ExamState.marked.has(idx)) {
    ExamState.marked.delete(idx);
  } else {
    ExamState.marked.add(idx);
  }
  aitStore(AIT_CONFIG.SESSION_KEYS.MARKED, Array.from(ExamState.marked));
  renderQuestion(idx);
  renderPalette();
  updateSummary();
};

/* ============================================================
   SUBMIT EXAM
   ============================================================ */
window.confirmSubmit = function () {
  const answered = Object.keys(ExamState.answers).length;
  const total = ExamState.questions.length;
  const notAnswered = total - answered;

  // Update submit modal stats
  const answeredEl = document.getElementById('modalAnswered');
  const skippedEl = document.getElementById('modalSkipped');
  if (answeredEl) answeredEl.textContent = answered;
  if (skippedEl) skippedEl.textContent = notAnswered;

  showModal('submitConfirmModal');
};

window.cancelSubmit = function () {
  closeModal('submitConfirmModal');
};

window.doSubmit = function () {
  closeModal('submitConfirmModal');
  submitExam(false);
};

async function submitExam(isAutoSubmit = false) {
  if (ExamState.isSubmitting || ExamState.isSubmitted) return;
  ExamState.isSubmitting = true;

  // Stop timer and security
  ExamState.timer?.stop();
  ExamState.security?.deactivate();
  clearInterval(ExamState.autosaveInterval);

  // Remove beforeunload warning
  window.onbeforeunload = null;

  // Final save
  aitStore(AIT_CONFIG.SESSION_KEYS.ANSWERS, ExamState.answers);
  aitStore(AIT_CONFIG.SESSION_KEYS.SUBMITTED, true);

  // Calculate score (client-side for demo; server-side in production)
  const scoreData = calculateExamScore(ExamState.questions, ExamState.answers);
  const scholarship = getScholarship(scoreData.percentage);
  const cheatLog = ExamState.security?.getLog() || [];
  const elapsed = ExamState.timer?.getElapsed() || 0;
  const endTime = new Date().toISOString();

  // Count security events
  const tabSwitches = cheatLog.filter(e => e.type === 'TAB_SWITCH').length;
  const fsExits = cheatLog.filter(e => e.type === 'FULLSCREEN_EXIT').length;
  const copyAttempts = cheatLog.filter(e => e.type === 'COPY_ATTEMPT').length;
  const pasteAttempts = cheatLog.filter(e => e.type === 'PASTE_ATTEMPT').length;
  const refreshAttempts = cheatLog.filter(e => e.type === 'REFRESH_ATTEMPT').length;
  const devToolsAttempts = cheatLog.filter(e => e.type === 'DEVTOOLS_ATTEMPT').length;

  const browserInfo = getBrowserInfo();

  const submissionData = {
    email: ExamState.candidate.email,
    name: ExamState.candidate.name,
    phone: ExamState.candidate.phone,
    college: ExamState.candidate.college,
    district: ExamState.candidate.district,
    course: ExamState.candidate.course,
    startTime: new Date(ExamState.startTime).toISOString(),
    endTime,
    durationSeconds: elapsed,
    // Score data (for Google Sheet calculation)
    answersJson: JSON.stringify(ExamState.answers),
    questionsAttempted: scoreData.attempted,
    correct: scoreData.correct,
    wrong: scoreData.wrong,
    skipped: scoreData.skipped,
    percentage: scoreData.percentage,
    scholarship,
    // Security data
    tabSwitchCount: tabSwitches,
    fullscreenExitCount: fsExits,
    copyAttempts,
    pasteAttempts,
    refreshAttempts,
    devToolsAttempts,
    warnings: ExamState.warnings,
    status: isAutoSubmit ? 'AUTO_SUBMITTED' : 'SUBMITTED',
    browser: browserInfo.browser,
    os: browserInfo.os,
    device: browserInfo.device,
    isAutoSubmit,
  };

  // Show submitting overlay
  showSubmittingOverlay();

  // Submit to API
  try {
    await apiSubmitExam(submissionData);
  } catch (err) {
    // Log locally even if API fails
    console.error('Submission API error:', err);
  }

  ExamState.isSubmitted = true;

  // Clear session
  aitRemove(AIT_CONFIG.SESSION_KEYS.ANSWERS);
  aitRemove(AIT_CONFIG.SESSION_KEYS.MARKED);
  aitRemove(AIT_CONFIG.SESSION_KEYS.QUESTION_ORDER);
  aitRemove(AIT_CONFIG.SESSION_KEYS.OPTION_ORDERS);
  aitRemove(AIT_CONFIG.SESSION_KEYS.CHEAT_LOG);
  aitRemove(AIT_CONFIG.SESSION_KEYS.WARNINGS);
  // Keep SUBMITTED flag and CANDIDATE for thankyou page

  // Redirect to thank you page
  setTimeout(() => {
    window.location.replace('thankyou.html');
  }, 2000);
}

function showSubmittingOverlay() {
  let overlay = document.getElementById('submittingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'submittingOverlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(10,22,40,0.95);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 20px; text-align: center;
    `;
    overlay.innerHTML = `
      <div style="font-size:3rem;">📨</div>
      <h2 style="font-family:'Playfair Display',serif; font-size:1.8rem; color:white;">Submitting Your Exam</h2>
      <p style="color:rgba(255,255,255,0.6); font-size:0.95rem;">Please wait while we submit your answers...</p>
      <div style="width:200px; height:4px; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden;">
        <div style="width:0%; height:100%; background:linear-gradient(90deg,#8b1a1a,#c9a84c); border-radius:2px; animation:loadBar 2s ease forwards;"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
}

/* ============================================================
   MODAL HELPERS
   ============================================================ */
function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('visible');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('visible');
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
let toastTimeout = null;

function showToast(message, duration = 4000) {
  const toast = document.getElementById('warningToast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('visible');

  if (toastTimeout) clearTimeout(toastTimeout);

  if (duration > 0) {
    toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, duration);
  }
}

/* ============================================================
   KEYBOARD NAVIGATION (for exam)
   ============================================================ */
document.addEventListener('keydown', (e) => {
  // These are navigation helpers that should not be blocked by security
  if (e.target.closest('.option-item')) return;

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    nextQuestion();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    prevQuestion();
  } else if (e.key >= '1' && e.key <= '4') {
    // Select option 1-4 with keyboard
    const optIdx = parseInt(e.key) - 1;
    selectOption(ExamState.current, optIdx);
  }
});
