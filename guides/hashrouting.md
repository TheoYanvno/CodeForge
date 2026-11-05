---
id: hashrouting
title: Hash routing
blocks-html: page
blocks-css: base
blocks-js: data, router, params, polish
goals: Explain how one HTML page can act like many using the URL hash; Read location.hash and redraw on the hashchange event; Match routes with regular expressions and pull out parts like a post's slug; Show a friendly not-found page for any address you don't know; Update the title, the active link and the focus on every page change, so it feels and reads like a real site
prereqs: The Parsing Markdown lesson (regular expressions and groups) and the Sharing lesson (hash links)
---

## Session: One page, many pages

## Step: How hash routing works
time: 10
kind: read

A normal website has a file for each page: `about.html`, `posts/bonfire.html`. Clicking a link loads a whole new page. A **single-page app** has one HTML file, and JavaScript draws the right "page" into it. The **hash** (the part after `#`) says which page.

```svg Clicking a link changes only the hash; the page doesn't reload, hashchange fires, and the router draws the matching view
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 130" font-family="sans-serif" font-size="11">
  <rect x="5" y="10" width="320" height="26" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><text x="14" y="28">https://you.github.io/blog/</text><text x="168" y="28" fill="#c2410c" font-weight="700">#/post/first-flame</text>
  <rect x="20" y="62" width="80" height="34" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="60" y="83" text-anchor="middle">hashchange</text>
  <rect x="125" y="62" width="80" height="34" rx="8" fill="#6366f1"/><text x="165" y="83" text-anchor="middle" fill="#fff">router</text>
  <rect x="230" y="62" width="90" height="34" rx="8" fill="#fed7aa" stroke="#ea580c"/><text x="275" y="83" text-anchor="middle">post view</text>
  <path d="M230 38 L60 60 M100 79 H121 M205 79 H226" stroke="#111" stroke-width="1.5"/>
  <text x="165" y="118" text-anchor="middle" fill="#334155">no reload: only the view changes</text>
</svg>
```

Why the hash and not real paths like `/post/first-flame`? Because changing the hash **never asks the server for anything**. That's exactly what a static host like GitHub Pages needs: there's only one real file, and every "page" still works, including the browser's Back and Forward buttons and bookmarks.

A **router** is a small table that maps address patterns to view functions:

| Hash | View |
|---|---|
| `#/` (or nothing) | the home page |
| `#/post/first-flame` | the post with slug `first-flame` |
| `#/tag/bosses` | posts tagged `bosses` |
| anything else | not found |

The real Bonfire Notes builds a real file for every page with Python, which is even better for search engines. Hash routing is how you'd do it with no build step at all, and it's how CodeForge itself and the Cybersecurity Intro Academy switch pages.

## Step: Read the hash and redraw
time: 12

The router reads `location.hash`, picks a view, and draws it. It runs once when the page loads and again on every `hashchange`:

```js
function route() {
  const hash = location.hash || '#/';
  view.innerHTML = hash === '#/' ? home() : notFound();
}
window.addEventListener('hashchange', route);
route();
```

Links are just `<a href="#/post/first-flame">`. No click handlers: the browser changes the hash, the event fires, the router draws.

