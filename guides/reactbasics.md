---
id: reactbasics
title: React basics
goals: Explain what React does and why apps are built from components; Write components with JSX and pass them props; Keep changing data in state and update it from events; Show lists with keys and handle forms as controlled inputs; Run side effects like saving and fetching with useEffect; Build a React app into plain files with esbuild and publish it on GitHub Pages
prereqs: The HTML & CSS basics and JavaScript basics guides; Node.js installed (the Get set up guide)
---

## Session: Components, props and state

## Step: Why React?
kind: read
time: 12

In the JavaScript guides you changed the page by hand: find an element, change its text, add a class, remove a card. That works for a small page, but in a bigger app it gets hard to keep every part of the screen in step with the data. Change a task's status and you have to remember to update its card, the column counts, the progress bar and the calendar.

**React** turns this around. You describe what the screen should look like **for the data you have now**, and React works out what to change in the page. When the data changes, you change the data, and React redraws the parts that depend on it. It's the same idea as the "draw everything from data" rule in the Canvas and App state lessons, done for HTML.

```svg With plain JavaScript you change the data and every part of the page yourself; with React you change the data and React updates the page
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 170" font-family="sans-serif" font-size="12">
  <rect width="520" height="170" fill="#ffffff"/>
  <text x="130" y="18" text-anchor="middle" font-weight="bold">Plain JavaScript</text>
  <rect x="80" y="28" width="100" height="30" rx="6" fill="#fef3c7" stroke="#f59e0b"/><text x="130" y="48" text-anchor="middle">data changes</text>
  <rect x="10" y="100" width="70" height="28" rx="6" fill="#e5e7eb"/><text x="45" y="118" text-anchor="middle">card</text>
  <rect x="95" y="100" width="70" height="28" rx="6" fill="#e5e7eb"/><text x="130" y="118" text-anchor="middle">count</text>
  <rect x="180" y="100" width="70" height="28" rx="6" fill="#e5e7eb"/><text x="215" y="118" text-anchor="middle">chart</text>
  <path d="M110 58 L45 98 M130 58 V98 M150 58 L215 98" stroke="#b45309" stroke-width="2"/>
  <text x="130" y="152" text-anchor="middle" fill="#6b7280">you update each part by hand</text>
  <text x="390" y="18" text-anchor="middle" font-weight="bold">React</text>
  <rect x="340" y="28" width="100" height="30" rx="6" fill="#fef3c7" stroke="#f59e0b"/><text x="390" y="48" text-anchor="middle">data changes</text>
  <rect x="340" y="68" width="100" height="24" rx="6" fill="#dbeafe" stroke="#2563eb"/><text x="390" y="85" text-anchor="middle">React redraws</text>
  <rect x="285" y="104" width="64" height="26" rx="6" fill="#e5e7eb"/><text x="317" y="121" text-anchor="middle">card</text>
  <rect x="358" y="104" width="64" height="26" rx="6" fill="#e5e7eb"/><text x="390" y="121" text-anchor="middle">count</text>
  <rect x="431" y="104" width="64" height="26" rx="6" fill="#e5e7eb"/><text x="463" y="121" text-anchor="middle">chart</text>
  <path d="M390 58 V66 M370 92 L317 102 M390 92 V102 M410 92 L463 102" stroke="#2563eb" stroke-width="2"/>
  <text x="390" y="152" text-anchor="middle" fill="#6b7280">you only change the data</text>
</svg>
```

### Components

A React app is built from **components**: functions that return a piece of the screen. A weather app might have `TodayCard`, `DayCard`, `RainChart` and `Search`. Each one is small, has one job, and can be used many times (seven `DayCard`s for seven days).

### Set up a project

React needs a build step, because browsers don't understand JSX (the HTML-like syntax below). This course uses **esbuild**, a fast bundler with one command. In a new folder:

```text
npm init -y
npm install react react-dom
npm install --save-dev esbuild
```

Make `src/main.jsx`, `public/index.html` (with `<div id="root"></div>` and `<script src="app.js"></script>`) and build with:

```text
npx esbuild src/main.jsx --bundle --jsx=automatic --outfile=docs/app.js --servedir=docs
```

The last step of this guide turns that into a proper `build.mjs` script.

quiz: What does React change about how you update the page?
- [ ] React stores your data on a server
- [x] You describe the screen for the current data, and React works out what to change in the page
- [ ] You no longer need HTML or CSS
why: You change the data; React redraws the parts of the page that depend on it.

