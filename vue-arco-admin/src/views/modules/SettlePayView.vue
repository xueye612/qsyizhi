<!--
  ①模块理解：抚恤金支付批次管理受益人数、金额与拨付状态，满足结算合规。
  ②行业调研：批次号、人数、金额（万元）、计划日期、状态。
  ③页面设计：批次表 + 右侧以「AI辅助建议」提示拨付复核与双签（克制风格）。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="抚恤金支付" desc="批次 · 受益人 · 金额（万元）（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="待拨付" hint="需复核" :value="kpi.pending" tone="danger" trend="拨付前校验" trend-dir="flat" />
        <MedStatCard label="处理中" hint="在途" :value="kpi.doing" tone="warning" trend="保留凭证" trend-dir="flat" />
        <MedStatCard label="已完成" hint="闭环" :value="kpi.done" tone="success" trend="可归档" trend-dir="flat" />
        <MedStatCard label="批次金额合计" hint="万元" :value="kpi.sumWan" tone="primary" trend="按批次统计" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="支付批次" desc="点击行选中 · 右侧提示拨付前核对清单">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: SettlePayRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 920 }"
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
import { seedSettlePay, settlePayKpis, type SettlePayRow } from '@/mock/financeMocks';

const data = ref(seedSettlePay());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => settlePayKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `批次 ${r.batch}：${r.beneficiaries} 人，合计约 ${r.amountWan} 万元，状态「${r.status}」，计划日 ${r.plannedAt}。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.status === '待拨付' ? '待拨付：确认受益人名单与银行账户二次校验已完成。' : '处理中/完成：保留审批链路与凭证编号。',
    '大额拨付建议触发财务双签（演示占位）。',
    'AI 仅辅助核对展示字段，最终以财务系统为准。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一条支付批次。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: SettlePayRow) {
  sel.value = r.id;
}

function rowClass(r: SettlePayRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 72 },
  { title: '批次', dataIndex: 'batch', width: 130 },
  { title: '受益人', dataIndex: 'beneficiaries', width: 88 },
  { title: '金额(万)', dataIndex: 'amountWan', width: 100 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: SettlePayRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '待拨付' ? 'red' : record.status === '处理中' ? 'orangered' : 'green';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '计划日', dataIndex: 'plannedAt', width: 120 }
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

