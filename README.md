# BibleRest — English, Myanmar & Chin

An independent Bible reader for English, Myanmar and two Chin branches. English and Myanmar text comes from Wordproject; Chin text was imported from the supplied Bible APKs.

**Live site: https://biblerest.netlify.app**

No account, database, API key or backend is required. The app is a static single-page React build; all four translations ship as JSON files and every preference stays in your browser.

## Run it locally

Requires Node.js 22.13 or newer (Node.js 24 recommended).

```sh
git clone https://github.com/mondaylin999-oss/BibleRest.git
cd BibleRest
npm install
npm run dev
```

Then open **http://127.0.0.1:3000**.

To serve a production build instead — the same static output Netlify publishes:

```sh
npm run build
npm start
```

That serves the generated `out` folder at **http://127.0.0.1:4173**. On Windows you can double-click **START.cmd** once a build exists. Do not open `index.html` directly from disk; use one of the local addresses above.

Note that `out/` is generated and is not committed, so you must run `npm run build` at least once before `npm start` or `START.cmd` will work.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run build` | Production build into `out/` |
| `npm start` | Serves the built `out/` folder on port 4173 |
| `npm test` | 20 tests covering both corpora, copying, search and the static server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | oxlint |
| `npm run format` | oxfmt |

## Deployment

The repository deploys to Netlify as a static site. [`netlify.toml`](netlify.toml) sets the build command, the `out` publish directory and Node 22; [`public/_headers`](public/_headers) sets caching — one day with revalidation for the translation JSON, one year immutable for hashed assets. Pushes to `main` deploy automatically.

Because there is no server-side code, the same build works on any static host.

## Reading and settings

- **Bibles:** choose English, မြန်မာ or Chin, then the Chin branch Lutuv or Hakha. All four translations are complete: 66 books and 1,189 chapters each.
- **Settings:** interface language and Bible language are chosen independently. The interface is available in English and Myanmar. Light/dark appearance and text size are adjustable.
- The reader shows one language at a time. Only the translation you select is downloaded; others load when you switch to them, and stay cached for the rest of the session.
- **Search:** searches the full selected Bible, optionally within one book. Matching is literal text, not fuzzy or translated.
- Click a verse number to copy or bookmark it. Saved verses appear under **Verses**. Up to 500 bookmarks and your settings live in browser localStorage; clearing browser data removes them.
- **Verses:** selected passages grouped by faith, hope, love, peace and comfort.
- **Resources:** download the complete Bible text as JSON. Open a chapter and choose Print / Save PDF for a PDF.
- Home shows a seven-passage daily rotation that changes at midnight UTC. It is not synchronized to Wordproject's daily selection.

## Copy a passage

Open a book to use the five fields above its title. The title is locked to the current book; the start chapter defaults to the chapter you opened. Empty optional fields display `NONE`. Leave both verse fields as `NONE` to copy whole chapters. A start verse alone copies that verse. An end chapter without an end verse copies through the last verse of that chapter.

Press **Confirm**, then **Copy**. The form never previews the selected passage, and editing a field requires confirming again. Copied text starts with one heading such as `Genesis 1 : 2 – 2 : 2`, followed by text-only paragraphs without added chapter or verse numbers. Combined source verses stay intact and their full range appears in the heading. Clipboard failures show an error without displaying the passage.

## Voice and audio

Chapter narration streams over HTTPS from the audio hosts linked by Wordproject, so playback needs an internet connection and depends on those hosts staying available. If playback fails, use Retry or choose a local recording.

You can supply an MP3, M4A, OGG or WAV for the current chapter; an imported recording overrides the online source for that session. The player supports seek, volume, speed, repeat and automatic next-chapter playback. Browser autoplay policies may require pressing Play again.

To load several recordings at once, use **Resources → Load an audio folder** with this layout:

```text
recordings/
  en/1/1.mp3
  en/1/2.mp3
  my/1/1.mp3
  my/1/2.mp3
```

The numbers are **book / chapter**, starting at 1. Folder selection works best in Chrome or Edge; picking individual files is the fallback. Files are used locally and never uploaded, and must be chosen again after reopening the app. No audio is bundled in this repository.

## Data and storage

**No database is involved.** Bible text lives in static JSON under `public/data/` (`en`, `my`, `clt`, `cnh`). Browser localStorage holds settings and bookmarks. The included Node server only reads files from disk. There is no cross-device synchronization and nothing is sent anywhere.

## Project layout

```text
app/           Single-page application
components/    UI components (shadcn-derived)
lib/           Bible data model, search, settings, audio helpers
public/data/   Four complete translations as JSON
scripts/       Static file server and the text import scripts
tests/         Node test-runner suites
```

Built with React 19, Vite 8, TypeScript and Tailwind CSS 4. See [README1.md](README1.md) for the import pipeline and other maintainer notes, and [VALIDATION.md](VALIDATION.md) for what has and has not been verified.

## Reference and differences

BibleRest uses its own calm ivory and forest-green interface with a focused reading layout. It is not an official Wordproject product and is not an exact copy of another site.

- Reference: https://www.wordproject.org/
- Bible text downloads: https://www.wordproject.org/download/bibles/index.htm
- Source terms: https://www.wordproject.org/contact/new/copyrights.htm

## Chin languages

Chin Lutuv (Lautu Chin, `clt`) was imported from the supplied Lutuv Bible app, package `org.open3905.lutuvbible`, version `26.6.4`. Chin Hakha (`cnh`) was imported from the supplied Hakha Bible app, package `org.open3905.hakhabible`, version `26.9.5`. Both include all 66 books and 1,189 chapters with their original book titles.

Reading, search, bookmarks, topics and JSON download support both Chin branches. Chin audio is not included, because the reference apps use external audio services rather than shipping recordings. No service credentials or APK binaries are included in this repository.

## မြန်မာ အကျဉ်းချုပ်

Repository ကို clone လုပ်ပြီး Node.js 22.13 သို့မဟုတ် အထက် ထည့်သွင်းပါ။ `npm install` ပြီးလျှင် `npm run dev` ကို ရိုက်ထည့်ပြီး http://127.0.0.1:3000 သို့ဝင်ပါ။ အွန်လိုင်းတွင် https://biblerest.netlify.app ၌ တိုက်ရိုက်ဖတ်နိုင်ပါသည်။ ဒေတာဘေ့စ် မလိုပါ။ ဆက်တင်တွင် မျက်နှာပြင်ဘာသာနှင့် ကျမ်းစာဘာသာကို သီးခြားရွေးနိုင်ပါသည်။ ကျမ်းစာစာသား လေးဘာသာလုံးပါဝင်ပြီး အသံဖိုင်များ မပါဝင်ပါ။ မူရင်းအသံကို Wordproject တွင် နားထောင်နိုင်ပါသည် သို့မဟုတ် ကိုယ်ပိုင်အသံဖိုင်ကို ထည့်နိုင်ပါသည်။
