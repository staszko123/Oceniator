# Oceniator

Oceniator to lokalna aplikacja webowa do oceny jakości obsługi w kanałach telefonicznych i e-mail. System obsługuje karty oceny rozmów, maili oraz działań w systemach, a także ewidencję, dashboardy, raporty i panel administracyjny.

## Funkcje

- Formularze oceny rozmów, maili i działań w systemach.
- Ewidencja zapisanych kart z filtrowaniem, statusem, eksportem i podglądem.
- Dashboard jakości z widokami dla administratora oraz lidera.
- Raporty CSV/PDF z podglądem danych przed eksportem.
- Lokalny system logowania z rolami: administrator, dyrektor, lider, oceniający i podgląd.
- Panel administracyjny do zarządzania użytkownikami, rolami, specjalistami, liderami, działami, stanowiskami, celami i okresami.
- Struktura organizacyjna oparta o stabilne identyfikatory, dzięki czemu zmiana nazwy lidera lub specjalisty nie zrywa relacji w danych.

## Uruchomienie lokalne

Aplikacja jest statyczna i nie wymaga procesu build.

```powershell
python -m http.server 8080
```

Następnie otwórz:

```text
http://127.0.0.1:8080/
```

## Konta startowe

| Login | Hasło | Rola |
| --- | --- | --- |
| `admin` | `admin123` | Administrator |
| `dyrektor` | `dyrektor123` | Dyrektor |
| `lider01` | `lider123` | Lider demo |
| `lider02` | `lider123` | Lider demo |
| `lider` | `lider123` | Alias pierwszego lidera |
| `podglad` | `podglad123` | Podgląd |

Konta i role można edytować w panelu administracyjnym w sekcji użytkowników.

## Dane

Dane aplikacji są przechowywane lokalnie w przeglądarce przez `localStorage`. W panelu administratora można wczytać dane demo obejmujące działy, liderów, specjalistów i karty ocen.

## Struktura projektu

- `index.html` - główny szkielet aplikacji.
- `css/` - style interfejsu.
- `js/defs.js` - definicje formularzy i konfiguracja bazowa.
- `js/state.js` - stan aplikacji, migracje i uprawnienia.
- `js/forms.js` - formularze ocen.
- `js/ewidencja.js` - widok ewidencji.
- `js/dashboard.js` - dashboardy i analityka.
- `js/raporty.js` - raporty i eksporty.
- `js/admin.js` - panel administracyjny.
- `js/auth-module.js` - logowanie i role.
- `js/seed.js` - generator danych demo.

## Uwagi techniczne

Projekt nie ma obecnie skonfigurowanego bundlera ani test runnera. Podstawowa weryfikacja polega na uruchomieniu aplikacji lokalnie, przejściu przez logowanie, panel administracyjny, formularze i raporty oraz sprawdzeniu `git diff --check`.
