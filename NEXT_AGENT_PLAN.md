# Plan dalszych prac dla kolejnego agenta

Stan na branchu: `codex/admin-system-upgrades`

Repozytorium: `https://github.com/staszko123/Oceniator`

## Kontekst

Oceniator to statyczna aplikacja webowa bez bundlera i bez test runnera. Uruchamia sie lokalnie przez:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Glowne dane sa w `localStorage`. Kluczowe moduly:

- `index.html` - shell aplikacji i modale.
- `js/main.js` - boot aplikacji, dynamiczne CSS/moduly.
- `js/auth-module.js` - logowanie i role.
- `js/state.js` - stan, migracje, role, scope lidera.
- `js/forms.js` - formularze ocen.
- `js/ewidencja.js` - ewidencja, eksport/import.
- `js/dashboard.js` - dashboard i wykresy.
- `js/raporty.js` - raporty CSV/PDF.
- `js/admin.js` - panel administracyjny.
- `js/skills/*` - engine i skille asystenta oceny dodane w ostatnich commitach remote.

## Co zostalo juz zrobione

1. Start aplikacji nie zostaje juz domyslnie w roli admina, zanim auth potwierdzi sesje.
2. Uszkodzony JSON w `oc_session_v1` i `oc_users_v1` jest czyszczony i prowadzi do ekranu logowania.
3. Brak Chart.js nie powinien wywalac dashboardu, ewidencji ani widoku `Moj Zespol`.
4. Stare nadpisywane funkcje `buildAdmin` i `adminOrgHtml` w `admin.js` zostaly odlaczone od aktywnych nazw.
5. Dodano `SMOKE_CHECKS.md` z podstawowa checklista przed demo.

## Priorytet 0: zachowac stabilnosc demo

Nie przebudowywac architektury przed demo. Najpierw poprawiac male, izolowane problemy:

1. Logowanie i role.
2. Glowne flow karty oceny.
3. Ewidencja i podglad.
4. Dashboard/raporty.
5. Panel admina tylko w zakresie blokujacym demo.

## Priorytet 1: smoke test reczny

Wykonac pelna checklistę z `SMOKE_CHECKS.md`.

Szczegolnie sprawdzic:

- `admin / admin123`
- `lider01 / lider123`
- `lider02 / lider123`
- `podglad / podglad123`
- odswiezenie strony po zalogowaniu
- uszkodzony `localStorage`
- brak internetu/CDN
- widoki 1366px i ok. 390px
- dark mode
- konsola DevTools bez nowych `error`

Wyniki dopisac w komentarzu PR albo w nowym pliku `SMOKE_RESULTS.md`.

## Priorytet 2: zabezpieczenie danych renderowanych przez innerHTML

Ryzyko: wiele widokow sklada HTML przez stringi i wstawia dane z formularzy/importu.

Pliki:

- `js/ewidencja.js`
- `js/admin.js`
- `js/forms.js`
- `js/raporty.js`
- `js/dashboard.js`

Plan:

1. Uzyc istniejacego `escHtml` albo przeniesc helper do wspolnego miejsca.
2. Zaczac od `ewidencja.js`, bo renderuje dane specjalisty, dzialu, stanowiska, notatek i importu JSON.
3. Potem `admin.js`, szczegolnie historia zmian i listy osob.
4. Na koniec raporty PDF/HTML i podglady.

Kryterium akceptacji:

- wpisanie w nazwie specjalisty tekstu typu `<img src=x onerror=alert(1)>` nie wykonuje JS i renderuje sie jako tekst.

## Priorytet 3: auth i fail-closed

Pliki:

- `js/main.js`
- `js/auth-module.js`
- `js/state.js`
- `js/admin.js`

Plan:

1. Sprawdzic, czy app shell przed zalogowaniem nie pozwala kliknac admin/formularzy spod overlay loginu.
2. Dla niepoprawnej sesji czyscic tylko sesje, nie dane demo.
3. Upewnic sie, ze `activeRole()` po braku sesji zawsze daje `viewer`.
4. Zrobic reczny test roli `viewer`, `leader`, `admin`.

## Priorytet 4: Chart.js/CDN i offline

Pliki:

- `index.html`
- `js/main.js`
- `js/ewidencja.js`
- `js/dashboard.js`
- `js/my-team.js`

Plan:

