<!--
  ①模块理解：指标解读将化验结果转为患者可理解的说明与随访话术，须经医师复核后发布。
  ②行业调研：参考范围、个体基线、复核状态、发布时间；KPI 含待复核、已发布、驳回等。
  ③页面设计：解读任务表 + 右侧以「AI辅助建议」做发布前一致性检查要点（克制风格）。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="指标解读工作台" desc="参考范围 · 白话摘要 · 复核与发布（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="待复核" hint="医师确认" :value="kpi.pending" tone="danger" trend="发布前必审" trend-dir="flat" />
        <MedStatCard label="已发布" hint="患者可见版本" :value="kpi.published" tone="success" trend="需留版本" trend-dir="flat" />
        <MedStatCard label="已驳回" hint="需重写" :value="kpi.rejected" tone="default" trend="记录原因" trend-dir="flat" />
        <MedStatCard label="需关注项" hint="肾/浓度相关" :value="kpi.needDoctor" tone="warning" trend="优先复核" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="解读队列" desc="点击行选中 · 右侧提示发布前一致性与免责话术">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: AiInterpretRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1200 }"
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
import { aiInterpretKpis, seedAiInterprets, type AiInterpretRow } from '@/mock/aiAssist';

const data = ref(seedAiInterprets());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => aiInterpretKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `指标「${r.indicator}」当前值 ${r.valueText}（参考 ${r.reference}）。AI 摘要：${r.aiSummary}`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    '发布前核对：与 LIS 原始值、单位、参考范围一致；避免跨院方法学差误导。',
    `状态「${r.status}」：${r.status === '待复核' ? '禁止对患者端展示。' : r.status === '已发布' ? '保留版本号与编辑痕迹。' : '驳回需记录原因与修订人。'}`,
    '话术须包含「具体诊疗以面诊医师为准」。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一条解读任务。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: AiInterpretRow) {
  sel.value = r.id;
}

function rowClass(r: AiInterpretRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: '任务ID', dataIndex: 'id', width: 130 },
  { title: '患者ID', dataIndex: 'patientId', width: 118 },
  { title: '姓名', dataIndex: 'patientName', width: 72 },
  { title: '指标', dataIndex: 'indicator', width: 140, ellipsis: true, tooltip: true },
  { title: '结果', dataIndex: 'valueText', width: 120 },
  { title: '参考', dataIndex: 'reference', width: 120, ellipsis: true, tooltip: true },
  { title: '摘要', dataIndex: 'aiSummary', ellipsis: true, tooltip: true },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: AiInterpretRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '待复核' ? 'orangered' : record.status === '已发布' ? 'green' : 'red';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '更新', dataIndex: 'updatedAt', width: 145 }
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

