// Built from guides/srs.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "srs",
 "title": "Spaced repetition scheduling",
 "goals": [
  "Explain why reviewing right before you forget beats cramming",
  "Implement an SM-2 style review() that turns a rating into the next due date",
  "Build the study queue from due cards and a limited number of new ones"
 ],
 "prereqs": [
  "JavaScript basics (objects, Math, sorting)",
  "Dates as timestamps in milliseconds"
 ],
 "sessions": [
  {
   "title": "Remember more, study less",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "Why spacing works",
   "body": "Right after you learn a term you remember it; a few days later, most of it is gone. Each time you **recall** it just as it's fading, it lasts longer before fading again. Spaced repetition schedules each card for that moment: soon at first, then further and further apart.\n\n| Review | Wait before the next one (if you knew it) |\n|---|---|\n| 1st | 1 day |\n| 2nd | 6 days |\n| 3rd | about 15 days (6 × 2.5) |\n| 4th | about 38 days |\n\nCards you know well stop taking time; cards you struggle with come back often.\n\n```svg Each successful review resets the forgetting curve and makes it fall more slowly\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"120\" fill=\"#fff\"/>\n  <line x1=\"20\" y1=\"100\" x2=\"470\" y2=\"100\" stroke=\"#94a3b8\"/><text x=\"420\" y=\"115\">time</text>\n  <path d=\"M20 20 Q 50 80 80 85\" fill=\"none\" stroke=\"#dc2626\" stroke-width=\"2\"/>\n  <path d=\"M80 20 Q 140 70 200 78\" fill=\"none\" stroke=\"#f59e0b\" stroke-width=\"2\"/>\n  <path d=\"M200 20 Q 320 60 440 70\" fill=\"none\" stroke=\"#16a34a\" stroke-width=\"2\"/>\n  <g fill=\"#2563eb\"><circle cx=\"80\" cy=\"20\" r=\"4\"/><circle cx=\"200\" cy=\"20\" r=\"4\"/></g><text x=\"90\" y=\"16\">review</text><text x=\"210\" y=\"16\">review</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "When is the best time to review a card?",
     "options": [
      "Immediately after learning it, many times",
      "Just as you're about to forget it",
      "Only the night before a test"
     ],
     "answer": 1,
     "why": "Recalling something as it fades strengthens it the most for the effort."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "review(): from a rating to the next due date",
   "body": "Each card has a small state: `reps` (correct reviews in a row), `interval` (days), `ease` (how fast the interval grows, starting at 2.5), `due` (a timestamp) and `lapses`. After you rate a card **Again, Hard, Good or Easy**, `review()` returns its next state:\n\n```js\nexport function review(state = newCardState(), grade, now = Date.now()) {\n  const s = { ...newCardState(), ...state };\n  if (grade === 'again') {                                  // forgot: back in 10 minutes, a bit harder from now on\n    return { ...s, reps: 0, interval: 0, lapses: s.lapses + 1, ease: Math.max(MIN_EASE, s.ease - 0.2), due: now + 10 * 60 * 1000, last: now };\n  }\n  let interval;\n  if (s.reps === 0) interval = grade === 'easy' ? 4 : 1;\n  else if (s.reps === 1) interval = grade === 'hard' ? 3 : 6;\n  else interval = s.interval * (grade === 'hard' ? 1.2 : grade === 'easy' ? s.ease * 1.3 : s.ease);\n  const ease = Math.max(MIN_EASE, s.ease + { hard: -0.15, good: 0, easy: 0.15 }[grade]);\n  interval = Math.max(1, Math.round(interval));\n  return { ...s, reps: s.reps + 1, interval, ease: Math.round(ease * 100) / 100, due: now + interval * DAY, last: now };\n}\n```\n\n- **Ease** never drops below 1.3, so even hard cards still spread out.\n- `now` is a parameter, so tests can check \"rated Good three times, due in 15 days\" without waiting.\n- The function returns a **new** object; the old state is untouched.\n\n```svg A card rated Good each time: due in 1 day, then 6, then 15\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"80\" fill=\"#fff\"/>\n  <line x1=\"20\" y1=\"45\" x2=\"470\" y2=\"45\" stroke=\"#94a3b8\" stroke-width=\"2\"/>\n  <g fill=\"#2563eb\"><circle cx=\"20\" cy=\"45\" r=\"5\"/><circle cx=\"35\" cy=\"45\" r=\"5\"/><circle cx=\"125\" cy=\"45\" r=\"5\"/><circle cx=\"350\" cy=\"45\" r=\"5\"/></g>\n  <text x=\"10\" y=\"70\">new</text><text x=\"30\" y=\"30\">+1</text><text x=\"115\" y=\"30\">+6</text><text x=\"335\" y=\"30\">+15</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "What happens when you rate a card Again?",
     "options": [
      "It comes back in 10 minutes, its streak resets, and its ease drops a little",
      "It's deleted",
      "It waits twice as long"
     ],
     "answer": 0,
     "why": "A forgotten card needs another try soon and should grow more slowly afterward."
    },
    {
     "q": "Why is now a parameter instead of calling Date.now() inside?",
     "options": [
      "Date.now() is slow",
      "Tests can pass any time and check the due dates exactly",
      "It must be a string"
     ],
     "answer": 1,
     "why": "Injected time makes scheduling testable."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "The study queue",
   "body": "A session shows cards that are **due** (most overdue first), then a limited number of **new** cards, so a fresh deck of 60 doesn't arrive all at once:\n\n```js\nexport function dueQueue(cards, states = {}, now = Date.now(), newLimit = 10) {\n  const seen = cards.filter((c) => states[c.id] && states[c.id].reps + states[c.id].lapses > 0);\n  const fresh = cards.filter((c) => !states[c.id] || states[c.id].reps + states[c.id].lapses === 0);\n  const due = seen.filter((c) => isDue(states[c.id], now)).sort((a, b) => states[a.id].due - states[b.id].due);\n  return [...due, ...fresh.slice(0, newLimit)];\n}\n```\n\nAnd a friendly label for each card: `dueLabel(state)` → \"due now\", \"in 8 min\", \"tomorrow\", \"in 6 days\".\n\n```svg The queue: overdue cards first, oldest first, then up to ten new cards\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 70\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"70\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"20\" width=\"60\" height=\"30\" rx=\"4\" fill=\"#fecaca\"/><text x=\"18\" y=\"39\">−3 days</text>\n  <rect x=\"75\" y=\"20\" width=\"60\" height=\"30\" rx=\"4\" fill=\"#fed7aa\"/><text x=\"83\" y=\"39\">−1 day</text>\n  <rect x=\"140\" y=\"20\" width=\"60\" height=\"30\" rx=\"4\" fill=\"#fde68a\"/><text x=\"148\" y=\"39\">due now</text>\n  <rect x=\"215\" y=\"20\" width=\"250\" height=\"30\" rx=\"4\" fill=\"#dbeafe\"/><text x=\"225\" y=\"39\">new cards (at most 10)</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why limit new cards per session?",
     "options": [
      "New cards can't be shown with due ones",
      "Every new card adds future reviews; a few a day keeps the daily load steady",
      "The browser can only show ten"
     ],
     "answer": 1,
     "why": "Spaced repetition stays sustainable when new material arrives gradually."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  }
 ],
 "finish": "You can explain spacing, schedule a card from a rating, and build a study queue from due and new cards.\n\n### Challenges\n\n1. Show a forecast of how many cards are due on each of the next 7 days.\n2. Add a setting for the new-card limit.\n3. Write a test that a card rated Good, Good, Hard has a shorter interval than Good, Good, Good."
};
