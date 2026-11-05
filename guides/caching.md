---
id: caching
title: Caching and late responses
blocks-html: page
blocks-css: base
blocks-js: api, cache, race, expiry
goals: Remember answers from a slow source in a Map so asking twice is instant; Spot the late-response bug, where an old answer arrives after a newer one and overwrites it; Fix it by only showing the answer to the latest request; Give cached answers an age limit, and refresh them in the background; Keep a cache from growing forever by dropping the oldest entry
prereqs: The Web APIs lesson (fetch, async and await) and the Fetching quotes and jokes lesson
---

## Session: Fast, and never wrong

## Step: Why apps remember, and how they get it wrong
time: 12
kind: read

Asking a web API takes time, from a tenth of a second to several seconds. If a reader opens Genesis 1, goes elsewhere and comes back, asking again is a waste. A **cache** remembers the answer: the first time is slow, every time after is instant.

A JavaScript `Map` is a perfect small cache: the request's address is the key, the answer is the value.

```js
const cache = new Map();
if (cache.has(url)) return cache.get(url);   // instant
const data = await fetchSlowly(url);
cache.set(url, data);
```

Speed brings a subtle bug. Responses don't arrive in the order you asked. Click chapter 1, then quickly chapter 2: if chapter 1 is slower, it arrives **last** and overwrites chapter 2 on the screen. The reader asked for chapter 2 and sees chapter 1.

```svg Click 1 then 2: the reply to 2 arrives first, then the late reply to 1 overwrites it
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 130" font-family="sans-serif" font-size="11">
  <path d="M10 110 H320" stroke="#94a3b8"/><text x="300" y="125" fill="#64748b">time →</text>
  <rect x="20" y="20" width="230" height="22" rx="6" fill="#fde68a"/><text x="28" y="35">request 1 (slow)</text>
  <rect x="70" y="52" width="100" height="22" rx="6" fill="#bfdbfe"/><text x="78" y="67">request 2 (fast)</text>
  <path d="M170 74 V100" stroke="#2563eb" stroke-width="2"/><text x="140" y="96" fill="#1d4ed8">shows 2 ✓</text>
  <path d="M250 42 V100" stroke="#b91c1c" stroke-width="2"/><text x="222" y="96" fill="#b91c1c">shows 1 ✗</text>
</svg>
```

The fix is to remember **which request is the latest**, and ignore any answer that isn't for it. SuperBook does exactly that when you move between books and chapters quickly.

## Step: A slow source and a cache
time: 12

The lesson uses a pretend API, `fetchChapter(n)`, that waits a random 300 to 1,500 milliseconds before answering, like a real network on a bad day. (Swap it for `fetch` and nothing else changes.)

`getChapter(n)` checks the cache first. Only on a miss does it call the slow source, then it stores the answer. The page labels each answer "from the network" or "from the cache" and shows how long it took.

