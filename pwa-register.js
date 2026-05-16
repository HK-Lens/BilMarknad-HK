(function () {
  'use strict';

  const INSTALL_BUTTON_ID = 'bilhkInstallAppBtn';
  const APP_NAME = 'BILHK';
  let deferredPrompt = null;

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function getInstallButton() {
    let button = document.getElementById(INSTALL_BUTTON_ID);

    if (!button) {
      button = document.createElement('button');
      button.id = INSTALL_BUTTON_ID;
      button.type = 'button';
      button.className = 'install-app-btn';
      button.innerHTML = '<i class="fa-solid fa-download" aria-hidden="true"></i> Installera app';

      const nav = document.querySelector('.nav-links');
      const sellButton = document.querySelector('.btn-sell');
      if (nav && sellButton) {
        sellButton.insertAdjacentElement('afterend', button);
      } else if (nav) {
        nav.prepend(button);
      } else {
        document.body.appendChild(button);
      }
    }

    return button;
  }

  function styleInstallButton() {
    if (document.getElementById('bilhk-pwa-style')) return;

    const style = document.createElement('style');
    style.id = 'bilhk-pwa-style';
    style.textContent = `
      .install-app-btn {
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 0;
        cursor: pointer;
        padding: 10px 18px;
        border-radius: 999px;
        background: #0f172a;
        color: #ffffff;
        font-weight: 900;
        font-size: 14px;
        box-shadow: 0 12px 28px rgba(15,23,42,.18);
        white-space: nowrap;
      }
      .install-app-btn:hover { filter: brightness(1.06); }
      .install-app-btn.installed { background: #16a34a; }
      @media (max-width: 720px) {
        .install-app-btn {
          padding: 10px 14px;
          font-size: 13px;
          order: 2;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function showManualInstallHelp() {
    alert(
      'Installationsknappen är klar.\n\n' +
      'Om installationsrutan inte öppnas automatiskt: öppna webbplatsen i Chrome, tryck på menyn ⋮ och välj:\n' +
      'Installera app\n' +
      'eller Lägg till på startskärmen.'
    );
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
      await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
    } catch (error) {
      console.warn('BILHK service worker registration failed:', error);
    }
  }

  function setupInstallButton() {
    styleInstallButton();
    const button = getInstallButton();

    if (isStandalone()) {
      button.classList.add('installed');
      button.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Appen är installerad';
    }

    button.addEventListener('click', async () => {
      if (isStandalone()) {
        alert(APP_NAME + ' är redan installerad på enheten.');
        return;
      }

      if (!deferredPrompt) {
        showManualInstallHelp();
        return;
      }

      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch (error) {
        console.warn('BILHK install prompt failed:', error);
      }
      deferredPrompt = null;
    });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    const button = getInstallButton();
    button.style.display = 'inline-flex';
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const button = getInstallButton();
    button.classList.add('installed');
    button.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Appen är installerad';
  });

  document.addEventListener('DOMContentLoaded', () => {
    setupInstallButton();
    registerServiceWorker();
  });
})();
