/* VORQ Fordon service worker
   Project operator in legal pages: VORQ Digital, Inhaber: Haitham Kojar.
   No payment, invoice or pricing logic is handled here.
*/

const CACHE_NAME = "vorq-fordon-pwa-v11-20260525";

const APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./vorq-fordon-logo-header.png",
  "./icon.svg",
  "./vorq-icon-192.png",
  "./vorq-icon-512.png",
  "./icons/vorq-icon-192.png",
  "./icons/vorq-icon-512.png"
];

const OFFLINE_URL = "./offline.html";

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);

  await Promise.allSettled(
    APP_SHELL.map(async (url) => {
      try {
        const request = new Request(url, { cache: "reload" });
        const response = await fetch(request);
        if (response && response.ok) {
          await cache.put(request, response);
        }
      } catch (error) {
        // Optional assets may not exist in every deployment.
      }
    })
  );
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(cacheAppShell());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve(false)))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, copy))
            .catch(() => undefined);
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL).then((cached) => cached || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request, { cache: "no-store" })
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, copy))
              .catch(() => undefined);
          }
          return response;
        })
        .catch(() => cached || caches.match(OFFLINE_URL));

      return cached || networkFetch;
    })
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
