/**
 * Sling Jump - InputManager
 * Unified Input Controller supporting Keyboard, Mouse, Touch and Gamepad API
 * Automatically emits clean action events and detects controller prompts.
 */
class InputManager {
  constructor() {
    this.actionHeld = false;
    this.gamepadConnected = false;
    this.lastGamepadButtonState = false;
    this.lastGamepadPauseState = false;
    this.lastGamepadRestartState = false;

    // Callbacks
    this.onActionDown = null;
    this.onActionUp = null;
    this.onPauseToggle = null;
    this.onRestartTrigger = null;

    this.initListeners();
  }

  initListeners() {
    // Keyboard Listeners
    window.addEventListener('keydown', (e) => this.handleKeyDown(e), { capture: true });
    document.addEventListener('keydown', (e) => this.handleKeyDown(e), { capture: true });

    window.addEventListener('keyup', (e) => this.handleKeyUp(e), { capture: true });
    document.addEventListener('keyup', (e) => this.handleKeyUp(e), { capture: true });

    // Mouse Listeners
    window.addEventListener('mousedown', (e) => {
      if (this.isInteractiveUIElement(e.target)) return;
      if (e.button === 0) this.triggerActionDown();
    });

    window.addEventListener('mouseup', (e) => {
      if (this.isInteractiveUIElement(e.target)) return;
      if (e.button === 0) this.triggerActionUp();
    });

    // Touch Listeners (Passive false to prevent mobile scrolling)
    window.addEventListener('touchstart', (e) => {
      if (this.isInteractiveUIElement(e.target)) return;
      e.preventDefault();
      this.triggerActionDown();
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      if (this.isInteractiveUIElement(e.target)) return;
      e.preventDefault();
      this.triggerActionUp();
    }, { passive: false });

    // Window Blur
    window.addEventListener('blur', () => {
      this.actionHeld = false;
      if (this.onActionUp) this.onActionUp();
    });

    // Gamepad Connection Events
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadConnected = true;
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      this.gamepadConnected = false;
    });
  }

  isInteractiveUIElement(target) {
    if (!target) return false;
    // If any modal overlay is active/visible, treat all touches/clicks as UI
    if (document.querySelector('.modal-overlay.visible')) return true;
    return !!(
      target.closest('button') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('.modal-card') ||
      target.closest('.modal-overlay') ||
      target.closest('.quests-scroll-area') ||
      target.closest('.hub-card') ||
      target.closest('.hub-tab-panel') ||
      target.closest('.leaderboard-list') ||
      target.closest('.interactive-ui') ||
      target.closest('.state-overlay') ||
      target.closest('.menu-top-bar') ||
      target.closest('.top-header')
    );
  }

  handleKeyDown(e) {
    const code = e.code || '';
    const key = e.key || '';

    // Pause Toggle (Escape, KeyP)
    if (code === 'Escape' || code === 'KeyP' || key === 'Escape' || key === 'p' || key === 'P') {
      e.preventDefault();
      e.stopPropagation();
      if (this.onPauseToggle) this.onPauseToggle();
      return;
    }

    // Restart Trigger (Enter, KeyR)
    if (code === 'Enter' || code === 'KeyR' || key === 'Enter' || key === 'r' || key === 'R') {
      e.preventDefault();
      e.stopPropagation();
      if (this.onRestartTrigger) this.onRestartTrigger();
      return;
    }

    // Gameplay Action (Space, ArrowUp, KeyW)
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW' || key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W') {
      e.preventDefault();
      e.stopPropagation();
      if (!this.actionHeld) {
        this.triggerActionDown();
      }
    }
  }

  handleKeyUp(e) {
    const code = e.code || '';
    const key = e.key || '';

    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW' || key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W') {
      e.preventDefault();
      e.stopPropagation();
      this.triggerActionUp();
    }
  }

  triggerActionDown() {
    this.actionHeld = true;
    if (this.onActionDown) this.onActionDown();
  }

  triggerActionUp() {
    if (this.actionHeld) {
      this.actionHeld = false;
      if (this.onActionUp) this.onActionUp();
    }
  }

  // Poll Gamepad on each frame
  update() {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp || !gp.connected) continue;

      this.gamepadConnected = true;

      // Primary Action: A (button 0) or Right Trigger (button 7)
      const actionPressed = (gp.buttons[0] && gp.buttons[0].pressed) || (gp.buttons[7] && gp.buttons[7].pressed);
      if (actionPressed && !this.lastGamepadButtonState) {
        this.triggerActionDown();
      } else if (!actionPressed && this.lastGamepadButtonState) {
        this.triggerActionUp();
      }
      this.lastGamepadButtonState = actionPressed;

      // Pause Action: Start (button 9) or B (button 1)
      const pausePressed = (gp.buttons[9] && gp.buttons[9].pressed);
      if (pausePressed && !this.lastGamepadPauseState) {
        if (this.onPauseToggle) this.onPauseToggle();
      }
      this.lastGamepadPauseState = pausePressed;

      // Restart Action: X (button 2) or Y (button 3) in Game Over
      const restartPressed = (gp.buttons[2] && gp.buttons[2].pressed) || (gp.buttons[3] && gp.buttons[3].pressed);
      if (restartPressed && !this.lastGamepadRestartState) {
        if (this.onRestartTrigger) this.onRestartTrigger();
      }
      this.lastGamepadRestartState = restartPressed;

      break; // Process primary controller
    }
  }
}
