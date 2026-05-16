(() => {
  const APP_NAME = "BILHK";
  let deferredInstallPrompt = null;
  let installButton = null;

  function isStandaloneMode() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function createInstallUI() {
    if (installButton || isStandaloneMode() || !document.body) return;

    const style = document.createElement("style");
    style.textContent = `
      .bilhk-install-app-btn {
        position: fixed;
        right: 18px;
        bottom: calc(18px + env(safe-area-inset-bottom));
        z-index: 99999;
        border: 0;
        border-radius: 999px;
        padding: 13px 18px;
        background: linear-gradient(135deg, #f58220, #ffad55);
        color: #fff;
        box-shadow: 0 18px 40px rgba(245,130,32,.32);
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 14px;
        font-weight: 900;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        cursor: pointer;
      }

      .bilhk-install-app-btn svg {
        width: 18px;
        height: 18px;
      }

      .bilhk-install-help-backdrop {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: none;
        place-items: center;
        padding: 20px;
        background: rgba(15,23,42,.46);
        backdrop-filter: blur(10px);
      }

      .bilhk-install-help-backdrop.show {
        display: grid;
      }

      .bilhk-install-help-card {
        width: min(430px, 100%);
        border-radius: 26px;
        background: #fff;
        color: #0f172a;
        box-shadow: 0 30px 90px rgba(15,23,42,.28);
        padding: 24px;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .bilhk-install-help-card h3 {
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: 950;
      }

      .bilhk-install-help-card p {
        margin: 0 0 12px;
        color: #64748b;
        font-size: 14px;
        font-weight: 650;
        line-height: 1.7;
      }

      .bilhk-install-help-card ol {
        margin: 12px 0 18px;
        padding-left: 22px;
        color: #334155;
        font-size: 14px;
        line-height: 1.8;
        font-weight: 750;
      }

      .bilhk-install-help-card button {
        width: 100%;
        min-height: 44px;
        border: 0;
        border-radius: 999px;
        background: #0f172a;
        color: #fff;
        font-weight: 900;
        cursor: pointer;
      }

      @media (max-width: 520px) {
        .bilhk-install-app-btn {
          right: 12px;
          left: 12px;
          bottom: calc(12px + env(safe-area-inset-bottom));
          justify-content: center;
        }
      }
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "bilhk-install-app-btn";
    button.setAttribute("aria-label", "Installera BILHK som app");
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v10m0 0 4-4m-4 4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 14v4a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>Installera app</span>
    `;

    button.addEventListener("click", installApp);

    const help = document.createElement("div");
    help.className = "bilhk-install-help-backdrop";
    help.innerHTML = `
      <div class="bilhk-install-help-card" role="dialog" aria-modal="true">
        <h3>Installera BILHK</h3>
        <p>Om installationsrutan inte öppnas automatiskt kan du installera appen från Chrome-menyn.</p>
        <ol>
          <li>Öppna sidan في Chrome على Android.</li>
          <li>اضغطي على القائمة ⋮ أعلى اليمين.</li>
          <li>اختاري Install app أو Add to Home screen.</li>
        </ol>
        <button type="button">Stäng</button>
      </div>
    `;

    help.addEventListener("click", (event) => {
      if (event.target === help || event.target.closest("button")) {
        help.classList.remove("show");
      }
    });

    document.head.appendChild(style);
    document.body.append(button, help);
    installButton = button;
  }

  function showInstallHelp() {
    const help = document.querySelector(".bilhk-install-help-backdrop");
    if (help) help.classList.add("show");
  }

  async function installApp() {
    if (isStandaloneMode()) {
      if (installButton) installButton.remove();
      return;
    }

    if (!deferredInstallPrompt) {
      showInstallHelp();
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice.catch(() => null);
    deferredInstallPrompt = null;

    if (installButton) installButton.remove();
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => {
        console.warn(`${APP_NAME} service worker registration failed:`, error);
      });
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    createInstallUI();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    if (installButton) installButton.remove();
  });

  document.addEventListener("DOMContentLoaded", () => {
    if (!isStandaloneMode()) {
      createInstallUI();
    }
  });

  window.BILHKInstallApp = installApp;
})();
