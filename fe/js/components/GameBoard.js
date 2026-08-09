import { defineComponent, onMounted, onUnmounted } from 'vue';
import { GameState } from '../systems/GameState.js';
import { EventBus } from '../eventBus.js';
import { T } from '../utils/i18n.js';

import TitleScreen from './TitleScreen.js';
import DialogBox from './DialogBox.js';
import MapView from './MapView.js';
import UnitInfoPanel from './UnitInfoPanel.js';
import ActionMenu from './ActionMenu.js';
import BattlePopup from './BattlePopup.js';
import PhaseBanner from './PhaseBanner.js';
import TurnCounter from './TurnCounter.js';
import TerrainTooltip from './TerrainTooltip.js';
import ChapterIntro from './ChapterIntro.js';
import GameOverScreen from './GameOverScreen.js';
import SaveLoadMenu from './SaveLoadMenu.js';

import { GameEngine } from '../engine/GameEngine.js';

export default defineComponent({
  name: 'GameBoard',
  components: {
    TitleScreen,
    DialogBox,
    MapView,
    UnitInfoPanel,
    ActionMenu,
    BattlePopup,
    PhaseBanner,
    TurnCounter,
    TerrainTooltip,
    ChapterIntro,
    GameOverScreen,
    SaveLoadMenu,
  },
  template: `
    <div class="game-container">
      <TitleScreen v-if="gameState.screen === 'title'" />
      <ChapterIntro v-if="gameState.screen === 'chapter-intro'" />
      <template v-if="gameState.screen === 'game'">
        <PhaseBanner v-if="gameState.phaseTransition" />
        <TurnCounter />
        <div class="map-container" style="position:relative;">
          <MapView />
          <BattlePopup v-for="anim in gameState.activeAnimations" :key="anim.id" :anim="anim" />
          <ActionMenu v-if="gameState.actionOptions.length > 0 && gameState.selectedUnitId" />
          <TerrainTooltip />
        </div>
        <UnitInfoPanel />
      </template>
      <SaveLoadMenu v-if="gameState.screen === 'save-load'" />
      <GameOverScreen v-if="gameState.screen === 'gameover'" />
      <DialogBox />
    </div>
  `,
  setup() {
    let unsubscribers = [];

    onMounted(() => {
      unsubscribers.push(EventBus.on('new-game', () => GameEngine.startNewGame()));
      unsubscribers.push(EventBus.on('begin-chapter', () => GameEngine.beginChapter()));
      unsubscribers.push(EventBus.on('continue-game', () => GameEngine.continueGame()));
      unsubscribers.push(EventBus.on('unit-clicked', ({ unitId }) => GameEngine.onUnitClicked(unitId)));
      unsubscribers.push(EventBus.on('tile-clicked', ({ x, y }) => GameEngine.onTileClicked(x, y)));
      unsubscribers.push(EventBus.on('tile-hover', ({ x, y }) => { GameState.hoveredTile = { x, y }; }));
      unsubscribers.push(EventBus.on('tile-unhover', () => { GameState.hoveredTile = null; }));
      unsubscribers.push(EventBus.on('action-selected', ({ action }) => GameEngine.onActionSelected(action)));
      unsubscribers.push(EventBus.on('end-turn', () => GameEngine.endPlayerTurn()));
      unsubscribers.push(EventBus.on('animation-complete', () => GameEngine.onAnimationComplete()));
      unsubscribers.push(EventBus.on('restart-chapter', () => GameEngine.restartChapter()));
      unsubscribers.push(EventBus.on('quit-to-title', () => GameEngine.quitToTitle()));
      unsubscribers.push(EventBus.on('save-requested', ({ slot }) => GameEngine.saveGame(slot)));
      unsubscribers.push(EventBus.on('load-requested', ({ slot }) => GameEngine.loadGame(slot)));
      unsubscribers.push(EventBus.on('delete-save', ({ slot }) => GameEngine.deleteSave(slot)));
    });

    onUnmounted(() => {
      unsubscribers.forEach(fn => fn());
    });

    return { gameState: GameState, T };
  }
});
