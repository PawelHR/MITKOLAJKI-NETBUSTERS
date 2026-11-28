# 🎅 Operacja Biegun

Polska gra terenowa koła cyberbezpieczeństwa dla uczniów trzech szkół średnich.
Noc polarna, cztery laboratoria i wspólna misja: odzyskać system rozdzielania prezentów przejęty przez Grincha.

**Bez frameworka i płatnego backendu:** HTML/CSS/JS, Firebase Hosting, Auth i Firestore na Spark.
Gra: https://operacja-biegun.web.app (zmiany w repozytorium nie oznaczają wdrożenia).

## Wydarzenie

Drużyny po 3–4 osoby. Cztery rotacje po 25 min + 5 min przejścia.
**8 prowadzących (po 2 na stację) oraz koordynator wydarzenia.** Na stacji 4 pomocnik jest jednocześnie elfem z kartą i operatorem Flippera.

| Czas | Etap |
|---|---|
| 09:00–09:25 | Rejestracja, wprowadzenie w auli |
| 09:25–11:25 | Gra główna: 4 rotacje |
| 11:25–12:00 | Przerwa, stoisko koła |
| 12:00–12:40 | Finał fabularny i opcjonalny teleturniej |
| 12:40–13:00 | Zakończenie, podium |

Godziny, sale i komunikat centrali ustaw organizacyjnie w panelu; zapis wysyła tylko zmienione pola, więc kilku organizatorów nie nadpisuje sobie ustawień. **Etap wydarzenia zmienia się w osobnej karcie, z potwierdzeniem.** Deadline zapisów ma **datę i godzinę**, nie sam zegar — to jedyny termin, liczy też odliczanie na `#ekran`. Ograniczenie sprawdza Firestore przez `request.time`, nawet jeśli organizator zapomni zmienić etap.

## Cztery stacje

| # | Laboratorium | Zadanie | Zaliczenie |
|---|---|---|---|
| 1 | Zhakuj grę | Skok Mikołaja: siła skoku, klucze, rola | Flaga na mecie trzeciego poziomu |
| 2 | Złam skarbiec | Dobór hasha, słownika i maski w symulatorze | Odzyskane hasło jest flagą |
| 3 | Fałszywy Mikołaj | Mail → portal → logi → konsola SOC (4) → osobno reakcja (5) | Flaga w hubie po reakcji |
| 4 | Biuro Grincha | Audyt biurka, własna karta demonstracyjna UID, pokaz BadUSB | Flaga po poprawnym odczycie karty |

Nie oceniamy uczniów. Pomoc i podpowiedzi nie odbierają punktów. **Drużyna sama wpisuje flagę ze strony stacji w odpowiednim labie, bez akceptacji prowadzącego.** To inny kod niż 6-znakowy kod dołączenia do drużyny. Szczegóły, sprzęt i plan B: [STACJE.md](STACJE.md).

## Widoki aplikacji

| Adres | Zastosowanie |
|---|---|
| `/` | Drużyna, misja, sale/rotacje, zadania, ranking |
| `/#admin` | Logowanie organizatora, etapy, członkostwo, stacje, finał, CSV |
| `/#ekran` | Publiczny ranking na żywo; logowanie nie jest potrzebne |
| `/#final` | Centrum dowodzenia: odliczanie, cztery systemy, gotowe drużyny, podium |
| `/#gra` | Izolowana piaskownica Skoku Mikołaja |
| `/#skarbiec` | Symulator haseł; odpowiedź to jawny rekwizyt |
| `/#drzwi` | Demonstracyjny czytnik NFC i pełny ekran; konfiguracja tylko po logowaniu |
| `/#pulapka` | Edukacyjny plakat o quishingu |

### Punkty

- **Oficjalnie:** 100 za stację, maks. 400; finał 0–100 wpisany przez organizatora **tylko w etapie Finał**. Maksimum **500**.
- **Edukacyjnie, poza rankingiem:** Prezent czy pułapka 30, Hasło do sań 20, Szyfr elfów 20, Co zdradza zdjęcie 20, Darmowe pierniki 30, Elf-bot (oba etapy) 30, SQL injection 30, Grand Scam Auto VI 30. Maksimum **210**.
- Ranking szkoły: dokładna średnia oficjalnych punktów drużyn z co najmniej jedną stacją. Zaokrąglamy tylko wyświetlanie. **Remis = wspólne miejsce**, bez premii za sumę czy liczbę drużyn.
- CSV UTF-8 z BOM i średnikami, z zabezpieczeniem przed formułami w nazwach.

