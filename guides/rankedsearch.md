---
id: rankedsearch
title: Ranked search
blocks-html: page
blocks-css: base
blocks-js: db, data, like, exists, rank
goals: Search text in SQL with LIKE and % wildcards, safely through parameters; Escape % and _ so a search for "100%" means exactly that; Match through a link table with a correlated EXISTS subquery, one row per result; Rank results into buckets with ORDER BY CASE, best matches first; Explain to the person why each result matched
prereqs: The Link tables lesson (many-to-many and joins) and the SQL basics lesson
---

## Session: Best matches first

## Step: Finding is easy, ranking is the point
time: 10
kind: read

Type "spider" into a good search box and you expect Spider-Man first, not Venom (whose power is "Immune to spider-sense"), even though both match. Search is two jobs:

1. **Find** every row that matches anywhere: the name, the real name, or a power.
2. **Rank** them so the most likely answer is on top.

```svg Results are sorted into buckets by how they matched: a name that starts with the search beats a name that contains it, which beats a power match
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 130" font-family="sans-serif" font-size="11">
  <rect x="5" y="8" width="26" height="30" rx="6" fill="#0f172a"/><text x="18" y="28" text-anchor="middle" fill="#fff" font-weight="700">0</text>
  <rect x="36" y="8" width="289" height="30" rx="6" fill="#bbf7d0"/><text x="44" y="21" font-size="10" fill="#475569">name starts with "spider"</text><text x="44" y="33" font-weight="700">Spider-Man, Spider-Woman</text>
  <rect x="5" y="46" width="26" height="30" rx="6" fill="#0f172a"/><text x="18" y="66" text-anchor="middle" fill="#fff" font-weight="700">1</text>
  <rect x="36" y="46" width="289" height="30" rx="6" fill="#fde68a"/><text x="44" y="59" font-size="10" fill="#475569">name or real name contains it</text><text x="44" y="71" font-weight="700">Miles "Spider" Morales (example)</text>
  <rect x="5" y="84" width="26" height="30" rx="6" fill="#0f172a"/><text x="18" y="104" text-anchor="middle" fill="#fff" font-weight="700">2</text>
  <rect x="36" y="84" width="289" height="30" rx="6" fill="#e2e8f0"/><text x="44" y="97" font-size="10" fill="#475569">only a power matches</text><text x="44" y="109" font-weight="700">Venom</text>
</svg>
```

SQL can do both in one query:

- `LIKE '%spider%'` finds text that **contains** "spider" (`%` means "any characters, or none").
- `EXISTS (SELECT 1 ...)` asks "does this character have a matching power?" without listing a character once per power.
- `ORDER BY CASE ... END` puts each result in a numbered **bucket**, then sorts by name inside each bucket.

Big search engines use fancier scoring, but buckets are clear, fast, and easy to explain, which matters: the page will tell people *why* each result matched.

## Step: LIKE, safely
time: 15

The search text goes in as a **parameter**, with the `%` signs added in JavaScript:

```js
all('SELECT name FROM characters WHERE name LIKE ? ESCAPE \'\\\' ORDER BY name', [`%${escapeLike(q)}%`]);
```

Two safety layers:

- **Parameters** (`?`) keep the text out of the SQL itself, so a search like `x' OR 1=1 --` is just odd text to look for, never part of the query.
- **Escaping LIKE's own wildcards.** `%` and `_` are special inside a LIKE pattern. A search for `100%` would otherwise mean "100 followed by anything". `escapeLike` puts a backslash before `%`, `_` and `\`, and `ESCAPE '\'` tells SQLite that backslash is the escape character.

In SQLite, LIKE ignores upper and lower case for English letters, so "SPIDER" finds "Spider-Man" too.

