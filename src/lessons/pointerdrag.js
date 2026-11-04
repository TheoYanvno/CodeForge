// Built from guides/pointerdrag.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "pointerdrag",
 "title": "Dragging with pointer events",
 "goals": [
  "Use pointer events so one piece of code works for a mouse, a pen and a finger",
  "Remember where the pointer grabbed an element so it doesn't jump",
  "Keep receiving moves with setPointerCapture even when the pointer leaves the element",
  "Keep a dragged element inside its area with Math.min and Math.max",
  "Drag only by a handle, save the position once at the end, and move it with the keyboard too"
 ],
 "prereqs": [
  "The App state lesson (state, actions and render) and the Keyboard and swipe input lesson (events)"
 ],
 "sessions": [
  {
   "title": "Move it anywhere",
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
   "drag": "",
   "clamp": "",
   "handle": ""
  }
 },
 "steps": [
  {
   "title": "Pointer events: one set for every device",
   "body": "Mice, pens and fingers used to need separate code: `mousedown` for one, `touchstart` for another. **Pointer events** cover all three with one set:\n\n| Event | When |\n|---|---|\n| `pointerdown` | a button is pressed, a pen touches, or a finger lands |\n| `pointermove` | it moves |\n| `pointerup` | it's released (or `pointercancel` if the browser takes over) |\n\nA drag is those three in a row. The one idea to get right is the **grab offset**: where inside the note the pointer grabbed it. Without it, the note's corner jumps to the pointer the moment you start.\n\n```svg During a drag the note keeps the same offset from the pointer: new left = pointer x − grab x\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 130\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"20\" y=\"20\" width=\"110\" height=\"80\" rx=\"8\" fill=\"#fef08a\" stroke=\"#ca8a04\"/>\n  <circle cx=\"70\" cy=\"45\" r=\"5\" fill=\"#ef4444\"/><text x=\"78\" y=\"42\">grab point</text>\n  <path d=\"M20 45 H65\" stroke=\"#2563eb\" stroke-dasharray=\"3 3\"/><text x=\"28\" y=\"60\" fill=\"#2563eb\">grab x</text>\n  <rect x=\"190\" y=\"35\" width=\"110\" height=\"80\" rx=\"8\" fill=\"#fef08a\" stroke=\"#ca8a04\" opacity=\".7\"/>\n  <circle cx=\"240\" cy=\"60\" r=\"5\" fill=\"#ef4444\"/>\n  <path d=\"M75 45 C130 30 170 40 235 58\" fill=\"none\" stroke=\"#ef4444\" stroke-width=\"2\"/>\n  <text x=\"165\" y=\"125\" text-anchor=\"middle\" fill=\"#334155\">left = pointer x − grab x, top = pointer y − grab y</text>\n</svg>\n```\n\nTwo browser settings matter:\n\n- `touch-action: none` on the draggable element, or a finger drag will scroll the page instead.\n- `setPointerCapture(e.pointerId)`, so the element keeps getting `pointermove` even when a fast pointer slips outside it.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "A note you can drag",
   "body": "On `pointerdown`, remember the grab offset and capture the pointer. On `pointermove`, if a drag is happening, set `left` and `top`. On `pointerup`, stop.\n\n```js\nnote.addEventListener('pointerdown', (e) => {\n  grab = { x: e.clientX - note.offsetLeft, y: e.clientY - note.offsetTop };\n  note.setPointerCapture(e.pointerId);\n});\n```\n\n`clientX` and `clientY` are the pointer's position in the window. The board is `position: relative` and the note `position: absolute`, so `left` and `top` are measured from the board's corner. (The board starts at the top-left of the page here, which keeps the math simple; the next step handles any position.)\n\nTry it with a mouse, and on a phone with a finger.",
   "checks": [
    {
     "pane": "js",
     "label": "starting a drag",
     "test": "/addEventListener\\(\\s*['\"]pointerdown['\"]/",
     "hint": "note.addEventListener('pointerdown', ...)"
    },
    {
     "pane": "js",
     "label": "following the pointer",
     "test": "/addEventListener\\(\\s*['\"]pointermove['\"]/",
     "hint": "note.addEventListener('pointermove', ...)"
    },
    {
     "pane": "js",
     "label": "capturing the pointer",
     "test": "/setPointerCapture\\(\\s*e\\.pointerId\\s*\\)/",
     "hint": "note.setPointerCapture(e.pointerId)"
    },
    {
     "pane": "css",
     "label": "no scrolling while dragging",
     "test": "/touch-action\\s*:\\s*none/",
     "hint": "touch-action: none;"
    }
   ],
   "quiz": [
    {
     "q": "What does the grab offset prevent?",
     "options": [
      "The note jumping so its corner sits under the pointer when you start dragging",
      "The note moving too fast",
      "Two notes being dragged at once"
     ],
     "answer": 0,
     "why": "Keeping the pointer's position inside the note makes the note move with your hand, not snap to it."
    },
    {
     "q": "Why call `setPointerCapture`?",
     "options": [
      "To stop other notes moving",
      "So moves keep arriving even when a fast pointer leaves the note",
      "It's needed for touch screens only"
     ],
     "answer": 1,
     "why": "Without capture, a quick flick leaves the note behind."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main>\n  <section id=\"board\" class=\"board\">\n    <article id=\"note\" class=\"note\">\n      <header class=\"handle\">⠿ Drag me</header>\n      <p>Grab the bar to move this note. Use the arrow keys when it's focused.</p>\n    </article>\n  </section>\n  <p id=\"pos\" class=\"pos\" role=\"status\"></p>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  background: #e2e8f0;\n  color: #1f2937;\n}\n\n.board {\n  position: relative;\n  height: 340px;\n  margin: 0;\n  background: repeating-linear-gradient(0deg, #f8fafc 0 23px, #e2e8f0 23px 24px);\n  overflow: hidden;\n}\n\n.note {\n  position: absolute;\n  left: 20px;\n  top: 20px;\n  width: 160px;\n  padding: 0 10px 10px;\n  background: #fef08a;\n  border-radius: 10px;\n  box-shadow: 0 6px 16px rgb(0 0 0 / .15);\n  touch-action: none;\n  user-select: none;\n}\n\n.note.dragging { box-shadow: 0 12px 28px rgb(0 0 0 / .25); }\n.note:focus-visible { outline: 3px solid #2563eb; }\n.handle { margin: 0 -10px 8px; padding: 6px 10px; background: rgb(0 0 0 / .06); border-radius: 10px 10px 0 0; cursor: grab; font-size: .85rem; }\n.note p { margin: 0; font-size: .9rem; }\n.pos { padding: 0 12px; font-size: .85rem; color: #475569; }"
   },
   "js": {
    "setup": "const board = document.getElementById('board');\nconst note = document.getElementById('note');\nconst pos = document.getElementById('pos');\nlet grab = null;\n\nfunction place(x, y) {\n  note.style.left = `${x}px`;\n  note.style.top = `${y}px`;\n  pos.textContent = `left ${Math.round(x)} px, top ${Math.round(y)} px`;\n}",
    "drag": "note.addEventListener('pointerdown', (e) => {\n  grab = { x: e.clientX - note.offsetLeft, y: e.clientY - note.offsetTop };\n  note.setPointerCapture(e.pointerId);\n  note.classList.add('dragging');\n});\n\nnote.addEventListener('pointermove', (e) => {\n  if (!grab) return;\n  place(e.clientX - grab.x, e.clientY - grab.y);\n});\n\nnote.addEventListener('pointerup', () => {\n  grab = null;\n  note.classList.remove('dragging');\n});"
   }
  },
  {
   "title": "Staying on the board",
   "body": "Drag the note off the edge and it disappears. The fix is to **clamp** the position between a smallest and a largest value:\n\n```js\nconst clamp = (v, min, max) => Math.max(min, Math.min(max, v));\nx = clamp(x, 0, board.clientWidth - note.offsetWidth);\ny = clamp(y, 0, board.clientHeight - note.offsetHeight);\n```\n\n`Math.min(max, v)` stops it going past the right or bottom edge, and `Math.max(min, …)` stops it going past the left or top.\n\nThis step also measures from the **board's** corner instead of the window's, using `board.getBoundingClientRect()`, so the drag stays right wherever the board sits on the page, even after scrolling.\n\n```svg clamp keeps the note's left between 0 and the board width minus the note width\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"10\" y=\"20\" width=\"310\" height=\"60\" fill=\"#f8fafc\" stroke=\"#94a3b8\"/>\n  <rect x=\"10\" y=\"30\" width=\"60\" height=\"40\" rx=\"6\" fill=\"#fef08a\" stroke=\"#ca8a04\"/><text x=\"40\" y=\"54\" text-anchor=\"middle\">min</text>\n  <rect x=\"260\" y=\"30\" width=\"60\" height=\"40\" rx=\"6\" fill=\"#fef08a\" stroke=\"#ca8a04\"/><text x=\"290\" y=\"54\" text-anchor=\"middle\">max</text>\n  <text x=\"165\" y=\"54\" text-anchor=\"middle\">max = board width − note width</text>\n  <text x=\"165\" y=\"96\" text-anchor=\"middle\" fill=\"#334155\">clamp(v, min, max) = Math.max(min, Math.min(max, v))</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a clamp helper",
     "test": "/Math\\.max\\(\\s*min\\s*,\\s*Math\\.min\\(\\s*max\\s*,\\s*v\\s*\\)\\s*\\)/",
     "hint": "const clamp = (v, min, max) => Math.max(min, Math.min(max, v));"
    },
    {
     "pane": "js",
     "label": "measuring from the board's corner",
     "test": "/getBoundingClientRect\\(\\)/",
     "hint": "const r = board.getBoundingClientRect();"
    }
   ],
   "quiz": [
    {
     "q": "The board is 600 px wide and the note 160 px. What's the largest `left`?",
     "options": [
      "600",
      "440, so the note's right edge stops at the board's edge",
      "760"
     ],
     "answer": 1,
     "why": "max = 600 − 160 = 440."
    },
    {
     "q": "Why measure from `board.getBoundingClientRect()` instead of the window?",
     "options": [
      "So the drag stays right wherever the board is on the page, even after scrolling",
      "The window has no coordinates",
      "It makes dragging faster"
     ],
     "answer": 0,
     "why": "left and top are relative to the board, so the pointer's position must be too."
    }
   ],
   "session": 0,
   "minutes": 12,
   "js": {
    "clamp": "const clamp = (v, min, max) => Math.max(min, Math.min(max, v));\n\nfunction placeClamped(x, y) {\n  place(clamp(x, 0, board.clientWidth - note.offsetWidth), clamp(y, 0, board.clientHeight - note.offsetHeight));\n}\n\nconst inBoard = (e) => {\n  const r = board.getBoundingClientRect();\n  return { x: e.clientX - r.left, y: e.clientY - r.top };\n};",
    "drag": "note.addEventListener('pointerdown', (e) => {\n  const p = inBoard(e);\n  grab = { x: p.x - note.offsetLeft, y: p.y - note.offsetTop };\n  note.setPointerCapture(e.pointerId);\n  note.classList.add('dragging');\n});\n\nnote.addEventListener('pointermove', (e) => {\n  if (!grab) return;\n  const p = inBoard(e);\n  placeClamped(p.x - grab.x, p.y - grab.y);\n});\n\nnote.addEventListener('pointerup', () => {\n  grab = null;\n  note.classList.remove('dragging');\n});"
   }
  },
  {
   "title": "A handle, saving once, and the keyboard",
   "body": "Three finishing touches, the same ones the Sticky Notes app uses:\n\n- **Drag by the handle only.** Notes have text you select and buttons you click, so a drag that starts anywhere would fight with them. `e.target.closest('.handle')` starts a drag only from the top bar.\n- **Save once, at the end.** `pointermove` fires dozens of times a second. Moving the element on each one is fine, but saving to state (and to storage) only on `pointerup` keeps the app fast and the history clean, like the App state lesson's undo.\n- **Arrow keys move it too.** The note gets `tabindex=\"0\"` so it can be focused, and the arrow keys move it 10 pixels (50 with Shift), clamped the same way. Dragging should never be the *only* way.\n\n```svg During the drag only the element moves; the state is updated once, on pointerup\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 90\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"25\" width=\"80\" height=\"34\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"45\" y=\"46\" text-anchor=\"middle\">pointerdown</text>\n  <rect x=\"100\" y=\"25\" width=\"120\" height=\"34\" rx=\"8\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"160\" y=\"40\" text-anchor=\"middle\">pointermove × 60/s</text><text x=\"160\" y=\"53\" text-anchor=\"middle\" font-size=\"10\">move the element</text>\n  <rect x=\"235\" y=\"25\" width=\"90\" height=\"34\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"280\" y=\"40\" text-anchor=\"middle\">pointerup</text><text x=\"280\" y=\"53\" text-anchor=\"middle\" font-size=\"10\">save to state</text>\n  <path d=\"M85 42 H96 M220 42 H231\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "dragging only from the handle",
     "test": "/closest\\(\\s*['\"]\\.handle['\"]\\s*\\)/",
     "hint": "if (!e.target.closest('.handle')) return;"
    },
    {
     "pane": "js",
     "label": "saving the position once, at the end",
     "test": "/pointerup[\\s\\S]*saved\\s*=/",
     "hint": "note.addEventListener('pointerup', () => { saved = { ... }; })"
    },
    {
     "pane": "js",
     "label": "moving with the arrow keys",
     "test": "/ArrowLeft/",
     "hint": "if (e.key === 'ArrowLeft') ..."
    }
   ],
   "quiz": [
    {
     "q": "Why save the position on pointerup instead of on every pointermove?",
     "options": [
      "pointermove doesn't know the position",
      "Moves fire dozens of times a second; saving once at the end is faster and gives one clean undo step",
      "Saving during a drag is not allowed"
     ],
     "answer": 1,
     "why": "Show every move, store only the result."
    },
    {
     "q": "Why does the note get `tabindex=\"0\"`?",
     "options": [
      "So it can be focused with Tab and moved with the arrow keys",
      "To put it in front of other notes",
      "It's required for pointer events"
     ],
     "answer": 0,
     "why": "A focusable note can be moved without a mouse, so dragging isn't the only way."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "drag": "note.addEventListener('pointerdown', (e) => {\n  if (!e.target.closest('.handle')) return;\n  const p = inBoard(e);\n  grab = { x: p.x - note.offsetLeft, y: p.y - note.offsetTop };\n  note.setPointerCapture(e.pointerId);\n  note.classList.add('dragging');\n});\n\nnote.addEventListener('pointermove', (e) => {\n  if (!grab) return;\n  const p = inBoard(e);\n  placeClamped(p.x - grab.x, p.y - grab.y);\n});\n\nnote.addEventListener('pointerup', () => {\n  if (!grab) return;\n  grab = null;\n  note.classList.remove('dragging');\n  saved = { x: note.offsetLeft, y: note.offsetTop };\n  pos.textContent += ' · saved';\n});",
    "handle": "let saved = { x: note.offsetLeft, y: note.offsetTop };\nnote.tabIndex = 0;\n\nnote.addEventListener('keydown', (e) => {\n  const step = e.shiftKey ? 50 : 10;\n  const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };\n  const m = moves[e.key];\n  if (!m) return;\n  e.preventDefault();\n  placeClamped(note.offsetLeft + m[0], note.offsetTop + m[1]);\n  saved = { x: note.offsetLeft, y: note.offsetTop };\n});"
   }
  }
 ],
 "finish": "Things move under your hand now, and under your keyboard. You learned:\n\n- **Pointer events**: one set for mouse, pen and touch\n- The **grab offset**, `setPointerCapture` and `touch-action: none`\n- **Clamping** with `Math.min` and `Math.max`, measured from the board\n- A **drag handle**, **saving once** on pointerup, and **arrow keys** as another way\n\n### Challenges\n\n1. Add a resize corner at the bottom right that changes the note's width and height, clamped to a minimum size.\n2. Bring the dragged note to the front when you grab it (raise its `z-index`).\n3. Snap the note to a 24-pixel grid when you let go: `Math.round(x / 24) * 24`.\n\n### Next\n\n**Saving data safely**: keep the notes after the app closes, and survive broken saved data."
};
