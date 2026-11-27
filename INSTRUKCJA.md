# Operacja Biegun — uruchomienie i bezpieczna migracja

## 1. Firebase Spark

1. Utwórz projekt Firebase, bez Analytics i bez płatnego planu.
2. Włącz Authentication: Anonymous dla uczniów, Email/Password dla prowadzących. Zweryfikuj na projekcie testowym, że ustawienia blokujące publiczną rejestrację kont e-mail nie wyłączają logowania anonimowego. Nie dodawaj formularza rejestracji organizatorów.
3. Konta prowadzących utwórz w konsoli. W Firestore w trybie produkcyjnym dodaj `admins/{UID}` (np. pole `role: organizer`). Zwykłe konto e-mail **nie daje** uprawnień organizatora.
4. Nie używaj kont emulatora w produkcji. Oddziel profil przeglądarki organizatora od stanowisk uczniów, włącz ochronę kont organizatorów.
5. Hosting pobiera konfigurację SDK z `/__/firebase/init.json`. Plik `local-config.json` dotyczy tylko localhost i projektu `demo-operacja-biegun`.

## 2. Najpierw lokalnie

Node 20+, npm i Java 21 w PATH/JAVA_HOME:

```powershell
npm ci
npm test
npm run test:rules
npm run emulators
```

W drugim terminalu:

```powershell
$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'
node tests/seed.cjs
```

Otwórz `http://127.0.0.1:5000`. Panel ma testowe konto z `tests/seed.cjs` (wyłącznie emulator). Testy reguł czyścić mogą tylko projekt demonstracyjny. Nie uruchamiaj ich z produkcyjnym ID. Przed ponownym `test:rules` zatrzymaj interaktywny emulator korzystający z tych samych portów.

## 3. Migracja istniejącej gry — obowiązkowa, kontrolowana

Nowe reguły **nie są zgodne ze starym schematem**. Nie ma samoczynnego usuwania ani przenoszenia danych. Przeprowadź próbę na kopii projektu, nie podczas trwającej gry. Opis wykonanej migracji istniejącej produkcji: [WDROZENIE.md](WDROZENIE.md). Poniższa procedura pozostaje instrukcją dla kolejnych instalacji lub kontroli ręcznej.

1. Uzgodnij okno techniczne. Wykonaj prywatną kopię starych dokumentów dostępnymi narzędziami organizatora (konsola / lokalny odczyt Admin SDK). Nie commituj eksportu: zawiera dawne sekrety i pseudonimy. Eksport zarządzany Google może wymagać Blaze — nie jest wymagany do tej migracji.
2. Uznaj dawne PIN-y i zaproszenia za ujawnione, także te w historii Git i na wydrukach. Nie używaj ich ponownie. Stare `config/ranking` nie jest już publicznie czytane.
3. Wdróż **najpierw reguły** z tego repozytorium, aby zamknąć publiczny odczyt `teams` i stare ścieżki zapisu. Stare telefony chwilowo nie zapiszą wyników — to zamierzone.
4. W konsoli Firestore (uprawnienia IAM omijają reguły aplikacji) ustaw `config/main`: `phase: break`, `mainEndsAt: Timestamp` z właściwą datą. Zachowaj nazwy szkół. Nie dodawaj sekretów do `config`.
5. Dla każdej zachowywanej drużyny doprowadź dokument do dokładnego schematu:
   - `name`, `school` 0–2, `createdAt` Timestamp, `createdBy` UID;
   - `unlocked`: tylko `s1`–`s4` ze statusem **true**, nigdy tekstem PIN-u;
   - `side`: tylko `p1`–`p9` ze statusem true (szyfr też true), bez oficjalnych punktów;
   - `soc: {}` (nie importuj postępu z localStorage), `registrationOpen: false`, `bonus` liczba całkowita 0–100;
   - usuń nieznane pola ze schematu po zabezpieczeniu kopii. Nie usuwaj dokumentów drużyn ani członków bez decyzji organizatora.
