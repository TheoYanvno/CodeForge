---
id: filtering
title: Filtering lists
blocks-html: page
blocks-css: base
blocks-js: data, filter, buttons, search, render
goals: Use filter() to keep the items that pass a test, without changing the original array; Write a small test function (a predicate) and combine two tests with &&; Build category buttons from the data with a Set, so new categories appear by themselves; Search text without caring about capital letters; Show a clear message when nothing matches
prereqs: The Arrays of objects and random picks lesson (an array of quote objects)
---

## Session: Showing only what matches

## Step: What filtering is
time: 10
kind: read

Filtering means "keep the items that pass a test". Arrays have a method for it:

```js
const work = quotes.filter((q) => q.category === 'work');
```

`filter` calls your function once for each item. Your function answers **true** (keep it) or **false** (leave it out). That little function is called a **predicate**.

```svg filter() runs the test on each quote and builds a new array with the ones that pass; the original array is unchanged
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 150" font-family="sans-serif" font-size="12">
  <text x="5" y="14">quotes</text>
  <g><rect x="5" y="22" width="90" height="24" rx="6" fill="#e0e7ff" stroke="#6366f1"/><text x="12" y="38">work</text>
  <rect x="5" y="52" width="90" height="24" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="12" y="68">life</text>
  <rect x="5" y="82" width="90" height="24" rx="6" fill="#e0e7ff" stroke="#6366f1"/><text x="12" y="98">work</text>
  <rect x="5" y="112" width="90" height="24" rx="6" fill="#fef9c3" stroke="#ca8a04"/><text x="12" y="128">learning</text></g>
  <rect x="120" y="55" width="95" height="44" rx="10" fill="#6366f1"/><text x="167" y="74" text-anchor="middle" fill="#fff">category</text><text x="167" y="90" text-anchor="middle" fill="#fff">=== 'work'?</text>
  <text x="235" y="14">new array</text>
  <rect x="235" y="52" width="90" height="24" rx="6" fill="#e0e7ff" stroke="#6366f1"/><text x="242" y="68">work</text>
  <rect x="235" y="82" width="90" height="24" rx="6" fill="#e0e7ff" stroke="#6366f1"/><text x="242" y="98">work</text>
  <path d="M95 77 H116 M215 77 H231" stroke="#111" stroke-width="2"/>
</svg>
```

Two things make `filter` safe to use everywhere:

- It returns a **new array**. The original `quotes` is never changed, so you can filter again with a different test and nothing is lost.
- If nothing passes, you get an **empty array** (`[]`), not an error. Your page should notice that and say so.

The Quote & Joke Generator filters by category and by search. This lesson builds both.

## Step: A filter function with two tests
time: 15

The page will have two filters: a category (or `'all'`) and a search text. Keep the current choices in one `state` object and write one function that applies both:

```js
function visible() {
  return quotes.filter((q) => matchesCategory(q) && matchesSearch(q));
}
```

`&&` means **both** tests must pass. Each test is its own small function, so each is easy to read and to fix. For now the search test always says yes; the search box comes in step 4.

The list on the page is drawn by `render()`, which you'll see in each step: it takes whatever `visible()` returns and shows it.

check: js | the current choices in one object | /const\s+state\s*=\s*\{[^}]*category/ | const state = { category: 'all', search: '' };
check: js | a category test that allows 'all' | /state\.category\s*===\s*['"]all['"]\s*\|\|/ | state.category === 'all' || q.category === state.category
check: js | filter() with both tests | /\.filter\([^)]*\)\s*=>\s*matchesCategory\(\s*q\s*\)\s*&&\s*matchesSearch\(\s*q\s*\)|filter\(\(q\)\s*=>\s*matchesCategory\(q\)\s*&&\s*matchesSearch\(q\)\)/ | quotes.filter((q) => matchesCategory(q) && matchesSearch(q))

quiz: What does `quotes.filter((q) => q.category === 'sports')` give if no quote is in sports?
- [ ] An error
- [ ] undefined
- [x] An empty array, []
why: filter always returns an array; when nothing passes, the array is empty.

quiz: Does filtering change the `quotes` array?
- [ ] Yes, it removes the items that fail
- [x] No, it builds a new array and leaves quotes as it was
- [ ] Only if you filter twice
why: filter never changes the original, which is why you can switch categories back and forth.

