import { defineComponent } from 'vue';
import { GameState } from '../systems/GameState.js';
import { EventBus } from '../eventBus.js';

export default defineComponent({
  name: 'ChapterIntro',
  template: `
    <div class="chapter-intro">
      <div class="chapter-intro__name">{{ chapterName }}</div>
      <div class="chapter-intro__objective">目标: {{ objective }}</div>
      <button class="chapter-intro__btn" @click="start">开始战斗</button>
    </div>
  `,
  setup() {
    const chapterName = GameState._chapterName || '第一章：起点';
    const objective = GameState._chapterObjective || '击败敌方指挥官';

    function start() {
      EventBus.emit('begin-chapter');
    }

    return { chapterName, objective, start };
  }
});
