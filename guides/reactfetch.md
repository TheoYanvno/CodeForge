---
id: reactfetch
title: Fetching data in React
goals: Load data in a useEffect with loading and error states; Keep slow, out-of-date answers from overwriting newer ones; Cache answers for a few minutes so switching back is instant
prereqs: React basics (components, state, useEffect); Web APIs (fetch, async and await, res.ok)
---

## Session: Data that arrives later

## Step: Loading, data and error: three states, one effect
kind: read
time: 15

A component draws right away, but data from an API arrives later. So a screen that fetches always has **three states**: still loading, loaded, or failed. Keep them in state and draw each one:

```jsx
function Forecast({ city }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m`)
      .then((res) => { if (!res.ok) throw new Error(`The weather service answered ${res.status}.`); return res.json(); })
      .then((json) => setData(json))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [city.lat, city.lon]);              // fetch again only when the place changes

  if (error) return <p role="alert">{error}</p>;
  if (loading && !data) return <p>Loading…</p>;
  return <p>{data.current.temperature_2m}°</p>;
}
```

```svg A fetch moves a screen through three states: loading, then either data or an error
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 110" font-family="sans-serif" font-size="13">
  <rect width="520" height="110" fill="#fff"/>
  <rect x="10" y="40" width="120" height="40" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="70" y="65" text-anchor="middle">loading</text>
  <rect x="250" y="10" width="120" height="40" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="310" y="35" text-anchor="middle">data</text>
  <rect x="250" y="62" width="120" height="40" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="310" y="87" text-anchor="middle">error</text>
  <path d="M130 55 L250 30 M130 65 L250 82" stroke="#374151" stroke-width="2"/>
  <text x="390" y="35">res.ok, JSON parsed</text><text x="390" y="87">network or HTTP error</text>
</svg>
```

The dependency list `[city.lat, city.lon]` is the rule for "when do I fetch again". Leave it out and the effect runs after every render, which fetches forever.

quiz: Why keep loading, data and error as separate pieces of state?
- [ ] React can only store strings
- [x] The screen has to show something different in each case, and an error can happen after an earlier success
- [ ] fetch needs three variables to work
why: Each state is a different screen. Keeping them apart lets you show "Loading…", the data, or a clear error.

quiz: What happens if a fetching useEffect has no dependency list at all?
- [x] It runs after every render, and setting the data causes another render, so it fetches over and over
- [ ] It runs only once
- [ ] It never runs
why: No list means "after every render". The list says which values should trigger a new fetch.

## Step: Late answers: show only the newest request
kind: read
time: 15

Click Orlando, then quickly Seattle. If Orlando's answer is slow, it can arrive **after** Seattle's and overwrite it: the page says Seattle but shows Orlando's weather. Every app that fetches on a click has this bug until it's handled.

Weatherboard fixes it with a tiny helper. Each call takes a ticket; when the answer arrives, it's delivered only if no newer call started since:

```js
export function latest() {
  let ticket = 0;
  return async (fn, deliver) => {
    const mine = ++ticket;
    const result = await fn();
    if (mine === ticket) deliver(result);   // an older call quietly drops its answer
    return mine === ticket;
  };
}
```

```svg Two requests race: Seattle's answer arrives first and is shown; Orlando's late answer is dropped
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 120" font-family="sans-serif" font-size="12">
  <rect width="520" height="120" fill="#fff"/>
  <line x1="20" y1="100" x2="500" y2="100" stroke="#9ca3af"/><text x="470" y="115">time</text>
  <rect x="30" y="20" width="330" height="22" rx="5" fill="#e0e7ff"/><text x="40" y="35">Orlando (ticket 1): slow</text>
  <rect x="100" y="55" width="150" height="22" rx="5" fill="#dcfce7"/><text x="110" y="70">Seattle (ticket 2)</text>
  <text x="258" y="70" fill="#16a34a">✓ shown</text><text x="368" y="35" fill="#dc2626">✗ dropped: ticket 1 ≠ 2</text>
