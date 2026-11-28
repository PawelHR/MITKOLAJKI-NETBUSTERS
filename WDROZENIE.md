# Wdrożenie Operacji Biegun — 28 listopada 2026 (czas polski)

**Aktualny tryb po uproszczeniu:** gracze sami tworzą drużyny i dołączają 6-znakowym kodem. Laby zaliczają samodzielnie flagami pokazywanymi po ćwiczeniach na stronach stacji. ClickFix usunięty. Pierwsze etapy wdrożenia poniżej są zapisem historycznym; późniejsze aktualizacje opisano na końcu dokumentu.

Wykonane na wyraźne polecenie właściciela projektu.

- **Produkcja:** https://operacja-biegun.web.app
- **Repozytorium:** https://github.com/PawelHR/MITKOLAJKI-NETBUSTERS
- **Stacja 3:** mail (1), portal (2), logi (3), nowa konsola SOC (4), dotychczasowa reakcja jako oddzielny etap (5).

## Kopia przed zmianami

Prywatny katalog poza repozytorium, z ACL ograniczonym do konta operatora i SYSTEM:

- 13 dokumentów Firestore, w tym 7 drużyn, 3 członkostwa, konfiguracja i lista organizatorów;
- 10 istniejących kont Auth;
- poprzedni opublikowany Hosting (3 pliki, w tym automatyczna konfiguracja SDK), metadane wersji i reguły;
- historia Git w bundle, stan roboczy, index i źródła;
- manifest SHA-256, zweryfikowany po zapisie.

Kopia zawiera dane prywatne i dawne kody. **Nie jest i nie powinna być publikowana na GitHubie.** Lokalizacja została przekazana właścicielowi osobno. Katalog jest w prywatnym obszarze tymczasowym operatora — właściciel powinien przenieść go do trwałego, zabezpieczonego archiwum przed czyszczeniem plików tymczasowych.

## Kolejność i wynik

1. Zweryfikowano testy: 17/17 aplikacji/modelu migracji i 17/17 reguł w emulatorze.
2. Wdrożono restrykcyjne `firestore.rules`, zamykając stare publiczne odczyty.
3. Wykonano **jeden atomowy commit 18 zapisów**, z warunkami `updateTime` względem kopii. Zachowano 7 drużyn, wszystkich 3 istniejących członków i wszystkie 3 wcześniejsze zaliczenia stacji. Kody zamieniono na `true`, dodano 7 bezsekretowych projekcji rankingu i 3 wpisy audytowe. Nie usuwano kont ani dokumentów drużyn. Stare punkty edukacyjne zachowano jako statusy, poza oficjalnym rankingiem.
4. Po migracji ponownie odczytano stany prywatne/publiczne i porównano zachowanie członkostw. Dołączanie do istniejących drużyn jest zamknięte; nie przywrócono brakujących członkostw.
5. Wdrożono Hosting. Zweryfikowano SHA-256 opublikowanych `index.html`, `core.js`, `sw.js` względem plików lokalnych oraz poprawny projekt konfiguracji SDK.
6. Sprawdzono publiczny ranking (7 dokumentów) i odmowy HTTP 403 bez logowania dla dokumentów/list drużyn, członków, zaproszeń i starego `config/ranking`.
7. Dopiero po weryfikacji ustawiono **Rejestrację**. Gra główna nie została automatycznie uruchomiona.
8. Uruchomiono produkcyjną stronę w Chromium: logowanie anonimowe i formularz sekretnego zaproszenia działają, konsola nie zgłosiła błędów. Nie tworzono testowej drużyny na produkcji; zwykłe otwarcie aplikacji mogło dodać anonimowe konto przeglądarki, jak przy każdej wizycie.

## Co musi zrobić organizator przed grą

- Zalogować się istniejącym kontem w `#admin`; nowe konta uprzywilejowane nie były tworzone.
- Ustawić rzeczywistą datę i godzinę `mainEndsAt`, sale i harmonogram. Domyślny/migracyjny deadline nie uruchamia gry.
- Przejrzeć dotychczasowe członkostwa — stary system nie gwarantował ich autoryzacji.
- Świadomie otworzyć rejestrację wybranych istniejących drużyn i przekazać członkom ich krótki kod dołączania. Publiczny ID nie wystarczy do dołączenia.
- Wykonać fizyczną próbę NFC/Flippera, telefonów, zasięgu i trybu offline zgodnie z [CHECKLISTA.md](CHECKLISTA.md).

Nie cofaj reguł do poprzedniej wersji przy ewentualnym rollbacku strony. Kopia pozwala na świadome odzyskanie danych przez operatora, ale nie jest zgodą na automatyczne nadpisywanie nowych postępów. Instrukcje narzędzi: [INSTRUKCJA.md](INSTRUKCJA.md).

## Aktualizacja — proste kody dołączania

Na kolejne polecenie właściciela usunięto z interfejsu długie zaproszenia i oczekiwanie na prowadzącego. Gracz sam zakłada drużynę; koledzy wpisują jej 6-znakowy kod i od razu uzyskują członkostwo. Kod jest prywatnym polem drużyny oraz niewylistowywalnym indeksem `joinCodes`; publiczny ID i ranking go nie ujawniają.

Przed zmianami powstała **druga prywatna kopia**: 23 dokumenty bazy, 11 kont Auth, 6 plików ówczesnego Hostingu, reguły i repozytorium. Manifest zweryfikowano; katalog poza repozytorium ma ACL ograniczony do operatora i SYSTEM. Obie kopie zachowano, żadna nie jest na GitHubie.

