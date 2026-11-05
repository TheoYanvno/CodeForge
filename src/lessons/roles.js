// Built from guides/roles.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "roles",
 "title": "Roles and permissions",
 "goals": [
  "Tell authentication (who you are) from authorization (what you may do)",
  "Keep permissions in one table from roles to actions, and check them with one can() function",
  "Hide what someone can't use, and still check again on every action, because hiding isn't security",
  "Add rules about which records a person may touch, not just which actions",
  "Keep an audit log of who did what, including what was refused"
 ],
 "prereqs": [
  "The Accounts lesson (sign-in and sessions) and the App state lesson (actions)"
 ],
 "sessions": [
  {
   "title": "Who may do what",
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
   "data": "",
   "perms": "",
   "guard": "",
   "records": ""
  }
 },
 "steps": [
  {
   "title": "Authentication and authorization",
   "body": "Two words that sound alike and mean different things:\n\n- **Authentication**: *who are you?* Signing in with a name and password (the Accounts lesson) proves it.\n- **Authorization**: *what are you allowed to do?* A receptionist books visits; a doctor reads charts; a patient sees only their own record.\n\nWriting `if (user.role === 'doctor' || user.role === 'nurse' || ...)` all over an app is how mistakes creep in: one forgotten check is a data leak. Instead, one **table** lists what each role may do, and one **function** answers every question:\n\n```svg Roles map to sets of actions in one table; can(user, action) looks it up, and every action asks it first\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 140\" font-family=\"sans-serif\" font-size=\"11\">\n  <g><rect x=\"5\" y=\"10\" width=\"90\" height=\"26\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"50\" y=\"27\" text-anchor=\"middle\">receptionist</text>\n  <rect x=\"5\" y=\"46\" width=\"90\" height=\"26\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"50\" y=\"63\" text-anchor=\"middle\">doctor</text>\n  <rect x=\"5\" y=\"82\" width=\"90\" height=\"26\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"50\" y=\"99\" text-anchor=\"middle\">patient</text></g>\n  <g><rect x=\"140\" y=\"10\" width=\"185\" height=\"26\" rx=\"6\" fill=\"#fef9c3\"/><text x=\"148\" y=\"27\">book visit · view schedule</text>\n  <rect x=\"140\" y=\"46\" width=\"185\" height=\"26\" rx=\"6\" fill=\"#fef9c3\"/><text x=\"148\" y=\"63\">view schedule · read chart · write note</text>\n  <rect x=\"140\" y=\"82\" width=\"185\" height=\"26\" rx=\"6\" fill=\"#fef9c3\"/><text x=\"148\" y=\"99\">read own chart</text></g>\n  <path d=\"M95 23 H136 M95 59 H136 M95 95 H136\" stroke=\"#111\"/>\n  <text x=\"165\" y=\"130\" text-anchor=\"middle\" fill=\"#334155\">can(user, 'read chart') → look it up</text>\n</svg>\n```\n\nTwo more rules make it safe:\n\n1. **Least privilege**: each role gets only what its job needs. Adding is easy later; taking away after a leak isn't.\n2. **Check on every action, not just in the menu.** Hiding a button is good design, but anyone can call the function behind it from the browser's console. The check that matters is the one inside the action.\n\nIn a real app the final check runs on the **server**, where people can't change the code. The pattern is identical, which is why it's worth learning here first.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "One permissions table, one can()",
   "body": "`PERMISSIONS` maps each role to a `Set` of actions, and `can(user, action)` looks it up:\n\n```js\nconst can = (user, action) => Boolean(user && PERMISSIONS[user.role]?.has(action));\n```\n\n`?.` keeps it safe for an unknown role, and `Boolean(...)` makes sure it always answers `true` or `false`, never `undefined`. The page shows a grid of every role against every action, built from the same table, so the rules are visible at a glance.",
   "checks": [
    {
     "pane": "js",
     "label": "one table from roles to actions",
     "test": "/const\\s+PERMISSIONS\\s*=\\s*\\{/",
     "hint": "const PERMISSIONS = { receptionist: new Set([...]), ... };"
    },
    {
     "pane": "js",
     "label": "one function that answers",
     "test": "/const\\s+can\\s*=\\s*\\(\\s*user\\s*,\\s*action\\s*\\)\\s*=>/",
     "hint": "const can = (user, action) => Boolean(user && PERMISSIONS[user.role]?.has(action));"
    }
   ],
   "quiz": [
    {
     "q": "Signing in with a password is…",
     "options": [
      "Authentication: proving who you are",
      "Authorization: deciding what you may do",
      "Both at once"
     ],
     "answer": 0,
     "why": "Authentication comes first; authorization uses the result."
    },
    {
     "q": "What does `can(user, 'delete everything')` return for a role that doesn't list it?",
     "options": [
      "An error",
      "false",
      "undefined"
     ],
     "answer": 1,
     "why": "The Set doesn't have it, and Boolean() turns any missing answer into false."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main class=\"wrap\">\n  <h1>Gotham clinic</h1>\n  <p class=\"row\"><label>Signed in as <select id=\"who\"></select></label></p>\n  <table id=\"grid\" class=\"grid\"></table>\n  <section id=\"actions\" class=\"actions\"></section>\n  <p id=\"result\" class=\"result\" role=\"status\"></p>\n  <h2>Audit log</h2>\n  <ol id=\"audit\" class=\"audit\"></ol>\n</main>"
   },
   "css": {
    "base": "body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }\n.wrap { max-width: 640px; margin: 0 auto; padding: 16px; }\nh1 { margin-top: 0; font-size: 1.3rem; }\nh2 { font-size: 1rem; }\nselect, button { font: inherit; padding: 5px 10px; }\n.grid { border-collapse: collapse; font-size: .8rem; margin: 10px 0; }\n.grid th, .grid td { border: 1px solid #334155; padding: 4px 8px; text-align: center; }\n.grid td.yes { color: #4ade80; } .grid td.no { color: #64748b; }\n.actions { display: flex; flex-wrap: wrap; gap: 6px; }\n.result { min-height: 1.4em; font-weight: 600; }\n.result.denied { color: #f87171; }\n.audit { font: .75rem ui-monospace, Menlo, Consolas, monospace; color: #94a3b8; }\n.audit .denied { color: #f87171; }"
   },
   "js": {
    "data": "const USERS = [\n  { id: 'u1', name: 'Alfred (reception)', role: 'receptionist' },\n  { id: 'u2', name: 'Dr. Thompkins', role: 'doctor' },\n  { id: 'u3', name: 'Dr. Reyes', role: 'doctor' },\n  { id: 'u4', name: 'Jim (patient)', role: 'patient', patientId: 'p1' },\n];\nconst PATIENTS = [\n  { id: 'p1', name: 'Jim G.', doctorId: 'u2', chart: 'Seen for a sprained wrist.' },\n  { id: 'p2', name: 'Barbara G.', doctorId: 'u3', chart: 'Annual checkup, all clear.' },\n];\nconst ACTIONS = ['book visit', 'view schedule', 'read chart', 'write note'];\n\nconst whoEl = document.getElementById('who');\nwhoEl.replaceChildren(...USERS.map((u) => new Option(u.name, u.id)));\nconst current = () => USERS.find((u) => u.id === whoEl.value);\nconst resultEl = document.getElementById('result');",
    "perms": "const PERMISSIONS = {\n  receptionist: new Set(['book visit', 'view schedule']),\n  doctor: new Set(['view schedule', 'read chart', 'write note']),\n  patient: new Set(['read chart']),\n};\n\nconst can = (user, action) => Boolean(user && PERMISSIONS[user.role]?.has(action));\n\nfunction drawGrid() {\n  const roles = Object.keys(PERMISSIONS);\n  document.getElementById('grid').innerHTML = `<tr><th></th>${ACTIONS.map((a) => `<th>${a}</th>`).join('')}</tr>${roles.map((r) => `<tr><th>${r}</th>${ACTIONS.map((a) => (PERMISSIONS[r].has(a) ? '<td class=\"yes\">✓</td>' : '<td class=\"no\">–</td>')).join('')}</tr>`).join('')}`;\n}\n\ndrawGrid();"
   }
  },
  {
   "title": "Hide it, and check again anyway",
   "body": "The page shows only the buttons the signed-in person may use: `ACTIONS.filter((a) => can(user, a))`. That's good design; nobody wants buttons that only say no.\n\nBut that isn't the security. Every action goes through `perform(action)`, which checks `can()` **again** before doing anything. To prove it, the page has a \"pretend to be a sneaky user\" button that calls `perform('read chart')` directly, the way someone could from the browser console. As the receptionist, it's refused.\n\n```svg The menu hides what you can't use, but every call still passes through the check inside perform()\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"10\" width=\"110\" height=\"30\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"60\" y=\"29\" text-anchor=\"middle\">button (if allowed)</text>\n  <rect x=\"5\" y=\"56\" width=\"110\" height=\"30\" rx=\"8\" fill=\"#fecaca\" stroke=\"#dc2626\"/><text x=\"60\" y=\"75\" text-anchor=\"middle\">console call</text>\n  <path d=\"M175 48 L205 30 L235 48 L205 66 Z\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"205\" y=\"51\" text-anchor=\"middle\">can()?</text>\n  <rect x=\"260\" y=\"20\" width=\"65\" height=\"24\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"292\" y=\"36\" text-anchor=\"middle\">do it</text>\n  <rect x=\"260\" y=\"56\" width=\"65\" height=\"24\" rx=\"6\" fill=\"#fee2e2\"/><text x=\"292\" y=\"72\" text-anchor=\"middle\">refuse</text>\n  <path d=\"M115 25 L173 45 M115 71 L173 52 M232 42 L258 32 M232 54 L258 66\" stroke=\"#111\"/>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "only allowed buttons are shown",
     "test": "/ACTIONS\\.filter\\(\\s*\\(?\\s*a\\s*\\)?\\s*=>\\s*can\\(/",
     "hint": "ACTIONS.filter((a) => can(user, a))"
    },
    {
     "pane": "js",
     "label": "every action checks again",
     "test": "/function\\s+perform\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?if\\s*\\(\\s*!can\\(/",
     "hint": "function perform(action) { if (!can(current(), action)) { ... refuse ... } }"
    }
   ],
   "quiz": [
    {
     "q": "Why check `can()` inside perform() if the button is already hidden?",
     "options": [
      "In case the button is broken",
      "Anyone can call the function from the console; hiding a button doesn't stop that",
      "To check twice as fast"
     ],
     "answer": 1,
     "why": "The UI is for convenience; the check inside the action is the security."
    },
    {
     "q": "Where does the final permission check belong in a real web app?",
     "options": [
      "On the server, where people can't change the code",
      "Only in the HTML",
      "In localStorage"
     ],
     "answer": 0,
     "why": "Anything in the browser can be changed by its user; the server is the gatekeeper."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "guard": "function perform(action) {\n  const user = current();\n  if (!can(user, action)) {\n    resultEl.className = 'result denied';\n    resultEl.textContent = `${user.name} may not ${action}.`;\n    return false;\n  }\n  resultEl.className = 'result';\n  resultEl.textContent = `${user.name}: ${action} ✓`;\n  return true;\n}\n\nfunction drawActions() {\n  const user = current();\n  const box = document.getElementById('actions');\n  box.replaceChildren(...ACTIONS.filter((a) => can(user, a)).map((a) => {\n    const b = document.createElement('button');\n    b.textContent = a;\n    b.addEventListener('click', () => perform(a));\n    return b;\n  }));\n  const sneaky = document.createElement('button');\n  sneaky.textContent = 'Be sneaky: call perform(\"read chart\")';\n  sneaky.addEventListener('click', () => perform('read chart'));\n  box.append(sneaky);\n}\n\nwhoEl.addEventListener('change', () => { resultEl.textContent = ''; drawActions(); });\ndrawActions();"
   }
  },
  {
   "title": "Which records, and a log of everything",
   "body": "Roles answer \"may a doctor read charts?\". Real systems also ask \"may **this** doctor read **this** chart?\":\n\n- A doctor may read the charts of **their own** patients (`patient.doctorId === user.id`).\n- A patient may read **only their own** chart (`user.patientId === patient.id`).\n- A receptionist may read none, whatever the screen shows.\n\n`canOnRecord(user, action, patient)` checks the role **and** the record rule. Rules that look at the record itself are often called attribute-based or ownership rules.\n\nEvery attempt, allowed or refused, goes into an **audit log** with the time, who, what and on which record. In healthcare this is required (HIPAA in the US expects access logs), and it's how problems are found and proven later.\n\n```svg A record check needs both: the role allows the action, and the rule for that record says yes; every attempt is logged\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 90\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"25\" width=\"80\" height=\"34\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"45\" y=\"46\" text-anchor=\"middle\">role allows?</text>\n  <text x=\"98\" y=\"46\">and</text>\n  <rect x=\"122\" y=\"25\" width=\"100\" height=\"34\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"172\" y=\"46\" text-anchor=\"middle\">own record?</text>\n  <rect x=\"240\" y=\"25\" width=\"85\" height=\"34\" rx=\"8\" fill=\"#e2e8f0\" stroke=\"#64748b\"/><text x=\"282\" y=\"46\" text-anchor=\"middle\">audit log</text>\n  <path d=\"M222 42 H236\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a rule about the record itself",
     "test": "/patient\\.doctorId\\s*===\\s*user\\.id/",
     "hint": "if (user.role === 'doctor') return patient.doctorId === user.id;"
    },
    {
     "pane": "js",
     "label": "every attempt is logged",
     "test": "/audit\\.push\\(/",
     "hint": "audit.push({ at, who, action, record, allowed })"
    }
   ],
   "quiz": [
    {
     "q": "Dr. Reyes opens Jim's chart, but Jim is Dr. Thompkins's patient. What happens?",
     "options": [
      "It opens; doctors can read charts",
      "It's refused: the role allows reading charts, but not this record",
      "It opens and is logged as a warning"
     ],
     "answer": 1,
     "why": "Both the role and the record rule must say yes."
    },
    {
     "q": "Why log refused attempts too?",
     "options": [
      "Repeated refusals can show someone probing for data they shouldn't see",
      "To fill the log faster",
      "Refused attempts change the data"
     ],
     "answer": 0,
     "why": "The log is evidence of what was tried, not just what succeeded."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "records": "const audit = [];\n\nfunction canOnRecord(user, action, patient) {\n  if (!can(user, action)) return false;\n  if (user.role === 'doctor') return patient.doctorId === user.id;\n  if (user.role === 'patient') return user.patientId === patient.id;\n  return true;\n}\n\nfunction openChart(patient) {\n  const user = current();\n  const allowed = canOnRecord(user, 'read chart', patient);\n  audit.push({ at: new Date().toLocaleTimeString(), who: user.name, action: 'read chart', record: patient.name, allowed });\n  resultEl.className = allowed ? 'result' : 'result denied';\n  resultEl.textContent = allowed ? `${patient.name}: ${patient.chart}` : `${user.name} may not read ${patient.name}'s chart.`;\n  document.getElementById('audit').replaceChildren(...audit.slice().reverse().map((e) => Object.assign(document.createElement('li'), {\n    textContent: `${e.at} · ${e.who} · ${e.action} · ${e.record} · ${e.allowed ? 'allowed' : 'REFUSED'}`,\n    className: e.allowed ? '' : 'denied',\n  })));\n}\n\nconst chartRow = document.createElement('p');\nchartRow.append('Open a chart: ', ...PATIENTS.map((p) => {\n  const b = document.createElement('button');\n  b.textContent = p.name;\n  b.addEventListener('click', () => openChart(p));\n  return b;\n}));\ndocument.getElementById('actions').after(chartRow);"
   }
  }
 ],
 "finish": "You can control who sees and does what. You learned:\n\n- **Authentication** vs **authorization**\n- One **PERMISSIONS** table and one **can()**, with **least privilege**\n- **Hide** what can't be used, but **check again** inside every action\n- **Record rules** like \"only your own patients\", on top of roles\n- An **audit log** of every attempt, allowed or refused\n\nYou've now learned every part of the **Gotham Hospital System**: SQL, accounts, time slots and roles. One more lesson shows how it runs on a server.\n\n### Challenges\n\n1. Add a \"nurse\" role that can read charts and write notes, but only for today's patients.\n2. Let an admin change the permissions table from a settings page, and log every change.\n3. Save the audit log in localStorage, and add a filter to show only refused attempts.\n\n### Next\n\n**A small Node server**: where the real checks live."
};
