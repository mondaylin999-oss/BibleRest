# WordBible — User guide

An independent English and Myanmar Bible reader based on Wordproject.

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

- **Bibles:** choose English or မြန်မာ, then a book and chapter. Both complete Bibles are included: 66 books and 1,189 chapters each.
- **Settings:** select the interface language and Bible language independently. Both offer only English and Myanmar. Change light/dark appearance and text size.
- The reader shows one chosen language at a time. Change the Bible language selector whenever you want to switch.
- **Search:** search the full selected Bible, optionally within one book. Results open the matching verse. Search matches literal text, not translations or approximate spelling.
- Click a verse number to copy or bookmark it. Saved verses appear under **Verses**. Up to 500 bookmarks and your settings stay in this browser. Clearing browser data removes them.
- **Verses:** selected passages grouped by faith, hope, love, peace and comfort.
- **Resources:** download complete Bible text as JSON. Open a chapter and choose Print / Save PDF for a PDF.
- Home shows a seven-passage daily rotation, changing at midnight UTC; it is not synchronized to Wordproject's daily selection.

## Voice and audio

**Recorded narration is not included in this ZIP.** Wordproject asks other Bible apps not to stream its entire audio library from its servers. **Listen on Wordproject** opens the original book's narration page; select the chapter there to hear the reference voice. Internet is needed for these external pages.

To play audio **inside this app**, choose an MP3, M4A, OGG or WAV for the current chapter. The player supports seek, volume, speed, repeat and automatic next-chapter playback when that recording is available. Browser policies may require pressing Play again. Native media controls follow your browser language.

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

The app follows the reference's red header, dark navigation, book lists, chapter reader, audio controls, search, verse topics, downloads and display settings. It is **not an exact copy of every Wordproject page** or an official Wordproject product. Its name is WordBible. Other languages, donation pages and unrelated third-party resources are not duplicated. The topic collection and daily-verse rotation are original selections. Operating-system dialogs follow device language settings.

- Reference: https://www.wordproject.org/
- Bible text downloads: https://www.wordproject.org/download/bibles/index.htm
- Source terms: https://www.wordproject.org/contact/new/copyrights.htm

## မြန်မာ အကျဉ်းချုပ်

ZIP ကို ဖြည်ပြီး Node.js ထည့်သွင်းပါ။ Terminal တွင် `node scripts/serve.mjs` ကို ရိုက်ထည့်ပြီး http://127.0.0.1:4173 သို့ဝင်ပါ။ ဒေတာဘေ့စ် မလိုပါ။ ဆက်တင်တွင် မျက်နှာပြင်ဘာသာနှင့် ကျမ်းစာဘာသာကို သီးခြားရွေးနိုင်ပါသည်။ ကျမ်းစာစာသား နှစ်ဘာသာလုံးပါဝင်ပြီး အသံဖိုင်များ မပါဝင်ပါ။ မူရင်းအသံကို Wordproject တွင် နားထောင်နိုင်ပါသည် သို့မဟုတ် ကိုယ်ပိုင်အသံဖိုင်ကို ထည့်နိုင်ပါသည်။

Developer instructions: README1.md. Actual checks and limitations: VALIDATION.md.
