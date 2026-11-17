---
id: pyinterview
title: Python interview practice (write and explain code)
goals: Follow a calm routine for any live-coding question: restate, examples, plan, code, test, improve; Solve the common patterns with dictionaries, sets, sorting, strings and two pointers, and say their Big-O; Write small classes and handle bad input with exceptions, the way real projects do; Test your own answer out loud with edge cases before the interviewer does; Explain your projects in two minutes, and answer "what would you improve?"
prereqs: Python basics (functions, lists, dictionaries, loops, classes)
---

## Session: A routine and the core patterns

## Step: The routine: think out loud in six moves
kind: read
time: 12

In a live-coding interview the interviewer cares about **how you think** as much as whether the code runs. A routine keeps you calm and shows your thinking. Use the same six moves every time:

1. **Restate** the problem in your own words. "So I get a list of words and return the three most common, ties broken alphabetically?"
2. **Examples**: write one normal input and one edge case (empty list, one item, duplicates) with the answer you expect.
3. **Plan** in one or two sentences before typing. "I'll count with a dictionary, then sort by count and word."
4. **Code** the simplest correct version first. Name things clearly.
5. **Test** by running your examples by hand or in the editor, line by line, out loud.
6. **Improve**: say the time and space cost (Big-O) and one thing you'd do differently with more time.

```svg The six moves: restate, examples, plan, code, test, improve, in a loop you can repeat when something changes
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 110" font-family="sans-serif" font-size="12">
  <rect width="560" height="110" fill="#ffffff"/>
  <rect x="5" y="35" width="80" height="40" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="45" y="59" text-anchor="middle">restate</text>
  <rect x="98" y="35" width="80" height="40" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="138" y="59" text-anchor="middle">examples</text>
  <rect x="191" y="35" width="80" height="40" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="231" y="59" text-anchor="middle">plan</text>
  <rect x="284" y="35" width="80" height="40" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="324" y="59" text-anchor="middle">code</text>
  <rect x="377" y="35" width="80" height="40" rx="8" fill="#fce7f3" stroke="#db2777"/><text x="417" y="59" text-anchor="middle">test</text>
  <rect x="470" y="35" width="85" height="40" rx="8" fill="#ede9fe" stroke="#7c3aed"/><text x="512" y="59" text-anchor="middle">improve</text>
  <path d="M85 55 H94 M178 55 H187 M271 55 H280 M364 55 H373 M457 55 H466" stroke="#374151" stroke-width="2"/>
  <path d="M512 75 V95 H45 V79" stroke="#9ca3af" stroke-width="1.5" fill="none" stroke-dasharray="4 3"/>
</svg>
```

### Phrases that help

- "Can I assume the input fits in memory?" (ask about limits)
- "I'll start simple and then improve it."
- "I'm not sure about the exact method name; I'd check the docs. It's something like `str.removeprefix`."
- "Let me trace this example through the code."

Saying "I don't know, here's how I'd find out" is a good answer. Guessing confidently and being wrong is a bad one.

### Big-O in one table

| Operation | Cost |
|---|---|
| Look up a key in a dict or set | O(1) on average |
| Find a value in a list (`x in my_list`) | O(n) |
| Sort | O(n log n) |
| A loop inside a loop over the same list | O(n²) |

quiz: What should you do before typing any code?
- [ ] Start typing fast so they see progress
- [x] Restate the problem, write an example and an edge case, and say your plan in a sentence or two
- [ ] Ask for the solution
why: Most mistakes in interviews come from solving the wrong problem. Two minutes of setup saves ten of fixing.

quiz: Which is faster for checking membership many times: a list or a set?
- [ ] A list
- [x] A set: O(1) on average per lookup, instead of O(n) for a list
- [ ] They're the same
why: Sets and dicts are hash tables; turning a list into a set first is a classic speed-up.

## Step: Counting and grouping with dictionaries
kind: read
time: 18

Half of all interview questions are "count something" or "group something". Python's dictionaries do both.

### The top k words

```python
import re
from collections import Counter

def top_words(text: str, k: int = 3) -> list[tuple[str, int]]:
    words = re.findall(r"[a-z']+", text.lower())
    counts = Counter(words)
    return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:k]
```

