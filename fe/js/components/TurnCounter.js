import { defineComponent } from 'vue';
import { GameState } from '../systems/GameState.js';
import { EventBus } from '../eventBus.js';
import { T } from '../utils/i18n.js';

export default defineComponent({
  name: 'TurnCounter',
  template: `
    <div class="top-bar">
      <span class="top-bar__turn">{{ T.TURN }} {{ gameState.turn }}</span>
      <span class="top-bar__objective">{{ T.OBJECTIVE }}: {{ T.BOSS_DEFEAT }}</span>
      <div>
        <button class="top-bar__btn" @click="onSave">{{ T.ACTION_SAVE }}</button>
        <button class="top-bar__btn" @click="onLoad" style="margin-left:4px;">{{ T.ACTION_LOAD }}</button>
        <button class="top-bar__btn" @click="onEndTurn" style="margin-left:4px;">{{ T.ACTION_END_TURN }}</button>
      </div>
    </div>
  `,
  setup() {
    function onEndTurn() { EventBus.emit('end-turn'); }
    function onSave() { GameState.screen = 'save-load'; GameState._saveMode = 'save'; }
    function onLoad() { GameState.screen = 'save-load'; GameState._saveMode = 'load'; }
    return { gameState: GameState, T, onEndTurn, onSave, onLoad };
  }
});
