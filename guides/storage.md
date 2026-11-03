---
id: storage
title: Saving a best score
blocks-html: page
blocks-css: base
blocks-js: elements, storage, game, stats
goals: Explain what localStorage keeps, where, and that it only stores strings; Save and load a number safely, with a default when nothing is saved; Wrap storage in try/catch because browsers can block it; Save several values at once as JSON; Clear saved data with removeItem
prereqs: The JavaScript basics lesson (variables, functions, if/else and events)
---

## Session: Remembering things

## Step: What localStorage is
time: 10
kind: read

Everything in your variables disappears when the page closes. To remember a best score until next time, the browser gives every website a small notebook called **localStorage**.

```js
localStorage.setItem('best', '42');     // write
localStorage.getItem('best');           // read: "42"
localStorage.removeItem('best');        // erase
```

Three things to know about it:

- **It only stores strings.** Save the number 42 and you get back the string `"42"`. Turn it back into a number with `Number()`.
- **It belongs to one website in one browser.** Your score on your laptop isn't on your phone, and another site can't read it.
- **It can fail.** Some private windows and locked-down school or work computers block it, and then `setItem` throws an error. A game that crashes because it couldn't save a score is a bad game.

```svg Your page writes and reads strings in localStorage, which stays on this device for this site after the page closes
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" font-family="sans-serif" font-size="12">
  <rect x="5" y="40" width="100" height="50" rx="10" fill="#e0e7ff" stroke="#6366f1"/><text x="55" y="62" text-anchor="middle">your page</text><text x="55" y="78" text-anchor="middle">best = 42</text>
  <rect x="200" y="30" width="115" height="70" rx="10" fill="#fef9c3" stroke="#ca8a04"/><text x="257" y="52" text-anchor="middle">localStorage</text><text x="257" y="70" text-anchor="middle">"best": "42"</text><text x="257" y="88" text-anchor="middle" font-size="10">this site, this browser</text>
  <path d="M105 55 H196" stroke="#111" stroke-width="2"/><text x="150" y="48" text-anchor="middle">setItem</text>
  <path d="M196 78 H105" stroke="#111" stroke-width="2"/><text x="150" y="94" text-anchor="middle">getItem</text>
  <text x="160" y="122" text-anchor="middle" fill="#334155">still there after the page closes</text>
</svg>
```

> Never put passwords or private information in localStorage: anyone using that browser can open the developer tools and read it.

## Step: Loading and saving the best score safely
time: 15

Two small functions do all the storage work, so the rest of the game never touches localStorage directly:

```js
function loadBest() {
  try {
    return Number(localStorage.getItem('best')) || 0;
  } catch {
    return 0;
  }
}
```

- `getItem` gives `null` when nothing is saved yet, `Number(null)` is `0`, and `|| 0` also catches anything that isn't a number.
```svg loadBest(): read the string, turn it into a number, and fall back to 0 if it's missing or storage is blocked
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" font-family="sans-serif" font-size="12">
  <rect x="5" y="40" width="80" height="36" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="45" y="62" text-anchor="middle">getItem</text>
  <rect x="120" y="10" width="95" height="30" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="167" y="30" text-anchor="middle">"42" → 42</text>
  <rect x="120" y="46" width="95" height="30" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="167" y="66" text-anchor="middle">null → 0</text>
  <rect x="120" y="82" width="95" height="30" rx="8" fill="#fee2e2" stroke="#ef4444"/><text x="167" y="102" text-anchor="middle">blocked → 0</text>
  <path d="M85 50 L118 26 M85 58 H118 M85 66 L118 96" stroke="#111" stroke-width="2"/>
  <text x="225" y="30">saved score</text><text x="225" y="66">first visit</text><text x="225" y="102">catch</text>
</svg>
```

- `try { ... } catch { ... }` means "try this, and if it throws an error, do this instead". If storage is blocked, the game still works; it just won't remember the score.

