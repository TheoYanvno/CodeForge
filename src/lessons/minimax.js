// Built from guides/minimax.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "minimax",
 "title": "Minimax and alpha-beta search",
 "goals": [
  "Picture a game as a tree of moves and replies",
  "Score finished games, and prefer quicker wins and slower losses",
  "Write minimax: the computer picks its best move assuming you pick yours",
  "Cut the search with alpha-beta pruning without changing the answer",
  "Count the positions searched to see how much pruning saves"
 ],
 "prereqs": [
  "The Recursion and backtracking lesson (recursion and undo) and the Boards and move generation lesson"
 ],
 "sessions": [
  {
   "title": "Thinking ahead",
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
   "game": "",
   "play": "",
   "minimax": "",
   "alphabeta": ""
  }
 },
 "steps": [
  {
   "title": "Game trees and minimax",
   "body": "To pick a move, a computer can **look ahead**: try each move, then each reply, then each reply to that, and see where they lead. Those possibilities form a **game tree**.\n\nMinimax scores the tree from the bottom up with one assumption: **both players play their best**.\n\n- A finished game gets a score: **+10** if the computer wins, **−10** if it loses, **0** for a draw.\n- On the computer's turn, a position is worth the **maximum** of its children (it picks its best move).\n- On your turn, a position is worth the **minimum** of its children (it assumes you pick your best move, which is its worst).\n\n```svg Minimax scores leaves, then each level takes the max (computer's turn) or the min (opponent's turn) of the level below\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 170\" font-family=\"sans-serif\" font-size=\"11\">\n  <circle cx=\"165\" cy=\"20\" r=\"14\" fill=\"#6366f1\"/><text x=\"165\" y=\"24\" text-anchor=\"middle\" fill=\"#fff\">max 3</text>\n  <circle cx=\"85\" cy=\"80\" r=\"14\" fill=\"#f97316\"/><text x=\"85\" y=\"84\" text-anchor=\"middle\" fill=\"#fff\">min 3</text>\n  <circle cx=\"245\" cy=\"80\" r=\"14\" fill=\"#f97316\"/><text x=\"245\" y=\"84\" text-anchor=\"middle\" fill=\"#fff\">min 1</text>\n  <g fill=\"#e5e7eb\" stroke=\"#9ca3af\"><rect x=\"40\" y=\"128\" width=\"30\" height=\"24\" rx=\"4\"/><rect x=\"100\" y=\"128\" width=\"30\" height=\"24\" rx=\"4\"/><rect x=\"200\" y=\"128\" width=\"30\" height=\"24\" rx=\"4\"/><rect x=\"260\" y=\"128\" width=\"30\" height=\"24\" rx=\"4\"/></g>\n  <g text-anchor=\"middle\"><text x=\"55\" y=\"144\">3</text><text x=\"115\" y=\"144\">5</text><text x=\"215\" y=\"144\">1</text><text x=\"275\" y=\"144\">8</text></g>\n  <path d=\"M155 31 L95 69 M175 31 L235 69 M78 92 L58 127 M92 92 L112 127 M238 92 L218 127 M252 92 L272 127\" stroke=\"#6b7280\" stroke-width=\"1.5\"/>\n  <text x=\"300\" y=\"24\" fill=\"#4f46e5\">computer</text><text x=\"300\" y=\"84\" fill=\"#c2410c\">you</text>\n</svg>\n```\n\nThe computer picks the left move (worth 3), even though the right side has an 8, because you'd never let it reach the 8.\n\n### Alpha-beta\n\nMinimax looks at every position. **Alpha-beta pruning** skips branches that can't change the answer. In the tree above, once the right side shows a 1, the computer already knows that branch is worth **at most 1**, and it has a 3 guaranteed on the left, so it never needs to look at the 8. Same answer, far fewer positions.\n\nTic-tac-toe is small enough to search to the end (at most 9 moves), so it's perfect for seeing all of this. Chess is far too big to search completely, so the Chess Coach searches a few moves deep and scores the position it reaches by counting material instead of win or loss.",
   "session": 0,
   "minutes": 12,
   "kind": "read"
  },
  {
   "title": "A game to search",
   "body": "The board is 9 squares, `null`, `'X'` or `'O'`. `winner(b)` checks the 8 lines (3 rows, 3 columns, 2 diagonals) and returns `'X'`, `'O'`, `'draw'` when the board is full, or `null` while the game is on.\n\nFor now, two people take turns by clicking. The computer joins in the next step.",
   "checks": [
    {
     "pane": "js",
     "label": "the eight winning lines",
     "test": "/const\\s+LINES\\s*=\\s*\\[/",
     "hint": "const LINES = [[0, 1, 2], [3, 4, 5], ...];"
    },
    {
     "pane": "js",
     "label": "a winner() check",
     "test": "/function\\s+winner\\s*\\(\\s*b\\s*\\)/",
     "hint": "function winner(b) { ... }"
    },
    {
     "pane": "js",
     "label": "a draw when the board is full",
     "test": "/b\\.every\\(/",
     "hint": "if (b.every(Boolean)) return 'draw';"
    }
   ],
   "quiz": [
    {
     "q": "How many lines can win in tic-tac-toe?",
     "options": [
      "3",
      "6",
      "8: three rows, three columns and two diagonals"
     ],
     "answer": 2,
     "why": "Those eight are all the ways to get three in a row."
    },
    {
     "q": "When should `winner()` return 'draw'?",
     "options": [
      "When the board is full and nobody has three in a row",
      "When either player has two in a row",
      "After 5 moves"
     ],
     "answer": 0,
     "why": "The game only ends in a draw once no squares are left."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main class=\"wrap\">\n  <h1>Tic-tac-toe</h1>\n  <div id=\"board\" class=\"board\"></div>\n  <p id=\"status\" class=\"status\" role=\"status\"></p>\n  <p><button id=\"reset\">New game</button> <label><input id=\"prune\" type=\"checkbox\" checked> Use alpha-beta</label></p>\n  <p id=\"stats\" class=\"stats\"></p>\n</main>"
   },
   "css": {
    "base": "body { margin: 0; font-family: system-ui, sans-serif; background: #eef2ff; color: #1e1b4b; }\n.wrap { max-width: 360px; margin: 0 auto; padding: 16px; text-align: center; }\nh1 { margin-top: 0; }\n.board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; width: 270px; margin: 0 auto; }\n.board button { height: 86px; font: 700 2.4rem system-ui, sans-serif; border: 0; border-radius: 12px; background: #fff; color: #4338ca; cursor: pointer; }\n.board button:disabled { cursor: default; }\n.board button.o { color: #ea580c; }\n.board button.win { background: #bbf7d0; }\n.status { font-weight: 600; min-height: 1.4em; }\n.stats { font-size: .85rem; color: #475569; min-height: 1.4em; }\nbutton { font: inherit; padding: 6px 12px; }"
   },
   "js": {
    "game": "const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];\n\nfunction winner(b) {\n  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];\n  if (b.every(Boolean)) return 'draw';\n  return null;\n}\n\nconst winningLine = (b) => LINES.find(([a, c, d]) => b[a] && b[a] === b[c] && b[a] === b[d]) ?? [];\nconst empties = (b) => b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);\n\nlet board = Array(9).fill(null);\nlet turn = 'X';\nconst boardEl = document.getElementById('board');\nconst statusEl = document.getElementById('status');\nconst statsEl = document.getElementById('stats');\n\nfunction draw() {\n  const w = winner(board);\n  const line = winningLine(board);\n  boardEl.replaceChildren(...board.map((v, i) => {\n    const b = document.createElement('button');\n    b.textContent = v ?? '';\n    b.className = `${v === 'O' ? 'o' : ''}${line.includes(i) ? ' win' : ''}`;\n    b.disabled = Boolean(v || w);\n    b.dataset.i = i;\n    b.setAttribute('aria-label', `Square ${i + 1}${v ? `, ${v}` : ''}`);\n    return b;\n  }));\n  statusEl.textContent = w === 'draw' ? 'A draw.' : w ? `${w} wins!` : `${turn} to play`;\n}",
    "play": "boardEl.addEventListener('click', (e) => {\n  const b = e.target.closest('button');\n  if (!b || board[b.dataset.i] || winner(board)) return;\n  board[b.dataset.i] = turn;\n  turn = turn === 'X' ? 'O' : 'X';\n  draw();\n});\n\ndocument.getElementById('reset').addEventListener('click', () => {\n  board = Array(9).fill(null);\n  turn = 'X';\n  statsEl.textContent = '';\n  draw();\n});\n\ndraw();"
   }
  },
  {
   "title": "Minimax: the computer plays O",
   "body": "`minimax(b, player, depth)` returns how good the position is **for O**, assuming perfect play from here:\n\n```js\nfunction minimax(b, player, depth) {\n  const w = winner(b);\n  if (w === 'O') return 10 - depth;          // a win, sooner is better\n  if (w === 'X') return depth - 10;          // a loss, later is better\n  if (w === 'draw') return 0;\n  ...try every empty square, recurse, undo...\n  return player === 'O' ? Math.max(...scores) : Math.min(...scores);\n}\n```\n\nThe `depth` adjustment matters: without it, a win in 1 move and a win in 5 look the same, and the computer might dawdle. With it, it takes the quickest win and, when losing is certain, holds out as long as it can.\n\nIt's backtracking again: place a mark, recurse, **undo**. After you play X, the computer tries each empty square, picks the one with the highest score, and plays it.\n\nYou can't beat it. The best you can do is a draw.\n\n```svg After X plays, the computer scores each empty square with minimax and plays the highest\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 90\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"25\" width=\"70\" height=\"34\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"40\" y=\"46\" text-anchor=\"middle\">you play X</text>\n  <rect x=\"95\" y=\"25\" width=\"120\" height=\"34\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"155\" y=\"40\" text-anchor=\"middle\">score every square</text><text x=\"155\" y=\"53\" text-anchor=\"middle\" font-size=\"10\">minimax(…, 'X', 1)</text>\n  <rect x=\"235\" y=\"25\" width=\"90\" height=\"34\" rx=\"8\" fill=\"#fed7aa\" stroke=\"#ea580c\"/><text x=\"280\" y=\"46\" text-anchor=\"middle\">O plays the best</text>\n  <path d=\"M75 42 H91 M215 42 H231\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a recursive minimax",
     "test": "/function\\s+minimax\\s*\\(\\s*b\\s*,\\s*player\\s*,\\s*depth\\s*\\)/",
     "hint": "function minimax(b, player, depth) { ... }"
    },
    {
     "pane": "js",
     "label": "quicker wins score higher",
     "test": "/10\\s*-\\s*depth/",
     "hint": "if (w === 'O') return 10 - depth;"
    },
    {
     "pane": "js",
     "label": "undoing each try",
     "test": "/b\\[\\s*i\\s*\\]\\s*=\\s*null/",
     "hint": "b[i] = null;"
    }
   ],
   "quiz": [
    {
     "q": "Why does a win score `10 - depth` instead of just 10?",
     "options": [
      "So a win in fewer moves scores higher, and the computer takes the quickest win",
      "To keep scores under 10",
      "Depth makes the search faster"
     ],
     "answer": 0,
     "why": "Without it, every win looks equally good and the computer may take the long way."
    },
    {
     "q": "On X's turn, why does minimax take the minimum score?",
     "options": [
      "X always makes mistakes",
      "It assumes X plays its best move, which is O's worst",
      "The minimum is faster to find"
     ],
     "answer": 1,
     "why": "Minimax plans against the strongest reply, not a lucky one."
    }
   ],
   "session": 0,
   "minutes": 18,
   "js": {
    "play": "boardEl.addEventListener('click', (e) => {\n  const b = e.target.closest('button');\n  if (!b || turn !== 'X' || board[b.dataset.i] || winner(board)) return;\n  board[b.dataset.i] = 'X';\n  turn = 'O';\n  draw();\n});\n\ndocument.getElementById('reset').addEventListener('click', () => {\n  board = Array(9).fill(null);\n  turn = 'X';\n  statsEl.textContent = '';\n  draw();\n});\n\ndraw();",
    "minimax": "let nodes = 0;\n\nfunction minimax(b, player, depth) {\n  nodes += 1;\n  const w = winner(b);\n  if (w === 'O') return 10 - depth;\n  if (w === 'X') return depth - 10;\n  if (w === 'draw') return 0;\n  const scores = [];\n  for (const i of empties(b)) {\n    b[i] = player;\n    scores.push(minimax(b, player === 'O' ? 'X' : 'O', depth + 1));\n    b[i] = null;\n  }\n  return player === 'O' ? Math.max(...scores) : Math.min(...scores);\n}\n\nfunction bestMove(b, search) {\n  nodes = 0;\n  let best = -1;\n  let bestScore = -Infinity;\n  for (const i of empties(b)) {\n    b[i] = 'O';\n    const s = search(b);\n    b[i] = null;\n    if (s > bestScore) { bestScore = s; best = i; }\n  }\n  return { best, bestScore, nodes };\n}\n\nfunction computerTurn() {\n  if (winner(board) || turn !== 'O') return;\n  const { best, bestScore, nodes: n } = bestMove(board, (b) => minimax(b, 'X', 1));\n  board[best] = 'O';\n  turn = 'X';\n  statsEl.textContent = `Minimax looked at ${n.toLocaleString()} positions. Best score: ${bestScore}.`;\n  draw();\n}\n\nboardEl.addEventListener('click', () => setTimeout(computerTurn, 150));"
   }
  },
  {
   "title": "Alpha-beta pruning",
   "body": "Alpha-beta passes two numbers down the search:\n\n- **alpha**: the best score O is already guaranteed somewhere higher up the tree.\n- **beta**: the best score X is already guaranteed.\n\nIf, while searching a position, `alpha >= beta`, the player above would never allow this position, so the rest of its moves can be **skipped**. That's a **cutoff**.\n\n```js\nif (player === 'O') { value = Math.max(value, score); alpha = Math.max(alpha, value); }\nelse                { value = Math.min(value, score); beta = Math.min(beta, value); }\nif (alpha >= beta) break;   // nobody will let the game get here: stop\n```\n\nThe answer is exactly the same as plain minimax; only the work changes. The checkbox switches between the two, and the stats line shows how many positions each looked at. After your first move in a corner, plain minimax visits about 60,000 positions and alpha-beta about 6,000, a tenth of the work, and the gap grows enormously in bigger games. That's why the Chess Coach can look several moves ahead at all.\n\n```svg Once a branch is known to be worse than something already guaranteed, alpha-beta skips the rest of it\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 120\" font-family=\"sans-serif\" font-size=\"11\">\n  <circle cx=\"165\" cy=\"18\" r=\"13\" fill=\"#6366f1\"/><text x=\"165\" y=\"22\" text-anchor=\"middle\" fill=\"#fff\">3</text>\n  <circle cx=\"85\" cy=\"68\" r=\"13\" fill=\"#f97316\"/><text x=\"85\" y=\"72\" text-anchor=\"middle\" fill=\"#fff\">3</text>\n  <circle cx=\"245\" cy=\"68\" r=\"13\" fill=\"#f97316\"/><text x=\"245\" y=\"72\" text-anchor=\"middle\" fill=\"#fff\">≤1</text>\n  <rect x=\"200\" y=\"96\" width=\"30\" height=\"20\" rx=\"4\" fill=\"#e5e7eb\"/><text x=\"215\" y=\"110\" text-anchor=\"middle\">1</text>\n  <rect x=\"260\" y=\"96\" width=\"30\" height=\"20\" rx=\"4\" fill=\"#fff\" stroke=\"#9ca3af\" stroke-dasharray=\"3 3\"/><text x=\"275\" y=\"110\" text-anchor=\"middle\" fill=\"#9ca3af\">skip</text>\n  <path d=\"M155 29 L95 57 M175 29 L235 57 M238 80 L220 95 M252 80 L268 95\" stroke=\"#6b7280\"/>\n  <text x=\"10\" y=\"110\" fill=\"#334155\">O has 3 for sure; this side is at most 1</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "alpha and beta passed down",
     "test": "/function\\s+alphabeta\\s*\\(\\s*b\\s*,\\s*player\\s*,\\s*depth\\s*,\\s*alpha\\s*,\\s*beta\\s*\\)/",
     "hint": "function alphabeta(b, player, depth, alpha, beta) { ... }"
    },
    {
     "pane": "js",
     "label": "the cutoff",
     "test": "/if\\s*\\(\\s*alpha\\s*>=\\s*beta\\s*\\)\\s*break/",
     "hint": "if (alpha >= beta) break;"
    }
   ],
   "quiz": [
    {
     "q": "Does alpha-beta ever choose a different move than plain minimax?",
     "options": [
      "Yes, it's an approximation",
      "No; it skips only branches that can't change the result, so the answer is the same",
      "Only in chess"
     ],
     "answer": 1,
     "why": "Pruning saves work, never correctness."
    },
    {
     "q": "What does `alpha >= beta` mean during the search?",
     "options": [
      "One player already has a better option elsewhere, so this position will never be reached",
      "The game is a draw",
      "The board is full"
     ],
     "answer": 0,
     "why": "When the guarantees cross, the rest of this branch is irrelevant."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "minimax": "let nodes = 0;\n\nfunction minimax(b, player, depth) {\n  nodes += 1;\n  const w = winner(b);\n  if (w === 'O') return 10 - depth;\n  if (w === 'X') return depth - 10;\n  if (w === 'draw') return 0;\n  const scores = [];\n  for (const i of empties(b)) {\n    b[i] = player;\n    scores.push(minimax(b, player === 'O' ? 'X' : 'O', depth + 1));\n    b[i] = null;\n  }\n  return player === 'O' ? Math.max(...scores) : Math.min(...scores);\n}\n\nfunction bestMove(b, search) {\n  nodes = 0;\n  let best = -1;\n  let bestScore = -Infinity;\n  for (const i of empties(b)) {\n    b[i] = 'O';\n    const s = search(b);\n    b[i] = null;\n    if (s > bestScore) { bestScore = s; best = i; }\n  }\n  return { best, bestScore, nodes };\n}",
    "alphabeta": "function alphabeta(b, player, depth, alpha, beta) {\n  nodes += 1;\n  const w = winner(b);\n  if (w === 'O') return 10 - depth;\n  if (w === 'X') return depth - 10;\n  if (w === 'draw') return 0;\n  let value = player === 'O' ? -Infinity : Infinity;\n  for (const i of empties(b)) {\n    b[i] = player;\n    const score = alphabeta(b, player === 'O' ? 'X' : 'O', depth + 1, alpha, beta);\n    b[i] = null;\n    if (player === 'O') { value = Math.max(value, score); alpha = Math.max(alpha, value); }\n    else { value = Math.min(value, score); beta = Math.min(beta, value); }\n    if (alpha >= beta) break;\n  }\n  return value;\n}\n\nfunction computerTurn() {\n  if (winner(board) || turn !== 'O') return;\n  const prune = document.getElementById('prune').checked;\n  const search = prune ? (b) => alphabeta(b, 'X', 1, -Infinity, Infinity) : (b) => minimax(b, 'X', 1);\n  const { best, bestScore, nodes: n } = bestMove(board, search);\n  board[best] = 'O';\n  turn = 'X';\n  statsEl.textContent = `${prune ? 'Alpha-beta' : 'Plain minimax'} looked at ${n.toLocaleString()} positions. Best score: ${bestScore}.`;\n  draw();\n}\n\nboardEl.addEventListener('click', () => setTimeout(computerTurn, 150));"
   }
  }
 ],
 "finish": "The computer can plan ahead now. You learned:\n\n- **Game trees**, and scoring finished games with a **depth** adjustment\n- **Minimax**: max on your turn, min on the opponent's, by recursion with undo\n- **Alpha-beta pruning**: the same answer with far fewer positions\n- **Counting nodes** to measure a search\n\nYou've now learned every part of the **Chess Coach**: reacting to the player, move generation and search. Build it next.\n\n### Challenges\n\n1. Give the computer a difficulty level: at \"easy\", pick a random move 40% of the time.\n2. Let the computer play X and move first, then see that it still can't lose.\n3. Try the moves in a smarter order (center, then corners, then edges) and watch alpha-beta's count drop further.\n\n### Next\n\nThe **Chess Coach** project."
};
