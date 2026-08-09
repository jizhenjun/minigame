import { defineComponent, computed } from 'vue';
import { GameState } from '../systems/GameState.js';

export default defineComponent({
  name: 'PhaseBanner',
  template: `
    <div class="phase-banner" :class="bannerClass">{{ phaseText }}</div>
  `,
  setup() {
    const phaseText = computed(() => {
      const p = GameState.phase;
      if (p === 'PLAYER_MOVE' || p === 'PLAYER_ACTION') return '玩家回合';
      if (p === 'ENEMY_PHASE') return '敌方回合';
      if (p === 'ALLY_PHASE') return '友军回合';
      return '';
    });

    const bannerClass = computed(() => {
      const p = GameState.phase;
      if (p === 'ENEMY_PHASE') return 'phase-banner--enemy';
      return '';
    });

    return { phaseText, bannerClass };
  }
});
