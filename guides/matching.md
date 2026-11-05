---
id: matching
title: Matching questions to answers
blocks-html: page
blocks-css: base
blocks-js: data, normalize, score, confidence
goals: Normalize text so different spellings and accents compare as equal; Match whole words by padding with spaces, so "age" doesn't match "page"; Trim word endings (stemming) so "renewing" finds "renew"; Score answers by keywords, with longer phrases worth more, and pick the best; Say "I'm not sure" below a confidence threshold, and offer close matches instead of guessing
prereqs: The Filtering lists lesson (includes, filter and sort) and the Parsing Markdown lesson (regular expressions)
---

## Session: What did they mean?

## Step: Matching without AI
time: 12
kind: read

A help box answers typed questions like "How do I renew a book?" or "whats the late fee". You can do a surprising amount of this **without** any AI, using the same few steps search engines started with:

1. **Normalize**: make the text plain and predictable. Lowercase, remove accents (`café` → `cafe`), turn punctuation into spaces, squash repeated spaces.
2. **Stem**: trim common endings so word forms meet: *renewing*, *renewed*, *renews* → *renew*.
3. **Score**: each answer has **keywords**. Every keyword found in the question adds points; longer phrases are more specific, so they're worth more.
4. **Decide**: take the highest score, but only if it's high enough. Otherwise say so, and offer the closest few.

```svg A typed question is normalized, stemmed, and scored against each answer's keywords; the best answer wins only if it clears the threshold
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" font-family="sans-serif" font-size="11">
  <rect x="5" y="10" width="320" height="24" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><text x="12" y="26">"Whats the LATE fee for DVDs?!"</text>
  <rect x="5" y="44" width="320" height="24" rx="6" fill="#e0f2fe" stroke="#0284c7"/><text x="12" y="60">" whats the late fee for dvd "   (normalized + stemmed)</text>
  <rect x="5" y="78" width="200" height="24" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="12" y="94">Late fees: "late fee" +3, "dvd" +2</text>
  <rect x="215" y="78" width="110" height="24" rx="6" fill="#fef9c3" stroke="#ca8a04"/><text x="222" y="94">5 ≥ 3 → answer</text>
</svg>
```

This is how SuperBook matches a question to one of its topics. It's predictable (the same question always gets the same answer), it runs instantly with no server, and when it doesn't know, it can say so honestly, which matters more than sounding clever.

## Step: Normalize the text
time: 15

`normalize(text)` does four things in order:

```js
text.normalize('NFD').replace(/[̀-ͯ]/g, '')   // é → e + accent → e
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')                         // punctuation and symbols → spaces
    .trim()
```

Then it **pads** the result with a space at each end: `" whats the late fee "`. Searching for `' age '` (with spaces) now only finds the whole word *age*, never *page* or *stage*, because a word in the padded text always has a space on both sides.

`'NFD'` splits accented letters into a plain letter plus a separate accent mark, and the regex removes the marks. Type `Café RENEWAL!!!` in the box and watch what comes out.

