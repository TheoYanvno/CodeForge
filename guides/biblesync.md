---
id: biblesync
title: Reusing the SuperBook Bible data in React
goals: Share one reference list between projects and keep copies identical with a sync test; Fetch the same chapter in several translations with a cache and clear errors; Line translations up verse by verse and save highlights per verse
prereqs: React basics; Fetching data in React
---

## Session: One Bible, many projects

## Step: One reference list, kept in sync
kind: read
time: 12

Every Bible project of mine uses [SuperBook](https://theoyanvno.github.io/SuperBook/) as its reference: the Orthodox canon of 79 books, in the same order, with the same labels ("1 Kingdoms (1 Samuel)"). AbramsTree keeps a copy of that list, and a test makes sure the copy never drifts:

```js
const SUPERBOOK = new URL('../../superbook/src/books.js', import.meta.url);

test('matches SuperBook exactly (when SuperBook is checked out next to this repo)', { skip: !existsSync(SUPERBOOK) }, () => {
  const body = readFileSync(SUPERBOOK, 'utf8').match(/export const BIBLE = \[([\s\S]*?)\n\];/)[1];
  const theirs = Function(`return [${body}]`)();
  assert.deepStrictEqual(BIBLE, theirs);
});
```

The test is **skipped**, not failed, on a computer that doesn't have SuperBook checked out next to it. Links open SuperBook at the chapter: `superbookLink('1 John', 4)` → `…/SuperBook/?book=1%20John&chapter=4`.

```svg Projects copy SuperBook's list; a test in each fails the moment a copy differs
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 110" font-family="sans-serif" font-size="12">
  <rect width="480" height="110" fill="#fff"/>
  <rect x="180" y="10" width="120" height="30" rx="6" fill="#e0e7ff"/><text x="240" y="29" text-anchor="middle">SuperBook BIBLE</text>
  <rect x="20" y="70" width="120" height="30" rx="6" fill="#dcfce7"/><text x="80" y="89" text-anchor="middle">AbramsTree</text>
  <rect x="180" y="70" width="120" height="30" rx="6" fill="#dcfce7"/><text x="240" y="89" text-anchor="middle">Colors of Eden</text>
  <rect x="340" y="70" width="120" height="30" rx="6" fill="#dcfce7"/><text x="400" y="89" text-anchor="middle">future projects</text>
  <path d="M240 40 L80 70 M240 40 V70 M240 40 L400 70" stroke="#374151" stroke-dasharray="4 3"/><text x="300" y="58">sync test</text>
</svg>
```

quiz: Why skip the sync test when SuperBook isn't checked out, instead of failing it?
- [x] The test can only compare when both projects are present; a missing neighbor isn't a bug in this project
- [ ] Skipped tests run faster
- [ ] SuperBook is private
why: Fail on real differences; skip when the comparison can't be made.

## Step: Several translations, cached
kind: read
time: 15

[bible-api.com](https://bible-api.com/) serves public-domain translations: the World English Bible (`web`), King James (`kjv`), American Standard (`asv`), Douay-Rheims (`dra`), Young's Literal (`ylt`) and Bible in Basic English (`bbe`). One fetch per book, chapter and translation, kept in a Map:

```js
export function loadChapter(book, chapter, translation, fetchFn = globalThis.fetch) {
  const key = `${book} ${chapter} ${translation}`;
  if (!cache.has(key)) {
    const url = `https://bible-api.com/${encodeURIComponent(`${book} ${chapter}`)}?translation=${translation}`;
    cache.set(key, fetchFn(url).then(async (r) => {
      if (r.status === 429) throw new Error('The Bible text service is busy. Wait a minute and try again.');
      if (r.status === 404) throw new Error(`${book} ${chapter} isn't in the ${translationById(translation)?.name ?? translation}.`);
      if (!r.ok) throw new Error(`The Bible text service answered ${r.status}. Try again later.`);
      const data = await r.json();
      return (data.verses ?? []).map((v) => ({ verse: v.verse, text: v.text.replace(/\s+/g, ' ').trim() }));
    }).catch((e) => { cache.delete(key); throw e; }));
  }
  return cache.get(key);
}
```

The cache stores the **promise**, so two components asking at once share one request. A failure removes it, so the next try really asks again. Not every translation has the deuterocanonical books, so a 404 explains which translation is missing the chapter.

```svg The cache holds promises: a second request for the same chapter gets the same promise
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 90" font-family="sans-serif" font-size="12">
  <rect width="480" height="90" fill="#fff"/>
  <rect x="10" y="10" width="140" height="26" rx="5" fill="#dbeafe"/><text x="18" y="27">John 3 kjv (first)</text>
  <rect x="10" y="50" width="140" height="26" rx="5" fill="#dbeafe"/><text x="18" y="67">John 3 kjv (again)</text>
  <rect x="210" y="28" width="120" height="30" rx="6" fill="#fef3c7"/><text x="270" y="47" text-anchor="middle">one promise</text>
  <rect x="370" y="28" width="100" height="30" rx="6" fill="#dcfce7"/><text x="420" y="47" text-anchor="middle">one request</text>
  <path d="M150 23 L210 40 M150 63 L210 46 M330 43 H370" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why cache the promise instead of waiting and caching the result?
- [ ] Promises are smaller
- [x] Two requests made at the same moment share the one fetch instead of starting two
- [ ] Results can't be stored in a Map
why: Caching the pending work deduplicates requests in flight.

## Step: Side by side, verse by verse, with highlights
kind: read
time: 12

Translations don't always have the same verses, so line them up by **verse number**, leaving a blank where one is missing:

```js
export function sideBySide(chapters) {
  const verses = [...new Set(chapters.flatMap((c) => c.map((v) => v.verse)))].sort((a, b) => a - b);
  return verses.map((verse) => ({ verse, texts: chapters.map((c) => c.find((v) => v.verse === verse)?.text ?? '') }));
}
```

Highlights are a plain object saved in `localStorage`, keyed like `"John 3:16"`; tapping a verse toggles it:

```js
export const verseKey = (book, chapter, verse) => `${book} ${chapter}:${verse}`;
export function toggleHighlight(highlights, key) {
  const next = { ...highlights };
  if (next[key]) delete next[key]; else next[key] = true;
  return next;
}
```

```svg Rows by verse number; a translation without a verse leaves its cell empty
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 100" font-family="sans-serif" font-size="12">
  <rect width="460" height="100" fill="#fff"/>
  <text x="10" y="20" font-weight="bold">#</text><text x="40" y="20" font-weight="bold">WEB</text><text x="250" y="20" font-weight="bold">KJV</text>
  <text x="10" y="45">1</text><text x="40" y="45">In the beginning…</text><text x="250" y="45">In the beginning…</text>
  <rect x="5" y="52" width="450" height="22" fill="#fbefc9"/><text x="10" y="67">2</text><text x="40" y="67">The earth was…</text><text x="250" y="67">And the earth was…</text>
  <text x="300" y="92" fill="#6b7280">highlighted row</text>
</svg>
```

quiz: Why line translations up by verse number instead of by position in the list?
- [x] A translation may leave out or number verses differently, so positions wouldn't match
- [ ] Positions are slower
- [ ] Verse numbers are strings
why: The verse number is the shared key between translations.

## Finish

You can keep a shared reference identical across projects, fetch translations with a promise cache and clear errors, and line them up with highlights.

### Challenges

1. Add a third column for a third translation.
2. Export your highlights as a list of references.
3. Write a test that sideBySide fills a missing verse with an empty string.
