// Accounts on this device. CodeForge runs on GitHub Pages with no server, so accounts live in
// this browser's localStorage: several people can share one computer and each keeps their own
// progress and streak. A password is never stored. Each account keeps a random salt and a
// PBKDF2-SHA256 hash of the password (210,000 rounds, the OWASP recommendation), and signing in
// hashes what you typed the same way and compares the two. It protects against someone reading
// the saved data, but it isn't a cloud account: the data stays in this browser.
//
// Storage keys:
//   codeforge-accounts                 { users: { "<name>": { salt, hash, iterations, created } } }
//   codeforge-session                  the signed-in name, or nothing for a guest
//   code-tutor-progress[:<name>]       guide progress (Progress in tutor-core.js); no suffix = guest
//   codeforge-activity[:<name>]        study days for the streak (activity.js); no suffix = guest

export const ITERATIONS = 210000;
export const NAME_RULE = /^[A-Za-z0-9_-]{3,24}$/;
export const MIN_PASSWORD = 8;
const ACCOUNTS = 'codeforge-accounts';
const SESSION = 'codeforge-session';

/** The storage key for a guide-progress or activity record: the guest's, or one account's. */
export const keyFor = (base, user) => (user ? `${base}:${user.toLowerCase()}` : base);
export const PROGRESS_KEY = 'code-tutor-progress';
export const ACTIVITY_KEY = 'codeforge-activity';

const hex = (bytes) => [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (h) => new Uint8Array(h.match(/../g).map((b) => parseInt(b, 16)));

/** PBKDF2-SHA256 of a password with a salt, as hex. Uses the browser's Web Crypto (also in Node). */
export async function hashPassword(password, saltHex, iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations }, key, 256);
  return hex(bits);
}

/** Compares two hex strings in the same time whatever they hold, so timing doesn't leak how much matched. */
export function sameHash(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export class Accounts {
  constructor(storage = globalThis.localStorage) { this.storage = storage; }

  read() { try { return JSON.parse(this.storage?.getItem(ACCOUNTS)) ?? { users: {} }; } catch { return { users: {} }; } }
  write(data) { try { this.storage?.setItem(ACCOUNTS, JSON.stringify(data)); return true; } catch { return false; } }

  /** The signed-in name, or null for a guest. */
  current() {
    let name = null;
    try { name = this.storage?.getItem(SESSION); } catch { /* blocked */ }
    return name && this.read().users[name.toLowerCase()] ? this.read().users[name.toLowerCase()].name : null;
  }

  list() { return Object.values(this.read().users).map((u) => u.name); }

  /** Checks a name and password before creating an account. Returns an error message or ''. */
  problem(name, password) {
    if (!NAME_RULE.test(name ?? '')) return 'Pick a name of 3 to 24 letters, numbers, - or _.';
    if ((password ?? '').length < MIN_PASSWORD) return `Use a password of at least ${MIN_PASSWORD} characters.`;
    if (this.read().users[name.toLowerCase()]) return 'That name is taken on this device. Sign in instead, or pick another.';
    return '';
  }

  /** Creates an account and signs in. With { bringGuest: true } the guest's progress and streak move into it. */
  async create(name, password, { bringGuest = false } = {}) {
    const error = this.problem(name, password);
    if (error) return { ok: false, error };
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    const hash = await hashPassword(password, salt);
    const data = this.read();
    data.users[name.toLowerCase()] = { name, salt, hash, iterations: ITERATIONS, created: new Date().toISOString() };
    if (!this.write(data)) return { ok: false, error: 'This browser is blocking storage, so accounts can\'t be saved here.' };
    if (bringGuest) this.moveGuest(name);
    this.setSession(name);
    return { ok: true, name };
  }

  /** Signs in when the password's hash matches. The same message is used for a wrong name or password. */
  async signIn(name, password) {
    const user = this.read().users[(name ?? '').toLowerCase()];
    const wrong = { ok: false, error: 'That name and password don\'t match an account on this device.' };
    if (!user) { await hashPassword(password ?? '', '00'.repeat(16)); return wrong; }   // same work either way
    const hash = await hashPassword(password ?? '', user.salt, user.iterations);
    if (!sameHash(hash, user.hash)) return wrong;
    this.setSession(user.name);
    return { ok: true, name: user.name };
  }

  signOut() { try { this.storage?.removeItem(SESSION); } catch { /* ignore */ } }

  /** Deletes an account and its progress, after checking the password again. */
  async remove(name, password) {
    const check = await this.signIn(name, password);
    if (!check.ok) return check;
    const data = this.read();
    delete data.users[name.toLowerCase()];
    this.write(data);
    try {
      this.storage?.removeItem(keyFor(PROGRESS_KEY, name));
      this.storage?.removeItem(keyFor(ACTIVITY_KEY, name));
    } catch { /* ignore */ }
    this.signOut();
    return { ok: true };
  }

  setSession(name) { try { this.storage?.setItem(SESSION, name); } catch { /* ignore */ } }

  /** Moves the guest's progress and study days into an account (merging with anything already there), then clears the guest's. */
  moveGuest(name) {
    const read = (k) => { try { return JSON.parse(this.storage?.getItem(k)); } catch { return null; } };
    const guestProgress = read(PROGRESS_KEY) ?? {};
    const guestDays = read(ACTIVITY_KEY)?.days ?? [];
    const mine = read(keyFor(PROGRESS_KEY, name)) ?? {};
    const days = [...new Set([...(read(keyFor(ACTIVITY_KEY, name))?.days ?? []), ...guestDays])].sort();
    try {
      this.storage?.setItem(keyFor(PROGRESS_KEY, name), JSON.stringify({ ...guestProgress, ...mine }));
      this.storage?.setItem(keyFor(ACTIVITY_KEY, name), JSON.stringify({ days }));
      this.storage?.removeItem(PROGRESS_KEY);
      this.storage?.removeItem(ACTIVITY_KEY);
    } catch { /* ignore */ }
  }
}
