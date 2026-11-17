// Built from guides/cashflow.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "cashflow",
 "title": "Cashflow (React finance tracker)",
 "goals": [
  "Keep every money rule in whole cents in one tested module",
  "Add and edit transactions in a validated form inside a native dialog",
  "Build a dashboard of totals, budgets and SVG charts from plain functions",
  "Save safely and export a CSV that spreadsheets open without surprises"
 ],
 "prereqs": [
  "React basics",
  "Forms and validation in React",
  "Money math in cents",
  "Exporting a safe CSV"
 ],
 "sessions": [
  {
   "title": "The money rules",
   "from": 0,
   "to": 2
  },
  {
   "title": "The React app",
   "from": 3,
   "to": 4
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "What Cashflow does",
   "body": "In this guide you'll rebuild my [Cashflow](https://github.com/TheoYanvno/finance-tracker) ([live demo](https://theoyanvno.github.io/finance-tracker/)), a personal finance tracker: income and expenses with categories, a dashboard with this month's totals, a spending gauge and daily or weekly bar charts, monthly budgets per category, a searchable transactions list, and a CSV export.\n\nEvery rule is in `src/lib/money.js`, with no React. The components only draw what it returns.\n\n```svg Transactions in cents flow through plain functions into every screen\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"120\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"45\" width=\"110\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"65\" y=\"64\" text-anchor=\"middle\">txs (cents)</text>\n  <rect x=\"170\" y=\"5\" width=\"120\" height=\"26\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"230\" y=\"22\" text-anchor=\"middle\">totals</text>\n  <rect x=\"170\" y=\"36\" width=\"120\" height=\"26\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"230\" y=\"53\" text-anchor=\"middle\">daily / weekly</text>\n  <rect x=\"170\" y=\"67\" width=\"120\" height=\"26\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"230\" y=\"84\" text-anchor=\"middle\">budgetUse</text>\n  <rect x=\"170\" y=\"98\" width=\"120\" height=\"20\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"230\" y=\"112\" text-anchor=\"middle\">toCsv</text>\n  <rect x=\"350\" y=\"45\" width=\"160\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"430\" y=\"64\" text-anchor=\"middle\">Dashboard · Budgets · CSV</text>\n  <path d=\"M120 60 L170 18 M120 60 L170 49 M120 60 L170 80 M120 60 L170 108 M290 50 H350\" stroke=\"#374151\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What unit are amounts stored in?",
     "options": [
      "Dollars with two decimals",
      "Whole cents, as integers",
      "Strings like \"$12.50\""
     ],
     "answer": 1,
     "why": "Integers add exactly; dollars are only for display."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "Transactions in, totals and budgets out",
   "body": "`toCents()` and `money()` from Money math in cents read and write amounts. `totals()` adds a month up, and `budgetUse()` compares each category's spending with its limit:\n\n```js\nexport function budgetUse(txs, budgets, ym) {\n  const spent = new Map(byCategory(inMonth(txs, ym)).map((c) => [c.category, c.amount]));\n  return Object.entries(budgets).filter(([, limit]) => limit > 0).map(([category, limit]) => {\n    const used = spent.get(category) ?? 0;\n    return { category, limit, used, left: limit - used, percent: Math.round((100 * used) / limit), over: used > limit };\n  }).sort((a, b) => b.percent - a.percent);         // the most used budgets first\n}\n```\n\n- `inMonth(txs, '2026-11')` is just `t.date.startsWith(ym)`: ISO dates make it that simple.\n- `byCategory()` returns each category's total and its share, biggest first, for the \"where it went\" list.\n- Budgets are typed in dollars, turned into cents with `toCents()`, and an empty box means \"no budget\".\n\n```svg A budget compares spending in a category with its monthly limit\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 460 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"460\" height=\"100\" fill=\"#fff\"/>\n  <text x=\"10\" y=\"25\">Dining</text><rect x=\"90\" y=\"13\" width=\"300\" height=\"16\" rx=\"8\" fill=\"#e5e7eb\"/><rect x=\"90\" y=\"13\" width=\"345\" height=\"16\" rx=\"8\" fill=\"#fca5a5\"/><text x=\"400\" y=\"50\" fill=\"#dc2626\">115% over</text>\n  <text x=\"10\" y=\"80\">Groceries</text><rect x=\"90\" y=\"68\" width=\"300\" height=\"16\" rx=\"8\" fill=\"#e5e7eb\"/><rect x=\"90\" y=\"68\" width=\"180\" height=\"16\" rx=\"8\" fill=\"#86efac\"/><text x=\"280\" y=\"81\">60%</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "How does inMonth find a month's transactions?",
     "options": [
      "t.date.startsWith('2026-11'), because dates are stored as YYYY-MM-DD text",
      "It converts every date to a Date object and compares months",
      "It asks the server"
     ],
     "answer": 0,
     "why": "ISO date strings make month and day filtering simple text checks."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 16,
   "uses": [
    "cents"
   ]
  },
  {
   "title": "Charts from the same numbers",
   "body": "`daily(txs, today, 7)` and `weekly(txs, today, 8)` build one entry per day or per Monday-to-Sunday week, each with its own `totals()`. Dates are moved in UTC at noon, so a time-zone change can never skip or repeat a day:\n\n```js\nfunction addDays(iso, n) {\n  const d = new Date(`${iso}T12:00:00Z`);\n  d.setUTCDate(d.getUTCDate() + n);\n  return d.toISOString().slice(0, 10);\n}\n```\n\n`Bars` draws income and spending side by side as SVG bars scaled to the biggest value; spending uses a **striped pattern**, so the two differ by more than color. `Gauge` lights up to 24 segments of a half circle for the share of income spent, red past 100%. Both have an `aria-label`, and the bars have a table for screen readers.\n\n```svg Income bars are solid and spending bars striped, so they differ without relying on color\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 420 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <defs><pattern id=\"s\" width=\"6\" height=\"6\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(45)\"><rect width=\"3\" height=\"6\" fill=\"#f97316\"/></pattern></defs>\n  <rect width=\"420\" height=\"120\" fill=\"#fff\"/>\n  <line x1=\"10\" y1=\"100\" x2=\"410\" y2=\"100\" stroke=\"#94a3b8\"/>\n  <rect x=\"40\" y=\"30\" width=\"20\" height=\"70\" fill=\"#60a5fa\"/><rect x=\"64\" y=\"55\" width=\"20\" height=\"45\" fill=\"url(#s)\"/>\n  <rect x=\"140\" y=\"50\" width=\"20\" height=\"50\" fill=\"#60a5fa\"/><rect x=\"164\" y=\"20\" width=\"20\" height=\"80\" fill=\"url(#s)\"/>\n  <text x=\"230\" y=\"40\">solid: income</text><text x=\"230\" y=\"60\">striped: spending</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why do the date helpers work at noon UTC?",
     "options": [
      "Noon is when banks close",
      "Moving whole days in UTC from midday can't be pushed into the wrong day by time zones or daylight saving",
      "toISOString requires noon"
     ],
     "answer": 1,
     "why": "Midnight local times can shift a day when converted; noon UTC can't."
    },
    {
     "q": "Why is spending drawn with stripes as well as a different color?",
     "options": [
      "So people who can't tell the colors apart can still see which bar is which",
      "Stripes are smaller to download",
      "SVG requires patterns for bars"
     ],
     "answer": 0,
     "why": "Never rely on color alone to carry meaning."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 14
  },
  {
   "title": "The form in a dialog",
   "body": "`TxForm` is the pattern from Forms and validation in React: the fields in one state object, `cleanTx()` on submit returning a clean transaction or one clear message, and a native `<dialog>` opened with `showModal()`.\n\n```jsx\nconst [form, setForm] = useState(() => (tx ? { ...tx, amount: (tx.amount / 100).toFixed(2) }\n  : { type, amount: '', date: today, description: '', category: CATEGORIES[type][0], note: '' }));\nconst setType = (t) => setForm((f) => ({ ...f, type: t, category: CATEGORIES[t].includes(f.category) ? f.category : CATEGORIES[t][0] }));\n```\n\nEditing shows the saved cents as dollars again (`(1250 / 100).toFixed(2)` is \"12.50\"). Switching between Expense and Income keeps the category if it exists in both lists, otherwise picks the first one, so the form can never hold an expense category on an income.\n\n```svg Editing turns cents into text for the form; saving turns the text back into cents through cleanTx\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"80\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"25\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"55\" y=\"44\" text-anchor=\"middle\">1250</text>\n  <rect x=\"150\" y=\"25\" width=\"110\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"205\" y=\"44\" text-anchor=\"middle\">form: \"12.50\"</text>\n  <rect x=\"310\" y=\"25\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"355\" y=\"44\" text-anchor=\"middle\">cleanTx → 1250</text>\n  <path d=\"M100 40 H150 M260 40 H310\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What happens to the category when you switch a new transaction from Expense to Income?",
     "options": [
      "It's always cleared",
      "It's kept if Income has the same category, otherwise it becomes Income's first category",
      "It stays an expense category"
     ],
     "answer": 1,
     "why": "The form never holds a category that doesn't belong to the type."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 14,
   "uses": [
    "reactforms"
   ]
  },
  {
   "title": "Saving, CSV export and the tests",
   "body": "State is saved after every change. Loading uses `parseSaved()`, which runs every saved transaction back through `cleanTx()`, so a damaged save keeps all the good ones. **Export CSV** downloads `toCsv(txs)` from Exporting a safe CSV: quoted cells, doubled quotes, formula injection blocked with a leading `'`, CRLF line endings.\n\n```bash\nnpm start       # http://localhost:8000\nnpm test        # toCents, money, cleanTx, totals, daily, weekly, budgetUse, filterTx, toCsv, parseSaved\nnpm run build   # into docs/ for GitHub Pages\n```\n\nThe first visit shows an example month dated around today, so the dashboard isn't empty, and an empty list offers **Load an example month** to bring it back.\n\n```svg Saved data and imports pass the same checks as the form\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"80\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"110\" height=\"26\" rx=\"5\" fill=\"#dbeafe\"/><text x=\"65\" y=\"27\" text-anchor=\"middle\">form</text>\n  <rect x=\"10\" y=\"44\" width=\"110\" height=\"26\" rx=\"5\" fill=\"#fef3c7\"/><text x=\"65\" y=\"61\" text-anchor=\"middle\">saved data</text>\n  <rect x=\"180\" y=\"25\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"230\" y=\"44\" text-anchor=\"middle\">cleanTx</text>\n  <rect x=\"340\" y=\"25\" width=\"130\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"405\" y=\"44\" text-anchor=\"middle\">txs in state</text>\n  <path d=\"M120 23 L180 37 M120 57 L180 43 M280 40 H340\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does loading saved data run every transaction through cleanTx again?",
     "options": [
      "Saved data can be old or damaged; checking each one keeps the good ones and drops only the broken",
      "localStorage changes numbers into strings",
      "To convert dollars to cents"
     ],
     "answer": 0,
     "why": "Data from storage deserves the same checks as data from a form."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 14,
   "uses": [
    "safecsv"
   ]
  }
 ],
 "finish": "You built a finance tracker with exact money math, a validated dialog form, budgets and charts from plain functions, and a safe CSV export.\n\n### Challenges\n\n1. Add recurring transactions (rent on the 1st) that are created when their date comes.\n2. Show last month's spending next to this month's for each category.\n3. Add a savings goal with its own progress gauge."
};
