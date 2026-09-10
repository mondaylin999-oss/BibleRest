"""Import the supplied Lutuv Bible APK (org.open3905.lutuvbible, 26.6.4).

Usage: python scripts/import_lutuv.py path/to/base.apk
Reads bundled USFM assets only; never executes the APK or copies service keys.
"""

import argparse
import gzip
import json
import re
import struct
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOK_CODES = 'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split()


def decode_asset(raw):
    # SAB's bundled native asset reader applies TEA to complete 8-byte blocks,
    # leaving the final partial block intact, then decompresses gzip.
    data = bytearray(raw)
    key = (0xE56B28F9, 0xAE69280F, 0x9E6F28A6, 0x2F7AF8DB)
    for offset in range(0, len(raw) - 7, 8):
        left, right = struct.unpack_from('<II', raw, offset)
        total = 0xC6EF3720
        for _ in range(32):
            right = (right - (((left << 4) + key[2]) ^ (left + total) ^ ((left >> 5) + key[3]))) & 0xFFFFFFFF
            left = (left - (((right << 4) + key[0]) ^ (right + total) ^ ((right >> 5) + key[1]))) & 0xFFFFFFFF
            total = (total - 0x9E3779B9) & 0xFFFFFFFF
        struct.pack_into('<II', data, offset, left, right)
    return gzip.decompress(data).decode('utf-8')


def parse_chapter(usfm):
    notes = {}
    for segment in re.split(r'(?=\\v\s+\d+)', usfm):
        number = re.match(r'\\v\s+(\d+)', segment)
        footnote = re.search(r'\\ft\s+(.*?)\\f\*', segment, re.S)
        if number and footnote:
            notes[int(number[1])] = ' '.join(re.sub(r'\\[a-z]+\*?\s?', '', footnote[1]).split())
    # Notes and cross references are editorial material, not verse text.
    text = re.sub(r'\\(f|x)\s.*?\\\1\*', '', usfm, flags=re.S)
    # Preserve words inside inline character styles (including divine names).
    text = re.sub(r'\\vp\s+.*?\\vp\*', '', text, flags=re.S)
    text = re.sub(r'\\\+?(?:nd|em|k|bk|wj|qs|tl|it|sig)\*?\s?', '', text)
    text = re.sub(r'(?<!\n)(\\(?:v|p|m|mi|q[1-3]?|qr|li1?|pi|b|s[1-3]?|r|d|mr|ms[1-3]?)\s)', r'\n\1', text)
    verses = []
    active = None
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        verse = re.match(r'\\v\s+(\d+)(?:-(\d+))?(?:\s+(.*))?$', line)
        if verse:
            active = {'n': int(verse[1]), 'text': verse[3] or ''}
            if verse[2]:
                active['end'] = int(verse[2])
            verses.append(active)
            continue
        marker = re.match(r'\\([a-z]+\d*)\s*(.*)', line)
        if marker:
            if marker[1] in ('p', 'm', 'mi', 'q', 'q1', 'q2', 'q3', 'qr', 'li', 'li1', 'pi', 'b'):
                line = marker[2]
            else:
                active = None
                continue
        if active and line:
            active['text'] += ' ' + line
    for verse in verses:
        verse['text'] = ' '.join(verse['text'].split())
        if not verse['text'] and verse['n'] in notes:
            verse['note'] = notes[verse['n']]
        assert (verse['text'] or verse.get('note')) and '\\' not in verse['text'], verse
    assert verses, 'Empty chapter'
    # Some Hakha chapters contain a source paragraph marker that resumes with
    # an earlier verse number. Keep the source verse labels and sort them for
    # the web reader's stable order.
    verses.sort(key=lambda verse: verse['n'])
    return verses


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('apk', type=Path)
    parser.add_argument('--language', choices=['clt', 'cnh'], default='clt')
    args = parser.parse_args()
    catalog = json.loads((ROOT / 'lib/books.json').read_text('utf-8'))
    with zipfile.ZipFile(args.apk) as apk:
        assets = {}
        for name in apk.namelist():
            if name.startswith('assets/') and '.' not in Path(name).name:
                raw = apk.read(name)
                if raw.startswith(bytes.fromhex('42eda4b62adbbce3')):
                    assets[Path(name).name] = decode_asset(raw)
        definition = next(ET.fromstring(text) for text in assets.values() if '<app-definition ' in text)
        expected = 'org.open3905.hakhabible' if args.language == 'cnh' else 'org.open3905.lutuvbible'
        assert definition.findtext('package') == expected
        collection = definition.find("./books[@id='HAKHA']") if args.language == 'cnh' else definition.find('./books')
        book_definitions = {book.attrib['id']: book for book in collection.findall('book')}
        bible = []
        for index, code in enumerate(BOOK_CODES):
            book = book_definitions[code]
            suffix = ET.fromstring(assets[book.findtext('bd')]).findtext('f')
            chapter_map = {}
            for name, text in assets.items():
                match = re.match(r'\\c\s+(\d+)', text)
                if name.endswith(suffix) and match:
                    number = int(match[1])
                    assert number not in chapter_map, (code, number)
                    chapter_map[number] = parse_chapter(text)
            count = catalog[index]['chapters']
            assert set(chapter_map) == set(range(1, count + 1)), code
            title = book.findtext('n')
            catalog[index][args.language] = title
            bible.append({'id': index + 1, 'name': title, 'chapters': [chapter_map[c] for c in range(1, count + 1)]})
    (ROOT / f'public/data/{args.language}.json').write_text(json.dumps(bible, ensure_ascii=False, separators=(',', ':')), 'utf-8')
    (ROOT / 'lib/books.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', 'utf-8')
    print(f'Imported {len(bible)} books, {sum(len(b["chapters"]) for b in bible)} chapters, '
          f'{sum(len(c) for b in bible for c in b["chapters"])} verse entries.')


if __name__ == '__main__':
    main()
