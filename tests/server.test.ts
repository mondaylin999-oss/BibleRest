import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
void test('built static server serves text, supports ranges, rejects writes and traversal', async () => {
  const child = spawn(process.execPath, ['scripts/serve.mjs'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: { ...process.env, PORT: '0' },
  });
  try {
    const started = await Promise.race([
      once(child.stdout, 'data'),
      once(child, 'exit').then(() => {
        throw Error('server exited early');
      }),
      new Promise<never>((_, reject) => {
        const timer = setTimeout(() => reject(Error('server timeout')), 10000);
        timer.unref();
      }),
    ]);
    const url = String(started[0]).match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
    assert.ok(url);
    const home = await fetch(url);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /BibleRest/);
    const bible = await fetch(url + '/data/en.json');
    assert.equal(bible.status, 200);
    assert.equal((await bible.json()).length, 66);
    const range = await fetch(url + '/data/en.json', {
      headers: { Range: 'bytes=0-15' },
    });
    assert.equal(range.status, 206);
    assert.equal((await range.arrayBuffer()).byteLength, 16);
    assert.match(range.headers.get('content-range') || '', /^bytes 0-15\//);
    const suffix = await fetch(url + '/data/en.json', {
      headers: { Range: 'bytes=-8' },
    });
    assert.equal(suffix.status, 206);
    assert.equal((await suffix.arrayBuffer()).byteLength, 8);
    assert.equal(
      (
        await fetch(url + '/data/en.json', {
          headers: { Range: 'bytes=999999999-' },
        })
      ).status,
      416,
    );
    assert.equal((await fetch(url, { method: 'POST' })).status, 405);
    assert.equal((await fetch(url + '/missing.mp3')).status, 404);
    assert.notEqual((await fetch(url + '/%2e%2e%5cpackage.json')).status, 200);
    assert.equal(
      (await fetch(url + '/data/my.json', { method: 'HEAD' })).status,
      200,
    );
  } finally {
    child.kill();
  }
});
