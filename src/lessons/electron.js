// Built from guides/electron.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "electron",
 "title": "Electron basics: your first desktop app",
 "goals": [
  "Explain what Electron is, what it's good for and its trade-offs",
  "Set up an Electron project with npm and a start script",
  "Open a window from the main process with BrowserWindow",
  "Keep the page safe with contextIsolation, a preload script and a Content Security Policy",
  "Send messages between the page and the main process with IPC",
  "Show real system notifications, and know how apps are packaged into installers"
 ],
 "prereqs": [
  "The Get set up guide (Node.js installed)",
  "The JavaScript basics guide",
  "The Web APIs guide helps (async and await)"
 ],
 "sessions": [
  {
   "title": "What Electron is",
   "from": 0,
   "to": 2
  },
  {
   "title": "Two processes talking",
   "from": 3,
   "to": 5
  },
  {
   "title": "Shipping it",
   "from": 6,
   "to": 6
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "What Electron is, and why use it",
   "body": "Everything you've built so far runs in a browser tab. **Electron** lets you build **desktop apps** (the kind with their own window, icon in the taskbar and installer) using the same HTML, CSS and JavaScript. You may use Electron apps every day: **VS Code**, **Slack**, **Discord** and **Microsoft Teams** are built with it.\n\nIn this guide you'll build **Desktop Reminders**: a small app with a live clock that pops up real Windows or macOS notifications when a reminder is due. It's the warm-up for the Sticky Notes guide, whose desktop version puts each note in its own window. The finished project is at [github.com/TheoYanvno/desktop-reminders](https://github.com/TheoYanvno/desktop-reminders).\n\n### How it works\n\nAn Electron app is two programs glued together:\n\n```svg Electron bundles Chromium, which draws your HTML, CSS and JavaScript, with Node.js, which can use the computer: files, notifications, menus and windows\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 190\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"190\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"10\" width=\"500\" height=\"170\" rx=\"14\" fill=\"#f1f5f9\" stroke=\"#475569\"/>\n  <text x=\"260\" y=\"34\" text-anchor=\"middle\" font-weight=\"bold\">Your Electron app</text>\n  <rect x=\"30\" y=\"50\" width=\"210\" height=\"110\" rx=\"10\" fill=\"#dbeafe\" stroke=\"#2563eb\"/>\n  <text x=\"135\" y=\"76\" text-anchor=\"middle\" font-weight=\"bold\">Chromium</text>\n  <text x=\"135\" y=\"98\" text-anchor=\"middle\">the browser engine</text>\n  <text x=\"135\" y=\"118\" text-anchor=\"middle\">draws your HTML and CSS,</text>\n  <text x=\"135\" y=\"136\" text-anchor=\"middle\">runs your page's JavaScript</text>\n  <rect x=\"280\" y=\"50\" width=\"210\" height=\"110\" rx=\"10\" fill=\"#dcfce7\" stroke=\"#16a34a\"/>\n  <text x=\"385\" y=\"76\" text-anchor=\"middle\" font-weight=\"bold\">Node.js</text>\n  <text x=\"385\" y=\"98\" text-anchor=\"middle\">uses the computer:</text>\n  <text x=\"385\" y=\"118\" text-anchor=\"middle\">windows, files, menus,</text>\n  <text x=\"385\" y=\"136\" text-anchor=\"middle\">notifications</text>\n</svg>\n```\n\n- **Chromium** is the open-source core of Google Chrome. It shows your window's contents, exactly like a web page.\n- **Node.js** is the same JavaScript runtime you installed in Get set up. It can do what a web page can't: open windows, read and write files, show notifications.\n\n### Trade-offs\n\n| Good | Not so good |\n|---|---|\n| One codebase runs on Windows, macOS and Linux | Every app ships its own Chromium, so installers are large (often 80 MB or more) |\n| Use the web skills you already have | Uses more memory than a native app |\n| Full access to the computer through Node.js | That access means security mistakes matter more (step 5) |",
   "quiz": [
    {
     "q": "What two pieces make up Electron?",
     "options": [
      "Python and a browser",
      "Chromium (to draw the page) and Node.js (to use the computer)",
      "VS Code and GitHub"
     ],
     "answer": 1,
     "why": "Chromium renders your HTML/CSS/JS, and Node.js gives the app access to the operating system."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Set up the project",
   "body": "An Electron app is a Node.js project. Make a folder called `desktop-reminders`, open it in VS Code, and in the terminal run:\n\n```text\nnpm init -y\nnpm install --save-dev electron\n```\n\n`npm init -y` creates `package.json`, the file that describes a Node project. `npm install --save-dev electron` downloads Electron (about 100 MB, so it takes a minute) into a `node_modules` folder and records it under `devDependencies`.\n\n### package.json\n\nEdit it so it looks like this:\n\n```json\n{\n  \"name\": \"desktop-reminders\",\n  \"version\": \"1.0.0\",\n  \"description\": \"A small desktop app: a clock and quick reminders that pop up as system notifications.\",\n  \"main\": \"main.js\",\n  \"scripts\": {\n    \"start\": \"electron .\"\n  },\n  \"author\": \"Your Name\",\n  \"license\": \"MIT\",\n  \"devDependencies\": {\n    \"electron\": \"^33.2.0\"\n  }\n}\n```\n\n- `\"main\": \"main.js\"` tells Electron which file to run first.\n- `\"scripts\": { \"start\": \"electron .\" }` means `npm start` launches the app (`.` is \"this folder\").\n- Your version number may be newer than `^33.2.0`; whatever `npm install` wrote is fine.\n\n### The files you'll make\n\n| File | Runs in | Job |\n|---|---|---|\n| `main.js` | the **main process** (Node.js) | starts the app, opens windows, shows notifications |\n| `preload.js` | a bridge between the two | gives the page a small, safe set of desktop features |\n| `index.html`, `style.css`, `renderer.js` | the **renderer** (Chromium) | the page inside the window |\n\n### .gitignore\n\n`node_modules` is huge and anyone can recreate it with `npm install`, so never commit it. Create `.gitignore` containing:\n\n```text\nnode_modules/\ndist/\n```",
   "quiz": [
    {
     "q": "What does `\"start\": \"electron .\"` in package.json do?",
     "options": [
      "Makes `npm start` launch Electron with this folder as the app",
      "Publishes the app",
      "Installs Electron"
     ],
     "answer": 0,
     "why": "Scripts are shortcuts: `npm start` runs `electron .`, and Electron reads `main` from package.json to find main.js."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "The main process opens a window",
   "body": "`main.js` is the first code that runs. It waits until Electron is ready, then creates a **BrowserWindow** (a desktop window with Chromium inside) and loads your page into it:\n\n```js\nconst { app, BrowserWindow } = require('electron');\nconst path = require('node:path');\n\nfunction createWindow() {\n  const win = new BrowserWindow({\n    width: 420,\n    height: 560,\n    title: 'Desktop Reminders',\n    webPreferences: {\n      preload: path.join(__dirname, 'preload.js'),\n    },\n  });\n  win.loadFile('index.html');\n}\n\napp.whenReady().then(createWindow);\n\napp.on('window-all-closed', () => {\n  if (process.platform !== 'darwin') app.quit();\n});\n```\n\n- `require('electron')` loads Electron's tools. `require` is Node's older way of importing (like `import`).\n- `app` is the application itself: it starts, gets ready and quits. `app.whenReady()` is a promise, so `.then(createWindow)` runs once the app can make windows.\n- `path.join(__dirname, 'preload.js')` builds the full path to the preload file. `__dirname` is the folder this file is in, so it works wherever the app is installed.\n- **Windows and Linux** apps quit when their last window closes. **macOS** apps keep running, so `process.platform !== 'darwin'` (darwin is macOS's internal name) keeps that habit.\n\n### Run it\n\nMake a simple `index.html` with an `<h1>` for now, then:\n\n```text\nnpm start\n```\n\nA real window opens with your page in it. That's a desktop app!\n\n```svg The main process creates windows; each window has its own renderer process showing a page\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 170\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"170\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"50\" width=\"160\" height=\"70\" rx=\"10\" fill=\"#dcfce7\" stroke=\"#16a34a\"/>\n  <text x=\"90\" y=\"78\" text-anchor=\"middle\" font-weight=\"bold\">Main process</text><text x=\"90\" y=\"98\" text-anchor=\"middle\">main.js (Node.js)</text>\n  <rect x=\"250\" y=\"14\" width=\"250\" height=\"60\" rx=\"10\" fill=\"#dbeafe\" stroke=\"#2563eb\"/>\n  <text x=\"375\" y=\"40\" text-anchor=\"middle\" font-weight=\"bold\">Window 1 → renderer</text><text x=\"375\" y=\"60\" text-anchor=\"middle\">index.html in Chromium</text>\n  <rect x=\"250\" y=\"96\" width=\"250\" height=\"60\" rx=\"10\" fill=\"#dbeafe\" stroke=\"#2563eb\" stroke-dasharray=\"5 4\"/>\n  <text x=\"375\" y=\"122\" text-anchor=\"middle\" font-weight=\"bold\">Window 2 → renderer</text><text x=\"375\" y=\"142\" text-anchor=\"middle\">(Sticky Notes: one per note)</text>\n  <path d=\"M170 75 L246 45 M170 95 L246 125\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"208\" y=\"70\" text-anchor=\"middle\" font-size=\"11\">new BrowserWindow()</text>\n</svg>\n```\n\nThere is one main process, and every window has its own **renderer process**. The Sticky Notes app makes one window per note, which is why it's built on this.",
   "quiz": [
    {
     "q": "Why does `main.js` check `process.platform !== 'darwin'` before quitting?",
     "options": [
      "macOS can't run Electron",
      "On macOS, apps normally stay open after their last window closes",
      "darwin is the name of the app"
     ],
     "answer": 1,
     "why": "It follows each system's habit: quit on Windows and Linux, stay in the dock on macOS."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "The page: a renderer with a clock",
   "body": "The window shows ordinary HTML, CSS and JavaScript. The page has a live clock and a form to set a reminder.\n\n```html\n<!doctype html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; script-src 'self'; style-src 'self'\">\n  <title>Desktop Reminders</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <main class=\"app\">\n    <p id=\"date\" class=\"date\"></p>\n    <p id=\"clock\" class=\"clock\">--:--</p>\n    <form id=\"reminderForm\" class=\"reminder\">\n      <h2>Remind me</h2>\n      <label for=\"text\">About</label>\n      <input id=\"text\" type=\"text\" maxlength=\"120\" placeholder=\"Stretch, drink water…\">\n      <label for=\"minutes\">In how many minutes?</label>\n      <input id=\"minutes\" type=\"number\" min=\"1\" max=\"240\" value=\"10\">\n      <button type=\"submit\">Set reminder</button>\n    </form>\n    <p id=\"message\" class=\"message\" aria-live=\"polite\"></p>\n    <ul id=\"list\" class=\"list\"></ul>\n    <p id=\"versions\" class=\"versions\"></p>\n  </main>\n  <script src=\"renderer.js\"></script>\n</body>\n</html>\n```\n\n### The Content Security Policy\n\nThat `<meta http-equiv=\"Content-Security-Policy\">` line is a **CSP**: a list of what the page is allowed to load. `default-src 'self'` means \"only files from this app\": no scripts from the internet, no inline `<script>` blocks, no inline styles. If an attacker ever got text into your page, the browser would refuse to run it. Electron prints a security warning in the console if a page has no CSP.\n\n### The clock\n\n`renderer.js` updates the time every second with `setInterval`, and formats it with `toLocaleTimeString`, which follows the user's own time format:\n\n```js\nfunction tick() {\n  const now = new Date();\n  clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });\n  dateLine.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });\n}\ntick();\nsetInterval(tick, 1000);\n```\n\nThe page's style is plain CSS (a dark card with a big clock); it's in the project repository as `style.css`.\n\n> Tip: press `Ctrl+Shift+I` (Mac: `Cmd+Option+I`) in an Electron window to open the same developer tools as Chrome.",
   "quiz": [
    {
     "q": "What does `default-src 'self'` in the CSP do?",
     "options": [
      "Makes the window full screen",
      "Only allows content from the app's own files, so injected or remote scripts can't run",
      "Turns off JavaScript"
     ],
     "answer": 1,
     "why": "A CSP is a safety net: even if bad text gets into the page, the browser won't run it."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "The preload bridge and IPC",
   "body": "The page needs a desktop feature: notifications. But the page **must not** get full Node.js access. If it did, any bug that let someone inject a script would let them read files or run programs on the user's computer.\n\nElectron's safe pattern has three parts:\n\n```svg IPC through the preload bridge: the page calls window.desktop.remind, the preload sends an IPC message, and the main process handles it and replies\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 190\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"190\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"40\" width=\"150\" height=\"90\" rx=\"10\" fill=\"#dbeafe\" stroke=\"#2563eb\"/>\n  <text x=\"85\" y=\"64\" text-anchor=\"middle\" font-weight=\"bold\">Renderer (page)</text>\n  <text x=\"85\" y=\"88\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"11\">window.desktop</text>\n  <text x=\"85\" y=\"104\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"11\">.remind(10, \"Stretch\")</text>\n  <rect x=\"185\" y=\"40\" width=\"150\" height=\"90\" rx=\"10\" fill=\"#fef3c7\" stroke=\"#d97706\"/>\n  <text x=\"260\" y=\"64\" text-anchor=\"middle\" font-weight=\"bold\">preload.js</text>\n  <text x=\"260\" y=\"88\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"11\">ipcRenderer</text>\n  <text x=\"260\" y=\"104\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"11\">.invoke('remind', …)</text>\n  <rect x=\"360\" y=\"40\" width=\"150\" height=\"90\" rx=\"10\" fill=\"#dcfce7\" stroke=\"#16a34a\"/>\n  <text x=\"435\" y=\"64\" text-anchor=\"middle\" font-weight=\"bold\">Main process</text>\n  <text x=\"435\" y=\"88\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"11\">ipcMain</text>\n  <text x=\"435\" y=\"104\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"11\">.handle('remind', …)</text>\n  <path d=\"M160 72 H181 M335 72 H356\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <path d=\"M356 100 H335 M181 100 H160\" stroke=\"#16a34a\" stroke-width=\"2\" stroke-dasharray=\"4 3\"/>\n  <text x=\"260\" y=\"160\" text-anchor=\"middle\" fill=\"#374151\">The page only sees the functions the preload chose to expose.</text>\n  <text x=\"260\" y=\"178\" text-anchor=\"middle\" fill=\"#16a34a\">The reply ({ ok, due }) comes back as a promise.</text>\n</svg>\n```\n\n1. **contextIsolation** (on by default) keeps the page's JavaScript and the preload's in separate worlds. `nodeIntegration: false` keeps Node out of the page, and `sandbox: true` limits the renderer further.\n2. The **preload script** runs before the page and uses `contextBridge` to expose a tiny API, `window.desktop`, with only the functions you choose.\n3. **IPC** (inter-process communication) carries messages between processes. `ipcRenderer.invoke()` sends a request and returns a promise; `ipcMain.handle()` in the main process answers it.\n\n### preload.js\n\n```js\nconst { contextBridge, ipcRenderer } = require('electron');\n\ncontextBridge.exposeInMainWorld('desktop', {\n  remind: (minutes, text) => ipcRenderer.invoke('remind', minutes, text),\n  onReminderDone: (callback) => ipcRenderer.on('reminder-done', (_event, text) => callback(text)),\n  versions: {\n    electron: process.versions.electron,\n    chrome: process.versions.chrome,\n    node: process.versions.node,\n  },\n});\n```\n\nNotice the page never gets `ipcRenderer` itself, only two functions that send exactly one kind of message each.\n\n### Using it from the page\n\n```js\nform.addEventListener('submit', async (event) => {\n  event.preventDefault();\n  const text = textInput.value.trim() || 'Time is up!';\n  const result = await window.desktop.remind(minutesInput.value, text);\n  if (!result.ok) {\n    message.textContent = result.error;\n    return;\n  }\n  const at = new Date(result.due).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });\n  message.textContent = `Okay! I'll remind you at ${at}.`;\n});\n```\n\nIt's the same `async`/`await` you used with `fetch`: the page asks, waits for the main process to answer, then updates.",
   "quiz": [
    {
     "q": "Why not just turn on `nodeIntegration` so the page can use Node directly?",
     "options": [
      "It's slower",
      "Any injected script would get full access to the computer; the preload exposes only what's needed",
      "Node doesn't work in Chromium"
     ],
     "answer": 1,
     "why": "Least privilege: the page gets two small functions instead of the power to read files or run programs."
    },
    {
     "q": "What does `ipcRenderer.invoke('remind', ...)` return?",
     "options": [
      "Nothing",
      "A promise for the main process's answer",
      "The notification"
     ],
     "answer": 1,
     "why": "invoke sends the message and the promise resolves with whatever `ipcMain.handle` returns."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 20
  },
  {
   "title": "System notifications from the main process",
   "body": "Now the main process handles the `'remind'` message. It **checks the input** (never trust messages from the page, just like form input), waits, and shows a real system notification with Electron's `Notification`:\n\n```js\nconst { app, BrowserWindow, ipcMain, Notification } = require('electron');\n\nipcMain.handle('remind', (event, minutes, text) => {\n  const delay = Number(minutes);\n  const message = String(text ?? '').trim().slice(0, 120) || 'Time is up!';\n  if (!Number.isFinite(delay) || delay < 1 || delay > 240) {\n    return { ok: false, error: 'Pick from 1 to 240 minutes.' };\n  }\n  if (!Notification.isSupported()) {\n    return { ok: false, error: 'Notifications are not supported on this computer.' };\n  }\n  const due = Date.now() + delay * 60_000;\n  setTimeout(() => {\n    new Notification({ title: 'Reminder', body: message }).show();\n    event.sender.send('reminder-done', message);\n  }, delay * 60_000);\n  return { ok: true, due };\n});\n```\n\n- Whatever `handle` returns becomes the result of the page's `invoke` promise: `{ ok: true, due }` or `{ ok: false, error }`.\n- `60_000` is 60,000 milliseconds (one minute); the underscore is just for readability.\n- The timer lives in the **main process**, so the reminder still fires if the window is minimized.\n- `event.sender.send('reminder-done', message)` sends a message the other way, main to page, so the page can cross the reminder off its list.\n\nThe notification looks like any other app's: in the Windows Action Center, or macOS Notification Center. (On Windows, notifications from `npm start` may show \"electron.app\" as the sender; a packaged app shows its own name.)",
   "quiz": [
    {
     "q": "Why does the main process check `minutes` again, even though the input has `min=\"1\"`?",
     "options": [
      "The main process should never trust messages from the page; a bug or injected script could send anything",
      "Number inputs don't work in Electron",
      "To make it slower"
     ],
     "answer": 0,
     "why": "Validate at the boundary: the main process has the power, so it checks every request."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Packaging, and what's next",
   "body": "`npm start` is for development. To give the app to someone, you **package** it into an installer (`.exe` for Windows, `.dmg` for macOS) with a tool like **Electron Forge** or **electron-builder**. For example, with Electron Forge:\n\n```text\nnpm install --save-dev @electron-forge/cli\nnpx electron-forge import\nnpm run make\n```\n\nThe installer appears in an `out` folder. It bundles Chromium and Node, which is why even a tiny app is large. Installers for Windows and macOS should be **code-signed** so the system trusts them; without signing, Windows SmartScreen and macOS Gatekeeper warn the user.\n\n### The full project\n\nThe complete app (`package.json`, `main.js`, `preload.js`, `index.html`, `renderer.js`, `style.css`, `.gitignore` and a README) is at [github.com/TheoYanvno/desktop-reminders](https://github.com/TheoYanvno/desktop-reminders). To run it: clone it, `npm install`, `npm start`.\n\n### Security checklist for every Electron app\n\n| ✅ | Rule |\n|---|---|\n| ✅ | `contextIsolation: true` and `nodeIntegration: false` (the defaults; never turn them off) |\n| ✅ | Expose small, specific functions through the preload, never `ipcRenderer` itself |\n| ✅ | A Content Security Policy on every page |\n| ✅ | Validate every IPC message in the main process |\n| ✅ | Only load your own files, never remote websites, in a window with a preload |\n\n### Next\n\nThe **Sticky Notes** guide builds a web app, then its Electron version: one frameless window per note, always on top, with notes saved to a file through the same preload and IPC pattern.",
   "quiz": [
    {
     "q": "Why is even a tiny Electron installer large?",
     "options": [
      "Electron compresses badly",
      "Each app includes its own copy of Chromium and Node.js",
      "Installers include the source code twice"
     ],
     "answer": 1,
     "why": "Bundling the engine is what makes one codebase run everywhere, and it costs disk space."
    }
   ],
   "session": 2,
   "kind": "read",
   "minutes": 12
  }
 ],
 "finish": "You built a real desktop app with web technology. You learned:\n\n- What **Electron** is: **Chromium** for the page plus **Node.js** for the computer\n- Setting up a project with **npm**, `package.json` and a **start script**\n- The **main process**, **BrowserWindow** and **renderer** processes\n- Security: **contextIsolation**, a **preload** with `contextBridge`, a **CSP**, and validating messages\n- **IPC** with `invoke` / `handle`, and messages back with `send`\n- **System notifications**, and **packaging** with Electron Forge\n\n### Challenges\n\n1. Add a **tray icon** (`Tray`) so the app can hide to the system tray and still remind you.\n2. Save reminders to a JSON file with Node's `fs` module in the main process, so they survive a restart.\n3. Make the window **always on top** with a checkbox (`win.setAlwaysOnTop(true)`) sent through IPC."
};
