// Built from guides/dragdrop.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "dragdrop",
 "title": "Drag and drop",
 "goals": [
  "Make an element draggable and carry its id with dataTransfer",
  "Turn elements into drop targets with dragover, preventDefault and drop",
  "Show where a drop will land with a highlight that clears itself",
  "Move an item by changing the data and redrawing, never by moving elements by hand",
  "Give keyboard and screen reader users another way to do the same move"
 ],
 "prereqs": [
  "The Month grid lesson (cells with data-day keys) and the Filtering lists lesson (building lists from data)"
 ],
 "sessions": [
  {
   "title": "Moving things with the mouse",
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
   "chips": "",
   "drop": "",
   "keyboard": ""
  }
 },
 "steps": [
  {
   "title": "How drag and drop works in the browser",
   "body": "The browser has a built-in **Drag and Drop API**. You don't track the mouse yourself; you listen for a handful of events:\n\n| Event | Fires on | What you do |\n|---|---|---|\n| `dragstart` | the thing being dragged | remember *what* is being dragged (its id) |\n| `dragover` | whatever it's over, many times a second | call `preventDefault()` to say \"you may drop here\" |\n| `dragleave` | a target it just left | remove the highlight |\n| `drop` | the target it was dropped on | change the data and redraw |\n\n```svg A drag in four events: dragstart on the chip, dragover and dragleave on each day it passes, drop on the day it lands\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 120\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"40\" width=\"70\" height=\"30\" rx=\"15\" fill=\"#fed7aa\" stroke=\"#ea580c\"/><text x=\"40\" y=\"59\" text-anchor=\"middle\">task chip</text>\n  <g fill=\"#f8fafc\" stroke=\"#cbd5e1\"><rect x=\"110\" y=\"30\" width=\"60\" height=\"50\" rx=\"6\"/><rect x=\"180\" y=\"30\" width=\"60\" height=\"50\" rx=\"6\"/></g>\n  <rect x=\"250\" y=\"30\" width=\"75\" height=\"50\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\" stroke-width=\"2\"/>\n  <path d=\"M75 55 C110 10 220 10 270 50\" fill=\"none\" stroke=\"#ea580c\" stroke-width=\"2\" stroke-dasharray=\"5 4\"/>\n  <text x=\"40\" y=\"92\" text-anchor=\"middle\">dragstart</text><text x=\"175\" y=\"98\" text-anchor=\"middle\">dragover / dragleave</text><text x=\"287\" y=\"98\" text-anchor=\"middle\">drop</text>\n</svg>\n```\n\nThe surprising part: **every element refuses drops by default.** A target only accepts one if its `dragover` handler calls `e.preventDefault()`. Forget it and the drop never fires.\n\n### Move the data, not the element\n\nWhen a task is dropped on a new day, don't pick the element up and append it somewhere else. Change the task's `date` in the data and redraw, the same as everything else in these lessons. The screen then always matches the data, and saving just saves the data.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "Chips you can pick up",
   "body": "Each task is drawn as a **chip** with `draggable=\"true\"` (most elements aren't draggable unless you say so; links and images are). On `dragstart`, the chip's id goes into `e.dataTransfer`, the drag's own little bag of data:\n\n```js\ne.dataTransfer.setData('text/plain', chip.dataset.id);\ne.dataTransfer.effectAllowed = 'move';\n```\n\nThe listener is on the whole board, not on each chip, because chips are redrawn all the time. `e.target.closest('.chip')` finds the chip that started the drag.\n\nTry dragging a chip now: it lifts and follows the pointer, but there's nowhere to drop it yet.",
   "checks": [
    {
     "pane": "html",
     "label": "the week to drop tasks on",
     "test": "/id=[\"']week[\"']/",
     "hint": "<div id=\"week\" class=\"week\"></div>"
    },
    {
     "pane": "js",
     "label": "chips marked draggable",
     "test": "/draggable\\s*=\\s*true|setAttribute\\(\\s*['\"]draggable['\"]/",
     "hint": "chip.draggable = true;"
    },
    {
     "pane": "js",
     "label": "the id carried with the drag",
     "test": "/dataTransfer\\.setData\\(/",
     "hint": "e.dataTransfer.setData('text/plain', chip.dataset.id)"
    }
   ],
   "quiz": [
    {
     "q": "Why does the dragstart listener go on the board instead of on each chip?",
     "options": [
      "Chips are redrawn constantly; one listener on their parent keeps working for new chips",
      "Chips can't have listeners",
      "It makes dragging faster"
     ],
     "answer": 0,
     "why": "That's event delegation: the event bubbles up from the chip to the board."
    },
    {
     "q": "What is `e.dataTransfer` for?",
     "options": [
      "Sending the task to a server",
      "Carrying information about what's being dragged until it's dropped",
      "Moving the element on the screen"
     ],
     "answer": 1,
     "why": "setData on dragstart, getData on drop: it's how the drop knows what arrived."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main class=\"card\">\n  <h1>This week</h1>\n  <div id=\"week\" class=\"week\"></div>\n  <p id=\"status\" class=\"status\" role=\"status\">Drag a task to another day.</p>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #fff7ed;\n  color: #431407;\n}\n\n.card { width: min(560px, 100% - 24px); padding: 16px; background: #fff; border-radius: 16px; }\nh1 { margin-top: 0; font-size: 1.3rem; }\n.week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }\n.day { min-height: 110px; padding: 4px; border-radius: 8px; background: #f8fafc; border: 2px solid transparent; }\n.day h2 { margin: 0 0 4px; font-size: .7rem; color: #9a3412; text-transform: uppercase; }\n.day.over { border-color: #16a34a; background: #dcfce7; }\n.chip { display: block; margin-bottom: 4px; padding: 3px 6px; border-radius: 999px; background: #fed7aa; font-size: .75rem; cursor: grab; overflow-wrap: anywhere; }\n.chip.dragging { opacity: .4; }\n.chip button { font: inherit; border: 0; background: none; padding: 0 2px; cursor: pointer; }\n.status { color: #9a3412; font-size: .9rem; }\nselect { font: inherit; font-size: .75rem; }"
   },
   "js": {
    "data": "const pad = (n) => String(n).padStart(2, '0');\nconst dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;\nconst fromKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };\nconst days = Array.from({ length: 7 }, (_, i) => new Date(2026, 10, 2 + i));\nconst label = (d) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });\n\nlet tasks = [\n  { id: 't1', title: 'Dentist', date: '2026-11-03' },\n  { id: 't2', title: 'Pay rent', date: '2026-11-03' },\n  { id: 't3', title: 'Gym', date: '2026-11-05' },\n  { id: 't4', title: 'Call mom', date: '2026-11-07' },\n];\n\nconst week = document.getElementById('week');\nconst statusEl = document.getElementById('status');",
    "chips": "function chip(t) {\n  const el = document.createElement('span');\n  el.className = 'chip';\n  el.textContent = t.title;\n  el.dataset.id = t.id;\n  el.draggable = true;\n  return el;\n}\n\nfunction render() {\n  week.replaceChildren(...days.map((d) => {\n    const cell = document.createElement('section');\n    cell.className = 'day';\n    cell.dataset.day = dayKey(d);\n    const h = document.createElement('h2');\n    h.textContent = label(d);\n    cell.append(h, ...tasks.filter((t) => t.date === dayKey(d)).map(chip));\n    return cell;\n  }));\n}\n\nweek.addEventListener('dragstart', (e) => {\n  const el = e.target.closest('.chip');\n  if (!el) return;\n  e.dataTransfer.setData('text/plain', el.dataset.id);\n  e.dataTransfer.effectAllowed = 'move';\n  el.classList.add('dragging');\n});\n\nweek.addEventListener('dragend', (e) => e.target.closest('.chip')?.classList.remove('dragging'));\n\nrender();"
   }
  },
  {
   "title": "Days that accept a drop",
   "body": "Three listeners on the board turn every day into a target:\n\n- **dragover**: find the day under the pointer with `e.target.closest('.day')`, call `preventDefault()` to allow the drop, and add the `over` highlight.\n- **dragleave**: remove the highlight when the pointer leaves that day. (It also fires when moving onto a chip *inside* the day, so the code checks `e.relatedTarget` and keeps the highlight if the pointer is still inside the same day.)\n- **drop**: read the id with `getData`, then change that task's date **in the data** and redraw:\n\n```js\ntasks = tasks.map((t) => (t.id === id ? { ...t, date: day.dataset.day } : t));\n```\n\nThat line makes a new array where one task is a changed copy. Nothing on the screen is moved by hand; `render()` draws the new truth.\n\n```svg On drop: read the id, change that task's date in the data, redraw; the screen follows the data\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 90\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"25\" width=\"75\" height=\"36\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"42\" y=\"47\" text-anchor=\"middle\">drop</text>\n  <rect x=\"95\" y=\"25\" width=\"70\" height=\"36\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"130\" y=\"47\" text-anchor=\"middle\">getData(id)</text>\n  <rect x=\"180\" y=\"25\" width=\"75\" height=\"36\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"217\" y=\"41\" text-anchor=\"middle\">tasks.map:</text><text x=\"217\" y=\"54\" text-anchor=\"middle\">new date</text>\n  <rect x=\"270\" y=\"25\" width=\"55\" height=\"36\" rx=\"8\" fill=\"#fed7aa\" stroke=\"#ea580c\"/><text x=\"297\" y=\"47\" text-anchor=\"middle\">render</text>\n  <path d=\"M80 43 H91 M165 43 H176 M255 43 H266\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "allowing drops",
     "test": "/dragover[\\s\\S]*preventDefault\\(\\)/",
     "hint": "week.addEventListener('dragover', (e) => { ... e.preventDefault(); ... })"
    },
    {
     "pane": "js",
     "label": "reading what was dropped",
     "test": "/dataTransfer\\.getData\\(/",
     "hint": "const id = e.dataTransfer.getData('text/plain');"
    },
    {
     "pane": "js",
     "label": "moving it in the data",
     "test": "/tasks\\s*=\\s*tasks\\.map\\(/",
     "hint": "tasks = tasks.map((t) => (t.id === id ? { ...t, date: key } : t));"
    }
   ],
   "quiz": [
    {
     "q": "You forget `preventDefault()` in the dragover handler. What happens?",
     "options": [
      "The task drops on the wrong day",
      "The drop event never fires, because elements refuse drops by default",
      "The page reloads"
     ],
     "answer": 1,
     "why": "preventDefault on dragover is how a target says \"drops allowed here\"."
    },
    {
     "q": "Why change `tasks` and redraw instead of appending the chip to the new day?",
     "options": [
      "The data stays the single source of truth, so saving and redrawing always agree",
      "appendChild doesn't work on chips",
      "It's required by the Drag and Drop API"
     ],
     "answer": 0,
     "why": "Move the data, draw from the data: the screen can never drift from what gets saved."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "drop": "function moveTask(id, key) {\n  const t = tasks.find((x) => x.id === id);\n  if (!t || t.date === key) return;\n  tasks = tasks.map((x) => (x.id === id ? { ...x, date: key } : x));\n  render();\n  statusEl.textContent = `Moved \"${t.title}\" to ${label(fromKey(key))}.`;\n}\n\nweek.addEventListener('dragover', (e) => {\n  const day = e.target.closest('.day');\n  if (!day) return;\n  e.preventDefault();\n  e.dataTransfer.dropEffect = 'move';\n  day.classList.add('over');\n});\n\nweek.addEventListener('dragleave', (e) => {\n  const day = e.target.closest('.day');\n  if (day && !day.contains(e.relatedTarget)) day.classList.remove('over');\n});\n\nweek.addEventListener('drop', (e) => {\n  const day = e.target.closest('.day');\n  if (!day) return;\n  e.preventDefault();\n  day.classList.remove('over');\n  moveTask(e.dataTransfer.getData('text/plain'), day.dataset.day);\n});"
   }
  },
  {
   "title": "A way to move without a mouse",
   "body": "Dragging needs a mouse or a steady finger. People using a keyboard or a screen reader can't drag at all, and on some phones it's fiddly. So every chip also gets a small **Move to…** menu listing the week's days. Picking one calls the **same `moveTask()`** the drop uses: two ways in, one piece of logic.\n\n```svg Two ways to move a task, one function: dragging and the Move to menu both call moveTask(id, day)\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"10\" width=\"110\" height=\"32\" rx=\"8\" fill=\"#fed7aa\" stroke=\"#ea580c\"/><text x=\"60\" y=\"31\" text-anchor=\"middle\">drag + drop</text>\n  <rect x=\"5\" y=\"58\" width=\"110\" height=\"32\" rx=\"8\" fill=\"#e0f2fe\" stroke=\"#0284c7\"/><text x=\"60\" y=\"79\" text-anchor=\"middle\">Move to… menu</text>\n  <rect x=\"160\" y=\"30\" width=\"110\" height=\"40\" rx=\"10\" fill=\"#6366f1\"/><text x=\"215\" y=\"55\" text-anchor=\"middle\" fill=\"#fff\">moveTask()</text>\n  <path d=\"M115 26 L156 44 M115 74 L156 58\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```\n\nThe status line says what moved and where (`role=\"status\"`), so screen reader users hear the result. This idea, a non-drag alternative for every drag, is part of the WCAG accessibility guidelines.",
   "checks": [
    {
     "pane": "js",
     "label": "a Move to menu on each chip",
     "test": "/createElement\\(\\s*['\"]select['\"]\\s*\\)/",
     "hint": "const select = document.createElement('select');"
    },
    {
     "pane": "js",
     "label": "the menu uses the same move",
     "test": "/moveTask\\(\\s*t\\.id\\s*,\\s*\\w+\\.value\\s*\\)/",
     "hint": "moveTask(t.id, select.value)"
    }
   ],
   "quiz": [
    {
     "q": "Why does the menu call `moveTask()` instead of changing `tasks` itself?",
     "options": [
      "Menus can't change variables",
      "So dragging and the menu always behave the same, from one piece of logic",
      "It's faster"
     ],
     "answer": 1,
     "why": "Same idea as turn() in the Input lesson: many ways in, one function with the rules."
    },
    {
     "q": "Who needs the Move to menu?",
     "options": [
      "Keyboard and screen reader users, and anyone who finds dragging hard on their device",
      "Nobody; drag and drop works for everyone",
      "Only people on old browsers"
     ],
     "answer": 0,
     "why": "Every drag should have a simple alternative (WCAG 2.2, \"Dragging Movements\")."
    }
   ],
   "session": 0,
   "minutes": 12,
   "js": {
    "keyboard": "function chip(t) {\n  const el = document.createElement('span');\n  el.className = 'chip';\n  el.dataset.id = t.id;\n  el.draggable = true;\n  const name = document.createElement('span');\n  name.textContent = t.title;\n  const select = document.createElement('select');\n  select.setAttribute('aria-label', `Move ${t.title} to`);\n  select.append(new Option('Move to…', ''), ...days.map((d) => new Option(label(d), dayKey(d))));\n  select.addEventListener('change', () => { if (select.value) moveTask(t.id, select.value); });\n  el.append(name, ' ', select);\n  return el;\n}\n\nrender();"
   }
  }
 ],
 "finish": "You can drag things around, and so can people who don't use a mouse. You learned:\n\n- The **Drag and Drop API**: `dragstart`, `dragover`, `dragleave` and `drop`\n- `dataTransfer` to carry the id, and `preventDefault()` to allow a drop\n- A **highlight** that clears itself, even over child elements\n- **Move the data, then redraw**, with `map()` and a changed copy\n- A **Move to** menu for keyboard and screen reader users, calling the same function\n\n### Challenges\n\n1. Let tasks be reordered inside one day by dropping them above or below another chip.\n2. Press Escape during a drag to cancel it, and show \"Move cancelled\".\n3. Save the tasks in localStorage after every move (the Saving favorites lesson shows how).\n\n### Next\n\n**.ics calendar files**: send your tasks to Google Calendar, Apple Calendar or Outlook."
};
