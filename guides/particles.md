---
id: particles
title: Canvas particles
blocks-html: page
blocks-css: base
blocks-js: canvas, ember, system, kind
goals: Explain a particle system: many tiny objects, each with a position, a speed and a lifetime; Size a canvas for sharp drawing on any screen with devicePixelRatio; Animate smoothly with requestAnimationFrame and time-based movement; Add, update and remove particles every frame without the array growing forever; Respect people who prefer reduced motion, and stop animating when the tab is hidden
prereqs: The Canvas drawing lesson and the Game loops and timers lesson
---

## Session: Floating embers

## Step: What a particle system is
time: 10
kind: read

Sparks, snow, smoke, confetti and the embers floating behind Bonfire Notes are all the same trick: a **particle system**. It's hundreds of tiny objects, each one very simple:

```js
{ x: 120, y: 300, vx: 4, vy: -30, size: 2, life: 0, maxLife: 4 }   // position, speed (pixels per second), age
```

Every frame, each particle **moves** by its speed, **ages**, and fades as it gets near the end of its life. Dead particles are removed and new ones are born at the bottom. No single particle is interesting; hundreds of them together look alive.

```svg Each frame: spawn new particles, move and age every particle, remove the dead ones, then draw what's left
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 130" font-family="sans-serif" font-size="11">
  <rect x="5" y="5" width="320" height="120" rx="10" fill="#1c1917"/>
  <g fill="#fb923c"><circle cx="60" cy="110" r="3"/><circle cx="70" cy="85" r="2.5" opacity=".9"/><circle cx="80" cy="60" r="2" opacity=".7"/><circle cx="95" cy="38" r="1.5" opacity=".45"/><circle cx="105" cy="20" r="1" opacity=".2"/></g>
  <path d="M60 106 Q75 70 104 22" fill="none" stroke="#fdba74" stroke-dasharray="3 4" opacity=".6"/>
  <text x="140" y="30" fill="#fde68a">1. spawn at the bottom</text><text x="140" y="52" fill="#fde68a">2. move by speed × time</text><text x="140" y="74" fill="#fde68a">3. age, and fade near the end</text><text x="140" y="96" fill="#fde68a">4. remove the dead</text><text x="140" y="118" fill="#fde68a">5. draw what's left</text>
</svg>
```

Two tools from earlier lessons do the work: the **canvas** for drawing, and a **loop**. This time the loop is `requestAnimationFrame`, which runs just before the screen refreshes (about 60 times a second), pauses by itself in background tabs, and gives the smoothest motion.

## Step: A sharp canvas behind the page
time: 12

The canvas sits behind everything (`position: fixed`, `z-index: -1`) and fills the window. Two details make it look right:

- **Resize with the window.** On `resize`, set the canvas's `width` and `height` again.
- **Sharp on high-density screens.** Phones and many laptops have 2 or 3 real pixels per CSS pixel (`window.devicePixelRatio`). Make the canvas that many times bigger, keep its CSS size the same, and `scale` the drawing, or everything looks blurry.

One ember is drawn, a soft glowing dot made with a **radial gradient**: bright in the middle, fading to nothing at the edge.

