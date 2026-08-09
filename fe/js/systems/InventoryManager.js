import { GameState } from './GameState.js';
import { CLASSES } from '../data/classes.js';
import { syncEquippedWeapon } from './UnitManager.js';

// Decrement equipped weapon durability after combat
export function decrementDurability(unit) {
  const equipped = unit?.inventory?.find(item => item.equipped && item.durability > 0);
  if (equipped) {
    equipped.durability--;
    if (equipped.durability <= 0) {
      equipped.equipped = false;
      // Auto-equip next weapon of same type
      const next = unit.inventory.find(
        item => !item.isConsumable && !item.isStaff && item.durability > 0 && !item.equipped
      );
      if (next) next.equipped = true;
    }
    syncEquippedWeapon(unit);
  }
}

// Use a consumable item
export function useItem(unit, slotIndex) {
  const item = unit.inventory[slotIndex];
  if (!item || !item.isConsumable) return false;

  if (item.effect === 'heal') {
    unit.hp = Math.min(unit.maxHp, unit.hp + item.effectAmount);
  }

  item.durability--;
  if (item.durability <= 0) {
    unit.inventory.splice(slotIndex, 1);
  }
  return true;
}

// Equip a weapon
export function equipWeapon(unit, slotIndex) {
  const item = unit.inventory[slotIndex];
  if (!item || item.isConsumable || item.isStaff) return false;

  // Unequip all others
  unit.inventory.forEach((inv, i) => {
    if (i !== slotIndex) inv.equipped = false;
  });
  item.equipped = true;
  syncEquippedWeapon(unit);
  return true;
}

// Check if a unit can equip a weapon type
export function canUseWeapon(unit, weaponType) {
  const cls = CLASSES[unit.classId];
  if (!cls) return false;
  return cls.usableWeapons.includes(weaponType);
}
