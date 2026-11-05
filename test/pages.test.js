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
  for (const c of COMING) assert.ok(html.includes(pages.esc(c.title)), c.title);
  assert.doesNotMatch(html, /data-open="sentineledr"/, 'nothing to open yet');
  assert.match(pages.lessonsPage(GUIDES, progress, COMING), /SentinelEDR/);
  assert.strictEqual(pages.totals(GUIDES, progress).guides, GUIDES.filter((g) => g.available).length);
});

test('the React projects and C# games get their own coming-soon sections, in order', async () => {
  const { COMING } = await import('../src/lessons/index.js');
  const { progress } = fresh();
  const html = pages.projectsPage(GUIDES, progress, COMING);
  const at = (t) => html.indexOf(t);
  assert.ok(at('React projects') > 0 && at('React projects') < at('C# games') && at('C# games') < at('Security projects'));
  for (const t of ['Weatherboard', 'Shipboard', 'Cashflow', 'Pantry', 'AbramsTree', 'TotalRecall']) assert.ok(at(t) > at('React projects') && at(t) < at('C# games'), t);
  for (const t of ['Gates of Sheol', 'Nehemiah&#39;s Watch', 'Testimony', 'Wilderness', 'Legion']) assert.ok(at(t) > at('C# games') && at(t) < at('Security projects'), t);
  assert.strictEqual(pages.comingSoon(COMING.filter((c) => c.group === 'react')).includes('Security projects'), false, 'empty sections are left out');
  for (const c of COMING.filter((x) => x.group === 'react')) {
    assert.strictEqual(c.lessons?.length, 3, `${c.title} lists the lessons that come before it`);
    assert.ok(html.includes(`Lessons first: ${c.lessons[0]}`), c.title);
  }
});

test('the account box and page show the guest forms or the signed-in name', () => {
  assert.match(pages.accountCard(null), /Guest[\s\S]*data-page="account"/);
  assert.match(pages.accountCard('Anthony'), /Anthony[\s\S]*data-act="signout"/);
  const guest = pages.accountPage(null, 3);
  assert.match(guest, /data-form="signin"/);
  assert.match(guest, /data-form="create"/);
  assert.match(guest, /Bring my guest progress \(3 steps done\)/);
  assert.doesNotMatch(pages.accountPage(null, 0), /Bring my guest progress/, 'nothing to bring, no box');
  assert.match(pages.accountPage('Anthony'), /Signed in as Anthony/);
  assert.match(pages.settingsPage('Anthony'), /data-form="delete"/);
  assert.doesNotMatch(pages.settingsPage(null), /data-form="delete"/);
  assert.match(pages.accountCard('<b>'), /&lt;b&gt;/, 'names are escaped');
});

test('projects only need lessons that come before them, and steps only point to lessons the project needs', async () => {
  const { readFileSync } = await import('node:fs');
  const { parseGuide } = await import('../scripts/build-guides.js');
  GUIDES.forEach((g, i) => {
    for (const id of g.needs ?? []) {
      const at = GUIDES.findIndex((x) => x.id === id);
      assert.ok(at >= 0, `${g.id} needs ${id}, which isn't a guide`);
      assert.ok(at < i, `${g.id} needs ${id}, which comes after it`);
      assert.ok(pages.isLesson(GUIDES[at]), `${g.id} needs ${id}, which is a project, not a lesson`);
    }
    if (pages.isProject(g)) assert.ok(g.needs?.length, `project ${g.id} should list the lessons it combines`);
    if (!g.available) return;
    const guide = parseGuide(readFileSync(new URL(`../guides/${g.id}.md`, import.meta.url), 'utf8'), g.id);
    for (const st of guide.steps) for (const id of st.uses ?? []) {
      assert.ok((g.needs ?? []).includes(id), `${g.id} step "${st.title}" uses ${id}, which isn't in its needs`);
    }
  });
});

test('the Lessons page puts each project after the lessons it needs, with done marks', () => {
  const { progress } = fresh();
  const sections = pages.courseSections(GUIDES);
  assert.strictEqual(sections[0].project.id, 'snake');
  assert.ok(sections[0].lessons.some((g) => g.id === 'jsbasics'));
  for (let i = 0; i < GUIDES.find((g) => g.id === 'htmlcss').steps; i++) progress.complete('htmlcss', i);
  const html = pages.lessonsPage(GUIDES, progress);
  assert.match(html, /Lessons before Snake/);
  assert.match(html, /Project: <strong>Snake<\/strong> <span class="pill">1 of \d+ lessons done/);
  assert.match(pages.needChips(GUIDES.find((g) => g.id === 'snake'), GUIDES, progress), /need ok">✓ HTML &amp; CSS basics/);
});

test('skill badges: one per language and tool, earned by finishing every guide that teaches it', () => {
  const { progress, activity } = fresh();
  const ids = pages.SKILLS.map((s) => s.id);
  assert.deepStrictEqual(pages.SKILLS.map((s) => s.title), ['HTML', 'CSS', 'JavaScript', 'React', 'Python', 'SQL', 'C#', 'Electron']);
  assert.strictEqual(new Set(ids).size, ids.length);
  const badge = (id) => pages.skillBadges(GUIDES, progress).find((b) => b.id === id);
  // React and C# have no guides yet, so they show as coming soon and can't be earned
  for (const id of ['skill-react', 'skill-csharp']) {
    const b = badge(id);
    if (!b.target) { assert.ok(b.soon); assert.ok(!b.earned); }
  }
  const finish = (id) => { const g = GUIDES.find((x) => x.id === id); for (let i = 0; i < g.steps; i++) progress.complete(id, i); };
  const py = badge('skill-python');
  assert.ok(!py.earned && py.target === 1);
  finish('python');
  assert.ok(badge('skill-python').earned);
  const html = badge('skill-html');
  assert.ok(html.target >= 1 && html.value === 0);
  finish('htmlcss');
  assert.strictEqual(badge('skill-html').value, 1);
  assert.strictEqual(badge('skill-css').value, 1, 'HTML & CSS basics counts toward both');
  // a guide a badge lists that doesn't exist yet is skipped, not counted
  const sql = badge('skill-sql');
  assert.strictEqual(sql.target, pages.SKILLS.find((s) => s.id === 'skill-sql').guides.filter((id) => GUIDES.some((g) => g.id === id)).length);
  const page = pages.achievementsPage(GUIDES, progress, activity);
  assert.match(page, /Skill badges/);
  assert.match(page, /class="skill-glyph" aria-hidden="true">Py</);
  assert.match(page, /Coming soon/);
  assert.match(page, /Electron/);
});
