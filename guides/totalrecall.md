---
id: totalrecall
title: TotalRecall (React flashcards)
goals: Organize built-in decks so each one follows a lesson and every card has a stable id; Schedule reviews with spaced repetition and build sessions in four study modes; Save progress safely and track streaks and history; Share decks as files and study entirely from the keyboard
prereqs: React basics; Spaced repetition scheduling; Sharing decks as files; Keyboard shortcuts and accessibility
---

## Session: Cards and the schedule

## Step: What TotalRecall does
kind: read
time: 10

In this guide you'll rebuild my [TotalRecall](https://github.com/TheoYanvno/total-recall) ([live demo](https://theoyanvno.github.io/total-recall/)), flashcards for studying programming: seven built-in decks of terms that follow the CodeForge lessons (Setup and GitHub, HTML and CSS, JavaScript basics, React basics, Python, SQL, and Servers and data), spaced repetition that brings each card back right before you forget it, four study modes, a progress page with a streak and a 14-day history, deck import and export, and keyboard-only study.

```js
export const DECKS = [
  {
    id: 'setup', title: 'Setup and GitHub', lesson: 'setup',
    blurb: 'The tools and words you meet before writing your first line of code.',
    cards: [
      { id: 'setup-commit', term: 'Commit', back: 'A saved snapshot of your changes with a message that says what changed and why.', example: 'git commit -m "Add the login form"' },
      // …
    ],
  },
];
```

Card ids are written by hand and never change, because progress is saved by id: renaming one would lose everyone's progress on it.

```svg A deck holds cards; every card's id is the key to its saved progress
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 100" font-family="sans-serif" font-size="12">
  <rect width="480" height="100" fill="#fff"/>
  <rect x="10" y="10" width="190" height="80" rx="6" fill="#e0e7ff"/><text x="20" y="30">deck: Setup and GitHub</text><text x="30" y="52">setup-commit · Commit</text><text x="30" y="72">setup-push · Push</text>
  <rect x="270" y="25" width="200" height="50" rx="6" fill="#dcfce7"/><text x="280" y="45">states["setup-commit"] =</text><text x="280" y="63">{ reps, interval, ease, due }</text>
  <path d="M200 50 H270" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why must built-in card ids never change?
- [x] Progress is saved by card id, so a new id would lose that card's progress
- [ ] Ids are shown on the card
- [ ] React keys must be permanent
why: Stable ids connect saved data to the content it belongs to.

## Step: Ratings and the four study modes
kind: read
time: 16
uses: srs

Rating a card calls `review(state, grade, now)` from Spaced repetition scheduling and saves the new state. `buildQueue()` decides which cards a session shows:

| Mode | Cards |
|---|---|
| Flashcards | every due card in the deck, then up to 10 new |
| Quick Review | 10 cards, due first, topped up with the ones coming back soonest |
| Practice Test | up to 20 due or new cards from every deck, shuffled |
| Challenge | the whole deck shuffled, as many as you can in 2 minutes |

```js
export function shuffle(list, seed = Date.now()) {
  const out = [...list];
  let s = seed >>> 0 || 1;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);    // a small seeded generator
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
```

The shuffle is **seeded**, so a test can pass a seed and check the exact order. It's the Fisher-Yates shuffle, which gives every order the same chance.

```svg buildQueue picks cards by mode; each rating updates that card's schedule
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 90" font-family="sans-serif" font-size="12">
  <rect width="480" height="90" fill="#fff"/>
  <rect x="10" y="30" width="90" height="30" rx="6" fill="#e0e7ff"/><text x="55" y="49" text-anchor="middle">mode</text>
  <rect x="130" y="30" width="100" height="30" rx="6" fill="#fef3c7"/><text x="180" y="49" text-anchor="middle">buildQueue</text>
  <rect x="260" y="30" width="90" height="30" rx="6" fill="#dbeafe"/><text x="305" y="49" text-anchor="middle">study</text>
  <rect x="380" y="30" width="90" height="30" rx="6" fill="#dcfce7"/><text x="425" y="49" text-anchor="middle">review()</text>
  <path d="M100 45 H130 M230 45 H260 M350 45 H380" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why is the shuffle seeded?
- [ ] Seeded shuffles are more random
- [x] With the same seed it gives the same order, so tests can check it exactly
- [ ] Browsers require a seed
why: Repeatable randomness makes random features testable.

## Step: Progress, streaks and history
kind: read
time: 12

Progress is one object in `localStorage`: each card's schedule state, a count of reviews per day, and how many answers were correct. `load()` wraps everything in try/catch and keeps only valid entries, so blocked or damaged storage gives an empty start instead of a broken page.

