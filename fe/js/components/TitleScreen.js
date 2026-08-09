import { defineComponent } from 'vue';
import { EventBus } from '../eventBus.js';
import { T } from '../utils/i18n.js';

export default defineComponent({
  name: 'TitleScreen',
  template: `
    <div class="title-screen">
      <div class="title-main">火焰纹章</div>
      <div class="title-sub">暗黑龙与光之剑</div>
      <div class="title-buttons">
        <button class="btn" @click="onNewGame">{{ T.NEW_GAME }}</button>
        <button class="btn" :class="{ 'btn--disabled': !hasSaves }" @click="onContinue" :disabled="!hasSaves">{{ T.CONTINUE_LABEL }}</button>
      </div>
    </div>
  `,
  setup() {
    // Check if any save exists
    function hasSaves() {
      return !!localStorage.getItem('fe_save_slot_0');
    }

    function onNewGame() {
      EventBus.emit('new-game');
    }

    function onContinue() {
      EventBus.emit('continue-game');
    }

    return { T, hasSaves, onNewGame, onContinue };
  }
});
