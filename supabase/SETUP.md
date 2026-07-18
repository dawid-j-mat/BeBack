# Supabase – konfiguracja projektu (plaster 2, ~15 minut)

Kroki wykonywane raz, ręcznie, w przeglądarce. Sekrety (URL i klucz) nie trafiają
do repozytorium – tylko do `.env.local` na Twoim komputerze i do panelu Vercela.

## 1. Załóż projekt

1. Wejdź na [supabase.com](https://supabase.com) → zaloguj się (może być kontem GitHub).
2. **New project**: nazwa np. `beback`, region **EU (Frankfurt)**, wygeneruj i zapisz
   hasło bazy (nie będzie potrzebne na co dzień).
3. Po utworzeniu: **Project Settings → API**. Zanotuj dwie wartości:
   - **Project URL** (np. `https://abcdefgh.supabase.co`),
   - **anon public** key (długi ciąg znaków; to klucz *publiczny* – bezpieczeństwo
     danych gwarantują reguły RLS, nie jego tajność).

## 2. Utwórz tabele i reguły dostępu

1. W menu z lewej: **SQL Editor** → **New query**.
2. Wklej całą zawartość pliku `supabase/schema.sql` z repo → **Run**.
   Powinno zakończyć się bez błędów („Success. No rows returned").

## 3. Zamknij rejestrację i załóż dwa konta

1. **Authentication → Sign In / Providers**: w sekcji ustawień użytkowników
   wyłącz **„Allow new users to sign up"**.
2. **Authentication → Users → Add user → Create new user**: podaj swój e-mail
   (zaznacz „Auto Confirm User"). Powtórz dla e-maila partnerki.

## 4. Adresy powrotu magic linka

**Authentication → URL Configuration**:
- **Site URL**: `http://localhost:5173`
- **Redirect URLs** – dodaj adres z Vercela, gdy powstanie
  (np. `https://beback-xxx.vercel.app`).

## 5. Sprawdź RLS (obowiązkowe)

W **SQL Editorze** uruchom zawartość `supabase/rls_check.sql`.
Wynik musi być jednym wierszem **PASS** – to dowód, że drugi użytkownik widzi
wpisy, ale nie widzi cudzych notatek prywatnych. Jakikolwiek błąd „FAIL: …" =
stop, nie testujemy apki dalej, tylko wracamy do mnie.

## 6. Klucze do aplikacji

Na komputerze, w katalogu `BeBack`, utwórz plik `.env.local`:

```
VITE_SUPABASE_URL=twoj_project_url
VITE_SUPABASE_ANON_KEY=twoj_anon_key
```

W Vercelu: **Project → Settings → Environment Variables** – dodaj te same dwie
zmienne i zrób redeploy.

## 7. Test końcowy plastra

1. `git pull`, `npm run dev`, otwórz `http://localhost:5173`.
2. Ekran logowania → wpisz swój e-mail → **Wyślij link** → klik w link z poczty →
   mapa z Twoim podpisem w prawym górnym rogu.
3. W oknie prywatnym przeglądarki zaloguj się na drugie konto.
4. E-mail spoza dwóch kont → aplikacja pokazuje błąd wysyłki (rejestracja zamknięta).
