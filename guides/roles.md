---
id: roles
title: Roles and permissions
blocks-html: page
blocks-css: base
blocks-js: data, perms, guard, records
goals: Tell authentication (who you are) from authorization (what you may do); Keep permissions in one table from roles to actions, and check them with one can() function; Hide what someone can't use, and still check again on every action, because hiding isn't security; Add rules about which records a person may touch, not just which actions; Keep an audit log of who did what, including what was refused
prereqs: The Accounts lesson (sign-in and sessions) and the App state lesson (actions)
---

## Session: Who may do what

## Step: Authentication and authorization
time: 10
kind: read

Two words that sound alike and mean different things:

- **Authentication**: *who are you?* Signing in with a name and password (the Accounts lesson) proves it.
- **Authorization**: *what are you allowed to do?* A receptionist books visits; a doctor reads charts; a patient sees only their own record.

Writing `if (user.role === 'doctor' || user.role === 'nurse' || ...)` all over an app is how mistakes creep in: one forgotten check is a data leak. Instead, one **table** lists what each role may do, and one **function** answers every question:

```svg Roles map to sets of actions in one table; can(user, action) looks it up, and every action asks it first
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 140" font-family="sans-serif" font-size="11">
  <g><rect x="5" y="10" width="90" height="26" rx="6" fill="#e0e7ff" stroke="#6366f1"/><text x="50" y="27" text-anchor="middle">receptionist</text>
  <rect x="5" y="46" width="90" height="26" rx="6" fill="#e0e7ff" stroke="#6366f1"/><text x="50" y="63" text-anchor="middle">doctor</text>
  <rect x="5" y="82" width="90" height="26" rx="6" fill="#e0e7ff" stroke="#6366f1"/><text x="50" y="99" text-anchor="middle">patient</text></g>
  <g><rect x="140" y="10" width="185" height="26" rx="6" fill="#fef9c3"/><text x="148" y="27">book visit · view schedule</text>
  <rect x="140" y="46" width="185" height="26" rx="6" fill="#fef9c3"/><text x="148" y="63">view schedule · read chart · write note</text>
  <rect x="140" y="82" width="185" height="26" rx="6" fill="#fef9c3"/><text x="148" y="99">read own chart</text></g>
  <path d="M95 23 H136 M95 59 H136 M95 95 H136" stroke="#111"/>
  <text x="165" y="130" text-anchor="middle" fill="#334155">can(user, 'read chart') → look it up</text>
</svg>
```

Two more rules make it safe:

1. **Least privilege**: each role gets only what its job needs. Adding is easy later; taking away after a leak isn't.
2. **Check on every action, not just in the menu.** Hiding a button is good design, but anyone can call the function behind it from the browser's console. The check that matters is the one inside the action.

In a real app the final check runs on the **server**, where people can't change the code. The pattern is identical, which is why it's worth learning here first.

## Step: One permissions table, one can()
time: 12

`PERMISSIONS` maps each role to a `Set` of actions, and `can(user, action)` looks it up:

```js
const can = (user, action) => Boolean(user && PERMISSIONS[user.role]?.has(action));
```

`?.` keeps it safe for an unknown role, and `Boolean(...)` makes sure it always answers `true` or `false`, never `undefined`. The page shows a grid of every role against every action, built from the same table, so the rules are visible at a glance.

