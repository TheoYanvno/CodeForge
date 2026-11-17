// Built from guides/safecsv.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "safecsv",
 "title": "Exporting a safe CSV",
 "goals": [
  "Write CSV that spreadsheets read correctly, with quoting and escaped quotes",
  "Stop formula injection by neutralizing cells that start with = + - or @",
  "Download the file with the right line endings and test the output"
 ],
 "prereqs": [
  "JavaScript basics (strings, arrays, regular expressions)",
  "Import and export JSON files"
 ],
 "sessions": [
  {
   "title": "Data for spreadsheets",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "CSV quoting rules",
   "body": "CSV looks simple: values separated by commas, one row per line. It breaks as soon as a value contains a comma, a quote or a line break. The fix is **quoting**: wrap the value in double quotes, and double any quotes inside it:\n\n| Value | In the CSV |\n|---|---|\n| Groceries | `\"Groceries\"` |\n| Pizza, wings | `\"Pizza, wings\"` |\n| The \"big\" shop | `\"The \"\"big\"\" shop\"` |\n\n```js\nconst cell = (v) => `\"${String(v ?? '').replace(/\"/g, '\"\"')}\"`;\n```\n\nNumbers like the amount can be written plain (`-12.50`), with a fixed two decimals.\n\n```svg Without quotes the comma splits one value into two columns; with quotes it stays one cell\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 100\" font-family=\"monospace\" font-size=\"12\">\n  <rect width=\"480\" height=\"100\" fill=\"#fff\"/>\n  <text x=\"10\" y=\"25\">2026-11-05,Pizza, wings,-18.00</text><text x=\"300\" y=\"25\" fill=\"#dc2626\" font-family=\"sans-serif\">4 columns ✗</text>\n  <text x=\"10\" y=\"70\">2026-11-05,\"Pizza, wings\",-18.00</text><text x=\"300\" y=\"70\" fill=\"#16a34a\" font-family=\"sans-serif\">3 columns ✓</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "How is a double quote inside a quoted CSV value written?",
     "options": [
      "\\\"",
      "As two double quotes: \"\"",
      "It can't be"
     ],
     "answer": 1,
     "why": "CSV escapes a quote by doubling it."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Formula injection",
   "body": "Spreadsheets treat a cell that starts with `=`, `+`, `-` or `@` as a **formula**. If someone types a description like `=HYPERLINK(\"http://evil.example\",\"Click\")` and you export it, opening the CSV runs it. That's called **CSV (formula) injection**.\n\nThe defense: if a text value starts with one of those characters (or a tab or carriage return), put a `'` in front, which spreadsheets show as plain text:\n\n```js\nexport function toCsv(txs) {\n  const cell = (v) => {\n    let s = String(v ?? '');\n    if (/^[=+\\-@\\t\\r]/.test(s)) s = `'${s}`;\n    return `\"${s.replace(/\"/g, '\"\"')}\"`;\n  };\n  const rows = newestFirst(txs).map((t) =>\n    [t.date, cell(t.type), cell(t.category), cell(t.description), (signed(t) / 100).toFixed(2), cell(t.note)].join(','));\n  return ['Date,Type,Category,Description,Amount,Note', ...rows].join('\\r\\n') + '\\r\\n';\n}\n```\n\nThe amount isn't passed through `cell()`: it's a number the app made itself, and a negative expense is supposed to start with `-`.\n\n```svg A description starting with = would run as a formula; a leading apostrophe keeps it as text\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"100\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"220\" height=\"30\" rx=\"5\" fill=\"#fee2e2\"/><text x=\"18\" y=\"29\" font-family=\"monospace\">\"=HYPERLINK(…)\"</text><text x=\"240\" y=\"29\" fill=\"#dc2626\">runs in the spreadsheet</text>\n  <rect x=\"10\" y=\"55\" width=\"220\" height=\"30\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"18\" y=\"74\" font-family=\"monospace\">\"'=HYPERLINK(…)\"</text><text x=\"240\" y=\"74\" fill=\"#16a34a\">shown as text</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "What makes a CSV cell dangerous to open in a spreadsheet?",
     "options": [
      "Starting with = + - or @, which the spreadsheet treats as a formula",
      "Containing a comma",
      "Being longer than 80 characters"
     ],
     "answer": 0,
     "why": "Formulas can fetch URLs or run functions when the file is opened."
    },
    {
     "q": "Why isn't the amount column given the apostrophe treatment?",
     "options": [
      "Amounts are never negative",
      "It's a number the app formats itself, and negative amounts should start with a minus sign",
      "Spreadsheets ignore that column"
     ],
     "answer": 1,
     "why": "Only text that people typed needs neutralizing; your own numbers are safe."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Line endings, download and a test",
   "body": "CSV's standard (RFC 4180) uses **CRLF** (`\\r\\n`) between rows, which every spreadsheet reads. Download it the same way as JSON, with a CSV type:\n\n```js\nconst url = URL.createObjectURL(new Blob([toCsv(txs)], { type: 'text/csv' }));\nObject.assign(document.createElement('a'), { href: url, download: `cashflow-${today}.csv` }).click();\n```\n\nTest the exact text, including the nasty cases:\n\n```js\ntest('CSV quotes text, escapes quotes and neutralizes formulas', () => {\n  const csv = toCsv([{ date: '2026-11-05', type: 'expense', amount: 1800, category: 'Dining', description: '=1+1', note: 'say \"hi\"' }]);\n  assert.match(csv, /\"'=1\\+1\"/);\n  assert.match(csv, /\"say \"\"hi\"\"\"/);\n  assert.match(csv, /,-18\\.00,/);\n  assert.ok(csv.endsWith('\\r\\n'));\n});\n```\n\n```svg A test feeds in tricky values and checks the exact CSV that comes out\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"80\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"25\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#fee2e2\"/><text x=\"80\" y=\"44\" text-anchor=\"middle\">=1+1 · say \"hi\"</text>\n  <rect x=\"190\" y=\"25\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"235\" y=\"44\" text-anchor=\"middle\">toCsv</text>\n  <rect x=\"320\" y=\"25\" width=\"150\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"395\" y=\"44\" text-anchor=\"middle\">assert exact text</text>\n  <path d=\"M150 40 H190 M280 40 H320\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Which line ending does standard CSV use between rows?",
     "options": [
      "\\n only",
      "\\r\\n (CRLF)",
      ";"
     ],
     "answer": 1,
     "why": "RFC 4180 uses CRLF, and spreadsheets on every system accept it."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  }
 ],
 "finish": "You can write CSV that spreadsheets read correctly, block formula injection, and test the exact output.\n\n### Challenges\n\n1. Add a CSV import that reads quoted values back, including doubled quotes.\n2. Let the person choose which columns to export.\n3. Add a test for a description containing a line break."
};
