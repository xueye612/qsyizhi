<!--
  ①模块理解：对账系统比对银行 totals 与业务系统 totals，跟踪差异与调账状态。
  ②行业调研：账期、两侧合计、差异金额、待调账/已平账/复核中。
  ③页面设计：对账表 + 右侧以「AI辅助建议」提示差异归因步骤（克制风格）。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="对账系统" desc="银行 vs 系统 · 差异（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="待调账" hint="有差异" :value="kpi.open" tone="danger" trend="先核对在途" trend-dir="flat" />
        <MedStatCard label="已平账" hint="无差异" :value="kpi.ok" tone="success" trend="可归档" trend-dir="flat" />
        <MedStatCard label="复核中" hint="禁止关闭" :value="kpi.review" tone="warning" trend="保留证据" trend-dir="flat" />
        <MedStatCard label="差异绝对值和(元)" hint="演示汇总" :value="kpi.diffSum" tone="primary" trend="按账期统计" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="对账期间" desc="点击行选中 · 右侧提示差异归因与调账步骤">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: SettleReconRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1020 }"
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
import { seedSettleRecon, settleReconKpis, type SettleReconRow } from '@/mock/financeMocks';

const data = ref(seedSettleRecon());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => settleReconKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `账期 ${r.period}：银行 ${r.bankTotal} 元，系统 ${r.sysTotal} 元，差异 ${r.diffYuan} 元，状态「${r.status}」。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.diffYuan !== 0 ? '有差异：优先核对在途笔数、手续费与退款冲正。' : '无差异：归档对账凭证与导出记录。',
    r.status === '复核中' ? '复核中：禁止关闭账期，待复核结论落地后再处理。' : '调账完成后保留调账依据与审批链路（演示）。',
    'AI 归因仅供参考，以会计裁定为准。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一个账期。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: SettleReconRow) {
  sel.value = r.id;
}

function rowClass(r: SettleReconRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 72 },
  { title: '账期', dataIndex: 'period', width: 110 },
  { title: '银行合计', dataIndex: 'bankTotal', width: 130 },
  { title: '系统合计', dataIndex: 'sysTotal', width: 130 },
  { title: '差异(元)', dataIndex: 'diffYuan', width: 100 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: SettleReconRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '待调账' ? 'red' : record.status === '已平账' ? 'green' : 'orangered';
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

