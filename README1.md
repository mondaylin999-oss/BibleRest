# BibleRest — Developer guide

Maintainer notes for the repository. For the reader-facing guide, see [README.md](README.md).

## Stack

React 19 and Vite 8 with TypeScript, Tailwind CSS 4, and oxlint/oxfmt for linting and formatting. Tests run on the Node test runner through `tsx`. There is no backend, no database and no framework router — the whole app is one page whose state lives in the URL hash.

Node.js 22.13 or newer is required (`engines` in `package.json`); Netlify builds on Node 22.

## Layout

```text
app/page.tsx        The entire application: state, routing, reader, search, audio
components/         UI components, mostly shadcn-derived
lib/bible.ts        Data model, language list, search, settings, audio URLs
public/data/        en.json, my.json, clt.json, cnh.json
public/_headers     Netlify cache headers
scripts/serve.mjs   Static file server for the built out/ folder
scripts/import_*.py Text import pipeline
tests/              bible, copy-passage and server suites
netlify.toml        Build command, publish dir, Node version
```

`app/page.tsx` is deliberately one large component. State is held in `useState` at the top and persisted to localStorage under `settings` and `marks` by two effects.

## Working on it

```sh
npm install
npm run dev        # port 3000
npm test           # 20 tests
npm run typecheck
npm run lint
npm run format
```

Run `npm run typecheck`, `npm run lint` and `npm test` before committing. `tsconfig.tsbuildinfo` is generated and git-ignored.

## Translation loading

Translations are fetched one at a time, not all at once. The effect in [`app/page.tsx`](app/page.tsx) keyed on `[data, lang, retry]` fetches `public/data/<lang>.json` for the active language only, and returns early when that translation is already in `data`, so switching back to a previously read language costs no request.

This matters because the four files total roughly 26 MB on disk and 5.4 MB gzipped. Loading only the selected one puts a cold visit at about 1.2 MB. If you add a language, add it to `bibleLanguages` in `lib/bible.ts` and drop the matching JSON into `public/data/` — no change to the fetching code is needed.

The JSON shape is `BibleBook[]`, 66 entries, each with an `id`, a localized `name` and a `chapters` array of verse arrays. Tests assert 66 books and 1,189 chapters, sequential verse numbers, non-empty text, and the absence of HTML or Unicode replacement characters.

## Importing text

Both importers read supplied files only. Neither executes an APK nor copies service credentials, and no APK binaries or keys belong in this repository.

```sh
python scripts/import_bibles.py path/to/kj_new.zip path/to/my_new.zip
python scripts/import_lutuv.py path/to/base.apk --language clt
python scripts/import_lutuv.py path/to/base.apk --language cnh
```

`import_bibles.py` converts Wordproject offline text packs, stripping markup, scripts, styling and tracking so only text survives. `import_lutuv.py` reads the bundled USFM assets from a Scripture App Builder APK, writing `public/data/<language>.json` for whichever branch `--language` names; those assets are TEA-encrypted in complete 8-byte blocks and then gzipped, which `decode_asset` reverses. Source translations are preserved as-is, with no machine translation.

After importing, re-run `npm test` — the corpus assertions are the check that an import came out intact.

## Audio

No recordings ship with the repository. `audioSource()` in `lib/bible.ts` builds HTTPS URLs against the external hosts Wordproject links to, so playback depends on those hosts. Users can override the source per chapter with a local file, or bulk-load a folder laid out as `<lang>/<book>/<chapter>.mp3`; imported files are read through object URLs, revoked on unmount, and never uploaded.

To permanently bundle audio you are licensed to distribute, place the files under `public/audio/` in that same layout and adjust `audioSource()` to prefer the local path. Be aware this multiplies the deployed size and the hosting bandwidth per visitor.

## Deployment

Netlify builds from `main` and publishes `out/`. Configuration lives in `netlify.toml`; caching lives in `public/_headers`, which Vite copies into `out/` at build time.

`/data/*` is cached for one day with revalidation rather than marked immutable, because the JSON filenames never change — an immutable header would mean a corrected translation never reaches returning readers. If you switch to content-hashed data filenames, that header can safely become `immutable`.

`vite.config.ts` sets `base: './'`, so the build also works from a subdirectory or from `file:`-adjacent hosting. Deploy previews and any other static host work without changes, since nothing runs server-side.

## Things to know before changing them

- The copy-passage form intentionally never previews the selected text, and requires re-confirmation after any edit. `tests/copy-passage.test.ts` pins this, including the rule that invalid ranges are rejected rather than clamped to a different verse.
- `scripts/serve.mjs` rejects non-GET/HEAD methods, path traversal, backslashes and null bytes, and supports byte ranges for audio seeking. `tests/server.test.ts` covers all of it against a real build.
- The daily passage rotation is a seven-entry cycle keyed to midnight UTC; it is not synchronized with Wordproject's daily selection.
- Interface language and Bible language are independent settings. The interface exists in English and Myanmar only, while the Bible selector offers all four translations.

See [VALIDATION.md](VALIDATION.md) for what has been verified and what has not.
