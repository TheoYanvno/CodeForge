---
id: input
title: Keyboard and swipe input
blocks-html: page
blocks-css: base
blocks-js: setup, state, turn, keys, swipe
goals: Listen for keydown events and read e.key; Map several keys to one action with a lookup object; Send every kind of input through one function so the rules live in one place; Stop the page from scrolling when arrow keys are used for a game; Detect a swipe on a phone from where a touch starts and ends
prereqs: The Game loops and timers lesson (state, update and draw)
---

## Session: Steering with keys and swipes

## Step: Events, and one door for every input
time: 10
kind: read

The browser tells your code when something happens by firing an **event**: a key goes down, a finger touches the screen, the mouse clicks. You ask to hear about one with `addEventListener`:

```js
document.addEventListener('keydown', (e) => {
  console.log(e.key);   // "ArrowUp", "w", " " (space) ...
});
```

The function gets an **event object** (`e`) with the details. For keys, `e.key` says which key it was.

### One door

A game can be steered by arrow keys, by W A S D, by swiping, maybe by on-screen buttons. If each of those changed the direction itself, the game's rules (like "the snake can't turn straight back into itself") would be copied four times, and sooner or later one copy would be wrong.

So every input goes through **one function**, `turn(direction)`. The keyboard and swipe code only work out *which* direction was asked for; `turn()` decides whether it's allowed.

```svg Arrow keys, W A S D and swipes all call turn(), which holds the rules and changes the state
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 170" font-family="sans-serif" font-size="12">
  <rect x="5" y="10" width="95" height="34" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="52" y="32" text-anchor="middle">Arrow keys</text>
  <rect x="5" y="66" width="95" height="34" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="52" y="88" text-anchor="middle">W A S D</text>
  <rect x="5" y="122" width="95" height="34" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="52" y="144" text-anchor="middle">Swipe</text>
  <rect x="140" y="62" width="80" height="42" rx="10" fill="#6366f1"/><text x="180" y="87" text-anchor="middle" fill="#fff">turn(dir)</text>
  <rect x="250" y="62" width="75" height="42" rx="10" fill="#dcfce7" stroke="#16a34a"/><text x="287" y="87" text-anchor="middle">state</text>
  <path d="M100 27 L138 72 M100 83 H138 M100 139 L138 94 M220 83 H246" stroke="#111" stroke-width="2"/>
  <text x="180" y="125" text-anchor="middle" fill="#334155">rules live here</text>
</svg>
```

## Step: turn(): the one place the rules live
time: 12

Directions are stored as a small object: how far to move in x and y each tick. `{ x: 1, y: 0 }` is right, `{ x: 0, y: -1 }` is up (remember, y grows downward on a canvas).

```js
const DIRS = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
  left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};
```

```svg The four directions as x and y steps; going right, a turn to the left would add up to zero
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" font-family="sans-serif" font-size="12">
  <circle cx="90" cy="75" r="6" fill="#111"/>
  <path d="M90 69 V25 M90 81 V125 M84 75 H40 M96 75 H140" stroke="#6366f1" stroke-width="3"/>
  <text x="70" y="18">up (0, -1)</text><text x="66" y="142">down (0, 1)</text>
  <text x="0" y="70">left</text><text x="0" y="86">(-1, 0)</text><text x="144" y="70">right</text><text x="144" y="86">(1, 0)</text>
  <text x="200" y="60" fill="#b91c1c">right + left</text><text x="200" y="78" fill="#b91c1c">= (0, 0)</text><text x="200" y="96" fill="#b91c1c">→ refused</text>
</svg>
```

`turn(name)` looks up the new direction and refuses a straight reverse: if you're going right, `left` would turn the snake back into its own body. Two directions are opposite when adding them gives zero in both x and y.

The buttons under the board call `turn()` too, so you can test the rule before any keyboard code exists.

