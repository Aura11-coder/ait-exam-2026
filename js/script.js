/**
 * ============================================================
 * AIT EXAM 2026 - Main Script (Landing Page)
 * File: js/script.js
 * ============================================================
 */

'use strict';

/* ============================================================
   DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initParticles();
  initNavbar();
  initCounters();
  initRegistrationForm();
  initScrollAnimations();
  initSmoothScroll();
});

/* ============================================================
   PAGE LOADER
   ============================================================ */
function initPageLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 800);
  });

  // Fallback
  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
  }, 2500);
}

/* ============================================================
   BACKGROUND PARTICLES
   ============================================================ */
function initParticles() {
  const container = document.getElementById('bgParticles');
  if (!container) return;

  const particleCount = window.innerWidth < 768 ? 8 : 15;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.random() * 120 + 40;
    const left = Math.random() * 100;
    const duration = Math.random() * 30 + 25;
    const delay = Math.random() * 20;

    // Alternate colors
    const colors = [
      'rgba(139,26,26,0.15)',
      'rgba(26,60,110,0.15)',
      'rgba(201,168,76,0.08)',
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      background: radial-gradient(circle, ${color}, transparent);
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
    `;

    container.appendChild(p);
  }
}

/* ============================================================
   NAVBAR SCROLL EFFECT
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
}

/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
function initCounters() {
  const counters = [
    { id: 'counter1', target: 2500, suffix: '' },
    { id: 'counter2', target: 95, suffix: '' },
    { id: 'counter3', target: 30, suffix: '' },
    { id: 'counter4', target: 8, suffix: '' },
  ];

  const animateCounter = (el, target, duration = 2000) => {
    let start = 0;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  // Use IntersectionObserver to trigger when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counters.forEach(({ id, target }) => {
          const el = document.getElementById(id);
          if (el) animateCounter(el, target);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const statsRow = document.querySelector('.stats-row');
  if (statsRow) observer.observe(statsRow);
}

/* ============================================================
   SCROLL ANIMATIONS
   ============================================================ */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.scholarship-card, .feature-item, .schedule-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ============================================================
   REGISTRATION FORM
   ============================================================ */
function initRegistrationForm() {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const confirmStartBtn = document.getElementById('confirmStartBtn');

  // Validation rules
  const validators = {
    fullName: (v) => v.trim().length >= 2,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    phone: (v) => /^[+]?[\d\s\-]{10,15}$/.test(v.trim()),
    college: (v) => v.trim().length >= 3,
    district: (v) => v !== '',
    course: (v) => v !== '',
    agreeTerms: () => document.getElementById('agreeTerms').checked,
  };

  const errorMessages = {
    fullName: 'Please enter your full name (minimum 2 characters).',
    email: 'Please enter a valid email address.',
    phone: 'Please enter a valid 10-digit phone number.',
    college: 'Please enter your college or institution name.',
    district: 'Please select your district.',
    course: 'Please select a course you are interested in.',
    agreeTerms: 'You must agree to the examination rules to proceed.',
  };

  // Real-time validation on input
  ['fullName', 'email', 'phone', 'college'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('input', () => {
      validateField(id, input.value, validators[id], errorMessages[id]);
    });
    input.addEventListener('blur', () => {
      validateField(id, input.value, validators[id], errorMessages[id]);
    });
  });

  ['district', 'course'].forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    select.addEventListener('change', () => {
      validateField(id, select.value, validators[id], errorMessages[id]);
    });
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmit(validators, errorMessages, submitBtn);
  });

  // Confirm Start button
  if (confirmStartBtn) {
    confirmStartBtn.addEventListener('click', () => {
      const candidate = aitRead(AIT_CONFIG.SESSION_KEYS.CANDIDATE);
      if (!candidate) return;
      closeModal('confirmStartModal');
      launchExam();
    });
  }
}

/**
 * Validate a single field and toggle error message
 */
function validateField(id, value, validatorFn, errorMsg) {
  const input = document.getElementById(id);
  const errorEl = document.getElementById(`${id}Error`);

  if (!input || !errorEl) return true;

  const isValid = validatorFn(value);
  input.classList.toggle('error', !isValid);
  input.classList.toggle('success', isValid && value !== '');
  errorEl.classList.toggle('visible', !isValid);
  if (errorEl.textContent !== errorMsg) errorEl.textContent = errorMsg;

  return isValid;
}

/**
 * Validate all form fields
 */
function validateAllFields(validators, errorMessages) {
  const fields = {
    fullName: document.getElementById('fullName')?.value || '',
    email: document.getElementById('email')?.value || '',
    phone: document.getElementById('phone')?.value || '',
    college: document.getElementById('college')?.value || '',
    district: document.getElementById('district')?.value || '',
    course: document.getElementById('course')?.value || '',
    agreeTerms: '',
  };

  let isValid = true;

  Object.keys(validators).forEach(id => {
    const value = fields[id] || '';
    if (!validateField(id, value, validators[id], errorMessages[id])) {
      isValid = false;
    }
  });

  return isValid;
}

/**
 * Handle form submission
 */
async function handleFormSubmit(validators, errorMessages, submitBtn) {
  // Clear alerts
  hideAllAlerts();

  // Validate all fields
  if (!validateAllFields(validators, errorMessages)) {
    showAlert('formAlertError', 'Please fill all required fields correctly.');

    // Scroll to first error
    const firstError = document.querySelector('.form-input.error, .form-select.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Collect form data
  const candidateData = {
    name: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim().toLowerCase(),
    phone: document.getElementById('phone').value.trim(),
    college: document.getElementById('college').value.trim(),
    district: document.getElementById('district').value,
    course: document.getElementById('course').value,
  };

  // Set loading state
  setButtonLoading(submitBtn, true);

  try {
    // Check if email already exists
    // null = CORS blocked the GET — allow proceeding (GAS CORS limitation)
    const emailCheck = await apiCheckEmail(candidateData.email);

    if (emailCheck && emailCheck.exists === true) {
      setButtonLoading(submitBtn, false);
      showModal('alreadyAttendedModal');
      return;
    }

    // Register candidate — fire-and-forget (no-cors, non-blocking)
    apiRegisterCandidate(candidateData).catch(() => {});

    // Save candidate data in session
    aitStore(AIT_CONFIG.SESSION_KEYS.CANDIDATE, candidateData);
    aitStore(AIT_CONFIG.SESSION_KEYS.START_TIME, Date.now());
    aitStore(AIT_CONFIG.SESSION_KEYS.WARNINGS, 0);
    aitStore(AIT_CONFIG.SESSION_KEYS.CHEAT_LOG, []);

    setButtonLoading(submitBtn, false);

    // Show confirmation modal
    showModal('confirmStartModal');

  } catch (err) {
    setButtonLoading(submitBtn, false);
    console.error('Registration error:', err);
    showAlert('formAlertError', `Registration failed: ${err.message}. Please try again.`);
  }
}

/**
 * Launch the exam page
 */
function launchExam() {
  // Small delay for visual feedback
  setTimeout(() => {
    window.location.href = 'exam.html';
  }, 300);
}

/* ============================================================
   MODAL HELPERS
   ============================================================ */
function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    // Focus first button for accessibility
    const btn = modal.querySelector('button');
    if (btn) setTimeout(() => btn.focus(), 100);
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
  }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('visible');
  }
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.visible').forEach(m => {
      m.classList.remove('visible');
    });
  }
});

/* ============================================================
   ALERT HELPERS
   ============================================================ */
function showAlert(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  const textEl = el.querySelector('span:last-child') || el;
  if (textEl) textEl.textContent = message;
  el.classList.add('visible');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideAllAlerts() {
  document.querySelectorAll('.alert').forEach(el => el.classList.remove('visible'));
}

/* ============================================================
   BUTTON LOADING STATE
   ============================================================ */
function setButtonLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);

  const textEl = btn.querySelector('.btn-text');
  if (textEl) {
    textEl.textContent = loading ? 'Verifying...' : '✍️ Start Exam →';
  }
}
