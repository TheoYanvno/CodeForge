---
id: combobox
title: Search as you type
goals: Wait for a pause in typing before searching (debounce) with an effect's cleanup; Build a keyboard-friendly suggestion list with the combobox pattern; Keep the user informed with no-results and error messages
prereqs: React basics (state, effects, controlled inputs); Fetching data in React
---

## Session: A city search

## Step: Debounce: search after a pause, not every key
kind: read
time: 14

Typing "Orlando" is seven key presses. Searching on each one sends seven requests, and most of their answers are thrown away. Instead, **wait** until the typing pauses for 300 ms. In React that's a `setTimeout` inside an effect, and the effect's cleanup cancels the timer when the text changes again:

```jsx
useEffect(() => {
  const q = text.trim();
  if (q.length < 2) { setResults([]); return undefined; }
  const timer = setTimeout(() => {
    run.current(() => getJson(geocodeUrl(q), { cache }).then(parsePlaces), setResults);
  }, 300);
  return () => clearTimeout(timer);       // a new key press cancels the waiting search
}, [text]);
```

```svg Each key press restarts the 300 ms timer; only the pause after the last key sends a search
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 100" font-family="sans-serif" font-size="12">
  <rect width="520" height="100" fill="#fff"/>
  <line x1="10" y1="80" x2="510" y2="80" stroke="#9ca3af"/>
  <text x="20" y="72">O</text><text x="60" y="72">r</text><text x="95" y="72">l</text><text x="130" y="72">a</text><text x="170" y="72">n</text><text x="205" y="72">d</text><text x="240" y="72">o</text>
  <rect x="243" y="30" width="150" height="16" fill="#dcfce7"/><text x="250" y="42">300 ms quiet</text>
  <text x="400" y="42" fill="#16a34a">→ one search</text>
  <path d="M25 50 h30 M65 50 h25 M100 50 h25 M135 50 h30" stroke="#dc2626" stroke-dasharray="3 3"/><text x="20" y="22" fill="#dc2626">timers cancelled</text>
</svg>
```

Late answers still matter: the search uses the same `latest()` ticket helper from Fetching data in React, so an old search can't replace a newer one.

quiz: What cancels the waiting search when another key is pressed?
- [ ] The browser cancels all timers on input
- [x] The effect's cleanup function runs clearTimeout before the effect runs again for the new text
- [ ] setResults([])
why: React runs the previous effect's cleanup before re-running it, which is exactly where to cancel the timer.

quiz: Why wait for at least 2 characters?
- [x] One letter matches thousands of places and wastes a request
- [ ] The API refuses single letters
- [ ] React can't render one-letter strings
why: Very short queries are slow and unhelpful, so skip them.

## Step: The combobox pattern: suggestions you can use with keys
kind: read
time: 18

A suggestion list must work without a mouse. The **combobox** pattern tells assistive technology how the input and the list fit together:

```jsx
<input role="combobox" aria-expanded={results.length > 0} aria-controls={listId}
  aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
  value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} />
<ul id={listId} role="listbox">
  {results.map((p, i) => (
    <li key={p.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}
      onMouseDown={(e) => { e.preventDefault(); pick(p); }}>{p.label}</li>
  ))}
</ul>
```

Focus **stays in the input**; `aria-activedescendant` says which option is highlighted. The keys move that highlight:

```js
const onKey = (e) => {
  if (!results.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % results.length); }
  if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? results.length - 1 : a - 1)); }
  if (e.key === 'Enter') { e.preventDefault(); pick(results[Math.max(active, 0)]); }
  if (e.key === 'Escape') setResults([]);
};
```

`useId()` makes ids that are unique even if the search appears twice on a page. `onMouseDown` with `preventDefault` picks before the input loses focus.

```svg Focus stays in the input; arrow keys move aria-activedescendant through the options
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 140" font-family="sans-serif" font-size="12">
  <rect width="420" height="140" fill="#fff"/>
  <rect x="10" y="10" width="200" height="28" rx="5" fill="#fff" stroke="#2563eb" stroke-width="2"/><text x="18" y="29">Orl|</text>
  <rect x="10" y="44" width="200" height="26" fill="#f8fafc" stroke="#cbd5e1"/><text x="18" y="61">Orlando, Florida</text>
  <rect x="10" y="70" width="200" height="26" fill="#dbeafe" stroke="#cbd5e1"/><text x="18" y="87">Orleans, France</text>
  <rect x="10" y="96" width="200" height="26" fill="#f8fafc" stroke="#cbd5e1"/><text x="18" y="113">Orly, France</text>
  <path d="M215 24 C 280 24, 280 83, 215 83" fill="none" stroke="#2563eb" stroke-width="2"/><text x="270" y="50">aria-activedescendant</text><text x="270" y="66">↑ ↓ move, Enter picks</text>
</svg>
```

quiz: Where is keyboard focus while the user arrows through suggestions?
- [ ] On each option in turn
- [x] It stays in the input; aria-activedescendant points at the highlighted option
- [ ] On the listbox
why: Keeping focus in the input means typing still works while the highlight moves.

quiz: Why pick on onMouseDown with preventDefault instead of onClick?
- [x] onMouseDown fires before the input blurs, so the list is still there to click
- [ ] onClick doesn't work on list items
- [ ] It's required by the combobox role
why: Blur can close the list before a click lands; mousedown happens first.

## Step: Telling people what happened
kind: read
time: 10

Silence is confusing. The search sets one short message for each case and shows it in a `role="status"` element, which screen readers announce politely:

| Case | Message |
|---|---|
| The search failed | Search is unavailable right now. |
| Nothing matched | No places called “Atlantiss”. |
| Results | (no message; the list is enough) |

```jsx
run.current(() => getJson(geocodeUrl(q), { cache }).then(parsePlaces).catch(() => null), (places) => {
  if (places === null) { setResults([]); setMessage('Search is unavailable right now.'); return; }
  setResults(places);
  setActive(-1);
  setMessage(places.length ? '' : `No places called “${q}”.`);
});
```

```svg Every outcome of a search gets an answer: results, a no-match message, or an error message
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 100" font-family="sans-serif" font-size="12">
  <rect width="440" height="100" fill="#fff"/>
  <rect x="10" y="35" width="90" height="30" rx="6" fill="#e0e7ff"/><text x="55" y="54" text-anchor="middle">search</text>
  <rect x="170" y="5" width="120" height="26" rx="6" fill="#dcfce7"/><text x="230" y="22" text-anchor="middle">list of places</text>
  <rect x="170" y="37" width="120" height="26" rx="6" fill="#fef3c7"/><text x="230" y="54" text-anchor="middle">"No places called…"</text>
  <rect x="170" y="69" width="120" height="26" rx="6" fill="#fee2e2"/><text x="230" y="86" text-anchor="middle">"Search is unavailable"</text>
  <path d="M100 50 L170 18 M100 50 H170 M100 50 L170 82" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why show messages in an element with role="status"?
- [ ] It makes the text bold
- [x] Screen readers announce changes to it without moving focus
- [ ] It's required for error messages to show
why: A live status region reports updates politely, so the user hears "No places called…" while typing.

quiz: Why turn a failed search into null instead of letting the error escape?
- [x] The component can show a calm message instead of crashing or leaving the old results up
- [ ] null is faster than an error
- [ ] fetch errors can't be caught
why: Catching it lets the screen explain what happened.

## Finish

You can debounce a search in an effect, build a combobox that works with the keyboard, and tell people what happened.

### Challenges

1. Show "Searching…" while a search is waiting.
2. Remember the last five picks and show them when the input is empty.
3. Highlight the matching letters in each suggestion.
