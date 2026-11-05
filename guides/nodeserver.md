---
id: nodeserver
title: A small Node server
goals: Explain what a server does that a page in the browser can't; Start a web server with Node's built-in http module and answer requests by method and path; Build a small JSON API with clear status codes, and validate every input; Keep sessions in a cookie, with passwords hashed on the server; Serve the front-end files too, and test the server with Node's own test runner
prereqs: The Roles and permissions lesson and the Accounts lesson; Node.js installed (the Get set up guide)
---

## Session: Where the real checks live

## Step: Why a server?
kind: read
time: 10

Every lesson so far ran in the browser. That's great for learning, but it has limits:

- **Data lives in one browser.** Accounts on one laptop aren't on your phone.
- **The person controls the code.** Anyone can open the developer tools and change it, so a permission check in the browser is only a suggestion.
- **Secrets can't be kept.** An API key in page code is visible to everyone.

A **server** is a program on another computer that the page talks to with `fetch`. It keeps the one shared copy of the data, runs the checks people can't change, and keeps the secrets. The Gotham Hospital System runs on a small Node server like this one, with SQLite for the data.

```svg The browser sends requests; the server checks who you are and what you may do, then reads or writes the shared database
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 130" font-family="sans-serif" font-size="11">
  <rect x="5" y="40" width="80" height="50" rx="10" fill="#e0e7ff" stroke="#6366f1"/><text x="45" y="62" text-anchor="middle">browser</text><text x="45" y="78" text-anchor="middle" font-size="10">fetch()</text>
  <rect x="125" y="25" width="100" height="80" rx="10" fill="#dcfce7" stroke="#16a34a"/><text x="175" y="45" text-anchor="middle">Node server</text><text x="175" y="63" text-anchor="middle" font-size="10">sign-in · sessions</text><text x="175" y="78" text-anchor="middle" font-size="10">permissions</text><text x="175" y="93" text-anchor="middle" font-size="10">validation</text>
  <rect x="255" y="45" width="70" height="40" rx="10" fill="#fef9c3" stroke="#ca8a04"/><text x="290" y="69" text-anchor="middle">SQLite</text>
  <path d="M85 58 H121 M121 72 H85 M225 65 H251" stroke="#111" stroke-width="2"/>
  <text x="103" y="52" text-anchor="middle" font-size="9">request</text><text x="103" y="86" text-anchor="middle" font-size="9">response</text>
</svg>
```

This lesson is **read-along**: Node runs in your terminal, not in a web page, so there's no See it run. Make a folder, put each file in it, and run the commands on your own computer.

quiz: Why must the final permission check run on the server?
- [x] People can change any code running in their own browser, but not the server's
- [ ] Servers are faster at checking
- [ ] Browsers can't run if statements
why: The server is the only place the rules can't be edited by the person using the app.

## Step: Hello, server
kind: read
time: 15

Node comes with an `http` module, so a server needs no packages at all. Save this as `server.js`:

```js
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/api/hello') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello from the server' }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000, () => console.log('Listening on http://localhost:3000'));
```

Add `"type": "module"` to a `package.json` so `import` works, then run `node server.js` and open `http://localhost:3000/api/hello`.

- The function runs **once per request**. `req` is what came in (method, path, headers, body); `res` is what you send back.
- **Routing** is choosing what to do from the **method** (GET to read, POST to create, PUT to change, DELETE to remove) and the **path**, the same idea as the Hash routing lesson's table.
- `writeHead(200, …)` sets the **status code**: 200 OK, 201 Created, 400 Bad request, 401 Not signed in, 403 Not allowed, 404 Not found, 409 Conflict, 500 Server error.

