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

## 4. Logowanie kodem – własny SMTP + szablon e-maila (od sesji 11, D-48/D-52)

Apka loguje **sześciocyfrowym kodem**, nie klikanym linkiem: na iPhonie
zainstalowana apka (z ekranu początkowego) ma osobny magazyn niż Safari, więc
link z maila logował w Safari, a apka sesji nie widziała. Kod przepisuje się
w dowolnym kontekście, więc działa wszędzie tak samo.

### 4a. Podepnij własny SMTP (warunek konieczny)

Wbudowana poczta Supabase **blokuje edycję szablonów** (Authentication → Emails
pokazuje baner „Set up custom SMTP to edit templates") i wysyła domyślny mail
z **linkiem**, nie kodem. Żeby w mailu pojawił się kod, trzeba podpiąć własnego
nadawcę (SMTP). Przy okazji znika limit 2 maile/h wbudowanej poczty. Ten sam
SMTP posłuży do zaproszeń (backlog).

Nadawca bez własnej domeny – **Brevo** (darmowe 300 maili/dzień):
1. Załóż konto na brevo.com.
2. **Senders & IP → Senders** → dodaj adres nadawcy (może być Twój Gmail) →
   potwierdź klikając link z maila weryfikacyjnego Brevo.
3. **SMTP & API → SMTP** → „Generate a new SMTP key". Zanotuj z tej strony:
   serwer `smtp-relay.brevo.com`, port `587`, **Login** (uwaga: Brevo pokazuje
   go na tej stronie – w nowszych kontach to wygenerowany adres w rodzaju
   `8xxxxx001@smtp-brevo.com`, nie Twój e-mail) i klucz SMTP (hasło).

W Supabase: **Authentication → Emails → Set up SMTP** (przycisk z banera):
- **Enable Custom SMTP**: włącz,
- **Sender email**: potwierdzony adres nadawcy z Brevo,
- **Sender name**: `BeBack`,
- **Host**: `smtp-relay.brevo.com`, **Port**: `587`,
- **Username**: Login ze strony SMTP & API Brevo, **Password**: klucz SMTP,
- Zapisz.

Po włączeniu własnego SMTP dawny limit 2 maile/h znika; w zamian obowiązuje
limit Supabase z **Authentication → Rate Limits** (domyślnie ok. 30 maili/h –
w razie potrzeby można podnieść tam suwakiem).

(Uwaga na dostarczalność: mail „od" adresu Gmail wysłany cudzym SMTP-em może
czasem wpaść do spamu – w zaufanym gronie wystarczy raz oznaczyć „to nie spam".
Własna domena rozwiązuje to docelowo.)

### 4b. Szablon e-maila z kodem

Dopiero teraz pola są edytowalne. **Authentication → Emails → Magic Link**:
- **Subject**: `Twój kod logowania do BeBack`,
- **Body** (przełącz na „Source" i wklej):

```html
<h2>Logowanie do BeBack</h2>
<p>Twój kod logowania:</p>
<p style="font-size:28px; font-weight:bold; letter-spacing:4px;">{{ .Token }}</p>
<p>Wpisz go w aplikacji. Kod jest ważny przez godzinę.</p>
```

`{{ .Token }}` to sześciocyfrowy kod; brak `{{ .ConfirmationURL }}` (linku) jest
celowy – żeby na iPhonie nikt nie kliknął linku z przyzwyczajenia i nie wpadł
w pętlę logowania poza apką.

**Authentication → URL Configuration** – **Site URL** nadal ustaw
(`http://localhost:5173`, a docelowo adres z Vercela); Redirect URLs nie są przy
logowaniu kodem potrzebne, ale nie przeszkadzają.

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

## 6a. Administrator (od plastra 9)

Na istniejącym projekcie uruchom w SQL Editorze migrację
`supabase/migrations/2026-07_plaster9_app_settings.sql` (świeży projekt ma
te tabele już w `schema.sql`). Potem mianuj admina – tylko konto z tabeli
`admins` widzi w apce przełącznik „Źródło miejsc" i może go zmieniać:

```sql
insert into public.admins (user_id) values ('<uuid konta z Authentication → Users>');
```

Tabela `admins` nie ma żadnych polityk zapisu – admina da się mianować
wyłącznie tutaj, nigdy z aplikacji.

## 7. Test końcowy plastra

1. `git pull`, `npm run dev`, otwórz `http://localhost:5173`.
2. Ekran logowania → wpisz swój e-mail → **Wyślij kod** → przepisz z poczty
   sześciocyfrowy kod → **Zaloguj** → mapa z Twoim podpisem w prawym górnym rogu.
3. W oknie prywatnym przeglądarki zaloguj się na drugie konto.
4. E-mail spoza dwóch kont → aplikacja pokazuje błąd wysyłki (rejestracja zamknięta).
