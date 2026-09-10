# BibleRest — User guide

An independent English, Myanmar and Chin Bible reader. English and Myanmar text comes from Wordproject; Chin text comes from the supplied Bible APKs.

## Start

1. Extract the ZIP completely.
2. Install Node.js 22.13 or newer (Node.js 24 recommended).
3. On Windows, double-click **START.cmd**. Alternatively open a terminal in the extracted WordBible folder and run:

```sh
node scripts/serve.mjs
```

4. Open **http://127.0.0.1:4173**. Keep the terminal open; press Ctrl+C to stop.

The ready-built `out` folder is included. Starting needs Node.js only: no npm installation, database, account, API key or internet connection. Do not open index.html directly; use the local address above.

## Reading and settings

- **Bibles:** choose English, မြန်မာ or Chin, then choose the Chin branch Lutuv or Hakha. All four complete Bible translations are included: 66 books and 1,189 chapters each.
- **Settings:** select the interface language and Bible language independently. The Bible selector offers English, Myanmar, Chin (Lutuv), and Chin (Hakha). The interface remains available in English and Myanmar. Change light/dark appearance and text size.
- The reader shows one chosen language at a time. Change the Bible language selector whenever you want to switch.
- **Search:** search the full selected Bible, optionally within one book. Results open the matching verse. Search matches literal text, not translations or approximate spelling.
- Click a verse number to copy or bookmark it. Saved verses appear under **Verses**. Up to 500 bookmarks and your settings stay in this browser. Clearing browser data removes them.
- **Verses:** selected passages grouped by faith, hope, love, peace and comfort.
- **Resources:** download complete Bible text as JSON. Open a chapter and choose Print / Save PDF for a PDF.
- Home shows a seven-passage daily rotation, changing at midnight UTC; it is not synchronized to Wordproject's daily selection.

## Copy a passage

Open a book to use the five fields above its title. The title is locked to the current book; the start chapter defaults to the chapter you opened. Empty optional fields display `NONE`. Leave both verse fields as `NONE` to copy whole chapters. A start verse alone copies that verse. An end chapter without an end verse copies through the last verse of that chapter.

Press **Confirm**, then **Copy**. The form never previews the selected passage. Editing a field requires confirmation again. Copied text starts with one heading such as `Genesis 1 : 2 – 2 : 2`, followed by text-only paragraphs without added chapter or verse numbers. Combined source verses stay intact and their full range is shown in the heading. Clipboard failures show an error without displaying the passage.

## Voice and audio

Chapter narration streams over HTTPS from the audio hosts linked by Wordproject. Press Play in the chapter player; an internet connection is required. External host availability may vary. If playback fails, use Retry or choose a local recording.

You can choose an MP3, M4A, OGG or WAV for the current chapter. Imported recordings override the online source for this session. The player supports seek, volume, speed, repeat and automatic next-chapter playback. Browser policies may require pressing Play again.

To load multiple recordings, use **Resources → Load an audio folder**, with this layout:

```text
recordings/
  en/1/1.mp3
  en/1/2.mp3
  my/1/1.mp3
  my/1/2.mp3
```

The numbers mean **book / chapter**, starting at 1. Folder selection works best in Chrome or Edge; individual-file selection is the fallback. Files are used locally and never uploaded. Choose them again after reopening the app. To permanently bundle authorized audio, see README1.md.

## Database

**No database is needed.** Bible text is stored in static JSON files. Browser localStorage holds settings and bookmarks. The included server only serves files. There is no cross-device synchronization.

## Reference and differences

BibleRest uses its own calm ivory and forest-green interface with a focused reading layout. It is not an official Wordproject product or an exact copy of another site.

- Reference: https://www.wordproject.org/
- Bible text downloads: https://www.wordproject.org/download/bibles/index.htm
- Source terms: https://www.wordproject.org/contact/new/copyrights.htm

## မြန်မာ အကျဉ်းချုပ်

ZIP ကို ဖြည်ပြီး Node.js ထည့်သွင်းပါ။ Terminal တွင် `node scripts/serve.mjs` ကို ရိုက်ထည့်ပြီး http://127.0.0.1:4173 သို့ဝင်ပါ။ ဒေတာဘေ့စ် မလိုပါ။ ဆက်တင်တွင် မျက်နှာပြင်ဘာသာနှင့် ကျမ်းစာဘာသာကို သီးခြားရွေးနိုင်ပါသည်။ ကျမ်းစာစာသား နှစ်ဘာသာလုံးပါဝင်ပြီး အသံဖိုင်များ မပါဝင်ပါ။ မူရင်းအသံကို Wordproject တွင် နားထောင်နိုင်ပါသည် သို့မဟုတ် ကိုယ်ပိုင်အသံဖိုင်ကို ထည့်နိုင်ပါသည်။

Developer instructions: README1.md. Actual checks and limitations: VALIDATION.md.

## Chin languages

Chin Lutuv (Lautu Chin, `clt`) was imported from the supplied Lutuv Bible app. Chin Hakha (`cnh`) was imported from the supplied Hakha Bible app, package `org.open3905.hakhabible`, version `26.9.5`. Both include all 66 books and 1,189 chapters with original book titles.

Reading, search, bookmarks, topics and JSON download support both Chin branches. Chin audio is not included; the reference APKs use external audio services rather than providing recordings. No service credentials or APK binaries are included in this repository.

To reproduce the import: `python scripts/import_lutuv.py path/to/base.apk`. The source translation is preserved without machine translation.
