---
id: shortcuts
title: Keyboard shortcuts and accessibility
goals: Add page-wide keyboard shortcuts in a React effect, and clean them up; Make shortcuts stay out of the way when someone is typing or using a button; Keep everything usable without shortcuts, with labels, live regions and visible focus
prereqs: React basics (effects, refs, events); Spaced repetition scheduling
---

## Session: Studying without a mouse

## Step: Shortcuts in an effect
kind: read
time: 14

Shortcuts work anywhere on the page, so listen on `window` inside an effect, and remove the listener in the cleanup:

```jsx
useEffect(() => {
  function onKey(e) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (card) setFlipped((f) => !f); }
    else if (['1', '2', '3', '4'].includes(e.key)) rate(GRADES[Number(e.key) - 1]);   // Again, Hard, Good, Easy
    else if (e.key === 'f' || e.key === 'F') fullscreen();
  }
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
});
```

This effect has **no dependency list**, so it re-attaches after every render with the latest `card` and `rate`. Without the cleanup, every render would add one more listener, and one key press would rate a card many times.

| Key | Does |
|---|---|
| Space or Enter | flip the card |
| 1 2 3 4 | Again, Hard, Good, Easy |
| F | full screen |

```svg Each render removes the old listener and adds a fresh one, so exactly one is ever attached
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 90" font-family="sans-serif" font-size="12">
  <rect width="480" height="90" fill="#fff"/>
  <rect x="10" y="30" width="90" height="30" rx="6" fill="#e0e7ff"/><text x="55" y="49" text-anchor="middle">render 1</text>
  <rect x="150" y="30" width="110" height="30" rx="6" fill="#fee2e2"/><text x="205" y="49" text-anchor="middle">cleanup: remove</text>
  <rect x="310" y="30" width="160" height="30" rx="6" fill="#dcfce7"/><text x="390" y="49" text-anchor="middle">render 2: add fresh</text>
  <path d="M100 45 H150 M260 45 H310" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: What goes wrong if the effect adds a keydown listener but never removes it?
- [x] Listeners pile up with every render, and one key press runs the action many times
- [ ] The first listener stops working
- [ ] Nothing; browsers remove duplicates
why: Every effect that subscribes must unsubscribe in its cleanup.

## Step: Stay out of the way
kind: read
time: 12

A shortcut must never steal keys someone is typing. The handler checks where the key press happened first:

```js
if (e.target.closest && e.target.closest('input, textarea, select')) return;      // typing in a field
if (e.key === ' ' || e.key === 'Enter') {
  if (e.target.closest && e.target.closest('button') && !e.target.closest('.flashcard')) return;   // let buttons work
  // …
}
```

- Typing a **1** in the settings shouldn't rate a card.
- **Space** on a focused button should press that button, not flip the card.
- Rating does nothing until the card is flipped: `if (!card || !flipped) return;`.

```svg The handler checks the key's target first and only acts when nothing else should get the key
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 100" font-family="sans-serif" font-size="12">
  <rect width="480" height="100" fill="#fff"/>
  <rect x="10" y="35" width="80" height="30" rx="6" fill="#e0e7ff"/><text x="50" y="54" text-anchor="middle">key press</text>
  <rect x="130" y="5" width="170" height="24" rx="4" fill="#fef3c7"/><text x="138" y="22">in an input → ignore</text>
  <rect x="130" y="38" width="170" height="24" rx="4" fill="#fef3c7"/><text x="138" y="55">Space on a button → ignore</text>
  <rect x="130" y="71" width="170" height="24" rx="4" fill="#dcfce7"/><text x="138" y="88">otherwise → shortcut</text>
  <path d="M90 50 L130 17 M90 50 H130 M90 50 L130 83" stroke="#374151"/>
</svg>
```

quiz: Why does the handler ignore keys pressed inside inputs?
- [ ] Inputs can't receive keys
- [x] Someone typing "1" in a field shouldn't rate a card
- [ ] It's faster
why: Shortcuts must give way to normal typing.

## Step: Everything works without shortcuts
kind: read
time: 12

Shortcuts are a bonus, never the only way:

- The card is a real `<button>` with an `aria-label` that changes: "Show the answer for Closure" / "Hide the answer for Closure".
- The answer area is `aria-live="polite"`, so a screen reader reads it when it appears.
- The four rating buttons sit in a `role="group"` labeled "How well did you know it?", and are `disabled` until the card is flipped.
- The hint "Press Space or tap to flip" tells people the shortcut exists.
- Focus rings stay visible (`:focus-visible`), so keyboard users always see where they are.

```jsx
<div className="grades" role="group" aria-label="How well did you know it?">
  {GRADES.map((g) => <button key={g} className={`grade ${g}`} disabled={!card || !flipped} onClick={() => rate(g)}>{BUTTONS[g].label}</button>)}
</div>
```

```svg Mouse, keyboard and screen reader each have a full path through a study session
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 90" font-family="sans-serif" font-size="12">
  <rect width="480" height="90" fill="#fff"/>
  <rect x="10" y="8" width="120" height="22" rx="4" fill="#dbeafe"/><text x="18" y="24">click card · buttons</text>
  <rect x="10" y="36" width="120" height="22" rx="4" fill="#fef3c7"/><text x="18" y="52">Space · 1–4 · F</text>
  <rect x="10" y="64" width="120" height="22" rx="4" fill="#dcfce7"/><text x="18" y="80">labels · live answer</text>
  <rect x="200" y="30" width="120" height="30" rx="6" fill="#e0e7ff"/><text x="260" y="49" text-anchor="middle">flip · rate</text>
  <path d="M130 19 L200 40 M130 47 H200 M130 75 L200 52" stroke="#374151"/>
</svg>
```

quiz: Why are the rating buttons disabled until the card is flipped?
- [x] Rating before seeing the answer would schedule the card on a guess
- [ ] Disabled buttons load faster
- [ ] To stop screen readers from reading them
why: The rating should reflect whether you really knew the answer.

## Finish

You can add page-wide shortcuts that clean up after themselves, keep them out of the way of typing and buttons, and make sure everything works without them.

### Challenges

1. Add a ? shortcut that opens a list of all the shortcuts.
2. Add U to undo the last rating.
3. Test the app with only the keyboard and fix anything you can't reach.
