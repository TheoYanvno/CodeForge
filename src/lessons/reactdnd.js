// Built from guides/reactdnd.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "reactdnd",
 "title": "Drag and drop in React",
 "goals": [
  "Use the browser's drag and drop events (dragstart, dragover, drop) from React",
  "Work out where in a list a card was dropped and show a marker there",
  "Give every drag a keyboard and screen-reader alternative"
 ],
 "prereqs": [
  "React basics (events, state)",
  "State updates with pure functions"
 ],
 "sessions": [
  {
   "title": "Moving cards between columns",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "The three events and dataTransfer",
   "body": "HTML5 drag and drop needs three events. The card says what's being dragged; the list allows dropping and reads it back:\n\n```jsx\n<li draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', task.id); e.dataTransfer.effectAllowed = 'move'; }}>\n\n<ol\n  onDragOver={(e) => e.preventDefault()}                  // without this, dropping isn't allowed\n  onDrop={(e) => { e.preventDefault(); onMove(e.dataTransfer.getData('text/plain'), column.id); }}\n>\n```\n\n| Event | On | Does |\n|---|---|---|\n| `dragstart` | the card | puts the task id in `dataTransfer` |\n| `dragover` | the list | `preventDefault()` says \"you can drop here\" |\n| `drop` | the list | reads the id and moves the task |\n| `dragend` | anywhere | tidy up (hide the marker) |\n\nOnly the **id** travels in `dataTransfer`. The real task stays in React state, and the drop calls the same `move()` function as everything else.\n\n```svg dragstart stores the id, dragover allows the drop, drop reads the id and moves the task in state\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 500 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"500\" height=\"100\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"35\" width=\"120\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"70\" y=\"54\" text-anchor=\"middle\">dragstart: setData</text>\n  <rect x=\"180\" y=\"35\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"250\" y=\"54\" text-anchor=\"middle\">dragover: preventDefault</text>\n  <rect x=\"370\" y=\"35\" width=\"120\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"430\" y=\"54\" text-anchor=\"middle\">drop: getData → move</text>\n  <path d=\"M130 50 H180 M320 50 H370\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What happens if the list's onDragOver doesn't call preventDefault()?",
     "options": [
      "The browser won't allow dropping there, so drop never fires",
      "The card is copied instead of moved",
      "Nothing changes"
     ],
     "answer": 0,
     "why": "By default elements aren't drop targets; preventDefault on dragover opts in."
    },
    {
     "q": "Why put only the task id in dataTransfer?",
     "options": [
      "dataTransfer can't hold text",
      "The task lives in React state; the id is all the drop needs to find and move it",
      "Ids are encrypted"
     ],
     "answer": 1,
     "why": "Keep one source of truth. The drop looks the task up by id."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Where exactly was it dropped?",
   "body": "To drop *between* cards, find the first card whose middle is below the pointer:\n\n```js\nfunction dropIndex(list, clientY) {\n  const cards = [...list.querySelectorAll('.card')];\n  const i = cards.findIndex((c) => { const r = c.getBoundingClientRect(); return clientY < r.top + r.height / 2; });\n  return i === -1 ? cards.length : i;\n}\n```\n\nWhile dragging, remember `{ column, index }` in state and draw a thin marker there. On drop, one detail matters: the dragged card is **still in the list** when you measure, so if it was above the drop point, every index below it is one too high:\n\n```jsx\nonDrop={(e) => {\n  e.preventDefault();\n  const id = e.dataTransfer.getData('text/plain');\n  const index = dropIndex(e.currentTarget, e.clientY);\n  const before = list.findIndex((t) => t.id === id);\n  onMove(id, col.id, before !== -1 && before < index ? index - 1 : index);\n}}\n```\n\n```svg The pointer is above card C's middle, so the drop index is 2; if the dragged card A is above, subtract one\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 420 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"420\" height=\"150\" fill=\"#fff\"/>\n  <rect x=\"20\" y=\"10\" width=\"160\" height=\"30\" rx=\"4\" fill=\"#e0e7ff\"/><text x=\"30\" y=\"30\">0 · A (being dragged)</text>\n  <rect x=\"20\" y=\"46\" width=\"160\" height=\"30\" rx=\"4\" fill=\"#e0e7ff\"/><text x=\"30\" y=\"66\">1 · B</text>\n  <line x1=\"20\" y1=\"80\" x2=\"180\" y2=\"80\" stroke=\"#2563eb\" stroke-width=\"3\"/>\n  <rect x=\"20\" y=\"84\" width=\"160\" height=\"30\" rx=\"4\" fill=\"#e0e7ff\"/><text x=\"30\" y=\"104\">2 · C</text>\n  <line x1=\"20\" y1=\"99\" x2=\"180\" y2=\"99\" stroke=\"#dc2626\" stroke-dasharray=\"3 3\"/>\n  <text x=\"195\" y=\"84\">pointer here → index 2</text><text x=\"195\" y=\"102\" fill=\"#dc2626\">C's middle</text><text x=\"195\" y=\"124\">A was above → move to 1</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why subtract one when the dragged card was above the drop index?",
     "options": [
      "It's counted in the list while measuring, but it leaves its old spot when moved",
      "Indexes start at 1",
      "To leave room for the marker"
     ],
     "answer": 0,
     "why": "Removing the card from above shifts every later card up by one."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 16
  },
  {
   "title": "A keyboard way to move every card",
   "body": "Drag and drop needs a mouse or a finger. Every card also has a small **Move to** menu, so the keyboard and screen readers can do the same thing:\n\n```jsx\n<label className=\"move\">\n  <span className=\"sr-only\">Move “{task.title}” to</span>\n  <select value={task.column} onChange={(e) => onMove(task.id, e.target.value)}>\n    {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}\n  </select>\n</label>\n```\n\nBoth paths call the same `onMove`, so the rules can't drift apart. Without an index, `move()` puts the card at the end of the column.\n\n```svg Mouse and keyboard take different paths to the same move() function\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 460 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"460\" height=\"100\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"80\" y=\"29\" text-anchor=\"middle\">drag and drop</text>\n  <rect x=\"10\" y=\"60\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"80\" y=\"79\" text-anchor=\"middle\">Move to menu</text>\n  <rect x=\"260\" y=\"35\" width=\"160\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"340\" y=\"54\" text-anchor=\"middle\">onMove → move()</text>\n  <path d=\"M150 25 L260 50 M150 75 L260 50\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does every card also have a Move to menu?",
     "options": [
      "Menus are faster than dragging",
      "Not everyone can drag; a menu works with the keyboard and screen readers",
      "Browsers on phones don't support select"
     ],
     "answer": 1,
     "why": "Every action needs a way that doesn't depend on a pointer."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  }
 ],
 "finish": "You can drag cards between lists with the HTML5 events, drop them at an exact position with a marker, and offer a keyboard path to the same move.\n\n### Challenges\n\n1. Let Alt + arrow keys move the focused card up and down within its column.\n2. Make the whole column glow while a card is dragged over it.\n3. Add a test for the off-by-one: dragging the top card to just below the second one."
};
