/* AGENCJA – kartkówki i sprawdziany w grze (uruchamia nauczyciel; bez hasła).
   Treść testu jest zaszyfrowana (testy-*.js → window.TESTY_ZASZ[id]); klucz przysyła skrypt nauczyciela.
   Rodzaje pytań: wybor, wiele, wpisz, kolej, para, wymien (pola, rozpoznawanie jak w burzy mózgów),
   real (prawdziwe dane komputera – konsola.js), otwarte (sprawdza nauczyciel w panelu).
   Wynik: { s, sAuto, m, otw {id: {q, odp, m, kryt, p}}, doOceny, bledne [nr], odp } */
(function () {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tasuj = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const zCelem = (t, c) => (c ? String(t).split("{cel}").join(c) : t);
  const pytanie = (p, u) => (u.c ? Object.assign({}, p, { q: zCelem(p.q, u.c), real: p.real && typeof p.real === "object" ? Object.fromEntries(Object.entries(p.real).map(([k, v]) => [k, zCelem(v, u.c)])) : p.real }) : p);
  const norm = (t) => String(t || "").toLowerCase().trim().replace(/\s+/g, " ").replace(/[„”"'.,;!?]/g, "");

  async function odszyfruj(b64, haslo) {   // ten sam format co sprawdziany.html: sól 16 B, IV 12 B, AES-GCM, PBKDF2 150 000
    const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), sol = raw.slice(0, 16), iv = raw.slice(16, 28), ct = raw.slice(28);
    const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(haslo), "PBKDF2", false, ["deriveKey"]);
    const k = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: sol, iterations: 150000, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, k, ct)));
  }

  /* Ustala pytania dla ucznia: losowy wybór (def.ile) i kolejność, potasowane odpowiedzi. Zapisywane w szkicu,
     żeby po odświeżeniu strony uczeń miał te same pytania. */
  function ulozenie(def) {
    let nr = def.pyt.map((_, i) => i);
    if (def.ile && def.ile < nr.length) nr = tasuj(nr).slice(0, def.ile).sort((a, b) => a - b);
    if (def.tasuj !== false) nr = tasuj(nr);
    return nr.map((i) => { const p = def.pyt[i], u = { i };
      if (p.cele) u.c = p.cele[Math.floor(Math.random() * p.cele.length)];   // zadanie z konsolą: każdy uczeń ma swoją domenę
      if (p.o) u.o = p.tasuj === false ? p.o.map((_, j) => j) : tasuj(p.o.map((_, j) => j));   // tasuj: false – kolejność a, b, c, d jak na kartce
      if (p.typ === "kolej") { let k; do { k = tasuj(p.el.map((_, j) => j)); } while (k.every((v, j) => v === j) && p.el.length > 1); u.k = k; }
      if (p.typ === "para") u.r = tasuj(p.r.map((_, j) => j));
      return u; });
  }

  function poleHTML(p, u, n, odp) {
    const o = odp[n];
    if (p.typ === "wybor") return u.o.map((j) => `<label class="ts-o"><input type="radio" name="q${n}" value="${j}" ${o == j ? "checked" : ""}> ${esc(p.o[j])}</label>`).join("");
    if (p.typ === "wiele") return `<p class="mala">Zaznacz wszystkie poprawne.</p>` + u.o.map((j) => `<label class="ts-o"><input type="checkbox" name="q${n}" value="${j}" ${(o || []).includes(j) ? "checked" : ""}> ${esc(p.o[j])}</label>`).join("");
    if (p.typ === "wymien") return `<div class="ts-wym">${Array.from({ length: p.n }, (_, j) => `<input data-w="${j}" value="${esc((o || [])[j] || "")}" placeholder="${j + 1}." autocomplete="off">`).join("")}</div>`;
    if (p.typ === "otwarte") return `<textarea rows="4" data-t maxlength="1500" placeholder="Twoja odpowiedź">${esc(o || "")}</textarea>`;
    if (p.typ === "kolej") return `<ol class="kolej ts-kolej" data-k></ol>`;
    if (p.typ === "para") return `<div class="pary">${p.l.map((t, j) => `<label class="para"><span>${esc(t)}</span><select data-p="${j}"><option value="">— wybierz —</option>${u.r.map((r) => `<option value="${r}" ${o && o[j] == r ? "selected" : ""}>${esc(p.r[r])}</option>`).join("")}</select></label>`).join("")}</div>`;
    const ks = p.typ !== "real" || !window.KONSOLA ? "" : window.KONSOLA.dostepna() ? ` <button type="button" class="drugi" data-konsola>🖥️ Konsola</button>`
      : ` <button type="button" class="drugi" data-cmd title="Przez 2 minuty wyjście do Wiersza polecenia nie jest liczone jako wyjście z testu">🖥 Idę do Wiersza polecenia (2 min)</button>`;
    return `<input class="wpis" data-t value="${esc(o || "")}" placeholder="${esc(p.ph || "")}" autocomplete="off" spellcheck="false">${ks}`;
  }

  async function ocen(def, ul, odp) {
    let sAuto = 0, m = 0; const otw = {}, bledne = [];
    for (let n = 0; n < ul.length; n++) {
      const p = pytanie(def.pyt[ul[n].i], ul[n]), o = odp[n], pk = p.pkt || 1, id = p.id || "q" + ul[n].i;
      m += pk;
      let zd = 0;
      if (p.typ === "wybor") zd = o != null && +o === p.a ? pk : 0;
      else if (p.typ === "wiele") zd = Array.isArray(o) && o.length === p.a.length && p.a.every((x) => o.includes(x)) ? pk : 0;
      else if (p.typ === "wpisz") zd = (p.ok || []).some((x) => norm(x) === norm(o)) ? pk : 0;
      else if (p.typ === "kolej") zd = Array.isArray(o) && o.every((v, j) => v === j) ? pk : 0;
      else if (p.typ === "para") zd = o && p.l.every((_, j) => +o[j] === j) ? pk : 0;
      else if (p.typ === "wymien") {   // ile różnych poprawnych odpowiedzi → punkty wg skali
        const B = window.BURZA, traf = new Set();
        (o || []).filter((x) => String(x).trim()).forEach((x) => {
          const kx = B.klucz(x);
          p.klucze.forEach((g, gi) => { if (g.some((w) => B.podobne(B.klucz(w), kx) || norm(w) === norm(x))) traf.add(gi); });
        });
        zd = p.skala ? p.skala[Math.min(traf.size, p.skala.length - 1)] : Math.min(pk, traf.size);
      } else if (p.typ === "real") {
        const r = o && window.KONSOLA ? await window.KONSOLA.sprawdz(p.real, o) : null;
        if (r === null) {   // poza aplikacją: ocenia nauczyciel, z podpowiedzią, czy odpowiedź ma sens
          const ok = o && window.KONSOLA && window.KONSOLA.wiarygodne(p.real, o, {});
          otw[id] = { q: p.q, odp: String(o || ""), m: pk, kryt: (p.kryt || "") + (o ? (ok ? " · ✔ odpowiedź wygląda wiarygodnie" : " · ✘ odpowiedź wygląda na niepoprawną") : "") }; continue;
        }
        zd = r ? pk : 0;
      } else if (p.typ === "otwarte") {
        if (!String(o || "").trim()) { zd = 0; bledne.push(n + 1); continue; }
        otw[id] = { q: p.q, odp: String(o).slice(0, 1500), m: pk, kryt: p.kryt || "" }; continue;
      }
      sAuto += zd; if (zd < pk) bledne.push(n + 1);
    }
    return { sAuto, s: sAuto, m, otw, doOceny: Object.keys(otw).length, bledne };
  }

  /* o: { def, ul (ułożenie ze szkicu albo nowe), odp, koniec (ms), tytul, szkic(ul, odp), wyj (wyjścia z gry do tej pory), naWyjscie(n) } → Promise(wynik)
     Wyjście z gry dłuższe niż ~3 s: 1. i 2. raz ostrzeżenie, za 3. razem test oddaje się sam z karą (ocena 1; nauczyciel może cofnąć w Panelu).
     Nie liczy się praca w Wierszu polecenia po kliknięciu „Idę do Wiersza polecenia” (window.AGENCJA_CMD_TERAZ). */
  function uruchom(o) {
    return new Promise((gotowe) => {
      const def = o.def, ul = o.ul || ulozenie(def), odp = o.odp || {};
      const w = document.createElement("div"); w.className = "nakladka nak-test";
      w.innerHTML = `<div class="okno" role="dialog" aria-modal="true" aria-label="${esc(o.tytul)}">
        <div class="ts-gora"><b>${esc(o.tytul)}</b><span class="ts-czas" aria-live="off"></span><button class="glowny" data-oddaj>Oddaj ✔</button></div><div class="ts-ostrz-box" aria-live="assertive"></div>
        <div class="ts-lista">${ul.map((u, n) => { const p = pytanie(def.pyt[u.i], u);
          return `<section class="ts-pyt" data-n="${n}"><h3><span class="ts-nr">${n + 1}.</span> ${esc(p.q)} <small>(${p.pkt || 1} pkt)</small></h3>${p.img ? `<p>${p.img}</p>` : ""}${poleHTML(p, u, n, odp)}</section>`; }).join("")}</div>
        <p class="mala">Odpowiedzi zapisują się na bieżąco. Gdy skończy się czas, test odda się sam.</p></div>`;
      document.body.appendChild(w);
      const zapiszSzkic = () => { if (o.szkic) o.szkic(ul, odp); };
      ul.forEach((u, n) => {
        const s = w.querySelector(`.ts-pyt[data-n="${n}"]`), p = pytanie(def.pyt[u.i], u);
        s.querySelectorAll("input[type=radio]").forEach((x) => (x.onchange = () => { odp[n] = +x.value; zapiszSzkic(); }));
        s.querySelectorAll("input[type=checkbox]").forEach((x) => (x.onchange = () => { odp[n] = [...s.querySelectorAll("input:checked")].map((c) => +c.value); zapiszSzkic(); }));
        s.querySelectorAll("[data-w]").forEach((x) => (x.oninput = () => { odp[n] = [...s.querySelectorAll("[data-w]")].map((c) => c.value); zapiszSzkic(); }));
        s.querySelectorAll("[data-t]").forEach((x) => (x.oninput = () => { odp[n] = x.value; zapiszSzkic(); }));
        s.querySelectorAll("[data-p]").forEach((x) => (x.onchange = () => { odp[n] = [...s.querySelectorAll("[data-p]")].map((c) => c.value === "" ? null : +c.value); zapiszSzkic(); }));
        const ks = s.querySelector("[data-konsola]"); if (ks) ks.onclick = () => window.KONSOLA.otworz({ podpowiedz: p.q });
        const kc = s.querySelector("[data-cmd]"); if (kc) kc.onclick = () => { if (window.AGENCJA_CMD) window.AGENCJA_CMD(2); kc.textContent = "🖥 Masz 2 min: Win + R → cmd → Enter"; };
        const ol = s.querySelector("[data-k]");
        if (ol) {   // kolejność: przeciąganie (jak w misjach) albo strzałki ↑/↓
          let kol = Array.isArray(odp[n]) ? odp[n].slice() : u.k.slice();
          const rys = () => {
            ol.innerHTML = kol.map((ix, q) => `<li tabindex="0" data-q="${q}"><span>${esc(p.el[ix])}</span><span class="uchwyt" aria-hidden="true">⠿</span></li>`).join("");
            ol.querySelectorAll("li").forEach((li) => {
              li.onkeydown = (ev) => { const a = +li.dataset.q, b = ev.key === "ArrowUp" ? a - 1 : ev.key === "ArrowDown" ? a + 1 : -1;
                if (b < 0 || b >= kol.length) return; ev.preventDefault(); [kol[a], kol[b]] = [kol[b], kol[a]]; odp[n] = kol.slice(); zapiszSzkic(); rys(); ol.querySelector(`li[data-q="${b}"]`).focus(); };
              li.onpointerdown = (ev) => {
                if (ev.button > 0) return; ev.preventDefault(); li.classList.add("ciagnie");
                const ruch = (m) => { const za = [...ol.children].filter((x) => x !== li).find((x) => { const r = x.getBoundingClientRect(); return m.clientY < r.top + r.height / 2; });
                  if (za !== li.nextElementSibling) ol.insertBefore(li, za || null); };
                const kon = () => { removeEventListener("pointermove", ruch); removeEventListener("pointerup", kon); removeEventListener("pointercancel", kon);
                  const st = kol.slice(); kol = [...ol.children].map((x) => st[+x.dataset.q]); odp[n] = kol.slice(); zapiszSzkic(); rys(); };
                addEventListener("pointermove", ruch); addEventListener("pointerup", kon); addEventListener("pointercancel", kon);
              };
            });
          };
          rys();
        }
      });
      let skonczony = false, wyj = o.wyj || 0, pozaS = 0, liczone = false;
      const box = w.querySelector(".ts-ostrz-box");
      const pokazOstrz = () => { box.innerHTML = wyj && wyj < 3 ? `<div class="ts-ostrz">⚠ Wyjście z gry zapisane – ${wyj === 1 ? "pierwsze ostrzeżenie" : "drugie, ostatnie ostrzeżenie"}. Przy trzecim wyjściu test odda się sam z oceną niedostateczną.</div>` : ""; };
      const pilnuj = setInterval(() => {
        if (skonczony) return;
        if (!(document.hidden || !document.hasFocus())) { pozaS = 0; liczone = false; return; }
        if (window.AGENCJA_CMD_TERAZ && window.AGENCJA_CMD_TERAZ()) return;
        if (++pozaS >= 3 && !liczone) { liczone = true; wyj++; if (o.naWyjscie) o.naWyjscie(wyj); pokazOstrz(); if (wyj >= 3) oddaj(true, "3 wyjścia z gry w czasie testu"); }
      }, 1000);
      const oddaj = async (auto, kara) => {
        if (skonczony) return;
        if (!auto) {
          const puste = ul.filter((_, n) => odp[n] == null || odp[n] === "" || (Array.isArray(odp[n]) && !odp[n].some((x) => x != null && x !== ""))).length;
          if (!confirm(puste ? `Bez odpowiedzi: ${puste}. Na pewno oddać test?` : "Oddać test? Potem nie będzie można nic zmienić.")) return;
        }
        skonczony = true; clearInterval(zeg); clearInterval(pilnuj);
        w.querySelector(".okno").innerHTML = `<p>⏳ Sprawdzam odpowiedzi…</p>`;
        const r = await ocen(def, ul, odp); r.odp = odp; r.ul = ul.map((u) => u.i); r.wyj = wyj; if (kara) r.kara = kara;
        w.remove(); gotowe(r);
      };
      w.querySelector("[data-oddaj]").onclick = () => oddaj(false);
      const cz = w.querySelector(".ts-czas");
      const tyk = () => {
        const z = Math.max(0, o.koniec - Date.now()), mm = Math.floor(z / 60000), ss = Math.floor(z / 1000) % 60;
        cz.textContent = `⏱ ${mm}:${String(ss).padStart(2, "0")}`; cz.classList.toggle("malo", z < 60000);
        if (z <= 0) oddaj(true);
      };
      const zeg = setInterval(tyk, 500); tyk();
      pokazOstrz(); if (wyj >= 3) oddaj(true, "3 wyjścia z gry w czasie testu");
    });
  }
  window.TESTY_GRA = { odszyfruj, ulozenie, uruchom, ocen };
})();
