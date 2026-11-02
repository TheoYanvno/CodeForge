// Built from guides/sql.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "sql",
 "title": "SQL basics: a book library",
 "goals": [
  "Explain what a database, a table, a row and a column are",
  "Create tables with CREATE TABLE, types and NOT NULL",
  "Add rows safely with INSERT and ? parameters",
  "Ask questions with SELECT, WHERE, ORDER BY and LIKE",
  "Summarize data with COUNT and GROUP BY",
  "Connect two tables with a foreign key and a JOIN"
 ],
 "prereqs": [
  "The JavaScript basics guide (functions, events, arrays)"
 ],
 "sessions": [
  {
   "title": "Tables and rows",
   "from": 0,
   "to": 2
  },
  {
   "title": "Asking questions",
   "from": 3,
   "to": 5
  },
  {
   "title": "Two tables",
   "from": 6,
   "to": 7
  }
 ],
 "start": {
  "html": {
   "page": ""
  },
  "css": {
   "base": ""
  },
  "js": {
   "setup": "",
   "schema": "",
   "data": "",
   "queries": "",
   "show": "",
   "controls": "",
   "go": ""
  }
 },
 "steps": [
  {
   "title": "A real database inside the page",
   "body": "Almost every app keeps its data in a **database**: shops keep products and orders, a clinic keeps patients and appointments, a social network keeps posts. **SQL** (Structured Query Language, said \"S-Q-L\" or \"sequel\") is the language for talking to most of them. You write a sentence like `SELECT title FROM books WHERE year < 1850`, and the database finds the answer.\n\nIn this guide you'll build a **book library**: a page backed by a real SQL database, where you can filter books by genre, search titles and authors, and see counts. It's the warm-up for the Marvel Character Database guide, which uses the same tools on 214 characters. The finished project is at [github.com/TheoYanvno/sql-library](https://github.com/TheoYanvno/sql-library).\n\n### Tables, rows and columns\n\nA database holds **tables**. A table looks like a spreadsheet: each **row** is one thing (one book), and each **column** is one fact about it (its title, author, year).\n\n```svg A table is like a spreadsheet: each row is one book and each column is one fact about it\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 190\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"190\" fill=\"#ffffff\"/>\n  <text x=\"20\" y=\"22\" font-weight=\"bold\" fill=\"#7c2d12\">table: books</text>\n  <rect x=\"20\" y=\"32\" width=\"480\" height=\"30\" fill=\"#fed7aa\"/>\n  <text x=\"30\" y=\"52\" font-weight=\"bold\">id</text><text x=\"70\" y=\"52\" font-weight=\"bold\">title</text><text x=\"250\" y=\"52\" font-weight=\"bold\">author</text><text x=\"390\" y=\"52\" font-weight=\"bold\">year</text><text x=\"440\" y=\"52\" font-weight=\"bold\">genre</text>\n  <rect x=\"20\" y=\"62\" width=\"480\" height=\"30\" fill=\"#fff7ed\" stroke=\"#fdba74\"/>\n  <text x=\"30\" y=\"82\">1</text><text x=\"70\" y=\"82\">Pride and Prejudice</text><text x=\"250\" y=\"82\">Jane Austen</text><text x=\"390\" y=\"82\">1813</text><text x=\"440\" y=\"82\">Romance</text>\n  <rect x=\"20\" y=\"92\" width=\"480\" height=\"30\" fill=\"#ffffff\" stroke=\"#fdba74\"/>\n  <text x=\"30\" y=\"112\">2</text><text x=\"70\" y=\"112\">Frankenstein</text><text x=\"250\" y=\"112\">Mary Shelley</text><text x=\"390\" y=\"112\">1818</text><text x=\"440\" y=\"112\">Horror</text>\n  <path d=\"M10 77 H18\" stroke=\"#16a34a\" stroke-width=\"3\"/><text x=\"20\" y=\"150\" fill=\"#16a34a\">← each row is one book</text>\n  <path d=\"M265 32 V20\" stroke=\"#2563eb\" stroke-width=\"3\"/><text x=\"280\" y=\"150\" fill=\"#2563eb\">each column is one fact ↑</text>\n  <text x=\"20\" y=\"176\" fill=\"#6b7280\">id is the primary key: a number that's different for every row.</text>\n</svg>\n```\n\n### SQLite in the browser\n\nBig databases like PostgreSQL run on a server. **SQLite** is a whole database in one small library, used inside phones, browsers and apps. **sql.js** is SQLite compiled to run in a web page, so you can practice real SQL with nothing to install. It loads from a CDN (a fast public file server) with one `<script>` tag.\n\n### What the code does\n\n- `initSqlJs()` downloads the database engine. It returns a **promise** (a value that arrives later), and `.then()` runs your code once it's ready.\n- `new SQL.Database()` makes an empty database in memory.\n- `rows(sql)` is a small helper that runs a query and returns the results as plain objects, like `[{ greeting: 'Hello, SQL!' }]`.\n- `SELECT 'Hello, SQL!' AS greeting` is the simplest query: it asks for a value and names the column `greeting`.",
   "checks": [
    {
     "pane": "html",
     "label": "load sql.js from the CDN",
     "test": "/sql-wasm\\.js/",
     "hint": "Add <script src=\"https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js\"></script>"
    },
    {
     "pane": "js",
     "label": "start the database engine",
     "test": "/initSqlJs\\(/",
     "hint": "Call initSqlJs({ locateFile: ... }).then(...)"
    },
    {
     "pane": "js",
     "label": "a helper that runs a query",
     "test": "/function\\s+rows\\s*\\(/",
     "hint": "Write function rows(sql, params = []) { ... }"
    }
   ],
   "quiz": [
    {
     "q": "In a table of books, what is one row?",
     "options": [
      "One book, with all its facts",
      "One fact (like the year) for every book",
      "The whole table"
     ],
     "answer": 0,
     "why": "Rows are records (one book each); columns are the facts every record has."
    },
    {
     "q": "What does `initSqlJs()` return?",
     "options": [
      "The database, right away",
      "A promise: the engine arrives later, and `.then()` runs when it's ready",
      "An error"
     ],
     "answer": 1,
     "why": "Downloading the engine takes a moment, so the code that needs it goes inside `.then()`."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js\"></script>\n<main class=\"library\">\n  <h1>📚 Book Library</h1>\n  <p id=\"status\" class=\"muted\">Loading the database…</p>\n  <div id=\"controls\" class=\"controls\"></div>\n  <div id=\"stats\" class=\"stats\"></div>\n  <div class=\"table-wrap\"><table id=\"results\"></table></div>\n  <details class=\"sql-box\">\n    <summary>The SQL behind this view</summary>\n    <pre id=\"lastSql\"></pre>\n  </details>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  background: #fff7ed;\n  color: #431407;\n}\n\n.library {\n  max-width: 820px;\n  margin: 0 auto;\n  padding: 16px;\n}\n\n.muted { color: #9a3412; }\n\n.controls {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  margin: 12px 0;\n}\n\n.controls input, .controls select {\n  padding: 8px;\n  font-size: 1rem;\n  border: 1px solid #fdba74;\n  border-radius: 8px;\n  background: #ffffff;\n}\n\n.controls input { flex: 1; min-width: 180px; }\n\n.stats {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n\n.stat {\n  padding: 6px 10px;\n  border-radius: 999px;\n  background: #ffedd5;\n  font-size: .9rem;\n}\n\n.table-wrap { overflow-x: auto; }\n\ntable {\n  width: 100%;\n  border-collapse: collapse;\n  background: #ffffff;\n}\n\nth, td {\n  padding: 8px 10px;\n  text-align: left;\n  border-bottom: 1px solid #fed7aa;\n}\n\nth { background: #fed7aa; }\n\n.sql-box { margin-top: 16px; }\n\n.sql-box pre {\n  white-space: pre-wrap;\n  padding: 12px;\n  background: #431407;\n  color: #ffedd5;\n  border-radius: 8px;\n}"
   },
   "js": {
    "setup": "// sql.js: SQLite compiled to WebAssembly, a real SQL database running inside the page.\nconst SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';\nlet db;\n\nconst status = document.getElementById('status');\nconst table = document.getElementById('results');\nconst stats = document.getElementById('stats');\nconst controls = document.getElementById('controls');\nconst lastSql = document.getElementById('lastSql');\n\n// Run a query (with ? parameters) and return the rows as plain objects.\nfunction rows(sql, params = []) {\n  const stmt = db.prepare(sql);\n  stmt.bind(params);\n  const out = [];\n  while (stmt.step()) out.push(stmt.getAsObject());\n  stmt.free();\n  return out;\n}",
    "go": "initSqlJs({ locateFile: (file) => SQLJS + file }).then((SQL) => {\n  db = new SQL.Database();\n  const [first] = rows(\"SELECT 'Hello, SQL!' AS greeting\");\n  status.textContent = first.greeting;\n});"
   }
  },
  {
   "title": "CREATE TABLE: columns and types",
   "body": "Before a database stores anything, you describe the table: its name, its columns, and what kind of value each column holds. That's `CREATE TABLE`:\n\n```sql\nCREATE TABLE books (\n  id     INTEGER PRIMARY KEY,\n  title  TEXT NOT NULL,\n  author TEXT NOT NULL,\n  year   INTEGER NOT NULL,\n  genre  TEXT NOT NULL,\n  status TEXT NOT NULL DEFAULT 'want to read'\n);\n```\n\n### Types and rules\n\n| Part | Means |\n|---|---|\n| `INTEGER` | A whole number |\n| `TEXT` | Words |\n| `REAL` | A decimal number |\n| `PRIMARY KEY` | This column identifies each row. In SQLite an `INTEGER PRIMARY KEY` numbers rows 1, 2, 3… automatically |\n| `NOT NULL` | Every row must have a value here (`NULL` means \"no value\") |\n| `DEFAULT 'want to read'` | The value used when you don't give one |\n| `CHECK (...)` | A rule every row must pass |\n\nThe `CHECK` on `status` means the database refuses anything except the three statuses. Rules in the database protect the data no matter what code writes to it, which is why databases are trusted to keep data correct.\n\nSQL keywords are usually written in CAPITALS so they stand out from your names (`books`, `title`), but SQL doesn't care about case. Each statement ends with `;`.\n\n`db.exec(SCHEMA)` runs the SQL. Then `SELECT name FROM sqlite_master` asks SQLite which tables exist, to prove it worked.",
   "checks": [
    {
     "pane": "js",
     "label": "a books table",
     "test": "/CREATE\\s+TABLE\\s+books\\s*\\(/i",
     "hint": "Write CREATE TABLE books ( ... )"
    },
    {
     "pane": "js",
     "label": "an id primary key",
     "test": "/id\\s+INTEGER\\s+PRIMARY\\s+KEY/i",
     "hint": "Add id INTEGER PRIMARY KEY"
    },
    {
     "pane": "js",
     "label": "required columns",
     "test": "/NOT\\s+NULL/i",
     "hint": "Add NOT NULL to the columns every book must have"
    },
    {
     "pane": "js",
     "label": "the table is created",
     "test": "/db\\.exec\\(\\s*SCHEMA\\s*\\)/",
     "hint": "Run db.exec(SCHEMA)"
    }
   ],
   "quiz": [
    {
     "q": "What does `NOT NULL` on a column mean?",
     "options": [
      "The column can't be zero",
      "Every row must have a value in that column",
      "The column is hidden"
     ],
     "answer": 1,
     "why": "`NULL` means \"no value\". `NOT NULL` makes the database refuse a row without one."
    },
    {
     "q": "Why put rules like `CHECK` in the database instead of only in JavaScript?",
     "options": [
      "The database enforces them for every program that writes to it, so bad data can't get in",
      "JavaScript can't check values",
      "It makes the page faster"
     ],
     "answer": 0,
     "why": "Code changes and has bugs; a rule in the table always holds."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "schema": "const SCHEMA = `\nCREATE TABLE books (\n  id     INTEGER PRIMARY KEY,\n  title  TEXT NOT NULL,\n  author TEXT NOT NULL,\n  year   INTEGER NOT NULL,\n  genre  TEXT NOT NULL,\n  status TEXT NOT NULL DEFAULT 'want to read'\n         CHECK (status IN ('want to read', 'reading', 'read'))\n);\n`;",
    "go": "initSqlJs({ locateFile: (file) => SQLJS + file }).then((SQL) => {\n  db = new SQL.Database();\n  db.exec(SCHEMA);\n  const tables = rows(\"SELECT name FROM sqlite_master WHERE type = 'table'\");\n  status.textContent = `Tables: ${tables.map((t) => t.name).join(', ')}`;\n});"
   }
  },
  {
   "title": "INSERT: adding rows safely",
   "body": "`INSERT` adds a row:\n\n```sql\nINSERT INTO books (title, author, year, genre) VALUES ('Emma', 'Jane Austen', 1815, 'Romance');\n```\n\nList the columns, then the values in the same order. `id` and `status` are left out, so SQLite numbers the row and uses the default status.\n\n### Never build SQL by gluing strings\n\nIt's tempting to build the SQL with a template literal: `` `... VALUES ('${title}', ...)` ``. **Don't.** If a title contains a quote, like *Alice's Adventures*, the SQL breaks. Worse, if the text comes from a user, they can type SQL that runs on your database. That attack is called **SQL injection**, and it's one of the most common security holes on the web.\n\nUse `?` **placeholders** instead and pass the values separately. The database treats them as plain values, never as SQL:\n\n```js\ndb.run('INSERT INTO books (title, author, year, genre) VALUES (?, ?, ?, ?)', [b.title, b.author, b.year, b.genre]);\n```\n\n```svg Parameters keep values separate from the SQL: the query has question marks, the values travel in a separate list, and the database fills them in safely\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 160\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"160\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"20\" width=\"300\" height=\"44\" rx=\"8\" fill=\"#ffedd5\" stroke=\"#f97316\"/>\n  <text x=\"20\" y=\"47\" font-family=\"monospace\" font-size=\"12\">INSERT ... VALUES (?, ?, ?, ?)</text>\n  <rect x=\"10\" y=\"90\" width=\"300\" height=\"44\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/>\n  <text x=\"20\" y=\"117\" font-family=\"monospace\" font-size=\"12\">[\"Emma\", \"Jane Austen\", 1815, ...]</text>\n  <rect x=\"370\" y=\"45\" width=\"140\" height=\"64\" rx=\"10\" fill=\"#dbeafe\" stroke=\"#2563eb\"/>\n  <text x=\"440\" y=\"72\" text-anchor=\"middle\" font-weight=\"bold\">SQLite</text><text x=\"440\" y=\"92\" text-anchor=\"middle\">fills each ?</text>\n  <path d=\"M310 42 L366 66 M310 112 L366 90\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"20\" y=\"154\" fill=\"#6b7280\">The values are never read as SQL, so quotes and tricks in them can't break the query.</text>\n</svg>\n```\n\n### All or nothing: transactions\n\n`BEGIN` ... `COMMIT` wraps all the inserts in a **transaction**. If any insert fails (say a `CHECK` rule), `ROLLBACK` undoes all of them, so the library is never half-loaded. Transactions are also much faster for many inserts.",
   "checks": [
    {
     "pane": "js",
     "label": "an INSERT with ? parameters",
     "test": "/INSERT\\s+INTO\\s+books\\s*\\([^)]*\\)\\s*VALUES\\s*\\(\\s*\\?/i",
     "hint": "Use VALUES (?, ?, ?, ?, ?) and pass the values as a list"
    },
    {
     "pane": "js",
     "label": "the inserts run in a transaction",
     "test": "/BEGIN[\\s\\S]*COMMIT/",
     "hint": "Wrap the inserts in BEGIN ... COMMIT"
    },
    {
     "pane": "js",
     "label": "count the rows",
     "test": "/COUNT\\(\\*\\)/i",
     "hint": "SELECT COUNT(*) AS n FROM books"
    }
   ],
   "quiz": [
    {
     "q": "Why use `?` placeholders instead of putting values into the SQL text?",
     "options": [
      "They're shorter to type",
      "Values can't break or change the SQL, which prevents SQL injection",
      "SQLite requires them"
     ],
     "answer": 1,
     "why": "With placeholders the database knows exactly which parts are data, so a quote or typed SQL is just text."
    },
    {
     "q": "Inside `BEGIN ... COMMIT`, the 7th insert fails and the code runs `ROLLBACK`. How many books are saved?",
     "options": [
      "6",
      "0",
      "10"
     ],
     "answer": 1,
     "why": "A transaction is all or nothing: ROLLBACK undoes every change since BEGIN."
    }
   ],
   "session": 0,
   "minutes": 18,
   "js": {
    "data": "// Ten classic books (all published before 1900).\nconst BOOKS = [\n  { title: 'Pride and Prejudice', author: 'Jane Austen', year: 1813, genre: 'Romance', status: 'read' },\n  { title: 'Emma', author: 'Jane Austen', year: 1815, genre: 'Romance', status: 'want to read' },\n  { title: 'Frankenstein', author: 'Mary Shelley', year: 1818, genre: 'Horror', status: 'read' },\n  { title: 'Moby-Dick', author: 'Herman Melville', year: 1851, genre: 'Adventure', status: 'reading' },\n  { title: 'Little Women', author: 'Louisa May Alcott', year: 1868, genre: 'Drama', status: 'want to read' },\n  { title: 'The Adventures of Tom Sawyer', author: 'Mark Twain', year: 1876, genre: 'Adventure', status: 'read' },\n  { title: 'Adventures of Huckleberry Finn', author: 'Mark Twain', year: 1884, genre: 'Adventure', status: 'want to read' },\n  { title: 'The Time Machine', author: 'H. G. Wells', year: 1895, genre: 'Science fiction', status: 'reading' },\n  { title: 'Dracula', author: 'Bram Stoker', year: 1897, genre: 'Horror', status: 'want to read' },\n  { title: 'The War of the Worlds', author: 'H. G. Wells', year: 1898, genre: 'Science fiction', status: 'read' },\n];\n\n// Add every book in one transaction: all of them go in, or none do.\nfunction load() {\n  db.run('BEGIN');\n  try {\n    for (const b of BOOKS) {\n      db.run('INSERT INTO books (title, author, year, genre, status) VALUES (?, ?, ?, ?, ?)',\n        [b.title, b.author, b.year, b.genre, b.status]);\n    }\n    db.run('COMMIT');\n  } catch (err) {\n    db.run('ROLLBACK');\n    throw err;\n  }\n}",
    "go": "initSqlJs({ locateFile: (file) => SQLJS + file }).then((SQL) => {\n  db = new SQL.Database();\n  db.exec(SCHEMA);\n  load();\n  const [{ n }] = rows('SELECT COUNT(*) AS n FROM books');\n  status.textContent = `${n} books in the library`;\n});"
   }
  },
  {
   "title": "SELECT and WHERE",
   "body": "Now the real power of SQL: asking questions. `SELECT` picks columns, `FROM` names the table, and `WHERE` keeps only the rows that match:\n\n```sql\nSELECT title, author, year FROM books WHERE genre = 'Horror';\n```\n\n```svg How SELECT ... WHERE works: the database checks each row against the condition and returns only the matching rows, with only the chosen columns\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 170\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"170\" fill=\"#ffffff\"/>\n  <text x=\"10\" y=\"18\" font-weight=\"bold\">books (10 rows)</text>\n  <rect x=\"10\" y=\"26\" width=\"200\" height=\"22\" fill=\"#fff7ed\" stroke=\"#fdba74\"/><text x=\"16\" y=\"41\">Emma · Romance</text>\n  <rect x=\"10\" y=\"50\" width=\"200\" height=\"22\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"16\" y=\"65\">Frankenstein · Horror ✓</text>\n  <rect x=\"10\" y=\"74\" width=\"200\" height=\"22\" fill=\"#fff7ed\" stroke=\"#fdba74\"/><text x=\"16\" y=\"89\">Moby-Dick · Adventure</text>\n  <rect x=\"10\" y=\"98\" width=\"200\" height=\"22\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"16\" y=\"113\">Dracula · Horror ✓</text>\n  <text x=\"16\" y=\"138\" fill=\"#6b7280\">…</text>\n  <rect x=\"236\" y=\"60\" width=\"110\" height=\"44\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"291\" y=\"80\" text-anchor=\"middle\">WHERE genre</text><text x=\"291\" y=\"96\" text-anchor=\"middle\">= 'Horror'</text>\n  <path d=\"M212 82 H232 M346 82 H366\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"370\" y=\"56\" font-weight=\"bold\">result (2 rows)</text>\n  <rect x=\"370\" y=\"64\" width=\"140\" height=\"22\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"376\" y=\"79\">Frankenstein</text>\n  <rect x=\"370\" y=\"88\" width=\"140\" height=\"22\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"376\" y=\"103\">Dracula</text>\n</svg>\n```\n\n- `SELECT *` means every column; naming columns is clearer and faster.\n- Conditions use `=`, `<>` (not equal), `<`, `>`, `<=`, `>=`, and combine with `AND`, `OR` and `NOT`.\n- Text values go in single quotes in SQL, but in your code they go in as `?` parameters, as always.\n\n### The page\n\n`queries` holds the SQL in one object, `Q`, so all the questions the app asks are in one place. `showTable()` turns rows into an HTML table: the header comes from the first row's keys. A **genre menu** is built from `SELECT DISTINCT genre` (each genre once), and choosing one runs the `WHERE` query. The SQL is shown under the table so you can see exactly what ran.\n\n> Tip: in `showTable`, text from the database goes into `textContent`, not `innerHTML`, so a title can never inject HTML into the page.",
   "checks": [
    {
     "pane": "js",
     "label": "a query with WHERE and a parameter",
     "test": "/WHERE\\s+genre\\s*=\\s*\\?/i",
     "hint": "SELECT ... FROM books WHERE genre = ?"
    },
    {
     "pane": "js",
     "label": "each genre once, for the menu",
     "test": "/SELECT\\s+DISTINCT\\s+genre/i",
     "hint": "SELECT DISTINCT genre FROM books"
    },
    {
     "pane": "js",
     "label": "a function that draws the table",
     "test": "/function\\s+showTable\\s*\\(/",
     "hint": "Write function showTable(list) { ... }"
    }
   ],
   "quiz": [
    {
     "q": "Which query lists only the books published before 1850?",
     "options": [
      "`SELECT title FROM books ORDER BY 1850`",
      "`SELECT title FROM books WHERE year < 1850`",
      "`SELECT title < 1850 FROM books`"
     ],
     "answer": 1,
     "why": "`WHERE` filters rows by a condition; only rows where `year < 1850` is true come back."
    },
    {
     "q": "What does `SELECT DISTINCT genre FROM books` return?",
     "options": [
      "Each genre once, with no repeats",
      "Only the first book of each genre",
      "The number of genres"
     ],
     "answer": 0,
     "why": "`DISTINCT` removes duplicate rows from the result."
    }
   ],
   "session": 1,
   "minutes": 18,
   "js": {
    "queries": "// Every question the app asks, in one place. Values always go in as ? parameters.\nconst Q = {\n  all: 'SELECT title, author, year, genre, status FROM books',\n  byGenre: 'SELECT title, author, year, genre, status FROM books WHERE genre = ?',\n  genres: 'SELECT DISTINCT genre FROM books ORDER BY genre',\n};",
    "show": "// Draw a list of rows as an HTML table, and show the SQL that made it.\nfunction showTable(list, sql, params = []) {\n  table.replaceChildren();\n  lastSql.textContent = params.length ? `${sql}\\n-- parameters: ${JSON.stringify(params)}` : sql;\n  if (!list.length) {\n    status.textContent = 'No books match.';\n    return;\n  }\n  status.textContent = `${list.length} book${list.length === 1 ? '' : 's'}`;\n  const head = table.createTHead().insertRow();\n  for (const key of Object.keys(list[0])) {\n    const th = document.createElement('th');\n    th.textContent = key;\n    head.append(th);\n  }\n  const body = table.createTBody();\n  for (const row of list) {\n    const tr = body.insertRow();\n    for (const value of Object.values(row)) tr.insertCell().textContent = value;\n  }\n}",
    "controls": "function buildControls() {\n  const genre = document.createElement('select');\n  genre.id = 'genre';\n  genre.add(new Option('Every genre', ''));\n  for (const g of rows(Q.genres)) genre.add(new Option(g.genre, g.genre));\n  controls.append(genre);\n  genre.addEventListener('change', refresh);\n}\n\nfunction refresh() {\n  const g = document.getElementById('genre').value;\n  if (g) showTable(rows(Q.byGenre, [g]), Q.byGenre, [g]);\n  else showTable(rows(Q.all), Q.all);\n}",
    "go": "initSqlJs({ locateFile: (file) => SQLJS + file }).then((SQL) => {\n  db = new SQL.Database();\n  db.exec(SCHEMA);\n  load();\n  buildControls();\n  refresh();\n});"
   }
  },
  {
   "title": "ORDER BY and LIKE: sorting and searching",
   "body": "Two more parts of a query:\n\n- **`ORDER BY year`** sorts the results (smallest first). Add `DESC` for largest first: `ORDER BY year DESC`. Without `ORDER BY`, SQL promises no order at all.\n- **`LIKE`** matches text with a pattern. `%` means \"any characters\", so `title LIKE '%time%'` finds any title containing \"time\". In SQLite, `LIKE` ignores upper and lower case for English letters.\n\n```sql\nSELECT title, author FROM books\nWHERE title LIKE ? OR author LIKE ?\nORDER BY year;\n```\n\nThe order of the parts is fixed: `SELECT` → `FROM` → `WHERE` → `ORDER BY`.\n\n### One query for every combination\n\nInstead of four queries (with or without a genre, with or without a search), one query handles all of them:\n\n```sql\nWHERE (? = '' OR genre = ?) AND (title LIKE ? OR author LIKE ?)\n```\n\nIf the genre parameter is empty, `? = ''` is true and the genre test is skipped. If the search box is empty, the pattern is `%%`, which matches everything. A **sort menu** chooses between two queries, because column names can't be `?` parameters (only values can).",
   "checks": [
    {
     "pane": "js",
     "label": "search with LIKE and parameters",
     "test": "/LIKE\\s+\\?/i",
     "hint": "WHERE title LIKE ? OR author LIKE ?"
    },
    {
     "pane": "js",
     "label": "results are sorted",
     "test": "/ORDER\\s+BY\\s+year/i",
     "hint": "Add ORDER BY year"
    },
    {
     "pane": "js",
     "label": "a search box",
     "test": "/createElement\\(\\s*['\"]input['\"]\\s*\\)/",
     "hint": "Make an <input type=\"search\"> in buildControls()"
    }
   ],
   "quiz": [
    {
     "q": "Which pattern finds every title that *starts* with \"The\"?",
     "options": [
      "`'%The%'`",
      "`'The%'`",
      "`'%The'`"
     ],
     "answer": 1,
     "why": "`%` stands for any characters; with nothing before \"The\", the title must start with it."
    },
    {
     "q": "Why can't the sort column be a `?` parameter?",
     "options": [
      "Parameters are only for numbers",
      "Parameters can only stand for values, not for names like columns or tables",
      "ORDER BY doesn't work with parameters in any database"
     ],
     "answer": 1,
     "why": "That's the same reason parameters are safe: they're always treated as data. Choose between fixed queries for different columns."
    }
   ],
   "session": 1,
   "minutes": 15,
   "js": {
    "queries": "// Every question the app asks, in one place. Values always go in as ? parameters.\nconst FILTER = `FROM books\nWHERE (? = '' OR genre = ?)\n  AND (title LIKE ? OR author LIKE ?)`;\n\nconst Q = {\n  oldest: `SELECT title, author, year, genre, status ${FILTER}\\nORDER BY year`,\n  title: `SELECT title, author, year, genre, status ${FILTER}\\nORDER BY title`,\n  genres: 'SELECT DISTINCT genre FROM books ORDER BY genre',\n};",
    "controls": "function buildControls() {\n  const search = document.createElement('input');\n  search.type = 'search';\n  search.id = 'search';\n  search.placeholder = 'Search titles and authors';\n  search.setAttribute('aria-label', 'Search titles and authors');\n\n  const genre = document.createElement('select');\n  genre.id = 'genre';\n  genre.setAttribute('aria-label', 'Genre');\n  genre.add(new Option('Every genre', ''));\n  for (const g of rows(Q.genres)) genre.add(new Option(g.genre, g.genre));\n\n  const sort = document.createElement('select');\n  sort.id = 'sort';\n  sort.setAttribute('aria-label', 'Sort by');\n  sort.add(new Option('Oldest first', 'oldest'));\n  sort.add(new Option('Title A–Z', 'title'));\n\n  controls.append(search, genre, sort);\n  search.addEventListener('input', refresh);\n  genre.addEventListener('change', refresh);\n  sort.addEventListener('change', refresh);\n}\n\nfunction refresh() {\n  const g = document.getElementById('genre').value;\n  const pattern = `%${document.getElementById('search').value.trim()}%`;\n  const sql = Q[document.getElementById('sort').value];\n  const params = [g, g, pattern, pattern];\n  showTable(rows(sql, params), sql, params);\n}"
   }
  },
  {
   "title": "COUNT and GROUP BY: summaries",
   "body": "Databases don't just find rows; they **summarize** them. **Aggregate functions** turn many rows into one value:\n\n| Function | Gives |\n|---|---|\n| `COUNT(*)` | How many rows |\n| `SUM(x)` | The total of a column |\n| `AVG(x)` | The average |\n| `MIN(x)` / `MAX(x)` | The smallest / largest |\n\n`GROUP BY` splits the rows into groups first, then runs the aggregate once per group:\n\n```sql\nSELECT genre, COUNT(*) AS books FROM books GROUP BY genre ORDER BY books DESC;\n```\n\nThat's one row per genre with its count, biggest first. `AS books` names the result column so the code can read `row.books`.\n\n```svg GROUP BY puts rows with the same value in a pile, then COUNT counts each pile\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"150\" fill=\"#ffffff\"/>\n  <rect x=\"20\" y=\"20\" width=\"110\" height=\"24\" fill=\"#fde68a\"/><text x=\"28\" y=\"36\">Adventure</text>\n  <rect x=\"20\" y=\"48\" width=\"110\" height=\"24\" fill=\"#fde68a\"/><text x=\"28\" y=\"64\">Adventure</text>\n  <rect x=\"20\" y=\"76\" width=\"110\" height=\"24\" fill=\"#fde68a\"/><text x=\"28\" y=\"92\">Adventure</text>\n  <rect x=\"150\" y=\"20\" width=\"110\" height=\"24\" fill=\"#fecaca\"/><text x=\"158\" y=\"36\">Horror</text>\n  <rect x=\"150\" y=\"48\" width=\"110\" height=\"24\" fill=\"#fecaca\"/><text x=\"158\" y=\"64\">Horror</text>\n  <rect x=\"280\" y=\"20\" width=\"110\" height=\"24\" fill=\"#bfdbfe\"/><text x=\"288\" y=\"36\">Romance</text>\n  <rect x=\"280\" y=\"48\" width=\"110\" height=\"24\" fill=\"#bfdbfe\"/><text x=\"288\" y=\"64\">Romance</text>\n  <text x=\"75\" y=\"124\" text-anchor=\"middle\" font-weight=\"bold\">COUNT = 3</text>\n  <text x=\"205\" y=\"124\" text-anchor=\"middle\" font-weight=\"bold\">COUNT = 2</text>\n  <text x=\"335\" y=\"124\" text-anchor=\"middle\" font-weight=\"bold\">COUNT = 2</text>\n  <text x=\"410\" y=\"70\" fill=\"#6b7280\">one result row</text><text x=\"410\" y=\"86\" fill=\"#6b7280\">per group</text>\n</svg>\n```\n\nThe page shows the counts by status as little badges above the table. `stats` uses one query with `GROUP BY status`, and it's re-run whenever the list refreshes.",
   "checks": [
    {
     "pane": "js",
     "label": "a GROUP BY query",
     "test": "/GROUP\\s+BY\\s+status/i",
     "hint": "SELECT status, COUNT(*) AS n FROM books GROUP BY status"
    },
    {
     "pane": "js",
     "label": "the counts appear on the page",
     "test": "/function\\s+showStats\\s*\\(/",
     "hint": "Write function showStats() { ... }"
    }
   ],
   "quiz": [
    {
     "q": "What does `SELECT genre, COUNT(*) FROM books GROUP BY genre` return?",
     "options": [
      "Every book with its genre",
      "One row per genre with how many books it has",
      "The total number of books"
     ],
     "answer": 1,
     "why": "GROUP BY makes one group per genre, and COUNT(*) counts the rows in each group."
    },
    {
     "q": "Which function gives the newest book's year?",
     "options": [
      "`COUNT(year)`",
      "`MIN(year)`",
      "`MAX(year)`"
     ],
     "answer": 2,
     "why": "MAX returns the largest value in the column, which is the most recent year."
    }
   ],
   "session": 1,
   "minutes": 15,
   "js": {
    "queries": "// Every question the app asks, in one place. Values always go in as ? parameters.\nconst FILTER = `FROM books\nWHERE (? = '' OR genre = ?)\n  AND (title LIKE ? OR author LIKE ?)`;\n\nconst Q = {\n  oldest: `SELECT title, author, year, genre, status ${FILTER}\\nORDER BY year`,\n  title: `SELECT title, author, year, genre, status ${FILTER}\\nORDER BY title`,\n  genres: 'SELECT DISTINCT genre FROM books ORDER BY genre',\n  byStatus: 'SELECT status, COUNT(*) AS n FROM books GROUP BY status ORDER BY n DESC',\n  summary: 'SELECT COUNT(*) AS books, MIN(year) AS oldest, MAX(year) AS newest FROM books',\n};\n\n// The badges above the table: totals for the whole library.\nfunction showStats() {\n  const [s] = rows(Q.summary);\n  const badges = [`${s.books} books`, `${s.oldest}–${s.newest}`, ...rows(Q.byStatus).map((r) => `${r.n} ${r.status}`)];\n  stats.replaceChildren(...badges.map((text) => Object.assign(document.createElement('span'), { className: 'stat', textContent: text })));\n}",
    "go": "initSqlJs({ locateFile: (file) => SQLJS + file }).then((SQL) => {\n  db = new SQL.Database();\n  db.exec(SCHEMA);\n  load();\n  buildControls();\n  showStats();\n  refresh();\n});"
   }
  },
  {
   "title": "JOIN: authors get their own table",
   "body": "Look at the data: \"Jane Austen\", \"Mark Twain\" and \"H. G. Wells\" are each typed twice. If you misspell one, the database thinks it's a different author. And where would you keep an author's country or birth year? Not on every book.\n\nThe fix is a second table. Each author is stored **once**, and each book points to its author by id. That id column is a **foreign key**:\n\n```svg Two tables linked by a foreign key: each book's author_id holds the id of one row in authors; a JOIN puts them back together\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 190\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"190\" fill=\"#ffffff\"/>\n  <text x=\"10\" y=\"18\" font-weight=\"bold\">authors</text>\n  <rect x=\"10\" y=\"26\" width=\"190\" height=\"22\" fill=\"#fed7aa\"/><text x=\"16\" y=\"41\" font-weight=\"bold\">id   name          country</text>\n  <rect x=\"10\" y=\"48\" width=\"190\" height=\"22\" fill=\"#fff7ed\" stroke=\"#fdba74\"/><text x=\"16\" y=\"63\">1    Jane Austen    England</text>\n  <rect x=\"10\" y=\"70\" width=\"190\" height=\"22\" fill=\"#fff7ed\" stroke=\"#fdba74\"/><text x=\"16\" y=\"85\">2    Mary Shelley   England</text>\n  <text x=\"290\" y=\"18\" font-weight=\"bold\">books</text>\n  <rect x=\"290\" y=\"26\" width=\"220\" height=\"22\" fill=\"#fed7aa\"/><text x=\"296\" y=\"41\" font-weight=\"bold\">id   title                  author_id</text>\n  <rect x=\"290\" y=\"48\" width=\"220\" height=\"22\" fill=\"#fff7ed\" stroke=\"#fdba74\"/><text x=\"296\" y=\"63\">1    Pride and Prejudice    1</text>\n  <rect x=\"290\" y=\"70\" width=\"220\" height=\"22\" fill=\"#fff7ed\" stroke=\"#fdba74\"/><text x=\"296\" y=\"85\">2    Emma                   1</text>\n  <rect x=\"290\" y=\"92\" width=\"220\" height=\"22\" fill=\"#fff7ed\" stroke=\"#fdba74\"/><text x=\"296\" y=\"107\">3    Frankenstein           2</text>\n  <path d=\"M490 59 C 450 59, 240 59, 200 59\" fill=\"none\" stroke=\"#2563eb\" stroke-width=\"2\"/>\n  <path d=\"M490 81 C 450 81, 260 66, 200 61\" fill=\"none\" stroke=\"#2563eb\" stroke-width=\"2\"/>\n  <path d=\"M490 103 C 440 103, 260 90, 200 81\" fill=\"none\" stroke=\"#16a34a\" stroke-width=\"2\"/>\n  <text x=\"10\" y=\"140\" fill=\"#374151\">SELECT books.title, authors.name AS author</text>\n  <text x=\"10\" y=\"158\" fill=\"#374151\">FROM books JOIN authors ON authors.id = books.author_id</text>\n  <text x=\"10\" y=\"180\" fill=\"#6b7280\">Each author is stored once; the JOIN matches author_id to authors.id.</text>\n</svg>\n```\n\n```sql\nauthor_id INTEGER NOT NULL REFERENCES authors(id)\n```\n\n`REFERENCES authors(id)` tells the database this column must hold a real author's id. With `PRAGMA foreign_keys = ON`, SQLite refuses a book whose author doesn't exist.\n\n### JOIN\n\nA **JOIN** puts the two tables back together for a query. `ON authors.id = books.author_id` says how rows match. When two tables share column names (both have `id`), write `table.column` to be clear.\n\n### Loading two tables\n\n`load()` now inserts each author first. `INSERT OR IGNORE` skips an author who's already there, because `name` is `UNIQUE`. Then each book finds its author's id with a **subquery**, a `SELECT` inside the `INSERT`: `(SELECT id FROM authors WHERE name = ?)`.\n\nThe queries change only in their `FROM` part, and the page shows the same columns, plus the author's country. A new badge shows books per author, using `GROUP BY` on the joined tables.",
   "checks": [
    {
     "pane": "js",
     "label": "an authors table",
     "test": "/CREATE\\s+TABLE\\s+authors\\s*\\(/i",
     "hint": "Add CREATE TABLE authors ( ... )"
    },
    {
     "pane": "js",
     "label": "books point to authors with a foreign key",
     "test": "/author_id\\s+INTEGER[^,]*REFERENCES\\s+authors\\s*\\(\\s*id\\s*\\)/i",
     "hint": "author_id INTEGER NOT NULL REFERENCES authors(id)"
    },
    {
     "pane": "js",
     "label": "queries JOIN the two tables",
     "test": "/JOIN\\s+authors\\s+ON/i",
     "hint": "FROM books JOIN authors ON authors.id = books.author_id"
    }
   ],
   "quiz": [
    {
     "q": "What is a foreign key?",
     "options": [
      "A password for the database",
      "A column that holds the id of a row in another table",
      "A key that only works abroad"
     ],
     "answer": 1,
     "why": "`author_id` points at a row in `authors`, linking the two tables."
    },
    {
     "q": "Why store authors in their own table?",
     "options": [
      "Each author is stored once, so a name can't be spelled two ways and author facts live in one place",
      "SQL can't store two text columns in one table",
      "It makes every query shorter"
     ],
     "answer": 0,
     "why": "Storing each fact once (normalizing) keeps data consistent; JOIN brings it back together when needed."
    }
   ],
   "session": 2,
   "minutes": 20,
   "js": {
    "schema": "const SCHEMA = `\nCREATE TABLE authors (\n  id      INTEGER PRIMARY KEY,\n  name    TEXT NOT NULL UNIQUE,\n  country TEXT NOT NULL\n);\n\nCREATE TABLE books (\n  id        INTEGER PRIMARY KEY,\n  title     TEXT NOT NULL,\n  author_id INTEGER NOT NULL REFERENCES authors(id),\n  year      INTEGER NOT NULL,\n  genre     TEXT NOT NULL,\n  status    TEXT NOT NULL DEFAULT 'want to read'\n            CHECK (status IN ('want to read', 'reading', 'read'))\n);\n`;",
    "data": "// Where each author is from.\nconst COUNTRIES = {\n  'Jane Austen': 'England', 'Mary Shelley': 'England', 'Herman Melville': 'United States',\n  'Louisa May Alcott': 'United States', 'Mark Twain': 'United States', 'H. G. Wells': 'England',\n  'Bram Stoker': 'Ireland',\n};\n\n// Ten classic books (all published before 1900).\nconst BOOKS = [\n  { title: 'Pride and Prejudice', author: 'Jane Austen', year: 1813, genre: 'Romance', status: 'read' },\n  { title: 'Emma', author: 'Jane Austen', year: 1815, genre: 'Romance', status: 'want to read' },\n  { title: 'Frankenstein', author: 'Mary Shelley', year: 1818, genre: 'Horror', status: 'read' },\n  { title: 'Moby-Dick', author: 'Herman Melville', year: 1851, genre: 'Adventure', status: 'reading' },\n  { title: 'Little Women', author: 'Louisa May Alcott', year: 1868, genre: 'Drama', status: 'want to read' },\n  { title: 'The Adventures of Tom Sawyer', author: 'Mark Twain', year: 1876, genre: 'Adventure', status: 'read' },\n  { title: 'Adventures of Huckleberry Finn', author: 'Mark Twain', year: 1884, genre: 'Adventure', status: 'want to read' },\n  { title: 'The Time Machine', author: 'H. G. Wells', year: 1895, genre: 'Science fiction', status: 'reading' },\n  { title: 'Dracula', author: 'Bram Stoker', year: 1897, genre: 'Horror', status: 'want to read' },\n  { title: 'The War of the Worlds', author: 'H. G. Wells', year: 1898, genre: 'Science fiction', status: 'read' },\n];\n\n// Add every author once, then every book pointing at its author, in one transaction.\nfunction load() {\n  db.run('PRAGMA foreign_keys = ON');\n  db.run('BEGIN');\n  try {\n    for (const b of BOOKS) {\n      db.run('INSERT OR IGNORE INTO authors (name, country) VALUES (?, ?)', [b.author, COUNTRIES[b.author]]);\n      db.run(`INSERT INTO books (title, author_id, year, genre, status)\n              VALUES (?, (SELECT id FROM authors WHERE name = ?), ?, ?, ?)`,\n        [b.title, b.author, b.year, b.genre, b.status]);\n    }\n    db.run('COMMIT');\n  } catch (err) {\n    db.run('ROLLBACK');\n    throw err;\n  }\n}",
    "queries": "// Every question the app asks, in one place. Values always go in as ? parameters.\nconst FILTER = `FROM books\nJOIN authors ON authors.id = books.author_id\nWHERE (? = '' OR books.genre = ?)\n  AND (books.title LIKE ? OR authors.name LIKE ?)`;\n\nconst COLUMNS = 'books.title, authors.name AS author, authors.country, books.year, books.genre, books.status';\n\nconst Q = {\n  oldest: `SELECT ${COLUMNS} ${FILTER}\\nORDER BY books.year`,\n  title: `SELECT ${COLUMNS} ${FILTER}\\nORDER BY books.title`,\n  genres: 'SELECT DISTINCT genre FROM books ORDER BY genre',\n  byStatus: 'SELECT status, COUNT(*) AS n FROM books GROUP BY status ORDER BY n DESC',\n  summary: 'SELECT COUNT(*) AS books, MIN(year) AS oldest, MAX(year) AS newest FROM books',\n  topAuthor: `SELECT authors.name, COUNT(*) AS n\nFROM books JOIN authors ON authors.id = books.author_id\nGROUP BY authors.id ORDER BY n DESC, authors.name LIMIT 1`,\n};\n\n// The badges above the table: totals for the whole library.\nfunction showStats() {\n  const [s] = rows(Q.summary);\n  const [top] = rows(Q.topAuthor);\n  const badges = [`${s.books} books`, `${s.oldest}–${s.newest}`, ...rows(Q.byStatus).map((r) => `${r.n} ${r.status}`),\n    `Most books: ${top.name} (${top.n})`];\n  stats.replaceChildren(...badges.map((text) => Object.assign(document.createElement('span'), { className: 'stat', textContent: text })));\n}"
   }
  },
  {
   "title": "Publish it, and what's next",
   "body": "Publish the library like your other projects: a `sql-library` folder with `index.html` (this guide's HTML in the `<body>`, ending with `<script src=\"script.js\"></script>`), `style.css` and `script.js`, copied from the last code step. Commit, push to a public GitHub repository and turn on Pages. The finished project is at [github.com/TheoYanvno/sql-library](https://github.com/TheoYanvno/sql-library).\n\n### The SQL you know now\n\n| Statement | Does |\n|---|---|\n| `CREATE TABLE` | Describes a table: columns, types, rules |\n| `INSERT INTO ... VALUES (?, ...)` | Adds rows safely |\n| `SELECT ... FROM ... WHERE ... ORDER BY` | Finds and sorts rows |\n| `LIKE '%text%'` | Matches text patterns |\n| `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` with `GROUP BY` | Summarizes groups |\n| `JOIN ... ON` | Combines related tables |\n\nTwo you'll meet next: `UPDATE books SET status = ? WHERE id = ?` changes rows, and `DELETE FROM books WHERE id = ?` removes them. **Always include the WHERE**: without it, `UPDATE` and `DELETE` change every row in the table.\n\n### Practice outside the browser\n\nInstall **DB Browser for SQLite** ([sqlitebrowser.org](https://sqlitebrowser.org/)) to open `.db` files and run queries with a spreadsheet-like view. Python includes SQLite too: `import sqlite3`.\n\n### Next\n\nThe **Marvel Character Database** guide uses everything here, and adds many-to-many relationships (characters who appear in many movies), `LEFT JOIN` and reports.",
   "quiz": [
    {
     "q": "What happens if you run `DELETE FROM books` with no WHERE?",
     "options": [
      "Nothing, SQL asks you to confirm",
      "Every row in books is deleted",
      "Only the last row is deleted"
     ],
     "answer": 1,
     "why": "Without WHERE the statement applies to the whole table. Always write the WHERE first."
    }
   ],
   "session": 2,
   "kind": "read",
   "minutes": 12
  }
 ],
 "finish": "You built a page backed by a real SQL database. You learned:\n\n- **Tables, rows and columns**, types, `PRIMARY KEY`, `NOT NULL`, `DEFAULT` and `CHECK`\n- **INSERT** with `?` parameters (and why gluing SQL strings is dangerous)\n- **Transactions**: `BEGIN`, `COMMIT`, `ROLLBACK`\n- **SELECT** with `WHERE`, `DISTINCT`, `ORDER BY` and `LIKE`\n- **Aggregates** with `GROUP BY`\n- **Foreign keys** and **JOIN**\n\n### Challenges\n\n1. Add a status menu next to the genre menu, filtering with `books.status = ?`.\n2. Add a button on each row that marks a book read with `UPDATE books SET status = 'read' WHERE title = ?`, then refresh.\n3. Add a \"Books per country\" badge with `GROUP BY authors.country`."
};
