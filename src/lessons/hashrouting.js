// Built from guides/hashrouting.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "hashrouting",
 "title": "Hash routing",
 "goals": [
  "Explain how one HTML page can act like many using the URL hash",
  "Read location.hash and redraw on the hashchange event",
  "Match routes with regular expressions and pull out parts like a post's slug",
  "Show a friendly not-found page for any address you don't know",
  "Update the title, the active link and the focus on every page change, so it feels and reads like a real site"
 ],
 "prereqs": [
  "The Parsing Markdown lesson (regular expressions and groups) and the Sharing lesson (hash links)"
 ],
 "sessions": [
  {
   "title": "One page, many pages",
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
   "data": "",
   "router": "",
   "params": "",
   "polish": ""
  }
 },
 "steps": [
  {
   "title": "How hash routing works",
   "body": "A normal website has a file for each page: `about.html`, `posts/bonfire.html`. Clicking a link loads a whole new page. A **single-page app** has one HTML file, and JavaScript draws the right \"page\" into it. The **hash** (the part after `#`) says which page.\n\n```svg Clicking a link changes only the hash; the page doesn't reload, hashchange fires, and the router draws the matching view\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 130\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"10\" width=\"320\" height=\"26\" rx=\"6\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"14\" y=\"28\">https://you.github.io/blog/</text><text x=\"168\" y=\"28\" fill=\"#c2410c\" font-weight=\"700\">#/post/first-flame</text>\n  <rect x=\"20\" y=\"62\" width=\"80\" height=\"34\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"60\" y=\"83\" text-anchor=\"middle\">hashchange</text>\n  <rect x=\"125\" y=\"62\" width=\"80\" height=\"34\" rx=\"8\" fill=\"#6366f1\"/><text x=\"165\" y=\"83\" text-anchor=\"middle\" fill=\"#fff\">router</text>\n  <rect x=\"230\" y=\"62\" width=\"90\" height=\"34\" rx=\"8\" fill=\"#fed7aa\" stroke=\"#ea580c\"/><text x=\"275\" y=\"83\" text-anchor=\"middle\">post view</text>\n  <path d=\"M230 38 L60 60 M100 79 H121 M205 79 H226\" stroke=\"#111\" stroke-width=\"1.5\"/>\n  <text x=\"165\" y=\"118\" text-anchor=\"middle\" fill=\"#334155\">no reload: only the view changes</text>\n</svg>\n```\n\nWhy the hash and not real paths like `/post/first-flame`? Because changing the hash **never asks the server for anything**. That's exactly what a static host like GitHub Pages needs: there's only one real file, and every \"page\" still works, including the browser's Back and Forward buttons and bookmarks.\n\nA **router** is a small table that maps address patterns to view functions:\n\n| Hash | View |\n|---|---|\n| `#/` (or nothing) | the home page |\n| `#/post/first-flame` | the post with slug `first-flame` |\n| `#/tag/bosses` | posts tagged `bosses` |\n| anything else | not found |\n\nThe real Bonfire Notes builds a real file for every page with Python, which is even better for search engines. Hash routing is how you'd do it with no build step at all, and it's how CodeForge itself and the Cybersecurity Intro Academy switch pages.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "Read the hash and redraw",
   "body": "The router reads `location.hash`, picks a view, and draws it. It runs once when the page loads and again on every `hashchange`:\n\n```js\nfunction route() {\n  const hash = location.hash || '#/';\n  view.innerHTML = hash === '#/' ? home() : notFound();\n}\nwindow.addEventListener('hashchange', route);\nroute();\n```\n\nLinks are just `<a href=\"#/post/first-flame\">`. No click handlers: the browser changes the hash, the event fires, the router draws.",
   "checks": [
    {
     "pane": "js",
     "label": "reading the hash",
     "test": "/location\\.hash/",
     "hint": "const hash = location.hash || '#/';"
    },
    {
     "pane": "js",
     "label": "redrawing when it changes",
     "test": "/addEventListener\\(\\s*['\"]hashchange['\"]/",
     "hint": "window.addEventListener('hashchange', route);"
    }
   ],
   "quiz": [
    {
     "q": "You click a link to `#/post/first-flame`. Does the browser ask the server for a new page?",
     "options": [
      "Yes, every link loads a page",
      "No; only the hash changes, so the page stays and hashchange fires",
      "Only the first time"
     ],
     "answer": 1,
     "why": "The hash never goes to the server. That's what makes this work on static hosting."
    },
    {
     "q": "Why does `route()` also run once when the page loads?",
     "options": [
      "So a bookmarked or shared link like #/post/first-flame opens on the right page",
      "hashchange doesn't work on the first load",
      "To make the page load faster"
     ],
     "answer": 0,
     "why": "A link someone shares starts with a hash already set; the router must handle it straight away."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<header class=\"site\">\n  <a class=\"brand\" href=\"#/\">🔥 Bonfire</a>\n  <nav id=\"nav\"><a href=\"#/\">Home</a> <a href=\"#/tag/bosses\">Bosses</a> <a href=\"#/about\">About</a> <a href=\"#/nope\">A broken link</a></nav>\n</header>\n<main id=\"view\" class=\"view\" tabindex=\"-1\"></main>"
   },
   "css": {
    "base": "body { margin: 0; font-family: Georgia, serif; background: #1c1917; color: #f5f5f4; }\n.site { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; padding: 12px 16px; border-bottom: 1px solid #44403c; }\n.brand { font-weight: 700; color: #fdba74; text-decoration: none; margin-right: auto; }\nnav a { color: #e7e5e4; font-family: system-ui, sans-serif; font-size: .9rem; margin-right: 8px; }\nnav a[aria-current=\"page\"] { color: #fdba74; font-weight: 700; text-decoration: none; }\n.view { max-width: 640px; margin: 0 auto; padding: 16px; outline: none; }\n.view a { color: #fb923c; }\n.card { padding: 12px; margin: 10px 0; border: 1px solid #44403c; border-radius: 10px; }\n.tag { font: .75rem system-ui, sans-serif; color: #a8a29e; }"
   },
   "js": {
    "data": "const POSTS = [\n  { slug: 'first-flame', title: 'Linking the First Flame', tags: ['bosses', 'endings'], body: 'The last fight is quiet. No music until the second phase.' },\n  { slug: 'estus-guide', title: 'How to Upgrade Your Estus', tags: ['guides'], body: 'Find the shards first, then rest and upgrade at the Firelink bonfire.' },\n  { slug: 'four-kings', title: 'Beating the Four Kings', tags: ['bosses'], body: 'Kill them fast. A new king arrives every fifty seconds.' },\n];\n\nconst view = document.getElementById('view');\nconst esc = (s) => String(s).replace(/[&<>\"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' }[c]));\nconst card = (p) => `<article class=\"card\"><h2><a href=\"#/post/${p.slug}\">${esc(p.title)}</a></h2><p class=\"tag\">${p.tags.map((t) => `<a href=\"#/tag/${t}\">#${t}</a>`).join(' ')}</p></article>`;",
    "router": "const home = () => `<h1>Notes from the bonfire</h1>${POSTS.map(card).join('')}`;\nconst notFound = () => '<h1>Lost in the dark</h1><p>No page lives here. <a href=\"#/\">Back to the bonfire</a>.</p>';\n\nfunction route() {\n  const hash = location.hash || '#/';\n  view.innerHTML = hash === '#/' ? home() : notFound();\n}\n\nwindow.addEventListener('hashchange', route);\nroute();"
   }
  },
  {
   "title": "Routes with parts, like a post's slug",
   "body": "`#/post/first-flame` and `#/post/four-kings` are the same *kind* of page with a different slug. A regex with a group catches both and pulls out the slug:\n\n```js\n[/^#\\/post\\/([\\w-]+)$/, (slug) => postPage(slug)]\n```\n\nThe router keeps a list of `[pattern, view]` pairs and uses the **first** pattern that matches, passing the groups to the view. That's the same router the Cybersecurity Intro Academy uses.\n\n```svg The router tries each pattern in order; the first match wins and its groups become the view's arguments\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 120\" font-family=\"ui-monospace, monospace\" font-size=\"11\">\n  <text x=\"5\" y=\"16\" font-family=\"sans-serif\">#/post/four-kings</text>\n  <rect x=\"5\" y=\"26\" width=\"200\" height=\"22\" rx=\"4\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"12\" y=\"41\">^#\\/$                 ✗</text>\n  <rect x=\"5\" y=\"52\" width=\"200\" height=\"22\" rx=\"4\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"12\" y=\"67\">^#\\/post\\/([\\w-]+)$   ✓</text>\n  <rect x=\"5\" y=\"78\" width=\"200\" height=\"22\" rx=\"4\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"12\" y=\"93\">^#\\/tag\\/([\\w-]+)$    (not tried)</text>\n  <text x=\"215\" y=\"67\" font-family=\"sans-serif\">postPage('four-kings')</text>\n</svg>\n```\n\nA slug that matches the pattern but isn't a real post (`#/post/nope`) still gets the not-found page: the view checks that the post exists.",
   "checks": [
    {
     "pane": "js",
     "label": "a list of patterns and views",
     "test": "/const\\s+routes\\s*=\\s*\\[/",
     "hint": "const routes = [[/^#\\/$/, home], ...];"
    },
    {
     "pane": "js",
     "label": "a pattern that catches the slug",
     "test": "/\\^#\\\\\\/post\\\\\\/\\(\\[\\\\w-\\]\\+\\)\\$/",
     "hint": "a regex for #/post/ followed by a slug in a group"
    },
    {
     "pane": "js",
     "label": "passing the groups to the view",
     "test": "/\\.\\.\\.\\w+\\.slice\\(\\s*1\\s*\\)/",
     "hint": "view(...m.slice(1))"
    }
   ],
   "quiz": [
    {
     "q": "What does `'#/tag/bosses'.match(/^#\\/tag\\/([\\w-]+)$/)[1]` give?",
     "options": [
      "\"bosses\"",
      "\"#/tag/bosses\"",
      "\"tag\""
     ],
     "answer": 0,
     "why": "Index 1 is group 1, the part inside the parentheses."
    },
    {
     "q": "Why does postPage still show not-found for `#/post/nope`?",
     "options": [
      "The pattern doesn't match it",
      "The pattern matches, but there's no post with that slug, so the view says so",
      "Slugs can't be four letters"
     ],
     "answer": 1,
     "why": "Matching the shape of an address isn't the same as the thing existing."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "router": "const home = () => `<h1>Notes from the bonfire</h1>${POSTS.map(card).join('')}`;\nconst notFound = () => '<h1>Lost in the dark</h1><p>No page lives here. <a href=\"#/\">Back to the bonfire</a>.</p>';",
    "params": "const postPage = (slug) => {\n  const p = POSTS.find((x) => x.slug === slug);\n  if (!p) return notFound();\n  return `<p><a href=\"#/\">← All notes</a></p><h1>${esc(p.title)}</h1><p>${esc(p.body)}</p><p class=\"tag\">${p.tags.map((t) => `<a href=\"#/tag/${t}\">#${t}</a>`).join(' ')}</p>`;\n};\n\nconst tagPage = (tag) => {\n  const list = POSTS.filter((p) => p.tags.includes(tag));\n  return list.length ? `<h1>#${esc(tag)}</h1>${list.map(card).join('')}` : notFound();\n};\n\nconst about = () => '<h1>About</h1><p>A small blog about fires, bosses and getting a little further each time.</p>';\n\nconst routes = [\n  [/^#\\/$/, home],\n  [/^#\\/post\\/([\\w-]+)$/, postPage],\n  [/^#\\/tag\\/([\\w-]+)$/, tagPage],\n  [/^#\\/about$/, about],\n];\n\nfunction route() {\n  const hash = location.hash || '#/';\n  for (const [pattern, page] of routes) {\n    const m = hash.match(pattern);\n    if (m) { view.innerHTML = page(...m.slice(1)); return; }\n  }\n  view.innerHTML = notFound();\n}\n\nwindow.addEventListener('hashchange', route);\nroute();"
   }
  },
  {
   "title": "Titles, the active link and focus",
   "body": "A real page change does three things people rely on, and a single-page app has to do them itself:\n\n- **The tab title changes.** Each view returns its title too, and the router sets `document.title`. History lists and bookmarks then make sense.\n- **The current link is marked.** The nav link for the current section gets `aria-current=\"page\"`, which screen readers announce and the CSS styles.\n- **Focus moves to the new content.** After a real page load, a screen reader starts at the top. Here nothing would happen, so the router moves focus to the main area (`tabindex=\"-1\"` lets it receive focus) and scrolls to the top.\n\n```svg After drawing a view, the router updates the title, marks the current link and moves focus to the content\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 90\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"25\" width=\"70\" height=\"34\" rx=\"8\" fill=\"#6366f1\"/><text x=\"40\" y=\"46\" text-anchor=\"middle\" fill=\"#fff\">draw view</text>\n  <rect x=\"90\" y=\"25\" width=\"75\" height=\"34\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"127\" y=\"46\" text-anchor=\"middle\">document.title</text>\n  <rect x=\"180\" y=\"25\" width=\"75\" height=\"34\" rx=\"8\" fill=\"#fed7aa\" stroke=\"#ea580c\"/><text x=\"217\" y=\"46\" text-anchor=\"middle\">aria-current</text>\n  <rect x=\"270\" y=\"25\" width=\"55\" height=\"34\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"297\" y=\"46\" text-anchor=\"middle\">focus()</text>\n  <path d=\"M75 42 H86 M165 42 H176 M255 42 H266\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "the tab title changes",
     "test": "/document\\.title\\s*=/",
     "hint": "document.title = `${title} · Bonfire`;"
    },
    {
     "pane": "js",
     "label": "the current link is marked",
     "test": "/aria-current/",
     "hint": "a.toggleAttribute('aria-current', ...)"
    },
    {
     "pane": "js",
     "label": "focus moves to the new content",
     "test": "/view\\.focus\\(/",
     "hint": "view.focus({ preventScroll: true });"
    }
   ],
   "quiz": [
    {
     "q": "Why move focus to the main area after a page change?",
     "options": [
      "Screen reader users would otherwise stay on the link they clicked and not hear the new page",
      "It makes the page load faster",
      "Browsers require it for hash links"
     ],
     "answer": 0,
     "why": "A real page load resets focus; a single-page app has to do it on purpose."
    },
    {
     "q": "What does `tabindex=\"-1\"` on the main area allow?",
     "options": [
      "Tabbing to it with the keyboard",
      "Focusing it from code, without adding it to the Tab order",
      "Hiding it from screen readers"
     ],
     "answer": 1,
     "why": "-1 means \"focusable by script only\"."
    }
   ],
   "session": 0,
   "minutes": 12,
   "js": {
    "params": "const postPage = (slug) => {\n  const p = POSTS.find((x) => x.slug === slug);\n  if (!p) return { title: 'Not found', html: notFound() };\n  return { title: p.title, html: `<p><a href=\"#/\">← All notes</a></p><h1>${esc(p.title)}</h1><p>${esc(p.body)}</p><p class=\"tag\">${p.tags.map((t) => `<a href=\"#/tag/${t}\">#${t}</a>`).join(' ')}</p>` };\n};\n\nconst tagPage = (tag) => {\n  const list = POSTS.filter((p) => p.tags.includes(tag));\n  return list.length ? { title: `#${tag}`, html: `<h1>#${esc(tag)}</h1>${list.map(card).join('')}` } : { title: 'Not found', html: notFound() };\n};\n\nconst routes = [\n  [/^#\\/$/, () => ({ title: 'Home', html: home() })],\n  [/^#\\/post\\/([\\w-]+)$/, postPage],\n  [/^#\\/tag\\/([\\w-]+)$/, tagPage],\n  [/^#\\/about$/, () => ({ title: 'About', html: '<h1>About</h1><p>A small blog about fires, bosses and getting a little further each time.</p>' })],\n];\n\nfunction route() {\n  const hash = location.hash || '#/';\n  let page = { title: 'Not found', html: notFound() };\n  for (const [pattern, make] of routes) {\n    const m = hash.match(pattern);\n    if (m) { page = make(...m.slice(1)); break; }\n  }\n  view.innerHTML = page.html;\n  document.title = `${page.title} · Bonfire`;\n  markNav(hash);\n  view.focus({ preventScroll: true });\n  window.scrollTo(0, 0);\n}\n\nwindow.addEventListener('hashchange', route);\nroute();",
    "polish": "function markNav(hash) {\n  for (const a of document.querySelectorAll('#nav a')) {\n    const href = a.getAttribute('href');\n    const current = href === '#/' ? hash === '#/' : hash.startsWith(href);\n    if (current) a.setAttribute('aria-current', 'page');\n    else a.removeAttribute('aria-current');\n  }\n}"
   }
  }
 ],
 "finish": "One page can act like a whole site now. You learned:\n\n- **Hash routing**: the hash picks the view, and it never asks the server\n- `location.hash`, the **hashchange** event, and routing on load too\n- A **routes table** of regex patterns, the first match wins, groups as arguments\n- **Not-found** pages for bad addresses and missing items\n- **Titles**, `aria-current` and **focus** on every change\n\n### Challenges\n\n1. Add `#/search/<words>` that lists posts whose title contains the words.\n2. Add Newer and Older links at the bottom of each post.\n3. Switch to real paths with `history.pushState` and the `popstate` event, and see why GitHub Pages then needs a 404.html trick.\n\n### Next\n\n**Canvas particles**: floating embers behind the posts."
};
