// Built from guides/storage.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "storage",
 "title": "Saving a best score",
 "goals": [
  "Explain what localStorage keeps, where, and that it only stores strings",
  "Save and load a number safely, with a default when nothing is saved",
  "Wrap storage in try/catch because browsers can block it",
  "Save several values at once as JSON",
  "Clear saved data with removeItem"
 ],
 "prereqs": [
  "The JavaScript basics lesson (variables, functions, if/else and events)"
 ],
 "sessions": [
  {
   "title": "Remembering things",
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
   "elements": "",
   "storage": "",
   "game": "",
   "stats": ""
  }
 },
 "steps": [
  {
   "title": "What localStorage is",
   "body": "Everything in your variables disappears when the page closes. To remember a best score until next time, the browser gives every website a small notebook called **localStorage**.\n\n```js\nlocalStorage.setItem('best', '42');     // write\nlocalStorage.getItem('best');           // read: \"42\"\nlocalStorage.removeItem('best');        // erase\n```\n\nThree things to know about it:\n\n- **It only stores strings.** Save the number 42 and you get back the string `\"42\"`. Turn it back into a number with `Number()`.\n- **It belongs to one website in one browser.** Your score on your laptop isn't on your phone, and another site can't read it.\n- **It can fail.** Some private windows and locked-down school or work computers block it, and then `setItem` throws an error. A game that crashes because it couldn't save a score is a bad game.\n\n```svg Your page writes and reads strings in localStorage, which stays on this device for this site after the page closes\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"40\" width=\"100\" height=\"50\" rx=\"10\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"55\" y=\"62\" text-anchor=\"middle\">your page</text><text x=\"55\" y=\"78\" text-anchor=\"middle\">best = 42</text>\n  <rect x=\"200\" y=\"30\" width=\"115\" height=\"70\" rx=\"10\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"257\" y=\"52\" text-anchor=\"middle\">localStorage</text><text x=\"257\" y=\"70\" text-anchor=\"middle\">\"best\": \"42\"</text><text x=\"257\" y=\"88\" text-anchor=\"middle\" font-size=\"10\">this site, this browser</text>\n  <path d=\"M105 55 H196\" stroke=\"#111\" stroke-width=\"2\"/><text x=\"150\" y=\"48\" text-anchor=\"middle\">setItem</text>\n  <path d=\"M196 78 H105\" stroke=\"#111\" stroke-width=\"2\"/><text x=\"150\" y=\"94\" text-anchor=\"middle\">getItem</text>\n  <text x=\"160\" y=\"122\" text-anchor=\"middle\" fill=\"#334155\">still there after the page closes</text>\n</svg>\n```\n\n> Never put passwords or private information in localStorage: anyone using that browser can open the developer tools and read it.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "Loading and saving the best score safely",
   "body": "Two small functions do all the storage work, so the rest of the game never touches localStorage directly:\n\n```js\nfunction loadBest() {\n  try {\n    return Number(localStorage.getItem('best')) || 0;\n  } catch {\n    return 0;\n  }\n}\n```\n\n- `getItem` gives `null` when nothing is saved yet, `Number(null)` is `0`, and `|| 0` also catches anything that isn't a number.\n```svg loadBest(): read the string, turn it into a number, and fall back to 0 if it's missing or storage is blocked\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"40\" width=\"80\" height=\"36\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"45\" y=\"62\" text-anchor=\"middle\">getItem</text>\n  <rect x=\"120\" y=\"10\" width=\"95\" height=\"30\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"167\" y=\"30\" text-anchor=\"middle\">\"42\" → 42</text>\n  <rect x=\"120\" y=\"46\" width=\"95\" height=\"30\" rx=\"8\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"167\" y=\"66\" text-anchor=\"middle\">null → 0</text>\n  <rect x=\"120\" y=\"82\" width=\"95\" height=\"30\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#ef4444\"/><text x=\"167\" y=\"102\" text-anchor=\"middle\">blocked → 0</text>\n  <path d=\"M85 50 L118 26 M85 58 H118 M85 66 L118 96\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"225\" y=\"30\">saved score</text><text x=\"225\" y=\"66\">first visit</text><text x=\"225\" y=\"102\">catch</text>\n</svg>\n```\n\n- `try { ... } catch { ... }` means \"try this, and if it throws an error, do this instead\". If storage is blocked, the game still works; it just won't remember the score.",
   "checks": [
    {
     "pane": "js",
     "label": "reading the saved score",
     "test": "/localStorage\\.getItem\\(/",
     "hint": "localStorage.getItem('best')"
    },
    {
     "pane": "js",
     "label": "turning the string into a number",
     "test": "/Number\\(\\s*localStorage\\.getItem/",
     "hint": "Number(localStorage.getItem('best')) || 0"
    },
    {
     "pane": "js",
     "label": "storage wrapped in try/catch",
     "test": "/try\\s*\\{[\\s\\S]*localStorage[\\s\\S]*\\}\\s*catch/",
     "hint": "try { ... } catch { ... }"
    }
   ],
   "quiz": [
    {
     "q": "What does `localStorage.getItem('best')` give the very first time, before anything was saved?",
     "options": [
      "0",
      "null",
      "An error"
     ],
     "answer": 1,
     "why": "A missing item is `null`; `Number(null) || 0` turns that into 0."
    },
    {
     "q": "Why is storage wrapped in `try/catch`?",
     "options": [
      "It makes saving faster",
      "Some browsers block storage and throw an error; the game should keep working anyway",
      "localStorage requires it"
     ],
     "answer": 1,
     "why": "Without it, a blocked save would crash the game. With it, the game just doesn't remember."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"card\">\n  <h1>Best score</h1>\n  <p class=\"big\">Score <strong id=\"score\">0</strong></p>\n  <p>Best <strong id=\"best\">0</strong></p>\n  <p class=\"buttons\">\n    <button id=\"point\">+1 point</button>\n    <button id=\"over\">Game over</button>\n    <button id=\"reset\">Reset saved data</button>\n  </p>\n  <p id=\"message\" class=\"muted\">Score some points, then press Game over. Reload the page: the best score is still there.</p>\n  <p id=\"stats\" class=\"muted\"></p>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #e2e8f0;\n}\n\n.card {\n  width: min(340px, 100% - 32px);\n  padding: 20px;\n  background: #fff;\n  border-radius: 14px;\n  text-align: center;\n}\n\n.big { font-size: 1.6rem; }\n.muted { color: #64748b; }\n\n.buttons {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  justify-content: center;\n}\n\nbutton { padding: 6px 12px; font: inherit; }"
   },
   "js": {
    "elements": "const scoreEl = document.getElementById('score');\nconst bestEl = document.getElementById('best');\nconst message = document.getElementById('message');",
    "storage": "function loadBest() {\n  try {\n    return Number(localStorage.getItem('best')) || 0;\n  } catch {\n    return 0;\n  }\n}\n\nfunction saveBest(n) {\n  try {\n    localStorage.setItem('best', String(n));\n  } catch {\n    message.textContent = 'This browser is blocking storage, so the best score won\\'t be kept.';\n  }\n}\n\nbestEl.textContent = loadBest();"
   }
  },
  {
   "title": "A new best only when you beat it",
   "body": "The game keeps the **score** in a normal variable (it starts at 0 every game) and the **best** in storage. At game over, it compares them:\n\n```js\nif (score > best) {\n  best = score;\n  saveBest(best);\n}\n```\n\nOnly a higher score is saved, so a bad game never overwrites a good one. This is exactly what Snake does when the snake crashes.\n\n```svg At game over: if the score beats the best, save it; otherwise keep the old best\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"45\" width=\"80\" height=\"40\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"45\" y=\"70\" text-anchor=\"middle\">game over</text>\n  <path d=\"M120 65 L160 35 L200 65 L160 95 Z\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"160\" y=\"69\" text-anchor=\"middle\">score &gt; best?</text>\n  <rect x=\"230\" y=\"10\" width=\"85\" height=\"36\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"272\" y=\"32\" text-anchor=\"middle\">save it</text>\n  <rect x=\"230\" y=\"84\" width=\"85\" height=\"36\" rx=\"8\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"272\" y=\"106\" text-anchor=\"middle\">keep old best</text>\n  <path d=\"M85 65 H118 M190 50 L228 30 M190 80 L228 100\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"205\" y=\"32\">yes</text><text x=\"205\" y=\"104\">no</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a score that starts at 0",
     "test": "/let\\s+score\\s*=\\s*0/",
     "hint": "let score = 0;"
    },
    {
     "pane": "js",
     "label": "only saving a higher score",
     "test": "/if\\s*\\(\\s*score\\s*>\\s*best\\s*\\)/",
     "hint": "if (score > best) { ... }"
    },
    {
     "pane": "js",
     "label": "saving the new best",
     "test": "/saveBest\\(\\s*best\\s*\\)/",
     "hint": "saveBest(best);"
    }
   ],
   "quiz": [
    {
     "q": "The best is 30 and you score 12. What is saved at game over?",
     "options": [
      "12",
      "Nothing changes; the best stays 30",
      "42"
     ],
     "answer": 1,
     "why": "12 isn't greater than 30, so the old best is kept."
    },
    {
     "q": "Why is the score a plain variable but the best kept in storage?",
     "options": [
      "The score starts over each game; only the best needs to survive closing the page",
      "Storage can only hold one value",
      "Variables are faster than storage"
     ],
     "answer": 0,
     "why": "Only what must outlive the page goes in storage."
    }
   ],
   "session": 0,
   "minutes": 12,
   "js": {
    "game": "let score = 0;\nlet best = loadBest();\n\ndocument.getElementById('point').addEventListener('click', () => {\n  score += 1;\n  scoreEl.textContent = score;\n});\n\ndocument.getElementById('over').addEventListener('click', () => {\n  if (score > best) {\n    best = score;\n    saveBest(best);\n    message.textContent = `New best: ${best}!`;\n  } else {\n    message.textContent = `Game over. ${score} points; your best is still ${best}.`;\n  }\n  bestEl.textContent = best;\n  score = 0;\n  scoreEl.textContent = score;\n});"
   }
  },
  {
   "title": "Several values at once with JSON",
   "body": "What if you also want to count games played? Storing each number under its own key works, but it gets messy. Instead, put them in one object and save it as **JSON**, a text format for objects:\n\n```js\nconst stats = { games: 3, points: 41 };\nlocalStorage.setItem('stats', JSON.stringify(stats));   // '{\"games\":3,\"points\":41}'\nconst back = JSON.parse(localStorage.getItem('stats')); // { games: 3, points: 41 }\n```\n\n`JSON.stringify` turns the object into a string to save, and `JSON.parse` turns it back. If the saved text is missing or broken, `JSON.parse` throws, which the `try/catch` already handles.\n\nGame over now adds the game to the stats and saves them. **Reset saved data** uses `removeItem` to erase both keys. Every app that saves anything should give people a way to clear it.",
   "checks": [
    {
     "pane": "js",
     "label": "saving an object as JSON",
     "test": "/JSON\\.stringify\\(/",
     "hint": "localStorage.setItem('stats', JSON.stringify(stats))"
    },
    {
     "pane": "js",
     "label": "reading it back",
     "test": "/JSON\\.parse\\(/",
     "hint": "JSON.parse(localStorage.getItem('stats'))"
    },
    {
     "pane": "js",
     "label": "erasing saved data",
     "test": "/localStorage\\.removeItem\\(/",
     "hint": "localStorage.removeItem('best')"
    }
   ],
   "quiz": [
    {
     "q": "What does `JSON.stringify({ games: 3 })` give?",
     "options": [
      "The string '{\"games\":3}'",
      "The number 3",
      "An object with a games field"
     ],
     "answer": 0,
     "why": "stringify turns an object into JSON text, which is what localStorage can store."
    },
    {
     "q": "Why does reading the stats still sit inside try/catch?",
     "options": [
      "JSON.parse is slow",
      "The saved text could be missing or broken, and JSON.parse throws on bad text",
      "removeItem needs it"
     ],
     "answer": 1,
     "why": "`JSON.parse('oops')` throws a SyntaxError, so the code falls back to fresh stats instead of crashing."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "stats": "const statsEl = document.getElementById('stats');\n\nfunction loadStats() {\n  try {\n    return { games: 0, points: 0, ...JSON.parse(localStorage.getItem('stats')) };\n  } catch {\n    return { games: 0, points: 0 };\n  }\n}\n\nfunction saveStats(s) {\n  try { localStorage.setItem('stats', JSON.stringify(s)); } catch { /* not saved */ }\n}\n\nfunction showStats(s) {\n  statsEl.textContent = `${s.games} games played · ${s.points} points in all`;\n}\n\nlet stats = loadStats();\nshowStats(stats);\n\ndocument.getElementById('reset').addEventListener('click', () => {\n  try {\n    localStorage.removeItem('best');\n    localStorage.removeItem('stats');\n  } catch { /* nothing to clear */ }\n  best = 0;\n  stats = { games: 0, points: 0 };\n  bestEl.textContent = 0;\n  showStats(stats);\n  message.textContent = 'Saved data cleared.';\n});",
    "game": "let score = 0;\nlet best = loadBest();\n\ndocument.getElementById('point').addEventListener('click', () => {\n  score += 1;\n  scoreEl.textContent = score;\n});\n\ndocument.getElementById('over').addEventListener('click', () => {\n  if (score > best) {\n    best = score;\n    saveBest(best);\n    message.textContent = `New best: ${best}!`;\n  } else {\n    message.textContent = `Game over. ${score} points; your best is still ${best}.`;\n  }\n  stats = { games: stats.games + 1, points: stats.points + score };\n  saveStats(stats);\n  showStats(stats);\n  bestEl.textContent = best;\n  score = 0;\n  scoreEl.textContent = score;\n});"
   }
  }
 ],
 "finish": "Your pages can remember things now. You learned:\n\n- **localStorage** keeps strings per site, per browser, after the page closes\n- `getItem`, `setItem` and `removeItem`, and `Number()` to get a number back\n- **try/catch** so blocked storage never crashes the page\n- Saving only a **new best**\n- **JSON** to save several values as one string\n\n### Challenges\n\n1. Keep a top-5 list instead of one best score: an array saved as JSON, sorted, sliced to 5.\n2. Save the date of the best score too, and show \"set on Nov 3\".\n3. Open the developer tools (F12), find Application → Local Storage, and change the saved best by hand. What does that tell you about trusting saved data?\n\n### Next\n\nYou've learned every skill Snake uses. Build **Snake**."
};
