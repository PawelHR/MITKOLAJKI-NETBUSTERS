# Scenariusze czterech stacji — dla prowadzących

**Orientacyjnie 25 minut na zadanie, bez ustalonych tur zmiany sal. 2 prowadzących na stację, razem 8 i koordynator.**
Grupa to kilka drużyn 3–4-osobowych, zwykle 10–16 osób. Zabawa bez oceniania: pomagamy dojść do końca.
Drużyna dostaje flagę na stronie stacji i sama wpisuje ją w odpowiednim labie. Nie czeka na akceptację prowadzącego. `#admin → Prowadź` pozostaje opcją pomocy i awaryjnego zaliczenia.
Każda stacja daje **100 punktów oficjalnych**, maks. 400 + opcjonalny finał 0–100. Zadania poboczne to oddzielne punkty edukacyjne.

## Wspólne zasady i rytm

1. „Pokazujemy to, żeby umieć się bronić. Działanie bez zgody na cudzym systemie może być przestępstwem”.
2. Tylko sprzęt, karty, konta i fikcyjne dane koła. Nie odczytujemy prywatnych kart, nie podłączamy USB do komputerów uczniów, nie prosimy o prawdziwe hasła.
3. Prowadzący obsługuje panel we własnym profilu przeglądarki. Uczniowie korzystają z odizolowanego `#gra` i urządzeń demonstracyjnych.
4. Po zadaniu drużyna przepisuje flagę do swojego terminala: Laboratoria → numer stacji. Nie pokazuj na rzutniku kodów dołączania do drużyn ani panelu z prywatnymi danymi.
5. Zwykłe zapisy wymagają etapu Gra główna i niewygasłego deadline. Przy awarii prowadzący używa jawnego trybu awaryjnego z uzasadnieniem. Flagi są jawnymi rekwizytami, nie sekretami kont.

| Minuty | Przebieg |
|---|---|
| 0–3 | Fabuła, zgoda i zasady |
| 3–18 | Zadanie, stopniowane podpowiedzi |
| 18–22 | Dokończenie i samodzielne wpisanie flag przez drużyny |
| 22–25 | Trzy wnioski obronne, pytania, reset stanowiska |

## 1 · Zhakuj grę — nie ufaj przeglądarce

**Sprzęt:** 3–4 laptopy Chrome/Edge/Firefox, opcjonalny rzutnik. Bez sprzętu sieciowego.
Otwórz `/#gra`. Trzy poziomy pozostają takie same:

1. **Siła skoku:** przepaść za szeroka. F12 → Console → wybierz kontekst ramki `about:srcdoc` → `gra.silaSkoku = 25`.
2. **Klucze:** brama wymaga trzech, na mapie jest jeden. W tej samej konsoli `gra.klucze = 3`.
3. **Rola — bez konsoli:** meta tylko dla admina. F12 → **Application (Aplikacja) → Local Storage → adres strony gry** (na produkcji `https://operacja-biegun.web.app`, nie `about:srcdoc`). Znajdź klucz **`rola`**, dwukrotnie kliknij wartość **`elf`**, zmień na **`admin`** i zatwierdź Enterem. Wróć do gry i dojdź do flagi. Zmiana działa na żywo, bez odświeżania i utraty poziomu. Jeśli tabelka nie odświeżyła się po otwarciu gry, odśwież sam widok Local Storage w DevTools, nie stronę gry.

Trzy poziomy podpowiedzi na każdym etapie: **trop → narzędzie → dokładna instrukcja**. Zdobyte poziomy dają gwiazdki „WANTED KNOWLEDGE”, nie punkty w Firebase. Strzałki/A/D, spacja/W/↑ oraz przyciski dotykowe. Bez limitu czasu.

**Przebieg:** 0–3 fabuła gry Grincha; 3–7 skok; 7–12 klucze; 12–18 rola; 18–22 flaga na mecie trzeciego poziomu i wpisanie jej w labie 1; 22–25 omów porównanie na ekranie.

**Wnioski:** klient może zmienić stan, rolę i wynik. Zabezpieczona gra weryfikuje zdarzenia/uprawnienia na zaufanym serwerze. W Operacji Biegun lokalna meta pokazuje flagę; dopiero serwer zatwierdza jej wpisanie. Publiczną flagę można podejrzeć lub przekazać — nie dowodzi samodzielnego wykonania ćwiczenia.

