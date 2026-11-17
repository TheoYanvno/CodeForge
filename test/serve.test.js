import test from 'node:test';
import assert from 'node:assert';
import { join, resolve } from 'node:path';
import { fileFor } from '../scripts/serve.js';

test('npm start serves files from the project folder and nothing outside it', () => {
  const root = resolve('project');
  assert.strictEqual(fileFor('/index.html?x=1', root), join(root, 'index.html'));
  assert.strictEqual(fileFor('/src/lessons/python.js', root), join(root, 'src', 'lessons', 'python.js'));
  for (const sneaky of ['/../secret.txt', '/%2e%2e/secret.txt', '/src/../../secret.txt']) assert.strictEqual(fileFor(sneaky, root), null, sneaky);
});
