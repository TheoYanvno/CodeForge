---
id: debugging
title: Reading errors and DevTools
blocks-html: page
blocks-css: base
blocks-js: elements, show, events
goals: Open the browser's developer tools and know what the Console, Elements, Sources and Network panels are for; Read an error message: its type, its message and the file and line it points to; See what your code is doing with console.log and console.table; Pause code with a breakpoint, step through it and watch values change; Find and fix the most common beginner bugs, like text that looks like a number; Follow a debugging checklist instead of guessing
prereqs: The JavaScript basics lesson (variables, functions, events, arrays and loops); A browser with developer tools (Chrome, Edge or Firefox)
---

## Session: Errors are messages, not failures

## Step: Your browser's developer tools
time: 10
kind: read

Every programmer writes bugs, every day. What separates a beginner from a developer isn't fewer bugs: it's knowing how to **find** them. Your best tool is already in your browser: the **developer tools**, or **DevTools**.

Open them on any page:

| Computer | Shortcut |
|---|---|
| Windows or Linux | **F12**, or **Ctrl + Shift + I** |
| Mac | **Cmd + Option + I** |
| Any | Right-click something on the page → **Inspect** |

DevTools has several panels along the top. You'll use four of them all the time:

| Panel | What it's for |
|---|---|
| **Console** | Error messages in red, anything your code logs, and a place to type JavaScript and see the answer |
| **Elements** | The page's HTML as it is right now, and the CSS rules on whatever you click. Change a color here to try it before you change your file |
| **Sources** | Your script files, where you can pause the code on any line (a **breakpoint**) and run it one line at a time |
| **Network** | Every file and request the page makes, with its status: 200 means OK, 404 means not found |

```svg The four DevTools panels you'll use most, and the question each one answers
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 150" font-family="sans-serif" font-size="12">
  <rect x="5" y="5" width="330" height="140" rx="10" fill="#0f172a"/>
  <rect x="15" y="15" width="70" height="24" rx="5" fill="#334155"/><text x="50" y="31" text-anchor="middle" fill="#fff">Console</text>
  <rect x="93" y="15" width="70" height="24" rx="5" fill="#1e293b"/><text x="128" y="31" text-anchor="middle" fill="#cbd5e1">Elements</text>
  <rect x="171" y="15" width="70" height="24" rx="5" fill="#1e293b"/><text x="206" y="31" text-anchor="middle" fill="#cbd5e1">Sources</text>
  <rect x="249" y="15" width="76" height="24" rx="5" fill="#1e293b"/><text x="287" y="31" text-anchor="middle" fill="#cbd5e1">Network</text>
  <text x="20" y="64" fill="#f87171">✖ What went wrong, and where?</text>
  <text x="20" y="86" fill="#93c5fd">▸ What does the page really contain?</text>
  <text x="20" y="108" fill="#fde68a">⏸ What is my code doing, line by line?</text>
  <text x="20" y="130" fill="#86efac">⇅ Did my request work? (200, 404, 500)</text>
</svg>
```

> Keep DevTools open while you build. When something doesn't work, the Console usually already says why.

## Step: Reading an error message
time: 15

Here's an error a beginner sees every week. The page has a form with `id="add-form"`, but the script looked for `#addform`:

```text
Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
    at script.js:9:6
```

It looks scary, but it's a sentence with three parts:

| Part | Here | What it tells you |
|---|---|---|
| The **type** | `TypeError` | What kind of mistake: using a value the wrong way |
| The **message** | `Cannot read properties of null (reading 'addEventListener')` | Something was `null` (nothing), and the code tried to call `.addEventListener` on it |
| The **place** | `script.js:9:6` | File `script.js`, line 9, character 6. Click it in the Console to jump there |

So: on line 9, the thing before `.addEventListener` is `null`. That's `form`, and `form` came from `document.querySelector('#addform')`. `querySelector` gives `null` when nothing on the page matches, and nothing has the id `addform`. One missing dash.

```svg Read an error left to right: what kind, what happened, and where to look
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 110" font-family="sans-serif" font-size="12">
  <rect x="5" y="10" width="78" height="30" rx="6" fill="#fee2e2" stroke="#ef4444"/><text x="44" y="30" text-anchor="middle">TypeError</text>
  <rect x="90" y="10" width="168" height="30" rx="6" fill="#fef9c3" stroke="#ca8a04"/><text x="174" y="30" text-anchor="middle">Cannot read … of null</text>
  <rect x="265" y="10" width="70" height="30" rx="6" fill="#dbeafe" stroke="#3b82f6"/><text x="300" y="30" text-anchor="middle">script.js:9</text>
  <text x="44" y="62" text-anchor="middle">what kind</text><text x="174" y="62" text-anchor="middle">what happened</text><text x="300" y="62" text-anchor="middle">where</text>
  <text x="170" y="96" text-anchor="middle" fill="#334155">null = querySelector found nothing → check the id</text>
</svg>
```

