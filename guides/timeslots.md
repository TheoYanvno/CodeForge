---
id: timeslots
title: Time slots and overlap checks
blocks-html: page
blocks-css: base
blocks-js: time, overlap, free
goals: Store times of day as minutes since midnight so they're easy to compare and add; Build a day of quarter-hour slots between opening and closing; Test whether two time ranges overlap with one short rule; Refuse a booking that would double-book a provider; List the free start times for a visit of any length, around breaks and other bookings
prereqs: The Dates and time zones lesson and the Filtering lists lesson
---

## Session: No double booking

## Step: Minutes, ranges and the overlap rule
time: 12
kind: read

Clinic schedules are full of comparisons: does 9:45 come before 10:00? Does a 30-minute visit at 9:45 run into the 10:00 one? Text like `"09:45"` is awkward for that, so times become **minutes since midnight**: 9:45 is 9 × 60 + 45 = **585**. Now "later" is just "bigger", and adding 30 minutes is `+ 30`.

A booking is a **range** with a start and an end. Ranges are **half-open**: a 9:00–9:30 visit covers 9:00 up to (but not including) 9:30, so a 9:30 visit right after it doesn't clash.

The whole overlap check is one line. Two ranges overlap when **each starts before the other ends**:

```js
const overlaps = (a, b) => a.start < b.end && b.start < a.end;
```

```svg Two ranges overlap only when each starts before the other ends; ranges that only touch don't overlap
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 140" font-family="sans-serif" font-size="11">
  <rect x="20" y="15" width="120" height="18" rx="4" fill="#bfdbfe"/><rect x="100" y="37" width="120" height="18" rx="4" fill="#fecaca"/><text x="235" y="40" fill="#b91c1c">overlap</text>
  <rect x="20" y="70" width="120" height="18" rx="4" fill="#bfdbfe"/><rect x="140" y="92" width="100" height="18" rx="4" fill="#bbf7d0"/><text x="250" y="95" fill="#15803d">touching: fine</text>
  <path d="M140 66 V114" stroke="#475569" stroke-dasharray="3 3"/><text x="105" y="128">9:30 = end of one, start of the other</text>
</svg>
```

That rule covers every case: one inside the other, sticking out on the left or the right, or exactly the same. It's worth memorizing; it comes up in calendars, room bookings, shift schedules and video editors.

## Step: Minutes, and a day of quarter hours
time: 12

Two helpers convert both ways:

```js
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
```

```svg The day as a number line of minutes: 8:00 is 480, 9:45 is 585, 17:00 is 1020
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 70" font-family="sans-serif" font-size="11">
  <path d="M15 35 H315" stroke="#0f766e" stroke-width="2"/>
  <g fill="#0f766e"><circle cx="15" cy="35" r="4"/><circle cx="65" cy="35" r="4"/><circle cx="315" cy="35" r="4"/></g>
  <text x="15" y="22" text-anchor="middle">8:00</text><text x="65" y="22" text-anchor="middle">9:45</text><text x="315" y="22" text-anchor="end">17:00</text>
  <text x="15" y="55" text-anchor="middle">480</text><text x="65" y="55" text-anchor="middle">585</text><text x="315" y="55" text-anchor="end">1020</text>
</svg>
```

The clinic opens at 8:00 and closes at 17:00, so the day's start times are every 15 minutes from 480 to 1020 (a visit can't *start* at closing). A simple `for` loop with `+= 15` makes them. The page draws them as a column with the existing bookings shaded.

check: js | text time to minutes | /h\s*\*\s*60\s*\+\s*m/ | return h * 60 + m;
check: js | minutes back to text | /Math\.floor\(\s*\w+\s*\/\s*60\s*\)/ | String(Math.floor(min / 60)).padStart(2, '0')
check: js | quarter-hour steps | /\+=\s*15/ | for (let t = OPEN; t < CLOSE; t += 15)

quiz: What is 14:30 in minutes since midnight?
- [ ] 1430
- [x] 870
- [ ] 830
why: 14 × 60 = 840, plus 30 = 870.

quiz: Why store times as minutes instead of text like "14:30"?
- [x] Numbers compare and add directly: later is bigger, and +30 is 30 minutes later
- [ ] Text can't be saved
- [ ] Minutes take less memory
why: "9:45" < "10:00" is false as text but 585 < 600 is true as numbers.

```html page
<main class="wrap">
  <h1>Dr. Reyes, Tuesday</h1>
  <form id="book" class="row">
    <label>Start <input id="start" type="time" value="09:45" step="900"></label>
    <label>Minutes <select id="len"><option>15</option><option selected>30</option><option>45</option><option>60</option></select></label>
    <button>Book</button>
  </form>
  <p id="status" class="status" role="status"></p>
  <div class="cols">
    <ol id="day" class="day"></ol>
    <section><h2>Free start times</h2><div id="free" class="free"></div></section>
  </div>
</main>
```

