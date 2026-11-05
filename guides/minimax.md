---
id: minimax
title: Minimax and alpha-beta search
blocks-html: page
blocks-css: base
blocks-js: game, play, minimax, alphabeta
goals: Picture a game as a tree of moves and replies; Score finished games, and prefer quicker wins and slower losses; Write minimax: the computer picks its best move assuming you pick yours; Cut the search with alpha-beta pruning without changing the answer; Count the positions searched to see how much pruning saves
prereqs: The Recursion and backtracking lesson (recursion and undo) and the Boards and move generation lesson
---

## Session: Thinking ahead

## Step: Game trees and minimax
time: 12
kind: read

To pick a move, a computer can **look ahead**: try each move, then each reply, then each reply to that, and see where they lead. Those possibilities form a **game tree**.

Minimax scores the tree from the bottom up with one assumption: **both players play their best**.

- A finished game gets a score: **+10** if the computer wins, **−10** if it loses, **0** for a draw.
- On the computer's turn, a position is worth the **maximum** of its children (it picks its best move).
- On your turn, a position is worth the **minimum** of its children (it assumes you pick your best move, which is its worst).

```svg Minimax scores leaves, then each level takes the max (computer's turn) or the min (opponent's turn) of the level below
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 170" font-family="sans-serif" font-size="11">
  <circle cx="165" cy="20" r="14" fill="#6366f1"/><text x="165" y="24" text-anchor="middle" fill="#fff">max 3</text>
  <circle cx="85" cy="80" r="14" fill="#f97316"/><text x="85" y="84" text-anchor="middle" fill="#fff">min 3</text>
  <circle cx="245" cy="80" r="14" fill="#f97316"/><text x="245" y="84" text-anchor="middle" fill="#fff">min 1</text>
  <g fill="#e5e7eb" stroke="#9ca3af"><rect x="40" y="128" width="30" height="24" rx="4"/><rect x="100" y="128" width="30" height="24" rx="4"/><rect x="200" y="128" width="30" height="24" rx="4"/><rect x="260" y="128" width="30" height="24" rx="4"/></g>
  <g text-anchor="middle"><text x="55" y="144">3</text><text x="115" y="144">5</text><text x="215" y="144">1</text><text x="275" y="144">8</text></g>
  <path d="M155 31 L95 69 M175 31 L235 69 M78 92 L58 127 M92 92 L112 127 M238 92 L218 127 M252 92 L272 127" stroke="#6b7280" stroke-width="1.5"/>
  <text x="300" y="24" fill="#4f46e5">computer</text><text x="300" y="84" fill="#c2410c">you</text>
</svg>
```

The computer picks the left move (worth 3), even though the right side has an 8, because you'd never let it reach the 8.

### Alpha-beta

Minimax looks at every position. **Alpha-beta pruning** skips branches that can't change the answer. In the tree above, once the right side shows a 1, the computer already knows that branch is worth **at most 1**, and it has a 3 guaranteed on the left, so it never needs to look at the 8. Same answer, far fewer positions.

Tic-tac-toe is small enough to search to the end (at most 9 moves), so it's perfect for seeing all of this. Chess is far too big to search completely, so the Chess Coach searches a few moves deep and scores the position it reaches by counting material instead of win or loss.

## Step: A game to search
time: 12

The board is 9 squares, `null`, `'X'` or `'O'`. `winner(b)` checks the 8 lines (3 rows, 3 columns, 2 diagonals) and returns `'X'`, `'O'`, `'draw'` when the board is full, or `null` while the game is on.

For now, two people take turns by clicking. The computer joins in the next step.

