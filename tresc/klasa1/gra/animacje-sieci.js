/* AGENCJA – animacje sieci komputerowych (gra: akta misji; Prowadzenie: teoria w demonstracji Veyon).
   ANIMACJE.otworz("dns") albo ANIMACJE.otworz(["dns", "dhcp"]) – okno z zakładkami.
   Animacje krokowe: pakiet leci po kablu między urządzeniami, a pod spodem jest opis kroku (▶ odtwórz / krok po kroku).
   Topologie: kliknij kabel albo urządzenie, żeby wywołać awarię. Tracert: przykład albo prawdziwa trasa (konsola.js). */
(function () {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const NS = "http://www.w3.org/2000/svg";
  const KOL = { dane: "#4cc9f0", odp: "#22c55e", pyt: "#fca311", zle: "#ef4444" };

  /* ---------- animacje krokowe ---------- */
  // wezly: {id: [x, y, ikona, podpis]}, kable: [[a, b]], kroki: [{z, do, et (napis na pakiecie), k (kolor), o (opis kroku)}]
  // krok bez z/do = sam opis (np. podsumowanie); krok z "zaznacz": id węzła do podświetlenia
  const DEF = {
    pakiet: {
      n: "Droga pakietu do Internetu",
      wezly: { lap: [70, 210, "💻", "Laptop"], ap: [210, 210, "📶", "Punkt dostępowy"], rt: [360, 210, "📦", "Router"], isp: [510, 120, "🏢", "Dostawca Internetu (ISP)"],
               net: [640, 210, "☁️", "Internet"], www: [760, 210, "🗄️", "Serwer WWW"] },
      kable: [["lap", "ap"], ["ap", "rt"], ["rt", "isp"], ["isp", "net"], ["net", "www"]],
      kroki: [
        { o: "Laptop chce otworzyć stronę. Karta sieciowa zamienia dane na fale radiowe (wi-fi).", zaznacz: "lap" },
        { z: "lap", do: "ap", et: "dane", o: "Pakiet leci falami radiowymi do punktu dostępowego – to on tworzy sieć wi-fi." },
        { z: "ap", do: "rt", et: "dane", o: "Punkt dostępowy przekazuje pakiet kablem do routera." },
        { z: "rt", do: "isp", et: "dane", o: "Router to brama domyślna: wysyła pakiet poza sieć lokalną – do sieci dostawcy Internetu." },
        { z: "isp", do: "net", et: "dane", o: "Dostawca łączy nas z Internetem – siecią sieci. Pakiet przechodzi przez kolejne routery." },
        { z: "net", do: "www", et: "dane", o: "Pakiet dociera do serwera WWW pod jego adresem IP." },
        { z: "www", do: "lap", przez: ["net", "isp", "rt", "ap"], et: "strona", k: KOL.odp, o: "Serwer odsyła stronę tą samą drogą w drugą stronę. Wszystko trwa ułamek sekundy." }
      ]
    },
    macip: {
      n: "Adres MAC i adres IP",
      wezly: { a: [80, 110, "💻", "Komputer A · MAC 3C-52-…-9F"], sw: [330, 200, "🔀", "Przełącznik"], b: [80, 300, "🖥️", "Komputer B · MAC A4-5E-…-77"],
               rt: [560, 200, "📦", "Router (brama)"], www: [770, 200, "🗄️", "Serwer · IP 185.12.34.56"] },
      kable: [["a", "sw"], ["b", "sw"], ["sw", "rt"], ["rt", "www"]],
      kroki: [
        { o: "Adres MAC to jak numer mieszkania – działa w obrębie jednej sieci lokalnej. Adres IP to jak adres ulicy i miasta – prowadzi przez wiele sieci." },
        { z: "a", do: "sw", et: "do: A4-5E…", o: "Komputer A wysyła dane do komputera B w tej samej sieci. Na „kopercie” jest adres MAC odbiorcy." },
        { z: "sw", do: "b", et: "do: A4-5E…", o: "Przełącznik ma tablicę: który MAC jest pod którym gniazdem. Kieruje dane tylko do komputera B." },
        { z: "a", do: "sw", et: "do IP 185…", k: KOL.pyt, o: "Teraz A wysyła dane do serwera w Internecie. Odbiorca jest poza siecią lokalną…" },
        { z: "sw", do: "rt", et: "do IP 185…", k: KOL.pyt, o: "…więc dane trafiają do bramy domyślnej, czyli routera." },
        { z: "rt", do: "www", et: "do IP 185…", k: KOL.pyt, o: "Router kieruje dane według adresu IP – przez kolejne sieci aż do serwera." },
        { o: "Podsumowanie: przełącznik kieruje dane według adresów MAC (w sieci lokalnej), router – według adresów IP (między sieciami)." }
      ]
    },
    dns: {
      n: "DNS – zamiana nazwy na adres IP",
      wezly: { pc: [90, 220, "💻", "Twój komputer"], dns: [400, 80, "📒", "Serwer DNS"], www: [710, 220, "🗄️", "Serwer agencja.pl · 185.12.34.56"] },
      kable: [["pc", "dns"], ["pc", "www"]],
      kroki: [
        { o: "Wpisujesz w przeglądarce agencja.pl. Komputer nie wie, gdzie to jest – zna tylko adresy IP.", zaznacz: "pc" },
        { z: "pc", do: "dns", et: "agencja.pl = ?", k: KOL.pyt, o: "Komputer pyta serwer DNS: „Jaki adres IP ma agencja.pl?”" },
        { z: "dns", do: "pc", et: "185.12.34.56", k: KOL.odp, o: "Serwer DNS sprawdza w swojej „książce telefonicznej” i odsyła adres IP." },
        { z: "pc", do: "www", et: "GET /", o: "Teraz przeglądarka łączy się z serwerem WWW pod adresem 185.12.34.56." },
        { z: "www", do: "pc", et: "strona", k: KOL.odp, o: "Serwer odsyła stronę. To samo robi polecenie nslookup – pyta DNS o adres IP." }
      ]
    },
    dhcp: {
      n: "DHCP – adres IP dostajesz automatycznie",
      wezly: { lap: [110, 210, "💻", "Nowy laptop (bez adresu IP)"], rt: [620, 210, "📦", "Router z serwerem DHCP"] },
      kable: [["lap", "rt"]],
      kroki: [
        { o: "Laptop właśnie podłączył się do sieci. Nie ma jeszcze adresu IP – nie wie nawet, kto rozdaje adresy.", zaznacz: "lap" },
        { z: "lap", do: "rt", et: "DISCOVER", k: KOL.pyt, o: "1. Szukam: laptop woła do całej sieci „Czy jest tu serwer DHCP?”." },
        { z: "rt", do: "lap", et: "OFFER", k: KOL.odp, o: "2. Oferta: serwer DHCP proponuje wolny adres, np. 192.168.1.23." },
        { z: "lap", do: "rt", et: "REQUEST", k: KOL.pyt, o: "3. Prośba: laptop odpowiada „Biorę ten adres”." },
        { z: "rt", do: "lap", et: "ACK", k: KOL.odp, o: "4. Potwierdzenie: serwer przydziela adres IP, maskę, bramę domyślną i adres serwera DNS." },
        { o: "Gotowe! Te dane zobaczysz poleceniem ipconfig. Bez DHCP trzeba by je wpisać ręcznie.", zaznacz: "lap" }
      ]
    },
    ping: {
      n: "Ping – czy urządzenie odpowiada?",
      wezly: { pc: [100, 210, "💻", "Twój komputer"], rt: [420, 210, "📦", "Brama (router)"], cel: [730, 210, "🗄️", "8.8.8.8"] },
      kable: [["pc", "rt"], ["rt", "cel"]],
      kroki: [
        { o: "Polecenie ping wysyła małe pakiety „echo” i czeka na odpowiedź. Mierzy czas w milisekundach.", zaznacz: "pc" },
        { z: "pc", do: "cel", przez: ["rt"], et: "echo 1", k: KOL.pyt, o: "Pakiet 1: „Jesteś tam?”" },
        { z: "cel", do: "pc", przez: ["rt"], et: "odpowiedź", k: KOL.odp, o: "Odpowiedź z 8.8.8.8: czas = 14 ms." },
        { z: "pc", do: "cel", przez: ["rt"], et: "echo 2", k: KOL.pyt, o: "Pakiet 2…" },
        { z: "cel", do: "pc", przez: ["rt"], et: "odpowiedź", k: KOL.odp, o: "…odpowiedź: 15 ms. Windows wysyła domyślnie 4 pakiety." },
        { o: "Brak odpowiedzi? Sprawdzaj po kolei: ping 127.0.0.1 (komputer) → ping brama (sieć lokalna) → ping 8.8.8.8 (Internet) → ping google.pl (DNS)." }
      ]
    }
  };

  function silnik(el, d) {
    const W = 840, H = 330;
    el.innerHTML = `<svg class="an-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.n)}"></svg>
      <p class="an-opis" aria-live="polite"></p>
      <div class="an-ster"><button class="drugi" data-w>◀ Krok</button><button class="glowny" data-g>▶ Odtwórz</button><button class="drugi" data-n>Krok ▶</button>
      <span class="an-nr"></span><label class="mala">tempo <input type="range" min="0.5" max="2" step="0.25" value="1" data-t></label></div>`;
    const svg = el.querySelector("svg"), opis = el.querySelector(".an-opis"), nr = el.querySelector(".an-nr");
    const mk = (tag, a, rodzic = svg) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); rodzic.appendChild(e); return e; };
    const P = d.wezly;
    d.kable.forEach(([a, b]) => mk("line", { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], class: "an-kabel" }));
    const wez = {};
    for (const id in P) {
      const [x, y, ik, pod] = P[id], g = mk("g", { class: "an-wezel", transform: `translate(${x},${y})` });
      mk("circle", { r: 30 }, g); const t = mk("text", { class: "an-ik", y: 10 }, g); t.textContent = ik;
      const l = mk("text", { class: "an-pod", y: 50 }, g); l.textContent = pod;
      wez[id] = g;
    }
    const pak = mk("g", { class: "an-pakiet", opacity: 0 }); const pr = mk("rect", { x: -48, y: -13, width: 96, height: 26, rx: 13 }, pak); const pt = mk("text", { y: 5 }, pak);
    let i = -1, gra = false, zad = null, ruch = null;
    const tempo = () => +el.querySelector("[data-t]").value;
    function trasa(k) { return [k.z].concat(k.przez || [], [k.do]).map((id) => P[id]); }
    function pokaz(n, anim) {
      cancelAnimationFrame(ruch); clearTimeout(zad);
      i = Math.max(0, Math.min(d.kroki.length - 1, n));
      const k = d.kroki[i];
      opis.textContent = k.o; nr.textContent = `${i + 1} / ${d.kroki.length}`;
      Object.values(wez).forEach((g) => g.classList.remove("an-on"));
      if (k.zaznacz) wez[k.zaznacz].classList.add("an-on");
      if (!k.z) { pak.setAttribute("opacity", 0); return dalej(1200); }
      wez[k.z].classList.add("an-on"); wez[k.do].classList.add("an-on");
      pt.textContent = k.et || ""; pr.setAttribute("fill", k.k || KOL.dane); pak.setAttribute("opacity", 1);
      const pkt = trasa(k), odc = []; let suma = 0;
      for (let j = 1; j < pkt.length; j++) { const dl = Math.hypot(pkt[j][0] - pkt[j - 1][0], pkt[j][1] - pkt[j - 1][1]); odc.push(dl); suma += dl; }
      const czas = (900 + suma * 1.6) / tempo(), t0 = performance.now();
      const klatka = (t) => {
        let u = anim ? Math.min(1, (t - t0) / czas) : 1, s = u * suma, j = 0;
        while (j < odc.length - 1 && s > odc[j]) { s -= odc[j]; j++; }
        const f = odc[j] ? Math.min(1, s / odc[j]) : 1, a = pkt[j], b = pkt[j + 1];
        pak.setAttribute("transform", `translate(${a[0] + (b[0] - a[0]) * f},${a[1] - 40 + (b[1] - a[1]) * f})`);
        if (u < 1) ruch = requestAnimationFrame(klatka); else dalej(900);
      };
      ruch = requestAnimationFrame(klatka);
    }
    function dalej(ms) { if (gra && i < d.kroki.length - 1) zad = setTimeout(() => pokaz(i + 1, true), ms / tempo()); else if (gra) stop(); }
    const bg = el.querySelector("[data-g]");
    function stop() { gra = false; bg.textContent = "▶ Odtwórz"; }
    bg.onclick = () => { if (gra) { stop(); clearTimeout(zad); return; } gra = true; bg.textContent = "⏸ Pauza"; pokaz(i >= d.kroki.length - 1 ? 0 : i + 1, true); };
    el.querySelector("[data-n]").onclick = () => { stop(); pokaz(i + 1, true); };
    el.querySelector("[data-w]").onclick = () => { stop(); pokaz(i - 1, false); };
    pokaz(0, false);
    return () => { cancelAnimationFrame(ruch); clearTimeout(zad); };
  }

  /* ---------- topologie: kliknij kabel albo urządzenie, żeby wywołać awarię ---------- */
  const TOPO = {
    gwiazda: { n: "Gwiazda", o: "Wszystkie urządzenia podłączone do jednego punktu centralnego (przełącznika).",
      w: { s: [420, 165, "🔀"], a: [420, 40, "💻"], b: [600, 110, "💻"], c: [600, 240, "💻"], d: [420, 295, "💻"], e: [240, 240, "💻"], f: [240, 110, "💻"] },
      k: [["s", "a"], ["s", "b"], ["s", "c"], ["s", "d"], ["s", "e"], ["s", "f"]] },
    rozszerzona: { n: "Gwiazda rozszerzona", o: "Punkt centralny i dodatkowe przełączniki, do których podłączone są komputery – tak wygląda sieć szkolna.",
      w: { s: [420, 70, "🔀"], s1: [220, 180, "🔀"], s2: [620, 180, "🔀"], a: [110, 290, "💻"], b: [220, 300, "💻"], c: [330, 290, "💻"], d: [510, 290, "💻"], e: [620, 300, "💻"], f: [730, 290, "💻"] },
      k: [["s", "s1"], ["s", "s2"], ["s1", "a"], ["s1", "b"], ["s1", "c"], ["s2", "d"], ["s2", "e"], ["s2", "f"]] },
    magistrala: { n: "Magistrala", o: "Wszystkie urządzenia podłączone do jednego wspólnego kabla.",
      w: { m1: [100, 180, "·"], m2: [240, 180, "·"], m3: [380, 180, "·"], m4: [520, 180, "·"], m5: [660, 180, "·"], m6: [760, 180, "·"],
           a: [100, 70, "💻"], b: [240, 290, "💻"], c: [380, 70, "💻"], d: [520, 290, "💻"], e: [660, 70, "💻"], f: [760, 290, "💻"] },
      k: [["m1", "m2"], ["m2", "m3"], ["m3", "m4"], ["m4", "m5"], ["m5", "m6"], ["m1", "a"], ["m2", "b"], ["m3", "c"], ["m4", "d"], ["m5", "e"], ["m6", "f"]] },
    pierscien: { n: "Pierścień", o: "Każde urządzenie połączone z dwoma sąsiadami; dane krążą po pierścieniu w jedną stronę.", pierscien: true,
      w: { a: [420, 40, "💻"], b: [600, 110, "💻"], c: [600, 240, "💻"], d: [420, 300, "💻"], e: [240, 240, "💻"], f: [240, 110, "💻"] },
      k: [["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f"], ["f", "a"]] },
    siatka: { n: "Siatka", o: "Każde urządzenie połączone z więcej niż jednym innym – po awarii dane pójdą inną drogą.",
      w: { a: [420, 40, "💻"], b: [620, 120, "💻"], c: [560, 290, "💻"], d: [280, 290, "💻"], e: [220, 120, "💻"] },
      k: [["a", "b"], ["a", "c"], ["a", "d"], ["a", "e"], ["b", "c"], ["b", "e"], ["c", "d"], ["d", "e"], ["b", "d"]] }
  };
  function topologie(el) {
    el.innerHTML = `<div class="zakladki an-topo-z">${Object.entries(TOPO).map(([id, t], j) => `<button data-tp="${id}" aria-pressed="${j === 0}">${t.n}</button>`).join("")}</div>
      <svg class="an-svg an-topo" viewBox="0 0 840 340"></svg><p class="an-opis" aria-live="polite"></p>
      <p class="mala">Kliknij kabel albo urządzenie, żeby wywołać awarię. Kliknij jeszcze raz, żeby naprawić. Które topologie są najbardziej odporne na awarie?</p>`;
    const svg = el.querySelector("svg"), opis = el.querySelector(".an-opis");
    function rysuj(id) {
      const T = TOPO[id], ciete = new Set(), padle = new Set();
      el.querySelectorAll("[data-tp]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.tp === id));
      const ocen = () => {
        const kompy = Object.keys(T.w).filter((x) => T.w[x][2] === "💻");
        svg.querySelectorAll("line").forEach((l) => l.classList.toggle("an-ciety", ciete.has(+l.dataset.k)));
        let bez = new Set();
        if (T.pierscien) { if (ciete.size || padle.size) kompy.forEach((x) => bez.add(x)); }
        else {   // spójne części sieci; komputery poza największą częścią straciły połączenie
          const sas = {}; Object.keys(T.w).forEach((x) => (sas[x] = []));
          T.k.forEach(([a, b], j) => { if (!ciete.has(j) && !padle.has(a) && !padle.has(b)) { sas[a].push(b); sas[b].push(a); } });
          const czesc = {}; let nrC = 0;
          Object.keys(T.w).forEach((x) => { if (czesc[x] != null || padle.has(x)) return; const st = [x]; czesc[x] = nrC;
            while (st.length) { const y = st.pop(); sas[y].forEach((z) => { if (czesc[z] == null) { czesc[z] = nrC; st.push(z); } }); } nrC++; });
          const ile = {}; kompy.forEach((x) => { if (czesc[x] != null) ile[czesc[x]] = (ile[czesc[x]] || 0) + 1; });
          const glowna = Object.keys(ile).sort((a, b) => ile[b] - ile[a])[0];
          kompy.forEach((x) => { if (padle.has(x) || String(czesc[x]) !== glowna || ile[glowna] < 2) bez.add(x); });   // samotny komputer też jest odcięty
        }
        svg.querySelectorAll(".an-wezel").forEach((g) => { g.classList.toggle("an-bez", bez.has(g.dataset.w)); g.classList.toggle("an-padl", padle.has(g.dataset.w)); });
        const awarie = ciete.size + padle.size;
        opis.textContent = !awarie ? T.o : T.pierscien ? `Pierścień przerwany – dane nie obiegną sieci. Przestają działać wszystkie komputery (${kompy.length}).`
          : bez.size ? `Awaria! Bez połączenia z resztą sieci: ${bez.size} z ${kompy.length} komputerów.` : `Awaria, ale wszystkie komputery nadal się komunikują – dane idą inną drogą lub awaria nikogo nie odcięła.`;
      };
      svg.innerHTML = "";
      T.k.forEach(([a, b], j) => { const l = document.createElementNS(NS, "line");
        Object.entries({ x1: T.w[a][0], y1: T.w[a][1], x2: T.w[b][0], y2: T.w[b][1], class: "an-kabel an-klik", "data-k": j }).forEach(([k, v]) => l.setAttribute(k, v));
        l.onclick = () => { ciete.has(j) ? ciete.delete(j) : ciete.add(j); ocen(); }; svg.appendChild(l); });
      Object.entries(T.w).forEach(([x, [px, py, ik]]) => {
        const g = document.createElementNS(NS, "g"); g.setAttribute("class", "an-wezel an-klik" + (ik === "·" ? " an-punkt" : "")); g.dataset.w = x; g.setAttribute("transform", `translate(${px},${py})`);
        g.innerHTML = ik === "·" ? `<circle r="6"></circle>` : `<circle r="28"></circle><text class="an-ik" y="10">${ik}</text>`;
        if (ik !== "·") g.onclick = () => { padle.has(x) ? padle.delete(x) : padle.add(x); ocen(); };
        svg.appendChild(g);
      });
      ocen();
    }
    el.querySelectorAll("[data-tp]").forEach((b) => (b.onclick = () => rysuj(b.dataset.tp)));
    rysuj("gwiazda");
  }

  /* ---------- tracert: przykładowa albo prawdziwa trasa ---------- */
  function trasaDef(skoki, cel) {   // skoki: [{ip, ms}] → animacja z TTL
    const n = skoki.length, wezly = { pc: [60, 170, "💻", "Ty"] }, kable = [], kroki = [];
    let poprz = "pc";
    skoki.forEach((s, j) => {
      const x = 60 + (j + 1) * (720 / n), y = j % 2 ? 230 : 110, id = "r" + j, ost = j === n - 1;
      wezly[id] = [x, y, ost ? "🗄️" : s.ip === "*" ? "❔" : "📦", `${j + 1}. ${s.ip === "*" ? "nie odpowiada" : s.ip}${s.ms != null ? " · " + s.ms + " ms" : ""}`];
      kable.push([poprz, id]); poprz = id;
    });
    kroki.push({ o: `tracert ${cel}: wysyła pakiety z rosnącym licznikiem TTL. Każdy router zmniejsza TTL o 1; gdy spadnie do 0 – router odsyła wiadomość „czas minął”. Tak poznajemy kolejne routery.`, zaznacz: "pc" });
    skoki.forEach((s, j) => {
      const id = "r" + j, przez = Array.from({ length: j }, (_, q) => "r" + q);
      kroki.push({ z: "pc", do: id, przez, et: `TTL=${j + 1}`, k: KOL.pyt, o: `Pakiet z TTL=${j + 1} dociera do ${j + 1}. skoku${s.ip === "*" ? " – ten router nie odpowiada (gwiazdki w wyniku)." : ` (${s.ip}).`}` });
      if (s.ip !== "*") kroki.push({ z: id, do: "pc", przez: przez.slice().reverse(), et: j === n - 1 ? "jestem!" : "czas minął", k: j === n - 1 ? KOL.odp : KOL.zle,
        o: j === n - 1 ? `Cel osiągnięty: ${cel} odpowiada${s.ms != null ? " w " + s.ms + " ms" : ""}. Śledzenie zakończone – ${n} skoków.` : `Router ${s.ip} odsyła „czas minął”${s.ms != null ? " (" + s.ms + " ms)" : ""}.` });
    });
    return { n: "Tracert – trasa pakietów", wezly, kable, kroki };
  }
  const PRZYKLAD = [{ ip: "192.168.0.1", ms: 2 }, { ip: "10.12.0.1", ms: 6 }, { ip: "83.1.4.177", ms: 9 }, { ip: "195.116.35.194", ms: 16 }, { ip: "*" }, { ip: "8.8.8.8", ms: 14 }];
  function parsujTracert(w) {
    return w.split("\n").filter((l) => /^\s*\d+\s+/.test(l)).map((l) => {
      const ip = (l.match(/\b\d{1,3}(\.\d{1,3}){3}\b/g) || []).pop(), ms = (l.match(/(\d+)\s*ms/g) || []).map((x) => parseInt(x, 10));
      return { ip: ip || "*", ms: ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : null };
    }).slice(0, 14);
  }
  function tracert(el) {
    const K = window.KONSOLA, mozna = K && K.dostepna();
    el.innerHTML = `<div class="an-tr"><span class="mala">${mozna ? "Prześledź prawdziwą trasę z tego komputera:" : "Przykładowa trasa. Prawdziwą trasę zobaczysz w aplikacji Agencji."}</span>
      ${mozna ? `<input value="8.8.8.8" aria-label="Adres" data-cel> <button class="glowny" data-tr>🛰 tracert</button>` : ""}<span class="mala" data-st></span></div><div data-an></div>`;
    let zatrzymaj = silnik(el.querySelector("[data-an]"), trasaDef(PRZYKLAD, "8.8.8.8"));
    const b = el.querySelector("[data-tr]");
    if (b) b.onclick = async () => {
      const cel = el.querySelector("[data-cel]").value.trim(), st = el.querySelector("[data-st]");
      if (!/^[A-Za-z0-9][A-Za-z0-9.-]{0,252}$/.test(cel)) return (st.textContent = "Wpisz adres IP albo nazwę domeny.");
      b.disabled = true; st.textContent = "⏳ Śledzę trasę… do minuty.";
      const r = await K.uruchom(`tracert -d -h 14 ${cel}`); b.disabled = false;
      const sk = r.ok ? parsujTracert(r.wynik) : [];
      if (!sk.length) return (st.textContent = "Nie udało się prześledzić trasy (sieć może blokować tracert).");
      st.textContent = `Prawdziwa trasa: ${sk.length} skoków.`;
      zatrzymaj(); zatrzymaj = silnik(el.querySelector("[data-an]"), trasaDef(sk, cel));
    };
    return () => zatrzymaj();
  }

  const NAZWY = { pakiet: DEF.pakiet.n, macip: DEF.macip.n, topologie: "Topologie sieci – awarie", dns: DEF.dns.n, dhcp: DEF.dhcp.n, ping: DEF.ping.n, tracert: "Tracert – trasa pakietów" };
  const WL = {};   // animacje dopisane z innych plików (animacje-systemy.js): id → funkcja(el) zwracająca „zatrzymaj” albo null
  function otworz(lista) {
    lista = [].concat(lista).filter((x) => NAZWY[x]);
    const o = document.createElement("div"); o.className = "nakladka nak-anim";
    o.innerHTML = `<div class="okno" role="dialog" aria-modal="true" aria-label="Animacje"><div class="an-gora"><div class="zakladki">${lista.map((x, j) => `<button data-a="${x}" aria-pressed="${j === 0}">🎬 ${esc(NAZWY[x])}</button>`).join("")}</div>
      <button class="ikona" data-x aria-label="Zamknij">✕</button></div><div class="an-ekran"></div></div>`;
    document.body.appendChild(o);
    let stop = null;
    const pokaz = (x) => {
      if (stop) stop(); o.querySelectorAll("[data-a]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.a === x));
      const el = o.querySelector(".an-ekran");
      stop = WL[x] ? WL[x](el) || null : x === "topologie" ? (topologie(el), null) : x === "tracert" ? tracert(el) : silnik(el, DEF[x]);
    };
    o.querySelectorAll("[data-a]").forEach((b) => (b.onclick = () => pokaz(b.dataset.a)));
    const zamknij = () => { if (stop) stop(); o.remove(); };
    o.querySelector("[data-x]").onclick = zamknij;
    o.addEventListener("keydown", (ev) => { if (ev.key === "Escape") zamknij(); });
    pokaz(lista[0]);
    return o;
  }
  window.ANIMACJE = { otworz, nazwy: NAZWY,
    dodaj(id, nazwa, fn) { NAZWY[id] = nazwa; WL[id] = fn; },
    krokowa(id, d) { DEF[id] = d; NAZWY[id] = d.n; } };
})();
