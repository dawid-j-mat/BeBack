# BeBack – specyfikacja produktu (MVP)

> Ten dokument jest jedynym źródłem prawdy o tym, **co** budujemy i **po co**.
> Jak to ma wyglądać – patrz `DESIGN.md`. Dlaczego tak zdecydowaliśmy – patrz `DECISIONS.md`.

## 1. Wizja

BeBack to prywatny dziennik podróży i miejsc z funkcją rekomendacji w zaufanym gronie.
Powstaje z braku zaufania do publicznych ocen (boty, obcy gust): najbardziej ufam sobie,
ludziom, którym ufam, i ludziom, którym ufają oni. Każdy wpis to mała podróż – nawet
kolacja w mieście. Apka wymusza dyscyplinę intelektualną: krótka skala, 200 znaków,
jedno zdjęcie.

Dwie funkcje:
- **pamiętnikarska** – gdzie byłem i jak to oceniłem (wartość od pierwszego dnia, przy jednym użytkowniku),
- **rekomendacyjna** – inspirowanie lub zniechęcanie osób z grona (warstwa, która wyrasta z dziennika).

Projekt niekomercyjny, darmowy, nigdy dla obcych.

## 2. Użytkownicy fazy 1

Dokładnie **dwa konta** (Dawid + partnerka), wszystkie wpisy wzajemnie widoczne.
Żadnego systemu zaproszeń, grafu zaufania ani ustawień widoczności w MVP – to backlog.
Test na najbliższym wyjeździe (Islandia, Wyspy Owcze, Kopenhaga) poprzedzony tygodniem
testów lokalnych.

Persona pomocnicza: „nie-smartfonowy" członek rodziny – interfejs musi być oczywisty
bez instrukcji (zasada zera didaskaliów, patrz `DESIGN.md`).

## 3. Zakres MVP

### 3.1 Wpis (encja centralna)

| Pole | Zasady |
|---|---|
| miejsce | z wyszukiwarki / listy „W pobliżu" (GPS); zawsze powiązane z miejscem na mapie |
| kategoria | dokładnie jedna z trzech: `nocleg`, `jedzenie`, `atrakcja` |
| werdykt | `wroce` / `mozna` / `odradzam` (PL: Wrócę! / Można / Odradzam; EN: I'll be back / It's alright / Skip it) |
| WOW | boolean, dostępny **tylko** przy werdykcie `wroce`; trafia na pieczątkę i wyróżnia pinezkę |
| opis | max **200 znaków**, widoczny dla grona |
| notatka prywatna | bez limitu, widoczna tylko dla autora |
| zdjęcie | **opcjonalne**, max **jedno**, można dodać/wymienić później; kompresja po stronie klienta przed uploadem |
| data wizyty | domyślnie dziś, edytowalna |

Mapowanie mentalne skali (1–10): WOW = 9–10, Wrócę = 7–8, Można = 5–6, Odradzam = 1–4.

