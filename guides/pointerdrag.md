---
id: pointerdrag
title: Dragging with pointer events
blocks-html: page
blocks-css: base
blocks-js: setup, drag, clamp, handle
goals: Use pointer events so one piece of code works for a mouse, a pen and a finger; Remember where the pointer grabbed an element so it doesn't jump; Keep receiving moves with setPointerCapture even when the pointer leaves the element; Keep a dragged element inside its area with Math.min and Math.max; Drag only by a handle, save the position once at the end, and move it with the keyboard too
prereqs: The App state lesson (state, actions and render) and the Keyboard and swipe input lesson (events)
---

## Session: Move it anywhere

## Step: Pointer events: one set for every device
time: 10
kind: read

Mice, pens and fingers used to need separate code: `mousedown` for one, `touchstart` for another. **Pointer events** cover all three with one set:

| Event | When |
|---|---|
| `pointerdown` | a button is pressed, a pen touches, or a finger lands |
| `pointermove` | it moves |
| `pointerup` | it's released (or `pointercancel` if the browser takes over) |

A drag is those three in a row. The one idea to get right is the **grab offset**: where inside the note the pointer grabbed it. Without it, the note's corner jumps to the pointer the moment you start.

```svg During a drag the note keeps the same offset from the pointer: new left = pointer x − grab x
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 130" font-family="sans-serif" font-size="11">
  <rect x="20" y="20" width="110" height="80" rx="8" fill="#fef08a" stroke="#ca8a04"/>
  <circle cx="70" cy="45" r="5" fill="#ef4444"/><text x="78" y="42">grab point</text>
  <path d="M20 45 H65" stroke="#2563eb" stroke-dasharray="3 3"/><text x="28" y="60" fill="#2563eb">grab x</text>
  <rect x="190" y="35" width="110" height="80" rx="8" fill="#fef08a" stroke="#ca8a04" opacity=".7"/>
  <circle cx="240" cy="60" r="5" fill="#ef4444"/>
  <path d="M75 45 C130 30 170 40 235 58" fill="none" stroke="#ef4444" stroke-width="2"/>
  <text x="165" y="125" text-anchor="middle" fill="#334155">left = pointer x − grab x, top = pointer y − grab y</text>
</svg>
```

Two browser settings matter:

- `touch-action: none` on the draggable element, or a finger drag will scroll the page instead.
- `setPointerCapture(e.pointerId)`, so the element keeps getting `pointermove` even when a fast pointer slips outside it.

## Step: A note you can drag
time: 15

On `pointerdown`, remember the grab offset and capture the pointer. On `pointermove`, if a drag is happening, set `left` and `top`. On `pointerup`, stop.

```js
note.addEventListener('pointerdown', (e) => {
  grab = { x: e.clientX - note.offsetLeft, y: e.clientY - note.offsetTop };
  note.setPointerCapture(e.pointerId);
});
```

`clientX` and `clientY` are the pointer's position in the window. The board is `position: relative` and the note `position: absolute`, so `left` and `top` are measured from the board's corner. (The board starts at the top-left of the page here, which keeps the math simple; the next step handles any position.)

Try it with a mouse, and on a phone with a finger.

