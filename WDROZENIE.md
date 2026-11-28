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
