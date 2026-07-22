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

**D-39 · Źródło miejsc przełącza administrator z apki; adminów pilnuje
osobna tabela.** Przełącznik Google ↔ OSM przestaje wymagać redeployu
(zmienna środowiskowa) czy komendy w adresie na każdym urządzeniu (D-28):
jedno ustawienie w bazie (`app_settings`, dokładnie jeden wiersz –
ograniczenie `check (id = 1)` uniemożliwia drugi) obowiązuje całe grono.
Odczyt ma każdy zalogowany; zapis wyłącznie konta z tabeli `admins` –
tabela nie ma żadnych polityk zapisu, więc admina można mianować tylko
z panelu Supabase: o roli decyduje baza, nie frontend. Apka trzyma kopię
ustawienia na urządzeniu (localStorage – działa offline i przed
odpowiedzią serwera, wzorzec z języka D-37); pozostałe urządzenia
przejmują zmianę przy następnym starcie apki, bez nasłuchu realtime
(prostota adekwatna do dwóch kont). Kolejność wyboru źródła: przypięcie
`?places=` (narzędzie testowe, świadomie wygrywa) → ustawienie admina
(`auto` przepuszcza dalej) → `VITE_PLACES_PROVIDER` → automatyka z D-25.
Przełącznik mieszka w arkuszu podpisu (D-37) i widzi go tylko admin –
u pozostałych arkusz wygląda jak dotąd. Odrzucone: kolumna `is_admin`
w `profiles` (polityka „update own" pozwoliłaby każdemu mianować się
adminem z konsoli przeglądarki; pilnowanie jednej kolumny wymagałoby
triggera), UUID admina na sztywno w polityce SQL (zmiana admina =
edycja polityki) oraz Supabase Realtime (zbędny przy dwóch kontach).

**D-40 · WOW na mapie: złota poświata zamiast pieczęci-nalepki.** Feedback
z pierwszych testów na telefonie: nalepka z gwiazdką była zbyt nachalna –
przyciągała wzrok mocniej niż sama pinezka i psuła jej delikatny puls.
Teraz WOW to cienki złoty pierścień wokół główki plus miękka złota łuna
(CSS `drop-shadow` – zero dodatkowych elementów). Złoto pozostaje
zarezerwowane wyłącznie dla WOW (D-13 co do zasady obowiązuje); datownik
(„✳ WOW ✳") i mini-stempel w dzienniku bez zmian. Odrzucone: powrót do
złotego asterysku przy główce (Dawid też nie był z niego zadowolony)
i animowana poświata (odciągałaby uwagę od pulsu świeżo przybitej pinezki).

**D-41 · Dwa dyskretne przyciski na mapie: „wróć do mnie" i „pokaż
wszystko".** Prawy dolny róg, wzorzec znany z aplikacji map: celownik
wraca do pozycji GPS (przybliżenie co najmniej 14 – jak przy starcie),
ramka z kropką oddala mapę tak, żeby wszystkie pinezki po aktualnym
filtrze zmieściły się w kadrze (`fitBounds`, maks. przybliżenie 15) –
scenariusz „gdzie jedli znajomi na tej wycieczce we Włoszech". Przycisk
„pokaż wszystko" znika, gdy nie ma żadnej pinezki. Odrzucone: gest palcem
(nieodkrywalny – łamie zasadę oczywistego interfejsu) i pozycja w górnym
rogu (kciuk go nie sięga, a róg jest blisko filtrów).

**D-42 · „W pobliżu" zawężone do trzech kategorii; Overpass odporniejszy.**
Google searchNearby bez filtra zwracał wszystko wokół – sklepy z odzieżą,
biura, nazwane ulice; teraz dostaje `includedTypes` z listą typów
odpowiadających naszym kategoriom (nocleg/jedzenie/atrakcja). Celowo
`includedTypes`, nie `includedPrimaryTypes`: typ wtórny też łapie, więc
hotel z restauracją pokaże się w obu światach – dokładnie tak, jak chce
model dwóch wpisów (D-05). OSM filtr tagów miał od początku, ale jego
„W pobliżu" psuły dwie rzeczy: (1) `out center tags` – tryb `tags`
wycina współrzędne węzłów, więc lokale mapowane jako punkty (większość!)
znikały z odpowiedzi – poprawione na `out center`; (2) instancje pytane
po kolei – zajęta główna zjadała cały budżet czasu, zanim mirror dostał
szansę – teraz obie ścigają się równolegle (`Promise.any`), a timeout
wzrósł z 6 do 10 s. Dwa zapytania na dotknięcie to przy naszej skali
żaden ciężar dla publicznych serwerów.

**D-43 · Podpis użytkownika edytowalny w arkuszu podpisu.** Domyślna
nazwa pochodzi z maila i nie zawsze jest imieniem i nazwiskiem, a cała
idea zaufania wymaga wiedzy, kto dokładnie co poleca. „Zmień podpis"
w arkuszu (dotknięcie podpisu w nagłówku) otwiera systemowy `prompt` –
ten sam wzorzec co pytanie przy wylogowaniu (D-21); zapis jak przy języku
(D-37): natychmiast lokalnie, w tle do `profiles.display_name`, więc
podpis podąża za kontem. Odrzucone: osobny ekran profilu (MVP nadal nie
ma ekranu ustawień) i wymuszanie formatu „Imię Nazwisko" (to umowa
społeczna grona, nie walidacja).

