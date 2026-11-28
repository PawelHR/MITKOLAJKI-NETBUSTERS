# Weryfikacja i ograniczenia zmian

## Wykonane testy

Środowisko testów: Windows, Node/npm, lokalny Firebase Emulator Suite, przenośna Java 21. Testy i seed korzystają wyłącznie z `demo-operacja-biegun`. Oddzielne operacje na produkcji wykonane później, na wyraźne polecenie właściciela, opisuje [WDROZENIE.md](WDROZENIE.md).

- `npm test`: **23/23** testów punktacji, remisów, CSV, składni, zgodności reguł, piaskownicy, resetu i misji, w tym zgodności wersji SDK (aplikacja, service worker, testy) i spójności limitu drużyny. Obejmuje konsolę SOC jako zadanie 4, osobną reakcję 5, formularz flagi, potwierdzenie wyścigu przez serwer, atrapę Web NFC, usunięcie ClickFix, proste dołączanie i model migracji.
- Testy reguł na działającym emulatorze: `$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'; node --test tests/firestore.test.cjs`. Wynik finalny: **37/37**, w tym limit 4 osób (piąta odrzucona, odejście zwalnia miejsce), odporność licznika na fałszowanie i drużyny sprzed limitu. `npm run test:rules` uruchamia ten sam zestaw we własnym emulatorze.
- Reguły: prywatność, atomowe zakładanie drużyny, autoryzowane członkostwo, cofnięcie i zamknięcie rejestracji, blokada zmiany punktów/admina, duplikaty, współbieżny SOC, cztery zadania przed nową reakcją, zachowanie wcześniejszej reakcji, etapy/deadline serwera, niezmienialny audyt, awaryjne zaliczenie, bonus tylko w finale, ważność i powiązanie zaproszenia oraz zakaz ponownego użycia wycofanego ID.
- Flagi: poprawna/błędna/z innego labu/wyłączona, brak częściowego zapisu, zakaz dla osoby spoza drużyny, cztery flagi = 400 pkt, dwa telefony = jeden audyt. Surowe powtórne zapisy pozostają zabronione; aplikacja w razie wyścigu sprawdza `getDocFromServer`, nie udaje sukcesu na podstawie cache. Refaktoryzacja wyboru ścieżki reguł usunęła błąd limitu 1000 wyrażeń w odmowach.
- Historyczne `side.p9` nie jest kasowane, ale nowych zaliczeń nie można dopisać; osiem aktywnych zadań daje maks. 210 pkt edukacyjnych.
- `git diff --check`: bez błędów whitespace (Git zgłasza jedynie lokalną konwersję LF/CRLF).
- Uruchomiono generator rekwizytu, bez argumentów z sekretami.

### Próba w przeglądarce Chromium z lokalnym Hosting/Auth/Firestore

Pierwsze próby poniżej opisują też historyczny model zatwierdzania przez prowadzącego. Aktualną próbę flag opisano na końcu listy.

