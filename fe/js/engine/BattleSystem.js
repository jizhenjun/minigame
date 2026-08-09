import { getWeaponTriangle } from './WeaponTriangle.js';
import { TERRAIN } from '../data/terrain.js';
import { getRNG } from '../utils/random.js';

// Core combat resolution. Pure logic — no Vue, no DOM.
export function resolve(attacker, defender, mapState) {
  const result = {
    attackerId: attacker.id,
    defenderId: defender.id,
    // Attacker phase
    hit: 0, hitRoll: 0, isHit: false,
    damage: 0, crit: 0, critRoll: 0, isCrit: false,
    effective: false,
    // Defender phase (counter)
    counterHit: 0, counterRoll: 0, counterIsHit: false,
    counterDamage: 0, counterCrit: 0, counterCritRoll: 0, counterIsCrit: false,
    // Results
    attackerHpAfter: attacker.hp,
    defenderHpAfter: defender.hp,
    expGained: 0,
    isKill: false,
    isCounterKill: false,
  };

  const atkWpn = attacker.equippedWeapon;
  const defWpn = defender.equippedWeapon;

  if (!atkWpn) return result; // Can't attack without weapon

  // Get defender terrain
  const row = mapState.tiles[defender.y];
  const terrainId = row ? row[defender.x] || 'plains' : 'plains';
  const terrain = TERRAIN[terrainId] || TERRAIN['plains'];

  // Weapon triangle
  const triangle = getWeaponTriangle(atkWpn, defWpn);

  // --- ATTACKER'S ATTACK ---
  // Hit calculation
  const hitRate = atkWpn.hit + attacker.skl * 2 + Math.floor(attacker.lck / 2) + triangle.hitMod;
  const avoid = defender.spd * 2 + defender.lck + terrain.avoidBonus;
  result.hit = Math.max(0, Math.min(100, hitRate - avoid));

  // Roll for hit
  const rng = getRNG();
  result.hitRoll = Math.floor(rng.next() * 100);
  result.isHit = result.hitRoll < result.hit;

  if (result.isHit) {
    // Damage
    const atkStat = atkWpn.isMagic ? attacker.mag : attacker.str;
    let damage = atkStat + atkWpn.might + triangle.damageMod;
    if (atkWpn.isMagic) {
      damage -= defender.res;
    } else {
      damage -= defender.def;
    }

    // Effective damage (×3)
    if (atkWpn.effectiveAgainst && atkWpn.effectiveAgainst.includes(defender.classId)) {
      damage = Math.max(1, damage) * 3;
      result.effective = true;
    }

    result.damage = Math.max(0, damage);

    // Crit
    result.crit = Math.max(0, Math.floor(attacker.skl / 2) + (atkWpn.crit || 0));
    result.critRoll = Math.floor(rng.next() * 100);
    result.isCrit = result.critRoll < result.crit;

    if (result.isCrit && result.damage > 0) {
      result.damage *= 3;
    }

    // Apply damage
    result.defenderHpAfter = Math.max(0, defender.hp - result.damage);
    result.isKill = result.defenderHpAfter <= 0;

    // EXP: 1 per damage dealt (cap 20), plus kill bonus
    result.expGained = Math.min(result.damage, 20);
    if (result.isKill) {
      result.expGained += (defender.expValue || 30);
    }
  }

  // --- COUNTERATTACK ---
  if (defWpn && result.defenderHpAfter > 0) {
    const dist = Math.abs(attacker.x - defender.x) + Math.abs(attacker.y - defender.y);
    const defRange = defWpn.range;

    if (dist >= defRange.min && dist <= defRange.max) {
      // Get attacker's terrain for counter
      const atkRow = mapState.tiles[attacker.y];
      const atkTerrainId = atkRow ? atkRow[attacker.x] || 'plains' : 'plains';
      const atkTerrain = TERRAIN[atkTerrainId] || TERRAIN['plains'];

      const defHitRate = defWpn.hit + defender.skl * 2 + Math.floor(defender.lck / 2) - triangle.hitMod;
      const atkAvoid = attacker.spd * 2 + attacker.lck + atkTerrain.avoidBonus;
      result.counterHit = Math.max(0, Math.min(100, defHitRate - atkAvoid));
      result.counterRoll = Math.floor(rng.next() * 100);
      result.counterIsHit = result.counterRoll < result.counterHit;

      if (result.counterIsHit) {
        const defAtkStat = defWpn.isMagic ? defender.mag : defender.str;
        let cDmg = defAtkStat + defWpn.might - triangle.damageMod;
        if (defWpn.isMagic) {
          cDmg -= attacker.res;
        } else {
          cDmg -= attacker.def;
        }

        if (defWpn.effectiveAgainst && defWpn.effectiveAgainst.includes(attacker.classId)) {
          cDmg = Math.max(1, cDmg) * 3;
        }

        result.counterDamage = Math.max(0, cDmg);

        result.counterCrit = Math.max(0, Math.floor(defender.skl / 2) + (defWpn.crit || 0));
        result.counterCritRoll = Math.floor(rng.next() * 100);
        result.counterIsCrit = result.counterCritRoll < result.counterCrit;

        if (result.counterIsCrit && result.counterDamage > 0) {
          result.counterDamage *= 3;
        }

        result.attackerHpAfter = Math.max(0, attacker.hp - result.counterDamage);
        result.isCounterKill = result.attackerHpAfter <= 0;
      }
    }
  }

  return result;
}
