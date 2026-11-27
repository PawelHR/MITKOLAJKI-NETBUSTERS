# Checklista przed wydarzeniem

## Bezpieczeństwo i dane
- [ ] Kopia danych przechowywana prywatnie; migracja schematu przećwiczona na kopii.
- [ ] Dawne PIN-y unieważnione; nie są potrzebne do gry. Wydruki i historia repozytorium traktowane jako publiczne.
- [ ] Wdrożony `firestore.rules`, lokalna kopia identyczna. Publiczny ranking ma tylko dozwolone pola.
- [ ] Próba odczytu cudzej drużyny oraz listy kodów i starych zaproszeń kończy się odmową.
- [ ] Konta 8 prowadzących i koordynatora; UID w `admins`, oddzielne profile/urządzenia, brak kont demonstracyjnych w produkcji.
- [ ] Zwykłe konto e-mail nie dostaje praw organizatora. Rejestracja anonimowa działa.

## Rejestracja i etapy
- [ ] Nazwy szkół, sale, harmonogram i wiadomość centrali ustawione w panelu.
- [ ] Właściwa **data**, strefa i deadline `mainEndsAt`; sam zegar nie wystarczy.
- [ ] Gracz sam tworzy drużynę, drugi telefon wpisuje 6-znakowy kod i od razu dołącza, bez akceptacji prowadzącego.
- [ ] Sam publiczny ID nie pozwala dołączyć; kod nie jest w rankingu, na rzutniku ani w URL.
- [ ] Kod jest widoczny członkom po odświeżeniu; po zmianie stary kod przestaje działać.
- [ ] Zamknięta drużyna i zamknięta Rejestracja blokują samodzielne dołączanie, także przy zapamiętanym kodzie.
- [ ] Cofnięty członek nie wraca automatycznie ani samym poprawnym kodem; blokada UID działa.
- [ ] Każdy etap przetestowany; Przerwa, Finał, Zakończenie i przekroczony deadline blokują zapisy uczestników.
- [ ] Tryb awaryjny wymaga organizatora i przyczyny, zwykłe zaliczenie poza grą jest odrzucane.

## Cztery stacje i reset
- [ ] Po 2 osoby na salę (w stacji 4 pomocnik łączy role elfa i operatora). Łącznie 8 + koordynator.
- [ ] Sprzęt z STACJE.md przygotowany, wszystkie dane i karty należą do koła.
- [ ] Gra: trzy poziomy, trzy podpowiedzi, klawiatura/dotyk, kontekst ramki w DevTools, pełny reset parametrów i roli, zatrzymanie w tle/po wyjściu.
- [ ] Gra nie ma dostępu do sesji rodzica ani sieci; lokalna meta nie przyznaje punktów.
- [ ] Skarbiec: poprawny wydruk nowego demonstracyjnego hasha, podpowiedzi, reset rundy.
- [ ] SOC: trzy telefony jednej drużyny równolegle zbierają dowody; hub synchronizuje stan.
- [ ] Konsola SOC jest osobnym zadaniem 4; wybór dwóch skorelowanych alertów i wysokiego priorytetu zapisuje wspólny postęp.
- [ ] Reakcja pozostaje osobnym etapem 5 po czterech zadaniach; finalny raport dopiero po reakcji; działają strzałki bez przeciągania.
- [ ] Opuszczenie drużyny i dołączenie do drugiej nie przenosi SOC ani starego postępu `ob_s3`.
- [ ] NFC: fizyczna próba oryginału i emulacji Flippera na docelowym Androidzie; plan B sprawdzony.
- [ ] Uczestnik nie widzi konfiguracji PIN ani symulacji dobrej karty; kiosk/systemowe przypięcie, nadzór nad urządzeniem.
- [ ] Ani jednej próby prywatnymi kartami uczniów. BadUSB tylko na własnym laptopie.
- [ ] Po grupie usunięte kopie własnej karty z Flippera, wyzerowane stanowiska, panel niedostępny uczniom.

## Misje, ranking, finał
- [ ] Grand Scam Auto VI, ClickFix, oba etapy elfa-bota przeklikane; żadnych plików/komend/schowka/API AI.
- [ ] Oficjalne maksimum 500, edukacyjne 230 poza rankingiem. Powtórne zaliczenie niczego nie dodaje.
- [ ] Remis szkół oznacza wspólne miejsce, niezależnie od liczby drużyn; CSV otwiera polskie znaki i nie wykonuje formuł.
- [ ] Ranking działa po zamknięciu rzutnika, ma czas aktualizacji; limit odczytów Spark monitorowany.
- [ ] Finał: odliczanie, gotowe drużyny, cztery systemy, zielony status i podium; odświeżenie/ponowne otwarcie odtwarza etap.
- [ ] Cztery główne stacje wystarczają bez zadań opcjonalnych. Bonus tylko w etapie Finał.
- [ ] Brak sieci nie pokazuje fałszywego zaliczenia; ponowienie działa po odzyskaniu połączenia.
- [ ] Mały telefon, klawiatura, widoczny fokus, ograniczony ruch i przyciski zamiast przeciągania sprawdzone.
- [ ] Plakaty/ulotki wydrukowane, QR przetestowane; teleturniej opcjonalnie zaimportowany.
- [ ] `npm test` i `npm run test:rules` zakończone powodzeniem na finalnej wersji.
- [ ] Na koniec zamknięte wydarzenie, pobrany CSV, ustalona retencja danych i dostępów.
