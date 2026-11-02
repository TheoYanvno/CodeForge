import test from 'node:test';
import assert from 'node:assert';
import { Progress } from '../src/tutor-core.js';
import { Activity, localDay } from '../src/activity.js';
import { GUIDES } from '../src/lessons/index.js';
import * as pages from '../src/pages.js';

const memory = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }; };
const fresh = () => ({ progress: new Progress(memory()), activity: new Activity(memory()) });

test('the streak counts days in a row, and survives until the end of the next day', () => {
  const a = new Activity(memory());
  for (const d of ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-05']) a.mark(new Date(`${d}T10:00`));
  a.mark(new Date('2026-11-05T22:00'));                       // the same day twice counts once
  assert.deepStrictEqual(a.days, ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-05']);
  assert.strictEqual(a.streak(new Date('2026-11-05T12:00')), 1);
  assert.strictEqual(a.streak(new Date('2026-11-06T12:00')), 1, 'not studied yet today: yesterday still counts');
  assert.strictEqual(a.streak(new Date('2026-11-07T12:00')), 0);
  assert.strictEqual(a.longest(), 3);
  assert.strictEqual(localDay(new Date(2026, 0, 31)), '2026-01-31');
  a.mark(new Date('2026-12-31T10:00')); a.mark(new Date('2027-01-01T10:00'));
  assert.strictEqual(a.streak(new Date('2027-01-01T12:00')), 2, 'streaks cross the new year');
});

test('totals, the next guide and the home page come from saved progress', () => {
  const { progress, activity } = fresh();
  assert.strictEqual(pages.nextGuide(GUIDES, progress).id, 'setup');
  const setup = GUIDES.find((g) => g.id === 'setup');
  for (let i = 0; i < setup.steps; i++) progress.complete('setup', i);
  assert.ok(pages.guideStats(setup, progress).finished);
  assert.strictEqual(pages.nextGuide(GUIDES, progress).id, 'github');
  const html = pages.homePage(GUIDES, progress, activity);
  assert.match(html, /Welcome to CodeForge!/);
  assert.match(html, /data-open="github"[^>]*>Continue learning/);
  assert.match(html, /Get set up: the software you need <span class="state">✓/);
  assert.match(html, /data-open="snake"/, 'the featured project is the first unfinished project guide');
  assert.match(html, /<button class="track tone-purple" disabled>/, 'C# is shown as coming soon');
});

test('achievements unlock from progress and the streak', () => {
  const { progress, activity } = fresh();
  const earned = () => pages.achievements(GUIDES, progress, activity).filter((a) => a.earned).map((a) => a.id);
  assert.deepStrictEqual(earned(), []);
  progress.complete('htmlcss', 0);
  assert.deepStrictEqual(earned(), ['first-step']);
  for (const d of ['2026-11-01', '2026-11-02', '2026-11-03']) activity.mark(new Date(`${d}T09:00`));
  assert.ok(earned().includes('streak3'));
  const html = pages.achievementsPage(GUIDES, progress, activity);
  assert.match(html, /2 of 11 earned/);
  assert.match(html, /aria-label="3 of 7"/);
});

test('challenges are read from the end of each guide', () => {
  const md = 'You did it.\n\n### Challenges\n\n1. Add a **Projects** section.\n2. Try a dark theme.\n\n### Next\n\n1. Not a challenge';
  assert.deepStrictEqual(pages.extractChallenges(md), ['Add a **Projects** section.', 'Try a dark theme.']);
  assert.deepStrictEqual(pages.extractChallenges('no list'), []);
});

test('every guide in the list has challenges, and the sidebar has every page', async () => {
  for (const g of GUIDES.filter((x) => x.available)) {
    const data = (await g.load()).default;
    assert.ok(pages.extractChallenges(data.finish).length >= 2, `${g.id} needs a Challenges list on its finish page`);
  }
  const nav = pages.sidebarNav('progress');
  assert.strictEqual((nav.match(/data-page=/g) ?? []).length, pages.PAGES.length);
  assert.match(nav, /class="nav-item active" data-page="progress" aria-current="page"/);
});

test('the security projects are listed as coming soon and do not count toward progress', async () => {
  const { COMING } = await import('../src/lessons/index.js');
  const { progress } = fresh();
  assert.ok(COMING.length >= 10);
  const html = pages.projectsPage(GUIDES, progress, COMING);
  assert.match(html, /Security projects <span class="pill">Coming soon/);
  for (const c of COMING) assert.ok(html.includes(c.title), c.title);
  assert.doesNotMatch(html, /data-open="sentineledr"/, 'nothing to open yet');
  assert.match(pages.lessonsPage(GUIDES, progress, COMING), /SentinelEDR/);
  assert.strictEqual(pages.totals(GUIDES, progress).guides, GUIDES.filter((g) => g.available).length);
});
