---
id: grids
title: Grids as 2D arrays
blocks-html: page
blocks-css: base
blocks-js: grid2d, flat, peers
goals: Store a grid as an array of rows and read a cell with grid[row][col]; Store the same grid as one flat array and convert between an index and a row and column; Find a cell's 3 x 3 box with Math.floor; Work out each cell's peers once and reuse them; Find duplicate values in a row, column or box
prereqs: The JavaScript basics lesson (arrays and loops) and the Filtering lists lesson (filter and Set)
---

## Session: Thinking in rows and columns

## Step: Two ways to store a grid
time: 10
kind: read

A Sudoku board, a chessboard, a spreadsheet, the pixels of a picture: they're all **grids**. JavaScript has no grid type, so there are two common ways to store one.

**An array of rows** (a 2D array). Each row is an array, and the grid is an array of those rows. `grid[2][5]` is row 2, column 5.

**One flat array.** All 81 cells in one list, row after row. Cell number `i` is in row `Math.floor(i / 9)` and column `i % 9`, and going back, the index is `row * 9 + col`.

```svg The same 9 x 9 board as an array of rows, grid[r][c], or as one flat list where index = row × 9 + col
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 150" font-family="sans-serif" font-size="11">
  <g fill="#f8fafc" stroke="#94a3b8">
    <rect x="10" y="20" width="16" height="16"/><rect x="26" y="20" width="16" height="16"/><rect x="42" y="20" width="16" height="16"/><rect x="58" y="20" width="16" height="16"/>
    <rect x="10" y="36" width="16" height="16"/><rect x="26" y="36" width="16" height="16"/><rect x="42" y="36" width="16" height="16"/><rect x="58" y="36" width="16" height="16"/>
    <rect x="10" y="52" width="16" height="16"/><rect x="26" y="52" width="16" height="16"/><rect x="42" y="52" width="16" height="16" fill="#fde68a"/><rect x="58" y="52" width="16" height="16"/>
  </g>
  <text x="10" y="14">grid[r][c]</text><text x="10" y="86">grid[2][2]</text>
  <g fill="#f8fafc" stroke="#94a3b8"><rect x="120" y="40" width="20" height="20"/><rect x="140" y="40" width="20" height="20"/><rect x="160" y="40" width="20" height="20"/><rect x="180" y="40" width="20" height="20"/><rect x="200" y="40" width="20" height="20" fill="#fde68a"/><rect x="220" y="40" width="20" height="20"/><rect x="240" y="40" width="20" height="20"/></g>
  <text x="120" y="32">cells[i]: … 18 19 20 …</text><text x="190" y="80">index 20 = 2 × 9 + 2</text>
  <text x="120" y="110">row = Math.floor(20 / 9) = 2</text><text x="120" y="128">col = 20 % 9 = 2</text>
</svg>
```

Which is better? An array of rows is easier to read. A flat array is easier to copy (`[...cells]`), loop over (one loop instead of two) and save, which is why the Sudoku Solver uses it. This lesson does both, so you can move between them without thinking.

## Step: An array of rows
time: 12

`Array.from({ length: 9 }, ...)` makes a list of 9 things, and the function decides what each one is. Doing it twice gives 9 rows of 9 cells:

```js
const grid = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => (r * 3 + Math.floor(r / 3) + c) % 9 + 1));
```

That formula fills a valid solved Sudoku, which is handy for testing. Read a cell with `grid[row][col]`, and loop with one `for` inside another, rows outside and columns inside.

> Don't build rows with `Array(9).fill([])`. It fills all nine slots with the *same* array, so changing one row changes them all. `Array.from` makes a new array for each row.

