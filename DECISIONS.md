# BeBack – dziennik decyzji

> Każda istotna decyzja: co, dlaczego, co odrzuciliśmy. Uzupełniany na bieżąco
> (także przez Claude Code po zatwierdzeniu decyzji w sesji). Służy też jako
> materiał do nauki – uzasadnienia pisane po ludzku.

## Faza koncepcyjna (lipiec 2026)

**D-01 · Dziennik-first.** Funkcja pamiętnikarska daje wartość przy jednym użytkowniku;
rekomendacje wyrastają z dziennika. Rozwiązuje problem zimnego startu, na którym
umierają apki społecznościowe.

**D-02 · Nazwa: BeBack / „Wrócę!".** Nazwa globalna bez diakrytyków; najwyższy werdykt
(PL „Wrócę!", EN „I'll be back") lustrzanie odbija nazwę. „Be back" solo jest gramatycznie
ucięte – marka może, etykieta oceny nie, stąd pełne „I'll be back". Odrzucone: TrustTravel
(robocza), Sztama, Bedeker, Sztambuch, Kajet, samo „Wrócę" (diakrytyki).

**D-03 · Skala: Wrócę! / Można / Odradzam + WOW.** Trzy stopnie wymuszają decyzję
(pięć gwiazdek inflacjonuje do 4,7). Wszystkie etykiety „aktywne", potoczne. WOW to nie
czwarty stopień, lecz odznaka na „Wrócę" – mapowanie mentalne 1–10: WOW 9–10,
Wrócę 7–8, Można 5–6, Odradzam 1–4. Odrzucone: „poprawnie" (urzędowy przysłówek),
„waham się" (niekonkluzywne).

**D-04 · Dyscyplina publiczna, swoboda prywatna.** Opis max 200 znaków i jedno zdjęcie
dyscyplinują część rekomendacyjną; notatka prywatna bez limitu obsługuje pamięć autora.
Rozwiązuje napięcie dziennik ↔ dyscyplina.

**D-05 · Dwa wpisy zamiast podwójnej kategorii.** Restauracja w hotelu = dwa wpisy
powiązane jednym miejscem (oceny mogą się różnić). Jedna karta z dwiema kategoriami
kłamałaby przy rozjechanych werdyktach.

**D-06 · Zmiana werdyktu jest oznaczana.** Werdykt to zobowiązanie wobec grona –
cicha zmiana „odradzam"→„wrócę" po roku podważałaby zaufanie. Edycja opisu/zdjęcia/
notatki – bez oznaczeń.

**D-07 · PWA zamiast aplikacji natywnej.** Brak kosztów sklepów (99 USD/rok Apple),
brak recenzji, instalacja = link. Działa na Androidzie i iOS. Świadomie akceptujemy
różnice iOS (ręczna instalacja z Safari, limity lokalnego storage – dane żyją w Supabase).

**D-08 · Hybryda map: MapLibre/OSM + Google Places.** Rysowanie mapy darmowe (OSM),
ale „W pobliżu" i wyszukiwarka z Google Places – OSM ma w Polsce dziurawe dane o
lokalach, a „w pobliżu" jest sercem przepływu. Wolumen 2 użytkowników mieści się
w darmowym kredycie Google.

**D-09 · Offline-first od początku.** Wyspy Owcze = słaby zasięg; dolepianie offline'u
później to najgorszy rodzaj refaktoryzacji. Kolejka w IndexedDB, sync w tle.

