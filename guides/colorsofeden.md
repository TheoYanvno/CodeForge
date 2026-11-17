---
id: colorsofeden
title: Colors of Eden (coloring pages in Python + JS)
goals: Fetch text from a public API with a disk cache and an offline fallback; Choose what to draw by counting words, with weights and a verse picked to match; Draw printable line art as SVG from code, with closed shapes and a seeded random generator so a page never changes; Use real drawings by tracing small images into sharp vector outlines; Keep a Python and a JavaScript version in step with tests that compare them; Print exact US Letter pages and multi-page booklets from the browser
prereqs: Python basics (functions, dictionaries, dataclasses); JavaScript basics (functions, arrays, template strings)
---

## Session: From a chapter to a plan

## Step: What Colors of Eden does
kind: read
time: 12

In this guide you'll rebuild my [Colors of Eden](https://github.com/TheoYanvno/colors-of-eden): pick any book and chapter of the Orthodox Bible and it makes a printable **coloring page** with a verse on a ribbon. Psalm 23 gets sheep and still waters; Daniel 6 gets a lion.

It exists twice, on purpose:

- a **Python command line**: `python -m coe page Psalms 23` saves `out/psalms-23.svg`
- a **web page** (React, on GitHub Pages) that draws the same page in the browser, prints it, and saves a PDF or SVG

```svg The pipeline: get the chapter's text, plan what to draw from its words, draw the page as SVG, then print or save it
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120" font-family="sans-serif" font-size="12">
  <rect width="560" height="120" fill="#ffffff"/>
  <rect x="5" y="35" width="120" height="55" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="65" y="58" text-anchor="middle" font-weight="bold">text</text><text x="65" y="76" text-anchor="middle">bible-api + cache</text>
  <rect x="150" y="35" width="120" height="55" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="210" y="58" text-anchor="middle" font-weight="bold">plan</text><text x="210" y="76" text-anchor="middle">words → motifs</text>
  <rect x="295" y="35" width="120" height="55" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="355" y="58" text-anchor="middle" font-weight="bold">draw</text><text x="355" y="76" text-anchor="middle">SVG line art</text>
  <rect x="440" y="35" width="115" height="55" rx="8" fill="#fce7f3" stroke="#db2777"/><text x="497" y="58" text-anchor="middle" font-weight="bold">print</text><text x="497" y="76" text-anchor="middle">Letter, PDF, booklet</text>
  <path d="M125 62 H146 M270 62 H291 M415 62 H436" stroke="#374151" stroke-width="2"/>
</svg>
```

### The Bible it uses

