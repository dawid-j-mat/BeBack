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

## Zrobione (sesja 5, lipiec 2026)

- **Plaster 7** – offline-first (SPEC §3.5):
  - **Skrytka (outbox)** w IndexedDB (`src/lib/outbox.ts`, D-33): każde
    przybicie pieczątki – także online – zapisuje wpis ze zdjęciem (blob)
    lokalnie i od razu stempluje; identyfikatory wpisu i miejsca generuje
    klient (`crypto.randomUUID()`), więc synchronizacja jest idempotentna,
    a id nie zmienia się po dotarciu na serwer. Data wizyty zapisywana
    w chwili przybicia (nie „dzisiaj" z bazy przy późniejszym sync).
  - **Synchronizacja w tle** (`src/lib/sync.ts`): kolejka opróżniana
    najstarsze-najpierw przy starcie apki, powrocie sieci (`online`),
    powrocie karty i po każdym przybiciu; błąd przerywa i czeka na następną
    okazję; `findOrCreatePlace` przeniesione tu z AddFlow (dedupe bez zmian).
    Hook `useOfflineEntries` skleja wpisy z serwera i ze skrytki – oczekujący
    wpis znika z listy dopiero, gdy jest już w odświeżonej liście z serwera
    (pinezka nie mruga).
  - **Wskaźnik „Czeka na wysłanie"** (`.chip-sync` z prototypu): w wierszu
    dziennika i na karcie wpisu (tam w miejscu przycisku „Edytuj" – edycja
    czeka na synchronizację); kropka nie miga przy `prefers-reduced-motion`.
  - **Wpisy widoczne offline**: ostatnia udana lista wpisów w localStorage
    per użytkownik (`beback:entries:{userId}` – dwa konta na jednym
    urządzeniu nie widzą swoich notatek prywatnych, D-20/D-21); zdjęcie
    oczekującego wpisu z lokalnego bloba; cudze zdjęcia offline niedostępne
    (podpisane URL-e wymagają sieci – świadome ograniczenie).
  - **Cache mapy i fontów** (D-35, `vite.config.ts`): kafelki + glyphy
    OpenFreeMap CacheFirst (600 wpisów / 30 dni), Google Fonts SWR + rok;
    Supabase świadomie poza cache SW. Brak kafelków nie blokuje dodania
    wpisu (mapa = czysty papier, GPS działa).
  - **Sygnał nowej wersji** (D-34): `registerType: 'prompt'` + pasek
    „Jest nowa wersja / Odśwież" (`src/components/UpdateToast.tsx`)
    zamiast autoUpdate z backlogu.
  - **Kompresja zdjęć – fallback na canvasie** (`src/lib/photo.ts`): gdy
    leniwie ładowany chunk `browser-image-compression` jest niedostępny
    (offline zanim precache się dopełnił), zdjęcie i tak schodzi ≤ 300 KB.
  - Drobne: `todayLocal()` wydzielone do `src/lib/dates.ts`; podpis autora
    przez `useDisplayName` (cache w localStorage – działa offline);
    `TopBar` dostaje nazwę propem; toast „foto się nie udało" usunięty
    z dodawania (upload w tle sam się ponawia).
  - **Zero migracji bazy i zmian w RLS.**
  - Weryfikacja E2E w Chromium (~390 px, preview build, headless):
    offline od startu → pełny przepływ z zdjęciem 398 KB (canvas-fallback
    → 147 KB w skrytce), pieczątka natychmiast, pinezka na mapie bez
    kafelków, chip w dzienniku i na karcie, karta ze zdjęciem z bloba;
    przeładowanie apki offline (service worker + skrytka) – wpis nadal
    jest; powrót sieci przy niedostępnym Supabase – kolejka zostaje
    i ponawia (bez duplikatów dzięki client-side id). Realny sync na
    produkcyjnym Supabase sprawdzi Dawid.
- **Pytanie o 300 KB** (z odbioru plastra 6): darmowy plan Supabase to
  1 GB Storage (≈ 3 400 zdjęć po 300 KB – lata użytku przy 2 kontach)
  i 5 GB/mies. transferu (≈ 17 tys. wyświetleń zdjęć). Limit zostaje;
  gdyby kiedyś było ciasno, pierwszy ruch to `MAX_EDGE` 1920 → 1600
  w `src/lib/photo.ts`, nie niższy próg KB.

## Zrobione (sesja 6, lipiec 2026)

- **Naprawa podpowiedzi „W pobliżu"** (D-36) – zgłoszenie: podpowiedzi
  przestały się pojawiać na komputerze i telefonie, choć wyszukiwarka
  działała. Przyczyna systemowa: awaria dostawcy była niema (wyglądała jak
  brak miejsc w okolicy). Zmiany: krok miejsca pokazuje przy błędzie
  dyskretną linię „Nie udało się pobrać miejsc w pobliżu" + „Spróbuj
  ponownie"; pozycja z trzema siatkami (dokładna → przybliżona → ostatnia
  zapamiętana, max 1 h, `src/lib/geolocation.ts`); Overpass z mirrorem
  kumi.systems (backlogowy punkt domknięty); promień 400 m → 1000 m,
  limit 10 (`NEARBY_RADIUS_M`/`NEARBY_LIMIT` w `src/lib/places/types.ts`).
