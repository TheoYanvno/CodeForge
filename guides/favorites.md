---
id: favorites
title: Saving favorites
blocks-html: page
blocks-css: base
blocks-js: data, favs, store, list
goals: Give every item a stable id and save favorites as ids, not copies; Use a Set to add, remove and check favorites; Show a toggle button's state with aria-pressed and a clear label; Save a Set to localStorage as JSON and load it back safely; Build a favorites list from the ids, with an empty state
prereqs: The Saving a best score lesson (localStorage, JSON and try/catch) and the Arrays of objects and random picks lesson
---

## Session: Keeping the ones you like

## Step: Favorites are a list of ids
time: 10
kind: read

A favorite is just a note that says "this one". The simplest, safest note is the item's **id**: a value that never changes and is different for every item.

Why not save a copy of the whole quote? Because copies go stale. If a typo in a quote is fixed later, the saved copy keeps the typo forever. An id always points at the current version.

```svg Favorites store only ids; the quotes themselves stay in one place, so a fixed typo shows up in favorites too
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 140" font-family="sans-serif" font-size="12">
  <text x="5" y="16">quotes</text>
  <rect x="5" y="24" width="190" height="26" rx="6" fill="#e0e7ff" stroke="#6366f1"/><text x="12" y="41">id 1 · Well done is better…</text>
  <rect x="5" y="56" width="190" height="26" rx="6" fill="#e0e7ff" stroke="#6366f1"/><text x="12" y="73">id 2 · Simplicity is the…</text>
  <rect x="5" y="88" width="190" height="26" rx="6" fill="#e0e7ff" stroke="#6366f1"/><text x="12" y="105">id 3 · The secret of…</text>
  <text x="235" y="16">favorites</text>
  <rect x="235" y="40" width="90" height="60" rx="8" fill="#fce7f3" stroke="#db2777"/><text x="280" y="66" text-anchor="middle">Set {1, 3}</text><text x="280" y="84" text-anchor="middle" font-size="10">just ids</text>
  <path d="M233 60 L197 37 M233 80 L197 101" stroke="#db2777" stroke-width="2" stroke-dasharray="4 3"/>
</svg>
```

A **Set** is the right container for ids: it holds each value once, and it can tell you instantly whether something is in it.

```js
const favs = new Set();
favs.add(3);        // Set {3}
favs.add(3);        // still Set {3}: no duplicates
favs.has(3);        // true
favs.delete(3);     // Set {}
```

## Step: A heart that toggles
time: 15

Each quote gets a ♡ button. Clicking it **toggles**: adds the id if it isn't a favorite, removes it if it is.

```js
function toggle(id) {
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
}
```

The button shows its state in two ways: the heart fills in (♥), and `aria-pressed="true"` tells screen readers the button is "on". The label says what the button does ("Save to favorites" or "Remove from favorites"), so it makes sense to everyone.

