/* AGENCJA – przelicznik systemów liczbowych (2, 10, 16) do zadań w grze.
   Kreator krok po kroku: uczeń sam wpisuje każdy krok (wartość cyfry, iloczyn, sumę albo dzielenie z resztą),
   kreator od razu sprawdza wpis i podpowiada, ale nie podaje wyniku. Kalkulator (wynik od razu) jest opcjonalny –
   gra nalicza za niego karę w zadaniu. */
(function () {
  "use strict";
  const CYF = "0123456789ABCDEF", NAZWA = { 2: "dwójkowy", 10: "dziesiętny", 16: "szesnastkowy" };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const czysc = (t) => String(t).toUpperCase().replace(/[\s:.\-]/g, "");
  const poprawna = (t, b) => t.length > 0 && t.length <= 16 && [...t].every((c) => CYF.indexOf(c) >= 0 && CYF.indexOf(c) < b);
  const pole = (ok, pod, sz = 5) => `<input class="pz-p" data-ok="${esc(ok)}" data-pod="${esc(pod)}" size="${sz}" autocomplete="off" spellcheck="false" inputmode="${/^\d+$/.test(ok) ? "numeric" : "text"}">`;
  const pot = (b, k) => k === 0 ? "1" : k === 1 ? String(b) : `${b}<sup>${k}</sup>`;

  function naDziesietny(t, b) {   // każda cyfra × potęga podstawy, potem suma
    const n = t.length, wiersze = [...t].map((c, i) => {
      const k = n - 1 - i, w = CYF.indexOf(c), p = b ** k;
      const wart = w > 9 ? `${pole(w, `Litery w systemie szesnastkowym: A=10, B=11, C=12, D=13, E=14, F=15.`, 3)}` : `<b>${w}</b>`;
      return `<tr><td class="pz-c">${c}</td><td>${wart}</td><td>× ${pot(b, k)}${k > 1 ? ` <small>(= ${p})</small>` : ""}</td><td>= ${pole(w * p, `Pomnóż wartość cyfry przez ${p}.`)}</td></tr>`;
    }).join("");
    return `<h3>${esc(t)}<sub>${b}</sub> → system dziesiętny</h3>
      <p class="mala">Każdą cyfrę mnożymy przez potęgę liczby ${b} – od prawej: ${pot(b, 0)}, ${pot(b, 1)}, ${pot(b, 2)}… – i wszystko dodajemy.</p>
      <table class="pz-tab"><tr><th>cyfra</th><th>wartość</th><th>waga</th><th>iloczyn</th></tr>${wiersze}
      <tr class="pz-suma"><td colspan="3">suma iloczynów</td><td>= ${pole(parseInt(t, b), "Dodaj wszystkie iloczyny z ostatniej kolumny.", 7)}</td></tr></table>`;
  }
  function zDziesietnego(x, b) {   // dzielenie przez podstawę z resztą, reszty czytane od dołu
    const w = []; let n = x;
    do { w.push([n, Math.floor(n / b), n % b]); n = Math.floor(n / b); } while (n > 0);
    return `<h3>${x}<sub>10</sub> → system ${NAZWA[b]}</h3>
      <p class="mala">Dzielimy przez ${b} i zapisujemy reszty, aż wynik dzielenia będzie 0. Wynik to reszty czytane <b>od dołu do góry</b>.${b === 16 ? " Reszty od 10 do 15 zapisujemy literami A–F." : ""}</p>
      <table class="pz-tab">${w.map(([a, q, r]) => `<tr><td>${a} ÷ ${b} =</td><td>${pole(q, `Ile razy ${b} mieści się w ${a}? (część całkowita)`)}</td><td>reszta</td><td>${pole(r, `Reszta = ${a} − ${b} × (wynik dzielenia).`, 3)}</td></tr>`).join("")}
      <tr class="pz-suma"><td colspan="3">reszty od dołu do góry</td><td>${pole(x.toString(b).toUpperCase(), b === 16 ? "Czytaj reszty od ostatniej do pierwszej; 10–15 zamień na A–F." : "Czytaj reszty od ostatniej do pierwszej.", 10)}</td></tr></table>`;
  }

  function otworz(o = {}) {
    const n = document.createElement("div");
    n.className = "nakladka nak-przel";
    n.innerHTML = `<div class="okno" role="dialog" aria-modal="true" aria-label="Przelicznik systemów liczbowych">
      <div class="pz-gora"><h2>🧮 Przelicznik</h2><button class="ikona" data-zamknij aria-label="Zamknij">✕</button></div>
      <form class="pz-dane">
        <label>Liczba<input name="l" autocomplete="off" spellcheck="false" value="${esc(o.liczba || "")}" placeholder="np. FF"></label>
        <label>z systemu<select name="z">${[16, 10, 2].map((b) => `<option value="${b}" ${b === (o.z || 16) ? "selected" : ""}>${NAZWA[b]}</option>`).join("")}</select></label>
        <label>na<select name="na">${[10, 2, 16].map((b) => `<option value="${b}" ${b === (o.na || 10) ? "selected" : ""}>${NAZWA[b]}</option>`).join("")}</select></label>
        <button class="glowny">Licz krok po kroku ▸</button></form>
      <p class="blad pz-blad"></p><div class="pz-kroki" aria-live="polite"></div>
      ${o.kalkulator ? `<p class="pz-kalk"><button class="link" data-kalk>🧮 Pokaż od razu wynik${o.kara ? ` (${o.kara})` : ""}</button></p><div class="pz-wynik"></div>` : ""}</div>`;
    document.body.appendChild(n);
    const f = n.querySelector("form"), kroki = n.querySelector(".pz-kroki"), bl = n.querySelector(".pz-blad");
    const zamknij = () => n.remove();
    n.querySelector("[data-zamknij]").onclick = zamknij;
    n.addEventListener("keydown", (ev) => { if (ev.key === "Escape") zamknij(); });
    const dane = () => {
      const t = czysc(f.l.value), z = +f.z.value, na = +f.na.value;
      if (!poprawna(t, z)) { bl.textContent = `To nie jest liczba w systemie ${NAZWA[z]}m${z === 2 ? " (tylko 0 i 1)" : z === 10 ? " (cyfry 0–9)" : " (cyfry 0–9 i litery A–F)"}.`; return null; }
      if (z === na) { bl.textContent = "Wybierz dwa różne systemy."; return null; }
      bl.textContent = ""; return { t, z, na, x: parseInt(t, z) };
    };
    function etap(html, dalej) {   // sekcja kreatora; gdy wszystkie pola dobrze – pokazuje wynik i ewentualnie kolejny etap
      const d = document.createElement("div"); d.className = "pz-etap"; d.innerHTML = html; kroki.appendChild(d);
      const pola = [...d.querySelectorAll(".pz-p")];
      pola.forEach((p) => p.addEventListener("input", () => {
        const v = czysc(p.value), ok = czysc(p.dataset.ok);
        p.classList.toggle("ok", v === ok); p.classList.toggle("zle", v !== "" && v !== ok && v.length >= ok.length);
        p.title = p.classList.contains("zle") ? p.dataset.pod : "";
        let pd = p.parentElement.querySelector(".pz-pod");
        if (p.classList.contains("zle")) { if (!pd) { pd = document.createElement("div"); pd.className = "pz-pod"; p.parentElement.appendChild(pd); } pd.textContent = "💡 " + p.dataset.pod; }
        else if (pd) pd.remove();
        if (v === ok) { const nast = pola[pola.indexOf(p) + 1]; if (nast && !nast.value) nast.focus(); }
        if (pola.every((x) => x.classList.contains("ok")) && !d.dataset.gotowe) { d.dataset.gotowe = 1; d.insertAdjacentHTML("beforeend", `<p class="pz-brawo">✔ Świetnie! Policzone samodzielnie.</p>`); if (dalej) dalej(); }
      }));
      if (pola[0]) pola[0].focus();
    }
    f.onsubmit = (ev) => {
      ev.preventDefault(); const d = dane(); if (!d) return;
      kroki.innerHTML = "";
      if (d.na === 10) etap(naDziesietny(d.t, d.z));
      else if (d.z === 10) etap(zDziesietnego(d.x, d.na));
      else etap(naDziesietny(d.t, d.z), () => etap(zDziesietnego(d.x, d.na)));   // np. 2 → 16 przez system dziesiętny
    };
    const k = n.querySelector("[data-kalk]");
    if (k) k.onclick = () => {
      const d = dane(); if (!d) return;
      if (o.kalk) o.kalk();
      n.querySelector(".pz-wynik").innerHTML = `<table class="pz-tab">${[10, 16, 2].map((b) => `<tr><td>${NAZWA[b]}</td><td><b>${d.x.toString(b).toUpperCase()}</b></td></tr>`).join("")}</table>`;
    };
    (f.l.value ? f.querySelector("button") : f.l).focus();
    return n;
  }
  // zadania, przy których gra pokazuje przycisk przelicznika
  const dotyczy = (z) => !!z.przel || /szesnastkow|dwójkow|binarn|system(ie|u)? (dziesiętn|liczbow)|na (system )?dziesiętn/i.test(String(z.q || ""));
  window.PRZELICZNIK = { otworz, dotyczy };
})();
