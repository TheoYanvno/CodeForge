---
id: jsonfiles
title: Import and export JSON files
goals: Let people download their data as a file with Blob and a temporary link; Read a file they pick with an input and file.text(); Check imported data item by item, so one bad record doesn't lose the rest
prereqs: JavaScript basics (objects, arrays, try/catch); State updates with pure functions
---

## Session: Your data as a file

## Step: Export: a Blob and a temporary link
kind: read
time: 12

A browser app can hand someone a file without a server. Make the text, wrap it in a **Blob**, give it a temporary URL and click a link to it:

```js
export const serialize = (tasks) => JSON.stringify({ app: 'dev-task-board', version: 1, tasks });

const exportBoard = () => {
  const url = URL.createObjectURL(new Blob([serialize(tasks)], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `task-board-${today}.json` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);         // free the memory once it's saved
};
```

The file says what it is (`app`) and which **version** of the format it uses, so a later version of the app can still read old files.

```svg Text becomes a Blob, the Blob gets a temporary URL, and a link with download saves it
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 90" font-family="sans-serif" font-size="12">
  <rect width="500" height="90" fill="#fff"/>
  <rect x="10" y="30" width="100" height="30" rx="6" fill="#e0e7ff"/><text x="60" y="49" text-anchor="middle">JSON text</text>
  <rect x="140" y="30" width="80" height="30" rx="6" fill="#dbeafe"/><text x="180" y="49" text-anchor="middle">Blob</text>
  <rect x="250" y="30" width="110" height="30" rx="6" fill="#fef3c7"/><text x="305" y="49" text-anchor="middle">blob: URL</text>
  <rect x="390" y="30" width="100" height="30" rx="6" fill="#dcfce7"/><text x="440" y="49" text-anchor="middle">a.download</text>
  <path d="M110 45 H140 M220 45 H250 M360 45 H390" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why does the exported file include app and version fields?
- [ ] JSON requires them
- [x] So the app can recognize its own files and still read older formats later
- [ ] To make the file bigger
why: A self-describing file is safer to import and easier to upgrade.

quiz: Why call URL.revokeObjectURL after a moment?
- [x] A blob URL keeps the data in memory until it's revoked
- [ ] The download won't start without it
- [ ] It deletes the downloaded file
why: Revoking frees the memory once the browser has started saving.

## Step: Import: pick a file and read it
kind: read
time: 10

A hidden `<input type="file">` opens the file picker; `file.text()` reads it as a string:

```jsx
const file = useRef(null);
<button onClick={() => file.current.click()}>Import</button>
<input ref={file} type="file" accept=".json,application/json" hidden onChange={importBoard} />

const importBoard = async (e) => {
  const picked = e.target.files?.[0];
  e.target.value = '';                    // so picking the same file again still fires onChange
  if (!picked) return;
  try {
    const { tasks: loaded, skipped } = parseBoard(await picked.text());
    setTasks(loaded);
    setNote(`Imported ${loaded.length} tasks${skipped ? ` (${skipped} couldn’t be read)` : ''}.`);
  } catch (err) { setNote(err.message); }
};
```

```svg The button opens the hidden input; the chosen file is read as text and handed to parseBoard
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 90" font-family="sans-serif" font-size="12">
  <rect width="500" height="90" fill="#fff"/>
  <rect x="10" y="30" width="90" height="30" rx="6" fill="#dbeafe"/><text x="55" y="49" text-anchor="middle">Import</text>
  <rect x="130" y="30" width="110" height="30" rx="6" fill="#fef3c7"/><text x="185" y="49" text-anchor="middle">file picker</text>
  <rect x="270" y="30" width="100" height="30" rx="6" fill="#e0e7ff"/><text x="320" y="49" text-anchor="middle">file.text()</text>
  <rect x="400" y="30" width="90" height="30" rx="6" fill="#dcfce7"/><text x="445" y="49" text-anchor="middle">parseBoard</text>
  <path d="M100 45 H130 M240 45 H270 M370 45 H400" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why reset e.target.value to '' after reading the choice?
- [ ] To delete the file
- [x] Otherwise choosing the same file again doesn't count as a change, and nothing happens
- [ ] It's required by file.text()
why: onChange only fires when the value changes.

## Step: Trust nothing: check every item
kind: read
time: 16

An imported file may be from an older version, edited by hand, or not a board at all. `parseBoard` throws a plain message if the file isn't usable, then checks **each task** with the same `cleanTask()` the editor uses, keeping the good ones and counting the rest:

```js
export function parseBoard(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('That file isn’t a board export (it isn’t JSON).'); }
  const list = Array.isArray(data) ? data : data?.tasks;
  if (!Array.isArray(list)) throw new Error('That file isn’t a board export.');
  const tasks = [];
  const seen = new Set();
  for (const t of list.slice(0, 2000)) {                       // a size limit
    if (!t || typeof t !== 'object') continue;
    const id = typeof t.id === 'string' && /^[\w-]{1,40}$/.test(t.id) && !seen.has(t.id) ? t.id : undefined;
    const r = cleanTask({ ...t, id });
    if (r.ok) { seen.add(r.task.id); tasks.push(r.task); }
  }
  return { tasks, skipped: list.length - tasks.length };
}
```

| Check | Protects against |
|---|---|
| `JSON.parse` in try/catch | a file that isn't JSON |
| `Array.isArray(list)` | JSON that isn't a board |
| at most 2000 tasks | a huge file freezing the page |
| id pattern and `seen` | odd or duplicate ids |
| `cleanTask` | missing titles, bad dates, unknown columns |

Loading from `localStorage` uses the same function, so a damaged save also loses only the broken tasks, never the whole board.

```svg Each item is checked on its own: good tasks are kept, broken ones are counted as skipped
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 120" font-family="sans-serif" font-size="12">
  <rect width="460" height="120" fill="#fff"/>
  <rect x="10" y="10" width="120" height="24" rx="4" fill="#dcfce7"/><text x="20" y="27">{ title: "Fix login" }</text>
  <rect x="10" y="40" width="120" height="24" rx="4" fill="#fee2e2"/><text x="20" y="57">{ title: "" }</text>
  <rect x="10" y="70" width="120" height="24" rx="4" fill="#dcfce7"/><text x="20" y="87">{ title: "Docs" }</text>
  <rect x="190" y="40" width="90" height="26" rx="6" fill="#e0e7ff"/><text x="235" y="58" text-anchor="middle">cleanTask</text>
  <path d="M130 22 L190 50 M130 52 H190 M130 82 L190 56" stroke="#374151"/>
  <text x="300" y="45" fill="#16a34a">2 tasks kept</text><text x="300" y="68" fill="#dc2626">1 skipped</text>
</svg>
```

quiz: Why check each task separately instead of rejecting the whole file if one is broken?
- [x] One damaged record shouldn't cost the person every other task
- [ ] It's faster
- [ ] JSON.parse already checks each item
why: Keep what's good, report what was skipped.

quiz: Why does the import reuse the editor's cleanTask()?
- [ ] To save typing
- [x] One set of rules for every way a task gets in, so imported tasks are as valid as typed ones
- [ ] cleanTask is required by JSON.parse
why: Data entering from anywhere passes the same checks.

## Finish

You can export data as a versioned file, read a file someone picks, and import it safely item by item.

### Challenges

1. Add a confirm step that shows how many tasks will be replaced before importing.
2. Offer "merge" as well as "replace", skipping tasks whose ids already exist.
3. Write a test with a file of 3 tasks where one has no title, and check skipped is 1.
