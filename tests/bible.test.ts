import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  books,
  location,
  step,
  searchBible,
  audioPage,
  audioSource,
  bibleLanguages,
  isLang,
  containsVerse,
  verseLabel,
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
void test('chapter audio uses HTTPS media sources for both languages', () => {
  assert.equal(
    audioSource('en', 1, 1),
    'https://kjv.wordfree.net/bibles/app/audio/1/1/1.mp3',
  );
  assert.equal(
    audioSource('my', 66, 22),
    'https://www.wordproaudio.net/bibles/app/audio/43/66/22.mp3',
  );
  assert.equal(
    audioSource('en', 19, 150),
    'https://kjv.wordfree.net/bibles/app/audio/1/19/150.mp3',
  );
  assert.equal(audioSource('my', 999, 999), audioSource('my', 66, 22));
});
void test('Chin Lutuv has the complete source corpus and original book names', () => {
  const data = load('clt');
  assert.ok(bibleLanguages.includes('clt'));
  assert.equal(isLang('clt'), true);
  assert.equal(isLang('unknown'), false);
  assert.equal(data.length, 66);
  assert.equal(
    data.reduce((sum, book) => sum + book.chapters.length, 0),
    1189,
  );
  let entries = 0;
  for (const [index, book] of data.entries()) {
    assert.equal(book.id, index + 1);
    assert.equal(book.name, books[index].clt);
    assert.equal(book.chapters.length, books[index].chapters);
    for (const chapter of book.chapters) {
      assert.ok(chapter.length);
      let previous = 0;
      for (const verse of chapter) {
        assert.ok(verse.n > previous);
        previous = verse.end ?? verse.n;
        assert.ok(previous >= verse.n);
        assert.ok(verse.text || verse.note);
        assert.doesNotMatch(verse.text + (verse.note ?? ''), /[\\<>\uFFFD]/);
        entries++;
      }
    }
  }
  assert.equal(entries, 31094);
  assert.equal(data[0].name, 'SAHRUOTHUNA');
  assert.equal(
    data[0].chapters[0][0].text,
    'A hruothu lie Khazing ta alyi hne avuo a sa tiy yi ta,',
  );
  assert.ok(
    searchBible(data, 'khazing', 1).some(
      (m) => m.chapter === 1 && m.verse.n === 1,
    ),
  );
});
void test('Lutuv preserves verse bridges and notes without adding narration', () => {
  const data = load('clt');
  const bridge = data
    .flatMap((book) => book.chapters.flat())
    .find((v) => v.end)!;
  assert.ok(bridge);
  assert.equal(containsVerse(bridge, bridge.end!), true);
  assert.equal(containsVerse(bridge, bridge.end! + 1), false);
  assert.equal(verseLabel(bridge), `${bridge.n}–${bridge.end}`);
  assert.equal(data[23].chapters[8][0].n, 1);
  assert.match(data[23].chapters[8][0].text, /^Ama thiepa/);
  for (const number of [44, 46]) {
    const verse = data[40].chapters[8].find((v) => v.n === number)!;
    assert.equal(verse.text, '');
    assert.ok(verse.note);
  }
  assert.equal(audioSource('clt', 1, 1), undefined);
  assert.equal(audioPage('clt', 1), undefined);
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
