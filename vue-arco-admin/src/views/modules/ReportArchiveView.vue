<!-- 数据归档：批次 / 存储分层 / 法律保留（演示） -->
<template>
  <MedCrudPage
    title="数据归档管理"
    desc="季度归档批次 · 热/温/冷分层 · 法律保留与回迁"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="归档批次"
    search-placeholder="批次名 / 编号"
    create-text="新增归档批次"
    :scroll-x="1100"
    can-view
  >
    <template #filters>
      <a-select v-model="filterTier" class="sel">
        <a-option value="all">全部分层</a-option>
        <a-option value="热">热</a-option>
        <a-option value="温">温</a-option>
        <a-option value="冷">冷</a-option>
      </a-select>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="校验中">校验中</a-option>
        <a-option value="已封存">已封存</a-option>
        <a-option value="可回迁">可回迁</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { archiveKpis, seedArchiveRows, type ArchiveRow } from '@/mock/reportTrendArchive';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<ArchiveRow>('report.archive', seedArchiveRows);
const filterTier = ref('all');
const filterStatus = ref('all');

const crud = useCrudList<ArchiveRow>({
  store,
  idPrefix: 'AR',
  searchFields: ['id', 'batchName'],
  customFilter: (r) =>
    (filterTier.value === 'all' || r.storageTier === filterTier.value) &&
    (filterStatus.value === 'all' || r.status === filterStatus.value),
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '批次名', key: 'batchName' },
    { title: '归档日', key: 'archiveDate' },
    { title: '记录数', key: 'recordCount' },
    { title: '分层', key: 'storageTier' },
    { title: '保留(年)', key: 'retentionYears' },
    { title: '法律保留', key: 'legalHold' },
    { title: '状态', key: 'status' }
  ],
  exportName: 'report-archive'
});

const k = computed(() => archiveKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '批次数', value: k.value.batches, tone: 'primary', trend: '总归档批次' },
  { label: '冷存储批次', value: k.value.coldShare, tone: 'default', trend: '低成本' },
  { label: '法律保留', value: k.value.legalHold, tone: 'warning', trend: '不可删除' },
  { label: '校验中', value: k.value.pendingVerify, tone: 'danger', trend: '需关注' }
]);

const fields: FieldDef[] = [
  { key: 'batchName', label: '批次名', required: true, span: 24 },
  { key: 'archiveDate', label: '归档日', type: 'date', required: true },
  { key: 'recordCount', label: '记录数', type: 'number', min: 0 },
  {
    key: 'storageTier',
    label: '分层',
    type: 'select',
    options: ['热', '温', '冷'].map((v) => ({ label: v, value: v }))
  },
  { key: 'retentionYears', label: '保留(年)', type: 'number', min: 1, max: 99 },
  { key: 'legalHold', label: '法律保留', type: 'switch' },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: ['校验中', '已封存', '可回迁'].map((v) => ({ label: v, value: v }))
  }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 150 },
  { title: '批次名', dataIndex: 'batchName', width: 240, ellipsis: true, tooltip: true },
  { title: '归档日', dataIndex: 'archiveDate', width: 110 },
  {
    title: '记录数',
    dataIndex: 'recordCount',
    width: 110,
    render: ({ record }: { record: ArchiveRow }) => record.recordCount.toLocaleString()
  },
  {
    title: '分层',
    dataIndex: 'storageTier',
    width: 80,
    render: ({ record }: { record: ArchiveRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.storageTier === '热' ? 'red' : record.storageTier === '温' ? 'orangered' : 'arcoblue';
      return h(T, { color: c }, () => record.storageTier);
    }
  },
  { title: '保留(年)', dataIndex: 'retentionYears', width: 90 },
  {
    title: '法律保留',
    dataIndex: 'legalHold',
    width: 90,
    render: ({ record }: { record: ArchiveRow }) => (record.legalHold ? '是' : '否')
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: ArchiveRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '已封存' ? 'green' : record.status === '校验中' ? 'orangered' : 'arcoblue';
      return h(T, { color: c }, () => record.status);
    }
  }
];
</script>
<style scoped>.sel{width:130px}</style>
