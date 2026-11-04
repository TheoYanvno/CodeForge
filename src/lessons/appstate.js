// Built from guides/appstate.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "appstate",
 "title": "App state as plain objects",
 "goals": [
  "Keep everything an app knows in one plain state object",
  "Draw the whole screen from the state with one render() function",
  "Change the state only through small action functions",
  "Make changes as new copies with spread (...) instead of editing in place",
  "Get undo almost for free by keeping a history of past states"
 ],
 "prereqs": [
  "The Saving favorites lesson (arrays of objects, map and filter) and the Canvas drawing lesson (drawing from data)"
 ],
 "sessions": [
  {
   "title": "One source of truth",
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
   "state": "",
   "render": "",
   "actions": "",
   "undo": ""
  }
 },
 "steps": [
  {
   "title": "State, render, actions",
   "body": "As an app grows, the hard part isn't drawing; it's **remembering**. Which notes exist? What color is each one? Which is being edited? If those answers are scattered across variables and the page itself, they drift apart, and you get bugs like a note that's deleted on screen but still saved.\n\nThe fix is a simple pattern used by almost every modern app (React, Vue and many games work this way):\n\n1. **State**: one plain object that holds everything the app knows.\n2. **render(state)**: one function that builds the screen from the state, all of it, every time.\n3. **Actions**: small functions that make a new state. After each action, call render.\n\n```svg The loop: an action makes a new state, render draws the screen from it, and the person's next click calls another action\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"120\" y=\"8\" width=\"90\" height=\"36\" rx=\"10\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"165\" y=\"31\" text-anchor=\"middle\">state</text>\n  <rect x=\"230\" y=\"78\" width=\"90\" height=\"36\" rx=\"10\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"275\" y=\"101\" text-anchor=\"middle\">render()</text>\n  <rect x=\"10\" y=\"78\" width=\"90\" height=\"36\" rx=\"10\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"55\" y=\"101\" text-anchor=\"middle\">action</text>\n  <path d=\"M210 30 Q270 40 275 74 M230 96 H104 M55 74 Q60 40 116 30\" fill=\"none\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"165\" y=\"125\" text-anchor=\"middle\" fill=\"#334155\">the screen is always exactly what the state says</text>\n</svg>\n```\n\nYou've already done a small version of this: the Canvas lesson's \"draw everything from data\", and the Filtering lesson's `render()`. This lesson makes it the backbone of a whole app: a sticky notes board.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "One state object, one render",
   "body": "The whole board is this object:\n\n```js\nconst state = {\n  notes: [{ id: 1, text: 'Buy milk', color: 'yellow' }],\n  nextId: 2,\n};\n```\n\n`render()` clears the board and builds a card for every note in `state.notes`. It never reads anything from the page to decide what to draw; it only reads the state.\n\nTo check, open the browser console (F12) and type `state`: you'll see exactly what's on screen.",
   "checks": [
    {
     "pane": "js",
     "label": "all the app's data in one state object",
     "test": "/let\\s+state\\s*=\\s*\\{[\\s\\S]*notes\\s*:/",
     "hint": "let state = { notes: [...], nextId: 2 };"
    },
    {
     "pane": "js",
     "label": "a render function that draws every note",
     "test": "/function\\s+render\\s*\\(\\s*\\)\\s*\\{[\\s\\S]*state\\.notes\\.map\\(/",
     "hint": "function render() { board.replaceChildren(...state.notes.map(card)); }"
    }
   ],
   "quiz": [
    {
     "q": "Where should render() get the notes from?",
     "options": [
      "Only from state.notes",
      "From the cards already on the page",
      "From localStorage each time"
     ],
     "answer": 0,
     "why": "One source of truth: the page is the output, never the input."
    },
    {
     "q": "Why redraw every note instead of only the one that changed?",
     "options": [
      "It's faster",
      "It's simple and can't leave stale cards behind; a few notes redraw in a blink",
      "The browser requires it"
     ],
     "answer": 1,
     "why": "Full redraws trade a little speed for a lot of correctness. For small apps there's no visible cost."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"wrap\">\n  <header class=\"bar\">\n    <h1>Notes</h1>\n    <button id=\"add\">+ Note</button>\n    <button id=\"undo\" disabled>Undo</button>\n    <span id=\"count\" class=\"count\"></span>\n  </header>\n  <section id=\"board\" class=\"board\"></section>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  font-family: system-ui, sans-serif;\n  background: #f1f5f9;\n  color: #1f2937;\n}\n\n.wrap { max-width: 720px; margin: 0 auto; padding: 16px; }\n.bar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }\nh1 { margin: 0 auto 0 0; font-size: 1.3rem; }\nbutton { font: inherit; padding: 6px 12px; cursor: pointer; }\n.count { font-size: .85rem; color: #64748b; }\n.board { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-top: 12px; }\n.note { min-height: 140px; padding: 10px; border-radius: 10px; box-shadow: 0 4px 10px rgb(0 0 0 / .08); display: flex; flex-direction: column; gap: 6px; }\n.note.yellow { background: #fef08a; } .note.pink { background: #fbcfe8; } .note.blue { background: #bfdbfe; } .note.green { background: #bbf7d0; }\n.note textarea { flex: 1; min-height: 80px; border: 0; background: transparent; font: inherit; resize: none; }\n.note .tools { display: flex; gap: 4px; justify-content: space-between; }\n.note .tools button { padding: 2px 6px; font-size: .8rem; background: rgb(255 255 255 / .6); border: 0; border-radius: 6px; }"
   },
   "js": {
    "state": "let state = {\n  notes: [\n    { id: 1, text: 'Buy milk', color: 'yellow' },\n    { id: 2, text: 'Call the dentist', color: 'pink' },\n  ],\n  nextId: 3,\n};\n\nconst board = document.getElementById('board');",
    "render": "function card(note) {\n  const el = document.createElement('article');\n  el.className = `note ${note.color}`;\n  el.dataset.id = note.id;\n  const text = document.createElement('textarea');\n  text.value = note.text;\n  text.setAttribute('aria-label', 'Note text');\n  el.append(text);\n  return el;\n}\n\nfunction render() {\n  board.replaceChildren(...state.notes.map(card));\n  document.getElementById('count').textContent = `${state.notes.length} notes`;\n}\n\nrender();"
   }
  },
  {
   "title": "Actions that make a new state",
   "body": "Every change goes through an **action**: a small function that takes what it needs and sets `state` to a **new object**, built with the spread operator `...`:\n\n```js\nfunction addNote() {\n  state = { ...state, notes: [...state.notes, { id: state.nextId, text: '', color: 'yellow' }], nextId: state.nextId + 1 };\n  render();\n}\n```\n\n`{ ...state, notes: ... }` means \"a copy of state, with a new `notes`\". The old object is untouched. Removing uses `filter`, editing uses `map`, both of which make new arrays too.\n\n```svg Spread makes a new state that shares what didn't change and replaces what did; the old state is untouched\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"15\" width=\"130\" height=\"80\" rx=\"8\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"70\" y=\"33\" text-anchor=\"middle\">old state</text><text x=\"70\" y=\"55\" text-anchor=\"middle\">notes: [1, 2]</text><text x=\"70\" y=\"75\" text-anchor=\"middle\">nextId: 3</text>\n  <rect x=\"195\" y=\"15\" width=\"130\" height=\"80\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"260\" y=\"33\" text-anchor=\"middle\">new state</text><text x=\"260\" y=\"55\" text-anchor=\"middle\">notes: [1, 2, 3]</text><text x=\"260\" y=\"75\" text-anchor=\"middle\">nextId: 4</text>\n  <path d=\"M135 55 H191\" stroke=\"#111\" stroke-width=\"2\"/><text x=\"163\" y=\"48\" text-anchor=\"middle\">addNote</text>\n</svg>\n```\n\nWhy not just `state.notes.push(...)`? Because then the old state and the new one are the *same* object, and you can't compare them or go back to the old one. The next step uses exactly that.\n\nActions also enforce **rules** in one place: here, at most 6 notes, and colors cycle when you click the color button.",
   "checks": [
    {
     "pane": "js",
     "label": "an action that makes a new state with spread",
     "test": "/state\\s*=\\s*\\{\\s*\\.\\.\\.state\\s*,\\s*notes\\s*:\\s*\\[\\s*\\.\\.\\.state\\.notes/",
     "hint": "state = { ...state, notes: [...] };"
    },
    {
     "pane": "js",
     "label": "removing with filter",
     "test": "/state\\.notes\\.filter\\(/",
     "hint": "state.notes.filter((n) => n.id !== id)"
    },
    {
     "pane": "js",
     "label": "editing with map",
     "test": "/state\\.notes\\.map\\(\\s*\\(?\\s*n\\s*\\)?\\s*=>\\s*\\(?\\s*n\\.id\\s*===/",
     "hint": "state.notes.map((n) => (n.id === id ? { ...n, text } : n))"
    }
   ],
   "quiz": [
    {
     "q": "After `state = { ...state, nextId: 9 }`, what happened to the old state object?",
     "options": [
      "Nothing; it still exists unchanged, and state now points at a new object",
      "Its nextId became 9",
      "It was deleted"
     ],
     "answer": 0,
     "why": "Spread copies into a brand-new object; the original isn't modified."
    },
    {
     "q": "Where does the \"at most 6 notes\" rule live?",
     "options": [
      "In render()",
      "In the addNote action, the only place notes are added",
      "In the HTML"
     ],
     "answer": 1,
     "why": "Actions are the gate every change goes through, so rules belong there."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "render": "function card(note) {\n  const el = document.createElement('article');\n  el.className = `note ${note.color}`;\n  el.dataset.id = note.id;\n  const text = document.createElement('textarea');\n  text.value = note.text;\n  text.setAttribute('aria-label', 'Note text');\n  text.addEventListener('input', () => editNote(note.id, text.value));\n  const tools = document.createElement('div');\n  tools.className = 'tools';\n  const color = document.createElement('button');\n  color.textContent = '🎨';\n  color.setAttribute('aria-label', 'Change color');\n  color.addEventListener('click', () => recolor(note.id));\n  const del = document.createElement('button');\n  del.textContent = '✕';\n  del.setAttribute('aria-label', 'Delete note');\n  del.addEventListener('click', () => removeNote(note.id));\n  tools.append(color, del);\n  el.append(text, tools);\n  return el;\n}\n\nfunction render() {\n  board.replaceChildren(...state.notes.map(card));\n  document.getElementById('count').textContent = `${state.notes.length} of ${MAX} notes`;\n}",
    "actions": "const COLORS = ['yellow', 'pink', 'blue', 'green'];\nconst MAX = 6;\n\nfunction addNote() {\n  if (state.notes.length >= MAX) return;\n  state = { ...state, notes: [...state.notes, { id: state.nextId, text: '', color: 'yellow' }], nextId: state.nextId + 1 };\n  render();\n}\n\nfunction removeNote(id) {\n  state = { ...state, notes: state.notes.filter((n) => n.id !== id) };\n  render();\n}\n\nfunction editNote(id, text) {\n  state = { ...state, notes: state.notes.map((n) => (n.id === id ? { ...n, text } : n)) };\n}\n\nfunction recolor(id) {\n  const next = (c) => COLORS[(COLORS.indexOf(c) + 1) % COLORS.length];\n  state = { ...state, notes: state.notes.map((n) => (n.id === id ? { ...n, color: next(n.color) } : n)) };\n  render();\n}\n\ndocument.getElementById('add').addEventListener('click', addNote);\nrender();"
   }
  },
  {
   "title": "Undo, almost for free",
   "body": "Because every action makes a **new** state and leaves the old one alone, undo is just \"keep the old ones\":\n\n```js\nfunction commit(next) {\n  history.push(state);   // remember the state before this change\n  state = next;\n  render();\n}\nfunction undo() { state = history.pop(); render(); }\n```\n\nEvery action now calls `commit()` instead of setting `state` directly. That's the second payoff of one-door actions: one change to `commit` gave every action undo.\n\nTyping is saved as you type but isn't added to history for every letter (that would need dozens of undos for one sentence). The page keeps at most 50 past states so memory can't grow forever.\n\n```svg history is a stack of past states: each commit pushes the current state, and undo pops the last one back\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"sans-serif\" font-size=\"11\">\n  <g fill=\"#f1f5f9\" stroke=\"#94a3b8\"><rect x=\"20\" y=\"70\" width=\"90\" height=\"22\" rx=\"4\"/><rect x=\"20\" y=\"46\" width=\"90\" height=\"22\" rx=\"4\"/><rect x=\"20\" y=\"22\" width=\"90\" height=\"22\" rx=\"4\"/></g>\n  <g text-anchor=\"middle\"><text x=\"65\" y=\"85\">2 notes</text><text x=\"65\" y=\"61\">3 notes</text><text x=\"65\" y=\"37\">3 notes, blue</text></g>\n  <text x=\"65\" y=\"14\" text-anchor=\"middle\">history</text>\n  <rect x=\"200\" y=\"40\" width=\"110\" height=\"34\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"255\" y=\"61\" text-anchor=\"middle\">state: 2 notes</text>\n  <path d=\"M196 50 L114 33\" stroke=\"#16a34a\" stroke-width=\"2\"/><text x=\"160\" y=\"30\" fill=\"#15803d\">commit: push</text>\n  <path d=\"M114 37 L196 62\" stroke=\"#dc2626\" stroke-width=\"2\" stroke-dasharray=\"4 3\"/><text x=\"160\" y=\"80\" fill=\"#b91c1c\">undo: pop</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "remembering the state before each change",
     "test": "/history\\.push\\(\\s*state\\s*\\)/",
     "hint": "history.push(state);"
    },
    {
     "pane": "js",
     "label": "undo brings the last one back",
     "test": "/state\\s*=\\s*history\\.pop\\(\\)/",
     "hint": "state = history.pop();"
    }
   ],
   "quiz": [
    {
     "q": "Why does undo work so easily here?",
     "options": [
      "Actions never change the old state, so every past state is still intact in history",
      "Browsers keep a history of variables",
      "render() remembers the old screen"
     ],
     "answer": 0,
     "why": "Because changes are new copies, saving the old reference is enough."
    },
    {
     "q": "Why isn't every keystroke added to history?",
     "options": [
      "Keystrokes can't be undone",
      "Undoing a sentence one letter at a time would be tiring; whole actions are the useful steps",
      "It would break the textarea"
     ],
     "answer": 1,
     "why": "Choose the size of an undo step for the person, not for the code."
    }
   ],
   "session": 0,
   "minutes": 12,
   "js": {
    "actions": "const COLORS = ['yellow', 'pink', 'blue', 'green'];\nconst MAX = 6;\n\nfunction addNote() {\n  if (state.notes.length >= MAX) return;\n  commit({ ...state, notes: [...state.notes, { id: state.nextId, text: '', color: 'yellow' }], nextId: state.nextId + 1 });\n}\n\nfunction removeNote(id) {\n  commit({ ...state, notes: state.notes.filter((n) => n.id !== id) });\n}\n\nfunction editNote(id, text) {\n  state = { ...state, notes: state.notes.map((n) => (n.id === id ? { ...n, text } : n)) };\n}\n\nfunction recolor(id) {\n  const next = (c) => COLORS[(COLORS.indexOf(c) + 1) % COLORS.length];\n  commit({ ...state, notes: state.notes.map((n) => (n.id === id ? { ...n, color: next(n.color) } : n)) });\n}\n\ndocument.getElementById('add').addEventListener('click', addNote);",
    "undo": "const history = [];\nconst undoBtn = document.getElementById('undo');\n\nfunction commit(next) {\n  history.push(state);\n  if (history.length > 50) history.shift();\n  state = next;\n  render();\n  undoBtn.disabled = history.length === 0;\n}\n\nfunction undo() {\n  if (!history.length) return;\n  state = history.pop();\n  render();\n  undoBtn.disabled = history.length === 0;\n}\n\nundoBtn.addEventListener('click', undo);\nrender();"
   }
  }
 ],
 "finish": "You can build an app around its data now. You learned:\n\n- One **state** object as the single source of truth\n- **render()** draws everything from the state\n- **Actions** are the only way to change it, and they hold the rules\n- **New copies** with `...`, `map` and `filter` instead of editing in place\n- **Undo** from a history of past states\n\n### Challenges\n\n1. Add **Redo**: when you undo, push the current state onto a `future` list, and clear it on any new commit.\n2. Add a \"Pin\" action that moves a note to the front of the list.\n3. Count how many renders happen as you use the app, and show it in a corner.\n\n### Next\n\n**Dragging with pointer events**: move notes with a mouse, a pen or a finger."
};
