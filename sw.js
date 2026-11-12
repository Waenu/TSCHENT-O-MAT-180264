// Service Worker: zuerst Netz, sonst gespeicherte Fassung (läuft so auch ohne Empfang).
const TEST = /TSCHENT-O-MAT-Test/i.test(self.registration.scope);   // Testversion: eigener Cache, kommt der laufenden App nicht in die Quere
const CACHE = TEST ? "tschentomat-test-v1" : "tschentomat-neu-v3";
const DATEIEN = ["./", "index.html", "einstellungen.json", "versionen.json", "manifest.json", "icon-192.png", "icon-512.png", "fonts/barlow-condensed-latin-600-normal.woff2", "fonts/barlow-condensed-latin-700-normal.woff2", "fonts/source-sans-3-latin-400-normal.woff2", "fonts/source-sans-3-latin-600-normal.woff2", "fonts/source-sans-3-latin-700-normal.woff2", "fonts/great-vibes-latin-400-normal.woff2"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith(TEST ? "tschentomat-test-" : "tschentomat-neu-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: "no-store" }).then((r) => {   // am Browser-Zwischenspeicher vorbei, damit neue Versionen sofort kommen
      const kopie = r.clone();
      caches.open(CACHE).then((c) => c.put(e.request.url.split("?")[0], kopie)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request.url.split("?")[0]).then((m) => m || caches.match("index.html")))
  );
});
