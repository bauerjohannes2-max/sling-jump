/**
 * Space Jump - ShopManager
 * Owns the item economy: unlock checks, currency transactions and equipping.
 * The visible hangar lives in the menu carousel (js/main.js) and calls into this class.
 */
class ShopManager {
  constructor(storageService, audioManager, worldManager) {
    this.storage = storageService;
    this.audio = audioManager;
    this.world = worldManager;
  }

  isUnlocked(category, id) {
    const list = this.storage.data[`unlocked${this.capitalize(category)}`];
    return Array.isArray(list) && list.includes(id);
  }

  isEquipped(category, id) {
    return this.storage.data[`selected${this.capitalize(category).slice(0, -1)}`] === id;
  }

  capitalize(str) {
    // ships -> Ships, trails -> Trails, themes -> Themes
    if (str.endsWith('s')) str = str.slice(0, -1);
    return str.charAt(0).toUpperCase() + str.slice(1) + 's';
  }

  getItemDef(category, id) {
    if (category === 'ships') return CONSTANTS.SHIPS.find(s => s.id === id);
    if (category === 'trails') return CONSTANTS.TRAILS.find(t => t.id === id);
    return null;
  }

  buyItem(category, id) {
    const item = this.getItemDef(category, id);
    if (!item) return { success: false, message: 'Item nicht gefunden' };

    if (this.isUnlocked(category, id)) {
      return { success: false, message: 'Bereits freigeschaltet' };
    }

    if (this.storage.data.cores < item.cost) {
      return { success: false, message: 'Nicht genug Coins' };
    }

    // Deduct and unlock
    this.storage.spendCores(item.cost);
    const key = `unlocked${this.capitalize(category)}`;
    this.storage.data[key].push(id);
    this.equipItem(category, id);

    return { success: true, message: `${item.name} freigeschaltet!` };
  }

  equipItem(category, id) {
    const key = `selected${this.capitalize(category).slice(0, -1)}`;
    this.storage.data[key] = id;
    this.storage.save();

    if (category === 'themes' && this.world) {
      this.world.setTheme(id);
    }

    return true;
  }
}
