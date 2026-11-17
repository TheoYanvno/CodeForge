---
id: reactforms
title: Forms and validation in React
goals: Build a controlled form whose fields live in one state object; Validate with one function that returns a clear message or a clean value; Show the form in a native dialog that's accessible and closes with Escape
prereqs: React basics (state, events, controlled inputs); JavaScript objects
---

## Session: A form that says what's wrong

## Step: One state object for the whole form
kind: read
time: 12

A form with six fields doesn't need six `useState` calls. Keep them in **one object** and update one field at a time with a small helper:

```jsx
const [form, setForm] = useState({ type: 'expense', amount: '', date: today, description: '', category: 'Groceries', note: '' });
const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

<label>Amount ($)<input inputMode="decimal" value={form.amount} onChange={set('amount')} placeholder="0.00" /></label>
<label>Date<input type="date" value={form.date} onChange={set('date')} /></label>
<label>Description<input value={form.description} onChange={set('description')} maxLength={80} /></label>
```

- `set('amount')` returns an event handler for that field; `[k]` is a computed key.
- Fields stay **strings** while typing ("12." is a fine thing to have typed); converting happens when saving.
- `inputMode="decimal"` shows a number keypad on phones without `type="number"`'s spinner and quirks.
- Wrapping the input in its `<label>` connects them, so clicking the words focuses the field.

```svg Each field writes one key of the form object through the same set(k) helper
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 110" font-family="sans-serif" font-size="12">
  <rect width="480" height="110" fill="#fff"/>
  <rect x="10" y="8" width="110" height="24" rx="4" fill="#dbeafe"/><text x="18" y="25">amount input</text>
  <rect x="10" y="42" width="110" height="24" rx="4" fill="#dbeafe"/><text x="18" y="59">date input</text>
  <rect x="10" y="76" width="110" height="24" rx="4" fill="#dbeafe"/><text x="18" y="93">description</text>
  <rect x="200" y="38" width="90" height="30" rx="6" fill="#fef3c7"/><text x="245" y="57" text-anchor="middle">set(k)</text>
  <rect x="340" y="20" width="130" height="66" rx="6" fill="#e0e7ff"/><text x="350" y="40">form = {</text><text x="358" y="56">amount, date,</text><text x="358" y="72">description, … }</text>
  <path d="M120 20 L200 50 M120 54 H200 M120 88 L200 58 M290 53 H340" stroke="#374151"/>
</svg>
```

quiz: Why keep the amount as a string while the person types?
- [x] Partial input like "12." isn't a valid number yet but is a normal thing to have typed
- [ ] React inputs can't hold numbers
- [ ] Strings use less memory
why: Convert and check on save; while typing, keep exactly what was typed.

quiz: What does set('date') return?
- [ ] The date
- [x] A change handler that copies the form with date set to the input's value
- [ ] A new form
why: It's a function that makes handlers, one per field.

## Step: One function checks everything
kind: read
time: 16

Put every rule in one plain function that returns either a clean value or **one clear message**. The form calls it on submit; imports and saved data can call it too:

```js
export function cleanTx(input, existing = {}) {
  const type = input.type === 'income' ? 'income' : input.type === 'expense' ? 'expense' : null;
  if (!type) return { ok: false, error: 'Choose income or expense.' };
  const amount = typeof input.amount === 'number' ? input.amount : toCents(input.amount);
  if (!Number.isInteger(amount) || amount <= 0) return { ok: false, error: 'Enter an amount above $0, like 12.50.' };
  const date = String(input.date ?? '');
  if (!DATE.test(date) || Number.isNaN(Date.parse(date))) return { ok: false, error: 'Choose a date.' };
  const description = String(input.description ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
  if (!description) return { ok: false, error: 'Add a short description, like “Groceries at Publix”.' };
  return { ok: true, tx: { id: existing.id ?? newId(), type, amount, date, description, /* … */ } };
}

const submit = (e) => {
  e.preventDefault();
  const r = cleanTx(form, tx ?? {});
  if (!r.ok) { setError(r.error); return; }
  onSave(r.tx);
};
```

Good messages say **what to do**, with an example: "Enter an amount above $0, like 12.50." beats "Invalid input."

```svg Submit runs one check: a clean transaction is saved, a problem becomes one message by the form
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 100" font-family="sans-serif" font-size="12">
  <rect width="480" height="100" fill="#fff"/>
  <rect x="10" y="35" width="90" height="30" rx="6" fill="#dbeafe"/><text x="55" y="54" text-anchor="middle">submit</text>
  <rect x="140" y="35" width="100" height="30" rx="6" fill="#fef3c7"/><text x="190" y="54" text-anchor="middle">cleanTx(form)</text>
  <rect x="290" y="8" width="180" height="30" rx="6" fill="#dcfce7"/><text x="380" y="27" text-anchor="middle">{ ok: true, tx } → onSave</text>
  <rect x="290" y="62" width="180" height="30" rx="6" fill="#fee2e2"/><text x="380" y="81" text-anchor="middle">{ ok: false, error } → message</text>
  <path d="M100 50 H140 M240 50 L290 23 M240 50 L290 77" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why return { ok: false, error } instead of a list of every problem at once?
- [ ] Only one error can exist
- [x] One clear message at a time is easier to act on; fix it and the next check runs
- [ ] React can only show one string
why: Short forms are best served by one specific instruction. Longer forms can collect messages per field.

quiz: Which error message is most helpful?
- [ ] Invalid input
- [ ] Error 400
- [x] Enter an amount above $0, like 12.50.
why: Say what's wrong and show an example of right.

## Step: A native dialog for the form
kind: read
time: 12

The `<dialog>` element gives you a real modal for free: it traps focus inside, closes with **Escape**, and darkens the page behind it. React opens it with a ref once it's on the page:

```jsx
const ref = useRef(null);
useEffect(() => { const d = ref.current; if (!d.open) d.showModal(); return () => d.open && d.close(); }, []);

<dialog ref={ref} aria-labelledby="tx-h" onClose={onClose} onCancel={onClose}>
  <form onSubmit={submit} noValidate>
    <h2 id="tx-h">Add an expense</h2>
    {/* fields */}
    {error && <p className="form-error" role="alert">{error}</p>}
  </form>
</dialog>
```

- `noValidate` turns off the browser's own popups, so your messages are the only ones.
- `role="alert"` reads the message aloud as soon as it appears.
- Deleting asks once more: the first click shows **Yes, delete it**, the second deletes.

```svg showModal makes the dialog the only thing that can be used until it closes
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 130" font-family="sans-serif" font-size="12">
  <rect width="420" height="130" fill="#334155"/>
  <rect x="20" y="15" width="380" height="20" fill="#475569"/><text x="30" y="29" fill="#cbd5e1">page behind: inert</text>
  <rect x="110" y="40" width="200" height="80" rx="8" fill="#fff"/><text x="125" y="60" font-weight="bold">Add an expense</text>
  <rect x="125" y="70" width="170" height="18" rx="3" fill="#f1f5f9"/><text x="125" y="108">Esc closes · Tab stays inside</text>
</svg>
```

quiz: Why add noValidate to the form?
- [x] So the browser's own validation popups don't appear and your clear messages are the only ones
- [ ] It makes submit faster
- [ ] It's required for dialogs
why: One consistent set of messages, written in your words.

## Finish

You can keep a form in one state object, validate with one function that gives clear messages, and show it in an accessible native dialog.

### Challenges

1. Put the message next to the field it's about and move focus there.
2. Remember the last category used for each type.
3. Write tests for cleanTx with an amount of 0, a missing date and a 200-character description.
