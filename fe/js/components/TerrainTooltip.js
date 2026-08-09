import { defineComponent, computed } from 'vue';
import { GameState } from '../systems/GameState.js';
import { TERRAIN } from '../data/terrain.js';

export default defineComponent({
  name: 'TerrainTooltip',
  template: `
    <div v-if="hasTooltip" class="terrain-tooltip" :style="tooltipStyle">
      <div>{{ terrainName }}</div>
      <div v-if="bonus" class="terrain-tooltip__bonus">{{ bonus }}</div>
    </div>
  `,
  setup() {
    const hasTooltip = computed(() => {
      return GameState.hoveredTile !== null && GameState.tiles.length > 0;
    });

    const terrainName = computed(() => {
      if (!hasTooltip.value) return '';
      const t = getTile();
      return TERRAIN[t]?.name || t;
    });

    const bonus = computed(() => {
      if (!hasTooltip.value) return '';
      const t = getTile();
      const data = TERRAIN[t];
      if (!data) return '';
      const parts = [];
      if (data.avoidBonus > 0) parts.push(`回避+${data.avoidBonus}%`);
      if (data.defBonus > 0) parts.push(`防御+${data.defBonus}`);
      if (data.hpRegen > 0) parts.push(`每回合回复${data.hpRegen}HP`);
      return parts.join(' ');
    });

    const tooltipStyle = computed(() => {
      const h = GameState.hoveredTile;
      if (!h) return {};
      return {
        left: Math.min(h.x * 32 + 36, 768 - 150) + 'px',
        top: Math.max(h.y * 32 - 8, 0) + 'px',
      };
    });

    function getTile() {
      const h = GameState.hoveredTile;
      if (!h) return 'plains';
      const row = GameState.tiles[h.y];
      return row ? row[h.x] : 'plains';
    }

    return { hasTooltip, terrainName, bonus, tooltipStyle };
  }
});
