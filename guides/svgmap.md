---
id: svgmap
title: An interactive map with SVG pan and zoom
goals: Draw a map from real geographic data projected into SVG coordinates; Pan and zoom by changing the viewBox, with the math kept in tested functions; Support mouse, touch, wheel and keyboard, and keep clicks working alongside drags
prereqs: React basics (state, refs, events); Charts drawn with SVG
---

## Session: A map you can move

## Step: From longitude and latitude to SVG
kind: read
time: 14

The coastlines come from [Natural Earth](https://www.naturalearthdata.com/), free public-domain map data. A small Python script cuts the lands of the Bible out of the world (from Rome to Persia), **projects** them into flat coordinates, simplifies the outlines and saves SVG path data as JSON.

The projection is the simplest one, equirectangular: longitude goes across, latitude goes up, and longitude is squeezed by the cosine of the middle latitude so shapes aren't stretched sideways:

```js
const { west, north, scale, kx } = BASEMAP.box;          // kx = cos(32°) × scale
export const project = ({ lon, lat }) => ({ x: (lon - west) * kx, y: (north - lat) * scale });
project({ lon: 35.23, lat: 31.78 });                       // Jerusalem → about { x: 462, y: 284 }
```

The same function places every city marker, so markers always land on the coastline they belong to. The base map is drawn once as `<path>`s: land, lakes (the Dead Sea, the Sea of Galilee) and rivers (Nile, Jordan, Tigris, Euphrates).

```svg Longitude maps to x, latitude to y (flipped, since SVG's y grows downward)
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 140" font-family="sans-serif" font-size="12">
  <rect width="460" height="140" fill="#cfe3ef"/>
  <path d="M0 60 C 80 40, 120 90, 200 70 S 330 30, 460 50 V140 H0Z" fill="#efe6d2" stroke="#9c8a6a"/>
  <circle cx="300" cy="80" r="5" fill="#b5562d"/><text x="310" y="84">Jerusalem (35.2°E, 31.8°N)</text>
  <path d="M20 20 H120" stroke="#374151"/><text x="20" y="15">east → larger x</text>
  <path d="M440 120 V20" stroke="#374151"/><text x="340" y="15">north → smaller y</text>
</svg>
```

quiz: Why squeeze longitude by the cosine of the middle latitude?
- [x] Degrees of longitude get narrower away from the equator; without it, the map looks stretched sideways
- [ ] Latitude is measured in radians
- [ ] To fit the map on a phone
why: It keeps shapes near the right proportions for this region.

## Step: Pan and zoom are just a viewBox
kind: read
time: 16

You don't move the map; you move the **camera**. The SVG's `viewBox="x y w h"` says which part of the map is visible. Zooming in means a smaller `w` and `h`; panning means a different `x` and `y`. All the math is plain functions:

```js
export function clampView({ x, y, w }) {
  const width = Math.min(FULL.w, Math.max(MIN_WIDTH, w));        // not past the whole map, not closer than ~3°
  const height = width * (FULL.h / FULL.w);                        // keep the map's shape
  return { x: Math.min(Math.max(x, 0), FULL.w - width), y: Math.min(Math.max(y, 0), FULL.h - height), w: width, h: height };
}

/** Zoom keeping the point under the pointer in the same place on screen. */
export function zoomAt(view, factor, px, py) {
  const w = view.w * factor;
  const k = w / view.w;
  return clampView({ x: px - (px - view.x) * k, y: py - (py - view.y) * k, w });
}
export const pan = (view, dx, dy) => clampView({ ...view, x: view.x + dx, y: view.y + dy });
```

`zoomAt` is what makes wheel zoom feel right: the spot under your pointer stays under your pointer.

```svg Zooming in shrinks the viewBox around the pointer; the point under it stays fixed on screen
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 140" font-family="sans-serif" font-size="12">
  <rect width="460" height="140" fill="#fff"/>
  <rect x="20" y="10" width="300" height="120" fill="none" stroke="#94a3b8" stroke-width="2"/><text x="25" y="25">viewBox before</text>
  <rect x="140" y="40" width="150" height="60" fill="none" stroke="#2563eb" stroke-width="2"/><text x="145" y="55" fill="#2563eb">after zoomAt(0.5)</text>
  <circle cx="260" cy="85" r="4" fill="#dc2626"/><text x="330" y="88">pointer stays here</text>
</svg>
```

quiz: How does the map zoom in?
- [ ] By scaling every path with CSS
- [x] By making the viewBox smaller, so less of the map fills the same space
- [ ] By redrawing the map at a bigger size
why: The viewBox is the camera; a smaller window shows things larger.

quiz: Why keep the view math in plain functions?
- [x] Tests can check that zooming keeps the pointer's point fixed and the view never leaves the map
- [ ] React can't do arithmetic
- [ ] It's required for SVG
why: Geometry bugs are easy to test and hard to see.

## Step: Mouse, touch, wheel, keys, and clicks that still work
kind: read
time: 15

Pointer events cover mouse, pen and touch. A drag converts screen pixels to map units with the current ratio, `view.w / svg.clientWidth`:

```jsx
const down = (e) => { drag.current = { x: e.clientX, y: e.clientY, moved: false }; };
const move = (e) => {
  const d = drag.current;
  if (!d) return;
  const dx = e.clientX - d.x, dy = e.clientY - d.y;
  if (!d.moved && Math.abs(dx) + Math.abs(dy) > 2) {
    d.moved = true;                                        // a drag, not a click
    e.currentTarget.setPointerCapture(e.pointerId);        // keep the pointer even off the map
  }
  drag.current = { ...d, x: e.clientX, y: e.clientY };
  setView((v) => pan(v, -dx * ratio(), -dy * ratio()));
};
```

Two details:

- **Capture only once it's a drag.** Capturing on pointerdown sends the click to the SVG instead of the city marker, so clicking places would stop working.
- **The wheel listener is added by hand** with `{ passive: false }`, because React's onWheel can't call `preventDefault()` to stop the page scrolling.

The keyboard gets the same moves: arrow keys pan, + and − zoom, and the map has `tabIndex={0}` and an `aria-label` explaining the keys. `touch-action: none` in CSS lets touch drags pan the map instead of the page.

```svg A small movement is a click on a marker; a bigger one becomes a drag that captures the pointer
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 90" font-family="sans-serif" font-size="12">
  <rect width="460" height="90" fill="#fff"/>
  <rect x="10" y="30" width="100" height="30" rx="6" fill="#e0e7ff"/><text x="60" y="49" text-anchor="middle">pointerdown</text>
  <rect x="160" y="5" width="140" height="28" rx="6" fill="#dcfce7"/><text x="230" y="24" text-anchor="middle">≤ 2px: click marker</text>
  <rect x="160" y="57" width="140" height="28" rx="6" fill="#dbeafe"/><text x="230" y="76" text-anchor="middle">&gt; 2px: capture, pan</text>
  <path d="M110 45 L160 19 M110 45 L160 71" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why not call setPointerCapture on pointerdown?
- [ ] It doesn't work on SVG
- [x] Capturing redirects the click to the SVG, so clicking a city marker would stop working
- [ ] It slows down dragging
why: Capture only when the movement shows it's a drag.

quiz: Why add the wheel listener with addEventListener and passive: false?
- [x] React's onWheel listener is passive, so it can't call preventDefault to stop the page scrolling
- [ ] Wheel events don't exist in React
- [ ] To support touchpads only
why: Only a non-passive listener may cancel scrolling.

## Finish

You can project real map data into SVG, pan and zoom with a viewBox and tested math, and support every kind of input without breaking clicks.

### Challenges

1. Add pinch-to-zoom with two pointers.
2. Draw a dotted route between the places of Paul's journeys.
3. Add a scale bar that shows 100 km at the current zoom.
