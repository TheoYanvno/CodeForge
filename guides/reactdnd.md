---
id: reactdnd
title: Drag and drop in React
goals: Use the browser's drag and drop events (dragstart, dragover, drop) from React; Work out where in a list a card was dropped and show a marker there; Give every drag a keyboard and screen-reader alternative
prereqs: React basics (events, state); State updates with pure functions
---

## Session: Moving cards between columns

## Step: The three events and dataTransfer
kind: read
time: 15

HTML5 drag and drop needs three events. The card says what's being dragged; the list allows dropping and reads it back:

```jsx
<li draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', task.id); e.dataTransfer.effectAllowed = 'move'; }}>

<ol
  onDragOver={(e) => e.preventDefault()}                  // without this, dropping isn't allowed
  onDrop={(e) => { e.preventDefault(); onMove(e.dataTransfer.getData('text/plain'), column.id); }}
>
```

| Event | On | Does |
|---|---|---|
| `dragstart` | the card | puts the task id in `dataTransfer` |
| `dragover` | the list | `preventDefault()` says "you can drop here" |
| `drop` | the list | reads the id and moves the task |
| `dragend` | anywhere | tidy up (hide the marker) |

Only the **id** travels in `dataTransfer`. The real task stays in React state, and the drop calls the same `move()` function as everything else.

```svg dragstart stores the id, dragover allows the drop, drop reads the id and moves the task in state
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 100" font-family="sans-serif" font-size="12">
  <rect width="500" height="100" fill="#fff"/>
  <rect x="10" y="35" width="120" height="30" rx="6" fill="#dbeafe"/><text x="70" y="54" text-anchor="middle">dragstart: setData</text>
  <rect x="180" y="35" width="140" height="30" rx="6" fill="#fef3c7"/><text x="250" y="54" text-anchor="middle">dragover: preventDefault</text>
  <rect x="370" y="35" width="120" height="30" rx="6" fill="#dcfce7"/><text x="430" y="54" text-anchor="middle">drop: getData → move</text>
  <path d="M130 50 H180 M320 50 H370" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: What happens if the list's onDragOver doesn't call preventDefault()?
- [x] The browser won't allow dropping there, so drop never fires
- [ ] The card is copied instead of moved
- [ ] Nothing changes
why: By default elements aren't drop targets; preventDefault on dragover opts in.

quiz: Why put only the task id in dataTransfer?
- [ ] dataTransfer can't hold text
- [x] The task lives in React state; the id is all the drop needs to find and move it
- [ ] Ids are encrypted
why: Keep one source of truth. The drop looks the task up by id.

## Step: Where exactly was it dropped?
kind: read
time: 16

To drop *between* cards, find the first card whose middle is below the pointer:

```js
function dropIndex(list, clientY) {
  const cards = [...list.querySelectorAll('.card')];
  const i = cards.findIndex((c) => { const r = c.getBoundingClientRect(); return clientY < r.top + r.height / 2; });
  return i === -1 ? cards.length : i;
}
```

While dragging, remember `{ column, index }` in state and draw a thin marker there. On drop, one detail matters: the dragged card is **still in the list** when you measure, so if it was above the drop point, every index below it is one too high:

```jsx
onDrop={(e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const index = dropIndex(e.currentTarget, e.clientY);
  const before = list.findIndex((t) => t.id === id);
  onMove(id, col.id, before !== -1 && before < index ? index - 1 : index);
}}
```

```svg The pointer is above card C's middle, so the drop index is 2; if the dragged card A is above, subtract one
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 150" font-family="sans-serif" font-size="12">
  <rect width="420" height="150" fill="#fff"/>
  <rect x="20" y="10" width="160" height="30" rx="4" fill="#e0e7ff"/><text x="30" y="30">0 · A (being dragged)</text>
  <rect x="20" y="46" width="160" height="30" rx="4" fill="#e0e7ff"/><text x="30" y="66">1 · B</text>
  <line x1="20" y1="80" x2="180" y2="80" stroke="#2563eb" stroke-width="3"/>
  <rect x="20" y="84" width="160" height="30" rx="4" fill="#e0e7ff"/><text x="30" y="104">2 · C</text>
  <line x1="20" y1="99" x2="180" y2="99" stroke="#dc2626" stroke-dasharray="3 3"/>
  <text x="195" y="84">pointer here → index 2</text><text x="195" y="102" fill="#dc2626">C's middle</text><text x="195" y="124">A was above → move to 1</text>
</svg>
```

quiz: Why subtract one when the dragged card was above the drop index?
- [x] It's counted in the list while measuring, but it leaves its old spot when moved
- [ ] Indexes start at 1
- [ ] To leave room for the marker
why: Removing the card from above shifts every later card up by one.

## Step: A keyboard way to move every card
kind: read
time: 12

Drag and drop needs a mouse or a finger. Every card also has a small **Move to** menu, so the keyboard and screen readers can do the same thing:

```jsx
<label className="move">
  <span className="sr-only">Move “{task.title}” to</span>
  <select value={task.column} onChange={(e) => onMove(task.id, e.target.value)}>
    {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
  </select>
</label>
```

Both paths call the same `onMove`, so the rules can't drift apart. Without an index, `move()` puts the card at the end of the column.

```svg Mouse and keyboard take different paths to the same move() function
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 100" font-family="sans-serif" font-size="12">
  <rect width="460" height="100" fill="#fff"/>
  <rect x="10" y="10" width="140" height="30" rx="6" fill="#dbeafe"/><text x="80" y="29" text-anchor="middle">drag and drop</text>
  <rect x="10" y="60" width="140" height="30" rx="6" fill="#fef3c7"/><text x="80" y="79" text-anchor="middle">Move to menu</text>
  <rect x="260" y="35" width="160" height="30" rx="6" fill="#dcfce7"/><text x="340" y="54" text-anchor="middle">onMove → move()</text>
  <path d="M150 25 L260 50 M150 75 L260 50" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why does every card also have a Move to menu?
- [ ] Menus are faster than dragging
- [x] Not everyone can drag; a menu works with the keyboard and screen readers
- [ ] Browsers on phones don't support select
why: Every action needs a way that doesn't depend on a pointer.

## Finish

You can drag cards between lists with the HTML5 events, drop them at an exact position with a marker, and offer a keyboard path to the same move.

### Challenges

1. Let Alt + arrow keys move the focused card up and down within its column.
2. Make the whole column glow while a card is dragged over it.
3. Add a test for the off-by-one: dragging the top card to just below the second one.
