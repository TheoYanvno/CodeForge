---
id: safesave
title: Saving data safely
blocks-html: page
blocks-css: base
blocks-js: state, save, load, versions
goals: Save after changes without saving on every keystroke, using a debounce; Keep the app working when storage is blocked or full; Treat saved data as untrusted: check every field and fix or drop what's broken; Put a version number in saved data and upgrade old saves; Let people keep a backup file and load it back safely
prereqs: The App state lesson (one state object) and the Saving a best score lesson (localStorage, JSON and try/catch)
---

## Session: Data that survives

## Step: Everything that can go wrong with saved data
time: 10
kind: read

Saving notes in localStorage looks easy: `setItem('notes', JSON.stringify(notes))`. In a real app used by real people, here's what goes wrong:

- **Storage is blocked**: a private window, a strict browser setting, a sandboxed page. `setItem` throws.
- **Storage is full**: browsers give each site about 5 MB. A huge note can hit it.
- **The data is broken**: someone edited it in the developer tools, an old bug saved `null` for a title, or a save was cut off halfway.
- **The data is old**: last month's version of your app saved notes without a `color`; this month's code expects one.
- **Saving too often**: saving on every keystroke is wasteful, and in a desktop app writing to disk that often is slow.

```svg A save goes out through a debounce and try/catch; a load comes back through checking, fixing and upgrading before it reaches the app
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 130" font-family="sans-serif" font-size="11">
  <rect x="5" y="45" width="70" height="40" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="40" y="69" text-anchor="middle">state</text>
  <rect x="255" y="45" width="70" height="40" rx="8" fill="#e0f2fe" stroke="#0284c7"/><text x="290" y="69" text-anchor="middle">storage</text>
  <rect x="95" y="10" width="140" height="30" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="165" y="29" text-anchor="middle">debounce + try/catch</text>
  <rect x="95" y="90" width="140" height="30" rx="8" fill="#fee2e2" stroke="#ef4444"/><text x="165" y="109" text-anchor="middle">check · fix · upgrade</text>
  <path d="M75 55 L93 28 M235 28 L253 55 M253 78 L235 103 M93 103 L75 78" stroke="#111" stroke-width="2"/>
  <text x="165" y="62" text-anchor="middle" fill="#334155">save →</text><text x="165" y="78" text-anchor="middle" fill="#334155">← load</text>
</svg>
```

The rule that fixes most of it: **be careful when saving, and suspicious when loading.** A save can fail without the app crashing. A load never puts data into the app until it has been checked.

## Step: Save a moment after the last change
time: 15

A **debounce** waits until changes stop for a moment, then saves once. Each change cancels the waiting save and starts a new wait:

```js
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 400);
}
```

Type a sentence in a note: you'll see "Saving…" and then one "Saved", not one save per letter.

`save()` itself sits in `try/catch`. If storage is blocked or full, the app keeps working and tells the person, once, that their notes won't be kept, instead of crashing or failing silently.

