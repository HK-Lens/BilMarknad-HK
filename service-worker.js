/* 
  File: service-worker.js
  Project: VORQ Fordon
  File version: vorq-fordon-pwa-v26-20260607-full-project-message-dashboard-fix
  Last reviewed/updated: 2026-06-07 20:25 Europe/Berlin
  Status: Cache version bump after full-project message/dashboard/detail fix.
*/
/* VORQ Fordon service worker
   Project operator in legal pages: VORQ Digital, Inhaber: Haitham Kojar.
   VORQ Fordon is a vehicle-ad platform directed to the Swedish market.
   No payment, invoice or pricing logic is handled here.
*/

const CACHE_PREFIX = "vorq-fordon-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}v26-20260607-full-project-message-dashboard-fix`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./404.html",
  "./manifest.webmanifest",
  "./vorq-fordon-logo-header.png",
  "./icons/vorq-icon-192.png",
  "./icons/vorq-icon-512.png",
  "./terms.html",
  "./privacy.html",
  "./cookies.html",
  "./legal.html",
  "./foretagsinfo.html",
  "./impressum.html",
  "./notice-action.html",
  "./rapportera.html"
];

const OFFLINE_URL = "./offline.html";
const NOT_FOUND_URL = "./404.html";

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
        // Optional assets/pages may not exist in every deployment.
      }
    })
  );
}

async function deleteOldVorqCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys.map((key) => {
      const isOldVorqCache = key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME;
      return isOldVorqCache ? caches.delete(key) : Promise.resolve(false);
    })
  );
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(cacheAppShell());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    deleteOldVorqCaches().then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  const type = event.data && event.data.type;

  if (type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (type === "CLEAR_VORQ_CACHE") {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(
        keys.map((key) => key.startsWith(CACHE_PREFIX) ? caches.delete(key) : Promise.resolve(false))
      ))
    );
  }
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
        .then(async (response) => {
          if (response && response.status === 404) {
            const notFoundPage = await caches.match(NOT_FOUND_URL);
            return notFoundPage || response;
          }

          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, copy))
              .catch(() => undefined);
          }

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
