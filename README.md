# 🎅 Operacja Biegun

Mikołajkowa gra terenowa koła cyberbezpieczeństwa dla 3 szkół średnich.
Drużyny po 3–4 osoby przechodzą 4 laboratoria ze sprzętem. Telefon służy im za **terminal misji**: prowadzi fabułę, odblokowuje kolejne etapy po wpisaniu PIN-u i pokazuje **ranking szkół na żywo**.

**Gra:** https://operacja-biegun.web.app

> Grinch włamał się do Centrum Logistyki Mikołaja i zablokował system rozdzielania prezentów.
> Zespoły reagowania na incydenty muszą odzyskać 4 fragmenty klucza głównego przed 13:00.

---

## Spis treści
- [Jak wygląda wydarzenie](#jak-wygląda-wydarzenie)
- [Stacje](#stacje)
- [Aplikacja](#aplikacja)
- [Punktacja i ranking](#punktacja-i-ranking)
- [Architektura i bezpieczeństwo](#architektura-i-bezpieczeństwo)
- [Struktura repozytorium](#struktura-repozytorium)
- [Uruchomienie i wdrożenie](#uruchomienie-i-wdrożenie)
- [Materiały do druku](#materiały-do-druku)
- [Checklista przed eventem](#checklista-przed-eventem)

---

## Jak wygląda wydarzenie

| Godzina | Miejsce | Co się dzieje |
|---|---|---|
| 09:00 – 09:25 | Aula | Wprowadzenie fabularne. Drużyny skanują QR, zakładają drużynę w apce i dołączają do niej. |
| 09:25 – 11:25 | 4 sale + korytarze | Gra główna: rotacja po 4 stacjach, po 25 min każda. Między salami zadania poboczne w apce. |
| 11:25 – 12:00 | Hol | stoisko koła ze sprzętem, ranking szkół na dużym ekranie (`#ekran`). |
| 12:00 – 12:40 | Aula | Finałowy teleturniej (Kahoot / Quizizz). Wynik można dopisać w panelu jako bonus. |
| 12:40 – 13:00 | Aula | Wyniki, puchar dla zwycięskiej szkoły, nagrody dla najlepszych drużyn. |

Stacje są **dla zabawy, bez oceniania**. Prowadzący nikogo nie punktuje, tylko po zabawie podaje drużynie PIN.

## Stacje

| # | Nazwa | Co robią uczniowie | Skąd PIN |
|---|---|---|---|
| 1 | Przechwycenie | Łączą się z fałszywym hotspotem z Flippera i wpisują dane z kartki. Głosują, które hasło do Wi-Fi jest najmocniejsze, i oglądają, jak słabe pada. | Złamane hasło routera testowego |
| 2 | Złam skarbiec | Szukają wskazówek w sali i ustawiają w symulatorze typ hasha, słownik i maskę. | Wynik symulatora |
| 3 | Fałszywy Mikołaj | Śledztwo SOC na telefonach (w stylu Advent of Cyber): szukają sygnałów phishingu w mailu, podglądają cudze listy przez zmianę numeru w adresie (IDOR) i znajdują w logach moment włamania. | Złożony z 3 fragmentów: GR + IN + CH (kod wejścia `SOC`) |
| 4 | Biuro Grincha | Audytują biurko „elfa” i z grafiku dyżurów ustalają, czyja karta otwiera warsztat. Z pomocą członka koła kopiują ją Flipperem i otwierają kopią czytnik przy drzwiach. | Czytnik `#drzwi` po przyłożeniu kopii karty |

**Dokładne scenariusze minuta po minucie, sprzęt, plan B i lista zakupów są w [STACJE.md](STACJE.md).**

**Zasada bezpieczeństwa stacji:** wszystko dzieje się na sprzęcie i kontach koła. Odizolowany router, fałszywe dane z kartek, karta elfa należąca do koła. Nie używamy szkolnej sieci, legitymacji ani prywatnych kont i urządzeń uczniów.

## Aplikacja

Jedna strona (`public/index.html`) z sześcioma widokami:

| Adres | Dla kogo | Co robi |
|---|---|---|
| `/` | uczniowie | Zakładanie drużyny lub dołączanie kodem, klucz główny, 4 laboratoria, zadania poboczne, ranking |
| `/#ekran` | rzutnik w holu | Ranking szkół (średnia na drużynę), top 8 drużyn, ostatnie punkty, zegar i odliczanie |
| `/#admin` | koło | Logowanie e-mailem, nazwy szkół, godzina końca gry, punkty z finału, usuwanie drużyn |
| `/#pulapka` | plakat „Darmowe pierniki” | Lekcja o quishingu: kto zeskanował nieznany kod, dowiaduje się, czym to grozi, i dostaje punkty |
| `/#skarbiec` | laptopy na stacji 2 | Symulator łamania haseł: typ hasha, słownik, maska, wielkość liter. Daje PIN stacji 2 i porównanie z mocnym hasłem |
| `/#drzwi` | telefon z Androidem przy drzwiach na stacji 4 | Czytnik kart (Web NFC): wpuszcza tylko zapisaną kartę elfa i pokazuje PIN ustawiony w tym telefonie |

**Zadania poboczne** (w drodze między salami, punkty dopisują się same):

| Zadanie | Na czym polega | Punkty |
|---|---|---|
| Prezent czy pułapka? | 8 wiadomości (SMS-y o paczkach, BLIK, fałszywe promocje) przesuwanych jak karty | 30 |
| Hasło do sań | 4 pytania o hasła, 2FA i menedżery haseł | 20 |
| Szyfr elfów | Szyfr Cezara z suwakiem; serwer sprawdza odpowiedź | 20 |
| Co zdradza zdjęcie? | Co relacja na Instagramie mówi o autorce | 20 |
| Darmowe pierniki | Plakat-pułapka z kodem QR na korytarzu | 30 |

**Drużyny:** jedna osoba zakłada drużynę (nazwa i szkoła) i dostaje 4-znakowy kod. Reszta dołącza, wpisując kod i pseudonim. Postęp jest wspólny: PIN wpisany na jednym telefonie odblokowuje fragment klucza na wszystkich. Nie zbieramy imion, nazwisk, klas ani e-maili uczniów.

## Punktacja i ranking

| Za co | Punkty |
|---|---|
| Każda stacja (poprawny PIN) | 100 |
| Zadania poboczne | 30 + 20 + 20 + 20 + 30 |
| Finał (opcjonalnie, wpisuje admin) | 0–100 |
| **Maksimum** | **620** |

**Ranking szkół** to **średnia punktów drużyn, które zaliczyły co najmniej jedną stację**. Dzięki temu:
- szkoła z większą liczbą drużyn nie ma przewagi,
- puste drużyny-żarty, założone choćby po to, żeby zaniżyć wynik rywala, nie wchodzą do średniej (PIN da się zdobyć tylko fizycznie na stacji).

## Architektura i bezpieczeństwo

```
 Telefon ucznia ──(anonimowe logowanie)──► Firebase Auth
       │
       └──► Firestore  teams/{KOD}              nazwa, szkoła, unlocked{}, side{}, bonus
                       teams/{KOD}/members/{uid} pseudonim
                       config/main               nazwy szkół, godzina końca
                       config/ranking            streszczenie rankingu dla telefonów (zapisuje #ekran)
                       admins/{uid}              lista organizatorów (dodawana ręcznie)
       ▲
 Rzutnik / panel ──(onSnapshot, na żywo)
```

- **Hosting:** Firebase Hosting. Konfiguracja SDK pobiera się sama z `/__/firebase/init.json`.
- **Logowanie:** uczniowie logują się anonimowo, bez kont. Organizatorzy logują się e-mailem i hasłem, a rejestracja nowych kont jest wyłączona w konsoli.
- **Reguły (`firestore.rules`) są całym zabezpieczeniem gry:**
  - **PIN-y stacji i hasło szyfru są tylko w regułach na serwerze.** Strona ich nie zna, więc nie da się ich wyczytać z kodu ani z ruchu sieciowego.
  - Członek drużyny może tylko **dopisywać** postęp. Nie może cofnąć postępu, zmienić nazwy drużyny ani wpisać punktów.
  - Stację da się zaliczyć tylko z prawdziwym PIN-em, nawet przy ręcznym zapisie do bazy z konsoli przeglądarki.
  - Drużynę tworzy się z poprawnymi polami (nazwa 2–28 znaków, szkoła 0–2, pusty postęp, czas serwera).
  - Usuwać drużyny i zmieniać ustawienia może tylko UID z kolekcji `admins`.
- **Oszczędzanie limitu darmowego planu (50 tys. odczytów dziennie):** na żywo wszystkie drużyny śledzą tylko `#ekran` i `#admin`. Ekran zalogowany jako admin co ok. 15 s zapisuje streszczenie rankingu w jednym dokumencie `config/ranking`. Telefony czytają ten dokument przy wejściu i na przycisk „Odśwież” (co najwyżej raz na 30 s), więc odświeżenie to 1 odczyt zamiast kilkudziesięciu.
- Postęp zapisuje się **transakcją**, więc zły PIN nie mignie na chwilę jako „odblokowany”.

> 🔑 Repozytorium jest publiczne, więc `firestore.rules` ma **zaślepki zamiast PIN-ów**. Prawdziwe reguły leżą lokalnie w `firestore.local.rules` (to on jest wdrażany), a ściąga dla prowadzących w `SEKRETY.md`. Oba pliki są w `.gitignore`. Odpowiedzi do symulatora i śledztwa są w kodzie strony, więc i tak może je zobaczyć każdy, kto zajrzy w źródło.

**Celowe uproszczenia (dobry temat na stoisko koła):**
- Zadania poboczne 1, 2, 4 i 5 sprawdza telefon, nie serwer. Uparta osoba z DevTools może je zaliczyć bez grania. Za to stacji nie zaliczy.
- Kod drużyny jest jak zaproszenie, nie jak hasło: kto go zna, ten może dołączyć.

## Struktura repozytorium

```
operacja-biegun/
├── public/
│   └── index.html        # cała aplikacja (HTML + CSS + JS, Firebase SDK z CDN)
├── firestore.rules       # reguły bazy (wzór z zaślepkami zamiast PIN-ów)
├── firebase.json         # hosting + reguły
├── .firebaserc           # domyślny projekt Firebase
├── plakaty/
│   ├── plakat-gra.pdf    # plakat A4 z QR do gry
│   ├── plakat-pierniki.pdf  # plakat-pułapka A4 z QR do #pulapka
│   ├── ulotki.pdf        # 8 ulotek z QR na A4
│   ├── *.html            # źródła plakatów (edycja + druk z przeglądarki)
│   └── qr-*.svg          # same kody QR
├── STACJE.md             # scenariusze 4 stacji dla prowadzących
├── final/
│   └── kahoot-final.xlsx # 18 pytań na finał do importu w Kahoot + omówienie dla prowadzącego
├── INSTRUKCJA.md         # konfiguracja Firebase krok po kroku
└── README.md
```

## Uruchomienie i wdrożenie

Pełna konfiguracja od zera (projekt, logowanie, baza, admini) jest w **[INSTRUKCJA.md](INSTRUKCJA.md)**.

Gdy projekt już istnieje:

```powershell
npm install -g firebase-tools
firebase login
firebase deploy
```

Polecenie wgrywa naraz stronę i reguły. Przed pierwszym wdrożeniem skopiuj `firestore.rules` jako `firestore.local.rules` i wpisz prawdziwe PIN-y. Zmiana PIN-u: popraw `firestore.local.rules` i uruchom `firebase deploy` jeszcze raz.

**Usunięcie drużyny testowej z konsoli:**
```powershell
firebase firestore:delete teams/KOD --recursive --force
```

## Materiały do druku

W folderze `plakaty/`:
- **`plakat-gra.pdf`**: główny plakat A4 z QR do gry. Wieszamy w aulach, na korytarzach i przy wejściu.
- **`plakat-pierniki.pdf`**: plakat-pułapka A4. Wieszamy przy planie lekcji i **nie mówimy, że jest częścią gry**.
- **`ulotki.pdf`**: 8 ulotek z QR na jednej kartce A4, do rozcięcia po liniach.

Drukować w skali 100% („Rzeczywisty rozmiar”), bez dopasowania do strony.

## Finał (teleturniej)

Plik [`final/kahoot-final.xlsx`](final/kahoot-final.xlsx) ma 18 pytań z tematów stacji (ok. 5 minut samego odpowiadania, z wynikami ok. 12–15 minut):

- **Arkusz „Kahoot”** do importu: w Kahoocie *Utwórz → Dodaj pytanie → Importuj arkusz*.
- **Arkusz „Omówienie dla prowadzącego”**: poprawne odpowiedzi i jedno zdanie komentarza po każdym pytaniu.

Jeśli import się nie uda, pobierz w Kahoocie oficjalny szablon i wklej do niego kolumny B–H. Punkty z finału wpisuje admin w `#admin` (0–100 na drużynę).

## Checklista przed eventem

- [ ] Nazwy 3 szkół wpisane w `#admin`
- [ ] Konta adminów dla prowadzących, ich UID-y w kolekcji `admins`
- [ ] Sprzęt i rekwizyty z listy zakupów w [STACJE.md](STACJE.md)
- [ ] PIN-y pasują do stacji: hasło routera testowego (1), wynik symulatora (2), fragmenty ze śledztwa (3), czytnik `#drzwi` skonfigurowany i przetestowany z kopią z Flippera (4)
- [ ] Na każdą stację 2 osoby z koła
- [ ] Próba generalna: 2 telefony, jedna drużyna, wszystkie 4 PIN-y, podgląd `#ekran`
- [ ] Drużyny testowe usunięte
- [ ] Kahoot na finał zaimportowany i przeklikany
- [ ] Plakaty i ulotki wydrukowane, plakat z piernikami powieszony
- [ ] Laptop z `#ekran` podłączony do rzutnika w holu i **zalogowany jako admin** (najpierw `#admin`, potem `#ekran`), bo tylko wtedy telefony dostają ranking
- [ ] Wi-Fi lub zasięg komórkowy w salach sprawdzony

---

Projekt koła cyberbezpieczeństwa · Mikołajki 2026