1. Recznie zasymulowac brak Chart.js.
2. Sprawdzic, czy tabele i KPI pozostaja widoczne.
3. Docelowo rozwazyc lokalna kopie Chart.js albo prosty tryb bez wykresow.

## Priorytet 5: panel admina

Plik najbardziej ryzykowny: `js/admin.js`.

Plan:

1. Zweryfikowac, czy aktywna funkcja `buildAdmin()` pokazuje:
   - uzytkownikow i konta,
   - zespoly liderow,
   - specjalistow i przypisania,
   - slowniki,
   - cele i okresy,
   - uprawnienia i historie.
2. Sprawdzic `Wczytaj demo`.
3. Sprawdzic edycje specjalisty i przypisania lidera.
4. Sprawdzic, czy login `lider01` nadal widzi prawidlowy zespol po zmianach w adminie.

## Priorytet 6: formularz oceny

Pliki:

- `js/forms.js`
- `js/calc.js`
- `js/draft.js`
- `js/state.js`
- `css/forms-ux-spacing.css`
- `css/forms-saas.css`

Plan:

1. Sprawdzic walidacje pustego formularza.
2. Sprawdzic zapis szkicu i odswiezenie.
3. Sprawdzic zmiane liczby kontaktow.
4. Sprawdzic punktacje `1`, `0.5`, `0`, `N/D`.
5. Sprawdzic zlote punkty.
6. Sprawdzic zapis i ponowne otwarcie w ewidencji.

## Priorytet 7: dashboard i raporty

Pliki:

- `js/dashboard.js`
- `js/raporty.js`
- `js/ewidencja.js`

Plan:

1. Porownac liczby: ewidencja vs dashboard vs raport summary.
2. Sprawdzic filtry okresu, typu, specjalisty, dzialu i oceny.
3. Sprawdzic eksport CSV z cudzyslowami w polach.
4. Sprawdzic PDF specjalisty.
5. Sprawdzic, czy archiwalne karty nie wchodza do aktywnych KPI.

## Priorytet 8: responsywnosc i UI

Pliki:

- `css/style.css`
- `css/theme-overrides.css`
- `css/dark-premium.css`
- `css/login-mobile.css`
- `css/score-sidebar.css`
- `css/skills.css`

Plan:

1. Laptop 1366px: sidebar, start, formularz, dashboard, admin.
2. Mobile ok. 390px: logowanie, sidebar, formularz, ewidencja, admin.
3. Dark mode: kontrast tabel, badge, przyciskow i modalow.
4. Sprawdzic, czy nowy panel skilli nie nachodzi na final score/formularz.

## Priorytet 9: podstawowe testy automatyczne

Projekt nie ma bundlera ani test runnera. Minimalny zestaw:

1. Dodać prosty smoke script bez bundlera, np. `scripts/smoke-static.mjs`.
2. Sprawdzac:
   - istnienie kluczowych plikow,
   - brak konflikt markerow `<<<<<<<`,
   - brak podwojnych aktywnych definicji `function buildAdmin(`,
   - obecne skrypty w `index.html`,
   - `git diff --check`.
3. Docelowo dodac Playwright, jesli projekt ma miec realne testy UI.

## Ryzyka techniczne

- Globalny stan i kolejnosc ladowania skryptow.
- Brak test runnera.
- `localStorage` jako jedyne zrodlo prawdy.
- `innerHTML` z danymi uzytkownika/importu.
- CDN dla fontow i Chart.js.
- Duze pliki `admin.js`, `forms.js`, `dashboard.js`.

## Ryzyka UX

- Mobile moze byc trudny w tabelach i szerokim formularzu.
- Dark mode wymaga recznej kontroli kontrastu.
- Sidebar i wiele akcji administracyjnych moga byc przytlaczajace przed demo.
- Reset/demo data to mocne akcje i powinny miec czytelne potwierdzenia.

## Proponowana kolejnosc dla kolejnego agenta

1. Przeczytaj `SMOKE_CHECKS.md`.
2. Uruchom app lokalnie.
3. Wykonaj smoke test i zapisz wyniki.
4. Napraw tylko bledy blokujace demo.
5. Zabezpiecz `innerHTML` w `ewidencja.js`.
6. Zweryfikuj role i panel admina.
7. Dopiero potem refaktoryzuj wieksze moduly.