**D-10 · Klastrowanie i filtry zamiast strachu przed zatłoczoną mapą.** Przy 100+
wpisach: klastry per miasto przy oddaleniu, filtr „Tylko Wrócę" jako główny przypadek
użycia („gdzie idziemy wieczorem?"). Dziennik pozostaje kompletnym rejestrem.

**D-11 · Jednodotykowe kroki.** Wybór = przejście dalej; WOW przeniesione na ekran
opisu (widoczne tylko przy „Wrócę"), żeby auto-przejście go nie zjadało. Cel < 45 s.

**D-12 · Kierunek wizualny: „Papierowy dziennik".** Wygrał z „Kartografią" (za chłodna)
i „Paszportem" (za oszczędny). Pełne reguły w `DESIGN.md`. Wymóg dodatkowy: nie może
wyglądać na „zrobione przez AI" – lista antywzorców w `DESIGN.md`.

**D-13 · Znacznik WOW: złota pieczęć-nalepka.** Mały złoty asterysk przy pinezce i mini-stemplu.
Złoto zarezerwowane w całej apce wyłącznie dla WOW.

**D-14 · Zero didaskaliów.** Interfejs nie tłumaczy sam siebie; teksty typu
„jeden dotyk, bez dalej" usunięte i zakazane na przyszłość.

**D-15 · Dwujęzyczność PL/EN od startu.** Jedna osoba w gronie anglojęzyczna;
dokładanie i18n później jest bolesne. Prosty słownik, bez ciężkich bibliotek.
Treść wpisów nieprzetłumaczalna z zasady.

**D-16 · Rejestracja zamknięta.** Faza 1: dwa konta zakładane ręcznie. System
zaproszeń (wyłącznie przez poręczenie istniejącego użytkownika) – dopiero po
zweryfikowaniu nawyku.

**D-16a · Zaproszenia z ratyfikacją.** Poręczenie znajomego nie wystarcza –
konto powstaje dopiero po zatwierdzeniu przez administratora (Dawid).
Podwójne poręczenie odpowiada modelowi zaufania apki.

---

## Faza budowy

*(wpisy dodawane po każdej sesji: numer, decyzja, uzasadnienie, alternatywy)*

**D-17 · TypeScript zamiast czystego JavaScriptu.** Kompilator wyłapuje całe klasy
błędów (np. literówkę w nazwie pola wpisu) zanim apka się uruchomi – to będzie ważne
przy modelu danych i logice offline w plastrach 2–7. Edytor podpowiada strukturę
danych, co wspiera naukę. Koszt: trochę żargonu typów w kodzie. Odrzucone: czysty
JavaScript (czytelniejszy na starcie, ale błędy typów ujawniałyby się dopiero
w działaniu).

**D-18 · Kafelki wektorowe z OpenFreeMap.** Papierowy styl mapy z `DESIGN.md` wymaga
kafelków wektorowych (surowe dane, które kolorujemy sami), nie gotowych obrazków.
OpenFreeMap serwuje wektorowe kafelki z danych OSM za darmo, bez klucza API i bez
limitów – zero sekretów w repo i zero ryzyka rachunku. Odrzucone: MapTiler (konto,
klucz, limit 100 tys. wczytań/mies.), rastrowe kafelki OSM (nie da się ich przemalować).
Uwaga: etykiety na mapie tymczasowo w kroju Noto Sans – jedynym hostowanym przez
OpenFreeMap; Domine/Karla na mapie wymagałyby własnego hostingu glyphów (do rozważenia
w plastrze 8).

**D-19 · Kolor wody mieszany z góry, nie przezroczystością.** Prototypowy przepis
„błękit lotniczy 14% krycia na papierze" daje na ekranie szarość (ciepły papier
neutralizuje zimny błękit), co wyszło na realnych stawach Katowic. Woda dostaje
gotowy, spłowiały błękit `#BCCEE6` (optycznie: błękit lotniczy rozbielony papierem),
kontur bez zmian. Odrzucone: podbicie krycia do 30–40% (nadal szarawe), czysty
jaskrawy błękit (wypada z estetyki papieru).

**D-20 · Notatka prywatna w osobnej tabeli `private_notes`.** SPEC §6 umieszczał ją
jako kolumnę `entries`, ale RLS Postgresa działa na poziomie wierszy, nie kolumn –
nie da się pokazać komuś wiersza wpisu, ukrywając mu jedną kolumnę. Osobna tabela
(notatka ↔ wpis 1:1, klucz obcy złożony wiąże notatkę z autorem wpisu) dostaje
polityki „wszystko tylko autor", egzekwowane przez bazę, nie przez kod frontendu.
Odrzucone: uprawnienia kolumnowe (łamią standardowe zapytania klienta Supabase),
filtrowanie w frontendzie (do obejścia w konsoli przeglądarki).

**D-21 · Wylogowanie przez dotknięcie podpisu w nagłówku (tymczasowe).** Dotknięcie
odręcznego podpisu użytkownika pyta „Wylogować?". Zero nowych ekranów w MVP; potrzebne
głównie do testów dwóch kont na jednym urządzeniu. Docelowe miejsce (ekran ustawień
albo „Grono") – backlog.

**D-22 · Places API (New) przez REST prosto z przeglądarki.** Nowe API Google
(places.googleapis.com/v1) obsługuje zapytania z przeglądarki kluczem ograniczonym
do naszych domen i tego jednego API. Odrzucone: SDK map Google (ciężki, ciągnie
własny renderer map – mamy MapLibre) i serwer pośredniczący (nie mamy backendu
poza Supabase). Oszczędność kredytu: „W pobliżu" raz na otwarcie przepływu,
wyszukiwarka z opóźnieniem 500 ms i od 3 znaków.

**D-23 · Nawigacja stanem Reacta, bez biblioteki routingu.** Apka ma dwa ekrany
(mapa + przepływ dodawania; dziennik dojdzie w plastrze 5) – wystarczy zmienna
stanu. Odrzucone: react-router (zależność spoza SPEC §5 bez realnej potrzeby).

**D-24 · Miejsce spoza Google – ręcznie, pinezka z pozycji GPS.** Nie każda budka
z lodami jest w Google. Przycisk „Dodaj miejsce, w którym jestem" (przerywana
ramka = obszar do wypełnienia, zgodnie z językiem DESIGN.md): użytkownik wpisuje
tylko nazwę, współrzędne bierzemy z GPS, `google_place_id` zostaje puste (schemat
bazy od początku na to gotowy). Wymaga zgody na lokalizację – bez niej przycisk
się nie pokazuje. Odrzucone: wskazywanie punktu na mapie (więcej dotknięć;
ewentualnie backlog).

**D-25 · Darmowy dostawca miejsc: Overpass + Photon, Google zostaje głównym.**
Google Places jest darmowe przy dwóch kontach, ale przy większym gronie zaczęłoby
kosztować – apka dostaje więc w pełni darmową, bezkluczową parę na danych OSM:
Overpass API odpowiada na „W pobliżu" (obiekty wokół współrzędnych GPS), Photon
(wyszukiwarka Komoot) na wpisywanie nazw, ze znoszeniem literówek. Na co dzień działa
Google (lepsze dane o lokalach w Polsce, D-08); OSM włącza się automatycznie, gdy
zapytanie Google zawiedzie albo klucza w ogóle nie ma, a zmienna `VITE_PLACES_PROVIDER`
pozwala wymusić jedno źródło. Miejsca z OSM dostają w bazie własny identyfikator
`osm_id` (obok `google_place_id`), żeby dwa wpisy w tej samej knajpie trafiały do
jednego miejsca. Odrzucone: Nominatim (regulamin publicznej instancji zabrania
podpowiedzi w trakcie pisania i ogranicza do 1 zapytania/s).

**D-26 · Pinezki i klastry jako markery DOM + supercluster, nie warstwy MapLibre.**
Wbudowane klastrowanie MapLibre rysuje teksty czcionkami kafelków – a tam mamy tylko
Noto Sans (D-18), podczas gdy klaster wg DESIGN wymaga liczby w Domine i miasta
w Caveat. Markery DOM dziedziczą fonty i CSS strony, więc szpilka i przerywane kółko
klastra są wklejone 1:1 z prototypu; matematykę klastrów liczy biblioteka supercluster
(wymieniona w SPEC §3.3). Przy setkach wpisów wydajność bez znaczenia. Odrzucone:
warstwy symbolowe MapLibre (własny hosting glyphów i przerysowana szpilka).

**D-28 · Przełączanie źródła miejsc komendą w adresie, nie przyciskiem.** Do testów
porównawczych Google ↔ OSM wystarczy raz otworzyć apkę z `?places=osm` (albo
`?places=google`); wybór zapamiętuje się na urządzeniu, `?places=auto` przywraca
automatykę z D-25. Odrzucone: widoczny przełącznik w interfejsie (MVP nie ma ekranu
ustawień, a element techniczny na mapie łamałby czystość interfejsu) i sama zmienna
środowiskowa (wymaga redeployu albo lokalnego środowiska – za daleko od „jednego
przycisku" przy testach na produkcji).

**D-27 · Jedna pinezka na miejsce, wpisy przełączane w karcie.** Dwoje użytkowników
oceni te same lokale – osobne pinezki w tym samym punkcie by się przesłaniały. Wpisy
grupują się po miejscu: główka szpilki ma kolor najnowszego werdyktu, złota nalepka
WOW pojawia się, jeśli którykolwiek wpis ją ma, a karta wpisu przełącza strony
strzałkami (licznik „1/2"). To przy okazji fundament pod „dwa-w-jednym" z plastra 8.

**D-29 · Edycja wpisu na jednym ekranie, nie w 4 krokach.** Przepływ 4 kroków
celebruje pierwsze wrażenie i cel „poniżej 45 s"; edycja to poprawka – użytkownik
zwykle zmienia jedną rzecz i chce widzieć całość naraz. Jeden ekran zbiera:
kategorię, werdykt (zmiana z „Wrócę" zeruje WOW), opis z licznikiem, datę wizyty,
notatkę prywatną (przerywana ramka = obszar do wypełnienia, język DESIGN) oraz
dyskretne „Usuń wpis" z potwierdzeniem (wzorzec `confirm` jak przy wylogowaniu,
D-21). Kafle i przyciski werdyktów są współdzielone z przepływem dodawania –
w krokach dotknięcie przechodzi dalej, w edycji tylko podświetla wybór.
Odrzucone: ponowne przejście 4 kroków (wolniejsze, gubi kontekst „co już jest
wpisane"). Zmiana miejsca wpisu świadomie poza edycją – załatwia ją usunięcie
i ponowne dodanie.

**D-30 · Dziennik otwiera kartę wpisu na miejscu, bez skoku na mapę.** Prototyp
przy dotknięciu wiersza przeskakiwał na ekran mapy, bo makieta miała jedną kartę
na sztywno. U nas karta jest komponentem, więc wysuwa się nad dziennikiem,
otwarta od razu na dotkniętym wpisie; po zamknięciu użytkownik wraca tam, skąd
przyszedł. To zmiana zachowania, nie pikseli – wygląd karty pozostaje 1:1
z prototypem. Odrzucone: wierne odtworzenie skoku na mapę (dezorientuje
i gubi pozycję przewinięcia listy).

**D-31 · Kompresja zdjęć biblioteką `browser-image-compression`, ładowaną leniwie.**
SPEC §5 dopuszcza canvas albo tę bibliotekę; wybór padł na bibliotekę, bo daje
lepszą jakość i wygodę bez własnej dłubaniny: kompresuje w web workerze (nie
zawiesza interfejsu przy 12-megapikselowym zdjęciu z telefonu), sama prostuje
obrót EXIF (bez tego portretowe zdjęcia z telefonu lądują „na boku") i celuje
w maksymalny rozmiar (`maxSizeMB: 0.3` = twardy limit 300 KB z DESIGN/CLAUDE.md).
Kosztem jest waga – z inline'owanym workerem ~340 KB gzip – więc importujemy ją
**dynamicznie**: ląduje w osobnym kawałku (chunku) pobieranym dopiero przy
pierwszym wyborze zdjęcia, a start aplikacji rośnie o niecałe 5 KB (SPEC §8,
„< 3 s na 4G"; realizuje też zapowiedziany w STATUS code-splitting). Odrzucone:
własna kompresja na canvasie (mniej pewny obrót EXIF, więcej kodu do utrzymania
przez jedną osobę).

**D-32 · Zdjęcia w prywatnym kubełku Storage, pokazywane przez podpisane adresy.**
Kubełek `photos` jest prywatny; front pobiera krótkotrwały „signed URL" przy każdym
wyświetleniu. Reguły RLS Storage odwzorowują model wpisów (D-20): całe grono
czyta wszystkie zdjęcia, ale zapis/wymiana/kasowanie tylko we własnym folderze
`{user_id}/…` (bazę pilnuje pierwszy człon ścieżki). Ścieżka `{user_id}/{entry_id}.jpg`
jest deterministyczna, więc wymiana zdjęcia to nadpisanie tego samego pliku –
kolumna `photo_path` zmienia się tylko przy dodaniu lub usunięciu. Odrzucone:
kubełek publiczny z „nieodgadywalną" ścieżką (prywatność zależałaby od sekretności
adresu, nie od reguł bazy – sprzeczne z etosem RLS projektu).

**D-33 · Zapis wpisu zawsze przez lokalną skrytkę (outbox-first), identyfikatory
generuje klient.** Każde przybicie pieczątki – także przy pełnym zasięgu – najpierw
zapisuje wpis (ze zdjęciem) do skrytki w IndexedDB i od razu pokazuje stempel;
wysyłka do Supabase biegnie w tle (start apki, powrót sieci, powrót karty, każde
nowe przybicie). Dzięki temu pieczątka jest natychmiastowa zawsze (cel < 45 s –
przy jednej kresce zasięgu zapis nie wisi na timeoutach), a offline i online to
jedna ścieżka kodu, która nie może się rozjechać. Identyfikatory wpisu i nowego
miejsca powstają w telefonie (`crypto.randomUUID()`): ponowiona po zerwaniu
synchronizacja trafia na błąd „duplicate key" zamiast tworzyć duplikat, a id nie
zmienia się po dotarciu na serwer – mapa i dziennik niczego nie przemapowują.
Data wizyty zapisuje się w chwili przybicia, nie przy synchronizacji (wpis wysłany
trzy dni później dostałby fałszywe „dzisiaj" z bazy). IndexedDB obsługuje mały
własny wrapper (~40 linii) – bez nowej zależności. Odrzucone: „spróbuj online,
przy błędzie zakolejkuj" (dwie ścieżki kodu, wiszące zapisy przy słabym zasięgu).

**D-34 · Aktualizacja PWA przez pasek „Jest nowa wersja", nie autoUpdate.**
Dotychczasowy `autoUpdate` podmieniał apkę dopiero po zamknięciu wszystkich kart
i mógł to zrobić w środku użycia; teraz nowa wersja czeka, aż użytkownik dotknie
„Odśwież" na dyskretnym pasku nad nawigacją. Świadome zachowanie kontroli nad
momentem podmiany – szczególnie ważne offline, gdzie w tle czeka niezsynchroni-
zowana kolejka. Odrzucone: pozostanie przy autoUpdate (brak sygnału, że wersja
się zmieniła – punkt z backlogu STATUS).

**D-35 · Cache sieciowy service workera tylko dla kafelków i fontów; Supabase
świadomie poza nim.** Workbox dostał reguły runtime: kafelki wektorowe i glyphy
OpenFreeMap – CacheFirst (600 wpisów, 30 dni; odwiedzone obszary mapy renderują
się bez sieci), arkusz Google Fonts – StaleWhileRevalidate, pliki fontów –
CacheFirst na rok. Odpowiedzi Supabase nie są cache'owane w service workerze:
danymi wpisów zarządza warstwa aplikacji (skrytka z D-33 + migawka listy wpisów
w localStorage, per użytkownik – dwa konta dzielą urządzenie w testach i żadne
nie może zobaczyć cudzej notatki prywatnej), bo tylko ona wie, co jest oczekujące,
a co przyszło z serwera. Przy okazji: zapowiadany code-splitting MapLibre
odrzucony – mapa jest pierwszym ekranem, wydzielenie jej z bundla tylko opóźnia
treść główną, a od drugiego otwarcia i tak ładuje się z precache. Kompresja zdjęć
dostała awaryjną ścieżkę na canvasie na wypadek, gdyby leniwie ładowana biblioteka
nie zdążyła trafić do precache przed utratą sieci – zdjęcia muszą działać offline
bezwarunkowo (SPEC §3.5).

**D-36 · Podpowiedzi „W pobliżu": siatki bezpieczeństwa i jawny stan błędu.**
Awaria dostawcy wyglądała na ekranie identycznie jak „nic tu nie ma" – stąd
zgłoszenie „podpowiedzi zniknęły" bez żadnego śladu w interfejsie. Cztery
zmiany naraz: (1) krok miejsca odróżnia pusty wynik od błędu pobrania i przy
błędzie pokazuje dyskretną linię z przyciskiem „Spróbuj ponownie"; (2) pozycja
ma trzy siatki – dokładny odczyt, potem przybliżony (lokalizacja sieciowa),
na końcu ostatnia zapamiętana pozycja (max 1 h – starsza mogłaby podpowiadać
miejsca z miasta, z którego już wyjechaliśmy); (3) Overpass dostał zapasowy
mirror kumi.systems (publiczna instancja bywa przeciążona); (4) promień
400 m → 1000 m z limitem 10 wyników – w zwykłej dzielnicy mieszkaniowej
400 m bywa puste z definicji, a wyniki i tak sortują się od najbliższego.
Odrzucone: tekst tłumaczący, skąd biorą się podpowiedzi (didaskalia – zakaz
z DESIGN; pokazujemy wyłącznie stan i akcję ponowienia).

**D-37 · Język interfejsu z profilu, przełączany w arkuszu podpisu.** Język
startuje z kopii na urządzeniu (apka otwiera się we właściwym języku także
offline), a po zalogowaniu nadrzędny jest profil (`profiles.lang` istniało od
plastra 2 – zero migracji); zmiana zapisuje się i lokalnie, i w profilu, więc
wybór podąża za kontem na inne urządzenia. Miejsce zmiany: dotknięcie podpisu
w nagłówku otwiera mały arkusz (Polski/English + Wyloguj) – naturalne
rozwinięcie D-21, nadal bez osobnego ekranu ustawień. Wylogowanie zachowuje
pytanie kontrolne, bo logowanie magic linkiem jest limitowane (2 maile/h).
Odrzucone: ekran ustawień (MVP go nie ma) i biblioteka i18n (słownik z
plastra 1 wystarcza).

**D-38 · „To samo miejsce?" – dopasowanie po odległości, rozstrzyga
użytkownik.** Wybór miejsca oddalonego do 50 m od miejsca już zapisanego na
serwerze: przy identycznej nazwie wpis podpina się do niego bez pytania (to
ten sam lokal, np. wybrany raz z Google, raz z OSM), przy różnej nazwie apka
pyta „To samo miejsce co «X»?" – tak działa scenariusz „restauracja w hotelu"
(D-05): dwa wpisy, jedna pinezka z przełączanymi kartami (D-27). Wybrane
powiązanie wędruje przez skrytkę offline (pole `existingPlaceId`), więc
synchronizacja podpina wpis do istniejącego wiersza zamiast tworzyć duplikat,
a pinezka scala się od razu, jeszcze przed wysłaniem. Odrzucone: automatyczne
łączenie po samej odległości (hotel obok kawiarni to nie to samo miejsce –
o tożsamości decyduje człowiek) i większy promień (na gęstej ulicy pytanie
padałoby przy co drugim dodaniu).
