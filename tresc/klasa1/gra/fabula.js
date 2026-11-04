/* FABUŁA I ZADANIA – klasa 1, rozdział 1 (pilot)
   Tokeny w tekstach: {szef} {pomocnik} {wrog} {agencja} {dowod} – podmieniane zależnie od klimatu.
   Typy zadań: wybor, wiele, kolej, para, wpisz, blad, klucz. */
window.FABULA = {
  klasa: 1,
  rozdzial: "Rozdział 1. Urządzenia komputerowe w sieci",
  lekcje: "../klasa1-informatyka-efekty.html",
  testy: "../sprawdziany.html",

  motywy: {
    det: {
      nazwa: "Detektywistyczny", opis: "Agencja, śledztwo i tajemniczy włamywacz.",
      sprawa: "Sprawa Cienia", agencja: "Agencja Cyfrowych Detektywów",
      szef: "Komisarz Braniewski", pomocnik: "Bajt", pomocnikB: "Bajta", wrog: "Cień",
      dowod: "Dowód", kolekcja: "Teczka dowodów", akta: "Akta sprawy",
      stopnie: ["Kadet", "Detektyw", "Inspektor", "Nadinspektor", "Legenda Agencji"]
    },
    szp: {
      nazwa: "Szpiegowski", opis: "Tajne operacje, szyfry i nieuchwytny agent.",
      sprawa: "Operacja Fantom", agencja: "Biuro Szyfrów",
      szef: "Dowódca Braniewski", pomocnik: "ECHO", pomocnikB: "ECHO", wrog: "Fantom",
      dowod: "Depesza", kolekcja: "Archiwum depesz", akta: "Teczka operacji",
      stopnie: ["Kursant", "Agent terenowy", "Agent specjalny", "Oficer wywiadu", "Legenda wywiadu"]
    },
    fan: {
      nazwa: "Fantasy", opis: "Akademia magii, zaklęte maszyny i mroczny czarnoksiężnik.",
      sprawa: "Kronika Nulla", agencja: "Akademia Kodu",
      szef: "Arcymag Braniewski", pomocnik: "Pixel", pomocnikB: "Pixel", wrog: "Null",
      dowod: "Artefakt", kolekcja: "Księga artefaktów", akta: "Zwoje wiedzy",
      stopnie: ["Uczeń", "Adept", "Czarodziej", "Mistrz Kodu", "Arcymistrz"]
    }
  },

  /* Karty do kolekcji. Tytuł zależy od klimatu, fakt jest wspólny. */
  karty: {
    c1: { t: { det: "Odcisk w logach", szp: "Przechwycony log", fan: "Runa B0" },
          f: "Proces to uruchomiony program, któremu system przydziela pamięć i czas procesora. W logu tego procesu ktoś zostawił podpis: B0." },
    c2: { t: { det: "Adres MAC intruza", szp: "Sygnał nadajnika", fan: "Kryształ z wieży" },
          f: "Adres MAC ma 48 bitów i zapisuje się go szesnastkowo, np. 3C:22:FB:9A:01:7A. Producent nadaje go karcie sieciowej." },
    c3: { t: { det: "Zeznanie świadka", szp: "Raport informatora", fan: "Wizja wyroczni" },
          f: "Świadek potwierdza: {wrog} wynajął serwer gdzieś w Internecie i ukrywa się za adresem opisowym." },
    c4: { t: { det: "Adres kryjówki", szp: "Współrzędne serwera", fan: "Mapa do Wieży" },
          f: "DNS zamienia adres opisowy na adres IP. Polecenie tracert pokazuje drogę pakietów przez kolejne routery." },
    c5: { t: { det: "Ostatnia wiadomość Cienia", szp: "Ostatnia transmisja Fantoma", fan: "Ostatnie słowa Nulla" },
          f: "„To dopiero początek. Pozdrów ode mnie {pomocnikB}.” Skąd {wrog} zna naszego pomocnika?" },
    c6: { t: { det: "Zatarta sygnatura", szp: "Szyfr B0", fan: "Zapomniana runa" }, tajna: true,
          f: "Pod sygnaturą B0 widać zatarty napis: „…egzemplarz zerowy, projekt: {agencja}…”. Kto stworzył pierwszy egzemplarz?" }
  },

  /* Przedmioty awatara. wym: {stopien:n} albo {karta:"cX"}; brak wym = od początku. */
  awatar: {
    skora: ["#f2d0b1", "#d9a77c", "#a8714a", "#6e4630"],
    wlosy: ["#2b1d14", "#7a4a22", "#d9b45a", "#1c1c1c", "#b5562b"],
    sloty: {
      glowa: [
        { id: "brak", n: "Bez nakrycia" },
        { id: "czapka", n: "Czapka kadeta" },
        { id: "kapelusz", n: "Kapelusz detektywa", wym: { stopien: 1 } },
        { id: "beret", n: "Beret agenta", wym: { stopien: 1 } },
        { id: "spiczasty", n: "Kapelusz czarodzieja", wym: { stopien: 2 } },
        { id: "korona", n: "Korona legendy", wym: { stopien: 4 } }
      ],
      stroj: [
        { id: "bluza", n: "Bluza" },
        { id: "plaszcz", n: "Prochowiec", wym: { stopien: 1 } },
        { id: "garnitur", n: "Garnitur agenta", wym: { stopien: 2 } },
        { id: "szata", n: "Szata w gwiazdy", wym: { stopien: 3 } }
      ],
      dodatek: [
        { id: "brak", n: "Brak" },
        { id: "lupa", n: "Lupa", wym: { karta: "c1" } },
        { id: "sluchawka", n: "Słuchawka", wym: { karta: "c2" } },
        { id: "rozdzka", n: "Różdżka", wym: { karta: "c4" } },
        { id: "laptop", n: "Laptop śledczy", wym: { karta: "c5" } }
      ],
      tlo: [
        { id: "granat", n: "Granat" },
        { id: "miasto", n: "Miasto nocą", wym: { stopien: 1 } },
        { id: "gwiazdy", n: "Gwiezdne niebo", wym: { stopien: 3 } },
        { id: "kod", n: "Zielony kod", wym: { karta: "c6" } }
      ]
    }
  },

  progi: [0, 120, 350, 700, 1200],   // XP potrzebne do kolejnych stopni

  /* Poziomy trudności: punkty za zadanie i skala proponowanej oceny (% → ocena). */
  poziomy: {
    rekrut: { n: "Rekrut", max: 4, pkt: 10, opis: "Prostsze zadania. Najwyższa ocena: 4.",
              skala: [[75, 4], [55, 3], [40, 2], [0, 1]] },
    agent:  { n: "Agent", max: 5, pkt: 15, opis: "Zadania średnie. Najwyższa ocena: 5.",
              skala: [[90, 5], [75, 4], [55, 3], [40, 2], [0, 1]] },
    elita:  { n: "Elita", max: 6, pkt: 20, opis: "Zadania trudne i praktyczne. Najwyższa ocena: 6.",
              skala: [[90, 6], [75, 5], [60, 4], [45, 3], [30, 2], [0, 1]] }
  },
  kary: [1, 0.9, 0.75, 0.5],   // mnożnik punktów po 0, 1, 2, 3 podpowiedziach

  /* Kolejne etapy rozdziału. typ: misja | test */
  etapy: [
    {
      id: "prolog", typ: "misja", tytul: { det: "Wezwanie", szp: "Alarm w centrali", fan: "Pomieszana Kronika" },
      bezPoziomu: true, lekcje: [["k1", "Historia urządzeń komputerowych w sieci"]],
      wstep: {
        det: [
          ["n", "Noc. Deszcz bębni o szyby Agencji Cyfrowych Detektywów. Na biurku dzwoni telefon."],
          ["s", "Dobrze, że jesteś. Nazywam się Braniewski – komisarz Braniewski. Od dziś pracujesz w mojej agencji."],
          ["s", "Dziś w nocy ktoś włamał się do Cyfrowego Archiwum Miasta i pomieszał całą historię komputerów. Daty, nazwy, wynalazki – wszystko w rozsypce."],
          ["s", "Na miejscu zostawił tylko wizytówkę z jednym słowem: CIEŃ."],
          ["p", "Bip! Jestem Bajt, robot śledczy. Pomogę Ci w każdej sprawie. Uwaga: każda moja podpowiedź kosztuje część punktów za zadanie – komisarz wszystko liczy!"],
          ["s", "Na początek uporządkuj archiwum. Pokaż, co potrafisz, kadecie."]
        ],
        szp: [
          ["n", "Centrala Biura Szyfrów, 23:47. Ekrany migają na czerwono."],
          ["s", "Agencie, mówi Dowódca Braniewski. Witaj w Biurze Szyfrów. Nie ma czasu na szkolenie wstępne."],
          ["s", "Ktoś przeniknął do tajnego archiwum wywiadu i pomieszał historię techniki. Bez niej nie odczytamy starych szyfrów."],
          ["s", "W systemie został jeden podpis: FANTOM."],
          ["p", "Tu ECHO, sztuczna inteligencja w Twojej słuchawce. Mogę podpowiadać, ale każda podpowiedź obniża punkty za zadanie. Dowódca widzi wszystko."],
          ["s", "Zadanie pierwsze: odtwórz archiwum. Pokaż, ile jesteś wart."]
        ],
        fan: [
          ["n", "Wieża Akademii Kodu. Księżyc w pełni, a w bibliotece szumią zaklęte serwery."],
          ["s", "Witaj, uczniu. Jestem Arcymag Braniewski, opiekun Akademii Kodu."],
          ["s", "Tej nocy ktoś rzucił zaklęcie na Kronikę Maszyn – księgę z historią wszystkich komputerów. Karty pomieszały się jak liście na wietrze."],
          ["s", "Na okładce wypalono jedno słowo: NULL."],
          ["p", "Huu! Jestem Pixel, sowa Akademii. Podpowiem, gdy utkniesz, ale każda podpowiedź zabiera część punktów za zadanie. Arcymag liczy wszystko."],
          ["s", "Pierwsza próba: przywróć porządek w Kronice."]
        ]
      },
      koniec: {
        det: [
          ["s", "Archiwum znowu ma sens. Nieźle jak na pierwszy dzień."],
          ["p", "Komisarzu! W komputerach agencji wykryłem obcy proces. Cień jest już w naszych systemach!"],
          ["s", "Więc to nie było zwykłe włamanie. To dopiero początek. Do roboty."]
        ],
        szp: [
          ["s", "Archiwum odtworzone. Dobra robota, kursancie."],
          ["p", "Alarm! Fantom nie wyszedł z systemu. Siedzi w komputerach centrali!"],
          ["s", "Czyli to była dywersja. Prawdziwa operacja dopiero się zaczyna."]
        ],
        fan: [
          ["s", "Kronika znów mówi prawdę. Dobry początek, uczniu."],
          ["p", "Arcymagu! Czuję mroczną magię w Sercu Systemu. Null jest w naszych maszynach!"],
          ["s", "Więc to była tylko zasłona. Prawdziwa próba dopiero przed nami."]
        ]
      },
      zadania: { wszystkie: [
        { typ: "kolej", fab: "{wrog} pomieszał oś czasu. Ułóż wydarzenia od najstarszego do najnowszego.",
          q: "Ułóż wydarzenia chronologicznie.",
          el: ["Maszyna Turinga – model maszyny liczącej", "ENIAC – komputer zajmujący 167 m²", "IBM PC 5150 – pierwowzór komputerów osobistych", "Macintosh – graficzny interfejs i mysz", "Windows 1.0 trafia do sprzedaży", "Nokia 7110 – telefon z przeglądarką"],
          h: ["Najstarsze jest coś, co było tylko pomysłem na papierze – jeszcze przed prawdziwymi komputerami.", "ENIAC powstał w 1945 r., IBM PC w 1981 r.", "Macintosh: 1984, Windows 1.0: 1985, Nokia 7110: 1999."],
          why: "1936 Turing, 1945 ENIAC, 1981 IBM PC, 1984 Macintosh, 1985 Windows 1.0, 1999 Nokia 7110." },
        { typ: "wybor", fab: "Na wizytówce {wrog} zostawił słowa „flag day”. Co się wtedy wydarzyło?",
          q: "Jaki protokół zaczęły stosować wszystkie komputery ARPANET w tzw. flag day (1983)?",
          o: ["TCP/IP", "WAP", "MS-DOS", "NTFS"], a: 0,
          h: ["Ten dzień uznaje się za początek Internetu.", "Szukaj nazwy protokołu sieciowego, a nie systemu czy telefonu.", "To protokół, którego Internet używa do dziś: T…/I…"],
          why: "Przejście ARPANET na TCP/IP w 1983 r. uznaje się za początek Internetu." },
        { typ: "para", fab: "Archiwum odzyskane w połowie. Dopasuj wynalazek do tego, czym się wyróżniał.",
          q: "Połącz urządzenie z jego cechą.",
          l: ["IBM PC 5150", "Macintosh (1984)", "Nokia 7110", "D-Wave 2000Q"],
          r: ["System PC-DOS, polecenia tekstowe", "Graficzny interfejs i mysz", "Przeglądarka internetowa w telefonie", "Komputer kwantowy w chmurze"],
          h: ["Nokia to producent telefonów.", "D-Wave to firma od komputerów kwantowych.", "Macintosh jako pierwszy miał mysz i okienka, IBM PC – polecenia tekstowe."],
          why: "IBM PC – PC-DOS; Macintosh – GUI i mysz; Nokia 7110 – WAP; D-Wave 2000Q – obliczenia kwantowe w chmurze." }
      ] },
      zagadka: null
    },

    {
      id: "m1", typ: "misja", tytul: { det: "Włamanie do systemu", szp: "Infiltracja centrali", fan: "Klątwa w Sercu Systemu" },
      lekcje: [["k2", "1.1 System komputerowy i system operacyjny"], ["k3", "1.1b Zadania systemu operacyjnego"], ["k4", "1.2 Bezpieczeństwo pracy w systemie"], ["k5", "1.3 Rozwiązywanie problemów z komputerem"]],
      karta: "c1",
      wstep: {
        det: [
          ["n", "W poprzednim odcinku: Cień pomieszał Cyfrowe Archiwum Miasta, a potem wdarł się do komputerów agencji."],
          ["p", "Obcy proces zjada pamięć i czas procesora. Ktoś uruchomił go z konta administratora!"],
          ["s", "Żeby złapać włamywacza, musisz znać system od środka: warstwy, jądro, konta, kopie zapasowe."],
          ["s", "Przejrzyj akta, wybierz poziom i zabezpiecz system."]
        ],
        szp: [
          ["n", "Poprzednio: Fantom zatarł archiwum wywiadu i ukrył się w komputerach centrali."],
          ["p", "Wykrywam obcy proces z uprawnieniami administratora. Pożera pamięć operacyjną."],
          ["s", "Agent musi znać teren. Twój teren to system operacyjny: jądro, konta, kopie, narzędzia naprawcze."],
          ["s", "Zapoznaj się z teczką i wybierz poziom operacji."]
        ],
        fan: [
          ["n", "Wcześniej w Kronice: Null pomieszał Kronikę Maszyn i wniknął w maszyny Akademii."],
          ["p", "Mroczne zaklęcie działa z najwyższymi uprawnieniami. Pochłania pamięć i czas procesora!"],
          ["s", "Kto chce złamać klątwę, musi znać budowę systemu: warstwy, jądro, konta, kopie zapasowe."],
          ["s", "Przestudiuj zwoje i wybierz poziom próby."]
        ]
      },
      koniec: {
        det: [
          ["p", "Proces zatrzymany! Ale zanim zniknął, skopiował coś przez sieć."],
          ["s", "Zostawił ślad w logach systemu. Spójrz na podpis na końcu wpisu…"],
          ["n", "W logu widnieje dziwna sygnatura: B0."],
          ["s", "Cień uciekł do sieci. Idziemy za nim."]
        ],
        szp: [
          ["p", "Proces unieszkodliwiony. Ale zdążył wysłać pakiet danych na zewnątrz."],
          ["n", "W logu systemu zostaje podpis: B0."],
          ["s", "Fantom ucieka siecią. Ruszamy w pościg."]
        ],
        fan: [
          ["p", "Klątwa zdjęta! Ale coś uciekło Pajęczymi Ścieżkami sieci."],
          ["n", "W zapisach systemu jarzy się runa: B0."],
          ["s", "Null ucieka siecią. Ruszamy jego tropem."]
        ]
      },
      zadania: {
        rekrut: [
          { typ: "wybor", fab: "{pomocnik} rysuje schemat systemu, żeby wiedzieć, gdzie ukrył się {wrog}.",
            q: "Z ilu warstw składa się system komputerowy?", o: ["Z czterech", "Z dwóch", "Z trzech", "Z pięciu"], a: 0,
            h: ["Najniżej jest sprzęt, najwyżej – człowiek.", "Pomiędzy nimi są dwie warstwy oprogramowania.", "Sprzęt, system operacyjny, oprogramowanie użytkowe, użytkownicy."],
            why: "Sprzęt, system operacyjny, oprogramowanie użytkowe i użytkownicy – cztery warstwy." },
          { typ: "para", fab: "{wrog} zablokował komputer. Dobierz narzędzie do problemu.",
            q: "Połącz narzędzie z tym, do czego służy.",
            l: ["Ctrl + Shift + Esc", "Tryb awaryjny", "Punkt przywracania", "Oczyszczanie dysku"],
            r: ["Otwiera Menedżera zadań", "Uruchamia system z minimum sterowników, do naprawy", "Cofa system do stanu z wcześniejszego momentu", "Usuwa pliki tymczasowe i zawartość Kosza"],
            h: ["Skrót klawiszowy otwiera okno z listą uruchomionych programów.", "„Przywracanie” = powrót do przeszłości.", "Oczyszczanie dysku zwalnia miejsce."],
            why: "Ctrl+Shift+Esc – Menedżer zadań; tryb awaryjny – naprawa; punkt przywracania – powrót do stanu systemu; Oczyszczanie dysku – zwalnianie miejsca." },
          { typ: "wybor", fab: "{wrog} wszedł przez konto, na którym ktoś pracował na co dzień.",
            q: "Z jakiego konta należy korzystać na co dzień?", o: ["Ze standardowego konta użytkownika", "Z konta administratora", "Z konta gościa bez hasła", "Z cudzego konta"], a: 0,
            h: ["Im mniej uprawnień ma konto, tym mniej szkody wyrządzi włamywacz.", "Konto administratora jest do prac administracyjnych.", "Odpowiedź zawiera słowo „standardowe”."],
            why: "Na co dzień pracujemy na koncie standardowym, a administratora używamy tylko do zmian w systemie." },
          { typ: "wybor", fab: "{szef} chce mieć pewność, że dane przetrwają kolejny atak.",
            q: "Gdzie najlepiej przechowywać kopię bezpieczeństwa?", o: ["Na odrębnym nośniku, np. dysku zewnętrznym", "Na tym samym dysku", "Na pulpicie", "W koszu"], a: 0,
            h: ["Co się stanie z kopią, jeśli zepsuje się dysk?", "Kopia musi być poza komputerem.", "Szukaj odpowiedzi z „odrębnym nośnikiem”."],
            why: "Przy awarii dysku kopia zapisana na tym samym nośniku też by przepadła." },
          { typ: "wybor", fab: "{wrog} wykorzystał lukę w starej wersji programu.",
            q: "Dlaczego aktualizujemy oprogramowanie?", o: ["Aby usuwać błędy i luki bezpieczeństwa", "Aby zajmowało więcej miejsca", "Aby zmienić tapetę", "Aby wyłączyć Internet"], a: 0,
            h: ["Pomyśl, czym się włamał {wrog}.", "Luki wykorzystują cyberprzestępcy.", "Aktualizacja łata dziury."],
            why: "Aktualizacje usuwają błędy i luki, które mogą wykorzystać cyberprzestępcy." }
        ],
        agent: [
          { typ: "kolej", fab: "{pomocnik} odtwarza plan systemu. Ułóż warstwy od dołu do góry.",
            q: "Ułóż warstwy systemu komputerowego, zaczynając od najniższej.",
            el: ["Sprzęt", "System operacyjny", "Oprogramowanie użytkowe", "Użytkownicy"],
            h: ["Najniżej jest to, czego można dotknąć.", "System operacyjny pośredniczy między sprzętem a programami.", "Na samej górze jest człowiek."],
            why: "Sprzęt → system operacyjny → oprogramowanie użytkowe → użytkownicy." },
          { typ: "wybor", fab: "Proces, który uruchomił {wrog}, działa w trybie dającym pełną władzę nad sprzętem.",
            q: "Który tryb pracy daje systemowi pełny dostęp do całego sprzętu?", o: ["Tryb jądra", "Tryb użytkownika", "Tryb awaryjny", "Tryb uśpienia"], a: 0,
            h: ["Programy użytkownika mają ograniczony dostęp.", "To tryb, w którym działa „serce” systemu.", "Jądro = kernel."],
            why: "W trybie jądra system może wykonać dowolną instrukcję i ma dostęp do całego sprzętu." },
          { typ: "para", fab: "Rozpisz części systemu, żeby wiedzieć, którą zaatakował {wrog}.",
            q: "Połącz część systemu operacyjnego z jej rolą.",
            l: ["Jądro", "Powłoka", "System plików", "Sterownik"],
            r: ["Zarządza procesami, pamięcią i sprzętem", "Pośredniczy między użytkownikiem a systemem (np. PowerShell)", "Określa, jak przechowywane są pliki", "Obsługuje konkretne urządzenie"],
            h: ["PowerShell i Eksplorator plików to przykłady powłoki.", "Sterownik to „tłumacz” dla jednego urządzenia, np. drukarki.", "Jądro jest najważniejsze – zarządza zasobami."],
            why: "Jądro – zasoby; powłoka – kontakt z użytkownikiem; system plików – przechowywanie plików; sterownik – obsługa urządzenia." },
          { typ: "blad", fab: "Podejrzany pracownik złożył zeznania. Jedno zdanie jest fałszywe – wskaż je.",
            q: "Kliknij zdanie, które jest NIEPRAWDZIWE.",
            el: ["Kopię bezpieczeństwa trzymam na osobnym dysku.", "Na co dzień najbezpieczniej pracować na koncie administratora.", "Szyfrowanie zamienia dane na niejawne, odczytywalne po podaniu klucza.", "Aktualizacje usuwają luki bezpieczeństwa."], a: 1,
            h: ["Trzy zdania to dobre praktyki z lekcji 1.2.", "Zastanów się, które konto daje najwięcej władzy włamywaczowi.", "Fałszywe zdanie dotyczy kont użytkowników."],
            why: "Na co dzień korzystamy ze standardowego konta – konto administratora daje włamywaczowi pełną kontrolę." },
          { typ: "wpisz", fab: "{pomocnik} pyta o nazwę tego, co zjada zasoby komputera.",
            q: "Jak nazywa się egzemplarz wykonywanego programu, któremu system przydziela pamięć i czas procesora? (jedno słowo)",
            ok: ["proces"], ph: "jedno słowo",
            h: ["Widać je w Menedżerze zadań.", "Słowo zaczyna się na „p”.", "P _ _ _ _ _ s"],
            why: "Proces to wykonywany program, któremu system przydziela zasoby." }
        ],
        elita: [
          { typ: "wiele", fab: "{szef} chce wiedzieć, za co odpowiada system, który przejął {wrog}.",
            q: "Zaznacz WSZYSTKIE zadania systemu operacyjnego.",
            o: ["Zarządzanie procesami", "Zarządzanie pamięcią operacyjną", "Obsługa systemu plików", "Kontrola dostępu i uprawnień", "Retusz zdjęć", "Projektowanie stron WWW"], a: [0, 1, 2, 3],
            h: ["Dwie odpowiedzi to zadania programów użytkowych.", "System zarządza zasobami i bezpieczeństwem.", "Odrzuć zadania, które wykonuje konkretna aplikacja, np. edytor grafiki."],
            why: "System zarządza procesami, pamięcią, plikami i dostępem. Retusz zdjęć czy projektowanie stron to zadania programów użytkowych." },
          { typ: "kolej", fab: "Program zawiesił się w trakcie śledztwa. Ułóż rozsądną kolejność działań.",
            q: "Ułóż kroki postępowania z zawieszoną aplikacją.",
            el: ["Odczekaj chwilę – może aplikacja zacznie odpowiadać", "Otwórz Menedżera zadań (Ctrl + Shift + Esc)", "Zaznacz proces aplikacji i wybierz „Zakończ zadanie”", "Uruchom aplikację ponownie"],
            h: ["Najpierw nic nie psuj – daj programowi szansę.", "Żeby zakończyć proces, trzeba najpierw otworzyć okno, w którym go widać.", "Ponowne uruchomienie jest na końcu."],
            why: "Czekamy → Menedżer zadań → Zakończ zadanie → ponowne uruchomienie." },
          { typ: "wpisz", fab: "{wrog} zaszyfrował nazwę celu ataku szyfrem Cezara: każdą literę przesunął o 3 dalej w alfabecie (A→D, B→E…).",
            q: "Odszyfruj słowo: MDGUR",
            ok: ["jadro", "jądro"], ph: "odszyfrowane słowo",
            h: ["Każdą literę cofnij o 3 miejsca: D→A, E→B…", "M→J, D→A.", "Wychodzi część systemu operacyjnego, która ma pełny dostęp do sprzętu."],
            why: "MDGUR → JADRO. Celem ataku było jądro systemu." },
          { typ: "klucz", fab: "Sprawdź na komputerze, z jaką rodziną systemów walczy {wrog}.",
            q: "Zadanie praktyczne. Na komputerze z Windows otwórz Wiersz polecenia (Win + R, wpisz cmd, Enter) i wpisz: echo %OS%. Przepisz wynik.",
            ok: ["windows_nt", "windows nt"], ph: "wynik polecenia",
            h: ["Polecenie echo wypisuje wartość zmiennej systemowej OS.", "Wynik to dwa człony połączone podkreślnikiem.", "Na telefonie: rodzina Windows z jądrem NT, zapisana z podkreślnikiem."],
            why: "Zmienna %OS% w Windows ma wartość Windows_NT – wszystkie współczesne Windowsy korzystają z jądra NT." },
          { typ: "wybor", fab: "Po aktualizacji sterownika grafiki nasz komputer nie uruchamia się normalnie.",
            q: "Co zrobisz najpierw?",
            o: ["Uruchomię tryb awaryjny i wycofam lub odinstaluję sterownik", "Przywrócę ustawienia fabryczne bez kopii danych", "Sformatuję dysk", "Wymienię procesor"], a: 0,
            h: ["Zacznij od najmniej ryzykownego rozwiązania.", "Tryb awaryjny ładuje tylko niezbędne sterowniki.", "Ustawienia fabryczne mogą usunąć dane."],
            why: "Tryb awaryjny pozwala odinstalować wadliwy sterownik bez utraty danych." }
        ]
      },
      zagadka: { typ: "wpisz", fab: "Zagadka dodatkowa: w logu {wrog} zostawił numer pokoju serwerowni zapisany dwójkowo: 1000.",
                 q: "Jaki to numer w systemie dziesiętnym?", ok: ["8"], ph: "liczba",
                 h: ["W systemie dwójkowym kolejne cyfry od prawej znaczą 1, 2, 4, 8…"], why: "1000₂ = 8." }
    },

    {
      id: "m2", typ: "misja", tytul: { det: "Pułapka w sieci", szp: "Podsłuch w sieci", fan: "Pajęcze Ścieżki" },
      lekcje: [["k7", "2.1 Sieć komputerowa i urządzenia sieciowe"], ["k8", "2.2 Rodzaje sieci komputerowych"], ["k9", "2.3 Sieć lokalna LAN i adres MAC"]],
      karta: "c2",
      wstep: {
        det: [
          ["n", "W poprzednim odcinku: system agencji uratowany, ale Cień uciekł przez sieć, zostawiając sygnaturę B0."],
          ["p", "W sieci pojawiło się urządzenie, którego nie ma w żadnym spisie. Każda karta sieciowa ma adres MAC – to jak odcisk palca."],
          ["s", "Poznaj urządzenia sieciowe i rodzaje sieci. Potem znajdź intruza po jego adresie."]
        ],
        szp: [
          ["n", "Poprzednio: atak na centralę odparty, ale Fantom uciekł przez sieć, podpisując się B0."],
          ["p", "W sieci lokalnej nadaje nieznane urządzenie. Jego adres MAC to nasz jedyny trop."],
          ["s", "Rozpoznaj sprzęt sieciowy i rodzaje sieci. Potem namierz nadajnik."]
        ],
        fan: [
          ["n", "Wcześniej w Kronice: klątwa zdjęta, ale Null uciekł siecią, zostawiając runę B0."],
          ["p", "W sieci Akademii świeci obce urządzenie. Jego adres MAC jest jak magiczny odcisk – niepowtarzalny."],
          ["s", "Poznaj urządzenia i rodzaje sieci, a potem odnajdź intruza."]
        ]
      },
      koniec: {
        det: [
          ["p", "Mam go! Adres MAC intruza zgadza się z kartą sieciową starego punktu dostępowego w piwnicy."],
          ["s", "Punkt dostępowy był pusty. Cień połączył się stamtąd z Internetem."],
          ["n", "W pamięci urządzenia zostaje fragment trasy."],
          ["s", "Zanim ruszymy dalej, musimy przesłuchać świadka."]
        ],
        szp: [
          ["p", "Namierzony! To podrzucony punkt dostępowy w szybie wentylacyjnym."],
          ["s", "Pusty. Fantom przekierował ruch do Internetu."],
          ["n", "W pamięci nadajnika zostaje fragment trasy."],
          ["s", "Przed dalszą akcją: test lojalności."]
        ],
        fan: [
          ["p", "Znalazłam! Zaklęty punkt dostępowy w starej wieży."],
          ["s", "Pusty. Null przeniósł się dalej, do Internetu."],
          ["n", "W krysztale urządzenia zostaje odbicie trasy."],
          ["s", "Zanim pójdziemy dalej, czeka Cię Próba Rady Magów."]
        ]
      },
      zadania: {
        rekrut: [
          { typ: "wybor", fab: "{wrog} przeskoczył z jednej sieci do drugiej.",
            q: "Które urządzenie łączy różne sieci komputerowe?", o: ["Router", "Przełącznik", "Drukarka", "Monitor"], a: 0,
            h: ["Przełącznik łączy urządzenia w JEDNEJ sieci lokalnej.", "To urządzenie wyznacza trasę (ang. route).", "R…"],
            why: "Router łączy sieci, a przełącznik – urządzenia w jednej sieci lokalnej." },
          { typ: "para", fab: "{pomocnik} skanuje sprzęt w budynku. Dopasuj urządzenie do jego zadania.",
            q: "Połącz urządzenie sieciowe z jego rolą.",
            l: ["Router", "Przełącznik", "Punkt dostępowy", "Modem"],
            r: ["Łączy różne sieci", "Łączy urządzenia w sieci lokalnej", "Tworzy sieć wi-fi", "Zamienia sygnał cyfrowy na analogowy i odwrotnie"],
            h: ["Modem = MOdulator-DEModulator.", "Wi-fi wymaga punktu dostępowego.", "Router łączy sieci."],
            why: "Router – sieci; przełącznik – LAN; punkt dostępowy – wi-fi; modem – zamiana sygnałów." },
          { typ: "wybor", fab: "{wrog} działa w sieci obejmującej cały kraj.",
            q: "Która sieć obejmuje zasięgiem np. kraj lub kontynent?", o: ["WAN", "LAN", "PAN", "WLAN"], a: 0,
            h: ["L = Local, czyli lokalna – za mała.", "W = Wide, czyli rozległa.", "Wide Area Network."],
            why: "WAN to sieć rozległa." },
          { typ: "wybor", fab: "Szukamy urządzenia intruza w sieci lokalnej.",
            q: "Co jednoznacznie rozpoznaje urządzenie w sieci lokalnej?", o: ["Adres MAC", "Kolor kabla", "Nazwa producenta monitora", "Moc procesora"], a: 0,
            h: ["To „odcisk palca” karty sieciowej.", "Nadaje go producent karty sieciowej.", "M…"],
            why: "Adres MAC jest przypisany karcie sieciowej przez producenta." },
          { typ: "wybor", fab: "Intruz łączył się bez kabla, w obrębie budynku.",
            q: "Jak nazywa się lokalna sieć działająca bezprzewodowo?", o: ["WLAN", "MAN", "PAN", "WAN"], a: 0,
            h: ["Lokalna = LAN.", "Bezprzewodowa = Wireless.", "W + LAN."],
            why: "WLAN – Wireless Local Area Network." }
        ],
        agent: [
          { typ: "para", fab: "{szef} chce mapę zasięgu sieci, w których mógł działać {wrog}.",
            q: "Połącz rodzaj sieci z jej zasięgiem.",
            l: ["PAN", "LAN", "MAN", "WAN"],
            r: ["Kilka metrów wokół człowieka (np. Bluetooth)", "Budynek, np. szkoła", "Miasto", "Kraj lub kontynent"],
            h: ["P = Personal, osobista.", "M = Metropolitan, miejska.", "Od najmniejszej: PAN, LAN, MAN, WAN."],
            why: "PAN – osobista, LAN – lokalna, MAN – miejska, WAN – rozległa." },
          { typ: "wybor", fab: "{agencja} buduje sieć, której {wrog} nie przerwie, przecinając jeden kabel.",
            q: "Która topologia jest najbardziej odporna na awarie połączeń?", o: ["Siatki", "Magistrali", "Pierścienia", "Gwiazdy"], a: 0,
            h: ["Potrzebne są zapasowe drogi.", "Każde urządzenie połączone z kilkoma innymi.", "Wygląda jak sieć rybacka."],
            why: "W topologii siatki przy awarii jednego połączenia dane pójdą inną drogą." },
          { typ: "blad", fab: "{pomocnik} ma listę adresów MAC z sieci. Jeden jest podrobiony – nie może istnieć.",
            q: "Kliknij adres MAC, który jest niepoprawny.",
            el: ["00:1A:2B:3C:4D:5E", "A4-5E-60-C2-11-F0", "3C:22:FB:9G:01:7A", "F8:B1:56:0D:AA:19"], a: 2,
            h: ["Adres MAC zapisuje się w systemie szesnastkowym.", "Dozwolone znaki to 0–9 i A–F.", "Szukaj litery spoza zakresu A–F."],
            why: "Litera G nie jest cyfrą szesnastkową (dozwolone 0–9 i A–F)." },
          { typ: "wpisz", fab: "Musisz sprawdzić adres MAC naszego komputera.",
            q: "Jakie polecenie w Wierszu polecenia Windows pokaże adres fizyczny (MAC) karty sieciowej razem z pełną konfiguracją?",
            ok: ["ipconfig /all", "ipconfig/all", "ipconfig -all"], ph: "polecenie",
            h: ["Polecenie pokazuje konfigurację IP.", "ipconfig… z dodatkowym przełącznikiem.", "Przełącznik oznacza „wszystko”."],
            why: "ipconfig /all – szukaj pozycji „Adres fizyczny”." },
          { typ: "wybor", fab: "{pomocnik} przechwytuje porcję danych w sieci lokalnej.",
            q: "Jak nazywa się porcja informacji przesyłana w sieci lokalnej?", o: ["Ramka", "Ścieżka", "Kafelek", "Sektor"], a: 0,
            h: ["Zawiera adresy MAC nadawcy i odbiorcy.", "Kojarzy się z obrazem.", "R…"],
            why: "Ramka zawiera dane, adresy MAC nadawcy i odbiorcy oraz dane kontrolne." }
        ],
        elita: [
          { typ: "wiele", fab: "{wrog} mógł przesyłać dane różnymi drogami. Wskaż wszystkie możliwe.",
            q: "Zaznacz WSZYSTKIE media transmisyjne.",
            o: ["Skrętka", "Światłowód", "Fale radiowe", "Router", "Karta graficzna"], a: [0, 1, 2],
            h: ["Medium to „droga”, a nie urządzenie.", "Są media przewodowe i bezprzewodowe.", "Odrzuć urządzenia."],
            why: "Media: przewody (skrętka, światłowód) i fale radiowe. Router to urządzenie." },
          { typ: "wpisz", fab: "{szef} pyta o długość adresu, po którym namierzamy intruza.",
            q: "Ile bitów ma adres MAC?", ok: ["48"], ph: "liczba",
            h: ["Adres ma 12 cyfr szesnastkowych.", "Jedna cyfra szesnastkowa to 4 bity.", "12 × 4 = ?"],
            why: "Adres MAC to liczba 48-bitowa (12 cyfr szesnastkowych po 4 bity)." },
          { typ: "kolej", fab: "Odtwórz drogę, którą dane z laptopa intruza poszły do Internetu.",
            q: "Ułóż drogę danych z laptopa w sieci wi-fi do Internetu.",
            el: ["Karta sieciowa laptopa", "Punkt dostępowy wi-fi", "Router", "Sieć dostawcy Internetu (ISP)"],
            h: ["Zaczynamy w laptopie.", "Laptop bez kabla łączy się najpierw z urządzeniem od wi-fi.", "Router łączy sieć lokalną z siecią dostawcy."],
            why: "Karta sieciowa → punkt dostępowy → router → sieć dostawcy." },
          { typ: "klucz", fab: "Sprawdź na komputerze w pracowni, jak wygląda prawdziwy „odcisk” karty sieciowej.",
            q: "Zadanie praktyczne. W Wierszu polecenia wpisz: ipconfig /all i znajdź „Adres fizyczny”. Z ilu par znaków składa się adres?",
            ok: ["6", "sześć", "szesc"], ph: "liczba",
            h: ["Pary oddzielone są myślnikami.", "Policz grupy, np. A4-5E-…", "48 bitów / 8 bitów na parę."],
            why: "Adres MAC ma 6 par cyfr szesnastkowych (6 bajtów)." },
          { typ: "wybor", fab: "Agencja projektuje sieć w szkole, w której ukrywał się intruz.",
            q: "Jaką topologię najczęściej stosuje się w sieciach LAN, np. szkolnych?", o: ["Gwiazdy (rozszerzonej)", "Magistrali", "Pierścienia", "Pojedynczego kabla"], a: 0,
            h: ["Urządzenia łączą się z punktem centralnym.", "Punktem centralnym jest przełącznik.", "W większych sieciach jest kilka połączonych „gwiazd”."],
            why: "W sieciach LAN najczęściej stosuje się topologię gwiazdy, w szkołach – gwiazdy rozszerzonej." }
        ]
      },
      zagadka: { typ: "wpisz", fab: "Zagadka dodatkowa: ostatnia para adresu MAC intruza to FF.",
                 q: "Ile to w systemie dziesiętnym? (możesz użyć Kalkulatora w trybie Programista)", ok: ["255"], ph: "liczba",
                 h: ["F to 15. FF = 15 × 16 + 15."], why: "FF₁₆ = 255." }
    },

    {
      id: "kart", typ: "test", test: "k11k", karta: "c3",
      tytul: { det: "Przesłuchanie świadka", szp: "Test lojalności", fan: "Próba Rady Magów" },
      wstep: {
        det: [
          ["n", "Przesłuchanie świadka. Do tej sceny potrzebujesz hasła od komisarza, czyli nauczyciela."],
          ["s", "Świadek odpowie tylko na dobrze zadane pytania. Pokaż, że znasz sprawę – to Twoja kartkówka."]
        ],
        szp: [
          ["n", "Test lojalności. Potrzebujesz hasła od Dowódcy, czyli nauczyciela."],
          ["s", "W naszej branży wiedza to broń. Udowodnij, że ją masz – to Twoja kartkówka."]
        ],
        fan: [
          ["n", "Próba Rady Magów. Potrzebujesz hasła od Arcymaga, czyli nauczyciela."],
          ["s", "Rada sprawdzi Twoją wiedzę. To Twoja kartkówka."]
        ]
      },
      koniec: {
        det: [["s", "Zeznania się zgadzają. Świadek widział, jak Cień wynajmował serwer w Internecie."]],
        szp: [["s", "Test zaliczony. Nasz informator potwierdza: Fantom działa z serwera w Internecie."]],
        fan: [["s", "Rada jest zadowolona. A wyrocznia widziała Nulla w Wieży Adresów, gdzieś w Internecie."]]
      }
    },

    {
      id: "m3", typ: "misja", tytul: { det: "Trop w Internecie", szp: "Pościg przez Internet", fan: "Wieża Adresów" },
      lekcje: [["k10", "2.4 Internet, czyli sieć sieci"], ["k11", "2.4b Komunikacja w sieci (infografika)"], ["k12", "2.4c Adres opisowy, DNS i konfiguracja"], ["k13", "2.5 Usługi internetowe"], ["k14", "2.6 Diagnostyka dostępu do sieci"]],
      karta: "c4",
      wstep: {
        det: [
          ["n", "W poprzednim odcinku: świadek potwierdził, że Cień ukrywa się na serwerze gdzieś w Internecie."],
          ["p", "Mamy jego adres opisowy, ale potrzebujemy adresu IP. DNS, porty, ping, tracert – wszystkie narzędzia na stół!"],
          ["s", "Internet to sieć sieci. Znajdź drogę do kryjówki Cienia."]
        ],
        szp: [
          ["n", "Poprzednio: informator potwierdził, że Fantom działa z serwera w Internecie."],
          ["p", "Znamy nazwę domeny. Przez DNS ustalimy adres IP, a ping i tracert pokażą drogę."],
          ["s", "Namierz serwer Fantoma, agencie."]
        ],
        fan: [
          ["n", "Wcześniej w Kronice: wyrocznia widziała Nulla w Wieży Adresów, w Internecie."],
          ["p", "Znamy prawdziwe imię wieży – jej adres opisowy. DNS zdradzi jej liczbowy adres IP, a ping i tracert wskażą drogę."],
          ["s", "Odnajdź Wieżę Adresów, uczniu."]
        ]
      },
      koniec: {
        det: [
          ["p", "Tracert doprowadził nas do serwera. Port 443 otwarty – Cień tam jest."],
          ["s", "To będzie konfrontacja. Przygotuj się dobrze, kadecie. Jutro wchodzimy."]
        ],
        szp: [
          ["p", "Mam współrzędne serwera. Port 443 aktywny."],
          ["s", "Przygotuj się do starcia. Wchodzimy o świcie."]
        ],
        fan: [
          ["p", "Droga wytyczona! Brama 443 stoi otworem."],
          ["s", "Przygotuj się do pojedynku. Null nie odda wieży bez walki."]
        ]
      },
      zadania: {
        rekrut: [
          { typ: "wybor", fab: "{pomocnik} wyświetla adres serwera, na którym ukrył się {wrog}.",
            q: "Jak wygląda adres IPv4?", o: ["Cztery liczby 0–255 oddzielone kropkami", "Sześć par znaków szesnastkowych", "Nazwa z domeną", "Pięć liter"], a: 0,
            h: ["Sześć par szesnastkowych to adres MAC.", "Przykład: 178.33.170.138.", "Liczby oddzielone kropkami."],
            why: "Adres IPv4 to cztery liczby 0–255, np. 178.33.170.138." },
          { typ: "wybor", fab: "{wrog} ukrywa się pod nazwą strony, ale komputer potrzebuje liczb.",
            q: "Do czego służy system DNS?", o: ["Do zamiany adresów opisowych na adresy IP", "Do szyfrowania haseł", "Do zasilania routera", "Do drukowania"], a: 0,
            h: ["To „książka telefoniczna” Internetu.", "Zamienia nazwę na numer.", "Adres opisowy → adres IP."],
            why: "DNS zamienia adresy opisowe (np. agencja.pl) na adresy IP." },
          { typ: "wybor", fab: "Adres strony, na której ukrywa się {wrog}, kończy się na .pl.",
            q: "Która domena jest krajowa?", o: [".pl", ".gov", ".edu", ".org"], a: 0,
            h: ["Domena krajowa wskazuje państwo.", ".edu to edukacja, .org – organizacje.", "Polska."],
            why: ".pl to domena krajowa Polski; .gov, .edu, .org to domeny funkcjonalne." },
          { typ: "wybor", fab: "Serwer, na którym ukrywa się {wrog}, ma kłódkę przy adresie.",
            q: "Na jakim porcie domyślnie działa HTTPS?", o: ["443", "80", "25", "53"], a: 0,
            h: ["Port 80 to zwykłe HTTP.", "53 to DNS, 25 to poczta.", "Został jeden port."],
            why: "HTTP – 80, HTTPS – 443, DNS – 53, SMTP – 25." },
          { typ: "wybor", fab: "{pomocnik} wysyła ping do naszego routera i dostaje odpowiedź.",
            q: "Co potwierdza udane polecenie ping do routera?", o: ["Że komunikacja z bramą działa prawidłowo", "Że router się zepsuł", "Że Internet jest wolny", "Że brak zasilania"], a: 0,
            h: ["Router odesłał pakiety.", "Odpowiedź = połączenie działa.", "Router to brama do Internetu."],
            why: "Skoro router odpowiedział, komunikacja z bramą działa." }
        ],
        agent: [
          { typ: "wiele", fab: "{wrog} używa kilku adresów. Które z nich są prywatne i nie wyjdą wprost do Internetu?",
            q: "Zaznacz WSZYSTKIE prywatne adresy IP.",
            o: ["192.168.1.10", "10.0.0.5", "172.16.4.2", "8.8.8.8", "210.20.6.48"], a: [0, 1, 2],
            h: ["Prywatne zakresy to 10.x.x.x, 172.16–172.31.x.x i 192.168.x.x.", "8.8.8.8 to publiczny serwer DNS.", "Są trzy prywatne."],
            why: "Prywatne: 10.0.0.0/8, 172.16.0.0–172.31.255.255, 192.168.0.0/16." },
          { typ: "para", fab: "{pomocnik} skanuje porty serwera. Dopasuj port do usługi.",
            q: "Połącz numer portu z usługą.",
            l: ["80", "443", "53", "25"],
            r: ["HTTP – strony WWW", "HTTPS – bezpieczne strony WWW", "DNS – zamiana nazw na adresy IP", "SMTP – wysyłanie poczty"],
            h: ["443 to bezpieczna wersja portu 80.", "DNS ma port 53.", "Poczta – 25."],
            why: "80 HTTP, 443 HTTPS, 53 DNS, 25 SMTP." },
          { typ: "kolej", fab: "Rozbierz adres kryjówki na części: https://www.agencja.pl/akta/plik.html#trop",
            q: "Ułóż części adresu URL w kolejności, w jakiej występują.",
            el: ["Schemat (https://)", "Podmiot – nazwa hosta (www.agencja.pl)", "Ścieżka (/akta/plik.html)", "Fragment (#trop)"],
            h: ["Adres zaczyna się od protokołu.", "Po nazwie hosta jest ukośnik i katalogi.", "Fragment z # jest na końcu."],
            why: "Schemat → podmiot (host) → ścieżka → fragment." },
          { typ: "blad", fab: "{wrog} podmienił konfigurację karty sieciowej. Jedno ustawienie jest niemożliwe.",
            q: "Kliknij błędne ustawienie.",
            el: ["Adres IP: 192.168.1.256", "Maska podsieci: 255.255.255.0", "Brama domyślna: 192.168.1.1", "Serwer DNS: 8.8.8.8"], a: 0,
            h: ["Każda liczba w adresie IPv4 mieści się w zakresie 0–255.", "Sprawdź każdą liczbę po kolei.", "Szukaj liczby większej niż 255."],
            why: "256 przekracza zakres 0–255, więc 192.168.1.256 nie jest poprawnym adresem." },
          { typ: "wpisz", fab: "Trzeba zobaczyć, przez które routery idą pakiety do kryjówki.",
            q: "Jakie polecenie Windows pokazuje trasę pakietów przez kolejne routery?",
            ok: ["tracert", "traceroute"], ph: "polecenie",
            h: ["To nie jest ping.", "Nazwa pochodzi od „trace route”.", "t r a c e r t"],
            why: "tracert wyświetla kolejne routery na trasie do hosta." }
        ],
        elita: [
          { typ: "wpisz", fab: "{szef} pyta o rozmiar adresu, który ukrywa {wrog}.",
            q: "Ile bitów ma adres IPv4?", ok: ["32"], ph: "liczba",
            h: ["Adres IPv4 to cztery liczby.", "Każda liczba mieści się w zakresie 0–255, czyli 8 bitów.", "4 × 8 = ?"],
            why: "IPv4 = 4 oktety × 8 bitów = 32 bity." },
          { typ: "kolej", fab: "Wpisujesz adres kryjówki w przeglądarkę. Ułóż, co dzieje się dalej.",
            q: "Ułóż kroki otwierania strony po wpisaniu adresu opisowego.",
            el: ["Wpisujesz adres opisowy w przeglądarce", "Komputer pyta serwer DNS o adres IP", "Serwer DNS odsyła adres IP", "Przeglądarka łączy się z serwerem WWW pod tym adresem"],
            h: ["Komputer nie zna adresu IP od razu.", "Najpierw pytanie, potem odpowiedź.", "Połączenie z serwerem WWW jest na końcu."],
            why: "Adres opisowy → zapytanie DNS → odpowiedź z IP → połączenie z serwerem WWW." },
          { typ: "wybor", fab: "Wspólnicy, z którymi działa {wrog}, wymieniają pliki bezpośrednio między swoimi komputerami, bez centralnego serwera.",
            q: "Jaki to model komunikacji?", o: ["Peer-to-peer (P2P)", "Klient–serwer", "Topologia magistrali", "DHCP"], a: 0,
            h: ["Nie ma centralnego serwera.", "Każdy komputer jest jednocześnie klientem i serwerem.", "Równy z równym."],
            why: "W P2P komputery wymieniają dane bezpośrednio i bywają jednocześnie klientem i serwerem." },
          { typ: "klucz", fab: "Sprawdź połączenie na komputerze w pracowni.",
            q: "Zadanie praktyczne. W Wierszu polecenia wpisz: ping 127.0.0.1. Ile pakietów wysłano?",
            ok: ["4", "cztery"], ph: "liczba",
            h: ["Szukaj podsumowania „Pakiety: Wysłane = …”.", "127.0.0.1 to Twój własny komputer (localhost).", "Windows domyślnie wysyła tyle pakietów, ile jest kół w samochodzie."],
            why: "Windows domyślnie wysyła 4 pakiety ping." },
          { typ: "wybor", fab: "Nasz nowy laptop po podłączeniu sam dostał adres IP, maskę, bramę i DNS.",
            q: "Kto mu to przydzielił?", o: ["Serwer DHCP (często wbudowany w router)", "Serwer DNS", "Karta graficzna", "Przeglądarka"], a: 0,
            h: ["DNS zamienia nazwy na adresy, ale ich nie przydziela.", "Usługa automatycznej konfiguracji.", "D…"],
            why: "Serwer DHCP automatycznie przydziela konfigurację karty sieciowej." }
        ]
      },
      zagadka: { typ: "wpisz", fab: "Zagadka dodatkowa: adres kryjówki to akta.agencja.edu.pl.",
                 q: "Jaka jest domena najwyższego poziomu w tym adresie?", ok: ["pl", ".pl"], ph: "domena",
                 h: ["Domenę najwyższego poziomu czytamy na samym końcu adresu."], why: "Domena najwyższego poziomu to .pl." }
    },

    {
      id: "boss", typ: "test", test: ["k11a", "k11b"], karta: "c5", boss: true,
      tytul: { det: "Konfrontacja z Cieniem", szp: "Starcie z Fantomem", fan: "Pojedynek z Nullem" },
      wstep: {
        det: [
          ["n", "Finał rozdziału. Potrzebujesz hasła od komisarza (nauczyciela) i informacji, którą grupę piszesz: A czy B."],
          ["w", "Więc to ty jesteś nowym detektywem Braniewskiego? Sprawdźmy, ile naprawdę wiesz."],
          ["s", "Nie daj się sprowokować. Odpowiadaj spokojnie, pytanie po pytaniu. To Twój sprawdzian."]
        ],
        szp: [
          ["n", "Finał rozdziału. Potrzebujesz hasła od Dowódcy (nauczyciela) i informacji o grupie: A lub B."],
          ["w", "Kursant Braniewskiego. Uroczo. Zobaczmy, czy wytrzymasz przesłuchanie."],
          ["s", "Zimna krew, agencie. Pytanie po pytaniu. To Twój sprawdzian."]
        ],
        fan: [
          ["n", "Finał rozdziału. Potrzebujesz hasła od Arcymaga (nauczyciela) i informacji o grupie: A lub B."],
          ["w", "Uczeń Braniewskiego? Zabawne. Zmierzmy się – pytanie za pytanie."],
          ["s", "Skup się. Każda dobra odpowiedź to tarcza. To Twój sprawdzian."]
        ]
      },
      koniec: {
        det: [
          ["w", "Hm. Tym razem się rozłączam."],
          ["w", "Ale to dopiero początek. Pozdrów ode mnie Bajta. On wie, dlaczego."],
          ["p", "…Ja? Komisarzu, nie znam tego głosu. Chyba."],
          ["s", "Rozdział zamknięty. Ale ta sygnatura B0… i ta wiadomość. Mamy nową zagadkę."],
          ["n", "Ciąg dalszy w rozdziale 2."]
        ],
        szp: [
          ["w", "Interesujące. Na razie się wycofuję."],
          ["w", "Przekaż pozdrowienia dla ECHO. Ona będzie wiedziała, od kogo."],
          ["p", "…Dowódco, nie rozpoznaję tego sygnału. Nie powinnam… prawda?"],
          ["s", "Operacja zakończona. Ale B0 i ta wiadomość nie dają mi spokoju."],
          ["n", "Ciąg dalszy w rozdziale 2."]
        ],
        fan: [
          ["w", "Hmm. Tym razem znikam."],
          ["w", "Pozdrów ode mnie Pixel. Zapytaj ją, skąd pochodzi."],
          ["p", "…Ja? Huu… Arcymagu, ja nie pamiętam, skąd pochodzę."],
          ["s", "Pojedynek wygrany. Ale runa B0 i te słowa… Kronika ma nową zagadkę."],
          ["n", "Ciąg dalszy w rozdziale 2."]
        ]
      }
    }
  ]
};