check: js | 9 rows of 9 made with Array.from | /Array\.from\(\s*\{\s*length\s*:\s*9\s*\}[\s\S]*Array\.from\(\s*\{\s*length\s*:\s*9\s*\}/ | Array.from({ length: 9 }, () => Array.from({ length: 9 }, ...))
check: js | reading a cell by row and column | /grid\[\s*r\s*\]\[\s*c\s*\]/ | grid[r][c]

quiz: What does `grid[0][8]` refer to?
- [ ] The cell in row 8, column 0
- [x] The last cell in the first row
- [ ] The first cell in the last row
why: The first index is the row (0 = top), the second the column (8 = rightmost).

quiz: Why not `Array(9).fill([])` for the rows?
- [x] All nine slots would hold the same array, so changing one row changes every row
- [ ] fill() only works with numbers
- [ ] It makes 81 rows
why: fill puts the very same object in every slot; Array.from calls the function for each one.

```html page
<main class="card">
  <h1>Grids</h1>
  <table id="board" class="board"></table>
  <p id="info" class="info" role="status">Click a cell.</p>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #f0f9ff;
  color: #0c4a6e;
}

.card { padding: 16px; background: #fff; border-radius: 16px; }
h1 { margin-top: 0; font-size: 1.3rem; }
.board { border-collapse: collapse; }
.board td { width: 32px; height: 32px; text-align: center; border: 1px solid #bae6fd; cursor: pointer; font-weight: 600; }
.board tr:nth-child(3n) td { border-bottom: 2px solid #0369a1; }
.board td:nth-child(3n) { border-right: 2px solid #0369a1; }
.board td.peer { background: #e0f2fe; }
.board td.here { background: #fde68a; }
.board td.clash { color: #b91c1c; background: #fee2e2; }
.info { font-size: .9rem; min-height: 2.6em; }
```

```js grid2d
const board = document.getElementById('board');
const info = document.getElementById('info');
const grid = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => (r * 3 + Math.floor(r / 3) + c) % 9 + 1));

function drawGrid() {
  board.replaceChildren();
  for (let r = 0; r < 9; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < 9; c++) {
      const td = document.createElement('td');
      td.textContent = grid[r][c];
      td.dataset.r = r;
      td.dataset.c = c;
      tr.append(td);
    }
    board.append(tr);
  }
}

drawGrid();
board.addEventListener('click', (e) => {
  const td = e.target.closest('td');
  if (td) info.textContent = `grid[${td.dataset.r}][${td.dataset.c}] = ${td.textContent}`;
});
```

## Step: One flat array, and the box math
time: 15

Now flatten the grid to one array of 81 and convert both ways:

```js
const cells = grid.flat();                 // 81 numbers, row after row
const rowOf = (i) => Math.floor(i / 9);
const colOf = (i) => i % 9;
const indexOf = (r, c) => r * 9 + c;
```

Sudoku also has **boxes**: nine 3 x 3 squares. A cell's box starts at the row and column rounded *down* to a multiple of 3:

```js
const boxRow = Math.floor(r / 3) * 3;   // 0, 3 or 6
const boxCol = Math.floor(c / 3) * 3;
```

```svg Row 4, column 7 is in the box that starts at row 3, column 6: both numbers rounded down to a multiple of 3
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 140" font-family="sans-serif" font-size="11">
  <g fill="none" stroke="#0369a1" stroke-width="2"><rect x="10" y="10" width="120" height="120"/><path d="M50 10 V130 M90 10 V130 M10 50 H130 M10 90 H130"/></g>
  <rect x="90" y="50" width="40" height="40" fill="#e0f2fe" stroke="#0369a1"/>
  <circle cx="113" cy="68" r="4" fill="#d97706"/>
  <text x="150" y="40">cell: row 4, col 7</text>
  <text x="150" y="64">boxRow = floor(4 / 3) × 3 = 3</text>
  <text x="150" y="88">boxCol = floor(7 / 3) × 3 = 6</text>
  <text x="150" y="112">box covers rows 3–5, cols 6–8</text>
</svg>
```

Click a cell: the page shows its index, row, column and box, and highlights its row, column and box, all worked out from the index alone.

check: js | a flat array of 81 cells | /grid\.flat\(\)/ | const cells = grid.flat();
check: js | row and column from an index | /Math\.floor\(\s*i\s*\/\s*9\s*\)[\s\S]*i\s*%\s*9/ | Math.floor(i / 9) and i % 9
check: js | the box's first row | /Math\.floor\([^;]*?\/\s*3\s*\)\s*\*\s*3/ | Math.floor(r / 3) * 3

quiz: Which row and column is index 40?
- [x] Row 4, column 4, the center of the board
- [ ] Row 40, column 0
- [ ] Row 0, column 4
why: floor(40 / 9) = 4 and 40 % 9 = 4.

quiz: Which box does row 7, column 2 belong to?
- [ ] The box starting at row 7, column 2
- [x] The box starting at row 6, column 0
- [ ] The box starting at row 3, column 0
why: floor(7 / 3) × 3 = 6 and floor(2 / 3) × 3 = 0.

```js flat
const cells = grid.flat();
const rowOf = (i) => Math.floor(i / 9);
const colOf = (i) => i % 9;
const indexOf = (r, c) => r * 9 + c;
const boxOf = (i) => Math.floor(rowOf(i) / 3) * 3 * 9 + Math.floor(colOf(i) / 3) * 3;

function highlight(i) {
  const box = boxOf(i);
  for (const td of board.querySelectorAll('td')) {
    const j = indexOf(Number(td.dataset.r), Number(td.dataset.c));
    td.classList.toggle('here', j === i);
    td.classList.toggle('peer', j !== i && (rowOf(j) === rowOf(i) || colOf(j) === colOf(i) || boxOf(j) === box));
  }
}

board.addEventListener('click', (e) => {
  const td = e.target.closest('td');
  if (!td) return;
  const i = indexOf(Number(td.dataset.r), Number(td.dataset.c));
  highlight(i);
  info.textContent = `index ${i} · row ${rowOf(i)}, col ${colOf(i)} · box starts at row ${Math.floor(rowOf(i) / 3) * 3}, col ${Math.floor(colOf(i) / 3) * 3}`;
});
```

## Step: Peers, worked out once
time: 15

Every Sudoku rule is about a cell's **peers**: the other cells in its row, column and box. Each cell has exactly **20** (8 in its row, 8 in its column, and 4 more in its box that weren't already counted).

A solver asks "who are this cell's peers?" millions of times, so don't work it out every time. Compute all 81 lists **once** at the start and keep them:

```js
const PEERS = cells.map((_, i) => [...new Set([...rowCells, ...colCells, ...boxCells])].filter((j) => j !== i));
```

The `Set` removes the cells that are in both the row and the box (or the column and the box), and `filter` takes out the cell itself.

```svg A cell's 20 peers: 8 in its row, 8 in its column, and 4 more in its box that aren't already counted
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 140" font-family="sans-serif" font-size="11">
  <g fill="#f8fafc" stroke="#cbd5e1">
    <rect x="10" y="10" width="120" height="120"/>
  </g>
  <rect x="10" y="50" width="120" height="13" fill="#bae6fd"/><rect x="50" y="10" width="13" height="120" fill="#bae6fd"/>
  <rect x="50" y="50" width="40" height="40" fill="#7dd3fc" opacity=".6"/>
  <rect x="50" y="50" width="13" height="13" fill="#fde68a"/>
  <text x="150" y="40">8 in the row</text><text x="150" y="60">8 in the column</text><text x="150" y="80">+ 4 more in the box</text><text x="150" y="104" font-weight="700">= 20 peers</text>
</svg>
```

With peers ready, finding mistakes is a short loop: a cell **clashes** if any peer has the same value. Click **Break it** to put a duplicate on the board and see the clashes light up.

check: js | every cell's peers computed once | /const\s+PEERS\s*=\s*cells\.map\(/ | const PEERS = cells.map((_, i) => ...)
check: js | removing the doubles with a Set | /new\s+Set\(\s*\[\s*\.\.\./ | [...new Set([...row, ...col, ...box])]
check: js | a clash when a peer has the same value | /PEERS\[\s*i\s*\]\.some\(/ | PEERS[i].some((j) => cells[j] === cells[i])

quiz: How many peers does every Sudoku cell have?
- [ ] 24
- [x] 20
- [ ] 27
why: 8 in the row + 8 in the column + 4 box cells not already counted = 20.

quiz: Why are the peers computed once instead of each time they're needed?
- [x] A solver asks millions of times; working them out once makes every later check a quick lookup
- [ ] Peers change during a game
- [ ] JavaScript can only compute them at the start
why: Precomputing answers to repeated questions is a classic speed-up.

```js peers
const PEERS = cells.map((_, i) => {
  const r = rowOf(i);
  const c = colOf(i);
  const box = boxOf(i);
  const row = Array.from({ length: 9 }, (_, k) => indexOf(r, k));
  const col = Array.from({ length: 9 }, (_, k) => indexOf(k, c));
  const inBox = Array.from({ length: 9 }, (_, k) => box + Math.floor(k / 3) * 9 + (k % 3));
  return [...new Set([...row, ...col, ...inBox])].filter((j) => j !== i);
});

function showClashes() {
  for (const td of board.querySelectorAll('td')) {
    const i = indexOf(Number(td.dataset.r), Number(td.dataset.c));
    td.textContent = cells[i];
    td.classList.toggle('clash', PEERS[i].some((j) => cells[j] === cells[i]));
  }
}

const breakBtn = document.createElement('button');
breakBtn.textContent = 'Break it';
breakBtn.addEventListener('click', () => {
  cells[0] = cells[1];
  showClashes();
  info.textContent = `Cell 0 now copies cell 1 (${cells[1]}). Every peer with that value clashes. Cell 0 has ${PEERS[0].length} peers.`;
});
board.after(breakBtn);
showClashes();
```

## Finish

Grids are just arrays now. You learned:

- An **array of rows** with `grid[row][col]`, built safely with `Array.from`
- A **flat array** with `Math.floor(i / 9)`, `i % 9` and `row * 9 + col`
- **Box math**: round down to a multiple of 3
- **Peers** computed once, with a `Set` and `filter`
- Finding **clashes** with `some()`

### Challenges

1. Write `rotate(grid)` that turns an array of rows 90° clockwise (row r becomes column 8 − r).
2. Count how many times each digit appears on the board with a 10-slot array.
3. Change the board size to 4 x 4 with 2 x 2 boxes by replacing every 9 and 3 with constants.

### Next

**Bitmasks**: keep a cell's possible digits in one number.
