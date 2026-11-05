---
id: markdownre
title: Parsing Markdown with regular expressions
blocks-html: page
blocks-css: base
blocks-js: escape, inline, blocks
goals: Read and write simple regular expressions: characters, classes, repeats, groups and flags; Replace matches with groups using replace() and $1; Escape HTML first, so text from a post can never become a script; Turn Markdown's bold, italic, code and links into HTML; Split text into blocks and turn headings, lists and paragraphs into HTML line by line
prereqs: The JavaScript basics lesson (strings and functions) and the Filtering lists lesson (map and filter)
---

## Session: Text in, HTML out

## Step: Regular expressions in ten minutes
time: 12
kind: read

**Markdown** is how blog posts, READMEs and notes are written: `**bold**`, `# Heading`, `- list item`. To show a post, the blog turns that text into HTML. The tool for finding patterns in text is the **regular expression** (regex): a tiny language for "text shaped like this".

| Pattern | Matches |
|---|---|
| `a` | the letter a |
| `.` | any one character |
| `[abc]`, `[0-9]` | one of these characters |
| `\d`, `\w`, `\s` | a digit, a word character, a space |
| `*` / `+` / `?` | zero or more / one or more / maybe one, of the thing before |
| `^` and `$` | the start and the end (of the line, with the `m` flag) |
| `( ... )` | a **group**: remember this part |
| `\*` | a real `*` (a backslash turns off the special meaning) |

The flags after the last slash change how it searches: `g` finds **every** match, not just the first; `m` makes `^` and `$` work per line; `i` ignores capital letters.

```svg The regex /\*\*(.+?)\*\*/g finds **bold** text and remembers what's inside as group 1
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 110" font-family="ui-monospace, monospace" font-size="12">
  <text x="10" y="22">/\*\*(.+?)\*\*/g</text>
  <text x="10" y="58">This is **really** good</text>
  <rect x="74" y="44" width="84" height="20" rx="4" fill="none" stroke="#ea580c" stroke-width="2"/>
  <rect x="90" y="46" width="51" height="16" rx="3" fill="#fde68a" opacity=".7"/>
  <text x="10" y="92" font-family="sans-serif">whole match: **really** · group 1 ($1): really</text>
</svg>
```

`.+?` means "one or more of anything, but as few as possible". Without the `?`, `**a** and **b**` would match from the first `**` to the very last, all in one go. That small `?` is the most common regex fix there is.

> Regex is perfect for small, well-shaped patterns like these. Big jobs (full Markdown, or HTML) are better done by a proper parser, which is what the real Bonfire Notes uses on the Python side. This lesson's converter is small on purpose, so every line can be understood.

## Step: Escape first, then the inline styles
time: 15

**Rule one: escape HTML before anything else.** A post containing `<script>` must show those characters, not run them. `escapeHtml` turns `<`, `>`, `&` and quotes into their safe HTML forms (`&lt;` and so on). Every later step adds its own HTML tags to text that's already safe.

Then `inline(text)` handles the styles inside a line, each with `replace` and a group:

