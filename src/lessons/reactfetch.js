// Built from guides/reactfetch.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "reactfetch",
 "title": "Fetching data in React",
 "goals": [
  "Load data in a useEffect with loading and error states",
  "Keep slow, out-of-date answers from overwriting newer ones",
  "Cache answers for a few minutes so switching back is instant"
 ],
 "prereqs": [
  "React basics (components, state, useEffect)",
  "Web APIs (fetch, async and await, res.ok)"
 ],
 "sessions": [
  {
   "title": "Data that arrives later",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "Loading, data and error: three states, one effect",
   "body": "A component draws right away, but data from an API arrives later. So a screen that fetches always has **three states**: still loading, loaded, or failed. Keep them in state and draw each one:\n\n```jsx\nfunction Forecast({ city }) {\n  const [data, setData] = useState(null);\n  const [error, setError] = useState('');\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    setLoading(true);\n    setError('');\n    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m`)\n      .then((res) => { if (!res.ok) throw new Error(`The weather service answered ${res.status}.`); return res.json(); })\n      .then((json) => setData(json))\n      .catch((e) => setError(e.message))\n      .finally(() => setLoading(false));\n  }, [city.lat, city.lon]);              // fetch again only when the place changes\n\n  if (error) return <p role=\"alert\">{error}</p>;\n  if (loading && !data) return <p>Loading…</p>;\n  return <p>{data.current.temperature_2m}°</p>;\n}\n```\n\n```svg A fetch moves a screen through three states: loading, then either data or an error\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 110\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"110\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"40\" width=\"120\" height=\"40\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"70\" y=\"65\" text-anchor=\"middle\">loading</text>\n  <rect x=\"250\" y=\"10\" width=\"120\" height=\"40\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"310\" y=\"35\" text-anchor=\"middle\">data</text>\n  <rect x=\"250\" y=\"62\" width=\"120\" height=\"40\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"310\" y=\"87\" text-anchor=\"middle\">error</text>\n  <path d=\"M130 55 L250 30 M130 65 L250 82\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"390\" y=\"35\">res.ok, JSON parsed</text><text x=\"390\" y=\"87\">network or HTTP error</text>\n</svg>\n```\n\nThe dependency list `[city.lat, city.lon]` is the rule for \"when do I fetch again\". Leave it out and the effect runs after every render, which fetches forever.",
   "quiz": [
    {
     "q": "Why keep loading, data and error as separate pieces of state?",
     "options": [
      "React can only store strings",
      "The screen has to show something different in each case, and an error can happen after an earlier success",
      "fetch needs three variables to work"
     ],
     "answer": 1,
     "why": "Each state is a different screen. Keeping them apart lets you show \"Loading…\", the data, or a clear error."
    },
    {
     "q": "What happens if a fetching useEffect has no dependency list at all?",
     "options": [
      "It runs after every render, and setting the data causes another render, so it fetches over and over",
      "It runs only once",
      "It never runs"
     ],
     "answer": 0,
     "why": "No list means \"after every render\". The list says which values should trigger a new fetch."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Late answers: show only the newest request",
   "body": "Click Orlando, then quickly Seattle. If Orlando's answer is slow, it can arrive **after** Seattle's and overwrite it: the page says Seattle but shows Orlando's weather. Every app that fetches on a click has this bug until it's handled.\n\nWeatherboard fixes it with a tiny helper. Each call takes a ticket; when the answer arrives, it's delivered only if no newer call started since:\n\n```js\nexport function latest() {\n  let ticket = 0;\n  return async (fn, deliver) => {\n    const mine = ++ticket;\n    const result = await fn();\n    if (mine === ticket) deliver(result);   // an older call quietly drops its answer\n    return mine === ticket;\n  };\n}\n```\n\n```svg Two requests race: Seattle's answer arrives first and is shown; Orlando's late answer is dropped\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"120\" fill=\"#fff\"/>\n  <line x1=\"20\" y1=\"100\" x2=\"500\" y2=\"100\" stroke=\"#9ca3af\"/><text x=\"470\" y=\"115\">time</text>\n  <rect x=\"30\" y=\"20\" width=\"330\" height=\"22\" rx=\"5\" fill=\"#e0e7ff\"/><text x=\"40\" y=\"35\">Orlando (ticket 1): slow</text>\n  <rect x=\"100\" y=\"55\" width=\"150\" height=\"22\" rx=\"5\" fill=\"#dcfce7\"/><text x=\"110\" y=\"70\">Seattle (ticket 2)</text>\n  <text x=\"258\" y=\"70\" fill=\"#16a34a\">✓ shown</text><text x=\"368\" y=\"35\" fill=\"#dc2626\">✗ dropped: ticket 1 ≠ 2</text>\n</svg>\n```\n\nIn a component, keep the helper in a ref so it survives renders: `const run = useRef(latest());`, then `run.current(() => getJson(url), setForecast)`.\n\n> An `AbortController` can cancel the old request too, but the ticket check works for any async work, including ones you can't cancel.",
   "quiz": [
    {
     "q": "Why can an older request's answer arrive after a newer one?",
     "options": [
      "fetch runs requests in alphabetical order",
      "Requests travel separately, and the first one sent isn't always the first one answered",
      "React delays old requests on purpose"
     ],
     "answer": 1,
     "why": "Network and server times vary, so answers can come back in any order."
    },
    {
     "q": "Why is the latest() helper kept in useRef instead of being created in the component body?",
     "options": [
      "A ref keeps the same helper, and its ticket count, across renders; a new one every render would forget older calls",
      "Refs make functions faster",
      "useRef is required for async functions"
     ],
     "answer": 0,
     "why": "The ticket counter only works if every call goes through the same helper."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "A short cache, so switching back is instant",
   "body": "Flipping between two cities shouldn't ask the server again every time. Weatherboard keeps answers for ten minutes in a `Map` keyed by the request URL:\n\n```js\nexport class Cache {\n  constructor(ttlMs = 10 * 60 * 1000, now = () => Date.now()) { this.ttl = ttlMs; this.now = now; this.map = new Map(); }\n  get(key) {\n    const hit = this.map.get(key);\n    if (!hit) return undefined;\n    if (this.now() - hit.at > this.ttl) { this.map.delete(key); return undefined; }   // too old\n    return hit.value;\n  }\n  set(key, value) {\n    this.map.set(key, { value, at: this.now() });\n    if (this.map.size > 50) this.map.delete(this.map.keys().next().value);       // keep it small\n    return value;\n  }\n}\n\nexport async function getJson(url, { cache, fetchImpl = fetch } = {}) {\n  const cached = cache?.get(url);\n  if (cached) return cached;\n  const res = await fetchImpl(url);\n  if (!res.ok) throw new Error(res.status === 429 ? 'Too many requests right now. Try again in a minute.' : `The weather service answered ${res.status}.`);\n  return cache ? cache.set(url, await res.json()) : res.json();\n}\n```\n\n| Choice | Why |\n|---|---|\n| The URL is the key | Same place and same units mean the same answer |\n| Ten minutes | Weather changes slowly; old enough data is thrown away |\n| Failed requests aren't cached | The next try really asks again |\n| `now` and `fetchImpl` are parameters | Tests pass a fake clock and a fake fetch, with no network |\n\n```svg getJson checks the cache first; only a miss goes to the network, and good answers are stored\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"100\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"35\" width=\"90\" height=\"34\" rx=\"6\" fill=\"#e0e7ff\" stroke=\"#4f46e5\"/><text x=\"55\" y=\"56\" text-anchor=\"middle\">getJson(url)</text>\n  <rect x=\"150\" y=\"35\" width=\"100\" height=\"34\" rx=\"6\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"200\" y=\"56\" text-anchor=\"middle\">cache.get</text>\n  <rect x=\"300\" y=\"5\" width=\"100\" height=\"34\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"350\" y=\"26\" text-anchor=\"middle\">return it</text>\n  <rect x=\"300\" y=\"62\" width=\"100\" height=\"34\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"350\" y=\"83\" text-anchor=\"middle\">fetch + set</text>\n  <path d=\"M100 52 H150 M250 46 L300 24 M250 58 L300 78\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"262\" y=\"22\">hit</text><text x=\"262\" y=\"92\">miss</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does the cache take the clock as a parameter (now)?",
     "options": [
      "Date.now() doesn't work in browsers",
      "A test can pass a fake clock and check that an answer expires after ten minutes without waiting",
      "It makes the cache faster"
     ],
     "answer": 1,
     "why": "Passing in time, network and storage makes code testable without real waiting or real requests."
    },
    {
     "q": "Why aren't failed requests stored in the cache?",
     "options": [
      "So the next attempt asks the server again instead of repeating the old error for ten minutes",
      "Errors are too big to store",
      "Maps can't hold errors"
     ],
     "answer": 0,
     "why": "A cache should only remember good answers."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  }
 ],
 "finish": "You can now fetch in an effect with loading and error states, drop late answers with a ticket, and cache answers by URL. Weatherboard uses all three.\n\n### Challenges\n\n1. Add a **Retry** button that clears the error and fetches again.\n2. Make the cache keep at most 5 answers and test that the oldest goes first.\n3. Add an `AbortController` and cancel the previous request when a new one starts."
};
