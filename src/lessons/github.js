// Built from guides/github.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "github",
 "title": "GitHub from zero: account to pull request",
 "goals": [
  "Explain what Git and GitHub are and how a local repository and GitHub work together",
  "Make a GitHub account and protect it with two-factor authentication",
  "Set up a profile that shows your work to employers",
  "Create, clone and commit to a repository, and write good commit messages",
  "Push your commits and pull other people's, and sign in to GitHub from the terminal",
  "Work on a branch, open and merge a pull request, and fix common mistakes"
 ],
 "prereqs": [
  "The Get set up guide (Git and VS Code installed)",
  "No experience with Git needed"
 ],
 "sessions": [
  {
   "title": "Your GitHub account",
   "from": 0,
   "to": 2
  },
  {
   "title": "Repositories and commits",
   "from": 3,
   "to": 5
  },
  {
   "title": "Working like a team",
   "from": 6,
   "to": 7
  },
  {
   "title": "Publish and keep going",
   "from": 8,
   "to": 8
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "Git and GitHub: what they are",
   "body": "**Git** is a program on your computer that keeps the history of a project. Every time you reach a point worth keeping, you make a **commit**: a snapshot of all your files, with a message saying what changed and why. You can look back at any commit, compare versions, and undo mistakes.\n\n**GitHub** is a website that stores Git projects online. A project on GitHub is a **repository** (or **repo**). GitHub adds what Git alone doesn't have: a backup in the cloud, a web page for every project, a way for other people to suggest changes (pull requests), free hosting for websites (GitHub Pages), and a public profile that shows what you've built. Employers look at GitHub profiles.\n\nIn this guide you'll make an account and build a **learning log**: a repository of short notes about what you learn, built commit by commit the way real projects are. See the finished one at [github.com/TheoYanvno/learning-log](https://github.com/TheoYanvno/learning-log).\n\n```svg Your computer and GitHub: you commit snapshots on your computer, push them up to GitHub, and pull other people's commits down\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 200\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"200\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"20\" width=\"220\" height=\"160\" rx=\"12\" fill=\"#eff6ff\" stroke=\"#2563eb\"/>\n  <text x=\"120\" y=\"44\" text-anchor=\"middle\" font-weight=\"bold\">Your computer</text>\n  <text x=\"120\" y=\"62\" text-anchor=\"middle\" fill=\"#475569\">the local repository</text>\n  <circle cx=\"50\" cy=\"110\" r=\"12\" fill=\"#2563eb\"/><circle cx=\"100\" cy=\"110\" r=\"12\" fill=\"#2563eb\"/><circle cx=\"150\" cy=\"110\" r=\"12\" fill=\"#2563eb\"/><circle cx=\"200\" cy=\"110\" r=\"12\" fill=\"#7c3aed\"/>\n  <path d=\"M62 110 H88 M112 110 H138 M162 110 H188\" stroke=\"#2563eb\" stroke-width=\"3\"/>\n  <text x=\"120\" y=\"150\" text-anchor=\"middle\" fill=\"#475569\">each dot is a commit</text>\n  <rect x=\"290\" y=\"20\" width=\"220\" height=\"160\" rx=\"12\" fill=\"#f5f3ff\" stroke=\"#7c3aed\"/>\n  <text x=\"400\" y=\"44\" text-anchor=\"middle\" font-weight=\"bold\">GitHub</text>\n  <text x=\"400\" y=\"62\" text-anchor=\"middle\" fill=\"#475569\">the remote (\"origin\")</text>\n  <circle cx=\"330\" cy=\"110\" r=\"12\" fill=\"#2563eb\"/><circle cx=\"380\" cy=\"110\" r=\"12\" fill=\"#2563eb\"/><circle cx=\"430\" cy=\"110\" r=\"12\" fill=\"#2563eb\"/>\n  <path d=\"M342 110 H368 M392 110 H418\" stroke=\"#2563eb\" stroke-width=\"3\"/>\n  <path d=\"M232 92 H286\" stroke=\"#7c3aed\" stroke-width=\"2.5\"/><path d=\"M278 86 L288 92 L278 98\" fill=\"none\" stroke=\"#7c3aed\" stroke-width=\"2.5\"/>\n  <text x=\"260\" y=\"84\" text-anchor=\"middle\" font-size=\"12\">git push</text>\n  <path d=\"M288 132 H234\" stroke=\"#16a34a\" stroke-width=\"2.5\"/><path d=\"M242 126 L232 132 L242 138\" fill=\"none\" stroke=\"#16a34a\" stroke-width=\"2.5\"/>\n  <text x=\"260\" y=\"152\" text-anchor=\"middle\" font-size=\"12\">git pull</text>\n</svg>\n```\n\n| Word | Means |\n|---|---|\n| **Repository (repo)** | A project folder whose history Git tracks |\n| **Commit** | A saved snapshot, with a message |\n| **Remote** | The copy of the repo somewhere else, usually GitHub; its usual name is `origin` |\n| **Push** | Send your new commits to the remote |\n| **Pull** | Get new commits from the remote |\n| **Branch** | A separate line of commits, for working on something without disturbing the main one |",
   "quiz": [
    {
     "q": "What's the difference between Git and GitHub?",
     "options": [
      "They're the same thing",
      "Git tracks history on your computer; GitHub is a website that stores repositories online and adds sharing features",
      "GitHub is only for companies"
     ],
     "answer": 1,
     "why": "You can use Git with no internet at all; GitHub is where you share and back up what Git records."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 10
  },
  {
   "title": "Make your account and secure it",
   "body": "### Sign up\n\n1. Go to [github.com/signup](https://github.com/signup).\n2. Enter your **email**. Use one you'll keep for years; you can add a work or school email later.\n3. Make a **password**: long and unique, ideally from a password manager. GitHub checks it against known leaked passwords.\n4. Choose a **username**. It becomes your address (`github.com/username`) and your website (`username.github.io`), so make it professional: your name or close to it, like `anthony-evo` or `AnthonyEvo`. Avoid jokes and birth years; you'll put this on your resume.\n5. Solve the verification puzzle, then type the code GitHub emails you.\n6. Pick the **Free** plan. It includes unlimited public and private repositories.\n\n### Turn on two-factor authentication (2FA)\n\nGitHub requires 2FA for everyone who contributes code, and it protects your work if your password ever leaks. Open your picture (top right) → **Settings** → **Password and authentication** → **Enable two-factor authentication**:\n\n- Use an **authenticator app** (Microsoft Authenticator, Google Authenticator, 1Password and others): scan the QR code and type the 6-digit code it shows.\n- **Download your recovery codes** and keep them somewhere safe and offline (printed, or in your password manager). If you lose your phone, they're the only way back in.\n- Add a **passkey** too if your phone or computer offers one: it lets you sign in with your fingerprint or face.\n\n```svg Two-factor authentication: signing in needs something you know (your password) and something you have (the code on your phone)\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 150\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"150\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"40\" width=\"140\" height=\"70\" rx=\"10\" fill=\"#eff6ff\" stroke=\"#2563eb\"/>\n  <text x=\"80\" y=\"70\" text-anchor=\"middle\" font-weight=\"bold\">Password</text><text x=\"80\" y=\"90\" text-anchor=\"middle\" fill=\"#475569\">something you know</text>\n  <text x=\"180\" y=\"80\" text-anchor=\"middle\" font-size=\"22\">+</text>\n  <rect x=\"210\" y=\"40\" width=\"140\" height=\"70\" rx=\"10\" fill=\"#f0fdf4\" stroke=\"#16a34a\"/>\n  <text x=\"280\" y=\"70\" text-anchor=\"middle\" font-weight=\"bold\">Code: 482 913</text><text x=\"280\" y=\"90\" text-anchor=\"middle\" fill=\"#475569\">something you have</text>\n  <path d=\"M352 75 H396\" stroke=\"#374151\" stroke-width=\"2\"/><path d=\"M388 69 L398 75 L388 81\" fill=\"none\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <rect x=\"400\" y=\"40\" width=\"110\" height=\"70\" rx=\"10\" fill=\"#f5f3ff\" stroke=\"#7c3aed\"/>\n  <text x=\"455\" y=\"80\" text-anchor=\"middle\" font-weight=\"bold\">Signed in</text>\n  <text x=\"260\" y=\"138\" text-anchor=\"middle\" fill=\"#6b7280\">A stolen password alone isn't enough to get into your account.</text>\n</svg>\n```\n\n> Tip: GitHub will never ask for your password or 2FA code in an email, a message or a phone call. Only type them on github.com.",
   "quiz": [
    {
     "q": "Why should you save your 2FA recovery codes?",
     "options": [
      "They make sign-in faster",
      "They're the way back into your account if you lose the phone with your authenticator app",
      "GitHub requires you to email them in"
     ],
     "answer": 1,
     "why": "Without your phone or the recovery codes, you can be locked out of your own account."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "A profile employers want to see",
   "body": "Your profile at `github.com/username` is often the first thing a hiring manager opens. Make it look cared for:\n\n1. **Picture and name:** a clear, friendly photo, and your real name. Settings → **Public profile**.\n2. **Bio:** one line, like \"Navy veteran and medical assistant learning full-stack development.\"\n3. **Location and links:** your city, a portfolio site, LinkedIn.\n4. **A profile README:** make a **public repository named exactly your username**. GitHub shows its `README.md` at the top of your profile, so it's where you introduce yourself, list your skills and link your best projects. It's written in **Markdown** (`#` headings, `-` lists, `[text](link)`, `**bold**`).\n5. **Pinned repositories:** on your profile, click **Customize your pins** and choose up to six projects to show first. Pin finished projects with good READMEs and live demos.\n\n### Every project needs a README\n\nA repository's `README.md` is its front page. A good one says what the project is, shows a screenshot or a live link, explains how to run it, and lists what it's built with. Projects without READMEs look abandoned, even when the code is great.\n\n### The contribution graph\n\nThe green squares on your profile show the days you made commits. Steady commits over weeks tell a story of consistent work, but it's the projects themselves that matter, not the color of the squares.",
   "quiz": [
    {
     "q": "How do you make a README that appears on your profile page?",
     "options": [
      "Put it in your account settings",
      "Create a public repository with exactly the same name as your username and add a README.md",
      "Pin any repository"
     ],
     "answer": 1,
     "why": "That special repository's README is shown at the top of your profile."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Create a repository and clone it",
   "body": "### On GitHub\n\nClick **+** (top right) → **New repository**:\n\n| Field | What to choose |\n|---|---|\n| **Repository name** | Short, lowercase, words joined by dashes: `learning-log` |\n| **Description** | One sentence; it shows in search and on your profile |\n| **Public / Private** | Public for portfolio work (anyone can see it); private for anything personal |\n| **Add a README** | On, when you're starting fresh, so the repo isn't empty |\n| **.gitignore** | A template that tells Git which files never to commit (for Node, Python…) |\n| **License** | MIT is a common choice for portfolio projects: anyone may use your code if they keep your name on it |\n\nClick **Create repository**.\n\n### Clone it to your computer\n\n**Cloning** downloads the repository with its whole history and connects it to GitHub (as `origin`). On the repo's page, click the green **Code** button and copy the **HTTPS** address. Then, in your `Coding` folder:\n\n```text\ngit clone https://github.com/YOUR-NAME/learning-log.git\ncd learning-log\ncode .\n```\n\nThe folder has a hidden `.git` folder inside: that's the history. **Never edit or delete it by hand.**\n\n### Already have a folder?\n\nIf you made the project on your computer first (like your first site in Get set up), create the repository on GitHub **without** a README, then connect your folder with the commands GitHub shows: `git remote add origin ...`, `git branch -M main`, `git push -u origin main`.",
   "quiz": [
    {
     "q": "What does `git clone` do?",
     "options": [
      "Downloads a repository with its full history and connects it to the remote",
      "Copies only the newest files",
      "Creates a new empty repository on GitHub"
     ],
     "answer": 0,
     "why": "A clone is a complete copy, already linked to `origin`, so you can pull and push right away."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "The commit cycle",
   "body": "Every change goes through three places:\n\n```svg The commit cycle: edit files in your working folder, git add moves changes to the staging area, git commit saves them as a snapshot in the history\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 170\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"170\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"40\" width=\"140\" height=\"80\" rx=\"10\" fill=\"#fff7ed\" stroke=\"#ea580c\"/>\n  <text x=\"80\" y=\"70\" text-anchor=\"middle\" font-weight=\"bold\">Working folder</text><text x=\"80\" y=\"92\" text-anchor=\"middle\" fill=\"#475569\">you edit files</text>\n  <rect x=\"190\" y=\"40\" width=\"140\" height=\"80\" rx=\"10\" fill=\"#eff6ff\" stroke=\"#2563eb\"/>\n  <text x=\"260\" y=\"70\" text-anchor=\"middle\" font-weight=\"bold\">Staging area</text><text x=\"260\" y=\"92\" text-anchor=\"middle\" fill=\"#475569\">what goes in next</text>\n  <rect x=\"370\" y=\"40\" width=\"140\" height=\"80\" rx=\"10\" fill=\"#f0fdf4\" stroke=\"#16a34a\"/>\n  <text x=\"440\" y=\"70\" text-anchor=\"middle\" font-weight=\"bold\">History</text><text x=\"440\" y=\"92\" text-anchor=\"middle\" fill=\"#475569\">commits</text>\n  <path d=\"M150 80 H186 M330 80 H366\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"168\" y=\"70\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"11\">git add</text>\n  <text x=\"348\" y=\"70\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"11\">commit</text>\n  <text x=\"260\" y=\"152\" text-anchor=\"middle\" fill=\"#6b7280\">git status shows what's changed and what's staged at any moment.</text>\n</svg>\n```\n\nTry it in `learning-log`. Make a folder `notes` with a file `2026-11-02.md` (today's date), and write what you learned:\n\n```markdown\n# November 2, 2026\n\n- Git saves snapshots called commits; GitHub stores them online.\n- `git status` shows what changed. `git add` picks changes, `git commit` saves them.\n```\n\nThen:\n\n```text\ngit status\ngit add notes/2026-11-02.md\ngit commit -m \"Add notes on how commits work\"\ngit log --oneline\n```\n\n- `git status` lists changed files in red (not staged) and green (staged).\n- `git add <file>` stages one file; `git add .` stages everything that changed.\n- `git commit -m \"...\"` saves the staged changes with a message.\n- `git log --oneline` shows the history, newest first.\n\n### Why a staging area?\n\nYou often change several things at once. Staging lets you commit them separately: one commit for the notes, another for a README fix, so each commit does **one thing** and is easy to understand or undo later.\n\n### Writing good commit messages\n\nA commit message tells future-you (and employers reading your history) what changed and why. Write it as a short command in the present tense:\n\n| Weak | Better |\n|---|---|\n| `stuff` | `Add notes on how commits work` |\n| `fixed it` | `Fix the broken link to my portfolio` |\n| `changes` | `Group notes by month in the README` |\n\n### Tell Git who you are (once)\n\nIf you haven't yet, set the name and email that sign your commits. Use the email on your GitHub account so the commits link to your profile:\n\n```text\ngit config --global user.name \"Your Name\"\ngit config --global user.email \"you@example.com\"\n```\n\n> Tip: if you'd rather keep your email private, GitHub gives you a no-reply address under Settings → **Emails**; use that one instead.",
   "quiz": [
    {
     "q": "You changed `README.md` and `notes/today.md`, but only want to commit the notes. What do you run?",
     "options": [
      "`git commit -m \"Notes\"`",
      "`git add notes/today.md`, then `git commit -m \"Add today's notes\"`",
      "`git push notes/today.md`"
     ],
     "answer": 1,
     "why": "Only staged changes go into a commit, so you stage just the notes file."
    },
    {
     "q": "Which commit message is the most useful?",
     "options": [
      "`update`",
      "`asdf`",
      "`Add notes on branches and pull requests`"
     ],
     "answer": 2,
     "why": "It says exactly what changed, so the history reads like a list of what you did."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 20
  },
  {
   "title": "Push, pull, and signing in",
   "body": "Your commits are only on your computer until you **push** them:\n\n```text\ngit push\n```\n\nRefresh the repository on GitHub: your commit is there, with its message, the time, and your name.\n\n### Signing in from the terminal\n\nThe first push asks you to sign in. **GitHub doesn't accept your account password for Git.** Instead:\n\n- **Windows:** Git for Windows includes **Git Credential Manager**. A browser window opens; sign in to GitHub and approve. It remembers you after that.\n- **Mac or Linux:** install the **GitHub CLI** ([cli.github.com](https://cli.github.com/)) and run `gh auth login`; choose GitHub.com, HTTPS, and sign in with the browser.\n- **Or** use **GitHub Desktop** ([desktop.github.com](https://desktop.github.com/)) or VS Code's **Source Control** panel, which handle sign-in for you.\n\n### Pull before you push\n\nIf the repository changed on GitHub (you edited a file on the website, or pushed from another computer), your push is **rejected**:\n\n```text\n! [rejected]        main -> main (fetch first)\n```\n\nThat's Git protecting the newer work. Get it first, then push:\n\n```text\ngit pull\ngit push\n```\n\nMake it a habit: **pull when you sit down to work, push when you get up.**\n\n### See it on GitHub\n\nOn the repository page, click the clock icon (**commits**) to see every commit. Click one to see exactly which lines changed: green lines added, red removed. That's the same view reviewers use.",
   "quiz": [
    {
     "q": "Your `git push` is rejected with \"fetch first\". What does that mean?",
     "options": [
      "Your account is blocked",
      "GitHub has commits you don't have yet; `git pull` them, then push again",
      "You need to delete the repository"
     ],
     "answer": 1,
     "why": "Git won't let a push overwrite newer work on the remote; pulling brings your copy up to date first."
    },
    {
     "q": "What does GitHub accept instead of your password when you push from the terminal?",
     "options": [
      "Nothing, pushing doesn't need sign-in",
      "A browser sign-in through Git Credential Manager, the GitHub CLI or GitHub Desktop (they use tokens behind the scenes)",
      "Your 2FA recovery codes"
     ],
     "answer": 1,
     "why": "Password sign-in for Git was turned off; these tools sign in through the browser and store a token for you."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Branches and pull requests",
   "body": "On real teams nobody commits straight to `main`. Each change gets its own **branch**, then a **pull request** (PR) asks to merge it into `main`, where others can review it first. Do it on your own projects too: it keeps `main` working and shows employers you know the workflow.\n\n```svg A branch splits off main, gets its own commits, and a pull request merges it back\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 170\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"520\" height=\"170\" fill=\"#ffffff\"/>\n  <path d=\"M20 60 H500\" stroke=\"#2563eb\" stroke-width=\"4\"/>\n  <circle cx=\"60\" cy=\"60\" r=\"10\" fill=\"#2563eb\"/><circle cx=\"140\" cy=\"60\" r=\"10\" fill=\"#2563eb\"/><circle cx=\"420\" cy=\"60\" r=\"12\" fill=\"#7c3aed\"/>\n  <text x=\"20\" y=\"40\" fill=\"#2563eb\" font-weight=\"bold\">main</text>\n  <path d=\"M140 60 C 180 60, 180 120, 220 120 H 330 C 370 120, 380 60, 420 60\" fill=\"none\" stroke=\"#16a34a\" stroke-width=\"4\"/>\n  <circle cx=\"240\" cy=\"120\" r=\"10\" fill=\"#16a34a\"/><circle cx=\"310\" cy=\"120\" r=\"10\" fill=\"#16a34a\"/>\n  <text x=\"200\" y=\"148\" fill=\"#16a34a\" font-weight=\"bold\">add-branch-notes</text>\n  <text x=\"420\" y=\"92\" text-anchor=\"middle\" fill=\"#7c3aed\">merge (the PR)</text>\n  <text x=\"140\" y=\"88\" text-anchor=\"middle\" fill=\"#475569\">git switch -c</text>\n</svg>\n```\n\n### The workflow\n\n```text\ngit switch -c add-branch-notes        # make a branch and move onto it\n# ... edit, then commit as usual\ngit add .\ngit commit -m \"Add notes on branches and pull requests\"\ngit push -u origin add-branch-notes   # the first push of a new branch\n```\n\nOn GitHub, a yellow banner appears: **Compare & pull request**. Click it, give the PR a title and a short description (what changed and why), and **Create pull request**. Look at the **Files changed** tab, the same diff a reviewer sees. Then **Merge pull request** → **Confirm merge**, and **Delete branch**.\n\nBack on your computer, update `main` and tidy up:\n\n```text\ngit switch main\ngit pull\ngit branch -d add-branch-notes\n```\n\n| Command | Does |\n|---|---|\n| `git branch` | Lists branches; `*` marks the one you're on |\n| `git switch -c name` | Makes a branch and switches to it |\n| `git switch main` | Goes back to main |\n| `git branch -d name` | Deletes a merged branch |\n\n> Tip: name branches after what they do: `fix-footer-link`, `add-dark-mode`.",
   "quiz": [
    {
     "q": "Why make a branch instead of committing to `main`?",
     "options": [
      "Branches upload faster",
      "main stays working while you build, and a pull request lets the change be reviewed before it's merged",
      "GitHub doesn't allow commits to main"
     ],
     "answer": 1,
     "why": "Branches isolate unfinished work, and PRs are where teams review changes."
    }
   ],
   "session": 2,
   "kind": "read",
   "minutes": 20
  },
  {
   "title": "When things go wrong",
   "body": "Everyone breaks things in Git. These cover most of it:\n\n| Problem | Fix |\n|---|---|\n| You changed a file and want it back the way it was | `git restore file.md` (the change is gone, so be sure) |\n| You staged something by mistake | `git restore --staged file.md` (it stays changed, just not staged) |\n| Typo in your last commit's message, **not pushed yet** | `git commit --amend -m \"Better message\"` |\n| A pushed commit was a mistake | `git revert <commit>`: makes a new commit that undoes it, without rewriting history |\n| Git says \"detached HEAD\" | `git switch main` |\n\n> **Never force-push to a shared branch.** `git push --force` overwrites what's on GitHub, including other people's work. If you're tempted, pull and merge instead.\n\n### Merge conflicts\n\nIf you and someone else (or you on two computers) changed the **same lines**, Git can't guess which to keep, so `git pull` stops with a **conflict**. The file shows both versions:\n\n```text\n<<<<<<< HEAD\n- Branches keep main working.\n=======\n- Branches let you work without breaking main.\n>>>>>>> origin/main\n```\n\nEdit the file to the version you want, deleting the `<<<<<<<`, `=======` and `>>>>>>>` lines (VS Code shows **Accept Current / Incoming / Both** buttons above the conflict). Then `git add` the file and `git commit`. That's it: conflicts look scary, but they're just \"pick which lines stay\".\n\n### Never commit secrets\n\nPasswords, API keys and `.env` files must never go in a repository, public or private: bots scan GitHub for leaked keys within minutes. List them in `.gitignore` **before** your first commit:\n\n```text\n.env\nnode_modules/\n__pycache__/\n.DS_Store\n```\n\nIf a secret does get pushed, deleting the file isn't enough (it's still in the history): **cancel or change the key right away** on the service it came from.",
   "quiz": [
    {
     "q": "A commit you already pushed broke something. What's the safe way to undo it?",
     "options": [
      "`git push --force` an older version",
      "`git revert <commit>`, which adds a new commit that undoes it",
      "Delete the repository and start over"
     ],
     "answer": 1,
     "why": "revert keeps the history honest and never overwrites what other people have already pulled."
    },
    {
     "q": "You accidentally pushed an API key. What must you do?",
     "options": [
      "Delete the file in the next commit, and that's enough",
      "Cancel or change the key on the service right away, because it's still in the history",
      "Make the repository private and keep the key"
     ],
     "answer": 1,
     "why": "Anything pushed may already have been copied, so the key itself has to be replaced."
    }
   ],
   "session": 2,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Your learning log, Pages and what's next",
   "body": "### Finish your learning log\n\nYour `learning-log` repository should now have:\n\n- a **README** saying what the log is, with a list of your notes\n- a **`.gitignore`**\n- a **`notes/`** folder with an entry for each day you learn something\n- at least one change that went through a **branch and a pull request**\n\nKeep adding a note each study day: it's a real record of your progress, and it's also how you'll remember the commands. The example is at [github.com/TheoYanvno/learning-log](https://github.com/TheoYanvno/learning-log).\n\n### GitHub Pages\n\nAny repository with an `index.html` can be a free website. **Settings → Pages** → Source: **Deploy from a branch** → **main**, **/ (root)** → **Save**. A minute later it's live at `https://username.github.io/repo-name/`, and every push updates it. All the web projects in CodeForge are published this way.\n\n### More GitHub features worth knowing\n\n| Feature | Use it for |\n|---|---|\n| **Issues** | A to-do list for a project: bugs and ideas, each with its own discussion |\n| **Stars** | Bookmark repositories you like (and see who likes yours) |\n| **Forks** | Your own copy of someone else's repository, to change or to send them a pull request |\n| **Actions** | Automatic jobs, like running your tests on every push |\n| **github.dev** | Press `.` on any repository page to open it in VS Code in your browser |\n\n### Clicking instead of typing\n\n**VS Code's Source Control panel** (the branch icon) and **GitHub Desktop** do add, commit, push, pull and branches with buttons. They run the same Git commands underneath, so everything in this guide still applies, and it's worth knowing both.",
   "quiz": [
    {
     "q": "How do you turn a repository into a website?",
     "options": [
      "Pay for GitHub Pro",
      "Settings → Pages → deploy from the main branch; it publishes the index.html",
      "Rename the repository to website"
     ],
     "answer": 1,
     "why": "GitHub Pages hosts any repository's HTML for free and updates on every push."
    }
   ],
   "session": 3,
   "kind": "read",
   "minutes": 15
  }
 ],
 "finish": "You can now do everything a developer does with GitHub every day:\n\n- A **secure account** with two-factor authentication and recovery codes\n- A **profile** with a README and pinned projects\n- **Create** and **clone** repositories, and the **status → add → commit** cycle with good messages\n- **Push** and **pull**, and signing in from the terminal\n- **Branches** and **pull requests**\n- Fixing mistakes: **restore**, **amend**, **revert**, **merge conflicts**, and keeping **secrets** out\n- **GitHub Pages** to publish websites\n\n### Challenges\n\n1. Make your profile README: a short introduction, your skills, and links to your three best projects, then pin those projects.\n2. Open an issue on your learning-log for something you want to learn next, then close it from a commit message with `Closes #1`.\n3. Fork a classmate's (or your own) repository, fix a typo on a branch, and open a pull request.\n\n### Next\n\nThe **HTML & CSS basics** guide: build a profile page and publish it with what you learned here."
};