**Izolacja:** sandbox bez `allow-same-origin`, brak sieci i bezpośredniego dostępu do sesji lub storage rodzica. Strona przekazuje ramce wyłącznie demonstracyjną rolę `elf`/`admin`; ramka może poprosić tylko o jej reset do `elf`. Kanał nie przekazuje wyników, flag zaliczenia ani uprawnień Firebase. Nie zdejmuj sandboxa: Console w ramce służy poziomom 1–2, a Application → Local Storage głównej strony poziomowi 3. Wpis `rola=admin` nie nadaje uprawnień organizatora.
**Reset:** zawsze dostępny przycisk „Nowa drużyna” przywraca siłę, prędkość, grawitację, klucze, rzeczywisty wpis `rola=elf`, poziom, podpowiedzi, gwiazdki i klawisze. Nie czyści innych danych przeglądarki. Sama rola pozostaje w Local Storage po odświeżeniu strony — przed kolejną grupą użyj pełnego resetu. Po opuszczeniu widoku ramka znika; animacja zatrzymuje się także w tle i po mecie.
**Plan B:** prowadzący pokazuje F12 na rzutniku. Za korzystanie z instrukcji nie odejmujemy punktów.

## 2 · Złam skarbiec — symulator haseł

**Sprzęt:** 3–4 laptopy/tablety z `/#skarbiec`, kalendarz z 6 grudnia, zdjęcie renifera z podpisem „RENIFER”, wydruk skrótu z symulatora, karteczka „imię + dzień, WIELKIMI”.

**Przebieg:** 0–3 fabuła skarbca; 3–8 wyjaśnienie hasha; 8–17 poszukiwanie śladów i dobór opcji; 17–19 wynik i wpisanie flagi w labie 2; 19–23 sól i projekt zabezpieczeń skarbca; 23–25 obrona.

| Ustawienie | Odpowiedź w tej symulacji | Trop |
|---|---|---|
| Hash | MD5 | 32 znaki hex; długość nie przesądza (np. NTLM też ma 32) |
| Słownik | Imiona reniferów | Podpis pod zdjęciem |
| Maska | Słowo + 2 cyfry | Dzień w kalendarzu |
| Litery | WIELKIE | Karteczka |

Po błędnych próbach pojawiają się podpowiedzi. Animacja trwa kilka sekund, ale nie jest prawdziwym crackingiem. Odzyskane hasło jest flagą labu 2 — drużyna wpisuje je sama w terminalu.
AES-GCM w kodzie nie ukrywa odpowiedzi skutecznie, bo materiał klucza pochodzi z publicznych opcji. To świadomy prosty tryb gry, a nie zabezpieczenie przed kopiowaniem flag.

**Po otwarciu skarbca (bez punktów, ok. 4 min):**
- **Sól:** dwa elfy z tym samym hasłem. Bez soli hashe są identyczne, z solą różne. Sól jest jawna, zmusza do łamania każdego konta osobno, ale nie ratuje słabego hasła.
- **Zaprojektujcie zabezpieczenie skarbca:** samo hasło, hasło + SMS, hasło + aplikacja uwierzytelniająca albo passkey. Symulator sprawdza pięć ataków: zgadywanie, hasło z cudzego wycieku, phishing, SIM swap i wyciek bazy. Wynik: 0/5, 3/5, 4/5, 5/5. Puenta: każdy drugi składnik pomaga, ale tylko passkey nie da się wpisać na fałszywej stronie.

**Obrona:** imiona i daty padają pierwsze; długa losowa fraza i menedżer haseł; po stronie serwisu wolna funkcja z solą. Zalecany jest **Argon2id** (pamięciożerny, memory-hard). **bcrypt** to starsza alternatywa: też wolny i z solą, ale używa stałych ok. 4 KB pamięci, więc nie jest funkcją pamięciożerną tego rodzaju co Argon2id. Przy odpowiednim koszcie nadal akceptowalny. Nigdy zwykły MD5. Czasy na ekranie są ilustracją zależną od sprzętu i parametrów, nie gwarancją.
**Reset:** „Nowa drużyna (reset)” zeruje opcje i próby. **Plan B:** wybór opcji na kartce, zatwierdzenie przez prowadzącego.