check: js | a Map as the cache | /const\s+cache\s*=\s*new\s+Map\(\)/ | const cache = new Map();
check: js | checking the cache first | /if\s*\(\s*cache\.has\(/ | if (cache.has(n)) return cache.get(n);
check: js | storing new answers | /cache\.set\(/ | cache.set(n, text);

quiz: You open chapter 3 twice. How many times is the slow source asked?
- [x] Once; the second time is answered from the cache
- [ ] Twice
- [ ] Never
why: The first visit fills the cache; later ones read it.

quiz: Why is a Map a good cache?
- [ ] It sorts entries alphabetically
- [x] It looks up any key instantly and remembers the order entries were added
- [ ] It saves to disk
why: Fast has/get/set, plus insertion order, which the last step uses to drop the oldest.

```html page
<main class="wrap">
  <h1>Chapters</h1>
  <p class="row" id="buttons"></p>
  <p id="status" class="status" role="status">Pick a chapter.</p>
  <article id="text" class="text"></article>
  <ol id="log" class="log"></ol>
</main>
```

```css base
body { margin: 0; font-family: Georgia, serif; background: #fdf6e3; color: #3b2f1e; }
.wrap { max-width: 560px; margin: 0 auto; padding: 16px; }
h1 { margin-top: 0; }
.row { display: flex; flex-wrap: wrap; gap: 6px; }
button { font: 600 .95rem system-ui, sans-serif; padding: 6px 12px; cursor: pointer; }
.status { font: .9rem system-ui, sans-serif; color: #7c5e2a; min-height: 1.4em; }
.text { min-height: 4em; padding: 12px; background: #fff; border-radius: 10px; font-size: 1.1rem; }
.log { font: .8rem ui-monospace, Menlo, Consolas, monospace; color: #6b5a3a; }
.log .stale { color: #b91c1c; }
```

```js api
const CHAPTERS = {
  1: 'In the beginning the road was long and quiet.',
  2: 'On the second day the travelers reached the river.',
  3: 'The third chapter tells of the bridge that was never built.',
  4: 'In the fourth, a storm came down from the hills.',
  5: 'The last chapter ends where the first began.',
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** A pretend slow web API: answers after 300 to 1,500 ms. */
async function fetchChapter(n) {
  await wait(300 + Math.random() * 1200);
  return CHAPTERS[n];
}

const statusEl = document.getElementById('status');
const textEl = document.getElementById('text');
const logEl = document.getElementById('log');
const log = (msg, cls = '') => logEl.prepend(Object.assign(document.createElement('li'), { textContent: msg, className: cls }));

document.getElementById('buttons').replaceChildren(...Object.keys(CHAPTERS).map((n) => {
  const b = document.createElement('button');
  b.textContent = `Chapter ${n}`;
  b.dataset.n = n;
  return b;
}));
```

```js cache
const cache = new Map();

async function getChapter(n) {
  if (cache.has(n)) return { text: cache.get(n), from: 'the cache' };
  const text = await fetchChapter(n);
  cache.set(n, text);
  return { text, from: 'the network' };
}

document.getElementById('buttons').addEventListener('click', async (e) => {
  const n = e.target.dataset.n;
  if (!n) return;
  const started = performance.now();
  statusEl.textContent = `Loading chapter ${n}…`;
  const { text, from } = await getChapter(n);
  const ms = Math.round(performance.now() - started);
  textEl.textContent = text;
  statusEl.textContent = `Chapter ${n} from ${from} in ${ms} ms`;
  log(`chapter ${n}: ${from}, ${ms} ms`);
});
```

## Step: Only the latest answer wins
time: 15

Click Chapter 1 and then Chapter 2 quickly, a few times (use chapters you haven't opened, so they aren't cached). Sometimes chapter 1 shows up **after** chapter 2. That's the late-response bug, and the log marks it in red.

The fix: give each request a number. A counter goes up by one for every click, each request remembers its own number, and when an answer arrives the page shows it **only if its number is still the latest**:

```js
const id = ++latest;
const result = await getChapter(n);
if (id !== latest) return;   // a newer request has been made since: ignore this answer
```

The answer still goes into the cache (it isn't wasted), it's just not shown. `AbortController` can also cancel a real `fetch` outright; the counter works with any async code, which is why it's worth knowing first.

```svg Each request gets a number; when an answer arrives, it's shown only if its number is still the latest
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="11">
  <rect x="10" y="15" width="90" height="26" rx="6" fill="#fde68a"/><text x="55" y="32" text-anchor="middle">#1 chapter 1</text>
  <rect x="10" y="55" width="90" height="26" rx="6" fill="#bfdbfe"/><text x="55" y="72" text-anchor="middle">#2 chapter 2</text>
  <text x="120" y="32">answer for #1 arrives: latest is 2 → ignore</text>
  <text x="120" y="72">answer for #2 arrives: latest is 2 → show</text>
</svg>
```

check: js | a counter for the latest request | /let\s+latest\s*=\s*0/ | let latest = 0;
check: js | each request takes the next number | /const\s+id\s*=\s*\+\+latest/ | const id = ++latest;
check: js | ignoring answers that aren't the latest | /if\s*\(\s*id\s*!==\s*latest\s*\)/ | if (id !== latest) return;

quiz: Why don't responses always arrive in the order they were asked?
- [ ] Browsers sort them randomly
- [x] Each one takes its own time over the network, so a slow early request can finish after a fast later one
- [ ] The cache reorders them
why: Network time varies per request; order of asking isn't order of arriving.

quiz: The answer to an old request arrives. What happens to it?
- [x] It's saved in the cache but not shown, because a newer request has been made
- [ ] It's thrown away completely
- [ ] It replaces what's on screen
why: The data is still useful for next time; it just isn't what the reader asked for now.

```js cache
const cache = new Map();

async function getChapter(n) {
  if (cache.has(n)) return { text: cache.get(n), from: 'the cache' };
  const text = await fetchChapter(n);
  cache.set(n, text);
  return { text, from: 'the network' };
}
```

```js race
let latest = 0;

document.getElementById('buttons').addEventListener('click', async (e) => {
  const n = e.target.dataset.n;
  if (!n) return;
  const id = ++latest;
  const started = performance.now();
  statusEl.textContent = `Loading chapter ${n}…`;
  const { text, from } = await getChapter(n);
  const ms = Math.round(performance.now() - started);
  if (id !== latest) {
    log(`chapter ${n} arrived late (${ms} ms): ignored`, 'stale');
    return;
  }
  textEl.textContent = text;
  statusEl.textContent = `Chapter ${n} from ${from} in ${ms} ms`;
  log(`chapter ${n}: ${from}, ${ms} ms`);
});
```

## Step: Ages, background refresh and a size limit
time: 15

Two more problems with a cache that keeps everything forever:

- **Answers go stale.** A translation or a news item can change. Each cache entry now stores **when** it was saved. Younger than 30 seconds (short, so you can see it): use it. Older: show it straight away **and** fetch a fresh copy in the background. That's called **stale-while-revalidate**, and it's how browsers and many apps cache: fast now, fresh soon.
- **Memory isn't endless.** The cache keeps at most 3 chapters. When a fourth is added, the **oldest** entry goes. A Map remembers insertion order, so `cache.keys().next().value` is the oldest key. Reading an entry deletes and re-adds it, moving it to the "newest" end, so the least recently **used** one is dropped. That's an **LRU** (least recently used) cache.

```svg An LRU cache of three: using an entry moves it to the newest end; adding a fourth drops the oldest
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="11">
  <text x="10" y="20">oldest →</text><text x="250" y="20">← newest</text>
  <g><rect x="10" y="30" width="70" height="28" rx="6" fill="#fecaca"/><text x="45" y="48" text-anchor="middle">ch 1</text>
  <rect x="90" y="30" width="70" height="28" rx="6" fill="#fde68a"/><text x="125" y="48" text-anchor="middle">ch 3</text>
  <rect x="170" y="30" width="70" height="28" rx="6" fill="#fde68a"/><text x="205" y="48" text-anchor="middle">ch 2</text>
  <rect x="250" y="30" width="70" height="28" rx="6" fill="#bbf7d0"/><text x="285" y="48" text-anchor="middle">+ ch 5</text></g>
  <text x="10" y="84" fill="#b91c1c">ch 1 is dropped when ch 5 arrives</text>
</svg>
```

check: js | each entry remembers when it was saved | /at\s*=\s*Date\.now\(\)|at\s*:\s*Date\.now\(\)/ | function remember(n, text, at = Date.now()) { cache.set(n, { text, at }); }
check: js | refreshing stale entries in the background | /MAX_AGE/ | if (Date.now() - entry.at > MAX_AGE) refresh(n);
check: js | dropping the oldest entry | /cache\.delete\(\s*cache\.keys\(\)\.next\(\)\.value\s*\)/ | cache.delete(cache.keys().next().value);

quiz: A cached chapter is 2 minutes old (the limit is 30 seconds). What does the page do?
- [ ] Waits for a fresh copy before showing anything
- [x] Shows the cached copy immediately and fetches a fresh one in the background
- [ ] Deletes it and shows nothing
why: Stale-while-revalidate: instant answer now, up-to-date answer moments later.

quiz: Why delete and re-add an entry when it's read?
- [x] So it moves to the newest end of the Map, and the least recently used entry is the one dropped
- [ ] Maps can only be read once
- [ ] To make it fresh again
why: A Map's order is insertion order, so re-inserting marks it as just used.

```js cache
const cache = new Map();

async function getChapter(n) {
  const entry = cache.get(n);
  if (entry) {
    remember(n, entry.text, entry.at);
    if (Date.now() - entry.at > MAX_AGE) {
      refresh(n);
      return { text: entry.text, from: 'the cache (stale, refreshing)' };
    }
    return { text: entry.text, from: 'the cache' };
  }
  const text = await fetchChapter(n);
  remember(n, text);
  return { text, from: 'the network' };
}
```

```js expiry
const MAX_AGE = 30 * 1000;
const MAX_ENTRIES = 3;

function remember(n, text, at = Date.now()) {
  cache.delete(n);
  cache.set(n, { text, at });
  while (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value);
}

async function refresh(n) {
  const text = await fetchChapter(n);
  cache.set(n, { text, at: Date.now() });
  log(`chapter ${n}: refreshed in the background`);
}
```

## Finish

Your app can be fast without being wrong. You learned:

- A **Map cache**: check it first, fill it on a miss
- The **late-response bug**, and showing only the **latest** request's answer
- **Ages** on entries and **stale-while-revalidate**
- An **LRU** size limit using the Map's insertion order

You've now learned every part of SuperBook's loading: web APIs, caching and late responses.

### Challenges

1. Save the cache to localStorage (with its ages), so a reload starts warm.
2. Cancel the slow request with `AbortController` when a newer one starts, instead of ignoring its answer.
3. Show a small "cached" badge on chapter buttons whose text is already in the cache.

### Next

**Matching questions to answers**: find the passages that answer what someone asked.