quiz: Why does a React project need a build step like esbuild?
- [ ] React only runs on Node
- [x] Browsers don't understand JSX, so it has to be turned into plain JavaScript first
- [ ] To make the page work offline
why: esbuild compiles JSX to JavaScript and bundles React and your files into one script.

## Step: JSX and props
kind: read
time: 15

A component is a function whose name starts with a capital letter and that returns **JSX**:

```jsx
function DayCard({ day, high, low }) {
  return (
    <article className="day">
      <h3>{day}</h3>
      <p className="hi">{high}°</p>
      <p className="lo">{low}°</p>
    </article>
  );
}
```

- JSX looks like HTML, but it's JavaScript. `class` is written `className` (because `class` is a JavaScript word), and `for` on a label is `htmlFor`.
- Anything inside `{ }` is a JavaScript expression: a variable, `high + 1`, a function call.
- A component returns **one** outer element. To return two side by side without an extra `<div>`, wrap them in `<>…</>` (a fragment).
- Text in `{ }` is **escaped automatically**. If a city name contains `<script>`, React shows it as text. That's the "show text safely" rule from the Random picks lesson, built in.

### Props

`{ day, high, low }` are the component's **props**: values passed in from outside, like attributes on an HTML tag. The parent uses the component like a tag:

```jsx
function Week() {
  return (
    <div className="week">
      <DayCard day="Fri" high={80} low={66} />
      <DayCard day="Sat" high={77} low={64} />
    </div>
  );
}
```

Strings can be quoted; anything else (numbers, objects, functions) goes in `{ }`. A component never changes its own props: they belong to the parent. Data flows **down**, from parents to children.

```svg Props flow down: App passes data to Week, and Week passes one day to each DayCard
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 150" font-family="sans-serif" font-size="12">
  <rect width="520" height="150" fill="#ffffff"/>
  <rect x="210" y="10" width="100" height="30" rx="6" fill="#dbeafe" stroke="#2563eb"/><text x="260" y="30" text-anchor="middle" font-weight="bold">App</text>
  <rect x="210" y="62" width="100" height="30" rx="6" fill="#dbeafe" stroke="#2563eb"/><text x="260" y="82" text-anchor="middle">Week</text>
  <rect x="60" y="112" width="110" height="30" rx="6" fill="#e0e7ff"/><text x="115" y="132" text-anchor="middle">DayCard Fri</text>
  <rect x="205" y="112" width="110" height="30" rx="6" fill="#e0e7ff"/><text x="260" y="132" text-anchor="middle">DayCard Sat</text>
  <rect x="350" y="112" width="110" height="30" rx="6" fill="#e0e7ff"/><text x="405" y="132" text-anchor="middle">DayCard Sun</text>
  <path d="M260 40 V60 M240 92 L130 110 M260 92 V110 M280 92 L390 110" stroke="#2563eb" stroke-width="2"/>
  <text x="330" y="55" fill="#6b7280">days={forecast}</text>
  <text x="80" y="104" fill="#6b7280">day="Fri" high={80}</text>
</svg>
```

Start the app in `src/main.jsx`:

```jsx
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
```

quiz: How do you give a JSX element a CSS class?
- [ ] `class="day"`
- [x] `className="day"`
- [ ] `style="day"`
why: `class` is a reserved word in JavaScript, so JSX uses `className`.

quiz: A city name from an API contains `<b>`. What does `<h2>{city}</h2>` show?
- [ ] Bold text
- [x] The characters `<b>` as text, because React escapes text in { }
- [ ] An error
why: React escapes values you put in JSX, so data can't add HTML to the page.

## Step: State and events
kind: read
time: 18

