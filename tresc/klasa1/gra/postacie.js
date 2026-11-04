/* Ilustracje postaci (SVG) i składany awatar ucznia. */
(function () {
  const KOL = {
    det: { tlo: "#14213d", akc: "#fca311", oczy: "#39ff14" },
    szp: { tlo: "#1b1f24", akc: "#e63946", oczy: "#ff3b3b" },
    fan: { tlo: "#2d1b4e", akc: "#7bdcb5", oczy: "#c77dff" },
    woj: { tlo: "#2f3a22", akc: "#c9a227", oczy: "#ff5a1f" },
    kas: { tlo: "#0f3d2e", akc: "#d4af37", oczy: "#ff3b3b" },
    mun: { tlo: "#0b2545", akc: "#ffd400", oczy: "#4cc9f0" }
  };
  const czapka = (kol, opaska, y = 38) => `<path d="M33 ${y} Q33 ${y - 15} 50 ${y - 17} Q67 ${y - 15} 67 ${y}Z" fill="${kol}"/><rect x="33" y="${y - 5}" width="34" height="5" fill="${opaska}"/><path d="M34 ${y} Q50 ${y + 7} 66 ${y} L64 ${y + 4} Q50 ${y + 10} 36 ${y + 4}Z" fill="#111"/><circle cx="50" cy="${y - 10}" r="3" fill="#ffd400"/>`;
  const rogatywka = (kol) => `<path d="M30 30 L50 16 L70 30 L50 37Z" fill="${kol}"/><path d="M36 33 L64 33 L64 38 L36 38Z" fill="#3c4a2c"/><path d="M35 38 Q50 45 65 38 L63 42 Q50 48 37 42Z" fill="#111"/><path d="M47 27 l3-3 3 3-3 3z" fill="#ffd400"/>`;
  const mundur = (kol, pagon) => `<path d="M22 98 L30 68 Q50 60 70 68 L78 98Z" fill="${kol}"/><path d="M42 66 L50 82 L58 66" fill="#e8e8e8"/><path d="M48 68h4l1 12-3 3-3-3z" fill="#222"/><rect x="28" y="66" width="12" height="4" rx="1" fill="${pagon}"/><rect x="60" y="66" width="12" height="4" rx="1" fill="${pagon}"/>`;
  const svg = (w, body) => `<svg viewBox="0 0 100 100" width="${w}" height="${w}" aria-hidden="true">${body}</svg>`;
  const krag = (k) => `<circle cx="50" cy="50" r="48" fill="${k.tlo}" stroke="${k.akc}" stroke-width="3"/>`;
  const glowa = (y = 46, skora = "#f2d0b1") => `<circle cx="50" cy="${y}" r="15" fill="${skora}"/><circle cx="44.5" cy="${y}" r="1.8" fill="#222"/><circle cx="55.5" cy="${y}" r="1.8" fill="#222"/>`;

  const SZEF = {
    det: (k) => krag(k) +
      `<path d="M22 98 L30 68 Q50 60 70 68 L78 98Z" fill="#c2a27a"/><path d="M42 66 L50 80 L58 66" fill="#efe6d8"/><path d="M47 68h6l-1 14h-4z" fill="#8b1e1e"/>` +
      glowa(48) + `<path d="M43 55 q7 4 14 0" stroke="#5a3d2b" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="50" cy="36" rx="25" ry="5" fill="#3b2a1e"/><path d="M36 36 Q36 20 50 20 Q64 20 64 36Z" fill="#4a3526"/><rect x="36" y="31" width="28" height="4" fill="${k.akc}"/>`,
    szp: (k) => krag(k) +
      `<path d="M22 98 L30 68 Q50 60 70 68 L78 98Z" fill="#23272e"/><path d="M42 66 L50 86 L58 66" fill="#fff"/><path d="M48 68h4l1.5 16-3.5 3-3.5-3z" fill="${k.akc}"/>` +
      glowa(46) + `<path d="M35 40 Q50 28 65 40 L65 37 Q50 22 35 37Z" fill="#2a2a2a"/><rect x="38" y="42" width="10" height="6" rx="2" fill="#111"/><rect x="52" y="42" width="10" height="6" rx="2" fill="#111"/><path d="M48 44h4" stroke="#111" stroke-width="1.5"/>` +
      `<path d="M65 48 q4 6 0 14" stroke="#9ad" stroke-width="1.5" fill="none"/><circle cx="65" cy="47" r="2" fill="#9ad"/>`,
    fan: (k) => krag(k) +
      `<path d="M20 98 L32 64 Q50 58 68 64 L80 98Z" fill="#5b2a86"/><circle cx="34" cy="86" r="1.5" fill="#ffd166"/><circle cx="64" cy="80" r="1.5" fill="#ffd166"/><circle cx="56" cy="92" r="1.2" fill="#ffd166"/>` +
      glowa(48) + `<path d="M38 54 Q50 82 62 54 Q50 60 38 54Z" fill="#eee"/>` +
      `<path d="M30 38 L50 4 L70 38Z" fill="#3f1d63"/><ellipse cx="50" cy="38" rx="24" ry="4.5" fill="#3f1d63"/><path d="M54 18 l1.5 3 3.2.4-2.4 2.2.6 3.2-2.9-1.6-2.9 1.6.6-3.2-2.4-2.2 3.2-.4z" fill="#ffd166"/>`,
    woj: (k) => krag(k) + mundur("#556b2f", k.akc) + glowa(50) + rogatywka("#556b2f"),
    kas: (k) => krag(k) + mundur("#1f5135", k.akc) + glowa(50) + czapka("#1f5135", k.akc),
    mun: (k) => krag(k) + mundur("#1d3557", "#c0c0c0") + glowa(50) + czapka("#1d3557", "#c1121f")
  };

  const POMOC = {
    det: (k) => krag(k) +
      `<path d="M50 14 v10" stroke="#9fb3c8" stroke-width="3"/><circle cx="50" cy="12" r="4" fill="${k.akc}"/>` +
      `<rect x="26" y="24" width="48" height="40" rx="10" fill="#9fb3c8"/><rect x="32" y="31" width="36" height="24" rx="6" fill="#0d1b2a"/>` +
      `<circle cx="42" cy="43" r="4" fill="#4cc9f0"/><circle cx="58" cy="43" r="4" fill="#4cc9f0"/><path d="M44 50 q6 3 12 0" stroke="#4cc9f0" stroke-width="2" fill="none"/>` +
      `<rect x="34" y="66" width="32" height="26" rx="6" fill="#7d93aa"/><circle cx="50" cy="78" r="5" fill="${k.akc}"/>`,
    szp: (k) => krag(k) +
      `<circle cx="50" cy="50" r="30" fill="none" stroke="#2ec4b6" stroke-width="2" opacity=".6"/><circle cx="50" cy="50" r="22" fill="none" stroke="#2ec4b6" stroke-width="3"/>` +
      [-12, -6, 0, 6, 12].map((x, i) => `<rect x="${48 + x}" y="${50 - [6, 12, 18, 10, 5][i]}" width="4" height="${[12, 24, 36, 20, 10][i]}" rx="2" fill="#2ec4b6"/>`).join("") +
      `<text x="50" y="90" text-anchor="middle" font-size="9" font-family="monospace" fill="#2ec4b6">ECHO</text>`,
    fan: (k) => krag(k) +
      `<path d="M32 30 L36 16 L44 28Z" fill="#7a5230"/><path d="M68 30 L64 16 L56 28Z" fill="#7a5230"/>` +
      `<ellipse cx="50" cy="56" rx="24" ry="30" fill="#8b5e3c"/><ellipse cx="50" cy="66" rx="14" ry="18" fill="#d9b48f"/>` +
      `<circle cx="40" cy="42" r="10" fill="#fff"/><circle cx="60" cy="42" r="10" fill="#fff"/><circle cx="41" cy="43" r="5" fill="#222"/><circle cx="59" cy="43" r="5" fill="#222"/>` +
      `<rect x="29" y="31" width="22" height="22" fill="none" stroke="${k.akc}" stroke-width="2"/><rect x="49" y="31" width="22" height="22" fill="none" stroke="${k.akc}" stroke-width="2"/>` +
      `<path d="M47 52 L50 58 L53 52Z" fill="#f4a261"/>`,
    woj: (k) => krag(k) +
      `<path d="M10 52 L40 44 L50 50 L60 44 L90 52 L60 56 L50 62 L40 56Z" fill="#6b7a5a"/><ellipse cx="50" cy="52" rx="12" ry="9" fill="#4a5640"/>` +
      `<circle cx="22" cy="40" r="7" fill="none" stroke="#9fb3c8" stroke-width="2"/><circle cx="78" cy="40" r="7" fill="none" stroke="#9fb3c8" stroke-width="2"/><path d="M22 40 L40 46 M78 40 L60 46" stroke="#9fb3c8" stroke-width="2"/>` +
      `<circle cx="50" cy="52" r="4" fill="${k.akc}"/><circle cx="50" cy="52" r="1.6" fill="#111"/><path d="M50 61 L46 70 L54 70Z" fill="#c9a227"/>` +
      `<text x="50" y="88" text-anchor="middle" font-size="8" font-family="monospace" fill="${k.akc}">SOKÓŁ</text>`,
    kas: (k) => krag(k) +
      `<rect x="28" y="24" width="44" height="50" rx="8" fill="#c8d3cc"/><rect x="33" y="30" width="34" height="22" rx="4" fill="#06281d"/>` +
      `<rect x="36" y="38" width="28" height="3" fill="#39ff88"><animate attributeName="y" values="33;47;33" dur="2s" repeatCount="indefinite"/></rect>` +
      `<rect x="36" y="58" width="28" height="4" rx="2" fill="${k.akc}"/><path d="M36 66h4M43 66h2M48 66h5M56 66h2M61 66h3" stroke="#222" stroke-width="3"/>` +
      `<text x="50" y="88" text-anchor="middle" font-size="8" font-family="monospace" fill="${k.akc}">SKANER</text>`,
    mun: (k) => krag(k) +
      `<path d="M28 34 L34 14 L44 30Z" fill="#8a96a8"/><path d="M72 34 L66 14 L56 30Z" fill="#8a96a8"/>` +
      `<rect x="28" y="26" width="44" height="40" rx="14" fill="#aab6c8"/><rect x="38" y="50" width="24" height="20" rx="8" fill="#8a96a8"/>` +
      `<circle cx="40" cy="42" r="5" fill="#0d1b2a"/><circle cx="60" cy="42" r="5" fill="#0d1b2a"/><circle cx="41" cy="41" r="2" fill="${k.oczy}"/><circle cx="61" cy="41" r="2" fill="${k.oczy}"/>` +
      `<ellipse cx="50" cy="56" rx="5" ry="3.5" fill="#111"/><rect x="30" y="72" width="40" height="6" rx="3" fill="#1d3557"/><circle cx="50" cy="80" r="4" fill="${k.akc}"/>`
  };

  const WROG = (m) => (k) => krag(k) +
    `<path d="M18 98 Q20 60 30 44 Q36 14 50 12 Q64 14 70 44 Q80 60 82 98Z" fill="${({ fan: "#3c1361", szp: "#3a3f47", woj: "#1c1c1c", kas: "#26302b", mun: "#202432" })[m] || "#0b0b0b"}"/>` +
    `<ellipse cx="50" cy="48" rx="15" ry="18" fill="#000"/>` +
    `<ellipse cx="44" cy="46" rx="3.5" ry="2" fill="${k.oczy}"><animate attributeName="opacity" values="1;.4;1" dur="2.5s" repeatCount="indefinite"/></ellipse>` +
    `<ellipse cx="56" cy="46" rx="3.5" ry="2" fill="${k.oczy}"><animate attributeName="opacity" values="1;.4;1" dur="2.5s" repeatCount="indefinite"/></ellipse>` +
    (m === "det" ? `<text x="50" y="84" text-anchor="middle" font-size="10" font-family="monospace" fill="${k.oczy}" opacity=".7">B0</text>` : "") +
    (m === "fan" ? `<path d="M30 80 l4-6 4 6 M62 76 l4 6 4-6" stroke="${k.oczy}" stroke-width="1.5" fill="none"/>` : "") +
    (m === "szp" ? `<path d="M36 40 h28 v6 h-28z" fill="#555"/>` : "") +
    (m === "woj" ? `<path d="M46 52 L50 62 L54 52Z" fill="#333"/>` : "") +
    (m === "kas" ? `<text x="50" y="84" text-anchor="middle" font-size="11" font-family="monospace" fill="${k.oczy}" opacity=".7">$€</text>` : "") +
    (m === "mun" ? `<rect x="35" y="56" width="30" height="8" rx="2" fill="#2a2f3d"/>` : "");

  window.portret = function (kto, motyw, w = 72) {
    const k = KOL[motyw] || KOL.det;
    if (kto === "s") return svg(w, SZEF[motyw](k));
    if (kto === "p") return svg(w, POMOC[motyw](k));
    if (kto === "w") return svg(w, WROG(motyw)(k));
    return "";
  };

  /* ---------- Awatar ---------- */
  const TLO = {
    granat: `<rect width="120" height="120" fill="#14213d"/>`,
    miasto: `<rect width="120" height="120" fill="#1d2b53"/><circle cx="96" cy="22" r="9" fill="#f6e7b0"/>` +
      `<path d="M0 120V78h14V64h12v20h10V56h16v28h10V70h14v14h12V60h16v60z" fill="#0b132b"/>` +
      [[18, 70], [42, 62], [46, 74], [64, 76], [90, 66], [104, 72]].map(([x, y]) => `<rect x="${x}" y="${y}" width="3" height="3" fill="#fcd34d"/>`).join(""),
    gwiazdy: `<rect width="120" height="120" fill="#120b2e"/>` +
      [[12, 14], [30, 30], [86, 12], [104, 34], [70, 24], [18, 56], [100, 64], [50, 10]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`).join(""),
    kod: `<rect width="120" height="120" fill="#020c02"/>` +
      [8, 26, 44, 62, 80, 98].map((x, i) => `<text x="${x}" y="${16 + i * 7}" font-family="monospace" font-size="9" fill="#22c55e" opacity=".55">${["10", "01", "B0", "11", "00", "10"][i]}</text><text x="${x}" y="${60 + i * 5}" font-family="monospace" font-size="9" fill="#22c55e" opacity=".35">${["01", "11", "10", "B0", "01", "11"][i]}</text>`).join("")
  };
  const STROJ = {
    bluza: `<path d="M24 120 Q26 86 60 82 Q94 86 96 120Z" fill="#2a9d8f"/><path d="M50 84 Q60 96 70 84" fill="none" stroke="#21867a" stroke-width="3"/>`,
    plaszcz: `<path d="M22 120 Q24 86 60 82 Q96 86 98 120Z" fill="#c2a27a"/><path d="M48 84 L60 104 L72 84" fill="#efe6d8"/><path d="M44 84 L56 104 L50 120 M76 84 L64 104 L70 120" stroke="#9c7f58" stroke-width="2" fill="none"/>`,
    garnitur: `<path d="M22 120 Q24 86 60 82 Q96 86 98 120Z" fill="#23272e"/><path d="M48 84 L60 110 L72 84" fill="#fff"/><path d="M57.5 86h5l2 18-4.5 4-4.5-4z" fill="#e63946"/>`,
    moro: `<path d="M22 120 Q24 86 60 82 Q96 86 98 120Z" fill="#5b6b3a"/>` + [[34, 100, 9], [58, 92, 7], [80, 104, 10], [46, 112, 8], [70, 116, 6]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="#3d4a26"/>`).join("") + [[40, 96], [74, 96], [60, 108]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="#8a7a50"/>`).join(""),
    mundur: `<path d="M22 120 Q24 86 60 82 Q96 86 98 120Z" fill="#1d3557"/><path d="M50 84 L60 100 L70 84" fill="#e8e8e8"/><path d="M58 86h4l1 12-3 3-3-3z" fill="#111"/><rect x="28" y="88" width="14" height="4" rx="1" fill="#d4af37"/><rect x="78" y="88" width="14" height="4" rx="1" fill="#d4af37"/>`,
    szata: `<path d="M20 120 Q24 86 60 82 Q96 86 100 120Z" fill="#5b2a86"/>` + [[36, 104], [80, 98], [60, 114], [44, 92], [86, 112]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#ffd166"/>`).join("")
  };
  const NAKRYCIE = {
    brak: () => "",
    czapka: () => `<path d="M38 42 Q38 22 60 22 Q82 22 82 42Z" fill="#14213d"/><path d="M78 40 Q92 40 94 44 L80 44Z" fill="#14213d"/><circle cx="60" cy="22" r="2.5" fill="#fca311"/>`,
    kapelusz: () => `<ellipse cx="60" cy="38" rx="34" ry="6" fill="#3b2a1e"/><path d="M42 38 Q42 16 60 16 Q78 16 78 38Z" fill="#4a3526"/><rect x="42" y="31" width="36" height="5" fill="#fca311"/>`,
    beret: () => `<ellipse cx="56" cy="30" rx="26" ry="10" fill="#c1121f" transform="rotate(-10 56 30)"/><circle cx="52" cy="20" r="2.5" fill="#c1121f"/>`,
    spiczasty: () => `<path d="M38 40 L62 -4 L82 40Z" fill="#3f1d63"/><ellipse cx="60" cy="40" rx="28" ry="5" fill="#3f1d63"/><circle cx="64" cy="20" r="2.5" fill="#ffd166"/>`,
    rogatywka: () => `<path d="M36 34 L60 18 L84 34 L60 42Z" fill="#556b2f"/><path d="M40 38h40v6H40z" fill="#3c4a2c"/><path d="M40 44 Q60 52 80 44 L78 48 Q60 56 42 48Z" fill="#111"/><path d="M57 29 l3-3 3 3-3 3z" fill="#ffd400"/>`,
    czapkaSl: () => `<path d="M38 42 Q38 24 60 22 Q82 24 82 42Z" fill="#1d3557"/><rect x="38" y="36" width="44" height="6" fill="#c1121f"/><path d="M39 42 Q60 50 81 42 L79 46 Q60 54 41 46Z" fill="#111"/><circle cx="60" cy="30" r="3.5" fill="#ffd400"/>`,
    korona: () => `<path d="M40 36 L42 18 L51 28 L60 14 L69 28 L78 18 L80 36Z" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/><circle cx="60" cy="26" r="2.5" fill="#e63946"/>`
  };
  const DODATEK = {
    brak: "",
    lupa: `<path d="M92 104 L104 116" stroke="#5a3d2b" stroke-width="5" stroke-linecap="round"/><circle cx="86" cy="96" r="10" fill="rgba(200,230,255,.5)" stroke="#fca311" stroke-width="3"/>`,
    sluchawka: `<circle cx="81" cy="54" r="3" fill="#9ad"/><path d="M81 57 q6 10 -2 22" stroke="#9ad" stroke-width="1.5" fill="none"/>`,
    rozdzka: `<path d="M88 118 L104 82" stroke="#6b4423" stroke-width="4" stroke-linecap="round"/><path d="M104 74 l2 4 4.4.6-3.2 3 .8 4.4-4-2.2-4 2.2.8-4.4-3.2-3 4.4-.6z" fill="#ffd166"/>`,
    odznaka: `<path d="M78 92 l6 -4 6 4 v8 l-6 5 -6 -5z" fill="#ffd400" stroke="#b45309" stroke-width="1.2"/><circle cx="84" cy="96" r="2" fill="#b45309"/>`,
    laptop: `<rect x="40" y="96" width="40" height="20" rx="2" fill="#334155"/><rect x="43" y="99" width="34" height="14" fill="#22d3ee" opacity=".7"/><rect x="36" y="115" width="48" height="4" rx="2" fill="#475569"/>`
  };

  window.awatar = function (a, w = 120) {
    const F = window.FABULA.awatar;
    const skora = F.skora[a.skora || 0] || F.skora[0], wlosy = F.wlosy[a.wlosy || 0] || F.wlosy[0];
    const nakr = a.glowa || "czapka";
    const wl = nakr === "brak" || nakr === "beret" || nakr === "korona" || nakr === "rogatywka"
      ? `<path d="M40 50 Q38 26 60 26 Q82 26 80 50 Q76 36 60 36 Q44 36 40 50Z" fill="${wlosy}"/>` : `<path d="M41 48 Q40 40 46 40 L46 48Z M79 48 Q80 40 74 40 L74 48Z" fill="${wlosy}"/>`;
    return `<svg viewBox="0 0 120 120" width="${w}" height="${w}" role="img" aria-label="Awatar">` +
      `<clipPath id="ak"><rect width="120" height="120" rx="18"/></clipPath><g clip-path="url(#ak)">` +
      (TLO[a.tlo] || TLO.granat) + (STROJ[a.stroj] || STROJ.bluza) +
      `<rect x="54" y="68" width="12" height="16" fill="${skora}"/>` +
      `<circle cx="60" cy="52" r="21" fill="${skora}"/>` + wl +
      `<circle cx="52.5" cy="53" r="2.4" fill="#222"/><circle cx="67.5" cy="53" r="2.4" fill="#222"/><path d="M53 62 q7 5 14 0" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      (NAKRYCIE[nakr] || NAKRYCIE.brak)() + (DODATEK[a.dodatek] || "") + `</g></svg>`;
  };
})();
