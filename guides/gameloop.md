---
id: gameloop
title: Game loops and timers
blocks-html: page
blocks-css: base
blocks-js: setup, state, update, loop, buttons
goals: Explain the update, draw, wait cycle every game runs; Keep the game's state in plain variables and change it only in update(); Run a loop with setTimeout and know how it differs from setInterval and requestAnimationFrame; Start, pause and restart a loop without ever running two at once; Change the speed of a game by changing one number
prereqs: The Canvas drawing lesson (a 2D context, cells and a draw() function)
---

## Session: A loop that moves things

## Step: What a game loop is
time: 10
kind: read

A game looks alive because it does the same three things over and over, many times a second:

1. **Update**: change the game's data. The snake moves one cell, the timer counts down, the ball falls a little.
2. **Draw**: paint the screen from that data (you did this in the Canvas lesson).
3. **Wait**: pause a moment, then start again.

That cycle is the **game loop**. Every game, from Snake to a 3D shooter, has one.

```svg The game loop: update the data, draw it, wait, and repeat
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" font-family="sans-serif" font-size="13">
  <circle cx="150" cy="100" r="70" fill="none" stroke="#c7d2fe" stroke-width="10"/>
  <rect x="105" y="10" width="90" height="34" rx="10" fill="#6366f1"/><text x="150" y="32" text-anchor="middle" fill="#fff">update</text>
  <rect x="205" y="120" width="90" height="34" rx="10" fill="#16a34a"/><text x="250" y="142" text-anchor="middle" fill="#fff">draw</text>
  <rect x="5" y="120" width="90" height="34" rx="10" fill="#ca8a04"/><text x="50" y="142" text-anchor="middle" fill="#fff">wait</text>
  <text x="150" y="105" text-anchor="middle" fill="#334155">repeat</text>
</svg>
```

### Three ways to wait in JavaScript

| Tool | What it does | Good for |
|---|---|---|
| `setTimeout(fn, ms)` | runs `fn` once, after `ms` milliseconds | step-by-step games like Snake, where speed can change |
| `setInterval(fn, ms)` | runs `fn` every `ms` milliseconds until stopped | simple clocks |
| `requestAnimationFrame(fn)` | runs `fn` before the screen's next refresh (about 60 times a second) | smooth animation |

Snake moves in whole cells a few times a second, and it gets faster as you score. With `setTimeout`, each tick schedules the next one, so changing the speed is just using a different number for the next wait. That's why this lesson uses it.

> JavaScript never "sleeps". `setTimeout` doesn't pause your code; it asks the browser to call your function later and carries on.

## Step: State, and an update that changes it
time: 12

The **state** is everything that describes the game right now. For this lesson it's one dot: its column and its row. `update()` is the only function that changes the state; `draw()` only reads it.

```js
let dot = { col: 0, row: 7 };

function update() {
  dot.col = (dot.col + 1) % SIZE;   // one cell right, back to 0 after the last column
}
```

The `%` (remainder) operator makes it wrap: on a 15-cell board, `(14 + 1) % 15` is `0`, so the dot jumps back to the left edge.

Click **Step** to run one update and one draw by hand. That *is* a game loop, done by you. The next step hands the clicking to a timer.

