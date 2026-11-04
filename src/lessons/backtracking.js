// Built from guides/backtracking.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "backtracking",
 "title": "Recursion and backtracking",
 "goals": [
  "Explain recursion: a function that calls itself, with a base case that stops it",
  "Read the call stack and know why every recursion needs a way out",
  "Solve a puzzle by backtracking: guess, go deeper, and undo when stuck",
  "Count guesses and backtracks to see how much work a solver does",
  "Cut the work hugely by guessing where there are fewest choices"
 ],
 "prereqs": [
  "The Grids as 2D arrays lesson (flat boards and peers) and the Game loops and timers lesson (setTimeout)"
 ],
 "sessions": [
  {
   "title": "Guess, check, undo",
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
   "recursion": "",
   "board": "",
   "solve": "",
   "watch": ""
  }
 },
 "steps": [
  {
   "title": "Recursion and backtracking",
   "body": "**Recursion** is a function that calls itself to solve a smaller piece of the same problem. It needs two parts:\n\n1. A **base case**: an answer simple enough to give straight away, which stops the calls.\n2. A **recursive case**: do one small step, then call yourself on what's left.\n\n```js\nfunction countdown(n) {\n  if (n === 0) return ['Liftoff!'];   // base case\n  return [n, ...countdown(n - 1)];    // one step, then the rest\n}\n```\n\nEach call waits for the one it made, so they pile up on the **call stack** and then finish in reverse order. Forget the base case and the stack keeps growing until the browser stops it with \"Maximum call stack size exceeded\".\n\n### Backtracking\n\n**Backtracking** is recursion for puzzles. To fill a Sudoku: find an empty cell, try a digit that fits, and *recursively* solve the rest. If the rest can't be solved, **undo** that digit and try the next one. If no digit works, return \"stuck\" so the call before you undoes *its* guess.\n\n```svg Backtracking as a tree: try a digit, go deeper; at a dead end, undo and try the next branch\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 160\" font-family=\"sans-serif\" font-size=\"11\">\n  <circle cx=\"165\" cy=\"18\" r=\"12\" fill=\"#6366f1\"/><text x=\"165\" y=\"22\" text-anchor=\"middle\" fill=\"#fff\">A</text>\n  <circle cx=\"90\" cy=\"70\" r=\"12\" fill=\"#a5b4fc\"/><text x=\"90\" y=\"74\" text-anchor=\"middle\">1</text>\n  <circle cx=\"240\" cy=\"70\" r=\"12\" fill=\"#a5b4fc\"/><text x=\"240\" y=\"74\" text-anchor=\"middle\">2</text>\n  <circle cx=\"50\" cy=\"125\" r=\"12\" fill=\"#fecaca\"/><text x=\"50\" y=\"129\" text-anchor=\"middle\">✗</text>\n  <circle cx=\"130\" cy=\"125\" r=\"12\" fill=\"#fecaca\"/><text x=\"130\" y=\"129\" text-anchor=\"middle\">✗</text>\n  <circle cx=\"240\" cy=\"125\" r=\"12\" fill=\"#bbf7d0\"/><text x=\"240\" y=\"129\" text-anchor=\"middle\">✓</text>\n  <path d=\"M157 27 L98 61 M173 27 L232 61 M84 80 L56 115 M96 80 L124 115 M240 82 V113\" stroke=\"#475569\" stroke-width=\"2\"/>\n  <text x=\"10\" y=\"155\" fill=\"#b91c1c\">both dead ends → undo 1</text><text x=\"200\" y=\"155\" fill=\"#15803d\">try 2 → solved</text>\n</svg>\n```\n\nIt's like walking a maze with one rule: when you hit a wall, go back to the last fork and take the next path. It always finds a solution if there is one.",
   "session": 0,
   "minutes": 12,
   "kind": "read"
  },
  {
   "title": "A function that calls itself",
   "body": "Start with recursion on its own. `countdown(n)` returns a list, and the page shows each call going onto the stack and coming back off, with its depth:\n\n- the calls go **in**: countdown(5), countdown(4), … countdown(0)\n- the base case answers first\n- the answers come back **out** in reverse order\n\nChange the number and watch the stack. The page refuses numbers over 500 instead of letting the stack overflow, and that's the second lesson: recursion depth has limits, so a recursive solution should only go as deep as the problem really needs (81 levels at most for a Sudoku).",
   "checks": [
    {
     "pane": "js",
     "label": "a base case that stops the calls",
     "test": "/if\\s*\\(\\s*n\\s*===\\s*0\\s*\\)[\\s\\S]{0,200}?return\\s+\\[\\s*['\"]Liftoff/",
     "hint": "if (n === 0) { ... return ['Liftoff!']; }"
    },
    {
     "pane": "js",
     "label": "the function calls itself on a smaller problem",
     "test": "/countdown\\(\\s*n\\s*-\\s*1/",
     "hint": "countdown(n - 1, depth + 1)"
    }
   ],
   "quiz": [
    {
     "q": "What happens if `countdown` has no base case?",
     "options": [
      "It returns an empty list",
      "It calls itself forever until the browser stops it: \"Maximum call stack size exceeded\"",
      "It counts down to 0 anyway"
     ],
     "answer": 1,
     "why": "Without a base case nothing ever stops the calls, and the stack runs out of room."
    },
    {
     "q": "Which call finishes first?",
     "options": [
      "countdown(5), the first one made",
      "countdown(0), the base case, the last one made",
      "They all finish at once"
     ],
     "answer": 1,
     "why": "Each call waits for the one it made, so the deepest call returns first."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main class=\"card\">\n  <h1>Recursion</h1>\n  <p class=\"row\"><label>n <input id=\"n\" type=\"number\" value=\"5\" min=\"0\" max=\"500\"></label></p>\n  <ol id=\"stack\" class=\"stack\"></ol>\n  <section id=\"sudoku\"></section>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: start center;\n  padding: 20px 0;\n  font-family: system-ui, sans-serif;\n  background: #eef2ff;\n  color: #1e1b4b;\n}\n\n.card { width: min(460px, 100% - 24px); padding: 16px; background: #fff; border-radius: 16px; }\nh1 { margin-top: 0; font-size: 1.3rem; }\ninput, button { font: inherit; padding: 6px 10px; }\n.stack { max-height: 180px; overflow: auto; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .8rem; }\n.stack .out { color: #15803d; }\n.mini { display: grid; grid-template-columns: repeat(4, 44px); gap: 2px; margin: 10px 0; }\n.mini div { height: 44px; display: grid; place-items: center; font-size: 1.2rem; font-weight: 700; background: #e0e7ff; border-radius: 6px; }\n.mini div.given { background: #c7d2fe; color: #312e81; }\n.mini div.try { background: #fde68a; }\n.mini div.undo { background: #fecaca; }\n.mini div:nth-child(4n + 2) { margin-right: 6px; }\n.mini div:nth-child(n + 5):nth-child(-n + 8) { margin-bottom: 6px; }\n.stats { font-size: .9rem; }"
   },
   "js": {
    "recursion": "const stackEl = document.getElementById('stack');\n\nfunction countdown(n, depth = 0, log = []) {\n  log.push({ text: `${'  '.repeat(depth)}→ countdown(${n})`, out: false });\n  if (n === 0) {\n    log.push({ text: `${'  '.repeat(depth)}← base case: ['Liftoff!']`, out: true });\n    return ['Liftoff!'];\n  }\n  const rest = countdown(n - 1, depth + 1, log);\n  log.push({ text: `${'  '.repeat(depth)}← [${n}, …${rest.length} more]`, out: true });\n  return [n, ...rest];\n}\n\nfunction showStack() {\n  const n = Number(document.getElementById('n').value);\n  if (!Number.isInteger(n) || n < 0 || n > 500) { stackEl.textContent = 'Pick a whole number from 0 to 500.'; return; }\n  const log = [];\n  const result = countdown(n, 0, log);\n  stackEl.replaceChildren(...log.map((l) => {\n    const li = document.createElement('li');\n    li.textContent = l.text;\n    if (l.out) li.className = 'out';\n    return li;\n  }));\n  stackEl.title = result.join(' ');\n}\n\ndocument.getElementById('n').addEventListener('input', showStack);\nshowStack();"
   }
  },
  {
   "title": "A backtracking solver",
   "body": "A **4 x 4 Sudoku** (digits 1 to 4, rows, columns and 2 x 2 boxes) shows every idea without thousands of steps. The board is a flat array of 16; `0` means empty. `fits(i, d)` checks digit `d` against cell `i`'s peers.\n\nThe solver, line by line:\n\n```js\nfunction solve() {\n  const i = cells.indexOf(0);            // the first empty cell\n  if (i === -1) return true;              // base case: none left, solved\n  for (let d = 1; d <= 4; d++) {\n    if (!fits(i, d)) continue;\n    cells[i] = d;                          // guess\n    if (solve()) return true;              // go deeper; solved? pass it up\n    cells[i] = 0;                          // dead end: undo\n  }\n  return false;                            // nothing fits: tell the caller to undo\n}\n```\n\nThe `cells[i] = 0` line *is* the backtracking. Without it, a wrong guess would stay on the board and block every later attempt.\n\nThe page counts every **guess** and every **undo**, so you can see the solver's work.\n\n```svg Each call fills one cell: guess a digit that fits, recurse, and undo on the way back out if the rest failed\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"30\" width=\"80\" height=\"36\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"45\" y=\"52\" text-anchor=\"middle\">find empty</text>\n  <rect x=\"100\" y=\"30\" width=\"70\" height=\"36\" rx=\"8\" fill=\"#fde68a\" stroke=\"#ca8a04\"/><text x=\"135\" y=\"52\" text-anchor=\"middle\">guess d</text>\n  <rect x=\"185\" y=\"30\" width=\"70\" height=\"36\" rx=\"8\" fill=\"#6366f1\"/><text x=\"220\" y=\"52\" text-anchor=\"middle\" fill=\"#fff\">solve()</text>\n  <rect x=\"270\" y=\"30\" width=\"55\" height=\"36\" rx=\"8\" fill=\"#fecaca\" stroke=\"#ef4444\"/><text x=\"297\" y=\"52\" text-anchor=\"middle\">undo</text>\n  <path d=\"M85 48 H96 M170 48 H181 M255 48 H266\" stroke=\"#111\" stroke-width=\"2\"/>\n  <path d=\"M297 66 Q200 98 135 68\" fill=\"none\" stroke=\"#ef4444\" stroke-dasharray=\"4 3\"/><text x=\"215\" y=\"96\" text-anchor=\"middle\" fill=\"#b91c1c\">next digit</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "the base case: no empty cell left",
     "test": "/if\\s*\\(\\s*i\\s*===\\s*-1\\s*\\)\\s*return\\s+true/",
     "hint": "if (i === -1) return true;"
    },
    {
     "pane": "js",
     "label": "going deeper",
     "test": "/if\\s*\\(\\s*solve\\(\\)\\s*\\)\\s*return\\s+true/",
     "hint": "if (solve()) return true;"
    },
    {
     "pane": "js",
     "label": "undoing a wrong guess",
     "test": "/cells\\[\\s*i\\s*\\]\\s*=\\s*0/",
     "hint": "cells[i] = 0;"
    }
   ],
   "quiz": [
    {
     "q": "What does `return false` at the end of `solve()` mean?",
     "options": [
      "The puzzle has no solution at all",
      "No digit works in this cell given the guesses so far, so the caller must undo its guess",
      "The board is full"
     ],
     "answer": 1,
     "why": "false travels back one level, and that level tries its next digit."
    },
    {
     "q": "What would happen without `cells[i] = 0`?",
     "options": [
      "Nothing, it would still work",
      "Wrong guesses would stay on the board and block later attempts",
      "The solver would run forever"
     ],
     "answer": 1,
     "why": "Undo restores the board so the next attempt starts from the right state."
    }
   ],
   "session": 0,
   "minutes": 18,
   "js": {
    "board": "const START = [1, 0, 0, 0,\n               0, 0, 3, 0,\n               0, 4, 0, 0,\n               0, 0, 0, 2];\nlet cells = [...START];\nconst row = (i) => Math.floor(i / 4);\nconst col = (i) => i % 4;\nconst box = (i) => Math.floor(row(i) / 2) * 2 * 4 + Math.floor(col(i) / 2) * 2;\nconst PEERS = cells.map((_, i) => cells.map((_, j) => j).filter((j) => j !== i && (row(j) === row(i) || col(j) === col(i) || box(j) === box(i))));\nconst fits = (i, d) => PEERS[i].every((j) => cells[j] !== d);\n\nconst area = document.getElementById('sudoku');\nconst grid = document.createElement('div');\ngrid.className = 'mini';\nconst stats = document.createElement('p');\nstats.className = 'stats';\nconst solveBtn = document.createElement('button');\nsolveBtn.textContent = 'Solve';\narea.replaceChildren(grid, solveBtn, stats);\n\nfunction drawBoard(mark = {}) {\n  grid.replaceChildren(...cells.map((v, i) => {\n    const el = document.createElement('div');\n    el.textContent = v || '';\n    if (START[i]) el.className = 'given';\n    else if (mark[i]) el.className = mark[i];\n    return el;\n  }));\n}\n\ndrawBoard();",
    "solve": "let guesses = 0;\nlet undos = 0;\nlet moves = [];\n\nfunction solve() {\n  const i = cells.indexOf(0);\n  if (i === -1) return true;\n  for (let d = 1; d <= 4; d++) {\n    if (!fits(i, d)) continue;\n    cells[i] = d;\n    guesses += 1;\n    moves.push({ i, d });\n    if (solve()) return true;\n    cells[i] = 0;\n    undos += 1;\n    moves.push({ i, d: 0 });\n  }\n  return false;\n}\n\nsolveBtn.addEventListener('click', () => {\n  cells = [...START];\n  guesses = 0;\n  undos = 0;\n  moves = [];\n  const ok = solve();\n  drawBoard();\n  stats.textContent = ok ? `Solved with ${guesses} guesses and ${undos} undos.` : 'No solution.';\n});"
   }
  },
  {
   "title": "Watch it solve, and guess smarter",
   "body": "The solver records every move, so the page can **replay** them slowly with `setTimeout`: yellow for a guess, red for an undo. You can see it walk into a dead end and back out.\n\nThen one change makes solvers dramatically faster: instead of filling the **first** empty cell, fill the empty cell with the **fewest** digits that fit. If a cell has only one option, there's nothing to guess; if it has none, you've found a dead end immediately instead of many steps later. This is called the **minimum remaining values** rule, and the Sudoku Solver uses it (with the bitmasks from the last lesson to count options fast).\n\nPress **Solve** (first empty cell) and **Solve smarter** (fewest options) and compare the guess counts.\n\n```svg Picking the cell with the fewest options: a cell with 1 option needs no guess; 0 options is a dead end found early\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"25\" width=\"70\" height=\"40\" rx=\"8\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"40\" y=\"44\" text-anchor=\"middle\">3 options</text><text x=\"40\" y=\"58\" text-anchor=\"middle\" font-size=\"10\">first empty</text>\n  <rect x=\"90\" y=\"25\" width=\"70\" height=\"40\" rx=\"8\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"125\" y=\"49\" text-anchor=\"middle\">2 options</text>\n  <rect x=\"175\" y=\"25\" width=\"70\" height=\"40\" rx=\"8\" fill=\"#bbf7d0\" stroke=\"#16a34a\" stroke-width=\"2\"/><text x=\"210\" y=\"44\" text-anchor=\"middle\">1 option</text><text x=\"210\" y=\"58\" text-anchor=\"middle\" font-size=\"10\">pick this</text>\n  <text x=\"290\" y=\"49\" text-anchor=\"middle\" fill=\"#334155\">no guess</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "the emptiest-cell choice",
     "test": "/function\\s+fewestOptions\\s*\\(/",
     "hint": "function fewestOptions() { ... }"
    },
    {
     "pane": "js",
     "label": "replaying the moves with a timer",
     "test": "/setTimeout\\(\\s*\\w+\\s*,\\s*\\d+\\s*\\)/",
     "hint": "setTimeout(step, 250)"
    }
   ],
   "quiz": [
    {
     "q": "Why pick the empty cell with the fewest options?",
     "options": [
      "Fewer choices means fewer wrong guesses, and a cell with no options reveals a dead end right away",
      "It's always the top-left cell",
      "It makes the board look nicer"
     ],
     "answer": 0,
     "why": "Guessing where you have the least freedom cuts the search tree from the top."
    },
    {
     "q": "Why are the moves replayed with setTimeout instead of drawn inside solve()?",
     "options": [
      "solve() can't touch the page",
      "solve() finishes in a blink; recording moves and replaying them slowly lets you see each step",
      "setTimeout makes the solver correct"
     ],
     "answer": 1,
     "why": "Separate the work (fast) from showing it (slow, on a timer), like the Game loops lesson."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "solve": "let guesses = 0;\nlet undos = 0;\nlet moves = [];\n\nfunction solve() {\n  const i = cells.indexOf(0);\n  if (i === -1) return true;\n  for (let d = 1; d <= 4; d++) {\n    if (!fits(i, d)) continue;\n    cells[i] = d;\n    guesses += 1;\n    moves.push({ i, d });\n    if (solve()) return true;\n    cells[i] = 0;\n    undos += 1;\n    moves.push({ i, d: 0 });\n  }\n  return false;\n}",
    "watch": "function fewestOptions() {\n  let best = -1;\n  let bestCount = 5;\n  for (let i = 0; i < cells.length; i++) {\n    if (cells[i]) continue;\n    let n = 0;\n    for (let d = 1; d <= 4; d++) if (fits(i, d)) n += 1;\n    if (n < bestCount) { best = i; bestCount = n; }\n  }\n  return best;\n}\n\nfunction solveSmart() {\n  const i = fewestOptions();\n  if (i === -1) return true;\n  for (let d = 1; d <= 4; d++) {\n    if (!fits(i, d)) continue;\n    cells[i] = d;\n    guesses += 1;\n    moves.push({ i, d });\n    if (solveSmart()) return true;\n    cells[i] = 0;\n    undos += 1;\n    moves.push({ i, d: 0 });\n  }\n  return false;\n}\n\nfunction replay(label) {\n  const list = [...moves];\n  cells = [...START];\n  let k = 0;\n  function step() {\n    if (k >= list.length) { drawBoard(); stats.textContent = label; return; }\n    const m = list[k++];\n    cells[m.i] = m.d;\n    drawBoard({ [m.i]: m.d ? 'try' : 'undo' });\n    setTimeout(step, 250);\n  }\n  step();\n}\n\nfunction run(smart) {\n  cells = [...START];\n  guesses = 0;\n  undos = 0;\n  moves = [];\n  const ok = smart ? solveSmart() : solve();\n  replay(ok ? `${smart ? 'Fewest options first' : 'First empty cell'}: ${guesses} guesses, ${undos} undos.` : 'No solution.');\n}\n\nsolveBtn.addEventListener('click', () => run(false));\nconst smartBtn = document.createElement('button');\nsmartBtn.textContent = 'Solve smarter';\nsmartBtn.addEventListener('click', () => run(true));\nsolveBtn.after(' ', smartBtn);"
   }
  }
 ],
 "finish": "You can solve puzzles by searching now. You learned:\n\n- **Recursion** with a **base case**, and the **call stack**\n- **Backtracking**: guess, go deeper, **undo** on the way back\n- Counting **guesses and undos** to measure a solver's work\n- **Fewest options first** to cut the search dramatically\n- Doing the work fast and **replaying** it slowly with setTimeout\n\nYou've now learned every part of the **Sudoku Solver**: grids, bitmasks and backtracking. Build it next.\n\n### Challenges\n\n1. Make the 4 x 4 solver count *all* solutions instead of stopping at the first (keep going after the base case).\n2. Solve the 8 queens puzzle with the same pattern: place a queen per row, undo when two attack each other.\n3. Generate a maze by backtracking: from a cell, knock down a wall to a random unvisited neighbor, recurse, and back up when stuck.\n\n### Next\n\nThe **Sudoku Solver** project."
};
