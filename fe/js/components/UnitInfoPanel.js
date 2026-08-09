import { defineComponent, computed } from 'vue';
import { GameState } from '../systems/GameState.js';
import { T } from '../utils/i18n.js';

export default defineComponent({
  name: 'UnitInfoPanel',
  template: `
    <div v-if="selectedUnit" class="unit-info-panel">
      <div class="unit-info-panel__portrait">
        {{ factionIcon }}
      </div>
      <div class="unit-info-panel__stats">
        <div class="unit-info-panel__stat">
          <span class="unit-info-panel__stat-label">{{ selectedUnit.name }}</span>
          <span class="unit-info-panel__stat-value">Lv{{ selectedUnit.level }}</span>
        </div>
        <div class="unit-info-panel__stat">
          <span class="unit-info-panel__stat-label">{{ T.STAT_HP }}</span>
          <span class="unit-info-panel__stat-value">{{ selectedUnit.hp }}/{{ selectedUnit.maxHp }}</span>
        </div>
        <div class="unit-info-panel__stat">
          <span class="unit-info-panel__stat-label">{{ T.STAT_STR }}</span>
          <span class="unit-info-panel__stat-value">{{ selectedUnit.str }}</span>
        </div>
        <div class="unit-info-panel__stat">
          <span class="unit-info-panel__stat-label">{{ T.STAT_SKL }}</span>
          <span class="unit-info-panel__stat-value">{{ selectedUnit.skl }}</span>
        </div>
        <div class="unit-info-panel__stat">
          <span class="unit-info-panel__stat-label">{{ T.STAT_SPD }}</span>
          <span class="unit-info-panel__stat-value">{{ selectedUnit.spd }}</span>
        </div>
        <div class="unit-info-panel__stat">
          <span class="unit-info-panel__stat-label">{{ T.STAT_LCK }}</span>
          <span class="unit-info-panel__stat-value">{{ selectedUnit.lck }}</span>
        </div>
        <div class="unit-info-panel__stat">
          <span class="unit-info-panel__stat-label">{{ T.STAT_DEF }}</span>
          <span class="unit-info-panel__stat-value">{{ selectedUnit.def }}</span>
        </div>
        <div class="unit-info-panel__stat">
          <span class="unit-info-panel__stat-label">{{ T.STAT_MOV }}</span>
          <span class="unit-info-panel__stat-value">{{ selectedUnit.mov }}</span>
        </div>
        <div v-if="selectedUnit.mag > 0" class="unit-info-panel__stat">
          <span class="unit-info-panel__stat-label">{{ T.STAT_MAG }}</span>
          <span class="unit-info-panel__stat-value">{{ selectedUnit.mag }}</span>
        </div>
        <div v-if="selectedUnit.res > 0" class="unit-info-panel__stat">
          <span class="unit-info-panel__stat-label">{{ T.STAT_RES }}</span>
          <span class="unit-info-panel__stat-value">{{ selectedUnit.res }}</span>
        </div>
        <div class="unit-info-panel__stat">
          <span class="unit-info-panel__stat-label">{{ T.EXP }}</span>
          <span class="unit-info-panel__stat-value">{{ selectedUnit.exp }}/100</span>
        </div>
      </div>
      <div v-if="selectedUnit.equippedWeapon" class="unit-info-panel__weapon">
        <div class="unit-info-panel__weapon-name">
          {{ selectedUnit.equippedWeapon.name }}
        </div>
        <div class="unit-info-panel__weapon-durability">
          {{ T.WEAPON_DURABILITY }}: {{ selectedUnit.equippedWeapon.durability }}/{{ selectedUnit.equippedWeapon.maxDurability }}
        </div>
        <div class="unit-info-panel__weapon-durability">
          威力:{{ selectedUnit.equippedWeapon.might }} 命中:{{ selectedUnit.equippedWeapon.hit }}%
        </div>
      </div>
    </div>
  `,
  setup() {
    const selectedUnit = computed(() => {
      const id = GameState.selectedUnitId;
      return id ? GameState.units[id] : null;
    });

    const factionIcon = computed(() => {
      if (!selectedUnit.value) return '';
      const f = selectedUnit.value.faction;
      if (f === 'player') return '🛡️';
      if (f === 'enemy') return '💀';
      if (f === 'ally') return '🤝';
      return '❓';
    });

    return { selectedUnit, factionIcon, T };
  }
});
