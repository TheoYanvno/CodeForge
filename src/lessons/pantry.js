// Built from guides/pantry.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "pantry",
 "title": "Pantry (React meal planner)",
 "goals": [
  "Clean and save a profile so a damaged save never breaks the page",
  "Combine safe filtering, fit scores, scaling and shopping lists into one app",
  "Plan a week in one click and build one shopping list from it",
  "Keep every rule in plain functions the components only call"
 ],
 "prereqs": [
  "React basics",
  "Filtering by allergens and diets",
  "Scoring recipes against your goals",
  "Scaling recipes and shopping lists"
 ],
 "sessions": [
  {
   "title": "The rules",
   "from": 0,
   "to": 2
  },
  {
   "title": "Planning the week",
   "from": 3,
   "to": 4
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "What Pantry does",
   "body": "In this guide you'll rebuild my [Pantry](https://github.com/TheoYanvno/pantry) ([live demo](https://theoyanvno.github.io/pantry/)), a meal planner that chooses recipes for you: set a goal, calorie and protein targets, diets, faith-based diets, a budget per serving and allergies, and it hides anything unsafe, ranks the rest by how well they fit, scales servings, plans a week and builds one shopping list for Walmart or Aldi.\n\n| File | Rules |\n|---|---|\n| `lib/profile.js` | the profile, cleaning it, diets, allergies, search |\n| `lib/diets.js` | faith-based diets worked out from ingredients |\n| `lib/rank.js` | meal targets, fit score and reason |\n| `lib/servings.js` | scaling and kitchen fractions |\n| `lib/plan.js`, `lib/shopping.js` | the week plan and the shopping list |\n| `lib/prices.js` | typical store prices and cost per serving |\n\n```svg The profile filters recipes, the ranking orders them, and the plan feeds the shopping list\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"30\" width=\"80\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"50\" y=\"49\" text-anchor=\"middle\">profile</text>\n  <rect x=\"115\" y=\"30\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"160\" y=\"49\" text-anchor=\"middle\">safe recipes</text>\n  <rect x=\"230\" y=\"30\" width=\"80\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"270\" y=\"49\" text-anchor=\"middle\">ranked</text>\n  <rect x=\"335\" y=\"30\" width=\"80\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"375\" y=\"49\" text-anchor=\"middle\">week plan</text>\n  <rect x=\"440\" y=\"30\" width=\"70\" height=\"30\" rx=\"6\" fill=\"#fce7f3\"/><text x=\"475\" y=\"49\" text-anchor=\"middle\">shopping</text>\n  <path d=\"M90 45 H115 M205 45 H230 M310 45 H335 M415 45 H440\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What do Pantry's React components do with the rules?",
     "options": [
      "Each component has its own copy",
      "They only call the functions in src/lib and draw what comes back",
      "They send them to a server"
     ],
     "answer": 1,
     "why": "Plain functions hold the rules; components draw."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "A profile that can't break the page",
   "body": "The profile is saved in the browser. `cleanProfile()` takes anything (an old save, a hand-edited value) and returns a valid profile: unknown goals, diets and allergens are dropped, and numbers are kept in a sensible range:\n\n```js\nexport const LIMITS = { calories: [1200, 4500], protein: [40, 300] };\n\nfunction clamp(n, [lo, hi], fallback) {\n  const v = Math.round(Number(n));\n  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback;\n}\n```\n\nPicking a goal fills in **example** targets (lose 1,800 cal / 120 g, maintain 2,200 / 110, gain 2,700 / 150) that the person can change; the page says to set real targets with a doctor or dietitian. On a phone the whole profile folds into one line from `profileSummary()`: \"Maintain · 2,200 cal · 110 g protein · no milk or eggs\".\n\n```svg cleanProfile turns any saved value into a valid profile\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"170\" height=\"70\" rx=\"6\" fill=\"#fee2e2\"/><text x=\"20\" y=\"30\">calories: 99999</text><text x=\"20\" y=\"48\">allergies: [\"milk\",\"glitter\"]</text><text x=\"20\" y=\"66\">goal: \"fly\"</text>\n  <rect x=\"210\" y=\"30\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"260\" y=\"49\" text-anchor=\"middle\">cleanProfile</text>\n  <rect x=\"340\" y=\"10\" width=\"130\" height=\"70\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"350\" y=\"30\">calories: 4500</text><text x=\"350\" y=\"48\">allergies: [\"milk\"]</text><text x=\"350\" y=\"66\">goal: maintain</text>\n  <path d=\"M180 45 H210 M310 45 H340\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What does cleanProfile do with an allergy it doesn't know, like \"glitter\"?",
     "options": [
      "Crashes",
      "Drops it, keeping only the nine known allergens",
      "Hides every recipe"
     ],
     "answer": 1,
     "why": "Only values the app understands are kept."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Safe, ranked and explained",
   "body": "The recipes page puts the two lessons together:\n\n```js\nconst { shown, hiddenForAllergies } = visibleRecipes(RECIPES, profile, meal);    // Filtering by allergens and diets\nconst ranked = rankRecipes(shown.filter((r) => matchesSearch(r, words, maxMinutes)), profile);   // Scoring recipes\n```\n\nEach card shows the fit score, the plain reason (\"right on your 770-cal dinner target; 4 g more protein than the 39 g goal\"), the estimated cost per serving from typical store-brand prices, the diet and allergen tags, and a ★ to save it. Above the list, \"12 recipes · 3 hidden for your allergies\" says what the filter did. **Try something new** suggests well-fitting recipes you haven't saved or planned, changing each day.\n\n```svg Filter for safety first, then search, then rank by fit\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"80\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"25\" width=\"120\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"70\" y=\"44\" text-anchor=\"middle\">visibleRecipes</text>\n  <rect x=\"170\" y=\"25\" width=\"120\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"230\" y=\"44\" text-anchor=\"middle\">matchesSearch</text>\n  <rect x=\"330\" y=\"25\" width=\"140\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"400\" y=\"44\" text-anchor=\"middle\">rankRecipes + reason</text>\n  <path d=\"M130 40 H170 M290 40 H330\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why are allergies filtered before ranking?",
     "options": [
      "An unsafe recipe should never appear, however well it fits the targets",
      "Ranking is slower than filtering",
      "The score needs the allergen list"
     ],
     "answer": 0,
     "why": "Safety is a hard rule; fit is a preference."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15,
   "uses": [
    "allergens",
    "fitscore"
   ]
  },
  {
   "title": "The week plan and Fill with best fits",
   "body": "The plan is seven days × four meals of recipe ids (or nothing), plus how many people it's for. `cleanPlan()` drops unknown recipes and recipes in the wrong meal slot, so a damaged save never breaks the page. **Fill with best fits** fills only the empty meals with the top-ranked safe recipe for that meal, rotating through the top choices so the same dish doesn't land on two days in a row. Each day shows its calories and protein against the targets, and the week shows its estimated food cost.\n\n```js\nplan.days[i][m] = r && r.meal === m ? id : null;     // only known recipes, only in their own meal\n```\n\n```svg Seven days by four meals; empty cells are filled from the ranked list, rotating so neighbors differ\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 110\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect width=\"480\" height=\"110\" fill=\"#fff\"/>\n  <g fill=\"#f1f5f9\" stroke=\"#cbd5e1\"><rect x=\"80\" y=\"10\" width=\"55\" height=\"20\"/><rect x=\"135\" y=\"10\" width=\"55\" height=\"20\"/><rect x=\"190\" y=\"10\" width=\"55\" height=\"20\"/><rect x=\"80\" y=\"30\" width=\"55\" height=\"20\" fill=\"#dcfce7\"/><rect x=\"135\" y=\"30\" width=\"55\" height=\"20\" fill=\"#dcfce7\"/><rect x=\"190\" y=\"30\" width=\"55\" height=\"20\" fill=\"#dcfce7\"/></g>\n  <text x=\"10\" y=\"24\">breakfast</text><text x=\"10\" y=\"44\">dinner</text><text x=\"88\" y=\"44\">chili</text><text x=\"140\" y=\"44\">salmon</text><text x=\"195\" y=\"44\">chili</text>\n  <text x=\"80\" y=\"70\">Mon</text><text x=\"135\" y=\"70\">Tue</text><text x=\"190\" y=\"70\">Wed</text><text x=\"260\" y=\"44\">no dish two days in a row</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does cleanPlan check that a recipe's meal matches its slot?",
     "options": [
      "Recipes can't be reused",
      "A saved plan could put a breakfast in the dinner slot; dropping it keeps the plan valid",
      "To count calories"
     ],
     "answer": 1,
     "why": "Validate saved data against the rules every time it's loaded."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15,
   "uses": [
    "fitscore"
   ]
  },
  {
   "title": "The shopping list and the tests",
   "body": "The shopping list is the lesson's `shoppingList(plan)`: every planned recipe scaled to the number of people, added up by item and unit, small units merged into bigger ones, grouped by store aisle, with tick boxes, **Copy as text** and a print layout. Recipe pages use `scaleRecipe()` and `formatQty()` so changing servings shows \"1 ½ cups\".\n\n```bash\nnpm start       # http://localhost:8000\nnpm test        # profile, allergies, diets and faith diets, fit scores, scaling, plan, shopping list, prices\nnpm run build   # into docs/ for GitHub Pages\n```\n\n```svg Each lesson's rules are tested on their own, and the app combines them\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 80\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"80\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"140\" height=\"26\" rx=\"5\" fill=\"#fef3c7\"/><text x=\"80\" y=\"27\" text-anchor=\"middle\">allergens · diets</text>\n  <rect x=\"170\" y=\"10\" width=\"140\" height=\"26\" rx=\"5\" fill=\"#dbeafe\"/><text x=\"240\" y=\"27\" text-anchor=\"middle\">fit score</text>\n  <rect x=\"330\" y=\"10\" width=\"140\" height=\"26\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"400\" y=\"27\" text-anchor=\"middle\">scaling · shopping</text>\n  <rect x=\"170\" y=\"48\" width=\"140\" height=\"26\" rx=\"5\" fill=\"#e0e7ff\"/><text x=\"240\" y=\"65\" text-anchor=\"middle\">Pantry</text>\n  <path d=\"M80 36 L200 48 M240 36 V48 M400 36 L280 48\" stroke=\"#374151\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "How does the shopping list know how much to buy for four people?",
     "options": [
      "It scales each planned recipe by people ÷ the recipe's servings before adding amounts up",
      "It multiplies the final list by four",
      "It asks the store"
     ],
     "answer": 0,
     "why": "Scaling per recipe keeps each recipe's own serving size correct."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 14,
   "uses": [
    "scaling"
   ]
  }
 ],
 "finish": "You built a meal planner that keeps people safe, ranks by fit with a reason, plans a week in one click and turns it into one shopping list.\n\n### Challenges\n\n1. Add a \"use what I have\" filter that ranks recipes using ingredients already in the pantry higher.\n2. Show the week's total protein as a bar against the weekly target.\n3. Add a printable recipe card with the scaled ingredients."
};
