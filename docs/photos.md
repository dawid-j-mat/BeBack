# Zdjęcia – konfiguracja Storage (plaster 6, ~5 minut)

Wpis może mieć **jedno** zdjęcie. Trafia skompresowane (cel ≤ 300 KB) do Supabase
Storage, do kubełka `photos`, pod ścieżkę `{twoje_id}/{id_wpisu}.jpg`. Kubełek jest
**prywatny** – zdjęcia pokazują się przez krótkotrwałe „podpisane" adresy, a nie
publiczny link. Krok wykonywany raz.

## 1. Uruchom migrację

W Supabase: **SQL Editor → New query** → wklej całą zawartość
`supabase/migrations/2026-07_plaster6_photos.sql` → **Run**.

Tworzy prywatny kubełek `photos` i reguły dostępu (RLS):
- **odczyt** – każde zalogowane konto z grona widzi zdjęcia (jak wpisy),
- **zapis / wymiana / kasowanie** – tylko właściciel, wyłącznie we własnym folderze
  `{twoje_id}/…` (bazę pilnuje pierwszy człon ścieżki, nie kod aplikacji).

Powinno zakończyć się bez błędów. Jeśli zobaczysz „bucket already exists" – to nic
złego (wstawienie kubełka jest idempotentne); ważne, by przeszły cztery polityki.

## 2. Sprawdzenie w aplikacji

Nie ma nowych zmiennych środowiskowych – Storage jedzie po tym samym kluczu
Supabase co reszta. Po migracji:

1. `npm run dev`, dodaj wpis i w kroku „opis" dotknij **Dodaj zdjęcie** – system
   zaproponuje aparat albo galerię (na telefonie oba; na laptopie zwykle pliki).
2. Po przybiciu pieczątki otwórz wpis na mapie lub w dzienniku – zdjęcie powinno
   być w białej ramce z narożnikami.
3. Wejdź w **Edytuj** – możesz wymienić zdjęcie (dotknięcie kadru) albo usunąć („×").

Jeśli zdjęcie się nie wgrywa (a wpis zapisuje się bez niego, z krótkim komunikatem):
zajrzyj w konsolę przeglądarki – błąd `new row violates row-level security policy`
oznacza zwykle, że migracja z punktu 1 nie przeszła w całości.
