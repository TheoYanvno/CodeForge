// Built from guides/totalrecall.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "totalrecall",
 "title": "TotalRecall (React flashcards)",
 "goals": [
  "Organize built-in decks so each one follows a lesson and every card has a stable id",
  "Schedule reviews with spaced repetition and build sessions in four study modes",
  "Save progress safely and track streaks and history",
  "Share decks as files and study entirely from the keyboard"
 ],
 "prereqs": [
  "React basics",
  "Spaced repetition scheduling",
  "Sharing decks as files",
  "Keyboard shortcuts and accessibility"
 ],
 "sessions": [
  {
   "title": "Cards and the schedule",
   "from": 0,
   "to": 2
  },
  {
   "title": "Sharing and the keyboard",
   "from": 3,
   "to": 4
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "What TotalRecall does",
   "body": "In this guide you'll rebuild my [TotalRecall](https://github.com/TheoYanvno/total-recall) ([live demo](https://theoyanvno.github.io/total-recall/)), flashcards for studying programming: seven built-in decks of terms that follow the CodeForge lessons (Setup and GitHub, HTML and CSS, JavaScript basics, React basics, Python, SQL, and Servers and data), spaced repetition that brings each card back right before you forget it, four study modes, a progress page with a streak and a 14-day history, deck import and export, and keyboard-only study.\n\n```js\nexport const DECKS = [\n  {\n    id: 'setup', title: 'Setup and GitHub', lesson: 'setup',\n    blurb: 'The tools and words you meet before writing your first line of code.',\n    cards: [\n      { id: 'setup-commit', term: 'Commit', back: 'A saved snapshot of your changes with a message that says what changed and why.', example: 'git commit -m \"Add the login form\"' },\n      // …\n    ],\n  },\n];\n```\n\nCard ids are written by hand and never change, because progress is saved by id: renaming one would lose everyone's progress on it.\n\n```svg A deck holds cards; every card's id is the key to its saved progress\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"100\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"190\" height=\"80\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"20\" y=\"30\">deck: Setup and GitHub</text><text x=\"30\" y=\"52\">setup-commit · Commit</text><text x=\"30\" y=\"72\">setup-push · Push</text>\n  <rect x=\"270\" y=\"25\" width=\"200\" height=\"50\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"280\" y=\"45\">states[\"setup-commit\"] =</text><text x=\"280\" y=\"63\">{ reps, interval, ease, due }</text>\n  <path d=\"M200 50 H270\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why must built-in card ids never change?",
     "options": [
      "Progress is saved by card id, so a new id would lose that card's progress",
      "Ids are shown on the card",
      "React keys must be permanent"
     ],
     "answer": 0,
     "why": "Stable ids connect saved data to the content it belongs to."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "Ratings and the four study modes",
   "body": "Rating a card calls `review(state, grade, now)` from Spaced repetition scheduling and saves the new state. `buildQueue()` decides which cards a session shows:\n\n| Mode | Cards |\n|---|---|\n| Flashcards | every due card in the deck, then up to 10 new |\n| Quick Review | 10 cards, due first, topped up with the ones coming back soonest |\n| Practice Test | up to 20 due or new cards from every deck, shuffled |\n| Challenge | the whole deck shuffled, as many as you can in 2 minutes |\n\n```js\nexport function shuffle(list, seed = Date.now()) {\n  const out = [...list];\n  let s = seed >>> 0 || 1;\n  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);    // a small seeded generator\n  for (let i = out.length - 1; i > 0; i--) {\n    const j = Math.floor(rand() * (i + 1));\n    [out[i], out[j]] = [out[j], out[i]];\n  }\n  return out;\n}\n```\n\nThe shuffle is **seeded**, so a test can pass a seed and check the exact order. It's the Fisher-Yates shuffle, which gives every order the same chance.\n\n```svg buildQueue picks cards by mode; each rating updates that card's schedule\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"30\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"55\" y=\"49\" text-anchor=\"middle\">mode</text>\n  <rect x=\"130\" y=\"30\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"180\" y=\"49\" text-anchor=\"middle\">buildQueue</text>\n  <rect x=\"260\" y=\"30\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"305\" y=\"49\" text-anchor=\"middle\">study</text>\n  <rect x=\"380\" y=\"30\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"425\" y=\"49\" text-anchor=\"middle\">review()</text>\n  <path d=\"M100 45 H130 M230 45 H260 M350 45 H380\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why is the shuffle seeded?",
     "options": [
      "Seeded shuffles are more random",
      "With the same seed it gives the same order, so tests can check it exactly",
      "Browsers require a seed"
     ],
     "answer": 1,
     "why": "Repeatable randomness makes random features testable."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 16,
   "uses": [
    "srs"
   ]
  },
  {
   "title": "Progress, streaks and history",
   "body": "Progress is one object in `localStorage`: each card's schedule state, a count of reviews per day, and how many answers were correct. `load()` wraps everything in try/catch and keeps only valid entries, so blocked or damaged storage gives an empty start instead of a broken page.\n\n- `recordReview()` saves a card's new state and adds one to today's count.\n- `history(days, 14)` returns the last 14 days' counts for a small bar chart.\n- `streak(days)` counts days in a row with at least one review, including today if you've studied, otherwise up to yesterday, so the streak doesn't drop in the morning.\n- `stats()` sorts cards into new, learning (an interval under 21 days) and mature, and works out a mastery percent where mature cards count fully and learning cards half.\n\n```svg A day counts toward the streak if it has at least one review; today can still be added\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"80\" fill=\"#fff\"/>\n  <g fill=\"#86efac\"><rect x=\"20\" y=\"20\" width=\"40\" height=\"30\"/><rect x=\"70\" y=\"20\" width=\"40\" height=\"30\"/><rect x=\"120\" y=\"20\" width=\"40\" height=\"30\"/></g>\n  <rect x=\"170\" y=\"20\" width=\"40\" height=\"30\" fill=\"#e5e7eb\"/><text x=\"20\" y=\"70\">Mon Tue Wed: 3-day streak</text><text x=\"172\" y=\"40\">today</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does the streak count up to yesterday when you haven't studied yet today?",
     "options": [
      "So it doesn't fall to zero in the morning before you've had a chance to study",
      "Today never counts",
      "Time zones make today unreliable"
     ],
     "answer": 0,
     "why": "A streak should only break once a whole day passes with no study."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Import, export and the keyboard",
   "body": "Any deck can be exported as `{ format: 'total-recall-deck', version: 1, deck }`, and **Import** reads a file with `importDeck()` from Sharing decks as files: field limits, clear errors, skipped incomplete cards and fresh `custom-…` ids that can't clash with built-in cards. Imported decks are marked and can be removed.\n\nThe study panel uses the pattern from Keyboard shortcuts and accessibility: Space or Enter flips, 1 to 4 rate, F goes full screen, all ignored while typing in a field, and every action also has a labeled button.\n\n```svg Exported decks can be imported anywhere; imported ones get their own ids\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"80\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"25\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"60\" y=\"44\" text-anchor=\"middle\">exportDeck</text>\n  <rect x=\"150\" y=\"25\" width=\"120\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"210\" y=\"44\" text-anchor=\"middle\">.json file</text>\n  <rect x=\"310\" y=\"25\" width=\"160\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"390\" y=\"44\" text-anchor=\"middle\">importDeck → custom-…</text>\n  <path d=\"M110 40 H150 M270 40 H310\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What happens to the ids of cards in an imported deck?",
     "options": [
      "They're kept from the file",
      "They're replaced with ids built from the new deck's id, so they can't clash with existing cards",
      "They're removed"
     ],
     "answer": 1,
     "why": "Saved progress is keyed by id, so imports get their own namespace."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 14,
   "uses": [
    "deckfiles",
    "shortcuts"
   ]
  },
  {
   "title": "How the real project is organized",
   "body": "```bash\nnpm start       # http://localhost:8000\nnpm test        # review(), dueQueue, buildQueue and shuffle, progress and streaks, import and export\nnpm run build   # into docs/ for GitHub Pages\n```\n\n| File | What it does |\n|---|---|\n| `lib/srs.js` | review(), isDue, dueQueue, dueLabel |\n| `lib/modes.js` | the four modes and the seeded shuffle |\n| `lib/progress.js` | saved progress, history, streak and stats |\n| `lib/share.js` | export and import |\n| `lib/decks.js` | the seven built-in decks |\n| `components/` | Study, Decks, Panels (progress, settings), Shell |\n\n```svg Plain libraries hold the rules; components draw the study screen and pages\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"460\" height=\"28\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"240\" y=\"29\" text-anchor=\"middle\">components: Study · Decks · Panels · Shell</text>\n  <rect x=\"10\" y=\"50\" width=\"105\" height=\"28\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"62\" y=\"69\" text-anchor=\"middle\">srs.js</text>\n  <rect x=\"128\" y=\"50\" width=\"105\" height=\"28\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"180\" y=\"69\" text-anchor=\"middle\">modes.js</text>\n  <rect x=\"246\" y=\"50\" width=\"105\" height=\"28\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"298\" y=\"69\" text-anchor=\"middle\">progress.js</text>\n  <rect x=\"364\" y=\"50\" width=\"105\" height=\"28\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"416\" y=\"69\" text-anchor=\"middle\">share.js</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Which file would you change to add a new study mode?",
     "options": [
      "lib/modes.js, where MODES and buildQueue live",
      "lib/srs.js",
      "lib/decks.js"
     ],
     "answer": 0,
     "why": "Each concern has its own module."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 10
  }
 ],
 "finish": "You built a flashcard app with spaced repetition, four study modes, safe progress and streaks, shareable decks and keyboard-only study.\n\n### Challenges\n\n1. Add a deck editor so people can write their own cards in the app.\n2. Add a \"hard cards\" mode that studies only cards with lapses.\n3. Show a 7-day forecast of due cards on the progress page."
};
