// Built from guides/input.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "input",
 "title": "Keyboard and swipe input",
 "goals": [
  "Listen for keydown events and read e.key",
  "Map several keys to one action with a lookup object",
  "Send every kind of input through one function so the rules live in one place",
  "Stop the page from scrolling when arrow keys are used for a game",
  "Detect a swipe on a phone from where a touch starts and ends"
 ],
 "prereqs": [
  "The Game loops and timers lesson (state, update and draw)"
 ],
 "sessions": [
  {
   "title": "Steering with keys and swipes",
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
   "turn": "",
   "keys": "",
   "swipe": ""
  }
 },
 "steps": [
  {
   "title": "Events, and one door for every input",
   "body": "The browser tells your code when something happens by firing an **event**: a key goes down, a finger touches the screen, the mouse clicks. You ask to hear about one with `addEventListener`:\n\n```js\ndocument.addEventListener('keydown', (e) => {\n  console.log(e.key);   // \"ArrowUp\", \"w\", \" \" (space) ...\n});\n```\n\nThe function gets an **event object** (`e`) with the details. For keys, `e.key` says which key it was.\n\n### One door\n\nA game can be steered by arrow keys, by W A S D, by swiping, maybe by on-screen buttons. If each of those changed the direction itself, the game's rules (like \"the snake can't turn straight back into itself\") would be copied four times, and sooner or later one copy would be wrong.\n\nSo every input goes through **one function**, `turn(direction)`. The keyboard and swipe code only work out *which* direction was asked for; `turn()` decides whether it's allowed.\n\n```svg Arrow keys, W A S D and swipes all call turn(), which holds the rules and changes the state\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 170\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"10\" width=\"95\" height=\"34\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"52\" y=\"32\" text-anchor=\"middle\">Arrow keys</text>\n  <rect x=\"5\" y=\"66\" width=\"95\" height=\"34\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"52\" y=\"88\" text-anchor=\"middle\">W A S D</text>\n  <rect x=\"5\" y=\"122\" width=\"95\" height=\"34\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"52\" y=\"144\" text-anchor=\"middle\">Swipe</text>\n  <rect x=\"140\" y=\"62\" width=\"80\" height=\"42\" rx=\"10\" fill=\"#6366f1\"/><text x=\"180\" y=\"87\" text-anchor=\"middle\" fill=\"#fff\">turn(dir)</text>\n  <rect x=\"250\" y=\"62\" width=\"75\" height=\"42\" rx=\"10\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"287\" y=\"87\" text-anchor=\"middle\">state</text>\n  <path d=\"M100 27 L138 72 M100 83 H138 M100 139 L138 94 M220 83 H246\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"180\" y=\"125\" text-anchor=\"middle\" fill=\"#334155\">rules live here</text>\n</svg>\n```",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "turn(): the one place the rules live",
   "body": "Directions are stored as a small object: how far to move in x and y each tick. `{ x: 1, y: 0 }` is right, `{ x: 0, y: -1 }` is up (remember, y grows downward on a canvas).\n\n```js\nconst DIRS = {\n  up: { x: 0, y: -1 }, down: { x: 0, y: 1 },\n  left: { x: -1, y: 0 }, right: { x: 1, y: 0 },\n};\n```\n\n```svg The four directions as x and y steps; going right, a turn to the left would add up to zero\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <circle cx=\"90\" cy=\"75\" r=\"6\" fill=\"#111\"/>\n  <path d=\"M90 69 V25 M90 81 V125 M84 75 H40 M96 75 H140\" stroke=\"#6366f1\" stroke-width=\"3\"/>\n  <text x=\"70\" y=\"18\">up (0, -1)</text><text x=\"66\" y=\"142\">down (0, 1)</text>\n  <text x=\"0\" y=\"70\">left</text><text x=\"0\" y=\"86\">(-1, 0)</text><text x=\"144\" y=\"70\">right</text><text x=\"144\" y=\"86\">(1, 0)</text>\n  <text x=\"200\" y=\"60\" fill=\"#b91c1c\">right + left</text><text x=\"200\" y=\"78\" fill=\"#b91c1c\">= (0, 0)</text><text x=\"200\" y=\"96\" fill=\"#b91c1c\">→ refused</text>\n</svg>\n```\n\n`turn(name)` looks up the new direction and refuses a straight reverse: if you're going right, `left` would turn the snake back into its own body. Two directions are opposite when adding them gives zero in both x and y.\n\nThe buttons under the board call `turn()` too, so you can test the rule before any keyboard code exists.",
   "checks": [
    {
     "pane": "js",
     "label": "a table of directions",
     "test": "/const\\s+DIRS\\s*=\\s*\\{/",
     "hint": "const DIRS = { up: {...}, down: {...}, left: {...}, right: {...} };"
    },
    {
     "pane": "js",
     "label": "a turn() function",
     "test": "/function\\s+turn\\s*\\(/",
     "hint": "function turn(name) { ... }"
    },
    {
     "pane": "js",
     "label": "refusing a straight reverse",
     "test": "/\\.x\\s*\\+\\s*\\w+\\.x\\s*===\\s*0\\s*&&[^;]*\\.y\\s*\\+\\s*\\w+\\.y\\s*===\\s*0/",
     "hint": "if (next.x + dir.x === 0 && next.y + dir.y === 0) return;"
    }
   ],
   "quiz": [
    {
     "q": "Going right (`{ x: 1, y: 0 }`), which turn does `turn()` refuse?",
     "options": [
      "up",
      "down",
      "left"
     ],
     "answer": 2,
     "why": "left is `{ x: -1, y: 0 }`; adding it to right gives `{ x: 0, y: 0 }`, a straight reverse."
    },
    {
     "q": "Why do the on-screen buttons call `turn()` instead of setting the direction themselves?",
     "options": [
      "So the no-reverse rule is in one place and every kind of input follows it",
      "Buttons can't change variables",
      "It makes the buttons look better"
     ],
     "answer": 0,
     "why": "One door for all input means the rules can't get out of step between the keyboard, swipes and buttons."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main>\n  <h1>Steering</h1>\n  <canvas id=\"board\" width=\"300\" height=\"300\"></canvas>\n  <p class=\"pad\">\n    <button data-dir=\"up\">↑</button>\n    <button data-dir=\"left\">←</button>\n    <button data-dir=\"down\">↓</button>\n    <button data-dir=\"right\">→</button>\n  </p>\n  <p id=\"said\">Use the buttons, the arrow keys or W A S D. On a phone, swipe on the board.</p>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #e2e8f0;\n}\n\nh1, #said { text-align: center; max-width: 320px; }\n\ncanvas {\n  display: block;\n  max-width: 100%;\n  border-radius: 8px;\n  touch-action: none;\n}\n\n.pad {\n  display: flex;\n  gap: 6px;\n  justify-content: center;\n}\n\n.pad button { width: 48px; height: 40px; font-size: 1.2rem; }"
   },
   "js": {
    "setup": "const board = document.getElementById('board');\nconst ctx = board.getContext('2d');\nconst CELL = 20;\nconst SIZE = board.width / CELL;\nconst said = document.getElementById('said');\n\nfunction draw() {\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, board.width, board.height);\n  ctx.fillStyle = '#22c55e';\n  ctx.fillRect(pos.col * CELL + 2, pos.row * CELL + 2, CELL - 4, CELL - 4);\n}\n\nfunction update() {\n  pos.col = (pos.col + dir.x + SIZE) % SIZE;\n  pos.row = (pos.row + dir.y + SIZE) % SIZE;\n}\n\nfunction tick() {\n  update();\n  draw();\n  setTimeout(tick, 200);\n}",
    "state": "const DIRS = {\n  up: { x: 0, y: -1 },\n  down: { x: 0, y: 1 },\n  left: { x: -1, y: 0 },\n  right: { x: 1, y: 0 },\n};\n\nlet pos = { col: 7, row: 7 };\nlet dir = DIRS.right;",
    "turn": "function turn(name) {\n  const next = DIRS[name];\n  if (!next) return;\n  if (next.x + dir.x === 0 && next.y + dir.y === 0) {\n    said.textContent = `Can't turn straight back (${name})`;\n    return;\n  }\n  dir = next;\n  said.textContent = `Going ${name}`;\n}\n\nfor (const b of document.querySelectorAll('[data-dir]')) {\n  b.addEventListener('click', () => turn(b.dataset.dir));\n}\n\ntick();"
   }
  },
  {
   "title": "The keyboard, through a lookup object",
   "body": "Eight keys mean four directions. Instead of a long chain of `if (e.key === 'ArrowUp' || e.key === 'w')`, a **lookup object** maps each key to a direction name:\n\n```js\nconst KEYS = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ... };\nconst name = KEYS[e.key];   // undefined for any other key\n```\n\nAdding a key later is one more entry, not more `if`s.\n\nArrow keys normally **scroll the page**, so the game would jump around while you play. `e.preventDefault()` stops that, but only for the keys the game uses; every other key keeps working normally, which matters for people who use the keyboard to get around the page.\n\n`e.key` for letters depends on Caps Lock and Shift (`'w'` or `'W'`), so the code lowercases single letters first.",
   "checks": [
    {
     "pane": "js",
     "label": "a lookup object for keys",
     "test": "/const\\s+KEYS\\s*=\\s*\\{[\\s\\S]*ArrowUp/",
     "hint": "const KEYS = { ArrowUp: 'up', w: 'up', ... };"
    },
    {
     "pane": "js",
     "label": "a keydown listener",
     "test": "/addEventListener\\(\\s*['\"]keydown['\"]/",
     "hint": "document.addEventListener('keydown', (e) => { ... })"
    },
    {
     "pane": "js",
     "label": "no page scrolling for game keys",
     "test": "/preventDefault\\(\\)/",
     "hint": "e.preventDefault();"
    }
   ],
   "quiz": [
    {
     "q": "Why is `preventDefault()` only called for keys in `KEYS`?",
     "options": [
      "It doesn't matter which keys",
      "Game keys shouldn't scroll the page, but every other key should keep doing its normal job",
      "preventDefault only works on arrow keys"
     ],
     "answer": 1,
     "why": "Blocking every key would break Tab, shortcuts and typing elsewhere on the page."
    },
    {
     "q": "What does `KEYS['q']` give when `q` isn't in the object?",
     "options": [
      "An error",
      "undefined, so the code knows it isn't a game key",
      "'up'"
     ],
     "answer": 1,
     "why": "Looking up a missing key in an object gives `undefined`, which the listener uses to ignore it."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "keys": "const KEYS = {\n  ArrowUp: 'up', w: 'up',\n  ArrowDown: 'down', s: 'down',\n  ArrowLeft: 'left', a: 'left',\n  ArrowRight: 'right', d: 'right',\n};\n\ndocument.addEventListener('keydown', (e) => {\n  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;\n  const name = KEYS[key];\n  if (!name) return;\n  e.preventDefault();\n  turn(name);\n});"
   }
  },
  {
   "title": "Swipes on a phone",
   "body": "Phones have no arrow keys, so the game reads **swipes**. A swipe is a touch that starts in one place and ends in another:\n\n1. On `touchstart`, remember where the finger went down.\n2. On `touchend`, see how far it moved in x (`dx`) and y (`dy`).\n3. Whichever is bigger decides the direction: mostly sideways is left or right, mostly up and down is up or down.\n4. Ignore tiny movements (under 30 pixels), so a tap isn't read as a swipe.\n\n```svg A swipe that moves 90 px right and 20 px down is mostly sideways, so it means right\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 140\" font-family=\"sans-serif\" font-size=\"12\">\n  <circle cx=\"60\" cy=\"50\" r=\"10\" fill=\"#6366f1\"/><text x=\"40\" y=\"30\">start</text>\n  <circle cx=\"200\" cy=\"80\" r=\"10\" fill=\"#16a34a\"/><text x=\"210\" y=\"100\">end</text>\n  <path d=\"M60 50 L196 79\" stroke=\"#111\" stroke-width=\"2\"/>\n  <path d=\"M60 120 H200\" stroke=\"#ef4444\" stroke-width=\"2\"/><text x=\"100\" y=\"135\" fill=\"#ef4444\">dx = 140 (bigger)</text>\n  <path d=\"M250 50 V80\" stroke=\"#ca8a04\" stroke-width=\"2\"/><text x=\"256\" y=\"68\" fill=\"#ca8a04\">dy = 30</text>\n</svg>\n```\n\n`touch-action: none` in the CSS stops the browser from scrolling or zooming while you swipe on the board. And swipes call the same `turn()`, so the no-reverse rule works on phones without one extra line.",
   "checks": [
    {
     "pane": "js",
     "label": "where the touch starts",
     "test": "/addEventListener\\(\\s*['\"]touchstart['\"]/",
     "hint": "board.addEventListener('touchstart', ...)"
    },
    {
     "pane": "js",
     "label": "where it ends",
     "test": "/addEventListener\\(\\s*['\"]touchend['\"]/",
     "hint": "board.addEventListener('touchend', ...)"
    },
    {
     "pane": "js",
     "label": "comparing sideways and up-down distance",
     "test": "/Math\\.abs\\(\\s*dx\\s*\\)\\s*>\\s*Math\\.abs\\(\\s*dy\\s*\\)/",
     "hint": "if (Math.abs(dx) > Math.abs(dy)) ..."
    }
   ],
   "quiz": [
    {
     "q": "A swipe moves 10 px right and 120 px up. Which direction is it?",
     "options": [
      "right",
      "up",
      "none, it's a tap"
     ],
     "answer": 1,
     "why": "The up-down distance (120) is bigger than the sideways one (10), so it's up (dy is negative)."
    },
    {
     "q": "Why are movements under 30 px ignored?",
     "options": [
      "Phones can't measure small distances",
      "So a tap or a shaky finger isn't read as a swipe",
      "To make the game harder"
     ],
     "answer": 1,
     "why": "A minimum distance separates a deliberate swipe from a tap."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "swipe": "let touchStart = null;\n\nboard.addEventListener('touchstart', (e) => {\n  const t = e.changedTouches[0];\n  touchStart = { x: t.clientX, y: t.clientY };\n}, { passive: true });\n\nboard.addEventListener('touchend', (e) => {\n  if (!touchStart) return;\n  const t = e.changedTouches[0];\n  const dx = t.clientX - touchStart.x;\n  const dy = t.clientY - touchStart.y;\n  touchStart = null;\n  if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;   // a tap, not a swipe\n  if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 'right' : 'left');\n  else turn(dy > 0 ? 'down' : 'up');\n});"
   }
  }
 ],
 "finish": "The player can steer now, on a keyboard or a phone. You learned:\n\n- **Events** with `addEventListener`, and `e.key`\n- **One door** for input: `turn()` holds the rules, everything else just asks\n- A **lookup object** instead of a chain of `if`s\n- `preventDefault()` for game keys only\n- **Swipes** from `touchstart` and `touchend`, the bigger of `dx` and `dy`, and a minimum distance\n\n### Challenges\n\n1. Add the space bar to pause and resume (`e.key === ' '`), using a running flag like the Game loops lesson.\n2. Queue turns: if two keys are pressed within one tick, keep the second one for the next tick instead of losing it.\n3. Show a small arrow on the board in the direction the player is going.\n\n### Next\n\n**Saving a best score**: remember things after the page is closed."
};