```css base
body { margin: 0; font-family: system-ui, sans-serif; background: #f0fdfa; color: #134e4a; }
.wrap { max-width: 620px; margin: 0 auto; padding: 16px; }
h1 { margin-top: 0; font-size: 1.3rem; }
h2 { font-size: .95rem; margin: 0 0 6px; }
.row { display: flex; gap: 10px; align-items: end; flex-wrap: wrap; }
label { display: grid; gap: 2px; font-size: .85rem; }
input, select, button { font: inherit; padding: 6px 8px; }
.status { min-height: 1.4em; font-weight: 600; }
.status.bad { color: #b91c1c; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.day { list-style: none; padding: 0; margin: 0; font: .8rem ui-monospace, Menlo, Consolas, monospace; }
.day li { padding: 2px 6px; border-bottom: 1px solid #ccfbf1; }
.day li.busy { background: #fecaca; }
.day li.lunch { background: #e5e7eb; }
.free { display: flex; flex-wrap: wrap; gap: 4px; }
.free button { font-size: .8rem; padding: 3px 6px; }
```

```js time
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

const OPEN = toMin('08:00');
const CLOSE = toMin('17:00');
const LUNCH = { start: toMin('12:00'), end: toMin('13:00'), who: 'Lunch' };
let bookings = [
  { start: toMin('09:00'), end: toMin('09:30'), who: 'J. Gordon' },
  { start: toMin('10:00'), end: toMin('11:00'), who: 'B. Gordon' },
  { start: toMin('14:15'), end: toMin('14:45'), who: 'L. Fox' },
];

const statusEl = document.getElementById('status');

function drawDay() {
  const items = [];
  for (let t = OPEN; t < CLOSE; t += 15) {
    const busy = bookings.find((b) => t >= b.start && t < b.end);
    const lunch = t >= LUNCH.start && t < LUNCH.end;
    const li = document.createElement('li');
    li.textContent = `${toHHMM(t)} ${busy ? busy.who : lunch ? 'Lunch' : ''}`;
    li.className = busy ? 'busy' : lunch ? 'lunch' : '';
    items.push(li);
  }
  document.getElementById('day').replaceChildren(...items);
}

drawDay();
```

## Step: Refusing a double booking
time: 15

Booking a visit builds its range, `{ start, end: start + minutes }`, and checks it against **every** existing booking and the lunch break with the overlap rule:

```js
const clash = [...bookings, LUNCH].find((b) => overlaps(visit, b));
```

It also refuses visits that start before opening or **end** after closing. If anything fails, the page says exactly why ("overlaps B. Gordon 10:00–11:00"), which is far more useful than "Invalid time".

Try 9:45 for 30 minutes (it runs into 10:00), then 9:30 for 30 minutes (it fits exactly between two visits).

