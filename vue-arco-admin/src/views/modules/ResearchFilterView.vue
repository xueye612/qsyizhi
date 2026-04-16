<!--
  ①模块理解：患者筛选维护入排标准与队列规模，支撑回顾性研究。
  ②行业调研：队列名、入排摘要、样本量、更新时间。
  ③页面设计：队列表 + 右侧提示偏倚与伦理审查。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="患者筛选" desc="入排标准 · 队列样本量（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="总样本量" hint="汇总 n" :value="kpi.nSum" tone="primary" trend="效力评估" trend-dir="flat" />
        <MedStatCard label="大队列(≥200)" hint="规模" :value="kpi.large" tone="default" trend="分层注意" trend-dir="flat" />
        <MedStatCard label="近日更新" hint="≥04-15" :value="kpi.fresh" tone="success" trend="活跃" trend-dir="flat" />
        <MedStatCard label="队列数" hint="列表条数" :value="kpi.cohorts" tone="warning" trend="版本管理" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="筛选队列" desc="点击行选中 · 右侧为研究设计与伦理提示">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: ResearchFilterRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1100 }"
          @row-click="onRow"
        />
      </MedTableCard>

      <div data-testid="ai-decision" class="ai-col">
        <MedAiSuggest :items="aiSuggestItems" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedPageHeader from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import { researchFilterKpis, seedResearchFilter, type ResearchFilterRow } from '@/mock/researchMocks';

const data = ref(seedResearchFilter());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => researchFilterKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `队列「${r.cohortName}」入排：${r.inclusion}。当前 n=${r.n}，更新 ${r.updatedAt}。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.n < 80 ? '小样本：注意统计效力与外部效度说明。' : '样本尚可：仍需检查缺失值与混杂因素。',
    '修改入排需版本化并记录伦理修正案（占位）。',
    'AI 不替代统计师与伦理委员会判断。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一行队列。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: ResearchFilterRow) {
  sel.value = r.id;
}

function rowClass(r: ResearchFilterRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 72 },
  { title: '队列', dataIndex: 'cohortName', ellipsis: true, tooltip: true },
  { title: '入排', dataIndex: 'inclusion', ellipsis: true, tooltip: true },
  { title: 'n', dataIndex: 'n', width: 72 },
  { title: '更新', dataIndex: 'updatedAt', width: 110 }
];
</script>

<style scoped>
.med-page {
  box-sizing: border-box;
  padding: var(--med-page-pad);
  display: flex;
  flex-direction: column;
  gap: var(--med-gap);
  min-width: 0;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--med-gap);
  align-items: stretch;
}
.split {
  display: flex;
  gap: var(--med-gap);
  align-items: stretch;
  min-width: 0;
}
.ai-col {
  width: 360px;
  flex-shrink: 0;
  display: flex;
}
@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .split {
    flex-direction: column;
  }
  .ai-col {
    width: 100%;
  }
}
:deep(.row-selected .arco-table-td) {
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>
