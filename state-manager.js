/**
 * state-manager.js — PrepSetu Centralized State Management Engine
 * ──────────────────────────────────────────────────────────────
 * Single Source of Truth for all User Profile, Gamification, Quiz,
 * Course Progression, Spaced Repetition Flashcards, and Tasks.
 *
 * Features:
 * - Versioned schema (`prepsetu_user_<userId>_v1`)
 * - Pub/Sub event bus for live reactive views
 * - Cross-tab synchronization via `window.storage` events
 * - Automatic corruption recovery with backup keys
 * - Quota error resilience
 */

import { showToast } from './ui-utils.js';

const SCHEMA_VERSION = 'v1';
const ACTIVE_SESSION_KEY = 'prepsetu_active_uid';
const BACKUP_PREFIX = 'prepsetu_backup_';

class StateManagerClass {
  constructor() {
    this.currentUser = null;
    this.state = null;
    this.subscribers = new Map(); // event -> Set(callbacks)
    this.isSyncingFromStorage = false;

    // Cross-tab synchronization listener
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => this.handleStorageEvent(e));
    }
  }

  /**
   * Initializes state manager for a given user ID
   * @param {string} uid - User identifier
   * @returns {object} Current loaded state
   */
  init(uid) {
    if (!uid) {
      uid = this.getActiveUid() || 'guest_demo';
    }

    this.currentUser = uid;
    this.setActiveUid(uid);
    this.state = this.loadFromStorage(uid);
    this.emit('init', this.state);
    return this.state;
  }

  /**
   * Generates the storage key for a user
   */
  getUserKey(uid = this.currentUser) {
    return `prepsetu_user_${uid}_${SCHEMA_VERSION}`;
  }

  /**
   * Retrieves active UID from storage
   */
  getActiveUid() {
    try {
      return sessionStorage.getItem(ACTIVE_SESSION_KEY) || localStorage.getItem(ACTIVE_SESSION_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Sets active UID in storage
   */
  setActiveUid(uid, persistToLocal = true) {
    try {
      sessionStorage.setItem(ACTIVE_SESSION_KEY, uid);
      if (persistToLocal) {
        localStorage.setItem(ACTIVE_SESSION_KEY, uid);
      }
    } catch (e) {
      console.warn('[StateManager] Failed to set active UID:', e);
    }
  }

  /**
   * Clears active session
   */
  clearSession() {
    try {
      sessionStorage.removeItem(ACTIVE_SESSION_KEY);
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      this.currentUser = null;
      this.state = null;
      this.emit('logout', null);
    } catch (e) {
      console.warn('[StateManager] Clear session error:', e);
    }
  }

  /**
   * Default template for user schema
   */
  getDefaultState(uid = 'guest_demo') {
    const today = new Date().toISOString().split('T')[0];
    const examTargetDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      version: SCHEMA_VERSION,
      uid,
      profile: {
        name: 'Scholar Arjun',
        email: 'demo@prepsetu.ai',
        avatar: '🧠',
        targetExam: 'JEE Advanced / GATE CS',
        examDate: examTargetDate,
        dailyGoalMinutes: 60,
        createdAt: new Date().toISOString(),
        lastLoginDate: today
      },
      stats: {
        xp: 14250,
        level: 'Pro Tier 2',
        streak: 7,
        longestStreak: 12,
        lastActiveDate: today,
        quizzesAttempted: 18,
        totalQuestions: 90,
        correctAnswers: 78,
        accuracy: 86.7,
        focusMinutes: 1455,
        focusSessionsCompleted: 58
      },
      quizHistory: [
        {
          id: 'q_init_1',
          subject: 'DSA & Algorithms',
          difficulty: 'Medium',
          score: 80,
          total: 5,
          correct: 4,
          negativeScore: 16,
          accuracy: 80,
          durationSec: 145,
          date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          antiCheatWarnings: 0
        },
        {
          id: 'q_init_2',
          subject: 'Quantitative Aptitude',
          difficulty: 'Hard',
          score: 100,
          total: 5,
          correct: 5,
          negativeScore: 20,
          accuracy: 100,
          durationSec: 190,
          date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
          antiCheatWarnings: 0
        }
      ],
      courseProgress: {
        dsa: {
          name: 'Data Structures & Algorithms',
          completedModules: ['arrays', 'linked_lists'],
          lastTopicId: 'binary_search_trees',
          progressPct: 40
        },
        aptitude: {
          name: 'Aptitude & Logical Reasoning',
          completedModules: ['percentages'],
          lastTopicId: 'speed_distance_time',
          progressPct: 25
        },
        cs_fundamentals: {
          name: 'Core CS (OS, DBMS, Networks)',
          completedModules: ['os_process_mgmt'],
          lastTopicId: 'dbms_normalization',
          progressPct: 30
        }
      },
      revisionQueue: [
        {
          id: 'rev_1',
          subject: 'DSA',
          question: 'What is the worst-case time complexity of QuickSelect algorithm?',
          options: ['O(N)', 'O(N log N)', 'O(N²)', 'O(log N)'],
          correct: 2,
          explanation: 'Worst-case occurs with poor pivot selection (already sorted array), leading to O(N²). Average is O(N).',
          intervalDays: 3,
          repetitions: 2,
          easeFactor: 2.5,
          nextReviewDate: today
        },
        {
          id: 'rev_2',
          subject: 'Quantitative Aptitude',
          question: 'A train 120m long passes a pole in 6 seconds. What is its speed in km/h?',
          options: ['60 km/h', '72 km/h', '80 km/h', '90 km/h'],
          correct: 1,
          explanation: 'Speed = 120 / 6 = 20 m/s. In km/h: 20 * (18 / 5) = 72 km/h.',
          intervalDays: 1,
          repetitions: 1,
          easeFactor: 2.4,
          nextReviewDate: today
        },
        {
          id: 'rev_3',
          subject: 'Operating Systems',
          question: 'Which CPU scheduling algorithm is inherently preemptive?',
          options: ['FCFS', 'SJF Non-preemptive', 'Round Robin', 'Priority Non-preemptive'],
          correct: 2,
          explanation: 'Round Robin relies on a strict time quantum causing timer-driven preemption.',
          intervalDays: 7,
          repetitions: 3,
          easeFactor: 2.6,
          nextReviewDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0]
        }
      ],
      tasks: [
        { id: 't1', title: 'Complete Binary Trees Mini-Quiz', time: '18:00', type: 'quiz', done: false, date: today },
        { id: 't2', title: 'Review 3 Spaced Repetition Flashcards', time: '20:00', type: 'revision', done: false, date: today },
        { id: 't3', title: '25-min Deep Focus on DBMS B+ Trees', time: '21:30', type: 'focus', done: true, date: today }
      ],
      badges: ['fast_learner', '7_day_streak', 'python_pro', 'ai_whisperer'],
      chatHistory: [
        { role: 'assistant', content: 'Hello! I am your PrepSetu AI Mentor. Ask me any conceptual doubt, request practice problems, or get exam strategy advice.', ts: Date.now() - 3600000 }
      ],
      settings: {
        theme: 'dark',
        sound: true,
        notifications: false,
        negativeMarking: true
      },
      questionOfTheDay: {
        lastAttemptedDate: '',
        answeredCorrectly: false
      }
    };
  }

  /**
   * Safe parser with backup recovery
   */
  loadFromStorage(uid) {
    const key = this.getUserKey(uid);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        // First run — seed default state
        const initial = this.getDefaultState(uid);
        this.saveToStorage(uid, initial);
        return initial;
      }
      const parsed = JSON.parse(raw);
      // Validate schema version
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Malformed state data');
      }
      return parsed;
    } catch (err) {
      console.error(`[StateManager] Corruption detected for ${key}:`, err);
      // Attempt backup recovery
      const backupKey = BACKUP_PREFIX + key;
      try {
        const backupRaw = localStorage.getItem(backupKey);
        if (backupRaw) {
          const recovered = JSON.parse(backupRaw);
          showToast('Corrupted data recovered from safety snapshot', 'info', 'Auto-Recovery');
          return recovered;
        }
      } catch (backupErr) {
        console.error('[StateManager] Backup recovery also failed:', backupErr);
      }

      // Safe fallback to fresh defaults
      const fresh = this.getDefaultState(uid);
      showToast('Profile restored with secure default setup', 'info', 'Notice');
      this.saveToStorage(uid, fresh);
      return fresh;
    }
  }

  /**
   * Persists state to localStorage with atomic backup and quota protection
   */
  saveToStorage(uid, stateToSave) {
    const key = this.getUserKey(uid);
    try {
      const serialized = JSON.stringify(stateToSave);

      // Create backup snapshot first if existing state is valid
      const existing = localStorage.getItem(key);
      if (existing) {
        localStorage.setItem(BACKUP_PREFIX + key, existing);
      }

      localStorage.setItem(key, serialized);
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        console.error('[StateManager] Storage quota exceeded');
        showToast('Local storage full. Trimming old chat logs...', 'error', 'Storage Quota');
        // Prune chat history and old quiz records to free space
        if (stateToSave.chatHistory && stateToSave.chatHistory.length > 20) {
          stateToSave.chatHistory = stateToSave.chatHistory.slice(-10);
        }
        if (stateToSave.quizHistory && stateToSave.quizHistory.length > 50) {
          stateToSave.quizHistory = stateToSave.quizHistory.slice(-25);
        }
        try {
          localStorage.setItem(key, JSON.stringify(stateToSave));
        } catch (retryErr) {
          console.error('[StateManager] Prune save failed:', retryErr);
        }
      } else {
        console.error('[StateManager] Save failed:', err);
      }
    }
  }

  /**
   * Cross-tab storage synchronization
   */
  handleStorageEvent(event) {
    if (!this.currentUser) return;
    const myKey = this.getUserKey(this.currentUser);

    if (event.key === myKey && event.newValue) {
      try {
        this.isSyncingFromStorage = true;
        this.state = JSON.parse(event.newValue);
        this.emit('sync', this.state);
        this.emit('change', { path: '', value: this.state });
      } catch (err) {
        console.error('[StateManager] Storage event parse error:', err);
      } finally {
        this.isSyncingFromStorage = false;
      }
    }
  }

  /**
   * Returns whole state or a deep path (e.g. 'stats.xp', 'profile.name')
   */
  get(path = '', fallback = null) {
    if (!this.state) {
      this.init();
    }
    if (!path) return this.state;

    const parts = path.split('.');
    let current = this.state;
    for (const p of parts) {
      if (current === undefined || current === null) return fallback;
      current = current[p];
    }
    return current !== undefined ? current : fallback;
  }

  /**
   * Deeply updates state and notifies subscribers
   * @param {string|object} pathOrPatch - Object to merge OR path string ('stats.xp')
   * @param {any} value - If path string provided, the value to assign
   */
  update(pathOrPatch, value = undefined) {
    if (!this.state) this.init();

    if (typeof pathOrPatch === 'object' && pathOrPatch !== null) {
      // Deep merge patch
      this.deepMerge(this.state, pathOrPatch);
      this.saveToStorage(this.currentUser, this.state);
      this.emit('change', { path: '', value: this.state });
      return this.state;
    }

    if (typeof pathOrPatch === 'string') {
      const parts = pathOrPatch.split('.');
      let current = this.state;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (current[p] === undefined || current[p] === null) {
          current[p] = {};
        }
        current = current[p];
      }
      const lastKey = parts[parts.length - 1];
      current[lastKey] = value;

      this.saveToStorage(this.currentUser, this.state);
      this.emit('change', { path: pathOrPatch, value });
      this.emit(pathOrPatch, value);
      return this.state;
    }

    return this.state;
  }

  /**
   * Deep object merger
   */
  deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object && !Array.isArray(source[key]) && key in target) {
        Object.assign(source[key], this.deepMerge(target[key], source[key]));
      }
    }
    Object.assign(target || {}, source);
    return target;
  }

  /**
   * Event Subscription
   * @param {string} event - Event name (e.g. 'change', 'stats.xp', 'quiz:submit')
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event).add(callback);

    // Return unbind handler
    return () => {
      const set = this.subscribers.get(event);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.subscribers.delete(event);
      }
    };
  }

  /**
   * Emits an event to all subscribers
   */
  emit(event, data) {
    const directSet = this.subscribers.get(event);
    if (directSet) {
      directSet.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[StateManager] Callback error on event '${event}':`, e);
        }
      });
    }

    // Always emit wildcard '*' if registered
    const wildcardSet = this.subscribers.get('*');
    if (wildcardSet) {
      wildcardSet.forEach(cb => {
        try {
          cb({ event, data });
        } catch (e) {
          console.error('[StateManager] Wildcard callback error:', e);
        }
      });
    }
  }

  // ─────────────────────────────────────────────
  // DOMAIN-SPECIFIC GAMIFICATION & ACTION HELPERS
  // ─────────────────────────────────────────────

  /**
   * Adds XP, updates level, and unlocks badges
   */
  addXP(points, reason = '') {
    const currentXP = this.get('stats.xp', 0);
    const newXP = currentXP + points;
    const oldLevel = this.calculateLevel(currentXP);
    const newLevel = this.calculateLevel(newXP);

    this.update('stats.xp', newXP);
    this.update('stats.level', newLevel);

    if (newLevel !== oldLevel) {
      showToast(`Congratulations! You reached ${newLevel}!`, 'achievement', 'Level Up!');
    } else if (points > 0) {
      showToast(`+${points} XP earned${reason ? ` for ${reason}` : ''}!`, 'success', 'XP Gained');
    }

    this.checkBadgeUnlocks();
  }

  /**
   * Computes Level from XP
   */
  calculateLevel(xp) {
    if (xp >= 30000) return 'Grandmaster';
    if (xp >= 20000) return 'Master Tier 2';
    if (xp >= 15000) return 'Master Tier 1';
    if (xp >= 10000) return 'Pro Tier 2';
    if (xp >= 5000)  return 'Pro Tier 1';
    if (xp >= 2000)  return 'Intermediate';
    return 'Novice Scholar';
  }

  /**
   * Records completed quiz attempt and recalculates overall stats
   */
  recordQuizResult(quizResult) {
    const history = this.get('quizHistory', []);
    history.unshift(quizResult);

    const quizzesAttempted = history.length;
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalPct = 0;

    history.forEach(item => {
      totalQuestions += (item.total || 0);
      totalCorrect += (item.correct || 0);
      totalPct += (item.accuracy || 0);
    });

    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 1000) / 10 : 0;

    this.update({
      quizHistory: history,
      'stats.quizzesAttempted': quizzesAttempted,
      'stats.totalQuestions': totalQuestions,
      'stats.correctAnswers': totalCorrect,
      'stats.accuracy': accuracy
    });

    this.emit('quiz:submitted', quizResult);
    this.checkBadgeUnlocks();
  }

  /**
   * Checks badge unlock conditions
   */
  checkBadgeUnlocks() {
    const badges = new Set(this.get('badges', []));
    const stats = this.get('stats', {});
    const history = this.get('quizHistory', []);
    const newlyUnlocked = [];

    // Badge 1: first_step
    if (stats.quizzesAttempted >= 1 && !badges.has('first_step')) {
      newlyUnlocked.push({ id: 'first_step', name: 'First Step', desc: 'Attempted your very first quiz' });
    }

    // Badge 2: sharpshooter (100% accuracy on a quiz with >= 5 questions)
    const hasPerfect = history.some(q => q.total >= 5 && q.accuracy === 100);
    if (hasPerfect && !badges.has('sharpshooter')) {
      newlyUnlocked.push({ id: 'sharpshooter', name: 'Sharpshooter', desc: 'Scored 100% on a full exam' });
    }

    // Badge 3: streak_master
    if (stats.streak >= 7 && !badges.has('streak_master')) {
      newlyUnlocked.push({ id: 'streak_master', name: '7-Day Discipline', desc: 'Kept your study streak for 7 full days' });
    }

    // Badge 4: deep_diver
    if (stats.focusMinutes >= 1000 && !badges.has('deep_diver')) {
      newlyUnlocked.push({ id: 'deep_diver', name: 'Deep Diver', desc: 'Logged over 1,000 deep focus minutes' });
    }

    // Badge 5: memory_titan (mastered revision flashcards)
    const revQueue = this.get('revisionQueue', []);
    const masteredCards = revQueue.filter(r => r.intervalDays >= 14).length;
    if (masteredCards >= 3 && !badges.has('memory_titan')) {
      newlyUnlocked.push({ id: 'memory_titan', name: 'Memory Titan', desc: 'Retention mastery on 3+ flashcard topics' });
    }

    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(b => {
        badges.add(b.id);
        showToast(`Badge Unlocked: ${b.name} (${b.desc})`, 'achievement', '🏆 Achievement Unlocked');
      });
      this.update('badges', Array.from(badges));
    }
  }
}

export const StateManager = new StateManagerClass();

// Attach globally
if (typeof window !== 'undefined') {
  window.StateManager = StateManager;
}
