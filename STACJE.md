# Scenariusze stacji: dla prowadzących

Każda stacja trwa **25 minut**. W tym czasie w sali jest jedna grupa: kilka drużyn naraz, zwykle 10–16 osób.
Stacje są **dla zabawy**: nikogo nie oceniamy. Każda drużyna, która przejdzie przez stację, dostaje PIN.

Na każdą stację potrzebne są **2 osoby z koła**:
- **prowadzący** opowiada i pokazuje,
- **pomocnik** pilnuje sprzętu, czasu i drużyn, które utknęły.

## Zasady wspólne dla wszystkich stacji

1. **Wszystko na sprzęcie i kontach koła.** Nie łączymy się ze szkolną ani uczelnianą siecią. Nie dotykamy telefonów, kont ani kart uczniów.
2. **Na początku jedno zdanie:** „Pokazujemy to, żebyście umieli się bronić. Robienie tego komuś bez zgody to przestępstwo (art. 267 Kodeksu karnego)”.
3. **Drużyna wpisuje PIN sama**, w apce: *Laboratoria → numer stacji → PIN*. Jeśli serwer odrzuci PIN, najczęściej to literówka (wielkość liter i spacje nie mają znaczenia).
4. **Nie zostawiaj PIN-u na widoku**, np. na tablicy, przez którą przechodzą kolejne grupy.
5. **Ostatnie 3 minuty** każdej stacji to „Jak się bronić”: 3 wnioski. Te same teksty drużyna widzi w apce po wpisaniu PIN-u.

## Szablon 25 minut

| Minuty | Co się dzieje |
|---|---|
| 0–3 | Wejście, fabuła stacji (z apki albo własnymi słowami), zasady |
| 3–18 | Główne zadanie |
| 18–22 | Zdobycie PIN-u, drużyny wpisują go w apce |
| 22–25 | „Jak się bronić”: 3 wnioski, pytania, wyjście |

---

## Stacja 1 · Przechwycenie (Wi-Fi i Flipper Zero)

**PIN:** słabe hasło routera testowego koła, które pada w pokazie (wartość w `SEKRETY.md`).

**Cel:** uczniowie mają zobaczyć na własne oczy, że:
- otwarte Wi-Fi z ładną stroną logowania mógł postawić każdy,
- słabe hasło do Wi-Fi pada w kilka sekund.

### Sprzęt i przygotowanie
- **Flipper Zero + moduł Wi-Fi** (WiFi Dev Board, ESP32-S2/S3). Potrzebny, bo sam Flipper nie stawia Wi-Fi.
- **Aplikacja „Evil Portal”** na Flipperze (z Flipper Lab / aplikacji z firmware Momentum/Unleashed) i firmware **Marauder** na module Wi-Fi. Aplikacja serwuje stronę logowania i zapisuje wpisane dane do pliku na karcie SD.
- **Strona logowania: gotowa w `stacja1-portal/index.html`** w tym repo. Skopiuj ją na kartę SD Flippera do folderu aplikacji Evil Portal jako `index.html` (ścieżka zależy od firmware, zwykle `apps_data/evil_portal/index.html`). Ma już baner „POKAZ KOŁA CYBER – NIE WPISUJ PRAWDZIWYCH DANYCH”, pola e-mail i hasło oraz puentę po wysłaniu. Nazwa sieci (SSID), np. `Darmowe_WiFi_Mikolaja`, ustawiana jest w aplikacji Evil Portal, nie na stronie.
- 10–15 kartek z **fałszywymi danymi do wpisania**, np. `elf.janek@fabryka-mikolaja.pl` / `Pierniki123`.
- Własny router testowy koła z hasłem = PIN stacji 1 (małymi literami), niepodłączony do internetu.
- Laptop koła z przygotowanym wcześniej pokazem łamania hasła z listy słów, na danych z tego routera.
- Rzutnik albo duży monitor, żeby cała grupa widziała ekran.

