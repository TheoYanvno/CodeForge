---
id: sql
title: SQL basics: a book library
blocks-html: page
blocks-css: base
blocks-js: setup, schema, data, queries, show, controls, go
goals: Explain what a database, a table, a row and a column are; Create tables with CREATE TABLE, types and NOT NULL; Add rows safely with INSERT and ? parameters; Ask questions with SELECT, WHERE, ORDER BY and LIKE; Summarize data with COUNT and GROUP BY; Connect two tables with a foreign key and a JOIN
prereqs: The JavaScript basics guide (functions, events, arrays)
---

## Session: Tables and rows

## Step: A real database inside the page
time: 15

Almost every app keeps its data in a **database**: shops keep products and orders, a clinic keeps patients and appointments, a social network keeps posts. **SQL** (Structured Query Language, said "S-Q-L" or "sequel") is the language for talking to most of them. You write a sentence like `SELECT title FROM books WHERE year < 1850`, and the database finds the answer.

In this guide you'll build a **book library**: a page backed by a real SQL database, where you can filter books by genre, search titles and authors, and see counts. It's the warm-up for the Marvel Character Database guide, which uses the same tools on 214 characters. The finished project is at [github.com/TheoYanvno/sql-library](https://github.com/TheoYanvno/sql-library).

### Tables, rows and columns

A database holds **tables**. A table looks like a spreadsheet: each **row** is one thing (one book), and each **column** is one fact about it (its title, author, year).

```svg A table is like a spreadsheet: each row is one book and each column is one fact about it
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 190" font-family="sans-serif" font-size="13">
  <rect width="520" height="190" fill="#ffffff"/>
  <text x="20" y="22" font-weight="bold" fill="#7c2d12">table: books</text>
  <rect x="20" y="32" width="480" height="30" fill="#fed7aa"/>
  <text x="30" y="52" font-weight="bold">id</text><text x="70" y="52" font-weight="bold">title</text><text x="250" y="52" font-weight="bold">author</text><text x="390" y="52" font-weight="bold">year</text><text x="440" y="52" font-weight="bold">genre</text>
  <rect x="20" y="62" width="480" height="30" fill="#fff7ed" stroke="#fdba74"/>
  <text x="30" y="82">1</text><text x="70" y="82">Pride and Prejudice</text><text x="250" y="82">Jane Austen</text><text x="390" y="82">1813</text><text x="440" y="82">Romance</text>
  <rect x="20" y="92" width="480" height="30" fill="#ffffff" stroke="#fdba74"/>
  <text x="30" y="112">2</text><text x="70" y="112">Frankenstein</text><text x="250" y="112">Mary Shelley</text><text x="390" y="112">1818</text><text x="440" y="112">Horror</text>
  <path d="M10 77 H18" stroke="#16a34a" stroke-width="3"/><text x="20" y="150" fill="#16a34a">← each row is one book</text>
  <path d="M265 32 V20" stroke="#2563eb" stroke-width="3"/><text x="280" y="150" fill="#2563eb">each column is one fact ↑</text>
  <text x="20" y="176" fill="#6b7280">id is the primary key: a number that's different for every row.</text>
</svg>
```

### SQLite in the browser

Big databases like PostgreSQL run on a server. **SQLite** is a whole database in one small library, used inside phones, browsers and apps. **sql.js** is SQLite compiled to run in a web page, so you can practice real SQL with nothing to install. It loads from a CDN (a fast public file server) with one `<script>` tag.

### What the code does

- `initSqlJs()` downloads the database engine. It returns a **promise** (a value that arrives later), and `.then()` runs your code once it's ready.
- `new SQL.Database()` makes an empty database in memory.
- `rows(sql)` is a small helper that runs a query and returns the results as plain objects, like `[{ greeting: 'Hello, SQL!' }]`.
- `SELECT 'Hello, SQL!' AS greeting` is the simplest query: it asks for a value and names the column `greeting`.

check: html | load sql.js from the CDN | /sql-wasm\.js/ | Add <script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
check: js | start the database engine | /initSqlJs\(/ | Call initSqlJs({ locateFile: ... }).then(...)
check: js | a helper that runs a query | /function\s+rows\s*\(/ | Write function rows(sql, params = []) { ... }

quiz: In a table of books, what is one row?
- [x] One book, with all its facts
- [ ] One fact (like the year) for every book
- [ ] The whole table
why: Rows are records (one book each); columns are the facts every record has.

quiz: What does `initSqlJs()` return?
- [ ] The database, right away
- [x] A promise: the engine arrives later, and `.then()` runs when it's ready
- [ ] An error
why: Downloading the engine takes a moment, so the code that needs it goes inside `.then()`.

```html page
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
<main class="library">
  <h1>📚 Book Library</h1>
  <p id="status" class="muted">Loading the database…</p>
  <div id="controls" class="controls"></div>
  <div id="stats" class="stats"></div>
  <div class="table-wrap"><table id="results"></table></div>
  <details class="sql-box">
    <summary>The SQL behind this view</summary>
    <pre id="lastSql"></pre>
  </details>
</main>
```

```css base
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #fff7ed;
  color: #431407;
}

.library {
  max-width: 820px;
  margin: 0 auto;
  padding: 16px;
}

.muted { color: #9a3412; }

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.controls input, .controls select {
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #fdba74;
  border-radius: 8px;
  background: #ffffff;
}

.controls input { flex: 1; min-width: 180px; }

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.stat {
  padding: 6px 10px;
  border-radius: 999px;
  background: #ffedd5;
  font-size: .9rem;
}

.table-wrap { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}

th, td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid #fed7aa;
}

th { background: #fed7aa; }

.sql-box { margin-top: 16px; }

.sql-box pre {
  white-space: pre-wrap;
  padding: 12px;
  background: #431407;
  color: #ffedd5;
  border-radius: 8px;
}
```

```js setup
// sql.js: SQLite compiled to WebAssembly, a real SQL database running inside the page.
const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
let db;

const status = document.getElementById('status');
const table = document.getElementById('results');
const stats = document.getElementById('stats');
const controls = document.getElementById('controls');
const lastSql = document.getElementById('lastSql');

// Run a query (with ? parameters) and return the rows as plain objects.
function rows(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const out = [];
  while (stmt.step()) out.push(stmt.getAsObject());
  stmt.free();
  return out;
}
```

```js go
initSqlJs({ locateFile: (file) => SQLJS + file }).then((SQL) => {
  db = new SQL.Database();
  const [first] = rows("SELECT 'Hello, SQL!' AS greeting");
  status.textContent = first.greeting;
});
```

## Step: CREATE TABLE: columns and types
time: 15

Before a database stores anything, you describe the table: its name, its columns, and what kind of value each column holds. That's `CREATE TABLE`:

```sql
CREATE TABLE books (
  id     INTEGER PRIMARY KEY,
  title  TEXT NOT NULL,
  author TEXT NOT NULL,
  year   INTEGER NOT NULL,
  genre  TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'want to read'
);
```

### Types and rules

| Part | Means |
|---|---|
| `INTEGER` | A whole number |
| `TEXT` | Words |
| `REAL` | A decimal number |
| `PRIMARY KEY` | This column identifies each row. In SQLite an `INTEGER PRIMARY KEY` numbers rows 1, 2, 3… automatically |
| `NOT NULL` | Every row must have a value here (`NULL` means "no value") |
| `DEFAULT 'want to read'` | The value used when you don't give one |
| `CHECK (...)` | A rule every row must pass |

The `CHECK` on `status` means the database refuses anything except the three statuses. Rules in the database protect the data no matter what code writes to it, which is why databases are trusted to keep data correct.

SQL keywords are usually written in CAPITALS so they stand out from your names (`books`, `title`), but SQL doesn't care about case. Each statement ends with `;`.

`db.exec(SCHEMA)` runs the SQL. Then `SELECT name FROM sqlite_master` asks SQLite which tables exist, to prove it worked.

check: js | a books table | /CREATE\s+TABLE\s+books\s*\(/i | Write CREATE TABLE books ( ... )
check: js | an id primary key | /id\s+INTEGER\s+PRIMARY\s+KEY/i | Add id INTEGER PRIMARY KEY
check: js | required columns | /NOT\s+NULL/i | Add NOT NULL to the columns every book must have
check: js | the table is created | /db\.exec\(\s*SCHEMA\s*\)/ | Run db.exec(SCHEMA)

quiz: What does `NOT NULL` on a column mean?
- [ ] The column can't be zero
- [x] Every row must have a value in that column
- [ ] The column is hidden
why: `NULL` means "no value". `NOT NULL` makes the database refuse a row without one.

quiz: Why put rules like `CHECK` in the database instead of only in JavaScript?
- [x] The database enforces them for every program that writes to it, so bad data can't get in
- [ ] JavaScript can't check values
- [ ] It makes the page faster
why: Code changes and has bugs; a rule in the table always holds.

```js schema
const SCHEMA = `
CREATE TABLE books (
  id     INTEGER PRIMARY KEY,
  title  TEXT NOT NULL,
  author TEXT NOT NULL,
  year   INTEGER NOT NULL,
  genre  TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'want to read'
         CHECK (status IN ('want to read', 'reading', 'read'))
);
`;
```

```js go
initSqlJs({ locateFile: (file) => SQLJS + file }).then((SQL) => {
  db = new SQL.Database();
  db.exec(SCHEMA);
  const tables = rows("SELECT name FROM sqlite_master WHERE type = 'table'");
  status.textContent = `Tables: ${tables.map((t) => t.name).join(', ')}`;
});
```

## Step: INSERT: adding rows safely
time: 18

`INSERT` adds a row:

```sql
INSERT INTO books (title, author, year, genre) VALUES ('Emma', 'Jane Austen', 1815, 'Romance');
```

List the columns, then the values in the same order. `id` and `status` are left out, so SQLite numbers the row and uses the default status.

### Never build SQL by gluing strings

It's tempting to build the SQL with a template literal: `` `... VALUES ('${title}', ...)` ``. **Don't.** If a title contains a quote, like *Alice's Adventures*, the SQL breaks. Worse, if the text comes from a user, they can type SQL that runs on your database. That attack is called **SQL injection**, and it's one of the most common security holes on the web.

Use `?` **placeholders** instead and pass the values separately. The database treats them as plain values, never as SQL:

```js
db.run('INSERT INTO books (title, author, year, genre) VALUES (?, ?, ?, ?)', [b.title, b.author, b.year, b.genre]);
```

```svg Parameters keep values separate from the SQL: the query has question marks, the values travel in a separate list, and the database fills them in safely
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 160" font-family="sans-serif" font-size="13">
  <rect width="520" height="160" fill="#ffffff"/>
  <rect x="10" y="20" width="300" height="44" rx="8" fill="#ffedd5" stroke="#f97316"/>
  <text x="20" y="47" font-family="monospace" font-size="12">INSERT ... VALUES (?, ?, ?, ?)</text>
  <rect x="10" y="90" width="300" height="44" rx="8" fill="#dcfce7" stroke="#16a34a"/>
  <text x="20" y="117" font-family="monospace" font-size="12">["Emma", "Jane Austen", 1815, ...]</text>
  <rect x="370" y="45" width="140" height="64" rx="10" fill="#dbeafe" stroke="#2563eb"/>
  <text x="440" y="72" text-anchor="middle" font-weight="bold">SQLite</text><text x="440" y="92" text-anchor="middle">fills each ?</text>
  <path d="M310 42 L366 66 M310 112 L366 90" stroke="#374151" stroke-width="2"/>
  <text x="20" y="154" fill="#6b7280">The values are never read as SQL, so quotes and tricks in them can't break the query.</text>
</svg>
```

### All or nothing: transactions

`BEGIN` ... `COMMIT` wraps all the inserts in a **transaction**. If any insert fails (say a `CHECK` rule), `ROLLBACK` undoes all of them, so the library is never half-loaded. Transactions are also much faster for many inserts.

check: js | an INSERT with ? parameters | /INSERT\s+INTO\s+books\s*\([^)]*\)\s*VALUES\s*\(\s*\?/i | Use VALUES (?, ?, ?, ?, ?) and pass the values as a list
check: js | the inserts run in a transaction | /BEGIN[\s\S]*COMMIT/ | Wrap the inserts in BEGIN ... COMMIT
check: js | count the rows | /COUNT\(\*\)/i | SELECT COUNT(*) AS n FROM books

quiz: Why use `?` placeholders instead of putting values into the SQL text?
- [ ] They're shorter to type
- [x] Values can't break or change the SQL, which prevents SQL injection
- [ ] SQLite requires them
why: With placeholders the database knows exactly which parts are data, so a quote or typed SQL is just text.

quiz: Inside `BEGIN ... COMMIT`, the 7th insert fails and the code runs `ROLLBACK`. How many books are saved?
- [ ] 6
- [x] 0
- [ ] 10
why: A transaction is all or nothing: ROLLBACK undoes every change since BEGIN.

```js data
// Ten classic books (all published before 1900).
const BOOKS = [
  { title: 'Pride and Prejudice', author: 'Jane Austen', year: 1813, genre: 'Romance', status: 'read' },
  { title: 'Emma', author: 'Jane Austen', year: 1815, genre: 'Romance', status: 'want to read' },
  { title: 'Frankenstein', author: 'Mary Shelley', year: 1818, genre: 'Horror', status: 'read' },
  { title: 'Moby-Dick', author: 'Herman Melville', year: 1851, genre: 'Adventure', status: 'reading' },
  { title: 'Little Women', author: 'Louisa May Alcott', year: 1868, genre: 'Drama', status: 'want to read' },
  { title: 'The Adventures of Tom Sawyer', author: 'Mark Twain', year: 1876, genre: 'Adventure', status: 'read' },
  { title: 'Adventures of Huckleberry Finn', author: 'Mark Twain', year: 1884, genre: 'Adventure', status: 'want to read' },
  { title: 'The Time Machine', author: 'H. G. Wells', year: 1895, genre: 'Science fiction', status: 'reading' },
  { title: 'Dracula', author: 'Bram Stoker', year: 1897, genre: 'Horror', status: 'want to read' },
  { title: 'The War of the Worlds', author: 'H. G. Wells', year: 1898, genre: 'Science fiction', status: 'read' },
];

// Add every book in one transaction: all of them go in, or none do.
function load() {
  db.run('BEGIN');
  try {
    for (const b of BOOKS) {
      db.run('INSERT INTO books (title, author, year, genre, status) VALUES (?, ?, ?, ?, ?)',
        [b.title, b.author, b.year, b.genre, b.status]);
    }
    db.run('COMMIT');
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  }
}
```

```js go
initSqlJs({ locateFile: (file) => SQLJS + file }).then((SQL) => {
  db = new SQL.Database();
  db.exec(SCHEMA);
  load();
  const [{ n }] = rows('SELECT COUNT(*) AS n FROM books');
  status.textContent = `${n} books in the library`;
});
```

## Session: Asking questions

## Step: SELECT and WHERE
time: 18

Now the real power of SQL: asking questions. `SELECT` picks columns, `FROM` names the table, and `WHERE` keeps only the rows that match:

```sql
SELECT title, author, year FROM books WHERE genre = 'Horror';
```

```svg How SELECT ... WHERE works: the database checks each row against the condition and returns only the matching rows, with only the chosen columns
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 170" font-family="sans-serif" font-size="12">
  <rect width="520" height="170" fill="#ffffff"/>
  <text x="10" y="18" font-weight="bold">books (10 rows)</text>
  <rect x="10" y="26" width="200" height="22" fill="#fff7ed" stroke="#fdba74"/><text x="16" y="41">Emma · Romance</text>
  <rect x="10" y="50" width="200" height="22" fill="#dcfce7" stroke="#16a34a"/><text x="16" y="65">Frankenstein · Horror ✓</text>
  <rect x="10" y="74" width="200" height="22" fill="#fff7ed" stroke="#fdba74"/><text x="16" y="89">Moby-Dick · Adventure</text>
  <rect x="10" y="98" width="200" height="22" fill="#dcfce7" stroke="#16a34a"/><text x="16" y="113">Dracula · Horror ✓</text>
  <text x="16" y="138" fill="#6b7280">…</text>
  <rect x="236" y="60" width="110" height="44" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="291" y="80" text-anchor="middle">WHERE genre</text><text x="291" y="96" text-anchor="middle">= 'Horror'</text>
  <path d="M212 82 H232 M346 82 H366" stroke="#374151" stroke-width="2"/>
  <text x="370" y="56" font-weight="bold">result (2 rows)</text>
  <rect x="370" y="64" width="140" height="22" fill="#dcfce7" stroke="#16a34a"/><text x="376" y="79">Frankenstein</text>
  <rect x="370" y="88" width="140" height="22" fill="#dcfce7" stroke="#16a34a"/><text x="376" y="103">Dracula</text>
</svg>
```

- `SELECT *` means every column; naming columns is clearer and faster.
- Conditions use `=`, `<>` (not equal), `<`, `>`, `<=`, `>=`, and combine with `AND`, `OR` and `NOT`.
- Text values go in single quotes in SQL, but in your code they go in as `?` parameters, as always.

### The page

`queries` holds the SQL in one object, `Q`, so all the questions the app asks are in one place. `showTable()` turns rows into an HTML table: the header comes from the first row's keys. A **genre menu** is built from `SELECT DISTINCT genre` (each genre once), and choosing one runs the `WHERE` query. The SQL is shown under the table so you can see exactly what ran.

> Tip: in `showTable`, text from the database goes into `textContent`, not `innerHTML`, so a title can never inject HTML into the page.

check: js | a query with WHERE and a parameter | /WHERE\s+genre\s*=\s*\?/i | SELECT ... FROM books WHERE genre = ?
check: js | each genre once, for the menu | /SELECT\s+DISTINCT\s+genre/i | SELECT DISTINCT genre FROM books
check: js | a function that draws the table | /function\s+showTable\s*\(/ | Write function showTable(list) { ... }

quiz: Which query lists only the books published before 1850?
- [ ] `SELECT title FROM books ORDER BY 1850`
- [x] `SELECT title FROM books WHERE year < 1850`
- [ ] `SELECT title < 1850 FROM books`
why: `WHERE` filters rows by a condition; only rows where `year < 1850` is true come back.

quiz: What does `SELECT DISTINCT genre FROM books` return?
- [x] Each genre once, with no repeats
- [ ] Only the first book of each genre
- [ ] The number of genres
why: `DISTINCT` removes duplicate rows from the result.

```js queries
// Every question the app asks, in one place. Values always go in as ? parameters.
const Q = {
  all: 'SELECT title, author, year, genre, status FROM books',
  byGenre: 'SELECT title, author, year, genre, status FROM books WHERE genre = ?',
  genres: 'SELECT DISTINCT genre FROM books ORDER BY genre',
};
```

```js show
// Draw a list of rows as an HTML table, and show the SQL that made it.
function showTable(list, sql, params = []) {
  table.replaceChildren();
  lastSql.textContent = params.length ? `${sql}\n-- parameters: ${JSON.stringify(params)}` : sql;
  if (!list.length) {
    status.textContent = 'No books match.';
    return;
  }
  status.textContent = `${list.length} book${list.length === 1 ? '' : 's'}`;
  const head = table.createTHead().insertRow();
  for (const key of Object.keys(list[0])) {
    const th = document.createElement('th');
    th.textContent = key;
    head.append(th);
  }
  const body = table.createTBody();
  for (const row of list) {
    const tr = body.insertRow();
    for (const value of Object.values(row)) tr.insertCell().textContent = value;
  }
}
```

```js controls
function buildControls() {
  const genre = document.createElement('select');
  genre.id = 'genre';
  genre.add(new Option('Every genre', ''));
  for (const g of rows(Q.genres)) genre.add(new Option(g.genre, g.genre));
  controls.append(genre);
  genre.addEventListener('change', refresh);
}

function refresh() {
  const g = document.getElementById('genre').value;
  if (g) showTable(rows(Q.byGenre, [g]), Q.byGenre, [g]);
  else showTable(rows(Q.all), Q.all);
}
```

```js go
initSqlJs({ locateFile: (file) => SQLJS + file }).then((SQL) => {
  db = new SQL.Database();
  db.exec(SCHEMA);
  load();
  buildControls();
  refresh();
});
```

## Step: ORDER BY and LIKE: sorting and searching
time: 15

Two more parts of a query:

- **`ORDER BY year`** sorts the results (smallest first). Add `DESC` for largest first: `ORDER BY year DESC`. Without `ORDER BY`, SQL promises no order at all.
- **`LIKE`** matches text with a pattern. `%` means "any characters", so `title LIKE '%time%'` finds any title containing "time". In SQLite, `LIKE` ignores upper and lower case for English letters.

```sql
SELECT title, author FROM books
WHERE title LIKE ? OR author LIKE ?
ORDER BY year;
```

The order of the parts is fixed: `SELECT` → `FROM` → `WHERE` → `ORDER BY`.

### One query for every combination

Instead of four queries (with or without a genre, with or without a search), one query handles all of them:

```sql
WHERE (? = '' OR genre = ?) AND (title LIKE ? OR author LIKE ?)
```

If the genre parameter is empty, `? = ''` is true and the genre test is skipped. If the search box is empty, the pattern is `%%`, which matches everything. A **sort menu** chooses between two queries, because column names can't be `?` parameters (only values can).

check: js | search with LIKE and parameters | /LIKE\s+\?/i | WHERE title LIKE ? OR author LIKE ?
check: js | results are sorted | /ORDER\s+BY\s+year/i | Add ORDER BY year
check: js | a search box | /createElement\(\s*['"]input['"]\s*\)/ | Make an <input type="search"> in buildControls()

quiz: Which pattern finds every title that *starts* with "The"?
- [ ] `'%The%'`
- [x] `'The%'`
- [ ] `'%The'`
why: `%` stands for any characters; with nothing before "The", the title must start with it.

quiz: Why can't the sort column be a `?` parameter?
- [ ] Parameters are only for numbers
- [x] Parameters can only stand for values, not for names like columns or tables
- [ ] ORDER BY doesn't work with parameters in any database
why: That's the same reason parameters are safe: they're always treated as data. Choose between fixed queries for different columns.

```js queries
// Every question the app asks, in one place. Values always go in as ? parameters.
const FILTER = `FROM books
WHERE (? = '' OR genre = ?)
  AND (title LIKE ? OR author LIKE ?)`;

const Q = {
  oldest: `SELECT title, author, year, genre, status ${FILTER}\nORDER BY year`,
  title: `SELECT title, author, year, genre, status ${FILTER}\nORDER BY title`,
  genres: 'SELECT DISTINCT genre FROM books ORDER BY genre',
};
```

```js controls
function buildControls() {
  const search = document.createElement('input');
  search.type = 'search';
  search.id = 'search';
  search.placeholder = 'Search titles and authors';
  search.setAttribute('aria-label', 'Search titles and authors');

  const genre = document.createElement('select');
  genre.id = 'genre';
  genre.setAttribute('aria-label', 'Genre');
  genre.add(new Option('Every genre', ''));
  for (const g of rows(Q.genres)) genre.add(new Option(g.genre, g.genre));

  const sort = document.createElement('select');
  sort.id = 'sort';
  sort.setAttribute('aria-label', 'Sort by');
  sort.add(new Option('Oldest first', 'oldest'));
  sort.add(new Option('Title A–Z', 'title'));

  controls.append(search, genre, sort);
  search.addEventListener('input', refresh);
  genre.addEventListener('change', refresh);
  sort.addEventListener('change', refresh);
}

function refresh() {
  const g = document.getElementById('genre').value;
  const pattern = `%${document.getElementById('search').value.trim()}%`;
  const sql = Q[document.getElementById('sort').value];
  const params = [g, g, pattern, pattern];
  showTable(rows(sql, params), sql, params);
}
```

## Step: COUNT and GROUP BY: summaries
time: 15

Databases don't just find rows; they **summarize** them. **Aggregate functions** turn many rows into one value:

| Function | Gives |
|---|---|
| `COUNT(*)` | How many rows |
| `SUM(x)` | The total of a column |
| `AVG(x)` | The average |
| `MIN(x)` / `MAX(x)` | The smallest / largest |

`GROUP BY` splits the rows into groups first, then runs the aggregate once per group:

```sql
SELECT genre, COUNT(*) AS books FROM books GROUP BY genre ORDER BY books DESC;
```

That's one row per genre with its count, biggest first. `AS books` names the result column so the code can read `row.books`.

```svg GROUP BY puts rows with the same value in a pile, then COUNT counts each pile
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 150" font-family="sans-serif" font-size="12">
  <rect width="520" height="150" fill="#ffffff"/>
  <rect x="20" y="20" width="110" height="24" fill="#fde68a"/><text x="28" y="36">Adventure</text>
  <rect x="20" y="48" width="110" height="24" fill="#fde68a"/><text x="28" y="64">Adventure</text>
  <rect x="20" y="76" width="110" height="24" fill="#fde68a"/><text x="28" y="92">Adventure</text>
  <rect x="150" y="20" width="110" height="24" fill="#fecaca"/><text x="158" y="36">Horror</text>
  <rect x="150" y="48" width="110" height="24" fill="#fecaca"/><text x="158" y="64">Horror</text>
  <rect x="280" y="20" width="110" height="24" fill="#bfdbfe"/><text x="288" y="36">Romance</text>
  <rect x="280" y="48" width="110" height="24" fill="#bfdbfe"/><text x="288" y="64">Romance</text>
  <text x="75" y="124" text-anchor="middle" font-weight="bold">COUNT = 3</text>
  <text x="205" y="124" text-anchor="middle" font-weight="bold">COUNT = 2</text>
  <text x="335" y="124" text-anchor="middle" font-weight="bold">COUNT = 2</text>
  <text x="410" y="70" fill="#6b7280">one result row</text><text x="410" y="86" fill="#6b7280">per group</text>
</svg>
```

The page shows the counts by status as little badges above the table. `stats` uses one query with `GROUP BY status`, and it's re-run whenever the list refreshes.

check: js | a GROUP BY query | /GROUP\s+BY\s+status/i | SELECT status, COUNT(*) AS n FROM books GROUP BY status
check: js | the counts appear on the page | /function\s+showStats\s*\(/ | Write function showStats() { ... }

quiz: What does `SELECT genre, COUNT(*) FROM books GROUP BY genre` return?
- [ ] Every book with its genre
- [x] One row per genre with how many books it has
- [ ] The total number of books
why: GROUP BY makes one group per genre, and COUNT(*) counts the rows in each group.

quiz: Which function gives the newest book's year?
- [ ] `COUNT(year)`
- [ ] `MIN(year)`
- [x] `MAX(year)`
why: MAX returns the largest value in the column, which is the most recent year.

```js queries
// Every question the app asks, in one place. Values always go in as ? parameters.
const FILTER = `FROM books
WHERE (? = '' OR genre = ?)
  AND (title LIKE ? OR author LIKE ?)`;

const Q = {
  oldest: `SELECT title, author, year, genre, status ${FILTER}\nORDER BY year`,
  title: `SELECT title, author, year, genre, status ${FILTER}\nORDER BY title`,
  genres: 'SELECT DISTINCT genre FROM books ORDER BY genre',
  byStatus: 'SELECT status, COUNT(*) AS n FROM books GROUP BY status ORDER BY n DESC',
  summary: 'SELECT COUNT(*) AS books, MIN(year) AS oldest, MAX(year) AS newest FROM books',
};

// The badges above the table: totals for the whole library.
function showStats() {
  const [s] = rows(Q.summary);
  const badges = [`${s.books} books`, `${s.oldest}–${s.newest}`, ...rows(Q.byStatus).map((r) => `${r.n} ${r.status}`)];
  stats.replaceChildren(...badges.map((text) => Object.assign(document.createElement('span'), { className: 'stat', textContent: text })));
}
```

```js go
initSqlJs({ locateFile: (file) => SQLJS + file }).then((SQL) => {
  db = new SQL.Database();
  db.exec(SCHEMA);
  load();
  buildControls();
  showStats();
  refresh();
});
```

## Session: Two tables

## Step: JOIN: authors get their own table
time: 20

Look at the data: "Jane Austen", "Mark Twain" and "H. G. Wells" are each typed twice. If you misspell one, the database thinks it's a different author. And where would you keep an author's country or birth year? Not on every book.

The fix is a second table. Each author is stored **once**, and each book points to its author by id. That id column is a **foreign key**:

```svg Two tables linked by a foreign key: each book's author_id holds the id of one row in authors; a JOIN puts them back together
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 190" font-family="sans-serif" font-size="12">
  <rect width="520" height="190" fill="#ffffff"/>
  <text x="10" y="18" font-weight="bold">authors</text>
  <rect x="10" y="26" width="190" height="22" fill="#fed7aa"/><text x="16" y="41" font-weight="bold">id   name          country</text>
  <rect x="10" y="48" width="190" height="22" fill="#fff7ed" stroke="#fdba74"/><text x="16" y="63">1    Jane Austen    England</text>
  <rect x="10" y="70" width="190" height="22" fill="#fff7ed" stroke="#fdba74"/><text x="16" y="85">2    Mary Shelley   England</text>
  <text x="290" y="18" font-weight="bold">books</text>
  <rect x="290" y="26" width="220" height="22" fill="#fed7aa"/><text x="296" y="41" font-weight="bold">id   title                  author_id</text>
  <rect x="290" y="48" width="220" height="22" fill="#fff7ed" stroke="#fdba74"/><text x="296" y="63">1    Pride and Prejudice    1</text>
  <rect x="290" y="70" width="220" height="22" fill="#fff7ed" stroke="#fdba74"/><text x="296" y="85">2    Emma                   1</text>
  <rect x="290" y="92" width="220" height="22" fill="#fff7ed" stroke="#fdba74"/><text x="296" y="107">3    Frankenstein           2</text>
  <path d="M490 59 C 450 59, 240 59, 200 59" fill="none" stroke="#2563eb" stroke-width="2"/>
  <path d="M490 81 C 450 81, 260 66, 200 61" fill="none" stroke="#2563eb" stroke-width="2"/>
  <path d="M490 103 C 440 103, 260 90, 200 81" fill="none" stroke="#16a34a" stroke-width="2"/>
  <text x="10" y="140" fill="#374151">SELECT books.title, authors.name AS author</text>
  <text x="10" y="158" fill="#374151">FROM books JOIN authors ON authors.id = books.author_id</text>
  <text x="10" y="180" fill="#6b7280">Each author is stored once; the JOIN matches author_id to authors.id.</text>
</svg>
```

```sql
author_id INTEGER NOT NULL REFERENCES authors(id)
```

`REFERENCES authors(id)` tells the database this column must hold a real author's id. With `PRAGMA foreign_keys = ON`, SQLite refuses a book whose author doesn't exist.

### JOIN

A **JOIN** puts the two tables back together for a query. `ON authors.id = books.author_id` says how rows match. When two tables share column names (both have `id`), write `table.column` to be clear.

### Loading two tables

`load()` now inserts each author first. `INSERT OR IGNORE` skips an author who's already there, because `name` is `UNIQUE`. Then each book finds its author's id with a **subquery**, a `SELECT` inside the `INSERT`: `(SELECT id FROM authors WHERE name = ?)`.

The queries change only in their `FROM` part, and the page shows the same columns, plus the author's country. A new badge shows books per author, using `GROUP BY` on the joined tables.

check: js | an authors table | /CREATE\s+TABLE\s+authors\s*\(/i | Add CREATE TABLE authors ( ... )
check: js | books point to authors with a foreign key | /author_id\s+INTEGER[^,]*REFERENCES\s+authors\s*\(\s*id\s*\)/i | author_id INTEGER NOT NULL REFERENCES authors(id)
check: js | queries JOIN the two tables | /JOIN\s+authors\s+ON/i | FROM books JOIN authors ON authors.id = books.author_id

quiz: What is a foreign key?
- [ ] A password for the database
- [x] A column that holds the id of a row in another table
- [ ] A key that only works abroad
why: `author_id` points at a row in `authors`, linking the two tables.

quiz: Why store authors in their own table?
- [x] Each author is stored once, so a name can't be spelled two ways and author facts live in one place
- [ ] SQL can't store two text columns in one table
- [ ] It makes every query shorter
why: Storing each fact once (normalizing) keeps data consistent; JOIN brings it back together when needed.

```js schema
const SCHEMA = `
CREATE TABLE authors (
  id      INTEGER PRIMARY KEY,
  name    TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL
);

CREATE TABLE books (
  id        INTEGER PRIMARY KEY,
  title     TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES authors(id),
  year      INTEGER NOT NULL,
  genre     TEXT NOT NULL,
  status    TEXT NOT NULL DEFAULT 'want to read'
            CHECK (status IN ('want to read', 'reading', 'read'))
);
`;
```

```js data
// Where each author is from.
const COUNTRIES = {
  'Jane Austen': 'England', 'Mary Shelley': 'England', 'Herman Melville': 'United States',
  'Louisa May Alcott': 'United States', 'Mark Twain': 'United States', 'H. G. Wells': 'England',
  'Bram Stoker': 'Ireland',
};

// Ten classic books (all published before 1900).
const BOOKS = [
  { title: 'Pride and Prejudice', author: 'Jane Austen', year: 1813, genre: 'Romance', status: 'read' },
  { title: 'Emma', author: 'Jane Austen', year: 1815, genre: 'Romance', status: 'want to read' },
  { title: 'Frankenstein', author: 'Mary Shelley', year: 1818, genre: 'Horror', status: 'read' },
  { title: 'Moby-Dick', author: 'Herman Melville', year: 1851, genre: 'Adventure', status: 'reading' },
  { title: 'Little Women', author: 'Louisa May Alcott', year: 1868, genre: 'Drama', status: 'want to read' },
  { title: 'The Adventures of Tom Sawyer', author: 'Mark Twain', year: 1876, genre: 'Adventure', status: 'read' },
  { title: 'Adventures of Huckleberry Finn', author: 'Mark Twain', year: 1884, genre: 'Adventure', status: 'want to read' },
  { title: 'The Time Machine', author: 'H. G. Wells', year: 1895, genre: 'Science fiction', status: 'reading' },
  { title: 'Dracula', author: 'Bram Stoker', year: 1897, genre: 'Horror', status: 'want to read' },
  { title: 'The War of the Worlds', author: 'H. G. Wells', year: 1898, genre: 'Science fiction', status: 'read' },
];

// Add every author once, then every book pointing at its author, in one transaction.
function load() {
  db.run('PRAGMA foreign_keys = ON');
  db.run('BEGIN');
  try {
    for (const b of BOOKS) {
      db.run('INSERT OR IGNORE INTO authors (name, country) VALUES (?, ?)', [b.author, COUNTRIES[b.author]]);
      db.run(`INSERT INTO books (title, author_id, year, genre, status)
              VALUES (?, (SELECT id FROM authors WHERE name = ?), ?, ?, ?)`,
        [b.title, b.author, b.year, b.genre, b.status]);
    }
    db.run('COMMIT');
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  }
}
```

```js queries
// Every question the app asks, in one place. Values always go in as ? parameters.
const FILTER = `FROM books
JOIN authors ON authors.id = books.author_id
WHERE (? = '' OR books.genre = ?)
  AND (books.title LIKE ? OR authors.name LIKE ?)`;

const COLUMNS = 'books.title, authors.name AS author, authors.country, books.year, books.genre, books.status';

const Q = {
  oldest: `SELECT ${COLUMNS} ${FILTER}\nORDER BY books.year`,
  title: `SELECT ${COLUMNS} ${FILTER}\nORDER BY books.title`,
  genres: 'SELECT DISTINCT genre FROM books ORDER BY genre',
  byStatus: 'SELECT status, COUNT(*) AS n FROM books GROUP BY status ORDER BY n DESC',
  summary: 'SELECT COUNT(*) AS books, MIN(year) AS oldest, MAX(year) AS newest FROM books',
  topAuthor: `SELECT authors.name, COUNT(*) AS n
FROM books JOIN authors ON authors.id = books.author_id
GROUP BY authors.id ORDER BY n DESC, authors.name LIMIT 1`,
};

// The badges above the table: totals for the whole library.
function showStats() {
  const [s] = rows(Q.summary);
  const [top] = rows(Q.topAuthor);
  const badges = [`${s.books} books`, `${s.oldest}–${s.newest}`, ...rows(Q.byStatus).map((r) => `${r.n} ${r.status}`),
    `Most books: ${top.name} (${top.n})`];
  stats.replaceChildren(...badges.map((text) => Object.assign(document.createElement('span'), { className: 'stat', textContent: text })));
}
```

## Step: Publish it, and what's next
kind: read
time: 12

Publish the library like your other projects: a `sql-library` folder with `index.html` (this guide's HTML in the `<body>`, ending with `<script src="script.js"></script>`), `style.css` and `script.js`, copied from the last code step. Commit, push to a public GitHub repository and turn on Pages. The finished project is at [github.com/TheoYanvno/sql-library](https://github.com/TheoYanvno/sql-library).

### The SQL you know now

| Statement | Does |
|---|---|
| `CREATE TABLE` | Describes a table: columns, types, rules |
| `INSERT INTO ... VALUES (?, ...)` | Adds rows safely |
| `SELECT ... FROM ... WHERE ... ORDER BY` | Finds and sorts rows |
| `LIKE '%text%'` | Matches text patterns |
| `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` with `GROUP BY` | Summarizes groups |
| `JOIN ... ON` | Combines related tables |

Two you'll meet next: `UPDATE books SET status = ? WHERE id = ?` changes rows, and `DELETE FROM books WHERE id = ?` removes them. **Always include the WHERE**: without it, `UPDATE` and `DELETE` change every row in the table.

### Practice outside the browser

Install **DB Browser for SQLite** ([sqlitebrowser.org](https://sqlitebrowser.org/)) to open `.db` files and run queries with a spreadsheet-like view. Python includes SQLite too: `import sqlite3`.

### Next

The **Marvel Character Database** guide uses everything here, and adds many-to-many relationships (characters who appear in many movies), `LEFT JOIN` and reports.

quiz: What happens if you run `DELETE FROM books` with no WHERE?
- [ ] Nothing, SQL asks you to confirm
- [x] Every row in books is deleted
- [ ] Only the last row is deleted
why: Without WHERE the statement applies to the whole table. Always write the WHERE first.

## Finish

You built a page backed by a real SQL database. You learned:

- **Tables, rows and columns**, types, `PRIMARY KEY`, `NOT NULL`, `DEFAULT` and `CHECK`
- **INSERT** with `?` parameters (and why gluing SQL strings is dangerous)
- **Transactions**: `BEGIN`, `COMMIT`, `ROLLBACK`
- **SELECT** with `WHERE`, `DISTINCT`, `ORDER BY` and `LIKE`
- **Aggregates** with `GROUP BY`
- **Foreign keys** and **JOIN**

### Challenges

1. Add a status menu next to the genre menu, filtering with `books.status = ?`.
2. Add a button on each row that marks a book read with `UPDATE books SET status = 'read' WHERE title = ?`, then refresh.
3. Add a "Books per country" badge with `GROUP BY authors.country`.
