// Player character definitions
export const CHARACTERS = {
  marth: {
    id: 'marth', name: '马尔斯', classId: 'lord', faction: 'player',
    baseStats: { hp: 18, maxHp: 18, str: 5, mag: 0, skl: 3, spd: 7, lck: 7, def: 7, res: 0, mov: 7 },
    growthRates: { hp: 90, str: 50, skl: 40, spd: 50, lck: 70, def: 20, mag: 0, res: 3 },
    baseLevel: 1,
    inventory: [{ itemId: 'rapier', durability: 40, equipped: true }],
  },
  sheeda: {
    id: 'sheeda', name: '希达', classId: 'pegasus_knight', faction: 'player',
    baseStats: { hp: 16, maxHp: 16, str: 4, mag: 0, skl: 6, spd: 12, lck: 9, def: 6, res: 6, mov: 8 },
    growthRates: { hp: 50, str: 20, skl: 70, spd: 90, lck: 70, def: 20, mag: 0, res: 3 },
    baseLevel: 1,
    inventory: [{ itemId: 'iron_lance', durability: 38, equipped: true }],
  },
  cain: {
    id: 'cain', name: '凯因', classId: 'cavalier', faction: 'player',
    baseStats: { hp: 20, maxHp: 20, str: 7, mag: 0, skl: 5, spd: 6, lck: 4, def: 7, res: 0, mov: 9 },
    growthRates: { hp: 90, str: 50, skl: 50, spd: 50, lck: 40, def: 30, mag: 0, res: 0 },
    baseLevel: 2,
    inventory: [{ itemId: 'iron_sword', durability: 42, equipped: true }],
  },
  abel: {
    id: 'abel', name: '阿贝尔', classId: 'cavalier', faction: 'player',
    baseStats: { hp: 19, maxHp: 19, str: 6, mag: 0, skl: 7, spd: 7, lck: 3, def: 7, res: 0, mov: 9 },
    growthRates: { hp: 70, str: 40, skl: 50, spd: 50, lck: 40, def: 30, mag: 0, res: 0 },
    baseLevel: 2,
    inventory: [{ itemId: 'iron_lance', durability: 38, equipped: true }],
  },
  jagen: {
    id: 'jagen', name: '杰钢', classId: 'paladin', faction: 'player',
    baseStats: { hp: 22, maxHp: 22, str: 8, mag: 0, skl: 10, spd: 8, lck: 1, def: 9, res: 0, mov: 10 },
    growthRates: { hp: 10, str: 5, skl: 10, spd: 5, lck: 5, def: 5, mag: 0, res: 0 },
    baseLevel: 5,
    inventory: [{ itemId: 'silver_lance', durability: 20, equipped: true }],
  },
  gordin: {
    id: 'gordin', name: '哥顿', classId: 'archer', faction: 'player',
    baseStats: { hp: 18, maxHp: 18, str: 5, mag: 0, skl: 3, spd: 4, lck: 4, def: 6, res: 0, mov: 5 },
    growthRates: { hp: 60, str: 40, skl: 50, spd: 40, lck: 40, def: 30, mag: 0, res: 0 },
    baseLevel: 2,
    inventory: [{ itemId: 'iron_bow', durability: 30, equipped: true }],
  },
  draug: {
    id: 'draug', name: '多卡', classId: 'knight', faction: 'player',
    baseStats: { hp: 20, maxHp: 20, str: 7, mag: 0, skl: 3, spd: 3, lck: 1, def: 11, res: 0, mov: 5 },
    growthRates: { hp: 70, str: 40, skl: 40, spd: 10, lck: 20, def: 30, mag: 0, res: 0 },
    baseLevel: 2,
    inventory: [{ itemId: 'iron_lance', durability: 38, equipped: true }],
  },
};
