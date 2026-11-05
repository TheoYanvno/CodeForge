// Built from guides/timeslots.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "timeslots",
 "title": "Time slots and overlap checks",
 "goals": [
  "Store times of day as minutes since midnight so they're easy to compare and add",
  "Build a day of quarter-hour slots between opening and closing",
  "Test whether two time ranges overlap with one short rule",
  "Refuse a booking that would double-book a provider",
  "List the free start times for a visit of any length, around breaks and other bookings"
 ],
 "prereqs": [
  "The Dates and time zones lesson and the Filtering lists lesson"
 ],
 "sessions": [
  {
   "title": "No double booking",
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
   "time": "",
   "overlap": "",
   "free": ""
  }
 },
 "steps": [
  {
   "title": "Minutes, ranges and the overlap rule",
   "body": "Clinic schedules are full of comparisons: does 9:45 come before 10:00? Does a 30-minute visit at 9:45 run into the 10:00 one? Text like `\"09:45\"` is awkward for that, so times become **minutes since midnight**: 9:45 is 9 × 60 + 45 = **585**. Now \"later\" is just \"bigger\", and adding 30 minutes is `+ 30`.\n\nA booking is a **range** with a start and an end. Ranges are **half-open**: a 9:00–9:30 visit covers 9:00 up to (but not including) 9:30, so a 9:30 visit right after it doesn't clash.\n\nThe whole overlap check is one line. Two ranges overlap when **each starts before the other ends**:\n\n```js\nconst overlaps = (a, b) => a.start < b.end && b.start < a.end;\n```\n\n```svg Two ranges overlap only when each starts before the other ends; ranges that only touch don't overlap\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 140\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"20\" y=\"15\" width=\"120\" height=\"18\" rx=\"4\" fill=\"#bfdbfe\"/><rect x=\"100\" y=\"37\" width=\"120\" height=\"18\" rx=\"4\" fill=\"#fecaca\"/><text x=\"235\" y=\"40\" fill=\"#b91c1c\">overlap</text>\n  <rect x=\"20\" y=\"70\" width=\"120\" height=\"18\" rx=\"4\" fill=\"#bfdbfe\"/><rect x=\"140\" y=\"92\" width=\"100\" height=\"18\" rx=\"4\" fill=\"#bbf7d0\"/><text x=\"250\" y=\"95\" fill=\"#15803d\">touching: fine</text>\n  <path d=\"M140 66 V114\" stroke=\"#475569\" stroke-dasharray=\"3 3\"/><text x=\"105\" y=\"128\">9:30 = end of one, start of the other</text>\n</svg>\n```\n\nThat rule covers every case: one inside the other, sticking out on the left or the right, or exactly the same. It's worth memorizing; it comes up in calendars, room bookings, shift schedules and video editors.",
   "session": 0,
   "minutes": 12,
   "kind": "read"
  },
  {
   "title": "Minutes, and a day of quarter hours",
   "body": "Two helpers convert both ways:\n\n```js\nconst toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };\nconst toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;\n```\n\n```svg The day as a number line of minutes: 8:00 is 480, 9:45 is 585, 17:00 is 1020\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 70\" font-family=\"sans-serif\" font-size=\"11\">\n  <path d=\"M15 35 H315\" stroke=\"#0f766e\" stroke-width=\"2\"/>\n  <g fill=\"#0f766e\"><circle cx=\"15\" cy=\"35\" r=\"4\"/><circle cx=\"65\" cy=\"35\" r=\"4\"/><circle cx=\"315\" cy=\"35\" r=\"4\"/></g>\n  <text x=\"15\" y=\"22\" text-anchor=\"middle\">8:00</text><text x=\"65\" y=\"22\" text-anchor=\"middle\">9:45</text><text x=\"315\" y=\"22\" text-anchor=\"end\">17:00</text>\n  <text x=\"15\" y=\"55\" text-anchor=\"middle\">480</text><text x=\"65\" y=\"55\" text-anchor=\"middle\">585</text><text x=\"315\" y=\"55\" text-anchor=\"end\">1020</text>\n</svg>\n```\n\nThe clinic opens at 8:00 and closes at 17:00, so the day's start times are every 15 minutes from 480 to 1020 (a visit can't *start* at closing). A simple `for` loop with `+= 15` makes them. The page draws them as a column with the existing bookings shaded.",
   "checks": [
    {
     "pane": "js",
     "label": "text time to minutes",
     "test": "/h\\s*\\*\\s*60\\s*\\+\\s*m/",
     "hint": "return h * 60 + m;"
    },
    {
     "pane": "js",
     "label": "minutes back to text",
     "test": "/Math\\.floor\\(\\s*\\w+\\s*\\/\\s*60\\s*\\)/",
     "hint": "String(Math.floor(min / 60)).padStart(2, '0')"
    },
    {
     "pane": "js",
     "label": "quarter-hour steps",
     "test": "/\\+=\\s*15/",
     "hint": "for (let t = OPEN; t < CLOSE; t += 15)"
    }
   ],
   "quiz": [
    {
     "q": "What is 14:30 in minutes since midnight?",
     "options": [
      "1430",
      "870",
      "830"
     ],
     "answer": 1,
     "why": "14 × 60 = 840, plus 30 = 870."
    },
    {
     "q": "Why store times as minutes instead of text like \"14:30\"?",
     "options": [
      "Numbers compare and add directly: later is bigger, and +30 is 30 minutes later",
      "Text can't be saved",
      "Minutes take less memory"
     ],
     "answer": 0,
     "why": "\"9:45\" < \"10:00\" is false as text but 585 < 600 is true as numbers."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main class=\"wrap\">\n  <h1>Dr. Reyes, Tuesday</h1>\n  <form id=\"book\" class=\"row\">\n    <label>Start <input id=\"start\" type=\"time\" value=\"09:45\" step=\"900\"></label>\n    <label>Minutes <select id=\"len\"><option>15</option><option selected>30</option><option>45</option><option>60</option></select></label>\n    <button>Book</button>\n  </form>\n  <p id=\"status\" class=\"status\" role=\"status\"></p>\n  <div class=\"cols\">\n    <ol id=\"day\" class=\"day\"></ol>\n    <section><h2>Free start times</h2><div id=\"free\" class=\"free\"></div></section>\n  </div>\n</main>"
   },
   "css": {
    "base": "body { margin: 0; font-family: system-ui, sans-serif; background: #f0fdfa; color: #134e4a; }\n.wrap { max-width: 620px; margin: 0 auto; padding: 16px; }\nh1 { margin-top: 0; font-size: 1.3rem; }\nh2 { font-size: .95rem; margin: 0 0 6px; }\n.row { display: flex; gap: 10px; align-items: end; flex-wrap: wrap; }\nlabel { display: grid; gap: 2px; font-size: .85rem; }\ninput, select, button { font: inherit; padding: 6px 8px; }\n.status { min-height: 1.4em; font-weight: 600; }\n.status.bad { color: #b91c1c; }\n.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }\n.day { list-style: none; padding: 0; margin: 0; font: .8rem ui-monospace, Menlo, Consolas, monospace; }\n.day li { padding: 2px 6px; border-bottom: 1px solid #ccfbf1; }\n.day li.busy { background: #fecaca; }\n.day li.lunch { background: #e5e7eb; }\n.free { display: flex; flex-wrap: wrap; gap: 4px; }\n.free button { font-size: .8rem; padding: 3px 6px; }"
   },
   "js": {
    "time": "const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };\nconst toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;\n\nconst OPEN = toMin('08:00');\nconst CLOSE = toMin('17:00');\nconst LUNCH = { start: toMin('12:00'), end: toMin('13:00'), who: 'Lunch' };\nlet bookings = [\n  { start: toMin('09:00'), end: toMin('09:30'), who: 'J. Gordon' },\n  { start: toMin('10:00'), end: toMin('11:00'), who: 'B. Gordon' },\n  { start: toMin('14:15'), end: toMin('14:45'), who: 'L. Fox' },\n];\n\nconst statusEl = document.getElementById('status');\n\nfunction drawDay() {\n  const items = [];\n  for (let t = OPEN; t < CLOSE; t += 15) {\n    const busy = bookings.find((b) => t >= b.start && t < b.end);\n    const lunch = t >= LUNCH.start && t < LUNCH.end;\n    const li = document.createElement('li');\n    li.textContent = `${toHHMM(t)} ${busy ? busy.who : lunch ? 'Lunch' : ''}`;\n    li.className = busy ? 'busy' : lunch ? 'lunch' : '';\n    items.push(li);\n  }\n  document.getElementById('day').replaceChildren(...items);\n}\n\ndrawDay();"
   }
  },
  {
   "title": "Refusing a double booking",
   "body": "Booking a visit builds its range, `{ start, end: start + minutes }`, and checks it against **every** existing booking and the lunch break with the overlap rule:\n\n```js\nconst clash = [...bookings, LUNCH].find((b) => overlaps(visit, b));\n```\n\nIt also refuses visits that start before opening or **end** after closing. If anything fails, the page says exactly why (\"overlaps B. Gordon 10:00–11:00\"), which is far more useful than \"Invalid time\".\n\nTry 9:45 for 30 minutes (it runs into 10:00), then 9:30 for 30 minutes (it fits exactly between two visits).",
   "checks": [
    {
     "pane": "js",
     "label": "the overlap rule",
     "test": "/a\\.start\\s*<\\s*b\\.end\\s*&&\\s*b\\.start\\s*<\\s*a\\.end/",
     "hint": "const overlaps = (a, b) => a.start < b.end && b.start < a.end;"
    },
    {
     "pane": "js",
     "label": "checking every booking and the break",
     "test": "/\\[\\s*\\.\\.\\.bookings\\s*,\\s*LUNCH\\s*\\]\\.find\\(/",
     "hint": "[...bookings, LUNCH].find((b) => overlaps(visit, b))"
    },
    {
     "pane": "js",
     "label": "staying inside opening hours",
     "test": "/visit\\.end\\s*>\\s*CLOSE/",
     "hint": "if (visit.start < OPEN || visit.end > CLOSE) ..."
    }
   ],
   "quiz": [
    {
     "q": "A visit 9:30–10:00 and one 10:00–10:30. Do they overlap?",
     "options": [
      "Yes, they share 10:00",
      "No: the first ends at 10:00 and the second starts at 10:00, and ranges don't include their end",
      "Only if they're with the same patient"
     ],
     "answer": 1,
     "why": "600 < 600 is false, so the rule says no overlap."
    },
    {
     "q": "Why say which booking it clashes with?",
     "options": [
      "The person can see the problem and pick a better time straight away",
      "It's required by law",
      "The overlap rule needs it"
     ],
     "answer": 0,
     "why": "A specific reason turns a dead end into a quick fix."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "overlap": "const overlaps = (a, b) => a.start < b.end && b.start < a.end;\n\ndocument.getElementById('book').addEventListener('submit', (e) => {\n  e.preventDefault();\n  const start = toMin(document.getElementById('start').value);\n  const visit = { start, end: start + Number(document.getElementById('len').value), who: 'New patient' };\n  statusEl.className = 'status bad';\n  if (visit.start < OPEN || visit.end > CLOSE) { statusEl.textContent = `Outside opening hours (${toHHMM(OPEN)}–${toHHMM(CLOSE)}).`; return; }\n  const clash = [...bookings, LUNCH].find((b) => overlaps(visit, b));\n  if (clash) { statusEl.textContent = `Overlaps ${clash.who} ${toHHMM(clash.start)}–${toHHMM(clash.end)}.`; return; }\n  bookings = [...bookings, visit].sort((a, b) => a.start - b.start);\n  statusEl.className = 'status';\n  statusEl.textContent = `Booked ${toHHMM(visit.start)}–${toHHMM(visit.end)}.`;\n  drawDay();\n  if (typeof drawFree === 'function') drawFree();\n});"
   }
  },
  {
   "title": "Every free start time",
   "body": "Instead of making people guess, show every start time that works for the chosen length. `freeStarts(minutes)` walks the quarter hours and keeps a start `t` when the range `t … t + minutes` stays before closing **and** overlaps nothing:\n\n```js\nfor (let t = OPEN; t + minutes <= CLOSE; t += 15) {\n  const visit = { start: t, end: t + minutes };\n  if ([...bookings, LUNCH].every((b) => !overlaps(visit, b))) out.push(t);\n}\n```\n\nA 60-minute visit has far fewer options than a 15-minute one, and the list updates when you change the length or book something. Clicking a time fills in the form.\n\nThis is exactly the \"open times\" list in the Gotham Hospital System, which does the same check against the provider's schedule in SQL before saving.\n\n```svg Free starts for a 30-minute visit: each quarter hour is tried, and kept only if the whole visit fits before closing and overlaps nothing\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 70\" font-family=\"sans-serif\" font-size=\"10\">\n  <g><rect x=\"5\" y=\"20\" width=\"30\" height=\"20\" fill=\"#bbf7d0\"/><rect x=\"37\" y=\"20\" width=\"30\" height=\"20\" fill=\"#bbf7d0\"/><rect x=\"69\" y=\"20\" width=\"30\" height=\"20\" fill=\"#fecaca\"/><rect x=\"101\" y=\"20\" width=\"30\" height=\"20\" fill=\"#fecaca\"/><rect x=\"133\" y=\"20\" width=\"30\" height=\"20\" fill=\"#bbf7d0\"/><rect x=\"165\" y=\"20\" width=\"30\" height=\"20\" fill=\"#fde68a\"/><rect x=\"197\" y=\"20\" width=\"30\" height=\"20\" fill=\"#fecaca\"/></g>\n  <g text-anchor=\"middle\"><text x=\"20\" y=\"34\">8:00</text><text x=\"52\" y=\"34\">8:15</text><text x=\"84\" y=\"34\">9:00</text><text x=\"116\" y=\"34\">9:15</text><text x=\"148\" y=\"34\">9:30</text><text x=\"180\" y=\"34\">9:45</text><text x=\"212\" y=\"34\">10:00</text></g>\n  <text x=\"5\" y=\"58\" fill=\"#475569\">green: fits · red: booked · yellow: starts free but runs into 10:00</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a freeStarts() function",
     "test": "/function\\s+freeStarts\\s*\\(\\s*minutes\\s*\\)/",
     "hint": "function freeStarts(minutes) { ... }"
    },
    {
     "pane": "js",
     "label": "the whole visit must fit before closing",
     "test": "/t\\s*\\+\\s*minutes\\s*<=\\s*CLOSE/",
     "hint": "for (let t = OPEN; t + minutes <= CLOSE; t += 15)"
    },
    {
     "pane": "js",
     "label": "free only if it overlaps nothing",
     "test": "/\\.every\\(\\s*\\(?\\s*b\\s*\\)?\\s*=>\\s*!overlaps\\(/",
     "hint": "[...bookings, LUNCH].every((b) => !overlaps(visit, b))"
    }
   ],
   "quiz": [
    {
     "q": "Why does 9:45 not appear as a free start for a 30-minute visit?",
     "options": [
      "9:45 is already booked",
      "9:45–10:15 runs into the 10:00 booking",
      "Visits can't start at a quarter to the hour"
     ],
     "answer": 1,
     "why": "The start is free, but the visit's range overlaps the next booking."
    },
    {
     "q": "Why is the loop condition `t + minutes <= CLOSE` and not `t < CLOSE`?",
     "options": [
      "The visit has to end by closing time, not just start before it",
      "To make the loop shorter",
      "Because CLOSE is in hours"
     ],
     "answer": 0,
     "why": "A 60-minute visit starting at 16:30 would run past 17:00."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "free": "function freeStarts(minutes) {\n  const out = [];\n  for (let t = OPEN; t + minutes <= CLOSE; t += 15) {\n    const visit = { start: t, end: t + minutes };\n    if ([...bookings, LUNCH].every((b) => !overlaps(visit, b))) out.push(t);\n  }\n  return out;\n}\n\nfunction drawFree() {\n  const minutes = Number(document.getElementById('len').value);\n  const list = freeStarts(minutes);\n  document.getElementById('free').replaceChildren(...list.map((t) => {\n    const b = document.createElement('button');\n    b.textContent = toHHMM(t);\n    b.addEventListener('click', () => { document.getElementById('start').value = toHHMM(t); });\n    return b;\n  }));\n  if (!list.length) document.getElementById('free').textContent = 'No time left today for a visit this long.';\n}\n\ndocument.getElementById('len').addEventListener('change', drawFree);\ndrawFree();"
   }
  }
 ],
 "finish": "You can book time without double booking. You learned:\n\n- **Minutes since midnight** and converting both ways\n- **Half-open ranges**, where touching isn't overlapping\n- The **overlap rule**: `a.start < b.end && b.start < a.end`\n- Refusing bookings with a **clear reason**, inside opening hours\n- **Free start times** for any visit length\n\n### Challenges\n\n1. Add a 10-minute cleanup gap after every visit (pad each booking's end before checking).\n2. Support two providers, and show a start time as free if either one is free.\n3. Store bookings in SQL and do the overlap check in a query (`WHERE start < ? AND ? < end`).\n\n### Next\n\n**Roles and permissions**: who is allowed to see and do what."
};
