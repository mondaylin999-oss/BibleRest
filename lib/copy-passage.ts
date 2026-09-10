import { containsVerse, type BibleBook } from './bible';

export type PassageRange = {
  startChapter: number;
  endChapter: number | null;
  startVerse: number | null;
  endVerse: number | null;
};

export function copyPassage(
  book: BibleBook,
  title: string,
  range: PassageRange,
) {
  const { startChapter, startVerse, endVerse } = range;
  const endChapter = range.endChapter ?? startChapter;
  const validChapter = (n: number) =>
    Number.isInteger(n) && n >= 1 && n <= book.chapters.length;
  if (!validChapter(startChapter) || !validChapter(endChapter))
    throw new Error('chapter');
  if (endChapter < startChapter) throw new Error('order');
  const first = book.chapters[startChapter - 1];
  const last = book.chapters[endChapter - 1];
  const from = startVerse ?? first[0]?.n;
  // No verse endpoints means whole chapters. A start verse alone means one
  // verse, unless an end chapter was explicitly selected.
  const to =
    endVerse ??
    (startVerse !== null && range.endChapter === null
      ? startVerse
      : (last.at(-1)?.end ?? last.at(-1)?.n));
  if (
    from === undefined ||
    to === undefined ||
    !Number.isInteger(from) ||
    !Number.isInteger(to)
  )
    throw new Error('verse');
  const fromVerse = first.find((v) => containsVerse(v, from));
  const toVerse = last.find((v) => containsVerse(v, to));
  if (!fromVerse || !toVerse) throw new Error('verse');
  if (startChapter === endChapter && to < from) throw new Error('order');
  // Translations that bridge two verse numbers cannot be split word-for-word.
  // Include the complete source entry and report its actual range in the heading.
  const actualFrom = fromVerse.n;
  const actualTo = toVerse.end ?? toVerse.n;
  const paragraphs: string[] = [];
  for (let c = startChapter; c <= endChapter; c++) {
    const text = book.chapters[c - 1]
      .filter(
        (v) =>
          (c !== startChapter || (v.end ?? v.n) >= actualFrom) &&
          (c !== endChapter || v.n <= actualTo),
      )
      .map((v) => v.text.replaceAll('။', '').trim())
      .filter(Boolean)
      .join('\n');
    if (text) paragraphs.push(text);
  }
  if (!paragraphs.length) throw new Error('empty');
  const reference =
    startChapter === endChapter
      ? `${startChapter} : ${actualFrom}${actualFrom === actualTo ? '' : `–${actualTo}`}`
      : `${startChapter} : ${actualFrom} – ${endChapter} : ${actualTo}`;
  return `${title.replaceAll('။', '').trim()} ${reference}\n${paragraphs.join('\n')}`;
}