Every Bible project of mine uses the same reference: [SuperBook](https://theoyanvno.github.io/SuperBook/). That means the **Eastern Orthodox canon**: 79 books, with Tobit, Judith, the Maccabees, Wisdom and Sirach, in Orthodox order, and labels like "1 Kingdoms (1 Samuel)".

`coe/books.py` holds the list as `(api id, chapters, label)`. One rule keeps the two projects from drifting apart: a test reads SuperBook's `src/books.js` and checks that the lists are identical:

```python
@unittest.skipUnless(SRC.exists(), "SuperBook is not checked out next to Colors of Eden")
class MatchesSuperBook(unittest.TestCase):
    def test_same_books_same_order_same_labels(self):
        body = re.search(r"export const BIBLE = \[(.*?)\n\];", SRC.read_text(), re.S).group(1)
        theirs = [(b[0], b[1], b[2] if len(b) > 2 else b[0]) for b in ast.literal_eval("[" + body + "]")]
        self.assertEqual(BIBLE, theirs)
```

`ast.literal_eval` safely reads the JavaScript array, because a list of strings and numbers looks the same in both languages.

quiz: Why does a test compare the book list with SuperBook's?
- [ ] Python can't store 79 books
- [x] Two projects share one reference, and the test fails the moment their lists drift apart
- [ ] To download SuperBook
why: A copy of shared data is only safe if something checks it still matches.

quiz: Why use ast.literal_eval instead of eval on the JavaScript list?
- [ ] It's faster
- [x] literal_eval only accepts plain values like strings, numbers and lists, so it can't run code
- [ ] eval doesn't work on lists
why: Never eval text from a file. literal_eval reads data without executing anything.

## Step: Getting the text: cache, fallback and clear errors
kind: read
time: 15

The text is the **World English Bible**, a public-domain translation, from [bible-api.com](https://bible-api.com/), the same source SuperBook reads. `coe/text.py` fetches a chapter once and keeps it:

```python
def load_chapter(book, chapter, cache=Path(".coe-cache"), get=urllib_get):
    name, n = check(book, chapter)                 # "psalm" → "Psalms", and 1..150
    api_ref = f"{API_ID[name]} {n}"
    cached = cache / f"{api_ref.replace(' ', '_')}.json"
    if cached.is_file():
        data = json.loads(cached.read_text(encoding="utf-8"))
        return Chapter(name, n, [(v, t) for v, t in data["verses"]])
    try:
        body = json.loads(get(API.format(ref=urllib.parse.quote(api_ref.lower()))))
        verses = [(int(v["verse"]), " ".join(v["text"].split())) for v in body["verses"] if int(v["chapter"]) == n]
    except Exception as e:
        if ref in BUNDLED:
            return Chapter(name, n, list(enumerate(BUNDLED[ref], start=1)))
        raise ConnectionError(f"Couldn't get {ref} ({e}). Check your internet connection and try again.") from None
    cached.write_text(json.dumps({"verses": verses}), encoding="utf-8")
    return Chapter(name, n, verses)
```

- **A disk cache**: each chapter is downloaded once, then read from `.coe-cache/` (which is in `.gitignore`).
- **`get=urllib_get` as a parameter**: tests pass a fake `get`, so they never touch the internet.
- **A bundled fallback**: Genesis 1 and Psalm 23 ship inside the code, so the app always draws something offline.
- **`" ".join(text.split())`** squashes the API's extra spaces and new lines into single spaces.
- **`encoding="utf-8"` every time**: on Windows the default encoding isn't UTF-8, and curly quotes in the text would break.

### The browser does the same

The web version keeps fetched chapters in a `Map` for the visit, uses the same bundled chapters, and politely retries when the free API answers **429 Too Many Requests** (it allows about 15 chapters every 30 seconds), waiting as long as the `Retry-After` header asks. That's what lets a 20-page booklet finish instead of failing halfway.

```svg Where a chapter comes from: the cache if it's there, else the API (then saved to the cache), else the bundled copy, else a clear error
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120" font-family="sans-serif" font-size="12">
  <rect width="560" height="120" fill="#ffffff"/>
  <rect x="5" y="40" width="120" height="45" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="65" y="67" text-anchor="middle">1. cache file</text>
  <rect x="150" y="40" width="120" height="45" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="210" y="61" text-anchor="middle">2. bible-api.com</text><text x="210" y="77" text-anchor="middle">(then cache it)</text>
  <rect x="295" y="40" width="120" height="45" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="355" y="61" text-anchor="middle">3. bundled copy</text><text x="355" y="77" text-anchor="middle">Gen 1, Ps 23</text>
  <rect x="440" y="40" width="115" height="45" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="497" y="61" text-anchor="middle">4. clear error</text><text x="497" y="77" text-anchor="middle">"check internet"</text>
  <text x="137" y="30" text-anchor="middle">miss</text><text x="282" y="30" text-anchor="middle">offline</text><text x="427" y="30" text-anchor="middle">not bundled</text>
  <path d="M125 62 H146 M270 62 H291 M415 62 H436" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why does load_chapter take get= as a parameter?
- [ ] urllib requires it
- [x] So tests can pass a fake that returns sample JSON, and never call the real API
- [ ] To support several APIs at once
why: Injecting the network call makes the code testable offline and fast.

quiz: What does the bundled copy of Psalm 23 give the app?
- [x] A page it can always draw, even with no internet
- [ ] A faster download
- [ ] A different translation
why: A small offline fallback keeps the app useful and the tests independent of the network.

## Step: Planning a page from words
kind: read
time: 18

`coe/scenes.py` decides what to draw by counting words. Each **motif** has words that suggest it:

```python
MOTIF_WORDS = {
    "sun": ("sun", "light", "day", "morning", "shine", "bright"),
    "waves": ("sea", "seas", "waters", "water", "deep", "flood", "river"),
    "sheep": ("sheep", "lamb", "lambs", "flock", "shepherd", "shepherds"),
    "dove": ("dove", "spirit", "bird", "birds", "wings"),
    "crown": ("king", "kings", "crown", "throne", "kingdom"),
    # … tree, flowers, fish, boat, lamp, cup, heart, mountains, path …
}
WEIGHT = {"sheep": 3, "dove": 3, "fish": 3, "boat": 3, "crown": 3, "lamp": 2, "cup": 2}
```

```python
def motif_counts(text):
    words = Counter(WORD.findall(text.lower()))        # WORD = re.compile(r"[a-z]+")
    counts = Counter()
    for motif, cues in MOTIF_WORDS.items():
        n = sum(words[w] for w in cues)
        if n:
            counts[motif] = n * WEIGHT.get(motif, 1)
    return counts
```

- **`Counter`** counts every word in the chapter once; looking up a word that isn't there gives 0.
- **Weights**: "day" and "way" appear everywhere, but one "shepherd" says much more about a chapter, so specific things count three times.
- The top five motifs become the plan, split into **background** (sun, moon, stars, clouds, waves, mountains, path) and **foreground** (things in front).
- Two safety rules: there's always something in front to color, and always some ground behind.

### Picking the verse

The verse on the ribbon is the **short** verse (160 characters or less) that mentions the most chosen motifs, so the words match the picture. For Psalm 23 that's verse 2: *He makes me lie down in green pastures. He leads me beside still waters.*

```svg Counting words: the chapter's words are counted once, each motif adds up its cue words times its weight, and the top motifs become the plan
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 130" font-family="sans-serif" font-size="12">
  <rect width="560" height="130" fill="#ffffff"/>
  <rect x="5" y="20" width="150" height="90" rx="8" fill="#f3f4f6" stroke="#6b7280"/><text x="80" y="42" text-anchor="middle" font-weight="bold">Psalm 23 words</text><text x="80" y="62" text-anchor="middle">shepherd 1, cup 1</text><text x="80" y="78" text-anchor="middle">waters 1, paths 1</text><text x="80" y="94" text-anchor="middle">pastures 1, table 1</text>
  <rect x="200" y="20" width="160" height="90" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="280" y="42" text-anchor="middle" font-weight="bold">× weight</text><text x="280" y="62" text-anchor="middle">sheep 1 × 3 = 3</text><text x="280" y="78" text-anchor="middle">cup 2 × 2 = 4</text><text x="280" y="94" text-anchor="middle">waves 1, path 1 …</text>
  <rect x="405" y="20" width="150" height="90" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="480" y="42" text-anchor="middle" font-weight="bold">plan</text><text x="480" y="62" text-anchor="middle">behind: path, waves</text><text x="480" y="78" text-anchor="middle">front: cup, sheep,</text><text x="480" y="94" text-anchor="middle">flowers</text>
  <path d="M155 65 H196 M360 65 H401" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why does "shepherd" count three times as much as "day"?
- [ ] Shepherd is a longer word
- [x] A specific thing says much more about a chapter than a common word, so it gets a higher weight
- [ ] Counter counts long words more
why: Weighting is a simple way to make a word count reflect meaning, the same idea as ranking search results.

quiz: How is the verse on the ribbon chosen?
- [ ] Always verse 1
- [ ] The longest verse
- [x] The short verse that mentions the most motifs in the plan
why: The ribbon should fit and should match what's drawn, so length is capped and matching motifs score.

## Session: Drawing, pictures, two languages and printing

## Step: Line art in SVG, drawn from code
kind: read
time: 20

A coloring page needs black outlines and white areas a child can fill. `coe/art.py` draws one as an **SVG** with a view box of 850 × 1100, the shape of US Letter (8.5 × 11 inches):

```python
def shape(d, fill="#fff", width=4.5):
    return (f'<path d="{d}" fill="{fill}" stroke="#111" stroke-width="{width}" '
            f'stroke-linejoin="round" stroke-linecap="round"/>')
```

- **Every shape is a closed outline with a white fill.** Shapes in front cover the lines behind them, so every area is a closed space to color.
- **Thinner texture lines** (bark, wool, ripples) add detail without boxing in new areas.
- **Layers** are drawn back to front: sky, mountains, hills, path, water or meadow, then up to three things in front, a double frame, and the verse on a ribbon.

### Curves from a little math

A cloud, a tree's leaves and a sheep's wool are all the same idea: arcs around an ellipse.

```python
def scallop(cx, cy, rx, ry, n, bulge=0.6):
    pts = [(cx + rx * math.cos(2 * math.pi * k / n), cy + ry * math.sin(2 * math.pi * k / n)) for k in range(n)]
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f} "
    for k in range(n):
        (x1, y1), (x2, y2) = pts[k], pts[(k + 1) % n]
        r = math.hypot(x2 - x1, y2 - y1) * bulge
        d += f"A{r:.1f} {r:.1f} 0 0 1 {x2:.1f} {y2:.1f} "
    return d + "Z"
```

`n` points around an ellipse, joined by SVG arc commands (`A`), and `Z` closes the path.

### The same page every time

Hills and clouds vary a little, from a **seeded** random generator: `random.Random(plan.reference)`. Seeded with "Psalms 23", it gives the same numbers every run, so a page never changes between printing it and printing it again, and tests can compare outputs.

```svg Back to front: sky and clouds, mountains and hills, the meadow or water, things in front, then the frame and the verse ribbon on top
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 150" font-family="sans-serif" font-size="12">
  <rect width="560" height="150" fill="#ffffff"/>
  <rect x="20" y="10" width="200" height="130" rx="12" fill="#fff" stroke="#111" stroke-width="4"/>
  <circle cx="60" cy="40" r="14" fill="#fff" stroke="#111" stroke-width="2.5"/>
  <path d="M20 95 Q70 60 120 90 T220 85 V140 H20 Z" fill="#fff" stroke="#111" stroke-width="2.5"/>
  <path d="M20 115 Q120 100 220 118 V140 H20 Z" fill="#fff" stroke="#111" stroke-width="2.5"/>
  <ellipse cx="140" cy="108" rx="22" ry="14" fill="#fff" stroke="#111" stroke-width="2.5"/>
  <text x="250" y="30">1. sky: sun, moon, stars, clouds</text><text x="250" y="52">2. mountains and hills</text><text x="250" y="74">3. path, then water or meadow</text><text x="250" y="96">4. up to three things in front</text><text x="250" y="118">5. frame and verse ribbon on top</text>
</svg>
```

quiz: Why does every shape have a white fill as well as a black outline?
- [ ] White ink is cheaper
- [x] Shapes in front cover the lines behind them, so every area stays a closed space to color
- [ ] SVG requires a fill
why: Painter's order with white fills is how overlapping line art stays clean.

quiz: Why seed the random generator with the chapter's reference?
- [x] The same chapter always draws the same page, so prints match and tests can compare output
- [ ] Seeding makes random numbers more random
- [ ] Python requires a seed
why: A seed makes "random" repeatable, which is what you want for anything you test or reprint.

## Step: Real drawings: tracing pictures into sharp outlines
kind: read
time: 15

Code can draw sheep and clouds, but a lion or a Roman soldier is better drawn by hand. Colors of Eden also has **60 drawings** of animals, places and people of the Middle East. They came as three small picture sheets, so each drawing was only about 225 pixels wide: printed on a whole page, the pixels would show.

`tools/trace_pictures.py` turns each one into a **vector** drawing:

1. Find the 20 panels on a sheet by the **white gaps** between them.
2. Erase the printed name above each drawing, but only the letters: a component is erased only if it sits entirely inside the name's box, so horns and tails reaching up beside it stay whole.
3. Enlarge it 4× and **trace** it with [potrace](https://potrace.sourceforge.net/), which turns black pixels into smooth curves.
4. Save it as `coe/pictures/<kind>/<name>.svg`, plus its size in `catalog.json`.

On Windows the tool uses `potrace.dll` if it's installed, or `potracer`, a pure-Python copy of potrace that installs with `pip`.

### Choosing a picture

`catalog.json` lists the words that choose each drawing: `lion, lions, lioness` for the lion, `pharaoh` for the Egyptian man, `egypt` for the pyramids. A chapter has to name a drawing **at least three times**, so one passing mention doesn't take over the page. Daniel 6 says "lions" many times, so its page is the lion, with verse 16: *…cast him into the den of lions.* Chapters that name none keep the page drawn in code, and a **Picture** menu lets you pick any drawing yourself.

```svg Tracing: a small pixel drawing is enlarged and traced into curves, which stay sharp printed on a whole page
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120" font-family="sans-serif" font-size="12">
  <rect width="560" height="120" fill="#ffffff"/>
  <g transform="translate(20 25)"><rect width="70" height="70" fill="#fff" stroke="#9ca3af"/><path d="M10 50 h10 v-10 h10 v-10 h10 v10 h10 v10 h10 v10 H10 Z" fill="#111"/></g>
  <text x="55" y="112" text-anchor="middle">225 px, blocky</text>
  <path d="M110 60 H160" stroke="#374151" stroke-width="2"/><text x="135" y="50" text-anchor="middle">×4 + potrace</text>
  <g transform="translate(180 25)"><rect width="70" height="70" fill="#fff" stroke="#9ca3af"/><path d="M10 60 Q35 15 60 60 Z" fill="#111"/></g>
  <text x="215" y="112" text-anchor="middle">smooth curves</text>
  <text x="290" y="45">Vector outlines scale to any size,</text><text x="290" y="65">so a 225-pixel drawing prints</text><text x="290" y="85">sharp on a whole Letter page.</text>
</svg>
```

quiz: Why trace the drawings instead of putting the small images on the page?
- [ ] SVG can't hold images
- [x] At 225 pixels wide they'd look blocky printed full page; traced curves stay sharp at any size
- [ ] Tracing makes the files smaller than any image
why: Vector shapes are math, not pixels, so they scale without losing quality.

quiz: Why must a chapter name a drawing at least three times?
- [x] So one passing mention doesn't replace a page that's about something else
- [ ] Because the catalog only stores three words
- [ ] To make the page load faster
why: A threshold is a simple way to require that a chapter is really about the thing.

## Step: One app in two languages, kept identical by tests
kind: read
time: 15

The planner and the drawings exist in Python (`coe/`) and JavaScript (`web/src/`). Two copies of the same logic will drift apart unless something checks them. So the web page's tests **run the Python version** and compare:

```js
test('the page plan matches the Python version for the chapters that ship with it', () => {
  for (const ref of Object.keys(BUNDLED)) {
    const js = planPage(ref, verses(ref));
    const py = JSON.parse(execFileSync(PY, ['-c', `
from coe.scenes import plan_page
...
print(json.dumps({"motifs": p.motifs, "verse": list(p.verse), "picture": p.picture}))`]));
    assert.deepEqual({ motifs: js.motifs, verse: js.verse, picture: js.picture }, py, ref);
  }
});
```

A second test draws Daniel 6's picture page in both languages and checks the two SVG strings are **exactly equal**, character for character.

### Small differences that break "exactly equal"

- **Number formatting.** Python's `850 / 2` prints `425.0`; JavaScript prints `425`. Use `850 // 2` in Python, or one shared formatter.
- **Rounding.** Format with one function in each language (`f"{n:.1f}"` and `toFixed(1)`) and test them side by side.
- **The Python command.** Windows has `python`, macOS and Linux have `python3`, so the test picks one: `process.platform === 'win32' ? 'python' : 'python3'`.

```svg Two implementations, one truth: the JavaScript tests run the Python version and compare plans and whole pages, so the two can't drift apart
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120" font-family="sans-serif" font-size="12">
  <rect width="560" height="120" fill="#ffffff"/>
  <rect x="10" y="30" width="150" height="60" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="85" y="56" text-anchor="middle" font-weight="bold">coe/ (Python)</text><text x="85" y="74" text-anchor="middle">plan + draw</text>
  <rect x="400" y="30" width="150" height="60" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="475" y="56" text-anchor="middle" font-weight="bold">web/src (JS)</text><text x="475" y="74" text-anchor="middle">plan + draw</text>
  <rect x="210" y="35" width="140" height="50" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="280" y="57" text-anchor="middle" font-weight="bold">npm test</text><text x="280" y="74" text-anchor="middle">same plan? same SVG?</text>
  <path d="M160 60 H206 M350 60 H396" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why do the JavaScript tests run the Python code?
- [ ] To make the tests slower
- [x] To prove both versions make the same plan and the same page, so the two copies can't silently drift apart
- [ ] Because JavaScript can't draw SVG
why: When logic exists twice, a comparison test is what keeps "the same app" true.

quiz: Why does Python write 850 // 2 instead of 850 / 2 for the page's center?
- [ ] // is faster
- [x] 850 / 2 prints 425.0 while JavaScript prints 425; // gives 425 in both, so the SVG text matches
- [ ] / is not allowed in f-strings
why: Tiny formatting differences matter when you compare output character for character.

## Step: Printing exact pages and booklets
kind: read
time: 15

A coloring page has to print at exactly US Letter size, with no browser margins and none of the page's buttons.

```css
@media print {
  @page { size: letter; margin: 0; }
  .no-print { display: none !important; }
  .sheet { width: 8.5in; height: 11in; break-after: page; }
}
```

- **`@page { size: letter; margin: 0 }`** sets the paper and removes the browser's margins.
- **`.no-print`** hides the controls, header and footer.
- **`width: 8.5in; height: 11in`** makes each sheet exactly one page, and **`break-after: page`** starts the next sheet on a new page.
- The SVG itself says `width="8.5in" height="11in"`, so it prints at real size.

To save a PDF, people choose **Save as PDF** in the print window. No PDF library needed.

### Booklets, and why ids must be unique

A booklet prints up to 20 chapters in a row as one document. Each page clips its drawing to the frame with a `<clipPath id="…">`. Twenty pages with the same `id="pic"` would all use the first page's clip, because ids must be unique in a document. So every page's clip gets its own id from its reference: `pic-psalms-23`, `pic-psalms-24`.

### On Windows, in VS Code

The repo has VS Code tasks (**Terminal → Run Task**) to install everything, start the page, run both test suites and draw a page:

```text
npm install
npm start                      # http://localhost:8000
npm test                       # web tests (they run Python too)
python -m unittest             # Python tests
python -m coe page Daniel 6    # out/daniel-6.svg
```

### Explain it in an interview

1. **What:** "Coloring pages from any chapter of the Orthodox Bible, in Python and in a React page, printable at exact Letter size."
2. **How:** "Text from a public API with a disk cache and offline fallback; a planner that counts weighted words to choose motifs and a matching verse; line art drawn as SVG from closed shapes with a seeded generator; 60 hand drawings traced into vectors."
3. **Decisions:** "Two implementations kept identical by tests that compare whole pages; unique clip-path ids so booklets print correctly; politely retrying when the free API asks me to slow down."
4. **Next:** "More drawings and words, and coloring in the browser before printing."

quiz: Why does every booklet page get its own clipPath id?
- [ ] Browsers limit how many clips a page has
- [x] Ids must be unique in a document; with twenty identical ids every page would use the first page's clip
- [ ] To print faster
why: Several SVGs inlined in one HTML page share one id namespace, so repeated ids collide.

quiz: How does the page make a PDF?
- [ ] With a PDF library in JavaScript
- [x] The print styles make each sheet exactly one Letter page, and the person picks Save as PDF in the print window
- [ ] It uploads the SVG to a server
why: Good print CSS turns the browser's own print dialog into a PDF maker, with nothing extra to install.

## Finish

You rebuilt a project that runs in two languages and prints real pages. You learned:

- Keeping a shared reference (**SuperBook's canon**) in sync with a test
- Fetching with a **disk cache**, an **offline fallback** and **polite retries**
- Planning with **weighted word counts** and a matching verse
- Drawing **SVG line art** from closed shapes, in **painter's order**, with a **seeded** random generator
- **Tracing** small drawings into sharp vector outlines
- Keeping **Python and JavaScript** identical with comparison tests
- **Print CSS** for exact Letter pages and booklets, and unique **SVG ids**

### Challenges

1. Add a new motif, `star of Bethlehem`, with its own words and drawing, in both languages, and make the comparison tests pass.
2. Give the 11 drawings that have no words yet a few each (Bedouin woman, Roman child…), and check which chapters now choose them.
3. Add a "color it in" mode to the web page: click an area to fill it with the chosen color before printing.
