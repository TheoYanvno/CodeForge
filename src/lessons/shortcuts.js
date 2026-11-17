// Built from guides/shortcuts.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "shortcuts",
 "title": "Keyboard shortcuts and accessibility",
 "goals": [
  "Add page-wide keyboard shortcuts in a React effect, and clean them up",
  "Make shortcuts stay out of the way when someone is typing or using a button",
  "Keep everything usable without shortcuts, with labels, live regions and visible focus"
 ],
 "prereqs": [
  "React basics (effects, refs, events)",
  "Spaced repetition scheduling"
 ],
 "sessions": [
  {
   "title": "Studying without a mouse",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "Shortcuts in an effect",
   "body": "Shortcuts work anywhere on the page, so listen on `window` inside an effect, and remove the listener in the cleanup:\n\n```jsx\nuseEffect(() => {\n  function onKey(e) {\n    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (card) setFlipped((f) => !f); }\n    else if (['1', '2', '3', '4'].includes(e.key)) rate(GRADES[Number(e.key) - 1]);   // Again, Hard, Good, Easy\n    else if (e.key === 'f' || e.key === 'F') fullscreen();\n  }\n  window.addEventListener('keydown', onKey);\n  return () => window.removeEventListener('keydown', onKey);\n});\n```\n\nThis effect has **no dependency list**, so it re-attaches after every render with the latest `card` and `rate`. Without the cleanup, every render would add one more listener, and one key press would rate a card many times.\n\n| Key | Does |\n|---|---|\n| Space or Enter | flip the card |\n| 1 2 3 4 | Again, Hard, Good, Easy |\n| F | full screen |\n\n```svg Each render removes the old listener and adds a fresh one, so exactly one is ever attached\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"30\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"55\" y=\"49\" text-anchor=\"middle\">render 1</text>\n  <rect x=\"150\" y=\"30\" width=\"110\" height=\"30\" rx=\"6\" fill=\"#fee2e2\"/><text x=\"205\" y=\"49\" text-anchor=\"middle\">cleanup: remove</text>\n  <rect x=\"310\" y=\"30\" width=\"160\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"390\" y=\"49\" text-anchor=\"middle\">render 2: add fresh</text>\n  <path d=\"M100 45 H150 M260 45 H310\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What goes wrong if the effect adds a keydown listener but never removes it?",
     "options": [
      "Listeners pile up with every render, and one key press runs the action many times",
      "The first listener stops working",
      "Nothing; browsers remove duplicates"
     ],
     "answer": 0,
     "why": "Every effect that subscribes must unsubscribe in its cleanup."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 14
  },
  {
   "title": "Stay out of the way",
   "body": "A shortcut must never steal keys someone is typing. The handler checks where the key press happened first:\n\n```js\nif (e.target.closest && e.target.closest('input, textarea, select')) return;      // typing in a field\nif (e.key === ' ' || e.key === 'Enter') {\n  if (e.target.closest && e.target.closest('button') && !e.target.closest('.flashcard')) return;   // let buttons work\n  // …\n}\n```\n\n- Typing a **1** in the settings shouldn't rate a card.\n- **Space** on a focused button should press that button, not flip the card.\n- Rating does nothing until the card is flipped: `if (!card || !flipped) return;`.\n\n```svg The handler checks the key's target first and only acts when nothing else should get the key\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"100\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"35\" width=\"80\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"50\" y=\"54\" text-anchor=\"middle\">key press</text>\n  <rect x=\"130\" y=\"5\" width=\"170\" height=\"24\" rx=\"4\" fill=\"#fef3c7\"/><text x=\"138\" y=\"22\">in an input → ignore</text>\n  <rect x=\"130\" y=\"38\" width=\"170\" height=\"24\" rx=\"4\" fill=\"#fef3c7\"/><text x=\"138\" y=\"55\">Space on a button → ignore</text>\n  <rect x=\"130\" y=\"71\" width=\"170\" height=\"24\" rx=\"4\" fill=\"#dcfce7\"/><text x=\"138\" y=\"88\">otherwise → shortcut</text>\n  <path d=\"M90 50 L130 17 M90 50 H130 M90 50 L130 83\" stroke=\"#374151\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does the handler ignore keys pressed inside inputs?",
     "options": [
      "Inputs can't receive keys",
      "Someone typing \"1\" in a field shouldn't rate a card",
      "It's faster"
     ],
     "answer": 1,
     "why": "Shortcuts must give way to normal typing."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Everything works without shortcuts",
   "body": "Shortcuts are a bonus, never the only way:\n\n- The card is a real `<button>` with an `aria-label` that changes: \"Show the answer for Closure\" / \"Hide the answer for Closure\".\n- The answer area is `aria-live=\"polite\"`, so a screen reader reads it when it appears.\n- The four rating buttons sit in a `role=\"group\"` labeled \"How well did you know it?\", and are `disabled` until the card is flipped.\n- The hint \"Press Space or tap to flip\" tells people the shortcut exists.\n- Focus rings stay visible (`:focus-visible`), so keyboard users always see where they are.\n\n```jsx\n<div className=\"grades\" role=\"group\" aria-label=\"How well did you know it?\">\n  {GRADES.map((g) => <button key={g} className={`grade ${g}`} disabled={!card || !flipped} onClick={() => rate(g)}>{BUTTONS[g].label}</button>)}\n</div>\n```\n\n```svg Mouse, keyboard and screen reader each have a full path through a study session\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"8\" width=\"120\" height=\"22\" rx=\"4\" fill=\"#dbeafe\"/><text x=\"18\" y=\"24\">click card · buttons</text>\n  <rect x=\"10\" y=\"36\" width=\"120\" height=\"22\" rx=\"4\" fill=\"#fef3c7\"/><text x=\"18\" y=\"52\">Space · 1–4 · F</text>\n  <rect x=\"10\" y=\"64\" width=\"120\" height=\"22\" rx=\"4\" fill=\"#dcfce7\"/><text x=\"18\" y=\"80\">labels · live answer</text>\n  <rect x=\"200\" y=\"30\" width=\"120\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"260\" y=\"49\" text-anchor=\"middle\">flip · rate</text>\n  <path d=\"M130 19 L200 40 M130 47 H200 M130 75 L200 52\" stroke=\"#374151\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why are the rating buttons disabled until the card is flipped?",
     "options": [
      "Rating before seeing the answer would schedule the card on a guess",
      "Disabled buttons load faster",
      "To stop screen readers from reading them"
     ],
     "answer": 0,
     "why": "The rating should reflect whether you really knew the answer."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  }
 ],
 "finish": "You can add page-wide shortcuts that clean up after themselves, keep them out of the way of typing and buttons, and make sure everything works without them.\n\n### Challenges\n\n1. Add a ? shortcut that opens a list of all the shortcuts.\n2. Add U to undo the last rating.\n3. Test the app with only the keyboard and fix anything you can't reach."
};
