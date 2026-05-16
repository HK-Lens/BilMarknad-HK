(() => {
  const APP_NAME = "BILHK";
  let deferredPrompt = null;

  function isInstalled() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function addInstallStyles() {
    if (document.getElementById("bilhk-install-style")) return;

    const style = document.createElement("style");
    style.id = "bilhk-install-style";
    style.textContent = `
      .bilhk-install-floating {
        position: fixed;
        right: 16px;
        bottom: calc(16px + env(safe-area-inset-bottom));
        z-index: 999999;
        border: none;
        border-radius: 999px;
        background: linear-gradient(135deg, #f58220, #ffad55);
        color: white;
        padding: 13px 18px;
        font-family: Inter, Arial, sans-serif;
        font-size: 14px;
        font-weight: 900;
        box-shadow: 0 18px 40px rgba(245, 130, 32, 0.35);
        display: inline-flex;
        align-items: center;
        gap: 9px;
        cursor: pointer;
      }

      .bilhk-install-floating:hover {
        transform: translateY(-1px);
      }

      .bilhk-install-top {
        border: none;
        border-radius: 999px;
        background: #f58220;
        color: white;
        padding: 10px 14px;
        font-family: Inter, Arial, sans-serif;
        font-size: 13px;
        font-weight: 900;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(245, 130, 32, 0.22);
      }

      .bilhk-install-modal {
        position: fixed;
        inset: 0;
        z-index: 1000000;
        background: rgba(15, 23, 42, 0.48);
        backdrop-filter: blur(10px);
        display: none;
        place-items: center;
        padding: 20px;
      }

      .bilhk-install-modal.show {
        display: grid;
      }

      .bilhk-install-card {
        width: min(430px, 100%);
        background: white;
        color: #0f172a;
        border-radius: 26px;
        padding: 24px;
        box-shadow: 0 30px 90px rgba(15, 23, 42, 0.28);
        font-family: Inter, Arial, sans-serif;
      }

      .bilhk-install-card h3 {
        margin: 0 0 8px;
        font-size: 21px;
        font-weight: 950;
      }

      .bilhk-install-card p {
        margin: 0 0 12px;
        color: #64748b;
        font-size: 14px;
        line-height: 1.7;
        font-weight: 650;
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
        border: none;
        border-radius: 999px;
        background: #0f172a;
        color: white;
        font-weight: 900;
        cursor: pointer;
      }

      @media (max-width: 520px) {
        .bilhk-install-floating {
          left: 12px;
          right: 12px;
          justify-content: center;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createModal() {
    if (document.querySelector(".bilhk-install-modal")) return;

    const modal = document.createElement("div");
    modal.className = "bilhk-install-modal";
    modal.innerHTML = `
      <div class="bilhk-install-card" role="dialog" aria-modal="true">
        <h3>Installera BILHK</h3>
        <p>إذا لم تظهر نافذة تثبيت التطبيق تلقائيًا، ثبتيه من قائمة Chrome.</p>
        <ol>
          <li>افتحي الموقع من Chrome على Android.</li>
          <li>اضغطي على القائمة ⋮ أعلى الشاشة.</li>
          <li>اختاري Install app أو Add to Home screen.</li>
        </ol>
        <button type="button">Stäng</button>
      </div>
    `;

    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("button")) {
        modal.classList.remove("show");
      }
    });

    document.body.appendChild(modal);
  }

  function showHelpModal() {
    createModal();
    document.querySelector(".bilhk-install-modal")?.classList.add("show");
  }

  async function installApp() {
    if (isInstalled()) return;

    if (!deferredPrompt) {
      showHelpModal();
      return;
    }

    deferredPrompt.prompt();

    try {
      await deferredPrompt.userChoice;
    } catch (error) {
      console.warn("Install prompt closed:", error);
    }

    deferredPrompt = null;
  }

  function createFloatingButton() {
    if (isInstalled()) return;
    if (document.querySelector(".bilhk-install-floating")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bilhk-install-floating";
    btn.innerHTML = "⬇️ Installera app";
    btn.addEventListener("click", installApp);

    document.body.appendChild(btn);
  }

  function createHeaderButton() {
    if (isInstalled()) return;
    if (document.querySelector(".bilhk-install-top")) return;

    const header =
      document.querySelector(".header-actions") ||
      document.querySelector("header") ||
      document.querySelector(".site-header");

    if (!header) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bilhk-install-top";
    btn.innerHTML = "⬇️ Installera app";
    btn.addEventListener("click", installApp);

    header.appendChild(btn);
  }

  function initInstallUI() {
    if (!document.body) return;

    addInstallStyles();
    createModal();
    createHeaderButton();
    createFloatingButton();
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => {
          console.log(`${APP_NAME} service worker registered`);
        })
        .catch((error) => {
          console.warn(`${APP_NAME} service worker failed`, error);
        });
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    initInstallUI();
  });

  window.addEventListener("appinstalled", () => {
    const floating = document.querySelector(".bilhk-install-floating");
    const top = document.querySelector(".bilhk-install-top");

    if (floating) floating.remove();
    if (top) top.remove();

    deferredPrompt = null;
  });

  document.addEventListener("DOMContentLoaded", initInstallUI);

  registerServiceWorker();

  window.BILHKInstallApp = installApp;
})();
