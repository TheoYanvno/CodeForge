// Saved progress is stored by guide id and step number (the guide's place, the steps you finished, your
// time and quiz answers per step). These tests make sure reordering the course or adding lessons never
// moves a step someone may already have finished. test/fixtures/saved-steps.json lists every guide's
// steps as they were on Nov 13, 2026, the day before the first learners started; new steps may only be
// added after them, never in between.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { GUIDES, TIERS } from '../src/lessons/index.js';
import { Progress } from '../src/tutor-core.js';

const saved = JSON.parse(readFileSync(new URL('./fixtures/saved-steps.json', import.meta.url), 'utf8'));

test('every guide that existed keeps its id, and its steps keep their numbers', async () => {
  for (const [id, titles] of Object.entries(saved)) {
    const g = GUIDES.find((x) => x.id === id);
    assert.ok(g, `guide "${id}" was removed or renamed: saved progress for it would be lost`);
    const now = (await g.load()).default.steps.map((s) => s.title);
    assert.ok(now.length >= titles.length, `${id} lost steps`);
    assert.deepStrictEqual(now.slice(0, titles.length), titles, `${id}: a step was inserted, removed or renamed before the end; add new steps after the old ones`);
  }
});

test('the course runs beginner to advanced: every guide is in exactly one tier, lessons before the projects that need them', () => {
  const ids = TIERS.flatMap((t) => t.guides);
  assert.strictEqual(new Set(ids).size, ids.length, 'a guide is in two tiers');
  assert.deepStrictEqual(GUIDES.map((g) => g.id), ids);
  assert.deepStrictEqual(TIERS.map((t) => t.id), ['foundations', 'browser', 'pysql', 'react', 'algorithms', 'fullstack']);
  for (const g of GUIDES) {
    for (const need of g.needs ?? []) {
      assert.ok(ids.indexOf(need) < ids.indexOf(g.id), `${g.id} needs ${need}, which comes after it`);
    }
  }
  const at = (id) => ids.indexOf(id);
  assert.ok(at('debugging') === at('jsbasics') + 1, 'Reading errors and DevTools comes right after JavaScript basics');
  assert.ok(at('sudoku') > at('marvel') && at('electron') > at('snake'), 'algorithms and Electron moved out of the first steps');
});

test('progress saved before the reorder still opens at the same place in the same steps', async () => {
  const store = new Map();
  const memory = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  const before = new Progress(memory);
  before.complete('htmlcss', 0); before.complete('htmlcss', 1); before.goTo('htmlcss', 2);
  before.complete('snake', 4); before.answer('snake', '4.0', 1);
  const after = new Progress(memory);
  assert.deepStrictEqual(after.get('htmlcss').done, [0, 1]);
  assert.strictEqual(after.get('htmlcss').step, 2);
  const htmlcss = (await GUIDES.find((g) => g.id === 'htmlcss').load()).default;
  assert.strictEqual(htmlcss.steps[2].title, saved.htmlcss[2]);
  assert.deepStrictEqual(after.get('snake').done, [4]);
});