> **Co z czego jest:** Flipper + moduł Wi-Fi udają otwartą sieć i podsuwają stronę logowania (to część „fałszywego hotspotu”). Łamanie hasła Wi-Fi to osobny, drugi pokaz na laptopie, na danych z własnego routera testowego. Oba na sprzęcie koła, nigdy na szkolnej sieci.
> **Jeśli nie macie modułu Wi-Fi do Flippera:** tę samą stronę `stacja1-portal/index.html` można pokazać na laptopie koła (otwórz plik w przeglądarce). Uczniowie wpisują dane z kartki, a wy pokazujecie, że „zniknęły” do prowadzącego. Pokaz traci element prawdziwego Wi-Fi, ale lekcja o fałszywej stronie zostaje.

### Przebieg
1. **(0–3)** Fabuła: „W nocy elfy łączyły się z darmowym Wi-Fi przy fabryce. Rano ich konta przejął Grinch”.
2. **(3–10) Fałszywy hotspot.** Drużyny łączą się z siecią `Darmowe_WiFi_Mikolaja` i wpisują w portalu dane z kartki. Na ekranie Flippera albo laptopa widać, jak te dane pojawiają się u „Grincha”.
   Pytanie do sali: *„Po czym można było poznać, że to pułapka?”* (Po niczym. To jest właśnie problem).
3. **(10–18) Hasło do routera.** Prowadzący pokazuje 3 hasła i prosi drużyny o głosowanie, które najtrudniej złamać:
   - hasło routera (krótkie słowo + 2 cyfry),
   - to samo słowo z rokiem i wykrzyknikiem,
   - `sanki-zorza-piernik-kominek`.
   Potem puszcza pokaz łamania hasła routera testowego. Pierwsze hasło pada w kilka sekund. Przy trzecim pokaz kończy się wynikiem „nie znaleziono”.
4. **(18–22)** Złamane hasło routera jest PIN-em. Drużyny wpisują je w apce.
5. **(22–25)** Wnioski:
   - nie wpisujemy haseł w portalach publicznych Wi-Fi,
   - w kawiarni czy na dworcu lepszy jest internet komórkowy,
   - hasło do domowego Wi-Fi ma być długie.

**Bezpieczeństwo:**
- Po pokazie wyłącz portal, żeby nikt w budynku przypadkiem się do niego nie łączył.
- Zebrane dane testowe usuń po każdej grupie.

**Plan B:** gdy Flipper albo moduł nie działa, pokaż nagranie z próby i przejdź od razu do głosowania nad hasłami.

### Wariant alternatywny (gdybyście kiedyś chcieli zamienić tę stację): Sub-GHz „Pilot Grincha”
Zamiast Wi-Fi można oprzeć stację 1 na radiu. Nie jest wdrożony, ale zostawiamy pomysł na przyszłość.
- **Sprzęt:** Flipper Zero (sam wystarczy, bez modułu Wi-Fi) i **tani własny pilot 433 MHz** koła: brama od zabawki, pilot do listwy LED, dzwonek bezprzewodowy. Opcjonalnie drugi pilot z **kodem zmiennym (rolling code)**, np. od nowszej bramy, do porównania.
- **Przebieg:** uczniowie nagrywają Flipperem sygnał z pilota (**Sub-GHz → Read**), zapisują go i odtwarzają (**Send**), a urządzenie reaguje, jakby użyto oryginału. Potem próbują to samo z pilotem rolling code — powtórka nie działa.
- **Lekcja:** stare piloty z kodem stałym da się skopiować i powtórzyć; dlatego nowe piloty samochodowe i bramowe używają kodu zmiennego. PIN stacji (np. słowo z obudowy pilota albo kod, który „otwiera bramę”) podajecie po pokazie.
- **Bezpieczeństwo i prawo:** kopiujemy **wyłącznie własny sprzęt koła**. Nagrywanie i odtwarzanie cudzego pilota do bramy, auta czy szlabanu jest nielegalne — to też dobry temat do omówienia.

