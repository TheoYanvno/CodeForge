---
id: appstate
title: App state as plain objects
blocks-html: page
blocks-css: base
blocks-js: state, render, actions, undo
goals: Keep everything an app knows in one plain state object; Draw the whole screen from the state with one render() function; Change the state only through small action functions; Make changes as new copies with spread (...) instead of editing in place; Get undo almost for free by keeping a history of past states
prereqs: The Saving favorites lesson (arrays of objects, map and filter) and the Canvas drawing lesson (drawing from data)
---

## Session: One source of truth

## Step: State, render, actions
time: 10
kind: read

As an app grows, the hard part isn't drawing; it's **remembering**. Which notes exist? What color is each one? Which is being edited? If those answers are scattered across variables and the page itself, they drift apart, and you get bugs like a note that's deleted on screen but still saved.

The fix is a simple pattern used by almost every modern app (React, Vue and many games work this way):

1. **State**: one plain object that holds everything the app knows.
2. **render(state)**: one function that builds the screen from the state, all of it, every time.
3. **Actions**: small functions that make a new state. After each action, call render.

```svg The loop: an action makes a new state, render draws the screen from it, and the person's next click calls another action
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 130" font-family="sans-serif" font-size="12">
  <rect x="120" y="8" width="90" height="36" rx="10" fill="#fef9c3" stroke="#ca8a04"/><text x="165" y="31" text-anchor="middle">state</text>
  <rect x="230" y="78" width="90" height="36" rx="10" fill="#dcfce7" stroke="#16a34a"/><text x="275" y="101" text-anchor="middle">render()</text>
  <rect x="10" y="78" width="90" height="36" rx="10" fill="#e0e7ff" stroke="#6366f1"/><text x="55" y="101" text-anchor="middle">action</text>
  <path d="M210 30 Q270 40 275 74 M230 96 H104 M55 74 Q60 40 116 30" fill="none" stroke="#111" stroke-width="2"/>
  <text x="165" y="125" text-anchor="middle" fill="#334155">the screen is always exactly what the state says</text>
</svg>
```

You've already done a small version of this: the Canvas lesson's "draw everything from data", and the Filtering lesson's `render()`. This lesson makes it the backbone of a whole app: a sticky notes board.

## Step: One state object, one render
time: 15

The whole board is this object:

```js
const state = {
  notes: [{ id: 1, text: 'Buy milk', color: 'yellow' }],
  nextId: 2,
};
```

`render()` clears the board and builds a card for every note in `state.notes`. It never reads anything from the page to decide what to draw; it only reads the state.

To check, open the browser console (F12) and type `state`: you'll see exactly what's on screen.

