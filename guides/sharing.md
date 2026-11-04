---
id: sharing
title: Sharing: copy, share sheet and links
blocks-html: page
blocks-css: base
blocks-js: data, copy, share, link
goals: Copy text with the Clipboard API and tell the person it worked; Open the phone's share sheet with the Web Share API, and fall back when it isn't there; Check whether a feature exists before using it (feature detection); Make a link that opens one exact item, using the URL hash; Read the hash when the page opens and when it changes
prereqs: The Arrays of objects and random picks lesson, and the Fetching quotes and jokes lesson (async, await and try/catch)
---

## Session: Getting things out of your app

## Step: Two browser features for sharing
time: 10
kind: read

People want to send a good quote to a friend. Browsers give you two tools:

- **The Clipboard API**: `navigator.clipboard.writeText(text)` puts text on the clipboard, ready to paste anywhere. It works on almost every modern browser, desktop and phone.
- **The Web Share API**: `navigator.share({ title, text, url })` opens the device's own share sheet (Messages, WhatsApp, email…). It's common on phones but missing on many desktop browsers.

```svg A Share click checks whether navigator.share exists: if yes, open the share sheet; if not, copy to the clipboard instead
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 130" font-family="sans-serif" font-size="12">
  <rect x="5" y="47" width="70" height="36" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="40" y="69" text-anchor="middle">Share</text>
  <path d="M95 65 L135 40 L175 65 L135 90 Z" fill="#fef9c3" stroke="#ca8a04"/><text x="135" y="62" text-anchor="middle" font-size="10">navigator</text><text x="135" y="75" text-anchor="middle" font-size="10">.share?</text>
  <rect x="205" y="10" width="120" height="34" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="265" y="32" text-anchor="middle">share sheet</text>
  <rect x="205" y="86" width="120" height="34" rx="8" fill="#e0f2fe" stroke="#0284c7"/><text x="265" y="108" text-anchor="middle">copy instead</text>
  <path d="M75 65 H93 M170 55 L203 30 M170 75 L203 100" stroke="#111" stroke-width="2"/>
  <text x="186" y="36">yes</text><text x="186" y="104">no</text>
</svg>
```

### Two rules both follow

1. **Only after a click.** Browsers allow copying and sharing only right after the person does something (a click or a tap), so a page can't fill your clipboard or pop up share sheets by itself.
2. **They can say no.** Both return a promise that can fail (no permission, the person closed the share sheet), so you `await` them inside `try/catch`.

Checking whether a feature exists before using it is called **feature detection**: `if (navigator.share) { ... }`. It's better than guessing from the browser's name, which is often wrong.

## Step: Copy, and say it worked
time: 15

The Copy button writes the quote and its author to the clipboard. Copying is silent, so the button briefly changes to "Copied ✓" and the status line says so (read out by screen readers through `role="status"`).

```svg Copy: try writeText; on success say "Copied ✓", on failure select the text and explain how to copy by hand
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" font-family="sans-serif" font-size="12">
  <rect x="5" y="37" width="85" height="36" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="47" y="59" text-anchor="middle">writeText</text>
  <rect x="140" y="8" width="185" height="34" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="232" y="30" text-anchor="middle">"Copied ✓" for 1.5 seconds</text>
  <rect x="140" y="68" width="185" height="34" rx="8" fill="#fef9c3" stroke="#ca8a04"/><text x="232" y="90" text-anchor="middle">select text + "press Ctrl+C"</text>
  <path d="M90 50 L136 26 M90 62 L136 84" stroke="#111" stroke-width="2"/>
  <text x="108" y="30">ok</text><text x="104" y="92">catch</text>
</svg>
```

If copying fails (an old browser, a blocked permission), the quote text is selected on the page instead, with a hint to press Ctrl+C or ⌘C. The person can always finish the job.