```html page
<main class="card">
  <h1>Quotes</h1>
  <div id="cats" class="cats" role="group" aria-label="Category"></div>
  <input id="search" type="search" placeholder="Search quotes or authors" aria-label="Search quotes">
  <p id="summary" class="summary"></p>
  <ul id="list" class="list"></ul>
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
  background: #f5f3ff;
  color: #1e1b4b;
}

.card {
  width: min(460px, 100% - 32px);
  padding: 20px;
  background: #fff;
  border-radius: 16px;
}

h1 { margin-top: 0; }

.cats { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }

.cats button {
  padding: 5px 12px;
  border: 1px solid #c4b5fd;
  border-radius: 999px;
  background: #fff;
  color: #5b21b6;
  cursor: pointer;
}

.cats button[aria-pressed="true"] { background: #6d28d9; color: #fff; }

input[type="search"] {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  font: inherit;
  border: 1px solid #c4b5fd;
  border-radius: 8px;
}

.summary { color: #64748b; font-size: .9rem; }
.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.list li { padding: 10px 12px; border-radius: 10px; background: #f5f3ff; }
.list .who { display: block; color: #6d28d9; font-size: .85rem; margin-top: 4px; }
.empty { color: #b91c1c; }
```

```js data
const quotes = [
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin', category: 'work' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci', category: 'life' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain', category: 'work' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius', category: 'life' },
  { text: 'Knowing is not enough; we must apply.', author: 'Johann Wolfgang von Goethe', category: 'learning' },
  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci', category: 'learning' },
  { text: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin', category: 'work' },
];
```

```js filter
const state = { category: 'all', search: '' };

function matchesCategory(q) {
  return state.category === 'all' || q.category === state.category;
}

function matchesSearch(q) {
  return true;   // the search box comes in step 4
}

function visible() {
  return quotes.filter((q) => matchesCategory(q) && matchesSearch(q));
}
```

```js render
const list = document.getElementById('list');
const summary = document.getElementById('summary');

function render() {
  const shown = visible();
  list.replaceChildren();
  for (const q of shown) {
    const li = document.createElement('li');
    li.textContent = q.text;
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = `— ${q.author}`;
    li.append(who);
    list.append(li);
  }
  summary.textContent = `Showing ${shown.length} of ${quotes.length}`;
}

render();
```

## Step: Category buttons built from the data
time: 15

You could type the buttons into the HTML: All, Work, Life, Learning. But then adding a quote in a new category means remembering to add a button too. Instead, build the buttons **from the data**.

A **Set** keeps each value once, however many times it's added. That makes the list of categories in one line:

```js
const categories = ['all', ...new Set(quotes.map((q) => q.category))];
// ['all', 'work', 'life', 'learning']
```

```svg map() takes each quote's category, new Set() drops the repeats, and the spread puts them back into an array after 'all'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" font-family="sans-serif" font-size="12">
  <text x="5" y="20">map:</text><text x="60" y="20">work, life, work, life, learning, learning, work</text>
  <text x="5" y="55">Set:</text><text x="60" y="55">work, life, learning</text>
  <text x="5" y="90">array:</text><text x="60" y="90">all, work, life, learning</text>
  <path d="M40 26 V42 M40 62 V78" stroke="#6366f1" stroke-width="2"/>
</svg>
```

- `quotes.map((q) => q.category)` makes an array of just the categories.
- `new Set(...)` drops the repeats; `...` spreads the set back into an array after `'all'`.
- Each button has `aria-pressed` set to `"true"` or `"false"`, which tells screen readers which one is on, and the CSS styles the pressed one.

Clicking a button sets `state.category` and calls `render()`. The filter function from step 2 does the rest.

