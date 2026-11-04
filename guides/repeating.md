---
id: repeating
title: Repeating events
blocks-html: page
blocks-css: base
blocks-js: helpers, rule, monthly, upcoming
goals: Store a repeating task as one rule instead of hundreds of copies; Write occursOn(task, day) that answers "does it happen that day?"; Repeat daily and weekly with days-between and the % operator; Repeat monthly, and decide what happens on the 31st in a short month; End a repeat with an until date and skip single days with exceptions
prereqs: The Dates and time zones lesson (dayKey, fromKey, addDays and days between)
---

## Session: One rule, many days

## Step: A rule, not copies
time: 10
kind: read

"Take out the trash every Tuesday" happens 52 times a year. You could save 52 tasks, but then changing the time means changing 52 tasks, and "forever" can't be saved at all.

Instead, save **one rule** and ask it a question for each day you draw:

```js
const trash = { title: 'Take out the trash', start: '2026-11-03', every: 'week' };
occursOn(trash, '2026-11-10');   // true
occursOn(trash, '2026-11-11');   // false
```

```svg One saved rule; the calendar asks it about each visible day and draws the task only where it says yes
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" font-family="sans-serif" font-size="11">
  <rect x="5" y="40" width="95" height="44" rx="8" fill="#ede9fe" stroke="#7c3aed"/><text x="52" y="58" text-anchor="middle">rule</text><text x="52" y="74" text-anchor="middle">every: week</text>
  <g fill="#f8fafc" stroke="#cbd5e1"><rect x="130" y="20" width="26" height="26"/><rect x="158" y="20" width="26" height="26"/><rect x="186" y="20" width="26" height="26"/><rect x="214" y="20" width="26" height="26"/><rect x="242" y="20" width="26" height="26"/><rect x="270" y="20" width="26" height="26"/><rect x="298" y="20" width="26" height="26"/>
  <rect x="130" y="60" width="26" height="26"/><rect x="158" y="60" width="26" height="26"/><rect x="186" y="60" width="26" height="26"/><rect x="214" y="60" width="26" height="26"/><rect x="242" y="60" width="26" height="26"/><rect x="270" y="60" width="26" height="26"/><rect x="298" y="60" width="26" height="26"/></g>
  <rect x="186" y="20" width="26" height="26" fill="#c4b5fd"/><rect x="186" y="60" width="26" height="26" fill="#c4b5fd"/>
  <path d="M100 62 H126" stroke="#7c3aed" stroke-width="2"/>
  <text x="227" y="108" text-anchor="middle" fill="#334155">occursOn(rule, day)? → only the Tuesdays light up</text>
</svg>
```

The calendar only ever draws about 42 days at a time, so asking the rule about each one is fast, and "forever" costs nothing. This is how Google Calendar and Outlook store repeats too (the standard is called RRULE).

## Step: Daily and weekly with days-between
time: 15

`occursOn(task, key)` starts simple:

1. Before the start day, never.
2. No `every`: only on the start day itself.
3. `every: 'day'`: every day from the start.
4. `every: 'week'`: when the number of days since the start divides by 7, `days % 7 === 0`.

Days-between comes from the Dates lesson, rounded so daylight saving can't break it. Change the **Repeats** menu and watch the month redraw.

check: js | an occursOn() function | /function\s+occursOn\s*\(\s*task\s*,\s*key\s*\)/ | function occursOn(task, key) { ... }
check: js | weekly with the remainder operator | /%\s*7\s*===\s*0/ | return days % 7 === 0;
check: js | nothing before the start | /if\s*\(\s*days\s*<\s*0\s*\)\s*return\s+false/ | if (days < 0) return false;

quiz: A weekly task starts on Tuesday, November 3. Does it happen on November 24?
- [x] Yes: 21 days later, and 21 % 7 is 0
- [ ] No: 24 isn't a multiple of 7
- [ ] Only if November has 5 Tuesdays
why: The rule counts days from the start, not the date number. 21 divides by 7.

