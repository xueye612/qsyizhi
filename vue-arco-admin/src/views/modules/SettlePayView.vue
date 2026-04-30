<!-- 应付结算 -->
<template>
  <MedCrudPage
    title="应付结算批次"
    desc="批次拨付 · 受益人数 · 处理进度"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="结算批次"
    search-placeholder="批次 / 编号"
    create-text="新建批次"
    :scroll-x="1000"
    can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="待拨付">待拨付</a-option>
        <a-option value="处理中">处理中</a-option>
        <a-option value="已完成">已完成</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { seedSettlePay, settlePayKpis, type SettlePayRow } from '@/mock/financeMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<SettlePayRow>('settle.pay', seedSettlePay);
const filterStatus = ref('all');

const crud = useCrudList<SettlePayRow>({
  store,
  idPrefix: 'SP',
  searchFields: ['id', 'batch'],
  customFilter: (r) => filterStatus.value === 'all' || r.status === filterStatus.value,
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '批次', key: 'batch' },
    { title: '受益人数', key: 'beneficiaries' },
    { title: '金额(万)', key: 'amountWan' },
    { title: '状态', key: 'status' },
    { title: '计划日', key: 'plannedAt' }
  ],
  exportName: 'settle-pay'
});

const k = computed(() => settlePayKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '待拨付', value: k.value.pending, tone: 'warning', trend: '需安排' },
  { label: '处理中', value: k.value.doing, tone: 'primary', trend: '在途' },
  { label: '已完成', value: k.value.done, tone: 'success', trend: '完结' },
  { label: '总金额(万)', value: k.value.sumWan, tone: 'default', trend: '累计' }
]);

const fields: FieldDef[] = [
  { key: 'batch', label: '批次号', required: true, placeholder: 'B-202604-04' },
  { key: 'beneficiaries', label: '受益人数', type: 'number', min: 0 },
  { key: 'amountWan', label: '金额(万)', type: 'number', min: 0, step: 0.1 },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: ['待拨付', '处理中', '已完成'].map((v) => ({ label: v, value: v }))
  },
  { key: 'plannedAt', label: '计划日', type: 'date' }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 90 },
  { title: '批次', dataIndex: 'batch', width: 160 },
  { title: '受益人数', dataIndex: 'beneficiaries', width: 100 },
  { title: '金额(万)', dataIndex: 'amountWan', width: 120 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    render: ({ record }: { record: SettlePayRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '已完成' ? 'green' : record.status === '处理中' ? 'arcoblue' : 'orangered';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '计划日', dataIndex: 'plannedAt', width: 120 }
];
</script>
<style scoped>.sel{width:130px}</style>