Props come from outside. Data that **changes over time inside a component** (what's typed in a box, which tab is open, the list of tasks) lives in **state**, created with the `useState` hook:

```jsx
import { useState } from 'react';

function UnitToggle() {
  const [unit, setUnit] = useState('f');           // the value, and the function that changes it
  return (
    <div className="seg" role="group" aria-label="Temperature unit">
      <button type="button" aria-pressed={unit === 'f'} onClick={() => setUnit('f')}>°F</button>
      <button type="button" aria-pressed={unit === 'c'} onClick={() => setUnit('c')}>°C</button>
    </div>
  );
}
```

- `useState('f')` returns the current value and a setter. **Calling the setter is how you change it**: React stores the new value and draws the component again. Changing the variable directly (`unit = 'c'`) does nothing on screen.
- Events are props too: `onClick`, `onChange`, `onSubmit`, `onKeyDown`. Give them a function; don't call it (`onClick={go}`, not `onClick={go()}`).
- Hooks (functions starting with `use`) must be called at the top of the component, every time, in the same order: never inside an `if` or a loop.

### Never change state in place

State that is an object or array is **replaced**, never edited:

```jsx
const [tasks, setTasks] = useState([]);

// wrong: changes the old array, so React may not notice anything changed
tasks.push(newTask);

// right: a new array with the old tasks plus the new one
setTasks((old) => [...old, newTask]);
// edit one: a new array where that task is replaced by a new object
setTasks((old) => old.map((t) => (t.id === id ? { ...t, done: true } : t)));
```

This is exactly the rule from the **App state** lesson: actions return new copies. Passing a function (`old => …`) to the setter always starts from the newest value, even when several updates happen quickly.

### Lifting state up

When two components need the same data (a unit toggle and the temperature cards), the state lives in their **closest common parent**, which passes the value down as a prop and a function to change it:

```jsx
function App() {
  const [unit, setUnit] = useState('f');
  return <><UnitToggle unit={unit} onChange={setUnit} /><Week unit={unit} /></>;
}
```

```svg Lifting state: App owns the unit; the toggle gets it plus a function to change it, the cards just read it
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 140" font-family="sans-serif" font-size="12">
  <rect width="520" height="140" fill="#ffffff"/>
  <rect x="190" y="10" width="140" height="40" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="260" y="28" text-anchor="middle" font-weight="bold">App</text><text x="260" y="43" text-anchor="middle">unit = 'f'</text>
  <rect x="40" y="90" width="160" height="36" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="120" y="112" text-anchor="middle">UnitToggle</text>
  <rect x="320" y="90" width="160" height="36" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="400" y="112" text-anchor="middle">Week</text>
  <path d="M230 50 L130 88 M290 50 L390 88" stroke="#2563eb" stroke-width="2"/>
  <path d="M150 88 L245 52" stroke="#b45309" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="60" y="70" fill="#6b7280">unit + onChange</text><text x="350" y="70" fill="#6b7280">unit</text>
  <text x="200" y="80" fill="#b45309">calls onChange('c')</text>
</svg>
```

quiz: How do you change a value created with `const [unit, setUnit] = useState('f')`?
- [ ] `unit = 'c'`
- [x] `setUnit('c')`
- [ ] `useState('c')`
why: The setter stores the new value and makes React draw the component again.

quiz: Which is the right way to add a task to state?
- [ ] `tasks.push(task)`
- [x] `setTasks((old) => [...old, task])`
- [ ] `tasks = [...tasks, task]`
why: State is replaced with a new array; editing the old one in place can leave the screen unchanged.

## Session: Lists, forms and effects

## Step: Lists, keys and forms
kind: read
time: 16

### Lists

Show an array by turning each item into JSX with `map`:

```jsx
<ol className="cards">
  {tasks.map((t) => <Card key={t.id} task={t} />)}
</ol>
```

Every item needs a **`key`**: a value that's unique in the list and stays the same for that item (an id, not the position). React uses keys to know which card is which when the list changes, so typing in one card's box doesn't jump to another card after a reorder. Never use `Math.random()` as a key: it changes every time.

### Conditional parts

```jsx
{error && <p role="alert">{error}</p>}                 // only when there's an error
{loading ? <Spinner /> : <Week days={days} />}         // one or the other
```

### Forms: controlled inputs

In React, a form field shows a value from state and reports every change:

```jsx
function NewTask({ onAdd }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();                       // stop the browser reloading the page
    if (!title.trim()) { setError('Give the task a title.'); return; }
    onAdd(title.trim());
    setTitle('');
  };
  return (
    <form onSubmit={submit} noValidate>
      <label>Title <input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Add</button>
    </form>
  );
}
```

The input's `value` always comes from state, and `onChange` updates state. That's a **controlled input**: state is the single source of truth, so you can check, clear or change the field from code. Check input in one plain function (the projects call it `cleanTask` or `cleanTx`) and show its message, exactly like the sign-up checks in the Accounts lesson.

```svg A controlled input: what you type goes to state through onChange, and the box always shows the value in state
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 120" font-family="sans-serif" font-size="12">
  <rect width="520" height="120" fill="#ffffff"/>
  <rect x="30" y="40" width="170" height="40" rx="8" fill="#f3f4f6" stroke="#9ca3af"/><text x="115" y="65" text-anchor="middle">&lt;input value={title}&gt;</text>
  <rect x="320" y="40" width="170" height="40" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="405" y="65" text-anchor="middle">state: title</text>
  <path d="M200 52 H316" stroke="#2563eb" stroke-width="2"/><text x="258" y="44" text-anchor="middle" fill="#2563eb">onChange → setTitle</text>
  <path d="M320 70 H204" stroke="#b45309" stroke-width="2"/><text x="262" y="96" text-anchor="middle" fill="#b45309">value comes back from state</text>
</svg>
```

quiz: Why does every item in a list need a `key`?
- [ ] Keys make the list sort itself
- [x] So React can tell which item is which when the list changes
- [ ] Keys are the item's text for screen readers
why: A stable, unique key (like an id) lets React keep each item's DOM and state with the right item.

quiz: What makes an input "controlled"?
- [ ] It has the `required` attribute
- [x] Its value comes from state and onChange updates that state
- [ ] It's inside a form
why: State is the single source of truth for what the box shows.

## Step: Effects: saving and fetching
kind: read
time: 18

Drawing should only **describe** the screen. Anything that reaches outside React (saving to `localStorage`, fetching from an API, setting a timer, changing `document.title`) is a **side effect**, and goes in `useEffect`:

```jsx
import { useEffect, useState } from 'react';

function App() {
  const [tasks, setTasks] = useState(() => load());       // a function: only runs on the first draw

  useEffect(() => {
    save(tasks);                                            // runs after every draw where tasks changed
  }, [tasks]);
  // …
}
```

The array at the end is the **dependency list**: the effect runs after the first draw and again whenever one of those values changes. `[]` means "only once, after the first draw".

### Fetching

```jsx
function Forecast({ city }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;                          // turns false if city changes before this finishes
    setError('');
    fetch(forecastUrl(city))
      .then((res) => { if (!res.ok) throw new Error(`The weather service answered ${res.status}.`); return res.json(); })
      .then((json) => { if (current) setData(parseForecast(json)); })
      .catch((e) => { if (current) setError(e.message); });
    return () => { current = false; };            // cleanup: runs before the next effect
  }, [city]);

  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p>Loading…</p>;
  return <Week days={data.days} />;
}
```

- The function returned from an effect is its **cleanup**. It runs before the effect runs again (and when the component goes away). Here it marks the old request as stale, so a slow answer for the **previous** city can't overwrite the new one: the "late responses" problem from the Caching lesson.
- Clean up timers too: `const t = setTimeout(…); return () => clearTimeout(t);`. That's how a search box waits for you to stop typing before it searches.
- In development, React's `<StrictMode>` runs every effect twice on purpose, to catch effects that don't clean up.

```svg The life of an effect: draw, then the effect runs; when city changes, the cleanup runs, then the effect runs again
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 110" font-family="sans-serif" font-size="12">
  <rect width="520" height="110" fill="#ffffff"/>
  <rect x="10" y="40" width="90" height="34" rx="6" fill="#dbeafe" stroke="#2563eb"/><text x="55" y="61" text-anchor="middle">draw</text>
  <rect x="120" y="40" width="110" height="34" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="175" y="61" text-anchor="middle">effect: fetch</text>
  <rect x="250" y="40" width="110" height="34" rx="6" fill="#fef3c7" stroke="#f59e0b"/><text x="305" y="61" text-anchor="middle">city changes</text>
  <rect x="380" y="40" width="130" height="34" rx="6" fill="#fee2e2" stroke="#dc2626"/><text x="445" y="56" text-anchor="middle">cleanup, then</text><text x="445" y="69" text-anchor="middle">effect again</text>
  <path d="M100 57 H118 M230 57 H248 M360 57 H378" stroke="#374151" stroke-width="2"/>
  <text x="260" y="100" text-anchor="middle" fill="#6b7280">the dependency list [city] decides when the effect runs again</text>
</svg>
```

quiz: When does `useEffect(fn, [city])` run `fn`?
- [ ] Before every draw
- [x] After the first draw, and after any draw where `city` changed
- [ ] Only when the user clicks
why: The dependency list tells React which values the effect depends on.

quiz: What is the cleanup function in the fetch example for?
- [ ] It deletes the data after showing it
- [x] It marks the old request as stale so a late answer for the previous city is ignored
- [ ] It retries the request
why: Cleanup runs before the next effect, so only the newest request can set state.

## Step: Building and publishing
kind: read
time: 14

Put the build in a small script so `npm start` and `npm run build` do the right thing. `build.mjs`:

```js
import * as esbuild from 'esbuild';
import { cp, mkdir } from 'node:fs/promises';

const serve = process.argv.includes('--serve');
await mkdir('docs', { recursive: true });
await cp('public', 'docs', { recursive: true });         // index.html, styles.css, icon

const options = {
  entryPoints: ['src/main.jsx'], bundle: true, outfile: 'docs/app.js', jsx: 'automatic',
  minify: !serve, sourcemap: serve,
  define: { 'process.env.NODE_ENV': serve ? '"development"' : '"production"' },
};

if (serve) {
  const ctx = await esbuild.context(options);
  await ctx.watch();                                       // rebuild on every save
  await ctx.serve({ servedir: 'docs', port: 8000 });
} else {
  await esbuild.build(options);
}
```

and in `package.json`:

```json
"scripts": { "start": "node build.mjs --serve", "build": "node build.mjs", "test": "node --test \"test/*.test.js\"" }
```

- **Development:** `npm start`, then open http://localhost:8000. Save a file and reload.
- **Publish:** `npm run build`, commit `docs/`, and on GitHub open **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/docs`. The site appears at `https://<you>.github.io/<repo>/`.
- `process.env.NODE_ENV = "production"` switches React to its small, fast production build.

### Keep the rules out of React

The projects in this course keep their rules (parsing API data, moving tasks, adding up money) in plain files under `src/lib/` with **no React in them**. Components only call them. That keeps components short, and the rules are tested in Node with `node --test`, exactly like the earlier projects.

```svg Project layout: plain rules in src/lib (tested in Node), components in src/components, built by esbuild into docs/ for GitHub Pages
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 130" font-family="sans-serif" font-size="12">
  <rect width="520" height="130" fill="#ffffff"/>
  <rect x="10" y="20" width="140" height="40" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="80" y="38" text-anchor="middle" font-weight="bold">src/lib</text><text x="80" y="52" text-anchor="middle">rules, no React</text>
  <rect x="10" y="76" width="140" height="40" rx="6" fill="#dbeafe" stroke="#2563eb"/><text x="80" y="94" text-anchor="middle" font-weight="bold">src/components</text><text x="80" y="108" text-anchor="middle">what's on screen</text>
  <rect x="200" y="48" width="110" height="40" rx="6" fill="#fef3c7" stroke="#f59e0b"/><text x="255" y="72" text-anchor="middle">esbuild</text>
  <rect x="360" y="48" width="150" height="40" rx="6" fill="#e5e7eb"/><text x="435" y="66" text-anchor="middle" font-weight="bold">docs/</text><text x="435" y="80" text-anchor="middle">GitHub Pages</text>
  <path d="M150 40 L198 62 M150 96 L198 74 M310 68 H358" stroke="#374151" stroke-width="2"/>
  <text x="80" y="14" text-anchor="middle" fill="#16a34a">node --test</text>
</svg>
```

quiz: Where does GitHub Pages serve these projects from?
- [ ] The `src/` folder
- [x] The `docs/` folder on the main branch, which `npm run build` writes
- [ ] A separate server you run
why: The build writes plain HTML, CSS and one script to `docs/`, which Pages serves as static files.

quiz: Why keep rules like parsing and totals in `src/lib/` without React?
- [ ] React can't do math
- [x] Components stay short, and the rules can be tested in Node without a browser
- [ ] GitHub Pages requires it
why: Plain functions are easy to test and reuse; components only call them.

## Finish

You can build a React app from scratch now. You learned:

- **Components** that return JSX, and **props** that flow down
- **State** with `useState`, events, never changing state in place, and **lifting state up**
- **Lists with keys**, conditional parts and **controlled inputs**
- **useEffect** for saving and fetching, with **cleanup** so late answers are ignored
- **Building with esbuild** and publishing `docs/` on **GitHub Pages**

### Challenges

1. Build a counter with + and − buttons that can't go below 0, and saves its value in localStorage.
2. Make a to-do list with add, tick off and delete, using keys and immutable updates.
3. Fetch a random joke from an API in an effect, with Loading… and an error message.

### Next

The **Fetching data in React** lesson, then the **Weatherboard** project.
