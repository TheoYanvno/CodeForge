// CodeForge's dashboard pages: Home, Lessons, Projects, Coding Challenges, Achievements, Progress
// and Settings. These are plain functions that turn the guide list and your saved progress into
// HTML, with no DOM code, so they can be tested in Node. tutor.js puts them on the page.
import { gradeQuiz } from './tutor-core.js';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The sidebar pages, in order. `icon` is a small inline SVG path drawn at 24 x 24. */
export const PAGES = [
  { id: 'home', label: 'Home', icon: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' },
  { id: 'lessons', label: 'Lessons', icon: 'M3 5.5C5.5 4 8.5 4 11 5.5V20c-2.5-1.5-5.5-1.5-8 0zM13 5.5c2.5-1.5 5.5-1.5 8 0V20c-2.5-1.5-5.5-1.5-8 0z' },
  { id: 'challenges', label: 'Coding Challenges', icon: 'M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16', stroke: true },
  { id: 'projects', label: 'Projects', icon: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { id: 'achievements', label: 'Achievements', icon: 'M7 4h10v4a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M10 14h4l1 4H9zM8 20h8' },
  { id: 'progress', label: 'Progress', icon: 'M5 20V12M10 20V6M15 20v-9M20 20V4', stroke: true },
  { id: 'account', label: 'Account', icon: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM3.5 21a8.5 8.5 0 0 1 17 0z' },
  { id: 'settings', label: 'Settings', icon: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM12 2l2 3 3.5-.5.5 3.5 3 2-2 3 2 3-3 2-.5 3.5L14 21l-2 3-2-3-3.5.5L6 18l-3-2 2-3-2-3 3-2 .5-3.5L10 5z' },
];

export const icon = (page) => `<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${page.icon}" ${page.stroke ? 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' : 'fill="currentColor"'}/></svg>`;

/** The CodeForge mark: a C-shaped bracket in a blue-to-purple gradient around </>. */
export const LOGO = `<svg class="logo-mark" viewBox="0 0 100 100" aria-hidden="true">
  <defs><linearGradient id="cfGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>
  <path d="M78 22 62 12H36L14 26v48l22 14h26l16-10" fill="none" stroke="url(#cfGrad)" stroke-width="14" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M40 38 30 50l10 12M60 38l10 12-10 12M54 34l-8 32" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/** The basics guides: each teaches what the project guides after it need. */
export const BASICS = new Set(['setup', 'github', 'htmlcss', 'jsbasics', 'electron', 'python', 'sql', 'feedback', 'webapi', 'reactbasics']);

/** A lesson teaches one skill (a basics guide or a short skill lesson); everything else is a project. */
export const isLesson = (g) => BASICS.has(g.id) || g.kind === 'skill';
export const isProject = (g) => !isLesson(g);

/** The lessons a project needs, each with whether you've finished it. */
export function needsOf(guide, guides, progress) {
  return (guide.needs ?? []).map((id) => guides.find((g) => g.id === id)).filter(Boolean)
    .map((g) => ({ guide: g, finished: guideStats(g, progress).finished }));
}

/** Small ✓/○ chips for a project's lessons. */
export function needChips(guide, guides, progress) {
  const list = needsOf(guide, guides, progress);
  if (!list.length) return '';
  const done = list.filter((n) => n.finished).length;
  return `<span class="needs" aria-label="Lessons this project uses: ${done} of ${list.length} done">${list.map((n) =>
    `<span class="need${n.finished ? ' ok' : ''}">${n.finished ? '✓' : '○'} ${esc(n.guide.title)}</span>`).join('')}</span>`;
}

/** The guide list split into "the lessons before each project, then the project". */
export function courseSections(guides) {
  const sections = [];
  let lessons = [];
  for (const g of guides) {
    if (isLesson(g)) { lessons.push(g); continue; }
    sections.push({ project: g, lessons });
    lessons = [];
  }
  if (lessons.length) sections.push({ project: null, lessons });
  return sections;
}

/** The tracks on the Home page. A track without a guide is shown as coming soon. */
export const TRACKS = [
  { id: 'setup', label: 'Setup', sub: 'Get your tools', glyph: '⚙', tone: 'slate' },
  { id: 'htmlcss', label: 'HTML & CSS', sub: 'Build the web', glyph: '</>', tone: 'orange' },
  { id: 'jsbasics', label: 'JavaScript', sub: 'Bring pages to life', glyph: 'JS', tone: 'yellow' },
  { id: 'python', label: 'Python', sub: 'Automate & analyze', glyph: 'Py', tone: 'blue' },
  { id: 'sql', label: 'SQL', sub: 'Ask your data', glyph: 'SQL', tone: 'teal' },
  { id: 'reactbasics', label: 'React', sub: 'Build app screens', glyph: '⚛', tone: 'cyan' },
  { id: null, label: 'C#', sub: 'Coming soon', glyph: 'C#', tone: 'purple' },
];

/** Steps done, total steps and percent for one guide. */
export function guideStats(guide, progress) {
  const p = progress.get(guide.id);
  const done = Math.min(p.done.length, guide.steps);
  return { done, total: guide.steps, percent: guide.steps ? Math.round((100 * done) / guide.steps) : 0, finished: done >= guide.steps, time: progress.totalTime(guide.id), answered: Object.keys(p.quiz).length };
}

/** Totals across a list of guides. */
export function totals(guides, progress) {
  const all = guides.filter((g) => g.available).map((g) => guideStats(g, progress));
  const done = all.reduce((t, s) => t + s.done, 0);
  const total = all.reduce((t, s) => t + s.total, 0);
  return {
    done, total, percent: total ? Math.round((100 * done) / total) : 0,
    finished: all.filter((s) => s.finished).length, guides: all.length,
    time: all.reduce((t, s) => t + s.time, 0), answered: all.reduce((t, s) => t + s.answered, 0),
  };
}

/** The first guide in course order that isn't finished: where Start learning takes you. */
export const nextGuide = (guides, progress, filter = () => true) =>
  guides.find((g) => g.available && filter(g) && !guideStats(g, progress).finished) ?? null;

/**
 * Skill badges: one per language or tool, earned by finishing the guides that teach it. Only guides
 * that exist count, so a badge grows as lessons are added; one with no guides yet shows as coming soon.
 */
export const SKILLS = [
  { id: 'skill-html', glyph: '</>', tone: 'orange', title: 'HTML', guides: ['htmlcss', 'canvas', 'snake'] },
  { id: 'skill-css', glyph: '{ }', tone: 'blue', title: 'CSS', guides: ['htmlcss', 'monthgrid', 'calendar'] },
  { id: 'skill-js', glyph: 'JS', tone: 'yellow', title: 'JavaScript', guides: ['jsbasics', 'gameloop', 'input', 'filtering', 'fetchjson', 'quote'] },
  { id: 'skill-react', glyph: '⚛', tone: 'cyan', title: 'React', guides: ['reactbasics'] },
  { id: 'skill-python', glyph: 'Py', tone: 'blue', title: 'Python', guides: ['python'] },
  { id: 'skill-sql', glyph: 'SQL', tone: 'teal', title: 'SQL', guides: ['sql', 'linktables', 'marvel'] },
  { id: 'skill-csharp', glyph: 'C#', tone: 'purple', title: 'C#', guides: ['csharpbasics'] },
  { id: 'skill-electron', glyph: '⚡', tone: 'slate', title: 'Electron', guides: ['electron', 'appstate', 'safesave', 'sticky'] },
];

/** Every skill badge with the guides it needs (by title), how many are done, and whether it's earned. */
export function skillBadges(guides, progress) {
  return SKILLS.map((s) => {
    const needed = s.guides.map((id) => guides.find((g) => g.id === id && g.available)).filter(Boolean);
    const done = needed.filter((g) => guideStats(g, progress).finished).length;
    const soon = needed.length === 0;
    return { ...s, needed: needed.map((g) => g.title), value: done, target: needed.length, soon, earned: !soon && done === needed.length };
  });
}

/** Every achievement with how far along you are. */
export function achievements(guides, progress, activity) {
  const t = totals(guides, progress);
  const finished = (id) => { const g = guides.find((x) => x.id === id); return g ? guideStats(g, progress).finished : false; };
  const basics = guides.filter((g) => BASICS.has(g.id) && g.available);
  const projects = guides.filter((g) => isProject(g) && g.available);
  const list = [
    { id: 'first-step', icon: '🚀', title: 'First step', description: 'Finish your first step.', value: t.done, target: 1 },
    { id: 'setup', icon: '🧰', title: 'Ready to code', description: 'Finish Get set up.', value: finished('setup') ? 1 : 0, target: 1 },
    { id: 'web', icon: '🎨', title: 'Web builder', description: 'Finish HTML & CSS basics and JavaScript basics.', value: ['htmlcss', 'jsbasics'].filter(finished).length, target: 2 },
    { id: 'quiz25', icon: '🧠', title: 'Quiz whiz', description: 'Answer 25 quiz questions.', value: t.answered, target: 25 },
    { id: 'project', icon: '🛠️', title: 'First project', description: 'Finish a project guide.', value: projects.filter((g) => finished(g.id)).length, target: 1 },
    { id: 'streak3', icon: '🔥', title: 'On a roll', description: 'Study 3 days in a row.', value: activity.longest(), target: 3 },
    { id: 'streak7', icon: '⚡', title: 'Week streak', description: 'Study 7 days in a row.', value: activity.longest(), target: 7 },
    { id: 'basics', icon: '📚', title: 'All the basics', description: `Finish all ${basics.length} basics guides.`, value: basics.filter((g) => finished(g.id)).length, target: basics.length },
    { id: 'quiz100', icon: '🏅', title: 'Quiz master', description: 'Answer 100 quiz questions.', value: t.answered, target: 100 },
    { id: 'half', icon: '🌗', title: 'Halfway there', description: 'Finish half of all the steps.', value: t.done, target: Math.ceil(t.total / 2) },
    { id: 'all', icon: '🏆', title: 'CodeForge graduate', description: 'Finish every guide.', value: t.finished, target: t.guides },
  ];
  return list.map((a) => ({ ...a, value: Math.min(a.value, a.target), earned: a.value >= a.target }));
}

/** The challenges at the end of a guide: the numbered list under "### Challenges" on its finish page. */
export function extractChallenges(finish = '') {
  const lines = finish.split('\n');
  const start = lines.findIndex((l) => /^###\s+Challenges/i.test(l));
  if (start < 0) return [];
  const out = [];
  for (const line of lines.slice(start + 1)) {
    if (/^###\s/.test(line)) break;
    const m = line.match(/^\s*\d+\.\s+(.+)$/);
    if (m) out.push(m[1].trim());
  }
  return out;
}

const mins = (s) => { const m = Math.round(s / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`; };

// ---- the sidebar ----

export function sidebarNav(active) {
  return PAGES.map((p) => `<button class="nav-item${p.id === active ? ' active' : ''}" data-page="${p.id}"${p.id === active ? ' aria-current="page"' : ''}>${icon(p)}<span>${esc(p.label)}</span></button>`).join('');
}

export function streakCard(activity) {
  const n = activity.streak();
  return `<span class="streak-rocket" aria-hidden="true">🚀</span>
    <strong>${n ? 'Keep going!' : 'Start a streak'}</strong>
    <span>${n ? `You're on a ${n} day streak!` : 'Study today to start one.'}</span>`;
}

/** The small account box in the sidebar: who is signed in, or a Sign in button for guests. */
export function accountCard(user) {
  return user
    ? `<span class="acct-avatar" aria-hidden="true">${esc(user[0].toUpperCase())}</span>
      <span class="acct-name"><strong>${esc(user)}</strong><span class="muted small">Signed in</span></span>
      <button class="link small" data-act="signout">Sign out</button>`
    : `<span class="acct-avatar guest" aria-hidden="true">?</span>
      <span class="acct-name"><strong>Guest</strong><span class="muted small">Progress saved on this device</span></span>
      <button class="link small" data-page="account">Sign in</button>`;
}

// ---- guide cards (Lessons and Projects) ----

export function guideCards(guides, progress, all = guides) {
  return guides.map((g) => {
    const s = guideStats(g, progress);
    const status = !g.available ? '<span class="soon">Coming soon</span>'
      : s.done ? `<span class="pct">${s.finished ? '✓ Done' : `${s.percent}% done`}</span>` : `<span class="pct">${g.steps} steps</span>`;
    return `<li class="guide-card${g.available ? '' : ' locked'}">
      <button ${g.available ? `data-open="${g.id}"` : 'disabled'}>
        <span class="g-emoji" aria-hidden="true">${g.emoji}</span>
        <span class="g-body"><strong>${esc(g.title)}</strong><span class="g-meta">${esc(g.level)} · ${esc(g.time)}</span>
        <span class="g-sum">${esc(g.summary)}</span>${g.needs ? needChips(g, all, progress) : ''}</span>
        ${status}
      </button>${g.available && s.done ? `<span class="bar"><span data-fill="${s.percent}"></span></span>` : ''}
    </li>`;
  }).join('');
}

// ---- Home ----

const HERO_ART = `<svg class="hero-art" viewBox="240 0 360 260" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1440"/><stop offset=".65" stop-color="#2b2a8a"/><stop offset="1" stop-color="#4c3bb5"/></linearGradient>
    <linearGradient id="far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6ee8"/><stop offset="1" stop-color="#2d2f8f"/></linearGradient>
    <linearGradient id="near" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#202a78"/><stop offset="1" stop-color="#0c1240"/></linearGradient>
  </defs>
  <rect x="240" width="360" height="260" fill="url(#sky)"/>
  <g fill="#fff" opacity=".8">
    <circle cx="300" cy="30" r="1.2"/><circle cx="350" cy="55" r="1"/><circle cx="410" cy="22" r="1.4"/><circle cx="460" cy="70" r="1"/>
    <circle cx="520" cy="35" r="1.2"/><circle cx="570" cy="60" r="1"/><circle cx="380" cy="90" r=".9"/><circle cx="545" cy="100" r="1.1"/>
    <circle cx="330" cy="110" r=".8"/><circle cx="490" cy="20" r=".9"/>
  </g>
  <path d="M250 260 330 120l40 50 60-90 70 100 40-40 60 120z" fill="url(#far)" opacity=".8"/>
  <path d="M290 260 380 160l50 40 70-70 100 130z" fill="url(#near)"/>
  <g fill="#0a0f33">
    <path d="M330 260l14-40 14 40zM352 260l10-30 10 30zM540 260l12-36 12 36zM565 260l9-28 9 28z"/>
    <path d="M455 200h90l30 60H440z"/>
  </g>
  <g fill="#050821">
    <circle cx="500" cy="152" r="5"/><path d="M495 158h10l2 22h-14zM494 180l-3 20h5l3-14 3 14h5l-3-20z"/><path d="M505 160h7l2 16h-6z"/>
  </g>
</svg>`;

export function homePage(guides, progress, activity) {
  const next = nextGuide(guides, progress);
  const basics = guides.filter((g) => BASICS.has(g.id) && g.available);
  const b = totals(basics, progress);
  const C = 2 * Math.PI * 48;
  const project = nextGuide(guides, progress, isProject);
  const tracks = TRACKS.map((t) => {
    const g = t.id && guides.find((x) => x.id === t.id);
    const s = g ? guideStats(g, progress) : null;
    return `<button class="track tone-${t.tone}" ${g ? `data-open="${g.id}"` : 'disabled'}>
      <span class="track-glyph" aria-hidden="true">${esc(t.glyph)}</span>
      <strong>${esc(t.label)}</strong>
      <span class="track-sub">${esc(s?.finished ? 'Done ✓' : t.sub)}</span>
      ${g ? '<span class="track-go" aria-hidden="true">›</span>' : ''}
    </button>`;
  }).join('');
  return `
    <section class="hero">
      ${HERO_ART}
      <div class="hero-text">
        <h2>Welcome to CodeForge!</h2>
        <p>Your journey from beginner to professional developer starts here.</p>
        ${next ? `<button class="primary glow" data-open="${next.id}">${b.done || progress.get(next.id).done.length ? 'Continue learning' : 'Start learning'} →</button>
        <p class="hero-next">Next: ${esc(next.title)}</p>` : '<p class="hero-next">You finished every guide. 🎉</p>'}
      </div>
    </section>
    <h3 class="section-title">Start your journey</h3>
    <div class="tracks">${tracks}</div>
    <div class="home-row">
      <section class="card progress-card">
        <h3 class="card-title">📊 Your progress</h3>
        <div class="progress-body">
          <svg class="ring" viewBox="0 0 120 120" role="img" aria-label="${b.percent}% of the basics done">
            <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22c55e"/><stop offset="1" stop-color="#38bdf8"/></linearGradient></defs>
            <circle cx="60" cy="60" r="48" fill="none" stroke="#1e2752" stroke-width="12"/>
            <circle cx="60" cy="60" r="48" fill="none" stroke="url(#ringGrad)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${((b.percent / 100) * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 60 60)"/>
            <text x="60" y="67" text-anchor="middle" class="ring-text">${b.percent}%</text>
          </svg>
          <ul class="checklist">${basics.slice(0, 5).map((g) => {
            const s = guideStats(g, progress);
            return `<li class="${s.finished ? 'done' : s.done ? 'started' : ''}"><span class="dot" aria-hidden="true"></span>${esc(g.title)} <span class="state">${s.finished ? '✓' : s.done ? `${s.percent}%` : '○'}</span></li>`;
          }).join('')}</ul>
        </div>
        <button class="link" data-page="progress">See all progress →</button>
      </section>
      <section class="card featured-card">
        <h3 class="card-title">⭐ Featured project</h3>
        ${project ? `<div class="featured-body">
          <span class="featured-art" aria-hidden="true">${esc(project.emoji)}</span>
          <div><strong>${esc(project.title)}</strong><p>${esc(project.summary)}</p>
          <button class="primary small" data-open="${project.id}">View project →</button></div>
        </div>` : '<p class="muted">You finished every project guide.</p>'}
      </section>
    </div>`;
}

// ---- Lessons and Projects ----

/** The sections projects on the roadmap are shown in, in order. */
export const COMING_GROUPS = [
  { id: 'react', title: '⚛️ React projects', blurb: 'React apps built on the earlier projects. Each gets a guide here once it is published.' },
  { id: 'csharp', title: '🎮 C# games', blurb: 'Games written in C#. Each gets a guide here once the game is built.' },
  { id: 'security', title: '🛡️ Security projects', blurb: 'Cybersecurity tools on my roadmap. Each gets a guide here once the project is built.' },
];

/** The projects on the roadmap, shown as coming soon and grouped into sections. */
export function comingSoon(list) {
  if (!list?.length) return '';
  return COMING_GROUPS.map((group) => {
    const items = list.filter((c) => (c.group ?? 'security') === group.id);
    if (!items.length) return '';
    return `<section class="coming">
    <h3 class="section-title">${esc(group.title)} <span class="pill">Coming soon</span></h3>
    <p class="muted small">${esc(group.blurb)}</p>
    <ul class="coming-grid">${items.map((c) => `<li class="coming-card">
      <span class="g-emoji" aria-hidden="true">${c.emoji}</span>
      <span class="g-body"><strong>${esc(c.title)}</strong><span class="g-meta">${esc(c.level)} · ${esc(c.status ?? 'Coming soon')}</span>
      <span class="g-sum">${esc(c.summary)}</span></span>
    </li>`).join('')}</ul>
  </section>`;
  }).join('');
}

export function lessonsPage(guides, progress, coming = []) {
  const lessons = guides.filter(isLesson);
  const sections = courseSections(guides).map(({ project, lessons: list }) => {
    if (!project) return list.length ? `<section class="course-part"><h3 class="section-title">More lessons</h3><ol class="guides">${guideCards(list, progress, guides)}</ol></section>` : '';
    const need = needsOf(project, guides, progress);
    const ready = need.every((n) => n.finished);
    return `<section class="course-part">
      ${list.length ? `<h3 class="section-title">Lessons before ${esc(project.title)}</h3><ol class="guides">${guideCards(list, progress, guides)}</ol>` : ''}
      <div class="project-gate${ready ? ' ready' : ''}">
        <p class="gate-title">🛠️ Project: <strong>${esc(project.title)}</strong> ${ready ? '<span class="pill ok">Ready to build</span>' : `<span class="pill">${need.filter((n) => n.finished).length} of ${need.length} lessons done</span>`}</p>
        <p class="muted small">This project combines ${need.length ? need.map((n) => esc(n.guide.title)).join(', ') : 'the lessons above'}.</p>
        <button class="small${ready ? ' primary' : ''}" data-open="${project.id}">Open the project →</button>
      </div>
    </section>`;
  }).join('');
  return `<header class="page-head"><h2>Lessons</h2>
      <p class="muted">Each lesson teaches one skill with its own small, working example: what it is, how it works and why it's done that way. Each project then combines the lessons before it, so by the time you build it, every part is something you've already learned.</p></header>
    ${sections}
    <p class="muted small">${lessons.length} lessons and ${guides.length - lessons.length} projects.</p>
    ${comingSoon(coming)}`;
}

export function projectsPage(guides, progress, coming = []) {
  const projects = guides.filter(isProject);
  return `<header class="page-head"><h2>Projects</h2>
      <p class="muted">Rebuild my portfolio projects from a blank page, one step at a time: games, tools, a blog, databases and a hospital system.</p></header>
    <ol class="guides">${guideCards(projects, progress, guides)}</ol>
    ${comingSoon(coming)}`;
}

// ---- Coding Challenges ----

export function challengesPage(loaded, progress) {
  const sections = loaded.map(({ guide, data }) => {
    const list = extractChallenges(data.finish);
    if (!list.length) return '';
    const s = guideStats(guide, progress);
    return `<section class="card challenge-group">
      <h3 class="card-title">${esc(guide.emoji)} ${esc(guide.title)} ${s.finished ? '<span class="pill ok">Guide done</span>' : '<span class="pill">Finish the guide first</span>'}</h3>
      <ol class="challenges">${list.map((c) => `<li>${esc(c.replace(/\*\*|`/g, ''))}</li>`).join('')}</ol>
      <button class="link" data-open="${guide.id}">Open the guide →</button>
    </section>`;
  }).join('');
  return `<header class="page-head"><h2>Coding challenges</h2>
      <p class="muted">Extra exercises from the end of each guide. They have no answer key on purpose: build them on your own copy of the project, then compare notes with the guide.</p></header>
    <div class="stack">${sections}</div>`;
}

// ---- Achievements ----

export function achievementsPage(guides, progress, activity) {
  const list = achievements(guides, progress, activity);
  const earned = list.filter((a) => a.earned).length;
  const skills = skillBadges(guides, progress);
  return `<header class="page-head"><h2>Achievements</h2>
      <p class="muted">${earned} of ${list.length} earned. Locked ones show how far along you are.</p></header>
    <h3 class="section-title">Skill badges</h3>
    <p class="muted small">One for each language and tool. Earn it by finishing every guide that teaches it.</p>
    <ul class="badges skills">${skills.map((b) => `<li class="badge skill-badge${b.earned ? ' earned' : ''}${b.soon ? ' soon' : ''}" data-tone="${b.tone}">
      <span class="skill-glyph" aria-hidden="true">${esc(b.glyph)}</span>
      <strong>${esc(b.title)}</strong>
      <span class="muted small">${b.soon ? 'Lessons coming soon.' : `Finish ${esc(b.needed.join(', '))}.`}</span>
      ${b.soon ? '<span class="pill">Coming soon</span>' : b.earned ? '<span class="pill ok">Earned</span>' : `<span class="meter" role="img" aria-label="${b.value} of ${b.target}"><span data-fill="${Math.round((100 * b.value) / b.target)}"></span></span><span class="small muted">${b.value} / ${b.target} ${b.target === 1 ? 'guide' : 'guides'}</span>`}
    </li>`).join('')}</ul>
    <h3 class="section-title">Milestones</h3>
    <ul class="badges">${list.map((a) => `<li class="badge${a.earned ? ' earned' : ''}">
      <span class="badge-icon" aria-hidden="true">${a.icon}</span>
      <strong>${esc(a.title)}</strong>
      <span class="muted small">${esc(a.description)}</span>
      ${a.earned ? '<span class="pill ok">Earned</span>' : `<span class="meter" role="img" aria-label="${a.value} of ${a.target}"><span data-fill="${Math.round((100 * a.value) / a.target)}"></span></span><span class="small muted">${a.value} / ${a.target}</span>`}
    </li>`).join('')}</ul>`;
}

// ---- Progress ----

export function progressPage(loaded, progress, activity) {
  const guides = loaded.map((x) => x.guide);
  const t = totals(guides, progress);
  let right = 0;
  let answered = 0;
  for (const { guide, data } of loaded) {
    const q = gradeQuiz(data.steps, progress.get(guide.id).quiz);
    right += q.right;
    answered += q.answered;
  }
  const rows = loaded.map(({ guide }) => {
    const s = guideStats(guide, progress);
    return `<li><button class="link" data-open="${guide.id}">${esc(guide.emoji)} ${esc(guide.title)}</button>
      <span class="bar"><span data-fill="${s.percent}"></span></span>
      <span class="small muted">${s.done}/${s.total} steps${s.time ? ` · ${mins(s.time)}` : ''}</span></li>`;
  }).join('');
  return `<header class="page-head"><h2>Progress</h2></header>
    <dl class="stats-grid">
      <div class="card"><dt>Steps finished</dt><dd>${t.done} <span class="muted">/ ${t.total}</span></dd></div>
      <div class="card"><dt>Guides finished</dt><dd>${t.finished} <span class="muted">/ ${t.guides}</span></dd></div>
      <div class="card"><dt>Quiz</dt><dd>${answered ? `${Math.round((100 * right) / answered)}%` : '—'} <span class="muted">${answered ? `${right} of ${answered} right` : 'none yet'}</span></dd></div>
      <div class="card"><dt>Time learning</dt><dd>${t.time ? mins(t.time) : '—'}</dd></div>
      <div class="card"><dt>Streak</dt><dd>${activity.streak()} <span class="muted">days · best ${activity.longest()}</span></dd></div>
    </dl>
    <h3 class="section-title">By guide</h3>
    <ul class="progress-rows">${rows}</ul>`;
}

// ---- Account ----

const HOW_ACCOUNTS_WORK = `<details class="how"><summary>How accounts work here</summary>
  <p class="muted small">CodeForge has no server, so accounts live in this browser. Your password is never saved: CodeForge
  saves a random salt and a PBKDF2-SHA256 hash of your password (210,000 rounds), and checks a sign-in by hashing what you type
  the same way. Each account keeps its own progress and streak, so people sharing a computer don't mix them up. Clearing this
  browser's site data removes the accounts too, so use <em>Download my progress</em> in Settings to keep a copy.</p></details>`;

/**
 * The account page: the signed-in name with Sign out, or the Sign in and Create account forms.
 * `guestSteps` is how many steps the guest has finished, offered to move into a new account.
 */
export function accountPage(user, guestSteps = 0) {
  if (user) {
    return `<header class="page-head"><h2>Account</h2></header>
      <section class="card settings">
        <h3 class="card-title">Signed in as ${esc(user)}</h3>
        <p class="muted">Your progress, quiz answers, timers and streak are saved to this account on this device.</p>
        <div class="t-actions"><button data-act="signout">Sign out</button> <button data-page="settings">Settings</button></div>
      </section>${HOW_ACCOUNTS_WORK}`;
  }
  const field = (label, name, type, auto, extra = '') => `<label>${label}<input name="${name}" type="${type}" autocomplete="${auto}" required ${extra}></label>`;
  return `<header class="page-head"><h2>Account</h2>
      <p class="muted">You're learning as a guest. Sign in or create an account to keep your progress under your own name.</p></header>
    <div class="acct-forms">
      <form class="card acct-form" data-form="signin" novalidate>
        <h3 class="card-title">Sign in</h3>
        ${field('Name', 'name', 'text', 'username')}
        ${field('Password', 'password', 'password', 'current-password')}
        <p class="form-error" role="alert"></p>
        <button class="primary" type="submit">Sign in</button>
      </form>
      <form class="card acct-form" data-form="create" novalidate>
        <h3 class="card-title">Create an account</h3>
        ${field('Name', 'name', 'text', 'username', 'minlength="3" maxlength="24" pattern="[A-Za-z0-9_-]{3,24}"')}
        ${field('Password (8 or more characters)', 'password', 'password', 'new-password', 'minlength="8"')}
        ${field('Type it again', 'confirm', 'password', 'new-password', 'minlength="8"')}
        ${guestSteps ? `<label class="check"><input type="checkbox" name="bring" checked> Bring my guest progress (${guestSteps} ${guestSteps === 1 ? 'step' : 'steps'} done)</label>` : ''}
        <p class="form-error" role="alert"></p>
        <button class="primary" type="submit">Create account</button>
      </form>
    </div>${HOW_ACCOUNTS_WORK}`;
}

// ---- Settings ----

export function settingsPage(user = null) {
  return `<header class="page-head"><h2>Settings</h2></header>
    <section class="card settings">
      <h3 class="card-title">Account</h3>
      ${user ? `<p class="muted">Signed in as <strong>${esc(user)}</strong> on this device.</p>
      <div class="t-actions"><button data-act="signout">Sign out</button></div>
      <form class="acct-delete" data-form="delete" novalidate>
        <label>To delete this account and all its progress, type its password<input name="password" type="password" autocomplete="current-password" required></label>
        <p class="form-error" role="alert"></p>
        <button class="danger" type="submit">Delete my account</button>
      </form>` : `<p class="muted">You're a guest. <button class="link" data-page="account">Sign in or create an account</button> to keep progress under your own name.</p>`}
    </section>
    <section class="card settings">
      <h3 class="card-title">Your progress</h3>
      <p class="muted">Your place in each guide, finished steps, time, quiz answers and streak are saved in this browser only${user ? `, under ${esc(user)}` : ''}. Nothing is sent anywhere.</p>
      <div class="t-actions">
        <button data-act="export">⬇ Download my progress</button>
        <button data-act="reset-all" class="danger">Reset all progress</button>
      </div>
    </section>
    <section class="card settings">
      <h3 class="card-title">About</h3>
      <p class="muted">CodeForge: step-by-step guides from installing your first editor to rebuilding real projects. Built with vanilla JavaScript, HTML and CSS.</p>
    </section>`;
}
