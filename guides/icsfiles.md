---
id: icsfiles
title: .ics calendar files
blocks-html: page
blocks-css: base
blocks-js: data, escape, event, download
goals: Explain what an .ics (iCalendar) file is and why every calendar app can read it; Write a VEVENT with the right line endings and escaped text; Write all-day and timed dates, a unique id and a repeat rule (RRULE); Turn text into a file the browser downloads with Blob and URL.createObjectURL; Clean up the temporary file URL afterwards
prereqs: The Repeating events lesson (rules instead of copies) and the Dates and time zones lesson (dayKey)
---

## Session: Tasks that leave your app

## Step: What an .ics file is
time: 10
kind: read

Google Calendar, Apple Calendar and Outlook are made by different companies, but they all import the same file type: **iCalendar**, saved as `.ics`. It's plain text, written in a standard (RFC 5545) that's been around since 1998, so any app can read it and you can read it too:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//My Calendar//EN
BEGIN:VEVENT
UID:t1@my-calendar
DTSTAMP:20261103T150000Z
DTSTART;VALUE=DATE:20261105
SUMMARY:Gym
END:VEVENT
END:VCALENDAR
```

```svg An .ics file is a VCALENDAR wrapper holding one VEVENT block per task, each a list of NAME:value lines
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 150" font-family="sans-serif" font-size="11">
  <rect x="5" y="5" width="320" height="140" rx="10" fill="#fff7ed" stroke="#ea580c"/><text x="15" y="22">VCALENDAR (VERSION, PRODID)</text>
  <rect x="20" y="32" width="290" height="46" rx="8" fill="#ffedd5" stroke="#f97316"/><text x="30" y="50">VEVENT: UID · DTSTART · SUMMARY</text><text x="30" y="66" fill="#7c2d12">one task</text>
  <rect x="20" y="86" width="290" height="46" rx="8" fill="#ffedd5" stroke="#f97316"/><text x="30" y="104">VEVENT: UID · DTSTART · RRULE · SUMMARY</text><text x="30" y="120" fill="#7c2d12">a repeating task: one block, not 52</text>
</svg>
```

A few rules make the format strict:

- Every line is `NAME:value`, and lines end with **CR LF** (`\r\n`), not just `\n`.
- Commas, semicolons and backslashes inside text must be **escaped** with a backslash, and a line break inside text is written `\n`.
- Every event needs a **UID** that never changes, so importing the same file twice updates the events instead of duplicating them.
- A repeating task is still one event, with an **RRULE** line, exactly like the rules from the Repeating events lesson.

## Step: Escaping text, and one VEVENT
time: 15

`esc(text)` makes any title safe for the file. Order matters: escape backslashes **first**, otherwise you'd escape the backslashes you just added.

```js
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n');
```

Then `vevent(task)` writes the block as an array of lines and joins them with `\r\n`. The preview on the page shows the result for a task titled "Dentist, Dr. Lee; bring card", so you can see the escapes.

```svg esc() turns a title into safe .ics text: backslashes first, then commas and semicolons, then line breaks
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 90" font-family="sans-serif" font-size="12">
  <rect x="5" y="15" width="320" height="28" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><text x="14" y="34">Dentist, Dr. Lee; bring card</text>
  <path d="M165 45 V55" stroke="#111" stroke-width="2"/>
  <rect x="5" y="57" width="320" height="28" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="14" y="76">SUMMARY:Dentist\, Dr. Lee\; bring card</text>
</svg>
```

check: js | escaping special characters | /replace\(\s*\/\[,;\]\/g/ | s.replace(/[,;]/g, (c) => `\\${c}`)
check: js | a VEVENT block | /['"]BEGIN:VEVENT['"]/ | 'BEGIN:VEVENT', ..., 'END:VEVENT'
check: js | CR LF line endings | /join\(\s*['"]\\r\\n['"]\s*\)/ | lines.join('\r\n')

quiz: Why are backslashes escaped before commas and semicolons?
- [x] Otherwise the backslashes added for commas would be escaped again, doubling them
- [ ] Backslashes are more common
- [ ] The order doesn't matter
why: Escape the escape character first, then add new escapes.

quiz: Why must lines end with `\r\n`?
- [ ] It makes the file smaller
- [x] The iCalendar standard requires CR LF, and strict apps reject other line endings
- [ ] JavaScript can't write \n
why: Following the standard exactly is what makes the file work in every app.

```html page
<main class="card">
  <h1>Export to your calendar</h1>
  <ul id="list" class="list"></ul>
  <p><a id="download" class="button" href="#" hidden>Download tasks.ics</a></p>
  <pre id="preview" class="preview"></pre>
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
  background: #fff7ed;
  color: #431407;
}

