<!--
  ①模块理解：AI 干预记录追踪建议是否被临床采纳，用于质量审计与模型迭代。
  ②行业调研：上下文、AI 提案、采纳结果、复核人、决定时间；需可追溯与责任边界。
  ③页面设计：KPI 概览 + 记录列表；右侧以「AI辅助建议」提示采纳审计与复盘要点（克制风格）。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="AI 干预记录" desc="建议 · 采纳结果 · 复核留痕（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="完全采纳" hint="执行一致" :value="kpi.full" tone="success" trend="记录闭环" trend-dir="flat" />
        <MedStatCard label="部分采纳" hint="需说明差异" :value="kpi.partial" tone="warning" trend="补齐依据" trend-dir="flat" />
        <MedStatCard label="未采纳" hint="进入复盘" :value="kpi.none" tone="danger" trend="反馈模型" trend-dir="flat" />
        <MedStatCard label="今日条目" hint="2026-04-16" :value="kpi.recent" tone="primary" trend="按日统计" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="记录列表" desc="点击行选中 · 右侧提示采纳审计与责任边界">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: AiInterveneRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1080 }"
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
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedPageHeader from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import { aiInterveneKpis, seedAiIntervenes, type AiInterveneRow } from '@/mock/aiAssist';

const data = ref(seedAiIntervenes());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => aiInterveneKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `患者 ${r.patientName}（${r.patientId}）场景「${r.context}」。AI 提案：${r.aiProposal}。复核结论：${r.adopted}。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    `复核人「${r.reviewer}」需说明与 AI 建议差异的临床依据（若部分/未采纳）。`,
    r.adopted === '未采纳' ? '未采纳记录进入模型反馈队列（流程占位），便于迭代与回归验证。' : '采纳/部分采纳建议同步到随访任务或医嘱变更留痕。',
    '对外沟通以医师决策为准，AI 仅辅助。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一条干预记录。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: AiInterveneRow) {
  sel.value = r.id;
}

function rowClass(r: AiInterveneRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: '记录ID', dataIndex: 'id', width: 130 },
  { title: '患者ID', dataIndex: 'patientId', width: 118 },
  { title: '姓名', dataIndex: 'patientName', width: 72 },
  { title: '场景', dataIndex: 'context', ellipsis: true, tooltip: true },
  { title: 'AI 提案', dataIndex: 'aiProposal', ellipsis: true, tooltip: true },
  {
    title: '采纳',
    dataIndex: 'adopted',
    width: 100,
    render: ({ record }: { record: AiInterveneRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.adopted === '采纳' ? 'green' : record.adopted === '部分采纳' ? 'orangered' : 'red';
      return h(T, { color: c }, () => record.adopted);
    }
  },
  { title: '复核人', dataIndex: 'reviewer', width: 88 },
  { title: '决定时间', dataIndex: 'decidedAt', width: 145 }
];
</script>

<style scoped>
.med-page{
  box-sizing:border-box;
  padding: var(--med-page-pad);
  display:flex;
  flex-direction:column;
  gap: var(--med-gap);
  min-width:0;
}
.kpi-grid{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--med-gap);
  align-items: stretch;
}
.split{
  display:flex;
  gap: var(--med-gap);
  align-items: stretch;
  min-width:0;
}
.ai-col{
  width: 360px;
  flex-shrink:0;
  display:flex;
}
@media (max-width: 1100px){
  .kpi-grid{grid-template-columns: repeat(2, minmax(0,1fr))}
  .split{flex-direction: column}
  .ai-col{width: 100%}
}
:deep(.row-selected .arco-table-td){
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>

