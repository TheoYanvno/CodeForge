---
id: signup
title: Accounts: sign up, hashed passwords and sessions
blocks-html: page
blocks-css: base
blocks-js: crypto, users, signup, signin
goals: Explain why an app must never store passwords, only salted hashes; Hash a password with PBKDF2 using the browser's Web Crypto; Explain what a salt does and why every account gets its own; Sign up and sign in by hashing again and comparing, with the same message for a wrong name or password; Keep a session so the page remembers who is signed in, and sign out
prereqs: The Saving a best score lesson (localStorage and try/catch) and the Fetching quotes and jokes lesson (async and await)
---

## Session: Accounts done safely

## Step: Why passwords are never stored
time: 12
kind: read

Data leaks happen to big companies every year. If an app stores passwords as they were typed, one leak hands every password to the attacker, and because people reuse passwords, their email and bank accounts too.

So an app stores a **hash** instead. A hash function turns any text into a fixed-length scramble, and it only works one way: from the password you can get the hash, but from the hash you can't get the password back. To check a sign-in, hash what was typed and compare the two hashes.

```svg Sign-up stores salt + hash; sign-in hashes the typed password with the same salt and compares
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 150" font-family="sans-serif" font-size="12">
  <rect x="5" y="20" width="90" height="34" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="50" y="42" text-anchor="middle">password</text>
  <rect x="5" y="66" width="90" height="34" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="50" y="88" text-anchor="middle">random salt</text>
  <rect x="130" y="40" width="80" height="44" rx="10" fill="#6366f1"/><text x="170" y="60" text-anchor="middle" fill="#fff">PBKDF2</text><text x="170" y="76" text-anchor="middle" fill="#fff" font-size="10">210,000 rounds</text>
  <rect x="245" y="40" width="80" height="44" rx="10" fill="#dcfce7" stroke="#16a34a"/><text x="285" y="60" text-anchor="middle">hash</text><text x="285" y="76" text-anchor="middle" font-size="10">9f3c…a71e</text>
  <path d="M95 37 L126 55 M95 83 L126 69 M210 62 H241" stroke="#111" stroke-width="2"/>
  <text x="165" y="125" text-anchor="middle" fill="#334155">saved: name, salt, hash, never the password</text>
</svg>
```

### Salt, and slowness

- A **salt** is a random value made for each account and saved next to its hash. Two people with the password `sunshine1` get completely different hashes, so an attacker can't spot them or use a ready-made table of common passwords.
- **PBKDF2** runs the hash 210,000 times on purpose. That's a fraction of a second for one sign-in, but it makes guessing billions of passwords painfully slow for an attacker.

The browser has all of this built in, in **Web Crypto** (`crypto.subtle`), so you never write your own hashing.

> In a real web app the hashing happens on the server, and the database lives there. This lesson keeps accounts in the browser (like CodeForge does) so you can see every part. The ideas are exactly the same.

## Step: Hashing a password with Web Crypto
time: 18

`hashPassword(password, salt)` does three things:

1. `importKey` turns the password's bytes into a key Web Crypto can use.
2. `deriveBits` runs PBKDF2 with SHA-256, the salt and 210,000 rounds, giving 256 bits.
3. `toHex` writes those bits as 64 hex characters, easy to save and compare.

