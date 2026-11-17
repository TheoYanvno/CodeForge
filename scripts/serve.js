// `npm start`: serves this folder at http://localhost:8000 with Node alone, so it works the same on
// Windows, macOS and Linux (Windows has no `python3` command by default).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.env.PORT) || 8000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };

/** The file a URL path points at, or null if it would leave the project folder. */
export function fileFor(urlPath, root = ROOT) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const full = normalize(join(root, clean));
  const rel = relative(root, full);
  return rel.startsWith('..') || isAbsolute(rel) ? null : full;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createServer(async (req, res) => {
    let path = fileFor(req.url);
    if (!path) { res.writeHead(403).end('Forbidden'); return; }
    try {
      if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
      const body = await readFile(path);
      res.writeHead(200, { 'Content-Type': TYPES[extname(path).toLowerCase()] ?? 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    }
  }).listen(PORT, () => console.log(`CodeForge: http://localhost:${PORT}`));
}
