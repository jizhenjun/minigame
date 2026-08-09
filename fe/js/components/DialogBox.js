import { defineComponent, computed } from 'vue';
import { GameState } from '../systems/GameState.js';
import { T } from '../utils/i18n.js';

export default defineComponent({
  name: 'DialogBox',
  template: `
    <div v-if="showDialog" class="dialog-overlay" @click.self="onCancel">
      <div class="dialog-box">
        <div v-if="dialogData.title" class="dialog-title">{{ dialogData.title }}</div>
        <div class="dialog-body">{{ dialogData.text }}</div>
        <div class="dialog-buttons">
          <button
            v-for="btn in dialogData.buttons"
            :key="btn"
            class="btn"
            @click="onSelect(btn)"
          >{{ btn }}</button>
        </div>
      </div>
    </div>
  `,
  setup() {
    const showDialog = computed(() => !!GameState.activeDialog);

    const dialogData = computed(() => {
      return GameState.activeDialog || {};
    });

    function onSelect(button) {
      const cb = GameState.activeDialog?.callback;
      GameState.activeDialog = null;
      if (cb) cb(button);
    }

    function onCancel() {
      if (GameState.activeDialog?.buttons?.includes(T.DIALOG_CANCEL)) {
        onSelect(T.DIALOG_CANCEL);
      }
    }

    return { showDialog, dialogData, onSelect, onCancel, T };
  }
});
