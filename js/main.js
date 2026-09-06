/**
 * Sling Jump - Application Entry Point (Bootstrap)
 * Minimalist Vector Arcade Indie Game
 */
(function() {
  'use strict';

  // Instantiate Game Engine
  const engine = new GameEngine();
  window._gameEngine = engine;

  // Unlock WebAudio on user gesture
  const unlockAudio = () => {
    if (engine.audio && engine.audio.enabled) {
      engine.audio.init();
      if (engine.audio.ctx && engine.audio.ctx.state === 'suspended') {
        engine.audio.ctx.resume();
      }
    }
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  // Wire DOM UI Button Events
  function bindUIButtons() {
    const ui = engine.ui;
    const state = engine.state;
    const audio = engine.audio;

    const clickSfx = () => {
      if (audio) audio.playProceduralSfx('sfx_ui_click');
    };

    const hapticTick = (ms = 12) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(ms); } catch (e) {}
      }
    };

    // --- MAIN MENU BUTTONS ---
    const btnMenuPlay = document.getElementById('btn-menu-play');
    if (btnMenuPlay) {
      btnMenuPlay.addEventListener('click', () => {
        clickSfx();
        hapticTick(16);
        const unit = document.getElementById('ship-unit');
        if (unit) {
          unit.style.transform = 'translate(-50%, -100px) scale(1.4)';
          unit.style.filter = 'drop-shadow(0 0 40px var(--accent-crimson))';
        }
        setTimeout(() => {
          if (unit) {
            unit.style.transform = '';
            unit.style.filter = '';
          }
          state.changeState(StateManager.STATES.PLAYING);
        }, 180);
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

    // Currency capsule is purely informational (no modal opens on click)

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

    // --- QUICK TOAST NOTIFICATION ---
    let toastTimeout;
    const triggerQuickToast = (txt) => {
      const toast = document.getElementById('quick-toast');
      if (!toast) return;
      toast.textContent = txt;
      toast.classList.add('show');
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => toast.classList.remove('show'), 1600);
    };

    // --- CENTER STAGE INTERACTIVE SHIP HANGAR CAROUSEL ---
    // Skin 1: Sleek Delta Dart from user screenshot
    const skin1ScreenshotSvg = `
      <polygon points="0,-22 17,12 9,16 0,8 -9,16 -17,12" fill="#0c1220" stroke="#ffffff" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"></polygon>
      <polyline points="0,-13 12,9 7,12 0,6 -7,12 -12,9 0,-13" fill="none" stroke="var(--accent-crimson)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"></polyline>
      <polygon points="0,-19 3.5,-6 0,-2 -3.5,-6" fill="var(--accent-crimson)"></polygon>
      <polygon points="0,-18 1.8,-6 0,-3" fill="#ffffff" opacity="0.85"></polygon>
      <line x1="0" y1="-2" x2="0" y2="8" stroke="var(--accent-crimson)" stroke-width="1.8" stroke-linecap="round"></line>
      <circle cx="0" cy="2" r="4.2" fill="none" stroke="#22d3ee" stroke-width="1.6"></circle>
      <circle cx="0" cy="2" r="2.2" fill="#ffffff"></circle>
    `;

    // Skin 2: Current Phoenix Twin-Blade Fighter
    const skin2CurrentPhoenixSvg = `
      <polygon points="0,-22 4.5,-9 7,-4 21,10 20,14 11,11 7,13 0,9 -7,13 -11,11 -20,14 -21,10 -7,-4 -4.5,-9" fill="#080e1a" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"></polygon>
      <polygon points="5,-3 19,9 13,10 7,4" fill="rgba(255,255,255,0.06)"></polygon>
      <polygon points="-5,-3 -19,9 -13,10 -7,4" fill="rgba(255,255,255,0.06)"></polygon>
      <polyline points="4,-5 16,7 12,10" fill="none" stroke="var(--accent-crimson)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></polyline>
      <polyline points="-4,-5 -16,7 -12,10" fill="none" stroke="var(--accent-crimson)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></polyline>
      <polygon points="0,-19 3,-7 3,6 0,8 -3,6 -3,-7" fill="#0f192c" stroke="rgba(255,255,255,0.3)" stroke-width="1"></polygon>
      <polygon points="0,-14 3.5,-6 0,-1 -3.5,-6" fill="var(--accent-crimson)"></polygon>
      <polygon points="0,-13 2,-6 0,-3" fill="#ffffff" opacity="0.85"></polygon>
      <line x1="-7" y1="13" x2="-4" y2="13" stroke="var(--accent-crimson)" stroke-width="2" stroke-linecap="round"></line>
      <line x1="4" y1="13" x2="7" y2="13" stroke="var(--accent-crimson)" stroke-width="2" stroke-linecap="round"></line>
      <circle cx="0" cy="4" r="1.8" fill="#ffffff"></circle>
    `;

    // Skin 2 Locked Silhouette (Details hidden until purchased with coins)
    const skin2MysterySvg = `
      <polygon points="0,-22 4.5,-9 7,-4 21,10 20,14 11,11 7,13 0,9 -7,13 -11,11 -20,14 -21,10 -7,-4 -4.5,-9" fill="#03050b" stroke="rgba(255,255,255,0.10)" stroke-width="1.6" stroke-linejoin="round"></polygon>
      <circle cx="0" cy="3" r="5" fill="none" stroke="rgba(251,191,36,0.25)" stroke-width="1.3" stroke-dasharray="2 3"></circle>
      <circle cx="0" cy="3" r="1.6" fill="rgba(251,191,36,0.45)"></circle>
    `;

    function isShipUnlocked(shipId) {
      if (shipId === 'dart') return true;
      if (typeof engine !== 'undefined' && engine && engine.storage) {
        return engine.storage.isShipUnlocked(shipId);
      }
      try {
        const saved = JSON.parse(localStorage.getItem('sling_jump_save_v1'));
        return Array.isArray(saved?.unlockedShips) && saved.unlockedShips.includes(shipId);
      } catch (e) {
        return false;
      }
    }

    const menuShips = [
      {
        id: 'dart',
        name: 'DELTA DART',
        thruster: 'single',
        getSvg: () => skin1ScreenshotSvg
      },
      {
        id: 'phoenix',
        name: 'PHÖNIX',
        thruster: 'twin',
        cost: 500,
        getSvg: () => isShipUnlocked('phoenix') ? skin2CurrentPhoenixSvg : skin2MysterySvg
      }
    ];
    let menuShipIndex = 0;

    function renderMenuShip() {
      const ship = menuShips[menuShipIndex];
      const sUnit = document.getElementById('ship-unit');
      const sSvg = document.getElementById('ship-svg');
      const sPlasma = document.getElementById('ship-plasma');
      const btnBuy = document.getElementById('btn-buy-ship');
      const unlocked = isShipUnlocked(ship.id);

      if (sSvg) sSvg.innerHTML = ship.getSvg();

      if (btnBuy) {
        if (!unlocked) {
          btnBuy.style.display = 'inline-flex';
        } else {
          btnBuy.style.display = 'none';
        }
      }

      if (sUnit) {
        if (!unlocked) sUnit.classList.add('pokemon-locked');
        else sUnit.classList.remove('pokemon-locked');
      }

      if (sPlasma) {
        if (!unlocked) {
          sPlasma.style.display = 'none';
        } else {
          sPlasma.style.display = 'flex';
          const cFlame = sPlasma.querySelector('.plasma-flame.center');
          const lFlame = sPlasma.querySelector('.plasma-flame.left');
          const rFlame = sPlasma.querySelector('.plasma-flame.right');

          if (ship.thruster === 'single') {
            sPlasma.classList.add('single-thruster');
            if (cFlame) cFlame.style.display = 'block';
            if (lFlame) lFlame.style.display = 'none';
            if (rFlame) rFlame.style.display = 'none';
          } else {
            sPlasma.classList.remove('single-thruster');
            if (cFlame) cFlame.style.display = 'none';
            if (lFlame) lFlame.style.display = 'block';
            if (rFlame) rFlame.style.display = 'block';
          }
        }
      }

      for (let i = 0; i < menuShips.length; i++) {
        const dot = document.getElementById('dot-' + i);
        if (dot) dot.classList.toggle('active', i === menuShipIndex);
      }

      // Sync active ship with game engine player
      if (typeof engine !== 'undefined' && engine && engine.player) {
        const activeShipId = unlocked ? ship.id : 'dart';
        engine.player.setCustomization(activeShipId, engine.player.trailId);
      }
    }

    function selectMenuShip(idx) {
      menuShipIndex = (idx + menuShips.length) % menuShips.length;
      renderMenuShip();
      clickSfx();
      hapticTick(10);
    }

    function cycleMenuShip(dir = 1) {
      selectMenuShip(menuShipIndex + dir);
    }

    function handleMenuShipClick(e) {
      if (e) e.stopPropagation();
      clickSfx();
      hapticTick(12);
      const sUnit = document.getElementById('ship-unit');
      if (sUnit) {
        sUnit.style.transform = 'translate(-50%, -50%) scale(1.15)';
        setTimeout(() => { if (sUnit) sUnit.style.transform = ''; }, 160);
      }
      cycleMenuShip(1);
    }

    // Bind Carousel Elements
    const shipUnitEl = document.getElementById('ship-unit');
    if (shipUnitEl) shipUnitEl.addEventListener('click', handleMenuShipClick);

    const btnBuyShip = document.getElementById('btn-buy-ship');
    if (btnBuyShip) {
      btnBuyShip.addEventListener('click', (e) => {
        e.stopPropagation();
        const ship = menuShips[menuShipIndex];
        const cost = ship.cost || 500;
        const currentCores = (typeof engine !== 'undefined' && engine && engine.storage) ? engine.storage.data.cores : 0;
        if (currentCores >= cost) {
          if (typeof engine !== 'undefined' && engine && engine.storage) {
            engine.storage.spendCores(cost);
            engine.storage.unlockShip(ship.id);
            if (engine.audio) engine.audio.playSfx('sfx_slingshot_boost', { isBoost: true });
            if (engine.ui) engine.ui.updateCurrency();
          }
          renderMenuShip();
        } else {
          clickSfx();
          btnBuyShip.classList.add('shake');
          const buyLabel = btnBuyShip.querySelector('.buy-label');
          if (buyLabel) buyLabel.textContent = 'ZU WENIG COINS';
          setTimeout(() => {
            btnBuyShip.classList.remove('shake');
            if (buyLabel) buyLabel.textContent = 'KAUFEN';
          }, 850);
        }
      });
    }

    const dot0 = document.getElementById('dot-0');
    if (dot0) dot0.addEventListener('click', () => selectMenuShip(0));

    const dot1 = document.getElementById('dot-1');
    if (dot1) dot1.addEventListener('click', () => selectMenuShip(1));

    // Touch Swipe Gestures on Hangar Stage
    const hangarStage = document.getElementById('hangar-stage');
    if (hangarStage) {
      let touchStartX = 0;
      hangarStage.addEventListener('touchstart', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          touchStartX = e.changedTouches[0].clientX;
        }
      }, { passive: true });
      hangarStage.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          if (Math.abs(deltaX) > 35) {
            cycleMenuShip(deltaX > 0 ? -1 : 1);
          }
        }
      }, { passive: true });
    }

    // Initial render of ship model
    renderMenuShip();

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
        hapticTick(12);
        engine.startNewRun();
      });
    }

    const btnGameOverMenu = document.getElementById('btn-gameover-menu');
    if (btnGameOverMenu) {
      btnGameOverMenu.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.MENU);
      });
    }

    const btnGameOverLeaderboard = document.getElementById('btn-gameover-leaderboard');
    if (btnGameOverLeaderboard) {
      btnGameOverLeaderboard.addEventListener('click', () => {
        clickSfx();
        state.changeState(StateManager.STATES.LEADERBOARD);
      });
    }

    const btnGameOverShare = document.getElementById('btn-gameover-share');
    if (btnGameOverShare) {
      btnGameOverShare.addEventListener('click', async () => {
        clickSfx();
        const alt = document.getElementById('final-altitude-val')?.textContent || '0';
        const shareText = `Sling Jump: ${alt}m Flugdistanz gemeistert! Kannst du mich schlagen?`;
        if (navigator.share) {
          try {
            await navigator.share({ title: 'Sling Jump', text: shareText, url: window.location.href });
          } catch (e) {}
        } else if (navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(shareText);
            const originalHtml = btnGameOverShare.innerHTML;
            btnGameOverShare.textContent = 'KOPIERT!';
            setTimeout(() => {
              btnGameOverShare.innerHTML = originalHtml;
            }, 1500);
          } catch (e) {}
        }
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
          versionTapCount = 0;
          const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
          const targetUrl = 'dashboard/index.html';
          if (isAppStandalone) {
            // In standalone PWA, strictly isolate: open in system browser, never hijack game PWA
            const a = document.createElement('a');
            a.href = targetUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            window.open(targetUrl, '_blank') || (window.location.href = targetUrl);
          }
        }
      });
    });

    // Auto-Focus Window for instant keyboard response
    window.focus();
    document.body.focus();

    // Dynamically inject single source of truth version into all DOM elements
    const currentVerTag = (typeof CONSTANTS !== 'undefined' && CONSTANTS.VERSION) ? `v${CONSTANTS.VERSION}` : 'v4.6.2';
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

  // --- VIEWPORT STABILIZATION (NO FORCED FULLSCREEN API) ---
  // Mobile app standard: rely on 100dvh CSS viewport locking and standalone PWA display mode.
  // HTML5 Fullscreen API (requestFullscreen) is disabled to prevent intrusive Android Chrome
  // security toasts ("... zum Beenden des Vollbildmodus: von oben ziehen").
  // True fullscreen without banners is achieved when installed as PWA to home screen.
  function stabilizeViewport() {
    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
  }

  window.addEventListener('load', stabilizeViewport);
  window.addEventListener('orientationchange', () => {
    setTimeout(stabilizeViewport, 150);
  });
  window.addEventListener('resize', stabilizeViewport);

  // Start System
  bindUIButtons();
  engine.state.changeState(StateManager.STATES.MENU);
  engine.start();

})();
