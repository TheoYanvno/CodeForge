---
id: linktables
title: Link tables (many-to-many)
blocks-html: page
blocks-css: base
blocks-js: db, schema, joins, edit
goals: Tell one-to-many and many-to-many relationships apart; Store a many-to-many relationship in a link table with two foreign keys; Stop duplicates with a primary key made of both columns; Join through the link table both ways, and list names with GROUP_CONCAT; Count with LEFT JOIN so empty groups still show up
prereqs: The SQL basics lesson (tables, INSERT with parameters, SELECT, WHERE and a JOIN)
---

## Session: Who belongs where

## Step: When both sides have many
time: 12
kind: read

In the SQL basics lesson each book had **one** country, so the book table had a `country_id` column. That's **one-to-many**: one country, many books.

Heroes and teams are different. Wolverine is in the X-Men *and* the Avengers; the Avengers have many members. That's **many-to-many**, and one column can't hold it: a `team_id` column on characters can only hold one team.

The answer is a third table, a **link table** (also called a join or junction table), where each row says "this character is in this team":

```svg A link table sits between characters and teams; each of its rows joins one character to one team
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 150" font-family="sans-serif" font-size="11">
  <rect x="5" y="20" width="95" height="110" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="52" y="38" text-anchor="middle" font-weight="700">characters</text>
  <text x="15" y="60">1 Wolverine</text><text x="15" y="80">2 Storm</text><text x="15" y="100">3 Captain America</text>
  <rect x="120" y="20" width="90" height="110" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="165" y="38" text-anchor="middle" font-weight="700">members</text>
  <text x="135" y="60">1 → 10</text><text x="135" y="80">1 → 11</text><text x="135" y="100">2 → 10</text><text x="135" y="120">3 → 11</text>
  <rect x="230" y="20" width="95" height="110" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="277" y="38" text-anchor="middle" font-weight="700">teams</text>
  <text x="240" y="60">10 X-Men</text><text x="240" y="80">11 Avengers</text>
  <path d="M100 58 L132 57 M100 78 L132 77 M100 98 L132 97" stroke="#dc2626"/><path d="M180 57 L238 57 M180 77 L238 77 M180 97 L238 57 M180 117 L238 77" stroke="#2563eb"/>
</svg>
```

- Each row has two **foreign keys**: `character_id` points at a character, `team_id` at a team.
- The **primary key is both columns together**, so the same character can't be added to the same team twice.
- To find a character's teams, or a team's members, you **join through** the link table.

The Marvel Character Database uses link tables for teams, powers and MCU appearances, and for relationships between characters.

## Step: Three tables and a two-column key
time: 15

The schema creates the three tables. The link table:

```sql
CREATE TABLE members (
  character_id INTEGER NOT NULL REFERENCES characters(id),
  team_id INTEGER NOT NULL REFERENCES teams(id),
  PRIMARY KEY (character_id, team_id)
);
```

Rows go in with `?` placeholders, the safe way from the SQL lesson: the values are sent separately from the SQL text, so a name with a quote in it (or anything worse) can never change the query.

The page loads sql.js, runs the schema, inserts the sample data, and shows each table.

check: html | sql.js from the CDN | /sql-wasm\.js/ | <script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
check: js | the link table | /CREATE\s+TABLE\s+members/i | CREATE TABLE members ( ... )
check: js | a primary key made of both columns | /PRIMARY\s+KEY\s*\(\s*character_id\s*,\s*team_id\s*\)/i | PRIMARY KEY (character_id, team_id)

quiz: Why can't characters just have a `team_id` column?
- [x] One column holds one team, but a character can be in several teams
- [ ] SQL doesn't allow numbers in columns
- [ ] Teams would need a character_id column instead
why: Many-to-many needs a row per pairing, which is exactly what the link table holds.

quiz: What does `PRIMARY KEY (character_id, team_id)` prevent?
- [ ] A character being in more than one team
- [x] The same character being added to the same team twice
- [ ] Teams having more than one member
why: The pair must be unique; each column on its own can repeat.

```html page
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js"></script>
<main class="wrap">
  <h1>Teams</h1>
  <p id="status" class="muted">Loading the database…</p>
  <div id="tables" class="tables"></div>
  <section id="views"></section>
  <pre id="lastSql" class="sql"></pre>
</main>
```

