// Built from guides/python.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "python",
 "title": "Python basics: a budget tracker",
 "goals": [
  "Run Python programs from a terminal and use print() and input()",
  "Store data in variables, lists and dictionaries",
  "Write functions, if/elif/else decisions and loops",
  "Handle bad input with try and except",
  "Save and load data in a JSON file",
  "Test your code with unittest and publish it on GitHub"
 ],
 "prereqs": [
  "The Get set up guide (Python 3 and VS Code with the Python extension)",
  "The JavaScript basics guide helps, since many ideas are the same"
 ],
 "sessions": [
  {
   "title": "Python from zero",
   "from": 0,
   "to": 2
  },
  {
   "title": "Functions and decisions",
   "from": 3,
   "to": 5
  },
  {
   "title": "Saving and testing",
   "from": 6,
   "to": 7
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "Your first Python program",
   "body": "So far you've written code that runs in a browser. **Python** runs on your computer directly, from the terminal. It's one of the most popular languages in the world: it runs websites (Instagram's back end), automates boring tasks, analyzes data and powers a lot of AI work. It's also known for being easy to read.\n\nIn this guide you'll build a **budget tracker**: a program you run in the terminal to record what you spend, list it, see where your money goes by category, and keep it saved between runs. The Python guide doesn't have a \"See it run\" button, because Python doesn't run in a web page; you'll run every step on your own computer. The finished project is at [github.com/TheoYanvno/budget-tracker](https://github.com/TheoYanvno/budget-tracker).\n\n### Hello, Python\n\nMake a folder called `budget-tracker`, open it in VS Code, and create a file called `budget.py`. Type:\n\n```python\nprint(\"Budget Tracker\")\nprint(\"Let's track some spending.\")\n```\n\nRun it in the terminal (``Ctrl+` ``):\n\n```text\npython budget.py\n```\n\n(On a Mac, type `python3`.) You can also click the ▶ button at the top right of VS Code, which the Python extension adds.\n\n```svg How a Python program runs: you type python budget.py, Python reads the file from top to bottom, and the output appears in the terminal\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 150\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"150\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"30\" width=\"150\" height=\"90\" rx=\"8\" fill=\"#1f2937\"/>\n  <text x=\"22\" y=\"56\" fill=\"#86efac\" font-family=\"monospace\" font-size=\"12\">$ python budget.py</text>\n  <text x=\"22\" y=\"80\" fill=\"#e5e7eb\" font-family=\"monospace\" font-size=\"12\">Budget Tracker</text>\n  <rect x=\"200\" y=\"30\" width=\"140\" height=\"90\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/>\n  <text x=\"270\" y=\"64\" text-anchor=\"middle\" font-weight=\"bold\">Python</text>\n  <text x=\"270\" y=\"84\" text-anchor=\"middle\">reads budget.py</text>\n  <text x=\"270\" y=\"102\" text-anchor=\"middle\">line by line</text>\n  <rect x=\"380\" y=\"30\" width=\"130\" height=\"90\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/>\n  <text x=\"445\" y=\"58\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"12\">budget.py</text>\n  <text x=\"445\" y=\"80\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"11\">print(...)</text>\n  <text x=\"445\" y=\"98\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"11\">print(...)</text>\n  <path d=\"M160 75 H196 M340 75 H376\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"260\" y=\"142\" text-anchor=\"middle\" fill=\"#6b7280\">print() writes to the terminal; the program ends after the last line.</text>\n</svg>\n```\n\n### Things to notice coming from JavaScript\n\n- No semicolons at the end of lines.\n- `print()` is Python's `console.log()`.\n- `#` starts a comment, instead of `//`.",
   "quiz": [
    {
     "q": "What does `print(\"Hi\")` do?",
     "options": [
      "Sends \"Hi\" to a printer",
      "Shows Hi in the terminal",
      "Saves Hi to a file"
     ],
     "answer": 1,
     "why": "`print()` writes text to the terminal, like `console.log()` does in the browser console."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Variables, numbers and strings",
   "body": "Variables in Python have no `const` or `let`: you just write a name, `=`, and a value.\n\n```python\nname = \"Alex\"          # a string (str)\namount = 12.50         # a decimal number (float)\ncount = 3              # a whole number (int)\nis_saved = True        # a boolean: True or False (capital letters)\n```\n\nPython names use `snake_case`: lowercase words joined with underscores.\n\n### f-strings\n\nAn **f-string** puts values inside text. Put `f` before the quotes and the values in `{ }`; it works like JavaScript's template literals:\n\n```python\namount = 12.5\nprint(f\"You spent ${amount:.2f} on lunch\")   # You spent $12.50 on lunch\n```\n\n`:.2f` after the value means \"a float with 2 decimal places\", which is how money should look.\n\n### Asking the user\n\n`input()` shows a prompt, waits for the user to type and press Enter, and gives back what they typed, **always as a string**. Convert it with `float()` or `int()` before doing math:\n\n```python\ntext = input(\"Amount: $\")    # \"12.50\" (a string)\namount = float(text)         # 12.5 (a number)\nprint(f\"Double that is ${amount * 2:.2f}\")\n```\n\n### Try it\n\nChange `budget.py` to ask for an amount and a category, then print a sentence with both. Run it a few times with different answers.",
   "quiz": [
    {
     "q": "What type does `input()` always return?",
     "options": [
      "A number",
      "A string",
      "Whatever the user typed: number or string"
     ],
     "answer": 1,
     "why": "Even \"12\" comes back as text. Use `float()` or `int()` to turn it into a number."
    },
    {
     "q": "What does `f\"{3.14159:.2f}\"` show?",
     "options": [
      "`3.14`",
      "`3.14159`",
      "`3`"
     ],
     "answer": 0,
     "why": "`.2f` rounds to two decimal places."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Lists and loops",
   "body": "A **list** holds many values in order, in square brackets, just like a JavaScript array. Indexes start at 0.\n\n```python\namounts = [12.5, 3.0, 40.0]\namounts.append(9.99)        # add to the end\nprint(amounts[0])           # 12.5\nprint(len(amounts))         # 4: how many items\n```\n\n### for loops and indentation\n\nA `for` loop runs once for each item:\n\n```python\nfor amount in amounts:\n    print(f\"${amount:.2f}\")\nprint(\"Done\")\n```\n\nThere are no braces in Python. **Indentation is the syntax**: the indented lines (4 spaces) are inside the loop, and `print(\"Done\")` runs after it because it isn't indented. A line ending with `:` always starts an indented block.\n\n```svg Indentation decides what's inside a block: the indented lines repeat for every item, the unindented line runs once after the loop\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 460 150\" font-family=\"monospace\" font-size=\"14\">\n  <rect width=\"460\" height=\"150\" fill=\"#ffffff\"/>\n  <text x=\"20\" y=\"40\" fill=\"#7c3aed\">for amount in amounts:</text>\n  <rect x=\"20\" y=\"52\" width=\"250\" height=\"56\" fill=\"#dcfce7\"/>\n  <text x=\"52\" y=\"74\" fill=\"#111827\">print(amount)</text>\n  <text x=\"52\" y=\"98\" fill=\"#111827\">total = total + amount</text>\n  <text x=\"20\" y=\"134\" fill=\"#111827\">print(\"Done\")</text>\n  <text x=\"290\" y=\"84\" font-family=\"sans-serif\" fill=\"#166534\">indented: runs for</text>\n  <text x=\"290\" y=\"102\" font-family=\"sans-serif\" fill=\"#166534\">every item</text>\n  <text x=\"160\" y=\"134\" font-family=\"sans-serif\" fill=\"#6b7280\">not indented: runs once, after</text>\n</svg>\n```\n\n### Adding things up\n\n`sum()` adds every number in a list. It also works with a **generator expression**, a compact loop inside the brackets that pulls one value out of each item:\n\n```python\nprint(sum(amounts))                     # 65.49\nprint(round(sum(amounts), 2))           # rounds away tiny decimal errors\n```\n\n`round(x, 2)` matters with money: computers store decimals in binary, so `0.1 + 0.2` is `0.30000000000000004`.",
   "quiz": [
    {
     "q": "How does Python know which lines are inside a `for` loop?",
     "options": [
      "They're between `{` and `}`",
      "They're indented under the line ending with `:`",
      "They end with a semicolon"
     ],
     "answer": 1,
     "why": "Python uses indentation instead of braces; the indented block belongs to the line above it that ends in a colon."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Functions and dictionaries",
   "body": "Each expense has several parts: an amount, a category, a note and a date. A **dictionary** keeps them together with names (keys), like a JavaScript object:\n\n```python\nexpense = {\"amount\": 12.5, \"category\": \"food\", \"note\": \"lunch\"}\nprint(expense[\"category\"])     # food\nexpense[\"note\"] = \"lunch with Sam\"\n```\n\n### Functions\n\n`def` defines a function. The body is indented, and `return` sends a value back:\n\n```python\ndef total(expenses):\n    \"\"\"Add up every amount.\"\"\"\n    return round(sum(e[\"amount\"] for e in expenses), 2)\n```\n\nThe string in triple quotes under `def` is a **docstring**: it explains what the function does, and VS Code shows it when you hover over a call. `sum(e[\"amount\"] for e in expenses)` means \"for each expense `e`, take its amount, and add them all up.\"\n\n### The core of the tracker\n\nHere's the first real piece of `budget.py`: a list of allowed categories, a function that adds an expense, and the total.\n\n```python\nfrom datetime import date\n\nCATEGORIES = [\"food\", \"transport\", \"bills\", \"fun\", \"other\"]\n\n\ndef add_expense(expenses, amount, category, note=\"\"):\n    \"\"\"Add one expense to the list and return it.\"\"\"\n    expense = {\n        \"amount\": round(amount, 2),\n        \"category\": category,\n        \"note\": note,\n        \"date\": date.today().isoformat(),\n    }\n    expenses.append(expense)\n    return expense\n\n\ndef total(expenses):\n    \"\"\"Add up every amount.\"\"\"\n    return round(sum(e[\"amount\"] for e in expenses), 2)\n\n\nexpenses = []\nadd_expense(expenses, 12.5, \"food\", \"lunch\")\nadd_expense(expenses, 3, \"transport\")\nprint(f\"Total: ${total(expenses):.2f}\")    # Total: $15.50\n```\n\n- `from datetime import date` **imports** a tool from Python's standard library (code that comes with Python). `date.today().isoformat()` gives today as text like `2026-11-02`.\n- `note=\"\"` is a **default value**: if you call `add_expense` without a note, it's an empty string.\n- `CATEGORIES` is in capitals by convention, meaning \"a constant: don't change it.\"",
   "quiz": [
    {
     "q": "How do you get the category out of `expense = {\"amount\": 5, \"category\": \"fun\"}`?",
     "options": [
      "`expense.category()`",
      "`expense[\"category\"]`",
      "`expense[1]`"
     ],
     "answer": 1,
     "why": "Dictionaries are looked up by key, in square brackets with the key's name."
    },
    {
     "q": "In `def add_expense(expenses, amount, category, note=\"\")`, what does `note=\"\"` do?",
     "options": [
      "Forces the note to be empty",
      "Makes note optional: it's an empty string when the caller leaves it out",
      "Deletes the note"
     ],
     "answer": 1,
     "why": "A default value is used only when that argument isn't passed."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Decisions and a menu loop",
   "body": "A program people use needs a **menu**: show the choices, read one, do it, and show the menu again until they quit.\n\n### if, elif, else\n\n```python\nif choice == \"1\":\n    print(\"Add an expense\")\nelif choice == \"2\":\n    print(\"List\")\nelse:\n    print(\"Please choose 1 or 2\")\n```\n\n`elif` is short for \"else if\". Python checks each condition in order and runs the first block whose condition is true. Comparisons are `==`, `!=`, `<`, `>`, `<=` and `>=`, and you combine them with the words `and`, `or` and `not`.\n\n### while loops\n\n`while True:` repeats forever, and `break` leaves the loop. That's the standard shape of a menu:\n\n```svg The menu loop: show the menu, read a choice, run it, and go back to the top until the user chooses Quit, which breaks out of the loop\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 190\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"480\" height=\"190\" fill=\"#ffffff\"/>\n  <rect x=\"20\" y=\"20\" width=\"120\" height=\"44\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"80\" y=\"47\" text-anchor=\"middle\">show the menu</text>\n  <rect x=\"180\" y=\"20\" width=\"120\" height=\"44\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"240\" y=\"47\" text-anchor=\"middle\">input() a choice</text>\n  <rect x=\"180\" y=\"110\" width=\"120\" height=\"44\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"240\" y=\"130\" text-anchor=\"middle\">if / elif:</text><text x=\"240\" y=\"146\" text-anchor=\"middle\">do that choice</text>\n  <rect x=\"340\" y=\"20\" width=\"120\" height=\"44\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"400\" y=\"40\" text-anchor=\"middle\">\"4\": break</text><text x=\"400\" y=\"56\" text-anchor=\"middle\">(leave the loop)</text>\n  <path d=\"M140 42 H176 M240 64 V106 M300 42 H336\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <path d=\"M180 132 H80 V68\" fill=\"none\" stroke=\"#374151\" stroke-width=\"2\" stroke-dasharray=\"5 4\"/>\n  <text x=\"90\" y=\"124\" fill=\"#6b7280\">back to the top</text>\n</svg>\n```\n\n```python\ndef main():\n    expenses = []\n    print(\"Budget Tracker\")\n    while True:\n        print(\"\\n1) Add an expense  2) List  3) Summary  4) Quit\")\n        choice = input(\"Choose 1-4: \").strip()\n        if choice == \"1\":\n            amount = float(input(\"Amount: $\"))\n            category = input(f\"Category ({', '.join(CATEGORIES)}): \").strip().lower()\n            note = input(\"Note (optional): \").strip()\n            add_expense(expenses, amount, category, note)\n            print(\"Saved.\")\n        elif choice == \"2\":\n            for e in expenses:\n                print(f\"{e['date']}  ${e['amount']:.2f}  {e['category']}  {e['note']}\")\n            print(f\"Total: ${total(expenses):.2f}\")\n        elif choice == \"4\":\n            print(\"Goodbye!\")\n            break\n        else:\n            print(\"Please choose 1, 2, 3 or 4.\")\n\n\nif __name__ == \"__main__\":\n    main()\n```\n\n- `.strip()` removes spaces around what was typed, and `.lower()` makes `Food` match `food`.\n- `\"\\n\"` in a string is a new line, so there's a blank line before each menu.\n- `', '.join(CATEGORIES)` joins the list into one string: `food, transport, bills, fun, other`.\n- `if __name__ == \"__main__\":` means \"only run `main()` when this file is run directly.\" When the tests **import** the file in step 8, the menu doesn't start. You'll see this line in almost every Python program.",
   "quiz": [
    {
     "q": "What does `break` do inside `while True:`?",
     "options": [
      "Leaves the loop, so the program goes on after it",
      "Stops the computer",
      "Skips to the next item"
     ],
     "answer": 0,
     "why": "`break` ends the loop immediately. `continue` is the one that skips to the next time around."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Bad input: try, except and checks",
   "body": "Type `abc` as the amount and the program crashes:\n\n```text\nValueError: could not convert string to float: 'abc'\n```\n\nThat's an **exception**: Python's way of saying \"something went wrong here\". Reading it from the bottom tells you what happened (`ValueError`) and the lines above show where.\n\n### Catching exceptions\n\n`try` runs code that might fail; if it raises the named exception, the `except` block runs instead of crashing:\n\n```python\ndef ask_amount():\n    while True:\n        text = input(\"Amount: $\")\n        try:\n            return float(text)\n        except ValueError:\n            print(\"Please type a number, like 12.50\")\n```\n\nThe loop keeps asking until `float()` works, and then `return` leaves the function with the number.\n\n### Raising your own\n\n`add_expense` should refuse amounts of 0 or less and unknown categories. `raise` creates an exception, so the code that called the function can decide what to do:\n\n```python\ndef add_expense(expenses, amount, category, note=\"\"):\n    \"\"\"Add one expense to the list and return it.\"\"\"\n    if amount <= 0:\n        raise ValueError(\"The amount must be more than 0.\")\n    if category not in CATEGORIES:\n        raise ValueError(f\"Choose one of: {', '.join(CATEGORIES)}\")\n    ...\n```\n\nAnd the menu catches it and shows the message:\n\n```python\ntry:\n    add_expense(expenses, amount, category, note)\nexcept ValueError as error:\n    print(error)\n    continue\n```\n\n`category not in CATEGORIES` checks whether a value is in a list. `continue` goes straight back to the top of the menu loop.\n\n### Why check in add_expense and not just in the menu?\n\nBecause then the rule is true **everywhere** `add_expense` is used: in the menu, in tests, and in any future version (a web page, say). Checks belong next to the data they protect.",
   "quiz": [
    {
     "q": "What happens when code inside `try:` raises a `ValueError` and there's an `except ValueError:` block?",
     "options": [
      "The program crashes anyway",
      "The except block runs and the program keeps going",
      "Python retries the line"
     ],
     "answer": 1,
     "why": "`except` catches that kind of exception, so you can show a friendly message instead of a crash."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Saving to a file with JSON",
   "body": "Right now, quitting loses everything. Programs save data in **files**. The easiest format is **JSON**, the same text format web APIs use: lists and dictionaries written out as text.\n\n```python\nimport json\nfrom pathlib import Path\n\nDATA_FILE = Path(__file__).with_name(\"expenses.json\")\n\n\ndef load(path=DATA_FILE):\n    \"\"\"Read the saved expenses, or start with an empty list.\"\"\"\n    try:\n        with open(path, encoding=\"utf-8\") as f:\n            return json.load(f)\n    except FileNotFoundError:\n        return []\n\n\ndef save(expenses, path=DATA_FILE):\n    \"\"\"Write every expense to the file.\"\"\"\n    with open(path, \"w\", encoding=\"utf-8\") as f:\n        json.dump(expenses, f, indent=2)\n```\n\n- `Path(__file__).with_name(\"expenses.json\")` means \"the file `expenses.json` in the same folder as `budget.py`\", so it works no matter which folder you run it from.\n- `with open(...) as f:` opens the file and **closes it automatically** when the block ends, even if there's an error.\n- `\"w\"` opens for writing (replacing what was there). Without it, files open for reading.\n- The first run has no file yet, so `load` catches `FileNotFoundError` and starts with an empty list.\n\nIn `main()`, start with `expenses = load()` and call `save(expenses)` right after each new expense. Run the program, add two expenses, quit, run it again and list them: they're still there. Open `expenses.json` in VS Code to see what it looks like.\n\n### A summary by category\n\nThe `by_category` function builds a dictionary of totals, one key per category:\n\n```python\ndef by_category(expenses):\n    \"\"\"Total spent in each category, as a dictionary.\"\"\"\n    totals = {}\n    for e in expenses:\n        totals[e[\"category\"]] = round(totals.get(e[\"category\"], 0) + e[\"amount\"], 2)\n    return totals\n```\n\n`totals.get(key, 0)` gives the current total, or 0 the first time a category appears. The final program prints each category with its share of the total and a little bar of `#` characters.",
   "quiz": [
    {
     "q": "Why use `with open(...) as f:`?",
     "options": [
      "It's the only way to open a file",
      "The file is closed automatically when the block ends, even after an error",
      "It makes the file smaller"
     ],
     "answer": 1,
     "why": "Forgetting to close files can lose data; `with` handles it for you."
    }
   ],
   "session": 2,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Testing and publishing",
   "body": "A **test** is code that runs your code and checks the answer. Instead of typing into the menu after every change, you run all the tests in a second. Python includes `unittest`. Make `test_budget.py` next to `budget.py`:\n\n```python\nimport unittest\n\nfrom budget import add_expense, by_category, total\n\n\nclass BudgetTests(unittest.TestCase):\n    def test_add_and_total(self):\n        expenses = []\n        add_expense(expenses, 12.5, \"food\", \"lunch\")\n        add_expense(expenses, 3, \"transport\")\n        self.assertEqual(total(expenses), 15.5)\n\n    def test_bad_amounts_and_categories_are_refused(self):\n        with self.assertRaises(ValueError):\n            add_expense([], 0, \"food\")\n        with self.assertRaises(ValueError):\n            add_expense([], 5, \"pizza\")\n\n    def test_totals_by_category(self):\n        expenses = []\n        add_expense(expenses, 10, \"food\")\n        add_expense(expenses, 5.25, \"food\")\n        add_expense(expenses, 40, \"bills\")\n        self.assertEqual(by_category(expenses), {\"food\": 15.25, \"bills\": 40})\n\n\nif __name__ == \"__main__\":\n    unittest.main()\n```\n\nRun them:\n\n```text\npython -m unittest\n```\n\nYou'll see `OK`, or exactly which check failed and why. Each method whose name starts with `test_` is one test. `assertEqual(a, b)` fails if `a` and `b` differ, and `assertRaises(ValueError)` fails if the code inside does **not** raise. Try breaking `total()` on purpose and watch a test catch it.\n\nThis is why `if __name__ == \"__main__\":` matters: `from budget import ...` runs `budget.py`, but the menu doesn't start during the tests.\n\n### Publish it\n\n1. Add a `.gitignore` file containing `expenses.json` and `__pycache__/`, so your personal spending and Python's cache files aren't uploaded.\n2. Add a `README.md` explaining how to run it and the tests.\n3. `git init`, `git add .`, `git commit -m \"Budget tracker\"`, make a public `budget-tracker` repository on GitHub and push (the Get set up guide shows the commands).\n\nThe complete program, with the tests and README, is at [github.com/TheoYanvno/budget-tracker](https://github.com/TheoYanvno/budget-tracker).",
   "quiz": [
    {
     "q": "What does `python -m unittest` do?",
     "options": [
      "Installs unittest",
      "Finds the test files and runs every test, then reports OK or what failed",
      "Runs the budget menu"
     ],
     "answer": 1,
     "why": "unittest discovers files named `test_*.py` and runs each `test_` method in them."
    },
    {
     "q": "Why put `expenses.json` in `.gitignore`?",
     "options": [
      "It holds your own spending data, which shouldn't be public on GitHub",
      "Git can't store JSON files",
      "It makes the program faster"
     ],
     "answer": 0,
     "why": "`.gitignore` lists files Git should never commit, such as personal data, passwords and generated files."
    }
   ],
   "session": 2,
   "kind": "read",
   "minutes": 20
  }
 ],
 "finish": "You wrote a complete Python program with tests. You learned:\n\n- Running Python, `print()` and `input()`\n- **Variables**, numbers, strings and f-strings\n- **Lists**, `for` loops, `sum()` and why indentation matters\n- **Dictionaries** and **functions** with docstrings and default values\n- **if / elif / else**, `while True` menus and `break`\n- **Exceptions**: `try`, `except` and `raise`\n- **Files and JSON** with `with open(...)`\n- **unittest**, `.gitignore`, and publishing to GitHub\n\n### Challenges\n\n1. Add a **Delete** option: list the expenses with numbers, ask which one, and remove it with `expenses.pop(number - 1)`.\n2. Add a monthly budget per category and warn when one goes over.\n3. Export to CSV with Python's `csv` module so the spending opens in Excel.\n\n### Next\n\nThe **Bonfire Notes** guide uses Python for the program that builds a real blog from Markdown files."
};