## 3 · Fałszywy Mikołaj — wspólny SOC

**Sprzęt:** telefony uczniów (najlepiej trzy na drużynę), **komputer stacji z otwartym `/#siem`** (najlepiej z dużym ekranem lub rzutnikiem, mysz i klawiatura), telefon/laptop prowadzącego z panelem.
**Przygotowanie:** prowadzący otwiera na komputerze stacji `https://operacja-biegun.web.app/#siem` (działa bez logowania i bez sieci po wczytaniu) i przed każdą drużyną klika **Nowa drużyna (reset)**. Drużyna wchodzi w lab 3 → **Otwórz śledztwo** → **Rozpocznij śledztwo**. Uruchamia je samodzielnie w czasie gry głównej; panel prowadzącego nie jest wymagany.

0–3: „Księgowa zatwierdziła przelew 48 000 zł. Chwilę potem ktoś eksportował listę prezentów. Zbierzcie dowody i opanujcie incydent”.
3–14: każdy telefon bierze inne z trzech pierwszych zadań. Następnie drużyna przechodzi do czwartego — North Pole SIEM na komputerze stacji. Postęp zapisuje się na serwerze pod drużyną; drugi telefon zobaczy zabezpieczony dowód w hubie. Nie ma importu starego `ob_s3` z telefonu.

| Zadanie | Co uczniowie robią | Odpowiedź dydaktyczna |
|---|---|---|
| Mail | Wskazują pięć czerwonych flag | Reply-To, presja w temacie, prośba o przelew i tajemnicę, obca domena, `.pdf.exe` |
| Portal (IDOR) | Zmieniają numer w atrapie adresu | Lista 1043 daje trop do konta 1337; portal nie sprawdza właściciela |
| Logi | Wskazują pierwsze skuteczne wejście po zgadywaniu | 03:12:03, zewnętrzny adres, admin LOGIN OK po setkach FAIL |
| 4 · North Pole SIEM (komputer stacji) | Przeszukują zdarzenia, oddzielają szum od ataku i zgłaszają incydent; PIN z ekranu wpisują w telefonie | Alerty 03:10, 03:12 i 03:14; adres 185.220.101.7; konto admin; wejście 03:12:03; sesja S-7731; priorytet wysoki. Skan kont test/root, zaplanowana kopia, pomyłka Ani i VPN z MFA to szum. PIN: **481927** |

**14–19: North Pole SIEM (zadanie 4).** Jeden lub dwóch uczniów przy komputerze, reszta podpowiada. Pierwsze zapytania: `result:FAIL`, `user:admin -result:FAIL`. Kliknięcie wartości w tabeli zawęża wyniki, a kliknięcie słupka histogramu zawęża czas. Przy alertach: „Zdarzenia” pokazuje dowody, „Do incydentu” dołącza alert. Przy alertach i w zgłoszeniu SIEM przypomina, że do raportu trzeba zaznaczyć wszystkie alerty tego ataku. Przy błędnym zgłoszeniu SIEM od razu wymienia elementy do poprawy, a przy alertach mówi, ilu brakuje albo które zaznaczone są szumem. To analiza alertów, **nie zastępuje reakcji**. Puenta: pojedyncze alerty to szum, dopiero korelacja (konto + adres + sesja + czas) pokazuje incydent.

**19–22: osobny etap 5 — reakcja.** Dopiero po **czterech potwierdzonych zadaniach** odblokowuje się istniejąca układanka kolejności (przeciąganie albo strzałki/przyciski klawiaturą):

1. Zgłoś incydent i izoluj komputer.
2. Odetnij dostęp: unieważnij sesje, zmień hasło administratora.
3. Zabezpiecz logi i ustal zakres naruszenia.
4. Przywróć czysty system i wróć do pracy.

To kolejność **konkretnego uproszczonego scenariusza**, nie uniwersalna procedura IR. W rzeczywistości dowody zabezpiecza się możliwie wcześnie, działania bywają równoległe, a priorytety zależą od zagrożenia.
Przed reakcją nie pojawia się flaga. Po potwierdzeniu czterech zadań i reakcji przez serwer hub pokaże **flagę labu 3**. Drużyna wraca do formularza labu i wpisuje ją bez prowadzącego. Jak inne flagi, pozostaje ona publicznym rekwizytem ćwiczenia.

