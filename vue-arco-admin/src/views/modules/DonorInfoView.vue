<!-- 供体信息 -->
<template>
  <MedCrudPage
    title="供体信息管理"
    desc="DCD/活体 · HLA · CMV · 审核状态（演示）"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="供体列表"
    search-placeholder="编码 / HLA / 备注"
    create-text="新增供体"
    :scroll-x="1300"
    can-view
  >
    <template #filters>
      <a-select v-model="filterSource" class="sel">
        <a-option value="all">全部来源</a-option>
        <a-option value="DCD">DCD</a-option>
        <a-option value="活体">活体</a-option>
      </a-select>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部审核</a-option>
        <a-option value="待审">待审</a-option>
        <a-option value="已通过">已通过</a-option>
        <a-option value="已拒绝">已拒绝</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { seedDonors, type Donor } from '@/mock/donors';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<Donor>('donor.info', seedDonors);
const filterSource = ref('all');
const filterStatus = ref('all');

const crud = useCrudList<Donor>({
  store,
  idPrefix: 'donor',
  searchFields: ['id', 'code', 'hla', 'note'],
  customFilter: (r) =>
    (filterSource.value === 'all' || r.source === filterSource.value) &&
    (filterStatus.value === 'all' || r.status === filterStatus.value),
  csvColumns: [
    { title: 'ID', key: 'id' },
    { title: '供体编码', key: 'code' },
    { title: '来源', key: 'source' },
    { title: '血型', key: 'blood' },
    { title: '年龄', key: 'age' },
    { title: 'HLA', key: 'hla' },
    { title: 'CMV', key: 'cmv' },
    { title: '审核状态', key: 'status' },
    { title: '更新时间', key: 'updatedAt' },
    { title: '备注', key: 'note' }
  ],
  exportName: 'donors'
});

const kpis = computed<KpiDef[]>(() => {
  const rows = crud.allRows.value;
  const dcd = rows.filter((r) => r.source === 'DCD').length;
  const live = rows.filter((r) => r.source === '活体').length;
  const pending = rows.filter((r) => r.status === '待审').length;
  const approved = rows.filter((r) => r.status === '已通过').length;
  return [
    { label: 'DCD 来源', value: dcd, tone: 'primary', trend: '脑死亡捐献' },
    { label: '活体来源', value: live, tone: 'success', trend: '亲属/配偶' },
    { label: '待审核', value: pending, tone: 'warning', trend: '伦理/医学评估' },
    { label: '已通过', value: approved, tone: 'success', trend: '可用入库' }
  ];
});

const fields: FieldDef[] = [
  { key: 'code', label: '供体编码', required: true },
  {
    key: 'source',
    label: '来源',
    type: 'select',
    required: true,
    options: ['DCD', '活体'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'blood',
    label: '血型',
    type: 'select',
    options: ['A', 'B', 'O', 'AB'].map((v) => ({ label: v, value: v }))
  },
  { key: 'age', label: '年龄', type: 'number', min: 0, max: 100 },
  { key: 'hla', label: 'HLA 配型', span: 24 },
  {
    key: 'cmv',
    label: 'CMV',
    type: 'select',
    options: ['阴性', '阳性', '未知'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'status',
    label: '审核状态',
    type: 'select',
    options: ['待审', '已通过', '已拒绝'].map((v) => ({ label: v, value: v }))
  },
  { key: 'note', label: '备注', span: 24, type: 'textarea' }
];

const columns: TableColumnData[] = [
  { title: '供体编码', dataIndex: 'code', width: 150 },
  {
    title: '来源',
    dataIndex: 'source',
    width: 80,
    render: ({ record }: { record: Donor }) => {
      const T = resolveComponent('a-tag') as any;
      return h(T, { color: record.source === 'DCD' ? 'arcoblue' : 'green' }, () => record.source);
    }
  },
  { title: '血型', dataIndex: 'blood', width: 70 },
  { title: '年龄', dataIndex: 'age', width: 70 },
  { title: 'HLA', dataIndex: 'hla', ellipsis: true, tooltip: true },
  { title: 'CMV', dataIndex: 'cmv', width: 80 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: Donor }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '已通过' ? 'green' : record.status === '已拒绝' ? 'red' : 'orangered';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '备注', dataIndex: 'note', width: 220, ellipsis: true, tooltip: true }
];
</script>
<style scoped>.sel{width:130px}</style>
