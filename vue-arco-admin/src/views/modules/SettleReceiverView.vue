<!-- 收款核对 -->
<template>
  <MedCrudPage
    title="收款核对"
    desc="患者侧 · 住院/门诊 · 待结/已结/争议"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="收款明细"
    search-placeholder="患者 / 编号"
    create-text="新增收款记录"
    :scroll-x="1100"
    can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="待结">待结</a-option>
        <a-option value="已结">已结</a-option>
        <a-option value="争议">争议</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { seedSettleReceiver, settleReceiverKpis, type SettleReceiverRow } from '@/mock/financeMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<SettleReceiverRow>('settle.receiver', seedSettleReceiver);
const filterStatus = ref('all');

const crud = useCrudList<SettleReceiverRow>({
  store,
  idPrefix: 'SR',
  searchFields: ['id', 'patientId', 'patientName', 'feeType'],
  customFilter: (r) => filterStatus.value === 'all' || r.status === filterStatus.value,
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '费别', key: 'feeType' },
    { title: '金额(元)', key: 'amountYuan' },
    { title: '账期', key: 'period' },
    { title: '状态', key: 'status' }
  ],
  exportName: 'settle-receiver'
});

const k = computed(() => settleReceiverKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '待结', value: k.value.open, tone: 'warning', trend: '催收' },
  { label: '已结', value: k.value.closed, tone: 'success', trend: '完结' },
  { label: '争议', value: k.value.dispute, tone: 'danger', trend: '需处置' },
  { label: '总金额(元)', value: k.value.sumYuan.toLocaleString(), tone: 'primary', trend: '累计' }
]);

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  { key: 'feeType', label: '费别', placeholder: '门诊 / 住院' },
  { key: 'amountYuan', label: '金额(元)', type: 'number', min: 0 },
  { key: 'period', label: '账期', placeholder: '2026-04' },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: ['待结', '已结', '争议'].map((v) => ({ label: v, value: v }))
  }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 100 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '费别', dataIndex: 'feeType', width: 100 },
  {
    title: '金额(元)',
    dataIndex: 'amountYuan',
    width: 130,
    render: ({ record }: { record: SettleReceiverRow }) => record.amountYuan.toLocaleString()
  },
  { title: '账期', dataIndex: 'period', width: 110 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: SettleReceiverRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '已结' ? 'green' : record.status === '争议' ? 'red' : 'orangered';
      return h(T, { color: c }, () => record.status);
    }
  }
];
</script>
<style scoped>.sel{width:130px}</style>
