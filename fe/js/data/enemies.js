// Enemy unit templates
import { CLASSES } from './classes.js';

export const ENEMIES = {
  fighter_bandit: {
    templateId: 'fighter_bandit',
    name: '山贼',
    classId: 'mercenary',  // Use mercenary base, but flavor as bandit
    faction: 'enemy',
    growthRates: { hp: 80, str: 50, skl: 40, spd: 40, lck: 0, def: 30, mag: 0, res: 0 },
  },
  thief_bandit: {
    templateId: 'thief_bandit',
    name: '盗贼',
    classId: 'thief',
    faction: 'enemy',
    growthRates: { hp: 50, str: 30, skl: 30, spd: 60, lck: 0, def: 20, mag: 0, res: 0 },
  },
  mage_enemy: {
    templateId: 'mage_enemy',
    name: '暗法师',
    classId: 'mage',
    faction: 'enemy',
    growthRates: { hp: 40, str: 0, skl: 30, spd: 40, lck: 0, def: 20, mag: 50, res: 30 },
  },
  knight_enemy: {
    templateId: 'knight_enemy',
    name: '重甲兵',
    classId: 'knight',
    faction: 'enemy',
    growthRates: { hp: 80, str: 40, skl: 30, spd: 20, lck: 0, def: 30, mag: 0, res: 0 },
  },
  cavalier_boss: {
    templateId: 'cavalier_boss',
    name: '敌方指挥官',
    classId: 'cavalier',
    faction: 'enemy',
    growthRates: { hp: 90, str: 50, skl: 40, spd: 40, lck: 10, def: 40, mag: 0, res: 10 },
  },
};

// Calculate stats for an enemy template at a given level
export function createEnemyStats(templateId, level) {
  const template = ENEMIES[templateId];
  const cls = CLASSES[template.classId];
  if (!template || !cls) throw new Error('Invalid enemy template: ' + templateId);

  const stats = { ...cls.baseStats, maxHp: cls.baseStats.hp };

  // Apply growth rates per level
  const growths = { ...cls.growthRates, ...template.growthRates };
  const levelsToGrow = level - 1;
  for (let i = 0; i < levelsToGrow; i++) {
    for (const [stat, rate] of Object.entries(growths)) {
      if (stat === 'mov') continue;
      if (Math.random() * 100 < rate) {
        stats[stat]++;
        if (stat === 'hp') stats.maxHp++;
      }
    }
  }

  stats.hp = stats.maxHp;

  // Enemy EXP value: class base EXP + level - 1
  // Base EXP per class (approximate FE1 values)
  const baseExp = {
    lord: 0, cavalier: 30, knight: 32, archer: 28, mage: 32,
    cleric: 30, pegasus_knight: 36, thief: 40, mercenary: 28,
    paladin: 44, general: 50, hero: 46, sniper: 42, bishop: 44, wyvern_knight: 44,
  };
  stats.expValue = (baseExp[template.classId] || 30) + level - 1;

  return stats;
}