</svg>
```

In a component, keep the helper in a ref so it survives renders: `const run = useRef(latest());`, then `run.current(() => getJson(url), setForecast)`.

> An `AbortController` can cancel the old request too, but the ticket check works for any async work, including ones you can't cancel.

quiz: Why can an older request's answer arrive after a newer one?
- [ ] fetch runs requests in alphabetical order
- [x] Requests travel separately, and the first one sent isn't always the first one answered
- [ ] React delays old requests on purpose
why: Network and server times vary, so answers can come back in any order.

quiz: Why is the latest() helper kept in useRef instead of being created in the component body?
- [x] A ref keeps the same helper, and its ticket count, across renders; a new one every render would forget older calls
- [ ] Refs make functions faster
- [ ] useRef is required for async functions
why: The ticket counter only works if every call goes through the same helper.

## Step: A short cache, so switching back is instant
kind: read
time: 15

Flipping between two cities shouldn't ask the server again every time. Weatherboard keeps answers for ten minutes in a `Map` keyed by the request URL:

```js
export class Cache {
  constructor(ttlMs = 10 * 60 * 1000, now = () => Date.now()) { this.ttl = ttlMs; this.now = now; this.map = new Map(); }
  get(key) {
    const hit = this.map.get(key);
    if (!hit) return undefined;
    if (this.now() - hit.at > this.ttl) { this.map.delete(key); return undefined; }   // too old
    return hit.value;
  }
  set(key, value) {
    this.map.set(key, { value, at: this.now() });
    if (this.map.size > 50) this.map.delete(this.map.keys().next().value);       // keep it small
    return value;
  }
}

export async function getJson(url, { cache, fetchImpl = fetch } = {}) {
  const cached = cache?.get(url);
  if (cached) return cached;
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(res.status === 429 ? 'Too many requests right now. Try again in a minute.' : `The weather service answered ${res.status}.`);
  return cache ? cache.set(url, await res.json()) : res.json();
}
```

| Choice | Why |
|---|---|
| The URL is the key | Same place and same units mean the same answer |
| Ten minutes | Weather changes slowly; old enough data is thrown away |
| Failed requests aren't cached | The next try really asks again |
| `now` and `fetchImpl` are parameters | Tests pass a fake clock and a fake fetch, with no network |

```svg getJson checks the cache first; only a miss goes to the network, and good answers are stored
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 100" font-family="sans-serif" font-size="12">
  <rect width="520" height="100" fill="#fff"/>
  <rect x="10" y="35" width="90" height="34" rx="6" fill="#e0e7ff" stroke="#4f46e5"/><text x="55" y="56" text-anchor="middle">getJson(url)</text>
  <rect x="150" y="35" width="100" height="34" rx="6" fill="#fef3c7" stroke="#f59e0b"/><text x="200" y="56" text-anchor="middle">cache.get</text>
  <rect x="300" y="5" width="100" height="34" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="350" y="26" text-anchor="middle">return it</text>
  <rect x="300" y="62" width="100" height="34" rx="6" fill="#dbeafe" stroke="#2563eb"/><text x="350" y="83" text-anchor="middle">fetch + set</text>
  <path d="M100 52 H150 M250 46 L300 24 M250 58 L300 78" stroke="#374151" stroke-width="2"/>
  <text x="262" y="22">hit</text><text x="262" y="92">miss</text>
</svg>
```

quiz: Why does the cache take the clock as a parameter (now)?
- [ ] Date.now() doesn't work in browsers
- [x] A test can pass a fake clock and check that an answer expires after ten minutes without waiting
- [ ] It makes the cache faster
why: Passing in time, network and storage makes code testable without real waiting or real requests.

quiz: Why aren't failed requests stored in the cache?
- [x] So the next attempt asks the server again instead of repeating the old error for ten minutes
- [ ] Errors are too big to store
- [ ] Maps can't hold errors
why: A cache should only remember good answers.

## Finish

You can now fetch in an effect with loading and error states, drop late answers with a ticket, and cache answers by URL. Weatherboard uses all three.

### Challenges

1. Add a **Retry** button that clears the error and fetches again.
2. Make the cache keep at most 5 answers and test that the oldest goes first.
3. Add an `AbortController` and cancel the previous request when a new one starts.
