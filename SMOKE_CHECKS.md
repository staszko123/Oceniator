# Smoke check przed demo

## Uruchomienie

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Otworz `http://127.0.0.1:8080/`.

## Sciezka krytyczna

1. Zaloguj sie jako `admin / admin123`.
2. Wejdz w `Panel Admina` i uruchom `Wczytaj demo`.
3. Przejdz do `Start`, `Dashboard`, `Ewidencja`, `Raporty`.
4. Wypelnij nowa karte rozmowy:
   - wybierz specjaliste z listy,
   - ustaw date,
   - uzupelnij przynajmniej jeden identyfikator kontaktu,
   - zmien kilka ocen,
   - zapisz karte.
5. Sprawdz, czy karta pojawia sie w `Ewidencji`.
6. Otworz podglad karty i zamknij go.
7. W `Raportach` wygeneruj podglad CSV dla aktywnych kart.
8. Odswiez strone i sprawdz, czy dane oraz sesja nie psuja aplikacji.

## Role

1. Wyloguj sie i zaloguj jako `lider01 / lider123`.
2. Sprawdz, czy widoczny jest tylko zakres lidera.
3. Sprawdz, czy `Moj Zespol`, `Dashboard`, `Ewidencja` i `Raporty` otwieraja sie bez pustych widokow.
4. Wyloguj sie i zaloguj jako `podglad / podglad123`.
5. Sprawdz, czy akcje zapisu, admina i trwalego usuwania sa zablokowane.

## UI i stabilnosc

1. Przelacz motyw jasny/ciemny na kazdym glownym widoku.
2. Sprawdz szerokosc laptopowa ok. `1366px`.
3. Sprawdz mobile ok. `390px`.
4. Rozwin i zwin sidebar.
5. Otworz DevTools i upewnij sie, ze konsola nie pokazuje nowych `error`.
6. Zablokuj internet/CDN albo odswiez offline i sprawdz, czy brak Chart.js nie wysypuje aplikacji.

## localStorage

1. W DevTools ustaw uszkodzona sesje:

```js
localStorage.setItem('oc_session_v1','{bad json');
location.reload();
```

Oczekiwane: aplikacja pokazuje ekran logowania i nie zostaje w roli admina.

2. Przywroc dane:

```js
localStorage.removeItem('oc_session_v1');
location.reload();
```
