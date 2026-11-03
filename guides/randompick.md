---
id: randompick
title: Arrays of objects and random picks
blocks-html: page
blocks-css: base
blocks-js: data, pick, show
goals: Store content as an array of objects with the same fields; Read fields with dot notation and loop over the array; Pick a random item with Math.random and Math.floor, and know why the index never goes past the end; Avoid showing the same item twice in a row; Keep content (data) separate from the code that shows it
prereqs: The JavaScript basics lesson (variables, arrays, functions and click events)
---

## Session: Content as data

## Step: Why content lives in an array of objects
time: 10
kind: read

A quote has a few pieces: the words, who said them, and a category. In JavaScript, a thing with named pieces is an **object**:

```js
const quote = { text: 'Well done is better than well said.', author: 'Benjamin Franklin', category: 'work' };
quote.author;   // "Benjamin Franklin"
```

Many quotes are an **array of objects**, one object per quote, all with the same fields. That shape is everywhere in programming: a list of products in a shop, posts on a blog, rows from a database, results from a web API.

```svg An array of objects: each item is one quote with the same three fields, and its place in the array is its index
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 150" font-family="sans-serif" font-size="12">
  <text x="5" y="16">quotes =</text>
  <g><rect x="5" y="24" width="320" height="34" rx="6" fill="#e0e7ff" stroke="#6366f1"/><text x="14" y="45">[0]  { text: "Well done is…", author: "Franklin", category: "work" }</text></g>
  <g><rect x="5" y="64" width="320" height="34" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="14" y="85">[1]  { text: "Simplicity is…", author: "da Vinci", category: "life" }</text></g>
  <g><rect x="5" y="104" width="320" height="34" rx="6" fill="#fef9c3" stroke="#ca8a04"/><text x="14" y="125">[2]  { text: "The secret of…", author: "Twain", category: "work" }</text></g>
</svg>
```

### Why data and code stay apart

The quotes are **data**: plain values, no logic. The code that picks and shows a quote doesn't care how many there are or what they say. So adding a quote is adding one line to the array, with no change to the code, and later the same code can show quotes that come from a server instead of the file. That's the whole Quote & Joke Generator in one idea.

## Step: The data: an array of quote objects
time: 12

Write the array. Every object has the same three fields; a missing or misspelled field (say `auther`) shows up as `undefined` on the page, which is the most common bug with this kind of data.

The quotes below are old enough to be in the public domain, so they're free to use.

`quotes.length` is how many there are, and `quotes[0]` is the first one. A `for...of` loop visits each, which the page uses to show the count.

