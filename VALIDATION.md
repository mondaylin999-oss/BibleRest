# Validation — 2026-09-10

Completed on Windows with Node.js 24:

- Production Vite build: passed; static output is bundled in `out`.
- TypeScript checking: passed.
- Application lint: passed. Retained, unused scaffold components/hooks are excluded. React Compiler rules are disabled because the compiler is not used. The audio caption rule is disabled because the chapter transcript appears beside/below the player; timed captions are not supplied.
- Nine automated tests: passed.
  - Both text corpora: 66 books, 1,189 chapters, non-empty text, sequential verse numbers, no HTML or Unicode replacement characters.
  - English total: 31,102 verses. Myanmar source total: 31,088 verses.
  - Chapter/book/testament boundaries and invalid deep-link clamping.
  - English and Myanmar search, book filtering and empty queries.
  - Chapter media URLs use HTTPS with correct language, book and chapter mapping.
  - Actual built HTTP server: home/data requests, HEAD, normal/suffix/invalid byte ranges, rejected POST, missing files and rejected path traversal.
- npm audit: zero known vulnerabilities after dependency updates (including the development installation); production audit also passed.

Browser verification (2026-09-10): English Genesis 1 played with advancing time and a 352-second duration; Myanmar Genesis 1 played with advancing time and a 440-second duration. Both were paused after verification. Visible source branding was removed. Type checking, lint, all 10 tests and production build passed.

Not verified: every remote chapter, native folder picker behavior across browsers, mobile devices, screen readers, or native-speaker review. Online narration depends on external host availability and internet access.


Chin Lutuv addition (2026-09-10): recovered and imported all 66 canonical books and 1,189 chapters from the supplied APK. Validated 31,094 entries, original book names, nine verse bridges, and two note-only verses. No unprocessed USFM markers or replacement characters remain in imported text. Build, lint and all 12 tests passed. Browser checks passed for the Lutuv selector, Genesis 1 text, search, bookmark persistence after reload, a deep link to verse 18 inside the 17–18 bridge, and the JSON download link. The Lutuv audio page has no player. Native-speaker review has not been performed.
