export type Lang = 'pl' | 'en';

export const dict = {
  pl: {
    nav_mapa: 'Mapa',
    nav_dziennik: 'Dziennik',
    dodaj_wpis: 'Dodaj wpis',
    mapa_aria: 'Mapa podróży',
  },
  en: {
    nav_mapa: 'Map',
    nav_dziennik: 'Journal',
    dodaj_wpis: 'Add entry',
    mapa_aria: 'Travel map',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type DictKey = keyof (typeof dict)['pl'];
