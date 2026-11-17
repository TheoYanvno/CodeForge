---
id: abramstree
title: AbramsTree (React Bible study guide)
goals: Spread a reading plan evenly over days and track a streak that waits for you in the morning; Combine translations, prayers with reminders and an interactive map in one React app with three tabs; Keep every rule in plain functions with tests, and the components only drawing and saving; Reuse a shared reference (SuperBook) across projects without letting copies drift
prereqs: React basics; Reusing the SuperBook Bible data in React; An interactive map with SVG pan and zoom; Prayer times, reminders and notifications
---

## Session: Reading and praying

## Step: What AbramsTree does
kind: read
time: 10

In this guide you'll rebuild my [AbramsTree](https://github.com/TheoYanvno/abrams-tree), a Bible study guide with three tabs:

| Tab | What it does |
|---|---|
| 📖 Read | a reading plan with a daily streak, notes, catch-up, and translations side by side with highlights |
| 🙏 Pray | the Orthodox hours of prayer with their prayers, a prayer list, and reminders |
| 🗺️ Map | 51 events at 42 places you can pan, zoom, filter and play through in order |

The tabs are plain links (`#read`, `#pray`, `#map`); a `hashchange` listener switches the page, so the back button and bookmarks work.

```svg Three tabs over one set of plain libraries
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 110" font-family="sans-serif" font-size="12">
  <rect width="480" height="110" fill="#fff"/>
  <rect x="10" y="10" width="140" height="30" rx="6" fill="#dbeafe"/><text x="80" y="29" text-anchor="middle">📖 Read</text>
  <rect x="170" y="10" width="140" height="30" rx="6" fill="#dbeafe"/><text x="240" y="29" text-anchor="middle">🙏 Pray</text>
  <rect x="330" y="10" width="140" height="30" rx="6" fill="#dbeafe"/><text x="400" y="29" text-anchor="middle">🗺️ Map</text>
  <rect x="10" y="70" width="140" height="30" rx="6" fill="#dcfce7"/><text x="80" y="89" text-anchor="middle">plans · progress · translations</text>
  <rect x="170" y="70" width="140" height="30" rx="6" fill="#dcfce7"/><text x="240" y="89" text-anchor="middle">prayers</text>
  <rect x="330" y="70" width="140" height="30" rx="6" fill="#dcfce7"/><text x="400" y="89" text-anchor="middle">map · places</text>
  <path d="M80 40 V70 M240 40 V70 M400 40 V70" stroke="#374151"/>
</svg>
```

quiz: Why are the tabs links to #read, #pray and #map?
- [x] The address changes with the tab, so the back button, refresh and bookmarks all work
- [ ] React can't switch components without links
- [ ] Hashes load faster
why: Putting the view in the URL makes it shareable and navigable.

## Step: Reading plans and a fair streak
kind: read
time: 15
uses: biblesync

A plan is a list of chapters spread over a number of days. Extra chapters go to the earliest days, so no day has more than one chapter more than another:

```js
export function schedule(plan) {
  const all = plan.chapters();
  const base = Math.floor(all.length / plan.days);
  const extra = all.length % plan.days;
  const days = [];
  let at = 0;
  for (let d = 0; d < plan.days; d++) {
    const n = base + (d < extra ? 1 : 0);
    days.push(all.slice(at, at + n));
    at += n;
  }
  return days;
}
```

The whole Bible in a year is 1,362 chapters (with the Orthodox books) over 365 days: 3 or 4 a day. `describe()` turns a day into "Genesis 1–3", each chapter links to SuperBook, and the streak counts up to yesterday until you've read today, so it never looks broken in the morning. Below the day's reading, **Compare translations** shows the chapters side by side, with highlights, from Reusing the SuperBook Bible data in React.

```svg 10 chapters over 4 days: the first two days get the extra chapter
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 80" font-family="sans-serif" font-size="12">
  <rect width="460" height="80" fill="#fff"/>
  <rect x="10" y="20" width="100" height="36" rx="5" fill="#dcfce7"/><text x="60" y="43" text-anchor="middle">day 1: 3</text>
  <rect x="120" y="20" width="100" height="36" rx="5" fill="#dcfce7"/><text x="170" y="43" text-anchor="middle">day 2: 3</text>
  <rect x="230" y="20" width="100" height="36" rx="5" fill="#e0e7ff"/><text x="280" y="43" text-anchor="middle">day 3: 2</text>
  <rect x="340" y="20" width="100" height="36" rx="5" fill="#e0e7ff"/><text x="390" y="43" text-anchor="middle">day 4: 2</text>
</svg>
```

quiz: How does schedule() share out chapters that don't divide evenly?
- [ ] It adds them all to the last day
- [x] The first days each get one extra, so days differ by at most one chapter
- [ ] It drops them
why: base chapters for everyone, plus one for the first `extra` days.

## Step: The prayer tab
kind: read
time: 14
uses: reminders

