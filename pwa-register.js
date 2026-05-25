(() => {
  "use strict";

  const APP_NAME = "VORQ Fordon";
  const SERVICE_WORKER_URL = "./service-worker.js";

  const isSecureContextForSW = window.isSecureContext ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if ("serviceWorker" in navigator && isSecureContextForSW) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(SERVICE_WORKER_URL)
        .catch((error) => {
          console.warn(`${APP_NAME} service worker registration failed:`, error);
        });
    });
  }

  let deferredInstallPrompt = null;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    document.documentElement.classList.add("pwa-install-ready");
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    document.documentElement.classList.remove("pwa-install-ready");
  });

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
      document.documentElement.classList.remove("pwa-install-ready");
    }
  }

  window.VORQFordonInstallApp = installVORQFordonApp;
})();
