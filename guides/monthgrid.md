---
id: monthgrid
title: A month grid with CSS Grid
blocks-html: page
blocks-css: base, grid
blocks-js: helpers, build, nav
goals: Lay out seven equal columns with CSS Grid and repeat(); Work out how many days a month has with the day-0 trick; Start the month on the right weekday with getDay() and blank cells; Mark today and give every cell a label screen readers can read; Move to the previous and next month without breaking at the year's end
prereqs: The Dates and time zones lesson (local days, dayKey and addDays) and the HTML & CSS basics lesson
---

## Session: A month on the screen

## Step: How a month grid works
time: 10
kind: read

A wall calendar is a grid: seven columns (Sunday to Saturday) and as many rows as the month needs. Two numbers decide the whole layout:

1. **Which weekday the 1st falls on.** `new Date(2026, 10, 1).getDay()` gives 0 for Sunday up to 6 for Saturday. November 1, 2026 is a Sunday, so it starts in the first column. If the 1st were a Wednesday (3), three blank cells would come first.
2. **How many days the month has.** Day 0 of the *next* month is the last day of this one, so `new Date(2026, 11, 0).getDate()` is 30: November has 30 days. Leap years are handled for free.

```svg November 2026: the 1st is a Sunday, so there are no blanks; 30 days fill five rows
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 190" font-family="sans-serif" font-size="11">
  <g text-anchor="middle" fill="#334155"><text x="27" y="14">Sun</text><text x="73" y="14">Mon</text><text x="119" y="14">Tue</text><text x="165" y="14">Wed</text><text x="211" y="14">Thu</text><text x="257" y="14">Fri</text><text x="303" y="14">Sat</text></g>
  <g fill="#eff6ff" stroke="#93c5fd">
    <rect x="5" y="22" width="44" height="30"/><rect x="51" y="22" width="44" height="30"/><rect x="97" y="22" width="44" height="30"/><rect x="143" y="22" width="44" height="30"/><rect x="189" y="22" width="44" height="30"/><rect x="235" y="22" width="44" height="30"/><rect x="281" y="22" width="44" height="30"/>
    <rect x="5" y="54" width="44" height="30"/><rect x="51" y="54" width="44" height="30"/><rect x="97" y="54" width="44" height="30" fill="#fde68a"/><rect x="143" y="54" width="44" height="30"/><rect x="189" y="54" width="44" height="30"/><rect x="235" y="54" width="44" height="30"/><rect x="281" y="54" width="44" height="30"/>
  </g>
  <g fill="#1e3a8a"><text x="10" y="36">1</text><text x="56" y="36">2</text><text x="102" y="36">3</text><text x="148" y="36">4</text><text x="194" y="36">5</text><text x="240" y="36">6</text><text x="286" y="36">7</text>
  <text x="10" y="68">8</text><text x="56" y="68">9</text><text x="102" y="68">10</text><text x="148" y="68">11</text><text x="194" y="68">12</text><text x="240" y="68">13</text><text x="286" y="68">14</text></g>
  <text x="165" y="110" text-anchor="middle" fill="#334155">… rows 3 to 5 …</text>
  <text x="165" y="150" text-anchor="middle">first weekday = getDay() of the 1st → that many blanks</text>
  <text x="165" y="170" text-anchor="middle">days in month = new Date(year, month + 1, 0).getDate()</text>
</svg>
```

**CSS Grid** does the layout: `grid-template-columns: repeat(7, 1fr)` makes seven equal columns, and every cell you add flows into the next spot, wrapping to a new row after Saturday. You never position a cell by hand.

## Step: Seven columns with CSS Grid
time: 12

The grid is one element with `display: grid` and seven equal columns. The weekday names are the first seven cells, so they line up with the days below them automatically.

- `repeat(7, 1fr)` means "seven columns, each one equal share (`1fr`) of the width".
- `gap` puts space between cells without margins.
- `aspect-ratio: 1` on the day cells keeps them square at any width, so the month looks right on a phone and a laptop.

