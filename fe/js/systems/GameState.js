import { reactive } from 'vue';

// Single source of truth for the entire game
export const GameState = reactive({
  // Screen
  screen: 'title', // 'title' | 'chapter-intro' | 'game' | 'save-load' | 'gameover'

  // Turn system
  turn: 1,
  phase: 'PLAYER_MOVE', // PLAYER_MOVE | PLAYER_ACTION | ENEMY_PHASE | ALLY_PHASE
  phaseTransition: false,
  waitingForInput: false,

  // Map
  mapId: null,
  mapWidth: 0,
  mapHeight: 0,
  tiles: [],           // 2D array of { terrainId, x, y }

  // Units
  units: {},           // { [unitId]: UnitObject }
  unitOrder: [],       // creation order
  deadUnits: [],       // permadead unit IDs

  // Selection
  selectedUnitId: null,
  moveRange: [],       // [{ x, y }]
  attackRange: [],     // [{ x, y }]
  actionOptions: [],   // ['attack', 'wait', 'items', 'trade']

  // Cursor
  hoveredTile: null,   // { x, y }
  cursorPosition: { x: 0, y: 0 },

  // Animations
  activeAnimations: [], // [{ id, type, text, x, y, faction }]

  // Combat forecast
  combatForecast: null, // { attackerId, defenderId, damage, hit, crit, counterDmg, counterHit }

  // Dialog
  activeDialog: null,   // { title, text, buttons, callback }

  // RNG
  rngSeed: Date.now(),
});
