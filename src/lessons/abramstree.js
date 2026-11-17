// Built from guides/abramstree.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "abramstree",
 "title": "AbramsTree (React Bible study guide)",
 "goals": [
  "Spread a reading plan evenly over days and track a streak that waits for you in the morning",
  "Combine translations, prayers with reminders and an interactive map in one React app with three tabs",
  "Keep every rule in plain functions with tests, and the components only drawing and saving",
  "Reuse a shared reference (SuperBook) across projects without letting copies drift"
 ],
 "prereqs": [
  "React basics",
  "Reusing the SuperBook Bible data in React",
  "An interactive map with SVG pan and zoom",
  "Prayer times, reminders and notifications"
 ],
 "sessions": [
  {
   "title": "Reading and praying",
   "from": 0,
   "to": 2
  },
  {
   "title": "The map",
   "from": 3,
   "to": 4
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "What AbramsTree does",
   "body": "In this guide you'll rebuild my [AbramsTree](https://github.com/TheoYanvno/abrams-tree), a Bible study guide with three tabs:\n\n| Tab | What it does |\n|---|---|\n| 📖 Read | a reading plan with a daily streak, notes, catch-up, and translations side by side with highlights |\n| 🙏 Pray | the Orthodox hours of prayer with their prayers, a prayer list, and reminders |\n| 🗺️ Map | 51 events at 42 places you can pan, zoom, filter and play through in order |\n\nThe tabs are plain links (`#read`, `#pray`, `#map`); a `hashchange` listener switches the page, so the back button and bookmarks work.\n\n```svg Three tabs over one set of plain libraries\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"110\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"80\" y=\"29\" text-anchor=\"middle\">📖 Read</text>\n  <rect x=\"170\" y=\"10\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"240\" y=\"29\" text-anchor=\"middle\">🙏 Pray</text>\n  <rect x=\"330\" y=\"10\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"400\" y=\"29\" text-anchor=\"middle\">🗺️ Map</text>\n  <rect x=\"10\" y=\"70\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"80\" y=\"89\" text-anchor=\"middle\">plans · progress · translations</text>\n  <rect x=\"170\" y=\"70\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"240\" y=\"89\" text-anchor=\"middle\">prayers</text>\n  <rect x=\"330\" y=\"70\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"400\" y=\"89\" text-anchor=\"middle\">map · places</text>\n  <path d=\"M80 40 V70 M240 40 V70 M400 40 V70\" stroke=\"#374151\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why are the tabs links to #read, #pray and #map?",
     "options": [
      "The address changes with the tab, so the back button, refresh and bookmarks all work",
      "React can't switch components without links",
      "Hashes load faster"
     ],
     "answer": 0,
     "why": "Putting the view in the URL makes it shareable and navigable."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "Reading plans and a fair streak",
   "body": "A plan is a list of chapters spread over a number of days. Extra chapters go to the earliest days, so no day has more than one chapter more than another:\n\n```js\nexport function schedule(plan) {\n  const all = plan.chapters();\n  const base = Math.floor(all.length / plan.days);\n  const extra = all.length % plan.days;\n  const days = [];\n  let at = 0;\n  for (let d = 0; d < plan.days; d++) {\n    const n = base + (d < extra ? 1 : 0);\n    days.push(all.slice(at, at + n));\n    at += n;\n  }\n  return days;\n}\n```\n\nThe whole Bible in a year is 1,362 chapters (with the Orthodox books) over 365 days: 3 or 4 a day. `describe()` turns a day into \"Genesis 1–3\", each chapter links to SuperBook, and the streak counts up to yesterday until you've read today, so it never looks broken in the morning. Below the day's reading, **Compare translations** shows the chapters side by side, with highlights, from Reusing the SuperBook Bible data in React.\n\n```svg 10 chapters over 4 days: the first two days get the extra chapter\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 460 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"460\" height=\"80\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"20\" width=\"100\" height=\"36\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"60\" y=\"43\" text-anchor=\"middle\">day 1: 3</text>\n  <rect x=\"120\" y=\"20\" width=\"100\" height=\"36\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"170\" y=\"43\" text-anchor=\"middle\">day 2: 3</text>\n  <rect x=\"230\" y=\"20\" width=\"100\" height=\"36\" rx=\"5\" fill=\"#e0e7ff\"/><text x=\"280\" y=\"43\" text-anchor=\"middle\">day 3: 2</text>\n  <rect x=\"340\" y=\"20\" width=\"100\" height=\"36\" rx=\"5\" fill=\"#e0e7ff\"/><text x=\"390\" y=\"43\" text-anchor=\"middle\">day 4: 2</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "How does schedule() share out chapters that don't divide evenly?",
     "options": [
      "It adds them all to the last day",
      "The first days each get one extra, so days differ by at most one chapter",
      "It drops them"
     ],
     "answer": 1,
     "why": "base chapters for everyone, plus one for the first `extra` days."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15,
   "uses": [
    "biblesync"
   ]
  },
  {
   "title": "The prayer tab",
   "body": "The prayer tab opens at the hour it is now (`currentHour('12:30')` is the Sixth Hour), with its verse and the traditional prayers (the Trisagion, Glory, the Lord's Prayer from the World English Bible, the Jesus Prayer). Your own prayer list appears at the end of each hour.\n\n- The **prayer list** is pure functions: `addRequest`, `markAnswered`, `reopen`, `removeRequest`. Answered prayers move to a list you can look back on.\n- **Prayer times**: tick the hours you want, then **Add to my calendar (.ics)** downloads daily events with alarms, so reminders work with the page closed.\n- While the page is open, it can also show a notification, asked for from a link and only then.\n\n```svg The prayer list moves requests between open and answered, and back\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 460 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"460\" height=\"80\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"25\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"60\" y=\"44\" text-anchor=\"middle\">addRequest</text>\n  <rect x=\"160\" y=\"25\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"210\" y=\"44\" text-anchor=\"middle\">open</text>\n  <rect x=\"320\" y=\"25\" width=\"120\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"380\" y=\"44\" text-anchor=\"middle\">answered</text>\n  <path d=\"M110 40 H160 M260 35 H320 M320 48 H260\" stroke=\"#374151\" stroke-width=\"2\"/><text x=\"265\" y=\"22\">markAnswered</text><text x=\"275\" y=\"70\">reopen</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does the Pray tab offer a calendar file as well as notifications?",
     "options": [
      "The calendar reminds you even when the page is closed; notifications only work while it's open",
      "Notifications don't work in React",
      "Calendar files are required for prayer"
     ],
     "answer": 0,
     "why": "Use the tool that works when the app isn't running."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 14,
   "uses": [
    "reminders"
   ]
  },
  {
   "title": "The map of biblical events",
   "body": "The map is the pattern from An interactive map with SVG pan and zoom: a Natural Earth base map, a viewBox camera with `zoomAt` and `pan`, pointer drags that only capture once they're drags, a wheel listener that stops page scrolling, and arrow keys and + / −. On top of it:\n\n```js\nexport function filterEvents({ era = 'all', book = 'all' } = {}, events = EVENTS) {\n  return events.filter((e) => (era === 'all' || e.era === era) && (book === 'all' || e.book === book));\n}\n```\n\n- **Places** are `{ id, name, lon, lat }`; **events** are `{ title, era, place, book, chapter }` in the order they happened, in six eras from Abraham to the early Church.\n- Only places with an event that matches the filters are drawn. Labels appear once you zoom in, and markers and text shrink with the zoom so they stay the same size on screen.\n- **Play in order** steps through the filtered events every 2.5 seconds, flying the camera to each place with `centreOn()`.\n- Clicking a place lists what happened there, with links to each chapter in SuperBook.\n\n```svg Play in order moves the camera from event to event\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 460 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"460\" height=\"110\" fill=\"#cfe3ef\"/>\n  <path d=\"M0 50 C 100 30, 200 80, 300 60 S 400 40, 460 50 V110 H0Z\" fill=\"#efe6d2\"/>\n  <circle cx=\"400\" cy=\"80\" r=\"5\" fill=\"#b5562d\"/><text x=\"380\" y=\"100\">Ur</text>\n  <circle cx=\"330\" cy=\"62\" r=\"5\" fill=\"#b5562d\"/><text x=\"300\" y=\"58\">Haran</text>\n  <circle cx=\"250\" cy=\"85\" r=\"5\" fill=\"#b5562d\"/><text x=\"225\" y=\"102\">Shechem</text>\n  <path d=\"M400 80 Q 360 55 330 62 Q 290 75 250 85\" fill=\"none\" stroke=\"#7a1d1d\" stroke-dasharray=\"5 4\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What decides which places appear on the map?",
     "options": [
      "All 42 always appear",
      "Only places with at least one event that matches the chosen era and book",
      "Only places in the current view"
     ],
     "answer": 1,
     "why": "Filtering events filters the places with them."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 16,
   "uses": [
    "svgmap"
   ]
  },
  {
   "title": "How the real project is organized",
   "body": "```bash\nnpm start       # http://localhost:8000\nnpm test        # plans, progress, prayers, translations, the map and the SuperBook sync\nnpm run build   # into docs/ for GitHub Pages\n```\n\n| File | What it does |\n|---|---|\n| `lib/books.js` | the Orthodox canon, synced with SuperBook |\n| `lib/plans.js`, `lib/progress.js` | plans, streak, completion, catch-up |\n| `lib/translations.js` | chapters by translation, side by side, highlights |\n| `lib/prayers.js` | hours, prayer list, next reminder, calendar file |\n| `lib/map.js`, `data/places.js` | places, events, filters, pan and zoom |\n| `data/basemap.json` | Natural Earth land, lakes and rivers, made by `tools/build_basemap.py` |\n\n```svg Plain libraries with tests below; three tab components above\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"460\" height=\"28\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"240\" y=\"29\" text-anchor=\"middle\">ReadingPlan · Translations · Prayers · BibleMap</text>\n  <rect x=\"10\" y=\"50\" width=\"460\" height=\"28\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"240\" y=\"69\" text-anchor=\"middle\">books · plans · progress · translations · prayers · map (node --test)</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Where would you add a new event to the map?",
     "options": [
      "In data/places.js, as one line with its title, era, place, book and chapter",
      "In BibleMap.jsx",
      "In basemap.json"
     ],
     "answer": 0,
     "why": "Data lives in data files; the map draws whatever is listed."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 10
  }
 ],
 "finish": "You built a Bible study app with even reading plans, translations side by side, prayers with dependable reminders and an interactive map, all on tested plain functions.\n\n### Challenges\n\n1. Add Paul's journeys as dotted routes that play in order.\n2. Add a reading plan of your own, like the Psalms and Proverbs together.\n3. Let a place's panel show the first verse of each chapter from the translations cache."
};
