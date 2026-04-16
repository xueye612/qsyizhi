<!--
  ①模块理解：受体费用汇总住院/门诊等类型，支撑结算对账与争议处理。
  ②行业调研：费用类型、金额、账期、待结/已结/争议状态。
  ③页面设计：费用表 + 右侧以「AI辅助建议」提示争议升级路径（克制风格）。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="受体费用管理" desc="住院 / 门诊 · 账期（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="待结" hint="待处理" :value="kpi.open" tone="danger" trend="优先核对" trend-dir="flat" />
        <MedStatCard label="已结" hint="闭环" :value="kpi.closed" tone="success" trend="可归档" trend-dir="flat" />
        <MedStatCard label="争议" hint="需复核" :value="kpi.dispute" tone="warning" trend="升级路径" trend-dir="flat" />
        <MedStatCard label="金额合计(元)" hint="演示汇总" :value="kpi.sumYuan" tone="primary" trend="按账期统计" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="费用明细" desc="点击行选中 · 右侧提示费用异常与争议处理要点">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: SettleReceiverRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1000 }"
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
import { seedSettleReceiver, settleReceiverKpis, type SettleReceiverRow } from '@/mock/financeMocks';

const data = ref(seedSettleReceiver());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => settleReceiverKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `${r.patientName}（${r.patientId}）${r.feeType} 费用 ${r.amountYuan} 元，账期 ${r.period}，状态「${r.status}」。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.status === '争议' ? '争议：拉通医保办与病区计费双人复核后再改状态。' : '核对 HIS 计费项与路径是否一致。',
    '住院高额费用建议附加病程摘要备查（演示占位）。',
    '最终以医院财务与医保规则为准。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一条费用明细。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: SettleReceiverRow) {
  sel.value = r.id;
}

function rowClass(r: SettleReceiverRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 72 },
  { title: '患者ID', dataIndex: 'patientId', width: 118 },
  { title: '姓名', dataIndex: 'patientName', width: 72 },
  { title: '类型', dataIndex: 'feeType', width: 88 },
  { title: '金额(元)', dataIndex: 'amountYuan', width: 100 },
  { title: '账期', dataIndex: 'period', width: 100 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 88,
    render: ({ record }: { record: SettleReceiverRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '待结' ? 'orangered' : record.status === '已结' ? 'green' : 'red';
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