check: js | the overlap rule | /a\.start\s*<\s*b\.end\s*&&\s*b\.start\s*<\s*a\.end/ | const overlaps = (a, b) => a.start < b.end && b.start < a.end;
check: js | checking every booking and the break | /\[\s*\.\.\.bookings\s*,\s*LUNCH\s*\]\.find\(/ | [...bookings, LUNCH].find((b) => overlaps(visit, b))
check: js | staying inside opening hours | /visit\.end\s*>\s*CLOSE/ | if (visit.start < OPEN || visit.end > CLOSE) ...

quiz: A visit 9:30–10:00 and one 10:00–10:30. Do they overlap?
- [ ] Yes, they share 10:00
- [x] No: the first ends at 10:00 and the second starts at 10:00, and ranges don't include their end
- [ ] Only if they're with the same patient
why: 600 < 600 is false, so the rule says no overlap.

quiz: Why say which booking it clashes with?
- [x] The person can see the problem and pick a better time straight away
- [ ] It's required by law
- [ ] The overlap rule needs it
why: A specific reason turns a dead end into a quick fix.

```js overlap
const overlaps = (a, b) => a.start < b.end && b.start < a.end;

document.getElementById('book').addEventListener('submit', (e) => {
  e.preventDefault();
  const start = toMin(document.getElementById('start').value);
  const visit = { start, end: start + Number(document.getElementById('len').value), who: 'New patient' };
  statusEl.className = 'status bad';
  if (visit.start < OPEN || visit.end > CLOSE) { statusEl.textContent = `Outside opening hours (${toHHMM(OPEN)}–${toHHMM(CLOSE)}).`; return; }
  const clash = [...bookings, LUNCH].find((b) => overlaps(visit, b));
  if (clash) { statusEl.textContent = `Overlaps ${clash.who} ${toHHMM(clash.start)}–${toHHMM(clash.end)}.`; return; }
  bookings = [...bookings, visit].sort((a, b) => a.start - b.start);
  statusEl.className = 'status';
  statusEl.textContent = `Booked ${toHHMM(visit.start)}–${toHHMM(visit.end)}.`;
  drawDay();
  if (typeof drawFree === 'function') drawFree();
});
```

## Step: Every free start time
time: 15

Instead of making people guess, show every start time that works for the chosen length. `freeStarts(minutes)` walks the quarter hours and keeps a start `t` when the range `t … t + minutes` stays before closing **and** overlaps nothing:

```js
for (let t = OPEN; t + minutes <= CLOSE; t += 15) {
  const visit = { start: t, end: t + minutes };
  if ([...bookings, LUNCH].every((b) => !overlaps(visit, b))) out.push(t);
}
```

A 60-minute visit has far fewer options than a 15-minute one, and the list updates when you change the length or book something. Clicking a time fills in the form.

This is exactly the "open times" list in the Gotham Hospital System, which does the same check against the provider's schedule in SQL before saving.

```svg Free starts for a 30-minute visit: each quarter hour is tried, and kept only if the whole visit fits before closing and overlaps nothing
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 70" font-family="sans-serif" font-size="10">
  <g><rect x="5" y="20" width="30" height="20" fill="#bbf7d0"/><rect x="37" y="20" width="30" height="20" fill="#bbf7d0"/><rect x="69" y="20" width="30" height="20" fill="#fecaca"/><rect x="101" y="20" width="30" height="20" fill="#fecaca"/><rect x="133" y="20" width="30" height="20" fill="#bbf7d0"/><rect x="165" y="20" width="30" height="20" fill="#fde68a"/><rect x="197" y="20" width="30" height="20" fill="#fecaca"/></g>
  <g text-anchor="middle"><text x="20" y="34">8:00</text><text x="52" y="34">8:15</text><text x="84" y="34">9:00</text><text x="116" y="34">9:15</text><text x="148" y="34">9:30</text><text x="180" y="34">9:45</text><text x="212" y="34">10:00</text></g>
  <text x="5" y="58" fill="#475569">green: fits · red: booked · yellow: starts free but runs into 10:00</text>
</svg>
```

check: js | a freeStarts() function | /function\s+freeStarts\s*\(\s*minutes\s*\)/ | function freeStarts(minutes) { ... }
check: js | the whole visit must fit before closing | /t\s*\+\s*minutes\s*<=\s*CLOSE/ | for (let t = OPEN; t + minutes <= CLOSE; t += 15)
check: js | free only if it overlaps nothing | /\.every\(\s*\(?\s*b\s*\)?\s*=>\s*!overlaps\(/ | [...bookings, LUNCH].every((b) => !overlaps(visit, b))

quiz: Why does 9:45 not appear as a free start for a 30-minute visit?
- [ ] 9:45 is already booked
- [x] 9:45–10:15 runs into the 10:00 booking
- [ ] Visits can't start at a quarter to the hour
why: The start is free, but the visit's range overlaps the next booking.

quiz: Why is the loop condition `t + minutes <= CLOSE` and not `t < CLOSE`?
- [x] The visit has to end by closing time, not just start before it
- [ ] To make the loop shorter
- [ ] Because CLOSE is in hours
why: A 60-minute visit starting at 16:30 would run past 17:00.

```js free
function freeStarts(minutes) {
  const out = [];
  for (let t = OPEN; t + minutes <= CLOSE; t += 15) {
    const visit = { start: t, end: t + minutes };
    if ([...bookings, LUNCH].every((b) => !overlaps(visit, b))) out.push(t);
  }
  return out;
}

function drawFree() {
  const minutes = Number(document.getElementById('len').value);
  const list = freeStarts(minutes);
  document.getElementById('free').replaceChildren(...list.map((t) => {
    const b = document.createElement('button');
    b.textContent = toHHMM(t);
    b.addEventListener('click', () => { document.getElementById('start').value = toHHMM(t); });
    return b;
  }));
  if (!list.length) document.getElementById('free').textContent = 'No time left today for a visit this long.';
}

document.getElementById('len').addEventListener('change', drawFree);
drawFree();
```

## Finish

You can book time without double booking. You learned:

- **Minutes since midnight** and converting both ways
- **Half-open ranges**, where touching isn't overlapping
- The **overlap rule**: `a.start < b.end && b.start < a.end`
- Refusing bookings with a **clear reason**, inside opening hours
- **Free start times** for any visit length

### Challenges

1. Add a 10-minute cleanup gap after every visit (pad each booking's end before checking).
2. Support two providers, and show a start time as free if either one is free.
3. Store bookings in SQL and do the overlap check in a query (`WHERE start < ? AND ? < end`).

### Next

**Roles and permissions**: who is allowed to see and do what.