- `Counter` counts in one pass: O(n).
- `key=lambda kv: (-kv[1], kv[0])` sorts by count, highest first, then alphabetically for ties. A **tuple key** is the cleanest way to sort by several things.
- This is exactly how Colors of Eden counts a chapter's words to plan a page.

Without Counter, a plain dict does the same:

```python
counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1
```

### Grouping

```python
from collections import defaultdict

def by_publisher(datasets: list[dict]) -> dict[str, list[str]]:
    groups = defaultdict(list)
    for d in datasets:
        groups[d["publisher"]].append(d["id"])
    return dict(groups)
```

`defaultdict(list)` creates an empty list the first time a key is used, so there's no "if key not in groups" check.

### Two sum: the dict trick

"Return the positions of two numbers that add up to the target."

```python
def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    seen = {}                       # number -> its index
    for i, n in enumerate(nums):
        if target - n in seen:
            return seen[target - n], i
        seen[n] = i
    return None
```

The obvious answer checks every pair: O(n²). Remembering what you've seen in a dict makes it **O(n)**. Saying that out loud is the point of the question.

```svg Two sum with a dict: walk the list once, and for each number check whether its partner (target minus it) was already seen
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120" font-family="sans-serif" font-size="12">
  <rect width="560" height="120" fill="#ffffff"/>
  <text x="10" y="20">nums = [3, 8, 4, 5], target = 9</text>
  <rect x="10" y="35" width="60" height="35" fill="#f3f4f6" stroke="#6b7280"/><text x="40" y="57" text-anchor="middle">3</text>
  <rect x="75" y="35" width="60" height="35" fill="#f3f4f6" stroke="#6b7280"/><text x="105" y="57" text-anchor="middle">8</text>
  <rect x="140" y="35" width="60" height="35" fill="#f3f4f6" stroke="#6b7280"/><text x="170" y="57" text-anchor="middle">4</text>
  <rect x="205" y="35" width="60" height="35" fill="#dcfce7" stroke="#16a34a"/><text x="235" y="57" text-anchor="middle">5</text>
  <rect x="300" y="30" width="250" height="45" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="425" y="50" text-anchor="middle">seen = {3: 0, 8: 1, 4: 2}</text><text x="425" y="66" text-anchor="middle">at 5: is 9 − 5 = 4 seen? yes → (2, 3)</text>
  <text x="10" y="100">one pass, O(n), instead of checking every pair, O(n²)</text>
</svg>
```

quiz: How do you sort word counts by count (highest first) and then alphabetically?
- [ ] sorted(counts) then reverse
- [x] sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
- [ ] counts.sort()
why: A tuple key sorts by its first item, then the second; negating the count makes it descending.

quiz: Why is the dict version of two sum O(n)?
- [ ] Dicts are sorted
- [x] It walks the list once, and each "have I seen the partner?" check is an O(1) dict lookup
- [ ] It stops after two numbers
why: Trading a little memory (the dict) for time is the idea behind many interview answers.

## Step: Strings, two pointers and sets
kind: read
time: 15

### Is it a palindrome? Two pointers

```python
def is_palindrome(s: str) -> bool:
    chars = [c.lower() for c in s if c.isalnum()]
    i, j = 0, len(chars) - 1
    while i < j:
        if chars[i] != chars[j]:
            return False
        i, j = i + 1, j - 1
    return True
```

`"A man, a plan, a canal: Panama"` is True. Two pointers walking toward each other is O(n) with no extra copy of the reversed string. (`chars == chars[::-1]` also works and is fine to mention first.)

### Duplicates with a set

```python
def first_duplicate(items):
    seen = set()
    for x in items:
        if x in seen:
            return x
        seen.add(x)
    return None
```

### Normalize messy input

Real data is messy. A question like "clean these phone numbers" or "normalize these keywords" checks that you handle it carefully:

```python
def normalize_keywords(raw: list[str]) -> list[str]:
    return sorted({k.strip().lower() for k in raw if k and k.strip()})
```

A **set comprehension** removes duplicates, `strip()` and `lower()` clean each one, the `if` drops blanks, and `sorted` gives a stable order. This one line is the Dataset Catalog API's keyword cleaning.

