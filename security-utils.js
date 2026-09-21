/**
 * security-utils.js — PrepSetu AI Security Hardening
 * ──────────────────────────────────────────────────
 * Zero-dependency security module utilizing native Web Crypto API:
 * 1. PBKDF2-SHA256 Password Hashing (100,000 iterations)
 * 2. Cryptographic Salt Generation
 * 3. Strict HTML Entity Escaping (Anti-XSS)
 * 4. Safe Markdown & Formula Formatter
 */

const PBKDF2_ITERATIONS = 100000;
const HASH_LENGTH_BITS = 256;

/**
 * Converts ArrayBuffer to Hex String
 */
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts Hex String to Uint8Array
 */
function hexToBuffer(hexString) {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Generates a cryptographically secure random salt
 * @param {number} byteLength - Default 16 bytes (128 bits)
 * @returns {string} Hex-encoded salt
 */
export function generateSalt(byteLength = 16) {
  const salt = new Uint8Array(byteLength);
  window.crypto.getRandomValues(salt);
  return bufferToHex(salt);
}

/**
 * Derives a PBKDF2-SHA256 hash for a given password and salt
 * @param {string} password - Raw password
 * @param {string} saltHex - Hex-encoded salt
 * @returns {Promise<string>} Hex-encoded hash
 */
export async function hashPassword(password, saltHex) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = hexToBuffer(saltHex);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    HASH_LENGTH_BITS
  );

  return bufferToHex(derivedBits);
}

/**
 * Verifies a password against a stored hash and salt
 * @param {string} password - Candidate password
 * @param {string} storedHash - Stored hex hash
 * @param {string} saltHex - Stored salt hex
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, storedHash, saltHex) {
  try {
    const candidateHash = await hashPassword(password, saltHex);
    // Constant-time length check and comparison to resist timing attacks
    if (candidateHash.length !== storedHash.length) return false;
    let result = 0;
    for (let i = 0; i < candidateHash.length; i++) {
      result |= candidateHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    return result === 0;
  } catch (err) {
    console.error('[SecurityUtils] Verification error:', err);
    return false;
  }
}

/**
 * Escapes unsafe HTML characters to prevent XSS injection
 * @param {string} raw - Untrusted input string
 * @returns {string} Sanitized string safe for DOM insertion
 */
export function sanitizeHTML(raw) {
  if (typeof raw !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return raw.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Safely parses and renders Markdown after strict HTML sanitization
 * Supports bold, italic, inline code, code blocks with copy buttons, lists, and LaTeX style blocks.
 * @param {string} text - Raw Markdown content (e.g. from AI)
 * @returns {string} Safe HTML string
 */
export function renderMarkdownSafe(text) {
  if (!text) return '';

  // Step 1: Escape all HTML entities FIRST (blocks all XSS payloads like <script> or <img onerror>)
  let safe = sanitizeHTML(text);

  // Step 2: Code blocks ```lang\ncode\n```
  safe = safe.replace(/```([a-zA-Z0-9_\-#+]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const id = 'cb_' + Math.random().toString(36).substr(2, 9);
    return `
      <div class="code-block-wrapper" style="position:relative; margin:12px 0; border-radius:8px; overflow:hidden; background:#080d1a; border:1px solid rgba(255,255,255,0.1);">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 12px; background:rgba(255,255,255,0.04); font-size:12px; color:#8b949e; border-bottom:1px solid rgba(255,255,255,0.06);">
          <span>${lang ? lang.toUpperCase() : 'CODE'}</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('${id}').innerText).then(() => { this.innerText='Copied!'; setTimeout(() => this.innerText='Copy', 1500); })" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:#fff; padding:2px 8px; border-radius:4px; font-size:11px; cursor:pointer;">Copy</button>
        </div>
        <pre id="${id}" style="margin:0; padding:14px; overflow-x:auto; font-family:'Fira Code', monospace, Consolas; font-size:13px; line-height:1.5; color:#7ee787;"><code>${code}</code></pre>
      </div>
    `;
  });

  // Step 3: Inline code `code`
  safe = safe.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08); color:#ffac4d; padding:2px 6px; border-radius:4px; font-family:monospace; font-size:0.9em;">$1</code>');

  // Step 4: Bold **text**
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#ffffff; font-weight:700;">$1</strong>');

  // Step 5: Italic *text*
  safe = safe.replace(/\*([^*]+)\*/g, '<em style="color:#cbd5e1;">$1</em>');

  // Step 6: Math display blocks $$formula$$
  safe = safe.replace(/\$\$([\s\S]+?)\$\$/g, '<div class="math-block" style="padding:10px; margin:8px 0; background:rgba(0,71,171,0.15); border-left:3px solid #0047ab; border-radius:4px; font-family:serif; font-size:1.1em; color:#93c5fd;">$1</div>');

  // Step 7: Math inline $formula$
  safe = safe.replace(/\$([^\$\n]+)\$/g, '<span class="math-inline" style="background:rgba(0,71,171,0.1); padding:2px 5px; border-radius:3px; font-family:serif; color:#60a5fa;">$1</span>');

  // Step 8: Bullet lists
  safe = safe.replace(/^\s*[-*]\s+(.*)$/gm, '<li style="margin-left:20px; list-style-type:disc; color:#e2e8f0; margin-bottom:4px;">$1</li>');

  // Step 9: Numbered lists
  safe = safe.replace(/^\s*(\d+)\.\s+(.*)$/gm, '<li style="margin-left:20px; list-style-type:decimal; color:#e2e8f0; margin-bottom:4px;">$2</li>');

  // Step 10: Newlines to <br> for regular paragraphs
  safe = safe.replace(/\n\n/g, '<div style="height:8px;"></div>');
  safe = safe.replace(/\n/g, '<br/>');

  return safe;
}

// Global attachment for non-ES module environments
if (typeof window !== 'undefined') {
  window.SecurityUtils = {
    generateSalt,
    hashPassword,
    verifyPassword,
    sanitizeHTML,
    renderMarkdownSafe
  };
}
