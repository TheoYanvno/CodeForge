// CodeForge: step-by-step guides that teach how each of my projects is built.
// It's a learning guide, not a code playground: each guide opens with a lesson plan (goals and
// sessions with planned minutes), and each step explains one idea with diagrams, shows exactly
// what code the step adds (as a diff, or the full files), lets you see the finished step run,
// asks a short quiz, and times the step against its plan. You write the code in your own editor
// (VS Code, for example): copy the code or download the step as a page. Guides live in src/lessons/.
import { assemble, startOf, renderMarkdown, lineDiff, changedLines, Progress, lessonPlan, pace, clock, gradeQuiz } from './tutor-core.js';
import { buildDocument } from './preview.js';
import { GUIDES } from './lessons/index.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PANES = ['html', 'css', 'js'];
const PANE_NAMES = { html: 'HTML', css: 'CSS', js: 'JavaScript' };
const FILE_NAMES = { html: 'index.html', css: 'style.css', js: 'script.js' };

const progress = new Progress();
let guide = null;           // the open guide (assembled)
let at = 0;                 // the step on screen
let view = 'changes';       // which code view is showing: 'changes', 'html', 'css' or 'js'
let timer = null;           // the pace timer's interval
let lastTick = 0;           // when the timer last counted
let unsaved = 0;            // seconds counted but not saved yet

export function initTutor() {
  $('tutor').addEventListener('click', onClick);
  $('home').addEventListener('click', (e) => { e.preventDefault(); showList(); });
  const id = new URLSearchParams(location.search).get('guide');
  if (id && GUIDES.some((g) => g.id === id && g.available)) openGuide(id); else showList();
}

function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}

// ---- the list of guides ----

function showList() {
  stopTimer();
  guide = null;
  history.replaceState(null, '', location.pathname);
  const cards = GUIDES.map((g) => {
    const p = progress.get(g.id);
    const pct = g.steps ? Math.round((100 * p.done.length) / g.steps) : 0;
    const status = !g.available ? '<span class="soon">Coming soon</span>'
      : p.done.length ? `<span class="pct">${pct}% done</span>` : `<span class="pct">${g.steps} steps</span>`;
    return `<li class="guide-card${g.available ? '' : ' locked'}">
      <button ${g.available ? `data-open="${g.id}"` : 'disabled'}>
        <span class="g-emoji" aria-hidden="true">${g.emoji}</span>
        <span class="g-body"><strong>${esc(g.title)}</strong><span class="g-meta">${esc(g.level)} · ${esc(g.time)}</span>
        <span class="g-sum">${esc(g.summary)}</span></span>
        ${status}
      </button>${g.available && p.done.length ? `<span class="bar"><span data-fill="${pct}"></span></span>` : ''}
    </li>`;
  }).join('');
  $('tutor').innerHTML = `
    <header class="t-head"><h2>Learn to build my projects</h2>
      <p class="muted">Each guide rebuilds one of my portfolio projects from a blank page, one small step at a time.
      Every step explains the idea, shows exactly what code it adds and why, and lets you see the result run.
      Follow along in your own editor (VS Code works well): copy each step's code or download it as a page.
      A short quiz after each step checks that you understood the idea, not just the code.</p></header>
    <ol class="guides">${cards}</ol>`;
  fillBars();
  window.scrollTo(0, 0);
}

const fillBars = () => { for (const el of document.querySelectorAll('[data-fill]')) el.style.width = `${el.dataset.fill}%`; };

// ---- one guide ----

async function openGuide(id) {
  const entry = GUIDES.find((g) => g.id === id);
  $('tutor').innerHTML = '<p class="muted t-loading">Loading the guide…</p>';
  const data = (await entry.load()).default;
  guide = { ...entry, ...data, ...assemble(data.start, data.steps) };
  history.replaceState(null, '', `?guide=${id}`);
  const p = progress.get(id);
  at = Math.min(p.step, guide.steps.length);          // steps.length = the finish page
  if (!p.done.length && !Object.keys(p.time).length) return showPlan();   // first visit: the lesson plan
  showStep();
}

