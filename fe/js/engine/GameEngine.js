import { GameState } from '../systems/GameState.js';
import { EventBus } from '../eventBus.js';
import { createPlayerUnit, createEnemyUnit, killUnit, getUnitAt, getAliveByFaction, getEquippedWeapon } from '../systems/UnitManager.js';
import { decrementDurability } from '../systems/InventoryManager.js';
import { getMoveRange, getAttackRange } from './Pathfinder.js';
import { resolve } from './BattleSystem.js';
import { decideAction } from './AI.js';
import { TurnManager } from './TurnManager.js';
import { awardExp } from './LevelUp.js';
import { computeForecast } from './CombatForecast.js';
import { save, load, deleteSlot } from '../systems/SaveManager.js';
import { CHAPTER_1 } from '../data/chapter1.js';
import { reseedRNG } from '../utils/random.js';

const turnManager = new TurnManager(GameState);
let animIdCounter = 0;

export const GameEngine = {
  // ========== Game Initialization ==========

  startNewGame() {
    reseedRNG(Date.now());
    GameState._chapterData = CHAPTER_1;
    GameState._chapterName = CHAPTER_1.name;
    GameState._chapterObjective = CHAPTER_1.objective;
    GameState._saveMode = 'save';
    GameState.screen = 'chapter-intro';
    // Chapter is loaded when user clicks "开始战斗"
  },

  beginChapter() {
    if (GameState._chapterData) {
      this.loadChapter(GameState._chapterData);
    } else {
      this.loadChapter(CHAPTER_1);
    }
  },

  loadChapter(chapterData) {
    // Clear previous state
    GameState.units = {};
    GameState.unitOrder = [];
    GameState.deadUnits = [];
    GameState.turn = 1;
    GameState.selectedUnitId = null;
    GameState.moveRange = [];
    GameState.attackRange = [];
    GameState.actionOptions = [];
    GameState.activeAnimations = [];
    GameState.combatForecast = null;

    // Set map
    GameState.mapId = chapterData.id;
    GameState.mapWidth = chapterData.width;
    GameState.mapHeight = chapterData.height;
    GameState.tiles = chapterData.tiles;

    // Deploy player units
    for (const dp of (chapterData.playerDeploy || [])) {
      createPlayerUnit(dp.characterId, dp.x, dp.y);
    }

    // Deploy enemies
    for (const ep of (chapterData.enemies || [])) {
      const unit = createEnemyUnit(ep.templateId, ep.x, ep.y, ep.level, ep.inventory);
      if (ep.isBoss) unit.isBoss = true;
    }

    // Store chapter reference
    GameState._chapterData = chapterData;

    // Start player phase
    turnManager.startPlayerPhase();
    GameState.phaseTransition = false;
    GameState.screen = 'game';
  },

  continueGame() {
    const loaded = load(0);
    if (!loaded) {
      this.startNewGame();
    }
  },

  restartChapter() {
    if (GameState._chapterData) {
      this.loadChapter(GameState._chapterData);
    } else {
      this.loadChapter(CHAPTER_1);
    }
  },

  quitToTitle() {
    GameState.screen = 'title';
    GameState.units = {};
    GameState.unitOrder = [];
    GameState.deadUnits = [];
  },

  // ========== Unit Selection ==========

  onUnitClicked(unitId) {
    if (GameState.waitingForInput) return;
    if (GameState.phase !== 'PLAYER_MOVE') return;

    const unit = GameState.units[unitId];
    if (!unit || !unit.alive) return;
    if (unit.faction !== 'player') return;
    if (unit.acted) return; // Already acted this turn

    // Deselect if same unit
    if (GameState.selectedUnitId === unitId) {
      this.clearSelection();
      return;
    }

    // Select new unit
    GameState.selectedUnitId = unitId;
    GameState.moveRange = getMoveRange(unit, GameState);
    GameState.attackRange = [];
    GameState.actionOptions = [];
    GameState.combatForecast = null;
  },

  // ========== Tile Click ==========

  onTileClicked(x, y) {
    if (GameState.waitingForInput) return;
    if (GameState.phase !== 'PLAYER_MOVE' && GameState.phase !== 'PLAYER_ACTION') return;

    const selected = GameState.units[GameState.selectedUnitId];
    if (!selected) return;

    // If in PLAYER_ACTION, check for attack target
    if (GameState.phase === 'PLAYER_ACTION') {
      const target = getUnitAt(x, y);
      if (target && target.faction === 'enemy' && this.isInRange(target, GameState.attackRange)) {
        this.executeCombat(selected, target);
        return;
      }
      // Clicking elsewhere cancels action
      GameState.phase = 'PLAYER_MOVE';
      GameState.attackRange = [];
      GameState.actionOptions = [];
      GameState.combatForecast = null;
      return;
    }

    // In PLAYER_MOVE: check if tile is in move range
    if (this.isInRange({ x, y }, GameState.moveRange)) {
      // Check if tile has enemy unit
      const enemy = getUnitAt(x, y);
      if (enemy && enemy.faction === 'enemy') {
        // Moving to attack — need to check if we can attack from this tile's adjacency
        // For simplicity, if enemy is at move target, find adjacent tile
        const adjacent = this.findAdjacentEmptyTile(enemy, selected, GameState);
        if (adjacent) {
          this.moveUnitTo(selected, adjacent.x, adjacent.y);
          this.showActions(selected);
        } else {
          // No adjacent tile — just move as close as possible
          this.moveUnitTo(selected, x, y);
          selected.acted = true;
          this.clearSelection();
        }
        return;
      }

      // Move to empty tile
      this.moveUnitTo(selected, x, y);
      this.showActions(selected);
    }
  },

  findAdjacentEmptyTile(enemy, unit, mapState) {
    const dirs = [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];
    const moveKeys = new Set(GameState.moveRange.map(p => `${p.x},${p.y}`));
    let best = null;
    let bestDist = Infinity;
    for (const d of dirs) {
      const x = enemy.x + d.x;
      const y = enemy.y + d.y;
      if (x >= 0 && x < mapState.mapWidth && y >= 0 && y < mapState.mapHeight) {
        if (!getUnitAt(x, y) || (x === unit.x && y === unit.y)) {
          if (moveKeys.has(`${x},${y}`)) {
            const dist = Math.abs(unit.x - x) + Math.abs(unit.y - y);
            if (dist < bestDist) {
              bestDist = dist;
              best = { x, y };
            }
          }
        }
      }
    }
    return best;
  },

  moveUnitTo(unit, x, y) {
    unit.x = x;
    unit.y = y;
    unit.acted = false; // Can still act after moving
  },

  showActions(unit) {
    const actions = ['attack'];
    // Check if can attack
    const weapon = getEquippedWeapon(unit);
    if (!weapon || weapon.isStaff) {
      actions.shift(); // No attack for staff users
    }
    // Check for usable items
    const hasItems = unit.inventory.some(item => item.isConsumable && item.durability > 0);
    if (hasItems) actions.push('items');
    actions.push('wait');
    GameState.actionOptions = actions;
    GameState.phase = 'PLAYER_ACTION';
  },

  // ========== Action Handling ==========

  onActionSelected(action) {
    const unit = GameState.units[GameState.selectedUnitId];
    if (!unit) return;

    if (action === 'attack') {
      const weapon = getEquippedWeapon(unit);
      if (!weapon) return;
      GameState.attackRange = getAttackRange(unit, unit.x, unit.y, GameState);
      GameState.combatForecast = null;
      // Keep action menu open; player clicks enemy to attack
    } else if (action === 'items') {
      // Use first consumable item
      const itemIdx = unit.inventory.findIndex(item => item.isConsumable && item.durability > 0);
      if (itemIdx >= 0) {
        const item = unit.inventory[itemIdx];
        if (item.effect === 'heal') {
          const healed = Math.min(unit.maxHp - unit.hp, item.effectAmount);
          unit.hp = Math.min(unit.maxHp, unit.hp + item.effectAmount);
          item.durability--;
          if (item.durability <= 0) unit.inventory.splice(itemIdx, 1);
          this.addAnimation(unit.x, unit.y, '+' + healed, 'heal');
          this.finishAction(unit);
        }
      }
    } else if (action === 'wait') {
      this.finishAction(unit);
    }
  },

  finishAction(unit) {
    unit.acted = true;
    GameState.actionOptions = [];
    GameState.attackRange = [];
    GameState.combatForecast = null;
    GameState.phase = 'PLAYER_MOVE';
    this.clearSelection();

    // Check if all player units have acted
    if (turnManager.allFactionActed('player')) {
      this.endPlayerTurn();
    }
  },

  clearSelection() {
    GameState.selectedUnitId = null;
    GameState.moveRange = [];
    GameState.attackRange = [];
    GameState.actionOptions = [];
  },

  // ========== Combat ==========

  executeCombat(attacker, defender) {
    if (GameState.waitingForInput) return;

    // Compute forecast first for display
    const forecast = computeForecast(attacker, defender, GameState.tiles);
    if (forecast) {
      GameState.combatForecast = forecast;
    }

    // Resolve combat
    const result = resolve(attacker, defender, GameState);

    // Show hit/miss/damage popup
    if (result.isHit) {
      const critText = result.isCrit ? 'CRIT!' : '';
      this.addAnimation(defender.x, defender.y, critText + result.damage.toString(), result.isCrit ? 'crit' : 'damage');
    } else {
      this.addAnimation(defender.x, defender.y, 'MISS', 'miss');
    }

    // Apply damage
    attacker.hp = result.attackerHpAfter;
    defender.hp = result.defenderHpAfter;

    // Decrement durability
    decrementDurability(attacker);

    // EXP
    if (result.expGained > 0 && attacker.faction === 'player') {
      const levelResult = awardExp(attacker, result.expGained);
      this.addAnimation(attacker.x, attacker.y, '+' + result.expGained + ' EXP', 'exp');
      if (levelResult) {
        this.addAnimation(attacker.x, attacker.y - 1, 'LEVEL UP!', 'heal');
      }
    }

    // Counter attack popup (after brief delay via animation queue)
    if (result.counterDamage > 0 || !result.counterIsHit) {
      setTimeout(() => {
        if (result.counterIsHit) {
          const counterCritText = result.counterIsCrit ? 'CRIT!' : '';
          this.addAnimation(attacker.x, attacker.y, counterCritText + result.counterDamage.toString(), result.counterIsCrit ? 'crit' : 'damage');
        } else if (result.defenderHpAfter > 0 && defender.equippedWeapon) {
          this.addAnimation(attacker.x, attacker.y, 'MISS', 'miss');
        }
        decrementDurability(defender);

        // Check for deaths
        if (result.isCounterKill) {
          killUnit(attacker.id);
          this.checkLoseCondition(attacker);
        }
      }, 600);
    }

    // Check for deaths
    if (result.isKill) {
      killUnit(defender.id);
      this.checkWinCondition(defender);
    }

    // Finish unit action
    const unit = GameState.units[attacker.id];
    if (unit && unit.faction === 'player') {
      this.finishAction(unit);
    }
  },

  checkWinCondition(defender) {
    if (defender.isBoss) {
      setTimeout(() => {
        this.addAnimation(defender.x, defender.y, 'BOSS DEFEATED!', 'heal');
        GameState.activeDialog = {
          title: '章节完成!',
          text: '敌人指挥官已被击败!',
          buttons: ['确定'],
          callback: () => {
            GameState.screen = 'title';
          }
        };
      }, 1000);
    }
  },

  checkLoseCondition(unit) {
    if (unit.id === 'unit_0' || unit.classId === 'lord' || unit.name === '马尔斯') {
      setTimeout(() => {
        GameState.screen = 'gameover';
      }, 800);
    }
  },

  // ========== Turn Management ==========

  endPlayerTurn() {
    GameState.waitingForInput = true;
    this.clearSelection();

    // Show enemy phase banner
    GameState.phaseTransition = true;
    GameState.phase = 'ENEMY_PHASE';

    setTimeout(() => {
      GameState.phaseTransition = false;
      this.runEnemyPhase();
    }, 1500);
  },

  async runEnemyPhase() {
    turnManager.startEnemyPhase();
    GameState.phaseTransition = true;

    setTimeout(async () => {
      GameState.phaseTransition = false;
      const enemies = getAliveByFaction('enemy');

      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (GameState.screen !== 'game') return;

        const action = decideAction(enemy, GameState);

        if (action.type === 'attack') {
          // Move to position first
          if (action.moveTo && (action.moveTo.x !== enemy.x || action.moveTo.y !== enemy.y)) {
            enemy.x = action.moveTo.x;
            enemy.y = action.moveTo.y;
            await this.delay(400);
          }

          // Attack
          const target = GameState.units[action.targetId];
          if (target && target.alive) {
            const atkWpn = getEquippedWeapon(enemy);
            const result = resolve(enemy, target, GameState);

            if (result.isHit) {
              const text = result.isCrit ? 'CRIT!' + result.damage : '' + result.damage;
              this.addAnimation(target.x, target.y, text, result.isCrit ? 'crit' : 'damage');
            } else {
              this.addAnimation(target.x, target.y, 'MISS', 'miss');
            }

            target.hp = result.defenderHpAfter;
            decrementDurability(enemy);

            if (result.isKill) {
              killUnit(target.id);
              this.checkLoseCondition(target);
            }

            // Counter
            if (result.counterIsHit) {
              await this.delay(500);
              const cText = result.counterIsCrit ? 'CRIT!' + result.counterDamage : '' + result.counterDamage;
              this.addAnimation(enemy.x, enemy.y, cText, result.counterIsCrit ? 'crit' : 'damage');
              enemy.hp = result.attackerHpAfter;
              decrementDurability(target);
              if (result.isCounterKill) {
                killUnit(enemy.id);
              }
            }
            enemy.acted = true;
          }
          await this.delay(600);
        } else if (action.type === 'move') {
          enemy.x = action.destination.x;
          enemy.y = action.destination.y;
          enemy.acted = true;
          await this.delay(400);
        } else {
          enemy.acted = true;
        }
      }

      // Back to player phase
      if (GameState.screen === 'game') {
        GameState.turn++;
        turnManager.startPlayerPhase();
        GameState.phaseTransition = true;
        setTimeout(() => {
          GameState.phaseTransition = false;
        }, 1500);
      }
    }, 1500);
  },

  // ========== Animation ==========

  addAnimation(x, y, text, type) {
    GameState.activeAnimations.push({
      id: animIdCounter++,
      type,
      text: String(text),
      x,
      y,
    });
  },

  onAnimationComplete() {
    if (GameState.activeAnimations.length > 0) {
      GameState.activeAnimations.shift();
    }
  },

  // ========== Save/Load ==========

  saveGame(slot) {
    const ok = save(slot);
    if (ok) {
      GameState.activeDialog = {
        title: '存档', text: '保存成功!', buttons: ['确定'],
        callback: () => {},
      };
    } else {
      GameState.activeDialog = {
        title: '错误', text: '保存失败!', buttons: ['确定'],
        callback: () => {},
      };
    }
  },

  loadGame(slot) {
    const ok = load(slot);
    if (!ok) {
      GameState.activeDialog = {
        title: '错误', text: '读取失败或无存档!', buttons: ['确定'],
        callback: () => {},
      };
    }
  },

  deleteSave(slot) {
    deleteSlot(slot);
  },

  // ========== Helpers ==========

  isInRange(pos, range) {
    return range.some(p => p.x === pos.x && p.y === pos.y);
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};
