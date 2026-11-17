// Built from guides/allergens.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "allergens",
 "title": "Filtering by allergens and diets",
 "goals": [
  "Write filters that must all pass (every) and checks that must all fail (some)",
  "Hide unsafe items while telling people how many were hidden",
  "Work out rules from what a recipe contains instead of hand-tagging every recipe"
 ],
 "prereqs": [
  "JavaScript basics (arrays, filter, every, some)",
  "React basics"
 ],
 "sessions": [
  {
   "title": "Showing only what's safe",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "every and some: diets and allergies",
   "body": "Two questions decide whether a recipe shows up, and they're opposites:\n\n- **Diets** (vegetarian, gluten-free…): the recipe must carry **every** chosen diet.\n- **Allergies**: the recipe must contain **none** of the person's allergens, so if **some** allergen is in it, it's out.\n\n```js\nexport function fitsDiets(recipe, diets) {\n  return diets.every((d) => recipe.diets.includes(d));\n}\n\nexport function isSafe(recipe, allergies) {\n  return !recipe.allergens.some((a) => allergies.includes(a));\n}\n```\n\nWith nothing chosen both pass: `[].every(...)` is `true`, and `[].some(...)` is `false`.\n\n```svg Diets need every box ticked; allergies fail if any one matches\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"110\" fill=\"#fff\"/>\n  <text x=\"10\" y=\"20\" font-weight=\"bold\">every: chosen diets</text>\n  <text x=\"10\" y=\"42\">vegetarian ✓  gluten-free ✓</text><text x=\"200\" y=\"42\" fill=\"#16a34a\">→ fits</text>\n  <text x=\"10\" y=\"62\">vegetarian ✓  gluten-free ✗</text><text x=\"200\" y=\"62\" fill=\"#dc2626\">→ hidden</text>\n  <text x=\"270\" y=\"20\" font-weight=\"bold\">some: allergens</text>\n  <text x=\"270\" y=\"42\">milk, eggs vs peanuts</text><text x=\"420\" y=\"42\" fill=\"#16a34a\">safe</text>\n  <text x=\"270\" y=\"62\">milk, eggs vs eggs</text><text x=\"420\" y=\"62\" fill=\"#dc2626\">hidden</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "What does [].every((d) => …) return?",
     "options": [
      "true: with no diets chosen, every recipe fits",
      "false",
      "undefined"
     ],
     "answer": 0,
     "why": "\"Every item of an empty list passes\" is true, which is exactly right for \"no diet chosen\"."
    },
    {
     "q": "Why does isSafe use some instead of every?",
     "options": [
      "some is faster",
      "A single allergen is enough to make a recipe unsafe",
      "every doesn't work on strings"
     ],
     "answer": 1,
     "why": "Safety fails on any one match."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Hide, but say how many",
   "body": "Silently hiding recipes is confusing (\"why are there only 9?\"). Filter in two passes: first everything **except** allergies, then the safe ones, and report the difference:\n\n```js\nexport function visibleRecipes(recipes, profile, meal = 'all') {\n  const pool = recipes.filter((r) => (meal === 'all' || r.meal === meal)\n    && fitsDiets(r, profile.diets) && fitsFaith(r, profile.faiths) && fitsBudget(r, profile.budget));\n  const shown = pool.filter((r) => isSafe(r, profile.allergies));\n  return { shown, hiddenForAllergies: pool.length - shown.length };\n}\n```\n\nThe page then says \"12 recipes · 3 hidden for your allergies\", and each recipe card still lists its allergens, so nothing is a mystery.\n\n```svg First filter by meal, diet, faith and budget; then remove unsafe recipes and count them\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"30\" width=\"80\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"50\" y=\"49\" text-anchor=\"middle\">18 recipes</text>\n  <rect x=\"120\" y=\"30\" width=\"150\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"195\" y=\"49\" text-anchor=\"middle\">meal · diet · faith · budget</text>\n  <rect x=\"300\" y=\"30\" width=\"70\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"335\" y=\"49\" text-anchor=\"middle\">pool: 12</text>\n  <rect x=\"400\" y=\"10\" width=\"70\" height=\"26\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"435\" y=\"27\" text-anchor=\"middle\">shown: 9</text>\n  <rect x=\"400\" y=\"54\" width=\"70\" height=\"26\" rx=\"5\" fill=\"#fee2e2\"/><text x=\"435\" y=\"71\" text-anchor=\"middle\">hidden: 3</text>\n  <path d=\"M90 45 H120 M270 45 H300 M370 45 L400 23 M370 45 L400 67\" stroke=\"#374151\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why filter allergies in a separate, second pass?",
     "options": [
      "So the page can count how many recipes allergies hid and tell the person",
      "Allergies have to be checked last for safety",
      "filter can only take one condition"
     ],
     "answer": 0,
     "why": "The difference between the two lists is the number to report."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Rules from what's inside",
   "body": "Tagging 18 recipes by hand for five faith-based diets is error-prone. Instead, Pantry works the rules out from **what each recipe contains**. A catalog says what every ingredient is (`chicken breast` → poultry, `cheddar` → dairy), and each tradition is a small rule over that set:\n\n```js\nexport const FAITH_DIETS = {\n  kosher: {\n    label: 'Kosher-style',\n    allows: (has) => !has.has('shellfish') && !((has.has('poultry') || has.has('beef')) && has.has('dairy')),\n  },\n  'orthodox-fast': {\n    label: 'Orthodox fasting',\n    allows: (has) => !['poultry', 'beef', 'fish', 'dairy', 'eggs'].some((t) => has.has(t)),   // shellfish is allowed\n  },\n  lent: { label: 'Meatless days (Lent)', allows: (has) => !has.has('poultry') && !has.has('beef') },\n};\n\nexport function fitsFaith(recipe, faiths = []) {\n  if (!faiths.length) return true;\n  const has = contents(recipe);                      // a Set like {'poultry', 'dairy', 'oil'}\n  return faiths.every((f) => FAITH_DIETS[f]?.allows(has) ?? true);\n}\n```\n\nAdd a recipe and every rule applies to it automatically. The app is also honest about its limits: it can leave out forbidden ingredients, but it can't certify food, so recipes show notes like \"Buy halal meat\".\n\n```svg Ingredients map to kinds of food; each diet's rule reads that set\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"100\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"130\" height=\"80\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"20\" y=\"30\">chicken breast</text><text x=\"20\" y=\"50\">cheddar</text><text x=\"20\" y=\"70\">olive oil</text>\n  <rect x=\"180\" y=\"25\" width=\"120\" height=\"50\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"240\" y=\"47\" text-anchor=\"middle\">{poultry,</text><text x=\"240\" y=\"63\" text-anchor=\"middle\">dairy, oil}</text>\n  <rect x=\"340\" y=\"10\" width=\"130\" height=\"24\" rx=\"5\" fill=\"#fee2e2\"/><text x=\"350\" y=\"27\">kosher ✗ meat+dairy</text>\n  <rect x=\"340\" y=\"40\" width=\"130\" height=\"24\" rx=\"5\" fill=\"#fee2e2\"/><text x=\"350\" y=\"57\">Lent ✗ poultry</text>\n  <rect x=\"340\" y=\"70\" width=\"130\" height=\"24\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"350\" y=\"87\">halal ✓ (note)</text>\n  <path d=\"M140 50 H180 M300 50 L340 22 M300 50 H340 M300 50 L340 82\" stroke=\"#374151\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why derive faith diets from ingredients instead of tagging each recipe?",
     "options": [
      "One rule per diet covers every recipe, including new ones, with no tag to forget",
      "Tags are not allowed in JSON",
      "It's faster to load"
     ],
     "answer": 0,
     "why": "Rules over data scale; hand tags drift."
    },
    {
     "q": "Why does the app show \"Buy halal meat\" instead of calling a recipe certified halal?",
     "options": [
      "Halal has no rules",
      "It can leave out forbidden ingredients, but how meat is produced is outside what a recipe list can know",
      "The note is required by the browser"
     ],
     "answer": 1,
     "why": "Be honest about what software can and can't promise."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  }
 ],
 "finish": "You can combine every and some for diets and allergies, hide items while reporting how many, and derive rules from what things contain.\n\n### Challenges\n\n1. Add a \"may contain traces\" warning that shows but doesn't hide.\n2. Add a new diet rule (pescatarian) in one line and test it on three recipes.\n3. Show which allergen hid each recipe in an expandable list."
};
