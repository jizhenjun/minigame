import { defineComponent, computed, ref, onMounted } from 'vue';
import { GameState } from '../systems/GameState.js';
import { EventBus } from '../eventBus.js';
import { T } from '../utils/i18n.js';

export default defineComponent({
  name: 'SaveLoadMenu',
  template: `
    <div class="save-load-menu">
      <h2>{{ modeText }}</h2>
      <div v-for="(slot, i) in slots" :key="i" class="save-slot">
        <div class="save-slot__info">
          <div v-if="slot.exists" class="save-slot__name">存档 {{ i + 1 }}</div>
          <div v-if="slot.exists" class="save-slot__detail">
            第{{ slot.chapter }}章 | {{ T.TURN }} {{ slot.turn }} | {{ slot.time }}
          </div>
          <div v-if="!slot.exists" class="save-slot__empty">
            存档 {{ i + 1 }} - {{ T.SAVE_SLOT_EMPTY }}
          </div>
        </div>
        <div class="save-slot__actions">
          <button v-if="isSaveMode || slot.exists" class="btn" @click="onAction(i)">
            {{ isSaveMode ? T.SAVE_SLOT_SAVE : T.SAVE_SLOT_LOAD }}
          </button>
          <button v-if="slot.exists" class="btn" style="font-size:11px;padding:4px 8px;" @click="onDelete(i)">
            {{ T.SAVE_SLOT_DELETE }}
          </button>
        </div>
      </div>
      <button class="btn save-load-menu__back" @click="onBack">{{ T.BACK }}</button>
    </div>
  `,
  setup() {
    const slots = ref([]);

    function loadSlots() {
      slots.value = [];
      for (let i = 0; i < 3; i++) {
        const raw = localStorage.getItem('fe_save_slot_' + i);
        if (raw) {
          try {
            const data = JSON.parse(raw);
            slots.value.push({
              exists: true,
              chapter: data.chapter || 1,
              turn: data.turn || 1,
              time: data.timestamp ? new Date(data.timestamp).toLocaleString('zh-CN') : '未知',
            });
          } catch {
            slots.value.push({ exists: false });
          }
        } else {
          slots.value.push({ exists: false });
        }
      }
    }

    onMounted(loadSlots);

    const isSaveMode = computed(() => GameState._saveMode === 'save');
    const modeText = computed(() => isSaveMode.value ? '存档' : '读档');

    function onAction(slot) {
      loadSlots();
      if (isSaveMode.value) {
        EventBus.emit('save-requested', { slot });
      } else {
        EventBus.emit('load-requested', { slot });
      }
      GameState.screen = 'game';
    }

    function onDelete(slot) {
      EventBus.emit('delete-save', { slot });
      loadSlots();
    }

    function onBack() {
      GameState.screen = 'game';
    }

    return { slots, isSaveMode, modeText, T, onAction, onDelete, onBack };
  }
});
