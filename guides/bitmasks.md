---
id: bitmasks
title: Bitmasks
blocks-html: page
blocks-css: base
blocks-js: bits, count, candidates
goals: Read a number as a row of on/off bits and write it in binary; Turn a bit on, off and test it with |, & and ~ and the shift 1 << d; Count the bits that are on, and spot a mask with exactly one bit; Combine many sets at once with | and remove them with & ~; Use a mask to find which digits can still go in a Sudoku cell
prereqs: The Grids as 2D arrays lesson (peers and a flat board)
---

## Session: Nine switches in one number

## Step: A number is a row of switches
time: 12
kind: read

Computers store every number in **binary**: ones and zeros, called **bits**. The number 6 is `110` in binary, which means "4 + 2". Each position is one switch:

```svg The number 556 in binary: bits 2, 3, 5 and 9 are on, so it stands for the digits 2, 3, 5 and 9
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" font-family="sans-serif" font-size="12">
  <g text-anchor="middle">
    <text x="25" y="18">9</text><text x="55" y="18">8</text><text x="85" y="18">7</text><text x="115" y="18">6</text><text x="145" y="18">5</text><text x="175" y="18">4</text><text x="205" y="18">3</text><text x="235" y="18">2</text><text x="265" y="18">1</text><text x="295" y="18">0</text>
  </g>
  <g stroke="#0369a1"><rect x="10" y="26" width="30" height="30" fill="#38bdf8"/><rect x="40" y="26" width="30" height="30" fill="#f8fafc"/><rect x="70" y="26" width="30" height="30" fill="#f8fafc"/><rect x="100" y="26" width="30" height="30" fill="#f8fafc"/><rect x="130" y="26" width="30" height="30" fill="#38bdf8"/><rect x="160" y="26" width="30" height="30" fill="#f8fafc"/><rect x="190" y="26" width="30" height="30" fill="#38bdf8"/><rect x="220" y="26" width="30" height="30" fill="#38bdf8"/><rect x="250" y="26" width="30" height="30" fill="#f8fafc"/><rect x="280" y="26" width="30" height="30" fill="#e2e8f0"/></g>
  <g text-anchor="middle"><text x="25" y="46">1</text><text x="55" y="46">0</text><text x="85" y="46">0</text><text x="115" y="46">0</text><text x="145" y="46">1</text><text x="175" y="46">0</text><text x="205" y="46">1</text><text x="235" y="46">1</text><text x="265" y="46">0</text><text x="295" y="46">0</text></g>
  <text x="165" y="80" text-anchor="middle">bit d stands for digit d (bit 0 is never used)</text>
  <text x="165" y="100" text-anchor="middle">= 512 + 32 + 8 + 4 = 556 → digits {2, 3, 5, 9}</text>
</svg>
```

So one number can hold a whole **set of digits**: bit 1 on means "1 is possible", bit 2 on means "2 is possible", and so on up to bit 9. That's a **bitmask**. Pencil marks in a Sudoku cell fit in a single number.

Why bother, when an array or a Set would work? Because the computer does these operations on all the bits **at once**, in one step. A Sudoku solver checks possible digits millions of times, and bitmasks make each check almost free. You'll see bitmasks again in graphics, permissions ("can read, can write, can delete") and networking (the subnet masks of the Academy's Network+ lessons).

## Step: On, off and test
time: 15

Four operators do all the work. `1 << d` is "1 shifted left d places": a number with **only bit d** on.

| You want to | Write | Read it as |
|---|---|---|
| turn digit d on | `mask \|= 1 << d` | OR: keep everything, add bit d |
| turn digit d off | `mask &= ~(1 << d)` | AND with everything except bit d |
| test digit d | `(mask & (1 << d)) !== 0` | is bit d on? |
| flip digit d | `mask ^= 1 << d` | XOR: on becomes off, off becomes on |

Tick the boxes on the page: each one flips a bit, and you see the mask as a number and in binary (`mask.toString(2)`).

check: js | a bit for each digit with a shift | /1\s*<<\s*d/ | 1 << d
check: js | flipping a bit with XOR | /mask\s*\^=/ | mask ^= 1 << d;
check: js | testing whether a bit is on | /\(\s*\w+\s*&\s*\(\s*1\s*<<\s*d\s*\)\s*\)\s*!==\s*0/ | const has = (m, d) => (m & (1 << d)) !== 0;
check: js | showing it in binary | /toString\(\s*2\s*\)/ | mask.toString(2)

