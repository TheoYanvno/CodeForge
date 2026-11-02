---
id: electron
title: Electron basics: your first desktop app
goals: Explain what Electron is, what it's good for and its trade-offs; Set up an Electron project with npm and a start script; Open a window from the main process with BrowserWindow; Keep the page safe with contextIsolation, a preload script and a Content Security Policy; Send messages between the page and the main process with IPC; Show real system notifications, and know how apps are packaged into installers
prereqs: The Get set up guide (Node.js installed); The JavaScript basics guide; The Web APIs guide helps (async and await)
---

## Session: What Electron is

## Step: What Electron is, and why use it
kind: read
time: 12

Everything you've built so far runs in a browser tab. **Electron** lets you build **desktop apps** (the kind with their own window, icon in the taskbar and installer) using the same HTML, CSS and JavaScript. You may use Electron apps every day: **VS Code**, **Slack**, **Discord** and **Microsoft Teams** are built with it.

In this guide you'll build **Desktop Reminders**: a small app with a live clock that pops up real Windows or macOS notifications when a reminder is due. It's the warm-up for the Sticky Notes guide, whose desktop version puts each note in its own window. The finished project is at [github.com/TheoYanvno/desktop-reminders](https://github.com/TheoYanvno/desktop-reminders).

### How it works

An Electron app is two programs glued together:

```svg Electron bundles Chromium, which draws your HTML, CSS and JavaScript, with Node.js, which can use the computer: files, notifications, menus and windows
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 190" font-family="sans-serif" font-size="13">
  <rect width="520" height="190" fill="#ffffff"/>
  <rect x="10" y="10" width="500" height="170" rx="14" fill="#f1f5f9" stroke="#475569"/>
  <text x="260" y="34" text-anchor="middle" font-weight="bold">Your Electron app</text>
  <rect x="30" y="50" width="210" height="110" rx="10" fill="#dbeafe" stroke="#2563eb"/>
  <text x="135" y="76" text-anchor="middle" font-weight="bold">Chromium</text>
  <text x="135" y="98" text-anchor="middle">the browser engine</text>
  <text x="135" y="118" text-anchor="middle">draws your HTML and CSS,</text>
  <text x="135" y="136" text-anchor="middle">runs your page's JavaScript</text>
  <rect x="280" y="50" width="210" height="110" rx="10" fill="#dcfce7" stroke="#16a34a"/>
  <text x="385" y="76" text-anchor="middle" font-weight="bold">Node.js</text>
  <text x="385" y="98" text-anchor="middle">uses the computer:</text>
  <text x="385" y="118" text-anchor="middle">windows, files, menus,</text>
  <text x="385" y="136" text-anchor="middle">notifications</text>
</svg>
```

- **Chromium** is the open-source core of Google Chrome. It shows your window's contents, exactly like a web page.
- **Node.js** is the same JavaScript runtime you installed in Get set up. It can do what a web page can't: open windows, read and write files, show notifications.

### Trade-offs

| Good | Not so good |
|---|---|
| One codebase runs on Windows, macOS and Linux | Every app ships its own Chromium, so installers are large (often 80 MB or more) |
| Use the web skills you already have | Uses more memory than a native app |
| Full access to the computer through Node.js | That access means security mistakes matter more (step 5) |

quiz: What two pieces make up Electron?
- [ ] Python and a browser
- [x] Chromium (to draw the page) and Node.js (to use the computer)
- [ ] VS Code and GitHub
why: Chromium renders your HTML/CSS/JS, and Node.js gives the app access to the operating system.

## Step: Set up the project
kind: read
time: 15

An Electron app is a Node.js project. Make a folder called `desktop-reminders`, open it in VS Code, and in the terminal run:

```text
npm init -y
npm install --save-dev electron
```

`npm init -y` creates `package.json`, the file that describes a Node project. `npm install --save-dev electron` downloads Electron (about 100 MB, so it takes a minute) into a `node_modules` folder and records it under `devDependencies`.

### package.json

Edit it so it looks like this:

```json
{
  "name": "desktop-reminders",
  "version": "1.0.0",
  "description": "A small desktop app: a clock and quick reminders that pop up as system notifications.",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  },
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "electron": "^33.2.0"
  }
}
```

- `"main": "main.js"` tells Electron which file to run first.
- `"scripts": { "start": "electron ." }` means `npm start` launches the app (`.` is "this folder").
- Your version number may be newer than `^33.2.0`; whatever `npm install` wrote is fine.

### The files you'll make

| File | Runs in | Job |
|---|---|---|
| `main.js` | the **main process** (Node.js) | starts the app, opens windows, shows notifications |
| `preload.js` | a bridge between the two | gives the page a small, safe set of desktop features |
| `index.html`, `style.css`, `renderer.js` | the **renderer** (Chromium) | the page inside the window |

### .gitignore

`node_modules` is huge and anyone can recreate it with `npm install`, so never commit it. Create `.gitignore` containing:

```text
node_modules/
dist/
```

quiz: What does `"start": "electron ."` in package.json do?
- [x] Makes `npm start` launch Electron with this folder as the app
- [ ] Publishes the app
- [ ] Installs Electron
why: Scripts are shortcuts: `npm start` runs `electron .`, and Electron reads `main` from package.json to find main.js.

## Step: The main process opens a window
kind: read
time: 15

`main.js` is the first code that runs. It waits until Electron is ready, then creates a **BrowserWindow** (a desktop window with Chromium inside) and loads your page into it:

```js
const { app, BrowserWindow } = require('electron');
const path = require('node:path');

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 560,
    title: 'Desktop Reminders',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

- `require('electron')` loads Electron's tools. `require` is Node's older way of importing (like `import`).
- `app` is the application itself: it starts, gets ready and quits. `app.whenReady()` is a promise, so `.then(createWindow)` runs once the app can make windows.
- `path.join(__dirname, 'preload.js')` builds the full path to the preload file. `__dirname` is the folder this file is in, so it works wherever the app is installed.
- **Windows and Linux** apps quit when their last window closes. **macOS** apps keep running, so `process.platform !== 'darwin'` (darwin is macOS's internal name) keeps that habit.

### Run it

Make a simple `index.html` with an `<h1>` for now, then:

```text
npm start
```

A real window opens with your page in it. That's a desktop app!

```svg The main process creates windows; each window has its own renderer process showing a page
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 170" font-family="sans-serif" font-size="13">
  <rect width="520" height="170" fill="#ffffff"/>
  <rect x="10" y="50" width="160" height="70" rx="10" fill="#dcfce7" stroke="#16a34a"/>
  <text x="90" y="78" text-anchor="middle" font-weight="bold">Main process</text><text x="90" y="98" text-anchor="middle">main.js (Node.js)</text>
  <rect x="250" y="14" width="250" height="60" rx="10" fill="#dbeafe" stroke="#2563eb"/>
  <text x="375" y="40" text-anchor="middle" font-weight="bold">Window 1 → renderer</text><text x="375" y="60" text-anchor="middle">index.html in Chromium</text>
  <rect x="250" y="96" width="250" height="60" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-dasharray="5 4"/>
  <text x="375" y="122" text-anchor="middle" font-weight="bold">Window 2 → renderer</text><text x="375" y="142" text-anchor="middle">(Sticky Notes: one per note)</text>
  <path d="M170 75 L246 45 M170 95 L246 125" stroke="#374151" stroke-width="2"/>
  <text x="208" y="70" text-anchor="middle" font-size="11">new BrowserWindow()</text>
</svg>
```

There is one main process, and every window has its own **renderer process**. The Sticky Notes app makes one window per note, which is why it's built on this.

quiz: Why does `main.js` check `process.platform !== 'darwin'` before quitting?
- [ ] macOS can't run Electron
- [x] On macOS, apps normally stay open after their last window closes
- [ ] darwin is the name of the app
why: It follows each system's habit: quit on Windows and Linux, stay in the dock on macOS.

## Session: Two processes talking

## Step: The page: a renderer with a clock
kind: read
time: 15

The window shows ordinary HTML, CSS and JavaScript. The page has a live clock and a form to set a reminder.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'">
  <title>Desktop Reminders</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="app">
    <p id="date" class="date"></p>
    <p id="clock" class="clock">--:--</p>
    <form id="reminderForm" class="reminder">
      <h2>Remind me</h2>
      <label for="text">About</label>
      <input id="text" type="text" maxlength="120" placeholder="Stretch, drink water…">
      <label for="minutes">In how many minutes?</label>
      <input id="minutes" type="number" min="1" max="240" value="10">
      <button type="submit">Set reminder</button>
    </form>
    <p id="message" class="message" aria-live="polite"></p>
    <ul id="list" class="list"></ul>
    <p id="versions" class="versions"></p>
  </main>
  <script src="renderer.js"></script>
</body>
</html>
```

### The Content Security Policy

That `<meta http-equiv="Content-Security-Policy">` line is a **CSP**: a list of what the page is allowed to load. `default-src 'self'` means "only files from this app": no scripts from the internet, no inline `<script>` blocks, no inline styles. If an attacker ever got text into your page, the browser would refuse to run it. Electron prints a security warning in the console if a page has no CSP.

### The clock

`renderer.js` updates the time every second with `setInterval`, and formats it with `toLocaleTimeString`, which follows the user's own time format:

```js
function tick() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  dateLine.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}
tick();
setInterval(tick, 1000);
```

The page's style is plain CSS (a dark card with a big clock); it's in the project repository as `style.css`.

> Tip: press `Ctrl+Shift+I` (Mac: `Cmd+Option+I`) in an Electron window to open the same developer tools as Chrome.

quiz: What does `default-src 'self'` in the CSP do?
- [ ] Makes the window full screen
- [x] Only allows content from the app's own files, so injected or remote scripts can't run
- [ ] Turns off JavaScript
why: A CSP is a safety net: even if bad text gets into the page, the browser won't run it.

## Step: The preload bridge and IPC
kind: read
time: 20

The page needs a desktop feature: notifications. But the page **must not** get full Node.js access. If it did, any bug that let someone inject a script would let them read files or run programs on the user's computer.

Electron's safe pattern has three parts:

```svg IPC through the preload bridge: the page calls window.desktop.remind, the preload sends an IPC message, and the main process handles it and replies
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 190" font-family="sans-serif" font-size="12">
  <rect width="520" height="190" fill="#ffffff"/>
  <rect x="10" y="40" width="150" height="90" rx="10" fill="#dbeafe" stroke="#2563eb"/>
  <text x="85" y="64" text-anchor="middle" font-weight="bold">Renderer (page)</text>
  <text x="85" y="88" text-anchor="middle" font-family="monospace" font-size="11">window.desktop</text>
  <text x="85" y="104" text-anchor="middle" font-family="monospace" font-size="11">.remind(10, "Stretch")</text>
  <rect x="185" y="40" width="150" height="90" rx="10" fill="#fef3c7" stroke="#d97706"/>
  <text x="260" y="64" text-anchor="middle" font-weight="bold">preload.js</text>
  <text x="260" y="88" text-anchor="middle" font-family="monospace" font-size="11">ipcRenderer</text>
  <text x="260" y="104" text-anchor="middle" font-family="monospace" font-size="11">.invoke('remind', …)</text>
  <rect x="360" y="40" width="150" height="90" rx="10" fill="#dcfce7" stroke="#16a34a"/>
  <text x="435" y="64" text-anchor="middle" font-weight="bold">Main process</text>
  <text x="435" y="88" text-anchor="middle" font-family="monospace" font-size="11">ipcMain</text>
  <text x="435" y="104" text-anchor="middle" font-family="monospace" font-size="11">.handle('remind', …)</text>
  <path d="M160 72 H181 M335 72 H356" stroke="#374151" stroke-width="2"/>
  <path d="M356 100 H335 M181 100 H160" stroke="#16a34a" stroke-width="2" stroke-dasharray="4 3"/>
  <text x="260" y="160" text-anchor="middle" fill="#374151">The page only sees the functions the preload chose to expose.</text>
  <text x="260" y="178" text-anchor="middle" fill="#16a34a">The reply ({ ok, due }) comes back as a promise.</text>
</svg>
```

1. **contextIsolation** (on by default) keeps the page's JavaScript and the preload's in separate worlds. `nodeIntegration: false` keeps Node out of the page, and `sandbox: true` limits the renderer further.
2. The **preload script** runs before the page and uses `contextBridge` to expose a tiny API, `window.desktop`, with only the functions you choose.
3. **IPC** (inter-process communication) carries messages between processes. `ipcRenderer.invoke()` sends a request and returns a promise; `ipcMain.handle()` in the main process answers it.

### preload.js

```js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  remind: (minutes, text) => ipcRenderer.invoke('remind', minutes, text),
  onReminderDone: (callback) => ipcRenderer.on('reminder-done', (_event, text) => callback(text)),
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
});
```

Notice the page never gets `ipcRenderer` itself, only two functions that send exactly one kind of message each.

### Using it from the page

```js
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = textInput.value.trim() || 'Time is up!';
  const result = await window.desktop.remind(minutesInput.value, text);
  if (!result.ok) {
    message.textContent = result.error;
    return;
  }
  const at = new Date(result.due).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  message.textContent = `Okay! I'll remind you at ${at}.`;
});
```

It's the same `async`/`await` you used with `fetch`: the page asks, waits for the main process to answer, then updates.

quiz: Why not just turn on `nodeIntegration` so the page can use Node directly?
- [ ] It's slower
- [x] Any injected script would get full access to the computer; the preload exposes only what's needed
- [ ] Node doesn't work in Chromium
why: Least privilege: the page gets two small functions instead of the power to read files or run programs.

quiz: What does `ipcRenderer.invoke('remind', ...)` return?
- [ ] Nothing
- [x] A promise for the main process's answer
- [ ] The notification
why: invoke sends the message and the promise resolves with whatever `ipcMain.handle` returns.

## Step: System notifications from the main process
kind: read
time: 15

Now the main process handles the `'remind'` message. It **checks the input** (never trust messages from the page, just like form input), waits, and shows a real system notification with Electron's `Notification`:

```js
const { app, BrowserWindow, ipcMain, Notification } = require('electron');

