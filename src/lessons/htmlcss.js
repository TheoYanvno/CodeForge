// Built from guides/htmlcss.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "htmlcss",
 "title": "HTML & CSS basics: a profile page",
 "goals": [
  "Write a page with headings, paragraphs, lists, links and images",
  "Give a page structure with header, nav, main, section and footer",
  "Style text and colors with CSS selectors",
  "Use the box model (padding, border, margin) to space things out",
  "Put things in a row with Flexbox and adapt the page to a phone with a media query",
  "Publish a page for free on GitHub Pages"
 ],
 "prereqs": [
  "The Get set up guide (VS Code and a browser installed)",
  "No coding experience needed"
 ],
 "sessions": [
  {
   "title": "Your first page",
   "from": 0,
   "to": 2
  },
  {
   "title": "Styling with CSS",
   "from": 3,
   "to": 4
  },
  {
   "title": "Buttons and layout",
   "from": 5,
   "to": 8
  }
 ],
 "start": {
  "html": {
   "top": "",
   "middle": "",
   "bottom": ""
  },
  "css": {
   "base": "",
   "card": "",
   "buttons": "",
   "layout": "",
   "responsive": ""
  }
 },
 "steps": [
  {
   "title": "Headings and paragraphs",
   "body": "Welcome to your first coding course! By the end you'll have built a personal profile page, the kind you can send to someone or link from a resume: a header with your name, an About card with a picture, a list of what you're learning, and an Email me button. You can see the finished project at [github.com/TheoYanvno/profile-page](https://github.com/TheoYanvno/profile-page).\n\nEvery web page is written in **HTML** (HyperText Markup Language). HTML isn't a programming language: it doesn't calculate anything. It **marks up** text, telling the browser \"this is a heading\" and \"this is a paragraph\", so the browser knows how to show it.\n\n### Elements and tags\n\nYou mark up text with **elements**. Most elements are an opening tag, some content and a closing tag. The closing tag has a slash:\n\n```html\n<h1>Hi, I'm Anthony Evo</h1>\n```\n\n`<h1>` is the biggest heading. There are six levels, `<h1>` to `<h6>`; a page normally has one `<h1>` (its title) and uses `<h2>` for sections. `<p>` is a paragraph.\n\n```svg The parts of an HTML element: opening tag, content and closing tag\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 150\" font-family=\"sans-serif\" font-size=\"15\">\n  <rect width=\"520\" height=\"150\" fill=\"#ffffff\"/>\n  <text x=\"30\" y=\"70\" font-family=\"monospace\" font-size=\"22\"><tspan fill=\"#2563eb\">&lt;h1&gt;</tspan><tspan fill=\"#111827\">Hi, I'm Anthony</tspan><tspan fill=\"#2563eb\">&lt;/h1&gt;</tspan></text>\n  <path d=\"M30 85 h65\" stroke=\"#2563eb\" stroke-width=\"3\"/>\n  <path d=\"M100 85 h150\" stroke=\"#16a34a\" stroke-width=\"3\"/>\n  <path d=\"M255 85 h80\" stroke=\"#2563eb\" stroke-width=\"3\"/>\n  <text x=\"62\" y=\"112\" text-anchor=\"middle\" fill=\"#2563eb\">opening tag</text>\n  <text x=\"175\" y=\"112\" text-anchor=\"middle\" fill=\"#16a34a\">content</text>\n  <text x=\"295\" y=\"112\" text-anchor=\"middle\" fill=\"#2563eb\">closing tag</text>\n  <text x=\"295\" y=\"132\" text-anchor=\"middle\" fill=\"#6b7280\" font-size=\"13\">(note the slash)</text>\n  <text x=\"360\" y=\"40\" fill=\"#111827\">The whole thing</text>\n  <text x=\"360\" y=\"60\" fill=\"#111827\">is one element.</text>\n</svg>\n```\n\n### What to write\n\nIn your `index.html`, write an `<h1>` with your name and a `<p>` that says a sentence or two about you. Use your own name and words instead of Anthony's: it's your page.\n\n> Tip: in VS Code, type `h1` and press Tab, and Emmet writes `<h1></h1>` for you with the cursor in the middle.\n\n### Why it's built this way\n\nHeadings aren't just big text. Screen readers let blind users jump from heading to heading, and search engines read them to learn what the page is about. Choose a heading for what it **means**, not how big it looks; CSS changes the size later.",
   "checks": [
    {
     "pane": "html",
     "label": "an <h1> heading with text",
     "test": "/<h1[^>]*>[^<]+<\\/h1>/",
     "hint": "Write <h1>Your name</h1>"
    },
    {
     "pane": "html",
     "label": "a paragraph with text",
     "test": "/<p[^>]*>[^<]+/",
     "hint": "Write <p>A sentence about you</p>"
    }
   ],
   "quiz": [
    {
     "q": "What does a closing tag look like?",
     "options": [
      "`<h1>` again",
      "The same name with a slash: `</h1>`",
      "`<end>`"
     ],
     "answer": 1,
     "why": "The slash marks the end of the element; everything between the opening and closing tags is its content."
    },
    {
     "q": "How many `<h1>` headings should a normal page have?",
     "options": [
      "One, for the page's main title",
      "One for every paragraph",
      "None; use `<p>` with big text"
     ],
     "answer": 0,
     "why": "One `<h1>` names the page; sections below it use `<h2>`, `<h3>` and so on."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "top": "<h1>Hi, I'm Anthony Evo</h1>\n<p>I'm learning to build websites, and this page is my first project.</p>"
   }
  },
  {
   "title": "Lists, links and an image",
   "body": "Now some content worth reading: a list of what you're learning, a link and a picture.\n\n### Lists\n\n`<ul>` is an **unordered list** (bullets). Each item is an `<li>` (list item) inside it. Use `<ol>` instead when the order matters, like steps in a recipe; the browser numbers them for you. Elements inside other elements are **nested**; indenting them makes that easy to see.\n\n### Links\n\nA link is an `<a>` (anchor) element. Its `href` **attribute** says where it goes:\n\n```html\n<a href=\"https://github.com/\">GitHub</a>\n```\n\nAttributes go inside the opening tag as `name=\"value\"`. They add information the browser needs but doesn't show as text.\n\n### Images\n\n`<img>` is an **empty element**: it has no content and no closing tag. Its `src` attribute says which picture to show, and `alt` describes the picture in words for people who can't see it (and shows if the picture fails to load).\n\nNormally `src` is a file in the same folder, like `src=\"photo.jpg\"`. So this page works anywhere without extra files, we use a tiny picture written as a **data URL**: the drawing itself is inside the `src`. It's a blue circle with initials. Later you can swap in `src=\"photo.jpg\"` and put your photo next to `index.html`.\n\n### What to write\n\nUnder your paragraph: an `<h2>`, a `<ul>` with three `<li>` items, another `<h2>`, a paragraph with a link, and an `<img>` with an `alt`.",
   "checks": [
    {
     "pane": "html",
     "label": "a bullet list with items",
     "test": "/<ul>[\\s\\S]*<li>[\\s\\S]*<\\/ul>/",
     "hint": "Write <ul> with <li> items inside"
    },
    {
     "pane": "html",
     "label": "a link with an href",
     "test": "/<a\\s[^>]*href=[\"'][^\"']+[\"']/",
     "hint": "Write <a href=\"https://...\">text</a>"
    },
    {
     "pane": "html",
     "label": "an image with alt text",
     "test": "/<img[^>]*alt=[\"'][^\"']+[\"']/",
     "hint": "Add alt=\"a description\" to the <img>"
    }
   ],
   "quiz": [
    {
     "q": "Which attribute says where a link goes?",
     "options": [
      "`src`",
      "`alt`",
      "`href`"
     ],
     "answer": 2,
     "why": "`href` (hypertext reference) is the link's address; `src` is for images and scripts."
    },
    {
     "q": "Why does every image need `alt` text?",
     "options": [
      "It makes the image load faster",
      "It describes the image for screen readers and shows if the image can't load",
      "The browser won't show images without it"
     ],
     "answer": 1,
     "why": "Alt text is how people who can't see the picture know what it shows."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "middle": "<h2>What I'm learning</h2>\n<ul>\n  <li>HTML gives a page its structure</li>\n  <li>CSS gives it colors and layout</li>\n  <li>JavaScript makes it do things</li>\n</ul>\n\n<h2>Find me online</h2>\n<p>See my code on <a href=\"https://github.com/\">GitHub</a>.</p>\n\n<img class=\"avatar\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%232563eb'/%3E%3Ctext x='50' y='62' font-size='34' text-anchor='middle' fill='white' font-family='sans-serif'%3EAE%3C/text%3E%3C/svg%3E\" alt=\"The initials AE in a blue circle\">"
   }
  },
  {
   "title": "Give the page structure",
   "body": "Right now the page is one long column of things. Real pages group their content into areas, and HTML has an element for each one. These are called **semantic elements** because their names say what they mean:\n\n| Element | What it holds |\n|---|---|\n| `<header>` | The top of the page: the name or logo, often the menu |\n| `<nav>` | A group of links for getting around |\n| `<main>` | The page's main content (one per page) |\n| `<section>` | One part of the content, usually with a heading |\n| `<footer>` | The bottom of the page: credits, small print |\n\n```svg How the profile page is organized: header with nav at the top, main with three sections, footer at the bottom\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 360 290\" font-family=\"sans-serif\" font-size=\"14\">\n  <rect width=\"360\" height=\"290\" fill=\"#ffffff\"/>\n  <rect x=\"20\" y=\"10\" width=\"320\" height=\"44\" rx=\"6\" fill=\"#111827\"/>\n  <text x=\"34\" y=\"37\" fill=\"#ffffff\">header</text>\n  <rect x=\"190\" y=\"18\" width=\"140\" height=\"28\" rx=\"4\" fill=\"#374151\"/>\n  <text x=\"260\" y=\"37\" fill=\"#ffffff\" text-anchor=\"middle\">nav</text>\n  <rect x=\"20\" y=\"64\" width=\"320\" height=\"176\" rx=\"6\" fill=\"#eef2ff\" stroke=\"#6366f1\"/>\n  <text x=\"34\" y=\"84\" fill=\"#4338ca\">main</text>\n  <rect x=\"40\" y=\"94\" width=\"280\" height=\"40\" rx=\"6\" fill=\"#ffffff\" stroke=\"#9ca3af\"/>\n  <text x=\"56\" y=\"119\" fill=\"#111827\">section#about (picture, intro)</text>\n  <rect x=\"40\" y=\"142\" width=\"280\" height=\"40\" rx=\"6\" fill=\"#ffffff\" stroke=\"#9ca3af\"/>\n  <text x=\"56\" y=\"167\" fill=\"#111827\">section#learning (the list)</text>\n  <rect x=\"40\" y=\"190\" width=\"280\" height=\"40\" rx=\"6\" fill=\"#ffffff\" stroke=\"#9ca3af\"/>\n  <text x=\"56\" y=\"215\" fill=\"#111827\">section#contact (link, button)</text>\n  <rect x=\"20\" y=\"250\" width=\"320\" height=\"32\" rx=\"6\" fill=\"#f3f4f6\" stroke=\"#9ca3af\"/>\n  <text x=\"34\" y=\"271\" fill=\"#374151\">footer</text>\n</svg>\n```\n\nThey look the same as plain boxes until you add CSS, but they help screen readers (\"skip to main content\"), search engines and you: months later, `<footer>` is easier to find than the fifth `<div>`.\n\n### ids and classes\n\n- `id=\"about\"` gives one element a unique name. A link to `#about` scrolls straight to it, which is how the menu works.\n- `class=\"card\"` puts an element in a group. Many elements can share a class, and in the next steps CSS styles every `.card` at once.\n\n### What to write\n\nWrap your name in a `<header>` with a `<nav>` of three links (`#about`, `#learning`, `#contact`). Put the content in `<main>`, split into three `<section>`s with those ids and `class=\"card\"`, and end with a `<footer>`. Move the picture into the About section. The code view shows exactly where each line goes.",
   "checks": [
    {
     "pane": "html",
     "label": "a <header> with a <nav> inside",
     "test": "/<header[\\s\\S]*<nav[\\s\\S]*<\\/nav>[\\s\\S]*<\\/header>/",
     "hint": "Put <nav> inside <header>"
    },
    {
     "pane": "html",
     "label": "a <main> element",
     "test": "/<main[\\s>]/"
    },
    {
     "pane": "html",
     "label": "three sections with ids",
     "test": "/<section[^>]*id=[\\s\\S]*<section[^>]*id=[\\s\\S]*<section[^>]*id=/",
     "hint": "Give each <section> an id: about, learning and contact"
    },
    {
     "pane": "html",
     "label": "a <footer>",
     "test": "/<footer[\\s>]/"
    }
   ],
   "quiz": [
    {
     "q": "What does a link to `#contact` do?",
     "options": [
      "Opens a new website called contact",
      "Scrolls to the element with `id=\"contact\"` on the same page",
      "Sends an email"
     ],
     "answer": 1,
     "why": "A `#` followed by an id points to that element on the current page."
    },
    {
     "q": "What's the difference between an id and a class?",
     "options": [
      "There's no difference",
      "An id is unique to one element; a class can be shared by many",
      "Classes are only for links"
     ],
     "answer": 1,
     "why": "Use an id to point at one thing (like a menu target), and a class for a group you'll style together."
    }
   ],
   "session": 0,
   "minutes": 15,
   "html": {
    "top": "<header class=\"site-head\">\n  <h1>Anthony Evo</h1>\n  <nav>\n    <a href=\"#about\">About</a>\n    <a href=\"#learning\">Learning</a>\n    <a href=\"#contact\">Contact</a>\n  </nav>\n</header>\n\n<main>\n  <section id=\"about\" class=\"card\">\n    <img class=\"avatar\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%232563eb'/%3E%3Ctext x='50' y='62' font-size='34' text-anchor='middle' fill='white' font-family='sans-serif'%3EAE%3C/text%3E%3C/svg%3E\" alt=\"The initials AE in a blue circle\">\n    <h2>Hi, I'm Anthony</h2>\n    <p>I'm learning to build websites, and this page is my first project.</p>\n  </section>",
    "middle": "  <section id=\"learning\" class=\"card\">\n    <h2>What I'm learning</h2>\n    <ul>\n      <li>HTML gives a page its structure</li>\n      <li>CSS gives it colors and layout</li>\n      <li>JavaScript makes it do things</li>\n    </ul>\n  </section>\n\n  <section id=\"contact\" class=\"card\">\n    <h2>Find me online</h2>\n    <p>See my code on <a href=\"https://github.com/\">GitHub</a>.</p>\n  </section>",
    "bottom": "</main>\n\n<footer>\n  <p>Made by Anthony Evo with HTML and CSS.</p>\n</footer>"
   }
  },
  {
   "title": "CSS: selectors, colors and fonts",
   "body": "**CSS** (Cascading Style Sheets) decides how the HTML looks. A CSS file is a list of **rules**. Each rule has a **selector** that picks elements, and **declarations** that say what to change:\n\n```css\nbody {\n  color: #1f2937;\n}\n```\n\n`body` is the selector (every `<body>`, so the whole page). Inside the braces, `color` is a **property** and `#1f2937` is its **value**; each declaration ends with a semicolon.\n\n```svg The parts of a CSS rule: a selector, then declarations made of a property and a value\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 500 160\" font-family=\"sans-serif\" font-size=\"14\">\n  <rect width=\"500\" height=\"160\" fill=\"#ffffff\"/>\n  <text x=\"30\" y=\"50\" font-family=\"monospace\" font-size=\"20\" fill=\"#7c3aed\">body</text>\n  <text x=\"90\" y=\"50\" font-family=\"monospace\" font-size=\"20\" fill=\"#111827\">{</text>\n  <text x=\"60\" y=\"85\" font-family=\"monospace\" font-size=\"20\"><tspan fill=\"#2563eb\">color</tspan><tspan fill=\"#111827\">: </tspan><tspan fill=\"#16a34a\">#1f2937</tspan><tspan fill=\"#111827\">;</tspan></text>\n  <text x=\"30\" y=\"120\" font-family=\"monospace\" font-size=\"20\" fill=\"#111827\">}</text>\n  <text x=\"300\" y=\"45\" fill=\"#7c3aed\">selector: which elements</text>\n  <text x=\"300\" y=\"80\" fill=\"#2563eb\">property: what to change</text>\n  <text x=\"300\" y=\"100\" fill=\"#16a34a\">value: what to change it to</text>\n  <text x=\"300\" y=\"130\" fill=\"#6b7280\">property + value = a declaration</text>\n</svg>\n```\n\n### Selectors you'll use most\n\n| Selector | Picks | Example |\n|---|---|---|\n| `p` | every element of that type | all paragraphs |\n| `.card` | every element with that class | `class=\"card\"` |\n| `#about` | the one element with that id | `id=\"about\"` |\n| `h1, h2` | several selectors at once | both heading levels |\n| `nav a` | elements inside other elements | links inside the nav |\n\n### Colors and fonts\n\nColors can be names (`white`), or **hex codes** like `#2563eb`: red, green and blue amounts from `00` to `ff`. VS Code shows a little color square next to each one; click it to pick a color. `font-family` lists fonts in order of preference; `system-ui` uses the computer's own interface font, so it looks native everywhere.\n\n### Linking the CSS file\n\nIn a real project the CSS lives in `style.css`, and the HTML loads it with one line in the `<head>`: `<link rel=\"stylesheet\" href=\"style.css\">`. The code view here keeps them in separate tabs and joins them when you **See it run**; the last step shows the complete `index.html`.",
   "checks": [
    {
     "pane": "css",
     "label": "a body rule with a font",
     "test": "/body\\s*\\{[^}]*font-family/",
     "hint": "Add font-family inside body { }"
    },
    {
     "pane": "css",
     "label": "a text color and a background color",
     "test": "/body\\s*\\{(?=[^}]*[^-]color\\s*:)(?=[^}]*background)/",
     "hint": "Give body a color and a background"
    }
   ],
   "quiz": [
    {
     "q": "In `h2 { color: navy; }`, what is `h2`?",
     "options": [
      "The selector",
      "The property",
      "The value"
     ],
     "answer": 0,
     "why": "The selector comes before the braces and picks which elements the rule applies to."
    },
    {
     "q": "Which selector styles every element with `class=\"card\"`?",
     "options": [
      "`card`",
      "`#card`",
      "`.card`"
     ],
     "answer": 2,
     "why": "A dot means a class and a `#` means an id; a bare word means an element type."
    }
   ],
   "session": 1,
   "minutes": 15,
   "css": {
    "base": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  line-height: 1.6;\n  color: #1f2937;\n  background: #f3f4f6;\n}\n\nh1, h2 {\n  line-height: 1.2;\n}\n\na {\n  color: #2563eb;\n}"
   }
  },
  {
   "title": "The box model: padding, border and margin",
   "body": "Every element on a page is a rectangle, even if it doesn't look like one. CSS gives every box the same four layers, and learning them is the key to spacing things out:\n\n```svg The CSS box model: content in the middle, then padding, then the border, then margin on the outside\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 260\" font-family=\"sans-serif\" font-size=\"14\">\n  <rect width=\"400\" height=\"260\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"10\" width=\"380\" height=\"240\" fill=\"#fde68a\"/>\n  <text x=\"22\" y=\"32\" fill=\"#92400e\">margin (space outside, transparent)</text>\n  <rect x=\"50\" y=\"45\" width=\"300\" height=\"170\" fill=\"#374151\"/>\n  <text x=\"62\" y=\"64\" fill=\"#ffffff\">border</text>\n  <rect x=\"60\" y=\"72\" width=\"280\" height=\"134\" fill=\"#bbf7d0\"/>\n  <text x=\"72\" y=\"92\" fill=\"#166534\">padding (space inside)</text>\n  <rect x=\"110\" y=\"108\" width=\"180\" height=\"70\" fill=\"#bfdbfe\"/>\n  <text x=\"200\" y=\"148\" text-anchor=\"middle\" fill=\"#1e3a8a\">content</text>\n</svg>\n```\n\n- **content**: the text or picture itself.\n- **padding**: space between the content and the border. It takes the box's background color.\n- **border**: a line around the padding. `border: 1px solid #e5e7eb` is width, style and color.\n- **margin**: space outside the border, pushing other boxes away. Always transparent.\n\n`padding: 24px` sets all four sides. `margin: 16px 0` is two values: top and bottom 16px, left and right 0. `border-radius` rounds the corners, and `border-radius: 50%` on a square makes a circle, which is how the avatar becomes round.\n\n### What to write\n\nA `.card` rule that turns each section into a white card with padding, a border, rounded corners and margin between cards. And an `.avatar` rule that makes the picture 96 pixels and round.\n\n> Tip: in the browser, right-click an element, choose **Inspect**, and the developer tools draw this exact diagram for that element with its real numbers.",
   "checks": [
    {
     "pane": "css",
     "label": "cards have padding",
     "test": "/\\.card\\s*\\{[^}]*padding/",
     "hint": "Add padding inside .card { }"
    },
    {
     "pane": "css",
     "label": "cards have a border",
     "test": "/\\.card\\s*\\{[^}]*border\\s*:/",
     "hint": "Add border: 1px solid #e5e7eb"
    },
    {
     "pane": "css",
     "label": "cards have margin between them",
     "test": "/\\.card\\s*\\{[^}]*margin/",
     "hint": "Add margin: 16px 0"
    },
    {
     "pane": "css",
     "label": "a round avatar",
     "test": "/\\.avatar\\s*\\{[^}]*border-radius\\s*:\\s*50%/",
     "hint": "Add border-radius: 50% to .avatar"
    }
   ],
   "quiz": [
    {
     "q": "Which layer is the space *inside* the border, around the content?",
     "options": [
      "Margin",
      "Padding",
      "Outline"
     ],
     "answer": 1,
     "why": "Padding is inside the border and takes the background color; margin is outside and transparent."
    },
    {
     "q": "What does `margin: 16px 0` mean?",
     "options": [
      "16px on the top and bottom, 0 on the left and right",
      "16px on the left, 0 on the right",
      "16px on every side, then 0 extra"
     ],
     "answer": 0,
     "why": "With two values, the first is top and bottom and the second is left and right."
    }
   ],
   "session": 1,
   "minutes": 15,
   "css": {
    "card": ".card {\n  background: #ffffff;\n  padding: 24px;\n  margin: 16px 0;\n  border: 1px solid #e5e7eb;\n  border-radius: 12px;\n}\n\n.avatar {\n  width: 96px;\n  height: 96px;\n  border-radius: 50%;\n}"
   }
  },
  {
   "title": "A button with a hover effect",
   "body": "A profile page needs a clear next step for the visitor: an **Email me** button. It's really a link (`<a>`), because it goes somewhere. A `mailto:` address opens the visitor's email app with your address filled in. Giving the link `class=\"btn\"` lets CSS make it look like a button.\n\n### Pseudo-classes\n\n`.btn:hover` is a selector with a **pseudo-class**: it only matches while the mouse is over the element. Others you'll meet: `:focus` (selected with the keyboard), `:first-child` and `:visited`.\n\n```css\n.btn:hover {\n  background: #1d4ed8;\n}\n```\n\n### Display\n\nLinks are **inline** elements: they flow inside a line of text like words, and they ignore padding on the top and bottom. `display: inline-block` keeps the button in line but lets padding and size work properly. `text-decoration: none` removes the underline.",
   "checks": [
    {
     "pane": "html",
     "label": "a link with class \"btn\"",
     "test": "/<a[^>]*class=[\"'][^\"']*\\bbtn\\b/",
     "hint": "Add class=\"btn\" to the Email me link"
    },
    {
     "pane": "css",
     "label": "the button changes on hover",
     "test": "/\\.btn:hover\\s*\\{/",
     "hint": "Add a .btn:hover { } rule"
    }
   ],
   "quiz": [
    {
     "q": "When does `.btn:hover` apply?",
     "options": [
      "Always",
      "Only while the mouse pointer is over the button",
      "Only after the button is clicked"
     ],
     "answer": 1,
     "why": "`:hover` is a state: the styles turn on while the pointer is over the element and off when it leaves."
    },
    {
     "q": "Why is the Email me button an `<a>` and not a `<button>`?",
     "options": [
      "It goes somewhere (opens an email), and going somewhere is what links are for",
      "Buttons can't have colors",
      "`<button>` doesn't exist in HTML"
     ],
     "answer": 0,
     "why": "Use `<a>` for navigation and `<button>` for actions on the page, like submitting a form."
    }
   ],
   "session": 2,
   "minutes": 12,
   "html": {
    "middle": "  <section id=\"learning\" class=\"card\">\n    <h2>What I'm learning</h2>\n    <ul>\n      <li>HTML gives a page its structure</li>\n      <li>CSS gives it colors and layout</li>\n      <li>JavaScript makes it do things</li>\n    </ul>\n  </section>\n\n  <section id=\"contact\" class=\"card\">\n    <h2>Find me online</h2>\n    <p>See my code on <a href=\"https://github.com/\">GitHub</a>.</p>\n    <a class=\"btn\" href=\"mailto:anthony@example.com\">Email me</a>\n  </section>"
   },
   "css": {
    "buttons": ".btn {\n  display: inline-block;\n  padding: 10px 18px;\n  border-radius: 8px;\n  background: #2563eb;\n  color: #ffffff;\n  text-decoration: none;\n  font-weight: 600;\n}\n\n.btn:hover {\n  background: #1d4ed8;\n}"
   }
  },
  {
   "title": "Flexbox: the header in one row",
   "body": "Block elements like `<h1>` and `<nav>` stack on top of each other by default. To put the name on the left and the menu on the right, use **Flexbox**: set `display: flex` on the **parent**, and its children line up in a row.\n\n```svg Flexbox: display flex on the header puts its children in a row; justify-content spreads them out and align-items centers them up and down\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 440 200\" font-family=\"sans-serif\" font-size=\"14\">\n  <rect width=\"440\" height=\"200\" fill=\"#ffffff\"/>\n  <text x=\"20\" y=\"24\" fill=\"#6b7280\">Without flex: stacked</text>\n  <rect x=\"20\" y=\"32\" width=\"180\" height=\"26\" fill=\"#bfdbfe\"/><text x=\"30\" y=\"50\">h1</text>\n  <rect x=\"20\" y=\"62\" width=\"180\" height=\"26\" fill=\"#bbf7d0\"/><text x=\"30\" y=\"80\">nav</text>\n  <text x=\"20\" y=\"124\" fill=\"#6b7280\">display: flex; justify-content: space-between</text>\n  <rect x=\"20\" y=\"134\" width=\"400\" height=\"50\" fill=\"none\" stroke=\"#111827\" stroke-dasharray=\"4 3\"/>\n  <rect x=\"28\" y=\"146\" width=\"110\" height=\"26\" fill=\"#bfdbfe\"/><text x=\"38\" y=\"164\">h1</text>\n  <rect x=\"302\" y=\"146\" width=\"110\" height=\"26\" fill=\"#bbf7d0\"/><text x=\"312\" y=\"164\">nav</text>\n  <path d=\"M146 159 H294\" stroke=\"#6b7280\" stroke-dasharray=\"3 3\"/>\n  <text x=\"220\" y=\"154\" text-anchor=\"middle\" fill=\"#6b7280\" font-size=\"12\">free space between</text>\n</svg>\n```\n\n| Property (on the parent) | What it does |\n|---|---|\n| `display: flex` | Children line up in a row |\n| `justify-content: space-between` | Push the first child left and the last right |\n| `align-items: center` | Center children up and down |\n| `gap: 16px` | Space between the children |\n\nThe nav is a flex container too, so its three links sit in a row with a gap between them. The same idea builds most layouts you'll see.\n\n### Keeping lines readable\n\n`main { max-width: 720px; margin: 0 auto; }` stops the text getting too wide on big screens (long lines are hard to read) and `margin: 0 auto` centers it: auto margins on the left and right split the leftover space equally.",
   "checks": [
    {
     "pane": "css",
     "label": "the header is a flex row",
     "test": "/\\.site-head\\s*\\{[^}]*display\\s*:\\s*flex/",
     "hint": "Add display: flex to .site-head"
    },
    {
     "pane": "css",
     "label": "the nav links have a gap",
     "test": "/nav\\s*\\{[^}]*gap\\s*:/",
     "hint": "Add display: flex and gap: 16px to .site-head nav"
    },
    {
     "pane": "css",
     "label": "main has a maximum width",
     "test": "/main\\s*\\{[^}]*max-width/",
     "hint": "Add max-width: 720px to main"
    }
   ],
   "quiz": [
    {
     "q": "Where do you put `display: flex`?",
     "options": [
      "On the parent whose children should line up",
      "On each child",
      "On the `<body>` only"
     ],
     "answer": 0,
     "why": "Flex is set on the container; its direct children become flex items."
    },
    {
     "q": "What does `margin: 0 auto` do to a box with a `max-width`?",
     "options": [
      "Removes all its space",
      "Centers it horizontally",
      "Makes it full width"
     ],
     "answer": 1,
     "why": "Auto margins on both sides share the leftover width equally, so the box sits in the middle."
    }
   ],
   "session": 2,
   "minutes": 15,
   "css": {
    "layout": ".site-head {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 24px;\n  background: #111827;\n  color: #ffffff;\n}\n\n.site-head h1 {\n  margin: 0;\n  font-size: 1.25rem;\n}\n\n.site-head nav {\n  display: flex;\n  gap: 16px;\n}\n\n.site-head a {\n  color: #ffffff;\n  text-decoration: none;\n}\n\nmain {\n  max-width: 720px;\n  margin: 0 auto;\n  padding: 0 16px;\n}\n\nfooter {\n  text-align: center;\n  color: #6b7280;\n  padding: 24px;\n}"
   }
  },
  {
   "title": "Fit any screen: a media query",
   "body": "More than half of web visits are on phones. On a narrow screen the name and the three menu links don't fit in one row. A **media query** is a block of CSS that only applies when a condition is true, such as \"the screen is 600 pixels wide or less\":\n\n```css\n@media (max-width: 600px) {\n  /* rules here only apply on narrow screens */\n}\n```\n\nInside it, `flex-direction: column` changes the header from a row to a column, so the name sits above the menu.\n\n### The viewport tag\n\nPhones pretend to be a wide desktop screen unless the page says otherwise. Every real page needs this line in its `<head>`, or media queries won't work on phones:\n\n```html\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n```\n\n(See it run adds it for you; the full `index.html` in the next step includes it.)\n\n> Tip: test it by making the browser window narrow, or open the developer tools (F12) and click the phone icon to pretend to be a phone.",
   "checks": [
    {
     "pane": "css",
     "label": "a media query for narrow screens",
     "test": "/@media\\s*\\(\\s*max-width\\s*:\\s*\\d+px\\s*\\)/",
     "hint": "Add @media (max-width: 600px) { ... }"
    },
    {
     "pane": "css",
     "label": "the header stacks on a phone",
     "test": "/@media[\\s\\S]*flex-direction\\s*:\\s*column/",
     "hint": "Inside the media query, give .site-head flex-direction: column"
    }
   ],
   "quiz": [
    {
     "q": "When do the rules inside `@media (max-width: 600px)` apply?",
     "options": [
      "When the page is 600 pixels wide or narrower",
      "Only on screens wider than 600 pixels",
      "Only when printing"
     ],
     "answer": 0,
     "why": "`max-width: 600px` means \"up to 600px\", so the rules switch on for phones and small windows."
    },
    {
     "q": "What happens on a phone if the page has no viewport meta tag?",
     "options": [
      "Nothing, it's optional",
      "The phone acts like a wide screen and shrinks the page, so media queries don't kick in",
      "The page won't load"
     ],
     "answer": 1,
     "why": "The viewport tag tells the phone to use its real width, which is what the media query measures."
    }
   ],
   "session": 2,
   "minutes": 12,
   "css": {
    "responsive": "@media (max-width: 600px) {\n  .site-head {\n    flex-direction: column;\n    gap: 8px;\n  }\n}"
   }
  },
  {
   "title": "Put it online with GitHub Pages",
   "body": "You built a real page. Now put it on the internet for free, at an address like `https://yourname.github.io/profile-page/`. This is the same way all my projects are published.\n\n### 1. The two files\n\nMake a folder called `profile-page` with two files. `index.html` is a complete page: the `<head>` holds the title, the viewport tag and the link to your CSS, and your HTML from this guide goes in the `<body>`:\n\n```html\n<!doctype html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Anthony Evo</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <!-- your header, main and footer go here -->\n</body>\n</html>\n```\n\n`style.css` holds all the CSS from this guide. Use the **style.css** tab on the last code step and **Copy this file**. Open `index.html` with **Live Server** (from the Get set up guide) to check it looks right.\n\n### 2. Save it in Git and push it to GitHub\n\nIn VS Code's terminal, inside the folder:\n\n```text\ngit init\ngit add .\ngit commit -m \"My profile page\"\n```\n\nOn github.com, click **+** → **New repository**, name it `profile-page`, make it **Public**, and don't add a README. GitHub shows the commands to connect your folder; they look like this:\n\n```text\ngit remote add origin https://github.com/YOUR-NAME/profile-page.git\ngit branch -M main\ngit push -u origin main\n```\n\n### 3. Turn on GitHub Pages\n\nIn the repository, open **Settings** → **Pages**, set **Source** to **Deploy from a branch**, choose **main** and **/ (root)**, and save. After a minute your page is live at `https://YOUR-NAME.github.io/profile-page/`.\n\nFrom now on, publishing a change is: edit, `git add .`, `git commit -m \"what changed\"`, `git push`. The site updates by itself.\n\n### See mine\n\nThe finished version of this project is at [github.com/TheoYanvno/profile-page](https://github.com/TheoYanvno/profile-page).",
   "quiz": [
    {
     "q": "Which file name does GitHub Pages show first when someone visits your site?",
     "options": [
      "`home.html`",
      "`index.html`",
      "`style.css`"
     ],
     "answer": 1,
     "why": "Web servers show `index.html` when the address names a folder, so it's always your home page."
    }
   ],
   "session": 2,
   "kind": "read",
   "minutes": 20
  }
 ],
 "finish": "You built and published a complete web page. Along the way you used:\n\n- **HTML** elements and attributes: headings, paragraphs, lists, links, images\n- **Semantic structure**: header, nav, main, section, footer, plus ids and classes\n- **CSS** rules and selectors, colors and fonts\n- The **box model**: padding, border, margin and border-radius\n- **Flexbox** for rows, `max-width` and `margin: 0 auto` for readable, centered content\n- A **media query** so it works on phones\n- **Git, GitHub and GitHub Pages** to publish it\n\n### Challenges\n\n1. Add a **Projects** section with a card for each project you build in these guides, and add it to the menu.\n2. Make the menu link for the section you're in look different with `:hover` and `:focus`.\n3. Try a dark theme: change the colors in `body`, `.card` and `.site-head`.\n\n### Next\n\nThe **JavaScript basics** guide makes a page that *does* something: a tip calculator that updates as you type."
};
