# BeBack na iPhonie (apka z ekranu początkowego)

Zebrane po testach na żywym telefonie. iOS traktuje apkę dodaną do ekranu
początkowego inaczej niż Android – stąd trzy rzeczy, które trzeba wiedzieć.

## Lokalizacja: nie szukaj „BeBack" w ustawieniach prywatności

iOS **nie pokazuje** apek webowych jako osobnych aplikacji na liście w
Ustawienia → Prywatność → Usługi lokalizacji. Dostępem do lokalizacji dla
wszystkich stron i apek webowych zarządza jeden wspólny wpis:

**Ustawienia → Prywatność i bezpieczeństwo → Usługi lokalizacji**
1. Główny przełącznik **Usługi lokalizacji** – włączony.
2. Na liście niżej: **Witryny Safari** → **Podczas używania aplikacji**.

Dodatkowo warto sprawdzić: **Ustawienia → Safari** → sekcja ustawień witryn →
**Lokalizacja** → `Pytaj` albo `Zezwól`.

### Gdy iOS zapamiętał odmowę

Starsze wersje apki pytały o pozycję automatycznie przy starcie, a iOS w apce
z ekranu początkowego odrzuca takie pytanie **po cichu i zapamiętuje odmowę**
(przyczyna naprawiona w D-50: teraz pierwsze pytanie pada dopiero po dotknięciu
celownika). Jeśli decyzja została już zapamiętana, samo przestawienie
przełącznika może nie wystarczyć – trzeba wyczyścić stan apki:

1. Upewnij się, że żaden wpis nie czeka na wysłanie (w dzienniku nie ma
   znaczka „Czeka na wysłanie") – inaczej stracisz niezsynchronizowane wpisy.
2. Przytrzymaj ikonę BeBack na ekranie początkowym → **Usuń**.
3. Otwórz adres apki w Safari → przycisk udostępniania → **Dodaj do ekranu
   początkowego**.
4. Zaloguj się **hasłem** (D-53 – nie potrzeba do tego poczty).
5. Dotknij celownika na mapie → iOS zapyta o zgodę → **Zezwól**.

Od tej pory mapa centruje się na Twojej pozycji sama przy każdym otwarciu
(D-51) – celownik dotyka się raz.

## Logowanie: hasłem, nie linkiem

Apka z ekranu początkowego ma osobny magazyn danych niż Safari, więc klikany
link z e-maila loguje w Safari, a apka tej sesji nie widzi (pętla logowania).
Dlatego drogą podstawową jest **e-mail + hasło** (D-53), a drogą zapasową
**sześciocyfrowy kod** z e-maila (D-48) – nigdy klikany link. Przy pierwszym
logowaniu pozwól iPhone'owi zapamiętać hasło w pęku kluczy.

## Instalacja

iOS nie pokazuje monitu „zainstaluj apkę". Trzeba: otworzyć adres w **Safari**
(nie w Chrome), dotknąć przycisku udostępniania i wybrać **Dodaj do ekranu
początkowego**.