---

## Stacja 2 · Złam skarbiec (symulator łamania haseł)

**PIN:** hasło administratora, które drużyny „łamią” w symulatorze.

**Cel:** zrozumieć bez wpisywania komend, że:
- atakujący nie zgaduje na ślepo, tylko korzysta z wiedzy o ofierze,
- imiona i daty padają pierwsze.

### Sprzęt i przygotowanie
- 3–4 laptopy albo tablety z otwartym **symulatorem**: **https://operacja-biegun.web.app/#skarbiec**. Działa też na telefonie, ale na laptopie lepiej widać konsolę.
- Wskazówki rozłożone w sali (Grinch zostawił je przy „biurku administratora”):

| Wskazówka | Co podpowiada |
|---|---|
| Kalendarz z zakreślonym **6 grudnia** | maska: litery + 2 cyfry, czyli dzień |
| Zdjęcie renifera z podpisem „Mój ulubieniec – Rudolf” | słownik: imiona reniferów |
| Wydruk „wycieku” z ciągiem 32 znaków szesnastkowych | typ hasha: 32 znaki hex pasują do MD5 (choć też do NTLM — długość zawęża, nie przesądza) |
| Karteczka „hasło: imię + dzień, WIELKIMI” | układ hasła |

### Przebieg
1. **(0–3)** Fabuła: „Grinch zmienił hasło administratora skarbca. Mamy jego hash z wycieku. Musimy je odzyskać, zanim skończy się czas”.
2. **(3–8)** Szybkie wyjaśnienie na tablicy, bez technikaliów:
   - hash to „odcisk palca” hasła,
   - z odcisku nie da się odczytać hasła, ale można sprawdzać kandydatów, aż odcisk się zgodzi.
3. **(8–18)** Drużyny szukają wskazówek w sali i ustawiają w symulatorze 4 rzeczy:

   | Ustawienie | Opcje w symulatorze | Dobra odpowiedź | Wskazówka w sali |
   |---|---|---|---|
   | Typ hasha | MD5 · SHA-1 · SHA-256 · bcrypt | **MD5** | hash z wycieku ma 32 znaki |
   | Słownik | Najpopularniejsze hasła · Imiona reniferów · Miasta Polski · Słownik języka polskiego | **Imiona reniferów** | zdjęcie Rudolfa |
   | Maska | samo słowo · + 2 cyfry · + 4 cyfry · + znak specjalny | **+ 2 cyfry** | kalendarz z 6 grudnia |
   | Wielkość liter | małe · Pierwsza wielka · WIELKIE | **WIELKIE** | karteczka „WIELKIMI” |

   Jak reaguje symulator:
   - **Zły typ hasha:** od razu odpowiada „Ten hash ma 32 znaki, a SHA-1 ma 40”.
   - **Zły słownik, maska albo wielkość liter:** przewija kandydatów i kończy „Brak trafienia”.
   - **Po 2 nieudanych próbach** sam podpowiada, żeby rozejrzeć się po sali.
   - **Po 4 nieudanych próbach** wskazuje, które ustawienie jest złe.
   - Pod konsolą zawsze widać, ilu kandydatów trzeba sprawdzić i ile to potrwa. Warto zwrócić na to uwagę drużynom.
4. **(18–22)** Przy dobrych ustawieniach symulator pokazuje hasło administratora i tabelę „Dlaczego poszło tak szybko?”: to samo hasło kontra fraza z 4 losowych słów, przy MD5 i przy bcrypt. Drużyny wpisują je jako PIN.
   Przed kolejną drużyną kliknij **„Nowa drużyna (reset)”**.
