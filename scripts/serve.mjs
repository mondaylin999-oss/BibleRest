import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const base = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../out',
);
const root = await realpath(base).catch(() => {
  console.error('Build first: npm run build');
  process.exit(1);
});
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};
const server = http.createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const decoded = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname,
    );
    if (decoded.includes('\\') || decoded.includes('\0')) {
      res.writeHead(400).end();
      return;
    }
    let candidate = path.resolve(root, '.' + decoded);
    if (candidate !== root && !candidate.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    let info = await stat(candidate);
    if (info.isDirectory()) {
      candidate = path.join(candidate, 'index.html');
      info = await stat(candidate);
    }
    const actual = await realpath(candidate);
    if (!actual.startsWith(root + path.sep) || !info.isFile()) {
      res.writeHead(403).end();
      return;
    }
    const headers = {
      'Content-Type':
        types[path.extname(candidate)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    };
    let start = 0,
      end = info.size - 1,
      status = 200;
    if (req.headers.range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!m || (!m[1] && !m[2])) {
        res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end();
        return;
      }
      start = m[1] ? Number(m[1]) : Math.max(0, info.size - Number(m[2]));
      end = m[1]
        ? m[2]
          ? Math.min(Number(m[2]), info.size - 1)
          : info.size - 1
        : info.size - 1;
      if (
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        start > end ||
        start >= info.size
      ) {
        res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end();
        return;
      }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
    }
    headers['Content-Length'] = String(Math.max(0, end - start + 1));
    res.writeHead(status, headers);
    if (req.method === 'HEAD' || info.size === 0) {
      res.end();
      return;
    }
    const stream = createReadStream(actual, { start, end });
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch (err) {
    res
      .writeHead(err.code === 'ENOENT' ? 404 : 400, {
        'Content-Type': 'text/plain',
      })
      .end('Not found or invalid request');
  }
});
const port = Number(process.env.PORT || 4173),
  host = process.env.HOST || '127.0.0.1';
server.listen(port, host, () =>
  console.log(`WordBible: http://${host}:${server.address().port}`),
);