- `recordReview()` saves a card's new state and adds one to today's count.
- `history(days, 14)` returns the last 14 days' counts for a small bar chart.
- `streak(days)` counts days in a row with at least one review, including today if you've studied, otherwise up to yesterday, so the streak doesn't drop in the morning.
- `stats()` sorts cards into new, learning (an interval under 21 days) and mature, and works out a mastery percent where mature cards count fully and learning cards half.

```svg A day counts toward the streak if it has at least one review; today can still be added
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 80" font-family="sans-serif" font-size="12">
  <rect width="480" height="80" fill="#fff"/>
  <g fill="#86efac"><rect x="20" y="20" width="40" height="30"/><rect x="70" y="20" width="40" height="30"/><rect x="120" y="20" width="40" height="30"/></g>
  <rect x="170" y="20" width="40" height="30" fill="#e5e7eb"/><text x="20" y="70">Mon Tue Wed: 3-day streak</text><text x="172" y="40">today</text>
</svg>
```

quiz: Why does the streak count up to yesterday when you haven't studied yet today?
- [x] So it doesn't fall to zero in the morning before you've had a chance to study
- [ ] Today never counts
- [ ] Time zones make today unreliable
why: A streak should only break once a whole day passes with no study.

## Session: Sharing and the keyboard

## Step: Import, export and the keyboard
kind: read
time: 14
uses: deckfiles, shortcuts

Any deck can be exported as `{ format: 'total-recall-deck', version: 1, deck }`, and **Import** reads a file with `importDeck()` from Sharing decks as files: field limits, clear errors, skipped incomplete cards and fresh `custom-…` ids that can't clash with built-in cards. Imported decks are marked and can be removed.

The study panel uses the pattern from Keyboard shortcuts and accessibility: Space or Enter flips, 1 to 4 rate, F goes full screen, all ignored while typing in a field, and every action also has a labeled button.

```svg Exported decks can be imported anywhere; imported ones get their own ids
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 80" font-family="sans-serif" font-size="12">
  <rect width="480" height="80" fill="#fff"/>
  <rect x="10" y="25" width="100" height="30" rx="6" fill="#e0e7ff"/><text x="60" y="44" text-anchor="middle">exportDeck</text>
  <rect x="150" y="25" width="120" height="30" rx="6" fill="#fef3c7"/><text x="210" y="44" text-anchor="middle">.json file</text>
  <rect x="310" y="25" width="160" height="30" rx="6" fill="#dcfce7"/><text x="390" y="44" text-anchor="middle">importDeck → custom-…</text>
  <path d="M110 40 H150 M270 40 H310" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: What happens to the ids of cards in an imported deck?
- [ ] They're kept from the file
- [x] They're replaced with ids built from the new deck's id, so they can't clash with existing cards
- [ ] They're removed
why: Saved progress is keyed by id, so imports get their own namespace.

## Step: How the real project is organized
kind: read
time: 10

```bash
npm start       # http://localhost:8000
npm test        # review(), dueQueue, buildQueue and shuffle, progress and streaks, import and export
npm run build   # into docs/ for GitHub Pages
```

| File | What it does |
|---|---|
| `lib/srs.js` | review(), isDue, dueQueue, dueLabel |
| `lib/modes.js` | the four modes and the seeded shuffle |
| `lib/progress.js` | saved progress, history, streak and stats |
| `lib/share.js` | export and import |
| `lib/decks.js` | the seven built-in decks |
| `components/` | Study, Decks, Panels (progress, settings), Shell |

```svg Plain libraries hold the rules; components draw the study screen and pages
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 90" font-family="sans-serif" font-size="12">
  <rect width="480" height="90" fill="#fff"/>
  <rect x="10" y="10" width="460" height="28" rx="6" fill="#dbeafe"/><text x="240" y="29" text-anchor="middle">components: Study · Decks · Panels · Shell</text>
  <rect x="10" y="50" width="105" height="28" rx="6" fill="#dcfce7"/><text x="62" y="69" text-anchor="middle">srs.js</text>
  <rect x="128" y="50" width="105" height="28" rx="6" fill="#dcfce7"/><text x="180" y="69" text-anchor="middle">modes.js</text>
  <rect x="246" y="50" width="105" height="28" rx="6" fill="#dcfce7"/><text x="298" y="69" text-anchor="middle">progress.js</text>
  <rect x="364" y="50" width="105" height="28" rx="6" fill="#dcfce7"/><text x="416" y="69" text-anchor="middle">share.js</text>
</svg>
```

quiz: Which file would you change to add a new study mode?
- [x] lib/modes.js, where MODES and buildQueue live
- [ ] lib/srs.js
- [ ] lib/decks.js
why: Each concern has its own module.

## Finish

You built a flashcard app with spaced repetition, four study modes, safe progress and streaks, shareable decks and keyboard-only study.

### Challenges

1. Add a deck editor so people can write their own cards in the app.
2. Add a "hard cards" mode that studies only cards with lapses.
3. Show a 7-day forecast of due cards on the progress page.
