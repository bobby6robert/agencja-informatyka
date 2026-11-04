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
  /* XP liczone zawsze od nowa z wyników (te same zasady w skrypcie Google). */
  function liczXP(st = S) {
    let x = 0;
    Object.values(st.misje || {}).forEach((m) => { x += +(m.xpMax != null ? m.xpMax : m.pkt) || 0; });
    x += 15 * Object.keys(st.zagadki || {}).length;
    Object.entries(st.testy || {}).forEach(([id, t]) => { x += Math.round((+t.s || 0) / (+t.m || 1) * (id === "boss" ? 200 : 80)); });
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
    if (zamknietyPrzezSzefa(i)) return false;
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
        S.xp = liczXP();
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
        <div class="logo"><b>${esc(M().agencja)}</b><span>${esc(M().sprawa)} · ${esc(F.rozdzial)}</span></div>
        <div class="gracz" title="${S.xp} XP">
          <div class="mini">${awatar(S.awatar, 44)}</div>
          <div><b>${esc(S.gracz ? S.gracz.n : "Gość")}</b>${S.gracz && S.gracz.k ? ` <small>${esc(S.gracz.k)}</small>` : ""}<br>
          <span class="stopien">${esc(nazwaStopnia(st))}</span> <span class="xp">${S.xp} XP</span>
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
    S.klasa = { m: F.motywy[m] ? m : "", dm: Array.isArray(dm) ? dm : [], od: od || "", kom: kom || "" };
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
        <p class="lead">Gra fabularna: ${esc(F.rozdzial)}. Zaloguj się kodem klasy, który poda nauczyciel.</p><div id="logowanie"></div></div>`;
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
      <label>Imię i pierwsza litera nazwiska<input name="n" maxlength="16" placeholder="np. Ola K." required></label>
      <label>Kod klasy (poda nauczyciel)<input name="kod" maxlength="12" placeholder="np. 1A-XXXX" required style="text-transform:uppercase"></label>
      <label>PIN – 4 cyfry. Zapamiętaj go!<input name="pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="••••" required type="password"></label>
      <p class="mala">Ten sam formularz służy do logowania na innym komputerze lub telefonie. Postęp zapisuje się w chmurze nauczyciela.</p>
      <p><button class="glowny" type="submit">Wchodzę do gry ▸</button></p>
      <p class="blad" aria-live="polite"></p>
      <p><button type="button" class="link" data-lok>Graj bez konta (postęp tylko na tym urządzeniu)</button></p>
    </form>`;
    const f = $("form", box), bl = $(".blad", box);
    $("[data-lok]", box).onclick = () => {
      const n = f.n.value.trim();
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
        const r = await api("login", { n, kod, h });
        if (!r.ok) {
          bl.textContent = { kod: "Nieznany kod klasy. Sprawdź go u nauczyciela.", pin: "Zły PIN dla tej osoby w tej klasie.", blokada: "Za dużo prób. Odczekaj 10 minut.", nick: "Nieprawidłowe imię.", zajety: "Centrala jest zajęta. Spróbuj ponownie za chwilę." }[r.e] || "Nie udało się zalogować.";
          return;
        }
        if (r.stan) {
          try { const zs = JSON.parse(r.stan); if ((zs.xp || 0) >= (S.xp || 0)) S = Object.assign(NOWY(), zs); } catch (er) {}
        } else { S.motyw = null; S.wybralMotyw = 0; }
        S.lokalny = false; S.gracz = { n: r.n || n, k: r.k, h };
        ustawKlase(r.m, r.dm, r.od, r.kom);
        zapisz(); chmuraTeraz(); S.wybralMotyw ? mapa() : start();
      } catch (er) {
        bl.innerHTML = er.stary
          ? "Zapis w chmurze nie jest jeszcze włączony (nauczyciel musi zaktualizować skrypt). Możesz grać bez konta – postęp zostanie na tym urządzeniu."
          : "Brak połączenia z centralą. Sprawdź Internet albo graj bez konta.";
      }
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
        <div><h1>${esc(M().sprawa)}</h1><p>${esc(F.rozdzial)}</p>
        ${ost ? `<button class="drugi" data-przypomnij>📜 Przypomnij, co się wydarzyło</button>` : ""}</div>
      </section>
      ${S.klasa && S.klasa.kom ? `<section class="karta rozkaz"><div>${portret("s", S.motyw, 52)}</div><div><b>📨 Wiadomość od: ${esc(M().szef)}</b><p>${esc(S.klasa.kom)}</p></div></section>` : ""}
      <section id="cel-klasy"></section>
      ${wyzwanieHTML()}
      <ol class="sciezka">${F.etapy.map((e, i) => {
        const ok = etapGotowy(e), dost = dostepny(i), wyn = e.typ === "test" ? S.testy[e.id] : S.misje[e.id];
        const ikona = e.boss ? "💀" : e.typ === "test" ? "🎙️" : e.id === "prolog" ? "📞" : "📁";
        let info = "";
        if (wyn && e.typ === "misja") info = e.bezPoziomu ? `${wyn.proc}%` : `${F.poziomy[wyn.poziom].n} · ${wyn.proc}% · proponowana ocena: <b>${wyn.ocena}</b>${moznaPoprawic(e) ? " · można poprawić" : ""}`;
        if (wyn && e.typ === "test") info = `${wyn.s}/${wyn.m} pkt (${wyn.proc}%) · proponowana ocena: <b>${ocenaTestu(wyn.s, wyn.m)}</b>`;
        if (!ok && zamknietyPrzezSzefa(i)) info = `odblokuje ${esc(M().szef)}`;
        return `<li class="etap ${ok ? "zrob" : dost ? "dost" : "zamk"} ${e.boss ? "boss" : ""}">
          <button data-i="${i}" ${dost || ok ? "" : "disabled"}>
            <span class="ik">${ok ? "✔" : dost ? ikona : "🔒"}</span>
            <span class="tx"><b>${esc(tytul(e))}</b><small>${e.typ === "test" ? (e.boss ? "Finał rozdziału – sprawdzian" : "Kartkówka") : e.id === "prolog" ? "Prolog" : "Misja"}${info ? " · " + info : ""}</small></span>
          </button></li>`;
      }).join("")}</ol>`;
    $$(".sciezka button", w).forEach((b) => (b.onclick = () => { dzwiek("klik"); otworzEtap(F.etapy[+b.dataset.i]); }));
    const pz = $("[data-przypomnij]", w); if (pz) pz.onclick = () => scena(ost.koniec[S.motyw]);
    const wz = $("[data-wyzwanie]", w); if (wz) wz.onclick = grajWyzwanie;
    celKlasy();
    if (!S.misje.prolog && !S.widzialStart) { S.widzialStart = 1; zapisz(); otworzEtap(F.etapy[0]); }
    else if (S.klasa && S.klasa.kom && S.komWidziany !== S.klasa.kom) { S.komWidziany = S.klasa.kom; zapisz(); scena([["s", S.klasa.kom]]); }
  }

  async function celKlasy() {
    const box = $("#cel-klasy"); if (!box || !S.gracz || S.lokalny || !S.gracz.k) return;
    try {
      const r = await api("klasy", {});
      if (!r.ok) return;
      const moja = r.klasy.find((k) => k.k === S.gracz.k); if (!moja) return;
      const przed = JSON.stringify(S.klasa);
      const zmiana = ustawKlase(moja.m, moja.dm, moja.od, moja.kom);
      if (przed !== JSON.stringify(S.klasa)) { zapisz(); return mapa(); }
      if (zmiana) return mapa();
      const cel = moja.cel || 3000, pr = Math.min(100, Math.round(moja.suma / cel * 100));
      box.innerHTML = `<div class="karta cel"><b>Wspólny cel klasy ${esc(moja.k)}</b>
        <div class="duzy-pasek"><i style="width:${pr}%"></i><span>${moja.suma} / ${cel} XP</span></div>
        <small>Każdy Twój punkt przybliża całą klasę do celu. Gdy klasa go osiągnie, ${esc(M().szef)} przygotuje nagrodę.</small></div>`;
    } catch (e) {}
  }

  function otworzEtap(e) { return e.typ === "test" ? grajTest(e) : grajMisje(e); }

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
      w.innerHTML = `<section class="karta akta"><h2>📂 ${esc(M().akta)}: ${esc(tytul(e))}</h2>
        <p>Zanim zaczniesz, przejrzyj materiały z lekcji. Wszystko, czego potrzebujesz, jest w aktach.</p>
        <div class="lista-akt">${e.lekcje.map(([id, n]) => `<button class="drugi" data-l="${id}" data-n="${esc(n)}">📄 ${esc(n)}</button>`).join("")}</div>
        <p><button class="glowny" data-start>Rozpocznij zadania ▸</button> <button class="link" data-x>Wróć do mapy</button></p></section>`;
      $$("[data-l]", w).forEach((b) => (b.onclick = () => lekcja(b.dataset.l, b.dataset.n)));
      $("[data-start]", w).onclick = () => ok(true);
      $("[data-x]", w).onclick = () => ok(false);
    });
  }

  async function grajMisje(e) {
    let poziom = "rekrut";
    if (!e.bezPoziomu) { poziom = await wyborPoziomu(e); if (!poziom) return mapa(); }
    await scena(e.wstep[S.motyw]);
    if (!(await akta(e))) return mapa();
    const zad = e.bezPoziomu ? e.zadania.wszystkie : e.zadania[poziom];
    const pkt = e.bezPoziomu ? 10 : F.poziomy[poziom].pkt;
    let suma = 0, podp = 0;
    for (let i = 0; i < zad.length; i++) {
      const r = await zadanie(e, zad[i], i, zad.length, pkt, suma);
      if (r === null) return mapa();
      suma += r.pkt; podp += r.podp;
    }
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
    const rec = { poziom, pkt: Math.round(suma), max, proc, ocena: e.bezPoziomu ? null : ocena(poziom, proc), podp, data: new Date().toISOString() };
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
    if (pierwszy && e.karta && !S.karty.includes(e.karta)) { S.karty.push(e.karta); nowe.push(e.karta); }
    if (["m1", "m2", "m3"].every((m) => S.zagadki[m]) && !S.karty.includes("c6")) { S.karty.push("c6"); nowe.push("c6"); }
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

  /* Jedno zadanie. Zwraca {pkt, podp} albo null (przerwano). */
  function zadanie(e, z, nr, ile, pkt, suma, bonus) {
    return new Promise((gotowe) => {
      const w = szkielet("mapa");
      let uzyte = 0, sprawdzone = false;
      const kary = F.kary;
      const koszt = (n) => Math.round((1 - kary[n]) * 100);
      const stan = { wyb: null, wiele: new Set(), kol: null, para: {} };
      if (z.typ === "kolej") { let k; do { k = tasuj(z.el.map((_, i) => i)); } while (k.every((v, i) => v === i) && z.el.length > 1); stan.kol = k; }
      const kolO = z.o ? tasuj(z.o.map((_, i) => i)) : null;
      const kolR = z.r ? tasuj(z.r.map((_, i) => i)) : null;

      w.innerHTML = `<section class="karta zadanie">
        <div class="zad-gora"><span class="kropki">${bonus ? (typeof bonus === "string" ? bonus : "🧩 Zagadka dodatkowa") : Array.from({ length: ile }, (_, i) => `<i class="${i < nr ? "b" : i === nr ? "a" : ""}"></i>`).join("")}</span>
        <span class="pkt">${bonus ? "" : `${Math.round(suma)} pkt`}</span></div>
        <p class="fab">${portret("s", S.motyw, 40)}<span>${esc(tok(z.fab))}</span></p>
        ${z.typ === "klucz" ? `<p class="praktyczne">🖥️ Zadanie praktyczne – wykonaj je na komputerze</p>` : ""}
        <h2>${esc(tok(z.q))}</h2>
        <div class="odp">${widget()}</div>
        <div class="podp-box"></div>
        <div class="wynik" aria-live="polite"></div>
        <div class="zad-p">
          <button class="drugi" data-podp>💡 Podpowiedź (−${koszt(1)}% pkt)</button>
          <button class="glowny" data-spr>Sprawdź</button>
          ${bonus === "🏅 Wyzwanie tygodnia" ? "" : `<button class="link" data-x>Przerwij misję</button>`}
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
        ol.innerHTML = stan.kol.map((ix, p) => `<li><span>${esc(z.el[ix])}</span><span class="strz"><button data-g="${p}" aria-label="W górę" ${p === 0 ? "disabled" : ""}>▲</button><button data-d="${p}" aria-label="W dół" ${p === stan.kol.length - 1 ? "disabled" : ""}>▼</button></span></li>`).join("");
        $$("[data-g]", ol).forEach((b) => (b.onclick = () => { if (sprawdzone) return; const p = +b.dataset.g; [stan.kol[p - 1], stan.kol[p]] = [stan.kol[p], stan.kol[p - 1]]; rysujKolej(); }));
        $$("[data-d]", ol).forEach((b) => (b.onclick = () => { if (sprawdzone) return; const p = +b.dataset.d; [stan.kol[p + 1], stan.kol[p]] = [stan.kol[p], stan.kol[p + 1]]; rysujKolej(); }));
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
      bp.onclick = () => {
        if (sprawdzone || uzyte >= z.h.length) return;
        uzyte++; dzwiek("klik");
        $(".podp-box", w).insertAdjacentHTML("beforeend", `<div class="podp">${portret("p", S.motyw, 36)}<span><b>${esc(M().pomocnik)}:</b> ${esc(tok(z.h[uzyte - 1]))}</span></div>`);
        if (uzyte >= z.h.length || uzyte >= kary.length - 1) { bp.disabled = true; bp.textContent = "💡 Brak kolejnych podpowiedzi"; }
        else bp.textContent = `💡 Kolejna podpowiedź (łącznie −${koszt(uzyte + 1)}% pkt)`;
      };
      if ($("[data-x]", w)) $("[data-x]", w).onclick = async () => { if (await pytanie("Przerwać misję? Postęp w tej misji nie zostanie zapisany.", "Przerwij", "Graj dalej")) gotowe(null); };

      $("[data-spr]", w).onclick = () => {
        if (sprawdzone) return;
        let dobrze;
        if (z.typ === "wybor" || z.typ === "blad") { if (stan.wyb == null) return wynik("Najpierw wybierz odpowiedź.", "uwaga"); dobrze = stan.wyb === z.a; }
        else if (z.typ === "wiele") { if (!stan.wiele.size) return wynik("Zaznacz co najmniej jedną odpowiedź.", "uwaga"); dobrze = stan.wiele.size === z.a.length && z.a.every((i) => stan.wiele.has(i)); }
        else if (z.typ === "kolej") dobrze = stan.kol.every((v, i) => v === i);
        else if (z.typ === "para") { if (z.l.some((_, i) => stan.para[i] === "" || stan.para[i] == null)) return wynik("Dopasuj wszystkie elementy.", "uwaga"); dobrze = z.l.every((_, i) => +stan.para[i] === i); }
        else { const v = norm(wp.value); if (!v) return wynik("Wpisz odpowiedź.", "uwaga"); dobrze = z.ok.some((x) => norm(x) === v); }
        sprawdzone = true;
        const zdobyte = dobrze ? pkt * kary[Math.min(uzyte, kary.length - 1)] : 0;
        dzwiek(dobrze ? "ok" : "zle");
        // pokaż poprawne
        if (z.typ === "wybor" || z.typ === "blad") $$("[data-o]", w).forEach((b) => { const i = +b.dataset.o; if (i === z.a) b.classList.add("dobra"); else if (i === stan.wyb) b.classList.add("zla"); });
        if (z.typ === "wiele") $$("[data-w]", w).forEach((b) => { const i = +b.dataset.w; if (z.a.includes(i)) b.classList.add("dobra"); else if (stan.wiele.has(i)) b.classList.add("zla"); });
        if (z.typ === "para") $$("[data-p]", w).forEach((s) => { s.disabled = true; s.classList.add(+s.value === +s.dataset.p ? "dobra" : "zla"); });
        if (wp) wp.disabled = true;
        bp.disabled = true;
        wynik(`${dobrze ? `✔ Dobrze! +${Math.round(zdobyte * 10) / 10} pkt${uzyte ? ` (podpowiedzi: ${uzyte})` : ""}` : "✘ Niestety, to nie to."}<br><small>${esc(tok(z.why))}</small>`, dobrze ? "dobrze" : "zle");
        const b = $("[data-spr]", w); b.textContent = nr + 1 < ile ? "Dalej ▸" : "Zakończ ▸";
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
      $("[data-x]", o).onclick = () => { removeEventListener("message", sl); o.remove(); ok(S.testy[e.id] || null); };
    });
    if (!wyn) return mapa();
    await scena(e.koniec[S.motyw]);
    const przed = stopien(), xpPrzed = S.xp; S.xp = liczXP(); const xp = S.xp - xpPrzed;
    const nowe = [];
    if (e.karta && !S.karty.includes(e.karta)) { S.karty.push(e.karta); nowe.push(e.karta); }
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
          <p class="mala">${S.lokalny ? "Postęp zapisany tylko na tym urządzeniu." : S.gracz && S.gracz.k ? `Klasa ${esc(S.gracz.k)} · postęp zapisany w chmurze.` : ""}</p>
          <p>${S.lokalny ? `<button class="drugi" data-polacz>☁ Połącz z kontem klasy</button>` : ""} <button class="link" data-wyloguj>Wyloguj</button></p>
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
        <p class="mala">Tajną kartę zdobędziesz, rozwiązując wszystkie zagadki dodatkowe.</p>
      </section>
      <section class="karta"><h2>Moje wyniki</h2><table class="tabela"><tr><th>Etap</th><th>Poziom</th><th>Wynik</th><th>Proponowana ocena</th></tr>
        ${F.etapy.map((e) => { const m = e.typ === "test" ? S.testy[e.id] : S.misje[e.id];
          return `<tr><td>${esc(tytul(e))}</td><td>${m && m.poziom && !e.bezPoziomu ? esc(F.poziomy[m.poziom].n) : e.typ === "test" ? (e.boss ? "Sprawdzian" : "Kartkówka") : "–"}</td><td>${m ? (e.typ === "test" ? `${m.s}/${m.m} (${m.proc}%)` : `${m.proc}%`) : "–"}</td><td>${m && m.ocena ? `<b>${m.ocena}</b>${m.proby && m.proby.length > 1 ? " <small>(po poprawie)</small>" : ""}` : m && e.typ === "test" ? `<b>${ocenaTestu(m.s, m.m)}</b>` : "–"}</td></tr>`; }).join("")}
      </table></section>
      <section class="karta"><h2>🎓 Dyplom</h2>${F.etapy.every(etapGotowy)
        ? `<p>Rozdział ukończony! Pobierz dyplom z wynikami.</p><p><button class="glowny" data-dyplom>Pobierz dyplom (PNG)</button></p>`
        : `<p class="mala">Dyplom odblokujesz po ukończeniu wszystkich etapów rozdziału (${ukonczone()}/${F.etapy.length}).</p>`}</section>`;
    $$("[data-s]", w).forEach((b) => (b.onclick = () => {
      const s = b.dataset.s; S.awatar[s] = s === "skora" || s === "wlosy" ? +b.dataset.v : b.dataset.v; zapisz(); dzwiek("klik"); agent();
    }));
    const dy = $("[data-dyplom]", w); if (dy) dy.onclick = dyplom;
    const pl = $("[data-polacz]", w); if (pl) pl.onclick = () => { S.lokalny = false; S.gracz = null; zapisz(); start(); };
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
  async function dyplom() {
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
    x.fillText(`za ukończenie: ${F.rozdzial}`, sr, 520);
    x.textAlign = "left"; x.font = "28px Segoe UI, sans-serif"; let y = 640;
    F.etapy.forEach((e) => {
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
    if (S.lokalny || !S.gracz || !S.gracz.k) { box.innerHTML = `<p>Ranking działa po zalogowaniu kodem klasy (zapis w chmurze).</p>`; return; }
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

  /* ---------- Start ---------- */
  S.xp = liczXP();
  if (!S.motyw || (!S.gracz && !S.lokalny) || !S.wybralMotyw) start(); else { mapa(); chmuraTeraz(); }
})();
