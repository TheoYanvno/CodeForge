---
id: srs
title: Spaced repetition scheduling
goals: Explain why reviewing right before you forget beats cramming; Implement an SM-2 style review() that turns a rating into the next due date; Build the study queue from due cards and a limited number of new ones
prereqs: JavaScript basics (objects, Math, sorting); Dates as timestamps in milliseconds
---

## Session: Remember more, study less

## Step: Why spacing works
kind: read
time: 10

Right after you learn a term you remember it; a few days later, most of it is gone. Each time you **recall** it just as it's fading, it lasts longer before fading again. Spaced repetition schedules each card for that moment: soon at first, then further and further apart.

| Review | Wait before the next one (if you knew it) |
|---|---|
| 1st | 1 day |
| 2nd | 6 days |
| 3rd | about 15 days (6 × 2.5) |
| 4th | about 38 days |

Cards you know well stop taking time; cards you struggle with come back often.

```svg Each successful review resets the forgetting curve and makes it fall more slowly
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" font-family="sans-serif" font-size="12">
  <rect width="480" height="120" fill="#fff"/>
  <line x1="20" y1="100" x2="470" y2="100" stroke="#94a3b8"/><text x="420" y="115">time</text>
  <path d="M20 20 Q 50 80 80 85" fill="none" stroke="#dc2626" stroke-width="2"/>
  <path d="M80 20 Q 140 70 200 78" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <path d="M200 20 Q 320 60 440 70" fill="none" stroke="#16a34a" stroke-width="2"/>
  <g fill="#2563eb"><circle cx="80" cy="20" r="4"/><circle cx="200" cy="20" r="4"/></g><text x="90" y="16">review</text><text x="210" y="16">review</text>
</svg>
```

quiz: When is the best time to review a card?
- [ ] Immediately after learning it, many times
- [x] Just as you're about to forget it
- [ ] Only the night before a test
why: Recalling something as it fades strengthens it the most for the effort.

## Step: review(): from a rating to the next due date
kind: read
time: 18

Each card has a small state: `reps` (correct reviews in a row), `interval` (days), `ease` (how fast the interval grows, starting at 2.5), `due` (a timestamp) and `lapses`. After you rate a card **Again, Hard, Good or Easy**, `review()` returns its next state:

```js
export function review(state = newCardState(), grade, now = Date.now()) {
  const s = { ...newCardState(), ...state };
  if (grade === 'again') {                                  // forgot: back in 10 minutes, a bit harder from now on
    return { ...s, reps: 0, interval: 0, lapses: s.lapses + 1, ease: Math.max(MIN_EASE, s.ease - 0.2), due: now + 10 * 60 * 1000, last: now };
  }
  let interval;
  if (s.reps === 0) interval = grade === 'easy' ? 4 : 1;
  else if (s.reps === 1) interval = grade === 'hard' ? 3 : 6;
  else interval = s.interval * (grade === 'hard' ? 1.2 : grade === 'easy' ? s.ease * 1.3 : s.ease);
  const ease = Math.max(MIN_EASE, s.ease + { hard: -0.15, good: 0, easy: 0.15 }[grade]);
  interval = Math.max(1, Math.round(interval));
  return { ...s, reps: s.reps + 1, interval, ease: Math.round(ease * 100) / 100, due: now + interval * DAY, last: now };
}
```

- **Ease** never drops below 1.3, so even hard cards still spread out.
- `now` is a parameter, so tests can check "rated Good three times, due in 15 days" without waiting.
- The function returns a **new** object; the old state is untouched.

```svg A card rated Good each time: due in 1 day, then 6, then 15
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 80" font-family="sans-serif" font-size="12">
  <rect width="480" height="80" fill="#fff"/>
  <line x1="20" y1="45" x2="470" y2="45" stroke="#94a3b8" stroke-width="2"/>
  <g fill="#2563eb"><circle cx="20" cy="45" r="5"/><circle cx="35" cy="45" r="5"/><circle cx="125" cy="45" r="5"/><circle cx="350" cy="45" r="5"/></g>
  <text x="10" y="70">new</text><text x="30" y="30">+1</text><text x="115" y="30">+6</text><text x="335" y="30">+15</text>
</svg>
```

quiz: What happens when you rate a card Again?
- [x] It comes back in 10 minutes, its streak resets, and its ease drops a little
- [ ] It's deleted
- [ ] It waits twice as long
why: A forgotten card needs another try soon and should grow more slowly afterward.

quiz: Why is now a parameter instead of calling Date.now() inside?
- [ ] Date.now() is slow
- [x] Tests can pass any time and check the due dates exactly
- [ ] It must be a string
why: Injected time makes scheduling testable.

## Step: The study queue
kind: read
time: 12

A session shows cards that are **due** (most overdue first), then a limited number of **new** cards, so a fresh deck of 60 doesn't arrive all at once:

```js
export function dueQueue(cards, states = {}, now = Date.now(), newLimit = 10) {
  const seen = cards.filter((c) => states[c.id] && states[c.id].reps + states[c.id].lapses > 0);
  const fresh = cards.filter((c) => !states[c.id] || states[c.id].reps + states[c.id].lapses === 0);
  const due = seen.filter((c) => isDue(states[c.id], now)).sort((a, b) => states[a.id].due - states[b.id].due);
  return [...due, ...fresh.slice(0, newLimit)];
}
```

And a friendly label for each card: `dueLabel(state)` → "due now", "in 8 min", "tomorrow", "in 6 days".

```svg The queue: overdue cards first, oldest first, then up to ten new cards
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 70" font-family="sans-serif" font-size="12">
  <rect width="480" height="70" fill="#fff"/>
  <rect x="10" y="20" width="60" height="30" rx="4" fill="#fecaca"/><text x="18" y="39">−3 days</text>
  <rect x="75" y="20" width="60" height="30" rx="4" fill="#fed7aa"/><text x="83" y="39">−1 day</text>
  <rect x="140" y="20" width="60" height="30" rx="4" fill="#fde68a"/><text x="148" y="39">due now</text>
  <rect x="215" y="20" width="250" height="30" rx="4" fill="#dbeafe"/><text x="225" y="39">new cards (at most 10)</text>
</svg>
```

quiz: Why limit new cards per session?
- [ ] New cards can't be shown with due ones
- [x] Every new card adds future reviews; a few a day keeps the daily load steady
- [ ] The browser can only show ten
why: Spaced repetition stays sustainable when new material arrives gradually.

## Finish

You can explain spacing, schedule a card from a rating, and build a study queue from due and new cards.

### Challenges

1. Show a forecast of how many cards are due on each of the next 7 days.
2. Add a setting for the new-card limit.
3. Write a test that a card rated Good, Good, Hard has a shorter interval than Good, Good, Good.
