---
id: fetchjson
title: Fetching quotes and jokes
blocks-html: page
blocks-css: base
blocks-js: api, load, show
goals: Explain what a request, a response and JSON are; Load data with fetch, async and await; Check res.ok and catch network errors so the page never breaks; Show loading, error and ready states to the person using the page; Turn someone else's data shape into your app's own shape with map()
prereqs: The Arrays of objects and random picks lesson (an array of objects, a random pick, textContent)
---

## Session: Data from somewhere else

## Step: Requests, responses and JSON
time: 10
kind: read

So far your quotes were typed into the code. Real apps get their data from somewhere else: a server sends it when the page asks. The page makes a **request** to a web address, and the server sends back a **response**.

```svg The page sends a request to an address; the server sends back a response whose body is JSON text, which becomes JavaScript objects
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 150" font-family="sans-serif" font-size="12">
  <rect x="5" y="45" width="80" height="50" rx="10" fill="#e0e7ff" stroke="#6366f1"/><text x="45" y="74" text-anchor="middle">your page</text>
  <rect x="245" y="45" width="80" height="50" rx="10" fill="#dcfce7" stroke="#16a34a"/><text x="285" y="74" text-anchor="middle">server</text>
  <path d="M85 58 H241" stroke="#111" stroke-width="2"/><text x="165" y="50" text-anchor="middle">request: GET /jokes</text>
  <path d="M241 84 H85" stroke="#111" stroke-width="2"/><text x="165" y="102" text-anchor="middle">response: 200 OK + JSON</text>
  <text x="165" y="135" text-anchor="middle" fill="#334155">[{"setup": "…", "punchline": "…"}, …]</text>
</svg>
```

**JSON** is the text format most servers send. It looks almost exactly like JavaScript arrays and objects, which is why it's easy to work with: `res.json()` turns the text into real objects.

### Waiting without freezing

A request takes time: tens of milliseconds on a good connection, seconds on a bad one, forever if the server is down. The page can't just stop and wait, or nothing could be clicked. So `fetch()` returns a **promise**, a "you'll get the answer later". Inside an `async` function, `await` pauses that function (and only that function) until the answer arrives.

```js
async function load() {
  const res = await fetch('https://example.com/jokes');   // wait for the response
  const jokes = await res.json();                          // wait for the body, as objects
}
```

> In this lesson the "server" is a small built-in sample (a `data:` address), so it works anywhere, even offline. In the Quote & Joke Generator the same code points at a real address. Only the address changes.

## Step: Loading jokes with fetch and await
time: 15

`loadJokes()` asks for the jokes and puts how many arrived on the page. Two `await`s: one for the response, one for its body.

```js
async function loadJokes() {
  const res = await fetch(API);
  const jokes = await res.json();
  ...
}
```

The sample data uses the field names a typical joke API sends: `setup` and `punchline`. That's someone else's shape, not yours, which matters in step 4.

