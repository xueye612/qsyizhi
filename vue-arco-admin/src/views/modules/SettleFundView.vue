<!--
  ①模块理解：资金监管展示专项资金入金、出金与冻结流水及余额快照（演示）。
  ②行业调研：专户名称、流水类型、金额、余额、时间。
  ③页面设计：流水表 + 右侧以「AI辅助建议」提示异常冻结与复核要点（克制风格）。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="资金监管" desc="入金 / 出金 / 冻结 · 余额（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="入金笔数" hint="演示统计" :value="kpi.inflow" tone="success" trend="核对回单" trend-dir="flat" />
        <MedStatCard label="出金笔数" hint="演示统计" :value="kpi.outflow" tone="warning" trend="关注大额" trend-dir="flat" />
        <MedStatCard label="冻结笔数" hint="需复核" :value="kpi.frozen" tone="danger" trend="确认条件" trend-dir="flat" />
        <MedStatCard label="最近余额(万)" hint="末行快照" :value="kpi.lastBalanceWan" tone="primary" trend="按日快照" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="资金流水" desc="点击行选中 · 右侧提示异常冻结与对账要点">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: SettleFundRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 960 }"
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
import { seedSettleFund, settleFundKpis, type SettleFundRow } from '@/mock/financeMocks';

const data = ref(seedSettleFund());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => settleFundKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `专户「${r.fundName}」${r.flowType} ${r.amountWan} 万元，余额约 ${r.balanceWan} 万，时间 ${r.at}。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.flowType === '冻结' ? '冻结流水：确认是否附带司法/风控编号与解冻条件。' : '核对银行回单与系统记账科目是否一致。',
    '连续大额出金建议触发人工复核（演示占位）。',
    '演示数据不构成真实资金建议。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一条资金流水。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: SettleFundRow) {
  sel.value = r.id;
}

function rowClass(r: SettleFundRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 72 },
  { title: '专户', dataIndex: 'fundName', width: 120 },
  {
    title: '类型',
    dataIndex: 'flowType',
    width: 88,
    render: ({ record }: { record: SettleFundRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.flowType === '入金' ? 'green' : record.flowType === '出金' ? 'orangered' : 'red';
      return h(T, { color: c }, () => record.flowType);
    }
  },
  { title: '金额(万)', dataIndex: 'amountWan', width: 100 },
  { title: '余额(万)', dataIndex: 'balanceWan', width: 100 },
  { title: '时间', dataIndex: 'at', width: 145 }
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

