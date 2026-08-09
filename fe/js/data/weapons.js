// Weapon and item definitions
export const WEAPONS = {
  // === Swords ===
  iron_sword: {
    id: 'iron_sword', name: '铁剑', type: 'sword',
    might: 5, hit: 100, weight: 2,
    uses: 42, range: { min: 1, max: 1 }, crit: 0,
  },
  steel_sword: {
    id: 'steel_sword', name: '钢剑', type: 'sword',
    might: 8, hit: 80, weight: 4,
    uses: 38, range: { min: 1, max: 1 }, crit: 0,
  },
  silver_sword: {
    id: 'silver_sword', name: '银剑', type: 'sword',
    might: 12, hit: 100, weight: 3,
    uses: 17, range: { min: 1, max: 1 }, crit: 0,
  },
  rapier: {
    id: 'rapier', name: '西洋剑', type: 'sword',
    might: 8, hit: 90, weight: 1,
    uses: 40, range: { min: 1, max: 1 }, crit: 10,
    effectiveAgainst: ['knight', 'general', 'cavalier', 'paladin'],
  },

  // === Lances ===
  iron_lance: {
    id: 'iron_lance', name: '铁枪', type: 'lance',
    might: 8, hit: 80, weight: 6,
    uses: 38, range: { min: 1, max: 1 }, crit: 0,
  },
  steel_lance: {
    id: 'steel_lance', name: '钢枪', type: 'lance',
    might: 11, hit: 70, weight: 8,
    uses: 31, range: { min: 1, max: 1 }, crit: 0,
  },
  silver_lance: {
    id: 'silver_lance', name: '银枪', type: 'lance',
    might: 14, hit: 80, weight: 7,
    uses: 20, range: { min: 1, max: 1 }, crit: 0,
  },

  // === Axes ===
  iron_axe: {
    id: 'iron_axe', name: '铁斧', type: 'axe',
    might: 7, hit: 80, weight: 7,
    uses: 43, range: { min: 1, max: 1 }, crit: 0,
  },
  steel_axe: {
    id: 'steel_axe', name: '钢斧', type: 'axe',
    might: 10, hit: 65, weight: 10,
    uses: 31, range: { min: 1, max: 1 }, crit: 0,
  },
  hand_axe: {
    id: 'hand_axe', name: '手斧', type: 'axe',
    might: 7, hit: 60, weight: 8,
    uses: 22, range: { min: 1, max: 2 }, crit: 0,
  },

  // === Bows ===
  iron_bow: {
    id: 'iron_bow', name: '铁弓', type: 'bow',
    might: 6, hit: 85, weight: 5,
    uses: 30, range: { min: 2, max: 2 }, crit: 0,
  },
  steel_bow: {
    id: 'steel_bow', name: '钢弓', type: 'bow',
    might: 9, hit: 75, weight: 7,
    uses: 24, range: { min: 2, max: 2 }, crit: 0,
  },

  // === Tomes (Magic) ===
  fire: {
    id: 'fire', name: '火焰', type: 'tome',
    might: 5, hit: 100, weight: 0,
    uses: 25, range: { min: 1, max: 2 }, crit: 0,
    isMagic: true,
  },
  thunder: {
    id: 'thunder', name: '雷电', type: 'tome',
    might: 6, hit: 85, weight: 2,
    uses: 21, range: { min: 1, max: 2 }, crit: 5,
    isMagic: true,
  },
  blizzard: {
    id: 'blizzard', name: '暴雪', type: 'tome',
    might: 7, hit: 75, weight: 4,
    uses: 15, range: { min: 1, max: 2 }, crit: 0,
    isMagic: true,
    effectiveAgainst: ['pegasus_knight', 'wyvern_knight'],
  },

  // === Staves ===
  heal: {
    id: 'heal', name: '治疗杖', type: 'staff',
    might: 0, hit: 100, weight: 0,
    uses: 22, range: { min: 1, max: 1 }, crit: 0,
    isStaff: true, healAmount: 10,
  },
  mend: {
    id: 'mend', name: '痊愈杖', type: 'staff',
    might: 0, hit: 100, weight: 0,
    uses: 12, range: { min: 1, max: 1 }, crit: 0,
    isStaff: true, healAmount: 20,
  },

  // === Items ===
  vulnerary: {
    id: 'vulnerary', name: '伤药', type: 'item',
    might: 0, hit: 0, weight: 0,
    uses: 3, range: { min: 0, max: 0 }, crit: 0,
    isConsumable: true, effect: 'heal', effectAmount: 20,
  },
};
