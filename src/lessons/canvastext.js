// Built from guides/canvastext.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "canvastext",
 "title": "Drawing text on a canvas",
 "goals": [
  "Draw text with font, textAlign and textBaseline, and know where the text lands",
  "Measure text with measureText so it fits",
  "Wrap a long answer into lines that fit a width, since canvas text never wraps by itself",
  "Reveal text letter by letter with requestAnimationFrame, and skip it for reduced motion",
  "Keep canvas text readable for screen readers with a real text copy"
 ],
 "prereqs": [
  "The Canvas drawing lesson and the Canvas particles lesson (devicePixelRatio and requestAnimationFrame)"
 ],
 "sessions": [
  {
   "title": "Words in the sand",
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
   "setup": "",
   "text": "",
   "wrap": "",
   "reveal": ""
  }
 },
 "steps": [
  {
   "title": "How canvas text works",
   "body": "On a web page, text flows and wraps by itself. On a canvas, text is **painted** like a shape, so you control everything, and you have to do everything:\n\n| Setting | What it does |\n|---|---|\n| `ctx.font = '600 28px Georgia'` | weight, size and family, written like CSS |\n| `ctx.textAlign = 'center'` | where x is: the `left`, `center` or `right` of the text |\n| `ctx.textBaseline = 'middle'` | where y is: `top`, `middle`, `alphabetic` (the line letters sit on) or `bottom` |\n| `ctx.fillText(text, x, y)` | paint it |\n| `ctx.measureText(text).width` | how wide it will be, in pixels |\n\n```svg textAlign decides what x means; textBaseline decides what y means\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 120\" font-family=\"Georgia, serif\">\n  <path d=\"M165 10 V110\" stroke=\"#ef4444\" stroke-dasharray=\"4 3\"/><path d=\"M10 60 H320\" stroke=\"#2563eb\" stroke-dasharray=\"4 3\"/>\n  <text x=\"165\" y=\"60\" text-anchor=\"middle\" dominant-baseline=\"middle\" font-size=\"28\" fill=\"#78350f\">Sandy</text>\n  <text x=\"172\" y=\"22\" font-family=\"sans-serif\" font-size=\"11\" fill=\"#b91c1c\">x (textAlign = center)</text>\n  <text x=\"14\" y=\"54\" font-family=\"sans-serif\" font-size=\"11\" fill=\"#1d4ed8\">y (textBaseline = middle)</text>\n</svg>\n```\n\nThree things the canvas does **not** do for you:\n\n1. **Wrap.** A long sentence runs straight off the edge. You split it into lines yourself, using `measureText`.\n2. **Stay sharp.** On high-density screens, size the canvas with `devicePixelRatio` (the Particles lesson), or the text looks blurry.\n3. **Be readable by screen readers.** Painted letters are just pixels. Put the same words in real text too (an `aria-label`, or a visually hidden paragraph) so everyone gets them.\n\nSuperBook \"presses\" its answers into sand on a canvas. This lesson builds the text part of that.",
   "session": 0,
   "minutes": 10,
   "kind": "read"
  },
  {
   "title": "Centered text, sized to fit",
   "body": "The canvas is sized for the screen's pixel density, then a title is drawn in the middle with `textAlign = 'center'` and `textBaseline = 'middle'`, so `(W / 2, H / 2)` really is its center.\n\nIf the title is too wide, the font shrinks until `measureText` says it fits, so a long title never spills off the edge.",
   "checks": [
    {
     "pane": "js",
     "label": "setting the font like CSS",
     "test": "/ctx\\.font\\s*=/",
     "hint": "ctx.font = `600 ${size}px Georgia, serif`;"
    },
    {
     "pane": "js",
     "label": "centering both ways",
     "test": "/textAlign\\s*=\\s*['\"]center['\"][\\s\\S]*textBaseline\\s*=\\s*['\"]middle['\"]/",
     "hint": "ctx.textAlign = 'center'; ctx.textBaseline = 'middle';"
    },
    {
     "pane": "js",
     "label": "shrinking until it fits",
     "test": "/measureText\\([^)]*\\)\\.width\\s*>/",
     "hint": "while (ctx.measureText(title).width > W - 40) size -= 2;"
    }
   ],
   "quiz": [
    {
     "q": "With `textAlign = 'center'`, where does `fillText('Hi', 100, 50)` put the text?",
     "options": [
      "Centered on x = 100",
      "Starting at x = 100",
      "Ending at x = 100"
     ],
     "answer": 0,
     "why": "textAlign says which part of the text sits on x; center means its middle."
    },
    {
     "q": "Why shrink the font with a measureText loop?",
     "options": [
      "Canvas text is always too big",
      "Canvas text never wraps or shrinks by itself, so the code checks the width and adjusts",
      "measureText changes the font"
     ],
     "answer": 1,
     "why": "You measure, compare with the space you have, and pick a size that fits."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main class=\"wrap\">\n  <label for=\"msg\">Answer to press into the sand</label>\n  <textarea id=\"msg\" rows=\"3\">The river remembers every stone it has carried, and the sand keeps a little of each story.</textarea>\n  <canvas id=\"sand\" role=\"img\"></canvas>\n  <p class=\"row\"><button id=\"again\">Write it again</button> <label><input id=\"still\" type=\"checkbox\"> Pretend I prefer reduced motion</label></p>\n</main>"
   },
   "css": {
    "base": "body { margin: 0; font-family: system-ui, sans-serif; background: #fef3c7; color: #451a03; }\n.wrap { max-width: 640px; margin: 0 auto; padding: 16px; }\nlabel { font-size: .85rem; }\ntextarea { width: 100%; box-sizing: border-box; font: inherit; padding: 8px; border-radius: 8px; border: 1px solid #d97706; }\ncanvas { display: block; width: 100%; height: 260px; margin-top: 10px; border-radius: 12px; background: linear-gradient(#fde68a, #f59e0b); }\n.row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }\nbutton { font: inherit; padding: 6px 12px; }"
   },
   "js": {
    "setup": "const canvas = document.getElementById('sand');\nconst ctx = canvas.getContext('2d');\nconst msg = document.getElementById('msg');\nlet W = 0;\nlet H = 0;\n\nfunction fit() {\n  const dpr = window.devicePixelRatio || 1;\n  W = canvas.clientWidth;\n  H = canvas.clientHeight;\n  canvas.width = Math.round(W * dpr);\n  canvas.height = Math.round(H * dpr);\n  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);\n}",
    "text": "function drawTitle(title) {\n  ctx.clearRect(0, 0, W, H);\n  let size = 40;\n  ctx.font = `600 ${size}px Georgia, serif`;\n  while (ctx.measureText(title).width > W - 40 && size > 12) {\n    size -= 2;\n    ctx.font = `600 ${size}px Georgia, serif`;\n  }\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'middle';\n  ctx.fillStyle = '#78350f';\n  ctx.fillText(title, W / 2, H / 2);\n}\n\nfit();\ndrawTitle(msg.value);\nmsg.addEventListener('input', () => drawTitle(msg.value));\nwindow.addEventListener('resize', () => { fit(); drawTitle(msg.value); });"
   }
  },
  {
   "title": "Wrapping into lines",
   "body": "Shrinking only works for short titles; an answer needs **wrapping**. `wrap(text, maxWidth)` builds lines word by word:\n\n1. Take the next word and try adding it to the current line.\n2. If the line would be wider than `maxWidth` (measured with `measureText`), push the current line and start a new one with that word.\n3. At the end, push the last line.\n\n```svg Words are added to a line until the next one would overflow; then a new line starts\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 100\" font-family=\"Georgia, serif\" font-size=\"13\">\n  <rect x=\"10\" y=\"10\" width=\"220\" height=\"80\" fill=\"none\" stroke=\"#d97706\" stroke-dasharray=\"4 3\"/>\n  <text x=\"18\" y=\"32\" fill=\"#78350f\">The river remembers every</text>\n  <text x=\"18\" y=\"56\" fill=\"#78350f\">stone it has carried, and</text>\n  <text x=\"18\" y=\"80\" fill=\"#78350f\">the sand keeps a little…</text>\n  <text x=\"240\" y=\"32\" font-family=\"sans-serif\" font-size=\"11\" fill=\"#b91c1c\">\"stone\" won't fit</text>\n  <text x=\"240\" y=\"46\" font-family=\"sans-serif\" font-size=\"11\" fill=\"#b91c1c\">→ new line</text>\n  <text x=\"120\" y=\"102\" font-family=\"sans-serif\" font-size=\"11\" text-anchor=\"middle\" fill=\"#475569\">maxWidth</text>\n</svg>\n```\n\nThe lines are then drawn centered, one `lineHeight` apart, with the whole block centered vertically: the first line starts half the block's height above the middle.\n\nThe canvas also gets an `aria-label` with the full answer, so screen readers read the words, not \"image\".",
   "checks": [
    {
     "pane": "js",
     "label": "a wrap() function",
     "test": "/function\\s+wrap\\s*\\(\\s*text\\s*,\\s*maxWidth\\s*\\)/",
     "hint": "function wrap(text, maxWidth) { ... }"
    },
    {
     "pane": "js",
     "label": "measuring the line with the next word",
     "test": "/measureText\\(\\s*test\\s*\\)\\.width\\s*>\\s*maxWidth/",
     "hint": "if (ctx.measureText(test).width > maxWidth && line) { ... }"
    },
    {
     "pane": "js",
     "label": "the words for screen readers",
     "test": "/setAttribute\\(\\s*['\"]aria-label['\"]/",
     "hint": "canvas.setAttribute('aria-label', text);"
    }
   ],
   "quiz": [
    {
     "q": "Why wrap word by word instead of cutting at a fixed number of characters?",
     "options": [
      "Letters have different widths, so only measuring tells you what really fits, and words stay whole",
      "Characters can't be counted in JavaScript",
      "It's required by fillText"
     ],
     "answer": 0,
     "why": "\"iiii\" and \"WWWW\" are the same length but very different widths."
    },
    {
     "q": "Why give the canvas an aria-label with the text?",
     "options": [
      "To make the letters sharper",
      "Painted text is only pixels; the label lets screen readers read the words",
      "Canvases need a label to draw"
     ],
     "answer": 1,
     "why": "Anything meaningful drawn on a canvas needs a text version too."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "wrap": "function wrap(text, maxWidth) {\n  const words = text.split(/\\s+/).filter(Boolean);\n  const lines = [];\n  let line = '';\n  for (const word of words) {\n    const test = line ? `${line} ${word}` : word;\n    if (ctx.measureText(test).width > maxWidth && line) {\n      lines.push(line);\n      line = word;\n    } else {\n      line = test;\n    }\n  }\n  if (line) lines.push(line);\n  return lines;\n}\n\nfunction layout(text) {\n  ctx.font = '600 24px Georgia, serif';\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'middle';\n  const lines = wrap(text, W - 48);\n  const lineHeight = 32;\n  const top = H / 2 - ((lines.length - 1) * lineHeight) / 2;\n  return lines.map((t, i) => ({ text: t, x: W / 2, y: top + i * lineHeight }));\n}\n\nfunction drawLines(lines) {\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#78350f';\n  for (const l of lines) ctx.fillText(l.text, l.x, l.y);\n}\n\nfunction writeAnswer(text) {\n  canvas.setAttribute('aria-label', text);\n  drawLines(layout(text));\n}\n\nmsg.addEventListener('input', () => writeAnswer(msg.value));\nwindow.addEventListener('resize', () => { fit(); writeAnswer(msg.value); });\nwriteAnswer(msg.value);",
    "text": "fit();"
   }
  },
  {
   "title": "Pressing it in, letter by letter",
   "body": "Now the effect. `requestAnimationFrame` reveals a few more characters each frame. The trick is to keep the **layout fixed**: lines are worked out once for the whole answer, then each frame draws only the first *n* characters across them. If the layout were redone with partial text, the words would jump around as lines re-wrapped.\n\nA soft shadow under the letters makes them look pressed into the sand.\n\nAs in the Particles lesson, people who prefer **reduced motion** get the whole answer at once, with no animation. (The checkbox pretends that setting is on.) Typing a new answer cancels the running animation with `cancelAnimationFrame`, so two never run at once.\n\n```svg The lines are laid out once; each frame draws only the first n characters, so words never jump between lines\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 330 90\" font-family=\"Georgia, serif\" font-size=\"13\">\n  <text x=\"10\" y=\"22\" fill=\"#78350f\">The river remem</text><text x=\"128\" y=\"22\" fill=\"#d6c19c\">bers every</text>\n  <text x=\"10\" y=\"44\" fill=\"#d6c19c\">stone it has carried, and</text>\n  <text x=\"10\" y=\"80\" font-family=\"sans-serif\" font-size=\"11\" fill=\"#475569\">frame 12: 15 of 90 characters shown, in their final places</text>\n</svg>\n```",
   "checks": [
    {
     "pane": "js",
     "label": "an animation frame loop",
     "test": "/requestAnimationFrame\\(\\s*step\\s*\\)/",
     "hint": "requestAnimationFrame(step);"
    },
    {
     "pane": "js",
     "label": "only the first n characters",
     "test": "/\\.slice\\(\\s*0\\s*,/",
     "hint": "l.text.slice(0, shown)"
    },
    {
     "pane": "js",
     "label": "no animation for reduced motion",
     "test": "/prefers-reduced-motion:\\s*reduce/",
     "hint": "matchMedia('(prefers-reduced-motion: reduce)')"
    }
   ],
   "quiz": [
    {
     "q": "Why lay out the lines once instead of wrapping the partial text each frame?",
     "options": [
      "Partial text wraps differently, so words would jump between lines as they appear",
      "Wrapping is too slow to do 60 times a second",
      "requestAnimationFrame can't call wrap()"
     ],
     "answer": 0,
     "why": "Fix the final positions first, then reveal into them."
    },
    {
     "q": "You start typing while the answer is still being written. What stops the old animation?",
     "options": [
      "Nothing; both keep running",
      "cancelAnimationFrame on the saved frame id",
      "The browser stops it automatically"
     ],
     "answer": 1,
     "why": "Save the id from requestAnimationFrame and cancel it before starting a new one."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "wrap": "function wrap(text, maxWidth) {\n  const words = text.split(/\\s+/).filter(Boolean);\n  const lines = [];\n  let line = '';\n  for (const word of words) {\n    const test = line ? `${line} ${word}` : word;\n    if (ctx.measureText(test).width > maxWidth && line) {\n      lines.push(line);\n      line = word;\n    } else {\n      line = test;\n    }\n  }\n  if (line) lines.push(line);\n  return lines;\n}\n\nfunction layout(text) {\n  ctx.font = '600 24px Georgia, serif';\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'middle';\n  const lines = wrap(text, W - 48);\n  const lineHeight = 32;\n  const top = H / 2 - ((lines.length - 1) * lineHeight) / 2;\n  return lines.map((t, i) => ({ text: t, x: W / 2, y: top + i * lineHeight }));\n}\n\nfunction drawLines(lines) {\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#78350f';\n  for (const l of lines) ctx.fillText(l.text, l.x, l.y);\n}",
    "reveal": "const reduce = matchMedia('(prefers-reduced-motion: reduce)');\nconst still = document.getElementById('still');\nlet frameId = 0;\n\nfunction drawPartial(lines, shown) {\n  ctx.clearRect(0, 0, W, H);\n  ctx.shadowColor = 'rgba(120, 53, 15, 0.35)';\n  ctx.shadowOffsetY = 2;\n  ctx.shadowBlur = 3;\n  ctx.fillStyle = '#78350f';\n  let left = shown;\n  for (const l of lines) {\n    if (left <= 0) break;\n    const part = l.text.slice(0, left);\n    ctx.textAlign = 'left';\n    ctx.fillText(part, l.x - ctx.measureText(l.text).width / 2, l.y);\n    left -= l.text.length + 1;\n  }\n  ctx.shadowColor = 'transparent';\n}\n\nfunction writeAnswer(text) {\n  cancelAnimationFrame(frameId);\n  canvas.setAttribute('aria-label', text);\n  const lines = layout(text);\n  const total = text.length;\n  if (reduce.matches || still.checked) { drawPartial(lines, total); return; }\n  let shown = 0;\n  const step = () => {\n    shown += 2;\n    drawPartial(lines, shown);\n    if (shown < total) frameId = requestAnimationFrame(step);\n  };\n  frameId = requestAnimationFrame(step);\n}\n\nmsg.addEventListener('input', () => writeAnswer(msg.value));\nwindow.addEventListener('resize', () => { fit(); writeAnswer(msg.value); });\ndocument.getElementById('again').addEventListener('click', () => writeAnswer(msg.value));\nwriteAnswer(msg.value);"
   }
  }
 ],
 "finish": "You can put words on a canvas properly now. You learned:\n\n- `font`, `textAlign`, `textBaseline` and `fillText`, and where text lands\n- **measureText** to fit and to **wrap** word by word\n- Lines **laid out once**, then **revealed** letter by letter with requestAnimationFrame\n- **Reduced motion**, `cancelAnimationFrame`, and an **aria-label** so the words are readable by everyone\n\nYou've now learned every part of **SuperBook**: web APIs, caching, matching questions and canvas text. Build it next.\n\n### Challenges\n\n1. Right-to-left text: set `ctx.direction = 'rtl'` for an Arabic or Hebrew answer and check the alignment.\n2. Add a gentle wind: draw each line a few pixels to the side with `Math.sin(time + i)`.\n3. Turn the text into sand grains: draw it to a hidden canvas, read the pixels with `getImageData`, and place a grain on every filled pixel.\n\n### Next\n\nThe **SuperBook** project."
};
