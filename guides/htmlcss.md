---
id: htmlcss
title: HTML & CSS basics: a profile page
blocks-html: top, middle, bottom
blocks-css: base, card, buttons, layout, responsive
goals: Write a page with headings, paragraphs, lists, links and images; Give a page structure with header, nav, main, section and footer; Style text and colors with CSS selectors; Use the box model (padding, border, margin) to space things out; Put things in a row with Flexbox and adapt the page to a phone with a media query; Publish a page for free on GitHub Pages
prereqs: The Get set up guide (VS Code and a browser installed); No coding experience needed
---

## Session: Your first page

## Step: Headings and paragraphs
time: 12

Welcome to your first coding course! By the end you'll have built a personal profile page, the kind you can send to someone or link from a resume: a header with your name, an About card with a picture, a list of what you're learning, and an Email me button. You can see the finished project at [github.com/TheoYanvno/profile-page](https://github.com/TheoYanvno/profile-page).

Every web page is written in **HTML** (HyperText Markup Language). HTML isn't a programming language: it doesn't calculate anything. It **marks up** text, telling the browser "this is a heading" and "this is a paragraph", so the browser knows how to show it.

### Elements and tags

You mark up text with **elements**. Most elements are an opening tag, some content and a closing tag. The closing tag has a slash:

```html
<h1>Hi, I'm Anthony Evo</h1>
```

`<h1>` is the biggest heading. There are six levels, `<h1>` to `<h6>`; a page normally has one `<h1>` (its title) and uses `<h2>` for sections. `<p>` is a paragraph.

```svg The parts of an HTML element: opening tag, content and closing tag
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 150" font-family="sans-serif" font-size="15">
  <rect width="520" height="150" fill="#ffffff"/>
  <text x="30" y="70" font-family="monospace" font-size="22"><tspan fill="#2563eb">&lt;h1&gt;</tspan><tspan fill="#111827">Hi, I'm Anthony</tspan><tspan fill="#2563eb">&lt;/h1&gt;</tspan></text>
  <path d="M30 85 h65" stroke="#2563eb" stroke-width="3"/>
  <path d="M100 85 h150" stroke="#16a34a" stroke-width="3"/>
  <path d="M255 85 h80" stroke="#2563eb" stroke-width="3"/>
  <text x="62" y="112" text-anchor="middle" fill="#2563eb">opening tag</text>
  <text x="175" y="112" text-anchor="middle" fill="#16a34a">content</text>
  <text x="295" y="112" text-anchor="middle" fill="#2563eb">closing tag</text>
  <text x="295" y="132" text-anchor="middle" fill="#6b7280" font-size="13">(note the slash)</text>
  <text x="360" y="40" fill="#111827">The whole thing</text>
  <text x="360" y="60" fill="#111827">is one element.</text>
</svg>
```

### What to write

In your `index.html`, write an `<h1>` with your name and a `<p>` that says a sentence or two about you. Use your own name and words instead of Anthony's: it's your page.

> Tip: in VS Code, type `h1` and press Tab, and Emmet writes `<h1></h1>` for you with the cursor in the middle.

### Why it's built this way

Headings aren't just big text. Screen readers let blind users jump from heading to heading, and search engines read them to learn what the page is about. Choose a heading for what it **means**, not how big it looks; CSS changes the size later.

check: html | an <h1> heading with text | /<h1[^>]*>[^<]+<\/h1>/ | Write <h1>Your name</h1>
check: html | a paragraph with text | /<p[^>]*>[^<]+/ | Write <p>A sentence about you</p>

quiz: What does a closing tag look like?
- [ ] `<h1>` again
- [x] The same name with a slash: `</h1>`
- [ ] `<end>`
why: The slash marks the end of the element; everything between the opening and closing tags is its content.

quiz: How many `<h1>` headings should a normal page have?
- [x] One, for the page's main title
- [ ] One for every paragraph
- [ ] None; use `<p>` with big text
why: One `<h1>` names the page; sections below it use `<h2>`, `<h3>` and so on.

```html top
<h1>Hi, I'm Anthony Evo</h1>
<p>I'm learning to build websites, and this page is my first project.</p>
```

## Step: Lists, links and an image
time: 15

Now some content worth reading: a list of what you're learning, a link and a picture.

### Lists

`<ul>` is an **unordered list** (bullets). Each item is an `<li>` (list item) inside it. Use `<ol>` instead when the order matters, like steps in a recipe; the browser numbers them for you. Elements inside other elements are **nested**; indenting them makes that easy to see.

### Links

A link is an `<a>` (anchor) element. Its `href` **attribute** says where it goes:

```html
<a href="https://github.com/">GitHub</a>
```

Attributes go inside the opening tag as `name="value"`. They add information the browser needs but doesn't show as text.

### Images

`<img>` is an **empty element**: it has no content and no closing tag. Its `src` attribute says which picture to show, and `alt` describes the picture in words for people who can't see it (and shows if the picture fails to load).

Normally `src` is a file in the same folder, like `src="photo.jpg"`. So this page works anywhere without extra files, we use a tiny picture written as a **data URL**: the drawing itself is inside the `src`. It's a blue circle with initials. Later you can swap in `src="photo.jpg"` and put your photo next to `index.html`.

### What to write

Under your paragraph: an `<h2>`, a `<ul>` with three `<li>` items, another `<h2>`, a paragraph with a link, and an `<img>` with an `alt`.

check: html | a bullet list with items | /<ul>[\s\S]*<li>[\s\S]*<\/ul>/ | Write <ul> with <li> items inside
check: html | a link with an href | /<a\s[^>]*href=["'][^"']+["']/ | Write <a href="https://...">text</a>
check: html | an image with alt text | /<img[^>]*alt=["'][^"']+["']/ | Add alt="a description" to the <img>

quiz: Which attribute says where a link goes?
- [ ] `src`
- [ ] `alt`
- [x] `href`
why: `href` (hypertext reference) is the link's address; `src` is for images and scripts.

quiz: Why does every image need `alt` text?
- [ ] It makes the image load faster
- [x] It describes the image for screen readers and shows if the image can't load
- [ ] The browser won't show images without it
why: Alt text is how people who can't see the picture know what it shows.

```html middle
<h2>What I'm learning</h2>
<ul>
  <li>HTML gives a page its structure</li>
  <li>CSS gives it colors and layout</li>
  <li>JavaScript makes it do things</li>
</ul>

<h2>Find me online</h2>
<p>See my code on <a href="https://github.com/">GitHub</a>.</p>

<img class="avatar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%232563eb'/%3E%3Ctext x='50' y='62' font-size='34' text-anchor='middle' fill='white' font-family='sans-serif'%3EAE%3C/text%3E%3C/svg%3E" alt="The initials AE in a blue circle">
```

## Step: Give the page structure
time: 15

Right now the page is one long column of things. Real pages group their content into areas, and HTML has an element for each one. These are called **semantic elements** because their names say what they mean:

| Element | What it holds |
|---|---|
| `<header>` | The top of the page: the name or logo, often the menu |
| `<nav>` | A group of links for getting around |
| `<main>` | The page's main content (one per page) |
| `<section>` | One part of the content, usually with a heading |
| `<footer>` | The bottom of the page: credits, small print |

```svg How the profile page is organized: header with nav at the top, main with three sections, footer at the bottom
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 290" font-family="sans-serif" font-size="14">
  <rect width="360" height="290" fill="#ffffff"/>
  <rect x="20" y="10" width="320" height="44" rx="6" fill="#111827"/>
  <text x="34" y="37" fill="#ffffff">header</text>
  <rect x="190" y="18" width="140" height="28" rx="4" fill="#374151"/>
  <text x="260" y="37" fill="#ffffff" text-anchor="middle">nav</text>
  <rect x="20" y="64" width="320" height="176" rx="6" fill="#eef2ff" stroke="#6366f1"/>
  <text x="34" y="84" fill="#4338ca">main</text>
  <rect x="40" y="94" width="280" height="40" rx="6" fill="#ffffff" stroke="#9ca3af"/>
  <text x="56" y="119" fill="#111827">section#about (picture, intro)</text>
  <rect x="40" y="142" width="280" height="40" rx="6" fill="#ffffff" stroke="#9ca3af"/>
  <text x="56" y="167" fill="#111827">section#learning (the list)</text>
  <rect x="40" y="190" width="280" height="40" rx="6" fill="#ffffff" stroke="#9ca3af"/>
  <text x="56" y="215" fill="#111827">section#contact (link, button)</text>
  <rect x="20" y="250" width="320" height="32" rx="6" fill="#f3f4f6" stroke="#9ca3af"/>
  <text x="34" y="271" fill="#374151">footer</text>
</svg>
```

They look the same as plain boxes until you add CSS, but they help screen readers ("skip to main content"), search engines and you: months later, `<footer>` is easier to find than the fifth `<div>`.

### ids and classes

- `id="about"` gives one element a unique name. A link to `#about` scrolls straight to it, which is how the menu works.
- `class="card"` puts an element in a group. Many elements can share a class, and in the next steps CSS styles every `.card` at once.

### What to write

Wrap your name in a `<header>` with a `<nav>` of three links (`#about`, `#learning`, `#contact`). Put the content in `<main>`, split into three `<section>`s with those ids and `class="card"`, and end with a `<footer>`. Move the picture into the About section. The code view shows exactly where each line goes.

check: html | a <header> with a <nav> inside | /<header[\s\S]*<nav[\s\S]*<\/nav>[\s\S]*<\/header>/ | Put <nav> inside <header>
check: html | a <main> element | /<main[\s>]/
check: html | three sections with ids | /<section[^>]*id=[\s\S]*<section[^>]*id=[\s\S]*<section[^>]*id=/ | Give each <section> an id: about, learning and contact
check: html | a <footer> | /<footer[\s>]/

quiz: What does a link to `#contact` do?
- [ ] Opens a new website called contact
- [x] Scrolls to the element with `id="contact"` on the same page
- [ ] Sends an email
why: A `#` followed by an id points to that element on the current page.

quiz: What's the difference between an id and a class?
- [ ] There's no difference
- [x] An id is unique to one element; a class can be shared by many
- [ ] Classes are only for links
why: Use an id to point at one thing (like a menu target), and a class for a group you'll style together.

```html top
<header class="site-head">
  <h1>Anthony Evo</h1>
  <nav>
    <a href="#about">About</a>
    <a href="#learning">Learning</a>
    <a href="#contact">Contact</a>
  </nav>
</header>

<main>
  <section id="about" class="card">
    <img class="avatar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%232563eb'/%3E%3Ctext x='50' y='62' font-size='34' text-anchor='middle' fill='white' font-family='sans-serif'%3EAE%3C/text%3E%3C/svg%3E" alt="The initials AE in a blue circle">
    <h2>Hi, I'm Anthony</h2>
    <p>I'm learning to build websites, and this page is my first project.</p>
  </section>
```

```html middle
  <section id="learning" class="card">
    <h2>What I'm learning</h2>
    <ul>
      <li>HTML gives a page its structure</li>
      <li>CSS gives it colors and layout</li>
      <li>JavaScript makes it do things</li>
    </ul>
  </section>

  <section id="contact" class="card">
    <h2>Find me online</h2>
    <p>See my code on <a href="https://github.com/">GitHub</a>.</p>
  </section>
```

```html bottom
</main>

<footer>
  <p>Made by Anthony Evo with HTML and CSS.</p>
</footer>
```

## Session: Styling with CSS

## Step: CSS: selectors, colors and fonts
time: 15

**CSS** (Cascading Style Sheets) decides how the HTML looks. A CSS file is a list of **rules**. Each rule has a **selector** that picks elements, and **declarations** that say what to change:

```css
body {
  color: #1f2937;
}
```

`body` is the selector (every `<body>`, so the whole page). Inside the braces, `color` is a **property** and `#1f2937` is its **value**; each declaration ends with a semicolon.

```svg The parts of a CSS rule: a selector, then declarations made of a property and a value
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 160" font-family="sans-serif" font-size="14">
  <rect width="500" height="160" fill="#ffffff"/>
  <text x="30" y="50" font-family="monospace" font-size="20" fill="#7c3aed">body</text>
  <text x="90" y="50" font-family="monospace" font-size="20" fill="#111827">{</text>
  <text x="60" y="85" font-family="monospace" font-size="20"><tspan fill="#2563eb">color</tspan><tspan fill="#111827">: </tspan><tspan fill="#16a34a">#1f2937</tspan><tspan fill="#111827">;</tspan></text>
  <text x="30" y="120" font-family="monospace" font-size="20" fill="#111827">}</text>
  <text x="300" y="45" fill="#7c3aed">selector: which elements</text>
  <text x="300" y="80" fill="#2563eb">property: what to change</text>
  <text x="300" y="100" fill="#16a34a">value: what to change it to</text>
  <text x="300" y="130" fill="#6b7280">property + value = a declaration</text>
</svg>
```

### Selectors you'll use most

| Selector | Picks | Example |
|---|---|---|
| `p` | every element of that type | all paragraphs |
| `.card` | every element with that class | `class="card"` |
| `#about` | the one element with that id | `id="about"` |
| `h1, h2` | several selectors at once | both heading levels |
| `nav a` | elements inside other elements | links inside the nav |

### Colors and fonts

Colors can be names (`white`), or **hex codes** like `#2563eb`: red, green and blue amounts from `00` to `ff`. VS Code shows a little color square next to each one; click it to pick a color. `font-family` lists fonts in order of preference; `system-ui` uses the computer's own interface font, so it looks native everywhere.

### Linking the CSS file

In a real project the CSS lives in `style.css`, and the HTML loads it with one line in the `<head>`: `<link rel="stylesheet" href="style.css">`. The code view here keeps them in separate tabs and joins them when you **See it run**; the last step shows the complete `index.html`.

check: css | a body rule with a font | /body\s*\{[^}]*font-family/ | Add font-family inside body { }
check: css | a text color and a background color | /body\s*\{(?=[^}]*[^-]color\s*:)(?=[^}]*background)/ | Give body a color and a background

