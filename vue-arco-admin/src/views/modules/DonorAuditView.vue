<!--
  ①模块理解：审核流程页跟踪供体伦理与医学评估节点，明确责任人与截止时间。
  ②行业调研：阶段名称、负责人、到期时间、进行中/阻塞状态。
  ③页面设计：流程节点表 + 右侧以「AI辅助建议」提示阻塞升级与留痕（克制风格）。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="供体审核流程" desc="伦理 / 医学评估 · 节点责任人（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="进行中" hint="推进中节点" :value="kpi.ing" tone="danger" trend="关注到期" trend-dir="flat" />
        <MedStatCard label="已通过" hint="可进入下一节点" :value="kpi.pass" tone="success" trend="留痕可审计" trend-dir="flat" />
        <MedStatCard label="阻塞" hint="需升级处理" :value="kpi.block" tone="warning" trend="24h 内升级" trend-dir="flat" />
        <MedStatCard label="近两日到期" hint="需提前处理" :value="kpi.dueSoon" tone="primary" trend="避免逾期" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="流程节点" desc="点击行选中 · 右侧提示节点风险与升级建议">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: DonorAuditRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1120 }"
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
import { donorAuditKpis, seedDonorAudit, type DonorAuditRow } from '@/mock/donorOps';

const data = ref(seedDonorAudit());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => donorAuditKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `供体 ${r.donorCode} 节点「${r.stage}」由 ${r.owner} 负责，截止 ${r.dueAt}，状态「${r.status}」。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.status === '阻塞' ? '阻塞节点：建议 24h 内升级至科室主任并记录会诊意见。' : '正常推进：确认前置材料已归档并可审计。',
    '到期前 1 日提醒责任人并记录已读（演示）。',
    '流程未闭环前，避免变更供体识别字段与关键结论。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一个流程节点。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: DonorAuditRow) {
  sel.value = r.id;
}

function rowClass(r: DonorAuditRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: '节点ID', dataIndex: 'id', width: 100 },
  {
    title: '供体编号',
    dataIndex: 'donorCode',
    width: 158,
    minWidth: 158,
    ellipsis: true,
    tooltip: true
  },
  { title: '阶段', dataIndex: 'stage', width: 140, minWidth: 120, ellipsis: true, tooltip: true },
  { title: '负责人', dataIndex: 'owner', width: 148, ellipsis: true, tooltip: true },
  {
    title: '截止',
    dataIndex: 'dueAt',
    width: 178,
    minWidth: 178,
    render: ({ record }: { record: DonorAuditRow }) =>
      h('span', { class: 'table-mono-nowrap' }, record.dueAt)
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    align: 'center',
    render: ({ record }: { record: DonorAuditRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '阻塞' ? 'red' : record.status === '已通过' ? 'green' : 'orangered';
      return h(T, { color: c }, () => record.status);
    }
  }
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