**D-44 · Filtry mapy: kategorie odejmowane + nakładka „Wrócę!".** Zamiast
pary „Wszystko / Tylko Wrócę" (D-10) mapa dostaje trzy przełączniki
kategorii z ikonami z kroku kategorii (łóżko / sztućce / góry – ta sama
ikona znaczy to samo w całej apce) oraz mały przełącznik „Wrócę!".
Kategorie są domyślnie włączone i sumują się – odklikanie odejmuje
pinezki tej kategorii; „Wrócę!" nakłada się na zaznaczone kategorie
(„knajpy, do których wrócę"), a jego odklikanie wraca do pełnego widoku –
stan „Wszystko" istnieje więc bez osobnego przycisku. Wyłączona
kategoria wygląda jak wciśnięta w kraft (kolor elementów nieaktywnych
z DESIGN), aktywne „Wrócę!" przyjmuje zieleń werdyktu (kolor tylko
znaczeniowy). Odrzucone: złota gwiazdka jako ikona atrakcji (złoto jest
wyłącznie dla WOW; poza tym trzymamy się ikon kafli) i przenoszenie
filtrów do arkusza podpisu (filtr to codzienne narzędzie mapy).

**D-45 · Overpass przez GET, świeża lista instancji, ślad diagnostyczny
dla admina.** „W pobliżu" na OSM padało na telefonie mimo D-42, choć
Photon (wyszukiwarka) działał z tej samej sieci. Trzy zmiany:
(1) zapytanie idzie **GET-em** z parametrem `data` – dokładnie ten profil
żądania, który u Photona przechodzi (POST bywa gorzej traktowany przez
pośredników sieci komórkowych); (2) lista instancji odświeżona –
kumi.systems wycofało publiczne lustro, a główna overpass-api.de
limituje na adres IP, który w sieci komórkowej (CGNAT) dzielą tysiące
osób; teraz ścigają się cztery: de, openstreetmap.fr, private.coffee
i (na wszelki wypadek) kumi – martwa pozycja nic nie kosztuje, wygrywa
pierwsza dobra odpowiedź; (3) gdy padną wszystkie, powody per instancja
zapisują się na urządzeniu i pokazują w arkuszu podpisu **tylko adminowi**
– telefon nie ma konsoli, a „nie działa" bez szczegółów kosztowało już
trzy sesje debugowania. Odrzucone: własny serwer pośredniczący (nie mamy
backendu poza Supabase) i pokazywanie kodów błędów wszystkim (didaskalia
techniczne w UI zwykłego użytkownika).

