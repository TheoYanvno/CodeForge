// Built from guides/shipboard.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "shipboard",
 "title": "Shipboard (React task board)",
 "goals": [
  "Keep a board's rules (validating, moving, filtering, sorting, stats) in pure, tested functions",
  "Drag cards between columns to an exact position, with a keyboard alternative",
  "Show one set of tasks three ways: a board, a sortable list and a month calendar",
  "Save to the browser and move boards between computers with checked JSON files"
 ],
 "prereqs": [
  "React basics",
  "State updates with pure functions",
  "Drag and drop in React",
  "Import and export JSON files"
 ],
 "sessions": [
  {
   "title": "The board's rules",
   "from": 0,
   "to": 2
  },
  {
   "title": "The React app",
   "from": 3,
   "to": 5
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "What Shipboard does",
   "body": "In this guide you'll rebuild my [Shipboard](https://github.com/TheoYanvno/dev-task-board) ([live demo](https://theoyanvno.github.io/dev-task-board/)), a task board for developers: Backlog, In Progress, Review and Done columns; cards with priority, story points, tags, a project, a sprint, a due date and a checklist; search and filters; progress stats; board, list and calendar views; and export and import.\n\nAll of the rules live in one file with no React, `src/lib/tasks.js`. The components only call it.\n\n```svg A task has a column and an order number; the board groups tasks by column and sorts by order\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"130\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"115\" height=\"110\" rx=\"6\" fill=\"#f1f5f9\"/><text x=\"20\" y=\"28\" font-weight=\"bold\">Backlog</text>\n  <rect x=\"140\" y=\"10\" width=\"115\" height=\"110\" rx=\"6\" fill=\"#f1f5f9\"/><text x=\"150\" y=\"28\" font-weight=\"bold\">In Progress</text>\n  <rect x=\"270\" y=\"10\" width=\"115\" height=\"110\" rx=\"6\" fill=\"#f1f5f9\"/><text x=\"280\" y=\"28\" font-weight=\"bold\">Review</text>\n  <rect x=\"400\" y=\"10\" width=\"110\" height=\"110\" rx=\"6\" fill=\"#f1f5f9\"/><text x=\"410\" y=\"28\" font-weight=\"bold\">Done</text>\n  <rect x=\"18\" y=\"38\" width=\"100\" height=\"30\" rx=\"4\" fill=\"#fff\" stroke=\"#cbd5e1\"/><text x=\"24\" y=\"57\">order 1000</text>\n  <rect x=\"18\" y=\"74\" width=\"100\" height=\"30\" rx=\"4\" fill=\"#fff\" stroke=\"#cbd5e1\"/><text x=\"24\" y=\"93\">order 2000</text>\n  <rect x=\"148\" y=\"38\" width=\"100\" height=\"30\" rx=\"4\" fill=\"#fff\" stroke=\"#cbd5e1\"/><text x=\"154\" y=\"57\">order 1000</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Where do Shipboard's rules for moving and filtering tasks live?",
     "options": [
      "Inside each React component",
      "In src/lib/tasks.js, as plain functions with no React",
      "In localStorage"
     ],
     "answer": 1,
     "why": "Rules in plain functions are shared by every view and tested on their own."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "One cleanTask for every way in",
   "body": "A task can come from the editor, a saved board or an imported file. All three pass through `cleanTask()`, which returns `{ ok, task }` or `{ ok: false, error }` with a sentence the person can act on:\n\n```js\nexport function cleanTask(input, existing = {}) {\n  const title = String(input.title ?? '').replace(/\\s+/g, ' ').trim();\n  if (!title) return { ok: false, error: 'Give the task a title.' };\n  if (title.length > 120) return { ok: false, error: 'Keep the title under 120 characters.' };\n  const due = input.due ? String(input.due) : '';\n  if (due && !DATE.test(due)) return { ok: false, error: 'The due date must be a date.' };\n  const points = input.points === '' || input.points == null ? null : Number(input.points);\n  if (points !== null && !POINTS.includes(points)) return { ok: false, error: `Story points are ${POINTS.join(', ')}.` };\n  return { ok: true, task: { /* id, title, description, column, priority, tags: cleanTags(input.tags), … */ } };\n}\n```\n\nUnknown columns fall back to Backlog, unknown priorities to medium, and `cleanTags(\"Bug, UI,ui\")` becomes `['bug', 'ui']`: lower case, no repeats, at most six.\n\n```svg Editor, saved board and imported file all go through cleanTask before reaching state\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"110\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"8\" width=\"120\" height=\"26\" rx=\"5\" fill=\"#dbeafe\"/><text x=\"20\" y=\"25\">editor form</text>\n  <rect x=\"10\" y=\"42\" width=\"120\" height=\"26\" rx=\"5\" fill=\"#fef3c7\"/><text x=\"20\" y=\"59\">localStorage</text>\n  <rect x=\"10\" y=\"76\" width=\"120\" height=\"26\" rx=\"5\" fill=\"#e0e7ff\"/><text x=\"20\" y=\"93\">imported file</text>\n  <rect x=\"200\" y=\"40\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"250\" y=\"59\" text-anchor=\"middle\">cleanTask</text>\n  <path d=\"M130 21 L200 50 M130 55 H200 M130 89 L200 60 M300 55 H350\" stroke=\"#374151\" stroke-width=\"2\"/><text x=\"355\" y=\"59\">tasks (state)</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does cleanTask return { ok: false, error } instead of throwing?",
     "options": [
      "The editor can show the message next to the form, and the importer can skip that task and keep going",
      "Throwing isn't allowed in JavaScript modules",
      "To make it faster"
     ],
     "answer": 0,
     "why": "A result object lets each caller decide what to do with a bad task."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15,
   "uses": [
    "jsonfiles"
   ]
  },
  {
   "title": "Move, filter, sort and stats",
   "body": "`move()` from State updates with pure functions renumbers the column's `order` in steps of 1000 after each drop. The other rules are just as small:\n\n```js\nexport function filter(tasks, f = {}) {\n  const words = String(f.q ?? '').toLowerCase().split(/\\s+/).filter(Boolean);\n  return tasks.filter((t) => {\n    const hay = `${t.title} ${t.description} ${t.tags.join(' ')}`.toLowerCase();\n    return words.every((w) => hay.includes(w))\n      && (!f.priority || t.priority === f.priority) && (!f.tag || t.tags.includes(f.tag))\n      && (!f.project || t.project === f.project) && (!f.sprint || t.sprint === f.sprint);\n  });\n}\n\nexport function stats(tasks, today = isoDay()) {\n  const by = Object.fromEntries(COLUMNS.map((c) => [c.id, { count: 0, points: 0 }]));\n  for (const t of tasks) { by[t.column].count++; by[t.column].points += t.points ?? 0; }\n  const total = tasks.reduce((s, t) => s + (t.points ?? 0), 0);\n  const overdue = tasks.filter((t) => t.due && t.due < today && t.column !== 'done').length;\n  return { by, total, donePoints: by.done.points, percent: total ? Math.round((100 * by.done.points) / total) : 0, overdue };\n}\n```\n\n- Every search word must match (`every`), so \"login bug\" narrows instead of widening.\n- Dates are `YYYY-MM-DD` strings, so `t.due < today` compares them correctly as text.\n- `sortBy()` puts tasks with no due date last when sorting by due date.\n\n```svg The search and every filter must all pass for a task to show\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 500 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"500\" height=\"80\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"25\" width=\"80\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"50\" y=\"44\" text-anchor=\"middle\">all tasks</text>\n  <rect x=\"110\" y=\"25\" width=\"70\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"145\" y=\"44\" text-anchor=\"middle\">words</text>\n  <rect x=\"195\" y=\"25\" width=\"70\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"230\" y=\"44\" text-anchor=\"middle\">priority</text>\n  <rect x=\"280\" y=\"25\" width=\"60\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"310\" y=\"44\" text-anchor=\"middle\">tag</text>\n  <rect x=\"355\" y=\"25\" width=\"60\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"385\" y=\"44\" text-anchor=\"middle\">sprint</text>\n  <rect x=\"430\" y=\"25\" width=\"60\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"460\" y=\"44\" text-anchor=\"middle\">shown</text>\n  <path d=\"M90 40 H110 M180 40 H195 M265 40 H280 M340 40 H355 M415 40 H430\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why can due dates be compared with < as strings?",
     "options": [
      "YYYY-MM-DD text sorts in the same order as the dates themselves",
      "JavaScript converts strings to dates automatically",
      "It only works for this year"
     ],
     "answer": 0,
     "why": "Year, then month, then day, each zero-padded, makes text order equal date order."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15,
   "uses": [
    "purestate"
   ]
  },
  {
   "title": "The board: dragging and the Move to menu",
   "body": "`Board` draws a column per entry in `COLUMNS` and uses the drag and drop pattern from Drag and drop in React: the card puts its id in `dataTransfer`, the list measures the drop index, shows a marker while you drag and corrects the off-by-one when the card moves down its own column. Each card also has a **Move to** menu, and both call `App`'s one handler:\n\n```jsx\nconst onMove = (id, column, index) => setTasks((ts) => move(ts, id, column, index));\n```\n\nCards show overdue dates in red only when the task isn't done, the checklist count (☑ 2/5), story points and tags. An empty column shows a big \"+ No tasks yet\" button so there's always a place to drop.\n\n```svg Each column is a drop target; the marker shows where the card will land\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 420 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"420\" height=\"130\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"170\" height=\"110\" rx=\"6\" fill=\"#f1f5f9\"/><text x=\"20\" y=\"28\">In Progress</text>\n  <rect x=\"20\" y=\"36\" width=\"150\" height=\"26\" rx=\"4\" fill=\"#fff\" stroke=\"#cbd5e1\"/><text x=\"28\" y=\"53\">API pagination</text>\n  <line x1=\"20\" y1=\"68\" x2=\"170\" y2=\"68\" stroke=\"#2563eb\" stroke-width=\"3\"/>\n  <rect x=\"20\" y=\"74\" width=\"150\" height=\"26\" rx=\"4\" fill=\"#fff\" stroke=\"#cbd5e1\"/><text x=\"28\" y=\"91\">Dark mode</text>\n  <rect x=\"230\" y=\"50\" width=\"150\" height=\"26\" rx=\"4\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"238\" y=\"67\">Fix login (dragging)</text>\n  <path d=\"M230 63 C 200 63, 200 68, 175 68\" fill=\"none\" stroke=\"#2563eb\" stroke-dasharray=\"4 3\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What do dragging a card and choosing from its Move to menu have in common?",
     "options": [
      "Nothing; they use different rules",
      "Both call the same onMove, which runs the same move() function",
      "Both save to a file"
     ],
     "answer": 1,
     "why": "One rule for every path keeps the behavior identical."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15,
   "uses": [
    "reactdnd"
   ]
  },
  {
   "title": "Three views of the same tasks",
   "body": "The view switch changes only how `shown` (the filtered tasks) is drawn:\n\n| View | Built with |\n|---|---|\n| Board | `inColumn(tasks, column)` for each column |\n| List | `sortBy(tasks, key, dir)` with clickable column headers |\n| Calendar | `monthGrid(year, month)` and `byDay(tasks)` |\n\n```js\nexport function monthGrid(year, month) {\n  const first = new Date(year, month, 1);\n  const start = new Date(year, month, 1 - first.getDay());        // back to Sunday\n  const last = new Date(year, month + 1, 0);                       // day 0 of next month = last day\n  const weeks = [];\n  const d = new Date(start);\n  while (d <= last || d.getDay() !== 0) {\n    if (d.getDay() === 0) weeks.push([]);\n    weeks[weeks.length - 1].push({ key: key(d), day: d.getDate(), inMonth: d.getMonth() === month });\n    d.setDate(d.getDate() + 1);\n  }\n  return weeks;\n}\n```\n\n`byDay` groups tasks into a `Map` by due date, so each calendar cell looks up its chips in one step.\n\n```svg A month grid starts on the Sunday before the 1st and ends on the Saturday after the last day\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 420 100\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect width=\"420\" height=\"100\" fill=\"#fff\"/>\n  <g fill=\"#f1f5f9\" stroke=\"#cbd5e1\"><rect x=\"10\" y=\"10\" width=\"55\" height=\"38\"/><rect x=\"65\" y=\"10\" width=\"55\" height=\"38\"/><rect x=\"120\" y=\"10\" width=\"55\" height=\"38\" fill=\"#fff\"/><rect x=\"175\" y=\"10\" width=\"55\" height=\"38\" fill=\"#fff\"/><rect x=\"230\" y=\"10\" width=\"55\" height=\"38\" fill=\"#fff\"/><rect x=\"285\" y=\"10\" width=\"55\" height=\"38\" fill=\"#fff\"/><rect x=\"340\" y=\"10\" width=\"55\" height=\"38\" fill=\"#fff\"/></g>\n  <text x=\"15\" y=\"25\">29</text><text x=\"70\" y=\"25\">30</text><text x=\"125\" y=\"25\">1</text><text x=\"180\" y=\"25\">2</text><text x=\"235\" y=\"25\">3</text><text x=\"290\" y=\"25\">4</text><text x=\"345\" y=\"25\">5</text>\n  <text x=\"10\" y=\"70\">gray: days from the month before, so every week has 7 days</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "What does new Date(year, month + 1, 0) give?",
     "options": [
      "The last day of the month, because day 0 of the next month is the day before its 1st",
      "The first day of the next month",
      "An invalid date"
     ],
     "answer": 0,
     "why": "JavaScript rolls day 0 back to the previous month's last day."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Saving, export, import and the tests",
   "body": "`App` saves after every change and shows a note if the browser blocks storage. **Export** downloads `{ app, version, tasks }`, and **Import** reads it back through `parseBoard()`, which checks every task with `cleanTask()` and reports how many were skipped. Loading the saved board uses the same `parseBoard()`, so a damaged save loses only the broken tasks.\n\n```bash\nnpm start       # http://localhost:8000\nnpm test        # cleanTask, cleanTags, move, filter, sortBy, stats, monthGrid, parseBoard\nnpm run build   # into docs/ for GitHub Pages\n```\n\n```svg Save and load use the same format and checks as export and import\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"30\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"55\" y=\"49\" text-anchor=\"middle\">tasks</text>\n  <rect x=\"140\" y=\"10\" width=\"110\" height=\"26\" rx=\"5\" fill=\"#dbeafe\"/><text x=\"195\" y=\"27\" text-anchor=\"middle\">serialize</text>\n  <rect x=\"140\" y=\"54\" width=\"110\" height=\"26\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"195\" y=\"71\" text-anchor=\"middle\">parseBoard</text>\n  <rect x=\"290\" y=\"10\" width=\"180\" height=\"26\" rx=\"5\" fill=\"#fef3c7\"/><text x=\"380\" y=\"27\" text-anchor=\"middle\">localStorage or .json file</text>\n  <path d=\"M100 40 L140 23 M250 23 H290 M290 30 L250 67 M140 67 L100 50\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does loading the saved board use parseBoard, the same as importing a file?",
     "options": [
      "localStorage can only store files",
      "Saved data can be damaged too, and one checked path means a broken task never breaks the board",
      "It's required by React"
     ],
     "answer": 1,
     "why": "Treat your own saved data with the same care as a file from outside."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 12,
   "uses": [
    "jsonfiles"
   ]
  }
 ],
 "finish": "You built a full task board: rules in pure functions, exact drag and drop with a keyboard path, three views of one list, and safe saving, export and import.\n\n### Challenges\n\n1. Add a WIP limit: warn when In Progress has more than 3 cards.\n2. Add a burndown chart for a sprint with the SVG chart skills from Weatherboard.\n3. Let the checklist be reordered by dragging, with the same move() idea."
};
