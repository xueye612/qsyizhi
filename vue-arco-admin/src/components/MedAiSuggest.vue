<template>
  <a-card :bordered="false" class="med-ai-card">
    <div class="head">AI 辅助建议</div>
    <div v-if="!items.length" class="empty">暂无建议</div>
    <div v-else class="sections">
      <section v-if="grouped.high.length" class="block">
        <div class="block-title pri-high">高优先</div>
        <ul class="items">
          <li v-for="(it, i) in grouped.high" :key="'h' + i" class="item">
            <div class="item-title">{{ it.title }}</div>
            <div class="item-reason">{{ it.reason }}</div>
          </li>
        </ul>
      </section>
      <section v-if="grouped.mid.length" class="block">
        <div class="block-title pri-mid">中优先</div>
        <ul class="items">
          <li v-for="(it, i) in grouped.mid" :key="'m' + i" class="item">
            <div class="item-title">{{ it.title }}</div>
            <div class="item-reason">{{ it.reason }}</div>
          </li>
        </ul>
      </section>
      <section v-if="grouped.low.length" class="block">
        <div class="block-title pri-low">低优先</div>
        <ul class="items">
          <li v-for="(it, i) in grouped.low" :key="'l' + i" class="item">
            <div class="item-title">{{ it.title }}</div>
            <div class="item-reason">{{ it.reason }}</div>
          </li>
        </ul>
      </section>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export type MedAiItem = {
  priority: 'high' | 'mid' | 'low';
  title: string;
  reason: string;
};

const props = defineProps<{
  /** 分级建议；兼容旧页面传入 string[]（视为中优先，原因同标题） */
  items: MedAiItem[] | string[];
}>();

function normalizeItems(raw: MedAiItem[] | string[]): MedAiItem[] {
  return raw.map((it) =>
    typeof it === 'string'
      ? { priority: 'mid' as const, title: it, reason: it }
      : it
  );
}

const grouped = computed(() => {
  const high: MedAiItem[] = [];
  const mid: MedAiItem[] = [];
  const low: MedAiItem[] = [];
  for (const it of normalizeItems(props.items)) {
    if (it.priority === 'high') high.push(it);
    else if (it.priority === 'mid') mid.push(it);
    else low.push(it);
  }
  return { high, mid, low };
});
</script>

<style scoped>
.med-ai-card {
  border-radius: var(--med-radius, 8px);
  border: 1px solid var(--med-ai-border, #d6e4ff);
  background: var(--med-ai-bg, #f0f5ff);
  box-shadow: none;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.med-ai-card :deep(.arco-card-body) {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 0;
}

.head {
  font-size: 14px;
  font-weight: 600;
  color: var(--med-text, #1d2129);
  margin-bottom: 12px;
  line-height: 1.4;
}

.empty {
  font-size: 13px;
  color: var(--med-muted, #86909c);
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: auto;
  min-height: 0;
}

.block-title {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.02em;
}
.pri-high {
  color: #f53f3f;
}
.pri-mid {
  color: #ff7d00;
}
.pri-low {
  color: #00b42a;
}

.items {
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(22, 93, 255, 0.1);
}
.item + .item {
  margin-top: 8px;
}

.item-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--med-text, #1d2129);
  line-height: 1.4;
}

.item-reason {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.55;
  color: var(--med-text-2, #4e5969);
}
</style>
