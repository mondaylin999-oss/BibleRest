import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  books,
  location,
  step,
  searchBible,
  audioPage,
  type BibleBook,
} from '../lib/bible';
const load = (lang: string): BibleBook[] =>
  JSON.parse(
    readFileSync(
      new URL(`../public/data/${lang}.json`, import.meta.url),
      'utf8',
    ),
  );
for (const lang of ['en', 'my'])
  void test(`${lang}: complete corpus has clean sequential verses`, () => {
    const data = load(lang);
    assert.equal(data.length, 66);
    assert.equal(
      data.reduce((n, b) => n + b.chapters.length, 0),
      1189,
    );
    for (const [i, b] of data.entries()) {
      assert.equal(b.id, i + 1);
      assert.equal(b.chapters.length, books[i].chapters);
      assert.ok(b.name);
      for (const c of b.chapters) {
        assert.ok(c.length);
        c.forEach((v, i) => {
          assert.equal(v.n, i + 1);
          assert.ok(v.text.trim());
          assert.ok(!/[<>\uFFFD]/.test(v.text));
        });
      }
    }
  });
void test('KJV has 31,102 verses', () =>
  assert.equal(
    load('en').reduce(
      (n, b) => n + b.chapters.reduce((m, c) => m + c.length, 0),
      0,
    ),
    31102,
  ));
void test('navigation crosses books and testaments and stops at Bible boundaries', () => {
  assert.deepEqual(step(1, 50, 1), { book: 2, chapter: 1 });
  assert.deepEqual(step(40, 1, -1), { book: 39, chapter: 4 });
  assert.equal(step(1, 1, -1), null);
  assert.equal(step(66, 22, 1), null);
  assert.deepEqual(step(19, 150, 1), { book: 20, chapter: 1 });
});
void test('invalid deep links are clamped', () => {
  assert.deepEqual(location(999, 999), { book: 66, chapter: 22 });
  assert.deepEqual(location(NaN, -5), { book: 1, chapter: 1 });
});
void test('English search is case insensitive with book filters', () => {
  const d = load('en');
  assert.ok(
    searchBible(d, 'IN THE BEGINNING').some(
      (v) => v.book === 1 && v.chapter === 1 && v.verse.n === 1,
    ),
  );
  assert.ok(searchBible(d, 'God', 43).every((v) => v.book === 43));
  assert.equal(searchBible(d, '  ').length, 0);
  assert.equal(searchBible(d, 'zzzzzzzzzzzzzz').length, 0);
});
void test('Myanmar search uses actual Unicode text', () => {
  const d = load('my');
  const q = d[0].chapters[0][0].text.slice(0, 12);
  assert.ok(
    searchBible(d, q).some(
      (v) => v.book === 1 && v.chapter === 1 && v.verse.n === 1,
    ),
  );
});
void test('audio links are listening pages, not hotlinks', () => {
  assert.equal(
    audioPage('my', 1),
    'https://www.wordproject.org/bibles/audio/43_burmese/b01.htm',
  );
  assert.equal(
    audioPage('en', 66),
    'https://www.wordproject.org/bibles/audio/01_english/b66.htm',
  );
});
