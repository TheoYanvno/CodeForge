// Built from guides/deckfiles.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "deckfiles",
 "title": "Sharing decks as files",
 "goals": [
  "Export your own data format with a name and version so it can be recognized later",
  "Import a file someone else made field by field, with size limits and clear errors",
  "Give imported items ids that can never clash with what's already there"
 ],
 "prereqs": [
  "Import and export JSON files",
  "JavaScript strings and Sets"
 ],
 "sessions": [
  {
   "title": "Decks people can trade",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "A self-describing export",
   "body": "A deck file should say what it is. TotalRecall wraps the deck in a small envelope and keeps only the fields that matter:\n\n```js\nexport function exportDeck(deck) {\n  const { id, title, blurb, cards } = deck;\n  return JSON.stringify({\n    format: 'total-recall-deck', version: 1,\n    deck: { id, title, blurb, cards: cards.map(({ id, term, back, example }) => ({ id, term, back, ...(example ? { example } : {}) })) },\n  }, null, 2);\n}\n```\n\n`null, 2` pretty-prints with two-space indents, so the file is easy to read and edit by hand, and `...(example ? { example } : {})` leaves out empty fields.\n\n```svg The envelope names the format and version; the deck sits inside\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 420 110\" font-family=\"monospace\" font-size=\"12\">\n  <rect width=\"420\" height=\"110\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"8\" width=\"400\" height=\"94\" rx=\"6\" fill=\"#e0e7ff\"/>\n  <text x=\"20\" y=\"28\">format: \"total-recall-deck\", version: 1</text>\n  <rect x=\"20\" y=\"40\" width=\"380\" height=\"54\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"30\" y=\"60\">deck: { title, blurb,</text><text x=\"30\" y=\"80\">  cards: [{ term, back, example? }] }</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does the file include format and version?",
     "options": [
      "So an import can recognize a real deck file and a future version can still read old ones",
      "JSON needs a version",
      "To make the file larger"
     ],
     "answer": 0,
     "why": "Self-describing files are safer to read back."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "Import: check every field",
   "body": "A file from someone else can be anything. `importDeck` returns `{ deck }` or `{ error }` with a message a person can act on, and every text field is trimmed and cut to a limit:\n\n```js\nexport const LIMITS = { title: 80, blurb: 200, term: 120, back: 1000, example: 2000, cards: 500 };\nconst text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');\n\nexport function importDeck(json, existingIds = new Set()) {\n  let data;\n  try { data = JSON.parse(json); } catch { return { error: 'That file isn\\'t valid JSON.' }; }\n  const raw = data && data.format === 'total-recall-deck' ? data.deck : data;      // the envelope, or a bare deck\n  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.cards)) return { error: 'No deck found: the file needs a \"cards\" list.' };\n  const cards = [];\n  for (const [i, c] of raw.cards.slice(0, LIMITS.cards).entries()) {\n    const term = text(c && c.term, LIMITS.term);\n    const back = text(c && c.back, LIMITS.back);\n    if (!term || !back) continue;                                                    // skip incomplete cards\n    cards.push({ id: `${id}-${i + 1}`, term, back });\n  }\n  if (cards.length === 0) return { error: 'The deck has no cards with both a term and an answer.' };\n  return { deck: { id, title, cards, custom: true } };\n}\n```\n\nCards are shown as **text** by React, never as HTML, so a card containing `<script>` just shows those characters.\n\n```svg Bad JSON, a missing cards list and empty decks each get their own message; good cards are kept\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"110\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"40\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"55\" y=\"59\" text-anchor=\"middle\">file text</text>\n  <rect x=\"150\" y=\"5\" width=\"320\" height=\"24\" rx=\"4\" fill=\"#fee2e2\"/><text x=\"158\" y=\"22\">not JSON → \"That file isn't valid JSON.\"</text>\n  <rect x=\"150\" y=\"34\" width=\"320\" height=\"24\" rx=\"4\" fill=\"#fee2e2\"/><text x=\"158\" y=\"51\">no cards list → \"No deck found…\"</text>\n  <rect x=\"150\" y=\"63\" width=\"320\" height=\"24\" rx=\"4\" fill=\"#fef3c7\"/><text x=\"158\" y=\"80\">incomplete cards → skipped</text>\n  <rect x=\"150\" y=\"90\" width=\"320\" height=\"18\" rx=\"4\" fill=\"#dcfce7\"/><text x=\"158\" y=\"103\">good cards → the new deck</text>\n  <path d=\"M100 55 L150 17 M100 55 L150 46 M100 55 L150 75 M100 55 L150 99\" stroke=\"#374151\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why are fields cut to a maximum length?",
     "options": [
      "JSON can't hold long strings",
      "So a huge or hostile file can't fill storage or break the layout",
      "Short text studies better"
     ],
     "answer": 1,
     "why": "Limits keep untrusted input to a sensible size."
    },
    {
     "q": "Why is a card containing <script> harmless here?",
     "options": [
      "React shows strings as text, not HTML, so the tag is just characters on screen",
      "importDeck deletes the word script",
      "Browsers ignore script tags in JSON"
     ],
     "answer": 0,
     "why": "Rendering as text is what makes untrusted content safe to show."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 16
  },
  {
   "title": "Ids that never clash",
   "body": "Progress is saved by card id. If an imported card had the same id as a built-in one, studying it would overwrite that card's progress. So imports never keep their own ids: the deck id is built from the title, numbered if it's taken, and each card gets `deck-id-1`, `deck-id-2`…\n\n```js\nconst slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'deck';\nlet id = `custom-${slug}`;\nfor (let n = 2; existingIds.has(id); n++) id = `custom-${slug}-${n}`;\n```\n\nImporting \"Git Basics\" twice gives `custom-git-basics` and `custom-git-basics-2`. The deck is also marked `custom: true`, so it can be removed, unlike the built-in decks.\n\n```svg A taken id gets the next number, so imports never overwrite progress\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 440 80\" font-family=\"monospace\" font-size=\"12\">\n  <rect width=\"440\" height=\"80\" fill=\"#fff\"/>\n  <text x=\"10\" y=\"25\">\"Git Basics\" → custom-git-basics</text><text x=\"300\" y=\"25\" fill=\"#6b7280\" font-family=\"sans-serif\">taken</text>\n  <text x=\"10\" y=\"55\">\"Git Basics\" → custom-git-basics-2</text><text x=\"300\" y=\"55\" fill=\"#16a34a\" font-family=\"sans-serif\">new</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why do imported cards get new ids instead of keeping the file's ids?",
     "options": [
      "The file's ids are always wrong",
      "Progress is stored by id, and a clash would overwrite another card's progress",
      "Ids must be numbers"
     ],
     "answer": 1,
     "why": "Your own ids under your own prefix can't collide with anything."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  }
 ],
 "finish": "You can export a versioned format, import other people's files safely field by field, and keep ids from ever clashing.\n\n### Challenges\n\n1. Show a preview of the first three cards before importing.\n2. Add a \"share link\" that puts a small deck in the URL hash.\n3. Write a test that importing the same deck twice gives two different ids."
};