quiz: Why does the calendar ask the rule about each day instead of saving every occurrence?
- [ ] Saving is slow
- [x] One rule can repeat forever, and changing it changes every occurrence at once
- [ ] Calendars can only store one task
why: A rule is small and easy to edit; copies multiply and drift apart.

```html page
<main class="card">
  <h1>Repeating task</h1>
  <form id="form" class="row">
    <label>Starts <input id="start" type="date" value="2026-11-03"></label>
    <label>Repeats
      <select id="every">
        <option value="">Never</option>
        <option value="day">Every day</option>
        <option value="week" selected>Every week</option>
        <option value="month">Every month</option>
      </select>
    </label>
    <label>Until <input id="until" type="date"></label>
  </form>
  <p id="caption" class="muted"></p>
  <div id="month" class="month"></div>
  <h2>Next 5</h2>
  <ol id="next" class="next"></ol>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: start center;
  padding: 20px 0;
  font-family: system-ui, sans-serif;
  background: #f5f3ff;
  color: #2e1065;
}

.card { width: min(480px, 100% - 24px); padding: 16px; background: #fff; border-radius: 16px; }
h1 { margin-top: 0; font-size: 1.3rem; }
h2 { font-size: 1rem; }
.row { display: flex; flex-wrap: wrap; gap: 10px; }
label { display: grid; gap: 4px; font-size: .85rem; }
input, select, button { font: inherit; padding: 6px; }
.muted { color: #6b7280; font-size: .9rem; }
.month { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.day { aspect-ratio: 1; padding: 3px; border-radius: 6px; background: #f8fafc; font-size: .8rem; cursor: pointer; }
.day.on { background: #c4b5fd; font-weight: 700; }
.day.skipped { background: #fee2e2; text-decoration: line-through; }
.blank { background: transparent; }
.next { padding-left: 1.2em; }
```

```js helpers
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
const daysBetween = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 86400000);

const monthEl = document.getElementById('month');

function drawMonth(year, month, isOn) {
  const cells = [];
  for (let i = 0; i < new Date(year, month, 1).getDay(); i++) {
    const b = document.createElement('div'); b.className = 'day blank'; cells.push(b);
  }
  for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++) {
    const key = dayKey(new Date(year, month, d));
    const cell = document.createElement('div');
    cell.className = 'day';
    cell.textContent = d;
    cell.dataset.day = key;
    const state = isOn(key);
    if (state === 'skipped') cell.classList.add('skipped');
    else if (state) cell.classList.add('on');
    cells.push(cell);
  }
  monthEl.replaceChildren(...cells);
}
```

```js rule
function occursOn(task, key) {
  const days = daysBetween(task.start, key);
  if (days < 0) return false;
  if (!task.every) return days === 0;
  if (task.every === 'day') return true;
  if (task.every === 'week') return days % 7 === 0;
  return false;
}

const task = { title: 'Take out the trash', start: '2026-11-03', every: 'week', until: '', skip: [] };

function redraw() {
  task.start = document.getElementById('start').value || '2026-11-03';
  task.every = document.getElementById('every').value;
  task.until = document.getElementById('until').value;
  const s = fromKey(task.start);
  drawMonth(s.getFullYear(), s.getMonth(), (key) => occursOn(task, key));
  document.getElementById('caption').textContent = `${s.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}: highlighted days are when "${task.title}" happens.`;
}

document.getElementById('form').addEventListener('input', redraw);
redraw();
```

## Step: Monthly, and the 31st problem
time: 15

Monthly means "the same date each month": the 3rd, the 3rd, the 3rd. So the test is whether the day number matches the start's day number.

But what about a task on the **31st**? April, June, September and November have only 30 days, and February has 28 or 29. Apps choose different answers; this one uses the most common: **use the last day of the month** when the date doesn't exist. A bill due on the 31st shows on April 30.

