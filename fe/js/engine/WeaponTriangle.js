// Weapon Triangle: Sword > Axe > Lance > Sword
// In FE1: ±1 damage, ±15% hit
const ADVANTAGE_MAP = {
  sword: { beats: 'axe', losesTo: 'lance' },
  lance: { beats: 'sword', losesTo: 'axe' },
  axe:   { beats: 'lance', losesTo: 'sword' },
};

const BONUS_DAMAGE = 1;
const BONUS_HIT = 15;

export function getWeaponTriangle(attackerWeapon, defenderWeapon) {
  const atkType = attackerWeapon?.type;
  const defType = defenderWeapon?.type;

  // Non-weapon-triangle types (bow, tome, staff, item) get no modifiers
  if (!ADVANTAGE_MAP[atkType] || !ADVANTAGE_MAP[defType]) {
    return { advantage: 0, damageMod: 0, hitMod: 0 };
  }

  if (ADVANTAGE_MAP[atkType].beats === defType) {
    return { advantage: 1, damageMod: BONUS_DAMAGE, hitMod: BONUS_HIT };
  }
  if (ADVANTAGE_MAP[atkType].losesTo === defType) {
    return { advantage: -1, damageMod: -BONUS_DAMAGE, hitMod: -BONUS_HIT };
  }
  return { advantage: 0, damageMod: 0, hitMod: 0 };
}
