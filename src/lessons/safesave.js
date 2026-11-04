// Built from guides/safesave.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "safesave",
 "title": "Saving data safely",
 "goals": [
  "Save after changes without saving on every keystroke, using a debounce",
  "Keep the app working when storage is blocked or full",
  "Treat saved data as untrusted: check every field and fix or drop what's broken",
  "Put a version number in saved data and upgrade old saves",
  "Let people keep a backup file and load it back safely"
 ],
 "prereqs": [
  "The App state lesson (one state object) and the Saving a best score lesson (localStorage, JSON and try/catch)"
 ],
 "sessions": [
  {
   "title": "Data that survives",
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
   "state": "",
   "save": "",
   "load": "",
   "versions": ""
  }
 },
 "steps": [
  {
   "title": "Everything that can go wrong with saved data",
   "body": "Saving notes in localStorage looks easy: `setItem('notes', JSON.stringify(notes))`. In a real app used by real people, here's what goes wrong:\n\n- **Storage is blocked**: a private window, a strict browser setting, a sandboxed page. `setItem` throws.\n- **Storage is full**: browsers give each site about 5 MB. A huge note can hit it.\n- **The data is broken**: someone edited it in the developer tools, an old bug saved `null` for a title, or a save was cut off halfway.\n- **The data is old**: last month's version of your app saved notes without a `color`; this month's code expects one.\n- **Saving too often**: saving on every keystroke is wasteful, and in a desktop app writing to disk that often is slow.\n\n```svg A save goes out through a debounce and try/catch; a load comes back through checking, fixing and upgrading before it reaches the app\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 130\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"45\" width=\"70\" height=\"40\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"40\" y=\"69\" text-anchor=\"middle\">state</text>\n  <rect x=\"255\" y=\"45\" width=\"70\" height=\"40\" rx=\"8\" fill=\"#e0f2fe\" stroke=\"#0284c7\"/><text x=\"290\" y=\"69\" text-anchor=\"middle\">storage</text>\n  <rect x=\"95\" y=\"10\" width=\"140\" height=\"30\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"165\" y=\"29\" text-anchor=\"middle\">debounce + try/catch</text>\n  <rect x=\"95\" y=\"90\" width=\"140\" height=\"30\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#ef4444\"/><text x=\"165\" y=\"109\" text-anchor=\"middle\">check · fix · upgrade</text>\n  <path d=\"M75 55 L93 28 M235 28 L253 55 M253 78 L235 103 M93 103 L75 78\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"165\" y=\"62\" text-anchor=\"middle\" fill=\"#334155\">save →</text><text x=\"165\" y=\"78\" text-anchor=\"middle\" fill=\"#334155\">← load</text>\n</svg>\n```\n\nThe rule that fixes most of it: **be careful when saving, and suspicious when loading.** A save can fail without the app crashing. A load never puts data into the app until it has been checked.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "Save a moment after the last change",
   "body": "A **debounce** waits until changes stop for a moment, then saves once. Each change cancels the waiting save and starts a new wait:\n\n```js\nfunction scheduleSave() {\n  clearTimeout(saveTimer);\n  saveTimer = setTimeout(save, 400);\n}\n```\n\nType a sentence in a note: you'll see \"Saving…\" and then one \"Saved\", not one save per letter.\n\n`save()` itself sits in `try/catch`. If storage is blocked or full, the app keeps working and tells the person, once, that their notes won't be kept, instead of crashing or failing silently.",
   "checks": [
    {
     "pane": "js",
     "label": "cancelling the waiting save",
     "test": "/clearTimeout\\(\\s*saveTimer\\s*\\)/",
     "hint": "clearTimeout(saveTimer);"
    },
    {
     "pane": "js",
     "label": "saving once after a pause",
     "test": "/saveTimer\\s*=\\s*setTimeout\\(\\s*save\\s*,\\s*\\d+\\s*\\)/",
     "hint": "saveTimer = setTimeout(save, 400);"
    },
    {
     "pane": "js",
     "label": "a save that can fail without crashing",
     "test": "/try\\s*\\{\\s*localStorage\\.setItem/",
     "hint": "try { localStorage.setItem(KEY, ...) } catch { ... }"
    }
   ],
   "quiz": [
    {
     "q": "You type \"hello\" quickly. How many times does the debounced save run?",
     "options": [
      "5, once per letter",
      "Once, 400 ms after the last letter",
      "None until you close the page"
     ],
     "answer": 1,
     "why": "Each keystroke cancels the waiting save, so only the last one fires."
    },
    {
     "q": "Storage is full and setItem throws. What should the app do?",
     "options": [
      "Keep working and tell the person their changes aren't being saved",
      "Stop and show a blank page",
      "Try again every millisecond"
     ],
     "answer": 0,
     "why": "Losing the ability to save is bad; losing the whole app is worse. Say so clearly."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"card\">\n  <header class=\"bar\">\n    <h1>Notes</h1>\n    <button id=\"add\">+ Note</button>\n    <span id=\"saved\" class=\"saved\" role=\"status\"></span>\n  </header>\n  <section id=\"board\" class=\"board\"></section>\n  <section class=\"tools\">\n    <button id=\"corrupt\">Break the saved data</button>\n    <button id=\"old\">Load an old-version save</button>\n    <button id=\"backup\">Download a backup</button>\n    <label class=\"file\">Restore a backup <input id=\"restore\" type=\"file\" accept=\"application/json,.json\"></label>\n  </section>\n  <p id=\"report\" class=\"report\"></p>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: start center;\n  padding: 16px 0;\n  font-family: system-ui, sans-serif;\n  background: #f1f5f9;\n  color: #1f2937;\n}\n\n.card { width: min(560px, 100% - 24px); padding: 16px; background: #fff; border-radius: 16px; }\n.bar { display: flex; gap: 8px; align-items: center; }\nh1 { margin: 0 auto 0 0; font-size: 1.3rem; }\nbutton { font: inherit; padding: 6px 10px; cursor: pointer; }\n.saved { font-size: .8rem; color: #15803d; min-width: 5em; }\n.board { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin: 12px 0; }\n.note { padding: 8px; border-radius: 10px; min-height: 100px; }\n.note.yellow { background: #fef08a; } .note.pink { background: #fbcfe8; } .note.blue { background: #bfdbfe; }\n.note textarea { width: 100%; min-height: 80px; border: 0; background: transparent; font: inherit; resize: vertical; box-sizing: border-box; }\n.tools { display: flex; flex-wrap: wrap; gap: 6px; border-top: 1px solid #e2e8f0; padding-top: 10px; }\n.file { font-size: .85rem; display: flex; flex-direction: column; }\n.report { font-size: .85rem; color: #475569; white-space: pre-line; }"
   },
   "js": {
    "state": "const KEY = 'safe-notes';\nlet state = { version: 2, notes: [{ id: 1, text: 'Type here. Reload the page: your notes are still here.', color: 'yellow' }], nextId: 2 };\nconst board = document.getElementById('board');\nconst savedEl = document.getElementById('saved');\nconst report = document.getElementById('report');\n\nfunction render() {\n  board.replaceChildren(...state.notes.map((n) => {\n    const el = document.createElement('article');\n    el.className = `note ${n.color}`;\n    const t = document.createElement('textarea');\n    t.value = n.text;\n    t.setAttribute('aria-label', 'Note text');\n    t.addEventListener('input', () => {\n      state = { ...state, notes: state.notes.map((x) => (x.id === n.id ? { ...x, text: t.value } : x)) };\n      scheduleSave();\n    });\n    el.append(t);\n    return el;\n  }));\n}\n\ndocument.getElementById('add').addEventListener('click', () => {\n  state = { ...state, notes: [...state.notes, { id: state.nextId, text: '', color: 'yellow' }], nextId: state.nextId + 1 };\n  render();\n  scheduleSave();\n});",
    "save": "let saveTimer = null;\nlet warned = false;\n\nfunction save() {\n  try {\n    localStorage.setItem(KEY, JSON.stringify(state));\n    savedEl.textContent = 'Saved';\n  } catch {\n    savedEl.textContent = 'Not saved';\n    if (!warned) report.textContent = 'This browser isn\\'t letting the page save, so your notes will be lost when it closes.';\n    warned = true;\n  }\n}\n\nfunction scheduleSave() {\n  savedEl.textContent = 'Saving…';\n  clearTimeout(saveTimer);\n  saveTimer = setTimeout(save, 400);\n}\n\nrender();"
   }
  },
  {
   "title": "Never trust saved data",
   "body": "Loading reads the text, parses it, and then **checks every note** before anything reaches the app:\n\n- The whole thing must be an object with a `notes` **array**; otherwise start fresh.\n- Each note must have a **number id** and a **string text**; a note without them is dropped.\n- A missing or unknown **color** isn't worth losing a note over, so it's fixed to yellow.\n- Text longer than 5,000 characters is cut, so one giant note can't break the page.\n- `nextId` is worked out again from the notes, so a bad saved value can't cause duplicate ids.\n\nThe page reports what it fixed. Press **Break the saved data**, which saves a mix of good and broken notes, then reload: the good ones load, the broken one is gone, and the report says why.\n\n```svg cleanNote: keep a note with a number id and string text, fix a bad color, cut text that's too long, and drop anything else\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"40\" width=\"80\" height=\"30\" rx=\"6\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"45\" y=\"59\" text-anchor=\"middle\">saved note</text>\n  <path d=\"M100 55 L130 30 L160 55 L130 80 Z\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"130\" y=\"52\" text-anchor=\"middle\" font-size=\"9\">id + text</text><text x=\"130\" y=\"62\" text-anchor=\"middle\" font-size=\"9\">OK?</text>\n  <rect x=\"185\" y=\"10\" width=\"140\" height=\"28\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"255\" y=\"28\" text-anchor=\"middle\">keep (fix color, cut length)</text>\n  <rect x=\"185\" y=\"72\" width=\"140\" height=\"28\" rx=\"6\" fill=\"#fee2e2\" stroke=\"#ef4444\"/><text x=\"255\" y=\"90\" text-anchor=\"middle\">drop, and report it</text>\n  <path d=\"M85 55 H98 M155 45 L183 26 M155 65 L183 86\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "the saved notes must be an array",
     "test": "/Array\\.isArray\\(\\s*\\w+\\.notes\\s*\\)/",
     "hint": "if (!Array.isArray(data.notes)) return fresh;"
    },
    {
     "pane": "js",
     "label": "checking each field's type",
     "test": "/typeof\\s+\\w+\\.text\\s*!==\\s*['\"]string['\"]/",
     "hint": "if (typeof n.text !== 'string') ... drop it"
    },
    {
     "pane": "js",
     "label": "nextId worked out from the notes",
     "test": "/Math\\.max\\(\\s*0\\s*,\\s*\\.\\.\\.\\w+\\.map\\(/",
     "hint": "Math.max(0, ...notes.map((n) => n.id)) + 1"
    }
   ],
   "quiz": [
    {
     "q": "A saved note has `text: null`. What happens on load?",
     "options": [
      "The app crashes when it draws it",
      "It's dropped and reported, because text must be a string",
      "It shows the word \"null\""
     ],
     "answer": 1,
     "why": "Anything that would break the app is caught at the door."
    },
    {
     "q": "Why work out `nextId` again instead of trusting the saved one?",
     "options": [
      "It's faster",
      "A bad saved nextId could give a new note the same id as an old one",
      "nextId is never saved"
     ],
     "answer": 1,
     "why": "Values that can be derived from the data should be, so they can't disagree with it."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "load": "const COLORS = ['yellow', 'pink', 'blue'];\nconst fresh = () => ({ version: 2, notes: [], nextId: 1 });\n\nfunction cleanNote(n, problems) {\n  if (!n || typeof n.id !== 'number' || typeof n.text !== 'string') {\n    problems.push(`dropped a broken note (${JSON.stringify(n)?.slice(0, 40)})`);\n    return null;\n  }\n  const color = COLORS.includes(n.color) ? n.color : 'yellow';\n  if (color !== n.color) problems.push(`note ${n.id}: unknown color, set to yellow`);\n  const text = n.text.length > 5000 ? n.text.slice(0, 5000) : n.text;\n  if (text !== n.text) problems.push(`note ${n.id}: text was too long and was cut`);\n  return { id: n.id, text, color };\n}\n\nfunction clean(data, problems) {\n  if (!data || typeof data !== 'object' || !Array.isArray(data.notes)) {\n    if (data !== null) problems.push('the saved data had the wrong shape, so the board starts fresh');\n    return fresh();\n  }\n  const seen = new Set();\n  const notes = data.notes.map((n) => cleanNote(n, problems)).filter((n) => n && !seen.has(n.id) && seen.add(n.id));\n  return { version: 2, notes, nextId: Math.max(0, ...notes.map((n) => n.id)) + 1 };\n}\n\nfunction load() {\n  const problems = [];\n  let data = null;\n  try { data = JSON.parse(localStorage.getItem(KEY)); } catch { problems.push('the saved text wasn\\'t valid JSON'); }\n  if (data === null && !problems.length) return;          // nothing saved yet: keep the welcome note\n  state = clean(data, problems);\n  report.textContent = problems.length ? `Loaded, with fixes:\\n• ${problems.join('\\n• ')}` : `Loaded ${state.notes.length} notes.`;\n}\n\ndocument.getElementById('corrupt').addEventListener('click', () => {\n  try {\n    localStorage.setItem(KEY, JSON.stringify({ version: 2, nextId: 1, notes: [\n      { id: 1, text: 'A good note', color: 'pink' },\n      { id: 2, text: null, color: 'blue' },\n      { id: 3, text: 'A note with a strange color', color: 'plaid' },\n    ] }));\n  } catch { /* storage blocked */ }\n  load();\n  render();\n});\n\nload();\nrender();"
   }
  },
  {
   "title": "Versions, upgrades and backups",
   "body": "Apps change. Version 1 of these notes saved a plain list of strings, `[\"Buy milk\", \"Call mom\"]`. Version 2 saves objects with ids and colors. Without care, everyone's old notes would be \"broken data\" and dropped.\n\nSo saved data carries a **version**, and load **upgrades** old versions step by step before cleaning:\n\n```js\nfunction upgrade(data) {\n  if (Array.isArray(data)) data = { version: 1, notes: data };       // the oldest saves had no wrapper\n  if (data.version === 1) data = { version: 2, notes: data.notes.map((text, i) => ({ id: i + 1, text: String(text), color: 'yellow' })) };\n  return data;\n}\n```\n\nEach upgrade only knows how to go one version forward, so version 5 can still load a version 1 save by running every step in order.\n\n```svg Old saves are upgraded one version at a time, then cleaned, before the app sees them\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 80\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect x=\"5\" y=\"22\" width=\"70\" height=\"34\" rx=\"8\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/><text x=\"40\" y=\"43\" text-anchor=\"middle\">v1 save</text>\n  <rect x=\"95\" y=\"22\" width=\"70\" height=\"34\" rx=\"8\" fill=\"#e0f2fe\" stroke=\"#0284c7\"/><text x=\"130\" y=\"43\" text-anchor=\"middle\">v1 → v2</text>\n  <rect x=\"185\" y=\"22\" width=\"60\" height=\"34\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#ef4444\"/><text x=\"215\" y=\"43\" text-anchor=\"middle\">clean</text>\n  <rect x=\"265\" y=\"22\" width=\"60\" height=\"34\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"295\" y=\"43\" text-anchor=\"middle\">state</text>\n  <path d=\"M75 39 H91 M165 39 H181 M245 39 H261\" stroke=\"#111\" stroke-width=\"2\"/>\n</svg>\n```\n\nFinally, a **backup**: Download makes a `.json` file of the notes (the Blob trick from the .ics lesson), and Restore reads a chosen file with `await file.text()` and sends it through the **same** upgrade and clean steps. A restored file is just as untrusted as anything in storage.",
   "checks": [
    {
     "pane": "js",
     "label": "a version number in the saved data",
     "test": "/version\\s*===\\s*1/",
     "hint": "if (data.version === 1) ..."
    },
    {
     "pane": "js",
     "label": "upgrading before cleaning",
     "test": "/clean\\(\\s*upgrade\\(/",
     "hint": "state = clean(upgrade(data), problems);"
    },
    {
     "pane": "js",
     "label": "reading a chosen file",
     "test": "/await\\s+\\w+\\.text\\(\\)/",
     "hint": "const text = await file.text();"
    }
   ],
   "quiz": [
    {
     "q": "Version 3 of the app loads a version 1 save. What runs?",
     "options": [
      "The v1 → v2 upgrade, then v2 → v3, then the clean step",
      "Nothing; old saves are deleted",
      "Only the clean step"
     ],
     "answer": 0,
     "why": "Upgrades are chained, one version at a time, so any old save can come forward."
    },
    {
     "q": "Why does a restored backup go through the same checks as storage?",
     "options": [
      "Backups are always broken",
      "A file can come from anywhere (an old version, another app, a hand edit), so it's just as untrusted",
      "It's faster to reuse the code"
     ],
     "answer": 1,
     "why": "Every way data enters the app goes through the same door."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "load": "const COLORS = ['yellow', 'pink', 'blue'];\nconst fresh = () => ({ version: 2, notes: [], nextId: 1 });\n\nfunction cleanNote(n, problems) {\n  if (!n || typeof n.id !== 'number' || typeof n.text !== 'string') {\n    problems.push(`dropped a broken note (${JSON.stringify(n)?.slice(0, 40)})`);\n    return null;\n  }\n  const color = COLORS.includes(n.color) ? n.color : 'yellow';\n  if (color !== n.color) problems.push(`note ${n.id}: unknown color, set to yellow`);\n  const text = n.text.length > 5000 ? n.text.slice(0, 5000) : n.text;\n  if (text !== n.text) problems.push(`note ${n.id}: text was too long and was cut`);\n  return { id: n.id, text, color };\n}\n\nfunction clean(data, problems) {\n  if (!data || typeof data !== 'object' || !Array.isArray(data.notes)) {\n    if (data !== null) problems.push('the saved data had the wrong shape, so the board starts fresh');\n    return fresh();\n  }\n  const seen = new Set();\n  const notes = data.notes.map((n) => cleanNote(n, problems)).filter((n) => n && !seen.has(n.id) && seen.add(n.id));\n  return { version: 2, notes, nextId: Math.max(0, ...notes.map((n) => n.id)) + 1 };\n}\n\ndocument.getElementById('corrupt').addEventListener('click', () => {\n  loadFrom(JSON.stringify({ version: 2, nextId: 1, notes: [\n    { id: 1, text: 'A good note', color: 'pink' },\n    { id: 2, text: null, color: 'blue' },\n    { id: 3, text: 'A note with a strange color', color: 'plaid' },\n  ] }), 'broken save');\n});",
    "versions": "function upgrade(data) {\n  if (Array.isArray(data)) data = { version: 1, notes: data };\n  if (data && data.version === 1 && Array.isArray(data.notes)) {\n    data = { version: 2, notes: data.notes.map((text, i) => ({ id: i + 1, text: String(text), color: 'yellow' })) };\n  }\n  return data;\n}\n\nfunction loadFrom(text, where) {\n  const problems = [];\n  let data = null;\n  try { data = JSON.parse(text); } catch { problems.push(`the ${where} wasn't valid JSON`); }\n  if (data === null && !problems.length) return false;\n  state = clean(upgrade(data), problems);\n  report.textContent = `${where}: ${state.notes.length} notes${problems.length ? `, with fixes:\\n• ${problems.join('\\n• ')}` : '.'}`;\n  render();\n  save();\n  return true;\n}\n\ndocument.getElementById('old').addEventListener('click', () => {\n  loadFrom(JSON.stringify(['Buy milk', 'Call mom', 'Book flights']), 'old version-1 save');\n});\n\ndocument.getElementById('backup').addEventListener('click', () => {\n  const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));\n  const a = Object.assign(document.createElement('a'), { href: url, download: 'notes-backup.json' });\n  a.click();\n  setTimeout(() => URL.revokeObjectURL(url), 1000);\n});\n\ndocument.getElementById('restore').addEventListener('change', async (e) => {\n  const file = e.target.files[0];\n  if (!file) return;\n  if (file.size > 1_000_000) { report.textContent = 'That file is too big to be a notes backup.'; return; }\n  loadFrom(await file.text(), 'backup file');\n});\n\nlet stored = null;\ntry { stored = localStorage.getItem(KEY); } catch { /* blocked */ }\nif (stored) loadFrom(stored, 'saved notes');\nelse render();"
   }
  }
 ],
 "finish": "Your app's data can survive real life now. You learned:\n\n- **Debounced** saves with `clearTimeout` and `setTimeout`\n- Saves in **try/catch**, with a clear message when storage fails\n- **Never trust saved data**: check every field, fix what's minor, drop what's broken, rebuild derived values\n- **Versions** and step-by-step **upgrades** for old saves\n- **Backups** out with a Blob and back in through the same checks\n\nYou've now learned every part of the **Sticky Notes** app: Electron, app state, pointer dragging and safe saving. Build it next.\n\n### Challenges\n\n1. Keep the last 3 saves (`safe-notes-1`, `-2`, `-3`) and offer \"Restore the previous save\" if the newest one is broken.\n2. Save when the page is hidden (`visibilitychange`), so a pending debounced save isn't lost when someone closes the tab.\n3. Write a test: feed `clean()` ten kinds of broken data and check none of them crash it.\n\n### Next\n\nThe **Sticky Notes** project."
};