22–25: wnioski: potwierdzaj przelewy innym kanałem; serwer sprawdza własność danych; logi są dowodami, nie śmieciami do skasowania. Opcjonalne „Fałszywe strony” mierzy czas tylko dla zabawy i nie blokuje misji.
**Plan B:** komputer stacji nie działa → prowadzący otwiera `/#siem` na swoim laptopie lub telefonie i prowadzi drużynę przez zapytania. SIEM po wczytaniu działa bez sieci (dane są w stronie). **Offline:** wcześniej wczytane treści lub wydruki. Zaliczenie flagą dopiero online; po upływie terminu prowadzący może użyć uzasadnionego trybu awaryjnego.
**Reset:** postęp pozostaje przy drużynie. Opuść ją przed udostępnieniem telefonu kolejnej grupie; nowa drużyna nie dziedziczy SOC. Wyczyszczenie danych przeglądarki zmienia anonimowe konto — unikaj tego na telefonie ucznia.

## 4 · Biuro Grincha — karta UID i fizyczny dostęp

**2 osoby:** prowadzący prowadzi audyt; pomocnik pełni rolę elfa Bartka z kartą i nadzoruje Flippera. Nie potrzeba trzeciego operatora.

**Sprzęt:** Flipper Zero, własny tag/karta NDEF NTAG215 z tekstem „Karta elfa nr 77”, etui ekranujące i smycz, telefon Android Chrome NFC z ładowarką (może to być telefon prowadzącego — zob. wariant uproszczony niżej), taśma/karton na drzwi, rekwizyty biurka. Do finału: własny laptop Windows i `stacja4-badusb/operacja-biegun.txt` w Flipperze.

**Ważna granica pokazu:** demonstrujemy proste czytniki podejmujące decyzję na podstawie UID. Nie wszystkie karty NFC można tak skopiować; nowoczesne systemy z kryptograficznym uwierzytelnieniem są inne. Web NFC i emulację trzeba sprawdzić na docelowym zestawie sprzętu.

### Konfiguracja przed grupą

1. Organizator loguje się w `#admin`, przechodzi na `#drzwi`, uruchamia czytnik i zezwala na NFC.
2. W autoryzowanych ustawieniach klika „Zapisz kartę elfa” i przykłada wyłącznie kartę koła. Nie ma pola PIN ani przycisku „udawaj kartę”.
3. Testuje prawdziwy odczyt oryginału i kopii z Flippera; „DOSTĘP PRZYZNANY” pokazuje flagę labu 4. Sam odczyt nie zapisuje punktów — drużyna wpisuje flagę w terminalu.
4. Włącza **Pełny ekran · kiosk** i systemowe przypięcie aplikacji Android. Pełny ekran nie zabezpiecza fizycznie urządzenia ani sesji organizatora. Uczniowie nie obsługują ustawień; telefon pozostaje pod nadzorem.
5. W razie zmiany urządzenia używa „Wyczyść konfigurację urządzenia”. Nie przechowujemy sekretów ani PIN-ów w czytniku.

### Przebieg

- **0–3:** Grinch nie wyważył drzwi, tylko zdobył prosty identyfikator.
- **3–9:** audyt biurka, 8 problemów: hasło na karteczce, odblokowany laptop, grafik „klucz ma Bartek, karta 77”, znaleziony pendrive, fikcyjne dane w koszu, hasło Wi-Fi na tablicy, odblokowany telefon, plan nieczynnych kamer. Niczego nie podłączamy.
- **9–11:** omówienie; grafik wskazuje kartę demonstracyjną.
- **11–21:** pomocnik pokazuje kartę w etui (spróbuj ekranowania) i bez etui. Pod nadzorem: Flipper NFC → Read → Save → Emulate, przyłożenie do czytnika. **Nigdy nie proponujemy próby prywatnymi kartami uczniów**, nawet bez kopiowania.
- **21–24:** prowadzący podłącza własnego Flippera do własnego laptopa. Nieszkodliwy pokaz BadUSB otwiera Notatnik i pisze ostrzeżenie, niczego nie kasuje ani nie wysyła. Drużyny wpisują flagę czytnika w labie 4.
- **24–25:** wnioski: minimum danych na widoku, blokada ekranu, nieznane USB to ryzyko, UID to nie kryptograficzny dowód tożsamości.

