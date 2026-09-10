import catalog from './books.json';
export type UiLang = 'en' | 'my';
export type Lang = UiLang | 'clt' | 'cnh';
export const bibleLanguages: Lang[] = ['en', 'my', 'clt', 'cnh'];
export function isChin(lang: Lang) {
  return lang === 'clt' || lang === 'cnh';
}
export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'my' || value === 'clt' || value === 'cnh';
}
export type Verse = { n: number; end?: number; text: string; note?: string };
export function verseLabel(verse: Verse) {
  return verse.end ? `${verse.n}–${verse.end}` : String(verse.n);
}
export function containsVerse(verse: Verse, number: number) {
  return number >= verse.n && number <= (verse.end ?? verse.n);
}
export type BibleBook = { id: number; name: string; chapters: Verse[][] };
export const books = catalog;
export function location(book: number, chapter: number) {
  const b = Math.max(1, Math.min(66, Math.trunc(book) || 1));
  return {
    book: b,
    chapter: Math.max(
      1,
      Math.min(books[b - 1].chapters, Math.trunc(chapter) || 1),
    ),
  };
}
export function step(book: number, chapter: number, direction: number) {
  let b = book,
    c = chapter + direction;
  if (c < 1) {
    if (b === 1) return null;
    b--;
    c = books[b - 1].chapters;
  }
  if (c > books[b - 1].chapters) {
    if (b === 66) return null;
    b++;
    c = 1;
  }
  return { book: b, chapter: c };
}
export function audioPage(lang: Lang, book: number) {
  if (isChin(lang)) return undefined;
  return `https://www.wordproject.org/bibles/audio/${lang === 'en' ? '01_english' : '43_burmese'}/b${String(book).padStart(2, '0')}.htm`;
}
// Narration sources linked by Wordproject's English and Burmese listening pages.
export function audioSource(lang: Lang, book: number, chapter: number) {
  if (isChin(lang)) return undefined;
  const pos = location(book, chapter);
  const base =
    lang === 'en'
      ? 'https://kjv.wordfree.net/bibles/app/audio/1'
      : 'https://www.wordproaudio.net/bibles/app/audio/43';
  return `${base}/${pos.book}/${pos.chapter}.mp3`;
}
export function searchBible(data: BibleBook[], query: string, book = 0) {
  const q = query.trim().normalize('NFC').toLocaleLowerCase();
  if (!q) return [];
  const found: { book: number; chapter: number; verse: Verse }[] = [];
  for (const b of data) {
    if (book && b.id !== book) continue;
    for (let c = 0; c < b.chapters.length; c++)
      for (const v of b.chapters[c])
        if (v.text.normalize('NFC').toLocaleLowerCase().includes(q))
          found.push({ book: b.id, chapter: c + 1, verse: v });
  }
  return found;
}
export function readSetting<T>(key: string, fallback: T): T {
  try {
    return (
      JSON.parse(localStorage.getItem('wordbible:' + key) || 'null') ?? fallback
    );
  } catch {
    return fallback;
  }
}
export function saveSetting(key: string, value: unknown) {
  try {
    localStorage.setItem('wordbible:' + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
