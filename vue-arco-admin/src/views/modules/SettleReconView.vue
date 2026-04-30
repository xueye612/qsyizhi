<!-- 对账管理 -->
<template>
  <MedCrudPage
    title="对账管理"
    desc="期间银行总额 vs 系统总额 · 差异调账"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="对账期间"
    search-placeholder="期间 / 编号"
    create-text="新增对账期"
    :scroll-x="1100"
    can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="待调账">待调账</a-option>
        <a-option value="已平账">已平账</a-option>
        <a-option value="复核中">复核中</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { seedSettleRecon, settleReconKpis, type SettleReconRow } from '@/mock/financeMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<SettleReconRow>('settle.recon', seedSettleRecon);
const filterStatus = ref('all');

const crud = useCrudList<SettleReconRow>({
  store,
  idPrefix: 'RC',
  searchFields: ['id', 'period'],
  customFilter: (r) => filterStatus.value === 'all' || r.status === filterStatus.value,
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '期间', key: 'period' },
    { title: '银行总额', key: 'bankTotal' },
    { title: '系统总额', key: 'sysTotal' },
    { title: '差异(元)', key: 'diffYuan' },
    { title: '状态', key: 'status' }
  ],
  exportName: 'settle-recon'
});

const k = computed(() => settleReconKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '待调账', value: k.value.open, tone: 'warning', trend: '需对齐' },
  { label: '已平账', value: k.value.ok, tone: 'success', trend: '完结' },
  { label: '复核中', value: k.value.review, tone: 'primary', trend: '财务复核' },
  { label: '差异合计(元)', value: k.value.diffSum.toLocaleString(), tone: 'danger', trend: '|差额|累计' }
]);

const fields: FieldDef[] = [
  { key: 'period', label: '期间', required: true, placeholder: '2026-04-上' },
  { key: 'bankTotal', label: '银行总额', placeholder: '1,204,300.00' },
  { key: 'sysTotal', label: '系统总额', placeholder: '1,204,180.00' },
  { key: 'diffYuan', label: '差异(元)', type: 'number', step: 0.01 },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: ['待调账', '已平账', '复核中'].map((v) => ({ label: v, value: v }))
  }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 90 },
  { title: '期间', dataIndex: 'period', width: 120 },
  { title: '银行总额', dataIndex: 'bankTotal', width: 160 },
  { title: '系统总额', dataIndex: 'sysTotal', width: 160 },
  {
    title: '差异(元)',
    dataIndex: 'diffYuan',
    width: 120,
    render: ({ record }: { record: SettleReconRow }) =>
      h('span', { style: { color: record.diffYuan === 0 ? '#00B42A' : '#F53F3F', fontVariantNumeric: 'tabular-nums' } }, record.diffYuan.toLocaleString())
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: SettleReconRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '已平账' ? 'green' : record.status === '复核中' ? 'arcoblue' : 'orangered';
      return h(T, { color: c }, () => record.status);
    }
  }
];
</script>
<style scoped>.sel{width:130px}</style>
