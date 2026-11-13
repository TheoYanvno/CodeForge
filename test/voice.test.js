import { test } from 'node:test';
import assert from 'node:assert/strict';
import { speakableText, chunks, Voice, VOICE_KEY } from '../src/voice.js';
import { GUIDES } from '../src/lessons/index.js';

const memory = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), m }; };
class FakeSynth { constructor() { this.said = []; this.cancels = 0; } speak(u) { this.said.push(u.text); } cancel() { this.cancels++; this.said = []; } }
class FakeUtterance { constructor(text) { this.text = text; } }

test('speakableText keeps the words and drops code, links and markup', () => {
  const md = '### Why it works\nA **game loop** calls `update()` then [draws](https://x.y).\n\n```js\nlet x = 1;\n```\n\n```svg How the head moves\n<svg></svg>\n```\n- one\n- two\n> Tip: save often\n| Key | Does |\n|---|---|\n| Space | Pause |';
  const t = speakableText(md);
  assert.match(t, /^Why it works/);
  assert.match(t, /A game loop calls update\(\) then draws\./);
  assert.match(t, /Diagram: How the head moves\./);
  assert.match(t, /Tip: save often/);
  assert.match(t, /Space, Pause/);
  assert.doesNotMatch(t, /let x|<svg|https|\*\*|`|---/);
});

test('chunks splits long text into short pieces without losing words', () => {
  const long = `${'word '.repeat(120)}end.`;
  const parts = chunks(`First sentence. Second one!\n${long}`, 100);
  assert.equal(parts[0], 'First sentence.');
  assert.equal(parts[1], 'Second one!');
  assert.ok(parts.every((p) => p.length <= 101));
  assert.equal(parts.join(' ').split(/\s+/).length, 4 + 121);
});

test('read aloud is off until turned on, remembered, and stops when turned off', () => {
  const store = memory();
  const synth = new FakeSynth();
  const v = new Voice(store, synth, FakeUtterance);
  assert.equal(v.on, false);
  v.on = true;
  assert.equal(store.getItem(VOICE_KEY), 'on');
  assert.equal(new Voice(store, synth, FakeUtterance).on, true);
  assert.equal(v.speak('One. Two.'), 2);
  assert.deepEqual(synth.said, ['One.', 'Two.']);
  v.speak('Three.');
  assert.deepEqual(synth.said, ['Three.'], 'a new step replaces what was being read');
  v.on = false;
  assert.deepEqual(synth.said, []);
});

test('read aloud copes with no speech support and no storage', () => {
  const v = new Voice(null, undefined, undefined);
  assert.equal(v.supported, false);
  assert.equal(v.on, false);
  v.on = true;
  assert.equal(v.speak('Hello.'), 0);
});

test('every step of every guide has something to read aloud', async () => {
  for (const g of GUIDES.filter((x) => x.available)) {
    const data = (await g.load()).default;
    for (const s of data.steps) assert.ok(speakableText(s.body).length > 20, `${g.id}: "${s.title}" has nothing to read`);
  }
});
