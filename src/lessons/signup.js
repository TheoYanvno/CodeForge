// Built from guides/signup.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "signup",
 "title": "Accounts: sign up, hashed passwords and sessions",
 "goals": [
  "Explain why an app must never store passwords, only salted hashes",
  "Hash a password with PBKDF2 using the browser's Web Crypto",
  "Explain what a salt does and why every account gets its own",
  "Sign up and sign in by hashing again and comparing, with the same message for a wrong name or password",
  "Keep a session so the page remembers who is signed in, and sign out"
 ],
 "prereqs": [
  "The Saving a best score lesson (localStorage and try/catch) and the Fetching quotes and jokes lesson (async and await)"
 ],
 "sessions": [
  {
   "title": "Accounts done safely",
   "from": 0,
   "to": 3
  }
 ],
 "start": {
  "html": {
   "page": ""
  },
  "css": {
   "base": ""
  },
  "js": {
   "crypto": "",
   "users": "",
   "signup": "",
   "signin": ""
  }
 },
 "steps": [
  {
   "title": "Why passwords are never stored",
   "body": "Data leaks happen to big companies every year. If an app stores passwords as they were typed, one leak hands every password to the attacker, and because people reuse passwords, their email and bank accounts too.\n\nSo an app stores a **hash** instead. A hash function turns any text into a fixed-length scramble, and it only works one way: from the password you can get the hash, but from the hash you can't get the password back. To check a sign-in, hash what was typed and compare the two hashes.\n\n```svg Sign-up stores salt + hash; sign-in hashes the typed password with the same salt and compares\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"20\" width=\"90\" height=\"34\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"50\" y=\"42\" text-anchor=\"middle\">password</text>\n  <rect x=\"5\" y=\"66\" width=\"90\" height=\"34\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"50\" y=\"88\" text-anchor=\"middle\">random salt</text>\n  <rect x=\"130\" y=\"40\" width=\"80\" height=\"44\" rx=\"10\" fill=\"#6366f1\"/><text x=\"170\" y=\"60\" text-anchor=\"middle\" fill=\"#fff\">PBKDF2</text><text x=\"170\" y=\"76\" text-anchor=\"middle\" fill=\"#fff\" font-size=\"10\">210,000 rounds</text>\n  <rect x=\"245\" y=\"40\" width=\"80\" height=\"44\" rx=\"10\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"285\" y=\"60\" text-anchor=\"middle\">hash</text><text x=\"285\" y=\"76\" text-anchor=\"middle\" font-size=\"10\">9f3c…a71e</text>\n  <path d=\"M95 37 L126 55 M95 83 L126 69 M210 62 H241\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"165\" y=\"125\" text-anchor=\"middle\" fill=\"#334155\">saved: name, salt, hash, never the password</text>\n</svg>\n```\n\n### Salt, and slowness\n\n- A **salt** is a random value made for each account and saved next to its hash. Two people with the password `sunshine1` get completely different hashes, so an attacker can't spot them or use a ready-made table of common passwords.\n- **PBKDF2** runs the hash 210,000 times on purpose. That's a fraction of a second for one sign-in, but it makes guessing billions of passwords painfully slow for an attacker.\n\nThe browser has all of this built in, in **Web Crypto** (`crypto.subtle`), so you never write your own hashing.\n\n> In a real web app the hashing happens on the server, and the database lives there. This lesson keeps accounts in the browser (like CodeForge does) so you can see every part. The ideas are exactly the same.",
   "session": 0,
   "minutes": 12,
   "kind": "read"
  },
  {
   "title": "Hashing a password with Web Crypto",
   "body": "`hashPassword(password, salt)` does three things:\n\n1. `importKey` turns the password's bytes into a key Web Crypto can use.\n2. `deriveBits` runs PBKDF2 with SHA-256, the salt and 210,000 rounds, giving 256 bits.\n3. `toHex` writes those bits as 64 hex characters, easy to save and compare.\n\nWeb Crypto only works on **secure pages**: `https://` addresses and `localhost` (VS Code's Live Server counts). On a plain `http://` address `crypto.subtle` is missing, so `hashPassword` stops with a clear error instead of failing strangely. GitHub Pages is always https.\n\nA new salt comes from `crypto.getRandomValues`, the browser's secure random generator. (Never `Math.random()` for security: it can be predicted.)\n\nType a password and press **Hash it** twice. The salt changes each time, so the hash changes too, even though the password didn't. That's the point.\n\n```svg The same password with two different salts gives two unrelated hashes\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <text x=\"5\" y=\"22\">\"sunshine1\" + salt 4be1…</text><text x=\"200\" y=\"22\">→ 0c9d…e472</text>\n  <text x=\"5\" y=\"56\">\"sunshine1\" + salt a03f…</text><text x=\"200\" y=\"56\">→ 77b1…19fa</text>\n  <text x=\"5\" y=\"96\" fill=\"#334155\">same password, different salt → nothing in common</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a secure random salt",
     "test": "/crypto\\.getRandomValues\\(/",
     "hint": "crypto.getRandomValues(new Uint8Array(16))"
    },
    {
     "pane": "js",
     "label": "PBKDF2 from Web Crypto",
     "test": "/deriveBits\\(\\s*\\{[^}]*PBKDF2/",
     "hint": "crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)"
    },
    {
     "pane": "js",
     "label": "many rounds on purpose",
     "test": "/iterations\\s*:\\s*ITERATIONS|ITERATIONS\\s*=\\s*210000/",
     "hint": "const ITERATIONS = 210000;"
    }
   ],
   "quiz": [
    {
     "q": "Why does every account get its own random salt?",
     "options": [
      "To make the hash shorter",
      "So the same password gives different hashes, and precomputed tables of common passwords don't work",
      "Salts make hashing faster"
     ],
     "answer": 1,
     "why": "A salt makes each hash unique to that account, even when two people share a password."
    },
    {
     "q": "Why use `crypto.getRandomValues` instead of `Math.random()` for the salt?",
     "options": [
      "Math.random can be predicted; getRandomValues is made for security",
      "Math.random only gives whole numbers",
      "There's no difference"
     ],
     "answer": 0,
     "why": "Security needs randomness an attacker can't predict."
    }
   ],
   "session": 0,
   "minutes": 18,
   "html": {
    "page": "<main class=\"card\">\n  <h1>Accounts</h1>\n  <p id=\"who\" class=\"who\" role=\"status\">Not signed in</p>\n\n  <section class=\"box\">\n    <h2>Try hashing</h2>\n    <label>Password <input id=\"pw\" type=\"password\" autocomplete=\"off\"></label>\n    <button id=\"hash\">Hash it</button>\n    <p id=\"hashOut\" class=\"mono\"></p>\n  </section>\n\n  <form id=\"signupForm\" class=\"box\">\n    <h2>Create an account</h2>\n    <label>Name <input name=\"name\" autocomplete=\"off\" required></label>\n    <label>Password <input name=\"password\" type=\"password\" autocomplete=\"new-password\" required></label>\n    <button>Create account</button>\n    <p class=\"msg\" role=\"alert\"></p>\n  </form>\n\n  <form id=\"signinForm\" class=\"box\">\n    <h2>Sign in</h2>\n    <label>Name <input name=\"name\" autocomplete=\"off\" required></label>\n    <label>Password <input name=\"password\" type=\"password\" autocomplete=\"current-password\" required></label>\n    <button>Sign in</button>\n    <p class=\"msg\" role=\"alert\"></p>\n  </form>\n\n  <button id=\"signout\" hidden>Sign out</button>\n  <p class=\"mono small\">Saved accounts: <span id=\"saved\">none</span></p>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: start center;\n  padding: 20px 0;\n  font-family: system-ui, sans-serif;\n  background: #ecfeff;\n  color: #083344;\n}\n\n.card {\n  width: min(460px, 100% - 32px);\n  padding: 20px;\n  background: #fff;\n  border-radius: 16px;\n}\n\nh1 { margin-top: 0; }\nh2 { font-size: 1rem; margin: 0 0 8px; }\n.box { display: grid; gap: 8px; padding: 12px; margin: 12px 0; border: 1px solid #a5f3fc; border-radius: 12px; }\nlabel { display: grid; gap: 4px; font-size: .9rem; }\ninput { padding: 8px; font: inherit; border: 1px solid #67e8f9; border-radius: 8px; }\nbutton { padding: 8px 12px; font: inherit; }\n.who { font-weight: 700; }\n.msg { margin: 0; min-height: 1.2em; color: #b91c1c; }\n.mono { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .8rem; overflow-wrap: anywhere; }\n.small { color: #64748b; }"
   },
   "js": {
    "crypto": "const ITERATIONS = 210000;\n\nconst toHex = (bytes) => [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');\nconst fromHex = (hex) => new Uint8Array(hex.match(/../g).map((h) => parseInt(h, 16)));\nconst newSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));\n\nasync function hashPassword(password, saltHex) {\n  if (!crypto.subtle) throw new Error('Web Crypto only works on https:// pages or localhost.');\n  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);\n  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations: ITERATIONS }, key, 256);\n  return toHex(bits);\n}\n\ndocument.getElementById('hash').addEventListener('click', async () => {\n  const salt = newSalt();\n  const hash = await hashPassword(document.getElementById('pw').value, salt);\n  document.getElementById('hashOut').textContent = `salt ${salt}\\nhash ${hash}`;\n});"
   }
  },
  {
   "title": "Signing up: save the salt and hash, nothing else",
   "body": "Creating an account checks the name and password, makes a new salt, hashes, and saves `{ salt, hash }` under the name. The password itself is never saved anywhere.\n\n```js\nusers[name] = { salt, hash };\n```\n\nNames are saved in lowercase, so \"Sam\" and \"sam\" are the same account. A password needs at least 8 characters; length matters more than odd symbols.\n\nThe **Saved accounts** line shows exactly what's stored, so you can see for yourself: no password in sight.",
   "checks": [
    {
     "pane": "js",
     "label": "the users saved in storage",
     "test": "/localStorage\\.setItem\\(\\s*['\"]users['\"]/",
     "hint": "localStorage.setItem('users', JSON.stringify(users))"
    },
    {
     "pane": "js",
     "label": "saving only the salt and the hash",
     "test": "/users\\[\\s*\\w+\\s*\\]\\s*=\\s*\\{\\s*salt\\s*,\\s*hash\\s*\\}/",
     "hint": "users[key] = { salt, hash };"
    },
    {
     "pane": "js",
     "label": "a minimum password length",
     "test": "/password\\.length\\s*<\\s*8/",
     "hint": "if (password.length < 8) ..."
    }
   ],
   "quiz": [
    {
     "q": "After signing up, what is saved for the account?",
     "options": [
      "The name and the password",
      "The name, the salt and the hash",
      "Only the name"
     ],
     "answer": 1,
     "why": "The salt and hash are enough to check a password later; the password itself is never kept."
    },
    {
     "q": "Why is the name saved in lowercase?",
     "options": [
      "So \"Sam\" and \"sam\" can't become two different accounts",
      "Hashes only work on lowercase text",
      "localStorage needs lowercase keys"
     ],
     "answer": 0,
     "why": "People type names inconsistently; one canonical form avoids look-alike duplicates."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "users": "function loadUsers() {\n  try { return JSON.parse(localStorage.getItem('users')) ?? {}; } catch { return {}; }\n}\n\nfunction saveUsers() {\n  try { localStorage.setItem('users', JSON.stringify(users)); } catch { /* not saved */ }\n  document.getElementById('saved').textContent = JSON.stringify(users) === '{}' ? 'none' : JSON.stringify(users);\n}\n\nlet users = loadUsers();\nsaveUsers();",
    "signup": "document.getElementById('signupForm').addEventListener('submit', async (e) => {\n  e.preventDefault();\n  const form = e.target;\n  const msg = form.querySelector('.msg');\n  const name = form.elements.namedItem('name').value.trim();\n  const password = form.password.value;\n  const key = name.toLowerCase();\n  if (!/^[a-z0-9_-]{3,24}$/i.test(name)) { msg.textContent = 'Use 3 to 24 letters, numbers, - or _.'; return; }\n  if (password.length < 8) { msg.textContent = 'Use at least 8 characters.'; return; }\n  if (users[key]) { msg.textContent = 'That name is taken.'; return; }\n  msg.textContent = 'Hashing…';\n  const salt = newSalt();\n  const hash = await hashPassword(password, salt);\n  users[key] = { salt, hash };\n  saveUsers();\n  form.reset();\n  msg.textContent = '';\n  document.getElementById('who').textContent = `Account created for ${name}. Now sign in.`;\n});"
   }
  },
  {
   "title": "Signing in, and a session",
   "body": "Signing in looks up the account, hashes the typed password **with that account's salt**, and compares. Same password + same salt = same hash.\n\nTwo security habits:\n\n- **The same message for a wrong name and a wrong password.** \"Wrong password\" would tell an attacker the name exists.\n- **A constant-time compare.** `sameHash` checks every character even after a mismatch, so the time it takes doesn't leak how much matched.\n\nAfter a good sign-in, the page keeps a **session**: a note of who is signed in. Here it's `sessionStorage`, which lasts until the tab closes (a real server uses a session cookie for the same job). **Sign out** removes it.\n\n```svg Sign-in: hash the typed password with the saved salt, compare, then start a session that sign-out ends\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"40\" width=\"70\" height=\"36\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"40\" y=\"62\" text-anchor=\"middle\">typed pw</text>\n  <rect x=\"95\" y=\"40\" width=\"70\" height=\"36\" rx=\"8\" fill=\"#6366f1\"/><text x=\"130\" y=\"62\" text-anchor=\"middle\" fill=\"#fff\">hash + salt</text>\n  <path d=\"M185 58 L215 38 L245 58 L215 78 Z\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"215\" y=\"62\" text-anchor=\"middle\">same?</text>\n  <rect x=\"260\" y=\"10\" width=\"65\" height=\"32\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"292\" y=\"31\" text-anchor=\"middle\">session</text>\n  <rect x=\"260\" y=\"76\" width=\"65\" height=\"32\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#ef4444\"/><text x=\"292\" y=\"97\" text-anchor=\"middle\">no match</text>\n  <path d=\"M75 58 H91 M165 58 H183 M240 50 L258 30 M240 66 L258 88\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "hashing with the account's own salt",
     "test": "/hashPassword\\(\\s*\\w+\\s*,\\s*user\\.salt\\s*\\)/",
     "hint": "await hashPassword(password, user.salt)"
    },
    {
     "pane": "js",
     "label": "a constant-time compare",
     "test": "/function\\s+sameHash\\s*\\(/",
     "hint": "function sameHash(a, b) { ... }"
    },
    {
     "pane": "js",
     "label": "a session that lasts until the tab closes",
     "test": "/sessionStorage\\.setItem\\(/",
     "hint": "sessionStorage.setItem('session', key)"
    }
   ],
   "quiz": [
    {
     "q": "Someone signs in as \"pat\" with the wrong password. What should the message say?",
     "options": [
      "\"Wrong password for pat\"",
      "The same thing it says for a name that doesn't exist, like \"Name or password is wrong\"",
      "\"pat exists, try again\""
     ],
     "answer": 1,
     "why": "Different messages would let an attacker find out which names have accounts."
    },
    {
     "q": "Why does sign-in use the salt saved with the account, instead of a new one?",
     "options": [
      "New salts are slower to make",
      "Only the same salt gives the same hash for the right password",
      "The salt doesn't matter at sign-in"
     ],
     "answer": 1,
     "why": "The saved hash was made with that salt, so checking needs the same one."
    }
   ],
   "session": 0,
   "minutes": 18,
   "js": {
    "signin": "function sameHash(a, b) {\n  if (a.length !== b.length) return false;\n  let diff = 0;\n  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);\n  return diff === 0;\n}\n\nconst who = document.getElementById('who');\nconst signoutBtn = document.getElementById('signout');\n\nfunction showSession() {\n  let key = null;\n  try { key = sessionStorage.getItem('session'); } catch { /* blocked */ }\n  who.textContent = key && users[key] ? `Signed in as ${key}` : 'Not signed in';\n  signoutBtn.hidden = !(key && users[key]);\n}\n\ndocument.getElementById('signinForm').addEventListener('submit', async (e) => {\n  e.preventDefault();\n  const form = e.target;\n  const msg = form.querySelector('.msg');\n  const key = form.elements.namedItem('name').value.trim().toLowerCase();\n  const password = form.password.value;\n  msg.textContent = 'Checking…';\n  const user = users[key];\n  const hash = user ? await hashPassword(password, user.salt) : await hashPassword(password, newSalt());\n  if (!user || !sameHash(hash, user.hash)) { msg.textContent = 'Name or password is wrong.'; return; }\n  try { sessionStorage.setItem('session', key); } catch { /* not kept */ }\n  form.reset();\n  msg.textContent = '';\n  showSession();\n});\n\nsignoutBtn.addEventListener('click', () => {\n  try { sessionStorage.removeItem('session'); } catch { /* nothing to remove */ }\n  showSession();\n});\n\nshowSession();"
   }
  }
 ],
 "finish": "You can build sign-up and sign-in the safe way. You learned:\n\n- **Never store passwords**: save a salted **hash**\n- **PBKDF2** with Web Crypto, many rounds on purpose, and a secure random **salt**\n- Signing in by **hashing again** with the saved salt and comparing in constant time\n- The **same message** for a wrong name or password\n- A **session** with sessionStorage, and signing out\n\n### Challenges\n\n1. Lock an account for 1 minute after 5 wrong passwords in a row (the Quote project's server does this).\n2. Add \"Change password\": check the old one first, then save a new salt and hash.\n3. Show a password strength hint (length and variety) while typing, without blocking long passphrases.\n\n### Next\n\n**Sharing**: copy a quote or send it with the phone's share sheet."
};
