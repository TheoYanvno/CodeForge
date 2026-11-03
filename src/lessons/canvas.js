// Built from guides/canvas.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "canvas",
 "title": "Canvas drawing",
 "goals": [
  "Add a <canvas> to a page and get its 2D drawing context",
  "Explain the canvas coordinate system, where y grows downward",
  "Draw rectangles, a grid of cells, circles and text",
  "Turn grid cells into pixel positions with one cell-size constant",
  "Redraw the whole picture from data instead of changing old drawings"
 ],
 "prereqs": [
  "The HTML & CSS basics and JavaScript basics lessons (elements, ids, variables, functions and for loops)"
 ],
 "sessions": [
  {
   "title": "Drawing on a canvas",
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
   "grid": "",
   "shapes": ""
  }
 },
 "steps": [
  {
   "title": "What a canvas is, and why games use it",
   "body": "Most of a web page is made of elements: headings, paragraphs, buttons. Each one is a separate thing the browser lays out for you. A **canvas** is different: it's one rectangle of pixels, and JavaScript paints on it, like a sheet of paper you draw on with code.\n\nThat's why games use it. A game like Snake redraws the whole board many times a second. Making and moving hundreds of `<div>` cells would be slow and awkward; painting squares on a canvas is fast and simple.\n\n### Coordinates\n\nEvery point on a canvas has an **x** (how far from the left edge) and a **y** (how far from the top). Point (0, 0) is the **top-left corner**, and y gets bigger as you go **down**. That's the opposite of the graphs you drew in math class, and it's the number one thing that trips people up.\n\n```svg The canvas coordinate system: (0, 0) is the top-left corner, x grows to the right and y grows downward\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 200\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"40\" y=\"30\" width=\"240\" height=\"150\" fill=\"#eef2ff\" stroke=\"#6366f1\" stroke-width=\"2\"/>\n  <circle cx=\"40\" cy=\"30\" r=\"5\" fill=\"#ef4444\"/><text x=\"10\" y=\"20\" fill=\"#111\">(0, 0)</text>\n  <path d=\"M40 30 H300\" stroke=\"#111\" stroke-width=\"2\" marker-end=\"url(#a)\"/><text x=\"288\" y=\"22\" fill=\"#111\">x</text>\n  <path d=\"M40 30 V196\" stroke=\"#111\" stroke-width=\"2\" marker-end=\"url(#a)\"/><text x=\"24\" y=\"196\" fill=\"#111\">y</text>\n  <circle cx=\"200\" cy=\"120\" r=\"5\" fill=\"#16a34a\"/><text x=\"160\" y=\"142\" fill=\"#111\">(160, 90)</text>\n  <path d=\"M40 120 H195 M200 30 V115\" stroke=\"#16a34a\" stroke-dasharray=\"4 3\"/>\n  <defs><marker id=\"a\" viewBox=\"0 0 10 10\" refX=\"8\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto\"><path d=\"M0 0 10 5 0 10z\" fill=\"#111\"/></marker></defs>\n</svg>\n```\n\n### The drawing context\n\nYou don't draw on the canvas element itself. You ask it for a **context**, an object full of drawing commands: `getContext('2d')`. Then `ctx.fillStyle = 'green'` picks a color and `ctx.fillRect(x, y, width, height)` paints a filled rectangle.\n\n> A canvas has no memory of *what* you drew, only the pixels. To move something, you clear and draw everything again. You'll see why that's a good thing in the last step.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "A canvas and its 2D context",
   "body": "Add a `<canvas>` to the page with a fixed size in pixels, then get its 2D context and paint the background.\n\n```js\nconst board = document.getElementById('board');\nconst ctx = board.getContext('2d');\nctx.fillStyle = '#0f172a';\nctx.fillRect(0, 0, board.width, board.height);\n```\n\n- `width=\"300\" height=\"300\"` on the element sets how many pixels the canvas has. Set it in HTML, not CSS: CSS only stretches the picture and makes it blurry.\n- `fillRect(0, 0, board.width, board.height)` starts at the top-left corner and covers the whole canvas.\n- `fillStyle` stays set until you change it, so set it right before each thing you paint.",
   "checks": [
    {
     "pane": "html",
     "label": "a canvas with id \"board\" and a size",
     "test": "/<canvas[^>]*id=[\"']board[\"'][^>]*width=[\"']\\d+[\"']/",
     "hint": "Add <canvas id=\"board\" width=\"300\" height=\"300\">"
    },
    {
     "pane": "js",
     "label": "the 2D context",
     "test": "/getContext\\(\\s*['\"]2d['\"]\\s*\\)/",
     "hint": "const ctx = board.getContext('2d')"
    },
    {
     "pane": "js",
     "label": "a filled background",
     "test": "/fillRect\\(\\s*0\\s*,\\s*0/",
     "hint": "ctx.fillRect(0, 0, board.width, board.height)"
    }
   ],
   "quiz": [
    {
     "q": "Why are the canvas's width and height set in the HTML instead of only in CSS?",
     "options": [
      "CSS can't change a canvas at all",
      "The attributes set how many pixels the canvas has; CSS only stretches them, which blurs the picture",
      "JavaScript can only read sizes from HTML"
     ],
     "answer": 1,
     "why": "A canvas has a real pixel size (the attributes) and a display size (CSS). If they differ, the browser scales the pixels."
    },
    {
     "q": "Where is the point (0, 0) on a canvas?",
     "options": [
      "The center",
      "The bottom-left corner",
      "The top-left corner"
     ],
     "answer": 2,
     "why": "x counts from the left edge and y counts down from the top edge."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main>\n  <h1>Canvas drawing</h1>\n  <canvas id=\"board\" width=\"300\" height=\"300\"></canvas>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #e2e8f0;\n}\n\nh1 { text-align: center; }\n\ncanvas {\n  display: block;\n  max-width: 100%;\n  border-radius: 8px;\n}"
   },
   "js": {
    "setup": "const board = document.getElementById('board');\nconst ctx = board.getContext('2d');\n\nctx.fillStyle = '#0f172a';\nctx.fillRect(0, 0, board.width, board.height);"
   }
  },
  {
   "title": "Drawing a grid of cells",
   "body": "Games like Snake think in **cells**, not pixels: \"the snake's head is in column 4, row 7\". Drawing turns a cell into pixels with one multiplication:\n\n```js\nconst CELL = 20;                  // each cell is 20 x 20 pixels\nconst x = column * CELL;\nconst y = row * CELL;\n```\n\n```svg Cell (column 3, row 2) starts at pixel (3 x 20, 2 x 20) = (60, 40)\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 170\" font-family=\"sans-serif\" font-size=\"12\">\n  <g stroke=\"#94a3b8\" fill=\"none\">\n    <path d=\"M20 20 H220 M20 40 H220 M20 60 H220 M20 80 H220 M20 100 H220 M20 120 H220\"/>\n    <path d=\"M20 20 V120 M40 20 V120 M60 20 V120 M80 20 V120 M100 20 V120 M120 20 V120 M140 20 V120 M160 20 V120 M180 20 V120 M200 20 V120 M220 20 V120\"/>\n  </g>\n  <rect x=\"80\" y=\"60\" width=\"20\" height=\"20\" fill=\"#22c55e\"/>\n  <text x=\"20\" y=\"14\" fill=\"#111\">columns 0, 1, 2, 3 ...</text>\n  <text x=\"230\" y=\"74\" fill=\"#111\">row 2</text>\n  <text x=\"40\" y=\"145\" fill=\"#111\">column 3 → x = 3 × 20 = 60 (+ the 20 px margin)</text>\n  <text x=\"40\" y=\"162\" fill=\"#111\">row 2 → y = 2 × 20 = 40</text>\n</svg>\n```\n\nA **nested loop** visits every cell: the outer loop goes through the rows, the inner loop through each column in that row. For each cell you draw a thin outline with `strokeRect`.\n\nWhy one `CELL` constant? Change it from 20 to 30 and the whole board grows, with no other edits. Keeping sizes in one place is a habit that pays off in every project.",
   "checks": [
    {
     "pane": "js",
     "label": "a cell size constant",
     "test": "/const\\s+CELL\\s*=\\s*\\d+/",
     "hint": "const CELL = 20;"
    },
    {
     "pane": "js",
     "label": "a loop over rows and columns",
     "test": "/for\\s*\\([^)]*row[\\s\\S]*for\\s*\\([^)]*col/",
     "hint": "for (let row = 0; ...) { for (let col = 0; ...) { ... } }"
    },
    {
     "pane": "js",
     "label": "each cell outlined",
     "test": "/strokeRect\\(/",
     "hint": "ctx.strokeRect(col * CELL, row * CELL, CELL, CELL)"
    }
   ],
   "quiz": [
    {
     "q": "With `CELL = 20`, where does the cell in column 5, row 1 start?",
     "options": [
      "(5, 1)",
      "(100, 20)",
      "(20, 100)"
     ],
     "answer": 1,
     "why": "x = column × CELL = 5 × 20 = 100 and y = row × CELL = 1 × 20 = 20."
    },
    {
     "q": "In the nested loop, how many times does `strokeRect` run on a 15 × 15 board?",
     "options": [
      "15",
      "30",
      "225"
     ],
     "answer": 2,
     "why": "The inner loop runs 15 times for each of the 15 rows: 15 × 15 = 225 cells."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "grid": "const CELL = 20;\nconst SIZE = board.width / CELL;   // 300 / 20 = 15 cells across and down\n\nfunction drawGrid() {\n  ctx.strokeStyle = '#1e293b';\n  for (let row = 0; row < SIZE; row++) {\n    for (let col = 0; col < SIZE; col++) {\n      ctx.strokeRect(col * CELL, row * CELL, CELL, CELL);\n    }\n  }\n}\n\ndrawGrid();"
   }
  },
  {
   "title": "Circles, text, and drawing from data",
   "body": "Rectangles are one command. Circles take two: start a **path**, then `arc(centerX, centerY, radius, startAngle, endAngle)`. Angles are in radians, and a full circle is `Math.PI * 2`. Text uses `fillText(text, x, y)`.\n\nNow the important idea. Put *what* to draw in plain data (an array of cells) and write one `draw()` function that **clears the canvas and paints everything from that data**. To move something, change the data and call `draw()` again.\n\n```svg Each frame: clear the canvas, then draw the background, grid and every item from the data\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"4\" y=\"25\" width=\"70\" height=\"40\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"39\" y=\"50\" text-anchor=\"middle\">data</text>\n  <rect x=\"94\" y=\"25\" width=\"70\" height=\"40\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#ef4444\"/><text x=\"129\" y=\"50\" text-anchor=\"middle\">clear</text>\n  <rect x=\"184\" y=\"25\" width=\"70\" height=\"40\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"219\" y=\"50\" text-anchor=\"middle\">draw all</text>\n  <rect x=\"274\" y=\"25\" width=\"52\" height=\"40\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"300\" y=\"50\" text-anchor=\"middle\">screen</text>\n  <path d=\"M74 45 H90 M164 45 H180 M254 45 H270\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"165\" y=\"85\" text-anchor=\"middle\">change the data → call draw() again</text>\n</svg>\n```\n\nWhy not erase just the old spot? Because the picture and the data would drift apart the moment one erase is missed. Redrawing everything from the data means the screen is always exactly what the data says. This is how Snake draws every frame.",
   "checks": [
    {
     "pane": "js",
     "label": "a draw() function that clears first",
     "test": "/function\\s+draw\\s*\\(\\s*\\)\\s*\\{[\\s\\S]*clearRect\\(/",
     "hint": "function draw() { ctx.clearRect(0, 0, board.width, board.height); ... }"
    },
    {
     "pane": "js",
     "label": "a circle",
     "test": "/\\.arc\\(/",
     "hint": "ctx.arc(x, y, radius, 0, Math.PI * 2)"
    },
    {
     "pane": "js",
     "label": "text on the canvas",
     "test": "/fillText\\(/",
     "hint": "ctx.fillText('Hello', 10, 20)"
    }
   ],
   "quiz": [
    {
     "q": "What does `ctx.arc(50, 50, 10, 0, Math.PI * 2)` describe?",
     "options": [
      "A square at (50, 50)",
      "A full circle centered at (50, 50) with a radius of 10",
      "Half a circle 50 pixels wide"
     ],
     "answer": 1,
     "why": "The center is (50, 50), the radius 10, and the angles go from 0 all the way round to 2π."
    },
    {
     "q": "Why does `draw()` clear the canvas and paint everything again?",
     "options": [
      "Canvases forget their pixels every second",
      "The screen always matches the data, so nothing old is left behind when something moves",
      "clearRect makes the colors brighter"
     ],
     "answer": 1,
     "why": "A canvas keeps old pixels until you paint over them. Clearing and redrawing from data avoids leftover trails."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "shapes": "const dots = [{ col: 2, row: 3 }, { col: 7, row: 7 }, { col: 11, row: 4 }];\n\nfunction draw() {\n  ctx.clearRect(0, 0, board.width, board.height);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, board.width, board.height);\n  drawGrid();\n\n  ctx.fillStyle = '#f97316';\n  for (const d of dots) {\n    ctx.beginPath();\n    ctx.arc(d.col * CELL + CELL / 2, d.row * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#e2e8f0';\n  ctx.font = '14px system-ui';\n  ctx.fillText(`${dots.length} dots · click to move one`, 8, board.height - 8);\n}\n\nboard.addEventListener('click', () => {\n  dots[0].col = (dots[0].col + 1) % SIZE;   // change the data...\n  draw();                                    // ...and draw it all again\n});\n\ndraw();"
   }
  }
 ],
 "finish": "You can paint on a canvas now. You learned:\n\n- A **canvas** is a rectangle of pixels, and `getContext('2d')` gives you the drawing commands\n- **Coordinates** start at the top-left, and y grows **down**\n- `fillRect`, `strokeRect`, `arc` with `beginPath` and `fill`, and `fillText`\n- **Cells to pixels** with one `CELL` constant\n- **Draw from data**: clear, then paint everything, every time something changes\n\n### Challenges\n\n1. Make the grid lines lighter every fifth row and column, like graph paper (`row % 5 === 0`).\n2. Click anywhere to add a dot in the cell you clicked: `Math.floor(e.offsetX / CELL)` gives the column.\n3. Give each dot its own color by adding a `color` field to the data.\n\n### Next\n\n**Game loops and timers**: make the picture move by itself."
};
