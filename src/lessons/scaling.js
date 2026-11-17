// Built from guides/scaling.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "scaling",
 "title": "Scaling recipes and shopping lists",
 "goals": [
  "Scale every ingredient by one factor when the servings change",
  "Show amounts the way cooks read them, as kitchen fractions",
  "Add a week of recipes into one shopping list, merging units and grouping by aisle"
 ],
 "prereqs": [
  "JavaScript basics (Map, arrays, Math)",
  "Scoring recipes against your goals"
 ],
 "sessions": [
  {
   "title": "From recipe to shopping list",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "One factor for every ingredient",
   "body": "A recipe is written for some number of servings. To cook for a different number, multiply every amount by the same **factor**:\n\n```js\nexport function scaleRecipe(recipe, servings) {\n  const n = Math.max(1, Math.min(24, Math.round(servings)));      // 1 to 24, whole servings\n  const factor = n / recipe.servings;\n  return { servings: n, ingredients: recipe.ingredients.map((i) => ({ ...i, qty: i.qty * factor })) };\n}\n```\n\nKeep the original recipe unchanged and scale a copy every time; scaling a scaled recipe again would pile up rounding.\n\n```svg A recipe for 4 cooked for 6: every amount times 1.5\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 460 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"460\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"150\" height=\"70\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"20\" y=\"30\">serves 4</text><text x=\"20\" y=\"50\">1 cup oats</text><text x=\"20\" y=\"68\">2 eggs</text>\n  <text x=\"190\" y=\"50\">× 6/4 = 1.5</text>\n  <rect x=\"290\" y=\"10\" width=\"160\" height=\"70\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"300\" y=\"30\">serves 6</text><text x=\"300\" y=\"50\">1 ½ cups oats</text><text x=\"300\" y=\"68\">3 eggs</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why scale from the original recipe each time instead of the last scaled version?",
     "options": [
      "Rounding would pile up if scaled amounts were scaled again",
      "The original is faster to read",
      "Scaled recipes can't be changed"
     ],
     "answer": 0,
     "why": "One multiplication from the source keeps amounts exact."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "1 ½ cups, not 1.5 cup",
   "body": "Cooks read fractions. `formatQty` rounds to the nearest common kitchen fraction, and whole numbers from 10 up:\n\n```js\nconst FRACTIONS = [[0, ''], [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'], [1 / 2, '½'], [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [7 / 8, '⅞'], [1, '']];\n\nexport function formatQty(n) {\n  if (!Number.isFinite(n) || n <= 0) return '0';\n  if (n >= 10) return String(Math.round(n));\n  let whole = Math.floor(n);\n  const rest = n - whole;\n  let best = FRACTIONS[0];\n  for (const f of FRACTIONS) if (Math.abs(rest - f[0]) < Math.abs(rest - best[0])) best = f;\n  if (best[0] === 1) { whole += 1; best = FRACTIONS[0]; }          // 2.95 → 3\n  if (whole === 0 && !best[1]) return '⅛';                          // never show 0 for something in the recipe\n  return whole && best[1] ? `${whole} ${best[1]}` : whole ? String(whole) : best[1];\n}\n```\n\n| n | formatQty(n) |\n|---|---|\n| 1.5 | 1 ½ |\n| 0.33 | ⅓ |\n| 2.95 | 3 |\n| 0.02 | ⅛ |\n| 13.4 | 13 |\n\nUnits get plural forms too: 1 cup, 2 cups, but 2 tbsp.\n\n```svg The leftover after the whole number snaps to the nearest kitchen fraction\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 70\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"70\" fill=\"#fff\"/>\n  <line x1=\"20\" y1=\"35\" x2=\"460\" y2=\"35\" stroke=\"#94a3b8\" stroke-width=\"2\"/>\n  <g font-size=\"13\"><text x=\"15\" y=\"25\">0</text><text x=\"70\" y=\"25\">⅛</text><text x=\"125\" y=\"25\">¼</text><text x=\"160\" y=\"25\">⅓</text><text x=\"180\" y=\"25\">⅜</text><text x=\"235\" y=\"25\">½</text><text x=\"290\" y=\"25\">⅝</text><text x=\"310\" y=\"25\">⅔</text><text x=\"345\" y=\"25\">¾</text><text x=\"400\" y=\"25\">⅞</text><text x=\"455\" y=\"25\">1</text></g>\n  <circle cx=\"168\" cy=\"35\" r=\"5\" fill=\"#dc2626\"/><text x=\"140\" y=\"58\">0.33 → ⅓</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "What does formatQty show for 0.02 of an ingredient?",
     "options": [
      "0",
      "⅛, because something in the recipe should never show as zero",
      "Nothing"
     ],
     "answer": 1,
     "why": "A tiny amount is still an ingredient to buy."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 14
  },
  {
   "title": "A week into one shopping list",
   "body": "The shopping list walks every meal of the week plan, scales each recipe to the number of people, and adds amounts **by item and unit** in a Map:\n\n```js\nfor (const day of plan.days) {\n  for (const meal of MEALS) {\n    const r = day[meal] && findRecipe(day[meal]);\n    if (!r) continue;\n    const factor = people / r.servings;\n    for (const ing of r.ingredients) {\n      const name = itemName(ing.item);                  // \"onion, diced\" → \"onion\"\n      const entry = byName.get(name) || { name, amounts: new Map(), recipes: new Set() };\n      entry.amounts.set(ing.unit, (entry.amounts.get(ing.unit) || 0) + ing.qty * factor);\n      entry.recipes.add(r.name);\n      byName.set(name, entry);\n    }\n  }\n}\n```\n\nThen `mergeUnits` folds small units into bigger ones (3 tsp + 1 tbsp → 2 tbsp; ounces into pounds), and items are grouped by store aisle: Produce, Dairy & eggs, Canned & dry goods, and so on. Each item also lists the recipes that need it.\n\n```svg Ingredients from every meal are added up by name and unit, merged, and grouped by aisle\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"110\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"140\" height=\"22\" rx=\"4\" fill=\"#e0e7ff\"/><text x=\"18\" y=\"25\">Mon: 1 tbsp olive oil</text>\n  <rect x=\"10\" y=\"40\" width=\"140\" height=\"22\" rx=\"4\" fill=\"#e0e7ff\"/><text x=\"18\" y=\"55\">Wed: 3 tsp olive oil</text>\n  <rect x=\"10\" y=\"70\" width=\"140\" height=\"22\" rx=\"4\" fill=\"#e0e7ff\"/><text x=\"18\" y=\"85\">Fri: 1 onion, diced</text>\n  <rect x=\"200\" y=\"35\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"250\" y=\"54\" text-anchor=\"middle\">add · merge</text>\n  <rect x=\"340\" y=\"10\" width=\"130\" height=\"40\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"348\" y=\"26\">Spices, oils</text><text x=\"348\" y=\"42\">2 tbsp olive oil</text>\n  <rect x=\"340\" y=\"60\" width=\"130\" height=\"40\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"348\" y=\"76\">Produce</text><text x=\"348\" y=\"92\">1 onion</text>\n  <path d=\"M150 21 L200 45 M150 51 H200 M150 81 L200 55 M300 50 L340 30 M300 50 L340 80\" stroke=\"#374151\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why are amounts added up per unit in a Map before merging?",
     "options": [
      "The same item can appear in different units, and only some units can be safely combined",
      "Maps sort items by aisle",
      "Units are always the same"
     ],
     "answer": 0,
     "why": "Add like with like first; then convert tsp to tbsp or oz to lb where it makes sense."
    },
    {
     "q": "Why turn \"onion, diced\" into \"onion\" for the list?",
     "options": [
      "Commas break the Map",
      "So the same thing bought at the store is counted once, however a recipe describes its preparation",
      "Diced onions aren't sold"
     ],
     "answer": 1,
     "why": "Preparation notes belong to the recipe, not the shopping list."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 16
  }
 ],
 "finish": "You can scale recipes by one factor, show amounts as kitchen fractions, and build one tidy shopping list from a week of meals.\n\n### Challenges\n\n1. Add metric units (grams and milliliters) as a setting.\n2. Let people tick off what they already have, and hide those items.\n3. Write a test that two recipes using 1 cup and ½ cup of milk give 1 ½ cups."
};
