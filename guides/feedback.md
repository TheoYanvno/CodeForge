---
id: feedback
title: Reacting to the player: a guessing game with a coach
blocks-html: page
blocks-css: base
blocks-js: state, coach, render, play, go
goals: Explain the input, evaluate, respond loop behind every interactive program; Keep a game's state in one object and change it only in one place; Handle form submissions and validate what the player typed; Find the best possible move and grade the player's move against it; Explain each grade in words, the way Chess Coach does; Write an end-of-game report from saved moves
prereqs: The JavaScript basics guide (functions, events, if/else, arrays)
---

## Session: A game that answers back

## Step: The page and a secret number
time: 12

So far your pages react to what people do: type a bill, the totals change. Games and coaches go one step further: they **judge** what you did and **tell you why**. That's what the Chess Coach guide does with chess moves. Chess is complicated, so this guide teaches the same idea with a game anyone can play: **guess the number**.

The computer picks a secret number from 1 to 100. You guess; it says higher or lower. And a **coach** grades every guess: was it the smartest guess you could have made, and why? The finished project is at [github.com/TheoYanvno/number-coach](https://github.com/TheoYanvno/number-coach).

### The loop behind every interactive program

```svg Every interactive program runs the same loop: the player acts, the program evaluates the action against the rules, it responds with feedback, and waits for the next action
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 220" font-family="sans-serif" font-size="13">
  <rect width="480" height="220" fill="#ffffff"/>
  <rect x="180" y="10" width="120" height="50" rx="10" fill="#dbeafe" stroke="#2563eb"/><text x="240" y="32" text-anchor="middle" font-weight="bold">1. Input</text><text x="240" y="50" text-anchor="middle">the player guesses</text>
  <rect x="340" y="90" width="130" height="50" rx="10" fill="#fef3c7" stroke="#f59e0b"/><text x="405" y="112" text-anchor="middle" font-weight="bold">2. Evaluate</text><text x="405" y="130" text-anchor="middle">check and grade it</text>
  <rect x="180" y="160" width="120" height="50" rx="10" fill="#dcfce7" stroke="#16a34a"/><text x="240" y="182" text-anchor="middle" font-weight="bold">3. Respond</text><text x="240" y="200" text-anchor="middle">show the feedback</text>
  <rect x="10" y="90" width="130" height="50" rx="10" fill="#f3f4f6" stroke="#6b7280"/><text x="75" y="112" text-anchor="middle" font-weight="bold">4. Wait</text><text x="75" y="130" text-anchor="middle">for the next move</text>
  <path d="M300 40 L360 88 M400 140 L300 178 M180 185 L100 142 M80 90 L180 40" fill="none" stroke="#374151" stroke-width="2"/>
</svg>
```

Snake, a chat app, Chess Coach, a form that says "that email looks wrong": they all run this loop. In this guide you'll build each part on purpose.

### Game state

Everything the game needs to remember lives in **one object**, `game`: the secret, the numbers still possible (`low` to `high`), and every guess so far. Keeping state in one place makes it easy to see, save, and reset.

`Math.random()` gives a decimal from 0 up to (not including) 1. Multiply by 100, round down with `Math.floor` (0 to 99), and add 1 to get 1 to 100.

check: html | a form with a number input | /<form[\s\S]*<input[^>]*id=["']guess["']/ | Add <form id="guessForm"> with <input id="guess" type="number">
check: js | a random secret from 1 to 100 | /Math\.floor\(\s*Math\.random\(\)\s*\*\s*100\s*\)\s*\+\s*1/ | Math.floor(Math.random() * 100) + 1
check: js | the game's state in one object | /game\s*=\s*\{[\s\S]*secret/ | Keep secret, low, high and moves in one game object

quiz: What does `Math.floor(Math.random() * 100) + 1` give?
- [ ] A decimal between 0 and 100
- [x] A whole number from 1 to 100
- [ ] Always 50
why: `Math.random() * 100` is 0 to 99.99…, `Math.floor` makes it 0 to 99, and `+ 1` shifts it to 1 to 100.

quiz: Why keep the secret, the range and the guesses together in one `game` object?
- [ ] JavaScript requires it
- [x] All the state is in one place, so it's easy to inspect, reset and reason about
- [ ] It makes the numbers random
why: Scattered variables are easy to forget when resetting; one object can be replaced in a single line.

```html page
<main class="coach">
  <h1>🎯 Number Coach</h1>
  <p class="muted">I'm thinking of a number from 1 to 100. Guess it, and I'll coach every guess.</p>
  <form id="guessForm" class="guess-row">
    <label for="guess" class="sr-only">Your guess</label>
    <input id="guess" type="number" min="1" max="100" placeholder="Your guess" autocomplete="off">
    <button type="submit">Guess</button>
  </form>
  <p id="answer" class="answer" aria-live="polite"></p>
  <div id="range" class="range" aria-hidden="true"></div>
  <p id="rangeText" class="muted small"></p>
  <ol id="moves" class="moves"></ol>
  <section id="report" class="report" hidden></section>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
}

.coach {
  box-sizing: border-box;
  width: min(560px, 100%);
  margin: 0 auto;
  padding: 24px 16px;
}

.muted { color: #94a3b8; }
.small { font-size: .9rem; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.guess-row {
  display: flex;
  gap: 8px;
}

.guess-row input {
  flex: 1;
  min-width: 0;
  padding: 12px;
  font-size: 1.2rem;
  border-radius: 10px;
  border: 1px solid #334155;
  background: #1e293b;
  color: inherit;
}

.guess-row button, .report button {
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 700;
  border: 0;
  border-radius: 10px;
  background: #38bdf8;
  color: #0f172a;
  cursor: pointer;
}

.answer {
  font-size: 1.3rem;
  font-weight: 700;
  min-height: 1.6em;
}

.range {
  position: relative;
  height: 14px;
  border-radius: 7px;
  background: #1e293b;
  overflow: hidden;
}

.range span {
  position: absolute;
  top: 0;
  bottom: 0;
  background: #38bdf8;
}

.moves {
  padding-left: 1.4em;
}

.moves li {
  margin: 10px 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #1e293b;
}

.grade {
  display: inline-block;
  padding: 2px 8px;
  margin-left: 6px;
  border-radius: 999px;
  font-size: .8rem;
  font-weight: 700;
  color: #0f172a;
}

.grade.best { background: #4ade80; }
.grade.good { background: #a3e635; }
.grade.risky { background: #facc15; }
.grade.wasted { background: #f87171; }

.report {
  margin-top: 16px;
  padding: 16px;
  border-radius: 12px;
  background: #1e293b;
  border: 1px solid #38bdf8;
}
```

```js state
// Everything the game remembers, in one object. newGame() replaces it to start over.
let game;

function newGame() {
  game = {
    secret: Math.floor(Math.random() * 100) + 1,
    low: 1,           // the smallest number it could still be
    high: 100,        // the largest number it could still be
    moves: [],        // every guess, with the coach's grade
    over: false,
  };
}
```

```js go
newGame();
```

## Step: Input: reading and checking a guess
time: 15

Step 1 of the loop: **input**. A `<form>` is the right element for "type something and press Enter": the browser submits it when you press Enter or click the button, and it works with the keyboard and screen readers for free.

### The submit event

```js
form.addEventListener('submit', (event) => {
  event.preventDefault();
  // ...
});
```

By default, submitting a form **reloads the page** (it's sending the form to a server). `event.preventDefault()` stops that, so your code handles it instead. Forgetting it is a classic bug: the page flashes and everything resets.

### Never trust input

Players type anything: nothing, `0`, `250`, `4.5`. Check before using it, and say exactly what's wrong:

```js
if (!Number.isInteger(n) || n < 1 || n > 100) {
  answer.textContent = 'Type a whole number from 1 to 100.';
  return;
}
```

Then compare with the secret and answer: too low, too high, or correct. After each guess the box is cleared and focused again, so you can keep typing.

check: js | the form's submit is handled | /addEventListener\(\s*['"]submit['"]/ | form.addEventListener('submit', (event) => { ... })
check: js | the page doesn't reload | /preventDefault\(\)/ | Call event.preventDefault() first
check: js | bad guesses are refused | /Number\.isInteger\(/ | Check Number.isInteger(n) and the 1–100 range
check: js | says higher or lower | /[Hh]igher/ | Tell the player to go higher or lower

quiz: What happens if a submit handler forgets `event.preventDefault()`?
- [x] The browser submits the form the normal way and reloads the page
- [ ] Nothing, it's optional
- [ ] The guess is sent to the secret number
why: Forms reload the page by default; preventDefault keeps your page (and its state) alive.

quiz: Why check the guess before comparing it?
- [ ] Comparisons don't work on numbers
- [x] Players can type empty, out-of-range or decimal values, and the game should explain instead of misbehaving
- [ ] It makes the secret harder to guess
why: Validating input and saying what's wrong is part of good feedback.

```js play
const form = document.getElementById('guessForm');
const input = document.getElementById('guess');
const answer = document.getElementById('answer');

// 1. Input: read the guess, check it, and answer.
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const n = Number(input.value);
  if (input.value === '' || !Number.isInteger(n) || n < 1 || n > 100) {
    answer.textContent = 'Type a whole number from 1 to 100.';
    return;
  }
  if (n < game.secret) answer.textContent = `${n} is too low. Go higher.`;
  else if (n > game.secret) answer.textContent = `${n} is too high. Go lower.`;
  else answer.textContent = `🎉 ${n} is right!`;
  input.value = '';
  input.focus();
});
```

## Step: State: what's still possible
time: 15

Each answer tells you something. If 40 is too low, the secret is 41 to 100: everything at 40 and below is **ruled out**. The game keeps that range in `game.low` and `game.high`, and saves every move in `game.moves`.

### One function changes the state

All changes go through `makeMove(n)`. The click handler only reads input and calls it. That split matters: rules live in one function you can test by calling `makeMove(50)` in the console, and the page code stays simple. Chess Coach does exactly this with its `makeMove()`.

```js
if (n < game.secret) game.low = Math.max(game.low, n + 1);
else if (n > game.secret) game.high = Math.min(game.high, n - 1);
```

`Math.max` keeps the range from growing again if someone guesses a number that was already ruled out.

### Respond: draw the state

`render()` draws everything from `game`: the range bar (the blue part is what's still possible), the "Still possible: 41–100" text, and the list of moves. Drawing from the state each time, instead of changing bits of the page here and there, means the page can never disagree with the game.

check: js | a function that applies a move | /function\s+makeMove\s*\(/ | Write function makeMove(n) { ... }
check: js | the range narrows | /game\.low\s*=/ | Update game.low and game.high after each guess
check: js | every move is saved | /game\.moves\.push\(/ | game.moves.push({ ... })
check: js | the page is drawn from the state | /function\s+render\s*\(/ | Write function render() { ... }

quiz: The range is 41–100 and the player guesses 30. What should happen to `game.low`?
- [ ] It becomes 31
- [x] It stays 41, because 30 was already ruled out
- [ ] It becomes 30
why: `Math.max(game.low, n + 1)` keeps the larger value, so a wasted guess can't undo what you knew.

quiz: Why does `render()` redraw everything from `game` instead of editing parts of the page?
- [x] The page always matches the state, so the two can never disagree
- [ ] It's the only way to change text
- [ ] It's faster for large pages
why: One source of truth (the state) and one drawing function is how most interactive apps stay correct.

```js render
const rangeBar = document.getElementById('range');
const rangeText = document.getElementById('rangeText');
const movesList = document.getElementById('moves');

// 3. Respond: draw the page from the game state.
function render() {
  const span = document.createElement('span');
  span.style.left = `${game.low - 1}%`;
  span.style.width = `${game.high - game.low + 1}%`;
  rangeBar.replaceChildren(span);
  rangeText.textContent = game.over ? '' : `Still possible: ${game.low}–${game.high}`;

  movesList.replaceChildren(...game.moves.map((m) => {
    const li = document.createElement('li');
    li.textContent = `${m.guess}: ${m.result}`;
    return li;
  }));
}
```

```js play
const form = document.getElementById('guessForm');
const input = document.getElementById('guess');
const answer = document.getElementById('answer');

// 2. Evaluate: apply one guess to the game state.
function makeMove(n) {
  let result;
  if (n < game.secret) {
    result = 'too low';
    game.low = Math.max(game.low, n + 1);
  } else if (n > game.secret) {
    result = 'too high';
    game.high = Math.min(game.high, n - 1);
  } else {
    result = 'correct!';
    game.low = game.high = n;
    game.over = true;
  }
  game.moves.push({ guess: n, result });
  return result;
}

// 1. Input: read the guess, check it, then make the move.
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (game.over) return;
  const n = Number(input.value);
  if (input.value === '' || !Number.isInteger(n) || n < 1 || n > 100) {
    answer.textContent = 'Type a whole number from 1 to 100.';
    return;
  }
  const result = makeMove(n);
  answer.textContent = result === 'correct!' ? `🎉 ${n} is right!`
    : `${n} is ${result}. Go ${result === 'too low' ? 'higher' : 'lower'}.`;
  input.value = '';
  input.focus();
  render();
});
```

```js go
newGame();
render();
```

## Session: The coach

## Step: Finding the best move
time: 18

To coach someone, you need to know what the **best** move was. In chess that takes a search through millions of positions. Here it's simpler and just as instructive.

The best guess is the **middle** of what's still possible. Whatever the answer, it rules out half the numbers. That strategy is called **binary search**, and it finds any number from 1 to 100 in **7 guesses or fewer**, because halving 100 seven times gets you to 1.

```svg Binary search: each middle guess cuts the possible numbers in half, from 100 to 50 to 25 and so on, so any number is found in at most 7 guesses
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" font-family="sans-serif" font-size="12">
  <rect width="500" height="200" fill="#ffffff"/>
  <rect x="20" y="20" width="400" height="22" fill="#bae6fd"/><text x="430" y="36">100 left</text><text x="220" y="36" text-anchor="middle">guess 50: too low</text>
  <rect x="220" y="56" width="200" height="22" fill="#7dd3fc"/><text x="430" y="72">50 left</text><text x="320" y="72" text-anchor="middle">guess 75</text>
  <rect x="220" y="92" width="100" height="22" fill="#38bdf8"/><text x="430" y="108">25 left</text><text x="270" y="108" text-anchor="middle">guess 63</text>
  <rect x="270" y="128" width="50" height="22" fill="#0ea5e9"/><text x="430" y="144">12 left</text>
  <rect x="270" y="164" width="25" height="22" fill="#0284c7"/><text x="430" y="180">6 left … 3 … 1</text>
  <text x="20" y="196" fill="#6b7280" font-size="11">Each middle guess halves what's left.</text>
</svg>
```

### Grading a guess

`rateGuess(n, low, high)` compares the player's guess with the best one **before** the move is applied, and returns a grade and an explanation:

| Grade | When | Why |
|---|---|---|
| **Best** | Within 1 of the middle | Rules out about half, the most any guess can |
| **Good** | Rules out at least a third | Solid, a little off center |
| **Risky** | Inside the range but far from the middle | A lucky answer saves time, but usually you learn little |
| **Wasted** | Outside the range | Already ruled out: you learned nothing |

"Rules out" depends on the answer you'll get, which you don't know yet. So the coach measures the **worst case**: the bigger side that could still be left. A middle guess leaves at most half; a guess near the edge might leave almost everything.

This is the heart of every coach, Chess Coach included: **compare the move to the best move, measure the difference, and explain it in words.**

check: js | the best guess is the middle | /function\s+bestGuess\s*\(\s*low\s*,\s*high\s*\)/ | function bestGuess(low, high) { return Math.floor((low + high) / 2); }
check: js | a function that grades a guess | /function\s+rateGuess\s*\(/ | Write function rateGuess(n, low, high) { ... }
check: js | wasted guesses are caught | /wasted/ | Return grade 'wasted' for a guess outside low–high

quiz: The secret could be 41 to 100. What's the best guess?
- [ ] 41
- [x] 70
- [ ] 100
why: The middle of 41–100 is 70 (rounded down), which rules out about half whichever way the answer goes.

quiz: Why does the coach judge a guess by its worst case?
- [x] The player can't know the answer yet, so a good guess is one that's useful whichever way it goes
- [ ] Worst cases are easier to compute
- [ ] To be strict
why: A guess at the edge can get lucky, but on average it teaches you much less than a middle guess.

```js coach
// 2. Evaluate: what's the best move, and how close was the player's?
function bestGuess(low, high) {
  return Math.floor((low + high) / 2);
}

// Grade a guess against the range BEFORE the move. Returns { grade, note }.
function rateGuess(n, low, high) {
  const size = high - low + 1;
  const best = bestGuess(low, high);
  if (n < low || n > high) {
    return { grade: 'wasted', note: `Already ruled out: it had to be ${low}–${high}. Try ${best}.` };
  }
  if (size <= 2 || Math.abs(n - best) <= 1) {
    return { grade: 'best', note: `The middle of ${low}–${high}: whatever the answer, half the numbers are gone.` };
  }
  // Worst case: the bigger side that could still be left after this guess.
  const worstLeft = Math.max(n - low, high - n);
  const ruledOut = size - worstLeft;
  if (ruledOut >= size / 3) {
    return { grade: 'good', note: `Rules out at least ${ruledOut} of ${size}. ${best} would rule out half.` };
  }
  return { grade: 'risky', note: `Near the edge: it might only rule out ${ruledOut} of ${size}. The middle, ${best}, is safer.` };
}
```

## Step: Feedback on every move
time: 15

Now connect the coach to the game. `makeMove` asks `rateGuess` for a grade **before** it changes the range (the grade is about the choice the player faced), and saves it with the move.

`render()` shows each move with a colored **grade badge** and the coach's note. The colors follow a simple rule: green is good, yellow is a warning, red is a mistake. Use words as well as colors, so color-blind players get the same feedback.

```svg Good feedback is specific: it names the grade, says what happened, and suggests the better move
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 150" font-family="sans-serif" font-size="13">
  <rect width="500" height="150" fill="#ffffff"/>
  <rect x="10" y="12" width="480" height="56" rx="10" fill="#1e293b"/>
  <text x="24" y="36" fill="#e2e8f0" font-weight="bold">90: too high</text>
  <rect x="120" y="22" width="56" height="20" rx="10" fill="#facc15"/><text x="148" y="36" text-anchor="middle" font-size="11" font-weight="bold">Risky</text>
  <text x="24" y="58" fill="#94a3b8">Near the edge: it might only rule out 11 of 100. The middle, 50, is safer.</text>
  <text x="20" y="92" fill="#16a34a">✓ names the grade</text>
  <text x="170" y="92" fill="#16a34a">✓ says what happened</text>
  <text x="340" y="92" fill="#16a34a">✓ suggests a better move</text>
  <text x="20" y="130" fill="#dc2626">✗ "Bad guess." (tells you nothing you can use)</text>
</svg>
```

Specific feedback that explains **why** is what makes a coach useful: "Bad guess" teaches nothing, while "it might only rule out 11 of 100; the middle, 50, is safer" teaches a strategy.

check: js | the move is graded before the range changes | /const\s+rating\s*=\s*rateGuess\(\s*n\s*,\s*game\.low\s*,\s*game\.high\s*\)/ | const rating = rateGuess(n, game.low, game.high); at the top of makeMove
check: js | each move shows its grade | /className\s*=\s*`grade \$\{/ | Give each badge the class grade plus its grade name

quiz: Why grade the guess *before* updating `low` and `high`?
- [ ] It's faster
- [x] The grade is about the choice the player had, which depends on the range at that moment
- [ ] The secret changes after each move
why: After the move the range has shrunk, and judging the old choice against the new range would be unfair.

quiz: Which feedback helps the player most?
- [ ] "Bad guess."
- [ ] A red color with no words
- [x] "Near the edge: it might only rule out 11 of 100. The middle, 50, is safer."
why: It names the problem, measures it, and gives a better move to try next time.

```js render
const rangeBar = document.getElementById('range');
const rangeText = document.getElementById('rangeText');
const movesList = document.getElementById('moves');
const LABELS = { best: 'Best', good: 'Good', risky: 'Risky', wasted: 'Wasted' };

// 3. Respond: draw the page from the game state.
function render() {
  const span = document.createElement('span');
  span.style.left = `${game.low - 1}%`;
  span.style.width = `${game.high - game.low + 1}%`;
  rangeBar.replaceChildren(span);
  rangeText.textContent = game.over ? '' : `Still possible: ${game.low}–${game.high}`;

  movesList.replaceChildren(...game.moves.map((m) => {
    const li = document.createElement('li');
    const head = document.createElement('strong');
    head.textContent = `${m.guess}: ${m.result}`;
    const badge = document.createElement('span');
    badge.className = `grade ${m.grade}`;
    badge.textContent = LABELS[m.grade];
    const note = document.createElement('div');
    note.className = 'muted small';
    note.textContent = m.note;
    li.append(head, badge, note);
    return li;
  }));
}
```

```js play
const form = document.getElementById('guessForm');
const input = document.getElementById('guess');
const answer = document.getElementById('answer');

// 2. Evaluate: grade the guess, then apply it to the game state.
function makeMove(n) {
  const rating = rateGuess(n, game.low, game.high);
  let result;
  if (n < game.secret) {
    result = 'too low';
    game.low = Math.max(game.low, n + 1);
  } else if (n > game.secret) {
    result = 'too high';
    game.high = Math.min(game.high, n - 1);
  } else {
    result = 'correct!';
    game.low = game.high = n;
    game.over = true;
  }
  game.moves.push({ guess: n, result, ...rating });
  return result;
}

// 1. Input: read the guess, check it, then make the move.
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (game.over) return;
  const n = Number(input.value);
  if (input.value === '' || !Number.isInteger(n) || n < 1 || n > 100) {
    answer.textContent = 'Type a whole number from 1 to 100.';
    return;
  }
  const result = makeMove(n);
  answer.textContent = result === 'correct!' ? `🎉 ${n} is right!`
    : `${n} is ${result}. Go ${result === 'too low' ? 'higher' : 'lower'}.`;
  input.value = '';
  input.focus();
  render();
});
```

## Step: The end-of-game report
time: 15

When the game ends, a coach sums up: how did you do overall, and what's the one thing to work on? Chess Coach shows an accuracy score and your biggest mistakes; this report does the same.

- **Guesses vs the target**: binary search never needs more than `Math.ceil(Math.log2(100))` = 7 guesses. `Math.log2(x)` asks "how many times can x be halved before reaching 1?"
- **Accuracy**: the share of moves graded Best or Good.
- **One tip**: based on the most common weak grade. If you had wasted guesses, that's the tip; otherwise, if you had risky ones, aim for the middle.

`showReport()` builds the report from `game.moves`, the saved history. A **Play again** button calls `newGame()`, hides the report and redraws, which works because all the state lives in one object.

check: js | the target uses log2 | /Math\.log2\(/ | const target = Math.ceil(Math.log2(100));
check: js | an end-of-game report | /function\s+showReport\s*\(/ | Write function showReport() { ... }
check: js | the player can play again | /addEventListener\(\s*['"]click['"][\s\S]*newGame\(\)/ | A Play again button whose click calls newGame() and render()

quiz: Why is 7 the most guesses binary search ever needs for 1–100?
- [ ] 100 divided by 7 is about 14
- [x] Halving 100 seven times gets below 1, and `Math.ceil(Math.log2(100))` is 7
- [ ] It's a rule of the game
why: Each middle guess halves the possibilities: 100, 50, 25, 13, 7, 4, 2, 1.

quiz: Why can Play again just call `newGame()` and `render()`?
- [x] All the state is in the one `game` object, and the page is drawn from it
- [ ] The browser reloads the page
- [ ] Old moves are deleted automatically by the form
why: Replace the state, redraw, and the game starts fresh with nothing left over.

```js coach
// 2. Evaluate: what's the best move, and how close was the player's?
function bestGuess(low, high) {
  return Math.floor((low + high) / 2);
}

// Grade a guess against the range BEFORE the move. Returns { grade, note }.
function rateGuess(n, low, high) {
  const size = high - low + 1;
  const best = bestGuess(low, high);
  if (n < low || n > high) {
    return { grade: 'wasted', note: `Already ruled out: it had to be ${low}–${high}. Try ${best}.` };
  }
  if (size <= 2 || Math.abs(n - best) <= 1) {
    return { grade: 'best', note: `The middle of ${low}–${high}: whatever the answer, half the numbers are gone.` };
  }
  // Worst case: the bigger side that could still be left after this guess.
  const worstLeft = Math.max(n - low, high - n);
  const ruledOut = size - worstLeft;
  if (ruledOut >= size / 3) {
    return { grade: 'good', note: `Rules out at least ${ruledOut} of ${size}. ${best} would rule out half.` };
  }
  return { grade: 'risky', note: `Near the edge: it might only rule out ${ruledOut} of ${size}. The middle, ${best}, is safer.` };
}

// The coach's summary of the whole game, built from the saved moves.
function summary(moves) {
  const target = Math.ceil(Math.log2(100));
  const count = (g) => moves.filter((m) => m.grade === g).length;
  const accuracy = Math.round((100 * (count('best') + count('good'))) / moves.length);
  let tip = 'Perfect strategy: you split the range every time.';
  if (count('wasted')) tip = 'Watch the range: some guesses were already ruled out.';
  else if (count('risky')) tip = 'Aim for the middle of the range: it always rules out half.';
  return { guesses: moves.length, target, accuracy, tip };
}
```

```js render
const rangeBar = document.getElementById('range');
const rangeText = document.getElementById('rangeText');
const movesList = document.getElementById('moves');
const report = document.getElementById('report');
const LABELS = { best: 'Best', good: 'Good', risky: 'Risky', wasted: 'Wasted' };

// 3. Respond: draw the page from the game state.
function render() {
  const span = document.createElement('span');
  span.style.left = `${game.low - 1}%`;
  span.style.width = `${game.high - game.low + 1}%`;
  rangeBar.replaceChildren(span);
  rangeText.textContent = game.over ? '' : `Still possible: ${game.low}–${game.high}`;

  movesList.replaceChildren(...game.moves.map((m) => {
    const li = document.createElement('li');
    const head = document.createElement('strong');
    head.textContent = `${m.guess}: ${m.result}`;
    const badge = document.createElement('span');
    badge.className = `grade ${m.grade}`;
    badge.textContent = LABELS[m.grade];
    const note = document.createElement('div');
    note.className = 'muted small';
    note.textContent = m.note;
    li.append(head, badge, note);
    return li;
  }));

  report.hidden = !game.over;
  if (game.over) showReport();
}

function showReport() {
  const s = summary(game.moves);
  const title = document.createElement('h2');
  title.textContent = s.guesses <= s.target && s.accuracy >= 60 ? 'Coach\'s report: nicely done' : 'Coach\'s report';
  const facts = document.createElement('p');
  facts.textContent = `${s.guesses} guesses (a perfect strategy needs at most ${s.target}). Accuracy: ${s.accuracy}% of moves were Best or Good.`;
  const tip = document.createElement('p');
  tip.textContent = `Tip: ${s.tip}`;
  const again = document.createElement('button');
  again.type = 'button';
  again.textContent = 'Play again';
  again.addEventListener('click', () => {
    newGame();
    render();
    answer.textContent = '';
    input.focus();
  });
  report.replaceChildren(title, facts, tip, again);
}
```

## Session: From numbers to chess

## Step: How Chess Coach uses the same idea
kind: read
time: 15

Your coach has the same four parts as the real Chess Coach. Only the game is bigger:

| Part | Number Coach | Chess Coach |
|---|---|---|
| **State** | `game`: secret, range, moves | the board, whose turn, castling rights, move history |
| **Input** | a form submit | clicking a piece and a square |
| **Validate** | 1–100, a whole number | only legal moves (no moving into check) |
| **Best move** | the middle of the range | a search a few moves deep (alpha-beta) that scores positions |
| **Grade** | Best / Good / Risky / Wasted from how much it rules out | Best / Good / Inaccuracy / Mistake / Blunder from how much the position's score dropped |
| **Explain** | "near the edge, try the middle" | "this leaves your queen undefended" |
| **Report** | guesses vs 7, accuracy, one tip | accuracy and the biggest mistakes |

The pattern to remember: **keep state in one place, change it in one function, grade each move against the best move, and explain the grade in words.**

### Publish it

Make a `number-coach` folder with `index.html` (a full page with this guide's HTML, ending with `<script src="script.js"></script>`), `style.css` and `script.js`, copied from the last code step. Commit, push to a public GitHub repository, and turn on Pages. The finished project is at [github.com/TheoYanvno/number-coach](https://github.com/TheoYanvno/number-coach).

quiz: In Chess Coach, what plays the role of `bestGuess()`?
- [ ] The list of moves
- [x] The search that finds the best move and its score
- [ ] The board drawing
why: Both coaches grade the player by comparing their move with the best move the computer can find.

## Finish

You built a game that reacts to the player and coaches them. You learned:

- The **input → evaluate → respond** loop behind every interactive program
- **State in one object**, changed in **one function**, and a page drawn from it
- **Forms**: the submit event, `preventDefault()` and validating input
- **Binary search**, and finding the best move to grade against
- Writing **specific feedback**: a grade, what happened and a better move
- An **end-of-game report** built from the saved history

### Challenges

1. Add difficulty levels: 1–10, 1–100 and 1–1000 (the target becomes `Math.ceil(Math.log2(max))`).
2. Save the best game (fewest guesses) in `localStorage` and show it under the title.
3. Swap roles: you pick a number, and the computer guesses it with binary search while you answer higher or lower.

### Next

The **Chess Coach** guide.
