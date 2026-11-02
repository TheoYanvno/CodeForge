---
id: webapi
title: Web APIs: a weather app with fetch
blocks-html: page
blocks-css: base
blocks-js: setup, api, codes, show, search, go
goals: Explain what a web API is, and read a request URL and its query parameters; Get data with fetch, promises, async and await; Check responses for errors with res.ok; Read JSON objects and parallel arrays; Turn codes into words and pictures with a lookup object; Handle loading, not-found and network errors with try and catch
prereqs: The JavaScript basics guide (functions, events, arrays and objects)
---

## Session: Your first API call

## Step: What's an API? Building a request URL
time: 15

Your apps so far only knew what you typed into them. Real apps pull in live data: weather, maps, prices, sports scores. They get it from **web APIs**. An API (Application Programming Interface) is a door into another program, built for code instead of people. A **web API** is a web address that returns **data** instead of a web page.

In this guide you'll build a **weather app**: type a city, and it shows the current weather and a five-day forecast, using the free [Open-Meteo](https://open-meteo.com/) API, which needs no account or key. The finished project is at [github.com/TheoYanvno/weather-now](https://github.com/TheoYanvno/weather-now).

```svg A web API request and response: your page sends a request to a URL, the server looks up the data, and sends back JSON your code can read
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 170" font-family="sans-serif" font-size="13">
  <rect width="520" height="170" fill="#ffffff"/>
  <rect x="10" y="40" width="140" height="80" rx="10" fill="#e0f2fe" stroke="#0284c7"/>
  <text x="80" y="76" text-anchor="middle" font-weight="bold">Your page</text><text x="80" y="96" text-anchor="middle">fetch(url)</text>
  <rect x="370" y="40" width="140" height="80" rx="10" fill="#fef3c7" stroke="#d97706"/>
  <text x="440" y="76" text-anchor="middle" font-weight="bold">Open-Meteo</text><text x="440" y="96" text-anchor="middle">weather server</text>
  <path d="M150 62 H366" stroke="#0284c7" stroke-width="2"/><path d="M358 56 L368 62 L358 68" fill="none" stroke="#0284c7" stroke-width="2"/>
  <text x="258" y="52" text-anchor="middle" fill="#0369a1">request: GET /v1/forecast?latitude=…</text>
  <path d="M370 100 H154" stroke="#d97706" stroke-width="2"/><path d="M162 94 L152 100 L162 106" fill="none" stroke="#d97706" stroke-width="2"/>
  <text x="262" y="122" text-anchor="middle" fill="#b45309">response: JSON {"current": {"temperature_2m": 78}}</text>
  <text x="260" y="158" text-anchor="middle" fill="#6b7280">The page never sees a web page from the server, only data.</text>
</svg>
```

### Reading a request URL

```text
https://geocoding-api.open-meteo.com/v1/search?name=Orlando&count=5
```

| Part | Means |
|---|---|
| `https://geocoding-api.open-meteo.com` | The server |
| `/v1/search` | The **endpoint**: which question you're asking (v1 is the API's version) |
| `?` | Query parameters start here |
| `name=Orlando&count=5` | **Parameters**: `name` is Orlando, `count` is 5, joined by `&` |

Paste that URL in your browser's address bar: you'll see the raw data the code will get.

### Building URLs safely

`new URLSearchParams({ name: 'Orlando', count: 5 })` builds the part after `?` for you. It also **encodes** special characters: a space becomes `+` and `&` becomes `%26`, so a city like "Port St. Lucie" can't break the URL. Never glue parameters together by hand.