ipcMain.handle('remind', (event, minutes, text) => {
  const delay = Number(minutes);
  const message = String(text ?? '').trim().slice(0, 120) || 'Time is up!';
  if (!Number.isFinite(delay) || delay < 1 || delay > 240) {
    return { ok: false, error: 'Pick from 1 to 240 minutes.' };
  }
  if (!Notification.isSupported()) {
    return { ok: false, error: 'Notifications are not supported on this computer.' };
  }
  const due = Date.now() + delay * 60_000;
  setTimeout(() => {
    new Notification({ title: 'Reminder', body: message }).show();
    event.sender.send('reminder-done', message);
  }, delay * 60_000);
  return { ok: true, due };
});
```

- Whatever `handle` returns becomes the result of the page's `invoke` promise: `{ ok: true, due }` or `{ ok: false, error }`.
- `60_000` is 60,000 milliseconds (one minute); the underscore is just for readability.
- The timer lives in the **main process**, so the reminder still fires if the window is minimized.
- `event.sender.send('reminder-done', message)` sends a message the other way, main to page, so the page can cross the reminder off its list.

The notification looks like any other app's: in the Windows Action Center, or macOS Notification Center. (On Windows, notifications from `npm start` may show "electron.app" as the sender; a packaged app shows its own name.)

quiz: Why does the main process check `minutes` again, even though the input has `min="1"`?
- [x] The main process should never trust messages from the page; a bug or injected script could send anything
- [ ] Number inputs don't work in Electron
- [ ] To make it slower
why: Validate at the boundary: the main process has the power, so it checks every request.

## Session: Shipping it

## Step: Packaging, and what's next
kind: read
time: 12

`npm start` is for development. To give the app to someone, you **package** it into an installer (`.exe` for Windows, `.dmg` for macOS) with a tool like **Electron Forge** or **electron-builder**. For example, with Electron Forge:

```text
npm install --save-dev @electron-forge/cli
npx electron-forge import
npm run make
```

The installer appears in an `out` folder. It bundles Chromium and Node, which is why even a tiny app is large. Installers for Windows and macOS should be **code-signed** so the system trusts them; without signing, Windows SmartScreen and macOS Gatekeeper warn the user.

### The full project

The complete app (`package.json`, `main.js`, `preload.js`, `index.html`, `renderer.js`, `style.css`, `.gitignore` and a README) is at [github.com/TheoYanvno/desktop-reminders](https://github.com/TheoYanvno/desktop-reminders). To run it: clone it, `npm install`, `npm start`.

### Security checklist for every Electron app

| ✅ | Rule |
|---|---|
| ✅ | `contextIsolation: true` and `nodeIntegration: false` (the defaults; never turn them off) |
| ✅ | Expose small, specific functions through the preload, never `ipcRenderer` itself |
| ✅ | A Content Security Policy on every page |
| ✅ | Validate every IPC message in the main process |
| ✅ | Only load your own files, never remote websites, in a window with a preload |

### Next

The **Sticky Notes** guide builds a web app, then its Electron version: one frameless window per note, always on top, with notes saved to a file through the same preload and IPC pattern.

quiz: Why is even a tiny Electron installer large?
- [ ] Electron compresses badly
- [x] Each app includes its own copy of Chromium and Node.js
- [ ] Installers include the source code twice
why: Bundling the engine is what makes one codebase run everywhere, and it costs disk space.

## Finish

You built a real desktop app with web technology. You learned:

- What **Electron** is: **Chromium** for the page plus **Node.js** for the computer
- Setting up a project with **npm**, `package.json` and a **start script**
- The **main process**, **BrowserWindow** and **renderer** processes
- Security: **contextIsolation**, a **preload** with `contextBridge`, a **CSP**, and validating messages
- **IPC** with `invoke` / `handle`, and messages back with `send`
- **System notifications**, and **packaging** with Electron Forge

### Challenges

1. Add a **tray icon** (`Tray`) so the app can hide to the system tray and still remind you.
2. Save reminders to a JSON file with Node's `fs` module in the main process, so they survive a restart.
3. Make the window **always on top** with a checkbox (`win.setAlwaysOnTop(true)`) sent through IPC.
