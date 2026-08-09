import { getWeaponTriangle } from './WeaponTriangle.js';
import { TERRAIN } from '../data/terrain.js';
import { WEAPONS } from '../data/weapons.js';

// Computes predicted combat outcome without executing
export function computeForecast(attacker, defender, tiles) {
  const atkWpn = attacker.equippedWeapon;
  const defWpn = defender.equippedWeapon;

  if (!atkWpn) return null;

  // Get terrain at defender position
  const row = tiles[defender.y];
  const terrainId = row ? row[defender.x] || 'plains' : 'plains';
  const terrain = TERRAIN[terrainId] || TERRAIN['plains'];

  // Weapon triangle
  const triangle = getWeaponTriangle(atkWpn, defWpn);

  // Hit calculation
  const hitRate = atkWpn.hit + attacker.skl * 2 + Math.floor(attacker.lck / 2) + triangle.hitMod;
  const avoid = defender.spd * 2 + defender.lck + terrain.avoidBonus;
  const finalHit = Math.max(0, Math.min(100, hitRate - avoid));

  // Damage calculation
  const atkStat = atkWpn.isMagic ? attacker.mag : attacker.str;
  let damage = atkStat + atkWpn.might + triangle.damageMod;
  if (atkWpn.isMagic) {
    damage -= defender.res;
  } else {
    damage -= defender.def;
  }
  damage = Math.max(0, damage);

  // Effective damage (×3 in FE1 style)
  if (atkWpn.effectiveAgainst && atkWpn.effectiveAgainst.includes(defender.classId)) {
    damage *= 3;
  }

  // Crit
  const critRate = Math.max(0, Math.floor(attacker.skl / 2) + (atkWpn.crit || 0));

  // Counterattack
  let canCounter = false;
  let counterDamage = 0;
  let counterHit = 0;
  if (defWpn && defender.hp > damage) {
    const defRange = defWpn.range;
    const dist = Math.abs(attacker.x - defender.x) + Math.abs(attacker.y - defender.y);
    if (dist >= defRange.min && dist <= defRange.max) {
      canCounter = true;
      const defAtkStat = defWpn.isMagic ? defender.mag : defender.str;
      counterDamage = defAtkStat + defWpn.might + (-triangle.damageMod);
      if (defWpn.isMagic) {
        counterDamage -= attacker.res;
      } else {
        counterDamage -= attacker.def;
      }
      counterDamage = Math.max(0, counterDamage);
      if (defWpn.effectiveAgainst && defWpn.effectiveAgainst.includes(attacker.classId)) {
        counterDamage *= 3;
      }
      const defHit = defWpn.hit + defender.skl * 2 + Math.floor(defender.lck / 2) + (-triangle.hitMod);
      const atkAvoid = attacker.spd * 2 + attacker.lck;
      counterHit = Math.max(0, Math.min(100, defHit - atkAvoid));
    }
  }

  return {
    attackerId: attacker.id,
    defenderId: defender.id,
    damage,
    hit: finalHit,
    crit: critRate,
    canCounter,
    counterDamage,
    counterHit,
  };
}