- Utworzenie drużyny przez interfejs, widoczny publiczny ID i postęp 0/4.
- Drugi anonimowy klient SDK złożył prośbę; zatwierdzenie telefonu wykonano przyciskiem panelu i potwierdzono odczyt prywatnej drużyny przez nowego członka.
- Logowanie organizatora, zmiana etapu/deadline, otwarcie SOC i zaliczenie czterech stacji. Publiczna projekcja osiągnęła 400 pkt bez udziału rzutnika.
- Pełne przejście trzech poziomów Skoku Mikołaja przez modyfikację parametrów w ramce; sprawdzono blokadę dostępu do `parent.document`. Po mecie `gameRaf` jest zatrzymany. Reset przywrócił rolę elf, skok 9, prędkość 4, grawitację 0,5, zero kluczy, poziom 1 i puste gwiazdki.
- Pełne Grand Scam Auto VI i odznaka; ClickFix (bezpieczna decyzja); bezpośredni bot i drugi etap indirect prompt injection. Punkty edukacyjne nie weszły do oficjalnych 400.
- Finał: 5 sekund odliczania, 12-sekundowa sekwencja czterech systemów, zielony status, gotowość 1/1 drużyny i podium.
- Czytnik w anonimowej sesji: **zero pól PIN**, brak ustawień zapisu karty, brak przycisku udającego dobrą kartę; jest przycisk pełnego ekranu i wyjaśnienie zakresu UID.
- Dodatkowa próba lokalna czwartego zadania: przed analizą alertów etap 5 i kod raportu były ukryte; po wskazaniu dwóch skorelowanych alertów i wysokiego priorytetu potwierdzono cztery wspólne zaliczenia i odblokowanie **osobnej reakcji**, nadal bez kodu raportu.
- Aktualny prosty tryb: dwa osobne anonimowe konta na `127.0.0.1` i `localhost`. Pierwszy gracz sam utworzył drużynę w interfejsie, drugi wpisał krótki kod małymi literami i od razu dołączył, bez panelu organizatora. Obie sesje pokazały 2 członków i kod długości 6. Po przeładowaniu telefonu założyciela kod i skład drużyny pozostały dostępne.
- Reguły krótkich kodów: brak listowania i publicznego publikowania, odmowa dla publicznego ID/błędnego kodu/innego UID, samodzielne poprawne dołączenie, zamknięcie etapu i drużyny, blokada cofniętego UID, rotacja kodu i równoczesne dołączenie dwóch telefonów. Pełny stan wszystkich zadań nadal pozwala zapisać ostatnie zadanie i bonus finału.
- Aktualny tryb flag: przejście trzech poziomów gry pokazało flagę labu 1; dostęp ramki do dokumentu rodzica był zablokowany. Poprawne opcje skarbca pokazały hasło/flagę labu 2. Drużynę utworzono tylko lokalnie; błędną flagę odrzucono, poprawną wpisaną małymi literami i ze spacjami zaliczono za 100 pkt bez panelu. Terminal ma 8 zadań, bez ClickFix.
- SOC uruchomiono przyciskiem uczestnika. Na lokalnej próbce z trzema przygotowanymi dowodami przeklikano konsolę SOC: po niej reakcja była dostępna, ale flaga nadal ukryta. Ułożenie reakcji przyciskami i potwierdzenie zapisu na serwerze pokazało flagę labu 3 oraz powrót do formularza.
- Web NFC sprawdzono automatycznie atrapą czytnika: zły UID bez flagi, zgodny UID z flagą labu 4, bez automatycznego zapisu punktów. Nie zastępuje to fizycznej próby sprzętu.

- Limit drużyny i panel (osobne emulatory na wolnych portach, 28.11.2026): założenie drużyny w interfejsie, trzy dołączenia klientem SDK, piąta osoba odrzucona przez serwer i komunikat „może być pełna” w interfejsie; po odejściu założyciela piąty telefon dołączył. Zmiana etapu przez kartę z potwierdzeniem, zapis ustawień wysłał tylko zmienione pola, etap pozostał bez zmian. Drużyna bez licznika: panel pokazał ostrzeżenie, przycisk ustawił licznik 4.

Naprawiono też problemy ujawnione w tej próbie: tablice elementów stringifikowane przez natywne `replaceChildren`, niepotwierdzony pusty cache drużyny oraz odczyt roli organizatora z cache zamiast serwera. Lokalny emulator używa long-pollingu, aby uniknąć buforowania streamów w przeglądarce testowej. Sukcesy zapisów drużyny uwzględniają metadane potwierdzenia serwera.

## Co pozostaje świadomym ograniczeniem

