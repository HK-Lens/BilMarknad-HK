const CACHE_NAME = "bilhk-pwa-v5-browser-notifications";
const APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : undefined)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => undefined);
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./offline.html")))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const fallbackUrl = new URL("./index.html", self.location.origin).href;
  const targetUrl = event.notification?.data?.url
    ? new URL(event.notification.data.url, self.location.origin).href
    : fallbackUrl;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && new URL(client.url).origin === self.location.origin) {
          return client.focus();
        }
      }

      if (clients.openWindow) return clients.openWindow(targetUrl);
      return null;
    })
  );
});