check: js | the state in a variable | /let\s+dot\s*=\s*\{/ | let dot = { col: 0, row: 7 };
check: js | an update() function | /function\s+update\s*\(\s*\)/ | function update() { ... }
check: js | wrapping with % | /%\s*SIZE/ | dot.col = (dot.col + 1) % SIZE;

quiz: On a 15-cell board, what is `(14 + 1) % 15`?
- [ ] 15
- [x] 0
- [ ] 1
why: 15 divided by 15 leaves a remainder of 0, so the dot wraps back to column 0.

quiz: Why is `update()` the only function that changes the state?
- [x] When something goes wrong, there's one place to look, and draw() can safely run any time
- [ ] JavaScript only allows one function to change a variable
- [ ] It makes the canvas draw faster
why: Keeping changes in one place and drawing as read-only makes bugs easy to find.

```html page
<main>
  <h1>Game loop</h1>
  <canvas id="board" width="300" height="300"></canvas>
  <p class="controls">
    <button id="step">Step</button>
    <button id="start">Start</button>
    <button id="stop">Pause</button>
    <label>Speed <input id="speed" type="range" min="50" max="600" value="250"></label>
  </p>
  <p id="status">Paused</p>
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

h1, #status { text-align: center; }

canvas {
  display: block;
  max-width: 100%;
  border-radius: 8px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

button { padding: 6px 14px; font: inherit; }
```

```js setup
const board = document.getElementById('board');
const ctx = board.getContext('2d');
const CELL = 20;
const SIZE = board.width / CELL;

function draw() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, board.width, board.height);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(dot.col * CELL + 2, dot.row * CELL + 2, CELL - 4, CELL - 4);
}
```

```js state
let dot = { col: 0, row: 7 };
```

```js update
function update() {
  dot.col = (dot.col + 1) % SIZE;
}

document.getElementById('step').addEventListener('click', () => {
  update();
  draw();
});

draw();
```

## Step: Letting a timer run the loop
time: 15

Now the loop runs itself. `tick()` does one update and one draw, then uses `setTimeout` to call **itself** again after `speed` milliseconds:

```js
function tick() {
  update();
  draw();
  timer = setTimeout(tick, speed);
}
```

```svg Each tick schedules the next one, so the next wait can use a new speed
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 80" font-family="sans-serif" font-size="12">
  <rect x="5" y="20" width="60" height="34" rx="8" fill="#6366f1"/><text x="35" y="42" text-anchor="middle" fill="#fff">tick</text>
  <rect x="130" y="20" width="60" height="34" rx="8" fill="#6366f1"/><text x="160" y="42" text-anchor="middle" fill="#fff">tick</text>
  <rect x="255" y="20" width="60" height="34" rx="8" fill="#6366f1"/><text x="285" y="42" text-anchor="middle" fill="#fff">tick</text>
  <path d="M65 37 H126 M190 37 H251" stroke="#111" stroke-width="2"/>
  <text x="97" y="72" text-anchor="middle">wait 250 ms</text><text x="222" y="72" text-anchor="middle">wait 120 ms</text>
</svg>
```

The value from `setTimeout` is a timer id. Saving it in `timer` lets you cancel the waiting call later, which is the next step.

Drag the **Speed** slider while it runs: the next wait uses the new number straight away. A smaller number means a shorter wait, so a faster game.

check: js | a tick() function | /function\s+tick\s*\(\s*\)/ | function tick() { update(); draw(); ... }
check: js | tick schedules itself | /setTimeout\(\s*tick\s*,/ | timer = setTimeout(tick, speed);

quiz: What happens if the speed changes from 250 to 120 while the loop runs?
- [ ] Nothing until the page reloads
- [x] The next wait is 120 ms, so the dot moves faster
- [ ] The loop stops
why: Each tick reads `speed` when it schedules the next tick, so the change applies right away.

quiz: Does `setTimeout(tick, 250)` pause the rest of your code for 250 ms?
- [ ] Yes, everything waits
- [x] No, it schedules tick for later and the code keeps running
- [ ] Only on slow computers
why: JavaScript doesn't sleep; the browser calls `tick` when the time is up.

```js loop
let timer = null;
let speed = 250;

function tick() {
  update();
  draw();
  timer = setTimeout(tick, speed);
}

document.getElementById('speed').addEventListener('input', (e) => {
  speed = Number(e.target.value);
});
```

```js buttons
document.getElementById('start').addEventListener('click', () => {
  tick();
});
```

## Step: Start and pause without two loops
time: 15

There's a bug in the last step: click **Start** twice and the dot moves twice as fast. Each click started *another* loop, and now two `tick` chains run at once.

```svg Clicking Start twice without a guard starts a second loop; the guard stops that
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" font-family="sans-serif" font-size="12">
  <text x="5" y="16" fill="#b91c1c">No guard: two chains of ticks</text>
  <g fill="#ef4444"><circle cx="20" cy="34" r="7"/><circle cx="70" cy="34" r="7"/><circle cx="120" cy="34" r="7"/><circle cx="170" cy="34" r="7"/>
  <circle cx="45" cy="52" r="7"/><circle cx="95" cy="52" r="7"/><circle cx="145" cy="52" r="7"/><circle cx="195" cy="52" r="7"/></g>
  <text x="5" y="86" fill="#15803d">With if (running) return: one chain</text>
  <g fill="#22c55e"><circle cx="20" cy="104" r="7"/><circle cx="70" cy="104" r="7"/><circle cx="120" cy="104" r="7"/><circle cx="170" cy="104" r="7"/></g>
</svg>
```

Two fixes:

- A `running` flag. `start()` does nothing if the loop is already running.
- `stop()` calls `clearTimeout(timer)`, which cancels the waiting tick, so the chain ends.

This is exactly how Snake starts, pauses with the space bar and restarts after a crash. A game that ever runs two loops speeds up mysteriously, and it's one of the most common game bugs.

check: js | a running flag that guards start | /if\s*\(\s*running\s*\)\s*return/ | if (running) return;
check: js | stopping with clearTimeout | /clearTimeout\(\s*timer\s*\)/ | clearTimeout(timer);

quiz: What does `clearTimeout(timer)` do?
- [x] Cancels the tick that was waiting to run, so the loop stops
- [ ] Clears the canvas
- [ ] Sets the speed back to the start
why: It cancels the scheduled call; with no next tick, the chain ends.

quiz: Why does clicking Start twice make an unguarded game faster?
- [ ] The browser doubles the speed setting
- [x] Two separate chains of ticks run, so update() runs twice as often
- [ ] setTimeout always runs twice
why: Each click starts its own chain. The running flag makes the second click do nothing.

```js buttons
let running = false;
const status = document.getElementById('status');

function start() {
  if (running) return;
  running = true;
  status.textContent = 'Running';
  tick();
}

function stop() {
  running = false;
  clearTimeout(timer);
  status.textContent = 'Paused';
}

document.getElementById('start').addEventListener('click', start);
document.getElementById('stop').addEventListener('click', stop);
```

## Finish

Your picture moves by itself now. You learned:

- The **game loop**: update, draw, wait, repeat
- **State** in plain variables, changed only in `update()`
- `setTimeout` loops that schedule themselves, and how they compare with `setInterval` and `requestAnimationFrame`
- Changing **speed** by changing one number
- A **running flag** and `clearTimeout`, so there's never more than one loop

### Challenges

1. Make the dot move down one row each time it wraps around, like a typewriter.
2. Add a frame counter: count ticks in the state and draw the number in a corner.
3. Rewrite the loop with `requestAnimationFrame` that only calls `update()` when enough time has passed since the last move.

### Next

**Keyboard and swipe input**: let the player steer.
