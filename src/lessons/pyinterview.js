// Built from guides/pyinterview.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "pyinterview",
 "title": "Python interview practice (write and explain code)",
 "goals": [
  "Follow a calm routine for any live-coding question: restate, examples, plan, code, test, improve",
  "Solve the common patterns with dictionaries, sets, sorting, strings and two pointers, and say their Big-O",
  "Write small classes and handle bad input with exceptions, the way real projects do",
  "Test your own answer out loud with edge cases before the interviewer does",
  "Explain your projects in two minutes, and answer \"what would you improve?\""
 ],
 "prereqs": [
  "Python basics (functions, lists, dictionaries, loops, classes)"
 ],
 "sessions": [
  {
   "title": "A routine and the core patterns",
   "from": 0,
   "to": 2
  },
  {
   "title": "Classes, errors, tests and talking about your work",
   "from": 3,
   "to": 5
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "The routine: think out loud in six moves",
   "body": "In a live-coding interview the interviewer cares about **how you think** as much as whether the code runs. A routine keeps you calm and shows your thinking. Use the same six moves every time:\n\n1. **Restate** the problem in your own words. \"So I get a list of words and return the three most common, ties broken alphabetically?\"\n2. **Examples**: write one normal input and one edge case (empty list, one item, duplicates) with the answer you expect.\n3. **Plan** in one or two sentences before typing. \"I'll count with a dictionary, then sort by count and word.\"\n4. **Code** the simplest correct version first. Name things clearly.\n5. **Test** by running your examples by hand or in the editor, line by line, out loud.\n6. **Improve**: say the time and space cost (Big-O) and one thing you'd do differently with more time.\n\n```svg The six moves: restate, examples, plan, code, test, improve, in a loop you can repeat when something changes\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"110\" fill=\"#ffffff\"/>\n  <rect x=\"5\" y=\"35\" width=\"80\" height=\"40\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"45\" y=\"59\" text-anchor=\"middle\">restate</text>\n  <rect x=\"98\" y=\"35\" width=\"80\" height=\"40\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"138\" y=\"59\" text-anchor=\"middle\">examples</text>\n  <rect x=\"191\" y=\"35\" width=\"80\" height=\"40\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"231\" y=\"59\" text-anchor=\"middle\">plan</text>\n  <rect x=\"284\" y=\"35\" width=\"80\" height=\"40\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"324\" y=\"59\" text-anchor=\"middle\">code</text>\n  <rect x=\"377\" y=\"35\" width=\"80\" height=\"40\" rx=\"8\" fill=\"#fce7f3\" stroke=\"#db2777\"/><text x=\"417\" y=\"59\" text-anchor=\"middle\">test</text>\n  <rect x=\"470\" y=\"35\" width=\"85\" height=\"40\" rx=\"8\" fill=\"#ede9fe\" stroke=\"#7c3aed\"/><text x=\"512\" y=\"59\" text-anchor=\"middle\">improve</text>\n  <path d=\"M85 55 H94 M178 55 H187 M271 55 H280 M364 55 H373 M457 55 H466\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <path d=\"M512 75 V95 H45 V79\" stroke=\"#9ca3af\" stroke-width=\"1.5\" fill=\"none\" stroke-dasharray=\"4 3\"/>\n</svg>\n```\n\n### Phrases that help\n\n- \"Can I assume the input fits in memory?\" (ask about limits)\n- \"I'll start simple and then improve it.\"\n- \"I'm not sure about the exact method name; I'd check the docs. It's something like `str.removeprefix`.\"\n- \"Let me trace this example through the code.\"\n\nSaying \"I don't know, here's how I'd find out\" is a good answer. Guessing confidently and being wrong is a bad one.\n\n### Big-O in one table\n\n| Operation | Cost |\n|---|---|\n| Look up a key in a dict or set | O(1) on average |\n| Find a value in a list (`x in my_list`) | O(n) |\n| Sort | O(n log n) |\n| A loop inside a loop over the same list | O(n²) |",
   "quiz": [
    {
     "q": "What should you do before typing any code?",
     "options": [
      "Start typing fast so they see progress",
      "Restate the problem, write an example and an edge case, and say your plan in a sentence or two",
      "Ask for the solution"
     ],
     "answer": 1,
     "why": "Most mistakes in interviews come from solving the wrong problem. Two minutes of setup saves ten of fixing."
    },
    {
     "q": "Which is faster for checking membership many times: a list or a set?",
     "options": [
      "A list",
      "A set: O(1) on average per lookup, instead of O(n) for a list",
      "They're the same"
     ],
     "answer": 1,
     "why": "Sets and dicts are hash tables; turning a list into a set first is a classic speed-up."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Counting and grouping with dictionaries",
   "body": "Half of all interview questions are \"count something\" or \"group something\". Python's dictionaries do both.\n\n### The top k words\n\n```python\nimport re\nfrom collections import Counter\n\ndef top_words(text: str, k: int = 3) -> list[tuple[str, int]]:\n    words = re.findall(r\"[a-z']+\", text.lower())\n    counts = Counter(words)\n    return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:k]\n```\n\n- `Counter` counts in one pass: O(n).\n- `key=lambda kv: (-kv[1], kv[0])` sorts by count, highest first, then alphabetically for ties. A **tuple key** is the cleanest way to sort by several things.\n- This is exactly how Colors of Eden counts a chapter's words to plan a page.\n\nWithout Counter, a plain dict does the same:\n\n```python\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\n```\n\n### Grouping\n\n```python\nfrom collections import defaultdict\n\ndef by_publisher(datasets: list[dict]) -> dict[str, list[str]]:\n    groups = defaultdict(list)\n    for d in datasets:\n        groups[d[\"publisher\"]].append(d[\"id\"])\n    return dict(groups)\n```\n\n`defaultdict(list)` creates an empty list the first time a key is used, so there's no \"if key not in groups\" check.\n\n### Two sum: the dict trick\n\n\"Return the positions of two numbers that add up to the target.\"\n\n```python\ndef two_sum(nums: list[int], target: int) -> tuple[int, int] | None:\n    seen = {}                       # number -> its index\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return seen[target - n], i\n        seen[n] = i\n    return None\n```\n\nThe obvious answer checks every pair: O(n²). Remembering what you've seen in a dict makes it **O(n)**. Saying that out loud is the point of the question.\n\n```svg Two sum with a dict: walk the list once, and for each number check whether its partner (target minus it) was already seen\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"120\" fill=\"#ffffff\"/>\n  <text x=\"10\" y=\"20\">nums = [3, 8, 4, 5], target = 9</text>\n  <rect x=\"10\" y=\"35\" width=\"60\" height=\"35\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"40\" y=\"57\" text-anchor=\"middle\">3</text>\n  <rect x=\"75\" y=\"35\" width=\"60\" height=\"35\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"105\" y=\"57\" text-anchor=\"middle\">8</text>\n  <rect x=\"140\" y=\"35\" width=\"60\" height=\"35\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"170\" y=\"57\" text-anchor=\"middle\">4</text>\n  <rect x=\"205\" y=\"35\" width=\"60\" height=\"35\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"235\" y=\"57\" text-anchor=\"middle\">5</text>\n  <rect x=\"300\" y=\"30\" width=\"250\" height=\"45\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"425\" y=\"50\" text-anchor=\"middle\">seen = {3: 0, 8: 1, 4: 2}</text><text x=\"425\" y=\"66\" text-anchor=\"middle\">at 5: is 9 − 5 = 4 seen? yes → (2, 3)</text>\n  <text x=\"10\" y=\"100\">one pass, O(n), instead of checking every pair, O(n²)</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "How do you sort word counts by count (highest first) and then alphabetically?",
     "options": [
      "sorted(counts) then reverse",
      "sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))",
      "counts.sort()"
     ],
     "answer": 1,
     "why": "A tuple key sorts by its first item, then the second; negating the count makes it descending."
    },
    {
     "q": "Why is the dict version of two sum O(n)?",
     "options": [
      "Dicts are sorted",
      "It walks the list once, and each \"have I seen the partner?\" check is an O(1) dict lookup",
      "It stops after two numbers"
     ],
     "answer": 1,
     "why": "Trading a little memory (the dict) for time is the idea behind many interview answers."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Strings, two pointers and sets",
   "body": "### Is it a palindrome? Two pointers\n\n```python\ndef is_palindrome(s: str) -> bool:\n    chars = [c.lower() for c in s if c.isalnum()]\n    i, j = 0, len(chars) - 1\n    while i < j:\n        if chars[i] != chars[j]:\n            return False\n        i, j = i + 1, j - 1\n    return True\n```\n\n`\"A man, a plan, a canal: Panama\"` is True. Two pointers walking toward each other is O(n) with no extra copy of the reversed string. (`chars == chars[::-1]` also works and is fine to mention first.)\n\n### Duplicates with a set\n\n```python\ndef first_duplicate(items):\n    seen = set()\n    for x in items:\n        if x in seen:\n            return x\n        seen.add(x)\n    return None\n```\n\n### Normalize messy input\n\nReal data is messy. A question like \"clean these phone numbers\" or \"normalize these keywords\" checks that you handle it carefully:\n\n```python\ndef normalize_keywords(raw: list[str]) -> list[str]:\n    return sorted({k.strip().lower() for k in raw if k and k.strip()})\n```\n\nA **set comprehension** removes duplicates, `strip()` and `lower()` clean each one, the `if` drops blanks, and `sorted` gives a stable order. This one line is the Dataset Catalog API's keyword cleaning.\n\n```svg Two pointers: one starts at each end and they move toward the middle, comparing as they go\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 110\" font-family=\"monospace\" font-size=\"14\">\n  <rect width=\"560\" height=\"110\" fill=\"#ffffff\"/>\n  <g transform=\"translate(60 30)\">\n    <rect x=\"0\" y=\"0\" width=\"40\" height=\"40\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"20\" y=\"26\" text-anchor=\"middle\">r</text>\n    <rect x=\"45\" y=\"0\" width=\"40\" height=\"40\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"65\" y=\"26\" text-anchor=\"middle\">a</text>\n    <rect x=\"90\" y=\"0\" width=\"40\" height=\"40\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"110\" y=\"26\" text-anchor=\"middle\">c</text>\n    <rect x=\"135\" y=\"0\" width=\"40\" height=\"40\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"155\" y=\"26\" text-anchor=\"middle\">e</text>\n    <rect x=\"180\" y=\"0\" width=\"40\" height=\"40\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"200\" y=\"26\" text-anchor=\"middle\">c</text>\n    <rect x=\"225\" y=\"0\" width=\"40\" height=\"40\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"245\" y=\"26\" text-anchor=\"middle\">a</text>\n    <rect x=\"270\" y=\"0\" width=\"40\" height=\"40\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"290\" y=\"26\" text-anchor=\"middle\">r</text>\n    <text x=\"20\" y=\"65\" text-anchor=\"middle\" font-family=\"sans-serif\" font-size=\"12\">i →</text><text x=\"290\" y=\"65\" text-anchor=\"middle\" font-family=\"sans-serif\" font-size=\"12\">← j</text>\n  </g>\n  <text x=\"400\" y=\"55\" font-family=\"sans-serif\" font-size=\"12\">compare, then</text><text x=\"400\" y=\"72\" font-family=\"sans-serif\" font-size=\"12\">move both inward</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does the palindrome check skip characters that aren't letters or digits?",
     "options": [
      "Python can't compare punctuation",
      "Spaces, commas and colons shouldn't decide the answer; only letters and digits are compared, ignoring case",
      "To make the string shorter for speed"
     ],
     "answer": 1,
     "why": "Clarifying what counts (case, spaces, punctuation) is part of restating the problem."
    },
    {
     "q": "What does {k.strip().lower() for k in raw if k and k.strip()} produce?",
     "options": [
      "A list with duplicates",
      "A set of cleaned keywords with blanks and duplicates removed",
      "A dictionary"
     ],
     "answer": 1,
     "why": "Curly braces with one expression make a set comprehension; sets keep one copy of each value."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "A small class, and errors with useful messages",
   "body": "\"Design a class\" questions check that you can keep data and behavior together. A to-do list, a parking lot, a bank account, a family of members: the shape is the same.\n\n```python\nclass Library:\n    def __init__(self):\n        self._books: dict[str, dict] = {}          # id -> book\n\n    def add(self, book_id: str, title: str) -> None:\n        if not title.strip():\n            raise ValueError(\"title can't be empty\")\n        if book_id in self._books:\n            raise ValueError(f\"{book_id} is already in the library\")\n        self._books[book_id] = {\"title\": title.strip(), \"out\": False}\n\n    def check_out(self, book_id: str) -> None:\n        book = self._get(book_id)\n        if book[\"out\"]:\n            raise ValueError(f\"{book_id} is already checked out\")\n        book[\"out\"] = True\n\n    def _get(self, book_id: str) -> dict:\n        try:\n            return self._books[book_id]\n        except KeyError:\n            raise KeyError(f\"no book with id {book_id}\") from None\n\n    def available(self) -> list[str]:\n        return sorted(b[\"title\"] for b in self._books.values() if not b[\"out\"])\n```\n\nThings interviewers look for:\n\n- **Data behind methods**: `_books` has an underscore; callers use the methods.\n- **A dict by id**, so lookups are O(1) instead of searching a list (better than the Family API's list, which I'd change now).\n- **Errors with messages that say what's wrong**, raised early: `ValueError` for bad values, `KeyError` for a missing id.\n- **Small helpers** like `_get` so the \"not found\" message is written once.\n\n### Reading a file safely\n\n```python\ndef read_ids(path: str) -> list[str]:\n    with open(path, encoding=\"utf-8\") as fh:\n        return [line.strip() for line in fh if line.strip() and not line.startswith(\"#\")]\n```\n\n`with` closes the file even if something fails, and `encoding=\"utf-8\"` keeps it working on Windows.\n\n```svg A class keeps its data private and exposes methods; each method checks its input and raises a clear error before changing anything\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"120\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"10\" width=\"360\" height=\"100\" rx=\"10\" fill=\"#fff7ed\" stroke=\"#f59e0b\"/><text x=\"190\" y=\"28\" text-anchor=\"middle\" font-weight=\"bold\">class Library</text>\n  <rect x=\"25\" y=\"40\" width=\"150\" height=\"60\" rx=\"6\" fill=\"#ffffff\" stroke=\"#f59e0b\"/><text x=\"100\" y=\"62\" text-anchor=\"middle\">add · check_out</text><text x=\"100\" y=\"80\" text-anchor=\"middle\">available</text>\n  <rect x=\"200\" y=\"40\" width=\"155\" height=\"60\" rx=\"6\" fill=\"#e5e7eb\" stroke=\"#374151\"/><text x=\"277\" y=\"62\" text-anchor=\"middle\">_books (private)</text><text x=\"277\" y=\"80\" text-anchor=\"middle\">id → book</text>\n  <rect x=\"400\" y=\"40\" width=\"150\" height=\"60\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"475\" y=\"62\" text-anchor=\"middle\">ValueError /</text><text x=\"475\" y=\"80\" text-anchor=\"middle\">KeyError + message</text>\n  <path d=\"M175 70 H196 M370 70 H396\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why store the books in a dict keyed by id instead of a list?",
     "options": [
      "Lists can't hold dicts",
      "Finding a book by id is O(1) in a dict instead of searching the whole list",
      "Dicts use less memory"
     ],
     "answer": 1,
     "why": "Choosing the right data structure is usually the biggest improvement you can make."
    },
    {
     "q": "Why raise ValueError with a message instead of returning False?",
     "options": [
      "The caller can't silently ignore it, and the message says exactly what went wrong",
      "Python doesn't allow returning False",
      "Exceptions are faster"
     ],
     "answer": 0,
     "why": "Errors that explain themselves make bugs quick to find, for you and for whoever uses your code."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Test your own answer before they do",
   "body": "The strongest move in a live interview is testing your own code without being asked. Write a few asserts right under your function:\n\n```python\nassert top_words(\"the cat the dog the end\", 2) == [(\"the\", 3), (\"cat\", 1)]\nassert top_words(\"\", 3) == []\nassert two_sum([3, 8, 4, 5], 9) == (2, 3)\nassert two_sum([1, 2], 10) is None\nassert is_palindrome(\"A man, a plan, a canal: Panama\")\nassert not is_palindrome(\"abc\")\nprint(\"all good\")\n```\n\n### The edge-case checklist\n\nRun through it out loud:\n\n- **Empty**: `[]`, `\"\"`, `{}`\n- **One item**\n- **Duplicates** and **ties**\n- **Negative numbers** and **zero**\n- **Very large** input (would O(n²) be too slow?)\n- **Bad input**: `None`, the wrong type, extra spaces, upper case\n\n### When there's time: unittest\n\n```python\nimport unittest\n\nclass LibraryTests(unittest.TestCase):\n    def test_check_out_twice_fails(self):\n        lib = Library()\n        lib.add(\"b1\", \"Dune\")\n        lib.check_out(\"b1\")\n        with self.assertRaises(ValueError):\n            lib.check_out(\"b1\")\n```\n\n`assertRaises` checks that the right error happens. Every one of my projects has tests like this; mention that you write tests first for tricky rules.\n\n```svg Edge cases to say out loud: empty, one item, duplicates and ties, negatives and zero, very large input, and bad input\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"100\" fill=\"#ffffff\"/>\n  <rect x=\"5\" y=\"30\" width=\"85\" height=\"40\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"47\" y=\"54\" text-anchor=\"middle\">empty</text>\n  <rect x=\"98\" y=\"30\" width=\"85\" height=\"40\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"140\" y=\"54\" text-anchor=\"middle\">one item</text>\n  <rect x=\"191\" y=\"30\" width=\"85\" height=\"40\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"233\" y=\"54\" text-anchor=\"middle\">dupes, ties</text>\n  <rect x=\"284\" y=\"30\" width=\"85\" height=\"40\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"326\" y=\"54\" text-anchor=\"middle\">0, negative</text>\n  <rect x=\"377\" y=\"30\" width=\"85\" height=\"40\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"419\" y=\"54\" text-anchor=\"middle\">huge</text>\n  <rect x=\"470\" y=\"30\" width=\"85\" height=\"40\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"512\" y=\"54\" text-anchor=\"middle\">bad input</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "What's the best time to test your interview answer?",
     "options": [
      "Only if the interviewer asks",
      "Right after writing it, out loud, with a normal example and edge cases",
      "After the interview"
     ],
     "answer": 1,
     "why": "Finding your own bug and fixing it calmly is one of the best signals you can give."
    },
    {
     "q": "What does self.assertRaises(ValueError) check?",
     "options": [
      "That no error happens",
      "That the code inside the with block raises a ValueError",
      "That a value is returned"
     ],
     "answer": 1,
     "why": "Testing the failure cases matters as much as the happy path."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Explaining your projects, and the questions they'll ask",
   "body": "You'll be asked to explain code you wrote. Use the same five parts for every project, in about two minutes:\n\n1. **What** it does, in one sentence a non-programmer understands.\n2. **How** it's built: the main pieces and why they're separate.\n3. **Decisions**: two or three choices and their reasons.\n4. **Testing**: how you know it works.\n5. **Next / improve**: what you'd change with more time.\n\n### Your projects, in one line each\n\n| Project | One line |\n|---|---|\n| Dataset Catalog API | Flask + SQLite metadata catalog; all SQL in one store module; validation that lists every problem; deployed to AWS Elastic Beanstalk |\n| Phone Number Lookup | CLI around Google's phonenumbers; frozen dataclass; text, JSON and formula-safe CSV |\n| Flask REST API | Family API with data behind a class, thin routes, status codes and test-client tests |\n| Colors of Eden | Coloring pages from Bible chapters; weighted word counts; SVG drawn from code; Python and JS kept identical by tests |\n| Blueit | Reddit stories to narrated videos; official API with backoff; SQLite upsert; FFmpeg from Python |\n\n### Questions to expect, and short answers\n\n- **\"Why Flask?\"** Small and explicit: routes are plain functions, good for APIs this size. For a bigger app with auth and admin built in, Django.\n- **\"SQL or an ORM?\"** SQL for exact queries like ranked search; an ORM for quick CRUD and relationships. I've used both.\n- **\"How do you handle errors?\"** Validate early, answer with the right status code and a message, and raise exceptions with clear messages inside the code.\n- **\"How do you test?\"** unittest with a fresh in-memory database per test, Flask's test client for routes, and fakes for the network and clock.\n- **\"What would you improve?\"** Have one honest answer ready per project, like returning 404 and 201 and validating the body in the Family API.\n- **\"Tell me about a bug.\"** In Colors of Eden, booklet pages all used the same clip-path id, so every page borrowed the first page's clip; or Python printing `425.0` where JavaScript printed `425`, which broke the test comparing the two. Say what you saw, how you found it, how you fixed it and the test you added.\n\n### Drill\n\nSet a 20-minute timer. Pick one problem from this guide you haven't memorized, solve it in a blank file using the six moves out loud, then explain one project in two minutes. Do it once a day until the interview.\n\n```svg A two-minute project answer: what, how, decisions, testing, and what you'd improve\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"100\" fill=\"#ffffff\"/>\n  <rect x=\"5\" y=\"30\" width=\"100\" height=\"40\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"55\" y=\"54\" text-anchor=\"middle\">what</text>\n  <rect x=\"117\" y=\"30\" width=\"100\" height=\"40\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"167\" y=\"54\" text-anchor=\"middle\">how</text>\n  <rect x=\"229\" y=\"30\" width=\"100\" height=\"40\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"279\" y=\"54\" text-anchor=\"middle\">decisions</text>\n  <rect x=\"341\" y=\"30\" width=\"100\" height=\"40\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"391\" y=\"54\" text-anchor=\"middle\">testing</text>\n  <rect x=\"453\" y=\"30\" width=\"102\" height=\"40\" rx=\"8\" fill=\"#ede9fe\" stroke=\"#7c3aed\"/><text x=\"504\" y=\"54\" text-anchor=\"middle\">improve</text>\n  <path d=\"M105 50 H113 M217 50 H225 M329 50 H337 M441 50 H449\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"280\" y=\"90\" text-anchor=\"middle\">about two minutes, the same five parts for every project</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "An interviewer asks \"what would you improve?\" What's the best kind of answer?",
     "options": [
      "\"Nothing, it's finished\"",
      "One specific, honest change and why, like hashing passwords or returning 404 for missing items",
      "A list of every possible feature"
     ],
     "answer": 1,
     "why": "A specific improvement shows judgment and that you understand your own code's weak spots."
    },
    {
     "q": "Why use the same five parts to explain every project?",
     "options": [
      "Interviewers require it",
      "A fixed structure keeps the answer short and complete under pressure, and you practice one routine instead of five scripts",
      "It makes every project sound the same"
     ],
     "answer": 1,
     "why": "Structure frees your attention for the details that matter."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 20
  }
 ],
 "finish": "You practiced the skills a live Python interview checks:\n\n- A **six-move routine**: restate, examples, plan, code, test, improve\n- **Big-O** for dicts, sets, lists, sorting and nested loops\n- **Counting and grouping** with Counter, defaultdict and tuple sort keys\n- **Two sum** with a dict, **two pointers**, sets for duplicates, and cleaning messy input\n- A **small class** with private data, an id lookup and clear exceptions\n- **Testing your own answer** with asserts, edge cases and unittest\n- A **two-minute explanation** for each of your projects, and honest improvements\n\n### Challenges\n\n1. Without looking, write `group_anagrams(words)` (hint: the key is `\"\".join(sorted(word))`) with three asserts.\n2. Write `merge_intervals([(1, 3), (2, 6), (8, 10)])` → `[(1, 6), (8, 10)]`, then say its Big-O.\n3. Record yourself explaining the Dataset Catalog API in two minutes, then listen back once."
};