check: js | favorites kept in a Set | /new\s+Set\(/ | const favs = new Set();
check: js | a toggle that adds or removes | /if\s*\(\s*favs\.has\(\s*id\s*\)\s*\)\s*favs\.delete\(\s*id\s*\)/ | if (favs.has(id)) favs.delete(id); else favs.add(id);
check: js | the pressed state for screen readers | /aria-pressed/ | b.setAttribute('aria-pressed', String(favs.has(q.id)))

quiz: You click the heart on quote 2 twice. What's in `favs`?
- [x] Nothing from quote 2: the first click added it, the second removed it
- [ ] 2, twice
- [ ] 2, once
why: A toggle flips the state each time.

quiz: Why save the quote's id instead of a copy of the quote?
- [ ] Ids are shorter to type
- [x] A copy goes stale when the quote is fixed or changed; an id always points at the current version
- [ ] localStorage can't store text
why: One source of truth: the quotes live in one place, and favorites only point at them.

```html page
<main class="card">
  <h1>Quotes</h1>
  <ul id="all" class="list"></ul>
  <h2>Your favorites <span id="count" class="count"></span></h2>
  <ul id="favs" class="list"></ul>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: start center;
  padding: 24px 0;
  font-family: system-ui, sans-serif;
  background: #fdf2f8;
  color: #500724;
}

.card {
  width: min(460px, 100% - 32px);
  padding: 20px;
  background: #fff;
  border-radius: 16px;
}

h1 { margin-top: 0; }
.count { font-size: .9rem; color: #9d174d; }
.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.list li { display: flex; gap: 10px; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: #fdf2f8; }

.heart {
  flex: none;
  width: 40px;
  height: 40px;
  border: 1px solid #f9a8d4;
  border-radius: 50%;
  background: #fff;
  color: #db2777;
  font-size: 1.2rem;
  cursor: pointer;
}

.heart[aria-pressed="true"] { background: #db2777; color: #fff; }
.empty { color: #9d174d; font-style: italic; }
```

```js data
const quotes = [
  { id: 1, text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { id: 2, text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { id: 3, text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { id: 4, text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },
];
```

```js favs
const favs = new Set();
const allEl = document.getElementById('all');

function toggle(id) {
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  render();
}

function heart(q) {
  const b = document.createElement('button');
  b.className = 'heart';
  const on = favs.has(q.id);
  b.textContent = on ? '♥' : '♡';
  b.setAttribute('aria-pressed', String(on));
  b.setAttribute('aria-label', on ? `Remove "${q.text}" from favorites` : `Save "${q.text}" to favorites`);
  b.addEventListener('click', () => toggle(q.id));
  return b;
}

function row(q) {
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = `${q.text} — ${q.author}`;
  li.append(span, heart(q));
  return li;
}

function render() {
  allEl.replaceChildren(...quotes.map(row));
  document.getElementById('count').textContent = `(${favs.size})`;
}

render();
```

## Step: Remembering favorites after a reload
time: 15

Right now a reload forgets everything. Save the Set in localStorage, like the best score.

localStorage stores strings, and JSON can't write a Set directly (`JSON.stringify(new Set([1]))` gives `"{}"`, which loses everything). So turn the Set into an array first, and back into a Set when loading:

```js
localStorage.setItem('favs', JSON.stringify([...favs]));        // Set {1, 3} → "[1,3]"
const back = new Set(JSON.parse(localStorage.getItem('favs')));  // "[1,3]" → Set {1, 3}
```

```svg Saving: Set → array → JSON text in storage. Loading: JSON text → array → Set
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="12">
  <rect x="5" y="30" width="80" height="36" rx="8" fill="#fce7f3" stroke="#db2777"/><text x="45" y="52" text-anchor="middle">Set {1, 3}</text>
  <rect x="125" y="30" width="80" height="36" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="165" y="52" text-anchor="middle">[1, 3]</text>
  <rect x="245" y="30" width="80" height="36" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="285" y="52" text-anchor="middle">"[1,3]"</text>
  <path d="M85 42 H121 M205 42 H241" stroke="#111" stroke-width="2"/><path d="M241 56 H205 M121 56 H85" stroke="#6b7280" stroke-width="2"/>
  <text x="103" y="24" text-anchor="middle">[...favs]</text><text x="223" y="24" text-anchor="middle">stringify</text>
  <text x="103" y="84" text-anchor="middle">new Set</text><text x="223" y="84" text-anchor="middle">parse</text>
</svg>
```

Loading also **cleans** the saved ids: it keeps only ids that still exist in `quotes`. If a quote was removed from the app, its old favorite quietly disappears instead of breaking the list. Anything saved in storage could be old or edited by hand, so the app never trusts it blindly.

check: js | saving the Set as a JSON array | /JSON\.stringify\(\s*\[\s*\.\.\.favs\s*\]\s*\)/ | localStorage.setItem('favs', JSON.stringify([...favs]))
check: js | reading the saved ids back | /JSON\.parse\(\s*localStorage\.getItem\(\s*['"]favs['"]/ | JSON.parse(localStorage.getItem('favs'))
check: js | keeping only ids that still exist | /quotes\.some\(/ | ids.filter((id) => quotes.some((q) => q.id === id))

quiz: What does `JSON.stringify(new Set([1, 3]))` give?
- [ ] "[1,3]"
- [x] "{}", so the favorites would be lost
- [ ] An error
why: JSON has no Set type; spread the Set into an array first.

quiz: Why does loading keep only ids that still exist in `quotes`?
- [x] Saved data can be old; a removed quote's id would otherwise point at nothing
- [ ] Sets can't hold more than the number of quotes
- [ ] It makes saving faster
why: Treat stored data as untrusted and clean it when you load it.

```js store
function loadFavs() {
  try {
    const ids = JSON.parse(localStorage.getItem('favs'));
    if (!Array.isArray(ids)) return new Set();
    return new Set(ids.filter((id) => quotes.some((q) => q.id === id)));
  } catch {
    return new Set();
  }
}

function saveFavs() {
  try { localStorage.setItem('favs', JSON.stringify([...favs])); } catch { /* not saved */ }
}
```

```js favs
const favs = loadFavs();
const allEl = document.getElementById('all');

function toggle(id) {
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  saveFavs();
  render();
}

function heart(q) {
  const b = document.createElement('button');
  b.className = 'heart';
  const on = favs.has(q.id);
  b.textContent = on ? '♥' : '♡';
  b.setAttribute('aria-pressed', String(on));
  b.setAttribute('aria-label', on ? `Remove "${q.text}" from favorites` : `Save "${q.text}" to favorites`);
  b.addEventListener('click', () => toggle(q.id));
  return b;
}

function row(q) {
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = `${q.text} — ${q.author}`;
  li.append(span, heart(q));
  return li;
}

function render() {
  allEl.replaceChildren(...quotes.map(row));
  document.getElementById('count').textContent = `(${favs.size})`;
}

render();
```

## Step: A favorites list built from the ids
time: 12

The favorites section shows the quotes whose ids are in the Set. That's the filtering lesson again, with a different test:

```js
const mine = quotes.filter((q) => favs.has(q.id));
```

```svg filter() walks the quotes in their own order and keeps the ones whose id is in the Set
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" font-family="sans-serif" font-size="12">
  <g><rect x="5" y="10" width="60" height="26" rx="6" fill="#fce7f3" stroke="#db2777"/><text x="35" y="27" text-anchor="middle">id 1 ✓</text>
  <rect x="75" y="10" width="60" height="26" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><text x="105" y="27" text-anchor="middle">id 2</text>
  <rect x="145" y="10" width="60" height="26" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><text x="175" y="27" text-anchor="middle">id 3</text>
  <rect x="215" y="10" width="60" height="26" rx="6" fill="#fce7f3" stroke="#db2777"/><text x="245" y="27" text-anchor="middle">id 4 ✓</text></g>
  <text x="290" y="27">quotes</text>
  <text x="5" y="62">favs.has(q.id)? → keep 1 and 4</text>
  <rect x="5" y="74" width="60" height="26" rx="6" fill="#fce7f3" stroke="#db2777"/><text x="35" y="91" text-anchor="middle">id 1</text>
  <rect x="75" y="74" width="60" height="26" rx="6" fill="#fce7f3" stroke="#db2777"/><text x="105" y="91" text-anchor="middle">id 4</text>
  <text x="145" y="91">your favorites</text>
</svg>
```

The list keeps the quotes' own order (not the order you clicked), and each row has its own heart, so you can remove a favorite from either list. When there are none, the section says how to add one instead of showing nothing.

The Quote & Joke Generator does exactly this, and later moves the Set from localStorage to your account on its server, so favorites follow you to any device. The code that *uses* favorites doesn't change.

check: js | the favorites list filtered from the ids | /quotes\.filter\(\s*\(?\s*q\s*\)?\s*=>\s*favs\.has\(\s*q\.id\s*\)\s*\)/ | quotes.filter((q) => favs.has(q.id))
check: js | a message when there are none | /favs\.size\s*===\s*0|!favs\.size|mine\.length\s*===\s*0|!mine\.length/ | if (mine.length === 0) { ... }

quiz: Favorites are {4, 1}, clicked in that order. In what order does the list show them?
- [ ] 4, then 1
- [x] 1, then 4, the same order as the quotes
- [ ] Random order
why: The list is quotes.filter(...), which keeps the quotes' order.

quiz: Later, favorites move to a server account. What has to change in render()?
- [ ] Everything
- [x] Nothing; only where the Set is loaded and saved changes
- [ ] The heart buttons
why: Loading and saving are kept in their own functions, so the rest of the app doesn't care where the ids live.

```js list
const favsEl = document.getElementById('favs');

function renderFavs() {
  const mine = quotes.filter((q) => favs.has(q.id));
  if (mine.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No favorites yet. Tap ♡ on a quote to keep it here.';
    favsEl.replaceChildren(li);
    return;
  }
  favsEl.replaceChildren(...mine.map(row));
}

render();
```

```js favs
const favs = loadFavs();
const allEl = document.getElementById('all');

function toggle(id) {
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  saveFavs();
  render();
}

function heart(q) {
  const b = document.createElement('button');
  b.className = 'heart';
  const on = favs.has(q.id);
  b.textContent = on ? '♥' : '♡';
  b.setAttribute('aria-pressed', String(on));
  b.setAttribute('aria-label', on ? `Remove "${q.text}" from favorites` : `Save "${q.text}" to favorites`);
  b.addEventListener('click', () => toggle(q.id));
  return b;
}

function row(q) {
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = `${q.text} — ${q.author}`;
  li.append(span, heart(q));
  return li;
}

function render() {
  allEl.replaceChildren(...quotes.map(row));
  document.getElementById('count').textContent = `(${favs.size})`;
  renderFavs();
}
```

## Finish

People can keep what they like now. You learned:

- Saving favorites as **ids**, not copies
- A **Set** with `add`, `delete` and `has`, and a **toggle**
- `aria-pressed` and a clear label for a toggle button
- Saving a Set as a **JSON array** and loading it back, cleaned
- A favorites list from `filter()` and `has()`, with an **empty state**

### Challenges

1. Add a "Clear all favorites" button that asks "Are you sure?" with your own small dialog (not `confirm()`).
2. Show the favorites in the order they were added, by saving an array of ids instead of a Set.
3. Add a count badge to the page title, like "Quotes (3 ♥)".

### Next

**Accounts: sign up, hashed passwords and sessions**, so favorites can belong to a person.
