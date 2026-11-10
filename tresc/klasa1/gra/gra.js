/* AGENCJA – silnik gry fabularnej (misje, poziomy, podpowiedzi, nagrody, chmura). */
(function () {
  "use strict";
  const F = window.FABULA;
  const KLUCZ = "agencja-gra-k" + F.klasa;
  const API_DOMYSLNE = "https://script.google.com/macros/s/AKfycbzGvnKlock74eu0ptTr8Dy7O7BKdnQBL2V8B9vFoSWcl80k3ZLd06R1tBz8m82dQPKySw/exec";
  let API = API_DOMYSLNE;
  try {   // do testów: ?api=http://127.0.0.1:port/ (tylko adres lokalny)
    const q = new URLSearchParams(location.search).get("api");
    if (q && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(q)) API = q;
  } catch (e) {}

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const app = $("#app");

  /* ---------- Stan ---------- */
  const NOWY = () => ({ v: 1, motyw: null, gracz: null, lokalny: false, xp: 0, misje: {}, testy: {}, karty: [], zagadki: {}, wyzwania: {}, rev: 0,
    awatar: { skora: 0, wlosy: 0, glowa: "czapka", stroj: "bluza", dodatek: "brak", tlo: "granat" }, dzwiek: false, zm: 0 });
  let S;
  try { S = Object.assign(NOWY(), JSON.parse(localStorage.getItem(KLUCZ) || "{}")); } catch (e) { S = NOWY(); }
  function zapisz() {
    S.zm = Date.now();
    try { localStorage.setItem(KLUCZ, JSON.stringify(S)); } catch (e) {}
    chmuraPozniej();
  }

  const M = () => F.motywy[S.motyw || "det"];
  const tok = (t) => String(t).replace(/\{(\w+)\}/g, (w, k) => (M()[k] != null ? M()[k] : w));
  const tytul = (e) => (e.tytul && (e.tytul[S.motyw] || e.tytul.det)) || e.id;
  const stopien = (xp = S.xp) => { let i = 0; F.progi.forEach((p, j) => { if (xp >= p) i = j; }); return i; };
  const nazwaStopnia = (i) => M().stopnie[i];
  const etapGotowy = (e) => (e.typ === "test" ? !!S.testy[e.id] : !!S.misje[e.id]);
  const POZ = ["rekrut", "agent", "elita"];
  const czyProlog = (e) => /(^|-)prolog$/.test(e.id);
  const rozdzialEtapu = (e) => e.r || 1;
  const R = (nr) => F.rozdzialy.find((r) => r.nr === nr) || F.rozdzialy[0];
  const etapyRozdzialu = (nr) => F.etapy.filter((e) => rozdzialEtapu(e) === nr);
  function rozdzialAkt() {   // rozdział, w którym uczeń teraz gra: pierwszy z dostępnym, nieukończonym etapem
    const i = F.etapy.findIndex((e, j) => !etapGotowy(e) && dostepny(j));
    if (i >= 0) return R(rozdzialEtapu(F.etapy[i]));
    const ost = [...F.etapy].reverse().find(etapGotowy);
    return R(ost ? rozdzialEtapu(ost) : 1);
  }
  function oczysc() {   // usuwa wyniki etapów, których nie ma już w rozdziale
    const ids = new Set(F.etapy.map((e) => e.id));
    let zm = false;
    Object.keys(S.misje || {}).forEach((k) => { if (!ids.has(k)) { delete S.misje[k]; zm = true; } });
    Object.keys(S.testy || {}).forEach((k) => { if (!ids.has(k)) { delete S.testy[k]; zm = true; } });
    return zm;
  }
  /* XP liczone zawsze od nowa z wyników (te same zasady w skrypcie Google). */
  function liczXP(st = S) {
    let x = 0;
    Object.values(st.misje || {}).forEach((m) => { x += +(m.xpMax != null ? m.xpMax : m.pkt) || 0; });
    x += 15 * Object.keys(st.zagadki || {}).length;
    Object.entries(st.testy || {}).forEach(([id, t]) => { x += Math.round((+t.s || 0) / (+t.m || 1) * (/(^|-)boss$/.test(id) ? 200 : 80)); });
    Object.values(st.wyzwania || {}).forEach((w) => { x += Math.round(+w.pkt || 0); });
    return x;
  }
  function ocenaTestu(s, m) {
    const p = Math.round((+s || 0) / (+m || 1) * 100);
    for (const [prog, o] of F.skalaTestow) if (p >= prog - 1e-9) return o;
    return "1";
  }
  const odblokowaneDo = () => {   // indeks ostatniego etapu odblokowanego przez nauczyciela
    const od = S.klasa && S.klasa.od; if (!od) return F.etapy.length - 1;
    const i = F.etapy.findIndex((e) => e.id === od); return i < 0 ? F.etapy.length - 1 : i;
  };
  const zamknietyPrzezSzefa = (i) => i > odblokowaneDo();
  function dostepny(i) {
    if (S.nauczyciel && S.nauczyciel.wszystko) return true;   // nauczyciel testuje dowolny etap
    if (zamknietyPrzezSzefa(i)) return false;
    if (S.klasa && S.klasa.od) return true;   // lekcje odblokowuje nauczyciel – zaległe misje nie blokują kolejnych
    for (let j = i - 1; j >= 0; j--) if (F.etapy[j].typ === "misja") return etapGotowy(F.etapy[j]);
    return true;
  }
  function tydzien(d = new Date()) {   // numer tygodnia ISO, np. 2026-W45
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dz = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dz);
    const r0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const n = Math.ceil(((t - r0) / 86400000 + 1) / 7);
    return { id: t.getUTCFullYear() + "-W" + String(n).padStart(2, "0"), n };
  }
  function ocena(poziom, proc) {
    const sk = F.poziomy[poziom].skala;
    for (const [p, o] of sk) if (proc >= p) return o;
    return 1;
  }
  const norm = (s) => String(s).toLowerCase().trim().replace(/\s+/g, " ").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");
  const tasuj = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- Dźwięki (domyślnie wyłączone) ---------- */
  let AC = null;
  function dzwiek(rodzaj) {
    if (!S.dzwiek) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const nuty = { klik: [[660, 0.05]], ok: [[523, 0.09], [659, 0.09], [784, 0.16]], zle: [[220, 0.18], [180, 0.22]],
        awans: [[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.32]], karta: [[784, 0.08], [988, 0.08], [1319, 0.2]], tekst: [[880, 0.015]] }[rodzaj] || [];
      let t = AC.currentTime;
      nuty.forEach(([f, d]) => {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = rodzaj === "zle" ? "sawtooth" : "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(rodzaj === "tekst" ? 0.03 : 0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + 0.02); t += d * 0.9;
      });
    } catch (e) {}
  }

  /* ---------- Konfetti ---------- */
  function konfetti() {
    const c = document.createElement("canvas"); c.className = "konfetti"; document.body.appendChild(c);
    const x = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight;
    const kol = ["#fca311", "#e63946", "#2ec4b6", "#7bdcb5", "#c77dff", "#ffd166"];
    const P = Array.from({ length: 140 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.5, v: 2 + Math.random() * 4, r: Math.random() * 6.28, s: 4 + Math.random() * 6, k: kol[Math.floor(Math.random() * kol.length)] }));
    const t0 = performance.now();
    (function klatka(t) {
      x.clearRect(0, 0, c.width, c.height);
      P.forEach((p) => { p.y += p.v; p.x += Math.sin(p.r += 0.05) * 1.5; x.fillStyle = p.k; x.fillRect(p.x, p.y, p.s, p.s * 0.6); });
      if (t - t0 < 2600) requestAnimationFrame(klatka); else c.remove();
    })(t0);
  }

  /* ---------- Chmura ---------- */
  let chmuraT = null, chmuraStan = "";
  async function api(a, d) {
    const c = new AbortController(), t = setTimeout(() => c.abort(), 15000);
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(Object.assign({}, d, { a })), signal: c.signal });
      const tx = await r.text();
      try { return JSON.parse(tx); } catch (e) { const er = new Error("stary"); er.stary = true; throw er; }
    } finally { clearTimeout(t); }
  }
  async function sha(s) {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  function ukonczone() { return F.etapy.filter(etapGotowy).length; }
  function chmuraPozniej() {
    if (!S.gracz || S.lokalny) return;
    clearTimeout(chmuraT); chmuraT = setTimeout(chmuraTeraz, 1200); ustawChmure("…");
  }
  async function chmuraTeraz() {
    if (!S.gracz || S.lokalny) return;
    try {
      const r = await api("zapisz", { n: S.gracz.n, k: S.gracz.k, h: S.gracz.h, rev: S.rev || 0, xp: S.xp, ile: ukonczone(), stan: JSON.stringify(S) });
      if (r && r.ok) return ustawChmure("ok");
      if (r && r.e === "rev" && r.stan) {   // nauczyciel zmienił coś w panelu – przyjmij wersję z chmury
        const g = S.gracz, prefs = { motyw: S.motyw, dzwiek: S.dzwiek, klasa: S.klasa, wybralMotyw: S.wybralMotyw, komWidziany: S.komWidziany, widzialStart: S.widzialStart };
        try { S = Object.assign(NOWY(), JSON.parse(r.stan), prefs, { gracz: g, rev: r.rev }); } catch (e) {}
        oczysc(); S.xp = liczXP();
        try { localStorage.setItem(KLUCZ, JSON.stringify(S)); } catch (e) {}
        ustawChmure("ok");
        if ($("#widok") && !($(".zadanie") || $(".akta") || $(".nak-ramka") || $(".nakladka .poziomy"))) mapa();
        return;
      }
      if (r && (r.e === "pin" || r.e === "brak")) {
        const m = S.motyw, brak = r.e === "brak";
        if (brak) { S = NOWY(); S.motyw = m; } else S.gracz = null;
        try { localStorage.setItem(KLUCZ, JSON.stringify(S)); } catch (e) {}
        start();
        const bl = $(".blad"); if (bl) bl.textContent = brak ? "Twoje konto zostało usunięte przez nauczyciela. Załóż je ponownie." : "Nauczyciel zresetował Twój PIN. Zaloguj się i ustaw nowy PIN.";
        return;
      }
      ustawChmure("blad");
    } catch (e) { ustawChmure("blad"); }
  }
  function ustawChmure(s) {
    chmuraStan = s;
    const e = $("#chmura"); if (!e) return;
    e.textContent = s === "ok" ? "☁ zapisano" : s === "…" ? "☁ zapisuję…" : s === "blad" ? "⚠ zapis lokalny" : "";
    e.title = s === "blad" ? "Nie udało się zapisać w chmurze. Postęp jest bezpieczny na tym urządzeniu – spróbujemy ponownie." : "";
  }

  /* ---------- Okna nakładkowe ---------- */
  function okno(html, klasa = "") {
    const o = document.createElement("div"); o.className = "nakladka " + klasa;
    o.innerHTML = `<div class="okno" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(o);
    return o;
  }

  /* Dialog jak w komiksie: dymki pojawiają się po kolei. */
  function scena(linie) {
    return new Promise((gotowe) => {
      if (!linie || !linie.length) return gotowe();
      const o = okno(`<div class="scena"><div class="dymki" aria-live="polite"></div><div class="scena-p"><button class="drugi" data-pomin>Pomiń scenę</button><button class="glowny" data-dalej>Dalej ▸</button></div></div>`, "nak-scena");
      const box = $(".dymki", o); let i = 0, pisanie = null;
      const imie = (kto) => kto === "s" ? M().szef : kto === "p" ? M().pomocnik : kto === "w" ? M().wrog : "";
      function pokaz() {
        if (i >= linie.length) { o.remove(); return gotowe(); }
        const [kto, txt] = linie[i]; const t = tok(txt);
        const d = document.createElement("div"); d.className = "dymek kto-" + kto;
        d.innerHTML = kto === "n" ? `<div class="narrator"><span></span></div>` :
          `<div class="portret">${portret(kto, S.motyw)}</div><div class="chmurka"><b>${esc(imie(kto))}</b><span></span></div>`;
        box.appendChild(d); d.scrollIntoView({ block: "end", behavior: "smooth" });
        const sp = $("span", d); let n = 0;
        clearInterval(pisanie);
        pisanie = setInterval(() => { n += 2; sp.textContent = t.slice(0, n); if (n % 6 === 0) dzwiek("tekst"); if (n >= t.length) { clearInterval(pisanie); pisanie = null; } }, 18);
        d._pelny = () => { clearInterval(pisanie); pisanie = null; sp.textContent = t; };
        i++;
      }
      function dalej() { const ost = box.lastElementChild; if (pisanie && ost) { ost._pelny(); return; } dzwiek("klik"); pokaz(); }
      $("[data-dalej]", o).onclick = dalej;
      $("[data-pomin]", o).onclick = () => { clearInterval(pisanie); o.remove(); document.removeEventListener("keydown", kl); gotowe(); };
      const kl = (e) => { if (!document.body.contains(o)) return document.removeEventListener("keydown", kl); if (e.key === "Enter" || e.key === " ") { e.preventDefault(); dalej(); } };
      document.addEventListener("keydown", kl);
      o.addEventListener("click", (e) => { if (!e.target.closest("button")) dalej(); });
      pokaz(); $("[data-dalej]", o).focus();
    });
  }

  function lekcja(id, nazwa) {
    const url = `${F.lekcje}#${id}`;
    const o = okno(`<div class="ramka-g"><button class="glowny" data-x>← Wróć do misji</button><b>${esc(nazwa)}</b><a href="${url}" target="_blank" rel="noopener">Otwórz w nowym oknie ↗</a></div><iframe src="${url}" title="${esc(nazwa)}"></iframe>`, "nak-ramka");
    $("[data-x]", o).onclick = () => o.remove();
  }

  /* ---------- Szkielet strony ---------- */
  function szkielet(widok) {
    document.body.dataset.m = S.motyw || "det";
    const st = stopien(), nast = F.progi[st + 1];
    const pas = nast ? Math.round((S.xp - F.progi[st]) / (nast - F.progi[st]) * 100) : 100;
    app.innerHTML = `
      <header class="gora">
        <div class="logo"><b>${esc(M().agencja)}</b><span>${esc(M().sprawa)} · ${esc(rozdzialAkt().nazwa)}</span></div>
        <div class="gracz" title="${S.xp} XP">
          <div class="mini">${awatar(S.awatar, 44)}</div>
          <div><b>${esc(S.gracz ? S.gracz.n : "Gość")}</b>${S.gracz && S.gracz.k ? ` <small>${esc(S.gracz.k)}${S.gracz.g ? " gr " + esc(S.gracz.g) : ""}</small>` : ""}<br>
          ${S.nauczyciel ? `<span class="stopien">👩‍🏫 nauczyciel</span>` : `<span class="stopien">${esc(nazwaStopnia(st))}</span>`} <span class="xp">${S.xp} XP</span>
          <span class="pasek"><i style="width:${pas}%"></i></span></div>
        </div>
        <div class="przyciski">
          <span id="chmura" class="chmura"></span>
          ${dozwolone().length > 1 ? `<button class="ikona" data-motyw title="Zmień klimat fabuły" aria-label="Zmień klimat fabuły">🎭</button>` : ""}
          <button class="ikona" data-dzwiek title="Dźwięk" aria-label="Dźwięk">${S.dzwiek ? "🔊" : "🔇"}</button>
        </div>
      </header>
      <nav class="dol">
        <button data-w="mapa" aria-current="${widok === "mapa"}">🗺️ Sprawa</button>
        <button data-w="agent" aria-current="${widok === "agent"}">🕵️ Mój profil</button>
        <button data-w="ranking" aria-current="${widok === "ranking"}">🏆 Ranking</button>
      </nav>
      <main id="widok"></main>`;
    $$("nav.dol button").forEach((b) => (b.onclick = () => { dzwiek("klik"); ({ mapa, agent, ranking })[b.dataset.w](); }));
    if ($("[data-motyw]")) $("[data-motyw]").onclick = wyborMotywu;
    $("[data-dzwiek]").onclick = () => { S.dzwiek = !S.dzwiek; zapisz(); $("[data-dzwiek]").textContent = S.dzwiek ? "🔊" : "🔇"; dzwiek("ok"); };
    ustawChmure(chmuraStan);
    return $("#widok");
  }

  /* ---------- Start: wybór klimatu i logowanie ---------- */
  function dozwolone() {
    const d = S.klasa && Array.isArray(S.klasa.dm) ? S.klasa.dm.filter((k) => F.motywy[k]) : [];
    return d.length ? d : Object.keys(F.motywy);
  }
  function ustawKlase(m, dm, od, kom) {   // ustawienia klasy z arkusza nauczyciela
    S.klasa = { m: F.motywy[m] ? m : "", dm: Array.isArray(dm) ? dm : [], od: S.nauczyciel && S.nauczyciel.wszystko ? "" : od || "", kom: kom || "" };
    const dz = dozwolone();
    if (!S.motyw || !dz.includes(S.motyw)) { S.motyw = dz.includes(S.klasa.m) ? S.klasa.m : dz[0]; return true; }
    return false;
  }
  function kartyMotywow(wybrany) {
    return dozwolone().map((k) => [k, F.motywy[k]]).map(([k, m]) => `
      <button class="motyw m-${k}" data-k="${k}" aria-pressed="${wybrany === k}">
        <div class="trio">${portret("s", k, 64)}${portret("p", k, 64)}${portret("w", k, 64)}</div>
        <b>${esc(m.nazwa)}</b><span>${esc(m.sprawa)}</span><small>${esc(m.opis)}</small>
      </button>`).join("");
  }
  function start() {
    document.body.dataset.m = S.motyw || "det";
    if (!S.gracz && !S.lokalny) {
      app.innerHTML = `<div class="start"><h1>Informatyka · klasa ${F.klasa}</h1>
        <p class="lead">Gra fabularna: ${esc(rozdzialAkt().nazwa)}. Zaloguj się kodem klasy, który poda nauczyciel.</p><div id="logowanie"></div></div>`;
      return logowanie();
    }
    if (!S.motyw) { const k = S.klasa || {}; ustawKlase(k.m, k.dm, k.od, k.kom); }
    const dom = S.klasa && S.klasa.m && F.motywy[S.klasa.m];
    app.innerHTML = `<div class="start">
      <h1>Wybierz klimat przygody</h1>
      <p class="lead">Zadania są te same, zmienia się historia, postacie i stopnie.${dom ? ` Dla Twojej klasy nauczyciel ustawił: <b>${esc(dom.nazwa)}</b>.` : ""} Klimat możesz później zmienić.</p>
      <div class="motywy">${kartyMotywow(S.motyw)}</div>
      <p style="text-align:center;margin-top:20px"><button class="glowny" data-zaczynamy>Zaczynamy ▸</button></p></div>`;
    $$(".motyw", app).forEach((b) => (b.onclick = () => { S.motyw = b.dataset.k; zapisz(); dzwiek("klik"); start(); }));
    $("[data-zaczynamy]", app).onclick = () => { S.wybralMotyw = 1; zapisz(); dzwiek("ok"); mapa(); };
  }
  function logowanie() {
    const box = $("#logowanie");
    box.innerHTML = `<form class="karta login" autocomplete="off">
      <h2>Logowanie</h2>
      <div class="lekcja-teraz"></div>
      <label>Imię i pierwsza litera nazwiska<input name="n" maxlength="16" placeholder="np. Ola K." required></label>
      <label class="pole-kod">Kod klasy (poda nauczyciel)<input name="kod" maxlength="12" placeholder="np. 1A-XXXX" required style="text-transform:uppercase"></label>
      <label>PIN – 4 cyfry. Zapamiętaj go!<input name="pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="••••" required type="password"></label>
      <p class="mala">Ten sam formularz służy do logowania na innym komputerze lub telefonie. Postęp zapisuje się w chmurze nauczyciela.</p>
      <p><button class="glowny" type="submit">Wchodzę do gry ▸</button></p>
      <p class="blad" aria-live="polite"></p>
      <p${PRACOWNIA ? " hidden" : ""}><button type="button" class="link" data-lok>Graj bez konta (postęp tylko na tym urządzeniu)</button></p>
      <p><button type="button" class="link" data-naucz>👩‍🏫 Jestem nauczycielem</button></p>
    </form>`;
    const f = $("form", box), bl = $(".blad", box);
    let teraz = null;   // grupa, która według planu ma teraz lekcję – wtedy kod klasy nie jest potrzebny
    api("teraz", {}).then((r) => {
      if (!r || !r.k || String(r.k).charAt(0) !== String(F.klasa) || !document.body.contains(f)) return;
      teraz = r;
      $(".lekcja-teraz", box).innerHTML = `<p class="info">📚 Trwa lekcja: <b>${esc(r.k)}${r.g ? " gr " + esc(r.g) : ""}</b>. Kodu klasy nie trzeba wpisywać.
        <br><small>Jeśli nie jesteś z tej grupy, wpisz kod od nauczyciela.</small></p>`;
      f.kod.required = false; f.kod.placeholder = "nie trzeba – trwa lekcja";
    }).catch(() => {});
    $("[data-naucz]", box).onclick = () => logowanieNauczyciela(box);
    $("[data-lok]", box).onclick = () => {
      const n = f.n.value.trim();
      if (S.nauczyciel) S = NOWY();
      S.lokalny = true; S.gracz = n ? { n: n.slice(0, 16) } : null; S.klasa = null; zapisz(); start();
    };
    f.onsubmit = async (e) => {
      e.preventDefault();
      const n = f.n.value.trim().replace(/[<>&"]/g, "").slice(0, 16), kod = f.kod.value.trim().toUpperCase(), pin = f.pin.value.trim();
      if (n.length < 2) return (bl.textContent = "Wpisz imię i pierwszą literę nazwiska.");
      if (!/^\d{4}$/.test(pin)) return (bl.textContent = "PIN to dokładnie 4 cyfry.");
      bl.textContent = "Łączę z centralą…";
      try {
        const h = await sha("agencja|" + n.toLowerCase() + "|" + pin);
        const r = await api("login", !kod && teraz ? { n, h, teraz: 1, kl: F.klasa } : { n, kod, h });
        if (!r.ok) {
          bl.textContent = { kod: "Nieznany kod klasy. Sprawdź go u nauczyciela.", pin: "Zły PIN dla tej osoby w tej klasie.", blokada: "Za dużo prób. Odczekaj 10 minut.", nick: "Nieprawidłowe imię.", grupa: "To kod całej klasy. Wpisz kod swojej grupy – poda go nauczyciel.", brakLekcji: "Lekcja już się skończyła. Wpisz kod klasy od nauczyciela.", zajety: "Centrala jest zajęta. Spróbuj ponownie za chwilę." }[r.e] || "Nie udało się zalogować.";
          return;
        }
        if (S.nauczyciel) S = NOWY();   // po trybie nauczyciela uczeń zaczyna od czystego stanu
        if (r.stan) {
          try { const zs = JSON.parse(r.stan); if ((zs.xp || 0) >= (S.xp || 0)) S = Object.assign(NOWY(), zs); } catch (er) {}
        } else { S.motyw = null; S.wybralMotyw = 0; }
        S.lokalny = false; S.gracz = { n: r.n || n, k: r.k, g: r.g || "", h };
        oczysc(); S.xp = liczXP();
        ustawKlase(r.m, r.dm, r.od, r.kom);
        zapisz(); chmuraTeraz(); S.wybralMotyw ? mapa() : start();
        lekcjaGracza.t = 0; srodowisko();
      } catch (er) {
        bl.innerHTML = er.stary
          ? "Zapis w chmurze nie jest jeszcze włączony (nauczyciel musi zaktualizować skrypt). Możesz grać bez konta – postęp zostanie na tym urządzeniu."
          : "Brak połączenia z centralą. Sprawdź Internet albo graj bez konta.";
      }
    };
  }

  /* Tryb nauczyciela: hasło do panelu → wybór klasy lub grupy. Gra wygląda jak u uczniów tej grupy,
     a postęp zostaje tylko na tym urządzeniu (nie trafia do rankingu ani do arkusza). */
  function logowanieNauczyciela(box) {
    box.innerHTML = `<form class="karta login" autocomplete="off">
      <h2>👩‍🏫 Tryb nauczyciela</h2>
      <label>Hasło do panelu nauczyciela<input name="haslo" type="password" required autocomplete="current-password"></label>
      <p><button class="glowny" type="submit">Dalej ▸</button> <button type="button" class="link" data-wroc>Wróć</button></p>
      <p class="blad" aria-live="polite"></p></form>`;
    const f = $("form", box), bl = $(".blad", box);
    $("[data-wroc]", box).onclick = () => logowanie();
    f.haslo.focus();
    f.onsubmit = async (e) => {
      e.preventDefault(); bl.textContent = "Łączę z centralą…";
      try {
        const r = await api("nauczyciel", { haslo: f.haslo.value });
        if (!r.ok) { bl.textContent = { haslo: "Złe hasło.", blokada: "Za dużo prób. Odczekaj 10 minut.", brakHasla: "Najpierw ustaw hasło w arkuszu (Ustawienia, B1)." }[r.e] || "Nie udało się zalogować."; return; }
        const klasy = r.klasy.filter((k) => String(k.k).charAt(0) === String(F.klasa))
          .sort((a, b) => a.k.localeCompare(b.k) || String(a.g).localeCompare(String(b.g)));
        if (!klasy.length) { bl.textContent = `W arkuszu nie ma klas ${F.klasa}.`; return; }
        box.innerHTML = `<form class="karta login"><h2>👩‍🏫 Wybierz klasę</h2>
          <label>Klasa lub grupa<select name="k">${klasy.map((k, i) => `<option value="${i}">${esc(k.k)}${k.g ? " · grupa " + esc(k.g) : " · cała klasa"}</option>`).join("")}</select></label>
          <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="wsz" style="width:auto"> Wszystkie etapy odblokowane (do testowania)</label>
          <p class="mala">Zobaczysz grę tak jak uczniowie tej grupy. Twój postęp zostaje tylko na tym urządzeniu – nie trafia do rankingu ani do arkusza.</p>
          <p><button class="glowny" type="submit">Wchodzę ▸</button></p></form>`;
        const f2 = $("form", box);
        f2.onsubmit = (e2) => {
          e2.preventDefault();
          const k = klasy[+f2.k.value];
          if (!S.nauczyciel) S = NOWY();   // nie mieszaj postępu ucznia z tego urządzenia
          S.nauczyciel = { wszystko: f2.wsz.checked }; S.lokalny = true;
          S.gracz = { n: "Nauczyciel", k: k.k, g: k.g || "" };
          S.motyw = null; ustawKlase(k.m, k.dm, k.od, k.kom);
          oczysc(); S.xp = liczXP(); zapisz(); start();
        };
      } catch (er) { bl.textContent = er.stary ? "Zaktualizuj skrypt w arkuszu (nowa wersja ranking.gs)." : "Brak połączenia z centralą."; }
    };
  }

  function wyborMotywu() {
    const o = okno(`<h2>Wybierz klimat fabuły</h2><p class="mala">Punkty, odznaki i karty zostają. Zmienia się historia, postacie i wygląd.</p><div class="motywy">${kartyMotywow(S.motyw)}</div><p><button class="drugi" data-x>Zamknij</button></p>`, "nak-szeroka");
    $$(".motyw", o).forEach((b) => (b.onclick = () => { S.motyw = b.dataset.k; zapisz(); o.remove(); dzwiek("ok"); mapa(); }));
    $("[data-x]", o).onclick = () => o.remove();
  }

  /* ---------- Mapa sprawy ---------- */
  function mapa() {
    if (!S.motyw || (!S.gracz && !S.lokalny) || !S.wybralMotyw) return start();
    const w = szkielet("mapa");
    const ost = [...F.etapy].reverse().find(etapGotowy);
    w.innerHTML = `
      <section class="karta naglowek-sprawy">
        <div class="trio">${portret("s", S.motyw, 56)}${portret("p", S.motyw, 56)}${portret("w", S.motyw, 56)}</div>
        <div><h1>${esc(M().sprawa)}</h1><p>${esc(rozdzialAkt().nazwa)}</p>
        ${ost ? `<button class="drugi" data-przypomnij>📜 Przypomnij, co się wydarzyło</button>` : ""}</div>
      </section>
      ${S.klasa && S.klasa.kom ? `<section class="karta rozkaz"><div>${portret("s", S.motyw, 52)}</div><div><b>📨 Wiadomość od: ${esc(M().szef)}</b><p>${esc(S.klasa.kom)}</p></div></section>` : ""}
      ${dzisHTML()}
      <section id="cel-klasy"></section>
      ${wyzwanieHTML()}
      ${F.rozdzialy.map((r) => {
        const idx = F.etapy.map((e, i) => i).filter((i) => rozdzialEtapu(F.etapy[i]) === r.nr);
        if (!idx.length) return "";
        const gotowy = idx.every((i) => etapGotowy(F.etapy[i]));
        return `<details class="rozdz" ${r.nr === rozdzialAkt().nr ? "open" : ""}><summary>${esc(r.nazwa)}${gotowy ? " · ✔ ukończony" : ""}</summary>
          <ol class="sciezka">${idx.map((i) => etapLi(F.etapy[i], i)).join("")}</ol></details>`;
      }).join("")}`;
    $$(".sciezka button, [data-otworz]", w).forEach((b) => (b.onclick = () => { dzwiek("klik"); otworzEtap(F.etapy[+(b.dataset.i || b.dataset.otworz)]); }));
    const pz = $("[data-przypomnij]", w); if (pz) pz.onclick = () => scena(ost.koniec[S.motyw]);
    const wz = $("[data-wyzwanie]", w); if (wz) wz.onclick = grajWyzwanie;
    celKlasy();
    if (!S.misje.prolog && !S.widzialStart) { S.widzialStart = 1; zapisz(); otworzEtap(F.etapy[0]); }
    else if (S.klasa && S.klasa.kom && S.komWidziany !== S.klasa.kom) { S.komWidziany = S.klasa.kom; zapisz(); scena([["s", S.klasa.kom]]); }
  }

  const postep = (e) => {   // „3/6” dla niedokończonej misji
    const T = S.niedok && S.niedok[e.id]; if (!T) return "";
    const zad = e.bezPoziomu ? e.zadania.wszystkie : e.zadania[T.poziom];
    return `${Object.keys(T.odp).length}/${zad.length}`;
  };
  function dzisHTML() {   // gdy lekcje odblokowuje nauczyciel: ostatnio odblokowana misja i zaległe
    if (!S.klasa || !S.klasa.od || S.nauczyciel) return "";
    const ost = odblokowaneDo(), e = F.etapy[ost];
    const zal = F.etapy.map((x, j) => j).filter((j) => j < ost && F.etapy[j].typ === "misja" && !etapGotowy(F.etapy[j]));
    const dzis = e && e.typ === "misja" && !etapGotowy(e);
    if (!dzis && !zal.length) return "";
    return `<section class="karta dzis">${dzis ? `<div><b>🎯 Dzisiejsza misja</b><button class="glowny" data-otworz="${ost}">${esc(tytul(e))}${postep(e) ? ` · ▶ dokończ (${postep(e)})` : ""}</button></div>` : ""}
      ${zal.length ? `<div><b>⏳ Do dokończenia</b>${zal.map((j) => `<button class="drugi" data-otworz="${j}">${esc(tytul(F.etapy[j]))}${postep(F.etapy[j]) ? ` · ${postep(F.etapy[j])}` : ""}</button>`).join("")}</div>` : ""}</section>`;
  }
  function etapLi(e, i) {
    if (e.niespodzianka && !S.testy[e.id] && !(S.nauczyciel && S.nauczyciel.wszystko)) return "";   // kartkówka-niespodzianka: niewidoczna przed napisaniem
    const ok = etapGotowy(e), dost = dostepny(i), wyn = e.typ === "test" ? S.testy[e.id] : S.misje[e.id];
    const ikona = e.boss ? "💀" : e.typ === "test" ? "🎙️" : czyProlog(e) ? "📞" : "📁";
    let info = "";
    if (wyn && e.typ === "misja") info = e.bezPoziomu ? `${wyn.proc}%` : `${F.poziomy[wyn.poziom].n} · ${wyn.proc}% · proponowana ocena: <b>${wyn.ocena}</b>${moznaPoprawic(e) ? " · można poprawić" : ""}`;
    if (wyn && e.typ === "test") info = `${wyn.s}/${wyn.m} pkt (${wyn.proc}%) · proponowana ocena: <b>${ocenaTestu(wyn.s, wyn.m)}</b>${wyn.doOceny ? " · otwarte czekają na sprawdzenie" : ""}`;
    if (!wyn && e.gra && !zamknietyPrzezSzefa(i)) info = TS.run && TS.run.etap === e.id ? "<b>▶ uruchomiony – kliknij</b>" : `uruchomi ${esc(M().szef)} na lekcji`;
    if (!ok && zamknietyPrzezSzefa(i)) info = `odblokuje ${esc(M().szef)}`;
    const zaleg = !ok && S.klasa && S.klasa.od && i < odblokowaneDo();
    if (zaleg) info = `<b class="zaleg-t">⚠ zaległa – do zaliczenia</b>`;
    if (postep(e)) info = `<b class="zaleg-t">▶ dokończ: ${postep(e)} zadań</b>`;
    return `<li class="etap ${ok ? "zrob" : dost ? "dost" : "zamk"} ${e.boss ? "boss" : ""} ${zaleg ? "zaleg" : ""}">
      <button data-i="${i}" ${dost || ok ? "" : "disabled"}>
        <span class="ik">${ok ? "✔" : dost ? ikona : "🔒"}</span>
        <span class="tx"><b>${esc(tytul(e))}</b><small>${esc(e.lekcja || (e.typ === "test" ? (e.boss ? "Finał rozdziału – sprawdzian" : "Kartkówka") : czyProlog(e) ? "Prolog" : "Misja"))}${info ? " · " + info : ""}</small></span>
      </button></li>`;
  }

  async function celKlasy() {
    const box = $("#cel-klasy"); if (!box || !S.gracz || (S.lokalny && !S.nauczyciel) || !S.gracz.k) return;
    try {
      const r = await api("klasy", { n: S.gracz.n, k: S.gracz.k });
      if (!r.ok) return;
      const moja = r.klasy.find((k) => k.k === S.gracz.k); if (!moja) return;
      if (r.ja != null && r.ja !== (S.gracz.g || "")) { S.gracz.g = r.ja; S.klasa = null; }   // nauczyciel przypisał grupę w panelu
      const przed = JSON.stringify(S.klasa);
      const ust = (r.grupy || []).find((x) => x.k === S.gracz.k && x.g === (S.gracz.g || "")) || moja;   // ustawienia grupy ucznia
      const zmiana = ustawKlase(ust.m, ust.dm, ust.od, ust.kom);
      if (przed !== JSON.stringify(S.klasa)) {
        const nowy = F.etapy[odblokowaneDo()];
        const pokaz = ust.od && S.odWidziany !== ust.od && !etapGotowy(nowy);
        if (ust.od) S.odWidziany = ust.od;
        zapisz(); mapa();
        if (pokaz) { dzwiek("awans"); scena([["s", `${nowy.typ === "test" ? "Czas na" : "Misja odblokowana:"} „${tytul(nowy)}”. ${nowy.typ === "test" ? "Hasło poda nauczyciel." : "Do dzieła!"}`]]); }
        return;
      }
      if (zmiana) return mapa();
      const cel = moja.cel || 3000, pr = Math.min(100, Math.round(moja.suma / cel * 100));
      box.innerHTML = `<div class="karta cel"><b>Wspólny cel klasy ${esc(moja.k)}</b>
        <div class="duzy-pasek"><i style="width:${pr}%"></i><span>${moja.suma} / ${cel} XP</span></div>
        <small>Każdy Twój punkt przybliża całą klasę do celu. Gdy klasa go osiągnie, ${esc(M().szef)} przygotuje nagrodę.</small></div>`;
    } catch (e) {}
  }

  function otworzEtap(e) { return e.typ === "test" ? (e.gra ? klikTestGra(e) : grajTest(e)) : grajMisje(e); }

  /* ---------- Misja ---------- */
  const maxPoziom = (m) => (m && (m.maxPoziom || m.poziom)) || null;
  const moznaPoprawic = (e) => { const m = S.misje[e.id]; return !!m && !e.bezPoziomu && POZ.indexOf(maxPoziom(m)) < POZ.length - 1; };
  function wyborPoziomu(e) {
    return new Promise((ok) => {
      const poprz = S.misje[e.id], mp = POZ.indexOf(maxPoziom(poprz));
      const o = okno(`<h2>${esc(tytul(e))}</h2>
        ${poprz ? `<p class="info">Twoja ocena: <b>${poprz.ocena}</b> (${esc(F.poziomy[poprz.poziom].n)}, ${poprz.proc}%).
          ${mp < POZ.length - 1 ? "Możesz ją poprawić na <b>wyższym poziomie</b> – zostanie najwyższa ocena, a XP wzrośnie o różnicę." : "Grałeś już na najwyższym poziomie."}
          Podejście na tym samym lub niższym poziomie to trening: nie zmienia oceny ani XP.</p>` : `<p>Wybierz poziom. Zmienić go można tylko przed misją, nie w trakcie.</p>`}
        <div class="poziomy">${Object.entries(F.poziomy).map(([k, p], i) => `
          <button class="poziom p-${k}" data-k="${k}"><b>${esc(p.n)}${poprz ? (i > mp ? " · poprawa" : " · trening") : ""}</b><span>${esc(p.opis)}</span><small>${p.pkt} pkt za zadanie</small></button>`).join("")}</div>
        <p><button class="drugi" data-x>Wróć</button></p>`, "nak-szeroka");
      $$(".poziom", o).forEach((b) => (b.onclick = () => { o.remove(); dzwiek("klik"); ok(b.dataset.k); }));
      $("[data-x]", o).onclick = () => { o.remove(); ok(null); };
    });
  }

  function akta(e) {
    return new Promise((ok) => {
      const w = szkielet("mapa");
      w.innerHTML = `<section class="karta akta"><h2>📂 ${esc(M().akta)}: ${esc(tytul(e))}</h2>${e.lekcja ? `<p class="mala">${esc(e.lekcja)}</p>` : ""}
        <p>Zanim zaczniesz, przejrzyj materiały z lekcji. Wszystko, czego potrzebujesz, jest w aktach.</p>
        <div class="lista-akt">${e.lekcje.map(([id, n]) => `<button class="drugi" data-l="${id}" data-n="${esc(n)}">📄 ${esc(n)}</button>`).join("")}</div>
        ${e.animacje && window.ANIMACJE ? `<div class="lista-akt">${e.animacje.map((a) => `<button class="drugi" data-anim="${a}">🎬 ${esc(window.ANIMACJE.nazwy[a])}</button>`).join("")}</div>` : ""}
        <p><button class="glowny" data-start>Rozpocznij zadania ▸</button> <button class="link" data-x>Wróć do mapy</button></p></section>`;
      $$("[data-l]", w).forEach((b) => (b.onclick = () => lekcja(b.dataset.l, b.dataset.n)));
      $$("[data-anim]", w).forEach((b) => (b.onclick = () => window.ANIMACJE.otworz([b.dataset.anim].concat(e.animacje.filter((x) => x !== b.dataset.anim)))));
      $("[data-start]", w).onclick = () => ok(true);
      $("[data-x]", w).onclick = () => ok(false);
    });
  }

  // Niedokończona misja (S.niedok[id]: poziom, odp {nr: [dobrze, podpowiedzi, pkt]}, h {nr: podpowiedzi}) zapisuje się
  // po każdym zadaniu – uczeń wraca do niej na tym samym poziomie (bez zaczynania od nowa) i może pomijać zadania.
  async function grajMisje(e) {
    S.niedok = S.niedok || {};
    let T = S.niedok[e.id];
    if (!T) {
      let poziom = "rekrut";
      if (!e.bezPoziomu) { poziom = await wyborPoziomu(e); if (!poziom) return mapa(); }
      await scena(e.wstep[S.motyw]);
      if (!(await akta(e))) return mapa();
      T = S.niedok[e.id] = { poziom, odp: {}, h: {}, t: Date.now() };
    }
    const poziom = T.poziom;
    S.trwa = { id: e.id, poziom, t: Date.now() }; zapisz();
    const zad = e.bezPoziomu ? e.zadania.wszystkie : e.zadania[poziom];
    const pkt = e.bezPoziomu ? 10 : F.poziomy[poziom].pkt;
    const wolne = () => zad.map((_, i) => i).filter((i) => !T.odp[i]);
    let i = wolne()[0];
    while (i != null) {
      const w = wolne(), nr = i;
      const r = await zadanie(e, zad[nr], nr, zad.length, pkt, Object.values(T.odp).reduce((a, x) => a + x[2], 0), false, {
        odp: T.odp, h: T.h[nr] || 0, pomin: w.length > 1, ostatnie: w.length === 1, poziom, kalk0: !!(T.k && T.k[nr]),
        podp: (n) => { T.h[nr] = n; zapisz(); }, kalkuj: () => { (T.k = T.k || {})[nr] = 1; zapisz(); },
        wynik: (x) => { T.odp[nr] = x; T.t = S.trwa.t = Date.now(); zapisz(); } });
      if (r === null) { delete S.trwa; zapisz(); return mapa(); }   // wyjście – odpowiedzi zostają w S.niedok
      const w2 = wolne();
      i = r.idz != null && w2.includes(r.idz) ? r.idz : w2.find((j) => j > nr) ?? w2[0];
    }
    const wyniki = zad.map((_, j) => [T.odp[j][0], T.odp[j][1]]);
    const suma = zad.reduce((a, _, j) => a + T.odp[j][2], 0), podp = zad.reduce((a, _, j) => a + T.odp[j][1], 0);
    delete S.niedok[e.id]; delete S.trwa;
    const max = pkt * zad.length, proc = Math.round(suma / max * 100);
    const pierwszy = !S.misje[e.id];
    const xpPrzed = liczXP();
    let zagadkaXP = 0;
    if (e.zagadka && !S.zagadki[e.id]) {
      const chce = await pytanie(`🧩 ${esc(M().pomocnik)}: „Mam dla Ciebie jeszcze jedną zagadkę. Chcesz spróbować? (+15 XP, nie wpływa na ocenę)”`, "Spróbuję", "Nie teraz");
      if (chce) {
        const r = await zadanie(e, e.zagadka, 0, 1, 15, 0, true);
        if (r && r.pkt > 0) { S.zagadki[e.id] = true; zagadkaXP = 15; }
      }
    }
    await scena(e.koniec[S.motyw]);
    const przed = stopien();
    const rec = { poziom, pkt: Math.round(suma), max, proc, ocena: e.bezPoziomu ? null : ocena(poziom, proc), podp, zad: wyniki, data: new Date().toISOString() };
    let rodzaj = "pierwszy", stara = null;
    if (pierwszy) {
      S.misje[e.id] = Object.assign({}, rec, { maxPoziom: poziom, xpMax: rec.pkt, proby: [rec] });
    } else {
      const m = S.misje[e.id];
      if (!m.proby) m.proby = [{ poziom: m.poziom, pkt: m.pkt, max: m.max, proc: m.proc, ocena: m.ocena, podp: m.podp, data: m.data }];
      if (!e.bezPoziomu && POZ.indexOf(poziom) > POZ.indexOf(maxPoziom(m))) {
        rodzaj = "poprawa"; stara = m.ocena;
        m.proby.push(rec); m.maxPoziom = poziom; m.xpMax = Math.max(+(m.xpMax != null ? m.xpMax : m.pkt) || 0, rec.pkt);
        if (rec.ocena > m.ocena || (rec.ocena === m.ocena && rec.proc > m.proc)) Object.assign(m, rec);
      } else { rodzaj = "trening"; m.trening = (m.trening || 0) + 1; }
    }
    S.xp = liczXP();
    const xp = S.xp - xpPrzed;
    const nowe = [];
    if (pierwszy) [].concat(e.karta || []).forEach((k) => { if (!S.karty.includes(k)) { S.karty.push(k); nowe.push(k); } });
    F.rozdzialy.forEach((r) => {   // tajna karta rozdziału za wszystkie jego zagadki
      const z = etapyRozdzialu(r.nr).filter((x) => x.zagadka);
      if (r.tajna && z.length && z.every((x) => S.zagadki[x.id]) && !S.karty.includes(r.tajna)) { S.karty.push(r.tajna); nowe.push(r.tajna); }
    });
    zapisz();
    await podsumowanie({ e, poziom, suma: Math.round(suma), max, proc, podp, pierwszy, rodzaj, stara, xp, nowe, przed });
    mapa();
  }

  function pytanie(html, tak, nie) {
    return new Promise((ok) => {
      const o = okno(`<p>${html}</p><p><button class="glowny" data-t>${esc(tak)}</button> <button class="drugi" data-n>${esc(nie)}</button></p>`);
      $("[data-t]", o).onclick = () => { o.remove(); ok(true); };
      $("[data-n]", o).onclick = () => { o.remove(); ok(false); };
    });
  }

  /* Jedno zadanie. Zwraca {pkt, podp}, {idz: nr} / {pomin: true} (przejście do innego zadania misji) albo null (wyjście).
     nav (tylko w misji): odp – odpowiedziane zadania, h – zużyte podpowiedzi, podp(n) / wynik([dobrze, podp, pkt]) – zapis. */
  function zadanie(e, z, nr, ile, pkt, suma, bonus, nav) {
    if (z.cele && window.KONSOLA) {   // zadanie z konsolą: każdy uczeń dostaje swój cel (np. inną domenę), ten sam przy każdym otwarciu
      const cel = window.KONSOLA.wybierz(z.cele, ((S.gracz && S.gracz.n) || "") + "|" + e.id + "|" + nr), pod = (t) => String(t).split("{cel}").join(cel);
      const real = z.real && typeof z.real === "object" ? Object.fromEntries(Object.entries(z.real).map(([k, v]) => [k, pod(v)])) : z.real;
      z = Object.assign({}, z, { q: pod(z.q), fab: pod(z.fab || ""), why: pod(z.why || ""), h: (z.h || []).map(pod), real });
    }
    return new Promise((gotowe) => {
      const w = szkielet("mapa");
      let uzyte = nav ? nav.h : 0, sprawdzone = false, kalk = !!(nav && nav.kalk0);
      const przel = window.PRZELICZNIK && window.PRZELICZNIK.dotyczy(z), kalkOk = !(nav && nav.poziom === "elita");
      const kary = F.kary;
      const koszt = (n) => Math.round((1 - kary[n]) * 100);
      const stan = { wyb: null, wiele: new Set(), kol: null, para: {} };
      if (z.typ === "kolej") { let k; do { k = tasuj(z.el.map((_, i) => i)); } while (k.every((v, i) => v === i) && z.el.length > 1); stan.kol = k; }
      const kolO = z.o ? tasuj(z.o.map((_, i) => i)) : null;
      const kolR = z.r ? tasuj(z.r.map((_, i) => i)) : null;

      w.innerHTML = `<section class="karta zadanie">
        <div class="zad-gora"><span class="kropki">${bonus ? (typeof bonus === "string" ? bonus : "🧩 Zagadka dodatkowa") : nav ? Array.from({ length: ile }, (_, i) => {
          const o = nav.odp[i];
          return `<button class="${o ? (o[0] ? "b" : "b zle") : i === nr ? "a" : ""}" ${o || i === nr ? "disabled" : `data-idz="${i}"`} title="Zadanie ${i + 1}${o ? (o[0] ? " – dobrze" : " – źle") : i === nr ? " (teraz)" : " – przejdź"}">${i + 1}</button>`;
        }).join("") : Array.from({ length: ile }, (_, i) => `<i class="${i < nr ? "b" : i === nr ? "a" : ""}"></i>`).join("")}</span>
        <span class="pkt">${bonus ? "" : `${Math.round(suma)} pkt`}</span></div>
        <p class="fab">${portret("s", S.motyw, 40)}<span>${esc(tok(z.fab))}</span></p>
        ${z.typ === "klucz" ? `<p class="praktyczne">🖥️ Zadanie praktyczne – wykonaj je na komputerze</p>` : ""}
        <h2>${esc(tok(z.q))}</h2>
        ${z.wynik ? `<pre class="wynik-cmd">${esc(z.wynik)}</pre>` : ""}
        <div class="odp">${widget()}</div>
        <div class="podp-box"></div>
        <div class="wynik" aria-live="polite"></div>
        <div class="zad-p">
          <button class="drugi" data-podp>💡 Podpowiedź (−${koszt(1)}% pkt)</button>
          ${przel ? `<button class="drugi" data-przel title="Przelicz krok po kroku – bez utraty punktów">🧮 Przelicznik</button>` : ""}
          ${(z.konsola || z.real) && window.KONSOLA ? (window.KONSOLA.dostepna() ? `<button class="drugi" data-konsola title="Wiersz polecenia z prawdziwymi danymi tego komputera">🖥️ Konsola</button>`
            : `<button class="drugi" data-cmd title="Przez 2 minuty wyjście z gry do Wiersza polecenia nie jest liczone jako ucieczka">🖥 Idę do Wiersza polecenia (2 min)</button>`) : ""}
          <button class="glowny" data-spr>Sprawdź</button>
          ${nav && nav.pomin ? `<button class="drugi" data-pomin title="Wrócisz do niego, gdy rozwiążesz pozostałe">Pomiń na później ⏭</button>` : ""}
          ${bonus === "🏅 Wyzwanie tygodnia" ? "" : `<button class="link" data-x>${nav ? "Wyjdź – dokończę później" : "Przerwij misję"}</button>`}
        </div></section>`;

      function widget() {
        if (z.typ === "wybor") return kolO.map((i) => `<button class="opcja" data-o="${i}">${esc(z.o[i])}</button>`).join("");
        if (z.typ === "wiele") return `<p class="mala">Zaznacz wszystkie poprawne.</p>` + kolO.map((i) => `<button class="opcja" data-w="${i}" aria-pressed="false">☐ ${esc(z.o[i])}</button>`).join("");
        if (z.typ === "blad") return z.el.map((t, i) => `<button class="opcja kod" data-o="${i}">${esc(t)}</button>`).join("");
        if (z.typ === "kolej") return `<ol class="kolej"></ol>`;
        if (z.typ === "para") return `<div class="pary">${z.l.map((t, i) => `<label class="para"><span>${esc(t)}</span><select data-p="${i}"><option value="">— wybierz —</option>${kolR.map((j) => `<option value="${j}">${esc(z.r[j])}</option>`).join("")}</select></label>`).join("")}</div>`;
        return `<input class="wpis" placeholder="${esc(z.ph || "")}" autocomplete="off" spellcheck="false">`;
      }
      function rysujKolej() {
        const ol = $(".kolej", w); if (!ol) return;
        // przeciąganie myszą lub palcem; z klawiatury: strzałki ↑/↓ przesuwają zaznaczony element
        ol.innerHTML = stan.kol.map((ix, p) => `<li tabindex="0" data-p="${p}" aria-label="${esc(z.el[ix])}, miejsce ${p + 1}. Przeciągnij albo przesuń strzałkami."><span>${esc(z.el[ix])}</span><span class="uchwyt" aria-hidden="true">⠿</span></li>`).join("");
        $$("li", ol).forEach((li) => {
          li.onkeydown = (ev) => {
            if (sprawdzone) return;
            const p = +li.dataset.p, q = ev.key === "ArrowUp" ? p - 1 : ev.key === "ArrowDown" ? p + 1 : -1;
            if (q < 0 || q >= stan.kol.length) return;
            ev.preventDefault(); [stan.kol[p], stan.kol[q]] = [stan.kol[q], stan.kol[p]]; rysujKolej(); $(`li[data-p="${q}"]`, ol).focus();
          };
          li.onpointerdown = (ev) => {
            if (sprawdzone || ev.button > 0) return;
            ev.preventDefault(); li.classList.add("ciagnie");
            const ruch = (m) => {
              const za = $$("li", ol).filter((x) => x !== li).find((x) => { const r = x.getBoundingClientRect(); return m.clientY < r.top + r.height / 2; });
              if (za !== li.nextElementSibling) ol.insertBefore(li, za || null);
            };
            const koniec = () => {
              removeEventListener("pointermove", ruch); removeEventListener("pointerup", koniec); removeEventListener("pointercancel", koniec);
              const stary = stan.kol.slice(); stan.kol = $$("li", ol).map((x) => stary[+x.dataset.p]); rysujKolej();
            };
            addEventListener("pointermove", ruch); addEventListener("pointerup", koniec); addEventListener("pointercancel", koniec);
          };
        });
      }
      rysujKolej();
      $$("[data-o]", w).forEach((b) => (b.onclick = () => { if (sprawdzone) return; stan.wyb = +b.dataset.o; $$("[data-o]", w).forEach((x) => x.setAttribute("aria-pressed", x === b)); }));
      $$("[data-w]", w).forEach((b) => (b.onclick = () => {
        if (sprawdzone) return; const i = +b.dataset.w;
        stan.wiele.has(i) ? stan.wiele.delete(i) : stan.wiele.add(i);
        b.setAttribute("aria-pressed", stan.wiele.has(i)); b.textContent = (stan.wiele.has(i) ? "☑ " : "☐ ") + z.o[i];
      }));
      $$("[data-p]", w).forEach((s) => (s.onchange = () => { stan.para[s.dataset.p] = s.value; }));
      const wp = $(".wpis", w); if (wp) { wp.focus(); wp.onkeydown = (ev) => { if (ev.key === "Enter") $("[data-spr]", w).click(); }; }

      const bp = $("[data-podp]", w);
      const pokazPodp = (n) => {
        $(".podp-box", w).insertAdjacentHTML("beforeend", `<div class="podp">${portret("p", S.motyw, 36)}<span><b>${esc(M().pomocnik)}:</b> ${esc(tok(z.h[n - 1]))}</span></div>`);
        if (n >= z.h.length || n >= kary.length - 1) { bp.disabled = true; bp.textContent = "💡 Brak kolejnych podpowiedzi"; }
        else bp.textContent = `💡 Kolejna podpowiedź (łącznie −${koszt(n + 1)}% pkt)`;
      };
      for (let n = 1; n <= uzyte; n++) pokazPodp(n);   // podpowiedzi wzięte przed pominięciem zadania
      bp.onclick = () => {
        if (sprawdzone || uzyte >= z.h.length) return;
        uzyte++; dzwiek("klik"); pokazPodp(uzyte);
        if (nav) nav.podp(uzyte);
      };
      $$("[data-idz]", w).forEach((b) => (b.onclick = () => gotowe({ idz: +b.dataset.idz })));
      const ks = $("[data-konsola]", w); if (ks) ks.onclick = () => window.KONSOLA.otworz({ podpowiedz: tok(z.q) });
      const kc = $("[data-cmd]", w); if (kc) kc.onclick = () => { window.AGENCJA_CMD(2);
        dymek("🖥 Masz 2 minuty: <b>Win + R</b> → wpisz <b>cmd</b> → Enter. Wykonaj polecenie, wróć do gry i wpisz wynik."); };
      const pr = $("[data-przel]", w);   // kreator bez kary; kalkulator (wynik od razu) −25% za zadanie, na poziomie Elita niedostępny
      if (pr) pr.onclick = () => window.PRZELICZNIK.otworz({ kalkulator: kalkOk && !sprawdzone, kara: kalk ? "już użyty – kara naliczona" : "−25% pkt w tym zadaniu",
        kalk: () => { if (kalk) return; kalk = true; if (nav && nav.kalkuj) nav.kalkuj(); } });
      const pm = $("[data-pomin]", w); if (pm) pm.onclick = () => gotowe({ pomin: true });
      if ($("[data-x]", w)) $("[data-x]", w).onclick = async () => {
        if (nav) return gotowe(null);
        if (await pytanie("Przerwać misję? Postęp w tej misji nie zostanie zapisany.", "Przerwij", "Graj dalej")) gotowe(null);
      };

      let czeka = false, tylkoFormat = false;
      $("[data-spr]", w).onclick = async () => {
        if (sprawdzone || czeka) return;
        let dobrze;
        if (z.typ === "wybor" || z.typ === "blad") { if (stan.wyb == null) return wynik("Najpierw wybierz odpowiedź.", "uwaga"); dobrze = stan.wyb === z.a; }
        else if (z.typ === "wiele") { if (!stan.wiele.size) return wynik("Zaznacz co najmniej jedną odpowiedź.", "uwaga"); dobrze = stan.wiele.size === z.a.length && z.a.every((i) => stan.wiele.has(i)); }
        else if (z.typ === "kolej") dobrze = stan.kol.every((v, i) => v === i);
        else if (z.typ === "para") { if (z.l.some((_, i) => stan.para[i] === "" || stan.para[i] == null)) return wynik("Dopasuj wszystkie elementy.", "uwaga"); dobrze = z.l.every((_, i) => +stan.para[i] === i); }
        else if (z.real) {   // odpowiedź z prawdziwych danych komputera (konsola.js); bez aplikacji – tylko format odpowiedzi
          const v = wp.value.trim(); if (!v) return wynik("Wpisz odpowiedź.", "uwaga");
          czeka = true; wynik("⏳ Sprawdzam z danymi Twojego komputera…", "uwaga");
          const r = await window.KONSOLA.sprawdz(z.real, v); czeka = false;
          if (r === null) { tylkoFormat = true; dobrze = (!z.wzor || new RegExp(z.wzor, "i").test(v)) && window.KONSOLA.wiarygodne(z.real, v, S.dane || {}); } else dobrze = r;
          if (dobrze && typeof z.real === "string") { S.dane = S.dane || {}; S.dane[z.real] = v; }
        }
        else { const v = norm(wp.value); if (!v) return wynik("Wpisz odpowiedź.", "uwaga"); dobrze = z.ok.some((x) => norm(x) === v); }
        sprawdzone = true;
        const zdobyte = dobrze ? pkt * kary[Math.min(uzyte, kary.length - 1)] * (kalk ? 0.75 : 1) : 0;
        if (nav) { nav.wynik([dobrze ? 1 : 0, uzyte, zdobyte]); if (pm) pm.remove(); }
        dzwiek(dobrze ? "ok" : "zle");
        // pokaż poprawne
        if (z.typ === "wybor" || z.typ === "blad") $$("[data-o]", w).forEach((b) => { const i = +b.dataset.o; if (i === z.a) b.classList.add("dobra"); else if (i === stan.wyb) b.classList.add("zla"); });
        if (z.typ === "wiele") $$("[data-w]", w).forEach((b) => { const i = +b.dataset.w; if (z.a.includes(i)) b.classList.add("dobra"); else if (stan.wiele.has(i)) b.classList.add("zla"); });
        if (z.typ === "para") $$("[data-p]", w).forEach((s) => { s.disabled = true; s.classList.add(+s.value === +s.dataset.p ? "dobra" : "zla"); });
        if (wp) wp.disabled = true;
        bp.disabled = true;
        wynik(`${dobrze ? `✔ Dobrze! +${Math.round(zdobyte * 10) / 10} pkt${uzyte ? ` (podpowiedzi: ${uzyte})` : ""}${kalk ? " (kalkulator −25%)" : ""}` : "✘ Niestety, to nie to."}<br><small>${esc(tok(z.why))}</small>${tylkoFormat ? `<br><small>ℹ Sprawdzono, czy odpowiedź ma sens. Każdy komputer ma inne dane – nauczyciel widzi, gdy dwie osoby wpiszą to samo.</small>` : ""}`, dobrze ? "dobrze" : "zle");
        const b = $("[data-spr]", w); b.textContent = (nav ? !nav.ostatnie : nr + 1 < ile) ? "Dalej ▸" : "Zakończ ▸";
        b.onclick = () => gotowe({ pkt: zdobyte, podp: uzyte });
        b.focus();
        if (dobrze) w.querySelector(".zadanie").classList.add("blysk");
      };
      function wynik(html, kl) { const e2 = $(".wynik", w); e2.className = "wynik " + kl; e2.innerHTML = html; }
    });
  }

  /* ---------- Kartkówka / sprawdzian ---------- */
  async function grajTest(e) {
    const poprz = S.testy[e.id];
    if (poprz) {
      const t = await pytanie(`<b>${esc(tytul(e))}</b><br>Twój wynik: ${poprz.s}/${poprz.m} (${poprz.proc}%), proponowana ocena: <b>${ocenaTestu(poprz.s, poprz.m)}</b>. Test można napisać tylko raz.`, "Obejrzyj scenę końcową", "Wróć");
      if (t) await scena(e.koniec[S.motyw]);
      return mapa();
    }
    await scena(e.wstep[S.motyw]);
    let id = e.test;
    if (Array.isArray(e.test)) {
      id = await new Promise((ok) => {
        const o = okno(`<h2>Którą grupę piszesz?</h2><p>Nauczyciel powie Ci, czy masz grupę A, czy B.</p><p class="poziomy">${e.test.map((t, i) => `<button class="glowny" data-t="${t}">Grupa ${"AB"[i]}</button>`).join(" ")}</p><p><button class="link" data-x>Wróć</button></p>`);
        $$("[data-t]", o).forEach((b) => (b.onclick = () => { o.remove(); ok(b.dataset.t); }));
        $("[data-x]", o).onclick = () => { o.remove(); ok(null); };
      });
      if (!id) return mapa();
    }
    otwartyTest = e.id;
    const wyn = await new Promise((ok) => {
      const url = `${F.testy}#${id}`;
      const o = okno(`<div class="ramka-g"><button class="drugi" data-x>✕ Zamknij</button><b>${esc(tytul(e))}</b><span class="mala">Hasło poda nauczyciel</span></div><iframe src="${url}" title="${esc(tytul(e))}"></iframe>`, "nak-ramka");
      const ifr = $("iframe", o);
      const sl = (m) => {
        if (m.source !== ifr.contentWindow || !m.data || m.data.agencja !== "wynik") return;
        if (S.testy[e.id]) return;
        S.testy[e.id] = { test: m.data.id || id, s: +m.data.s || 0, m: +m.data.m || 1, data: new Date().toISOString() };
        S.testy[e.id].proc = Math.round(S.testy[e.id].s / S.testy[e.id].m * 100);
        zapisz();
        const zam = $("[data-x]", o); zam.textContent = "Dalej ▸"; zam.className = "glowny";
      };
      addEventListener("message", sl);
      $("[data-x]", o).onclick = () => { removeEventListener("message", sl); o.remove(); otwartyTest = ""; ok(S.testy[e.id] || null); };
    });
    if (!wyn) return mapa();
    await scena(e.koniec[S.motyw]);
    const przed = stopien(), xpPrzed = S.xp; S.xp = liczXP(); const xp = S.xp - xpPrzed;
    const nowe = [];
    [].concat(e.karta || []).forEach((k) => { if (!S.karty.includes(k)) { S.karty.push(k); nowe.push(k); } });
    zapisz();
    if (e.boss) konfetti();
    await podsumowanie({ e, test: true, suma: wyn.s, max: wyn.m, proc: wyn.proc, pierwszy: true, xp, nowe, przed });
    mapa();
  }

  /* ---------- Podsumowanie i nagrody ---------- */
  function kartaHTML(id, odkryta = true, nowa = false) {
    const k = F.karty[id];
    if (!odkryta) return `<div class="kartaD zakryta"><span>?</span><small>${k.tajna ? "Tajna karta" : "Nieodkryta"}</small></div>`;
    return `<div class="kartaD ${nowa ? "nowa" : ""}"><small>${esc(M().dowod)} #${id.slice(1)}</small><b>${esc(k.t[S.motyw] || k.t.det)}</b><p>${esc(tok(k.f))}</p></div>`;
  }
  function odblokowane(st0, st1) {
    const r = [];
    Object.values(F.awatar.sloty).forEach((lista) => lista.forEach((p) => { if (p.wym && p.wym.stopien != null && p.wym.stopien > st0 && p.wym.stopien <= st1) r.push(p.n); }));
    return r;
  }
  function podsumowanie(d) {
    return new Promise((ok) => {
      const po = stopien(), awans = po > d.przed;
      const oc = d.test ? ocenaTestu(d.suma, d.max) : !d.e.bezPoziomu ? ocena(d.poziom, d.proc) : null;
      const zost = !d.test && S.misje[d.e.id] ? S.misje[d.e.id].ocena : oc;
      const o = okno(`<h2>${d.test ? "Wynik" : d.e.id === "wyzwanie" ? "Wyzwanie zakończone" : "Misja zakończona"}: ${esc(tytul(d.e))}</h2>
        <div class="podsum">
          <div class="duza-liczba">${d.proc}%</div>
          <div>${d.test ? `${d.suma} / ${d.max} pkt` : `${d.suma} / ${d.max} pkt${d.e.bezPoziomu ? "" : ` · poziom ${esc(F.poziomy[d.poziom].n)}`}${d.podp ? ` · podpowiedzi: ${d.podp}` : ""}`}
          ${oc == null ? "" : d.test || d.rodzaj === "pierwszy" ? `<br>Proponowana ocena: <b class="ocena">${oc}</b> <small>(ostatecznie decyduje nauczyciel)</small>`
            : d.rodzaj === "poprawa" ? `<br>Poprawa: ${oc} (wcześniej ${d.stara}). Zostaje wyższa: <b class="ocena">${zost}</b>`
            : `<br><small>Trening – ocena się nie zmienia (zostaje ${zost}). Poprawa jest możliwa tylko na wyższym poziomie.</small>`}
          <br><b>+${d.xp} XP</b></div>
        </div>
        ${awans ? `<div class="awans">⭐ Awans! Nowy stopień: <b>${esc(nazwaStopnia(po))}</b>${odblokowane(d.przed, po).length ? `<br><small>Odblokowano: ${esc(odblokowane(d.przed, po).join(", "))}</small>` : ""}</div>` : ""}
        ${d.nowe.length ? `<h3>Nowe w kolekcji „${esc(M().kolekcja)}”</h3><div class="karty">${d.nowe.map((k) => kartaHTML(k, true, true)).join("")}</div>` : ""}
        <p><button class="glowny" data-x>Wróć do sprawy ▸</button></p>`, "nak-szeroka");
      if (awans) { konfetti(); dzwiek("awans"); } else if (d.nowe.length) dzwiek("karta");
      $("[data-x]", o).onclick = () => { o.remove(); ok(); };
    });
  }

  /* ---------- Profil: awatar, kolekcja, wyniki ---------- */
  function wymOk(p) {
    if (!p.wym) return true;
    if (p.wym.stopien != null) return stopien() >= p.wym.stopien;
    if (p.wym.karta) return S.karty.includes(p.wym.karta);
    return true;
  }
  function wymTxt(p) {
    if (p.wym.stopien != null) return "Stopień: " + nazwaStopnia(p.wym.stopien);
    if (p.wym.karta) return "Karta: " + (F.karty[p.wym.karta].t[S.motyw] || "");
    return "";
  }
  function agent() {
    const w = szkielet("agent");
    const A = F.awatar, st = stopien(), nast = F.progi[st + 1];
    const SL = { glowa: "Nakrycie głowy", stroj: "Strój", dodatek: "Dodatek", tlo: "Tło" };
    w.innerHTML = `
      <section class="karta profil">
        <div class="duzy-awatar">${awatar(S.awatar, 160)}</div>
        <div><h2>${esc(S.gracz ? S.gracz.n : "Gość")}</h2>
          <p><span class="stopien">${esc(nazwaStopnia(st))}</span> · ${S.xp} XP${nast ? ` · do awansu: ${nast - S.xp} XP` : " · najwyższy stopień!"}</p>
          <p class="mala">${S.nauczyciel ? `👩‍🏫 Tryb nauczyciela · klasa ${esc(S.gracz.k)}${S.gracz.g ? ", grupa " + esc(S.gracz.g) : ""}${S.nauczyciel.wszystko ? " · wszystkie etapy odblokowane" : ""}. Postęp tylko na tym urządzeniu.` : S.lokalny ? "Postęp zapisany tylko na tym urządzeniu." : S.gracz && S.gracz.k ? `Klasa ${esc(S.gracz.k)}${S.gracz.g ? ", grupa " + esc(S.gracz.g) : ""} · postęp zapisany w chmurze.` : ""}</p>
          <p>${S.nauczyciel ? `<button class="drugi" data-zmienk>Zmień klasę</button> <a href="https://bobby6robert.github.io/agencja-informatyka/panel/" target="_blank" rel="noopener">Panel ↗</a> · <a href="https://bobby6robert.github.io/agencja-informatyka/prowadzenie/" target="_blank" rel="noopener">Prowadzenie lekcji ↗</a>`
            : S.lokalny ? `<button class="drugi" data-polacz>☁ Połącz z kontem klasy</button>` : ""} <button class="link" data-wyloguj>Wyloguj</button></p>
        </div>
      </section>
      <section class="karta"><h2>Wygląd</h2>
        <div class="slot"><b>Skóra</b><div class="kolory">${A.skora.map((c, i) => `<button class="kolor" style="background:${c}" data-s="skora" data-v="${i}" aria-pressed="${(S.awatar.skora || 0) === i}" aria-label="Kolor skóry ${i + 1}"></button>`).join("")}</div></div>
        <div class="slot"><b>Włosy</b><div class="kolory">${A.wlosy.map((c, i) => `<button class="kolor" style="background:${c}" data-s="wlosy" data-v="${i}" aria-pressed="${(S.awatar.wlosy || 0) === i}" aria-label="Kolor włosów ${i + 1}"></button>`).join("")}</div></div>
        ${Object.entries(A.sloty).map(([s, lista]) => `<div class="slot"><b>${SL[s]}</b><div class="przedmioty">${lista.map((p) => {
          const ok = wymOk(p);
          return `<button class="przedmiot" data-s="${s}" data-v="${p.id}" ${ok ? "" : "disabled"} aria-pressed="${S.awatar[s] === p.id}" title="${ok ? "" : esc(wymTxt(p))}">${ok ? "" : "🔒 "}${esc(p.n)}${ok ? "" : `<small>${esc(wymTxt(p))}</small>`}</button>`;
        }).join("")}</div></div>`).join("")}
      </section>
      <section class="karta"><h2>${esc(M().kolekcja)} (${S.karty.length}/${Object.keys(F.karty).length})</h2>
        <div class="karty">${Object.keys(F.karty).map((k) => kartaHTML(k, S.karty.includes(k))).join("")}</div>
        <p class="mala">Tajną kartę rozdziału zdobędziesz, rozwiązując wszystkie jego zagadki dodatkowe.</p>
      </section>
      <section class="karta"><h2>Moje wyniki</h2><table class="tabela"><tr><th>Etap</th><th>Poziom</th><th>Wynik</th><th>Proponowana ocena</th></tr>
        ${F.etapy.map((e, i) => { const m = e.typ === "test" ? S.testy[e.id] : S.misje[e.id];
          const nag = F.rozdzialy.length > 1 && (i === 0 || rozdzialEtapu(F.etapy[i - 1]) !== rozdzialEtapu(e)) ? `<tr><th colspan="4">${esc(R(rozdzialEtapu(e)).nazwa)}</th></tr>` : "";
          if (!m && rozdzialEtapu(e) > rozdzialAkt().nr) return "";
          return nag + `<tr><td>${esc(tytul(e))}</td><td>${m && m.poziom && !e.bezPoziomu ? esc(F.poziomy[m.poziom].n) : e.typ === "test" ? (e.boss ? "Sprawdzian" : "Kartkówka") : "–"}</td><td>${m ? (e.typ === "test" ? `${m.s}/${m.m} (${m.proc}%)` : `${m.proc}%`) : "–"}</td><td>${m && m.ocena ? `<b>${m.ocena}</b>${m.proby && m.proby.length > 1 ? " <small>(po poprawie)</small>" : ""}` : m && e.typ === "test" ? `<b>${ocenaTestu(m.s, m.m)}</b>` : "–"}</td></tr>`; }).join("")}
      </table></section>
      <section class="karta"><h2>🎓 Dyplomy</h2>${F.rozdzialy.filter((r) => r.nr <= rozdzialAkt().nr).map((r) => {
        const et = etapyRozdzialu(r.nr), ile = et.filter(etapGotowy).length;
        return ile === et.length
          ? `<p><b>${esc(r.nazwa)}</b> – ukończony! <button class="glowny" data-dyplom="${r.nr}">Pobierz dyplom (PNG)</button></p>`
          : `<p class="mala"><b>${esc(r.nazwa)}</b> – dyplom po ukończeniu wszystkich etapów (${ile}/${et.length}).</p>`;
      }).join("")}</section>`;
    $$("[data-s]", w).forEach((b) => (b.onclick = () => {
      const s = b.dataset.s; S.awatar[s] = s === "skora" || s === "wlosy" ? +b.dataset.v : b.dataset.v; zapisz(); dzwiek("klik"); agent();
    }));
    $$("[data-dyplom]", w).forEach((b) => (b.onclick = () => dyplom(+b.dataset.dyplom)));
    const pl = $("[data-polacz]", w); if (pl) pl.onclick = () => { S.lokalny = false; S.gracz = null; zapisz(); start(); };
    const zk = $("[data-zmienk]", w); if (zk) zk.onclick = () => { S.gracz = null; S.lokalny = false; zapisz(); start(); setTimeout(() => { const b = $("[data-naucz]"); if (b) b.click(); }, 0); };
    $("[data-wyloguj]", w).onclick = async () => {
      if (!(await pytanie(S.lokalny ? "Wylogować? Postęp gry bez konta zostanie usunięty z tego urządzenia." : "Wylogować z tego urządzenia? Postęp zostaje w chmurze.", "Wyloguj", "Anuluj"))) return;
      await chmuraTeraz().catch(() => {});
      const m = S.motyw; S = NOWY(); S.motyw = m; zapisz(); start();
    };
  }

  /* ---------- Wyzwanie tygodnia ---------- */
  function wyzwanieDzis() { const t = tydzien(); return { t, z: F.wyzwania[t.n % F.wyzwania.length] }; }
  function wyzwanieHTML() {
    if (!F.wyzwania || !F.wyzwania.length) return "";
    const { t } = wyzwanieDzis(), w = (S.wyzwania || {})[t.id];
    return `<section class="karta wyzwanie"><div><b>🏅 Wyzwanie tygodnia</b><br><small>${w ? `Wykonane: ${Math.round(w.pkt)} / 30 pkt. Nowe wyzwanie w poniedziałek.` : "Jedno podejście, do 30 XP. Osobny ranking tygodnia."}</small></div>
      ${w ? "" : `<button class="glowny" data-wyzwanie>Podejmij ▸</button>`}</section>`;
  }
  async function grajWyzwanie() {
    const { t, z } = wyzwanieDzis();
    if ((S.wyzwania || {})[t.id]) return;
    if (!(await pytanie("🏅 Wyzwanie tygodnia: masz <b>jedno podejście</b>. Podpowiedzi obniżają punkty. Zaczynamy?", "Zaczynam", "Później"))) return;
    const przed = stopien(), xpPrzed = liczXP();
    S.wyzwania = S.wyzwania || {};
    S.wyzwania[t.id] = { pkt: 0, t: Date.now() };   // zapis przed startem: odświeżenie strony nie da drugiej szansy
    zapisz();
    const r = await zadanie(null, z, 0, 1, 30, 0, "🏅 Wyzwanie tygodnia");
    S.wyzwania[t.id] = { pkt: r ? Math.round(r.pkt) : 0, t: Date.now() };
    S.xp = liczXP(); zapisz();
    await podsumowanie({ e: { id: "wyzwanie", tytul: { det: "Wyzwanie tygodnia" }, bezPoziomu: true }, suma: S.wyzwania[t.id].pkt, max: 30,
      proc: Math.round(S.wyzwania[t.id].pkt / 30 * 100), pierwszy: true, rodzaj: "pierwszy", xp: S.xp - xpPrzed, nowe: [], przed });
    mapa();
  }

  /* ---------- Dyplom (PNG) ---------- */
  async function dyplom(nr) {
    const W = 1600, H = 1130, c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d"), st = getComputedStyle(document.body);
    const akc = st.getPropertyValue("--akc").trim() || "#fca311", tlo = st.getPropertyValue("--panel").trim() || "#16213e";
    x.fillStyle = tlo; x.fillRect(0, 0, W, H);
    x.strokeStyle = akc; x.lineWidth = 14; x.strokeRect(30, 30, W - 60, H - 60); x.lineWidth = 3; x.strokeRect(58, 58, W - 116, H - 116);
    const img = await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null);
      i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(awatar(S.awatar, 320).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')); });
    if (img) x.drawImage(img, 110, 250, 320, 320);
    const sr = W / 2 + 120;
    x.textAlign = "center";
    x.font = "bold 92px Georgia, serif"; x.fillStyle = akc; x.fillText("DYPLOM", sr, 190);
    x.fillStyle = "#e8edf5"; x.font = "34px Segoe UI, sans-serif"; x.fillText(M().agencja + " · " + M().sprawa, sr, 250);
    x.font = "30px Segoe UI, sans-serif"; x.fillText("przyznaje", sr, 320);
    x.font = "bold 72px Segoe UI, sans-serif"; x.fillStyle = "#fff"; x.fillText((S.gracz && S.gracz.n) || "Agent", sr, 405);
    x.font = "34px Segoe UI, sans-serif"; x.fillStyle = "#e8edf5";
    x.fillText(`klasa ${(S.gracz && S.gracz.k) || "–"} · stopień: ${nazwaStopnia(stopien())} · ${S.xp} XP`, sr, 465);
    x.fillText(`za ukończenie: ${R(nr).nazwa}`, sr, 520);
    x.textAlign = "left"; x.font = "28px Segoe UI, sans-serif"; let y = 640;
    etapyRozdzialu(nr).forEach((e) => {
      const m = e.typ === "test" ? S.testy[e.id] : S.misje[e.id]; if (!m) return;
      const oc = e.typ === "test" ? ocenaTestu(m.s, m.m) : m.ocena;
      x.fillStyle = "#e8edf5"; x.fillText(tytul(e), 520, y);
      x.fillStyle = akc; x.fillText(`${m.proc}%${oc ? " · ocena " + oc : ""}${m.poziom && !e.bezPoziomu ? " · " + F.poziomy[m.poziom].n : ""}`, 1080, y); y += 46;
    });
    x.fillStyle = "#e8edf5"; x.fillText(`${M().kolekcja}: ${S.karty.length}/${Object.keys(F.karty).length}`, 520, y + 10);
    x.textAlign = "center"; x.font = "26px Segoe UI, sans-serif";
    x.fillText(new Date().toLocaleDateString("pl-PL"), 270, 1010);
    x.beginPath(); x.moveTo(1120, 990); x.lineTo(1460, 990); x.strokeStyle = "#e8edf5"; x.lineWidth = 2; x.stroke();
    x.fillText(M().szef, 1290, 1030);
    const a = document.createElement("a"); a.download = "dyplom-" + ((S.gracz && S.gracz.n) || "agent").replace(/[^a-z0-9ąćęłńóśźż]+/gi, "-") + ".png";
    a.href = c.toDataURL("image/png"); document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- Ranking ---------- */
  async function ranking(zakladka = "klasa") {
    const w = szkielet("ranking");
    w.innerHTML = `<section class="karta"><div class="zakladki">
      <button data-z="klasa" aria-pressed="${zakladka === "klasa"}">Moja klasa</button>
      <button data-z="klasy" aria-pressed="${zakladka === "klasy"}">Rywalizacja klas</button>
      <button data-z="wyzwanie" aria-pressed="${zakladka === "wyzwanie"}">Wyzwanie tygodnia</button></div><div id="rk"><p>Wczytuję…</p></div></section>`;
    $$("[data-z]", w).forEach((b) => (b.onclick = () => ranking(b.dataset.z)));
    const box = $("#rk", w);
    if ((S.lokalny && !S.nauczyciel) || !S.gracz || !S.gracz.k) { box.innerHTML = `<p>Ranking działa po zalogowaniu kodem klasy (zapis w chmurze).</p>`; return; }
    try {
      if (zakladka === "klasa") {
        const r = await api("ranking", { k: S.gracz.k });
        if (!r.ok) throw 0;
        box.innerHTML = `<table class="tabela"><tr><th>#</th><th>Agent</th><th>Stopień</th><th>XP</th></tr>${r.gracze.map((g, i) =>
          `<tr class="${g.n === S.gracz.n ? "ja" : ""}"><td>${i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</td><td>${esc(g.n)}</td><td>${esc(nazwaStopnia(stopien(g.xp)))}</td><td>${g.xp}</td></tr>`).join("")}</table>`;
      } else if (zakladka === "wyzwanie") {
        const t = tydzien(), r = await api("wyzwanie", { k: S.gracz.k, t: t.id });
        if (!r.ok) throw 0;
        box.innerHTML = `<p class="mala">Tydzień ${esc(t.id)}. Liczą się punkty, przy remisie – kto pierwszy.</p>${r.lista.length ? `<table class="tabela"><tr><th>#</th><th>Agent</th><th>Punkty</th></tr>${r.lista.map((g, i) =>
          `<tr class="${g.n === S.gracz.n ? "ja" : ""}"><td>${i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</td><td>${esc(g.n)}</td><td>${g.pkt}</td></tr>`).join("")}</table>` : "<p>Nikt jeszcze nie podjął wyzwania w tym tygodniu. Bądź pierwszy!</p>"}`;
      } else {
        const r = await api("klasy", {});
        if (!r.ok) throw 0;
        const k = r.klasy.filter((x) => x.graczy > 0).sort((a, b) => b.srednia - a.srednia);
        box.innerHTML = `<p class="mala">Liczy się średnia XP na agenta, więc mała klasa ma równe szanse.</p><table class="tabela"><tr><th>#</th><th>Klasa</th><th>Agentów</th><th>Średnio XP</th><th>Razem XP</th></tr>${k.map((x, i) =>
          `<tr class="${x.k === S.gracz.k ? "ja" : ""}"><td>${i + 1}</td><td>${esc(x.k)}</td><td>${x.graczy}</td><td>${x.srednia}</td><td>${x.suma}</td></tr>`).join("")}</table>`;
      }
    } catch (e) { box.innerHTML = `<p>Nie udało się pobrać rankingu. Sprawdź połączenie z Internetem.</p>`; }
  }

  /* ---------- Pracownia: tryb pełnego ekranu z aplikacji i wyjścia z okna ---------- */
  // Aplikacja .exe otwiera grę z ?tryb=pracownia (Edge w trybie kiosku, klawisze zablokowane).
  // W czasie lekcji gracza każde wyjście z okna gry (dłuższe niż ~2 s) trafia do S.alarmy,
  // a S.srod mówi, czy uczeń gra w aplikacji czy w zwykłej przeglądarce – nauczyciel widzi to w Prowadzeniu lekcji.
  const PRACOWNIA = new URLSearchParams(location.search).get("tryb") === "pracownia";
  if (PRACOWNIA) document.body.classList.add("pracownia");
  let lekcjaGracza = { t: 0, jest: false }, wyjscie = null, pozaTyk = 0, otwartyTest = "";
  const uczen = () => S.gracz && !S.lokalny && !S.nauczyciel;
  function naLekcji() {   // czy klasa/grupa gracza ma teraz lekcję wg planu (sprawdzane najwyżej co 5 min)
    if (!uczen()) return Promise.resolve(false);
    if (Date.now() - lekcjaGracza.t < 300000) return Promise.resolve(lekcjaGracza.jest);
    return api("teraz", {}).then((r) => {
      lekcjaGracza = { t: Date.now(), jest: !!(r && r.k === S.gracz.k && (!r.g || !S.gracz.g || r.g === S.gracz.g)) };
      return lekcjaGracza.jest;
    }).catch(() => PRACOWNIA);
  }
  function srodowisko() {
    naLekcji().then((tak) => { if (tak && uczen()) { S.srod = { t: Date.now(), p: PRACOWNIA ? 1 : 0 }; zapisz(); } });
  }
  // Obecność dla Prowadzenia (wysyłana z zapytaniem naLekcji): gra / poza (inny program) / cmd (Wiersz polecenia w zadaniu).
  const OB = { st: "gra", od: Date.now() };
  let cmdDo = 0;   // do kiedy wyjście z gry to praca w Wierszu polecenia (przycisk w zadaniu z konsolą)
  window.AGENCJA_CMD = (min = 2) => { cmdDo = Date.now() + min * 60000; };
  window.AGENCJA_CMD_TERAZ = () => Date.now() < cmdDo;
  function stanOkna(st) { if (OB.st === st) return; OB.st = st; OB.od = Date.now(); if (uczen() && typeof burzaTyk === "function") burzaTyk(); }
  function dymek(html) {   // krótki komunikat na górze ekranu
    const d = document.createElement("div"); d.className = "dymek-info"; d.innerHTML = html; document.body.appendChild(d);
    setTimeout(() => d.remove(), 6000);
  }
  function poza(t) {
    const w = wyjscie = { t, id: (S.trwa && S.trwa.id) || otwartyTest, cmd: Date.now() < cmdDo };
    stanOkna(w.cmd ? "cmd" : "poza");
    const veyon = window.KONSOLA ? window.KONSOLA.veyon() : Promise.resolve(false);   // demonstracja Veyon (w aplikacji) to nie ucieczka z gry
    Promise.all([naLekcji(), veyon]).then(([tak, v]) => {
      if (!tak || !uczen() || v) return;
      const a = { t: w.t, id: w.id };
      if (w.cmd) a.c = 1;   // praca w Wierszu polecenia – w Prowadzeniu 🖥, nie ⚠
      if (w.k) a.s = Math.round((w.k - w.t) / 1000);
      S.alarmy = (S.alarmy || []).concat([a]).slice(-40); w.a = a; zapisz();
    });
  }
  function powrot() {
    const w = wyjscie; wyjscie = null; w.k = Date.now();
    stanOkna("gra");
    if (w.a) { w.a.s = Math.round((w.k - w.t) / 1000); zapisz(); }
    if (w.a && !w.cmd && !otwartyTest) dymek("⚠ Wyjście z gry zapisane – nauczyciel to widzi.");   // w testach własne ostrzeżenia (testy.js)
  }
  setInterval(() => {   // hasFocus() jest też prawdą, gdy uczeń klika w lekcję lub test w ramce
    if (!uczen()) return;
    const out = document.hidden || !document.hasFocus();
    if (!out) { pozaTyk = 0; if (wyjscie) powrot(); return; }
    if (++pozaTyk === 3 && !wyjscie) poza(Date.now() - 2000);   // krótsze niż ~3 s (np. przypadkowy klawisz) się nie liczy
  }, 1000);
  setInterval(() => { if (!document.hidden) srodowisko(); }, 600000);

  /* ---------- Burza mózgów (ćwiczenie zespołowe uruchamiane przez nauczyciela w Prowadzeniu lekcji) ---------- */
  // Gra pyta co 10 s (poza lekcją co minutę), czy w klasie/grupie gracza trwa burza mózgów. Jeśli tak, uczeń dołącza
  // (imię + PIN) i dostaje okno drużyny; lider widzi pomysły całej drużyny, powtórzenia łączą się same (burza.js).
  const BZ = { tok: "", id: 0, r: null, wid: "", zazn: null, t: null, wysylam: false, usOtw: false };
  const DR = (d) => (window.BURZA && window.BURZA.DRUZYNY[d]) || { n: "?", k: "#888" };
  function burzaPytaj(op, d) { return api("burza", Object.assign({ op, k: S.gracz.k, g: S.gracz.g || "", tok: BZ.tok }, d)); }
  async function burzaTyk() {
    clearTimeout(BZ.t);
    let za = 60000;
    try {
      if (uczen() && window.BURZA) {   // także gdy okno jest ukryte – nauczyciel ma widzieć, że uczeń wyszedł z gry
        const lek = await naLekcji();
        za = lek ? 10000 : 60000;
        let r = await api("naLekcji", Object.assign({ k: S.gracz.k, g: S.gracz.g || "", n: S.gracz.n, tok: BZ.tok }, lek ? { st: OB.st, od: OB.od } : {}));   // burza mózgów + test + obecność
        if (r && r.ok) testSprawdz(r.test);
        if (r && r.ok && r.jest && r.id !== BZ.id) { BZ.id = r.id; BZ.tok = ""; }
        if (r && r.ok && r.jest && !r.ja) r = await burzaPytaj("dolacz", { n: S.gracz.n, h: S.gracz.h });
        if (r && r.ok) {
          if (r.tok) BZ.tok = r.tok;
          burzaPokaz(r.jest ? r : null);
          if (r.jest) za = r.jaLider ? 3000 : 5000;
        }
      } else if (!uczen()) burzaPokaz(null);
    } catch (e) {}
    BZ.t = setTimeout(burzaTyk, za);
  }
  function burzaGlowa(r) {
    const tem = `<div class="bz-temat">Burza mózgów: <b>${esc(r.temat)}</b></div>`;
    if (r.faza === "wyniki") return tem + `<p>Patrzcie na tablicę – omawiamy pomysły wszystkich drużyn.</p>`;
    if (r.faza === "zapisy" || r.d < 0) return tem + `<p>Zaraz losowanie drużyn – poczekaj chwilę…</p>`;
    const dr = DR(r.d);
    return tem + `<div class="bz-dr" style="--dr:${dr.k}">Drużyna <b>${dr.n}</b> · zbieracie: <b>${esc(r.kat[r.d])}</b></div>
      <p class="mala">${r.jaLider ? "Jesteś liderem drużyny: widzisz pomysły wszystkich. Usuń te, które nie pasują, połącz te, które znaczą to samo, a pasujące do innej kategorii przekaż innej drużynie."
        : `Lider drużyny: <b>${esc(r.lider || "–")}</b>. Wpisuj swoje skojarzenia – lider zbiera je wszystkie.`}</p>
      <form class="bz-form"><input name="t" maxlength="40" autocomplete="off" placeholder="Wpisz skojarzenie i naciśnij Enter"><button class="glowny">Dodaj</button></form><p class="blad bz-blad"></p>`;
  }
  function burzaTresc(r) {
    if (r.faza === "wyniki") return window.BURZA.tablica(r.wszystkie || [], r.kat);
    if (r.faza !== "zbieranie" || r.d < 0) return "";
    if (!r.jaLider) {
      const m = r.moje || [];
      return `<h3>Twoje pomysły (${m.length})</h3>${m.length ? `<ul class="bz-moje">${m.map((w) => `<li>${esc(w.t)}${w.x ? ` <small>– lider usunął</small>` : w.d !== w.z ? ` <small>– przekazane drużynie ${DR(w.d).n}</small>` : ""}</li>`).join("")}</ul>`
        : `<p class="mala">Jeszcze nic. Co kojarzy Ci się z tematem w kategorii „${esc(r.kat[r.d])}”?</p>`}`;
    }
    const wp = r.wpisy || [], gr = window.BURZA.grupuj(wp), us = wp.filter((w) => w.x);
    return `<div class="bz-pasek"><b>Pomysły drużyny: ${gr.length}</b><span class="mala">(${wp.length - us.length} wpisów)</span><span style="flex:1"></span>
      <button class="${r.gotowe ? "drugi" : "glowny"}" data-gotowe>${r.gotowe ? "✔ Oddane – cofnij" : "Gotowe – oddaj nauczycielowi"}</button></div>
      ${BZ.zazn != null ? `<p class="bz-info">🔗 Kliknij pomysł, z którym połączyć zaznaczony (albo kliknij zaznaczony jeszcze raz, żeby anulować).</p>` : ""}
      <div class="bz-lista">${gr.map((g) => `<div class="bz-g${BZ.zazn === g.i ? " zazn" : ""}" data-g="${g.i}" title="${esc("Wpisali: " + g.autorzy.join(", "))}">
        <span class="bz-t">${esc(g.t)}${g.ile > 1 ? ` <b class="bz-ile">×${g.ile}</b>` : ""}${g.warianty.length ? ` <small>(${esc(g.warianty.join(", "))})</small>` : ""}${g.z.some((z) => z !== r.d) ? ` <small>↪ od innej drużyny</small>` : ""}</span>
        <span class="bz-akc"><button data-polacz title="Połącz z innym pomysłem (to samo inaczej)">🔗</button>${[0, 1, 2].filter((d) => d !== r.d).map((d) =>
          `<button data-przenies="${d}" title="Pasuje do „${esc(r.kat[d])}” – przekaż drużynie ${DR(d).n}" style="color:${DR(d).k}">➜●</button>`).join("")}<button data-usun title="Usuń – nie pasuje">✖</button></span></div>`).join("")
        || `<p class="mala">Czekamy na pierwsze pomysły drużyny…</p>`}</div>
      ${us.length ? `<details class="bz-usuniete"${BZ.usOtw ? " open" : ""}><summary>Usunięte (${us.length})</summary>${us.map((w) => `<button class="link" data-przywroc="${w.i}" title="Przywróć">↺ ${esc(w.t)} <small>(${esc(w.a)})</small></button>`).join(" ")}</details>` : ""}`;
  }
  function burzaPokaz(r) {
    let o = $(".nak-burza");
    if (!r) { if (o) o.remove(); BZ.r = null; BZ.wid = ""; return; }
    BZ.r = r;
    const wid = [r.id, r.faza, r.d, r.jaLider ? 1 : 0].join("|");
    if (!o || BZ.wid !== wid) {
      if (o) o.remove();
      o = document.createElement("div"); o.className = "nakladka nak-burza"; BZ.wid = wid; BZ.zazn = null;
      o.innerHTML = `<div class="okno" role="dialog" aria-modal="true" aria-label="Burza mózgów">${burzaGlowa(r)}<div class="bz-tresc" aria-live="polite"></div></div>`;
      document.body.appendChild(o);
      o.addEventListener("click", burzaKlik);
      o.addEventListener("toggle", (ev) => { if (ev.target.matches(".bz-usuniete")) BZ.usOtw = ev.target.open; }, true);
      const f = $("form", o); if (f) { f.onsubmit = burzaDodaj; f.t.focus(); }
    }
    $(".bz-tresc", o).innerHTML = burzaTresc(r);
  }
  async function burzaDodaj(ev) {
    ev.preventDefault();
    const f = ev.target, t = f.t.value.trim(), bl = $(".bz-blad"), bt = $("button", f);
    if (t.length < 2 || BZ.wysylam) return;
    BZ.wysylam = true; bt.disabled = true;
    try {
      const r = await burzaPytaj("dodaj", { t });
      if (r && r.ok) { f.t.value = ""; bl.textContent = ""; burzaPokaz(r); }
      else bl.textContent = ({ slowo: "Tego nie da się dodać.", limit: "Masz już 40 pomysłów – wystarczy!", krotki: "Za krótkie.", zajety: "Serwer zajęty – spróbuj jeszcze raz." })[r && r.e] || "Nie udało się dodać – spróbuj jeszcze raz.";
    } catch (e) { bl.textContent = "Brak połączenia – spróbuj jeszcze raz."; }
    BZ.wysylam = false; bt.disabled = false; f.t.focus();
  }
  async function burzaKlik(ev) {
    const r = BZ.r; if (!r || !r.jaLider || r.faza !== "zbieranie") return;
    const b = ev.target.closest("button"), ge = ev.target.closest("[data-g]");
    const grupy = window.BURZA.grupuj(r.wpisy || []), g = ge && grupy.find((x) => x.i === +ge.dataset.g);
    let op = null, d = {};
    if (b && b.dataset.gotowe != null) { op = "gotowe"; d = { ok: !r.gotowe }; }
    else if (b && b.dataset.przywroc) { op = "usun"; d = { ids: [+b.dataset.przywroc], x: 0 }; }
    else if (g && b && b.dataset.usun != null) { op = "usun"; d = { ids: g.ids, x: 1 }; }
    else if (g && b && b.dataset.przenies) { op = "przenies"; d = { ids: g.ids, d: +b.dataset.przenies }; }
    else if (g && (b && b.dataset.polacz != null || BZ.zazn === g.i)) { BZ.zazn = BZ.zazn === g.i ? null : g.i; return burzaPokaz(r); }
    else if (g && BZ.zazn != null) {
      const a = grupy.find((x) => x.i === BZ.zazn); BZ.zazn = null;
      if (a) { op = "polacz"; d = { ids: a.ids, p: g.i }; }
    }
    if (!op) return;
    try { const x = await burzaPytaj(op, d); if (x && x.ok) burzaPokaz(x.jest ? x : null); } catch (e) {}
  }
  /* ---------- Kartkówki i sprawdziany uruchamiane przez nauczyciela (testy.js, bez hasła) ---------- */
  // Zapytanie naLekcji (co 10 s na lekcji) mówi, czy nauczyciel uruchomił test dla klasy/grupy albo dla tego ucznia.
  // Kartkówka-niespodzianka nie jest widoczna na mapie, dopóki uczeń jej nie napisze.
  const TS = { run: null, trwa: false };
  const etapTestu = (id) => F.etapy.find((x) => x.id === id && x.gra);
  function testSprawdz(run) {
    TS.run = run || null;
    if (!run || TS.trwa || !uczen()) return;
    const e = etapTestu(run.etap); if (!e || S.testy[e.id] || $(".nak-alarm")) return;
    if (S.testTrwa && S.testTrwa.id === run.id) return grajTestGra(e, run);   // test zaczęty wcześniej (np. po odświeżeniu) – od razu wracamy
    const al = (e.alarm && (e.alarm[S.motyw] || e.alarm.det)) || `${M().szef}: niezapowiedziana kontrola!`;
    const o = okno(`<div class="alarm-test"><div class="syrena" aria-hidden="true">🚨</div>${portret("s", S.motyw, 64)}<h2>${esc(tok(al))}</h2>
      <p><b>${esc(tytul(e))}</b> · ${run.czas} min. Czas liczy się od kliknięcia „Zaczynam”.</p><p><button class="glowny" data-start>Zaczynam ▸</button></p></div>`, "nak-alarm");
    dzwiek("zle");
    $("[data-start]", o).onclick = () => { o.remove(); grajTestGra(e, run); };
  }
  async function grajTestGra(e, run) {
    if (TS.trwa) return; TS.trwa = true;
    try {
      let gr = "";   // grupa A/B wg numeru komputera (sąsiedzi mają różne grupy); bez aplikacji losuje skrypt
      try { if (window.KONSOLA && window.KONSOLA.dostepna()) { const inf = await window.KONSOLA.info(), m = /(\d+)\D*$/.exec((inf && inf.nazwa) || ""); if (m) gr = +m[1] % 2 ? "A" : "B"; } } catch (er) {}
      const r = await api("test", { k: S.gracz.k, g: S.gracz.g || "", n: S.gracz.n, h: S.gracz.h, id: run.id, gr }).catch(() => null);
      if (!r || !r.ok) { await pytanie(r && r.e === "brak" ? "Nauczyciel zakończył już ten test." : "Nie udało się pobrać testu. Sprawdź połączenie i spróbuj ponownie.", "OK", "Zamknij"); return; }
      const zasz = (window.TESTY_ZASZ || {})[r.test];
      if (!zasz) { await pytanie("Brak treści testu na tym urządzeniu – zaktualizuj aplikację („Sprawdź aktualizacje”).", "OK", "Zamknij"); return; }
      const def = await window.TESTY_GRA.odszyfruj(zasz, r.klucz);
      const koniec = r.t0 + r.czas * 60000 + (Date.now() - r.teraz);   // czas ucznia od jego startu (poprawka na zegar komputera)
      const sz = S.testTrwa && S.testTrwa.id === run.id ? S.testTrwa : null;
      let wyj = sz ? (sz.wyj || 0) + 1 : 0;   // powrót do zaczętego testu = gra była zamknięta (np. Alt+F4) – to też wyjście
      S.testTrwa = Object.assign({ id: run.id, etap: e.id, test: r.test }, sz || {}, { wyj }); if (sz) zapisz();
      otwartyTest = e.id;
      let tz = null;
      const wyn = await window.TESTY_GRA.uruchom({ def, ul: sz && sz.ul, odp: sz && sz.odp, koniec, tytul: def.tytul || tytul(e), wyj,
        naWyjscie: (n) => { wyj = n; S.testTrwa.wyj = n; zapisz(); },
        szkic: (ul, odp) => { S.testTrwa = { id: run.id, etap: e.id, test: r.test, ul, odp, wyj }; clearTimeout(tz); tz = setTimeout(zapisz, 1500); } });
      clearTimeout(tz); otwartyTest = "";
      const t = { test: r.test, gr: r.gr, s: wyn.s, sAuto: wyn.sAuto, m: wyn.m, proc: Math.round(wyn.s / (wyn.m || 1) * 100), data: new Date().toISOString(), bledne: wyn.bledne };
      if (wyn.doOceny) { t.otw = wyn.otw; t.doOceny = wyn.doOceny; }
      if (wyn.wyj) t.wyj = wyn.wyj;
      if (wyn.kara) { t.kara = wyn.kara; t.sPrzedKara = t.s; t.s = 0; t.proc = 0; }   // 3 wyjścia z gry = ocena 1 (nauczyciel może cofnąć w Panelu)
      S.testy[e.id] = t; delete S.testTrwa;
      const przed = stopien(), xpPrzed = S.xp; S.xp = liczXP(); const xp = S.xp - xpPrzed;
      const nowe = [];
      [].concat(e.karta || []).forEach((k) => { if (!S.karty.includes(k)) { S.karty.push(k); nowe.push(k); } });
      zapisz();
      api(undefined, { t: "test", n: S.gracz.n, k: S.gracz.k, x: (def.tytul || tytul(e)) + (r.gr && def.grupy !== false && e.gra.testy.length > 1 ? " · gr. " + r.gr : "") + (t.doOceny ? " (otwarte do sprawdzenia)" : ""),
        s: t.s, m: t.m, w: t.bledne.join(", ") + (t.kara ? " · KARA: " + t.kara : ""), g: ocenaTestu(t.s, t.m) }).catch(() => {});   // karta „Wyniki” w arkuszu
      if (!t.kara) await scena(e.koniec[S.motyw]);
      if (e.boss) konfetti();
      await podsumowanie({ e, test: true, suma: t.s, max: t.m, proc: t.proc, pierwszy: true, xp, nowe, przed });
      if (t.kara) await pytanie(`⛔ Test oddany automatycznie: trzy razy wyszedłeś z gry. Ocena niedostateczna – jeśli to była awaria komputera, powiedz nauczycielowi.`, "OK", "Zamknij");
      else if (t.doOceny) await pytanie(`Zadania otwarte (${t.doOceny}) sprawdzi nauczyciel – wynik może jeszcze wzrosnąć.`, "OK", "Zamknij");
      mapa();
    } finally { TS.trwa = false; otwartyTest = ""; }
  }
  async function klikTestGra(e) {
    const w = S.testy[e.id];
    if (w) {
      const t = await pytanie(`<b>${esc(tytul(e))}</b><br>Twój wynik: ${w.s}/${w.m} (${w.proc}%), proponowana ocena: <b>${ocenaTestu(w.s, w.m)}</b>.${w.doOceny ? ` Zadania otwarte (${w.doOceny}) czekają na sprawdzenie przez nauczyciela.` : ""}`, "Obejrzyj scenę końcową", "Wróć");
      if (t) await scena(e.koniec[S.motyw]);
      return mapa();
    }
    if (TS.run && TS.run.etap === e.id) return grajTestGra(e, TS.run);
    await pytanie(`${esc(tytul(e))} uruchomi ${esc(M().szef)} (nauczyciel) na lekcji – wtedy pojawi się tu sam.`, "OK", "Wróć");
  }

  /* ---------- Start ---------- */
  setInterval(() => {
    if (!document.hidden && $("#cel-klasy") && !$(".nakladka") && !$(".zadanie") && !$(".akta")) celKlasy();
  }, 20000);
  if (oczysc()) { S.xp = liczXP(); zapisz(); }
  S.xp = liczXP();
  if (!S.motyw || (!S.gracz && !S.lokalny) || !S.wybralMotyw) start(); else { mapa(); chmuraTeraz(); srodowisko(); }
  BZ.t = setTimeout(burzaTyk, 2000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && BZ.r) burzaTyk(); });
})();
