import test from 'node:test';
import assert from 'node:assert';
import { Accounts, hashPassword, sameHash, keyFor, PROGRESS_KEY, ACTIVITY_KEY, ITERATIONS } from '../src/accounts.js';
import { Progress } from '../src/tutor-core.js';
import { Activity } from '../src/activity.js';

const memory = () => { const m = new Map(); return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };

test('PBKDF2 matches the published test vector, so the hashing is real', async () => {
  // RFC 7914 section 11: PBKDF2-HMAC-SHA256, P="passwd", S="salt", c=1, first 32 bytes
  const salt = Buffer.from('salt').toString('hex');
  assert.strictEqual(await hashPassword('passwd', salt, 1), '55ac046e56e3089fec1691c22544b605f94185216dde0465e68b9d57c20dacbc');
  assert.ok(sameHash('abc', 'abc') && !sameHash('abc', 'abd') && !sameHash('abc', 'abcd'));
});

test('creating an account stores a salted hash, never the password', async () => {
  const s = memory();
  const a = new Accounts(s);
  const r = await a.create('Anthony', 'correct horse battery');
  assert.ok(r.ok);
  const saved = s.getItem('codeforge-accounts');
  assert.ok(!saved.includes('correct horse'), 'the password must not be saved');
  const user = JSON.parse(saved).users.anthony;
  assert.match(user.salt, /^[0-9a-f]{32}$/);
  assert.match(user.hash, /^[0-9a-f]{64}$/);
  assert.strictEqual(user.iterations, ITERATIONS);
  assert.strictEqual(a.current(), 'Anthony', 'creating signs you in');
  const b = await a.create('ANTHONY', 'another password');
  assert.ok(!b.ok && /taken/.test(b.error), 'names are unique ignoring case');
  assert.match((await a.create('x', 'long enough pw')).error, /3 to 24/);
  assert.match((await a.create('sam', 'short')).error, /at least 8/);
});

test('signing in checks the hash, and signing out goes back to guest', async () => {
  const a = new Accounts(memory());
  await a.create('sam_1', 'password-one');
  a.signOut();
  assert.strictEqual(a.current(), null);
  const wrong = await a.signIn('sam_1', 'password-two');
  assert.ok(!wrong.ok);
  assert.strictEqual(wrong.error, (await a.signIn('nobody', 'password-one')).error, 'a wrong name and a wrong password look the same');
  const right = await a.signIn('SAM_1', 'password-one');
  assert.ok(right.ok);
  assert.strictEqual(a.current(), 'sam_1');
});

test('each account keeps its own progress, and guest progress can move into a new account', async () => {
  const s = memory();
  new Progress(s, PROGRESS_KEY).complete('setup', 0);
  new Activity(s, ACTIVITY_KEY).mark(new Date('2026-11-02T10:00'));
  const a = new Accounts(s);
  await a.create('kim', 'password-kim', { bringGuest: true });
  assert.deepStrictEqual(new Progress(s, keyFor(PROGRESS_KEY, 'kim')).get('setup').done, [0]);
  assert.deepStrictEqual(new Activity(s, keyFor(ACTIVITY_KEY, 'kim')).days, ['2026-11-02']);
  assert.deepStrictEqual(new Progress(s, PROGRESS_KEY).get('setup').done, [], 'the guest starts fresh after moving');

  await a.create('lee', 'password-lee');
  assert.deepStrictEqual(new Progress(s, keyFor(PROGRESS_KEY, 'lee')).get('setup').done, [], 'a new account without the box starts empty');
});

test('deleting an account needs the password and removes its progress', async () => {
  const s = memory();
  const a = new Accounts(s);
  await a.create('pat', 'password-pat');
  new Progress(s, keyFor(PROGRESS_KEY, 'pat')).complete('setup', 0);
  assert.ok(!(await a.remove('pat', 'nope-nope')).ok);
  assert.ok((await a.remove('pat', 'password-pat')).ok);
  assert.strictEqual(a.current(), null);
  assert.deepStrictEqual(a.list(), []);
  assert.strictEqual(s.getItem(keyFor(PROGRESS_KEY, 'pat')), null);
});

test('accounts still answer when storage is blocked', async () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  const a = new Accounts(blocked);
  assert.strictEqual(a.current(), null);
  const r = await a.create('ana', 'password-ana');
  assert.ok(!r.ok && /blocking storage/.test(r.error));
});
