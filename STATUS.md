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

## Zrobione (sesja 7, lipiec 2026)

- **Plaster 9** (pierwszy poza MVP, za zgodą Dawida) – przełącznik źródła
  miejsc dla administratora (D-39):
  - **Baza** (`supabase/migrations/2026-07_plaster9_app_settings.sql`,
    dublowane w `schema.sql` dla świeżych projektów): tabela `admins`
    (członkostwo czyta tylko właściciel, zapis wyłącznie z panelu Supabase –
    zero polityk zapisu) i jednowierszowa `app_settings`
    (`places_provider: auto|google|osm`, drugi wiersz niemożliwy przez
    `check (id = 1)`); odczyt dla zalogowanych, update tylko dla adminów.
  - **`rls_check.sql` rozszerzony**: nie-admin czyta ustawienie, ale go nie
    zmieni; członkostwo adminów niewidoczne dla innych; admin zmienia.
  - **Frontend**: `src/lib/appSettings.ts` (hook `useAppSettings` – pobiera
    ustawienie i członkostwo przy starcie, kopia na urządzeniu
    w localStorage `beback:places-provider-remote`, wzorzec języka D-37);
    `pickProvider()` w `src/lib/places/index.ts` dostał nowy szczebel:
    pin `?places=` (D-28, wygrywa) → ustawienie admina (`auto` przepuszcza)
    → `VITE_PLACES_PROVIDER` → automatyka D-25.
  - **UI**: arkusz podpisu (TopBar) u admina ma sekcję „Źródło miejsc"
    z przyciskami Auto / Google / OSM (wzór przycisków języka); u nie-admina
    arkusz bez zmian. Zmiana działa od razu na urządzeniu admina; pozostałe
    urządzenia przejmują ją przy następnym starcie apki (bez realtime).
  - Weryfikacja E2E w Chromium (~390 px, preview build, zaślepki Supabase
    przez przechwycenie sieci): admin widzi i przełącza (PATCH
    `places_provider=osm` + kopia lokalna), przy skonfigurowanym kluczu
    Google ustawienie OSM kieruje „W pobliżu" do Overpass (Google 0 zapytań),
    pin `?places=google` wygrywa z ustawieniem OSM, nie-admin sekcji nie
    widzi, a ustawienie OSM i tak go obowiązuje. Realny RLS sprawdzi Dawid
    (`rls_check.sql`).

## Zrobione (sesja 8, lipiec 2026)

- **Pierwszy feedback z testów na telefonie** (zgłoszone przez Dawida
  po dniu testów; punkty 1–4, 7, 9 wdrożone, 5, 6, 8 omówione w rozmowie –
  czekają na decyzje):
  - **Przycisk „wróć do mnie"** (D-41): prawy dolny róg mapy, celownik –
    mapa wraca do pozycji GPS po przeglądaniu innych okolic.
  - **Przycisk „pokaż wszystko"** (D-41): nad celownikiem, ramka z kropką –
    jedno dotknięcie oddala mapę tak, że widać wszystkie pinezki (po
    aktualnym filtrze); znika przy pustej mapie.
  - **Znak WOW na pinezce** (D-40): toporna gwiazdka-nalepka zastąpiona
    delikatną złotą poświatą (cienki pierścień + łuna); dziennik
    i datownik bez zmian; DESIGN.md §3 pkt 3 zaktualizowany.
  - **„W pobliżu" bez śmieci** (D-42): Google dostał filtr `includedTypes`
    zawężający wyniki do noclegów, jedzenia i atrakcji (koniec ze sklepami
    odzieżowymi i nazwami ulic); OSM miał filtr od zawsze.
  - **Naprawa „W pobliżu" na OSM** (D-42): błąd w zapytaniu Overpass
    (`out center tags` wycinał współrzędne punktowych POI), oba serwery
    odpytywane równolegle zamiast po kolei, timeout 6 → 10 s. Uwaga:
    sandbox tej sesji nie miał dostępu do serwerów Overpass – realne
    zachowanie „W pobliżu" na OSM musi sprawdzić Dawid na telefonie.
  - **Edytowalny podpis** (D-43): w arkuszu podpisu (dotknięcie nazwy
    w nagłówku) nowy przycisk „Zmień podpis"; zapis lokalnie + do
    `profiles.display_name`, podpis podąża za kontem.
  - **Zero migracji bazy i zmian w RLS.**
  - Weryfikacja E2E w Chromium (~390 px, preview build, zaślepki Supabase):
    poświata WOW bez gwiazdki, oba przyciski działają (fit obejmuje
    Katowice i Gdańsk, celownik wraca do Katowic), „Zmień podpis" wysyła
    PATCH i od razu zmienia nagłówek.

## Zrobione (sesja 9, lipiec 2026)