check: js | sizing for the screen's pixel density | /devicePixelRatio/ | const dpr = window.devicePixelRatio || 1;
check: js | resizing with the window | /addEventListener\(\s*['"]resize['"]/ | window.addEventListener('resize', fit);
check: js | a soft glow with a radial gradient | /createRadialGradient\(/ | ctx.createRadialGradient(x, y, 0, x, y, r)

quiz: Why multiply the canvas size by `devicePixelRatio`?
- [x] So there's one canvas pixel per real screen pixel and the drawing stays sharp
- [ ] To make the embers bigger
- [ ] So it works on old browsers
why: A 2x screen stretches a 1x canvas over twice the pixels, which blurs it.

quiz: Why is the canvas `position: fixed` with `z-index: -1`?
- [ ] So it can be clicked
- [x] It stays behind the text and doesn't move when the page scrolls
- [ ] Canvases must be fixed
why: The effect is a backdrop; the content stays on top and readable.

```html page
<canvas id="embers" aria-hidden="true"></canvas>
<main class="post">
  <h1>Linking the First Flame</h1>
  <p>The last fight is quiet. No music until the second phase. Embers drift up from the floor of the kiln.</p>
  <p id="stats" class="stats"></p>
  <label class="small"><input id="reduce" type="checkbox"> Pretend I prefer reduced motion</label>
</main>
```

```css base
body { margin: 0; min-height: 100vh; font-family: Georgia, serif; background: #0c0a09; color: #f5f5f4; }
#embers { position: fixed; inset: 0; width: 100%; height: 100%; z-index: -1; }
.post { max-width: 560px; margin: 0 auto; padding: 40px 16px; }
h1 { color: #fdba74; }
.stats { font: .8rem ui-monospace, Menlo, Consolas, monospace; color: #a8a29e; }
.small { font: .85rem system-ui, sans-serif; color: #d6d3d1; }
```

```js canvas
const canvas = document.getElementById('embers');
const ctx = canvas.getContext('2d');
let W = 0;
let H = 0;

function fit() {
  const dpr = window.devicePixelRatio || 1;
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', fit);
fit();
```

```js ember
function drawEmber(x, y, r, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  g.addColorStop(0, `rgba(255, 200, 120, ${alpha})`);
  g.addColorStop(0.3, `rgba(251, 146, 60, ${alpha * 0.6})`);
  g.addColorStop(1, 'rgba(251, 146, 60, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 4, 0, Math.PI * 2);
  ctx.fill();
}

ctx.clearRect(0, 0, W, H);
drawEmber(W / 2, H * 0.7, 3, 1);
```

## Step: Many embers, born and gone
time: 18

Now the system. Each frame:

1. **Spawn**: add a few new embers at random spots along the bottom, with a small random sideways speed and an upward speed.
2. **Update**: move each by its speed **times the time since the last frame** (`dt`, in seconds), and add `dt` to its age.
3. **Remove the dead**: `particles = particles.filter((p) => p.life < p.maxLife)`. Without this the array would grow forever and the page would slow to a crawl.
4. **Draw**: clear, then draw each ember, fading out near the end of its life.

```svg Moving by speed × dt keeps the motion the same on a 60 Hz and a 120 Hz screen
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="11">
  <text x="10" y="20">60 frames a second: dt ≈ 0.016 s → 30 px/s × 0.016 = 0.5 px a frame</text>
  <text x="10" y="44">120 frames a second: dt ≈ 0.008 s → 0.25 px a frame</text>
  <text x="10" y="70" font-weight="700">both move 30 px every second</text>
  <text x="10" y="92" fill="#475569">moving a fixed 0.5 px a frame would run twice as fast at 120 Hz</text>
</svg>
```

Why `dt`? Screens refresh at different rates (60, 90, 120 times a second), and a busy frame can take longer. Moving a fixed amount *per frame* makes embers rise faster on faster screens. Moving *speed × time* makes them rise at the same speed everywhere.

The page shows how many embers are alive and the frame rate, so you can see the count stay steady instead of growing.

check: js | a loop with requestAnimationFrame | /requestAnimationFrame\(\s*frame\s*\)/ | requestAnimationFrame(frame);
check: js | moving by speed times time | /p\.y\s*\+=\s*p\.vy\s*\*\s*dt/ | p.y += p.vy * dt;
check: js | removing dead particles | /particles\s*=\s*particles\.filter\(/ | particles = particles.filter((p) => p.life < p.maxLife);

quiz: What happens if dead particles are never removed?
- [ ] Nothing, they're invisible
- [x] The array grows every frame until the page slows down and eats memory
- [ ] The canvas clears them automatically
why: Invisible isn't gone; every particle in the array still costs time each frame.

quiz: Why move by `vy * dt` instead of a fixed amount per frame?
- [x] So embers rise at the same speed on 60 Hz and 120 Hz screens, and slow frames don't make them lag
- [ ] It makes the code shorter
- [ ] requestAnimationFrame requires it
why: Time-based movement is independent of the frame rate.

```js system
let particles = [];
let last = performance.now();
let fps = 0;
const statsEl = document.getElementById('stats');
const rand = (a, b) => a + Math.random() * (b - a);

function spawn(n) {
  for (let i = 0; i < n; i++) {
    particles.push({ x: rand(0, W), y: H + 10, vx: rand(-12, 12), vy: rand(-60, -25), size: rand(1, 2.6), life: 0, maxLife: rand(3, 7) });
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  fps = fps * 0.9 + (dt ? 1 / dt : 0) * 0.1;

  spawn(Math.random() < 0.6 ? 1 : 0);
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life += dt;
  }
  particles = particles.filter((p) => p.life < p.maxLife);

  ctx.clearRect(0, 0, W, H);
  for (const p of particles) drawEmber(p.x, p.y, p.size, 1 - p.life / p.maxLife);

  statsEl.textContent = `${particles.length} embers · ${Math.round(fps)} fps`;
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
```

## Step: Gentle on people and batteries
time: 12

Moving backgrounds can make some people dizzy or sick, especially those with vestibular disorders. Operating systems have a **Reduce motion** setting, and the page can read it:

```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
```

When it's on, the page draws a few still embers once and doesn't animate. It also listens for changes, so turning the setting on mid-visit stops the animation straight away. (The checkbox pretends the setting is on, so you can test it.)

Two more courtesies: a **cap** on how many embers can exist (a burst can't run away), and **stopping when the tab is hidden** (`document.hidden`, the `visibilitychange` event), so a background tab doesn't use battery.

```svg Before each frame: if reduced motion is on or the tab is hidden, stop; otherwise draw and ask for the next frame
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 100" font-family="sans-serif" font-size="11">
  <path d="M100 50 L150 20 L200 50 L150 80 Z" fill="#fef9c3" stroke="#ca8a04"/><text x="150" y="47" text-anchor="middle" font-size="10">reduce motion</text><text x="150" y="60" text-anchor="middle" font-size="10">or hidden?</text>
  <rect x="5" y="34" width="70" height="32" rx="8" fill="#e0e7ff" stroke="#6366f1"/><text x="40" y="54" text-anchor="middle">frame</text>
  <rect x="230" y="8" width="95" height="30" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="277" y="27" text-anchor="middle">stop (still image)</text>
  <rect x="230" y="62" width="95" height="30" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="277" y="81" text-anchor="middle">draw + next frame</text>
  <path d="M75 50 H98 M195 40 L228 24 M195 60 L228 76" stroke="#111" stroke-width="2"/>
</svg>
```

check: js | reading the reduced motion setting | /prefers-reduced-motion:\s*reduce/ | matchMedia('(prefers-reduced-motion: reduce)')
check: js | stopping when the tab is hidden | /addEventListener\(\s*['"]visibilitychange['"]/ | document.addEventListener('visibilitychange', ...)
check: js | a cap on how many exist | /particles\.length\s*<\s*MAX/ | if (particles.length < MAX) ...

quiz: A visitor has Reduce motion turned on. What should the embers do?
- [ ] Animate anyway, it's only decoration
- [x] Stay still (or not show), because moving backgrounds can make some people feel sick
- [ ] Move faster to finish sooner
why: prefers-reduced-motion is the visitor telling you motion is a problem for them.

quiz: Why stop the loop when the tab is hidden?
- [x] Nobody can see it, so it would only use battery and processor time
- [ ] Hidden tabs can't draw
- [ ] It resets the embers
why: Do work only when someone can see the result.

```js system
let particles = [];
let last = performance.now();
let fps = 0;
const statsEl = document.getElementById('stats');
const rand = (a, b) => a + Math.random() * (b - a);

function spawn(n) {
  for (let i = 0; i < n && particles.length < MAX; i++) {
    particles.push({ x: rand(0, W), y: H + 10, vx: rand(-12, 12), vy: rand(-60, -25), size: rand(1, 2.6), life: 0, maxLife: rand(3, 7) });
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  fps = fps * 0.9 + (dt ? 1 / dt : 0) * 0.1;
  spawn(Math.random() < 0.6 ? 1 : 0);
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life += dt;
  }
  particles = particles.filter((p) => p.life < p.maxLife);
  ctx.clearRect(0, 0, W, H);
  for (const p of particles) drawEmber(p.x, p.y, p.size, 1 - p.life / p.maxLife);
  statsEl.textContent = `${particles.length} embers · ${Math.round(fps)} fps`;
}
```

```js kind
const MAX = 220;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const fake = document.getElementById('reduce');
let running = false;

const wantsStill = () => reduce.matches || fake.checked;

function stillImage() {
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < 25; i++) drawEmber(rand(0, W), rand(H * 0.4, H), rand(1, 2.2), rand(0.2, 0.6));
  statsEl.textContent = 'Reduced motion: still embers, no animation.';
}

function loop(now) {
  if (wantsStill() || document.hidden) {
    running = false;
    if (wantsStill()) stillImage();
    return;
  }
  frame(now);
  requestAnimationFrame(loop);
}

function start() {
  if (running || wantsStill() || document.hidden) return;
  running = true;
  last = performance.now();
  requestAnimationFrame(loop);
}

const update = () => (wantsStill() ? stillImage() : start());
reduce.addEventListener('change', update);
fake.addEventListener('change', update);
document.addEventListener('visibilitychange', start);
update();
```

## Finish

You can make a page feel alive, kindly. You learned:

- A **particle system**: many tiny objects that spawn, move, age and die
- A **sharp canvas** with `devicePixelRatio`, resized with the window
- **requestAnimationFrame** and **time-based movement** with `dt`
- **Removing the dead** so the array stays small, and a **cap** on the count
- **prefers-reduced-motion** and pausing **hidden tabs**

You've now learned every part of **Bonfire Notes**: Python, Markdown, hash routing and particles. Build it next.

### Challenges

1. Make embers drift toward the mouse a little (add a small speed toward the pointer each frame).
2. Add a gentle side-to-side wobble with `Math.sin(p.life * 3) * 10` added to x when drawing.
3. Turn the system into confetti: random colors, gravity pulling down (`p.vy += 300 * dt`), and a burst on click.

### Next

The **Bonfire Notes** project.
