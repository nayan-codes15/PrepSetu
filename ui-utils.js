/**
 * ui-utils.js — PrepSetu AI Feedback & UI System
 * ──────────────────────────────────────────────
 * Provides:
 * 1. Non-blocking Toast Notification Engine (Success, Error, Info, Achievement)
 * 2. Promise-based Modal Confirm Dialog (replaces browser confirm/alert)
 * 3. Zero-asset Web Audio Synthesizer (Success chime, error buzz, timer bell)
 * 4. Skeleton Loading Generators
 */

// Inject CSS styles for toasts and dialogs dynamically if not already present
(function initUIStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('prepsetu-ui-styles')) return;

  const style = document.createElement('style');
  style.id = 'prepsetu-ui-styles';
  style.textContent = `
    /* Toast Container */
    #prepsetu-toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
      max-width: 380px;
      width: calc(100% - 48px);
    }

    .prepsetu-toast {
      pointer-events: auto;
      background: rgba(10, 16, 32, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 14px 18px;
      color: #fff;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 14px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255,255,255,0.2);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      position: relative;
      overflow: hidden;
      transform: translateX(120%);
      opacity: 0;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    }

    .prepsetu-toast.show {
      transform: translateX(0);
      opacity: 1;
    }

    .prepsetu-toast.hide {
      transform: translateX(120%);
      opacity: 0;
    }

    .prepsetu-toast-icon {
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .prepsetu-toast-content {
      flex: 1;
      line-height: 1.45;
    }

    .prepsetu-toast-title {
      font-weight: 700;
      font-family: 'Syne', sans-serif;
      margin-bottom: 2px;
      font-size: 14px;
    }

    .prepsetu-toast-desc {
      color: rgba(255, 255, 255, 0.75);
      font-size: 13px;
    }

    .prepsetu-toast-close {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      font-size: 16px;
      padding: 0;
      line-height: 1;
      transition: color 0.2s;
    }
    .prepsetu-toast-close:hover {
      color: #fff;
    }

    .prepsetu-toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
    }

    .prepsetu-toast-progress-bar {
      height: 100%;
      width: 100%;
      transform-origin: left;
    }

    /* Toast Variants */
    .prepsetu-toast.success { border-color: rgba(52, 199, 89, 0.4); }
    .prepsetu-toast.success .prepsetu-toast-title { color: #34c759; }
    .prepsetu-toast.success .prepsetu-toast-progress-bar { background: #34c759; }

    .prepsetu-toast.error { border-color: rgba(255, 59, 48, 0.4); }
    .prepsetu-toast.error .prepsetu-toast-title { color: #ff453a; }
    .prepsetu-toast.error .prepsetu-toast-progress-bar { background: #ff453a; }

    .prepsetu-toast.info { border-color: rgba(0, 71, 171, 0.5); }
    .prepsetu-toast.info .prepsetu-toast-title { color: #60a5fa; }
    .prepsetu-toast.info .prepsetu-toast-progress-bar { background: #0047ab; }

    .prepsetu-toast.achievement {
      border-color: rgba(255, 136, 0, 0.6);
      background: linear-gradient(135deg, rgba(20, 16, 5, 0.95), rgba(10, 16, 32, 0.95));
      box-shadow: 0 10px 30px rgba(255, 136, 0, 0.2);
    }
    .prepsetu-toast.achievement .prepsetu-toast-title { color: #ffac4d; }
    .prepsetu-toast.achievement .prepsetu-toast-progress-bar { background: linear-gradient(90deg, #ff8800, #ffac4d); }

    /* Modal Confirm Dialog */
    #prepsetu-confirm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(2, 4, 10, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }

    #prepsetu-confirm-overlay.show {
      opacity: 1;
      pointer-events: auto;
    }

    .prepsetu-confirm-card {
      background: #090e1f;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      max-width: 440px;
      width: 100%;
      padding: 28px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      transform: scale(0.92);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    #prepsetu-confirm-overlay.show .prepsetu-confirm-card {
      transform: scale(1);
    }

    .prepsetu-confirm-title {
      font-family: 'Syne', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 12px;
    }

    .prepsetu-confirm-body {
      color: rgba(255, 255, 255, 0.75);
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .prepsetu-confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .prepsetu-confirm-btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .prepsetu-confirm-cancel {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }
    .prepsetu-confirm-cancel:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .prepsetu-confirm-ok {
      background: linear-gradient(135deg, #ff8800, #ff5500);
      color: #fff;
      box-shadow: 0 4px 15px rgba(255, 136, 0, 0.3);
    }
    .prepsetu-confirm-ok:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);
})();

/**
 * Ensures toast container exists in DOM
 */
function getToastContainer() {
  let container = document.getElementById('prepsetu-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'prepsetu-toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Display a modern non-blocking Toast notification
 * @param {string} message - Main toast message
 * @param {'success'|'error'|'info'|'achievement'} type - Toast type
 * @param {string} title - Optional title
 * @param {number} durationMs - Auto-dismiss timeout in ms (default 3500)
 */
export function showToast(message, type = 'info', title = null, durationMs = 3500) {
  if (typeof document === 'undefined') return;

  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `prepsetu-toast ${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    achievement: '🏆'
  };

  const defaultTitles = {
    success: 'Success',
    error: 'Attention Required',
    info: 'Information',
    achievement: 'Achievement Unlocked!'
  };

  const finalTitle = title || defaultTitles[type] || 'Notice';

  toast.innerHTML = `
    <div class="prepsetu-toast-icon">${iconMap[type] || '•'}</div>
    <div class="prepsetu-toast-content">
      <div class="prepsetu-toast-title">${finalTitle}</div>
      <div class="prepsetu-toast-desc">${message}</div>
    </div>
    <button class="prepsetu-toast-close" title="Close">×</button>
    <div class="prepsetu-toast-progress">
      <div class="prepsetu-toast-progress-bar"></div>
    </div>
  `;

  container.appendChild(toast);

  // Play auditory cue if sound is enabled
  playSound(type);

  // Trigger confetti burst if achievement
  if (type === 'achievement' && typeof window.confetti === 'function') {
    window.confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.2, x: 0.85 },
      zIndex: 100000
    });
  }

  // Animation frame for entrance
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Progress bar animation
  const progressBar = toast.querySelector('.prepsetu-toast-progress-bar');
  if (progressBar) {
    progressBar.style.transition = `transform ${durationMs}ms linear`;
    requestAnimationFrame(() => {
      progressBar.style.transform = 'scaleX(0)';
    });
  }

  const dismiss = () => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 350);
  };

  const timer = setTimeout(dismiss, durationMs);

  toast.querySelector('.prepsetu-toast-close').addEventListener('click', () => {
    clearTimeout(timer);
    dismiss();
  });
}

