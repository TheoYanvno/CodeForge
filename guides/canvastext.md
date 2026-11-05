---
id: canvastext
title: Drawing text on a canvas
blocks-html: page
blocks-css: base
blocks-js: setup, text, wrap, reveal
goals: Draw text with font, textAlign and textBaseline, and know where the text lands; Measure text with measureText so it fits; Wrap a long answer into lines that fit a width, since canvas text never wraps by itself; Reveal text letter by letter with requestAnimationFrame, and skip it for reduced motion; Keep canvas text readable for screen readers with a real text copy
prereqs: The Canvas drawing lesson and the Canvas particles lesson (devicePixelRatio and requestAnimationFrame)
---

## Session: Words in the sand

## Step: How canvas text works
time: 10
kind: read

On a web page, text flows and wraps by itself. On a canvas, text is **painted** like a shape, so you control everything, and you have to do everything:

| Setting | What it does |
|---|---|
| `ctx.font = '600 28px Georgia'` | weight, size and family, written like CSS |
| `ctx.textAlign = 'center'` | where x is: the `left`, `center` or `right` of the text |
| `ctx.textBaseline = 'middle'` | where y is: `top`, `middle`, `alphabetic` (the line letters sit on) or `bottom` |
| `ctx.fillText(text, x, y)` | paint it |
| `ctx.measureText(text).width` | how wide it will be, in pixels |

```svg textAlign decides what x means; textBaseline decides what y means
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 120" font-family="Georgia, serif">
  <path d="M165 10 V110" stroke="#ef4444" stroke-dasharray="4 3"/><path d="M10 60 H320" stroke="#2563eb" stroke-dasharray="4 3"/>
  <text x="165" y="60" text-anchor="middle" dominant-baseline="middle" font-size="28" fill="#78350f">Sandy</text>
  <text x="172" y="22" font-family="sans-serif" font-size="11" fill="#b91c1c">x (textAlign = center)</text>
  <text x="14" y="54" font-family="sans-serif" font-size="11" fill="#1d4ed8">y (textBaseline = middle)</text>
</svg>
```

Three things the canvas does **not** do for you:

1. **Wrap.** A long sentence runs straight off the edge. You split it into lines yourself, using `measureText`.
2. **Stay sharp.** On high-density screens, size the canvas with `devicePixelRatio` (the Particles lesson), or the text looks blurry.
3. **Be readable by screen readers.** Painted letters are just pixels. Put the same words in real text too (an `aria-label`, or a visually hidden paragraph) so everyone gets them.

SuperBook "presses" its answers into sand on a canvas. This lesson builds the text part of that.

## Step: Centered text, sized to fit
time: 12

The canvas is sized for the screen's pixel density, then a title is drawn in the middle with `textAlign = 'center'` and `textBaseline = 'middle'`, so `(W / 2, H / 2)` really is its center.

If the title is too wide, the font shrinks until `measureText` says it fits, so a long title never spills off the edge.

check: js | setting the font like CSS | /ctx\.font\s*=/ | ctx.font = `600 ${size}px Georgia, serif`;
check: js | centering both ways | /textAlign\s*=\s*['"]center['"][\s\S]*textBaseline\s*=\s*['"]middle['"]/ | ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
check: js | shrinking until it fits | /measureText\([^)]*\)\.width\s*>/ | while (ctx.measureText(title).width > W - 40) size -= 2;

quiz: With `textAlign = 'center'`, where does `fillText('Hi', 100, 50)` put the text?
- [x] Centered on x = 100
- [ ] Starting at x = 100
- [ ] Ending at x = 100
why: textAlign says which part of the text sits on x; center means its middle.

quiz: Why shrink the font with a measureText loop?
- [ ] Canvas text is always too big
- [x] Canvas text never wraps or shrinks by itself, so the code checks the width and adjusts
- [ ] measureText changes the font
why: You measure, compare with the space you have, and pick a size that fits.

```html page
<main class="wrap">
  <label for="msg">Answer to press into the sand</label>
  <textarea id="msg" rows="3">The river remembers every stone it has carried, and the sand keeps a little of each story.</textarea>
  <canvas id="sand" role="img"></canvas>
  <p class="row"><button id="again">Write it again</button> <label><input id="still" type="checkbox"> Pretend I prefer reduced motion</label></p>
</main>
```

