// firebase-utils.js
// Practical usage examples and helper functions for PrepSetu
// Import this file and use the functions in your HTML pages

import {
  signup,
  login,
  logout,
  loginWithGoogle,
  getUserStats,
  saveUserData,
  updateUserStats,
  getLeaderboard,
  onAuthStateChange,
} from "./firebase-config.js";

// ============================================================
// UI HELPER FUNCTIONS
// ============================================================

/**
 * Show loading spinner
 * @param {boolean} show - True to show, false to hide
 */
export const toggleLoadingSpinner = (show) => {
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) {
    spinner.style.display = show ? "block" : "none";
  }
};

/**
 * Show error message
 * @param {string} message - Error message to display
 * @param {string} elementId - ID of element to show error in
 */
export const showError = (message, elementId = "errorMessage") => {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.innerText = message;
    errorEl.style.display = "block";
    setTimeout(() => {
      errorEl.style.display = "none";
    }, 5000);
  }
};

/**
 * Show success message
 * @param {string} message - Success message to display
 * @param {string} elementId - ID of element to show success in
 */
export const showSuccess = (message, elementId = "successMessage") => {
  const successEl = document.getElementById(elementId);
  if (successEl) {
    successEl.innerText = message;
    successEl.style.display = "block";
    setTimeout(() => {
      successEl.style.display = "none";
    }, 3000);
  }
};

// ============================================================
// AUTHENTICATION HANDLERS
// ============================================================

/**
 * Handle signup form submission
 * Usage: <form onsubmit="handleSignup(event)">
 */
export const handleSignup = async (event) => {
  event.preventDefault();
  toggleLoadingSpinner(true);

  try {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const displayName = document.getElementById("signupName").value;

    if (!email || !password || !displayName) {
      throw new Error("Please fill in all fields");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const user = await signup(email, password, displayName);
    showSuccess(`Welcome ${user.displayName}! Redirecting...`);

    setTimeout(() => {
      window.location.href = "./dashboard.html";
    }, 2000);
  } catch (error) {
    showError(error.message);
  } finally {
    toggleLoadingSpinner(false);
  }
};

/**
 * Handle login form submission
 * Usage: <form onsubmit="handleLogin(event)">
 */
export const handleLogin = async (event) => {
  event.preventDefault();
  toggleLoadingSpinner(true);

  try {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      throw new Error("Please enter email and password");
    }

    const user = await login(email, password);
    showSuccess(`Welcome back ${user.displayName}!`);

    setTimeout(() => {
      window.location.href = "./dashboard.html";
    }, 2000);
  } catch (error) {
    showError(error.message);
  } finally {
    toggleLoadingSpinner(false);
  }
};

/**
 * Handle logout
 * Usage: <button onclick="handleLogout()">Logout</button>
 */
export const handleLogout = async () => {
  try {
    await logout();
    showSuccess("Logged out successfully");
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 1000);
  } catch (error) {
    showError(error.message);
  }
};

/**
 * Handle Google login
 * Usage: <button onclick="handleGoogleLogin()">Sign in with Google</button>
 */
export const handleGoogleLogin = async () => {
  toggleLoadingSpinner(true);

  try {
    const user = await loginWithGoogle();
    showSuccess(`Welcome ${user.displayName}!`);

    setTimeout(() => {
      window.location.href = "./dashboard.html";
    }, 2000);
  } catch (error) {
    showError(error.message);
  } finally {
    toggleLoadingSpinner(false);
  }
};

// ============================================================
// DASHBOARD FUNCTIONS
// ============================================================

/**
 * Display user stats on dashboard
 * @param {string} uid - User ID
 */
export const displayUserStats = async (uid) => {
  try {
    const stats = await getUserStats(uid);

    const statsHtml = `
      <div class="user-stats">
        <h2>Welcome, ${stats.displayName}!</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Quizzes Attempted</h3>
            <p class="stat-value">${stats.quizzesAttempted}</p>
          </div>
          <div class="stat-card">
            <h3>Total Score</h3>
            <p class="stat-value">${stats.totalScore}</p>
          </div>
          <div class="stat-card">
            <h3>Average Score</h3>
            <p class="stat-value">${stats.averageScore.toFixed(2)}%</p>
          </div>
          <div class="stat-card">
            <h3>Email</h3>
            <p class="stat-value">${stats.email}</p>
          </div>
        </div>
      </div>
    `;

    const statsContainer = document.getElementById("userStatsContainer");
    if (statsContainer) {
      statsContainer.innerHTML = statsHtml;
    }
  } catch (error) {
    showError(error.message);
  }
};

