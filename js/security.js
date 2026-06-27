/**
 * ============================================================
 * AIT EXAM 2026 - Security Module
 * File: js/security.js
 * ============================================================
 */

'use strict';

class ExamSecurity {
  /**
   * @param {Object} options
   * @param {string} options.email - Candidate email (for logging)
   * @param {Function} options.onViolation - Called with (eventType, count)
   * @param {Function} options.onAutoSubmit - Called when violations exceed limit
   * @param {number} options.warningLimit - Max warnings before auto-submit
   */
  constructor(options = {}) {
    this.email = options.email || '';
    this.onViolation = options.onViolation || (() => {});
    this.onAutoSubmit = options.onAutoSubmit || (() => {});
    this.warningLimit = options.warningLimit || 3;

    this._violations = 0;
    this._log = [];
    this._active = false;
    this._boundHandlers = {};
  }

  /**
   * Activate all security measures
   */
  activate() {
    if (this._active) return;
    this._active = true;

    this._disableContextMenu();
    this._disableKeyboardShortcuts();
    this._disableTextSelection();
    this._disableCopyPaste();
    this._detectTabSwitch();
    this._detectWindowBlur();
    this._detectDevTools();
    this._detectPrint();
    this._blockBackButton();
    this._preventRefresh();
  }

  /**
   * Deactivate security (after exam ends)
   */
  deactivate() {
    this._active = false;

    Object.entries(this._boundHandlers).forEach(([event, handler]) => {
      document.removeEventListener(event, handler, true);
      window.removeEventListener(event, handler, true);
    });

    this._boundHandlers = {};
  }

  /**
   * Log a cheat event
   * @param {string} type
   * @param {Object} meta
   */
  logEvent(type, meta = {}) {
    const entry = {
      type,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    this._log.push(entry);

    // Persist log
    const existing = aitRead(AIT_CONFIG.SESSION_KEYS.CHEAT_LOG) || [];
    aitStore(AIT_CONFIG.SESSION_KEYS.CHEAT_LOG, [...existing, entry]);

    // Non-critical events: just log
    const nonCritical = ['COPY_ATTEMPT', 'PASTE_ATTEMPT', 'PRINT_ATTEMPT', 'DEVTOOLS_ATTEMPT'];

    if (!nonCritical.includes(type)) {
      this._violations++;
      aitStore(AIT_CONFIG.SESSION_KEYS.WARNINGS, this._violations);
      this.onViolation(type, this._violations);

      if (this._violations >= this.warningLimit) {
        this.onAutoSubmit(type, this._violations);
      }
    }

    // Report to API (non-blocking)
    if (this.email) {
      apiLogCheat(this.email, type, meta).catch(() => {});
    }
  }

  /**
   * Get all logged events
   */
  getLog() {
    return [...this._log];
  }

  /**
   * Get violation count
   */
  getViolations() {
    return this._violations;
  }

  /* ============================================================
     PRIVATE SECURITY METHODS
     ============================================================ */

  _disableContextMenu() {
    const handler = (e) => {
      e.preventDefault();
      this.logEvent('CONTEXT_MENU');
      return false;
    };
    document.addEventListener('contextmenu', handler, true);
    this._boundHandlers['contextmenu'] = handler;
  }

  _disableKeyboardShortcuts() {
    const blocked = new Set([
      'F12', 'F5', 'F11'
    ]);

    const blockedCtrl = new Set([
      'c', 'v', 'x', 'u', 's', 'p', 'a',
      'C', 'V', 'X', 'U', 'S', 'P', 'A'
    ]);

    const blockedCtrlShift = new Set([
      'i', 'j', 'c', 'I', 'J', 'C'
    ]);

    const handler = (e) => {
      if (!this._active) return;

      const key = e.key;

      // Block function keys
      if (blocked.has(key)) {
        e.preventDefault();
        e.stopPropagation();

        if (key === 'F12') this.logEvent('DEVTOOLS_ATTEMPT', { key });
        else if (key === 'F5') this.logEvent('REFRESH_ATTEMPT', { key });
        return false;
      }

      // Block Ctrl/Cmd combos
      if (e.ctrlKey || e.metaKey) {
        if (blockedCtrl.has(key)) {
          e.preventDefault();
          e.stopPropagation();

          const eventMap = {
            'c': 'COPY_ATTEMPT', 'C': 'COPY_ATTEMPT',
            'v': 'PASTE_ATTEMPT', 'V': 'PASTE_ATTEMPT',
            'x': 'CUT_ATTEMPT', 'X': 'CUT_ATTEMPT',
            'u': 'VIEW_SOURCE_ATTEMPT', 'U': 'VIEW_SOURCE_ATTEMPT',
            's': 'SAVE_ATTEMPT', 'S': 'SAVE_ATTEMPT',
            'p': 'PRINT_ATTEMPT', 'P': 'PRINT_ATTEMPT',
          };

          this.logEvent(eventMap[key] || 'KEYBOARD_SHORTCUT', { key });
          return false;
        }

        // Ctrl+Shift combos
        if (e.shiftKey && blockedCtrlShift.has(key)) {
          e.preventDefault();
          e.stopPropagation();
          this.logEvent('DEVTOOLS_ATTEMPT', { key: `Ctrl+Shift+${key}` });
          return false;
        }
      }
    };

    document.addEventListener('keydown', handler, true);
    this._boundHandlers['keydown'] = handler;
  }

  _disableTextSelection() {
    const handler = (e) => {
      if (!this._active) return;
      e.preventDefault();
    };

    document.addEventListener('selectstart', handler, true);
    this._boundHandlers['selectstart'] = handler;

    // CSS-level selection disable via style
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
  }

  _disableCopyPaste() {
    ['copy', 'cut', 'paste'].forEach(evtName => {
      const handler = (e) => {
        if (!this._active) return;
        e.preventDefault();
        const eventMap = { copy: 'COPY_ATTEMPT', cut: 'CUT_ATTEMPT', paste: 'PASTE_ATTEMPT' };
        this.logEvent(eventMap[evtName]);
        return false;
      };
      document.addEventListener(evtName, handler, true);
      this._boundHandlers[evtName] = handler;
    });

    // Drag events
    ['dragstart', 'drop'].forEach(evtName => {
      const handler = (e) => {
        if (!this._active) return;
        e.preventDefault();
      };
      document.addEventListener(evtName, handler, true);
      this._boundHandlers[evtName] = handler;
    });
  }

  _detectTabSwitch() {
    const handler = () => {
      if (!this._active) return;
      if (document.hidden || document.visibilityState === 'hidden') {
        this.logEvent('TAB_SWITCH');
      }
    };

    document.addEventListener('visibilitychange', handler);
    this._boundHandlers['visibilitychange'] = handler;
  }

  _detectWindowBlur() {
    const handler = () => {
      if (!this._active) return;
      this.logEvent('WINDOW_BLUR');
    };

    window.addEventListener('blur', handler);
    this._boundHandlers['blur'] = handler;
  }

  _detectDevTools() {
    // Console-based detection
    let devToolsOpen = false;
    const threshold = 160;

    const detectSize = () => {
      if (!this._active) return;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          this.logEvent('DEVTOOLS_ATTEMPT', { method: 'resize' });
        }
      } else {
        devToolsOpen = false;
      }
    };