- **Plaster 8**:
  - **Język z profilu** (D-37): start z kopii na urządzeniu
    (`beback:lang`), po zalogowaniu nadrzędny `profiles.lang`
    (istniało od plastra 2 – zero migracji); zmiana w arkuszu podpisu
    (dotknięcie podpisu: Polski/English + Wyloguj, `src/components/
    TopBar.tsx`); `useDisplayName` → `useProfile` (`src/auth/useProfile.ts`).
  - **Powiązywanie wpisów „to samo miejsce?"** (D-38): wybór miejsca
    ≤ 50 m od miejsca z serwera – identyczna nazwa podpina się cicho,
    inna nazwa pyta dialogiem; powiązanie wędruje przez skrytkę
    (`existingPlaceId` w `src/lib/outbox.ts`), sync podpina wpis do
    istniejącego wiersza (`src/lib/sync.ts`), pinezka scala się od razu.
    Scenariusz „restauracja w hotelu" (D-05) działa końcem do końca.
  - **Szlif**: sprzeczność „filtr nieaktywny" rozstrzygnięta na rzecz
    prototypu (ciągła ramka, poprawiony DESIGN.md); audyt animacji –
    wszystkie animacje prototypu były już w apce, globalna reguła
    `prefers-reduced-motion` w `base.css` obejmuje też nowe elementy.
  - **Zero migracji bazy i zmian w RLS.**

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

## Do zrobienia ręcznie

Plaster 8 nie wymaga żadnych kroków ręcznych (zero migracji bazy).
Uwaga przy odbiorze: jeśli któreś urządzenie ma przypięte źródło miejsc
komendą `?places=` (D-28), przypięcie nadal obowiązuje – `?places=auto`
przywraca automatykę (Google z zapasem OSM).

## Znane sprawy / backlog techniczny

- Wbudowana poczta Supabase: limit 2 maile logowania/h – docelowo własny SMTP
  (np. Resend, darmowy próg).
- Etykiety mapy w Noto Sans (glyphy OpenFreeMap); Domine/Karla wymagałyby
  własnego hostingu glyphów – rozważyć w plastrze 8.
- Code-splitting MapLibre odrzucony (D-35): mapa jest pierwszym ekranem,
  wydzielenie tylko opóźniałoby treść główną; od drugiego otwarcia bundle
  i tak idzie z precache service workera.
- Edycja/usuwanie wpisu wymaga sieci (offline objęte jest tylko dodawanie –
  zakres SPEC §3.5); przy braku zasięgu edycja kończy się dzisiejszym
  toastem błędu. Ewentualne rozszerzenie kolejki o edycje – backlog.
- Publiczne serwery Overpass/Photon bywają obciążone – zapytania mają timeout
  6 s; „W pobliżu" próbuje kolejno overpass-api.de i mirrora kumi.systems
  (od sesji 6, D-36). Offline „W pobliżu" nie działa (to sieć), ale ścieżka
  „Dodaj miejsce, w którym jestem" (GPS) działa bez zasięgu.
- **Przełącznik Google/OSM sterowany przez administratora z apki** – prośba
  Dawida z sesji 6, do wdrożenia w plastrze 9. Szkic: tabela `app_settings`
  (jeden wiersz, kolumna `places_provider: auto|google|osm`), RLS: odczyt
  dla zalogowanych, zapis tylko dla konta admina (pilnuje baza, nie
  frontend); apka czyta ustawienie przy starcie (z kopią w localStorage na
  offline), przełączanie w arkuszu podpisu widoczne tylko dla admina.
  Komenda `?places=` (D-28) zostaje jako narzędzie testowe per urządzenie.

## Następny krok: plaster 9 (nowa sesja)

Plastry 1–8 = pełny zakres MVP z SPEC §7. Przed wyjazdem: tydzień testów
na spacerach (SPEC §7), w tym tryb samolotowy. Plaster 9 (pierwszy poza
MVP, za zgodą Dawida): przełącznik dostawcy miejsc dla administratora
(szkic w backlogu wyżej). W kolejce dalej: glyphy Domine/Karla na mapie
(backlog wyżej) i backlog produktowy z SPEC §4.

## Stan odbioru

Plastry 1–7 odebrane: 1–6 na produkcji (PR #6, #7), plaster 7 (PR #8)
przetestowany przez Dawida na komputerze i telefonie (sesja 6 – „telefon
załapał"). Zgłoszony przy tym błąd podpowiedzi „W pobliżu" naprawiony
w sesji 6 (D-36).
Plaster 8 czeka na odbiór – żadnych kroków ręcznych. Scenariusz odbioru
u Dawida (komputer i telefon, produkcja): (1) dodać wpis – podpowiedzi
„W pobliżu" wracają; przy padzie dostawców zamiast pustki jest linia
„Nie udało się pobrać miejsc w pobliżu" + „Spróbuj ponownie"; (2) dotknąć
podpisu w nagłówku → arkusz: przełączyć na English (cała apka po
angielsku, wybór przetrwa przeładowanie i przejdzie na drugie urządzenie
po zalogowaniu), wrócić na Polski; (3) dodać drugi wpis w miejscu, gdzie
już jakiś jest (inna nazwa w promieniu 50 m) → pytanie „To samo miejsce
co …?"; po „Tak, to samo" oba wpisy dzielą jedną pinezkę z przełączanymi
kartami (licznik „1/2"); (4) sprawdzić, że werdykty/kategorie wyglądają
jak dotąd (bez regresji).
