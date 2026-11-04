---
id: dragdrop
title: Drag and drop
blocks-html: page
blocks-css: base
blocks-js: data, chips, drop, keyboard
goals: Make an element draggable and carry its id with dataTransfer; Turn elements into drop targets with dragover, preventDefault and drop; Show where a drop will land with a highlight that clears itself; Move an item by changing the data and redrawing, never by moving elements by hand; Give keyboard and screen reader users another way to do the same move
prereqs: The Month grid lesson (cells with data-day keys) and the Filtering lists lesson (building lists from data)
---

## Session: Moving things with the mouse

## Step: How drag and drop works in the browser
time: 10
kind: read

The browser has a built-in **Drag and Drop API**. You don't track the mouse yourself; you listen for a handful of events:

| Event | Fires on | What you do |
|---|---|---|
| `dragstart` | the thing being dragged | remember *what* is being dragged (its id) |
| `dragover` | whatever it's over, many times a second | call `preventDefault()` to say "you may drop here" |
| `dragleave` | a target it just left | remove the highlight |
| `drop` | the target it was dropped on | change the data and redraw |

```svg A drag in four events: dragstart on the chip, dragover and dragleave on each day it passes, drop on the day it lands
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" font-family="sans-serif" font-size="11">
  <rect x="5" y="40" width="70" height="30" rx="15" fill="#fed7aa" stroke="#ea580c"/><text x="40" y="59" text-anchor="middle">task chip</text>
  <g fill="#f8fafc" stroke="#cbd5e1"><rect x="110" y="30" width="60" height="50" rx="6"/><rect x="180" y="30" width="60" height="50" rx="6"/></g>
  <rect x="250" y="30" width="75" height="50" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <path d="M75 55 C110 10 220 10 270 50" fill="none" stroke="#ea580c" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="40" y="92" text-anchor="middle">dragstart</text><text x="175" y="98" text-anchor="middle">dragover / dragleave</text><text x="287" y="98" text-anchor="middle">drop</text>
</svg>
```

The surprising part: **every element refuses drops by default.** A target only accepts one if its `dragover` handler calls `e.preventDefault()`. Forget it and the drop never fires.

### Move the data, not the element

When a task is dropped on a new day, don't pick the element up and append it somewhere else. Change the task's `date` in the data and redraw, the same as everything else in these lessons. The screen then always matches the data, and saving just saves the data.

## Step: Chips you can pick up
time: 12