check: html | a search form with a city box | /<form[\s\S]*id=["']city["']/ | Add <form id="searchForm"> with <input id="city">
check: js | URLSearchParams builds the query | /new\s+URLSearchParams\(/ | new URLSearchParams({ name: city, count: 1 })
check: js | the geocoding endpoint | /geocoding-api\.open-meteo\.com\/v1\/search/ | const GEO = 'https://geocoding-api.open-meteo.com/v1/search';

quiz: In `.../v1/search?name=Orlando&count=5`, what is `count=5`?
- [ ] The endpoint
- [x] A query parameter
- [ ] The server's name
why: Everything after `?` is parameters, as `name=value` pairs joined by `&`.

quiz: Why use `URLSearchParams` instead of `'?name=' + city`?
- [ ] It's required by fetch
- [x] It encodes spaces and symbols so any city name makes a valid URL
- [ ] It makes the request faster
why: A name with `&` or spaces would break a glued-together URL; URLSearchParams escapes them.

```html page
<main class="weather">
  <h1>🌤️ Weather Now</h1>
  <form id="searchForm" class="search">
    <label for="city" class="sr-only">City</label>
    <input id="city" type="search" value="Orlando" placeholder="City name" autocomplete="off">
    <button type="submit">Search</button>
  </form>
  <p id="status" class="status" aria-live="polite"></p>
  <section id="current" class="current" hidden></section>
  <ol id="forecast" class="forecast"></ol>
  <p class="credit">Weather data by <a href="https://open-meteo.com/">Open-Meteo.com</a></p>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  background: linear-gradient(160deg, #0ea5e9, #6366f1);
  color: #0f172a;
}

.weather {
  box-sizing: border-box;
  width: min(560px, 100%);
  margin: 0 auto;
  padding: 24px 16px;
}

h1 { color: #ffffff; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.search {
  display: flex;
  gap: 8px;
}

.search input {
  flex: 1;
  min-width: 0;
  padding: 12px;
  font-size: 1.1rem;
  border: 0;
  border-radius: 10px;
}

.search button {
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 700;
  border: 0;
  border-radius: 10px;
  background: #0f172a;
  color: #ffffff;
  cursor: pointer;
}

.status {
  min-height: 1.5em;
  color: #ffffff;
}

.current, .forecast li {
  background: rgb(255 255 255 / .9);
  border-radius: 14px;
}

.current {
  padding: 18px;
  text-align: center;
}

.current .big {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 4px 0;
}

.current .icon { font-size: 3rem; }

.facts {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px 16px;
  color: #334155;
}

.forecast {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 8px;
}

.forecast li {
  padding: 10px;
  text-align: center;
}

.forecast .icon { font-size: 1.8rem; }

.credit {
  color: #e0e7ff;
  font-size: .85rem;
}

.credit a { color: #ffffff; }
```

```js setup
const form = document.getElementById('searchForm');
const cityInput = document.getElementById('city');
const status = document.getElementById('status');
const currentBox = document.getElementById('current');
const forecastList = document.getElementById('forecast');

// The two endpoints this app uses.
const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST = 'https://api.open-meteo.com/v1/forecast';

// Builds a full request URL: the endpoint, then ?name=value&name=value.
function url(endpoint, params) {
  return `${endpoint}?${new URLSearchParams(params)}`;
}
```

```js go
status.textContent = `Request: ${url(GEO, { name: cityInput.value, count: 1 })}`;
```

## Step: fetch, promises and async/await
time: 18

`fetch(url)` sends the request. But the answer takes time to arrive (sometimes a whole second), and JavaScript can't freeze the page while it waits. So `fetch` immediately returns a **promise**: an object that says "the result will be here later."

### async and await

Inside a function marked **`async`**, the keyword **`await`** pauses *that function* until the promise is ready, while the rest of the page keeps working:

```js
async function getJSON(address) {
  const res = await fetch(address);   // wait for the response
  if (!res.ok) throw new Error(`The server answered ${res.status}`);
  return res.json();                  // wait for the body, read as JSON
}
```

```svg await pauses only the async function: while the request is out, the page stays responsive, and the function continues when the response arrives
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 170" font-family="sans-serif" font-size="12">
  <rect width="520" height="170" fill="#ffffff"/>
  <text x="10" y="24" font-weight="bold">getJSON()</text>
  <rect x="90" y="12" width="80" height="20" rx="4" fill="#bae6fd"/><text x="130" y="26" text-anchor="middle">fetch(url)</text>
  <rect x="170" y="12" width="200" height="20" fill="none" stroke="#94a3b8" stroke-dasharray="4 3"/><text x="270" y="26" text-anchor="middle" fill="#64748b">await… (paused)</text>
  <rect x="370" y="12" width="120" height="20" rx="4" fill="#bbf7d0"/><text x="430" y="26" text-anchor="middle">res.json()</text>
  <text x="10" y="70" font-weight="bold">The page</text>
  <rect x="90" y="58" width="400" height="20" rx="4" fill="#fef3c7"/><text x="290" y="72" text-anchor="middle">still scrolls, types and clicks the whole time</text>
  <path d="M90 110 H490" stroke="#334155" stroke-width="2"/><path d="M482 104 L492 110 L482 116" fill="none" stroke="#334155" stroke-width="2"/>
  <text x="90" y="130" fill="#334155">time →</text>
  <text x="270" y="150" text-anchor="middle" fill="#64748b">the server takes a moment to answer</text>
</svg>
```

### Check res.ok

`fetch` only fails by itself when the network is down. If the server answers "404 Not Found" or "500 Server Error", that still counts as a response! `res.ok` is true only for success codes (200–299), so check it and **throw** an error otherwise.

### Finding the city

The forecast API needs a **latitude and longitude**, not a name. So the first call asks the geocoding API to turn "Orlando" into coordinates. Its JSON looks like:

```json
{ "results": [ { "name": "Orlando", "latitude": 28.54, "longitude": -81.38, "admin1": "Florida", "country": "United States" } ] }
```

`findPlace()` returns the first result, or `null` when there are none (`data.results` is missing when nothing matches, so `?.` and `??` handle that).

check: js | an async function that awaits fetch | /async\s+function\s+getJSON[\s\S]*await\s+fetch\(/ | async function getJSON(address) { const res = await fetch(address); ... }
check: js | errors are caught with res.ok | /if\s*\(\s*!res\.ok\s*\)/ | if (!res.ok) throw new Error(...)
check: js | a function that finds the place | /async\s+function\s+findPlace\s*\(/ | async function findPlace(name) { ... }

quiz: What does `fetch()` return right away?
- [ ] The data
- [x] A promise that will hold the response when it arrives
- [ ] An error if the server is slow
why: Network requests take time; the promise lets the page keep running until the response is ready.

quiz: The server answers 404 Not Found. Does `fetch` throw an error?
- [ ] Yes, always
- [x] No: it's still a response, so you check `res.ok` yourself
- [ ] Only in Chrome
why: fetch only rejects on network failure; HTTP error codes come back as normal responses with `ok` set to false.

```js api
// Get a URL and read its JSON, or throw if the server answered with an error.
async function getJSON(address) {
  const res = await fetch(address);
  if (!res.ok) throw new Error(`The weather service answered ${res.status}.`);
  return res.json();
}

// Turn a city name into a place with coordinates, or null if nothing matches.
async function findPlace(name) {
  const data = await getJSON(url(GEO, { name, count: 1, language: 'en', format: 'json' }));
  return data.results?.[0] ?? null;
}
```

```js go
findPlace(cityInput.value).then((place) => {
  status.textContent = place
    ? `${place.name}, ${place.admin1 ?? ''} ${place.country}: ${place.latitude}, ${place.longitude}`
    : 'No place found.';
});
```

## Step: Reading JSON: the current weather
time: 15

With coordinates, ask for the weather. The **parameters** say exactly what you want, which keeps the response small:

```js
url(FORECAST, {
  latitude: place.latitude,
  longitude: place.longitude,
  current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
  daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  temperature_unit: 'fahrenheit',
  wind_speed_unit: 'mph',
  timezone: 'auto',
  forecast_days: 5,
});
```

The answer is **JSON** (JavaScript Object Notation): objects and arrays written as text. `res.json()` turns it into real JavaScript objects you read with dots and brackets:

```json
{
  "current": { "temperature_2m": 78.4, "relative_humidity_2m": 64, "weather_code": 2, ... },
  "current_units": { "temperature_2m": "°F", ... },
  "daily": {
    "time": ["2026-11-02", "2026-11-03", ...],
    "temperature_2m_max": [84.1, 82.9, ...],
    "temperature_2m_min": [68.0, 66.2, ...]
  }
}
```

`data.current.temperature_2m` is `78.4`. `temperature_2m` means the temperature 2 meters above the ground, the standard height for weather stations. `Math.round` makes it `78`.

> Tip: to explore a response, `console.log(data)` and expand it in the console, or open the request URL in the browser. Firefox shows JSON as a tree you can click.

check: js | asks for the forecast with coordinates | /latitude:\s*place\.latitude/ | Pass latitude: place.latitude and longitude: place.longitude
check: js | a function that gets the weather | /async\s+function\s+getWeather\s*\(/ | async function getWeather(place) { ... }
check: js | reads the current temperature | /current\.temperature_2m/ | data.current.temperature_2m

quiz: How do you read the humidity from `data` in the JSON above?
- [ ] `data.relative_humidity_2m`
- [x] `data.current.relative_humidity_2m`
- [ ] `data["current.relative_humidity_2m"]`
why: Humidity is inside the `current` object, so you go through `current` first.

quiz: Why list exactly the fields you need in `current` and `daily`?
- [x] The server only sends those, so the response is small and fast
- [ ] The API refuses requests without them
- [ ] It sets the units
why: Asking only for what you'll show is polite to the server and quicker for your users.

```js api
// Get a URL and read its JSON, or throw if the server answered with an error.
async function getJSON(address) {
  const res = await fetch(address);
  if (!res.ok) throw new Error(`The weather service answered ${res.status}.`);
  return res.json();
}

// Turn a city name into a place with coordinates, or null if nothing matches.
async function findPlace(name) {
  const data = await getJSON(url(GEO, { name, count: 1, language: 'en', format: 'json' }));
  return data.results?.[0] ?? null;
}

// The current weather and a five-day forecast for one place.
async function getWeather(place) {
  return getJSON(url(FORECAST, {
    latitude: place.latitude,
    longitude: place.longitude,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    timezone: 'auto',
    forecast_days: 5,
  }));
}
```

```js go
findPlace(cityInput.value)
  .then((place) => getWeather(place))
  .then((data) => {
    status.textContent = `It's ${Math.round(data.current.temperature_2m)}°F right now.`;
  });
```

## Session: Showing the weather

## Step: Weather codes and the current conditions card
time: 15

The API describes the sky with a **weather code**, a number from the World Meteorological Organization's list (the WMO codes): `0` is clear, `3` is overcast, `61` is light rain, `95` is a thunderstorm. Numbers are compact and the same in every language; your app turns them into words and pictures.

A **lookup object** maps each code to a label and an emoji:

```js
const CODES = {
  0: ['Clear sky', '☀️'],
  61: ['Light rain', '🌦️'],
  // ...
};
const [label, icon] = CODES[code] ?? ['Unknown', '❔'];
```

`CODES[code]` finds the entry in one step, no long `if` chain needed. The `?? ['Unknown', '❔']` handles a code that isn't in the list. `const [label, icon] = ...` is **destructuring**: it unpacks the two-item array into two variables.

### The card

`showCurrent()` builds the big card: the icon, the temperature, the description, and a row of facts (feels like, humidity, wind). Each value goes in with `textContent`, so text from the server is never treated as HTML.

check: js | a lookup object of weather codes | /const\s+CODES\s*=\s*\{/ | const CODES = { 0: ['Clear sky', '☀️'], ... }
check: js | a code is turned into words | /function\s+describe\s*\(/ | function describe(code) { return CODES[code] ?? ['Unknown', '❔']; }
check: js | the current conditions card | /function\s+showCurrent\s*\(/ | Write function showCurrent(place, data) { ... }

quiz: Why does the API send `61` instead of "Light rain"?
- [x] A number is compact and the same in every language; the app chooses the words
- [ ] JSON can't hold text
- [ ] To make the data secret
why: Codes keep the data small and universal. Your app decides how to show them.

quiz: What does `CODES[code] ?? ['Unknown', '❔']` do when `code` isn't in the object?
- [ ] Crashes
- [x] Uses `['Unknown', '❔']`
- [ ] Returns the number itself
why: A missing key gives `undefined`, and `??` replaces it with the fallback.

```js codes
// WMO weather codes, as used by Open-Meteo: [description, emoji].
const CODES = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Freezing fog', '🌫️'],
  51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'],
  61: ['Light rain', '🌦️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'],
  71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'],
  80: ['Rain showers', '🌦️'], 81: ['Rain showers', '🌧️'], 82: ['Violent showers', '⛈️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm with hail', '⛈️'], 99: ['Thunderstorm with hail', '⛈️'],
};

function describe(code) {
  return CODES[code] ?? ['Unknown', '❔'];
}
```

```js show
// A small helper: make an element with a class and some text.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// The big card with the weather right now.
function showCurrent(place, data) {
  const c = data.current;
  const u = data.current_units;
  const [label, icon] = describe(c.weather_code);
  const where = [place.name, place.admin1, place.country].filter(Boolean).join(', ');
  const facts = el('div', 'facts');
  facts.append(
    el('span', '', `Feels like ${Math.round(c.apparent_temperature)}${u.apparent_temperature}`),
    el('span', '', `Humidity ${c.relative_humidity_2m}%`),
    el('span', '', `Wind ${Math.round(c.wind_speed_10m)} ${u.wind_speed_10m}`),
  );
  currentBox.replaceChildren(
    el('h2', '', where),
    el('div', 'icon', icon),
    el('p', 'big', `${Math.round(c.temperature_2m)}${u.temperature_2m}`),
    el('p', '', label),
    facts,
  );
  currentBox.hidden = false;
}
```

```js go
(async () => {
  const place = await findPlace(cityInput.value);
  const data = await getWeather(place);
  showCurrent(place, data);
})();
```

## Step: The five-day forecast
time: 15

The `daily` part of the response is a set of **parallel arrays**: item 0 of every array is today, item 1 is tomorrow, and so on:

```svg Parallel arrays: the same index in each daily array describes the same day, so index 1 is tomorrow's date, high, low and code
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 170" font-family="sans-serif" font-size="12">
  <rect width="520" height="170" fill="#ffffff"/>
  <text x="10" y="40">time</text><text x="10" y="70">max</text><text x="10" y="100">min</text><text x="10" y="130">code</text>
  <rect x="190" y="20" width="110" height="122" rx="8" fill="#e0f2fe" stroke="#0284c7"/>
  <text x="100" y="40">"11-02"</text><text x="210" y="40">"11-03"</text><text x="320" y="40">"11-04"</text><text x="420" y="40">…</text>
  <text x="100" y="70">84</text><text x="210" y="70">82</text><text x="320" y="70">80</text>
  <text x="100" y="100">68</text><text x="210" y="100">66</text><text x="320" y="100">65</text>
  <text x="100" y="130">1</text><text x="210" y="130">61</text><text x="320" y="130">3</text>
  <text x="245" y="160" text-anchor="middle" fill="#0369a1">index 1 = tomorrow in every array</text>
</svg>
```

So `d.time.map((day, i) => ...)` (with `d` short for `data.daily`) walks through the days, and for each `i` reads `daily.temperature_2m_max[i]`, `daily.temperature_2m_min[i]` and `daily.weather_code[i]`. `map` gives you both the item and its index.

### Dates

`daily.time[i]` is a date like `"2026-11-03"`. `new Date('2026-11-03T12:00')` turns it into a Date (noon avoids time-zone surprises near midnight), and `toLocaleDateString('en-US', { weekday: 'short' })` gives `Tue`. The first day is labeled **Today**.

check: js | loops over the days with their index | /\.time\.map\(\s*\(\s*day\s*,\s*i\s*\)/ | d.time.map((day, i) => { ... })
check: js | reads the same day from each array | /temperature_2m_max\[i\]/ | daily.temperature_2m_max[i]
check: js | shows the weekday | /toLocaleDateString\(/ | date.toLocaleDateString('en-US', { weekday: 'short' })

quiz: `daily.time[2]` is Wednesday. Where is Wednesday's low temperature?
- [ ] `daily.temperature_2m_min[0]`
- [x] `daily.temperature_2m_min[2]`
- [ ] `daily.time[2].min`
why: Parallel arrays line up by index: the same position in each array is the same day.

quiz: In `daily.time.map((day, i) => ...)`, what is `i`?
- [ ] The day's temperature
- [x] The index of the current item: 0, 1, 2…
- [ ] Always 1
why: `map` passes each item and its position, which is how you reach the matching items in the other arrays.

```js show
// A small helper: make an element with a class and some text.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// The big card with the weather right now.
function showCurrent(place, data) {
  const c = data.current;
  const u = data.current_units;
  const [label, icon] = describe(c.weather_code);
  const where = [place.name, place.admin1, place.country].filter(Boolean).join(', ');
  const facts = el('div', 'facts');
  facts.append(
    el('span', '', `Feels like ${Math.round(c.apparent_temperature)}${u.apparent_temperature}`),
    el('span', '', `Humidity ${c.relative_humidity_2m}%`),
    el('span', '', `Wind ${Math.round(c.wind_speed_10m)} ${u.wind_speed_10m}`),
  );
  currentBox.replaceChildren(
    el('h2', '', where),
    el('div', 'icon', icon),
    el('p', 'big', `${Math.round(c.temperature_2m)}${u.temperature_2m}`),
    el('p', '', label),
    facts,
  );
  currentBox.hidden = false;
}

// One card per day: weekday, icon, high and low, chance of rain.
function showForecast(data) {
  const d = data.daily;
  forecastList.replaceChildren(...d.time.map((day, i) => {
    const [label, icon] = describe(d.weather_code[i]);
    const date = new Date(`${day}T12:00`);
    const li = el('li');
    li.title = label;
    li.append(
      el('strong', '', i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })),
      el('div', 'icon', icon),
      el('div', '', `${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°`),
      el('div', 'small', `💧 ${d.precipitation_probability_max[i] ?? 0}%`),
    );
    return li;
  }));
}
```

```js go
(async () => {
  const place = await findPlace(cityInput.value);
  const data = await getWeather(place);
  showCurrent(place, data);
  showForecast(data);
})();
```

## Step: Searching, loading and errors
time: 18

Now let the user pick the city, and handle everything that can go wrong. Network code fails in ways normal code doesn't:

| What happens | What the user should see |
|---|---|
| Waiting for the answer | "Loading…", and the button disabled so it isn't clicked twice |
| The city doesn't exist | "No place called *Atlantiss*. Check the spelling." |
| The server answers with an error | "The weather service answered 500." |
| No internet | "Couldn't reach the weather service. Check your connection." |

### try, catch and finally

`await` works with **`try` / `catch`**: if anything inside `try` throws (fetch failing, or our own `throw` for `!res.ok`), the `catch` block runs with the error. **`finally`** runs either way, which is the right place to re-enable the button.

```js
try {
  const place = await findPlace(name);
  // ...
} catch (err) {
  status.textContent = ...;
} finally {
  button.disabled = false;
}
```

A `TypeError` from fetch means the request never got an answer (offline, or blocked), so the message says to check the connection; any other error shows its own message.

### The search form

`search(name)` does the whole job: show loading, find the place, get the weather, draw both parts. The form's submit handler calls it with the trimmed text, and the page loads Orlando's weather when it opens.

check: js | network errors are caught | /try\s*\{[\s\S]*catch\s*\(\s*err\s*\)/ | Wrap the requests in try { ... } catch (err) { ... }
check: js | a loading message | /Loading/ | status.textContent = 'Loading…';
check: js | the button is re-enabled when done | /finally\s*\{/ | finally { button.disabled = false; }
check: js | the form runs a search | /addEventListener\(\s*['"]submit['"]/ | form.addEventListener('submit', ...)

quiz: When does a `finally` block run?
- [ ] Only when there's an error
- [ ] Only when there's no error
- [x] Every time, after try (and catch, if there was an error)
why: That makes it the place for cleanup, like turning the button back on.

quiz: Why disable the Search button while loading?
- [x] So impatient double-clicks don't send several requests that can finish out of order
- [ ] fetch requires it
- [ ] It makes the request faster
why: Two overlapping requests can return in the wrong order and show the older city; disabling the button prevents that.

```js search
const button = form.querySelector('button');

