// Built from guides/icsfiles.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "icsfiles",
 "title": ".ics calendar files",
 "goals": [
  "Explain what an .ics (iCalendar) file is and why every calendar app can read it",
  "Write a VEVENT with the right line endings and escaped text",
  "Write all-day and timed dates, a unique id and a repeat rule (RRULE)",
  "Turn text into a file the browser downloads with Blob and URL.createObjectURL",
  "Clean up the temporary file URL afterwards"
 ],
 "prereqs": [
  "The Repeating events lesson (rules instead of copies) and the Dates and time zones lesson (dayKey)"
 ],
 "sessions": [
  {
   "title": "Tasks that leave your app",
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
   "escape": "",
   "event": "",
   "download": ""
  }
 },
 "steps": [
  {
   "title": "What an .ics file is",
   "body": "Google Calendar, Apple Calendar and Outlook are made by different companies, but they all import the same file type: **iCalendar**, saved as `.ics`. It's plain text, written in a standard (RFC 5545) that's been around since 1998, so any app can read it and you can read it too:\n\n```\nBEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//My Calendar//EN\nBEGIN:VEVENT\nUID:t1@my-calendar\nDTSTAMP:20261103T150000Z\nDTSTART;VALUE=DATE:20261105\nSUMMARY:Gym\nEND:VEVENT\nEND:VCALENDAR\n```\n\n```svg An .ics file is a VCALENDAR wrapper holding one VEVENT block per task, each a list of NAME:value lines\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 150\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"5\" width=\"320\" height=\"140\" rx=\"10\" fill=\"#fff7ed\" stroke=\"#ea580c\"/><text x=\"15\" y=\"22\">VCALENDAR (VERSION, PRODID)</text>\n  <rect x=\"20\" y=\"32\" width=\"290\" height=\"46\" rx=\"8\" fill=\"#ffedd5\" stroke=\"#f97316\"/><text x=\"30\" y=\"50\">VEVENT: UID · DTSTART · SUMMARY</text><text x=\"30\" y=\"66\" fill=\"#7c2d12\">one task</text>\n  <rect x=\"20\" y=\"86\" width=\"290\" height=\"46\" rx=\"8\" fill=\"#ffedd5\" stroke=\"#f97316\"/><text x=\"30\" y=\"104\">VEVENT: UID · DTSTART · RRULE · SUMMARY</text><text x=\"30\" y=\"120\" fill=\"#7c2d12\">a repeating task: one block, not 52</text>\n</svg>\n```\n\nA few rules make the format strict:\n\n- Every line is `NAME:value`, and lines end with **CR LF** (`\\r\\n`), not just `\\n`.\n- Commas, semicolons and backslashes inside text must be **escaped** with a backslash, and a line break inside text is written `\\n`.\n- Every event needs a **UID** that never changes, so importing the same file twice updates the events instead of duplicating them.\n- A repeating task is still one event, with an **RRULE** line, exactly like the rules from the Repeating events lesson.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "Escaping text, and one VEVENT",
   "body": "`esc(text)` makes any title safe for the file. Order matters: escape backslashes **first**, otherwise you'd escape the backslashes you just added.\n\n```js\nconst esc = (s) => s.replace(/\\\\/g, '\\\\\\\\').replace(/[,;]/g, (c) => `\\\\${c}`).replace(/\\r?\\n/g, '\\\\n');\n```\n\nThen `vevent(task)` writes the block as an array of lines and joins them with `\\r\\n`. The preview on the page shows the result for a task titled \"Dentist, Dr. Lee; bring card\", so you can see the escapes.\n\n```svg esc() turns a title into safe .ics text: backslashes first, then commas and semicolons, then line breaks\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"15\" width=\"320\" height=\"28\" rx=\"6\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"14\" y=\"34\">Dentist, Dr. Lee; bring card</text>\n  <path d=\"M165 45 V55\" stroke=\"#111\" stroke-width=\"2\"/>\n  <rect x=\"5\" y=\"57\" width=\"320\" height=\"28\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"14\" y=\"76\">SUMMARY:Dentist\\, Dr. Lee\\; bring card</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "escaping special characters",
     "test": "/replace\\(\\s*\\/\\[,;\\]\\/g/",
     "hint": "s.replace(/[,;]/g, (c) => `\\\\${c}`)"
    },
    {
     "pane": "js",
     "label": "a VEVENT block",
     "test": "/['\"]BEGIN:VEVENT['\"]/",
     "hint": "'BEGIN:VEVENT', ..., 'END:VEVENT'"
    },
    {
     "pane": "js",
     "label": "CR LF line endings",
     "test": "/join\\(\\s*['\"]\\\\r\\\\n['\"]\\s*\\)/",
     "hint": "lines.join('\\r\\n')"
    }
   ],
   "quiz": [
    {
     "q": "Why are backslashes escaped before commas and semicolons?",
     "options": [
      "Otherwise the backslashes added for commas would be escaped again, doubling them",
      "Backslashes are more common",
      "The order doesn't matter"
     ],
     "answer": 0,
     "why": "Escape the escape character first, then add new escapes."
    },
    {
     "q": "Why must lines end with `\\r\\n`?",
     "options": [
      "It makes the file smaller",
      "The iCalendar standard requires CR LF, and strict apps reject other line endings",
      "JavaScript can't write \\n"
     ],
     "answer": 1,
     "why": "Following the standard exactly is what makes the file work in every app."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"card\">\n  <h1>Export to your calendar</h1>\n  <ul id=\"list\" class=\"list\"></ul>\n  <p><a id=\"download\" class=\"button\" href=\"#\" hidden>Download tasks.ics</a></p>\n  <pre id=\"preview\" class=\"preview\"></pre>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: start center;\n  padding: 20px 0;\n  font-family: system-ui, sans-serif;\n  background: #fff7ed;\n  color: #431407;\n}\n\n.card { width: min(520px, 100% - 24px); padding: 16px; background: #fff; border-radius: 16px; }\nh1 { margin-top: 0; font-size: 1.3rem; }\n.list { padding-left: 1.2em; }\n.preview { max-height: 260px; overflow: auto; padding: 10px; background: #1c1917; color: #fef3c7; border-radius: 10px; font-size: .75rem; }\n.button { display: inline-block; padding: 8px 14px; border-radius: 10px; background: #ea580c; color: #fff; text-decoration: none; font-weight: 600; }"
   },
   "js": {
    "data": "const tasks = [\n  { id: 't1', title: 'Dentist, Dr. Lee; bring card', date: '2026-11-05', time: '09:30' },\n  { id: 't2', title: 'Pay rent', date: '2026-12-01', time: '' },\n  { id: 't3', title: 'Take out the trash', date: '2026-11-03', time: '', every: 'week' },\n];\n\ndocument.getElementById('list').replaceChildren(...tasks.map((t) => {\n  const li = document.createElement('li');\n  li.textContent = `${t.title} · ${t.date}${t.time ? ` ${t.time}` : ''}${t.every ? ` · every ${t.every}` : ''}`;\n  return li;\n}));",
    "escape": "const esc = (s) => s.replace(/\\\\/g, '\\\\\\\\').replace(/[,;]/g, (c) => `\\\\${c}`).replace(/\\r?\\n/g, '\\\\n');",
    "event": "function vevent(t) {\n  return [\n    'BEGIN:VEVENT',\n    `SUMMARY:${esc(t.title)}`,\n    'END:VEVENT',\n  ].join('\\r\\n');\n}\n\ndocument.getElementById('preview').textContent = vevent(tasks[0]);"
   }
  },
  {
   "title": "Dates, ids and repeat rules",
   "body": "Now the event gets everything a calendar app needs:\n\n- **UID**: the task's id plus a name for the app, `t1@my-calendar`. Same task, same UID, every export.\n- **DTSTAMP**: when the file was made, in UTC (the `Z` at the end means UTC): `toISOString()` with the punctuation removed.\n- **DTSTART**: an all-day task uses `DTSTART;VALUE=DATE:20261105`. A task with a time uses local time, `DTSTART:20261105T093000`, which calendars show at 9:30 wherever the person is.\n- **RRULE**: a weekly task gets `RRULE:FREQ=WEEKLY`, daily `FREQ=DAILY`, monthly `FREQ=MONTHLY`. One line instead of 52 events.\n\nThen `calendar(tasks)` wraps all the events in `VCALENDAR` with `VERSION:2.0` and a `PRODID` saying which app made it.\n\n```svg Each task field maps to one .ics line; the date line depends on whether the task has a time\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 120\" font-family=\"sans-serif\" font-size=\"11\">\n  <g><text x=\"5\" y=\"20\">id t1</text><text x=\"130\" y=\"20\">→ UID:t1@my-calendar</text>\n  <text x=\"5\" y=\"44\">date only</text><text x=\"130\" y=\"44\">→ DTSTART;VALUE=DATE:20261201</text>\n  <text x=\"5\" y=\"68\">date + 09:30</text><text x=\"130\" y=\"68\">→ DTSTART:20261105T093000</text>\n  <text x=\"5\" y=\"92\">every: week</text><text x=\"130\" y=\"92\">→ RRULE:FREQ=WEEKLY</text>\n  <text x=\"5\" y=\"116\">title</text><text x=\"130\" y=\"116\">→ SUMMARY:(escaped)</text></g>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a unique id for each event",
     "test": "/UID:\\$\\{\\s*t\\.id\\s*\\}/",
     "hint": "`UID:${t.id}@my-calendar`"
    },
    {
     "pane": "js",
     "label": "all-day dates",
     "test": "/VALUE=DATE:/",
     "hint": "`DTSTART;VALUE=DATE:${compact}`"
    },
    {
     "pane": "js",
     "label": "repeat rules",
     "test": "/RRULE:FREQ=/",
     "hint": "`RRULE:FREQ=${FREQ[t.every]}`"
    }
   ],
   "quiz": [
    {
     "q": "Why does every event keep the same UID each time you export?",
     "options": [
      "UIDs are required to be short",
      "So importing again updates the existing events instead of adding duplicates",
      "It makes the file download faster"
     ],
     "answer": 1,
     "why": "Calendar apps match events by UID."
    },
    {
     "q": "A task has a date but no time. Which line does it get?",
     "options": [
      "DTSTART;VALUE=DATE:20261201, an all-day event",
      "DTSTART:20261201T000000, midnight",
      "No DTSTART at all"
     ],
     "answer": 0,
     "why": "VALUE=DATE marks an all-day event, which calendars show at the top of the day."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "event": "const FREQ = { day: 'DAILY', week: 'WEEKLY', month: 'MONTHLY' };\nconst stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\\.\\d{3}/, '');\n\nfunction vevent(t) {\n  const compact = t.date.replace(/-/g, '');\n  const lines = [\n    'BEGIN:VEVENT',\n    `UID:${t.id}@my-calendar`,\n    `DTSTAMP:${stamp()}`,\n    t.time ? `DTSTART:${compact}T${t.time.replace(':', '')}00` : `DTSTART;VALUE=DATE:${compact}`,\n    `SUMMARY:${esc(t.title)}`,\n  ];\n  if (t.every) lines.push(`RRULE:FREQ=${FREQ[t.every]}`);\n  lines.push('END:VEVENT');\n  return lines.join('\\r\\n');\n}\n\nfunction calendar(list) {\n  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//My Calendar//EN', ...list.map(vevent), 'END:VCALENDAR'].join('\\r\\n') + '\\r\\n';\n}\n\ndocument.getElementById('preview').textContent = calendar(tasks);"
   }
  },
  {
   "title": "A file the browser downloads",
   "body": "The text is ready; now make it a **file**. No server needed:\n\n1. `new Blob([text], { type: 'text/calendar' })` wraps the text as file data in memory.\n2. `URL.createObjectURL(blob)` gives it a temporary address like `blob:https://…/3f9c…`.\n3. A link with that `href` and a `download=\"tasks.ics\"` attribute saves it under that name instead of opening it.\n4. `URL.revokeObjectURL(url)` frees the memory when it's no longer needed. The page makes a fresh URL each time the tasks change and revokes the old one.\n\n```svg Text becomes a Blob, the Blob gets a temporary blob: URL, and a link with download saves it as tasks.ics\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 80\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"22\" width=\"65\" height=\"36\" rx=\"8\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"37\" y=\"44\" text-anchor=\"middle\">.ics text</text>\n  <rect x=\"88\" y=\"22\" width=\"65\" height=\"36\" rx=\"8\" fill=\"#ffedd5\" stroke=\"#f97316\"/><text x=\"120\" y=\"44\" text-anchor=\"middle\">Blob</text>\n  <rect x=\"171\" y=\"22\" width=\"70\" height=\"36\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"206\" y=\"44\" text-anchor=\"middle\">blob: URL</text>\n  <rect x=\"259\" y=\"22\" width=\"66\" height=\"36\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"292\" y=\"44\" text-anchor=\"middle\">download</text>\n  <path d=\"M70 40 H84 M153 40 H167 M241 40 H255\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```\n\nOpen the downloaded file in Google Calendar (Settings → Import) or double-click it on a computer: the three tasks appear, and the trash repeats every week.",
   "checks": [
    {
     "pane": "js",
     "label": "the text as a Blob",
     "test": "/new\\s+Blob\\(\\s*\\[/",
     "hint": "new Blob([text], { type: 'text/calendar' })"
    },
    {
     "pane": "js",
     "label": "a temporary file URL",
     "test": "/URL\\.createObjectURL\\(/",
     "hint": "URL.createObjectURL(blob)"
    },
    {
     "pane": "js",
     "label": "freeing the old URL",
     "test": "/URL\\.revokeObjectURL\\(/",
     "hint": "URL.revokeObjectURL(oldUrl)"
    }
   ],
   "quiz": [
    {
     "q": "What does the `download=\"tasks.ics\"` attribute do on a link?",
     "options": [
      "Uploads the file",
      "Saves the linked file under that name instead of opening it",
      "Opens Google Calendar"
     ],
     "answer": 1,
     "why": "download tells the browser to save, with the file name you give."
    },
    {
     "q": "Why call `URL.revokeObjectURL` on the old URL?",
     "options": [
      "Each blob URL keeps its file in memory until it's revoked",
      "The download won't work otherwise",
      "It deletes the file from your computer"
     ],
     "answer": 0,
     "why": "Freeing old blob URLs stops the page from slowly using more memory."
    }
   ],
   "session": 0,
   "minutes": 12,
   "js": {
    "download": "let url = null;\n\nfunction refreshDownload() {\n  const text = calendar(tasks);\n  if (url) URL.revokeObjectURL(url);\n  url = URL.createObjectURL(new Blob([text], { type: 'text/calendar' }));\n  const link = document.getElementById('download');\n  link.href = url;\n  link.download = 'tasks.ics';\n  link.hidden = false;\n  document.getElementById('preview').textContent = text;\n}\n\nrefreshDownload();"
   }
  }
 ],
 "finish": "Your tasks can go to any calendar app now. You learned:\n\n- **iCalendar (.ics)**: plain text, `VCALENDAR` around `VEVENT`s, `NAME:value` lines with **CR LF**\n- **Escaping** backslashes first, then commas, semicolons and line breaks\n- **UID**, **DTSTAMP**, all-day vs timed **DTSTART**, and **RRULE** repeats\n- **Blob**, `createObjectURL`, a `download` link and `revokeObjectURL`\n\nYou've now learned every part of the **Task Calendar**: dates, the month grid, repeats, drag and drop and .ics files. Build it next.\n\n### Challenges\n\n1. Add `UNTIL=` to the RRULE when a repeating task has an until date (format `20261215`).\n2. Add a 30-minute reminder with a `VALARM` block inside the event.\n3. Fold lines longer than 75 characters, as the standard asks: break them and start the next line with a space.\n\n### Next\n\nThe **Task Calendar** project."
};
