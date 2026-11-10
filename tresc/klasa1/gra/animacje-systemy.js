/* AGENCJA – animacje do teczki „Systemy operacyjne” (dopisują się do ANIMACJE z animacje-sieci.js):
   ram    – krokowa: od kliknięcia ikony do procesu (dysk → RAM → procesor), zapis i wyłączenie zasilania,
   haslo  – uczeń wpisuje przykładowe hasło i widzi, ile trwa jego łamanie (nic nie jest wysyłane ani zapisywane),
   awarie – drzewko „komputer nie działa”: pytania prowadzą do rozwiązania. */
(function () {
  "use strict";
  const A = window.ANIMACJE; if (!A || !A.dodaj) return;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const st = document.createElement("style");
  st.textContent = `.as-p{font-size:1.05rem;margin:10px 0}.as-mala{opacity:.75;font-size:.9rem}
.as-in{font:700 1.3rem Consolas,monospace;padding:.45em .7em;border-radius:10px;width:100%;box-sizing:border-box;background:var(--tlo,#111);color:var(--tekst,#fff);border:2px solid var(--akc2,#4cc9f0)}
.as-prz{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;align-items:center}
.as-pasek{height:16px;border-radius:999px;background:var(--panel2,#223);overflow:hidden;margin:12px 0 6px}.as-pasek i{display:block;height:100%;width:0;transition:width .3s,background .3s}
.as-czas{font-size:1.6rem;font-weight:800;margin:4px 0}.as-siatka{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:10px 0}
.as-siatka div{background:var(--panel2,#223);border-radius:10px;padding:8px 12px}.as-siatka b{display:block;font-size:1.2rem;color:var(--akc,#fca311)}
.as-sciezka{list-style:none;margin:10px 0;padding:0;display:grid;gap:6px}.as-sciezka li{background:var(--panel2,#223);border-radius:10px;padding:8px 12px;border-left:4px solid var(--akc2,#4cc9f0);opacity:.85}
.as-sciezka li span{color:var(--akc,#fca311);font-weight:700}
.as-wezel{border:2px solid var(--akc,#fca311);border-radius:12px;padding:14px 16px;margin:10px 0;font-size:1.15rem;background:color-mix(in srgb,var(--akc,#fca311) 10%,transparent)}
.as-wezel.as-ok{border-color:var(--dobrze,#22c55e);background:color-mix(in srgb,var(--dobrze,#22c55e) 12%,transparent)}
.as-wezel kbd,.as-sciezka kbd{font:700 .95em Consolas,monospace;background:#000;color:#fff;border-radius:6px;padding:.1em .45em;border:1px solid #666}`;
  document.head.appendChild(st);

  /* ---------- 1. od kliknięcia do procesu ---------- */
  A.krokowa("ram", {
    n: "Od kliknięcia do procesu (dysk, RAM, procesor)",
    wezly: { u: [90, 110, "🧑", "Użytkownik"], sys: [330, 110, "🪟", "System operacyjny"], dysk: [90, 300, "💽", "Dysk – pamięć trwała"],
             ram: [420, 300, "🧮", "Pamięć RAM – robocza"], cpu: [730, 300, "⚙️", "Procesor"], ekr: [730, 110, "🖥️", "Monitor"] },
    kable: [["u", "sys"], ["sys", "dysk"], ["dysk", "ram"], ["ram", "cpu"], ["cpu", "ekr"], ["sys", "ram"]],
    kroki: [
      { o: "Program (np. edytor tekstu) to plik zapisany na dysku. Dopóki go nie uruchomisz, nic nie robi.", zaznacz: "dysk" },
      { z: "u", do: "sys", et: "klik!", k: "#fca311", o: "Klikasz ikonę programu. Polecenie odbiera system operacyjny – pośrednik między Tobą a sprzętem." },
      { z: "sys", do: "dysk", et: "wczytaj", k: "#fca311", o: "System odszukuje plik programu na dysku (zna jego ścieżkę dostępu)." },
      { z: "dysk", do: "ram", et: "program", o: "System kopiuje program z dysku do pamięci RAM i przydziela mu jej fragment. Od tej chwili to PROCES – uruchomiony program." },
      { z: "ram", do: "cpu", et: "rozkazy", o: "Procesor pobiera z pamięci RAM kolejne rozkazy programu i je wykonuje. System przydziela procesowi czas procesora." },
      { z: "cpu", do: "ekr", et: "okno", k: "#22c55e", o: "Wynik trafia na monitor – widzisz okno programu. Wszystko trwało ułamek sekundy." },
      { z: "u", do: "ram", przez: ["sys"], et: "tekst", o: "Piszesz tekst. Trafia on tylko do pamięci RAM – szybkiej, ale ulotnej." },
      { z: "ram", do: "dysk", et: "zapisz", k: "#22c55e", o: "Dopiero „Zapisz” (Ctrl + S) kopiuje dokument z pamięci RAM na dysk." },
      { o: "Wyłączenie zasilania: pamięć RAM traci całą zawartość, dysk – nie. Dlatego niezapisana praca przepada, a zapisane pliki zostają.", zaznacz: "ram" },
      { o: "Podsumowanie: dysk przechowuje (trwale), RAM to biurko do bieżącej pracy (ulotne), procesor wykonuje rozkazy, a system operacyjny wszystkim zarządza." }
    ]
  });

  /* ---------- 2. siła hasła ---------- */
  const POPULARNE = ["123456", "123456789", "12345678", "12345", "111111", "000000", "qwerty", "qwerty123", "qwertyuiop", "password", "haslo", "hasło", "haslo123", "hasło123",
    "zaq12wsx", "zaq1@wsx", "polska", "polska1", "admin", "admin123", "kochamcie", "misiek", "lol123", "abc123", "iloveyou", "1q2w3e4r", "komputer", "samsung", "monika", "bartek", "mateusz", "kasia", "qazwsx", "1234", "1234567890"];
  const PROB = 1e10;   // 10 miliardów prób na sekundę – mocna karta graficzna
  function ileCzasu(s) {
    if (s < 1) return "mniej niż sekundę";
    const J = [[60, "s"], [60, "min"], [24, "godz."], [365, "dni"]]; let v = s;
    for (let i = 0; i < J.length; i++) { if (v < J[i][0]) return `ok. ${Math.round(v)} ${J[i][1]}`; v /= J[i][0]; }
    if (v < 1000) return `ok. ${Math.round(v)} lat`;
    if (v < 1e6) return `ok. ${Math.round(v / 1000)} tys. lat`;
    if (v < 1e9) return `ok. ${Math.round(v / 1e6)} mln lat`;
    if (v < 1.4e10) return `ok. ${Math.round(v / 1e9)} mld lat`;
    return "dłużej, niż istnieje Wszechświat";
  }
  A.dodaj("haslo", "Ile trwa złamanie hasła?", (el) => {
    el.innerHTML = `<p class="as-p">Wpisz <b>przykładowe</b> hasło i zobacz, jak długo łamałby je komputer sprawdzający wszystkie kombinacje (10 miliardów prób na sekundę).
      <span class="as-mala">Nie wpisuj swojego prawdziwego hasła. Nic nie jest wysyłane ani zapisywane.</span></p>
      <input class="as-in" type="text" maxlength="40" autocomplete="off" spellcheck="false" placeholder="np. kotek" aria-label="Przykładowe hasło">
      <div class="as-prz"><span class="as-mala">Wypróbuj:</span>${["kotek", "kotek2010", "Kotek2010", "Kotek!2010", "zielony rower lubi deszcz"].map((x) => `<button class="drugi" data-h="${esc(x)}">${esc(x)}</button>`).join("")}</div>
      <div class="as-pasek"><i></i></div><div class="as-czas" aria-live="polite">–</div><div class="as-siatka"></div><p class="as-p" data-w></p>`;
    const inp = el.querySelector("input"), pas = el.querySelector(".as-pasek i"), cz = el.querySelector(".as-czas"), sia = el.querySelector(".as-siatka"), wn = el.querySelector("[data-w]");
    const licz = () => {
      const h = inp.value;
      if (!h) { pas.style.width = "0"; cz.textContent = "–"; sia.innerHTML = ""; wn.textContent = "Każdy dodatkowy znak mnoży liczbę kombinacji. Długość daje więcej niż dziwne znaki."; return; }
      const m = /[a-ząćęłńóśźż]/.test(h), d = /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(h), c = /\d/.test(h), z = /[^A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(h);
      const N = (m ? 26 : 0) + (d ? 26 : 0) + (c ? 10 : 0) + (z ? 33 : 0), komb = Math.pow(N, h.length), pop = POPULARNE.includes(h.toLowerCase());
      const s = pop ? 0 : komb / PROB / 2, log = Math.log10(Math.max(s, 1e-3));
      const proc = pop ? 4 : Math.max(4, Math.min(100, (log + 3) / 20 * 100));
      pas.style.width = proc + "%"; pas.style.background = proc < 35 ? "var(--zle,#ef4444)" : proc < 65 ? "#fca311" : "var(--dobrze,#22c55e)";
      cz.textContent = pop ? "natychmiast – to hasło jest na liście najpopularniejszych" : ileCzasu(s);
      sia.innerHTML = `<div><b>${h.length}</b>znaków</div><div><b>${N}</b>możliwych znaków na każdej pozycji</div><div><b>${komb < 1e15 ? Math.round(komb).toLocaleString("pl-PL") : "ok. 10^" + Math.round(Math.log10(komb))}</b>kombinacji</div>
        <div><b>${[m && "małe litery", d && "wielkie litery", c && "cyfry", z && "znaki specjalne"].filter(Boolean).join(", ")}</b>użyte rodzaje znaków</div>`;
      wn.textContent = pop ? "Włamywacz zaczyna od listy popularnych haseł – takie hasło pada w pierwszej sekundzie." :
        h.length < 10 ? "Za krótkie. Dopisz kilka znaków i zobacz, jak rośnie czas." :
        proc < 65 ? "Lepiej. Dłuższe hasło (np. kilka słów) będzie jeszcze mocniejsze." : "Dobre hasło: długie i trudne do odgadnięcia. Kilka przypadkowych słów łatwiej zapamiętać niż „X7#q!”.";
    };
    inp.oninput = licz; el.querySelectorAll("[data-h]").forEach((b) => (b.onclick = () => { inp.value = b.dataset.h; licz(); }));
    licz(); inp.focus();
    return null;
  });

  /* ---------- 3. drzewko awarii ---------- */
  // węzeł: t – tekst, o – odpowiedzi [[napis, następny węzeł]]; bez „o” = koniec (ok: true – problem rozwiązany)
  const D = {
    start: { t: "Komputer sprawia kłopoty. Co się dzieje?", o: [["Program się zawiesił", "zaw"], ["Komputer działa bardzo wolno", "wolno"], ["Kłopoty zaczęły się po instalacji programu albo sterownika", "inst"], ["System nie uruchamia się normalnie", "start2"]] },
    zaw: { t: "Otwórz Menedżera zadań: <kbd>Ctrl + Shift + Esc</kbd>, zaznacz program, wybierz „Zakończ zadanie” i uruchom program ponownie. Działa?", o: [["Tak", "ok"], ["Nie, znowu się zawiesza", "zaw2"]] },
    zaw2: { t: "Uruchom ponownie komputer (restart czyści pamięć RAM i zamyka wszystkie procesy). Pomogło?", o: [["Tak", "ok"], ["Nie", "zaw3"]] },
    zaw3: { t: "Zainstaluj aktualizacje programu i systemu – usuwają znane błędy. Pomogło?", o: [["Tak", "ok"], ["Nie", "zaw4"]] },
    zaw4: { t: "Ostateczność dla jednego programu: odinstaluj go i zainstaluj ponownie z zaufanego źródła." },
    wolno: { t: "W Menedżerze zadań (<kbd>Ctrl + Shift + Esc</kbd>) sprawdź, co zużywa procesor i pamięć. Czy jeden proces zabiera prawie wszystko?", o: [["Tak", "wolno2"], ["Nie, ale dysk jest prawie pełny", "dysk"], ["Nie widać nic podejrzanego", "wir"]] },
    wolno2: { t: "Zakończ ten proces („Zakończ zadanie”). Jeśli to nieznany program – przeskanuj komputer antywirusem.", ok: true },
    dysk: { t: "Uruchom Oczyszczanie dysku: usuwa pliki tymczasowe i zawartość Kosza. Odinstaluj nieużywane programy.", ok: true },
    wir: { t: "Przeskanuj komputer programem antywirusowym i zainstaluj aktualizacje. Złośliwy program potrafi działać w ukryciu.", ok: true },
    inst: { t: "Odinstaluj ostatnio dodany program albo sterownik. Pomogło?", o: [["Tak", "ok"], ["Nie", "pkt"]] },
    pkt: { t: "Użyj punktu przywracania – cofa system do stanu sprzed zmiany (Twoje dokumenty zostają). Pomogło?", o: [["Tak", "ok"], ["Nie", "start2"]] },
    start2: { t: "Uruchom system w trybie awaryjnym – startuje z minimum sterowników. Czy w trybie awaryjnym system działa?", o: [["Tak", "aw"], ["Nie", "nos"]] },
    aw: { t: "Winny jest któryś program albo sterownik. W trybie awaryjnym odinstaluj ostatnio dodany albo użyj punktu przywracania.", ok: true },
    nos: { t: "Uruchom komputer z nośnika odzyskiwania i wybierz naprawę systemu. Pomogło?", o: [["Tak", "ok"], ["Nie", "fab"]] },
    fab: { t: "Ostateczność: przywrócenie ustawień fabrycznych. Usuwa programy i ustawienia – dlatego kopię bezpieczeństwa robi się ZANIM coś się zepsuje." },
    ok: { t: "Problem rozwiązany. Zauważ: zaczynamy od najprostszego kroku, a po cięższe środki sięgamy dopiero, gdy lżejsze nie pomogą.", ok: true }
  };
  A.dodaj("awarie", "Komputer nie działa – co robić?", (el) => {
    let droga = [], id = "start";   // droga: [[węzeł, wybrana odpowiedź]]
    const rys = () => {
      const w = D[id];
      el.innerHTML = `<ol class="as-sciezka">${droga.map(([n, o]) => `<li>${D[n].t} <span>→ ${esc(o)}</span></li>`).join("")}</ol>
        <div class="as-wezel${w.ok ? " as-ok" : ""}">${w.o ? "" : w.ok ? "✅ " : "🛠 "}${w.t}</div>
        <div class="as-prz">${(w.o || []).map(([n], j) => `<button class="glowny" data-o="${j}">${esc(n)}</button>`).join("")}
          ${droga.length ? `<button class="drugi" data-c>◂ Cofnij</button><button class="drugi" data-r>↺ Od początku</button>` : ""}</div>`;
      el.querySelectorAll("[data-o]").forEach((b) => (b.onclick = () => { const o = w.o[+b.dataset.o]; droga.push([id, o[0]]); id = o[1]; rys(); }));
      const c = el.querySelector("[data-c]"); if (c) c.onclick = () => { id = droga.pop()[0]; rys(); };
      const r = el.querySelector("[data-r]"); if (r) r.onclick = () => { droga = []; id = "start"; rys(); };
    };
    rys();
    return null;
  });
})();