check: js | an array of quote objects | /const\s+quotes\s*=\s*\[\s*\{/ | const quotes = [{ text: '...', author: '...', category: '...' }, ...];
check: js | every quote has an author | /author\s*:/ | author: 'Mark Twain'
check: js | counting the quotes | /quotes\.length/ | quotes.length

quiz: What does `quotes[1].author` give for the array in the diagram?
- [ ] "Franklin"
- [x] "da Vinci"
- [ ] undefined
why: Arrays count from 0, so `[1]` is the second quote, and `.author` reads its author field.

quiz: Why does every object have exactly the same fields?
- [x] So the same code can show any of them; a different or misspelled field would show up as undefined
- [ ] JavaScript requires objects in an array to match
- [ ] It makes the array shorter
why: The code reads `q.text` and `q.author` from whichever quote it picks, so they all need those fields.

```html page
<main class="card">
  <p class="count" id="count"></p>
  <blockquote id="text">Press the button for a quote.</blockquote>
  <p class="author" id="author"></p>
  <button id="next">New quote</button>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Georgia, serif;
  background: #f5f3ff;
  color: #1e1b4b;
}

.card {
  width: min(420px, 100% - 32px);
  padding: 28px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgb(0 0 0 / .08);
  text-align: center;
}

blockquote { margin: 0 0 12px; font-size: 1.35rem; line-height: 1.4; }
.author { margin: 0 0 18px; color: #6d28d9; font-style: italic; }
.count { margin: 0 0 12px; color: #64748b; font: .85rem system-ui, sans-serif; }

button {
  padding: 10px 18px;
  font: 600 1rem system-ui, sans-serif;
  color: #fff;
  background: #6d28d9;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
}
```

```js data
const quotes = [
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin', category: 'work' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci', category: 'life' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain', category: 'work' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius', category: 'life' },
  { text: 'Knowing is not enough; we must apply.', author: 'Johann Wolfgang von Goethe', category: 'learning' },
  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci', category: 'learning' },
];

let authors = 0;
const seen = new Set();
for (const q of quotes) {
  if (!seen.has(q.author)) { seen.add(q.author); authors += 1; }
}
document.getElementById('count').textContent = `${quotes.length} quotes by ${authors} people`;
```

## Step: A random pick, and never the same one twice
time: 15

`Math.random()` gives a number from 0 up to (but never exactly) 1. Multiply it by the number of quotes and round down, and you get a valid index:

```js
const i = Math.floor(Math.random() * quotes.length);   // 0, 1, ... up to length - 1
```

```svg With 6 quotes, Math.random() × 6 lands somewhere from 0 up to (not including) 6, and Math.floor turns it into an index from 0 to 5
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="12">
  <path d="M15 40 H315" stroke="#111" stroke-width="2"/>
  <g fill="#6366f1"><rect x="15" y="28" width="48" height="24" opacity=".25"/><rect x="65" y="28" width="48" height="24" opacity=".4"/><rect x="115" y="28" width="48" height="24" opacity=".25"/><rect x="165" y="28" width="48" height="24" opacity=".4"/><rect x="215" y="28" width="48" height="24" opacity=".25"/><rect x="265" y="28" width="48" height="24" opacity=".4"/></g>
  <g text-anchor="middle"><text x="39" y="70">0</text><text x="89" y="70">1</text><text x="139" y="70">2</text><text x="189" y="70">3</text><text x="239" y="70">4</text><text x="289" y="70">5</text></g>
  <text x="15" y="20">0</text><text x="300" y="20">6 (never reached)</text>
  <text x="165" y="92" text-anchor="middle">2.7 → floor → index 2</text>
</svg>
```

Because `Math.random()` never reaches 1, the index never reaches `quotes.length`, so it can't run off the end of the array.

Pure chance repeats itself: with six quotes you'll see the same one twice in a row about one time in six, and it feels broken. The fix is to remember the last index and pick again if it comes up. (With only one quote, there's nothing else to pick, so the loop must not run forever; the `quotes.length > 1` check handles that.)

check: js | a random index | /Math\.floor\(\s*Math\.random\(\)\s*\*\s*\w+\.length\s*\)/ | Math.floor(Math.random() * quotes.length)
check: js | a pick() function | /function\s+pick\s*\(/ | function pick() { ... }
check: js | no repeats in a row | /while\s*\([^)]*===\s*last/ | while (quotes.length > 1 && i === last) { ... }

quiz: Can `Math.floor(Math.random() * 6)` ever be 6?
- [ ] Yes, about one time in seven
- [x] No, because Math.random() is always less than 1
- [ ] Only on slow computers
why: Math.random() × 6 is always under 6, and rounding down gives 0 to 5.

quiz: Why does the no-repeat loop also check `quotes.length > 1`?
- [ ] To make it faster
- [x] With only one quote, every pick repeats, and the loop would never end
- [ ] Math.random needs at least two items
why: A while loop that can't ever finish freezes the page; the length check gives it a way out.

```js pick
let last = -1;

function pick() {
  let i = Math.floor(Math.random() * quotes.length);
  while (quotes.length > 1 && i === last) {
    i = Math.floor(Math.random() * quotes.length);
  }
  last = i;
  return quotes[i];
}
```

## Step: Showing the pick on the card
time: 10

`show(q)` takes one quote object and puts its fields on the page. Clicking the button picks and shows:

```js
document.getElementById('next').addEventListener('click', () => show(pick()));
```

`show()` uses `textContent`, not `innerHTML`. `textContent` puts the words on the page as plain text, so even if a quote contained `<script>` it would just be shown, never run. That habit matters as soon as content comes from somewhere you don't control, like a web API or a user, which is where the Quote project goes next.

```svg Click → pick() returns one quote object → show() writes its text and author onto the card
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 80" font-family="sans-serif" font-size="12">
  <rect x="5" y="20" width="70" height="36" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="40" y="42" text-anchor="middle">click</text>
  <rect x="100" y="20" width="70" height="36" rx="8" fill="#6366f1"/><text x="135" y="42" text-anchor="middle" fill="#fff">pick()</text>
  <rect x="195" y="20" width="70" height="36" rx="8" fill="#16a34a"/><text x="230" y="42" text-anchor="middle" fill="#fff">show(q)</text>
  <rect x="285" y="20" width="40" height="36" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="305" y="42" text-anchor="middle">card</text>
  <path d="M75 38 H96 M170 38 H191 M265 38 H281" stroke="#111" stroke-width="2"/>
  <text x="182" y="74" text-anchor="middle">{ text, author, category }</text>
</svg>
```

check: js | a show() function | /function\s+show\s*\(\s*q\s*\)/ | function show(q) { ... }
check: js | writing text safely | /textContent\s*=\s*q\.text/ | text.textContent = q.text;
check: js | the button picks and shows | /show\(\s*pick\(\)\s*\)/ | show(pick())

quiz: Why does `show()` use `textContent` instead of `innerHTML`?
- [ ] textContent is shorter to type
- [x] textContent shows the words as plain text, so HTML or scripts inside them can never run
- [ ] innerHTML doesn't work on blockquotes
why: innerHTML would turn text into HTML. textContent keeps it as text, which is safe for content you didn't write.

quiz: To add a seventh quote, what changes?
- [x] One new object in the quotes array; pick() and show() stay the same
- [ ] pick() needs a new if statement
- [ ] The button needs a new id
why: The code works from `quotes.length` and the fields, so data changes don't need code changes.

```js show
const textEl = document.getElementById('text');
const authorEl = document.getElementById('author');

function show(q) {
  textEl.textContent = q.text;
  authorEl.textContent = `— ${q.author}`;
}

document.getElementById('next').addEventListener('click', () => show(pick()));
show(pick());
```

## Finish

You can hold content as data and pick from it. You learned:

- **Objects** with named fields, and an **array of objects** with the same fields
- `quotes.length`, `quotes[i]` and `for...of`
- `Math.floor(Math.random() * length)` for a random index that can't go past the end
- Remembering the **last pick** to avoid repeats, and a loop that always ends
- **Data apart from code**, and `textContent` for content you didn't write

### Challenges

1. Add a **Previous** button that goes back through the quotes you've already seen (keep their indexes in an array).
2. Shuffle the whole array once with the Fisher–Yates shuffle, then show the quotes in that order, so every quote appears once before any repeats.
3. Add a `year` field to some quotes, and show it only when it's there.

### Next

**Filtering lists**: show only the quotes in one category, or the ones that match a search.
