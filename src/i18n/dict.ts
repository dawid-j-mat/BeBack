export type Lang = 'pl' | 'en';

export const dict = {
  pl: {
    nav_mapa: 'Mapa',
    nav_dziennik: 'Dziennik',
    dodaj_wpis: 'Dodaj wpis',
    mapa_aria: 'Mapa podróży',
    login_email_ph: 'Twój e-mail',
    login_wyslij: 'Wyślij link',
    login_wysylanie: 'Wysyłanie…',
    login_wyslano: 'Link poleciał – sprawdź pocztę',
    login_blad: 'Nie udało się wysłać linku – sprawdź adres',
    login_link_wygasl: 'Link wygasł albo był już użyty – wyślij nowy',
    wyloguj_pytanie: 'Wylogować?',
  },
  en: {
    nav_mapa: 'Map',
    nav_dziennik: 'Journal',
    dodaj_wpis: 'Add entry',
    mapa_aria: 'Travel map',
    login_email_ph: 'Your e-mail',
    login_wyslij: 'Send link',
    login_wysylanie: 'Sending…',
    login_wyslano: 'Link is on its way – check your inbox',
    login_blad: 'Could not send the link – check the address',
    login_link_wygasl: 'The link expired or was already used – send a new one',
    wyloguj_pytanie: 'Sign out?',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type DictKey = keyof (typeof dict)['pl'];