**Edycja:** wszystko edytowalne. Zmiana werdyktu po zapisaniu jest dyskretnie oznaczana
(„werdykt zmieniony") – werdykt to zobowiązanie wobec grona.

**Dwa-w-jednym** (np. restauracja w hotelu): zawsze **dwa osobne wpisy**. Gdy użytkownik
dodaje wpis w lokalizacji, w której ma już wpis, apka proponuje powiązanie („to samo
miejsce?"); powiązane wpisy dzielą jedną pinezkę z przełączanymi kartami.

### 3.2 Przepływ dodawania

Cel: **poniżej 45 sekund**, realnie 4 dotknięcia + opis.

1. **Miejsce** – lista „W pobliżu" z GPS (Google Places Nearby) + wyszukiwarka (Google Places).
   Dotknięcie miejsca = przejście dalej.
2. **Kategoria** – trzy kafle, dotknięcie = przejście dalej (bez przycisku „Dalej").
3. **Werdykt** – trzy przyciski, dotknięcie = przejście dalej.
4. **Opis** – pole 200 znaków z licznikiem, przełącznik „Było WOW" (tylko przy `wroce`),
   opcjonalne zdjęcie, przycisk **„Przybij pieczątkę"** → animacja stempla → powrót na mapę,
   nowa pinezka pulsuje.

Data i lokalizacja zapisują się automatycznie, bez pytania.

### 3.3 Mapa (ekran główny)

- MapLibre GL + kafelki OpenStreetMap, **własny styl** zgodny z `DESIGN.md`.
- Pinezki w kolorach werdyktów; WOW = dodatkowa złota pieczęć-nalepka przy pinezce.
- **Klastrowanie** przy oddaleniu (biblioteka supercluster lub wbudowane klastrowanie MapLibre).
- **Filtry**: trzy przełączniki kategorii (domyślnie włączone, sumujące się –
  odklikanie odejmuje pinezki kategorii) + nakładkowy przełącznik „Wrócę!"
  zawężający zaznaczone kategorie do werdyktu `wroce`; stan domyślny
  (wszystko włączone, „Wrócę!" wyłączone) = dawny filtr „Wszystko".
- Dotknięcie pinezki → karta wpisu (arkusz od dołu).

### 3.4 Dziennik

Chronologiczna lista wszystkich wpisów, grupowana miesiącami, z mini-stemplami werdyktów
i znacznikiem WOW. Dotknięcie → karta wpisu.

### 3.5 Offline-first (wymóg twardy)

Wyspy Owcze nie wybaczą braku zasięgu:
- dodawanie wpisu (ze zdjęciem) działa w pełni bez sieci,
- wpisy trafiają do lokalnej kolejki (IndexedDB), synchronizacja w tle po powrocie sieci,
- dyskretny wskaźnik „Czeka na wysłanie" przy niezsynchronizowanych wpisach,
- mapa: kafelki z cache przeglądarki; brak kafelków nie może blokować dodania wpisu
  (fallback: dodanie wpisu bez podglądu mapy, ze współrzędnymi z GPS).

### 3.6 Dwujęzyczność

Interfejs PL/EN od pierwszej wersji (jedna osoba w rodzinie jest anglojęzyczna).
Wszystkie stringi UI w słowniku (prosty moduł i18n, bez ciężkich bibliotek).
Treść wpisów nie jest tłumaczona – to słowa autora.

### 3.7 Konta i logowanie

- Supabase Auth, logowanie magic linkiem e-mail (bez haseł do zapamiętania).
- Rejestracja zamknięta: konta zakładane ręcznie w panelu Supabase (faza 1 = 2 konta).
- Row Level Security: użytkownik edytuje tylko swoje wpisy; czyta wszystkie
  (w fazie 1 grono = wszyscy użytkownicy instancji).
- Notatka prywatna: RLS ogranicza odczyt wyłącznie do autora.

## 4. Poza zakresem MVP (backlog, nie budować bez decyzji)

- Grono i zaproszenia: użytkownik generuje link zaproszeniowy (poręczenie);
  zaproszony podaje e-mail → status „oczekuje"; konto powstaje dopiero po
  zatwierdzeniu przez administratora (rola admin, ekran „Grono").
  Publiczna rejestracja pozostaje wyłączona na zawsze.
- Retroaktywny import z EXIF zdjęć (grupowanie w zdarzenia, ocenianie wstecz).
- Eksport danych (własność danych – element etosu projektu).
- Ustawienia widoczności / blokowanie dostępu do własnych materiałów.
- Publikacja z opóźnieniem / ukrywanie precyzyjnych dat (prywatność lokalizacyjna).
- Drugi stopień zaufania („znajomi znajomych") – wyraźnie oznaczony, jeśli kiedykolwiek.
- Widoki per miasto/wyjazd (filtry po kategoriach weszły do §3.3 decyzją D-44).

## 5. Stos technologiczny

| Warstwa | Wybór | Uwagi |
|---|---|---|
| Frontend | React + Vite, PWA (vite-plugin-pwa) | instalowalna na Androidzie i iOS z przeglądarki |
| Mapa | MapLibre GL JS + kafelki OSM | własny plik stylu; klastrowanie |
| Wyszukiwanie miejsc | Google Places API (Text Search + Nearby) | darmowy miesięczny kredyt Google wystarcza z zapasem przy 2 użytkownikach |
| Backend | Supabase (Auth, Postgres, Storage) | darmowy plan |
| Offline | Service Worker (Workbox przez vite-plugin-pwa) + IndexedDB (kolejka sync) | |
| Hosting | Vercel | darmowy plan, deploy z GitHuba |
| Zdjęcia | kompresja client-side (canvas / browser-image-compression), cel ≤ 300 KB | |

**Android i iOS – wymóg równorzędny.** PWA działa na obu; na iOS instalacja przez
Safari → „Dodaj do ekranu początkowego". Znane różnice iOS do uwzględnienia:
brak automatycznego promptu instalacji (przygotować jednorazową instrukcję w apce),
limity storage przy długiej nieaktywności (dane i tak żyją w Supabase – lokalnie tylko
cache i kolejka), aparat i GPS działają przez standardowe API przeglądarki.

## 6. Model danych (Postgres / Supabase)

```
profiles      id (uuid, = auth.users.id), display_name, lang ('pl'|'en'), created_at

places        id (uuid), google_place_id (text, unique, nullable),
              name, city, country, lat, lng, created_by, created_at

entries       id (uuid), user_id → profiles, place_id → places,
              category ('nocleg'|'jedzenie'|'atrakcja'),
              verdict ('wroce'|'mozna'|'odradzam'),
              wow (bool, default false; CHECK: wow=false OR verdict='wroce'),
              note (varchar 200), private_note (text, nullable),
              photo_path (text, nullable),
              visited_on (date), created_at, updated_at,
              verdict_changed (bool, default false)
```

Zdjęcia w Supabase Storage: bucket `photos`, ścieżka `{user_id}/{entry_id}.jpg`.

## 7. Kolejność plastrów (jeden plaster = jedna sesja, działa po każdej)

1. Szkielet: Vite + React + PWA, deploy na Vercel, pusta mapa MapLibre z własnym stylem.
2. Supabase: auth magic linkiem, tabele + RLS, dwa konta.
3. Dodawanie wpisu bez zdjęcia (Places „W pobliżu" + wyszukiwarka, 4 kroki, pieczątka).
4. Mapa wpisów: pinezki, karta wpisu, klastrowanie, filtr „Tylko Wrócę", znacznik WOW.
5. Dziennik (lista) + edycja wpisu (w tym oznaczanie zmiany werdyktu).
6. Zdjęcia: aparat/galeria, kompresja, upload, wyświetlanie na karcie.
7. Offline: service worker, kolejka IndexedDB, wskaźnik synchronizacji.
8. Dwujęzyczność + powiązywanie wpisów w tym samym miejscu + szlif animacji.

Po plastrze 7: tydzień testów na spacerach po Katowicach, dopiero potem wyjazd.

## 8. Wymogi niefunkcjonalne

- Dodanie wpisu < 45 s; pierwsze otwarcie apki < 3 s na 4G.
- Całość w darmowych progach usług (Supabase, Vercel, Google – monitorować kredyt Places).
- Zero analityki i trackerów. Dane tylko w Supabase użytkownika.
- Kod i commity po angielsku; UI domyślnie po polsku.
