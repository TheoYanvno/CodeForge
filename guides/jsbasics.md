---
id: jsbasics
title: JavaScript basics: a tip calculator
blocks-html: page
blocks-css: base
blocks-js: elements, math, update, events, presets
goals: Store values in variables with const and let, and know strings from numbers; Write functions that take inputs and return an answer; Find elements on the page and change their text; React to typing and clicks with event listeners; Make decisions with if and else; Build buttons from an array with a for...of loop
prereqs: The HTML & CSS basics guide (elements, ids, classes, simple CSS)
---

## Session: Variables and functions

## Step: The page: inputs for the bill
time: 12

HTML and CSS make a page look right; **JavaScript** makes it *do* things. In this guide you'll build a tip calculator: type the bill, pick a tip and the number of people, and it shows the tip, the total and what each person pays, updating as you type. The finished project is at [github.com/TheoYanvno/tip-calculator](https://github.com/TheoYanvno/tip-calculator).

First the page. It's HTML and CSS you already know, plus one new element: `<input>`, a box the visitor types into.

```html
<label for="bill">Bill ($)</label>
<input id="bill" type="number" min="0" step="0.01" placeholder="0.00">
```

- `type="number"` shows a number keyboard on phones and stops letters being typed.
- A `<label>` with `for="bill"` is tied to the input with `id="bill"`: clicking the label puts the cursor in the box, and screen readers read the label out.
- The empty `<div id="presets">` will hold tip buttons; JavaScript fills it in the last session.
- The result paragraphs have ids so JavaScript can find them and write the answers into them.

Your project folder needs a third file now, `script.js`, loaded at the end of the `<body>` with `<script src="script.js"></script>`. Putting it last means the HTML above it already exists when the script runs.