```svg A request comes in with a method and a path; the router picks a handler; the handler answers with a status code and JSON
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 90" font-family="sans-serif" font-size="11">
  <rect x="5" y="25" width="95" height="36" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="52" y="41" text-anchor="middle">GET</text><text x="52" y="54" text-anchor="middle" font-size="10">/api/visits</text>
  <rect x="120" y="25" width="80" height="36" rx="8" fill="#6366f1"/><text x="160" y="47" text-anchor="middle" fill="#fff">router</text>
  <rect x="220" y="25" width="105" height="36" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="272" y="41" text-anchor="middle">200 + JSON</text><text x="272" y="54" text-anchor="middle" font-size="10">or 401 / 403 / 404</text>
  <path d="M100 43 H116 M200 43 H216" stroke="#111" stroke-width="2"/>
</svg>
```

quiz: Which status code means "you're signed in, but you may not do this"?
- [ ] 401
- [x] 403
- [ ] 404
why: 401 means not signed in (unauthenticated); 403 means signed in but forbidden (unauthorized).

quiz: Why answer unknown paths with 404 and JSON instead of nothing?
- [x] The page's fetch gets a clear, readable answer and can show a proper message
- [ ] Browsers crash on empty answers
- [ ] 404 is faster
why: Every request deserves an answer the client can understand, errors included.

## Step: A JSON API that checks everything
kind: read
time: 18

A booking API needs to read JSON from the request body, check it, and answer:

```js
async function readJson(req, limit = 10_000) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > limit) throw Object.assign(new Error('Too large'), { status: 413 });
  }
  try { return JSON.parse(body || '{}'); } catch { throw Object.assign(new Error('Bad JSON'), { status: 400 }); }
}

const send = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// POST /api/visits  { "start": "09:30", "minutes": 30 }
async function createVisit(req, res, user) {
  if (!can(user, 'book visit')) return send(res, 403, { error: 'You may not book visits.' });
  const { start, minutes } = await readJson(req);
  if (!/^\d{2}:\d{2}$/.test(start) || ![15, 30, 45, 60].includes(minutes)) {
    return send(res, 400, { error: 'Start must be HH:MM and minutes 15, 30, 45 or 60.' });
  }
  const visit = { start: toMin(start), end: toMin(start) + minutes };
  if (bookings.some((b) => overlaps(visit, b))) return send(res, 409, { error: 'That time is taken.' });
  bookings.push(visit);
  send(res, 201, visit);
}
```

Every line is a rule from an earlier lesson, now in the one place it can't be skipped:

- **Size limit** on the body, so nobody can send a gigabyte (413).
- **Validate every field**: right format, allowed values only (400). Never trust the request, the same rule as never trusting saved data.
- **Permission check** first (403), from the Roles lesson.
- **Overlap check** (409 Conflict), from the Time slots lesson.
- **201 Created** with the new record when it works.

With a real database, the SQL uses `?` parameters exactly like the SQL lessons, and the overlap check is a query.

```svg Every POST passes the same gates in order: size, signed in, allowed, valid, no conflict; the first one that fails answers with its status code
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 80" font-family="sans-serif" font-size="10">
  <g><rect x="5" y="22" width="52" height="30" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><text x="31" y="41" text-anchor="middle">size 413</text>
  <rect x="62" y="22" width="52" height="30" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><text x="88" y="41" text-anchor="middle">who 401</text>
  <rect x="119" y="22" width="52" height="30" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><text x="145" y="41" text-anchor="middle">may 403</text>
  <rect x="176" y="22" width="52" height="30" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><text x="202" y="41" text-anchor="middle">valid 400</text>
  <rect x="233" y="22" width="52" height="30" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><text x="259" y="41" text-anchor="middle">free 409</text>
  <rect x="290" y="22" width="35" height="30" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="307" y="41" text-anchor="middle">201</text></g>
</svg>
```

quiz: The page already checks the time format before sending. Why check again on the server?
- [ ] The page's check is wrong
- [x] Anyone can send a request without using your page at all, so the server must validate every field itself
- [ ] To make the request slower
why: The server can't know who or what sent the request; it treats every request as untrusted.

quiz: A booking request overlaps an existing visit. Which status fits best?
- [ ] 200
- [ ] 404
- [x] 409 Conflict
why: The request is valid, but it conflicts with the current state of the data.

## Step: Sessions, hashed passwords and the front end
kind: read
time: 18