check: js | an async function | /async\s+function\s+loadJokes/ | async function loadJokes() { ... }
check: js | waiting for fetch | /await\s+fetch\(/ | const res = await fetch(API);
check: js | reading the body as JSON | /await\s+res\.json\(\)/ | const jokes = await res.json();

quiz: What does `await fetch(API)` give you?
- [ ] The jokes as an array
- [x] A response object; you still need `await res.json()` to get the data
- [ ] A string of HTML
why: fetch gives the response first (status, headers); the body is read separately with res.json().

quiz: While `loadJokes()` is waiting, can the person still click buttons on the page?
- [x] Yes; await only pauses that function, not the page
- [ ] No, the whole page freezes until the data arrives
- [ ] Only if the request is fast
why: That's the point of promises and await: the rest of the page keeps working while one function waits.

```html page
<main class="card">
  <p id="status" class="status" role="status">Not loaded yet</p>
  <p id="setup" class="setup"></p>
  <p id="punchline" class="punchline" hidden></p>
  <p class="buttons">
    <button id="reveal" disabled>Show the punchline</button>
    <button id="next" disabled>Another joke</button>
    <button id="reload">Load jokes</button>
  </p>
  <label class="small"><input id="broken" type="checkbox"> Pretend the server is down</label>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #fff7ed;
  color: #431407;
}

.card {
  width: min(420px, 100% - 32px);
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  text-align: center;
}

.status { color: #9a3412; font-size: .9rem; }
.status.error { color: #b91c1c; font-weight: 600; }
.setup { font-size: 1.3rem; min-height: 1.5em; }
.punchline { font-size: 1.2rem; font-weight: 700; color: #c2410c; }
.buttons { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
button { padding: 8px 14px; font: inherit; }
.small { font-size: .85rem; color: #78716c; }
```

```js api
// A built-in sample "server": the same shape a joke API sends back.
const SAMPLE = [
  { id: 1, setup: 'Why did the scarecrow win an award?', punchline: 'He was outstanding in his field.' },
  { id: 2, setup: 'Why don\'t eggs tell jokes?', punchline: 'They\'d crack each other up.' },
  { id: 3, setup: 'What do you call a fake noodle?', punchline: 'An impasta.' },
  { id: 4, setup: 'Why did the math book look sad?', punchline: 'It had too many problems.' },
];
const API = `data:application/json,${encodeURIComponent(JSON.stringify(SAMPLE))}`;
const statusEl = document.getElementById('status');
```

```js load
async function loadJokes() {
  statusEl.textContent = 'Loading…';
  const res = await fetch(API);
  const jokes = await res.json();
  statusEl.textContent = `Loaded ${jokes.length} jokes`;
}

document.getElementById('reload').addEventListener('click', loadJokes);
loadJokes();
```

## Step: When the server says no, or doesn't answer
time: 15

Two different things can go wrong, and they need two different checks:

- **The server answers, but with an error** (404 Not Found, 500 Server Error). `fetch` does *not* throw for these. You have to check `res.ok`, which is `true` only for success codes (200–299).
- **There's no answer at all** (no internet, wrong address, server down). Then `fetch` itself throws, and `try { } catch { }` catches it.

```svg Three ways a request ends: ok, an error status (check res.ok), or no response at all (fetch throws, so catch it)
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 140" font-family="sans-serif" font-size="12">
  <rect x="5" y="52" width="70" height="36" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="40" y="74" text-anchor="middle">fetch</text>
  <rect x="120" y="6" width="205" height="34" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="222" y="28" text-anchor="middle">200 OK → show the jokes</text>
  <rect x="120" y="53" width="205" height="34" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="222" y="75" text-anchor="middle">404 / 500 → !res.ok → error message</text>
  <rect x="120" y="100" width="205" height="34" rx="8" fill="#fee2e2" stroke="#ef4444"/><text x="222" y="122" text-anchor="middle">no answer → catch → error message</text>
  <path d="M75 62 L116 23 M75 70 H116 M75 78 L116 117" stroke="#111" stroke-width="2"/>
</svg>
```

Either way, the person sees a clear message and a way to try again, never a blank card. Tick **Pretend the server is down** and press **Load jokes** to see it: the code asks for an address that doesn't exist, the same as a real outage.

The buttons also stay **disabled** until jokes have loaded, so nobody can click "Another joke" when there are none.

check: js | checking the status | /if\s*\(\s*!res\.ok\s*\)/ | if (!res.ok) throw new Error(...)
check: js | catching network errors | /catch\s*\(\s*\w+\s*\)\s*\{[\s\S]*error/ | } catch (err) { ... show an error ... }

quiz: The server answers with 404 Not Found. What does `fetch` do?
- [ ] Throws an error, so catch runs
- [x] Resolves normally with `res.ok` set to false, so you must check it yourself
- [ ] Returns an empty array
why: fetch only throws when there's no response at all; an error status is still a response.

quiz: Why are the joke buttons disabled until the data loads?
- [ ] Disabled buttons look nicer
- [x] So nobody can ask for a joke when there are none yet, which would show "undefined"
- [ ] fetch requires it
why: The page's controls should match what the data allows at that moment.

```js load
let jokes = [];

async function loadJokes() {
  statusEl.className = 'status';
  statusEl.textContent = 'Loading…';
  const broken = document.getElementById('broken').checked;
  try {
    const res = await fetch(broken ? 'https://jokes.invalid/api' : API);
    if (!res.ok) throw new Error(`The server answered ${res.status}`);
    jokes = await res.json();
    statusEl.textContent = `Loaded ${jokes.length} jokes`;
    document.getElementById('next').disabled = false;
  } catch (err) {
    jokes = [];
    statusEl.className = 'status error';
    statusEl.textContent = 'Couldn\'t load jokes. Check your connection and press Load jokes to try again.';
    document.getElementById('next').disabled = true;
    document.getElementById('reveal').disabled = true;
  }
}

document.getElementById('reload').addEventListener('click', loadJokes);
loadJokes();
```

## Step: Their shape, your shape
time: 15

The joke API sends `{ setup, punchline }`. Your quote card from the Random picks lesson shows `{ text, author }`. If the display code read `setup` directly, switching to a different API (one that sends `question` and `answer`, say) would mean changing the display code everywhere.

Instead, convert at the door. One `map()` right after loading turns their shape into yours, and the rest of the app only ever sees your shape:

```js
jokes = data.map((j) => ({ id: j.id, text: j.setup, answer: j.punchline }));
```

```svg map() converts each item at the door: the API's setup and punchline become the app's own text and answer
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" font-family="sans-serif" font-size="12">
  <rect x="5" y="25" width="120" height="60" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="65" y="45" text-anchor="middle">their shape</text><text x="65" y="63" text-anchor="middle">setup</text><text x="65" y="78" text-anchor="middle">punchline</text>
  <rect x="140" y="38" width="50" height="34" rx="8" fill="#6366f1"/><text x="165" y="60" text-anchor="middle" fill="#fff">map</text>
  <rect x="205" y="25" width="120" height="60" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="265" y="45" text-anchor="middle">your shape</text><text x="265" y="63" text-anchor="middle">text</text><text x="265" y="78" text-anchor="middle">answer</text>
  <path d="M125 55 H138 M190 55 H203" stroke="#111" stroke-width="2"/>
</svg>
```

Then a joke is shown in two parts: the setup first, and the punchline only when you press the button (it starts `hidden`). Showing it with `textContent` keeps it safe, because this text came from a server you don't control.

check: js | converting to your own shape with map | /\.map\(\s*\(?\s*j\s*\)?\s*=>\s*\(\{[^}]*text\s*:\s*j\.setup/ | data.map((j) => ({ id: j.id, text: j.setup, answer: j.punchline }))
check: js | the punchline waits for a click | /punchlineEl\.hidden\s*=\s*false/ | punchlineEl.hidden = false;

quiz: The app switches to an API that sends `{ question, answer }`. What has to change?
- [x] Only the map() line that converts it at the door
- [ ] Every function that shows a joke
- [ ] The HTML
why: Because everything after loading uses your own shape, only the conversion knows about the API's field names.

quiz: Why is the joke shown with textContent?
- [ ] It's faster than innerHTML
- [x] The text came from a server you don't control; textContent can never run it as HTML
- [ ] innerHTML can't show question marks
why: Treat anything from outside as text, not as code.

```js load
let jokes = [];

async function loadJokes() {
  statusEl.className = 'status';
  statusEl.textContent = 'Loading…';
  const broken = document.getElementById('broken').checked;
  try {
    const res = await fetch(broken ? 'https://jokes.invalid/api' : API);
    if (!res.ok) throw new Error(`The server answered ${res.status}`);
    const data = await res.json();
    jokes = data.map((j) => ({ id: j.id, text: j.setup, answer: j.punchline }));
    statusEl.textContent = `Loaded ${jokes.length} jokes`;
    document.getElementById('next').disabled = false;
    showRandom();
  } catch (err) {
    jokes = [];
    statusEl.className = 'status error';
    statusEl.textContent = 'Couldn\'t load jokes. Check your connection and press Load jokes to try again.';
    document.getElementById('next').disabled = true;
    document.getElementById('reveal').disabled = true;
  }
}
```

```js show
const setupEl = document.getElementById('setup');
const punchlineEl = document.getElementById('punchline');
let current = null;

function showRandom() {
  if (!jokes.length) return;
  current = jokes[Math.floor(Math.random() * jokes.length)];
  setupEl.textContent = current.text;
  punchlineEl.textContent = current.answer;
  punchlineEl.hidden = true;
  document.getElementById('reveal').disabled = false;
}

document.getElementById('reveal').addEventListener('click', () => {
  punchlineEl.hidden = false;
});
document.getElementById('next').addEventListener('click', showRandom);
document.getElementById('reload').addEventListener('click', loadJokes);
loadJokes();
```

## Finish

Your page can load data from a server now. You learned:

- **Requests, responses and JSON**, and why `fetch` returns a promise
- `async` functions and `await` that don't freeze the page
- `res.ok` for error statuses and `try/catch` for no answer at all
- **Loading, error and ready** states, with buttons that match
- Converting **their shape to yours** with `map()` at the door

### Challenges

1. Point `API` at a real joke API (search for "official joke API") and see it work with no other changes.
2. Add a 5-second timeout with `AbortController`, and show "The server is slow" when it fires.
3. Cache the jokes in localStorage, so a second visit shows them instantly and refreshes in the background.

### Next

**Saving favorites**: let people keep the ones they like.
