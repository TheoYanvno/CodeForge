// Built from guides/fitscore.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "fitscore",
 "title": "Scoring recipes against your goals",
 "goals": [
  "Split daily nutrition targets into a share per meal",
  "Score how close one serving lands to its targets with a simple, explainable formula",
  "Rank by score and explain each score in plain words"
 ],
 "prereqs": [
  "JavaScript basics (objects, Math, sort)",
  "Filtering by allergens and diets"
 ],
 "sessions": [
  {
   "title": "Best fit first",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "Daily targets, split by meal",
   "body": "A person's profile has daily targets (say 2,200 calories and 110 g protein). A lunch shouldn't be judged against the whole day, so each meal gets a **share**:\n\n```js\nexport const MEAL_SHARE = { breakfast: 0.25, lunch: 0.3, dinner: 0.35, snack: 0.1 };\n\nexport function mealTargets(profile, meal) {\n  const share = MEAL_SHARE[meal] ?? 0.25;\n  return { calories: Math.round(profile.calories * share), protein: Math.round(profile.protein * share) };\n}\nmealTargets({ calories: 2200, protein: 110 }, 'lunch');   // { calories: 660, protein: 33 }\n```\n\nThe shares add up to 1, so a day of one of each meal lands on the daily target.\n\n```svg A day's 2,200 calories split into breakfast, lunch, dinner and a snack\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 70\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"70\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"20\" width=\"115\" height=\"30\" fill=\"#fde68a\"/><text x=\"67\" y=\"40\" text-anchor=\"middle\">breakfast 550</text>\n  <rect x=\"125\" y=\"20\" width=\"138\" height=\"30\" fill=\"#bbf7d0\"/><text x=\"194\" y=\"40\" text-anchor=\"middle\">lunch 660</text>\n  <rect x=\"263\" y=\"20\" width=\"161\" height=\"30\" fill=\"#bfdbfe\"/><text x=\"343\" y=\"40\" text-anchor=\"middle\">dinner 770</text>\n  <rect x=\"424\" y=\"20\" width=\"46\" height=\"30\" fill=\"#e9d5ff\"/><text x=\"447\" y=\"40\" text-anchor=\"middle\">220</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why give each meal a share of the daily target?",
     "options": [
      "A single meal should be compared with its part of the day, not the whole day",
      "Recipes don't list calories",
      "To make numbers smaller"
     ],
     "answer": 0,
     "why": "A 660-calorie lunch is right on target, even though it's far from 2,200."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "A score you can explain",
   "body": "The score is out of 100. Calories are worth 60 points, lost as a serving drifts **above or below** its target. Protein is worth 40, lost only when it falls **short** (extra protein isn't a problem):\n\n```js\nexport function fitScore(recipe, profile) {\n  const t = mealTargets(profile, recipe.meal);\n  const n = recipe.nutrition;\n  const calMiss = Math.min(1, Math.abs(n.calories - t.calories) / t.calories);\n  const proteinShort = Math.min(1, Math.max(0, t.protein - n.protein) / t.protein);\n  return Math.round(100 - calMiss * 60 - proteinShort * 40);\n}\n```\n\n| Lunch (target 660 cal, 33 g) | Calorie miss | Protein short | Score |\n|---|---|---|---|\n| 660 cal, 40 g | 0% | 0% | 100 |\n| 520 cal, 33 g | 21% | 0% | 87 |\n| 700 cal, 20 g | 6% | 39% | 81 |\n\n`Math.min(1, …)` caps each part, so one wild number can't push a score below zero.\n\n```svg Calories lose points both ways from the target; protein loses points only below it\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"120\" fill=\"#fff\"/>\n  <text x=\"10\" y=\"18\">calories</text><path d=\"M20 90 L120 30 L220 90\" fill=\"none\" stroke=\"#2563eb\" stroke-width=\"3\"/><text x=\"105\" y=\"25\">target</text>\n  <text x=\"260\" y=\"18\">protein</text><path d=\"M270 90 L370 30 L460 30\" fill=\"none\" stroke=\"#16a34a\" stroke-width=\"3\"/><text x=\"355\" y=\"25\">target</text><text x=\"390\" y=\"50\">extra is fine</text>\n  <line x1=\"10\" y1=\"95\" x2=\"470\" y2=\"95\" stroke=\"#94a3b8\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why doesn't the score take points off for extra protein?",
     "options": [
      "Protein isn't measured",
      "Going over the protein goal isn't a problem for these goals, while going over calories is",
      "Math.max removes all protein"
     ],
     "answer": 1,
     "why": "The formula matches what matters: calories both ways, protein only when short."
    },
    {
     "q": "What does Math.min(1, …) protect against?",
     "options": [
      "A huge miss making a part count for more than its full points, pushing scores below zero",
      "Division by zero",
      "Rounding errors"
     ],
     "answer": 0,
     "why": "Each part can lose at most its own 60 or 40 points."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 16
  },
  {
   "title": "Rank, then say why",
   "body": "Sort by score, breaking ties by name so the order never flickers:\n\n```js\nexport function rankRecipes(recipes, profile) {\n  return recipes\n    .map((r) => ({ recipe: r, score: fitScore(r, profile) }))\n    .sort((a, b) => b.score - a.score || a.recipe.name.localeCompare(b.recipe.name));\n}\n```\n\nA number alone isn't helpful, so every card also shows a **reason**:\n\n```js\nfitReason(recipe, profile);\n// \"140 cal under your 660-cal lunch target; 7 g more protein than the 33 g goal\"\n```\n\nWithin 5% of the target it says \"right on your … target\". The same ranking powers **Fill with best fits** in the week plan, rotating through the top choices so the same dish doesn't land on two days in a row.\n\n```svg Score every recipe, sort high to low (name breaks ties), and show the reason on each card\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"100\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"8\" width=\"300\" height=\"24\" rx=\"4\" fill=\"#dcfce7\"/><text x=\"18\" y=\"25\">96% · Turkey chili · right on your 770-cal target</text>\n  <rect x=\"10\" y=\"38\" width=\"300\" height=\"24\" rx=\"4\" fill=\"#ecfccb\"/><text x=\"18\" y=\"55\">88% · Salmon bowl · 90 cal over …</text>\n  <rect x=\"10\" y=\"68\" width=\"300\" height=\"24\" rx=\"4\" fill=\"#fef9c3\"/><text x=\"18\" y=\"85\">71% · Veggie pasta · 12 g short of …</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why add a tie-break by name to the sort?",
     "options": [
      "Names are required",
      "Without it, recipes with equal scores could swap places between renders and the list would jump",
      "localeCompare is faster than subtraction"
     ],
     "answer": 1,
     "why": "A stable, predictable order is easier to read."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  }
 ],
 "finish": "You can split targets by meal, score how well something fits with an explainable formula, and rank with a reason.\n\n### Challenges\n\n1. Add fiber to the score and decide how many points it's worth.\n2. Let the person set their own meal shares, checking they add up to 100%.\n3. Write a test that a recipe right on both targets scores 100."
};