check: js | categories from the data with a Set | /new\s+Set\(\s*quotes\.map\(/ | ['all', ...new Set(quotes.map((q) => q.category))]
check: js | the pressed button marked for screen readers | /aria-pressed/ | b.setAttribute('aria-pressed', String(c === state.category))
check: js | a click changes the state and redraws | /state\.category\s*=\s*\w+;[\s\S]*render\(\)/ | state.category = c; render();

quiz: What does `new Set(['work', 'life', 'work'])` contain?
- [ ] work, life, work
- [x] work, life
- [ ] 3 items
why: A Set keeps each value once, so the second 'work' is dropped.

quiz: You add a quote with category 'humor'. What else must change for a Humor button to appear?
- [x] Nothing; the buttons are built from the categories in the data
- [ ] A new button in the HTML
- [ ] A new case in matchesCategory
why: The list of categories comes from the quotes, so new data brings its own button.

```js buttons
const cats = document.getElementById('cats');
const categories = ['all', ...new Set(quotes.map((q) => q.category))];

function drawButtons() {
  cats.replaceChildren();
  for (const c of categories) {
    const b = document.createElement('button');
    b.textContent = c[0].toUpperCase() + c.slice(1);
    b.setAttribute('aria-pressed', String(c === state.category));
    b.addEventListener('click', () => {
      state.category = c;
      drawButtons();
      render();
    });
    cats.append(b);
  }
}

drawButtons();
```

## Step: Search, and saying when nothing matches
time: 15

Now replace the "always yes" search test with a real one. Searching should ignore capital letters: "TWAIN", "twain" and "Twain" should all find Mark Twain. So both the search text and the quote are lowercased before comparing, and `includes()` checks whether one string appears inside the other:

```js
function matchesSearch(q) {
  const s = state.search.trim().toLowerCase();
  if (!s) return true;                                         // an empty search matches everything
  return `${q.text} ${q.author}`.toLowerCase().includes(s);
}
```

```svg Both sides are lowercased, then includes() asks whether the search appears anywhere inside the quote and author
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" font-family="sans-serif" font-size="12">
  <rect x="5" y="10" width="140" height="30" rx="6" fill="#e0e7ff" stroke="#6366f1"/><text x="75" y="30" text-anchor="middle">"TWAIN"</text>
  <rect x="185" y="10" width="140" height="30" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="255" y="30" text-anchor="middle">"…started. Mark Twain"</text>
  <text x="75" y="62" text-anchor="middle">"twain"</text><text x="255" y="62" text-anchor="middle">"…started. mark twain"</text>
  <path d="M75 40 V50 M255 40 V50" stroke="#111" stroke-width="2"/>
  <rect x="95" y="76" width="140" height="28" rx="8" fill="#6366f1"/><text x="165" y="95" text-anchor="middle" fill="#fff">includes → true</text>
</svg>
```

The `input` event fires on every keystroke, so the list updates as you type.

The category and search work **together**, because `visible()` needs both tests to pass: pick *Work*, type *franklin*, and you get only Franklin's work quotes.

When nothing matches, an empty list looks like the page is broken. `render()` now shows a message instead, with a hint about what to try.

check: js | case-insensitive search | /toLowerCase\(\)\.includes\(/ | `${q.text} ${q.author}`.toLowerCase().includes(s)
check: js | updating as you type | /addEventListener\(\s*['"]input['"]/ | search.addEventListener('input', ...)
check: js | a message when nothing matches | /shown\.length\s*===\s*0|!shown\.length/ | if (shown.length === 0) { ... }

quiz: Why are both the search text and the quote lowercased?
- [ ] Lowercase letters are faster to compare
- [x] So "TWAIN" and "twain" both find "Mark Twain"
- [ ] includes() only works on lowercase
why: Comparing two lowercased strings ignores capital letters on both sides.

quiz: Category is *Life* and the search is *franklin*. What shows?
- [ ] All of Franklin's quotes
- [ ] All life quotes
- [x] Only quotes that are in life AND mention Franklin, which here is none, so the empty message
why: `visible()` keeps a quote only when both tests pass; none of Franklin's quotes in this list is in life.

```js search
const search = document.getElementById('search');
search.addEventListener('input', () => {
  state.search = search.value;
  render();
});
```

```js filter
const state = { category: 'all', search: '' };

function matchesCategory(q) {
  return state.category === 'all' || q.category === state.category;
}

function matchesSearch(q) {
  const s = state.search.trim().toLowerCase();
  if (!s) return true;
  return `${q.text} ${q.author}`.toLowerCase().includes(s);
}

function visible() {
  return quotes.filter((q) => matchesCategory(q) && matchesSearch(q));
}
```

```js render
const list = document.getElementById('list');
const summary = document.getElementById('summary');

function render() {
  const shown = visible();
  list.replaceChildren();
  if (shown.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No quotes match. Try another word, or pick All.';
    list.append(li);
  }
  for (const q of shown) {
    const li = document.createElement('li');
    li.textContent = q.text;
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = `— ${q.author}`;
    li.append(who);
    list.append(li);
  }
  summary.textContent = `Showing ${shown.length} of ${quotes.length}`;
}

render();
```

## Finish

You can show just the items people want. You learned:

- `filter()` with a **predicate**, returning a new array and never changing the original
- Combining tests with `&&`, each test its own small function
- Building buttons **from the data** with `map` and a **Set**
- `aria-pressed` for toggle buttons
- **Case-insensitive search** with `toLowerCase()` and `includes()`, live with the `input` event
- An **empty state** message when nothing matches

### Challenges

1. Show how many quotes each category has on its button, like "Work (3)".
2. Highlight the matching part of each quote with a `<mark>` element (build it with `createElement`, not `innerHTML`).
3. Remember the chosen category in localStorage, so it's still picked after a reload.

### Next

The **Quote & Joke Generator** project combines this with random picks, and the lessons still to come add fetching quotes, saving favorites, accounts and sharing.
