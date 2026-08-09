import { defineComponent, computed } from 'vue';
import { GameState } from '../systems/GameState.js';
import { EventBus } from '../eventBus.js';

export default defineComponent({
  name: 'ActionMenu',
  template: `
    <div
      v-if="options.length > 0"
      class="action-menu"
      :style="menuStyle"
    >
      <button
        v-for="opt in options"
        :key="opt.id"
        class="action-menu__item"
        :class="{ 'action-menu__item--disabled': opt.disabled }"
        @click="selectAction(opt.id)"
      >{{ opt.label }}</button>
    </div>
  `,
  setup() {
    const ACTION_LABELS = {
      attack: '攻击',
      wait: '待机',
      items: '物品',
      trade: '交换',
    };

    const options = computed(() => {
      return GameState.actionOptions.map(id => ({
        id,
        label: ACTION_LABELS[id] || id,
        disabled: false,
      }));
    });

    const menuStyle = computed(() => {
      const unitId = GameState.selectedUnitId;
      if (!unitId) return {};
      const unit = GameState.units[unitId];
      if (!unit) return {};
      // Position menu near the unit
      const left = unit.x * 32 + 36;
      const top = unit.y * 32;
      return {
        left: Math.min(left, 768 - 120) + 'px',
        top: Math.max(0, top) + 'px',
      };
    });

    function selectAction(action) {
      EventBus.emit('action-selected', { action });
    }

    return { options, menuStyle, selectAction };
  }
});