// Find a city, then show its weather. Every failure gets a clear message.
async function search(name) {
  if (!name) {
    status.textContent = 'Type a city name.';
    return;
  }
  status.textContent = 'Loading…';
  button.disabled = true;
  try {
    const place = await findPlace(name);
    if (!place) {
      status.textContent = `No place called "${name}". Check the spelling.`;
      return;
    }
    const data = await getWeather(place);
    showCurrent(place, data);
    showForecast(data);
    status.textContent = '';
  } catch (err) {
    status.textContent = err instanceof TypeError
      ? 'Couldn\'t reach the weather service. Check your connection.'
      : err.message;
  } finally {
    button.disabled = false;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  search(cityInput.value.trim());
});
```

```js go
search(cityInput.value.trim());
```

## Session: APIs in the real world

## Step: Keys, limits, CORS and what's next
kind: read
time: 15

Open-Meteo is unusually easy: free, no account, no key. Most APIs add a few things you should know about.

### API keys

Many APIs give you a **key**: a long secret string that identifies you, sent with each request. **Never put a secret key in front-end code or on GitHub**: anyone can read your JavaScript in the browser's developer tools and use your key (and your bill). Real apps keep keys on a server, which calls the API for them.

### Rate limits

APIs limit how many requests you can make (Open-Meteo's free tier allows thousands per day for non-commercial use). Don't call an API in a loop or on every key press; call it when the user searches.

### CORS

Browsers only let a page read responses from another website if that website allows it, with a header called `Access-Control-Allow-Origin`. That rule is **CORS**. Open-Meteo allows every site, which is why `fetch` works straight from your page. If you see a CORS error in the console, that API is meant to be called from a server, not a browser.

### Credit the source

Open-Meteo's data is free under the CC BY 4.0 license, which asks you to credit it, which is why the page says "Weather data by Open-Meteo.com". Always read an API's terms.

### How SuperBook uses this

The SuperBook guide uses the same tools: `fetch`, `async`/`await`, `res.ok` checks and `try`/`catch`, to get Bible passages and translations from web APIs.

### Publish it

Make a `weather-now` folder with `index.html` (a full page with this guide's HTML, ending with `<script src="script.js"></script>`), `style.css` and `script.js` from the last code step. Commit, push to a public GitHub repository and turn on Pages. The finished project is at [github.com/TheoYanvno/weather-now](https://github.com/TheoYanvno/weather-now).

quiz: Why must a secret API key never go in your front-end JavaScript?
- [ ] Browsers delete keys
- [x] Anyone can read your page's code in the developer tools and copy the key
- [ ] Keys only work on servers
why: Everything sent to the browser is public. Secret keys belong on a server you control.

## Finish

You built an app that pulls live data from the internet. You learned:

- What a **web API** is, and how to read **endpoints** and **query parameters**
- **URLSearchParams** to build URLs safely
- **fetch**, **promises**, **async** and **await**, and checking **res.ok**
- Reading **JSON** objects and **parallel arrays**
- **Lookup objects** and destructuring
- **Loading** states and errors with **try / catch / finally**
- **API keys**, **rate limits**, **CORS** and crediting data sources

### Challenges

1. Add a °F / °C switch that searches again with `temperature_unit: 'celsius'`.
2. Remember the last city in `localStorage` and load it when the page opens.
3. Add an hourly forecast for the next 12 hours with the `hourly` parameter.

### Next

The **SuperBook** guide.
