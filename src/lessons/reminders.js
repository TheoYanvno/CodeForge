// Built from guides/reminders.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "reminders",
 "title": "Prayer times, reminders and notifications",
 "goals": [
  "Work out the next reminder from a list of daily times",
  "Create a recurring calendar file with alarms so reminders work with the page closed",
  "Use the Notifications API honestly, asking only when someone chooses to"
 ],
 "prereqs": [
  "React basics (effects, cleanup)",
  ".ics calendar files"
 ],
 "sessions": [
  {
   "title": "Reminding people at the right time",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "The next reminder",
   "body": "Daily times like the Orthodox hours of prayer are stored as `'HH:MM'` text. To find the next one, try each enabled time today, then tomorrow:\n\n```js\nexport function nextReminder(enabled, now = new Date()) {\n  const on = HOURS.filter((h) => enabled.includes(h.id));\n  if (!on.length) return null;\n  for (let day = 0; day < 2; day++) {\n    for (const hour of on) {\n      const [hh, mm] = hour.time.split(':').map(Number);\n      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, hh, mm);\n      if (at > now) return { hour, at };\n    }\n  }\n  return null;\n}\n```\n\n`new Date(y, m, d + 1, …)` rolls over months and years by itself, so the 31st plus one day is the 1st of the next month. `HOURS` is sorted by time, so the first match is the soonest. Comparing `'HH:MM'` strings also works for \"which hour is it now\": `'12:30' >= '12:00'`.\n\n```svg At 2 PM with Morning and Ninth Hour on, the next reminder is today at 3 PM; at 10 PM it's tomorrow at 6 AM\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"90\" fill=\"#fff\"/>\n  <line x1=\"20\" y1=\"45\" x2=\"460\" y2=\"45\" stroke=\"#94a3b8\" stroke-width=\"2\"/>\n  <circle cx=\"80\" cy=\"45\" r=\"5\" fill=\"#2563eb\"/><text x=\"60\" y=\"70\">6:00</text>\n  <circle cx=\"230\" cy=\"45\" r=\"5\" fill=\"#2563eb\"/><text x=\"212\" y=\"70\">15:00</text>\n  <path d=\"M200 25 V45\" stroke=\"#dc2626\" stroke-width=\"2\"/><text x=\"170\" y=\"20\" fill=\"#dc2626\">now 14:00</text>\n  <circle cx=\"440\" cy=\"45\" r=\"5\" fill=\"#2563eb\"/><text x=\"410\" y=\"70\">6:00 +1</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "How does nextReminder handle a time that's already passed today?",
     "options": [
      "It returns null",
      "It tries the same times tomorrow",
      "It returns the passed time anyway"
     ],
     "answer": 1,
     "why": "The loop checks today first, then the next day."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "A calendar file does the reminding",
   "body": "A web page can't reliably wake up when it's closed. A **calendar** can. So the most dependable reminder is an `.ics` file with a daily repeating event and an alarm for each chosen time:\n\n```js\nlines.push('BEGIN:VEVENT', `UID:abramstree-${hour.id}-${day}@theoyanvno.github.io`, `DTSTAMP:${stamp}`,\n  `DTSTART:${day}T${t}00`, 'DURATION:PT15M', 'RRULE:FREQ=DAILY', `SUMMARY:${ics(hour.name)}`,\n  `DESCRIPTION:${ics(`${hour.verse.text} (${hour.verse.ref})`)}`,\n  'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${ics(hour.name)}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT');\n```\n\n| Line | Means |\n|---|---|\n| `DTSTART:20261117T060000` | starts at 6:00 in the reader's own time (no Z, no zone: \"floating\" local time) |\n| `RRULE:FREQ=DAILY` | repeats every day |\n| `VALARM` with `TRIGGER:PT0M` | an alert at the start time |\n\nText values escape `\\`, `;` and `,` with a backslash, and lines end with CRLF, as the iCalendar standard requires. Import it once into a phone or computer calendar, and the reminders keep working with AbramsTree closed.\n\n```svg One download, then the calendar app reminds you every day on its own\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"80\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"25\" width=\"120\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"70\" y=\"44\" text-anchor=\"middle\">choose hours</text>\n  <rect x=\"170\" y=\"25\" width=\"130\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"235\" y=\"44\" text-anchor=\"middle\">.ics, RRULE DAILY</text>\n  <rect x=\"340\" y=\"25\" width=\"130\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"405\" y=\"44\" text-anchor=\"middle\">calendar alerts</text>\n  <path d=\"M130 40 H170 M300 40 H340\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why is a calendar file more dependable than a reminder timer in the page?",
     "options": [
      "The calendar app alerts you even when the web page is closed",
      "Calendar files are smaller",
      "Timers can't run for an hour"
     ],
     "answer": 0,
     "why": "Pages only run while they're open; a calendar is always on."
    },
    {
     "q": "Why is DTSTART written without a Z or a time zone?",
     "options": [
      "Time zones aren't allowed in .ics",
      "A \"floating\" time means 6:00 wherever the reader is, which suits daily prayer",
      "Z means Monday"
     ],
     "answer": 1,
     "why": "Floating local times follow the person, not a fixed zone."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Notifications, asked for politely",
   "body": "While the page is open, it can also show a system notification. Two rules keep it honest:\n\n1. **Ask only when the person chooses to**, from a button, never on page load. A surprise permission popup gets denied, and browsers may block sites that ask too early.\n2. **Say what it can't do.** The page explains that this only works while it's open, and points to the calendar file.\n\n```jsx\nconst askPermission = async () => {\n  try { setPermission(await Notification.requestPermission()); } catch { setPermission('denied'); }\n};\n\nuseEffect(() => {\n  if (permission !== 'granted') return;\n  const next = nextReminder(times);\n  if (!next) return;\n  const id = setTimeout(() => {\n    try { new Notification(`AbramsTree: ${next.hour.name}`, { body: next.hour.verse.text }); } catch { /* not allowed here */ }\n    setTimes((t) => [...t]);                       // a new array re-runs the effect for the next reminder\n  }, Math.min(next.at - Date.now(), 2 ** 31 - 1));\n  return () => clearTimeout(id);\n}, [times, permission]);\n```\n\n`setTimeout` can't wait longer than 2³¹−1 ms (about 24.8 days), hence the `Math.min`. The effect's cleanup cancels the timer when the chosen times change.\n\n```svg Permission is requested only from a button, and the page shows what happens in each case\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"100\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"35\" width=\"120\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"70\" y=\"54\" text-anchor=\"middle\">button pressed</text>\n  <rect x=\"180\" y=\"5\" width=\"290\" height=\"26\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"190\" y=\"22\">granted → reminders while the page is open</text>\n  <rect x=\"180\" y=\"37\" width=\"290\" height=\"26\" rx=\"5\" fill=\"#fef3c7\"/><text x=\"190\" y=\"54\">default → offer again later</text>\n  <rect x=\"180\" y=\"69\" width=\"290\" height=\"26\" rx=\"5\" fill=\"#fee2e2\"/><text x=\"190\" y=\"86\">denied → use the calendar file instead</text>\n  <path d=\"M130 50 L180 18 M130 50 H180 M130 50 L180 82\" stroke=\"#374151\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "When should a page ask for notification permission?",
     "options": [
      "As soon as it loads",
      "Only after the person presses a button that asks for reminders",
      "After a random delay"
     ],
     "answer": 1,
     "why": "People grant permission when they understand why it's asked."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  }
 ],
 "finish": "You can find the next daily reminder, make a calendar file that reminds people with the page closed, and use notifications only when asked.\n\n### Challenges\n\n1. Let people choose their own times instead of the fixed hours.\n2. Add a \"remind me 5 minutes early\" option to the VALARM (TRIGGER:-PT5M).\n3. Write a test that a reminder at 23:59 rolls over to the next month on the 31st."
};
