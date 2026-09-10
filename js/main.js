/**
 * Space Jump - Application Entry Point (Bootstrap)
 * Minimalist Vector Arcade Indie Game
 */
(function() {
  'use strict';

  // Pin the app to a stable visual viewport so browser chrome / live PWA
  // updates overlay the UI instead of shrinking 100dvh and shifting layout.
  function applyViewportLock() {
    const vv = window.visualViewport;
    const visualH = vv && vv.height ? vv.height : 0;
    const layoutH = window.innerHeight || document.documentElement.clientHeight || 0;
    const offsetTop = vv ? Math.round(vv.offsetTop || 0) : 0;
    const height = Math.max(1, Math.round(offsetTop > 0 ? (visualH || layoutH) : Math.max(visualH, layoutH)));
    document.documentElement.style.setProperty('--app-height', `${height}px`);
    document.documentElement.style.setProperty('--app-offset-top', `${offsetTop}px`);
    if (window.scrollY !== 0) window.scrollTo(0, 0);
  }
  applyViewportLock();
  window.addEventListener('resize', applyViewportLock);
  window.addEventListener('orientationchange', () => setTimeout(applyViewportLock, 150));
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', applyViewportLock);
    window.visualViewport.addEventListener('scroll', applyViewportLock);
  }

  // Instantiate Game Engine
  const engine = new GameEngine();
  window._gameEngine = engine;

  // Assigned by bindUIButtons(); the hangar carousel state is a closure inside it.
  let refreshHangar = () => {};

  // Unlock WebAudio on user gesture
  const unlockAudio = () => {
    if (engine.audio && engine.audio.enabled) {
      if (engine.audio.isPageHidden && engine.audio.isPageHidden()) return;
      engine.audio.init();
      if (engine.audio.ctx && engine.audio.ctx.state === 'suspended') {
        engine.audio.ctx.resume();
      }
      if (engine.ui && engine.ui.syncMusic) {
        engine.ui.syncMusic(engine.state ? engine.state.currentState : StateManager.STATES.MENU);
      }
    }
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && engine.storage && engine.storage.syncToCloudNow) {
      engine.storage.syncToCloudNow();
    }
  });

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
  window._quickToast = triggerQuickToast;

  // Wire DOM UI Button Events
  function bindUIButtons() {
    const ui = engine.ui;
    const state = engine.state;

    const hapticTick = (ms = 12) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(ms); } catch (e) {}
      }
    };

    const onBtn = (id, handler) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          handler(e);
        });
      }
    };

    // --- MAIN MENU BUTTONS ---
    const btnMenuPlay = document.getElementById('btn-menu-play');
    if (btnMenuPlay) {
      btnMenuPlay.addEventListener('click', () => {
        hapticTick(16);
        const unit = document.getElementById('ship-unit');
        if (unit) {
          unit.style.transform = 'translate(-50%, -100px) scale(1.4)';
        }
        setTimeout(() => {
          if (unit) {
            unit.style.transform = '';
          }
          state.changeState(StateManager.STATES.PLAYING);
        }, 180);
      });
    }

    onBtn('btn-menu-tutorial', () => ui.openTutorialModal(1));
    onBtn('btn-tut-play', () => {
      ui.closeTutorialModal();
      state.changeState(StateManager.STATES.PLAYING);
    });
    onBtn('btn-tut-close-1', () => ui.closeTutorialModal());

    // Currency capsule is purely informational (no modal opens on click)
    onBtn('btn-menu-leaderboard', () => state.changeState(StateManager.STATES.LEADERBOARD));
    onBtn('btn-menu-quests', () => state.changeState(StateManager.STATES.QUESTS));
    onBtn('btn-menu-stats', () => state.changeState(StateManager.STATES.STATS));
    onBtn('btn-menu-settings', () => state.changeState(StateManager.STATES.SETTINGS));
    onBtn('btn-menu-profile', () => ui.openProfileModal());
    onBtn('btn-profile-close', () => ui.closeProfileModal());

    // --- ACCOUNT: guest locally, name + password to persist ---
    const refreshAfterAccountChange = () => {
      ui.updateUserProfileNav();
      ui.updateHUD();
      ui.initSettingsUI();
      refreshHangar();
      ui.openProfileModal();
    };

    const createForm = document.getElementById('profile-create-form');
    if (createForm) {
      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('account-password-input');
        const pw = input ? input.value.trim() : '';
        if (!pw) {
          triggerQuickToast('BITTE PASSWORT EINGEBEN');
          return;
        }
        if (pw.length < 4) {
          triggerQuickToast('PASSWORT MINDESTENS 4 ZEICHEN');
          return;
        }
        const res = await engine.storage.createAccount(pw);
        triggerQuickToast((res && res.message ? res.message : 'FEHLER').toUpperCase());
        if (res && res.success) {
          if (input) input.value = '';
          refreshAfterAccountChange();
        }
      });
    }

    const loginForm = document.getElementById('profile-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('login-name-input');
        const pwInput = document.getElementById('login-password-input');
        const name = nameInput ? nameInput.value.trim() : '';
        const pw = pwInput ? pwInput.value.trim() : '';
        if (!name) {
          triggerQuickToast('BITTE NAMEN EINGEBEN');
          return;
        }
        if (!pw) {
          triggerQuickToast('BITTE PASSWORT EINGEBEN');
          return;
        }
        const res = await engine.storage.login(name, pw);
        if (res && res.success) {
          triggerQuickToast((res.message || 'EINGELOGGT').toUpperCase());
          if (nameInput) nameInput.value = '';
          if (pwInput) pwInput.value = '';
          refreshAfterAccountChange();
        } else {
          triggerQuickToast(res && res.message ? res.message.toUpperCase() : 'LOGIN FEHLGESCHLAGEN');
        }
      });
    }

    // --- CENTER STAGE INTERACTIVE SHIP HANGAR CAROUSEL ---
    function isShipUnlocked(shipId) {
      const def = CONSTANTS.SHIPS.find(s => s.id === shipId);
      if (def && def.cost === 0) return true;
      return (engine && engine.storage) ? engine.storage.isShipUnlocked(shipId) : false;
    }

    const menuShips = CONSTANTS.SHIPS.map(ship => ({
      id: ship.id,
      name: ship.name,
      role: ship.role,
      cost: ship.cost
    }));

    const savedShipId = engine.storage && engine.storage.data && engine.storage.data.selectedShip;
    const savedShipIdx = menuShips.findIndex(s => s.id === savedShipId);
    let menuShipIndex = savedShipIdx >= 0 ? savedShipIdx : 0;

    const shipDotsEl = document.getElementById('ship-dots');
    if (shipDotsEl) {
      shipDotsEl.innerHTML = menuShips.map((_, index) =>
        `<span class="s-dot" id="dot-${index}"></span>`
      ).join('');
    }

    function formatShipCost(cost) {
      return Number(cost).toLocaleString('de-DE');
    }

    function persistEquippedShip(shipId) {
      if (!engine.storage) return;
      if (engine.storage.data.selectedShip !== shipId) {
        engine.storage.data.selectedShip = shipId;
        engine.storage.save();
      }
      if (engine.player) {
        engine.player.setCustomization(shipId, engine.player.trailId);
      }
    }

    function renderMenuShip() {
      const ship = menuShips[menuShipIndex];
      const sUnit = document.getElementById('ship-unit');
      const sSvg = document.getElementById('ship-svg');
      const btnBuy = document.getElementById('btn-buy-ship');
      const nameEl = document.getElementById('hangar-ship-name');
      const tierEl = document.getElementById('hangar-ship-tier');
      const unlocked = isShipUnlocked(ship.id);

      if (sSvg && typeof ShipArt !== 'undefined') {
        sSvg.innerHTML = ShipArt.toSvg(ship.id, { locked: !unlocked });
      }

      if (nameEl) nameEl.textContent = ship.name;
      if (tierEl) tierEl.textContent = ship.role || '';

      if (btnBuy) {
        if (!unlocked) {
          btnBuy.style.display = 'inline-flex';
          const priceEl = btnBuy.querySelector('.buy-price');
          if (priceEl && priceEl.firstChild) priceEl.firstChild.nodeValue = `${formatShipCost(ship.cost)} `;
        } else {
          btnBuy.style.display = 'none';
        }
      }

      if (sUnit) {
        if (!unlocked) sUnit.classList.add('pokemon-locked');
        else sUnit.classList.remove('pokemon-locked');
      }

      for (let i = 0; i < menuShips.length; i++) {
        const dot = document.getElementById('dot-' + i);
        if (dot) dot.classList.toggle('active', i === menuShipIndex);
      }

      if (unlocked) persistEquippedShip(ship.id);
    }

    refreshHangar = renderMenuShip;

    let hangarBusy = false;

    function playHangarSlide(dir, applyIndex) {
      if (hangarBusy) return;
      hangarBusy = true;
      const unit = document.getElementById('ship-unit');
      const inner = document.getElementById('hero-ship-inner');
      const meta = document.getElementById('hangar-ship-meta');
      const outX = dir > 0 ? -86 : 86;
      const inX = dir > 0 ? 86 : -86;

      if (unit) {
        unit.classList.add('skin-animating');
        unit.style.transition = 'transform 0.18s cubic-bezier(0.4, 0, 1, 0.4), opacity 0.14s ease';
        unit.style.transform = `translate(calc(-50% + ${outX}px), -50%) scale(0.86)`;
        unit.style.opacity = '0';
      }
      if (inner) inner.style.animationPlayState = 'paused';
      if (meta) {
        meta.classList.add('skin-meta-out');
      }

      window.setTimeout(() => {
        applyIndex();
        if (unit) {
          unit.style.transition = 'none';
          unit.style.transform = `translate(calc(-50% + ${inX}px), -50%) scale(0.86)`;
          void unit.offsetWidth;
          unit.style.transition = 'transform 0.36s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease';
          unit.style.transform = 'translate(-50%, -50%) scale(1)';
          unit.style.opacity = '1';
        }
        if (meta) {
          meta.classList.remove('skin-meta-out');
          meta.classList.add('skin-meta-in');
        }
        window.setTimeout(() => {
          hangarBusy = false;
          if (unit) {
            unit.classList.remove('skin-animating');
            unit.style.transition = '';
            unit.style.transform = '';
            unit.style.opacity = '';
          }
          if (inner) inner.style.animationPlayState = '';
          if (meta) meta.classList.remove('skin-meta-in');
        }, 360);
      }, 160);
    }

    function selectMenuShip(idx, dir) {
      if (hangarBusy) return;
      const next = (idx + menuShips.length) % menuShips.length;
      if (next === menuShipIndex) {
        renderMenuShip();
        return;
      }
      let slideDir = dir;
      if (slideDir == null) {
        const n = menuShips.length;
        const fwd = (next - menuShipIndex + n) % n;
        const back = (menuShipIndex - next + n) % n;
        slideDir = fwd <= back ? 1 : -1;
      }
      playHangarSlide(slideDir, () => {
        menuShipIndex = next;
        renderMenuShip();
      });
      hapticTick(10);
    }

    function cycleMenuShip(dir = 1) {
      selectMenuShip(menuShipIndex + dir, dir);
    }

    function handleMenuShipClick(e) {
      if (e) e.stopPropagation();
      if (hangarBusy) return;
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
        const result = engine.shop.buyItem('ships', ship.id);
        if (result.success) {
          if (engine.ui) engine.ui.updateCurrency();
          renderMenuShip();
          triggerQuickToast(result.message.toUpperCase());
        } else {
          btnBuyShip.classList.add('shake');
          const buyLabel = btnBuyShip.querySelector('.buy-label');
          if (buyLabel) buyLabel.textContent = (result.message || 'ZU WENIG COINS').toUpperCase();
          setTimeout(() => {
            btnBuyShip.classList.remove('shake');
            if (buyLabel) buyLabel.textContent = 'KAUFEN';
          }, 850);
        }
      });
    }

    menuShips.forEach((_, index) => {
      const dot = document.getElementById('dot-' + index);
      if (dot) dot.addEventListener('click', () => selectMenuShip(index));
    });

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
    onBtn('btn-hud-pause', () => state.changeState(StateManager.STATES.PAUSED));

    // --- PAUSE MODAL BUTTONS ---
    onBtn('btn-pause-resume', () => state.changeState(StateManager.STATES.PLAYING));
    onBtn('btn-pause-restart', () => engine.startNewRun());
    onBtn('btn-pause-settings', () => {
      if (ui.dom.settingsModal) ui.dom.settingsModal.classList.add('visible');
    });
    onBtn('btn-pause-quit', () => state.changeState(StateManager.STATES.MENU));

    // --- GAME OVER BUTTONS ---
    const onDebriefBtn = (id, handler) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', (e) => {
        if (!ui.isDebriefInteractive()) return;
        handler(e);
      });
    };

    onDebriefBtn('btn-gameover-revive', () => engine.revivePlayer());
    onDebriefBtn('btn-gameover-restart', () => {
      hapticTick(12);
      engine.startNewRun();
    });
    onDebriefBtn('btn-gameover-menu', () => state.changeState(StateManager.STATES.MENU));

    const btnGameOverShare = document.getElementById('btn-gameover-share');
    if (btnGameOverShare) {
      btnGameOverShare.addEventListener('click', async () => {
        if (!ui.isDebriefInteractive()) return;
        const result = await ui.shareGameOverRun();
        if (result && result.copied) {
          const originalHtml = btnGameOverShare.innerHTML;
          btnGameOverShare.textContent = 'KOPIERT!';
          setTimeout(() => {
            btnGameOverShare.innerHTML = originalHtml;
          }, 1500);
        }
      });
    }

    // --- DEDICATED MODAL CLOSE BUTTONS ---
    onBtn('btn-quests-close', () => state.changeState(StateManager.STATES.MENU));
    onBtn('btn-leaderboard-close', () => state.changeState(StateManager.STATES.MENU));
    onBtn('btn-stats-close', () => state.changeState(StateManager.STATES.MENU));

    // --- SETTINGS MODAL BUTTONS ---
    onBtn('btn-open-tutorial', () => {
      if (ui.dom.settingsModal) ui.dom.settingsModal.classList.remove('visible');
      ui.openTutorialModal(1);
    });
    onBtn('btn-settings-close', () => state.returnToPrevious());
    onBtn('btn-check-update', () => checkServerVersion(true));
    onBtn('btn-reset-data', () => {
      if (ui.dom.confirmModal) ui.dom.confirmModal.classList.add('visible');
    });

    onBtn('btn-confirm-yes', () => {
      engine.storage.resetAll();
      engine.world.setTheme('deep_space');
      ui.initSettingsUI();
      if (ui.dom.confirmModal) ui.dom.confirmModal.classList.remove('visible');
      if (ui.dom.settingsModal) ui.dom.settingsModal.classList.remove('visible');
      state.changeState(StateManager.STATES.MENU);
    });

    onBtn('btn-confirm-no', () => {
      if (ui.dom.confirmModal) ui.dom.confirmModal.classList.remove('visible');
    });

    const openDeleteAccountModal = () => {
      const modal = document.getElementById('delete-account-modal');
      const input = document.getElementById('delete-account-password');
      if (input) input.value = '';
      if (modal) modal.classList.add('visible');
    };
    const closeDeleteAccountModal = () => {
      const modal = document.getElementById('delete-account-modal');
      if (modal) modal.classList.remove('visible');
    };
    onBtn('btn-delete-cloud-account', openDeleteAccountModal);
    onBtn('btn-delete-account-no', closeDeleteAccountModal);
    onBtn('btn-delete-account-yes', async () => {
      const input = document.getElementById('delete-account-password');
      const pw = input ? input.value.trim() : '';
      const res = await engine.storage.deleteCloudAccount(pw);
      if (!res || !res.success) {
        triggerQuickToast((res && res.message) || 'Löschen fehlgeschlagen.');
        return;
      }
      closeDeleteAccountModal();
      ui.initSettingsUI();
      ui.updateUserProfileNav();
      if (ui.dom.settingsModal) ui.dom.settingsModal.classList.remove('visible');
      state.changeState(StateManager.STATES.MENU);
      triggerQuickToast(res.message || 'Cloud-Account gelöscht.');
    });
    const deletePwInput = document.getElementById('delete-account-password');
    if (deletePwInput) {
      deletePwInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const yes = document.getElementById('btn-delete-account-yes');
          if (yes) yes.click();
        }
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

    // Auto-Focus Window for instant keyboard response
    window.focus();
    document.body.focus();

    // Dynamically inject single source of truth version into all DOM elements
    const currentVerTag = (typeof CONSTANTS !== 'undefined' && CONSTANTS.VERSION) ? `v${CONSTANTS.VERSION}` : 'v4.6.2';
    document.querySelectorAll('.app-version-tag').forEach(el => { el.textContent = currentVerTag; });
    document.querySelectorAll('.settings-version-tag').forEach(el => { el.textContent = `SPACE JUMP ${currentVerTag}`; });
  }

  // --- VERSION & AUTO-UPDATE CHECKER ---
  // Same-origin version.json is not enough: an old service worker or a GitHub Pages
  // CDN hit can echo the installed build back, so the app reports "aktuell" forever.
  // We probe several publishers in parallel and only reload when a *newer* semver wins.
  const PUBLISHED_PAGES_VERSION = 'https://bauerjohannes2-max.github.io/space-jump/version.json';
  const PUBLISHED_RAW_VERSION = 'https://raw.githubusercontent.com/bauerjohannes2-max/space-jump/main/version.json';
  let versionCheckInFlight = false;

  function parseSemver(value) {
    if (value == null) return null;
    const cleaned = String(value).trim().replace(/^v/i, '');
    const m = cleaned.match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!m) return null;
    return [Number(m[1]), Number(m[2]), Number(m[3]), cleaned];
  }

  function isNewerVersion(remote, local) {
    const a = parseSemver(remote);
    const b = parseSemver(local);
    if (!a || !b) return false;
    for (let i = 0; i < 3; i++) {
      if (a[i] > b[i]) return true;
      if (a[i] < b[i]) return false;
    }
    return false;
  }

  function versionCheckSources() {
    const t = Date.now();
    const sources = [new URL(`version.json?t=${t}`, window.location.href).href];
    if (!/\.github\.io$/i.test(window.location.hostname)) {
      sources.push(`/api/version?t=${t}`);
      sources.push(`${PUBLISHED_PAGES_VERSION}?t=${t}`);
    }
    sources.push(`${PUBLISHED_RAW_VERSION}?t=${t}`);
    if (/\.github\.io$/i.test(window.location.hostname)) {
      sources.push(`${PUBLISHED_PAGES_VERSION}?t=${t}`);
    }
    return sources;
  }

  async function fetchPublishedVersion(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        signal: ctrl.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) return null;
      const data = await res.json();
      const parsed = parseSemver(data && (data.version || data.tag));
      return parsed ? parsed[3] : null;
    } catch (e) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async function resolveLatestPublishedVersion() {
    const found = await Promise.all(versionCheckSources().map(fetchPublishedVersion));
    let latest = null;
    for (const ver of found) {
      if (!ver) continue;
      if (!latest || isNewerVersion(ver, latest)) latest = ver;
    }
    return latest;
  }

  async function purgeAppCachesAndWorkers() {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) {
        try {
          if (r.active) r.active.postMessage({ action: 'purgeCache' });
        } catch (e) {}
        try {
          await r.unregister();
        } catch (e) {}
      }
    }
  }

  let pendingReloadUrl = null;

  function isInActiveRun() {
    const s = engine.state && engine.state.currentState;
    return s === StateManager.STATES.PLAYING
      || s === StateManager.STATES.PAUSED
      || s === StateManager.STATES.TUTORIAL
      || s === StateManager.STATES.GAME_OVER;
  }

  async function navigateForUpdate(url) {
    if (typeof url === 'string') {
      window._sjSuppressSwReload = true;
      try {
        await purgeAppCachesAndWorkers();
      } catch (e) {}
      location.replace(url);
      return;
    }
    location.reload();
  }

  function performOrDeferReload(url) {
    if (isInActiveRun()) {
      pendingReloadUrl = url || true;
      return;
    }
    navigateForUpdate(url);
  }

  const originalChangeState = engine.state.changeState.bind(engine.state);
  engine.state.changeState = function(newState, contextData) {
    originalChangeState(newState, contextData);
    if (pendingReloadUrl == null || newState !== StateManager.STATES.MENU) return;
    const url = pendingReloadUrl;
    pendingReloadUrl = null;
    if (typeof url === 'string') {
      navigateForUpdate(url);
      return;
    }
    if (!('serviceWorker' in navigator)) {
      location.reload();
      return;
    }
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ action: 'skipWaiting' });
        return;
      }
      location.reload();
    }).catch(() => location.reload());
  };

  async function forceAppUpdate(serverVer) {
    const next = new URL(location.href);
    next.searchParams.set('v', serverVer);
    next.searchParams.set('_', String(Date.now()));
    performOrDeferReload(next.pathname + next.search + next.hash);
  }

  async function pingServiceWorkers() {
    if (!('serviceWorker' in navigator)) return;
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.update().catch(() => {})));
  }

  function setUpdateButtonLabel(btnCheck, label, resetMs) {
    if (!btnCheck) return;
    btnCheck.textContent = label;
    if (resetMs) {
      setTimeout(() => {
        if (btnCheck.textContent === label) btnCheck.textContent = 'NACH UPDATES SUCHEN';
      }, resetMs);
    }
  }

  async function checkServerVersion(isManual = false) {
    if (!window.location.protocol.startsWith('http')) return;
    if (versionCheckInFlight && !isManual) return;
    versionCheckInFlight = true;

    const btnCheck = document.getElementById('btn-check-update');
    const currentVer = (typeof CONSTANTS !== 'undefined' && CONSTANTS.VERSION) ? CONSTANTS.VERSION : '3.33.0';
    const currentVerTag = `v${currentVer}`;

    if (isManual) {
      sessionStorage.removeItem('sj_update_attempts');
      setUpdateButtonLabel(btnCheck, 'PRÜFE UPDATE...');
    }

    try {
      const serverVer = await resolveLatestPublishedVersion();

      if (serverVer && isNewerVersion(serverVer, currentVer)) {
        const attempts = Number(sessionStorage.getItem('sj_update_attempts') || '0');
        if (attempts >= 3) {
          console.warn(`[Update] Version mismatch after ${attempts} reloads: ${serverVer}`);
          if (isManual) setUpdateButtonLabel(btnCheck, `UPDATE v${serverVer} — APP NEU ÖFFNEN`);
          return;
        }
        sessionStorage.setItem('sj_update_attempts', String(attempts + 1));
        console.log(`[Update] Neuer Build verfügbar: ${serverVer} (Lokal: ${currentVer}). Aktualisiere...`);
        setUpdateButtonLabel(btnCheck, `UPDATE GEFUNDEN (v${serverVer})!`);
        await forceAppUpdate(serverVer);
        return;
      }

      sessionStorage.removeItem('sj_update_attempts');
      sessionStorage.removeItem('sj_reload_guard');
      await pingServiceWorkers();

      if (isManual) {
        if (!serverVer) {
          setUpdateButtonLabel(btnCheck, 'UPDATE-PRÜFUNG FEHLGESCHLAGEN', 2800);
        } else {
          setUpdateButtonLabel(btnCheck, `VERSION AKTUELL (${currentVerTag})`, 2500);
        }
      }
    } catch (err) {
      try { await pingServiceWorkers(); } catch (e) {}
      if (isManual) {
        setUpdateButtonLabel(btnCheck, 'UPDATE-PRÜFUNG FEHLGESCHLAGEN', 2800);
      }
    } finally {
      versionCheckInFlight = false;
    }
  }

  // --- SERVICE WORKER REGISTRATION (PWA Caching & Instant Updates) ---
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (window._sjSuppressSwReload) return;
      if (!refreshing) {
        refreshing = true;
        performOrDeferReload();
      }
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none', scope: './' }).then((reg) => {
        const activateWaitingWorker = () => {
          if (isInActiveRun()) {
            pendingReloadUrl = pendingReloadUrl || true;
            return;
          }
          if (reg.waiting) {
            console.log('[PWA] Neuer Build installiert. Aktiviere sofort...');
            reg.waiting.postMessage({ action: 'skipWaiting' });
          }
        };

        // Check for updates on register
        reg.update();
        activateWaitingWorker();

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                activateWaitingWorker();
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

  // --- VIEWPORT STABILIZATION (NO FORCED FULLSCREEN API) ---
  // Mobile app standard: rely on 100lvh CSS viewport locking and standalone PWA display mode.
  // HTML5 Fullscreen API (requestFullscreen) is disabled to prevent intrusive Android Chrome
  // security toasts ("... zum Beenden des Vollbildmodus: von oben ziehen").
  // True fullscreen without banners is achieved when installed as PWA to home screen.
  window.addEventListener('load', applyViewportLock);

  // Synchronize sprite caches with typography readiness
  if (typeof EnergyOrb !== 'undefined' && EnergyOrb.initCache) {
    EnergyOrb.initCache();
  }
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (typeof EnergyOrb !== 'undefined' && EnergyOrb.buildSprites) {
        EnergyOrb.buildSprites(true);
      }
    });
  }

  // Start System
  bindUIButtons();
  engine.state.changeState(StateManager.STATES.MENU);
  engine.start();

})();
