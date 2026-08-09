import { GameState } from './GameState.js';
import { syncEquippedWeapon } from './UnitManager.js';

const SAVE_PREFIX = 'fe_save_slot_';

// Serialize game state to JSON-safe object (strip Vue reactivity)
function serialize() {
  return {
    version: 1,
    timestamp: new Date().toISOString(),
    chapter: 1,
    turn: GameState.turn,
    phase: GameState.phase,
    rngSeed: GameState.rngSeed,
    mapId: GameState.mapId,
    mapWidth: GameState.mapWidth,
    mapHeight: GameState.mapHeight,
    tiles: GameState.tiles,
    units: JSON.parse(JSON.stringify(GameState.units)),
    unitOrder: [...GameState.unitOrder],
    deadUnits: [...GameState.deadUnits],
    selectedUnitId: null,
    moveRange: [],
    attackRange: [],
    actionOptions: [],
  };
}

// Deserialize and restore game state
function deserialize(data) {
  if (data.version !== 1) throw new Error('存档版本不兼容');

  GameState.turn = data.turn;
  GameState.phase = data.phase;
  GameState.rngSeed = data.rngSeed;
  GameState.mapId = data.mapId;
  GameState.mapWidth = data.mapWidth;
  GameState.mapHeight = data.mapHeight;
  GameState.tiles = data.tiles;
  GameState.units = data.units;
  GameState.unitOrder = data.unitOrder;
  GameState.deadUnits = data.deadUnits || [];
  GameState.selectedUnitId = null;
  GameState.moveRange = [];
  GameState.attackRange = [];
  GameState.actionOptions = [];
  GameState.activeAnimations = [];
  GameState.combatForecast = null;
  GameState.phaseTransition = false;
  GameState.waitingForInput = false;
  GameState.screen = 'game';

  // Rebuild equipped weapon references (ensure they have all fields)
  for (const id of Object.keys(GameState.units)) {
    const u = GameState.units[id];
    if (u.inventory) {
      for (const item of u.inventory) {
        if (!item.range) item.range = { min: 1, max: 1 };
        if (!item.crit) item.crit = 0;
        if (!item.isMagic) item.isMagic = false;
        if (!item.isStaff) item.isStaff = false;
        if (!item.isConsumable) item.isConsumable = false;
        if (!item.effectiveAgainst) item.effectiveAgainst = null;
        if (!item.healAmount) item.healAmount = 0;
      }
    }
    // Ensure equipped weapon property is correct
    syncEquippedWeapon(u);
  }
}

// Save to a slot
export function save(slot) {
  try {
    const data = serialize();
    localStorage.setItem(SAVE_PREFIX + slot, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    return false;
  }
}

// Load from a slot
export function load(slot) {
  try {
    const raw = localStorage.getItem(SAVE_PREFIX + slot);
    if (!raw) return false;
    const data = JSON.parse(raw);
    deserialize(data);
    return true;
  } catch (e) {
    console.error('Load failed:', e);
    return false;
  }
}

// Delete a save slot
export function deleteSlot(slot) {
  localStorage.removeItem(SAVE_PREFIX + slot);
}

// Get slot info for display
export function getSlotInfo(slot) {
  try {
    const raw = localStorage.getItem(SAVE_PREFIX + slot);
    if (!raw) return { exists: false };
    const data = JSON.parse(raw);
    return {
      exists: true,
      chapter: data.chapter || 1,
      turn: data.turn || 1,
      timestamp: data.timestamp || '',
    };
  } catch {
    return { exists: false };
  }
}

// Check if any save exists (for Continue button)
export function hasAnySave() {
  return !!localStorage.getItem(SAVE_PREFIX + '0');
}
