// Built from guides/randompick.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "randompick",
 "title": "Arrays of objects and random picks",
 "goals": [
  "Store content as an array of objects with the same fields",
  "Read fields with dot notation and loop over the array",
  "Pick a random item with Math.random and Math.floor, and know why the index never goes past the end",
  "Avoid showing the same item twice in a row",
  "Keep content (data) separate from the code that shows it"
 ],
 "prereqs": [
  "The JavaScript basics lesson (variables, arrays, functions and click events)"
 ],
 "sessions": [
  {
   "title": "Content as data",
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
   "pick": "",
   "show": ""
  }
 },
 "steps": [
  {
   "title": "Why content lives in an array of objects",
   "body": "A quote has a few pieces: the words, who said them, and a category. In JavaScript, a thing with named pieces is an **object**:\n\n```js\nconst quote = { text: 'Well done is better than well said.', author: 'Benjamin Franklin', category: 'work' };\nquote.author;   // \"Benjamin Franklin\"\n```\n\nMany quotes are an **array of objects**, one object per quote, all with the same fields. That shape is everywhere in programming: a list of products in a shop, posts on a blog, rows from a database, results from a web API.\n\n```svg An array of objects: each item is one quote with the same three fields, and its place in the array is its index\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <text x=\"5\" y=\"16\">quotes =</text>\n  <g><rect x=\"5\" y=\"24\" width=\"320\" height=\"34\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"14\" y=\"45\">[0]  { text: \"Well done is…\", author: \"Franklin\", category: \"work\" }</text></g>\n  <g><rect x=\"5\" y=\"64\" width=\"320\" height=\"34\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"14\" y=\"85\">[1]  { text: \"Simplicity is…\", author: \"da Vinci\", category: \"life\" }</text></g>\n  <g><rect x=\"5\" y=\"104\" width=\"320\" height=\"34\" rx=\"6\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"14\" y=\"125\">[2]  { text: \"The secret of…\", author: \"Twain\", category: \"work\" }</text></g>\n</svg>\n```\n\n### Why data and code stay apart\n\nThe quotes are **data**: plain values, no logic. The code that picks and shows a quote doesn't care how many there are or what they say. So adding a quote is adding one line to the array, with no change to the code, and later the same code can show quotes that come from a server instead of the file. That's the whole Quote & Joke Generator in one idea.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "The data: an array of quote objects",
   "body": "Write the array. Every object has the same three fields; a missing or misspelled field (say `auther`) shows up as `undefined` on the page, which is the most common bug with this kind of data.\n\nThe quotes below are old enough to be in the public domain, so they're free to use.\n\n`quotes.length` is how many there are, and `quotes[0]` is the first one. A `for...of` loop visits each, which the page uses to show the count.",
   "checks": [
    {
     "pane": "js",
     "label": "an array of quote objects",
     "test": "/const\\s+quotes\\s*=\\s*\\[\\s*\\{/",
     "hint": "const quotes = [{ text: '...', author: '...', category: '...' }, ...];"
    },
    {
     "pane": "js",
     "label": "every quote has an author",
     "test": "/author\\s*:/",
     "hint": "author: 'Mark Twain'"
    },
    {
     "pane": "js",
     "label": "counting the quotes",
     "test": "/quotes\\.length/",
     "hint": "quotes.length"
    }
   ],
   "quiz": [
    {
     "q": "What does `quotes[1].author` give for the array in the diagram?",
     "options": [
      "\"Franklin\"",
      "\"da Vinci\"",
      "undefined"
     ],
     "answer": 1,
     "why": "Arrays count from 0, so `[1]` is the second quote, and `.author` reads its author field."
    },
    {
     "q": "Why does every object have exactly the same fields?",
     "options": [
      "So the same code can show any of them; a different or misspelled field would show up as undefined",
      "JavaScript requires objects in an array to match",
      "It makes the array shorter"
     ],
     "answer": 0,
     "why": "The code reads `q.text` and `q.author` from whichever quote it picks, so they all need those fields."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main class=\"card\">\n  <p class=\"count\" id=\"count\"></p>\n  <blockquote id=\"text\">Press the button for a quote.</blockquote>\n  <p class=\"author\" id=\"author\"></p>\n  <button id=\"next\">New quote</button>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: Georgia, serif;\n  background: #f5f3ff;\n  color: #1e1b4b;\n}\n\n.card {\n  width: min(420px, 100% - 32px);\n  padding: 28px;\n  background: #fff;\n  border-radius: 16px;\n  box-shadow: 0 10px 30px rgb(0 0 0 / .08);\n  text-align: center;\n}\n\nblockquote { margin: 0 0 12px; font-size: 1.35rem; line-height: 1.4; }\n.author { margin: 0 0 18px; color: #6d28d9; font-style: italic; }\n.count { margin: 0 0 12px; color: #64748b; font: .85rem system-ui, sans-serif; }\n\nbutton {\n  padding: 10px 18px;\n  font: 600 1rem system-ui, sans-serif;\n  color: #fff;\n  background: #6d28d9;\n  border: 0;\n  border-radius: 10px;\n  cursor: pointer;\n}"
   },
   "js": {
    "data": "const quotes = [\n  { text: 'Well done is better than well said.', author: 'Benjamin Franklin', category: 'work' },\n  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci', category: 'life' },\n  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain', category: 'work' },\n  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius', category: 'life' },\n  { text: 'Knowing is not enough; we must apply.', author: 'Johann Wolfgang von Goethe', category: 'learning' },\n  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci', category: 'learning' },\n];\n\nlet authors = 0;\nconst seen = new Set();\nfor (const q of quotes) {\n  if (!seen.has(q.author)) { seen.add(q.author); authors += 1; }\n}\ndocument.getElementById('count').textContent = `${quotes.length} quotes by ${authors} people`;"
   }
  },
  {
   "title": "A random pick, and never the same one twice",
   "body": "`Math.random()` gives a number from 0 up to (but never exactly) 1. Multiply it by the number of quotes and round down, and you get a valid index:\n\n```js\nconst i = Math.floor(Math.random() * quotes.length);   // 0, 1, ... up to length - 1\n```\n\n```svg With 6 quotes, Math.random() × 6 lands somewhere from 0 up to (not including) 6, and Math.floor turns it into an index from 0 to 5\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <path d=\"M15 40 H315\" stroke=\"#111\" stroke-width=\"2\"/>\n  <g fill=\"#6366f1\"><rect x=\"15\" y=\"28\" width=\"48\" height=\"24\" opacity=\".25\"/><rect x=\"65\" y=\"28\" width=\"48\" height=\"24\" opacity=\".4\"/><rect x=\"115\" y=\"28\" width=\"48\" height=\"24\" opacity=\".25\"/><rect x=\"165\" y=\"28\" width=\"48\" height=\"24\" opacity=\".4\"/><rect x=\"215\" y=\"28\" width=\"48\" height=\"24\" opacity=\".25\"/><rect x=\"265\" y=\"28\" width=\"48\" height=\"24\" opacity=\".4\"/></g>\n  <g text-anchor=\"middle\"><text x=\"39\" y=\"70\">0</text><text x=\"89\" y=\"70\">1</text><text x=\"139\" y=\"70\">2</text><text x=\"189\" y=\"70\">3</text><text x=\"239\" y=\"70\">4</text><text x=\"289\" y=\"70\">5</text></g>\n  <text x=\"15\" y=\"20\">0</text><text x=\"300\" y=\"20\">6 (never reached)</text>\n  <text x=\"165\" y=\"92\" text-anchor=\"middle\">2.7 → floor → index 2</text>\n</svg>\n```\n\nBecause `Math.random()` never reaches 1, the index never reaches `quotes.length`, so it can't run off the end of the array.\n\nPure chance repeats itself: with six quotes you'll see the same one twice in a row about one time in six, and it feels broken. The fix is to remember the last index and pick again if it comes up. (With only one quote, there's nothing else to pick, so the loop must not run forever; the `quotes.length > 1` check handles that.)",
   "checks": [
    {
     "pane": "js",
     "label": "a random index",
     "test": "/Math\\.floor\\(\\s*Math\\.random\\(\\)\\s*\\*\\s*\\w+\\.length\\s*\\)/",
     "hint": "Math.floor(Math.random() * quotes.length)"
    },
    {
     "pane": "js",
     "label": "a pick() function",
     "test": "/function\\s+pick\\s*\\(/",
     "hint": "function pick() { ... }"
    },
    {
     "pane": "js",
     "label": "no repeats in a row",
     "test": "/while\\s*\\([^)]*===\\s*last/",
     "hint": "while (quotes.length > 1 && i === last) { ... }"
    }
   ],
   "quiz": [
    {
     "q": "Can `Math.floor(Math.random() * 6)` ever be 6?",
     "options": [
      "Yes, about one time in seven",
      "No, because Math.random() is always less than 1",
      "Only on slow computers"
     ],
     "answer": 1,
     "why": "Math.random() × 6 is always under 6, and rounding down gives 0 to 5."
    },
    {
     "q": "Why does the no-repeat loop also check `quotes.length > 1`?",
     "options": [
      "To make it faster",
      "With only one quote, every pick repeats, and the loop would never end",
      "Math.random needs at least two items"
     ],
     "answer": 1,
     "why": "A while loop that can't ever finish freezes the page; the length check gives it a way out."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "pick": "let last = -1;\n\nfunction pick() {\n  let i = Math.floor(Math.random() * quotes.length);\n  while (quotes.length > 1 && i === last) {\n    i = Math.floor(Math.random() * quotes.length);\n  }\n  last = i;\n  return quotes[i];\n}"
   }
  },
  {
   "title": "Showing the pick on the card",
   "body": "`show(q)` takes one quote object and puts its fields on the page. Clicking the button picks and shows:\n\n```js\ndocument.getElementById('next').addEventListener('click', () => show(pick()));\n```\n\n`show()` uses `textContent`, not `innerHTML`. `textContent` puts the words on the page as plain text, so even if a quote contained `<script>` it would just be shown, never run. That habit matters as soon as content comes from somewhere you don't control, like a web API or a user, which is where the Quote project goes next.\n\n```svg Click → pick() returns one quote object → show() writes its text and author onto the card\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"20\" width=\"70\" height=\"36\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"40\" y=\"42\" text-anchor=\"middle\">click</text>\n  <rect x=\"100\" y=\"20\" width=\"70\" height=\"36\" rx=\"8\" fill=\"#6366f1\"/><text x=\"135\" y=\"42\" text-anchor=\"middle\" fill=\"#fff\">pick()</text>\n  <rect x=\"195\" y=\"20\" width=\"70\" height=\"36\" rx=\"8\" fill=\"#16a34a\"/><text x=\"230\" y=\"42\" text-anchor=\"middle\" fill=\"#fff\">show(q)</text>\n  <rect x=\"285\" y=\"20\" width=\"40\" height=\"36\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"305\" y=\"42\" text-anchor=\"middle\">card</text>\n  <path d=\"M75 38 H96 M170 38 H191 M265 38 H281\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"182\" y=\"74\" text-anchor=\"middle\">{ text, author, category }</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a show() function",
     "test": "/function\\s+show\\s*\\(\\s*q\\s*\\)/",
     "hint": "function show(q) { ... }"
    },
    {
     "pane": "js",
     "label": "writing text safely",
     "test": "/textContent\\s*=\\s*q\\.text/",
     "hint": "text.textContent = q.text;"
    },
    {
     "pane": "js",
     "label": "the button picks and shows",
     "test": "/show\\(\\s*pick\\(\\)\\s*\\)/",
     "hint": "show(pick())"
    }
   ],
   "quiz": [
    {
     "q": "Why does `show()` use `textContent` instead of `innerHTML`?",
     "options": [
      "textContent is shorter to type",
      "textContent shows the words as plain text, so HTML or scripts inside them can never run",
      "innerHTML doesn't work on blockquotes"
     ],
     "answer": 1,
     "why": "innerHTML would turn text into HTML. textContent keeps it as text, which is safe for content you didn't write."
    },
    {
     "q": "To add a seventh quote, what changes?",
     "options": [
      "One new object in the quotes array; pick() and show() stay the same",
      "pick() needs a new if statement",
      "The button needs a new id"
     ],
     "answer": 0,
     "why": "The code works from `quotes.length` and the fields, so data changes don't need code changes."
    }
   ],
   "session": 0,
   "minutes": 10,
   "js": {
    "show": "const textEl = document.getElementById('text');\nconst authorEl = document.getElementById('author');\n\nfunction show(q) {\n  textEl.textContent = q.text;\n  authorEl.textContent = `— ${q.author}`;\n}\n\ndocument.getElementById('next').addEventListener('click', () => show(pick()));\nshow(pick());"
   }
  }
 ],
 "finish": "You can hold content as data and pick from it. You learned:\n\n- **Objects** with named fields, and an **array of objects** with the same fields\n- `quotes.length`, `quotes[i]` and `for...of`\n- `Math.floor(Math.random() * length)` for a random index that can't go past the end\n- Remembering the **last pick** to avoid repeats, and a loop that always ends\n- **Data apart from code**, and `textContent` for content you didn't write\n\n### Challenges\n\n1. Add a **Previous** button that goes back through the quotes you've already seen (keep their indexes in an array).\n2. Shuffle the whole array once with the Fisher–Yates shuffle, then show the quotes in that order, so every quote appears once before any repeats.\n3. Add a `year` field to some quotes, and show it only when it's there.\n\n### Next\n\n**Filtering lists**: show only the quotes in one category, or the ones that match a search."
};
