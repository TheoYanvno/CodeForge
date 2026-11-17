---
id: cents
title: Money math in cents
goals: Explain why 0.1 + 0.2 isn't 0.3 and why money is stored in whole cents; Turn typed amounts into cents with no floating-point at all; Format cents as dollars with Intl.NumberFormat and do totals, budgets and percentages safely
prereqs: JavaScript basics (numbers, strings, regular expressions)
---

## Session: Exact money

## Step: Why not dollars with decimals?
kind: read
time: 10

Computers store most decimals as binary fractions, so many can't be exact:

```js
0.1 + 0.2;          // 0.30000000000000004
1.15 * 100;         // 114.99999999999999
```

Add up a year of transactions like that and totals drift by a cent here and there. The fix is simple: store money as **whole cents**, which are integers, and integers add exactly:

```js
10 + 20;            // 30  (10¢ + 20¢)
```

| Stored | 12.50 dollars | 1250 cents |
|---|---|---|
| Type | floating point | integer |
| Adding thousands | can drift | always exact |

```svg Dollars as decimals drift; cents as integers stay exact
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 90" font-family="monospace" font-size="13">
  <rect width="460" height="90" fill="#fff"/>
  <text x="10" y="30">0.1 + 0.2 = 0.30000000000000004</text><text x="330" y="30" fill="#dc2626" font-family="sans-serif">✗ drifts</text>
  <text x="10" y="65">10 + 20   = 30</text><text x="330" y="65" fill="#16a34a" font-family="sans-serif">✓ exact</text>
</svg>
```

quiz: Why is money stored as whole cents?
- [x] Integers add exactly, while decimal fractions in floating point can be slightly off
- [ ] Cents use less memory
- [ ] Banks require it
why: Integer math has no rounding drift.

## Step: Typed text to cents, without floats
kind: read
time: 15

Even `Math.round(parseFloat(text) * 100)` touches floating point. Cashflow parses the text itself: remove `$`, commas and spaces, check the shape with a regular expression, then build the cents from the two parts:

```js
export function toCents(text) {
  const s = String(text ?? '').trim().replace(/[$,\s]/g, '');
  if (!/^\d+(\.\d{0,2})?$/.test(s)) return null;            // digits, then at most two decimals
  const [whole, frac = ''] = s.split('.');
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'));
}

toCents('1,234.5');   // 123450
toCents('$12');       // 1200
toCents('12.345');    // null: three decimals isn't an amount
toCents('-5');        // null: the type (income or expense) carries the sign
```

`padEnd(2, '0')` turns "5" into "50", so `.5` means 50 cents, not 5.

```svg "1,234.5" is cleaned, split at the dot, and rebuilt as whole cents
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 100" font-family="sans-serif" font-size="12">
  <rect width="480" height="100" fill="#fff"/>
  <rect x="10" y="35" width="80" height="30" rx="6" fill="#e0e7ff"/><text x="50" y="54" text-anchor="middle">"1,234.5"</text>
  <rect x="120" y="35" width="80" height="30" rx="6" fill="#fef3c7"/><text x="160" y="54" text-anchor="middle">"1234.5"</text>
  <rect x="230" y="10" width="110" height="26" rx="5" fill="#dbeafe"/><text x="285" y="27" text-anchor="middle">1234 × 100</text>
  <rect x="230" y="62" width="110" height="26" rx="5" fill="#dbeafe"/><text x="285" y="79" text-anchor="middle">"5" → "50"</text>
  <rect x="380" y="35" width="90" height="30" rx="6" fill="#dcfce7"/><text x="425" y="54" text-anchor="middle">123450</text>
  <path d="M90 50 H120 M200 50 L230 23 M200 50 L230 75 M340 23 L380 45 M340 75 L380 55" stroke="#374151"/>
</svg>
```

quiz: What does toCents make of "12.5"?
- [ ] 125
- [x] 1250, because the fraction "5" is padded to "50"
- [ ] 12
why: One decimal place means tens of cents, so pad it to two digits.

quiz: Why does toCents reject "12.345"?
- [x] Money has at most two decimal places, so the text isn't an amount
- [ ] Numbers over 12 aren't allowed
- [ ] The dot is in the wrong place
why: The regular expression allows at most two digits after the dot.

## Step: Showing and adding money
kind: read
time: 15

Only convert back to dollars for **display**, with `Intl.NumberFormat`, which adds the symbol, commas and two decimals:

```js
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export function money(cents, { sign = false } = {}) {
  const s = usd.format(Math.abs(cents) / 100);
  if (!sign || cents === 0) return cents < 0 ? `−${s}` : s;
  return cents < 0 ? `−${s}` : `+${s}`;
}
money(123450);                 // "$1,234.50"
money(-1200, { sign: true });  // "−$12.00"
```

Totals, budgets and percentages all stay in cents until the very end:

```js
export function totals(txs) {
  let income = 0, expense = 0;
  for (const t of txs) t.type === 'income' ? (income += t.amount) : (expense += t.amount);
  return { income, expense, balance: income - expense, savingsRate: income ? Math.round((100 * (income - expense)) / income) : 0 };
}
```

`income ? … : 0` avoids dividing by zero in a month with no income.

```svg Cents stay cents through every sum; dollars appear only at the screen
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 80" font-family="sans-serif" font-size="12">
  <rect width="480" height="80" fill="#fff"/>
  <rect x="10" y="25" width="100" height="30" rx="6" fill="#e0e7ff"/><text x="60" y="44" text-anchor="middle">toCents</text>
  <rect x="140" y="25" width="180" height="30" rx="6" fill="#dcfce7"/><text x="230" y="44" text-anchor="middle">totals · budgets · % (cents)</text>
  <rect x="350" y="25" width="120" height="30" rx="6" fill="#fef3c7"/><text x="410" y="44" text-anchor="middle">money() → "$"</text>
  <path d="M110 40 H140 M320 40 H350" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: When should cents be turned back into dollars?
- [ ] Before adding them up
- [x] Only when showing them, with Intl.NumberFormat
- [ ] Before saving
why: Keep exact integers for every calculation; format at the edge.

## Finish

You can explain floating-point drift, parse typed amounts straight into cents, and keep every sum exact until it's displayed.

### Challenges

1. Add a currency setting that passes the currency code to Intl.NumberFormat.
2. Split a bill three ways in cents and give the leftover cent to the first person.
3. Write tests for toCents with "0.01", "1,000,000" and "$ 7 .5".