```css base
body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
.wrap { max-width: 760px; margin: 0 auto; padding: 16px; }
h1 { margin-top: 0; color: #fca5a5; }
.muted { color: #94a3b8; }
.tables { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
table { width: 100%; border-collapse: collapse; font-size: .85rem; background: #1e293b; border-radius: 8px; overflow: hidden; }
caption { text-align: left; font-weight: 700; padding: 4px 0; color: #fde68a; }
th, td { text-align: left; padding: 4px 8px; border-bottom: 1px solid #334155; }
select, button { font: inherit; padding: 4px 8px; margin: 4px 4px 4px 0; }
.sql { white-space: pre-wrap; font-size: .75rem; color: #93c5fd; background: #020617; padding: 8px; border-radius: 8px; }
.row { margin: 10px 0; }
```

```js db
const statusEl = document.getElementById('status');
const lastSql = document.getElementById('lastSql');
let db = null;

/** Runs a SELECT with parameters and returns rows as objects. */
function all(sql, params = []) {
  lastSql.textContent = sql.trim();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function tableHtml(caption, rows) {
  if (!rows.length) return `<table><caption>${caption}</caption><tr><td>(empty)</td></tr></table>`;
  const cols = Object.keys(rows[0]);
  const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  return `<table><caption>${caption}</caption><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>${rows.map((r) => `<tr>${cols.map((c) => `<td>${esc(r[c])}</td>`).join('')}</tr>`).join('')}</table>`;
}
```

```js schema
const SCHEMA = `
CREATE TABLE characters (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE teams (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE members (
  character_id INTEGER NOT NULL REFERENCES characters(id),
  team_id INTEGER NOT NULL REFERENCES teams(id),
  PRIMARY KEY (character_id, team_id)
);`;

const CHARACTERS = [[1, 'Wolverine'], [2, 'Storm'], [3, 'Captain America'], [4, 'Spider-Man'], [5, 'Jean Grey']];
const TEAMS = [[10, 'X-Men'], [11, 'Avengers'], [12, 'Fantastic Four']];
const MEMBERS = [[1, 10], [1, 11], [2, 10], [3, 11], [4, 11], [5, 10]];

function showTables() {
  document.getElementById('tables').innerHTML = [
    tableHtml('characters', all('SELECT * FROM characters')),
    tableHtml('teams', all('SELECT * FROM teams')),
    tableHtml('members', all('SELECT * FROM members')),
  ].join('');
}

initSqlJs({ locateFile: (f) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}` }).then((SQL) => {
  db = new SQL.Database();
  db.run(SCHEMA);
  for (const row of CHARACTERS) db.run('INSERT INTO characters (id, name) VALUES (?, ?)', row);
  for (const row of TEAMS) db.run('INSERT INTO teams (id, name) VALUES (?, ?)', row);
  for (const row of MEMBERS) db.run('INSERT INTO members (character_id, team_id) VALUES (?, ?)', row);
  statusEl.textContent = 'Database ready.';
  showTables();
  if (typeof ready === 'function') ready();
}).catch(() => { statusEl.textContent = 'Couldn\'t load the database engine. Check your connection.'; });
```

## Step: Joining through the link table
time: 15

To list a team's members, start at the team, go **through** `members`, and arrive at the characters:

```sql
SELECT c.name
FROM teams t
JOIN members m ON m.team_id = t.id
JOIN characters c ON c.id = m.character_id
WHERE t.name = ?
ORDER BY c.name;
```

Going the other way (a character's teams) is the same two joins, starting from the character.

`GROUP_CONCAT` folds many rows into one: `GROUP_CONCAT(c.name, ', ')` with `GROUP BY t.id` gives each team on one line with all its members, which is how the Marvel database shows "Teams: X-Men, Avengers" on a card.

```svg Two joins walk from a team, through its rows in members, to each character
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 80" font-family="sans-serif" font-size="11">
  <rect x="5" y="22" width="80" height="34" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="45" y="43" text-anchor="middle">teams</text>
  <rect x="125" y="22" width="80" height="34" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="165" y="43" text-anchor="middle">members</text>
  <rect x="245" y="22" width="80" height="34" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="285" y="43" text-anchor="middle">characters</text>
  <path d="M85 39 H121 M205 39 H241" stroke="#111" stroke-width="2"/>
  <text x="103" y="72" text-anchor="middle">team_id</text><text x="223" y="72" text-anchor="middle">character_id</text>
