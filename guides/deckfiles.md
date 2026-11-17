---
id: deckfiles
title: Sharing decks as files
goals: Export your own data format with a name and version so it can be recognized later; Import a file someone else made field by field, with size limits and clear errors; Give imported items ids that can never clash with what's already there
prereqs: Import and export JSON files; JavaScript strings and Sets
---

## Session: Decks people can trade

## Step: A self-describing export
kind: read
time: 10

A deck file should say what it is. TotalRecall wraps the deck in a small envelope and keeps only the fields that matter:

```js
export function exportDeck(deck) {
  const { id, title, blurb, cards } = deck;
  return JSON.stringify({
    format: 'total-recall-deck', version: 1,
    deck: { id, title, blurb, cards: cards.map(({ id, term, back, example }) => ({ id, term, back, ...(example ? { example } : {}) })) },
  }, null, 2);
}
```

`null, 2` pretty-prints with two-space indents, so the file is easy to read and edit by hand, and `...(example ? { example } : {})` leaves out empty fields.

```svg The envelope names the format and version; the deck sits inside
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 110" font-family="monospace" font-size="12">
  <rect width="420" height="110" fill="#fff"/>
  <rect x="10" y="8" width="400" height="94" rx="6" fill="#e0e7ff"/>
  <text x="20" y="28">format: "total-recall-deck", version: 1</text>
  <rect x="20" y="40" width="380" height="54" rx="5" fill="#dcfce7"/><text x="30" y="60">deck: { title, blurb,</text><text x="30" y="80">  cards: [{ term, back, example? }] }</text>
</svg>
```

quiz: Why does the file include format and version?
- [x] So an import can recognize a real deck file and a future version can still read old ones
- [ ] JSON needs a version
- [ ] To make the file larger
why: Self-describing files are safer to read back.

## Step: Import: check every field
kind: read
time: 16

A file from someone else can be anything. `importDeck` returns `{ deck }` or `{ error }` with a message a person can act on, and every text field is trimmed and cut to a limit:

```js
export const LIMITS = { title: 80, blurb: 200, term: 120, back: 1000, example: 2000, cards: 500 };
const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export function importDeck(json, existingIds = new Set()) {
  let data;
  try { data = JSON.parse(json); } catch { return { error: 'That file isn\'t valid JSON.' }; }
  const raw = data && data.format === 'total-recall-deck' ? data.deck : data;      // the envelope, or a bare deck
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.cards)) return { error: 'No deck found: the file needs a "cards" list.' };
  const cards = [];
  for (const [i, c] of raw.cards.slice(0, LIMITS.cards).entries()) {
    const term = text(c && c.term, LIMITS.term);
    const back = text(c && c.back, LIMITS.back);
    if (!term || !back) continue;                                                    // skip incomplete cards
    cards.push({ id: `${id}-${i + 1}`, term, back });
  }
  if (cards.length === 0) return { error: 'The deck has no cards with both a term and an answer.' };
  return { deck: { id, title, cards, custom: true } };
}
```

Cards are shown as **text** by React, never as HTML, so a card containing `<script>` just shows those characters.

```svg Bad JSON, a missing cards list and empty decks each get their own message; good cards are kept
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 110" font-family="sans-serif" font-size="12">
  <rect width="480" height="110" fill="#fff"/>
  <rect x="10" y="40" width="90" height="30" rx="6" fill="#e0e7ff"/><text x="55" y="59" text-anchor="middle">file text</text>
  <rect x="150" y="5" width="320" height="24" rx="4" fill="#fee2e2"/><text x="158" y="22">not JSON → "That file isn't valid JSON."</text>
  <rect x="150" y="34" width="320" height="24" rx="4" fill="#fee2e2"/><text x="158" y="51">no cards list → "No deck found…"</text>
  <rect x="150" y="63" width="320" height="24" rx="4" fill="#fef3c7"/><text x="158" y="80">incomplete cards → skipped</text>
  <rect x="150" y="90" width="320" height="18" rx="4" fill="#dcfce7"/><text x="158" y="103">good cards → the new deck</text>
  <path d="M100 55 L150 17 M100 55 L150 46 M100 55 L150 75 M100 55 L150 99" stroke="#374151"/>
</svg>
```

quiz: Why are fields cut to a maximum length?
- [ ] JSON can't hold long strings
- [x] So a huge or hostile file can't fill storage or break the layout
- [ ] Short text studies better
why: Limits keep untrusted input to a sensible size.

quiz: Why is a card containing <script> harmless here?
- [x] React shows strings as text, not HTML, so the tag is just characters on screen
- [ ] importDeck deletes the word script
- [ ] Browsers ignore script tags in JSON
why: Rendering as text is what makes untrusted content safe to show.

## Step: Ids that never clash
kind: read
time: 10

Progress is saved by card id. If an imported card had the same id as a built-in one, studying it would overwrite that card's progress. So imports never keep their own ids: the deck id is built from the title, numbered if it's taken, and each card gets `deck-id-1`, `deck-id-2`…

```js
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'deck';
let id = `custom-${slug}`;
for (let n = 2; existingIds.has(id); n++) id = `custom-${slug}-${n}`;
```

Importing "Git Basics" twice gives `custom-git-basics` and `custom-git-basics-2`. The deck is also marked `custom: true`, so it can be removed, unlike the built-in decks.

```svg A taken id gets the next number, so imports never overwrite progress
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 80" font-family="monospace" font-size="12">
  <rect width="440" height="80" fill="#fff"/>
  <text x="10" y="25">"Git Basics" → custom-git-basics</text><text x="300" y="25" fill="#6b7280" font-family="sans-serif">taken</text>
  <text x="10" y="55">"Git Basics" → custom-git-basics-2</text><text x="300" y="55" fill="#16a34a" font-family="sans-serif">new</text>
</svg>
```

quiz: Why do imported cards get new ids instead of keeping the file's ids?
- [ ] The file's ids are always wrong
- [x] Progress is stored by id, and a clash would overwrite another card's progress
- [ ] Ids must be numbers
why: Your own ids under your own prefix can't collide with anything.

## Finish

You can export a versioned format, import other people's files safely field by field, and keep ids from ever clashing.

### Challenges

1. Show a preview of the first three cards before importing.
2. Add a "share link" that puts a small deck in the URL hash.
3. Write a test that importing the same deck twice gives two different ids.
