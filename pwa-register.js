(() => {
  "use strict";

  const APP_NAME = "VORQ Fordon";
  const SERVICE_WORKER_URL = "./service-worker.js";
  const CACHE_PREFIX = "vorq-fordon-pwa-";
  const INSTALL_READY_CLASS = "pwa-install-ready";
  const OFFLINE_CLASS = "pwa-offline";
  const RELOAD_FLAG_KEY = "vorqFordonServiceWorkerReloaded";

  const isSecureContextForServiceWorker = window.isSecureContext ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  let deferredInstallPrompt = null;
  let serviceWorkerRegistration = null;

  function setInstallReady(isReady) {
    document.documentElement.classList.toggle(INSTALL_READY_CLASS, Boolean(isReady));
  }

  function updateOnlineState() {
    document.documentElement.classList.toggle(OFFLINE_CLASS, !navigator.onLine);
  }

  function requestServiceWorkerActivation(worker) {
    if (worker && typeof worker.postMessage === "function") {
      worker.postMessage({ type: "SKIP_WAITING" });
    }
  }

  function watchForServiceWorkerUpdates(registration) {
    if (!registration) return;

    if (registration.waiting && navigator.serviceWorker.controller) {
      requestServiceWorkerActivation(registration.waiting);
    }

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          requestServiceWorkerActivation(newWorker);
        }
      });
    });
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || !isSecureContextForServiceWorker) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL);
      serviceWorkerRegistration = registration;
      watchForServiceWorkerUpdates(registration);
      return registration;
    } catch (error) {
      console.warn(`${APP_NAME} service worker registration failed:`, error);
      return null;
    }
  }

  async function installVORQFordonApp() {
    if (!deferredInstallPrompt) {
      alert("Öppna webbläsarens meny och välj Installera app eller Lägg till på startskärmen.");
      return;
    }

    try {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
    } catch (error) {
      console.warn(`${APP_NAME} install prompt failed:`, error);
    } finally {
      deferredInstallPrompt = null;
      setInstallReady(false);
    }
  }

  async function clearVORQFordonPwaCache() {
    try {
      if (serviceWorkerRegistration?.active) {
        serviceWorkerRegistration.active.postMessage({ type: "CLEAR_VORQ_CACHE" });
      }

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => {
            return cacheName.startsWith(CACHE_PREFIX)
              ? caches.delete(cacheName)
              : Promise.resolve(false);
          })
        );
      }

      return true;
    } catch (error) {
      console.warn(`${APP_NAME} cache cleanup failed:`, error);
      return false;
    }
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    setInstallReady(true);
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    setInstallReady(false);
  });

  window.addEventListener("online", updateOnlineState);
  window.addEventListener("offline", updateOnlineState);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (sessionStorage.getItem(RELOAD_FLAG_KEY) === "1") {
        return;
      }

      sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
      window.location.reload();
    });
  }

  window.VORQFordonInstallApp = installVORQFordonApp;
  window.VORQFordonClearPwaCache = clearVORQFordonPwaCache;

  updateOnlineState();

  window.addEventListener("load", () => {
    registerServiceWorker();
  });
})();
