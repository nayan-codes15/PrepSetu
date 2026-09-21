// server.js — PrepSetu AI Backend Services
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '500kb' }));

// Simple In-Memory Rate Limiter (20 requests per minute per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  let entry = rateLimitMap.get(ip);
  if (!entry || now - entry.startTime > RATE_LIMIT_WINDOW_MS) {
    entry = { startTime: now, count: 1 };
    rateLimitMap.set(ip, entry);
    return next();
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      ok: false,
      error: 'Too many requests. Please slow down and try again in a minute.'
    });
  }

  next();
}

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname)));

// ── COMPREHENSIVE EXAM QUESTION BANK ──
const QUESTION_BANK = {
  dsa: [
    {
      id: 'dsa_1',
      difficulty: 'easy',
      q: 'Which data structure operates on a First-In-First-Out (FIFO) discipline?',
      options: ['Stack', 'Queue', 'Binary Search Tree', 'Hash Map'],
      ans: 1,
      explanation: 'A Queue adheres to FIFO principles where insertion happens at the rear and deletion at the front.'
    },
    {
      id: 'dsa_2',
      difficulty: 'medium',
      q: 'What is the average time complexity of searching an element in a balanced AVL Tree?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      ans: 1,
      explanation: 'An AVL tree strictly maintains a balance factor between -1 and +1, guaranteeing logarithmic height O(log N).'
    },
    {
      id: 'dsa_3',
      difficulty: 'hard',
      q: 'Which shortest path algorithm handles graphs with negative edge weights without getting trapped in cycles?',
      options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Prim's Algorithm", "Kruskal's Algorithm"],
      ans: 1,
      explanation: 'Bellman-Ford relaxes all edges |V|-1 times and can detect negative-weight cycles.'
    },
    {
      id: 'dsa_4',
      difficulty: 'easy',
      q: 'What is the space complexity of an in-place QuickSort implementation in the worst case (call stack)?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
      ans: 2,
      explanation: 'In the worst case (already sorted array with bad pivot), recursion depth is N, resulting in O(N) call stack space.'
    },
    {
      id: 'dsa_5',
      difficulty: 'medium',
      q: 'Which traversal of a Binary Search Tree (BST) produces elements in strictly non-decreasing order?',
      options: ['Preorder', 'Inorder', 'Postorder', 'Level Order'],
      ans: 1,
      explanation: 'Inorder traversal visits Left Subtree -> Root -> Right Subtree, resulting in sorted sequence for any valid BST.'
    },
    {
      id: 'dsa_6',
      difficulty: 'hard',
      q: 'In dynamic programming, which approach solves the 0/1 Knapsack Problem with capacity W and N items?',
      options: ['O(N + W) time and space', 'O(N * W) pseudo-polynomial time', 'O(2^N) greedy time', 'O(W^2) time'],
      ans: 1,
      explanation: 'The standard 2D/1D DP table requires O(N * W) operations, which is pseudo-polynomial depending on W.'
    },
    {
      id: 'dsa_7',
      difficulty: 'medium',
      q: 'What is the worst-case time complexity of inserting an item into a Hash Table with Chaining?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      ans: 2,
      explanation: 'If all keys hash to the identical slot (hash collision collapse), the chain degrades to a linked list taking O(N) to traverse.'
    },
    {
      id: 'dsa_8',
      difficulty: 'easy',
      q: 'A min-heap property ensures that:',
      options: ['Every parent is greater than its children', 'Every parent is smaller than or equal to its children', 'Left child is smaller than right child', 'Height is at least N/2'],
      ans: 1,
      explanation: 'In a min-heap, for any given node C, the value of parent P is <= value of C, with minimum at the root.'
    }
  ],
  aptitude: [
    {
      id: 'apt_1',
      difficulty: 'easy',
      q: 'A train 150m long is running at 54 km/h. How many seconds will it take to cross a telephone pole?',
      options: ['8 sec', '10 sec', '12 sec', '15 sec'],
      ans: 1,
      explanation: 'Speed in m/s = 54 * (5/18) = 15 m/s. Time = Distance / Speed = 150 / 15 = 10 seconds.'
    },
    {
      id: 'apt_2',
      difficulty: 'medium',
      q: 'If A can finish a work in 12 days and B can finish in 24 days, in how many days will they finish working together?',
      options: ['6 days', '8 days', '9 days', '10 days'],
      ans: 1,
      explanation: 'Total work = LCM(12, 24) = 24 units. A does 2 units/day, B does 1 unit/day. Combined = 3 units/day. Time = 24 / 3 = 8 days.'
    },
    {
      id: 'apt_3',
      difficulty: 'hard',
      q: 'In an election between two candidates, the winner got 58% of valid votes and won by a majority of 3,200 votes. Find total valid votes.',
      options: ['18,000', '20,000', '24,000', '25,000'],
      ans: 1,
      explanation: 'Difference = 58% - 42% = 16%. 16% of Total = 3,200 => Total = 3,200 / 0.16 = 20,000 votes.'
    },
    {
      id: 'apt_4',
      difficulty: 'easy',
      q: 'What is 15% of 60% of 500?',
      options: ['45', '50', '60', '75'],
      ans: 0,
      explanation: '60% of 500 = 300. 15% of 300 = 0.15 * 300 = 45.'
    },
    {
      id: 'apt_5',
      difficulty: 'medium',
      q: 'Two dice are rolled simultaneously. What is the probability that the sum of the two faces is a prime number?',
      options: ['5/12', '7/18', '1/2', '15/36'],
      ans: 0,
      explanation: 'Primes between 2 and 12 are 2, 3, 5, 7, 11. Counts: 2(1), 3(2), 5(4), 7(6), 11(2) -> total 15 combinations. 15/36 = 5/12.'
    }
  ],
  cs_fundamentals: [
    {
      id: 'cs_1',
      difficulty: 'medium',
      q: 'Which condition is NOT necessary for a deadlock to occur in an operating system?',
      options: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Preemptive Resource Allocation'],
      ans: 3,
      explanation: "Coffman's four deadlock conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Preemptive allocation prevents deadlocks."
    },
    {
      id: 'cs_2',
      difficulty: 'easy',
      q: 'In the OSI Model, which layer is responsible for routing packets across networks using IP addresses?',
      options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
      ans: 1,
      explanation: 'The Network layer (Layer 3) handles logical addressing (IPv4/IPv6) and packet forwarding/routing.'
    },
    {
      id: 'cs_3',
      difficulty: 'hard',
      q: 'In relational database theory, which Normal Form forbids non-trivial functional dependencies X -> Y where X is not a superkey?',
      options: ['1NF', '2NF', '3NF', 'BCNF (Boyce-Codd)'],
      ans: 3,
      explanation: 'BCNF is a stricter version of 3NF where every functional dependency X -> Y requires X to be a superkey.'
    },
    {
      id: 'cs_4',
      difficulty: 'medium',
      q: 'Which page replacement algorithm suffers from Belady\'s Anomaly?',
      options: ['LRU (Least Recently Used)', 'FIFO (First-In, First-Out)', 'Optimal Page Replacement', 'LFU (Least Frequently Used)'],
      ans: 1,
      explanation: "FIFO can exhibit Belady's Anomaly where allocating more page frames actually causes more page faults."
    }
  ]
};

