# Checklista przed wydarzeniem

## Bezpieczeństwo i dane
- [ ] Kopia danych przechowywana prywatnie; migracja schematu przećwiczona na kopii.
- [ ] Dawne PIN-y unieważnione; nie są potrzebne do gry. Wydruki i historia repozytorium traktowane jako publiczne.
- [ ] Wdrożony `firestore.rules`, lokalna kopia identyczna. Publiczny ranking ma tylko dozwolone pola.
- [ ] Cztery aktywne `stationFlags` zgodne z `public/station-flags.js`; klient nie odczyta ich z bazy. Publiczne flagi ćwiczeń nie są sekretami kont.
- [ ] Próba odczytu cudzej drużyny oraz listy kodów i starych zaproszeń kończy się odmową.
- [ ] Konta prowadzących (Sala 1: 2, Sala 2: 2–3) i koordynatora; UID w `admins`, oddzielne profile/urządzenia, brak kont demonstracyjnych w produkcji.
- [ ] Zwykłe konto e-mail nie dostaje praw organizatora. Rejestracja anonimowa działa.

## Drużyny i etapy
- [ ] Nazwy szkół, sale (`Sala 1 | Sala 1 | Sala 2 | Sala 2`) i wiadomość centrali ustawione w panelu; kolejność i godziny tur szkół uzgodnione z prowadzącymi.
- [ ] Telewizor lub projektor z `/#ekran` (bez panelu `#admin` i kodów drużyn na ekranie).
- [ ] Ręczna zmiana etapu oraz start/zakończenie finału wymagają potwierdzenia; przy Grze głównej brak ostrzeżenia o minionym terminie.
- [ ] Właściwa **data**, strefa i deadline `mainEndsAt`, obejmujący turę **ostatniej** szkoły; sam zegar nie wystarczy.
- [ ] Między turami etap zostaje „Gra główna”; Przerwa/Finał/Zakończenie dopiero po ostatniej szkole (inaczej kolejne szkoły nie wpiszą flag).
- [ ] Gracz sam tworzy drużynę, drugi telefon wpisuje 6-znakowy kod i od razu dołącza, bez akceptacji prowadzącego.
- [ ] Limit 4 osób: piąty telefon dostaje odmowę, odejście zwalnia miejsce. Istniejące drużyny mają ustawiony licznik (`#admin → Prowadź → Ustaw licznik`, jeśli panel go pokazuje).
- [ ] Sam publiczny ID nie pozwala dołączyć; kod nie jest w rankingu, na rzutniku ani w URL.
- [ ] Kod jest widoczny członkom po odświeżeniu; po zmianie stary kod przestaje działać.
- [ ] Zakładanie drużyn i dołączanie działa w Grze głównej, Przerwie i Finale; zamknięta drużyna i etap „Wydarzenie zakończone” blokują je, także przy zapamiętanym kodzie.
- [ ] Cofnięty członek nie wraca automatycznie ani samym poprawnym kodem; blokada UID działa.
- [ ] Każdy etap przetestowany; Przerwa, Finał, Zakończenie i przekroczony deadline blokują zapisy flag i zadań (dołączanie do drużyn nadal działa do zakończenia).
- [ ] Tryb awaryjny wymaga organizatora i przyczyny, zwykłe zaliczenie poza grą jest odrzucane.

