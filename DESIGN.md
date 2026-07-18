# BeBack – system projektowy „Papierowy dziennik"

> Źródłem prawdy wizualnej jest zatwierdzony prototyp
> `prototyp/beback-kierunek-2-dziennik.html`. Ten dokument tłumaczy prototyp na reguły.
> W razie wątpliwości: otwórz prototyp i porównaj piksele.

## 1. Idea

Apka wygląda jak dobrze prowadzony papierowy dziennik podróży: papier, atrament
wieczny, taśma klejąca, fotograficzne narożniki, pieczątki. Każdy wpis to mała podróż –
estetyka musi być równie naturalna we wtorek na Mariackiej, co na Wyspach Owczych.
Żadnych klisz wakacyjnych (palmy, walizki, samoloty).

## 2. Tokeny

### Kolory

```css
--papier:        #F1E8D4;   /* tło ekranów */
--papier-jasny:  #F7F1E2;   /* powierzchnie wyniesione, karta wpisu */
--kraft:         #E4D6B8;   /* elementy nieaktywne */
--atrament:      #26324D;   /* tekst, ikony – atrament wieczny, NIE czerń */
--atrament-70/45/20          /* rgba(38,50,77, .72/.45/.2) */
--lotniczy-czerwony: #C23A2E;  /* akcent marki: pas lotniczy, FAB, przycisk pieczęci */
--lotniczy-niebieski: #2B4C9B; /* akcent wtórny: pasek postępu, etykiety kategorii */
--bialy:         #FFFDF7;   /* powierzchnie „kartkowe": zdjęcia, pola, wiersze */

/* semantyka werdyktów – kolor TYLKO znaczeniowy */
--zielen:        #3A6B4A;   /* Wrócę */
--olowek:        #8A7E66;   /* Można */
--czerwien:      #B0342C;   /* Odradzam */
--zloto:         #B8860B;   /* WYŁĄCZNIE WOW – nigdzie indziej */
```

Zasada: kolor niesie znaczenie albo go nie ma. Werdykty i WOW mają swoje kolory;
akcenty marki (czerwień/błękit lotniczy) służą nawigacji i akcji głównej; reszta to
papier i atrament.

### Typografia (Google Fonts, subset latin-ext)

| Rola | Krój | Użycie |
|---|---|---|
| Nagłówki, nazwy miejsc, werdykty | **Domine** 500–700 | książkowy szeryf |
| Tekst, etykiety, przyciski wtórne | **Karla** 400–700 | |
| Odręczne akcenty | **Caveat** 500–600 | daty, dystanse, podpisy, drobiazgi „ludzkie" |

Caveat nigdy do treści wpisów ani elementów wymagających szybkiego czytania.

### Geometria i cień

- Promień narożników: **8 px** (karty, pola, przyciski), 10 px karta wpisu. Zero pastylek.
- Cień „fizyczny": `box-shadow: 0 2px 0 rgba(38,50,77,.12)`; wciśnięcie =
  `translateY(1px)` + redukcja cienia. Przyciski zachowują się jak klawisze.
- Linie przerywane (`dashed`, atrament-45) = szycie/obszary „do wypełnienia"
  (drop zdjęcia, notatka prywatna, filtr nieaktywny).

## 3. Elementy tożsamości (obowiązkowe)

1. **Pas lotniczy** – ukośne pasy czerwono-biało-niebieskie (koperta air mail),
   9 px wysokości, na górze każdego ekranu.
2. **Datownik (pieczątka)** – okrągły stempel: podwójny pierścień, otok
   „BEBACK · MIEJSCE", w centrum werdykt (Domine) i data; kolor = kolor werdyktu;
   `mix-blend-mode: multiply`, lekki obrót (±8°). Generowany jako SVG – wzór w prototypie
   (`stampSVG`). WOW dodaje przerywany zewnętrzny pierścień i napis „★ WOW ★".
3. **Asterysk WOW** – złoty asterysk (✳, --zloto), lekko obrócony, przy główce
   pinezki na mapie i w rogu mini-stempla w dzienniku; na datowniku napis „✳ WOW ✳"
   plus przerywany zewnętrzny pierścień. Jedyne użycie złota w całej apce.
4. **FAB-pieczęć** – okrągły czerwony przycisk „+" z podwójnym pierścieniem,
   cieniem 3D i fizycznym wciśnięciem; ikona plus jako SVG (nigdy znak tekstowy).
5. **Strona dziennika** – karta wpisu: taśma klejąca u góry, zdjęcie w białej ramce
   z czterema fotograficznymi narożnikami, lekko przekrzywione (−1.2°), podpis Caveat.
6. **Animacja pieczątki** – po zapisie: stempel wpada z rozmachem
   (`cubic-bezier(.2,1.4,.4,1)`, skala 2.6→1, obrót), fala tuszu, podpis Caveat.
   Szanować `prefers-reduced-motion`.

## 4. Mapa (styl MapLibre)

Papierowe tło (`--papier`), drogi jako szkicowe linie atramentu o niskim kryciu,
woda: spłowiały błękit lotniczy `#BCCEE6` z konturem błękitu 50% (przepis „błękit
14% krycia" z prototypu na ciepłym papierze neutralizuje się do szarości – kolor
wody mieszamy z góry, nie przezroczystością), wzgórza jako doodle „^", czerwony
szlak kropkowany. Pinezki = szpilki (główka koło w kolorze werdyktu + cień + nóżka).
Klastry = przerywane kółko z liczbą (Domine) i nazwą miasta (Caveat).
Docelowo: własny JSON stylu MapLibre odwzorowujący te zasady na realnych kafelkach.

## 5. Zasady twarde

- **Zero didaskaliów.** Żadnych tekstów objaśniających interfejs („kliknij, aby…",
  „jeden dotyk…"). Interfejs ma być oczywisty; jeśli wymaga podpisu – przeprojektować.
- **Jednodotykowe kroki.** Wybór miejsca, kategorii i werdyktu natychmiast przechodzi
  dalej. Przycisk „Dalej" nie istnieje; „Wstecz" – dyskretny, tekstowy.
- Ikony: cienkie SVG (stroke 1.4–1.8), spójny zestaw; nigdy emoji w UI.
- Duże cele dotykowe (min. 44 px) – apka także dla „nie-smartfonowych".
- Język polski: półpauza (–), nigdy pauza (—); naturalna polszczyzna bez kalk.

## 6. Antywzorce (zakazane)

Klisze „AI-designu": fioletowo-niebieskie gradienty, glassmorphism, font Inter,
neonowe akcenty na ciemnym tle, emoji w nagłówkach, krem+terakota+Playfair,
generyczne karty shadcn. Oraz rozpoznawalne tiki, których świadomie unikamy:
przyciski-pastylki (pill), chipy z monospace'owymi etykietami, gradientowe CTA,
teksty objaśniające. Gdy nowy komponent nie ma wzoru w prototypie – projektować
od pytania „jak wyglądałoby to w papierowym dzienniku?", nie od domyślnych komponentów.
