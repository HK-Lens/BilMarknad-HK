const CACHE_NAME = "bilhk-pwa-v6-scope-safe-notifications";
const APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined)
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => {
      if (key !== CACHE_NAME) return caches.delete(key);
    }))).then(() => self.clients.claim())
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

  const scopeUrl = self.registration?.scope || self.location.href;
  const fallbackUrl = new URL("./messages.html", scopeUrl).href;
  const rawTargetUrl = event.notification?.data?.url || "./messages.html";

  let absoluteTargetUrl = fallbackUrl;
  try {
    const parsedTargetUrl = new URL(rawTargetUrl, scopeUrl);
    if (parsedTargetUrl.origin === self.location.origin) {
      absoluteTargetUrl = parsedTargetUrl.href;
    }
  } catch (error) {
    absoluteTargetUrl = fallbackUrl;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(scopeUrl) && "focus" in client) {
          if ("navigate" in client && client.url !== absoluteTargetUrl) {
            await client.navigate(absoluteTargetUrl);
          }
          return client.focus();
        }
      }

      if (clients.openWindow) return clients.openWindow(absoluteTargetUrl);
      return null;
    })
  );
});
