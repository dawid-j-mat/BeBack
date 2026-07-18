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