```svg Two pointers: one starts at each end and they move toward the middle, comparing as they go
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 110" font-family="monospace" font-size="14">
  <rect width="560" height="110" fill="#ffffff"/>
  <g transform="translate(60 30)">
    <rect x="0" y="0" width="40" height="40" fill="#dbeafe" stroke="#2563eb"/><text x="20" y="26" text-anchor="middle">r</text>
    <rect x="45" y="0" width="40" height="40" fill="#f3f4f6" stroke="#6b7280"/><text x="65" y="26" text-anchor="middle">a</text>
    <rect x="90" y="0" width="40" height="40" fill="#f3f4f6" stroke="#6b7280"/><text x="110" y="26" text-anchor="middle">c</text>
    <rect x="135" y="0" width="40" height="40" fill="#f3f4f6" stroke="#6b7280"/><text x="155" y="26" text-anchor="middle">e</text>
    <rect x="180" y="0" width="40" height="40" fill="#f3f4f6" stroke="#6b7280"/><text x="200" y="26" text-anchor="middle">c</text>
    <rect x="225" y="0" width="40" height="40" fill="#f3f4f6" stroke="#6b7280"/><text x="245" y="26" text-anchor="middle">a</text>
    <rect x="270" y="0" width="40" height="40" fill="#dbeafe" stroke="#2563eb"/><text x="290" y="26" text-anchor="middle">r</text>
    <text x="20" y="65" text-anchor="middle" font-family="sans-serif" font-size="12">i →</text><text x="290" y="65" text-anchor="middle" font-family="sans-serif" font-size="12">← j</text>
  </g>
  <text x="400" y="55" font-family="sans-serif" font-size="12">compare, then</text><text x="400" y="72" font-family="sans-serif" font-size="12">move both inward</text>
</svg>
```

quiz: Why does the palindrome check skip characters that aren't letters or digits?
- [ ] Python can't compare punctuation
- [x] Spaces, commas and colons shouldn't decide the answer; only letters and digits are compared, ignoring case
- [ ] To make the string shorter for speed
why: Clarifying what counts (case, spaces, punctuation) is part of restating the problem.

quiz: What does {k.strip().lower() for k in raw if k and k.strip()} produce?
- [ ] A list with duplicates
- [x] A set of cleaned keywords with blanks and duplicates removed
- [ ] A dictionary
why: Curly braces with one expression make a set comprehension; sets keep one copy of each value.

## Session: Classes, errors, tests and talking about your work

## Step: A small class, and errors with useful messages
kind: read
time: 18

"Design a class" questions check that you can keep data and behavior together. A to-do list, a parking lot, a bank account, a family of members: the shape is the same.

```python
class Library:
    def __init__(self):
        self._books: dict[str, dict] = {}          # id -> book

    def add(self, book_id: str, title: str) -> None:
        if not title.strip():
            raise ValueError("title can't be empty")
        if book_id in self._books:
            raise ValueError(f"{book_id} is already in the library")
        self._books[book_id] = {"title": title.strip(), "out": False}

    def check_out(self, book_id: str) -> None:
        book = self._get(book_id)
        if book["out"]:
            raise ValueError(f"{book_id} is already checked out")
        book["out"] = True

    def _get(self, book_id: str) -> dict:
        try:
            return self._books[book_id]
        except KeyError:
            raise KeyError(f"no book with id {book_id}") from None

    def available(self) -> list[str]:
        return sorted(b["title"] for b in self._books.values() if not b["out"])
```

Things interviewers look for:

- **Data behind methods**: `_books` has an underscore; callers use the methods.
- **A dict by id**, so lookups are O(1) instead of searching a list (better than the Family API's list, which I'd change now).
- **Errors with messages that say what's wrong**, raised early: `ValueError` for bad values, `KeyError` for a missing id.
- **Small helpers** like `_get` so the "not found" message is written once.

### Reading a file safely

```python
def read_ids(path: str) -> list[str]:
    with open(path, encoding="utf-8") as fh:
        return [line.strip() for line in fh if line.strip() and not line.startswith("#")]
```

`with` closes the file even if something fails, and `encoding="utf-8"` keeps it working on Windows.

