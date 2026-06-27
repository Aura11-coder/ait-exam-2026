/**
 * ============================================================
 * AIT EXAM 2026 - Exam Timer
 * File: js/timer.js
 * ============================================================
 */

'use strict';

class ExamTimer {
  /**
   * @param {Object} options
   * @param {number} options.durationMinutes - Total exam duration in minutes
   * @param {Function} options.onTick - Called every second with (remaining, elapsed)
   * @param {Function} options.onWarning - Called when time is low
   * @param {Function} options.onDanger - Called when very low
   * @param {Function} options.onExpire - Called when timer reaches 0
   * @param {number} options.warningMinutes - When to trigger warning
   * @param {number} options.dangerMinutes - When to trigger danger
   */
  constructor(options = {}) {
    this.durationMinutes = options.durationMinutes || 90;
    this.onTick = options.onTick || (() => {});
    this.onWarning = options.onWarning || (() => {});
    this.onDanger = options.onDanger || (() => {});
    this.onExpire = options.onExpire || (() => {});
    this.warningMinutes = options.warningMinutes || 15;
    this.dangerMinutes = options.dangerMinutes || 5;

    this._interval = null;
    this._startTime = null;
    this._elapsed = 0;
    this._totalSeconds = this.durationMinutes * 60;
    this._warningFired = false;
    this._dangerFired = false;
    this._running = false;
    this._expired = false;
  }

  /**
   * Start the timer
   * @param {number} [elapsedSeconds=0] - Resume from elapsed time
   */
  start(elapsedSeconds = 0) {
    if (this._running) return;

    this._elapsed = elapsedSeconds;
    this._startTime = Date.now() - (elapsedSeconds * 1000);
    this._running = true;
    this._expired = false;

    this._tick(); // Immediate tick
    this._interval = setInterval(() => this._tick(), 1000);
  }

  /**
   * Pause the timer
   */
  pause() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this._running = false;
  }

  /**
   * Resume the timer
   */
  resume() {
    if (!this._running && !this._expired) {
      this._startTime = Date.now() - (this._elapsed * 1000);
      this._running = true;
      this._interval = setInterval(() => this._tick(), 1000);
    }
  }

  /**
   * Stop the timer completely
   */
  stop() {
    this.pause();
    this._expired = true;
  }

  /**
   * Get current elapsed seconds
   */
  getElapsed() {
    return this._elapsed;
  }

  /**
   * Get remaining seconds
   */
  getRemaining() {
    return Math.max(0, this._totalSeconds - this._elapsed);
  }

  /**
   * Internal tick handler
   */
  _tick() {
    this._elapsed = Math.floor((Date.now() - this._startTime) / 1000);
    const remaining = this.getRemaining();

    // Trigger callbacks
    this.onTick(remaining, this._elapsed);

    // Warning threshold
    if (!this._warningFired && remaining <= this.warningMinutes * 60) {
      this._warningFired = true;
      this.onWarning(remaining);
    }

    // Danger threshold
    if (!this._dangerFired && remaining <= this.dangerMinutes * 60) {
      this._dangerFired = true;
      this.onDanger(remaining);
    }

    // Expired
    if (remaining <= 0 && !this._expired) {
      this._expired = true;
      this.stop();
      this.onExpire();
    }
  }

  /**
   * Format seconds to HH:MM:SS
   * @param {number} seconds
   * @returns {string}
   */
  static formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /**
   * Format seconds to human-readable string
   * @param {number} seconds
   * @returns {string}
   */
  static formatHuman(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h} hour${h > 1 ? 's' : ''}`;
    return `${m} minute${m !== 1 ? 's' : ''}`;
  }
}
