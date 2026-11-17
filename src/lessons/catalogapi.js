// Built from guides/catalogapi.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "catalogapi",
 "title": "Dataset Catalog API (Flask + SQLite)",
 "goals": [
  "Design a metadata schema with keys, CHECK constraints and a many-to-many link table",
  "Keep every SQL statement in one store module with ? placeholders and transactions",
  "Validate records and report every problem at once",
  "Build a JSON REST API in Flask with the right status code for each outcome",
  "Search with filters, ranking and pages",
  "Load data safely and test the API with Flask's test client"
 ],
 "prereqs": [
  "Python basics (functions, dictionaries, try/except, unittest)",
  "SQL basics and Link tables (CREATE TABLE, SELECT, JOIN, many-to-many)"
 ],
 "sessions": [
  {
   "title": "The catalog and its database",
   "from": 0,
   "to": 3
  },
  {
   "title": "The API",
   "from": 4,
   "to": 8
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "What a data catalog is",
   "body": "In this guide you'll rebuild my [Dataset Catalog API](https://github.com/TheoYanvno/dataset-catalog-api): a small **data catalog**, the kind of system agencies like NASA use so people can find datasets, understand them and trust them. The catalog doesn't hold the data itself. It holds **metadata**: a record that describes each dataset and links to the real files.\n\nOne record looks like this:\n\n```json\n{\n  \"id\": \"crater-survey-2024\",\n  \"title\": \"Lunar Crater Survey 2024\",\n  \"description\": \"Diameter and depth of craters measured from orbital images.\",\n  \"publisher\": \"Planetary Data Office\",\n  \"contact_email\": \"data@planetary.example.gov\",\n  \"license\": \"CC0 1.0\",\n  \"access_level\": \"public\",\n  \"modified\": \"2024-05-31\",\n  \"keywords\": [\"moon\", \"craters\"],\n  \"distributions\": [{\"format\": \"CSV\", \"url\": \"https://data.example.gov/craters.csv\"}]\n}\n```\n\nA **distribution** is one way to get the data: a CSV file, a JSON API, a ZIP. **Keywords** make it findable. `access_level` says who may use it.\n\n### How the code is organized\n\nThe project has three layers, and each one has one job. Keeping them apart is the main design idea, and it's a good thing to say in an interview:\n\n```svg The three layers: a request comes into the Flask routes, the routes ask validate.py whether the record is good, then call store.py, which is the only code that talks to SQLite\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 170\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"560\" height=\"170\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"55\" width=\"90\" height=\"50\" rx=\"8\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"55\" y=\"77\" text-anchor=\"middle\">HTTP</text><text x=\"55\" y=\"94\" text-anchor=\"middle\">request</text>\n  <rect x=\"130\" y=\"40\" width=\"120\" height=\"80\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"190\" y=\"70\" text-anchor=\"middle\" font-weight=\"bold\">app.py</text><text x=\"190\" y=\"88\" text-anchor=\"middle\">routes: read,</text><text x=\"190\" y=\"104\" text-anchor=\"middle\">answer with JSON</text>\n  <rect x=\"280\" y=\"5\" width=\"120\" height=\"60\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"340\" y=\"31\" text-anchor=\"middle\" font-weight=\"bold\">validate.py</text><text x=\"340\" y=\"49\" text-anchor=\"middle\">is it a good record?</text>\n  <rect x=\"280\" y=\"95\" width=\"120\" height=\"60\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"340\" y=\"121\" text-anchor=\"middle\" font-weight=\"bold\">store.py</text><text x=\"340\" y=\"139\" text-anchor=\"middle\">all the SQL</text>\n  <rect x=\"440\" y=\"95\" width=\"110\" height=\"60\" rx=\"8\" fill=\"#e5e7eb\" stroke=\"#374151\"/><text x=\"495\" y=\"121\" text-anchor=\"middle\" font-weight=\"bold\">SQLite</text><text x=\"495\" y=\"139\" text-anchor=\"middle\">catalog.db</text>\n  <path d=\"M100 80 H126 M250 65 L276 40 M250 95 L276 120 M400 125 H436\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```\n\n- `catalog/app.py`: the Flask **routes**. They read the request, call the other two, and answer with JSON and a status code. No SQL here.\n- `catalog/validate.py`: checks a record and lists every problem.\n- `catalog/store.py`: every SQL statement lives here, and nowhere else.\n- `load.py`: a script that loads a JSON file of records.\n- `tests/`: 28 tests for the validation, the store and the API.\n\nMake a folder `dataset-catalog-api` with a `catalog` folder inside it, and install Flask: `pip install flask`.",
   "quiz": [
    {
     "q": "What does a data catalog store?",
     "options": [
      "The datasets themselves, every row",
      "Metadata that describes each dataset, plus links to where the data lives",
      "Only the file names"
     ],
     "answer": 1,
     "why": "A catalog is like a library's card index: it describes and points to the data so people can find it."
    },
    {
     "q": "Why does only store.py contain SQL?",
     "options": [
      "SQLite only allows one file to run SQL",
      "So the database code is in one place: routes stay simple, and the SQL can change without touching them",
      "Flask can't run SQL"
     ],
     "answer": 1,
     "why": "Separating layers means each file has one job. You can swap SQLite for PostgreSQL by changing one module."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "The schema: four tables",
   "body": "The database design goes in `catalog/schema.sql`. One dataset has many keywords, and one keyword (like \"water\") belongs to many datasets: that's **many-to-many**, so it needs a **link table**. One dataset also has many distributions, but each distribution belongs to just one dataset: **one-to-many**.\n\n```svg The four tables: datasets in the middle; dataset_keywords links datasets to keywords many-to-many; distributions points at its dataset one-to-many\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 580 200\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"580\" height=\"200\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"20\" width=\"150\" height=\"160\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"85\" y=\"40\" text-anchor=\"middle\" font-weight=\"bold\">datasets</text>\n  <text x=\"20\" y=\"62\">id (PRIMARY KEY)</text><text x=\"20\" y=\"80\">title, description</text><text x=\"20\" y=\"98\">publisher, contact_email</text><text x=\"20\" y=\"116\">license</text><text x=\"20\" y=\"134\">access_level CHECK</text><text x=\"20\" y=\"152\">modified CHECK</text><text x=\"20\" y=\"170\">landing_page</text>\n  <rect x=\"215\" y=\"20\" width=\"150\" height=\"80\" rx=\"6\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"290\" y=\"40\" text-anchor=\"middle\" font-weight=\"bold\">dataset_keywords</text><text x=\"225\" y=\"62\">dataset_id</text><text x=\"225\" y=\"80\">keyword_id</text>\n  <rect x=\"420\" y=\"20\" width=\"150\" height=\"80\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"495\" y=\"40\" text-anchor=\"middle\" font-weight=\"bold\">keywords</text><text x=\"430\" y=\"62\">id</text><text x=\"430\" y=\"80\">name UNIQUE</text>\n  <rect x=\"215\" y=\"120\" width=\"150\" height=\"70\" rx=\"6\" fill=\"#fce7f3\" stroke=\"#db2777\"/><text x=\"290\" y=\"140\" text-anchor=\"middle\" font-weight=\"bold\">distributions</text><text x=\"225\" y=\"160\">dataset_id, format</text><text x=\"225\" y=\"178\">url</text>\n  <path d=\"M160 60 H211 M365 60 H416 M160 150 H211\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"185\" y=\"54\" text-anchor=\"middle\" fill=\"#6b7280\">1..n</text><text x=\"390\" y=\"54\" text-anchor=\"middle\" fill=\"#6b7280\">n..1</text><text x=\"185\" y=\"144\" text-anchor=\"middle\" fill=\"#6b7280\">1..n</text>\n</svg>\n```\n\n```sql\nCREATE TABLE IF NOT EXISTS datasets (\n  id            TEXT PRIMARY KEY,                       -- short slug, e.g. \"crater-survey-2024\"\n  title         TEXT NOT NULL,\n  description   TEXT NOT NULL,\n  publisher     TEXT NOT NULL,\n  contact_email TEXT NOT NULL,\n  license       TEXT NOT NULL,\n  access_level  TEXT NOT NULL CHECK (access_level IN ('public', 'restricted', 'non-public')),\n  modified      TEXT NOT NULL CHECK (modified GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),\n  landing_page  TEXT,\n  created_at    TEXT NOT NULL DEFAULT (datetime('now'))\n);\n\nCREATE TABLE IF NOT EXISTS keywords (\n  id   INTEGER PRIMARY KEY,\n  name TEXT NOT NULL UNIQUE\n);\n\nCREATE TABLE IF NOT EXISTS dataset_keywords (\n  dataset_id TEXT    NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,\n  keyword_id INTEGER NOT NULL REFERENCES keywords(id),\n  PRIMARY KEY (dataset_id, keyword_id)\n);\n\nCREATE TABLE IF NOT EXISTS distributions (\n  id         INTEGER PRIMARY KEY,\n  dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,\n  format     TEXT NOT NULL,\n  url        TEXT NOT NULL,\n  UNIQUE (dataset_id, url)\n);\n\nCREATE INDEX IF NOT EXISTS idx_datasets_publisher ON datasets(publisher);\nCREATE INDEX IF NOT EXISTS idx_datasets_modified  ON datasets(modified);\n```\n\n- `CHECK (...)` is a rule the database itself enforces. Even if the Python validation had a bug, a bad `access_level` could never be saved. That's **defense in depth**.\n- `PRIMARY KEY (dataset_id, keyword_id)`: a two-column key, so the same keyword can't be linked to the same dataset twice.\n- `ON DELETE CASCADE`: delete a dataset and its links and distributions go with it, so nothing is left pointing at a dataset that's gone.\n- The **indexes** make filtering by publisher and sorting by date fast when there are thousands of records.\n- `IF NOT EXISTS` means running the file again is harmless.",
   "quiz": [
    {
     "q": "Why do keywords need the dataset_keywords link table?",
     "options": [
      "SQLite can't store lists",
      "One dataset has many keywords and one keyword belongs to many datasets: many-to-many needs a table of pairs",
      "To make the database bigger"
     ],
     "answer": 1,
     "why": "A link table stores one row per (dataset, keyword) pair, which is how relational databases model many-to-many."
    },
    {
     "q": "What does `ON DELETE CASCADE` do?",
     "options": [
      "Deleting a dataset also deletes its rows in the tables that point to it",
      "Deleting a keyword deletes every dataset",
      "Nothing until you run CASCADE yourself"
     ],
     "answer": 0,
     "why": "Rows that reference the deleted dataset are removed automatically, so no orphans are left behind."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15,
   "uses": [
    "sql",
    "linktables"
   ]
  },
  {
   "title": "The store: all the SQL in one place",
   "body": "`catalog/store.py` opens the database and holds every query. Start with connecting:\n\n```python\nimport sqlite3\nfrom pathlib import Path\n\nSCHEMA = Path(__file__).with_name(\"schema.sql\")\nFIELDS = (\"id\", \"title\", \"description\", \"publisher\", \"contact_email\", \"license\",\n          \"access_level\", \"modified\", \"landing_page\")\n\n\ndef connect(path: str = \":memory:\") -> sqlite3.Connection:\n    conn = sqlite3.connect(path, check_same_thread=False)\n    conn.row_factory = sqlite3.Row\n    conn.execute(\"PRAGMA foreign_keys = ON\")      # SQLite doesn't enforce them unless asked\n    conn.executescript(SCHEMA.read_text(encoding=\"utf-8\"))\n    return conn\n```\n\n- `\":memory:\"` makes a database that lives only in memory: perfect for tests, because each one starts empty.\n- `row_factory = sqlite3.Row` lets you read columns by name (`row[\"title\"]`) and turn a row into a dict.\n- `PRAGMA foreign_keys = ON`: SQLite ignores `REFERENCES` and `CASCADE` unless you turn this on. A classic gotcha.\n- `encoding=\"utf-8\"` keeps Windows from misreading the file.\n\n### ? placeholders, always\n\n```python\ndef exists(conn, dataset_id: str) -> bool:\n    return conn.execute(\"SELECT 1 FROM datasets WHERE id = ?\", (dataset_id,)).fetchone() is not None\n```\n\nThe `?` is filled in by SQLite with the value **as data**, never pasted into the SQL text. If someone sends an id like `x'; DROP TABLE datasets; --`, it's just a strange id that matches nothing. Building SQL with f-strings from user input is how **SQL injection** happens. Note `(dataset_id,)`: the comma makes it a one-item tuple.\n\n### Writing in one transaction\n\n```python\ndef create(conn, record: dict) -> dict:\n    \"\"\"Adds a new dataset and its keywords and distributions in one transaction.\"\"\"\n    with conn:\n        conn.execute(\n            f\"INSERT INTO datasets ({', '.join(FIELDS)}) VALUES ({', '.join('?' * len(FIELDS))})\",\n            [record.get(f) for f in FIELDS],\n        )\n        _write_children(conn, record[\"id\"], record)\n    return get(conn, record[\"id\"])\n```\n\n`with conn:` is a **transaction**: if anything inside fails, every change in the block is rolled back, so you never get a dataset saved without its keywords. The f-string here only builds the column names from the fixed `FIELDS` tuple, never from user input; the values still go through `?`.\n\n```python\ndef _keyword_id(conn, name: str) -> int:\n    conn.execute(\"INSERT OR IGNORE INTO keywords (name) VALUES (?)\", (name,))\n    return conn.execute(\"SELECT id FROM keywords WHERE name = ?\", (name,)).fetchone()[\"id\"]\n```\n\n`INSERT OR IGNORE` adds the keyword only if it's new (the `UNIQUE` on `name` stops duplicates), then the SELECT gets its id either way.\n\n### Reading one record back\n\n```python\ndef get(conn, dataset_id: str) -> dict | None:\n    row = conn.execute(\"SELECT * FROM datasets WHERE id = ?\", (dataset_id,)).fetchone()\n    if row is None:\n        return None\n    out = dict(row)\n    out[\"keywords\"] = [r[\"name\"] for r in conn.execute(\n        \"\"\"SELECT k.name FROM keywords k JOIN dataset_keywords dk ON dk.keyword_id = k.id\n           WHERE dk.dataset_id = ? ORDER BY k.name\"\"\", (dataset_id,))]\n    out[\"distributions\"] = [dict(r) for r in conn.execute(\n        \"SELECT format, url FROM distributions WHERE dataset_id = ? ORDER BY id\", (dataset_id,))]\n    return out\n```\n\nIt returns `None` when there's no such dataset, and the route turns that into a 404. `update` and `delete` follow the same pattern; `delete` returns `rowcount == 1`, so the route knows whether something was actually deleted.",
   "quiz": [
    {
     "q": "Why use `?` placeholders instead of putting values in the SQL with an f-string?",
     "options": [
      "They run faster",
      "The value is passed as data, so input can never change the SQL: that stops SQL injection",
      "f-strings don't work in Python 3"
     ],
     "answer": 1,
     "why": "Placeholders keep code and data separate. It's the single most important rule for database code."
    },
    {
     "q": "What does `with conn:` give you?",
     "options": [
      "A faster connection",
      "A new database",
      "A transaction: everything in the block is saved together, or none of it is if there's an error"
     ],
     "answer": 2,
     "why": "All-or-nothing writes keep related rows (a dataset and its keywords) consistent."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 18,
   "uses": [
    "sql"
   ]
  },
  {
   "title": "Validation that lists every problem",
   "body": "Before anything is saved, `catalog/validate.py` checks the record. The key decision: **collect every problem, not just the first**, so whoever is fixing a record sees everything at once instead of fixing one error, resubmitting, and finding the next.\n\n```python\nimport re\nfrom datetime import date\n\nREQUIRED = (\"id\", \"title\", \"description\", \"publisher\", \"contact_email\", \"license\", \"access_level\", \"modified\")\nACCESS_LEVELS = (\"public\", \"restricted\", \"non-public\")\nSLUG = re.compile(r\"^[a-z0-9]+(?:-[a-z0-9]+)*$\")\nEMAIL = re.compile(r\"^[^@\\s]+@[^@\\s]+\\.[A-Za-z]{2,}$\")\n\n\ndef problems(record: dict, *, partial: bool = False) -> list[str]:\n    \"\"\"Plain-English problems with a record (empty list = valid).\n\n    partial=True is for updates: only the fields that were sent are checked.\n    \"\"\"\n    errors = []\n    for field in REQUIRED:\n        if partial and field not in record:\n            continue\n        value = record.get(field)\n        if value is None or (isinstance(value, str) and not value.strip()):\n            errors.append(f\"{field} is required\")\n\n    def present(f):\n        return isinstance(record.get(f), str) and record[f].strip()\n\n    if present(\"id\") and not SLUG.match(record[\"id\"]):\n        errors.append(\"id must be lowercase letters, numbers and single hyphens, like 'crater-survey-2024'\")\n    if present(\"contact_email\") and not EMAIL.match(record[\"contact_email\"]):\n        errors.append(\"contact_email must be a valid email address\")\n    if present(\"access_level\") and record[\"access_level\"] not in ACCESS_LEVELS:\n        errors.append(f\"access_level must be one of: {', '.join(ACCESS_LEVELS)}\")\n    if present(\"modified\"):\n        try:\n            if date.fromisoformat(record[\"modified\"]) > date.today():\n                errors.append(\"modified can't be in the future\")\n        except ValueError:\n            errors.append(\"modified must be a date like 2024-05-31\")\n    ...\n    return errors\n```\n\n- An **empty list means valid**. The caller just checks `if errors:`.\n- `*` in the signature makes `partial` **keyword-only**: you must write `problems(data, partial=True)`, which reads clearly.\n- `partial=True` is for PATCH updates: a request that changes only the title shouldn't fail for \"missing\" fields it didn't send.\n- `present()` is a small helper defined inside the function, so format checks only run on fields that are there (no \"id is required\" **and** \"id must be lowercase\" for the same empty field).\n- `date.fromisoformat()` raises `ValueError` for text that isn't a date, which becomes a friendly message.\n- The real file also checks length limits, the landing page URL, that keywords is a non-empty list, and each distribution's format and URL.\n\n```svg problems() runs every check and keeps going: three problems found means three messages back, and an empty list means the record is valid\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"150\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"45\" width=\"110\" height=\"60\" rx=\"8\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"65\" y=\"71\" text-anchor=\"middle\">record</text><text x=\"65\" y=\"88\" text-anchor=\"middle\">(a dict)</text>\n  <rect x=\"150\" y=\"10\" width=\"160\" height=\"28\" rx=\"6\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"230\" y=\"29\" text-anchor=\"middle\">required fields?</text>\n  <rect x=\"150\" y=\"45\" width=\"160\" height=\"28\" rx=\"6\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"230\" y=\"64\" text-anchor=\"middle\">id is a slug? email?</text>\n  <rect x=\"150\" y=\"80\" width=\"160\" height=\"28\" rx=\"6\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"230\" y=\"99\" text-anchor=\"middle\">access level? date?</text>\n  <rect x=\"150\" y=\"115\" width=\"160\" height=\"28\" rx=\"6\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"230\" y=\"134\" text-anchor=\"middle\">keywords, distributions?</text>\n  <rect x=\"350\" y=\"40\" width=\"200\" height=\"70\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"450\" y=\"62\" text-anchor=\"middle\">errors = [</text><text x=\"450\" y=\"80\" text-anchor=\"middle\">\"title is required\",</text><text x=\"450\" y=\"98\" text-anchor=\"middle\">\"contact_email must be ...\" ]</text>\n  <path d=\"M120 75 H146 M310 75 H346\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```\n\n### normalize(): clean before saving\n\n```python\ndef normalize(record: dict) -> dict:\n    \"\"\"Trims text, lower-cases keywords and drops duplicate keywords, keeping their order.\"\"\"\n    out = {k: (v.strip() if isinstance(v, str) else v) for k, v in record.items()}\n    seen, keywords = set(), []\n    for k in out.get(\"keywords\") or []:\n        k = str(k).strip().lower()\n        if k and k not in seen:\n            seen.add(k)\n            keywords.append(k)\n    out[\"keywords\"] = keywords\n    ...\n    return out\n```\n\n\"Water\", \" water \" and \"WATER\" all become one keyword, `water`, so searching by keyword finds every dataset that uses it. The `seen` set makes checking for duplicates fast, while the list keeps the original order.\n\n### Try it\n\nIn a Python shell, `from catalog.validate import problems` and call it with `{}`: you get one message per required field. Then try a record with a bad email and a future date.",
   "quiz": [
    {
     "q": "Why does problems() return a list instead of stopping at the first error?",
     "options": [
      "Lists are faster than exceptions",
      "So the person submitting a record can fix every problem in one pass",
      "Python functions can't stop early"
     ],
     "answer": 1,
     "why": "Reporting everything at once saves round trips. It's a user-experience decision you can explain in an interview."
    },
    {
     "q": "What is `partial=True` for?",
     "options": [
      "Records that are half valid",
      "Updates (PATCH), where only the fields that were sent should be checked",
      "Skipping validation completely"
     ],
     "answer": 1,
     "why": "A PATCH that changes only the title shouldn't fail because the other required fields weren't in the request."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Flask in ten minutes",
   "body": "**Flask** is a small Python web framework. You write functions, and Flask calls the right one for each URL and HTTP method. `catalog/app.py` builds the app inside a function, `create_app()`, so tests can make a fresh app with its own in-memory database:\n\n```python\nimport os\nfrom flask import Flask, jsonify, request\n\nfrom . import store\nfrom .validate import normalize, problems\n\n\ndef create_app(db_path: str | None = None) -> Flask:\n    app = Flask(__name__)\n    conn = store.connect(db_path or os.environ.get(\"CATALOG_DB\", \"catalog.db\"))\n    app.config[\"CONN\"] = conn\n\n    def fail(status: int, *errors: str):\n        return jsonify({\"errors\": list(errors)}), status\n\n    def body():\n        data = request.get_json(silent=True)\n        return data if isinstance(data, dict) else None\n\n    @app.get(\"/api/health\")\n    def health():\n        return jsonify({\"status\": \"ok\"})\n\n    ...\n    return app\n```\n\n- `@app.get(\"/api/health\")` is a **decorator**: it registers the function below it for GET requests to that path.\n- `jsonify(...)` turns a dict or list into a JSON response. Returning a tuple `(response, 201)` sets the status code.\n- `fail()` gives every error the same shape, `{\"errors\": [...]}`. Clients always know where to look.\n- `request.get_json(silent=True)` returns `None` instead of crashing when the body isn't JSON; `body()` also rejects JSON that isn't an object (like a list).\n- `os.environ.get(\"CATALOG_DB\", ...)`: settings come from **environment variables**, so the same code runs locally and on a server.\n\n`run.py` starts it: `create_app().run(debug=True)`. Run `python run.py` and open `http://127.0.0.1:5000/api/health`.\n\n```svg One request through Flask: the client sends a method and path, Flask finds the matching route function, which returns JSON and a status code\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 140\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"560\" height=\"140\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"40\" width=\"150\" height=\"60\" rx=\"8\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"85\" y=\"66\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"12\">GET /api/health</text><text x=\"85\" y=\"84\" text-anchor=\"middle\">client</text>\n  <rect x=\"200\" y=\"40\" width=\"150\" height=\"60\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"275\" y=\"66\" text-anchor=\"middle\">Flask matches</text><text x=\"275\" y=\"84\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"12\">@app.get(...)</text>\n  <rect x=\"390\" y=\"40\" width=\"160\" height=\"60\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"470\" y=\"66\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"12\">{\"status\": \"ok\"}</text><text x=\"470\" y=\"84\" text-anchor=\"middle\">200 OK</text>\n  <path d=\"M160 70 H196 M350 70 H386\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What does `@app.get(\"/api/health\")` do?",
     "options": [
      "Downloads the health page",
      "Registers the function under it to handle GET requests to /api/health",
      "Checks whether the server is healthy"
     ],
     "answer": 1,
     "why": "Decorators wrap or register functions. In Flask they connect a URL and method to your code."
    },
    {
     "q": "Why build the app in a create_app() function?",
     "options": [
      "Tests can create a fresh app with its own in-memory database each time",
      "Flask requires it",
      "It makes the server start faster"
     ],
     "answer": 0,
     "why": "This is the \"application factory\" pattern. Each test gets a clean app, so tests never affect each other."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "The routes and their status codes",
   "body": "Each route is short: read the request, validate, call the store, answer. The status code tells the client what happened:\n\n```python\n@app.post(\"/api/datasets\")\ndef create_dataset():\n    data = body()\n    if data is None:\n        return fail(400, \"Send the dataset as a JSON object\")\n    errors = problems(data)\n    if errors:\n        return fail(400, *errors)\n    record = normalize(data)\n    if store.exists(conn, record[\"id\"]):\n        return fail(409, f\"A dataset with id '{record['id']}' already exists\")\n    return jsonify(store.create(conn, record)), 201\n```\n\n```svg How POST /api/datasets decides its answer: not a JSON object gives 400, any validation problems give 400 with all of them, an id that exists gives 409, otherwise the dataset is created and the answer is 201\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 580 170\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"580\" height=\"170\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"20\" width=\"120\" height=\"44\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"70\" y=\"38\" text-anchor=\"middle\">a JSON object?</text><text x=\"70\" y=\"54\" text-anchor=\"middle\" font-family=\"monospace\">body()</text>\n  <rect x=\"155\" y=\"20\" width=\"120\" height=\"44\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"215\" y=\"38\" text-anchor=\"middle\">no problems?</text><text x=\"215\" y=\"54\" text-anchor=\"middle\" font-family=\"monospace\">problems()</text>\n  <rect x=\"300\" y=\"20\" width=\"120\" height=\"44\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"360\" y=\"38\" text-anchor=\"middle\">id is new?</text><text x=\"360\" y=\"54\" text-anchor=\"middle\" font-family=\"monospace\">exists()</text>\n  <rect x=\"445\" y=\"20\" width=\"125\" height=\"44\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"507\" y=\"38\" text-anchor=\"middle\">create()</text><text x=\"507\" y=\"54\" text-anchor=\"middle\" font-weight=\"bold\">201 Created</text>\n  <rect x=\"10\" y=\"105\" width=\"120\" height=\"44\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"70\" y=\"132\" text-anchor=\"middle\" font-weight=\"bold\">400</text>\n  <rect x=\"155\" y=\"105\" width=\"120\" height=\"44\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"215\" y=\"124\" text-anchor=\"middle\" font-weight=\"bold\">400</text><text x=\"215\" y=\"140\" text-anchor=\"middle\">every problem</text>\n  <rect x=\"300\" y=\"105\" width=\"120\" height=\"44\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"360\" y=\"124\" text-anchor=\"middle\" font-weight=\"bold\">409 Conflict</text><text x=\"360\" y=\"140\" text-anchor=\"middle\">duplicate id</text>\n  <path d=\"M130 42 H151 M275 42 H296 M420 42 H441 M70 64 V101 M215 64 V101 M360 64 V101\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"78\" y=\"88\" fill=\"#6b7280\">no</text><text x=\"223\" y=\"88\" fill=\"#6b7280\">no</text><text x=\"368\" y=\"88\" fill=\"#6b7280\">no</text>\n</svg>\n```\n\n| Code | Meaning | When this API sends it |\n|---|---|---|\n| 200 OK | Here's what you asked for | GET, PATCH |\n| 201 Created | A new record was made | POST |\n| 204 No Content | Done, nothing to send back | DELETE |\n| 400 Bad Request | Your request is wrong | Not JSON, validation problems, bad paging |\n| 404 Not Found | No such record | GET, PATCH or DELETE of an unknown id |\n| 409 Conflict | Clashes with what's there | POST with an id that exists |\n\n### PATCH changes only what was sent\n\n```python\n@app.patch(\"/api/datasets/<dataset_id>\")\ndef update_dataset(dataset_id):\n    data = body()\n    if data is None:\n        return fail(400, \"Send the changes as a JSON object\")\n    if \"id\" in data and data[\"id\"] != dataset_id:\n        return fail(400, \"id can't be changed\")\n    errors = problems(data, partial=True)\n    if errors:\n        return fail(400, *errors)\n    changes = normalize(data)\n    changes = {k: v for k, v in changes.items() if k in data}   # only what was sent\n    record = store.update(conn, dataset_id, changes)\n    return jsonify(record) if record else fail(404, f\"No dataset with id '{dataset_id}'\")\n```\n\n`<dataset_id>` in the path is a **URL variable**, passed to the function as an argument. The dict comprehension keeps only the keys the client sent, because `normalize()` always adds `keywords` and `distributions`, and an update must not wipe them out. (That was a real bug worth a test: see step 9.)\n\n### DELETE and the error handlers\n\n```python\n@app.delete(\"/api/datasets/<dataset_id>\")\ndef delete_dataset(dataset_id):\n    return (\"\", 204) if store.delete(conn, dataset_id) else fail(404, f\"No dataset with id '{dataset_id}'\")\n\n@app.errorhandler(404)\ndef not_found(_):\n    return fail(404, \"Not found\")\n```\n\nThe error handlers make even unknown URLs answer with JSON in the same `{\"errors\": [...]}` shape, instead of Flask's HTML error page.",
   "quiz": [
    {
     "q": "A client POSTs a dataset whose id already exists. What should it get?",
     "options": [
      "200",
      "404",
      "409 Conflict"
     ],
     "answer": 2,
     "why": "The request is well formed but clashes with the current state, which is what 409 means."
    },
    {
     "q": "Why does update_dataset filter `changes` down to the keys in `data`?",
     "options": [
      "To make the response smaller",
      "normalize() always adds keywords and distributions, and a PATCH that didn't send them must not erase them",
      "Flask requires it"
     ],
     "answer": 1,
     "why": "PATCH means \"change only these fields\". Without the filter, a title change would wipe the keywords."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 20
  },
  {
   "title": "Search, filters and pages",
   "body": "`GET /api/datasets?q=crater&keyword=moon&publisher=...&page=2&per_page=20` searches the catalog. `store.search()` builds the WHERE clause one filter at a time, so a filter that wasn't given adds nothing:\n\n```python\ndef search(conn, q=\"\", keyword=\"\", publisher=\"\", access_level=\"\", page=1, per_page=20) -> dict:\n    page = max(1, int(page))\n    per_page = min(MAX_PER_PAGE, max(1, int(per_page)))\n    where, params = [], []\n    for word in q.split():\n        where.append(\"(d.title LIKE ? OR d.description LIKE ?)\")\n        params += [f\"%{word}%\", f\"%{word}%\"]\n    if keyword:\n        where.append(\"\"\"EXISTS (SELECT 1 FROM dataset_keywords dk JOIN keywords k ON k.id = dk.keyword_id\n                               WHERE dk.dataset_id = d.id AND k.name = ?)\"\"\")\n        params.append(keyword.strip().lower())\n    if publisher:\n        where.append(\"d.publisher = ?\")\n        params.append(publisher)\n    clause = (\"WHERE \" + \" AND \".join(where)) if where else \"\"\n    total = conn.execute(f\"SELECT COUNT(*) FROM datasets d {clause}\", params).fetchone()[0]\n    ...\n```\n\n- `where` and `params` grow together: every `?` in `where` has its value at the same position in `params`. The SQL text only ever contains fixed pieces written in the code; user input only goes into `params`.\n- Every word of `q` must match the title or the description (`AND` between words).\n- `EXISTS (...)` asks \"is there a link from this dataset to that keyword?\" without joining and duplicating rows.\n- `per_page` is clamped between 1 and 100 (`MAX_PER_PAGE`), so nobody can ask for a million rows at once.\n\n### Ranking and paging\n\n```python\nrows = conn.execute(\n    f\"\"\"SELECT d.id, d.title, d.publisher, d.access_level, d.modified FROM datasets d {clause}\n        ORDER BY CASE WHEN ? <> '' AND d.title LIKE ? THEN 0 ELSE 1 END, d.modified DESC, d.title\n        LIMIT ? OFFSET ?\"\"\",\n    params + [first, f\"%{first}%\", per_page, (page - 1) * per_page],\n).fetchall()\nreturn {\"total\": total, \"page\": page, \"per_page\": per_page,\n        \"pages\": (total + per_page - 1) // per_page, \"results\": [dict(r) for r in rows]}\n```\n\n- `ORDER BY CASE ... THEN 0 ELSE 1 END` puts title matches before description-only matches, then newest first.\n- `LIMIT ? OFFSET ?` returns one page: page 2 with 20 per page skips 20 rows.\n- `(total + per_page - 1) // per_page` is **ceiling division**: 41 results at 20 per page is 3 pages.\n- The response says how many results and pages there are, so a front end can draw page buttons.\n\nThe route checks that `page` and `per_page` are whole numbers first, and answers 400 if they're not.",
   "quiz": [
    {
     "q": "How does search() stay safe from SQL injection while building SQL with f-strings?",
     "options": [
      "It removes quotes from the input",
      "The f-string only joins fixed pieces written in the code; every user value goes into params for a ? placeholder",
      "It doesn't: it's unsafe"
     ],
     "answer": 1,
     "why": "Building the shape of a query dynamically is fine as long as user input only ever travels as parameters."
    },
    {
     "q": "With 41 results and per_page=20, what is `(41 + 20 - 1) // 20`?",
     "options": [
      "2",
      "3",
      "2.05"
     ],
     "answer": 1,
     "why": "60 // 20 = 3. Adding per_page - 1 before integer division rounds up, so the last partial page counts."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 18,
   "uses": [
    "linktables",
    "rankedsearch"
   ]
  },
  {
   "title": "Loading data safely",
   "body": "`load.py` loads a JSON file of records, like a real agency's export. It reuses the same validation and store, so the rules are the same everywhere:\n\n```python\ndef load(conn, records: list) -> dict:\n    report = {\"added\": 0, \"updated\": 0, \"rejected\": []}\n    for i, raw in enumerate(records, 1):\n        if not isinstance(raw, dict):\n            report[\"rejected\"].append({\"record\": i, \"id\": None, \"errors\": [\"record must be a JSON object\"]})\n            continue\n        errors = problems(raw)\n        if errors:\n            report[\"rejected\"].append({\"record\": i, \"id\": raw.get(\"id\"), \"errors\": errors})\n            continue\n        record = normalize(raw)\n        if store.exists(conn, record[\"id\"]):\n            store.update(conn, record[\"id\"], record)\n            report[\"updated\"] += 1\n        else:\n            store.create(conn, record)\n            report[\"added\"] += 1\n    return report\n```\n\n- One bad record doesn't stop the load: it's **skipped and reported with every reason**, and the good ones still go in.\n- If the id exists, the record is **updated** instead of added. Running the load twice gives the same result, which is called **idempotent**. That matters for scheduled jobs that may run again after a failure.\n- `enumerate(records, 1)` counts from 1, so the report says \"record 3\", the way a person counts.\n\n`main()` uses `argparse` for `python load.py my_records.json --db other.db`, prints `Added 10, updated 0, rejected 2` with each reason, and **exits with code 1 if anything was rejected**, so a scheduler or CI job notices.\n\n```svg The loader: each record is checked; bad ones go to the rejected list with their reasons, good ones are added if new or updated if their id exists\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"150\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"50\" width=\"110\" height=\"50\" rx=\"8\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"65\" y=\"72\" text-anchor=\"middle\">records.json</text><text x=\"65\" y=\"88\" text-anchor=\"middle\">a list</text>\n  <rect x=\"150\" y=\"50\" width=\"110\" height=\"50\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"205\" y=\"80\" text-anchor=\"middle\">problems()?</text>\n  <rect x=\"300\" y=\"10\" width=\"110\" height=\"40\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"355\" y=\"35\" text-anchor=\"middle\">rejected + why</text>\n  <rect x=\"300\" y=\"100\" width=\"110\" height=\"40\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"355\" y=\"125\" text-anchor=\"middle\">exists()?</text>\n  <rect x=\"440\" y=\"70\" width=\"110\" height=\"34\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"495\" y=\"92\" text-anchor=\"middle\">update</text>\n  <rect x=\"440\" y=\"112\" width=\"110\" height=\"34\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"495\" y=\"134\" text-anchor=\"middle\">create</text>\n  <path d=\"M120 75 H146 M260 65 L296 30 M260 85 L296 120 M410 115 L436 88 M410 125 L436 128\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What does \"idempotent\" mean for this loader?",
     "options": [
      "It runs only once",
      "Running it twice with the same file gives the same catalog, with no duplicates",
      "It deletes old records first"
     ],
     "answer": 1,
     "why": "Existing ids are updated instead of inserted again, so repeating the load is safe."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Testing the API, and explaining it",
   "body": "The project has 28 tests in three files: `test_validate.py`, `test_store.py` and `test_api.py`. The API tests use Flask's **test client**, which sends requests to the app without starting a server:\n\n```python\nclass ApiTests(unittest.TestCase):\n    def setUp(self):\n        app = create_app(\":memory:\")\n        load(app.config[\"CONN\"], SAMPLE)\n        self.client = app.test_client()\n        self.addCleanup(app.config[\"CONN\"].close)\n\n    def test_get_one_and_404(self):\n        self.assertEqual(self.client.get(\"/api/datasets/park-locations\").get_json()[\"title\"], \"City Park Locations\")\n        missing = self.client.get(\"/api/datasets/nope\")\n        self.assertEqual(missing.status_code, 404)\n        self.assertIn(\"errors\", missing.get_json())\n\n    def test_create(self):\n        res = self.client.post(\"/api/datasets\", json=NEW)\n        self.assertEqual(res.status_code, 201)\n        self.assertEqual(res.get_json()[\"keywords\"], [\"rivers\", \"water\"])\n```\n\n- `setUp` runs **before every test**: a brand-new in-memory database loaded with the sample records. No test can break another.\n- `addCleanup` closes the connection after each test.\n- `json=NEW` sends a dict as a JSON body; `get_json()` reads the answer.\n- `test_create` checks normalizing too: `\"Rivers\"` became `\"rivers\"`, sorted.\n\nWrite a test like this one yourself: POST a record with two problems at once, and check that the answer is 400 and that `errors` has both messages. Run everything with `python -m unittest` from the project folder.\n\n### Explain it in an interview\n\nPractice saying this out loud in about two minutes:\n\n1. **What:** \"A metadata catalog API: datasets described by title, publisher, license, access level, keywords and distributions, searchable through a REST API.\"\n2. **How it's built:** \"Three layers: Flask routes, a validation module and a store module that holds all the SQL, on SQLite with four tables, including a link table for keywords.\"\n3. **Decisions:** \"Validation returns every problem at once. All SQL uses ? placeholders. Writes happen in transactions. The loader is idempotent and reports rejected records with reasons.\"\n4. **Testing:** \"28 unittest tests; the API tests use Flask's test client with a fresh in-memory database for each test.\"\n5. **Next:** \"PostgreSQL and authentication for production, a metadata standard like DCAT, an audit log of changes, and running the tests in CI.\"\n\n### Drill: from memory\n\nClose the files and write `problems()` for three fields (`id`, `title`, `contact_email`) in a blank file, plus the POST route that uses it. Then compare with the real code. Do it twice, and it'll be ready when an interviewer asks you to write code live.",
   "quiz": [
    {
     "q": "Why does setUp create a new in-memory database for every test?",
     "options": [
      "Disk databases aren't allowed in tests",
      "Each test starts from the same known data, so tests can't affect each other and can run in any order",
      "It's faster to type"
     ],
     "answer": 1,
     "why": "Independent tests are reliable tests. A test that only passes after another one ran is a hidden bug."
    },
    {
     "q": "What does Flask's test client let you do?",
     "options": [
      "Send requests to the app and read the responses without running a server",
      "Test the client's browser",
      "Deploy the app"
     ],
     "answer": 0,
     "why": "The test client calls your routes directly, so API tests are fast and need no network."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 20
  }
 ],
 "finish": "You rebuilt a real metadata catalog API. You learned:\n\n- A **schema** with primary keys, CHECK constraints, a many-to-many **link table**, cascades and indexes\n- A **store** module where all the SQL lives, with **? placeholders** and **transactions**\n- **Validation** that lists every problem, and `normalize()` for clean data\n- **Flask** routes with an application factory and the right **status code** for every outcome\n- **Search** built from optional filters, with ranking and pages\n- An **idempotent loader** that reports rejected records\n- **API tests** with the test client and a fresh database for each test\n\n### Challenges\n\n1. Add a `GET /api/datasets/<id>/distributions` route that returns only the distributions.\n2. Add a `tags` filter that accepts several keywords and returns datasets that have all of them.\n3. Move the database to PostgreSQL with `psycopg`: only `store.py` should need to change.\n\n### Next\n\nThe **Flask REST APIs** guide uses SQLAlchemy models instead of hand-written SQL, so you can compare the two approaches."
};