```svg A class keeps its data private and exposes methods; each method checks its input and raises a clear error before changing anything
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120" font-family="sans-serif" font-size="12">
  <rect width="560" height="120" fill="#ffffff"/>
  <rect x="10" y="10" width="360" height="100" rx="10" fill="#fff7ed" stroke="#f59e0b"/><text x="190" y="28" text-anchor="middle" font-weight="bold">class Library</text>
  <rect x="25" y="40" width="150" height="60" rx="6" fill="#ffffff" stroke="#f59e0b"/><text x="100" y="62" text-anchor="middle">add · check_out</text><text x="100" y="80" text-anchor="middle">available</text>
  <rect x="200" y="40" width="155" height="60" rx="6" fill="#e5e7eb" stroke="#374151"/><text x="277" y="62" text-anchor="middle">_books (private)</text><text x="277" y="80" text-anchor="middle">id → book</text>
  <rect x="400" y="40" width="150" height="60" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="475" y="62" text-anchor="middle">ValueError /</text><text x="475" y="80" text-anchor="middle">KeyError + message</text>
  <path d="M175 70 H196 M370 70 H396" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why store the books in a dict keyed by id instead of a list?
- [ ] Lists can't hold dicts
- [x] Finding a book by id is O(1) in a dict instead of searching the whole list
- [ ] Dicts use less memory
why: Choosing the right data structure is usually the biggest improvement you can make.

quiz: Why raise ValueError with a message instead of returning False?
- [x] The caller can't silently ignore it, and the message says exactly what went wrong
- [ ] Python doesn't allow returning False
- [ ] Exceptions are faster
why: Errors that explain themselves make bugs quick to find, for you and for whoever uses your code.

## Step: Test your own answer before they do
kind: read
time: 15

The strongest move in a live interview is testing your own code without being asked. Write a few asserts right under your function:

```python
assert top_words("the cat the dog the end", 2) == [("the", 3), ("cat", 1)]
assert top_words("", 3) == []
assert two_sum([3, 8, 4, 5], 9) == (2, 3)
assert two_sum([1, 2], 10) is None
assert is_palindrome("A man, a plan, a canal: Panama")
assert not is_palindrome("abc")
print("all good")
```

### The edge-case checklist

Run through it out loud:

- **Empty**: `[]`, `""`, `{}`
- **One item**
- **Duplicates** and **ties**
- **Negative numbers** and **zero**
- **Very large** input (would O(n²) be too slow?)
- **Bad input**: `None`, the wrong type, extra spaces, upper case

### When there's time: unittest

```python
import unittest

class LibraryTests(unittest.TestCase):
    def test_check_out_twice_fails(self):
        lib = Library()
        lib.add("b1", "Dune")
        lib.check_out("b1")
        with self.assertRaises(ValueError):
            lib.check_out("b1")
```

`assertRaises` checks that the right error happens. Every one of my projects has tests like this; mention that you write tests first for tricky rules.

```svg Edge cases to say out loud: empty, one item, duplicates and ties, negatives and zero, very large input, and bad input
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 100" font-family="sans-serif" font-size="12">
  <rect width="560" height="100" fill="#ffffff"/>
  <rect x="5" y="30" width="85" height="40" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="47" y="54" text-anchor="middle">empty</text>
  <rect x="98" y="30" width="85" height="40" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="140" y="54" text-anchor="middle">one item</text>
  <rect x="191" y="30" width="85" height="40" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="233" y="54" text-anchor="middle">dupes, ties</text>
  <rect x="284" y="30" width="85" height="40" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="326" y="54" text-anchor="middle">0, negative</text>
  <rect x="377" y="30" width="85" height="40" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="419" y="54" text-anchor="middle">huge</text>
  <rect x="470" y="30" width="85" height="40" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="512" y="54" text-anchor="middle">bad input</text>
