// Built from guides/jsonfiles.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "jsonfiles",
 "title": "Import and export JSON files",
 "goals": [
  "Let people download their data as a file with Blob and a temporary link",
  "Read a file they pick with an input and file.text()",
  "Check imported data item by item, so one bad record doesn't lose the rest"
 ],
 "prereqs": [
  "JavaScript basics (objects, arrays, try/catch)",
  "State updates with pure functions"
 ],
 "sessions": [
  {
   "title": "Your data as a file",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "Export: a Blob and a temporary link",
   "body": "A browser app can hand someone a file without a server. Make the text, wrap it in a **Blob**, give it a temporary URL and click a link to it:\n\n```js\nexport const serialize = (tasks) => JSON.stringify({ app: 'dev-task-board', version: 1, tasks });\n\nconst exportBoard = () => {\n  const url = URL.createObjectURL(new Blob([serialize(tasks)], { type: 'application/json' }));\n  const a = Object.assign(document.createElement('a'), { href: url, download: `task-board-${today}.json` });\n  a.click();\n  setTimeout(() => URL.revokeObjectURL(url), 5000);         // free the memory once it's saved\n};\n```\n\nThe file says what it is (`app`) and which **version** of the format it uses, so a later version of the app can still read old files.\n\n```svg Text becomes a Blob, the Blob gets a temporary URL, and a link with download saves it\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 500 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"500\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"30\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"60\" y=\"49\" text-anchor=\"middle\">JSON text</text>\n  <rect x=\"140\" y=\"30\" width=\"80\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"180\" y=\"49\" text-anchor=\"middle\">Blob</text>\n  <rect x=\"250\" y=\"30\" width=\"110\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"305\" y=\"49\" text-anchor=\"middle\">blob: URL</text>\n  <rect x=\"390\" y=\"30\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"440\" y=\"49\" text-anchor=\"middle\">a.download</text>\n  <path d=\"M110 45 H140 M220 45 H250 M360 45 H390\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does the exported file include app and version fields?",
     "options": [
      "JSON requires them",
      "So the app can recognize its own files and still read older formats later",
      "To make the file bigger"
     ],
     "answer": 1,
     "why": "A self-describing file is safer to import and easier to upgrade."
    },
    {
     "q": "Why call URL.revokeObjectURL after a moment?",
     "options": [
      "A blob URL keeps the data in memory until it's revoked",
      "The download won't start without it",
      "It deletes the downloaded file"
     ],
     "answer": 0,
     "why": "Revoking frees the memory once the browser has started saving."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Import: pick a file and read it",
   "body": "A hidden `<input type=\"file\">` opens the file picker; `file.text()` reads it as a string:\n\n```jsx\nconst file = useRef(null);\n<button onClick={() => file.current.click()}>Import</button>\n<input ref={file} type=\"file\" accept=\".json,application/json\" hidden onChange={importBoard} />\n\nconst importBoard = async (e) => {\n  const picked = e.target.files?.[0];\n  e.target.value = '';                    // so picking the same file again still fires onChange\n  if (!picked) return;\n  try {\n    const { tasks: loaded, skipped } = parseBoard(await picked.text());\n    setTasks(loaded);\n    setNote(`Imported ${loaded.length} tasks${skipped ? ` (${skipped} couldn’t be read)` : ''}.`);\n  } catch (err) { setNote(err.message); }\n};\n```\n\n```svg The button opens the hidden input; the chosen file is read as text and handed to parseBoard\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 500 90\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"500\" height=\"90\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"30\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"55\" y=\"49\" text-anchor=\"middle\">Import</text>\n  <rect x=\"130\" y=\"30\" width=\"110\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"185\" y=\"49\" text-anchor=\"middle\">file picker</text>\n  <rect x=\"270\" y=\"30\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"320\" y=\"49\" text-anchor=\"middle\">file.text()</text>\n  <rect x=\"400\" y=\"30\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"445\" y=\"49\" text-anchor=\"middle\">parseBoard</text>\n  <path d=\"M100 45 H130 M240 45 H270 M370 45 H400\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why reset e.target.value to '' after reading the choice?",
     "options": [
      "To delete the file",
      "Otherwise choosing the same file again doesn't count as a change, and nothing happens",
      "It's required by file.text()"
     ],
     "answer": 1,
     "why": "onChange only fires when the value changes."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "Trust nothing: check every item",
   "body": "An imported file may be from an older version, edited by hand, or not a board at all. `parseBoard` throws a plain message if the file isn't usable, then checks **each task** with the same `cleanTask()` the editor uses, keeping the good ones and counting the rest:\n\n```js\nexport function parseBoard(text) {\n  let data;\n  try { data = JSON.parse(text); } catch { throw new Error('That file isn’t a board export (it isn’t JSON).'); }\n  const list = Array.isArray(data) ? data : data?.tasks;\n  if (!Array.isArray(list)) throw new Error('That file isn’t a board export.');\n  const tasks = [];\n  const seen = new Set();\n  for (const t of list.slice(0, 2000)) {                       // a size limit\n    if (!t || typeof t !== 'object') continue;\n    const id = typeof t.id === 'string' && /^[\\w-]{1,40}$/.test(t.id) && !seen.has(t.id) ? t.id : undefined;\n    const r = cleanTask({ ...t, id });\n    if (r.ok) { seen.add(r.task.id); tasks.push(r.task); }\n  }\n  return { tasks, skipped: list.length - tasks.length };\n}\n```\n\n| Check | Protects against |\n|---|---|\n| `JSON.parse` in try/catch | a file that isn't JSON |\n| `Array.isArray(list)` | JSON that isn't a board |\n| at most 2000 tasks | a huge file freezing the page |\n| id pattern and `seen` | odd or duplicate ids |\n| `cleanTask` | missing titles, bad dates, unknown columns |\n\nLoading from `localStorage` uses the same function, so a damaged save also loses only the broken tasks, never the whole board.\n\n```svg Each item is checked on its own: good tasks are kept, broken ones are counted as skipped\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 460 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"460\" height=\"120\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"10\" width=\"120\" height=\"24\" rx=\"4\" fill=\"#dcfce7\"/><text x=\"20\" y=\"27\">{ title: \"Fix login\" }</text>\n  <rect x=\"10\" y=\"40\" width=\"120\" height=\"24\" rx=\"4\" fill=\"#fee2e2\"/><text x=\"20\" y=\"57\">{ title: \"\" }</text>\n  <rect x=\"10\" y=\"70\" width=\"120\" height=\"24\" rx=\"4\" fill=\"#dcfce7\"/><text x=\"20\" y=\"87\">{ title: \"Docs\" }</text>\n  <rect x=\"190\" y=\"40\" width=\"90\" height=\"26\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"235\" y=\"58\" text-anchor=\"middle\">cleanTask</text>\n  <path d=\"M130 22 L190 50 M130 52 H190 M130 82 L190 56\" stroke=\"#374151\"/>\n  <text x=\"300\" y=\"45\" fill=\"#16a34a\">2 tasks kept</text><text x=\"300\" y=\"68\" fill=\"#dc2626\">1 skipped</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why check each task separately instead of rejecting the whole file if one is broken?",
     "options": [
      "One damaged record shouldn't cost the person every other task",
      "It's faster",
      "JSON.parse already checks each item"
     ],
     "answer": 0,
     "why": "Keep what's good, report what was skipped."
    },
    {
     "q": "Why does the import reuse the editor's cleanTask()?",
     "options": [
      "To save typing",
      "One set of rules for every way a task gets in, so imported tasks are as valid as typed ones",
      "cleanTask is required by JSON.parse"
     ],
     "answer": 1,
     "why": "Data entering from anywhere passes the same checks."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 16
  }
 ],
 "finish": "You can export data as a versioned file, read a file someone picks, and import it safely item by item.\n\n### Challenges\n\n1. Add a confirm step that shows how many tasks will be replaced before importing.\n2. Offer \"merge\" as well as \"replace\", skipping tasks whose ids already exist.\n3. Write a test with a file of 3 tasks where one has no title, and check skipped is 1."
};