**Plan B:** emulacja nie działa → pokaż zapisany odczyt i użyj oryginału karty koła. Czytnik nie działa → prowadzący obserwuje zadanie i zalicza awaryjnie z przyczyną. BadUSB nie działa → przeczytaj nieszkodliwy skrypt z rzutnika.
Po grupie usuń kopie **własnej karty koła** z Flippera, zresetuj pokaz i zabierz rekwizyty z prawdziwych obszarów biura. Żadnych prywatnych kart ani urządzeń uczniów.

### Wariant uproszczony (polecany przy mniejszej ilości sprzętu)

Ten sam przebieg i te same wnioski, mniej sprzętu i mniej rzeczy, które mogą zawieść.

**Czytnik na telefonie prowadzącego zamiast telefonu na drzwiach.**
- Prowadzący używa **własnego Androida z Chrome** (Web NFC działa tylko w Chrome na Androidzie, na iPhonie nie). Loguje się w `#admin`, otwiera `#drzwi`, zapisuje kartę koła. Konfiguracja zostaje w jego telefonie.
- Trzyma telefon w ręce albo kładzie go przy „drzwiach” z kartonu. Nie trzeba kiosku, systemowego przypięcia aplikacji ani montowania telefonu na drzwiach.
- Uczniowie przykładają oryginał albo Flippera z kopią do telefonu prowadzącego. „DOSTĘP PRZYZNANY” i flaga labu 4 pojawiają się na jego ekranie.
- Zaleta: sesja organizatora nie zostaje na urządzeniu bez nadzoru. Miejsce anteny NFC (zwykle środek tylnej ścianki) warto oznaczyć naklejką.

**Bez Androida albo gdy Web NFC zawodzi.**
- Czytnikiem może być drugi Flipper (NFC → Read) albo dowolny telefon z aplikacją do odczytu NFC. Pokazuje UID kopii, a prowadzący porównuje go z UID karty 77 wydrukowanym na grafiku dyżurów.
- Zgodny UID = „drzwi otwarte”. Prowadzący pokazuje wtedy flagę labu 4 z kartki (to jawny rekwizyt, jak flagi na stronach stacji).

**BadUSB — jak to działa i jak uprościć.**
- Flipper Zero ma wbudowaną aplikację **Bad USB**. Po podłączeniu kablem USB-C komputer widzi go jako **zwykłą klawiaturę** (urządzenie HID), nie jako pendrive. Nie trzeba niczego przerabiać ani udawać pendrive'a: skrypt `stacja4-badusb/operacja-biegun.txt` w folderze `badusb/` na karcie SD wystarczy.
- „Podrzucony pendrive” to fabuła. Prowadzący mówi wprost: prawdziwe urządzenia tego typu (np. USB Rubber Ducky) wyglądają jak zwykły pendrive, a komputer ufa każdej „klawiaturze”.
- Przed wydarzeniem raz podłącz Flippera do laptopa koła: Windows przy pierwszym razie instaluje sterownik klawiatury. Skrypt używa układu US, dlatego tekst jest bez polskich znaków.
- Jeszcze prościej: zamiast podłączania pokaż treść skryptu i krótkie nagranie z próby. Gdy brakuje czasu, BadUSB można pominąć — flaga labu 4 od niego nie zależy.

## Dodatkowe pokazy (opcjonalne)

Fajne uzupełnienie na stoisku koła w przerwie albo dla drużyn, które skończą stację przed czasem. Bez punktów i bez aplikacji — liczy się zabawa i rozmowa o obronie. Prowadzi je członek koła ze swoim sprzętem.

### Pilot Grincha — przejmowanie pilota (Sub-GHz)

