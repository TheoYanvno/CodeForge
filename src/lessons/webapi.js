// Built from guides/webapi.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "webapi",
 "title": "Web APIs: a weather app with fetch",
 "goals": [
  "Explain what a web API is, and read a request URL and its query parameters",
  "Get data with fetch, promises, async and await",
  "Check responses for errors with res.ok",
  "Read JSON objects and parallel arrays",
  "Turn codes into words and pictures with a lookup object",
  "Handle loading, not-found and network errors with try and catch"
 ],
 "prereqs": [
  "The JavaScript basics guide (functions, events, arrays and objects)"
 ],
 "sessions": [
  {
   "title": "Your first API call",
   "from": 0,
   "to": 2
  },
  {
   "title": "Showing the weather",
   "from": 3,
   "to": 5
  },
  {
   "title": "APIs in the real world",
   "from": 6,
   "to": 6
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
   "setup": "",
   "api": "",
   "codes": "",
   "show": "",
   "search": "",
   "go": ""
  }
 },
 "steps": [
  {
   "title": "What's an API? Building a request URL",
   "body": "Your apps so far only knew what you typed into them. Real apps pull in live data: weather, maps, prices, sports scores. They get it from **web APIs**. An API (Application Programming Interface) is a door into another program, built for code instead of people. A **web API** is a web address that returns **data** instead of a web page.\n\nIn this guide you'll build a **weather app**: type a city, and it shows the current weather and a five-day forecast, using the free [Open-Meteo](https://open-meteo.com/) API, which needs no account or key. The finished project is at [github.com/TheoYanvno/weather-now](https://github.com/TheoYanvno/weather-now).\n\n```svg A web API request and response: your page sends a request to a URL, the server looks up the data, and sends back JSON your code can read\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 170\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"170\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"40\" width=\"140\" height=\"80\" rx=\"10\" fill=\"#e0f2fe\" stroke=\"#0284c7\"/>\n  <text x=\"80\" y=\"76\" text-anchor=\"middle\" font-weight=\"bold\">Your page</text><text x=\"80\" y=\"96\" text-anchor=\"middle\">fetch(url)</text>\n  <rect x=\"370\" y=\"40\" width=\"140\" height=\"80\" rx=\"10\" fill=\"#fef3c7\" stroke=\"#d97706\"/>\n  <text x=\"440\" y=\"76\" text-anchor=\"middle\" font-weight=\"bold\">Open-Meteo</text><text x=\"440\" y=\"96\" text-anchor=\"middle\">weather server</text>\n  <path d=\"M150 62 H366\" stroke=\"#0284c7\" stroke-width=\"2\"/><path d=\"M358 56 L368 62 L358 68\" fill=\"none\" stroke=\"#0284c7\" stroke-width=\"2\"/>\n  <text x=\"258\" y=\"52\" text-anchor=\"middle\" fill=\"#0369a1\">request: GET /v1/forecast?latitude=…</text>\n  <path d=\"M370 100 H154\" stroke=\"#d97706\" stroke-width=\"2\"/><path d=\"M162 94 L152 100 L162 106\" fill=\"none\" stroke=\"#d97706\" stroke-width=\"2\"/>\n  <text x=\"262\" y=\"122\" text-anchor=\"middle\" fill=\"#b45309\">response: JSON {\"current\": {\"temperature_2m\": 78}}</text>\n  <text x=\"260\" y=\"158\" text-anchor=\"middle\" fill=\"#6b7280\">The page never sees a web page from the server, only data.</text>\n</svg>\n```\n\n### Reading a request URL\n\n```text\nhttps://geocoding-api.open-meteo.com/v1/search?name=Orlando&count=5\n```\n\n| Part | Means |\n|---|---|\n| `https://geocoding-api.open-meteo.com` | The server |\n| `/v1/search` | The **endpoint**: which question you're asking (v1 is the API's version) |\n| `?` | Query parameters start here |\n| `name=Orlando&count=5` | **Parameters**: `name` is Orlando, `count` is 5, joined by `&` |\n\nPaste that URL in your browser's address bar: you'll see the raw data the code will get.\n\n### Building URLs safely\n\n`new URLSearchParams({ name: 'Orlando', count: 5 })` builds the part after `?` for you. It also **encodes** special characters: a space becomes `+` and `&` becomes `%26`, so a city like \"Port St. Lucie\" can't break the URL. Never glue parameters together by hand.",
   "checks": [
    {
     "pane": "html",
     "label": "a search form with a city box",
     "test": "/<form[\\s\\S]*id=[\"']city[\"']/",
     "hint": "Add <form id=\"searchForm\"> with <input id=\"city\">"
    },
    {
     "pane": "js",
     "label": "URLSearchParams builds the query",
     "test": "/new\\s+URLSearchParams\\(/",
     "hint": "new URLSearchParams({ name: city, count: 1 })"
    },
    {
     "pane": "js",
     "label": "the geocoding endpoint",
     "test": "/geocoding-api\\.open-meteo\\.com\\/v1\\/search/",
     "hint": "const GEO = 'https://geocoding-api.open-meteo.com/v1/search';"
    }
   ],
   "quiz": [
    {
     "q": "In `.../v1/search?name=Orlando&count=5`, what is `count=5`?",
     "options": [
      "The endpoint",
      "A query parameter",
      "The server's name"
     ],
     "answer": 1,
     "why": "Everything after `?` is parameters, as `name=value` pairs joined by `&`."
    },
    {
     "q": "Why use `URLSearchParams` instead of `'?name=' + city`?",
     "options": [
      "It's required by fetch",
      "It encodes spaces and symbols so any city name makes a valid URL",
      "It makes the request faster"
     ],
     "answer": 1,
     "why": "A name with `&` or spaces would break a glued-together URL; URLSearchParams escapes them."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"weather\">\n  <h1>🌤️ Weather Now</h1>\n  <form id=\"searchForm\" class=\"search\">\n    <label for=\"city\" class=\"sr-only\">City</label>\n    <input id=\"city\" type=\"search\" value=\"Orlando\" placeholder=\"City name\" autocomplete=\"off\">\n    <button type=\"submit\">Search</button>\n  </form>\n  <p id=\"status\" class=\"status\" aria-live=\"polite\"></p>\n  <section id=\"current\" class=\"current\" hidden></section>\n  <ol id=\"forecast\" class=\"forecast\"></ol>\n  <p class=\"credit\">Weather data by <a href=\"https://open-meteo.com/\">Open-Meteo.com</a></p>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  font-family: system-ui, sans-serif;\n  background: linear-gradient(160deg, #0ea5e9, #6366f1);\n  color: #0f172a;\n}\n\n.weather {\n  box-sizing: border-box;\n  width: min(560px, 100%);\n  margin: 0 auto;\n  padding: 24px 16px;\n}\n\nh1 { color: #ffffff; }\n\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n}\n\n.search {\n  display: flex;\n  gap: 8px;\n}\n\n.search input {\n  flex: 1;\n  min-width: 0;\n  padding: 12px;\n  font-size: 1.1rem;\n  border: 0;\n  border-radius: 10px;\n}\n\n.search button {\n  padding: 12px 18px;\n  font-size: 1rem;\n  font-weight: 700;\n  border: 0;\n  border-radius: 10px;\n  background: #0f172a;\n  color: #ffffff;\n  cursor: pointer;\n}\n\n.status {\n  min-height: 1.5em;\n  color: #ffffff;\n}\n\n.current, .forecast li {\n  background: rgb(255 255 255 / .9);\n  border-radius: 14px;\n}\n\n.current {\n  padding: 18px;\n  text-align: center;\n}\n\n.current .big {\n  font-size: 3.5rem;\n  font-weight: 800;\n  margin: 4px 0;\n}\n\n.current .icon { font-size: 3rem; }\n\n.facts {\n  display: flex;\n  justify-content: center;\n  flex-wrap: wrap;\n  gap: 6px 16px;\n  color: #334155;\n}\n\n.forecast {\n  list-style: none;\n  padding: 0;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));\n  gap: 8px;\n}\n\n.forecast li {\n  padding: 10px;\n  text-align: center;\n}\n\n.forecast .icon { font-size: 1.8rem; }\n\n.credit {\n  color: #e0e7ff;\n  font-size: .85rem;\n}\n\n.credit a { color: #ffffff; }"
   },
   "js": {
    "setup": "const form = document.getElementById('searchForm');\nconst cityInput = document.getElementById('city');\nconst status = document.getElementById('status');\nconst currentBox = document.getElementById('current');\nconst forecastList = document.getElementById('forecast');\n\n// The two endpoints this app uses.\nconst GEO = 'https://geocoding-api.open-meteo.com/v1/search';\nconst FORECAST = 'https://api.open-meteo.com/v1/forecast';\n\n// Builds a full request URL: the endpoint, then ?name=value&name=value.\nfunction url(endpoint, params) {\n  return `${endpoint}?${new URLSearchParams(params)}`;\n}",
    "go": "status.textContent = `Request: ${url(GEO, { name: cityInput.value, count: 1 })}`;"
   }
  },
  {
   "title": "fetch, promises and async/await",
   "body": "`fetch(url)` sends the request. But the answer takes time to arrive (sometimes a whole second), and JavaScript can't freeze the page while it waits. So `fetch` immediately returns a **promise**: an object that says \"the result will be here later.\"\n\n### async and await\n\nInside a function marked **`async`**, the keyword **`await`** pauses *that function* until the promise is ready, while the rest of the page keeps working:\n\n```js\nasync function getJSON(address) {\n  const res = await fetch(address);   // wait for the response\n  if (!res.ok) throw new Error(`The server answered ${res.status}`);\n  return res.json();                  // wait for the body, read as JSON\n}\n```\n\n```svg await pauses only the async function: while the request is out, the page stays responsive, and the function continues when the response arrives\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 170\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"170\" fill=\"#ffffff\"/>\n  <text x=\"10\" y=\"24\" font-weight=\"bold\">getJSON()</text>\n  <rect x=\"90\" y=\"12\" width=\"80\" height=\"20\" rx=\"4\" fill=\"#bae6fd\"/><text x=\"130\" y=\"26\" text-anchor=\"middle\">fetch(url)</text>\n  <rect x=\"170\" y=\"12\" width=\"200\" height=\"20\" fill=\"none\" stroke=\"#94a3b8\" stroke-dasharray=\"4 3\"/><text x=\"270\" y=\"26\" text-anchor=\"middle\" fill=\"#64748b\">await… (paused)</text>\n  <rect x=\"370\" y=\"12\" width=\"120\" height=\"20\" rx=\"4\" fill=\"#bbf7d0\"/><text x=\"430\" y=\"26\" text-anchor=\"middle\">res.json()</text>\n  <text x=\"10\" y=\"70\" font-weight=\"bold\">The page</text>\n  <rect x=\"90\" y=\"58\" width=\"400\" height=\"20\" rx=\"4\" fill=\"#fef3c7\"/><text x=\"290\" y=\"72\" text-anchor=\"middle\">still scrolls, types and clicks the whole time</text>\n  <path d=\"M90 110 H490\" stroke=\"#334155\" stroke-width=\"2\"/><path d=\"M482 104 L492 110 L482 116\" fill=\"none\" stroke=\"#334155\" stroke-width=\"2\"/>\n  <text x=\"90\" y=\"130\" fill=\"#334155\">time →</text>\n  <text x=\"270\" y=\"150\" text-anchor=\"middle\" fill=\"#64748b\">the server takes a moment to answer</text>\n</svg>\n```\n\n### Check res.ok\n\n`fetch` only fails by itself when the network is down. If the server answers \"404 Not Found\" or \"500 Server Error\", that still counts as a response! `res.ok` is true only for success codes (200–299), so check it and **throw** an error otherwise.\n\n### Finding the city\n\nThe forecast API needs a **latitude and longitude**, not a name. So the first call asks the geocoding API to turn \"Orlando\" into coordinates. Its JSON looks like:\n\n```json\n{ \"results\": [ { \"name\": \"Orlando\", \"latitude\": 28.54, \"longitude\": -81.38, \"admin1\": \"Florida\", \"country\": \"United States\" } ] }\n```\n\n`findPlace()` returns the first result, or `null` when there are none (`data.results` is missing when nothing matches, so `?.` and `??` handle that).",
   "checks": [
    {
     "pane": "js",
     "label": "an async function that awaits fetch",
     "test": "/async\\s+function\\s+getJSON[\\s\\S]*await\\s+fetch\\(/",
     "hint": "async function getJSON(address) { const res = await fetch(address); ... }"
    },
    {
     "pane": "js",
     "label": "errors are caught with res.ok",
     "test": "/if\\s*\\(\\s*!res\\.ok\\s*\\)/",
     "hint": "if (!res.ok) throw new Error(...)"
    },
    {
     "pane": "js",
     "label": "a function that finds the place",
     "test": "/async\\s+function\\s+findPlace\\s*\\(/",
     "hint": "async function findPlace(name) { ... }"
    }
   ],
   "quiz": [
    {
     "q": "What does `fetch()` return right away?",
     "options": [
      "The data",
      "A promise that will hold the response when it arrives",
      "An error if the server is slow"
     ],
     "answer": 1,
     "why": "Network requests take time; the promise lets the page keep running until the response is ready."
    },
    {
     "q": "The server answers 404 Not Found. Does `fetch` throw an error?",
     "options": [
      "Yes, always",
      "No: it's still a response, so you check `res.ok` yourself",
      "Only in Chrome"
     ],
     "answer": 1,
     "why": "fetch only rejects on network failure; HTTP error codes come back as normal responses with `ok` set to false."
    }
   ],
   "session": 0,
   "minutes": 18,
   "js": {
    "api": "// Get a URL and read its JSON, or throw if the server answered with an error.\nasync function getJSON(address) {\n  const res = await fetch(address);\n  if (!res.ok) throw new Error(`The weather service answered ${res.status}.`);\n  return res.json();\n}\n\n// Turn a city name into a place with coordinates, or null if nothing matches.\nasync function findPlace(name) {\n  const data = await getJSON(url(GEO, { name, count: 1, language: 'en', format: 'json' }));\n  return data.results?.[0] ?? null;\n}",
    "go": "findPlace(cityInput.value).then((place) => {\n  status.textContent = place\n    ? `${place.name}, ${place.admin1 ?? ''} ${place.country}: ${place.latitude}, ${place.longitude}`\n    : 'No place found.';\n});"
   }
  },
  {
   "title": "Reading JSON: the current weather",
   "body": "With coordinates, ask for the weather. The **parameters** say exactly what you want, which keeps the response small:\n\n```js\nurl(FORECAST, {\n  latitude: place.latitude,\n  longitude: place.longitude,\n  current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',\n  daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',\n  temperature_unit: 'fahrenheit',\n  wind_speed_unit: 'mph',\n  timezone: 'auto',\n  forecast_days: 5,\n});\n```\n\nThe answer is **JSON** (JavaScript Object Notation): objects and arrays written as text. `res.json()` turns it into real JavaScript objects you read with dots and brackets:\n\n```json\n{\n  \"current\": { \"temperature_2m\": 78.4, \"relative_humidity_2m\": 64, \"weather_code\": 2, ... },\n  \"current_units\": { \"temperature_2m\": \"°F\", ... },\n  \"daily\": {\n    \"time\": [\"2026-11-02\", \"2026-11-03\", ...],\n    \"temperature_2m_max\": [84.1, 82.9, ...],\n    \"temperature_2m_min\": [68.0, 66.2, ...]\n  }\n}\n```\n\n`data.current.temperature_2m` is `78.4`. `temperature_2m` means the temperature 2 meters above the ground, the standard height for weather stations. `Math.round` makes it `78`.\n\n> Tip: to explore a response, `console.log(data)` and expand it in the console, or open the request URL in the browser. Firefox shows JSON as a tree you can click.",
   "checks": [
    {
     "pane": "js",
     "label": "asks for the forecast with coordinates",
     "test": "/latitude:\\s*place\\.latitude/",
     "hint": "Pass latitude: place.latitude and longitude: place.longitude"
    },
    {
     "pane": "js",
     "label": "a function that gets the weather",
     "test": "/async\\s+function\\s+getWeather\\s*\\(/",
     "hint": "async function getWeather(place) { ... }"
    },
    {
     "pane": "js",
     "label": "reads the current temperature",
     "test": "/current\\.temperature_2m/",
     "hint": "data.current.temperature_2m"
    }
   ],
   "quiz": [
    {
     "q": "How do you read the humidity from `data` in the JSON above?",
     "options": [
      "`data.relative_humidity_2m`",
      "`data.current.relative_humidity_2m`",
      "`data[\"current.relative_humidity_2m\"]`"
     ],
     "answer": 1,
     "why": "Humidity is inside the `current` object, so you go through `current` first."
    },
    {
     "q": "Why list exactly the fields you need in `current` and `daily`?",
     "options": [
      "The server only sends those, so the response is small and fast",
      "The API refuses requests without them",
      "It sets the units"
     ],
     "answer": 0,
     "why": "Asking only for what you'll show is polite to the server and quicker for your users."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "api": "// Get a URL and read its JSON, or throw if the server answered with an error.\nasync function getJSON(address) {\n  const res = await fetch(address);\n  if (!res.ok) throw new Error(`The weather service answered ${res.status}.`);\n  return res.json();\n}\n\n// Turn a city name into a place with coordinates, or null if nothing matches.\nasync function findPlace(name) {\n  const data = await getJSON(url(GEO, { name, count: 1, language: 'en', format: 'json' }));\n  return data.results?.[0] ?? null;\n}\n\n// The current weather and a five-day forecast for one place.\nasync function getWeather(place) {\n  return getJSON(url(FORECAST, {\n    latitude: place.latitude,\n    longitude: place.longitude,\n    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',\n    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',\n    temperature_unit: 'fahrenheit',\n    wind_speed_unit: 'mph',\n    timezone: 'auto',\n    forecast_days: 5,\n  }));\n}",
    "go": "findPlace(cityInput.value)\n  .then((place) => getWeather(place))\n  .then((data) => {\n    status.textContent = `It's ${Math.round(data.current.temperature_2m)}°F right now.`;\n  });"
   }
  },
  {
   "title": "Weather codes and the current conditions card",
   "body": "The API describes the sky with a **weather code**, a number from the World Meteorological Organization's list (the WMO codes): `0` is clear, `3` is overcast, `61` is light rain, `95` is a thunderstorm. Numbers are compact and the same in every language; your app turns them into words and pictures.\n\nA **lookup object** maps each code to a label and an emoji:\n\n```js\nconst CODES = {\n  0: ['Clear sky', '☀️'],\n  61: ['Light rain', '🌦️'],\n  // ...\n};\nconst [label, icon] = CODES[code] ?? ['Unknown', '❔'];\n```\n\n`CODES[code]` finds the entry in one step, no long `if` chain needed. The `?? ['Unknown', '❔']` handles a code that isn't in the list. `const [label, icon] = ...` is **destructuring**: it unpacks the two-item array into two variables.\n\n### The card\n\n`showCurrent()` builds the big card: the icon, the temperature, the description, and a row of facts (feels like, humidity, wind). Each value goes in with `textContent`, so text from the server is never treated as HTML.",
   "checks": [
    {
     "pane": "js",
     "label": "a lookup object of weather codes",
     "test": "/const\\s+CODES\\s*=\\s*\\{/",
     "hint": "const CODES = { 0: ['Clear sky', '☀️'], ... }"
    },
    {
     "pane": "js",
     "label": "a code is turned into words",
     "test": "/function\\s+describe\\s*\\(/",
     "hint": "function describe(code) { return CODES[code] ?? ['Unknown', '❔']; }"
    },
    {
     "pane": "js",
     "label": "the current conditions card",
     "test": "/function\\s+showCurrent\\s*\\(/",
     "hint": "Write function showCurrent(place, data) { ... }"
    }
   ],
   "quiz": [
    {
     "q": "Why does the API send `61` instead of \"Light rain\"?",
     "options": [
      "A number is compact and the same in every language; the app chooses the words",
      "JSON can't hold text",
      "To make the data secret"
     ],
     "answer": 0,
     "why": "Codes keep the data small and universal. Your app decides how to show them."
    },
    {
     "q": "What does `CODES[code] ?? ['Unknown', '❔']` do when `code` isn't in the object?",
     "options": [
      "Crashes",
      "Uses `['Unknown', '❔']`",
      "Returns the number itself"
     ],
     "answer": 1,
     "why": "A missing key gives `undefined`, and `??` replaces it with the fallback."
    }
   ],
   "session": 1,
   "minutes": 15,
   "js": {
    "codes": "// WMO weather codes, as used by Open-Meteo: [description, emoji].\nconst CODES = {\n  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],\n  45: ['Fog', '🌫️'], 48: ['Freezing fog', '🌫️'],\n  51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'],\n  61: ['Light rain', '🌦️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'],\n  71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'],\n  80: ['Rain showers', '🌦️'], 81: ['Rain showers', '🌧️'], 82: ['Violent showers', '⛈️'],\n  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm with hail', '⛈️'], 99: ['Thunderstorm with hail', '⛈️'],\n};\n\nfunction describe(code) {\n  return CODES[code] ?? ['Unknown', '❔'];\n}",
    "show": "// A small helper: make an element with a class and some text.\nfunction el(tag, className, text) {\n  const node = document.createElement(tag);\n  if (className) node.className = className;\n  if (text !== undefined) node.textContent = text;\n  return node;\n}\n\n// The big card with the weather right now.\nfunction showCurrent(place, data) {\n  const c = data.current;\n  const u = data.current_units;\n  const [label, icon] = describe(c.weather_code);\n  const where = [place.name, place.admin1, place.country].filter(Boolean).join(', ');\n  const facts = el('div', 'facts');\n  facts.append(\n    el('span', '', `Feels like ${Math.round(c.apparent_temperature)}${u.apparent_temperature}`),\n    el('span', '', `Humidity ${c.relative_humidity_2m}%`),\n    el('span', '', `Wind ${Math.round(c.wind_speed_10m)} ${u.wind_speed_10m}`),\n  );\n  currentBox.replaceChildren(\n    el('h2', '', where),\n    el('div', 'icon', icon),\n    el('p', 'big', `${Math.round(c.temperature_2m)}${u.temperature_2m}`),\n    el('p', '', label),\n    facts,\n  );\n  currentBox.hidden = false;\n}",
    "go": "(async () => {\n  const place = await findPlace(cityInput.value);\n  const data = await getWeather(place);\n  showCurrent(place, data);\n})();"
   }
  },
  {
   "title": "The five-day forecast",
   "body": "The `daily` part of the response is a set of **parallel arrays**: item 0 of every array is today, item 1 is tomorrow, and so on:\n\n```svg Parallel arrays: the same index in each daily array describes the same day, so index 1 is tomorrow's date, high, low and code\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 170\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"170\" fill=\"#ffffff\"/>\n  <text x=\"10\" y=\"40\">time</text><text x=\"10\" y=\"70\">max</text><text x=\"10\" y=\"100\">min</text><text x=\"10\" y=\"130\">code</text>\n  <rect x=\"190\" y=\"20\" width=\"110\" height=\"122\" rx=\"8\" fill=\"#e0f2fe\" stroke=\"#0284c7\"/>\n  <text x=\"100\" y=\"40\">\"11-02\"</text><text x=\"210\" y=\"40\">\"11-03\"</text><text x=\"320\" y=\"40\">\"11-04\"</text><text x=\"420\" y=\"40\">…</text>\n  <text x=\"100\" y=\"70\">84</text><text x=\"210\" y=\"70\">82</text><text x=\"320\" y=\"70\">80</text>\n  <text x=\"100\" y=\"100\">68</text><text x=\"210\" y=\"100\">66</text><text x=\"320\" y=\"100\">65</text>\n  <text x=\"100\" y=\"130\">1</text><text x=\"210\" y=\"130\">61</text><text x=\"320\" y=\"130\">3</text>\n  <text x=\"245\" y=\"160\" text-anchor=\"middle\" fill=\"#0369a1\">index 1 = tomorrow in every array</text>\n</svg>\n```\n\nSo `d.time.map((day, i) => ...)` (with `d` short for `data.daily`) walks through the days, and for each `i` reads `daily.temperature_2m_max[i]`, `daily.temperature_2m_min[i]` and `daily.weather_code[i]`. `map` gives you both the item and its index.\n\n### Dates\n\n`daily.time[i]` is a date like `\"2026-11-03\"`. `new Date('2026-11-03T12:00')` turns it into a Date (noon avoids time-zone surprises near midnight), and `toLocaleDateString('en-US', { weekday: 'short' })` gives `Tue`. The first day is labeled **Today**.",
   "checks": [
    {
     "pane": "js",
     "label": "loops over the days with their index",
     "test": "/\\.time\\.map\\(\\s*\\(\\s*day\\s*,\\s*i\\s*\\)/",
     "hint": "d.time.map((day, i) => { ... })"
    },
    {
     "pane": "js",
     "label": "reads the same day from each array",
     "test": "/temperature_2m_max\\[i\\]/",
     "hint": "daily.temperature_2m_max[i]"
    },
    {
     "pane": "js",
     "label": "shows the weekday",
     "test": "/toLocaleDateString\\(/",
     "hint": "date.toLocaleDateString('en-US', { weekday: 'short' })"
    }
   ],
   "quiz": [
    {
     "q": "`daily.time[2]` is Wednesday. Where is Wednesday's low temperature?",
     "options": [
      "`daily.temperature_2m_min[0]`",
      "`daily.temperature_2m_min[2]`",
      "`daily.time[2].min`"
     ],
     "answer": 1,
     "why": "Parallel arrays line up by index: the same position in each array is the same day."
    },
    {
     "q": "In `daily.time.map((day, i) => ...)`, what is `i`?",
     "options": [
      "The day's temperature",
      "The index of the current item: 0, 1, 2…",
      "Always 1"
     ],
     "answer": 1,
     "why": "`map` passes each item and its position, which is how you reach the matching items in the other arrays."
    }
   ],
   "session": 1,
   "minutes": 15,
   "js": {
    "show": "// A small helper: make an element with a class and some text.\nfunction el(tag, className, text) {\n  const node = document.createElement(tag);\n  if (className) node.className = className;\n  if (text !== undefined) node.textContent = text;\n  return node;\n}\n\n// The big card with the weather right now.\nfunction showCurrent(place, data) {\n  const c = data.current;\n  const u = data.current_units;\n  const [label, icon] = describe(c.weather_code);\n  const where = [place.name, place.admin1, place.country].filter(Boolean).join(', ');\n  const facts = el('div', 'facts');\n  facts.append(\n    el('span', '', `Feels like ${Math.round(c.apparent_temperature)}${u.apparent_temperature}`),\n    el('span', '', `Humidity ${c.relative_humidity_2m}%`),\n    el('span', '', `Wind ${Math.round(c.wind_speed_10m)} ${u.wind_speed_10m}`),\n  );\n  currentBox.replaceChildren(\n    el('h2', '', where),\n    el('div', 'icon', icon),\n    el('p', 'big', `${Math.round(c.temperature_2m)}${u.temperature_2m}`),\n    el('p', '', label),\n    facts,\n  );\n  currentBox.hidden = false;\n}\n\n// One card per day: weekday, icon, high and low, chance of rain.\nfunction showForecast(data) {\n  const d = data.daily;\n  forecastList.replaceChildren(...d.time.map((day, i) => {\n    const [label, icon] = describe(d.weather_code[i]);\n    const date = new Date(`${day}T12:00`);\n    const li = el('li');\n    li.title = label;\n    li.append(\n      el('strong', '', i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })),\n      el('div', 'icon', icon),\n      el('div', '', `${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°`),\n      el('div', 'small', `💧 ${d.precipitation_probability_max[i] ?? 0}%`),\n    );\n    return li;\n  }));\n}",
    "go": "(async () => {\n  const place = await findPlace(cityInput.value);\n  const data = await getWeather(place);\n  showCurrent(place, data);\n  showForecast(data);\n})();"
   }
  },
  {
   "title": "Searching, loading and errors",
   "body": "Now let the user pick the city, and handle everything that can go wrong. Network code fails in ways normal code doesn't:\n\n| What happens | What the user should see |\n|---|---|\n| Waiting for the answer | \"Loading…\", and the button disabled so it isn't clicked twice |\n| The city doesn't exist | \"No place called *Atlantiss*. Check the spelling.\" |\n| The server answers with an error | \"The weather service answered 500.\" |\n| No internet | \"Couldn't reach the weather service. Check your connection.\" |\n\n### try, catch and finally\n\n`await` works with **`try` / `catch`**: if anything inside `try` throws (fetch failing, or our own `throw` for `!res.ok`), the `catch` block runs with the error. **`finally`** runs either way, which is the right place to re-enable the button.\n\n```js\ntry {\n  const place = await findPlace(name);\n  // ...\n} catch (err) {\n  status.textContent = ...;\n} finally {\n  button.disabled = false;\n}\n```\n\nA `TypeError` from fetch means the request never got an answer (offline, or blocked), so the message says to check the connection; any other error shows its own message.\n\n### The search form\n\n`search(name)` does the whole job: show loading, find the place, get the weather, draw both parts. The form's submit handler calls it with the trimmed text, and the page loads Orlando's weather when it opens.",
   "checks": [
    {
     "pane": "js",
     "label": "network errors are caught",
     "test": "/try\\s*\\{[\\s\\S]*catch\\s*\\(\\s*err\\s*\\)/",
     "hint": "Wrap the requests in try { ... } catch (err) { ... }"
    },
    {
     "pane": "js",
     "label": "a loading message",
     "test": "/Loading/",
     "hint": "status.textContent = 'Loading…';"
    },
    {
     "pane": "js",
     "label": "the button is re-enabled when done",
     "test": "/finally\\s*\\{/",
     "hint": "finally { button.disabled = false; }"
    },
    {
     "pane": "js",
     "label": "the form runs a search",
     "test": "/addEventListener\\(\\s*['\"]submit['\"]/",
     "hint": "form.addEventListener('submit', ...)"
    }
   ],
   "quiz": [
    {
     "q": "When does a `finally` block run?",
     "options": [
      "Only when there's an error",
      "Only when there's no error",
      "Every time, after try (and catch, if there was an error)"
     ],
     "answer": 2,
     "why": "That makes it the place for cleanup, like turning the button back on."
    },
    {
     "q": "Why disable the Search button while loading?",
     "options": [
      "So impatient double-clicks don't send several requests that can finish out of order",
      "fetch requires it",
      "It makes the request faster"
     ],
     "answer": 0,
     "why": "Two overlapping requests can return in the wrong order and show the older city; disabling the button prevents that."
    }
   ],
   "session": 1,
   "minutes": 18,
   "js": {
    "search": "const button = form.querySelector('button');\n\n// Find a city, then show its weather. Every failure gets a clear message.\nasync function search(name) {\n  if (!name) {\n    status.textContent = 'Type a city name.';\n    return;\n  }\n  status.textContent = 'Loading…';\n  button.disabled = true;\n  try {\n    const place = await findPlace(name);\n    if (!place) {\n      status.textContent = `No place called \"${name}\". Check the spelling.`;\n      return;\n    }\n    const data = await getWeather(place);\n    showCurrent(place, data);\n    showForecast(data);\n    status.textContent = '';\n  } catch (err) {\n    status.textContent = err instanceof TypeError\n      ? 'Couldn\\'t reach the weather service. Check your connection.'\n      : err.message;\n  } finally {\n    button.disabled = false;\n  }\n}\n\nform.addEventListener('submit', (event) => {\n  event.preventDefault();\n  search(cityInput.value.trim());\n});",
    "go": "search(cityInput.value.trim());"
   }
  },
  {
   "title": "Keys, limits, CORS and what's next",
   "body": "Open-Meteo is unusually easy: free, no account, no key. Most APIs add a few things you should know about.\n\n### API keys\n\nMany APIs give you a **key**: a long secret string that identifies you, sent with each request. **Never put a secret key in front-end code or on GitHub**: anyone can read your JavaScript in the browser's developer tools and use your key (and your bill). Real apps keep keys on a server, which calls the API for them.\n\n### Rate limits\n\nAPIs limit how many requests you can make (Open-Meteo's free tier allows thousands per day for non-commercial use). Don't call an API in a loop or on every key press; call it when the user searches.\n\n### CORS\n\nBrowsers only let a page read responses from another website if that website allows it, with a header called `Access-Control-Allow-Origin`. That rule is **CORS**. Open-Meteo allows every site, which is why `fetch` works straight from your page. If you see a CORS error in the console, that API is meant to be called from a server, not a browser.\n\n### Credit the source\n\nOpen-Meteo's data is free under the CC BY 4.0 license, which asks you to credit it, which is why the page says \"Weather data by Open-Meteo.com\". Always read an API's terms.\n\n### How SuperBook uses this\n\nThe SuperBook guide uses the same tools: `fetch`, `async`/`await`, `res.ok` checks and `try`/`catch`, to get Bible passages and translations from web APIs.\n\n### Publish it\n\nMake a `weather-now` folder with `index.html` (a full page with this guide's HTML, ending with `<script src=\"script.js\"></script>`), `style.css` and `script.js` from the last code step. Commit, push to a public GitHub repository and turn on Pages. The finished project is at [github.com/TheoYanvno/weather-now](https://github.com/TheoYanvno/weather-now).",
   "quiz": [
    {
     "q": "Why must a secret API key never go in your front-end JavaScript?",
     "options": [
      "Browsers delete keys",
      "Anyone can read your page's code in the developer tools and copy the key",
      "Keys only work on servers"
     ],
     "answer": 1,
     "why": "Everything sent to the browser is public. Secret keys belong on a server you control."
    }
   ],
   "session": 2,
   "kind": "read",
   "minutes": 15
  }
 ],
 "finish": "You built an app that pulls live data from the internet. You learned:\n\n- What a **web API** is, and how to read **endpoints** and **query parameters**\n- **URLSearchParams** to build URLs safely\n- **fetch**, **promises**, **async** and **await**, and checking **res.ok**\n- Reading **JSON** objects and **parallel arrays**\n- **Lookup objects** and destructuring\n- **Loading** states and errors with **try / catch / finally**\n- **API keys**, **rate limits**, **CORS** and crediting data sources\n\n### Challenges\n\n1. Add a °F / °C switch that searches again with `temperature_unit: 'celsius'`.\n2. Remember the last city in `localStorage` and load it when the page opens.\n3. Add an hourly forecast for the next 12 hours with the `hourly` parameter.\n\n### Next\n\nThe **SuperBook** guide."
};
