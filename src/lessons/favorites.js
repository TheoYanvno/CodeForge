// Built from guides/favorites.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "favorites",
 "title": "Saving favorites",
 "goals": [
  "Give every item a stable id and save favorites as ids, not copies",
  "Use a Set to add, remove and check favorites",
  "Show a toggle button's state with aria-pressed and a clear label",
  "Save a Set to localStorage as JSON and load it back safely",
  "Build a favorites list from the ids, with an empty state"
 ],
 "prereqs": [
  "The Saving a best score lesson (localStorage, JSON and try/catch) and the Arrays of objects and random picks lesson"
 ],
 "sessions": [
  {
   "title": "Keeping the ones you like",
   "from": 0,
   "to": 3
  }
 ],
 "start": {
  "html": {
   "page": ""
  },
  "css": {
   "base": ""
  },
  "js": {
   "data": "",
   "favs": "",
   "store": "",
   "list": ""
  }
 },
 "steps": [
  {
   "title": "Favorites are a list of ids",
   "body": "A favorite is just a note that says \"this one\". The simplest, safest note is the item's **id**: a value that never changes and is different for every item.\n\nWhy not save a copy of the whole quote? Because copies go stale. If a typo in a quote is fixed later, the saved copy keeps the typo forever. An id always points at the current version.\n\n```svg Favorites store only ids; the quotes themselves stay in one place, so a fixed typo shows up in favorites too\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 140\" font-family=\"sans-serif\" font-size=\"12\">\n  <text x=\"5\" y=\"16\">quotes</text>\n  <rect x=\"5\" y=\"24\" width=\"190\" height=\"26\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"12\" y=\"41\">id 1 · Well done is better…</text>\n  <rect x=\"5\" y=\"56\" width=\"190\" height=\"26\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"12\" y=\"73\">id 2 · Simplicity is the…</text>\n  <rect x=\"5\" y=\"88\" width=\"190\" height=\"26\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"12\" y=\"105\">id 3 · The secret of…</text>\n  <text x=\"235\" y=\"16\">favorites</text>\n  <rect x=\"235\" y=\"40\" width=\"90\" height=\"60\" rx=\"8\" fill=\"#fce7f3\" stroke=\"#db2777\"/><text x=\"280\" y=\"66\" text-anchor=\"middle\">Set {1, 3}</text><text x=\"280\" y=\"84\" text-anchor=\"middle\" font-size=\"10\">just ids</text>\n  <path d=\"M233 60 L197 37 M233 80 L197 101\" stroke=\"#db2777\" stroke-width=\"2\" stroke-dasharray=\"4 3\"/>\n</svg>\n```\n\nA **Set** is the right container for ids: it holds each value once, and it can tell you instantly whether something is in it.\n\n```js\nconst favs = new Set();\nfavs.add(3);        // Set {3}\nfavs.add(3);        // still Set {3}: no duplicates\nfavs.has(3);        // true\nfavs.delete(3);     // Set {}\n```",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "A heart that toggles",
   "body": "Each quote gets a ♡ button. Clicking it **toggles**: adds the id if it isn't a favorite, removes it if it is.\n\n```js\nfunction toggle(id) {\n  if (favs.has(id)) favs.delete(id);\n  else favs.add(id);\n}\n```\n\nThe button shows its state in two ways: the heart fills in (♥), and `aria-pressed=\"true\"` tells screen readers the button is \"on\". The label says what the button does (\"Save to favorites\" or \"Remove from favorites\"), so it makes sense to everyone.",
   "checks": [
    {
     "pane": "js",
     "label": "favorites kept in a Set",
     "test": "/new\\s+Set\\(/",
     "hint": "const favs = new Set();"
    },
    {
     "pane": "js",
     "label": "a toggle that adds or removes",
     "test": "/if\\s*\\(\\s*favs\\.has\\(\\s*id\\s*\\)\\s*\\)\\s*favs\\.delete\\(\\s*id\\s*\\)/",
     "hint": "if (favs.has(id)) favs.delete(id); else favs.add(id);"
    },
    {
     "pane": "js",
     "label": "the pressed state for screen readers",
     "test": "/aria-pressed/",
     "hint": "b.setAttribute('aria-pressed', String(favs.has(q.id)))"
    }
   ],
   "quiz": [
    {
     "q": "You click the heart on quote 2 twice. What's in `favs`?",
     "options": [
      "Nothing from quote 2: the first click added it, the second removed it",
      "2, twice",
      "2, once"
     ],
     "answer": 0,
     "why": "A toggle flips the state each time."
    },
    {
     "q": "Why save the quote's id instead of a copy of the quote?",
     "options": [
      "Ids are shorter to type",
      "A copy goes stale when the quote is fixed or changed; an id always points at the current version",
      "localStorage can't store text"
     ],
     "answer": 1,
     "why": "One source of truth: the quotes live in one place, and favorites only point at them."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"card\">\n  <h1>Quotes</h1>\n  <ul id=\"all\" class=\"list\"></ul>\n  <h2>Your favorites <span id=\"count\" class=\"count\"></span></h2>\n  <ul id=\"favs\" class=\"list\"></ul>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: start center;\n  padding: 24px 0;\n  font-family: system-ui, sans-serif;\n  background: #fdf2f8;\n  color: #500724;\n}\n\n.card {\n  width: min(460px, 100% - 32px);\n  padding: 20px;\n  background: #fff;\n  border-radius: 16px;\n}\n\nh1 { margin-top: 0; }\n.count { font-size: .9rem; color: #9d174d; }\n.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }\n.list li { display: flex; gap: 10px; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: #fdf2f8; }\n\n.heart {\n  flex: none;\n  width: 40px;\n  height: 40px;\n  border: 1px solid #f9a8d4;\n  border-radius: 50%;\n  background: #fff;\n  color: #db2777;\n  font-size: 1.2rem;\n  cursor: pointer;\n}\n\n.heart[aria-pressed=\"true\"] { background: #db2777; color: #fff; }\n.empty { color: #9d174d; font-style: italic; }"
   },
   "js": {
    "data": "const quotes = [\n  { id: 1, text: 'Well done is better than well said.', author: 'Benjamin Franklin' },\n  { id: 2, text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },\n  { id: 3, text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },\n  { id: 4, text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },\n];",
    "favs": "const favs = new Set();\nconst allEl = document.getElementById('all');\n\nfunction toggle(id) {\n  if (favs.has(id)) favs.delete(id);\n  else favs.add(id);\n  render();\n}\n\nfunction heart(q) {\n  const b = document.createElement('button');\n  b.className = 'heart';\n  const on = favs.has(q.id);\n  b.textContent = on ? '♥' : '♡';\n  b.setAttribute('aria-pressed', String(on));\n  b.setAttribute('aria-label', on ? `Remove \"${q.text}\" from favorites` : `Save \"${q.text}\" to favorites`);\n  b.addEventListener('click', () => toggle(q.id));\n  return b;\n}\n\nfunction row(q) {\n  const li = document.createElement('li');\n  const span = document.createElement('span');\n  span.textContent = `${q.text} — ${q.author}`;\n  li.append(span, heart(q));\n  return li;\n}\n\nfunction render() {\n  allEl.replaceChildren(...quotes.map(row));\n  document.getElementById('count').textContent = `(${favs.size})`;\n}\n\nrender();"
   }
  },
  {
   "title": "Remembering favorites after a reload",
   "body": "Right now a reload forgets everything. Save the Set in localStorage, like the best score.\n\nlocalStorage stores strings, and JSON can't write a Set directly (`JSON.stringify(new Set([1]))` gives `\"{}\"`, which loses everything). So turn the Set into an array first, and back into a Set when loading:\n\n```js\nlocalStorage.setItem('favs', JSON.stringify([...favs]));        // Set {1, 3} → \"[1,3]\"\nconst back = new Set(JSON.parse(localStorage.getItem('favs')));  // \"[1,3]\" → Set {1, 3}\n```\n\n```svg Saving: Set → array → JSON text in storage. Loading: JSON text → array → Set\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"30\" width=\"80\" height=\"36\" rx=\"8\" fill=\"#fce7f3\" stroke=\"#db2777\"/><text x=\"45\" y=\"52\" text-anchor=\"middle\">Set {1, 3}</text>\n  <rect x=\"125\" y=\"30\" width=\"80\" height=\"36\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"165\" y=\"52\" text-anchor=\"middle\">[1, 3]</text>\n  <rect x=\"245\" y=\"30\" width=\"80\" height=\"36\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"285\" y=\"52\" text-anchor=\"middle\">\"[1,3]\"</text>\n  <path d=\"M85 42 H121 M205 42 H241\" stroke=\"#111\" stroke-width=\"2\"/><path d=\"M241 56 H205 M121 56 H85\" stroke=\"#6b7280\" stroke-width=\"2\"/>\n  <text x=\"103\" y=\"24\" text-anchor=\"middle\">[...favs]</text><text x=\"223\" y=\"24\" text-anchor=\"middle\">stringify</text>\n  <text x=\"103\" y=\"84\" text-anchor=\"middle\">new Set</text><text x=\"223\" y=\"84\" text-anchor=\"middle\">parse</text>\n</svg>\n```\n\nLoading also **cleans** the saved ids: it keeps only ids that still exist in `quotes`. If a quote was removed from the app, its old favorite quietly disappears instead of breaking the list. Anything saved in storage could be old or edited by hand, so the app never trusts it blindly.",
   "checks": [
    {
     "pane": "js",
     "label": "saving the Set as a JSON array",
     "test": "/JSON\\.stringify\\(\\s*\\[\\s*\\.\\.\\.favs\\s*\\]\\s*\\)/",
     "hint": "localStorage.setItem('favs', JSON.stringify([...favs]))"
    },
    {
     "pane": "js",
     "label": "reading the saved ids back",
     "test": "/JSON\\.parse\\(\\s*localStorage\\.getItem\\(\\s*['\"]favs['\"]/",
     "hint": "JSON.parse(localStorage.getItem('favs'))"
    },
    {
     "pane": "js",
     "label": "keeping only ids that still exist",
     "test": "/quotes\\.some\\(/",
     "hint": "ids.filter((id) => quotes.some((q) => q.id === id))"
    }
   ],
   "quiz": [
    {
     "q": "What does `JSON.stringify(new Set([1, 3]))` give?",
     "options": [
      "\"[1,3]\"",
      "\"{}\", so the favorites would be lost",
      "An error"
     ],
     "answer": 1,
     "why": "JSON has no Set type; spread the Set into an array first."
    },
    {
     "q": "Why does loading keep only ids that still exist in `quotes`?",
     "options": [
      "Saved data can be old; a removed quote's id would otherwise point at nothing",
      "Sets can't hold more than the number of quotes",
      "It makes saving faster"
     ],
     "answer": 0,
     "why": "Treat stored data as untrusted and clean it when you load it."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "store": "function loadFavs() {\n  try {\n    const ids = JSON.parse(localStorage.getItem('favs'));\n    if (!Array.isArray(ids)) return new Set();\n    return new Set(ids.filter((id) => quotes.some((q) => q.id === id)));\n  } catch {\n    return new Set();\n  }\n}\n\nfunction saveFavs() {\n  try { localStorage.setItem('favs', JSON.stringify([...favs])); } catch { /* not saved */ }\n}",
    "favs": "const favs = loadFavs();\nconst allEl = document.getElementById('all');\n\nfunction toggle(id) {\n  if (favs.has(id)) favs.delete(id);\n  else favs.add(id);\n  saveFavs();\n  render();\n}\n\nfunction heart(q) {\n  const b = document.createElement('button');\n  b.className = 'heart';\n  const on = favs.has(q.id);\n  b.textContent = on ? '♥' : '♡';\n  b.setAttribute('aria-pressed', String(on));\n  b.setAttribute('aria-label', on ? `Remove \"${q.text}\" from favorites` : `Save \"${q.text}\" to favorites`);\n  b.addEventListener('click', () => toggle(q.id));\n  return b;\n}\n\nfunction row(q) {\n  const li = document.createElement('li');\n  const span = document.createElement('span');\n  span.textContent = `${q.text} — ${q.author}`;\n  li.append(span, heart(q));\n  return li;\n}\n\nfunction render() {\n  allEl.replaceChildren(...quotes.map(row));\n  document.getElementById('count').textContent = `(${favs.size})`;\n}\n\nrender();"
   }
  },
  {
   "title": "A favorites list built from the ids",
   "body": "The favorites section shows the quotes whose ids are in the Set. That's the filtering lesson again, with a different test:\n\n```js\nconst mine = quotes.filter((q) => favs.has(q.id));\n```\n\n```svg filter() walks the quotes in their own order and keeps the ones whose id is in the Set\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <g><rect x=\"5\" y=\"10\" width=\"60\" height=\"26\" rx=\"6\" fill=\"#fce7f3\" stroke=\"#db2777\"/><text x=\"35\" y=\"27\" text-anchor=\"middle\">id 1 ✓</text>\n  <rect x=\"75\" y=\"10\" width=\"60\" height=\"26\" rx=\"6\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"105\" y=\"27\" text-anchor=\"middle\">id 2</text>\n  <rect x=\"145\" y=\"10\" width=\"60\" height=\"26\" rx=\"6\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"175\" y=\"27\" text-anchor=\"middle\">id 3</text>\n  <rect x=\"215\" y=\"10\" width=\"60\" height=\"26\" rx=\"6\" fill=\"#fce7f3\" stroke=\"#db2777\"/><text x=\"245\" y=\"27\" text-anchor=\"middle\">id 4 ✓</text></g>\n  <text x=\"290\" y=\"27\">quotes</text>\n  <text x=\"5\" y=\"62\">favs.has(q.id)? → keep 1 and 4</text>\n  <rect x=\"5\" y=\"74\" width=\"60\" height=\"26\" rx=\"6\" fill=\"#fce7f3\" stroke=\"#db2777\"/><text x=\"35\" y=\"91\" text-anchor=\"middle\">id 1</text>\n  <rect x=\"75\" y=\"74\" width=\"60\" height=\"26\" rx=\"6\" fill=\"#fce7f3\" stroke=\"#db2777\"/><text x=\"105\" y=\"91\" text-anchor=\"middle\">id 4</text>\n  <text x=\"145\" y=\"91\">your favorites</text>\n</svg>\n```\n\nThe list keeps the quotes' own order (not the order you clicked), and each row has its own heart, so you can remove a favorite from either list. When there are none, the section says how to add one instead of showing nothing.\n\nThe Quote & Joke Generator does exactly this, and later moves the Set from localStorage to your account on its server, so favorites follow you to any device. The code that *uses* favorites doesn't change.",
   "checks": [
    {
     "pane": "js",
     "label": "the favorites list filtered from the ids",
     "test": "/quotes\\.filter\\(\\s*\\(?\\s*q\\s*\\)?\\s*=>\\s*favs\\.has\\(\\s*q\\.id\\s*\\)\\s*\\)/",
     "hint": "quotes.filter((q) => favs.has(q.id))"
    },
    {
     "pane": "js",
     "label": "a message when there are none",
     "test": "/favs\\.size\\s*===\\s*0|!favs\\.size|mine\\.length\\s*===\\s*0|!mine\\.length/",
     "hint": "if (mine.length === 0) { ... }"
    }
   ],
   "quiz": [
    {
     "q": "Favorites are {4, 1}, clicked in that order. In what order does the list show them?",
     "options": [
      "4, then 1",
      "1, then 4, the same order as the quotes",
      "Random order"
     ],
     "answer": 1,
     "why": "The list is quotes.filter(...), which keeps the quotes' order."
    },
    {
     "q": "Later, favorites move to a server account. What has to change in render()?",
     "options": [
      "Everything",
      "Nothing; only where the Set is loaded and saved changes",
      "The heart buttons"
     ],
     "answer": 1,
     "why": "Loading and saving are kept in their own functions, so the rest of the app doesn't care where the ids live."
    }
   ],
   "session": 0,
   "minutes": 12,
   "js": {
    "list": "const favsEl = document.getElementById('favs');\n\nfunction renderFavs() {\n  const mine = quotes.filter((q) => favs.has(q.id));\n  if (mine.length === 0) {\n    const li = document.createElement('li');\n    li.className = 'empty';\n    li.textContent = 'No favorites yet. Tap ♡ on a quote to keep it here.';\n    favsEl.replaceChildren(li);\n    return;\n  }\n  favsEl.replaceChildren(...mine.map(row));\n}\n\nrender();",
    "favs": "const favs = loadFavs();\nconst allEl = document.getElementById('all');\n\nfunction toggle(id) {\n  if (favs.has(id)) favs.delete(id);\n  else favs.add(id);\n  saveFavs();\n  render();\n}\n\nfunction heart(q) {\n  const b = document.createElement('button');\n  b.className = 'heart';\n  const on = favs.has(q.id);\n  b.textContent = on ? '♥' : '♡';\n  b.setAttribute('aria-pressed', String(on));\n  b.setAttribute('aria-label', on ? `Remove \"${q.text}\" from favorites` : `Save \"${q.text}\" to favorites`);\n  b.addEventListener('click', () => toggle(q.id));\n  return b;\n}\n\nfunction row(q) {\n  const li = document.createElement('li');\n  const span = document.createElement('span');\n  span.textContent = `${q.text} — ${q.author}`;\n  li.append(span, heart(q));\n  return li;\n}\n\nfunction render() {\n  allEl.replaceChildren(...quotes.map(row));\n  document.getElementById('count').textContent = `(${favs.size})`;\n  renderFavs();\n}"
   }
  }
 ],
 "finish": "People can keep what they like now. You learned:\n\n- Saving favorites as **ids**, not copies\n- A **Set** with `add`, `delete` and `has`, and a **toggle**\n- `aria-pressed` and a clear label for a toggle button\n- Saving a Set as a **JSON array** and loading it back, cleaned\n- A favorites list from `filter()` and `has()`, with an **empty state**\n\n### Challenges\n\n1. Add a \"Clear all favorites\" button that asks \"Are you sure?\" with your own small dialog (not `confirm()`).\n2. Show the favorites in the order they were added, by saving an array of ids instead of a Set.\n3. Add a count badge to the page title, like \"Quotes (3 ♥)\".\n\n### Next\n\n**Accounts: sign up, hashed passwords and sessions**, so favorites can belong to a person."
};