check: js | a table of directions | /const\s+DIRS\s*=\s*\{/ | const DIRS = { up: {...}, down: {...}, left: {...}, right: {...} };
check: js | a turn() function | /function\s+turn\s*\(/ | function turn(name) { ... }
check: js | refusing a straight reverse | /\.x\s*\+\s*\w+\.x\s*===\s*0\s*&&[^;]*\.y\s*\+\s*\w+\.y\s*===\s*0/ | if (next.x + dir.x === 0 && next.y + dir.y === 0) return;

quiz: Going right (`{ x: 1, y: 0 }`), which turn does `turn()` refuse?
- [ ] up
- [ ] down
- [x] left
why: left is `{ x: -1, y: 0 }`; adding it to right gives `{ x: 0, y: 0 }`, a straight reverse.

quiz: Why do the on-screen buttons call `turn()` instead of setting the direction themselves?
- [x] So the no-reverse rule is in one place and every kind of input follows it
- [ ] Buttons can't change variables
- [ ] It makes the buttons look better
why: One door for all input means the rules can't get out of step between the keyboard, swipes and buttons.

```html page
<main>
  <h1>Steering</h1>
  <canvas id="board" width="300" height="300"></canvas>
  <p class="pad">
    <button data-dir="up">↑</button>
    <button data-dir="left">←</button>
    <button data-dir="down">↓</button>
    <button data-dir="right">→</button>
  </p>
  <p id="said">Use the buttons, the arrow keys or W A S D. On a phone, swipe on the board.</p>
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

h1, #said { text-align: center; max-width: 320px; }

canvas {
  display: block;
  max-width: 100%;
  border-radius: 8px;
  touch-action: none;
}

.pad {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.pad button { width: 48px; height: 40px; font-size: 1.2rem; }
```

```js setup
const board = document.getElementById('board');
const ctx = board.getContext('2d');
const CELL = 20;
const SIZE = board.width / CELL;
const said = document.getElementById('said');

function draw() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, board.width, board.height);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(pos.col * CELL + 2, pos.row * CELL + 2, CELL - 4, CELL - 4);
}

function update() {
  pos.col = (pos.col + dir.x + SIZE) % SIZE;
  pos.row = (pos.row + dir.y + SIZE) % SIZE;
}

function tick() {
  update();
  draw();
  setTimeout(tick, 200);
}
```

```js state
const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

let pos = { col: 7, row: 7 };
let dir = DIRS.right;
```

```js turn
function turn(name) {
  const next = DIRS[name];
  if (!next) return;
  if (next.x + dir.x === 0 && next.y + dir.y === 0) {
    said.textContent = `Can't turn straight back (${name})`;
    return;
  }
  dir = next;
  said.textContent = `Going ${name}`;
}

for (const b of document.querySelectorAll('[data-dir]')) {
  b.addEventListener('click', () => turn(b.dataset.dir));
}

tick();
```

## Step: The keyboard, through a lookup object
time: 15

Eight keys mean four directions. Instead of a long chain of `if (e.key === 'ArrowUp' || e.key === 'w')`, a **lookup object** maps each key to a direction name:

```js
const KEYS = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ... };
const name = KEYS[e.key];   // undefined for any other key
```

Adding a key later is one more entry, not more `if`s.

Arrow keys normally **scroll the page**, so the game would jump around while you play. `e.preventDefault()` stops that, but only for the keys the game uses; every other key keeps working normally, which matters for people who use the keyboard to get around the page.

`e.key` for letters depends on Caps Lock and Shift (`'w'` or `'W'`), so the code lowercases single letters first.

check: js | a lookup object for keys | /const\s+KEYS\s*=\s*\{[\s\S]*ArrowUp/ | const KEYS = { ArrowUp: 'up', w: 'up', ... };
check: js | a keydown listener | /addEventListener\(\s*['"]keydown['"]/ | document.addEventListener('keydown', (e) => { ... })
check: js | no page scrolling for game keys | /preventDefault\(\)/ | e.preventDefault();

quiz: Why is `preventDefault()` only called for keys in `KEYS`?
- [ ] It doesn't matter which keys
- [x] Game keys shouldn't scroll the page, but every other key should keep doing its normal job
- [ ] preventDefault only works on arrow keys
why: Blocking every key would break Tab, shortcuts and typing elsewhere on the page.

quiz: What does `KEYS['q']` give when `q` isn't in the object?
- [ ] An error
- [x] undefined, so the code knows it isn't a game key
- [ ] 'up'
why: Looking up a missing key in an object gives `undefined`, which the listener uses to ignore it.

```js keys
const KEYS = {
  ArrowUp: 'up', w: 'up',
  ArrowDown: 'down', s: 'down',
  ArrowLeft: 'left', a: 'left',
  ArrowRight: 'right', d: 'right',
};

