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
      id: "prolog", typ: "misja", lekcja: "Wprowadzenie do rozdziału", tytul: { det: "Wezwanie", szp: "Alarm w centrali", fan: "Pomieszana Kronika" },
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
      id: "m1", typ: "misja", teczka: "systemy", lekcja: "Lekcja 3 · Systemy operacyjne", tytul: { det: "Włamanie do systemu", szp: "Infiltracja centrali", fan: "Klątwa w Sercu Systemu" },
      lekcje: [["k2", "1.1 System komputerowy i system operacyjny"], ["k3", "1.1b Zadania systemu operacyjnego"], ["k4", "1.2 Bezpieczeństwo pracy w systemie"], ["k5", "1.3 Rozwiązywanie problemów z komputerem"], ["k6", "Zadania z rozdziału 1 (systemy operacyjne)"]],
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
          { typ: "wybor", fab: "{wrog} dostał się do komputera razem z „darmową” grą pobraną z przypadkowej strony.",
            q: "Skąd najbezpieczniej instalować programy i aplikacje?", o: ["Z oficjalnych sklepów i stron producentów", "Z linków w wiadomościach od nieznajomych", "Z dowolnej strony, jeśli program jest darmowy", "Z pendrive'a znalezionego na korytarzu"], a: 0,
            h: ["Niezaufane źródła to częsta droga wirusów.", "Komu ufasz bardziej: producentowi czy obcej stronie?", "Oficjalne sklepy i strony producentów."],
            why: "Programy z niezaufanych źródeł mogą zawierać złośliwe oprogramowanie – instalujemy je tylko z oficjalnych sklepów i stron producentów." },
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
            why: "Aktualizacje usuwają błędy i luki, które mogą wykorzystać cyberprzestępcy." },
          { typ: "wybor", fab: "{pomocnik} pokazuje listę wszystkiego, co działa na zaatakowanym komputerze.",
            q: "Co to jest proces?", o: ["Egzemplarz wykonywanego programu, któremu system przydziela zasoby", "Plik zapisany na dysku", "Sterownik urządzenia", "Konto użytkownika"], a: 0,
            h: ["Procesy widać w Menedżerze zadań.", "Proces dostaje pamięć i czas procesora.", "To program, który właśnie działa."],
            why: "Proces to wykonywany program, któremu system przydziela m.in. pamięć i czas procesora." },
          { typ: "wybor", fab: "{wrog} złamał hasło do konta w kilka sekund. Ustawiamy nowe.",
            q: "Które hasło jest najbezpieczniejsze?", o: ["Kot!Lata7Nad#Dachem", "agencja123", "qwerty", "01012010"], a: 0,
            h: ["Słowa ze słownika i daty łatwo zgadnąć.", "Silne hasło jest długie i ma różne rodzaje znaków.", "Szukaj małych i wielkich liter, cyfr i symboli."],
            why: "Silne hasło jest długie i łączy małe i wielkie litery, cyfry oraz znaki specjalne. Nie używamy w nim dat ani prostych słów." }
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
          { typ: "wpisz", fab: "{wrog} wpisywał polecenia w powłoce tekstowej. W poleceniu podał ścieżkę do pliku z danymi agencji.",
            q: "Plik raport.txt leży w folderze Akta na dysku C. Wpisz pełną ścieżkę dostępu do tego pliku w zapisie Windows.",
            ok: ["c:\\akta\\raport.txt", "c:/akta/raport.txt"], ph: "np. D:\\Folder\\plik.txt",
            h: ["Ścieżka zaczyna się od litery dysku i dwukropka.", "Foldery oddziela się ukośnikiem wstecznym \\.", "C:\\…\\raport.txt"],
            why: "Ścieżka dostępu to dysk, kolejne foldery i nazwa pliku: C:\\Akta\\raport.txt." },
          { typ: "para", fab: "{szef} kompletuje zestaw ochrony przed kolejnym atakiem.",
            q: "Połącz zabezpieczenie z tym, co robi.",
            l: ["Program antywirusowy", "Program antyszpiegowski", "BitLocker", "Nośnik odzyskiwania (awaryjny)"],
            r: ["Wykrywa i usuwa złośliwe programy", "Wykrywa programy, które potajemnie zbierają informacje o użytkowniku", "Szyfruje cały dysk w systemie Windows", "Pozwala uruchomić i naprawić system po awarii"],
            h: ["„Szpieg” zbiera informacje.", "BitLocker ma w nazwie „lock” – zamek.", "Nośnik awaryjny to np. pendrive z systemem naprawczym."],
            why: "Antywirus – złośliwe programy; antyszpieg – programy szpiegujące; BitLocker – szyfrowanie dysku; nośnik odzyskiwania – uruchomienie i naprawa systemu." },
          { typ: "wybor", fab: "Komputer jest tak zainfekowany, że {szef} rozważa przywrócenie ustawień fabrycznych.",
            q: "Co warto zrobić przed przywróceniem ustawień fabrycznych?", o: ["Zrobić aktualną kopię danych", "Nic", "Odłączyć monitor", "Zmienić nazwę komputera"], a: 0,
            h: ["Przywracanie może coś usunąć.", "Co jest najcenniejsze na komputerze?", "Kopia bezpieczeństwa."],
            why: "Przywracanie ustawień fabrycznych może usunąć dane, więc najpierw kopia." }
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
          { typ: "wybor", fab: "Po ataku {wrog} laptop z dyskiem SSD działa wolniej. {pomocnik} chce go zdefragmentować.",
            q: "Co powiesz?",
            o: ["Nie trzeba – defragmentacja jest przydatna dla dysków HDD, a na SSD nie przyspiesza pracy", "Trzeba – defragmentacja zawsze przyspiesza każdy dysk", "Trzeba – defragmentacja usuwa wirusy", "Lepiej sformatować dysk"], a: 0,
            h: ["Fragmentacja to plik zapisany w kawałkach w różnych miejscach dysku.", "Głowica dysku HDD musi przeskakiwać między kawałkami, a SSD nie ma głowicy.", "Na SSD fragmentacja nie spowalnia odczytu."],
            why: "Defragmentacja układa części plików obok siebie i przyspiesza dyski HDD. Na dyskach SSD nie jest zalecana – nie daje zauważalnego zysku." },
          { typ: "klucz", fab: "Sprawdź na komputerze, z jaką rodziną systemów walczy {wrog}.",
            q: "Zadanie praktyczne. Na komputerze z Windows otwórz Wiersz polecenia (Win + R, wpisz cmd, Enter) i wpisz: echo %OS%. Przepisz wynik.",
            ok: ["windows_nt", "windows nt"], ph: "wynik polecenia",
            h: ["Polecenie echo wypisuje wartość zmiennej systemowej OS.", "Wynik to dwa człony połączone podkreślnikiem.", "Na telefonie: rodzina Windows z jądrem NT, zapisana z podkreślnikiem."],
            why: "Zmienna %OS% w Windows ma wartość Windows_NT – wszystkie współczesne Windowsy korzystają z jądra NT." },
          { typ: "wybor", fab: "Po aktualizacji sterownika grafiki nasz komputer nie uruchamia się normalnie.",
            q: "Co zrobisz najpierw?",
            o: ["Uruchomię tryb awaryjny i wycofam lub odinstaluję sterownik", "Przywrócę ustawienia fabryczne bez kopii danych", "Sformatuję dysk", "Wymienię procesor"], a: 0,
            h: ["Zacznij od najmniej ryzykownego rozwiązania.", "Tryb awaryjny ładuje tylko niezbędne sterowniki.", "Ustawienia fabryczne mogą usunąć dane."],
            why: "Tryb awaryjny pozwala odinstalować wadliwy sterownik bez utraty danych." },
          { typ: "wybor", fab: "Trzeba zabezpieczyć 10-gigabajtowe nagranie z monitoringu, które zostawił {wrog}.",
            q: "Jaki system plików musi mieć dysk, żeby zapisać na nim plik o wielkości 10 GB?", o: ["NTFS", "FAT32", "Dowolny – rozmiar pliku nie ma znaczenia", "Żaden – takiego pliku nie da się zapisać"], a: 0,
            h: ["Jeden ze starszych systemów plików ma limit 4 GB na plik.", "FAT32 nie zapisze pliku większego niż 4 GB.", "Wybierz system plików używany przez Windows."],
            why: "FAT32 przyjmuje pliki do 4 GB, NTFS obsługuje znacznie większe pliki." }
        ]
      },
      zagadka: { typ: "wpisz", fab: "Zagadka dodatkowa: w logu {wrog} zostawił numer pokoju serwerowni zapisany dwójkowo: 1000.",
                 q: "Jaki to numer w systemie dziesiętnym?", ok: ["8"], ph: "liczba",
                 h: ["W systemie dwójkowym kolejne cyfry od prawej znaczą 1, 2, 4, 8…"], why: "1000₂ = 8." }
    },

    {
      id: "kart1", typ: "test", niespodzianka: true, gra: { testy: ["1r1-sys"], czas: 5 }, karta: "c3", lekcja: "Lekcja 4a · kartkówka-niespodzianka: systemy operacyjne",
      tytul: { det: "Nagłe przesłuchanie", szp: "Niezapowiedziany test lojalności", fan: "Nagła Próba Rady" },
      alarm: { det: "Stop! Zanim ruszysz dalej – nagłe przesłuchanie. Sprawdzam, co pamiętasz o systemach.", szp: "Alarm w centrali! Niezapowiedziany test lojalności – systemy operacyjne.",
               fan: "Rada Magów zwołuje nagłą próbę! Pokaż, co pamiętasz o Sercu Systemu.", woj: "Alarm! Niezapowiedziana kontrola wiedzy – systemy operacyjne.",
               kas: "Kontrola doraźna! Sprawdzamy wiedzę o systemach operacyjnych.", mun: "Wezwanie na przesłuchanie! Pytania o systemy operacyjne." },
      wstep: { det: [], szp: [], fan: [] },
      koniec: {
        det: [["s", "Pamiętasz, jak działa system. Dobrze – teraz wracamy do pościgu."]],
        szp: [["s", "Test zaliczony. Wracamy do operacji."]],
        fan: [["s", "Rada jest zadowolona. Wracaj na Pajęcze Ścieżki."]]
      }
    },

    {
      id: "m2", typ: "misja", lekcja: "Lekcja 4a · Sieci komputerowe – budowa sieci",
      tytul: { det: "Namierzanie nadajnika", szp: "Podsłuch w centrali", fan: "Obcy kryształ w Akademii" },
      burza: { temat: "Sieć komputerowa", kat: ["Urządzenia", "Usługi", "Sposób dostępu"] },   // ćwiczenie 1 z podręcznika (Prowadzenie → Burza mózgów)
      lekcje: [["k7", "2.1 Sieć komputerowa i urządzenia sieciowe"], ["k8", "2.2 Rodzaje sieci komputerowych"], ["k9", "2.3 Sieć lokalna LAN i adres MAC"]],
      teczka: "siec-budowa",   // teczki.js – krótka teoria ucznia i wersja do czytania dla nauczyciela
      animacje: ["pakiet", "topologie", "macip"],   // animacje-sieci.js – w aktach misji i w Prowadzeniu (teoria)
      karta: "c2",
      wstep: {
        det: [
          ["n", "W poprzednim odcinku: system agencji uratowany, ale Cień uciekł przez sieć, zostawiając sygnaturę B0."],
          ["p", "W naszej sieci lokalnej pracuje urządzenie, którego nikt nie zna. Każda karta sieciowa ma adres MAC – to jak odcisk palca."],
          ["s", "Najpierw poznaj sieć: urządzenia, rodzaje sieci, adresy MAC. Potem sprawdzisz w konsoli swój komputer – prawdziwy, nie z ćwiczeń."]
        ],
        szp: [
          ["n", "Poprzednio: atak na centralę odparty, ale Fantom uciekł przez sieć, podpisując się B0."],
          ["p", "W sieci lokalnej nadaje nieznane urządzenie. Jego adres MAC to nasz pierwszy trop."],
          ["s", "Poznaj budowę sieci i sprawdź swój terminal w konsoli. Prawdziwe dane, agencie."]
        ],
        fan: [
          ["n", "Wcześniej w Kronice: klątwa zdjęta, ale Null uciekł siecią, zostawiając runę B0."],
          ["p", "W sieci Akademii świeci obcy kryształ. Jego adres MAC jest jak magiczny odcisk – niepowtarzalny."],
          ["s", "Poznaj Pajęcze Ścieżki: urządzenia, rodzaje sieci i adresy MAC. Potem zajrzyj w kryształ swojego komputera."]
        ]
      },
      koniec: {
        det: [
          ["p", "Mam go! Adres MAC zgadza się z kartą starego punktu dostępowego w piwnicy. Urządzenie jest puste…"],
          ["p", "…ale w jego pamięci została trasa do Internetu."],
          ["s", "Dobra robota. Na następnej lekcji idziemy tym tropem przez Internet."]
        ],
        szp: [
          ["p", "Namierzony! Podrzucony punkt dostępowy w szybie wentylacyjnym. Pusty…"],
          ["p", "…ale w jego pamięci jest trasa prowadząca do Internetu."],
          ["s", "Jutro idziemy za sygnałem dalej."]
        ],
        fan: [
          ["p", "Znalazłam! Zaklęty punkt dostępowy w starej wieży. Pusty…"],
          ["p", "…ale w jego krysztale odbija się droga prowadząca poza Akademię."],
          ["s", "Następnym razem podążymy tą drogą."]
        ]
      },
      zadania: {
        rekrut: [
          { typ: "para", fab: "{pomocnik} skanuje sprzęt w budynku. Dopasuj urządzenie do jego zadania.",
            q: "Połącz urządzenie sieciowe z jego rolą.",
            l: ["Router", "Przełącznik", "Punkt dostępowy", "Modem"],
            r: ["Łączy różne sieci", "Łączy urządzenia w sieci lokalnej", "Tworzy sieć wi-fi", "Zamienia sygnał cyfrowy na analogowy i odwrotnie"],
            h: ["Modem = MOdulator-DEModulator.", "Wi-fi wymaga punktu dostępowego.", "Router łączy sieci."],
            why: "Router – sieci; przełącznik – LAN; punkt dostępowy – wi-fi; modem – zamiana sygnałów." },
          { typ: "wybor", fab: "Urządzenia {wrog} rozmawiają ze sobą w sieci. Żeby się porozumieć, muszą trzymać się tych samych reguł.",
            q: "Czym jest protokół komunikacyjny?", o: ["Zbiorem zasad, według których urządzenia wymieniają dane", "Kablem łączącym dwa komputery", "Programem antywirusowym", "Adresem karty sieciowej"], a: 0,
            h: ["To nie jest sprzęt.", "Chodzi o wspólny „język” urządzeń.", "Przykłady: Ethernet, TCP/IP, HTTP."],
            why: "Protokół to zbiór zasad komunikacji, np. Ethernet w sieci lokalnej czy TCP/IP w Internecie." },
          { typ: "wiele", fab: "{wrog} mógł przesyłać dane różnymi drogami. Wskaż wszystkie możliwe.",
            q: "Zaznacz WSZYSTKIE media transmisyjne.",
            o: ["Skrętka", "Światłowód", "Fale radiowe", "Router", "Karta graficzna"], a: [0, 1, 2],
            h: ["Medium to „droga”, a nie urządzenie.", "Są media przewodowe i bezprzewodowe.", "Odrzuć urządzenia."],
            why: "Media: przewody (skrętka, światłowód) i fale radiowe. Router to urządzenie." },
          { typ: "wpisz", real: "nazwa", konsola: true, wzor: "^[A-Za-z0-9_-]{1,15}$", fab: "Zanim złapiemy intruza, sprawdź, jak w sieci przedstawia się Twój komputer.",
            q: "W Wierszu polecenia wpisz hostname. Jak nazywa się komputer, przy którym siedzisz?", ph: "nazwa komputera",
            h: ["Kliknij „🖥 Idę do Wiersza polecenia”, potem Win + R → cmd → Enter.", "Wpisz dokładnie: hostname i naciśnij Enter.", "Przepisz nazwę, którą wyświetliła konsola."],
            why: "Polecenie hostname wyświetla nazwę komputera w sieci." },
          { typ: "para", fab: "{szef} chce mapę zasięgu sieci, w których mógł działać {wrog}.",
            q: "Połącz rodzaj sieci z jej zasięgiem.",
            l: ["PAN", "LAN", "MAN", "WAN"],
            r: ["Kilka metrów wokół człowieka (np. Bluetooth)", "Budynek, np. szkoła", "Miasto", "Kraj lub kontynent"],
            h: ["P = Personal, osobista.", "M = Metropolitan, miejska.", "Od najmniejszej: PAN, LAN, MAN, WAN."],
            why: "PAN – osobista, LAN – lokalna, MAN – miejska, WAN – rozległa." },
          { typ: "wybor", fab: "Szukamy urządzenia intruza w sieci lokalnej.",
            q: "Co jednoznacznie rozpoznaje urządzenie w sieci lokalnej?", o: ["Adres MAC", "Kolor kabla", "Nazwa producenta monitora", "Moc procesora"], a: 0,
            h: ["To „odcisk palca” karty sieciowej.", "Nadaje go producent karty sieciowej.", "M…"],
            why: "Adres MAC jest przypisany karcie sieciowej przez producenta." }
        ],
        agent: [
          { typ: "wybor", fab: "{pomocnik} śledzi pakiety {wrog}: najpierw przez przełącznik w biurze, potem przez router.",
            q: "Na podstawie czego te urządzenia kierują dane?", o: ["Przełącznik – adresów MAC, router – adresów IP", "Przełącznik – adresów IP, router – adresów MAC", "Oba – nazw domen", "Oba – numerów portów"], a: 0,
            h: ["Przełącznik działa wewnątrz sieci lokalnej.", "Router łączy różne sieci.", "W sieci lokalnej liczy się adres karty sieciowej."],
            why: "Przełącznik kieruje dane w sieci lokalnej według adresów MAC, a router przekazuje je między sieciami według adresów IP." },
          { typ: "wpisz", real: "mac", konsola: true, wzor: "^[0-9A-Fa-f]{2}([-:]?[0-9A-Fa-f]{2}){5}$", fab: "Porównamy odcisk intruza z Twoim. Potrzebny prawdziwy adres MAC Twojego komputera.",
            q: "W Wierszu polecenia wpisz getmac albo ipconfig /all. Podaj adres fizyczny (MAC) karty, przez którą Twój komputer łączy się z siecią.", ph: "np. 3C-52-82-1A-B4-9F",
            h: ["W ipconfig /all szukaj „Adres fizyczny” przy karcie, która ma adres IP.", "Adres MAC to 6 par znaków oddzielonych myślnikami.", "Przepisz go dokładnie – wielkość liter nie ma znaczenia."],
            why: "Adres MAC (fizyczny) to 6 par cyfr szesnastkowych, np. 3C-52-82-1A-B4-9F. Każda karta sieciowa ma inny." },
          { typ: "wpisz", fab: "{pomocnik} liczy, ile informacji mieści adres MAC.",
            q: "Z ilu bitów składa się adres MAC?", ok: ["48"], ph: "liczba",
            h: ["Adres ma 6 par znaków.", "Każda para to 1 bajt.", "1 bajt = 8 bitów, więc 6 × 8."],
            why: "6 bajtów × 8 bitów = 48 bitów." },
          { typ: "wybor", fab: "Laptop {wrog} miał kartę sieciową. Bez niej nie połączyłby się z niczym.",
            q: "Do czego służy karta sieciowa?", o: ["Zamienia dane na sygnały (elektryczne, świetlne, radiowe) i odwrotnie", "Wyświetla obraz na monitorze", "Przechowuje pliki", "Zamienia nazwy stron na adresy IP"], a: 0,
            h: ["Łączy komputer z siecią.", "Dane muszą zamienić się w sygnał, żeby popłynąć kablem albo falą.", "Działa w obie strony."],
            why: "Karta sieciowa zamienia pakiety danych na sygnały elektryczne, impulsy świetlne lub fale radiowe – i odwrotnie." },
          { typ: "kolej", fab: "Odtwórz drogę, którą dane z laptopa intruza poszły do Internetu.",
            q: "Ułóż drogę danych z laptopa w sieci wi-fi do Internetu.",
            el: ["Karta sieciowa laptopa", "Punkt dostępowy wi-fi", "Router", "Sieć dostawcy Internetu (ISP)"],
            h: ["Zaczynamy w laptopie.", "Laptop bez kabla łączy się najpierw z urządzeniem od wi-fi.", "Router łączy sieć lokalną z siecią dostawcy."],
            why: "Karta sieciowa → punkt dostępowy → router → sieć dostawcy." },
          { typ: "wiele", fab: "{wrog} połączył laptop z Internetem przez hotspot w swoim smartfonie.",
            q: "Zaznacz WSZYSTKIE role, które pełni smartfon udostępniający połączenie internetowe.",
            o: ["Punkt dostępowy wi-fi", "Router", "Serwer DHCP", "Serwer DNS", "Drukarka sieciowa", "Serwer poczty"], a: [0, 1, 2, 3],
            h: ["Laptop łączy się z telefonem przez wi-fi i dostaje adres IP automatycznie.", "Telefon łączy dwie sieci: wi-fi i sieć komórkową.", "Cztery odpowiedzi są poprawne."],
            why: "Smartfon z hotspotem to punkt dostępowy i router, a dla podłączonych urządzeń także serwer DHCP i DNS." }
        ],
        elita: [
          { typ: "wpisz", przel: true, fab: "Ostatnia para adresu MAC intruza to FF. {pomocnik} potrzebuje tej liczby w systemie dziesiętnym.",
            q: "Ile to FF (szesnastkowo) w systemie dziesiętnym?", ok: ["255"], ph: "liczba",
            h: ["Użyj przycisku 🧮 Przelicznik – kreator jest bez kary.", "F = 15. Pierwsza cyfra ma wagę 16, druga 1.", "15 × 16 + 15."],
            why: "FF₁₆ = 15 × 16 + 15 = 255." },
          { typ: "blad", fab: "{wrog} podrzucił do logów fałszywy adres MAC. Jeden z nich nie może istnieć.",
            q: "Kliknij niepoprawny adres MAC.",
            el: ["3C-52-82-1A-B4-9F", "00-1A-2B-3C-4D-5G", "A4-5E-60-E1-0B-77", "F0-DE-F1-12-34-56"], a: 1,
            h: ["Adres MAC zapisuje się cyframi szesnastkowymi.", "Cyfry szesnastkowe to 0–9 i A–F.", "Szukaj litery spoza A–F."],
            why: "G nie jest cyfrą szesnastkową (0–9, A–F), więc 00-1A-2B-3C-4D-5G nie jest poprawnym adresem MAC." },
          { typ: "wybor", fab: "{wrog} sklonował adres MAC naszej drukarki. W sieci są teraz dwa urządzenia z tym samym adresem.",
            q: "Dlaczego to problem?", o: ["Przełącznik nie wie, do którego urządzenia wysłać dane", "Drukarka zacznie drukować szybciej", "Router zmieni adres IP na MAC", "Nic się nie stanie"], a: 0,
            h: ["Przełącznik kieruje dane według adresów MAC.", "Adres ma być niepowtarzalny.", "Dwa takie same adresy = zamieszanie."],
            why: "Przełącznik zapamiętuje, pod którym portem jest dany MAC. Dwa urządzenia z tym samym adresem mylą go i dane trafiają nie tam, gdzie trzeba." },
          { typ: "wiele", fab: "{pomocnik} spisuje urządzenia, które mogą mieć adres MAC w naszej sieci.",
            q: "Zaznacz WSZYSTKIE urządzenia, które mają kartę sieciową (a więc adres MAC).",
            o: ["Komputer", "Smartfon", "Drukarka sieciowa", "Router", "Monitor podłączony kablem HDMI", "Klawiatura USB"], a: [0, 1, 2, 3],
            h: ["Adres MAC ma każde urządzenie, które samo łączy się z siecią.", "Monitor i klawiatura łączą się tylko z komputerem.", "Cztery odpowiedzi są poprawne."],
            why: "Kartę sieciową (i adres MAC) mają urządzenia, które same łączą się z siecią: komputer, smartfon, drukarka sieciowa, router." },
          { typ: "wpisz", konsola: true, fab: "Chcemy zobaczyć adresy MAC urządzeń, z którymi Twój komputer ostatnio rozmawiał w sieci lokalnej.",
            q: "Które polecenie Windows to pokaże? Sprawdź je w Wierszu polecenia.", ok: ["arp -a", "arp"], ph: "polecenie",
            h: ["To polecenie ma trzy litery i jeden przełącznik.", "ARP łączy adresy IP z adresami MAC.", "a r p  - a"],
            why: "arp -a wyświetla tablicę ARP: adresy IP i odpowiadające im adresy MAC urządzeń z sieci lokalnej." },
          { typ: "kolej", fab: "{szef} każe uporządkować mapę sieci, w których działał {wrog}.",
            q: "Ułóż rodzaje sieci od najmniejszego do największego zasięgu.",
            el: ["PAN", "LAN", "MAN", "WAN"],
            h: ["P = osobista.", "L = lokalna, M = miejska.", "W = rozległa."],
            why: "PAN (osobista) < LAN (lokalna) < MAN (miejska) < WAN (rozległa)." }
        ]
      },
      zagadka: { typ: "wpisz", real: "mac_ost_dec", konsola: true, przel: true, wzor: "^\\d{1,3}$", fab: "Zagadka dodatkowa: czy {wrog} nie podszył się pod Twój komputer? Sprawdź jego odcisk.",
                 q: "Odczytaj w Wierszu polecenia adres MAC swojego komputera (getmac). Ostatnią parę znaków zamień na system dziesiętny.", ph: "liczba",
                 h: ["getmac albo ipconfig /all, a potem 🧮 Przelicznik (kreator bez kary)."], why: "Ostatnia para MAC to liczba szesnastkowa – np. 9F₁₆ = 9 × 16 + 15 = 159." }
    },

    {
      id: "m3", typ: "misja", teczka: "siec-internet", lekcja: "Lekcja 4b · Sieci komputerowe – Internet i usługi",
      tytul: { det: "Pościg przez Internet", szp: "Pościg za sygnałem", fan: "Droga do Wieży Adresów" },
      lekcje: [["k10", "2.4 Internet, czyli sieć sieci"], ["k11", "2.4b Komunikacja w sieci (infografika)"], ["k12", "2.4c Adres opisowy, DNS i konfiguracja"], ["k13", "2.5 Usługi internetowe"], ["k14", "2.6 Diagnostyka dostępu do sieci"], ["k15", "Zadania z rozdziału 2 (sieci)"]],
      animacje: ["dns", "dhcp", "ping", "tracert"],
      karta: "c4",
      wstep: {
        det: [
          ["n", "Poprzednio: nadajnik Cienia znaleziony w piwnicy. W jego pamięci została trasa do Internetu."],
          ["p", "Trasa prowadzi przez wiele routerów. Pójdziemy za nią: adresy IP, DNS, porty, ping i tracert."],
          ["s", "Wszystko sprawdzisz na prawdziwym komputerze. Do końca lekcji chcę mieć adres kryjówki."]
        ],
        szp: [
          ["n", "Poprzednio: podrzucony punkt dostępowy namierzony. W pamięci została trasa."],
          ["p", "Idziemy za sygnałem przez Internet: IP, DNS, porty, tracert."],
          ["s", "Do końca dnia chcę mieć adres serwera Fantoma."]
        ],
        fan: [
          ["n", "Wcześniej w Kronice: obcy kryształ znaleziony. Odbija się w nim droga poza Akademię."],
          ["p", "Podążymy Pajęczymi Ścieżkami: adresy IP, DNS, bramy i tracert."],
          ["s", "Na końcu drogi czeka Wieża Adresów. Ruszaj."]
        ]
      },
      koniec: {
        det: [
          ["p", "Tracert doprowadził nas do serwera w Internecie. Port 443 otwarty – Cień tam jest!"],
          ["s", "Świetna robota. Zanim wejdziemy, jeszcze raz sprawdzimy całą wiedzę. Potem – konfrontacja."]
        ],
        szp: [
          ["p", "Trasa kończy się na serwerze w Internecie. Port 443 aktywny."],
          ["s", "Mamy współrzędne. Przed akcją: test. Potem starcie."]
        ],
        fan: [
          ["p", "Droga kończy się u bram Wieży Adresów. Brama 443 stoi otworem!"],
          ["s", "Przed pojedynkiem czeka Cię jeszcze Próba Rady Magów."]
        ]
      },
      zadania: {
        rekrut: [
          { typ: "wybor", fab: "{pomocnik} wyświetla adres serwera, na którym ukrył się {wrog}.",
            q: "Jak wygląda adres IPv4?", o: ["Cztery liczby 0–255 oddzielone kropkami", "Sześć par znaków szesnastkowych", "Nazwa z domeną", "Pięć liter"], a: 0,
            h: ["Sześć par szesnastkowych to adres MAC.", "Przykład: 178.33.170.138.", "Liczby oddzielone kropkami."],
            why: "Adres IPv4 to cztery liczby 0–255, np. 178.33.170.138." },
          { typ: "wpisz", real: "ip", konsola: true, wzor: "^\\d{1,3}(\\.\\d{1,3}){3}$", fab: "Zanim ruszymy w Internet, sprawdź swój adres w sieci.",
            q: "W Wierszu polecenia wpisz ipconfig. Podaj adres IPv4 swojego komputera.", ph: "np. 192.168.1.20",
            h: ["Szukaj wiersza „Adres IPv4”.", "To cztery liczby oddzielone kropkami.", "Nie pomyl z maską (255.255…) ani z bramą."],
            why: "ipconfig pokazuje adres IPv4, maskę podsieci i bramę domyślną komputera." },
          { typ: "wybor", fab: "{wrog} ukrywa się pod nazwą strony, ale komputer potrzebuje liczb.",
            q: "Do czego służy system DNS?", o: ["Do zamiany adresów opisowych na adresy IP", "Do szyfrowania haseł", "Do zasilania routera", "Do drukowania"], a: 0,
            h: ["To „książka telefoniczna” Internetu.", "Zamienia nazwę na numer.", "Adres opisowy → adres IP."],
            why: "DNS zamienia adresy opisowe (np. agencja.pl) na adresy IP." },
          { typ: "wybor", fab: "Laptop {wrog} po podłączeniu do naszej sieci sam dostał adres IP. Nikt go nie wpisywał.",
            q: "Która usługa automatycznie przydziela urządzeniom adres IP i resztę konfiguracji sieci?", o: ["DHCP", "DNS", "HTTP", "SMTP"], a: 0,
            h: ["DNS zamienia nazwy na adresy, a nie rozdaje ich.", "Usługę tę zwykle pełni router.", "D…"],
            why: "Serwer DHCP (najczęściej w routerze) przydziela adres IP, maskę, bramę i adres serwera DNS." },
          { typ: "para", fab: "{pomocnik} sprawdza, z jakich usług korzystał {wrog}.",
            q: "Połącz usługę internetową z tym, do czego służy.",
            l: ["WWW", "Poczta elektroniczna", "FTP", "Komunikator"],
            r: ["Przeglądanie stron internetowych", "Wysyłanie i odbieranie listów elektronicznych", "Przesyłanie plików na serwer", "Rozmowy na żywo (czat)"],
            h: ["FTP = File Transfer Protocol.", "WWW = strony.", "Czat to rozmowa na żywo."],
            why: "WWW – strony, poczta – listy elektroniczne, FTP – przesyłanie plików, komunikator – rozmowy na żywo." },
          { typ: "wybor", fab: "{pomocnik} wysyła ping do naszego routera i dostaje odpowiedź.",
            q: "Co potwierdza udane polecenie ping do routera?", o: ["Że komunikacja z bramą działa prawidłowo", "Że router się zepsuł", "Że Internet jest wolny", "Że brak zasilania"], a: 0,
            h: ["Router odesłał pakiety.", "Odpowiedź = połączenie działa.", "Router to brama do Internetu."],
            why: "Skoro router odpowiedział, komunikacja z bramą działa." }
        ],
        agent: [
          { typ: "wiele", fab: "W naszej sieci padł serwer DHCP. Komputer trzeba skonfigurować ręcznie, żeby iść dalej tropem {wrog}.",
            q: "Zaznacz WSZYSTKIE parametry, które trzeba wpisać, aby komputer miał dostęp do Internetu.",
            o: ["Adres IP", "Maska podsieci", "Brama domyślna", "Adres serwera DNS", "Adres MAC", "Rozdzielczość ekranu"], a: [0, 1, 2, 3],
            h: ["Adres MAC nadaje producent karty – nie wpisujemy go.", "Bez bramy komputer nie wyjdzie poza sieć lokalną.", "Cztery odpowiedzi są poprawne."],
            why: "Do pracy w Internecie potrzebne są: adres IP, maska podsieci, brama domyślna i adres serwera DNS." },
          { typ: "wpisz", real: "brama", konsola: true, wzor: "^\\d{1,3}(\\.\\d{1,3}){3}$", fab: "Każdy pakiet z naszej sieci wychodzi do Internetu przez jedną bramę.",
            q: "W Wierszu polecenia wpisz ipconfig. Podaj adres bramy domyślnej Twojego komputera.", ph: "adres IP",
            h: ["Szukaj wiersza „Brama domyślna”.", "To zwykle adres routera, np. kończący się na .1.", "Cztery liczby oddzielone kropkami."],
            why: "Brama domyślna to adres routera, przez który komputer wysyła dane poza sieć lokalną." },
          { typ: "wpisz", real: { nslookup: "{cel}" }, cele: ["onet.pl", "wp.pl", "interia.pl", "allegro.pl", "gov.pl", "nask.pl", "wikipedia.org", "pw.edu.pl"], konsola: true,
            wzor: "^\\d{1,3}(\\.\\d{1,3}){3}$", fab: "{wrog} korzysta z różnych serwerów. Sprawdź jeden z nich.",
            q: "W Wierszu polecenia wpisz: nslookup {cel}. Podaj jeden z adresów IP tej domeny.", ph: "adres IP",
            h: ["Pierwszy adres w wyniku to serwer DNS, który odpowiada – nie ten.", "Szukaj pod linią z nazwą {cel} („Nazwa” / „Name”).", "Wystarczy jeden adres IPv4 (cztery liczby)."],
            why: "nslookup pyta serwer DNS o adres IP dla nazwy domeny – dokładnie to robi komputer, gdy wpisujesz adres strony." },
          { typ: "para", fab: "{wrog} rejestruje fałszywe strony. Po końcówce adresu poznasz, kto powinien jej używać.",
            q: "Połącz domenę z jej przeznaczeniem.",
            l: [".gov.pl", ".edu.pl", ".org", ".com"],
            r: ["Instytucje rządowe w Polsce", "Szkoły i uczelnie", "Organizacje, np. fundacje", "Firmy komercyjne"],
            h: ["gov = government, rząd.", "edu = education, edukacja.", "com = commercial, handel."],
            why: ".gov.pl – administracja rządowa, .edu.pl – edukacja, .org – organizacje, .com – firmy." },
          { typ: "para", fab: "{pomocnik} skanuje porty serwera. Dopasuj port do usługi.",
            q: "Połącz numer portu z usługą.",
            l: ["80", "443", "53", "25"],
            r: ["HTTP – strony WWW", "HTTPS – bezpieczne strony WWW", "DNS – zamiana nazw na adresy IP", "SMTP – wysyłanie poczty"],
            h: ["443 to bezpieczna wersja portu 80.", "DNS ma port 53.", "Poczta – 25."],
            why: "80 HTTP, 443 HTTPS, 53 DNS, 25 SMTP." },
          { typ: "wpisz", wynik: `C:\\>tracert 8.8.8.8

Śledzenie trasy do dns.google [8.8.8.8]
przewyższającej maksymalną liczbę przeskoków 30:

  1    <1 ms    <1 ms    <1 ms  10.178.10.1
  2     *        *        *     Upłynął limit czasu żądania.
  3     2 ms     2 ms     2 ms  10.100.254.242
  4     2 ms     2 ms     2 ms  193.93.68.10
  5     2 ms     2 ms     2 ms  ip-46-21-220-193.nette.pl [46.21.220.193]
  6     *        *       23 ms  155.133.104.148
  7    10 ms    10 ms    10 ms  72.14.219.142
  8    12 ms    11 ms    10 ms  192.178.97.15
  9    11 ms    12 ms    11 ms  216.239.40.43
 10    10 ms    11 ms    10 ms  dns.google [8.8.8.8]

Śledzenie zakończone.`, fab: "{pomocnik} prześledził trasę z NASZEJ szkoły do serwera 8.8.8.8. To prawdziwy wynik ze szkolnej sieci.",
            q: "Przez ile skoków (routerów) przeszły pakiety ze szkoły do 8.8.8.8?", ok: ["10"], ph: "liczba",
            h: ["Policz wiersze zaczynające się od numeru.", "Wiersz z gwiazdkami też jest skokiem.", "Ostatni numer to odpowiedź."],
            why: "Trasa ma 10 skoków – ostatni (10) to sam serwer dns.google. Skok 2 nie odpowiedział, ale pakiety przez niego przeszły." },
          { typ: "blad", fab: "{wrog} podmienił konfigurację karty sieciowej. Jedno ustawienie jest niemożliwe.",
            q: "Kliknij błędne ustawienie.",
            el: ["Adres IP: 192.168.1.256", "Maska podsieci: 255.255.255.0", "Brama domyślna: 192.168.1.1", "Serwer DNS: 8.8.8.8"], a: 0,
            h: ["Każda liczba w adresie IPv4 mieści się w zakresie 0–255.", "Sprawdź każdą liczbę po kolei.", "Szukaj liczby większej niż 255."],
            why: "256 przekracza zakres 0–255, więc 192.168.1.256 nie jest poprawnym adresem." }
        ],
        elita: [
          { typ: "wpisz", real: { tracert: "{cel}" }, cele: ["onet.pl", "wp.pl", "interia.pl", "allegro.pl", "gov.pl", "nask.pl", "wikipedia.org", "pw.edu.pl"], konsola: true,
            wzor: "^\\d{1,2}$", fab: "Idziemy śladem pakietów {wrog} przez kolejne routery.",
            q: "W Wierszu polecenia wpisz: tracert -d {cel}. Przez ile skoków (wierszy z numerem) przeszły pakiety?", ph: "liczba",
            h: ["tracert może potrwać do minuty – poczekaj na „Śledzenie zakończone”.", "Policz wiersze zaczynające się od numeru: 1, 2, 3…", "Wiersze z gwiazdkami (*) też się liczą."],
            why: "tracert pokazuje każdy router na trasie (skok). Trasy mogą się trochę różnić, więc liczy się wynik ±1." },
          { typ: "wybor", fab: "Na komputerze {szef} ping 8.8.8.8 działa, ale ping google.pl zwraca błąd „nie można odnaleźć hosta”.",
            q: "Co najpewniej nie działa?", o: ["Serwer DNS (zamiana nazw na adresy)", "Kabel sieciowy", "Karta sieciowa", "Połączenie z Internetem"], a: 0,
            h: ["Ping po adresie IP działa – czyli połączenie jest.", "Problem pojawia się dopiero przy nazwie.", "Kto zamienia nazwy na adresy IP?"],
            why: "Skoro działa ping na adres IP, łącze jest sprawne. Nie działa tylko zamiana nazwy na adres – czyli DNS." },
          { typ: "wpisz", real: { ping: "@brama" }, konsola: true, wzor: "^\\d{1,4}$", fab: "Sprawdźmy, jak szybko odpowiada nasza brama.",
            q: "Sprawdź w Wierszu polecenia adres bramy domyślnej (ipconfig), a potem wyślij do niej ping. Jaki był średni czas odpowiedzi w ms?", ph: "liczba (ms)",
            h: ["Najpierw ipconfig – odczytaj „Brama domyślna”.", "Potem: ping i ten adres.", "Na końcu wyniku: „Czas średni” / „Average”."],
            why: "ping mierzy czas odpowiedzi. Brama jest blisko, więc odpowiada zwykle w kilka milisekund." },
          { typ: "kolej", fab: "Wpisujesz adres kryjówki w przeglądarkę. Ułóż, co dzieje się dalej.",
            q: "Ułóż kroki otwierania strony po wpisaniu adresu opisowego.",
            el: ["Wpisujesz adres opisowy w przeglądarce", "Komputer pyta serwer DNS o adres IP", "Serwer DNS odsyła adres IP", "Przeglądarka łączy się z serwerem WWW pod tym adresem"],
            h: ["Komputer nie zna adresu IP od razu.", "Najpierw pytanie, potem odpowiedź.", "Połączenie z serwerem WWW jest na końcu."],
            why: "Adres opisowy → zapytanie DNS → odpowiedź z IP → połączenie z serwerem WWW." },
          { typ: "wybor", wynik: `C:\\>tracert 8.8.8.8

Śledzenie trasy do dns.google [8.8.8.8]
przewyższającej maksymalną liczbę przeskoków 30:

  1    <1 ms    <1 ms    <1 ms  10.178.10.1
  2     *        *        *     Upłynął limit czasu żądania.
  3     2 ms     2 ms     2 ms  10.100.254.242
  4     2 ms     2 ms     2 ms  193.93.68.10
  5     2 ms     2 ms     2 ms  ip-46-21-220-193.nette.pl [46.21.220.193]
  6     *        *       23 ms  155.133.104.148
  7    10 ms    10 ms    10 ms  72.14.219.142
  8    12 ms    11 ms    10 ms  192.178.97.15
  9    11 ms    12 ms    11 ms  216.239.40.43
 10    10 ms    11 ms    10 ms  dns.google [8.8.8.8]

Śledzenie zakończone.`, fab: "Prawdziwa trasa ze szkolnej sieci. {szef} pyta o pierwszy skok.",
            q: "Czym najpewniej jest urządzenie z pierwszego skoku (10.178.10.1)?", o: ["Bramą domyślną – routerem szkolnej sieci", "Serwerem Google", "Serwerem DNS", "Komputerem ucznia"], a: 0,
            h: ["Pierwszy skok jest najbliżej Ciebie.", "Czas odpowiedzi poniżej 1 ms – to bardzo blisko.", "Przez to urządzenie dane wychodzą z sieci szkoły."],
            why: "Pierwszy skok to zawsze brama domyślna – router, przez który komputer wysyła dane poza sieć lokalną." },
          { typ: "wpisz", wynik: `C:\\>nslookup onet.pl
Serwer:  dns1.edu.lublin.eu
Address:  10.8.2.22

Nieautorytatywna odpowiedź:
Nazwa:   onet.pl
Addresses:  13.227.146.66
          13.227.146.64
          13.227.146.25
          13.227.146.122`, fab: "Prawdziwa odpowiedź serwera DNS ze szkolnej sieci.",
            q: "Jak nazywa się serwer DNS, z którego korzysta szkolna sieć?", ok: ["dns1.edu.lublin.eu"], ph: "nazwa serwera",
            h: ["Patrz na górę wyniku.", "Wiersz „Serwer”.", "Kończy się na .edu.lublin.eu."],
            why: "nslookup najpierw pokazuje serwer DNS, który odpowiada (dns1.edu.lublin.eu, 10.8.2.22), a potem adresy IP szukanej domeny." },
          { typ: "wybor", fab: "Serwer {wrog} ma dziwny, bardzo długi adres z dwukropkami. To adres IPv6.",
            q: "Dlaczego wprowadza się adresy IPv6?", o: ["Bo kończą się wolne adresy IPv4", "Bo IPv4 nie działa w sieci wi-fi", "Żeby strony działały bez DNS", "Bo skończyły się adresy MAC"], a: 0,
            h: ["Adres IPv4 ma 32 bity – to ok. 4,3 mld adresów.", "Urządzeń w Internecie jest coraz więcej.", "IPv6 ma 128 bitów."],
            why: "32-bitowych adresów IPv4 jest ok. 4,3 mld i zaczyna ich brakować. IPv6 ma 128 bitów, więc adresów starczy na długo." },
          { typ: "kolej", fab: "Internet nie działa. {szef} chce wiedzieć, gdzie jest przerwa – sprawdzaj od najbliższego miejsca.",
            q: "Ułóż kroki diagnozy połączenia od najbliższego do najdalszego.",
            el: ["ping 127.0.0.1 – czy działa karta i system", "ping brama – czy działa sieć lokalna i router", "ping 8.8.8.8 – czy jest połączenie z Internetem", "ping google.pl – czy działa DNS"],
            h: ["127.0.0.1 to Twój własny komputer.", "Brama to router w Twojej sieci.", "Nazwa (google.pl) wymaga jeszcze DNS."],
            why: "Diagnozę zaczyna się od siebie: komputer → router → Internet (adres IP) → DNS (nazwa)." }
        ]
      },
      zagadka: { typ: "wpisz", fab: "Zagadka dodatkowa: adres IPv4 ma 32 bity.", q: "Ile bitów ma adres IPv6?", ok: ["128"], ph: "liczba",
                 h: ["To cztery razy więcej niż IPv4."], why: "IPv6 ma 128 bitów – 4 razy więcej niż IPv4." }
    },

    {
      id: "kart2", typ: "test", niespodzianka: true, gra: { testy: ["1r1-sie"], czas: 5 }, lekcja: "Kolejna lekcja · kartkówka-niespodzianka: sieci",
      tytul: { det: "Przesłuchanie świadka", szp: "Test lojalności", fan: "Próba Rady Magów" },
      alarm: { det: "Stop! Zanim zaczniesz nową sprawę – przesłuchanie świadka. Pytania o sieci.", szp: "Alarm w centrali! Test lojalności – sieci komputerowe.",
               fan: "Rada Magów zwołuje próbę! Pokaż, co wiesz o Pajęczych Ścieżkach.", woj: "Alarm! Niezapowiedziana kontrola wiedzy – sieci komputerowe.",
               kas: "Kontrola doraźna! Sprawdzamy wiedzę o sieciach.", mun: "Wezwanie na przesłuchanie! Pytania o sieci komputerowe." },
      wstep: { det: [], szp: [], fan: [] },
      koniec: {
        det: [["s", "Zeznania się zgadzają. Wracamy do nowej sprawy."]],
        szp: [["s", "Test zaliczony. Wracamy do operacji."]],
        fan: [["s", "Rada jest zadowolona. Ruszaj dalej."]]
      }
    },

    {
      id: "boss", typ: "test", gra: { testy: ["1r1-a", "1r1-b"], czas: 40 }, karta: "c5", boss: true, lekcja: "Sprawdzian z rozdziału 1",
      tytul: { det: "Konfrontacja z Cieniem", szp: "Starcie z Fantomem", fan: "Pojedynek z Nullem" },
      wstep: {
        det: [
          ["n", "Finał rozdziału. Sprawdzian uruchamia komisarz (nauczyciel). Grupę A albo B dobierze komputer."],
          ["w", "Więc to ty jesteś nowym detektywem Braniewskiego? Sprawdźmy, ile naprawdę wiesz."],
          ["s", "Nie daj się sprowokować. Odpowiadaj spokojnie, pytanie po pytaniu. To Twój sprawdzian."]
        ],
        szp: [
          ["n", "Finał rozdziału. Sprawdzian uruchamia Dowódca (nauczyciel)."],
          ["w", "Kursant Braniewskiego. Uroczo. Zobaczmy, czy wytrzymasz przesłuchanie."],
          ["s", "Zimna krew, agencie. Pytanie po pytaniu. To Twój sprawdzian."]
        ],
        fan: [
          ["n", "Finał rozdziału. Sprawdzian uruchamia Arcymag (nauczyciel)."],
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

/* Rozdziały gry. Kolejne dopisują pliki rozdzialN.js (etapy z polem r: N i ich karty). */
window.FABULA.rozdzialy = [{ nr: 1, nazwa: window.FABULA.rozdzial, tajna: "c6" }];
window.FABULA.baza = "tresc/klasa1/gra/";   // folder gry (ścieżka od katalogu głównego)
window.FABULY = { 1: window.FABULA };   // fabuły wszystkich klas (panel i prowadzenie lekcji)

/* Skala ocen z kartkówek i sprawdzianów (procent → ocena), wg statutu szkoły. */
window.FABULA.skalaTestow = [[100, "6"], [99, "6-"], [97, "5+"], [94, "5"], [90, "5-"], [84, "4+"], [78, "4"], [72, "4-"],
  [67, "3+"], [61, "3"], [55, "3-"], [49, "2+"], [43, "2"], [36, "2-"], [30, "1+"], [0, "1"]];

/* Wyzwania tygodnia – co tydzień inne (kolejność wg numeru tygodnia). Jedno podejście, maks. 30 XP. */
window.FABULA.wyzwania = [
  { typ: "wpisz", fab: "{wrog} zostawił w logu liczbę zapisaną dwójkowo: 1010.", q: "Ile to w systemie dziesiętnym?", ok: ["10"], ph: "liczba",
    h: ["Kolejne cyfry od prawej znaczą 1, 2, 4, 8.", "Jedynki stoją na pozycjach 8 i 2.", "8 + 2 = ?"], why: "1010₂ = 8 + 2 = 10." },
  { typ: "blad", fab: "{pomocnik} sprawdza listę adresów IP. Jeden nie może istnieć.", q: "Kliknij niepoprawny adres IPv4.",
    el: ["10.0.0.1", "172.16.5.20", "10.0.300.1", "192.168.100.254"], a: 2,
    h: ["Każda liczba w adresie IPv4 ma zakres 0–255.", "Sprawdź trzecią liczbę w każdym adresie.", "Szukaj liczby większej niż 255."], why: "300 > 255, więc 10.0.300.1 jest niepoprawny." },
  { typ: "kolej", fab: "{szef} chce wiedzieć, co dzieje się po naciśnięciu przycisku zasilania.", q: "Ułóż etapy uruchamiania komputera.",
    el: ["Włączenie zasilania", "UEFI/BIOS sprawdza sprzęt", "Uruchomienie programu rozruchowego", "Wczytanie jądra systemu operacyjnego", "Ekran logowania"],
    h: ["Na początku działa oprogramowanie płyty głównej.", "Program rozruchowy wczytuje system.", "Logowanie jest na samym końcu."], why: "Zasilanie → UEFI/BIOS → program rozruchowy → jądro → logowanie." },
  { typ: "wpisz", fab: "Przechwycona wiadomość zaszyfrowana szyfrem Cezara (przesunięcie o 3: A→D).", q: "Odszyfruj: VLHF",
    ok: ["siec", "sieć"], ph: "słowo", h: ["Cofnij każdą literę o 3.", "V→S, L→I.", "To słowo z rozdziału o urządzeniach w …"], why: "VLHF → SIEC (sieć)." },
  { typ: "wiele", fab: "{pomocnik} inwentaryzuje sprzęt. Wskaż urządzenia sieciowe.", q: "Zaznacz WSZYSTKIE urządzenia sieciowe.",
    o: ["Router", "Przełącznik", "Punkt dostępowy", "Modem", "Zasilacz", "Karta graficzna"], a: [0, 1, 2, 3],
    h: ["Urządzenie sieciowe przesyła dane między komputerami.", "Dwa elementy to części komputera, a nie sieci.", "Odrzuć zasilacz i kartę graficzną."], why: "Router, przełącznik, punkt dostępowy i modem to urządzenia sieciowe." },
  { typ: "wpisz", fab: "W adresie MAC intruza pojawia się para 1F.", q: "Ile to w systemie dziesiętnym?", ok: ["31"], ph: "liczba",
    h: ["F to 15.", "1F = 1 × 16 + F.", "16 + 15 = ?"], why: "1F₁₆ = 16 + 15 = 31." },
  { typ: "para", fab: "{szef} rozpisuje usługi sieciowe użyte przez {wrog}.", q: "Połącz protokół z zastosowaniem.",
    l: ["HTTP", "SMTP", "DNS", "DHCP"], r: ["Przesyłanie stron WWW", "Wysyłanie poczty", "Zamiana nazw na adresy IP", "Automatyczna konfiguracja karty sieciowej"],
    h: ["DNS ma w nazwie „domain name”.", "DHCP przydziela adresy.", "SMTP = Simple Mail Transfer Protocol."], why: "HTTP – WWW, SMTP – poczta, DNS – nazwy, DHCP – konfiguracja." },
  { typ: "wpisz", fab: "{pomocnik} liczy możliwe wartości w adresie IPv4.", q: "Ile różnych wartości może przyjąć jedna liczba (oktet) w adresie IPv4?", ok: ["256"], ph: "liczba",
    h: ["Oktet ma 8 bitów.", "Zakres to 0–255.", "Policz razem z zerem."], why: "0–255 to 256 wartości (2⁸)." }
];