5. **(22–25)** Wnioski:
   - dane osobiste w haśle (imiona, daty) to pierwsze, co sprawdza atakujący,
   - długa fraza z losowych słów wytrzymuje znacznie dłużej,
   - menedżer haseł pozwala mieć różne hasło do każdego konta,
   - po stronie serwisów: hasła przechowuje się **wolną, pamięciożerną** funkcją — **Argon2id** (dziś zalecana) albo **bcrypt** — nigdy zwykłym MD5. Symulator pokazuje różnicę czasów w tabeli na końcu.
   - sama długość skrótu (32 znaki hex) nie przesądza, że to MD5 — pasuje też np. NTLM; w realnym śledztwie typ ustala się dokładniej.

**Plan B:** gdy laptopy zawiodą, drużyny otwierają `#skarbiec` na swoich telefonach. Gdy nie ma internetu, zostaje „symulator na kartce”: drużyna wybiera opcje na papierze, a prowadzący sprawdza je z tabelą powyżej.

> Symulator niczego naprawdę nie łamie. Liczy tylko, ilu kandydatów trzeba by sprawdzić, i pokazuje animację. Hash w wycieku to prawdziwy MD5 tego hasła, więc dociekliwi mogą to sprawdzić w domu.

---

## Stacja 3 · Fałszywy Mikołaj (śledztwo SOC na telefonach)

**PIN:** drużyna składa go z 3 fragmentów zdobytych w 3 zadaniach w apce.
**Kod wejścia do śledztwa:** w `SEKRETY.md`. Prowadzący podaje go na początku stacji, żeby nikt nie zrobił zadań wcześniej.

**Cel:** uczniowie sami, na telefonach, robią to, co analitycy SOC po prawdziwym incydencie:
- czytają podejrzanego maila,
- znajdują dziurę w stronie,
- szukają w logach momentu włamania.

