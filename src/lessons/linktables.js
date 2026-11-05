// Built from guides/linktables.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "linktables",
 "title": "Link tables (many-to-many)",
 "goals": [
  "Tell one-to-many and many-to-many relationships apart",
  "Store a many-to-many relationship in a link table with two foreign keys",
  "Stop duplicates with a primary key made of both columns",
  "Join through the link table both ways, and list names with GROUP_CONCAT",
  "Count with LEFT JOIN so empty groups still show up"
 ],
 "prereqs": [
  "The SQL basics lesson (tables, INSERT with parameters, SELECT, WHERE and a JOIN)"
 ],
 "sessions": [
  {
   "title": "Who belongs where",
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
   "schema": "",
   "joins": "",
   "edit": ""
  }
 },
 "steps": [
  {
   "title": "When both sides have many",
   "body": "In the SQL basics lesson each book had **one** country, so the book table had a `country_id` column. That's **one-to-many**: one country, many books.\n\nHeroes and teams are different. Wolverine is in the X-Men *and* the Avengers; the Avengers have many members. That's **many-to-many**, and one column can't hold it: a `team_id` column on characters can only hold one team.\n\nThe answer is a third table, a **link table** (also called a join or junction table), where each row says \"this character is in this team\":\n\n```svg A link table sits between characters and teams; each of its rows joins one character to one team\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 150\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"20\" width=\"95\" height=\"110\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"52\" y=\"38\" text-anchor=\"middle\" font-weight=\"700\">characters</text>\n  <text x=\"15\" y=\"60\">1 Wolverine</text><text x=\"15\" y=\"80\">2 Storm</text><text x=\"15\" y=\"100\">3 Captain America</text>\n  <rect x=\"120\" y=\"20\" width=\"90\" height=\"110\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"165\" y=\"38\" text-anchor=\"middle\" font-weight=\"700\">members</text>\n  <text x=\"135\" y=\"60\">1 → 10</text><text x=\"135\" y=\"80\">1 → 11</text><text x=\"135\" y=\"100\">2 → 10</text><text x=\"135\" y=\"120\">3 → 11</text>\n  <rect x=\"230\" y=\"20\" width=\"95\" height=\"110\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"277\" y=\"38\" text-anchor=\"middle\" font-weight=\"700\">teams</text>\n  <text x=\"240\" y=\"60\">10 X-Men</text><text x=\"240\" y=\"80\">11 Avengers</text>\n  <path d=\"M100 58 L132 57 M100 78 L132 77 M100 98 L132 97\" stroke=\"#dc2626\"/><path d=\"M180 57 L238 57 M180 77 L238 77 M180 97 L238 57 M180 117 L238 77\" stroke=\"#2563eb\"/>\n</svg>\n```\n\n- Each row has two **foreign keys**: `character_id` points at a character, `team_id` at a team.\n- The **primary key is both columns together**, so the same character can't be added to the same team twice.\n- To find a character's teams, or a team's members, you **join through** the link table.\n\nThe Marvel Character Database uses link tables for teams, powers and MCU appearances, and for relationships between characters.",
   "session": 0,
   "minutes": 12,
   "kind": "read"
  },
  {
   "title": "Three tables and a two-column key",
   "body": "The schema creates the three tables. The link table:\n\n```sql\nCREATE TABLE members (\n  character_id INTEGER NOT NULL REFERENCES characters(id),\n  team_id INTEGER NOT NULL REFERENCES teams(id),\n  PRIMARY KEY (character_id, team_id)\n);\n```\n\nRows go in with `?` placeholders, the safe way from the SQL lesson: the values are sent separately from the SQL text, so a name with a quote in it (or anything worse) can never change the query.\n\nThe page loads sql.js, runs the schema, inserts the sample data, and shows each table.",
   "checks": [
    {
     "pane": "html",
     "label": "sql.js from the CDN",
     "test": "/sql-wasm\\.js/",
     "hint": "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js\"></script>"
    },
    {
     "pane": "js",
     "label": "the link table",
     "test": "/CREATE\\s+TABLE\\s+members/i",
     "hint": "CREATE TABLE members ( ... )"
    },
    {
     "pane": "js",
     "label": "a primary key made of both columns",
     "test": "/PRIMARY\\s+KEY\\s*\\(\\s*character_id\\s*,\\s*team_id\\s*\\)/i",
     "hint": "PRIMARY KEY (character_id, team_id)"
    }
   ],
   "quiz": [
    {
     "q": "Why can't characters just have a `team_id` column?",
     "options": [
      "One column holds one team, but a character can be in several teams",
      "SQL doesn't allow numbers in columns",
      "Teams would need a character_id column instead"
     ],
     "answer": 0,
     "why": "Many-to-many needs a row per pairing, which is exactly what the link table holds."
    },
    {
     "q": "What does `PRIMARY KEY (character_id, team_id)` prevent?",
     "options": [
      "A character being in more than one team",
      "The same character being added to the same team twice",
      "Teams having more than one member"
     ],
     "answer": 1,
     "why": "The pair must be unique; each column on its own can repeat."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js\"></script>\n<main class=\"wrap\">\n  <h1>Teams</h1>\n  <p id=\"status\" class=\"muted\">Loading the database…</p>\n  <div id=\"tables\" class=\"tables\"></div>\n  <section id=\"views\"></section>\n  <pre id=\"lastSql\" class=\"sql\"></pre>\n</main>"
   },
   "css": {
    "base": "body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }\n.wrap { max-width: 760px; margin: 0 auto; padding: 16px; }\nh1 { margin-top: 0; color: #fca5a5; }\n.muted { color: #94a3b8; }\n.tables { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }\ntable { width: 100%; border-collapse: collapse; font-size: .85rem; background: #1e293b; border-radius: 8px; overflow: hidden; }\ncaption { text-align: left; font-weight: 700; padding: 4px 0; color: #fde68a; }\nth, td { text-align: left; padding: 4px 8px; border-bottom: 1px solid #334155; }\nselect, button { font: inherit; padding: 4px 8px; margin: 4px 4px 4px 0; }\n.sql { white-space: pre-wrap; font-size: .75rem; color: #93c5fd; background: #020617; padding: 8px; border-radius: 8px; }\n.row { margin: 10px 0; }"
   },
   "js": {
    "db": "const statusEl = document.getElementById('status');\nconst lastSql = document.getElementById('lastSql');\nlet db = null;\n\n/** Runs a SELECT with parameters and returns rows as objects. */\nfunction all(sql, params = []) {\n  lastSql.textContent = sql.trim();\n  const stmt = db.prepare(sql);\n  stmt.bind(params);\n  const rows = [];\n  while (stmt.step()) rows.push(stmt.getAsObject());\n  stmt.free();\n  return rows;\n}\n\nfunction tableHtml(caption, rows) {\n  if (!rows.length) return `<table><caption>${caption}</caption><tr><td>(empty)</td></tr></table>`;\n  const cols = Object.keys(rows[0]);\n  const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));\n  return `<table><caption>${caption}</caption><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>${rows.map((r) => `<tr>${cols.map((c) => `<td>${esc(r[c])}</td>`).join('')}</tr>`).join('')}</table>`;\n}",
    "schema": "const SCHEMA = `\nCREATE TABLE characters (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE teams (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE members (\n  character_id INTEGER NOT NULL REFERENCES characters(id),\n  team_id INTEGER NOT NULL REFERENCES teams(id),\n  PRIMARY KEY (character_id, team_id)\n);`;\n\nconst CHARACTERS = [[1, 'Wolverine'], [2, 'Storm'], [3, 'Captain America'], [4, 'Spider-Man'], [5, 'Jean Grey']];\nconst TEAMS = [[10, 'X-Men'], [11, 'Avengers'], [12, 'Fantastic Four']];\nconst MEMBERS = [[1, 10], [1, 11], [2, 10], [3, 11], [4, 11], [5, 10]];\n\nfunction showTables() {\n  document.getElementById('tables').innerHTML = [\n    tableHtml('characters', all('SELECT * FROM characters')),\n    tableHtml('teams', all('SELECT * FROM teams')),\n    tableHtml('members', all('SELECT * FROM members')),\n  ].join('');\n}\n\ninitSqlJs({ locateFile: (f) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}` }).then((SQL) => {\n  db = new SQL.Database();\n  db.run(SCHEMA);\n  for (const row of CHARACTERS) db.run('INSERT INTO characters (id, name) VALUES (?, ?)', row);\n  for (const row of TEAMS) db.run('INSERT INTO teams (id, name) VALUES (?, ?)', row);\n  for (const row of MEMBERS) db.run('INSERT INTO members (character_id, team_id) VALUES (?, ?)', row);\n  statusEl.textContent = 'Database ready.';\n  showTables();\n  if (typeof ready === 'function') ready();\n}).catch(() => { statusEl.textContent = 'Couldn\\'t load the database engine. Check your connection.'; });"
   }
  },
  {
   "title": "Joining through the link table",
   "body": "To list a team's members, start at the team, go **through** `members`, and arrive at the characters:\n\n```sql\nSELECT c.name\nFROM teams t\nJOIN members m ON m.team_id = t.id\nJOIN characters c ON c.id = m.character_id\nWHERE t.name = ?\nORDER BY c.name;\n```\n\nGoing the other way (a character's teams) is the same two joins, starting from the character.\n\n`GROUP_CONCAT` folds many rows into one: `GROUP_CONCAT(c.name, ', ')` with `GROUP BY t.id` gives each team on one line with all its members, which is how the Marvel database shows \"Teams: X-Men, Avengers\" on a card.\n\n```svg Two joins walk from a team, through its rows in members, to each character\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 80\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"22\" width=\"80\" height=\"34\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"45\" y=\"43\" text-anchor=\"middle\">teams</text>\n  <rect x=\"125\" y=\"22\" width=\"80\" height=\"34\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"165\" y=\"43\" text-anchor=\"middle\">members</text>\n  <rect x=\"245\" y=\"22\" width=\"80\" height=\"34\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"285\" y=\"43\" text-anchor=\"middle\">characters</text>\n  <path d=\"M85 39 H121 M205 39 H241\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"103\" y=\"72\" text-anchor=\"middle\">team_id</text><text x=\"223\" y=\"72\" text-anchor=\"middle\">character_id</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "joining through members",
     "test": "/JOIN\\s+members\\s+m\\s+ON\\s+m\\.team_id\\s*=\\s*t\\.id/i",
     "hint": "JOIN members m ON m.team_id = t.id"
    },
    {
     "pane": "js",
     "label": "many names on one line",
     "test": "/GROUP_CONCAT\\(/i",
     "hint": "GROUP_CONCAT(c.name, ', ')"
    },
    {
     "pane": "js",
     "label": "a parameter for the chosen team",
     "test": "/WHERE\\s+t\\.name\\s*=\\s*\\?/i",
     "hint": "WHERE t.name = ?"
    }
   ],
   "quiz": [
    {
     "q": "How many JOINs does it take to go from a team to its members' names?",
     "options": [
      "One",
      "Two: teams to members, then members to characters",
      "Three"
     ],
     "answer": 1,
     "why": "The link table is in the middle, so you join to it and then through it."
    },
    {
     "q": "What does `GROUP_CONCAT(c.name, ', ')` with `GROUP BY t.id` give?",
     "options": [
      "One row per team, with all its members' names joined by commas",
      "One row per member",
      "The number of members"
     ],
     "answer": 0,
     "why": "GROUP BY makes one group per team, and GROUP_CONCAT joins the names in each group."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "joins": "const MEMBERS_OF = `\nSELECT c.name AS member\nFROM teams t\nJOIN members m ON m.team_id = t.id\nJOIN characters c ON c.id = m.character_id\nWHERE t.name = ?\nORDER BY c.name`;\n\nconst TEAMS_OF = `\nSELECT t.name AS team\nFROM characters c\nJOIN members m ON m.character_id = c.id\nJOIN teams t ON t.id = m.team_id\nWHERE c.name = ?\nORDER BY t.name`;\n\nconst ROSTER = `\nSELECT t.name AS team, GROUP_CONCAT(c.name, ', ') AS members\nFROM teams t\nJOIN members m ON m.team_id = t.id\nJOIN characters c ON c.id = m.character_id\nGROUP BY t.id\nORDER BY t.name`;\n\nconst views = document.getElementById('views');\n\nfunction ready() {\n  const chars = all('SELECT name FROM characters ORDER BY name').map((r) => r.name);\n  const teams = all('SELECT name FROM teams ORDER BY name').map((r) => r.name);\n  views.innerHTML = `\n    <div class=\"row\"><label>Team <select id=\"team\">${teams.map((t) => `<option>${t}</option>`).join('')}</select></label> <span id=\"teamOut\"></span></div>\n    <div class=\"row\"><label>Character <select id=\"char\">${chars.map((c) => `<option>${c}</option>`).join('')}</select></label> <span id=\"charOut\"></span></div>\n    <div id=\"roster\"></div>`;\n  const showTeam = () => { document.getElementById('teamOut').textContent = all(MEMBERS_OF, [document.getElementById('team').value]).map((r) => r.member).join(', ') || 'no members'; };\n  const showChar = () => { document.getElementById('charOut').textContent = all(TEAMS_OF, [document.getElementById('char').value]).map((r) => r.team).join(', ') || 'no teams'; };\n  document.getElementById('team').addEventListener('change', showTeam);\n  document.getElementById('char').addEventListener('change', showChar);\n  showTeam();\n  showChar();\n  document.getElementById('roster').innerHTML = tableHtml('every team, one row each', all(ROSTER));\n}"
   }
  },
  {
   "title": "Joining, leaving, and counting with LEFT JOIN",
   "body": "Changing who's in a team means adding or deleting **link rows**; the characters and teams themselves don't change.\n\n- **Join a team**: `INSERT OR IGNORE INTO members VALUES (?, ?)`. Thanks to the two-column primary key, adding someone who's already a member is simply ignored instead of creating a duplicate.\n- **Leave a team**: `DELETE FROM members WHERE character_id = ? AND team_id = ?`.\n\nCounting members has one trap. The Fantastic Four has no members in the sample data, and a plain `JOIN` drops teams with no matching rows, so it vanishes from the count. A **LEFT JOIN** keeps every team, with `NULL` where nothing matched, and `COUNT(m.character_id)` counts only real members, so the Fantastic Four shows 0.\n\n```svg JOIN keeps only teams with members; LEFT JOIN keeps every team and counts 0 for the empty one\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"11\">\n  <text x=\"10\" y=\"16\" font-weight=\"700\">JOIN</text><text x=\"10\" y=\"36\">X-Men 3 · Avengers 3</text>\n  <text x=\"180\" y=\"16\" font-weight=\"700\">LEFT JOIN</text><text x=\"180\" y=\"36\">X-Men 3 · Avengers 3</text><text x=\"180\" y=\"56\" fill=\"#15803d\">Fantastic Four 0</text>\n  <text x=\"10\" y=\"56\" fill=\"#b91c1c\">Fantastic Four: missing</text>\n  <text x=\"165\" y=\"90\" text-anchor=\"middle\" fill=\"#475569\">COUNT(m.character_id) counts real rows, not NULLs</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "adding without duplicates",
     "test": "/INSERT\\s+OR\\s+IGNORE\\s+INTO\\s+members/i",
     "hint": "INSERT OR IGNORE INTO members (character_id, team_id) VALUES (?, ?)"
    },
    {
     "pane": "js",
     "label": "removing one link",
     "test": "/DELETE\\s+FROM\\s+members\\s+WHERE/i",
     "hint": "DELETE FROM members WHERE character_id = ? AND team_id = ?"
    },
    {
     "pane": "js",
     "label": "counting with LEFT JOIN",
     "test": "/LEFT\\s+JOIN\\s+members/i",
     "hint": "LEFT JOIN members m ON m.team_id = t.id"
    }
   ],
   "quiz": [
    {
     "q": "Why does a plain JOIN leave the Fantastic Four out of the member count?",
     "options": [
      "They have too many members",
      "JOIN only keeps teams that have matching rows in members, and they have none",
      "COUNT can't count to zero"
     ],
     "answer": 1,
     "why": "LEFT JOIN keeps every row of the left table, even with no match."
    },
    {
     "q": "Wolverine is already in the X-Men. What does `INSERT OR IGNORE` do when you add him again?",
     "options": [
      "Nothing: the primary key makes it a duplicate, so the insert is ignored",
      "Adds a second row",
      "Shows an error and stops the page"
     ],
     "answer": 0,
     "why": "OR IGNORE skips rows that would break a uniqueness rule."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "joins": "const MEMBERS_OF = `\nSELECT c.name AS member\nFROM teams t\nJOIN members m ON m.team_id = t.id\nJOIN characters c ON c.id = m.character_id\nWHERE t.name = ?\nORDER BY c.name`;\n\nconst TEAMS_OF = `\nSELECT t.name AS team\nFROM characters c\nJOIN members m ON m.character_id = c.id\nJOIN teams t ON t.id = m.team_id\nWHERE c.name = ?\nORDER BY t.name`;\n\nconst ROSTER = `\nSELECT t.name AS team, GROUP_CONCAT(c.name, ', ') AS members\nFROM teams t\nJOIN members m ON m.team_id = t.id\nJOIN characters c ON c.id = m.character_id\nGROUP BY t.id\nORDER BY t.name`;\n\nconst views = document.getElementById('views');\n\nfunction ready() {\n  const chars = all('SELECT name FROM characters ORDER BY name').map((r) => r.name);\n  const teams = all('SELECT name FROM teams ORDER BY name').map((r) => r.name);\n  views.innerHTML = `\n    <div class=\"row\"><label>Team <select id=\"team\">${teams.map((t) => `<option>${t}</option>`).join('')}</select></label> <span id=\"teamOut\"></span></div>\n    <div class=\"row\"><label>Character <select id=\"char\">${chars.map((c) => `<option>${c}</option>`).join('')}</select></label> <span id=\"charOut\"></span></div>\n    <div id=\"roster\"></div>`;\n  const showTeam = () => { document.getElementById('teamOut').textContent = all(MEMBERS_OF, [document.getElementById('team').value]).map((r) => r.member).join(', ') || 'no members'; };\n  const showChar = () => { document.getElementById('charOut').textContent = all(TEAMS_OF, [document.getElementById('char').value]).map((r) => r.team).join(', ') || 'no teams'; };\n  document.getElementById('team').addEventListener('change', showTeam);\n  document.getElementById('char').addEventListener('change', showChar);\n  showTeam();\n  showChar();\n  document.getElementById('roster').innerHTML = tableHtml('every team, one row each', all(ROSTER));\n  setupEdit();\n}",
    "edit": "const COUNTS = `\nSELECT t.name AS team, COUNT(m.character_id) AS members\nFROM teams t\nLEFT JOIN members m ON m.team_id = t.id\nGROUP BY t.id\nORDER BY t.name`;\n\nconst idOf = (table, name) => all(`SELECT id FROM ${table} WHERE name = ?`, [name])[0]?.id;\n\nfunction refresh() {\n  showTables();\n  document.getElementById('counts').innerHTML = tableHtml('members per team (LEFT JOIN)', all(COUNTS));\n  document.getElementById('team').dispatchEvent(new Event('change'));\n  document.getElementById('char').dispatchEvent(new Event('change'));\n}\n\nfunction setupEdit() {\n  views.insertAdjacentHTML('beforeend', '<div class=\"row\"><button id=\"join\">Add the character to the team</button><button id=\"leave\">Remove them</button></div><div id=\"counts\"></div>');\n  const pair = () => [idOf('characters', document.getElementById('char').value), idOf('teams', document.getElementById('team').value)];\n  document.getElementById('join').addEventListener('click', () => {\n    db.run('INSERT OR IGNORE INTO members (character_id, team_id) VALUES (?, ?)', pair());\n    refresh();\n  });\n  document.getElementById('leave').addEventListener('click', () => {\n    db.run('DELETE FROM members WHERE character_id = ? AND team_id = ?', pair());\n    refresh();\n  });\n  refresh();\n}"
   }
  }
 ],
 "finish": "You can store and query many-to-many data now. You learned:\n\n- **One-to-many** fits in a column; **many-to-many** needs a **link table**\n- Two **foreign keys** and a **two-column primary key** that stops duplicates\n- **Joining through** the link table, both ways, and **GROUP_CONCAT**\n- `INSERT OR IGNORE` and `DELETE` to change memberships\n- **LEFT JOIN** with `COUNT(column)` so empty groups show 0\n\n### Challenges\n\n1. Add a `role` column to members (\"leader\", \"member\") and show leaders first.\n2. Add a powers table and a character_powers link table, then find characters who share a power.\n3. Find characters in both the X-Men and the Avengers with two joins to members (or `GROUP BY ... HAVING COUNT(*) = 2`).\n\n### Next\n\n**Ranked search**: find characters by name, power or team, with the best matches first."
};
