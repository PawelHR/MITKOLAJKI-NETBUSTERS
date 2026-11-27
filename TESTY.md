# Weryfikacja i ograniczenia zmian

## Wykonane testy

Środowisko testów: Windows, Node/npm, lokalny Firebase Emulator Suite, przenośna Java 21. Testy i seed korzystają wyłącznie z `demo-operacja-biegun`. Oddzielne operacje na produkcji wykonane później, na wyraźne polecenie właściciela, opisuje [WDROZENIE.md](WDROZENIE.md).

- `npm test`: **17/17** testów punktacji, remisów, CSV, składni, zgodności reguł, piaskownicy, resetu i misji. Obejmuje konsolę SOC jako zadanie 4, osobną reakcję 5 oraz model migracji (zachowanie twórcy, wyników i istniejącej reakcji, brak cichego obcinania bonusu).
- `npm run test:rules`: uzyskano 13/13 pierwotnych scenariuszy. Finalne 17 scenariuszy uruchomiono na już działającym emulatorze: `$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'; node --test tests/firestore.test.cjs`. Wynik finalny: **17/17**.
- Reguły: prywatność, atomowe zakładanie drużyny, autoryzowane członkostwo, cofnięcie i zamknięcie rejestracji, blokada zmiany punktów/admina, duplikaty, współbieżny SOC, cztery zadania przed nową reakcją, zachowanie wcześniejszej reakcji, etapy/deadline serwera, niezmienialny audyt, awaryjne zaliczenie, bonus tylko w finale, ważność i powiązanie zaproszenia oraz zakaz ponownego użycia wycofanego ID.
- `git diff --check`: bez błędów whitespace (Git zgłasza jedynie lokalną konwersję LF/CRLF).
- Uruchomiono generator rekwizytu, bez argumentów z sekretami.

### Próba w przeglądarce Chromium z lokalnym Hosting/Auth/Firestore

- Utworzenie drużyny przez interfejs, widoczny publiczny ID i postęp 0/4.
- Drugi anonimowy klient SDK złożył prośbę; zatwierdzenie telefonu wykonano przyciskiem panelu i potwierdzono odczyt prywatnej drużyny przez nowego członka.
- Logowanie organizatora, zmiana etapu/deadline, otwarcie SOC i zaliczenie czterech stacji. Publiczna projekcja osiągnęła 400 pkt bez udziału rzutnika.
- Pełne przejście trzech poziomów Skoku Mikołaja przez modyfikację parametrów w ramce; sprawdzono blokadę dostępu do `parent.document`. Po mecie `gameRaf` jest zatrzymany. Reset przywrócił rolę elf, skok 9, prędkość 4, grawitację 0,5, zero kluczy, poziom 1 i puste gwiazdki.
- Pełne Grand Scam Auto VI i odznaka; ClickFix (bezpieczna decyzja); bezpośredni bot i drugi etap indirect prompt injection. Punkty edukacyjne nie weszły do oficjalnych 400.
- Finał: 5 sekund odliczania, 12-sekundowa sekwencja czterech systemów, zielony status, gotowość 1/1 drużyny i podium.
- Czytnik w anonimowej sesji: **zero pól PIN**, brak ustawień zapisu karty, brak przycisku udającego dobrą kartę; jest przycisk pełnego ekranu i wyjaśnienie zakresu UID.
- Dodatkowa próba lokalna czwartego zadania: przed analizą alertów etap 5 i kod raportu były ukryte; po wskazaniu dwóch skorelowanych alertów i wysokiego priorytetu potwierdzono cztery wspólne zaliczenia i odblokowanie **osobnej reakcji**, nadal bez kodu raportu.

Naprawiono też problemy ujawnione w tej próbie: tablice elementów stringifikowane przez natywne `replaceChildren`, niepotwierdzony pusty cache drużyny oraz odczyt roli organizatora z cache zamiast serwera. Lokalny emulator używa long-pollingu, aby uniknąć buforowania streamów w przeglądarce testowej. Sukcesy zapisów drużyny uwzględniają metadane potwierdzenia serwera.

## Co pozostaje świadomym ograniczeniem

