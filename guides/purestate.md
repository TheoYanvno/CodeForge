---
id: purestate
title: State updates with pure functions
goals: Change React state by making new arrays and objects instead of editing old ones; Use the updater form of setState so quick changes never get lost; Move the rules into pure functions (or a reducer) that tests can check without React
prereqs: React basics (state, events, lists with keys); JavaScript arrays (map, filter, spread)
---

## Session: Rules outside the component

## Step: New copies, never edits
kind: read
time: 14

React decides whether to redraw by checking if state is a **new** value. Editing an array in place keeps the same array, so React may not notice:

```jsx
// ✗ edits the old array: same reference, the board may not redraw
tasks.find((t) => t.id === id).column = 'done';
setTasks(tasks);

// ✓ a new array with a new object for the one task that changed
setTasks(tasks.map((t) => (t.id === id ? { ...t, column: 'done' } : t)));
```

| Change | New copy with |
|---|---|
| Add | `[...tasks, task]` |
| Remove | `tasks.filter((t) => t.id !== id)` |
| Update one | `tasks.map((t) => (t.id === id ? { ...t, ...changes } : t))` |

```svg map makes a new array; only the changed task is a new object, the rest are shared
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 120" font-family="sans-serif" font-size="12">
  <rect width="460" height="120" fill="#fff"/>
  <text x="20" y="18">old array</text><text x="280" y="18">new array</text>
  <rect x="20" y="28" width="120" height="24" rx="4" fill="#e0e7ff"/><text x="30" y="45">task A</text>
  <rect x="20" y="58" width="120" height="24" rx="4" fill="#e0e7ff"/><text x="30" y="75">task B (backlog)</text>
  <rect x="280" y="28" width="120" height="24" rx="4" fill="#e0e7ff"/><text x="290" y="45">task A</text>
  <rect x="280" y="58" width="140" height="24" rx="4" fill="#dcfce7"/><text x="290" y="75">task B (done) · new</text>
  <path d="M140 40 H280" stroke="#9ca3af" stroke-dasharray="4 3"/><text x="180" y="35" fill="#6b7280">same object</text>
</svg>
```

quiz: Why might editing a task in place and calling setTasks(tasks) fail to redraw?
- [x] It's the same array, so React sees no new state
- [ ] setTasks only accepts strings
- [ ] Objects can't be edited in JavaScript
why: React compares references. A changed copy is a new reference; an edited original isn't.

quiz: Which makes a new array without task 7?
- [ ] tasks.splice(tasks.findIndex((t) => t.id === 7), 1)
- [x] tasks.filter((t) => t.id !== 7)
- [ ] delete tasks[7]
why: filter returns a new array; splice and delete change the old one.

## Step: The updater form: setTasks((ts) => …)
kind: read
time: 12

`setTasks(next)` uses whatever `tasks` was when the handler was made. If two changes happen before a redraw (a fast double drop, or a save and a move together), the second can be built from stale data and undo the first. The **updater form** gets the current value every time:

```jsx
const onMove = (id, column, index) => setTasks((ts) => move(ts, id, column, index));
const saveTask = (task) => setTasks((ts) => upsert(ts, task));
const deleteTask = (id) => setTasks((ts) => remove(ts, id));
```

```svg Two quick changes: with values both start from the same old list; with updaters the second starts from the first's result
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" font-family="sans-serif" font-size="12">
  <rect width="480" height="120" fill="#fff"/>
  <text x="10" y="20" font-weight="bold">setTasks(value)</text>
  <text x="10" y="40">[A,B] → add C → [A,B,C]</text><text x="10" y="58">[A,B] → remove A → [B]</text><text x="10" y="76" fill="#dc2626">result [B]: C is lost</text>
  <text x="250" y="20" font-weight="bold">setTasks((ts) => …)</text>
  <text x="250" y="40">[A,B] → add C → [A,B,C]</text><text x="250" y="58">[A,B,C] → remove A → [B,C]</text><text x="250" y="76" fill="#16a34a">result [B,C]</text>
</svg>
```

quiz: When should you use the updater form setTasks((ts) => …)?
- [ ] Only for strings
- [x] Whenever the new state is built from the old state
- [ ] Never; it's deprecated
why: The updater receives the latest state, so changes made close together build on each other.

## Step: Rules in pure functions, or a reducer
kind: read
time: 16

`move`, `upsert` and `remove` are **pure functions**: they take the tasks and return new tasks, with no React and no side effects. That makes them easy to test:

```js
export function move(tasks, id, column, index = Infinity) {
  const task = tasks.find((t) => t.id === id);
  if (!task || !COLUMN_IDS.has(column)) return tasks;
  const others = inColumn(tasks, column).filter((t) => t.id !== id);
  const at = Math.max(0, Math.min(index, others.length));
  others.splice(at, 0, { ...task, column });                       // splice on a copy is fine
  const order = new Map(others.map((t, i) => [t.id, (i + 1) * 1000]));
  return tasks.map((t) => (order.has(t.id) ? { ...(t.id === id ? { ...task, column } : t), order: order.get(t.id) } : t));
}
```

```js
test('moving a card puts it exactly where it was dropped', () => {
  const ts = move(sampleTasks, 'a', 'done', 0);
  assert.deepStrictEqual(inColumn(ts, 'done').map((t) => t.id)[0], 'a');
});
```

`useReducer` is the same idea with one function for every action. Both styles keep rules out of components:

```jsx
function reducer(tasks, action) {
  switch (action.type) {
    case 'move': return move(tasks, action.id, action.column, action.index);
    case 'save': return upsert(tasks, action.task);
    case 'delete': return remove(tasks, action.id);
    default: return tasks;
  }
}
const [tasks, dispatch] = useReducer(reducer, storage, load);
dispatch({ type: 'move', id, column: 'done', index: 0 });
```

```svg Components only call actions; pure functions hold the rules and return the next state
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 90" font-family="sans-serif" font-size="12">
  <rect width="480" height="90" fill="#fff"/>
  <rect x="10" y="30" width="110" height="30" rx="6" fill="#dbeafe"/><text x="65" y="49" text-anchor="middle">Board (drop)</text>
  <rect x="160" y="30" width="150" height="30" rx="6" fill="#dcfce7"/><text x="235" y="49" text-anchor="middle">move(tasks, …) pure</text>
  <rect x="350" y="30" width="120" height="30" rx="6" fill="#e0e7ff"/><text x="410" y="49" text-anchor="middle">new tasks → redraw</text>
  <path d="M120 45 H160 M310 45 H350" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: What makes move() a pure function?
- [ ] It's short
- [x] It returns a result from its inputs without changing them or touching anything outside
- [ ] It uses Map
why: Same inputs, same output, no side effects: that's what makes it trivial to test.

quiz: What does useReducer add over useState with pure functions?
- [ ] It's required for arrays
- [x] One reducer handles every kind of change, and components send named actions with dispatch
- [ ] It saves to localStorage automatically
why: It's an organization choice: the rules are pure either way.

## Finish

You can update state with new copies, use the updater form, and keep the rules in pure, tested functions or a reducer.

### Challenges

1. Add an undo button that keeps the last 10 boards in a history array.
2. Rewrite a small app's useState calls as one useReducer.
3. Write a test that moving a card down within its own column keeps every other card's order.
