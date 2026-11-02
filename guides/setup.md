---
id: setup
title: Get set up: the software for these projects
blocks-html: page
blocks-css: base
goals: Install and set up VS Code with the extensions these guides use; Use a browser's developer tools to inspect a page and read errors; Install Git, make a GitHub account and save your work with commits; Install Node.js and Python and check they work from a terminal; Move around folders in a terminal; Build your first page and publish it on GitHub Pages
prereqs: A Windows or Mac computer you can install software on; About 1.5 GB of free disk space; No coding experience needed
---

## Session: Your toolkit

## Step: What you need, and why
kind: read
time: 8

Welcome! Before you write any code, you need a few free tools. This first guide installs them, explains what each one is for, and ends with you building a small page and putting it on the internet, so you know everything works. The page you'll build is at [github.com/TheoYanvno/my-first-site](https://github.com/TheoYanvno/my-first-site).

```svg How the tools fit together: you write code in VS Code, the browser runs it, Git saves versions, and GitHub stores them online and publishes your site
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 230" font-family="sans-serif" font-size="13">
  <rect width="520" height="230" fill="#ffffff"/>
  <rect x="20" y="30" width="140" height="64" rx="10" fill="#dbeafe" stroke="#2563eb"/>
  <text x="90" y="56" text-anchor="middle" font-weight="bold">VS Code</text><text x="90" y="76" text-anchor="middle">you write code</text>
  <rect x="190" y="30" width="140" height="64" rx="10" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="260" y="56" text-anchor="middle" font-weight="bold">Browser</text><text x="260" y="76" text-anchor="middle">runs HTML, CSS, JS</text>
  <rect x="360" y="30" width="140" height="64" rx="10" fill="#dcfce7" stroke="#16a34a"/>
  <text x="430" y="56" text-anchor="middle" font-weight="bold">Node / Python</text><text x="430" y="76" text-anchor="middle">run code outside it</text>
  <rect x="20" y="140" width="140" height="64" rx="10" fill="#fce7f3" stroke="#db2777"/>
  <text x="90" y="166" text-anchor="middle" font-weight="bold">Git</text><text x="90" y="186" text-anchor="middle">saves versions</text>
  <rect x="190" y="140" width="140" height="64" rx="10" fill="#ede9fe" stroke="#7c3aed"/>
  <text x="260" y="166" text-anchor="middle" font-weight="bold">GitHub</text><text x="260" y="186" text-anchor="middle">stores them online</text>
  <rect x="360" y="140" width="140" height="64" rx="10" fill="#f3f4f6" stroke="#6b7280"/>
  <text x="430" y="166" text-anchor="middle" font-weight="bold">GitHub Pages</text><text x="430" y="186" text-anchor="middle">your live website</text>
  <path d="M160 62 H186 M330 62 H356 M90 94 V136 M160 172 H186 M330 172 H356" stroke="#374151" stroke-width="2"/>
</svg>
```

| Tool | What it's for | Cost |
|---|---|---|
| **VS Code** | The editor where you write code | Free |
| **Chrome or Firefox** | Runs your pages, with developer tools to find problems | Free |
| **Git** | Saves snapshots (commits) of your project so you can undo and share | Free |
| **GitHub account** | Stores your projects online and hosts websites | Free |
| **Node.js** | Runs JavaScript outside the browser: tests, tools, desktop apps | Free |
| **Python** | A second language, used in the Python guide and the blog generator | Free |

> Tip: only download these from their official websites (linked in each step). Sites that offer "free downloads" of free software often bundle unwanted extras.

quiz: Which tool keeps snapshots of your project so you can go back to an earlier version?
- [ ] VS Code
- [x] Git
- [ ] The browser
why: Each Git commit is a saved snapshot; GitHub is where you can store those snapshots online.

## Step: Install VS Code and its extensions
kind: read
time: 20

**Visual Studio Code** (VS Code) is a free code editor from Microsoft and the most popular one for web development. It colors your code so it's easier to read, finishes words for you, shows mistakes as you type, and has a built-in terminal.

### Install it

