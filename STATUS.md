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

## Zrobione (sesja 3, lipiec 2026)

- **Plaster 5** – dziennik i edycja wpisu:
  - **Dziennik** (`src/journal/`): chronologiczna lista grupowana miesiącami
    (nagłówki w mianowniku, numeracja „str. N" od najstarszego miesiąca jak
    w prototypie), mini-stemple werdyktów ze złotą nalepką WOW, licznik
    wpisów z polską odmianą; dolna nawigacja przełącza Mapa ↔ Dziennik,
    mapa pozostaje zamontowana pod spodem (nie traci pozycji).
  - **Karta wpisu**: otwiera się z dziennika na miejscu, od razu na dotkniętym
    wpisie (D-30); przycisk „Edytuj" tylko przy własnych wpisach; dyskretny
    odręczny dopisek „werdykt zmieniony" przy zmienionym werdykcie (D-06).
  - **Edycja** (`src/edit/EditEntry.tsx`, D-29): jeden ekran – kategoria,
    werdykt (zmiana oznacza wpis na stałe przez `verdict_changed`; zejście
    z „Wrócę" zeruje WOW), opis 200 znaków, data wizyty (max dziś),
    **notatka prywatna** (upsert/kasowanie w `private_notes`) oraz
    **usuwanie wpisu** za potwierdzeniem – oba punkty z feedbacku plastra 4.
  - Kafle kategorii i przyciski werdyktów wydzielone jako współdzielone
    komponenty (`CategoryTiles`, `VerdictButtons` w `src/add/`); mutacje
    w `src/lib/entries.ts` (`updateEntry`, `deleteEntry`, `savePrivateNote`) –
    autorstwa pilnuje RLS, nie frontend.
  - **Zero migracji bazy**: `verdict_changed`, polityka „delete own"
    i `private_notes` istnieją od plastra 2.

## Zrobione (sesja 4, lipiec 2026)

- **Plaster 6** – zdjęcia:
  - **Kompresja** (`src/lib/photo.ts`, D-31): `browser-image-compression`
    w web workerze, `maxSizeMB: 0.3` (twarde ≤ 300 KB), prostuje obrót EXIF;
    importowana **dynamicznie** – osobny chunk (~20 KB gzip) pobierany dopiero
    przy pierwszym zdjęciu, start apki rośnie o < 5 KB.
  - **Storage** (`src/lib/photos.ts`, D-32): prywatny kubełek `photos`,
    ścieżka `{user_id}/{entry_id}.jpg`, wyświetlanie przez podpisany URL
    (`createSignedUrl`); `uploadPhoto`/`deletePhoto`/`signedPhotoUrl`.
  - **Wspólny komponent** (`src/photo/`): `PhotoField` (drop → wybór aparat/
    galeria; kadr z ramką, narożnikami, „×"; dotknięcie kadru = wymiana) +
    hook `usePhotoPick` (kompresja, podgląd przez object URL, sprzątanie).
    Używany i w dodawaniu, i w edycji.
  - **Dodawanie** (`StepNote`/`AddFlow`): upload po insercie wpisu; zdjęcie
    opcjonalne, więc błąd uploadu nie wywraca wpisu (toast, pieczątka i tak
    przybita). Zniknął tekst tymczasowy „Dojdzie w kolejnej wersji".
  - **Karta** (`EntryCard`): zdjęcie w białej ramce z narożnikami i podpisem
    „nasze zdjęcie" (wzór `.foto` z prototypu).
  - **Edycja** (`EditEntry`): dodanie/wymiana/usunięcie zdjęcia; stara
    ścieżka kasowana ze Storage dopiero po zapisie wiersza (żadnych
    „martwych" linków).
  - `photo_path` w `entries` istnieje od plastra 2 – **migruje się tylko
    kubełek Storage** (patrz „Do zrobienia ręcznie").
  - Weryfikacja w Chromium (~390 px): render karty i edycji na zaślepkach,
    pełny obieg wyboru pliku → kompresja w przeglądarce dała **255 KB**
    z testowego 2400×1600.

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

## Do zrobienia ręcznie przed odbiorem plastra 6

1. **Kubełek zdjęć**: w Supabase SQL Editor uruchomić
   `supabase/migrations/2026-07_plaster6_photos.sql` (tworzy prywatny kubełek
   `photos` + reguły RLS Storage). Instrukcja krok po kroku: `docs/photos.md`.
   Bez tego uploady zdjęć się nie udadzą (wpis zapisze się bez zdjęcia).

Zaległe z wcześniejszych plastrów (jeśli jeszcze nierobione):

2. **Migracja bazy plastra 4**: `supabase/migrations/2026-07_plaster4_osm_id.sql`
   (kolumna `places.osm_id`; bez niej zapis miejsca z OSM się nie uda).
3. (Opcjonalnie) darmowe źródło miejsc: otworzyć apkę z `?places=osm` (D-28)
   i porównać „W pobliżu" z Google; `?places=auto` przywraca automatykę.

## Znane sprawy / backlog techniczny

- Wbudowana poczta Supabase: limit 2 maile logowania/h – docelowo własny SMTP
  (np. Resend, darmowy próg).
- Aktualizacja PWA wymaga zamknięcia kart apki (autoUpdate podmienia wersję
  przy kolejnym wejściu); w plastrze 7 dodać sygnał „jest nowa wersja".
- Etykiety mapy w Noto Sans (glyphy OpenFreeMap); Domine/Karla wymagałyby
  własnego hostingu glyphów – rozważyć w plastrze 8.
- Bundle główny ~1,48 MB (403 KB gzip; głównie MapLibre) – biblioteka
  kompresji zdjęć już wydzielona do osobnego chunku (D-31); sam MapLibre do
  ewentualnego code-splittingu przy plastrze 7.
- Publiczne serwery Overpass/Photon bywają obciążone – zapytania mają timeout
  6 s; gdyby to przeszkadzało w praktyce, rozważyć mirror Overpass
  (kumi.systems) jako drugi adres.
- DESIGN §2 wymienia „filtr nieaktywny" wśród elementów z przerywaną ramką,
  ale prototyp rysuje filtr ciągłą – zrobione wg prototypu (źródło prawdy);
  wyjaśnić z Dawidem przy szlifie w plastrze 8.

## Następny krok: plaster 7 (nowa sesja)

Offline-first (SPEC §3.5, wymóg twardy pod Wyspy Owcze): service worker +
kolejka w IndexedDB, dodawanie wpisu ze zdjęciem działa bez sieci, sync w tle
po powrocie zasięgu, dyskretny wskaźnik „Czeka na wysłanie" przy niezsynchroni-
zowanych wpisach (styl `.chip-sync` jest w prototypie), kafelki mapy z cache.
Przy okazji: sygnał „jest nowa wersja" PWA (dziś autoUpdate po zamknięciu kart)
i ewentualny code-splitting MapLibre. Uwaga projektowa: kolejka offline musi
objąć też upload zdjęcia (blob w IndexedDB do czasu sync).

## Stan odbioru

Plastry 1–2 odebrane przez Dawida na produkcji. Plaster 3 czeka na odbiór:
wymaga klucza Google Places (docs/google-places.md) w Vercelu i `.env.local`.
Plaster 4 czeka na odbiór: wymaga migracji `osm_id` (punkt wyżej); weryfikacja
wizualna zrobiona na danych zaślepkowych w Chromium (pinezki, klastry, karta,
filtr, RLS notatki po stronie UI) – realne dane sprawdzi Dawid na preview.
Plaster 5 odebrany i zmergowany (PR #6).
Plaster 6 czeka na odbiór: wymaga założenia kubełka `photos` (punkt 1 „Do
zrobienia ręcznie", `docs/photos.md`); weryfikacja wizualna na zaślepkach
w Chromium (karta ze zdjęciem, edycja: dodanie/wymiana/usunięcie, kompresja
2400×1600 → 255 KB). Realny upload, podpisany URL i obrót EXIF zdjęcia
z telefonu sprawdzi Dawid na preview. Zdjęcia dzieli całe grono (odczyt),
zapis tylko autor – po założeniu kubełka warto zerknąć na dwóch kontach,
że jedno konto nie może nadpisać zdjęcia drugiego (reguły Storage z D-32).