1. **Wspólne flagi są publicznymi rekwizytami.** Uczestnik może podejrzeć je w module źródłowym albo przekazać innej drużynie i w ten sposób zaliczyć lab bez samodzielnego wykonania. To świadomie przywrócony prosty tryb. Serwer sprawdza flagę, członkostwo, etap, deadline i jednokrotność, nie rzetelność symulacji. Edukacyjne punkty są oddzielne.
2. **Migracja starych danych jest obowiązkowa dla starych instalacji.** Dla bieżącej produkcji została wykonana z prywatną kopią i weryfikacją. Dawne PIN-y pozostają nieaktualne również w historii Git. Istniejące członkostwa zachowano bez automatycznego przywracania; ich zgodność z faktycznym składem drużyn nadal powinien sprawdzić organizator.
3. **NFC wymaga próby fizycznej.** Nie było dostępu do Androida NFC, kart i Flippera. Zgodność Web NFC/emulacji, ekranowanie, BadUSB, systemowe przypięcie kiosku i nadzór nad urządzeniem muszą zostać sprawdzone na miejscu. Pełny ekran strony nie jest zabezpieczeniem urządzenia.
4. **Offline jest częściowe.** Wczytane zadania działają w bieżącej stronie; worker zachowuje tylko publiczny shell i wcześniej pobrane moduły. Brak pełnej kopii prywatnego stanu po zamknięciu sesji. Zapisy wymagają sieci. Realne odcięcie internetu, słaby zasięg i ponowienia na telefonach pozostają elementem próby generalnej.
5. **Limity Spark:** brak serwerowego antyspamu/rate limitu zakładania anonimowych kont i drużyn. Zamknąć rejestrację po odprawie, kontrolować liczbę drużyn, odczyty i liczbę otwartych ekranów. Ranking telefonu kosztuje N odczytów na odświeżenie; duży ekran nie agreguje go dla innych klientów. Nie wykonano obciążenia całej szkoły.
   Krótki kod jest świadomym kompromisem UX: kto go zna, może dołączyć do otwartej drużyny w rejestracji. Kod nie jest hasłem wysokiej entropii, brak pełnego serwerowego limitowania prób; nie publikować go, a w razie wycieku zmienić kod lub zamknąć dołączanie.
6. **Weryfikacja sprzętowa/UX:** konieczna końcowa próba na małych Androidach/iPhone'ach, z klawiaturą, dotykiem, VoiceOver/TalkBack, ograniczeniem ruchu i docelowym rzutnikiem. Przyciski zastępują przeciąganie; zadania nie mają blokującego limitu czasu. Autorski opcjonalny dźwięk wymaga wsparcia Web Audio i interakcji użytkownika.
7. **Retencja:** usunięcie drużyny w panelu wycofuje ID i usuwa jej wynik, ale celowo nie usuwa rekurencyjnie historycznych podkolekcji. Organizator ustala ich prywatną retencję i sprzątanie w konsoli po kopii danych.

## Lista zmienionych/dodanych plików

- `.gitignore` — oba bezsekretowe pliki reguł mogą być wersjonowane; prywatna historyczna ściąga nadal ignorowana.
- `public/index.html` — bezpieczeństwo UI, członkostwo, SOC, NFC, piaskownica, nowe misje, etapy, ranking, CSV, finał i UX.
- `public/core.js` — wspólna oficjalna punktacja, remisy i CSV.
- `public/station-flags.js` — jawne flagi ćwiczeń; `narzedzia/flagi-stacji.cjs` — kontrolowana konfiguracja czterech flag na serwerze, bez zmian drużyn i etapu.
- `public/sw.js` — cache wyłącznie publicznych treści.
- `public/local-config.json` — demonstracyjny projekt emulatora, nie konfiguracja produkcji.
- `firestore.rules`, `firestore.local.rules` — identyczne reguły bez PIN-ów.
- `firebase.json` — kanoniczne reguły, konfiguracja emulatorów i nagłówki.
- `narzedzia/szyfruj-odpowiedzi.js` — generator wyłącznie demonstracyjnego rekwizytu.
- `package.json`, `package-lock.json` — powtarzalne narzędzia testowe (devDependencies).
- `tests/core.test.mjs`, `tests/static.test.cjs`, `tests/missions.test.cjs`, `tests/firestore.test.cjs`, `tests/migration.test.cjs`, `tests/seed.cjs`.
- `narzedzia/firebase-admin-api.cjs`, `narzedzia/kopia-firebase.cjs`, `narzedzia/migracja-model.cjs`, `narzedzia/migracja-firebase.cjs`, `narzedzia/sprawdz-produkcje.cjs` — jawnie uruchamiane narzędzia operatorskie, bez sekretów w kodzie.
- `narzedzia/kody-druzyn.cjs` — kontrolowane uzupełnienie krótkich kodów istniejących drużyn, bez zmiany wyników i członkostw.
- `README.md`, `STACJE.md`, `INSTRUKCJA.md`, `CHECKLISTA.md`, `TESTY.md`, `WDROZENIE.md`.

Wdrożenie i migrację produkcji wykonano dopiero po osobnym poleceniu właściciela. Nie usunięto drużyn, członkostw ani kont produkcyjnych; prywatne kopie nie są częścią repozytorium. Szczegóły: [WDROZENIE.md](WDROZENIE.md).