check: js | copying with the Clipboard API | /navigator\.clipboard\.writeText\(/ | await navigator.clipboard.writeText(text)
check: js | waiting for it inside try/catch | /try\s*\{[\s\S]*await\s+navigator\.clipboard\.writeText[\s\S]*\}\s*catch/ | try { await navigator.clipboard.writeText(text); } catch { ... }
check: js | telling the person it worked | /Copied/ | statusEl.textContent = 'Copied to the clipboard';

quiz: Why can't a page copy something to your clipboard as soon as it loads?
- [x] Browsers only allow it right after you click or tap, so pages can't fill your clipboard on their own
- [ ] The clipboard is only available after 5 seconds
- [ ] Copying needs an account
why: Clipboard writes need a user gesture, which protects people from pages that change the clipboard behind their backs.

quiz: Copying failed. What does the page do?
- [ ] Nothing
- [ ] Shows an error and gives up
- [x] Selects the quote text and tells the person to press Ctrl+C or ⌘C
why: A fallback lets the person finish the job by hand.

```html page
<main class="card">
  <blockquote id="text"></blockquote>
  <p id="author" class="author"></p>
  <p class="buttons">
    <button id="copy">Copy</button>
    <button id="share">Share</button>
    <button id="next">Next quote</button>
  </p>
  <p id="status" class="status" role="status"></p>
  <p class="small">Link to this quote: <a id="link" href="#"></a></p>
</main>
```

```css base
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Georgia, serif;
  background: #f0fdf4;
  color: #052e16;
}

.card {
  width: min(420px, 100% - 32px);
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  text-align: center;
}

blockquote { margin: 0 0 10px; font-size: 1.3rem; }
.author { color: #15803d; font-style: italic; }
.buttons { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
button { padding: 8px 14px; font: 600 .95rem system-ui, sans-serif; }
.status { min-height: 1.3em; color: #166534; font: .9rem system-ui, sans-serif; }
.small { font: .8rem system-ui, sans-serif; color: #64748b; overflow-wrap: anywhere; }
```

```js data
const quotes = [
  { id: 1, text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { id: 2, text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { id: 3, text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { id: 4, text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },
];

const textEl = document.getElementById('text');
const statusEl = document.getElementById('status');
let current = quotes[0];

function show(q) {
  current = q;
  textEl.textContent = q.text;
  document.getElementById('author').textContent = `— ${q.author}`;
  statusEl.textContent = '';
}

document.getElementById('next').addEventListener('click', () => {
  show(quotes[(quotes.indexOf(current) + 1) % quotes.length]);
});

show(current);
```

```js copy
const asText = (q) => `"${q.text}" — ${q.author}`;
const copyBtn = document.getElementById('copy');

async function copyQuote() {
  const text = asText(current);
  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = 'Copied to the clipboard';
    copyBtn.textContent = 'Copied ✓';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(textEl);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    statusEl.textContent = 'Couldn\'t copy automatically. The quote is selected: press Ctrl+C (⌘C on a Mac).';
  }
}

copyBtn.addEventListener('click', copyQuote);
```

## Step: The share sheet, with a fallback
time: 15

The Share button uses the Web Share API when it's there, and copies when it isn't. That's feature detection:

```js
if (navigator.share) {
  await navigator.share({ title: 'A quote', text: asText(current), url });
} else {
  await copyQuote();
}
```

Closing the share sheet without picking an app makes the promise fail with an error named **AbortError**. That's not a problem, the person just changed their mind, so the code stays quiet for it and only reports other errors.

On a desktop browser without Web Share, the button says **Share (copies)** so nobody is surprised by what it does.

check: js | detecting the Web Share API | /if\s*\(\s*navigator\.share\s*\)/ | if (navigator.share) { ... } else { ... }
check: js | opening the share sheet | /await\s+navigator\.share\(\s*\{/ | await navigator.share({ title, text, url })
check: js | staying quiet when the person cancels | /AbortError/ | if (err.name !== 'AbortError') ...

quiz: On a desktop browser without `navigator.share`, what does Share do?
- [ ] Shows an error
- [x] Copies the quote instead, and its label says so
- [ ] Opens a new window
why: Feature detection picks the fallback, so the button always does something useful.

quiz: The person opens the share sheet and closes it. What should the page say?
- [x] Nothing; an AbortError just means they changed their mind
- [ ] "Sharing failed!"
- [ ] It should open the sheet again
why: Cancelling isn't an error from the person's point of view.

```js share
const shareBtn = document.getElementById('share');
if (!navigator.share) shareBtn.textContent = 'Share (copies)';

shareBtn.addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'A quote', text: asText(current), url: location.href });
    } catch (err) {
      if (err.name !== 'AbortError') statusEl.textContent = 'Couldn\'t open sharing on this device.';
    }
  } else {
    await copyQuote();
  }
});
```

## Step: A link to one exact quote
time: 15

Sharing "the quote app" isn't the same as sharing *this* quote. The part of a web address after `#` is the **hash**, and the page can use it to say which quote to show: `quotes.html#quote-3`.

```svg The hash at the end of the address names the quote: the page reads it on load and whenever it changes
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="12">
  <rect x="5" y="20" width="320" height="30" rx="6" fill="#f1f5f9" stroke="#94a3b8"/>
  <text x="14" y="40">https://you.github.io/quotes/</text><text x="214" y="40" fill="#15803d" font-weight="700">#quote-3</text>
  <path d="M245 52 V70" stroke="#15803d" stroke-width="2"/>
  <text x="245" y="88" text-anchor="middle">→ show the quote with id 3</text>
</svg>
```

- Showing a quote sets `location.hash`, so the address bar (and anything shared from it) always points at the quote on screen.
- On load, and on the `hashchange` event (Back and Forward buttons), the page reads the hash, finds the quote with that id and shows it. An unknown id just shows the first quote.
- Changing the hash doesn't reload the page, which is why it's handy for small apps. The Bonfire Notes project uses the same idea to switch pages.

check: js | setting the hash for the quote on screen | /location\.hash\s*=/ | location.hash = `quote-${q.id}`;
check: js | reading it when it changes | /addEventListener\(\s*['"]hashchange['"]/ | addEventListener('hashchange', fromHash)
check: js | finding the quote by id | /quotes\.find\(/ | quotes.find((q) => q.id === id)

quiz: What happens when someone opens `quotes.html#quote-99` and there's no quote 99?
- [ ] The page crashes
- [x] It shows the first quote instead
- [ ] It shows a blank card
why: The code falls back to the first quote when the id isn't found.

quiz: Why does pressing Back change the quote?
- [x] Back changes the hash, which fires hashchange, and the page shows that quote
- [ ] The browser reloads the whole page
- [ ] Back buttons don't work with hashes
why: Every hash change is a history entry, and the hashchange listener follows it.

```js link
const linkEl = document.getElementById('link');

function showWithLink(q) {
  show(q);
  if (location.hash !== `#quote-${q.id}`) location.hash = `quote-${q.id}`;
  linkEl.href = location.href;
  linkEl.textContent = location.href;
}

function fromHash() {
  const id = Number(location.hash.replace('#quote-', ''));
  showWithLink(quotes.find((q) => q.id === id) ?? quotes[0]);
}

window.addEventListener('hashchange', fromHash);
document.getElementById('next').addEventListener('click', () => showWithLink(current));
fromHash();
```

## Finish

People can take quotes out of your app now. You learned:

- The **Clipboard API** with clear feedback and a select-it fallback
- The **Web Share API**, **feature detection** and a copy fallback
- Why both need a **click first**, and handling a cancel (**AbortError**)
- **Hash links** to one exact item, read on load and on `hashchange`

You've now learned every part of the **Quote & Joke Generator**: content as data, random picks, filtering, fetching, favorites, accounts and sharing. Build it next.

### Challenges

1. Add a **Copy link** button next to Copy that copies `location.href`.
2. Share an image: draw the quote on a canvas, turn it into a file with `canvas.toBlob`, and share it with `navigator.share({ files })` where `navigator.canShare` says it's allowed.
3. Make the hash readable: `#quote-3-the-secret-of-getting-ahead` (and still find quote 3).

### Next

The **Quote & Joke Generator** project.