Po testach reguł wykonano atomowe 14 zapisów: 7 kodów i 7 uzupełnień istniejących drużyn. Świadomie otwarto dołączanie do tych drużyn. **Wyniki, dotychczasowe członkostwa i blokady cofniętych UID pozostały bez zmian**, co sprawdzono po zapisie. Etap nadal jest Rejestracją. Twórca lub organizator może zamknąć konkretną drużynę albo zmienić kod. Dołączanie nie daje prawa do nadawania oficjalnych punktów.

Weryfikacja: 18/18 testów aplikacji/modelu oraz 24/24 reguł, w tym współbieżne dołączanie, błędny/stary kod, zamknięcie drużyny i etapu oraz blokady. Próba dwóch anonimowych sesji w przeglądarce potwierdziła samodzielne utworzenie/dołączenie i zachowanie kodu po odświeżeniu. Nie utworzono testowej drużyny na produkcji.

Kto pozna kod, może dołączyć w czasie otwartej rejestracji — to oczekiwany, prosty model uczestnictwa, nie silne uwierzytelnienie hasłem. Nie pokazuj kodów na rzutniku. W tej historycznej wersji stacje zatwierdzali jeszcze prowadzący; kolejna zmiana przywraca flagi.

## Aktualizacja — samodzielne flagi labów, bez ClickFix

Na kolejne polecenie właściciela przywrócono formularz flagi w każdym labie. Strona gry pokazuje flagę po trzecim poziomie, skarbiec po odzyskaniu hasła, SOC po czterech zadaniach i osobnej reakcji, a czytnik po zgodnym UID. Drużyna sama rozpoczyna SOC. ClickFix usunięto; osiem zadań pobocznych daje maks. 210 pkt edukacyjnych. Historycznych danych p9 nie kasujemy.

Przed zmianą wykonano **trzecią prywatną kopię**: 26 dokumentów bazy (w tym 3 aktualnie istniejące drużyny), 2 osieroconych rodziców, 11 kont Auth, 6 plików Hostingu, reguły i repozytorium. Manifest SHA-256 zweryfikowano, ACL ograniczono do operatora i SYSTEM. Nie odtwarzamy drużyn usuniętych przez właściciela między wdrożeniami.

Testy przed wdrożeniem: **21/21 aplikacji/modelu i 34/34 reguł**. Lokalna próba przeglądarkowa potwierdziła flagi gry i skarbca, błędny/poprawny formularz oraz SOC: zadanie 4 → osobna reakcja 5 → flaga. Web NFC zweryfikowano atrapą w testach, nie fizycznym sprzętem.

Flagi są jawne i możliwe do przekazania innym drużynom. Serwer sprawdza wartość, członkostwo, etap, deadline i jednokrotność; audyt pozostaje prywatny i niezmienialny, publiczny ranking nie zawiera flag. Prowadzący zachowuje tryb awaryjny z uzasadnieniem. Konfiguracja wdrożenia dotyczy tylko czterech dokumentów `stationFlags`, reguł i publicznych plików — bez zmiany drużyn, członkostw, wyników lub ustawień wydarzenia.

**Wynik wdrożenia:** reguły skompilowano i opublikowano, atomowo utworzono cztery aktywne flagi, następnie opublikowano Hosting. Ponowne `--verify` potwierdziło zgodność wszystkich flag; smoke test potwierdził SHA-256 czterech publicznych plików, 3 aktualne dokumenty rankingu i odmowy odczytu danych prywatnych. Odczytano etap **Finał**, ustawiony przez organizatora; nie został zmieniony. Zapisy flag wymagają przełączenia w panelu na Grę główną oraz aktualnego deadline.

Otwarta w osobnej karcie produkcyjna piaskownica zawiera nowe instrukcje flagi, zachowuje sandbox bez `allow-same-origin`; publiczna wersja ma formularz i moduł flag oraz nie zawiera ClickFix. Nie tworzono testowej drużyny na produkcji ani nie zmieniano otwartego panelu użytkownika. Wszystkie trzy prywatne kopie pozostają poza repozytorium.

## Aktualizacja — bezpieczny finał i czytelny terminal

Po przeglądzie dodano potwierdzenie startu, wstrzymania i zakończenia finału, liczbę gotowych drużyn i ostrzeżenia o zamknięciu zapisów. Wybrany czas oraz pytanie przetrwają aktualizacje panelu; transakcja odrzuca potwierdzenie, jeśli inny organizator zmienił etap lub sterowanie finałem. Pełny klucz na dużym ekranie pojawia się dopiero po zakończeniu sekwencji. Rzutnik respektuje wspólne miejsca drużyn i wyróżnia wszystkie szkoły na pierwszym miejscu. Laby mają etykietę „Do zrobienia”; odkrycie Grand Scam jest zapamiętywane lokalnie dla danej drużyny, bez punktów za samo odkrycie.

Weryfikacja: **35/35 testów**, lokalna próba pytań i anulowania w przeglądarce oraz prawdziwych transakcji z regułami w osobnym, tymczasowym projekcie emulatora. Wdrożono wyłącznie Hosting. Odczytowa kontrola produkcji potwierdziła zgodność plików, prywatność danych, 1 bieżący dokument rankingu i etap **Gra główna**. Produkcyjny `#final` sprawdzono bez uruchamiania finału — klucz jest zastąpiony kropkami. Nie zmieniano konfiguracji wydarzenia, wyników, drużyn ani reguł produkcji. Fizyczne NFC/Flipper i próba telefonów przy słabym zasięgu nadal wymagają sprawdzenia na miejscu.
