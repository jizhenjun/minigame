import { defineComponent, computed } from 'vue';
import { GameState } from '../systems/GameState.js';
import { EventBus } from '../eventBus.js';

export default defineComponent({
  name: 'MapView',
  template: `
    <div
      class="map-grid"
      :style="gridStyle"
    >
      <div
        v-for="tile in flatTiles"
        :key="tile.x + ',' + tile.y"
        class="tile"
        :class="[
          'tile--' + tile.terrainId,
          { 'tile--move-range': isInMoveRange(tile.x, tile.y) },
          { 'tile--attack-range': isInAttackRange(tile.x, tile.y) },
          { 'tile--selected': isSelected(tile.x, tile.y) },
          { 'tile--hover': isHovered(tile.x, tile.y) },
        ]"
        :data-x="tile.x"
        :data-y="tile.y"
        @click="onClick(tile.x, tile.y)"
        @mouseenter="onHover(tile.x, tile.y)"
        @mouseleave="onUnhover()"
      >
        <!-- Unit slots will be rendered by parent -->
      </div>
      <!-- Unit sprites rendered as absolutely positioned children -->
      <template v-for="unit in aliveUnits" :key="unit.id">
        <div
          class="unit-sprite"
          :class="{
            'unit-sprite--acted': unit.acted,
            'unit-sprite--selected': unit.id === gameState.selectedUnitId,
          }"
          :style="unitStyle(unit)"
          @click.stop="onUnitClick(unit.id)"
        >
          <canvas
            :ref="el => drawUnit(el, unit)"
            width="32"
            height="40"
          ></canvas>
          <div class="unit-hp-bar">
            <div
              class="unit-hp-bar__fill"
              :class="hpBarClass(unit)"
              :style="{ width: hpPercent(unit) + '%' }"
            ></div>
          </div>
        </div>
      </template>
    </div>
  `,
  setup() {
    const gameState = GameState;

    const gridStyle = computed(() => ({
      gridTemplateColumns: `repeat(${gameState.mapWidth}, 32px)`,
      gridTemplateRows: `repeat(${gameState.mapHeight}, 32px)`,
    }));

    const flatTiles = computed(() => {
      const tiles = [];
      if (!gameState.tiles || gameState.tiles.length === 0) return tiles;
      for (let y = 0; y < gameState.mapHeight; y++) {
        for (let x = 0; x < gameState.mapWidth; x++) {
          const row = gameState.tiles[y];
          const terrainId = row ? row[x] : 'plains';
          tiles.push({ x, y, terrainId });
        }
      }
      return tiles;
    });

    const aliveUnits = computed(() => {
      const all = gameState.units;
      return Object.values(all).filter(u => u.alive);
    });

    function isInMoveRange(x, y) {
      return gameState.moveRange.some(p => p.x === x && p.y === y);
    }

    function isInAttackRange(x, y) {
      return gameState.attackRange.some(p => p.x === x && p.y === y);
    }

    function isSelected(x, y) {
      const sel = gameState.selectedUnitId;
      if (!sel) return false;
      const unit = gameState.units[sel];
      return unit && unit.x === x && unit.y === y;
    }

    function isHovered(x, y) {
      return gameState.hoveredTile?.x === x && gameState.hoveredTile?.y === y;
    }

    function unitStyle(unit) {
      return {
        left: unit.x * 32 + 'px',
        top: unit.y * 32 + 'px',
      };
    }

    function hpPercent(unit) {
      return Math.round((unit.hp / unit.maxHp) * 100);
    }

    function hpBarClass(unit) {
      const pct = hpPercent(unit);
      if (pct > 60) return 'unit-hp-bar__fill--full';
      if (pct > 30) return 'unit-hp-bar__fill--mid';
      return 'unit-hp-bar__fill--low';
    }

    // Simple colored rectangle sprites (will be upgraded to pixel art in Phase G)
    const FACTION_COLORS = { player: '#4878f8', enemy: '#f84848', ally: '#48a848', npc: '#888888' };
    function drawUnit(el, unit) {
      if (!el) return;
      const ctx = el.getContext('2d');
      const palette = [
        null,
        FACTION_COLORS[unit.faction] || '#888',
        '#ffffff',
        '#000000',
        '#f8e048',
      ];

      // Draw simple sprite
      ctx.clearRect(0, 0, 32, 40);
      ctx.imageSmoothingEnabled = false;

      // Body
      ctx.fillStyle = palette[1];
      ctx.fillRect(8, 8, 16, 20);
      // Head
      ctx.fillStyle = palette[2];
      ctx.fillRect(10, 2, 12, 8);
      // Eyes
      ctx.fillStyle = palette[3];
      ctx.fillRect(14, 4, 2, 2);
      ctx.fillRect(18, 4, 2, 2);
      // Class indicator (simple shape)
      ctx.fillStyle = palette[4];
      const cx = unit.classId;
      if (cx === 'lord') {
        // Crown
        ctx.fillRect(12, 0, 8, 2);
        ctx.fillRect(10, 1, 12, 1);
      } else if (cx === 'knight' || cx === 'general') {
        // Shield shape (wider)
        ctx.fillStyle = palette[2];
        ctx.fillRect(4, 12, 24, 12);
      } else if (cx === 'pegasus_knight' || cx === 'wyvern_knight') {
        // Wings
        ctx.fillStyle = palette[2];
        ctx.fillRect(4, 8, 6, 4);
        ctx.fillRect(22, 8, 6, 4);
      }
    }

    function onClick(x, y) {
      EventBus.emit('tile-clicked', { x, y });
    }

    function onHover(x, y) {
      EventBus.emit('tile-hover', { x, y });
    }

    function onUnhover() {
      EventBus.emit('tile-unhover');
    }

    function onUnitClick(unitId) {
      EventBus.emit('unit-clicked', { unitId });
    }

    return {
      gameState, gridStyle, flatTiles, aliveUnits,
      isInMoveRange, isInAttackRange, isSelected, isHovered,
      unitStyle, hpPercent, hpBarClass, drawUnit,
      onClick, onHover, onUnhover, onUnitClick,
    };
  }
});