```css base
body { margin: 0; font-family: system-ui, sans-serif; background: #fef3c7; color: #451a03; }
.wrap { max-width: 640px; margin: 0 auto; padding: 16px; }
label { font-size: .85rem; }
textarea { width: 100%; box-sizing: border-box; font: inherit; padding: 8px; border-radius: 8px; border: 1px solid #d97706; }
canvas { display: block; width: 100%; height: 260px; margin-top: 10px; border-radius: 12px; background: linear-gradient(#fde68a, #f59e0b); }
.row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
button { font: inherit; padding: 6px 12px; }
```

```js setup
const canvas = document.getElementById('sand');
const ctx = canvas.getContext('2d');
const msg = document.getElementById('msg');
let W = 0;
let H = 0;

function fit() {
  const dpr = window.devicePixelRatio || 1;
  W = canvas.clientWidth;
  H = canvas.clientHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
```

```js text
function drawTitle(title) {
  ctx.clearRect(0, 0, W, H);
  let size = 40;
  ctx.font = `600 ${size}px Georgia, serif`;
  while (ctx.measureText(title).width > W - 40 && size > 12) {
    size -= 2;
    ctx.font = `600 ${size}px Georgia, serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#78350f';
  ctx.fillText(title, W / 2, H / 2);
}

fit();
drawTitle(msg.value);
msg.addEventListener('input', () => drawTitle(msg.value));
window.addEventListener('resize', () => { fit(); drawTitle(msg.value); });
```

## Step: Wrapping into lines
time: 15

Shrinking only works for short titles; an answer needs **wrapping**. `wrap(text, maxWidth)` builds lines word by word:

1. Take the next word and try adding it to the current line.
2. If the line would be wider than `maxWidth` (measured with `measureText`), push the current line and start a new one with that word.
3. At the end, push the last line.

```svg Words are added to a line until the next one would overflow; then a new line starts
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="Georgia, serif" font-size="13">
  <rect x="10" y="10" width="220" height="80" fill="none" stroke="#d97706" stroke-dasharray="4 3"/>
  <text x="18" y="32" fill="#78350f">The river remembers every</text>
  <text x="18" y="56" fill="#78350f">stone it has carried, and</text>
  <text x="18" y="80" fill="#78350f">the sand keeps a little…</text>
  <text x="240" y="32" font-family="sans-serif" font-size="11" fill="#b91c1c">"stone" won't fit</text>
  <text x="240" y="46" font-family="sans-serif" font-size="11" fill="#b91c1c">→ new line</text>
  <text x="120" y="102" font-family="sans-serif" font-size="11" text-anchor="middle" fill="#475569">maxWidth</text>
</svg>
```

The lines are then drawn centered, one `lineHeight` apart, with the whole block centered vertically: the first line starts half the block's height above the middle.

The canvas also gets an `aria-label` with the full answer, so screen readers read the words, not "image".

check: js | a wrap() function | /function\s+wrap\s*\(\s*text\s*,\s*maxWidth\s*\)/ | function wrap(text, maxWidth) { ... }
check: js | measuring the line with the next word | /measureText\(\s*test\s*\)\.width\s*>\s*maxWidth/ | if (ctx.measureText(test).width > maxWidth && line) { ... }
check: js | the words for screen readers | /setAttribute\(\s*['"]aria-label['"]/ | canvas.setAttribute('aria-label', text);

quiz: Why wrap word by word instead of cutting at a fixed number of characters?
- [x] Letters have different widths, so only measuring tells you what really fits, and words stay whole
- [ ] Characters can't be counted in JavaScript
- [ ] It's required by fillText
why: "iiii" and "WWWW" are the same length but very different widths.

quiz: Why give the canvas an aria-label with the text?
- [ ] To make the letters sharper
- [x] Painted text is only pixels; the label lets screen readers read the words
- [ ] Canvases need a label to draw
why: Anything meaningful drawn on a canvas needs a text version too.

```js wrap
function wrap(text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function layout(text) {
  ctx.font = '600 24px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrap(text, W - 48);
  const lineHeight = 32;
  const top = H / 2 - ((lines.length - 1) * lineHeight) / 2;
  return lines.map((t, i) => ({ text: t, x: W / 2, y: top + i * lineHeight }));
}

function drawLines(lines) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#78350f';
  for (const l of lines) ctx.fillText(l.text, l.x, l.y);
}

function writeAnswer(text) {
  canvas.setAttribute('aria-label', text);
  drawLines(layout(text));
}

