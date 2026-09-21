# Firebase Setup Guide for PrepSetu - Quick 2-Minute Setup

## 📋 Overview

This guide will help you set up Firebase Authentication and Firestore Database for the PrepSetu website.

---

## ⏱️ Quick Setup (2 Minutes)

### Step 1: Create Firebase Project (30 seconds)

1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Click **"Create a new project"** or **"Add project"**
3. Enter project name: `prepsetu-ai` (or your preferred name)
4. Click **Continue** → **Create Project** → **Continue**
5. Wait for project creation to complete

### Step 2: Register Web App (20 seconds)

1. In Firebase console, click the **Web icon** (</>) under "Get started"
2. Register app name: `PrepSetu Website`
3. Check "Also set up Firebase Hosting" (optional, skip for now)
4. Click **Register app**
5. **Copy the entire config object** (you'll use this next)

### Step 3: Get Your Config Keys (30 seconds)

Your Firebase config looks like this:

```javascript
{
  apiKey: "AIzaSyD...",
  authDomain: "prepsetu-ai.firebaseapp.com",
  projectId: "prepsetu-ai",
  storageBucket: "prepsetu-ai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
}
```

### Step 4: Update firebase-config.js (30 seconds)

Replace the placeholder values in `firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE", // ← Replace
  authDomain: "your-project.firebaseapp.com", // ← Replace
  projectId: "your-project-id", // ← Replace
  storageBucket: "your-project.appspot.com", // ← Replace
  messagingSenderId: "your-sender-id", // ← Replace
  appId: "your-app-id", // ← Replace
};
```

### Step 5: Enable Services (30 seconds)

#### Enable Authentication:

1. In Firebase console, go to **Authentication** (left menu)
2. Click **Get Started**
3. Enable **Email/Password** provider
4. (Optional) Enable **Google** provider for sign-in

#### Enable Firestore Database:

1. Go to **Firestore Database** (left menu)
2. Click **Create Database**
3. Start in **Production mode**
4. Choose region (closest to your users)
5. Click **Create**

#### Set Firestore Security Rules:

Copy this into Firestore **Rules** tab:

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

Click **Publish**

---

## 🔑 Where to Find Your Config Keys

### In Firebase Console:

1. **Project Settings** (gear icon, top-left)
2. Scroll to **Your apps** section
3. Find your web app in the list
4. Click the code bracket icon `</>` to expand
5. Locate the `firebaseConfig` object

---

## 📚 Available Functions in firebase-config.js

### Authentication

- `signup(email, password, displayName)` - Register new user
- `login(email, password)` - Login user
- `logout()` - Logout current user
- `loginWithGoogle()` - Google OAuth login
- `onAuthStateChange(callback)` - Listen to auth state changes

### User Data Management

- `saveUserData(uid, data)` - Update user profile
- `getUserProfile(uid)` - Get user profile information
- `getUserStats(uid)` - Get user quiz statistics
- `updateUserStats(uid, newScore)` - Update quiz scores
- `getLeaderboard()` - Get all users ranked by score

---

## 💻 Usage Examples

### Signup

```javascript
import { signup } from "./firebase-config.js";

const user = await signup("user@example.com", "password123", "John Doe");
console.log("User created:", user);
```

### Login

```javascript
import { login } from "./firebase-config.js";

const user = await login("user@example.com", "password123");
console.log("Logged in:", user);
```

### Save User Data

```javascript
import { saveUserData } from "./firebase-config.js";

await saveUserData(uid, {
  favoriteSubjects: ["Math", "Science"],
  studyHours: 10,
});
```

### Get User Stats

```javascript
import { getUserStats } from "./firebase-config.js";

const stats = await getUserStats(uid);
console.log(
  `Quizzes: ${stats.quizzesAttempted}, Avg Score: ${stats.averageScore}`,
);
```

### Update Stats After Quiz

```javascript
import { updateUserStats } from "./firebase-config.js";

await updateUserStats(uid, 85); // 85 = score from quiz
```

### Listen to Auth Changes

```javascript
import { onAuthStateChange } from "./firebase-config.js";

const unsubscribe = onAuthStateChange((user) => {
  if (user) {
    console.log("User logged in:", user.displayName);
  } else {
    console.log("User logged out");
  }
});

// Stop listening when needed
unsubscribe();
```

---

## 🔐 Firestore Database Schema

### Users Collection Structure:

```
users/
  └── {uid}/
      ├── uid: string
      ├── email: string
      ├── displayName: string
      ├── photoURL: string (optional)
      ├── createdAt: timestamp
      ├── quizzesAttempted: number
      ├── totalScore: number
      ├── averageScore: number
      └── lastUpdated: timestamp
```

---

## 🐛 Troubleshooting

### "API Key not valid"

- Copy the exact API Key from Firebase console
- Refresh your browser

### "Firestore permission denied"

- Check Firestore Security Rules
- Make sure you're logged in (auth.uid is valid)

### "User not found"

- User document must be created during signup (it's automatic)
- For Google login, document is created on first login

### "CORS errors"

- Firebase handles cross-origin automatically
- No special CORS setup needed

---

## ✅ Checklist

- [ ] Created Firebase project
- [ ] Registered web app
- [ ] Copied config keys
- [ ] Updated `firebase-config.js`
- [ ] Enabled Authentication (Email + Google)
- [ ] Enabled Firestore Database
- [ ] Updated Firestore Security Rules
- [ ] Tested login/signup functionality

---

## 📖 Next Steps

1. **Integrate with HTML forms** - Use the functions in your login/signup pages
2. **Display user stats** - Show quiz scores and progress on dashboard
3. **Create leaderboard** - Use `getLeaderboard()` function
4. **Add error handling** - Wrap functions in try-catch blocks
5. **Customize Firestore schema** - Add more fields based on your needs

---

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Database Docs](https://firebase.google.com/docs/firestore)
- [Firebase JavaScript SDK](https://firebase.google.com/docs/web/setup)

**⏱️ Total Setup Time: ~2 minutes** ✅
