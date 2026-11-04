---
id: backtracking
title: Recursion and backtracking
blocks-html: page
blocks-css: base
blocks-js: recursion, board, solve, watch
goals: Explain recursion: a function that calls itself, with a base case that stops it; Read the call stack and know why every recursion needs a way out; Solve a puzzle by backtracking: guess, go deeper, and undo when stuck; Count guesses and backtracks to see how much work a solver does; Cut the work hugely by guessing where there are fewest choices
prereqs: The Grids as 2D arrays lesson (flat boards and peers) and the Game loops and timers lesson (setTimeout)
---

## Session: Guess, check, undo

## Step: Recursion and backtracking
time: 12
kind: read

**Recursion** is a function that calls itself to solve a smaller piece of the same problem. It needs two parts:

1. A **base case**: an answer simple enough to give straight away, which stops the calls.
2. A **recursive case**: do one small step, then call yourself on what's left.

```js
function countdown(n) {
  if (n === 0) return ['Liftoff!'];   // base case
  return [n, ...countdown(n - 1)];    // one step, then the rest
}
```

Each call waits for the one it made, so they pile up on the **call stack** and then finish in reverse order. Forget the base case and the stack keeps growing until the browser stops it with "Maximum call stack size exceeded".

### Backtracking

**Backtracking** is recursion for puzzles. To fill a Sudoku: find an empty cell, try a digit that fits, and *recursively* solve the rest. If the rest can't be solved, **undo** that digit and try the next one. If no digit works, return "stuck" so the call before you undoes *its* guess.

```svg Backtracking as a tree: try a digit, go deeper; at a dead end, undo and try the next branch
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 160" font-family="sans-serif" font-size="11">
  <circle cx="165" cy="18" r="12" fill="#6366f1"/><text x="165" y="22" text-anchor="middle" fill="#fff">A</text>
  <circle cx="90" cy="70" r="12" fill="#a5b4fc"/><text x="90" y="74" text-anchor="middle">1</text>
  <circle cx="240" cy="70" r="12" fill="#a5b4fc"/><text x="240" y="74" text-anchor="middle">2</text>
  <circle cx="50" cy="125" r="12" fill="#fecaca"/><text x="50" y="129" text-anchor="middle">✗</text>
  <circle cx="130" cy="125" r="12" fill="#fecaca"/><text x="130" y="129" text-anchor="middle">✗</text>
  <circle cx="240" cy="125" r="12" fill="#bbf7d0"/><text x="240" y="129" text-anchor="middle">✓</text>
  <path d="M157 27 L98 61 M173 27 L232 61 M84 80 L56 115 M96 80 L124 115 M240 82 V113" stroke="#475569" stroke-width="2"/>
  <text x="10" y="155" fill="#b91c1c">both dead ends → undo 1</text><text x="200" y="155" fill="#15803d">try 2 → solved</text>
</svg>
```

It's like walking a maze with one rule: when you hit a wall, go back to the last fork and take the next path. It always finds a solution if there is one.

## Step: A function that calls itself
time: 12

Start with recursion on its own. `countdown(n)` returns a list, and the page shows each call going onto the stack and coming back off, with its depth:

- the calls go **in**: countdown(5), countdown(4), … countdown(0)
- the base case answers first
- the answers come back **out** in reverse order

Change the number and watch the stack. The page refuses numbers over 500 instead of letting the stack overflow, and that's the second lesson: recursion depth has limits, so a recursive solution should only go as deep as the problem really needs (81 levels at most for a Sudoku).

