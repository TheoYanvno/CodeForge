// Built from guides/purestate.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "purestate",
 "title": "State updates with pure functions",
 "goals": [
  "Change React state by making new arrays and objects instead of editing old ones",
  "Use the updater form of setState so quick changes never get lost",
  "Move the rules into pure functions (or a reducer) that tests can check without React"
 ],
 "prereqs": [
  "React basics (state, events, lists with keys)",
  "JavaScript arrays (map, filter, spread)"
 ],
 "sessions": [
  {
   "title": "Rules outside the component",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "New copies, never edits",
   "body": "React decides whether to redraw by checking if state is a **new** value. Editing an array in place keeps the same array, so React may not notice:\n\n```jsx\n// ✗ edits the old array: same reference, the board may not redraw\ntasks.find((t) => t.id === id).column = 'done';\nsetTasks(tasks);\n\n// ✓ a new array with a new object for the one task that changed\nsetTasks(tasks.map((t) => (t.id === id ? { ...t, column: 'done' } : t)));\n```\n\n| Change | New copy with |\n|---|---|\n| Add | `[...tasks, task]` |\n| Remove | `tasks.filter((t) => t.id !== id)` |\n| Update one | `tasks.map((t) => (t.id === id ? { ...t, ...changes } : t))` |\n\n```svg map makes a new array; only the changed task is a new object, the rest are shared\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 460 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"460\" height=\"120\" fill=\"#fff\"/>\n  <text x=\"20\" y=\"18\">old array</text><text x=\"280\" y=\"18\">new array</text>\n  <rect x=\"20\" y=\"28\" width=\"120\" height=\"24\" rx=\"4\" fill=\"#e0e7ff\"/><text x=\"30\" y=\"45\">task A</text>\n  <rect x=\"20\" y=\"58\" width=\"120\" height=\"24\" rx=\"4\" fill=\"#e0e7ff\"/><text x=\"30\" y=\"75\">task B (backlog)</text>\n  <rect x=\"280\" y=\"28\" width=\"120\" height=\"24\" rx=\"4\" fill=\"#e0e7ff\"/><text x=\"290\" y=\"45\">task A</text>\n  <rect x=\"280\" y=\"58\" width=\"140\" height=\"24\" rx=\"4\" fill=\"#dcfce7\"/><text x=\"290\" y=\"75\">task B (done) · new</text>\n  <path d=\"M140 40 H280\" stroke=\"#9ca3af\" stroke-dasharray=\"4 3\"/><text x=\"180\" y=\"35\" fill=\"#6b7280\">same object</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why might editing a task in place and calling setTasks(tasks) fail to redraw?",
     "options": [
      "It's the same array, so React sees no new state",
      "setTasks only accepts strings",
      "Objects can't be edited in JavaScript"
     ],
     "answer": 0,
     "why": "React compares references. A changed copy is a new reference; an edited original isn't."
    },
    {
     "q": "Which makes a new array without task 7?",
     "options": [
      "tasks.splice(tasks.findIndex((t) => t.id === 7), 1)",
      "tasks.filter((t) => t.id !== 7)",
      "delete tasks[7]"
     ],
     "answer": 1,
     "why": "filter returns a new array; splice and delete change the old one."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 14
  },
  {
   "title": "The updater form: setTasks((ts) => …)",
   "body": "`setTasks(next)` uses whatever `tasks` was when the handler was made. If two changes happen before a redraw (a fast double drop, or a save and a move together), the second can be built from stale data and undo the first. The **updater form** gets the current value every time:\n\n```jsx\nconst onMove = (id, column, index) => setTasks((ts) => move(ts, id, column, index));\nconst saveTask = (task) => setTasks((ts) => upsert(ts, task));\nconst deleteTask = (id) => setTasks((ts) => remove(ts, id));\n```\n\n```svg Two quick changes: with values both start from the same old list; with updaters the second starts from the first's result\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"120\" fill=\"#fff\"/>\n  <text x=\"10\" y=\"20\" font-weight=\"bold\">setTasks(value)</text>\n  <text x=\"10\" y=\"40\">[A,B] → add C → [A,B,C]</text><text x=\"10\" y=\"58\">[A,B] → remove A → [B]</text><text x=\"10\" y=\"76\" fill=\"#dc2626\">result [B]: C is lost</text>\n  <text x=\"250\" y=\"20\" font-weight=\"bold\">setTasks((ts) => …)</text>\n  <text x=\"250\" y=\"40\">[A,B] → add C → [A,B,C]</text><text x=\"250\" y=\"58\">[A,B,C] → remove A → [B,C]</text><text x=\"250\" y=\"76\" fill=\"#16a34a\">result [B,C]</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "When should you use the updater form setTasks((ts) => …)?",
     "options": [
      "Only for strings",
      "Whenever the new state is built from the old state",
      "Never; it's deprecated"
     ],
     "answer": 1,
     "why": "The updater receives the latest state, so changes made close together build on each other."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Rules in pure functions, or a reducer",
   "body": "`move`, `upsert` and `remove` are **pure functions**: they take the tasks and return new tasks, with no React and no side effects. That makes them easy to test:\n\n```js\nexport function move(tasks, id, column, index = Infinity) {\n  const task = tasks.find((t) => t.id === id);\n  if (!task || !COLUMN_IDS.has(column)) return tasks;\n  const others = inColumn(tasks, column).filter((t) => t.id !== id);\n  const at = Math.max(0, Math.min(index, others.length));\n  others.splice(at, 0, { ...task, column });                       // splice on a copy is fine\n  const order = new Map(others.map((t, i) => [t.id, (i + 1) * 1000]));\n  return tasks.map((t) => (order.has(t.id) ? { ...(t.id === id ? { ...task, column } : t), order: order.get(t.id) } : t));\n}\n```\n\n```js\ntest('moving a card puts it exactly where it was dropped', () => {\n  const ts = move(sampleTasks, 'a', 'done', 0);\n  assert.deepStrictEqual(inColumn(ts, 'done').map((t) => t.id)[0], 'a');\n});\n```\n\n`useReducer` is the same idea with one function for every action. Both styles keep rules out of components:\n\n```jsx\nfunction reducer(tasks, action) {\n  switch (action.type) {\n    case 'move': return move(tasks, action.id, action.column, action.index);\n    case 'save': return upsert(tasks, action.task);\n    case 'delete': return remove(tasks, action.id);\n    default: return tasks;\n  }\n}\nconst [tasks, dispatch] = useReducer(reducer, storage, load);\ndispatch({ type: 'move', id, column: 'done', index: 0 });\n```\n\n```svg Components only call actions; pure functions hold the rules and return the next state\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"30\" width=\"110\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"65\" y=\"49\" text-anchor=\"middle\">Board (drop)</text>\n  <rect x=\"160\" y=\"30\" width=\"150\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"235\" y=\"49\" text-anchor=\"middle\">move(tasks, …) pure</text>\n  <rect x=\"350\" y=\"30\" width=\"120\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"410\" y=\"49\" text-anchor=\"middle\">new tasks → redraw</text>\n  <path d=\"M120 45 H160 M310 45 H350\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What makes move() a pure function?",
     "options": [
      "It's short",
      "It returns a result from its inputs without changing them or touching anything outside",
      "It uses Map"
     ],
     "answer": 1,
     "why": "Same inputs, same output, no side effects: that's what makes it trivial to test."
    },
    {
     "q": "What does useReducer add over useState with pure functions?",
     "options": [
      "It's required for arrays",
      "One reducer handles every kind of change, and components send named actions with dispatch",
      "It saves to localStorage automatically"
     ],
     "answer": 1,
     "why": "It's an organization choice: the rules are pure either way."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 16
  }
 ],
 "finish": "You can update state with new copies, use the updater form, and keep the rules in pure, tested functions or a reducer.\n\n### Challenges\n\n1. Add an undo button that keeps the last 10 boards in a history array.\n2. Rewrite a small app's useState calls as one useReducer.\n3. Write a test that moving a card down within its own column keeps every other card's order."
};