</svg>
```

quiz: What's the best time to test your interview answer?
- [ ] Only if the interviewer asks
- [x] Right after writing it, out loud, with a normal example and edge cases
- [ ] After the interview
why: Finding your own bug and fixing it calmly is one of the best signals you can give.

quiz: What does self.assertRaises(ValueError) check?
- [ ] That no error happens
- [x] That the code inside the with block raises a ValueError
- [ ] That a value is returned
why: Testing the failure cases matters as much as the happy path.

## Step: Explaining your projects, and the questions they'll ask
kind: read
time: 20

You'll be asked to explain code you wrote. Use the same five parts for every project, in about two minutes:

1. **What** it does, in one sentence a non-programmer understands.
2. **How** it's built: the main pieces and why they're separate.
3. **Decisions**: two or three choices and their reasons.
4. **Testing**: how you know it works.
5. **Next / improve**: what you'd change with more time.

### Your projects, in one line each

| Project | One line |
|---|---|
| Dataset Catalog API | Flask + SQLite metadata catalog; all SQL in one store module; validation that lists every problem; deployed to AWS Elastic Beanstalk |
| Phone Number Lookup | CLI around Google's phonenumbers; frozen dataclass; text, JSON and formula-safe CSV |
| Flask REST API | Family API with data behind a class, thin routes, status codes and test-client tests |
| Colors of Eden | Coloring pages from Bible chapters; weighted word counts; SVG drawn from code; Python and JS kept identical by tests |
| Blueit | Reddit stories to narrated videos; official API with backoff; SQLite upsert; FFmpeg from Python |

### Questions to expect, and short answers

- **"Why Flask?"** Small and explicit: routes are plain functions, good for APIs this size. For a bigger app with auth and admin built in, Django.
- **"SQL or an ORM?"** SQL for exact queries like ranked search; an ORM for quick CRUD and relationships. I've used both.
- **"How do you handle errors?"** Validate early, answer with the right status code and a message, and raise exceptions with clear messages inside the code.
- **"How do you test?"** unittest with a fresh in-memory database per test, Flask's test client for routes, and fakes for the network and clock.
- **"What would you improve?"** Have one honest answer ready per project, like returning 404 and 201 and validating the body in the Family API.
- **"Tell me about a bug."** In Colors of Eden, booklet pages all used the same clip-path id, so every page borrowed the first page's clip; or Python printing `425.0` where JavaScript printed `425`, which broke the test comparing the two. Say what you saw, how you found it, how you fixed it and the test you added.

### Drill

Set a 20-minute timer. Pick one problem from this guide you haven't memorized, solve it in a blank file using the six moves out loud, then explain one project in two minutes. Do it once a day until the interview.

```svg A two-minute project answer: what, how, decisions, testing, and what you'd improve
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 100" font-family="sans-serif" font-size="12">
  <rect width="560" height="100" fill="#ffffff"/>
  <rect x="5" y="30" width="100" height="40" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="55" y="54" text-anchor="middle">what</text>
  <rect x="117" y="30" width="100" height="40" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="167" y="54" text-anchor="middle">how</text>
  <rect x="229" y="30" width="100" height="40" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="279" y="54" text-anchor="middle">decisions</text>
  <rect x="341" y="30" width="100" height="40" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="391" y="54" text-anchor="middle">testing</text>
  <rect x="453" y="30" width="102" height="40" rx="8" fill="#ede9fe" stroke="#7c3aed"/><text x="504" y="54" text-anchor="middle">improve</text>
  <path d="M105 50 H113 M217 50 H225 M329 50 H337 M441 50 H449" stroke="#374151" stroke-width="2"/>
  <text x="280" y="90" text-anchor="middle">about two minutes, the same five parts for every project</text>
</svg>
```

quiz: An interviewer asks "what would you improve?" What's the best kind of answer?
- [ ] "Nothing, it's finished"
- [x] One specific, honest change and why, like hashing passwords or returning 404 for missing items
- [ ] A list of every possible feature
why: A specific improvement shows judgment and that you understand your own code's weak spots.

quiz: Why use the same five parts to explain every project?
- [ ] Interviewers require it
- [x] A fixed structure keeps the answer short and complete under pressure, and you practice one routine instead of five scripts
- [ ] It makes every project sound the same
why: Structure frees your attention for the details that matter.

## Finish

You practiced the skills a live Python interview checks:

- A **six-move routine**: restate, examples, plan, code, test, improve
- **Big-O** for dicts, sets, lists, sorting and nested loops
- **Counting and grouping** with Counter, defaultdict and tuple sort keys
- **Two sum** with a dict, **two pointers**, sets for duplicates, and cleaning messy input
- A **small class** with private data, an id lookup and clear exceptions
- **Testing your own answer** with asserts, edge cases and unittest
- A **two-minute explanation** for each of your projects, and honest improvements

### Challenges

1. Without looking, write `group_anagrams(words)` (hint: the key is `"".join(sorted(word))`) with three asserts.
2. Write `merge_intervals([(1, 3), (2, 6), (8, 10)])` → `[(1, 6), (8, 10)]`, then say its Big-O.
3. Record yourself explaining the Dataset Catalog API in two minutes, then listen back once.
