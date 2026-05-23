(() => {
  const APP_NAME = "VORQ Fordon";
  const INSTALL_FALLBACK_MESSAGE = "Öppna menyn i Chrome och välj Installera VORQ Fordon / Lägg till på startskärmen.";

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => {
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

  async function installVORQFordonApp() {
    if (!deferredInstallPrompt) {
      alert(INSTALL_FALLBACK_MESSAGE);
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice.catch(() => null);
    deferredInstallPrompt = null;
    document.documentElement.classList.remove("pwa-install-ready");
  }

  window.VORQFordonInstallApp = installVORQFordonApp;

  /*
   * Backward compatible alias for older pages that still call
   * window.BILHKInstallApp from the install button.
   */
  window.BILHKInstallApp = installVORQFordonApp;
})();