The errors you'll see most:

| Error | Usually means |
|---|---|
| `TypeError: Cannot read properties of null` | `querySelector` or `getElementById` found nothing: a typo in an id or class, or the script ran before the HTML existed |
| `ReferenceError: total is not defined` | A misspelled name, or a variable used outside the `{ }` where it was made |
| `SyntaxError: Unexpected token` | A missing `)`, `}` or quote near that line; nothing in the file runs until it's fixed |
| `TypeError: x is not a function` | Calling something that isn't a function, like `items.length()` |

This step starts the snack tally that you'll debug in this lesson, with the right ids.

check: js | the form found by its real id | /querySelector\(['"]#add-form['"]\)/ | document.querySelector('#add-form')
check: js | a submit listener on the form | /form\.addEventListener\(\s*['"]submit['"]/ | form.addEventListener('submit', ...)

quiz: The Console says `Cannot read properties of null (reading 'textContent')` on line 4. What's the most likely cause?
- [ ] The browser is too old
- [x] The element on line 4 wasn't found, so it's null: check the id or class you looked for
- [ ] textContent was spelled wrong
why: "of null" means the thing before `.textContent` is null, and querySelector returns null when nothing matches.

quiz: What does `script.js:12:5` at the end of an error mean?
- [ ] The error happened 12 times
- [x] The error is in script.js on line 12, character 5
- [ ] There are 12 errors in 5 files
why: The file, line and column tell you exactly where to look. Clicking it in the Console opens that line.

```html page
<main>
  <h1>Snack tally</h1>
  <form id="add-form">
    <label>Snack <input id="name" required></label>
    <label>Price <input id="price" type="number" step="0.01" min="0" required></label>
    <button>Add</button>
  </form>
  <ul id="list"></ul>
  <p class="total">Total: $<span id="total">0.00</span></p>
</main>
```

```css base
body {
  font-family: system-ui, sans-serif;
  margin: 24px;
  color: #1f2937;
}

form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: end;
}

label {
  display: grid;
  gap: 4px;
}

input,
button {
  font: inherit;
  padding: 6px 10px;
}

.total {
  font-weight: 700;
}
```

```js elements
const form = document.querySelector('#add-form');
const nameInput = document.querySelector('#name');
const priceInput = document.querySelector('#price');
const list = document.querySelector('#list');
const totalEl = document.querySelector('#total');
const items = [];
```

```js events
form.addEventListener('submit', (e) => {
  e.preventDefault();
  items.push({ name: nameInput.value, price: priceInput.value });
  form.reset();
});
```

## Step: Seeing values with console.log and console.table
time: 15

The form works, but nothing shows up yet. This step draws the list and the total, and adds two lines that print what's going on to the Console:

```js
console.log('total is', sum);   // prints a label and a value
console.table(items);           // prints an array of objects as a table
```

`console.log` takes any number of values and prints them side by side, so always add a label: a Console full of bare numbers is hard to read. `console.table` is perfect for arrays of objects.

Now try it. Add **Chips** for **1.50** and **Soda** for **2.25** in *See it run* (or your own copy with the Console open). The list looks right, but the total says **01.502.25**. That's a bug, and the Console shows the clue:

| name | price |
|---|---|
| Chips | "1.50" |
| Soda | "2.25" |

The prices have **quotes** around them. They're text (strings), not numbers.

```svg console.table shows each object as a row, and the quotes give the bug away: the prices are strings
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" font-family="monospace" font-size="12">
  <rect x="5" y="5" width="320" height="110" rx="8" fill="#0f172a"/>
  <text x="18" y="28" fill="#94a3b8">(index)   name      price</text>
  <text x="18" y="50" fill="#e2e8f0">0         "Chips"   <tspan fill="#fca5a5">"1.50"</tspan></text>
  <text x="18" y="70" fill="#e2e8f0">1         "Soda"    <tspan fill="#fca5a5">"2.25"</tspan></text>
  <text x="18" y="98" fill="#e2e8f0">total is <tspan fill="#fca5a5">01.502.25</tspan></text>
</svg>
```

> Leave the bug in for now. The next steps track it down properly, the way you would in a real project.

check: js | the items printed as a table | /console\.table\(\s*items\s*\)/ | console.table(items)
check: js | the total printed with a label | /console\.log\(\s*['"][^'"]+['"]\s*,\s*sum\s*\)/ | console.log('total is', sum)
check: js | the list and total drawn after each snack | /show\(\)/ | show();

quiz: Why add a label like `console.log('total is', sum)` instead of `console.log(sum)`?
- [ ] Labels make the code run faster
- [x] When several things are logged, the label tells you which value is which
- [ ] console.log needs at least two arguments
why: A Console full of bare values is a puzzle. A label costs a few characters and saves guessing.

quiz: In console.table's output, the prices show as `"1.50"` with quotes. What does that tell you?
- [ ] The prices are correct numbers
- [x] The prices are strings (text), not numbers
- [ ] The prices are rounded
why: The Console shows strings in quotes and numbers without them, which is often the first clue to a bug.

```js show
function show() {
  list.innerHTML = '';
  let sum = 0;
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = `${item.name}: $${item.price}`;
    list.append(li);
    sum = sum + item.price;
  }
  console.table(items);
  console.log('total is', sum);
  totalEl.textContent = sum;
}
```

```js events
form.addEventListener('submit', (e) => {
  e.preventDefault();
  items.push({ name: nameInput.value, price: priceInput.value });
  form.reset();
  show();
});
```

## Session: Finding and fixing the bug

## Step: Pausing the code with a breakpoint
time: 15

`console.log` shows you values at one moment. A **breakpoint** stops the code on a line so you can look at *everything* at that moment, then run one line at a time and watch values change.

Two ways to set one:

1. In DevTools, open **Sources**, click `script.js`, and click a line number. A blue marker appears.
2. Write `debugger;` in your code. When DevTools is open, the code stops there.

When the code is paused:

| Button | What it does |
|---|---|
| ▶ Resume (F8) | Run until the next breakpoint |
| ⤵ Step over (F10) | Run this line and stop at the next one |
| ⬇ Step into (F11) | Go inside the function this line calls |

The **Scope** panel lists every variable and its value right now. Hover over a variable in the code to see it too. You can also type in the Console while paused, for example `typeof item.price`.

Put a `debugger;` inside the loop, open DevTools, add two snacks, and step with F10. Watch `sum`: it starts as `0`, then becomes `"01.50"`, then `"01.502.25"`. Type `typeof item.price` in the Console: it says `"string"`. That's the cause. In JavaScript, `+` adds two numbers, but if either side is a string it **joins** them: `0 + "1.50"` is `"01.50"`.

```svg Stepping through the loop: sum turns into text on the first + because price is a string
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" font-family="sans-serif" font-size="12">
  <rect x="5" y="10" width="95" height="40" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="52" y="28" text-anchor="middle">sum = 0</text><text x="52" y="43" text-anchor="middle" font-size="10">number</text>
  <rect x="117" y="10" width="95" height="40" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="164" y="28" text-anchor="middle">"01.50"</text><text x="164" y="43" text-anchor="middle" font-size="10">0 + "1.50"</text>
  <rect x="229" y="10" width="95" height="40" rx="8" fill="#fee2e2" stroke="#ef4444"/><text x="276" y="28" text-anchor="middle">"01.502.25"</text><text x="276" y="43" text-anchor="middle" font-size="10">+ "2.25"</text>
  <path d="M100 30 H115 M212 30 H227" stroke="#111" stroke-width="2"/>
  <text x="165" y="80" text-anchor="middle">typeof item.price → "string"</text>
  <text x="165" y="102" text-anchor="middle" fill="#334155">+ with a string joins text instead of adding</text>
</svg>
```

> Input values are **always strings**, even from `type="number"` inputs. This one catches everybody.

check: js | a breakpoint inside the loop | /for \(const item of items\) \{[\s\S]*debugger;[\s\S]*\}/ | debugger;

quiz: What does Step over (F10) do while the code is paused?
- [ ] Skips the rest of the function without running it
- [x] Runs the current line and pauses again on the next one
- [ ] Restarts the page
why: Stepping one line at a time lets you watch each variable change and spot the exact line where a value goes wrong.

quiz: What is `0 + "1.50"` in JavaScript?
- [ ] 1.5
- [x] "01.50"
- [ ] An error
why: When either side of `+` is a string, JavaScript joins them as text. Turn strings into numbers first with Number().

```js show
function show() {
  list.innerHTML = '';
  let sum = 0;
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = `${item.name}: $${item.price}`;
    list.append(li);
    debugger;
    sum = sum + item.price;
  }
  console.table(items);
  console.log('total is', sum);
  totalEl.textContent = sum;
}
```

## Step: Fix the cause, then clean up
time: 15

Now that you know the cause, fix it where it starts, not where it shows up. You could write `sum + Number(item.price)` in the loop, but then every other place that uses a price has the same trap. Turning the input into a number the moment it's read fixes it everywhere:

```js
items.push({ name: nameInput.value, price: Number(priceInput.value) });
```

Then two finishing touches:

- `toFixed(2)` shows money with two decimals: `3.75`, and `1.5` becomes `1.50`.
- **Remove the `debugger;` and the console lines.** They were tools for finding the bug, not part of the app. A `debugger;` left in shipped code freezes the page for anyone with DevTools open.

Add Chips for 1.50 and Soda for 2.25 again: the total is **3.75**. Then add one more to be sure: re-testing the exact steps that showed the bug is how you know it's really fixed.

```svg Fix it where it starts: turn the input into a number once, and everything after it is right
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="12">
  <rect x="5" y="20" width="90" height="40" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="50" y="38" text-anchor="middle">input</text><text x="50" y="53" text-anchor="middle" font-size="10">"1.50"</text>
  <rect x="120" y="20" width="90" height="40" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="165" y="38" text-anchor="middle">Number()</text><text x="165" y="53" text-anchor="middle" font-size="10">1.5</text>
  <rect x="235" y="20" width="90" height="40" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="280" y="38" text-anchor="middle">items, sum</text><text x="280" y="53" text-anchor="middle" font-size="10">3.75 ✓</text>
  <path d="M95 40 H118 M210 40 H233" stroke="#111" stroke-width="2"/>
  <text x="165" y="88" text-anchor="middle" fill="#334155">one fix at the source, not one at every use</text>
</svg>
```

check: js | the price turned into a number when it's read | /price:\s*Number\(\s*priceInput\.value\s*\)/ | price: Number(priceInput.value)
check: js | money shown with two decimals | /sum\.toFixed\(2\)/ | totalEl.textContent = sum.toFixed(2);
check: js | no debugger left behind | /^(?![\s\S]*\bdebugger\b)/ | Delete the debugger; line

quiz: Why fix the price where it's read instead of inside the loop?
- [ ] It runs faster
- [x] Every later use of the price gets a number, so the same bug can't show up somewhere else
- [ ] Loops can't call Number()
why: Fixing the cause at its source protects every place that uses the value; fixing the symptom only protects one.

quiz: Why remove `debugger;` before you publish?
- [ ] It makes the file too big
- [ ] It's a syntax error in some browsers
- [x] It pauses the page for anyone who has DevTools open, and it was only a tool for finding the bug
why: Breakpoints and console logs are for you while debugging. Take them out once the bug is fixed.

```js show
function show() {
  list.innerHTML = '';
  let sum = 0;
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = `${item.name}: $${item.price.toFixed(2)}`;
    list.append(li);
    sum = sum + item.price;
  }
  totalEl.textContent = sum.toFixed(2);
}
```

```js events
form.addEventListener('submit', (e) => {
  e.preventDefault();
  items.push({ name: nameInput.value, price: Number(priceInput.value) });
  form.reset();
  show();
});
```

## Step: A debugging checklist
time: 10
kind: read

Guessing and changing random things wastes hours. Developers follow the same steps every time:

1. **Reproduce it.** Find the exact steps that make the bug happen, every time. ("Add Chips 1.50, then Soda 2.25.")
2. **Read the error.** Open the Console. If there's red text, read its type, message and line, and click the line.
3. **Look at the values.** `console.log` with a label, `console.table`, or a breakpoint at the line just before things go wrong.
4. **Make one guess, and test it.** "I think price is a string." Check it: `typeof item.price`. Change one thing at a time.
5. **Fix the cause**, not the symptom, and **re-test** with the same steps from 1.
6. **Clean up** your logs and breakpoints.

When there's no error at all:

| Symptom | Where to look |
|---|---|
| A style isn't showing | **Elements**: click the element. A rule with a line through it is being overruled by another; a missing rule means the selector doesn't match |
| Data didn't load | **Network**: find the request. 404 = wrong address, 401/403 = not allowed, 500 = the server broke, CORS error = that site doesn't allow requests from your page |
| A click does nothing | **Console** for errors, then a breakpoint in the click handler to see if it runs at all |

> Still stuck after 20 minutes? Write the problem down as a question: what you expected, what happened, and what you tried. Half the time, writing it down shows you the answer. If not, it's exactly what to post when you ask for help.

## Finish

You can find bugs instead of guessing at them. You learned:

- **DevTools**: the Console for errors and logs, Elements for HTML and CSS, Sources for breakpoints, Network for requests
- How to **read an error**: its type, its message and the file and line it points to
- **console.log** with labels and **console.table** for arrays of objects
- **Breakpoints** with `debugger;` or a click in Sources, stepping, the Scope panel and `typeof`
- The most common beginner bug: **input values are strings**, and `+` joins strings
- A **debugging checklist**: reproduce, read, look, guess one thing, fix the cause, re-test, clean up

### Challenges

1. Break your tip calculator on purpose (misspell an id), read the error, and fix it from the Console's line link alone.
2. Add a **Remove** button to each snack. Use a breakpoint to watch `items` change when you click it.
3. In Elements, change the total's color and size until you like it, then copy the rule into your CSS.
4. Open the Network panel on any website, reload, and find the largest file it downloads.

### Next

Keep DevTools open for every project from here on. Next, the **Canvas drawing** lesson starts the road to Snake.
