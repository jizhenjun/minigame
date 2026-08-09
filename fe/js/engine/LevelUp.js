import { getRNG } from '../utils/random.js';
import { CLASSES } from '../data/classes.js';

// Award EXP to a unit. Returns level-up result if level occurred.
export function awardExp(unit, amount) {
  if (!unit.alive) return null;
  unit.exp += amount;
  if (unit.exp >= 100) {
    unit.exp -= 100;
    return levelUp(unit);
  }
  return null;
}

// Perform a level up. Returns gains object.
export function levelUp(unit) {
  const rng = getRNG();
  const gains = { level: 1 };

  // Stats that can increase
  const statKeys = ['hp', 'str', 'mag', 'skl', 'spd', 'lck', 'def', 'res'];

  // Get growth rates: personal + class
  const cls = CLASSES[unit.classId];
  if (!cls) return gains;

  for (const stat of statKeys) {
    const personalGrowth = unit.growthRates?.[stat] || 0;
    const classGrowth = cls.growthRates?.[stat] || 0;
    const totalGrowth = personalGrowth + classGrowth;

    if (totalGrowth > 0 && rng.next() * 100 < totalGrowth) {
      unit[stat]++;
      if (stat === 'hp') unit.maxHp++;
      gains[stat] = 1;
    }
  }

  unit.level++;
  return gains;
}
