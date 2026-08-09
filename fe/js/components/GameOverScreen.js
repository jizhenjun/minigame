import { defineComponent } from 'vue';
import { EventBus } from '../eventBus.js';
import { T } from '../utils/i18n.js';

export default defineComponent({
  name: 'GameOverScreen',
  template: `
    <div class="game-over-screen">
      <div class="game-over__title">{{ T.GAME_OVER }}</div>
      <div style="color:#a8a8d0;font-size:14px;margin-bottom:24px;">{{ T.GAME_OVER_TEXT }}</div>
      <div class="game-over__buttons">
        <button class="btn" @click="restart">{{ T.RESTART_CHAPTER }}</button>
        <button class="btn" @click="quit">{{ T.QUIT_TO_TITLE }}</button>
      </div>
    </div>
  `,
  setup() {
    function restart() { EventBus.emit('restart-chapter'); }
    function quit() { EventBus.emit('quit-to-title'); }
    return { T, restart, quit };
  }
});