document.addEventListener('keydown', (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const name = KEYS[key];
  if (!name) return;
  e.preventDefault();
  turn(name);
});
```

## Step: Swipes on a phone
time: 15

Phones have no arrow keys, so the game reads **swipes**. A swipe is a touch that starts in one place and ends in another:

1. On `touchstart`, remember where the finger went down.
2. On `touchend`, see how far it moved in x (`dx`) and y (`dy`).
3. Whichever is bigger decides the direction: mostly sideways is left or right, mostly up and down is up or down.
4. Ignore tiny movements (under 30 pixels), so a tap isn't read as a swipe.

```svg A swipe that moves 90 px right and 20 px down is mostly sideways, so it means right
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 140" font-family="sans-serif" font-size="12">
  <circle cx="60" cy="50" r="10" fill="#6366f1"/><text x="40" y="30">start</text>
  <circle cx="200" cy="80" r="10" fill="#16a34a"/><text x="210" y="100">end</text>
  <path d="M60 50 L196 79" stroke="#111" stroke-width="2"/>
  <path d="M60 120 H200" stroke="#ef4444" stroke-width="2"/><text x="100" y="135" fill="#ef4444">dx = 140 (bigger)</text>
  <path d="M250 50 V80" stroke="#ca8a04" stroke-width="2"/><text x="256" y="68" fill="#ca8a04">dy = 30</text>
</svg>
```

`touch-action: none` in the CSS stops the browser from scrolling or zooming while you swipe on the board. And swipes call the same `turn()`, so the no-reverse rule works on phones without one extra line.

check: js | where the touch starts | /addEventListener\(\s*['"]touchstart['"]/ | board.addEventListener('touchstart', ...)
check: js | where it ends | /addEventListener\(\s*['"]touchend['"]/ | board.addEventListener('touchend', ...)
check: js | comparing sideways and up-down distance | /Math\.abs\(\s*dx\s*\)\s*>\s*Math\.abs\(\s*dy\s*\)/ | if (Math.abs(dx) > Math.abs(dy)) ...

quiz: A swipe moves 10 px right and 120 px up. Which direction is it?
- [ ] right
- [x] up
- [ ] none, it's a tap
why: The up-down distance (120) is bigger than the sideways one (10), so it's up (dy is negative).

quiz: Why are movements under 30 px ignored?
- [ ] Phones can't measure small distances
- [x] So a tap or a shaky finger isn't read as a swipe
- [ ] To make the game harder
why: A minimum distance separates a deliberate swipe from a tap.

```js swipe
let touchStart = null;

board.addEventListener('touchstart', (e) => {
  const t = e.changedTouches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}, { passive: true });

board.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;   // a tap, not a swipe
  if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 'right' : 'left');
  else turn(dy > 0 ? 'down' : 'up');
});
```

## Finish

The player can steer now, on a keyboard or a phone. You learned:

- **Events** with `addEventListener`, and `e.key`
- **One door** for input: `turn()` holds the rules, everything else just asks
- A **lookup object** instead of a chain of `if`s
- `preventDefault()` for game keys only
- **Swipes** from `touchstart` and `touchend`, the bigger of `dx` and `dy`, and a minimum distance

### Challenges

1. Add the space bar to pause and resume (`e.key === ' '`), using a running flag like the Game loops lesson.
2. Queue turns: if two keys are pressed within one tick, keep the second one for the next tick instead of losing it.
3. Show a small arrow on the board in the direction the player is going.

### Next

**Saving a best score**: remember things after the page is closed.