quiz: In `h2 { color: navy; }`, what is `h2`?
- [x] The selector
- [ ] The property
- [ ] The value
why: The selector comes before the braces and picks which elements the rule applies to.

quiz: Which selector styles every element with `class="card"`?
- [ ] `card`
- [ ] `#card`
- [x] `.card`
why: A dot means a class and a `#` means an id; a bare word means an element type.

```css base
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background: #f3f4f6;
}

h1, h2 {
  line-height: 1.2;
}

a {
  color: #2563eb;
}
```

## Step: The box model: padding, border and margin
time: 15

Every element on a page is a rectangle, even if it doesn't look like one. CSS gives every box the same four layers, and learning them is the key to spacing things out:

```svg The CSS box model: content in the middle, then padding, then the border, then margin on the outside
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" font-family="sans-serif" font-size="14">
  <rect width="400" height="260" fill="#ffffff"/>
  <rect x="10" y="10" width="380" height="240" fill="#fde68a"/>
  <text x="22" y="32" fill="#92400e">margin (space outside, transparent)</text>
  <rect x="50" y="45" width="300" height="170" fill="#374151"/>
  <text x="62" y="64" fill="#ffffff">border</text>
  <rect x="60" y="72" width="280" height="134" fill="#bbf7d0"/>
  <text x="72" y="92" fill="#166534">padding (space inside)</text>
  <rect x="110" y="108" width="180" height="70" fill="#bfdbfe"/>
  <text x="200" y="148" text-anchor="middle" fill="#1e3a8a">content</text>
</svg>
```

