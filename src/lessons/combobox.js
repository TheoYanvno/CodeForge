// Built from guides/combobox.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "combobox",
 "title": "Search as you type",
 "goals": [
  "Wait for a pause in typing before searching (debounce) with an effect's cleanup",
  "Build a keyboard-friendly suggestion list with the combobox pattern",
  "Keep the user informed with no-results and error messages"
 ],
 "prereqs": [
  "React basics (state, effects, controlled inputs)",
  "Fetching data in React"
 ],
 "sessions": [
  {
   "title": "A city search",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "Debounce: search after a pause, not every key",
   "body": "Typing \"Orlando\" is seven key presses. Searching on each one sends seven requests, and most of their answers are thrown away. Instead, **wait** until the typing pauses for 300 ms. In React that's a `setTimeout` inside an effect, and the effect's cleanup cancels the timer when the text changes again:\n\n```jsx\nuseEffect(() => {\n  const q = text.trim();\n  if (q.length < 2) { setResults([]); return undefined; }\n  const timer = setTimeout(() => {\n    run.current(() => getJson(geocodeUrl(q), { cache }).then(parsePlaces), setResults);\n  }, 300);\n  return () => clearTimeout(timer);       // a new key press cancels the waiting search\n}, [text]);\n```\n\n```svg Each key press restarts the 300 ms timer; only the pause after the last key sends a search\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"100\" fill=\"#fff\"/>\n  <line x1=\"10\" y1=\"80\" x2=\"510\" y2=\"80\" stroke=\"#9ca3af\"/>\n  <text x=\"20\" y=\"72\">O</text><text x=\"60\" y=\"72\">r</text><text x=\"95\" y=\"72\">l</text><text x=\"130\" y=\"72\">a</text><text x=\"170\" y=\"72\">n</text><text x=\"205\" y=\"72\">d</text><text x=\"240\" y=\"72\">o</text>\n  <rect x=\"243\" y=\"30\" width=\"150\" height=\"16\" fill=\"#dcfce7\"/><text x=\"250\" y=\"42\">300 ms quiet</text>\n  <text x=\"400\" y=\"42\" fill=\"#16a34a\">→ one search</text>\n  <path d=\"M25 50 h30 M65 50 h25 M100 50 h25 M135 50 h30\" stroke=\"#dc2626\" stroke-dasharray=\"3 3\"/><text x=\"20\" y=\"22\" fill=\"#dc2626\">timers cancelled</text>\n</svg>\n```\n\nLate answers still matter: the search uses the same `latest()` ticket helper from Fetching data in React, so an old search can't replace a newer one.",
   "quiz": [
    {
     "q": "What cancels the waiting search when another key is pressed?",
     "options": [
      "The browser cancels all timers on input",
      "The effect's cleanup function runs clearTimeout before the effect runs again for the new text",
      "setResults([])"
     ],
     "answer": 1,
     "why": "React runs the previous effect's cleanup before re-running it, which is exactly where to cancel the timer."
    },
    {
     "q": "Why wait for at least 2 characters?",
     "options": [
      "One letter matches thousands of places and wastes a request",
      "The API refuses single letters",
      "React can't render one-letter strings"
     ],
     "answer": 0,
     "why": "Very short queries are slow and unhelpful, so skip them."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 14
  },
  {
   "title": "The combobox pattern: suggestions you can use with keys",
   "body": "A suggestion list must work without a mouse. The **combobox** pattern tells assistive technology how the input and the list fit together:\n\n```jsx\n<input role=\"combobox\" aria-expanded={results.length > 0} aria-controls={listId}\n  aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}\n  value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} />\n<ul id={listId} role=\"listbox\">\n  {results.map((p, i) => (\n    <li key={p.id} id={`${listId}-${i}`} role=\"option\" aria-selected={i === active}\n      onMouseDown={(e) => { e.preventDefault(); pick(p); }}>{p.label}</li>\n  ))}\n</ul>\n```\n\nFocus **stays in the input**; `aria-activedescendant` says which option is highlighted. The keys move that highlight:\n\n```js\nconst onKey = (e) => {\n  if (!results.length) return;\n  if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % results.length); }\n  if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? results.length - 1 : a - 1)); }\n  if (e.key === 'Enter') { e.preventDefault(); pick(results[Math.max(active, 0)]); }\n  if (e.key === 'Escape') setResults([]);\n};\n```\n\n`useId()` makes ids that are unique even if the search appears twice on a page. `onMouseDown` with `preventDefault` picks before the input loses focus.\n\n```svg Focus stays in the input; arrow keys move aria-activedescendant through the options\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 420 140\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"420\" height=\"140\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"200\" height=\"28\" rx=\"5\" fill=\"#fff\" stroke=\"#2563eb\" stroke-width=\"2\"/><text x=\"18\" y=\"29\">Orl|</text>\n  <rect x=\"10\" y=\"44\" width=\"200\" height=\"26\" fill=\"#f8fafc\" stroke=\"#cbd5e1\"/><text x=\"18\" y=\"61\">Orlando, Florida</text>\n  <rect x=\"10\" y=\"70\" width=\"200\" height=\"26\" fill=\"#dbeafe\" stroke=\"#cbd5e1\"/><text x=\"18\" y=\"87\">Orleans, France</text>\n  <rect x=\"10\" y=\"96\" width=\"200\" height=\"26\" fill=\"#f8fafc\" stroke=\"#cbd5e1\"/><text x=\"18\" y=\"113\">Orly, France</text>\n  <path d=\"M215 24 C 280 24, 280 83, 215 83\" fill=\"none\" stroke=\"#2563eb\" stroke-width=\"2\"/><text x=\"270\" y=\"50\">aria-activedescendant</text><text x=\"270\" y=\"66\">↑ ↓ move, Enter picks</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Where is keyboard focus while the user arrows through suggestions?",
     "options": [
      "On each option in turn",
      "It stays in the input; aria-activedescendant points at the highlighted option",
      "On the listbox"
     ],
     "answer": 1,
     "why": "Keeping focus in the input means typing still works while the highlight moves."
    },
    {
     "q": "Why pick on onMouseDown with preventDefault instead of onClick?",
     "options": [
      "onMouseDown fires before the input blurs, so the list is still there to click",
      "onClick doesn't work on list items",
      "It's required by the combobox role"
     ],
     "answer": 0,
     "why": "Blur can close the list before a click lands; mousedown happens first."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Telling people what happened",
   "body": "Silence is confusing. The search sets one short message for each case and shows it in a `role=\"status\"` element, which screen readers announce politely:\n\n| Case | Message |\n|---|---|\n| The search failed | Search is unavailable right now. |\n| Nothing matched | No places called “Atlantiss”. |\n| Results | (no message; the list is enough) |\n\n```jsx\nrun.current(() => getJson(geocodeUrl(q), { cache }).then(parsePlaces).catch(() => null), (places) => {\n  if (places === null) { setResults([]); setMessage('Search is unavailable right now.'); return; }\n  setResults(places);\n  setActive(-1);\n  setMessage(places.length ? '' : `No places called “${q}”.`);\n});\n```\n\n```svg Every outcome of a search gets an answer: results, a no-match message, or an error message\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 440 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"440\" height=\"100\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"35\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"55\" y=\"54\" text-anchor=\"middle\">search</text>\n  <rect x=\"170\" y=\"5\" width=\"120\" height=\"26\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"230\" y=\"22\" text-anchor=\"middle\">list of places</text>\n  <rect x=\"170\" y=\"37\" width=\"120\" height=\"26\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"230\" y=\"54\" text-anchor=\"middle\">\"No places called…\"</text>\n  <rect x=\"170\" y=\"69\" width=\"120\" height=\"26\" rx=\"6\" fill=\"#fee2e2\"/><text x=\"230\" y=\"86\" text-anchor=\"middle\">\"Search is unavailable\"</text>\n  <path d=\"M100 50 L170 18 M100 50 H170 M100 50 L170 82\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why show messages in an element with role=\"status\"?",
     "options": [
      "It makes the text bold",
      "Screen readers announce changes to it without moving focus",
      "It's required for error messages to show"
     ],
     "answer": 1,
     "why": "A live status region reports updates politely, so the user hears \"No places called…\" while typing."
    },
    {
     "q": "Why turn a failed search into null instead of letting the error escape?",
     "options": [
      "The component can show a calm message instead of crashing or leaving the old results up",
      "null is faster than an error",
      "fetch errors can't be caught"
     ],
     "answer": 0,
     "why": "Catching it lets the screen explain what happened."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  }
 ],
 "finish": "You can debounce a search in an effect, build a combobox that works with the keyboard, and tell people what happened.\n\n### Challenges\n\n1. Show \"Searching…\" while a search is waiting.\n2. Remember the last five picks and show them when the input is empty.\n3. Highlight the matching letters in each suggestion."
};