check: js | reading the saved score | /localStorage\.getItem\(/ | localStorage.getItem('best')
check: js | turning the string into a number | /Number\(\s*localStorage\.getItem/ | Number(localStorage.getItem('best')) || 0
check: js | storage wrapped in try/catch | /try\s*\{[\s\S]*localStorage[\s\S]*\}\s*catch/ | try { ... } catch { ... }

quiz: What does `localStorage.getItem('best')` give the very first time, before anything was saved?
- [ ] 0
- [x] null
- [ ] An error
why: A missing item is `null`; `Number(null) || 0` turns that into 0.

quiz: Why is storage wrapped in `try/catch`?
- [ ] It makes saving faster
- [x] Some browsers block storage and throw an error; the game should keep working anyway
- [ ] localStorage requires it
why: Without it, a blocked save would crash the game. With it, the game just doesn't remember.

```html page
<main class="card">
  <h1>Best score</h1>
  <p class="big">Score <strong id="score">0</strong></p>
  <p>Best <strong id="best">0</strong></p>
  <p class="buttons">
    <button id="point">+1 point</button>
    <button id="over">Game over</button>
    <button id="reset">Reset saved data</button>
  </p>
  <p id="message" class="muted">Score some points, then press Game over. Reload the page: the best score is still there.</p>
  <p id="stats" class="muted"></p>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #e2e8f0;
}

.card {
  width: min(340px, 100% - 32px);
  padding: 20px;
  background: #fff;
  border-radius: 14px;
  text-align: center;
}

.big { font-size: 1.6rem; }
.muted { color: #64748b; }

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

button { padding: 6px 12px; font: inherit; }
```

```js elements
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const message = document.getElementById('message');
```

```js storage
function loadBest() {
  try {
    return Number(localStorage.getItem('best')) || 0;
  } catch {
    return 0;
  }
}

function saveBest(n) {
  try {
    localStorage.setItem('best', String(n));
  } catch {
    message.textContent = 'This browser is blocking storage, so the best score won\'t be kept.';
  }
}

bestEl.textContent = loadBest();
```

## Step: A new best only when you beat it
time: 12

The game keeps the **score** in a normal variable (it starts at 0 every game) and the **best** in storage. At game over, it compares them:

```js
if (score > best) {
  best = score;
  saveBest(best);
}
```

Only a higher score is saved, so a bad game never overwrites a good one. This is exactly what Snake does when the snake crashes.

```svg At game over: if the score beats the best, save it; otherwise keep the old best
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" font-family="sans-serif" font-size="12">
  <rect x="5" y="45" width="80" height="40" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="45" y="70" text-anchor="middle">game over</text>
  <path d="M120 65 L160 35 L200 65 L160 95 Z" fill="#fef9c3" stroke="#ca8a04"/><text x="160" y="69" text-anchor="middle">score &gt; best?</text>
  <rect x="230" y="10" width="85" height="36" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="272" y="32" text-anchor="middle">save it</text>
  <rect x="230" y="84" width="85" height="36" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="272" y="106" text-anchor="middle">keep old best</text>
  <path d="M85 65 H118 M190 50 L228 30 M190 80 L228 100" stroke="#111" stroke-width="2"/>
  <text x="205" y="32">yes</text><text x="205" y="104">no</text>
</svg>
```

check: js | a score that starts at 0 | /let\s+score\s*=\s*0/ | let score = 0;
check: js | only saving a higher score | /if\s*\(\s*score\s*>\s*best\s*\)/ | if (score > best) { ... }
check: js | saving the new best | /saveBest\(\s*best\s*\)/ | saveBest(best);

quiz: The best is 30 and you score 12. What is saved at game over?
- [ ] 12
- [x] Nothing changes; the best stays 30
- [ ] 42
why: 12 isn't greater than 30, so the old best is kept.

quiz: Why is the score a plain variable but the best kept in storage?
- [x] The score starts over each game; only the best needs to survive closing the page
- [ ] Storage can only hold one value
- [ ] Variables are faster than storage
why: Only what must outlive the page goes in storage.

```js game
let score = 0;
let best = loadBest();

document.getElementById('point').addEventListener('click', () => {
  score += 1;
  scoreEl.textContent = score;
});

document.getElementById('over').addEventListener('click', () => {
  if (score > best) {
    best = score;
    saveBest(best);
    message.textContent = `New best: ${best}!`;
  } else {
    message.textContent = `Game over. ${score} points; your best is still ${best}.`;
  }
  bestEl.textContent = best;
  score = 0;
  scoreEl.textContent = score;
});
```

## Step: Several values at once with JSON
time: 15

What if you also want to count games played? Storing each number under its own key works, but it gets messy. Instead, put them in one object and save it as **JSON**, a text format for objects:

```js
const stats = { games: 3, points: 41 };
localStorage.setItem('stats', JSON.stringify(stats));   // '{"games":3,"points":41}'
const back = JSON.parse(localStorage.getItem('stats')); // { games: 3, points: 41 }
```

`JSON.stringify` turns the object into a string to save, and `JSON.parse` turns it back. If the saved text is missing or broken, `JSON.parse` throws, which the `try/catch` already handles.

Game over now adds the game to the stats and saves them. **Reset saved data** uses `removeItem` to erase both keys. Every app that saves anything should give people a way to clear it.

check: js | saving an object as JSON | /JSON\.stringify\(/ | localStorage.setItem('stats', JSON.stringify(stats))
check: js | reading it back | /JSON\.parse\(/ | JSON.parse(localStorage.getItem('stats'))
check: js | erasing saved data | /localStorage\.removeItem\(/ | localStorage.removeItem('best')

quiz: What does `JSON.stringify({ games: 3 })` give?
- [x] The string '{"games":3}'
- [ ] The number 3
- [ ] An object with a games field
why: stringify turns an object into JSON text, which is what localStorage can store.

quiz: Why does reading the stats still sit inside try/catch?
- [ ] JSON.parse is slow
- [x] The saved text could be missing or broken, and JSON.parse throws on bad text
- [ ] removeItem needs it
why: `JSON.parse('oops')` throws a SyntaxError, so the code falls back to fresh stats instead of crashing.

```js stats
const statsEl = document.getElementById('stats');

function loadStats() {
  try {
    return { games: 0, points: 0, ...JSON.parse(localStorage.getItem('stats')) };
  } catch {
    return { games: 0, points: 0 };
  }
}

function saveStats(s) {
  try { localStorage.setItem('stats', JSON.stringify(s)); } catch { /* not saved */ }
}

function showStats(s) {
  statsEl.textContent = `${s.games} games played · ${s.points} points in all`;
}

let stats = loadStats();
showStats(stats);

document.getElementById('reset').addEventListener('click', () => {
  try {
    localStorage.removeItem('best');
    localStorage.removeItem('stats');
  } catch { /* nothing to clear */ }
  best = 0;
  stats = { games: 0, points: 0 };
  bestEl.textContent = 0;
  showStats(stats);
  message.textContent = 'Saved data cleared.';
});
```

```js game
let score = 0;
let best = loadBest();

document.getElementById('point').addEventListener('click', () => {
  score += 1;
  scoreEl.textContent = score;
});

document.getElementById('over').addEventListener('click', () => {
  if (score > best) {
    best = score;
    saveBest(best);
    message.textContent = `New best: ${best}!`;
  } else {
    message.textContent = `Game over. ${score} points; your best is still ${best}.`;
  }
  stats = { games: stats.games + 1, points: stats.points + score };
  saveStats(stats);
  showStats(stats);
  bestEl.textContent = best;
  score = 0;
  scoreEl.textContent = score;
});
```

## Finish

Your pages can remember things now. You learned:

- **localStorage** keeps strings per site, per browser, after the page closes
- `getItem`, `setItem` and `removeItem`, and `Number()` to get a number back
- **try/catch** so blocked storage never crashes the page
- Saving only a **new best**
- **JSON** to save several values as one string

### Challenges

1. Keep a top-5 list instead of one best score: an array saved as JSON, sorted, sliced to 5.
2. Save the date of the best score too, and show "set on Nov 3".
3. Open the developer tools (F12), find Application → Local Storage, and change the saved best by hand. What does that tell you about trusting saved data?

### Next

You've learned every skill Snake uses. Build **Snake**.
