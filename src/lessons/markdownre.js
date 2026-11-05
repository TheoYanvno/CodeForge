// Built from guides/markdownre.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "markdownre",
 "title": "Parsing Markdown with regular expressions",
 "goals": [
  "Read and write simple regular expressions: characters, classes, repeats, groups and flags",
  "Replace matches with groups using replace() and $1",
  "Escape HTML first, so text from a post can never become a script",
  "Turn Markdown's bold, italic, code and links into HTML",
  "Split text into blocks and turn headings, lists and paragraphs into HTML line by line"
 ],
 "prereqs": [
  "The JavaScript basics lesson (strings and functions) and the Filtering lists lesson (map and filter)"
 ],
 "sessions": [
  {
   "title": "Text in, HTML out",
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
   "escape": "",
   "inline": "",
   "blocks": ""
  }
 },
 "steps": [
  {
   "title": "Regular expressions in ten minutes",
   "body": "**Markdown** is how blog posts, READMEs and notes are written: `**bold**`, `# Heading`, `- list item`. To show a post, the blog turns that text into HTML. The tool for finding patterns in text is the **regular expression** (regex): a tiny language for \"text shaped like this\".\n\n| Pattern | Matches |\n|---|---|\n| `a` | the letter a |\n| `.` | any one character |\n| `[abc]`, `[0-9]` | one of these characters |\n| `\\d`, `\\w`, `\\s` | a digit, a word character, a space |\n| `*` / `+` / `?` | zero or more / one or more / maybe one, of the thing before |\n| `^` and `$` | the start and the end (of the line, with the `m` flag) |\n| `( ... )` | a **group**: remember this part |\n| `\\*` | a real `*` (a backslash turns off the special meaning) |\n\nThe flags after the last slash change how it searches: `g` finds **every** match, not just the first; `m` makes `^` and `$` work per line; `i` ignores capital letters.\n\n```svg The regex /\\*\\*(.+?)\\*\\*/g finds **bold** text and remembers what's inside as group 1\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 110\" font-family=\"ui-monospace, monospace\" font-size=\"12\">\n  <text x=\"10\" y=\"22\">/\\*\\*(.+?)\\*\\*/g</text>\n  <text x=\"10\" y=\"58\">This is **really** good</text>\n  <rect x=\"74\" y=\"44\" width=\"84\" height=\"20\" rx=\"4\" fill=\"none\" stroke=\"#ea580c\" stroke-width=\"2\"/>\n  <rect x=\"90\" y=\"46\" width=\"51\" height=\"16\" rx=\"3\" fill=\"#fde68a\" opacity=\".7\"/>\n  <text x=\"10\" y=\"92\" font-family=\"sans-serif\">whole match: **really** · group 1 ($1): really</text>\n</svg>\n```\n\n`.+?` means \"one or more of anything, but as few as possible\". Without the `?`, `**a** and **b**` would match from the first `**` to the very last, all in one go. That small `?` is the most common regex fix there is.\n\n> Regex is perfect for small, well-shaped patterns like these. Big jobs (full Markdown, or HTML) are better done by a proper parser, which is what the real Bonfire Notes uses on the Python side. This lesson's converter is small on purpose, so every line can be understood.",
   "session": 0,
   "minutes": 12,
   "kind": "read"
  },
  {
   "title": "Escape first, then the inline styles",
   "body": "**Rule one: escape HTML before anything else.** A post containing `<script>` must show those characters, not run them. `escapeHtml` turns `<`, `>`, `&` and quotes into their safe HTML forms (`&lt;` and so on). Every later step adds its own HTML tags to text that's already safe.\n\nThen `inline(text)` handles the styles inside a line, each with `replace` and a group:\n\n```js\n.replace(/`([^`]+)`/g, '<code>$1</code>')\n.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')\n.replace(/\\*(.+?)\\*/g, '<em>$1</em>')\n```\n\n`$1` in the replacement puts back what group 1 matched. Order matters: **bold before italic**, because `**` would otherwise be read as two italic markers.\n\nType in the box and watch the HTML (and the preview) update.",
   "checks": [
    {
     "pane": "js",
     "label": "escaping HTML first",
     "test": "/replace\\(\\s*\\/\\[&<>\"'\\]\\/g/",
     "hint": "s.replace(/[&<>\"']/g, (c) => ...)"
    },
    {
     "pane": "js",
     "label": "bold with a group",
     "test": "/\\\\\\*\\\\\\*\\(\\.\\+\\?\\)\\\\\\*\\\\\\*/",
     "hint": ".replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')"
    },
    {
     "pane": "js",
     "label": "putting the group back with $1",
     "test": "/<strong>\\$1<\\/strong>/",
     "hint": "'<strong>$1</strong>'"
    }
   ],
   "quiz": [
    {
     "q": "Why is HTML escaped before the Markdown styles are turned into tags?",
     "options": [
      "So a `<script>` written in a post shows as text; the converter's own tags are added afterwards to text that's already safe",
      "Escaping makes the regexes faster",
      "Markdown requires it"
     ],
     "answer": 0,
     "why": "Escape the input first, add trusted HTML second. Done the other way round, a post could inject code."
    },
    {
     "q": "Without the `?` in `\\*\\*(.+?)\\*\\*`, what happens to `**a** and **b**`?",
     "options": [
      "Nothing changes",
      "One match from the first ** to the last, making \"a** and **b\" bold",
      "It matches only a"
     ],
     "answer": 1,
     "why": "`.+` is greedy and grabs as much as it can; `.+?` stops at the first closing **."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "page": "<main class=\"wrap\">\n  <label for=\"md\">Markdown</label>\n  <textarea id=\"md\" rows=\"10\">\n# Bonfire notes\n\nRest at the **bonfire** before the *boss*.\n\n- Upgrade the `Estus Flask`\n- Read the [wiki](https://example.com)\n\nText like <script>alert(1)</script> stays text.\n  </textarea>\n  <div class=\"cols\">\n    <section><h2>HTML</h2><pre id=\"html\" class=\"html\"></pre></section>\n    <section><h2>Preview</h2><article id=\"preview\" class=\"preview\"></article></section>\n  </div>\n</main>"
   },
   "css": {
    "base": "body { margin: 0; font-family: system-ui, sans-serif; background: #1c1917; color: #f5f5f4; }\n.wrap { max-width: 760px; margin: 0 auto; padding: 16px; }\nlabel, h2 { font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; color: #fdba74; }\ntextarea { width: 100%; box-sizing: border-box; padding: 10px; font: .9rem ui-monospace, Menlo, Consolas, monospace; background: #292524; color: #fafaf9; border: 1px solid #57534e; border-radius: 10px; }\n.cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }\n.html { min-height: 120px; padding: 10px; overflow: auto; white-space: pre-wrap; font-size: .75rem; background: #0c0a09; border-radius: 10px; color: #a8a29e; }\n.preview { min-height: 120px; padding: 10px; background: #fafaf9; color: #1c1917; border-radius: 10px; }\n.preview code { background: #e7e5e4; padding: 0 4px; border-radius: 4px; }\n.preview a { color: #c2410c; }"
   },
   "js": {
    "escape": "const escapeHtml = (s) => s.replace(/[&<>\"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' }[c]));\nconst md = document.getElementById('md');",
    "inline": "function inline(text) {\n  return escapeHtml(text)\n    .replace(/`([^`]+)`/g, '<code>$1</code>')\n    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')\n    .replace(/\\*(.+?)\\*/g, '<em>$1</em>');\n}\n\nfunction show() {\n  const html = md.value.split('\\n').map(inline).join('<br>\\n');\n  document.getElementById('html').textContent = html;\n  document.getElementById('preview').innerHTML = html;\n}\n\nmd.addEventListener('input', show);\nshow();"
   }
  },
  {
   "title": "Links, and only safe ones",
   "body": "A Markdown link is `[text](url)`. The regex has two groups, one for each part:\n\n```js\n/\\[([^\\]]+)\\]\\(([^)\\s]+)\\)/g\n```\n\nRead it piece by piece: a real `[`, then group 1 is \"one or more characters that aren't `]`\", then `](`, then group 2 is \"characters that aren't `)` or a space\", then `)`.\n\nThere's one more safety rule. A link like `[click](javascript:alert(1))` would run code when clicked, so the converter only keeps links that start with `https://`, `http://`, `mailto:`, `/` or `#`. Anything else is shown as plain text. A function as the replacement (instead of a string) lets the code decide for each match.\n\n```svg A link match has two groups: the text and the address; only safe address schemes become links\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"ui-monospace, monospace\" font-size=\"12\">\n  <text x=\"10\" y=\"24\">[wiki](https://example.com)</text>\n  <rect x=\"17\" y=\"10\" width=\"34\" height=\"20\" rx=\"3\" fill=\"#fde68a\" opacity=\".6\"/><rect x=\"65\" y=\"10\" width=\"155\" height=\"20\" rx=\"3\" fill=\"#bfdbfe\" opacity=\".6\"/>\n  <text x=\"17\" y=\"50\" font-family=\"sans-serif\">$1 = text</text><text x=\"120\" y=\"50\" font-family=\"sans-serif\">$2 = address</text>\n  <text x=\"10\" y=\"84\" font-family=\"sans-serif\" fill=\"#b91c1c\">javascript:… → not a link, shown as text</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "a link with two groups",
     "test": "/\\\\\\[\\(\\[\\^\\\\\\]\\]\\+\\)\\\\\\]\\\\\\(/",
     "hint": "a regex with one group for the text and one for the address"
    },
    {
     "pane": "js",
     "label": "only safe link addresses",
     "test": "/https\\?:/",
     "hint": "SAFE_URL.test(url), where SAFE_URL allows https, http, mailto, / and #"
    }
   ],
   "quiz": [
    {
     "q": "What do `$1` and `$2` hold for `[wiki](https://example.com)`?",
     "options": [
      "\"wiki\" and \"https://example.com\"",
      "\"[wiki]\" and \"(https://example.com)\"",
      "The whole link, twice"
     ],
     "answer": 0,
     "why": "The groups are inside the brackets and parentheses, so they hold just the text and the address."
    },
    {
     "q": "Why is `[click](javascript:alert(1))` not turned into a link?",
     "options": [
      "The regex can't match it",
      "A javascript: link runs code when clicked, so only safe schemes like https: become links",
      "Links can't contain parentheses"
     ],
     "answer": 1,
     "why": "Allow a short list of safe schemes and treat everything else as text."
    }
   ],
   "session": 0,
   "minutes": 12,
   "js": {
    "inline": "const SAFE_URL = /^(https?:|mailto:|\\/|#)/;\n\nfunction inline(text) {\n  return escapeHtml(text)\n    .replace(/`([^`]+)`/g, '<code>$1</code>')\n    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')\n    .replace(/\\*(.+?)\\*/g, '<em>$1</em>')\n    .replace(/\\[([^\\]]+)\\]\\(([^)\\s]+)\\)/g, (whole, label, url) => (SAFE_URL.test(url) ? `<a href=\"${url}\">${label}</a>` : whole));\n}\n\nfunction show() {\n  const html = md.value.split('\\n').map(inline).join('<br>\\n');\n  document.getElementById('html').textContent = html;\n  document.getElementById('preview').innerHTML = html;\n}\n\nmd.addEventListener('input', show);\nshow();"
   }
  },
  {
   "title": "Headings, lists and paragraphs",
   "body": "Inline styles live inside lines; **blocks** are whole lines or groups of lines. The converter walks the lines one at a time and decides what each one is:\n\n- `^(#{1,6})\\s+(.+)$` is a **heading**: the number of `#`s (group 1's length) is the level, `<h1>` to `<h6>`.\n- `^[-*]\\s+(.+)$` is a **list item**. Items next to each other go in one `<ul>`, so the code keeps a list open until a line that isn't an item.\n- A **blank line** ends a paragraph. Other lines are collected and joined into one `<p>`.\n\n```svg Each line is sorted into a heading, a list item or paragraph text; runs of items share one ul, and blank lines close paragraphs\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 130\" font-family=\"sans-serif\" font-size=\"11\">\n  <g font-family=\"ui-monospace, monospace\"><text x=\"10\" y=\"20\"># Bonfire notes</text><text x=\"10\" y=\"44\">Rest at the bonfire…</text><text x=\"10\" y=\"68\">- Upgrade the flask</text><text x=\"10\" y=\"88\">- Read the wiki</text></g>\n  <g><rect x=\"200\" y=\"8\" width=\"120\" height=\"18\" rx=\"4\" fill=\"#fed7aa\"/><text x=\"260\" y=\"21\" text-anchor=\"middle\">&lt;h1&gt;</text>\n  <rect x=\"200\" y=\"32\" width=\"120\" height=\"18\" rx=\"4\" fill=\"#e7e5e4\"/><text x=\"260\" y=\"45\" text-anchor=\"middle\">&lt;p&gt;</text>\n  <rect x=\"200\" y=\"56\" width=\"120\" height=\"38\" rx=\"4\" fill=\"#bfdbfe\"/><text x=\"260\" y=\"79\" text-anchor=\"middle\">&lt;ul&gt; two &lt;li&gt;</text></g>\n  <path d=\"M150 16 H196 M150 40 H196 M150 64 L196 70 M150 84 L196 80\" stroke=\"#78716c\"/>\n</svg>\n```\n\nEvery piece of text still goes through `inline()`, so it's escaped and styled the same way everywhere.",
   "checks": [
    {
     "pane": "js",
     "label": "headings by counting #",
     "test": "/\\^\\(#\\{1,6\\}\\)/",
     "hint": "line.match with a pattern for one to six # signs, a space and the heading text"
    },
    {
     "pane": "js",
     "label": "list items",
     "test": "/\\^\\[-\\*\\]\\\\s\\+/",
     "hint": "line.match with a pattern for a - or * at the start, a space and the item"
    },
    {
     "pane": "js",
     "label": "the heading level from the group's length",
     "test": "/\\.length/",
     "hint": "const level = m[1].length;"
    }
   ],
   "quiz": [
    {
     "q": "What does `## Lists` become?",
     "options": [
      "<h1>Lists</h1>",
      "<h2>Lists</h2>, because group 1 is \"##\" and its length is 2",
      "<p>## Lists</p>"
     ],
     "answer": 1,
     "why": "The number of # characters sets the heading level."
    },
    {
     "q": "Why does the converter keep a list \"open\" between lines?",
     "options": [
      "So items on neighboring lines share one <ul> instead of each getting its own",
      "Lists can't be closed in HTML",
      "To make the regex shorter"
     ],
     "answer": 0,
     "why": "The code remembers it's inside a list until a line that isn't an item, then closes the <ul>."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "blocks": "function toHtml(text) {\n  const out = [];\n  let para = [];\n  let inList = false;\n  const flushPara = () => { if (para.length) out.push(`<p>${para.map(inline).join(' ')}</p>`); para = []; };\n  const closeList = () => { if (inList) out.push('</ul>'); inList = false; };\n\n  for (const line of text.split('\\n')) {\n    const heading = line.match(/^(#{1,6})\\s+(.+)$/);\n    const item = line.match(/^[-*]\\s+(.+)$/);\n    if (heading) {\n      flushPara(); closeList();\n      const level = heading[1].length;\n      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);\n    } else if (item) {\n      flushPara();\n      if (!inList) { out.push('<ul>'); inList = true; }\n      out.push(`<li>${inline(item[1])}</li>`);\n    } else if (!line.trim()) {\n      flushPara(); closeList();\n    } else {\n      closeList();\n      para.push(line.trim());\n    }\n  }\n  flushPara(); closeList();\n  return out.join('\\n');\n}\n\nfunction show() {\n  const html = toHtml(md.value);\n  document.getElementById('html').textContent = html;\n  document.getElementById('preview').innerHTML = html;\n}\n\nmd.addEventListener('input', show);\nshow();"
   }
  }
 ],
 "finish": "You can turn Markdown into HTML now, safely. You learned:\n\n- **Regular expressions**: classes, repeats, groups, `?` for \"as few as possible\", and the `g`, `m` and `i` flags\n- `replace` with **$1**, and with a **function** that decides per match\n- **Escape first**, then add your own tags; only **safe link schemes**\n- **Blocks**: headings by counting `#`, lists kept open across lines, paragraphs ended by blank lines\n\n### Challenges\n\n1. Add numbered lists: `^\\d+\\.\\s+(.+)$` into `<ol>`.\n2. Add fenced code blocks: lines between two ```` ``` ```` lines go into `<pre><code>`, escaped, with no styles applied inside.\n3. Add `> quotes` as `<blockquote>`, joining neighboring lines like paragraphs.\n\n### Next\n\n**Hash routing**: one page that acts like many."
};
