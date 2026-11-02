---
id: gotham
title: Gotham Hospital System
blocks-html: page
blocks-css: base
blocks-js: data, db, auth, ui
goals: Draw a day schedule as a table of quarter hours with visits spanning rows; Design SQLite tables with foreign keys, CHECK constraints, UNIQUE and a partial unique index; Write the booking rules (hours, lunch, the clock, overlaps) and explain each refusal in plain words; Upsert insurance with ON CONFLICT, search patients safely with parameters, and report with SUM, NULLIF and GROUP BY; Sign staff in with salted PBKDF2 hashes, random session tokens and expiry; Guard every action by role with 401 and 403, then add week and month views
prereqs: HTML, CSS and JavaScript basics (functions, arrays, objects, template literals); Arrow functions, array map, filter, find and every; async and await help in session 4, and are explained there; No SQL needed: every statement is explained the first time it appears
---

## Session: A day on the schedule

## Step: Quarter hours and providers
time: 25

Welcome! In this guide you'll rebuild the core of my [Gotham Hospital System](https://github.com/TheoYanvno/gotham-hospital-system): the scheduling and records portal of a made-up clinic. Front-desk staff book visits on a provider's calendar, and the app refuses anything that breaks the clinic's rules: outside business hours, during a provider's lunch, in the past, or on top of another visit. Medical staff open patient charts. Everyone signs in with the same username, and **the password decides the role**.

I work in a clinic, so these are the rules I deal with every day. Everything in this guide is made up: four providers, six patients with fictional 555-01xx phone numbers, and an invented "today" of **Monday, November 2, 2026**, so the sample day looks the same whenever you open it.

This first step draws one day of the schedule, straight from the data, before there's any database:

```svg A day is a table: a row per quarter hour, a column per provider
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 200" font-family="sans-serif"><text x="60" y="24" font-size="11" font-weight="700">Thompkins 08:00–16:30</text><text x="180" y="24" font-size="11" font-weight="700">Santos 09:00–16:00</text><text x="14" y="49" font-size="10" fill="#5d6879">08:00</text><rect x="60" y="34" width="118" height="20" fill="#eef7f0" stroke="#d9dee6"/><rect x="180" y="34" width="118" height="20" fill="#eceff3" stroke="#d9dee6"/><text x="14" y="71" font-size="10" fill="#5d6879">08:15</text><rect x="60" y="56" width="118" height="20" fill="#eef7f0" stroke="#d9dee6"/><rect x="180" y="56" width="118" height="20" fill="#eceff3" stroke="#d9dee6"/><text x="14" y="93" font-size="10" fill="#5d6879">08:30</text><rect x="60" y="78" width="118" height="42" fill="#dbe8f7" stroke="#d9dee6"/><rect x="60" y="78" width="3" height="42" fill="#1d4e89"/><text x="68" y="94" font-size="10">Jordan Ellis</text><text x="68" y="108" font-size="9" fill="#5d6879">rowspan = 30 ÷ 15 = 2</text><rect x="180" y="78" width="118" height="20" fill="#eceff3" stroke="#d9dee6"/><text x="14" y="115" font-size="10" fill="#5d6879">08:45</text><rect x="180" y="100" width="118" height="20" fill="#eceff3" stroke="#d9dee6"/><text x="14" y="137" font-size="10" fill="#5d6879">09:00</text><rect x="60" y="122" width="118" height="20" fill="#eef7f0" stroke="#d9dee6"/><rect x="180" y="122" width="118" height="20" fill="#eef7f0" stroke="#d9dee6"/><text x="14" y="159" font-size="10" fill="#5d6879">09:15</text><rect x="60" y="144" width="118" height="20" fill="#eef7f0" stroke="#d9dee6"/><rect x="180" y="144" width="118" height="20" fill="#eef7f0" stroke="#d9dee6"/><g font-size="10"><rect x="310" y="40" width="12" height="12" fill="#eef7f0" stroke="#d9dee6"/><text x="328" y="50">open</text><rect x="310" y="60" width="12" height="12" fill="#eceff3" stroke="#d9dee6"/><text x="328" y="70">not working</text><rect x="310" y="80" width="12" height="12" fill="#fff4dc" stroke="#d9dee6"/><text x="328" y="90">lunch</text><rect x="310" y="100" width="12" height="12" fill="#dbe8f7" stroke="#d9dee6"/><text x="328" y="110">booked visit</text></g><text x="215" y="194" text-anchor="middle" font-size="11" fill="#475569">a row per quarter hour, a column per provider; a visit covers minutes ÷ 15 rows</text></svg>
```

**Times as text.** Every time is a string like `'08:30'`, and every date is `'2026-11-02'`. Because the fields are zero-padded and go from biggest to smallest (year, month, day, hour, minute), **comparing the strings compares the times**: `'09:05' < '10:00'` is true, just as the clock says. That's why the data block never needs `Date` for comparisons. When you need to do arithmetic, `toMinutes('08:30')` turns a time into minutes since midnight (510), and `toTime(510)` turns it back.

**Dates in UTC.** For "what weekday is it" and "add a day", the data block does use `Date`, but always through `Date.UTC(...)` and the `getUTC…` methods. A local date can jump an hour at a daylight-saving change, and at midnight that becomes the wrong *day*. In UTC there are no clock changes, so `addDays('2026-11-01', 1)` is always `'2026-11-02'`. (The real US clocks changed on November 1, 2026, which makes this a real trap, not a theoretical one.)

**The grid.** `drawDay()` builds an HTML table:

- one `<tr>` for each quarter hour from the clinic's opening (08:00) to its closing (17:00): 36 rows;
- one column per provider, with the header showing their specialty and hours, or *off today*;
- each cell gets a class from `cellKind()`: `closed` outside the provider's hours, `lunch` during their break, otherwise `open`. The CSS colours each kind.

`providersOn(date)` uses `weekdayOf(date)`: Diego Santos has `off: [1]` (Monday), so on Monday his column is grey all day. On a Saturday or Sunday the clinic is closed and the grid says so.

**Why a table?** A schedule *is* tabular data, rows of times and columns of people, and a table reads that way to screen readers too. In step 2 visits will fill several rows with `rowspan`.

### Try it

Change `TODAY` to `'2026-11-03'` (a Tuesday): Santos is working. Try `'2026-11-07'` (a Saturday). Then change it back.