6. W konsoli utwórz dla historycznych zaliczeń `teams/{ID}/awards/{s1…s4}` z `by`, `at`, `emergency:true`, `reason: Migracja zatwierdzona przez organizatora`. Sam `unlocked` nie może już zawierać sekretu.
7. Dla każdej drużyny utwórz `leaderboard/{ID}` **wyłącznie** z `name`, `school`, `unlocked` (booleany), `bonus`, `updatedAt` Timestamp. Nie kopiuj całego prywatnego dokumentu. Sprawdź spójność z prywatnym stanem.
8. Przejrzyj członkostwa — dotychczas mogły powstawać bez autoryzacji. Cofnij nieuprawnione urządzenia i dodaj ich UID do `revoked`. Dawnego ID nie traktuj jako zaproszenia. Nowe tokeny wydaje panel.
9. Wdróż Hosting i wykonaj próbę dwóch telefonów. Dopiero potem ustaw `registration`, właściwy deadline i otwórz wybrane drużyny do rejestracji. Wersja kodu i reguł musi być zgodna.

Konto organizatora jest zaufane; konsola IAM/Admin SDK zawsze omija reguły. Dostępu do nich nie przekazujemy uczniom. `firestore.local.rules` jest identycznym zestawem bez PIN-ów, ale wdrażany jest `firestore.rules`.

### Narzędzia operatorskie użyte przy wdrożeniu

Korzystają wyłącznie z istniejącej sesji Firebase CLI. Token jest w pamięci, nie w plikach ani logach. Projekt jest celowo ograniczony do `operacja-biegun`. Wymagają `npm ci` i uprawnień właściciela/operatora.

1. Przygotuj **nowy, prywatny katalog poza repozytorium**. Na Windows ogranicz jego ACL do swojego konta i SYSTEM, bez dziedziczenia praw innych użytkowników. Backup zawiera dane kont Auth i dawne sekrety — nie publikuj go.
2. `node narzedzia/kopia-firebase.cjs KATALOG_PRYWATNY` — tylko odczyty: spójny `readTime` Firestore, podkolekcje, Auth, reguły, Hosting i kopia Git/kodu roboczego. Manifest SHA-256 sprawdza pliki; istniejący niepusty katalog nie zostanie nadpisany.
3. `node narzedzia/migracja-firebase.cjs KATALOG_PRYWATNY` — **wyłącznie plan**, bez zapisów. Niezgodne szkoły/bonusy zatrzymują migrację, zamiast po cichu zmieniać wynik.
4. Po testach i wdrożeniu restrykcyjnych reguł: `node narzedzia/migracja-firebase.cjs KATALOG_PRYWATNY --apply operacja-biegun`. Jeden atomowy commit, kontrola `updateTime` chroni zmiany od wykonania kopii. Zachowuje zaliczenia, szkoły, twórców i dokładnie istniejące członkostwa; nie dopisuje usuniętych członków. Zamyka dołączanie i ustawia przerwę.
5. `node narzedzia/migracja-firebase.cjs KATALOG_PRYWATNY --verify` — ponownie sprawdza prywatne/publiczne stany i zachowanie członkostw, bez modyfikacji.
6. Po wdrożeniu Hostingu: `node narzedzia/sprawdz-produkcje.cjs` — porównuje pliki z lokalną wersją i sprawdza odmowy publicznego odczytu danych prywatnych.
7. Tylko po świadomej decyzji: `node narzedzia/sprawdz-produkcje.cjs --open-registration operacja-biegun`. Zmienia wyłącznie etap z Przerwy na Rejestrację. Nie otwiera starych drużyn ani gry głównej. Przed grą ustaw w panelu właściwą datę, deadline i sale.

Kopia nie jest zarządzanym backupem Google Cloud i nie wymaga Blaze. Odtwarzanie to oddzielna, świadoma czynność operatorska z prywatnych plików; skrypty nie nadpisują automatycznie działającej bazy przy awarii. Nie cofaj reguł do wersji ujawniającej PIN-y.

## 4. Komendy wdrożenia — uruchamia ręcznie organizator

Po testach i kopii danych, z jawnym ID właściwego projektu:

```powershell
npx firebase login
npx firebase deploy --only firestore:rules --project TWOJ-PROJEKT
# Tutaj ręczna migracja w konsoli oraz kontrola prywatności.
npx firebase deploy --only hosting --project TWOJ-PROJEKT
```

Nie uruchamiaj ogólnego deploy w ciemno. Nie wdrażaj starych reguł przy rollbacku strony — przywróciłoby to wyciek. W awarii pozostaw restrykcyjne reguły, ustaw przerwę i popraw zgodność schematu.

