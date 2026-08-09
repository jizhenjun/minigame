import { defineComponent, onMounted, ref, watch } from 'vue';
import { EventBus } from '../eventBus.js';

export default defineComponent({
  name: 'BattlePopup',
  props: {
    anim: { type: Object, required: true }
  },
  template: `
    <div
      class="battle-popup"
      :class="popupClass"
      :style="popupStyle"
    >{{ anim.text }}</div>
  `,
  setup(props) {
    const popupClass = ref('');
    const popupStyle = ref({});

    function init() {
      const a = props.anim;
      popupStyle.value = {
        left: (a.x * 32 + 16) + 'px',
        top: (a.y * 32 - 4) + 'px',
      };
      if (a.type === 'miss') popupClass.value = 'battle-popup--miss';
      else if (a.type === 'crit') popupClass.value = 'battle-popup--crit';
      else if (a.type === 'heal') popupClass.value = 'battle-popup--heal';
      else if (a.type === 'exp') popupClass.value = 'battle-popup--exp';
      else popupClass.value = '';

      setTimeout(() => {
        EventBus.emit('animation-complete', { id: a.id });
      }, 850);
    }

    onMounted(init);
    watch(() => props.anim, init);

    return { popupClass, popupStyle };
  }
});
