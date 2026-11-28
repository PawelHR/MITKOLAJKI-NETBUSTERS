# Operacja Biegun — uruchomienie i bezpieczna migracja

## 1. Firebase Spark

1. Utwórz projekt Firebase, bez Analytics i bez płatnego planu.
2. Włącz Authentication: Anonymous dla uczniów, Email/Password dla prowadzących. Zweryfikuj na projekcie testowym, że ustawienia blokujące publiczną rejestrację kont e-mail nie wyłączają logowania anonimowego. Nie dodawaj formularza rejestracji organizatorów.
3. Konta prowadzących utwórz w konsoli. W Firestore w trybie produkcyjnym dodaj `admins/{UID}` (np. pole `role: organizer`). Zwykłe konto e-mail **nie daje** uprawnień organizatora.
4. Nie używaj kont emulatora w produkcji. Oddziel profil przeglądarki organizatora od stanowisk uczniów, włącz ochronę kont organizatorów.
5. Hosting pobiera konfigurację SDK z `/__/firebase/init.json`. Plik `local-config.json` dotyczy tylko localhost i projektu `demo-operacja-biegun`.

## 2. Najpierw lokalnie

Node 20+, npm i Java 21+ (np. JDK 22) w PATH/JAVA_HOME:

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
    - `side`: `p1`–`p8` ze statusem true (szyfr też true), bez oficjalnych punktów; wcześniejsze `p9` zachowaj wyłącznie jako historię, nowe zapisy są zabronione;
   - `soc: {}` (nie importuj postępu z localStorage), `registrationOpen: false`, `bonus` liczba całkowita 0–100; krótki `joinCode` i indeks kodów uzupełnia się osobnym krokiem opisanym niżej; `memberCount` (liczba członków, maks. 4) ustaw w panelu: `#admin → Prowadź → Ustaw licznik` — bez niego nikt nie dołączy kodem;
   - usuń nieznane pola ze schematu po zabezpieczeniu kopii. Nie usuwaj dokumentów drużyn ani członków bez decyzji organizatora.