**D-46 · „W pobliżu" ma zapasowe źródło: Photon reverse.** Linia
diagnostyczna z D-45 pokazała stan faktyczny: z sieci Dawida (komputer
i telefon) pada każda instancja Overpass – de i fr natychmiastowym
„Failed to fetch", coffee i kumi timeoutem – podczas gdy Photon działa
bez zarzutu. Z publicznymi serwerami Overpass nie wygramy, więc gdy
wszystkie przegrają wyścig, „W pobliżu" pyta endpoint `photon.komoot.io/
reverse` (co jest wokół tych współrzędnych) i filtruje odpowiedź po
`osm_key`/`osm_value` tymi samymi listami tagów trzech kategorii –
Photon nie ma filtra wartości tagów po swojej stronie, więc sito jest
klienckie. Overpass zostaje pierwszym wyborem (bogatsze wyniki: Photon
reverse zwraca ograniczoną liczbę najbliższych obiektów wszelkiego
rodzaju, z których sito przepuszcza część); diag admina odnotowuje
i porażkę Overpass, i wynik ratunku („photon-reverse: OK (n)"), a sonda
`overpass-api.de/api/status` w tle dopisuje, czy główna instancja jest
w ogóle osiągalna – to odróżni „Overpass leży" od „moja sieć nie widzi
Overpass". Odrzucone: rezygnacja z Overpass w ogóle (tam, gdzie działa,
daje pełniejszy obraz okolicy) i własne proxy (brak backendu poza
Supabase – zasada projektu).

**D-47 · OSM „W pobliżu" domknięte jako niewystarczające – Google
zostaje.** Sonda z D-46 przyniosła werdykt: z sieci Dawida
`status: Failed to fetch` (główna instancja Overpass w ogóle
nieosiągalna, nie „przeciążona"), a Photon reverse zwrócił `OK (0)` –
w większym mieście kilka miejsc się pojawia, ale za mało i za
przypadkowo, by zastąpić Google Places jako źródło „W pobliżu".
Wniosek: darmowe OSM nie zastąpi Google dla tej funkcji; Google
pozostaje domyślnym i rekomendowanym źródłem (jest darmowe przy dwóch
kontach – D-08/D-25), a cała maszyneria OSM (przełącznik admina D-39,
fallback Photon reverse D-46) zostaje jako nieszkodliwy bezpiecznik
i narzędzie testowe, nie jako realna alternatywa. Temat „W pobliżu na
OSM" uznajemy za zamknięty – dalsza walka z dostępnością publicznych
serwerów nie ma sensu bez własnego backendu (poza zakresem MVP).

**D-48 · Logowanie kodem zamiast magic linka (odporne na izolację iOS).**
Test na iPhonie: zainstalowana z ekranu początkowego apka (standalone
PWA) ma osobny magazyn cookies/storage niż Safari. Magic link z maila
otwierał się w Safari, sesja powstawała w Safari, a apka jej nie
widziała – logowanie zapętlało się poza apką (na Androidzie działało).
Wymuszenie powrotu linku do zainstalowanej PWA na iOS jest zawodne –
PWA nie rejestruje uniwersalnych linków jak apka natywna. Rozwiązanie:
logowanie **sześciocyfrowym kodem** (`signInWithOtp` bez linku →
`verifyOtp({ type: 'email' })`); kod przepisuje się w dowolnym
kontekście, więc sesja powstaje w tym samym magazynie, w którym jest
apka. Jeden spójny sposób na iOS, Androidzie i komputerze; przy okazji
znikają błędy „link wygasł / już użyty". Pole kodu ma `inputmode=numeric`
i `autocomplete=one-time-code` (klawiatura numeryczna, autofill iOS).
Wymaga ręcznego kroku: szablon maila Magic Link w Supabase pokazuje
`{{ .Token }}`, a `{{ .ConfirmationURL }}` usuwamy (SETUP §4). Odrzucone:
utrzymanie linku obok kodu (na iOS nawyk klikania linku dalej wpuszczałby
w pętlę – decyzja Dawida: tylko kod) i próby przechwycenia linku do apki
(zawodne na iOS). Limit 2 maile/h (wbudowana poczta Supabase) bez zmian –
własny SMTP zostaje w backlogu.

**D-49 · Geolokalizacja: jawny stan błędu z instrukcją zamiast cichego
powrotu do Katowic.** W zainstalowanej apce na iPhonie GPS nie działał,
a błąd był połykany (`.catch(() => {})`), więc mapa cicho startowała
w Katowicach (pozycja zapasowa) bez śladu, co się stało. Teraz
`getPosition` rozróżnia odmowę zgody (kod 1 → `GeoError` `denied`) od
błędu odczytu/timeoutu (`unavailable`) i zapisuje ślad na urządzeniu
(`beback:geo-diag` – kod i treść błędu, wzorzec `nearbyDiag`). Dotknięcie
celownika (gest użytkownika – na iOS najpewniejszy moment na prompt
uprawnień) przy niepowodzeniu pokazuje czytelny komunikat: przy odmowie
„Włącz lokalizację dla BeBack w ustawieniach telefonu" (na iOS dopisek
ze ścieżką Ustawienia → Prywatność → Usługi lokalizacji), przy błędzie
odczytu „spróbuj na otwartym terenie"; komunikat ma akcję „Spróbuj
ponownie" (stan błędu z akcją, jak D-36 – nie didaskalia). Automatyczne
centrowanie na starcie dalej połyka błąd po cichu (brak zgody przy
pierwszym renderze nie ma krzyczeć); ślad diagnostyczny widzi admin
w arkuszu podpisu, żeby rozstrzygnąć odmowę zgody od głębszego problemu
iOS ze standalone PWA. Odrzucone: prompt uprawnień na starcie bez gestu
(na iOS bywa cicho ignorowany) i globalny baner instrukcji (didaskalia –
komunikat tylko wtedy, gdy użytkownik faktycznie prosi o lokalizację).

**D-50 · Na zainstalowanej apce iOS pierwsze pytanie o GPS dopiero po
dotknięciu celownika.** Zgłoszenie Dawida uściśliło D-49: na iPhonie
(zainstalowana apka) lokalizacja była odrzucana **po cichu, bez żadnego
pytania o zgodę** – na Androidzie działa bez zarzutu. Znana słabość
WebKita: w standalone PWA zapytanie o pozycję zrobione przy starcie (bez
gestu użytkownika) bywa cicho odrzucane, a iOS zapamiętuje to „nie",
więc i późniejsze dotknięcie nie pomaga. Dlatego na iOS w trybie
standalone (`navigator.standalone === true` + iPhone/iPad w UA) mapa
**nie odpytuje GPS przy starcie** – pierwszym zapytaniem jest dopiero
dotknięcie celownika, czyli gest, przy którym iOS najpewniej pokaże
prompt. Android w standalone i wszystkie przeglądarki na komputerze
działają jak dotąd (auto-centrowanie na starcie). Diag geo dostał flagę
`standalone=…`, żeby przy odbiorze potwierdzić kontekst. Odrzucone:
globalne wyłączenie auto-centrowania (niepotrzebna regresja na Androidzie
i desktopie, gdzie działa) oraz sztuczne „rozgrzewanie" uprawnień
niewidocznym przyciskiem (obejście łamiące zasadę oczywistego interfejsu).

**D-51 · Po jednorazowej zgodzie iOS centruje mapę automatycznie przy
każdym starcie.** D-50 (pytanie o GPS dopiero po dotknięciu) rozwiązało
ciszę iOS, ale samo w sobie zmuszałoby do dotykania celownika przy każdym
otwarciu apki – niewygodne, sprzeczne z oczekiwaniem „apka sama pokazuje,
gdzie jestem". Kluczowa obserwacja: cicha odmowa iOS dotyczy tylko
zapytania bez gestu, **zanim** zgoda istnieje; gdy raz jest udzielona,
kolejne odczyty (także bez gestu, przy starcie) działają bez pytania.
Więc pierwszy udany odczyt zapisuje na urządzeniu flagę
`beback:geo-granted`, a mapa auto-centruje przy starcie, gdy nie jesteśmy
w iOS-standalone **albo** flaga jest ustawiona. Efekt na iPhonie: celownik
dotyka się raz w życiu (żeby iOS pokazał prompt), potem każde uruchomienie
centruje się samo, jak na Androidzie. Cofnięcie zgody w ustawieniach iOS
(późniejsza odmowa) czyści flagę – apka wraca do trybu „czekaj na
dotknięcie". Odrzucone: `navigator.permissions.query('geolocation')` jako
sygnał zgody (na Safari historycznie niepewne) na rzecz zapamiętania
własnego, faktycznie udanego odczytu.
