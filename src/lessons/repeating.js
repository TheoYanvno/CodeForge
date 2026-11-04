// Built from guides/repeating.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "repeating",
 "title": "Repeating events",
 "goals": [
  "Store a repeating task as one rule instead of hundreds of copies",
  "Write occursOn(task, day) that answers \"does it happen that day?\"",
  "Repeat daily and weekly with days-between and the % operator",
  "Repeat monthly, and decide what happens on the 31st in a short month",
  "End a repeat with an until date and skip single days with exceptions"
 ],
 "prereqs": [
  "The Dates and time zones lesson (dayKey, fromKey, addDays and days between)"
 ],
 "sessions": [
  {
   "title": "One rule, many days",
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
   "helpers": "",
   "rule": "",
   "monthly": "",
   "upcoming": ""
  }
 },
 "steps": [
  {
   "title": "A rule, not copies",
   "body": "\"Take out the trash every Tuesday\" happens 52 times a year. You could save 52 tasks, but then changing the time means changing 52 tasks, and \"forever\" can't be saved at all.\n\nInstead, save **one rule** and ask it a question for each day you draw:\n\n```js\nconst trash = { title: 'Take out the trash', start: '2026-11-03', every: 'week' };\noccursOn(trash, '2026-11-10');   // true\noccursOn(trash, '2026-11-11');   // false\n```\n\n```svg One saved rule; the calendar asks it about each visible day and draws the task only where it says yes\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 120\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"40\" width=\"95\" height=\"44\" rx=\"8\" fill=\"#ede9fe\" stroke=\"#7c3aed\"/><text x=\"52\" y=\"58\" text-anchor=\"middle\">rule</text><text x=\"52\" y=\"74\" text-anchor=\"middle\">every: week</text>\n  <g fill=\"#f8fafc\" stroke=\"#cbd5e1\"><rect x=\"130\" y=\"20\" width=\"26\" height=\"26\"/><rect x=\"158\" y=\"20\" width=\"26\" height=\"26\"/><rect x=\"186\" y=\"20\" width=\"26\" height=\"26\"/><rect x=\"214\" y=\"20\" width=\"26\" height=\"26\"/><rect x=\"242\" y=\"20\" width=\"26\" height=\"26\"/><rect x=\"270\" y=\"20\" width=\"26\" height=\"26\"/><rect x=\"298\" y=\"20\" width=\"26\" height=\"26\"/>\n  <rect x=\"130\" y=\"60\" width=\"26\" height=\"26\"/><rect x=\"158\" y=\"60\" width=\"26\" height=\"26\"/><rect x=\"186\" y=\"60\" width=\"26\" height=\"26\"/><rect x=\"214\" y=\"60\" width=\"26\" height=\"26\"/><rect x=\"242\" y=\"60\" width=\"26\" height=\"26\"/><rect x=\"270\" y=\"60\" width=\"26\" height=\"26\"/><rect x=\"298\" y=\"60\" width=\"26\" height=\"26\"/></g>\n  <rect x=\"186\" y=\"20\" width=\"26\" height=\"26\" fill=\"#c4b5fd\"/><rect x=\"186\" y=\"60\" width=\"26\" height=\"26\" fill=\"#c4b5fd\"/>\n  <path d=\"M100 62 H126\" stroke=\"#7c3aed\" stroke-width=\"2\"/>\n  <text x=\"227\" y=\"108\" text-anchor=\"middle\" fill=\"#334155\">occursOn(rule, day)? → only the Tuesdays light up</text>\n</svg>\n```\n\nThe calendar only ever draws about 42 days at a time, so asking the rule about each one is fast, and \"forever\" costs nothing. This is how Google Calendar and Outlook store repeats too (the standard is called RRULE).",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "Daily and weekly with days-between",
   "body": "`occursOn(task, key)` starts simple:\n\n1. Before the start day, never.\n2. No `every`: only on the start day itself.\n3. `every: 'day'`: every day from the start.\n4. `every: 'week'`: when the number of days since the start divides by 7, `days % 7 === 0`.\n\nDays-between comes from the Dates lesson, rounded so daylight saving can't break it. Change the **Repeats** menu and watch the month redraw.",
   "checks": [
    {
     "pane": "js",
     "label": "an occursOn() function",
     "test": "/function\\s+occursOn\\s*\\(\\s*task\\s*,\\s*key\\s*\\)/",
     "hint": "function occursOn(task, key) { ... }"
    },
    {
     "pane": "js",
     "label": "weekly with the remainder operator",
     "test": "/%\\s*7\\s*===\\s*0/",
     "hint": "return days % 7 === 0;"
    },
    {
     "pane": "js",
     "label": "nothing before the start",
     "test": "/if\\s*\\(\\s*days\\s*<\\s*0\\s*\\)\\s*return\\s+false/",
     "hint": "if (days < 0) return false;"
    }
   ],
   "quiz": [
    {
     "q": "A weekly task starts on Tuesday, November 3. Does it happen on November 24?",
     "options": [
      "Yes: 21 days later, and 21 % 7 is 0",
      "No: 24 isn't a multiple of 7",
      "Only if November has 5 Tuesdays"
     ],
     "answer": 0,
     "why": "The rule counts days from the start, not the date number. 21 divides by 7."
    },
    {
     "q": "Why does the calendar ask the rule about each day instead of saving every occurrence?",
     "options": [
      "Saving is slow",
      "One rule can repeat forever, and changing it changes every occurrence at once",
      "Calendars can only store one task"
     ],
     "answer": 1,
     "why": "A rule is small and easy to edit; copies multiply and drift apart."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"card\">\n  <h1>Repeating task</h1>\n  <form id=\"form\" class=\"row\">\n    <label>Starts <input id=\"start\" type=\"date\" value=\"2026-11-03\"></label>\n    <label>Repeats\n      <select id=\"every\">\n        <option value=\"\">Never</option>\n        <option value=\"day\">Every day</option>\n        <option value=\"week\" selected>Every week</option>\n        <option value=\"month\">Every month</option>\n      </select>\n    </label>\n    <label>Until <input id=\"until\" type=\"date\"></label>\n  </form>\n  <p id=\"caption\" class=\"muted\"></p>\n  <div id=\"month\" class=\"month\"></div>\n  <h2>Next 5</h2>\n  <ol id=\"next\" class=\"next\"></ol>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: start center;\n  padding: 20px 0;\n  font-family: system-ui, sans-serif;\n  background: #f5f3ff;\n  color: #2e1065;\n}\n\n.card { width: min(480px, 100% - 24px); padding: 16px; background: #fff; border-radius: 16px; }\nh1 { margin-top: 0; font-size: 1.3rem; }\nh2 { font-size: 1rem; }\n.row { display: flex; flex-wrap: wrap; gap: 10px; }\nlabel { display: grid; gap: 4px; font-size: .85rem; }\ninput, select, button { font: inherit; padding: 6px; }\n.muted { color: #6b7280; font-size: .9rem; }\n.month { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }\n.day { aspect-ratio: 1; padding: 3px; border-radius: 6px; background: #f8fafc; font-size: .8rem; cursor: pointer; }\n.day.on { background: #c4b5fd; font-weight: 700; }\n.day.skipped { background: #fee2e2; text-decoration: line-through; }\n.blank { background: transparent; }\n.next { padding-left: 1.2em; }"
   },
   "js": {
    "helpers": "const pad = (n) => String(n).padStart(2, '0');\nconst dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;\nconst fromKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };\nconst addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);\nconst daysBetween = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 86400000);\n\nconst monthEl = document.getElementById('month');\n\nfunction drawMonth(year, month, isOn) {\n  const cells = [];\n  for (let i = 0; i < new Date(year, month, 1).getDay(); i++) {\n    const b = document.createElement('div'); b.className = 'day blank'; cells.push(b);\n  }\n  for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++) {\n    const key = dayKey(new Date(year, month, d));\n    const cell = document.createElement('div');\n    cell.className = 'day';\n    cell.textContent = d;\n    cell.dataset.day = key;\n    const state = isOn(key);\n    if (state === 'skipped') cell.classList.add('skipped');\n    else if (state) cell.classList.add('on');\n    cells.push(cell);\n  }\n  monthEl.replaceChildren(...cells);\n}",
    "rule": "function occursOn(task, key) {\n  const days = daysBetween(task.start, key);\n  if (days < 0) return false;\n  if (!task.every) return days === 0;\n  if (task.every === 'day') return true;\n  if (task.every === 'week') return days % 7 === 0;\n  return false;\n}\n\nconst task = { title: 'Take out the trash', start: '2026-11-03', every: 'week', until: '', skip: [] };\n\nfunction redraw() {\n  task.start = document.getElementById('start').value || '2026-11-03';\n  task.every = document.getElementById('every').value;\n  task.until = document.getElementById('until').value;\n  const s = fromKey(task.start);\n  drawMonth(s.getFullYear(), s.getMonth(), (key) => occursOn(task, key));\n  document.getElementById('caption').textContent = `${s.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}: highlighted days are when \"${task.title}\" happens.`;\n}\n\ndocument.getElementById('form').addEventListener('input', redraw);\nredraw();"
   }
  },
  {
   "title": "Monthly, and the 31st problem",
   "body": "Monthly means \"the same date each month\": the 3rd, the 3rd, the 3rd. So the test is whether the day number matches the start's day number.\n\nBut what about a task on the **31st**? April, June, September and November have only 30 days, and February has 28 or 29. Apps choose different answers; this one uses the most common: **use the last day of the month** when the date doesn't exist. A bill due on the 31st shows on April 30.\n\n```svg A monthly task on the 31st: months with 31 days use the 31st; shorter months use their last day\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <g fill=\"#ede9fe\" stroke=\"#7c3aed\"><rect x=\"5\" y=\"20\" width=\"75\" height=\"34\" rx=\"6\"/><rect x=\"88\" y=\"20\" width=\"75\" height=\"34\" rx=\"6\"/><rect x=\"171\" y=\"20\" width=\"75\" height=\"34\" rx=\"6\"/><rect x=\"254\" y=\"20\" width=\"71\" height=\"34\" rx=\"6\"/></g>\n  <g text-anchor=\"middle\"><text x=\"42\" y=\"42\">Jan 31</text><text x=\"125\" y=\"42\">Feb 28</text><text x=\"208\" y=\"42\">Mar 31</text><text x=\"289\" y=\"42\">Apr 30</text></g>\n  <text x=\"165\" y=\"80\" text-anchor=\"middle\" fill=\"#334155\">wanted day = min(31, days in that month)</text>\n</svg>\n```\n\nThis step also adds **until**: a last date after which the rule stops. \"Every week until December 15\" covers a six-week class.\n\nSet **Starts** to January 31 and **Repeats** to every month, then step through the months with the date box to see it.",
   "checks": [
    {
     "pane": "js",
     "label": "the wanted day capped at the month's length",
     "test": "/Math\\.min\\(\\s*start\\.getDate\\(\\)\\s*,\\s*lastDay\\s*\\)/",
     "hint": "d.getDate() === Math.min(start.getDate(), lastDay)"
    },
    {
     "pane": "js",
     "label": "stopping after until",
     "test": "/task\\.until\\s*&&\\s*key\\s*>\\s*task\\.until/",
     "hint": "if (task.until && key > task.until) return false;"
    }
   ],
   "quiz": [
    {
     "q": "A monthly task starts on January 31. When does it happen in February 2027?",
     "options": [
      "It skips February",
      "February 28, the last day of February",
      "March 3"
     ],
     "answer": 1,
     "why": "This rule uses the last day when the wanted date doesn't exist in that month."
    },
    {
     "q": "Why can `key > task.until` compare dates as plain text?",
     "options": [
      "YYYY-MM-DD keys sort in date order as text",
      "JavaScript turns them into dates automatically",
      "It only works for dates in the same month"
     ],
     "answer": 0,
     "why": "Year, then month, then day, all padded: text order and date order match."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "monthly": "function monthlyOn(start, d) {\n  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();\n  return d.getDate() === Math.min(start.getDate(), lastDay);\n}",
    "rule": "function occursOn(task, key) {\n  const days = daysBetween(task.start, key);\n  if (days < 0) return false;\n  if (task.until && key > task.until) return false;\n  if (!task.every) return days === 0;\n  if (task.every === 'day') return true;\n  if (task.every === 'week') return days % 7 === 0;\n  if (task.every === 'month') return monthlyOn(fromKey(task.start), fromKey(key));\n  return false;\n}\n\nconst task = { title: 'Take out the trash', start: '2026-11-03', every: 'week', until: '', skip: [] };\n\nfunction redraw() {\n  task.start = document.getElementById('start').value || '2026-11-03';\n  task.every = document.getElementById('every').value;\n  task.until = document.getElementById('until').value;\n  const s = fromKey(task.start);\n  drawMonth(s.getFullYear(), s.getMonth(), (key) => occursOn(task, key));\n  document.getElementById('caption').textContent = `${s.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}: highlighted days are when \"${task.title}\" happens.`;\n}\n\ndocument.getElementById('form').addEventListener('input', redraw);\nredraw();"
   }
  },
  {
   "title": "Skipping one day, and what's next",
   "body": "Life happens: the trash pickup moves for Thanksgiving. Deleting the whole rule is wrong, so the task keeps a list of **exceptions**: days to skip. Click a highlighted day to skip it (it turns red and struck through); click again to bring it back.\n\n```js\nif (task.skip.includes(key)) return 'skipped';\n```\n\nThe **Next 5** list walks forward day by day from today with `addDays`, keeping days where `occursOn` says yes, until it has five or has looked a year ahead (so a rule that never happens again can't loop forever).\n\n```svg The next-5 list walks forward one day at a time, keeps the days the rule says yes to, and stops at five or after a year\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 80\" font-family=\"sans-serif\" font-size=\"11\">\n  <g fill=\"#f8fafc\" stroke=\"#cbd5e1\"><rect x=\"5\" y=\"20\" width=\"36\" height=\"30\"/><rect x=\"45\" y=\"20\" width=\"36\" height=\"30\"/><rect x=\"85\" y=\"20\" width=\"36\" height=\"30\"/><rect x=\"125\" y=\"20\" width=\"36\" height=\"30\"/><rect x=\"165\" y=\"20\" width=\"36\" height=\"30\"/><rect x=\"205\" y=\"20\" width=\"36\" height=\"30\"/><rect x=\"245\" y=\"20\" width=\"36\" height=\"30\"/><rect x=\"285\" y=\"20\" width=\"36\" height=\"30\"/></g>\n  <rect x=\"5\" y=\"20\" width=\"36\" height=\"30\" fill=\"#c4b5fd\"/><rect x=\"285\" y=\"20\" width=\"36\" height=\"30\" fill=\"#c4b5fd\"/>\n  <text x=\"23\" y=\"40\" text-anchor=\"middle\">✓</text><text x=\"303\" y=\"40\" text-anchor=\"middle\">✓</text>\n  <text x=\"165\" y=\"70\" text-anchor=\"middle\" fill=\"#334155\">addDays(day, 1) → occursOn? → keep · stop at 5 or 366 days</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a list of skipped days",
     "test": "/task\\.skip\\.includes\\(\\s*key\\s*\\)/",
     "hint": "if (task.skip.includes(key)) return 'skipped';"
    },
    {
     "pane": "js",
     "label": "walking forward a day at a time",
     "test": "/addDays\\(\\s*\\w+\\s*,\\s*1\\s*\\)/",
     "hint": "d = addDays(d, 1)"
    },
    {
     "pane": "js",
     "label": "a limit so the loop always ends",
     "test": "/<\\s*366/",
     "hint": "for (let i = 0; i < 366 && out.length < 5; i++)"
    }
   ],
   "quiz": [
    {
     "q": "Why does the next-5 loop stop after 366 days even with fewer than 5 found?",
     "options": [
      "A year is the most a calendar can show",
      "A rule that's ended (or never happens) would otherwise loop forever",
      "To make the list shorter"
     ],
     "answer": 1,
     "why": "Every loop needs a guaranteed end; the day limit is it."
    },
    {
     "q": "Thanksgiving's pickup is skipped. What happens to the rest of the weekly task?",
     "options": [
      "Nothing; only that one day is in the skip list",
      "The whole rule is deleted",
      "It moves every later week by a day"
     ],
     "answer": 0,
     "why": "Exceptions remove single days without touching the rule."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "rule": "function occursOn(task, key) {\n  const days = daysBetween(task.start, key);\n  if (days < 0) return false;\n  if (task.until && key > task.until) return false;\n  if (!task.every) return days === 0;\n  if (task.every === 'day') return true;\n  if (task.every === 'week') return days % 7 === 0;\n  if (task.every === 'month') return monthlyOn(fromKey(task.start), fromKey(key));\n  return false;\n}\n\nconst task = { title: 'Take out the trash', start: '2026-11-03', every: 'week', until: '', skip: [] };",
    "upcoming": "function state(key) {\n  if (!occursOn(task, key)) return false;\n  if (task.skip.includes(key)) return 'skipped';\n  return true;\n}\n\nfunction nextFive() {\n  const out = [];\n  let d = new Date();\n  for (let i = 0; i < 366 && out.length < 5; i++) {\n    if (state(dayKey(d)) === true) out.push(d);\n    d = addDays(d, 1);\n  }\n  const list = document.getElementById('next');\n  list.replaceChildren(...out.map((day) => {\n    const li = document.createElement('li');\n    li.textContent = day.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });\n    return li;\n  }));\n  if (!out.length) list.textContent = 'Nothing coming up.';\n}\n\nfunction redrawAll() {\n  task.start = document.getElementById('start').value || '2026-11-03';\n  task.every = document.getElementById('every').value;\n  task.until = document.getElementById('until').value;\n  const s = fromKey(task.start);\n  drawMonth(s.getFullYear(), s.getMonth(), state);\n  nextFive();\n}\n\nmonthEl.addEventListener('click', (e) => {\n  const key = e.target.dataset.day;\n  if (!key || !occursOn(task, key)) return;\n  task.skip = task.skip.includes(key) ? task.skip.filter((k) => k !== key) : [...task.skip, key];\n  redrawAll();\n});\n\ndocument.getElementById('form').addEventListener('input', redrawAll);\nredrawAll();"
   }
  }
 ],
 "finish": "You can store repeats the way real calendars do. You learned:\n\n- **One rule** instead of copies, asked about each visible day\n- `occursOn` with **daily**, **weekly** (`% 7`) and **monthly** repeats\n- The **31st problem** and the last-day-of-the-month answer\n- **until** dates and **skip** exceptions\n- A **next-5** list with a loop that always ends\n\n### Challenges\n\n1. Add \"every 2 weeks\" with `days % 14 === 0`, then generalize to an `interval` number.\n2. Add \"every weekday\" (Monday to Friday) using `getDay()`.\n3. Let a skipped day be moved instead: save `{ from, to }` and show the task on the new day.\n\n### Next\n\n**Drag and drop**: move a task to another day with the mouse or a finger."
};
