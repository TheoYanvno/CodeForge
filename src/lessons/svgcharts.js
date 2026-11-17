// Built from guides/svgcharts.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "svgcharts",
 "title": "Charts drawn with SVG",
 "goals": [
  "Turn numbers into positions with a simple scale function",
  "Draw a bar chart in JSX with rect, line and text",
  "Make a chart readable for everyone with a title, tooltips and a hidden table"
 ],
 "prereqs": [
  "React basics (components, props, lists with keys)",
  "HTML & CSS basics"
 ],
 "sessions": [
  {
   "title": "From numbers to a picture",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "A scale: numbers become positions",
   "body": "An SVG has its own coordinate system set by `viewBox`: `viewBox=\"0 0 300 150\"` means 300 units across and 150 down, whatever size it's shown at. The y axis points **down**, so 0 is the top.\n\nA chart needs one small function: a **scale** that turns a value (0–100% chance of rain) into a y position inside the plot area:\n\n```js\nconst w = 300, h = 150, top = 10, bottom = 26;\nconst plotH = h - top - bottom;                 // the height bars can use\nconst y = (pct) => top + plotH * (1 - pct / 100);\ny(100);   // 10: the top of the plot\ny(0);     // 124: the bottom\n```\n\n```svg viewBox units: y grows downward, so 100% sits near the top and 0% near the bottom\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 170\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"320\" height=\"170\" fill=\"#fff\"/>\n  <rect x=\"40\" y=\"10\" width=\"260\" height=\"114\" fill=\"#f1f5f9\" stroke=\"#94a3b8\"/>\n  <text x=\"34\" y=\"14\" text-anchor=\"end\">y=10 → 100%</text><text x=\"34\" y=\"128\" text-anchor=\"end\">y=124 → 0%</text>\n  <path d=\"M30 140 V150 M30 150 H50\" stroke=\"#374151\"/><text x=\"55\" y=\"154\">(0,0) is the top left corner</text>\n  <rect x=\"120\" y=\"60\" width=\"20\" height=\"64\" fill=\"#60a5fa\"/><text x=\"150\" y=\"80\">50%: y(50) = 67</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "In an SVG with viewBox=\"0 0 300 150\", where is y = 0?",
     "options": [
      "At the top",
      "At the bottom",
      "In the middle"
     ],
     "answer": 0,
     "why": "SVG, like the screen, counts y downward from the top edge."
    },
    {
     "q": "Why write a y() scale function instead of computing positions inline?",
     "options": [
      "SVG requires functions",
      "One rule turns every value into a position, so bars, grid lines and labels always agree",
      "It makes the chart animate"
     ],
     "answer": 1,
     "why": "When the gridline at 50% and a 50% bar both use y(50), they line up by construction."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Bars, grid lines and labels in JSX",
   "body": "SVG elements are just JSX. Weatherboard's rain chart maps the next twelve hours to bars:\n\n```jsx\nexport default function RainChart({ hours }) {\n  const w = 300, h = 150, top = 10, bottom = 26, left = 34;\n  const plotH = h - top - bottom;\n  const step = (w - left) / Math.max(hours.length, 1);\n  const y = (pct) => top + plotH * (1 - pct / 100);\n  return (\n    <svg viewBox={`0 0 ${w} ${h}`} role=\"img\" aria-label={`Chance of rain over the next ${hours.length} hours`}>\n      {[0, 50, 100].map((p) => (\n        <g key={p}>\n          <line className=\"grid\" x1={left} x2={w} y1={y(p)} y2={y(p)} />\n          <text className=\"axis\" x={left - 6} y={y(p) + 4} textAnchor=\"end\">{p}%</text>\n        </g>\n      ))}\n      {hours.map((hr, i) => {\n        const x = left + i * step + step * 0.3;\n        const barH = Math.max(2, plotH * (hr.rain / 100));       // a 0% hour still shows a sliver\n        return (\n          <rect key={hr.time} className={hr.rain >= 60 ? 'bar high' : 'bar'}\n            x={x} y={top + plotH - barH} width={step * 0.4} height={barH} rx={step * 0.2} />\n        );\n      })}\n    </svg>\n  );\n}\n```\n\n- A bar's `y` is its **top**, so it starts at `top + plotH - barH` and grows down to the axis.\n- In JSX, SVG attributes with dashes become camelCase: `text-anchor` is `textAnchor`.\n- Colors live in CSS (`.bar`, `.bar.high`), so the chart follows light and dark themes.\n\n```svg A bar's y is its top edge: it starts at plot bottom minus its height and grows down to the axis\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 150\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"320\" height=\"150\" fill=\"#fff\"/>\n  <line x1=\"30\" y1=\"124\" x2=\"300\" y2=\"124\" stroke=\"#94a3b8\"/>\n  <rect x=\"80\" y=\"54\" width=\"30\" height=\"70\" fill=\"#60a5fa\"/>\n  <path d=\"M120 54 H150 M120 124 H150 M140 54 V124\" stroke=\"#dc2626\"/><text x=\"155\" y=\"92\">height = barH</text>\n  <text x=\"155\" y=\"58\">y = top + plotH − barH</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does each bar start at top + plotH - barH?",
     "options": [
      "To flip the chart upside down",
      "A rect's y is its top edge, and bars should rise from the bottom axis",
      "Because SVG can't draw downward"
     ],
     "answer": 1,
     "why": "The bottom of every bar should sit on the axis at top + plotH."
    },
    {
     "q": "How is the SVG attribute text-anchor written in JSX?",
     "options": [
      "text_anchor",
      "textAnchor",
      "\"text-anchor\" only works as a string prop"
     ],
     "answer": 1,
     "why": "JSX uses camelCase for attributes with dashes, like strokeWidth and textAnchor."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Charts everyone can read",
   "body": "A picture of bars says nothing to a screen reader. Three small additions fix that:\n\n1. `role=\"img\"` and an `aria-label` on the `<svg>` give it a name.\n2. A `<title>` inside each bar shows a tooltip on hover: `<title>{`${clock(hr.time)}: ${hr.rain}%`}</title>`.\n3. The same numbers in a **visually hidden table**, so they can be read one by one:\n\n```jsx\n<table className=\"sr-only\">\n  <caption>Chance of rain by hour</caption>\n  <tbody>{hours.map((hr) => <tr key={hr.time}><th scope=\"row\">{clock(hr.time)}</th><td>{hr.rain}%</td></tr>)}</tbody>\n</table>\n```\n\n`.sr-only` hides it on screen but keeps it for assistive technology (`position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)`). Never use `display: none` for this: it hides it from screen readers too.\n\n```svg One set of numbers, two ways to read it: the chart for eyes, a hidden table for screen readers\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 420 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"420\" height=\"110\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"40\" width=\"90\" height=\"34\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"55\" y=\"61\" text-anchor=\"middle\">hours[]</text>\n  <rect x=\"160\" y=\"10\" width=\"110\" height=\"34\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"215\" y=\"31\" text-anchor=\"middle\">&lt;svg&gt; bars</text>\n  <rect x=\"160\" y=\"66\" width=\"110\" height=\"34\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"215\" y=\"87\" text-anchor=\"middle\">sr-only table</text>\n  <path d=\"M100 57 L160 27 M100 57 L160 83\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"285\" y=\"31\">seen</text><text x=\"285\" y=\"87\">read aloud</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why not hide the data table with display: none?",
     "options": [
      "display: none hides it from screen readers as well, so nobody could read it",
      "display: none is slower",
      "Tables can't use display: none"
     ],
     "answer": 0,
     "why": "A visually hidden class keeps content available to assistive technology."
    },
    {
     "q": "What does a <title> element inside an SVG shape do?",
     "options": [
      "It sets the page title",
      "It names the shape, shown as a tooltip on hover and read by assistive technology",
      "It adds a caption under the chart"
     ],
     "answer": 1,
     "why": "<title> is the accessible name for an SVG element."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  }
 ],
 "finish": "You can draw a chart with a scale function, rects and lines in JSX, and make it readable with a label, tooltips and a hidden table.\n\n### Challenges\n\n1. Add a line chart of temperature with `<polyline points=\"…\">`.\n2. Mark the current hour with a dashed line.\n3. Color bars by intensity with three CSS classes instead of two."
};
