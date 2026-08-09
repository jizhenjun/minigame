// Turn/Phase state machine
import { TERRAIN } from '../data/terrain.js';

export const PHASES = {
  PLAYER_MOVE: 'PLAYER_MOVE',
  PLAYER_ACTION: 'PLAYER_ACTION',
  ENEMY_PHASE: 'ENEMY_PHASE',
  ALLY_PHASE: 'ALLY_PHASE',
};

export const TRANSITIONS = {
  [PHASES.PLAYER_MOVE]: [PHASES.PLAYER_ACTION, PHASES.ENEMY_PHASE],
  [PHASES.PLAYER_ACTION]: [PHASES.PLAYER_MOVE],
  [PHASES.ENEMY_PHASE]: [PHASES.ALLY_PHASE, PHASES.PLAYER_MOVE],
  [PHASES.ALLY_PHASE]: [PHASES.PLAYER_MOVE],
};

export class TurnManager {
  constructor(gameState) {
    this.state = gameState;
  }

  canTransition(from, to) {
    return TRANSITIONS[from]?.includes(to);
  }

  // Check if all units of a faction have acted
  allFactionActed(faction) {
    const units = Object.values(this.state.units);
    const factionUnits = units.filter(u => u.alive && u.faction === faction);
    return factionUnits.length > 0 && factionUnits.every(u => u.acted);
  }

  // Advance to the next phase
  advance() {
    const phase = this.state.phase;
    if (phase === PHASES.PLAYER_MOVE || phase === PHASES.PLAYER_ACTION) {
      this.startEnemyPhase();
    } else if (phase === PHASES.ENEMY_PHASE) {
      this.startAllyPhase();
    } else if (phase === PHASES.ALLY_PHASE) {
      this.startPlayerPhase();
    }
  }

  startPlayerPhase() {
    this.state.phase = PHASES.PLAYER_MOVE;
    this.state.phaseTransition = true;
    this.state.isPlayerTurn = true;
    this.state.waitingForInput = false;

    // Reset acted flag for all player units
    const units = this.state.units;
    for (const id of Object.keys(units)) {
      if (units[id].faction === 'player' && units[id].alive) {
        units[id].acted = false;
      }
    }

    // Apply gate/throne HP regen
    this.applyHpRegen(['player', 'ally']);
  }

  startEnemyPhase() {
    this.state.phase = PHASES.ENEMY_PHASE;
    this.state.phaseTransition = true;
    this.state.isPlayerTurn = false;
    this.state.waitingForInput = true;
    this.state.selectedUnitId = null;
    this.state.moveRange = [];
    this.state.attackRange = [];
    this.state.actionOptions = [];

    const units = this.state.units;
    for (const id of Object.keys(units)) {
      if (units[id].faction === 'enemy' && units[id].alive) {
        units[id].acted = false;
      }
    }

    this.applyHpRegen(['enemy']);
  }

  startAllyPhase() {
    this.state.phase = PHASES.ALLY_PHASE;
    this.state.phaseTransition = true;
    this.state.waitingForInput = true;

    const units = this.state.units;
    for (const id of Object.keys(units)) {
      if (units[id].faction === 'ally' && units[id].alive) {
        units[id].acted = false;
      }
    }
  }

  applyHpRegen(factions) {
    const units = this.state.units;
    for (const id of Object.keys(units)) {
      const u = units[id];
      if (!u.alive || !factions.includes(u.faction)) continue;
      const row = this.state.tiles[u.y];
      const terrainId = row ? row[u.x] || 'plains' : 'plains';
      const terrain = TERRAIN[terrainId];
      if (terrain && terrain.hpRegen > 0) {
        u.hp = Math.min(u.maxHp, u.hp + terrain.hpRegen);
      }
    }
  }
}
