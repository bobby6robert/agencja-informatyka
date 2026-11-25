/* AGENCJA – animacje do teczek rozdziału 2 „Grafika komputerowa” (dopisują się do ANIMACJE z animacje-sieci.js):
   piksele – obraz rastrowy pod lupą: siatka pikseli, kolor klikniętego piksela,
   skala   – ten sam znak powiększany jako raster i jako wektor,
   kadr    – skalowanie i kadrowanie zdjęcia 1500 × 1002 px do 851 × 315 px (przykład z podręcznika),
   warstwy – trzy warstwy fotomontażu: widoczność, rozsunięcie, maska warstwy,
   wezly   – ścieżka z węzłów i segmentów; węzły można przeciągać i dodawać,
   wykres  – te same dane jako wykres kołowy i jako prostokąty (współczynnik kłamstwa). */
(function () {
  "use strict";
  const A = window.ANIMACJE; if (!A || !A.dodaj) return;
  const st = document.createElement("style");
  st.textContent = `.ag-p{font-size:1.05rem;margin:10px 0}.ag-m{opacity:.75;font-size:.9rem}
.ag-prz{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;align-items:center}.ag-prz label{display:flex;gap:6px;align-items:center}
.ag-prz input[type=range]{width:min(22em,60vw);accent-color:var(--akc,#fca311)}.ag-prz input[type=checkbox]{width:1.2em;height:1.2em;accent-color:var(--akc,#fca311)}
.ag-prz button[aria-pressed=true]{background:var(--akc,#fca311);color:#111}
.ag-sc{background:color-mix(in srgb,var(--tlo,#111) 70%,#000);border-radius:12px;padding:14px;display:flex;gap:18px;flex-wrap:wrap;justify-content:center;align-items:flex-start}
.ag-ok{width:280px;height:280px;overflow:hidden;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;border:2px solid var(--panel2,#223)}
.ag-kol{text-align:center}.ag-kol b{display:block;margin-bottom:6px;color:var(--akc2,#4cc9f0)}
.ag-inf{background:var(--panel2,#223);border-radius:10px;padding:10px 14px;margin:10px 0;font-size:1.05rem;min-height:2.6em}.ag-inf b{color:var(--akc,#fca311)}
.ag-inf i{display:inline-block;width:1.1em;height:1.1em;border-radius:4px;border:1px solid #fff;vertical-align:-.2em;margin-right:.3em}
.ag-px{image-rendering:pixelated;image-rendering:crisp-edges}
.ag-st{position:relative;width:360px;height:240px;margin:20px 30px;transition:all .5s}
.ag-st>*{position:absolute;inset:0;width:100%;height:100%;border-radius:8px;transition:all .5s;box-shadow:0 0 0 1px #0006}
.ag-st.ag-roz{transform:perspective(900px) rotateX(48deg) rotateZ(-18deg);margin:50px 60px 60px}
.ag-st.ag-roz>:nth-child(2){transform:translateZ(60px)}.ag-st.ag-roz>:nth-child(3){transform:translateZ(120px)}
.ag-kratka{background:repeating-conic-gradient(#bbb 0 25%,#eee 0 50%) 0 0/20px 20px}
.ag-wz{cursor:grab;touch-action:none}`;
  document.head.appendChild(st);
  const h = (el, html) => { el.innerHTML = html; return (s) => el.querySelector(s); };

  /* ---------- 1. piksele pod lupą ---------- */
  A.dodaj("piksele", "Piksele pod lupą", (el) => {
    const R = ["....yyyy....", "..yyyyyyyy..", ".yyyyyyyyyy.", ".yykkyykkyy.", "yyykkyykkyyy", "yyyyyyyyyyyy", "yyyyyyyyyyyy", "yykyyyyyykyy", ".yykkkkkkyy.", ".yyyrrrryyy.", "..yyyyyyyy..", "....yyyy...."];
    const K = { ".": ["#1b2a4a", "granatowy"], y: ["#ffd23f", "żółty"], k: ["#111111", "czarny"], r: ["#e63946", "czerwony"] };
    const N = R.length;
    const q = h(el, `<p class="ag-p">To jest obraz rastrowy o wymiarach <b>${N} × ${N} px</b>, czyli ${N * N} pikseli. Przesuń suwak, żeby go powiększyć, i kliknij dowolny piksel.</p>
      <div class="ag-prz"><label>🔍 Powiększenie <input type="range" min="2" max="28" value="3" data-z></label><b data-zt></b></div>
      <div class="ag-sc"><div style="width:340px;height:340px;display:flex;align-items:center;justify-content:center"><svg data-s viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges">
        ${R.map((w, y) => [...w].map((c, x) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${K[c][0]}" data-p="${x},${y},${c}" style="cursor:pointer"/>`).join("")).join("")}
        <g data-g stroke="#ffffff66" stroke-width=".04">${Array.from({ length: N + 1 }, (_, i) => `<path d="M${i} 0V${N}M0 ${i}H${N}"/>`).join("")}</g>
        <rect data-r width="1" height="1" fill="none" stroke="#fff" stroke-width=".12" visibility="hidden"/></svg></div></div>
      <div class="ag-inf" data-i>Przy małym powiększeniu widzisz buźkę. Im większe powiększenie, tym wyraźniej widać, że to tylko kolorowe kwadraty.</div>`);
    const s = q("[data-s]"), z = q("[data-z]");
    const rys = () => { const v = +z.value; s.style.width = s.style.height = N * v + "px"; q("[data-g]").style.display = v >= 12 ? "" : "none";
      q("[data-zt]").textContent = `1 piksel obrazu = ${v} × ${v} pikseli ekranu` + (v >= 12 ? " · widać siatkę pikseli" : ""); };
    z.oninput = rys; rys();
    s.onclick = (ev) => { const p = ev.target.dataset && ev.target.dataset.p; if (!p) return; const [x, y, c] = p.split(","), hx = K[c][0];
      const rgb = [1, 3, 5].map((i) => parseInt(hx.slice(i, i + 2), 16)).join(", ");
      const r = q("[data-r]"); r.setAttribute("x", x); r.setAttribute("y", y); r.setAttribute("visibility", "visible");
      q("[data-i]").innerHTML = `<i style="background:${hx}"></i>Piksel w kolumnie <b>${+x + 1}</b> i wierszu <b>${+y + 1}</b> ma kolor <b>${K[c][1]}</b> (RGB: ${rgb}). Piksel to najmniejszy element obrazu – ma tylko jedną cechę: kolor.`; };
    return null;
  });

  /* ---------- 2. raster kontra wektor ---------- */
  A.dodaj("skala", "Powiększanie: raster kontra wektor", (el) => {
    const q = h(el, `<p class="ag-p">Ten sam znak zapisany na dwa sposoby. Powiększaj i obserwuj krawędzie.</p>
      <div class="ag-prz"><label>🔍 Powiększenie <input type="range" min="1" max="12" step="0.5" value="1" data-z></label><b data-zt></b></div>
      <div class="ag-sc"><div class="ag-kol"><b>Grafika rastrowa (32 × 32 px)</b><div class="ag-ok"><canvas data-c width="32" height="32" class="ag-px"></canvas></div></div>
        <div class="ag-kol"><b>Grafika wektorowa (ścieżki)</b><div class="ag-ok"><svg data-v viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="#ffd23f" stroke="#1b2a4a" stroke-width="2"/><path d="M9 17l5 5 9-11" fill="none" stroke="#1b2a4a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div></div>
      <div class="ag-inf" data-i></div>`);
    const c = q("[data-c]"), g = c.getContext("2d"), v = q("[data-v]"), z = q("[data-z]");
    g.fillStyle = "#ffd23f"; g.strokeStyle = "#1b2a4a"; g.lineWidth = 2; g.beginPath(); g.arc(16, 16, 13, 0, 7); g.fill(); g.stroke();
    g.lineWidth = 3; g.lineCap = g.lineJoin = "round"; g.beginPath(); g.moveTo(9, 17); g.lineTo(14, 22); g.lineTo(23, 11); g.stroke();
    const rys = () => { const k = +z.value, w = 64 * k + "px"; c.style.width = c.style.height = v.style.width = v.style.height = w; c.style.flex = v.style.flex = "none";
      q("[data-zt]").textContent = `${k}×`;
      q("[data-i]").innerHTML = k < 2.5 ? "W małym rozmiarze oba obrazy wyglądają podobnie."
        : "<b>Raster:</b> powiększają się piksele, więc na krawędziach widać „schodki”. <b>Wektor:</b> komputer przelicza wzory od nowa i rysuje gładką krawędź w każdej skali."; };
    z.oninput = rys; rys();
    return null;
  });

  /* ---------- 3. skalowanie i kadrowanie ---------- */
  A.dodaj("kadr", "Skalowanie i kadrowanie (1500 × 1002 → 851 × 315)", (el) => {
    const SC = `<svg viewBox="0 0 1500 1002" preserveAspectRatio="none" style="display:block;width:100%;height:100%"><rect width="1500" height="1002" fill="#8ecae6"/><circle cx="1180" cy="230" r="110" fill="#ffd23f"/>
      <path d="M0 640L330 330l260 250 250-330 660 420v332H0z" fill="#588157"/><path d="M0 760l420-180 380 150 700-200v472H0z" fill="#3a5a40"/>
      <rect x="640" y="560" width="150" height="130" fill="#e9c46a"/><path d="M620 565l95-95 95 95z" fill="#bc4749"/><circle cx="300" cy="170" r="60" fill="#fff"/><circle cx="370" cy="180" r="75" fill="#fff"/><circle cx="450" cy="175" r="55" fill="#fff"/></svg>`;
    const K = [
      ["Oryginał", 1500, 1002, 0, "Zdjęcie ma <b>1500 × 1002 px</b>. Potrzebujemy tła o wymiarach <b>851 × 315 px</b> – ma inne proporcje (jest dużo szersze niż wyższe)."],
      ["✘ Skalowanie bez proporcji", 851, 315, 0, "Rozpięty łańcuch: wpisujemy od razu 851 × 315 px. Wymiary się zgadzają, ale obraz jest <b>zniekształcony</b> – spłaszczony dom i słońce."],
      ["1. Skaluj z proporcjami", 851, 568, 0, "Zapięty łańcuch: ustawiamy szerokość <b>851 px</b>, wysokość sama zmienia się na <b>568 px</b>. Nic nie jest zniekształcone, ale obraz jest za wysoki."],
      ["2. Kadruj", 851, 568, 1, "Odcinamy nadmiar z góry i z dołu: zostaje <b>851 × 315 px</b>. Suwakiem wybierz, która część zdjęcia zostanie w kadrze."]];
    let i = 0;
    const q = h(el, `<div class="ag-prz">${K.map((k, j) => `<button class="drugi" data-k="${j}">${k[0]}</button>`).join("")}</div>
      <div class="ag-prz" data-sw hidden><label>↕ Położenie kadru <input type="range" min="0" max="253" value="120" data-y></label></div>
      <div class="ag-sc" style="min-height:290px;align-items:center"><div class="ag-kol"><b data-w></b><div data-o style="position:relative;overflow:hidden;border-radius:6px;transition:all .5s"><div data-s style="position:absolute;left:0;transition:width .5s,height .5s"></div></div></div></div>
      <div class="ag-inf" data-i></div>`);
    q("[data-s]").innerHTML = SC;
    const rys = () => { const [, w, hh, kadr, op] = K[i], f = 0.25, o = q("[data-o]"), s = q("[data-s]"), y = +q("[data-y]").value;
      el.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.k === i));
      q("[data-sw]").hidden = !kadr; s.style.width = w * f + "px"; s.style.height = hh * f + "px"; s.style.top = (kadr ? -y * f : 0) + "px";
      o.style.width = w * f + "px"; o.style.height = (kadr ? 315 : hh) * f + "px"; o.style.outline = kadr ? "3px dashed var(--akc,#fca311)" : "none";
      q("[data-w]").textContent = `${w} × ${kadr ? 315 : hh} px`; q("[data-i]").innerHTML = op; };
    el.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => { i = +b.dataset.k; rys(); }));
    q("[data-y]").oninput = rys; rys();
    return null;
  });

  /* ---------- 4. warstwy i maska ---------- */
  A.dodaj("warstwy", "Warstwy i maska warstwy", (el) => {
    const q = h(el, `<p class="ag-p">Fotomontaż z trzech warstw – jak trzy przezroczyste folie ułożone jedna na drugiej.</p>
      <div class="ag-prz"><label><input type="checkbox" checked data-w="0"> 👁 Tło: krajobraz</label><label><input type="checkbox" checked data-w="1"> 👁 Samochód</label><label><input type="checkbox" checked data-w="2"> 👁 Napis</label></div>
      <div class="ag-prz"><label><input type="checkbox" data-m> 🎭 Maska na warstwie „Samochód”</label><label><input type="checkbox" data-r> ↗ Rozsuń warstwy</label></div>
      <div class="ag-sc"><div class="ag-st" data-st>
        <svg viewBox="0 0 360 240"><rect width="360" height="240" fill="#8ecae6"/><circle cx="290" cy="50" r="26" fill="#ffd23f"/><path d="M0 150l90-70 70 50 70-80 130 90v100H0z" fill="#588157"/><rect y="180" width="360" height="60" fill="#6c757d"/><path d="M0 210h360" stroke="#fff" stroke-width="3" stroke-dasharray="24 16"/></svg>
        <svg viewBox="0 0 360 240"><g data-bg><rect x="60" y="80" width="240" height="140" fill="#d4a373"/><path d="M60 80h240M60 115h240M60 150h240M60 185h240" stroke="#a47148" stroke-width="3"/></g>
          <path d="M95 190v-28l30-6 24-30h70l28 30 24 6v28z" fill="#e63946"/><path d="M155 132h28v24h-46zM192 132h24l20 24h-44z" fill="#caf0f8"/><circle cx="135" cy="192" r="17" fill="#111"/><circle cx="235" cy="192" r="17" fill="#111"/><circle cx="135" cy="192" r="7" fill="#adb5bd"/><circle cx="235" cy="192" r="7" fill="#adb5bd"/></svg>
        <svg viewBox="0 0 360 240"><text x="180" y="40" text-anchor="middle" font-size="26" font-weight="800" fill="#fff" stroke="#1b2a4a" stroke-width="5" paint-order="stroke">WAKACJE 2026</text></svg>
      </div></div><div class="ag-inf" data-i></div>`);
    const L = [...q("[data-st]").children];
    const rys = () => { const m = q("[data-m]").checked;
      el.querySelectorAll("[data-w]").forEach((c) => (L[+c.dataset.w].style.visibility = c.checked ? "visible" : "hidden"));
      q("[data-bg]").style.display = m ? "none" : ""; q("[data-st]").classList.toggle("ag-roz", q("[data-r]").checked);
      q("[data-i]").innerHTML = m ? "<b>Maska</b> ukryła ścianę garażu wokół samochodu – nic nie zostało skasowane. Wyłącz maskę, a ściana wróci."
        : "Bez maski zdjęcie samochodu zasłania krajobraz razem ze ścianą garażu. Włącz maskę, żeby ukryć wszystko poza samochodem. Wyłączaj też warstwy ikoną oka."; };
    el.querySelectorAll("input").forEach((c) => (c.onchange = rys)); rys();
    return null;
  });

  /* ---------- 5. ścieżka: węzły i segmenty ---------- */
  A.dodaj("wezly", "Ścieżka: węzły i segmenty", (el) => {
    let P = [[90, 250], [250, 90], [450, 260], [650, 110]], krz = true, lap = -1;
    const q = h(el, `<p class="ag-p">Obraz wektorowy składa się ze ścieżek. Przeciągaj <b>węzły</b> (kółka) i patrz, jak zmieniają się <b>segmenty</b> między nimi.</p>
      <div class="ag-prz"><button class="drugi" data-d>➕ Dodaj węzeł</button><button class="drugi" data-u>➖ Usuń węzeł</button><button class="drugi" data-k></button></div>
      <svg data-s viewBox="0 0 760 340" class="an-svg"><path data-p fill="none" stroke="var(--akc2,#4cc9f0)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><g data-g></g></svg>
      <div class="ag-inf" data-i></div>`);
    const s = q("[data-s]");
    const d = () => { if (!krz) return "M" + P.map((p) => p.join(" ")).join("L");
      let w = `M${P[0][0]} ${P[0][1]}`;
      for (let i = 0; i < P.length - 1; i++) { const a = P[i - 1] || P[i], b = P[i], c = P[i + 1], e = P[i + 2] || c;
        w += `C${b[0] + (c[0] - a[0]) / 6} ${b[1] + (c[1] - a[1]) / 6} ${c[0] - (e[0] - b[0]) / 6} ${c[1] - (e[1] - b[1]) / 6} ${c[0]} ${c[1]}`; }
      return w; };
    const rys = () => { q("[data-p]").setAttribute("d", d());
      q("[data-g]").innerHTML = P.map((p, i) => `<circle class="ag-wz" data-n="${i}" cx="${p[0]}" cy="${p[1]}" r="14" fill="var(--akc,#fca311)" stroke="#111" stroke-width="3"/>`).join("");
      q("[data-k]").textContent = krz ? "📐 Zamień na odcinki proste" : "〰 Zamień na krzywe";
      q("[data-i]").innerHTML = `Liczba węzłów tej ścieżki: <b>${P.length}</b>, liczba segmentów: <b>${P.length - 1}</b>. Komputer zapamiętuje tylko położenie węzłów i wzór krzywej – dlatego plik jest mały, a rysunek można dowolnie skalować.`; };
    const pkt = (ev) => { const r = s.getBoundingClientRect(); return [Math.max(15, Math.min(745, (ev.clientX - r.left) * 760 / r.width)), Math.max(15, Math.min(325, (ev.clientY - r.top) * 340 / r.height))]; };
    s.onpointerdown = (ev) => { const n = ev.target.dataset && ev.target.dataset.n; if (n == null) return; lap = +n; s.setPointerCapture(ev.pointerId); };
    s.onpointermove = (ev) => { if (lap < 0) return; P[lap] = pkt(ev).map(Math.round); q("[data-p]").setAttribute("d", d());
      const c = s.querySelector(`[data-n="${lap}"]`); c.setAttribute("cx", P[lap][0]); c.setAttribute("cy", P[lap][1]); };
    s.onpointerup = s.onpointercancel = () => { lap = -1; };
    q("[data-d]").onclick = () => { if (P.length >= 8) return; const a = P[P.length - 2], b = P[P.length - 1]; P.splice(P.length - 1, 0, [Math.round((a[0] + b[0]) / 2), Math.round((a[1] + b[1]) / 2 + 50)]); rys(); };
    q("[data-u]").onclick = () => { if (P.length > 2) { P.splice(P.length - 2, 1); rys(); } };
    q("[data-k]").onclick = () => { krz = !krz; rys(); };
    rys();
    return null;
  });

  /* ---------- 6. wykres kołowy czy prostokąty ---------- */
  A.dodaj("wykres", "Te same dane: koło czy prostokąty?", (el) => {
    const D = [["A", 22, "#e63946"], ["B", 19, "#ffd23f"], ["C", 21, "#4cc9f0"], ["D", 18, "#80ed99"], ["E", 20, "#c77dff"]];
    let tryb = "kolo", licz = false;
    const q = h(el, `<p class="ag-p">Pięć klas zebrało makulaturę. <b>Która klasa zebrała najwięcej, a która najmniej?</b> Spróbuj odpowiedzieć, patrząc na każdy z wykresów.</p>
      <div class="ag-prz"><button class="drugi" data-t="kolo">🥧 Wykres kołowy</button><button class="drugi" data-t="pr">📊 Prostokąty</button><label><input type="checkbox" data-l> Pokaż liczby</label></div>
      <svg data-s viewBox="0 0 760 320" class="an-svg"></svg><div class="ag-inf" data-i></div>`);
    const rys = () => { let w = "";
      el.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.t === tryb));
      if (tryb === "kolo") { let a = -Math.PI / 2; const S = D.reduce((x, y) => x + y[1], 0);
        D.forEach(([n, v, k]) => { const b = a + v / S * 2 * Math.PI, m = (a + b) / 2, p = (t, r) => `${380 + r * Math.cos(t)} ${160 + r * Math.sin(t)}`;
          w += `<path d="M380 160L${p(a, 140)}A140 140 0 0 1 ${p(b, 140)}z" fill="${k}" stroke="#111" stroke-width="2"/><text x="${380 + 90 * Math.cos(m)}" y="${166 + 90 * Math.sin(m)}" text-anchor="middle" font-size="20" font-weight="800" fill="#111">${n}${licz ? " · " + v + " kg" : ""}</text>`; a = b; });
      } else D.forEach(([n, v, k], i) => { const hh = v * 11; w += `<rect x="${130 + i * 110}" y="${290 - hh}" width="70" height="${hh}" fill="${k}" stroke="#111" stroke-width="2"/><text x="${165 + i * 110}" y="312" text-anchor="middle" font-size="20" font-weight="800" fill="var(--tekst,#fff)">${n}</text>${licz ? `<text x="${165 + i * 110}" y="${282 - hh}" text-anchor="middle" font-size="18" fill="var(--tekst,#fff)">${v} kg</text>` : ""}`; });
      q("[data-s]").innerHTML = w;
      q("[data-i]").innerHTML = tryb === "kolo" ? "Na wykresie kołowym wycinki wyglądają prawie tak samo – oko źle porównuje kąty i pola wycinków. Taki wykres ma <b>wysoki współczynnik kłamstwa</b>."
        : "Prostokąty stoją obok siebie na jednej linii, więc od razu widać: najwięcej zebrała klasa <b>A</b>, najmniej <b>D</b>. To wizualizacja o <b>niskim współczynniku kłamstwa</b>."; };
    el.querySelectorAll("[data-t]").forEach((b) => (b.onclick = () => { tryb = b.dataset.t; rys(); }));
    q("[data-l]").onchange = (ev) => { licz = ev.target.checked; rys(); }; rys();
    return null;
  });
})();
