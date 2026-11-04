// Built from guides/dates.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "dates",
 "title": "Dates and time zones in JavaScript",
 "goals": [
  "Explain what a Date really stores (a moment, in milliseconds) and why months count from 0",
  "Make local calendar days with new Date(year, month, day) and write them as YYYY-MM-DD",
  "Explain why new Date('2026-11-03') can show the wrong day, and avoid it",
  "Add days without breaking at month ends or daylight saving changes",
  "Show dates in a friendly, local format with toLocaleDateString"
 ],
 "prereqs": [
  "The JavaScript basics lesson (variables, functions, events)"
 ],
 "sessions": [
  {
   "title": "Dates you can trust",
   "from": 0,
   "to": 2
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
   "today": "",
   "math": ""
  }
 },
 "steps": [
  {
   "title": "What a Date really is",
   "body": "A JavaScript `Date` isn't a calendar day. It's **one exact moment**, stored as the number of milliseconds since midnight on January 1, 1970, in UTC (the world's reference time).\n\n```js\nconst now = new Date();\nnow.getTime();      // 1793721600000 or so: milliseconds since 1970\n```\n\nThe same moment is a different *day* in different places. At 9 PM on November 3 in Orlando, it's already November 4 in London. A calendar app cares about days, so it has to be clear about which time zone a day belongs to.\n\n```svg One moment, two calendar days: 9 PM Nov 3 in Orlando (UTC−5) is 2 AM Nov 4 in UTC\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <path d=\"M15 70 H315\" stroke=\"#94a3b8\" stroke-width=\"2\"/>\n  <circle cx=\"200\" cy=\"70\" r=\"7\" fill=\"#6366f1\"/><text x=\"200\" y=\"100\" text-anchor=\"middle\">one moment</text>\n  <rect x=\"20\" y=\"18\" width=\"200\" height=\"30\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"120\" y=\"38\" text-anchor=\"middle\">Orlando: Tue Nov 3, 9:00 PM</text>\n  <rect x=\"150\" y=\"110\" width=\"170\" height=\"18\" rx=\"4\" fill=\"#fef9c3\"/><text x=\"235\" y=\"123\" text-anchor=\"middle\" font-size=\"11\">UTC: Wed Nov 4, 2:00 AM</text>\n  <path d=\"M200 48 V62\" stroke=\"#2563eb\" stroke-width=\"2\"/>\n</svg>\n```\n\n### Three traps\n\n1. **Months start at 0.** January is `0`, December is `11`. Days start at 1 as you'd expect.\n2. **Text in the format `'2026-11-03'` is read as UTC midnight.** In Orlando that's 7 PM on *November 2*, so `getDate()` says 2. Making local days from numbers avoids it.\n3. **Not every day has 24 hours.** On a daylight saving change, a local day has 23 or 25, so \"add 86,400,000 milliseconds\" can land on the wrong day.\n\nThis lesson builds small, trustworthy helpers for each one. They're the same helpers the Task Calendar project uses.",
   "session": 0,
   "minutes": 12,
   "kind": "read"
  },
  {
   "title": "Local days, written as YYYY-MM-DD",
   "body": "Two helpers turn dates into a simple text key and back:\n\n```js\nconst dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;   // \"2026-11-03\"\nconst fromKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };\n```\n\n```svg dayKey reads the local year, month + 1 and day; fromKey splits the key and builds local midnight with month − 1\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"35\" width=\"105\" height=\"40\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"57\" y=\"52\" text-anchor=\"middle\">Date</text><text x=\"57\" y=\"67\" text-anchor=\"middle\" font-size=\"10\">month 10 = Nov</text>\n  <rect x=\"220\" y=\"35\" width=\"105\" height=\"40\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"272\" y=\"60\" text-anchor=\"middle\">\"2026-11-03\"</text>\n  <path d=\"M110 47 H216\" stroke=\"#111\" stroke-width=\"2\"/><text x=\"163\" y=\"40\" text-anchor=\"middle\">dayKey (month + 1)</text>\n  <path d=\"M216 65 H110\" stroke=\"#6b7280\" stroke-width=\"2\"/><text x=\"163\" y=\"88\" text-anchor=\"middle\">fromKey (month − 1)</text>\n</svg>\n```\n\n- `dayKey` reads the **local** year, month and day, adding 1 to the month (because of trap 1) and padding to two digits.\n- `fromKey` builds the date with `new Date(year, month - 1, day)`, which always means **local midnight**, so trap 2 can't happen.\n\n`YYYY-MM-DD` keys are perfect for storing tasks: they're readable, they sort in date order as plain text, and they mean the same day for everyone using that calendar.\n\nThe page compares the trap with the safe way, so you can see the difference in your own time zone.",
   "checks": [
    {
     "pane": "js",
     "label": "a day key from the local date",
     "test": "/getMonth\\(\\)\\s*\\+\\s*1/",
     "hint": "`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`"
    },
    {
     "pane": "js",
     "label": "building local days from numbers",
     "test": "/new\\s+Date\\(\\s*y\\s*,\\s*m\\s*-\\s*1\\s*,\\s*d\\s*\\)/",
     "hint": "new Date(y, m - 1, d)"
    }
   ],
   "quiz": [
    {
     "q": "What does `new Date(2026, 11, 25)` mean?",
     "options": [
      "November 25, 2026",
      "December 25, 2026, at local midnight",
      "An invalid date"
     ],
     "answer": 1,
     "why": "Months count from 0, so 11 is December, and number arguments mean local time."
    },
    {
     "q": "In Orlando, what does `new Date('2026-11-03').getDate()` give?",
     "options": [
      "3",
      "2, because the text is read as UTC midnight, which is the evening before in Orlando",
      "An error"
     ],
     "answer": 1,
     "why": "Date-only text is UTC. Build local days from numbers instead."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"card\">\n  <h1>Dates</h1>\n  <p id=\"zone\" class=\"muted\"></p>\n  <p>Today is <strong id=\"today\"></strong> <span id=\"todayKey\" class=\"mono\"></span></p>\n  <table class=\"compare\">\n    <tr><th>new Date('2026-11-03')</th><td id=\"trap\" class=\"mono\"></td></tr>\n    <tr><th>fromKey('2026-11-03')</th><td id=\"safe\" class=\"mono\"></td></tr>\n  </table>\n  <section id=\"mathBox\"></section>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #eff6ff;\n  color: #172554;\n}\n\n.card {\n  width: min(460px, 100% - 32px);\n  padding: 20px;\n  background: #fff;\n  border-radius: 16px;\n}\n\nh1 { margin-top: 0; }\n.muted { color: #64748b; }\n.mono { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .85rem; }\n.compare { width: 100%; border-collapse: collapse; margin: 12px 0; }\n.compare th, .compare td { text-align: left; padding: 6px; border-bottom: 1px solid #dbeafe; font-size: .85rem; }\n.row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin: 8px 0; }\ninput, button { font: inherit; padding: 6px 10px; }\n.short { width: 5em; }"
   },
   "js": {
    "helpers": "const pad = (n) => String(n).padStart(2, '0');\nconst dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;\nconst fromKey = (key) => {\n  const [y, m, d] = key.split('-').map(Number);\n  return new Date(y, m - 1, d);\n};",
    "today": "const today = new Date();\ndocument.getElementById('zone').textContent = `Your time zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;\ndocument.getElementById('today').textContent = today.toDateString();\ndocument.getElementById('todayKey').textContent = `(${dayKey(today)})`;\ndocument.getElementById('trap').textContent = `day ${new Date('2026-11-03').getDate()} · ${new Date('2026-11-03').toString().slice(0, 24)}`;\ndocument.getElementById('safe').textContent = `day ${fromKey('2026-11-03').getDate()} · ${fromKey('2026-11-03').toString().slice(0, 24)}`;"
   }
  },
  {
   "title": "Adding days, and showing dates nicely",
   "body": "To get \"3 days from now\", change the **day number** and let `Date` sort out the month:\n\n```js\nfunction addDays(date, n) {\n  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);\n}\naddDays(new Date(2026, 0, 30), 3);   // February 2: Date rolls over the month for you\n```\n\nBecause it works in whole calendar days, it's right on daylight saving days too (trap 3). Adding `n * 86400000` milliseconds isn't: on the day clocks go back, it lands at 11 PM the day before.\n\n```svg addDays works in calendar days, so the 31st plus one becomes the 1st of the next month, and a 25-hour day still counts as one day\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <g fill=\"#dbeafe\" stroke=\"#2563eb\"><rect x=\"10\" y=\"20\" width=\"60\" height=\"34\" rx=\"6\"/><rect x=\"80\" y=\"20\" width=\"60\" height=\"34\" rx=\"6\"/><rect x=\"150\" y=\"20\" width=\"60\" height=\"34\" rx=\"6\"/><rect x=\"220\" y=\"20\" width=\"60\" height=\"34\" rx=\"6\"/></g>\n  <g text-anchor=\"middle\"><text x=\"40\" y=\"42\">Jan 30</text><text x=\"110\" y=\"42\">Jan 31</text><text x=\"180\" y=\"42\">Feb 1</text><text x=\"250\" y=\"42\">Feb 2</text></g>\n  <path d=\"M40 60 Q145 90 250 60\" fill=\"none\" stroke=\"#16a34a\" stroke-width=\"2\"/><text x=\"145\" y=\"92\" text-anchor=\"middle\" fill=\"#15803d\">addDays(Jan 30, 3)</text>\n</svg>\n```\n\nFor people, show dates with `toLocaleDateString`. It uses the visitor's own language and order (Nov 3 in the US, 3 Nov in the UK) without you writing any of it:\n\n```js\ndate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });   // \"Tue, Nov 3\"\n```\n\n**Days between** two days: subtract them, divide by a day's milliseconds, and **round** (a daylight saving day makes the raw number 0.96 or 1.04, and rounding fixes it).",
   "checks": [
    {
     "pane": "js",
     "label": "adding days by the day number",
     "test": "/getDate\\(\\)\\s*\\+\\s*n/",
     "hint": "new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)"
    },
    {
     "pane": "js",
     "label": "a friendly local format",
     "test": "/toLocaleDateString\\(/",
     "hint": "date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })"
    },
    {
     "pane": "js",
     "label": "rounding days between",
     "test": "/Math\\.round\\(\\(\\w+\\s*-\\s*\\w+\\)\\s*\\/\\s*86400000\\)/",
     "hint": "Math.round((b - a) / 86400000)"
    }
   ],
   "quiz": [
    {
     "q": "What does `addDays(new Date(2026, 11, 31), 1)` give?",
     "options": [
      "December 32, an invalid date",
      "January 1, 2027",
      "An error"
     ],
     "answer": 1,
     "why": "Date rolls an out-of-range day into the next month (and year)."
    },
    {
     "q": "Why does \"days between\" round the result?",
     "options": [
      "To make the number shorter",
      "A daylight saving day has 23 or 25 hours, so the raw answer can be 0.96 or 1.04 days",
      "Dates can't be subtracted exactly"
     ],
     "answer": 1,
     "why": "Rounding turns the small daylight saving error back into whole days."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "math": "function addDays(date, n) {\n  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);\n}\n\nconst daysBetween = (a, b) => Math.round((b - a) / 86400000);\nconst nice = (d) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });\n\nconst box = document.getElementById('mathBox');\nbox.innerHTML = `\n  <div class=\"row\"><label>Start <input id=\"start\" type=\"date\"></label>\n  <label>+ days <input id=\"n\" class=\"short\" type=\"number\" value=\"30\"></label></div>\n  <p>Lands on <strong id=\"out\"></strong></p>\n  <p>Days from today to New Year's Day: <strong id=\"ny\"></strong></p>`;\n\nconst start = document.getElementById('start');\nstart.value = dayKey(today);\n\nfunction update() {\n  const s = fromKey(start.value || dayKey(today));\n  const end = addDays(s, Number(document.getElementById('n').value) || 0);\n  document.getElementById('out').textContent = `${nice(end)} (${dayKey(end)})`;\n}\n\nstart.addEventListener('input', update);\ndocument.getElementById('n').addEventListener('input', update);\nupdate();\ndocument.getElementById('ny').textContent = daysBetween(fromKey(dayKey(today)), new Date(today.getFullYear() + 1, 0, 1));"
   }
  }
 ],
 "finish": "Dates won't surprise you now. You learned:\n\n- A **Date is a moment** in milliseconds; a calendar day depends on the time zone\n- **Months count from 0**, and `new Date(y, m, d)` means local midnight\n- **YYYY-MM-DD keys** with `dayKey` and `fromKey`, and why `new Date('2026-11-03')` is a trap\n- **addDays** by the day number, safe across months and daylight saving\n- **toLocaleDateString** for friendly dates, and rounding **days between**\n\n### Challenges\n\n1. Write `startOfWeek(date)` that returns the Sunday on or before a date (use `getDay()`).\n2. Show \"today\", \"tomorrow\" and \"in 3 days\" labels with `Intl.RelativeTimeFormat`.\n3. Find this year's daylight saving day in your time zone: the day where `daysBetween` without rounding isn't a whole number.\n\n### Next\n\n**A month grid with CSS Grid**: put a whole month on the screen."
};