1. **Prowadzący jest zaufanym weryfikatorem.** Spark bez własnego zaufanego backendu nie sprawdzi rzetelnie całej aktywności przeglądarki. Uczeń może oszukać lokalną symulację lub dowody SOC, ale nie może sam nadać oficjalnych punktów. Edukacyjne punkty są oddzielne.
2. **Migracja starych danych jest obowiązkowa dla starych instalacji.** Dla bieżącej produkcji została wykonana z prywatną kopią i weryfikacją. Dawne PIN-y pozostają nieaktualne również w historii Git. Istniejące członkostwa zachowano bez automatycznego przywracania; ich zgodność z faktycznym składem drużyn nadal powinien sprawdzić organizator.
3. **NFC wymaga próby fizycznej.** Nie było dostępu do Androida NFC, kart i Flippera. Zgodność Web NFC/emulacji, ekranowanie, BadUSB, systemowe przypięcie kiosku i nadzór nad urządzeniem muszą zostać sprawdzone na miejscu. Pełny ekran strony nie jest zabezpieczeniem urządzenia.
4. **Offline jest częściowe.** Wczytane zadania działają w bieżącej stronie; worker zachowuje tylko publiczny shell i wcześniej pobrane moduły. Brak pełnej kopii prywatnego stanu po zamknięciu sesji. Zapisy wymagają sieci. Realne odcięcie internetu, słaby zasięg i ponowienia na telefonach pozostają elementem próby generalnej.
5. **Limity Spark:** brak serwerowego antyspamu/rate limitu zakładania anonimowych kont i drużyn. Zamknąć rejestrację po odprawie, kontrolować liczbę drużyn, odczyty i liczbę otwartych ekranów. Ranking telefonu kosztuje N odczytów na odświeżenie; duży ekran nie agreguje go dla innych klientów. Nie wykonano obciążenia całej szkoły.
6. **Weryfikacja sprzętowa/UX:** konieczna końcowa próba na małych Androidach/iPhone'ach, z klawiaturą, dotykiem, VoiceOver/TalkBack, ograniczeniem ruchu i docelowym rzutnikiem. Przyciski zastępują przeciąganie; zadania nie mają blokującego limitu czasu. Autorski opcjonalny dźwięk wymaga wsparcia Web Audio i interakcji użytkownika.
7. **Retencja:** usunięcie drużyny w panelu wycofuje ID i usuwa jej wynik, ale celowo nie usuwa rekurencyjnie historycznych podkolekcji. Organizator ustala ich prywatną retencję i sprzątanie w konsoli po kopii danych.

## Lista zmienionych/dodanych plików

- `.gitignore` — oba bezsekretowe pliki reguł mogą być wersjonowane; prywatna historyczna ściąga nadal ignorowana.
- `public/index.html` — bezpieczeństwo UI, członkostwo, SOC, NFC, piaskownica, nowe misje, etapy, ranking, CSV, finał i UX.
- `public/core.js` — wspólna oficjalna punktacja, remisy i CSV.
- `public/sw.js` — cache wyłącznie publicznych treści.
- `public/local-config.json` — demonstracyjny projekt emulatora, nie konfiguracja produkcji.
- `firestore.rules`, `firestore.local.rules` — identyczne reguły bez PIN-ów.
- `firebase.json` — kanoniczne reguły, konfiguracja emulatorów i nagłówki.
- `narzedzia/szyfruj-odpowiedzi.js` — generator wyłącznie demonstracyjnego rekwizytu.
- `package.json`, `package-lock.json` — powtarzalne narzędzia testowe (devDependencies).
- `tests/core.test.mjs`, `tests/static.test.cjs`, `tests/missions.test.cjs`, `tests/firestore.test.cjs`, `tests/migration.test.cjs`, `tests/seed.cjs`.
- `narzedzia/firebase-admin-api.cjs`, `narzedzia/kopia-firebase.cjs`, `narzedzia/migracja-model.cjs`, `narzedzia/migracja-firebase.cjs`, `narzedzia/sprawdz-produkcje.cjs` — jawnie uruchamiane narzędzia operatorskie, bez sekretów w kodzie.
- `README.md`, `STACJE.md`, `INSTRUKCJA.md`, `CHECKLISTA.md`, `TESTY.md`, `WDROZENIE.md`.

Wdrożenie i migrację produkcji wykonano dopiero po osobnym poleceniu właściciela. Nie usunięto drużyn, członkostw ani kont produkcyjnych; prywatne kopie nie są częścią repozytorium. Szczegóły: [WDROZENIE.md](WDROZENIE.md).