check: css | a grid with seven equal columns | /grid-template-columns\s*:\s*repeat\(\s*7\s*,\s*1fr\s*\)/ | grid-template-columns: repeat(7, 1fr);
check: js | weekday headers from a list | /\[\s*['"]Sun['"][\s\S]*['"]Sat['"]\s*\]/ | ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

quiz: What does `repeat(7, 1fr)` make?
- [ ] One column 7 times as wide
- [x] Seven columns, each an equal share of the width
- [ ] Seven rows
why: `1fr` is one fraction of the free space, and repeat makes seven of them.

quiz: You add 37 cells to the grid. How do they land?
- [x] Seven per row, wrapping automatically, so 6 rows (the last one partly filled)
- [ ] All in one long row
- [ ] You have to give each cell a row and column
why: Grid places each cell in the next free spot and wraps after the seventh column.

```html page
<main class="card">
  <header class="bar">
    <button id="prev" aria-label="Previous month">‹</button>
    <h1 id="title">Calendar</h1>
    <button id="next" aria-label="Next month">›</button>
  </header>
  <div id="month" class="month"></div>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #eff6ff;
  color: #172554;
}

.card {
  width: min(460px, 100% - 24px);
  padding: 16px;
  background: #fff;
  border-radius: 16px;
}

.bar { display: flex; align-items: center; justify-content: space-between; }
h1 { font-size: 1.2rem; margin: 0; }
.bar button { width: 40px; height: 40px; font-size: 1.3rem; border: 1px solid #bfdbfe; border-radius: 10px; background: #fff; cursor: pointer; }
```

```css grid
.month {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-top: 12px;
}

.dow {
  text-align: center;
  font-size: .75rem;
  font-weight: 700;
  color: #64748b;
  padding: 4px 0;
}

.day {
  aspect-ratio: 1;
  padding: 4px;
  border-radius: 8px;
  background: #eff6ff;
  font-size: .85rem;
}

.day.blank { background: transparent; }
.day.today { background: #fde68a; font-weight: 700; outline: 2px solid #f59e0b; }
```

```js helpers
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthEl = document.getElementById('month');
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function headers() {
  return DOW.map((name) => {
    const el = document.createElement('div');
    el.className = 'dow';
    el.textContent = name;
    return el;
  });
}

monthEl.replaceChildren(...headers());
```

## Step: Blanks, days and today
time: 15

`drawMonth(year, month)` builds every cell:

```js
const firstDow = new Date(year, month, 1).getDay();        // 0–6: how many blanks
const days = new Date(year, month + 1, 0).getDate();       // 28–31
```

1. The seven weekday headers.
2. `firstDow` blank cells, so the 1st lands under the right weekday.
3. One cell per day. Each gets a `data-day` with its `YYYY-MM-DD` key (the Task Calendar hangs tasks on it) and an `aria-label` like "Tuesday, November 3, 2026", because a screen reader saying just "3" isn't enough.
4. The cell whose key equals today's key gets the `today` class.

```svg The cells in order: 7 headers, then firstDow blanks, then days 1 to N, each with its day key
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 80" font-family="sans-serif" font-size="11">
  <rect x="5" y="20" width="90" height="34" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><text x="50" y="41" text-anchor="middle">7 headers</text>
  <rect x="100" y="20" width="90" height="34" rx="6" fill="#fff" stroke="#94a3b8" stroke-dasharray="4 3"/><text x="145" y="41" text-anchor="middle">firstDow blanks</text>
  <rect x="195" y="20" width="130" height="34" rx="6" fill="#eff6ff" stroke="#2563eb"/><text x="260" y="41" text-anchor="middle">days 1…N (data-day)</text>
  <text x="165" y="74" text-anchor="middle" fill="#334155">Grid wraps them into weeks by itself</text>
</svg>
```

check: js | days in the month with the day-0 trick | /new\s+Date\(\s*year\s*,\s*month\s*\+\s*1\s*,\s*0\s*\)\.getDate\(\)/ | new Date(year, month + 1, 0).getDate()
check: js | blanks from the first weekday | /new\s+Date\(\s*year\s*,\s*month\s*,\s*1\s*\)\.getDay\(\)/ | new Date(year, month, 1).getDay()
check: js | a readable label for each day | /aria-label/ | cell.setAttribute('aria-label', date.toLocaleDateString(...))

quiz: February 2028 starts on a Tuesday. How many blank cells come before the 1st?
- [ ] 1
- [x] 2 (Sunday and Monday)
- [ ] 3
why: getDay() for a Tuesday is 2, so two blanks fill Sunday and Monday.

quiz: What does `new Date(2028, 2, 0).getDate()` give?
- [ ] 31
- [x] 29, because 2028 is a leap year and day 0 of March is February's last day
- [ ] 0
why: Day 0 rolls back to the last day of the previous month, leap years included.

```js build
function drawMonth(year, month) {
  const firstDow = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const todayKey = dayKey(new Date());
  const cells = headers();

  for (let i = 0; i < firstDow; i++) {
    const blank = document.createElement('div');
    blank.className = 'day blank';
    cells.push(blank);
  }

  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const cell = document.createElement('div');
    cell.className = 'day';
    cell.textContent = d;
    cell.dataset.day = dayKey(date);
    cell.setAttribute('aria-label', date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    if (cell.dataset.day === todayKey) {
      cell.classList.add('today');
      cell.setAttribute('aria-current', 'date');
    }
    cells.push(cell);
  }

  monthEl.replaceChildren(...cells);
}

const now = new Date();
drawMonth(now.getFullYear(), now.getMonth());
```

## Step: Previous and next month
time: 12

The page keeps the month on screen as **state**: `view = { year, month }`. The ‹ and › buttons change it by one and redraw.

Going from December to January needs the year to change too. Instead of writing that `if` yourself, let `Date` do it: `new Date(view.year, view.month + 1, 1)` for December 2026 is January 1, 2027. Read the year and month back from it.

```svg Moving forward from December: month 12 doesn't exist, so Date rolls it into January of the next year
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 90" font-family="sans-serif" font-size="12">
  <rect x="5" y="25" width="95" height="36" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="52" y="47" text-anchor="middle">2026, month 11</text>
  <rect x="120" y="25" width="95" height="36" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="167" y="47" text-anchor="middle">2026, month 12?</text>
  <rect x="235" y="25" width="90" height="36" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="280" y="47" text-anchor="middle">2027, month 0</text>
  <path d="M100 43 H116 M215 43 H231" stroke="#111" stroke-width="2"/>
  <text x="52" y="80" text-anchor="middle">December</text><text x="167" y="80" text-anchor="middle">+1</text><text x="280" y="80" text-anchor="middle">January</text>
</svg>
```

The title uses `toLocaleDateString` with `{ month: 'long', year: 'numeric' }`, so it reads "November 2026" in English and "noviembre de 2026" in Spanish without any extra code.

check: js | the month on screen as state | /let\s+view\s*=\s*\{\s*year/ | let view = { year: now.getFullYear(), month: now.getMonth() };
check: js | moving by one month and letting Date fix the year | /new\s+Date\(\s*view\.year\s*,\s*view\.month\s*\+\s*\w+\s*,\s*1\s*\)/ | new Date(view.year, view.month + delta, 1)
check: js | a localized month title | /month\s*:\s*['"]long['"]/ | { month: 'long', year: 'numeric' }

quiz: The view is December 2026 and you press ›. What does `new Date(2026, 12, 1)` give?
- [ ] An invalid date
- [x] January 1, 2027, so the year changes by itself
- [ ] December 1, 2026
why: Month 12 rolls over into January of the next year.

quiz: Why is the month on screen kept in `view` instead of read from the title text?
- [x] The title is for people; the code should work from plain data, not parse its own text
- [ ] Titles can't be read with JavaScript
- [ ] view is faster to draw
why: Keep state in variables and draw the screen from it, the same idea as the Canvas lesson.

```js nav
let view = { year: now.getFullYear(), month: now.getMonth() };

function show() {
  drawMonth(view.year, view.month);
  document.getElementById('title').textContent = new Date(view.year, view.month, 1)
    .toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function move(delta) {
  const d = new Date(view.year, view.month + delta, 1);
  view = { year: d.getFullYear(), month: d.getMonth() };
  show();
}

document.getElementById('prev').addEventListener('click', () => move(-1));
document.getElementById('next').addEventListener('click', () => move(1));
show();
```

## Finish

You can put any month on the screen. You learned:

- **CSS Grid** with `repeat(7, 1fr)`, `gap` and square cells
- **Days in a month** with the day-0 trick, leap years included
- **Blank cells** from the first day's `getDay()`
- `data-day` keys, `aria-label`s and an `aria-current` **today**
- **Previous and next** month, letting `Date` handle the year

### Challenges

1. Start weeks on Monday: shift the headers and use `(getDay() + 6) % 7` for the blanks.
2. Gray out the days from the previous and next months in the blank cells instead of leaving them empty.
3. Let the arrow keys move a highlighted day around the grid.

### Next

**Repeating events**: one task that shows up every week.