.card { width: min(520px, 100% - 24px); padding: 16px; background: #fff; border-radius: 16px; }
h1 { margin-top: 0; font-size: 1.3rem; }
.list { padding-left: 1.2em; }
.preview { max-height: 260px; overflow: auto; padding: 10px; background: #1c1917; color: #fef3c7; border-radius: 10px; font-size: .75rem; }
.button { display: inline-block; padding: 8px 14px; border-radius: 10px; background: #ea580c; color: #fff; text-decoration: none; font-weight: 600; }
```

```js data
const tasks = [
  { id: 't1', title: 'Dentist, Dr. Lee; bring card', date: '2026-11-05', time: '09:30' },
  { id: 't2', title: 'Pay rent', date: '2026-12-01', time: '' },
  { id: 't3', title: 'Take out the trash', date: '2026-11-03', time: '', every: 'week' },
];

document.getElementById('list').replaceChildren(...tasks.map((t) => {
  const li = document.createElement('li');
  li.textContent = `${t.title} · ${t.date}${t.time ? ` ${t.time}` : ''}${t.every ? ` · every ${t.every}` : ''}`;
  return li;
}));
```

```js escape
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n');
```

```js event
function vevent(t) {
  return [
    'BEGIN:VEVENT',
    `SUMMARY:${esc(t.title)}`,
    'END:VEVENT',
  ].join('\r\n');
}

document.getElementById('preview').textContent = vevent(tasks[0]);
```

## Step: Dates, ids and repeat rules
time: 15

Now the event gets everything a calendar app needs:

- **UID**: the task's id plus a name for the app, `t1@my-calendar`. Same task, same UID, every export.
- **DTSTAMP**: when the file was made, in UTC (the `Z` at the end means UTC): `toISOString()` with the punctuation removed.
- **DTSTART**: an all-day task uses `DTSTART;VALUE=DATE:20261105`. A task with a time uses local time, `DTSTART:20261105T093000`, which calendars show at 9:30 wherever the person is.
- **RRULE**: a weekly task gets `RRULE:FREQ=WEEKLY`, daily `FREQ=DAILY`, monthly `FREQ=MONTHLY`. One line instead of 52 events.

Then `calendar(tasks)` wraps all the events in `VCALENDAR` with `VERSION:2.0` and a `PRODID` saying which app made it.

```svg Each task field maps to one .ics line; the date line depends on whether the task has a time
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" font-family="sans-serif" font-size="11">
  <g><text x="5" y="20">id t1</text><text x="130" y="20">→ UID:t1@my-calendar</text>
  <text x="5" y="44">date only</text><text x="130" y="44">→ DTSTART;VALUE=DATE:20261201</text>
  <text x="5" y="68">date + 09:30</text><text x="130" y="68">→ DTSTART:20261105T093000</text>
  <text x="5" y="92">every: week</text><text x="130" y="92">→ RRULE:FREQ=WEEKLY</text>
  <text x="5" y="116">title</text><text x="130" y="116">→ SUMMARY:(escaped)</text></g>
</svg>
```

check: js | a unique id for each event | /UID:\$\{\s*t\.id\s*\}/ | `UID:${t.id}@my-calendar`
check: js | all-day dates | /VALUE=DATE:/ | `DTSTART;VALUE=DATE:${compact}`
check: js | repeat rules | /RRULE:FREQ=/ | `RRULE:FREQ=${FREQ[t.every]}`

quiz: Why does every event keep the same UID each time you export?
- [ ] UIDs are required to be short
- [x] So importing again updates the existing events instead of adding duplicates
- [ ] It makes the file download faster
why: Calendar apps match events by UID.

quiz: A task has a date but no time. Which line does it get?
- [x] DTSTART;VALUE=DATE:20261201, an all-day event
- [ ] DTSTART:20261201T000000, midnight
- [ ] No DTSTART at all
why: VALUE=DATE marks an all-day event, which calendars show at the top of the day.

```js event
const FREQ = { day: 'DAILY', week: 'WEEKLY', month: 'MONTHLY' };
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function vevent(t) {
  const compact = t.date.replace(/-/g, '');
  const lines = [
    'BEGIN:VEVENT',
    `UID:${t.id}@my-calendar`,
    `DTSTAMP:${stamp()}`,
    t.time ? `DTSTART:${compact}T${t.time.replace(':', '')}00` : `DTSTART;VALUE=DATE:${compact}`,
    `SUMMARY:${esc(t.title)}`,
  ];
  if (t.every) lines.push(`RRULE:FREQ=${FREQ[t.every]}`);
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

function calendar(list) {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//My Calendar//EN', ...list.map(vevent), 'END:VCALENDAR'].join('\r\n') + '\r\n';
}

document.getElementById('preview').textContent = calendar(tasks);
```

## Step: A file the browser downloads
time: 12

The text is ready; now make it a **file**. No server needed:

1. `new Blob([text], { type: 'text/calendar' })` wraps the text as file data in memory.
2. `URL.createObjectURL(blob)` gives it a temporary address like `blob:https://…/3f9c…`.
3. A link with that `href` and a `download="tasks.ics"` attribute saves it under that name instead of opening it.
4. `URL.revokeObjectURL(url)` frees the memory when it's no longer needed. The page makes a fresh URL each time the tasks change and revokes the old one.

```svg Text becomes a Blob, the Blob gets a temporary blob: URL, and a link with download saves it as tasks.ics
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 80" font-family="sans-serif" font-size="11">
  <rect x="5" y="22" width="65" height="36" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="37" y="44" text-anchor="middle">.ics text</text>
  <rect x="88" y="22" width="65" height="36" rx="8" fill="#ffedd5" stroke="#f97316"/><text x="120" y="44" text-anchor="middle">Blob</text>
  <rect x="171" y="22" width="70" height="36" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="206" y="44" text-anchor="middle">blob: URL</text>
  <rect x="259" y="22" width="66" height="36" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="292" y="44" text-anchor="middle">download</text>
  <path d="M70 40 H84 M153 40 H167 M241 40 H255" stroke="#111" stroke-width="2"/>
</svg>
```

Open the downloaded file in Google Calendar (Settings → Import) or double-click it on a computer: the three tasks appear, and the trash repeats every week.

check: js | the text as a Blob | /new\s+Blob\(\s*\[/ | new Blob([text], { type: 'text/calendar' })
check: js | a temporary file URL | /URL\.createObjectURL\(/ | URL.createObjectURL(blob)
check: js | freeing the old URL | /URL\.revokeObjectURL\(/ | URL.revokeObjectURL(oldUrl)

quiz: What does the `download="tasks.ics"` attribute do on a link?
- [ ] Uploads the file
- [x] Saves the linked file under that name instead of opening it
- [ ] Opens Google Calendar
why: download tells the browser to save, with the file name you give.

quiz: Why call `URL.revokeObjectURL` on the old URL?
- [x] Each blob URL keeps its file in memory until it's revoked
- [ ] The download won't work otherwise
- [ ] It deletes the file from your computer
why: Freeing old blob URLs stops the page from slowly using more memory.

```js download
let url = null;

function refreshDownload() {
  const text = calendar(tasks);
  if (url) URL.revokeObjectURL(url);
  url = URL.createObjectURL(new Blob([text], { type: 'text/calendar' }));
  const link = document.getElementById('download');
  link.href = url;
  link.download = 'tasks.ics';
  link.hidden = false;
  document.getElementById('preview').textContent = text;
}

refreshDownload();
```

## Finish

Your tasks can go to any calendar app now. You learned:

- **iCalendar (.ics)**: plain text, `VCALENDAR` around `VEVENT`s, `NAME:value` lines with **CR LF**
- **Escaping** backslashes first, then commas, semicolons and line breaks
- **UID**, **DTSTAMP**, all-day vs timed **DTSTART**, and **RRULE** repeats
- **Blob**, `createObjectURL`, a `download` link and `revokeObjectURL`

You've now learned every part of the **Task Calendar**: dates, the month grid, repeats, drag and drop and .ics files. Build it next.

### Challenges

1. Add `UNTIL=` to the RRULE when a repeating task has an until date (format `20261215`).
2. Add a 30-minute reminder with a `VALARM` block inside the event.
3. Fold lines longer than 75 characters, as the standard asks: break them and start the next line with a space.

### Next

The **Task Calendar** project.