check: js | the eight winning lines | /const\s+LINES\s*=\s*\[/ | const LINES = [[0, 1, 2], [3, 4, 5], ...];
check: js | a winner() check | /function\s+winner\s*\(\s*b\s*\)/ | function winner(b) { ... }
check: js | a draw when the board is full | /b\.every\(/ | if (b.every(Boolean)) return 'draw';

quiz: How many lines can win in tic-tac-toe?
- [ ] 3
- [ ] 6
- [x] 8: three rows, three columns and two diagonals
why: Those eight are all the ways to get three in a row.

quiz: When should `winner()` return 'draw'?
- [x] When the board is full and nobody has three in a row
- [ ] When either player has two in a row
- [ ] After 5 moves
why: The game only ends in a draw once no squares are left.

```html page
<main class="wrap">
  <h1>Tic-tac-toe</h1>
  <div id="board" class="board"></div>
  <p id="status" class="status" role="status"></p>
  <p><button id="reset">New game</button> <label><input id="prune" type="checkbox" checked> Use alpha-beta</label></p>
  <p id="stats" class="stats"></p>
</main>
```

```css base
body { margin: 0; font-family: system-ui, sans-serif; background: #eef2ff; color: #1e1b4b; }
.wrap { max-width: 360px; margin: 0 auto; padding: 16px; text-align: center; }
h1 { margin-top: 0; }
.board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; width: 270px; margin: 0 auto; }
.board button { height: 86px; font: 700 2.4rem system-ui, sans-serif; border: 0; border-radius: 12px; background: #fff; color: #4338ca; cursor: pointer; }
.board button:disabled { cursor: default; }
.board button.o { color: #ea580c; }
.board button.win { background: #bbf7d0; }
.status { font-weight: 600; min-height: 1.4em; }
.stats { font-size: .85rem; color: #475569; min-height: 1.4em; }
button { font: inherit; padding: 6px 12px; }
```

```js game
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

function winner(b) {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  if (b.every(Boolean)) return 'draw';
  return null;
}

const winningLine = (b) => LINES.find(([a, c, d]) => b[a] && b[a] === b[c] && b[a] === b[d]) ?? [];
const empties = (b) => b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);

let board = Array(9).fill(null);
let turn = 'X';
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const statsEl = document.getElementById('stats');

function draw() {
  const w = winner(board);
  const line = winningLine(board);
  boardEl.replaceChildren(...board.map((v, i) => {
    const b = document.createElement('button');
    b.textContent = v ?? '';
    b.className = `${v === 'O' ? 'o' : ''}${line.includes(i) ? ' win' : ''}`;
    b.disabled = Boolean(v || w);
    b.dataset.i = i;
    b.setAttribute('aria-label', `Square ${i + 1}${v ? `, ${v}` : ''}`);
    return b;
  }));
  statusEl.textContent = w === 'draw' ? 'A draw.' : w ? `${w} wins!` : `${turn} to play`;
}
```

```js play
boardEl.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || board[b.dataset.i] || winner(board)) return;
  board[b.dataset.i] = turn;
  turn = turn === 'X' ? 'O' : 'X';
  draw();
});

document.getElementById('reset').addEventListener('click', () => {
  board = Array(9).fill(null);
  turn = 'X';
  statsEl.textContent = '';
  draw();
});

draw();
```

## Step: Minimax: the computer plays O
time: 18

`minimax(b, player, depth)` returns how good the position is **for O**, assuming perfect play from here:

```js
function minimax(b, player, depth) {
  const w = winner(b);
  if (w === 'O') return 10 - depth;          // a win, sooner is better
  if (w === 'X') return depth - 10;          // a loss, later is better
  if (w === 'draw') return 0;
  ...try every empty square, recurse, undo...
  return player === 'O' ? Math.max(...scores) : Math.min(...scores);
}
```

The `depth` adjustment matters: without it, a win in 1 move and a win in 5 look the same, and the computer might dawdle. With it, it takes the quickest win and, when losing is certain, holds out as long as it can.

It's backtracking again: place a mark, recurse, **undo**. After you play X, the computer tries each empty square, picks the one with the highest score, and plays it.

You can't beat it. The best you can do is a draw.

```svg After X plays, the computer scores each empty square with minimax and plays the highest
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 90" font-family="sans-serif" font-size="11">
  <rect x="5" y="25" width="70" height="34" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="40" y="46" text-anchor="middle">you play X</text>
  <rect x="95" y="25" width="120" height="34" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="155" y="40" text-anchor="middle">score every square</text><text x="155" y="53" text-anchor="middle" font-size="10">minimax(…, 'X', 1)</text>
  <rect x="235" y="25" width="90" height="34" rx="8" fill="#fed7aa" stroke="#ea580c"/><text x="280" y="46" text-anchor="middle">O plays the best</text>
  <path d="M75 42 H91 M215 42 H231" stroke="#111" stroke-width="2"/>
</svg>
```

check: js | a recursive minimax | /function\s+minimax\s*\(\s*b\s*,\s*player\s*,\s*depth\s*\)/ | function minimax(b, player, depth) { ... }
check: js | quicker wins score higher | /10\s*-\s*depth/ | if (w === 'O') return 10 - depth;
check: js | undoing each try | /b\[\s*i\s*\]\s*=\s*null/ | b[i] = null;

quiz: Why does a win score `10 - depth` instead of just 10?
- [x] So a win in fewer moves scores higher, and the computer takes the quickest win
- [ ] To keep scores under 10
- [ ] Depth makes the search faster
why: Without it, every win looks equally good and the computer may take the long way.

quiz: On X's turn, why does minimax take the minimum score?
- [ ] X always makes mistakes
- [x] It assumes X plays its best move, which is O's worst
- [ ] The minimum is faster to find
why: Minimax plans against the strongest reply, not a lucky one.

```js play
boardEl.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || turn !== 'X' || board[b.dataset.i] || winner(board)) return;
  board[b.dataset.i] = 'X';
  turn = 'O';
  draw();
});

document.getElementById('reset').addEventListener('click', () => {
  board = Array(9).fill(null);
  turn = 'X';
  statsEl.textContent = '';
  draw();
});

draw();
```

```js minimax
let nodes = 0;

function minimax(b, player, depth) {
  nodes += 1;
  const w = winner(b);
  if (w === 'O') return 10 - depth;
  if (w === 'X') return depth - 10;
  if (w === 'draw') return 0;
  const scores = [];
  for (const i of empties(b)) {
    b[i] = player;
    scores.push(minimax(b, player === 'O' ? 'X' : 'O', depth + 1));
    b[i] = null;
  }
  return player === 'O' ? Math.max(...scores) : Math.min(...scores);
}

function bestMove(b, search) {
  nodes = 0;
  let best = -1;
  let bestScore = -Infinity;
  for (const i of empties(b)) {
    b[i] = 'O';
    const s = search(b);
    b[i] = null;
    if (s > bestScore) { bestScore = s; best = i; }
  }
  return { best, bestScore, nodes };
}

function computerTurn() {
  if (winner(board) || turn !== 'O') return;
  const { best, bestScore, nodes: n } = bestMove(board, (b) => minimax(b, 'X', 1));
  board[best] = 'O';
  turn = 'X';
  statsEl.textContent = `Minimax looked at ${n.toLocaleString()} positions. Best score: ${bestScore}.`;
  draw();
}

boardEl.addEventListener('click', () => setTimeout(computerTurn, 150));
```

## Step: Alpha-beta pruning
time: 15

Alpha-beta passes two numbers down the search:

- **alpha**: the best score O is already guaranteed somewhere higher up the tree.
- **beta**: the best score X is already guaranteed.

If, while searching a position, `alpha >= beta`, the player above would never allow this position, so the rest of its moves can be **skipped**. That's a **cutoff**.

```js
if (player === 'O') { value = Math.max(value, score); alpha = Math.max(alpha, value); }
else                { value = Math.min(value, score); beta = Math.min(beta, value); }
if (alpha >= beta) break;   // nobody will let the game get here: stop
```

The answer is exactly the same as plain minimax; only the work changes. The checkbox switches between the two, and the stats line shows how many positions each looked at. After your first move in a corner, plain minimax visits about 60,000 positions and alpha-beta about 6,000, a tenth of the work, and the gap grows enormously in bigger games. That's why the Chess Coach can look several moves ahead at all.

```svg Once a branch is known to be worse than something already guaranteed, alpha-beta skips the rest of it
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" font-family="sans-serif" font-size="11">
  <circle cx="165" cy="18" r="13" fill="#6366f1"/><text x="165" y="22" text-anchor="middle" fill="#fff">3</text>
  <circle cx="85" cy="68" r="13" fill="#f97316"/><text x="85" y="72" text-anchor="middle" fill="#fff">3</text>
  <circle cx="245" cy="68" r="13" fill="#f97316"/><text x="245" y="72" text-anchor="middle" fill="#fff">≤1</text>
  <rect x="200" y="96" width="30" height="20" rx="4" fill="#e5e7eb"/><text x="215" y="110" text-anchor="middle">1</text>
  <rect x="260" y="96" width="30" height="20" rx="4" fill="#fff" stroke="#9ca3af" stroke-dasharray="3 3"/><text x="275" y="110" text-anchor="middle" fill="#9ca3af">skip</text>
  <path d="M155 29 L95 57 M175 29 L235 57 M238 80 L220 95 M252 80 L268 95" stroke="#6b7280"/>
  <text x="10" y="110" fill="#334155">O has 3 for sure; this side is at most 1</text>
</svg>
```

check: js | alpha and beta passed down | /function\s+alphabeta\s*\(\s*b\s*,\s*player\s*,\s*depth\s*,\s*alpha\s*,\s*beta\s*\)/ | function alphabeta(b, player, depth, alpha, beta) { ... }
check: js | the cutoff | /if\s*\(\s*alpha\s*>=\s*beta\s*\)\s*break/ | if (alpha >= beta) break;

quiz: Does alpha-beta ever choose a different move than plain minimax?
- [ ] Yes, it's an approximation
- [x] No; it skips only branches that can't change the result, so the answer is the same
- [ ] Only in chess
why: Pruning saves work, never correctness.

quiz: What does `alpha >= beta` mean during the search?
- [x] One player already has a better option elsewhere, so this position will never be reached
- [ ] The game is a draw
- [ ] The board is full
why: When the guarantees cross, the rest of this branch is irrelevant.

```js minimax
let nodes = 0;

function minimax(b, player, depth) {
  nodes += 1;
  const w = winner(b);
  if (w === 'O') return 10 - depth;
  if (w === 'X') return depth - 10;
  if (w === 'draw') return 0;
  const scores = [];
  for (const i of empties(b)) {
    b[i] = player;
    scores.push(minimax(b, player === 'O' ? 'X' : 'O', depth + 1));
    b[i] = null;
  }
  return player === 'O' ? Math.max(...scores) : Math.min(...scores);
}

function bestMove(b, search) {
  nodes = 0;
  let best = -1;
  let bestScore = -Infinity;
  for (const i of empties(b)) {
    b[i] = 'O';
    const s = search(b);
    b[i] = null;
    if (s > bestScore) { bestScore = s; best = i; }
  }
  return { best, bestScore, nodes };
}
```

```js alphabeta
function alphabeta(b, player, depth, alpha, beta) {
  nodes += 1;
  const w = winner(b);
  if (w === 'O') return 10 - depth;
  if (w === 'X') return depth - 10;
  if (w === 'draw') return 0;
  let value = player === 'O' ? -Infinity : Infinity;
  for (const i of empties(b)) {
    b[i] = player;
    const score = alphabeta(b, player === 'O' ? 'X' : 'O', depth + 1, alpha, beta);
    b[i] = null;
    if (player === 'O') { value = Math.max(value, score); alpha = Math.max(alpha, value); }
    else { value = Math.min(value, score); beta = Math.min(beta, value); }
    if (alpha >= beta) break;
  }
  return value;
}

function computerTurn() {
  if (winner(board) || turn !== 'O') return;
  const prune = document.getElementById('prune').checked;
  const search = prune ? (b) => alphabeta(b, 'X', 1, -Infinity, Infinity) : (b) => minimax(b, 'X', 1);
  const { best, bestScore, nodes: n } = bestMove(board, search);
  board[best] = 'O';
  turn = 'X';
  statsEl.textContent = `${prune ? 'Alpha-beta' : 'Plain minimax'} looked at ${n.toLocaleString()} positions. Best score: ${bestScore}.`;
  draw();
}

boardEl.addEventListener('click', () => setTimeout(computerTurn, 150));
```

## Finish

The computer can plan ahead now. You learned:

- **Game trees**, and scoring finished games with a **depth** adjustment
- **Minimax**: max on your turn, min on the opponent's, by recursion with undo
- **Alpha-beta pruning**: the same answer with far fewer positions
- **Counting nodes** to measure a search

You've now learned every part of the **Chess Coach**: reacting to the player, move generation and search. Build it next.

### Challenges

1. Give the computer a difficulty level: at "easy", pick a random move 40% of the time.
2. Let the computer play X and move first, then see that it still can't lose.
3. Try the moves in a smarter order (center, then corners, then edges) and watch alpha-beta's count drop further.

### Next

The **Chess Coach** project.