// ---- the pace timer: counts time on a step while the tab is visible ----

function startTimer() {
  stopTimer();
  lastTick = Date.now();
  timer = setInterval(() => {
    const now = Date.now();
    if (!document.hidden) unsaved += (now - lastTick) / 1000;
    lastTick = now;
    if (unsaved >= 15) saveTime();
    showPace();
  }, 1000);
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
  saveTime();
}

function saveTime() {
  if (guide && unsaved > 0 && at < guide.steps.length) progress.addTime(guide.id, at, unsaved);
  unsaved = 0;
}

function showPace() {
  const chip = $('tPace');
  if (!chip || !guide || at >= guide.steps.length) return;
  const planned = guide.steps[at].minutes ?? 0;
  const spent = (progress.get(guide.id).time[at] ?? 0) + unsaved;
  const { status } = pace(planned, spent);
  chip.className = `pace ${status}`;
  chip.querySelector('.p-time').textContent = clock(spent);
  const note = { early: 'plenty of time', on: 'on pace', over: 'a little over, keep going', long: 'stuck? reread the diagram and the code changes', none: '' }[status];
  chip.querySelector('.p-note').textContent = note;
  chip.style.setProperty('--fill', `${Math.min(100, Math.round((100 * spent) / Math.max(1, planned * 60)))}%`);
}

document.addEventListener('visibilitychange', () => { lastTick = Date.now(); if (document.hidden) saveTime(); });
window.addEventListener('pagehide', saveTime);

// ---- the lesson plan ----

