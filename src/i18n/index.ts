import { dict, type DictKey, type Lang } from './dict';

// Language will come from the user profile in a later slice; until then we
// follow the browser, defaulting to Polish.
const lang: Lang = navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'pl';

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