check: js | cancelling the waiting save | /clearTimeout\(\s*saveTimer\s*\)/ | clearTimeout(saveTimer);
check: js | saving once after a pause | /saveTimer\s*=\s*setTimeout\(\s*save\s*,\s*\d+\s*\)/ | saveTimer = setTimeout(save, 400);
check: js | a save that can fail without crashing | /try\s*\{\s*localStorage\.setItem/ | try { localStorage.setItem(KEY, ...) } catch { ... }

quiz: You type "hello" quickly. How many times does the debounced save run?
- [ ] 5, once per letter
- [x] Once, 400 ms after the last letter
- [ ] None until you close the page
why: Each keystroke cancels the waiting save, so only the last one fires.

quiz: Storage is full and setItem throws. What should the app do?
- [x] Keep working and tell the person their changes aren't being saved
- [ ] Stop and show a blank page
- [ ] Try again every millisecond
why: Losing the ability to save is bad; losing the whole app is worse. Say so clearly.

```html page
<main class="card">
  <header class="bar">
    <h1>Notes</h1>
    <button id="add">+ Note</button>
    <span id="saved" class="saved" role="status"></span>
  </header>
  <section id="board" class="board"></section>
  <section class="tools">
    <button id="corrupt">Break the saved data</button>
    <button id="old">Load an old-version save</button>
    <button id="backup">Download a backup</button>
    <label class="file">Restore a backup <input id="restore" type="file" accept="application/json,.json"></label>
  </section>
  <p id="report" class="report"></p>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: start center;
  padding: 16px 0;
  font-family: system-ui, sans-serif;
  background: #f1f5f9;
  color: #1f2937;
}

.card { width: min(560px, 100% - 24px); padding: 16px; background: #fff; border-radius: 16px; }
.bar { display: flex; gap: 8px; align-items: center; }
h1 { margin: 0 auto 0 0; font-size: 1.3rem; }
button { font: inherit; padding: 6px 10px; cursor: pointer; }
.saved { font-size: .8rem; color: #15803d; min-width: 5em; }
.board { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin: 12px 0; }
.note { padding: 8px; border-radius: 10px; min-height: 100px; }
.note.yellow { background: #fef08a; } .note.pink { background: #fbcfe8; } .note.blue { background: #bfdbfe; }
.note textarea { width: 100%; min-height: 80px; border: 0; background: transparent; font: inherit; resize: vertical; box-sizing: border-box; }
.tools { display: flex; flex-wrap: wrap; gap: 6px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
.file { font-size: .85rem; display: flex; flex-direction: column; }
.report { font-size: .85rem; color: #475569; white-space: pre-line; }
```

```js state
const KEY = 'safe-notes';
let state = { version: 2, notes: [{ id: 1, text: 'Type here. Reload the page: your notes are still here.', color: 'yellow' }], nextId: 2 };
const board = document.getElementById('board');
const savedEl = document.getElementById('saved');
const report = document.getElementById('report');

function render() {
  board.replaceChildren(...state.notes.map((n) => {
    const el = document.createElement('article');
    el.className = `note ${n.color}`;
    const t = document.createElement('textarea');
    t.value = n.text;
    t.setAttribute('aria-label', 'Note text');
    t.addEventListener('input', () => {
      state = { ...state, notes: state.notes.map((x) => (x.id === n.id ? { ...x, text: t.value } : x)) };
      scheduleSave();
    });
    el.append(t);
    return el;
  }));
}

document.getElementById('add').addEventListener('click', () => {
  state = { ...state, notes: [...state.notes, { id: state.nextId, text: '', color: 'yellow' }], nextId: state.nextId + 1 };
  render();
  scheduleSave();
});
```

```js save
let saveTimer = null;
let warned = false;

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    savedEl.textContent = 'Saved';
  } catch {
    savedEl.textContent = 'Not saved';
    if (!warned) report.textContent = 'This browser isn\'t letting the page save, so your notes will be lost when it closes.';
    warned = true;
  }
}

function scheduleSave() {
  savedEl.textContent = 'Saving…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 400);
}

render();
```

## Step: Never trust saved data
time: 15

Loading reads the text, parses it, and then **checks every note** before anything reaches the app:

- The whole thing must be an object with a `notes` **array**; otherwise start fresh.
- Each note must have a **number id** and a **string text**; a note without them is dropped.
- A missing or unknown **color** isn't worth losing a note over, so it's fixed to yellow.
- Text longer than 5,000 characters is cut, so one giant note can't break the page.
- `nextId` is worked out again from the notes, so a bad saved value can't cause duplicate ids.

The page reports what it fixed. Press **Break the saved data**, which saves a mix of good and broken notes, then reload: the good ones load, the broken one is gone, and the report says why.

```svg cleanNote: keep a note with a number id and string text, fix a bad color, cut text that's too long, and drop anything else
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" font-family="sans-serif" font-size="11">
  <rect x="5" y="40" width="80" height="30" rx="6" fill="#f1f5f9" stroke="#94a3b8"/><text x="45" y="59" text-anchor="middle">saved note</text>
  <path d="M100 55 L130 30 L160 55 L130 80 Z" fill="#fef9c3" stroke="#ca8a04"/><text x="130" y="52" text-anchor="middle" font-size="9">id + text</text><text x="130" y="62" text-anchor="middle" font-size="9">OK?</text>
  <rect x="185" y="10" width="140" height="28" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="255" y="28" text-anchor="middle">keep (fix color, cut length)</text>
  <rect x="185" y="72" width="140" height="28" rx="6" fill="#fee2e2" stroke="#ef4444"/><text x="255" y="90" text-anchor="middle">drop, and report it</text>
  <path d="M85 55 H98 M155 45 L183 26 M155 65 L183 86" stroke="#111" stroke-width="2"/>
</svg>
```

check: js | the saved notes must be an array | /Array\.isArray\(\s*\w+\.notes\s*\)/ | if (!Array.isArray(data.notes)) return fresh;
check: js | checking each field's type | /typeof\s+\w+\.text\s*!==\s*['"]string['"]/ | if (typeof n.text !== 'string') ... drop it
check: js | nextId worked out from the notes | /Math\.max\(\s*0\s*,\s*\.\.\.\w+\.map\(/ | Math.max(0, ...notes.map((n) => n.id)) + 1

quiz: A saved note has `text: null`. What happens on load?
- [ ] The app crashes when it draws it
- [x] It's dropped and reported, because text must be a string
- [ ] It shows the word "null"
why: Anything that would break the app is caught at the door.

quiz: Why work out `nextId` again instead of trusting the saved one?
- [ ] It's faster
- [x] A bad saved nextId could give a new note the same id as an old one
- [ ] nextId is never saved
why: Values that can be derived from the data should be, so they can't disagree with it.

```js load
const COLORS = ['yellow', 'pink', 'blue'];
const fresh = () => ({ version: 2, notes: [], nextId: 1 });

function cleanNote(n, problems) {
  if (!n || typeof n.id !== 'number' || typeof n.text !== 'string') {
    problems.push(`dropped a broken note (${JSON.stringify(n)?.slice(0, 40)})`);
    return null;
  }
  const color = COLORS.includes(n.color) ? n.color : 'yellow';
  if (color !== n.color) problems.push(`note ${n.id}: unknown color, set to yellow`);
  const text = n.text.length > 5000 ? n.text.slice(0, 5000) : n.text;
  if (text !== n.text) problems.push(`note ${n.id}: text was too long and was cut`);
  return { id: n.id, text, color };
}

function clean(data, problems) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.notes)) {
    if (data !== null) problems.push('the saved data had the wrong shape, so the board starts fresh');
    return fresh();
  }
  const seen = new Set();
  const notes = data.notes.map((n) => cleanNote(n, problems)).filter((n) => n && !seen.has(n.id) && seen.add(n.id));
  return { version: 2, notes, nextId: Math.max(0, ...notes.map((n) => n.id)) + 1 };
}

function load() {
  const problems = [];
  let data = null;
  try { data = JSON.parse(localStorage.getItem(KEY)); } catch { problems.push('the saved text wasn\'t valid JSON'); }
  if (data === null && !problems.length) return;          // nothing saved yet: keep the welcome note
  state = clean(data, problems);
  report.textContent = problems.length ? `Loaded, with fixes:\n• ${problems.join('\n• ')}` : `Loaded ${state.notes.length} notes.`;
}

document.getElementById('corrupt').addEventListener('click', () => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 2, nextId: 1, notes: [
      { id: 1, text: 'A good note', color: 'pink' },
      { id: 2, text: null, color: 'blue' },
      { id: 3, text: 'A note with a strange color', color: 'plaid' },
    ] }));
  } catch { /* storage blocked */ }
  load();
  render();
});

load();
render();
```

## Step: Versions, upgrades and backups
time: 15

Apps change. Version 1 of these notes saved a plain list of strings, `["Buy milk", "Call mom"]`. Version 2 saves objects with ids and colors. Without care, everyone's old notes would be "broken data" and dropped.

So saved data carries a **version**, and load **upgrades** old versions step by step before cleaning:

```js
function upgrade(data) {
  if (Array.isArray(data)) data = { version: 1, notes: data };       // the oldest saves had no wrapper
  if (data.version === 1) data = { version: 2, notes: data.notes.map((text, i) => ({ id: i + 1, text: String(text), color: 'yellow' })) };
  return data;
}
```

Each upgrade only knows how to go one version forward, so version 5 can still load a version 1 save by running every step in order.

```svg Old saves are upgraded one version at a time, then cleaned, before the app sees them
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 80" font-family="sans-serif" font-size="11">
  <rect x="5" y="22" width="70" height="34" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="40" y="43" text-anchor="middle">v1 save</text>
  <rect x="95" y="22" width="70" height="34" rx="8" fill="#e0f2fe" stroke="#0284c7"/><text x="130" y="43" text-anchor="middle">v1 → v2</text>
  <rect x="185" y="22" width="60" height="34" rx="8" fill="#fee2e2" stroke="#ef4444"/><text x="215" y="43" text-anchor="middle">clean</text>
  <rect x="265" y="22" width="60" height="34" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="295" y="43" text-anchor="middle">state</text>
  <path d="M75 39 H91 M165 39 H181 M245 39 H261" stroke="#111" stroke-width="2"/>
</svg>
```

Finally, a **backup**: Download makes a `.json` file of the notes (the Blob trick from the .ics lesson), and Restore reads a chosen file with `await file.text()` and sends it through the **same** upgrade and clean steps. A restored file is just as untrusted as anything in storage.

check: js | a version number in the saved data | /version\s*===\s*1/ | if (data.version === 1) ...
check: js | upgrading before cleaning | /clean\(\s*upgrade\(/ | state = clean(upgrade(data), problems);
check: js | reading a chosen file | /await\s+\w+\.text\(\)/ | const text = await file.text();

quiz: Version 3 of the app loads a version 1 save. What runs?
- [x] The v1 → v2 upgrade, then v2 → v3, then the clean step
- [ ] Nothing; old saves are deleted
- [ ] Only the clean step
why: Upgrades are chained, one version at a time, so any old save can come forward.

quiz: Why does a restored backup go through the same checks as storage?
- [ ] Backups are always broken
- [x] A file can come from anywhere (an old version, another app, a hand edit), so it's just as untrusted
- [ ] It's faster to reuse the code
why: Every way data enters the app goes through the same door.

```js load
const COLORS = ['yellow', 'pink', 'blue'];
const fresh = () => ({ version: 2, notes: [], nextId: 1 });

function cleanNote(n, problems) {
  if (!n || typeof n.id !== 'number' || typeof n.text !== 'string') {
    problems.push(`dropped a broken note (${JSON.stringify(n)?.slice(0, 40)})`);
    return null;
  }
  const color = COLORS.includes(n.color) ? n.color : 'yellow';
  if (color !== n.color) problems.push(`note ${n.id}: unknown color, set to yellow`);
  const text = n.text.length > 5000 ? n.text.slice(0, 5000) : n.text;
  if (text !== n.text) problems.push(`note ${n.id}: text was too long and was cut`);
  return { id: n.id, text, color };
}

function clean(data, problems) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.notes)) {
    if (data !== null) problems.push('the saved data had the wrong shape, so the board starts fresh');
    return fresh();
  }
  const seen = new Set();
  const notes = data.notes.map((n) => cleanNote(n, problems)).filter((n) => n && !seen.has(n.id) && seen.add(n.id));
  return { version: 2, notes, nextId: Math.max(0, ...notes.map((n) => n.id)) + 1 };
}

document.getElementById('corrupt').addEventListener('click', () => {
  loadFrom(JSON.stringify({ version: 2, nextId: 1, notes: [
    { id: 1, text: 'A good note', color: 'pink' },
    { id: 2, text: null, color: 'blue' },
    { id: 3, text: 'A note with a strange color', color: 'plaid' },
  ] }), 'broken save');
});
```

```js versions
function upgrade(data) {
  if (Array.isArray(data)) data = { version: 1, notes: data };
  if (data && data.version === 1 && Array.isArray(data.notes)) {
    data = { version: 2, notes: data.notes.map((text, i) => ({ id: i + 1, text: String(text), color: 'yellow' })) };
  }
  return data;
}

function loadFrom(text, where) {
  const problems = [];
  let data = null;
  try { data = JSON.parse(text); } catch { problems.push(`the ${where} wasn't valid JSON`); }
  if (data === null && !problems.length) return false;
  state = clean(upgrade(data), problems);
  report.textContent = `${where}: ${state.notes.length} notes${problems.length ? `, with fixes:\n• ${problems.join('\n• ')}` : '.'}`;
  render();
  save();
  return true;
}

document.getElementById('old').addEventListener('click', () => {
  loadFrom(JSON.stringify(['Buy milk', 'Call mom', 'Book flights']), 'old version-1 save');
});

document.getElementById('backup').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'notes-backup.json' });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.getElementById('restore').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 1_000_000) { report.textContent = 'That file is too big to be a notes backup.'; return; }
  loadFrom(await file.text(), 'backup file');
});

let stored = null;
try { stored = localStorage.getItem(KEY); } catch { /* blocked */ }
if (stored) loadFrom(stored, 'saved notes');
else render();
```

## Finish

Your app's data can survive real life now. You learned:

- **Debounced** saves with `clearTimeout` and `setTimeout`
- Saves in **try/catch**, with a clear message when storage fails
- **Never trust saved data**: check every field, fix what's minor, drop what's broken, rebuild derived values
- **Versions** and step-by-step **upgrades** for old saves
- **Backups** out with a Blob and back in through the same checks

You've now learned every part of the **Sticky Notes** app: Electron, app state, pointer dragging and safe saving. Build it next.

### Challenges

1. Keep the last 3 saves (`safe-notes-1`, `-2`, `-3`) and offer "Restore the previous save" if the newest one is broken.
2. Save when the page is hidden (`visibilitychange`), so a pending debounced save isn't lost when someone closes the tab.
3. Write a test: feed `clean()` ten kinds of broken data and check none of them crash it.

### Next

The **Sticky Notes** project.
