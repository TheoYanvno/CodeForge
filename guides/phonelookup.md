---
id: phonelookup
title: Phone Number Lookup (Python CLI)
goals: Use a well-known library (phonenumbers) instead of writing your own parsing rules; Keep data, logic and output in separate modules with a frozen dataclass between them; Turn library errors into plain advice for the person typing; Print the same results as aligned text, JSON or a spreadsheet-safe CSV; Build a command-line tool with argparse that reads arguments, a file or a prompt; Test each module on its own and explain the project's limits honestly
prereqs: Python basics (functions, dictionaries, exceptions, unittest)
---

## Session: Looking a number up

## Step: What the tool does, and what it doesn't
kind: read
time: 12

In this guide you'll rebuild my [Phone Number Lookup](https://github.com/TheoYanvno/phone-number-lookup): a Python command-line tool that checks a phone number and prints its **public numbering-plan details**.

```text
> python -m phone_lookup +442079460958
Number:          +442079460958
Valid:           yes
Possible:        yes
International:   +44 20 7946 0958
National:        020 7946 0958
E.164:           +442079460958
Country code:    +44
National number: 2079460958
Region:          London, United Kingdom (GB)
Type:            landline
Carrier:         not listed (common for landlines, and numbers can move to another carrier)
Time zones:      Europe/London
```

