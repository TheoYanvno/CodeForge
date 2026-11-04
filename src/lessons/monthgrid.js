// Built from guides/monthgrid.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "monthgrid",
 "title": "A month grid with CSS Grid",
 "goals": [
  "Lay out seven equal columns with CSS Grid and repeat()",
  "Work out how many days a month has with the day-0 trick",
  "Start the month on the right weekday with getDay() and blank cells",
  "Mark today and give every cell a label screen readers can read",
  "Move to the previous and next month without breaking at the year's end"
 ],
 "prereqs": [
  "The Dates and time zones lesson (local days, dayKey and addDays) and the HTML & CSS basics lesson"
 ],
 "sessions": [
  {
   "title": "A month on the screen",
   "from": 0,
   "to": 3
  }
 ],
 "start": {
  "html": {
   "page": ""
  },
  "css": {
   "base": "",
   "grid": ""
  },
  "js": {
   "helpers": "",
   "build": "",
   "nav": ""
  }
 },
 "steps": [
  {
   "title": "How a month grid works",
   "body": "A wall calendar is a grid: seven columns (Sunday to Saturday) and as many rows as the month needs. Two numbers decide the whole layout:\n\n1. **Which weekday the 1st falls on.** `new Date(2026, 10, 1).getDay()` gives 0 for Sunday up to 6 for Saturday. November 1, 2026 is a Sunday, so it starts in the first column. If the 1st were a Wednesday (3), three blank cells would come first.\n2. **How many days the month has.** Day 0 of the *next* month is the last day of this one, so `new Date(2026, 11, 0).getDate()` is 30: November has 30 days. Leap years are handled for free.\n\n```svg November 2026: the 1st is a Sunday, so there are no blanks; 30 days fill five rows\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 190\" font-family=\"sans-serif\" font-size=\"11\">\n  <g text-anchor=\"middle\" fill=\"#334155\"><text x=\"27\" y=\"14\">Sun</text><text x=\"73\" y=\"14\">Mon</text><text x=\"119\" y=\"14\">Tue</text><text x=\"165\" y=\"14\">Wed</text><text x=\"211\" y=\"14\">Thu</text><text x=\"257\" y=\"14\">Fri</text><text x=\"303\" y=\"14\">Sat</text></g>\n  <g fill=\"#eff6ff\" stroke=\"#93c5fd\">\n    <rect x=\"5\" y=\"22\" width=\"44\" height=\"30\"/><rect x=\"51\" y=\"22\" width=\"44\" height=\"30\"/><rect x=\"97\" y=\"22\" width=\"44\" height=\"30\"/><rect x=\"143\" y=\"22\" width=\"44\" height=\"30\"/><rect x=\"189\" y=\"22\" width=\"44\" height=\"30\"/><rect x=\"235\" y=\"22\" width=\"44\" height=\"30\"/><rect x=\"281\" y=\"22\" width=\"44\" height=\"30\"/>\n    <rect x=\"5\" y=\"54\" width=\"44\" height=\"30\"/><rect x=\"51\" y=\"54\" width=\"44\" height=\"30\"/><rect x=\"97\" y=\"54\" width=\"44\" height=\"30\" fill=\"#fde68a\"/><rect x=\"143\" y=\"54\" width=\"44\" height=\"30\"/><rect x=\"189\" y=\"54\" width=\"44\" height=\"30\"/><rect x=\"235\" y=\"54\" width=\"44\" height=\"30\"/><rect x=\"281\" y=\"54\" width=\"44\" height=\"30\"/>\n  </g>\n  <g fill=\"#1e3a8a\"><text x=\"10\" y=\"36\">1</text><text x=\"56\" y=\"36\">2</text><text x=\"102\" y=\"36\">3</text><text x=\"148\" y=\"36\">4</text><text x=\"194\" y=\"36\">5</text><text x=\"240\" y=\"36\">6</text><text x=\"286\" y=\"36\">7</text>\n  <text x=\"10\" y=\"68\">8</text><text x=\"56\" y=\"68\">9</text><text x=\"102\" y=\"68\">10</text><text x=\"148\" y=\"68\">11</text><text x=\"194\" y=\"68\">12</text><text x=\"240\" y=\"68\">13</text><text x=\"286\" y=\"68\">14</text></g>\n  <text x=\"165\" y=\"110\" text-anchor=\"middle\" fill=\"#334155\">… rows 3 to 5 …</text>\n  <text x=\"165\" y=\"150\" text-anchor=\"middle\">first weekday = getDay() of the 1st → that many blanks</text>\n  <text x=\"165\" y=\"170\" text-anchor=\"middle\">days in month = new Date(year, month + 1, 0).getDate()</text>\n</svg>\n```\n\n**CSS Grid** does the layout: `grid-template-columns: repeat(7, 1fr)` makes seven equal columns, and every cell you add flows into the next spot, wrapping to a new row after Saturday. You never position a cell by hand.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "Seven columns with CSS Grid",
   "body": "The grid is one element with `display: grid` and seven equal columns. The weekday names are the first seven cells, so they line up with the days below them automatically.\n\n- `repeat(7, 1fr)` means \"seven columns, each one equal share (`1fr`) of the width\".\n- `gap` puts space between cells without margins.\n- `aspect-ratio: 1` on the day cells keeps them square at any width, so the month looks right on a phone and a laptop.",
   "checks": [
    {
     "pane": "css",
     "label": "a grid with seven equal columns",
     "test": "/grid-template-columns\\s*:\\s*repeat\\(\\s*7\\s*,\\s*1fr\\s*\\)/",
     "hint": "grid-template-columns: repeat(7, 1fr);"
    },
    {
     "pane": "js",
     "label": "weekday headers from a list",
     "test": "/\\[\\s*['\"]Sun['\"][\\s\\S]*['\"]Sat['\"]\\s*\\]/",
     "hint": "['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
    }
   ],
   "quiz": [
    {
     "q": "What does `repeat(7, 1fr)` make?",
     "options": [
      "One column 7 times as wide",
      "Seven columns, each an equal share of the width",
      "Seven rows"
     ],
     "answer": 1,
     "why": "`1fr` is one fraction of the free space, and repeat makes seven of them."
    },
    {
     "q": "You add 37 cells to the grid. How do they land?",
     "options": [
      "Seven per row, wrapping automatically, so 6 rows (the last one partly filled)",
      "All in one long row",
      "You have to give each cell a row and column"
     ],
     "answer": 0,
     "why": "Grid places each cell in the next free spot and wraps after the seventh column."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main class=\"card\">\n  <header class=\"bar\">\n    <button id=\"prev\" aria-label=\"Previous month\">‹</button>\n    <h1 id=\"title\">Calendar</h1>\n    <button id=\"next\" aria-label=\"Next month\">›</button>\n  </header>\n  <div id=\"month\" class=\"month\"></div>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #eff6ff;\n  color: #172554;\n}\n\n.card {\n  width: min(460px, 100% - 24px);\n  padding: 16px;\n  background: #fff;\n  border-radius: 16px;\n}\n\n.bar { display: flex; align-items: center; justify-content: space-between; }\nh1 { font-size: 1.2rem; margin: 0; }\n.bar button { width: 40px; height: 40px; font-size: 1.3rem; border: 1px solid #bfdbfe; border-radius: 10px; background: #fff; cursor: pointer; }",
    "grid": ".month {\n  display: grid;\n  grid-template-columns: repeat(7, 1fr);\n  gap: 4px;\n  margin-top: 12px;\n}\n\n.dow {\n  text-align: center;\n  font-size: .75rem;\n  font-weight: 700;\n  color: #64748b;\n  padding: 4px 0;\n}\n\n.day {\n  aspect-ratio: 1;\n  padding: 4px;\n  border-radius: 8px;\n  background: #eff6ff;\n  font-size: .85rem;\n}\n\n.day.blank { background: transparent; }\n.day.today { background: #fde68a; font-weight: 700; outline: 2px solid #f59e0b; }"
   },
   "js": {
    "helpers": "const pad = (n) => String(n).padStart(2, '0');\nconst dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;\nconst monthEl = document.getElementById('month');\nconst DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];\n\nfunction headers() {\n  return DOW.map((name) => {\n    const el = document.createElement('div');\n    el.className = 'dow';\n    el.textContent = name;\n    return el;\n  });\n}\n\nmonthEl.replaceChildren(...headers());"
   }
  },
  {
   "title": "Blanks, days and today",
   "body": "`drawMonth(year, month)` builds every cell:\n\n```js\nconst firstDow = new Date(year, month, 1).getDay();        // 0–6: how many blanks\nconst days = new Date(year, month + 1, 0).getDate();       // 28–31\n```\n\n1. The seven weekday headers.\n2. `firstDow` blank cells, so the 1st lands under the right weekday.\n3. One cell per day. Each gets a `data-day` with its `YYYY-MM-DD` key (the Task Calendar hangs tasks on it) and an `aria-label` like \"Tuesday, November 3, 2026\", because a screen reader saying just \"3\" isn't enough.\n4. The cell whose key equals today's key gets the `today` class.\n\n```svg The cells in order: 7 headers, then firstDow blanks, then days 1 to N, each with its day key\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 80\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"20\" width=\"90\" height=\"34\" rx=\"6\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"50\" y=\"41\" text-anchor=\"middle\">7 headers</text>\n  <rect x=\"100\" y=\"20\" width=\"90\" height=\"34\" rx=\"6\" fill=\"#fff\" stroke=\"#94a3b8\" stroke-dasharray=\"4 3\"/><text x=\"145\" y=\"41\" text-anchor=\"middle\">firstDow blanks</text>\n  <rect x=\"195\" y=\"20\" width=\"130\" height=\"34\" rx=\"6\" fill=\"#eff6ff\" stroke=\"#2563eb\"/><text x=\"260\" y=\"41\" text-anchor=\"middle\">days 1…N (data-day)</text>\n  <text x=\"165\" y=\"74\" text-anchor=\"middle\" fill=\"#334155\">Grid wraps them into weeks by itself</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "days in the month with the day-0 trick",
     "test": "/new\\s+Date\\(\\s*year\\s*,\\s*month\\s*\\+\\s*1\\s*,\\s*0\\s*\\)\\.getDate\\(\\)/",
     "hint": "new Date(year, month + 1, 0).getDate()"
    },
    {
     "pane": "js",
     "label": "blanks from the first weekday",
     "test": "/new\\s+Date\\(\\s*year\\s*,\\s*month\\s*,\\s*1\\s*\\)\\.getDay\\(\\)/",
     "hint": "new Date(year, month, 1).getDay()"
    },
    {
     "pane": "js",
     "label": "a readable label for each day",
     "test": "/aria-label/",
     "hint": "cell.setAttribute('aria-label', date.toLocaleDateString(...))"
    }
   ],
   "quiz": [
    {
     "q": "February 2028 starts on a Tuesday. How many blank cells come before the 1st?",
     "options": [
      "1",
      "2 (Sunday and Monday)",
      "3"
     ],
     "answer": 1,
     "why": "getDay() for a Tuesday is 2, so two blanks fill Sunday and Monday."
    },
    {
     "q": "What does `new Date(2028, 2, 0).getDate()` give?",
     "options": [
      "31",
      "29, because 2028 is a leap year and day 0 of March is February's last day",
      "0"
     ],
     "answer": 1,
     "why": "Day 0 rolls back to the last day of the previous month, leap years included."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "build": "function drawMonth(year, month) {\n  const firstDow = new Date(year, month, 1).getDay();\n  const days = new Date(year, month + 1, 0).getDate();\n  const todayKey = dayKey(new Date());\n  const cells = headers();\n\n  for (let i = 0; i < firstDow; i++) {\n    const blank = document.createElement('div');\n    blank.className = 'day blank';\n    cells.push(blank);\n  }\n\n  for (let d = 1; d <= days; d++) {\n    const date = new Date(year, month, d);\n    const cell = document.createElement('div');\n    cell.className = 'day';\n    cell.textContent = d;\n    cell.dataset.day = dayKey(date);\n    cell.setAttribute('aria-label', date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));\n    if (cell.dataset.day === todayKey) {\n      cell.classList.add('today');\n      cell.setAttribute('aria-current', 'date');\n    }\n    cells.push(cell);\n  }\n\n  monthEl.replaceChildren(...cells);\n}\n\nconst now = new Date();\ndrawMonth(now.getFullYear(), now.getMonth());"
   }
  },
  {
   "title": "Previous and next month",
   "body": "The page keeps the month on screen as **state**: `view = { year, month }`. The ‹ and › buttons change it by one and redraw.\n\nGoing from December to January needs the year to change too. Instead of writing that `if` yourself, let `Date` do it: `new Date(view.year, view.month + 1, 1)` for December 2026 is January 1, 2027. Read the year and month back from it.\n\n```svg Moving forward from December: month 12 doesn't exist, so Date rolls it into January of the next year\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"25\" width=\"95\" height=\"36\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"52\" y=\"47\" text-anchor=\"middle\">2026, month 11</text>\n  <rect x=\"120\" y=\"25\" width=\"95\" height=\"36\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"167\" y=\"47\" text-anchor=\"middle\">2026, month 12?</text>\n  <rect x=\"235\" y=\"25\" width=\"90\" height=\"36\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"280\" y=\"47\" text-anchor=\"middle\">2027, month 0</text>\n  <path d=\"M100 43 H116 M215 43 H231\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"52\" y=\"80\" text-anchor=\"middle\">December</text><text x=\"167\" y=\"80\" text-anchor=\"middle\">+1</text><text x=\"280\" y=\"80\" text-anchor=\"middle\">January</text>\n</svg>\n```\n\nThe title uses `toLocaleDateString` with `{ month: 'long', year: 'numeric' }`, so it reads \"November 2026\" in English and \"noviembre de 2026\" in Spanish without any extra code.",
   "checks": [
    {
     "pane": "js",
     "label": "the month on screen as state",
     "test": "/let\\s+view\\s*=\\s*\\{\\s*year/",
     "hint": "let view = { year: now.getFullYear(), month: now.getMonth() };"
    },
    {
     "pane": "js",
     "label": "moving by one month and letting Date fix the year",
     "test": "/new\\s+Date\\(\\s*view\\.year\\s*,\\s*view\\.month\\s*\\+\\s*\\w+\\s*,\\s*1\\s*\\)/",
     "hint": "new Date(view.year, view.month + delta, 1)"
    },
    {
     "pane": "js",
     "label": "a localized month title",
     "test": "/month\\s*:\\s*['\"]long['\"]/",
     "hint": "{ month: 'long', year: 'numeric' }"
    }
   ],
   "quiz": [
    {
     "q": "The view is December 2026 and you press ›. What does `new Date(2026, 12, 1)` give?",
     "options": [
      "An invalid date",
      "January 1, 2027, so the year changes by itself",
      "December 1, 2026"
     ],
     "answer": 1,
     "why": "Month 12 rolls over into January of the next year."
    },
    {
     "q": "Why is the month on screen kept in `view` instead of read from the title text?",
     "options": [
      "The title is for people; the code should work from plain data, not parse its own text",
      "Titles can't be read with JavaScript",
      "view is faster to draw"
     ],
     "answer": 0,
     "why": "Keep state in variables and draw the screen from it, the same idea as the Canvas lesson."
    }
   ],
   "session": 0,
   "minutes": 12,
   "js": {
    "nav": "let view = { year: now.getFullYear(), month: now.getMonth() };\n\nfunction show() {\n  drawMonth(view.year, view.month);\n  document.getElementById('title').textContent = new Date(view.year, view.month, 1)\n    .toLocaleDateString(undefined, { month: 'long', year: 'numeric' });\n}\n\nfunction move(delta) {\n  const d = new Date(view.year, view.month + delta, 1);\n  view = { year: d.getFullYear(), month: d.getMonth() };\n  show();\n}\n\ndocument.getElementById('prev').addEventListener('click', () => move(-1));\ndocument.getElementById('next').addEventListener('click', () => move(1));\nshow();"
   }
  }
 ],
 "finish": "You can put any month on the screen. You learned:\n\n- **CSS Grid** with `repeat(7, 1fr)`, `gap` and square cells\n- **Days in a month** with the day-0 trick, leap years included\n- **Blank cells** from the first day's `getDay()`\n- `data-day` keys, `aria-label`s and an `aria-current` **today**\n- **Previous and next** month, letting `Date` handle the year\n\n### Challenges\n\n1. Start weeks on Monday: shift the headers and use `(getDay() + 6) % 7` for the blanks.\n2. Gray out the days from the previous and next months in the blank cells instead of leaving them empty.\n3. Let the arrow keys move a highlighted day around the grid.\n\n### Next\n\n**Repeating events**: one task that shows up every week."
};
