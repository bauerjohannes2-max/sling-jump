/**
 * Sling Jump - Application Entry Point (Bootstrap)
 * Minimalist Vector Arcade Indie Game
 */
(function() {
  'use strict';

  // Instantiate Game Engine
  const engine = new GameEngine();
  window._gameEngine = engine;

  // Wire DOM UI Button Events
  function bindUIButtons() {
    const ui = engine.ui;
    const state = engine.state;
    const audio = engine.audio;

    const clickSfx = () => {
      if (audio) audio.playProceduralSfx('sfx_ui_click');
    };

    // --- MAIN MENU BUTTONS ---
    const btnMenuPlay = document.getElementById('btn-menu-play');
    if (btnMenuPlay) {
      btnMenuPlay.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.PLAYING);
      });
    }

    const btnMenuTutorial = document.getElementById('btn-menu-tutorial');
    if (btnMenuTutorial) {
      btnMenuTutorial.addEventListener('click', () => {
        clickSfx();
        ui.openTutorialModal(1);
      });
    }

    const btnTutNext = document.getElementById('btn-tut-next');
    if (btnTutNext) {
      btnTutNext.addEventListener('click', () => {
        clickSfx();
        ui.showTutorialSlide(2);
      });
    }

    const btnTutBack = document.getElementById('btn-tut-back');
    if (btnTutBack) {
      btnTutBack.addEventListener('click', () => {
        clickSfx();
        ui.showTutorialSlide(1);
      });
    }

    const btnTutPlay = document.getElementById('btn-tut-play');
    if (btnTutPlay) {
      btnTutPlay.addEventListener('click', () => {
        clickSfx();
        ui.closeTutorialModal();
        state.changeState(StateManager.STATES.PLAYING);
      });
    }

    const btnTutClose1 = document.getElementById('btn-tut-close-1');
    if (btnTutClose1) {
      btnTutClose1.addEventListener('click', () => {
        clickSfx();
        ui.closeTutorialModal();
      });
    }

    const btnMenuShop = document.getElementById('btn-menu-shop');
    if (btnMenuShop) {
      btnMenuShop.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.SHOP);
      });
    }

    const btnMenuLeaderboard = document.getElementById('btn-menu-leaderboard');
    if (btnMenuLeaderboard) {
      btnMenuLeaderboard.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.LEADERBOARD);
      });
    }

    const btnMenuQuests = document.getElementById('btn-menu-quests');
    if (btnMenuQuests) {
      btnMenuQuests.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.QUESTS);
      });
    }

    const btnMenuStats = document.getElementById('btn-menu-stats');
    if (btnMenuStats) {
      btnMenuStats.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.STATS);
      });
    }

    const btnMenuSettings = document.getElementById('btn-menu-settings');
    if (btnMenuSettings) {
      btnMenuSettings.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.SETTINGS);
      });
    }

    const btnMenuProfile = document.getElementById('btn-menu-profile');
    if (btnMenuProfile) {
      btnMenuProfile.addEventListener('click', () => {
        clickSfx();
        ui.openProfileModal();
      });
    }

    const btnProfileClose = document.getElementById('btn-profile-close');
    if (btnProfileClose) {
      btnProfileClose.addEventListener('click', () => {
        clickSfx();
        ui.closeProfileModal();
      });
    }

    const btnProfileRandom = document.getElementById('btn-profile-random');
    if (btnProfileRandom) {
      btnProfileRandom.addEventListener('click', (e) => {
        ui.rerollProfileName(e);
      });
    }

    // --- HUD BUTTONS ---
    const btnHudPause = document.getElementById('btn-hud-pause');
    if (btnHudPause) {
      btnHudPause.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.PAUSED);
      });
    }

    // --- PAUSE MODAL BUTTONS ---
    const btnPauseResume = document.getElementById('btn-pause-resume');
    if (btnPauseResume) {
      btnPauseResume.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.PLAYING);
      });
    }

    const btnPauseRestart = document.getElementById('btn-pause-restart');
    if (btnPauseRestart) {
      btnPauseRestart.addEventListener('click', () => {
        clickSfx();
        engine.startNewRun();
      });
    }

    const btnPauseSettings = document.getElementById('btn-pause-settings');
    if (btnPauseSettings) {
      btnPauseSettings.addEventListener('click', () => {
        clickSfx();
        if (ui.dom.settingsModal) ui.dom.settingsModal.classList.add('visible');
      });
    }

    const btnPauseQuit = document.getElementById('btn-pause-quit');
    if (btnPauseQuit) {
      btnPauseQuit.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.MENU);
      });
    }

    // --- GAME OVER BUTTONS ---
    const btnGameOverRevive = document.getElementById('btn-gameover-revive');
    if (btnGameOverRevive) {
      btnGameOverRevive.addEventListener('click', () => {
        clickSfx();
        engine.revivePlayer();
      });
    }

    const btnGameOverRestart = document.getElementById('btn-gameover-restart');
    if (btnGameOverRestart) {
      btnGameOverRestart.addEventListener('click', () => {
        clickSfx();
        engine.startNewRun();
      });
    }

    const btnGameOverShop = document.getElementById('btn-gameover-shop');
    if (btnGameOverShop) {
      btnGameOverShop.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.SHOP);
      });
    }

    const btnGameOverMenu = document.getElementById('btn-gameover-menu');
    if (btnGameOverMenu) {
      btnGameOverMenu.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.MENU);
      });
    }

    // --- SHOP / HANGAR BUTTONS ---
    document.querySelectorAll('.shop-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        clickSfx();
        ui.openHangarTab(btn.dataset.tab);
      });
    });

    const btnShopAction = document.getElementById('shop-action-btn');
    if (btnShopAction) {
      btnShopAction.addEventListener('click', () => {
        ui.handleShopAction();
      });
    }

    const btnShopClose = document.getElementById('btn-shop-close');
    if (btnShopClose) {
      btnShopClose.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.MENU);
      });
    }

    // --- DEDICATED MODAL CLOSE BUTTONS ---
    const btnQuestsClose = document.getElementById('btn-quests-close');
    if (btnQuestsClose) {
      btnQuestsClose.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.MENU);
      });
    }

    const btnLeaderboardClose = document.getElementById('btn-leaderboard-close');
    if (btnLeaderboardClose) {
      btnLeaderboardClose.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.MENU);
      });
    }

    const btnStatsClose = document.getElementById('btn-stats-close');
    if (btnStatsClose) {
      btnStatsClose.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.MENU);
      });
    }

    // --- SETTINGS MODAL BUTTONS ---
    const btnOpenTutorial = document.getElementById('btn-open-tutorial');
    if (btnOpenTutorial) {
      btnOpenTutorial.addEventListener('click', () => {
        clickSfx();
        if (ui.dom.settingsModal) ui.dom.settingsModal.classList.remove('visible');
        ui.openTutorialModal(1);
      });
    }

    const btnSettingsClose = document.getElementById('btn-settings-close');
    if (btnSettingsClose) {
      btnSettingsClose.addEventListener('click', () => {
        clickSfx();
        state.returnToPrevious();
      });
    }

    const btnCheckUpdate = document.getElementById('btn-check-update');
    if (btnCheckUpdate) {
      btnCheckUpdate.addEventListener('click', () => {
        clickSfx();
        checkServerVersion(true);
      });
    }

    const btnResetData = document.getElementById('btn-reset-data');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        clickSfx();
        if (ui.dom.confirmModal) ui.dom.confirmModal.classList.add('visible');
      });
    }

    const btnConfirmYes = document.getElementById('btn-confirm-yes');
    if (btnConfirmYes) {
      btnConfirmYes.addEventListener('click', () => {
        clickSfx();
        engine.storage.resetAll();
        engine.world.setTheme('deep_space');
        ui.initSettingsUI();
        if (ui.dom.confirmModal) ui.dom.confirmModal.classList.remove('visible');
        if (ui.dom.settingsModal) ui.dom.settingsModal.classList.remove('visible');
        state.changeState(StateManager.STATES.MENU);
      });
    }

    const btnConfirmNo = document.getElementById('btn-confirm-no');
    if (btnConfirmNo) {
      btnConfirmNo.addEventListener('click', () => {
        clickSfx();
        if (ui.dom.confirmModal) ui.dom.confirmModal.classList.remove('visible');
      });
    }

    // --- PWA INSTALLATION & BANNER LOGIC ---
    let deferredPrompt = null;
    const pwaBanner = document.getElementById('pwa-install-banner');
    const btnPwaInstall = document.getElementById('btn-pwa-install');
    const btnPwaDismiss = document.getElementById('btn-pwa-dismiss');
    const pwaDesc = document.getElementById('pwa-banner-desc');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const isDismissed = sessionStorage.getItem('pwa_dismissed');
      if (!isDismissed && pwaBanner) {
        pwaBanner.style.display = 'block';
      }
    });

    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    if (isIos && !isStandalone) {
      const isDismissed = sessionStorage.getItem('pwa_dismissed');
      if (!isDismissed && pwaBanner) {
        pwaBanner.style.display = 'block';
        if (pwaDesc) pwaDesc.textContent = 'Safari: Teilen -> "Zum Home-Bildschirm"';
        if (btnPwaInstall) btnPwaInstall.style.display = 'none';
      }
    }

    if (btnPwaInstall) {
      btnPwaInstall.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            if (pwaBanner) pwaBanner.style.display = 'none';
          }
          deferredPrompt = null;
        }
      });
    }

    if (btnPwaDismiss) {
      btnPwaDismiss.addEventListener('click', () => {
        if (pwaBanner) pwaBanner.style.display = 'none';
        sessionStorage.setItem('pwa_dismissed', 'true');
      });
    }

    // Secret gesture: 3 taps on version tag opens dashboard
    let versionTapCount = 0;
    let versionTapTimer = null;
    const versionTags = document.querySelectorAll('.app-version-tag, .settings-version-tag');
    versionTags.forEach(el => {
      el.style.cursor = 'pointer';
      el.title = 'Tippe 3x für Spieler-Dashboard';
      el.addEventListener('click', () => {
        versionTapCount++;
        clearTimeout(versionTapTimer);
        versionTapTimer = setTimeout(() => { versionTapCount = 0; }, 800);
        if (versionTapCount >= 3) {
          window.open('dashboard.html', '_blank') || (window.location.href = 'dashboard.html');
        }
      });
    });

    // Auto-Focus Window for instant keyboard response
    window.focus();
    document.body.focus();

    // Dynamically inject single source of truth version into all DOM elements
    const currentVerTag = (typeof CONSTANTS !== 'undefined' && CONSTANTS.VERSION) ? `v${CONSTANTS.VERSION}` : 'v3.33.0';
    document.querySelectorAll('.app-version-tag').forEach(el => { el.textContent = currentVerTag; });
    document.querySelectorAll('.settings-version-tag').forEach(el => { el.textContent = `SLING JUMP ${currentVerTag}`; });
  }

  // --- BULLETPROOF VERSION & AUTO-UPDATE CHECKER ---
  async function checkServerVersion(isManual = false) {
    if (!window.location.protocol.startsWith('http')) return;
    const btnCheck = document.getElementById('btn-check-update');
    const currentVer = (typeof CONSTANTS !== 'undefined' && CONSTANTS.VERSION) ? CONSTANTS.VERSION : '3.33.0';
    const currentVerTag = `v${currentVer}`;

    if (isManual && btnCheck) {
      btnCheck.textContent = 'PRÜFE UPDATE...';
    }

    try {
      // 1. Fetch static version.json (works seamlessly on GitHub Pages and local servers)
      let serverVer = null;
      try {
        const res = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          serverVer = data.version;
        }
      } catch (e) {}

      // Fallback to /api/version if available
      if (!serverVer) {
        try {
          const resApi = await fetch(`/api/version?t=${Date.now()}`, { cache: 'no-store' });
          if (resApi.ok) {
            const dataApi = await resApi.json();
            serverVer = dataApi.version;
          }
        } catch (e) {}
      }

      if (serverVer && serverVer !== currentVer) {
        console.log(`[Update] Neuer Build verfügbar: ${serverVer} (Lokal: ${currentVer}). Aktualisiere...`);
        if (btnCheck) btnCheck.textContent = `UPDATE GEFUNDEN (v${serverVer})!`;

        // 1. Clean all caches
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map(n => caches.delete(n)));
        }

        // 2. Update service worker registrations
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const r of regs) {
            await r.update();
            if (r.active) r.active.postMessage({ action: 'skipWaiting' });
          }
        }

        // 3. Force clean reload
        setTimeout(() => {
          window.location.reload();
        }, 700);
      } else {
        // Versions match or up to date - also ping service worker to check for byte updates
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const r of regs) {
            await r.update();
          }
        }

        if (isManual && btnCheck) {
          btnCheck.textContent = `VERSION AKTUELL (${currentVerTag})`;
          setTimeout(() => {
            btnCheck.textContent = 'NACH UPDATES SUCHEN';
          }, 2500);
        }
      }
    } catch (err) {
      if ('serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const r of regs) { await r.update(); }
        } catch (e) {}
      }
      if (isManual && btnCheck) {
        btnCheck.textContent = `VERSION AKTUELL (${currentVerTag})`;
        setTimeout(() => {
          btnCheck.textContent = 'NACH UPDATES SUCHEN';
        }, 2500);
      }
    }
  }

  // --- SERVICE WORKER REGISTRATION (PWA Caching & Instant Updates) ---
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        // Check for updates on register
        reg.update();

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] Neuer Build installiert. Aktiviere sofort...');
                newWorker.postMessage({ action: 'skipWaiting' });
              }
            });
          }
        });
      }).catch(() => {});

      // Check server version on launch
      checkServerVersion(false);
    });

    // Also check for updates whenever user returns to the app tab / home screen
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkServerVersion(false);
      }
    });
  }

  // --- TELEMETRY / ANALYTICS INITIALIZATION ---
  if (window.AnalyticsService) {
    window.AnalyticsService.init();
  }

  // Start System
  bindUIButtons();
  engine.state.changeState(StateManager.STATES.MENU);
  engine.start();

})();
