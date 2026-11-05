---
id: movegen
title: Boards and move generation
blocks-html: page
blocks-css: base
blocks-js: board, draw, moves, pick
goals: Store a chessboard as 64 squares and name them a1 to h8; Describe how pieces move as lists of direction steps; Generate jumping moves (knights) and sliding moves (rooks, bishops) that stop at the first piece; Keep moves on the board by checking the file and rank, never by guessing; Show a piece's moves when it's clicked, with captures marked
prereqs: The Grids as 2D arrays lesson (flat boards, index to row and column) and the Reacting to the player lesson
---

## Session: Where can it go?

## Step: A board, squares and directions
time: 12
kind: read

A chessboard is an 8 × 8 grid, so it fits the flat-array idea from the Grids lesson: 64 squares, index `i` from 0 to 63. In chess the columns are **files** a to h and the rows are **ranks** 1 to 8, so square 0 is **a1** (White's bottom-left) and square 63 is **h8**.

```js
const file = i % 8;                 // 0 = a ... 7 = h
const rank = Math.floor(i / 8);     // 0 = rank 1 ... 7 = rank 8
const name = 'abcdefgh'[file] + (rank + 1);
```

Each piece's movement is a short list of **steps**: how many files and ranks it moves at a time.

```svg A knight jumps by fixed steps; a rook slides one step at a time in a direction until something blocks it
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 160" font-family="sans-serif" font-size="11">
  <g transform="translate(5,5)"><rect width="150" height="150" fill="#f1f5f9" stroke="#94a3b8"/>
  <g fill="#bbf7d0"><rect x="37" y="18" width="18" height="18"/><rect x="93" y="18" width="18" height="18"/><rect x="18" y="37" width="18" height="18"/><rect x="112" y="37" width="18" height="18"/><rect x="18" y="93" width="18" height="18"/><rect x="112" y="93" width="18" height="18"/><rect x="37" y="112" width="18" height="18"/><rect x="93" y="112" width="18" height="18"/></g>
  <text x="65" y="80" font-size="16">♞</text><text x="75" y="148" text-anchor="middle">knight: 8 jumps</text></g>
  <g transform="translate(175,5)"><rect width="150" height="150" fill="#f1f5f9" stroke="#94a3b8"/>
  <g fill="#bfdbfe"><rect x="0" y="66" width="56" height="18"/><rect x="75" y="66" width="75" height="18"/><rect x="56" y="0" width="18" height="66"/><rect x="56" y="84" width="18" height="18"/></g>
  <rect x="56" y="102" width="18" height="18" fill="#fecaca"/><text x="59" y="117" font-size="13">♟</text>
  <text x="58" y="80" font-size="16">♜</text><text x="75" y="148" text-anchor="middle">rook: slides, stops at a piece</text></g>
</svg>
```

There are two kinds:

- **Jumpers** (knight, king): try each step once.
- **Sliders** (rook, bishop, queen): repeat each step until the edge of the board or a piece. An enemy piece can be **captured** (the move lands on it); your own piece blocks.

The one bug every board game programmer hits: a step that walks off one edge and **wraps around** to the other side in a flat array. The fix is to move in files and ranks and check both stay between 0 and 7, which this lesson does everywhere.

## Step: Drawing the board from an array
time: 12

The position is a 64-item array. Each square is empty (`null`) or a piece like `'wN'` (white knight) or `'bP'` (black pawn). The board is drawn with **rank 8 at the top**, the way White sees it, so the drawing loops ranks from 7 down to 0.

Each square gets `data-i` with its index and an `aria-label` like "d4, white knight" so the board can be read out.

check: js | 64 squares in one array | /Array\(\s*64\s*\)\.fill\(\s*null\s*\)/ | const board = Array(64).fill(null);
check: js | square names a1 to h8 | /['"]abcdefgh['"]\s*\[/ | 'abcdefgh'[i % 8] + (Math.floor(i / 8) + 1)
check: js | drawing rank 8 first | /for\s*\(\s*let\s+r\s*=\s*7\s*;\s*r\s*>=\s*0/ | for (let r = 7; r >= 0; r--) { ... }

quiz: Which square is index 27?
- [ ] c3
- [x] d4: file 27 % 8 = 3 (d), rank floor(27 / 8) = 3 (rank 4)
- [ ] e4
why: Files count from a = 0, ranks from 1 = 0.

quiz: Why does the drawing loop ranks from 7 down to 0?
- [x] So rank 8 is at the top of the screen, the way White sees the board
- [ ] Arrays must be read backwards
- [ ] To draw black pieces first
why: Index 0 is a1 at the bottom left; screens draw top to bottom.

```html page
<main class="wrap">
  <h1>Move generator</h1>
  <div id="board" class="board" role="grid" aria-label="Chessboard"></div>
  <p id="info" class="info" role="status">Click a white piece.</p>
</main>
```

```css base
body { margin: 0; font-family: system-ui, sans-serif; background: #1f2937; color: #f9fafb; }
.wrap { max-width: 440px; margin: 0 auto; padding: 16px; }
h1 { margin-top: 0; font-size: 1.3rem; }
.board { display: grid; grid-template-columns: repeat(8, 1fr); width: min(100%, 400px); aspect-ratio: 1; border: 3px solid #78350f; }
.sq { display: grid; place-items: center; font-size: min(7vw, 34px); cursor: pointer; position: relative; user-select: none; }
.sq.light { background: #f0d9b5; color: #111; } .sq.dark { background: #b58863; color: #111; }
.sq.from { outline: 3px solid #2563eb; outline-offset: -3px; }
.sq.to::after { content: ''; width: 28%; height: 28%; border-radius: 50%; background: rgb(22 163 74 / .7); position: absolute; }
.sq.cap::after { width: 86%; height: 86%; background: none; border: 4px solid rgb(220 38 38 / .8); }
.info { min-height: 2.6em; }
```

```js board
const board = Array(64).fill(null);
const nameOf = (i) => 'abcdefgh'[i % 8] + (Math.floor(i / 8) + 1);
const indexOf = (name) => 'abcdefgh'.indexOf(name[0]) + (Number(name[1]) - 1) * 8;
const place = (sq, piece) => { board[indexOf(sq)] = piece; };

place('d4', 'wN');
place('b2', 'wR');
place('f1', 'wB');
place('e6', 'bP');
place('b6', 'bP');
place('g2', 'wP');
place('c3', 'bN');

const GLYPH = { wN: '♘', wR: '♖', wB: '♗', wP: '♙', bN: '♞', bP: '♟' };
const NAMES = { N: 'knight', R: 'rook', B: 'bishop', P: 'pawn' };
const boardEl = document.getElementById('board');
const info = document.getElementById('info');
```

```js draw
function draw(marks = {}) {
  const cells = [];
  for (let r = 7; r >= 0; r--) {
    for (let f = 0; f < 8; f++) {
      const i = r * 8 + f;
      const p = board[i];
      const el = document.createElement('div');
      el.className = `sq ${(r + f) % 2 ? 'light' : 'dark'}${marks[i] ? ` ${marks[i]}` : ''}`;
      el.dataset.i = i;
      el.textContent = p ? GLYPH[p] : '';
      el.setAttribute('aria-label', `${nameOf(i)}${p ? `, ${p[0] === 'w' ? 'white' : 'black'} ${NAMES[p[1]]}` : ''}`);
      cells.push(el);
    }
  }
  boardEl.replaceChildren(...cells);
}

draw();
```

## Step: Jumping and sliding moves
time: 18

Steps are written as `[files, ranks]`. The knight has eight; the rook four directions; the bishop four diagonals:

```js
const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
const ROOK = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BISHOP = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
```

`target(i, df, dr)` applies one step and returns the new index, or `-1` if it would leave the board. It works in files and ranks and checks **both** are 0 to 7, so a knight on the h-file can never wrap to the a-file.

- **Jumpers** try each step once: the move is allowed if the square is empty or holds an enemy.
- **Sliders** keep stepping in each direction. Empty square: add it and keep going. Enemy: add it as a capture and **stop**. Own piece or the edge: **stop** without adding.

```svg A slider walks each direction: empty squares are moves, the first enemy is a capture and stops it, an own piece just stops it
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 70" font-family="sans-serif" font-size="11">
  <g stroke="#94a3b8"><rect x="5" y="15" width="40" height="40" fill="#f0d9b5"/><rect x="45" y="15" width="40" height="40" fill="#bbf7d0"/><rect x="85" y="15" width="40" height="40" fill="#bbf7d0"/><rect x="125" y="15" width="40" height="40" fill="#fecaca"/><rect x="165" y="15" width="40" height="40" fill="#e5e7eb"/></g>
  <text x="18" y="42" font-size="18">♖</text><text x="138" y="42" font-size="18">♟</text>
  <text x="215" y="30">move, move, capture</text><text x="215" y="48">then stop</text>
</svg>
```

check: js | the knight's eight jumps | /const\s+KNIGHT\s*=\s*\[\s*\[\s*1\s*,\s*2\s*\]/ | const KNIGHT = [[1, 2], [2, 1], ...];
check: js | a step that can't leave the board | /f\s*<\s*0\s*\|\|\s*f\s*>\s*7\s*\|\|\s*r\s*<\s*0\s*\|\|\s*r\s*>\s*7/ | if (f < 0 || f > 7 || r < 0 || r > 7) return -1;
check: js | sliding until something is in the way | /while\s*\(\s*t\s*!==\s*-1\s*\)/ | while (t !== -1) { ... }

quiz: A white rook slides right and meets a black pawn. What happens?
- [ ] It jumps over the pawn
- [x] The pawn's square is added as a capture, and the slide stops there
- [ ] It stops on the square before, without capturing
why: Sliders can capture the first enemy in a direction, but never pass it.

quiz: Why check the file and rank instead of just `i + 17` for a knight jump?
- [x] In a flat array a jump from the h-file would wrap to the a-file on another rank
- [ ] Adding numbers is slower
- [ ] Knights can't move by 17
why: Index arithmetic doesn't know about edges; files and ranks do.

```js moves
const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
const ROOK = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BISHOP = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

function target(i, df, dr) {
  const f = (i % 8) + df;
  const r = Math.floor(i / 8) + dr;
  if (f < 0 || f > 7 || r < 0 || r > 7) return -1;
  return r * 8 + f;
}

const colorOf = (p) => p?.[0];

function jumps(i, steps) {
  const out = [];
  for (const [df, dr] of steps) {
    const t = target(i, df, dr);
    if (t !== -1 && colorOf(board[t]) !== colorOf(board[i])) out.push(t);
  }
  return out;
}

function slides(i, dirs) {
  const out = [];
  for (const [df, dr] of dirs) {
    let t = target(i, df, dr);
    while (t !== -1) {
      if (!board[t]) { out.push(t); t = target(t, df, dr); continue; }
      if (colorOf(board[t]) !== colorOf(board[i])) out.push(t);
      break;
    }
  }
  return out;
}

function movesFrom(i) {
  const kind = board[i]?.[1];
  if (kind === 'N') return jumps(i, KNIGHT);
  if (kind === 'R') return slides(i, ROOK);
  if (kind === 'B') return slides(i, BISHOP);
  if (kind === 'P') {
    const t = target(i, 0, 1);
    return t !== -1 && !board[t] ? [t] : [];
  }
  return [];
}
```

## Step: Click a piece, see its moves
time: 12

Clicking a white piece asks `movesFrom()` for its moves and draws them: a dot on an empty square, a ring on a capture. The status line names them in chess notation ("Nd4: b5, c6, e6 (captures)…") and counts all of White's moves, the number a chess engine looks at for each position.

This is the heart of the Chess Coach's "click a piece, click a square". The real move generator adds the queen and king, pawn captures and two-square starts, castling and en passant, and then removes moves that leave your own king in check.

```svg Clicking a piece runs movesFrom and marks the result: dots for moves, rings for captures
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 80" font-family="sans-serif" font-size="11">
  <rect x="5" y="22" width="70" height="34" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="40" y="43" text-anchor="middle">click</text>
  <rect x="95" y="22" width="90" height="34" rx="8" fill="#6366f1"/><text x="140" y="43" text-anchor="middle" fill="#fff">movesFrom(i)</text>
  <rect x="205" y="22" width="120" height="34" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="265" y="43" text-anchor="middle">draw dots and rings</text>
  <path d="M75 39 H91 M185 39 H201" stroke="#111" stroke-width="2"/>
</svg>
```

check: js | clicking a square | /boardEl\.addEventListener\(\s*['"]click['"]/ | boardEl.addEventListener('click', (e) => { ... })
check: js | captures marked differently | /board\[\s*t\s*\]\s*\?\s*['"]to cap['"]/ | marks[t] = board[t] ? 'to cap' : 'to';

quiz: How many moves does the white knight on d4 have here?
- [x] 8, and one of them (e6) is a capture
- [ ] 7
- [ ] 2
why: d4 is near the middle, so all eight jumps stay on the board, none lands on a white piece, and e6 holds a black pawn.

quiz: The real Chess Coach removes some of these moves later. Which?
- [ ] Captures
- [x] Moves that would leave your own king in check
- [ ] Moves to the edge of the board
why: Generating "pseudo-legal" moves first and filtering out the ones that expose the king is how most chess programs work.

```js pick
boardEl.addEventListener('click', (e) => {
  const sq = e.target.closest('.sq');
  if (!sq) return;
  const i = Number(sq.dataset.i);
  if (colorOf(board[i]) !== 'w') { draw(); info.textContent = 'Click a white piece.'; return; }
  const moves = movesFrom(i);
  const marks = { [i]: 'from' };
  for (const t of moves) marks[t] = board[t] ? 'to cap' : 'to';
  draw(marks);
  const caps = moves.filter((t) => board[t]).map(nameOf);
  const all = board.reduce((n, p, j) => n + (colorOf(p) === 'w' ? movesFrom(j).length : 0), 0);
  info.textContent = `${board[i][1]}${nameOf(i)}: ${moves.map(nameOf).join(', ') || 'no moves'}${caps.length ? ` · captures ${caps.join(', ')}` : ''}. White has ${all} moves in all.`;
});
```

## Finish

You can work out where pieces can go. You learned:

- A **64-square array**, square names, and drawing rank 8 at the top
- Movement as **step lists**, for **jumpers** and **sliders**
- `target()` that checks **file and rank** so nothing wraps around an edge
- Slides that **stop at the first piece**, capturing an enemy
- Showing moves and **captures** when a piece is clicked

### Challenges

1. Add the queen (rook steps plus bishop steps) and the king (one step in all eight directions).
2. Let pawns capture diagonally and move two squares from their starting rank.
3. Count every move for both sides and show "White 23 · Black 14".

### Next

**Minimax and alpha-beta**: let the computer pick the best move.