6. W konsoli utwórz dla historycznych zaliczeń `teams/{ID}/awards/{s1…s4}` z `by`, `at`, `emergency:true`, `reason: Migracja zatwierdzona przez organizatora`. Sam `unlocked` nie może już zawierać sekretu.
7. Dla każdej drużyny utwórz `leaderboard/{ID}` **wyłącznie** z `name`, `school`, `unlocked` (booleany), `bonus`, `updatedAt` Timestamp. Nie kopiuj całego prywatnego dokumentu. Sprawdź spójność z prywatnym stanem.
8. Przejrzyj członkostwa — dotychczas mogły powstawać bez autoryzacji. Cofnij nieuprawnione urządzenia i dodaj ich UID do `revoked`. Dawnego ID nie traktuj jako kodu dołączania. Nowy 6-znakowy kod tworzy założyciel lub organizator w panelu.
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
8. Uzupełnienie krótkich kodów starszych drużyn: `node narzedzia/kody-druzyn.cjs NOWA_KOPIA` pokazuje plan. Zapis wymaga `--apply operacja-biegun`; dodatkowe `--open-existing` świadomie otwiera dołączanie do uzupełnianych drużyn. Operacja jest atomowa, kontroluje `updateTime`, nie zmienia wyników ani członkostw i nie wypisuje kodów w logach. Przed nią wykonaj nową kopię; nie używaj starej kopii sprzed zmian stanu gry.
9. Flagi labów: po prywatnej kopii `node narzedzia/flagi-stacji.cjs NOWA_KOPIA` pokazuje plan czterech dokumentów `stationFlags/{s1…s4}`. Po wdrożeniu reguł użyj `--apply operacja-biegun`, potem `--verify`, następnie wdróż Hosting. Zapisuje tylko konfigurację flag zgodną z publicznym `station-flags.js`; nie zmienia drużyn, członkostw, wyników ani etapu. Przy nowej instalacji innego projektu operator ustawia w konsoli cztery dokumenty z `value` zgodnym z modułem i `active: true`. Publiczny moduł jest rekwizytem, nie sekretem.

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
- Gracz wybiera **Zakładam drużynę**, wpisuje nazwę/szkołę/pseudonim i sam tworzy drużynę. Na jej ekranie widzi **6-znakowy kod do dołączenia**.
- Koledzy wybierają **Mam kod drużyny**, wpisują kod i pseudonim, klikają **Dołącz** i od razu są członkami. Nie ma długiego zaproszenia ani zatwierdzania przez prowadzącego. Wielkość liter i spacje nie mają znaczenia. Kod jest widoczny członkom po ponownym otwarciu aplikacji.
- Dołączanie działa w etapie Rejestracja i przy otwartej drużynie. Publiczny ID dla prowadzącego nie jest kodem. Twórca może zamknąć dołączanie lub zmienić kod; organizator ma te same możliwości w **Prowadź**. Stary kod po zmianie nie działa, ale obecni członkowie pozostają.
- Cofnięcie członkostwa blokuje UID; nawet poprawny kod nie przywraca usuniętego telefonu. Organizator może świadomie usunąć blokadę. Starsze prośby pozostają dostępne w panelu dla zgodności, ale nowi gracze ich nie tworzą.
- Kto zna krótki kod, może dołączyć. Nie pokazuj kodu w publicznym rankingu ani na rzutniku. Na Spark nie ma pełnego serwerowego limitowania prób — przy wycieku zmień kod lub zamknij drużynę.
- Stacja: drużyna otwiera stronę ćwiczenia, kończy zadanie i wpisuje pokazaną flagę w **Laboratoria → właściwy lab → Zalicz lab**. Nie czeka na prowadzącego. SOC rozpoczyna sama; flaga pojawia się po czterech zadaniach (konsola SOC = 4) i osobnej reakcji (5). Serwer porównuje flagę, sprawdza członkostwo, etap i deadline; zapisuje audyt, status i ranking atomowo, bez powtórnych punktów.
- Awaria sprzętu / późny zapis: zaznacz **Tryb awaryjny**, wpisz uzasadnienie min. 5 znaków i zatwierdź. Zapisuje się organizator, czas serwera i przyczyna. To świadomy wyjątek, nie furtka dla ucznia.
- Bonus 0–100 można zapisać tylko w etapie **Finał**. Zadania edukacyjne nie zmieniają oficjalnych punktów.
- `#ekran` działa bez logowania i nie musi być otwarty. `#final` też jest publiczny. Finał uruchamia organizator: odliczanie 5–600 s → cztery systemy co 3 s → zielony status i podium. Ponowne wejście odtwarza sekwencję z czasu konfiguracji, nie lokalnego licznika.
- Po teleturnieju kliknij **Zakończ wydarzenie i pokaż podium**. Pobierz CSV. Usuń uprawnienia organizatorów, którzy nie powinni ich zachować; ustal termin retencji danych.

## 6. Urządzenia i ograniczenia

- Gra: piaskownica bez sieci. F12 → Console → wybierz ramkę `about:srcdoc`. `localStorage` w niej jest atrapą w pamięci. Trzy poziomy pomocy: trop, narzędzie, instrukcja. Pełny reset jest dostępny zawsze.
- Czytnik: Android Chrome, HTTPS, NFC i własny tag NDEF koła. Zalogowany organizator zapisuje UID. **Nie ma pola PIN ani przycisku udającego kartę.** Użyj pełnego ekranu oraz systemowego przypięcia aplikacji Android (pełny ekran strony nie jest blokadą urządzenia).
- Pokaz obejmuje proste UID, nie zabezpieczenia wszystkich kart NFC. Nie skanuj kart uczniów. Emulację Flipper → Web NFC trzeba sprawdzić fizycznie; zależy od sprzętu i typu karty.
- Podczas awarii sieci ćwiczenie można dokończyć z wcześniej wczytanej strony. Potwierdzanie wymaga sieci; nie ma fałszywego lokalnego „zaliczono”. Nie czyść danych przeglądarki ucznia — utraci anonimowy UID i będzie potrzebował nowego zaproszenia.
- Skrypt `szyfruj-odpowiedzi.js` generuje jawny rekwizyt skarbca, którego wynik jest flagą labu 2. Nie przekazuj mu sekretów prawdziwych kont. Wspólne flagi można podejrzeć w źródłach i przekazać innym drużynom — to świadomy kompromis, nie dowód samodzielnego wykonania zadania.
- Ewentualny lokalny `SEKRETY.md` jest historyczną, ignorowaną przez Git ściągą. Aplikacja go nie czyta, a stare instrukcje i kody nie obowiązują. Zachowaj go wyłącznie w prywatnym archiwum lub usuń świadomie po kopii — nie publikuj go.

Próba generalna: [CHECKLISTA.md](CHECKLISTA.md). Scenariusze: [STACJE.md](STACJE.md).
