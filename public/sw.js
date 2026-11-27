// Service Worker untuk Collision Week PWA (v3: network-first untuk HTML & JS agar UI tidak pernah stale)
const CACHE_NAME = "cw-cache-v3";
const PRECACHE_ASSETS = [
  "/manifest.json",
  "/icon.svg",
];

// Install: precache ringan & langsung aktif
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate: hapus semua cache versi lama (termasuk cw-cache-v1 yang menyimpan bundle lama)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch:
// - /api/* -> network-first (fallback JSON offline)
// - HTML & /_next/* -> network-first (supaya perubahan kode/sesi selalu mutakhir, fallback ke cache saat offline)
// - Aset gambar/ikon statis (/icons, /logos, /mascots, /images) -> stale-while-revalidate
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ error: "Offline" }), {
            headers: { "Content-Type": "application/json" },
          })
      )
    );
    return;
  }

  const isStaticMedia =
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/logos/") ||
    url.pathname.startsWith("/mascots/") ||
    url.pathname.startsWith("/images/");

  if (isStaticMedia) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Network-first untuk halaman HTML dan bundle JS/CSS Next.js
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
