// Built from guides/jsbasics.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "jsbasics",
 "title": "JavaScript basics: a tip calculator",
 "goals": [
  "Store values in variables with const and let, and know strings from numbers",
  "Write functions that take inputs and return an answer",
  "Find elements on the page and change their text",
  "React to typing and clicks with event listeners",
  "Make decisions with if and else",
  "Build buttons from an array with a for...of loop"
 ],
 "prereqs": [
  "The HTML & CSS basics guide (elements, ids, classes, simple CSS)"
 ],
 "sessions": [
  {
   "title": "Variables and functions",
   "from": 0,
   "to": 2
  },
  {
   "title": "Making the page react",
   "from": 3,
   "to": 5
  },
  {
   "title": "Arrays and loops",
   "from": 6,
   "to": 7
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
   "elements": "",
   "math": "",
   "update": "",
   "events": "",
   "presets": ""
  }
 },
 "steps": [
  {
   "title": "The page: inputs for the bill",
   "body": "HTML and CSS make a page look right; **JavaScript** makes it *do* things. In this guide you'll build a tip calculator: type the bill, pick a tip and the number of people, and it shows the tip, the total and what each person pays, updating as you type. The finished project is at [github.com/TheoYanvno/tip-calculator](https://github.com/TheoYanvno/tip-calculator).\n\nFirst the page. It's HTML and CSS you already know, plus one new element: `<input>`, a box the visitor types into.\n\n```html\n<label for=\"bill\">Bill ($)</label>\n<input id=\"bill\" type=\"number\" min=\"0\" step=\"0.01\" placeholder=\"0.00\">\n```\n\n- `type=\"number\"` shows a number keyboard on phones and stops letters being typed.\n- A `<label>` with `for=\"bill\"` is tied to the input with `id=\"bill\"`: clicking the label puts the cursor in the box, and screen readers read the label out.\n- The empty `<div id=\"presets\">` will hold tip buttons; JavaScript fills it in the last session.\n- The result paragraphs have ids so JavaScript can find them and write the answers into them.\n\nYour project folder needs a third file now, `script.js`, loaded at the end of the `<body>` with `<script src=\"script.js\"></script>`. Putting it last means the HTML above it already exists when the script runs.",
   "checks": [
    {
     "pane": "html",
     "label": "a number input with id \"bill\"",
     "test": "/<input[^>]*id=[\"']bill[\"'][^>]*type=[\"']number|<input[^>]*type=[\"']number[\"'][^>]*id=[\"']bill/",
     "hint": "Add <input id=\"bill\" type=\"number\">"
    },
    {
     "pane": "html",
     "label": "inputs for the tip and people",
     "test": "/id=[\"']tip[\"'][\\s\\S]*id=[\"']people[\"']/",
     "hint": "Add inputs with id=\"tip\" and id=\"people\""
    },
    {
     "pane": "html",
     "label": "a place for the results",
     "test": "/id=[\"']perPerson[\"']/",
     "hint": "Add <strong id=\"perPerson\">"
    }
   ],
   "quiz": [
    {
     "q": "Why does each input have a matching `<label for=\"...\">`?",
     "options": [
      "It makes the input bigger",
      "Clicking the label focuses the input, and screen readers announce it",
      "JavaScript can't read inputs without a label"
     ],
     "answer": 1,
     "why": "`for` connects the label to the input with that id, which helps everyone, especially keyboard and screen reader users."
    }
   ],
   "session": 0,
   "minutes": 12,
   "html": {
    "page": "<main class=\"calc\">\n  <h1>Tip Calculator</h1>\n\n  <label for=\"bill\">Bill ($)</label>\n  <input id=\"bill\" type=\"number\" min=\"0\" step=\"0.01\" placeholder=\"0.00\">\n\n  <label for=\"tip\">Tip (%)</label>\n  <input id=\"tip\" type=\"number\" min=\"0\" value=\"18\">\n  <div id=\"presets\" class=\"presets\"></div>\n\n  <label for=\"people\">People</label>\n  <input id=\"people\" type=\"number\" min=\"1\" value=\"1\">\n\n  <section class=\"results\" aria-live=\"polite\">\n    <p>Tip <strong id=\"tipAmount\">$0.00</strong></p>\n    <p>Total <strong id=\"total\">$0.00</strong></p>\n    <p class=\"big\">Each person pays <strong id=\"perPerson\">$0.00</strong></p>\n    <p id=\"message\" class=\"message\"></p>\n  </section>\n</main>"
   },
   "css": {
    "base": "body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #ecfdf5;\n  color: #064e3b;\n}\n\n.calc {\n  box-sizing: border-box;\n  width: min(360px, 100% - 32px);\n  padding: 24px;\n  background: #ffffff;\n  border-radius: 16px;\n  box-shadow: 0 10px 30px rgb(0 0 0 / .08);\n}\n\nh1 { margin-top: 0; }\n\nlabel {\n  display: block;\n  margin-top: 12px;\n  font-weight: 600;\n}\n\ninput {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 10px;\n  font-size: 1.1rem;\n  border: 1px solid #a7f3d0;\n  border-radius: 8px;\n}\n\n.presets {\n  display: flex;\n  gap: 8px;\n  margin-top: 8px;\n}\n\n.presets button {\n  flex: 1;\n  padding: 8px;\n  border: 1px solid #10b981;\n  border-radius: 8px;\n  background: #ffffff;\n  color: #047857;\n  font-weight: 600;\n  cursor: pointer;\n}\n\n.presets button.active {\n  background: #10b981;\n  color: #ffffff;\n}\n\n.results {\n  margin-top: 20px;\n  padding-top: 12px;\n  border-top: 1px dashed #a7f3d0;\n}\n\n.results p {\n  display: flex;\n  justify-content: space-between;\n  margin: 6px 0;\n}\n\n.big { font-size: 1.25rem; }\n\n.message {\n  color: #b91c1c;\n  min-height: 1.5em;\n}"
   }
  },
  {
   "title": "Variables: finding elements on the page",
   "body": "A **variable** is a name for a value, so you can use it later. Picture a labeled box:\n\n```svg A variable is a label on a box that holds a value: const people = 4 puts 4 in a box named people\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 460 150\" font-family=\"sans-serif\" font-size=\"14\">\n  <rect width=\"460\" height=\"150\" fill=\"#ffffff\"/>\n  <rect x=\"30\" y=\"50\" width=\"110\" height=\"70\" rx=\"8\" fill=\"#d1fae5\" stroke=\"#10b981\"/>\n  <text x=\"85\" y=\"94\" text-anchor=\"middle\" font-size=\"26\" fill=\"#064e3b\">4</text>\n  <rect x=\"45\" y=\"30\" width=\"80\" height=\"24\" rx=\"4\" fill=\"#10b981\"/>\n  <text x=\"85\" y=\"47\" text-anchor=\"middle\" fill=\"#ffffff\">people</text>\n  <rect x=\"190\" y=\"50\" width=\"110\" height=\"70\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/>\n  <text x=\"245\" y=\"92\" text-anchor=\"middle\" font-size=\"16\" fill=\"#312e81\">\"Alex\"</text>\n  <rect x=\"205\" y=\"30\" width=\"80\" height=\"24\" rx=\"4\" fill=\"#6366f1\"/>\n  <text x=\"245\" y=\"47\" text-anchor=\"middle\" fill=\"#ffffff\">name</text>\n  <rect x=\"350\" y=\"50\" width=\"90\" height=\"70\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/>\n  <text x=\"395\" y=\"90\" text-anchor=\"middle\" font-size=\"13\" fill=\"#78350f\">&lt;input&gt;</text>\n  <rect x=\"352\" y=\"30\" width=\"86\" height=\"24\" rx=\"4\" fill=\"#f59e0b\"/>\n  <text x=\"395\" y=\"47\" text-anchor=\"middle\" fill=\"#ffffff\">billInput</text>\n  <text x=\"85\" y=\"140\" text-anchor=\"middle\" fill=\"#6b7280\">a number</text>\n  <text x=\"245\" y=\"140\" text-anchor=\"middle\" fill=\"#6b7280\">a string (text)</text>\n  <text x=\"395\" y=\"140\" text-anchor=\"middle\" fill=\"#6b7280\">an element</text>\n</svg>\n```\n\n```js\nconst people = 4;       // a number\nlet name = 'Alex';      // a string: text in quotes\nname = 'Sam';           // let can be changed later; const can't\n```\n\n- Use **`const`** by default: the name always points at the same value.\n- Use **`let`** when the value will change, like a counter.\n- Text in quotes is a **string**. `'4'` (a string) and `4` (a number) are different things; that matters in step 4.\n\n### Finding elements\n\n`document` is the whole page. `document.getElementById('bill')` finds the element with `id=\"bill\"` and gives it back so you can store it in a variable. You'll use these elements over and over, so find them once at the top.\n\n### console.log\n\n`console.log('Tip calculator loaded')` prints a message in the browser's **console** (press F12 and open the Console tab). It's how you check what your code is doing. Errors show up there too, in red, with the line number.",
   "checks": [
    {
     "pane": "js",
     "label": "a variable for the bill input",
     "test": "/const\\s+billInput\\s*=\\s*document\\.getElementById\\(\\s*['\"]bill['\"]\\s*\\)/",
     "hint": "Write const billInput = document.getElementById('bill');"
    },
    {
     "pane": "js",
     "label": "variables for the tip and people inputs",
     "test": "/tipInput\\s*=[\\s\\S]*peopleInput\\s*=/",
     "hint": "Find the tip and people inputs the same way"
    },
    {
     "pane": "js",
     "label": "a message in the console",
     "test": "/console\\.log\\(/",
     "hint": "Add console.log('Tip calculator loaded');"
    }
   ],
   "quiz": [
    {
     "q": "When should you use `let` instead of `const`?",
     "options": [
      "Always; `const` is old",
      "When you'll give the variable a new value later",
      "For text only"
     ],
     "answer": 1,
     "why": "`const` can't be reassigned, which prevents mistakes; `let` is for values that change, like a running total."
    },
    {
     "q": "Are `'4'` and `4` the same in JavaScript?",
     "options": [
      "Yes",
      "No: `'4'` is a string (text) and `4` is a number",
      "Only inside an input"
     ],
     "answer": 1,
     "why": "Quotes make a string. Adding strings joins them (`'4' + '4'` is `'44'`), while adding numbers does math."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "elements": "// Find the parts of the page once, and keep them in variables.\nconst billInput = document.getElementById('bill');\nconst tipInput = document.getElementById('tip');\nconst peopleInput = document.getElementById('people');\nconst presetsBox = document.getElementById('presets');\nconst tipOut = document.getElementById('tipAmount');\nconst totalOut = document.getElementById('total');\nconst perPersonOut = document.getElementById('perPerson');\nconst message = document.getElementById('message');\n\nconsole.log('Tip calculator loaded');"
   }
  },
  {
   "title": "Functions that do the math",
   "body": "A **function** is a named, reusable piece of code. It takes **parameters** (inputs), does something, and can **return** an answer:\n\n```svg A function is a machine: values go in as parameters, the code runs, and return sends one answer back out\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 140\" font-family=\"sans-serif\" font-size=\"14\">\n  <rect width=\"480\" height=\"140\" fill=\"#ffffff\"/>\n  <text x=\"20\" y=\"62\" fill=\"#064e3b\">bill = 50</text>\n  <text x=\"20\" y=\"86\" fill=\"#064e3b\">percent = 18</text>\n  <path d=\"M110 70 H160\" stroke=\"#10b981\" stroke-width=\"3\"/>\n  <path d=\"M152 63 L162 70 L152 77\" fill=\"none\" stroke=\"#10b981\" stroke-width=\"3\"/>\n  <rect x=\"165\" y=\"30\" width=\"170\" height=\"80\" rx=\"10\" fill=\"#d1fae5\" stroke=\"#10b981\"/>\n  <text x=\"250\" y=\"62\" text-anchor=\"middle\" font-family=\"monospace\" fill=\"#064e3b\">tipAmount()</text>\n  <text x=\"250\" y=\"86\" text-anchor=\"middle\" font-family=\"monospace\" font-size=\"12\" fill=\"#064e3b\">bill * percent / 100</text>\n  <path d=\"M335 70 H385\" stroke=\"#10b981\" stroke-width=\"3\"/>\n  <path d=\"M377 63 L387 70 L377 77\" fill=\"none\" stroke=\"#10b981\" stroke-width=\"3\"/>\n  <text x=\"395\" y=\"66\" fill=\"#064e3b\">returns</text>\n  <text x=\"395\" y=\"88\" fill=\"#064e3b\" font-size=\"18\">9</text>\n</svg>\n```\n\n```js\nfunction tipAmount(bill, percent) {\n  return (bill * percent) / 100;\n}\n\ntipAmount(50, 18);   // 9\n```\n\n`function` starts it, `tipAmount` is its name, `(bill, percent)` are its parameters, and the code between `{ }` is its body. Calling it, `tipAmount(50, 18)`, runs the body with `bill` set to 50 and `percent` set to 18, and the call is replaced by what it returns: 9.\n\nThe math operators are `+ - * /`, and parentheses work like in math class.\n\n### Why separate functions?\n\nEach function does one small job, so it's easy to test: try `tipAmount(50, 18)` in the console and check you get 9. The page code (step 4) will call these functions instead of doing math in the middle of everything.\n\n`money(9)` turns a number into text like `$9.00`. `toFixed(2)` always shows two decimal places, and the backtick string `` `$${...}` `` is a **template literal**: `${ }` puts a value inside the text.",
   "checks": [
    {
     "pane": "js",
     "label": "a tipAmount function that returns",
     "test": "/function\\s+tipAmount\\s*\\(\\s*bill\\s*,\\s*percent\\s*\\)\\s*\\{[^}]*return/",
     "hint": "Write function tipAmount(bill, percent) { return ... }"
    },
    {
     "pane": "js",
     "label": "a function that splits the total",
     "test": "/function\\s+perPerson\\s*\\(/",
     "hint": "Write function perPerson(total, people) { ... }"
    },
    {
     "pane": "js",
     "label": "money() shows two decimals",
     "test": "/toFixed\\(\\s*2\\s*\\)/",
     "hint": "Use number.toFixed(2)"
    }
   ],
   "quiz": [
    {
     "q": "What does `return` do?",
     "options": [
      "Prints the value on the page",
      "Ends the function and sends the value back to where it was called",
      "Repeats the function"
     ],
     "answer": 1,
     "why": "The call `tipAmount(50, 18)` is replaced by the returned value, so you can store it or use it in more math."
    },
    {
     "q": "What is `(9).toFixed(2)`?",
     "options": [
      "`9`",
      "`'9.00'`",
      "`9.2`"
     ],
     "answer": 1,
     "why": "`toFixed(2)` gives a string with exactly two digits after the point, which is how money is shown."
    }
   ],
   "session": 0,
   "minutes": 15,
   "js": {
    "math": "// The math: small functions that take numbers and return numbers.\nfunction tipAmount(bill, percent) {\n  return (bill * percent) / 100;\n}\n\nfunction perPerson(total, people) {\n  return total / people;\n}\n\n// Turns 9 into \"$9.00\".\nfunction money(amount) {\n  return `$${amount.toFixed(2)}`;\n}"
   }
  },
  {
   "title": "Reading inputs and showing results",
   "body": "Now connect the math to the page. The `update()` function will:\n\n1. **Read** what's typed in each input.\n2. **Calculate** with the math functions.\n3. **Write** the answers into the result elements.\n\n### Reading an input\n\n`billInput.value` is what's typed in the box, but it's always a **string**, even in a number input. `Number(billInput.value)` turns `'50'` into `50` so math works. (Remember: `'50' + 9` is `'509'`!)\n\n### Writing to the page\n\nEvery element has a `textContent`: the text inside it. Setting it replaces that text:\n\n```js\ntotalOut.textContent = '$59.00';\n```\n\nThat's the core idea of JavaScript on a web page: find an element, change it.\n\n### Try it\n\n`update()` isn't called by anything yet. Open **See it run**, type a bill, then... nothing happens. In the next step, events will call it. (In your own copy, you can type `update()` in the console to run it by hand.)",
   "checks": [
    {
     "pane": "js",
     "label": "an update() function",
     "test": "/function\\s+update\\s*\\(\\s*\\)/",
     "hint": "Write function update() { ... }"
    },
    {
     "pane": "js",
     "label": "turns the typed text into numbers",
     "test": "/Number\\(\\s*billInput\\.value\\s*\\)/",
     "hint": "const bill = Number(billInput.value);"
    },
    {
     "pane": "js",
     "label": "writes the answers into the page",
     "test": "/perPersonOut\\.textContent\\s*=/",
     "hint": "perPersonOut.textContent = money(...);"
    }
   ],
   "quiz": [
    {
     "q": "What type is `billInput.value`?",
     "options": [
      "Always a number",
      "Always a string, even for a number input",
      "An element"
     ],
     "answer": 1,
     "why": "Inputs hold text. Convert with `Number()` before doing math, or `+` will join strings."
    },
    {
     "q": "What does `totalOut.textContent = '$59.00'` do?",
     "options": [
      "Replaces the text inside the total element with $59.00",
      "Adds $59.00 to the console",
      "Changes the element's id"
     ],
     "answer": 0,
     "why": "`textContent` is the element's text; setting it updates what's on the page right away."
    }
   ],
   "session": 1,
   "minutes": 15,
   "js": {
    "update": "// Read the inputs, do the math, and show the answers.\nfunction update() {\n  const bill = Number(billInput.value);\n  const percent = Number(tipInput.value);\n  const people = Number(peopleInput.value);\n\n  const tip = tipAmount(bill, percent);\n  const total = bill + tip;\n\n  tipOut.textContent = money(tip);\n  totalOut.textContent = money(total);\n  perPersonOut.textContent = money(perPerson(total, people));\n}"
   }
  },
  {
   "title": "Events: update as you type",
   "body": "An **event** is something that happens on the page: a click, a key press, typing in a box. You can ask the browser to run a function every time an event happens. That's an **event listener**:\n\n```js\nbillInput.addEventListener('input', update);\n```\n\n\"When the `input` event happens on `billInput`, call `update`.\" The `input` event fires on every change to the box: each key, paste or arrow click.\n\n```svg What happens when you type: the input event fires, the listener calls update, update changes textContent, and the page shows the new totals\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 120\" font-family=\"sans-serif\" font-size=\"13\">\n  <rect width=\"520\" height=\"120\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"35\" width=\"100\" height=\"50\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/>\n  <text x=\"60\" y=\"58\" text-anchor=\"middle\">You type</text><text x=\"60\" y=\"75\" text-anchor=\"middle\">\"5\"</text>\n  <rect x=\"140\" y=\"35\" width=\"100\" height=\"50\" rx=\"8\" fill=\"#e0e7ff\" stroke=\"#6366f1\"/>\n  <text x=\"190\" y=\"58\" text-anchor=\"middle\">'input'</text><text x=\"190\" y=\"75\" text-anchor=\"middle\">event fires</text>\n  <rect x=\"270\" y=\"35\" width=\"100\" height=\"50\" rx=\"8\" fill=\"#d1fae5\" stroke=\"#10b981\"/>\n  <text x=\"320\" y=\"58\" text-anchor=\"middle\">update()</text><text x=\"320\" y=\"75\" text-anchor=\"middle\">runs</text>\n  <rect x=\"400\" y=\"35\" width=\"110\" height=\"50\" rx=\"8\" fill=\"#fce7f3\" stroke=\"#db2777\"/>\n  <text x=\"455\" y=\"58\" text-anchor=\"middle\">textContent</text><text x=\"455\" y=\"75\" text-anchor=\"middle\">changes</text>\n  <path d=\"M110 60 H136 M240 60 H266 M370 60 H396\" stroke=\"#6b7280\" stroke-width=\"2\"/>\n  <text x=\"260\" y=\"108\" text-anchor=\"middle\" fill=\"#6b7280\">This loop runs again on every key you press.</text>\n</svg>\n```\n\nNotice it's `update`, not `update()`. With parentheses you'd call it once, right now, and hand its result to the listener. Without them you hand over the **function itself**, for the browser to call later.\n\nThe last line, `update();`, calls it once when the page loads, so the results show `$0.00` from the start instead of waiting for a key press.",
   "checks": [
    {
     "pane": "js",
     "label": "the bill input listens for typing",
     "test": "/billInput\\.addEventListener\\(\\s*['\"]input['\"]\\s*,\\s*update\\s*\\)/",
     "hint": "billInput.addEventListener('input', update);"
    },
    {
     "pane": "js",
     "label": "the other inputs listen too",
     "test": "/tipInput\\.addEventListener[\\s\\S]*peopleInput\\.addEventListener/",
     "hint": "Add the same listener to tipInput and peopleInput"
    }
   ],
   "quiz": [
    {
     "q": "Why is it `addEventListener('input', update)` and not `addEventListener('input', update())`?",
     "options": [
      "Both are the same",
      "`update` hands over the function to call later; `update()` would call it once immediately",
      "Parentheses aren't allowed in JavaScript"
     ],
     "answer": 1,
     "why": "The listener needs the function itself, so the browser can call it every time the event happens."
    },
    {
     "q": "When does the `input` event fire?",
     "options": [
      "Only when you press Enter",
      "Every time the input's value changes",
      "Only when the page loads"
     ],
     "answer": 1,
     "why": "That's why the totals update with each key, which feels instant."
    }
   ],
   "session": 1,
   "minutes": 12,
   "js": {
    "events": "// Recalculate whenever any input changes, and once now so the results aren't blank.\nbillInput.addEventListener('input', update);\ntipInput.addEventListener('input', update);\npeopleInput.addEventListener('input', update);\n\nupdate();"
   }
  },
  {
   "title": "Decisions with if and else",
   "body": "Try 0 people in See it run: each person pays `$Infinity`. Try deleting the people number: `$NaN` (Not a Number). Programs need to check their inputs. **`if`** runs code only when a condition is true:\n\n```js\nif (people < 1) {\n  message.textContent = 'At least 1 person has to pay.';\n  return;\n}\n```\n\n### Conditions\n\n| Operator | Means |\n|---|---|\n| `===` | equal to (use three `=`; two do surprising type conversions) |\n| `!==` | not equal to |\n| `<` `>` `<=` `>=` | less / greater than (or equal) |\n| `&&` | and: both must be true |\n| `!` | not: flips true and false |\n\nAnd `||` (two pipe characters) means **or**: at least one side must be true.\n\n`Number.isInteger(people)` checks for a whole number, so 2.5 people is refused too.\n\n### return as an early exit\n\n`return` inside `update()` stops the function right there, so the bad numbers never reach the math. This is called a **guard clause**: handle the problems at the top, and the rest of the function can assume the inputs are good. `else` isn't needed after a `return`.\n\nWhen everything is fine, `message.textContent = ''` clears an old warning.",
   "checks": [
    {
     "pane": "js",
     "label": "checks the number of people",
     "test": "/if\\s*\\([^)]*people[^)]*\\)/",
     "hint": "Add if (people < 1 ...) { ... return; }"
    },
    {
     "pane": "js",
     "label": "stops early on bad input",
     "test": "/if\\s*\\([^)]*\\)\\s*\\{[^}]*return;/",
     "hint": "Inside the if, show a message and return;"
    },
    {
     "pane": "js",
     "label": "clears the message when the input is fine",
     "test": "/message\\.textContent\\s*=\\s*['\"]{2}/",
     "hint": "message.textContent = '';"
    }
   ],
   "quiz": [
    {
     "q": "In `if (bill < 0 || people < 1)`, when does the code inside run?",
     "options": [
      "Only when both are true",
      "When at least one of them is true",
      "Never"
     ],
     "answer": 1,
     "why": "`||` means \"or\": either problem is enough to show the warning."
    },
    {
     "q": "What does `return;` do inside `update()` here?",
     "options": [
      "Stops `update()` so the math below doesn't run with bad numbers",
      "Restarts the page",
      "Returns the bill amount"
     ],
     "answer": 0,
     "why": "An early return is a guard: the rest of the function only runs when the inputs make sense."
    }
   ],
   "session": 1,
   "minutes": 15,
   "js": {
    "update": "// Read the inputs, check them, do the math, and show the answers.\nfunction update() {\n  const bill = Number(billInput.value);\n  const percent = Number(tipInput.value);\n  const people = Number(peopleInput.value);\n\n  if (bill < 0 || percent < 0) {\n    message.textContent = 'The bill and tip can\\'t be negative.';\n    return;\n  }\n  if (people < 1 || !Number.isInteger(people)) {\n    message.textContent = 'People must be a whole number, 1 or more.';\n    return;\n  }\n  message.textContent = '';\n\n  const tip = tipAmount(bill, percent);\n  const total = bill + tip;\n\n  tipOut.textContent = money(tip);\n  totalOut.textContent = money(total);\n  perPersonOut.textContent = money(perPerson(total, people));\n}"
   }
  },
  {
   "title": "Tip buttons from an array",
   "body": "Typing a percentage works, but most people want one tap: 10%, 15%, 18%, 20%. Instead of writing four buttons in HTML, keep the choices in an **array** and let a **loop** make a button for each.\n\n### Arrays\n\nAn array is a list of values in square brackets. Each has a position (an **index**) starting at 0:\n\n```js\nconst PRESETS = [10, 15, 18, 20];\nPRESETS[0];       // 10\nPRESETS.length;   // 4\n```\n\nAdding a 25% button is now one edit to the array.\n\n### for...of loops\n\n`for (const percent of PRESETS) { ... }` runs the code in braces once for each item, with `percent` set to 10, then 15, then 18, then 20.\n\n### Making elements\n\n- `document.createElement('button')` makes a new button (not on the page yet).\n- Set its `textContent` and `type`.\n- `presetsBox.append(button)` puts it inside the presets box, on the page.\n\nEach button gets its own click listener. The arrow function `() => { ... }` is a short way to write a function right where it's needed. On click it puts the percent in the tip box and calls `update()`.\n\n### Highlighting the chosen button\n\n`highlight()` loops over the buttons and adds the `active` class to the one that matches the tip box. `classList.toggle('active', condition)` adds the class when the condition is true and removes it when false. It runs on clicks and on typing in the tip box, so they always agree.",
   "checks": [
    {
     "pane": "js",
     "label": "an array of tip percentages",
     "test": "/const\\s+PRESETS\\s*=\\s*\\[[\\d\\s,]+\\]/",
     "hint": "const PRESETS = [10, 15, 18, 20];"
    },
    {
     "pane": "js",
     "label": "a for...of loop over the array",
     "test": "/for\\s*\\(\\s*const\\s+\\w+\\s+of\\s+PRESETS\\s*\\)/",
     "hint": "for (const percent of PRESETS) { ... }"
    },
    {
     "pane": "js",
     "label": "creates a button for each",
     "test": "/document\\.createElement\\(\\s*['\"]button['\"]\\s*\\)/",
     "hint": "const button = document.createElement('button');"
    },
    {
     "pane": "js",
     "label": "each button listens for clicks",
     "test": "/addEventListener\\(\\s*['\"]click['\"]/",
     "hint": "button.addEventListener('click', () => { ... });"
    }
   ],
   "quiz": [
    {
     "q": "What is `PRESETS[1]` if `PRESETS = [10, 15, 18, 20]`?",
     "options": [
      "10",
      "15",
      "1"
     ],
     "answer": 1,
     "why": "Indexes start at 0, so `[1]` is the second item."
    },
    {
     "q": "Why build the buttons from an array instead of writing them in HTML?",
     "options": [
      "Arrays load faster than HTML",
      "Changing the list of tips is one edit, and every button is guaranteed to work the same way",
      "HTML can't have buttons"
     ],
     "answer": 1,
     "why": "Data in one place plus a loop means no copy-pasted code to keep in sync."
    }
   ],
   "session": 2,
   "minutes": 18,
   "js": {
    "presets": "// One button per tip choice, built from data.\nconst PRESETS = [10, 15, 18, 20];\n\nfor (const percent of PRESETS) {\n  const button = document.createElement('button');\n  button.type = 'button';\n  button.textContent = `${percent}%`;\n  button.addEventListener('click', () => {\n    tipInput.value = percent;\n    update();\n    highlight();\n  });\n  presetsBox.append(button);\n}\n\n// Mark the button that matches the tip box.\nfunction highlight() {\n  for (const button of presetsBox.children) {\n    button.classList.toggle('active', button.textContent === `${tipInput.value}%`);\n  }\n}\n\ntipInput.addEventListener('input', highlight);\nhighlight();"
   }
  },
  {
   "title": "Publish it and keep going",
   "body": "Your calculator works. Publish it the same way as the profile page:\n\n1. Make a folder `tip-calculator` with `index.html` (a full page whose `<body>` holds this guide's HTML and ends with `<script src=\"script.js\"></script>`), `style.css` and `script.js`. Copy each file from the last code step's tabs.\n2. Open it with Live Server and check the console (F12) shows `Tip calculator loaded` and no red errors.\n3. In the terminal: `git init`, `git add .`, `git commit -m \"Tip calculator\"`, then create a public `tip-calculator` repository on GitHub and push.\n4. Turn on **Settings → Pages** (main, / root).\n\nThe finished version is at [github.com/TheoYanvno/tip-calculator](https://github.com/TheoYanvno/tip-calculator).\n\n### What to learn next\n\n- **Objects** group related values: `{ bill: 50, tip: 18, people: 2 }`. The Quote & Joke Generator guide uses arrays of objects.\n- **localStorage** remembers things after the page closes, like the last tip you chose. Snake uses it for the best score.\n- **Debugging**: when something breaks, read the red error in the console, click its line number, and `console.log` your variables to see what they really hold.",
   "quiz": [
    {
     "q": "Where does `<script src=\"script.js\"></script>` go in `index.html`, and why?",
     "options": [
      "In the `<head>`, so it loads first",
      "At the end of the `<body>`, so the elements it looks for already exist",
      "Anywhere, it doesn't matter"
     ],
     "answer": 1,
     "why": "Code runs as soon as it loads. At the end of the body, `getElementById` can find every element above it."
    }
   ],
   "session": 2,
   "kind": "read",
   "minutes": 15
  }
 ],
 "finish": "You wrote your first JavaScript program, and it's a real tool you can use at a restaurant. You learned:\n\n- **Variables** with `const` and `let`, **strings** vs **numbers**, and `Number()`\n- **Functions** with parameters and `return`, and template literals\n- **The DOM**: `getElementById`, `value` and `textContent`\n- **Events**: `addEventListener('input' | 'click', ...)`\n- **Decisions**: `if`, comparison and logic operators, guard clauses\n- **Arrays** and **for...of** loops, `createElement`, `append` and `classList`\n\n### Challenges\n\n1. Add a **Round up** checkbox that rounds each person's share up to the next dollar (`Math.ceil`).\n2. Remember the last tip with `localStorage.setItem('tip', ...)` and load it when the page opens.\n3. Add a 25% button by changing only the array.\n\n### Next\n\nYou're ready for the project guides. **Snake** is the best next step: a game loop, the keyboard and a canvas."
};
