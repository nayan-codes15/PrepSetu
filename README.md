# PrepSetu AI — Adaptive Exam Preparation Platform

PrepSetu AI is an advanced, privacy-first, and exam-grade learning platform built specifically for competitive Indian examinations (JEE, NEET, CUET, and Foundation boards).

---

## 🌟 Key Features

- **🔐 Cryptographic Security**: PBKDF2-SHA256 (100,000 iterations) client-side password hashing with unique salts, constant-time comparison, and comprehensive XSS escaping.
- **⚡ Centralized State Engine (`state-manager.js`)**: Versioned schema (`v1`), cross-tab pub/sub synchronization, and automatic backup recovery.
- **📝 National Standard Exam Simulator (`quiz.html`)**:
  - Timed mode with per-question countdown and auto-submission.
  - Standard JEE/NEET **+4 / -1 negative marking** mode.
  - Question status palette (Answered, Flagged, Unattempted).
  - Anti-cheat tracking (`visibilitychange` & `blur` window monitoring).
  - Side-by-side Review Mode with instant synchronization of missed questions into the flashcard queue.
- **🤖 AI Tutor & Diagnostics (`dashboard.html` + `server.js`)**:
  - Conversational AI tutor with conversational memory, KaTeX math equation rendering, and custom quiz generation.
  - In-memory token bucket rate limiting (30 requests/min/IP).
  - Weak & strong area radar diagnostics.
- **📚 Modular Courses & Mastery Gates**: Interactive multi-tier courses with 3-question mastery gate quizzes (2/3 passing threshold to unlock subsequent modules).
- **🔁 Spaced Repetition Flashcards (SM-2)**: SuperMemo-2 spaced revision algorithm with 3D flip card interactions.
- **⏱️ Pomodoro Focus Mode**: Circular SVG timer with document title countdown and customizable focus intervals.
- **📊 Analytics & Activity Heatmap**: 12-week GitHub-style study streak calendar and live exam countdown widgets.
- **📱 PWA & Offline Support**: Progressive Web App manifest (`manifest.json`) and service worker (`service-worker.js`) with offline caching.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, Modern CSS3 (Dark/Light theme variables, Glassmorphism, Responsive Grid), Vanilla JavaScript (ES2022).
- **Security & Math**: Web Crypto API (`crypto.subtle`), KaTeX, Canvas Confetti.
- **Backend Server**: Node.js & Express.
- **Data Persistence**: Local-first state manager with Firebase Web SDK fallback.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have **Node.js** (v16+) installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Application
```bash
npm start
# Or: node server.js
```
The server will start on `http://localhost:3000`.

### 4. Open in Browser
- **Landing & Authentication**: `http://localhost:3000/index.html`
- **Exam Simulator**: `http://localhost:3000/quiz.html`
- **Dashboard & AI Tutor**: `http://localhost:3000/dashboard.html`

> 💡 **Tip**: Use the **"⚡ Instant Demo Scholar Login"** button on the login page for immediate evaluation with pre-seeded test history.

---

## 📂 Project Structure

```
├── index.html              # Landing page & secure login/registration
├── dashboard.html          # Main application shell with multi-view router
├── quiz.html               # National standard exam simulator
├── server.js               # Express API backend with AI tutor & quiz generation
├── state-manager.js        # Centralized pub/sub state manager & auto-recovery
├── security-utils.js       # PBKDF2 hashing, salt generation & XSS sanitization
├── ui-utils.js             # Toast notifications, modals & synthesized audio
├── firebase-config.js      # Auth & user profile sync bridge
├── service-worker.js       # PWA offline asset & API cache
├── manifest.json           # Web app manifest
├── logo.png                # Brand logo asset
└── package.json            # Node.js project manifest
```

---

## 📄 License
MIT License