It uses [`phonenumbers`](https://github.com/daviddrysdale/python-phonenumbers), the Python version of Google's libphonenumber, which ships with the numbering plans of every country. Everything works **offline**.

### Be honest about the limits

Every country publishes a **numbering plan**: which prefixes are mobile, which are landlines, which block of numbers was given to which carrier. The tool reads those plans. So:

- It describes the **number**, never the **person**. It can't say who owns a number.
- The carrier is the one the number range was **first** given to. People keep their numbers when they switch.
- **Valid** means "fits the plan", not "is in service".

Saying this clearly in the README, and in an interview, shows you understand your data.

### Three modules, one job each

```svg Three modules: lookup.py turns text into a Result using phonenumbers; report.py turns Results into text, JSON or CSV; cli.py reads the input and prints. Only lookup.py imports phonenumbers
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 150" font-family="sans-serif" font-size="12">
  <rect width="560" height="150" fill="#ffffff"/>
  <rect x="10" y="45" width="120" height="60" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="70" y="71" text-anchor="middle" font-weight="bold">cli.py</text><text x="70" y="89" text-anchor="middle">args, file, prompt</text>
  <rect x="165" y="10" width="140" height="60" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="235" y="36" text-anchor="middle" font-weight="bold">lookup.py</text><text x="235" y="54" text-anchor="middle">text → Result</text>
  <rect x="165" y="80" width="140" height="60" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="235" y="106" text-anchor="middle" font-weight="bold">report.py</text><text x="235" y="124" text-anchor="middle">Results → text/JSON/CSV</text>
  <rect x="340" y="10" width="120" height="60" rx="8" fill="#e5e7eb" stroke="#374151"/><text x="400" y="36" text-anchor="middle" font-weight="bold">phonenumbers</text><text x="400" y="54" text-anchor="middle">offline data</text>
  <rect x="340" y="80" width="120" height="60" rx="8" fill="#fce7f3" stroke="#db2777"/><text x="400" y="106" text-anchor="middle" font-weight="bold">result.py</text><text x="400" y="124" text-anchor="middle">the Result shape</text>
  <path d="M130 65 L161 45 M130 85 L161 105 M305 40 H336 M305 110 H336" stroke="#374151" stroke-width="2"/>
</svg>
```

Make a folder `phone-number-lookup`, a `phone_lookup` folder inside it with an empty `__init__.py`, and install the library: `pip install phonenumbers`.

quiz: What can this tool honestly tell you about +44 20 7946 0958?
- [ ] Who owns the number and whether it's switched on
- [x] That it fits the UK plan, how to write it, its London prefix and that it's a landline range
- [ ] The current carrier, for certain
why: Numbering plans describe prefixes and ranges. Ownership and current carrier aren't in them, and people move numbers between carriers.

quiz: Why does only lookup.py import phonenumbers?
- [ ] Python only allows one import of a package
- [x] So the reports and the command line can be tested without it, and swapping the library touches one file
- [ ] It's faster
why: Keeping a dependency at one edge of the code is the same idea as keeping SQL in one store module.

## Step: The Result: a frozen dataclass
kind: read
time: 12

`phone_lookup/result.py` defines the shape that passes between the modules:

```python
from dataclasses import asdict, dataclass, field

@dataclass(frozen=True)
class Result:
    input: str
    valid: bool
    possible: bool
    e164: str
    international: str
    national: str
    country_code: int
    national_number: str
    region_code: str        # "US", or "" when the prefix isn't one country's
    country: str
    location: str           # like "California", when known
    carrier: str            # "" for many landlines
    time_zones: tuple[str, ...] = field(default_factory=tuple)
    type: str = "unknown"

    def to_dict(self) -> dict:
        d = asdict(self)
        d["time_zones"] = list(self.time_zones)
        return d
```

- **`@dataclass`** writes `__init__`, `__repr__` and `__eq__` for you from the field list.
- **`frozen=True`** makes it read-only: `result.valid = False` raises an error. A result can't be changed by accident after the lookup.
- **`field(default_factory=tuple)`**: a default that's a fresh empty tuple. (Never write a list as a default; every result would share the same list.)
- **`to_dict()`** gives plain types for JSON. Tuples become lists, because JSON only has arrays.

### Why a class and not a dict?

A dict accepts any key, so a typo like `result["contry"]` only fails when it runs. A dataclass lists its fields once, your editor completes them, and the type hints document each one.

quiz: What does frozen=True do?
- [ ] Makes the object faster to create
- [x] Stops anyone from changing the fields after it's made
- [ ] Saves it to disk
why: A frozen dataclass raises FrozenInstanceError on assignment, so data that's been checked stays the way it was checked.

quiz: Why use default_factory=tuple instead of writing a list as the default?
- [x] A list default would be shared by every object; a factory makes a new one each time
- [ ] Tuples are always faster
- [ ] Dataclasses don't allow defaults
why: This is the classic mutable-default bug, the same one as def f(items=[]) in a function.

## Step: Parsing with phonenumbers, and errors people can act on
kind: read
time: 18

`phone_lookup/lookup.py` does the real work. First, clean what people paste:

```python
def clean_input(raw: str) -> str:
    text = str(raw or "").strip()
    if text.lower().startswith("tel:"):
        text = text[4:]
    if len(text) > 40:
        raise LookupError("That's too long to be a phone number.")
    if not text:
        raise LookupError("Type a phone number, like +1 202 555 0123.")
    return text
```

The length limit is a small safety habit: never hand unlimited input to a parser.

Then parse. A number with `+` and a country code parses on its own; a local number like `(202) 555-0143` needs its country, the **region**:

```python
number = phonenumbers.parse(text, region)        # region is "US", "GB"… or None
```

When parsing fails, phonenumbers raises `NumberParseException` with an `error_type`. The tool maps each type to advice:

```python
PARSE_ERRORS = {
    NumberParseException.INVALID_COUNTRY_CODE: "That doesn't start with a country code. Start with + and the country code "
                                               "(like +1 or +44), or pass --region with a two-letter country (like --region US).",
    NumberParseException.NOT_A_NUMBER: "That isn't a phone number.",
    NumberParseException.TOO_SHORT_NSN: "That's too short to be a phone number.",
    NumberParseException.TOO_LONG: "That's too long to be a phone number.",
}

try:
    number = phonenumbers.parse(text, region)
except NumberParseException as e:
    raise LookupError(PARSE_ERRORS.get(e.error_type, "That couldn't be read as a phone number.")) from e
```

- **Your own exception class.** `class LookupError(ValueError)` means callers catch one thing and show its message. The library's error type stays inside lookup.py.
- **`raise ... from e`** keeps the original error attached, so a developer can still see it in a traceback.
- **A dict lookup with `.get(key, default)`** covers error types you didn't list.

```svg From text to Result: clean the input, parse it with an optional region, and either build a Result or raise LookupError with advice
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 130" font-family="sans-serif" font-size="12">
  <rect width="560" height="130" fill="#ffffff"/>
  <rect x="10" y="40" width="100" height="50" rx="8" fill="#f3f4f6" stroke="#6b7280"/><text x="60" y="62" text-anchor="middle">" tel:+44 20…"</text><text x="60" y="78" text-anchor="middle">raw text</text>
  <rect x="140" y="40" width="110" height="50" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="195" y="62" text-anchor="middle" font-weight="bold">clean_input</text><text x="195" y="78" text-anchor="middle">trim, tel:, length</text>
  <rect x="280" y="40" width="110" height="50" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="335" y="62" text-anchor="middle" font-weight="bold">parse</text><text x="335" y="78" text-anchor="middle">+ region</text>
  <rect x="420" y="10" width="130" height="45" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="485" y="37" text-anchor="middle" font-weight="bold">Result</text>
  <rect x="420" y="75" width="130" height="45" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="485" y="95" text-anchor="middle" font-weight="bold">LookupError</text><text x="485" y="111" text-anchor="middle">"Start with +…"</text>
  <path d="M110 65 H136 M250 65 H276 M390 55 L416 35 M390 75 L416 97" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why turn NumberParseException into your own LookupError?
- [ ] Python requires custom exceptions
- [x] The rest of the program catches one error type with a message a person can act on, and never depends on the library's errors
- [ ] It makes parsing faster
why: Translating errors at the edge keeps library details out of the CLI and gives the person advice instead of a stack trace.

quiz: What does a region like "US" do in phonenumbers.parse(text, "US")?
- [ ] It forces the number to be American even with +44
- [x] It says which country a number without + and a country code belongs to
- [ ] It sets the language of the output
why: Local formats like (202) 555-0143 only make sense once you know the country. A number that starts with + already says its country.

## Step: Formats, validity, type, carrier and time zones
kind: read
time: 15

With a parsed `number`, every detail is one call:

```python
valid = phonenumbers.is_valid_number(number)
zones = tuple(z for z in timezone.time_zones_for_number(number) if z != "Etc/Unknown")
region_code = phonenumbers.region_code_for_number(number) or ""
return Result(
    input=text,
    valid=valid,
    possible=phonenumbers.is_possible_number(number),
    e164=phonenumbers.format_number(number, PhoneNumberFormat.E164),
    international=phonenumbers.format_number(number, PhoneNumberFormat.INTERNATIONAL),
    national=phonenumbers.format_number(number, PhoneNumberFormat.NATIONAL),
    country_code=number.country_code,
    national_number=str(number.national_number),
    region_code=region_code if region_code != "001" else "",
    country=geocoder.country_name_for_number(number, lang) if valid else "",
    location=geocoder.description_for_number(number, lang) if valid else "",
    carrier=carrier.name_for_number(number, lang) if valid else "",
    time_zones=zones if valid else (),
    type=TYPE_NAMES.get(phonenumbers.number_type(number), "unknown") if valid else "unknown",
)
```

### The three formats

| Format | Example | Use it for |
|---|---|---|
| **E.164** | `+442079460958` | Storing and comparing numbers: one canonical string |
| International | `+44 20 7946 0958` | Showing to people anywhere |
| National | `020 7946 0958` | Showing to people in that country |

Store E.164 in a database and format for display. Two people typing `020 7946 0958` and `+44 (0)20 7946 0958` then match.

### Possible vs valid

- **Possible**: the length is right for the country. A quick check.
- **Valid**: the digits fit a real range in the plan. Stricter.

Details that only make sense for a valid number (region, carrier, time zones, type) are left empty for invalid ones, so the report never shows a confident answer for a number that doesn't exist.

### Plain words for the type

The library returns constants like `PhoneNumberType.FIXED_LINE`. A dict turns them into words: `"landline"`, `"mobile"`, `"toll-free"`. Region code `"001"` means "not one country" (some satellite and global services), so it becomes `""`.

```svg One number, three spellings: E.164 for storing, international for anyone, national for people in that country
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 110" font-family="monospace" font-size="13">
  <rect width="560" height="110" fill="#ffffff"/>
  <rect x="10" y="35" width="150" height="40" rx="8" fill="#e5e7eb" stroke="#374151"/><text x="85" y="60" text-anchor="middle">parsed number</text>
  <rect x="220" y="5" width="200" height="30" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="320" y="25" text-anchor="middle">+442079460958</text>
  <rect x="220" y="40" width="200" height="30" rx="6" fill="#dbeafe" stroke="#2563eb"/><text x="320" y="60" text-anchor="middle">+44 20 7946 0958</text>
  <rect x="220" y="75" width="200" height="30" rx="6" fill="#fef3c7" stroke="#f59e0b"/><text x="320" y="95" text-anchor="middle">020 7946 0958</text>
  <text x="430" y="25" font-family="sans-serif" font-size="12">E.164: store</text><text x="430" y="60" font-family="sans-serif" font-size="12">international</text><text x="430" y="95" font-family="sans-serif" font-size="12">national</text>
  <path d="M160 55 L216 20 M160 55 H216 M160 55 L216 90" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Which format should you store in a database?
- [x] E.164, because it's one canonical spelling, so the same number always matches
- [ ] National, because it's shortest
- [ ] Whatever the person typed
why: Store canonical, display friendly. Different spellings of one number then compare equal.

quiz: Why are carrier and region left empty for an invalid number?
- [ ] The library crashes on invalid numbers
- [x] So the report never presents details for a number that doesn't fit any plan
- [ ] To make the CSV shorter
why: Showing a confident region for an impossible number would mislead. Empty is the honest answer.

## Session: Reports, the command line and tests

## Step: Text, JSON and a spreadsheet-safe CSV
kind: read
time: 15

`phone_lookup/report.py` turns results into output and never imports phonenumbers, so you can test it with hand-made Results.

### Aligned text

```python
width = max(len(k) for k, _ in rows)
return "\n".join(f"{k + ':':<{width + 1}} {v}" for k, v in rows)
```

`:<{width + 1}` left-aligns each label in a column as wide as the longest one, so the values line up.

### JSON

```python
def to_json(results) -> str:
    return json.dumps([r.to_dict() for r in results], indent=2, ensure_ascii=False)
```

`ensure_ascii=False` keeps names like "Côte d'Ivoire" readable instead of `ô`.

### CSV, and formula injection

A spreadsheet treats a cell that starts with `=`, `+`, `-` or `@` as a **formula**. E.164 numbers start with `+`, and a malicious input like `=HYPERLINK(...)` could run when someone opens the file. That's called **CSV injection**. The fix is a leading apostrophe, which tells the spreadsheet "this is text":

```python
def _safe(value: str) -> str:
    s = str(value)
    return f"'{s}" if s[:1] in ("=", "+", "-", "@", "\t", "\r") else s
```

The `csv` module handles commas and quotes inside values for you; never build CSV by joining strings with commas.

```svg CSV injection: a cell starting with = + - or @ becomes a formula in a spreadsheet; a leading apostrophe keeps it as text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 110" font-family="sans-serif" font-size="12">
  <rect width="560" height="110" fill="#ffffff"/>
  <rect x="10" y="10" width="150" height="35" rx="6" fill="#fee2e2" stroke="#dc2626"/><text x="85" y="32" text-anchor="middle" font-family="monospace">+442079460958</text>
  <text x="180" y="32">opened in a spreadsheet →</text><text x="360" y="32" fill="#dc2626">read as a formula</text>
  <rect x="10" y="60" width="150" height="35" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="85" y="82" text-anchor="middle" font-family="monospace">'+442079460958</text>
  <text x="180" y="82">opened in a spreadsheet →</text><text x="360" y="82" fill="#16a34a">shown as text, safely</text>
</svg>
```

quiz: Why does the CSV writer put an apostrophe before values like +442079460958?
- [ ] To make the file smaller
- [x] Spreadsheets run cells starting with = + - or @ as formulas; the apostrophe keeps them as text
- [ ] Because CSV doesn't allow the + sign
why: CSV injection is a real security issue in exported data. A leading ' is the standard defense.

quiz: Why use the csv module instead of joining values with commas?
- [ ] It's required by Python
- [x] It quotes values that contain commas, quotes or new lines, so the columns stay correct
- [ ] It sorts the rows
why: A city like "Washington, DC" would split into two columns if you joined by hand.

## Step: The command line with argparse
kind: read
time: 15

`phone_lookup/cli.py` reads numbers three ways: arguments, a file with `--file`, or a prompt when there are none.

```python
p = argparse.ArgumentParser(prog="phone_lookup", description="Look up public details of phone numbers.")
p.add_argument("numbers", nargs="*", help="phone numbers, ideally with + and the country code")
p.add_argument("--region", "-r", help="two-letter country for numbers without + and a country code")
p.add_argument("--file", "-f", help="a text file with one number per line (# starts a comment)")
out = p.add_mutually_exclusive_group()
out.add_argument("--json", action="store_true")
out.add_argument("--csv", action="store_true")
```

- **`nargs="*"`**: zero or more numbers.
- **A mutually exclusive group**: `--json --csv` together is an error that argparse explains for you.
- argparse writes `--help` automatically from the help strings.

### Keep going when one line is bad

```python
results, failed = [], 0
for raw in numbers[:1000]:
    try:
        results.append(lookup(raw, args.region))
    except LookupError as e:
        failed += 1
        print(f"{raw}: {e}", file=stderr)
```

A file with one typo still gives you every other result. Errors go to **stderr**, results to **stdout**, so `> out.csv` saves only the CSV. The exit code is 1 only when nothing worked, which scripts can check.

### Making `python -m phone_lookup` work

`phone_lookup/__main__.py` runs when you use `-m`:

```python
import sys
from .cli import main

sys.exit(main())
```

`main()` takes `argv`, `stdin`, `stdout` and `stderr` as parameters with real defaults, so tests pass in their own and read what was printed.

On Windows, run it from PowerShell exactly the same way: `python -m phone_lookup "+1 202 555 0143"`. Quote numbers with spaces.

```svg Where the output goes: results to stdout (you can redirect it to a file), errors to stderr (still shown on screen), and an exit code for scripts
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120" font-family="sans-serif" font-size="12">
  <rect width="560" height="120" fill="#ffffff"/>
  <rect x="10" y="40" width="120" height="45" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="70" y="67" text-anchor="middle" font-weight="bold">main()</text>
  <rect x="190" y="5" width="140" height="32" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="260" y="26" text-anchor="middle">stdout: results</text>
  <rect x="190" y="45" width="140" height="32" rx="6" fill="#fee2e2" stroke="#dc2626"/><text x="260" y="66" text-anchor="middle">stderr: bad lines</text>
  <rect x="190" y="85" width="140" height="32" rx="6" fill="#e5e7eb" stroke="#374151"/><text x="260" y="106" text-anchor="middle">exit code 0 / 1 / 2</text>
  <text x="345" y="26">→ &gt; out.csv</text><text x="345" y="66">→ the screen</text><text x="345" y="106">→ scripts, CI</text>
  <path d="M130 62 L186 21 M130 62 H186 M130 62 L186 101" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why print errors to stderr instead of stdout?
- [ ] stderr is faster
- [x] So redirecting output to a file (> out.csv) saves only the results, while errors still show on screen
- [ ] Python can't print errors to stdout
why: Separating the two streams is what makes command-line tools work in pipelines and scripts.

quiz: Why does main() take stdin, stdout and stderr as parameters?
- [x] So tests can pass in fake streams and check exactly what was printed
- [ ] argparse requires it
- [ ] To support Windows
why: Dependency injection with sensible defaults makes a CLI testable without running a real terminal.

## Step: Tests, packaging and explaining it
kind: read
time: 15

There are two test files, and they match the module split:

```python
def result(**kw):
    base = dict(input="+44 20 7946 0958", valid=True, possible=True, e164="+442079460958", international="+44 20 7946 0958",
                national="020 7946 0958", country_code=44, national_number="2079460958", region_code="GB",
                country="United Kingdom", location="London", carrier="", time_zones=("Europe/London",), type="landline")
    base.update(kw)
    return Result(**base)

class Exports(unittest.TestCase):
    def test_csv_has_a_header_and_defuses_spreadsheet_formulas(self):
        rows = list(csv.reader(io.StringIO(to_csv([result(input="=cmd|'/c calc'!A1")]))))
        self.assertEqual(rows[0][:3], ["input", "valid", "possible"])
        self.assertEqual(rows[1][0], "'=cmd|'/c calc'!A1")
        self.assertEqual(rows[1][3], "'+442079460958", "a leading + would also start a formula")
```

- **`result(**kw)`** is a small helper: one valid Result, with any field overridden by keyword. Each test changes only what it's about.
- **test_report.py** builds Results by hand and never touches phonenumbers. The `=cmd|...` input is a real CSV-injection attack string.
- **test_lookup.py** uses safe example numbers: `+44 20 7946 0xxx` is a range the UK regulator sets aside for dramas, and `phonenumbers.example_number("US")` gives a valid number for any country, and `example_number_for_type("GB", PhoneNumberType.MOBILE)` one of a given type. Never put real people's numbers in tests or docs.

Run them with `python -m unittest -v`. A GitHub Actions workflow runs the same command on every push.

`pyproject.toml` declares the package and adds a `phone-lookup` command when you `pip install .`.

### Explain it in an interview

1. **What:** "A command-line tool that validates phone numbers and shows their numbering-plan details, offline, with text, JSON and CSV output."
2. **How:** "Three modules: lookup wraps Google's phonenumbers library and returns a frozen dataclass, report formats results, and the CLI handles input. Only one module depends on the library."
3. **Decisions:** "Errors become plain advice. E.164 for machines, national and international for people. The CSV is protected against formula injection."
4. **Limits:** "It describes the number, not the person; the carrier is the original one; valid isn't the same as in service."
5. **Next:** "A small Flask endpoint around lookup(), or batch lookups straight from a spreadsheet."

### Drill: from memory

In a blank file, write `clean_input()` and a `lookup()` that returns only `valid`, `e164` and `international`, plus a test for each. Compare with the real code.

quiz: Why does test_lookup.py use numbers like +44 20 7946 0xxx?
- [ ] They are the fastest to parse
- [x] That range is reserved for examples, so tests never use a real person's number
- [ ] phonenumbers only accepts UK numbers in tests
why: Privacy matters even in test data. Reserved example ranges exist for exactly this.

quiz: What's the honest answer if an interviewer asks "can it find who owns a number?"
- [ ] Yes, through the carrier field
- [x] No. It reads public numbering plans, which describe prefixes and ranges, not owners
- [ ] Only for US numbers
why: Knowing and stating your data's limits is part of building responsibly.

## Finish

You rebuilt a real Python command-line tool. You learned:

- Using a trusted library (**phonenumbers**) instead of writing parsing rules yourself
- A **frozen dataclass** as the shape between modules
- Translating library errors into **your own exception** with advice
- **E.164** for storing, friendly formats for people, and **possible vs valid**
- Text, JSON and **CSV that's safe from formula injection**
- An **argparse** CLI that reads arguments, a file or a prompt, with stdout, stderr and exit codes
- Tests per module, with **reserved example numbers**

### Challenges

1. Add `--lang es` so country and region names come back in Spanish (`geocoder` takes a language).
2. Add a `--only-valid` flag that skips invalid numbers in the CSV.
3. Wrap `lookup()` in a tiny Flask route, `GET /api/lookup?number=…`, using what you learned in the Dataset Catalog API guide.
