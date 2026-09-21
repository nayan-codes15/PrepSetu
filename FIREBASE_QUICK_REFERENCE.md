# Firebase Setup - Quick Reference

## 📁 Files Created

1. **firebase-config.js** - Core Firebase configuration + utility functions
2. **firebase-utils.js** - UI handlers and dashboard functions
3. **FIREBASE_SETUP_GUIDE.md** - Complete step-by-step setup instructions (2 minutes)

---

## ⚡ Quick Start (3 steps)

### 1. Get Firebase Config

- Go to [Firebase Console](https://console.firebase.google.com/)
- Create project → Register web app → Copy config object
- Replace placeholders in `firebase-config.js` (apiKey, authDomain, projectId, etc.)

### 2. Enable Services

- **Authentication**: Enable Email/Password + Google (optional)
- **Firestore**: Create database in Production mode
- **Security Rules** for Firestore:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{uid} {
        allow read, write: if request.auth.uid == uid;
      }
    }
  }
  ```

### 3. Update HTML Files

Add this to your `<head>`:

```html
<script type="module">
  import { initAuthListener, handleLogout } from "./firebase-utils.js";
  window.addEventListener("load", initAuthListener);
</script>
```

---

## 📚 Core Functions

### Authentication

```javascript
await signup(email, password, displayName);
await login(email, password);
await logout();
await loginWithGoogle();
```

### User Data

```javascript
await getUserProfile(uid)
await getUserStats(uid)
await saveUserData(uid, { favoriteSubjects: [...] })
await updateUserStats(uid, score)
```

### Leaderboard

```javascript
const users = await getLeaderboard();
```

### Auth State

```javascript
onAuthStateChange((user) => {
  if (user) console.log("Logged in:", user);
  else console.log("Logged out");
});
```

---

## 🎯 HTML Form Integration

### Login Form

```html
<form onsubmit="handleLogin(event)">
  <input type="email" id="loginEmail" placeholder="Email" required />
  <input type="password" id="loginPassword" placeholder="Password" required />
  <button type="submit">Login</button>
</form>
```

### Signup Form

```html
<form onsubmit="handleSignup(event)">
  <input type="text" id="signupName" placeholder="Full Name" required />
  <input type="email" id="signupEmail" placeholder="Email" required />
  <input type="password" id="signupPassword" placeholder="Password" required />
  <button type="submit">Sign Up</button>
</form>
```

### Dashboard

```html
<button onclick="handleLogout()">Logout</button>
<div id="userStatsContainer"></div>
<div id="leaderboardContainer"></div>
```

---

## 🔗 Firestore Schema

```
users/
├── {uid}/
│   ├── uid: string
│   ├── email: string
│   ├── displayName: string
│   ├── createdAt: timestamp
│   ├── quizzesAttempted: number
│   ├── totalScore: number
│   ├── averageScore: number
│   └── lastUpdated: timestamp
```

---

## ✅ Setup Checklist

- [ ] Create Firebase project
- [ ] Register web app
- [ ] Enable Authentication (Email + optionally Google)
- [ ] Enable Firestore Database
- [ ] Set Firestore Security Rules
- [ ] Copy config keys to `firebase-config.js`
- [ ] Add module script to your HTML pages
- [ ] Test login/signup functionality

---

## 🛠️ Common Tasks

### Show user stats on dashboard

```javascript
import { displayUserStats } from "./firebase-utils.js";
displayUserStats(userId);
```

### Show leaderboard

```javascript
import { displayLeaderboard } from "./firebase-utils.js";
displayLeaderboard();
```

### Handle quiz completion

```javascript
import { handleQuizSubmission } from "./firebase-utils.js";
handleQuizSubmission(userId, 85); // 85 = quiz score
```

### Save custom user data

```javascript
import { saveUserData } from "./firebase-config.js";
await saveUserData(uid, {
  favoriteSubjects: ["Math", "Science"],
  studyHours: 10,
});
```

---

## 🐛 Error Handling

All functions throw errors on failure. Always use try-catch:

```javascript
try {
  const user = await login(email, password);
} catch (error) {
  console.error("Login failed:", error.message);
  showError(error.message);
}
```

---

## 📊 Firestore Rules Explained

```
match /users/{uid} {
  allow read, write: if request.auth.uid == uid;
}
```

This means:

- Users can **only access their own profile** (uid must match)
- Protects privacy - users can't read other users' data
- Modify as needed for public leaderboard

For a public leaderboard, use:

```
match /users/{uid} {
  allow read: if true;  // Everyone can read
  allow write: if request.auth.uid == uid;  // Only owner can write
}
```

---

## 📞 Support Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)

**Setup Time: ~2 minutes** ⏱️