```svg A monthly task on the 31st: months with 31 days use the 31st; shorter months use their last day
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 90" font-family="sans-serif" font-size="12">
  <g fill="#ede9fe" stroke="#7c3aed"><rect x="5" y="20" width="75" height="34" rx="6"/><rect x="88" y="20" width="75" height="34" rx="6"/><rect x="171" y="20" width="75" height="34" rx="6"/><rect x="254" y="20" width="71" height="34" rx="6"/></g>
  <g text-anchor="middle"><text x="42" y="42">Jan 31</text><text x="125" y="42">Feb 28</text><text x="208" y="42">Mar 31</text><text x="289" y="42">Apr 30</text></g>
  <text x="165" y="80" text-anchor="middle" fill="#334155">wanted day = min(31, days in that month)</text>
</svg>
```

This step also adds **until**: a last date after which the rule stops. "Every week until December 15" covers a six-week class.

Set **Starts** to January 31 and **Repeats** to every month, then step through the months with the date box to see it.

check: js | the wanted day capped at the month's length | /Math\.min\(\s*start\.getDate\(\)\s*,\s*lastDay\s*\)/ | d.getDate() === Math.min(start.getDate(), lastDay)
check: js | stopping after until | /task\.until\s*&&\s*key\s*>\s*task\.until/ | if (task.until && key > task.until) return false;

quiz: A monthly task starts on January 31. When does it happen in February 2027?
- [ ] It skips February
- [x] February 28, the last day of February
- [ ] March 3
why: This rule uses the last day when the wanted date doesn't exist in that month.

quiz: Why can `key > task.until` compare dates as plain text?
- [x] YYYY-MM-DD keys sort in date order as text
- [ ] JavaScript turns them into dates automatically
- [ ] It only works for dates in the same month
why: Year, then month, then day, all padded: text order and date order match.

```js monthly
function monthlyOn(start, d) {
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return d.getDate() === Math.min(start.getDate(), lastDay);
}
```

```js rule
function occursOn(task, key) {
  const days = daysBetween(task.start, key);
  if (days < 0) return false;
  if (task.until && key > task.until) return false;
  if (!task.every) return days === 0;
  if (task.every === 'day') return true;
  if (task.every === 'week') return days % 7 === 0;
  if (task.every === 'month') return monthlyOn(fromKey(task.start), fromKey(key));
  return false;
}

const task = { title: 'Take out the trash', start: '2026-11-03', every: 'week', until: '', skip: [] };

function redraw() {
  task.start = document.getElementById('start').value || '2026-11-03';
  task.every = document.getElementById('every').value;
  task.until = document.getElementById('until').value;
  const s = fromKey(task.start);
  drawMonth(s.getFullYear(), s.getMonth(), (key) => occursOn(task, key));
  document.getElementById('caption').textContent = `${s.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}: highlighted days are when "${task.title}" happens.`;
}

document.getElementById('form').addEventListener('input', redraw);
redraw();
```

## Step: Skipping one day, and what's next
time: 15

Life happens: the trash pickup moves for Thanksgiving. Deleting the whole rule is wrong, so the task keeps a list of **exceptions**: days to skip. Click a highlighted day to skip it (it turns red and struck through); click again to bring it back.

```js
if (task.skip.includes(key)) return 'skipped';
```

