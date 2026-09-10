import { useState, type FormEvent } from 'react';
import { type BibleBook, type UiLang } from '../lib/bible';
import { copyPassage, type PassageRange } from '../lib/copy-passage';

const labels = {
  en: {
    heading: 'Copy a passage',
    title: 'Title',
    startChapter: 'Start chapter',
    endChapter: 'End chapter',
    startVerse: 'Start verse',
    endVerse: 'End verse',
    confirm: 'Confirm',
    copy: 'Copy',
    copied: 'Copied',
    help: 'Leave both verse fields as NONE for whole chapters. A start verse alone copies that verse; an end chapter with no end verse includes the rest of that chapter.',
    chapter: 'Enter chapter numbers within this book.',
    verse: 'Enter verse numbers that exist in the selected chapters.',
    order: 'The end must come after or equal the start.',
    empty: 'This selection has no verse text to copy.',
    failed: 'Could not copy. Check clipboard permission and press Copy again.',
  },
  my: {
    heading: 'ကျမ်းပိုဒ်များ ကူးယူရန်',
    title: 'ကျမ်းစောင်',
    startChapter: 'အစအခန်း',
    endChapter: 'အဆုံးအခန်း',
    startVerse: 'အစကျမ်းပိုဒ်',
    endVerse: 'အဆုံးကျမ်းပိုဒ်',
    confirm: 'အတည်ပြုရန်',
    copy: 'ကူးယူရန်',
    copied: 'ကူးယူပြီးပါပြီ',
    help: 'အခန်းအပြည့် ကူးယူရန် ကျမ်းပိုဒ်နှစ်ကွက်လုံးကို NONE ထားပါ။ အစကျမ်းပိုဒ်တစ်ခုသာ ရွေးလျှင် ထိုကျမ်းပိုဒ်ကို ကူးယူပါမည်။ အဆုံးအခန်းရွေးပြီး အဆုံးကျမ်းပိုဒ်ကို NONE ထားလျှင် ထိုအခန်းအဆုံးအထိ ပါဝင်ပါမည်။',
    chapter: 'ဤကျမ်းစောင်အတွင်းရှိ အခန်းနံပါတ်ကို ထည့်ပါ။',
    verse: 'ရွေးထားသောအခန်းတွင်ရှိသည့် ကျမ်းပိုဒ်နံပါတ်ကို ထည့်ပါ။',
    order: 'အဆုံးသည် အစနှင့်တူရမည် သို့မဟုတ် အစထက်နောက်ကျရမည်။',
    empty: 'ဤရွေးချယ်မှုတွင် ကူးယူရန် ကျမ်းစာသားမရှိပါ။',
    failed: 'ကူးယူ၍မရပါ။ ဘရောက်ဇာ၏ ကူးယူခွင့်ကို စစ်ဆေးပြီး ထပ်ကြိုးစားပါ။',
  },
};

export function CopyPassage({
  bible,
  title,
  chapter,
  ui,
}: {
  bible?: BibleBook;
  title: string;
  chapter: number;
  ui: UiLang;
}) {
  const w = labels[ui];
  const [values, setValues] = useState({
    startChapter: String(chapter),
    endChapter: '',
    startVerse: '',
    endVerse: '',
  });
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  function change(field: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setConfirmed(null);
    setMessage('');
    setError(false);
  }
  function confirm(event: FormEvent) {
    event.preventDefault();
    if (!bible) return;
    setConfirmed(null);
    setMessage('');
    try {
      const range: PassageRange = {
        startChapter: Number(values.startChapter),
        endChapter: values.endChapter === '' ? null : Number(values.endChapter),
        startVerse: values.startVerse === '' ? null : Number(values.startVerse),
        endVerse: values.endVerse === '' ? null : Number(values.endVerse),
      };
      setConfirmed(copyPassage(bible, title, range));
      setError(false);
    } catch (reason) {
      const code = reason instanceof Error ? reason.message : 'verse';
      setMessage(w[code as 'chapter' | 'verse' | 'order' | 'empty'] ?? w.verse);
      setError(true);
    }
  }
  async function copy() {
    if (confirmed === null) return;
    try {
      await navigator.clipboard.writeText(confirmed);
      setMessage(w.copied);
      setError(false);
    } catch {
      setMessage(w.failed);
      setError(true);
    }
  }
  return (
    <section className="passage-copy" aria-label={w.heading}>
      <h2>{w.heading}</h2>
      <form onSubmit={confirm}>
        <div className="passage-fields">
          <label>
            {w.title}
            <input value={title} readOnly aria-readonly="true" />
          </label>
          <label>
            {w.startChapter}
            <input
              type="number"
              min="1"
              max={bible?.chapters.length}
              required
              value={values.startChapter}
              onChange={(e) => change('startChapter', e.target.value)}
            />
          </label>
          <label>
            {w.endChapter}
            <input
              type="number"
              min="1"
              max={bible?.chapters.length}
              placeholder="NONE"
              value={values.endChapter}
              onChange={(e) => change('endChapter', e.target.value)}
            />
          </label>
          <label>
            {w.startVerse}
            <input
              type="number"
              min="1"
              placeholder="NONE"
              value={values.startVerse}
              onChange={(e) => change('startVerse', e.target.value)}
            />
          </label>
          <label>
            {w.endVerse}
            <input
              type="number"
              min="1"
              placeholder="NONE"
              value={values.endVerse}
              onChange={(e) => change('endVerse', e.target.value)}
            />
          </label>
        </div>
        <p className="muted small">{w.help}</p>
        <div className="row">
          {confirmed === null ? (
            <button type="submit" disabled={!bible}>
              {w.confirm}
            </button>
          ) : (
            <button className="primary" type="button" onClick={copy}>
              {w.copy}
            </button>
          )}
          {message && <span role={error ? 'alert' : 'status'}>{message}</span>}
        </div>
      </form>
    </section>
  );
}
