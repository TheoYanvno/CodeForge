---
id: python
title: Python basics: a budget tracker
goals: Run Python programs from a terminal and use print() and input(); Store data in variables, lists and dictionaries; Write functions, if/elif/else decisions and loops; Handle bad input with try and except; Save and load data in a JSON file; Test your code with unittest and publish it on GitHub
prereqs: The Get set up guide (Python 3 and VS Code with the Python extension); The JavaScript basics guide helps, since many ideas are the same
---

## Session: Python from zero

## Step: Your first Python program
kind: read
time: 12

So far you've written code that runs in a browser. **Python** runs on your computer directly, from the terminal. It's one of the most popular languages in the world: it runs websites (Instagram's back end), automates boring tasks, analyzes data and powers a lot of AI work. It's also known for being easy to read.

In this guide you'll build a **budget tracker**: a program you run in the terminal to record what you spend, list it, see where your money goes by category, and keep it saved between runs. The Python guide doesn't have a "See it run" button, because Python doesn't run in a web page; you'll run every step on your own computer. The finished project is at [github.com/TheoYanvno/budget-tracker](https://github.com/TheoYanvno/budget-tracker).

### Hello, Python

Make a folder called `budget-tracker`, open it in VS Code, and create a file called `budget.py`. Type:

```python
print("Budget Tracker")
print("Let's track some spending.")
```

Run it in the terminal (``Ctrl+` ``):

```text
python budget.py
```

(On a Mac, type `python3`.) You can also click the ▶ button at the top right of VS Code, which the Python extension adds.

```svg How a Python program runs: you type python budget.py, Python reads the file from top to bottom, and the output appears in the terminal
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 150" font-family="sans-serif" font-size="13">
  <rect width="520" height="150" fill="#ffffff"/>
  <rect x="10" y="30" width="150" height="90" rx="8" fill="#1f2937"/>
  <text x="22" y="56" fill="#86efac" font-family="monospace" font-size="12">$ python budget.py</text>
  <text x="22" y="80" fill="#e5e7eb" font-family="monospace" font-size="12">Budget Tracker</text>
  <rect x="200" y="30" width="140" height="90" rx="8" fill="#dbeafe" stroke="#2563eb"/>
  <text x="270" y="64" text-anchor="middle" font-weight="bold">Python</text>
  <text x="270" y="84" text-anchor="middle">reads budget.py</text>
  <text x="270" y="102" text-anchor="middle">line by line</text>
  <rect x="380" y="30" width="130" height="90" rx="8" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="445" y="58" text-anchor="middle" font-family="monospace" font-size="12">budget.py</text>
  <text x="445" y="80" text-anchor="middle" font-family="monospace" font-size="11">print(...)</text>
  <text x="445" y="98" text-anchor="middle" font-family="monospace" font-size="11">print(...)</text>
  <path d="M160 75 H196 M340 75 H376" stroke="#374151" stroke-width="2"/>
  <text x="260" y="142" text-anchor="middle" fill="#6b7280">print() writes to the terminal; the program ends after the last line.</text>
</svg>
```

### Things to notice coming from JavaScript

- No semicolons at the end of lines.
- `print()` is Python's `console.log()`.
- `#` starts a comment, instead of `//`.

quiz: What does `print("Hi")` do?
- [ ] Sends "Hi" to a printer
- [x] Shows Hi in the terminal
- [ ] Saves Hi to a file
why: `print()` writes text to the terminal, like `console.log()` does in the browser console.

## Step: Variables, numbers and strings
kind: read
time: 15

Variables in Python have no `const` or `let`: you just write a name, `=`, and a value.

```python
name = "Alex"          # a string (str)
amount = 12.50         # a decimal number (float)
count = 3              # a whole number (int)
is_saved = True        # a boolean: True or False (capital letters)
```

Python names use `snake_case`: lowercase words joined with underscores.

### f-strings

An **f-string** puts values inside text. Put `f` before the quotes and the values in `{ }`; it works like JavaScript's template literals:

```python
amount = 12.5
print(f"You spent ${amount:.2f} on lunch")   # You spent $12.50 on lunch
```

`:.2f` after the value means "a float with 2 decimal places", which is how money should look.

### Asking the user

`input()` shows a prompt, waits for the user to type and press Enter, and gives back what they typed, **always as a string**. Convert it with `float()` or `int()` before doing math:

```python
text = input("Amount: $")    # "12.50" (a string)
amount = float(text)         # 12.5 (a number)
print(f"Double that is ${amount * 2:.2f}")
```

### Try it

Change `budget.py` to ask for an amount and a category, then print a sentence with both. Run it a few times with different answers.

quiz: What type does `input()` always return?
- [ ] A number
- [x] A string
- [ ] Whatever the user typed: number or string
why: Even "12" comes back as text. Use `float()` or `int()` to turn it into a number.

quiz: What does `f"{3.14159:.2f}"` show?
- [x] `3.14`
- [ ] `3.14159`
- [ ] `3`
why: `.2f` rounds to two decimal places.

## Step: Lists and loops
kind: read
time: 15

A **list** holds many values in order, in square brackets, just like a JavaScript array. Indexes start at 0.

```python
amounts = [12.5, 3.0, 40.0]
amounts.append(9.99)        # add to the end
print(amounts[0])           # 12.5
print(len(amounts))         # 4: how many items
```

### for loops and indentation

A `for` loop runs once for each item:

```python
for amount in amounts:
    print(f"${amount:.2f}")
print("Done")
```

There are no braces in Python. **Indentation is the syntax**: the indented lines (4 spaces) are inside the loop, and `print("Done")` runs after it because it isn't indented. A line ending with `:` always starts an indented block.

```svg Indentation decides what's inside a block: the indented lines repeat for every item, the unindented line runs once after the loop
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 150" font-family="monospace" font-size="14">
  <rect width="460" height="150" fill="#ffffff"/>
  <text x="20" y="40" fill="#7c3aed">for amount in amounts:</text>
  <rect x="20" y="52" width="250" height="56" fill="#dcfce7"/>
  <text x="52" y="74" fill="#111827">print(amount)</text>
  <text x="52" y="98" fill="#111827">total = total + amount</text>
  <text x="20" y="134" fill="#111827">print("Done")</text>
  <text x="290" y="84" font-family="sans-serif" fill="#166534">indented: runs for</text>
  <text x="290" y="102" font-family="sans-serif" fill="#166534">every item</text>
  <text x="160" y="134" font-family="sans-serif" fill="#6b7280">not indented: runs once, after</text>
</svg>
```

### Adding things up

`sum()` adds every number in a list. It also works with a **generator expression**, a compact loop inside the brackets that pulls one value out of each item:

```python
print(sum(amounts))                     # 65.49
print(round(sum(amounts), 2))           # rounds away tiny decimal errors
```

`round(x, 2)` matters with money: computers store decimals in binary, so `0.1 + 0.2` is `0.30000000000000004`.

quiz: How does Python know which lines are inside a `for` loop?
- [ ] They're between `{` and `}`
- [x] They're indented under the line ending with `:`
- [ ] They end with a semicolon
why: Python uses indentation instead of braces; the indented block belongs to the line above it that ends in a colon.

## Session: Functions and decisions

## Step: Functions and dictionaries
kind: read
time: 18

Each expense has several parts: an amount, a category, a note and a date. A **dictionary** keeps them together with names (keys), like a JavaScript object:

```python
expense = {"amount": 12.5, "category": "food", "note": "lunch"}
print(expense["category"])     # food
expense["note"] = "lunch with Sam"
```

### Functions

`def` defines a function. The body is indented, and `return` sends a value back:

```python
def total(expenses):
    """Add up every amount."""
    return round(sum(e["amount"] for e in expenses), 2)
```

The string in triple quotes under `def` is a **docstring**: it explains what the function does, and VS Code shows it when you hover over a call. `sum(e["amount"] for e in expenses)` means "for each expense `e`, take its amount, and add them all up."

### The core of the tracker

Here's the first real piece of `budget.py`: a list of allowed categories, a function that adds an expense, and the total.

```python
from datetime import date

CATEGORIES = ["food", "transport", "bills", "fun", "other"]


def add_expense(expenses, amount, category, note=""):
    """Add one expense to the list and return it."""
    expense = {
        "amount": round(amount, 2),
        "category": category,
        "note": note,
        "date": date.today().isoformat(),
    }
    expenses.append(expense)
    return expense


def total(expenses):
    """Add up every amount."""
    return round(sum(e["amount"] for e in expenses), 2)


expenses = []
add_expense(expenses, 12.5, "food", "lunch")
add_expense(expenses, 3, "transport")
print(f"Total: ${total(expenses):.2f}")    # Total: $15.50
```

- `from datetime import date` **imports** a tool from Python's standard library (code that comes with Python). `date.today().isoformat()` gives today as text like `2026-11-02`.
- `note=""` is a **default value**: if you call `add_expense` without a note, it's an empty string.
- `CATEGORIES` is in capitals by convention, meaning "a constant: don't change it."

quiz: How do you get the category out of `expense = {"amount": 5, "category": "fun"}`?
- [ ] `expense.category()`
- [x] `expense["category"]`
- [ ] `expense[1]`
why: Dictionaries are looked up by key, in square brackets with the key's name.

quiz: In `def add_expense(expenses, amount, category, note="")`, what does `note=""` do?
- [ ] Forces the note to be empty
- [x] Makes note optional: it's an empty string when the caller leaves it out
- [ ] Deletes the note
why: A default value is used only when that argument isn't passed.

## Step: Decisions and a menu loop
kind: read
time: 18

A program people use needs a **menu**: show the choices, read one, do it, and show the menu again until they quit.

### if, elif, else

```python
if choice == "1":
    print("Add an expense")
elif choice == "2":
    print("List")
else:
    print("Please choose 1 or 2")
```

`elif` is short for "else if". Python checks each condition in order and runs the first block whose condition is true. Comparisons are `==`, `!=`, `<`, `>`, `<=` and `>=`, and you combine them with the words `and`, `or` and `not`.

### while loops

`while True:` repeats forever, and `break` leaves the loop. That's the standard shape of a menu:

```svg The menu loop: show the menu, read a choice, run it, and go back to the top until the user chooses Quit, which breaks out of the loop
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 190" font-family="sans-serif" font-size="13">
  <rect width="480" height="190" fill="#ffffff"/>
  <rect x="20" y="20" width="120" height="44" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="80" y="47" text-anchor="middle">show the menu</text>
  <rect x="180" y="20" width="120" height="44" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="240" y="47" text-anchor="middle">input() a choice</text>
  <rect x="180" y="110" width="120" height="44" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="240" y="130" text-anchor="middle">if / elif:</text><text x="240" y="146" text-anchor="middle">do that choice</text>
  <rect x="340" y="20" width="120" height="44" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="400" y="40" text-anchor="middle">"4": break</text><text x="400" y="56" text-anchor="middle">(leave the loop)</text>
  <path d="M140 42 H176 M240 64 V106 M300 42 H336" stroke="#374151" stroke-width="2"/>
  <path d="M180 132 H80 V68" fill="none" stroke="#374151" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="90" y="124" fill="#6b7280">back to the top</text>
</svg>
```

```python
def main():
    expenses = []
    print("Budget Tracker")
    while True:
        print("\n1) Add an expense  2) List  3) Summary  4) Quit")
        choice = input("Choose 1-4: ").strip()
        if choice == "1":
            amount = float(input("Amount: $"))
            category = input(f"Category ({', '.join(CATEGORIES)}): ").strip().lower()
            note = input("Note (optional): ").strip()
            add_expense(expenses, amount, category, note)
            print("Saved.")
        elif choice == "2":
            for e in expenses:
                print(f"{e['date']}  ${e['amount']:.2f}  {e['category']}  {e['note']}")
            print(f"Total: ${total(expenses):.2f}")
        elif choice == "4":
            print("Goodbye!")
            break
        else:
            print("Please choose 1, 2, 3 or 4.")


if __name__ == "__main__":
    main()
```

- `.strip()` removes spaces around what was typed, and `.lower()` makes `Food` match `food`.
- `"\n"` in a string is a new line, so there's a blank line before each menu.
- `', '.join(CATEGORIES)` joins the list into one string: `food, transport, bills, fun, other`.
- `if __name__ == "__main__":` means "only run `main()` when this file is run directly." When the tests **import** the file in step 8, the menu doesn't start. You'll see this line in almost every Python program.

quiz: What does `break` do inside `while True:`?
- [x] Leaves the loop, so the program goes on after it
- [ ] Stops the computer
- [ ] Skips to the next item
why: `break` ends the loop immediately. `continue` is the one that skips to the next time around.

## Step: Bad input: try, except and checks
kind: read
time: 15

Type `abc` as the amount and the program crashes:

```text
ValueError: could not convert string to float: 'abc'
```

That's an **exception**: Python's way of saying "something went wrong here". Reading it from the bottom tells you what happened (`ValueError`) and the lines above show where.

### Catching exceptions

`try` runs code that might fail; if it raises the named exception, the `except` block runs instead of crashing:

```python
def ask_amount():
    while True:
        text = input("Amount: $")
        try:
            return float(text)
        except ValueError:
            print("Please type a number, like 12.50")
```

The loop keeps asking until `float()` works, and then `return` leaves the function with the number.

### Raising your own

`add_expense` should refuse amounts of 0 or less and unknown categories. `raise` creates an exception, so the code that called the function can decide what to do:

```python
def add_expense(expenses, amount, category, note=""):
    """Add one expense to the list and return it."""
    if amount <= 0:
        raise ValueError("The amount must be more than 0.")
    if category not in CATEGORIES:
        raise ValueError(f"Choose one of: {', '.join(CATEGORIES)}")
    ...
```

And the menu catches it and shows the message:

```python
try:
    add_expense(expenses, amount, category, note)
except ValueError as error:
    print(error)
    continue
```

`category not in CATEGORIES` checks whether a value is in a list. `continue` goes straight back to the top of the menu loop.

### Why check in add_expense and not just in the menu?

Because then the rule is true **everywhere** `add_expense` is used: in the menu, in tests, and in any future version (a web page, say). Checks belong next to the data they protect.

quiz: What happens when code inside `try:` raises a `ValueError` and there's an `except ValueError:` block?
- [ ] The program crashes anyway
- [x] The except block runs and the program keeps going
- [ ] Python retries the line
why: `except` catches that kind of exception, so you can show a friendly message instead of a crash.

## Session: Saving and testing

## Step: Saving to a file with JSON
kind: read
time: 18

Right now, quitting loses everything. Programs save data in **files**. The easiest format is **JSON**, the same text format web APIs use: lists and dictionaries written out as text.

```python
import json
from pathlib import Path

DATA_FILE = Path(__file__).with_name("expenses.json")


def load(path=DATA_FILE):
    """Read the saved expenses, or start with an empty list."""
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def save(expenses, path=DATA_FILE):
    """Write every expense to the file."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(expenses, f, indent=2)
```

- `Path(__file__).with_name("expenses.json")` means "the file `expenses.json` in the same folder as `budget.py`", so it works no matter which folder you run it from.
- `with open(...) as f:` opens the file and **closes it automatically** when the block ends, even if there's an error.
- `"w"` opens for writing (replacing what was there). Without it, files open for reading.
- The first run has no file yet, so `load` catches `FileNotFoundError` and starts with an empty list.

In `main()`, start with `expenses = load()` and call `save(expenses)` right after each new expense. Run the program, add two expenses, quit, run it again and list them: they're still there. Open `expenses.json` in VS Code to see what it looks like.

### A summary by category

The `by_category` function builds a dictionary of totals, one key per category:

```python
def by_category(expenses):
    """Total spent in each category, as a dictionary."""
    totals = {}
    for e in expenses:
        totals[e["category"]] = round(totals.get(e["category"], 0) + e["amount"], 2)
    return totals
```

`totals.get(key, 0)` gives the current total, or 0 the first time a category appears. The final program prints each category with its share of the total and a little bar of `#` characters.

quiz: Why use `with open(...) as f:`?
- [ ] It's the only way to open a file
- [x] The file is closed automatically when the block ends, even after an error
- [ ] It makes the file smaller
why: Forgetting to close files can lose data; `with` handles it for you.

## Step: Testing and publishing
kind: read
time: 20

A **test** is code that runs your code and checks the answer. Instead of typing into the menu after every change, you run all the tests in a second. Python includes `unittest`. Make `test_budget.py` next to `budget.py`:

```python
import unittest

from budget import add_expense, by_category, total


class BudgetTests(unittest.TestCase):
    def test_add_and_total(self):
        expenses = []
        add_expense(expenses, 12.5, "food", "lunch")
        add_expense(expenses, 3, "transport")
        self.assertEqual(total(expenses), 15.5)

    def test_bad_amounts_and_categories_are_refused(self):
        with self.assertRaises(ValueError):
            add_expense([], 0, "food")
        with self.assertRaises(ValueError):
            add_expense([], 5, "pizza")

    def test_totals_by_category(self):
        expenses = []
        add_expense(expenses, 10, "food")
        add_expense(expenses, 5.25, "food")
        add_expense(expenses, 40, "bills")
        self.assertEqual(by_category(expenses), {"food": 15.25, "bills": 40})


if __name__ == "__main__":
    unittest.main()
```

Run them:

```text
python -m unittest
```

You'll see `OK`, or exactly which check failed and why. Each method whose name starts with `test_` is one test. `assertEqual(a, b)` fails if `a` and `b` differ, and `assertRaises(ValueError)` fails if the code inside does **not** raise. Try breaking `total()` on purpose and watch a test catch it.

This is why `if __name__ == "__main__":` matters: `from budget import ...` runs `budget.py`, but the menu doesn't start during the tests.

### Publish it

1. Add a `.gitignore` file containing `expenses.json` and `__pycache__/`, so your personal spending and Python's cache files aren't uploaded.
2. Add a `README.md` explaining how to run it and the tests.
3. `git init`, `git add .`, `git commit -m "Budget tracker"`, make a public `budget-tracker` repository on GitHub and push (the Get set up guide shows the commands).

The complete program, with the tests and README, is at [github.com/TheoYanvno/budget-tracker](https://github.com/TheoYanvno/budget-tracker).

quiz: What does `python -m unittest` do?
- [ ] Installs unittest
- [x] Finds the test files and runs every test, then reports OK or what failed
- [ ] Runs the budget menu
why: unittest discovers files named `test_*.py` and runs each `test_` method in them.

quiz: Why put `expenses.json` in `.gitignore`?
- [x] It holds your own spending data, which shouldn't be public on GitHub
- [ ] Git can't store JSON files
- [ ] It makes the program faster
why: `.gitignore` lists files Git should never commit, such as personal data, passwords and generated files.

## Finish

You wrote a complete Python program with tests. You learned:

- Running Python, `print()` and `input()`
- **Variables**, numbers, strings and f-strings
- **Lists**, `for` loops, `sum()` and why indentation matters
- **Dictionaries** and **functions** with docstrings and default values
- **if / elif / else**, `while True` menus and `break`
- **Exceptions**: `try`, `except` and `raise`
- **Files and JSON** with `with open(...)`
- **unittest**, `.gitignore`, and publishing to GitHub

### Challenges

1. Add a **Delete** option: list the expenses with numbers, ask which one, and remove it with `expenses.pop(number - 1)`.
2. Add a monthly budget per category and warn when one goes over.
3. Export to CSV with Python's `csv` module so the spending opens in Excel.

### Next

The **Bonfire Notes** guide uses Python for the program that builds a real blog from Markdown files.
