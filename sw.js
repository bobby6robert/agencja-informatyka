// Service worker wersji na telefony: działanie offline + aktualizacje.
// - strona menu i manifest.json: najpierw sieć (zawsze aktualne), bez sieci z pamięci,
// - pliki z ?v=<suma kontrolna>: z pamięci; nowa wersja pliku = nowy adres, więc pobiera się sama.
const CACHE = "agencja-v1";
const SHELL = ["./", "index.html", "app.webmanifest", "manifest.json", "ikony/ikona-192.png", "ikony/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  if (url.searchParams.has("v")) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) {
        // usuń starsze wersje tego samego pliku
        for (const k of await c.keys()) {
          const u = new URL(k.url);
          if (u.pathname === url.pathname && u.search !== url.search) c.delete(k);
        }
        c.put(e.request, res.clone());
      }
      return res;
    }));
    return;
  }

  e.respondWith(fetch(e.request, { cache: "no-store" }).then(res => {
    // do pamięci tylko menu i manifest (pliki do ćwiczeń pobierane „na telefon” nie zajmują miejsca w pamięci)
    if (res.ok && (e.request.mode === "navigate" || /(manifest\.json|webmanifest)$/.test(url.pathname))) {
      const kopia = res.clone(); caches.open(CACHE).then(c => c.put(e.request, kopia));
    }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })
    .then(hit => hit || (e.request.mode === "navigate" ? caches.match("index.html") : Response.error()))));
});
