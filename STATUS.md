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

## Zrobione (sesja 2, lipiec 2026)

- **Darmowy dostawca miejsc** (D-25) – `src/lib/places/` rozbite na źródła:
  `google.ts` (jak dotąd), `osm.ts` (Overpass API dla „W pobliżu", Photon dla
  wyszukiwarki – oba bez klucza i bez opłat), `index.ts` jako fasada. Google
  pozostaje głównym; OSM wchodzi automatycznie przy błędzie Google lub braku
  klucza; `VITE_PLACES_PROVIDER=google|osm` wymusza źródło. Miejsca z OSM
  deduplikowane po nowej kolumnie `places.osm_id`.
- **Plaster 4** – mapa wpisów: pobieranie wpisów z dołączonym miejscem, autorem
  i notatką prywatną (`src/lib/entries.ts`; RLS sam ucina cudze notatki),
  szpilki w kolorach werdyktów ze złotą nalepką WOW i klastry (przerywane kółko
  + liczba + miasto) jako markery DOM liczone superclusterem (D-26,
  `src/map/entryMarkers.ts`), jedna pinezka na miejsce z przełączanymi wpisami
  w karcie (D-27), karta wpisu jako strona dziennika (`src/components/
  EntryCard.tsx` – taśma, stempel, notatka prywatna, podpis autora), filtr
  „Wszystko / Tylko Wrócę", świeżo przybity wpis pulsuje i przyciąga mapę.
  Współdzielone kolory werdyktów w `src/lib/verdicts.ts`.

## Środowiska

- **Produkcja**: https://be-back-blond.vercel.app (Vercel buduje `main`;
  zmienne env ustawiane w panelu Vercela, po zmianie potrzebny redeploy
  bez build cache).
- **Supabase**: projekt `gxselkwmibgvvgjumslc` (region EU); konfiguracja
  w `supabase/SETUP.md`.
- **Zmienne env** (`.env.example`): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
  VITE_GOOGLE_PLACES_KEY (instrukcja: `docs/google-places.md`), opcjonalnie
  VITE_PLACES_PROVIDER (google|osm; puste = automatyka z D-25).
- Praca przebiega przez PR-y na gałęzi roboczej → merge do `main` → autodeploy.

## Do zrobienia ręcznie przed odbiorem plastra 4

1. **Migracja bazy**: w Supabase SQL Editor uruchomić
   `supabase/migrations/2026-07_plaster4_osm_id.sql` (dodaje kolumnę
   `places.osm_id`; bez niej zapis miejsca znalezionego przez OSM się nie uda).
2. (Opcjonalnie) przetestować darmowe źródło: otworzyć apkę z `?places=osm`
   w adresie (D-28) i porównać wyniki „W pobliżu" z Google; `?places=auto`
   przywraca automatykę.

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
- Publiczne serwery Overpass/Photon bywają obciążone – zapytania mają timeout
  6 s; gdyby to przeszkadzało w praktyce, rozważyć mirror Overpass
  (kumi.systems) jako drugi adres.
- DESIGN §2 wymienia „filtr nieaktywny" wśród elementów z przerywaną ramką,
  ale prototyp rysuje filtr ciągłą – zrobione wg prototypu (źródło prawdy);
  wyjaśnić z Dawidem przy szlifie w plastrze 8.

## Następny krok: plaster 5 (nowa sesja)

Dziennik: chronologiczna lista wpisów grupowana miesiącami z mini-stemplami
i znacznikiem WOW (`useEntries` z `src/lib/entries.ts` już zwraca komplet
danych) + edycja wpisu, w tym oznaczanie zmiany werdyktu (`verdict_changed`).
Feedback Dawida z odbioru plastra 4 – do ujęcia w edycji: **usuwanie własnego
wpisu** (polityka RLS „delete own" już jest w bazie, brakuje tylko UI)
i **dodawanie/edycja notatki prywatnej** (tabela `private_notes` gotowa od
plastra 2; przepływ dodawania jej nie zbiera – edycja to naturalne miejsce).
Do ponownego użycia: `Stamp`, `formatVisitDate`, karta wpisu (`EntryCard`).

## Stan odbioru

Plastry 1–2 odebrane przez Dawida na produkcji. Plaster 3 czeka na odbiór:
wymaga klucza Google Places (docs/google-places.md) w Vercelu i `.env.local`.
Plaster 4 czeka na odbiór: wymaga migracji `osm_id` (punkt wyżej); weryfikacja
wizualna zrobiona na danych zaślepkowych w Chromium (pinezki, klastry, karta,
filtr, RLS notatki po stronie UI) – realne dane sprawdzi Dawid na preview.