Signing in works like the Accounts lesson, but the hashing happens **on the server**, with Node's built-in `crypto`:

```js
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const hash = (password, salt) => pbkdf2Sync(password, salt, 210000, 32, 'sha256');

function signIn(name, password) {
  const user = users.get(name);
  const salt = user?.salt ?? randomBytes(16);                 // same work for unknown names
  const ok = user && timingSafeEqual(hash(password, salt), user.hash);
  if (!ok) return null;
  const sid = randomBytes(32).toString('hex');               // the session id
  sessions.set(sid, { userId: user.id, expires: Date.now() + 8 * 3600_000 });
  return sid;
}
```

The server sends the session id back in a **cookie** with safety flags, and the browser includes it on every later request automatically:

```js
res.setHeader('Set-Cookie', `sid=${sid}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`);
```

- `HttpOnly`: page JavaScript can't read the cookie, so a script injected by a bug can't steal it.
- `Secure`: only sent over https.
- `SameSite=Lax`: not sent with forms posted from other websites, which blocks a common attack (CSRF).
- The session id is long and random, and it **expires**. Signing out deletes it from `sessions`.

Each request then looks the user up from the cookie (401 if there's no valid session) before any route runs.

Finally, the same server can hand out the front-end files: a GET for `/` reads `public/index.html` from disk and sends it with the right `Content-Type`, so one `node server.js` runs the whole app.

```svg Sign-in sets an HttpOnly session cookie; every later request carries it, and the server looks up the user before running any route
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="11">
  <rect x="5" y="15" width="90" height="30" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="50" y="34" text-anchor="middle">POST /api/login</text>
  <rect x="120" y="15" width="205" height="30" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="222" y="34" text-anchor="middle">Set-Cookie: sid=… HttpOnly; Secure</text>
  <rect x="5" y="58" width="90" height="30" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="50" y="77" text-anchor="middle">GET /api/visits</text>
  <rect x="120" y="58" width="205" height="30" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="222" y="77" text-anchor="middle">cookie → session → user → route</text>
  <path d="M95 30 H116 M95 73 H116" stroke="#111" stroke-width="2"/>
</svg>
```

### Testing it

Node has a test runner built in. Start the server on a random port in a test, call it with `fetch`, and check the answers:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('booking an overlapping visit is refused with 409', async () => {
  const res = await fetch(`${base}/api/visits`, { method: 'POST', headers: { cookie }, body: JSON.stringify({ start: '10:15', minutes: 30 }) });
  assert.equal(res.status, 409);
});
```

Run all the tests with `node --test`. The Gotham Hospital System's tests work exactly like this.

quiz: Why is the session cookie marked HttpOnly?
- [x] So page JavaScript can't read it, and a script injected through a bug can't steal the session
- [ ] So it only works on http, not https
- [ ] To make it load faster
why: HttpOnly hides the cookie from scripts while the browser still sends it with requests.

quiz: Why does signIn hash something even when the name doesn't exist?
- [ ] To create the account
- [x] So a wrong name takes as long as a wrong password, and timing can't reveal which names exist
- [ ] PBKDF2 needs to warm up
why: Same work, same time, same message: nothing leaks about which accounts exist.

## Finish

You know how the server side of an app works now. You learned:

- What a **server** is for: shared data, checks people can't change, and secrets
- **node:http**, routing by **method and path**, and **status codes**
- A **JSON API** with size limits, **validation**, permission and conflict checks
- **Server-side hashing**, random **session ids** in **HttpOnly, Secure, SameSite** cookies
- Serving the front end too, and **node --test** for the API

You've now learned every part of the **Gotham Hospital System**. Build it next.

### Challenges

1. Add `GET /api/visits?day=2026-11-05` that returns only that day's visits, with the day validated.
2. Lock an account for 5 minutes after 5 wrong passwords, and test it.
3. Move the data into SQLite (the `node:sqlite` module in recent Node versions, or a small package) with `?` parameters everywhere.

### Next

The **Gotham Hospital System** project.