## Cztery stacje i reset
- [ ] Po 2 osoby na salę (w stacji 4 pomocnik łączy role elfa i operatora). Łącznie 8 + koordynator.
- [ ] Sprzęt z STACJE.md przygotowany, wszystkie dane i karty należą do koła.
- [ ] Gra: poziomy 1–2 w Console ramki; poziom 3 przez Application → Local Storage → adres gry → `rola`: `elf` → `admin`, bez konsoli i odświeżania. Trzy podpowiedzi, klawiatura/dotyk, reset parametrów i prawdziwego wpisu `rola=elf`, zatrzymanie w tle/po wyjściu.
- [ ] Gra nie ma dostępu do sesji rodzica ani sieci; lokalna meta nie przyznaje punktów.
- [ ] Kanał ramki przekazuje wyłącznie rolę ćwiczenia i jej reset; nie przekazuje innych danych storage, nie zmienia uprawnień Firebase ani wyników. Reset nie czyści innych wpisów przeglądarki.
- [ ] Flaga na mecie poziomu 3, wynik skarbca i flaga po poprawnym NFC są czytelne; wpisanie w labie daje 100 pkt bez panelu prowadzącego.
- [ ] Błędna flaga, flaga innej stacji i zapis po deadline są odrzucane; dwa telefony nie dodają podwójnych punktów.
- [ ] Skarbiec: poprawny wydruk nowego demonstracyjnego hasha, podpowiedzi, reset rundy.
- [ ] SOC: drużyna sama rozpoczyna śledztwo; trzy telefony równolegle zbierają dowody, hub synchronizuje stan.
- [ ] Komputery w Sali 2 z `/#siem`: zapytania, histogram i reset działają; poprawne zgłoszenie pokazuje PIN, telefon przyjmuje go jako zadanie 4 i zapisuje wspólny postęp.
- [ ] Skarbiec po otwarciu: pokaz soli i projekt zabezpieczeń (passkey 5/5) działają na laptopach stacji 2.
- [ ] Reakcja pozostaje osobnym etapem 5 po czterech zadaniach; flaga dopiero po reakcji; działają strzałki bez przeciągania.
- [ ] Opuszczenie drużyny i dołączenie do drugiej nie przenosi SOC ani starego postępu `ob_s3`.
- [ ] NFC: fizyczna próba oryginału i emulacji Flippera na docelowym Androidzie; plan B sprawdzony.
- [ ] Stacja 4: wybrany wariant (telefon na drzwiach albo uproszczony — telefon prowadzącego); BadUSB raz podłączony do laptopa koła przed wydarzeniem albo świadomie zastąpiony nagraniem.
- [ ] Uczestnik nie widzi konfiguracji PIN ani symulacji dobrej karty; kiosk/systemowe przypięcie, nadzór nad urządzeniem.
- [ ] Ani jednej próby prywatnymi kartami uczniów. BadUSB tylko na własnym laptopie.
- [ ] Po grupie usunięte kopie własnej karty z Flippera, wyzerowane stanowiska, panel niedostępny uczniom.
- [ ] Między szkołami reset każdego komputera: Sala 1 — reset w `/#gra` (rola=elf) i `/#skarbiec`; Sala 2 — reset w `/#siem`; na komputerach nikt nie zostaje w drużynie (terminalem jest telefon ucznia).
- [ ] Kolejne szkoły mogą usłyszeć flagi od poprzednich: po każdej turze „Sprawdź zaliczenia” w `#admin`.

## Misje, ranking, finał
- [ ] Oba etapy elfa-bota przeklikane; żadnych plików/komend/schowka/API AI. ClickFix usunięty z interfejsu.
- [ ] Laby mają etykietę „Do zrobienia”; ukryta misja Grand Scam nie pojawia się w terminalu (brak „sygnału 06”), licznik zadań pokazuje 8.
- [ ] Oficjalne maksimum 500, edukacyjne 210 poza rankingiem. Powtórne zaliczenie niczego nie dodaje.
- [ ] Przepełnienie sań przeklikane (odmowa → admin bez celu → kurs GRINCH); tabela hakerów na `#ekran` pokazuje punkty edukacyjne.
- [ ] Przed podium: `#admin` → „Sprawdź zaliczenia”; oznaczone drużyny wyjaśnione z prowadzącymi.
- [ ] Pokazy dodatkowe (pilot, kłódki): tylko sprzęt i zamki koła, nigdy zamki w użyciu.
- [ ] Remis szkół i drużyn oznacza wspólne miejsce także na rzutniku (np. 1, 1, 3); CSV otwiera polskie znaki i nie wykonuje formuł.
- [ ] Ranking działa po zamknięciu rzutnika, ma czas aktualizacji; limit odczytów Spark monitorowany.
- [ ] Finał: przed potwierdzeniem liczba gotowych drużyn i ostrzeżenie o zamknięciu flag; anulowanie bez zapisu. Inny organizator nie może zostać nieświadomie nadpisany.
- [ ] Finał: odliczanie, cztery systemy, dopiero potem pełny klucz, zielony status i podium; odświeżenie/ponowne otwarcie odtwarza etap. Zakończenie wymaga osobnego potwierdzenia po zapisaniu bonusów.
- [ ] Cztery główne stacje wystarczają bez zadań opcjonalnych. Bonus tylko w etapie Finał.
- [ ] Brak sieci nie pokazuje fałszywego zaliczenia; ponowienie działa po odzyskaniu połączenia.
- [ ] Mały telefon, klawiatura, widoczny fokus, ograniczony ruch i przyciski zamiast przeciągania sprawdzone.
- [ ] Plakaty/ulotki wydrukowane, QR przetestowane; dyplomy uczestnictwa (`plakaty/dyplom.pdf`) wydrukowane z zapasem i podpisane; teleturniej opcjonalnie zaimportowany.
- [ ] `npm test` i `npm run test:rules` zakończone powodzeniem na finalnej wersji.
- [ ] Na koniec zamknięte wydarzenie, pobrany CSV, ustalona retencja danych i dostępów.
