/* FABUŁA – klasa 2. Klimaty, awatar, poziomy i skale ocen są wspólne z klasą 1 (tresc/klasa1/gra/fabula.js),
   tu są własne rozdziały, karty i wyzwania. W klasach 2 nie ma klimatu policyjnego (mun). */
(function () {
  const B = window.FABULY[1];
  const SPRAWY = { det: "Sprawa Lustrzanej Strony", szp: "Operacja Klon", fan: "Kronika Zwierciadła",
    woj: "Operacja Cyberlustro", kas: "Sprawa Fałszywego Sklepu" };
  const motywy = {};
  Object.keys(SPRAWY).forEach((k) => { motywy[k] = Object.assign({}, B.motywy[k], { sprawa: SPRAWY[k] }); });

  window.FABULA = window.FABULY[2] = {
    klasa: 2,
    rozdzial: "Rozdział 1. Tworzenie treści internetowych",
    baza: "tresc/klasa2/gra/",
    lekcje: "../klasa2-informatyka-efekty.html",
    testy: "../sprawdziany.html",
    motywy, awatar: B.awatar, progi: B.progi, poziomy: B.poziomy, kary: B.kary, skalaTestow: B.skalaTestow,
    karty: {}, etapy: [], rozdzialy: [], wyzwania: []
  };
})();
