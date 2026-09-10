import catalog from './books.json';
export type Lang = 'en' | 'my';
export type Verse = { n: number; text: string };
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
  return `https://www.wordproject.org/bibles/audio/${lang === 'en' ? '01_english' : '43_burmese'}/b${String(book).padStart(2, '0')}.htm`;
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
