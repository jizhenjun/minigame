import { GameState } from './GameState.js';
import { CLASSES } from '../data/classes.js';
import { WEAPONS } from '../data/weapons.js';
import { CHARACTERS } from '../data/characters.js';
import { createEnemyStats, ENEMIES } from '../data/enemies.js';

let nextUnitId = 0;

// Create a player unit from character definition
export function createPlayerUnit(characterId, x, y) {
  const char = CHARACTERS[characterId];
  if (!char) throw new Error('Unknown character: ' + characterId);

  const cls = CLASSES[char.classId];
  const unitId = 'unit_' + (nextUnitId++);

  const stats = { ...char.baseStats };
  const unit = {
    id: unitId,
    name: char.name,
    classId: char.classId,
    faction: char.faction,
    x, y,
    level: char.baseLevel || 1,
    exp: 0,
    hp: stats.hp,
    maxHp: stats.maxHp || stats.hp,
    str: stats.str, mag: stats.mag || 0,
    skl: stats.skl, spd: stats.spd,
    lck: stats.lck, def: stats.def,
    res: stats.res || 0, mov: stats.mov,
    growthRates: { ...cls.growthRates, ...char.growthRates },
    acted: false,
    alive: true,
    inventory: [],
  };

  // Add starting inventory
  for (const inv of (char.inventory || [])) {
    const wpnData = WEAPONS[inv.itemId];
    if (wpnData) {
      unit.inventory.push({
        itemId: inv.itemId,
        name: wpnData.name,
        type: wpnData.type,
        might: wpnData.might,
        hit: wpnData.hit,
        weight: wpnData.weight,
        range: wpnData.range,
        crit: wpnData.crit || 0,
        isMagic: wpnData.isMagic || false,
        isStaff: wpnData.isStaff || false,
        isConsumable: wpnData.isConsumable || false,
        effectiveAgainst: wpnData.effectiveAgainst || null,
        healAmount: wpnData.healAmount || 0,
        effect: wpnData.effect || null,
        effectAmount: wpnData.effectAmount || 0,
        durability: inv.durability,
        maxDurability: wpnData.uses,
        equipped: inv.equipped || false,
      });
    }
  }

  GameState.units[unitId] = unit;
  GameState.unitOrder.push(unitId);
  syncEquippedWeapon(unit);
  return unit;
}

// Create an enemy unit from template
export function createEnemyUnit(templateId, x, y, level, inventoryIds) {
  const stats = createEnemyStats(templateId, level);
  const template = ENEMIES[templateId];

  const unitId = 'unit_' + (nextUnitId++);
  const unit = {
    id: unitId,
    name: template?.name || templateId,
    classId: template?.classId || 'mercenary',
    faction: 'enemy',
    x, y,
    level,
    exp: 0,
    hp: stats.hp,
    maxHp: stats.maxHp || stats.hp,
    str: stats.str, mag: stats.mag || 0,
    skl: stats.skl, spd: stats.spd,
    lck: stats.lck, def: stats.def,
    res: stats.res || 0, mov: stats.mov,
    expValue: stats.expValue || 30,
    growthRates: {},
    acted: false,
    alive: true,
    inventory: [],
    isBoss: false,
  };

  for (const itemId of (inventoryIds || [])) {
    const wpnData = WEAPONS[itemId];
    if (wpnData) {
      unit.inventory.push({
        itemId,
        name: wpnData.name,
        type: wpnData.type,
        might: wpnData.might,
        hit: wpnData.hit,
        weight: wpnData.weight,
        range: wpnData.range,
        crit: wpnData.crit || 0,
        isMagic: wpnData.isMagic || false,
        isStaff: wpnData.isStaff || false,
        isConsumable: wpnData.isConsumable || false,
        effectiveAgainst: wpnData.effectiveAgainst || null,
        healAmount: wpnData.healAmount || 0,
        durability: wpnData.uses,
        maxDurability: wpnData.uses,
        equipped: true,
      });
    }
  }

  GameState.units[unitId] = unit;
  GameState.unitOrder.push(unitId);
  syncEquippedWeapon(unit);
  return unit;
}

// Kill a unit (permadeath)
export function killUnit(unitId) {
  const unit = GameState.units[unitId];
  if (!unit) return;
  unit.alive = false;
  unit.hp = 0;
  GameState.deadUnits.push(unitId);
}

// Get equipped weapon for a unit
export function getEquippedWeapon(unit) {
  if (!unit || !unit.inventory) return null;
  return unit.inventory.find(item => item.equipped && item.durability > 0) || null;
}

// Sync the equippedWeapon property on a unit
export function syncEquippedWeapon(unit) {
  if (!unit) return;
  unit.equippedWeapon = getEquippedWeapon(unit);
}

// Helper: find unit at position
export function getUnitAt(x, y) {
  const units = GameState.units;
  for (const id of Object.keys(units)) {
    const u = units[id];
    if (u.alive && u.x === x && u.y === y) return u;
  }
  return null;
}

// Get alive units by faction
export function getAliveByFaction(faction) {
  const result = [];
  const units = GameState.units;
  for (const id of Object.keys(units)) {
    if (units[id].alive && units[id].faction === faction) result.push(units[id]);
  }
  return result;
}
