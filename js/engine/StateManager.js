/**
 * Sling Jump - StateManager
 * Finite State Machine managing 6 core states with smooth transitions:
 * STATE_MENU, STATE_PLAYING, STATE_PAUSED, STATE_GAME_OVER, STATE_SHOP, STATE_STATS.
 */
class StateManager {
  static STATES = {
    MENU: 'STATE_MENU',
    PLAYING: 'STATE_PLAYING',
    PAUSED: 'STATE_PAUSED',
    GAME_OVER: 'STATE_GAME_OVER',
    SHOP: 'STATE_SHOP',
    STATS: 'STATE_STATS',
    SETTINGS: 'STATE_SETTINGS',
    QUESTS: 'STATE_QUESTS',
    LEADERBOARD: 'STATE_LEADERBOARD',
    TUTORIAL: 'STATE_TUTORIAL'
  };

  constructor(onStateChangeCallback) {
    this.currentState = null;
    this.previousState = null;
    this.onStateChange = onStateChangeCallback;
  }

  getState() {
    return this.currentState;
  }

  is(state) {
    return this.currentState === state;
  }

  changeState(newState, contextData = {}) {
    if (this.currentState === newState) return;

    this.previousState = this.currentState;
    this.currentState = newState;

    if (this.onStateChange) {
      this.onStateChange(this.currentState, this.previousState, contextData);
    }
  }

  returnToPrevious() {
    if (this.previousState) {
      this.changeState(this.previousState);
    } else {
      this.changeState(StateManager.STATES.MENU);
    }
  }
}