### Nowe misje

- **Grand Scam Auto VI (2–4 min)**: ukryty sygnał 06 w terminalu. Fikcyjny Discord, domena `.example`, atrapa instalatora, infostealer i odzyskanie konta. „MISSION PASSED – RESPECT +”, odznaka „Vice City Defender”. Autorska scenografia CSS w neonach, bez materiałów Rockstar i pobierania plików.
- **AI Agent Security**: po bezpośrednim prompt injection drugi etap z dokumentem. Rozpoznanie indirect injection, minimalne uprawnienia, blokada wysyłki i zgoda człowieka. Deterministycznie, bez API AI.

## Bezpieczeństwo i dane

```
config/main                         publiczne etapy, deadline, sale, finał
leaderboard/{publicznyID}            publiczna projekcja: nazwa, szkoła, statusy true, bonus, aktualizacja
teams/{publicznyID}                  prywatny stan drużyny, wspólne dowody SOC, licznik memberCount (maks. 4)
teams/{ID}/members/{uid}             członkowie: czytają drużyna i organizatorzy
teams/{ID}/requests/{uid}            starsze prośby: kompatybilność z poprzednią wersją
teams/{ID}/revoked/{uid}             cofnięte członkostwo: tylko organizatorzy
teams/{ID}/awards/{stacja}           jednokrotny audyt zaliczenia
stationFlags/{stacja}               konfiguracja sprawdzana przez reguły, bez odczytu klienta
joinCodes/{kod6znakowy}              odczyt konkretnego kodu po logowaniu; bez listowania
invites/{losowy128bitToken}          starsze zaproszenia (nieużywane przez nowy interfejs)
retiredTeams/{ID}                    wycofane ID: zakaz ponownego użycia
admins/{uid}                        lista organizatorów, dodawana w konsoli
```

**Proste dołączanie:** gracz sam zakłada drużynę i dostaje **6-znakowy kod**. Koledzy wpisują kod i pseudonim — od razu dołączają, **bez prowadzącego, długiego tokenu i oczekiwania na akceptację**. Kod pozostaje widoczny członkom drużyny także po odświeżeniu. Drużynę, pierwszego członka i indeks kodu tworzy jeden atomowy batch.

**Limit 4 osób na drużynę.** Dołączenie i odejście zmieniają `memberCount` o 1 w tym samym batchu co dokument członka; reguły odrzucają piątą osobę, fałszywy licznik i odejście bez zwolnienia miejsca. Gdy drużyna jest pełna, kod znika z ekranu członków. Drużyny sprzed limitu nie mają licznika i nikogo nie przyjmą, dopóki organizator nie kliknie w `#admin → Prowadź` przycisku **Ustaw licznik**.

Publiczny czteroznakowy ID służy prowadzącemu i rankingowi, **nie pozwala dołączyć**. Kod do dołączania jest osobny i nie trafia do rankingu ani URL. Nie można pobrać listy kodów; reguły sprawdzają podany kod, etap i stan drużyny przed dodaniem konkretnego UID. Twórca lub organizator może zmienić kod; stary przestaje działać bez wyrzucania obecnych członków.

Rejestrację zamyka etap lub flaga drużyny. Usuniętego użytkownika nie przywracamy automatycznie. Cofnięcie członkostwa zapisuje blokadę UID; powrót wymaga jej świadomego usunięcia przez organizatora, a następnie ponownego wpisania aktualnego kodu.

**Kompromis prostoty:** kto pozna kod, może dołączyć do otwartej drużyny w czasie rejestracji. Kod nie jest silnym hasłem (ok. 30 bitów losowości) i nie ma serwerowego limitera zgadywania na Spark. Udostępniajcie go tylko kolegom; w razie wycieku zmieńcie kod lub zamknijcie dołączanie. Członkostwo nie daje praw administratora; do zaliczenia labu potrzebna jest flaga stacji.

Zaliczenie flagą zapisuje członek drużyny atomowo ze statusem `true`, publiczną projekcją i niezmienialnym prywatnym audytem. Flaga nie trafia do rankingu. Powtórka, także z drugiego telefonu, nie dodaje punktów. Zwykłe zaliczenia wymagają gry głównej i terminu serwera; **tryb awaryjny jest jawnym wyjątkiem wyłącznie organizatora z uzasadnieniem**, także po zamknięciu gry.