```js
.replace(/`([^`]+)`/g, '<code>$1</code>')
.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
.replace(/\*(.+?)\*/g, '<em>$1</em>')
```

`$1` in the replacement puts back what group 1 matched. Order matters: **bold before italic**, because `**` would otherwise be read as two italic markers.

Type in the box and watch the HTML (and the preview) update.

check: js | escaping HTML first | /replace\(\s*\/\[&<>"'\]\/g/ | s.replace(/[&<>"']/g, (c) => ...)
check: js | bold with a group | /\\\*\\\*\(\.\+\?\)\\\*\\\*/ | .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
check: js | putting the group back with $1 | /<strong>\$1<\/strong>/ | '<strong>$1</strong>'

quiz: Why is HTML escaped before the Markdown styles are turned into tags?
- [x] So a `<script>` written in a post shows as text; the converter's own tags are added afterwards to text that's already safe
- [ ] Escaping makes the regexes faster
- [ ] Markdown requires it
why: Escape the input first, add trusted HTML second. Done the other way round, a post could inject code.

quiz: Without the `?` in `\*\*(.+?)\*\*`, what happens to `**a** and **b**`?
- [ ] Nothing changes
- [x] One match from the first ** to the last, making "a** and **b" bold
- [ ] It matches only a
why: `.+` is greedy and grabs as much as it can; `.+?` stops at the first closing **.

```html page
<main class="wrap">
  <label for="md">Markdown</label>
  <textarea id="md" rows="10">
# Bonfire notes

Rest at the **bonfire** before the *boss*.

- Upgrade the `Estus Flask`
- Read the [wiki](https://example.com)

Text like <script>alert(1)</script> stays text.
  </textarea>
  <div class="cols">
    <section><h2>HTML</h2><pre id="html" class="html"></pre></section>
    <section><h2>Preview</h2><article id="preview" class="preview"></article></section>
  </div>
</main>
```

```css base
body { margin: 0; font-family: system-ui, sans-serif; background: #1c1917; color: #f5f5f4; }
.wrap { max-width: 760px; margin: 0 auto; padding: 16px; }
label, h2 { font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; color: #fdba74; }
textarea { width: 100%; box-sizing: border-box; padding: 10px; font: .9rem ui-monospace, Menlo, Consolas, monospace; background: #292524; color: #fafaf9; border: 1px solid #57534e; border-radius: 10px; }
.cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
.html { min-height: 120px; padding: 10px; overflow: auto; white-space: pre-wrap; font-size: .75rem; background: #0c0a09; border-radius: 10px; color: #a8a29e; }
.preview { min-height: 120px; padding: 10px; background: #fafaf9; color: #1c1917; border-radius: 10px; }
.preview code { background: #e7e5e4; padding: 0 4px; border-radius: 4px; }
.preview a { color: #c2410c; }
```

```js escape
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const md = document.getElementById('md');
```

```js inline
function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function show() {
  const html = md.value.split('\n').map(inline).join('<br>\n');
  document.getElementById('html').textContent = html;
  document.getElementById('preview').innerHTML = html;
}

md.addEventListener('input', show);
show();
```

## Step: Links, and only safe ones
time: 12

A Markdown link is `[text](url)`. The regex has two groups, one for each part:

```js
/\[([^\]]+)\]\(([^)\s]+)\)/g
```

Read it piece by piece: a real `[`, then group 1 is "one or more characters that aren't `]`", then `](`, then group 2 is "characters that aren't `)` or a space", then `)`.

There's one more safety rule. A link like `[click](javascript:alert(1))` would run code when clicked, so the converter only keeps links that start with `https://`, `http://`, `mailto:`, `/` or `#`. Anything else is shown as plain text. A function as the replacement (instead of a string) lets the code decide for each match.

```svg A link match has two groups: the text and the address; only safe address schemes become links
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="ui-monospace, monospace" font-size="12">
  <text x="10" y="24">[wiki](https://example.com)</text>
  <rect x="17" y="10" width="34" height="20" rx="3" fill="#fde68a" opacity=".6"/><rect x="65" y="10" width="155" height="20" rx="3" fill="#bfdbfe" opacity=".6"/>
  <text x="17" y="50" font-family="sans-serif">$1 = text</text><text x="120" y="50" font-family="sans-serif">$2 = address</text>
  <text x="10" y="84" font-family="sans-serif" fill="#b91c1c">javascript:… → not a link, shown as text</text>
</svg>
```

check: js | a link with two groups | /\\\[\(\[\^\\\]\]\+\)\\\]\\\(/ | a regex with one group for the text and one for the address
check: js | only safe link addresses | /https\?:/ | SAFE_URL.test(url), where SAFE_URL allows https, http, mailto, / and #

quiz: What do `$1` and `$2` hold for `[wiki](https://example.com)`?
- [x] "wiki" and "https://example.com"
- [ ] "[wiki]" and "(https://example.com)"
- [ ] The whole link, twice
why: The groups are inside the brackets and parentheses, so they hold just the text and the address.

quiz: Why is `[click](javascript:alert(1))` not turned into a link?
- [ ] The regex can't match it
- [x] A javascript: link runs code when clicked, so only safe schemes like https: become links
- [ ] Links can't contain parentheses
why: Allow a short list of safe schemes and treat everything else as text.

```js inline
const SAFE_URL = /^(https?:|mailto:|\/|#)/;

function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, label, url) => (SAFE_URL.test(url) ? `<a href="${url}">${label}</a>` : whole));
}

function show() {
  const html = md.value.split('\n').map(inline).join('<br>\n');
  document.getElementById('html').textContent = html;
  document.getElementById('preview').innerHTML = html;
}

md.addEventListener('input', show);
show();
```

## Step: Headings, lists and paragraphs
time: 15

Inline styles live inside lines; **blocks** are whole lines or groups of lines. The converter walks the lines one at a time and decides what each one is:

- `^(#{1,6})\s+(.+)$` is a **heading**: the number of `#`s (group 1's length) is the level, `<h1>` to `<h6>`.
- `^[-*]\s+(.+)$` is a **list item**. Items next to each other go in one `<ul>`, so the code keeps a list open until a line that isn't an item.
- A **blank line** ends a paragraph. Other lines are collected and joined into one `<p>`.

```svg Each line is sorted into a heading, a list item or paragraph text; runs of items share one ul, and blank lines close paragraphs
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 130" font-family="sans-serif" font-size="11">
  <g font-family="ui-monospace, monospace"><text x="10" y="20"># Bonfire notes</text><text x="10" y="44">Rest at the bonfire…</text><text x="10" y="68">- Upgrade the flask</text><text x="10" y="88">- Read the wiki</text></g>
  <g><rect x="200" y="8" width="120" height="18" rx="4" fill="#fed7aa"/><text x="260" y="21" text-anchor="middle">&lt;h1&gt;</text>
  <rect x="200" y="32" width="120" height="18" rx="4" fill="#e7e5e4"/><text x="260" y="45" text-anchor="middle">&lt;p&gt;</text>
  <rect x="200" y="56" width="120" height="38" rx="4" fill="#bfdbfe"/><text x="260" y="79" text-anchor="middle">&lt;ul&gt; two &lt;li&gt;</text></g>
  <path d="M150 16 H196 M150 40 H196 M150 64 L196 70 M150 84 L196 80" stroke="#78716c"/>
</svg>
```

Every piece of text still goes through `inline()`, so it's escaped and styled the same way everywhere.

check: js | headings by counting # | /\^\(#\{1,6\}\)/ | line.match with a pattern for one to six # signs, a space and the heading text
check: js | list items | /\^\[-\*\]\\s\+/ | line.match with a pattern for a - or * at the start, a space and the item
check: js | the heading level from the group's length | /\.length/ | const level = m[1].length;

quiz: What does `## Lists` become?
- [ ] <h1>Lists</h1>
- [x] <h2>Lists</h2>, because group 1 is "##" and its length is 2
- [ ] <p>## Lists</p>
why: The number of # characters sets the heading level.

quiz: Why does the converter keep a list "open" between lines?
- [x] So items on neighboring lines share one <ul> instead of each getting its own
- [ ] Lists can't be closed in HTML
- [ ] To make the regex shorter
why: The code remembers it's inside a list until a line that isn't an item, then closes the <ul>.

```js blocks
function toHtml(text) {
  const out = [];
  let para = [];
  let inList = false;
  const flushPara = () => { if (para.length) out.push(`<p>${para.map(inline).join(' ')}</p>`); para = []; };
  const closeList = () => { if (inList) out.push('</ul>'); inList = false; };

  for (const line of text.split('\n')) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    const item = line.match(/^[-*]\s+(.+)$/);
    if (heading) {
      flushPara(); closeList();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (item) {
      flushPara();
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${inline(item[1])}</li>`);
    } else if (!line.trim()) {
      flushPara(); closeList();
    } else {
      closeList();
      para.push(line.trim());
    }
  }
  flushPara(); closeList();
  return out.join('\n');
}

function show() {
  const html = toHtml(md.value);
  document.getElementById('html').textContent = html;
  document.getElementById('preview').innerHTML = html;
}

md.addEventListener('input', show);
show();
```

## Finish

You can turn Markdown into HTML now, safely. You learned:

- **Regular expressions**: classes, repeats, groups, `?` for "as few as possible", and the `g`, `m` and `i` flags
- `replace` with **$1**, and with a **function** that decides per match
- **Escape first**, then add your own tags; only **safe link schemes**
- **Blocks**: headings by counting `#`, lists kept open across lines, paragraphs ended by blank lines

### Challenges

1. Add numbered lists: `^\d+\.\s+(.+)$` into `<ol>`.
2. Add fenced code blocks: lines between two ```` ``` ```` lines go into `<pre><code>`, escaped, with no styles applied inside.
3. Add `> quotes` as `<blockquote>`, joining neighboring lines like paragraphs.

### Next

**Hash routing**: one page that acts like many.