Each task is drawn as a **chip** with `draggable="true"` (most elements aren't draggable unless you say so; links and images are). On `dragstart`, the chip's id goes into `e.dataTransfer`, the drag's own little bag of data:

```js
e.dataTransfer.setData('text/plain', chip.dataset.id);
e.dataTransfer.effectAllowed = 'move';
```

The listener is on the whole board, not on each chip, because chips are redrawn all the time. `e.target.closest('.chip')` finds the chip that started the drag.

Try dragging a chip now: it lifts and follows the pointer, but there's nowhere to drop it yet.

check: html | the week to drop tasks on | /id=["']week["']/ | <div id="week" class="week"></div>
check: js | chips marked draggable | /draggable\s*=\s*true|setAttribute\(\s*['"]draggable['"]/ | chip.draggable = true;
check: js | the id carried with the drag | /dataTransfer\.setData\(/ | e.dataTransfer.setData('text/plain', chip.dataset.id)

quiz: Why does the dragstart listener go on the board instead of on each chip?
- [x] Chips are redrawn constantly; one listener on their parent keeps working for new chips
- [ ] Chips can't have listeners
- [ ] It makes dragging faster
why: That's event delegation: the event bubbles up from the chip to the board.

quiz: What is `e.dataTransfer` for?
- [ ] Sending the task to a server
- [x] Carrying information about what's being dragged until it's dropped
- [ ] Moving the element on the screen
why: setData on dragstart, getData on drop: it's how the drop knows what arrived.

```html page
<main class="card">
  <h1>This week</h1>
  <div id="week" class="week"></div>
  <p id="status" class="status" role="status">Drag a task to another day.</p>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #fff7ed;
  color: #431407;
}

.card { width: min(560px, 100% - 24px); padding: 16px; background: #fff; border-radius: 16px; }
h1 { margin-top: 0; font-size: 1.3rem; }
.week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.day { min-height: 110px; padding: 4px; border-radius: 8px; background: #f8fafc; border: 2px solid transparent; }
.day h2 { margin: 0 0 4px; font-size: .7rem; color: #9a3412; text-transform: uppercase; }
.day.over { border-color: #16a34a; background: #dcfce7; }
.chip { display: block; margin-bottom: 4px; padding: 3px 6px; border-radius: 999px; background: #fed7aa; font-size: .75rem; cursor: grab; overflow-wrap: anywhere; }
.chip.dragging { opacity: .4; }
.chip button { font: inherit; border: 0; background: none; padding: 0 2px; cursor: pointer; }
.status { color: #9a3412; font-size: .9rem; }
select { font: inherit; font-size: .75rem; }
```

```js data
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
const days = Array.from({ length: 7 }, (_, i) => new Date(2026, 10, 2 + i));
const label = (d) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });

let tasks = [
  { id: 't1', title: 'Dentist', date: '2026-11-03' },
  { id: 't2', title: 'Pay rent', date: '2026-11-03' },
  { id: 't3', title: 'Gym', date: '2026-11-05' },
  { id: 't4', title: 'Call mom', date: '2026-11-07' },
];

const week = document.getElementById('week');
const statusEl = document.getElementById('status');
```

```js chips
function chip(t) {
  const el = document.createElement('span');
  el.className = 'chip';
  el.textContent = t.title;
  el.dataset.id = t.id;
  el.draggable = true;
  return el;
}

function render() {
  week.replaceChildren(...days.map((d) => {
    const cell = document.createElement('section');
    cell.className = 'day';
    cell.dataset.day = dayKey(d);
    const h = document.createElement('h2');
    h.textContent = label(d);
    cell.append(h, ...tasks.filter((t) => t.date === dayKey(d)).map(chip));
    return cell;
  }));
}

week.addEventListener('dragstart', (e) => {
  const el = e.target.closest('.chip');
  if (!el) return;
  e.dataTransfer.setData('text/plain', el.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
  el.classList.add('dragging');
});

week.addEventListener('dragend', (e) => e.target.closest('.chip')?.classList.remove('dragging'));

render();
```

## Step: Days that accept a drop
time: 15

Three listeners on the board turn every day into a target:

- **dragover**: find the day under the pointer with `e.target.closest('.day')`, call `preventDefault()` to allow the drop, and add the `over` highlight.
- **dragleave**: remove the highlight when the pointer leaves that day. (It also fires when moving onto a chip *inside* the day, so the code checks `e.relatedTarget` and keeps the highlight if the pointer is still inside the same day.)
- **drop**: read the id with `getData`, then change that task's date **in the data** and redraw:

```js
tasks = tasks.map((t) => (t.id === id ? { ...t, date: day.dataset.day } : t));
```

That line makes a new array where one task is a changed copy. Nothing on the screen is moved by hand; `render()` draws the new truth.

```svg On drop: read the id, change that task's date in the data, redraw; the screen follows the data
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 90" font-family="sans-serif" font-size="11">
  <rect x="5" y="25" width="75" height="36" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="42" y="47" text-anchor="middle">drop</text>
  <rect x="95" y="25" width="70" height="36" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="130" y="47" text-anchor="middle">getData(id)</text>
  <rect x="180" y="25" width="75" height="36" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="217" y="41" text-anchor="middle">tasks.map:</text><text x="217" y="54" text-anchor="middle">new date</text>
  <rect x="270" y="25" width="55" height="36" rx="8" fill="#fed7aa" stroke="#ea580c"/><text x="297" y="47" text-anchor="middle">render</text>
  <path d="M80 43 H91 M165 43 H176 M255 43 H266" stroke="#111" stroke-width="2"/>
</svg>
```

check: js | allowing drops | /dragover[\s\S]*preventDefault\(\)/ | week.addEventListener('dragover', (e) => { ... e.preventDefault(); ... })
check: js | reading what was dropped | /dataTransfer\.getData\(/ | const id = e.dataTransfer.getData('text/plain');
check: js | moving it in the data | /tasks\s*=\s*tasks\.map\(/ | tasks = tasks.map((t) => (t.id === id ? { ...t, date: key } : t));

quiz: You forget `preventDefault()` in the dragover handler. What happens?
- [ ] The task drops on the wrong day
- [x] The drop event never fires, because elements refuse drops by default
- [ ] The page reloads
why: preventDefault on dragover is how a target says "drops allowed here".

quiz: Why change `tasks` and redraw instead of appending the chip to the new day?
- [x] The data stays the single source of truth, so saving and redrawing always agree
- [ ] appendChild doesn't work on chips
- [ ] It's required by the Drag and Drop API
why: Move the data, draw from the data: the screen can never drift from what gets saved.

```js drop
function moveTask(id, key) {
  const t = tasks.find((x) => x.id === id);
  if (!t || t.date === key) return;
  tasks = tasks.map((x) => (x.id === id ? { ...x, date: key } : x));
  render();
  statusEl.textContent = `Moved "${t.title}" to ${label(fromKey(key))}.`;
}

week.addEventListener('dragover', (e) => {
  const day = e.target.closest('.day');
  if (!day) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  day.classList.add('over');
});

week.addEventListener('dragleave', (e) => {
  const day = e.target.closest('.day');
  if (day && !day.contains(e.relatedTarget)) day.classList.remove('over');
});

week.addEventListener('drop', (e) => {
  const day = e.target.closest('.day');
  if (!day) return;
  e.preventDefault();
  day.classList.remove('over');
  moveTask(e.dataTransfer.getData('text/plain'), day.dataset.day);
});
```

## Step: A way to move without a mouse
time: 12

Dragging needs a mouse or a steady finger. People using a keyboard or a screen reader can't drag at all, and on some phones it's fiddly. So every chip also gets a small **Move to…** menu listing the week's days. Picking one calls the **same `moveTask()`** the drop uses: two ways in, one piece of logic.

```svg Two ways to move a task, one function: dragging and the Move to menu both call moveTask(id, day)
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="12">
  <rect x="5" y="10" width="110" height="32" rx="8" fill="#fed7aa" stroke="#ea580c"/><text x="60" y="31" text-anchor="middle">drag + drop</text>
  <rect x="5" y="58" width="110" height="32" rx="8" fill="#e0f2fe" stroke="#0284c7"/><text x="60" y="79" text-anchor="middle">Move to… menu</text>
  <rect x="160" y="30" width="110" height="40" rx="10" fill="#6366f1"/><text x="215" y="55" text-anchor="middle" fill="#fff">moveTask()</text>
  <path d="M115 26 L156 44 M115 74 L156 58" stroke="#111" stroke-width="2"/>
</svg>
```

The status line says what moved and where (`role="status"`), so screen reader users hear the result. This idea, a non-drag alternative for every drag, is part of the WCAG accessibility guidelines.

check: js | a Move to menu on each chip | /createElement\(\s*['"]select['"]\s*\)/ | const select = document.createElement('select');
check: js | the menu uses the same move | /moveTask\(\s*t\.id\s*,\s*\w+\.value\s*\)/ | moveTask(t.id, select.value)

quiz: Why does the menu call `moveTask()` instead of changing `tasks` itself?
- [ ] Menus can't change variables
- [x] So dragging and the menu always behave the same, from one piece of logic
- [ ] It's faster
why: Same idea as turn() in the Input lesson: many ways in, one function with the rules.

quiz: Who needs the Move to menu?
- [x] Keyboard and screen reader users, and anyone who finds dragging hard on their device
- [ ] Nobody; drag and drop works for everyone
- [ ] Only people on old browsers
why: Every drag should have a simple alternative (WCAG 2.2, "Dragging Movements").

```js keyboard
function chip(t) {
  const el = document.createElement('span');
  el.className = 'chip';
  el.dataset.id = t.id;
  el.draggable = true;
  const name = document.createElement('span');
  name.textContent = t.title;
  const select = document.createElement('select');
  select.setAttribute('aria-label', `Move ${t.title} to`);
  select.append(new Option('Move to…', ''), ...days.map((d) => new Option(label(d), dayKey(d))));
  select.addEventListener('change', () => { if (select.value) moveTask(t.id, select.value); });
  el.append(name, ' ', select);
  return el;
}

render();
```

## Finish

You can drag things around, and so can people who don't use a mouse. You learned:

- The **Drag and Drop API**: `dragstart`, `dragover`, `dragleave` and `drop`
- `dataTransfer` to carry the id, and `preventDefault()` to allow a drop
- A **highlight** that clears itself, even over child elements
- **Move the data, then redraw**, with `map()` and a changed copy
- A **Move to** menu for keyboard and screen reader users, calling the same function

### Challenges

1. Let tasks be reordered inside one day by dropping them above or below another chip.
2. Press Escape during a drag to cancel it, and show "Move cancelled".
3. Save the tasks in localStorage after every move (the Saving favorites lesson shows how).

### Next

**.ics calendar files**: send your tasks to Google Calendar, Apple Calendar or Outlook.