check: js | all the app's data in one state object | /let\s+state\s*=\s*\{[\s\S]*notes\s*:/ | let state = { notes: [...], nextId: 2 };
check: js | a render function that draws every note | /function\s+render\s*\(\s*\)\s*\{[\s\S]*state\.notes\.map\(/ | function render() { board.replaceChildren(...state.notes.map(card)); }

quiz: Where should render() get the notes from?
- [x] Only from state.notes
- [ ] From the cards already on the page
- [ ] From localStorage each time
why: One source of truth: the page is the output, never the input.

quiz: Why redraw every note instead of only the one that changed?
- [ ] It's faster
- [x] It's simple and can't leave stale cards behind; a few notes redraw in a blink
- [ ] The browser requires it
why: Full redraws trade a little speed for a lot of correctness. For small apps there's no visible cost.

```html page
<main class="wrap">
  <header class="bar">
    <h1>Notes</h1>
    <button id="add">+ Note</button>
    <button id="undo" disabled>Undo</button>
    <span id="count" class="count"></span>
  </header>
  <section id="board" class="board"></section>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  background: #f1f5f9;
  color: #1f2937;
}

.wrap { max-width: 720px; margin: 0 auto; padding: 16px; }
.bar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
h1 { margin: 0 auto 0 0; font-size: 1.3rem; }
button { font: inherit; padding: 6px 12px; cursor: pointer; }
.count { font-size: .85rem; color: #64748b; }
.board { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-top: 12px; }
.note { min-height: 140px; padding: 10px; border-radius: 10px; box-shadow: 0 4px 10px rgb(0 0 0 / .08); display: flex; flex-direction: column; gap: 6px; }
.note.yellow { background: #fef08a; } .note.pink { background: #fbcfe8; } .note.blue { background: #bfdbfe; } .note.green { background: #bbf7d0; }
.note textarea { flex: 1; min-height: 80px; border: 0; background: transparent; font: inherit; resize: none; }
.note .tools { display: flex; gap: 4px; justify-content: space-between; }
.note .tools button { padding: 2px 6px; font-size: .8rem; background: rgb(255 255 255 / .6); border: 0; border-radius: 6px; }
```

```js state
let state = {
  notes: [
    { id: 1, text: 'Buy milk', color: 'yellow' },
    { id: 2, text: 'Call the dentist', color: 'pink' },
  ],
  nextId: 3,
};

const board = document.getElementById('board');
```

```js render
function card(note) {
  const el = document.createElement('article');
  el.className = `note ${note.color}`;
  el.dataset.id = note.id;
  const text = document.createElement('textarea');
  text.value = note.text;
  text.setAttribute('aria-label', 'Note text');
  el.append(text);
  return el;
}

function render() {
  board.replaceChildren(...state.notes.map(card));
  document.getElementById('count').textContent = `${state.notes.length} notes`;
}

render();
```

## Step: Actions that make a new state
time: 15

Every change goes through an **action**: a small function that takes what it needs and sets `state` to a **new object**, built with the spread operator `...`:

```js
function addNote() {
  state = { ...state, notes: [...state.notes, { id: state.nextId, text: '', color: 'yellow' }], nextId: state.nextId + 1 };
  render();
}
```

`{ ...state, notes: ... }` means "a copy of state, with a new `notes`". The old object is untouched. Removing uses `filter`, editing uses `map`, both of which make new arrays too.

```svg Spread makes a new state that shares what didn't change and replaces what did; the old state is untouched
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" font-family="sans-serif" font-size="11">
  <rect x="5" y="15" width="130" height="80" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="70" y="33" text-anchor="middle">old state</text><text x="70" y="55" text-anchor="middle">notes: [1, 2]</text><text x="70" y="75" text-anchor="middle">nextId: 3</text>
  <rect x="195" y="15" width="130" height="80" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="260" y="33" text-anchor="middle">new state</text><text x="260" y="55" text-anchor="middle">notes: [1, 2, 3]</text><text x="260" y="75" text-anchor="middle">nextId: 4</text>
  <path d="M135 55 H191" stroke="#111" stroke-width="2"/><text x="163" y="48" text-anchor="middle">addNote</text>
</svg>
```

Why not just `state.notes.push(...)`? Because then the old state and the new one are the *same* object, and you can't compare them or go back to the old one. The next step uses exactly that.

Actions also enforce **rules** in one place: here, at most 6 notes, and colors cycle when you click the color button.

check: js | an action that makes a new state with spread | /state\s*=\s*\{\s*\.\.\.state\s*,\s*notes\s*:\s*\[\s*\.\.\.state\.notes/ | state = { ...state, notes: [...] };
check: js | removing with filter | /state\.notes\.filter\(/ | state.notes.filter((n) => n.id !== id)
check: js | editing with map | /state\.notes\.map\(\s*\(?\s*n\s*\)?\s*=>\s*\(?\s*n\.id\s*===/ | state.notes.map((n) => (n.id === id ? { ...n, text } : n))

quiz: After `state = { ...state, nextId: 9 }`, what happened to the old state object?
- [x] Nothing; it still exists unchanged, and state now points at a new object
- [ ] Its nextId became 9
- [ ] It was deleted
why: Spread copies into a brand-new object; the original isn't modified.

quiz: Where does the "at most 6 notes" rule live?
- [ ] In render()
- [x] In the addNote action, the only place notes are added
- [ ] In the HTML
why: Actions are the gate every change goes through, so rules belong there.

```js render
function card(note) {
  const el = document.createElement('article');
  el.className = `note ${note.color}`;
  el.dataset.id = note.id;
  const text = document.createElement('textarea');
  text.value = note.text;
  text.setAttribute('aria-label', 'Note text');
  text.addEventListener('input', () => editNote(note.id, text.value));
  const tools = document.createElement('div');
  tools.className = 'tools';
  const color = document.createElement('button');
  color.textContent = '🎨';
  color.setAttribute('aria-label', 'Change color');
  color.addEventListener('click', () => recolor(note.id));
  const del = document.createElement('button');
  del.textContent = '✕';
  del.setAttribute('aria-label', 'Delete note');
  del.addEventListener('click', () => removeNote(note.id));
  tools.append(color, del);
  el.append(text, tools);
  return el;
}

function render() {
  board.replaceChildren(...state.notes.map(card));
  document.getElementById('count').textContent = `${state.notes.length} of ${MAX} notes`;
}
```

```js actions
const COLORS = ['yellow', 'pink', 'blue', 'green'];
const MAX = 6;

function addNote() {
  if (state.notes.length >= MAX) return;
  state = { ...state, notes: [...state.notes, { id: state.nextId, text: '', color: 'yellow' }], nextId: state.nextId + 1 };
  render();
}

function removeNote(id) {
  state = { ...state, notes: state.notes.filter((n) => n.id !== id) };
  render();
}

function editNote(id, text) {
  state = { ...state, notes: state.notes.map((n) => (n.id === id ? { ...n, text } : n)) };
}

function recolor(id) {
  const next = (c) => COLORS[(COLORS.indexOf(c) + 1) % COLORS.length];
  state = { ...state, notes: state.notes.map((n) => (n.id === id ? { ...n, color: next(n.color) } : n)) };
  render();
}

document.getElementById('add').addEventListener('click', addNote);
render();
```

## Step: Undo, almost for free
time: 12

Because every action makes a **new** state and leaves the old one alone, undo is just "keep the old ones":

```js
function commit(next) {
  history.push(state);   // remember the state before this change
  state = next;
  render();
}
function undo() { state = history.pop(); render(); }
```

Every action now calls `commit()` instead of setting `state` directly. That's the second payoff of one-door actions: one change to `commit` gave every action undo.

Typing is saved as you type but isn't added to history for every letter (that would need dozens of undos for one sentence). The page keeps at most 50 past states so memory can't grow forever.

```svg history is a stack of past states: each commit pushes the current state, and undo pops the last one back
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" font-family="sans-serif" font-size="11">
  <g fill="#f1f5f9" stroke="#94a3b8"><rect x="20" y="70" width="90" height="22" rx="4"/><rect x="20" y="46" width="90" height="22" rx="4"/><rect x="20" y="22" width="90" height="22" rx="4"/></g>
  <g text-anchor="middle"><text x="65" y="85">2 notes</text><text x="65" y="61">3 notes</text><text x="65" y="37">3 notes, blue</text></g>
  <text x="65" y="14" text-anchor="middle">history</text>
  <rect x="200" y="40" width="110" height="34" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="255" y="61" text-anchor="middle">state: 2 notes</text>
  <path d="M196 50 L114 33" stroke="#16a34a" stroke-width="2"/><text x="160" y="30" fill="#15803d">commit: push</text>
  <path d="M114 37 L196 62" stroke="#dc2626" stroke-width="2" stroke-dasharray="4 3"/><text x="160" y="80" fill="#b91c1c">undo: pop</text>
</svg>
```

check: js | remembering the state before each change | /history\.push\(\s*state\s*\)/ | history.push(state);
check: js | undo brings the last one back | /state\s*=\s*history\.pop\(\)/ | state = history.pop();

quiz: Why does undo work so easily here?
- [x] Actions never change the old state, so every past state is still intact in history
- [ ] Browsers keep a history of variables
- [ ] render() remembers the old screen
why: Because changes are new copies, saving the old reference is enough.

quiz: Why isn't every keystroke added to history?
- [ ] Keystrokes can't be undone
- [x] Undoing a sentence one letter at a time would be tiring; whole actions are the useful steps
- [ ] It would break the textarea
why: Choose the size of an undo step for the person, not for the code.

```js actions
const COLORS = ['yellow', 'pink', 'blue', 'green'];
const MAX = 6;

function addNote() {
  if (state.notes.length >= MAX) return;
  commit({ ...state, notes: [...state.notes, { id: state.nextId, text: '', color: 'yellow' }], nextId: state.nextId + 1 });
}

function removeNote(id) {
  commit({ ...state, notes: state.notes.filter((n) => n.id !== id) });
}

function editNote(id, text) {
  state = { ...state, notes: state.notes.map((n) => (n.id === id ? { ...n, text } : n)) };
}

function recolor(id) {
  const next = (c) => COLORS[(COLORS.indexOf(c) + 1) % COLORS.length];
  commit({ ...state, notes: state.notes.map((n) => (n.id === id ? { ...n, color: next(n.color) } : n)) });
}

document.getElementById('add').addEventListener('click', addNote);
```

```js undo
const history = [];
const undoBtn = document.getElementById('undo');

function commit(next) {
  history.push(state);
  if (history.length > 50) history.shift();
  state = next;
  render();
  undoBtn.disabled = history.length === 0;
}

function undo() {
  if (!history.length) return;
  state = history.pop();
  render();
  undoBtn.disabled = history.length === 0;
}

undoBtn.addEventListener('click', undo);
render();
```

## Finish

You can build an app around its data now. You learned:

- One **state** object as the single source of truth
- **render()** draws everything from the state
- **Actions** are the only way to change it, and they hold the rules
- **New copies** with `...`, `map` and `filter` instead of editing in place
- **Undo** from a history of past states

### Challenges

1. Add **Redo**: when you undo, push the current state onto a `future` list, and clear it on any new commit.
2. Add a "Pin" action that moves a note to the front of the list.
3. Count how many renders happen as you use the app, and show it in a corner.

### Next

**Dragging with pointer events**: move notes with a mouse, a pen or a finger.