check: js | draw the day | /function\s+drawDay\s*\(/
check: js | what each cell is for | /function\s+cellKind\s*\(/
check: js | a row every 15 minutes | /t \+= 15/
check: html | a place for the grid | /id="grid"/

quiz: Why is comparing '09:05' < '10:00' as strings correct?
- [ ] JavaScript converts them to numbers
- [x] They are zero-padded with the biggest unit first, so text order matches time order
- [ ] It isn't; it only works by luck
why: '9:05' without the zero would sort after '10:00', because '9' > '1'. Padding is what makes text order safe.
quiz: Why does the data block do date arithmetic in UTC?
- [ ] UTC is faster
- [x] Local time can shift an hour at a daylight-saving change, which at midnight lands on the wrong day; UTC never changes
- [ ] The clinic is in London
why: Dates without times are calendar days. UTC keeps them from moving.

```html page
<div id="app">
<header class="top">
  <strong>Gotham Hospital</strong> <span class="muted">Patient Portal</span>
</header>
<main>
  <section id="schedule" class="view">
    <div class="bar">
      <h2 id="title"></h2>
    </div>
    <div class="layout">
      <div id="grid" class="grid"></div>
    </div>
  </section>
</main>
</div>
<p class="note">Practice app: every person, phone number and plan here is made up.</p>
```

```css base
:root { --bg: #f4f6f8; --panel: #fff; --ink: #172033; --muted: #5d6879; --line: #d9dee6; --brand: #1d4e89; --open: #eef7f0; --busy: #dbe8f7; --closed: #eceff3; --lunch: #fff4dc; --bad: #b42318; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--bg); }
.top { display: flex; align-items: center; gap: 10px; padding: 12px 18px; background: var(--brand); color: #fff; }
.top .muted { color: #c9d6ea; }
.who { margin-left: auto; font-size: .9rem; }
.ghost { background: none; border: 1px solid var(--line); border-radius: 6px; padding: 4px 10px; cursor: pointer; color: inherit; font: inherit; }
.top .ghost { border-color: #8fa9cf; }
.tabs { display: flex; gap: 4px; padding: 8px 18px 0; background: #fff; border-bottom: 1px solid var(--line); }
.tabs button, .views button { border: 0; background: none; padding: 8px 14px; cursor: pointer; font: inherit; color: var(--muted); border-bottom: 3px solid transparent; }
.tabs button.on, .views button.on { color: var(--brand); border-bottom-color: var(--brand); font-weight: 600; }
main { padding: 14px 18px 30px; }
.bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.bar h2 { margin: 0 8px 0 0; font-size: 1.15rem; }
.views { margin-left: auto; }
.layout { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top: 10px; }
.layout.with-panel { grid-template-columns: 1fr minmax(240px, 300px); }
.grid { overflow-x: auto; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; }
table.day { border-collapse: collapse; width: 100%; min-width: 560px; font-size: .78rem; }
.day th { position: sticky; top: 0; background: #fff; padding: 6px; text-align: left; border-bottom: 1px solid var(--line); font-weight: 600; }
.day th small { display: block; color: var(--muted); font-weight: 400; }
.day td { height: 22px; border-bottom: 1px solid #f0f2f5; border-left: 1px solid #f0f2f5; padding: 0 4px; vertical-align: top; }
.day td.time { color: var(--muted); white-space: nowrap; width: 54px; }
.day td.open { background: var(--open); cursor: pointer; }
.day td.open:hover { background: #d6f0dd; }
.day td.closed { background: var(--closed); }
.day td.lunch { background: var(--lunch); }
.day td.visit { background: var(--busy); border-left: 3px solid var(--brand); cursor: pointer; }
.day td.visit.checked_in { border-left-color: #0e7a3e; }
.day td.visit.completed { opacity: .65; }
.day td.visit.no_show { border-left-color: var(--bad); background: #fde8e6; }
.day td.picked { outline: 2px solid var(--brand); outline-offset: -2px; }
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; align-self: start; }
.panel h3 { margin: 0 0 8px; font-size: 1rem; }
.panel label { display: block; margin: 8px 0 2px; font-size: .85rem; color: var(--muted); }
.panel select, .panel input, #search, .signin input { width: 100%; font: inherit; padding: 6px 8px; border: 1px solid var(--line); border-radius: 6px; }
button.primary, .signin button { margin-top: 10px; background: var(--brand); color: #fff; border: 0; border-radius: 6px; padding: 8px 14px; cursor: pointer; font: inherit; }
.problems { color: var(--bad); padding-left: 18px; margin: 6px 0; }
.ok { color: #0e7a3e; }
.statuses { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.split { display: grid; grid-template-columns: minmax(200px, 280px) 1fr; gap: 14px; margin-top: 10px; }
.results { list-style: none; margin: 0; padding: 0; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; }
.results li { padding: 8px 12px; border-bottom: 1px solid #f0f2f5; cursor: pointer; }
.results li small { display: block; color: var(--muted); }
.profile { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px 16px; min-height: 120px; }
.profile dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 12px; margin: 0; }
.profile dt { color: var(--muted); }
.profile dd { margin: 0; }
table.report { border-collapse: collapse; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; font-size: .88rem; min-width: 320px; }
.report th, .report td { padding: 6px 12px; border-bottom: 1px solid #f0f2f5; text-align: left; }
.report td.n { text-align: right; font-variant-numeric: tabular-nums; }
.week { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.week div, .month div { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 8px; }
.week strong, .month strong { display: block; }
.month { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.month div.other { opacity: .45; }
.month div.today { outline: 2px solid var(--brand); }
.signin { min-height: 100vh; display: grid; place-items: center; background: var(--brand); }
.signin .card { background: #fff; width: min(360px, 92vw); padding: 22px; border-radius: 12px; }
.signin h1 { margin: 0; font-size: 1.4rem; }
.signin label { display: block; margin-top: 10px; font-size: .9rem; color: var(--muted); }
.error { color: var(--bad); min-height: 1.2em; margin: 8px 0 0; }
.muted { color: var(--muted); }
.small { font-size: .8rem; }
.note { text-align: center; color: var(--muted); font-size: .75rem; }
@media (max-width: 720px) { .layout.with-panel, .split { grid-template-columns: 1fr; } }
```

```js data
// The demo's "today": the sample visits are booked around it, so the guide looks the same whenever you open it.
const TODAY = '2026-11-02';              // a Monday
const NOW = '2026-11-02 09:40';
const CLINIC = { opens: '08:00', closes: '17:00' };   // Monday–Friday; closed on weekends

// Four of the real app's 36 providers. hours: [start, end]; lunch: [start, end]; off: weekdays not worked (1 = Monday).
const PROVIDERS = [
  { first: 'Leslie', last: 'Thompkins', credential: 'MD', specialty: 'Family Medicine', room: '1A', hours: ['08:00', '16:30'], lunch: ['12:00', '13:00'] },
  { first: 'Samuel', last: 'Okafor', credential: 'MD', specialty: 'Internal Medicine', room: '2A', hours: ['08:00', '17:00'], lunch: ['12:30', '13:30'] },
  { first: 'Carla', last: 'Benton', credential: 'NP', specialty: 'Family Medicine', room: '1E', hours: ['08:00', '16:30'], lunch: ['12:00', '12:30'], off: [5] },
  { first: 'Diego', last: 'Santos', credential: 'PA', specialty: 'Dermatology', room: '6D', hours: ['09:00', '16:00'], lunch: ['12:00', '13:00'], off: [1] },
];

// Made-up patients (phone numbers use the fictional 555-01xx range)
const PATIENTS = [
  { mrn: 'GH-100231', first: 'Jordan', last: 'Ellis', birth: '1984-03-12', sex: 'M', phone: '555-0101', allergies: 'Penicillin',
    insurance: [{ coverage: 'primary', payer: 'Harborview Health', plan: 'PPO Gold', member: 'HVH88213', copay: 25 }] },
  { mrn: 'GH-100232', first: 'Maya', last: 'Okonjo', birth: '1991-07-30', sex: 'F', phone: '555-0102', allergies: '',
    insurance: [{ coverage: 'primary', payer: 'Northgate Mutual', plan: 'HMO Select', member: 'NGM40021', copay: 15 }] },
  { mrn: 'GH-100233', first: 'Luis', last: 'Romero', birth: '1958-11-02', sex: 'M', phone: '555-0103', allergies: 'Sulfa drugs',
    insurance: [{ coverage: 'primary', payer: 'Federal Senior Plan', plan: 'Part B', member: 'FSP90117', copay: 0 },
                { coverage: 'secondary', payer: 'Harborview Health', plan: 'Medigap F', member: 'HVH11920', copay: 0 }] },
  { mrn: 'GH-100234', first: 'Priya', last: 'Nair', birth: '2001-01-19', sex: 'F', phone: '555-0104', allergies: 'Latex',
    insurance: [{ coverage: 'primary', payer: 'Northgate Mutual', plan: 'Student Basic', member: 'NGM77310', copay: 20 }] },
  { mrn: 'GH-100235', first: 'Theo', last: 'Brandt', birth: '1976-05-08', sex: 'X', phone: '555-0105', allergies: '', insurance: [] },
  { mrn: 'GH-100236', first: 'Rosa', last: 'Delacroix', birth: '1969-09-23', sex: 'F', phone: '555-0106', allergies: 'Shellfish',
    insurance: [{ coverage: 'primary', payer: 'Harborview Health', plan: 'PPO Silver', member: 'HVH55102', copay: 30 }] },
];

// Booked visits: [patient #, provider #, starts at, minutes, visit type, reason, status]
const VISITS = [
  [0, 0, '2026-11-02 08:30', 30, 'Follow-up', 'Blood pressure check', 'completed'],
  [1, 0, '2026-11-02 09:15', 15, 'Sick visit', 'Sore throat', 'checked_in'],
  [2, 0, '2026-11-02 10:00', 45, 'Annual physical', 'Yearly physical', 'scheduled'],
  [3, 1, '2026-11-02 08:00', 30, 'New patient', 'Establish care', 'no_show'],
  [4, 1, '2026-11-02 11:00', 60, 'Procedure', 'Joint injection', 'scheduled'],
  [5, 2, '2026-11-02 14:00', 30, 'Telehealth', 'Medication review', 'scheduled'],
  [0, 2, '2026-11-03 09:00', 30, 'Follow-up', 'Lab results', 'scheduled'],
  [2, 3, '2026-11-03 10:30', 15, 'Sick visit', 'Rash', 'scheduled'],
  [5, 1, '2026-11-04 13:30', 30, 'Follow-up', 'Thyroid follow-up', 'scheduled'],
  [1, 3, '2026-11-05 15:00', 30, 'Follow-up', 'Mole check', 'scheduled'],
];

// Times are 'HH:MM' and dates 'YYYY-MM-DD', so they sort and compare correctly as plain text.
const pad = (n) => String(n).padStart(2, '0');
const toMinutes = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
const toTime = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
// Date math in UTC, so time zones and daylight saving time can't shift a day
const parseDate = (date) => { const [y, m, d] = date.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const formatDate = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const addDays = (date, days) => { const d = parseDate(date); d.setUTCDate(d.getUTCDate() + days); return formatDate(d); };
const weekdayOf = (date) => parseDate(date).getUTCDay();    // 0 = Sunday … 6 = Saturday
```

```js ui
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const LONG_DATE = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const longDate = (date) => LONG_DATE.format(parseDate(date));
const state = { date: TODAY };

// Each provider's hours on a weekday, straight from the data (null = not working)
function providersOn(date) {
  const day = weekdayOf(date);
  return PROVIDERS.map((p, i) => ({
    id: i + 1, name: `${p.first} ${p.last}, ${p.credential}`, specialty: p.specialty,
    ...((p.off ?? []).includes(day) || day === 0 || day === 6 ? {} : { starts: p.hours[0], ends: p.hours[1], lunchStarts: p.lunch[0], lunchEnds: p.lunch[1] }),
  }));
}

// What one quarter-hour cell is for one provider: closed, lunch or open
function cellKind(p, t) {
  if (!p.starts || t < toMinutes(p.starts) || t >= toMinutes(p.ends)) return 'closed';
  if (p.lunchStarts && t >= toMinutes(p.lunchStarts) && t < toMinutes(p.lunchEnds)) return 'lunch';
  return 'open';
}

/** One day: a row per quarter hour, a column per provider. A visit fills as many rows as it lasts. */
function drawDay() {
  const providers = providersOn(state.date);
  const visits = [];
  const hours = weekdayOf(state.date) % 6 === 0 ? null : CLINIC;
  $('title').textContent = longDate(state.date);
  if (!hours?.opens) { $('grid').innerHTML = '<p class="muted" style="padding:12px">The clinic is closed on weekends.</p>'; return; }
  const covered = new Set();          // cells already filled by a longer visit above
  let body = '';
  for (let t = toMinutes(hours.opens); t < toMinutes(hours.closes); t += 15) {
    body += `<tr><td class="time">${t % 60 === 0 ? toTime(t) : ''}</td>`;
    for (const p of providers) {
      const key = `${p.id}|${toTime(t)}`;
      if (covered.has(key)) continue;
      const a = visits.find((x) => x.providerId === p.id && x.starts === toTime(t));
      if (a) {
        const span = a.minutes / 15;
        for (let k = 1; k < span; k++) covered.add(`${p.id}|${toTime(t + 15 * k)}`);
        body += `<td class="visit ${a.status}" rowspan="${span}">${esc(a.patient)}<br><small>${esc(a.type)}</small></td>`;
      } else {
        const kind = cellKind(p, t);
        body += kind === 'open' ? `<td class="open"></td>` : `<td class="${kind}"></td>`;
      }
    }
    body += '</tr>';
  }
  $('grid').innerHTML = `<table class="day"><thead><tr><th></th>${providers.map((p) => `<th>${esc(p.name)}<small>${esc(p.specialty)}${p.starts ? ` · ${p.starts}–${p.ends}` : ' · off today'}</small></th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
}

drawDay();
```

## Step: The clinic in SQLite
time: 30

Arrays are fine for drawing, but a clinic needs rules that hold no matter what code touches the data: a visit must belong to a real patient, a duration can only be 15, 30, 45 or 60 minutes, a status can only be one of five words. A **database** enforces those itself. This step runs real **SQLite** in the page with [sql.js](https://sql.js.org/), SQLite compiled to WebAssembly. It loads from cdnjs in the HTML block:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
```

`initSqlJs()` downloads the WebAssembly file and gives back `SQL`; `new SQL.Database()` is an empty database in memory. It disappears on reload, which is perfect for practice.

```svg Five tables; arrows are foreign keys
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 210" font-family="sans-serif" font-size="11"><rect x="10" y="10" width="124" height="76" rx="6" fill="#fff" stroke="#1d4e89"/><rect x="10" y="10" width="124" height="18" rx="6" fill="#1d4e89"/><text x="18" y="23" fill="#fff" font-weight="700">providers</text><text x="18" y="42" font-family="monospace" font-size="9">id PK</text><text x="18" y="56" font-family="monospace" font-size="9">first_name, last_name</text><text x="18" y="70" font-family="monospace" font-size="9">credential CHECK</text><text x="18" y="84" font-family="monospace" font-size="9">specialty, room</text><rect x="10" y="112" width="124" height="76" rx="6" fill="#fff" stroke="#1d4e89"/><rect x="10" y="112" width="124" height="18" rx="6" fill="#1d4e89"/><text x="18" y="125" fill="#fff" font-weight="700">provider_hours</text><text x="18" y="144" font-family="monospace" font-size="9">provider_id → providers</text><text x="18" y="158" font-family="monospace" font-size="9">weekday 1–5</text><text x="18" y="172" font-family="monospace" font-size="9">starts, ends, lunch_…</text><text x="18" y="186" font-family="monospace" font-size="9">PK (provider_id, weekday)</text><rect x="296" y="10" width="124" height="76" rx="6" fill="#fff" stroke="#1d4e89"/><rect x="296" y="10" width="124" height="18" rx="6" fill="#1d4e89"/><text x="304" y="23" fill="#fff" font-weight="700">patients</text><text x="304" y="42" font-family="monospace" font-size="9">id PK</text><text x="304" y="56" font-family="monospace" font-size="9">mrn UNIQUE</text><text x="304" y="70" font-family="monospace" font-size="9">first_name, last_name</text><text x="304" y="84" font-family="monospace" font-size="9">birth_date, sex CHECK</text><rect x="153" y="80" width="130" height="90" rx="6" fill="#fff" stroke="#1d4e89"/><rect x="153" y="80" width="130" height="18" rx="6" fill="#1d4e89"/><text x="161" y="93" fill="#fff" font-weight="700">appointments</text><text x="161" y="112" font-family="monospace" font-size="9">patient_id → patients</text><text x="161" y="126" font-family="monospace" font-size="9">provider_id → providers</text><text x="161" y="140" font-family="monospace" font-size="9">starts_at  YYYY-MM-DD HH:MM</text><text x="161" y="154" font-family="monospace" font-size="9">duration_min CHECK</text><text x="161" y="168" font-family="monospace" font-size="9">status CHECK</text><rect x="296" y="132" width="124" height="48" rx="6" fill="#fff" stroke="#1d4e89"/><rect x="296" y="132" width="124" height="18" rx="6" fill="#1d4e89"/><text x="304" y="145" fill="#fff" font-weight="700">clinic_hours</text><text x="304" y="164" font-family="monospace" font-size="9">weekday PK</text><text x="304" y="178" font-family="monospace" font-size="9">opens, closes (NULL = closed)</text><g stroke="#64748b" stroke-width="1.5" fill="none"><path d="M134 40 C 150 40, 150 100, 153 110"/><path d="M296 40 C 285 40, 285 100, 283 110"/><path d="M70 72 L 70 112"/></g><text x="215" y="204" text-anchor="middle" fill="#475569">arrows are foreign keys: an appointment points at one patient and one provider</text></svg>
```

**The tables**, in the `SCHEMA` string:

| Table | One row per | Rules it enforces |
|---|---|---|
| `clinic_hours` | weekday (0–6) | `opens`/`closes` both set with `opens < closes`, or both `NULL` (closed) |
| `providers` | provider | `credential IN ('MD', 'DO', 'NP', 'PA')` |
| `provider_hours` | provider and weekday | weekday 1–5 only; `PRIMARY KEY (provider_id, weekday)`: one set of hours per day |
| `patients` | patient | `mrn UNIQUE`: no two patients share a medical record number |
| `appointments` | visit | foreign keys to both, `duration_min IN (15, 30, 45, 60)`, `status IN (…)` |

**Keys.** `INTEGER PRIMARY KEY AUTOINCREMENT` numbers rows 1, 2, 3… `REFERENCES patients(id)` is a **foreign key**: SQLite refuses an appointment whose `patient_id` doesn't exist, but only after `PRAGMA foreign_keys = ON`, which `build()` runs first (SQLite leaves it off by default, for old programs).

**CHECK constraints** are rules on a row. Try to save a 20-minute visit and SQLite raises `CHECK constraint failed`, even if the JavaScript forgot to check.

**Loading.** `build()` inserts everything between `BEGIN` and `COMMIT`. A transaction is all or nothing: if any insert fails, `ROLLBACK` undoes the others, so you never get half a clinic. It's also much faster: one write to disk instead of one per row.

**Parameters, always.** Every value goes in as a `?` with the values in an array: `run('INSERT INTO patients (…) VALUES (?, ?, ?, ?, ?)', [p.mrn, …])`. SQLite treats each `?` as a value, never as SQL, so a name like `O'Brien` (or something nastier) can't break the statement. You'll rely on this for search in step 5.

**Three helpers** keep the rest short: `rows(sql, params)` returns every row as an object, `one()` returns the first or `null`, and `run()` executes without results.

**The grid now reads SQL.** `providersOn()` uses a `LEFT JOIN`: every provider, plus their `provider_hours` row for that weekday *if there is one*. Santos on Monday has no row, so his hours come back `NULL`, which the grid already draws as *off today*. `visitsOn()` joins appointments to patients for the names, and `strftime('%H:%M', a.starts_at)` takes just the time.

**Visits span rows.** A 45-minute visit starting at 10:00 gets `rowspan="3"`, and the 10:15 and 10:30 cells of that column are skipped: the `covered` set remembers them.

### Try it

Six visits appear on Monday. Look at the different statuses: completed (faded), checked in (green edge), no-show (red).

check: js | create the tables | /CREATE TABLE appointments/
check: js | a rule on durations | /duration_min IN \(15, 30, 45, 60\)/
check: js | foreign keys switched on | /PRAGMA foreign_keys = ON/
check: js | load in one transaction | /run\('BEGIN'\)/
check: js | the grid draws the visits from SQL | /const visits = visitsOn\(state\.date\)/
check: html | load SQLite | /sql-wasm\.js/

quiz: What does a CHECK constraint give you that a JavaScript if does not?
- [ ] Nothing
- [x] The database refuses bad rows no matter which code tries to save them
- [ ] Faster pages
why: Validation in the UI helps people; constraints in the database protect the data.
quiz: Why do the queries use ? instead of building SQL with template literals?
- [ ] It looks neater
- [x] Values passed as parameters are never run as SQL, so quotes or tricks in the data can't change the statement
- [ ] SQLite requires it
why: This is what stops SQL injection.

```html page
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
<div id="app">
<header class="top">
  <strong>Gotham Hospital</strong> <span class="muted">Patient Portal</span>
</header>
<main>
  <section id="schedule" class="view">
    <div class="bar">
      <h2 id="title"></h2>
    </div>
    <div class="layout">
      <div id="grid" class="grid"></div>
    </div>
  </section>
</main>
</div>
<p class="note">Practice app: every person, phone number and plan here is made up.</p>
```

```js db
// SQLite compiled to WebAssembly (sql.js): a real database inside the page
const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
let db;

const SCHEMA = `
-- Business hours by weekday (0 = Sunday … 6 = Saturday). NULL means closed.
CREATE TABLE clinic_hours (
  weekday INTEGER PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  opens   TEXT,
  closes  TEXT,
  CHECK ((opens IS NULL AND closes IS NULL) OR opens < closes)
);
CREATE TABLE providers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  credential TEXT NOT NULL CHECK (credential IN ('MD', 'DO', 'NP', 'PA')),
  specialty  TEXT NOT NULL,
  room       TEXT
);
-- Each provider's hours on the days they work (Monday–Friday only)
CREATE TABLE provider_hours (
  provider_id  INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  weekday      INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 5),
  starts       TEXT NOT NULL,
  ends         TEXT NOT NULL,
  lunch_starts TEXT,
  lunch_ends   TEXT,
  PRIMARY KEY (provider_id, weekday),
  CHECK (starts < ends)
);
CREATE TABLE patients (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  mrn         TEXT NOT NULL UNIQUE,            -- medical record number, e.g. GH-100231
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  birth_date  TEXT NOT NULL,                   -- YYYY-MM-DD
  sex         TEXT NOT NULL CHECK (sex IN ('F', 'M', 'X'))
);
CREATE TABLE appointments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id  INTEGER NOT NULL REFERENCES providers(id),
  starts_at    TEXT NOT NULL,                  -- YYYY-MM-DD HH:MM
  duration_min INTEGER NOT NULL DEFAULT 30 CHECK (duration_min IN (15, 30, 45, 60)),
  visit_type   TEXT NOT NULL CHECK (visit_type IN ('New patient', 'Follow-up', 'Annual physical', 'Sick visit', 'Procedure', 'Telehealth')),
  reason       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'scheduled'
               CHECK (status IN ('scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'))
);
`;

// Run a query with ? parameters and get rows back as plain objects
function rows(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const out = [];
  while (stmt.step()) out.push(stmt.getAsObject());
  stmt.free();
  return out;
}
const one = (sql, params = []) => rows(sql, params)[0] ?? null;
const run = (sql, params = []) => db.run(sql, params);
const lastId = () => one('SELECT last_insert_rowid() AS id').id;

// Create the tables and load the sample data in one transaction
function build() {
  run('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  run('BEGIN');
  try {
    for (let day = 0; day <= 6; day++) {
      const open = day >= 1 && day <= 5;
      run('INSERT INTO clinic_hours (weekday, opens, closes) VALUES (?, ?, ?)', [day, open ? CLINIC.opens : null, open ? CLINIC.closes : null]);
    }
    PROVIDERS.forEach((p) => {
      run('INSERT INTO providers (first_name, last_name, credential, specialty, room) VALUES (?, ?, ?, ?, ?)', [p.first, p.last, p.credential, p.specialty, p.room]);
      const id = lastId();
      for (let day = 1; day <= 5; day++) {
        if ((p.off ?? []).includes(day)) continue;
        run('INSERT INTO provider_hours VALUES (?, ?, ?, ?, ?, ?)', [id, day, p.hours[0], p.hours[1], p.lunch[0], p.lunch[1]]);
      }
    });
    for (const p of PATIENTS) {
      run('INSERT INTO patients (mrn, first_name, last_name, birth_date, sex) VALUES (?, ?, ?, ?, ?)', [p.mrn, p.first, p.last, p.birth, p.sex]);
    }
    for (const [patient, provider, startsAt, minutes, type, reason, status] of VISITS) {
      run('INSERT INTO appointments (patient_id, provider_id, starts_at, duration_min, visit_type, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [patient + 1, provider + 1, startsAt, minutes, type, reason, status]);
    }
    run('COMMIT');
  } catch (err) {
    run('ROLLBACK');
    throw err;
  }
}

// ---------- Schedule ----------

/** The providers, with their hours on one weekday (null hours = not working that day) */
function providersOn(date) {
  return rows(`SELECT p.id, p.first_name || ' ' || p.last_name || ', ' || p.credential AS name, p.specialty,
                      h.starts, h.ends, h.lunch_starts AS lunchStarts, h.lunch_ends AS lunchEnds
               FROM providers p LEFT JOIN provider_hours h ON h.provider_id = p.id AND h.weekday = ?
               ORDER BY p.id`, [weekdayOf(date)]);
}

/** Every visit on one day, with the patient's name */
function visitsOn(date) {
  return rows(`SELECT a.id, a.provider_id AS providerId, a.patient_id AS patientId, strftime('%H:%M', a.starts_at) AS starts,
                      a.duration_min AS minutes, a.visit_type AS type, a.reason, a.status,
                      pa.first_name || ' ' || pa.last_name AS patient
               FROM appointments a JOIN patients pa ON pa.id = a.patient_id
               WHERE date(a.starts_at) = ? AND a.status <> 'cancelled'
               ORDER BY a.starts_at`, [date]);
}

const clinicHours = (date) => one('SELECT opens, closes FROM clinic_hours WHERE weekday = ?', [weekdayOf(date)]);
```

```js ui
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const LONG_DATE = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const longDate = (date) => LONG_DATE.format(parseDate(date));
const state = { date: TODAY };

// What one quarter-hour cell is for one provider: closed, lunch or open
function cellKind(p, t) {
  if (!p.starts || t < toMinutes(p.starts) || t >= toMinutes(p.ends)) return 'closed';
  if (p.lunchStarts && t >= toMinutes(p.lunchStarts) && t < toMinutes(p.lunchEnds)) return 'lunch';
  return 'open';
}

/** One day: a row per quarter hour, a column per provider. A visit fills as many rows as it lasts. */
function drawDay() {
  const providers = providersOn(state.date);
  const visits = visitsOn(state.date);
  const hours = clinicHours(state.date);
  $('title').textContent = longDate(state.date);
  if (!hours?.opens) { $('grid').innerHTML = '<p class="muted" style="padding:12px">The clinic is closed on weekends.</p>'; return; }
  const covered = new Set();          // cells already filled by a longer visit above
  let body = '';
  for (let t = toMinutes(hours.opens); t < toMinutes(hours.closes); t += 15) {
    body += `<tr><td class="time">${t % 60 === 0 ? toTime(t) : ''}</td>`;
    for (const p of providers) {
      const key = `${p.id}|${toTime(t)}`;
      if (covered.has(key)) continue;
      const a = visits.find((x) => x.providerId === p.id && x.starts === toTime(t));
      if (a) {
        const span = a.minutes / 15;
        for (let k = 1; k < span; k++) covered.add(`${p.id}|${toTime(t + 15 * k)}`);
        body += `<td class="visit ${a.status}" rowspan="${span}">${esc(a.patient)}<br><small>${esc(a.type)}</small></td>`;
      } else {
        const kind = cellKind(p, t);
        body += kind === 'open' ? `<td class="open"></td>` : `<td class="${kind}"></td>`;
      }
    }
    body += '</tr>';
  }
  $('grid').innerHTML = `<table class="day"><thead><tr><th></th>${providers.map((p) => `<th>${esc(p.name)}<small>${esc(p.specialty)}${p.starts ? ` · ${p.starts}–${p.ends}` : ' · off today'}</small></th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
}

// Load SQLite, build the database, then draw the page
initSqlJs({ locateFile: (file) => SQLJS + file })
  .then((SQL) => {
    db = new SQL.Database();
    build();
    drawDay();
  })
  .catch((err) => {
    document.body.insertAdjacentHTML('afterbegin', `<p class="error" style="padding:12px">Couldn't start the database: ${esc(err.message)}</p>`);
    console.error(err);
  });
```

## Session: Booking rules

## Step: Can this visit be booked?
time: 30

The heart of the app is one function: `bookingProblems({ patientId, providerId, startsAt, duration })`. It returns a list of reasons, in plain words, why a visit can't be booked. An **empty list** means yes. Returning reasons instead of `true`/`false` means the front desk sees *why*: "Overlaps the provider's lunch break (12:00–13:00)" is something a person can act on.

The checks, in order:

1. **Weekend?** `clinic_hours` for that weekday has `NULL` hours: stop with one message.
2. **Business hours.** The visit must start at or after opening and *end* by closing. Ending matters: a 60-minute visit at 16:30 runs past 17:00.
3. **The provider's day.** No `provider_hours` row means they don't work that day. Otherwise the visit must fit inside their hours.
4. **Lunch.** Same rule as overlaps, below, against the lunch break.
5. **The clock.** `startsAt < now` compares two `'YYYY-MM-DD HH:MM'` strings: that works for the same reason as in step 1.
6. **Overlaps**, for the provider and for the patient.

```svg Two time ranges overlap when each starts before the other ends
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 200" font-family="sans-serif"><line x1="40" y1="30" x2="40" y2="160" stroke="#e2e8f0"/><text x="40" y="24" text-anchor="middle" font-size="10" fill="#5d6879">10:00</text><line x1="100" y1="30" x2="100" y2="160" stroke="#e2e8f0"/><text x="100" y="24" text-anchor="middle" font-size="10" fill="#5d6879">10:15</text><line x1="160" y1="30" x2="160" y2="160" stroke="#e2e8f0"/><text x="160" y="24" text-anchor="middle" font-size="10" fill="#5d6879">10:30</text><line x1="220" y1="30" x2="220" y2="160" stroke="#e2e8f0"/><text x="220" y="24" text-anchor="middle" font-size="10" fill="#5d6879">10:45</text><line x1="280" y1="30" x2="280" y2="160" stroke="#e2e8f0"/><text x="280" y="24" text-anchor="middle" font-size="10" fill="#5d6879">11:00</text><line x1="340" y1="30" x2="340" y2="160" stroke="#e2e8f0"/><text x="340" y="24" text-anchor="middle" font-size="10" fill="#5d6879">11:15</text><rect x="40" y="40" width="180" height="20" rx="4" fill="#1d4e89"/><text x="46" y="54" font-size="10" fill="#fff">booked: 10:00, 45 min → ends 10:45</text><rect x="100" y="72" width="120" height="20" rx="4" fill="#b42318"/><text x="106" y="86" font-size="10" fill="#fff">new 10:15–10:45: overlaps</text><rect x="220" y="104" width="120" height="20" rx="4" fill="#0e7a3e"/><text x="226" y="118" font-size="10" fill="#fff">new 10:45–11:15: OK</text><rect x="10" y="136" width="30" height="20" rx="4" fill="#0e7a3e"/><text x="16" y="150" font-size="10" fill="#fff"></text><text x="46" y="150" font-size="10" fill="#0e7a3e">a visit ending at 10:00 is OK too</text><text x="215" y="182" text-anchor="middle" font-size="11" fill="#475569">overlap ⇔ existing.start &lt; new.end AND existing.end &gt; new.start</text><text x="215" y="196" text-anchor="middle" font-size="10" fill="#475569">touching ends don't count, because both comparisons are strict</text></svg>
```

**The overlap rule** is worth memorizing: two ranges overlap exactly when **A starts before B ends AND A ends after B starts**. Both comparisons are strict, so a visit ending at 10:00 and one starting at 10:00 don't overlap. People often write four cases (starts inside, ends inside, covers, is covered); this one line covers all of them.

In SQL the table stores the start and the duration, not the end, so the query computes each visit's end:

```sql
strftime('%Y-%m-%d %H:%M', starts_at, '+' || duration_min || ' minutes') > ?
```

`strftime` with a modifier like `'+45 minutes'` does date arithmetic; `||` joins text. Cancelled visits are left out with `status <> 'cancelled'`, so a cancelled slot frees up.

The `clash` helper builds the same query for `provider_id` or `patient_id`. The column name is pasted into the SQL, but it's one of two fixed words written in the code, never user input. The values are still `?`.

**The panel.** Click an open cell and the side panel shows the problems for a 30-minute visit there. Notice `that time has already passed` on the morning cells: "now" is 09:40 in the demo.

### Try it

Click 10:15 under Thompkins (overlap with the 10:00 physical), 12:15 (lunch), 16:15 (a 30-minute visit would run past 16:30) and a Santos cell.

check: js | the booking rules | /function\s+bookingProblems\s*\(/
check: js | the end of each booked visit | /'\+' \|\| duration_min \|\| ' minutes'/
check: js | cancelled visits don't block | /status <> 'cancelled' AND date\(starts_at\)/
check: js | show the problems in the panel | /function\s+drawPanel\s*\(/

quiz: A visit is booked 10:00–10:45. Does a new one at 10:45 overlap it?
- [ ] Yes
- [x] No: 10:00 < 11:00 is true, but 10:45 > 10:45 is false, so the rule says no overlap
- [ ] Only if it is 45 minutes long
why: Strict comparisons let visits sit back to back.
quiz: Why return a list of problems instead of true or false?
- [ ] Lists are faster
- [x] Staff need to know why a time is refused to pick a better one, and there can be several reasons
- [ ] SQLite needs a list
why: Good error messages are part of the feature.

```html page
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
<div id="app">
<header class="top">
  <strong>Gotham Hospital</strong> <span class="muted">Patient Portal</span>
</header>
<main>
  <section id="schedule" class="view">
    <div class="bar">
      <h2 id="title"></h2>
    </div>
    <div class="layout">
      <div id="grid" class="grid"></div>
    <aside id="panel" class="panel" hidden></aside>
    </div>
  </section>
</main>
</div>
<p class="note">Practice app: every person, phone number and plan here is made up.</p>
```

```js db
// SQLite compiled to WebAssembly (sql.js): a real database inside the page
const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
let db;

const SCHEMA = `
-- Business hours by weekday (0 = Sunday … 6 = Saturday). NULL means closed.
CREATE TABLE clinic_hours (
  weekday INTEGER PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  opens   TEXT,
  closes  TEXT,
  CHECK ((opens IS NULL AND closes IS NULL) OR opens < closes)
);
CREATE TABLE providers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  credential TEXT NOT NULL CHECK (credential IN ('MD', 'DO', 'NP', 'PA')),
  specialty  TEXT NOT NULL,
  room       TEXT
);
-- Each provider's hours on the days they work (Monday–Friday only)
CREATE TABLE provider_hours (
  provider_id  INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  weekday      INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 5),
  starts       TEXT NOT NULL,
  ends         TEXT NOT NULL,
  lunch_starts TEXT,
  lunch_ends   TEXT,
  PRIMARY KEY (provider_id, weekday),
  CHECK (starts < ends)
);
CREATE TABLE patients (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  mrn         TEXT NOT NULL UNIQUE,            -- medical record number, e.g. GH-100231
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  birth_date  TEXT NOT NULL,                   -- YYYY-MM-DD
  sex         TEXT NOT NULL CHECK (sex IN ('F', 'M', 'X'))
);
CREATE TABLE appointments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id  INTEGER NOT NULL REFERENCES providers(id),
  starts_at    TEXT NOT NULL,                  -- YYYY-MM-DD HH:MM
  duration_min INTEGER NOT NULL DEFAULT 30 CHECK (duration_min IN (15, 30, 45, 60)),
  visit_type   TEXT NOT NULL CHECK (visit_type IN ('New patient', 'Follow-up', 'Annual physical', 'Sick visit', 'Procedure', 'Telehealth')),
  reason       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'scheduled'
               CHECK (status IN ('scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'))
);
`;

// Run a query with ? parameters and get rows back as plain objects
function rows(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const out = [];
  while (stmt.step()) out.push(stmt.getAsObject());
  stmt.free();
  return out;
}
const one = (sql, params = []) => rows(sql, params)[0] ?? null;
const run = (sql, params = []) => db.run(sql, params);
const lastId = () => one('SELECT last_insert_rowid() AS id').id;

// Create the tables and load the sample data in one transaction
function build() {
  run('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  run('BEGIN');
  try {
    for (let day = 0; day <= 6; day++) {
      const open = day >= 1 && day <= 5;
      run('INSERT INTO clinic_hours (weekday, opens, closes) VALUES (?, ?, ?)', [day, open ? CLINIC.opens : null, open ? CLINIC.closes : null]);
    }
    PROVIDERS.forEach((p) => {
      run('INSERT INTO providers (first_name, last_name, credential, specialty, room) VALUES (?, ?, ?, ?, ?)', [p.first, p.last, p.credential, p.specialty, p.room]);
      const id = lastId();
      for (let day = 1; day <= 5; day++) {
        if ((p.off ?? []).includes(day)) continue;
        run('INSERT INTO provider_hours VALUES (?, ?, ?, ?, ?, ?)', [id, day, p.hours[0], p.hours[1], p.lunch[0], p.lunch[1]]);
      }
    });
    for (const p of PATIENTS) {
      run('INSERT INTO patients (mrn, first_name, last_name, birth_date, sex) VALUES (?, ?, ?, ?, ?)', [p.mrn, p.first, p.last, p.birth, p.sex]);
    }
    for (const [patient, provider, startsAt, minutes, type, reason, status] of VISITS) {
      run('INSERT INTO appointments (patient_id, provider_id, starts_at, duration_min, visit_type, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [patient + 1, provider + 1, startsAt, minutes, type, reason, status]);
    }
    run('COMMIT');
  } catch (err) {
    run('ROLLBACK');
    throw err;
  }
}

// ---------- Schedule ----------

/** The providers, with their hours on one weekday (null hours = not working that day) */
function providersOn(date) {
  return rows(`SELECT p.id, p.first_name || ' ' || p.last_name || ', ' || p.credential AS name, p.specialty,
                      h.starts, h.ends, h.lunch_starts AS lunchStarts, h.lunch_ends AS lunchEnds
               FROM providers p LEFT JOIN provider_hours h ON h.provider_id = p.id AND h.weekday = ?
               ORDER BY p.id`, [weekdayOf(date)]);
}

/** Every visit on one day, with the patient's name */
function visitsOn(date) {
  return rows(`SELECT a.id, a.provider_id AS providerId, a.patient_id AS patientId, strftime('%H:%M', a.starts_at) AS starts,
                      a.duration_min AS minutes, a.visit_type AS type, a.reason, a.status,
                      pa.first_name || ' ' || pa.last_name AS patient
               FROM appointments a JOIN patients pa ON pa.id = a.patient_id
               WHERE date(a.starts_at) = ? AND a.status <> 'cancelled'
               ORDER BY a.starts_at`, [date]);
}

const clinicHours = (date) => one('SELECT opens, closes FROM clinic_hours WHERE weekday = ?', [weekdayOf(date)]);

/**
 * Reasons a visit can't be booked, in plain words. An empty list means it can be booked.
 * Checks clinic hours, the provider's hours and lunch, the clock, and overlaps for the provider and the patient.
 */
function bookingProblems({ patientId = null, providerId, startsAt, duration = 30 }, now = NOW) {
  const [date, time] = startsAt.split(' ');
  const start = toMinutes(time);
  const end = start + duration;
  const problems = [];

  const clinic = clinicHours(date);
  if (!clinic?.opens) return ['The clinic is closed on weekends. Business hours are Monday–Friday.'];
  if (start < toMinutes(clinic.opens) || end > toMinutes(clinic.closes)) problems.push(`Outside business hours (${clinic.opens}–${clinic.closes}).`);

  const hours = one('SELECT starts, ends, lunch_starts AS lunchStarts, lunch_ends AS lunchEnds FROM provider_hours WHERE provider_id = ? AND weekday = ?',
    [providerId, weekdayOf(date)]);
  if (!hours) return [...problems, 'This provider does not work on that day.'];
  if (start < toMinutes(hours.starts) || end > toMinutes(hours.ends)) problems.push(`Outside this provider's hours (${hours.starts}–${hours.ends}).`);
  if (hours.lunchStarts && start < toMinutes(hours.lunchEnds) && end > toMinutes(hours.lunchStarts)) {
    problems.push(`Overlaps the provider's lunch break (${hours.lunchStarts}–${hours.lunchEnds}).`);
  }
  if (startsAt < now) problems.push('That time has already passed.');

  // Two visits overlap when one starts before the other ends AND ends after the other starts
  const endsAt = `${date} ${toTime(end)}`;
  const clash = (column, id) => one(`
    SELECT strftime('%H:%M', starts_at) AS starts FROM appointments
    WHERE ${column} = ? AND status <> 'cancelled' AND date(starts_at) = ?
      AND starts_at < ?
      AND strftime('%Y-%m-%d %H:%M', starts_at, '+' || duration_min || ' minutes') > ?
    LIMIT 1`, [id, date, endsAt, startsAt]);
  const theirs = clash('provider_id', providerId);
  if (theirs) problems.push(`The provider already has a visit at ${theirs.starts}.`);
  if (patientId) {
    const mine = clash('patient_id', patientId);
    if (mine) problems.push(`The patient already has a visit at ${mine.starts}.`);
  }
  return problems;
}
```

```js ui
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const LONG_DATE = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const longDate = (date) => LONG_DATE.format(parseDate(date));
const state = { date: TODAY, picked: null };

// What one quarter-hour cell is for one provider: closed, lunch or open
function cellKind(p, t) {
  if (!p.starts || t < toMinutes(p.starts) || t >= toMinutes(p.ends)) return 'closed';
  if (p.lunchStarts && t >= toMinutes(p.lunchStarts) && t < toMinutes(p.lunchEnds)) return 'lunch';
  return 'open';
}

/** One day: a row per quarter hour, a column per provider. A visit fills as many rows as it lasts. */
function drawDay() {
  const providers = providersOn(state.date);
  const visits = visitsOn(state.date);
  const hours = clinicHours(state.date);
  $('title').textContent = longDate(state.date);
  if (!hours?.opens) { $('grid').innerHTML = '<p class="muted" style="padding:12px">The clinic is closed on weekends.</p>'; return; }
  const covered = new Set();          // cells already filled by a longer visit above
  let body = '';
  for (let t = toMinutes(hours.opens); t < toMinutes(hours.closes); t += 15) {
    body += `<tr><td class="time">${t % 60 === 0 ? toTime(t) : ''}</td>`;
    for (const p of providers) {
      const key = `${p.id}|${toTime(t)}`;
      if (covered.has(key)) continue;
      const a = visits.find((x) => x.providerId === p.id && x.starts === toTime(t));
      if (a) {
        const span = a.minutes / 15;
        for (let k = 1; k < span; k++) covered.add(`${p.id}|${toTime(t + 15 * k)}`);
        body += `<td class="visit ${a.status}" rowspan="${span}">${esc(a.patient)}<br><small>${esc(a.type)}</small></td>`;
      } else {
        const kind = cellKind(p, t);
        body += kind === 'open' ? `<td class="open" data-slot="${key}"></td>` : `<td class="${kind}"></td>`;
      }
    }
    body += '</tr>';
  }
  $('grid').innerHTML = `<table class="day"><thead><tr><th></th>${providers.map((p) => `<th>${esc(p.name)}<small>${esc(p.specialty)}${p.starts ? ` · ${p.starts}–${p.ends}` : ' · off today'}</small></th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
  if (state.picked) $('grid').querySelector(`[data-slot="${state.picked}"]`)?.classList.add('picked');
}

/** Clicking an open cell shows whether a 30-minute visit could be booked there, and why not */
function drawPanel() {
  const panel = $('panel');
  $('grid').parentElement.classList.toggle('with-panel', Boolean(state.picked));
  panel.hidden = !state.picked;
  if (!state.picked) return;
  const [providerId, time] = state.picked.split('|');
  const startsAt = `${state.date} ${time}`;
  const problems = bookingProblems({ providerId: Number(providerId), startsAt, duration: 30 });
  panel.innerHTML = `<h3>${time}, 30 minutes</h3>` + (problems.length
    ? `<ul class="problems">${problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`
    : '<p class="ok">Open: this visit can be booked.</p>');
}

$('grid').addEventListener('click', (e) => {
  const cell = e.target.closest('[data-slot]');
  if (!cell) return;
  state.picked = state.picked === cell.dataset.slot ? null : cell.dataset.slot;
  drawDay();
  drawPanel();
});

// Load SQLite, build the database, then draw the page
initSqlJs({ locateFile: (file) => SQLJS + file })
  .then((SQL) => {
    db = new SQL.Database();
    build();
    drawDay();
  })
  .catch((err) => {
    document.body.insertAdjacentHTML('afterbegin', `<p class="error" style="padding:12px">Couldn't start the database: ${esc(err.message)}</p>`);
    console.error(err);
  });
```

## Step: Booking, open times and double booking
time: 35

Now the panel books. Pick a patient, a length, a visit type and a reason; the problems update as you change the patient or length, and **Book visit** saves it.

**`openSlots(providerId, date, duration)`** lists every start time that would work, in 15-minute steps. It collects the provider's busy ranges (visits plus lunch) and keeps each candidate `t` where, for every busy range, the visit ends before it starts *or* starts after it ends: `t + duration <= s || t >= e`. That's the overlap rule turned around. The panel shows the next few as "Other open times".

**`book(visit)`** runs `bookingProblems()` first, then inserts. But the JavaScript check isn't the last line of defense:

```svg A partial unique index refuses double booking, but ignores cancelled visits
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 160" font-family="sans-serif"><text x="10" y="18" font-size="10" font-family="monospace">UNIQUE (provider_id, starts_at) WHERE status &lt;&gt; 'cancelled'</text><rect x="10" y="30" width="270" height="28" rx="5" fill="#f1f5f9" stroke="#d9dee6"/><text x="20" y="48" font-size="11">#1  Thompkins  10:00  cancelled</text><text x="292" y="48" font-size="11">not in the index</text><rect x="10" y="64" width="270" height="28" rx="5" fill="#dcfce7" stroke="#d9dee6"/><text x="20" y="82" font-size="11">#2  Thompkins  10:00  scheduled</text><text x="292" y="82" font-size="11">in the index</text><rect x="10" y="98" width="270" height="28" rx="5" fill="#fee2e2" stroke="#d9dee6"/><text x="20" y="116" font-size="11">#3  Thompkins  10:00  scheduled</text><text x="292" y="116" font-size="11">second one: refused</text><text x="215" y="150" text-anchor="middle" font-size="11" fill="#475569">the database itself refuses double booking, even if the JavaScript check is skipped</text></svg>
```

```sql
CREATE UNIQUE INDEX uq_provider_start ON appointments(provider_id, starts_at) WHERE status <> 'cancelled';
```

A **unique index** refuses a second row with the same provider and start time. The `WHERE` makes it **partial**: only rows that aren't cancelled are in the index, so cancelling a 10:00 visit lets someone else take 10:00. This is the same index the real project uses. If two front-desk tabs booked the same slot at the same moment, both JavaScript checks could pass, but the database would let only one insert succeed.

**`friendly(err)`** turns SQLite's messages into sentences: `UNIQUE constraint failed: … uq_provider_start` becomes "That provider already has an appointment at that time." The raw message is fine for a developer and useless at a front desk.

**Status buttons.** Click a booked visit to see it, then Check in, Complete, No-show or Cancel. `setStatus()` checks the word against `STATUSES` before the `UPDATE` (and the CHECK constraint would refuse it anyway). A cancelled visit disappears from the grid and its slot opens.

### Try it

Book Theo Brandt with Thompkins at 14:00 for 60 minutes. Then click the 14:30 cell under Thompkins: refused. Cancel the 10:00 physical and book 10:00 again.

check: js | list the open times | /function\s+openSlots\s*\(/
check: js | a partial unique index | /WHERE status <> 'cancelled';/
check: js | readable database errors | /function\s+friendly\s*\(/
check: js | save a visit | /function\s+book\s*\(/
check: js | change a visit's status | /function\s+setStatus\s*\(/

quiz: Why add the unique index when bookingProblems() already checks overlaps?
- [ ] It is required by SQLite
- [x] Two requests can pass the JavaScript check at the same moment; the database lets only one of them in
- [ ] It makes searching slower
why: Check in the code for good messages, and in the database for guarantees.
quiz: What does WHERE status <> 'cancelled' do on the index?
- [ ] Deletes cancelled visits
- [x] Leaves cancelled visits out of the index, so their time can be booked again
- [ ] Nothing
why: That makes it a partial index.

```html page
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
<div id="app">
<header class="top">
  <strong>Gotham Hospital</strong> <span class="muted">Patient Portal</span>
</header>
<main>
  <section id="schedule" class="view">
    <div class="bar">
      <h2 id="title"></h2>
    </div>
    <div class="layout">
      <div id="grid" class="grid"></div>
    <aside id="panel" class="panel" hidden></aside>
    </div>
  </section>
</main>
</div>
<p class="note">Practice app: every person, phone number and plan here is made up.</p>
```

```js db
// SQLite compiled to WebAssembly (sql.js): a real database inside the page
const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
let db;

const SCHEMA = `
-- Business hours by weekday (0 = Sunday … 6 = Saturday). NULL means closed.
CREATE TABLE clinic_hours (
  weekday INTEGER PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  opens   TEXT,
  closes  TEXT,
  CHECK ((opens IS NULL AND closes IS NULL) OR opens < closes)
);
CREATE TABLE providers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  credential TEXT NOT NULL CHECK (credential IN ('MD', 'DO', 'NP', 'PA')),
  specialty  TEXT NOT NULL,
  room       TEXT
);
-- Each provider's hours on the days they work (Monday–Friday only)
CREATE TABLE provider_hours (
  provider_id  INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  weekday      INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 5),
  starts       TEXT NOT NULL,
  ends         TEXT NOT NULL,
  lunch_starts TEXT,
  lunch_ends   TEXT,
  PRIMARY KEY (provider_id, weekday),
  CHECK (starts < ends)
);
CREATE TABLE patients (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  mrn         TEXT NOT NULL UNIQUE,            -- medical record number, e.g. GH-100231
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  birth_date  TEXT NOT NULL,                   -- YYYY-MM-DD
  sex         TEXT NOT NULL CHECK (sex IN ('F', 'M', 'X'))
);
CREATE TABLE appointments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id  INTEGER NOT NULL REFERENCES providers(id),
  starts_at    TEXT NOT NULL,                  -- YYYY-MM-DD HH:MM
  duration_min INTEGER NOT NULL DEFAULT 30 CHECK (duration_min IN (15, 30, 45, 60)),
  visit_type   TEXT NOT NULL CHECK (visit_type IN ('New patient', 'Follow-up', 'Annual physical', 'Sick visit', 'Procedure', 'Telehealth')),
  reason       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'scheduled'
               CHECK (status IN ('scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'))
);
-- A provider can't have two active visits starting at the same time.
-- Partial index: cancelled visits don't count, so a cancelled slot can be booked again.
CREATE UNIQUE INDEX uq_provider_start ON appointments(provider_id, starts_at) WHERE status <> 'cancelled';
`;

// Run a query with ? parameters and get rows back as plain objects
function rows(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const out = [];
  while (stmt.step()) out.push(stmt.getAsObject());
  stmt.free();
  return out;
}
const one = (sql, params = []) => rows(sql, params)[0] ?? null;
const run = (sql, params = []) => db.run(sql, params);
const lastId = () => one('SELECT last_insert_rowid() AS id').id;

// Create the tables and load the sample data in one transaction
function build() {
  run('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  run('BEGIN');
  try {
    for (let day = 0; day <= 6; day++) {
      const open = day >= 1 && day <= 5;
      run('INSERT INTO clinic_hours (weekday, opens, closes) VALUES (?, ?, ?)', [day, open ? CLINIC.opens : null, open ? CLINIC.closes : null]);
    }
    PROVIDERS.forEach((p) => {
      run('INSERT INTO providers (first_name, last_name, credential, specialty, room) VALUES (?, ?, ?, ?, ?)', [p.first, p.last, p.credential, p.specialty, p.room]);
      const id = lastId();
      for (let day = 1; day <= 5; day++) {
        if ((p.off ?? []).includes(day)) continue;
        run('INSERT INTO provider_hours VALUES (?, ?, ?, ?, ?, ?)', [id, day, p.hours[0], p.hours[1], p.lunch[0], p.lunch[1]]);
      }
    });
    for (const p of PATIENTS) {
      run('INSERT INTO patients (mrn, first_name, last_name, birth_date, sex) VALUES (?, ?, ?, ?, ?)', [p.mrn, p.first, p.last, p.birth, p.sex]);
    }
    for (const [patient, provider, startsAt, minutes, type, reason, status] of VISITS) {
      run('INSERT INTO appointments (patient_id, provider_id, starts_at, duration_min, visit_type, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [patient + 1, provider + 1, startsAt, minutes, type, reason, status]);
    }
    run('COMMIT');
  } catch (err) {
    run('ROLLBACK');
    throw err;
  }
}

// ---------- Schedule ----------

/** The providers, with their hours on one weekday (null hours = not working that day) */
function providersOn(date) {
  return rows(`SELECT p.id, p.first_name || ' ' || p.last_name || ', ' || p.credential AS name, p.specialty,
                      h.starts, h.ends, h.lunch_starts AS lunchStarts, h.lunch_ends AS lunchEnds
               FROM providers p LEFT JOIN provider_hours h ON h.provider_id = p.id AND h.weekday = ?
               ORDER BY p.id`, [weekdayOf(date)]);
}

/** Every visit on one day, with the patient's name */
function visitsOn(date) {
  return rows(`SELECT a.id, a.provider_id AS providerId, a.patient_id AS patientId, strftime('%H:%M', a.starts_at) AS starts,
                      a.duration_min AS minutes, a.visit_type AS type, a.reason, a.status,
                      pa.first_name || ' ' || pa.last_name AS patient
               FROM appointments a JOIN patients pa ON pa.id = a.patient_id
               WHERE date(a.starts_at) = ? AND a.status <> 'cancelled'
               ORDER BY a.starts_at`, [date]);
}

const clinicHours = (date) => one('SELECT opens, closes FROM clinic_hours WHERE weekday = ?', [weekdayOf(date)]);

/**
 * Reasons a visit can't be booked, in plain words. An empty list means it can be booked.
 * Checks clinic hours, the provider's hours and lunch, the clock, and overlaps for the provider and the patient.
 */
function bookingProblems({ patientId = null, providerId, startsAt, duration = 30 }, now = NOW) {
  const [date, time] = startsAt.split(' ');
  const start = toMinutes(time);
  const end = start + duration;
  const problems = [];

  const clinic = clinicHours(date);
  if (!clinic?.opens) return ['The clinic is closed on weekends. Business hours are Monday–Friday.'];
  if (start < toMinutes(clinic.opens) || end > toMinutes(clinic.closes)) problems.push(`Outside business hours (${clinic.opens}–${clinic.closes}).`);

  const hours = one('SELECT starts, ends, lunch_starts AS lunchStarts, lunch_ends AS lunchEnds FROM provider_hours WHERE provider_id = ? AND weekday = ?',
    [providerId, weekdayOf(date)]);
  if (!hours) return [...problems, 'This provider does not work on that day.'];
  if (start < toMinutes(hours.starts) || end > toMinutes(hours.ends)) problems.push(`Outside this provider's hours (${hours.starts}–${hours.ends}).`);
  if (hours.lunchStarts && start < toMinutes(hours.lunchEnds) && end > toMinutes(hours.lunchStarts)) {
    problems.push(`Overlaps the provider's lunch break (${hours.lunchStarts}–${hours.lunchEnds}).`);
  }
  if (startsAt < now) problems.push('That time has already passed.');

  // Two visits overlap when one starts before the other ends AND ends after the other starts
  const endsAt = `${date} ${toTime(end)}`;
  const clash = (column, id) => one(`
    SELECT strftime('%H:%M', starts_at) AS starts FROM appointments
    WHERE ${column} = ? AND status <> 'cancelled' AND date(starts_at) = ?
      AND starts_at < ?
      AND strftime('%Y-%m-%d %H:%M', starts_at, '+' || duration_min || ' minutes') > ?
    LIMIT 1`, [id, date, endsAt, startsAt]);
  const theirs = clash('provider_id', providerId);
  if (theirs) problems.push(`The provider already has a visit at ${theirs.starts}.`);
  if (patientId) {
    const mine = clash('patient_id', patientId);
    if (mine) problems.push(`The patient already has a visit at ${mine.starts}.`);
  }
  return problems;
}

/** Open start times for a visit of `duration` minutes, every 15 minutes */
function openSlots(providerId, date, duration = 30, now = NOW) {
  const hours = one('SELECT starts, ends, lunch_starts AS ls, lunch_ends AS le FROM provider_hours WHERE provider_id = ? AND weekday = ?', [providerId, weekdayOf(date)]);
  if (!hours) return [];
  const busy = visitsOn(date).filter((a) => a.providerId === providerId).map((a) => [toMinutes(a.starts), toMinutes(a.starts) + a.minutes]);
  if (hours.ls) busy.push([toMinutes(hours.ls), toMinutes(hours.le)]);
  const slots = [];
  for (let t = toMinutes(hours.starts); t + duration <= toMinutes(hours.ends); t += 15) {
    const free = busy.every(([s, e]) => t + duration <= s || t >= e);
    if (free && `${date} ${toTime(t)}` >= now) slots.push(toTime(t));
  }
  return slots;
}

/** Turns a database error into a message a person can act on */
function friendly(err) {
  const msg = String(err.message || err);
  if (msg.includes('uq_provider_start') || msg.includes('UNIQUE constraint failed: appointments')) return 'That provider already has an appointment at that time.';
  if (msg.includes('CHECK constraint')) return 'One of the values is not allowed.';
  if (msg.includes('FOREIGN KEY')) return 'That patient or provider does not exist.';
  return msg;
}

/** Books a visit: { ok: true, id } or { ok: false, problems } */
function book(visit) {
  const problems = bookingProblems(visit);
  if (!visit.reason?.trim()) problems.push('Enter a reason for the visit.');
  if (problems.length) return { ok: false, problems };
  try {
    run('INSERT INTO appointments (patient_id, provider_id, starts_at, duration_min, visit_type, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [visit.patientId, visit.providerId, visit.startsAt, visit.duration, visit.type, visit.reason.trim()]);
    return { ok: true, id: lastId() };
  } catch (err) {
    return { ok: false, problems: [friendly(err)] };
  }
}

const STATUSES = ['scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'];
function setStatus(id, status) {
  if (!STATUSES.includes(status)) throw new Error(`Unknown status "${status}"`);
  run('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
}
const visit = (id) => one(`SELECT a.id, a.provider_id AS providerId, a.starts_at AS startsAt, a.duration_min AS minutes, a.visit_type AS type,
                                  a.reason, a.status, pa.first_name || ' ' || pa.last_name AS patient
                           FROM appointments a JOIN patients pa ON pa.id = a.patient_id WHERE a.id = ?`, [id]);
```

```js ui
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const LONG_DATE = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const longDate = (date) => LONG_DATE.format(parseDate(date));
const state = { date: TODAY, picked: null };

// What one quarter-hour cell is for one provider: closed, lunch or open
function cellKind(p, t) {
  if (!p.starts || t < toMinutes(p.starts) || t >= toMinutes(p.ends)) return 'closed';
  if (p.lunchStarts && t >= toMinutes(p.lunchStarts) && t < toMinutes(p.lunchEnds)) return 'lunch';
  return 'open';
}

/** One day: a row per quarter hour, a column per provider. A visit fills as many rows as it lasts. */
function drawDay() {
  const providers = providersOn(state.date);
  const visits = visitsOn(state.date);
  const hours = clinicHours(state.date);
  $('title').textContent = longDate(state.date);
  if (!hours?.opens) { $('grid').innerHTML = '<p class="muted" style="padding:12px">The clinic is closed on weekends.</p>'; return; }
  const covered = new Set();          // cells already filled by a longer visit above
  let body = '';
  for (let t = toMinutes(hours.opens); t < toMinutes(hours.closes); t += 15) {
    body += `<tr><td class="time">${t % 60 === 0 ? toTime(t) : ''}</td>`;
    for (const p of providers) {
      const key = `${p.id}|${toTime(t)}`;
      if (covered.has(key)) continue;
      const a = visits.find((x) => x.providerId === p.id && x.starts === toTime(t));
      if (a) {
        const span = a.minutes / 15;
        for (let k = 1; k < span; k++) covered.add(`${p.id}|${toTime(t + 15 * k)}`);
        body += `<td class="visit ${a.status}" rowspan="${span}" data-visit="${a.id}">${esc(a.patient)}<br><small>${esc(a.type)}</small></td>`;
      } else {
        const kind = cellKind(p, t);
        body += kind === 'open' ? `<td class="open" data-slot="${key}"></td>` : `<td class="${kind}"></td>`;
      }
    }
    body += '</tr>';
  }
  $('grid').innerHTML = `<table class="day"><thead><tr><th></th>${providers.map((p) => `<th>${esc(p.name)}<small>${esc(p.specialty)}${p.starts ? ` · ${p.starts}–${p.ends}` : ' · off today'}</small></th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
  if (state.picked) $('grid').querySelector(`[data-slot="${state.picked}"]`)?.classList.add('picked');
}

const TYPES = ['Follow-up', 'New patient', 'Annual physical', 'Sick visit', 'Procedure', 'Telehealth'];
const STATUS_LABEL = { scheduled: 'Scheduled', checked_in: 'Check in', completed: 'Complete', no_show: 'No-show', cancelled: 'Cancel' };

function showPanel(html) {
  $('grid').parentElement.classList.toggle('with-panel', Boolean(html));
  $('panel').hidden = !html;
  $('panel').innerHTML = html || '';
}

/** An open cell: a booking form whose problems update as you change it */
function drawBooking() {
  const [providerId, time] = state.picked.split('|').map((x, i) => (i === 0 ? Number(x) : x));
  const patients = rows('SELECT id, first_name || \' \' || last_name AS name FROM patients ORDER BY last_name');
  if (!true) { showPanel(`<h3>${time}</h3><p class="muted">Your sign-in can view the schedule but not book visits.</p>`); return; }
  showPanel(`<h3>Book at ${time}</h3>
    <label>Patient<select id="bPatient">${patients.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
    <label>Length<select id="bLength">${[15, 30, 45, 60].map((m) => `<option ${m === 30 ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
    <label>Visit type<select id="bType">${TYPES.map((x) => `<option>${x}</option>`).join('')}</select></label>
    <label>Reason<input id="bReason" placeholder="e.g. Cough for a week"></label>
    <div id="bCheck"></div>
    <button class="primary" id="bBook" type="button">Book visit</button>
    <p class="muted small">Other open times: <span id="bSlots"></span></p>`);
  const check = () => {
    const patientId = Number($('bPatient').value), duration = Number($('bLength').value), startsAt = `${state.date} ${time}`;
    const problems = bookingProblems({ patientId, providerId, startsAt, duration });
    $('bCheck').innerHTML = problems.length ? `<ul class="problems">${problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : '<p class="ok">Open: this visit can be booked.</p>';
    $('bSlots').textContent = openSlots(providerId, state.date, duration).slice(0, 8).join(', ') || 'none';
  };
  ['bPatient', 'bLength'].forEach((id) => $(id).addEventListener('change', check));
  check();
  $('bBook').addEventListener('click', () => {
    const visitArgs = { patientId: Number($('bPatient').value), providerId, startsAt: `${state.date} ${time}`,
                        duration: Number($('bLength').value), type: $('bType').value, reason: $('bReason').value };
    const result = book(visitArgs);
    if (!result.ok) { $('bCheck').innerHTML = `<ul class="problems">${result.problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`; return; }
    state.picked = null;
    showPanel('');
    drawDay();
  });
}

/** A booked visit: its details and the status buttons */
function drawVisit(id) {
  const a = visit(id);
  const buttons = true ? Object.entries(STATUS_LABEL).filter(([s]) => s !== a.status && s !== 'scheduled')
    .map(([s, label]) => `<button class="ghost" data-status="${s}" type="button">${label}</button>`).join('') +
    (a.status !== 'scheduled' ? '<button class="ghost" data-status="scheduled" type="button">Reinstate</button>' : '') : '';
  showPanel(`<h3>${esc(a.patient)}</h3><p>${a.startsAt.slice(11)} · ${a.minutes} min · ${esc(a.type)}<br>${esc(a.reason)}</p>
    <p class="muted">Status: ${a.status.replace('_', ' ')}</p><div class="statuses">${buttons}</div>`);
  $('panel').querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => {
    setStatus(id, b.dataset.status);
    drawDay();
    drawVisit(id);
  }));
}

$('grid').addEventListener('click', (e) => {
  const slot = e.target.closest('[data-slot]');
  const booked = e.target.closest('[data-visit]');
  if (slot) {
    state.picked = state.picked === slot.dataset.slot ? null : slot.dataset.slot;
    drawDay();
    if (state.picked) drawBooking(); else showPanel('');
  } else if (booked) {
    state.picked = null;
    drawDay();
    drawVisit(Number(booked.dataset.visit));
  }
});

// Load SQLite, build the database, then draw the page
initSqlJs({ locateFile: (file) => SQLJS + file })
  .then((SQL) => {
    db = new SQL.Database();
    build();
    drawDay();
  })
  .catch((err) => {
    document.body.insertAdjacentHTML('afterbegin', `<p class="error" style="padding:12px">Couldn't start the database: ${esc(err.message)}</p>`);
    console.error(err);
  });
```

## Session: Patients and reports

## Step: Patient search and insurance
time: 30

A **Patients** tab joins the schedule. Two new ideas: a table that allows only one row per patient *and* coverage, and search that's safe with any text.

**Insurance.** A patient has at most one primary and one secondary plan. `UNIQUE (patient_id, coverage)` enforces that. To change a plan you could check if one exists, then `UPDATE` or `INSERT`. An **upsert** does it in one statement:

```sql
INSERT INTO insurance (patient_id, coverage, payer, …) VALUES (?, ?, ?, …)
ON CONFLICT (patient_id, coverage) DO UPDATE SET payer = excluded.payer, …
```

If the insert would break the unique rule, SQLite updates the existing row instead. `excluded` means "the row you tried to insert". The real project saves insurance exactly this way.

**Search.** `searchPatients(text)` matches the full name, last name, MRN or an exact birth date:

```sql
WHERE first_name || ' ' || last_name LIKE ? OR last_name LIKE ? OR mrn LIKE ? OR birth_date = ?
```

`LIKE '%rom%'` matches anywhere in the text, ignoring case for English letters. The `%` signs are added in JavaScript, around the value, and the whole thing goes in as a parameter. Type `'; DROP TABLE patients; --` into the search box: it finds nobody, and nothing breaks, because it's only ever a value.

**The chart.** `patientProfile(id)` gathers the patient row, their plans (primary first: `ORDER BY coverage = 'secondary'` sorts false, 0, before true, 1) and their visits with the provider's name. The page escapes every value with `esc()` before putting it in HTML, so a name with `<` in it shows as text.

**Patients without insurance** show "Self-pay". The new `phone` and `allergies` columns are on the `patients` table; allergies go right on the chart, where a clinician needs them.

### Try it

Search `rom`, `GH-10023` and `1991-07-30`. Open Luis Romero: two plans. In the browser console, run `saveInsurance(5, { coverage: 'primary', payer: 'Test', member: 'X1' })` twice and look at his chart.

check: js | one plan per coverage | /UNIQUE \(patient_id, coverage\)/
check: js | an upsert | /ON CONFLICT \(patient_id, coverage\) DO UPDATE/
check: js | safe search | /function\s+searchPatients\s*\(/
check: js | a patient's chart | /function\s+patientProfile\s*\(/
check: html | a patients tab | /data-tab="patients"/

quiz: What does ON CONFLICT … DO UPDATE do?
- [ ] Deletes the old row
- [x] If the insert would break a unique rule, it updates the existing row instead
- [ ] Shows an error
why: Insert or update in one statement: an upsert.
quiz: Why can't the search box text '; DROP TABLE patients; -- do any harm?
- [ ] SQLite ignores semicolons
- [x] It is passed as a ? parameter, so SQLite only ever compares it as a value
- [ ] The box is too short
why: Parameters keep data and SQL apart.

```html page
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
<div id="app">
<header class="top">
  <strong>Gotham Hospital</strong> <span class="muted">Patient Portal</span>
</header>
  <nav class="tabs" id="tabs">
    <button data-tab="schedule" class="on">Schedule</button>
    <button data-tab="patients">Patients</button>
  </nav>
<main>
  <section id="schedule" class="view">
    <div class="bar">
      <h2 id="title"></h2>
    </div>
    <div class="layout">
      <div id="grid" class="grid"></div>
    <aside id="panel" class="panel" hidden></aside>
    </div>
  </section>
  <section id="patients" class="view" hidden>
    <input id="search" type="search" placeholder="Search by name, MRN or birth date (YYYY-MM-DD)" autocomplete="off">
    <div class="split"><ul id="results" class="results"></ul><article id="profile" class="profile"></article></div>
  </section>
</main>
</div>
<p class="note">Practice app: every person, phone number and plan here is made up.</p>
```

```js db
// SQLite compiled to WebAssembly (sql.js): a real database inside the page
const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
let db;

const SCHEMA = `
-- Business hours by weekday (0 = Sunday … 6 = Saturday). NULL means closed.
CREATE TABLE clinic_hours (
  weekday INTEGER PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  opens   TEXT,
  closes  TEXT,
  CHECK ((opens IS NULL AND closes IS NULL) OR opens < closes)
);
CREATE TABLE providers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  credential TEXT NOT NULL CHECK (credential IN ('MD', 'DO', 'NP', 'PA')),
  specialty  TEXT NOT NULL,
  room       TEXT
);
-- Each provider's hours on the days they work (Monday–Friday only)
CREATE TABLE provider_hours (
  provider_id  INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  weekday      INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 5),
  starts       TEXT NOT NULL,
  ends         TEXT NOT NULL,
  lunch_starts TEXT,
  lunch_ends   TEXT,
  PRIMARY KEY (provider_id, weekday),
  CHECK (starts < ends)
);
CREATE TABLE patients (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  mrn         TEXT NOT NULL UNIQUE,            -- medical record number, e.g. GH-100231
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  birth_date  TEXT NOT NULL,                   -- YYYY-MM-DD
  sex         TEXT NOT NULL CHECK (sex IN ('F', 'M', 'X')),
  phone       TEXT,
  allergies   TEXT
);
CREATE TABLE insurance (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  coverage   TEXT NOT NULL CHECK (coverage IN ('primary', 'secondary')),
  payer      TEXT NOT NULL,
  plan_name  TEXT,
  member_id  TEXT NOT NULL,
  copay      REAL CHECK (copay >= 0),
  UNIQUE (patient_id, coverage)                -- one primary and one secondary plan at most
);
CREATE TABLE appointments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id  INTEGER NOT NULL REFERENCES providers(id),
  starts_at    TEXT NOT NULL,                  -- YYYY-MM-DD HH:MM
  duration_min INTEGER NOT NULL DEFAULT 30 CHECK (duration_min IN (15, 30, 45, 60)),
  visit_type   TEXT NOT NULL CHECK (visit_type IN ('New patient', 'Follow-up', 'Annual physical', 'Sick visit', 'Procedure', 'Telehealth')),
  reason       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'scheduled'
               CHECK (status IN ('scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'))
);
-- A provider can't have two active visits starting at the same time.
-- Partial index: cancelled visits don't count, so a cancelled slot can be booked again.
CREATE UNIQUE INDEX uq_provider_start ON appointments(provider_id, starts_at) WHERE status <> 'cancelled';
`;

// Run a query with ? parameters and get rows back as plain objects
function rows(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const out = [];
  while (stmt.step()) out.push(stmt.getAsObject());
  stmt.free();
  return out;
}
const one = (sql, params = []) => rows(sql, params)[0] ?? null;
const run = (sql, params = []) => db.run(sql, params);
const lastId = () => one('SELECT last_insert_rowid() AS id').id;

// Create the tables and load the sample data in one transaction
function build() {
  run('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  run('BEGIN');
  try {
    for (let day = 0; day <= 6; day++) {
      const open = day >= 1 && day <= 5;
      run('INSERT INTO clinic_hours (weekday, opens, closes) VALUES (?, ?, ?)', [day, open ? CLINIC.opens : null, open ? CLINIC.closes : null]);
    }
    PROVIDERS.forEach((p) => {
      run('INSERT INTO providers (first_name, last_name, credential, specialty, room) VALUES (?, ?, ?, ?, ?)', [p.first, p.last, p.credential, p.specialty, p.room]);
      const id = lastId();
      for (let day = 1; day <= 5; day++) {
        if ((p.off ?? []).includes(day)) continue;
        run('INSERT INTO provider_hours VALUES (?, ?, ?, ?, ?, ?)', [id, day, p.hours[0], p.hours[1], p.lunch[0], p.lunch[1]]);
      }
    });
    for (const p of PATIENTS) {
      run('INSERT INTO patients (mrn, first_name, last_name, birth_date, sex, phone, allergies) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [p.mrn, p.first, p.last, p.birth, p.sex, p.phone, p.allergies || null]);
      const id = lastId();
      for (const plan of p.insurance) saveInsurance(id, plan);
    }
    for (const [patient, provider, startsAt, minutes, type, reason, status] of VISITS) {
      run('INSERT INTO appointments (patient_id, provider_id, starts_at, duration_min, visit_type, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [patient + 1, provider + 1, startsAt, minutes, type, reason, status]);
    }
    run('COMMIT');
  } catch (err) {
    run('ROLLBACK');
    throw err;
  }
}

// ---------- Schedule ----------

/** The providers, with their hours on one weekday (null hours = not working that day) */
function providersOn(date) {
  return rows(`SELECT p.id, p.first_name || ' ' || p.last_name || ', ' || p.credential AS name, p.specialty,
                      h.starts, h.ends, h.lunch_starts AS lunchStarts, h.lunch_ends AS lunchEnds
               FROM providers p LEFT JOIN provider_hours h ON h.provider_id = p.id AND h.weekday = ?
               ORDER BY p.id`, [weekdayOf(date)]);
}

/** Every visit on one day, with the patient's name */
function visitsOn(date) {
  return rows(`SELECT a.id, a.provider_id AS providerId, a.patient_id AS patientId, strftime('%H:%M', a.starts_at) AS starts,
                      a.duration_min AS minutes, a.visit_type AS type, a.reason, a.status,
                      pa.first_name || ' ' || pa.last_name AS patient
               FROM appointments a JOIN patients pa ON pa.id = a.patient_id
               WHERE date(a.starts_at) = ? AND a.status <> 'cancelled'
               ORDER BY a.starts_at`, [date]);
}

const clinicHours = (date) => one('SELECT opens, closes FROM clinic_hours WHERE weekday = ?', [weekdayOf(date)]);

/**
 * Reasons a visit can't be booked, in plain words. An empty list means it can be booked.
 * Checks clinic hours, the provider's hours and lunch, the clock, and overlaps for the provider and the patient.
 */
function bookingProblems({ patientId = null, providerId, startsAt, duration = 30 }, now = NOW) {
  const [date, time] = startsAt.split(' ');
  const start = toMinutes(time);
  const end = start + duration;
  const problems = [];

  const clinic = clinicHours(date);
  if (!clinic?.opens) return ['The clinic is closed on weekends. Business hours are Monday–Friday.'];
  if (start < toMinutes(clinic.opens) || end > toMinutes(clinic.closes)) problems.push(`Outside business hours (${clinic.opens}–${clinic.closes}).`);

  const hours = one('SELECT starts, ends, lunch_starts AS lunchStarts, lunch_ends AS lunchEnds FROM provider_hours WHERE provider_id = ? AND weekday = ?',
    [providerId, weekdayOf(date)]);
  if (!hours) return [...problems, 'This provider does not work on that day.'];
  if (start < toMinutes(hours.starts) || end > toMinutes(hours.ends)) problems.push(`Outside this provider's hours (${hours.starts}–${hours.ends}).`);
  if (hours.lunchStarts && start < toMinutes(hours.lunchEnds) && end > toMinutes(hours.lunchStarts)) {
    problems.push(`Overlaps the provider's lunch break (${hours.lunchStarts}–${hours.lunchEnds}).`);
  }
  if (startsAt < now) problems.push('That time has already passed.');

  // Two visits overlap when one starts before the other ends AND ends after the other starts
  const endsAt = `${date} ${toTime(end)}`;
  const clash = (column, id) => one(`
    SELECT strftime('%H:%M', starts_at) AS starts FROM appointments
    WHERE ${column} = ? AND status <> 'cancelled' AND date(starts_at) = ?
      AND starts_at < ?
      AND strftime('%Y-%m-%d %H:%M', starts_at, '+' || duration_min || ' minutes') > ?
    LIMIT 1`, [id, date, endsAt, startsAt]);
  const theirs = clash('provider_id', providerId);
  if (theirs) problems.push(`The provider already has a visit at ${theirs.starts}.`);
  if (patientId) {
    const mine = clash('patient_id', patientId);
    if (mine) problems.push(`The patient already has a visit at ${mine.starts}.`);
  }
  return problems;
}

/** Open start times for a visit of `duration` minutes, every 15 minutes */
function openSlots(providerId, date, duration = 30, now = NOW) {
  const hours = one('SELECT starts, ends, lunch_starts AS ls, lunch_ends AS le FROM provider_hours WHERE provider_id = ? AND weekday = ?', [providerId, weekdayOf(date)]);
  if (!hours) return [];
  const busy = visitsOn(date).filter((a) => a.providerId === providerId).map((a) => [toMinutes(a.starts), toMinutes(a.starts) + a.minutes]);
  if (hours.ls) busy.push([toMinutes(hours.ls), toMinutes(hours.le)]);
  const slots = [];
  for (let t = toMinutes(hours.starts); t + duration <= toMinutes(hours.ends); t += 15) {
    const free = busy.every(([s, e]) => t + duration <= s || t >= e);
    if (free && `${date} ${toTime(t)}` >= now) slots.push(toTime(t));
  }
  return slots;
}

/** Turns a database error into a message a person can act on */
function friendly(err) {
  const msg = String(err.message || err);
  if (msg.includes('uq_provider_start') || msg.includes('UNIQUE constraint failed: appointments')) return 'That provider already has an appointment at that time.';
  if (msg.includes('CHECK constraint')) return 'One of the values is not allowed.';
  if (msg.includes('FOREIGN KEY')) return 'That patient or provider does not exist.';
  return msg;
}

/** Books a visit: { ok: true, id } or { ok: false, problems } */
function book(visit) {
  const problems = bookingProblems(visit);
  if (!visit.reason?.trim()) problems.push('Enter a reason for the visit.');
  if (problems.length) return { ok: false, problems };
  try {
    run('INSERT INTO appointments (patient_id, provider_id, starts_at, duration_min, visit_type, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [visit.patientId, visit.providerId, visit.startsAt, visit.duration, visit.type, visit.reason.trim()]);
    return { ok: true, id: lastId() };
  } catch (err) {
    return { ok: false, problems: [friendly(err)] };
  }
}

const STATUSES = ['scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'];
function setStatus(id, status) {
  if (!STATUSES.includes(status)) throw new Error(`Unknown status "${status}"`);
  run('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
}
const visit = (id) => one(`SELECT a.id, a.provider_id AS providerId, a.starts_at AS startsAt, a.duration_min AS minutes, a.visit_type AS type,
                                  a.reason, a.status, pa.first_name || ' ' || pa.last_name AS patient
                           FROM appointments a JOIN patients pa ON pa.id = a.patient_id WHERE a.id = ?`, [id]);

// ---------- Patients ----------

/** Adds a plan, or replaces the patient's plan of the same coverage (upsert) */
function saveInsurance(patientId, plan) {
  run(`INSERT INTO insurance (patient_id, coverage, payer, plan_name, member_id, copay) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (patient_id, coverage) DO UPDATE SET
         payer = excluded.payer, plan_name = excluded.plan_name, member_id = excluded.member_id, copay = excluded.copay`,
      [patientId, plan.coverage, plan.payer, plan.plan ?? null, plan.member, plan.copay ?? null]);
}

/** Search by name, MRN or birth date. Every value is a ? parameter, never pasted into the SQL. */
function searchPatients(text) {
  const q = text.trim();
  if (!q) return rows('SELECT id, mrn, first_name || \' \' || last_name AS name, birth_date AS birth FROM patients ORDER BY last_name, first_name LIMIT 50');
  const like = `%${q}%`;
  return rows(`SELECT id, mrn, first_name || ' ' || last_name AS name, birth_date AS birth FROM patients
               WHERE first_name || ' ' || last_name LIKE ? OR last_name LIKE ? OR mrn LIKE ? OR birth_date = ?
               ORDER BY last_name, first_name LIMIT 50`, [like, like, like, q]);
}

function patientProfile(id) {
  const p = one('SELECT * FROM patients WHERE id = ?', [id]);
  if (!p) return null;
  return {
    ...p,
    insurance: rows("SELECT coverage, payer, plan_name AS plan, member_id AS member, copay FROM insurance WHERE patient_id = ? ORDER BY coverage = 'secondary'", [id]),
    visits: rows(`SELECT a.starts_at AS startsAt, a.visit_type AS type, a.status, pr.last_name AS provider
                  FROM appointments a JOIN providers pr ON pr.id = a.provider_id WHERE a.patient_id = ? ORDER BY a.starts_at DESC`, [id]),
  };
}
```

```js ui
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const LONG_DATE = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const longDate = (date) => LONG_DATE.format(parseDate(date));
const state = { date: TODAY, picked: null };

// What one quarter-hour cell is for one provider: closed, lunch or open
function cellKind(p, t) {
  if (!p.starts || t < toMinutes(p.starts) || t >= toMinutes(p.ends)) return 'closed';
  if (p.lunchStarts && t >= toMinutes(p.lunchStarts) && t < toMinutes(p.lunchEnds)) return 'lunch';
  return 'open';
}

/** One day: a row per quarter hour, a column per provider. A visit fills as many rows as it lasts. */
function drawDay() {
  const providers = providersOn(state.date);
  const visits = visitsOn(state.date);
  const hours = clinicHours(state.date);
  $('title').textContent = longDate(state.date);
  if (!hours?.opens) { $('grid').innerHTML = '<p class="muted" style="padding:12px">The clinic is closed on weekends.</p>'; return; }
  const covered = new Set();          // cells already filled by a longer visit above
  let body = '';
  for (let t = toMinutes(hours.opens); t < toMinutes(hours.closes); t += 15) {
    body += `<tr><td class="time">${t % 60 === 0 ? toTime(t) : ''}</td>`;
    for (const p of providers) {
      const key = `${p.id}|${toTime(t)}`;
      if (covered.has(key)) continue;
      const a = visits.find((x) => x.providerId === p.id && x.starts === toTime(t));
      if (a) {
        const span = a.minutes / 15;
        for (let k = 1; k < span; k++) covered.add(`${p.id}|${toTime(t + 15 * k)}`);
        body += `<td class="visit ${a.status}" rowspan="${span}" data-visit="${a.id}">${esc(a.patient)}<br><small>${esc(a.type)}</small></td>`;
      } else {
        const kind = cellKind(p, t);
        body += kind === 'open' ? `<td class="open" data-slot="${key}"></td>` : `<td class="${kind}"></td>`;
      }
    }
    body += '</tr>';
  }
  $('grid').innerHTML = `<table class="day"><thead><tr><th></th>${providers.map((p) => `<th>${esc(p.name)}<small>${esc(p.specialty)}${p.starts ? ` · ${p.starts}–${p.ends}` : ' · off today'}</small></th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
  if (state.picked) $('grid').querySelector(`[data-slot="${state.picked}"]`)?.classList.add('picked');
}

const TYPES = ['Follow-up', 'New patient', 'Annual physical', 'Sick visit', 'Procedure', 'Telehealth'];
const STATUS_LABEL = { scheduled: 'Scheduled', checked_in: 'Check in', completed: 'Complete', no_show: 'No-show', cancelled: 'Cancel' };

function showPanel(html) {
  $('grid').parentElement.classList.toggle('with-panel', Boolean(html));
  $('panel').hidden = !html;
  $('panel').innerHTML = html || '';
}

/** An open cell: a booking form whose problems update as you change it */
function drawBooking() {
  const [providerId, time] = state.picked.split('|').map((x, i) => (i === 0 ? Number(x) : x));
  const patients = rows('SELECT id, first_name || \' \' || last_name AS name FROM patients ORDER BY last_name');
  if (!true) { showPanel(`<h3>${time}</h3><p class="muted">Your sign-in can view the schedule but not book visits.</p>`); return; }
  showPanel(`<h3>Book at ${time}</h3>
    <label>Patient<select id="bPatient">${patients.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
    <label>Length<select id="bLength">${[15, 30, 45, 60].map((m) => `<option ${m === 30 ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
    <label>Visit type<select id="bType">${TYPES.map((x) => `<option>${x}</option>`).join('')}</select></label>
    <label>Reason<input id="bReason" placeholder="e.g. Cough for a week"></label>
    <div id="bCheck"></div>
    <button class="primary" id="bBook" type="button">Book visit</button>
    <p class="muted small">Other open times: <span id="bSlots"></span></p>`);
  const check = () => {
    const patientId = Number($('bPatient').value), duration = Number($('bLength').value), startsAt = `${state.date} ${time}`;
    const problems = bookingProblems({ patientId, providerId, startsAt, duration });
    $('bCheck').innerHTML = problems.length ? `<ul class="problems">${problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : '<p class="ok">Open: this visit can be booked.</p>';
    $('bSlots').textContent = openSlots(providerId, state.date, duration).slice(0, 8).join(', ') || 'none';
  };
  ['bPatient', 'bLength'].forEach((id) => $(id).addEventListener('change', check));
  check();
  $('bBook').addEventListener('click', () => {
    const visitArgs = { patientId: Number($('bPatient').value), providerId, startsAt: `${state.date} ${time}`,
                        duration: Number($('bLength').value), type: $('bType').value, reason: $('bReason').value };
    const result = book(visitArgs);
    if (!result.ok) { $('bCheck').innerHTML = `<ul class="problems">${result.problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`; return; }
    state.picked = null;
    showPanel('');
    drawDay();
  });
}

/** A booked visit: its details and the status buttons */
function drawVisit(id) {
  const a = visit(id);
  const buttons = true ? Object.entries(STATUS_LABEL).filter(([s]) => s !== a.status && s !== 'scheduled')
    .map(([s, label]) => `<button class="ghost" data-status="${s}" type="button">${label}</button>`).join('') +
    (a.status !== 'scheduled' ? '<button class="ghost" data-status="scheduled" type="button">Reinstate</button>' : '') : '';
  showPanel(`<h3>${esc(a.patient)}</h3><p>${a.startsAt.slice(11)} · ${a.minutes} min · ${esc(a.type)}<br>${esc(a.reason)}</p>
    <p class="muted">Status: ${a.status.replace('_', ' ')}</p><div class="statuses">${buttons}</div>`);
  $('panel').querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => {
    setStatus(id, b.dataset.status);
    drawDay();
    drawVisit(id);
  }));
}

function drawResults(text = $('search').value) {
  const list = searchPatients(text);
  $('results').innerHTML = list.length ? list.map((p) => `<li data-patient="${p.id}">${esc(p.name)}<small>${esc(p.mrn)} · born ${esc(p.birth)}</small></li>`).join('')
    : '<li class="muted">No patients match.</li>';
}

function drawProfile(id) {
  const p = patientProfile(id);
  $('profile').innerHTML = `<h3>${esc(p.first_name)} ${esc(p.last_name)}</h3>
    <dl><dt>MRN</dt><dd>${esc(p.mrn)}</dd><dt>Born</dt><dd>${esc(p.birth_date)}</dd><dt>Sex</dt><dd>${esc(p.sex)}</dd>
    <dt>Phone</dt><dd>${esc(p.phone)}</dd><dt>Allergies</dt><dd>${esc(p.allergies || 'None recorded')}</dd></dl>
    <h4>Insurance</h4>${p.insurance.length ? p.insurance.map((i) => `<p><strong>${i.coverage === 'primary' ? 'Primary' : 'Secondary'}:</strong> ${esc(i.payer)} ${esc(i.plan || '')} · member ${esc(i.member)}${i.copay != null ? ` · $${i.copay} copay` : ''}</p>`).join('') : '<p class="muted">Self-pay (no plan on file)</p>'}
    <h4>Visits</h4><ul>${p.visits.map((a) => `<li>${a.startsAt} · ${esc(a.type)} with ${esc(a.provider)} · ${a.status.replace('_', ' ')}</li>`).join('') || '<li class="muted">None</li>'}</ul>`;
}

function showTab(tab) {
  document.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  document.querySelectorAll('.view').forEach((s) => { s.hidden = s.id !== tab; });
  if (tab === 'schedule') drawDay();
  if (tab === 'patients') drawResults();
}
$('tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });
$('search').addEventListener('input', (e) => drawResults(e.target.value));
$('results').addEventListener('click', (e) => { const li = e.target.closest('[data-patient]'); if (li) drawProfile(Number(li.dataset.patient)); });

$('grid').addEventListener('click', (e) => {
  const slot = e.target.closest('[data-slot]');
  const booked = e.target.closest('[data-visit]');
  if (slot) {
    state.picked = state.picked === slot.dataset.slot ? null : slot.dataset.slot;
    drawDay();
    if (state.picked) drawBooking(); else showPanel('');
  } else if (booked) {
    state.picked = null;
    drawDay();
    drawVisit(Number(booked.dataset.visit));
  }
});

// Load SQLite, build the database, then draw the page
initSqlJs({ locateFile: (file) => SQLJS + file })
  .then((SQL) => {
    db = new SQL.Database();
    build();
    showTab('schedule');
  })
  .catch((err) => {
    document.body.insertAdjacentHTML('afterbegin', `<p class="error" style="padding:12px">Couldn't start the database: ${esc(err.message)}</p>`);
    console.error(err);
  });
```

## Step: Reports with SQL
time: 25

Clinic managers want numbers: how many visits each day, how many no-shows, which provider is busiest. The **Reports** tab gets them with two queries and no JavaScript loops.

**Counting by status.** In SQLite a comparison is a number: `status = 'no_show'` is 1 when true and 0 when false. So `SUM(status = 'no_show')` counts the no-shows in each group:

```sql
SELECT date(starts_at) AS date, COUNT(*) AS total,
       SUM(status = 'checked_in') AS checkedIn, SUM(status = 'completed') AS completed, SUM(status = 'no_show') AS noShows
FROM appointments WHERE date(starts_at) BETWEEN ? AND ? AND status <> 'cancelled'
GROUP BY date(starts_at)
```

`GROUP BY` makes one result row per day; `COUNT` and `SUM` work within each group. (In databases like PostgreSQL, write `COUNT(*) FILTER (WHERE status = 'no_show')` or `SUM(CASE WHEN … THEN 1 ELSE 0 END)` instead.)

**A rate without dividing by zero.** The no-show rate is no-shows divided by visits that are over (completed or no-show). A provider with nothing finished yet would divide by zero. `NULLIF(x, 0)` returns `NULL` when `x` is 0, and anything divided by `NULL` is `NULL`, so the rate is simply missing, and the page shows "–". `100.0 *` makes the division decimal: in SQL, `1 / 3` on integers is 0.

**Every provider, even with no visits.** The workload query starts `FROM providers LEFT JOIN appointments`. A plain `JOIN` would drop a provider with no visits that week; the `LEFT JOIN` keeps them with `NULL`s, `COUNT(a.id)` counts 0 (it skips `NULL`s), and `COALESCE(…, 0)` turns a `NULL` sum into 0. Notice the date filter is in the `ON` clause, not in `WHERE`: in `WHERE` it would throw away the `NULL` rows and undo the `LEFT JOIN`.

### Try it

Open Reports. Mark a visit No-show on the schedule and look again: the counts and Okafor's rate change.

check: js | count by status | /SUM\(status = 'no_show'\) AS noShows/
check: js | no division by zero | /NULLIF\(/
check: js | keep providers with no visits | /FROM providers pr\s+LEFT JOIN appointments/
check: html | a reports tab | /data-tab="reports"/

quiz: Why is the date filter in the LEFT JOIN's ON clause and not in WHERE?
- [ ] No reason
- [x] In WHERE it would remove the rows of providers with no visits, turning the LEFT JOIN back into a plain JOIN
- [ ] ON is faster
why: Filters on the optional side of a LEFT JOIN belong in ON.
quiz: What does NULLIF(total, 0) do in the rate?
- [ ] Sets the total to 0
- [x] Gives NULL when the total is 0, so the division gives NULL instead of failing
- [ ] Removes NULLs
why: A missing rate is more honest than a fake 0%.

```html page
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
<div id="app">
<header class="top">
  <strong>Gotham Hospital</strong> <span class="muted">Patient Portal</span>
</header>
  <nav class="tabs" id="tabs">
    <button data-tab="schedule" class="on">Schedule</button>
    <button data-tab="patients">Patients</button>
    <button data-tab="reports">Reports</button>
  </nav>
<main>
  <section id="schedule" class="view">
    <div class="bar">
      <h2 id="title"></h2>
    </div>
    <div class="layout">
      <div id="grid" class="grid"></div>
    <aside id="panel" class="panel" hidden></aside>
    </div>
  </section>
  <section id="patients" class="view" hidden>
    <input id="search" type="search" placeholder="Search by name, MRN or birth date (YYYY-MM-DD)" autocomplete="off">
    <div class="split"><ul id="results" class="results"></ul><article id="profile" class="profile"></article></div>
  </section>
  <section id="reports" class="view" hidden>
    <h2>This week</h2>
    <table id="daily" class="report"></table>
    <h2>Provider workload</h2>
    <table id="workload" class="report"></table>
  </section>
</main>
</div>
<p class="note">Practice app: every person, phone number and plan here is made up.</p>
```

```js db
// SQLite compiled to WebAssembly (sql.js): a real database inside the page
const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
let db;

const SCHEMA = `
-- Business hours by weekday (0 = Sunday … 6 = Saturday). NULL means closed.
CREATE TABLE clinic_hours (
  weekday INTEGER PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  opens   TEXT,
  closes  TEXT,
  CHECK ((opens IS NULL AND closes IS NULL) OR opens < closes)
);
CREATE TABLE providers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  credential TEXT NOT NULL CHECK (credential IN ('MD', 'DO', 'NP', 'PA')),
  specialty  TEXT NOT NULL,
  room       TEXT
);
-- Each provider's hours on the days they work (Monday–Friday only)
CREATE TABLE provider_hours (
  provider_id  INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  weekday      INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 5),
  starts       TEXT NOT NULL,
  ends         TEXT NOT NULL,
  lunch_starts TEXT,
  lunch_ends   TEXT,
  PRIMARY KEY (provider_id, weekday),
  CHECK (starts < ends)
);
CREATE TABLE patients (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  mrn         TEXT NOT NULL UNIQUE,            -- medical record number, e.g. GH-100231
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  birth_date  TEXT NOT NULL,                   -- YYYY-MM-DD
  sex         TEXT NOT NULL CHECK (sex IN ('F', 'M', 'X')),
  phone       TEXT,
  allergies   TEXT
);
CREATE TABLE insurance (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  coverage   TEXT NOT NULL CHECK (coverage IN ('primary', 'secondary')),
  payer      TEXT NOT NULL,
  plan_name  TEXT,
  member_id  TEXT NOT NULL,
  copay      REAL CHECK (copay >= 0),
  UNIQUE (patient_id, coverage)                -- one primary and one secondary plan at most
);
CREATE TABLE appointments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id  INTEGER NOT NULL REFERENCES providers(id),
  starts_at    TEXT NOT NULL,                  -- YYYY-MM-DD HH:MM
  duration_min INTEGER NOT NULL DEFAULT 30 CHECK (duration_min IN (15, 30, 45, 60)),
  visit_type   TEXT NOT NULL CHECK (visit_type IN ('New patient', 'Follow-up', 'Annual physical', 'Sick visit', 'Procedure', 'Telehealth')),
  reason       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'scheduled'
               CHECK (status IN ('scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'))
);
-- A provider can't have two active visits starting at the same time.
-- Partial index: cancelled visits don't count, so a cancelled slot can be booked again.
CREATE UNIQUE INDEX uq_provider_start ON appointments(provider_id, starts_at) WHERE status <> 'cancelled';
`;

// Run a query with ? parameters and get rows back as plain objects
function rows(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const out = [];
  while (stmt.step()) out.push(stmt.getAsObject());
  stmt.free();
  return out;
}
const one = (sql, params = []) => rows(sql, params)[0] ?? null;
const run = (sql, params = []) => db.run(sql, params);
const lastId = () => one('SELECT last_insert_rowid() AS id').id;

// Create the tables and load the sample data in one transaction
function build() {
  run('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  run('BEGIN');
  try {
    for (let day = 0; day <= 6; day++) {
      const open = day >= 1 && day <= 5;
      run('INSERT INTO clinic_hours (weekday, opens, closes) VALUES (?, ?, ?)', [day, open ? CLINIC.opens : null, open ? CLINIC.closes : null]);
    }
    PROVIDERS.forEach((p) => {
      run('INSERT INTO providers (first_name, last_name, credential, specialty, room) VALUES (?, ?, ?, ?, ?)', [p.first, p.last, p.credential, p.specialty, p.room]);
      const id = lastId();
      for (let day = 1; day <= 5; day++) {
        if ((p.off ?? []).includes(day)) continue;
        run('INSERT INTO provider_hours VALUES (?, ?, ?, ?, ?, ?)', [id, day, p.hours[0], p.hours[1], p.lunch[0], p.lunch[1]]);
      }
    });
    for (const p of PATIENTS) {
      run('INSERT INTO patients (mrn, first_name, last_name, birth_date, sex, phone, allergies) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [p.mrn, p.first, p.last, p.birth, p.sex, p.phone, p.allergies || null]);
      const id = lastId();
      for (const plan of p.insurance) saveInsurance(id, plan);
    }
    for (const [patient, provider, startsAt, minutes, type, reason, status] of VISITS) {
      run('INSERT INTO appointments (patient_id, provider_id, starts_at, duration_min, visit_type, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [patient + 1, provider + 1, startsAt, minutes, type, reason, status]);
    }
    run('COMMIT');
  } catch (err) {
    run('ROLLBACK');
    throw err;
  }
}

// ---------- Schedule ----------

/** The providers, with their hours on one weekday (null hours = not working that day) */
function providersOn(date) {
  return rows(`SELECT p.id, p.first_name || ' ' || p.last_name || ', ' || p.credential AS name, p.specialty,
                      h.starts, h.ends, h.lunch_starts AS lunchStarts, h.lunch_ends AS lunchEnds
               FROM providers p LEFT JOIN provider_hours h ON h.provider_id = p.id AND h.weekday = ?
               ORDER BY p.id`, [weekdayOf(date)]);
}

/** Every visit on one day, with the patient's name */
function visitsOn(date) {
  return rows(`SELECT a.id, a.provider_id AS providerId, a.patient_id AS patientId, strftime('%H:%M', a.starts_at) AS starts,
                      a.duration_min AS minutes, a.visit_type AS type, a.reason, a.status,
                      pa.first_name || ' ' || pa.last_name AS patient
               FROM appointments a JOIN patients pa ON pa.id = a.patient_id
               WHERE date(a.starts_at) = ? AND a.status <> 'cancelled'
               ORDER BY a.starts_at`, [date]);
}

const clinicHours = (date) => one('SELECT opens, closes FROM clinic_hours WHERE weekday = ?', [weekdayOf(date)]);

/**
 * Reasons a visit can't be booked, in plain words. An empty list means it can be booked.
 * Checks clinic hours, the provider's hours and lunch, the clock, and overlaps for the provider and the patient.
 */
function bookingProblems({ patientId = null, providerId, startsAt, duration = 30 }, now = NOW) {
  const [date, time] = startsAt.split(' ');
  const start = toMinutes(time);
  const end = start + duration;
  const problems = [];

  const clinic = clinicHours(date);
  if (!clinic?.opens) return ['The clinic is closed on weekends. Business hours are Monday–Friday.'];
  if (start < toMinutes(clinic.opens) || end > toMinutes(clinic.closes)) problems.push(`Outside business hours (${clinic.opens}–${clinic.closes}).`);

  const hours = one('SELECT starts, ends, lunch_starts AS lunchStarts, lunch_ends AS lunchEnds FROM provider_hours WHERE provider_id = ? AND weekday = ?',
    [providerId, weekdayOf(date)]);
  if (!hours) return [...problems, 'This provider does not work on that day.'];
  if (start < toMinutes(hours.starts) || end > toMinutes(hours.ends)) problems.push(`Outside this provider's hours (${hours.starts}–${hours.ends}).`);
  if (hours.lunchStarts && start < toMinutes(hours.lunchEnds) && end > toMinutes(hours.lunchStarts)) {
    problems.push(`Overlaps the provider's lunch break (${hours.lunchStarts}–${hours.lunchEnds}).`);
  }
  if (startsAt < now) problems.push('That time has already passed.');

  // Two visits overlap when one starts before the other ends AND ends after the other starts
  const endsAt = `${date} ${toTime(end)}`;
  const clash = (column, id) => one(`
    SELECT strftime('%H:%M', starts_at) AS starts FROM appointments
    WHERE ${column} = ? AND status <> 'cancelled' AND date(starts_at) = ?
      AND starts_at < ?
      AND strftime('%Y-%m-%d %H:%M', starts_at, '+' || duration_min || ' minutes') > ?
    LIMIT 1`, [id, date, endsAt, startsAt]);
  const theirs = clash('provider_id', providerId);
  if (theirs) problems.push(`The provider already has a visit at ${theirs.starts}.`);
  if (patientId) {
    const mine = clash('patient_id', patientId);
    if (mine) problems.push(`The patient already has a visit at ${mine.starts}.`);
  }
  return problems;
}

/** Open start times for a visit of `duration` minutes, every 15 minutes */
function openSlots(providerId, date, duration = 30, now = NOW) {
  const hours = one('SELECT starts, ends, lunch_starts AS ls, lunch_ends AS le FROM provider_hours WHERE provider_id = ? AND weekday = ?', [providerId, weekdayOf(date)]);
  if (!hours) return [];
  const busy = visitsOn(date).filter((a) => a.providerId === providerId).map((a) => [toMinutes(a.starts), toMinutes(a.starts) + a.minutes]);
  if (hours.ls) busy.push([toMinutes(hours.ls), toMinutes(hours.le)]);
  const slots = [];
  for (let t = toMinutes(hours.starts); t + duration <= toMinutes(hours.ends); t += 15) {
    const free = busy.every(([s, e]) => t + duration <= s || t >= e);
    if (free && `${date} ${toTime(t)}` >= now) slots.push(toTime(t));
  }
  return slots;
}

/** Turns a database error into a message a person can act on */
function friendly(err) {
  const msg = String(err.message || err);
  if (msg.includes('uq_provider_start') || msg.includes('UNIQUE constraint failed: appointments')) return 'That provider already has an appointment at that time.';
  if (msg.includes('CHECK constraint')) return 'One of the values is not allowed.';
  if (msg.includes('FOREIGN KEY')) return 'That patient or provider does not exist.';
  return msg;
}

/** Books a visit: { ok: true, id } or { ok: false, problems } */
function book(visit) {
  const problems = bookingProblems(visit);
  if (!visit.reason?.trim()) problems.push('Enter a reason for the visit.');
  if (problems.length) return { ok: false, problems };
  try {
    run('INSERT INTO appointments (patient_id, provider_id, starts_at, duration_min, visit_type, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [visit.patientId, visit.providerId, visit.startsAt, visit.duration, visit.type, visit.reason.trim()]);
    return { ok: true, id: lastId() };
  } catch (err) {
    return { ok: false, problems: [friendly(err)] };
  }
}

const STATUSES = ['scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'];
function setStatus(id, status) {
  if (!STATUSES.includes(status)) throw new Error(`Unknown status "${status}"`);
  run('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
}
const visit = (id) => one(`SELECT a.id, a.provider_id AS providerId, a.starts_at AS startsAt, a.duration_min AS minutes, a.visit_type AS type,
                                  a.reason, a.status, pa.first_name || ' ' || pa.last_name AS patient
                           FROM appointments a JOIN patients pa ON pa.id = a.patient_id WHERE a.id = ?`, [id]);

// ---------- Patients ----------

/** Adds a plan, or replaces the patient's plan of the same coverage (upsert) */
function saveInsurance(patientId, plan) {
  run(`INSERT INTO insurance (patient_id, coverage, payer, plan_name, member_id, copay) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (patient_id, coverage) DO UPDATE SET
         payer = excluded.payer, plan_name = excluded.plan_name, member_id = excluded.member_id, copay = excluded.copay`,
      [patientId, plan.coverage, plan.payer, plan.plan ?? null, plan.member, plan.copay ?? null]);
}

/** Search by name, MRN or birth date. Every value is a ? parameter, never pasted into the SQL. */
function searchPatients(text) {
  const q = text.trim();
  if (!q) return rows('SELECT id, mrn, first_name || \' \' || last_name AS name, birth_date AS birth FROM patients ORDER BY last_name, first_name LIMIT 50');
  const like = `%${q}%`;
  return rows(`SELECT id, mrn, first_name || ' ' || last_name AS name, birth_date AS birth FROM patients
               WHERE first_name || ' ' || last_name LIKE ? OR last_name LIKE ? OR mrn LIKE ? OR birth_date = ?
               ORDER BY last_name, first_name LIMIT 50`, [like, like, like, q]);
}

function patientProfile(id) {
  const p = one('SELECT * FROM patients WHERE id = ?', [id]);
  if (!p) return null;
  return {
    ...p,
    insurance: rows("SELECT coverage, payer, plan_name AS plan, member_id AS member, copay FROM insurance WHERE patient_id = ? ORDER BY coverage = 'secondary'", [id]),
    visits: rows(`SELECT a.starts_at AS startsAt, a.visit_type AS type, a.status, pr.last_name AS provider
                  FROM appointments a JOIN providers pr ON pr.id = a.provider_id WHERE a.patient_id = ? ORDER BY a.starts_at DESC`, [id]),
  };
}

// ---------- Reports ----------

/** Visits per day: in SQLite a true comparison is 1, so SUM(status = 'x') counts the rows with that status */
function dailyReport(from, to) {
  return rows(`SELECT date(starts_at) AS date, COUNT(*) AS total,
                      SUM(status = 'checked_in') AS checkedIn, SUM(status = 'completed') AS completed, SUM(status = 'no_show') AS noShows
               FROM appointments
               WHERE date(starts_at) BETWEEN ? AND ? AND status <> 'cancelled'
               GROUP BY date(starts_at) ORDER BY date`, [from, to]);
}

/** Each provider's workload. NULLIF turns a 0 divisor into NULL, so a provider with no finished visits shows no rate instead of an error. */
function providerWorkload(from, to) {
  return rows(`SELECT pr.first_name || ' ' || pr.last_name || ', ' || pr.credential AS provider,
                      COUNT(a.id) AS total,
                      COALESCE(SUM(a.status = 'no_show'), 0) AS noShows,
                      ROUND(100.0 * SUM(a.status = 'no_show') / NULLIF(SUM(a.status IN ('completed', 'no_show')), 0), 1) AS noShowPct
               FROM providers pr
               LEFT JOIN appointments a ON a.provider_id = pr.id AND a.status <> 'cancelled' AND date(a.starts_at) BETWEEN ? AND ?
               GROUP BY pr.id ORDER BY total DESC, provider`, [from, to]);
}
```

```js ui
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const LONG_DATE = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const longDate = (date) => LONG_DATE.format(parseDate(date));
const state = { date: TODAY, picked: null };

// What one quarter-hour cell is for one provider: closed, lunch or open
function cellKind(p, t) {
  if (!p.starts || t < toMinutes(p.starts) || t >= toMinutes(p.ends)) return 'closed';
  if (p.lunchStarts && t >= toMinutes(p.lunchStarts) && t < toMinutes(p.lunchEnds)) return 'lunch';
  return 'open';
}

/** One day: a row per quarter hour, a column per provider. A visit fills as many rows as it lasts. */
function drawDay() {
  const providers = providersOn(state.date);
  const visits = visitsOn(state.date);
  const hours = clinicHours(state.date);
  $('title').textContent = longDate(state.date);
  if (!hours?.opens) { $('grid').innerHTML = '<p class="muted" style="padding:12px">The clinic is closed on weekends.</p>'; return; }
  const covered = new Set();          // cells already filled by a longer visit above
  let body = '';
  for (let t = toMinutes(hours.opens); t < toMinutes(hours.closes); t += 15) {
    body += `<tr><td class="time">${t % 60 === 0 ? toTime(t) : ''}</td>`;
    for (const p of providers) {
      const key = `${p.id}|${toTime(t)}`;
      if (covered.has(key)) continue;
      const a = visits.find((x) => x.providerId === p.id && x.starts === toTime(t));
      if (a) {
        const span = a.minutes / 15;
        for (let k = 1; k < span; k++) covered.add(`${p.id}|${toTime(t + 15 * k)}`);
        body += `<td class="visit ${a.status}" rowspan="${span}" data-visit="${a.id}">${esc(a.patient)}<br><small>${esc(a.type)}</small></td>`;
      } else {
        const kind = cellKind(p, t);
        body += kind === 'open' ? `<td class="open" data-slot="${key}"></td>` : `<td class="${kind}"></td>`;
      }
    }
    body += '</tr>';
  }
  $('grid').innerHTML = `<table class="day"><thead><tr><th></th>${providers.map((p) => `<th>${esc(p.name)}<small>${esc(p.specialty)}${p.starts ? ` · ${p.starts}–${p.ends}` : ' · off today'}</small></th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
  if (state.picked) $('grid').querySelector(`[data-slot="${state.picked}"]`)?.classList.add('picked');
}

const TYPES = ['Follow-up', 'New patient', 'Annual physical', 'Sick visit', 'Procedure', 'Telehealth'];
const STATUS_LABEL = { scheduled: 'Scheduled', checked_in: 'Check in', completed: 'Complete', no_show: 'No-show', cancelled: 'Cancel' };

function showPanel(html) {
  $('grid').parentElement.classList.toggle('with-panel', Boolean(html));
  $('panel').hidden = !html;
  $('panel').innerHTML = html || '';
}

/** An open cell: a booking form whose problems update as you change it */
function drawBooking() {
  const [providerId, time] = state.picked.split('|').map((x, i) => (i === 0 ? Number(x) : x));
  const patients = rows('SELECT id, first_name || \' \' || last_name AS name FROM patients ORDER BY last_name');
  if (!true) { showPanel(`<h3>${time}</h3><p class="muted">Your sign-in can view the schedule but not book visits.</p>`); return; }
  showPanel(`<h3>Book at ${time}</h3>
    <label>Patient<select id="bPatient">${patients.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
    <label>Length<select id="bLength">${[15, 30, 45, 60].map((m) => `<option ${m === 30 ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
    <label>Visit type<select id="bType">${TYPES.map((x) => `<option>${x}</option>`).join('')}</select></label>
    <label>Reason<input id="bReason" placeholder="e.g. Cough for a week"></label>
    <div id="bCheck"></div>
    <button class="primary" id="bBook" type="button">Book visit</button>
    <p class="muted small">Other open times: <span id="bSlots"></span></p>`);
  const check = () => {
    const patientId = Number($('bPatient').value), duration = Number($('bLength').value), startsAt = `${state.date} ${time}`;
    const problems = bookingProblems({ patientId, providerId, startsAt, duration });
    $('bCheck').innerHTML = problems.length ? `<ul class="problems">${problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : '<p class="ok">Open: this visit can be booked.</p>';
    $('bSlots').textContent = openSlots(providerId, state.date, duration).slice(0, 8).join(', ') || 'none';
  };
  ['bPatient', 'bLength'].forEach((id) => $(id).addEventListener('change', check));
  check();
  $('bBook').addEventListener('click', () => {
    const visitArgs = { patientId: Number($('bPatient').value), providerId, startsAt: `${state.date} ${time}`,
                        duration: Number($('bLength').value), type: $('bType').value, reason: $('bReason').value };
    const result = book(visitArgs);
    if (!result.ok) { $('bCheck').innerHTML = `<ul class="problems">${result.problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`; return; }
    state.picked = null;
    showPanel('');
    drawDay();
  });
}

/** A booked visit: its details and the status buttons */
function drawVisit(id) {
  const a = visit(id);
  const buttons = true ? Object.entries(STATUS_LABEL).filter(([s]) => s !== a.status && s !== 'scheduled')
    .map(([s, label]) => `<button class="ghost" data-status="${s}" type="button">${label}</button>`).join('') +
    (a.status !== 'scheduled' ? '<button class="ghost" data-status="scheduled" type="button">Reinstate</button>' : '') : '';
  showPanel(`<h3>${esc(a.patient)}</h3><p>${a.startsAt.slice(11)} · ${a.minutes} min · ${esc(a.type)}<br>${esc(a.reason)}</p>
    <p class="muted">Status: ${a.status.replace('_', ' ')}</p><div class="statuses">${buttons}</div>`);
  $('panel').querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => {
    setStatus(id, b.dataset.status);
    drawDay();
    drawVisit(id);
  }));
}

function drawResults(text = $('search').value) {
  const list = searchPatients(text);
  $('results').innerHTML = list.length ? list.map((p) => `<li data-patient="${p.id}">${esc(p.name)}<small>${esc(p.mrn)} · born ${esc(p.birth)}</small></li>`).join('')
    : '<li class="muted">No patients match.</li>';
}

function drawProfile(id) {
  const p = patientProfile(id);
  $('profile').innerHTML = `<h3>${esc(p.first_name)} ${esc(p.last_name)}</h3>
    <dl><dt>MRN</dt><dd>${esc(p.mrn)}</dd><dt>Born</dt><dd>${esc(p.birth_date)}</dd><dt>Sex</dt><dd>${esc(p.sex)}</dd>
    <dt>Phone</dt><dd>${esc(p.phone)}</dd><dt>Allergies</dt><dd>${esc(p.allergies || 'None recorded')}</dd></dl>
    <h4>Insurance</h4>${p.insurance.length ? p.insurance.map((i) => `<p><strong>${i.coverage === 'primary' ? 'Primary' : 'Secondary'}:</strong> ${esc(i.payer)} ${esc(i.plan || '')} · member ${esc(i.member)}${i.copay != null ? ` · $${i.copay} copay` : ''}</p>`).join('') : '<p class="muted">Self-pay (no plan on file)</p>'}
    <h4>Visits</h4><ul>${p.visits.map((a) => `<li>${a.startsAt} · ${esc(a.type)} with ${esc(a.provider)} · ${a.status.replace('_', ' ')}</li>`).join('') || '<li class="muted">None</li>'}</ul>`;
}

function drawReports() {
  const from = TODAY, to = addDays(TODAY, 4);          // Monday–Friday of the demo week
  const days = dailyReport(from, to);
  $('daily').innerHTML = '<tr><th>Day</th><th>Visits</th><th>Checked in</th><th>Completed</th><th>No-shows</th></tr>' +
    days.map((d) => `<tr><td>${d.date}</td><td class="n">${d.total}</td><td class="n">${d.checkedIn}</td><td class="n">${d.completed}</td><td class="n">${d.noShows}</td></tr>`).join('');
  $('workload').innerHTML = '<tr><th>Provider</th><th>Visits</th><th>No-shows</th><th>No-show rate</th></tr>' +
    providerWorkload(from, to).map((w) => `<tr><td>${esc(w.provider)}</td><td class="n">${w.total}</td><td class="n">${w.noShows}</td><td class="n">${w.noShowPct == null ? '–' : `${w.noShowPct}%`}</td></tr>`).join('');
}

function showTab(tab) {
  document.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  document.querySelectorAll('.view').forEach((s) => { s.hidden = s.id !== tab; });
  if (tab === 'schedule') drawDay();
  if (tab === 'patients') drawResults();
  if (tab === 'reports') drawReports();
}
$('tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });
$('search').addEventListener('input', (e) => drawResults(e.target.value));
$('results').addEventListener('click', (e) => { const li = e.target.closest('[data-patient]'); if (li) drawProfile(Number(li.dataset.patient)); });

$('grid').addEventListener('click', (e) => {
  const slot = e.target.closest('[data-slot]');
  const booked = e.target.closest('[data-visit]');
  if (slot) {
    state.picked = state.picked === slot.dataset.slot ? null : slot.dataset.slot;
    drawDay();
    if (state.picked) drawBooking(); else showPanel('');
  } else if (booked) {
    state.picked = null;
    drawDay();
    drawVisit(Number(booked.dataset.visit));
  }
});

// Load SQLite, build the database, then draw the page
initSqlJs({ locateFile: (file) => SQLJS + file })
  .then((SQL) => {
    db = new SQL.Database();
    build();
    showTab('schedule');
  })
  .catch((err) => {
    document.body.insertAdjacentHTML('afterbegin', `<p class="error" style="padding:12px">Couldn't start the database: ${esc(err.message)}</p>`);
    console.error(err);
  });
```

## Session: Staff sign-in and roles

## Step: Passwords, hashes and sessions
time: 35

A patient portal must know who's using it. The real Gotham app has one username, **Gotham Staff**, and a separate password for each role; whichever password you type decides what you can do. This step adds the sign-in. The two demo passwords are on the sign-in card: `front-desk-demo` (customer service) and `clinic-demo` (medical staff). They are only for this guide.

```svg A password is turned into a slow, salted hash, and only the hash is kept
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 190" font-family="sans-serif" font-size="11"><rect x="10" y="20" width="110" height="34" rx="6" fill="#fde68a"/><text x="20" y="41">password typed</text><rect x="10" y="66" width="110" height="34" rx="6" fill="#e2e8f0"/><text x="20" y="87">salt (from staff)</text><rect x="150" y="34" width="120" height="52" rx="6" fill="#1d4e89"/><text x="160" y="56" fill="#fff">PBKDF2-SHA256</text><text x="160" y="74" fill="#c9d6ea" font-size="10">100,000 rounds</text><rect x="300" y="42" width="120" height="34" rx="6" fill="#dbe8f7"/><text x="310" y="63">hash (64 hex)</text><path d="M120 37 L150 52 M120 83 L150 68 M270 60 L300 60" stroke="#475569" stroke-width="2"/><rect x="300" y="100" width="120" height="34" rx="6" fill="#dcfce7"/><text x="310" y="121">stored hash</text><text x="300" y="152" font-size="10">sameHash(): equal?</text><text x="300" y="166" font-size="10">→ new session token</text><text x="10" y="128" font-size="10" fill="#475569">the salt makes equal passwords hash differently;</text><text x="10" y="142" font-size="10" fill="#475569">the rounds make every guess slow;</text><text x="10" y="156" font-size="10" fill="#475569">the password itself is never stored</text></svg>
```

**Never store passwords.** The `staff` table keeps, for each role, a random **salt** and a **hash**. A hash is a one-way function: easy to compute from the password, practically impossible to reverse. To check a password, hash what was typed with the same salt and compare.

- **The salt** is random per account, so two accounts with the same password get different hashes, and an attacker can't use a precomputed table of common-password hashes.
- **PBKDF2** runs the hash 100,000 times. You wait a fraction of a second once; someone trying a million guesses waits a million times longer. The browser has it built in: `crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)`. It's `async` (it returns a promise), so `hashPassword` and `signIn` use `await`, and the submit button is disabled while it works.
- **`sameHash(a, b)`** compares every character and combines the differences with `|=`, instead of stopping at the first mismatch. A comparison that stops early takes a little longer the more characters match, and that difference can be measured. This one always takes the same time.

The `STAFF` hashes in the auth block were made from the demo passwords with exactly the settings in `hashPassword()`: 100,000 rounds of SHA-256 and a 256-bit result.

**Sessions.** After a match, `signIn()` creates a **token**: 32 random bytes from `crypto.getRandomValues` (never `Math.random()`, which is predictable), stored in the `sessions` table with an expiry 8 hours later. Every later action passes the token, and `sessionStaff(token)` looks it up, but only if `expires_at > now`. Signing out deletes the row, so the token stops working at once.

**One password, several roles.** `signIn` loads every account named `Gotham Staff` and tries each one's hash until one matches. A wrong password matches none and gets one message: "Wrong username or password". It never says which part was wrong, so it doesn't help a guesser.

The token lives in `state`, in memory. A real site keeps it in a secure, HTTP-only cookie; here, the guide's preview blocks browser storage, and losing the session on reload is fine.

### Try it

Sign in with a wrong password, then with `clinic-demo`. Sign out, and sign in with `front-desk-demo`. In the console: `sessionStaff(state.token, '2026-11-02 18:00')` is `null` — the session expired at 17:40.

check: js | hash with PBKDF2 | /name: 'PBKDF2', hash: 'SHA-256'/
check: js | a salt and hash per role, never the password | /password_hash TEXT NOT NULL/
check: js | constant-time comparison | /function\s+sameHash\s*\(/
check: js | random session tokens | /crypto\.getRandomValues/
check: js | sessions expire | /se\.expires_at > \?/
check: html | a sign-in form | /id="signinForm"/

quiz: Why add a random salt to each password before hashing?
- [ ] To make the hash shorter
- [x] So equal passwords hash differently and precomputed tables of password hashes are useless
- [ ] Salt makes it reversible
why: The salt is stored next to the hash; it is not a secret, just unique.
quiz: Why does sameHash() not stop at the first different character?
- [ ] It is a mistake
- [x] Stopping early takes measurably longer the more characters match, which leaks information
- [ ] Strings must be compared in full in JavaScript
why: This is a constant-time comparison.

```html page
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
<section id="signin" class="signin">
  <form id="signinForm" class="card">
    <h1>Gotham Hospital</h1>
    <p class="muted">Staff sign-in</p>
    <label>Username <input name="username" value="Gotham Staff" autocomplete="username"></label>
    <label>Password <input name="password" type="password" autocomplete="current-password"></label>
    <p id="signinError" class="error" role="alert"></p>
    <button>Sign in</button>
    <p class="muted small">Demo passwords: <code>front-desk-demo</code> (scheduling) or <code>clinic-demo</code> (patient charts)</p>
  </form>
</section>
<div id="app" hidden>
<header class="top">
  <strong>Gotham Hospital</strong> <span class="muted">Patient Portal</span>
    <span id="who" class="who"></span><button id="signOut" class="ghost" type="button">Sign out</button>
</header>
  <nav class="tabs" id="tabs">
    <button data-tab="schedule" class="on">Schedule</button>
    <button data-tab="patients">Patients</button>
    <button data-tab="reports">Reports</button>
  </nav>
<main>
  <section id="schedule" class="view">
    <div class="bar">
      <h2 id="title"></h2>
    </div>
    <div class="layout">
      <div id="grid" class="grid"></div>
    <aside id="panel" class="panel" hidden></aside>
    </div>
  </section>
  <section id="patients" class="view" hidden>
    <input id="search" type="search" placeholder="Search by name, MRN or birth date (YYYY-MM-DD)" autocomplete="off">
    <div class="split"><ul id="results" class="results"></ul><article id="profile" class="profile"></article></div>
  </section>
  <section id="reports" class="view" hidden>
    <h2>This week</h2>
    <table id="daily" class="report"></table>
    <h2>Provider workload</h2>
    <table id="workload" class="report"></table>
  </section>
</main>
</div>
<p class="note">Practice app: every person, phone number and plan here is made up.</p>
```

```js db
// SQLite compiled to WebAssembly (sql.js): a real database inside the page
const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
let db;

const SCHEMA = `
-- Business hours by weekday (0 = Sunday … 6 = Saturday). NULL means closed.
CREATE TABLE clinic_hours (
  weekday INTEGER PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  opens   TEXT,
  closes  TEXT,
  CHECK ((opens IS NULL AND closes IS NULL) OR opens < closes)
);
CREATE TABLE providers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  credential TEXT NOT NULL CHECK (credential IN ('MD', 'DO', 'NP', 'PA')),
  specialty  TEXT NOT NULL,
  room       TEXT
);
-- Each provider's hours on the days they work (Monday–Friday only)
CREATE TABLE provider_hours (
  provider_id  INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  weekday      INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 5),
  starts       TEXT NOT NULL,
  ends         TEXT NOT NULL,
  lunch_starts TEXT,
  lunch_ends   TEXT,
  PRIMARY KEY (provider_id, weekday),
  CHECK (starts < ends)
);
CREATE TABLE patients (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  mrn         TEXT NOT NULL UNIQUE,            -- medical record number, e.g. GH-100231
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  birth_date  TEXT NOT NULL,                   -- YYYY-MM-DD
  sex         TEXT NOT NULL CHECK (sex IN ('F', 'M', 'X')),
  phone       TEXT,
  allergies   TEXT
);
CREATE TABLE insurance (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  coverage   TEXT NOT NULL CHECK (coverage IN ('primary', 'secondary')),
  payer      TEXT NOT NULL,
  plan_name  TEXT,
  member_id  TEXT NOT NULL,
  copay      REAL CHECK (copay >= 0),
  UNIQUE (patient_id, coverage)                -- one primary and one secondary plan at most
);
CREATE TABLE appointments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id  INTEGER NOT NULL REFERENCES providers(id),
  starts_at    TEXT NOT NULL,                  -- YYYY-MM-DD HH:MM
  duration_min INTEGER NOT NULL DEFAULT 30 CHECK (duration_min IN (15, 30, 45, 60)),
  visit_type   TEXT NOT NULL CHECK (visit_type IN ('New patient', 'Follow-up', 'Annual physical', 'Sick visit', 'Procedure', 'Telehealth')),
  reason       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'scheduled'
               CHECK (status IN ('scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'))
);
-- A provider can't have two active visits starting at the same time.
-- Partial index: cancelled visits don't count, so a cancelled slot can be booked again.
CREATE UNIQUE INDEX uq_provider_start ON appointments(provider_id, starts_at) WHERE status <> 'cancelled';
-- Everyone signs in as "Gotham Staff"; each role has its own password, stored only as a salted hash
CREATE TABLE staff (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL COLLATE NOCASE,
  display_name  TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('customer_service', 'medical_staff')),
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  iterations    INTEGER NOT NULL,
  UNIQUE (username, role)
);
-- One row per signed-in session; signing out deletes it
CREATE TABLE sessions (
  token      TEXT PRIMARY KEY,
  staff_id   INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
`;

// Run a query with ? parameters and get rows back as plain objects
function rows(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const out = [];
  while (stmt.step()) out.push(stmt.getAsObject());
  stmt.free();
  return out;
}
const one = (sql, params = []) => rows(sql, params)[0] ?? null;
const run = (sql, params = []) => db.run(sql, params);
const lastId = () => one('SELECT last_insert_rowid() AS id').id;

// Create the tables and load the sample data in one transaction
function build() {
  run('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  run('BEGIN');
  try {
    for (let day = 0; day <= 6; day++) {
      const open = day >= 1 && day <= 5;
      run('INSERT INTO clinic_hours (weekday, opens, closes) VALUES (?, ?, ?)', [day, open ? CLINIC.opens : null, open ? CLINIC.closes : null]);
    }
    PROVIDERS.forEach((p) => {
      run('INSERT INTO providers (first_name, last_name, credential, specialty, room) VALUES (?, ?, ?, ?, ?)', [p.first, p.last, p.credential, p.specialty, p.room]);
      const id = lastId();
      for (let day = 1; day <= 5; day++) {
        if ((p.off ?? []).includes(day)) continue;
        run('INSERT INTO provider_hours VALUES (?, ?, ?, ?, ?, ?)', [id, day, p.hours[0], p.hours[1], p.lunch[0], p.lunch[1]]);
      }
    });
    for (const p of PATIENTS) {
      run('INSERT INTO patients (mrn, first_name, last_name, birth_date, sex, phone, allergies) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [p.mrn, p.first, p.last, p.birth, p.sex, p.phone, p.allergies || null]);
      const id = lastId();
      for (const plan of p.insurance) saveInsurance(id, plan);
    }
    for (const [patient, provider, startsAt, minutes, type, reason, status] of VISITS) {
      run('INSERT INTO appointments (patient_id, provider_id, starts_at, duration_min, visit_type, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [patient + 1, provider + 1, startsAt, minutes, type, reason, status]);
    }
    for (const s of STAFF) {
      run('INSERT INTO staff (username, display_name, role, password_salt, password_hash, iterations) VALUES (?, ?, ?, ?, ?, ?)',
          [USERNAME, s.name, s.role, s.salt, s.hash, s.iterations]);
    }
    run('COMMIT');
  } catch (err) {
    run('ROLLBACK');
    throw err;
  }
}

// ---------- Schedule ----------

/** The providers, with their hours on one weekday (null hours = not working that day) */
function providersOn(date) {
  return rows(`SELECT p.id, p.first_name || ' ' || p.last_name || ', ' || p.credential AS name, p.specialty,
                      h.starts, h.ends, h.lunch_starts AS lunchStarts, h.lunch_ends AS lunchEnds
               FROM providers p LEFT JOIN provider_hours h ON h.provider_id = p.id AND h.weekday = ?
               ORDER BY p.id`, [weekdayOf(date)]);
}

/** Every visit on one day, with the patient's name */
function visitsOn(date) {
  return rows(`SELECT a.id, a.provider_id AS providerId, a.patient_id AS patientId, strftime('%H:%M', a.starts_at) AS starts,
                      a.duration_min AS minutes, a.visit_type AS type, a.reason, a.status,
                      pa.first_name || ' ' || pa.last_name AS patient
               FROM appointments a JOIN patients pa ON pa.id = a.patient_id
               WHERE date(a.starts_at) = ? AND a.status <> 'cancelled'
               ORDER BY a.starts_at`, [date]);
}

const clinicHours = (date) => one('SELECT opens, closes FROM clinic_hours WHERE weekday = ?', [weekdayOf(date)]);

/**
 * Reasons a visit can't be booked, in plain words. An empty list means it can be booked.
 * Checks clinic hours, the provider's hours and lunch, the clock, and overlaps for the provider and the patient.
 */
function bookingProblems({ patientId = null, providerId, startsAt, duration = 30 }, now = NOW) {
  const [date, time] = startsAt.split(' ');
  const start = toMinutes(time);
  const end = start + duration;
  const problems = [];

  const clinic = clinicHours(date);
  if (!clinic?.opens) return ['The clinic is closed on weekends. Business hours are Monday–Friday.'];
  if (start < toMinutes(clinic.opens) || end > toMinutes(clinic.closes)) problems.push(`Outside business hours (${clinic.opens}–${clinic.closes}).`);

  const hours = one('SELECT starts, ends, lunch_starts AS lunchStarts, lunch_ends AS lunchEnds FROM provider_hours WHERE provider_id = ? AND weekday = ?',
    [providerId, weekdayOf(date)]);
  if (!hours) return [...problems, 'This provider does not work on that day.'];
  if (start < toMinutes(hours.starts) || end > toMinutes(hours.ends)) problems.push(`Outside this provider's hours (${hours.starts}–${hours.ends}).`);
  if (hours.lunchStarts && start < toMinutes(hours.lunchEnds) && end > toMinutes(hours.lunchStarts)) {
    problems.push(`Overlaps the provider's lunch break (${hours.lunchStarts}–${hours.lunchEnds}).`);
  }
  if (startsAt < now) problems.push('That time has already passed.');

  // Two visits overlap when one starts before the other ends AND ends after the other starts
  const endsAt = `${date} ${toTime(end)}`;
  const clash = (column, id) => one(`
    SELECT strftime('%H:%M', starts_at) AS starts FROM appointments
    WHERE ${column} = ? AND status <> 'cancelled' AND date(starts_at) = ?
      AND starts_at < ?
      AND strftime('%Y-%m-%d %H:%M', starts_at, '+' || duration_min || ' minutes') > ?
    LIMIT 1`, [id, date, endsAt, startsAt]);
  const theirs = clash('provider_id', providerId);
  if (theirs) problems.push(`The provider already has a visit at ${theirs.starts}.`);
  if (patientId) {
    const mine = clash('patient_id', patientId);
    if (mine) problems.push(`The patient already has a visit at ${mine.starts}.`);
  }
  return problems;
}

/** Open start times for a visit of `duration` minutes, every 15 minutes */
function openSlots(providerId, date, duration = 30, now = NOW) {
  const hours = one('SELECT starts, ends, lunch_starts AS ls, lunch_ends AS le FROM provider_hours WHERE provider_id = ? AND weekday = ?', [providerId, weekdayOf(date)]);
  if (!hours) return [];
  const busy = visitsOn(date).filter((a) => a.providerId === providerId).map((a) => [toMinutes(a.starts), toMinutes(a.starts) + a.minutes]);
  if (hours.ls) busy.push([toMinutes(hours.ls), toMinutes(hours.le)]);
  const slots = [];
  for (let t = toMinutes(hours.starts); t + duration <= toMinutes(hours.ends); t += 15) {
    const free = busy.every(([s, e]) => t + duration <= s || t >= e);
    if (free && `${date} ${toTime(t)}` >= now) slots.push(toTime(t));
  }
  return slots;
}

/** Turns a database error into a message a person can act on */
function friendly(err) {
  const msg = String(err.message || err);
  if (msg.includes('uq_provider_start') || msg.includes('UNIQUE constraint failed: appointments')) return 'That provider already has an appointment at that time.';
  if (msg.includes('CHECK constraint')) return 'One of the values is not allowed.';
  if (msg.includes('FOREIGN KEY')) return 'That patient or provider does not exist.';
  return msg;
}

/** Books a visit: { ok: true, id } or { ok: false, problems } */
function book(visit) {
  const problems = bookingProblems(visit);
  if (!visit.reason?.trim()) problems.push('Enter a reason for the visit.');
  if (problems.length) return { ok: false, problems };
  try {
    run('INSERT INTO appointments (patient_id, provider_id, starts_at, duration_min, visit_type, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [visit.patientId, visit.providerId, visit.startsAt, visit.duration, visit.type, visit.reason.trim()]);
    return { ok: true, id: lastId() };
  } catch (err) {
    return { ok: false, problems: [friendly(err)] };
  }
}

const STATUSES = ['scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'];
function setStatus(id, status) {
  if (!STATUSES.includes(status)) throw new Error(`Unknown status "${status}"`);
  run('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
}
const visit = (id) => one(`SELECT a.id, a.provider_id AS providerId, a.starts_at AS startsAt, a.duration_min AS minutes, a.visit_type AS type,
                                  a.reason, a.status, pa.first_name || ' ' || pa.last_name AS patient
                           FROM appointments a JOIN patients pa ON pa.id = a.patient_id WHERE a.id = ?`, [id]);

// ---------- Patients ----------

/** Adds a plan, or replaces the patient's plan of the same coverage (upsert) */
function saveInsurance(patientId, plan) {
  run(`INSERT INTO insurance (patient_id, coverage, payer, plan_name, member_id, copay) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (patient_id, coverage) DO UPDATE SET
         payer = excluded.payer, plan_name = excluded.plan_name, member_id = excluded.member_id, copay = excluded.copay`,
      [patientId, plan.coverage, plan.payer, plan.plan ?? null, plan.member, plan.copay ?? null]);
}

/** Search by name, MRN or birth date. Every value is a ? parameter, never pasted into the SQL. */
function searchPatients(text) {
  const q = text.trim();
  if (!q) return rows('SELECT id, mrn, first_name || \' \' || last_name AS name, birth_date AS birth FROM patients ORDER BY last_name, first_name LIMIT 50');
  const like = `%${q}%`;
  return rows(`SELECT id, mrn, first_name || ' ' || last_name AS name, birth_date AS birth FROM patients
               WHERE first_name || ' ' || last_name LIKE ? OR last_name LIKE ? OR mrn LIKE ? OR birth_date = ?
               ORDER BY last_name, first_name LIMIT 50`, [like, like, like, q]);
}

function patientProfile(id) {
  const p = one('SELECT * FROM patients WHERE id = ?', [id]);
  if (!p) return null;
  return {
    ...p,
    insurance: rows("SELECT coverage, payer, plan_name AS plan, member_id AS member, copay FROM insurance WHERE patient_id = ? ORDER BY coverage = 'secondary'", [id]),
    visits: rows(`SELECT a.starts_at AS startsAt, a.visit_type AS type, a.status, pr.last_name AS provider
                  FROM appointments a JOIN providers pr ON pr.id = a.provider_id WHERE a.patient_id = ? ORDER BY a.starts_at DESC`, [id]),
  };
}

// ---------- Reports ----------

/** Visits per day: in SQLite a true comparison is 1, so SUM(status = 'x') counts the rows with that status */
function dailyReport(from, to) {
  return rows(`SELECT date(starts_at) AS date, COUNT(*) AS total,
                      SUM(status = 'checked_in') AS checkedIn, SUM(status = 'completed') AS completed, SUM(status = 'no_show') AS noShows
               FROM appointments
               WHERE date(starts_at) BETWEEN ? AND ? AND status <> 'cancelled'
               GROUP BY date(starts_at) ORDER BY date`, [from, to]);
}

/** Each provider's workload. NULLIF turns a 0 divisor into NULL, so a provider with no finished visits shows no rate instead of an error. */
function providerWorkload(from, to) {
  return rows(`SELECT pr.first_name || ' ' || pr.last_name || ', ' || pr.credential AS provider,
                      COUNT(a.id) AS total,
                      COALESCE(SUM(a.status = 'no_show'), 0) AS noShows,
                      ROUND(100.0 * SUM(a.status = 'no_show') / NULLIF(SUM(a.status IN ('completed', 'no_show')), 0), 1) AS noShowPct
               FROM providers pr
               LEFT JOIN appointments a ON a.provider_id = pr.id AND a.status <> 'cancelled' AND date(a.starts_at) BETWEEN ? AND ?
               GROUP BY pr.id ORDER BY total DESC, provider`, [from, to]);
}
```

```js auth
// ---------- Staff sign-in ----------
// Passwords are never stored. Each role keeps a random salt and a PBKDF2-SHA256 hash of its password.
// These were made with the same settings as hashPassword() below, from this guide's demo passwords.
const USERNAME = 'Gotham Staff';
const ITERATIONS = 100000;
const STAFF = [
  { role: 'customer_service', name: 'Customer Service', iterations: ITERATIONS,
    salt: '5f2a9c71d04e8b3a6c19e7d2b8f04a61', hash: 'e2430db7ab3181dabebb8ef999bb367bbd0ced1f78e88260e43303a354292a09' },
  { role: 'medical_staff', name: 'Medical Staff', iterations: ITERATIONS,
    salt: 'c83b16e0a9f2475d1e6a0b9c3d72f5e8', hash: '459b9ed04624a53e106dd08a3ff83559f074d0e31109ac5e75ef6155c06f2fcb' },
];
const SESSION_HOURS = 8;

const toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => new Uint8Array(hex.match(/../g).map((h) => parseInt(h, 16)));
const randomHex = (size) => toHex(crypto.getRandomValues(new Uint8Array(size)));

/** PBKDF2-HMAC-SHA256 with the browser's built-in Web Crypto: slow on purpose, so guessing passwords is slow too */
async function hashPassword(password, saltHex, iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations }, key, 256);
  return toHex(new Uint8Array(bits));
}

/** Compares every character, so the time taken doesn't reveal how much of the hash matched */
function sameHash(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Everyone uses the same username, so the password decides the role: check it against each role's hash */
async function signIn(username, password, now = NOW) {
  const accounts = rows('SELECT id, password_salt AS salt, password_hash AS hash, iterations FROM staff WHERE username = ?', [username.trim()]);
  for (const a of accounts) {
    if (sameHash(await hashPassword(password, a.salt, a.iterations), a.hash)) {
      const token = randomHex(32);                                     // 256 random bits
      const expires = addMinutes(now, SESSION_HOURS * 60);
      run('DELETE FROM sessions WHERE expires_at <= ?', [now]);        // tidy up old sessions
      run('INSERT INTO sessions (token, staff_id, expires_at) VALUES (?, ?, ?)', [token, a.id, expires]);
      return token;
    }
  }
  return null;
}

/** The staff member a token belongs to, or null if it's unknown or expired */
const sessionStaff = (token, now = NOW) => (token ? one(`
  SELECT st.id, st.display_name AS name, st.role FROM sessions se JOIN staff st ON st.id = se.staff_id
  WHERE se.token = ? AND se.expires_at > ?`, [token, now]) : null);

const signOut = (token) => run('DELETE FROM sessions WHERE token = ?', [token]);

/** 'YYYY-MM-DD HH:MM' plus some minutes */
function addMinutes(stamp, minutes) {
  const [date, time] = stamp.split(' ');
  const total = toMinutes(time) + minutes;
  return `${addDays(date, Math.floor(total / 1440))} ${toTime(total % 1440)}`;
}
```

```js ui
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const LONG_DATE = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const longDate = (date) => LONG_DATE.format(parseDate(date));
const state = { date: TODAY, picked: null, token: null };

// What one quarter-hour cell is for one provider: closed, lunch or open
function cellKind(p, t) {
  if (!p.starts || t < toMinutes(p.starts) || t >= toMinutes(p.ends)) return 'closed';
  if (p.lunchStarts && t >= toMinutes(p.lunchStarts) && t < toMinutes(p.lunchEnds)) return 'lunch';
  return 'open';
}

/** One day: a row per quarter hour, a column per provider. A visit fills as many rows as it lasts. */
function drawDay() {
  const providers = providersOn(state.date);
  const visits = visitsOn(state.date);
  const hours = clinicHours(state.date);
  $('title').textContent = longDate(state.date);
  if (!hours?.opens) { $('grid').innerHTML = '<p class="muted" style="padding:12px">The clinic is closed on weekends.</p>'; return; }
  const covered = new Set();          // cells already filled by a longer visit above
  let body = '';
  for (let t = toMinutes(hours.opens); t < toMinutes(hours.closes); t += 15) {
    body += `<tr><td class="time">${t % 60 === 0 ? toTime(t) : ''}</td>`;
    for (const p of providers) {
      const key = `${p.id}|${toTime(t)}`;
      if (covered.has(key)) continue;
      const a = visits.find((x) => x.providerId === p.id && x.starts === toTime(t));
      if (a) {
        const span = a.minutes / 15;
        for (let k = 1; k < span; k++) covered.add(`${p.id}|${toTime(t + 15 * k)}`);
        body += `<td class="visit ${a.status}" rowspan="${span}" data-visit="${a.id}">${esc(a.patient)}<br><small>${esc(a.type)}</small></td>`;
      } else {
        const kind = cellKind(p, t);
        body += kind === 'open' ? `<td class="open" data-slot="${key}"></td>` : `<td class="${kind}"></td>`;
      }
    }
    body += '</tr>';
  }
  $('grid').innerHTML = `<table class="day"><thead><tr><th></th>${providers.map((p) => `<th>${esc(p.name)}<small>${esc(p.specialty)}${p.starts ? ` · ${p.starts}–${p.ends}` : ' · off today'}</small></th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
  if (state.picked) $('grid').querySelector(`[data-slot="${state.picked}"]`)?.classList.add('picked');
}

const TYPES = ['Follow-up', 'New patient', 'Annual physical', 'Sick visit', 'Procedure', 'Telehealth'];
const STATUS_LABEL = { scheduled: 'Scheduled', checked_in: 'Check in', completed: 'Complete', no_show: 'No-show', cancelled: 'Cancel' };

function showPanel(html) {
  $('grid').parentElement.classList.toggle('with-panel', Boolean(html));
  $('panel').hidden = !html;
  $('panel').innerHTML = html || '';
}

/** An open cell: a booking form whose problems update as you change it */
function drawBooking() {
  const [providerId, time] = state.picked.split('|').map((x, i) => (i === 0 ? Number(x) : x));
  const patients = rows('SELECT id, first_name || \' \' || last_name AS name FROM patients ORDER BY last_name');
  if (!true) { showPanel(`<h3>${time}</h3><p class="muted">Your sign-in can view the schedule but not book visits.</p>`); return; }
  showPanel(`<h3>Book at ${time}</h3>
    <label>Patient<select id="bPatient">${patients.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
    <label>Length<select id="bLength">${[15, 30, 45, 60].map((m) => `<option ${m === 30 ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
    <label>Visit type<select id="bType">${TYPES.map((x) => `<option>${x}</option>`).join('')}</select></label>
    <label>Reason<input id="bReason" placeholder="e.g. Cough for a week"></label>
    <div id="bCheck"></div>
    <button class="primary" id="bBook" type="button">Book visit</button>
    <p class="muted small">Other open times: <span id="bSlots"></span></p>`);
  const check = () => {
    const patientId = Number($('bPatient').value), duration = Number($('bLength').value), startsAt = `${state.date} ${time}`;
    const problems = bookingProblems({ patientId, providerId, startsAt, duration });
    $('bCheck').innerHTML = problems.length ? `<ul class="problems">${problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : '<p class="ok">Open: this visit can be booked.</p>';
    $('bSlots').textContent = openSlots(providerId, state.date, duration).slice(0, 8).join(', ') || 'none';
  };
  ['bPatient', 'bLength'].forEach((id) => $(id).addEventListener('change', check));
  check();
  $('bBook').addEventListener('click', () => {
    const visitArgs = { patientId: Number($('bPatient').value), providerId, startsAt: `${state.date} ${time}`,
                        duration: Number($('bLength').value), type: $('bType').value, reason: $('bReason').value };
    const result = book(visitArgs);
    if (!result.ok) { $('bCheck').innerHTML = `<ul class="problems">${result.problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`; return; }
    state.picked = null;
    showPanel('');
    drawDay();
  });
}

/** A booked visit: its details and the status buttons */
function drawVisit(id) {
  const a = visit(id);
  const buttons = true ? Object.entries(STATUS_LABEL).filter(([s]) => s !== a.status && s !== 'scheduled')
    .map(([s, label]) => `<button class="ghost" data-status="${s}" type="button">${label}</button>`).join('') +
    (a.status !== 'scheduled' ? '<button class="ghost" data-status="scheduled" type="button">Reinstate</button>' : '') : '';
  showPanel(`<h3>${esc(a.patient)}</h3><p>${a.startsAt.slice(11)} · ${a.minutes} min · ${esc(a.type)}<br>${esc(a.reason)}</p>
    <p class="muted">Status: ${a.status.replace('_', ' ')}</p><div class="statuses">${buttons}</div>`);
  $('panel').querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => {
    setStatus(id, b.dataset.status);
    drawDay();
    drawVisit(id);
  }));
}

function drawResults(text = $('search').value) {
  const list = searchPatients(text);
  $('results').innerHTML = list.length ? list.map((p) => `<li data-patient="${p.id}">${esc(p.name)}<small>${esc(p.mrn)} · born ${esc(p.birth)}</small></li>`).join('')
    : '<li class="muted">No patients match.</li>';
}

function drawProfile(id) {
  const p = patientProfile(id);
  $('profile').innerHTML = `<h3>${esc(p.first_name)} ${esc(p.last_name)}</h3>
    <dl><dt>MRN</dt><dd>${esc(p.mrn)}</dd><dt>Born</dt><dd>${esc(p.birth_date)}</dd><dt>Sex</dt><dd>${esc(p.sex)}</dd>
    <dt>Phone</dt><dd>${esc(p.phone)}</dd><dt>Allergies</dt><dd>${esc(p.allergies || 'None recorded')}</dd></dl>
    <h4>Insurance</h4>${p.insurance.length ? p.insurance.map((i) => `<p><strong>${i.coverage === 'primary' ? 'Primary' : 'Secondary'}:</strong> ${esc(i.payer)} ${esc(i.plan || '')} · member ${esc(i.member)}${i.copay != null ? ` · $${i.copay} copay` : ''}</p>`).join('') : '<p class="muted">Self-pay (no plan on file)</p>'}
    <h4>Visits</h4><ul>${p.visits.map((a) => `<li>${a.startsAt} · ${esc(a.type)} with ${esc(a.provider)} · ${a.status.replace('_', ' ')}</li>`).join('') || '<li class="muted">None</li>'}</ul>`;
}

function drawReports() {
  const from = TODAY, to = addDays(TODAY, 4);          // Monday–Friday of the demo week
  const days = dailyReport(from, to);
  $('daily').innerHTML = '<tr><th>Day</th><th>Visits</th><th>Checked in</th><th>Completed</th><th>No-shows</th></tr>' +
    days.map((d) => `<tr><td>${d.date}</td><td class="n">${d.total}</td><td class="n">${d.checkedIn}</td><td class="n">${d.completed}</td><td class="n">${d.noShows}</td></tr>`).join('');
  $('workload').innerHTML = '<tr><th>Provider</th><th>Visits</th><th>No-shows</th><th>No-show rate</th></tr>' +
    providerWorkload(from, to).map((w) => `<tr><td>${esc(w.provider)}</td><td class="n">${w.total}</td><td class="n">${w.noShows}</td><td class="n">${w.noShowPct == null ? '–' : `${w.noShowPct}%`}</td></tr>`).join('');
}

function showSignIn(message = '') {
  state.token = null;
  $('app').hidden = true;
  $('signin').hidden = false;
  $('signinError').textContent = message;
}

function enterApp() {
  const staff = sessionStaff(state.token);
  $('who').textContent = `Gotham Staff · ${staff.name}`;
  $('signin').hidden = true;
  $('app').hidden = false;
  showTab('schedule');
}

$('signinForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const button = e.target.querySelector('button');
  button.disabled = true;
  $('signinError').textContent = '';
  const token = await signIn(String(form.get('username')), String(form.get('password')));
  button.disabled = false;
  if (!token) { $('signinError').textContent = 'Wrong username or password'; return; }
  state.token = token;          // kept in memory only: this page's storage may be blocked
  e.target.password.value = '';
  enterApp();
});

$('signOut').addEventListener('click', () => {
  signOut(state.token);
  showSignIn();
});

function showTab(tab) {
  document.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  document.querySelectorAll('.view').forEach((s) => { s.hidden = s.id !== tab; });
  if (tab === 'schedule') drawDay();
  if (tab === 'patients') drawResults();
  if (tab === 'reports') drawReports();
}
$('tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });
$('search').addEventListener('input', (e) => drawResults(e.target.value));
$('results').addEventListener('click', (e) => { const li = e.target.closest('[data-patient]'); if (li) drawProfile(Number(li.dataset.patient)); });

$('grid').addEventListener('click', (e) => {
  const slot = e.target.closest('[data-slot]');
  const booked = e.target.closest('[data-visit]');
  if (slot) {
    state.picked = state.picked === slot.dataset.slot ? null : slot.dataset.slot;
    drawDay();
    if (state.picked) drawBooking(); else showPanel('');
  } else if (booked) {
    state.picked = null;
    drawDay();
    drawVisit(Number(booked.dataset.visit));
  }
});

// Load SQLite, build the database, then draw the page
initSqlJs({ locateFile: (file) => SQLJS + file })
  .then((SQL) => {
    db = new SQL.Database();
    build();
    showSignIn();
  })
  .catch((err) => {
    document.body.insertAdjacentHTML('afterbegin', `<p class="error" style="padding:12px">Couldn't start the database: ${esc(err.message)}</p>`);
    console.error(err);
  });
```

## Step: Roles and permissions
time: 30

Signed in isn't the same as allowed. Customer service books visits and runs reports but must not read medical charts; medical staff read charts but don't book. This step puts **one door** in front of every action.

```svg Each role has a list of permissions; everything else is refused
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 180" font-family="sans-serif"><text x="150" y="20" font-weight="700" font-size="11">customer service</text><text x="290" y="20" font-weight="700" font-size="11">medical staff</text><text x="10" y="46" font-family="monospace" font-size="10">schedule:read</text><rect x="180" y="32" width="40" height="18" rx="4" fill="#dcfce7"/><text x="200" y="45" text-anchor="middle" font-size="11">✓</text><rect x="320" y="32" width="40" height="18" rx="4" fill="#dcfce7"/><text x="340" y="45" text-anchor="middle" font-size="11">✓</text><text x="10" y="70" font-family="monospace" font-size="10">schedule:write</text><rect x="180" y="56" width="40" height="18" rx="4" fill="#dcfce7"/><text x="200" y="69" text-anchor="middle" font-size="11">✓</text><rect x="320" y="56" width="40" height="18" rx="4" fill="#fee2e2"/><text x="340" y="69" text-anchor="middle" font-size="11">403</text><text x="10" y="94" font-family="monospace" font-size="10">patients:search</text><rect x="180" y="80" width="40" height="18" rx="4" fill="#dcfce7"/><text x="200" y="93" text-anchor="middle" font-size="11">✓</text><rect x="320" y="80" width="40" height="18" rx="4" fill="#dcfce7"/><text x="340" y="93" text-anchor="middle" font-size="11">✓</text><text x="10" y="118" font-family="monospace" font-size="10">patients</text><rect x="180" y="104" width="40" height="18" rx="4" fill="#fee2e2"/><text x="200" y="117" text-anchor="middle" font-size="11">403</text><rect x="320" y="104" width="40" height="18" rx="4" fill="#dcfce7"/><text x="340" y="117" text-anchor="middle" font-size="11">✓</text><text x="10" y="142" font-family="monospace" font-size="10">reports</text><rect x="180" y="128" width="40" height="18" rx="4" fill="#dcfce7"/><text x="200" y="141" text-anchor="middle" font-size="11">✓</text><rect x="320" y="128" width="40" height="18" rx="4" fill="#fee2e2"/><text x="340" y="141" text-anchor="middle" font-size="11">403</text><text x="215" y="170" text-anchor="middle" font-size="11" fill="#475569">no session → 401; a session without the permission → 403</text></svg>
```

**Permissions, not role checks.** `PERMISSIONS` lists what each role may do, and `can(staff, permission)` asks the list. The code never says `if (role === 'medical_staff')`: adding a role, or giving one more permission, is a one-line change in one place.

**One door: `api(token, action, args)`.** `ACTIONS` maps every request the page makes (`day`, `book`, `profile`, `workload`…) to the permission it needs and the function that does it. `api()`:

1. no valid session → `{ status: 401, … }` *Unauthorized*: "who are you?";
2. unknown action → 404;
3. session without the permission → `{ status: 403, … }` *Forbidden*: "I know who you are, and no";
4. otherwise runs it → 200.

These are the real HTTP status codes, and this is how the real project's `routes.js` works, only there the requests arrive over the network. Every page function now goes through `call()`, which calls `api()` and sends you back to sign-in on a 401.

**Hiding isn't securing.** `enterApp()` hides the tabs a role can't use, which keeps the page tidy. But hidden buttons can be un-hidden in the browser's developer tools; the real protection is the check in `api()`, which runs on every request. Try it: signed in as customer service, run `api(state.token, 'profile', { id: 1 })` in the console. It answers 403, with no chart.

**What each role sees.** Customer service: schedule, booking, patient names in search (to book them), reports. Medical staff: schedule (read only, no booking form or status buttons), search, and full charts. A chart opened by customer service says why it's blocked.

### Try it

Sign in as each role and compare the tabs and the panel. Try `api(null, 'day', { date: TODAY })` in the console: 401.

check: js | what each role may do | /const\s+PERMISSIONS\s*=/
check: js | one door for every action | /function\s+api\s*\(/
check: js | not signed in | /status: 401/
check: js | not allowed | /status: 403/
check: js | the page asks through the door | /function\s+call\s*\(/

quiz: What is the difference between 401 and 403?
- [ ] None
- [x] 401: no valid sign-in; 403: signed in, but this role may not do that
- [ ] 403 means the server crashed
why: Authentication is who you are; authorization is what you may do.
quiz: Why is hiding the Reports tab from medical staff not enough?
- [ ] It is enough
- [x] Anyone can un-hide it in developer tools; only the check in api() actually stops the request
- [ ] Tabs cannot be hidden
why: Check permissions where the data is, on every request.

```html page
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
<section id="signin" class="signin">
  <form id="signinForm" class="card">
    <h1>Gotham Hospital</h1>
    <p class="muted">Staff sign-in</p>
    <label>Username <input name="username" value="Gotham Staff" autocomplete="username"></label>
    <label>Password <input name="password" type="password" autocomplete="current-password"></label>
    <p id="signinError" class="error" role="alert"></p>
    <button>Sign in</button>
    <p class="muted small">Demo passwords: <code>front-desk-demo</code> (scheduling) or <code>clinic-demo</code> (patient charts)</p>
  </form>
</section>
<div id="app" hidden>
<header class="top">
  <strong>Gotham Hospital</strong> <span class="muted">Patient Portal</span>
    <span id="who" class="who"></span><button id="signOut" class="ghost" type="button">Sign out</button>
</header>
  <nav class="tabs" id="tabs">
    <button data-tab="schedule" class="on">Schedule</button>
    <button data-tab="patients">Patients</button>
    <button data-tab="reports">Reports</button>
  </nav>
<main>
  <section id="schedule" class="view">
    <div class="bar">
      <h2 id="title"></h2>
    </div>
    <div class="layout">
      <div id="grid" class="grid"></div>
    <aside id="panel" class="panel" hidden></aside>
    </div>
  </section>
  <section id="patients" class="view" hidden>
    <input id="search" type="search" placeholder="Search by name, MRN or birth date (YYYY-MM-DD)" autocomplete="off">
    <div class="split"><ul id="results" class="results"></ul><article id="profile" class="profile"></article></div>
  </section>
  <section id="reports" class="view" hidden>
    <h2>This week</h2>
    <table id="daily" class="report"></table>
    <h2>Provider workload</h2>
    <table id="workload" class="report"></table>
  </section>
</main>
</div>
<p class="note">Practice app: every person, phone number and plan here is made up.</p>
```

```js db
// SQLite compiled to WebAssembly (sql.js): a real database inside the page
const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
let db;

const SCHEMA = `
-- Business hours by weekday (0 = Sunday … 6 = Saturday). NULL means closed.
CREATE TABLE clinic_hours (
  weekday INTEGER PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  opens   TEXT,
  closes  TEXT,
  CHECK ((opens IS NULL AND closes IS NULL) OR opens < closes)
);
CREATE TABLE providers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  credential TEXT NOT NULL CHECK (credential IN ('MD', 'DO', 'NP', 'PA')),
  specialty  TEXT NOT NULL,
  room       TEXT
);
-- Each provider's hours on the days they work (Monday–Friday only)
CREATE TABLE provider_hours (
  provider_id  INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  weekday      INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 5),
  starts       TEXT NOT NULL,
  ends         TEXT NOT NULL,
  lunch_starts TEXT,
  lunch_ends   TEXT,
  PRIMARY KEY (provider_id, weekday),
  CHECK (starts < ends)
);
CREATE TABLE patients (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  mrn         TEXT NOT NULL UNIQUE,            -- medical record number, e.g. GH-100231
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  birth_date  TEXT NOT NULL,                   -- YYYY-MM-DD
  sex         TEXT NOT NULL CHECK (sex IN ('F', 'M', 'X')),
  phone       TEXT,
  allergies   TEXT
);
CREATE TABLE insurance (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  coverage   TEXT NOT NULL CHECK (coverage IN ('primary', 'secondary')),
  payer      TEXT NOT NULL,
  plan_name  TEXT,
  member_id  TEXT NOT NULL,
  copay      REAL CHECK (copay >= 0),
  UNIQUE (patient_id, coverage)                -- one primary and one secondary plan at most
);
CREATE TABLE appointments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id  INTEGER NOT NULL REFERENCES providers(id),
  starts_at    TEXT NOT NULL,                  -- YYYY-MM-DD HH:MM
  duration_min INTEGER NOT NULL DEFAULT 30 CHECK (duration_min IN (15, 30, 45, 60)),
  visit_type   TEXT NOT NULL CHECK (visit_type IN ('New patient', 'Follow-up', 'Annual physical', 'Sick visit', 'Procedure', 'Telehealth')),
  reason       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'scheduled'
               CHECK (status IN ('scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'))
);
-- A provider can't have two active visits starting at the same time.
-- Partial index: cancelled visits don't count, so a cancelled slot can be booked again.
CREATE UNIQUE INDEX uq_provider_start ON appointments(provider_id, starts_at) WHERE status <> 'cancelled';
-- Everyone signs in as "Gotham Staff"; each role has its own password, stored only as a salted hash
CREATE TABLE staff (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL COLLATE NOCASE,
  display_name  TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('customer_service', 'medical_staff')),
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  iterations    INTEGER NOT NULL,
  UNIQUE (username, role)
);
-- One row per signed-in session; signing out deletes it
CREATE TABLE sessions (
  token      TEXT PRIMARY KEY,
  staff_id   INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
`;

// Run a query with ? parameters and get rows back as plain objects
function rows(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const out = [];
  while (stmt.step()) out.push(stmt.getAsObject());
  stmt.free();
  return out;
}
const one = (sql, params = []) => rows(sql, params)[0] ?? null;
const run = (sql, params = []) => db.run(sql, params);
const lastId = () => one('SELECT last_insert_rowid() AS id').id;

// Create the tables and load the sample data in one transaction
function build() {
  run('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  run('BEGIN');
  try {
    for (let day = 0; day <= 6; day++) {
      const open = day >= 1 && day <= 5;
      run('INSERT INTO clinic_hours (weekday, opens, closes) VALUES (?, ?, ?)', [day, open ? CLINIC.opens : null, open ? CLINIC.closes : null]);
    }
    PROVIDERS.forEach((p) => {
      run('INSERT INTO providers (first_name, last_name, credential, specialty, room) VALUES (?, ?, ?, ?, ?)', [p.first, p.last, p.credential, p.specialty, p.room]);
      const id = lastId();
      for (let day = 1; day <= 5; day++) {
        if ((p.off ?? []).includes(day)) continue;
        run('INSERT INTO provider_hours VALUES (?, ?, ?, ?, ?, ?)', [id, day, p.hours[0], p.hours[1], p.lunch[0], p.lunch[1]]);
      }
    });
    for (const p of PATIENTS) {
      run('INSERT INTO patients (mrn, first_name, last_name, birth_date, sex, phone, allergies) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [p.mrn, p.first, p.last, p.birth, p.sex, p.phone, p.allergies || null]);
      const id = lastId();
      for (const plan of p.insurance) saveInsurance(id, plan);
    }
    for (const [patient, provider, startsAt, minutes, type, reason, status] of VISITS) {
      run('INSERT INTO appointments (patient_id, provider_id, starts_at, duration_min, visit_type, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [patient + 1, provider + 1, startsAt, minutes, type, reason, status]);
    }
    for (const s of STAFF) {
      run('INSERT INTO staff (username, display_name, role, password_salt, password_hash, iterations) VALUES (?, ?, ?, ?, ?, ?)',
          [USERNAME, s.name, s.role, s.salt, s.hash, s.iterations]);
    }
    run('COMMIT');
  } catch (err) {
    run('ROLLBACK');
    throw err;
  }
}

// ---------- Schedule ----------

/** The providers, with their hours on one weekday (null hours = not working that day) */
function providersOn(date) {
  return rows(`SELECT p.id, p.first_name || ' ' || p.last_name || ', ' || p.credential AS name, p.specialty,
                      h.starts, h.ends, h.lunch_starts AS lunchStarts, h.lunch_ends AS lunchEnds
               FROM providers p LEFT JOIN provider_hours h ON h.provider_id = p.id AND h.weekday = ?
               ORDER BY p.id`, [weekdayOf(date)]);
}

/** Every visit on one day, with the patient's name */
function visitsOn(date) {
  return rows(`SELECT a.id, a.provider_id AS providerId, a.patient_id AS patientId, strftime('%H:%M', a.starts_at) AS starts,
                      a.duration_min AS minutes, a.visit_type AS type, a.reason, a.status,
                      pa.first_name || ' ' || pa.last_name AS patient
               FROM appointments a JOIN patients pa ON pa.id = a.patient_id
               WHERE date(a.starts_at) = ? AND a.status <> 'cancelled'
               ORDER BY a.starts_at`, [date]);
}

const clinicHours = (date) => one('SELECT opens, closes FROM clinic_hours WHERE weekday = ?', [weekdayOf(date)]);

/**
 * Reasons a visit can't be booked, in plain words. An empty list means it can be booked.
 * Checks clinic hours, the provider's hours and lunch, the clock, and overlaps for the provider and the patient.
 */
function bookingProblems({ patientId = null, providerId, startsAt, duration = 30 }, now = NOW) {
  const [date, time] = startsAt.split(' ');
  const start = toMinutes(time);
  const end = start + duration;
  const problems = [];

  const clinic = clinicHours(date);
  if (!clinic?.opens) return ['The clinic is closed on weekends. Business hours are Monday–Friday.'];
  if (start < toMinutes(clinic.opens) || end > toMinutes(clinic.closes)) problems.push(`Outside business hours (${clinic.opens}–${clinic.closes}).`);

  const hours = one('SELECT starts, ends, lunch_starts AS lunchStarts, lunch_ends AS lunchEnds FROM provider_hours WHERE provider_id = ? AND weekday = ?',
    [providerId, weekdayOf(date)]);
  if (!hours) return [...problems, 'This provider does not work on that day.'];
  if (start < toMinutes(hours.starts) || end > toMinutes(hours.ends)) problems.push(`Outside this provider's hours (${hours.starts}–${hours.ends}).`);
  if (hours.lunchStarts && start < toMinutes(hours.lunchEnds) && end > toMinutes(hours.lunchStarts)) {
    problems.push(`Overlaps the provider's lunch break (${hours.lunchStarts}–${hours.lunchEnds}).`);
  }
  if (startsAt < now) problems.push('That time has already passed.');

  // Two visits overlap when one starts before the other ends AND ends after the other starts
  const endsAt = `${date} ${toTime(end)}`;
  const clash = (column, id) => one(`
    SELECT strftime('%H:%M', starts_at) AS starts FROM appointments
    WHERE ${column} = ? AND status <> 'cancelled' AND date(starts_at) = ?
      AND starts_at < ?
      AND strftime('%Y-%m-%d %H:%M', starts_at, '+' || duration_min || ' minutes') > ?
    LIMIT 1`, [id, date, endsAt, startsAt]);
  const theirs = clash('provider_id', providerId);
  if (theirs) problems.push(`The provider already has a visit at ${theirs.starts}.`);
  if (patientId) {
    const mine = clash('patient_id', patientId);
    if (mine) problems.push(`The patient already has a visit at ${mine.starts}.`);
  }
  return problems;
}

/** Open start times for a visit of `duration` minutes, every 15 minutes */
function openSlots(providerId, date, duration = 30, now = NOW) {
  const hours = one('SELECT starts, ends, lunch_starts AS ls, lunch_ends AS le FROM provider_hours WHERE provider_id = ? AND weekday = ?', [providerId, weekdayOf(date)]);
  if (!hours) return [];
  const busy = visitsOn(date).filter((a) => a.providerId === providerId).map((a) => [toMinutes(a.starts), toMinutes(a.starts) + a.minutes]);
  if (hours.ls) busy.push([toMinutes(hours.ls), toMinutes(hours.le)]);
  const slots = [];
  for (let t = toMinutes(hours.starts); t + duration <= toMinutes(hours.ends); t += 15) {
    const free = busy.every(([s, e]) => t + duration <= s || t >= e);
    if (free && `${date} ${toTime(t)}` >= now) slots.push(toTime(t));
  }
  return slots;
}

/** Turns a database error into a message a person can act on */
function friendly(err) {
  const msg = String(err.message || err);
  if (msg.includes('uq_provider_start') || msg.includes('UNIQUE constraint failed: appointments')) return 'That provider already has an appointment at that time.';
  if (msg.includes('CHECK constraint')) return 'One of the values is not allowed.';
  if (msg.includes('FOREIGN KEY')) return 'That patient or provider does not exist.';
  return msg;
}

/** Books a visit: { ok: true, id } or { ok: false, problems } */
function book(visit) {
  const problems = bookingProblems(visit);
  if (!visit.reason?.trim()) problems.push('Enter a reason for the visit.');
  if (problems.length) return { ok: false, problems };
  try {
    run('INSERT INTO appointments (patient_id, provider_id, starts_at, duration_min, visit_type, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [visit.patientId, visit.providerId, visit.startsAt, visit.duration, visit.type, visit.reason.trim()]);
    return { ok: true, id: lastId() };
  } catch (err) {
    return { ok: false, problems: [friendly(err)] };
  }
}

const STATUSES = ['scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'];
function setStatus(id, status) {
  if (!STATUSES.includes(status)) throw new Error(`Unknown status "${status}"`);
  run('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
}
const visit = (id) => one(`SELECT a.id, a.provider_id AS providerId, a.starts_at AS startsAt, a.duration_min AS minutes, a.visit_type AS type,
                                  a.reason, a.status, pa.first_name || ' ' || pa.last_name AS patient
                           FROM appointments a JOIN patients pa ON pa.id = a.patient_id WHERE a.id = ?`, [id]);

// ---------- Patients ----------

/** Adds a plan, or replaces the patient's plan of the same coverage (upsert) */
function saveInsurance(patientId, plan) {
  run(`INSERT INTO insurance (patient_id, coverage, payer, plan_name, member_id, copay) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (patient_id, coverage) DO UPDATE SET
         payer = excluded.payer, plan_name = excluded.plan_name, member_id = excluded.member_id, copay = excluded.copay`,
      [patientId, plan.coverage, plan.payer, plan.plan ?? null, plan.member, plan.copay ?? null]);
}

/** Search by name, MRN or birth date. Every value is a ? parameter, never pasted into the SQL. */
function searchPatients(text) {
  const q = text.trim();
  if (!q) return rows('SELECT id, mrn, first_name || \' \' || last_name AS name, birth_date AS birth FROM patients ORDER BY last_name, first_name LIMIT 50');
  const like = `%${q}%`;
  return rows(`SELECT id, mrn, first_name || ' ' || last_name AS name, birth_date AS birth FROM patients
               WHERE first_name || ' ' || last_name LIKE ? OR last_name LIKE ? OR mrn LIKE ? OR birth_date = ?
               ORDER BY last_name, first_name LIMIT 50`, [like, like, like, q]);
}

function patientProfile(id) {
  const p = one('SELECT * FROM patients WHERE id = ?', [id]);
  if (!p) return null;
  return {
    ...p,
    insurance: rows("SELECT coverage, payer, plan_name AS plan, member_id AS member, copay FROM insurance WHERE patient_id = ? ORDER BY coverage = 'secondary'", [id]),
    visits: rows(`SELECT a.starts_at AS startsAt, a.visit_type AS type, a.status, pr.last_name AS provider
                  FROM appointments a JOIN providers pr ON pr.id = a.provider_id WHERE a.patient_id = ? ORDER BY a.starts_at DESC`, [id]),
  };
}

// ---------- Reports ----------

/** Visits per day: in SQLite a true comparison is 1, so SUM(status = 'x') counts the rows with that status */
function dailyReport(from, to) {
  return rows(`SELECT date(starts_at) AS date, COUNT(*) AS total,
                      SUM(status = 'checked_in') AS checkedIn, SUM(status = 'completed') AS completed, SUM(status = 'no_show') AS noShows
               FROM appointments
               WHERE date(starts_at) BETWEEN ? AND ? AND status <> 'cancelled'
               GROUP BY date(starts_at) ORDER BY date`, [from, to]);
}

/** Each provider's workload. NULLIF turns a 0 divisor into NULL, so a provider with no finished visits shows no rate instead of an error. */
function providerWorkload(from, to) {
  return rows(`SELECT pr.first_name || ' ' || pr.last_name || ', ' || pr.credential AS provider,
                      COUNT(a.id) AS total,
                      COALESCE(SUM(a.status = 'no_show'), 0) AS noShows,
                      ROUND(100.0 * SUM(a.status = 'no_show') / NULLIF(SUM(a.status IN ('completed', 'no_show')), 0), 1) AS noShowPct
               FROM providers pr
               LEFT JOIN appointments a ON a.provider_id = pr.id AND a.status <> 'cancelled' AND date(a.starts_at) BETWEEN ? AND ?
               GROUP BY pr.id ORDER BY total DESC, provider`, [from, to]);
}
```

```js auth
// ---------- Staff sign-in ----------
// Passwords are never stored. Each role keeps a random salt and a PBKDF2-SHA256 hash of its password.
// These were made with the same settings as hashPassword() below, from this guide's demo passwords.
const USERNAME = 'Gotham Staff';
const ITERATIONS = 100000;
const STAFF = [
  { role: 'customer_service', name: 'Customer Service', iterations: ITERATIONS,
    salt: '5f2a9c71d04e8b3a6c19e7d2b8f04a61', hash: 'e2430db7ab3181dabebb8ef999bb367bbd0ced1f78e88260e43303a354292a09' },
  { role: 'medical_staff', name: 'Medical Staff', iterations: ITERATIONS,
    salt: 'c83b16e0a9f2475d1e6a0b9c3d72f5e8', hash: '459b9ed04624a53e106dd08a3ff83559f074d0e31109ac5e75ef6155c06f2fcb' },
];
const SESSION_HOURS = 8;

const toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => new Uint8Array(hex.match(/../g).map((h) => parseInt(h, 16)));
const randomHex = (size) => toHex(crypto.getRandomValues(new Uint8Array(size)));

/** PBKDF2-HMAC-SHA256 with the browser's built-in Web Crypto: slow on purpose, so guessing passwords is slow too */
async function hashPassword(password, saltHex, iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations }, key, 256);
  return toHex(new Uint8Array(bits));
}

/** Compares every character, so the time taken doesn't reveal how much of the hash matched */
function sameHash(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Everyone uses the same username, so the password decides the role: check it against each role's hash */
async function signIn(username, password, now = NOW) {
  const accounts = rows('SELECT id, password_salt AS salt, password_hash AS hash, iterations FROM staff WHERE username = ?', [username.trim()]);
  for (const a of accounts) {
    if (sameHash(await hashPassword(password, a.salt, a.iterations), a.hash)) {
      const token = randomHex(32);                                     // 256 random bits
      const expires = addMinutes(now, SESSION_HOURS * 60);
      run('DELETE FROM sessions WHERE expires_at <= ?', [now]);        // tidy up old sessions
      run('INSERT INTO sessions (token, staff_id, expires_at) VALUES (?, ?, ?)', [token, a.id, expires]);
      return token;
    }
  }
  return null;
}

/** The staff member a token belongs to, or null if it's unknown or expired */
const sessionStaff = (token, now = NOW) => (token ? one(`
  SELECT st.id, st.display_name AS name, st.role FROM sessions se JOIN staff st ON st.id = se.staff_id
  WHERE se.token = ? AND se.expires_at > ?`, [token, now]) : null);

const signOut = (token) => run('DELETE FROM sessions WHERE token = ?', [token]);

/** 'YYYY-MM-DD HH:MM' plus some minutes */
function addMinutes(stamp, minutes) {
  const [date, time] = stamp.split(' ');
  const total = toMinutes(time) + minutes;
  return `${addDays(date, Math.floor(total / 1440))} ${toTime(total % 1440)}`;
}

// ---------- Roles ----------
// What each role may do. Customer service books visits and sees names, but only medical staff open a patient's chart.
const PERMISSIONS = {
  customer_service: ['schedule:read', 'schedule:write', 'patients:search', 'reports'],
  medical_staff: ['schedule:read', 'patients:search', 'patients'],
};
const can = (staff, permission) => Boolean(staff && PERMISSIONS[staff.role]?.includes(permission));

// Every action the page can ask for, with the permission it needs
const ACTIONS = {
  day: { needs: 'schedule:read', run: ({ date }) => ({ providers: providersOn(date), visits: visitsOn(date) }) },
  problems: { needs: 'schedule:read', run: (args) => bookingProblems(args) },
  slots: { needs: 'schedule:read', run: ({ providerId, date, duration }) => openSlots(providerId, date, duration) },
  book: { needs: 'schedule:write', run: (args) => book(args) },
  status: { needs: 'schedule:write', run: ({ id, status }) => setStatus(id, status) },
  search: { needs: 'patients:search', run: ({ text }) => searchPatients(text) },
  profile: { needs: 'patients', run: ({ id }) => patientProfile(id) },
  daily: { needs: 'reports', run: ({ from, to }) => dailyReport(from, to) },
  workload: { needs: 'reports', run: ({ from, to }) => providerWorkload(from, to) },
};

/** One door for every request: no session is 401, a role without the permission is 403 */
function api(token, action, args = {}) {
  const staff = sessionStaff(token);
  if (!staff) return { status: 401, body: { error: 'Please sign in' } };
  const a = ACTIONS[action];
  if (!a) return { status: 404, body: { error: `No action "${action}"` } };
  if (!can(staff, a.needs)) return { status: 403, body: { error: 'Your sign-in does not have access to this' } };
  return { status: 200, body: a.run(args) ?? null };
}
```

```js ui
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const LONG_DATE = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const longDate = (date) => LONG_DATE.format(parseDate(date));
const state = { date: TODAY, picked: null, token: null };

/** Calls api() with this session; a 401 sends you back to sign-in */
function call(action, args) {
  const res = api(state.token, action, args);
  if (res.status === 401) { showSignIn('Your session ended. Please sign in again.'); throw new Error('signed out'); }
  return res;
}

// What one quarter-hour cell is for one provider: closed, lunch or open
function cellKind(p, t) {
  if (!p.starts || t < toMinutes(p.starts) || t >= toMinutes(p.ends)) return 'closed';
  if (p.lunchStarts && t >= toMinutes(p.lunchStarts) && t < toMinutes(p.lunchEnds)) return 'lunch';
  return 'open';
}

/** One day: a row per quarter hour, a column per provider. A visit fills as many rows as it lasts. */
function drawDay() {
  const { providers, visits } = call('day', { date: state.date }).body;
  const hours = clinicHours(state.date);
  $('title').textContent = longDate(state.date);
  if (!hours?.opens) { $('grid').innerHTML = '<p class="muted" style="padding:12px">The clinic is closed on weekends.</p>'; return; }
  const covered = new Set();          // cells already filled by a longer visit above
  let body = '';
  for (let t = toMinutes(hours.opens); t < toMinutes(hours.closes); t += 15) {
    body += `<tr><td class="time">${t % 60 === 0 ? toTime(t) : ''}</td>`;
    for (const p of providers) {
      const key = `${p.id}|${toTime(t)}`;
      if (covered.has(key)) continue;
      const a = visits.find((x) => x.providerId === p.id && x.starts === toTime(t));
      if (a) {
        const span = a.minutes / 15;
        for (let k = 1; k < span; k++) covered.add(`${p.id}|${toTime(t + 15 * k)}`);
        body += `<td class="visit ${a.status}" rowspan="${span}" data-visit="${a.id}">${esc(a.patient)}<br><small>${esc(a.type)}</small></td>`;
      } else {
        const kind = cellKind(p, t);
        body += kind === 'open' ? `<td class="open" data-slot="${key}"></td>` : `<td class="${kind}"></td>`;
      }
    }
    body += '</tr>';
  }
  $('grid').innerHTML = `<table class="day"><thead><tr><th></th>${providers.map((p) => `<th>${esc(p.name)}<small>${esc(p.specialty)}${p.starts ? ` · ${p.starts}–${p.ends}` : ' · off today'}</small></th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
  if (state.picked) $('grid').querySelector(`[data-slot="${state.picked}"]`)?.classList.add('picked');
}

const TYPES = ['Follow-up', 'New patient', 'Annual physical', 'Sick visit', 'Procedure', 'Telehealth'];
const STATUS_LABEL = { scheduled: 'Scheduled', checked_in: 'Check in', completed: 'Complete', no_show: 'No-show', cancelled: 'Cancel' };

function showPanel(html) {
  $('grid').parentElement.classList.toggle('with-panel', Boolean(html));
  $('panel').hidden = !html;
  $('panel').innerHTML = html || '';
}

/** An open cell: a booking form whose problems update as you change it */
function drawBooking() {
  const [providerId, time] = state.picked.split('|').map((x, i) => (i === 0 ? Number(x) : x));
  const patients = call('search', { text: '' }).body;
  if (!can(sessionStaff(state.token), 'schedule:write')) { showPanel(`<h3>${time}</h3><p class="muted">Your sign-in can view the schedule but not book visits.</p>`); return; }
  showPanel(`<h3>Book at ${time}</h3>
    <label>Patient<select id="bPatient">${patients.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
    <label>Length<select id="bLength">${[15, 30, 45, 60].map((m) => `<option ${m === 30 ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
    <label>Visit type<select id="bType">${TYPES.map((x) => `<option>${x}</option>`).join('')}</select></label>
    <label>Reason<input id="bReason" placeholder="e.g. Cough for a week"></label>
    <div id="bCheck"></div>
    <button class="primary" id="bBook" type="button">Book visit</button>
    <p class="muted small">Other open times: <span id="bSlots"></span></p>`);
  const check = () => {
    const patientId = Number($('bPatient').value), duration = Number($('bLength').value), startsAt = `${state.date} ${time}`;
    const problems = call('problems', { patientId, providerId, startsAt, duration }).body;
    $('bCheck').innerHTML = problems.length ? `<ul class="problems">${problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : '<p class="ok">Open: this visit can be booked.</p>';
    $('bSlots').textContent = call('slots', { providerId, date: state.date, duration }).body.slice(0, 8).join(', ') || 'none';
  };
  ['bPatient', 'bLength'].forEach((id) => $(id).addEventListener('change', check));
  check();
  $('bBook').addEventListener('click', () => {
    const visitArgs = { patientId: Number($('bPatient').value), providerId, startsAt: `${state.date} ${time}`,
                        duration: Number($('bLength').value), type: $('bType').value, reason: $('bReason').value };
    const result = call('book', visitArgs).body;
    if (!result.ok) { $('bCheck').innerHTML = `<ul class="problems">${result.problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`; return; }
    state.picked = null;
    showPanel('');
    drawDay();
  });
}

/** A booked visit: its details and the status buttons */
function drawVisit(id) {
  const a = visit(id);
  const buttons = can(sessionStaff(state.token), 'schedule:write') ? Object.entries(STATUS_LABEL).filter(([s]) => s !== a.status && s !== 'scheduled')
    .map(([s, label]) => `<button class="ghost" data-status="${s}" type="button">${label}</button>`).join('') +
    (a.status !== 'scheduled' ? '<button class="ghost" data-status="scheduled" type="button">Reinstate</button>' : '') : '';
  showPanel(`<h3>${esc(a.patient)}</h3><p>${a.startsAt.slice(11)} · ${a.minutes} min · ${esc(a.type)}<br>${esc(a.reason)}</p>
    <p class="muted">Status: ${a.status.replace('_', ' ')}</p><div class="statuses">${buttons}</div>`);
  $('panel').querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => {
    call('status', { id, status: b.dataset.status });
    drawDay();
    drawVisit(id);
  }));
}

function drawResults(text = $('search').value) {
  const list = call('search', { text }).body;
  $('results').innerHTML = list.length ? list.map((p) => `<li data-patient="${p.id}">${esc(p.name)}<small>${esc(p.mrn)} · born ${esc(p.birth)}</small></li>`).join('')
    : '<li class="muted">No patients match.</li>';
}

function drawProfile(id) {
  const res = call('profile', { id });
  if (res.status === 403) { $('profile').innerHTML = `<p class="muted">${esc(res.body.error)}: only medical staff open a patient's chart.</p>`; return; }
  const p = res.body;
  $('profile').innerHTML = `<h3>${esc(p.first_name)} ${esc(p.last_name)}</h3>
    <dl><dt>MRN</dt><dd>${esc(p.mrn)}</dd><dt>Born</dt><dd>${esc(p.birth_date)}</dd><dt>Sex</dt><dd>${esc(p.sex)}</dd>
    <dt>Phone</dt><dd>${esc(p.phone)}</dd><dt>Allergies</dt><dd>${esc(p.allergies || 'None recorded')}</dd></dl>
    <h4>Insurance</h4>${p.insurance.length ? p.insurance.map((i) => `<p><strong>${i.coverage === 'primary' ? 'Primary' : 'Secondary'}:</strong> ${esc(i.payer)} ${esc(i.plan || '')} · member ${esc(i.member)}${i.copay != null ? ` · $${i.copay} copay` : ''}</p>`).join('') : '<p class="muted">Self-pay (no plan on file)</p>'}
    <h4>Visits</h4><ul>${p.visits.map((a) => `<li>${a.startsAt} · ${esc(a.type)} with ${esc(a.provider)} · ${a.status.replace('_', ' ')}</li>`).join('') || '<li class="muted">None</li>'}</ul>`;
}

function drawReports() {
  const from = TODAY, to = addDays(TODAY, 4);          // Monday–Friday of the demo week
  const days = call('daily', { from, to }).body;
  $('daily').innerHTML = '<tr><th>Day</th><th>Visits</th><th>Checked in</th><th>Completed</th><th>No-shows</th></tr>' +
    days.map((d) => `<tr><td>${d.date}</td><td class="n">${d.total}</td><td class="n">${d.checkedIn}</td><td class="n">${d.completed}</td><td class="n">${d.noShows}</td></tr>`).join('');
  $('workload').innerHTML = '<tr><th>Provider</th><th>Visits</th><th>No-shows</th><th>No-show rate</th></tr>' +
    call('workload', { from, to }).body.map((w) => `<tr><td>${esc(w.provider)}</td><td class="n">${w.total}</td><td class="n">${w.noShows}</td><td class="n">${w.noShowPct == null ? '–' : `${w.noShowPct}%`}</td></tr>`).join('');
}

function showSignIn(message = '') {
  state.token = null;
  $('app').hidden = true;
  $('signin').hidden = false;
  $('signinError').textContent = message;
}

function enterApp() {
  const staff = sessionStaff(state.token);
  $('who').textContent = `Gotham Staff · ${staff.name}`;
  // Show only the tabs this role can use (the API checks again on every request)
  const allowed = { schedule: can(staff, 'schedule:read'), patients: can(staff, 'patients:search'), reports: can(staff, 'reports') };
  document.querySelectorAll('[data-tab]').forEach((b) => { b.hidden = !allowed[b.dataset.tab]; });
  $('signin').hidden = true;
  $('app').hidden = false;
  showTab('schedule');
}

$('signinForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const button = e.target.querySelector('button');
  button.disabled = true;
  $('signinError').textContent = '';
  const token = await signIn(String(form.get('username')), String(form.get('password')));
  button.disabled = false;
  if (!token) { $('signinError').textContent = 'Wrong username or password'; return; }
  state.token = token;          // kept in memory only: this page's storage may be blocked
  e.target.password.value = '';
  enterApp();
});

$('signOut').addEventListener('click', () => {
  signOut(state.token);
  showSignIn();
});

function showTab(tab) {
  document.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  document.querySelectorAll('.view').forEach((s) => { s.hidden = s.id !== tab; });
  if (tab === 'schedule') drawDay();
  if (tab === 'patients') drawResults();
  if (tab === 'reports') drawReports();
}
$('tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });
$('search').addEventListener('input', (e) => drawResults(e.target.value));
$('results').addEventListener('click', (e) => { const li = e.target.closest('[data-patient]'); if (li) drawProfile(Number(li.dataset.patient)); });

$('grid').addEventListener('click', (e) => {
  const slot = e.target.closest('[data-slot]');
  const booked = e.target.closest('[data-visit]');
  if (slot) {
    state.picked = state.picked === slot.dataset.slot ? null : slot.dataset.slot;
    drawDay();
    if (state.picked) drawBooking(); else showPanel('');
  } else if (booked) {
    state.picked = null;
    drawDay();
    drawVisit(Number(booked.dataset.visit));
  }
});

// Load SQLite, build the database, then draw the page
initSqlJs({ locateFile: (file) => SQLJS + file })
  .then((SQL) => {
    db = new SQL.Database();
    build();
    showSignIn();
  })
  .catch((err) => {
    document.body.insertAdjacentHTML('afterbegin', `<p class="error" style="padding:12px">Couldn't start the database: ${esc(err.message)}</p>`);
    console.error(err);
  });
```

## Finish

### What you learned

- Times as zero-padded text, and date arithmetic in UTC
- A schedule drawn as a table, with visits spanning rows
- SQLite tables with primary and foreign keys, CHECK constraints, UNIQUE and a partial unique index, loaded in a transaction with parameters
- The overlap rule, booking problems in plain words, and open slots
- An upsert with ON CONFLICT, safe LIKE search, and reports with SUM over comparisons, NULLIF and LEFT JOIN
- Salted PBKDF2 hashes, constant-time comparison, random session tokens and expiry
- Permissions, one door for every request, and the difference between 401 and 403

### Challenges

1. **Reschedule:** add a button that moves a visit to another time, using `bookingProblems()` but ignoring the visit itself in the overlap check.
2. **Recurring visits:** book the same time every week for four weeks, all in one transaction: if one week is refused, book none.
3. **Provider time off:** add a `time_off` table (provider, date, reason) and refuse bookings on those days.
4. **An audit log:** record who changed each status and when, and show it on the visit.
5. **Lock out guessing:** after five wrong passwords, refuse sign-in for a minute.

Compare yours with the [source code](https://github.com/TheoYanvno/gotham-hospital-system).