check: js | a base case that stops the calls | /if\s*\(\s*n\s*===\s*0\s*\)[\s\S]{0,200}?return\s+\[\s*['"]Liftoff/ | if (n === 0) { ... return ['Liftoff!']; }
check: js | the function calls itself on a smaller problem | /countdown\(\s*n\s*-\s*1/ | countdown(n - 1, depth + 1)

quiz: What happens if `countdown` has no base case?
- [ ] It returns an empty list
- [x] It calls itself forever until the browser stops it: "Maximum call stack size exceeded"
- [ ] It counts down to 0 anyway
why: Without a base case nothing ever stops the calls, and the stack runs out of room.

quiz: Which call finishes first?
- [ ] countdown(5), the first one made
- [x] countdown(0), the base case, the last one made
- [ ] They all finish at once
why: Each call waits for the one it made, so the deepest call returns first.

```html page
<main class="card">
  <h1>Recursion</h1>
  <p class="row"><label>n <input id="n" type="number" value="5" min="0" max="500"></label></p>
  <ol id="stack" class="stack"></ol>
  <section id="sudoku"></section>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: start center;
  padding: 20px 0;
  font-family: system-ui, sans-serif;
  background: #eef2ff;
  color: #1e1b4b;
}

.card { width: min(460px, 100% - 24px); padding: 16px; background: #fff; border-radius: 16px; }
h1 { margin-top: 0; font-size: 1.3rem; }
input, button { font: inherit; padding: 6px 10px; }
.stack { max-height: 180px; overflow: auto; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .8rem; }
.stack .out { color: #15803d; }
.mini { display: grid; grid-template-columns: repeat(4, 44px); gap: 2px; margin: 10px 0; }
.mini div { height: 44px; display: grid; place-items: center; font-size: 1.2rem; font-weight: 700; background: #e0e7ff; border-radius: 6px; }
.mini div.given { background: #c7d2fe; color: #312e81; }
.mini div.try { background: #fde68a; }
.mini div.undo { background: #fecaca; }
.mini div:nth-child(4n + 2) { margin-right: 6px; }
.mini div:nth-child(n + 5):nth-child(-n + 8) { margin-bottom: 6px; }
.stats { font-size: .9rem; }
```

```js recursion
const stackEl = document.getElementById('stack');

function countdown(n, depth = 0, log = []) {
  log.push({ text: `${'  '.repeat(depth)}→ countdown(${n})`, out: false });
  if (n === 0) {
    log.push({ text: `${'  '.repeat(depth)}← base case: ['Liftoff!']`, out: true });
    return ['Liftoff!'];
  }
  const rest = countdown(n - 1, depth + 1, log);
  log.push({ text: `${'  '.repeat(depth)}← [${n}, …${rest.length} more]`, out: true });
  return [n, ...rest];
}

function showStack() {
  const n = Number(document.getElementById('n').value);
  if (!Number.isInteger(n) || n < 0 || n > 500) { stackEl.textContent = 'Pick a whole number from 0 to 500.'; return; }
  const log = [];
  const result = countdown(n, 0, log);
  stackEl.replaceChildren(...log.map((l) => {
    const li = document.createElement('li');
    li.textContent = l.text;
    if (l.out) li.className = 'out';
    return li;
  }));
  stackEl.title = result.join(' ');
}

document.getElementById('n').addEventListener('input', showStack);
showStack();
```

## Step: A backtracking solver
time: 18

A **4 x 4 Sudoku** (digits 1 to 4, rows, columns and 2 x 2 boxes) shows every idea without thousands of steps. The board is a flat array of 16; `0` means empty. `fits(i, d)` checks digit `d` against cell `i`'s peers.

The solver, line by line:

```js
function solve() {
  const i = cells.indexOf(0);            // the first empty cell
  if (i === -1) return true;              // base case: none left, solved
  for (let d = 1; d <= 4; d++) {
    if (!fits(i, d)) continue;
    cells[i] = d;                          // guess
    if (solve()) return true;              // go deeper; solved? pass it up
    cells[i] = 0;                          // dead end: undo
  }
  return false;                            // nothing fits: tell the caller to undo
}
```

The `cells[i] = 0` line *is* the backtracking. Without it, a wrong guess would stay on the board and block every later attempt.

The page counts every **guess** and every **undo**, so you can see the solver's work.

```svg Each call fills one cell: guess a digit that fits, recurse, and undo on the way back out if the rest failed
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="11">
  <rect x="5" y="30" width="80" height="36" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="45" y="52" text-anchor="middle">find empty</text>
  <rect x="100" y="30" width="70" height="36" rx="8" fill="#fde68a" stroke="#ca8a04"/><text x="135" y="52" text-anchor="middle">guess d</text>
  <rect x="185" y="30" width="70" height="36" rx="8" fill="#6366f1"/><text x="220" y="52" text-anchor="middle" fill="#fff">solve()</text>
  <rect x="270" y="30" width="55" height="36" rx="8" fill="#fecaca" stroke="#ef4444"/><text x="297" y="52" text-anchor="middle">undo</text>
  <path d="M85 48 H96 M170 48 H181 M255 48 H266" stroke="#111" stroke-width="2"/>
  <path d="M297 66 Q200 98 135 68" fill="none" stroke="#ef4444" stroke-dasharray="4 3"/><text x="215" y="96" text-anchor="middle" fill="#b91c1c">next digit</text>
</svg>
```

check: js | the base case: no empty cell left | /if\s*\(\s*i\s*===\s*-1\s*\)\s*return\s+true/ | if (i === -1) return true;
check: js | going deeper | /if\s*\(\s*solve\(\)\s*\)\s*return\s+true/ | if (solve()) return true;
check: js | undoing a wrong guess | /cells\[\s*i\s*\]\s*=\s*0/ | cells[i] = 0;

quiz: What does `return false` at the end of `solve()` mean?
- [ ] The puzzle has no solution at all
- [x] No digit works in this cell given the guesses so far, so the caller must undo its guess
- [ ] The board is full
why: false travels back one level, and that level tries its next digit.

quiz: What would happen without `cells[i] = 0`?
- [ ] Nothing, it would still work
- [x] Wrong guesses would stay on the board and block later attempts
- [ ] The solver would run forever
why: Undo restores the board so the next attempt starts from the right state.

```js board
const START = [1, 0, 0, 0,
               0, 0, 3, 0,
               0, 4, 0, 0,
               0, 0, 0, 2];
let cells = [...START];
const row = (i) => Math.floor(i / 4);
const col = (i) => i % 4;
const box = (i) => Math.floor(row(i) / 2) * 2 * 4 + Math.floor(col(i) / 2) * 2;
const PEERS = cells.map((_, i) => cells.map((_, j) => j).filter((j) => j !== i && (row(j) === row(i) || col(j) === col(i) || box(j) === box(i))));
const fits = (i, d) => PEERS[i].every((j) => cells[j] !== d);

const area = document.getElementById('sudoku');
const grid = document.createElement('div');
grid.className = 'mini';
const stats = document.createElement('p');
stats.className = 'stats';
const solveBtn = document.createElement('button');
solveBtn.textContent = 'Solve';
area.replaceChildren(grid, solveBtn, stats);

function drawBoard(mark = {}) {
  grid.replaceChildren(...cells.map((v, i) => {
    const el = document.createElement('div');
    el.textContent = v || '';
    if (START[i]) el.className = 'given';
    else if (mark[i]) el.className = mark[i];
    return el;
  }));
}

drawBoard();
```

```js solve
let guesses = 0;
let undos = 0;
let moves = [];

function solve() {
  const i = cells.indexOf(0);
  if (i === -1) return true;
  for (let d = 1; d <= 4; d++) {
    if (!fits(i, d)) continue;
    cells[i] = d;
    guesses += 1;
    moves.push({ i, d });
    if (solve()) return true;
    cells[i] = 0;
    undos += 1;
    moves.push({ i, d: 0 });
  }
  return false;
}

solveBtn.addEventListener('click', () => {
  cells = [...START];
  guesses = 0;
  undos = 0;
  moves = [];
  const ok = solve();
  drawBoard();
  stats.textContent = ok ? `Solved with ${guesses} guesses and ${undos} undos.` : 'No solution.';
});
```

## Step: Watch it solve, and guess smarter
time: 15

The solver records every move, so the page can **replay** them slowly with `setTimeout`: yellow for a guess, red for an undo. You can see it walk into a dead end and back out.

Then one change makes solvers dramatically faster: instead of filling the **first** empty cell, fill the empty cell with the **fewest** digits that fit. If a cell has only one option, there's nothing to guess; if it has none, you've found a dead end immediately instead of many steps later. This is called the **minimum remaining values** rule, and the Sudoku Solver uses it (with the bitmasks from the last lesson to count options fast).

Press **Solve** (first empty cell) and **Solve smarter** (fewest options) and compare the guess counts.

```svg Picking the cell with the fewest options: a cell with 1 option needs no guess; 0 options is a dead end found early
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 90" font-family="sans-serif" font-size="12">
  <rect x="5" y="25" width="70" height="40" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="40" y="44" text-anchor="middle">3 options</text><text x="40" y="58" text-anchor="middle" font-size="10">first empty</text>
  <rect x="90" y="25" width="70" height="40" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="125" y="49" text-anchor="middle">2 options</text>
  <rect x="175" y="25" width="70" height="40" rx="8" fill="#bbf7d0" stroke="#16a34a" stroke-width="2"/><text x="210" y="44" text-anchor="middle">1 option</text><text x="210" y="58" text-anchor="middle" font-size="10">pick this</text>
  <text x="290" y="49" text-anchor="middle" fill="#334155">no guess</text>
</svg>
```

check: js | the emptiest-cell choice | /function\s+fewestOptions\s*\(/ | function fewestOptions() { ... }
check: js | replaying the moves with a timer | /setTimeout\(\s*\w+\s*,\s*\d+\s*\)/ | setTimeout(step, 250)

quiz: Why pick the empty cell with the fewest options?
- [x] Fewer choices means fewer wrong guesses, and a cell with no options reveals a dead end right away
- [ ] It's always the top-left cell
- [ ] It makes the board look nicer
why: Guessing where you have the least freedom cuts the search tree from the top.

quiz: Why are the moves replayed with setTimeout instead of drawn inside solve()?
- [ ] solve() can't touch the page
- [x] solve() finishes in a blink; recording moves and replaying them slowly lets you see each step
- [ ] setTimeout makes the solver correct
why: Separate the work (fast) from showing it (slow, on a timer), like the Game loops lesson.

```js solve
let guesses = 0;
let undos = 0;
let moves = [];

function solve() {
  const i = cells.indexOf(0);
  if (i === -1) return true;
  for (let d = 1; d <= 4; d++) {
    if (!fits(i, d)) continue;
    cells[i] = d;
    guesses += 1;
    moves.push({ i, d });
    if (solve()) return true;
    cells[i] = 0;
    undos += 1;
    moves.push({ i, d: 0 });
  }
  return false;
}
```

```js watch
function fewestOptions() {
  let best = -1;
  let bestCount = 5;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i]) continue;
    let n = 0;
    for (let d = 1; d <= 4; d++) if (fits(i, d)) n += 1;
    if (n < bestCount) { best = i; bestCount = n; }
  }
  return best;
}

function solveSmart() {
  const i = fewestOptions();
  if (i === -1) return true;
  for (let d = 1; d <= 4; d++) {
    if (!fits(i, d)) continue;
    cells[i] = d;
    guesses += 1;
    moves.push({ i, d });
    if (solveSmart()) return true;
    cells[i] = 0;
    undos += 1;
    moves.push({ i, d: 0 });
  }
  return false;
}

function replay(label) {
  const list = [...moves];
  cells = [...START];
  let k = 0;
  function step() {
    if (k >= list.length) { drawBoard(); stats.textContent = label; return; }
    const m = list[k++];
    cells[m.i] = m.d;
    drawBoard({ [m.i]: m.d ? 'try' : 'undo' });
    setTimeout(step, 250);
  }
  step();
}

function run(smart) {
  cells = [...START];
  guesses = 0;
  undos = 0;
  moves = [];
  const ok = smart ? solveSmart() : solve();
  replay(ok ? `${smart ? 'Fewest options first' : 'First empty cell'}: ${guesses} guesses, ${undos} undos.` : 'No solution.');
}

solveBtn.addEventListener('click', () => run(false));
const smartBtn = document.createElement('button');
smartBtn.textContent = 'Solve smarter';
smartBtn.addEventListener('click', () => run(true));
solveBtn.after(' ', smartBtn);
```

## Finish

You can solve puzzles by searching now. You learned:

- **Recursion** with a **base case**, and the **call stack**
- **Backtracking**: guess, go deeper, **undo** on the way back
- Counting **guesses and undos** to measure a solver's work
- **Fewest options first** to cut the search dramatically
- Doing the work fast and **replaying** it slowly with setTimeout

You've now learned every part of the **Sudoku Solver**: grids, bitmasks and backtracking. Build it next.

### Challenges

1. Make the 4 x 4 solver count *all* solutions instead of stopping at the first (keep going after the base case).
2. Solve the 8 queens puzzle with the same pattern: place a queen per row, undo when two attack each other.
3. Generate a maze by backtracking: from a cell, knock down a wall to a random unvisited neighbor, recurse, and back up when stuck.

### Next

The **Sudoku Solver** project.