check: html | a search box | /id=["']q["']/ | <input id="q" type="search">
check: js | escaping LIKE's wildcards | /replace\(\s*\/\[%_\\\\\]\/g/ | q.replace(/[%_\\]/g, (c) => '\\' + c)
check: js | LIKE with an escape character | /LIKE\s+\?\s+ESCAPE/i | name LIKE ? ESCAPE '\'

quiz: What does `name LIKE '%man%'` match?
- [x] Any name containing "man", like Spider-Man and Ant-Man
- [ ] Only the name "man"
- [ ] Names starting with "man"
why: % on both sides means any characters before and after.

quiz: Why escape `%` and `_` in the search text?
- [ ] SQLite can't store them
- [x] They're wildcards inside LIKE, so "100%" would match "1000 tons"; escaping makes them ordinary characters
- [ ] To stop SQL injection
why: Parameters already stop injection; escaping is about matching exactly what was typed.

```html page
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
<main class="wrap">
  <h1>Search</h1>
  <input id="q" type="search" placeholder="Try spider, flight, peter, 100%" aria-label="Search characters" autocomplete="off">
  <p id="status" class="muted" role="status">Loading the database…</p>
  <ol id="results" class="results"></ol>
  <pre id="lastSql" class="sql"></pre>
</main>
```

```css base
body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
.wrap { max-width: 620px; margin: 0 auto; padding: 16px; }
h1 { margin-top: 0; color: #fca5a5; }
input { width: 100%; box-sizing: border-box; padding: 10px; font: inherit; border-radius: 10px; border: 1px solid #475569; background: #1e293b; color: inherit; }
.muted { color: #94a3b8; }
.results { padding-left: 1.4em; }
.results li { margin: 6px 0; }
.why { display: inline-block; margin-left: 6px; padding: 1px 8px; border-radius: 999px; font-size: .75rem; background: #334155; color: #cbd5e1; }
.why.b0 { background: #166534; color: #dcfce7; } .why.b1 { background: #854d0e; color: #fef9c3; }
.sql { white-space: pre-wrap; font-size: .72rem; color: #93c5fd; background: #020617; padding: 8px; border-radius: 8px; }
```

```js db
const statusEl = document.getElementById('status');
const lastSql = document.getElementById('lastSql');
const resultsEl = document.getElementById('results');
const qEl = document.getElementById('q');
let db = null;

function all(sql, params = []) {
  lastSql.textContent = sql.trim();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

const escapeLike = (q) => q.replace(/[%_\\]/g, (c) => `\\${c}`);
```

```js data
const SCHEMA = `
CREATE TABLE characters (id INTEGER PRIMARY KEY, name TEXT NOT NULL, real_name TEXT);
CREATE TABLE powers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE character_powers (character_id INTEGER NOT NULL, power_id INTEGER NOT NULL, PRIMARY KEY (character_id, power_id));`;

const CHARACTERS = [
  [1, 'Spider-Man', 'Peter Parker'], [2, 'Spider-Woman', 'Jessica Drew'], [3, 'Venom', 'Eddie Brock'],
  [4, 'Iron Man', 'Tony Stark'], [5, 'Storm', 'Ororo Munroe'], [6, 'Thor', 'Thor Odinson'],
  [7, 'Ant-Man', 'Scott Lang'], [8, 'Peter Quill', 'Peter Jason Quill'],
];
const POWERS = [[1, 'Wall-crawling'], [2, 'Spider-sense'], [3, 'Immune to spider-sense'], [4, 'Flight'], [5, 'Weather control'], [6, 'Shrinking to 1% size']];
const LINKS = [[1, 1], [1, 2], [2, 1], [3, 1], [3, 3], [4, 4], [5, 4], [5, 5], [6, 4], [7, 6]];

initSqlJs({ locateFile: (f) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}` }).then((SQL) => {
  db = new SQL.Database();
  db.run(SCHEMA);
  for (const r of CHARACTERS) db.run('INSERT INTO characters VALUES (?, ?, ?)', r);
  for (const r of POWERS) db.run('INSERT INTO powers VALUES (?, ?)', r);
  for (const r of LINKS) db.run('INSERT INTO character_powers VALUES (?, ?)', r);
  statusEl.textContent = 'Type to search.';
  qEl.addEventListener('input', () => search(qEl.value));
}).catch(() => { statusEl.textContent = 'Couldn\'t load the database engine. Check your connection.'; });
```

```js like
function search(q) {
  q = q.trim();
  if (!q) { resultsEl.replaceChildren(); statusEl.textContent = 'Type to search.'; return; }
  const rows = all(`SELECT name FROM characters WHERE name LIKE ? ESCAPE '\\' ORDER BY name`, [`%${escapeLike(q)}%`]);
  resultsEl.replaceChildren(...rows.map((r) => Object.assign(document.createElement('li'), { textContent: r.name })));
  statusEl.textContent = `${rows.length} found`;
}
```

## Step: Matching through powers with EXISTS
time: 15

"flight" should find Iron Man, Storm and Thor, though none has "flight" in its name. The power names live in another table, behind a link table.

A plain JOIN would work, but it returns Spider-Man **once per matching power**. `EXISTS` asks a yes-or-no question for each character instead:

```sql
WHERE c.name LIKE ? ESCAPE '\' OR c.real_name LIKE ? ESCAPE '\'
   OR EXISTS (SELECT 1 FROM character_powers cp JOIN powers p ON p.id = cp.power_id
              WHERE cp.character_id = c.id AND p.name LIKE ? ESCAPE '\')
```

The inner query mentions `c.id` from the outer one, so it runs **for each character**. That's called a **correlated subquery**. `SELECT 1` because the inner query's columns don't matter; only whether it finds a row.

The same pattern has three `?` marks, so the code passes the same `%…%` text three times, in order.

```svg For each character, EXISTS asks whether any of its powers match; the answer is yes or no, so each character appears once
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="11">
  <rect x="5" y="30" width="80" height="34" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="45" y="51" text-anchor="middle">Storm</text>
  <rect x="110" y="10" width="120" height="74" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="170" y="28" text-anchor="middle">her powers:</text><text x="170" y="46" text-anchor="middle">Flight ✓</text><text x="170" y="64" text-anchor="middle">Weather control</text>
  <rect x="255" y="30" width="70" height="34" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="290" y="51" text-anchor="middle">yes, once</text>
  <path d="M85 47 H106 M230 47 H251" stroke="#111" stroke-width="2"/>
</svg>
```

check: js | a correlated EXISTS subquery | /EXISTS\s*\(\s*SELECT\s+1/i | EXISTS (SELECT 1 FROM character_powers cp JOIN powers p ... WHERE cp.character_id = c.id ...)
check: js | tied to the outer character | /cp\.character_id\s*=\s*c\.id/i | WHERE cp.character_id = c.id
check: js | searching the real name too | /c\.real_name\s+LIKE/i | OR c.real_name LIKE ?

quiz: Why EXISTS instead of joining the powers in?
- [x] A join returns a character once per matching power; EXISTS only asks yes or no, so each appears once
- [ ] EXISTS is the only way to use LIKE
- [ ] Joins can't use link tables
why: EXISTS stops at the first match and never multiplies rows.

quiz: What makes the subquery "correlated"?
- [ ] It uses LIKE
- [x] It refers to c.id from the outer query, so it's checked for each character
- [ ] It has a JOIN inside
why: The inner query depends on the row the outer query is looking at.

```js exists
const FIND = `
SELECT c.id, c.name, c.real_name
FROM characters c
WHERE c.name LIKE ? ESCAPE '\\'
   OR c.real_name LIKE ? ESCAPE '\\'
   OR EXISTS (SELECT 1 FROM character_powers cp JOIN powers p ON p.id = cp.power_id
              WHERE cp.character_id = c.id AND p.name LIKE ? ESCAPE '\\')
ORDER BY c.name`;

function search(q) {
  q = q.trim();
  if (!q) { resultsEl.replaceChildren(); statusEl.textContent = 'Type to search.'; return; }
  const like = `%${escapeLike(q)}%`;
  const rows = all(FIND, [like, like, like]);
  resultsEl.replaceChildren(...rows.map((r) => Object.assign(document.createElement('li'), { textContent: `${r.name} (${r.real_name})` })));
  statusEl.textContent = `${rows.length} found`;
}
```

## Step: Rank, and say why
time: 15

Now the ranking. `ORDER BY CASE` gives each row a bucket number, smallest first, then sorts by name within a bucket:

```sql
ORDER BY CASE
  WHEN c.name LIKE ? ESCAPE '\' THEN 0                              -- name starts with it
  WHEN c.name LIKE ? ESCAPE '\' OR c.real_name LIKE ? ESCAPE '\' THEN 1   -- contains it
  ELSE 2                                                            -- only a power matched
END, c.name
LIMIT 20
```

"Starts with" uses `q%` (no `%` in front), "contains" uses `%q%`. The same `CASE` is also returned as a column, `bucket`, so the page can show **why** each result is there: "name", "contains" or the matching power. People trust search more when they can see why something came up.

`LIMIT 20` keeps a one-letter search from drawing hundreds of rows.

```svg The full query: find with WHERE, bucket with CASE, sort by bucket then name, keep the first 20
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 80" font-family="sans-serif" font-size="11">
  <rect x="5" y="22" width="70" height="34" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="40" y="43" text-anchor="middle">WHERE</text>
  <rect x="88" y="22" width="70" height="34" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="123" y="43" text-anchor="middle">CASE bucket</text>
  <rect x="171" y="22" width="80" height="34" rx="8" fill="#fed7aa" stroke="#ea580c"/><text x="211" y="43" text-anchor="middle">ORDER BY</text>
  <rect x="264" y="22" width="61" height="34" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="294" y="43" text-anchor="middle">LIMIT 20</text>
  <path d="M75 39 H84 M158 39 H167 M251 39 H260" stroke="#111" stroke-width="2"/>
</svg>
```

check: js | ranking with ORDER BY CASE | /ORDER\s+BY\s+bucket|ORDER\s+BY\s+CASE/i | ORDER BY CASE WHEN ... THEN 0 ... END, c.name
check: js | starts-with for the best bucket | /`\$\{\s*escapeLike\(\s*q\s*\)\s*\}%`/ | const prefix = `${escapeLike(q)}%`;
check: js | a limit on how many show | /LIMIT\s+20/i | LIMIT 20

quiz: Searching "spi", which bucket is Venom in?
- [ ] 0
- [ ] 1
- [x] 2: neither name contains "spi", only a power ("Immune to spider-sense")
why: Buckets 0 and 1 check the names; a power-only match falls to ELSE 2.

quiz: Why show "matched power: Flight" next to Storm?
- [x] So people can see why a result came up and trust the search
- [ ] It makes the query faster
- [ ] SQL requires it
why: Explaining a match turns a surprising result into an obvious one.

```js rank
const RANKED = `
SELECT c.id, c.name, c.real_name,
  CASE
    WHEN c.name LIKE ? ESCAPE '\\' THEN 0
    WHEN c.name LIKE ? ESCAPE '\\' OR c.real_name LIKE ? ESCAPE '\\' THEN 1
    ELSE 2
  END AS bucket,
  (SELECT p.name FROM character_powers cp JOIN powers p ON p.id = cp.power_id
   WHERE cp.character_id = c.id AND p.name LIKE ? ESCAPE '\\' LIMIT 1) AS power
FROM characters c
WHERE c.name LIKE ? ESCAPE '\\'
   OR c.real_name LIKE ? ESCAPE '\\'
   OR EXISTS (SELECT 1 FROM character_powers cp JOIN powers p ON p.id = cp.power_id
              WHERE cp.character_id = c.id AND p.name LIKE ? ESCAPE '\\')
ORDER BY bucket, c.name
LIMIT 20`;

const REASON = ['name starts with it', 'name or real name contains it'];

function search(q) {
  q = q.trim();
  if (!q) { resultsEl.replaceChildren(); statusEl.textContent = 'Type to search.'; return; }
  const like = `%${escapeLike(q)}%`;
  const prefix = `${escapeLike(q)}%`;
  const rows = all(RANKED, [prefix, like, like, like, like, like, like]);
  resultsEl.replaceChildren(...rows.map((r) => {
    const li = document.createElement('li');
    li.textContent = `${r.name} (${r.real_name})`;
    const why = document.createElement('span');
    why.className = `why b${r.bucket}`;
    why.textContent = r.bucket < 2 ? REASON[r.bucket] : `matched power: ${r.power}`;
    li.append(why);
    return li;
  }));
  statusEl.textContent = rows.length ? `${rows.length} found, best first` : `Nothing matches "${q}".`;
}
```

## Finish

Your searches put the right answer on top now. You learned:

- **LIKE** with `%` wildcards, through **parameters**, and **escaping** `%` and `_`
- A **correlated EXISTS** subquery to search through a link table, once per result
- **ORDER BY CASE** buckets, then name, with **LIMIT**
- Returning the bucket so the page can **explain each match**

You've now learned every part of the **Marvel Character Database**: SQL, link tables and ranked search. Build it next.

### Challenges

1. Add a bucket for an exact match ("Thor" typed exactly) above "starts with".
2. Search teams too, with a second EXISTS through a members link table.
3. Debounce the search (the Saving data safely lesson) so it runs 150 ms after typing stops.

### Next

The **Marvel Character Database** project.
