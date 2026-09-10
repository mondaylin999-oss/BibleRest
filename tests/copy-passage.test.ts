import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyPassage } from '../lib/copy-passage';
import type { BibleBook } from '../lib/bible';
import { readFileSync } from 'node:fs';
import { bibleLanguages, books } from '../lib/bible';

for (const lang of bibleLanguages) {
  void test(`${lang}: copy puts each verse on its own line and removes Myanmar full stops`, () => {
    const data = JSON.parse(
      readFileSync(
        new URL(`../public/data/${lang}.json`, import.meta.url),
        'utf8',
      ),
    ) as BibleBook[];
    const result = copyPassage(data[44], books[44][lang], {
      startChapter: 5,
      endChapter: null,
      startVerse: 3,
      endVerse: 9,
    });
    const expected = data[44].chapters[4]
      .filter((v) => v.n >= 3 && v.n <= 9)
      .map((v) => v.text.replaceAll('။', '').trim())
      .filter(Boolean);
    assert.deepEqual(result.split('\n').slice(1), expected);
    assert.ok(!result.includes('။'));
    assert.equal(
      result.split('\n')[0],
      `${books[44][lang].replaceAll('။', '').trim()} 5 : 3–9`,
    );
  });
}

const book: BibleBook = {
  id: 1,
  name: 'Genesis',
  chapters: [
    [
      { n: 1, text: 'First verse.' },
      { n: 2, text: 'Second verse.' },
      { n: 3, text: 'Third verse.' },
    ],
    [
      { n: 1, text: 'Next chapter.' },
      { n: 2, text: 'Last verse.' },
    ],
  ],
};

void test('copy whole chapters with NONE verse fields; numbers appear only in heading', () => {
  assert.equal(
    copyPassage(book, 'Genesis', {
      startChapter: 1,
      endChapter: null,
      startVerse: null,
      endVerse: null,
    }),
    'Genesis 1 : 1–3\nFirst verse.\nSecond verse.\nThird verse.',
  );
  assert.equal(
    copyPassage(book, 'Genesis', {
      startChapter: 1,
      endChapter: 2,
      startVerse: null,
      endVerse: null,
    }),
    'Genesis 1 : 1 – 2 : 2\nFirst verse.\nSecond verse.\nThird verse.\nNext chapter.\nLast verse.',
  );
});
void test('copy one verse, a same-chapter range, and a cross-chapter range', () => {
  assert.equal(
    copyPassage(book, 'Genesis', {
      startChapter: 1,
      endChapter: null,
      startVerse: 2,
      endVerse: null,
    }),
    'Genesis 1 : 2\nSecond verse.',
  );
  assert.equal(
    copyPassage(book, 'Genesis', {
      startChapter: 1,
      endChapter: null,
      startVerse: 2,
      endVerse: 3,
    }),
    'Genesis 1 : 2–3\nSecond verse.\nThird verse.',
  );
  assert.equal(
    copyPassage(book, 'Genesis', {
      startChapter: 1,
      endChapter: 2,
      startVerse: 2,
      endVerse: 2,
    }),
    'Genesis 1 : 2 – 2 : 2\nSecond verse.\nThird verse.\nNext chapter.\nLast verse.',
  );
  assert.equal(
    copyPassage(book, 'မြန်မာ', {
      startChapter: 1,
      endChapter: 2,
      startVerse: 3,
      endVerse: null,
    }),
    'မြန်မာ 1 : 3 – 2 : 2\nThird verse.\nNext chapter.\nLast verse.',
  );
});
void test('invalid copy ranges are rejected, never clamped to different verses', () => {
  const base = {
    startChapter: 1,
    endChapter: null,
    startVerse: 1,
    endVerse: null,
  };
  for (const change of [
    { startChapter: 0 },
    { endChapter: 3 },
    { startChapter: 2, endChapter: 1 },
    { startVerse: 2, endVerse: 1 },
    { startVerse: 99 },
    { endVerse: 2.5 },
    { endVerse: 0 },
  ]) {
    assert.throws(() => copyPassage(book, 'Genesis', { ...base, ...change }));
  }
});
void test('copy preserves a bridged entry once and excludes translation notes', () => {
  const bridged: BibleBook = {
    id: 1,
    name: 'Chin',
    chapters: [
      [
        { n: 1, end: 2, text: 'Combined wording.' },
        { n: 3, text: '', note: 'Editorial note' },
      ],
    ],
  };
  assert.equal(
    copyPassage(bridged, 'Chin', {
      startChapter: 1,
      endChapter: null,
      startVerse: 2,
      endVerse: null,
    }),
    'Chin 1 : 1–2\nCombined wording.',
  );
  assert.throws(
    () =>
      copyPassage(bridged, 'Chin', {
        startChapter: 1,
        endChapter: null,
        startVerse: 3,
        endVerse: null,
      }),
    /empty/,
  );
});