**Kompromis flag:** strona pokazuje je po ćwiczeniu, ale ich publiczny moduł `station-flags.js` można podejrzeć, a flagę przekazać innej drużynie. Serwer sprawdza wartość, członkostwo, etap, termin i jednokrotność — nie udowadnia samodzielnego wykonania zadania. AES-GCM w skarbcu jest dekoracją dydaktyczną, nie tajnością. Nie ma Functions, zewnętrznych usług AI ani płatnego serwera.

Piaskownica gry ma `sandbox="allow-scripts"` **bez** `allow-same-origin`, blokadę sieci CSP, atrapę localStorage i brak mostu do rankingu. Pozostałe demonstracje też niczego naprawdę nie atakują. Używamy tylko sprzętu i kart koła, nigdy prywatnych kart, kont i danych uczniów.

### Odczyty i offline

Telefony słuchają własnej drużyny i członków oraz jednego dokumentu konfiguracji. Ranking pobierają na żądanie, maks. raz na 30 s (N odczytów dla N drużyn). Tylko ekran, finał i zalogowany panel słuchają publicznych wyników na żywo. Punkty publikowane są przy zaliczeniu, **bez zależności od rzutnika**. Dla 40 drużyn i 160 telefonów, po 20 odświeżeń rankingu: ok. 12800 odczytów samego rankingu; dodaj aktualizacje drużyn, reguły i ekrany, monitoruj limit Spark 50 tys./dzień.

Service worker przechowuje wyłącznie publiczną stronę, moduły punktacji/flag i wcześniej pobrane moduły SDK. Nie cache'uje odpowiedzi Auth/Firestore. Wczytane zadania można dokończyć bez sieci; nowa sesja i zaliczenie wymagają połączenia. Transakcja nie pokazuje sukcesu przed potwierdzeniem serwera. Offline nie jest pełną lokalną kopią gry.

## Uruchomienie i testy

Wymagane Node 20+ i Java 21+ do emulatora (JDK 22 też działa; stara Java 7/8 na PATH go nie uruchomi — ustaw `JAVA_HOME`). Żadnych zależności runtime poza SDK z CDN. Testy używają **tej samej wersji SDK co aplikacja (10.12.2)**; test statyczny pilnuje zgodności `index.html`, `sw.js` i `package.json`.

```powershell
npm ci
npm test
npm run test:rules
npm run emulators
```

Projekt `demo-operacja-biegun` nie dotyka produkcji. Lokalna aplikacja na `http://127.0.0.1:5000` automatycznie używa emulatorów Auth/Firestore. Konto i konfigurację demonstracyjną można przygotować w drugim terminalu:

```powershell
$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'
node tests/seed.cjs
```

Konto testowe jest wyłącznie w `tests/seed.cjs`; nigdy nie używaj go na produkcji. Testy reguł obejmują izolację, zaproszenia, członkostwo, punkty, duplikaty, współbieżność SOC, etapy, czas serwera i organizatorów. `npm test` sprawdza punktację, remisy, CSV, składnię i osłony piaskownicy.

## Bezpieczne wdrożenie

**Nie wdrażaj na stare dokumenty bez migracji schematu.** Dawne PIN-y uznaj za ujawnione. Usunięcie z pliku nie usuwa ich z historii repozytorium. Nie używaj ich nigdzie ponownie.

Szczegóły konfiguracji, kontrolowanej migracji bez kasowania drużyn i kolejności wdrażania: **[INSTRUKCJA.md](INSTRUKCJA.md)**. Jedynym źródłem wdrażanych reguł jest `firestore.rules`; `firestore.local.rules` zawiera ten sam bezsekretowy zestaw dla zgodności lokalnej, nie inne PIN-y. Narzędzia nie wdrażają nic samoczynnie. Wdrożenie na wyraźne polecenie właściciela opisuje **[WDROZENIE.md](WDROZENIE.md)**.

Materiały drukowane pozostają w `plakaty/`, teleturniej w `final/kahoot-final.xlsx`, skrypt demonstracyjny w `stacja4-badusb/`. Stary wariant portalu w `stacja1-portal/` jest archiwalny, nie należy do obecnej stacji 1.

**Przed wydarzeniem:** [CHECKLISTA.md](CHECKLISTA.md). Wyniki weryfikacji i ograniczenia: [TESTY.md](TESTY.md).