check: js | starting a drag | /addEventListener\(\s*['"]pointerdown['"]/ | note.addEventListener('pointerdown', ...)
check: js | following the pointer | /addEventListener\(\s*['"]pointermove['"]/ | note.addEventListener('pointermove', ...)
check: js | capturing the pointer | /setPointerCapture\(\s*e\.pointerId\s*\)/ | note.setPointerCapture(e.pointerId)
check: css | no scrolling while dragging | /touch-action\s*:\s*none/ | touch-action: none;

quiz: What does the grab offset prevent?
- [x] The note jumping so its corner sits under the pointer when you start dragging
- [ ] The note moving too fast
- [ ] Two notes being dragged at once
why: Keeping the pointer's position inside the note makes the note move with your hand, not snap to it.

quiz: Why call `setPointerCapture`?
- [ ] To stop other notes moving
- [x] So moves keep arriving even when a fast pointer leaves the note
- [ ] It's needed for touch screens only
why: Without capture, a quick flick leaves the note behind.

```html page
<main>
  <section id="board" class="board">
    <article id="note" class="note">
      <header class="handle">⠿ Drag me</header>
      <p>Grab the bar to move this note. Use the arrow keys when it's focused.</p>
    </article>
  </section>
  <p id="pos" class="pos" role="status"></p>
</main>
```

```css base
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #e2e8f0;
  color: #1f2937;
}

.board {
  position: relative;
  height: 340px;
  margin: 0;
  background: repeating-linear-gradient(0deg, #f8fafc 0 23px, #e2e8f0 23px 24px);
  overflow: hidden;
}

.note {
  position: absolute;
  left: 20px;
  top: 20px;
  width: 160px;
  padding: 0 10px 10px;
  background: #fef08a;
  border-radius: 10px;
  box-shadow: 0 6px 16px rgb(0 0 0 / .15);
  touch-action: none;
  user-select: none;
}

.note.dragging { box-shadow: 0 12px 28px rgb(0 0 0 / .25); }
.note:focus-visible { outline: 3px solid #2563eb; }
.handle { margin: 0 -10px 8px; padding: 6px 10px; background: rgb(0 0 0 / .06); border-radius: 10px 10px 0 0; cursor: grab; font-size: .85rem; }
.note p { margin: 0; font-size: .9rem; }
.pos { padding: 0 12px; font-size: .85rem; color: #475569; }
```

```js setup
const board = document.getElementById('board');
const note = document.getElementById('note');
const pos = document.getElementById('pos');
let grab = null;

function place(x, y) {
  note.style.left = `${x}px`;
  note.style.top = `${y}px`;
  pos.textContent = `left ${Math.round(x)} px, top ${Math.round(y)} px`;
}
```

```js drag
note.addEventListener('pointerdown', (e) => {
  grab = { x: e.clientX - note.offsetLeft, y: e.clientY - note.offsetTop };
  note.setPointerCapture(e.pointerId);
  note.classList.add('dragging');
});

note.addEventListener('pointermove', (e) => {
  if (!grab) return;
  place(e.clientX - grab.x, e.clientY - grab.y);
});

note.addEventListener('pointerup', () => {
  grab = null;
  note.classList.remove('dragging');
});
```

## Step: Staying on the board
time: 12

Drag the note off the edge and it disappears. The fix is to **clamp** the position between a smallest and a largest value:

```js
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
x = clamp(x, 0, board.clientWidth - note.offsetWidth);
y = clamp(y, 0, board.clientHeight - note.offsetHeight);
```

`Math.min(max, v)` stops it going past the right or bottom edge, and `Math.max(min, …)` stops it going past the left or top.

This step also measures from the **board's** corner instead of the window's, using `board.getBoundingClientRect()`, so the drag stays right wherever the board sits on the page, even after scrolling.

```svg clamp keeps the note's left between 0 and the board width minus the note width
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="11">
  <rect x="10" y="20" width="310" height="60" fill="#f8fafc" stroke="#94a3b8"/>
  <rect x="10" y="30" width="60" height="40" rx="6" fill="#fef08a" stroke="#ca8a04"/><text x="40" y="54" text-anchor="middle">min</text>
  <rect x="260" y="30" width="60" height="40" rx="6" fill="#fef08a" stroke="#ca8a04"/><text x="290" y="54" text-anchor="middle">max</text>
  <text x="165" y="54" text-anchor="middle">max = board width − note width</text>
  <text x="165" y="96" text-anchor="middle" fill="#334155">clamp(v, min, max) = Math.max(min, Math.min(max, v))</text>
</svg>
```

check: js | a clamp helper | /Math\.max\(\s*min\s*,\s*Math\.min\(\s*max\s*,\s*v\s*\)\s*\)/ | const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
check: js | measuring from the board's corner | /getBoundingClientRect\(\)/ | const r = board.getBoundingClientRect();

quiz: The board is 600 px wide and the note 160 px. What's the largest `left`?
- [ ] 600
- [x] 440, so the note's right edge stops at the board's edge
- [ ] 760
why: max = 600 − 160 = 440.

quiz: Why measure from `board.getBoundingClientRect()` instead of the window?
- [x] So the drag stays right wherever the board is on the page, even after scrolling
- [ ] The window has no coordinates
- [ ] It makes dragging faster
why: left and top are relative to the board, so the pointer's position must be too.

```js clamp
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function placeClamped(x, y) {
  place(clamp(x, 0, board.clientWidth - note.offsetWidth), clamp(y, 0, board.clientHeight - note.offsetHeight));
}

const inBoard = (e) => {
  const r = board.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
};
```

```js drag
note.addEventListener('pointerdown', (e) => {
  const p = inBoard(e);
  grab = { x: p.x - note.offsetLeft, y: p.y - note.offsetTop };
  note.setPointerCapture(e.pointerId);
  note.classList.add('dragging');
});

note.addEventListener('pointermove', (e) => {
  if (!grab) return;
  const p = inBoard(e);
  placeClamped(p.x - grab.x, p.y - grab.y);
});

note.addEventListener('pointerup', () => {
  grab = null;
  note.classList.remove('dragging');
});
```

## Step: A handle, saving once, and the keyboard
time: 15

Three finishing touches, the same ones the Sticky Notes app uses:

- **Drag by the handle only.** Notes have text you select and buttons you click, so a drag that starts anywhere would fight with them. `e.target.closest('.handle')` starts a drag only from the top bar.
- **Save once, at the end.** `pointermove` fires dozens of times a second. Moving the element on each one is fine, but saving to state (and to storage) only on `pointerup` keeps the app fast and the history clean, like the App state lesson's undo.
- **Arrow keys move it too.** The note gets `tabindex="0"` so it can be focused, and the arrow keys move it 10 pixels (50 with Shift), clamped the same way. Dragging should never be the *only* way.

```svg During the drag only the element moves; the state is updated once, on pointerup
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 90" font-family="sans-serif" font-size="11">
  <rect x="5" y="25" width="80" height="34" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="45" y="46" text-anchor="middle">pointerdown</text>
  <rect x="100" y="25" width="120" height="34" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="160" y="40" text-anchor="middle">pointermove × 60/s</text><text x="160" y="53" text-anchor="middle" font-size="10">move the element</text>
  <rect x="235" y="25" width="90" height="34" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="280" y="40" text-anchor="middle">pointerup</text><text x="280" y="53" text-anchor="middle" font-size="10">save to state</text>
  <path d="M85 42 H96 M220 42 H231" stroke="#111" stroke-width="2"/>
</svg>
```

check: js | dragging only from the handle | /closest\(\s*['"]\.handle['"]\s*\)/ | if (!e.target.closest('.handle')) return;
check: js | saving the position once, at the end | /pointerup[\s\S]*saved\s*=/ | note.addEventListener('pointerup', () => { saved = { ... }; })
check: js | moving with the arrow keys | /ArrowLeft/ | if (e.key === 'ArrowLeft') ...

quiz: Why save the position on pointerup instead of on every pointermove?
- [ ] pointermove doesn't know the position
- [x] Moves fire dozens of times a second; saving once at the end is faster and gives one clean undo step
- [ ] Saving during a drag is not allowed
why: Show every move, store only the result.

quiz: Why does the note get `tabindex="0"`?
- [x] So it can be focused with Tab and moved with the arrow keys
- [ ] To put it in front of other notes
- [ ] It's required for pointer events
why: A focusable note can be moved without a mouse, so dragging isn't the only way.

```js drag
note.addEventListener('pointerdown', (e) => {
  if (!e.target.closest('.handle')) return;
  const p = inBoard(e);
  grab = { x: p.x - note.offsetLeft, y: p.y - note.offsetTop };
  note.setPointerCapture(e.pointerId);
  note.classList.add('dragging');
});

note.addEventListener('pointermove', (e) => {
  if (!grab) return;
  const p = inBoard(e);
  placeClamped(p.x - grab.x, p.y - grab.y);
});

note.addEventListener('pointerup', () => {
  if (!grab) return;
  grab = null;
  note.classList.remove('dragging');
  saved = { x: note.offsetLeft, y: note.offsetTop };
  pos.textContent += ' · saved';
});
```

```js handle
let saved = { x: note.offsetLeft, y: note.offsetTop };
note.tabIndex = 0;

note.addEventListener('keydown', (e) => {
  const step = e.shiftKey ? 50 : 10;
  const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
  const m = moves[e.key];
  if (!m) return;
  e.preventDefault();
  placeClamped(note.offsetLeft + m[0], note.offsetTop + m[1]);
  saved = { x: note.offsetLeft, y: note.offsetTop };
});
```

## Finish

Things move under your hand now, and under your keyboard. You learned:

- **Pointer events**: one set for mouse, pen and touch
- The **grab offset**, `setPointerCapture` and `touch-action: none`
- **Clamping** with `Math.min` and `Math.max`, measured from the board
- A **drag handle**, **saving once** on pointerup, and **arrow keys** as another way

### Challenges

1. Add a resize corner at the bottom right that changes the note's width and height, clamped to a minimum size.
2. Bring the dragged note to the front when you grab it (raise its `z-index`).
3. Snap the note to a 24-pixel grid when you let go: `Math.round(x / 24) * 24`.

### Next

**Saving data safely**: keep the notes after the app closes, and survive broken saved data.