Formuła jest inspirowana świątecznym kalendarzem zadań [TryHackMe Advent of Cyber](https://tryhackme.com/), tylko w wersji na 15 minut i bez komputera.

### Sprzęt i przygotowanie
- Telefony uczniów z apką. Każda drużyna ma co najmniej 1 telefon, a lepiej 3, żeby się podzielić zadaniami.
- Rzutnik albo duży monitor z apką otwartą na telefonie lub laptopie prowadzącego, do omawiania odpowiedzi.

### Przebieg
1. **(0–3) Fabuła i kod wejścia.**
   „Księgowa fabryki dostała maila od Mikołaja i zatwierdziła przelew 48 000 zł. Chwilę później ktoś grzebał w portalu prezentów. Jesteście zespołem SOC. Wejdźcie w *Laboratoria → 3 → Otwórz śledztwo* i wpiszcie kod wejścia”.
2. **(3–19) Śledztwo.** Drużyny dzielą się zadaniami: najlepiej każdy telefon bierze inne. Pomocnik chodzi między drużynami i podpowiada.

   | Zadanie | Co robią | Co trzeba znaleźć | Fragment |
   |---|---|---|---|
   | 1 · Mail od „Mikołaja” | Dotykają podejrzanych elementów maila i klikają „Sprawdź” | 5 sygnałów: inny adres „Odpowiedz do”, presja w temacie, prośba o pieniądze i tajemnicę, link do obcej domeny, załącznik `.pdf.exe` | 1. fragment |
   | 2 · Portal prezentów | Zmieniają numer listy w pasku adresu (`?id=1042`) i oglądają cudze listy | Na liście 1043 jest notatka o podejrzanym koncie 1337. Lista 1337 należy do Grincha | 2. fragment |
   | 3 · Logi serwera | Dotykają linii w dzienniku logowań | Linia `03:12:03 185.220.101.7 admin LOGIN OK`: pierwsze udane logowanie po setkach prób z zewnętrznego adresu, dokładnie o godzinie alarmu | 3. fragment |

   Przy złej odpowiedzi apka mówi, dlaczego to nie to, np. „Ania pomyliła hasło, adres wewnętrzny”. Drużyny uczą się na błędach, a nie tylko zgadują.
   Drużyny, które skończą wcześniej, robią **„Dla szybkich: fałszywe strony”**, czyli 8 adresów na czas.
3. **(19–22) Reakcja na incydent.** Gdy drużyna ma 3 fragmenty, apka **nie daje od razu PIN-u** — najpierw każe zdecydować, jak zareagować na wykryty atak. Drużyna zaznacza właściwe pierwsze kroki (izolacja komputera, wylogowanie przejętych sesji i zmiana hasła admina, zabezpieczenie logów, zgłoszenie incydentu) i odrzuca pułapki (kasowanie dowodów, wyłączenie logów, zapłata okupu, „udajmy, że nic się nie stało”). Dopiero potem składają fragmenty i wpisują PIN stacji.
   Lekcja: wykrycie to połowa roboty — tak samo ważne jest, co się robi po wykryciu.
4. **(22–25) Omówienie na rzutniku.** Na każdy etap jedno zdanie:
   - **Mail:** sprawdzaj, kto naprawdę pisze i dokąd prowadzi link. Prośbę o pieniądze potwierdź telefonicznie.
   - **Portal (IDOR):** strona pokazywała cudze dane, bo nie sprawdzała, czyja jest lista. To jeden z najczęstszych błędów stron. **Na prawdziwych stronach nie podglądamy cudzych danych, to przestępstwo. Błąd się zgłasza.**
   - **Logi:** setki nieudanych prób z jednego adresu to atak. Dlatego konta blokują się po kilku próbach, a hasło admina musi być długie.
   - **Reakcja:** najpierw zgłoś i izoluj, odetnij dostęp, zabezpiecz dowody. Nigdy nie kasuj logów i nie udawaj, że nic się nie stało.

**Plan B:**
- Słaby internet: zadania działają po wczytaniu strony. Wystarczy otworzyć apkę jeszcze na korytarzu.
- Drużyna bez telefonu: dołącza do innej drużyny albo korzysta z telefonu pomocnika.

---

## Stacja 4 · Biuro Grincha (bezpieczeństwo fizyczne i Flipper Zero)

**PIN:** pokazuje go **czytnik przy drzwiach warsztatu**, ale dopiero wtedy, gdy drużyna przyłoży **skopiowaną Flipperem** kartę elfa. PIN-u nie ma ani na karcie, ani w kodzie strony: organizator wpisuje go tylko w telefonie-czytniku.

**Cel:** uczniowie przechodzą całą drogę Grincha:
1. ustalają ze zostawionych na biurku informacji, czyja karta otwiera warsztat,
2. kopiują ją Flipperem z pomocą członka koła,
3. otwierają drzwi kopią, a nie oryginałem.

Puenta: karta zbliżeniowa to klucz, który da się skopiować z bliska w kilka sekund.

### Role
- **Prowadzący:** fabuła, audyt biurka, omówienie.
- **Elf Bartek:** pomocnik w czapce elfa, z kartą na smyczy w **etui ekranującym**. Spaceruje po sali i nie podchodzi do drzwi, a karta nie opuszcza jego szyi.
- **Operator Flippera:** członek koła, który podaje Flippera drużynie i prowadzi ją po menu. Flipper nie wychodzi z rąk drużyny bez nadzoru.

### Sprzęt i przygotowanie
- **Flipper Zero** (1–2 szt.).
- **Karta elfa:** 1 karta albo naklejka NFC typu **NTAG215** (kilka złotych) z zapisanym tekstem „Karta elfa nr 77”. Tekst zapisuje się raz, np. darmową aplikacją do NFC na Androidzie. Bez niego czytnik może nie zareagować.
- **Etui ekranujące RFID** na kartę (~10 zł) i smycz.
- **Czytnik drzwi:** telefon z **Androidem i Chrome**, z włączonym NFC i otwartym `https://operacja-biegun.web.app/#drzwi`, przyklejony taśmą przy „drzwiach warsztatu” (karton, ściana, drzwi sali). Ładowarka obowiązkowo.
- **BadUSB (finał stacji):** Flipper z wgranym skryptem [`stacja4-badusb/operacja-biegun.txt`](stacja4-badusb/operacja-biegun.txt) w folderze `badusb/` oraz **laptop koła z Windows** jako „ofiara”. Skrypt jest nieszkodliwy: otwiera Notatnik i wpisuje ostrzeżenie, nic nie kasuje. Warto wetknąć Flippera w obudowę zwykłego pendrive'a albo użyć niewinnie wyglądającego kabla, żeby wyglądał jak ten z biurka.
- **Biurko „elfa”** z błędami do audytu (lista niżej).
- Kartka „Błędy w biurze Grincha” dla każdej drużyny.

**Konfiguracja czytnika** (raz, przed eventem, na telefonie-czytniku):
1. Otwórz `#drzwi` i kliknij **Uruchom czytnik**. Zezwól na NFC.
2. Rozwiń **Ustawienia czytnika**, kliknij **Zapisz kartę elfa** i przyłóż oryginalną kartę.
3. Wpisz PIN stacji 4 (z `SEKRETY.md`) i kliknij **Zapisz PIN**.
4. Sprawdź: oryginalna karta daje zielony ekran z PIN-em, każda inna karta daje „ODMOWA”.
5. **Na próbie generalnej koniecznie przetestuj kopię z Flippera:** odczyt karty, zapis, emulacja przy czytniku. To jedyny element stacji, którego nie dało się sprawdzić bez sprzętu.

**Biurko „elfa”**, 8 błędów (lista tylko dla pomocnika):
1. Karteczka z hasłem przyklejona do monitora.
2. Odblokowany laptop z otwartą „pocztą fabryki”.
3. **Grafik dyżurów przy monitorze: „Dziś klucz do warsztatu ma elf Bartek (karta nr 77)”.** To trop do dalszej części stacji.
4. Pendrive z naklejką „WYPŁATY ELFÓW 2026”.
5. Wydruk listy prezentów z adresami dzieci w zwykłym koszu zamiast w niszczarce.
6. Hasło do Wi-Fi na tablicy korkowej.
7. Telefon bez blokady ekranu.
8. Plan budynku z zaznaczonymi „kamerami nieczynnymi”.

### Przebieg
1. **(0–3) Fabuła:** „Grinch wszedł do warsztatu, nie wyważając drzwi. Miał kopię karty elfa. Zobaczmy, jak ją zdobył”.
2. **(3–9) Audyt biurka.** Drużyny mają 6 minut na wypisanie błędów. **Niczego nie podłączamy.** Pendrive tylko wskazujemy, to też jest lekcja.
3. **(9–11) Omówienie biurka.** Pomocnik czyta listę. Na koniec pytanie: *„Który błąd przyda się Grinchowi teraz?”*. Odpowiedź: grafik dyżurów, bo mówi, czyją kartę skopiować.
4. **(11–21) Operacja „Klon”**, drużyna po drużynie, ok. 2–3 minuty na drużynę:
   1. Drużyna znajduje w sali elfa Bartka.
   2. Najpierw próbuje odczytać kartę **przez etui**. Nie działa. Lekcja: etui ekranujące naprawdę chroni.
   3. Bartek wyjmuje kartę z etui, ale dalej trzyma ją na smyczy. Uczeń przykłada Flippera do karty: **NFC → Read**, a potem **Save** pod nazwą drużyny. Operator Flippera prowadzi go krok po kroku.
   4. Drużyna idzie do czytnika przy drzwiach. Uczeń wybiera zapisaną kartę i **Emulate**, po czym przykłada Flippera do telefonu-czytnika.
   5. Czytnik pokazuje **„DOSTĘP PRZYZNANY”** i PIN. Drużyna wpisuje go w apce.

   Drużyny, które czekają na swoją kolej, mogą próbować „oszukać” czytnik własnymi kartami, np. kartą miejską. Czytnik odpowie „ODMOWA”, bo zna tylko kartę elfa. *Uwaga: tylko przykładanie do czytnika, bez kopiowania czyichkolwiek kart.*
5. **(21–24) Finał: „A gdyby ktoś podłączył ten pendrive?”** Prowadzący wraca do pendrive'a z biurka (błąd nr 4), który drużyny słusznie zostawiły.
   - *„Zostawiliście go. A co, gdyby ktoś go podłączył z ciekawości?”* Prowadzący wpina Flippera (w obudowie pendrive'a) do laptopa koła i uruchamia skrypt BadUSB.
   - Na oczach sali laptop **sam** otwiera Notatnik i wpisuje ostrzeżenie. Nikt nie dotyka klawiatury.
   - Puenta: *„To nie był pendrive z plikami. To była klawiatura, która sama pisze. Dlatego nie podłączamy znalezionych pendrive'ów, kabli ani ładowarek”.*
6. **(24–25) Wnioski:**
   - grafiki, identyfikatory i plany na widoku mówią obcym, kogo i gdzie szukać,
   - część kart zbliżeniowych da się skopiować z bliska w kilka sekund, a nowoczesne karty z szyfrowaniem są dużo trudniejsze,
   - kartę trzymamy w etui i przy sobie,
   - nieznane urządzenie USB może być czymś innym, niż wygląda,
   - żadnych haseł na karteczkach, blokujemy ekran (Windows + L).

**Bezpieczeństwo:**
- Flipper kopiuje **wyłącznie kartę elfa koła**, a skrypt BadUSB uruchamiamy **tylko na własnym laptopie koła**. Skrypt niczego nie kasuje ani nie wysyła.
- Nie odczytujemy ani nie kopiujemy kart uczniów, legitymacji, kart do budynku ani kart płatniczych, nawet jeśli ktoś sam zaproponuje.
- Nie wpinamy Flippera-BadUSB do cudzych komputerów ani do szkolnego sprzętu.
- Po stacji operator usuwa z Flippera zapisane kopie kart.

**Plan B:**
- **Kopia z Flippera nie działa przy czytniku** (np. inny typ karty): drużyna pokazuje operatorowi ekran Flippera z odczytaną kartą „elfa nr 77”, a operator przykłada oryginalną kartę Bartka do czytnika.
- **Telefon-czytnik zawiedzie:** PIN mówi operator po poprawnym odczycie karty Flipperem.
- **BadUSB nie pisze** (zły układ klawiatury, inny system): otwórzcie skrypt `operacja-biegun.txt` na rzutniku i przeczytajcie go na głos. Komentarze u góry pliku wyjaśniają, co by się stało.

---

## Lista zakupów i przygotowań

| Stacja | Do kupienia lub zorganizowania |
|---|---|
| 1 | Flipper Zero + moduł Wi-Fi (WiFi Dev Board z Marauderem), aplikacja Evil Portal, strona `stacja1-portal/index.html` na karcie SD, router testowy (może być stary), kartki z fałszywymi danymi, laptop z pokazem łamania hasła |
| 2 | 3–4 laptopy z `#skarbiec`, kalendarz, zdjęcie renifera, wydruk „wycieku”, karteczki |
| 3 | Nic poza telefonami i rzutnikiem |
| 4 | Flipper Zero, karta lub naklejka NFC NTAG215, etui ekranujące RFID, smycz, czapka elfa, telefon z Androidem jako czytnik (z ładowarką), **laptop koła z Windows + skrypt BadUSB** (`stacja4-badusb/operacja-biegun.txt`), pendrive-atrapa (albo obudowa na Flippera), rekwizyty na biurko, kartki-listy |
| Wszystkie | Przedłużacze, kartka z PIN-em tylko dla prowadzącego, zegar lub minutnik |