quiz: What is `1 << 3`?
- [ ] 3
- [x] 8, binary 1000: only bit 3 is on
- [ ] 13
why: Shifting 1 left three places gives 1000 in binary, which is 8.

quiz: The mask is 12 (binary 1100). Is digit 2 possible?
- [x] Yes: 12 & 4 is 4, not 0, so bit 2 is on
- [ ] No: the mask would have to be exactly 2
- [ ] No: only digit 12 is possible
why: 1 << 2 is 4, and 1100 & 0100 = 0100, so bit 2 is set (bit 3 is on too, so digit 3 is also possible).

```html page
<main class="card">
  <h1>Bitmasks</h1>
  <fieldset id="digits" class="digits"><legend>Possible digits</legend></fieldset>
  <p class="mono">mask = <strong id="num">0</strong> · binary <strong id="bin">0</strong></p>
  <p id="summary" class="summary"></p>
  <section id="row"></section>
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

.card { width: min(460px, 100% - 24px); padding: 16px; background: #fff; border-radius: 16px; }
h1 { margin-top: 0; font-size: 1.3rem; }
.digits { display: flex; flex-wrap: wrap; gap: 8px; border: 1px solid #bae6fd; border-radius: 10px; }
.digits label { display: flex; gap: 4px; align-items: center; font-weight: 600; }
.mono { font-family: ui-monospace, Menlo, Consolas, monospace; }
.summary { min-height: 1.4em; }
.cells { display: grid; grid-template-columns: repeat(9, 1fr); gap: 3px; margin: 8px 0; }
.cell { padding: 6px 2px; text-align: center; border: 1px solid #bae6fd; border-radius: 6px; font-weight: 700; }
.cell.empty { color: #0284c7; font-weight: 400; font-size: .7rem; }
```

```js bits
let mask = 0;
const digits = document.getElementById('digits');

for (let d = 1; d <= 9; d++) {
  const label = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.value = d;
  label.append(box, String(d));
  digits.append(label);
}

const has = (m, d) => (m & (1 << d)) !== 0;

function showMask() {
  document.getElementById('num').textContent = mask;
  document.getElementById('bin').textContent = mask.toString(2);
  for (const box of digits.querySelectorAll('input')) box.checked = has(mask, Number(box.value));
}

digits.addEventListener('change', (e) => {
  const d = Number(e.target.value);
  mask ^= 1 << d;
  showMask();
});

showMask();
```

## Step: Counting bits, and "only one left"
time: 12

Two questions the solver asks all the time:

- **How many digits are possible?** Count the bits that are on. A short loop is clear:
  `for (let d = 1; d <= 9; d++) if (has(mask, d)) n++;`
- **Is exactly one digit possible?** There's a famous trick: `mask & (mask - 1)` turns off the lowest bit that's on. If the result is 0, there was only one bit, so the cell has only one possible digit and the solver can fill it in. (A mask of 0 means *no* digit fits: a mistake somewhere.)

```svg mask & (mask − 1) removes the lowest on bit: if nothing is left, exactly one bit was on
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="12">
  <g font-family="ui-monospace, monospace">
    <text x="10" y="22">mask      0000100000  (only digit 5)</text>
    <text x="10" y="42">mask − 1  0000011111</text>
    <text x="10" y="62">AND       0000000000  → exactly one</text>
    <text x="10" y="90" fill="#475569">mask 0001100000 (5 and 6): AND gives 0001000000, not 0</text>
  </g>
</svg>
```

