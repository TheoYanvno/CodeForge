// Built from guides/matching.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "matching",
 "title": "Matching questions to answers",
 "goals": [
  "Normalize text so different spellings and accents compare as equal",
  "Match whole words by padding with spaces, so \"age\" doesn't match \"page\"",
  "Trim word endings (stemming) so \"renewing\" finds \"renew\"",
  "Score answers by keywords, with longer phrases worth more, and pick the best",
  "Say \"I'm not sure\" below a confidence threshold, and offer close matches instead of guessing"
 ],
 "prereqs": [
  "The Filtering lists lesson (includes, filter and sort) and the Parsing Markdown lesson (regular expressions)"
 ],
 "sessions": [
  {
   "title": "What did they mean?",
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
   "normalize": "",
   "score": "",
   "confidence": ""
  }
 },
 "steps": [
  {
   "title": "Matching without AI",
   "body": "A help box answers typed questions like \"How do I renew a book?\" or \"whats the late fee\". You can do a surprising amount of this **without** any AI, using the same few steps search engines started with:\n\n1. **Normalize**: make the text plain and predictable. Lowercase, remove accents (`café` → `cafe`), turn punctuation into spaces, squash repeated spaces.\n2. **Stem**: trim common endings so word forms meet: *renewing*, *renewed*, *renews* → *renew*.\n3. **Score**: each answer has **keywords**. Every keyword found in the question adds points; longer phrases are more specific, so they're worth more.\n4. **Decide**: take the highest score, but only if it's high enough. Otherwise say so, and offer the closest few.\n\n```svg A typed question is normalized, stemmed, and scored against each answer's keywords; the best answer wins only if it clears the threshold\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 120\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"10\" width=\"320\" height=\"24\" rx=\"6\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"12\" y=\"26\">\"Whats the LATE fee for DVDs?!\"</text>\n  <rect x=\"5\" y=\"44\" width=\"320\" height=\"24\" rx=\"6\" fill=\"#e0f2fe\" stroke=\"#0284c7\"/><text x=\"12\" y=\"60\">\" whats the late fee for dvd \"   (normalized + stemmed)</text>\n  <rect x=\"5\" y=\"78\" width=\"200\" height=\"24\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"12\" y=\"94\">Late fees: \"late fee\" +3, \"dvd\" +2</text>\n  <rect x=\"215\" y=\"78\" width=\"110\" height=\"24\" rx=\"6\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"222\" y=\"94\">5 ≥ 3 → answer</text>\n</svg>\n```\n\nThis is how SuperBook matches a question to one of its topics. It's predictable (the same question always gets the same answer), it runs instantly with no server, and when it doesn't know, it can say so honestly, which matters more than sounding clever.",
   "session": 0,
   "minutes": 12,
   "kind": "read"
  },
  {
   "title": "Normalize the text",
   "body": "`normalize(text)` does four things in order:\n\n```js\ntext.normalize('NFD').replace(/[̀-ͯ]/g, '')   // é → e + accent → e\n    .toLowerCase()\n    .replace(/[^a-z0-9]+/g, ' ')                         // punctuation and symbols → spaces\n    .trim()\n```\n\nThen it **pads** the result with a space at each end: `\" whats the late fee \"`. Searching for `' age '` (with spaces) now only finds the whole word *age*, never *page* or *stage*, because a word in the padded text always has a space on both sides.\n\n`'NFD'` splits accented letters into a plain letter plus a separate accent mark, and the regex removes the marks. Type `Café RENEWAL!!!` in the box and watch what comes out.",
   "checks": [
    {
     "pane": "js",
     "label": "splitting off accents",
     "test": "/normalize\\(\\s*['\"]NFD['\"]\\s*\\)/",
     "hint": "text.normalize('NFD').replace(/[̀-ͯ]/g, '')"
    },
    {
     "pane": "js",
     "label": "symbols become spaces",
     "test": "/\\[\\^a-z0-9\\]\\+/",
     "hint": ".replace(/[^a-z0-9]+/g, ' ')"
    },
    {
     "pane": "js",
     "label": "padding for whole words",
     "test": "/`\\s\\$\\{[^}]+\\}\\s`/",
     "hint": "return ` ${clean} `;"
    }
   ],
   "quiz": [
    {
     "q": "Why pad the normalized text with spaces?",
     "options": [
      "So looking for \" age \" matches the word age but not page or stage",
      "To make it longer",
      "Spaces make lowercase work"
     ],
     "answer": 0,
     "why": "Every whole word is then surrounded by spaces, which a part of a word never is."
    },
    {
     "q": "What does `'Café'.normalize('NFD').replace(/[̀-ͯ]/g, '')` give?",
     "options": [
      "\"Caf\"",
      "\"Cafe\"",
      "\"CAFE\""
     ],
     "answer": 1,
     "why": "NFD splits é into e plus a combining accent, and the regex removes the accent."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"wrap\">\n  <h1>Ask the library</h1>\n  <input id=\"q\" type=\"search\" placeholder=\"How do I renew a book?\" aria-label=\"Your question\" autocomplete=\"off\">\n  <p id=\"norm\" class=\"norm\"></p>\n  <section id=\"answer\" class=\"answer\" aria-live=\"polite\"></section>\n  <ol id=\"scores\" class=\"scores\"></ol>\n</main>"
   },
   "css": {
    "base": "body { margin: 0; font-family: system-ui, sans-serif; background: #fefce8; color: #422006; }\n.wrap { max-width: 560px; margin: 0 auto; padding: 16px; }\nh1 { margin-top: 0; }\ninput { width: 100%; box-sizing: border-box; padding: 10px; font: inherit; border: 1px solid #d6d3d1; border-radius: 10px; }\n.norm { font: .8rem ui-monospace, Menlo, Consolas, monospace; color: #78716c; white-space: pre; overflow-x: auto; }\n.answer { padding: 12px; background: #fff; border-radius: 10px; min-height: 2em; }\n.answer h2 { margin: 0 0 4px; font-size: 1rem; }\n.answer button { font: inherit; margin: 4px 4px 0 0; padding: 4px 10px; }\n.scores { font-size: .85rem; color: #57534e; }"
   },
   "js": {
    "data": "const FAQ = [\n  { id: 'renew', title: 'Renewing a book', answer: 'Sign in, open My loans and press Renew. You can renew twice unless someone is waiting for it.',\n    keywords: ['renew', 'extend', 'more time', 'keep it longer'] },\n  { id: 'fees', title: 'Late fees', answer: 'Books are 25 cents a day, DVDs $1 a day, up to the price of the item. Children\\'s books have no late fees.',\n    keywords: ['late fee', 'fee', 'overdue', 'how much', '~cost', 'dvd'] },\n  { id: 'card', title: 'Getting a library card', answer: 'Bring a photo ID and proof of address to any branch. Cards are free for residents.',\n    keywords: ['library card', 'sign up', 'join', 'membership', 'new card'] },\n  { id: 'hours', title: 'Opening hours', answer: 'Monday to Saturday 9 to 8, Sunday 1 to 5. Holiday hours are posted a week ahead.',\n    keywords: ['hours', 'open', 'close', 'what time', '~when', 'sunday'] },\n  { id: 'wifi', title: 'Wi-Fi and computers', answer: 'Free Wi-Fi is \"Library-Guest\", no password. Computers can be booked for 2 hours at the front desk.',\n    keywords: ['wifi', 'wi fi', 'internet', 'computer', 'password', 'print'] },\n];\n\nconst qEl = document.getElementById('q');\nconst normEl = document.getElementById('norm');\nconst answerEl = document.getElementById('answer');\nconst scoresEl = document.getElementById('scores');",
    "normalize": "function normalize(text) {\n  const clean = text\n    .normalize('NFD').replace(/[̀-ͯ]/g, '')\n    .toLowerCase()\n    .replace(/[^a-z0-9]+/g, ' ')\n    .trim();\n  return ` ${clean} `;\n}\n\nqEl.addEventListener('input', () => {\n  normEl.textContent = JSON.stringify(normalize(qEl.value));\n});"
   }
  },
  {
   "title": "Stems and keyword scores",
   "body": "**Stemming** trims endings so word forms meet. A tiny stemmer is enough here: *-ies* becomes *-y* (*libraries* → *library*), and a final *-ing*, *-ed* or *-s* comes off (*renewing*, *renewed* → *renew*; *fees* → *fee*), with length limits so short words like *is* and *bus* are left alone. It's applied to **both** the question and every keyword, so the two always meet in the middle, even where a stem isn't a real word.\n\n**Scoring**: each keyword found in the question adds its number of words **plus one**. \"late fee\" (2 words) is worth 3; \"dvd\" (1 word) is worth 2. Keywords marked `~` are **weak** (*when*, *cost*): general words that only nudge, worth 1.\n\nThe keywords are prepared (normalized and stemmed) **once** when the page loads, not on every keystroke. Then each answer is scored and the list is sorted best first.\n\n```svg Each keyword found adds points: words + 1 for normal keywords, 1 for weak ones; the answers are sorted by total\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"10\" width=\"320\" height=\"22\" rx=\"6\" fill=\"#bbf7d0\"/><text x=\"12\" y=\"25\">\"how much\" · 2 words</text><text x=\"318\" y=\"25\" text-anchor=\"end\" font-weight=\"700\">+3</text>\n  <rect x=\"5\" y=\"38\" width=\"320\" height=\"22\" rx=\"6\" fill=\"#bbf7d0\"/><text x=\"12\" y=\"53\">\"overdue\" · 1 word</text><text x=\"318\" y=\"53\" text-anchor=\"end\" font-weight=\"700\">+2</text>\n  <rect x=\"5\" y=\"66\" width=\"320\" height=\"22\" rx=\"6\" fill=\"#fde68a\"/><text x=\"12\" y=\"81\">\"~cost\" · weak</text><text x=\"318\" y=\"81\" text-anchor=\"end\" font-weight=\"700\">+1</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a small stemmer",
     "test": "/function\\s+stem\\s*\\(/",
     "hint": "function stem(word) { ... }"
    },
    {
     "pane": "js",
     "label": "longer phrases score more",
     "test": "/words\\.length\\s*\\+\\s*1/",
     "hint": "points: weak ? 1 : words.length + 1"
    },
    {
     "pane": "js",
     "label": "best match first",
     "test": "/sort\\(\\s*\\(\\s*a\\s*,\\s*b\\s*\\)\\s*=>\\s*b\\.score\\s*-\\s*a\\.score\\s*\\)/",
     "hint": "scored.sort((a, b) => b.score - a.score)"
    }
   ],
   "quiz": [
    {
     "q": "Why stem the keywords as well as the question?",
     "options": [
      "Keywords are always typed wrong",
      "So both are trimmed the same way and still meet, even when the stemmer cuts oddly",
      "It makes the keywords shorter to store"
     ],
     "answer": 1,
     "why": "Matching compares stems to stems; consistency matters more than perfect stems."
    },
    {
     "q": "Why is \"late fee\" worth more than \"fee\"?",
     "options": [
      "A longer phrase is more specific, so it's stronger evidence of what the person meant",
      "It has more letters",
      "Two-word keywords are checked first"
     ],
     "answer": 0,
     "why": "The more specific the match, the more it should count."
    }
   ],
   "session": 0,
   "minutes": 18,
   "js": {
    "score": "function stem(word) {\n  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;\n  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);\n  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);\n  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);\n  return word;\n}\nconst stemAll = (padded) => ` ${padded.trim().split(' ').map(stem).join(' ')} `;\n\nconst PREPARED = FAQ.map((f) => ({\n  ...f,\n  keys: f.keywords.map((k) => {\n    const weak = k.startsWith('~');\n    const words = normalize(k.replace('~', '')).trim().split(' ');\n    return { text: ` ${words.map(stem).join(' ')} `, points: weak ? 1 : words.length + 1 };\n  }),\n}));\n\nfunction rank(question) {\n  const q = stemAll(normalize(question));\n  const scored = PREPARED.map((f) => ({ f, score: f.keys.reduce((s, k) => s + (q.includes(k.text) ? k.points : 0), 0) }));\n  return scored.sort((a, b) => b.score - a.score);\n}\n\nfunction show() {\n  const q = qEl.value;\n  normEl.textContent = JSON.stringify(stemAll(normalize(q)));\n  if (!q.trim()) { answerEl.textContent = ''; scoresEl.replaceChildren(); return; }\n  const ranked = rank(q);\n  const best = ranked[0];\n  answerEl.innerHTML = '';\n  const h = document.createElement('h2');\n  h.textContent = best.f.title;\n  answerEl.append(h, best.f.answer);\n  scoresEl.replaceChildren(...ranked.map((r) => Object.assign(document.createElement('li'), { textContent: `${r.f.title}: ${r.score}` })));\n}\n\nqEl.addEventListener('input', show);"
   }
  },
  {
   "title": "\"I'm not sure\" beats a wrong answer",
   "body": "Type \"do you have parking?\": none of the keywords match, every score is 0, yet the last step still shows the top answer. Confidently wrong is the worst thing a help box can be.\n\nTwo rules fix it:\n\n- A **minimum score** (`MIN_SCORE = 2`, one specific keyword): below it, say \"I'm not sure what you mean\" instead of guessing.\n- If the best two are **close** (within 1 point), the question is ambiguous: show both as buttons and let the person pick.\n\nA **synonym** table also turns common alternatives into the words the keywords use before matching (`fine` and `penalty` → `fee`, `borrow` → `loan`), so the keywords stay short.\n\n```svg Clear winner: answer. Two close scores: ask which. Below the threshold: say you're not sure and offer the nearest topics\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"8\" width=\"320\" height=\"26\" rx=\"6\" fill=\"#bbf7d0\"/><text x=\"12\" y=\"25\">best 5, next 0 → show the answer</text>\n  <rect x=\"5\" y=\"42\" width=\"320\" height=\"26\" rx=\"6\" fill=\"#fde68a\"/><text x=\"12\" y=\"59\">best 3, next 3 → \"Did you mean A or B?\"</text>\n  <rect x=\"5\" y=\"76\" width=\"320\" height=\"26\" rx=\"6\" fill=\"#fecaca\"/><text x=\"12\" y=\"93\">best 0 → \"I'm not sure\" + the topics list</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a minimum score to answer",
     "test": "/MIN_SCORE/",
     "hint": "if (best.score < MIN_SCORE) { ... not sure ... }"
    },
    {
     "pane": "js",
     "label": "spotting a close second",
     "test": "/best\\.score\\s*-\\s*next\\.score\\s*<=\\s*1/",
     "hint": "if (next && best.score - next.score <= 1) { ... ask ... }"
    },
    {
     "pane": "js",
     "label": "synonyms before matching",
     "test": "/const\\s+SYNONYMS\\s*=/",
     "hint": "const SYNONYMS = { fine: 'fee', penalty: 'fee', borrow: 'loan' };"
    }
   ],
   "quiz": [
    {
     "q": "Every topic scores 0 for \"do you have parking?\". What should the help box do?",
     "options": [
      "Show the first topic anyway",
      "Say it isn't sure, and list the topics it can help with",
      "Show nothing at all"
     ],
     "answer": 1,
     "why": "An honest \"I don't know\" with a way forward beats a confident wrong answer."
    },
    {
     "q": "Why ask \"did you mean A or B?\" when the top two scores are close?",
     "options": [
      "The question could reasonably mean either, so the person is better at choosing than a coin flip",
      "Close scores mean the code is broken",
      "To make people type more"
     ],
     "answer": 0,
     "why": "When the evidence is split, hand the choice to the person who knows what they meant."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "score": "function stem(word) {\n  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;\n  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);\n  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);\n  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);\n  return word;\n}\nconst stemAll = (padded) => ` ${padded.trim().split(' ').map(stem).join(' ')} `;\n\nconst PREPARED = FAQ.map((f) => ({\n  ...f,\n  keys: f.keywords.map((k) => {\n    const weak = k.startsWith('~');\n    const words = normalize(k.replace('~', '')).trim().split(' ');\n    return { text: ` ${words.map(stem).join(' ')} `, points: weak ? 1 : words.length + 1 };\n  }),\n}));\n\nfunction rank(question) {\n  const q = stemAll(normalize(question));\n  const scored = PREPARED.map((f) => ({ f, score: f.keys.reduce((s, k) => s + (q.includes(k.text) ? k.points : 0), 0) }));\n  return scored.sort((a, b) => b.score - a.score);\n}",
    "confidence": "const MIN_SCORE = 2;\nconst SYNONYMS = { fine: 'fee', fines: 'fee', penalty: 'fee', borrow: 'loan', borrowed: 'loan', internet: 'wifi', opening: 'open' };\nconst withSynonyms = (padded) => ` ${padded.trim().split(' ').map((w) => SYNONYMS[w] ?? w).join(' ')} `;\n\nfunction showTopic(f) {\n  answerEl.innerHTML = '';\n  const h = document.createElement('h2');\n  h.textContent = f.title;\n  answerEl.append(h, f.answer);\n}\n\nfunction choices(text, list) {\n  answerEl.innerHTML = '';\n  answerEl.append(text, document.createElement('br'), ...list.map((f) => {\n    const b = document.createElement('button');\n    b.textContent = f.title;\n    b.addEventListener('click', () => showTopic(f));\n    return b;\n  }));\n}\n\nfunction show() {\n  const q = qEl.value;\n  const prepared = stemAll(withSynonyms(normalize(q)));\n  normEl.textContent = JSON.stringify(prepared);\n  if (!q.trim()) { answerEl.textContent = ''; scoresEl.replaceChildren(); return; }\n  const ranked = rank(withSynonyms(normalize(q)));\n  const [best, next] = ranked;\n  scoresEl.replaceChildren(...ranked.map((r) => Object.assign(document.createElement('li'), { textContent: `${r.f.title}: ${r.score}` })));\n  if (best.score < MIN_SCORE) return choices('I\\'m not sure what you mean. I can help with:', FAQ);\n  if (next && next.score >= MIN_SCORE && best.score - next.score <= 1) return choices('Did you mean one of these?', [best.f, next.f]);\n  showTopic(best.f);\n}\n\nqEl.addEventListener('input', show);"
   }
  }
 ],
 "finish": "You can match free-typed questions to answers, and know when not to. You learned:\n\n- **Normalizing** with NFD, lowercase, symbol stripping and **space padding**\n- A small **stemmer**, applied to both sides\n- **Keyword scores**: words + 1, **weak** words worth 1, sorted best first\n- A **minimum score**, a **close-second** check, and **synonyms**\n\n### Challenges\n\n1. Add typo tolerance: count a keyword if a question word is one letter away from it.\n2. Log the questions that got \"I'm not sure\", so you can see which keywords are missing.\n3. Show which keywords matched under the answer, the way the Ranked search lesson explains its results.\n\n### Next\n\n**Drawing text on a canvas**: write SuperBook's answers into the sand."
};