1. Go to [code.visualstudio.com](https://code.visualstudio.com/) and download it for your system.
2. **Windows**: run the installer. On the **Select Additional Tasks** screen, tick **Add "Open with Code" action** (both boxes) and leave **Add to PATH** ticked. That lets you right-click any folder and open it in VS Code, and type `code .` in a terminal.
3. **Mac**: open the downloaded file and drag **Visual Studio Code** into **Applications**. Then open VS Code, press `Cmd+Shift+P`, type `shell command` and choose **Install 'code' command in PATH**.

### Recommended extensions

Extensions add features. Click the **Extensions** icon on the left (four squares), search for each name, and click **Install**:

| Extension | Why | Need it? |
|---|---|---|
| **Live Server** (Ritwick Dey) | Opens your page in the browser and reloads it every time you save | Yes |
| **Prettier - Code formatter** | Tidies your code's spacing and line breaks automatically | Yes |
| **Python** (Microsoft) | Python support: running, errors and suggestions (installs Pylance too) | Yes, for the Python guide |
| **ESLint** | Points out likely mistakes in JavaScript | Recommended |
| **Error Lens** | Shows errors right on the line instead of only on hover | Recommended |
| **GitLens** | Shows who changed each line and when | Later |

Don't install dozens of extensions; each one slows VS Code down a little. These are enough for every guide here.

### Recommended settings

Open **File → Preferences → Settings** (Mac: **Code → Settings → Settings**) and search for:

- **Format On Save**: tick it, then set **Default Formatter** to Prettier. Your code is tidied every time you save.
- **Auto Save**: `afterDelay`. Files save themselves, so Live Server always shows your latest code.
- **Word Wrap**: `on`. Long lines wrap instead of running off the screen.
- **Font Size**: 15 or 16 is easier on the eyes than the default.

### Shortcuts worth learning first

| Windows | Mac | Does |
|---|---|---|
| `Ctrl+S` | `Cmd+S` | Save |
| `Ctrl+/` | `Cmd+/` | Comment or uncomment the line |
| ``Ctrl+` `` | ``Ctrl+` `` | Show or hide the terminal |
| `Ctrl+P` | `Cmd+P` | Open a file by typing its name |
| `Alt+Up/Down` | `Option+Up/Down` | Move the line up or down |

quiz: What does the Live Server extension do?
- [ ] Puts your site on the internet
- [x] Opens your page in a browser and reloads it whenever you save
- [ ] Checks your spelling
why: Live Server runs a small web server on your own computer, so you see each change instantly. Publishing is GitHub Pages' job.

## Step: A browser and its developer tools
kind: read
time: 12

You probably have a browser already. For coding, use **Google Chrome** ([google.com/chrome](https://www.google.com/chrome/)) or **Firefox** ([firefox.com](https://www.firefox.com/)); both have excellent **developer tools**. Microsoft Edge has the same tools as Chrome.

### Open the developer tools

Press **F12** (Mac: `Cmd+Option+I`), or right-click anything on a page and choose **Inspect**. The panels you'll use most:

```svg The three developer tools panels you'll use most: Elements to see and edit HTML and CSS, Console for messages and errors, and Network to see every file the page loads
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 200" font-family="sans-serif" font-size="13">
  <rect width="520" height="200" fill="#ffffff"/>
  <rect x="10" y="10" width="500" height="180" rx="8" fill="#1f2937"/>
  <rect x="10" y="10" width="500" height="32" rx="8" fill="#374151"/>
  <rect x="20" y="16" width="80" height="22" rx="4" fill="#2563eb"/><text x="60" y="32" text-anchor="middle" fill="#ffffff">Elements</text>
  <text x="140" y="32" text-anchor="middle" fill="#d1d5db">Console</text>
  <text x="215" y="32" text-anchor="middle" fill="#d1d5db">Network</text>
  <text x="30" y="72" fill="#93c5fd" font-family="monospace">&lt;h1&gt;Hello&lt;/h1&gt;</text>
  <text x="300" y="72" fill="#fca5a5" font-family="monospace">h1 { color: red; }</text>
  <text x="30" y="110" fill="#d1d5db">Elements: the page's HTML, and the CSS for whatever you click.</text>
  <text x="30" y="134" fill="#d1d5db">Console: console.log messages and errors (in red, with line numbers).</text>
  <text x="30" y="158" fill="#d1d5db">Network: every file the page loaded and whether it worked.</text>
</svg>
```

- **Elements**: click the arrow icon, then click anything on the page to see its HTML and the CSS rules styling it. You can edit both live to try ideas (changes disappear on reload).
- **Console**: messages from `console.log` and every JavaScript error, with a link to the exact line. When something doesn't work, look here first.
- **Network**: each file the page asked for. A red 404 means a file name or path is wrong.

There's also a phone icon (**Toggle device toolbar**) that shows how your page looks on a phone.

quiz: Your button does nothing when clicked. Where do you look first?
- [ ] The Network panel
- [x] The Console, for a red error and its line number
- [ ] The browser's settings
why: A JavaScript error stops the code that follows it, and the Console says what went wrong and where.

## Session: Git, Node.js and Python

## Step: Git and a GitHub account
kind: read
time: 20

**Git** saves snapshots of your project called **commits**. Each commit records what changed and a message saying why, so you can see your history, undo mistakes and work on any computer. **GitHub** is a website that stores Git projects (called **repositories**, or repos) online. Employers look at GitHub to see what you've built.

```svg Your folder and GitHub: git add and git commit save a snapshot on your computer; git push sends it to GitHub
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 170" font-family="sans-serif" font-size="13">
  <rect width="520" height="170" fill="#ffffff"/>
  <rect x="10" y="20" width="300" height="130" rx="10" fill="#f9fafb" stroke="#9ca3af"/>
  <text x="24" y="42" fill="#374151" font-weight="bold">Your computer</text>
  <rect x="24" y="58" width="110" height="70" rx="8" fill="#dbeafe" stroke="#2563eb"/>
  <text x="79" y="88" text-anchor="middle">your files</text><text x="79" y="106" text-anchor="middle" fill="#6b7280">(edits)</text>
  <rect x="186" y="58" width="110" height="70" rx="8" fill="#fce7f3" stroke="#db2777"/>
  <text x="241" y="88" text-anchor="middle">commits</text><text x="241" y="106" text-anchor="middle" fill="#6b7280">(snapshots)</text>
  <path d="M134 93 H182" stroke="#374151" stroke-width="2"/><text x="158" y="84" text-anchor="middle" font-size="11">add +</text><text x="158" y="114" text-anchor="middle" font-size="11">commit</text>
  <rect x="380" y="45" width="130" height="96" rx="10" fill="#ede9fe" stroke="#7c3aed"/>
  <text x="445" y="88" text-anchor="middle" font-weight="bold">GitHub</text><text x="445" y="108" text-anchor="middle">(online copy)</text>
  <path d="M296 93 H376" stroke="#7c3aed" stroke-width="2"/><text x="336" y="84" text-anchor="middle" font-size="12">git push</text>
</svg>
```

### Install Git

- **Windows**: download from [git-scm.com](https://git-scm.com/downloads) and run the installer. The defaults are fine, with two changes: on **Choosing the default editor**, pick **Use Visual Studio Code as Git's default editor**, and on **Adjusting the name of the initial branch**, choose **Override** and type `main`. It also installs **Git Bash**, a terminal.
- **Mac**: open **Terminal** and type `git --version`. If Git isn't installed, macOS offers to install the developer tools; click **Install**.

### Tell Git who you are

Every commit is signed with a name and email. Run these once in a terminal (use the email on your GitHub account):

```text
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### Make a GitHub account

Sign up at [github.com](https://github.com/). Your username becomes part of your website address (`username.github.io`), so pick something professional, like your name. Turn on **two-factor authentication** in Settings → Password and authentication; GitHub requires it for anyone who pushes code.

The first time you push, Git opens a browser window to sign in to GitHub. Approve it once and Git remembers you.

### The commands you'll use every day

| Command | Does |
|---|---|
| `git status` | Shows what changed since the last commit |
| `git add .` | Picks every change to go in the next commit |
| `git commit -m "Add header"` | Saves the snapshot with a message |
| `git push` | Sends your commits to GitHub |
| `git pull` | Gets commits from GitHub (from another computer, say) |

> Tip: VS Code's **Source Control** panel (the branch icon on the left) does add, commit and push with buttons, if you prefer clicking.

quiz: What does `git push` do?
- [ ] Saves a snapshot on your computer
- [x] Sends your commits to GitHub
- [ ] Deletes old commits
why: `git commit` saves the snapshot locally; `git push` uploads it to the repository on GitHub.

## Step: Install Node.js
kind: read
time: 10

**Node.js** runs JavaScript outside the browser. You won't need it for the first few guides, but you will for running tests (`npm test`), for tools, and for the Sticky Notes desktop app (Electron is built on Node). It comes with **npm**, which installs code other people have published (packages).

### Install it

1. Go to [nodejs.org](https://nodejs.org/) and download the **LTS** version. LTS means Long Term Support: the stable version, supported for years. Avoid the "Current" version while you're learning.
2. Run the installer with the default options. On Windows, you can leave **Automatically install the necessary tools** unticked.

### Check it works

Close and reopen VS Code (so its terminal sees the new program), open the terminal with ``Ctrl+` ``, and type:

```text
node --version
npm --version
```

Each prints a version number like `v22.11.0`. If you see "not recognized" or "command not found", restart the computer and try again: the installer adds Node to your PATH (the list of places your terminal looks for programs), and some terminals only notice after a restart.

quiz: Which Node.js version should a beginner install?
- [x] The LTS version
- [ ] The newest "Current" version
- [ ] Any version from a download site
why: LTS is the stable release that tools and tutorials expect; Current has the newest features but changes more often.

## Step: Install Python
kind: read
time: 12

**Python** is a second programming language, popular for scripts, data, automation and back ends. The Python guide teaches it, and the Bonfire Notes and Marvel guides use it.

### Install it

1. Go to [python.org/downloads](https://www.python.org/downloads/) and download the latest Python 3.
2. **Windows**: on the first installer screen, tick **Add python.exe to PATH** at the bottom *before* clicking **Install Now**. This is the step people most often miss; without it, the terminal can't find Python.
3. **Mac**: run the installer. Macs may have an old system Python; always use the `python3` command for the one you installed.

### Check it works

Reopen the VS Code terminal and type:

```text
python --version
```

On a Mac, use `python3 --version`. You should see `Python 3.` and some numbers.

> Tip: on Windows, if `python` opens the Microsoft Store instead, Python wasn't added to PATH. Run the installer again, choose **Modify**, and tick **Add Python to environment variables**. The `py` command also works on Windows.

### pip

Python comes with **pip**, Python's version of npm, for installing packages: `pip install requests`. You won't need any packages for the Python guide.

quiz: What's the checkbox you must tick when installing Python on Windows?
- [ ] Install for all users
- [x] Add python.exe to PATH
- [ ] Disable path length limit
why: Adding Python to PATH is what lets you type `python` in any terminal.

## Session: Your first project

## Step: The terminal and your projects folder
kind: read
time: 12

The **terminal** is where you type commands instead of clicking. It looks old-fashioned, but it's fast and every developer uses it. VS Code has one built in (``Ctrl+` ``): on Windows it's PowerShell, on a Mac it's zsh.

```svg Folders are a tree: cd moves you down into a folder, cd .. moves you back up
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 190" font-family="sans-serif" font-size="13">
  <rect width="440" height="190" fill="#ffffff"/>
  <rect x="20" y="20" width="110" height="32" rx="6" fill="#f3f4f6" stroke="#6b7280"/><text x="75" y="41" text-anchor="middle">Documents</text>
  <rect x="160" y="80" width="110" height="32" rx="6" fill="#dbeafe" stroke="#2563eb"/><text x="215" y="101" text-anchor="middle">Coding</text>
  <rect x="300" y="140" width="120" height="32" rx="6" fill="#dcfce7" stroke="#16a34a"/><text x="360" y="161" text-anchor="middle">my-first-site</text>
  <path d="M75 52 V96 H156 M215 112 V156 H296" fill="none" stroke="#6b7280" stroke-width="2"/>
  <text x="100" y="130" fill="#2563eb" font-family="monospace">cd Coding</text>
  <text x="250" y="186" fill="#16a34a" font-family="monospace">cd my-first-site</text>
  <text x="300" y="60" fill="#6b7280" font-family="monospace">cd .. = up one</text>
</svg>
```

| Command | Does |
|---|---|
| `pwd` | Shows which folder you're in |
| `ls` | Lists what's in this folder (`dir` also works on Windows) |
| `cd Coding` | Goes into the `Coding` folder |
| `cd ..` | Goes up one folder |
| `mkdir my-first-site` | Makes a new folder |
| `code .` | Opens this folder in VS Code (`.` means "here") |

> Tip: press **Tab** to finish folder names, and the **Up arrow** to repeat earlier commands.

### Set up your projects folder

Keep all your projects in one place, like `Documents/Coding`. Then make the folder for your first site:

```text
cd Documents
mkdir Coding
cd Coding
mkdir my-first-site
cd my-first-site
code .
```

VS Code opens the empty folder. Click **New File** and make `index.html` and `style.css`.

quiz: You're in `Coding/my-first-site`. Which command takes you back to `Coding`?
- [ ] `cd Coding`
- [x] `cd ..`
- [ ] `back`
why: `..` always means the folder one level up.

## Step: Your first page
time: 15

Time to write code. Type `!` in the empty `index.html` and press **Tab**: Emmet writes the skeleton of a page for you. Inside `<body>`, add a heading, a paragraph and a list of the tools you just installed. The code view here shows only what's inside `<body>`; See it run adds the rest.

In `<head>`, add `<link rel="stylesheet" href="style.css">` so the page uses your CSS file. Then in `style.css`, center the content and pick colors.

Right-click `index.html` and choose **Open with Live Server**. Your page opens in the browser. Change a word, save, and watch the browser update by itself. If the styles don't show, check the `<link>` line and that the file is really called `style.css`.

Don't worry about understanding every line yet: the **HTML & CSS basics** guide explains all of it. The goal here is to check your setup works from start to finish.

check: html | a heading | /<h1[^>]*>[^<]+<\/h1>/ | Add <h1>Hello, world!</h1>
check: html | a list of your tools | /<ul>[\s\S]*<li>[\s\S]*<\/ul>/ | Add a <ul> with an <li> for each tool
check: css | the page is styled | /body\s*\{[^}]*(font-family|background)/ | Add a body { } rule with a font or background

quiz: What does Live Server do when you save `index.html`?
- [ ] Uploads it to GitHub
- [x] Reloads the page in the browser so you see the change
- [ ] Nothing until you restart it
why: Live Server watches your files and refreshes the browser on every save.

```html page
<main class="hello">
  <h1>Hello, world!</h1>
  <p>This is my first web page. I built it to check my coding setup works.</p>
  <h2>My tools</h2>
  <ul>
    <li>VS Code, with Live Server and Prettier</li>
    <li>Chrome and its developer tools</li>
    <li>Git and GitHub</li>
    <li>Node.js and Python</li>
  </ul>
  <p class="next">Next: the HTML &amp; CSS basics guide.</p>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: linear-gradient(135deg, #1e3a8a, #7c3aed);
  color: #ffffff;
}

.hello {
  max-width: 480px;
  padding: 32px;
  background: rgb(255 255 255 / .12);
  border-radius: 16px;
}

h1 {
  margin-top: 0;
}

.next {
  opacity: .8;
}
```

## Step: Put it on GitHub
kind: read
time: 15

Last step: save your page with Git and publish it, so it has a real web address you can share.

### 1. Make the first commit

In VS Code's terminal, inside `my-first-site`:

```text
git init
git add .
git commit -m "My first page"
```

`git init` turns the folder into a Git repository (it adds a hidden `.git` folder; never edit it by hand).

### 2. Make the repository on GitHub

On github.com, click **+** (top right) → **New repository**. Name it `my-first-site`, choose **Public**, and leave **Add a README** unticked (your folder already has files). Click **Create repository**. GitHub shows commands to connect your folder; run these three:

```text
git remote add origin https://github.com/YOUR-NAME/my-first-site.git
git branch -M main
git push -u origin main
```

Refresh the GitHub page: your files are there.

### 3. Turn on GitHub Pages

In the repository: **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, pick **main** and **/ (root)**, and click **Save**. In a minute or two, the Pages screen shows your address: `https://YOUR-NAME.github.io/my-first-site/`. Open it on your phone too.

### Your setup checklist

| | Check |
|---|---|
| ✅ | VS Code opens folders, with Live Server and Prettier installed |
| ✅ | F12 opens the developer tools |
| ✅ | `git --version`, `node --version` and `python --version` print versions |
| ✅ | Your first page is live on GitHub Pages |

See the finished project at [github.com/TheoYanvno/my-first-site](https://github.com/TheoYanvno/my-first-site).

quiz: After you change your page, which commands publish the change?
- [ ] `git init` again
- [x] `git add .`, `git commit -m "..."`, then `git push`
- [ ] Nothing: GitHub sees your files automatically
why: GitHub only gets what you push. Once Pages is on, each push updates the live site.

## Finish

Your computer is ready for every guide here, and you've already published a website. You installed and set up:

- **VS Code** with Live Server, Prettier, Python, ESLint and Error Lens
- A browser and its **developer tools** (Elements, Console, Network)
- **Git** and a **GitHub** account, and made your first commit and push
- **Node.js** (LTS) and **Python 3**
- The **terminal**: `cd`, `ls`, `mkdir`, `code .`

### Challenges

1. Change your first page's colors and words, then publish the update with `git add .`, `git commit -m "..."` and `git push`, and watch the live site change.
2. Add a second page, `about.html`, and link the two pages to each other with `<a href="about.html">`.
3. Open your project in VS Code's **Source Control** panel and make a commit with the buttons instead of the terminal.

### If something went wrong

- **"not recognized" / "command not found"**: close every terminal and VS Code, reopen, and try again. Still failing? Restart the computer; the installer's PATH change needs it sometimes.
- **The push asks for a password**: GitHub doesn't accept account passwords for Git. Let the browser sign-in window open, or install **GitHub Desktop** ([desktop.github.com](https://desktop.github.com/)), which handles sign-in for you.
- **Pages shows a 404**: wait two minutes, and check the file is called exactly `index.html` (lowercase) in the top of the repository.

### Next

Start the **HTML & CSS basics** guide.