- **content**: the text or picture itself.
- **padding**: space between the content and the border. It takes the box's background color.
- **border**: a line around the padding. `border: 1px solid #e5e7eb` is width, style and color.
- **margin**: space outside the border, pushing other boxes away. Always transparent.

`padding: 24px` sets all four sides. `margin: 16px 0` is two values: top and bottom 16px, left and right 0. `border-radius` rounds the corners, and `border-radius: 50%` on a square makes a circle, which is how the avatar becomes round.

### What to write

A `.card` rule that turns each section into a white card with padding, a border, rounded corners and margin between cards. And an `.avatar` rule that makes the picture 96 pixels and round.

> Tip: in the browser, right-click an element, choose **Inspect**, and the developer tools draw this exact diagram for that element with its real numbers.

check: css | cards have padding | /\.card\s*\{[^}]*padding/ | Add padding inside .card { }
check: css | cards have a border | /\.card\s*\{[^}]*border\s*:/ | Add border: 1px solid #e5e7eb
check: css | cards have margin between them | /\.card\s*\{[^}]*margin/ | Add margin: 16px 0
check: css | a round avatar | /\.avatar\s*\{[^}]*border-radius\s*:\s*50%/ | Add border-radius: 50% to .avatar

quiz: Which layer is the space *inside* the border, around the content?
- [ ] Margin
- [x] Padding
- [ ] Outline
why: Padding is inside the border and takes the background color; margin is outside and transparent.