// ── AI TUTOR RESPONSES GENERATOR ──
function generateSmartTutorResponse(message, history = []) {
  const msgLower = message.toLowerCase();

  // 1. Quiz Generation Request
  if (msgLower.includes('generate quiz') || msgLower.includes('practice test') || msgLower.includes('quiz me')) {
    return {
      reply: `### 🎯 Targeted Diagnostic Quiz Generated!\n\nHere is a 3-question conceptual quiz based on your prompt:\n\n` +
             `**Q1. What is the fundamental invariant of a Max-Heap?**\n` +
             `- A) Every root is smaller than child\n` +
             `- B) Every parent node $\\ge$ its children\n` +
             `- C) Binary tree must be strictly full\n` +
             `- D) Leaves are sorted from left to right\n` +
             `*Correct: B*\n\n` +
             `**Q2. When solving dynamic programming problems, memoization refers to:**\n` +
             `- A) Bottom-up tabulation\n` +
             `- B) Top-down recursive caching\n` +
             `- C) Greedy item selection\n` +
             `- D) Bit manipulation\n` +
             `*Correct: B*\n\n` +
             `**Q3. What is the amortized complexity of appending to a dynamic array?**\n` +
             `- A) $$O(1)$$\n` +
             `- B) $$O(N)$$\n` +
             `- C) $$O(\\log N)$$\n` +
             `- D) $$O(N^2)$$\n` +
             `*Correct: A*`,
      action: 'quiz_ready',
      quizSubject: 'dsa'
    };
  }

  // 2. Algorithm / DSA Queries
  if (msgLower.includes('tree') || msgLower.includes('graph') || msgLower.includes('dijkstra') || msgLower.includes('dp') || msgLower.includes('dynamic programming') || msgLower.includes('complexity') || msgLower.includes('sort')) {
    return {
      reply: `### 🧠 Algorithmic Deep-Dive\n\n` +
             `When analyzing this concept, remember the key efficiency trade-off:\n\n` +
             `**1. Core Property:**\n` +
             `- Time Complexity: Best case $$O(1)$$, Average $$O(\\log N)$$, Worst case $$O(N)$$\n` +
             `- Auxiliary Space: $$O(\\log N)$$ recursion stack\n\n` +
             `**2. Practical Implementation Pattern:**\n` +
             `\`\`\`python\ndef solve_subproblem(arr, target):\n    # Two-pointer search pattern\n    left, right = 0, len(arr) - 1\n    while left < right:\n        curr_sum = arr[left] + arr[right]\n        if curr_sum == target:\n            return (left, right)\n        elif curr_sum < target:\n            left += 1\n        else:\n            right -= 1\n    return None\n\`\`\`\n\n` +
             `💡 **Exam Tip**: In Indian exams like GATE and JEE, always inspect edge cases: empty input, all duplicates, and negative boundaries.`
    };
  }

  // 3. Quantitative Aptitude / Mathematics
  if (msgLower.includes('percentage') || msgLower.includes('speed') || msgLower.includes('train') || msgLower.includes('math') || msgLower.includes('probability')) {
    return {
      reply: `### 📐 Quantitative Aptitude Shortcut\n\n` +
             `Let's break down the problem using high-speed Vedic math techniques:\n\n` +
             `**Key Formula:**\n` +
             `$$\\text{Speed} = \\frac{\\text{Distance}}{\\text{Time}}$$\n\n` +
             `To convert $\\text{km/h}$ to $\\text{m/s}$ in one step, multiply by $\\frac{5}{18}$:\n` +
             `$$v_{\\text{m/s}} = v_{\\text{km/h}} \\times \\frac{5}{18}$$\n\n` +
             `**Relative Velocity Rule:**\n` +
             `- Moving in opposite directions: $V_{\\text{rel}} = V_1 + V_2$\n` +
             `- Moving in identical direction: $V_{\\text{rel}} = |V_1 - V_2|$\n\n` +
             `Would you like 3 practice drill questions on this?`
    };
  }

  // 4. Default Personalized Guidance
  return {
    reply: `### 🚀 PrepSetu Neural Mentor\n\n` +
           `I analyzed your question: *"${message.replace(/"/g, "'")}"*.\n\n` +
           `Here is your recommended study action plan:\n\n` +
           `1. **Conceptual Mastery**: Review the fundamental definitions and constraints before jumping into formulas.\n` +
           `2. **Active Recall**: Test yourself with 5 rapid questions in Mock Exam mode.\n` +
           `3. **Spaced Repetition**: Bookmark any questions you struggle with into your Revision Queue.\n\n` +
           `Ask me to **"Generate Quiz"** anytime you want an instant practice test on this topic!`
  };
}

