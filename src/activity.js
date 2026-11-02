// The days you studied, for the streak card and the streak achievements. A day counts when you
// spend time on a step, finish one, or answer a quiz question. Dates are local calendar days
// (YYYY-MM-DD), so studying at 11 PM and 1 AM are two different days, the way people expect.
// Storage can be blocked (private windows), so reads and writes are wrapped like Progress.

export const localDay = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const dayBefore = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return localDay(new Date(y, m - 1, d - 1));
};

export class Activity {
  constructor(storage = globalThis.localStorage, key = 'codeforge-activity') {
    this.storage = storage;
    this.key = key;
    try { this.days = JSON.parse(storage?.getItem(key))?.days ?? []; } catch { this.days = []; }
  }

  /** Records that you studied on this day (once per day). */
  mark(date = new Date()) {
    const day = localDay(date);
    if (this.days.includes(day)) return;
    this.days = [...this.days, day].sort().slice(-400);
    try { this.storage?.setItem(this.key, JSON.stringify({ days: this.days })); } catch { /* still works */ }
  }

  /** Days in a row ending today, or yesterday if you haven't studied yet today. */
  streak(today = new Date()) {
    const set = new Set(this.days);
    let day = localDay(today);
    if (!set.has(day)) day = dayBefore(day);
    let n = 0;
    while (set.has(day)) { n += 1; day = dayBefore(day); }
    return n;
  }

  /** The longest run of days in a row, ever. */
  longest() {
    let best = 0;
    let run = 0;
    let prev = null;
    for (const day of this.days) {
      run = prev && dayBefore(day) === prev ? run + 1 : 1;
      best = Math.max(best, run);
      prev = day;
    }
    return best;
  }

  reset() {
    this.days = [];
    try { this.storage?.removeItem(this.key); } catch { /* ignore */ }
  }
}
