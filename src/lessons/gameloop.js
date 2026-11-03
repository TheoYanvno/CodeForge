// Built from guides/gameloop.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "gameloop",
 "title": "Game loops and timers",
 "goals": [
  "Explain the update, draw, wait cycle every game runs",
  "Keep the game's state in plain variables and change it only in update()",
  "Run a loop with setTimeout and know how it differs from setInterval and requestAnimationFrame",
  "Start, pause and restart a loop without ever running two at once",
  "Change the speed of a game by changing one number"
 ],
 "prereqs": [
  "The Canvas drawing lesson (a 2D context, cells and a draw() function)"
 ],
 "sessions": [
  {
   "title": "A loop that moves things",
   "from": 0,
   "to": 3
  }
 ],
 "start": {
  "html": {
   "page": ""
  },
  "css": {
   "base": ""
  },
  "js": {
   "setup": "",
   "state": "",
   "update": "",
   "loop": "",
   "buttons": ""
  }
 },
 "steps": [
  {
   "title": "What a game loop is",
   "body": "A game looks alive because it does the same three things over and over, many times a second:\n\n1. **Update**: change the game's data. The snake moves one cell, the timer counts down, the ball falls a little.\n2. **Draw**: paint the screen from that data (you did this in the Canvas lesson).\n3. **Wait**: pause a moment, then start again.\n\nThat cycle is the **game loop**. Every game, from Snake to a 3D shooter, has one.\n\n```svg The game loop: update the data, draw it, wait, and repeat\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 200\" font-family=\"sans-serif\" font-size=\"13\">\n  <circle cx=\"150\" cy=\"100\" r=\"70\" fill=\"none\" stroke=\"#c7d2fe\" stroke-width=\"10\"/>\n  <rect x=\"105\" y=\"10\" width=\"90\" height=\"34\" rx=\"10\" fill=\"#6366f1\"/><text x=\"150\" y=\"32\" text-anchor=\"middle\" fill=\"#fff\">update</text>\n  <rect x=\"205\" y=\"120\" width=\"90\" height=\"34\" rx=\"10\" fill=\"#16a34a\"/><text x=\"250\" y=\"142\" text-anchor=\"middle\" fill=\"#fff\">draw</text>\n  <rect x=\"5\" y=\"120\" width=\"90\" height=\"34\" rx=\"10\" fill=\"#ca8a04\"/><text x=\"50\" y=\"142\" text-anchor=\"middle\" fill=\"#fff\">wait</text>\n  <text x=\"150\" y=\"105\" text-anchor=\"middle\" fill=\"#334155\">repeat</text>\n</svg>\n```\n\n### Three ways to wait in JavaScript\n\n| Tool | What it does | Good for |\n|---|---|---|\n| `setTimeout(fn, ms)` | runs `fn` once, after `ms` milliseconds | step-by-step games like Snake, where speed can change |\n| `setInterval(fn, ms)` | runs `fn` every `ms` milliseconds until stopped | simple clocks |\n| `requestAnimationFrame(fn)` | runs `fn` before the screen's next refresh (about 60 times a second) | smooth animation |\n\nSnake moves in whole cells a few times a second, and it gets faster as you score. With `setTimeout`, each tick schedules the next one, so changing the speed is just using a different number for the next wait. That's why this lesson uses it.\n\n> JavaScript never \"sleeps\". `setTimeout` doesn't pause your code; it asks the browser to call your function later and carries on.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "State, and an update that changes it",
   "body": "The **state** is everything that describes the game right now. For this lesson it's one dot: its column and its row. `update()` is the only function that changes the state; `draw()` only reads it.\n\n```js\nlet dot = { col: 0, row: 7 };\n\nfunction update() {\n  dot.col = (dot.col + 1) % SIZE;   // one cell right, back to 0 after the last column\n}\n```\n\nThe `%` (remainder) operator makes it wrap: on a 15-cell board, `(14 + 1) % 15` is `0`, so the dot jumps back to the left edge.\n\nClick **Step** to run one update and one draw by hand. That *is* a game loop, done by you. The next step hands the clicking to a timer.",
   "checks": [
    {
     "pane": "js",
     "label": "the state in a variable",
     "test": "/let\\s+dot\\s*=\\s*\\{/",
     "hint": "let dot = { col: 0, row: 7 };"
    },
    {
     "pane": "js",
     "label": "an update() function",
     "test": "/function\\s+update\\s*\\(\\s*\\)/",
     "hint": "function update() { ... }"
    },
    {
     "pane": "js",
     "label": "wrapping with %",
     "test": "/%\\s*SIZE/",
     "hint": "dot.col = (dot.col + 1) % SIZE;"
    }
   ],
   "quiz": [
    {
     "q": "On a 15-cell board, what is `(14 + 1) % 15`?",
     "options": [
      "15",
      "0",
      "1"
     ],
     "answer": 1,
     "why": "15 divided by 15 leaves a remainder of 0, so the dot wraps back to column 0."
    },
    {
     "q": "Why is `update()` the only function that changes the state?",
     "options": [
      "When something goes wrong, there's one place to look, and draw() can safely run any time",
      "JavaScript only allows one function to change a variable",
      "It makes the canvas draw faster"
     ],
     "answer": 0,
     "why": "Keeping changes in one place and drawing as read-only makes bugs easy to find."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main>\n  <h1>Game loop</h1>\n  <canvas id=\"board\" width=\"300\" height=\"300\"></canvas>\n  <p class=\"controls\">\n    <button id=\"step\">Step</button>\n    <button id=\"start\">Start</button>\n    <button id=\"stop\">Pause</button>\n    <label>Speed <input id=\"speed\" type=\"range\" min=\"50\" max=\"600\" value=\"250\"></label>\n  </p>\n  <p id=\"status\">Paused</p>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #e2e8f0;\n}\n\nh1, #status { text-align: center; }\n\ncanvas {\n  display: block;\n  max-width: 100%;\n  border-radius: 8px;\n}\n\n.controls {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  justify-content: center;\n  align-items: center;\n}\n\nbutton { padding: 6px 14px; font: inherit; }"
   },
   "js": {
    "setup": "const board = document.getElementById('board');\nconst ctx = board.getContext('2d');\nconst CELL = 20;\nconst SIZE = board.width / CELL;\n\nfunction draw() {\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, board.width, board.height);\n  ctx.fillStyle = '#22c55e';\n  ctx.fillRect(dot.col * CELL + 2, dot.row * CELL + 2, CELL - 4, CELL - 4);\n}",
    "state": "let dot = { col: 0, row: 7 };",
    "update": "function update() {\n  dot.col = (dot.col + 1) % SIZE;\n}\n\ndocument.getElementById('step').addEventListener('click', () => {\n  update();\n  draw();\n});\n\ndraw();"
   }
  },
  {
   "title": "Letting a timer run the loop",
   "body": "Now the loop runs itself. `tick()` does one update and one draw, then uses `setTimeout` to call **itself** again after `speed` milliseconds:\n\n```js\nfunction tick() {\n  update();\n  draw();\n  timer = setTimeout(tick, speed);\n}\n```\n\n```svg Each tick schedules the next one, so the next wait can use a new speed\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"20\" width=\"60\" height=\"34\" rx=\"8\" fill=\"#6366f1\"/><text x=\"35\" y=\"42\" text-anchor=\"middle\" fill=\"#fff\">tick</text>\n  <rect x=\"130\" y=\"20\" width=\"60\" height=\"34\" rx=\"8\" fill=\"#6366f1\"/><text x=\"160\" y=\"42\" text-anchor=\"middle\" fill=\"#fff\">tick</text>\n  <rect x=\"255\" y=\"20\" width=\"60\" height=\"34\" rx=\"8\" fill=\"#6366f1\"/><text x=\"285\" y=\"42\" text-anchor=\"middle\" fill=\"#fff\">tick</text>\n  <path d=\"M65 37 H126 M190 37 H251\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"97\" y=\"72\" text-anchor=\"middle\">wait 250 ms</text><text x=\"222\" y=\"72\" text-anchor=\"middle\">wait 120 ms</text>\n</svg>\n```\n\nThe value from `setTimeout` is a timer id. Saving it in `timer` lets you cancel the waiting call later, which is the next step.\n\nDrag the **Speed** slider while it runs: the next wait uses the new number straight away. A smaller number means a shorter wait, so a faster game.",
   "checks": [
    {
     "pane": "js",
     "label": "a tick() function",
     "test": "/function\\s+tick\\s*\\(\\s*\\)/",
     "hint": "function tick() { update(); draw(); ... }"
    },
    {
     "pane": "js",
     "label": "tick schedules itself",
     "test": "/setTimeout\\(\\s*tick\\s*,/",
     "hint": "timer = setTimeout(tick, speed);"
    }
   ],
   "quiz": [
    {
     "q": "What happens if the speed changes from 250 to 120 while the loop runs?",
     "options": [
      "Nothing until the page reloads",
      "The next wait is 120 ms, so the dot moves faster",
      "The loop stops"
     ],
     "answer": 1,
     "why": "Each tick reads `speed` when it schedules the next tick, so the change applies right away."
    },
    {
     "q": "Does `setTimeout(tick, 250)` pause the rest of your code for 250 ms?",
     "options": [
      "Yes, everything waits",
      "No, it schedules tick for later and the code keeps running",
      "Only on slow computers"
     ],
     "answer": 1,
     "why": "JavaScript doesn't sleep; the browser calls `tick` when the time is up."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "loop": "let timer = null;\nlet speed = 250;\n\nfunction tick() {\n  update();\n  draw();\n  timer = setTimeout(tick, speed);\n}\n\ndocument.getElementById('speed').addEventListener('input', (e) => {\n  speed = Number(e.target.value);\n});",
    "buttons": "document.getElementById('start').addEventListener('click', () => {\n  tick();\n});"
   }
  },
  {
   "title": "Start and pause without two loops",
   "body": "There's a bug in the last step: click **Start** twice and the dot moves twice as fast. Each click started *another* loop, and now two `tick` chains run at once.\n\n```svg Clicking Start twice without a guard starts a second loop; the guard stops that\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <text x=\"5\" y=\"16\" fill=\"#b91c1c\">No guard: two chains of ticks</text>\n  <g fill=\"#ef4444\"><circle cx=\"20\" cy=\"34\" r=\"7\"/><circle cx=\"70\" cy=\"34\" r=\"7\"/><circle cx=\"120\" cy=\"34\" r=\"7\"/><circle cx=\"170\" cy=\"34\" r=\"7\"/>\n  <circle cx=\"45\" cy=\"52\" r=\"7\"/><circle cx=\"95\" cy=\"52\" r=\"7\"/><circle cx=\"145\" cy=\"52\" r=\"7\"/><circle cx=\"195\" cy=\"52\" r=\"7\"/></g>\n  <text x=\"5\" y=\"86\" fill=\"#15803d\">With if (running) return: one chain</text>\n  <g fill=\"#22c55e\"><circle cx=\"20\" cy=\"104\" r=\"7\"/><circle cx=\"70\" cy=\"104\" r=\"7\"/><circle cx=\"120\" cy=\"104\" r=\"7\"/><circle cx=\"170\" cy=\"104\" r=\"7\"/></g>\n</svg>\n```\n\nTwo fixes:\n\n- A `running` flag. `start()` does nothing if the loop is already running.\n- `stop()` calls `clearTimeout(timer)`, which cancels the waiting tick, so the chain ends.\n\nThis is exactly how Snake starts, pauses with the space bar and restarts after a crash. A game that ever runs two loops speeds up mysteriously, and it's one of the most common game bugs.",
   "checks": [
    {
     "pane": "js",
     "label": "a running flag that guards start",
     "test": "/if\\s*\\(\\s*running\\s*\\)\\s*return/",
     "hint": "if (running) return;"
    },
    {
     "pane": "js",
     "label": "stopping with clearTimeout",
     "test": "/clearTimeout\\(\\s*timer\\s*\\)/",
     "hint": "clearTimeout(timer);"
    }
   ],
   "quiz": [
    {
     "q": "What does `clearTimeout(timer)` do?",
     "options": [
      "Cancels the tick that was waiting to run, so the loop stops",
      "Clears the canvas",
      "Sets the speed back to the start"
     ],
     "answer": 0,
     "why": "It cancels the scheduled call; with no next tick, the chain ends."
    },
    {
     "q": "Why does clicking Start twice make an unguarded game faster?",
     "options": [
      "The browser doubles the speed setting",
      "Two separate chains of ticks run, so update() runs twice as often",
      "setTimeout always runs twice"
     ],
     "answer": 1,
     "why": "Each click starts its own chain. The running flag makes the second click do nothing."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "buttons": "let running = false;\nconst status = document.getElementById('status');\n\nfunction start() {\n  if (running) return;\n  running = true;\n  status.textContent = 'Running';\n  tick();\n}\n\nfunction stop() {\n  running = false;\n  clearTimeout(timer);\n  status.textContent = 'Paused';\n}\n\ndocument.getElementById('start').addEventListener('click', start);\ndocument.getElementById('stop').addEventListener('click', stop);"
   }
  }
 ],
 "finish": "Your picture moves by itself now. You learned:\n\n- The **game loop**: update, draw, wait, repeat\n- **State** in plain variables, changed only in `update()`\n- `setTimeout` loops that schedule themselves, and how they compare with `setInterval` and `requestAnimationFrame`\n- Changing **speed** by changing one number\n- A **running flag** and `clearTimeout`, so there's never more than one loop\n\n### Challenges\n\n1. Make the dot move down one row each time it wraps around, like a typewriter.\n2. Add a frame counter: count ticks in the state and draw the number in a corner.\n3. Rewrite the loop with `requestAnimationFrame` that only calls `update()` when enough time has passed since the last move.\n\n### Next\n\n**Keyboard and swipe input**: let the player steer."
};
