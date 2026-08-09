// Chapter 1: "起点" — First battle
// Legend: P=plains, F=forest, M=mountain, R=road, W=water, A=wall, G=gate, T=throne
export const CHAPTER_1 = {
  id: 'chapter1',
  name: '第一章：起点',
  objective: '击败敌方指挥官',
  width: 24,
  height: 18,

  // Map tile layout
  tiles: [
    // y=0
    ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    // y=1
    ['W','A','A','A','P','P','P','F','F','P','P','P','P','F','F','P','P','P','A','R','T','A','A','W'],
    // y=2
    ['W','A','P','P','P','F','P','P','P','P','P','P','P','P','P','P','P','P','A','R','R','G','A','W'],
    // y=3
    ['W','P','P','F','P','P','P','P','P','P','F','P','P','M','P','P','P','P','P','P','P','P','P','W'],
    // y=4
    ['W','P','P','P','P','F','P','P','P','P','P','P','M','M','P','P','F','P','P','P','P','F','P','W'],
    // y=5
    ['W','P','F','P','P','P','P','P','A','A','A','A','M','M','P','P','P','P','P','F','P','P','P','W'],
    // y=6
    ['W','P','P','P','P','P','F','P','P','P','P','P','P','P','P','P','F','P','P','P','P','P','P','W'],
    // y=7
    ['W','P','F','P','P','P','P','P','F','P','P','F','P','P','P','P','P','P','P','P','F','P','P','W'],
    // y=8
    ['W','P','P','P','P','P','P','P','P','P','P','P','P','P','P','P','P','F','P','P','P','P','F','W'],
    // y=9
    ['W','P','P','P','P','P','F','P','P','P','F','P','P','P','F','P','P','P','P','P','P','P','P','W'],
    // y=10
    ['W','P','F','P','P','P','P','P','P','P','P','P','P','P','P','P','P','P','P','F','P','P','P','W'],
    // y=11
    ['W','P','P','P','P','P','P','A','A','A','A','P','P','P','P','F','P','P','P','P','P','P','P','W'],
    // y=12
    ['W','F','P','P','P','F','P','A','P','P','P','P','F','P','P','P','P','P','F','P','P','F','P','W'],
    // y=13
    ['W','P','P','P','P','P','P','P','P','P','F','P','P','P','F','P','P','P','P','P','P','P','P','W'],
    // y=14
    ['W','P','P','F','P','P','P','F','P','P','P','P','P','P','P','P','P','P','P','F','P','P','P','W'],
    // y=15
    ['W','P','P','P','P','P','P','P','P','F','P','P','P','P','P','F','P','P','P','P','P','F','P','W'],
    // y=16
    ['W','P','P','P','F','P','P','P','P','P','P','P','F','P','P','P','P','P','F','P','P','P','P','W'],
    // y=17
    ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ],

  // Player deploy positions
  playerDeploy: [
    { characterId: 'marth', x: 2, y: 16 },
    { characterId: 'sheeda', x: 3, y: 16 },
    { characterId: 'cain', x: 2, y: 15 },
    { characterId: 'abel', x: 3, y: 15 },
    { characterId: 'jagen', x: 4, y: 16 },
    { characterId: 'gordin', x: 2, y: 14 },
    { characterId: 'draug', x: 4, y: 15 },
  ],

  // Enemy placements
  enemies: [
    { templateId: 'fighter_bandit', x: 10, y: 6, level: 3, inventory: ['iron_axe'] },
    { templateId: 'fighter_bandit', x: 12, y: 7, level: 3, inventory: ['iron_axe'] },
    { templateId: 'fighter_bandit', x: 8, y: 5, level: 3, inventory: ['iron_axe'] },
    { templateId: 'thief_bandit', x: 14, y: 8, level: 2, inventory: ['iron_sword'] },
    { templateId: 'fighter_bandit', x: 6, y: 12, level: 3, inventory: ['steel_axe'] },
    { templateId: 'thief_bandit', x: 16, y: 6, level: 2, inventory: ['iron_sword'] },
    { templateId: 'mage_enemy', x: 9, y: 10, level: 3, inventory: ['fire'] },
    { templateId: 'knight_enemy', x: 20, y: 3, level: 5, inventory: ['iron_lance'] },
    { templateId: 'cavalier_boss', x: 21, y: 2, level: 7, inventory: ['silver_lance'], isBoss: true },
  ],

  winCondition: { type: 'boss_defeat' },
  loseCondition: { type: 'lord_death' },
};
