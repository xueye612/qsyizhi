<!-- 资金流水 -->
<template>
  <MedCrudPage
    title="资金流水"
    desc="入金 / 出金 / 冻结 · 余额追踪"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="流水明细"
    search-placeholder="基金名 / 编号"
    create-text="新增流水"
    :scroll-x="1000"
    can-view
  >
    <template #filters>
      <a-select v-model="filterFlow" class="sel">
        <a-option value="all">全部类型</a-option>
        <a-option value="入金">入金</a-option>
        <a-option value="出金">出金</a-option>
        <a-option value="冻结">冻结</a-option>
      </a-select>
    </template>
    <template #extra>
      <MedPageSection title="入金 vs 出金合计" desc="可切换：当前筛选 / 全部">
        <MedChartCard
          :option="chartOption"
          :height="220"
          title="资金类型合计"
          :ranges="chartRanges"
          v-model:active-range="chartScope"
        />
      </MedPageSection>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedChartCard from '@/components/MedChartCard.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { seedSettleFund, settleFundKpis, type SettleFundRow } from '@/mock/financeMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<SettleFundRow>('settle.fund', seedSettleFund);
const filterFlow = ref('all');

const crud = useCrudList<SettleFundRow>({
  store,
  idPrefix: 'SF',
  searchFields: ['id', 'fundName'],
  customFilter: (r) => filterFlow.value === 'all' || r.flowType === filterFlow.value,
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '基金名', key: 'fundName' },
    { title: '类型', key: 'flowType' },
    { title: '金额(万)', key: 'amountWan' },
    { title: '余额(万)', key: 'balanceWan' },
    { title: '时间', key: 'at' }
  ],
  exportName: 'settle-fund'
});

const k = computed(() => settleFundKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '入金条目', value: k.value.inflow, tone: 'success', trend: '资金注入' },
  { label: '出金条目', value: k.value.outflow, tone: 'warning', trend: '已使用' },
  { label: '冻结条目', value: k.value.frozen, tone: 'danger', trend: '不可动用' },
  { label: '当前余额(万)', value: k.value.lastBalanceWan, tone: 'primary', trend: '末次余额' }
]);

const fields: FieldDef[] = [
  { key: 'fundName', label: '基金名', required: true },
  {
    key: 'flowType',
    label: '类型',
    type: 'select',
    required: true,
    options: ['入金', '出金', '冻结'].map((v) => ({ label: v, value: v }))
  },
  { key: 'amountWan', label: '金额(万)', type: 'number', min: 0, step: 0.1 },
  { key: 'balanceWan', label: '余额(万)', type: 'number', min: 0, step: 0.1 },
  { key: 'at', label: '时间', placeholder: '2026-04-20 09:00' }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 90 },
  { title: '基金名', dataIndex: 'fundName', width: 160 },
  {
    title: '类型',
    dataIndex: 'flowType',
    width: 90,
    render: ({ record }: { record: SettleFundRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.flowType === '入金' ? 'green' : record.flowType === '出金' ? 'orangered' : 'red';
      return h(T, { color: c }, () => record.flowType);
    }
  },
  { title: '金额(万)', dataIndex: 'amountWan', width: 110 },
  { title: '余额(万)', dataIndex: 'balanceWan', width: 110 },
  { title: '时间', dataIndex: 'at', width: 160 }
];

const chartScope = ref<'filtered' | 'all'>('filtered');
const chartRanges = [
  { key: 'filtered', label: '当前筛选' },
  { key: 'all', label: '全部' }
];
const chartOption = computed(() => {
  const rows = chartScope.value === 'all' ? crud.allRows.value : crud.rows.value;
  const inflow = rows.filter((r) => r.flowType === '入金').reduce((s, r) => s + r.amountWan, 0);
  const outflow = rows.filter((r) => r.flowType === '出金').reduce((s, r) => s + r.amountWan, 0);
  const frozen = rows.filter((r) => r.flowType === '冻结').reduce((s, r) => s + r.amountWan, 0);
  return {
    grid: { left: 36, right: 12, top: 24, bottom: 28 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['入金', '出金', '冻结'] },
    yAxis: { type: 'value', axisLabel: { formatter: '{value} 万' } },
    series: [
      {
        type: 'bar',
        data: [
          { value: inflow, itemStyle: { color: '#00B42A' } },
          { value: outflow, itemStyle: { color: '#FF7D00' } },
          { value: frozen, itemStyle: { color: '#F53F3F' } }
        ],
        barWidth: 32
      }
    ]
  };
});
</script>
<style scoped>.sel{width:130px}</style>