check: js | splitting off accents | /normalize\(\s*['"]NFD['"]\s*\)/ | text.normalize('NFD').replace(/[̀-ͯ]/g, '')
check: js | symbols become spaces | /\[\^a-z0-9\]\+/ | .replace(/[^a-z0-9]+/g, ' ')
check: js | padding for whole words | /`\s\$\{[^}]+\}\s`/ | return ` ${clean} `;

quiz: Why pad the normalized text with spaces?
- [x] So looking for " age " matches the word age but not page or stage
- [ ] To make it longer
- [ ] Spaces make lowercase work
why: Every whole word is then surrounded by spaces, which a part of a word never is.

quiz: What does `'Café'.normalize('NFD').replace(/[̀-ͯ]/g, '')` give?
- [ ] "Caf"
- [x] "Cafe"
- [ ] "CAFE"
why: NFD splits é into e plus a combining accent, and the regex removes the accent.

```html page
<main class="wrap">
  <h1>Ask the library</h1>
  <input id="q" type="search" placeholder="How do I renew a book?" aria-label="Your question" autocomplete="off">
  <p id="norm" class="norm"></p>
  <section id="answer" class="answer" aria-live="polite"></section>
  <ol id="scores" class="scores"></ol>
</main>
```

```css base
body { margin: 0; font-family: system-ui, sans-serif; background: #fefce8; color: #422006; }
.wrap { max-width: 560px; margin: 0 auto; padding: 16px; }
h1 { margin-top: 0; }
input { width: 100%; box-sizing: border-box; padding: 10px; font: inherit; border: 1px solid #d6d3d1; border-radius: 10px; }
.norm { font: .8rem ui-monospace, Menlo, Consolas, monospace; color: #78716c; white-space: pre; overflow-x: auto; }
.answer { padding: 12px; background: #fff; border-radius: 10px; min-height: 2em; }
.answer h2 { margin: 0 0 4px; font-size: 1rem; }
.answer button { font: inherit; margin: 4px 4px 0 0; padding: 4px 10px; }
.scores { font-size: .85rem; color: #57534e; }
```

```js data
const FAQ = [
  { id: 'renew', title: 'Renewing a book', answer: 'Sign in, open My loans and press Renew. You can renew twice unless someone is waiting for it.',
    keywords: ['renew', 'extend', 'more time', 'keep it longer'] },
  { id: 'fees', title: 'Late fees', answer: 'Books are 25 cents a day, DVDs $1 a day, up to the price of the item. Children\'s books have no late fees.',
    keywords: ['late fee', 'fee', 'overdue', 'how much', '~cost', 'dvd'] },
  { id: 'card', title: 'Getting a library card', answer: 'Bring a photo ID and proof of address to any branch. Cards are free for residents.',
    keywords: ['library card', 'sign up', 'join', 'membership', 'new card'] },
  { id: 'hours', title: 'Opening hours', answer: 'Monday to Saturday 9 to 8, Sunday 1 to 5. Holiday hours are posted a week ahead.',
    keywords: ['hours', 'open', 'close', 'what time', '~when', 'sunday'] },
  { id: 'wifi', title: 'Wi-Fi and computers', answer: 'Free Wi-Fi is "Library-Guest", no password. Computers can be booked for 2 hours at the front desk.',
    keywords: ['wifi', 'wi fi', 'internet', 'computer', 'password', 'print'] },
];

const qEl = document.getElementById('q');
const normEl = document.getElementById('norm');
const answerEl = document.getElementById('answer');
const scoresEl = document.getElementById('scores');
```

```js normalize
function normalize(text) {
  const clean = text
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return ` ${clean} `;
}

qEl.addEventListener('input', () => {
  normEl.textContent = JSON.stringify(normalize(qEl.value));
});
```

## Step: Stems and keyword scores
time: 18

**Stemming** trims endings so word forms meet. A tiny stemmer is enough here: *-ies* becomes *-y* (*libraries* → *library*), and a final *-ing*, *-ed* or *-s* comes off (*renewing*, *renewed* → *renew*; *fees* → *fee*), with length limits so short words like *is* and *bus* are left alone. It's applied to **both** the question and every keyword, so the two always meet in the middle, even where a stem isn't a real word.

**Scoring**: each keyword found in the question adds its number of words **plus one**. "late fee" (2 words) is worth 3; "dvd" (1 word) is worth 2. Keywords marked `~` are **weak** (*when*, *cost*): general words that only nudge, worth 1.

The keywords are prepared (normalized and stemmed) **once** when the page loads, not on every keystroke. Then each answer is scored and the list is sorted best first.

```svg Each keyword found adds points: words + 1 for normal keywords, 1 for weak ones; the answers are sorted by total
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="11">
  <rect x="5" y="10" width="320" height="22" rx="6" fill="#bbf7d0"/><text x="12" y="25">"how much" · 2 words</text><text x="318" y="25" text-anchor="end" font-weight="700">+3</text>
  <rect x="5" y="38" width="320" height="22" rx="6" fill="#bbf7d0"/><text x="12" y="53">"overdue" · 1 word</text><text x="318" y="53" text-anchor="end" font-weight="700">+2</text>
  <rect x="5" y="66" width="320" height="22" rx="6" fill="#fde68a"/><text x="12" y="81">"~cost" · weak</text><text x="318" y="81" text-anchor="end" font-weight="700">+1</text>
</svg>
```

check: js | a small stemmer | /function\s+stem\s*\(/ | function stem(word) { ... }
check: js | longer phrases score more | /words\.length\s*\+\s*1/ | points: weak ? 1 : words.length + 1
check: js | best match first | /sort\(\s*\(\s*a\s*,\s*b\s*\)\s*=>\s*b\.score\s*-\s*a\.score\s*\)/ | scored.sort((a, b) => b.score - a.score)

quiz: Why stem the keywords as well as the question?
- [ ] Keywords are always typed wrong
- [x] So both are trimmed the same way and still meet, even when the stemmer cuts oddly
- [ ] It makes the keywords shorter to store
why: Matching compares stems to stems; consistency matters more than perfect stems.

quiz: Why is "late fee" worth more than "fee"?
- [x] A longer phrase is more specific, so it's stronger evidence of what the person meant
- [ ] It has more letters
- [ ] Two-word keywords are checked first
why: The more specific the match, the more it should count.

```js score
function stem(word) {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}
const stemAll = (padded) => ` ${padded.trim().split(' ').map(stem).join(' ')} `;

const PREPARED = FAQ.map((f) => ({
  ...f,
  keys: f.keywords.map((k) => {
    const weak = k.startsWith('~');
    const words = normalize(k.replace('~', '')).trim().split(' ');
    return { text: ` ${words.map(stem).join(' ')} `, points: weak ? 1 : words.length + 1 };
  }),
}));

function rank(question) {
  const q = stemAll(normalize(question));
  const scored = PREPARED.map((f) => ({ f, score: f.keys.reduce((s, k) => s + (q.includes(k.text) ? k.points : 0), 0) }));
  return scored.sort((a, b) => b.score - a.score);
}

function show() {
  const q = qEl.value;
  normEl.textContent = JSON.stringify(stemAll(normalize(q)));
  if (!q.trim()) { answerEl.textContent = ''; scoresEl.replaceChildren(); return; }
  const ranked = rank(q);
  const best = ranked[0];
  answerEl.innerHTML = '';
  const h = document.createElement('h2');
  h.textContent = best.f.title;
  answerEl.append(h, best.f.answer);
  scoresEl.replaceChildren(...ranked.map((r) => Object.assign(document.createElement('li'), { textContent: `${r.f.title}: ${r.score}` })));
}

qEl.addEventListener('input', show);
```

## Step: "I'm not sure" beats a wrong answer
time: 15

Type "do you have parking?": none of the keywords match, every score is 0, yet the last step still shows the top answer. Confidently wrong is the worst thing a help box can be.

Two rules fix it:

- A **minimum score** (`MIN_SCORE = 2`, one specific keyword): below it, say "I'm not sure what you mean" instead of guessing.
- If the best two are **close** (within 1 point), the question is ambiguous: show both as buttons and let the person pick.

A **synonym** table also turns common alternatives into the words the keywords use before matching (`fine` and `penalty` → `fee`, `borrow` → `loan`), so the keywords stay short.

```svg Clear winner: answer. Two close scores: ask which. Below the threshold: say you're not sure and offer the nearest topics
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" font-family="sans-serif" font-size="11">
  <rect x="5" y="8" width="320" height="26" rx="6" fill="#bbf7d0"/><text x="12" y="25">best 5, next 0 → show the answer</text>
  <rect x="5" y="42" width="320" height="26" rx="6" fill="#fde68a"/><text x="12" y="59">best 3, next 3 → "Did you mean A or B?"</text>
  <rect x="5" y="76" width="320" height="26" rx="6" fill="#fecaca"/><text x="12" y="93">best 0 → "I'm not sure" + the topics list</text>
</svg>
```

check: js | a minimum score to answer | /MIN_SCORE/ | if (best.score < MIN_SCORE) { ... not sure ... }
check: js | spotting a close second | /best\.score\s*-\s*next\.score\s*<=\s*1/ | if (next && best.score - next.score <= 1) { ... ask ... }
check: js | synonyms before matching | /const\s+SYNONYMS\s*=/ | const SYNONYMS = { fine: 'fee', penalty: 'fee', borrow: 'loan' };

quiz: Every topic scores 0 for "do you have parking?". What should the help box do?
- [ ] Show the first topic anyway
- [x] Say it isn't sure, and list the topics it can help with
- [ ] Show nothing at all
why: An honest "I don't know" with a way forward beats a confident wrong answer.

quiz: Why ask "did you mean A or B?" when the top two scores are close?
- [x] The question could reasonably mean either, so the person is better at choosing than a coin flip
- [ ] Close scores mean the code is broken
- [ ] To make people type more
why: When the evidence is split, hand the choice to the person who knows what they meant.

```js score
function stem(word) {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}
const stemAll = (padded) => ` ${padded.trim().split(' ').map(stem).join(' ')} `;

const PREPARED = FAQ.map((f) => ({
  ...f,
  keys: f.keywords.map((k) => {
    const weak = k.startsWith('~');
    const words = normalize(k.replace('~', '')).trim().split(' ');
    return { text: ` ${words.map(stem).join(' ')} `, points: weak ? 1 : words.length + 1 };
  }),
}));

function rank(question) {
  const q = stemAll(normalize(question));
  const scored = PREPARED.map((f) => ({ f, score: f.keys.reduce((s, k) => s + (q.includes(k.text) ? k.points : 0), 0) }));
  return scored.sort((a, b) => b.score - a.score);
}
```

```js confidence
const MIN_SCORE = 2;
const SYNONYMS = { fine: 'fee', fines: 'fee', penalty: 'fee', borrow: 'loan', borrowed: 'loan', internet: 'wifi', opening: 'open' };
const withSynonyms = (padded) => ` ${padded.trim().split(' ').map((w) => SYNONYMS[w] ?? w).join(' ')} `;

function showTopic(f) {
  answerEl.innerHTML = '';
  const h = document.createElement('h2');
  h.textContent = f.title;
  answerEl.append(h, f.answer);
}

function choices(text, list) {
  answerEl.innerHTML = '';
  answerEl.append(text, document.createElement('br'), ...list.map((f) => {
    const b = document.createElement('button');
    b.textContent = f.title;
    b.addEventListener('click', () => showTopic(f));
    return b;
  }));
}

function show() {
  const q = qEl.value;
  const prepared = stemAll(withSynonyms(normalize(q)));
  normEl.textContent = JSON.stringify(prepared);
  if (!q.trim()) { answerEl.textContent = ''; scoresEl.replaceChildren(); return; }
  const ranked = rank(withSynonyms(normalize(q)));
  const [best, next] = ranked;
  scoresEl.replaceChildren(...ranked.map((r) => Object.assign(document.createElement('li'), { textContent: `${r.f.title}: ${r.score}` })));
  if (best.score < MIN_SCORE) return choices('I\'m not sure what you mean. I can help with:', FAQ);
  if (next && next.score >= MIN_SCORE && best.score - next.score <= 1) return choices('Did you mean one of these?', [best.f, next.f]);
  showTopic(best.f);
}

qEl.addEventListener('input', show);
```

## Finish

You can match free-typed questions to answers, and know when not to. You learned:

- **Normalizing** with NFD, lowercase, symbol stripping and **space padding**
- A small **stemmer**, applied to both sides
- **Keyword scores**: words + 1, **weak** words worth 1, sorted best first
- A **minimum score**, a **close-second** check, and **synonyms**

### Challenges

1. Add typo tolerance: count a keyword if a question word is one letter away from it.
2. Log the questions that got "I'm not sure", so you can see which keywords are missing.
3. Show which keywords matched under the answer, the way the Ranked search lesson explains its results.

### Next

**Drawing text on a canvas**: write SuperBook's answers into the sand.