/**
 * Display leaderboard
 */
export const displayLeaderboard = async () => {
  try {
    toggleLoadingSpinner(true);
    const users = await getLeaderboard();

    let leaderboardHtml = `
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Quizzes</th>
            <th>Avg Score</th>
          </tr>
        </thead>
        <tbody>
    `;

    users.forEach((user, index) => {
      leaderboardHtml += `
        <tr>
          <td>${index + 1}</td>
          <td>${user.displayName}</td>
          <td>${user.quizzesAttempted || 0}</td>
          <td>${(user.averageScore || 0).toFixed(2)}%</td>
        </tr>
      `;
    });

    leaderboardHtml += `
        </tbody>
      </table>
    `;

    const leaderboardContainer = document.getElementById(
      "leaderboardContainer",
    );
    if (leaderboardContainer) {
      leaderboardContainer.innerHTML = leaderboardHtml;
    }
  } catch (error) {
    showError(error.message);
  } finally {
    toggleLoadingSpinner(false);
  }
};

/**
 * Initialize auth state listener
 * Call this on page load to check if user is logged in
 */
export const initAuthListener = () => {
  onAuthStateChange((user) => {
    if (user) {
      // User is logged in
      console.log("User logged in:", user.displayName);

      // Show dashboard elements, hide login elements
      const dashboardEl = document.getElementById("dashboard");
      const loginEl = document.getElementById("loginContainer");

      if (dashboardEl) dashboardEl.style.display = "block";
      if (loginEl) loginEl.style.display = "none";

      // Display user stats
      displayUserStats(user.uid);
    } else {
      // User is logged out
      console.log("User logged out");

      // Hide dashboard elements, show login elements
      const dashboardEl = document.getElementById("dashboard");
      const loginEl = document.getElementById("loginContainer");

      if (dashboardEl) dashboardEl.style.display = "none";
      if (loginEl) loginEl.style.display = "block";
    }
  });
};

/**
 * Handle quiz submission and update stats
 * @param {string} uid - User ID
 * @param {number} score - Quiz score (0-100)
 */
export const handleQuizSubmission = async (uid, score) => {
  try {
    await updateUserStats(uid, score);
    showSuccess(`Quiz submitted! Your score: ${score}`);

    // Refresh stats display
    displayUserStats(uid);
  } catch (error) {
    showError(error.message);
  }
};

// ============================================================
// SAMPLE HTML USAGE
// ============================================================
/*

<!-- LOGIN PAGE (index.html) -->
<form onsubmit="handleLogin(event)">
  <input type="email" id="loginEmail" placeholder="Email" required>
  <input type="password" id="loginPassword" placeholder="Password" required>
  <button type="submit">Login</button>
</form>

<button onclick="handleGoogleLogin()">Sign in with Google</button>

<div id="errorMessage" style="display:none; color:red;"></div>


<!-- SIGNUP PAGE -->
<form onsubmit="handleSignup(event)">
  <input type="text" id="signupName" placeholder="Full Name" required>
  <input type="email" id="signupEmail" placeholder="Email" required>
  <input type="password" id="signupPassword" placeholder="Password" required>
  <button type="submit">Sign Up</button>
</form>

<div id="errorMessage" style="display:none; color:red;"></div>


<!-- DASHBOARD PAGE (dashboard.html) -->
<button onclick="handleLogout()">Logout</button>

<div id="userStatsContainer"></div>

<div id="leaderboardContainer"></div>

<div id="loadingSpinner" style="display:none;">Loading...</div>

<script type="module">
  import { initAuthListener, displayLeaderboard } from './firebase-utils.js';
  
  // Initialize auth listener on page load
  window.addEventListener('load', () => {
    initAuthListener();
    displayLeaderboard();
  });
</script>

*/