- **Sprzęt:** Flipper Zero i **tani własny pilot 433 MHz** koła z odbiornikiem: brama od zabawki, listwa LED, dzwonek bezprzewodowy. Opcjonalnie drugi pilot z **kodem zmiennym (rolling code)** do porównania.
- **Przebieg:** uczniowie nagrywają Flipperem sygnał pilota (**Sub-GHz → Read**), zapisują go i odtwarzają (**Send**). Urządzenie reaguje jak na oryginał. Potem to samo z pilotem rolling code — powtórka nie działa.
- **Lekcja:** stare piloty z kodem stałym da się skopiować i powtórzyć, dlatego piloty samochodowe i bramowe używają kodu zmiennego.
- **Bezpieczeństwo i prawo:** kopiujemy **wyłącznie własny sprzęt koła**. Nagrywanie i odtwarzanie cudzego pilota do bramy, auta czy szlabanu jest nielegalne — to dobry temat do omówienia.

### Kłódki — otwieranie zamków (lockpicking)

- **Sprzęt:** przezroczyste kłódki treningowe i kilka tanich kłódek koła, zestaw napinaczy i wytrychów, ewentualnie kłódka z certyfikatem do porównania. Wszystkie zamki należą do koła.
- **Przebieg:** prowadzący pokazuje na przezroczystej kłódce, jak działają zapadki (bolce), potem uczniowie próbują sami: napinacz lekko obraca bębenek, wytrych unosi zapadki po kolei. Tania kłódka często puszcza w kilkanaście sekund, certyfikowana — nie.
- **Lekcja:** zabezpieczenie fizyczne jest tak mocne jak najsłabszy element. Tanie zamki chronią głównie przed okazją; ważne rzeczy wymagają lepszej klasy zamka, kilku warstw ochrony i monitoringu. To ten sam wniosek co przy kartach UID na stacji 4.
- **Zasady:** ćwiczymy **tylko na zamkach koła**. Nigdy na zamkach w użyciu (drzwi szkoły, szafki, rowery), nawet „dla żartu”. Otwieranie cudzego zamka bez zgody właściciela jest przestępstwem; samo posiadanie narzędzi treningowych nie jest. Nie dajemy uczniom zestawów do domu.

## Zadania w drodze i finał

Zadania poboczne są opcjonalne, bez wpływu na ranking: dotychczasowe 7 (w tym bot rozszerzony o agenta), **Przepełnienie sań** (buffer overflow: za długie imię kierowcy nadpisuje bajt uprawnień i cel lotu) Łącznie 8 zadań i 210 pkt edukacyjnych. Misja Grand Scam Auto VI jest tymczasowo ukryta i nie pojawia się w terminalu. Punkty edukacyjne pokazuje osobna tabela „Hakerzy” na rzutniku `#ekran`. Nie pobieramy plików wykonywalnych, nie kopiujemy nic do schowka, nie używamy aktywnych podejrzanych linków ani API AI.

Po czterech stacjach drużyna jest gotowa do finału niezależnie od pobocznych zadań. Koordynator uruchamia `#final`: alarm → odliczanie → cztery systemy → zielony status. Teleturniej z `final/kahoot-final.xlsx` pozostaje opcjonalny (0–100 oficjalnie, tylko w etapie Finał). Na koniec zamyka wydarzenie, pokazuje podium i pobiera CSV.

## Zbiorcza lista wyposażenia

| Stacja | Wyposażenie |
|---|---|
| 1 | 3–4 laptopy z przeglądarką, opcjonalny rzutnik |
| 2 | 3–4 laptopy/tablety, kalendarz, zdjęcie, wydruk hasha, wskazówki |
| 3 | Telefony, komputer stacji z `/#siem` (duży ekran lub rzutnik, mysz), wydruki awaryjne |
| 4 | Flipper, własny NTAG215 NDEF, etui/smycz, czapka elfa, Android NFC + ładowarka, laptop Windows, bezpieczny skrypt BadUSB, rekwizyty biurka |
| Pokazy dodatkowe | Flipper + własny pilot 433 MHz z odbiornikiem (opcjonalnie pilot rolling code), przezroczyste kłódki treningowe, tanie kłódki koła, napinacze i wytrychy |
| Wspólne | 8 prowadzących + koordynator, przedłużacze, dostęp do internetu, plakaty, plan sal, zegar; konta organizatorów tylko na nadzorowanych urządzeniach |

Przed wydarzeniem wykonaj [CHECKLISTA.md](CHECKLISTA.md). Konfiguracja i migracja: [INSTRUKCJA.md](INSTRUKCJA.md).
