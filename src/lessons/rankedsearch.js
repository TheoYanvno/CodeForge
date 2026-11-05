// Built from guides/rankedsearch.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "rankedsearch",
 "title": "Ranked search",
 "goals": [
  "Search text in SQL with LIKE and % wildcards, safely through parameters",
  "Escape % and _ so a search for \"100%\" means exactly that",
  "Match through a link table with a correlated EXISTS subquery, one row per result",
  "Rank results into buckets with ORDER BY CASE, best matches first",
  "Explain to the person why each result matched"
 ],
 "prereqs": [
  "The Link tables lesson (many-to-many and joins) and the SQL basics lesson"
 ],
 "sessions": [
  {
   "title": "Best matches first",
   "from": 0,
   "to": 3
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
   "db": "",
   "data": "",
   "like": "",
   "exists": "",
   "rank": ""
  }
 },
 "steps": [
  {
   "title": "Finding is easy, ranking is the point",
   "body": "Type \"spider\" into a good search box and you expect Spider-Man first, not Venom (whose power is \"Immune to spider-sense\"), even though both match. Search is two jobs:\n\n1. **Find** every row that matches anywhere: the name, the real name, or a power.\n2. **Rank** them so the most likely answer is on top.\n\n```svg Results are sorted into buckets by how they matched: a name that starts with the search beats a name that contains it, which beats a power match\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 130\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"8\" width=\"26\" height=\"30\" rx=\"6\" fill=\"#0f172a\"/><text x=\"18\" y=\"28\" text-anchor=\"middle\" fill=\"#fff\" font-weight=\"700\">0</text>\n  <rect x=\"36\" y=\"8\" width=\"289\" height=\"30\" rx=\"6\" fill=\"#bbf7d0\"/><text x=\"44\" y=\"21\" font-size=\"10\" fill=\"#475569\">name starts with \"spider\"</text><text x=\"44\" y=\"33\" font-weight=\"700\">Spider-Man, Spider-Woman</text>\n  <rect x=\"5\" y=\"46\" width=\"26\" height=\"30\" rx=\"6\" fill=\"#0f172a\"/><text x=\"18\" y=\"66\" text-anchor=\"middle\" fill=\"#fff\" font-weight=\"700\">1</text>\n  <rect x=\"36\" y=\"46\" width=\"289\" height=\"30\" rx=\"6\" fill=\"#fde68a\"/><text x=\"44\" y=\"59\" font-size=\"10\" fill=\"#475569\">name or real name contains it</text><text x=\"44\" y=\"71\" font-weight=\"700\">Miles \"Spider\" Morales (example)</text>\n  <rect x=\"5\" y=\"84\" width=\"26\" height=\"30\" rx=\"6\" fill=\"#0f172a\"/><text x=\"18\" y=\"104\" text-anchor=\"middle\" fill=\"#fff\" font-weight=\"700\">2</text>\n  <rect x=\"36\" y=\"84\" width=\"289\" height=\"30\" rx=\"6\" fill=\"#e2e8f0\"/><text x=\"44\" y=\"97\" font-size=\"10\" fill=\"#475569\">only a power matches</text><text x=\"44\" y=\"109\" font-weight=\"700\">Venom</text>\n</svg>\n```\n\nSQL can do both in one query:\n\n- `LIKE '%spider%'` finds text that **contains** \"spider\" (`%` means \"any characters, or none\").\n- `EXISTS (SELECT 1 ...)` asks \"does this character have a matching power?\" without listing a character once per power.\n- `ORDER BY CASE ... END` puts each result in a numbered **bucket**, then sorts by name inside each bucket.\n\nBig search engines use fancier scoring, but buckets are clear, fast, and easy to explain, which matters: the page will tell people *why* each result matched.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "LIKE, safely",
   "body": "The search text goes in as a **parameter**, with the `%` signs added in JavaScript:\n\n```js\nall('SELECT name FROM characters WHERE name LIKE ? ESCAPE \\'\\\\\\' ORDER BY name', [`%${escapeLike(q)}%`]);\n```\n\nTwo safety layers:\n\n- **Parameters** (`?`) keep the text out of the SQL itself, so a search like `x' OR 1=1 --` is just odd text to look for, never part of the query.\n- **Escaping LIKE's own wildcards.** `%` and `_` are special inside a LIKE pattern. A search for `100%` would otherwise mean \"100 followed by anything\". `escapeLike` puts a backslash before `%`, `_` and `\\`, and `ESCAPE '\\'` tells SQLite that backslash is the escape character.\n\nIn SQLite, LIKE ignores upper and lower case for English letters, so \"SPIDER\" finds \"Spider-Man\" too.",
   "checks": [
    {
     "pane": "html",
     "label": "a search box",
     "test": "/id=[\"']q[\"']/",
     "hint": "<input id=\"q\" type=\"search\">"
    },
    {
     "pane": "js",
     "label": "escaping LIKE's wildcards",
     "test": "/replace\\(\\s*\\/\\[%_\\\\\\\\\\]\\/g/",
     "hint": "q.replace(/[%_\\\\]/g, (c) => '\\\\' + c)"
    },
    {
     "pane": "js",
     "label": "LIKE with an escape character",
     "test": "/LIKE\\s+\\?\\s+ESCAPE/i",
     "hint": "name LIKE ? ESCAPE '\\'"
    }
   ],
   "quiz": [
    {
     "q": "What does `name LIKE '%man%'` match?",
     "options": [
      "Any name containing \"man\", like Spider-Man and Ant-Man",
      "Only the name \"man\"",
      "Names starting with \"man\""
     ],
     "answer": 0,
     "why": "% on both sides means any characters before and after."
    },
    {
     "q": "Why escape `%` and `_` in the search text?",
     "options": [
      "SQLite can't store them",
      "They're wildcards inside LIKE, so \"100%\" would match \"1000 tons\"; escaping makes them ordinary characters",
      "To stop SQL injection"
     ],
     "answer": 1,
     "why": "Parameters already stop injection; escaping is about matching exactly what was typed."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js\"></script>\n<main class=\"wrap\">\n  <h1>Search</h1>\n  <input id=\"q\" type=\"search\" placeholder=\"Try spider, flight, peter, 100%\" aria-label=\"Search characters\" autocomplete=\"off\">\n  <p id=\"status\" class=\"muted\" role=\"status\">Loading the database…</p>\n  <ol id=\"results\" class=\"results\"></ol>\n  <pre id=\"lastSql\" class=\"sql\"></pre>\n</main>"
   },
   "css": {
    "base": "body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }\n.wrap { max-width: 620px; margin: 0 auto; padding: 16px; }\nh1 { margin-top: 0; color: #fca5a5; }\ninput { width: 100%; box-sizing: border-box; padding: 10px; font: inherit; border-radius: 10px; border: 1px solid #475569; background: #1e293b; color: inherit; }\n.muted { color: #94a3b8; }\n.results { padding-left: 1.4em; }\n.results li { margin: 6px 0; }\n.why { display: inline-block; margin-left: 6px; padding: 1px 8px; border-radius: 999px; font-size: .75rem; background: #334155; color: #cbd5e1; }\n.why.b0 { background: #166534; color: #dcfce7; } .why.b1 { background: #854d0e; color: #fef9c3; }\n.sql { white-space: pre-wrap; font-size: .72rem; color: #93c5fd; background: #020617; padding: 8px; border-radius: 8px; }"
   },
   "js": {
    "db": "const statusEl = document.getElementById('status');\nconst lastSql = document.getElementById('lastSql');\nconst resultsEl = document.getElementById('results');\nconst qEl = document.getElementById('q');\nlet db = null;\n\nfunction all(sql, params = []) {\n  lastSql.textContent = sql.trim();\n  const stmt = db.prepare(sql);\n  stmt.bind(params);\n  const rows = [];\n  while (stmt.step()) rows.push(stmt.getAsObject());\n  stmt.free();\n  return rows;\n}\n\nconst escapeLike = (q) => q.replace(/[%_\\\\]/g, (c) => `\\\\${c}`);",
    "data": "const SCHEMA = `\nCREATE TABLE characters (id INTEGER PRIMARY KEY, name TEXT NOT NULL, real_name TEXT);\nCREATE TABLE powers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE character_powers (character_id INTEGER NOT NULL, power_id INTEGER NOT NULL, PRIMARY KEY (character_id, power_id));`;\n\nconst CHARACTERS = [\n  [1, 'Spider-Man', 'Peter Parker'], [2, 'Spider-Woman', 'Jessica Drew'], [3, 'Venom', 'Eddie Brock'],\n  [4, 'Iron Man', 'Tony Stark'], [5, 'Storm', 'Ororo Munroe'], [6, 'Thor', 'Thor Odinson'],\n  [7, 'Ant-Man', 'Scott Lang'], [8, 'Peter Quill', 'Peter Jason Quill'],\n];\nconst POWERS = [[1, 'Wall-crawling'], [2, 'Spider-sense'], [3, 'Immune to spider-sense'], [4, 'Flight'], [5, 'Weather control'], [6, 'Shrinking to 1% size']];\nconst LINKS = [[1, 1], [1, 2], [2, 1], [3, 1], [3, 3], [4, 4], [5, 4], [5, 5], [6, 4], [7, 6]];\n\ninitSqlJs({ locateFile: (f) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}` }).then((SQL) => {\n  db = new SQL.Database();\n  db.run(SCHEMA);\n  for (const r of CHARACTERS) db.run('INSERT INTO characters VALUES (?, ?, ?)', r);\n  for (const r of POWERS) db.run('INSERT INTO powers VALUES (?, ?)', r);\n  for (const r of LINKS) db.run('INSERT INTO character_powers VALUES (?, ?)', r);\n  statusEl.textContent = 'Type to search.';\n  qEl.addEventListener('input', () => search(qEl.value));\n}).catch(() => { statusEl.textContent = 'Couldn\\'t load the database engine. Check your connection.'; });",
    "like": "function search(q) {\n  q = q.trim();\n  if (!q) { resultsEl.replaceChildren(); statusEl.textContent = 'Type to search.'; return; }\n  const rows = all(`SELECT name FROM characters WHERE name LIKE ? ESCAPE '\\\\' ORDER BY name`, [`%${escapeLike(q)}%`]);\n  resultsEl.replaceChildren(...rows.map((r) => Object.assign(document.createElement('li'), { textContent: r.name })));\n  statusEl.textContent = `${rows.length} found`;\n}"
   }
  },
  {
   "title": "Matching through powers with EXISTS",
   "body": "\"flight\" should find Iron Man, Storm and Thor, though none has \"flight\" in its name. The power names live in another table, behind a link table.\n\nA plain JOIN would work, but it returns Spider-Man **once per matching power**. `EXISTS` asks a yes-or-no question for each character instead:\n\n```sql\nWHERE c.name LIKE ? ESCAPE '\\' OR c.real_name LIKE ? ESCAPE '\\'\n   OR EXISTS (SELECT 1 FROM character_powers cp JOIN powers p ON p.id = cp.power_id\n              WHERE cp.character_id = c.id AND p.name LIKE ? ESCAPE '\\')\n```\n\nThe inner query mentions `c.id` from the outer one, so it runs **for each character**. That's called a **correlated subquery**. `SELECT 1` because the inner query's columns don't matter; only whether it finds a row.\n\nThe same pattern has three `?` marks, so the code passes the same `%…%` text three times, in order.\n\n```svg For each character, EXISTS asks whether any of its powers match; the answer is yes or no, so each character appears once\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"30\" width=\"80\" height=\"34\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"45\" y=\"51\" text-anchor=\"middle\">Storm</text>\n  <rect x=\"110\" y=\"10\" width=\"120\" height=\"74\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"170\" y=\"28\" text-anchor=\"middle\">her powers:</text><text x=\"170\" y=\"46\" text-anchor=\"middle\">Flight ✓</text><text x=\"170\" y=\"64\" text-anchor=\"middle\">Weather control</text>\n  <rect x=\"255\" y=\"30\" width=\"70\" height=\"34\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"290\" y=\"51\" text-anchor=\"middle\">yes, once</text>\n  <path d=\"M85 47 H106 M230 47 H251\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a correlated EXISTS subquery",
     "test": "/EXISTS\\s*\\(\\s*SELECT\\s+1/i",
     "hint": "EXISTS (SELECT 1 FROM character_powers cp JOIN powers p ... WHERE cp.character_id = c.id ...)"
    },
    {
     "pane": "js",
     "label": "tied to the outer character",
     "test": "/cp\\.character_id\\s*=\\s*c\\.id/i",
     "hint": "WHERE cp.character_id = c.id"
    },
    {
     "pane": "js",
     "label": "searching the real name too",
     "test": "/c\\.real_name\\s+LIKE/i",
     "hint": "OR c.real_name LIKE ?"
    }
   ],
   "quiz": [
    {
     "q": "Why EXISTS instead of joining the powers in?",
     "options": [
      "A join returns a character once per matching power; EXISTS only asks yes or no, so each appears once",
      "EXISTS is the only way to use LIKE",
      "Joins can't use link tables"
     ],
     "answer": 0,
     "why": "EXISTS stops at the first match and never multiplies rows."
    },
    {
     "q": "What makes the subquery \"correlated\"?",
     "options": [
      "It uses LIKE",
      "It refers to c.id from the outer query, so it's checked for each character",
      "It has a JOIN inside"
     ],
     "answer": 1,
     "why": "The inner query depends on the row the outer query is looking at."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "exists": "const FIND = `\nSELECT c.id, c.name, c.real_name\nFROM characters c\nWHERE c.name LIKE ? ESCAPE '\\\\'\n   OR c.real_name LIKE ? ESCAPE '\\\\'\n   OR EXISTS (SELECT 1 FROM character_powers cp JOIN powers p ON p.id = cp.power_id\n              WHERE cp.character_id = c.id AND p.name LIKE ? ESCAPE '\\\\')\nORDER BY c.name`;\n\nfunction search(q) {\n  q = q.trim();\n  if (!q) { resultsEl.replaceChildren(); statusEl.textContent = 'Type to search.'; return; }\n  const like = `%${escapeLike(q)}%`;\n  const rows = all(FIND, [like, like, like]);\n  resultsEl.replaceChildren(...rows.map((r) => Object.assign(document.createElement('li'), { textContent: `${r.name} (${r.real_name})` })));\n  statusEl.textContent = `${rows.length} found`;\n}"
   }
  },
  {
   "title": "Rank, and say why",
   "body": "Now the ranking. `ORDER BY CASE` gives each row a bucket number, smallest first, then sorts by name within a bucket:\n\n```sql\nORDER BY CASE\n  WHEN c.name LIKE ? ESCAPE '\\' THEN 0                              -- name starts with it\n  WHEN c.name LIKE ? ESCAPE '\\' OR c.real_name LIKE ? ESCAPE '\\' THEN 1   -- contains it\n  ELSE 2                                                            -- only a power matched\nEND, c.name\nLIMIT 20\n```\n\n\"Starts with\" uses `q%` (no `%` in front), \"contains\" uses `%q%`. The same `CASE` is also returned as a column, `bucket`, so the page can show **why** each result is there: \"name\", \"contains\" or the matching power. People trust search more when they can see why something came up.\n\n`LIMIT 20` keeps a one-letter search from drawing hundreds of rows.\n\n```svg The full query: find with WHERE, bucket with CASE, sort by bucket then name, keep the first 20\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 80\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"22\" width=\"70\" height=\"34\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"40\" y=\"43\" text-anchor=\"middle\">WHERE</text>\n  <rect x=\"88\" y=\"22\" width=\"70\" height=\"34\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"123\" y=\"43\" text-anchor=\"middle\">CASE bucket</text>\n  <rect x=\"171\" y=\"22\" width=\"80\" height=\"34\" rx=\"8\" fill=\"#fed7aa\" stroke=\"#ea580c\"/><text x=\"211\" y=\"43\" text-anchor=\"middle\">ORDER BY</text>\n  <rect x=\"264\" y=\"22\" width=\"61\" height=\"34\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"294\" y=\"43\" text-anchor=\"middle\">LIMIT 20</text>\n  <path d=\"M75 39 H84 M158 39 H167 M251 39 H260\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "ranking with ORDER BY CASE",
     "test": "/ORDER\\s+BY\\s+bucket|ORDER\\s+BY\\s+CASE/i",
     "hint": "ORDER BY CASE WHEN ... THEN 0 ... END, c.name"
    },
    {
     "pane": "js",
     "label": "starts-with for the best bucket",
     "test": "/`\\$\\{\\s*escapeLike\\(\\s*q\\s*\\)\\s*\\}%`/",
     "hint": "const prefix = `${escapeLike(q)}%`;"
    },
    {
     "pane": "js",
     "label": "a limit on how many show",
     "test": "/LIMIT\\s+20/i",
     "hint": "LIMIT 20"
    }
   ],
   "quiz": [
    {
     "q": "Searching \"spi\", which bucket is Venom in?",
     "options": [
      "0",
      "1",
      "2: neither name contains \"spi\", only a power (\"Immune to spider-sense\")"
     ],
     "answer": 2,
     "why": "Buckets 0 and 1 check the names; a power-only match falls to ELSE 2."
    },
    {
     "q": "Why show \"matched power: Flight\" next to Storm?",
     "options": [
      "So people can see why a result came up and trust the search",
      "It makes the query faster",
      "SQL requires it"
     ],
     "answer": 0,
     "why": "Explaining a match turns a surprising result into an obvious one."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "rank": "const RANKED = `\nSELECT c.id, c.name, c.real_name,\n  CASE\n    WHEN c.name LIKE ? ESCAPE '\\\\' THEN 0\n    WHEN c.name LIKE ? ESCAPE '\\\\' OR c.real_name LIKE ? ESCAPE '\\\\' THEN 1\n    ELSE 2\n  END AS bucket,\n  (SELECT p.name FROM character_powers cp JOIN powers p ON p.id = cp.power_id\n   WHERE cp.character_id = c.id AND p.name LIKE ? ESCAPE '\\\\' LIMIT 1) AS power\nFROM characters c\nWHERE c.name LIKE ? ESCAPE '\\\\'\n   OR c.real_name LIKE ? ESCAPE '\\\\'\n   OR EXISTS (SELECT 1 FROM character_powers cp JOIN powers p ON p.id = cp.power_id\n              WHERE cp.character_id = c.id AND p.name LIKE ? ESCAPE '\\\\')\nORDER BY bucket, c.name\nLIMIT 20`;\n\nconst REASON = ['name starts with it', 'name or real name contains it'];\n\nfunction search(q) {\n  q = q.trim();\n  if (!q) { resultsEl.replaceChildren(); statusEl.textContent = 'Type to search.'; return; }\n  const like = `%${escapeLike(q)}%`;\n  const prefix = `${escapeLike(q)}%`;\n  const rows = all(RANKED, [prefix, like, like, like, like, like, like]);\n  resultsEl.replaceChildren(...rows.map((r) => {\n    const li = document.createElement('li');\n    li.textContent = `${r.name} (${r.real_name})`;\n    const why = document.createElement('span');\n    why.className = `why b${r.bucket}`;\n    why.textContent = r.bucket < 2 ? REASON[r.bucket] : `matched power: ${r.power}`;\n    li.append(why);\n    return li;\n  }));\n  statusEl.textContent = rows.length ? `${rows.length} found, best first` : `Nothing matches \"${q}\".`;\n}"
   }
  }
 ],
 "finish": "Your searches put the right answer on top now. You learned:\n\n- **LIKE** with `%` wildcards, through **parameters**, and **escaping** `%` and `_`\n- A **correlated EXISTS** subquery to search through a link table, once per result\n- **ORDER BY CASE** buckets, then name, with **LIMIT**\n- Returning the bucket so the page can **explain each match**\n\nYou've now learned every part of the **Marvel Character Database**: SQL, link tables and ranked search. Build it next.\n\n### Challenges\n\n1. Add a bucket for an exact match (\"Thor\" typed exactly) above \"starts with\".\n2. Search teams too, with a second EXISTS through a members link table.\n3. Debounce the search (the Saving data safely lesson) so it runs 150 ms after typing stops.\n\n### Next\n\nThe **Marvel Character Database** project."
};
