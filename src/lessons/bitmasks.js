// Built from guides/bitmasks.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "bitmasks",
 "title": "Bitmasks",
 "goals": [
  "Read a number as a row of on/off bits and write it in binary",
  "Turn a bit on, off and test it with |, & and ~ and the shift 1 << d",
  "Count the bits that are on, and spot a mask with exactly one bit",
  "Combine many sets at once with | and remove them with & ~",
  "Use a mask to find which digits can still go in a Sudoku cell"
 ],
 "prereqs": [
  "The Grids as 2D arrays lesson (peers and a flat board)"
 ],
 "sessions": [
  {
   "title": "Nine switches in one number",
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
   "bits": "",
   "count": "",
   "candidates": ""
  }
 },
 "steps": [
  {
   "title": "A number is a row of switches",
   "body": "Computers store every number in **binary**: ones and zeros, called **bits**. The number 6 is `110` in binary, which means \"4 + 2\". Each position is one switch:\n\n```svg The number 556 in binary: bits 2, 3, 5 and 9 are on, so it stands for the digits 2, 3, 5 and 9\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <g text-anchor=\"middle\">\n    <text x=\"25\" y=\"18\">9</text><text x=\"55\" y=\"18\">8</text><text x=\"85\" y=\"18\">7</text><text x=\"115\" y=\"18\">6</text><text x=\"145\" y=\"18\">5</text><text x=\"175\" y=\"18\">4</text><text x=\"205\" y=\"18\">3</text><text x=\"235\" y=\"18\">2</text><text x=\"265\" y=\"18\">1</text><text x=\"295\" y=\"18\">0</text>\n  </g>\n  <g stroke=\"#0369a1\"><rect x=\"10\" y=\"26\" width=\"30\" height=\"30\" fill=\"#38bdf8\"/><rect x=\"40\" y=\"26\" width=\"30\" height=\"30\" fill=\"#f8fafc\"/><rect x=\"70\" y=\"26\" width=\"30\" height=\"30\" fill=\"#f8fafc\"/><rect x=\"100\" y=\"26\" width=\"30\" height=\"30\" fill=\"#f8fafc\"/><rect x=\"130\" y=\"26\" width=\"30\" height=\"30\" fill=\"#38bdf8\"/><rect x=\"160\" y=\"26\" width=\"30\" height=\"30\" fill=\"#f8fafc\"/><rect x=\"190\" y=\"26\" width=\"30\" height=\"30\" fill=\"#38bdf8\"/><rect x=\"220\" y=\"26\" width=\"30\" height=\"30\" fill=\"#38bdf8\"/><rect x=\"250\" y=\"26\" width=\"30\" height=\"30\" fill=\"#f8fafc\"/><rect x=\"280\" y=\"26\" width=\"30\" height=\"30\" fill=\"#e2e8f0\"/></g>\n  <g text-anchor=\"middle\"><text x=\"25\" y=\"46\">1</text><text x=\"55\" y=\"46\">0</text><text x=\"85\" y=\"46\">0</text><text x=\"115\" y=\"46\">0</text><text x=\"145\" y=\"46\">1</text><text x=\"175\" y=\"46\">0</text><text x=\"205\" y=\"46\">1</text><text x=\"235\" y=\"46\">1</text><text x=\"265\" y=\"46\">0</text><text x=\"295\" y=\"46\">0</text></g>\n  <text x=\"165\" y=\"80\" text-anchor=\"middle\">bit d stands for digit d (bit 0 is never used)</text>\n  <text x=\"165\" y=\"100\" text-anchor=\"middle\">= 512 + 32 + 8 + 4 = 556 → digits {2, 3, 5, 9}</text>\n</svg>\n```\n\nSo one number can hold a whole **set of digits**: bit 1 on means \"1 is possible\", bit 2 on means \"2 is possible\", and so on up to bit 9. That's a **bitmask**. Pencil marks in a Sudoku cell fit in a single number.\n\nWhy bother, when an array or a Set would work? Because the computer does these operations on all the bits **at once**, in one step. A Sudoku solver checks possible digits millions of times, and bitmasks make each check almost free. You'll see bitmasks again in graphics, permissions (\"can read, can write, can delete\") and networking (the subnet masks of the Academy's Network+ lessons).",
   "session": 0,
   "minutes": 12,
   "kind": "read"
  },
  {
   "title": "On, off and test",
   "body": "Four operators do all the work. `1 << d` is \"1 shifted left d places\": a number with **only bit d** on.\n\n| You want to | Write | Read it as |\n|---|---|---|\n| turn digit d on | `mask \\|= 1 << d` | OR: keep everything, add bit d |\n| turn digit d off | `mask &= ~(1 << d)` | AND with everything except bit d |\n| test digit d | `(mask & (1 << d)) !== 0` | is bit d on? |\n| flip digit d | `mask ^= 1 << d` | XOR: on becomes off, off becomes on |\n\nTick the boxes on the page: each one flips a bit, and you see the mask as a number and in binary (`mask.toString(2)`).",
   "checks": [
    {
     "pane": "js",
     "label": "a bit for each digit with a shift",
     "test": "/1\\s*<<\\s*d/",
     "hint": "1 << d"
    },
    {
     "pane": "js",
     "label": "flipping a bit with XOR",
     "test": "/mask\\s*\\^=/",
     "hint": "mask ^= 1 << d;"
    },
    {
     "pane": "js",
     "label": "testing whether a bit is on",
     "test": "/\\(\\s*\\w+\\s*&\\s*\\(\\s*1\\s*<<\\s*d\\s*\\)\\s*\\)\\s*!==\\s*0/",
     "hint": "const has = (m, d) => (m & (1 << d)) !== 0;"
    },
    {
     "pane": "js",
     "label": "showing it in binary",
     "test": "/toString\\(\\s*2\\s*\\)/",
     "hint": "mask.toString(2)"
    }
   ],
   "quiz": [
    {
     "q": "What is `1 << 3`?",
     "options": [
      "3",
      "8, binary 1000: only bit 3 is on",
      "13"
     ],
     "answer": 1,
     "why": "Shifting 1 left three places gives 1000 in binary, which is 8."
    },
    {
     "q": "The mask is 12 (binary 1100). Is digit 2 possible?",
     "options": [
      "Yes: 12 & 4 is 4, not 0, so bit 2 is on",
      "No: the mask would have to be exactly 2",
      "No: only digit 12 is possible"
     ],
     "answer": 0,
     "why": "1 << 2 is 4, and 1100 & 0100 = 0100, so bit 2 is set (bit 3 is on too, so digit 3 is also possible)."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"card\">\n  <h1>Bitmasks</h1>\n  <fieldset id=\"digits\" class=\"digits\"><legend>Possible digits</legend></fieldset>\n  <p class=\"mono\">mask = <strong id=\"num\">0</strong> · binary <strong id=\"bin\">0</strong></p>\n  <p id=\"summary\" class=\"summary\"></p>\n  <section id=\"row\"></section>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #f0f9ff;\n  color: #0c4a6e;\n}\n\n.card { width: min(460px, 100% - 24px); padding: 16px; background: #fff; border-radius: 16px; }\nh1 { margin-top: 0; font-size: 1.3rem; }\n.digits { display: flex; flex-wrap: wrap; gap: 8px; border: 1px solid #bae6fd; border-radius: 10px; }\n.digits label { display: flex; gap: 4px; align-items: center; font-weight: 600; }\n.mono { font-family: ui-monospace, Menlo, Consolas, monospace; }\n.summary { min-height: 1.4em; }\n.cells { display: grid; grid-template-columns: repeat(9, 1fr); gap: 3px; margin: 8px 0; }\n.cell { padding: 6px 2px; text-align: center; border: 1px solid #bae6fd; border-radius: 6px; font-weight: 700; }\n.cell.empty { color: #0284c7; font-weight: 400; font-size: .7rem; }"
   },
   "js": {
    "bits": "let mask = 0;\nconst digits = document.getElementById('digits');\n\nfor (let d = 1; d <= 9; d++) {\n  const label = document.createElement('label');\n  const box = document.createElement('input');\n  box.type = 'checkbox';\n  box.value = d;\n  label.append(box, String(d));\n  digits.append(label);\n}\n\nconst has = (m, d) => (m & (1 << d)) !== 0;\n\nfunction showMask() {\n  document.getElementById('num').textContent = mask;\n  document.getElementById('bin').textContent = mask.toString(2);\n  for (const box of digits.querySelectorAll('input')) box.checked = has(mask, Number(box.value));\n}\n\ndigits.addEventListener('change', (e) => {\n  const d = Number(e.target.value);\n  mask ^= 1 << d;\n  showMask();\n});\n\nshowMask();"
   }
  },
  {
   "title": "Counting bits, and \"only one left\"",
   "body": "Two questions the solver asks all the time:\n\n- **How many digits are possible?** Count the bits that are on. A short loop is clear:\n  `for (let d = 1; d <= 9; d++) if (has(mask, d)) n++;`\n- **Is exactly one digit possible?** There's a famous trick: `mask & (mask - 1)` turns off the lowest bit that's on. If the result is 0, there was only one bit, so the cell has only one possible digit and the solver can fill it in. (A mask of 0 means *no* digit fits: a mistake somewhere.)\n\n```svg mask & (mask − 1) removes the lowest on bit: if nothing is left, exactly one bit was on\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <g font-family=\"ui-monospace, monospace\">\n    <text x=\"10\" y=\"22\">mask      0000100000  (only digit 5)</text>\n    <text x=\"10\" y=\"42\">mask − 1  0000011111</text>\n    <text x=\"10\" y=\"62\">AND       0000000000  → exactly one</text>\n    <text x=\"10\" y=\"90\" fill=\"#475569\">mask 0001100000 (5 and 6): AND gives 0001000000, not 0</text>\n  </g>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "listing the digits a mask holds",
     "test": "/function\\s+digitsOf\\s*\\(/",
     "hint": "function digitsOf(m) { ... }"
    },
    {
     "pane": "js",
     "label": "the one-bit trick",
     "test": "/m\\s*&\\s*\\(\\s*m\\s*-\\s*1\\s*\\)/",
     "hint": "(m & (m - 1)) === 0"
    }
   ],
   "quiz": [
    {
     "q": "What does `mask & (mask - 1)` do?",
     "options": [
      "Doubles the mask",
      "Turns off the lowest bit that's on",
      "Turns every bit on"
     ],
     "answer": 1,
     "why": "Subtracting 1 flips the lowest 1 and everything below it; AND keeps only what's above."
    },
    {
     "q": "A cell's mask is 0. What does that mean in Sudoku?",
     "options": [
      "No digit fits, so an earlier digit must be wrong",
      "Any digit fits",
      "The cell is already solved"
     ],
     "answer": 0,
     "why": "An empty set of possibilities is a contradiction; the solver will have to back up."
    }
   ],
   "session": 0,
   "minutes": 12,
   "js": {
    "count": "function digitsOf(m) {\n  const out = [];\n  for (let d = 1; d <= 9; d++) if (has(m, d)) out.push(d);\n  return out;\n}\n\nconst onlyOne = (m) => m !== 0 && (m & (m - 1)) === 0;\n\nconst summary = document.getElementById('summary');\nconst showSummary = () => {\n  const list = digitsOf(mask);\n  summary.textContent = mask === 0 ? 'No digit possible: a dead end.'\n    : onlyOne(mask) ? `Only one digit possible: ${list[0]}. The solver can fill it in.`\n    : `${list.length} digits possible: ${list.join(', ')}`;\n};\n\ndigits.addEventListener('change', showSummary);\nshowSummary();"
   }
  },
  {
   "title": "Possible digits for real cells",
   "body": "Now the payoff. For an empty cell, the possible digits are **all digits** minus every digit its peers already use. With masks that's two lines:\n\n```js\nconst ALL = 0b1111111110;              // bits 1 to 9 on\nlet used = 0;\nfor (const v of peerValues) used |= 1 << v;\nconst possible = ALL & ~used;\n```\n\n`|=` gathers every used digit into one mask, `~used` flips it to \"every digit *not* used\", and `& ALL` keeps only bits 1 to 9.\n\n```svg Possible digits: ALL (1–9) AND NOT the digits the peers use\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <g font-family=\"ui-monospace, monospace\">\n    <text x=\"10\" y=\"22\">ALL         1111111110   digits 1–9</text>\n    <text x=\"10\" y=\"42\">used        0101101110   peers have 1,2,3,5,6,8</text>\n    <text x=\"10\" y=\"62\">ALL & ~used 1010010000   → 4, 7, 9</text>\n  </g>\n</svg>\n```\n\nThe page shows one Sudoku row with three empty cells. Each empty cell shows the digits still possible from the row alone. The Sudoku Solver does exactly this, using all 20 peers.",
   "checks": [
    {
     "pane": "js",
     "label": "all nine digits in one mask",
     "test": "/0b1111111110/",
     "hint": "const ALL = 0b1111111110;"
    },
    {
     "pane": "js",
     "label": "gathering the used digits",
     "test": "/used\\s*\\|=\\s*1\\s*<<\\s*\\w+/",
     "hint": "used |= 1 << v;"
    },
    {
     "pane": "js",
     "label": "what's left",
     "test": "/ALL\\s*&\\s*~\\s*used/",
     "hint": "ALL & ~used"
    }
   ],
   "quiz": [
    {
     "q": "A row already has 1 to 8. What does `ALL & ~used` leave?",
     "options": [
      "Only bit 9, so the cell must be 9",
      "Every digit",
      "Nothing"
     ],
     "answer": 0,
     "why": "used has bits 1–8; flipping and keeping 1–9 leaves only bit 9."
    },
    {
     "q": "Why gather the peers' digits with `|=` instead of `+=`?",
     "options": [
      "|= is shorter to type",
      "OR turns a bit on once even if two peers have the same digit; adding would carry into other bits",
      "+= doesn't work on numbers"
     ],
     "answer": 1,
     "why": "OR is set union; addition would break the \"one bit per digit\" meaning."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "candidates": "const ALL = 0b1111111110;\nconst row = [5, 3, 0, 6, 0, 8, 1, 0, 2];   // 0 = empty\n\nfunction possibleFor(values) {\n  let used = 0;\n  for (const v of values) if (v) used |= 1 << v;\n  return ALL & ~used;\n}\n\nconst rowBox = document.createElement('div');\nrowBox.className = 'cells';\nrowBox.replaceChildren(...row.map((v) => {\n  const el = document.createElement('div');\n  el.className = v ? 'cell' : 'cell empty';\n  el.textContent = v || digitsOf(possibleFor(row)).join(' ');\n  return el;\n}));\nconst title = document.createElement('p');\ntitle.textContent = 'A Sudoku row: empty cells show the digits still possible.';\ndocument.getElementById('row').replaceChildren(title, rowBox);"
   }
  }
 ],
 "finish": "You can pack a set of digits into one number now. You learned:\n\n- **Binary** and reading a number as a row of bits\n- `1 << d`, **OR** to turn on, **AND NOT** to turn off, **AND** to test, **XOR** to flip\n- **Counting** bits, and `m & (m - 1)` to spot exactly one\n- **Union** of many sets with `|=`, and \"everything else\" with `& ~`\n- **Possible digits** for a Sudoku cell from its peers\n\n### Challenges\n\n1. Write `countBits(m)` using the `m & (m - 1)` trick in a loop (each step removes one bit).\n2. Store a week's chosen days (Sun to Sat) as a 7-bit mask, and show them as checkboxes.\n3. Find the empty cell with the fewest possible digits in a row: that's where a solver should guess first.\n\n### Next\n\n**Recursion and backtracking**: solve any Sudoku by guessing, checking and undoing."
};
