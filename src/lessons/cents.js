// Built from guides/cents.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "cents",
 "title": "Money math in cents",
 "goals": [
  "Explain why 0.1 + 0.2 isn't 0.3 and why money is stored in whole cents",
  "Turn typed amounts into cents with no floating-point at all",
  "Format cents as dollars with Intl.NumberFormat and do totals, budgets and percentages safely"
 ],
 "prereqs": [
  "JavaScript basics (numbers, strings, regular expressions)"
 ],
 "sessions": [
  {
   "title": "Exact money",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "Why not dollars with decimals?",
   "body": "Computers store most decimals as binary fractions, so many can't be exact:\n\n```js\n0.1 + 0.2;          // 0.30000000000000004\n1.15 * 100;         // 114.99999999999999\n```\n\nAdd up a year of transactions like that and totals drift by a cent here and there. The fix is simple: store money as **whole cents**, which are integers, and integers add exactly:\n\n```js\n10 + 20;            // 30  (10¢ + 20¢)\n```\n\n| Stored | 12.50 dollars | 1250 cents |\n|---|---|---|\n| Type | floating point | integer |\n| Adding thousands | can drift | always exact |\n\n```svg Dollars as decimals drift; cents as integers stay exact\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 460 90\" font-family=\"monospace\" font-size=\"13\">\n  <rect width=\"460\" height=\"90\" fill=\"#fff\"/>\n  <text x=\"10\" y=\"30\">0.1 + 0.2 = 0.30000000000000004</text><text x=\"330\" y=\"30\" fill=\"#dc2626\" font-family=\"sans-serif\">✗ drifts</text>\n  <text x=\"10\" y=\"65\">10 + 20   = 30</text><text x=\"330\" y=\"65\" fill=\"#16a34a\" font-family=\"sans-serif\">✓ exact</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why is money stored as whole cents?",
     "options": [
      "Integers add exactly, while decimal fractions in floating point can be slightly off",
      "Cents use less memory",
      "Banks require it"
     ],
     "answer": 0,
     "why": "Integer math has no rounding drift."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "Typed text to cents, without floats",
   "body": "Even `Math.round(parseFloat(text) * 100)` touches floating point. Cashflow parses the text itself: remove `$`, commas and spaces, check the shape with a regular expression, then build the cents from the two parts:\n\n```js\nexport function toCents(text) {\n  const s = String(text ?? '').trim().replace(/[$,\\s]/g, '');\n  if (!/^\\d+(\\.\\d{0,2})?$/.test(s)) return null;            // digits, then at most two decimals\n  const [whole, frac = ''] = s.split('.');\n  return Number(whole) * 100 + Number(frac.padEnd(2, '0'));\n}\n\ntoCents('1,234.5');   // 123450\ntoCents('$12');       // 1200\ntoCents('12.345');    // null: three decimals isn't an amount\ntoCents('-5');        // null: the type (income or expense) carries the sign\n```\n\n`padEnd(2, '0')` turns \"5\" into \"50\", so `.5` means 50 cents, not 5.\n\n```svg \"1,234.5\" is cleaned, split at the dot, and rebuilt as whole cents\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"100\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"35\" width=\"80\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"50\" y=\"54\" text-anchor=\"middle\">\"1,234.5\"</text>\n  <rect x=\"120\" y=\"35\" width=\"80\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"160\" y=\"54\" text-anchor=\"middle\">\"1234.5\"</text>\n  <rect x=\"230\" y=\"10\" width=\"110\" height=\"26\" rx=\"5\" fill=\"#dbeafe\"/><text x=\"285\" y=\"27\" text-anchor=\"middle\">1234 × 100</text>\n  <rect x=\"230\" y=\"62\" width=\"110\" height=\"26\" rx=\"5\" fill=\"#dbeafe\"/><text x=\"285\" y=\"79\" text-anchor=\"middle\">\"5\" → \"50\"</text>\n  <rect x=\"380\" y=\"35\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"425\" y=\"54\" text-anchor=\"middle\">123450</text>\n  <path d=\"M90 50 H120 M200 50 L230 23 M200 50 L230 75 M340 23 L380 45 M340 75 L380 55\" stroke=\"#374151\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What does toCents make of \"12.5\"?",
     "options": [
      "125",
      "1250, because the fraction \"5\" is padded to \"50\"",
      "12"
     ],
     "answer": 1,
     "why": "One decimal place means tens of cents, so pad it to two digits."
    },
    {
     "q": "Why does toCents reject \"12.345\"?",
     "options": [
      "Money has at most two decimal places, so the text isn't an amount",
      "Numbers over 12 aren't allowed",
      "The dot is in the wrong place"
     ],
     "answer": 0,
     "why": "The regular expression allows at most two digits after the dot."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Showing and adding money",
   "body": "Only convert back to dollars for **display**, with `Intl.NumberFormat`, which adds the symbol, commas and two decimals:\n\n```js\nconst usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });\nexport function money(cents, { sign = false } = {}) {\n  const s = usd.format(Math.abs(cents) / 100);\n  if (!sign || cents === 0) return cents < 0 ? `−${s}` : s;\n  return cents < 0 ? `−${s}` : `+${s}`;\n}\nmoney(123450);                 // \"$1,234.50\"\nmoney(-1200, { sign: true });  // \"−$12.00\"\n```\n\nTotals, budgets and percentages all stay in cents until the very end:\n\n```js\nexport function totals(txs) {\n  let income = 0, expense = 0;\n  for (const t of txs) t.type === 'income' ? (income += t.amount) : (expense += t.amount);\n  return { income, expense, balance: income - expense, savingsRate: income ? Math.round((100 * (income - expense)) / income) : 0 };\n}\n```\n\n`income ? … : 0` avoids dividing by zero in a month with no income.\n\n```svg Cents stay cents through every sum; dollars appear only at the screen\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"80\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"25\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"60\" y=\"44\" text-anchor=\"middle\">toCents</text>\n  <rect x=\"140\" y=\"25\" width=\"180\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"230\" y=\"44\" text-anchor=\"middle\">totals · budgets · % (cents)</text>\n  <rect x=\"350\" y=\"25\" width=\"120\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"410\" y=\"44\" text-anchor=\"middle\">money() → \"$\"</text>\n  <path d=\"M110 40 H140 M320 40 H350\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "When should cents be turned back into dollars?",
     "options": [
      "Before adding them up",
      "Only when showing them, with Intl.NumberFormat",
      "Before saving"
     ],
     "answer": 1,
     "why": "Keep exact integers for every calculation; format at the edge."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  }
 ],
 "finish": "You can explain floating-point drift, parse typed amounts straight into cents, and keep every sum exact until it's displayed.\n\n### Challenges\n\n1. Add a currency setting that passes the currency code to Intl.NumberFormat.\n2. Split a bill three ways in cents and give the leftover cent to the first person.\n3. Write tests for toCents with \"0.01\", \"1,000,000\" and \"$ 7 .5\"."
};
