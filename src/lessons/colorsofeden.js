// Built from guides/colorsofeden.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "colorsofeden",
 "title": "Colors of Eden (coloring pages in Python + JS)",
 "goals": [
  "Fetch text from a public API with a disk cache and an offline fallback",
  "Choose what to draw by counting words, with weights and a verse picked to match",
  "Draw printable line art as SVG from code, with closed shapes and a seeded random generator so a page never changes",
  "Use real drawings by tracing small images into sharp vector outlines",
  "Keep a Python and a JavaScript version in step with tests that compare them",
  "Print exact US Letter pages and multi-page booklets from the browser"
 ],
 "prereqs": [
  "Python basics (functions, dictionaries, dataclasses)",
  "JavaScript basics (functions, arrays, template strings)"
 ],
 "sessions": [
  {
   "title": "From a chapter to a plan",
   "from": 0,
   "to": 2
  },
  {
   "title": "Drawing, pictures, two languages and printing",
   "from": 3,
   "to": 6
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "What Colors of Eden does",
   "body": "In this guide you'll rebuild my [Colors of Eden](https://github.com/TheoYanvno/colors-of-eden): pick any book and chapter of the Orthodox Bible and it makes a printable **coloring page** with a verse on a ribbon. Psalm 23 gets sheep and still waters; Daniel 6 gets a lion.\n\nIt exists twice, on purpose:\n\n- a **Python command line**: `python -m coe page Psalms 23` saves `out/psalms-23.svg`\n- a **web page** (React, on GitHub Pages) that draws the same page in the browser, prints it, and saves a PDF or SVG\n\n```svg The pipeline: get the chapter's text, plan what to draw from its words, draw the page as SVG, then print or save it\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"120\" fill=\"#ffffff\"/>\n  <rect x=\"5\" y=\"35\" width=\"120\" height=\"55\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"65\" y=\"58\" text-anchor=\"middle\" font-weight=\"bold\">text</text><text x=\"65\" y=\"76\" text-anchor=\"middle\">bible-api + cache</text>\n  <rect x=\"150\" y=\"35\" width=\"120\" height=\"55\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"210\" y=\"58\" text-anchor=\"middle\" font-weight=\"bold\">plan</text><text x=\"210\" y=\"76\" text-anchor=\"middle\">words → motifs</text>\n  <rect x=\"295\" y=\"35\" width=\"120\" height=\"55\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"355\" y=\"58\" text-anchor=\"middle\" font-weight=\"bold\">draw</text><text x=\"355\" y=\"76\" text-anchor=\"middle\">SVG line art</text>\n  <rect x=\"440\" y=\"35\" width=\"115\" height=\"55\" rx=\"8\" fill=\"#fce7f3\" stroke=\"#db2777\"/><text x=\"497\" y=\"58\" text-anchor=\"middle\" font-weight=\"bold\">print</text><text x=\"497\" y=\"76\" text-anchor=\"middle\">Letter, PDF, booklet</text>\n  <path d=\"M125 62 H146 M270 62 H291 M415 62 H436\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```\n\n### The Bible it uses\n\nEvery Bible project of mine uses the same reference: [SuperBook](https://theoyanvno.github.io/SuperBook/). That means the **Eastern Orthodox canon**: 79 books, with Tobit, Judith, the Maccabees, Wisdom and Sirach, in Orthodox order, and labels like \"1 Kingdoms (1 Samuel)\".\n\n`coe/books.py` holds the list as `(api id, chapters, label)`. One rule keeps the two projects from drifting apart: a test reads SuperBook's `src/books.js` and checks that the lists are identical:\n\n```python\n@unittest.skipUnless(SRC.exists(), \"SuperBook is not checked out next to Colors of Eden\")\nclass MatchesSuperBook(unittest.TestCase):\n    def test_same_books_same_order_same_labels(self):\n        body = re.search(r\"export const BIBLE = \\[(.*?)\\n\\];\", SRC.read_text(), re.S).group(1)\n        theirs = [(b[0], b[1], b[2] if len(b) > 2 else b[0]) for b in ast.literal_eval(\"[\" + body + \"]\")]\n        self.assertEqual(BIBLE, theirs)\n```\n\n`ast.literal_eval` safely reads the JavaScript array, because a list of strings and numbers looks the same in both languages.",
   "quiz": [
    {
     "q": "Why does a test compare the book list with SuperBook's?",
     "options": [
      "Python can't store 79 books",
      "Two projects share one reference, and the test fails the moment their lists drift apart",
      "To download SuperBook"
     ],
     "answer": 1,
     "why": "A copy of shared data is only safe if something checks it still matches."
    },
    {
     "q": "Why use ast.literal_eval instead of eval on the JavaScript list?",
     "options": [
      "It's faster",
      "literal_eval only accepts plain values like strings, numbers and lists, so it can't run code",
      "eval doesn't work on lists"
     ],
     "answer": 1,
     "why": "Never eval text from a file. literal_eval reads data without executing anything."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Getting the text: cache, fallback and clear errors",
   "body": "The text is the **World English Bible**, a public-domain translation, from [bible-api.com](https://bible-api.com/), the same source SuperBook reads. `coe/text.py` fetches a chapter once and keeps it:\n\n```python\ndef load_chapter(book, chapter, cache=Path(\".coe-cache\"), get=urllib_get):\n    name, n = check(book, chapter)                 # \"psalm\" → \"Psalms\", and 1..150\n    api_ref = f\"{API_ID[name]} {n}\"\n    cached = cache / f\"{api_ref.replace(' ', '_')}.json\"\n    if cached.is_file():\n        data = json.loads(cached.read_text(encoding=\"utf-8\"))\n        return Chapter(name, n, [(v, t) for v, t in data[\"verses\"]])\n    try:\n        body = json.loads(get(API.format(ref=urllib.parse.quote(api_ref.lower()))))\n        verses = [(int(v[\"verse\"]), \" \".join(v[\"text\"].split())) for v in body[\"verses\"] if int(v[\"chapter\"]) == n]\n    except Exception as e:\n        if ref in BUNDLED:\n            return Chapter(name, n, list(enumerate(BUNDLED[ref], start=1)))\n        raise ConnectionError(f\"Couldn't get {ref} ({e}). Check your internet connection and try again.\") from None\n    cached.write_text(json.dumps({\"verses\": verses}), encoding=\"utf-8\")\n    return Chapter(name, n, verses)\n```\n\n- **A disk cache**: each chapter is downloaded once, then read from `.coe-cache/` (which is in `.gitignore`).\n- **`get=urllib_get` as a parameter**: tests pass a fake `get`, so they never touch the internet.\n- **A bundled fallback**: Genesis 1 and Psalm 23 ship inside the code, so the app always draws something offline.\n- **`\" \".join(text.split())`** squashes the API's extra spaces and new lines into single spaces.\n- **`encoding=\"utf-8\"` every time**: on Windows the default encoding isn't UTF-8, and curly quotes in the text would break.\n\n### The browser does the same\n\nThe web version keeps fetched chapters in a `Map` for the visit, uses the same bundled chapters, and politely retries when the free API answers **429 Too Many Requests** (it allows about 15 chapters every 30 seconds), waiting as long as the `Retry-After` header asks. That's what lets a 20-page booklet finish instead of failing halfway.\n\n```svg Where a chapter comes from: the cache if it's there, else the API (then saved to the cache), else the bundled copy, else a clear error\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"120\" fill=\"#ffffff\"/>\n  <rect x=\"5\" y=\"40\" width=\"120\" height=\"45\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"65\" y=\"67\" text-anchor=\"middle\">1. cache file</text>\n  <rect x=\"150\" y=\"40\" width=\"120\" height=\"45\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"210\" y=\"61\" text-anchor=\"middle\">2. bible-api.com</text><text x=\"210\" y=\"77\" text-anchor=\"middle\">(then cache it)</text>\n  <rect x=\"295\" y=\"40\" width=\"120\" height=\"45\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"355\" y=\"61\" text-anchor=\"middle\">3. bundled copy</text><text x=\"355\" y=\"77\" text-anchor=\"middle\">Gen 1, Ps 23</text>\n  <rect x=\"440\" y=\"40\" width=\"115\" height=\"45\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"497\" y=\"61\" text-anchor=\"middle\">4. clear error</text><text x=\"497\" y=\"77\" text-anchor=\"middle\">\"check internet\"</text>\n  <text x=\"137\" y=\"30\" text-anchor=\"middle\">miss</text><text x=\"282\" y=\"30\" text-anchor=\"middle\">offline</text><text x=\"427\" y=\"30\" text-anchor=\"middle\">not bundled</text>\n  <path d=\"M125 62 H146 M270 62 H291 M415 62 H436\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does load_chapter take get= as a parameter?",
     "options": [
      "urllib requires it",
      "So tests can pass a fake that returns sample JSON, and never call the real API",
      "To support several APIs at once"
     ],
     "answer": 1,
     "why": "Injecting the network call makes the code testable offline and fast."
    },
    {
     "q": "What does the bundled copy of Psalm 23 give the app?",
     "options": [
      "A page it can always draw, even with no internet",
      "A faster download",
      "A different translation"
     ],
     "answer": 0,
     "why": "A small offline fallback keeps the app useful and the tests independent of the network."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Planning a page from words",
   "body": "`coe/scenes.py` decides what to draw by counting words. Each **motif** has words that suggest it:\n\n```python\nMOTIF_WORDS = {\n    \"sun\": (\"sun\", \"light\", \"day\", \"morning\", \"shine\", \"bright\"),\n    \"waves\": (\"sea\", \"seas\", \"waters\", \"water\", \"deep\", \"flood\", \"river\"),\n    \"sheep\": (\"sheep\", \"lamb\", \"lambs\", \"flock\", \"shepherd\", \"shepherds\"),\n    \"dove\": (\"dove\", \"spirit\", \"bird\", \"birds\", \"wings\"),\n    \"crown\": (\"king\", \"kings\", \"crown\", \"throne\", \"kingdom\"),\n    # … tree, flowers, fish, boat, lamp, cup, heart, mountains, path …\n}\nWEIGHT = {\"sheep\": 3, \"dove\": 3, \"fish\": 3, \"boat\": 3, \"crown\": 3, \"lamp\": 2, \"cup\": 2}\n```\n\n```python\ndef motif_counts(text):\n    words = Counter(WORD.findall(text.lower()))        # WORD = re.compile(r\"[a-z]+\")\n    counts = Counter()\n    for motif, cues in MOTIF_WORDS.items():\n        n = sum(words[w] for w in cues)\n        if n:\n            counts[motif] = n * WEIGHT.get(motif, 1)\n    return counts\n```\n\n- **`Counter`** counts every word in the chapter once; looking up a word that isn't there gives 0.\n- **Weights**: \"day\" and \"way\" appear everywhere, but one \"shepherd\" says much more about a chapter, so specific things count three times.\n- The top five motifs become the plan, split into **background** (sun, moon, stars, clouds, waves, mountains, path) and **foreground** (things in front).\n- Two safety rules: there's always something in front to color, and always some ground behind.\n\n### Picking the verse\n\nThe verse on the ribbon is the **short** verse (160 characters or less) that mentions the most chosen motifs, so the words match the picture. For Psalm 23 that's verse 2: *He makes me lie down in green pastures. He leads me beside still waters.*\n\n```svg Counting words: the chapter's words are counted once, each motif adds up its cue words times its weight, and the top motifs become the plan\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"130\" fill=\"#ffffff\"/>\n  <rect x=\"5\" y=\"20\" width=\"150\" height=\"90\" rx=\"8\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"80\" y=\"42\" text-anchor=\"middle\" font-weight=\"bold\">Psalm 23 words</text><text x=\"80\" y=\"62\" text-anchor=\"middle\">shepherd 1, cup 1</text><text x=\"80\" y=\"78\" text-anchor=\"middle\">waters 1, paths 1</text><text x=\"80\" y=\"94\" text-anchor=\"middle\">pastures 1, table 1</text>\n  <rect x=\"200\" y=\"20\" width=\"160\" height=\"90\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"280\" y=\"42\" text-anchor=\"middle\" font-weight=\"bold\">× weight</text><text x=\"280\" y=\"62\" text-anchor=\"middle\">sheep 1 × 3 = 3</text><text x=\"280\" y=\"78\" text-anchor=\"middle\">cup 2 × 2 = 4</text><text x=\"280\" y=\"94\" text-anchor=\"middle\">waves 1, path 1 …</text>\n  <rect x=\"405\" y=\"20\" width=\"150\" height=\"90\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"480\" y=\"42\" text-anchor=\"middle\" font-weight=\"bold\">plan</text><text x=\"480\" y=\"62\" text-anchor=\"middle\">behind: path, waves</text><text x=\"480\" y=\"78\" text-anchor=\"middle\">front: cup, sheep,</text><text x=\"480\" y=\"94\" text-anchor=\"middle\">flowers</text>\n  <path d=\"M155 65 H196 M360 65 H401\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does \"shepherd\" count three times as much as \"day\"?",
     "options": [
      "Shepherd is a longer word",
      "A specific thing says much more about a chapter than a common word, so it gets a higher weight",
      "Counter counts long words more"
     ],
     "answer": 1,
     "why": "Weighting is a simple way to make a word count reflect meaning, the same idea as ranking search results."
    },
    {
     "q": "How is the verse on the ribbon chosen?",
     "options": [
      "Always verse 1",
      "The longest verse",
      "The short verse that mentions the most motifs in the plan"
     ],
     "answer": 2,
     "why": "The ribbon should fit and should match what's drawn, so length is capped and matching motifs score."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Line art in SVG, drawn from code",
   "body": "A coloring page needs black outlines and white areas a child can fill. `coe/art.py` draws one as an **SVG** with a view box of 850 × 1100, the shape of US Letter (8.5 × 11 inches):\n\n```python\ndef shape(d, fill=\"#fff\", width=4.5):\n    return (f'<path d=\"{d}\" fill=\"{fill}\" stroke=\"#111\" stroke-width=\"{width}\" '\n            f'stroke-linejoin=\"round\" stroke-linecap=\"round\"/>')\n```\n\n- **Every shape is a closed outline with a white fill.** Shapes in front cover the lines behind them, so every area is a closed space to color.\n- **Thinner texture lines** (bark, wool, ripples) add detail without boxing in new areas.\n- **Layers** are drawn back to front: sky, mountains, hills, path, water or meadow, then up to three things in front, a double frame, and the verse on a ribbon.\n\n### Curves from a little math\n\nA cloud, a tree's leaves and a sheep's wool are all the same idea: arcs around an ellipse.\n\n```python\ndef scallop(cx, cy, rx, ry, n, bulge=0.6):\n    pts = [(cx + rx * math.cos(2 * math.pi * k / n), cy + ry * math.sin(2 * math.pi * k / n)) for k in range(n)]\n    d = f\"M{pts[0][0]:.1f} {pts[0][1]:.1f} \"\n    for k in range(n):\n        (x1, y1), (x2, y2) = pts[k], pts[(k + 1) % n]\n        r = math.hypot(x2 - x1, y2 - y1) * bulge\n        d += f\"A{r:.1f} {r:.1f} 0 0 1 {x2:.1f} {y2:.1f} \"\n    return d + \"Z\"\n```\n\n`n` points around an ellipse, joined by SVG arc commands (`A`), and `Z` closes the path.\n\n### The same page every time\n\nHills and clouds vary a little, from a **seeded** random generator: `random.Random(plan.reference)`. Seeded with \"Psalms 23\", it gives the same numbers every run, so a page never changes between printing it and printing it again, and tests can compare outputs.\n\n```svg Back to front: sky and clouds, mountains and hills, the meadow or water, things in front, then the frame and the verse ribbon on top\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"150\" fill=\"#ffffff\"/>\n  <rect x=\"20\" y=\"10\" width=\"200\" height=\"130\" rx=\"12\" fill=\"#fff\" stroke=\"#111\" stroke-width=\"4\"/>\n  <circle cx=\"60\" cy=\"40\" r=\"14\" fill=\"#fff\" stroke=\"#111\" stroke-width=\"2.5\"/>\n  <path d=\"M20 95 Q70 60 120 90 T220 85 V140 H20 Z\" fill=\"#fff\" stroke=\"#111\" stroke-width=\"2.5\"/>\n  <path d=\"M20 115 Q120 100 220 118 V140 H20 Z\" fill=\"#fff\" stroke=\"#111\" stroke-width=\"2.5\"/>\n  <ellipse cx=\"140\" cy=\"108\" rx=\"22\" ry=\"14\" fill=\"#fff\" stroke=\"#111\" stroke-width=\"2.5\"/>\n  <text x=\"250\" y=\"30\">1. sky: sun, moon, stars, clouds</text><text x=\"250\" y=\"52\">2. mountains and hills</text><text x=\"250\" y=\"74\">3. path, then water or meadow</text><text x=\"250\" y=\"96\">4. up to three things in front</text><text x=\"250\" y=\"118\">5. frame and verse ribbon on top</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does every shape have a white fill as well as a black outline?",
     "options": [
      "White ink is cheaper",
      "Shapes in front cover the lines behind them, so every area stays a closed space to color",
      "SVG requires a fill"
     ],
     "answer": 1,
     "why": "Painter's order with white fills is how overlapping line art stays clean."
    },
    {
     "q": "Why seed the random generator with the chapter's reference?",
     "options": [
      "The same chapter always draws the same page, so prints match and tests can compare output",
      "Seeding makes random numbers more random",
      "Python requires a seed"
     ],
     "answer": 0,
     "why": "A seed makes \"random\" repeatable, which is what you want for anything you test or reprint."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 20
  },
  {
   "title": "Real drawings: tracing pictures into sharp outlines",
   "body": "Code can draw sheep and clouds, but a lion or a Roman soldier is better drawn by hand. Colors of Eden also has **60 drawings** of animals, places and people of the Middle East. They came as three small picture sheets, so each drawing was only about 225 pixels wide: printed on a whole page, the pixels would show.\n\n`tools/trace_pictures.py` turns each one into a **vector** drawing:\n\n1. Find the 20 panels on a sheet by the **white gaps** between them.\n2. Erase the printed name above each drawing, but only the letters: a component is erased only if it sits entirely inside the name's box, so horns and tails reaching up beside it stay whole.\n3. Enlarge it 4× and **trace** it with [potrace](https://potrace.sourceforge.net/), which turns black pixels into smooth curves.\n4. Save it as `coe/pictures/<kind>/<name>.svg`, plus its size in `catalog.json`.\n\nOn Windows the tool uses `potrace.dll` if it's installed, or `potracer`, a pure-Python copy of potrace that installs with `pip`.\n\n### Choosing a picture\n\n`catalog.json` lists the words that choose each drawing: `lion, lions, lioness` for the lion, `pharaoh` for the Egyptian man, `egypt` for the pyramids. A chapter has to name a drawing **at least three times**, so one passing mention doesn't take over the page. Daniel 6 says \"lions\" many times, so its page is the lion, with verse 16: *…cast him into the den of lions.* Chapters that name none keep the page drawn in code, and a **Picture** menu lets you pick any drawing yourself.\n\n```svg Tracing: a small pixel drawing is enlarged and traced into curves, which stay sharp printed on a whole page\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"120\" fill=\"#ffffff\"/>\n  <g transform=\"translate(20 25)\"><rect width=\"70\" height=\"70\" fill=\"#fff\" stroke=\"#9ca3af\"/><path d=\"M10 50 h10 v-10 h10 v-10 h10 v10 h10 v10 h10 v10 H10 Z\" fill=\"#111\"/></g>\n  <text x=\"55\" y=\"112\" text-anchor=\"middle\">225 px, blocky</text>\n  <path d=\"M110 60 H160\" stroke=\"#374151\" stroke-width=\"2\"/><text x=\"135\" y=\"50\" text-anchor=\"middle\">×4 + potrace</text>\n  <g transform=\"translate(180 25)\"><rect width=\"70\" height=\"70\" fill=\"#fff\" stroke=\"#9ca3af\"/><path d=\"M10 60 Q35 15 60 60 Z\" fill=\"#111\"/></g>\n  <text x=\"215\" y=\"112\" text-anchor=\"middle\">smooth curves</text>\n  <text x=\"290\" y=\"45\">Vector outlines scale to any size,</text><text x=\"290\" y=\"65\">so a 225-pixel drawing prints</text><text x=\"290\" y=\"85\">sharp on a whole Letter page.</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why trace the drawings instead of putting the small images on the page?",
     "options": [
      "SVG can't hold images",
      "At 225 pixels wide they'd look blocky printed full page; traced curves stay sharp at any size",
      "Tracing makes the files smaller than any image"
     ],
     "answer": 1,
     "why": "Vector shapes are math, not pixels, so they scale without losing quality."
    },
    {
     "q": "Why must a chapter name a drawing at least three times?",
     "options": [
      "So one passing mention doesn't replace a page that's about something else",
      "Because the catalog only stores three words",
      "To make the page load faster"
     ],
     "answer": 0,
     "why": "A threshold is a simple way to require that a chapter is really about the thing."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "One app in two languages, kept identical by tests",
   "body": "The planner and the drawings exist in Python (`coe/`) and JavaScript (`web/src/`). Two copies of the same logic will drift apart unless something checks them. So the web page's tests **run the Python version** and compare:\n\n```js\ntest('the page plan matches the Python version for the chapters that ship with it', () => {\n  for (const ref of Object.keys(BUNDLED)) {\n    const js = planPage(ref, verses(ref));\n    const py = JSON.parse(execFileSync(PY, ['-c', `\nfrom coe.scenes import plan_page\n...\nprint(json.dumps({\"motifs\": p.motifs, \"verse\": list(p.verse), \"picture\": p.picture}))`]));\n    assert.deepEqual({ motifs: js.motifs, verse: js.verse, picture: js.picture }, py, ref);\n  }\n});\n```\n\nA second test draws Daniel 6's picture page in both languages and checks the two SVG strings are **exactly equal**, character for character.\n\n### Small differences that break \"exactly equal\"\n\n- **Number formatting.** Python's `850 / 2` prints `425.0`; JavaScript prints `425`. Use `850 // 2` in Python, or one shared formatter.\n- **Rounding.** Format with one function in each language (`f\"{n:.1f}\"` and `toFixed(1)`) and test them side by side.\n- **The Python command.** Windows has `python`, macOS and Linux have `python3`, so the test picks one: `process.platform === 'win32' ? 'python' : 'python3'`.\n\n```svg Two implementations, one truth: the JavaScript tests run the Python version and compare plans and whole pages, so the two can't drift apart\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"120\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"30\" width=\"150\" height=\"60\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"85\" y=\"56\" text-anchor=\"middle\" font-weight=\"bold\">coe/ (Python)</text><text x=\"85\" y=\"74\" text-anchor=\"middle\">plan + draw</text>\n  <rect x=\"400\" y=\"30\" width=\"150\" height=\"60\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"475\" y=\"56\" text-anchor=\"middle\" font-weight=\"bold\">web/src (JS)</text><text x=\"475\" y=\"74\" text-anchor=\"middle\">plan + draw</text>\n  <rect x=\"210\" y=\"35\" width=\"140\" height=\"50\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"280\" y=\"57\" text-anchor=\"middle\" font-weight=\"bold\">npm test</text><text x=\"280\" y=\"74\" text-anchor=\"middle\">same plan? same SVG?</text>\n  <path d=\"M160 60 H206 M350 60 H396\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why do the JavaScript tests run the Python code?",
     "options": [
      "To make the tests slower",
      "To prove both versions make the same plan and the same page, so the two copies can't silently drift apart",
      "Because JavaScript can't draw SVG"
     ],
     "answer": 1,
     "why": "When logic exists twice, a comparison test is what keeps \"the same app\" true."
    },
    {
     "q": "Why does Python write 850 // 2 instead of 850 / 2 for the page's center?",
     "options": [
      "// is faster",
      "850 / 2 prints 425.0 while JavaScript prints 425; // gives 425 in both, so the SVG text matches",
      "/ is not allowed in f-strings"
     ],
     "answer": 1,
     "why": "Tiny formatting differences matter when you compare output character for character."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Printing exact pages and booklets",
   "body": "A coloring page has to print at exactly US Letter size, with no browser margins and none of the page's buttons.\n\n```css\n@media print {\n  @page { size: letter; margin: 0; }\n  .no-print { display: none !important; }\n  .sheet { width: 8.5in; height: 11in; break-after: page; }\n}\n```\n\n- **`@page { size: letter; margin: 0 }`** sets the paper and removes the browser's margins.\n- **`.no-print`** hides the controls, header and footer.\n- **`width: 8.5in; height: 11in`** makes each sheet exactly one page, and **`break-after: page`** starts the next sheet on a new page.\n- The SVG itself says `width=\"8.5in\" height=\"11in\"`, so it prints at real size.\n\nTo save a PDF, people choose **Save as PDF** in the print window. No PDF library needed.\n\n### Booklets, and why ids must be unique\n\nA booklet prints up to 20 chapters in a row as one document. Each page clips its drawing to the frame with a `<clipPath id=\"…\">`. Twenty pages with the same `id=\"pic\"` would all use the first page's clip, because ids must be unique in a document. So every page's clip gets its own id from its reference: `pic-psalms-23`, `pic-psalms-24`.\n\n### On Windows, in VS Code\n\nThe repo has VS Code tasks (**Terminal → Run Task**) to install everything, start the page, run both test suites and draw a page:\n\n```text\nnpm install\nnpm start                      # http://localhost:8000\nnpm test                       # web tests (they run Python too)\npython -m unittest             # Python tests\npython -m coe page Daniel 6    # out/daniel-6.svg\n```\n\n### Explain it in an interview\n\n1. **What:** \"Coloring pages from any chapter of the Orthodox Bible, in Python and in a React page, printable at exact Letter size.\"\n2. **How:** \"Text from a public API with a disk cache and offline fallback; a planner that counts weighted words to choose motifs and a matching verse; line art drawn as SVG from closed shapes with a seeded generator; 60 hand drawings traced into vectors.\"\n3. **Decisions:** \"Two implementations kept identical by tests that compare whole pages; unique clip-path ids so booklets print correctly; politely retrying when the free API asks me to slow down.\"\n4. **Next:** \"More drawings and words, and coloring in the browser before printing.\"",
   "quiz": [
    {
     "q": "Why does every booklet page get its own clipPath id?",
     "options": [
      "Browsers limit how many clips a page has",
      "Ids must be unique in a document; with twenty identical ids every page would use the first page's clip",
      "To print faster"
     ],
     "answer": 1,
     "why": "Several SVGs inlined in one HTML page share one id namespace, so repeated ids collide."
    },
    {
     "q": "How does the page make a PDF?",
     "options": [
      "With a PDF library in JavaScript",
      "The print styles make each sheet exactly one Letter page, and the person picks Save as PDF in the print window",
      "It uploads the SVG to a server"
     ],
     "answer": 1,
     "why": "Good print CSS turns the browser's own print dialog into a PDF maker, with nothing extra to install."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  }
 ],
 "finish": "You rebuilt a project that runs in two languages and prints real pages. You learned:\n\n- Keeping a shared reference (**SuperBook's canon**) in sync with a test\n- Fetching with a **disk cache**, an **offline fallback** and **polite retries**\n- Planning with **weighted word counts** and a matching verse\n- Drawing **SVG line art** from closed shapes, in **painter's order**, with a **seeded** random generator\n- **Tracing** small drawings into sharp vector outlines\n- Keeping **Python and JavaScript** identical with comparison tests\n- **Print CSS** for exact Letter pages and booklets, and unique **SVG ids**\n\n### Challenges\n\n1. Add a new motif, `star of Bethlehem`, with its own words and drawing, in both languages, and make the comparison tests pass.\n2. Give the 11 drawings that have no words yet a few each (Bedouin woman, Roman child…), and check which chapters now choose them.\n3. Add a \"color it in\" mode to the web page: click an area to fill it with the chosen color before printing."
};