</svg>
```

check: js | joining through members | /JOIN\s+members\s+m\s+ON\s+m\.team_id\s*=\s*t\.id/i | JOIN members m ON m.team_id = t.id
check: js | many names on one line | /GROUP_CONCAT\(/i | GROUP_CONCAT(c.name, ', ')
check: js | a parameter for the chosen team | /WHERE\s+t\.name\s*=\s*\?/i | WHERE t.name = ?

quiz: How many JOINs does it take to go from a team to its members' names?
- [ ] One
- [x] Two: teams to members, then members to characters
- [ ] Three
why: The link table is in the middle, so you join to it and then through it.

quiz: What does `GROUP_CONCAT(c.name, ', ')` with `GROUP BY t.id` give?
- [x] One row per team, with all its members' names joined by commas
- [ ] One row per member
- [ ] The number of members
why: GROUP BY makes one group per team, and GROUP_CONCAT joins the names in each group.

```js joins
const MEMBERS_OF = `
SELECT c.name AS member
FROM teams t
JOIN members m ON m.team_id = t.id
JOIN characters c ON c.id = m.character_id
WHERE t.name = ?
ORDER BY c.name`;

const TEAMS_OF = `
SELECT t.name AS team
FROM characters c
JOIN members m ON m.character_id = c.id
JOIN teams t ON t.id = m.team_id
WHERE c.name = ?
ORDER BY t.name`;

const ROSTER = `
SELECT t.name AS team, GROUP_CONCAT(c.name, ', ') AS members
FROM teams t
JOIN members m ON m.team_id = t.id
JOIN characters c ON c.id = m.character_id
GROUP BY t.id
ORDER BY t.name`;

const views = document.getElementById('views');

function ready() {
  const chars = all('SELECT name FROM characters ORDER BY name').map((r) => r.name);
  const teams = all('SELECT name FROM teams ORDER BY name').map((r) => r.name);
  views.innerHTML = `
    <div class="row"><label>Team <select id="team">${teams.map((t) => `<option>${t}</option>`).join('')}</select></label> <span id="teamOut"></span></div>
    <div class="row"><label>Character <select id="char">${chars.map((c) => `<option>${c}</option>`).join('')}</select></label> <span id="charOut"></span></div>
    <div id="roster"></div>`;
  const showTeam = () => { document.getElementById('teamOut').textContent = all(MEMBERS_OF, [document.getElementById('team').value]).map((r) => r.member).join(', ') || 'no members'; };
  const showChar = () => { document.getElementById('charOut').textContent = all(TEAMS_OF, [document.getElementById('char').value]).map((r) => r.team).join(', ') || 'no teams'; };
  document.getElementById('team').addEventListener('change', showTeam);
  document.getElementById('char').addEventListener('change', showChar);
  showTeam();
  showChar();
  document.getElementById('roster').innerHTML = tableHtml('every team, one row each', all(ROSTER));
}
```

## Step: Joining, leaving, and counting with LEFT JOIN
time: 15

Changing who's in a team means adding or deleting **link rows**; the characters and teams themselves don't change.

- **Join a team**: `INSERT OR IGNORE INTO members VALUES (?, ?)`. Thanks to the two-column primary key, adding someone who's already a member is simply ignored instead of creating a duplicate.
- **Leave a team**: `DELETE FROM members WHERE character_id = ? AND team_id = ?`.

Counting members has one trap. The Fantastic Four has no members in the sample data, and a plain `JOIN` drops teams with no matching rows, so it vanishes from the count. A **LEFT JOIN** keeps every team, with `NULL` where nothing matched, and `COUNT(m.character_id)` counts only real members, so the Fantastic Four shows 0.

```svg JOIN keeps only teams with members; LEFT JOIN keeps every team and counts 0 for the empty one
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="11">
  <text x="10" y="16" font-weight="700">JOIN</text><text x="10" y="36">X-Men 3 · Avengers 3</text>
  <text x="180" y="16" font-weight="700">LEFT JOIN</text><text x="180" y="36">X-Men 3 · Avengers 3</text><text x="180" y="56" fill="#15803d">Fantastic Four 0</text>
  <text x="10" y="56" fill="#b91c1c">Fantastic Four: missing</text>
  <text x="165" y="90" text-anchor="middle" fill="#475569">COUNT(m.character_id) counts real rows, not NULLs</text>