check: html | a number input with id "bill" | /<input[^>]*id=["']bill["'][^>]*type=["']number|<input[^>]*type=["']number["'][^>]*id=["']bill/ | Add <input id="bill" type="number">
check: html | inputs for the tip and people | /id=["']tip["'][\s\S]*id=["']people["']/ | Add inputs with id="tip" and id="people"
check: html | a place for the results | /id=["']perPerson["']/ | Add <strong id="perPerson">

quiz: Why does each input have a matching `<label for="...">`?
- [ ] It makes the input bigger
- [x] Clicking the label focuses the input, and screen readers announce it
- [ ] JavaScript can't read inputs without a label
why: `for` connects the label to the input with that id, which helps everyone, especially keyboard and screen reader users.

```html page
<main class="calc">
  <h1>Tip Calculator</h1>

  <label for="bill">Bill ($)</label>
  <input id="bill" type="number" min="0" step="0.01" placeholder="0.00">

  <label for="tip">Tip (%)</label>
  <input id="tip" type="number" min="0" value="18">
  <div id="presets" class="presets"></div>

  <label for="people">People</label>
  <input id="people" type="number" min="1" value="1">

  <section class="results" aria-live="polite">
    <p>Tip <strong id="tipAmount">$0.00</strong></p>
    <p>Total <strong id="total">$0.00</strong></p>
    <p class="big">Each person pays <strong id="perPerson">$0.00</strong></p>
    <p id="message" class="message"></p>
  </section>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #ecfdf5;
  color: #064e3b;
}

.calc {
  box-sizing: border-box;
  width: min(360px, 100% - 32px);
  padding: 24px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgb(0 0 0 / .08);
}

h1 { margin-top: 0; }

label {
  display: block;
  margin-top: 12px;
  font-weight: 600;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  font-size: 1.1rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
}

.presets {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.presets button {
  flex: 1;
  padding: 8px;
  border: 1px solid #10b981;
  border-radius: 8px;
  background: #ffffff;
  color: #047857;
  font-weight: 600;
  cursor: pointer;
}

.presets button.active {
  background: #10b981;
  color: #ffffff;
}

.results {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px dashed #a7f3d0;
}

.results p {
  display: flex;
  justify-content: space-between;
  margin: 6px 0;
}

.big { font-size: 1.25rem; }

.message {
  color: #b91c1c;
  min-height: 1.5em;
}
```

## Step: Variables: finding elements on the page
time: 15

A **variable** is a name for a value, so you can use it later. Picture a labeled box:

```svg A variable is a label on a box that holds a value: const people = 4 puts 4 in a box named people
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 150" font-family="sans-serif" font-size="14">
  <rect width="460" height="150" fill="#ffffff"/>
  <rect x="30" y="50" width="110" height="70" rx="8" fill="#d1fae5" stroke="#10b981"/>
  <text x="85" y="94" text-anchor="middle" font-size="26" fill="#064e3b">4</text>
  <rect x="45" y="30" width="80" height="24" rx="4" fill="#10b981"/>
  <text x="85" y="47" text-anchor="middle" fill="#ffffff">people</text>
  <rect x="190" y="50" width="110" height="70" rx="8" fill="#e0e7ff" stroke="#6366f1"/>
  <text x="245" y="92" text-anchor="middle" font-size="16" fill="#312e81">"Alex"</text>
  <rect x="205" y="30" width="80" height="24" rx="4" fill="#6366f1"/>
  <text x="245" y="47" text-anchor="middle" fill="#ffffff">name</text>
  <rect x="350" y="50" width="90" height="70" rx="8" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="395" y="90" text-anchor="middle" font-size="13" fill="#78350f">&lt;input&gt;</text>
  <rect x="352" y="30" width="86" height="24" rx="4" fill="#f59e0b"/>
  <text x="395" y="47" text-anchor="middle" fill="#ffffff">billInput</text>
  <text x="85" y="140" text-anchor="middle" fill="#6b7280">a number</text>
  <text x="245" y="140" text-anchor="middle" fill="#6b7280">a string (text)</text>
  <text x="395" y="140" text-anchor="middle" fill="#6b7280">an element</text>
</svg>
```

```js
const people = 4;       // a number
let name = 'Alex';      // a string: text in quotes
name = 'Sam';           // let can be changed later; const can't
```

- Use **`const`** by default: the name always points at the same value.
- Use **`let`** when the value will change, like a counter.
- Text in quotes is a **string**. `'4'` (a string) and `4` (a number) are different things; that matters in step 4.

### Finding elements

`document` is the whole page. `document.getElementById('bill')` finds the element with `id="bill"` and gives it back so you can store it in a variable. You'll use these elements over and over, so find them once at the top.

### console.log

`console.log('Tip calculator loaded')` prints a message in the browser's **console** (press F12 and open the Console tab). It's how you check what your code is doing. Errors show up there too, in red, with the line number.

check: js | a variable for the bill input | /const\s+billInput\s*=\s*document\.getElementById\(\s*['"]bill['"]\s*\)/ | Write const billInput = document.getElementById('bill');
check: js | variables for the tip and people inputs | /tipInput\s*=[\s\S]*peopleInput\s*=/ | Find the tip and people inputs the same way
check: js | a message in the console | /console\.log\(/ | Add console.log('Tip calculator loaded');

quiz: When should you use `let` instead of `const`?
- [ ] Always; `const` is old
- [x] When you'll give the variable a new value later
- [ ] For text only
why: `const` can't be reassigned, which prevents mistakes; `let` is for values that change, like a running total.

quiz: Are `'4'` and `4` the same in JavaScript?
- [ ] Yes
- [x] No: `'4'` is a string (text) and `4` is a number
- [ ] Only inside an input
why: Quotes make a string. Adding strings joins them (`'4' + '4'` is `'44'`), while adding numbers does math.

```js elements
// Find the parts of the page once, and keep them in variables.
const billInput = document.getElementById('bill');
const tipInput = document.getElementById('tip');
const peopleInput = document.getElementById('people');
const presetsBox = document.getElementById('presets');
const tipOut = document.getElementById('tipAmount');
const totalOut = document.getElementById('total');
const perPersonOut = document.getElementById('perPerson');
const message = document.getElementById('message');

console.log('Tip calculator loaded');
```

## Step: Functions that do the math
time: 15

A **function** is a named, reusable piece of code. It takes **parameters** (inputs), does something, and can **return** an answer:

```svg A function is a machine: values go in as parameters, the code runs, and return sends one answer back out
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 140" font-family="sans-serif" font-size="14">
  <rect width="480" height="140" fill="#ffffff"/>
  <text x="20" y="62" fill="#064e3b">bill = 50</text>
  <text x="20" y="86" fill="#064e3b">percent = 18</text>
  <path d="M110 70 H160" stroke="#10b981" stroke-width="3"/>
  <path d="M152 63 L162 70 L152 77" fill="none" stroke="#10b981" stroke-width="3"/>
  <rect x="165" y="30" width="170" height="80" rx="10" fill="#d1fae5" stroke="#10b981"/>
  <text x="250" y="62" text-anchor="middle" font-family="monospace" fill="#064e3b">tipAmount()</text>
  <text x="250" y="86" text-anchor="middle" font-family="monospace" font-size="12" fill="#064e3b">bill * percent / 100</text>
  <path d="M335 70 H385" stroke="#10b981" stroke-width="3"/>
  <path d="M377 63 L387 70 L377 77" fill="none" stroke="#10b981" stroke-width="3"/>
  <text x="395" y="66" fill="#064e3b">returns</text>
  <text x="395" y="88" fill="#064e3b" font-size="18">9</text>
</svg>
```

```js
function tipAmount(bill, percent) {
  return (bill * percent) / 100;
}

tipAmount(50, 18);   // 9
```

`function` starts it, `tipAmount` is its name, `(bill, percent)` are its parameters, and the code between `{ }` is its body. Calling it, `tipAmount(50, 18)`, runs the body with `bill` set to 50 and `percent` set to 18, and the call is replaced by what it returns: 9.

The math operators are `+ - * /`, and parentheses work like in math class.

### Why separate functions?

Each function does one small job, so it's easy to test: try `tipAmount(50, 18)` in the console and check you get 9. The page code (step 4) will call these functions instead of doing math in the middle of everything.

`money(9)` turns a number into text like `$9.00`. `toFixed(2)` always shows two decimal places, and the backtick string `` `$${...}` `` is a **template literal**: `${ }` puts a value inside the text.

check: js | a tipAmount function that returns | /function\s+tipAmount\s*\(\s*bill\s*,\s*percent\s*\)\s*\{[^}]*return/ | Write function tipAmount(bill, percent) { return ... }
check: js | a function that splits the total | /function\s+perPerson\s*\(/ | Write function perPerson(total, people) { ... }
check: js | money() shows two decimals | /toFixed\(\s*2\s*\)/ | Use number.toFixed(2)

quiz: What does `return` do?
- [ ] Prints the value on the page
- [x] Ends the function and sends the value back to where it was called
- [ ] Repeats the function
why: The call `tipAmount(50, 18)` is replaced by the returned value, so you can store it or use it in more math.

quiz: What is `(9).toFixed(2)`?
- [ ] `9`
- [x] `'9.00'`
- [ ] `9.2`
why: `toFixed(2)` gives a string with exactly two digits after the point, which is how money is shown.

```js math
// The math: small functions that take numbers and return numbers.
function tipAmount(bill, percent) {
  return (bill * percent) / 100;
}

function perPerson(total, people) {
  return total / people;
}

// Turns 9 into "$9.00".
function money(amount) {
  return `$${amount.toFixed(2)}`;
}
```

## Session: Making the page react

## Step: Reading inputs and showing results
time: 15

Now connect the math to the page. The `update()` function will:

1. **Read** what's typed in each input.
2. **Calculate** with the math functions.
3. **Write** the answers into the result elements.

### Reading an input

`billInput.value` is what's typed in the box, but it's always a **string**, even in a number input. `Number(billInput.value)` turns `'50'` into `50` so math works. (Remember: `'50' + 9` is `'509'`!)

### Writing to the page

Every element has a `textContent`: the text inside it. Setting it replaces that text:

```js
totalOut.textContent = '$59.00';
```

That's the core idea of JavaScript on a web page: find an element, change it.

### Try it

`update()` isn't called by anything yet. Open **See it run**, type a bill, then... nothing happens. In the next step, events will call it. (In your own copy, you can type `update()` in the console to run it by hand.)

check: js | an update() function | /function\s+update\s*\(\s*\)/ | Write function update() { ... }
check: js | turns the typed text into numbers | /Number\(\s*billInput\.value\s*\)/ | const bill = Number(billInput.value);
check: js | writes the answers into the page | /perPersonOut\.textContent\s*=/ | perPersonOut.textContent = money(...);

quiz: What type is `billInput.value`?
- [ ] Always a number
- [x] Always a string, even for a number input
- [ ] An element
why: Inputs hold text. Convert with `Number()` before doing math, or `+` will join strings.

quiz: What does `totalOut.textContent = '$59.00'` do?
- [x] Replaces the text inside the total element with $59.00
- [ ] Adds $59.00 to the console
- [ ] Changes the element's id
why: `textContent` is the element's text; setting it updates what's on the page right away.

```js update
// Read the inputs, do the math, and show the answers.
function update() {
  const bill = Number(billInput.value);
  const percent = Number(tipInput.value);
  const people = Number(peopleInput.value);

  const tip = tipAmount(bill, percent);
  const total = bill + tip;

  tipOut.textContent = money(tip);
  totalOut.textContent = money(total);
  perPersonOut.textContent = money(perPerson(total, people));
}
```

## Step: Events: update as you type
time: 12

An **event** is something that happens on the page: a click, a key press, typing in a box. You can ask the browser to run a function every time an event happens. That's an **event listener**:

```js
billInput.addEventListener('input', update);
```

"When the `input` event happens on `billInput`, call `update`." The `input` event fires on every change to the box: each key, paste or arrow click.

```svg What happens when you type: the input event fires, the listener calls update, update changes textContent, and the page shows the new totals
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 120" font-family="sans-serif" font-size="13">
  <rect width="520" height="120" fill="#ffffff"/>
  <rect x="10" y="35" width="100" height="50" rx="8" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="60" y="58" text-anchor="middle">You type</text><text x="60" y="75" text-anchor="middle">"5"</text>
  <rect x="140" y="35" width="100" height="50" rx="8" fill="#e0e7ff" stroke="#6366f1"/>
  <text x="190" y="58" text-anchor="middle">'input'</text><text x="190" y="75" text-anchor="middle">event fires</text>
  <rect x="270" y="35" width="100" height="50" rx="8" fill="#d1fae5" stroke="#10b981"/>
  <text x="320" y="58" text-anchor="middle">update()</text><text x="320" y="75" text-anchor="middle">runs</text>
  <rect x="400" y="35" width="110" height="50" rx="8" fill="#fce7f3" stroke="#db2777"/>
  <text x="455" y="58" text-anchor="middle">textContent</text><text x="455" y="75" text-anchor="middle">changes</text>
  <path d="M110 60 H136 M240 60 H266 M370 60 H396" stroke="#6b7280" stroke-width="2"/>
  <text x="260" y="108" text-anchor="middle" fill="#6b7280">This loop runs again on every key you press.</text>
</svg>
```

Notice it's `update`, not `update()`. With parentheses you'd call it once, right now, and hand its result to the listener. Without them you hand over the **function itself**, for the browser to call later.

The last line, `update();`, calls it once when the page loads, so the results show `$0.00` from the start instead of waiting for a key press.

check: js | the bill input listens for typing | /billInput\.addEventListener\(\s*['"]input['"]\s*,\s*update\s*\)/ | billInput.addEventListener('input', update);
check: js | the other inputs listen too | /tipInput\.addEventListener[\s\S]*peopleInput\.addEventListener/ | Add the same listener to tipInput and peopleInput

quiz: Why is it `addEventListener('input', update)` and not `addEventListener('input', update())`?
- [ ] Both are the same
- [x] `update` hands over the function to call later; `update()` would call it once immediately
- [ ] Parentheses aren't allowed in JavaScript
why: The listener needs the function itself, so the browser can call it every time the event happens.

quiz: When does the `input` event fire?
- [ ] Only when you press Enter
- [x] Every time the input's value changes
- [ ] Only when the page loads
why: That's why the totals update with each key, which feels instant.

```js events
// Recalculate whenever any input changes, and once now so the results aren't blank.
billInput.addEventListener('input', update);
tipInput.addEventListener('input', update);
peopleInput.addEventListener('input', update);

update();
```

## Step: Decisions with if and else
time: 15

Try 0 people in See it run: each person pays `$Infinity`. Try deleting the people number: `$NaN` (Not a Number). Programs need to check their inputs. **`if`** runs code only when a condition is true:

```js
if (people < 1) {
  message.textContent = 'At least 1 person has to pay.';
  return;
}
```

### Conditions

| Operator | Means |
|---|---|
| `===` | equal to (use three `=`; two do surprising type conversions) |
| `!==` | not equal to |
| `<` `>` `<=` `>=` | less / greater than (or equal) |
| `&&` | and: both must be true |
| `!` | not: flips true and false |

And `||` (two pipe characters) means **or**: at least one side must be true.

`Number.isInteger(people)` checks for a whole number, so 2.5 people is refused too.

### return as an early exit

`return` inside `update()` stops the function right there, so the bad numbers never reach the math. This is called a **guard clause**: handle the problems at the top, and the rest of the function can assume the inputs are good. `else` isn't needed after a `return`.

When everything is fine, `message.textContent = ''` clears an old warning.

check: js | checks the number of people | /if\s*\([^)]*people[^)]*\)/ | Add if (people < 1 ...) { ... return; }
check: js | stops early on bad input | /if\s*\([^)]*\)\s*\{[^}]*return;/ | Inside the if, show a message and return;
check: js | clears the message when the input is fine | /message\.textContent\s*=\s*['"]{2}/ | message.textContent = '';

quiz: In `if (bill < 0 || people < 1)`, when does the code inside run?
- [ ] Only when both are true
- [x] When at least one of them is true
- [ ] Never
why: `||` means "or": either problem is enough to show the warning.

quiz: What does `return;` do inside `update()` here?
- [x] Stops `update()` so the math below doesn't run with bad numbers
- [ ] Restarts the page
- [ ] Returns the bill amount
why: An early return is a guard: the rest of the function only runs when the inputs make sense.

```js update
// Read the inputs, check them, do the math, and show the answers.
function update() {
  const bill = Number(billInput.value);
  const percent = Number(tipInput.value);
  const people = Number(peopleInput.value);

  if (bill < 0 || percent < 0) {
    message.textContent = 'The bill and tip can\'t be negative.';
    return;
  }
  if (people < 1 || !Number.isInteger(people)) {
    message.textContent = 'People must be a whole number, 1 or more.';
    return;
  }
  message.textContent = '';

  const tip = tipAmount(bill, percent);
  const total = bill + tip;

  tipOut.textContent = money(tip);
  totalOut.textContent = money(total);
  perPersonOut.textContent = money(perPerson(total, people));
}
```

## Session: Arrays and loops

## Step: Tip buttons from an array
time: 18

Typing a percentage works, but most people want one tap: 10%, 15%, 18%, 20%. Instead of writing four buttons in HTML, keep the choices in an **array** and let a **loop** make a button for each.

### Arrays

An array is a list of values in square brackets. Each has a position (an **index**) starting at 0:

```js
const PRESETS = [10, 15, 18, 20];
PRESETS[0];       // 10
PRESETS.length;   // 4
```

Adding a 25% button is now one edit to the array.

### for...of loops

`for (const percent of PRESETS) { ... }` runs the code in braces once for each item, with `percent` set to 10, then 15, then 18, then 20.

### Making elements

- `document.createElement('button')` makes a new button (not on the page yet).
- Set its `textContent` and `type`.
- `presetsBox.append(button)` puts it inside the presets box, on the page.

Each button gets its own click listener. The arrow function `() => { ... }` is a short way to write a function right where it's needed. On click it puts the percent in the tip box and calls `update()`.

### Highlighting the chosen button

`highlight()` loops over the buttons and adds the `active` class to the one that matches the tip box. `classList.toggle('active', condition)` adds the class when the condition is true and removes it when false. It runs on clicks and on typing in the tip box, so they always agree.

check: js | an array of tip percentages | /const\s+PRESETS\s*=\s*\[[\d\s,]+\]/ | const PRESETS = [10, 15, 18, 20];
check: js | a for...of loop over the array | /for\s*\(\s*const\s+\w+\s+of\s+PRESETS\s*\)/ | for (const percent of PRESETS) { ... }
check: js | creates a button for each | /document\.createElement\(\s*['"]button['"]\s*\)/ | const button = document.createElement('button');
check: js | each button listens for clicks | /addEventListener\(\s*['"]click['"]/ | button.addEventListener('click', () => { ... });

quiz: What is `PRESETS[1]` if `PRESETS = [10, 15, 18, 20]`?
- [ ] 10
- [x] 15
- [ ] 1
why: Indexes start at 0, so `[1]` is the second item.

quiz: Why build the buttons from an array instead of writing them in HTML?
- [ ] Arrays load faster than HTML
- [x] Changing the list of tips is one edit, and every button is guaranteed to work the same way
- [ ] HTML can't have buttons
why: Data in one place plus a loop means no copy-pasted code to keep in sync.

```js presets
// One button per tip choice, built from data.
const PRESETS = [10, 15, 18, 20];

for (const percent of PRESETS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = `${percent}%`;
  button.addEventListener('click', () => {
    tipInput.value = percent;
    update();
    highlight();
  });
  presetsBox.append(button);
}

// Mark the button that matches the tip box.
function highlight() {
  for (const button of presetsBox.children) {
    button.classList.toggle('active', button.textContent === `${tipInput.value}%`);
  }
}

tipInput.addEventListener('input', highlight);
highlight();
```

## Step: Publish it and keep going
kind: read
time: 15

Your calculator works. Publish it the same way as the profile page:

1. Make a folder `tip-calculator` with `index.html` (a full page whose `<body>` holds this guide's HTML and ends with `<script src="script.js"></script>`), `style.css` and `script.js`. Copy each file from the last code step's tabs.
2. Open it with Live Server and check the console (F12) shows `Tip calculator loaded` and no red errors.
3. In the terminal: `git init`, `git add .`, `git commit -m "Tip calculator"`, then create a public `tip-calculator` repository on GitHub and push.
4. Turn on **Settings → Pages** (main, / root).

The finished version is at [github.com/TheoYanvno/tip-calculator](https://github.com/TheoYanvno/tip-calculator).

### What to learn next

- **Objects** group related values: `{ bill: 50, tip: 18, people: 2 }`. The Quote & Joke Generator guide uses arrays of objects.
- **localStorage** remembers things after the page closes, like the last tip you chose. Snake uses it for the best score.
- **Debugging**: when something breaks, read the red error in the console, click its line number, and `console.log` your variables to see what they really hold.

quiz: Where does `<script src="script.js"></script>` go in `index.html`, and why?
- [ ] In the `<head>`, so it loads first
- [x] At the end of the `<body>`, so the elements it looks for already exist
- [ ] Anywhere, it doesn't matter
why: Code runs as soon as it loads. At the end of the body, `getElementById` can find every element above it.

## Finish

You wrote your first JavaScript program, and it's a real tool you can use at a restaurant. You learned:

- **Variables** with `const` and `let`, **strings** vs **numbers**, and `Number()`
- **Functions** with parameters and `return`, and template literals
- **The DOM**: `getElementById`, `value` and `textContent`
- **Events**: `addEventListener('input' | 'click', ...)`
- **Decisions**: `if`, comparison and logic operators, guard clauses
- **Arrays** and **for...of** loops, `createElement`, `append` and `classList`

### Challenges

1. Add a **Round up** checkbox that rounds each person's share up to the next dollar (`Math.ceil`).
2. Remember the last tip with `localStorage.setItem('tip', ...)` and load it when the page opens.
3. Add a 25% button by changing only the array.

### Next

You're ready for the project guides. **Snake** is the best next step: a game loop, the keyboard and a canvas.