    window.addEventListener('resize', detectSize);

    // toString override detection (fires when console is opened)
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: () => {
        if (this._active) {
          this.logEvent('DEVTOOLS_ATTEMPT', { method: 'console' });
        }
      }
    });

    // Periodic check
    setInterval(detectSize, 1500);
  }

  _detectPrint() {
    window.addEventListener('beforeprint', () => {
      if (!this._active) return;
      this.logEvent('PRINT_ATTEMPT');
    });

    const matchMedia = window.matchMedia('print');
    if (matchMedia.addEventListener) {
      matchMedia.addEventListener('change', (e) => {
        if (e.matches && this._active) {
          this.logEvent('PRINT_ATTEMPT');
        }
      });
    }
  }

  _blockBackButton() {
    history.pushState(null, null, location.href);

    const handler = () => {
      if (!this._active) return;
      history.pushState(null, null, location.href);
      this.logEvent('BACK_BUTTON');
    };

    window.addEventListener('popstate', handler);
    this._boundHandlers['popstate'] = handler;
  }

  _preventRefresh() {
    const handler = (e) => {
      if (!this._active) return;
      e.preventDefault();
      e.returnValue = 'Your exam is in progress. Leaving will submit your exam.';
      this.logEvent('REFRESH_ATTEMPT');
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handler);
    this._boundHandlers['beforeunload'] = handler;
  }
}

/* ============================================================
   FULLSCREEN MANAGER
   ============================================================ */
class FullscreenManager {
  constructor(onExit) {
    this.onExit = onExit || (() => {});
    this._active = false;

    document.addEventListener('fullscreenchange', () => this._handleChange());
    document.addEventListener('webkitfullscreenchange', () => this._handleChange());
    document.addEventListener('mozfullscreenchange', () => this._handleChange());
    document.addEventListener('MSFullscreenChange', () => this._handleChange());
  }

  /**
   * Enter fullscreen mode
   */
  async enter() {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      this._active = true;
    } catch (e) {
      console.warn('Fullscreen not available:', e);
    }
  }

  /**
   * Exit fullscreen mode (admin use)
   */
  async exit() {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) await document.mozCancelFullScreen();
      else if (document.msExitFullscreen) await document.msExitFullscreen();
    } catch (e) { /* noop */ }
    this._active = false;
  }

  /**
   * Check if currently in fullscreen
   */
  isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  _handleChange() {
    if (this._active && !this.isFullscreen()) {
      this.onExit();
    }
  }
}