// ── API ROUTES ──

// 1. AI Tutor Endpoint
app.post('/api/ai-chat', rateLimiter, (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ ok: false, error: 'A valid message string is required.' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ ok: false, error: 'Message exceeds 2,000 character safety limit.' });
  }

  const result = generateSmartTutorResponse(message.trim(), history || []);
  res.json({
    ok: true,
    reply: result.reply,
    action: result.action || null,
    quizSubject: result.quizSubject || null
  });
});

// 2. Exam / Quiz Engine Endpoint
app.get('/api/quiz', (req, res) => {
  const subject = (req.query.subject || 'dsa').toLowerCase();
  const difficulty = (req.query.difficulty || 'all').toLowerCase();
  const count = parseInt(req.query.count) || 5;

  let pool = QUESTION_BANK[subject] || QUESTION_BANK.dsa;

  if (difficulty !== 'all') {
    const filtered = pool.filter(q => q.difficulty === difficulty);
    if (filtered.length >= 3) {
      pool = filtered;
    }
  }

  // Shuffle questions
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Also shuffle options for exam realism while preserving correct answer index
  const randomizedQuestions = selected.map(item => {
    const originalAns = item.ans;
    const correctText = item.options[originalAns];
    const shuffledOptions = [...item.options].sort(() => Math.random() - 0.5);
    const newAns = shuffledOptions.indexOf(correctText);

    return {
      id: item.id,
      q: item.q,
      options: shuffledOptions,
      ans: newAns,
      explanation: item.explanation,
      difficulty: item.difficulty
    };
  });

  res.json({
    ok: true,
    subject,
    difficulty,
    count: randomizedQuestions.length,
    questions: randomizedQuestions
  });
});

// 3. Dynamic Leaderboard Endpoint
app.get('/api/leaderboard', (req, res) => {
  res.json({
    ok: true,
    data: [
      { rank: 1, displayName: 'Aarav Singhania', xp: 28500, level: 'Grandmaster', accuracy: 98.2, streak: 24 },
      { rank: 2, displayName: 'Priya Patel', xp: 24100, level: 'Master Tier 2', accuracy: 95.8, streak: 19 },
      { rank: 3, displayName: 'Rahul Deshmukh', xp: 21300, level: 'Master Tier 2', accuracy: 93.1, streak: 14 },
      { rank: 4, displayName: 'Ananya Sharma', xp: 19800, level: 'Master Tier 1', accuracy: 91.4, streak: 11 },
      { rank: 5, displayName: 'Scholar Arjun (You)', xp: 14250, level: 'Pro Tier 2', accuracy: 86.7, streak: 7, isCurrentUser: true },
      { rank: 6, displayName: 'Rohan Verma', xp: 12000, level: 'Pro Tier 2', accuracy: 88.6, streak: 5 },
      { rank: 7, displayName: 'Isha Nair', xp: 9800, level: 'Pro Tier 1', accuracy: 85.0, streak: 4 }
    ]
  });
});

// HTML Page Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/quiz', (req, res) => res.sendFile(path.join(__dirname, 'quiz.html')));

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 PrepSetu Server running on http://localhost:${PORT}`);
  console.log(`⚡ APIs: /api/ai-chat, /api/quiz, /api/leaderboard ready`);
});
