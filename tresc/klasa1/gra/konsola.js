/* AGENCJA – konsola w grze z prawdziwymi danymi komputera.
   Aplikacja .exe otwiera grę z ?konsola=port&kt=żeton i wykonuje na 127.0.0.1 polecenia z białej listy
   (ipconfig, getmac, hostname, arp -a, ping, tracert, nslookup, systeminfo). Bez aplikacji (telefon, zwykła
   przeglądarka) konsola tylko wyjaśnia, jak otworzyć prawdziwy Wiersz polecenia.
   KONSOLA.sprawdz(real, odpowiedź) porównuje odpowiedź ucznia z prawdziwym wynikiem tego komputera. */
(function () {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let P = null;
  try {
    const q = new URLSearchParams(location.search), port = q.get("konsola"), kt = q.get("kt");
    if (/^\d{4,5}$/.test(port || "") && /^[0-9a-f]{16}$/.test(kt || "")) { P = { port, kt }; sessionStorage.setItem("agencja-konsola", JSON.stringify(P)); }
    else P = JSON.parse(sessionStorage.getItem("agencja-konsola") || "null");
  } catch (e) {}
  const dostepna = () => !!P;
  async function zapytaj(sciezka, c) {
    const u = `http://127.0.0.1:${P.port}${sciezka}?kt=${P.kt}${c ? "&c=" + encodeURIComponent(c) : ""}`;
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 100000);
    try { return await (await fetch(u, { signal: ctl.signal })).json(); } finally { clearTimeout(t); }
  }
  const pamiec = {};   // wyniki poleceń z tej sesji (do sprawdzania odpowiedzi bez ponownego czekania)
  async function uruchom(c) {
    if (!P) return { ok: false, e: "brak" };
    try { const r = await zapytaj("/", c); if (r.ok) pamiec[c.trim().toLowerCase()] = r.wynik; return r; }
    catch (e) { return { ok: false, e: "polaczenie" }; }
  }
  let infoP = null;
  const info = () => (infoP = infoP || (P ? zapytaj("/info").catch(() => { infoP = null; return null; }) : Promise.resolve(null)));

  /* ---------- okno konsoli ---------- */
  const POMOC = `Dostępne polecenia:
  ipconfig, ipconfig /all   konfiguracja sieci (adres IP, maska, brama, MAC)
  getmac                    adresy fizyczne (MAC) kart sieciowych
  hostname                  nazwa komputera
  arp -a                    adresy MAC urządzeń w sieci lokalnej
  ping adres                czy urządzenie odpowiada (np. ping 8.8.8.8)
  tracert adres             trasa pakietów przez kolejne routery
  nslookup nazwa            adres IP dla nazwy domeny (DNS)
  systeminfo                informacje o systemie i sprzęcie
  cls                       wyczyść ekran`;
  function otworz(o = {}) {
    const n = document.createElement("div");
    n.className = "nakladka nak-konsola";
    n.innerHTML = `<div class="okno" role="dialog" aria-modal="true" aria-label="Wiersz polecenia">
      <div class="ks-pasek"><span>▣ Wiersz polecenia${P ? "" : " – tylko w aplikacji"}</span><button data-zamknij aria-label="Zamknij">✕</button></div>
      <div class="ks-ekran" tabindex="-1"></div></div>`;
    document.body.appendChild(n);
    const ek = n.querySelector(".ks-ekran"), zamknij = () => n.remove();
    n.querySelector("[data-zamknij]").onclick = zamknij;
    const pisz = (t, kl = "") => { ek.insertAdjacentHTML("beforeend", `<pre class="${kl}">${esc(t)}</pre>`); ek.scrollTop = ek.scrollHeight; };
    const hist = []; let hi = 0;
    function linia() {
      ek.insertAdjacentHTML("beforeend", `<div class="ks-linia"><span>C:\\Agencja&gt;</span><input autocomplete="off" spellcheck="false" aria-label="Polecenie"></div>`);
      const inp = ek.lastElementChild.querySelector("input"); inp.focus(); ek.scrollTop = ek.scrollHeight;
      inp.onkeydown = async (ev) => {
        if (ev.key === "Escape") return zamknij();
        if (ev.key === "ArrowUp" && hist.length) { hi = Math.max(0, hi - 1); inp.value = hist[hi]; ev.preventDefault(); return; }
        if (ev.key === "ArrowDown" && hist.length) { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ""; ev.preventDefault(); return; }
        if (ev.key !== "Enter") return;
        const c = inp.value.trim(); inp.disabled = true; hist.push(c); hi = hist.length;
        const p = c.toLowerCase();
        if (!c) return linia();
        if (p === "cls") { ek.innerHTML = ""; return linia(); }
        if (p === "help" || p === "pomoc" || p === "?") { pisz(POMOC); return linia(); }
        if (p === "exit") return zamknij();
        if (!P) { pisz("Ta konsola pokazuje prawdziwe dane tylko w aplikacji Agencji na komputerze z Windows.\nOtwórz prawdziwy Wiersz polecenia: Win + R, wpisz cmd, Enter – i wpisz tam: " + c, "ks-info"); return linia(); }
        const czeka = document.createElement("pre"); czeka.className = "ks-info";
        czeka.textContent = /^tracert/.test(p) ? "⏳ Śledzę trasę… to może potrwać do minuty." : "⏳ …";
        ek.appendChild(czeka);
        const r = await uruchom(c); czeka.remove();
        if (r.ok) pisz(r.wynik);
        else pisz(r.e === "niedozwolone" ? `„${c}” – tego polecenia nie można tu użyć. Wpisz help, aby zobaczyć listę.`
          : r.e === "czas" ? "Polecenie trwało za długo i zostało przerwane." : "Nie udało się połączyć z aplikacją. Uruchom grę z aplikacji Agencji.", "ks-blad");
        if (o.poWykonaniu) o.poWykonaniu(c, r);
        linia();
      };
    }
    pisz(P ? `Agencja – konsola śledcza (prawdziwy komputer: polecenia wykonuje Windows).\nWpisz help, aby zobaczyć polecenia.${o.podpowiedz ? "\n\nZadanie: " + o.podpowiedz : ""}`
      : "⚠ Gra nie jest uruchomiona z aplikacji Agencji, więc ta konsola nie może odczytać danych komputera.\nNa komputerze z Windows otwórz prawdziwy Wiersz polecenia (Win + R → cmd → Enter) i tam wpisz polecenie z zadania.", P ? "" : "ks-info");
    ek.onclick = (ev) => { if (ev.target === ek) { const i = ek.querySelector(".ks-linia:last-child input"); if (i) i.focus(); } };
    linia();
    return n;
  }

  /* ---------- sprawdzanie odpowiedzi z prawdziwymi danymi ---------- */
  const mac = (t) => String(t).toUpperCase().replace(/[^0-9A-F]/g, "");
  const aktywne = (inf) => (inf.karty || []).filter((k) => k.dziala && k.mac && (k.ip || []).length);
  async function wynik(c) { const k = c.toLowerCase(); if (pamiec[k]) return pamiec[k]; const r = await uruchom(c); return r.ok ? r.wynik : null; }
  /* real: "nazwa" | "mac" | "mac_ost" | "mac_ost_dec" | "ip" | "brama" | "dns" | "ram" | "procesor" | "system"
           | { nslookup: "domena" } | { tracert: "adres" } | { ping: "adres" }
     Zwraca true / false albo null, gdy nie da się sprawdzić (gra poza aplikacją). */
  async function sprawdz(real, odp) {
    if (!P) return null;
    const inf = await info(); if (!inf) return null;
    const a = String(odp || "").trim(), ak = aktywne(inf);
    switch (real) {
      case "nazwa": return a.toUpperCase() === String(inf.nazwa).toUpperCase();
      case "mac": return ak.some((k) => mac(k.mac) === mac(a));
      case "mac_ost": return ak.some((k) => mac(k.mac).slice(-2) === mac(a));
      case "mac_ost_dec": return ak.some((k) => String(parseInt(mac(k.mac).slice(-2), 16)) === a.replace(/\s/g, ""));
      case "ip": return ak.some((k) => k.ip.includes(a));
      case "brama": return ak.some((k) => (k.brama || []).includes(a));
      case "dns": return ak.some((k) => (k.dns || []).includes(a));
      case "ram": { const x = parseFloat(a.replace(",", ".")); return [inf.ramGB, inf.ramFizGB].some((r) => r && Math.abs(r - x) <= Math.max(1, r * 0.06)); }
      case "procesor": { const s = (t) => String(t).toLowerCase().replace(/\(r\)|\(tm\)|cpu|@.*$/g, "").replace(/[^a-z0-9]/g, ""); return a.length >= 4 && s(inf.procesor).includes(s(a)); }
      case "system": return /windows\s*1[01]/i.test(a) && String(inf.system).toLowerCase().includes(a.toLowerCase().replace(/\s+/g, " ").replace(/^microsoft\s*/, "").trim());
    }
    if (real && real.nslookup) {
      const w = await wynik("nslookup " + real.nslookup); if (w == null) return null;
      const po = w.split(/\n\s*\n/).slice(1).join("\n");   // pierwszy blok to serwer DNS
      return (po.match(/\b\d{1,3}(\.\d{1,3}){3}\b/g) || []).includes(a);
    }
    if (real && real.tracert) {
      const w = await wynik("tracert -d " + real.tracert); if (w == null) return null;
      const skoki = w.split("\n").filter((l) => /^\s*\d+\s+/.test(l)).length;
      return Math.abs(skoki - parseInt(a.replace(/[^0-9]/g, ""), 10)) <= 1;
    }
    if (real && real.ping) {   // "@brama" = brama domyślna tego komputera
      const cel = real.ping === "@brama" ? ((ak[0] && ak[0].brama && ak[0].brama[0]) || "") : real.ping; if (!cel) return null;
      const w = await wynik("ping " + cel); if (w == null) return null;
      const m = /(Average|średni|sredni|średnio)\s*=\s*(\d+)\s*ms/i.exec(w); if (!m) return false;   // ang. „Average”, pl. „Czas średni”
      const x = parseInt(a.replace(/[^0-9]/g, ""), 10), sr = +m[2];   // „<1 ms” → 1 return Math.abs(x - sr) <= Math.max(5, sr * 0.3);
    }
    return null;
  }
  // stały „los” dla ucznia: ten sam cel przy każdym otwarciu, sąsiad ma zwykle inny
  function wybierz(lista, klucz) { let h = 0; for (const c of String(klucz)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return lista[h % lista.length]; }
  // czy okno gry zasłania Veyon (demonstracja nauczyciela, blokada ekranu) – wtedy wyjście z okna nie jest alarmem
  async function veyon() { if (!P) return false; try { return !!(await zapytaj("/okno")).veyon; } catch (e) { return false; } }
  /* Bez aplikacji (zwykła przeglądarka): czy odpowiedź przepisana z prawdziwego Wiersza polecenia ma sens.
     dane – wcześniejsze odpowiedzi ucznia z tego komputera (np. MAC do sprawdzenia przeliczenia ostatniej pary). */
  function wiarygodne(real, v, dane = {}) {
    const ip = (t) => { const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(String(t).trim()); return m && m.slice(1).every((x) => +x <= 255) ? m.slice(1).map(Number) : null; };
    const prywatny = (a) => a[0] === 10 || (a[0] === 172 && a[1] >= 16 && a[1] <= 31) || (a[0] === 192 && a[1] === 168);
    const liczba = (t, od, doo) => { const x = parseInt(String(t).replace(/[^0-9]/g, ""), 10); return !isNaN(x) && x >= od && x <= doo; };
    const a = String(v || "").trim();
    switch (real) {
      case "ip": { const x = ip(a); return !!x && prywatny(x) && x[3] !== 0 && x[3] !== 255; }
      case "brama": { const x = ip(a), moj = dane.ip && ip(dane.ip); return !!x && prywatny(x) && (!moj || (moj[0] === x[0] && moj[1] === x[1])); }
      case "dns": return !!ip(a);
      case "mac": { const m = mac(a); return m.length === 12 && !/^(0{12}|F{12})$/.test(m); }
      case "mac_ost_dec": return dane.mac ? String(parseInt(mac(dane.mac).slice(-2), 16)) === a.replace(/\s/g, "") : liczba(a, 0, 255);
      case "nazwa": return /^[A-Za-z0-9_-]{1,15}$/.test(a);
      case "ram": return liczba(a, 1, 512);
      case "procesor": return a.length >= 4;
      case "system": return /windows/i.test(a);
    }
    if (real && real.nslookup) { const x = ip(a); return !!x && !prywatny(x) && x[0] !== 127; }
    if (real && real.tracert) return liczba(a, 2, 30);
    if (real && real.ping) return liczba(a, 0, 300);
    return !!a;
  }
  window.KONSOLA = { dostepna, otworz, uruchom, info, sprawdz, wybierz, veyon, wiarygodne };
})();
