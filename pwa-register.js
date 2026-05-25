(() => {
  const APP_NAME = "VORQ Fordon";

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

  window.VORQFordonInstallApp = async function VORQFordonInstallApp() {
    if (!deferredInstallPrompt) {
      alert("Öppna menyn i Chrome och välj Installera app / Lägg till på startskärmen.");
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice.catch(() => null);
    deferredInstallPrompt = null;
    document.documentElement.classList.remove("pwa-install-ready");
  };
})();
