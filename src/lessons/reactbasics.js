// Built from guides/reactbasics.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "reactbasics",
 "title": "React basics",
 "goals": [
  "Explain what React does and why apps are built from components",
  "Write components with JSX and pass them props",
  "Keep changing data in state and update it from events",
  "Show lists with keys and handle forms as controlled inputs",
  "Run side effects like saving and fetching with useEffect",
  "Build a React app into plain files with esbuild and publish it on GitHub Pages"
 ],
 "prereqs": [
  "The HTML & CSS basics and JavaScript basics guides",
  "Node.js installed (the Get set up guide)"
 ],
 "sessions": [
  {
   "title": "Components, props and state",
   "from": 0,
   "to": 2
  },
  {
   "title": "Lists, forms and effects",
   "from": 3,
   "to": 5
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "Why React?",
   "body": "In the JavaScript guides you changed the page by hand: find an element, change its text, add a class, remove a card. That works for a small page, but in a bigger app it gets hard to keep every part of the screen in step with the data. Change a task's status and you have to remember to update its card, the column counts, the progress bar and the calendar.\n\n**React** turns this around. You describe what the screen should look like **for the data you have now**, and React works out what to change in the page. When the data changes, you change the data, and React redraws the parts that depend on it. It's the same idea as the \"draw everything from data\" rule in the Canvas and App state lessons, done for HTML.\n\n```svg With plain JavaScript you change the data and every part of the page yourself; with React you change the data and React updates the page\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 170\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"170\" fill=\"#ffffff\"/>\n  <text x=\"130\" y=\"18\" text-anchor=\"middle\" font-weight=\"bold\">Plain JavaScript</text>\n  <rect x=\"80\" y=\"28\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"130\" y=\"48\" text-anchor=\"middle\">data changes</text>\n  <rect x=\"10\" y=\"100\" width=\"70\" height=\"28\" rx=\"6\" fill=\"#e5e7eb\"/><text x=\"45\" y=\"118\" text-anchor=\"middle\">card</text>\n  <rect x=\"95\" y=\"100\" width=\"70\" height=\"28\" rx=\"6\" fill=\"#e5e7eb\"/><text x=\"130\" y=\"118\" text-anchor=\"middle\">count</text>\n  <rect x=\"180\" y=\"100\" width=\"70\" height=\"28\" rx=\"6\" fill=\"#e5e7eb\"/><text x=\"215\" y=\"118\" text-anchor=\"middle\">chart</text>\n  <path d=\"M110 58 L45 98 M130 58 V98 M150 58 L215 98\" stroke=\"#b45309\" stroke-width=\"2\"/>\n  <text x=\"130\" y=\"152\" text-anchor=\"middle\" fill=\"#6b7280\">you update each part by hand</text>\n  <text x=\"390\" y=\"18\" text-anchor=\"middle\" font-weight=\"bold\">React</text>\n  <rect x=\"340\" y=\"28\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"390\" y=\"48\" text-anchor=\"middle\">data changes</text>\n  <rect x=\"340\" y=\"68\" width=\"100\" height=\"24\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"390\" y=\"85\" text-anchor=\"middle\">React redraws</text>\n  <rect x=\"285\" y=\"104\" width=\"64\" height=\"26\" rx=\"6\" fill=\"#e5e7eb\"/><text x=\"317\" y=\"121\" text-anchor=\"middle\">card</text>\n  <rect x=\"358\" y=\"104\" width=\"64\" height=\"26\" rx=\"6\" fill=\"#e5e7eb\"/><text x=\"390\" y=\"121\" text-anchor=\"middle\">count</text>\n  <rect x=\"431\" y=\"104\" width=\"64\" height=\"26\" rx=\"6\" fill=\"#e5e7eb\"/><text x=\"463\" y=\"121\" text-anchor=\"middle\">chart</text>\n  <path d=\"M390 58 V66 M370 92 L317 102 M390 92 V102 M410 92 L463 102\" stroke=\"#2563eb\" stroke-width=\"2\"/>\n  <text x=\"390\" y=\"152\" text-anchor=\"middle\" fill=\"#6b7280\">you only change the data</text>\n</svg>\n```\n\n### Components\n\nA React app is built from **components**: functions that return a piece of the screen. A weather app might have `TodayCard`, `DayCard`, `RainChart` and `Search`. Each one is small, has one job, and can be used many times (seven `DayCard`s for seven days).\n\n### Set up a project\n\nReact needs a build step, because browsers don't understand JSX (the HTML-like syntax below). This course uses **esbuild**, a fast bundler with one command. In a new folder:\n\n```text\nnpm init -y\nnpm install react react-dom\nnpm install --save-dev esbuild\n```\n\nMake `src/main.jsx`, `public/index.html` (with `<div id=\"root\"></div>` and `<script src=\"app.js\"></script>`) and build with:\n\n```text\nnpx esbuild src/main.jsx --bundle --jsx=automatic --outfile=docs/app.js --servedir=docs\n```\n\nThe last step of this guide turns that into a proper `build.mjs` script.",
   "quiz": [
    {
     "q": "What does React change about how you update the page?",
     "options": [
      "React stores your data on a server",
      "You describe the screen for the current data, and React works out what to change in the page",
      "You no longer need HTML or CSS"
     ],
     "answer": 1,
     "why": "You change the data; React redraws the parts of the page that depend on it."
    },
    {
     "q": "Why does a React project need a build step like esbuild?",
     "options": [
      "React only runs on Node",
      "Browsers don't understand JSX, so it has to be turned into plain JavaScript first",
      "To make the page work offline"
     ],
     "answer": 1,
     "why": "esbuild compiles JSX to JavaScript and bundles React and your files into one script."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "JSX and props",
   "body": "A component is a function whose name starts with a capital letter and that returns **JSX**:\n\n```jsx\nfunction DayCard({ day, high, low }) {\n  return (\n    <article className=\"day\">\n      <h3>{day}</h3>\n      <p className=\"hi\">{high}°</p>\n      <p className=\"lo\">{low}°</p>\n    </article>\n  );\n}\n```\n\n- JSX looks like HTML, but it's JavaScript. `class` is written `className` (because `class` is a JavaScript word), and `for` on a label is `htmlFor`.\n- Anything inside `{ }` is a JavaScript expression: a variable, `high + 1`, a function call.\n- A component returns **one** outer element. To return two side by side without an extra `<div>`, wrap them in `<>…</>` (a fragment).\n- Text in `{ }` is **escaped automatically**. If a city name contains `<script>`, React shows it as text. That's the \"show text safely\" rule from the Random picks lesson, built in.\n\n### Props\n\n`{ day, high, low }` are the component's **props**: values passed in from outside, like attributes on an HTML tag. The parent uses the component like a tag:\n\n```jsx\nfunction Week() {\n  return (\n    <div className=\"week\">\n      <DayCard day=\"Fri\" high={80} low={66} />\n      <DayCard day=\"Sat\" high={77} low={64} />\n    </div>\n  );\n}\n```\n\nStrings can be quoted; anything else (numbers, objects, functions) goes in `{ }`. A component never changes its own props: they belong to the parent. Data flows **down**, from parents to children.\n\n```svg Props flow down: App passes data to Week, and Week passes one day to each DayCard\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"150\" fill=\"#ffffff\"/>\n  <rect x=\"210\" y=\"10\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"260\" y=\"30\" text-anchor=\"middle\" font-weight=\"bold\">App</text>\n  <rect x=\"210\" y=\"62\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"260\" y=\"82\" text-anchor=\"middle\">Week</text>\n  <rect x=\"60\" y=\"112\" width=\"110\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"115\" y=\"132\" text-anchor=\"middle\">DayCard Fri</text>\n  <rect x=\"205\" y=\"112\" width=\"110\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"260\" y=\"132\" text-anchor=\"middle\">DayCard Sat</text>\n  <rect x=\"350\" y=\"112\" width=\"110\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"405\" y=\"132\" text-anchor=\"middle\">DayCard Sun</text>\n  <path d=\"M260 40 V60 M240 92 L130 110 M260 92 V110 M280 92 L390 110\" stroke=\"#2563eb\" stroke-width=\"2\"/>\n  <text x=\"330\" y=\"55\" fill=\"#6b7280\">days={forecast}</text>\n  <text x=\"80\" y=\"104\" fill=\"#6b7280\">day=\"Fri\" high={80}</text>\n</svg>\n```\n\nStart the app in `src/main.jsx`:\n\n```jsx\nimport { createRoot } from 'react-dom/client';\nimport App from './App.jsx';\n\ncreateRoot(document.getElementById('root')).render(<App />);\n```",
   "quiz": [
    {
     "q": "How do you give a JSX element a CSS class?",
     "options": [
      "`class=\"day\"`",
      "`className=\"day\"`",
      "`style=\"day\"`"
     ],
     "answer": 1,
     "why": "`class` is a reserved word in JavaScript, so JSX uses `className`."
    },
    {
     "q": "A city name from an API contains `<b>`. What does `<h2>{city}</h2>` show?",
     "options": [
      "Bold text",
      "The characters `<b>` as text, because React escapes text in { }",
      "An error"
     ],
     "answer": 1,
     "why": "React escapes values you put in JSX, so data can't add HTML to the page."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "State and events",
   "body": "Props come from outside. Data that **changes over time inside a component** (what's typed in a box, which tab is open, the list of tasks) lives in **state**, created with the `useState` hook:\n\n```jsx\nimport { useState } from 'react';\n\nfunction UnitToggle() {\n  const [unit, setUnit] = useState('f');           // the value, and the function that changes it\n  return (\n    <div className=\"seg\" role=\"group\" aria-label=\"Temperature unit\">\n      <button type=\"button\" aria-pressed={unit === 'f'} onClick={() => setUnit('f')}>°F</button>\n      <button type=\"button\" aria-pressed={unit === 'c'} onClick={() => setUnit('c')}>°C</button>\n    </div>\n  );\n}\n```\n\n- `useState('f')` returns the current value and a setter. **Calling the setter is how you change it**: React stores the new value and draws the component again. Changing the variable directly (`unit = 'c'`) does nothing on screen.\n- Events are props too: `onClick`, `onChange`, `onSubmit`, `onKeyDown`. Give them a function; don't call it (`onClick={go}`, not `onClick={go()}`).\n- Hooks (functions starting with `use`) must be called at the top of the component, every time, in the same order: never inside an `if` or a loop.\n\n### Never change state in place\n\nState that is an object or array is **replaced**, never edited:\n\n```jsx\nconst [tasks, setTasks] = useState([]);\n\n// wrong: changes the old array, so React may not notice anything changed\ntasks.push(newTask);\n\n// right: a new array with the old tasks plus the new one\nsetTasks((old) => [...old, newTask]);\n// edit one: a new array where that task is replaced by a new object\nsetTasks((old) => old.map((t) => (t.id === id ? { ...t, done: true } : t)));\n```\n\nThis is exactly the rule from the **App state** lesson: actions return new copies. Passing a function (`old => …`) to the setter always starts from the newest value, even when several updates happen quickly.\n\n### Lifting state up\n\nWhen two components need the same data (a unit toggle and the temperature cards), the state lives in their **closest common parent**, which passes the value down as a prop and a function to change it:\n\n```jsx\nfunction App() {\n  const [unit, setUnit] = useState('f');\n  return <><UnitToggle unit={unit} onChange={setUnit} /><Week unit={unit} /></>;\n}\n```\n\n```svg Lifting state: App owns the unit; the toggle gets it plus a function to change it, the cards just read it\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 140\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"140\" fill=\"#ffffff\"/>\n  <rect x=\"190\" y=\"10\" width=\"140\" height=\"40\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"260\" y=\"28\" text-anchor=\"middle\" font-weight=\"bold\">App</text><text x=\"260\" y=\"43\" text-anchor=\"middle\">unit = 'f'</text>\n  <rect x=\"40\" y=\"90\" width=\"160\" height=\"36\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"120\" y=\"112\" text-anchor=\"middle\">UnitToggle</text>\n  <rect x=\"320\" y=\"90\" width=\"160\" height=\"36\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"400\" y=\"112\" text-anchor=\"middle\">Week</text>\n  <path d=\"M230 50 L130 88 M290 50 L390 88\" stroke=\"#2563eb\" stroke-width=\"2\"/>\n  <path d=\"M150 88 L245 52\" stroke=\"#b45309\" stroke-width=\"2\" stroke-dasharray=\"5 4\"/>\n  <text x=\"60\" y=\"70\" fill=\"#6b7280\">unit + onChange</text><text x=\"350\" y=\"70\" fill=\"#6b7280\">unit</text>\n  <text x=\"200\" y=\"80\" fill=\"#b45309\">calls onChange('c')</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "How do you change a value created with `const [unit, setUnit] = useState('f')`?",
     "options": [
      "`unit = 'c'`",
      "`setUnit('c')`",
      "`useState('c')`"
     ],
     "answer": 1,
     "why": "The setter stores the new value and makes React draw the component again."
    },
    {
     "q": "Which is the right way to add a task to state?",
     "options": [
      "`tasks.push(task)`",
      "`setTasks((old) => [...old, task])`",
      "`tasks = [...tasks, task]`"
     ],
     "answer": 1,
     "why": "State is replaced with a new array; editing the old one in place can leave the screen unchanged."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Lists, keys and forms",
   "body": "### Lists\n\nShow an array by turning each item into JSX with `map`:\n\n```jsx\n<ol className=\"cards\">\n  {tasks.map((t) => <Card key={t.id} task={t} />)}\n</ol>\n```\n\nEvery item needs a **`key`**: a value that's unique in the list and stays the same for that item (an id, not the position). React uses keys to know which card is which when the list changes, so typing in one card's box doesn't jump to another card after a reorder. Never use `Math.random()` as a key: it changes every time.\n\n### Conditional parts\n\n```jsx\n{error && <p role=\"alert\">{error}</p>}                 // only when there's an error\n{loading ? <Spinner /> : <Week days={days} />}         // one or the other\n```\n\n### Forms: controlled inputs\n\nIn React, a form field shows a value from state and reports every change:\n\n```jsx\nfunction NewTask({ onAdd }) {\n  const [title, setTitle] = useState('');\n  const [error, setError] = useState('');\n  const submit = (e) => {\n    e.preventDefault();                       // stop the browser reloading the page\n    if (!title.trim()) { setError('Give the task a title.'); return; }\n    onAdd(title.trim());\n    setTitle('');\n  };\n  return (\n    <form onSubmit={submit} noValidate>\n      <label>Title <input value={title} onChange={(e) => setTitle(e.target.value)} /></label>\n      {error && <p role=\"alert\">{error}</p>}\n      <button type=\"submit\">Add</button>\n    </form>\n  );\n}\n```\n\nThe input's `value` always comes from state, and `onChange` updates state. That's a **controlled input**: state is the single source of truth, so you can check, clear or change the field from code. Check input in one plain function (the projects call it `cleanTask` or `cleanTx`) and show its message, exactly like the sign-up checks in the Accounts lesson.\n\n```svg A controlled input: what you type goes to state through onChange, and the box always shows the value in state\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"120\" fill=\"#ffffff\"/>\n  <rect x=\"30\" y=\"40\" width=\"170\" height=\"40\" rx=\"8\" fill=\"#f3f4f6\" stroke=\"#9ca3af\"/><text x=\"115\" y=\"65\" text-anchor=\"middle\">&lt;input value={title}&gt;</text>\n  <rect x=\"320\" y=\"40\" width=\"170\" height=\"40\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"405\" y=\"65\" text-anchor=\"middle\">state: title</text>\n  <path d=\"M200 52 H316\" stroke=\"#2563eb\" stroke-width=\"2\"/><text x=\"258\" y=\"44\" text-anchor=\"middle\" fill=\"#2563eb\">onChange → setTitle</text>\n  <path d=\"M320 70 H204\" stroke=\"#b45309\" stroke-width=\"2\"/><text x=\"262\" y=\"96\" text-anchor=\"middle\" fill=\"#b45309\">value comes back from state</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does every item in a list need a `key`?",
     "options": [
      "Keys make the list sort itself",
      "So React can tell which item is which when the list changes",
      "Keys are the item's text for screen readers"
     ],
     "answer": 1,
     "why": "A stable, unique key (like an id) lets React keep each item's DOM and state with the right item."
    },
    {
     "q": "What makes an input \"controlled\"?",
     "options": [
      "It has the `required` attribute",
      "Its value comes from state and onChange updates that state",
      "It's inside a form"
     ],
     "answer": 1,
     "why": "State is the single source of truth for what the box shows."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 16
  },
  {
   "title": "Effects: saving and fetching",
   "body": "Drawing should only **describe** the screen. Anything that reaches outside React (saving to `localStorage`, fetching from an API, setting a timer, changing `document.title`) is a **side effect**, and goes in `useEffect`:\n\n```jsx\nimport { useEffect, useState } from 'react';\n\nfunction App() {\n  const [tasks, setTasks] = useState(() => load());       // a function: only runs on the first draw\n\n  useEffect(() => {\n    save(tasks);                                            // runs after every draw where tasks changed\n  }, [tasks]);\n  // …\n}\n```\n\nThe array at the end is the **dependency list**: the effect runs after the first draw and again whenever one of those values changes. `[]` means \"only once, after the first draw\".\n\n### Fetching\n\n```jsx\nfunction Forecast({ city }) {\n  const [data, setData] = useState(null);\n  const [error, setError] = useState('');\n\n  useEffect(() => {\n    let current = true;                          // turns false if city changes before this finishes\n    setError('');\n    fetch(forecastUrl(city))\n      .then((res) => { if (!res.ok) throw new Error(`The weather service answered ${res.status}.`); return res.json(); })\n      .then((json) => { if (current) setData(parseForecast(json)); })\n      .catch((e) => { if (current) setError(e.message); });\n    return () => { current = false; };            // cleanup: runs before the next effect\n  }, [city]);\n\n  if (error) return <p role=\"alert\">{error}</p>;\n  if (!data) return <p>Loading…</p>;\n  return <Week days={data.days} />;\n}\n```\n\n- The function returned from an effect is its **cleanup**. It runs before the effect runs again (and when the component goes away). Here it marks the old request as stale, so a slow answer for the **previous** city can't overwrite the new one: the \"late responses\" problem from the Caching lesson.\n- Clean up timers too: `const t = setTimeout(…); return () => clearTimeout(t);`. That's how a search box waits for you to stop typing before it searches.\n- In development, React's `<StrictMode>` runs every effect twice on purpose, to catch effects that don't clean up.\n\n```svg The life of an effect: draw, then the effect runs; when city changes, the cleanup runs, then the effect runs again\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"110\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"40\" width=\"90\" height=\"34\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"55\" y=\"61\" text-anchor=\"middle\">draw</text>\n  <rect x=\"120\" y=\"40\" width=\"110\" height=\"34\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"175\" y=\"61\" text-anchor=\"middle\">effect: fetch</text>\n  <rect x=\"250\" y=\"40\" width=\"110\" height=\"34\" rx=\"6\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"305\" y=\"61\" text-anchor=\"middle\">city changes</text>\n  <rect x=\"380\" y=\"40\" width=\"130\" height=\"34\" rx=\"6\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"445\" y=\"56\" text-anchor=\"middle\">cleanup, then</text><text x=\"445\" y=\"69\" text-anchor=\"middle\">effect again</text>\n  <path d=\"M100 57 H118 M230 57 H248 M360 57 H378\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"260\" y=\"100\" text-anchor=\"middle\" fill=\"#6b7280\">the dependency list [city] decides when the effect runs again</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "When does `useEffect(fn, [city])` run `fn`?",
     "options": [
      "Before every draw",
      "After the first draw, and after any draw where `city` changed",
      "Only when the user clicks"
     ],
     "answer": 1,
     "why": "The dependency list tells React which values the effect depends on."
    },
    {
     "q": "What is the cleanup function in the fetch example for?",
     "options": [
      "It deletes the data after showing it",
      "It marks the old request as stale so a late answer for the previous city is ignored",
      "It retries the request"
     ],
     "answer": 1,
     "why": "Cleanup runs before the next effect, so only the newest request can set state."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Building and publishing",
   "body": "Put the build in a small script so `npm start` and `npm run build` do the right thing. `build.mjs`:\n\n```js\nimport * as esbuild from 'esbuild';\nimport { cp, mkdir } from 'node:fs/promises';\n\nconst serve = process.argv.includes('--serve');\nawait mkdir('docs', { recursive: true });\nawait cp('public', 'docs', { recursive: true });         // index.html, styles.css, icon\n\nconst options = {\n  entryPoints: ['src/main.jsx'], bundle: true, outfile: 'docs/app.js', jsx: 'automatic',\n  minify: !serve, sourcemap: serve,\n  define: { 'process.env.NODE_ENV': serve ? '\"development\"' : '\"production\"' },\n};\n\nif (serve) {\n  const ctx = await esbuild.context(options);\n  await ctx.watch();                                       // rebuild on every save\n  await ctx.serve({ servedir: 'docs', port: 8000 });\n} else {\n  await esbuild.build(options);\n}\n```\n\nand in `package.json`:\n\n```json\n\"scripts\": { \"start\": \"node build.mjs --serve\", \"build\": \"node build.mjs\", \"test\": \"node --test \\\"test/*.test.js\\\"\" }\n```\n\n- **Development:** `npm start`, then open http://localhost:8000. Save a file and reload.\n- **Publish:** `npm run build`, commit `docs/`, and on GitHub open **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/docs`. The site appears at `https://<you>.github.io/<repo>/`.\n- `process.env.NODE_ENV = \"production\"` switches React to its small, fast production build.\n\n### Keep the rules out of React\n\nThe projects in this course keep their rules (parsing API data, moving tasks, adding up money) in plain files under `src/lib/` with **no React in them**. Components only call them. That keeps components short, and the rules are tested in Node with `node --test`, exactly like the earlier projects.\n\n```svg Project layout: plain rules in src/lib (tested in Node), components in src/components, built by esbuild into docs/ for GitHub Pages\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"130\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"20\" width=\"140\" height=\"40\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"80\" y=\"38\" text-anchor=\"middle\" font-weight=\"bold\">src/lib</text><text x=\"80\" y=\"52\" text-anchor=\"middle\">rules, no React</text>\n  <rect x=\"10\" y=\"76\" width=\"140\" height=\"40\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"80\" y=\"94\" text-anchor=\"middle\" font-weight=\"bold\">src/components</text><text x=\"80\" y=\"108\" text-anchor=\"middle\">what's on screen</text>\n  <rect x=\"200\" y=\"48\" width=\"110\" height=\"40\" rx=\"6\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"255\" y=\"72\" text-anchor=\"middle\">esbuild</text>\n  <rect x=\"360\" y=\"48\" width=\"150\" height=\"40\" rx=\"6\" fill=\"#e5e7eb\"/><text x=\"435\" y=\"66\" text-anchor=\"middle\" font-weight=\"bold\">docs/</text><text x=\"435\" y=\"80\" text-anchor=\"middle\">GitHub Pages</text>\n  <path d=\"M150 40 L198 62 M150 96 L198 74 M310 68 H358\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"80\" y=\"14\" text-anchor=\"middle\" fill=\"#16a34a\">node --test</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Where does GitHub Pages serve these projects from?",
     "options": [
      "The `src/` folder",
      "The `docs/` folder on the main branch, which `npm run build` writes",
      "A separate server you run"
     ],
     "answer": 1,
     "why": "The build writes plain HTML, CSS and one script to `docs/`, which Pages serves as static files."
    },
    {
     "q": "Why keep rules like parsing and totals in `src/lib/` without React?",
     "options": [
      "React can't do math",
      "Components stay short, and the rules can be tested in Node without a browser",
      "GitHub Pages requires it"
     ],
     "answer": 1,
     "why": "Plain functions are easy to test and reuse; components only call them."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 14
  }
 ],
 "finish": "You can build a React app from scratch now. You learned:\n\n- **Components** that return JSX, and **props** that flow down\n- **State** with `useState`, events, never changing state in place, and **lifting state up**\n- **Lists with keys**, conditional parts and **controlled inputs**\n- **useEffect** for saving and fetching, with **cleanup** so late answers are ignored\n- **Building with esbuild** and publishing `docs/` on **GitHub Pages**\n\n### Challenges\n\n1. Build a counter with + and − buttons that can't go below 0, and saves its value in localStorage.\n2. Make a to-do list with add, tick off and delete, using keys and immutable updates.\n3. Fetch a random joke from an API in an effect, with Loading… and an error message.\n\n### Next\n\nThe **Fetching data in React** lesson, then the **Weatherboard** project."
};