## 5. Obsługa wydarzenia

- `#admin`: nazwy szkół, sale 1–4 (oddzielone `|`), rotacje, wiadomość centrali, etap i **pełny deadline**. Etapy: Rejestracja → Gra główna → Przerwa → Finał → Wydarzenie zakończone.
- Założyciel otrzymuje publiczny ID i sekret `ID.token` na 12 h. Sekret pokazuje tylko drużynie, nie na rzutniku. Nie zapisujemy go w URL ani localStorage. Po przeładowaniu nowe godzinne zaproszenie wydaje prowadzący.
- Uczeń składa prośbę zaproszeniem. Organizator: wybierz **Prowadź → Odśwież prośby i członków → Zatwierdź telefon**. Uczeń klika **Sprawdź zatwierdzenie**. Akceptacje są możliwe wyłącznie podczas rejestracji i przy otwartej drużynie.
- Zamknięcie rejestracji drużyny jest niezależne od etapu. Cofnięcie członkostwa blokuje UID; odzyskanie dostępu wymaga usunięcia blokady i ponownego procesu zaproszenia.
- Stacja: **Prowadź → właściwa stacja**. Najpierw **Otwórz śledztwo SOC**. Sprawdź cztery zadania: mail, portal, logi, konsolę SOC oraz osobno reakcję (etap 5). Nie zatwierdzaj wyłącznie na podstawie tekstu kodu raportu.
- Awaria sprzętu / późny zapis: zaznacz **Tryb awaryjny**, wpisz uzasadnienie min. 5 znaków i zatwierdź. Zapisuje się organizator, czas serwera i przyczyna. To świadomy wyjątek, nie furtka dla ucznia.
- Bonus 0–100 można zapisać tylko w etapie **Finał**. Zadania edukacyjne nie zmieniają oficjalnych punktów.
- `#ekran` działa bez logowania i nie musi być otwarty. `#final` też jest publiczny. Finał uruchamia organizator: odliczanie 5–600 s → cztery systemy co 3 s → zielony status i podium. Ponowne wejście odtwarza sekwencję z czasu konfiguracji, nie lokalnego licznika.
- Po teleturnieju kliknij **Zakończ wydarzenie i pokaż podium**. Pobierz CSV. Usuń uprawnienia organizatorów, którzy nie powinni ich zachować; ustal termin retencji danych.

## 6. Urządzenia i ograniczenia

- Gra: piaskownica bez sieci. F12 → Console → wybierz ramkę `about:srcdoc`. `localStorage` w niej jest atrapą w pamięci. Trzy poziomy pomocy: trop, narzędzie, instrukcja. Pełny reset jest dostępny zawsze.
- Czytnik: Android Chrome, HTTPS, NFC i własny tag NDEF koła. Zalogowany organizator zapisuje UID. **Nie ma pola PIN ani przycisku udającego kartę.** Użyj pełnego ekranu oraz systemowego przypięcia aplikacji Android (pełny ekran strony nie jest blokadą urządzenia).
- Pokaz obejmuje proste UID, nie zabezpieczenia wszystkich kart NFC. Nie skanuj kart uczniów. Emulację Flipper → Web NFC trzeba sprawdzić fizycznie; zależy od sprzętu i typu karty.
- Podczas awarii sieci ćwiczenie można dokończyć z wcześniej wczytanej strony. Potwierdzanie wymaga sieci; nie ma fałszywego lokalnego „zaliczono”. Nie czyść danych przeglądarki ucznia — utraci anonimowy UID i będzie potrzebował nowego zaproszenia.
- Skrypt `szyfruj-odpowiedzi.js` generuje tylko jawny rekwizyt do symulatora. Nie przekazuj mu sekretów ani nie używaj jego wyniku do autoryzacji.
- Ewentualny lokalny `SEKRETY.md` jest historyczną, ignorowaną przez Git ściągą. Aplikacja go nie czyta, a stare instrukcje i kody nie obowiązują. Zachowaj go wyłącznie w prywatnym archiwum lub usuń świadomie po kopii — nie publikuj go.

Próba generalna: [CHECKLISTA.md](CHECKLISTA.md). Scenariusze: [STACJE.md](STACJE.md).