- **Drugi feedback z telefonu** (punkty 1–3 wdrożone; 4–5 świadomie
  odłożone: ergonomia wielu ocen „na realną potrzebę", zaproszenia na
  osobną sesję):
  - **„W pobliżu" na OSM – kolejne podejście** (D-45): Photon działał,
    Overpass padał na obu instancjach → diagnoza: wycofane publiczne
    lustro kumi.systems + limity per IP na overpass-api.de (CGNAT sieci
    komórkowych) + POST podatny na pośredników sieci. Zmiany: zapytanie
    GET-em (profil identyczny z działającym Photonem), cztery instancje
    w wyścigu (de / openstreetmap.fr / private.coffee / kumi), a gdy
    padną wszystkie – powody per instancja zapisują się na urządzeniu
    i **admin widzi je w arkuszu podpisu** (sekcja „Źródło miejsc").
    Sandbox nadal bez dostępu do Overpass – test wyłącznie na telefonie;
    jeśli znów padnie, linia diagnostyczna w arkuszu powie dlaczego.
  - **Kafelki „W pobliżu" nie rozjeżdżają się** przy długich nazwach
    (kolumna tekstu dostała `min-width: 0` + `overflow-wrap: anywhere` –
    nazwa zawija się w środku kafelka).
  - **Filtry kategorii na mapie** (D-44, zastępują „Wszystko / Tylko
    Wrócę"): trzy ikonowe przełączniki (łóżko / sztućce / góry – ikony
    współdzielone z krokiem kategorii przez `CATEGORY_ICONS`), domyślnie
    włączone, odklikanie odejmuje pinezki; obok mały przełącznik
    „Wrócę!" (zieleń werdyktu) nakładany na zaznaczone kategorie;
    wyłączona kategoria = wciśnięty kraft. SPEC §3.3/§4 zaktualizowane.
  - **Zero migracji bazy i zmian w RLS.**
  - Weryfikacja E2E w Chromium (~390 px, preview build, zaślepki):
    przełączniki odejmują/dodają pinezki we wszystkich kombinacjach
    z „Wrócę!", zapytanie Overpass wychodzi GET-em, 80-znakowa nazwa
    mieści się w kafelku (bez przepełnienia).

## Zrobione (sesja 10, lipiec 2026)

- **„W pobliżu" na OSM – rozstrzygnięcie** (D-46). Diag z D-45 przyniósł
  twarde dane: z sieci Dawida (komputer i telefon) padają **wszystkie**
  instancje Overpass (de/fr: „Failed to fetch", coffee/kumi: timeout),
  a Photon działa. Zamiast walczyć z publicznym Overpassem:
  - **Photon reverse jako ratunek**: gdy cały wyścig Overpass przegra,
    lista „W pobliżu" powstaje z `photon.komoot.io/reverse` filtrowanego
    po stronie klienta tymi samymi tagami trzech kategorii; użytkownik
    nie widzi już błędu, tylko listę (nieco uboższą niż z Overpass).
  - **Diag rozbudowany**: dopisuje wynik ratunku („photon-reverse:
    OK (n)" albo powód jego porażki) oraz – sondą w tle – status głównej
    instancji (`/api/status`), co odróżnia „Overpass leży" od „moja sieć
    nie widzi Overpass". Wynik sondy u Dawida rozstrzygnie, czy da się
    kiedyś wrócić do Overpass jako pierwszego źródła.
  - Weryfikacja E2E w Chromium: wszystkie 4 instancje ubite na poziomie
    sieci → lista przychodzi z Photona (restauracja przechodzi, sklep
    odzieżowy i budynek odpadają na sicie), zero linii błędu, diag
    z pełnym śladem widoczny w arkuszu admina.
  - **Zero migracji bazy i zmian w RLS.**

## Zrobione (sesja 11, lipiec 2026)

- **Feedback z iPhone'a – pierwsze uruchomienie zainstalowanej PWA**:
  - **Logowanie kodem** (D-48): magic link na iOS logował w Safari, a apka
    z ekranu początkowego (osobny magazyn) sesji nie widziała – pętla.
    Teraz logowanie sześciocyfrowym kodem (`signInWithOtp` bez linku →
    `verifyOtp` typu `email`, `src/auth/LoginScreen.tsx`): dwie fazy
    (e-mail → kod), „Wyślij ponownie" i „Inny e-mail", pole z klawiaturą
    numeryczną i autofill iOS. **Krok ręczny Dawida**: szablon maila Magic
    Link w Supabase ma pokazywać `{{ .Token }}` i nie mieć
    `{{ .ConfirmationURL }}` (SETUP §4) – bez tego mail dalej przyjdzie
    z linkiem, a kodu nie będzie.
  - **Uczciwa geolokalizacja** (D-49): GPS w apce na iOS nie działał, błąd
    był połykany, mapa cicho startowała w Katowicach. `getPosition`
    (`src/lib/geolocation.ts`) rozróżnia teraz odmowę zgody od błędu
    odczytu (`GeoError`), zapisuje ślad (`beback:geo-diag`); dotknięcie
    celownika przy niepowodzeniu pokazuje komunikat z instrukcją i akcją
    „Spróbuj ponownie" (`MapView`); admin widzi kod błędu w arkuszu podpisu.
  - **OSM „W pobliżu" – zamknięte** (D-47): sonda z sesji 10 dała werdykt
    (`status: Failed to fetch`, Photon reverse `OK (0)`) – OSM nie zastąpi
    Google. Google zostaje domyślnym źródłem; maszyneria OSM zostaje jako
    bezpiecznik. Dalej tematu nie drążymy bez własnego backendu.
  - **Zero migracji bazy i zmian w RLS.**
  - Weryfikacja E2E w Chromium (~390 px, preview build, zaślepki Supabase):
    dwufazowe logowanie (błędny kod → komunikat, „Inny e-mail" → powrót,
    poprawny kod → `verifyOtp` typu `email` → wejście do apki); odmowa
    lokalizacji → komunikat „Brak zgody…" + diag z kodem 1; zgoda →
    centrowanie bez komunikatu, diag wyczyszczony.

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

Plaster 9 wymaga dwóch kroków w SQL Editorze Supabase:

1. Uruchomić migrację `supabase/migrations/2026-07_plaster9_app_settings.sql`.
2. Mianować siebie adminem (UUID konta: Authentication → Users):
   `insert into public.admins (user_id) values ('<uuid>');`

Uwaga przy odbiorze: jeśli któreś urządzenie ma przypięte źródło miejsc
komendą `?places=` (D-28), przypięcie nadal obowiązuje i wygrywa także
z ustawieniem admina – `?places=auto` przywraca automatykę.

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
## Następny krok (nowa sesja)

Plastry 1–8 = pełny zakres MVP z SPEC §7; plaster 9 domknięty w sesji 7;
sesje 8–9 = poprawki z feedbacku mobilnego (D-40–D-45; filtry kategorii
z D-44 weszły zamiast „Wszystko / Tylko Wrócę").
Decyzje Dawida z odbioru sesji 8: ergonomia wielu ocen tego samego
miejsca – czeka „na realną potrzebę"; **zaproszenia z ratyfikacją admina**
(D-16a, SPEC §4) – następny duży plaster, na osobną sesję (wymaga
własnego SMTP – limit 2 maile/h wbudowanej poczty).
„W pobliżu" na OSM zamknięte w sesji 11 (D-47): Google jest domyślnym
źródłem, OSM to bezpiecznik/narzędzie testowe. Arkusz admina (pod
„Źródło miejsc") pokazuje teraz dwa ślady: ostatnią porażkę OSM (D-45/46)
i ostatni błąd GPS (D-49, prefiks „GPS ·").
Przed wyjazdem: tydzień testów na spacerach (SPEC §7), w tym tryb
samolotowy. W kolejce dalej: glyphy Domine/Karla na mapie (backlog wyżej)
i backlog produktowy z SPEC §4.

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
Sesja 8 odebrana na telefonie (PR #11 na produkcji): mapa, poświata WOW,
podpis i filtr Google działają; z odbioru wyszły punkty sesji 9
(OSM nadal padał, długie nazwy rozjeżdżały kafelki).
Sesja 9 odebrana: filtry i zawijanie nazw działają; „W pobliżu" na OSM
nadal padało, ale diag z D-45 dostarczył dane do diagnozy – stąd sesja 10.
Sesja 10 odebrana: diag potwierdził, że Overpass jest z sieci Dawida
nieosiągalny, a Photon reverse ubogi – stąd zamknięcie tematu w sesji 11.
Sesja 11 czeka na odbiór. **Najpierw krok ręczny**: w Supabase zmienić
szablon maila Magic Link na `{{ .Token }}` bez `{{ .ConfirmationURL }}`
(SETUP §4) – inaczej mail przyjdzie z linkiem zamiast kodu. Potem po
deployu i „Odśwież": (1) na iPhonie z **zainstalowanej** apki zalogować
się kodem z maila – pętla logowania znika; (2) na mapie dotknąć celownika
– jeśli iOS poprosi o zgodę i ją dasz, mapa centruje na Tobie; jeśli GPS
dalej nie działa, dotknąć podpisu i **przepisać linię „GPS · …"** z arkusza
(kod błędu iOS rozstrzygnie, czy to odmowa zgody, czy głębszy problem
standalone PWA); (3) sprawdzić, że na Androidzie logowanie kodem i GPS
działają jak dotąd.
Plaster 9 czeka na odbiór – najpierw kroki ręczne (sekcja wyżej).
Scenariusz odbioru: (1) w SQL Editorze uruchomić rozszerzony
`rls_check.sql` – wynik PASS; (2) na koncie admina dotknąć podpisu →
w arkuszu jest „Źródło miejsc"; przełączyć na OSM → podpowiedzi
„W pobliżu" przychodzą z OSM (inny zestaw niż z Google); (3) na drugim
koncie (telefon partnerki) po ponownym otwarciu apki podpowiedzi też
z OSM, ale w arkuszu podpisu **nie ma** sekcji „Źródło miejsc";
(4) wrócić na Auto na koncie admina.