</svg>
```

check: js | adding without duplicates | /INSERT\s+OR\s+IGNORE\s+INTO\s+members/i | INSERT OR IGNORE INTO members (character_id, team_id) VALUES (?, ?)
check: js | removing one link | /DELETE\s+FROM\s+members\s+WHERE/i | DELETE FROM members WHERE character_id = ? AND team_id = ?
check: js | counting with LEFT JOIN | /LEFT\s+JOIN\s+members/i | LEFT JOIN members m ON m.team_id = t.id

quiz: Why does a plain JOIN leave the Fantastic Four out of the member count?
- [ ] They have too many members
- [x] JOIN only keeps teams that have matching rows in members, and they have none
- [ ] COUNT can't count to zero
why: LEFT JOIN keeps every row of the left table, even with no match.

quiz: Wolverine is already in the X-Men. What does `INSERT OR IGNORE` do when you add him again?
- [x] Nothing: the primary key makes it a duplicate, so the insert is ignored
- [ ] Adds a second row
- [ ] Shows an error and stops the page
why: OR IGNORE skips rows that would break a uniqueness rule.

```js joins
const MEMBERS_OF = `
SELECT c.name AS member
FROM teams t
JOIN members m ON m.team_id = t.id
JOIN characters c ON c.id = m.character_id
WHERE t.name = ?
ORDER BY c.name`;

const TEAMS_OF = `
SELECT t.name AS team
FROM characters c
JOIN members m ON m.character_id = c.id
JOIN teams t ON t.id = m.team_id
WHERE c.name = ?
ORDER BY t.name`;

const ROSTER = `
SELECT t.name AS team, GROUP_CONCAT(c.name, ', ') AS members
FROM teams t
JOIN members m ON m.team_id = t.id
JOIN characters c ON c.id = m.character_id
GROUP BY t.id
ORDER BY t.name`;

const views = document.getElementById('views');

function ready() {
  const chars = all('SELECT name FROM characters ORDER BY name').map((r) => r.name);
  const teams = all('SELECT name FROM teams ORDER BY name').map((r) => r.name);
  views.innerHTML = `
    <div class="row"><label>Team <select id="team">${teams.map((t) => `<option>${t}</option>`).join('')}</select></label> <span id="teamOut"></span></div>
    <div class="row"><label>Character <select id="char">${chars.map((c) => `<option>${c}</option>`).join('')}</select></label> <span id="charOut"></span></div>
    <div id="roster"></div>`;
  const showTeam = () => { document.getElementById('teamOut').textContent = all(MEMBERS_OF, [document.getElementById('team').value]).map((r) => r.member).join(', ') || 'no members'; };
  const showChar = () => { document.getElementById('charOut').textContent = all(TEAMS_OF, [document.getElementById('char').value]).map((r) => r.team).join(', ') || 'no teams'; };
  document.getElementById('team').addEventListener('change', showTeam);
  document.getElementById('char').addEventListener('change', showChar);
  showTeam();
  showChar();
  document.getElementById('roster').innerHTML = tableHtml('every team, one row each', all(ROSTER));
  setupEdit();
}
```

```js edit
const COUNTS = `
SELECT t.name AS team, COUNT(m.character_id) AS members
FROM teams t
LEFT JOIN members m ON m.team_id = t.id
GROUP BY t.id
ORDER BY t.name`;

const idOf = (table, name) => all(`SELECT id FROM ${table} WHERE name = ?`, [name])[0]?.id;

function refresh() {
  showTables();
  document.getElementById('counts').innerHTML = tableHtml('members per team (LEFT JOIN)', all(COUNTS));
  document.getElementById('team').dispatchEvent(new Event('change'));
  document.getElementById('char').dispatchEvent(new Event('change'));
}

function setupEdit() {
  views.insertAdjacentHTML('beforeend', '<div class="row"><button id="join">Add the character to the team</button><button id="leave">Remove them</button></div><div id="counts"></div>');
  const pair = () => [idOf('characters', document.getElementById('char').value), idOf('teams', document.getElementById('team').value)];
  document.getElementById('join').addEventListener('click', () => {
    db.run('INSERT OR IGNORE INTO members (character_id, team_id) VALUES (?, ?)', pair());
    refresh();
  });
  document.getElementById('leave').addEventListener('click', () => {
    db.run('DELETE FROM members WHERE character_id = ? AND team_id = ?', pair());
    refresh();
  });
  refresh();
}
```

## Finish

You can store and query many-to-many data now. You learned:

- **One-to-many** fits in a column; **many-to-many** needs a **link table**
- Two **foreign keys** and a **two-column primary key** that stops duplicates
- **Joining through** the link table, both ways, and **GROUP_CONCAT**
- `INSERT OR IGNORE` and `DELETE` to change memberships
- **LEFT JOIN** with `COUNT(column)` so empty groups show 0

### Challenges

1. Add a `role` column to members ("leader", "member") and show leaders first.
2. Add a powers table and a character_powers link table, then find characters who share a power.
3. Find characters in both the X-Men and the Avengers with two joins to members (or `GROUP BY ... HAVING COUNT(*) = 2`).

### Next

**Ranked search**: find characters by name, power or team, with the best matches first.
