---
id: weatherboard
title: Weatherboard (React weather dashboard)
goals: Keep API logic in plain, tested functions and let React only draw it; Ask one API for everything a screen needs and turn its JSON into the shapes the app shows; Combine fetching, caching, late-answer protection, an SVG chart and a keyboard search into one app; Save preferences safely and publish a React app with esbuild and GitHub Pages
prereqs: React basics; Fetching data in React; Charts drawn with SVG; Search as you type
---

## Session: The data, without React

## Step: What Weatherboard does and how it's split
kind: read
time: 12

In this guide you'll rebuild my [Weatherboard](https://github.com/TheoYanvno/weather-forecast) ([live demo](https://theoyanvno.github.io/weather-forecast/)): today's conditions, the next 12 hours, a 7-day forecast, a chance-of-rain chart, air quality, a city search, your location, °F or °C, and light or dark. The data comes from [Open-Meteo](https://open-meteo.com/), which is free and needs no key.

The project is split so the hard parts can be tested without a browser:

| Folder | What's in it | React? |
|---|---|---|
| `src/lib/weather.js` | Building URLs, parsing JSON, small conversions | No |
| `src/lib/cache.js` | The 10-minute cache and the `latest()` helper | No |
| `src/lib/prefs.js` | Saved choices: city, unit, theme, recent places | No |
| `src/components/` | Week, Hourly, RainChart, Search, Side panels | Yes, drawing only |
| `src/App.jsx` | State, effects and wiring | Yes |

```svg The app in layers: plain JavaScript libraries at the bottom, components that draw, and App wiring them together
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 150" font-family="sans-serif" font-size="12">
  <rect width="520" height="150" fill="#fff"/>
  <rect x="10" y="10" width="500" height="34" rx="6" fill="#e0e7ff" stroke="#4f46e5"/><text x="260" y="31" text-anchor="middle">App.jsx: state, effects, wiring</text>
  <rect x="10" y="56" width="500" height="34" rx="6" fill="#dbeafe" stroke="#2563eb"/><text x="260" y="77" text-anchor="middle">components: Week · Hourly · RainChart · Search · Side</text>
  <rect x="10" y="102" width="160" height="34" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="90" y="123" text-anchor="middle">weather.js</text>
  <rect x="180" y="102" width="160" height="34" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="260" y="123" text-anchor="middle">cache.js</text>
  <rect x="350" y="102" width="160" height="34" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="430" y="123" text-anchor="middle">prefs.js</text>
</svg>
```

quiz: Why keep URL building and JSON parsing out of the React components?
- [ ] React can't call fetch
- [x] Plain functions can be tested in Node with sample JSON, no browser or network needed
- [ ] Components can't import functions
why: The logic most likely to break gets fast, simple tests; components stay small.

## Step: One request for the whole screen
kind: read
time: 18

Open-Meteo lets you list exactly what you want. One URL asks for now, the hours and the days, in the chosen units:

```js
export function forecastUrl(place, unit = 'f') {
  const u = UNITS[unit] ?? UNITS.f;
  return `${API}?${query({
    latitude: place.lat, longitude: place.lon, timezone: 'auto', forecast_days: 7,
    temperature_unit: u.temperature, wind_speed_unit: u.wind,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code,is_day',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
  })}`;
}
```

`timezone: 'auto'` makes every time local to the **place**, not to you, so "2 PM" in Tokyo means 2 PM there. `query()` uses `URLSearchParams`, which escapes values safely.

The answer is three sets of parallel arrays. `parseForecast()` turns them into objects the components can draw, and starts the hours at the one that contains "now":

```js
const nowHour = c.time.slice(0, 13);                        // "2026-11-05T14"
const start = Math.max(0, h.time.findIndex((t) => t.slice(0, 13) === nowHour));
const hours = h.time.slice(start, start + hourCount).map((time, j) => {
  const i = start + j;
  return { time, temp: round(h.temperature_2m[i]), rain: round(h.precipitation_probability[i]) ?? 0, ...describe(h.weather_code[i]) };
});
```

`describe(code)` turns WMO weather codes (0 = clear sky, 63 = rain, 95 = thunderstorm) into a label and an icon name.

```svg Parallel arrays in, one object per hour out
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 120" font-family="monospace" font-size="11">
  <rect width="520" height="120" fill="#fff"/>
  <text x="10" y="20">time:  [14:00, 15:00, 16:00]</text><text x="10" y="40">temp:  [ 81,    80,    78  ]</text><text x="10" y="60">rain:  [ 10,    40,    70  ]</text>
  <path d="M245 40 H285" stroke="#374151" stroke-width="2"/><text x="250" y="32" font-family="sans-serif">zip by index</text>
  <text x="295" y="20">{ time: 14:00, temp: 81, rain: 10 }</text><text x="295" y="40">{ time: 15:00, temp: 80, rain: 40 }</text><text x="295" y="60">{ time: 16:00, temp: 78, rain: 70 }</text>
</svg>
```

quiz: Why does the URL ask for timezone: 'auto'?
- [ ] It's required by Open-Meteo
- [x] Times come back in the place's own local time, so the hours and sunrise make sense for that city
- [ ] It converts temperatures
why: A forecast for another city should read in that city's clock.

quiz: Why does parseForecast start the hours at the one containing "now"?
- [x] The hourly arrays start at midnight, and the app should show the next 12 hours from the current one
- [ ] To skip the first hour's bad data
- [ ] Because Open-Meteo returns hours in reverse
why: findIndex on the current hour gives the right starting point in the place's local time.

## Step: Safe preferences and recent places
kind: read
time: 12
uses: reactfetch

Your city, unit and theme are saved in `localStorage`. Saved data can be old, edited or blocked, so `load()` keeps only values that make sense and falls back to defaults:

```js
export function load(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage?.getItem(KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return { ...DEFAULTS };
    return {
      unit: saved.unit === 'c' ? 'c' : 'f',
      theme: saved.theme === 'light' ? 'light' : 'dark',
      place: isPlace(saved.place) ? saved.place : DEFAULT_PLACE,
      recent: Array.isArray(saved.recent) ? saved.recent.filter(isPlace).slice(0, 5) : [],
    };
  } catch {
    return { ...DEFAULTS };                    // blocked storage or broken JSON
  }
}

/** Puts a place first in the recent list, without repeats, keeping five. */
export function remember(recent, place) {
  return [place, ...recent.filter((p) => !(p.lat === place.lat && p.lon === place.lon))].slice(0, 5);
}
```

`isPlace()` checks the name is text and the latitude and longitude are real numbers in range, so a broken save can never send a bad request.

```svg Whatever is saved, load() returns a valid set of preferences
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 110" font-family="sans-serif" font-size="12">
  <rect width="520" height="110" fill="#fff"/>
  <rect x="10" y="10" width="150" height="26" rx="5" fill="#dcfce7"/><text x="20" y="27">good saved prefs</text>
  <rect x="10" y="42" width="150" height="26" rx="5" fill="#fef3c7"/><text x="20" y="59">{"unit":"kelvin"}</text>
  <rect x="10" y="74" width="150" height="26" rx="5" fill="#fee2e2"/><text x="20" y="91">blocked or broken</text>
  <path d="M160 23 L260 55 M160 55 H260 M160 87 L260 55" stroke="#374151" stroke-width="2"/>
  <rect x="260" y="40" width="90" height="30" rx="6" fill="#e0e7ff"/><text x="305" y="59" text-anchor="middle">load()</text>
  <path d="M350 55 H390" stroke="#374151" stroke-width="2"/><text x="395" y="59">valid prefs, always</text>
</svg>
```

quiz: What does load() return if localStorage throws (for example in a strict private window)?
- [ ] It crashes the app
- [x] The defaults, because every read is inside try/catch
- [ ] An empty object
why: The app should always start, even with no storage.

## Session: The React app

## Step: App.jsx: one effect fetches everything
kind: read
time: 18
uses: reactfetch

`App` holds the preferences and the data, and one `refresh` function loads the forecast and air quality together. It goes through the cache, and through `latest()` so a slow answer for an old city is dropped:

```jsx
const cache = useMemo(() => new Cache(), []);       // one cache for the app's lifetime
const run = useRef(latest());

const refresh = useCallback(() => {
  setLoading(true);
  setError('');
  run.current(
    () => Promise.all([
      getJson(forecastUrl(prefs.place, prefs.unit), { cache }).then(parseForecast),
      getJson(airUrl(prefs.place), { cache }).catch(() => null),     // air quality is optional
    ]).then(([f, a]) => ({ f, a }), (e) => ({ e })),
    ({ f, a, e }) => {
      setLoading(false);
      if (e) { setError(e.message || "The forecast couldn't be loaded."); return; }
      setForecast(f);
      setAir(a);
    },
  );
}, [prefs.place, prefs.unit, cache]);

useEffect(() => { refresh(); }, [refresh]);
useEffect(() => { save(prefs, storage); }, [prefs, storage]);
```

- `useCallback` gives `refresh` a new identity only when the place or unit changes, so the effect re-runs exactly then. The **Try again** button calls the same function.
- If air quality fails, the forecast still shows: its `.catch(() => null)` turns that error into "no data".
- While loading, gray skeleton boxes keep the layout from jumping.

```svg Changing the city or unit makes a new refresh, which runs the effect, which fetches through the cache
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 90" font-family="sans-serif" font-size="12">
  <rect width="520" height="90" fill="#fff"/>
  <rect x="10" y="30" width="100" height="30" rx="6" fill="#fef3c7"/><text x="60" y="49" text-anchor="middle">place / unit</text>
  <rect x="140" y="30" width="110" height="30" rx="6" fill="#e0e7ff"/><text x="195" y="49" text-anchor="middle">new refresh</text>
  <rect x="280" y="30" width="90" height="30" rx="6" fill="#dbeafe"/><text x="325" y="49" text-anchor="middle">effect runs</text>
  <rect x="400" y="30" width="110" height="30" rx="6" fill="#dcfce7"/><text x="455" y="49" text-anchor="middle">cache → fetch</text>
  <path d="M110 45 H140 M250 45 H280 M370 45 H400" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why is the air-quality request wrapped in .catch(() => null)?
- [ ] Air quality never fails
- [x] So a failure there shows "no data" for air quality instead of hiding the whole forecast
- [ ] null loads faster
why: Optional data shouldn't take the main screen down with it.

quiz: Why is the cache created with useMemo(() => new Cache(), [])?
- [x] So the same cache is kept across renders instead of a new, empty one each time
- [ ] useMemo makes the cache expire
- [ ] Classes can't be created in components
why: An empty dependency list means "make it once".

## Step: The components: chart, search and the week
kind: read
time: 15
uses: svgcharts, combobox

The components only draw what they're given:

- **RainChart** is the SVG bar chart from Charts drawn with SVG, with a hidden table of the same numbers.
- **Search** is the debounced combobox from Search as you type. It calls `onPick(place)`, and App adds the old place to the recent list with `remember()`.
- **Week** shows a big card for today (temperature, real feel, wind, humidity, pressure, sunrise and sunset) and a card per day after it with its icon, high, low and chance of rain. Each card has an `aria-label` that reads the whole day in one sentence.
- **Your location** uses `navigator.geolocation` only when the button is pressed, and explains itself if the browser blocks it.

```jsx
const pick = (place) => setPrefs((p) => ({ ...p, place, recent: remember(p.recent, p.place) }));
```

```svg Components get data and callbacks as props; only App changes state
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 120" font-family="sans-serif" font-size="12">
  <rect width="520" height="120" fill="#fff"/>
  <rect x="200" y="10" width="120" height="30" rx="6" fill="#e0e7ff"/><text x="260" y="29" text-anchor="middle">App (state)</text>
  <rect x="10" y="80" width="110" height="30" rx="6" fill="#dbeafe"/><text x="65" y="99" text-anchor="middle">RainChart</text>
  <rect x="140" y="80" width="110" height="30" rx="6" fill="#dbeafe"/><text x="195" y="99" text-anchor="middle">Week</text>
  <rect x="270" y="80" width="110" height="30" rx="6" fill="#dbeafe"/><text x="325" y="99" text-anchor="middle">Search</text>
  <rect x="400" y="80" width="110" height="30" rx="6" fill="#dbeafe"/><text x="455" y="99" text-anchor="middle">Cities</text>
  <path d="M260 40 L65 80 M260 40 L195 80 M260 40 L325 80 M260 40 L455 80" stroke="#374151"/>
  <text x="330" y="65" fill="#16a34a">onPick(place) ↑</text>
</svg>
```

quiz: How does Search change the city when it lives inside App?
- [ ] It writes to localStorage directly
- [x] App passes an onPick callback; Search calls it and App updates its state
- [ ] It changes a global variable
why: Data flows down as props, and changes flow up through callbacks.

## Step: How the real project is organized
kind: read
time: 10

The repo builds with **esbuild** into `docs/`, which GitHub Pages serves:

```bash
npm install
npm start       # builds and serves at http://localhost:8000, rebuilding on every change
npm test        # node --test: URLs, parsing, the cache, latest(), prefs
npm run build   # minified build into docs/
```

The tests use saved Open-Meteo answers (`test/fixtures.js`), so they run offline and never change:

| Test | Checks |
|---|---|
| the forecast URL | now, hours and 7 days, in the chosen units |
| parsing the forecast | the next 12 hours start at the current hour |
| the cache | answers expire after 10 minutes; failures are never cached |
| only the newest request | an older request finishing last is dropped |
| prefs | bad or blocked storage gives the defaults |

```svg Source files are bundled by esbuild into docs/, which GitHub Pages serves
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 80" font-family="sans-serif" font-size="12">
  <rect width="520" height="80" fill="#fff"/>
  <rect x="10" y="25" width="130" height="30" rx="6" fill="#e0e7ff"/><text x="75" y="44" text-anchor="middle">src/*.jsx, lib/*.js</text>
  <rect x="190" y="25" width="110" height="30" rx="6" fill="#fef3c7"/><text x="245" y="44" text-anchor="middle">esbuild</text>
  <rect x="350" y="25" width="160" height="30" rx="6" fill="#dcfce7"/><text x="430" y="44" text-anchor="middle">docs/app.js → Pages</text>
  <path d="M140 40 H190 M300 40 H350" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why do the tests use saved API answers instead of calling Open-Meteo?
- [ ] Open-Meteo doesn't allow tests
- [x] Saved answers make the tests fast, offline and the same every time
- [ ] Real answers are too big
why: Tests that depend on live data fail for reasons that have nothing to do with your code.

## Finish

You built a full React dashboard from tested plain functions, one request per screen, a cache, late-answer protection, an SVG chart and a keyboard search.

### Challenges

1. Add a "feels like" line to the hourly strip.
2. Show a warning banner when a thunderstorm code appears in the next 12 hours.
3. Add a third unit setting for wind (m/s).
