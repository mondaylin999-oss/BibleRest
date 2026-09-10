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
  - Official narration links use book pages rather than MP3 hotlinks.
  - Actual built HTTP server: home/data requests, HEAD, normal/suffix/invalid byte ranges, rejected POST, missing files and rejected path traversal.
- npm audit: zero known vulnerabilities after dependency updates (including the development installation); production audit also passed.

Not verified: browser click-through tests, real audio decoding/playback, native folder picker behavior across browsers, mobile-device behavior, visual pixel equivalence, screen readers, or native-speaker review. No browser automation was performed. Recorded audio is not included; the original external narration pages and user-supplied recordings remain separate from the deliverable. No claim of an exact full-site clone is made.

To rerun checks after editing: `npm run build`, `npm test`, `npm run typecheck`, `npm run lint`. The HTTP server test requires an existing `out` build.
