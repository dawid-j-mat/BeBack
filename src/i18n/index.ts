import { dict, type DictKey, type Lang } from './dict';

export type { Lang };

// The language starts from the device copy (so the app opens in the right
// language even offline), falls back to the browser and is overridden by
// the profile after sign-in (SPEC §3.6). Callers re-render via App state -
// this module only holds the current value.
const LANG_KEY = 'beback:lang';

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'pl' || stored === 'en') return stored;
  } catch {
    // no storage - fall through to the browser language
  }
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'pl';
}

let lang: Lang = initialLang();

export function setLang(next: Lang): void {
  lang = next;
  document.documentElement.lang = next;
  try {
    localStorage.setItem(LANG_KEY, next);
  } catch {
    // best-effort device copy
  }
}

export function t(key: DictKey): string {
  return dict[lang][key];
}

export function currentLang(): Lang {
  return lang;
}

const MONTHS_PL = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];
const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// "2 lipca 2026" / "2 Jul 2026" – the handwritten date format of the journal.
export function formatVisitDate(date: Date): string {
  const months = lang === 'pl' ? MONTHS_PL : MONTHS_EN;
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Polish month headers need the nominative case ("Lipiec"), unlike the
// genitive used inside a full date ("2 lipca").
const MONTHS_PL_NOM = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];
const MONTHS_EN_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// "Lipiec 2026" / "July 2026" – journal month headers.
export function formatMonthTitle(year: number, monthIndex: number): string {
  const months = lang === 'pl' ? MONTHS_PL_NOM : MONTHS_EN_FULL;
  return `${months[monthIndex]} ${year}`;
}

// "2 lip" / "2 Jul" – the short date in a journal row.
export function formatShortDate(date: Date): string {
  const month =
    lang === 'pl' ? MONTHS_PL[date.getMonth()].slice(0, 3) : MONTHS_EN[date.getMonth()];
  return `${date.getDate()} ${month}`;
}

// "1 wpis / 2 wpisy / 14 wpisów" – Polish plurals need all three forms.
export function formatEntryCount(n: number): string {
  if (lang === 'en') return `${n} ${n === 1 ? 'entry' : 'entries'}`;
  if (n === 1) return '1 wpis';
  const last = n % 10;
  const lastTwo = n % 100;
  const few = last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14);
  return `${n} ${few ? 'wpisy' : 'wpisów'}`;
}
