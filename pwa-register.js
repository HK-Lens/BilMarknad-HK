(() => {
  const APP_NAME = "BILHK";
  let deferredPrompt = null;
  let installButton = null;

  function isInstalled() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function createInstallButton() {
    if (installButton || isInstalled() || !document.body) return;

    const style = document.createElement("style");
    style.textContent = `
      .bilhk-install-btn {
        position: fixed;
        right: 18px;
        bottom: calc(18px + env(safe-area-inset-bottom));
        z-index: 99999;
        border: 0;
        border-radius: 999px;
        padding: 13px 18px;
        background: linear-gradient(135deg, #f58220, #ffad55);
        color: #ffffff;
        box-shadow: 0 18px 40px rgba(245,130,32,.32);
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 14px;
        font-weight: 900;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        cursor: pointer;
      }

      .bilhk-install-btn svg {
        width: 18px;
        height: 18px;
      }

      .bilhk-install-modal {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: none;
        place-items: center;
        padding: 20px;
        background: rgba(15,23,42,.48);
        backdrop-filter: blur(10px);
      }

      .bilhk-install-modal.show {
        display: grid;
      }

      .bilhk-install-card {
        width: min(430px, 100%);
        border-radius: 26px;
        background: #ffffff;
        color: #0f172a;
        box-shadow: 0 30px 90px rgba(15,23,42,.28);
        padding: 24px;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .bilhk-install-card h3 {
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: 950;
      }

      .bilhk-install-card p {
        margin: 0 0 12px;
        color: #64748b;
        font-size: 14px;
        font-weight: 650;
        line-height: 1.7;
      }

      .bilhk-install-card ol {
        margin: 12px 0 18px;
        padding-left: 22px;
        color: #334155;
        font-size: 14px;
        line-height: 1.8;
        font-weight: 750;
      }

      .bilhk-install-card button {
        width: 100%;
        min-height: 44px;
        border: 0;
        border-radius: 999px;
        background: #0f172a;
        color: #ffffff;
        font-weight: 900;
        cursor: pointer;
      }

      @media (max-width: 520px) {
        .bilhk-install-btn {
          right: 12px;
          left: 12px;
          bottom: calc(12px + env(safe-area-inset-bottom));
          justify-content: center;
        }
      }
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "bilhk-install-btn";
    button.setAttribute("aria-label", "Installera BILHK som app");
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v10m0 0 4-4m-4 4-4-4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"/>
        <path d="M5 14v4a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"/>
      </svg>
      <span>Installera app</span>
    `;

    const modal = document.createElement("div");
    modal.className = "bilhk-install-modal";
    modal.innerHTML = `
      <div class="bilhk-install-card" role="dialog" aria-modal="true">
        <h3>Installera BILHK</h3>
        <p>Om installationsrutan inte öppnas automatiskt kan du installera appen från Chrome-menyn.</p>
        <ol>
          <li>افتحي الموقع في Chrome على Android.</li>
          <li>اضغطي على القائمة ⋮ أعلى الشاشة.</li>
          <li>اختاري Install app أو Add to Home screen.</li>
        </ol>
        <button type="button">Stäng</button>
      </div>
    `;

    button.addEventListener("click", installApp);

    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("button")) {
        modal.classList.remove("show");
      }
    });

    document.head.appendChild(style);
    document.body.append(button, modal);

    installButton = button;
  }

  function showInstallHelp() {
    const modal = document.querySelector(".bilhk-install-modal");
    if (modal) {
      modal.classList.add("show");
    }
  }

  async function installApp() {
    if (isInstalled()) {
      if (installButton) installButton.remove();
      return;
    }

    if (!deferredPrompt) {
      showInstallHelp();
      return;
    }

    deferredPrompt.prompt();

    try {
      await deferredPrompt.userChoice;
    } catch (error) {
      console.warn("Install prompt closed:", error);
    }

    deferredPrompt = null;

    if (installButton) {
      installButton.remove();
      installButton = null;
    }
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => {
          console.log(`${APP_NAME} service worker registered.`);
        })
        .catch((error) => {
          console.warn(`${APP_NAME} service worker registration failed:`, error);
        });
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    createInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;

    if (installButton) {
      installButton.remove();
      installButton = null;
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    if (!isInstalled()) {
      createInstallButton();
    }
  });

  registerServiceWorker();

  window.BILHKInstallApp = installApp;
})();
