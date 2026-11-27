# Operacja Biegun – uruchomienie

Gra działa na darmowym planie Firebase (Spark). Nie podajesz karty płatniczej.

Linki po wdrożeniu (zamiast `TWOJ-PROJEKT` wstaw ID projektu):

| Link | Dla kogo |
|---|---|
| `https://TWOJ-PROJEKT.web.app` | uczniowie: QR na plakatach i ulotkach |
| `https://TWOJ-PROJEKT.web.app/#ekran` | rzutnik w holu |
| `https://TWOJ-PROJEKT.web.app/#admin` | koło: ustawienia, punkty z finału, usuwanie drużyn |
| `https://TWOJ-PROJEKT.web.app/#pulapka` | QR na plakacie „Darmowe pierniki” |
| `https://TWOJ-PROJEKT.web.app/#skarbiec` | laptopy na stacji 2 (symulator) |
| `https://TWOJ-PROJEKT.web.app/#drzwi` | telefon z Androidem przy drzwiach na stacji 4 (czytnik kart) |

---

## 1. Projekt w konsoli Firebase (~10 min)

1. Wejdź na https://console.firebase.google.com i kliknij **Utwórz projekt**, np. `operacja-biegun`. Google Analytics możesz wyłączyć.
2. **Build → Authentication → Rozpocznij → Metoda logowania** i włącz:
   - **Anonimowe** (uczniowie grają bez kont),
   - **E-mail/hasło** (dla organizatorów).
3. **Authentication → Ustawienia → Działania użytkownika**: odznacz **Włącz tworzenie (rejestrację)**. Konta adminów zakładasz tylko Ty.
4. **Authentication → Użytkownicy → Dodaj użytkownika**: e-mail i hasło dla siebie i każdej osoby z koła, która ma mieć panel. Skopiuj **UID** każdego konta.
5. **Build → Firestore Database → Utwórz bazę danych**: lokalizacja `europe-central2 (Warszawa)`, tryb **produkcyjny**.
6. W Firestore kliknij **Rozpocznij kolekcję** o nazwie `admins`. Dla każdego organizatora dodaj dokument:
   - **ID dokumentu** = skopiowany UID,
   - jedno pole, np. `rola` = `koło`.

## 2. Wdrożenie (~5 min, w terminalu w tym folderze)

```powershell
npm install -g firebase-tools
```
```powershell
firebase login
```
```powershell
firebase deploy --project TWOJ-PROJEKT
```

Polecenie wgrywa naraz stronę i reguły bezpieczeństwa bazy. Po zmianach w plikach uruchom je jeszcze raz.

## 3. Przed eventem

1. Wejdź na `#admin`, zaloguj się i wpisz **nazwy 3 szkół** oraz godzinę końca gry głównej.
2. Na laptopie do rzutnika zaloguj się w `#admin`, a potem otwórz `#ekran`. Tylko zalogowany ekran wysyła ranking na telefony uczniów (na dole ekranu widać „Ranking dla telefonów: wysłany o …”).
3. Wygeneruj kody QR, np. w dowolnym generatorze offline:
   - link główny na plakaty i ulotki,
   - link z `#pulapka` na plakat „Darmowe pierniki” (powieś go przy planie lekcji).
4. **Próba generalna:** 2 telefony, jedna drużyna. Jedna osoba zakłada drużynę, druga dołącza kodem. Wpiszcie PIN stacji i sprawdźcie, czy fragment klucza pojawia się na obu telefonach i na `#ekran`.
5. Po próbie usuń testową drużynę w `#admin`.

## PIN-y stacji

Repozytorium jest publiczne, więc **prawdziwych PIN-ów w nim nie ma**. Trzymacie je lokalnie w dwóch plikach, których git nie wysyła:

- `firestore.local.rules`: kopia `firestore.rules` z prawdziwymi PIN-ami zamiast zaślepek `PIN_STACJI_1…4` i `HASLO_SZYFRU`. To ten plik wgrywa `firebase deploy`.
- `SEKRETY.md`: ściąga dla prowadzących z PIN-ami i kodem wejścia do stacji 3.

Przy nowym komputerze: `copy firestore.rules firestore.local.rules`, wpisz PIN-y i wdrażaj. Telefony PIN-ów nie znają, serwer sam sprawdza każdy wpisany PIN.

Skąd się biorą PIN-y:

| Stacja | PIN |
|---|---|
| 1 · Przechwycenie | hasło routera testowego |
| 2 · Złam skarbiec | wynik symulatora `#skarbiec` (ustawiony w `public/index.html`) |
| 3 · Fałszywy Mikołaj | złożony z 3 fragmentów śledztwa (fragmenty i kod wejścia są w `public/index.html`) |
| 4 · Biuro Grincha | taki sam w regułach i w ustawieniach czytnika `#drzwi` na telefonie przy drzwiach |
| Szyfr elfów (zadanie poboczne) | słowo ukryte w szyfrze |

Żeby zmienić PIN: popraw go w `firestore.local.rules` (wielkimi literami, bez spacji) i uruchom `firebase deploy` jeszcze raz. PIN stacji 2 oraz kod wejścia i fragmenty stacji 3 są dodatkowo zaszyfrowane w `public/index.html`: przy zmianie wygeneruj nowe szyfrogramy poleceniem `node narzedzia/szyfruj-odpowiedzi.js` i wklej je do pliku, a PIN stacji 4 w ustawieniach czytnika `#drzwi`.

## Punkty

| Za co | Punkty |
|---|---|
| Każda stacja (wpisany PIN) | 100 |
| Prezent czy pułapka? | 30 |
| Hasło do sań | 20 |
| Szyfr elfów | 20 |
| Co zdradza zdjęcie? | 20 |
| Darmowe pierniki (QR) | 30 |
| Finał (opcjonalnie, wpisuje admin) | 0–100 |

Ranking szkół to **średnia punktów drużyn, które zaliczyły co najmniej 1 stację**. Puste drużyny-żarty nie zaniżają wyniku szkoły, a więcej drużyn nie daje przewagi.

## Ciekawostka na stoisko koła

- Telefony same zapisują postęp do bazy. Przed oszustwami chroni ją `firestore.rules`: postępu nie da się cofnąć, a stacji nie da się zaliczyć bez prawdziwego PIN-u, nawet zapisując do bazy z konsoli przeglądarki.
- Kod drużyny działa jak zaproszenie: kto go zna, ten może dołączyć. To dobry temat do rozmowy o tym, czym różni się identyfikator od hasła.