msg.addEventListener('input', () => writeAnswer(msg.value));
window.addEventListener('resize', () => { fit(); writeAnswer(msg.value); });
writeAnswer(msg.value);
```

```js text
fit();
```

## Step: Pressing it in, letter by letter
time: 15

Now the effect. `requestAnimationFrame` reveals a few more characters each frame. The trick is to keep the **layout fixed**: lines are worked out once for the whole answer, then each frame draws only the first *n* characters across them. If the layout were redone with partial text, the words would jump around as lines re-wrapped.

A soft shadow under the letters makes them look pressed into the sand.

As in the Particles lesson, people who prefer **reduced motion** get the whole answer at once, with no animation. (The checkbox pretends that setting is on.) Typing a new answer cancels the running animation with `cancelAnimationFrame`, so two never run at once.

```svg The lines are laid out once; each frame draws only the first n characters, so words never jump between lines
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 90" font-family="Georgia, serif" font-size="13">
  <text x="10" y="22" fill="#78350f">The river remem</text><text x="128" y="22" fill="#d6c19c">bers every</text>
  <text x="10" y="44" fill="#d6c19c">stone it has carried, and</text>
  <text x="10" y="80" font-family="sans-serif" font-size="11" fill="#475569">frame 12: 15 of 90 characters shown, in their final places</text>
</svg>
```

check: js | an animation frame loop | /requestAnimationFrame\(\s*step\s*\)/ | requestAnimationFrame(step);
check: js | only the first n characters | /\.slice\(\s*0\s*,/ | l.text.slice(0, shown)
check: js | no animation for reduced motion | /prefers-reduced-motion:\s*reduce/ | matchMedia('(prefers-reduced-motion: reduce)')

quiz: Why lay out the lines once instead of wrapping the partial text each frame?
- [x] Partial text wraps differently, so words would jump between lines as they appear
- [ ] Wrapping is too slow to do 60 times a second
- [ ] requestAnimationFrame can't call wrap()
why: Fix the final positions first, then reveal into them.

quiz: You start typing while the answer is still being written. What stops the old animation?
- [ ] Nothing; both keep running
- [x] cancelAnimationFrame on the saved frame id
- [ ] The browser stops it automatically
why: Save the id from requestAnimationFrame and cancel it before starting a new one.

```js wrap
function wrap(text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function layout(text) {
  ctx.font = '600 24px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrap(text, W - 48);
  const lineHeight = 32;
  const top = H / 2 - ((lines.length - 1) * lineHeight) / 2;
  return lines.map((t, i) => ({ text: t, x: W / 2, y: top + i * lineHeight }));
}

function drawLines(lines) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#78350f';
  for (const l of lines) ctx.fillText(l.text, l.x, l.y);
}
```

```js reveal
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const still = document.getElementById('still');
let frameId = 0;

function drawPartial(lines, shown) {
  ctx.clearRect(0, 0, W, H);
  ctx.shadowColor = 'rgba(120, 53, 15, 0.35)';
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 3;
  ctx.fillStyle = '#78350f';
  let left = shown;
  for (const l of lines) {
    if (left <= 0) break;
    const part = l.text.slice(0, left);
    ctx.textAlign = 'left';
    ctx.fillText(part, l.x - ctx.measureText(l.text).width / 2, l.y);
    left -= l.text.length + 1;
  }
  ctx.shadowColor = 'transparent';
}

function writeAnswer(text) {
  cancelAnimationFrame(frameId);
  canvas.setAttribute('aria-label', text);
  const lines = layout(text);
  const total = text.length;
  if (reduce.matches || still.checked) { drawPartial(lines, total); return; }
  let shown = 0;
  const step = () => {
    shown += 2;
    drawPartial(lines, shown);
    if (shown < total) frameId = requestAnimationFrame(step);
  };
  frameId = requestAnimationFrame(step);
}

msg.addEventListener('input', () => writeAnswer(msg.value));
window.addEventListener('resize', () => { fit(); writeAnswer(msg.value); });
document.getElementById('again').addEventListener('click', () => writeAnswer(msg.value));
writeAnswer(msg.value);
```

## Finish

You can put words on a canvas properly now. You learned:

- `font`, `textAlign`, `textBaseline` and `fillText`, and where text lands
- **measureText** to fit and to **wrap** word by word
- Lines **laid out once**, then **revealed** letter by letter with requestAnimationFrame
- **Reduced motion**, `cancelAnimationFrame`, and an **aria-label** so the words are readable by everyone

You've now learned every part of **SuperBook**: web APIs, caching, matching questions and canvas text. Build it next.

### Challenges

1. Right-to-left text: set `ctx.direction = 'rtl'` for an Arabic or Hebrew answer and check the alignment.
2. Add a gentle wind: draw each line a few pixels to the side with `Math.sin(time + i)`.
3. Turn the text into sand grains: draw it to a hidden canvas, read the pixels with `getImageData`, and place a grain on every filled pixel.

### Next

The **SuperBook** project.
