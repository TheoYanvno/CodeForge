// Built from guides/filtering.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "filtering",
 "title": "Filtering lists",
 "goals": [
  "Use filter() to keep the items that pass a test, without changing the original array",
  "Write a small test function (a predicate) and combine two tests with &&",
  "Build category buttons from the data with a Set, so new categories appear by themselves",
  "Search text without caring about capital letters",
  "Show a clear message when nothing matches"
 ],
 "prereqs": [
  "The Arrays of objects and random picks lesson (an array of quote objects)"
 ],
 "sessions": [
  {
   "title": "Showing only what matches",
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
   "filter": "",
   "buttons": "",
   "search": "",
   "render": ""
  }
 },
 "steps": [
  {
   "title": "What filtering is",
   "body": "Filtering means \"keep the items that pass a test\". Arrays have a method for it:\n\n```js\nconst work = quotes.filter((q) => q.category === 'work');\n```\n\n`filter` calls your function once for each item. Your function answers **true** (keep it) or **false** (leave it out). That little function is called a **predicate**.\n\n```svg filter() runs the test on each quote and builds a new array with the ones that pass; the original array is unchanged\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <text x=\"5\" y=\"14\">quotes</text>\n  <g><rect x=\"5\" y=\"22\" width=\"90\" height=\"24\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"12\" y=\"38\">work</text>\n  <rect x=\"5\" y=\"52\" width=\"90\" height=\"24\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"12\" y=\"68\">life</text>\n  <rect x=\"5\" y=\"82\" width=\"90\" height=\"24\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"12\" y=\"98\">work</text>\n  <rect x=\"5\" y=\"112\" width=\"90\" height=\"24\" rx=\"6\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"12\" y=\"128\">learning</text></g>\n  <rect x=\"120\" y=\"55\" width=\"95\" height=\"44\" rx=\"10\" fill=\"#6366f1\"/><text x=\"167\" y=\"74\" text-anchor=\"middle\" fill=\"#fff\">category</text><text x=\"167\" y=\"90\" text-anchor=\"middle\" fill=\"#fff\">=== 'work'?</text>\n  <text x=\"235\" y=\"14\">new array</text>\n  <rect x=\"235\" y=\"52\" width=\"90\" height=\"24\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"242\" y=\"68\">work</text>\n  <rect x=\"235\" y=\"82\" width=\"90\" height=\"24\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"242\" y=\"98\">work</text>\n  <path d=\"M95 77 H116 M215 77 H231\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```\n\nTwo things make `filter` safe to use everywhere:\n\n- It returns a **new array**. The original `quotes` is never changed, so you can filter again with a different test and nothing is lost.\n- If nothing passes, you get an **empty array** (`[]`), not an error. Your page should notice that and say so.\n\nThe Quote & Joke Generator filters by category and by search. This lesson builds both.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "A filter function with two tests",
   "body": "The page will have two filters: a category (or `'all'`) and a search text. Keep the current choices in one `state` object and write one function that applies both:\n\n```js\nfunction visible() {\n  return quotes.filter((q) => matchesCategory(q) && matchesSearch(q));\n}\n```\n\n`&&` means **both** tests must pass. Each test is its own small function, so each is easy to read and to fix. For now the search test always says yes; the search box comes in step 4.\n\nThe list on the page is drawn by `render()`, which you'll see in each step: it takes whatever `visible()` returns and shows it.",
   "checks": [
    {
     "pane": "js",
     "label": "the current choices in one object",
     "test": "/const\\s+state\\s*=\\s*\\{[^}]*category/",
     "hint": "const state = { category: 'all', search: '' };"
    },
    {
     "pane": "js",
     "label": "a category test that allows 'all'",
     "test": "/state\\.category\\s*===\\s*['\"]all['\"]\\s*\\|\\|/",
     "hint": "state.category === 'all' || q.category === state.category"
    },
    {
     "pane": "js",
     "label": "filter() with both tests",
     "test": "/\\.filter\\([^)]*\\)\\s*=>\\s*matchesCategory\\(\\s*q\\s*\\)\\s*&&\\s*matchesSearch\\(\\s*q\\s*\\)|filter\\(\\(q\\)\\s*=>\\s*matchesCategory\\(q\\)\\s*&&\\s*matchesSearch\\(q\\)\\)/",
     "hint": "quotes.filter((q) => matchesCategory(q) && matchesSearch(q))"
    }
   ],
   "quiz": [
    {
     "q": "What does `quotes.filter((q) => q.category === 'sports')` give if no quote is in sports?",
     "options": [
      "An error",
      "undefined",
      "An empty array, []"
     ],
     "answer": 2,
     "why": "filter always returns an array; when nothing passes, the array is empty."
    },
    {
     "q": "Does filtering change the `quotes` array?",
     "options": [
      "Yes, it removes the items that fail",
      "No, it builds a new array and leaves quotes as it was",
      "Only if you filter twice"
     ],
     "answer": 1,
     "why": "filter never changes the original, which is why you can switch categories back and forth."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"card\">\n  <h1>Quotes</h1>\n  <div id=\"cats\" class=\"cats\" role=\"group\" aria-label=\"Category\"></div>\n  <input id=\"search\" type=\"search\" placeholder=\"Search quotes or authors\" aria-label=\"Search quotes\">\n  <p id=\"summary\" class=\"summary\"></p>\n  <ul id=\"list\" class=\"list\"></ul>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: start center;\n  padding: 24px 0;\n  font-family: system-ui, sans-serif;\n  background: #f5f3ff;\n  color: #1e1b4b;\n}\n\n.card {\n  width: min(460px, 100% - 32px);\n  padding: 20px;\n  background: #fff;\n  border-radius: 16px;\n}\n\nh1 { margin-top: 0; }\n\n.cats { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }\n\n.cats button {\n  padding: 5px 12px;\n  border: 1px solid #c4b5fd;\n  border-radius: 999px;\n  background: #fff;\n  color: #5b21b6;\n  cursor: pointer;\n}\n\n.cats button[aria-pressed=\"true\"] { background: #6d28d9; color: #fff; }\n\ninput[type=\"search\"] {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 8px 10px;\n  font: inherit;\n  border: 1px solid #c4b5fd;\n  border-radius: 8px;\n}\n\n.summary { color: #64748b; font-size: .9rem; }\n.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }\n.list li { padding: 10px 12px; border-radius: 10px; background: #f5f3ff; }\n.list .who { display: block; color: #6d28d9; font-size: .85rem; margin-top: 4px; }\n.empty { color: #b91c1c; }"
   },
   "js": {
    "data": "const quotes = [\n  { text: 'Well done is better than well said.', author: 'Benjamin Franklin', category: 'work' },\n  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci', category: 'life' },\n  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain', category: 'work' },\n  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius', category: 'life' },\n  { text: 'Knowing is not enough; we must apply.', author: 'Johann Wolfgang von Goethe', category: 'learning' },\n  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci', category: 'learning' },\n  { text: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin', category: 'work' },\n];",
    "filter": "const state = { category: 'all', search: '' };\n\nfunction matchesCategory(q) {\n  return state.category === 'all' || q.category === state.category;\n}\n\nfunction matchesSearch(q) {\n  return true;   // the search box comes in step 4\n}\n\nfunction visible() {\n  return quotes.filter((q) => matchesCategory(q) && matchesSearch(q));\n}",
    "render": "const list = document.getElementById('list');\nconst summary = document.getElementById('summary');\n\nfunction render() {\n  const shown = visible();\n  list.replaceChildren();\n  for (const q of shown) {\n    const li = document.createElement('li');\n    li.textContent = q.text;\n    const who = document.createElement('span');\n    who.className = 'who';\n    who.textContent = `— ${q.author}`;\n    li.append(who);\n    list.append(li);\n  }\n  summary.textContent = `Showing ${shown.length} of ${quotes.length}`;\n}\n\nrender();"
   }
  },
  {
   "title": "Category buttons built from the data",
   "body": "You could type the buttons into the HTML: All, Work, Life, Learning. But then adding a quote in a new category means remembering to add a button too. Instead, build the buttons **from the data**.\n\nA **Set** keeps each value once, however many times it's added. That makes the list of categories in one line:\n\n```js\nconst categories = ['all', ...new Set(quotes.map((q) => q.category))];\n// ['all', 'work', 'life', 'learning']\n```\n\n```svg map() takes each quote's category, new Set() drops the repeats, and the spread puts them back into an array after 'all'\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <text x=\"5\" y=\"20\">map:</text><text x=\"60\" y=\"20\">work, life, work, life, learning, learning, work</text>\n  <text x=\"5\" y=\"55\">Set:</text><text x=\"60\" y=\"55\">work, life, learning</text>\n  <text x=\"5\" y=\"90\">array:</text><text x=\"60\" y=\"90\">all, work, life, learning</text>\n  <path d=\"M40 26 V42 M40 62 V78\" stroke=\"#6366f1\" stroke-width=\"2\"/>\n</svg>\n```\n\n- `quotes.map((q) => q.category)` makes an array of just the categories.\n- `new Set(...)` drops the repeats; `...` spreads the set back into an array after `'all'`.\n- Each button has `aria-pressed` set to `\"true\"` or `\"false\"`, which tells screen readers which one is on, and the CSS styles the pressed one.\n\nClicking a button sets `state.category` and calls `render()`. The filter function from step 2 does the rest.",
   "checks": [
    {
     "pane": "js",
     "label": "categories from the data with a Set",
     "test": "/new\\s+Set\\(\\s*quotes\\.map\\(/",
     "hint": "['all', ...new Set(quotes.map((q) => q.category))]"
    },
    {
     "pane": "js",
     "label": "the pressed button marked for screen readers",
     "test": "/aria-pressed/",
     "hint": "b.setAttribute('aria-pressed', String(c === state.category))"
    },
    {
     "pane": "js",
     "label": "a click changes the state and redraws",
     "test": "/state\\.category\\s*=\\s*\\w+;[\\s\\S]*render\\(\\)/",
     "hint": "state.category = c; render();"
    }
   ],
   "quiz": [
    {
     "q": "What does `new Set(['work', 'life', 'work'])` contain?",
     "options": [
      "work, life, work",
      "work, life",
      "3 items"
     ],
     "answer": 1,
     "why": "A Set keeps each value once, so the second 'work' is dropped."
    },
    {
     "q": "You add a quote with category 'humor'. What else must change for a Humor button to appear?",
     "options": [
      "Nothing; the buttons are built from the categories in the data",
      "A new button in the HTML",
      "A new case in matchesCategory"
     ],
     "answer": 0,
     "why": "The list of categories comes from the quotes, so new data brings its own button."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "buttons": "const cats = document.getElementById('cats');\nconst categories = ['all', ...new Set(quotes.map((q) => q.category))];\n\nfunction drawButtons() {\n  cats.replaceChildren();\n  for (const c of categories) {\n    const b = document.createElement('button');\n    b.textContent = c[0].toUpperCase() + c.slice(1);\n    b.setAttribute('aria-pressed', String(c === state.category));\n    b.addEventListener('click', () => {\n      state.category = c;\n      drawButtons();\n      render();\n    });\n    cats.append(b);\n  }\n}\n\ndrawButtons();"
   }
  },
  {
   "title": "Search, and saying when nothing matches",
   "body": "Now replace the \"always yes\" search test with a real one. Searching should ignore capital letters: \"TWAIN\", \"twain\" and \"Twain\" should all find Mark Twain. So both the search text and the quote are lowercased before comparing, and `includes()` checks whether one string appears inside the other:\n\n```js\nfunction matchesSearch(q) {\n  const s = state.search.trim().toLowerCase();\n  if (!s) return true;                                         // an empty search matches everything\n  return `${q.text} ${q.author}`.toLowerCase().includes(s);\n}\n```\n\n```svg Both sides are lowercased, then includes() asks whether the search appears anywhere inside the quote and author\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"10\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"75\" y=\"30\" text-anchor=\"middle\">\"TWAIN\"</text>\n  <rect x=\"185\" y=\"10\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"255\" y=\"30\" text-anchor=\"middle\">\"…started. Mark Twain\"</text>\n  <text x=\"75\" y=\"62\" text-anchor=\"middle\">\"twain\"</text><text x=\"255\" y=\"62\" text-anchor=\"middle\">\"…started. mark twain\"</text>\n  <path d=\"M75 40 V50 M255 40 V50\" stroke=\"#111\" stroke-width=\"2\"/>\n  <rect x=\"95\" y=\"76\" width=\"140\" height=\"28\" rx=\"8\" fill=\"#6366f1\"/><text x=\"165\" y=\"95\" text-anchor=\"middle\" fill=\"#fff\">includes → true</text>\n</svg>\n```\n\nThe `input` event fires on every keystroke, so the list updates as you type.\n\nThe category and search work **together**, because `visible()` needs both tests to pass: pick *Work*, type *franklin*, and you get only Franklin's work quotes.\n\nWhen nothing matches, an empty list looks like the page is broken. `render()` now shows a message instead, with a hint about what to try.",
   "checks": [
    {
     "pane": "js",
     "label": "case-insensitive search",
     "test": "/toLowerCase\\(\\)\\.includes\\(/",
     "hint": "`${q.text} ${q.author}`.toLowerCase().includes(s)"
    },
    {
     "pane": "js",
     "label": "updating as you type",
     "test": "/addEventListener\\(\\s*['\"]input['\"]/",
     "hint": "search.addEventListener('input', ...)"
    },
    {
     "pane": "js",
     "label": "a message when nothing matches",
     "test": "/shown\\.length\\s*===\\s*0|!shown\\.length/",
     "hint": "if (shown.length === 0) { ... }"
    }
   ],
   "quiz": [
    {
     "q": "Why are both the search text and the quote lowercased?",
     "options": [
      "Lowercase letters are faster to compare",
      "So \"TWAIN\" and \"twain\" both find \"Mark Twain\"",
      "includes() only works on lowercase"
     ],
     "answer": 1,
     "why": "Comparing two lowercased strings ignores capital letters on both sides."
    },
    {
     "q": "Category is *Life* and the search is *franklin*. What shows?",
     "options": [
      "All of Franklin's quotes",
      "All life quotes",
      "Only quotes that are in life AND mention Franklin, which here is none, so the empty message"
     ],
     "answer": 2,
     "why": "`visible()` keeps a quote only when both tests pass; none of Franklin's quotes in this list is in life."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "search": "const search = document.getElementById('search');\nsearch.addEventListener('input', () => {\n  state.search = search.value;\n  render();\n});",
    "filter": "const state = { category: 'all', search: '' };\n\nfunction matchesCategory(q) {\n  return state.category === 'all' || q.category === state.category;\n}\n\nfunction matchesSearch(q) {\n  const s = state.search.trim().toLowerCase();\n  if (!s) return true;\n  return `${q.text} ${q.author}`.toLowerCase().includes(s);\n}\n\nfunction visible() {\n  return quotes.filter((q) => matchesCategory(q) && matchesSearch(q));\n}",
    "render": "const list = document.getElementById('list');\nconst summary = document.getElementById('summary');\n\nfunction render() {\n  const shown = visible();\n  list.replaceChildren();\n  if (shown.length === 0) {\n    const li = document.createElement('li');\n    li.className = 'empty';\n    li.textContent = 'No quotes match. Try another word, or pick All.';\n    list.append(li);\n  }\n  for (const q of shown) {\n    const li = document.createElement('li');\n    li.textContent = q.text;\n    const who = document.createElement('span');\n    who.className = 'who';\n    who.textContent = `— ${q.author}`;\n    li.append(who);\n    list.append(li);\n  }\n  summary.textContent = `Showing ${shown.length} of ${quotes.length}`;\n}\n\nrender();"
   }
  }
 ],
 "finish": "You can show just the items people want. You learned:\n\n- `filter()` with a **predicate**, returning a new array and never changing the original\n- Combining tests with `&&`, each test its own small function\n- Building buttons **from the data** with `map` and a **Set**\n- `aria-pressed` for toggle buttons\n- **Case-insensitive search** with `toLowerCase()` and `includes()`, live with the `input` event\n- An **empty state** message when nothing matches\n\n### Challenges\n\n1. Show how many quotes each category has on its button, like \"Work (3)\".\n2. Highlight the matching part of each quote with a `<mark>` element (build it with `createElement`, not `innerHTML`).\n3. Remember the chosen category in localStorage, so it's still picked after a reload.\n\n### Next\n\nThe **Quote & Joke Generator** project combines this with random picks, and the lessons still to come add fetching quotes, saving favorites, accounts and sharing."
};
