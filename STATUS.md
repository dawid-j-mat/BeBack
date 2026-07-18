# BeBack – stan prac (przekazanie między sesjami)

> Aktualizowany na koniec każdej sesji. Nowa sesja: przeczytaj CLAUDE.md,
> SPEC.md, DESIGN.md, DECISIONS.md, potem ten plik.

## Zrobione (sesja 1, lipiec 2026)

- **Plaster 1** – szkielet: Vite + React + TypeScript (D-17), PWA (manifest,
  ikony, service worker autoUpdate), muszla apki wg prototypu, mapa MapLibre
  z papierowym stylem (`src/map/paperStyle.ts`) na kafelkach OpenFreeMap (D-18);
  woda w gotowym spłowiałym błękicie (D-19).
- **Plaster 2** – Supabase: schemat + RLS (`supabase/schema.sql`), notatki
  prywatne w osobnej tabeli (D-20), test RLS (`supabase/rls_check.sql` – PASS
  u Dawida), logowanie magic linkiem (`src/auth/`), podpis użytkownika
  w nagłówku + wylogowanie dotknięciem (D-21). Konta: 2, rejestracja zamknięta.
- **Plaster 3** – dodawanie wpisu: 4 kroki (`src/add/`), Google Places New
  przez REST (D-22, `src/lib/places.ts`), GPS (`src/lib/geolocation.ts`,
  mapa centruje się na pozycji), miejsce ręczne „Dodaj miejsce, w którym jestem"
  (D-24), pieczątka SVG (`src/components/Stamp.tsx`) + animacja przybicia,
  zapis do `places`/`entries`. Nawigacja stanem, bez routera (D-23).

## Środowiska

- **Produkcja**: https://be-back-blond.vercel.app (Vercel buduje `main`;
  zmienne env ustawiane w panelu Vercela, po zmianie potrzebny redeploy
  bez build cache).
- **Supabase**: projekt `gxselkwmibgvvgjumslc` (region EU); konfiguracja
  w `supabase/SETUP.md`.
- **Zmienne env** (`.env.example`): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
  VITE_GOOGLE_PLACES_KEY (instrukcja: `docs/google-places.md`).
- Praca przebiega przez PR-y na gałęzi roboczej → merge do `main` → autodeploy.

## Znane sprawy / backlog techniczny

- Wbudowana poczta Supabase: limit 2 maile logowania/h – docelowo własny SMTP
  (np. Resend, darmowy próg).
- Aktualizacja PWA wymaga zamknięcia kart apki (autoUpdate podmienia wersję
  przy kolejnym wejściu); w plastrze 7 dodać sygnał „jest nowa wersja".
- Placeholder zdjęcia w kroku 4 ma tekst tymczasowy („Dojdzie w kolejnej
  wersji") – zniknie w plastrze 6; pilnować zasady zera didaskaliów.
- Etykiety mapy w Noto Sans (glyphy OpenFreeMap); Domine/Karla wymagałyby
  własnego hostingu glyphów – rozważyć w plastrze 8.
- Bundle ~1,2 MB (335 KB gzip; głównie MapLibre) – rozważyć code-splitting
  przy plastrze 7.

## Następny krok: plaster 4 (nowa sesja)

Mapa wpisów: pinezki-szpilki w kolorach werdyktów (wzór SVG w prototypie),
złoty asterysk WOW przy główce (D-13), karta wpisu jako arkusz od dołu (taśma,
stempel, narożniki foto), klastrowanie (supercluster lub wbudowane w MapLibre),
filtr „Wszystko / Tylko Wrócę". Dane: `entries` + `places` z Supabase (RLS już
gotowy; notatka prywatna z `private_notes` tylko autora). Komponent `Stamp`
i format daty (`formatVisitDate`) do ponownego użycia.

## Stan odbioru

Plastry 1–2 odebrane przez Dawida na produkcji. Plaster 3 czeka na odbiór:
wymaga klucza Google Places (docs/google-places.md) w Vercelu i `.env.local`.
