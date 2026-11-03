# Agencja Cyfrowych Detektywów

Aplikacja dla uczniów (Windows, bez instalacji). To jeden plik `Agencja Cyfrowych Detektywów.exe`.
Przy każdym uruchomieniu sprawdza, czy na GitHubie są nowe materiały, i sama je pobiera.

**Pobierz aplikację:** [aplikacja/Agencja Cyfrowych Detektywów.exe](aplikacja/Agencja%20Cyfrowych%20Detektyw%C3%B3w.exe) (przycisk „Download raw file”).

## Dla ucznia
- Uruchom `Agencja Cyfrowych Detektywów.exe` i wybierz klasę.
- **Lekcje i misje** oraz **Sprawdziany** otwierają się we własnym oknie (Microsoft Edge).
- **Pliki do ćwiczeń** kopiuje pliki do folderu na Pulpicie i go otwiera.
- Materiały zapisują się w `%LOCALAPPDATA%\AgencjaCyfrowychDetektywow`. Bez internetu aplikacja działa na ostatnio pobranej wersji.

## Dla nauczyciela – jak wprowadzić poprawkę
1. Podmień albo dodaj pliki w folderze `tresc` (np. `tresc\klasa1\sprawdziany.html`).
2. Kliknij dwa razy **`PUBLIKUJ.bat`** i wpisz krótko, co się zmieniło.
3. Gotowe. Uczniowie dostaną zmiany przy następnym uruchomieniu aplikacji (GitHub potrzebuje do 5 minut).

### Dodanie klasy 2 lub 3
1. Wgraj materiały do `tresc\klasa2\` (np. `lekcje.html`, `sprawdziany.html`, `pliki-do-cwiczen\`).
2. W `menu.json` przy „Klasa 2” ustaw `"aktywna": true` i skopiuj `pozycje` z klasy 1, zmieniając ścieżki.
3. `PUBLIKUJ.bat`.

### Zmiana samej aplikacji (.exe)
Po zmianie `aplikacja\zrodlo\Program.cs`:
1. Zwiększ w nim `WersjaAplikacji`.
2. Uruchom `narzedzia\zbuduj-aplikacje.bat`.
3. Uruchom `PUBLIKUJ.bat`.

Uczniowie dostaną nowy plik .exe automatycznie, o ile aplikacja leży w folderze z prawem zapisu.

## Ważne
- Repozytorium jest **publiczne**. Nie wrzucaj tu haseł do sprawdzianów ani skryptu `ranking.gs`. Folder `DLA-NAUCZYCIELA` i pliki z „hasla” w nazwie są blokowane.
- Sprawdziany są zaszyfrowane hasłem, więc bez hasła nikt ich nie przeczyta.