The prayer tab opens at the hour it is now (`currentHour('12:30')` is the Sixth Hour), with its verse and the traditional prayers (the Trisagion, Glory, the Lord's Prayer from the World English Bible, the Jesus Prayer). Your own prayer list appears at the end of each hour.

- The **prayer list** is pure functions: `addRequest`, `markAnswered`, `reopen`, `removeRequest`. Answered prayers move to a list you can look back on.
- **Prayer times**: tick the hours you want, then **Add to my calendar (.ics)** downloads daily events with alarms, so reminders work with the page closed.
- While the page is open, it can also show a notification, asked for from a link and only then.

```svg The prayer list moves requests between open and answered, and back
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 80" font-family="sans-serif" font-size="12">
  <rect width="460" height="80" fill="#fff"/>
  <rect x="10" y="25" width="100" height="30" rx="6" fill="#e0e7ff"/><text x="60" y="44" text-anchor="middle">addRequest</text>
  <rect x="160" y="25" width="100" height="30" rx="6" fill="#fef3c7"/><text x="210" y="44" text-anchor="middle">open</text>
  <rect x="320" y="25" width="120" height="30" rx="6" fill="#dcfce7"/><text x="380" y="44" text-anchor="middle">answered</text>
  <path d="M110 40 H160 M260 35 H320 M320 48 H260" stroke="#374151" stroke-width="2"/><text x="265" y="22">markAnswered</text><text x="275" y="70">reopen</text>
</svg>
```

quiz: Why does the Pray tab offer a calendar file as well as notifications?
- [x] The calendar reminds you even when the page is closed; notifications only work while it's open
- [ ] Notifications don't work in React
- [ ] Calendar files are required for prayer
why: Use the tool that works when the app isn't running.

## Session: The map

## Step: The map of biblical events
kind: read
time: 16
uses: svgmap

The map is the pattern from An interactive map with SVG pan and zoom: a Natural Earth base map, a viewBox camera with `zoomAt` and `pan`, pointer drags that only capture once they're drags, a wheel listener that stops page scrolling, and arrow keys and + / −. On top of it:

```js
export function filterEvents({ era = 'all', book = 'all' } = {}, events = EVENTS) {
  return events.filter((e) => (era === 'all' || e.era === era) && (book === 'all' || e.book === book));
}
```

- **Places** are `{ id, name, lon, lat }`; **events** are `{ title, era, place, book, chapter }` in the order they happened, in six eras from Abraham to the early Church.
- Only places with an event that matches the filters are drawn. Labels appear once you zoom in, and markers and text shrink with the zoom so they stay the same size on screen.
- **Play in order** steps through the filtered events every 2.5 seconds, flying the camera to each place with `centreOn()`.
- Clicking a place lists what happened there, with links to each chapter in SuperBook.

```svg Play in order moves the camera from event to event
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 110" font-family="sans-serif" font-size="12">
  <rect width="460" height="110" fill="#cfe3ef"/>
  <path d="M0 50 C 100 30, 200 80, 300 60 S 400 40, 460 50 V110 H0Z" fill="#efe6d2"/>
  <circle cx="400" cy="80" r="5" fill="#b5562d"/><text x="380" y="100">Ur</text>
  <circle cx="330" cy="62" r="5" fill="#b5562d"/><text x="300" y="58">Haran</text>
  <circle cx="250" cy="85" r="5" fill="#b5562d"/><text x="225" y="102">Shechem</text>
  <path d="M400 80 Q 360 55 330 62 Q 290 75 250 85" fill="none" stroke="#7a1d1d" stroke-dasharray="5 4" stroke-width="2"/>
</svg>
```

quiz: What decides which places appear on the map?
- [ ] All 42 always appear
- [x] Only places with at least one event that matches the chosen era and book
- [ ] Only places in the current view
why: Filtering events filters the places with them.

## Step: How the real project is organized
kind: read
time: 10

```bash
npm start       # http://localhost:8000
npm test        # plans, progress, prayers, translations, the map and the SuperBook sync
npm run build   # into docs/ for GitHub Pages
```

| File | What it does |
|---|---|
| `lib/books.js` | the Orthodox canon, synced with SuperBook |
| `lib/plans.js`, `lib/progress.js` | plans, streak, completion, catch-up |
| `lib/translations.js` | chapters by translation, side by side, highlights |
| `lib/prayers.js` | hours, prayer list, next reminder, calendar file |
| `lib/map.js`, `data/places.js` | places, events, filters, pan and zoom |
| `data/basemap.json` | Natural Earth land, lakes and rivers, made by `tools/build_basemap.py` |

```svg Plain libraries with tests below; three tab components above
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 90" font-family="sans-serif" font-size="12">
  <rect width="480" height="90" fill="#fff"/>
  <rect x="10" y="10" width="460" height="28" rx="6" fill="#dbeafe"/><text x="240" y="29" text-anchor="middle">ReadingPlan · Translations · Prayers · BibleMap</text>
  <rect x="10" y="50" width="460" height="28" rx="6" fill="#dcfce7"/><text x="240" y="69" text-anchor="middle">books · plans · progress · translations · prayers · map (node --test)</text>
</svg>
```

quiz: Where would you add a new event to the map?
- [x] In data/places.js, as one line with its title, era, place, book and chapter
- [ ] In BibleMap.jsx
- [ ] In basemap.json
why: Data lives in data files; the map draws whatever is listed.

## Finish

You built a Bible study app with even reading plans, translations side by side, prayers with dependable reminders and an interactive map, all on tested plain functions.

### Challenges

1. Add Paul's journeys as dotted routes that play in order.
2. Add a reading plan of your own, like the Psalms and Proverbs together.
3. Let a place's panel show the first verse of each chapter from the translations cache.
