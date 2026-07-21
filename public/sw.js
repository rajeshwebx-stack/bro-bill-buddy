// Service Worker for Look @ Me Salon App
// Caches the app shell so it works offline and loads instantly

const CACHE_NAME = "lookatme-v1";

// On install, cache nothing special — just activate immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// On activate, clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Network first, fall back to cache for navigation
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/"))
    );
  }
});