check: js | listing the digits a mask holds | /function\s+digitsOf\s*\(/ | function digitsOf(m) { ... }
check: js | the one-bit trick | /m\s*&\s*\(\s*m\s*-\s*1\s*\)/ | (m & (m - 1)) === 0

quiz: What does `mask & (mask - 1)` do?
- [ ] Doubles the mask
- [x] Turns off the lowest bit that's on
- [ ] Turns every bit on
why: Subtracting 1 flips the lowest 1 and everything below it; AND keeps only what's above.

quiz: A cell's mask is 0. What does that mean in Sudoku?
- [x] No digit fits, so an earlier digit must be wrong
- [ ] Any digit fits
- [ ] The cell is already solved
why: An empty set of possibilities is a contradiction; the solver will have to back up.

```js count
function digitsOf(m) {
  const out = [];
  for (let d = 1; d <= 9; d++) if (has(m, d)) out.push(d);
  return out;
}

const onlyOne = (m) => m !== 0 && (m & (m - 1)) === 0;

const summary = document.getElementById('summary');
const showSummary = () => {
  const list = digitsOf(mask);
  summary.textContent = mask === 0 ? 'No digit possible: a dead end.'
    : onlyOne(mask) ? `Only one digit possible: ${list[0]}. The solver can fill it in.`
    : `${list.length} digits possible: ${list.join(', ')}`;
};

digits.addEventListener('change', showSummary);
showSummary();
```

## Step: Possible digits for real cells
time: 15

Now the payoff. For an empty cell, the possible digits are **all digits** minus every digit its peers already use. With masks that's two lines:

```js
const ALL = 0b1111111110;              // bits 1 to 9 on
let used = 0;
for (const v of peerValues) used |= 1 << v;
const possible = ALL & ~used;
```

`|=` gathers every used digit into one mask, `~used` flips it to "every digit *not* used", and `& ALL` keeps only bits 1 to 9.

```svg Possible digits: ALL (1–9) AND NOT the digits the peers use
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="12">
  <g font-family="ui-monospace, monospace">
    <text x="10" y="22">ALL         1111111110   digits 1–9</text>
    <text x="10" y="42">used        0101101110   peers have 1,2,3,5,6,8</text>
    <text x="10" y="62">ALL & ~used 1010010000   → 4, 7, 9</text>
  </g>
</svg>
```

The page shows one Sudoku row with three empty cells. Each empty cell shows the digits still possible from the row alone. The Sudoku Solver does exactly this, using all 20 peers.

check: js | all nine digits in one mask | /0b1111111110/ | const ALL = 0b1111111110;
check: js | gathering the used digits | /used\s*\|=\s*1\s*<<\s*\w+/ | used |= 1 << v;
check: js | what's left | /ALL\s*&\s*~\s*used/ | ALL & ~used

quiz: A row already has 1 to 8. What does `ALL & ~used` leave?
- [x] Only bit 9, so the cell must be 9
- [ ] Every digit
- [ ] Nothing
why: used has bits 1–8; flipping and keeping 1–9 leaves only bit 9.

quiz: Why gather the peers' digits with `|=` instead of `+=`?
- [ ] |= is shorter to type
- [x] OR turns a bit on once even if two peers have the same digit; adding would carry into other bits
- [ ] += doesn't work on numbers
why: OR is set union; addition would break the "one bit per digit" meaning.

```js candidates
const ALL = 0b1111111110;
const row = [5, 3, 0, 6, 0, 8, 1, 0, 2];   // 0 = empty

function possibleFor(values) {
  let used = 0;
  for (const v of values) if (v) used |= 1 << v;
  return ALL & ~used;
}

const rowBox = document.createElement('div');
rowBox.className = 'cells';
rowBox.replaceChildren(...row.map((v) => {
  const el = document.createElement('div');
  el.className = v ? 'cell' : 'cell empty';
  el.textContent = v || digitsOf(possibleFor(row)).join(' ');
  return el;
}));
const title = document.createElement('p');
title.textContent = 'A Sudoku row: empty cells show the digits still possible.';
document.getElementById('row').replaceChildren(title, rowBox);
```

## Finish

You can pack a set of digits into one number now. You learned:

- **Binary** and reading a number as a row of bits
- `1 << d`, **OR** to turn on, **AND NOT** to turn off, **AND** to test, **XOR** to flip
- **Counting** bits, and `m & (m - 1)` to spot exactly one
- **Union** of many sets with `|=`, and "everything else" with `& ~`
- **Possible digits** for a Sudoku cell from its peers

### Challenges

1. Write `countBits(m)` using the `m & (m - 1)` trick in a loop (each step removes one bit).
2. Store a week's chosen days (Sun to Sat) as a 7-bit mask, and show them as checkboxes.
3. Find the empty cell with the fewest possible digits in a row: that's where a solver should guess first.

### Next

**Recursion and backtracking**: solve any Sudoku by guessing, checking and undoing.