check: js | reading the hash | /location\.hash/ | const hash = location.hash || '#/';
check: js | redrawing when it changes | /addEventListener\(\s*['"]hashchange['"]/ | window.addEventListener('hashchange', route);

quiz: You click a link to `#/post/first-flame`. Does the browser ask the server for a new page?
- [ ] Yes, every link loads a page
- [x] No; only the hash changes, so the page stays and hashchange fires
- [ ] Only the first time
why: The hash never goes to the server. That's what makes this work on static hosting.

quiz: Why does `route()` also run once when the page loads?
- [x] So a bookmarked or shared link like #/post/first-flame opens on the right page
- [ ] hashchange doesn't work on the first load
- [ ] To make the page load faster
why: A link someone shares starts with a hash already set; the router must handle it straight away.

```html page
<header class="site">
  <a class="brand" href="#/">🔥 Bonfire</a>
  <nav id="nav"><a href="#/">Home</a> <a href="#/tag/bosses">Bosses</a> <a href="#/about">About</a> <a href="#/nope">A broken link</a></nav>
</header>
<main id="view" class="view" tabindex="-1"></main>
```

```css base
body { margin: 0; font-family: Georgia, serif; background: #1c1917; color: #f5f5f4; }
.site { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; padding: 12px 16px; border-bottom: 1px solid #44403c; }
.brand { font-weight: 700; color: #fdba74; text-decoration: none; margin-right: auto; }
nav a { color: #e7e5e4; font-family: system-ui, sans-serif; font-size: .9rem; margin-right: 8px; }
nav a[aria-current="page"] { color: #fdba74; font-weight: 700; text-decoration: none; }
.view { max-width: 640px; margin: 0 auto; padding: 16px; outline: none; }
.view a { color: #fb923c; }
.card { padding: 12px; margin: 10px 0; border: 1px solid #44403c; border-radius: 10px; }
.tag { font: .75rem system-ui, sans-serif; color: #a8a29e; }
```

```js data
const POSTS = [
  { slug: 'first-flame', title: 'Linking the First Flame', tags: ['bosses', 'endings'], body: 'The last fight is quiet. No music until the second phase.' },
  { slug: 'estus-guide', title: 'How to Upgrade Your Estus', tags: ['guides'], body: 'Find the shards first, then rest and upgrade at the Firelink bonfire.' },
  { slug: 'four-kings', title: 'Beating the Four Kings', tags: ['bosses'], body: 'Kill them fast. A new king arrives every fifty seconds.' },
];

const view = document.getElementById('view');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const card = (p) => `<article class="card"><h2><a href="#/post/${p.slug}">${esc(p.title)}</a></h2><p class="tag">${p.tags.map((t) => `<a href="#/tag/${t}">#${t}</a>`).join(' ')}</p></article>`;
```

```js router
const home = () => `<h1>Notes from the bonfire</h1>${POSTS.map(card).join('')}`;
const notFound = () => '<h1>Lost in the dark</h1><p>No page lives here. <a href="#/">Back to the bonfire</a>.</p>';

function route() {
  const hash = location.hash || '#/';
  view.innerHTML = hash === '#/' ? home() : notFound();
}

window.addEventListener('hashchange', route);
route();
```

## Step: Routes with parts, like a post's slug
time: 15

`#/post/first-flame` and `#/post/four-kings` are the same *kind* of page with a different slug. A regex with a group catches both and pulls out the slug:

```js
[/^#\/post\/([\w-]+)$/, (slug) => postPage(slug)]
```

The router keeps a list of `[pattern, view]` pairs and uses the **first** pattern that matches, passing the groups to the view. That's the same router the Cybersecurity Intro Academy uses.

```svg The router tries each pattern in order; the first match wins and its groups become the view's arguments
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" font-family="ui-monospace, monospace" font-size="11">
  <text x="5" y="16" font-family="sans-serif">#/post/four-kings</text>
  <rect x="5" y="26" width="200" height="22" rx="4" fill="#f1f5f9" stroke="#94a3b8"/><text x="12" y="41">^#\/$                 ✗</text>
  <rect x="5" y="52" width="200" height="22" rx="4" fill="#dcfce7" stroke="#16a34a"/><text x="12" y="67">^#\/post\/([\w-]+)$   ✓</text>
  <rect x="5" y="78" width="200" height="22" rx="4" fill="#f1f5f9" stroke="#94a3b8"/><text x="12" y="93">^#\/tag\/([\w-]+)$    (not tried)</text>
  <text x="215" y="67" font-family="sans-serif">postPage('four-kings')</text>
</svg>
```

A slug that matches the pattern but isn't a real post (`#/post/nope`) still gets the not-found page: the view checks that the post exists.

check: js | a list of patterns and views | /const\s+routes\s*=\s*\[/ | const routes = [[/^#\/$/, home], ...];
check: js | a pattern that catches the slug | /\^#\\\/post\\\/\(\[\\w-\]\+\)\$/ | a regex for #/post/ followed by a slug in a group
check: js | passing the groups to the view | /\.\.\.\w+\.slice\(\s*1\s*\)/ | view(...m.slice(1))

quiz: What does `'#/tag/bosses'.match(/^#\/tag\/([\w-]+)$/)[1]` give?
- [x] "bosses"
- [ ] "#/tag/bosses"
- [ ] "tag"
why: Index 1 is group 1, the part inside the parentheses.

quiz: Why does postPage still show not-found for `#/post/nope`?
- [ ] The pattern doesn't match it
- [x] The pattern matches, but there's no post with that slug, so the view says so
- [ ] Slugs can't be four letters
why: Matching the shape of an address isn't the same as the thing existing.

```js router
const home = () => `<h1>Notes from the bonfire</h1>${POSTS.map(card).join('')}`;
const notFound = () => '<h1>Lost in the dark</h1><p>No page lives here. <a href="#/">Back to the bonfire</a>.</p>';
```

```js params
const postPage = (slug) => {
  const p = POSTS.find((x) => x.slug === slug);
  if (!p) return notFound();
  return `<p><a href="#/">← All notes</a></p><h1>${esc(p.title)}</h1><p>${esc(p.body)}</p><p class="tag">${p.tags.map((t) => `<a href="#/tag/${t}">#${t}</a>`).join(' ')}</p>`;
};

const tagPage = (tag) => {
  const list = POSTS.filter((p) => p.tags.includes(tag));
  return list.length ? `<h1>#${esc(tag)}</h1>${list.map(card).join('')}` : notFound();
};

const about = () => '<h1>About</h1><p>A small blog about fires, bosses and getting a little further each time.</p>';

const routes = [
  [/^#\/$/, home],
  [/^#\/post\/([\w-]+)$/, postPage],
  [/^#\/tag\/([\w-]+)$/, tagPage],
  [/^#\/about$/, about],
];

function route() {
  const hash = location.hash || '#/';
  for (const [pattern, page] of routes) {
    const m = hash.match(pattern);
    if (m) { view.innerHTML = page(...m.slice(1)); return; }
  }
  view.innerHTML = notFound();
}

window.addEventListener('hashchange', route);
route();
```

## Step: Titles, the active link and focus
time: 12

A real page change does three things people rely on, and a single-page app has to do them itself:

- **The tab title changes.** Each view returns its title too, and the router sets `document.title`. History lists and bookmarks then make sense.
- **The current link is marked.** The nav link for the current section gets `aria-current="page"`, which screen readers announce and the CSS styles.
- **Focus moves to the new content.** After a real page load, a screen reader starts at the top. Here nothing would happen, so the router moves focus to the main area (`tabindex="-1"` lets it receive focus) and scrolls to the top.

```svg After drawing a view, the router updates the title, marks the current link and moves focus to the content
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 90" font-family="sans-serif" font-size="11">
  <rect x="5" y="25" width="70" height="34" rx="8" fill="#6366f1"/><text x="40" y="46" text-anchor="middle" fill="#fff">draw view</text>
  <rect x="90" y="25" width="75" height="34" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="127" y="46" text-anchor="middle">document.title</text>
  <rect x="180" y="25" width="75" height="34" rx="8" fill="#fed7aa" stroke="#ea580c"/><text x="217" y="46" text-anchor="middle">aria-current</text>
  <rect x="270" y="25" width="55" height="34" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="297" y="46" text-anchor="middle">focus()</text>
  <path d="M75 42 H86 M165 42 H176 M255 42 H266" stroke="#111" stroke-width="2"/>
</svg>
```

check: js | the tab title changes | /document\.title\s*=/ | document.title = `${title} · Bonfire`;
check: js | the current link is marked | /aria-current/ | a.toggleAttribute('aria-current', ...)
check: js | focus moves to the new content | /view\.focus\(/ | view.focus({ preventScroll: true });

quiz: Why move focus to the main area after a page change?
- [x] Screen reader users would otherwise stay on the link they clicked and not hear the new page
- [ ] It makes the page load faster
- [ ] Browsers require it for hash links
why: A real page load resets focus; a single-page app has to do it on purpose.

quiz: What does `tabindex="-1"` on the main area allow?
- [ ] Tabbing to it with the keyboard
- [x] Focusing it from code, without adding it to the Tab order
- [ ] Hiding it from screen readers
why: -1 means "focusable by script only".

```js params
const postPage = (slug) => {
  const p = POSTS.find((x) => x.slug === slug);
  if (!p) return { title: 'Not found', html: notFound() };
  return { title: p.title, html: `<p><a href="#/">← All notes</a></p><h1>${esc(p.title)}</h1><p>${esc(p.body)}</p><p class="tag">${p.tags.map((t) => `<a href="#/tag/${t}">#${t}</a>`).join(' ')}</p>` };
};

const tagPage = (tag) => {
  const list = POSTS.filter((p) => p.tags.includes(tag));
  return list.length ? { title: `#${tag}`, html: `<h1>#${esc(tag)}</h1>${list.map(card).join('')}` } : { title: 'Not found', html: notFound() };
};

const routes = [
  [/^#\/$/, () => ({ title: 'Home', html: home() })],
  [/^#\/post\/([\w-]+)$/, postPage],
  [/^#\/tag\/([\w-]+)$/, tagPage],
  [/^#\/about$/, () => ({ title: 'About', html: '<h1>About</h1><p>A small blog about fires, bosses and getting a little further each time.</p>' })],
];

function route() {
  const hash = location.hash || '#/';
  let page = { title: 'Not found', html: notFound() };
  for (const [pattern, make] of routes) {
    const m = hash.match(pattern);
    if (m) { page = make(...m.slice(1)); break; }
  }
  view.innerHTML = page.html;
  document.title = `${page.title} · Bonfire`;
  markNav(hash);
  view.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();
```

```js polish
function markNav(hash) {
  for (const a of document.querySelectorAll('#nav a')) {
    const href = a.getAttribute('href');
    const current = href === '#/' ? hash === '#/' : hash.startsWith(href);
    if (current) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}
```

## Finish

One page can act like a whole site now. You learned:

- **Hash routing**: the hash picks the view, and it never asks the server
- `location.hash`, the **hashchange** event, and routing on load too
- A **routes table** of regex patterns, the first match wins, groups as arguments
- **Not-found** pages for bad addresses and missing items
- **Titles**, `aria-current` and **focus** on every change

### Challenges

1. Add `#/search/<words>` that lists posts whose title contains the words.
2. Add Newer and Older links at the bottom of each post.
3. Switch to real paths with `history.pushState` and the `popstate` event, and see why GitHub Pages then needs a 404.html trick.

### Next

**Canvas particles**: floating embers behind the posts.