The **Next 5** list walks forward day by day from today with `addDays`, keeping days where `occursOn` says yes, until it has five or has looked a year ahead (so a rule that never happens again can't loop forever).

```svg The next-5 list walks forward one day at a time, keeps the days the rule says yes to, and stops at five or after a year
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 80" font-family="sans-serif" font-size="11">
  <g fill="#f8fafc" stroke="#cbd5e1"><rect x="5" y="20" width="36" height="30"/><rect x="45" y="20" width="36" height="30"/><rect x="85" y="20" width="36" height="30"/><rect x="125" y="20" width="36" height="30"/><rect x="165" y="20" width="36" height="30"/><rect x="205" y="20" width="36" height="30"/><rect x="245" y="20" width="36" height="30"/><rect x="285" y="20" width="36" height="30"/></g>
  <rect x="5" y="20" width="36" height="30" fill="#c4b5fd"/><rect x="285" y="20" width="36" height="30" fill="#c4b5fd"/>
  <text x="23" y="40" text-anchor="middle">✓</text><text x="303" y="40" text-anchor="middle">✓</text>
  <text x="165" y="70" text-anchor="middle" fill="#334155">addDays(day, 1) → occursOn? → keep · stop at 5 or 366 days</text>
</svg>
```

check: js | a list of skipped days | /task\.skip\.includes\(\s*key\s*\)/ | if (task.skip.includes(key)) return 'skipped';
check: js | walking forward a day at a time | /addDays\(\s*\w+\s*,\s*1\s*\)/ | d = addDays(d, 1)
check: js | a limit so the loop always ends | /<\s*366/ | for (let i = 0; i < 366 && out.length < 5; i++)

quiz: Why does the next-5 loop stop after 366 days even with fewer than 5 found?
- [ ] A year is the most a calendar can show
- [x] A rule that's ended (or never happens) would otherwise loop forever
- [ ] To make the list shorter
why: Every loop needs a guaranteed end; the day limit is it.

quiz: Thanksgiving's pickup is skipped. What happens to the rest of the weekly task?
- [x] Nothing; only that one day is in the skip list
- [ ] The whole rule is deleted
- [ ] It moves every later week by a day
why: Exceptions remove single days without touching the rule.

```js rule
function occursOn(task, key) {
  const days = daysBetween(task.start, key);
  if (days < 0) return false;
  if (task.until && key > task.until) return false;
  if (!task.every) return days === 0;
  if (task.every === 'day') return true;
  if (task.every === 'week') return days % 7 === 0;
  if (task.every === 'month') return monthlyOn(fromKey(task.start), fromKey(key));
  return false;
}

const task = { title: 'Take out the trash', start: '2026-11-03', every: 'week', until: '', skip: [] };
```

```js upcoming
function state(key) {
  if (!occursOn(task, key)) return false;
  if (task.skip.includes(key)) return 'skipped';
  return true;
}

function nextFive() {
  const out = [];
  let d = new Date();
  for (let i = 0; i < 366 && out.length < 5; i++) {
    if (state(dayKey(d)) === true) out.push(d);
    d = addDays(d, 1);
  }
  const list = document.getElementById('next');
  list.replaceChildren(...out.map((day) => {
    const li = document.createElement('li');
    li.textContent = day.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    return li;
  }));
  if (!out.length) list.textContent = 'Nothing coming up.';
}

function redrawAll() {
  task.start = document.getElementById('start').value || '2026-11-03';
  task.every = document.getElementById('every').value;
  task.until = document.getElementById('until').value;
  const s = fromKey(task.start);
  drawMonth(s.getFullYear(), s.getMonth(), state);
  nextFive();
}

monthEl.addEventListener('click', (e) => {
  const key = e.target.dataset.day;
  if (!key || !occursOn(task, key)) return;
  task.skip = task.skip.includes(key) ? task.skip.filter((k) => k !== key) : [...task.skip, key];
  redrawAll();
});

document.getElementById('form').addEventListener('input', redrawAll);
redrawAll();
```

## Finish

You can store repeats the way real calendars do. You learned:

- **One rule** instead of copies, asked about each visible day
- `occursOn` with **daily**, **weekly** (`% 7`) and **monthly** repeats
- The **31st problem** and the last-day-of-the-month answer
- **until** dates and **skip** exceptions
- A **next-5** list with a loop that always ends

### Challenges

1. Add "every 2 weeks" with `days % 14 === 0`, then generalize to an `interval` number.
2. Add "every weekday" (Monday to Friday) using `getDay()`.
3. Let a skipped day be moved instead: save `{ from, to }` and show the task on the new day.

### Next

**Drag and drop**: move a task to another day with the mouse or a finger.