check: js | one table from roles to actions | /const\s+PERMISSIONS\s*=\s*\{/ | const PERMISSIONS = { receptionist: new Set([...]), ... };
check: js | one function that answers | /const\s+can\s*=\s*\(\s*user\s*,\s*action\s*\)\s*=>/ | const can = (user, action) => Boolean(user && PERMISSIONS[user.role]?.has(action));

quiz: Signing in with a password is…
- [x] Authentication: proving who you are
- [ ] Authorization: deciding what you may do
- [ ] Both at once
why: Authentication comes first; authorization uses the result.

quiz: What does `can(user, 'delete everything')` return for a role that doesn't list it?
- [ ] An error
- [x] false
- [ ] undefined
why: The Set doesn't have it, and Boolean() turns any missing answer into false.

```html page
<main class="wrap">
  <h1>Gotham clinic</h1>
  <p class="row"><label>Signed in as <select id="who"></select></label></p>
  <table id="grid" class="grid"></table>
  <section id="actions" class="actions"></section>
  <p id="result" class="result" role="status"></p>
  <h2>Audit log</h2>
  <ol id="audit" class="audit"></ol>
</main>
```

```css base
body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
.wrap { max-width: 640px; margin: 0 auto; padding: 16px; }
h1 { margin-top: 0; font-size: 1.3rem; }
h2 { font-size: 1rem; }
select, button { font: inherit; padding: 5px 10px; }
.grid { border-collapse: collapse; font-size: .8rem; margin: 10px 0; }
.grid th, .grid td { border: 1px solid #334155; padding: 4px 8px; text-align: center; }
.grid td.yes { color: #4ade80; } .grid td.no { color: #64748b; }
.actions { display: flex; flex-wrap: wrap; gap: 6px; }
.result { min-height: 1.4em; font-weight: 600; }
.result.denied { color: #f87171; }
.audit { font: .75rem ui-monospace, Menlo, Consolas, monospace; color: #94a3b8; }
.audit .denied { color: #f87171; }
```

```js data
const USERS = [
  { id: 'u1', name: 'Alfred (reception)', role: 'receptionist' },
  { id: 'u2', name: 'Dr. Thompkins', role: 'doctor' },
  { id: 'u3', name: 'Dr. Reyes', role: 'doctor' },
  { id: 'u4', name: 'Jim (patient)', role: 'patient', patientId: 'p1' },
];
const PATIENTS = [
  { id: 'p1', name: 'Jim G.', doctorId: 'u2', chart: 'Seen for a sprained wrist.' },
  { id: 'p2', name: 'Barbara G.', doctorId: 'u3', chart: 'Annual checkup, all clear.' },
];
const ACTIONS = ['book visit', 'view schedule', 'read chart', 'write note'];

const whoEl = document.getElementById('who');
whoEl.replaceChildren(...USERS.map((u) => new Option(u.name, u.id)));
const current = () => USERS.find((u) => u.id === whoEl.value);
const resultEl = document.getElementById('result');
```

```js perms
const PERMISSIONS = {
  receptionist: new Set(['book visit', 'view schedule']),
  doctor: new Set(['view schedule', 'read chart', 'write note']),
  patient: new Set(['read chart']),
};

const can = (user, action) => Boolean(user && PERMISSIONS[user.role]?.has(action));

function drawGrid() {
  const roles = Object.keys(PERMISSIONS);
  document.getElementById('grid').innerHTML = `<tr><th></th>${ACTIONS.map((a) => `<th>${a}</th>`).join('')}</tr>${roles.map((r) => `<tr><th>${r}</th>${ACTIONS.map((a) => (PERMISSIONS[r].has(a) ? '<td class="yes">✓</td>' : '<td class="no">–</td>')).join('')}</tr>`).join('')}`;
}

drawGrid();
```

## Step: Hide it, and check again anyway
time: 15

The page shows only the buttons the signed-in person may use: `ACTIONS.filter((a) => can(user, a))`. That's good design; nobody wants buttons that only say no.

But that isn't the security. Every action goes through `perform(action)`, which checks `can()` **again** before doing anything. To prove it, the page has a "pretend to be a sneaky user" button that calls `perform('read chart')` directly, the way someone could from the browser console. As the receptionist, it's refused.

```svg The menu hides what you can't use, but every call still passes through the check inside perform()
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="11">
  <rect x="5" y="10" width="110" height="30" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="60" y="29" text-anchor="middle">button (if allowed)</text>
  <rect x="5" y="56" width="110" height="30" rx="8" fill="#fecaca" stroke="#dc2626"/><text x="60" y="75" text-anchor="middle">console call</text>
  <path d="M175 48 L205 30 L235 48 L205 66 Z" fill="#fef9c3" stroke="#ca8a04"/><text x="205" y="51" text-anchor="middle">can()?</text>
  <rect x="260" y="20" width="65" height="24" rx="6" fill="#dcfce7"/><text x="292" y="36" text-anchor="middle">do it</text>
  <rect x="260" y="56" width="65" height="24" rx="6" fill="#fee2e2"/><text x="292" y="72" text-anchor="middle">refuse</text>
  <path d="M115 25 L173 45 M115 71 L173 52 M232 42 L258 32 M232 54 L258 66" stroke="#111"/>
</svg>
```

check: js | only allowed buttons are shown | /ACTIONS\.filter\(\s*\(?\s*a\s*\)?\s*=>\s*can\(/ | ACTIONS.filter((a) => can(user, a))
check: js | every action checks again | /function\s+perform\s*\([^)]*\)\s*\{[\s\S]*?if\s*\(\s*!can\(/ | function perform(action) { if (!can(current(), action)) { ... refuse ... } }

quiz: Why check `can()` inside perform() if the button is already hidden?
- [ ] In case the button is broken
- [x] Anyone can call the function from the console; hiding a button doesn't stop that
- [ ] To check twice as fast
why: The UI is for convenience; the check inside the action is the security.

quiz: Where does the final permission check belong in a real web app?
- [x] On the server, where people can't change the code
- [ ] Only in the HTML
- [ ] In localStorage
why: Anything in the browser can be changed by its user; the server is the gatekeeper.

```js guard
function perform(action) {
  const user = current();
  if (!can(user, action)) {
    resultEl.className = 'result denied';
    resultEl.textContent = `${user.name} may not ${action}.`;
    return false;
  }
  resultEl.className = 'result';
  resultEl.textContent = `${user.name}: ${action} ✓`;
  return true;
}

function drawActions() {
  const user = current();
  const box = document.getElementById('actions');
  box.replaceChildren(...ACTIONS.filter((a) => can(user, a)).map((a) => {
    const b = document.createElement('button');
    b.textContent = a;
    b.addEventListener('click', () => perform(a));
    return b;
  }));
  const sneaky = document.createElement('button');
  sneaky.textContent = 'Be sneaky: call perform("read chart")';
  sneaky.addEventListener('click', () => perform('read chart'));
  box.append(sneaky);
}

whoEl.addEventListener('change', () => { resultEl.textContent = ''; drawActions(); });
drawActions();
```

## Step: Which records, and a log of everything
time: 15

Roles answer "may a doctor read charts?". Real systems also ask "may **this** doctor read **this** chart?":

- A doctor may read the charts of **their own** patients (`patient.doctorId === user.id`).
- A patient may read **only their own** chart (`user.patientId === patient.id`).
- A receptionist may read none, whatever the screen shows.

`canOnRecord(user, action, patient)` checks the role **and** the record rule. Rules that look at the record itself are often called attribute-based or ownership rules.

Every attempt, allowed or refused, goes into an **audit log** with the time, who, what and on which record. In healthcare this is required (HIPAA in the US expects access logs), and it's how problems are found and proven later.

```svg A record check needs both: the role allows the action, and the rule for that record says yes; every attempt is logged
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 90" font-family="sans-serif" font-size="11">
  <rect x="5" y="25" width="80" height="34" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="45" y="46" text-anchor="middle">role allows?</text>
  <text x="98" y="46">and</text>
  <rect x="122" y="25" width="100" height="34" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="172" y="46" text-anchor="middle">own record?</text>
  <rect x="240" y="25" width="85" height="34" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="282" y="46" text-anchor="middle">audit log</text>
  <path d="M222 42 H236" stroke="#111" stroke-width="2"/>
</svg>
```

check: js | a rule about the record itself | /patient\.doctorId\s*===\s*user\.id/ | if (user.role === 'doctor') return patient.doctorId === user.id;
check: js | every attempt is logged | /audit\.push\(/ | audit.push({ at, who, action, record, allowed })

quiz: Dr. Reyes opens Jim's chart, but Jim is Dr. Thompkins's patient. What happens?
- [ ] It opens; doctors can read charts
- [x] It's refused: the role allows reading charts, but not this record
- [ ] It opens and is logged as a warning
why: Both the role and the record rule must say yes.

quiz: Why log refused attempts too?
- [x] Repeated refusals can show someone probing for data they shouldn't see
- [ ] To fill the log faster
- [ ] Refused attempts change the data
why: The log is evidence of what was tried, not just what succeeded.

```js records
const audit = [];

function canOnRecord(user, action, patient) {
  if (!can(user, action)) return false;
  if (user.role === 'doctor') return patient.doctorId === user.id;
  if (user.role === 'patient') return user.patientId === patient.id;
  return true;
}

function openChart(patient) {
  const user = current();
  const allowed = canOnRecord(user, 'read chart', patient);
  audit.push({ at: new Date().toLocaleTimeString(), who: user.name, action: 'read chart', record: patient.name, allowed });
  resultEl.className = allowed ? 'result' : 'result denied';
  resultEl.textContent = allowed ? `${patient.name}: ${patient.chart}` : `${user.name} may not read ${patient.name}'s chart.`;
  document.getElementById('audit').replaceChildren(...audit.slice().reverse().map((e) => Object.assign(document.createElement('li'), {
    textContent: `${e.at} · ${e.who} · ${e.action} · ${e.record} · ${e.allowed ? 'allowed' : 'REFUSED'}`,
    className: e.allowed ? '' : 'denied',
  })));
}

const chartRow = document.createElement('p');
chartRow.append('Open a chart: ', ...PATIENTS.map((p) => {
  const b = document.createElement('button');
  b.textContent = p.name;
  b.addEventListener('click', () => openChart(p));
  return b;
}));
document.getElementById('actions').after(chartRow);
```

## Finish

You can control who sees and does what. You learned:

- **Authentication** vs **authorization**
- One **PERMISSIONS** table and one **can()**, with **least privilege**
- **Hide** what can't be used, but **check again** inside every action
- **Record rules** like "only your own patients", on top of roles
- An **audit log** of every attempt, allowed or refused

You've now learned every part of the **Gotham Hospital System**: SQL, accounts, time slots and roles. One more lesson shows how it runs on a server.

### Challenges

1. Add a "nurse" role that can read charts and write notes, but only for today's patients.
2. Let an admin change the permissions table from a settings page, and log every change.
3. Save the audit log in localStorage, and add a filter to show only refused attempts.

### Next

**A small Node server**: where the real checks live.
