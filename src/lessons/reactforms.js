// Built from guides/reactforms.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "reactforms",
 "title": "Forms and validation in React",
 "goals": [
  "Build a controlled form whose fields live in one state object",
  "Validate with one function that returns a clear message or a clean value",
  "Show the form in a native dialog that's accessible and closes with Escape"
 ],
 "prereqs": [
  "React basics (state, events, controlled inputs)",
  "JavaScript objects"
 ],
 "sessions": [
  {
   "title": "A form that says what's wrong",
   "from": 0,
   "to": 2
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "One state object for the whole form",
   "body": "A form with six fields doesn't need six `useState` calls. Keep them in **one object** and update one field at a time with a small helper:\n\n```jsx\nconst [form, setForm] = useState({ type: 'expense', amount: '', date: today, description: '', category: 'Groceries', note: '' });\nconst set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));\n\n<label>Amount ($)<input inputMode=\"decimal\" value={form.amount} onChange={set('amount')} placeholder=\"0.00\" /></label>\n<label>Date<input type=\"date\" value={form.date} onChange={set('date')} /></label>\n<label>Description<input value={form.description} onChange={set('description')} maxLength={80} /></label>\n```\n\n- `set('amount')` returns an event handler for that field; `[k]` is a computed key.\n- Fields stay **strings** while typing (\"12.\" is a fine thing to have typed); converting happens when saving.\n- `inputMode=\"decimal\"` shows a number keypad on phones without `type=\"number\"`'s spinner and quirks.\n- Wrapping the input in its `<label>` connects them, so clicking the words focuses the field.\n\n```svg Each field writes one key of the form object through the same set(k) helper\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"110\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"8\" width=\"110\" height=\"24\" rx=\"4\" fill=\"#dbeafe\"/><text x=\"18\" y=\"25\">amount input</text>\n  <rect x=\"10\" y=\"42\" width=\"110\" height=\"24\" rx=\"4\" fill=\"#dbeafe\"/><text x=\"18\" y=\"59\">date input</text>\n  <rect x=\"10\" y=\"76\" width=\"110\" height=\"24\" rx=\"4\" fill=\"#dbeafe\"/><text x=\"18\" y=\"93\">description</text>\n  <rect x=\"200\" y=\"38\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"245\" y=\"57\" text-anchor=\"middle\">set(k)</text>\n  <rect x=\"340\" y=\"20\" width=\"130\" height=\"66\" rx=\"6\" fill=\"#e0e7ff\"/><text x=\"350\" y=\"40\">form = {</text><text x=\"358\" y=\"56\">amount, date,</text><text x=\"358\" y=\"72\">description, … }</text>\n  <path d=\"M120 20 L200 50 M120 54 H200 M120 88 L200 58 M290 53 H340\" stroke=\"#374151\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why keep the amount as a string while the person types?",
     "options": [
      "Partial input like \"12.\" isn't a valid number yet but is a normal thing to have typed",
      "React inputs can't hold numbers",
      "Strings use less memory"
     ],
     "answer": 0,
     "why": "Convert and check on save; while typing, keep exactly what was typed."
    },
    {
     "q": "What does set('date') return?",
     "options": [
      "The date",
      "A change handler that copies the form with date set to the input's value",
      "A new form"
     ],
     "answer": 1,
     "why": "It's a function that makes handlers, one per field."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "One function checks everything",
   "body": "Put every rule in one plain function that returns either a clean value or **one clear message**. The form calls it on submit; imports and saved data can call it too:\n\n```js\nexport function cleanTx(input, existing = {}) {\n  const type = input.type === 'income' ? 'income' : input.type === 'expense' ? 'expense' : null;\n  if (!type) return { ok: false, error: 'Choose income or expense.' };\n  const amount = typeof input.amount === 'number' ? input.amount : toCents(input.amount);\n  if (!Number.isInteger(amount) || amount <= 0) return { ok: false, error: 'Enter an amount above $0, like 12.50.' };\n  const date = String(input.date ?? '');\n  if (!DATE.test(date) || Number.isNaN(Date.parse(date))) return { ok: false, error: 'Choose a date.' };\n  const description = String(input.description ?? '').replace(/\\s+/g, ' ').trim().slice(0, 80);\n  if (!description) return { ok: false, error: 'Add a short description, like “Groceries at Publix”.' };\n  return { ok: true, tx: { id: existing.id ?? newId(), type, amount, date, description, /* … */ } };\n}\n\nconst submit = (e) => {\n  e.preventDefault();\n  const r = cleanTx(form, tx ?? {});\n  if (!r.ok) { setError(r.error); return; }\n  onSave(r.tx);\n};\n```\n\nGood messages say **what to do**, with an example: \"Enter an amount above $0, like 12.50.\" beats \"Invalid input.\"\n\n```svg Submit runs one check: a clean transaction is saved, a problem becomes one message by the form\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"480\" height=\"100\" fill=\"#fff\"/>\n  <rect x=\"10\" y=\"35\" width=\"90\" height=\"30\" rx=\"6\" fill=\"#dbeafe\"/><text x=\"55\" y=\"54\" text-anchor=\"middle\">submit</text>\n  <rect x=\"140\" y=\"35\" width=\"100\" height=\"30\" rx=\"6\" fill=\"#fef3c7\"/><text x=\"190\" y=\"54\" text-anchor=\"middle\">cleanTx(form)</text>\n  <rect x=\"290\" y=\"8\" width=\"180\" height=\"30\" rx=\"6\" fill=\"#dcfce7\"/><text x=\"380\" y=\"27\" text-anchor=\"middle\">{ ok: true, tx } → onSave</text>\n  <rect x=\"290\" y=\"62\" width=\"180\" height=\"30\" rx=\"6\" fill=\"#fee2e2\"/><text x=\"380\" y=\"81\" text-anchor=\"middle\">{ ok: false, error } → message</text>\n  <path d=\"M100 50 H140 M240 50 L290 23 M240 50 L290 77\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why return { ok: false, error } instead of a list of every problem at once?",
     "options": [
      "Only one error can exist",
      "One clear message at a time is easier to act on; fix it and the next check runs",
      "React can only show one string"
     ],
     "answer": 1,
     "why": "Short forms are best served by one specific instruction. Longer forms can collect messages per field."
    },
    {
     "q": "Which error message is most helpful?",
     "options": [
      "Invalid input",
      "Error 400",
      "Enter an amount above $0, like 12.50."
     ],
     "answer": 2,
     "why": "Say what's wrong and show an example of right."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 16
  },
  {
   "title": "A native dialog for the form",
   "body": "The `<dialog>` element gives you a real modal for free: it traps focus inside, closes with **Escape**, and darkens the page behind it. React opens it with a ref once it's on the page:\n\n```jsx\nconst ref = useRef(null);\nuseEffect(() => { const d = ref.current; if (!d.open) d.showModal(); return () => d.open && d.close(); }, []);\n\n<dialog ref={ref} aria-labelledby=\"tx-h\" onClose={onClose} onCancel={onClose}>\n  <form onSubmit={submit} noValidate>\n    <h2 id=\"tx-h\">Add an expense</h2>\n    {/* fields */}\n    {error && <p className=\"form-error\" role=\"alert\">{error}</p>}\n  </form>\n</dialog>\n```\n\n- `noValidate` turns off the browser's own popups, so your messages are the only ones.\n- `role=\"alert\"` reads the message aloud as soon as it appears.\n- Deleting asks once more: the first click shows **Yes, delete it**, the second deletes.\n\n```svg showModal makes the dialog the only thing that can be used until it closes\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 420 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"420\" height=\"130\" fill=\"#334155\"/>\n  <rect x=\"20\" y=\"15\" width=\"380\" height=\"20\" fill=\"#475569\"/><text x=\"30\" y=\"29\" fill=\"#cbd5e1\">page behind: inert</text>\n  <rect x=\"110\" y=\"40\" width=\"200\" height=\"80\" rx=\"8\" fill=\"#fff\"/><text x=\"125\" y=\"60\" font-weight=\"bold\">Add an expense</text>\n  <rect x=\"125\" y=\"70\" width=\"170\" height=\"18\" rx=\"3\" fill=\"#f1f5f9\"/><text x=\"125\" y=\"108\">Esc closes · Tab stays inside</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why add noValidate to the form?",
     "options": [
      "So the browser's own validation popups don't appear and your clear messages are the only ones",
      "It makes submit faster",
      "It's required for dialogs"
     ],
     "answer": 0,
     "why": "One consistent set of messages, written in your words."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  }
 ],
 "finish": "You can keep a form in one state object, validate with one function that gives clear messages, and show it in an accessible native dialog.\n\n### Challenges\n\n1. Put the message next to the field it's about and move focus there.\n2. Remember the last category used for each type.\n3. Write tests for cleanTx with an amount of 0, a missing date and a 200-character description."
};
