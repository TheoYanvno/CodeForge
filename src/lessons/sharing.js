// Built from guides/sharing.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "sharing",
 "title": "Sharing: copy, share sheet and links",
 "goals": [
  "Copy text with the Clipboard API and tell the person it worked",
  "Open the phone's share sheet with the Web Share API, and fall back when it isn't there",
  "Check whether a feature exists before using it (feature detection)",
  "Make a link that opens one exact item, using the URL hash",
  "Read the hash when the page opens and when it changes"
 ],
 "prereqs": [
  "The Arrays of objects and random picks lesson, and the Fetching quotes and jokes lesson (async, await and try/catch)"
 ],
 "sessions": [
  {
   "title": "Getting things out of your app",
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
   "copy": "",
   "share": "",
   "link": ""
  }
 },
 "steps": [
  {
   "title": "Two browser features for sharing",
   "body": "People want to send a good quote to a friend. Browsers give you two tools:\n\n- **The Clipboard API**: `navigator.clipboard.writeText(text)` puts text on the clipboard, ready to paste anywhere. It works on almost every modern browser, desktop and phone.\n- **The Web Share API**: `navigator.share({ title, text, url })` opens the device's own share sheet (Messages, WhatsApp, email…). It's common on phones but missing on many desktop browsers.\n\n```svg A Share click checks whether navigator.share exists: if yes, open the share sheet; if not, copy to the clipboard instead\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"47\" width=\"70\" height=\"36\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"40\" y=\"69\" text-anchor=\"middle\">Share</text>\n  <path d=\"M95 65 L135 40 L175 65 L135 90 Z\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"135\" y=\"62\" text-anchor=\"middle\" font-size=\"10\">navigator</text><text x=\"135\" y=\"75\" text-anchor=\"middle\" font-size=\"10\">.share?</text>\n  <rect x=\"205\" y=\"10\" width=\"120\" height=\"34\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"265\" y=\"32\" text-anchor=\"middle\">share sheet</text>\n  <rect x=\"205\" y=\"86\" width=\"120\" height=\"34\" rx=\"8\" fill=\"#e0f2fe\" stroke=\"#0284c7\"/><text x=\"265\" y=\"108\" text-anchor=\"middle\">copy instead</text>\n  <path d=\"M75 65 H93 M170 55 L203 30 M170 75 L203 100\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"186\" y=\"36\">yes</text><text x=\"186\" y=\"104\">no</text>\n</svg>\n```\n\n### Two rules both follow\n\n1. **Only after a click.** Browsers allow copying and sharing only right after the person does something (a click or a tap), so a page can't fill your clipboard or pop up share sheets by itself.\n2. **They can say no.** Both return a promise that can fail (no permission, the person closed the share sheet), so you `await` them inside `try/catch`.\n\nChecking whether a feature exists before using it is called **feature detection**: `if (navigator.share) { ... }`. It's better than guessing from the browser's name, which is often wrong.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "Copy, and say it worked",
   "body": "The Copy button writes the quote and its author to the clipboard. Copying is silent, so the button briefly changes to \"Copied ✓\" and the status line says so (read out by screen readers through `role=\"status\"`).\n\n```svg Copy: try writeText; on success say \"Copied ✓\", on failure select the text and explain how to copy by hand\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"37\" width=\"85\" height=\"36\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/><text x=\"47\" y=\"59\" text-anchor=\"middle\">writeText</text>\n  <rect x=\"140\" y=\"8\" width=\"185\" height=\"34\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"232\" y=\"30\" text-anchor=\"middle\">\"Copied ✓\" for 1.5 seconds</text>\n  <rect x=\"140\" y=\"68\" width=\"185\" height=\"34\" rx=\"8\" fill=\"#fef9c3\" stroke=\"#ca8a04\"/><text x=\"232\" y=\"90\" text-anchor=\"middle\">select text + \"press Ctrl+C\"</text>\n  <path d=\"M90 50 L136 26 M90 62 L136 84\" stroke=\"#111\" stroke-width=\"2\"/>\n  <text x=\"108\" y=\"30\">ok</text><text x=\"104\" y=\"92\">catch</text>\n</svg>\n```\n\nIf copying fails (an old browser, a blocked permission), the quote text is selected on the page instead, with a hint to press Ctrl+C or ⌘C. The person can always finish the job.",
   "checks": [
    {
     "pane": "js",
     "label": "copying with the Clipboard API",
     "test": "/navigator\\.clipboard\\.writeText\\(/",
     "hint": "await navigator.clipboard.writeText(text)"
    },
    {
     "pane": "js",
     "label": "waiting for it inside try/catch",
     "test": "/try\\s*\\{[\\s\\S]*await\\s+navigator\\.clipboard\\.writeText[\\s\\S]*\\}\\s*catch/",
     "hint": "try { await navigator.clipboard.writeText(text); } catch { ... }"
    },
    {
     "pane": "js",
     "label": "telling the person it worked",
     "test": "/Copied/",
     "hint": "statusEl.textContent = 'Copied to the clipboard';"
    }
   ],
   "quiz": [
    {
     "q": "Why can't a page copy something to your clipboard as soon as it loads?",
     "options": [
      "Browsers only allow it right after you click or tap, so pages can't fill your clipboard on their own",
      "The clipboard is only available after 5 seconds",
      "Copying needs an account"
     ],
     "answer": 0,
     "why": "Clipboard writes need a user gesture, which protects people from pages that change the clipboard behind their backs."
    },
    {
     "q": "Copying failed. What does the page do?",
     "options": [
      "Nothing",
      "Shows an error and gives up",
      "Selects the quote text and tells the person to press Ctrl+C or ⌘C"
     ],
     "answer": 2,
     "why": "A fallback lets the person finish the job by hand."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"card\">\n  <blockquote id=\"text\"></blockquote>\n  <p id=\"author\" class=\"author\"></p>\n  <p class=\"buttons\">\n    <button id=\"copy\">Copy</button>\n    <button id=\"share\">Share</button>\n    <button id=\"next\">Next quote</button>\n  </p>\n  <p id=\"status\" class=\"status\" role=\"status\"></p>\n  <p class=\"small\">Link to this quote: <a id=\"link\" href=\"#\"></a></p>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: Georgia, serif;\n  background: #f0fdf4;\n  color: #052e16;\n}\n\n.card {\n  width: min(420px, 100% - 32px);\n  padding: 24px;\n  background: #fff;\n  border-radius: 16px;\n  text-align: center;\n}\n\nblockquote { margin: 0 0 10px; font-size: 1.3rem; }\n.author { color: #15803d; font-style: italic; }\n.buttons { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }\nbutton { padding: 8px 14px; font: 600 .95rem system-ui, sans-serif; }\n.status { min-height: 1.3em; color: #166534; font: .9rem system-ui, sans-serif; }\n.small { font: .8rem system-ui, sans-serif; color: #64748b; overflow-wrap: anywhere; }"
   },
   "js": {
    "data": "const quotes = [\n  { id: 1, text: 'Well done is better than well said.', author: 'Benjamin Franklin' },\n  { id: 2, text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },\n  { id: 3, text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },\n  { id: 4, text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },\n];\n\nconst textEl = document.getElementById('text');\nconst statusEl = document.getElementById('status');\nlet current = quotes[0];\n\nfunction show(q) {\n  current = q;\n  textEl.textContent = q.text;\n  document.getElementById('author').textContent = `— ${q.author}`;\n  statusEl.textContent = '';\n}\n\ndocument.getElementById('next').addEventListener('click', () => {\n  show(quotes[(quotes.indexOf(current) + 1) % quotes.length]);\n});\n\nshow(current);",
    "copy": "const asText = (q) => `\"${q.text}\" — ${q.author}`;\nconst copyBtn = document.getElementById('copy');\n\nasync function copyQuote() {\n  const text = asText(current);\n  try {\n    await navigator.clipboard.writeText(text);\n    statusEl.textContent = 'Copied to the clipboard';\n    copyBtn.textContent = 'Copied ✓';\n    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);\n  } catch {\n    const range = document.createRange();\n    range.selectNodeContents(textEl);\n    getSelection().removeAllRanges();\n    getSelection().addRange(range);\n    statusEl.textContent = 'Couldn\\'t copy automatically. The quote is selected: press Ctrl+C (⌘C on a Mac).';\n  }\n}\n\ncopyBtn.addEventListener('click', copyQuote);"
   }
  },
  {
   "title": "The share sheet, with a fallback",
   "body": "The Share button uses the Web Share API when it's there, and copies when it isn't. That's feature detection:\n\n```js\nif (navigator.share) {\n  await navigator.share({ title: 'A quote', text: asText(current), url });\n} else {\n  await copyQuote();\n}\n```\n\nClosing the share sheet without picking an app makes the promise fail with an error named **AbortError**. That's not a problem, the person just changed their mind, so the code stays quiet for it and only reports other errors.\n\nOn a desktop browser without Web Share, the button says **Share (copies)** so nobody is surprised by what it does.",
   "checks": [
    {
     "pane": "js",
     "label": "detecting the Web Share API",
     "test": "/if\\s*\\(\\s*navigator\\.share\\s*\\)/",
     "hint": "if (navigator.share) { ... } else { ... }"
    },
    {
     "pane": "js",
     "label": "opening the share sheet",
     "test": "/await\\s+navigator\\.share\\(\\s*\\{/",
     "hint": "await navigator.share({ title, text, url })"
    },
    {
     "pane": "js",
     "label": "staying quiet when the person cancels",
     "test": "/AbortError/",
     "hint": "if (err.name !== 'AbortError') ..."
    }
   ],
   "quiz": [
    {
     "q": "On a desktop browser without `navigator.share`, what does Share do?",
     "options": [
      "Shows an error",
      "Copies the quote instead, and its label says so",
      "Opens a new window"
     ],
     "answer": 1,
     "why": "Feature detection picks the fallback, so the button always does something useful."
    },
    {
     "q": "The person opens the share sheet and closes it. What should the page say?",
     "options": [
      "Nothing; an AbortError just means they changed their mind",
      "\"Sharing failed!\"",
      "It should open the sheet again"
     ],
     "answer": 0,
     "why": "Cancelling isn't an error from the person's point of view."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "share": "const shareBtn = document.getElementById('share');\nif (!navigator.share) shareBtn.textContent = 'Share (copies)';\n\nshareBtn.addEventListener('click', async () => {\n  if (navigator.share) {\n    try {\n      await navigator.share({ title: 'A quote', text: asText(current), url: location.href });\n    } catch (err) {\n      if (err.name !== 'AbortError') statusEl.textContent = 'Couldn\\'t open sharing on this device.';\n    }\n  } else {\n    await copyQuote();\n  }\n});"
   }
  },
  {
   "title": "A link to one exact quote",
   "body": "Sharing \"the quote app\" isn't the same as sharing *this* quote. The part of a web address after `#` is the **hash**, and the page can use it to say which quote to show: `quotes.html#quote-3`.\n\n```svg The hash at the end of the address names the quote: the page reads it on load and whenever it changes\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect x=\"5\" y=\"20\" width=\"320\" height=\"30\" rx=\"6\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/>\n  <text x=\"14\" y=\"40\">https://you.github.io/quotes/</text><text x=\"214\" y=\"40\" fill=\"#15803d\" font-weight=\"700\">#quote-3</text>\n  <path d=\"M245 52 V70\" stroke=\"#15803d\" stroke-width=\"2\"/>\n  <text x=\"245\" y=\"88\" text-anchor=\"middle\">→ show the quote with id 3</text>\n</svg>\n```\n\n- Showing a quote sets `location.hash`, so the address bar (and anything shared from it) always points at the quote on screen.\n- On load, and on the `hashchange` event (Back and Forward buttons), the page reads the hash, finds the quote with that id and shows it. An unknown id just shows the first quote.\n- Changing the hash doesn't reload the page, which is why it's handy for small apps. The Bonfire Notes project uses the same idea to switch pages.",
   "checks": [
    {
     "pane": "js",
     "label": "setting the hash for the quote on screen",
     "test": "/location\\.hash\\s*=/",
     "hint": "location.hash = `quote-${q.id}`;"
    },
    {
     "pane": "js",
     "label": "reading it when it changes",
     "test": "/addEventListener\\(\\s*['\"]hashchange['\"]/",
     "hint": "addEventListener('hashchange', fromHash)"
    },
    {
     "pane": "js",
     "label": "finding the quote by id",
     "test": "/quotes\\.find\\(/",
     "hint": "quotes.find((q) => q.id === id)"
    }
   ],
   "quiz": [
    {
     "q": "What happens when someone opens `quotes.html#quote-99` and there's no quote 99?",
     "options": [
      "The page crashes",
      "It shows the first quote instead",
      "It shows a blank card"
     ],
     "answer": 1,
     "why": "The code falls back to the first quote when the id isn't found."
    },
    {
     "q": "Why does pressing Back change the quote?",
     "options": [
      "Back changes the hash, which fires hashchange, and the page shows that quote",
      "The browser reloads the whole page",
      "Back buttons don't work with hashes"
     ],
     "answer": 0,
     "why": "Every hash change is a history entry, and the hashchange listener follows it."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "link": "const linkEl = document.getElementById('link');\n\nfunction showWithLink(q) {\n  show(q);\n  if (location.hash !== `#quote-${q.id}`) location.hash = `quote-${q.id}`;\n  linkEl.href = location.href;\n  linkEl.textContent = location.href;\n}\n\nfunction fromHash() {\n  const id = Number(location.hash.replace('#quote-', ''));\n  showWithLink(quotes.find((q) => q.id === id) ?? quotes[0]);\n}\n\nwindow.addEventListener('hashchange', fromHash);\ndocument.getElementById('next').addEventListener('click', () => showWithLink(current));\nfromHash();"
   }
  }
 ],
 "finish": "People can take quotes out of your app now. You learned:\n\n- The **Clipboard API** with clear feedback and a select-it fallback\n- The **Web Share API**, **feature detection** and a copy fallback\n- Why both need a **click first**, and handling a cancel (**AbortError**)\n- **Hash links** to one exact item, read on load and on `hashchange`\n\nYou've now learned every part of the **Quote & Joke Generator**: content as data, random picks, filtering, fetching, favorites, accounts and sharing. Build it next.\n\n### Challenges\n\n1. Add a **Copy link** button next to Copy that copies `location.href`.\n2. Share an image: draw the quote on a canvas, turn it into a file with `canvas.toBlob`, and share it with `navigator.share({ files })` where `navigator.canShare` says it's allowed.\n3. Make the hash readable: `#quote-3-the-secret-of-getting-ahead` (and still find quote 3).\n\n### Next\n\nThe **Quote & Joke Generator** project."
};
