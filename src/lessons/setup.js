// Built from guides/setup.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "setup",
 "title": "Get set up: the software for these projects",
 "goals": [
  "Install and set up VS Code with the extensions these guides use",
  "Use a browser's developer tools to inspect a page and read errors",
  "Install Git, make a GitHub account and save your work with commits",
  "Install Node.js and Python and check they work from a terminal",
  "Move around folders in a terminal",
  "Build your first page and publish it on GitHub Pages"
 ],
 "prereqs": [
  "A Windows or Mac computer you can install software on",
  "About 1.5 GB of free disk space",
  "No coding experience needed"
 ],
 "sessions": [
  {
   "title": "Your toolkit",
   "from": 0,
   "to": 2
  },
  {
   "title": "Git, Node.js and Python",
   "from": 3,
   "to": 5
  },
  {
   "title": "Your first project",
   "from": 6,
   "to": 8
  }
 ],
 "start": {
  "html": {
   "page": ""
  },
  "css": {
   "base": ""
  }
 },
 "steps": [
  {
   "title": "What you need, and why",
   "body": "Welcome! Before you write any code, you need a few free tools. This first guide installs them, explains what each one is for, and ends with you building a small page and putting it on the internet, so you know everything works. The page you'll build is at [github.com/TheoYanvno/my-first-site](https://github.com/TheoYanvno/my-first-site).\n\n```svg How the tools fit together: you write code in VS Code, the browser runs it, Git saves versions, and GitHub stores them online and publishes your site\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 230\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"230\" fill=\"#ffffff\"/>\n  <rect x=\"20\" y=\"30\" width=\"140\" height=\"64\" rx=\"10\" fill=\"#dbeafe\" stroke=\"#2563eb\"/>\n  <text x=\"90\" y=\"56\" text-anchor=\"middle\" font-weight=\"bold\">VS Code</text><text x=\"90\" y=\"76\" text-anchor=\"middle\">you write code</text>\n  <rect x=\"190\" y=\"30\" width=\"140\" height=\"64\" rx=\"10\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/>\n  <text x=\"260\" y=\"56\" text-anchor=\"middle\" font-weight=\"bold\">Browser</text><text x=\"260\" y=\"76\" text-anchor=\"middle\">runs HTML, CSS, JS</text>\n  <rect x=\"360\" y=\"30\" width=\"140\" height=\"64\" rx=\"10\" fill=\"#dcfce7\" stroke=\"#16a34a\"/>\n  <text x=\"430\" y=\"56\" text-anchor=\"middle\" font-weight=\"bold\">Node / Python</text><text x=\"430\" y=\"76\" text-anchor=\"middle\">run code outside it</text>\n  <rect x=\"20\" y=\"140\" width=\"140\" height=\"64\" rx=\"10\" fill=\"#fce7f3\" stroke=\"#db2777\"/>\n  <text x=\"90\" y=\"166\" text-anchor=\"middle\" font-weight=\"bold\">Git</text><text x=\"90\" y=\"186\" text-anchor=\"middle\">saves versions</text>\n  <rect x=\"190\" y=\"140\" width=\"140\" height=\"64\" rx=\"10\" fill=\"#ede9fe\" stroke=\"#7c3aed\"/>\n  <text x=\"260\" y=\"166\" text-anchor=\"middle\" font-weight=\"bold\">GitHub</text><text x=\"260\" y=\"186\" text-anchor=\"middle\">stores them online</text>\n  <rect x=\"360\" y=\"140\" width=\"140\" height=\"64\" rx=\"10\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/>\n  <text x=\"430\" y=\"166\" text-anchor=\"middle\" font-weight=\"bold\">GitHub Pages</text><text x=\"430\" y=\"186\" text-anchor=\"middle\">your live website</text>\n  <path d=\"M160 62 H186 M330 62 H356 M90 94 V136 M160 172 H186 M330 172 H356\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```\n\n| Tool | What it's for | Cost |\n|---|---|---|\n| **VS Code** | The editor where you write code | Free |\n| **Chrome or Firefox** | Runs your pages, with developer tools to find problems | Free |\n| **Git** | Saves snapshots (commits) of your project so you can undo and share | Free |\n| **GitHub account** | Stores your projects online and hosts websites | Free |\n| **Node.js** | Runs JavaScript outside the browser: tests, tools, desktop apps | Free |\n| **Python** | A second language, used in the Python guide and the blog generator | Free |\n\n> Tip: only download these from their official websites (linked in each step). Sites that offer \"free downloads\" of free software often bundle unwanted extras.",
   "quiz": [
    {
     "q": "Which tool keeps snapshots of your project so you can go back to an earlier version?",
     "options": [
      "VS Code",
      "Git",
      "The browser"
     ],
     "answer": 1,
     "why": "Each Git commit is a saved snapshot; GitHub is where you can store those snapshots online."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 8
  },
  {
   "title": "Install VS Code and its extensions",
   "body": "**Visual Studio Code** (VS Code) is a free code editor from Microsoft and the most popular one for web development. It colors your code so it's easier to read, finishes words for you, shows mistakes as you type, and has a built-in terminal.\n\n### Install it\n\n1. Go to [code.visualstudio.com](https://code.visualstudio.com/) and download it for your system.\n2. **Windows**: run the installer. On the **Select Additional Tasks** screen, tick **Add \"Open with Code\" action** (both boxes) and leave **Add to PATH** ticked. That lets you right-click any folder and open it in VS Code, and type `code .` in a terminal.\n3. **Mac**: open the downloaded file and drag **Visual Studio Code** into **Applications**. Then open VS Code, press `Cmd+Shift+P`, type `shell command` and choose **Install 'code' command in PATH**.\n\n### Recommended extensions\n\nExtensions add features. Click the **Extensions** icon on the left (four squares), search for each name, and click **Install**:\n\n| Extension | Why | Need it? |\n|---|---|---|\n| **Live Server** (Ritwick Dey) | Opens your page in the browser and reloads it every time you save | Yes |\n| **Prettier - Code formatter** | Tidies your code's spacing and line breaks automatically | Yes |\n| **Python** (Microsoft) | Python support: running, errors and suggestions (installs Pylance too) | Yes, for the Python guide |\n| **ESLint** | Points out likely mistakes in JavaScript | Recommended |\n| **Error Lens** | Shows errors right on the line instead of only on hover | Recommended |\n| **GitLens** | Shows who changed each line and when | Later |\n\nDon't install dozens of extensions; each one slows VS Code down a little. These are enough for every guide here.\n\n### Recommended settings\n\nOpen **File → Preferences → Settings** (Mac: **Code → Settings → Settings**) and search for:\n\n- **Format On Save**: tick it, then set **Default Formatter** to Prettier. Your code is tidied every time you save.\n- **Auto Save**: `afterDelay`. Files save themselves, so Live Server always shows your latest code.\n- **Word Wrap**: `on`. Long lines wrap instead of running off the screen.\n- **Font Size**: 15 or 16 is easier on the eyes than the default.\n\n### Shortcuts worth learning first\n\n| Windows | Mac | Does |\n|---|---|---|\n| `Ctrl+S` | `Cmd+S` | Save |\n| `Ctrl+/` | `Cmd+/` | Comment or uncomment the line |\n| ``Ctrl+` `` | ``Ctrl+` `` | Show or hide the terminal |\n| `Ctrl+P` | `Cmd+P` | Open a file by typing its name |\n| `Alt+Up/Down` | `Option+Up/Down` | Move the line up or down |",
   "quiz": [
    {
     "q": "What does the Live Server extension do?",
     "options": [
      "Puts your site on the internet",
      "Opens your page in a browser and reloads it whenever you save",
      "Checks your spelling"
     ],
     "answer": 1,
     "why": "Live Server runs a small web server on your own computer, so you see each change instantly. Publishing is GitHub Pages' job."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 20
  },
  {
   "title": "A browser and its developer tools",
   "body": "You probably have a browser already. For coding, use **Google Chrome** ([google.com/chrome](https://www.google.com/chrome/)) or **Firefox** ([firefox.com](https://www.firefox.com/)); both have excellent **developer tools**. Microsoft Edge has the same tools as Chrome.\n\n### Open the developer tools\n\nPress **F12** (Mac: `Cmd+Option+I`), or right-click anything on a page and choose **Inspect**. The panels you'll use most:\n\n```svg The three developer tools panels you'll use most: Elements to see and edit HTML and CSS, Console for messages and errors, and Network to see every file the page loads\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 200\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"200\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"10\" width=\"500\" height=\"180\" rx=\"8\" fill=\"#1f2937\"/>\n  <rect x=\"10\" y=\"10\" width=\"500\" height=\"32\" rx=\"8\" fill=\"#374151\"/>\n  <rect x=\"20\" y=\"16\" width=\"80\" height=\"22\" rx=\"4\" fill=\"#2563eb\"/><text x=\"60\" y=\"32\" text-anchor=\"middle\" fill=\"#ffffff\">Elements</text>\n  <text x=\"140\" y=\"32\" text-anchor=\"middle\" fill=\"#d1d5db\">Console</text>\n  <text x=\"215\" y=\"32\" text-anchor=\"middle\" fill=\"#d1d5db\">Network</text>\n  <text x=\"30\" y=\"72\" fill=\"#93c5fd\" font-family=\"monospace\">&lt;h1&gt;Hello&lt;/h1&gt;</text>\n  <text x=\"300\" y=\"72\" fill=\"#fca5a5\" font-family=\"monospace\">h1 { color: red; }</text>\n  <text x=\"30\" y=\"110\" fill=\"#d1d5db\">Elements: the page's HTML, and the CSS for whatever you click.</text>\n  <text x=\"30\" y=\"134\" fill=\"#d1d5db\">Console: console.log messages and errors (in red, with line numbers).</text>\n  <text x=\"30\" y=\"158\" fill=\"#d1d5db\">Network: every file the page loaded and whether it worked.</text>\n</svg>\n```\n\n- **Elements**: click the arrow icon, then click anything on the page to see its HTML and the CSS rules styling it. You can edit both live to try ideas (changes disappear on reload).\n- **Console**: messages from `console.log` and every JavaScript error, with a link to the exact line. When something doesn't work, look here first.\n- **Network**: each file the page asked for. A red 404 means a file name or path is wrong.\n\nThere's also a phone icon (**Toggle device toolbar**) that shows how your page looks on a phone.",
   "quiz": [
    {
     "q": "Your button does nothing when clicked. Where do you look first?",
     "options": [
      "The Network panel",
      "The Console, for a red error and its line number",
      "The browser's settings"
     ],
     "answer": 1,
     "why": "A JavaScript error stops the code that follows it, and the Console says what went wrong and where."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Git and a GitHub account",
   "body": "**Git** saves snapshots of your project called **commits**. Each commit records what changed and a message saying why, so you can see your history, undo mistakes and work on any computer. **GitHub** is a website that stores Git projects (called **repositories**, or repos) online. Employers look at GitHub to see what you've built.\n\n```svg Your folder and GitHub: git add and git commit save a snapshot on your computer; git push sends it to GitHub\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 170\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"170\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"20\" width=\"300\" height=\"130\" rx=\"10\" fill=\"#f9fafb\" stroke=\"#9ca3af\"/>\n  <text x=\"24\" y=\"42\" fill=\"#374151\" font-weight=\"bold\">Your computer</text>\n  <rect x=\"24\" y=\"58\" width=\"110\" height=\"70\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/>\n  <text x=\"79\" y=\"88\" text-anchor=\"middle\">your files</text><text x=\"79\" y=\"106\" text-anchor=\"middle\" fill=\"#6b7280\">(edits)</text>\n  <rect x=\"186\" y=\"58\" width=\"110\" height=\"70\" rx=\"8\" fill=\"#fce7f3\" stroke=\"#db2777\"/>\n  <text x=\"241\" y=\"88\" text-anchor=\"middle\">commits</text><text x=\"241\" y=\"106\" text-anchor=\"middle\" fill=\"#6b7280\">(snapshots)</text>\n  <path d=\"M134 93 H182\" stroke=\"#374151\" stroke-width=\"2\"/><text x=\"158\" y=\"84\" text-anchor=\"middle\" font-size=\"11\">add +</text><text x=\"158\" y=\"114\" text-anchor=\"middle\" font-size=\"11\">commit</text>\n  <rect x=\"380\" y=\"45\" width=\"130\" height=\"96\" rx=\"10\" fill=\"#ede9fe\" stroke=\"#7c3aed\"/>\n  <text x=\"445\" y=\"88\" text-anchor=\"middle\" font-weight=\"bold\">GitHub</text><text x=\"445\" y=\"108\" text-anchor=\"middle\">(online copy)</text>\n  <path d=\"M296 93 H376\" stroke=\"#7c3aed\" stroke-width=\"2\"/><text x=\"336\" y=\"84\" text-anchor=\"middle\" font-size=\"12\">git push</text>\n</svg>\n```\n\n### Install Git\n\n- **Windows**: download from [git-scm.com](https://git-scm.com/downloads) and run the installer. The defaults are fine, with two changes: on **Choosing the default editor**, pick **Use Visual Studio Code as Git's default editor**, and on **Adjusting the name of the initial branch**, choose **Override** and type `main`. It also installs **Git Bash**, a terminal.\n- **Mac**: open **Terminal** and type `git --version`. If Git isn't installed, macOS offers to install the developer tools; click **Install**.\n\n### Tell Git who you are\n\nEvery commit is signed with a name and email. Run these once in a terminal (use the email on your GitHub account):\n\n```text\ngit config --global user.name \"Your Name\"\ngit config --global user.email \"you@example.com\"\n```\n\n### Make a GitHub account\n\nSign up at [github.com](https://github.com/). Your username becomes part of your website address (`username.github.io`), so pick something professional, like your name. Turn on **two-factor authentication** in Settings → Password and authentication; GitHub requires it for anyone who pushes code.\n\nThe first time you push, Git opens a browser window to sign in to GitHub. Approve it once and Git remembers you.\n\n### The commands you'll use every day\n\n| Command | Does |\n|---|---|\n| `git status` | Shows what changed since the last commit |\n| `git add .` | Picks every change to go in the next commit |\n| `git commit -m \"Add header\"` | Saves the snapshot with a message |\n| `git push` | Sends your commits to GitHub |\n| `git pull` | Gets commits from GitHub (from another computer, say) |\n\n> Tip: VS Code's **Source Control** panel (the branch icon on the left) does add, commit and push with buttons, if you prefer clicking.",
   "quiz": [
    {
     "q": "What does `git push` do?",
     "options": [
      "Saves a snapshot on your computer",
      "Sends your commits to GitHub",
      "Deletes old commits"
     ],
     "answer": 1,
     "why": "`git commit` saves the snapshot locally; `git push` uploads it to the repository on GitHub."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 20
  },
  {
   "title": "Install Node.js",
   "body": "**Node.js** runs JavaScript outside the browser. You won't need it for the first few guides, but you will for running tests (`npm test`), for tools, and for the Sticky Notes desktop app (Electron is built on Node). It comes with **npm**, which installs code other people have published (packages).\n\n### Install it\n\n1. Go to [nodejs.org](https://nodejs.org/) and download the **LTS** version. LTS means Long Term Support: the stable version, supported for years. Avoid the \"Current\" version while you're learning.\n2. Run the installer with the default options. On Windows, you can leave **Automatically install the necessary tools** unticked.\n\n### Check it works\n\nClose and reopen VS Code (so its terminal sees the new program), open the terminal with ``Ctrl+` ``, and type:\n\n```text\nnode --version\nnpm --version\n```\n\nEach prints a version number like `v22.11.0`. If you see \"not recognized\" or \"command not found\", restart the computer and try again: the installer adds Node to your PATH (the list of places your terminal looks for programs), and some terminals only notice after a restart.",
   "quiz": [
    {
     "q": "Which Node.js version should a beginner install?",
     "options": [
      "The LTS version",
      "The newest \"Current\" version",
      "Any version from a download site"
     ],
     "answer": 0,
     "why": "LTS is the stable release that tools and tutorials expect; Current has the newest features but changes more often."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "Install Python",
   "body": "**Python** is a second programming language, popular for scripts, data, automation and back ends. The Python guide teaches it, and the Bonfire Notes and Marvel guides use it.\n\n### Install it\n\n1. Go to [python.org/downloads](https://www.python.org/downloads/) and download the latest Python 3.\n2. **Windows**: on the first installer screen, tick **Add python.exe to PATH** at the bottom *before* clicking **Install Now**. This is the step people most often miss; without it, the terminal can't find Python.\n3. **Mac**: run the installer. Macs may have an old system Python; always use the `python3` command for the one you installed.\n\n### Check it works\n\nReopen the VS Code terminal and type:\n\n```text\npython --version\n```\n\nOn a Mac, use `python3 --version`. You should see `Python 3.` and some numbers.\n\n> Tip: on Windows, if `python` opens the Microsoft Store instead, Python wasn't added to PATH. Run the installer again, choose **Modify**, and tick **Add Python to environment variables**. The `py` command also works on Windows.\n\n### pip\n\nPython comes with **pip**, Python's version of npm, for installing packages: `pip install requests`. You won't need any packages for the Python guide.",
   "quiz": [
    {
     "q": "What's the checkbox you must tick when installing Python on Windows?",
     "options": [
      "Install for all users",
      "Add python.exe to PATH",
      "Disable path length limit"
     ],
     "answer": 1,
     "why": "Adding Python to PATH is what lets you type `python` in any terminal."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "The terminal and your projects folder",
   "body": "The **terminal** is where you type commands instead of clicking. It looks old-fashioned, but it's fast and every developer uses it. VS Code has one built in (``Ctrl+` ``): on Windows it's PowerShell, on a Mac it's zsh.\n\n```svg Folders are a tree: cd moves you down into a folder, cd .. moves you back up\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 440 190\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"440\" height=\"190\" fill=\"#ffffff\"/>\n  <rect x=\"20\" y=\"20\" width=\"110\" height=\"32\" rx=\"6\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"75\" y=\"41\" text-anchor=\"middle\">Documents</text>\n  <rect x=\"160\" y=\"80\" width=\"110\" height=\"32\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"215\" y=\"101\" text-anchor=\"middle\">Coding</text>\n  <rect x=\"300\" y=\"140\" width=\"120\" height=\"32\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"360\" y=\"161\" text-anchor=\"middle\">my-first-site</text>\n  <path d=\"M75 52 V96 H156 M215 112 V156 H296\" fill=\"none\" stroke=\"#6b7280\" stroke-width=\"2\"/>\n  <text x=\"100\" y=\"130\" fill=\"#2563eb\" font-family=\"monospace\">cd Coding</text>\n  <text x=\"250\" y=\"186\" fill=\"#16a34a\" font-family=\"monospace\">cd my-first-site</text>\n  <text x=\"300\" y=\"60\" fill=\"#6b7280\" font-family=\"monospace\">cd .. = up one</text>\n</svg>\n```\n\n| Command | Does |\n|---|---|\n| `pwd` | Shows which folder you're in |\n| `ls` | Lists what's in this folder (`dir` also works on Windows) |\n| `cd Coding` | Goes into the `Coding` folder |\n| `cd ..` | Goes up one folder |\n| `mkdir my-first-site` | Makes a new folder |\n| `code .` | Opens this folder in VS Code (`.` means \"here\") |\n\n> Tip: press **Tab** to finish folder names, and the **Up arrow** to repeat earlier commands.\n\n### Set up your projects folder\n\nKeep all your projects in one place, like `Documents/Coding`. Then make the folder for your first site:\n\n```text\ncd Documents\nmkdir Coding\ncd Coding\nmkdir my-first-site\ncd my-first-site\ncode .\n```\n\nVS Code opens the empty folder. Click **New File** and make `index.html` and `style.css`.",
   "quiz": [
    {
     "q": "You're in `Coding/my-first-site`. Which command takes you back to `Coding`?",
     "options": [
      "`cd Coding`",
      "`cd ..`",
      "`back`"
     ],
     "answer": 1,
     "why": "`..` always means the folder one level up."
    }
   ],
   "session": 2,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Your first page",
   "body": "Time to write code. Type `!` in the empty `index.html` and press **Tab**: Emmet writes the skeleton of a page for you. Inside `<body>`, add a heading, a paragraph and a list of the tools you just installed. The code view here shows only what's inside `<body>`; See it run adds the rest.\n\nIn `<head>`, add `<link rel=\"stylesheet\" href=\"style.css\">` so the page uses your CSS file. Then in `style.css`, center the content and pick colors.\n\nRight-click `index.html` and choose **Open with Live Server**. Your page opens in the browser. Change a word, save, and watch the browser update by itself. If the styles don't show, check the `<link>` line and that the file is really called `style.css`.\n\nDon't worry about understanding every line yet: the **HTML & CSS basics** guide explains all of it. The goal here is to check your setup works from start to finish.",
   "checks": [
    {
     "pane": "html",
     "label": "a heading",
     "test": "/<h1[^>]*>[^<]+<\\/h1>/",
     "hint": "Add <h1>Hello, world!</h1>"
    },
    {
     "pane": "html",
     "label": "a list of your tools",
     "test": "/<ul>[\\s\\S]*<li>[\\s\\S]*<\\/ul>/",
     "hint": "Add a <ul> with an <li> for each tool"
    },
    {
     "pane": "css",
     "label": "the page is styled",
     "test": "/body\\s*\\{[^}]*(font-family|background)/",
     "hint": "Add a body { } rule with a font or background"
    }
   ],
   "quiz": [
    {
     "q": "What does Live Server do when you save `index.html`?",
     "options": [
      "Uploads it to GitHub",
      "Reloads the page in the browser so you see the change",
      "Nothing until you restart it"
     ],
     "answer": 1,
     "why": "Live Server watches your files and refreshes the browser on every save."
    }
   ],
   "session": 2,
   "minutes": 15,
   "html": {
    "page": "<main class=\"hello\">\n  <h1>Hello, world!</h1>\n  <p>This is my first web page. I built it to check my coding setup works.</p>\n  <h2>My tools</h2>\n  <ul>\n    <li>VS Code, with Live Server and Prettier</li>\n    <li>Chrome and its developer tools</li>\n    <li>Git and GitHub</li>\n    <li>Node.js and Python</li>\n  </ul>\n  <p class=\"next\">Next: the HTML &amp; CSS basics guide.</p>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: linear-gradient(135deg, #1e3a8a, #7c3aed);\n  color: #ffffff;\n}\n\n.hello {\n  max-width: 480px;\n  padding: 32px;\n  background: rgb(255 255 255 / .12);\n  border-radius: 16px;\n}\n\nh1 {\n  margin-top: 0;\n}\n\n.next {\n  opacity: .8;\n}"
   }
  },
  {
   "title": "Put it on GitHub",
   "body": "Last step: save your page with Git and publish it, so it has a real web address you can share.\n\n### 1. Make the first commit\n\nIn VS Code's terminal, inside `my-first-site`:\n\n```text\ngit init\ngit add .\ngit commit -m \"My first page\"\n```\n\n`git init` turns the folder into a Git repository (it adds a hidden `.git` folder; never edit it by hand).\n\n### 2. Make the repository on GitHub\n\nOn github.com, click **+** (top right) → **New repository**. Name it `my-first-site`, choose **Public**, and leave **Add a README** unticked (your folder already has files). Click **Create repository**. GitHub shows commands to connect your folder; run these three:\n\n```text\ngit remote add origin https://github.com/YOUR-NAME/my-first-site.git\ngit branch -M main\ngit push -u origin main\n```\n\nRefresh the GitHub page: your files are there.\n\n### 3. Turn on GitHub Pages\n\nIn the repository: **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, pick **main** and **/ (root)**, and click **Save**. In a minute or two, the Pages screen shows your address: `https://YOUR-NAME.github.io/my-first-site/`. Open it on your phone too.\n\n### Your setup checklist\n\n| | Check |\n|---|---|\n| ✅ | VS Code opens folders, with Live Server and Prettier installed |\n| ✅ | F12 opens the developer tools |\n| ✅ | `git --version`, `node --version` and `python --version` print versions |\n| ✅ | Your first page is live on GitHub Pages |\n\nSee the finished project at [github.com/TheoYanvno/my-first-site](https://github.com/TheoYanvno/my-first-site).",
   "quiz": [
    {
     "q": "After you change your page, which commands publish the change?",
     "options": [
      "`git init` again",
      "`git add .`, `git commit -m \"...\"`, then `git push`",
      "Nothing: GitHub sees your files automatically"
     ],
     "answer": 1,
     "why": "GitHub only gets what you push. Once Pages is on, each push updates the live site."
    }
   ],
   "session": 2,
   "kind": "read",
   "minutes": 15
  }
 ],
 "finish": "Your computer is ready for every guide here, and you've already published a website. You installed and set up:\n\n- **VS Code** with Live Server, Prettier, Python, ESLint and Error Lens\n- A browser and its **developer tools** (Elements, Console, Network)\n- **Git** and a **GitHub** account, and made your first commit and push\n- **Node.js** (LTS) and **Python 3**\n- The **terminal**: `cd`, `ls`, `mkdir`, `code .`\n\n### Challenges\n\n1. Change your first page's colors and words, then publish the update with `git add .`, `git commit -m \"...\"` and `git push`, and watch the live site change.\n2. Add a second page, `about.html`, and link the two pages to each other with `<a href=\"about.html\">`.\n3. Open your project in VS Code's **Source Control** panel and make a commit with the buttons instead of the terminal.\n\n### If something went wrong\n\n- **\"not recognized\" / \"command not found\"**: close every terminal and VS Code, reopen, and try again. Still failing? Restart the computer; the installer's PATH change needs it sometimes.\n- **The push asks for a password**: GitHub doesn't accept account passwords for Git. Let the browser sign-in window open, or install **GitHub Desktop** ([desktop.github.com](https://desktop.github.com/)), which handles sign-in for you.\n- **Pages shows a 404**: wait two minutes, and check the file is called exactly `index.html` (lowercase) in the top of the repository.\n\n### Next\n\nStart the **HTML & CSS basics** guide."
};
