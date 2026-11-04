// Built from guides/fetchjson.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "fetchjson",
 "title": "Fetching quotes and jokes",
 "goals": [
  "Explain what a request, a response and JSON are",
  "Load data with fetch, async and await",
  "Check res.ok and catch network errors so the page never breaks",
  "Show loading, error and ready states to the person using the page",
  "Turn someone else's data shape into your app's own shape with map()"
 ],
 "prereqs": [
  "The Arrays of objects and random picks lesson (an array of objects, a random pick, textContent)"
 ],
 "sessions": [
  {
   "title": "Data from somewhere else",
   "from": 0,
   "to": 3
  }
 ],
 "start": {
  "html": {
   "page": ""
  },
  "css": {
   "base": ""
  },
  "js": {
   "api": "",
   "load": "",
   "show": ""
  }
 },
 "steps": [
  {
   "title": "Requests, responses and JSON",
   "body": "So far your quotes were typed into the code. Real apps get their data from somewhere else: a server sends it when the page asks. The page makes a **request** to a web address, and the server sends back a **response**.\n\n```svg The page sends a request to an address; the server sends back a response whose body is JSON text, which becomes JavaScript objects\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"45\" width=\"80\" height=\"50\" rx=\"10\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"45\" y=\"74\" text-anchor=\"middle\">your page</text>\n  <rect x=\"245\" y=\"45\" width=\"80\" height=\"50\" rx=\"10\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"285\" y=\"74\" text-anchor=\"middle\">server</text>\n  <path d=\"M85 58 H241\" stroke=\"#111\" stroke-width=\"2\"/><text x=\"165\" y=\"50\" text-anchor=\"middle\">request: GET /jokes</text>\n  <path d=\"M241 84 H85\" stroke=\"#111\" stroke-width=\"2\"/><text x=\"165\" y=\"102\" text-anchor=\"middle\">response: 200 OK + JSON</text>\n  <text x=\"165\" y=\"135\" text-anchor=\"middle\" fill=\"#334155\">[{\"setup\": \"…\", \"punchline\": \"…\"}, …]</text>\n</svg>\n```\n\n**JSON** is the text format most servers send. It looks almost exactly like JavaScript arrays and objects, which is why it's easy to work with: `res.json()` turns the text into real objects.\n\n### Waiting without freezing\n\nA request takes time: tens of milliseconds on a good connection, seconds on a bad one, forever if the server is down. The page can't just stop and wait, or nothing could be clicked. So `fetch()` returns a **promise**, a \"you'll get the answer later\". Inside an `async` function, `await` pauses that function (and only that function) until the answer arrives.\n\n```js\nasync function load() {\n  const res = await fetch('https://example.com/jokes');   // wait for the response\n  const jokes = await res.json();                          // wait for the body, as objects\n}\n```\n\n> In this lesson the \"server\" is a small built-in sample (a `data:` address), so it works anywhere, even offline. In the Quote & Joke Generator the same code points at a real address. Only the address changes.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "Loading jokes with fetch and await",
   "body": "`loadJokes()` asks for the jokes and puts how many arrived on the page. Two `await`s: one for the response, one for its body.\n\n```js\nasync function loadJokes() {\n  const res = await fetch(API);\n  const jokes = await res.json();\n  ...\n}\n```\n\nThe sample data uses the field names a typical joke API sends: `setup` and `punchline`. That's someone else's shape, not yours, which matters in step 4.",
   "checks": [
    {
     "pane": "js",
     "label": "an async function",
     "test": "/async\\s+function\\s+loadJokes/",
     "hint": "async function loadJokes() { ... }"
    },
    {
     "pane": "js",
     "label": "waiting for fetch",
     "test": "/await\\s+fetch\\(/",
     "hint": "const res = await fetch(API);"
    },
    {
     "pane": "js",
     "label": "reading the body as JSON",
     "test": "/await\\s+res\\.json\\(\\)/",
     "hint": "const jokes = await res.json();"
    }
   ],
   "quiz": [
    {
     "q": "What does `await fetch(API)` give you?",
     "options": [
      "The jokes as an array",
      "A response object; you still need `await res.json()` to get the data",
      "A string of HTML"
     ],
     "answer": 1,
     "why": "fetch gives the response first (status, headers); the body is read separately with res.json()."
    },
    {
     "q": "While `loadJokes()` is waiting, can the person still click buttons on the page?",
     "options": [
      "Yes; await only pauses that function, not the page",
      "No, the whole page freezes until the data arrives",
      "Only if the request is fast"
     ],
     "answer": 0,
     "why": "That's the point of promises and await: the rest of the page keeps working while one function waits."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"card\">\n  <p id=\"status\" class=\"status\" role=\"status\">Not loaded yet</p>\n  <p id=\"setup\" class=\"setup\"></p>\n  <p id=\"punchline\" class=\"punchline\" hidden></p>\n  <p class=\"buttons\">\n    <button id=\"reveal\" disabled>Show the punchline</button>\n    <button id=\"next\" disabled>Another joke</button>\n    <button id=\"reload\">Load jokes</button>\n  </p>\n  <label class=\"small\"><input id=\"broken\" type=\"checkbox\"> Pretend the server is down</label>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #fff7ed;\n  color: #431407;\n}\n\n.card {\n  width: min(420px, 100% - 32px);\n  padding: 24px;\n  background: #fff;\n  border-radius: 16px;\n  text-align: center;\n}\n\n.status { color: #9a3412; font-size: .9rem; }\n.status.error { color: #b91c1c; font-weight: 600; }\n.setup { font-size: 1.3rem; min-height: 1.5em; }\n.punchline { font-size: 1.2rem; font-weight: 700; color: #c2410c; }\n.buttons { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }\nbutton { padding: 8px 14px; font: inherit; }\n.small { font-size: .85rem; color: #78716c; }"
   },
   "js": {
    "api": "// A built-in sample \"server\": the same shape a joke API sends back.\nconst SAMPLE = [\n  { id: 1, setup: 'Why did the scarecrow win an award?', punchline: 'He was outstanding in his field.' },\n  { id: 2, setup: 'Why don\\'t eggs tell jokes?', punchline: 'They\\'d crack each other up.' },\n  { id: 3, setup: 'What do you call a fake noodle?', punchline: 'An impasta.' },\n  { id: 4, setup: 'Why did the math book look sad?', punchline: 'It had too many problems.' },\n];\nconst API = `data:application/json,${encodeURIComponent(JSON.stringify(SAMPLE))}`;\nconst statusEl = document.getElementById('status');",
    "load": "async function loadJokes() {\n  statusEl.textContent = 'Loading…';\n  const res = await fetch(API);\n  const jokes = await res.json();\n  statusEl.textContent = `Loaded ${jokes.length} jokes`;\n}\n\ndocument.getElementById('reload').addEventListener('click', loadJokes);\nloadJokes();"
   }
  },
  {
   "title": "When the server says no, or doesn't answer",
   "body": "Two different things can go wrong, and they need two different checks:\n\n- **The server answers, but with an error** (404 Not Found, 500 Server Error). `fetch` does *not* throw for these. You have to check `res.ok`, which is `true` only for success codes (200–299).\n- **There's no answer at all** (no internet, wrong address, server down). Then `fetch` itself throws, and `try { } catch { }` catches it.\n\n```svg Three ways a request ends: ok, an error status (check res.ok), or no response at all (fetch throws, so catch it)\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 140\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"52\" width=\"70\" height=\"36\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"40\" y=\"74\" text-anchor=\"middle\">fetch</text>\n  <rect x=\"120\" y=\"6\" width=\"205\" height=\"34\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"222\" y=\"28\" text-anchor=\"middle\">200 OK → show the jokes</text>\n  <rect x=\"120\" y=\"53\" width=\"205\" height=\"34\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"222\" y=\"75\" text-anchor=\"middle\">404 / 500 → !res.ok → error message</text>\n  <rect x=\"120\" y=\"100\" width=\"205\" height=\"34\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#ef4444\"/><text x=\"222\" y=\"122\" text-anchor=\"middle\">no answer → catch → error message</text>\n  <path d=\"M75 62 L116 23 M75 70 H116 M75 78 L116 117\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```\n\nEither way, the person sees a clear message and a way to try again, never a blank card. Tick **Pretend the server is down** and press **Load jokes** to see it: the code asks for an address that doesn't exist, the same as a real outage.\n\nThe buttons also stay **disabled** until jokes have loaded, so nobody can click \"Another joke\" when there are none.",
   "checks": [
    {
     "pane": "js",
     "label": "checking the status",
     "test": "/if\\s*\\(\\s*!res\\.ok\\s*\\)/",
     "hint": "if (!res.ok) throw new Error(...)"
    },
    {
     "pane": "js",
     "label": "catching network errors",
     "test": "/catch\\s*\\(\\s*\\w+\\s*\\)\\s*\\{[\\s\\S]*error/",
     "hint": "} catch (err) { ... show an error ... }"
    }
   ],
   "quiz": [
    {
     "q": "The server answers with 404 Not Found. What does `fetch` do?",
     "options": [
      "Throws an error, so catch runs",
      "Resolves normally with `res.ok` set to false, so you must check it yourself",
      "Returns an empty array"
     ],
     "answer": 1,
     "why": "fetch only throws when there's no response at all; an error status is still a response."
    },
    {
     "q": "Why are the joke buttons disabled until the data loads?",
     "options": [
      "Disabled buttons look nicer",
      "So nobody can ask for a joke when there are none yet, which would show \"undefined\"",
      "fetch requires it"
     ],
     "answer": 1,
     "why": "The page's controls should match what the data allows at that moment."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "load": "let jokes = [];\n\nasync function loadJokes() {\n  statusEl.className = 'status';\n  statusEl.textContent = 'Loading…';\n  const broken = document.getElementById('broken').checked;\n  try {\n    const res = await fetch(broken ? 'https://jokes.invalid/api' : API);\n    if (!res.ok) throw new Error(`The server answered ${res.status}`);\n    jokes = await res.json();\n    statusEl.textContent = `Loaded ${jokes.length} jokes`;\n    document.getElementById('next').disabled = false;\n  } catch (err) {\n    jokes = [];\n    statusEl.className = 'status error';\n    statusEl.textContent = 'Couldn\\'t load jokes. Check your connection and press Load jokes to try again.';\n    document.getElementById('next').disabled = true;\n    document.getElementById('reveal').disabled = true;\n  }\n}\n\ndocument.getElementById('reload').addEventListener('click', loadJokes);\nloadJokes();"
   }
  },
  {
   "title": "Their shape, your shape",
   "body": "The joke API sends `{ setup, punchline }`. Your quote card from the Random picks lesson shows `{ text, author }`. If the display code read `setup` directly, switching to a different API (one that sends `question` and `answer`, say) would mean changing the display code everywhere.\n\nInstead, convert at the door. One `map()` right after loading turns their shape into yours, and the rest of the app only ever sees your shape:\n\n```js\njokes = data.map((j) => ({ id: j.id, text: j.setup, answer: j.punchline }));\n```\n\n```svg map() converts each item at the door: the API's setup and punchline become the app's own text and answer\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"25\" width=\"120\" height=\"60\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"65\" y=\"45\" text-anchor=\"middle\">their shape</text><text x=\"65\" y=\"63\" text-anchor=\"middle\">setup</text><text x=\"65\" y=\"78\" text-anchor=\"middle\">punchline</text>\n  <rect x=\"140\" y=\"38\" width=\"50\" height=\"34\" rx=\"8\" fill=\"#6366f1\"/><text x=\"165\" y=\"60\" text-anchor=\"middle\" fill=\"#fff\">map</text>\n  <rect x=\"205\" y=\"25\" width=\"120\" height=\"60\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"265\" y=\"45\" text-anchor=\"middle\">your shape</text><text x=\"265\" y=\"63\" text-anchor=\"middle\">text</text><text x=\"265\" y=\"78\" text-anchor=\"middle\">answer</text>\n  <path d=\"M125 55 H138 M190 55 H203\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```\n\nThen a joke is shown in two parts: the setup first, and the punchline only when you press the button (it starts `hidden`). Showing it with `textContent` keeps it safe, because this text came from a server you don't control.",
   "checks": [
    {
     "pane": "js",
     "label": "converting to your own shape with map",
     "test": "/\\.map\\(\\s*\\(?\\s*j\\s*\\)?\\s*=>\\s*\\(\\{[^}]*text\\s*:\\s*j\\.setup/",
     "hint": "data.map((j) => ({ id: j.id, text: j.setup, answer: j.punchline }))"
    },
    {
     "pane": "js",
     "label": "the punchline waits for a click",
     "test": "/punchlineEl\\.hidden\\s*=\\s*false/",
     "hint": "punchlineEl.hidden = false;"
    }
   ],
   "quiz": [
    {
     "q": "The app switches to an API that sends `{ question, answer }`. What has to change?",
     "options": [
      "Only the map() line that converts it at the door",
      "Every function that shows a joke",
      "The HTML"
     ],
     "answer": 0,
     "why": "Because everything after loading uses your own shape, only the conversion knows about the API's field names."
    },
    {
     "q": "Why is the joke shown with textContent?",
     "options": [
      "It's faster than innerHTML",
      "The text came from a server you don't control; textContent can never run it as HTML",
      "innerHTML can't show question marks"
     ],
     "answer": 1,
     "why": "Treat anything from outside as text, not as code."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "load": "let jokes = [];\n\nasync function loadJokes() {\n  statusEl.className = 'status';\n  statusEl.textContent = 'Loading…';\n  const broken = document.getElementById('broken').checked;\n  try {\n    const res = await fetch(broken ? 'https://jokes.invalid/api' : API);\n    if (!res.ok) throw new Error(`The server answered ${res.status}`);\n    const data = await res.json();\n    jokes = data.map((j) => ({ id: j.id, text: j.setup, answer: j.punchline }));\n    statusEl.textContent = `Loaded ${jokes.length} jokes`;\n    document.getElementById('next').disabled = false;\n    showRandom();\n  } catch (err) {\n    jokes = [];\n    statusEl.className = 'status error';\n    statusEl.textContent = 'Couldn\\'t load jokes. Check your connection and press Load jokes to try again.';\n    document.getElementById('next').disabled = true;\n    document.getElementById('reveal').disabled = true;\n  }\n}",
    "show": "const setupEl = document.getElementById('setup');\nconst punchlineEl = document.getElementById('punchline');\nlet current = null;\n\nfunction showRandom() {\n  if (!jokes.length) return;\n  current = jokes[Math.floor(Math.random() * jokes.length)];\n  setupEl.textContent = current.text;\n  punchlineEl.textContent = current.answer;\n  punchlineEl.hidden = true;\n  document.getElementById('reveal').disabled = false;\n}\n\ndocument.getElementById('reveal').addEventListener('click', () => {\n  punchlineEl.hidden = false;\n});\ndocument.getElementById('next').addEventListener('click', showRandom);\ndocument.getElementById('reload').addEventListener('click', loadJokes);\nloadJokes();"
   }
  }
 ],
 "finish": "Your page can load data from a server now. You learned:\n\n- **Requests, responses and JSON**, and why `fetch` returns a promise\n- `async` functions and `await` that don't freeze the page\n- `res.ok` for error statuses and `try/catch` for no answer at all\n- **Loading, error and ready** states, with buttons that match\n- Converting **their shape to yours** with `map()` at the door\n\n### Challenges\n\n1. Point `API` at a real joke API (search for \"official joke API\") and see it work with no other changes.\n2. Add a 5-second timeout with `AbortController`, and show \"The server is slow\" when it fires.\n3. Cache the jokes in localStorage, so a second visit shows them instantly and refreshes in the background.\n\n### Next\n\n**Saving favorites**: let people keep the ones they like."
};
