// Built from guides/movegen.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "movegen",
 "title": "Boards and move generation",
 "goals": [
  "Store a chessboard as 64 squares and name them a1 to h8",
  "Describe how pieces move as lists of direction steps",
  "Generate jumping moves (knights) and sliding moves (rooks, bishops) that stop at the first piece",
  "Keep moves on the board by checking the file and rank, never by guessing",
  "Show a piece's moves when it's clicked, with captures marked"
 ],
 "prereqs": [
  "The Grids as 2D arrays lesson (flat boards, index to row and column) and the Reacting to the player lesson"
 ],
 "sessions": [
  {
   "title": "Where can it go?",
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
   "board": "",
   "draw": "",
   "moves": "",
   "pick": ""
  }
 },
 "steps": [
  {
   "title": "A board, squares and directions",
   "body": "A chessboard is an 8 × 8 grid, so it fits the flat-array idea from the Grids lesson: 64 squares, index `i` from 0 to 63. In chess the columns are **files** a to h and the rows are **ranks** 1 to 8, so square 0 is **a1** (White's bottom-left) and square 63 is **h8**.\n\n```js\nconst file = i % 8;                 // 0 = a ... 7 = h\nconst rank = Math.floor(i / 8);     // 0 = rank 1 ... 7 = rank 8\nconst name = 'abcdefgh'[file] + (rank + 1);\n```\n\nEach piece's movement is a short list of **steps**: how many files and ranks it moves at a time.\n\n```svg A knight jumps by fixed steps; a rook slides one step at a time in a direction until something blocks it\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 160\" font-family=\"sans-serif\" font-size=\"11\">\n  <g transform=\"translate(5,5)\"><rect width=\"150\" height=\"150\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/>\n  <g fill=\"#bbf7d0\"><rect x=\"37\" y=\"18\" width=\"18\" height=\"18\"/><rect x=\"93\" y=\"18\" width=\"18\" height=\"18\"/><rect x=\"18\" y=\"37\" width=\"18\" height=\"18\"/><rect x=\"112\" y=\"37\" width=\"18\" height=\"18\"/><rect x=\"18\" y=\"93\" width=\"18\" height=\"18\"/><rect x=\"112\" y=\"93\" width=\"18\" height=\"18\"/><rect x=\"37\" y=\"112\" width=\"18\" height=\"18\"/><rect x=\"93\" y=\"112\" width=\"18\" height=\"18\"/></g>\n  <text x=\"65\" y=\"80\" font-size=\"16\">♞</text><text x=\"75\" y=\"148\" text-anchor=\"middle\">knight: 8 jumps</text></g>\n  <g transform=\"translate(175,5)\"><rect width=\"150\" height=\"150\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/>\n  <g fill=\"#bfdbfe\"><rect x=\"0\" y=\"66\" width=\"56\" height=\"18\"/><rect x=\"75\" y=\"66\" width=\"75\" height=\"18\"/><rect x=\"56\" y=\"0\" width=\"18\" height=\"66\"/><rect x=\"56\" y=\"84\" width=\"18\" height=\"18\"/></g>\n  <rect x=\"56\" y=\"102\" width=\"18\" height=\"18\" fill=\"#fecaca\"/><text x=\"59\" y=\"117\" font-size=\"13\">♟</text>\n  <text x=\"58\" y=\"80\" font-size=\"16\">♜</text><text x=\"75\" y=\"148\" text-anchor=\"middle\">rook: slides, stops at a piece</text></g>\n</svg>\n```\n\nThere are two kinds:\n\n- **Jumpers** (knight, king): try each step once.\n- **Sliders** (rook, bishop, queen): repeat each step until the edge of the board or a piece. An enemy piece can be **captured** (the move lands on it); your own piece blocks.\n\nThe one bug every board game programmer hits: a step that walks off one edge and **wraps around** to the other side in a flat array. The fix is to move in files and ranks and check both stay between 0 and 7, which this lesson does everywhere.",
   "session": 0,
   "minutes": 12,
   "kind": "read"
  },
  {
   "title": "Drawing the board from an array",
   "body": "The position is a 64-item array. Each square is empty (`null`) or a piece like `'wN'` (white knight) or `'bP'` (black pawn). The board is drawn with **rank 8 at the top**, the way White sees it, so the drawing loops ranks from 7 down to 0.\n\nEach square gets `data-i` with its index and an `aria-label` like \"d4, white knight\" so the board can be read out.",
   "checks": [
    {
     "pane": "js",
     "label": "64 squares in one array",
     "test": "/Array\\(\\s*64\\s*\\)\\.fill\\(\\s*null\\s*\\)/",
     "hint": "const board = Array(64).fill(null);"
    },
    {
     "pane": "js",
     "label": "square names a1 to h8",
     "test": "/['\"]abcdefgh['\"]\\s*\\[/",
     "hint": "'abcdefgh'[i % 8] + (Math.floor(i / 8) + 1)"
    },
    {
     "pane": "js",
     "label": "drawing rank 8 first",
     "test": "/for\\s*\\(\\s*let\\s+r\\s*=\\s*7\\s*;\\s*r\\s*>=\\s*0/",
     "hint": "for (let r = 7; r >= 0; r--) { ... }"
    }
   ],
   "quiz": [
    {
     "q": "Which square is index 27?",
     "options": [
      "c3",
      "d4: file 27 % 8 = 3 (d), rank floor(27 / 8) = 3 (rank 4)",
      "e4"
     ],
     "answer": 1,
     "why": "Files count from a = 0, ranks from 1 = 0."
    },
    {
     "q": "Why does the drawing loop ranks from 7 down to 0?",
     "options": [
      "So rank 8 is at the top of the screen, the way White sees the board",
      "Arrays must be read backwards",
      "To draw black pieces first"
     ],
     "answer": 0,
     "why": "Index 0 is a1 at the bottom left; screens draw top to bottom."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main class=\"wrap\">\n  <h1>Move generator</h1>\n  <div id=\"board\" class=\"board\" role=\"grid\" aria-label=\"Chessboard\"></div>\n  <p id=\"info\" class=\"info\" role=\"status\">Click a white piece.</p>\n</main>"
   },
   "css": {
    "base": "body { margin: 0; font-family: system-ui, sans-serif; background: #1f2937; color: #f9fafb; }\n.wrap { max-width: 440px; margin: 0 auto; padding: 16px; }\nh1 { margin-top: 0; font-size: 1.3rem; }\n.board { display: grid; grid-template-columns: repeat(8, 1fr); width: min(100%, 400px); aspect-ratio: 1; border: 3px solid #78350f; }\n.sq { display: grid; place-items: center; font-size: min(7vw, 34px); cursor: pointer; position: relative; user-select: none; }\n.sq.light { background: #f0d9b5; color: #111; } .sq.dark { background: #b58863; color: #111; }\n.sq.from { outline: 3px solid #2563eb; outline-offset: -3px; }\n.sq.to::after { content: ''; width: 28%; height: 28%; border-radius: 50%; background: rgb(22 163 74 / .7); position: absolute; }\n.sq.cap::after { width: 86%; height: 86%; background: none; border: 4px solid rgb(220 38 38 / .8); }\n.info { min-height: 2.6em; }"
   },
   "js": {
    "board": "const board = Array(64).fill(null);\nconst nameOf = (i) => 'abcdefgh'[i % 8] + (Math.floor(i / 8) + 1);\nconst indexOf = (name) => 'abcdefgh'.indexOf(name[0]) + (Number(name[1]) - 1) * 8;\nconst place = (sq, piece) => { board[indexOf(sq)] = piece; };\n\nplace('d4', 'wN');\nplace('b2', 'wR');\nplace('f1', 'wB');\nplace('e6', 'bP');\nplace('b6', 'bP');\nplace('g2', 'wP');\nplace('c3', 'bN');\n\nconst GLYPH = { wN: '♘', wR: '♖', wB: '♗', wP: '♙', bN: '♞', bP: '♟' };\nconst NAMES = { N: 'knight', R: 'rook', B: 'bishop', P: 'pawn' };\nconst boardEl = document.getElementById('board');\nconst info = document.getElementById('info');",
    "draw": "function draw(marks = {}) {\n  const cells = [];\n  for (let r = 7; r >= 0; r--) {\n    for (let f = 0; f < 8; f++) {\n      const i = r * 8 + f;\n      const p = board[i];\n      const el = document.createElement('div');\n      el.className = `sq ${(r + f) % 2 ? 'light' : 'dark'}${marks[i] ? ` ${marks[i]}` : ''}`;\n      el.dataset.i = i;\n      el.textContent = p ? GLYPH[p] : '';\n      el.setAttribute('aria-label', `${nameOf(i)}${p ? `, ${p[0] === 'w' ? 'white' : 'black'} ${NAMES[p[1]]}` : ''}`);\n      cells.push(el);\n    }\n  }\n  boardEl.replaceChildren(...cells);\n}\n\ndraw();"
   }
  },
  {
   "title": "Jumping and sliding moves",
   "body": "Steps are written as `[files, ranks]`. The knight has eight; the rook four directions; the bishop four diagonals:\n\n```js\nconst KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];\nconst ROOK = [[1, 0], [-1, 0], [0, 1], [0, -1]];\nconst BISHOP = [[1, 1], [1, -1], [-1, 1], [-1, -1]];\n```\n\n`target(i, df, dr)` applies one step and returns the new index, or `-1` if it would leave the board. It works in files and ranks and checks **both** are 0 to 7, so a knight on the h-file can never wrap to the a-file.\n\n- **Jumpers** try each step once: the move is allowed if the square is empty or holds an enemy.\n- **Sliders** keep stepping in each direction. Empty square: add it and keep going. Enemy: add it as a capture and **stop**. Own piece or the edge: **stop** without adding.\n\n```svg A slider walks each direction: empty squares are moves, the first enemy is a capture and stops it, an own piece just stops it\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 70\" font-family=\"sans-serif\" font-size=\"11\">\n  <g stroke=\"#94a3b8\"><rect x=\"5\" y=\"15\" width=\"40\" height=\"40\" fill=\"#f0d9b5\"/><rect x=\"45\" y=\"15\" width=\"40\" height=\"40\" fill=\"#bbf7d0\"/><rect x=\"85\" y=\"15\" width=\"40\" height=\"40\" fill=\"#bbf7d0\"/><rect x=\"125\" y=\"15\" width=\"40\" height=\"40\" fill=\"#fecaca\"/><rect x=\"165\" y=\"15\" width=\"40\" height=\"40\" fill=\"#e5e7eb\"/></g>\n  <text x=\"18\" y=\"42\" font-size=\"18\">♖</text><text x=\"138\" y=\"42\" font-size=\"18\">♟</text>\n  <text x=\"215\" y=\"30\">move, move, capture</text><text x=\"215\" y=\"48\">then stop</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "the knight's eight jumps",
     "test": "/const\\s+KNIGHT\\s*=\\s*\\[\\s*\\[\\s*1\\s*,\\s*2\\s*\\]/",
     "hint": "const KNIGHT = [[1, 2], [2, 1], ...];"
    },
    {
     "pane": "js",
     "label": "a step that can't leave the board",
     "test": "/f\\s*<\\s*0\\s*\\|\\|\\s*f\\s*>\\s*7\\s*\\|\\|\\s*r\\s*<\\s*0\\s*\\|\\|\\s*r\\s*>\\s*7/",
     "hint": "if (f < 0 || f > 7 || r < 0 || r > 7) return -1;"
    },
    {
     "pane": "js",
     "label": "sliding until something is in the way",
     "test": "/while\\s*\\(\\s*t\\s*!==\\s*-1\\s*\\)/",
     "hint": "while (t !== -1) { ... }"
    }
   ],
   "quiz": [
    {
     "q": "A white rook slides right and meets a black pawn. What happens?",
     "options": [
      "It jumps over the pawn",
      "The pawn's square is added as a capture, and the slide stops there",
      "It stops on the square before, without capturing"
     ],
     "answer": 1,
     "why": "Sliders can capture the first enemy in a direction, but never pass it."
    },
    {
     "q": "Why check the file and rank instead of just `i + 17` for a knight jump?",
     "options": [
      "In a flat array a jump from the h-file would wrap to the a-file on another rank",
      "Adding numbers is slower",
      "Knights can't move by 17"
     ],
     "answer": 0,
     "why": "Index arithmetic doesn't know about edges; files and ranks do."
    }
   ],
   "session": 0,
   "minutes": 18,
   "js": {
    "moves": "const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];\nconst ROOK = [[1, 0], [-1, 0], [0, 1], [0, -1]];\nconst BISHOP = [[1, 1], [1, -1], [-1, 1], [-1, -1]];\n\nfunction target(i, df, dr) {\n  const f = (i % 8) + df;\n  const r = Math.floor(i / 8) + dr;\n  if (f < 0 || f > 7 || r < 0 || r > 7) return -1;\n  return r * 8 + f;\n}\n\nconst colorOf = (p) => p?.[0];\n\nfunction jumps(i, steps) {\n  const out = [];\n  for (const [df, dr] of steps) {\n    const t = target(i, df, dr);\n    if (t !== -1 && colorOf(board[t]) !== colorOf(board[i])) out.push(t);\n  }\n  return out;\n}\n\nfunction slides(i, dirs) {\n  const out = [];\n  for (const [df, dr] of dirs) {\n    let t = target(i, df, dr);\n    while (t !== -1) {\n      if (!board[t]) { out.push(t); t = target(t, df, dr); continue; }\n      if (colorOf(board[t]) !== colorOf(board[i])) out.push(t);\n      break;\n    }\n  }\n  return out;\n}\n\nfunction movesFrom(i) {\n  const kind = board[i]?.[1];\n  if (kind === 'N') return jumps(i, KNIGHT);\n  if (kind === 'R') return slides(i, ROOK);\n  if (kind === 'B') return slides(i, BISHOP);\n  if (kind === 'P') {\n    const t = target(i, 0, 1);\n    return t !== -1 && !board[t] ? [t] : [];\n  }\n  return [];\n}"
   }
  },
  {
   "title": "Click a piece, see its moves",
   "body": "Clicking a white piece asks `movesFrom()` for its moves and draws them: a dot on an empty square, a ring on a capture. The status line names them in chess notation (\"Nd4: b5, c6, e6 (captures)…\") and counts all of White's moves, the number a chess engine looks at for each position.\n\nThis is the heart of the Chess Coach's \"click a piece, click a square\". The real move generator adds the queen and king, pawn captures and two-square starts, castling and en passant, and then removes moves that leave your own king in check.\n\n```svg Clicking a piece runs movesFrom and marks the result: dots for moves, rings for captures\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 80\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"22\" width=\"70\" height=\"34\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"40\" y=\"43\" text-anchor=\"middle\">click</text>\n  <rect x=\"95\" y=\"22\" width=\"90\" height=\"34\" rx=\"8\" fill=\"#6366f1\"/><text x=\"140\" y=\"43\" text-anchor=\"middle\" fill=\"#fff\">movesFrom(i)</text>\n  <rect x=\"205\" y=\"22\" width=\"120\" height=\"34\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"265\" y=\"43\" text-anchor=\"middle\">draw dots and rings</text>\n  <path d=\"M75 39 H91 M185 39 H201\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "clicking a square",
     "test": "/boardEl\\.addEventListener\\(\\s*['\"]click['\"]/",
     "hint": "boardEl.addEventListener('click', (e) => { ... })"
    },
    {
     "pane": "js",
     "label": "captures marked differently",
     "test": "/board\\[\\s*t\\s*\\]\\s*\\?\\s*['\"]to cap['\"]/",
     "hint": "marks[t] = board[t] ? 'to cap' : 'to';"
    }
   ],
   "quiz": [
    {
     "q": "How many moves does the white knight on d4 have here?",
     "options": [
      "8, and one of them (e6) is a capture",
      "7",
      "2"
     ],
     "answer": 0,
     "why": "d4 is near the middle, so all eight jumps stay on the board, none lands on a white piece, and e6 holds a black pawn."
    },
    {
     "q": "The real Chess Coach removes some of these moves later. Which?",
     "options": [
      "Captures",
      "Moves that would leave your own king in check",
      "Moves to the edge of the board"
     ],
     "answer": 1,
     "why": "Generating \"pseudo-legal\" moves first and filtering out the ones that expose the king is how most chess programs work."
    }
   ],
   "session": 0,
   "minutes": 12,
   "js": {
    "pick": "boardEl.addEventListener('click', (e) => {\n  const sq = e.target.closest('.sq');\n  if (!sq) return;\n  const i = Number(sq.dataset.i);\n  if (colorOf(board[i]) !== 'w') { draw(); info.textContent = 'Click a white piece.'; return; }\n  const moves = movesFrom(i);\n  const marks = { [i]: 'from' };\n  for (const t of moves) marks[t] = board[t] ? 'to cap' : 'to';\n  draw(marks);\n  const caps = moves.filter((t) => board[t]).map(nameOf);\n  const all = board.reduce((n, p, j) => n + (colorOf(p) === 'w' ? movesFrom(j).length : 0), 0);\n  info.textContent = `${board[i][1]}${nameOf(i)}: ${moves.map(nameOf).join(', ') || 'no moves'}${caps.length ? ` · captures ${caps.join(', ')}` : ''}. White has ${all} moves in all.`;\n});"
   }
  }
 ],
 "finish": "You can work out where pieces can go. You learned:\n\n- A **64-square array**, square names, and drawing rank 8 at the top\n- Movement as **step lists**, for **jumpers** and **sliders**\n- `target()` that checks **file and rank** so nothing wraps around an edge\n- Slides that **stop at the first piece**, capturing an enemy\n- Showing moves and **captures** when a piece is clicked\n\n### Challenges\n\n1. Add the queen (rook steps plus bishop steps) and the king (one step in all eight directions).\n2. Let pawns capture diagonally and move two squares from their starting rank.\n3. Count every move for both sides and show \"White 23 · Black 14\".\n\n### Next\n\n**Minimax and alpha-beta**: let the computer pick the best move."
};