Web Crypto only works on **secure pages**: `https://` addresses and `localhost` (VS Code's Live Server counts). On a plain `http://` address `crypto.subtle` is missing, so `hashPassword` stops with a clear error instead of failing strangely. GitHub Pages is always https.

A new salt comes from `crypto.getRandomValues`, the browser's secure random generator. (Never `Math.random()` for security: it can be predicted.)

Type a password and press **Hash it** twice. The salt changes each time, so the hash changes too, even though the password didn't. That's the point.

```svg The same password with two different salts gives two unrelated hashes
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" font-family="sans-serif" font-size="12">
  <text x="5" y="22">"sunshine1" + salt 4be1…</text><text x="200" y="22">→ 0c9d…e472</text>
  <text x="5" y="56">"sunshine1" + salt a03f…</text><text x="200" y="56">→ 77b1…19fa</text>
  <text x="5" y="96" fill="#334155">same password, different salt → nothing in common</text>
</svg>
```

check: js | a secure random salt | /crypto\.getRandomValues\(/ | crypto.getRandomValues(new Uint8Array(16))
check: js | PBKDF2 from Web Crypto | /deriveBits\(\s*\{[^}]*PBKDF2/ | crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
check: js | many rounds on purpose | /iterations\s*:\s*ITERATIONS|ITERATIONS\s*=\s*210000/ | const ITERATIONS = 210000;

quiz: Why does every account get its own random salt?
- [ ] To make the hash shorter
- [x] So the same password gives different hashes, and precomputed tables of common passwords don't work
- [ ] Salts make hashing faster
why: A salt makes each hash unique to that account, even when two people share a password.

quiz: Why use `crypto.getRandomValues` instead of `Math.random()` for the salt?
- [x] Math.random can be predicted; getRandomValues is made for security
- [ ] Math.random only gives whole numbers
- [ ] There's no difference
why: Security needs randomness an attacker can't predict.

```html page
<main class="card">
  <h1>Accounts</h1>
  <p id="who" class="who" role="status">Not signed in</p>

  <section class="box">
    <h2>Try hashing</h2>
    <label>Password <input id="pw" type="password" autocomplete="off"></label>
    <button id="hash">Hash it</button>
    <p id="hashOut" class="mono"></p>
  </section>

  <form id="signupForm" class="box">
    <h2>Create an account</h2>
    <label>Name <input name="name" autocomplete="off" required></label>
    <label>Password <input name="password" type="password" autocomplete="new-password" required></label>
    <button>Create account</button>
    <p class="msg" role="alert"></p>
  </form>

  <form id="signinForm" class="box">
    <h2>Sign in</h2>
    <label>Name <input name="name" autocomplete="off" required></label>
    <label>Password <input name="password" type="password" autocomplete="current-password" required></label>
    <button>Sign in</button>
    <p class="msg" role="alert"></p>
  </form>

  <button id="signout" hidden>Sign out</button>
  <p class="mono small">Saved accounts: <span id="saved">none</span></p>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: start center;
  padding: 20px 0;
  font-family: system-ui, sans-serif;
  background: #ecfeff;
  color: #083344;
}

.card {
  width: min(460px, 100% - 32px);
  padding: 20px;
  background: #fff;
  border-radius: 16px;
}

h1 { margin-top: 0; }
h2 { font-size: 1rem; margin: 0 0 8px; }
.box { display: grid; gap: 8px; padding: 12px; margin: 12px 0; border: 1px solid #a5f3fc; border-radius: 12px; }
label { display: grid; gap: 4px; font-size: .9rem; }
input { padding: 8px; font: inherit; border: 1px solid #67e8f9; border-radius: 8px; }
button { padding: 8px 12px; font: inherit; }
.who { font-weight: 700; }
.msg { margin: 0; min-height: 1.2em; color: #b91c1c; }
.mono { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .8rem; overflow-wrap: anywhere; }
.small { color: #64748b; }
```

```js crypto
const ITERATIONS = 210000;

const toHex = (bytes) => [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => new Uint8Array(hex.match(/../g).map((h) => parseInt(h, 16)));
const newSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

async function hashPassword(password, saltHex) {
  if (!crypto.subtle) throw new Error('Web Crypto only works on https:// pages or localhost.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations: ITERATIONS }, key, 256);
  return toHex(bits);
}

document.getElementById('hash').addEventListener('click', async () => {
  const salt = newSalt();
  const hash = await hashPassword(document.getElementById('pw').value, salt);
  document.getElementById('hashOut').textContent = `salt ${salt}\nhash ${hash}`;
});
```

## Step: Signing up: save the salt and hash, nothing else
time: 15

Creating an account checks the name and password, makes a new salt, hashes, and saves `{ salt, hash }` under the name. The password itself is never saved anywhere.

```js
users[name] = { salt, hash };
```

Names are saved in lowercase, so "Sam" and "sam" are the same account. A password needs at least 8 characters; length matters more than odd symbols.

The **Saved accounts** line shows exactly what's stored, so you can see for yourself: no password in sight.

check: js | the users saved in storage | /localStorage\.setItem\(\s*['"]users['"]/ | localStorage.setItem('users', JSON.stringify(users))
check: js | saving only the salt and the hash | /users\[\s*\w+\s*\]\s*=\s*\{\s*salt\s*,\s*hash\s*\}/ | users[key] = { salt, hash };
check: js | a minimum password length | /password\.length\s*<\s*8/ | if (password.length < 8) ...

quiz: After signing up, what is saved for the account?
- [ ] The name and the password
- [x] The name, the salt and the hash
- [ ] Only the name
why: The salt and hash are enough to check a password later; the password itself is never kept.

quiz: Why is the name saved in lowercase?
- [x] So "Sam" and "sam" can't become two different accounts
- [ ] Hashes only work on lowercase text
- [ ] localStorage needs lowercase keys
why: People type names inconsistently; one canonical form avoids look-alike duplicates.

```js users
function loadUsers() {
  try { return JSON.parse(localStorage.getItem('users')) ?? {}; } catch { return {}; }
}

function saveUsers() {
  try { localStorage.setItem('users', JSON.stringify(users)); } catch { /* not saved */ }
  document.getElementById('saved').textContent = JSON.stringify(users) === '{}' ? 'none' : JSON.stringify(users);
}

let users = loadUsers();
saveUsers();
```

```js signup
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const msg = form.querySelector('.msg');
  const name = form.elements.namedItem('name').value.trim();
  const password = form.password.value;
  const key = name.toLowerCase();
  if (!/^[a-z0-9_-]{3,24}$/i.test(name)) { msg.textContent = 'Use 3 to 24 letters, numbers, - or _.'; return; }
  if (password.length < 8) { msg.textContent = 'Use at least 8 characters.'; return; }
  if (users[key]) { msg.textContent = 'That name is taken.'; return; }
  msg.textContent = 'Hashing…';
  const salt = newSalt();
  const hash = await hashPassword(password, salt);
  users[key] = { salt, hash };
  saveUsers();
  form.reset();
  msg.textContent = '';
  document.getElementById('who').textContent = `Account created for ${name}. Now sign in.`;
});
```

## Step: Signing in, and a session
time: 18

Signing in looks up the account, hashes the typed password **with that account's salt**, and compares. Same password + same salt = same hash.

Two security habits:

- **The same message for a wrong name and a wrong password.** "Wrong password" would tell an attacker the name exists.
- **A constant-time compare.** `sameHash` checks every character even after a mismatch, so the time it takes doesn't leak how much matched.

After a good sign-in, the page keeps a **session**: a note of who is signed in. Here it's `sessionStorage`, which lasts until the tab closes (a real server uses a session cookie for the same job). **Sign out** removes it.

```svg Sign-in: hash the typed password with the saved salt, compare, then start a session that sign-out ends
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" font-family="sans-serif" font-size="12">
  <rect x="5" y="40" width="70" height="36" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="40" y="62" text-anchor="middle">typed pw</text>
  <rect x="95" y="40" width="70" height="36" rx="8" fill="#6366f1"/><text x="130" y="62" text-anchor="middle" fill="#fff">hash + salt</text>
  <path d="M185 58 L215 38 L245 58 L215 78 Z" fill="#fef9c3" stroke="#ca8a04"/><text x="215" y="62" text-anchor="middle">same?</text>
  <rect x="260" y="10" width="65" height="32" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="292" y="31" text-anchor="middle">session</text>
  <rect x="260" y="76" width="65" height="32" rx="8" fill="#fee2e2" stroke="#ef4444"/><text x="292" y="97" text-anchor="middle">no match</text>
  <path d="M75 58 H91 M165 58 H183 M240 50 L258 30 M240 66 L258 88" stroke="#111" stroke-width="2"/>
</svg>
```

check: js | hashing with the account's own salt | /hashPassword\(\s*\w+\s*,\s*user\.salt\s*\)/ | await hashPassword(password, user.salt)
check: js | a constant-time compare | /function\s+sameHash\s*\(/ | function sameHash(a, b) { ... }
check: js | a session that lasts until the tab closes | /sessionStorage\.setItem\(/ | sessionStorage.setItem('session', key)

quiz: Someone signs in as "pat" with the wrong password. What should the message say?
- [ ] "Wrong password for pat"
- [x] The same thing it says for a name that doesn't exist, like "Name or password is wrong"
- [ ] "pat exists, try again"
why: Different messages would let an attacker find out which names have accounts.

quiz: Why does sign-in use the salt saved with the account, instead of a new one?
- [ ] New salts are slower to make
- [x] Only the same salt gives the same hash for the right password
- [ ] The salt doesn't matter at sign-in
why: The saved hash was made with that salt, so checking needs the same one.

```js signin
function sameHash(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const who = document.getElementById('who');
const signoutBtn = document.getElementById('signout');

function showSession() {
  let key = null;
  try { key = sessionStorage.getItem('session'); } catch { /* blocked */ }
  who.textContent = key && users[key] ? `Signed in as ${key}` : 'Not signed in';
  signoutBtn.hidden = !(key && users[key]);
}

document.getElementById('signinForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const msg = form.querySelector('.msg');
  const key = form.elements.namedItem('name').value.trim().toLowerCase();
  const password = form.password.value;
  msg.textContent = 'Checking…';
  const user = users[key];
  const hash = user ? await hashPassword(password, user.salt) : await hashPassword(password, newSalt());
  if (!user || !sameHash(hash, user.hash)) { msg.textContent = 'Name or password is wrong.'; return; }
  try { sessionStorage.setItem('session', key); } catch { /* not kept */ }
  form.reset();
  msg.textContent = '';
  showSession();
});

signoutBtn.addEventListener('click', () => {
  try { sessionStorage.removeItem('session'); } catch { /* nothing to remove */ }
  showSession();
});

showSession();
```

## Finish

You can build sign-up and sign-in the safe way. You learned:

- **Never store passwords**: save a salted **hash**
- **PBKDF2** with Web Crypto, many rounds on purpose, and a secure random **salt**
- Signing in by **hashing again** with the saved salt and comparing in constant time
- The **same message** for a wrong name or password
- A **session** with sessionStorage, and signing out

### Challenges

1. Lock an account for 1 minute after 5 wrong passwords in a row (the Quote project's server does this).
2. Add "Change password": check the old one first, then save a new salt and hash.
3. Show a password strength hint (length and variety) while typing, without blocking long passphrases.

### Next

**Sharing**: copy a quote or send it with the phone's share sheet.
