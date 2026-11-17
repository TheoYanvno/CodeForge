---
id: fitscore
title: Scoring recipes against your goals
goals: Split daily nutrition targets into a share per meal; Score how close one serving lands to its targets with a simple, explainable formula; Rank by score and explain each score in plain words
prereqs: JavaScript basics (objects, Math, sort); Filtering by allergens and diets
---

## Session: Best fit first

## Step: Daily targets, split by meal
kind: read
time: 10

A person's profile has daily targets (say 2,200 calories and 110 g protein). A lunch shouldn't be judged against the whole day, so each meal gets a **share**:

```js
export const MEAL_SHARE = { breakfast: 0.25, lunch: 0.3, dinner: 0.35, snack: 0.1 };

export function mealTargets(profile, meal) {
  const share = MEAL_SHARE[meal] ?? 0.25;
  return { calories: Math.round(profile.calories * share), protein: Math.round(profile.protein * share) };
}
mealTargets({ calories: 2200, protein: 110 }, 'lunch');   // { calories: 660, protein: 33 }
```

The shares add up to 1, so a day of one of each meal lands on the daily target.

```svg A day's 2,200 calories split into breakfast, lunch, dinner and a snack
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 70" font-family="sans-serif" font-size="12">
  <rect width="480" height="70" fill="#fff"/>
  <rect x="10" y="20" width="115" height="30" fill="#fde68a"/><text x="67" y="40" text-anchor="middle">breakfast 550</text>
  <rect x="125" y="20" width="138" height="30" fill="#bbf7d0"/><text x="194" y="40" text-anchor="middle">lunch 660</text>
  <rect x="263" y="20" width="161" height="30" fill="#bfdbfe"/><text x="343" y="40" text-anchor="middle">dinner 770</text>
  <rect x="424" y="20" width="46" height="30" fill="#e9d5ff"/><text x="447" y="40" text-anchor="middle">220</text>
</svg>
```

quiz: Why give each meal a share of the daily target?
- [x] A single meal should be compared with its part of the day, not the whole day
- [ ] Recipes don't list calories
- [ ] To make numbers smaller
why: A 660-calorie lunch is right on target, even though it's far from 2,200.

## Step: A score you can explain
kind: read
time: 16

The score is out of 100. Calories are worth 60 points, lost as a serving drifts **above or below** its target. Protein is worth 40, lost only when it falls **short** (extra protein isn't a problem):

```js
export function fitScore(recipe, profile) {
  const t = mealTargets(profile, recipe.meal);
  const n = recipe.nutrition;
  const calMiss = Math.min(1, Math.abs(n.calories - t.calories) / t.calories);
  const proteinShort = Math.min(1, Math.max(0, t.protein - n.protein) / t.protein);
  return Math.round(100 - calMiss * 60 - proteinShort * 40);
}
```

| Lunch (target 660 cal, 33 g) | Calorie miss | Protein short | Score |
|---|---|---|---|
| 660 cal, 40 g | 0% | 0% | 100 |
| 520 cal, 33 g | 21% | 0% | 87 |
| 700 cal, 20 g | 6% | 39% | 81 |

`Math.min(1, …)` caps each part, so one wild number can't push a score below zero.

```svg Calories lose points both ways from the target; protein loses points only below it
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" font-family="sans-serif" font-size="12">
  <rect width="480" height="120" fill="#fff"/>
  <text x="10" y="18">calories</text><path d="M20 90 L120 30 L220 90" fill="none" stroke="#2563eb" stroke-width="3"/><text x="105" y="25">target</text>
  <text x="260" y="18">protein</text><path d="M270 90 L370 30 L460 30" fill="none" stroke="#16a34a" stroke-width="3"/><text x="355" y="25">target</text><text x="390" y="50">extra is fine</text>
  <line x1="10" y1="95" x2="470" y2="95" stroke="#94a3b8"/>
</svg>
```

quiz: Why doesn't the score take points off for extra protein?
- [ ] Protein isn't measured
- [x] Going over the protein goal isn't a problem for these goals, while going over calories is
- [ ] Math.max removes all protein
why: The formula matches what matters: calories both ways, protein only when short.

quiz: What does Math.min(1, …) protect against?
- [x] A huge miss making a part count for more than its full points, pushing scores below zero
- [ ] Division by zero
- [ ] Rounding errors
why: Each part can lose at most its own 60 or 40 points.

## Step: Rank, then say why
kind: read
time: 12

Sort by score, breaking ties by name so the order never flickers:

```js
export function rankRecipes(recipes, profile) {
  return recipes
    .map((r) => ({ recipe: r, score: fitScore(r, profile) }))
    .sort((a, b) => b.score - a.score || a.recipe.name.localeCompare(b.recipe.name));
}
```

A number alone isn't helpful, so every card also shows a **reason**:

```js
fitReason(recipe, profile);
// "140 cal under your 660-cal lunch target; 7 g more protein than the 33 g goal"
```

Within 5% of the target it says "right on your … target". The same ranking powers **Fill with best fits** in the week plan, rotating through the top choices so the same dish doesn't land on two days in a row.

```svg Score every recipe, sort high to low (name breaks ties), and show the reason on each card
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 100" font-family="sans-serif" font-size="12">
  <rect width="480" height="100" fill="#fff"/>
  <rect x="10" y="8" width="300" height="24" rx="4" fill="#dcfce7"/><text x="18" y="25">96% · Turkey chili · right on your 770-cal target</text>
  <rect x="10" y="38" width="300" height="24" rx="4" fill="#ecfccb"/><text x="18" y="55">88% · Salmon bowl · 90 cal over …</text>
  <rect x="10" y="68" width="300" height="24" rx="4" fill="#fef9c3"/><text x="18" y="85">71% · Veggie pasta · 12 g short of …</text>
</svg>
```

quiz: Why add a tie-break by name to the sort?
- [ ] Names are required
- [x] Without it, recipes with equal scores could swap places between renders and the list would jump
- [ ] localeCompare is faster than subtraction
why: A stable, predictable order is easier to read.

## Finish

You can split targets by meal, score how well something fits with an explainable formula, and rank with a reason.

### Challenges

1. Add fiber to the score and decide how many points it's worth.
2. Let the person set their own meal shares, checking they add up to 100%.
3. Write a test that a recipe right on both targets scores 100.
