# Oceniator

Oceniator to statyczna aplikacja webowa do oceny jakości obsługi w kanałach telefonicznych, e-mail i systemowych. Aplikacja działa lokalnie lub z GitHub Pages, a dane produkcyjne są przechowywane w Supabase.

## Funkcje

- Formularze oceny rozmów, maili i działań w systemach.
- Ewidencja zapisanych kart z filtrowaniem, statusem, eksportem i podglądem.
- Dashboard jakości z widokami dla administratora, dyrektora, lidera i oceniającego.
- Raporty CSV/PDF z podglądem danych przed eksportem.
- Logowanie przez Supabase Auth.
- Panel administracyjny do zarządzania profilami użytkowników, rolami, specjalistami, działami, stanowiskami, celami i okresami.
- Dane demo oraz import lokalny są wyłączone w trybie Supabase, żeby nie mieszać danych testowych z produkcyjnymi.

## Uruchomienie lokalne

Aplikacja jest statyczna i nie wymaga procesu build.

```powershell
python -m http.server 8080
```

Następnie otwórz:

```text
http://127.0.0.1:8080/
```

## Supabase

Konfiguracja klienta znajduje się w `js/supabase-config.js`. W repozytorium może znajdować się tylko publiczny anon key. Klucza `service_role` nie należy dodawać do kodu frontendowego.

Schemat bazy i skrypty pomocnicze są w katalogu `supabase/`:

- `rls_hardening.sql` - polityki RLS i funkcje pomocnicze.
- `delete_demo_cards.sql` - czyszczenie kart demo z tabeli `assessments`.
- `set_jakub_admin.sql` - przykład nadania roli administratora wskazanemu profilowi.
- `set_jakub_password.sql` - przykład ustawienia hasła po stronie Supabase Auth.
- `functions/admin-users/` - Edge Function do tworzenia kont Auth z panelu administratora.

Wdrożenie funkcji użytkowników:

```powershell
supabase functions deploy admin-users
```

Funkcja wymaga standardowych zmiennych środowiskowych Supabase, w tym `SUPABASE_SERVICE_ROLE_KEY`, po stronie Supabase. Tego klucza nie wolno dodawać do `js/supabase-config.js`.

## Użytkownicy

Po wdrożeniu Edge Function konto można utworzyć z panelu administracyjnego Oceniatora. Formularz tworzy konto w Supabase Auth oraz odpowiadający profil w tabeli `profiles`. Bez podania hasła tymczasowego Supabase wyśle zaproszenie email.

Dalsze zarządzanie odbywa się w panelu administracyjnym:

- rola,
- zakres lidera,
- aktywność konta,
- imię i nazwisko.

## Dane

W trybie Supabase ewidencja, słowniki, cele i profile są pobierane z bazy. LocalStorage zostaje tylko jako mechanizm pomocniczy dla ustawień UI, sesji roboczej i zgodności ze starym trybem lokalnym.

Jeśli aplikacja była wcześniej używana lokalnie, panel administracyjny może pokazać narzędzia migracji. Po przeniesieniu danych do Supabase lokalne dane produkcyjne można wyczyścić.

## Struktura projektu

- `index.html` - główny szkielet aplikacji.
- `css/` - style interfejsu.
- `js/supabase-config.js` - konfiguracja Supabase.
- `js/dataStore.js` - warstwa danych local/Supabase.
- `js/auth-module.js` - logowanie i sesja użytkownika.
- `js/forms.js` - formularze ocen.
- `js/ewidencja.js` i `js/ewidencja-premium.js` - widok ewidencji.
- `js/dashboard.js` - dashboardy i analityka.
- `js/raporty.js` - raporty i eksporty.
- `js/admin.js` - panel administracyjny.
- `js/seed.js` - dane demo, blokowane w trybie Supabase.

## Weryfikacja

Podstawowa weryfikacja po zmianach:

```powershell
$node='C:\Users\stanl\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node --check js\admin.js
& $node --check js\dataStore.js
& $node --check js\ewidencja.js
& $node --check js\seed.js
git diff --check
```
