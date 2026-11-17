// Built from guides/phonelookup.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "phonelookup",
 "title": "Phone Number Lookup (Python CLI)",
 "goals": [
  "Use a well-known library (phonenumbers) instead of writing your own parsing rules",
  "Keep data, logic and output in separate modules with a frozen dataclass between them",
  "Turn library errors into plain advice for the person typing",
  "Print the same results as aligned text, JSON or a spreadsheet-safe CSV",
  "Build a command-line tool with argparse that reads arguments, a file or a prompt",
  "Test each module on its own and explain the project's limits honestly"
 ],
 "prereqs": [
  "Python basics (functions, dictionaries, exceptions, unittest)"
 ],
 "sessions": [
  {
   "title": "Looking a number up",
   "from": 0,
   "to": 3
  },
  {
   "title": "Reports, the command line and tests",
   "from": 4,
   "to": 6
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "What the tool does, and what it doesn't",
   "body": "In this guide you'll rebuild my [Phone Number Lookup](https://github.com/TheoYanvno/phone-number-lookup): a Python command-line tool that checks a phone number and prints its **public numbering-plan details**.\n\n```text\n> python -m phone_lookup +442079460958\nNumber:          +442079460958\nValid:           yes\nPossible:        yes\nInternational:   +44 20 7946 0958\nNational:        020 7946 0958\nE.164:           +442079460958\nCountry code:    +44\nNational number: 2079460958\nRegion:          London, United Kingdom (GB)\nType:            landline\nCarrier:         not listed (common for landlines, and numbers can move to another carrier)\nTime zones:      Europe/London\n```\n\nIt uses [`phonenumbers`](https://github.com/daviddrysdale/python-phonenumbers), the Python version of Google's libphonenumber, which ships with the numbering plans of every country. Everything works **offline**.\n\n### Be honest about the limits\n\nEvery country publishes a **numbering plan**: which prefixes are mobile, which are landlines, which block of numbers was given to which carrier. The tool reads those plans. So:\n\n- It describes the **number**, never the **person**. It can't say who owns a number.\n- The carrier is the one the number range was **first** given to. People keep their numbers when they switch.\n- **Valid** means \"fits the plan\", not \"is in service\".\n\nSaying this clearly in the README, and in an interview, shows you understand your data.\n\n### Three modules, one job each\n\n```svg Three modules: lookup.py turns text into a Result using phonenumbers; report.py turns Results into text, JSON or CSV; cli.py reads the input and prints. Only lookup.py imports phonenumbers\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"150\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"45\" width=\"120\" height=\"60\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"70\" y=\"71\" text-anchor=\"middle\" font-weight=\"bold\">cli.py</text><text x=\"70\" y=\"89\" text-anchor=\"middle\">args, file, prompt</text>\n  <rect x=\"165\" y=\"10\" width=\"140\" height=\"60\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"235\" y=\"36\" text-anchor=\"middle\" font-weight=\"bold\">lookup.py</text><text x=\"235\" y=\"54\" text-anchor=\"middle\">text → Result</text>\n  <rect x=\"165\" y=\"80\" width=\"140\" height=\"60\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"235\" y=\"106\" text-anchor=\"middle\" font-weight=\"bold\">report.py</text><text x=\"235\" y=\"124\" text-anchor=\"middle\">Results → text/JSON/CSV</text>\n  <rect x=\"340\" y=\"10\" width=\"120\" height=\"60\" rx=\"8\" fill=\"#e5e7eb\" stroke=\"#374151\"/><text x=\"400\" y=\"36\" text-anchor=\"middle\" font-weight=\"bold\">phonenumbers</text><text x=\"400\" y=\"54\" text-anchor=\"middle\">offline data</text>\n  <rect x=\"340\" y=\"80\" width=\"120\" height=\"60\" rx=\"8\" fill=\"#fce7f3\" stroke=\"#db2777\"/><text x=\"400\" y=\"106\" text-anchor=\"middle\" font-weight=\"bold\">result.py</text><text x=\"400\" y=\"124\" text-anchor=\"middle\">the Result shape</text>\n  <path d=\"M130 65 L161 45 M130 85 L161 105 M305 40 H336 M305 110 H336\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```\n\nMake a folder `phone-number-lookup`, a `phone_lookup` folder inside it with an empty `__init__.py`, and install the library: `pip install phonenumbers`.",
   "quiz": [
    {
     "q": "What can this tool honestly tell you about +44 20 7946 0958?",
     "options": [
      "Who owns the number and whether it's switched on",
      "That it fits the UK plan, how to write it, its London prefix and that it's a landline range",
      "The current carrier, for certain"
     ],
     "answer": 1,
     "why": "Numbering plans describe prefixes and ranges. Ownership and current carrier aren't in them, and people move numbers between carriers."
    },
    {
     "q": "Why does only lookup.py import phonenumbers?",
     "options": [
      "Python only allows one import of a package",
      "So the reports and the command line can be tested without it, and swapping the library touches one file",
      "It's faster"
     ],
     "answer": 1,
     "why": "Keeping a dependency at one edge of the code is the same idea as keeping SQL in one store module."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "The Result: a frozen dataclass",
   "body": "`phone_lookup/result.py` defines the shape that passes between the modules:\n\n```python\nfrom dataclasses import asdict, dataclass, field\n\n@dataclass(frozen=True)\nclass Result:\n    input: str\n    valid: bool\n    possible: bool\n    e164: str\n    international: str\n    national: str\n    country_code: int\n    national_number: str\n    region_code: str        # \"US\", or \"\" when the prefix isn't one country's\n    country: str\n    location: str           # like \"California\", when known\n    carrier: str            # \"\" for many landlines\n    time_zones: tuple[str, ...] = field(default_factory=tuple)\n    type: str = \"unknown\"\n\n    def to_dict(self) -> dict:\n        d = asdict(self)\n        d[\"time_zones\"] = list(self.time_zones)\n        return d\n```\n\n- **`@dataclass`** writes `__init__`, `__repr__` and `__eq__` for you from the field list.\n- **`frozen=True`** makes it read-only: `result.valid = False` raises an error. A result can't be changed by accident after the lookup.\n- **`field(default_factory=tuple)`**: a default that's a fresh empty tuple. (Never write a list as a default; every result would share the same list.)\n- **`to_dict()`** gives plain types for JSON. Tuples become lists, because JSON only has arrays.\n\n### Why a class and not a dict?\n\nA dict accepts any key, so a typo like `result[\"contry\"]` only fails when it runs. A dataclass lists its fields once, your editor completes them, and the type hints document each one.",
   "quiz": [
    {
     "q": "What does frozen=True do?",
     "options": [
      "Makes the object faster to create",
      "Stops anyone from changing the fields after it's made",
      "Saves it to disk"
     ],
     "answer": 1,
     "why": "A frozen dataclass raises FrozenInstanceError on assignment, so data that's been checked stays the way it was checked."
    },
    {
     "q": "Why use default_factory=tuple instead of writing a list as the default?",
     "options": [
      "A list default would be shared by every object; a factory makes a new one each time",
      "Tuples are always faster",
      "Dataclasses don't allow defaults"
     ],
     "answer": 0,
     "why": "This is the classic mutable-default bug, the same one as def f(items=[]) in a function."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Parsing with phonenumbers, and errors people can act on",
   "body": "`phone_lookup/lookup.py` does the real work. First, clean what people paste:\n\n```python\ndef clean_input(raw: str) -> str:\n    text = str(raw or \"\").strip()\n    if text.lower().startswith(\"tel:\"):\n        text = text[4:]\n    if len(text) > 40:\n        raise LookupError(\"That's too long to be a phone number.\")\n    if not text:\n        raise LookupError(\"Type a phone number, like +1 202 555 0123.\")\n    return text\n```\n\nThe length limit is a small safety habit: never hand unlimited input to a parser.\n\nThen parse. A number with `+` and a country code parses on its own; a local number like `(202) 555-0143` needs its country, the **region**:\n\n```python\nnumber = phonenumbers.parse(text, region)        # region is \"US\", \"GB\"… or None\n```\n\nWhen parsing fails, phonenumbers raises `NumberParseException` with an `error_type`. The tool maps each type to advice:\n\n```python\nPARSE_ERRORS = {\n    NumberParseException.INVALID_COUNTRY_CODE: \"That doesn't start with a country code. Start with + and the country code \"\n                                               \"(like +1 or +44), or pass --region with a two-letter country (like --region US).\",\n    NumberParseException.NOT_A_NUMBER: \"That isn't a phone number.\",\n    NumberParseException.TOO_SHORT_NSN: \"That's too short to be a phone number.\",\n    NumberParseException.TOO_LONG: \"That's too long to be a phone number.\",\n}\n\ntry:\n    number = phonenumbers.parse(text, region)\nexcept NumberParseException as e:\n    raise LookupError(PARSE_ERRORS.get(e.error_type, \"That couldn't be read as a phone number.\")) from e\n```\n\n- **Your own exception class.** `class LookupError(ValueError)` means callers catch one thing and show its message. The library's error type stays inside lookup.py.\n- **`raise ... from e`** keeps the original error attached, so a developer can still see it in a traceback.\n- **A dict lookup with `.get(key, default)`** covers error types you didn't list.\n\n```svg From text to Result: clean the input, parse it with an optional region, and either build a Result or raise LookupError with advice\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"130\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"40\" width=\"100\" height=\"50\" rx=\"8\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"60\" y=\"62\" text-anchor=\"middle\">\" tel:+44 20…\"</text><text x=\"60\" y=\"78\" text-anchor=\"middle\">raw text</text>\n  <rect x=\"140\" y=\"40\" width=\"110\" height=\"50\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"195\" y=\"62\" text-anchor=\"middle\" font-weight=\"bold\">clean_input</text><text x=\"195\" y=\"78\" text-anchor=\"middle\">trim, tel:, length</text>\n  <rect x=\"280\" y=\"40\" width=\"110\" height=\"50\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"335\" y=\"62\" text-anchor=\"middle\" font-weight=\"bold\">parse</text><text x=\"335\" y=\"78\" text-anchor=\"middle\">+ region</text>\n  <rect x=\"420\" y=\"10\" width=\"130\" height=\"45\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"485\" y=\"37\" text-anchor=\"middle\" font-weight=\"bold\">Result</text>\n  <rect x=\"420\" y=\"75\" width=\"130\" height=\"45\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"485\" y=\"95\" text-anchor=\"middle\" font-weight=\"bold\">LookupError</text><text x=\"485\" y=\"111\" text-anchor=\"middle\">\"Start with +…\"</text>\n  <path d=\"M110 65 H136 M250 65 H276 M390 55 L416 35 M390 75 L416 97\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why turn NumberParseException into your own LookupError?",
     "options": [
      "Python requires custom exceptions",
      "The rest of the program catches one error type with a message a person can act on, and never depends on the library's errors",
      "It makes parsing faster"
     ],
     "answer": 1,
     "why": "Translating errors at the edge keeps library details out of the CLI and gives the person advice instead of a stack trace."
    },
    {
     "q": "What does a region like \"US\" do in phonenumbers.parse(text, \"US\")?",
     "options": [
      "It forces the number to be American even with +44",
      "It says which country a number without + and a country code belongs to",
      "It sets the language of the output"
     ],
     "answer": 1,
     "why": "Local formats like (202) 555-0143 only make sense once you know the country. A number that starts with + already says its country."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Formats, validity, type, carrier and time zones",
   "body": "With a parsed `number`, every detail is one call:\n\n```python\nvalid = phonenumbers.is_valid_number(number)\nzones = tuple(z for z in timezone.time_zones_for_number(number) if z != \"Etc/Unknown\")\nregion_code = phonenumbers.region_code_for_number(number) or \"\"\nreturn Result(\n    input=text,\n    valid=valid,\n    possible=phonenumbers.is_possible_number(number),\n    e164=phonenumbers.format_number(number, PhoneNumberFormat.E164),\n    international=phonenumbers.format_number(number, PhoneNumberFormat.INTERNATIONAL),\n    national=phonenumbers.format_number(number, PhoneNumberFormat.NATIONAL),\n    country_code=number.country_code,\n    national_number=str(number.national_number),\n    region_code=region_code if region_code != \"001\" else \"\",\n    country=geocoder.country_name_for_number(number, lang) if valid else \"\",\n    location=geocoder.description_for_number(number, lang) if valid else \"\",\n    carrier=carrier.name_for_number(number, lang) if valid else \"\",\n    time_zones=zones if valid else (),\n    type=TYPE_NAMES.get(phonenumbers.number_type(number), \"unknown\") if valid else \"unknown\",\n)\n```\n\n### The three formats\n\n| Format | Example | Use it for |\n|---|---|---|\n| **E.164** | `+442079460958` | Storing and comparing numbers: one canonical string |\n| International | `+44 20 7946 0958` | Showing to people anywhere |\n| National | `020 7946 0958` | Showing to people in that country |\n\nStore E.164 in a database and format for display. Two people typing `020 7946 0958` and `+44 (0)20 7946 0958` then match.\n\n### Possible vs valid\n\n- **Possible**: the length is right for the country. A quick check.\n- **Valid**: the digits fit a real range in the plan. Stricter.\n\nDetails that only make sense for a valid number (region, carrier, time zones, type) are left empty for invalid ones, so the report never shows a confident answer for a number that doesn't exist.\n\n### Plain words for the type\n\nThe library returns constants like `PhoneNumberType.FIXED_LINE`. A dict turns them into words: `\"landline\"`, `\"mobile\"`, `\"toll-free\"`. Region code `\"001\"` means \"not one country\" (some satellite and global services), so it becomes `\"\"`.\n\n```svg One number, three spellings: E.164 for storing, international for anyone, national for people in that country\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 110\" font-family=\"monospace\" font-size=\"13\">\n  <rect width=\"560\" height=\"110\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"35\" width=\"150\" height=\"40\" rx=\"8\" fill=\"#e5e7eb\" stroke=\"#374151\"/><text x=\"85\" y=\"60\" text-anchor=\"middle\">parsed number</text>\n  <rect x=\"220\" y=\"5\" width=\"200\" height=\"30\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"320\" y=\"25\" text-anchor=\"middle\">+442079460958</text>\n  <rect x=\"220\" y=\"40\" width=\"200\" height=\"30\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"320\" y=\"60\" text-anchor=\"middle\">+44 20 7946 0958</text>\n  <rect x=\"220\" y=\"75\" width=\"200\" height=\"30\" rx=\"6\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"320\" y=\"95\" text-anchor=\"middle\">020 7946 0958</text>\n  <text x=\"430\" y=\"25\" font-family=\"sans-serif\" font-size=\"12\">E.164: store</text><text x=\"430\" y=\"60\" font-family=\"sans-serif\" font-size=\"12\">international</text><text x=\"430\" y=\"95\" font-family=\"sans-serif\" font-size=\"12\">national</text>\n  <path d=\"M160 55 L216 20 M160 55 H216 M160 55 L216 90\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Which format should you store in a database?",
     "options": [
      "E.164, because it's one canonical spelling, so the same number always matches",
      "National, because it's shortest",
      "Whatever the person typed"
     ],
     "answer": 0,
     "why": "Store canonical, display friendly. Different spellings of one number then compare equal."
    },
    {
     "q": "Why are carrier and region left empty for an invalid number?",
     "options": [
      "The library crashes on invalid numbers",
      "So the report never presents details for a number that doesn't fit any plan",
      "To make the CSV shorter"
     ],
     "answer": 1,
     "why": "Showing a confident region for an impossible number would mislead. Empty is the honest answer."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Text, JSON and a spreadsheet-safe CSV",
   "body": "`phone_lookup/report.py` turns results into output and never imports phonenumbers, so you can test it with hand-made Results.\n\n### Aligned text\n\n```python\nwidth = max(len(k) for k, _ in rows)\nreturn \"\\n\".join(f\"{k + ':':<{width + 1}} {v}\" for k, v in rows)\n```\n\n`:<{width + 1}` left-aligns each label in a column as wide as the longest one, so the values line up.\n\n### JSON\n\n```python\ndef to_json(results) -> str:\n    return json.dumps([r.to_dict() for r in results], indent=2, ensure_ascii=False)\n```\n\n`ensure_ascii=False` keeps names like \"Côte d'Ivoire\" readable instead of `ô`.\n\n### CSV, and formula injection\n\nA spreadsheet treats a cell that starts with `=`, `+`, `-` or `@` as a **formula**. E.164 numbers start with `+`, and a malicious input like `=HYPERLINK(...)` could run when someone opens the file. That's called **CSV injection**. The fix is a leading apostrophe, which tells the spreadsheet \"this is text\":\n\n```python\ndef _safe(value: str) -> str:\n    s = str(value)\n    return f\"'{s}\" if s[:1] in (\"=\", \"+\", \"-\", \"@\", \"\\t\", \"\\r\") else s\n```\n\nThe `csv` module handles commas and quotes inside values for you; never build CSV by joining strings with commas.\n\n```svg CSV injection: a cell starting with = + - or @ becomes a formula in a spreadsheet; a leading apostrophe keeps it as text\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"110\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"10\" width=\"150\" height=\"35\" rx=\"6\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"85\" y=\"32\" text-anchor=\"middle\" font-family=\"monospace\">+442079460958</text>\n  <text x=\"180\" y=\"32\">opened in a spreadsheet →</text><text x=\"360\" y=\"32\" fill=\"#dc2626\">read as a formula</text>\n  <rect x=\"10\" y=\"60\" width=\"150\" height=\"35\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"85\" y=\"82\" text-anchor=\"middle\" font-family=\"monospace\">'+442079460958</text>\n  <text x=\"180\" y=\"82\">opened in a spreadsheet →</text><text x=\"360\" y=\"82\" fill=\"#16a34a\">shown as text, safely</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does the CSV writer put an apostrophe before values like +442079460958?",
     "options": [
      "To make the file smaller",
      "Spreadsheets run cells starting with = + - or @ as formulas; the apostrophe keeps them as text",
      "Because CSV doesn't allow the + sign"
     ],
     "answer": 1,
     "why": "CSV injection is a real security issue in exported data. A leading ' is the standard defense."
    },
    {
     "q": "Why use the csv module instead of joining values with commas?",
     "options": [
      "It's required by Python",
      "It quotes values that contain commas, quotes or new lines, so the columns stay correct",
      "It sorts the rows"
     ],
     "answer": 1,
     "why": "A city like \"Washington, DC\" would split into two columns if you joined by hand."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "The command line with argparse",
   "body": "`phone_lookup/cli.py` reads numbers three ways: arguments, a file with `--file`, or a prompt when there are none.\n\n```python\np = argparse.ArgumentParser(prog=\"phone_lookup\", description=\"Look up public details of phone numbers.\")\np.add_argument(\"numbers\", nargs=\"*\", help=\"phone numbers, ideally with + and the country code\")\np.add_argument(\"--region\", \"-r\", help=\"two-letter country for numbers without + and a country code\")\np.add_argument(\"--file\", \"-f\", help=\"a text file with one number per line (# starts a comment)\")\nout = p.add_mutually_exclusive_group()\nout.add_argument(\"--json\", action=\"store_true\")\nout.add_argument(\"--csv\", action=\"store_true\")\n```\n\n- **`nargs=\"*\"`**: zero or more numbers.\n- **A mutually exclusive group**: `--json --csv` together is an error that argparse explains for you.\n- argparse writes `--help` automatically from the help strings.\n\n### Keep going when one line is bad\n\n```python\nresults, failed = [], 0\nfor raw in numbers[:1000]:\n    try:\n        results.append(lookup(raw, args.region))\n    except LookupError as e:\n        failed += 1\n        print(f\"{raw}: {e}\", file=stderr)\n```\n\nA file with one typo still gives you every other result. Errors go to **stderr**, results to **stdout**, so `> out.csv` saves only the CSV. The exit code is 1 only when nothing worked, which scripts can check.\n\n### Making `python -m phone_lookup` work\n\n`phone_lookup/__main__.py` runs when you use `-m`:\n\n```python\nimport sys\nfrom .cli import main\n\nsys.exit(main())\n```\n\n`main()` takes `argv`, `stdin`, `stdout` and `stderr` as parameters with real defaults, so tests pass in their own and read what was printed.\n\nOn Windows, run it from PowerShell exactly the same way: `python -m phone_lookup \"+1 202 555 0143\"`. Quote numbers with spaces.\n\n```svg Where the output goes: results to stdout (you can redirect it to a file), errors to stderr (still shown on screen), and an exit code for scripts\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"120\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"40\" width=\"120\" height=\"45\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"70\" y=\"67\" text-anchor=\"middle\" font-weight=\"bold\">main()</text>\n  <rect x=\"190\" y=\"5\" width=\"140\" height=\"32\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"260\" y=\"26\" text-anchor=\"middle\">stdout: results</text>\n  <rect x=\"190\" y=\"45\" width=\"140\" height=\"32\" rx=\"6\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"260\" y=\"66\" text-anchor=\"middle\">stderr: bad lines</text>\n  <rect x=\"190\" y=\"85\" width=\"140\" height=\"32\" rx=\"6\" fill=\"#e5e7eb\" stroke=\"#374151\"/><text x=\"260\" y=\"106\" text-anchor=\"middle\">exit code 0 / 1 / 2</text>\n  <text x=\"345\" y=\"26\">→ &gt; out.csv</text><text x=\"345\" y=\"66\">→ the screen</text><text x=\"345\" y=\"106\">→ scripts, CI</text>\n  <path d=\"M130 62 L186 21 M130 62 H186 M130 62 L186 101\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why print errors to stderr instead of stdout?",
     "options": [
      "stderr is faster",
      "So redirecting output to a file (> out.csv) saves only the results, while errors still show on screen",
      "Python can't print errors to stdout"
     ],
     "answer": 1,
     "why": "Separating the two streams is what makes command-line tools work in pipelines and scripts."
    },
    {
     "q": "Why does main() take stdin, stdout and stderr as parameters?",
     "options": [
      "So tests can pass in fake streams and check exactly what was printed",
      "argparse requires it",
      "To support Windows"
     ],
     "answer": 0,
     "why": "Dependency injection with sensible defaults makes a CLI testable without running a real terminal."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Tests, packaging and explaining it",
   "body": "There are two test files, and they match the module split:\n\n```python\ndef result(**kw):\n    base = dict(input=\"+44 20 7946 0958\", valid=True, possible=True, e164=\"+442079460958\", international=\"+44 20 7946 0958\",\n                national=\"020 7946 0958\", country_code=44, national_number=\"2079460958\", region_code=\"GB\",\n                country=\"United Kingdom\", location=\"London\", carrier=\"\", time_zones=(\"Europe/London\",), type=\"landline\")\n    base.update(kw)\n    return Result(**base)\n\nclass Exports(unittest.TestCase):\n    def test_csv_has_a_header_and_defuses_spreadsheet_formulas(self):\n        rows = list(csv.reader(io.StringIO(to_csv([result(input=\"=cmd|'/c calc'!A1\")]))))\n        self.assertEqual(rows[0][:3], [\"input\", \"valid\", \"possible\"])\n        self.assertEqual(rows[1][0], \"'=cmd|'/c calc'!A1\")\n        self.assertEqual(rows[1][3], \"'+442079460958\", \"a leading + would also start a formula\")\n```\n\n- **`result(**kw)`** is a small helper: one valid Result, with any field overridden by keyword. Each test changes only what it's about.\n- **test_report.py** builds Results by hand and never touches phonenumbers. The `=cmd|...` input is a real CSV-injection attack string.\n- **test_lookup.py** uses safe example numbers: `+44 20 7946 0xxx` is a range the UK regulator sets aside for dramas, and `phonenumbers.example_number(\"US\")` gives a valid number for any country, and `example_number_for_type(\"GB\", PhoneNumberType.MOBILE)` one of a given type. Never put real people's numbers in tests or docs.\n\nRun them with `python -m unittest -v`. A GitHub Actions workflow runs the same command on every push.\n\n`pyproject.toml` declares the package and adds a `phone-lookup` command when you `pip install .`.\n\n### Explain it in an interview\n\n1. **What:** \"A command-line tool that validates phone numbers and shows their numbering-plan details, offline, with text, JSON and CSV output.\"\n2. **How:** \"Three modules: lookup wraps Google's phonenumbers library and returns a frozen dataclass, report formats results, and the CLI handles input. Only one module depends on the library.\"\n3. **Decisions:** \"Errors become plain advice. E.164 for machines, national and international for people. The CSV is protected against formula injection.\"\n4. **Limits:** \"It describes the number, not the person; the carrier is the original one; valid isn't the same as in service.\"\n5. **Next:** \"A small Flask endpoint around lookup(), or batch lookups straight from a spreadsheet.\"\n\n### Drill: from memory\n\nIn a blank file, write `clean_input()` and a `lookup()` that returns only `valid`, `e164` and `international`, plus a test for each. Compare with the real code.",
   "quiz": [
    {
     "q": "Why does test_lookup.py use numbers like +44 20 7946 0xxx?",
     "options": [
      "They are the fastest to parse",
      "That range is reserved for examples, so tests never use a real person's number",
      "phonenumbers only accepts UK numbers in tests"
     ],
     "answer": 1,
     "why": "Privacy matters even in test data. Reserved example ranges exist for exactly this."
    },
    {
     "q": "What's the honest answer if an interviewer asks \"can it find who owns a number?\"",
     "options": [
      "Yes, through the carrier field",
      "No. It reads public numbering plans, which describe prefixes and ranges, not owners",
      "Only for US numbers"
     ],
     "answer": 1,
     "why": "Knowing and stating your data's limits is part of building responsibly."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  }
 ],
 "finish": "You rebuilt a real Python command-line tool. You learned:\n\n- Using a trusted library (**phonenumbers**) instead of writing parsing rules yourself\n- A **frozen dataclass** as the shape between modules\n- Translating library errors into **your own exception** with advice\n- **E.164** for storing, friendly formats for people, and **possible vs valid**\n- Text, JSON and **CSV that's safe from formula injection**\n- An **argparse** CLI that reads arguments, a file or a prompt, with stdout, stderr and exit codes\n- Tests per module, with **reserved example numbers**\n\n### Challenges\n\n1. Add `--lang es` so country and region names come back in Spanish (`geocoder` takes a language).\n2. Add a `--only-valid` flag that skips invalid numbers in the CSV.\n3. Wrap `lookup()` in a tiny Flask route, `GET /api/lookup?number=…`, using what you learned in the Dataset Catalog API guide."
};