const mins = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`);

function showPlan() {
  stopTimer();
  const plan = lessonPlan(guide);
  const p = progress.get(guide.id);
  const spentIn = (x) => x.steps.reduce((t, st) => t + (p.time[st.index] ?? 0), 0);
  const quizCount = guide.steps.reduce((t, st) => t + (st.quiz?.length ?? 0), 0);
  const started = p.done.length || Object.keys(p.time).length;
  $('tutor').innerHTML = `
    <header class="t-head"><button class="link" data-act="list">← All guides</button>
      <p class="t-guide">${guide.emoji} ${esc(guide.title)}</p><h2>Lesson plan</h2>
      <p class="muted">${guide.steps.length} steps in ${plan.sessions.length} session${plan.sessions.length > 1 ? 's' : ''} · about ${mins(plan.minutes)} · ${quizCount} quiz questions</p></header>
    <article class="t-body">
      ${guide.goals?.length ? `<h3>By the end you'll be able to</h3><ul>${guide.goals.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}
      ${guide.prereqs?.length ? `<h3>Before you start</h3><ul>${guide.prereqs.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}
      <h3>How to follow along</h3>
      ${guide.steps.every((st) => st.kind === 'read') ? `<p>This guide is read-along: each step explains an idea and shows the code, and you type and run it on your own computer. There's no See it run, because this code runs in your terminal, not in a web page.</p>` : `<p>Make a folder with three empty files: <code>index.html</code>, <code>style.css</code> and <code>script.js</code>, and open it in your editor. In each step, read the explanation, then look at <strong>The code</strong>: <strong>What changes</strong> shows the lines the step adds (green) and removes (struck through), and the file tabs show each whole file. Type the changes yourself; that's how it sticks. If you fall behind, copy a whole file or download the step as one page. <strong>See it run</strong> shows the finished step working.</p>`}
      <h3>Sessions</h3>
      <p>Take one session per sitting. Each one ends at a point where the project works, so it's a good place to stop.</p>
      <ol class="plan">${plan.sessions.map((x, n) => {
        const spent = spentIn(x);
        const pct = Math.min(100, Math.round((100 * spent) / Math.max(1, x.minutes * 60)));
        return `<li class="plan-session">
          <div class="ps-head"><strong>Session ${n + 1}: ${esc(x.title)}</strong><span class="muted">${mins(x.minutes)}${spent ? ` · you: ${clock(spent)}` : ''}</span></div>
          <span class="ps-bar" aria-hidden="true"><span data-fill="${pct}"></span></span>
          <ul class="ps-steps">${x.steps.map((st) => `<li><button class="link" data-go="${st.index}">${st.index + 1}. ${esc(st.title)}</button>
            <span class="muted">${st.minutes ? `${st.minutes} min` : ''}${p.done.includes(st.index) ? ' ✓' : ''}</span></li>`).join('')}</ul>
        </li>`;
      }).join('')}</ol>
      <h3>Pace and progress</h3>
      <p>Each step has a planned time. The ⏱ pace timer at the top of a step counts while the page is open and turns amber when you go over. That's a nudge, not a test. Your place, the steps you've finished, your time and your quiz answers are saved in this browser; <strong>Reset this guide</strong> on the last page starts it over.</p>
    </article>
    <nav class="t-nav"><span></span>
      <button data-act="start" class="primary">${started ? 'Continue' : 'Start step 1'} →</button></nav>`;
  fillBars();
  window.scrollTo(0, 0);
}

// ---- one step ----

/** The panes this step changes, in order. */
const changedPanes = (i) => PANES.filter((p) => (startOf(guide, i)[p] ?? '') !== (guide.steps[i].code[p] ?? ''));

function showStep() {
  stopTimer();
  if (at >= guide.steps.length) return showFinish();
  const step = guide.steps[at];
  const total = guide.steps.length;
  const p = progress.get(guide.id);
  const done = p.done;
  const plan = lessonPlan(guide);
  const sn = plan.sessions.findIndex((x) => at >= x.from && at <= x.to);
  const changes = changedPanes(at);
  view = changes.length ? 'changes' : 'html';
  progress.goTo(guide.id, at);
  $('tutor').innerHTML = `
    <header class="t-head">
      <button class="link" data-act="list">← All guides</button>
      <p class="t-guide">${guide.emoji} ${esc(guide.title)} <button class="link" data-act="plan">📋 Lesson plan</button></p>
      <div class="t-progress" aria-label="Step ${at + 1} of ${total}">
        ${guide.steps.map((s, i) => `<button class="dot${i === at ? ' here' : ''}${done.includes(i) ? ' done' : ''}" data-go="${i}" title="Step ${i + 1}: ${esc(s.title)}" aria-label="Step ${i + 1}: ${esc(s.title)}${done.includes(i) ? ' (done)' : ''}"></button>`).join('')}
      </div>
      <p class="t-count">${plan.sessions.length > 1 ? `Session ${sn + 1} of ${plan.sessions.length}: ${esc(plan.sessions[sn].title)} · ` : ''}Step ${at + 1} of ${total}${step.kind === 'read' ? ' · read-along' : ''}</p>
      <h2>${esc(step.title)}</h2>
      ${step.minutes ? `<p id="tPace" class="pace" role="timer" aria-live="off"><span class="p-fill" aria-hidden="true"></span>⏱ <span class="p-time">0:00</span> of about ${step.minutes} min · <span class="p-note"></span>
        <button class="p-reset" data-act="retime" title="Start this step's timer again from 0:00">↺ Reset timer</button></p>` : ''}
    </header>
    <article class="t-body">${renderMarkdown(step.body)}</article>
    ${step.checks?.length ? `
    <section class="t-task">
      <h3>In this step you write</h3>
      <ul class="checks">${step.checks.map((c) => `<li><span class="mark" aria-hidden="true">${done.includes(at) ? '✓' : '•'}</span> ${esc(c.label)} <span class="pane-tag ${c.pane}">${PANE_NAMES[c.pane]}</span></li>`).join('')}</ul>
    </section>` : ''}
    ${step.kind === 'read' ? '' : `
    <section class="t-code" aria-label="The code for this step">
      <div class="code-head"><h3>The code</h3>
        <div class="code-tabs" role="tablist">
          ${changes.length ? `<button role="tab" data-view="changes">What changes</button>` : ''}
          ${PANES.map((pn) => `<button role="tab" data-view="${pn}">${FILE_NAMES[pn]}</button>`).join('')}
        </div></div>
      <div id="tCode" class="code-view"></div>
      <div class="t-actions">
        <button data-act="copy">Copy this file</button>
        <button data-act="download">Download this step as one page</button>
        <button data-act="run" aria-expanded="false">▶ See it run</button>
      </div>
      <div id="tRun" class="t-run" hidden></div>
    </section>`}
    ${step.quiz?.length ? `
    <section class="t-quiz">
      <h3>Quick quiz</h3>
      ${step.quiz.map((q, k) => quizQuestion(q, k, p.quiz[`${at}.${k}`])).join('')}
    </section>` : ''}
    <nav class="t-nav">
      <button data-act="prev" ${at === 0 ? 'disabled' : ''}>← Back</button>
      <button data-act="next" class="primary">${done.includes(at) ? '' : 'Done, '}${at === total - 1 ? 'finish' : 'next step'} →</button>
    </nav>`;
  if (step.kind !== 'read') showCode();
  window.scrollTo(0, 0);
  showPace();
  startTimer();
}

/** Fills the code box with the current view: the step's changes as a diff, or one whole file. */
function showCode() {
  const box = $('tCode');
  if (!box) return;
  document.querySelectorAll('.code-tabs [data-view]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.view === view)));
  const before = startOf(guide, at);
  const after = guide.steps[at].code;
  if (view === 'changes') {
    box.innerHTML = changedPanes(at).map((pn) => {
      const diff = changedLines(lineDiff(before[pn], after[pn]));
      return `<h4>${FILE_NAMES[pn]}</h4><pre class="diff">${diff.map((d) =>
        d.type === 'gap' ? '<span class="gap">⋯</span>' : `<span class="${d.type}">${d.type === 'add' ? '+' : d.type === 'del' ? '−' : ' '} ${esc(d.text)}</span>`).join('')}</pre>`;
    }).join('');
    $('tutor').querySelector('[data-act="copy"]').hidden = true;
    return;
  }
  $('tutor').querySelector('[data-act="copy"]').hidden = false;
  const text = after[view] ?? '';
  box.innerHTML = text.trim() ? `<pre class="full"><code>${esc(text)}</code></pre>` : `<p class="muted">${FILE_NAMES[view]} is still empty at this step.</p>`;
}

/** The finished step as one page, for the run preview and the download. */
const stepPage = () => buildDocument(guide.steps[at].code);

function toggleRun(button) {
  const box = $('tRun');
  const opening = box.hidden;
  box.hidden = !opening;
  button.setAttribute('aria-expanded', String(opening));
  button.textContent = opening ? '■ Hide the result' : '▶ See it run';
  if (!opening) { box.innerHTML = ''; return; }
  box.innerHTML = '<p class="muted small">The finished code for this step, running. It\'s read-only: build your own copy in your editor.</p><iframe title="The finished step" sandbox="allow-scripts allow-forms allow-modals"></iframe>';
  box.querySelector('iframe').srcdoc = stepPage();
}

function download() {
  const name = `${guide.id}-step-${at + 1}.html`;
  const url = URL.createObjectURL(new Blob([stepPage()], { type: 'text/html' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`Downloaded ${name}`);
}

async function copy() {
  const text = guide.steps[at].code[view] ?? '';
  try { await navigator.clipboard.writeText(text); toast(`Copied ${FILE_NAMES[view]}`); }
  catch { toast('Copy was blocked: select the code and copy it instead'); }
}

function quizQuestion(q, k, picked) {
  const answered = picked !== undefined;
  return `<div class="q${answered ? ' answered' : ''}" data-q="${k}">
    <p class="q-text">${renderInline(q.q)}</p>
    <div class="q-options" role="group" aria-label="Answers">${q.options.map((o, n) => {
      const cls = answered ? (n === q.answer ? ' right' : n === picked ? ' wrong' : '') : '';
      return `<button class="q-opt${cls}" data-quiz="${k}" data-opt="${n}" ${answered ? 'disabled' : ''}>${renderInline(o)}</button>`;
    }).join('')}</div>
    ${answered ? `<p class="q-why ${picked === q.answer ? 'pass' : 'fail'}">${picked === q.answer ? '✓ Right.' : '✗ Not quite.'} ${q.why ? renderInline(q.why) : ''}</p>` : ''}
  </div>`;
}

/** Markdown for one line (quiz text): bold, code and links, without a wrapping paragraph. */
const renderInline = (text) => renderMarkdown(text).replace(/^<p>|<\/p>$/g, '');

function answerQuiz(k, n) {
  const key = `${at}.${k}`;
  const p = progress.answer(guide.id, key, n);
  const q = guide.steps[at].quiz[k];
  document.querySelector(`.q[data-q="${k}"]`).outerHTML = quizQuestion(q, k, p.quiz[key]);
}

function showFinish() {
  stopTimer();
  progress.goTo(guide.id, guide.steps.length);
  const p = progress.get(guide.id);
  const done = p.done.length;
  const plan = lessonPlan(guide);
  const quiz = gradeQuiz(guide.steps, p.quiz);
  const spent = progress.totalTime(guide.id);
  $('tutor').innerHTML = `
    <header class="t-head"><button class="link" data-act="list">← All guides</button>
      <p class="t-guide">${guide.emoji} ${esc(guide.title)}</p><h2>You built it! 🎉</h2></header>
    <dl class="t-stats">
      <div><dt>Steps finished</dt><dd>${done} of ${guide.steps.length}</dd></div>
      <div><dt>Quiz</dt><dd>${quiz.answered ? `${quiz.right} of ${quiz.answered} right (${quiz.percent}%)` : 'not taken'}${quiz.answered < quiz.total ? ` · ${quiz.total - quiz.answered} unanswered` : ''}</dd></div>
      <div><dt>Your time</dt><dd>${clock(spent)} <span class="muted">(plan: about ${mins(plan.minutes)})</span></dd></div>
    </dl>
    <p><button class="link" data-act="plan">📋 See your time for each session</button></p>
    <article class="t-body">${renderMarkdown(guide.finish ?? '')}</article>
    <nav class="t-nav"><button data-act="prev">← Last step</button>
      <button data-act="reset" class="link">Reset this guide</button>
      <button data-act="list" class="primary">More guides</button></nav>`;
  window.scrollTo(0, 0);
}

function onClick(e) {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.open) return openGuide(b.dataset.open);
  if (b.dataset.quiz) return answerQuiz(Number(b.dataset.quiz), Number(b.dataset.opt));
  if (b.dataset.view) { view = b.dataset.view; return showCode(); }
  if (b.dataset.go) { saveTime(); at = Number(b.dataset.go); return showStep(); }
  switch (b.dataset.act) {
    case 'list': return showList();
    case 'plan': return showPlan();
    case 'start': at = Math.min(at, guide.steps.length); return showStep();
    case 'copy': return copy();
    case 'download': return download();
    case 'run': return toggleRun(b);
    case 'prev': saveTime(); at = Math.max(0, at - 1); return showStep();
    case 'next':
      saveTime();
      progress.complete(guide.id, at);
      at += 1;
      return showStep();
    case 'retime':
      unsaved = 0;
      progress.resetTime(guide.id, at);
      lastTick = Date.now();
      showPace();
      return toast('Timer reset to 0:00');
    case 'reset':
      if (!confirm(`Reset your progress in the ${guide.title} guide? Your place, finished steps, time and quiz answers are cleared.`)) return;
      unsaved = 0;
      progress.reset(guide.id);
      at = 0;
      return showPlan();
    default:
  }
}