quiz: What does `margin: 16px 0` mean?
- [x] 16px on the top and bottom, 0 on the left and right
- [ ] 16px on the left, 0 on the right
- [ ] 16px on every side, then 0 extra
why: With two values, the first is top and bottom and the second is left and right.

```css card
.card {
  background: #ffffff;
  padding: 24px;
  margin: 16px 0;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
}
```

## Session: Buttons and layout

## Step: A button with a hover effect
time: 12

A profile page needs a clear next step for the visitor: an **Email me** button. It's really a link (`<a>`), because it goes somewhere. A `mailto:` address opens the visitor's email app with your address filled in. Giving the link `class="btn"` lets CSS make it look like a button.

### Pseudo-classes

`.btn:hover` is a selector with a **pseudo-class**: it only matches while the mouse is over the element. Others you'll meet: `:focus` (selected with the keyboard), `:first-child` and `:visited`.

```css
.btn:hover {
  background: #1d4ed8;
}
```

### Display

Links are **inline** elements: they flow inside a line of text like words, and they ignore padding on the top and bottom. `display: inline-block` keeps the button in line but lets padding and size work properly. `text-decoration: none` removes the underline.

check: html | a link with class "btn" | /<a[^>]*class=["'][^"']*\bbtn\b/ | Add class="btn" to the Email me link
check: css | the button changes on hover | /\.btn:hover\s*\{/ | Add a .btn:hover { } rule

quiz: When does `.btn:hover` apply?
- [ ] Always
- [x] Only while the mouse pointer is over the button
- [ ] Only after the button is clicked
why: `:hover` is a state: the styles turn on while the pointer is over the element and off when it leaves.

quiz: Why is the Email me button an `<a>` and not a `<button>`?
- [x] It goes somewhere (opens an email), and going somewhere is what links are for
- [ ] Buttons can't have colors
- [ ] `<button>` doesn't exist in HTML
why: Use `<a>` for navigation and `<button>` for actions on the page, like submitting a form.

```html middle
  <section id="learning" class="card">
    <h2>What I'm learning</h2>
    <ul>
      <li>HTML gives a page its structure</li>
      <li>CSS gives it colors and layout</li>
      <li>JavaScript makes it do things</li>
    </ul>
  </section>

  <section id="contact" class="card">
    <h2>Find me online</h2>
    <p>See my code on <a href="https://github.com/">GitHub</a>.</p>
    <a class="btn" href="mailto:anthony@example.com">Email me</a>
  </section>
```

```css buttons
.btn {
  display: inline-block;
  padding: 10px 18px;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
}

.btn:hover {
  background: #1d4ed8;
}
```

## Step: Flexbox: the header in one row
time: 15

Block elements like `<h1>` and `<nav>` stack on top of each other by default. To put the name on the left and the menu on the right, use **Flexbox**: set `display: flex` on the **parent**, and its children line up in a row.

```svg Flexbox: display flex on the header puts its children in a row; justify-content spreads them out and align-items centers them up and down
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 200" font-family="sans-serif" font-size="14">
  <rect width="440" height="200" fill="#ffffff"/>
  <text x="20" y="24" fill="#6b7280">Without flex: stacked</text>
  <rect x="20" y="32" width="180" height="26" fill="#bfdbfe"/><text x="30" y="50">h1</text>
  <rect x="20" y="62" width="180" height="26" fill="#bbf7d0"/><text x="30" y="80">nav</text>
  <text x="20" y="124" fill="#6b7280">display: flex; justify-content: space-between</text>
  <rect x="20" y="134" width="400" height="50" fill="none" stroke="#111827" stroke-dasharray="4 3"/>
  <rect x="28" y="146" width="110" height="26" fill="#bfdbfe"/><text x="38" y="164">h1</text>
  <rect x="302" y="146" width="110" height="26" fill="#bbf7d0"/><text x="312" y="164">nav</text>
  <path d="M146 159 H294" stroke="#6b7280" stroke-dasharray="3 3"/>
  <text x="220" y="154" text-anchor="middle" fill="#6b7280" font-size="12">free space between</text>
</svg>
```

| Property (on the parent) | What it does |
|---|---|
| `display: flex` | Children line up in a row |
| `justify-content: space-between` | Push the first child left and the last right |
| `align-items: center` | Center children up and down |
| `gap: 16px` | Space between the children |

The nav is a flex container too, so its three links sit in a row with a gap between them. The same idea builds most layouts you'll see.

### Keeping lines readable

`main { max-width: 720px; margin: 0 auto; }` stops the text getting too wide on big screens (long lines are hard to read) and `margin: 0 auto` centers it: auto margins on the left and right split the leftover space equally.

check: css | the header is a flex row | /\.site-head\s*\{[^}]*display\s*:\s*flex/ | Add display: flex to .site-head
check: css | the nav links have a gap | /nav\s*\{[^}]*gap\s*:/ | Add display: flex and gap: 16px to .site-head nav
check: css | main has a maximum width | /main\s*\{[^}]*max-width/ | Add max-width: 720px to main

quiz: Where do you put `display: flex`?
- [x] On the parent whose children should line up
- [ ] On each child
- [ ] On the `<body>` only
why: Flex is set on the container; its direct children become flex items.

quiz: What does `margin: 0 auto` do to a box with a `max-width`?
- [ ] Removes all its space
- [x] Centers it horizontally
- [ ] Makes it full width
why: Auto margins on both sides share the leftover width equally, so the box sits in the middle.

```css layout
.site-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #111827;
  color: #ffffff;
}

.site-head h1 {
  margin: 0;
  font-size: 1.25rem;
}

.site-head nav {
  display: flex;
  gap: 16px;
}

.site-head a {
  color: #ffffff;
  text-decoration: none;
}

main {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 16px;
}

footer {
  text-align: center;
  color: #6b7280;
  padding: 24px;
}
```

## Step: Fit any screen: a media query
time: 12

More than half of web visits are on phones. On a narrow screen the name and the three menu links don't fit in one row. A **media query** is a block of CSS that only applies when a condition is true, such as "the screen is 600 pixels wide or less":

```css
@media (max-width: 600px) {
  /* rules here only apply on narrow screens */
}
```

Inside it, `flex-direction: column` changes the header from a row to a column, so the name sits above the menu.

### The viewport tag

Phones pretend to be a wide desktop screen unless the page says otherwise. Every real page needs this line in its `<head>`, or media queries won't work on phones:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

(See it run adds it for you; the full `index.html` in the next step includes it.)

> Tip: test it by making the browser window narrow, or open the developer tools (F12) and click the phone icon to pretend to be a phone.

check: css | a media query for narrow screens | /@media\s*\(\s*max-width\s*:\s*\d+px\s*\)/ | Add @media (max-width: 600px) { ... }
check: css | the header stacks on a phone | /@media[\s\S]*flex-direction\s*:\s*column/ | Inside the media query, give .site-head flex-direction: column

quiz: When do the rules inside `@media (max-width: 600px)` apply?
- [x] When the page is 600 pixels wide or narrower
- [ ] Only on screens wider than 600 pixels
- [ ] Only when printing
why: `max-width: 600px` means "up to 600px", so the rules switch on for phones and small windows.

quiz: What happens on a phone if the page has no viewport meta tag?
- [ ] Nothing, it's optional
- [x] The phone acts like a wide screen and shrinks the page, so media queries don't kick in
- [ ] The page won't load
why: The viewport tag tells the phone to use its real width, which is what the media query measures.

```css responsive
@media (max-width: 600px) {
  .site-head {
    flex-direction: column;
    gap: 8px;
  }
}
```

## Step: Put it online with GitHub Pages
kind: read
time: 20

You built a real page. Now put it on the internet for free, at an address like `https://yourname.github.io/profile-page/`. This is the same way all my projects are published.

### 1. The two files

Make a folder called `profile-page` with two files. `index.html` is a complete page: the `<head>` holds the title, the viewport tag and the link to your CSS, and your HTML from this guide goes in the `<body>`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Anthony Evo</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- your header, main and footer go here -->
</body>
</html>
```

`style.css` holds all the CSS from this guide. Use the **style.css** tab on the last code step and **Copy this file**. Open `index.html` with **Live Server** (from the Get set up guide) to check it looks right.

### 2. Save it in Git and push it to GitHub

In VS Code's terminal, inside the folder:

```text
git init
git add .
git commit -m "My profile page"
```

On github.com, click **+** → **New repository**, name it `profile-page`, make it **Public**, and don't add a README. GitHub shows the commands to connect your folder; they look like this:

```text
git remote add origin https://github.com/YOUR-NAME/profile-page.git
git branch -M main
git push -u origin main
```

### 3. Turn on GitHub Pages

In the repository, open **Settings** → **Pages**, set **Source** to **Deploy from a branch**, choose **main** and **/ (root)**, and save. After a minute your page is live at `https://YOUR-NAME.github.io/profile-page/`.

From now on, publishing a change is: edit, `git add .`, `git commit -m "what changed"`, `git push`. The site updates by itself.

### See mine

The finished version of this project is at [github.com/TheoYanvno/profile-page](https://github.com/TheoYanvno/profile-page).

quiz: Which file name does GitHub Pages show first when someone visits your site?
- [ ] `home.html`
- [x] `index.html`
- [ ] `style.css`
why: Web servers show `index.html` when the address names a folder, so it's always your home page.

## Finish

You built and published a complete web page. Along the way you used:

- **HTML** elements and attributes: headings, paragraphs, lists, links, images
- **Semantic structure**: header, nav, main, section, footer, plus ids and classes
- **CSS** rules and selectors, colors and fonts
- The **box model**: padding, border, margin and border-radius
- **Flexbox** for rows, `max-width` and `margin: 0 auto` for readable, centered content
- A **media query** so it works on phones
- **Git, GitHub and GitHub Pages** to publish it

### Challenges

1. Add a **Projects** section with a card for each project you build in these guides, and add it to the menu.
2. Make the menu link for the section you're in look different with `:hover` and `:focus`.
3. Try a dark theme: change the colors in `body`, `.card` and `.site-head`.

### Next

The **JavaScript basics** guide makes a page that *does* something: a tip calculator that updates as you type.
