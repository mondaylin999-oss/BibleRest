'use client';
import { useEffect, useRef, useState } from 'react';
import { CopyPassage } from '../components/copy-passage';
import {
  books,
  bibleLanguages,
  isLang,
  verseLabel,
  containsVerse,
  type UiLang,
  location,
  step,
  audioSource,
  searchBible,
  readSetting,
  saveSetting,
  type Lang,
  type BibleBook,
  type Verse,
} from '../lib/bible';
type Page =
  | 'home'
  | 'bibles'
  | 'read'
  | 'audio'
  | 'verses'
  | 'resources'
  | 'search'
  | 'settings';
type Mark = {
  lang: Lang;
  book: number;
  chapter: number;
  verse: number;
  end?: number;
  text: string;
};
const words = {
  en: {
    home: 'Home',
    bibles: 'Bibles',
    read: 'Read',
    audio: 'Audio',
    verses: 'Verses',
    resources: 'Resources',
    search: 'Search',
    settings: 'Settings',
    title: 'The Holy Bible',
    choose: 'Choose your Bible language',
    en: 'English',
    my: 'မြန်မာ',
    ot: 'Old Testament',
    nt: 'New Testament',
    chapter: 'Chapter',
    book: 'Book',
    language: 'Bible language',
    interface: 'Interface language',
    today: 'Verse of the Day',
    start: 'Where should I start reading the Bible?',
    startLink: 'Start with the Gospel of John',
    listen: 'Listen to this chapter',
    localAudio: 'Choose a recording',
    audioHelp:
      'Press play to listen to the selected chapter. An internet connection is required, or you can choose your own recording.',
    audioMissing:
      'The recording could not be loaded. Check your connection and retry, or choose an audio file.',
    audioError:
      'This recording could not be played. Try another supported audio file.',
    auto: 'Play next chapter automatically',
    speed: 'Playback speed',
    previous: 'Previous',
    next: 'Next',
    copy: 'Copy',
    copied: 'Copied',
    bookmark: 'Bookmark',
    saved: 'Saved verses',
    empty: 'No saved verses yet.',
    remove: 'Remove',
    size: 'Text size',
    theme: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    loading: 'Loading Bible…',
    failed:
      'Could not load the Bible. Check that the project server is running and retry.',
    retry: 'Retry',
    query: 'Search Bible text',
    all: 'All books',
    results: 'results',
    noResults: 'No matching verses.',
    more: 'Show more',
    download: 'Download Bible text',
    print: 'Print / Save PDF',
    about: 'About this project',
    aboutText:
      'An English, Myanmar and Chin Bible reader for reading, listening and saving your favorite verses.',
    offline:
      'All three complete text Bibles are included. No account or database is required. Your preferences and saved verses stay in this browser.',
    audioNote:
      'Listen to English and Myanmar chapter recordings online, or import your own audio files for this session.',
    folder: 'Load an audio folder',
    folderHelp:
      'Folder layout: en/1/1.mp3 and my/1/1.mp3 (language / book number / chapter number). Imported files stay in this session; choose them again after reopening.',
    loaded: 'Recordings loaded',
    select: 'Select',
    clear: 'Clear saved verses',
    confirm: 'Remove all saved verses?',
    storage:
      'Browser storage is unavailable. Changes will last only for this session.',
    highlight: 'Selected verse',
    status: 'Ready',
    close: 'Close',
    topics: 'Verses by topic',
    faith: 'Faith',
    hope: 'Hope',
    love: 'Love',
    peace: 'Peace',
    comfort: 'Comfort',
    source: 'Text source',
    top: 'Back to top',
    repeat: 'Repeat chapter',
    audioResume: 'Press play to start the next recording.',
    downloadHint:
      'JSON text files can be downloaded for offline use. To make a PDF, open a chapter and choose Print / Save PDF.',
    version:
      'English: King James Version · Myanmar: Myanmar Bible · Chin Lutuv: Lutuv Bible',
    noLutuvAudio:
      'This Chin Bible is available as text. Audio is not included.',
    textNote: 'Translation note',
    savedAudio: 'Local recording',
    jump: 'Open chapter',
  },
  my: {
    home: 'ပင်မစာမျက်နှာ',
    bibles: 'သမ္မာကျမ်းစာ',
    read: 'ဖတ်ရန်',
    audio: 'အသံ',
    verses: 'ကျမ်းပိုဒ်များ',
    resources: 'အရင်းအမြစ်များ',
    search: 'ရှာဖွေရန်',
    settings: 'ဆက်တင်များ',
    title: 'သမ္မာကျမ်းစာ',
    choose: 'ကျမ်းစာဘာသာစကား ရွေးချယ်ပါ',
    en: 'English',
    my: 'မြန်မာ',
    ot: 'ဓမ္မဟောင်းကျမ်း',
    nt: 'ဓမ္မသစ်ကျမ်း',
    chapter: 'အခန်းကြီး',
    book: 'ကျမ်းစောင်',
    language: 'ကျမ်းစာဘာသာစကား',
    interface: 'မျက်နှာပြင်ဘာသာစကား',
    today: 'ယနေ့ကျမ်းပိုဒ်',
    start: 'ကျမ်းစာကို ဘယ်ကစဖတ်ရမလဲ။',
    startLink: 'ရှင်ယောဟန်ခရစ်ဝင်ကျမ်းမှ စဖတ်ပါ',
    listen: 'ဤအခန်းကို နားထောင်ရန်',
    localAudio: 'အသံဖိုင် ရွေးချယ်ရန်',
    audioHelp:
      'ရွေးချယ်ထားသောအခန်းကို နားထောင်ရန် ဖွင့်ခလုတ်ကို နှိပ်ပါ။ အင်တာနက်လိုအပ်ပါသည် သို့မဟုတ် ကိုယ်ပိုင်အသံဖိုင်ကို ရွေးချယ်နိုင်ပါသည်။',
    audioMissing:
      'အသံဖိုင်ကို ဖွင့်၍မရပါ။ အင်တာနက်ကို စစ်ဆေးပြီး ထပ်ကြိုးစားပါ သို့မဟုတ် အသံဖိုင် ရွေးချယ်ပါ။',
    audioError: 'အသံဖိုင်ကို ဖွင့်၍မရပါ။ အခြားအသံဖိုင်ကို ရွေးချယ်ပါ။',
    auto: 'နောက်အခန်းကို အလိုအလျောက်ဖွင့်ရန်',
    speed: 'အသံဖွင့်နှုန်း',
    previous: 'ရှေ့အခန်း',
    next: 'နောက်အခန်း',
    copy: 'ကူးယူရန်',
    copied: 'ကူးယူပြီးပါပြီ',
    bookmark: 'သိမ်းရန်',
    saved: 'သိမ်းထားသောကျမ်းပိုဒ်များ',
    empty: 'သိမ်းထားသောကျမ်းပိုဒ် မရှိသေးပါ။',
    remove: 'ဖယ်ရှားရန်',
    size: 'စာလုံးအရွယ်အစား',
    theme: 'ပုံပန်းသဏ္ဌာန်',
    light: 'အလင်း',
    dark: 'အမှောင်',
    loading: 'ကျမ်းစာကို ဖွင့်နေပါသည်…',
    failed: 'ကျမ်းစာကို ဖွင့်၍မရပါ။ ဆာဗာကိုစစ်ဆေးပြီး ထပ်မံကြိုးစားပါ။',
    retry: 'ထပ်မံကြိုးစားရန်',
    query: 'ကျမ်းစာထဲတွင် ရှာဖွေရန်',
    all: 'ကျမ်းစောင်အားလုံး',
    results: 'ရှာဖွေတွေ့ရှိချက်',
    noResults: 'ကိုက်ညီသောကျမ်းပိုဒ် မတွေ့ပါ။',
    more: 'ထပ်မံပြရန်',
    download: 'ကျမ်းစာစာသား ဒေါင်းလုဒ်ရန်',
    print: 'ပုံနှိပ်ရန် / PDF သိမ်းရန်',
    about: 'ဤပရောဂျက်အကြောင်း',
    aboutText:
      'ကျမ်းစာဖတ်ရန်၊ နားထောင်ရန်နှင့် နှစ်သက်သောကျမ်းပိုဒ်များကို သိမ်းရန် အင်္ဂလိပ်၊ မြန်မာနှင့် Chin Lutuv ကျမ်းစာဖတ်ရှုစနစ် ဖြစ်ပါသည်။',
    offline:
      'ကျမ်းစာစာသား သုံးဘာသာလုံး အပြည့်အစုံပါဝင်ပါသည်။ အကောင့်နှင့် ဒေတာဘေ့စ် မလိုပါ။ ဆက်တင်နှင့် သိမ်းထားသောကျမ်းပိုဒ်များကို ဤဘရောက်ဇာတွင်သာ သိမ်းပါသည်။',
    audioNote:
      'အင်္ဂလိပ်နှင့် မြန်မာအသံဖိုင်များကို အွန်လိုင်းတွင် နားထောင်ပါ သို့မဟုတ် ကိုယ်ပိုင်အသံဖိုင်များ ထည့်ပါ။',
    folder: 'အသံဖိုင်ဖိုလ်ဒါ ဖွင့်ရန်',
    folderHelp:
      'ဖိုလ်ဒါပုံစံ: en/1/1.mp3 နှင့် my/1/1.mp3 (ဘာသာ / ကျမ်းစောင်နံပါတ် / အခန်းနံပါတ်)။ ပြန်ဖွင့်သည့်အခါ ဖိုင်များကို ထပ်ရွေးရန်လိုပါသည်။',
    loaded: 'အသံဖိုင်များ ထည့်ပြီးပါပြီ',
    select: 'ရွေးချယ်ရန်',
    clear: 'သိမ်းထားသမျှ ဖျက်ရန်',
    confirm: 'သိမ်းထားသောကျမ်းပိုဒ်အားလုံး ဖျက်မလား။',
    storage: 'ဘရောက်ဇာတွင် သိမ်း၍မရပါ။ ပြောင်းလဲမှုများသည် ဤတစ်ကြိမ်အတွက်သာ ဖြစ်ပါမည်။',
    highlight: 'ရွေးချယ်ထားသောကျမ်းပိုဒ်',
    status: 'အဆင်သင့်',
    close: 'ပိတ်ရန်',
    topics: 'အကြောင်းအရာအလိုက် ကျမ်းပိုဒ်များ',
    faith: 'ယုံကြည်ခြင်း',
    hope: 'မျှော်လင့်ခြင်း',
    love: 'ချစ်ခြင်းမေတ္တာ',
    peace: 'ငြိမ်သက်ခြင်း',
    comfort: 'နှစ်သိမ့်ခြင်း',
    source: 'စာသားရင်းမြစ်',
    top: 'အပေါ်သို့',
    repeat: 'ဤအခန်းကို ထပ်ဖွင့်ရန်',
    audioResume: 'နောက်အသံဖိုင်ကို စတင်ရန် ဖွင့်ခလုတ်ကို နှိပ်ပါ။',
    downloadHint:
      'အော့ဖ်လိုင်းအသုံးပြုရန် JSON စာသားဖိုင်များကို ဒေါင်းလုဒ်နိုင်ပါသည်။ PDF အတွက် အခန်းတစ်ခန်းဖွင့်ပြီး ပုံနှိပ်ရန် / PDF သိမ်းရန်ကို ရွေးပါ။',
    version:
      'အင်္ဂလိပ်: King James Version · မြန်မာ: မြန်မာကျမ်းစာ · Chin Lutuv: Lutuv Bible',
    noLutuvAudio: 'Chin Lutuv ကို စာသားဖြင့် ဖတ်ရှုနိုင်ပါသည်။ အသံ မပါဝင်ပါ။',
    textNote: 'ဘာသာပြန်မှတ်ချက်',
    savedAudio: 'ထည့်ထားသောအသံဖိုင်',
    jump: 'အခန်းဖွင့်ရန်',
  },
};
const topicRefs = {
  faith: [
    [58, 11, 1],
    [45, 10, 17],
  ],
  hope: [
    [24, 29, 11],
    [45, 15, 13],
  ],
  love: [
    [43, 3, 16],
    [46, 13, 4],
    [62, 4, 8],
  ],
  peace: [
    [43, 14, 27],
    [50, 4, 7],
  ],
  comfort: [
    [19, 23, 1],
    [40, 11, 28],
  ],
};
const pages: Page[] = [
  'home',
  'bibles',
  'audio',
  'verses',
  'resources',
  'search',
  'settings',
];
const dailyRefs = [
  [43, 3, 16],
  [19, 23, 1],
  [20, 3, 5],
  [50, 4, 13],
  [19, 119, 105],
  [40, 5, 9],
  [43, 14, 27],
];
export default function Home() {
  const [ui, setUi] = useState<UiLang>('en'),
    [lang, setLang] = useState<Lang>('en'),
    [page, setPage] = useState<Page>('home'),
    [showChin, setShowChin] = useState(false),
    [book, setBook] = useState(1),
    [chapter, setChapter] = useState(1),
    [font, setFont] = useState(20),
    [dark, setDark] = useState(false),
    [data, setData] = useState<Partial<Record<Lang, BibleBook[]>>>({}),
    [error, setError] = useState(false),
    [retry, setRetry] = useState(0),
    [ready, setReady] = useState(false),
    [marks, setMarks] = useState<Mark[]>([]),
    [selected, setSelected] = useState(0),
    [notice, setNotice] = useState(''),
    [query, setQuery] = useState(''),
    [searchTerm, setSearchTerm] = useState(''),
    [filter, setFilter] = useState(0),
    [limit, setLimit] = useState(50),
    [rate, setRate] = useState(1),
    [auto, setAuto] = useState(true),
    [repeat, setRepeat] = useState(false),
    [audioVersion, setAudioVersion] = useState(0),
    [audioError, setAudioError] = useState(false);
  const audio = useRef<HTMLAudioElement>(null),
    sources = useRef(new Map<string, string>()),
    continueAudio = useRef(false);
  const w = words[ui],
    current = data[lang]?.[book - 1]?.chapters[chapter - 1],
    key = `${lang}/${book}/${chapter}`,
    src = sources.current.get(key) || audioSource(lang, book, chapter);
  useEffect(() => {
    const ownedSources = sources.current;
    const s = readSetting('settings', {
      ui: 'en',
      lang: 'en',
      font: 20,
      dark: false,
      book: 1,
      chapter: 1,
    });
    setUi(s.ui === 'my' ? 'my' : 'en');
    setLang(isLang(s.lang) ? s.lang : 'en');
    setFont(Math.max(16, Math.min(32, Number(s.font) || 20)));
    setDark(s.dark === true);
    const pos = location(s.book, s.chapter);
    setBook(pos.book);
    setChapter(pos.chapter);
    const saved = readSetting<Mark[]>('marks', []);
    setMarks(
      Array.isArray(saved)
        ? saved
            .filter(
              (m) =>
                m &&
                isLang(m.lang) &&
                Number.isInteger(m.book) &&
                m.book >= 1 &&
                m.book <= 66 &&
                Number.isInteger(m.chapter) &&
                m.chapter >= 1 &&
                m.chapter <= books[m.book - 1].chapters &&
                Number.isInteger(m.verse) &&
                m.verse > 0 &&
                typeof m.text === 'string',
            )
            .slice(0, 500)
        : [],
    );
    const sync = () => {
      const p = new URLSearchParams(window.location.hash.slice(1));
      if (p.has('page'))
        setPage(
          [...pages, 'read'].includes(p.get('page') as Page)
            ? (p.get('page') as Page)
            : 'home',
        );
      if (p.has('lang')) {
        const language = p.get('lang');
        setLang(isLang(language) ? language : 'en');
      }
      if (p.has('book')) {
        const l = location(Number(p.get('book')), Number(p.get('chapter')));
        setBook(l.book);
        setChapter(l.chapter);
      }
      setSelected(Math.max(0, Number(p.get('verse')) || 0));
    };
    sync();
    window.addEventListener('hashchange', sync);
    setReady(true);
    return () => {
      window.removeEventListener('hashchange', sync);
      for (const value of ownedSources.values()) URL.revokeObjectURL(value);
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = ui;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    if (!saveSetting('settings', { ui, lang, font, dark, book, chapter }))
      setNotice(words[ui].storage);
  }, [ui, lang, font, dark, book, chapter, ready]);
  useEffect(() => {
    if (ready && !saveSetting('marks', marks)) setNotice(words[ui].storage);
  }, [marks, ready, ui]);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    Promise.all(
      bibleLanguages.map(async (l) => {
        const response = await fetch(
          `${import.meta.env.BASE_URL}data/${l}.json`,
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) throw Error();
        const body = await response.json();
        setData((d) => ({ ...d, [l]: body }));
      }),
    ).catch((e) => {
      if (e.name !== 'AbortError') setError(true);
    });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    if (audio.current) audio.current.playbackRate = rate;
  }, [rate, src]);
  useEffect(() => {
    setAudioError(false);
    if (continueAudio.current && audio.current) {
      audio.current.preload = 'auto';
      audio.current.load();
    }
  }, [src, audioVersion]);
  useEffect(() => {
    if (selected && current) {
      requestAnimationFrame(() =>
        document
          .getElementById(
            `v${current.find((v) => containsVerse(v, selected))?.n ?? selected}`,
          )
          ?.scrollIntoView({ block: 'center' }),
      );
    }
  }, [selected, current, page]);
  function go(p: Page, b = book, c = chapter, l = lang, v = 0) {
    const pos = location(b, c);
    audio.current?.pause();
    continueAudio.current = false;
    setPage(p);
    setBook(pos.book);
    setChapter(pos.chapter);
    setLang(l);
    setSelected(v);
    window.location.hash = new URLSearchParams({
      page: p,
      lang: l,
      book: String(pos.book),
      chapter: String(pos.chapter),
      ...(v ? { verse: String(v) } : {}),
    }).toString();
    window.scrollTo({ top: 0 });
  }
  function move(d: number, play = false) {
    const next = step(book, chapter, d);
    if (next) {
      go(page, next.book, next.chapter);
      continueAudio.current = play;
    }
  }
  function save(v: Verse, l = lang) {
    const mark = {
      lang: l,
      book,
      chapter,
      verse: v.n,
      end: v.end,
      text: v.text || v.note || '',
    };
    setMarks((ms) =>
      ms.some(
        (m) =>
          m.lang === l &&
          m.book === book &&
          m.chapter === chapter &&
          m.verse === v.n,
      )
        ? ms.filter(
            (m) =>
              !(
                m.lang === l &&
                m.book === book &&
                m.chapter === chapter &&
                m.verse === v.n
              ),
          )
        : [...ms.slice(-499), mark],
    );
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(w.copied);
    } catch {
      setNotice(text);
    }
  }
  function ref(b: number, c: number, v?: number | string, l = lang) {
    return `${books[b - 1][l]} ${c}${v ? ':' + v : ''}`;
  }
  function importAudio(files: FileList | null, folder = false) {
    if (!files) return;
    let count = 0;
    for (const file of Array.from(files)) {
      if (!/\.(mp3|m4a|ogg|wav)$/i.test(file.name)) continue;
      let k = key;
      if (folder) {
        const m = file.webkitRelativePath.match(
          /(?:^|\/)(en|my)\/(\d+)\/(\d+)\.(mp3|m4a|ogg|wav)$/i,
        );
        if (!m) continue;
        const b = Number(m[2]),
          c = Number(m[3]);
        if (b < 1 || b > 66 || c < 1 || c > books[b - 1].chapters) continue;
        k = `${m[1].toLowerCase()}/${b}/${c}`;
      }
      const old = sources.current.get(k);
      if (old) URL.revokeObjectURL(old);
      sources.current.set(k, URL.createObjectURL(file));
      count++;
    }
    setAudioVersion((x) => x + 1);
    setNotice(`${w.loaded}: ${count}`);
  }
  const languages = (
    <label>
      {w.language}
      <select
        value={lang}
        onChange={(e) => go(page, book, chapter, e.target.value as Lang)}
      >
        <option value="en">English</option>
        <option value="my">မြန်မာ</option>
        <option value="clt">Chin (Lutuv)</option>
        <option value="cnh">Chin (Hakha)</option>
      </select>
    </label>
  );
  const controls = (
    <div className="selectors">
      {languages}
      <label>
        {w.book}
        <select
          value={book}
          onChange={(e) => go(page, Number(e.target.value), 1)}
        >
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b[lang]}
            </option>
          ))}
        </select>
      </label>
      <label>
        {w.chapter}
        <select
          value={chapter}
          onChange={(e) => go(page, book, Number(e.target.value))}
        >
          {Array.from({ length: books[book - 1].chapters }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
  const player =
    lang === 'clt' ? (
      page === 'audio' ? (
        <p>{w.noLutuvAudio}</p>
      ) : null
    ) : (
      <section className="audio-panel" aria-label={w.audio}>
        <h3>
          {w.listen} — {ref(book, chapter)}
        </h3>
        <audio
          key={`${key}:${audioVersion}`}
          ref={audio}
          controls
          preload="none"
          src={src}
          loop={repeat}
          onError={() => {
            setAudioError(true);
            continueAudio.current = false;
          }}
          onCanPlay={() => {
            if (continueAudio.current) {
              continueAudio.current = false;
              audio.current?.play().catch(() => setNotice(w.audioResume));
            }
          }}
          onEnded={() => {
            if (auto && !repeat) move(1, true);
          }}
          onLoadedMetadata={() => {
            if (audio.current) audio.current.playbackRate = rate;
          }}
        />
        {audioError && (
          <div role="alert">
            <p>{sources.current.has(key) ? w.audioError : w.audioMissing}</p>
            <button
              onClick={() => {
                setAudioError(false);
                audio.current?.load();
                audio.current?.play().catch(() => setAudioError(true));
              }}
            >
              {w.retry}
            </button>
          </div>
        )}
        <div className="audio-options">
          <label>
            {w.speed}
            <select
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((n) => (
                <option key={n} value={n}>
                  {n}×
                </option>
              ))}
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={auto}
              onChange={(e) => setAuto(e.target.checked)}
            />
            {w.auto}
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
            />
            {w.repeat}
          </label>
        </div>
        <div className="row">
          <label className="file-button">
            {w.localAudio}
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => importAudio(e.target.files)}
            />
          </label>
        </div>
        <p className="muted small">{w.audioHelp}</p>
      </section>
    );
  function verse(v: Verse, l = lang) {
    return (
      <div
        className={`verse ${containsVerse(v, selected) ? 'selected' : ''}`}
        key={v.n}
        id={l === lang ? `v${v.n}` : undefined}
        lang={l}
      >
        <button
          className="verse-number"
          aria-label={`${w.select} ${verseLabel(v)}`}
          onClick={() => setSelected(v.n)}
        >
          {verseLabel(v)}
        </button>
        <span>
          {v.text || (
            <em className="muted">
              {w.textNote}: {v.note}
            </em>
          )}
        </span>
        {containsVerse(v, selected) && (
          <div className="verse-tools">
            <button
              onClick={() =>
                copy(
                  `${ref(book, chapter, verseLabel(v), l)} — ${v.text || v.note}`,
                )
              }
            >
              {w.copy}
            </button>
            <button onClick={() => save(v, l)}>
              {marks.some(
                (m) =>
                  m.lang === l &&
                  m.book === book &&
                  m.chapter === chapter &&
                  m.verse === v.n,
              )
                ? '★'
                : '☆'}{' '}
              {w.bookmark}
            </button>
          </div>
        )}
      </div>
    );
  }
  function bookList(target: Page) {
    return (
      <div className="testaments">
        {[0, 1].map((test) => (
          <section key={test}>
            <h2>{test ? w.nt : w.ot}</h2>
            <ul className="book-list">
              {books.slice(test ? 39 : 0, test ? 66 : 39).map((b) => (
                <li key={b.id}>
                  <a
                    href={`#page=${target}&lang=${lang}&book=${b.id}&chapter=1`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(target, b.id, 1);
                    }}
                  >
                    {b[lang]}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }
  const daily = dailyRefs[Math.floor(Date.now() / 86400000) % dailyRefs.length];
  const dailyVerse = data[lang]?.[daily[0] - 1]?.chapters[daily[1] - 1]?.find(
    (v) => containsVerse(v, daily[2]),
  );
  const matches = data[lang]
    ? searchBible(data[lang]!, searchTerm, filter)
    : [];
  return (
    <>
      <a className="skip" href="#main">
        {w.read}
      </a>
      <header>
        <div className="wrap brand">
          <a
            href="#page=home"
            onClick={(e) => {
              e.preventDefault();
              go('home');
            }}
          >
            <strong>
              Bible<span>Rest</span>
            </strong>
          </a>
        </div>
      </header>
      <nav aria-label={w.home}>
        <div className="wrap navlinks">
          {pages.map((p) => (
            <a
              key={p}
              href={`#page=${p}&lang=${lang}&book=${book}&chapter=${chapter}`}
              aria-current={page === p ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(p);
              }}
            >
              {w[p]}
            </a>
          ))}
        </div>
      </nav>
      <main id="main" className="wrap">
        <div className="toolbar">
          <div>
            <button className="text-link" onClick={() => go('home')}>
              {w.home}
            </button>
            {page !== 'home' && <> / {w[page]}</>}
          </div>
          <div className="row">
            <button
              title={w.theme}
              aria-label={w.theme}
              onClick={() => setDark(!dark)}
            >
              {dark ? '☀' : '☾'}
            </button>
            <button
              aria-label={`${w.size} −`}
              disabled={font <= 16}
              onClick={() => setFont((f) => f - 2)}
            >
              A−
            </button>
            <button
              aria-label={`${w.size} +`}
              disabled={font >= 32}
              onClick={() => setFont((f) => f + 2)}
            >
              A+
            </button>
          </div>
        </div>
        {notice && (
          <output className="notice">
            <span>{notice}</span>
            <button onClick={() => setNotice('')} aria-label={w.close}>
              ×
            </button>
          </output>
        )}
        {error ? (
          <div role="alert">
            <p>{w.failed}</p>
            <button onClick={() => setRetry((n) => n + 1)}>{w.retry}</button>
          </div>
        ) : (
          !data[lang] && <output>{w.loading}</output>
        )}
        {page === 'home' && (
          <>
            <h2>{w.today}</h2>
            <section className="daily">
              <p className="muted small">
                {new Intl.DateTimeFormat(ui === 'my' ? 'my-MM' : 'en-GB', {
                  dateStyle: 'full',
                  timeZone: 'UTC',
                }).format(new Date())}
              </p>
              <blockquote lang={lang}>
                {dailyVerse?.text || w.loading}
              </blockquote>
              <a
                href={`#page=read&lang=${lang}&book=${daily[0]}&chapter=${daily[1]}&verse=${daily[2]}`}
                onClick={(e) => {
                  e.preventDefault();
                  go('read', daily[0], daily[1], lang, daily[2]);
                }}
              >
                {ref(daily[0], daily[1], daily[2])}
              </a>
              <p>
                <button
                  onClick={() =>
                    copy(
                      `${ref(daily[0], daily[1], daily[2])} — ${dailyVerse?.text || ''}`,
                    )
                  }
                  disabled={!dailyVerse}
                >
                  {w.copy}
                </button>
              </p>
            </section>
            {lang !== 'clt' && (
              <>
                <h2>{w.audio}</h2>
                <p>{w.audioHelp}</p>
                <button onClick={() => go('audio')}>{w.listen} →</button>
              </>
            )}
            <aside className="start">
              <h3>{w.start}</h3>
              <a
                href="#page=read&book=43&chapter=1"
                onClick={(e) => {
                  e.preventDefault();
                  go('read', 43, 1);
                }}
              >
                {w.startLink} →
              </a>
            </aside>
            <h1>{w.bibles}</h1>
            <p>{w.choose}</p>
            <div className="language-cards">
              <button onClick={() => go('bibles', 1, 1, 'en')}>
                The Holy Bible <small>English · King James Version</small>
              </button>
              <button lang="my" onClick={() => go('bibles', 1, 1, 'my')}>
                မြန်မာသမ္မာကျမ်းစာ <small>မြန်မာ · Myanmar</small>
              </button>
              <button onClick={() => setShowChin((open) => !open)}>
                Chin <small>Choose Lutuv or Hakha</small>
              </button>
            </div>
            {showChin && (
              <div className="chin-choices" aria-label="Chin language">
                <button onClick={() => go('bibles', 1, 1, 'clt')}>
                  Lutuv →
                </button>
                <button onClick={() => go('bibles', 1, 1, 'cnh')}>
                  Hakha →
                </button>
              </div>
            )}
            <h2>{w.resources}</h2>
            <p>{w.offline}</p>
            <button onClick={() => go('resources')}>{w.download} →</button>
          </>
        )}
        {page === 'bibles' && (
          <>
            <h1>
              {lang === 'clt'
                ? 'Chin Bible — Lutuv'
                : lang === 'my'
                  ? 'မြန်မာသမ္မာကျမ်းစာ'
                  : 'The Holy Bible — KJV'}
            </h1>
            {languages}
            {bookList('read')}
          </>
        )}
        {(page === 'read' || page === 'audio') && (
          <>
            {page === 'read' && (
              <CopyPassage
                key={`${lang}/${book}/${chapter}`}
                bible={data[lang]?.[book - 1]}
                title={books[book - 1][lang]}
                chapter={chapter}
                ui={ui}
              />
            )}
            <h1>{page === 'audio' ? w.audio : books[book - 1][lang]}</h1>
            {controls}
            {player}
            <div className="chapter-grid" aria-label={w.chapter}>
              {Array.from({ length: books[book - 1].chapters }, (_, i) => (
                <button
                  key={i}
                  aria-current={chapter === i + 1 ? 'page' : undefined}
                  onClick={() => go(page, book, i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="reading-header">
              <h2>{ref(book, chapter)}</h2>
              <button onClick={() => window.print()}>{w.print}</button>
            </div>
            <article className="scripture" style={{ fontSize: font }}>
              {current?.map((v) => verse(v))}
            </article>
            <div className="chapter-nav">
              <button
                disabled={!step(book, chapter, -1)}
                onClick={() => move(-1)}
              >
                ← {w.previous}
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                {w.top} ↑
              </button>
              <button
                disabled={!step(book, chapter, 1)}
                onClick={() => move(1)}
              >
                {w.next} →
              </button>
            </div>
            {page === 'audio' && bookList('audio')}
          </>
        )}
        {page === 'search' && (
          <>
            <h1>{w.search}</h1>
            {languages}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchTerm(query);
                setLimit(50);
              }}
              className="search-form"
            >
              <label>
                {w.query}
                <input
                  required
                  maxLength={200}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label>
                {w.book}
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(Number(e.target.value));
                    setLimit(50);
                  }}
                >
                  <option value={0}>{w.all}</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b[lang]}
                    </option>
                  ))}
                </select>
              </label>
              <button className="primary" type="submit">
                {w.search}
              </button>
            </form>
            {searchTerm && (
              <output>
                {matches.length} {w.results} — “{searchTerm}”
              </output>
            )}
            {searchTerm && !matches.length && <p>{w.noResults}</p>}
            {matches.slice(0, limit).map((m) => (
              <section
                className="result"
                key={`${m.book}:${m.chapter}:${m.verse.n}`}
              >
                <a
                  href={`#page=read&lang=${lang}&book=${m.book}&chapter=${m.chapter}&verse=${m.verse.n}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go('read', m.book, m.chapter, lang, m.verse.n);
                  }}
                >
                  {ref(m.book, m.chapter, verseLabel(m.verse))}
                </a>
                <p lang={lang}>{m.verse.text}</p>
              </section>
            ))}
            {matches.length > limit && (
              <button onClick={() => setLimit((l) => l + 50)}>{w.more}</button>
            )}
          </>
        )}
        {page === 'verses' && (
          <>
            <h1>{w.topics}</h1>
            {languages}
            <div className="topics">
              {Object.entries(topicRefs).map(([topic, refs]) => (
                <section key={topic}>
                  <h2>{w[topic as keyof typeof topicRefs]}</h2>
                  {refs.map(([b, c, n]) => (
                    <div key={`${b}:${c}:${n}`}>
                      <a
                        href={`#page=read&lang=${lang}&book=${b}&chapter=${c}&verse=${n}`}
                        onClick={(e) => {
                          e.preventDefault();
                          go('read', b, c, lang, n);
                        }}
                      >
                        {ref(b, c, n)}
                      </a>
                      <p lang={lang}>
                        {
                          data[lang]?.[b - 1].chapters[c - 1].find((v) =>
                            containsVerse(v, n),
                          )?.text
                        }
                      </p>
                    </div>
                  ))}
                </section>
              ))}
            </div>
            <h2>{w.saved}</h2>
            {!marks.length && <p>{w.empty}</p>}
            {marks.map((m) => (
              <section
                className="result"
                key={`${m.lang}:${m.book}:${m.chapter}:${m.verse}`}
              >
                <a
                  href={`#page=read&lang=${m.lang}&book=${m.book}&chapter=${m.chapter}&verse=${m.verse}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go('read', m.book, m.chapter, m.lang, m.verse);
                  }}
                >
                  {ref(
                    m.book,
                    m.chapter,
                    m.end ? `${m.verse}–${m.end}` : m.verse,
                    m.lang,
                  )}
                </a>
                <p lang={m.lang}>{m.text}</p>
                <button
                  onClick={() => setMarks((ms) => ms.filter((x) => x !== m))}
                >
                  {w.remove}
                </button>
              </section>
            ))}
          </>
        )}
        {page === 'resources' && (
          <>
            <h1>{w.resources}</h1>
            <h2>{w.download}</h2>
            <p>{w.downloadHint}</p>
            <div className="row">
              <a
                className="button"
                href={`${import.meta.env.BASE_URL}data/en.json`}
                download="english-kjv.json"
              >
                English ↓
              </a>
              <a
                className="button"
                href={`${import.meta.env.BASE_URL}data/my.json`}
                download="myanmar-bible.json"
              >
                မြန်မာ ↓
              </a>
              <a
                className="button"
                href={`${import.meta.env.BASE_URL}data/clt.json`}
                download="chin-lutuv-bible.json"
              >
                Chin Lutuv ↓
              </a>
            </div>
            <h2>{w.audio}</h2>
            <p>{w.audioNote}</p>

            <label className="file-button">
              {w.folder}
              <input
                type="file"
                multiple
                accept="audio/*"
                {...({ webkitdirectory: '' } as Record<string, string>)}
                onChange={(e) => importAudio(e.target.files, true)}
              />
            </label>
            <p>{w.folderHelp}</p>
            <h2>{w.about}</h2>
            <p>{w.aboutText}</p>
            <p>{w.offline}</p>
            <p>{w.version}</p>
          </>
        )}
        {page === 'settings' && (
          <>
            <h1>{w.settings}</h1>
            <div className="settings">
              <label>
                {w.interface}
                <select
                  value={ui}
                  onChange={(e) => setUi(e.target.value as UiLang)}
                >
                  <option value="en">English</option>
                  <option value="my">မြန်မာ</option>
                </select>
              </label>
              {languages}
              <label>
                {w.theme}
                <select
                  value={dark ? 'dark' : 'light'}
                  onChange={(e) => setDark(e.target.value === 'dark')}
                >
                  <option value="light">{w.light}</option>
                  <option value="dark">{w.dark}</option>
                </select>
              </label>
              <label>
                {w.size}: {font}px
                <input
                  type="range"
                  min="16"
                  max="32"
                  step="2"
                  value={font}
                  onChange={(e) => setFont(Number(e.target.value))}
                />
              </label>
              <button
                onClick={() => {
                  if (window.confirm(w.confirm)) setMarks([]);
                }}
              >
                {w.clear}
              </button>
            </div>
            <p>{w.offline}</p>
          </>
        )}
      </main>
      <footer>
        <div className="wrap">
          <p>{w.aboutText}</p>
          <button className="text-link" onClick={() => go('resources')}>
            {w.resources}
          </button>{' '}
          ·{' '}
          <button className="text-link" onClick={() => go('settings')}>
            {w.settings}
          </button>
        </div>
      </footer>
    </>
  );
}
