/* KLIMATY MUNDUROWE – dopisywane do FABULA (wojsko, Służba Celno-Skarbowa, Policja i Straż Graniczna).
   Zadania są wspólne; tu są tylko nazwy, stopnie, tytuły etapów, karty i dialogi. */
(function () {
  const F = window.FABULA;

  Object.assign(F.motywy, {
    woj: {
      nazwa: "Cyberwojsko", opis: "Pluton cyberobrony broni sieci przed wrogim hakerem.", mundur: true,
      sprawa: "Operacja Cybertarcza", agencja: "Pluton Cyberobrony",
      szef: "Pułkownik Braniewski", pomocnik: "SOKÓŁ", pomocnikB: "SOKOŁA", wrog: "Kruk",
      dowod: "Meldunek", kolekcja: "Teczka meldunków", akta: "Materiały szkoleniowe",
      stopnie: ["Szeregowy", "Starszy szeregowy", "Kapral", "Starszy kapral", "Plutonowy"]
    },
    kas: {
      nazwa: "Służba Celno-Skarbowa", opis: "Zespół analiz cyfrowych tropi przemyt i oszustwa w sieci.", mundur: true,
      sprawa: "Sprawa Cyfrowego Przemytu", agencja: "Zespół Analiz Cyfrowych",
      szef: "Naczelnik Braniewski", pomocnik: "SKANER", pomocnikB: "SKANERA", wrog: "Szmugler",
      dowod: "Protokół", kolekcja: "Akta postępowania", akta: "Materiały do kontroli",
      stopnie: ["Aplikant", "Starszy aplikant", "Młodszy rewident", "Rewident", "Starszy rewident"]
    },
    mun: {
      nazwa: "Policja i Straż Graniczna", opis: "Wspólny zespół ściga cyberprzestępcę, który fałszuje dokumenty.", mundur: true,
      sprawa: "Sprawa Fałszerza", agencja: "Wspólny Zespół Policji i Straży Granicznej",
      szef: "Nadinspektor Braniewski", pomocnik: "REKS", pomocnikB: "REKSA", wrog: "Fałszerz",
      dowod: "Ślad", kolekcja: "Materiał dowodowy", akta: "Akta sprawy",
      stopnie: ["Posterunkowy", "Starszy posterunkowy", "Sierżant", "Starszy sierżant", "Sierżant sztabowy"]
    }
  });

  const KARTY = {
    c1: { woj: "Log z podpisem B0", kas: "Log z podpisem B0", mun: "Log z podpisem B0" },
    c2: { woj: "Namiar urządzenia", kas: "Urządzenie spoza ewidencji", mun: "Urządzenie przy szlabanie" },
    c3: { woj: "Raport z rozpoznania", kas: "Analiza przelewów", mun: "Zeznanie świadka" },
    c4: { woj: "Współrzędne celu", kas: "Adres serwera sklepu", mun: "Adres serwera" },
    c5: { woj: "Ostatnia wiadomość Kruka", kas: "Ostatnia wiadomość Szmuglera", mun: "Ostatnia wiadomość Fałszerza" },
    c6: { woj: "Utajniony podpis", kas: "Ukryty podpis", mun: "Zatarty podpis" }
  };
  Object.entries(KARTY).forEach(([k, t]) => Object.assign(F.karty[k].t, t));

  const E = {
    prolog: {
      tytul: { woj: "Alarm w jednostce", kas: "Pilne zgłoszenie", mun: "Awaria na granicy" },
      wstep: {
        woj: [
          ["n", "Jednostka wojskowa, 5:30. Pobudka – i od razu alarm w centrum operacji cybernetycznych."],
          ["s", "Baczność! Jestem pułkownik Braniewski, dowódca Plutonu Cyberobrony. Od dziś służysz w moim plutonie."],
          ["s", "W nocy ktoś zaatakował archiwum jednostki i pomieszał dane o historii komputerów. Bez nich szkolenie stoi."],
          ["s", "Atakujący podpisał się jednym słowem: KRUK."],
          ["p", "Tu SOKÓŁ, system wsparcia dowodzenia. Będę podpowiadał, ale każda podpowiedź obniża punkty za zadanie. Pułkownik widzi wszystkie raporty."],
          ["s", "Pierwsze zadanie: przywróć porządek w archiwum. Wykonać!"]
        ],
        kas: [
          ["n", "Urząd celno-skarbowy, poniedziałek rano. Na biurku leży pilne zgłoszenie."],
          ["s", "Dzień dobry. Jestem naczelnik Braniewski. Od dziś pracujesz w Zespole Analiz Cyfrowych."],
          ["s", "Ktoś włamał się do naszej bazy wiedzy i pomieszał dane o historii komputerów. Bez nich nie przeanalizujemy starych nośników zabezpieczonych w kontrolach."],
          ["s", "W systemie został jeden podpis: SZMUGLER."],
          ["p", "Tu SKANER, system analityczny. Pomogę przy analizie, ale każda podpowiedź obniża punkty za zadanie. Naczelnik widzi wszystkie raporty."],
          ["s", "Na początek uporządkuj dane. Pokaż, że masz oko do szczegółów."]
        ],
        mun: [
          ["n", "Przejście graniczne, noc. System kontroli dokumentów nagle przestaje działać."],
          ["s", "Dobrze, że jesteś. Nadinspektor Braniewski. Od dziś pracujesz we wspólnym zespole Policji i Straży Granicznej."],
          ["s", "Ktoś włamał się do archiwum i pomieszał dane o historii komputerów. Bez nich nie sprawdzimy starych zapisów z kontroli granicznej."],
          ["s", "Zostawił jeden podpis: FAŁSZERZ."],
          ["p", "Hau! Tu REKS, robot tropiący. Pomogę Ci, ale każda podpowiedź obniża punkty za zadanie. Nadinspektor wszystko widzi."],
          ["s", "Na początek uporządkuj archiwum. Do dzieła."]
        ]
      },
      koniec: {
        woj: [
          ["s", "Archiwum odtworzone. Dobra robota, żołnierzu."],
          ["p", "Panie pułkowniku! Wykrywam obcy proces w komputerach sztabu. Kruk jest w naszej sieci!"],
          ["s", "Czyli to był tylko pierwszy atak. Pluton – w gotowości."]
        ],
        kas: [
          ["s", "Dane uporządkowane. Dobry początek."],
          ["p", "Panie naczelniku! W naszych komputerach działa obcy proces. Szmugler jest w systemie!"],
          ["s", "Czyli to nie było zwykłe włamanie. Wszczynamy postępowanie."]
        ],
        mun: [
          ["s", "Archiwum uporządkowane. Dobra robota."],
          ["p", "Hau! Panie nadinspektorze, w systemie kontroli granicznej działa obcy proces. Fałszerz jest w środku!"],
          ["s", "Więc to dopiero początek. Zabezpieczamy system."]
        ]
      }
    },
    m1: {
      tytul: { woj: "Atak na sztab", kas: "Kontrola systemu", mun: "Włamanie do systemu kontroli" },
      wstep: {
        woj: [
          ["n", "Poprzednio: Kruk zaatakował archiwum jednostki, a teraz wdarł się do komputerów sztabu."],
          ["p", "Obcy proces działa z uprawnieniami administratora i zajmuje pamięć operacyjną."],
          ["s", "Kto broni systemu, musi znać go od środka: warstwy, jądro, konta, kopie zapasowe."],
          ["s", "Zapoznaj się z materiałami, wybierz poziom i zabezpiecz system sztabu."]
        ],
        kas: [
          ["n", "Poprzednio: Szmugler pomieszał bazę wiedzy urzędu i ukrył się w naszych komputerach."],
          ["p", "Obcy proces działa z konta administratora i zajmuje pamięć oraz czas procesora."],
          ["s", "Żeby go wykryć, musisz znać system od środka: warstwy, jądro, konta, kopie zapasowe."],
          ["s", "Przejrzyj materiały, wybierz poziom i przeprowadź kontrolę systemu."]
        ],
        mun: [
          ["n", "Poprzednio: Fałszerz pomieszał archiwum, a potem wdarł się do systemu kontroli granicznej."],
          ["p", "Obcy proces działa z konta administratora i zajmuje pamięć oraz czas procesora."],
          ["s", "Żeby zabezpieczyć system, musisz znać go od środka: warstwy, jądro, konta, kopie zapasowe."],
          ["s", "Przejrzyj akta, wybierz poziom i zabezpiecz system."]
        ]
      },
      koniec: {
        woj: [["p", "Proces zneutralizowany. Ale zdążył wysłać dane poza jednostkę."], ["n", "W logu systemu zostaje podpis: B0."], ["s", "Kruk wycofuje się przez sieć. Ruszamy za nim."]],
        kas: [["p", "Proces zatrzymany. Ale zdążył wysłać dane na zewnątrz."], ["n", "W logu systemu zostaje podpis: B0."], ["s", "Szmugler przemyca dane przez sieć. Idziemy jego śladem."]],
        mun: [["p", "Hau! Proces zatrzymany! Ale zdążył wysłać dane przez sieć."], ["n", "W logu systemu zostaje podpis: B0."], ["s", "Fałszerz ucieka siecią. Ruszamy w pościg."]]
      }
    },
    kart1: {
      tytul: { woj: "Niezapowiedziana kontrola", kas: "Kontrola doraźna", mun: "Nagłe przesłuchanie" },
      wstep: { woj: [], kas: [], mun: [] },
      koniec: { woj: [["s", "Kontrola zaliczona. Wracamy do działań."]], kas: [["s", "Kontrola zakończona. Wracamy do postępowania."]], mun: [["s", "Przesłuchanie zakończone. Wracamy do pościgu."]] }
    },
    m2: {
      tytul: { woj: "Namierzanie nadajnika", kas: "Nielegalne urządzenie", mun: "Namierzanie nadajnika" },
      wstep: {
        woj: [
          ["n", "Poprzednio: atak na sztab odparty, ale Kruk uciekł przez sieć, zostawiając podpis B0."],
          ["p", "W sieci jednostki pracuje nieznane urządzenie. Jego adres MAC to nasz pierwszy trop."],
          ["s", "Poznaj budowę sieci i sprawdź w konsoli swój komputer – prawdziwe dane, żołnierzu. Wykonać!"]
        ],
        kas: [
          ["n", "Poprzednio: kontrola systemu zakończona, ale Szmugler wyprowadził dane siecią, zostawiając podpis B0."],
          ["p", "W sieci urzędu pracuje urządzenie, którego nie ma w ewidencji. Jego adres MAC to nasz trop."],
          ["s", "Poznaj budowę sieci, a potem sprawdź w konsoli dane swojego komputera. Prawdziwe, nie z ćwiczeń."]
        ],
        mun: [
          ["n", "Poprzednio: system kontroli uratowany, ale Fałszerz uciekł przez sieć, zostawiając podpis B0."],
          ["p", "Hau! W sieci przejścia granicznego pracuje nieznane urządzenie. Jego adres MAC to trop."],
          ["s", "Poznaj budowę sieci i sprawdź w konsoli swój komputer. Potem ruszymy w pościg."]
        ]
      },
      koniec: {
        woj: [["p", "Zlokalizowany! Nieautoryzowany punkt dostępowy przy ogrodzeniu jednostki. Pusty…"], ["p", "…ale w jego pamięci została trasa do Internetu."], ["s", "Na następnej odprawie idziemy tym tropem."]],
        kas: [["p", "Mam je! Niezgłoszony punkt dostępowy w magazynie depozytowym. Pusty…"], ["p", "…ale w pamięci została trasa prowadząca do Internetu."], ["s", "Następnym razem sprawdzimy, dokąd prowadzi."]],
        mun: [["p", "Hau! Ukryty punkt dostępowy w budce przy szlabanie. Pusty…"], ["p", "…ale w jego pamięci jest trasa do Internetu."], ["s", "Na następnej służbie ruszamy tym tropem."]]
      }
    },
    m3: {
      tytul: { woj: "Pościg przez sieć", kas: "Śladem przemytu", mun: "Pościg w sieci" },
      wstep: {
        woj: [["n", "Poprzednio: nadajnik Kruka namierzony. W jego pamięci została trasa do Internetu."], ["p", "Idziemy za nią: adresy IP, DNS, porty, ping i tracert – na prawdziwym komputerze."], ["s", "Do końca odprawy chcę mieć adres serwera Kruka. Wykonać!"]],
        kas: [["n", "Poprzednio: nielegalne urządzenie zabezpieczone. W pamięci została trasa."], ["p", "Prześledzimy, dokąd Szmugler przerzuca dane: IP, DNS, porty, tracert."], ["s", "Chcę mieć adres jego serwera."]],
        mun: [["n", "Poprzednio: nadajnik Fałszerza znaleziony. W pamięci została trasa."], ["p", "Hau! Idziemy tropem przez Internet: IP, DNS, porty, tracert."], ["s", "Ruszaj w pościg."]]
      },
      koniec: {
        woj: [["p", "Trasa kończy się na serwerze w Internecie. Port 443 aktywny."], ["s", "Cel namierzony. Przed akcją – sprawdzian. Potem starcie."]],
        kas: [["p", "Trasa prowadzi do serwera sklepu Szmuglera. Port 443 otwarty."], ["s", "Mamy adres. Zanim wejdziemy z kontrolą – sprawdzian."]],
        mun: [["p", "Hau! Trasa prowadzi do serwera Fałszerza. Port 443 otwarty!"], ["s", "Zanim go zatrzymamy – sprawdzian."]]
      }
    },
    kart2: {
      tytul: { woj: "Odprawa przed akcją", kas: "Egzamin kontrolny", mun: "Przesłuchanie świadka" },
      wstep: { woj: [], kas: [], mun: [] },
      koniec: { woj: [["s", "Odprawa zaliczona. Do działań!"]], kas: [["s", "Egzamin zdany. Wracamy do postępowania."]], mun: [["s", "Zeznania się zgadzają. Wracamy do służby."]] }
    },
    boss: {
      tytul: { woj: "Starcie z Krukiem", kas: "Zatrzymanie Szmuglera", mun: "Zatrzymanie Fałszerza" },
      wstep: {
        woj: [["n", "Finał rozdziału. Sprawdzian uruchamia pułkownik (nauczyciel). Grupę A albo B dobierze komputer."], ["w", "Żołnierz Braniewskiego? Zobaczymy, ile wytrzymasz."], ["s", "Spokój i dyscyplina. Pytanie po pytaniu. To Twój sprawdzian."]],
        kas: [["n", "Finał rozdziału. Sprawdzian uruchamia naczelnik (nauczyciel). Grupę A albo B dobierze komputer."], ["w", "Kontroler od Braniewskiego? Sprawdźmy, czy coś znajdziesz."], ["s", "Dokładnie i spokojnie. Pytanie po pytaniu. To Twój sprawdzian."]],
        mun: [["n", "Finał rozdziału. Sprawdzian uruchamia nadinspektor (nauczyciel). Grupę A albo B dobierze komputer."], ["w", "Funkcjonariusz Braniewskiego? Ciekawe, czy mnie złapiesz."], ["s", "Spokojnie i zgodnie z procedurami. Pytanie po pytaniu. To Twój sprawdzian."]]
      },
      koniec: {
        woj: [["w", "Hm. Tym razem się wycofuję."], ["w", "Pozdrów ode mnie SOKOŁA. On wie, dlaczego."], ["p", "…Panie pułkowniku, nie rozpoznaję tego sygnału. Nie powinienem… prawda?"], ["s", "Zadanie wykonane. Ale ten podpis B0 i ta wiadomość… To jeszcze nie koniec."], ["n", "Ciąg dalszy w rozdziale 2."]],
        kas: [["w", "Hm. Tym razem zamykam sklep."], ["w", "Pozdrów ode mnie SKANERA. On wie, dlaczego."], ["p", "…Ja? Panie naczelniku, nie mam tego w żadnej bazie. Chyba."], ["s", "Sprawa zamknięta. Ale podpis B0 i ta wiadomość… Otwieramy nowe postępowanie."], ["n", "Ciąg dalszy w rozdziale 2."]],
        mun: [["w", "Hm. Tym razem się wylogowuję."], ["w", "Pozdrów ode mnie REKSA. On wie, dlaczego."], ["p", "…Hau? Panie nadinspektorze, nie znam tego zapachu. Chyba."], ["s", "Sprawa zamknięta. Ale podpis B0 i ta wiadomość… Mamy nowy trop."], ["n", "Ciąg dalszy w rozdziale 2."]]
      }
    }
  };
  F.etapy.forEach((e) => {
    const d = E[e.id]; if (!d) return;
    Object.assign(e.tytul, d.tytul); Object.assign(e.wstep, d.wstep); Object.assign(e.koniec, d.koniec);
  });

  /* Dodatkowe elementy awatara dla klimatów mundurowych */
  const S = F.awatar.sloty;
  S.glowa.splice(S.glowa.length - 1, 0,
    { id: "rogatywka", n: "Rogatywka", wym: { stopien: 1 } },
    { id: "czapkaSl", n: "Czapka służbowa", wym: { stopien: 2 } });
  S.stroj.push({ id: "moro", n: "Mundur polowy", wym: { stopien: 1 } }, { id: "mundur", n: "Mundur wyjściowy", wym: { stopien: 2 } });
  S.dodatek.push({ id: "odznaka", n: "Odznaka", wym: { karta: "c3" } });
})();
