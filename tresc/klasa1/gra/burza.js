/* AGENCJA – burza mózgów: wspólne dla gry i Prowadzenia lekcji.
   Łączy powtórzone pomysły: wielkość liter, polskie znaki, spacje i myślniki („Wi-Fi” = „wifi”),
   odmianę i literówki („routery” = „ruter”) oraz synonimy ze słowniczka poniżej. */
(function () {
  "use strict";
  const DRUZYNY = [{ n: "Czerwoni", k: "#ef4444" }, { n: "Niebiescy", k: "#3b82f6" }, { n: "Zieloni", k: "#22c55e" }];

  // Słowniczek: pierwsze słowo = nazwa wspólna, reszta = to samo inaczej (bez spacji, polskich znaków i myślników).
  const SLOWNIK = [
    ["router", "ruter", "routerwifi"],
    ["switch", "swich", "switche", "przelacznik", "przelacznicy", "switchsieciowy", "przelaczniksieciowy"],
    ["komputer", "pc", "komp", "kompy", "komputerstacjonarny"],
    ["telefon", "smartfon", "smartphone", "komorka", "telefonkomorkowy"],
    ["wifi", "wlan", "wajfaj", "siecbezprzewodowa", "bezprzewodowo", "bezprzewodowa", "internetbezprzewodowy"],
    ["kabel", "kable", "skretka", "ethernet", "kabelsieciowy", "kabelethernet", "przewod", "rj45", "lankabel", "przewodowo", "przewodowa", "kabelrj45"],
    ["swiatlowod", "swiatlowody", "fiber", "internetswiatlowodowy", "swiatlowodowy"],
    ["internetmobilny", "lte", "4g", "5g", "3g", "danemobilne", "danekomorkowe", "siecmobilna", "sieckomorkowa", "transmisjadanych"],
    ["hotspot", "tethering", "udostepnianieinternetu", "hotspotwtelefonie", "punktdostepuwtelefonie"],
    ["accesspoint", "punktdostepu", "punktdostepowy", "ap"],
    ["kartasieciowa", "nic", "kartawifi"],
    ["email", "mail", "maile", "poczta", "pocztaelektroniczna", "pocztaemail"],
    ["www", "strony", "strona", "stronyinternetowe", "stronainternetowa", "stronywww", "przegladaniestron"],
    ["czat", "chat", "komunikator", "komunikatory", "czatowanie"],
    ["chmura", "cloud", "dyskwchmurze", "dyskinternetowy", "onedrive", "googledrive"],
    ["grysieciowe", "gryonline", "granieonline", "gry", "graonline"],
    ["streaming", "strumieniowanie", "transmisjanazywo", "filmyonline", "muzykaonline"],
    ["bluetooth", "bt"],
    ["satelita", "internetsatelitarny", "satelitarny", "starlink"],
    ["serwer", "serwery", "server"],
    ["drukarkasieciowa", "drukarkawifi"]
  ];
  const PL = { "ą": "a", "ć": "c", "ę": "e", "ł": "l", "ń": "n", "ó": "o", "ś": "s", "ź": "z", "ż": "z" };
  const proste = (t) => String(t).toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => PL[c]).replace(/[^a-z0-9]+/g, " ").trim();
  const KONCOWKI = ["ami", "ach", "owie", "ow", "om", "em", "y", "i", "e", "a", "u"];
  function rdzen(s) {   // bardzo prosta „odmiana”: routery → router, kablami → kabl
    if (s.length < 5) return s;
    for (const k of KONCOWKI) if (s.endsWith(k) && s.length - k.length >= 4) return s.slice(0, -k.length);
    return s;
  }
  const SYN = {};
  SLOWNIK.forEach((g) => g.forEach((w) => { SYN[w] = g[0]; SYN[rdzen(w)] = SYN[rdzen(w)] || g[0]; }));
  function klucz(t) {
    const p = proste(t), cale = p.replace(/ /g, "");
    if (SYN[cale]) return SYN[cale];
    const r = p.split(" ").map(rdzen).join("");
    return SYN[r] || r;
  }
  function odl(a, b) {   // odległość Levenshteina (liczba literówek)
    const d = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let lewy = i, ukos = i - 1;
      for (let j = 1; j <= b.length; j++) {
        const t = d[j];
        d[j] = Math.min(d[j] + 1, lewy + 1, ukos + (a[i - 1] === b[j - 1] ? 0 : 1));
        ukos = t; lewy = d[j];
      }
    }
    return d[b.length];
  }
  function podobne(a, b) {
    if (a === b) return true;
    const m = Math.min(a.length, b.length);
    if (m < 4 || Math.abs(a.length - b.length) > 2) return false;
    return odl(a, b) <= (m >= 8 ? 2 : 1);
  }
  /* Wpisy {i, t, d, p, x, a?} → grupy pomysłów każdej drużyny: {i (wpis główny), t, d, ile, ids, warianty, autorzy}.
     p = wpis, z którym lider połączył ręcznie; x = usunięty. */
  function grupuj(wpisy) {
    const ak = wpisy.filter((w) => !w.x), po = new Map(ak.map((w) => [w.i, w])), oj = new Map(ak.map((w) => [w.i, w.i]));
    const f = (i) => { while (oj.get(i) !== i) i = oj.get(i); return i; };
    const u = (a, b) => { a = f(a); b = f(b); if (a !== b) { if (a < b) oj.set(b, a); else oj.set(a, b); } };
    ak.forEach((w) => { const c = w.p != null && po.get(w.p); if (c && c.d === w.d) u(w.p, w.i); });
    const kl = ak.map((w) => klucz(w.t));
    for (let i = 0; i < ak.length; i++) for (let j = i + 1; j < ak.length; j++)
      if (ak[i].d === ak[j].d && podobne(kl[i], kl[j])) u(ak[i].i, ak[j].i);
    const grupy = new Map();
    ak.forEach((w) => {
      const r = f(w.i);
      if (!grupy.has(r)) grupy.set(r, { i: r, d: po.get(r).d, ids: [], w: [] });
      const g = grupy.get(r); g.ids.push(w.i); g.w.push(w);
    });
    return [...grupy.values()].map((g) => {
      // nazwa grupy: najczęstsza pisownia (bez względu na wielkość liter); przy remisie ta, z którą lider połączył inne
      const ile = {};
      g.w.forEach((w) => { const t = w.t.trim(), k = t.toLowerCase(); ile[k] = ile[k] || { t, n: 0, cel: false }; ile[k].n++; if (w.p == null) ile[k].cel = true; });
      const war = Object.values(ile).sort((a, b) => b.n - a.n || b.cel - a.cel), t = war[0].t;
      const autorzy = [...new Set(g.w.map((w) => w.a).filter(Boolean))];
      return { i: g.i, d: g.d, t, ile: g.w.length, ids: g.ids, warianty: war.slice(1).map((x) => x.t), autorzy, z: g.w.map((w) => w.z) };
    }).sort((a, b) => b.ile - a.ile || a.t.localeCompare(b.t, "pl"));
  }
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function tablica(wpisy, kat, autorzy) {   // wyniki: trzy kolumny (kategoria = drużyna), autorzy tylko w podpowiedzi
    return `<div class="bz-tablica">${DRUZYNY.map((dr, d) => {
      const gr = grupuj(wpisy.filter((w) => w.d === d));
      return `<div class="bz-kol" style="--dr:${dr.k}"><h3>${esc(kat[d] || "")}</h3><div class="mala">Drużyna ${dr.n} · pomysłów: ${gr.length}</div>
        <ul>${gr.map((g) => `<li${autorzy ? ` title="${esc(g.autorzy.join(", "))}"` : ""}>${esc(g.t)}${g.ile > 1 ? ` <b>×${g.ile}</b>` : ""}</li>`).join("")}</ul></div>`;
    }).join("")}</div>`;
  }
  window.BURZA = { DRUZYNY, grupuj, klucz, podobne, tablica, esc };
})();