/**
 * Promise-based confirmation modal dialog
 * @param {string} title
 * @param {string} message
 * @param {string} confirmText
 * @param {string} cancelText
 * @returns {Promise<boolean>}
 */
export function showConfirmDialog(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
  return new Promise((resolve) => {
    let overlay = document.getElementById('prepsetu-confirm-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'prepsetu-confirm-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="prepsetu-confirm-card">
        <div class="prepsetu-confirm-title">${title}</div>
        <div class="prepsetu-confirm-body">${message}</div>
        <div class="prepsetu-confirm-actions">
          <button class="prepsetu-confirm-btn prepsetu-confirm-cancel" id="prepsetu-confirm-cancel-btn">${cancelText}</button>
          <button class="prepsetu-confirm-btn prepsetu-confirm-ok" id="prepsetu-confirm-ok-btn">${confirmText}</button>
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      overlay.classList.add('show');
    });

    const cleanup = (result) => {
      overlay.classList.remove('show');
      setTimeout(() => {
        if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
      }, 250);
      resolve(result);
    };

    document.getElementById('prepsetu-confirm-cancel-btn').addEventListener('click', () => cleanup(false));
    document.getElementById('prepsetu-confirm-ok-btn').addEventListener('click', () => cleanup(true));
  });
}

/**
 * Zero-asset audio synthesis using Web Audio API
 */
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

export function playSound(soundType) {
  try {
    // Check if user disabled sound in settings
    const settingsRaw = localStorage.getItem('prepsetu_settings');
    if (settingsRaw) {
      const settings = JSON.parse(settingsRaw);
      if (settings && settings.sound === false) return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (soundType === 'success' || soundType === 'achievement') {
      // Pleasant upward major triad
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (soundType === 'error') {
      // Gentle low buzz
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (soundType === 'timer') {
      // Clear bell chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  } catch (e) {
    // Audio context may be prevented until first user interaction; silently ignore
  }
}

// Global attachment
if (typeof window !== 'undefined') {
  window.UIUtils = {
    showToast,
    showConfirmDialog,
    playSound
  };
}
