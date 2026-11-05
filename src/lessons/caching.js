// Built from guides/caching.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "caching",
 "title": "Caching and late responses",
 "goals": [
  "Remember answers from a slow source in a Map so asking twice is instant",
  "Spot the late-response bug, where an old answer arrives after a newer one and overwrites it",
  "Fix it by only showing the answer to the latest request",
  "Give cached answers an age limit, and refresh them in the background",
  "Keep a cache from growing forever by dropping the oldest entry"
 ],
 "prereqs": [
  "The Web APIs lesson (fetch, async and await) and the Fetching quotes and jokes lesson"
 ],
 "sessions": [
  {
   "title": "Fast, and never wrong",
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
   "api": "",
   "cache": "",
   "race": "",
   "expiry": ""
  }
 },
 "steps": [
  {
   "title": "Why apps remember, and how they get it wrong",
   "body": "Asking a web API takes time, from a tenth of a second to several seconds. If a reader opens Genesis 1, goes elsewhere and comes back, asking again is a waste. A **cache** remembers the answer: the first time is slow, every time after is instant.\n\nA JavaScript `Map` is a perfect small cache: the request's address is the key, the answer is the value.\n\n```js\nconst cache = new Map();\nif (cache.has(url)) return cache.get(url);   // instant\nconst data = await fetchSlowly(url);\ncache.set(url, data);\n```\n\nSpeed brings a subtle bug. Responses don't arrive in the order you asked. Click chapter 1, then quickly chapter 2: if chapter 1 is slower, it arrives **last** and overwrites chapter 2 on the screen. The reader asked for chapter 2 and sees chapter 1.\n\n```svg Click 1 then 2: the reply to 2 arrives first, then the late reply to 1 overwrites it\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 130\" font-family=\"sans-serif\" font-size=\"11\">\n  <path d=\"M10 110 H320\" stroke=\"#94a3b8\"/><text x=\"300\" y=\"125\" fill=\"#64748b\">time →</text>\n  <rect x=\"20\" y=\"20\" width=\"230\" height=\"22\" rx=\"6\" fill=\"#fde68a\"/><text x=\"28\" y=\"35\">request 1 (slow)</text>\n  <rect x=\"70\" y=\"52\" width=\"100\" height=\"22\" rx=\"6\" fill=\"#bfdbfe\"/><text x=\"78\" y=\"67\">request 2 (fast)</text>\n  <path d=\"M170 74 V100\" stroke=\"#2563eb\" stroke-width=\"2\"/><text x=\"140\" y=\"96\" fill=\"#1d4ed8\">shows 2 ✓</text>\n  <path d=\"M250 42 V100\" stroke=\"#b91c1c\" stroke-width=\"2\"/><text x=\"222\" y=\"96\" fill=\"#b91c1c\">shows 1 ✗</text>\n</svg>\n```\n\nThe fix is to remember **which request is the latest**, and ignore any answer that isn't for it. SuperBook does exactly that when you move between books and chapters quickly.",
   "session": 0,
   "minutes": 12,
   "kind": "read"
  },
  {
   "title": "A slow source and a cache",
   "body": "The lesson uses a pretend API, `fetchChapter(n)`, that waits a random 300 to 1,500 milliseconds before answering, like a real network on a bad day. (Swap it for `fetch` and nothing else changes.)\n\n`getChapter(n)` checks the cache first. Only on a miss does it call the slow source, then it stores the answer. The page labels each answer \"from the network\" or \"from the cache\" and shows how long it took.",
   "checks": [
    {
     "pane": "js",
     "label": "a Map as the cache",
     "test": "/const\\s+cache\\s*=\\s*new\\s+Map\\(\\)/",
     "hint": "const cache = new Map();"
    },
    {
     "pane": "js",
     "label": "checking the cache first",
     "test": "/if\\s*\\(\\s*cache\\.has\\(/",
     "hint": "if (cache.has(n)) return cache.get(n);"
    },
    {
     "pane": "js",
     "label": "storing new answers",
     "test": "/cache\\.set\\(/",
     "hint": "cache.set(n, text);"
    }
   ],
   "quiz": [
    {
     "q": "You open chapter 3 twice. How many times is the slow source asked?",
     "options": [
      "Once; the second time is answered from the cache",
      "Twice",
      "Never"
     ],
     "answer": 0,
     "why": "The first visit fills the cache; later ones read it."
    },
    {
     "q": "Why is a Map a good cache?",
     "options": [
      "It sorts entries alphabetically",
      "It looks up any key instantly and remembers the order entries were added",
      "It saves to disk"
     ],
     "answer": 1,
     "why": "Fast has/get/set, plus insertion order, which the last step uses to drop the oldest."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main class=\"wrap\">\n  <h1>Chapters</h1>\n  <p class=\"row\" id=\"buttons\"></p>\n  <p id=\"status\" class=\"status\" role=\"status\">Pick a chapter.</p>\n  <article id=\"text\" class=\"text\"></article>\n  <ol id=\"log\" class=\"log\"></ol>\n</main>"
   },
   "css": {
    "base": "body { margin: 0; font-family: Georgia, serif; background: #fdf6e3; color: #3b2f1e; }\n.wrap { max-width: 560px; margin: 0 auto; padding: 16px; }\nh1 { margin-top: 0; }\n.row { display: flex; flex-wrap: wrap; gap: 6px; }\nbutton { font: 600 .95rem system-ui, sans-serif; padding: 6px 12px; cursor: pointer; }\n.status { font: .9rem system-ui, sans-serif; color: #7c5e2a; min-height: 1.4em; }\n.text { min-height: 4em; padding: 12px; background: #fff; border-radius: 10px; font-size: 1.1rem; }\n.log { font: .8rem ui-monospace, Menlo, Consolas, monospace; color: #6b5a3a; }\n.log .stale { color: #b91c1c; }"
   },
   "js": {
    "api": "const CHAPTERS = {\n  1: 'In the beginning the road was long and quiet.',\n  2: 'On the second day the travelers reached the river.',\n  3: 'The third chapter tells of the bridge that was never built.',\n  4: 'In the fourth, a storm came down from the hills.',\n  5: 'The last chapter ends where the first began.',\n};\n\nconst wait = (ms) => new Promise((r) => setTimeout(r, ms));\n\n/** A pretend slow web API: answers after 300 to 1,500 ms. */\nasync function fetchChapter(n) {\n  await wait(300 + Math.random() * 1200);\n  return CHAPTERS[n];\n}\n\nconst statusEl = document.getElementById('status');\nconst textEl = document.getElementById('text');\nconst logEl = document.getElementById('log');\nconst log = (msg, cls = '') => logEl.prepend(Object.assign(document.createElement('li'), { textContent: msg, className: cls }));\n\ndocument.getElementById('buttons').replaceChildren(...Object.keys(CHAPTERS).map((n) => {\n  const b = document.createElement('button');\n  b.textContent = `Chapter ${n}`;\n  b.dataset.n = n;\n  return b;\n}));",
    "cache": "const cache = new Map();\n\nasync function getChapter(n) {\n  if (cache.has(n)) return { text: cache.get(n), from: 'the cache' };\n  const text = await fetchChapter(n);\n  cache.set(n, text);\n  return { text, from: 'the network' };\n}\n\ndocument.getElementById('buttons').addEventListener('click', async (e) => {\n  const n = e.target.dataset.n;\n  if (!n) return;\n  const started = performance.now();\n  statusEl.textContent = `Loading chapter ${n}…`;\n  const { text, from } = await getChapter(n);\n  const ms = Math.round(performance.now() - started);\n  textEl.textContent = text;\n  statusEl.textContent = `Chapter ${n} from ${from} in ${ms} ms`;\n  log(`chapter ${n}: ${from}, ${ms} ms`);\n});"
   }
  },
  {
   "title": "Only the latest answer wins",
   "body": "Click Chapter 1 and then Chapter 2 quickly, a few times (use chapters you haven't opened, so they aren't cached). Sometimes chapter 1 shows up **after** chapter 2. That's the late-response bug, and the log marks it in red.\n\nThe fix: give each request a number. A counter goes up by one for every click, each request remembers its own number, and when an answer arrives the page shows it **only if its number is still the latest**:\n\n```js\nconst id = ++latest;\nconst result = await getChapter(n);\nif (id !== latest) return;   // a newer request has been made since: ignore this answer\n```\n\nThe answer still goes into the cache (it isn't wasted), it's just not shown. `AbortController` can also cancel a real `fetch` outright; the counter works with any async code, which is why it's worth knowing first.\n\n```svg Each request gets a number; when an answer arrives, it's shown only if its number is still the latest\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"10\" y=\"15\" width=\"90\" height=\"26\" rx=\"6\" fill=\"#fde68a\"/><text x=\"55\" y=\"32\" text-anchor=\"middle\">#1 chapter 1</text>\n  <rect x=\"10\" y=\"55\" width=\"90\" height=\"26\" rx=\"6\" fill=\"#bfdbfe\"/><text x=\"55\" y=\"72\" text-anchor=\"middle\">#2 chapter 2</text>\n  <text x=\"120\" y=\"32\">answer for #1 arrives: latest is 2 → ignore</text>\n  <text x=\"120\" y=\"72\">answer for #2 arrives: latest is 2 → show</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a counter for the latest request",
     "test": "/let\\s+latest\\s*=\\s*0/",
     "hint": "let latest = 0;"
    },
    {
     "pane": "js",
     "label": "each request takes the next number",
     "test": "/const\\s+id\\s*=\\s*\\+\\+latest/",
     "hint": "const id = ++latest;"
    },
    {
     "pane": "js",
     "label": "ignoring answers that aren't the latest",
     "test": "/if\\s*\\(\\s*id\\s*!==\\s*latest\\s*\\)/",
     "hint": "if (id !== latest) return;"
    }
   ],
   "quiz": [
    {
     "q": "Why don't responses always arrive in the order they were asked?",
     "options": [
      "Browsers sort them randomly",
      "Each one takes its own time over the network, so a slow early request can finish after a fast later one",
      "The cache reorders them"
     ],
     "answer": 1,
     "why": "Network time varies per request; order of asking isn't order of arriving."
    },
    {
     "q": "The answer to an old request arrives. What happens to it?",
     "options": [
      "It's saved in the cache but not shown, because a newer request has been made",
      "It's thrown away completely",
      "It replaces what's on screen"
     ],
     "answer": 0,
     "why": "The data is still useful for next time; it just isn't what the reader asked for now."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "cache": "const cache = new Map();\n\nasync function getChapter(n) {\n  if (cache.has(n)) return { text: cache.get(n), from: 'the cache' };\n  const text = await fetchChapter(n);\n  cache.set(n, text);\n  return { text, from: 'the network' };\n}",
    "race": "let latest = 0;\n\ndocument.getElementById('buttons').addEventListener('click', async (e) => {\n  const n = e.target.dataset.n;\n  if (!n) return;\n  const id = ++latest;\n  const started = performance.now();\n  statusEl.textContent = `Loading chapter ${n}…`;\n  const { text, from } = await getChapter(n);\n  const ms = Math.round(performance.now() - started);\n  if (id !== latest) {\n    log(`chapter ${n} arrived late (${ms} ms): ignored`, 'stale');\n    return;\n  }\n  textEl.textContent = text;\n  statusEl.textContent = `Chapter ${n} from ${from} in ${ms} ms`;\n  log(`chapter ${n}: ${from}, ${ms} ms`);\n});"
   }
  },
  {
   "title": "Ages, background refresh and a size limit",
   "body": "Two more problems with a cache that keeps everything forever:\n\n- **Answers go stale.** A translation or a news item can change. Each cache entry now stores **when** it was saved. Younger than 30 seconds (short, so you can see it): use it. Older: show it straight away **and** fetch a fresh copy in the background. That's called **stale-while-revalidate**, and it's how browsers and many apps cache: fast now, fresh soon.\n- **Memory isn't endless.** The cache keeps at most 3 chapters. When a fourth is added, the **oldest** entry goes. A Map remembers insertion order, so `cache.keys().next().value` is the oldest key. Reading an entry deletes and re-adds it, moving it to the \"newest\" end, so the least recently **used** one is dropped. That's an **LRU** (least recently used) cache.\n\n```svg An LRU cache of three: using an entry moves it to the newest end; adding a fourth drops the oldest\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"11\">\n  <text x=\"10\" y=\"20\">oldest →</text><text x=\"250\" y=\"20\">← newest</text>\n  <g><rect x=\"10\" y=\"30\" width=\"70\" height=\"28\" rx=\"6\" fill=\"#fecaca\"/><text x=\"45\" y=\"48\" text-anchor=\"middle\">ch 1</text>\n  <rect x=\"90\" y=\"30\" width=\"70\" height=\"28\" rx=\"6\" fill=\"#fde68a\"/><text x=\"125\" y=\"48\" text-anchor=\"middle\">ch 3</text>\n  <rect x=\"170\" y=\"30\" width=\"70\" height=\"28\" rx=\"6\" fill=\"#fde68a\"/><text x=\"205\" y=\"48\" text-anchor=\"middle\">ch 2</text>\n  <rect x=\"250\" y=\"30\" width=\"70\" height=\"28\" rx=\"6\" fill=\"#bbf7d0\"/><text x=\"285\" y=\"48\" text-anchor=\"middle\">+ ch 5</text></g>\n  <text x=\"10\" y=\"84\" fill=\"#b91c1c\">ch 1 is dropped when ch 5 arrives</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "each entry remembers when it was saved",
     "test": "/at\\s*=\\s*Date\\.now\\(\\)|at\\s*:\\s*Date\\.now\\(\\)/",
     "hint": "function remember(n, text, at = Date.now()) { cache.set(n, { text, at }); }"
    },
    {
     "pane": "js",
     "label": "refreshing stale entries in the background",
     "test": "/MAX_AGE/",
     "hint": "if (Date.now() - entry.at > MAX_AGE) refresh(n);"
    },
    {
     "pane": "js",
     "label": "dropping the oldest entry",
     "test": "/cache\\.delete\\(\\s*cache\\.keys\\(\\)\\.next\\(\\)\\.value\\s*\\)/",
     "hint": "cache.delete(cache.keys().next().value);"
    }
   ],
   "quiz": [
    {
     "q": "A cached chapter is 2 minutes old (the limit is 30 seconds). What does the page do?",
     "options": [
      "Waits for a fresh copy before showing anything",
      "Shows the cached copy immediately and fetches a fresh one in the background",
      "Deletes it and shows nothing"
     ],
     "answer": 1,
     "why": "Stale-while-revalidate: instant answer now, up-to-date answer moments later."
    },
    {
     "q": "Why delete and re-add an entry when it's read?",
     "options": [
      "So it moves to the newest end of the Map, and the least recently used entry is the one dropped",
      "Maps can only be read once",
      "To make it fresh again"
     ],
     "answer": 0,
     "why": "A Map's order is insertion order, so re-inserting marks it as just used."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "cache": "const cache = new Map();\n\nasync function getChapter(n) {\n  const entry = cache.get(n);\n  if (entry) {\n    remember(n, entry.text, entry.at);\n    if (Date.now() - entry.at > MAX_AGE) {\n      refresh(n);\n      return { text: entry.text, from: 'the cache (stale, refreshing)' };\n    }\n    return { text: entry.text, from: 'the cache' };\n  }\n  const text = await fetchChapter(n);\n  remember(n, text);\n  return { text, from: 'the network' };\n}",
    "expiry": "const MAX_AGE = 30 * 1000;\nconst MAX_ENTRIES = 3;\n\nfunction remember(n, text, at = Date.now()) {\n  cache.delete(n);\n  cache.set(n, { text, at });\n  while (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value);\n}\n\nasync function refresh(n) {\n  const text = await fetchChapter(n);\n  cache.set(n, { text, at: Date.now() });\n  log(`chapter ${n}: refreshed in the background`);\n}"
   }
  }
 ],
 "finish": "Your app can be fast without being wrong. You learned:\n\n- A **Map cache**: check it first, fill it on a miss\n- The **late-response bug**, and showing only the **latest** request's answer\n- **Ages** on entries and **stale-while-revalidate**\n- An **LRU** size limit using the Map's insertion order\n\nYou've now learned every part of SuperBook's loading: web APIs, caching and late responses.\n\n### Challenges\n\n1. Save the cache to localStorage (with its ages), so a reload starts warm.\n2. Cancel the slow request with `AbortController` when a newer one starts, instead of ignoring its answer.\n3. Show a small \"cached\" badge on chapter buttons whose text is already in the cache.\n\n### Next\n\n**Matching questions to answers**: find the passages that answer what someone asked."
};
