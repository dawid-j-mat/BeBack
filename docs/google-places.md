# Google Places API – konfiguracja klucza (plaster 3, ~10 minut)

Lista „W pobliżu" i wyszukiwarka miejsc korzystają z Google Places API (New).
Klucz jest „publiczny" (jak anon key Supabase) – bezpieczeństwo zapewniają
ograniczenia klucza, nie jego tajność. Mimo to nie trzymamy go w repo.

**Uwaga o karcie:** Google wymaga podpięcia karty do konta Cloud nawet przy
korzystaniu wyłącznie z darmowego progu. Przy dwóch użytkownikach nasze zużycie
mieści się w darmowym limicie z ogromnym zapasem; mimo to warto raz w miesiącu
zerknąć w Billing → Reports.

## 1. Projekt i API

1. Wejdź na [console.cloud.google.com](https://console.cloud.google.com) i zaloguj się.
2. U góry: wybór projektu → **New project** → nazwa `beback` → Create → przełącz się na niego.
3. Jeśli konto nie ma rozliczeń: **Billing** → podepnij kartę (krok wymuszony przez Google).
4. **APIs & Services → Library** → wyszukaj **Places API (New)** → **Enable**.
   (Musi być wersja „(New)" – starej „Places API" nie włączaj.)

## 2. Klucz z ograniczeniami

1. **APIs & Services → Credentials → Create credentials → API key**. Skopiuj klucz.
2. Od razu kliknij **Edit API key** i ustaw:
   - **Application restrictions**: *Websites* – dodaj:
     - `https://be-back-blond.vercel.app/*`
     - `http://localhost:5173/*`
   - **API restrictions**: *Restrict key* → zaznacz tylko **Places API (New)**.
3. Save.

## 3. Klucz do aplikacji

- Lokalnie: w `.env.local` dopisz wiersz `VITE_GOOGLE_PLACES_KEY=twoj_klucz`.
- Vercel: **Settings → Environment Variables** → dodaj `VITE_GOOGLE_PLACES_KEY`
  z tą samą wartością → **Redeploy** (bez „Use existing Build Cache").

## 4. Test

Na telefonie (GPS!): FAB „+" → powinna pojawić się lista miejsc z okolicy.
Wyszukiwarka działa od 3 znaków. Jeśli lista pusta, a wyszukiwarka milczy –
zajrzyj w konsolę przeglądarki: błędy `Places … failed with 403` oznaczają
zwykle złe ograniczenia klucza (literówka w domenie) albo niewłączone API.
