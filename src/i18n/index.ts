import { dict, type DictKey, type Lang } from './dict';

// Language will come from the user profile in slice 2; until then we
// follow the browser, defaulting to Polish.
const lang: Lang = navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'pl';

export function t(key: DictKey): string {
  return dict[lang][key];
}

export function currentLang(): Lang {
  return lang;
}
