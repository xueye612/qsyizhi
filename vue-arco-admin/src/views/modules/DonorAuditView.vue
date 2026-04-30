<!-- 供体审核流程 -->
<template>
  <MedCrudPage
    title="供体审核流程"
    desc="伦理 / 医学评估 / 感染会诊 · 节点状态"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="审核节点"
    search-placeholder="供体 / 节点 / 责任人"
    create-text="新增审核节点"
    :scroll-x="1100"
    can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="进行中">进行中</a-option>
        <a-option value="已通过">已通过</a-option>
        <a-option value="阻塞">阻塞</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { donorAuditKpis, seedDonorAudit, type DonorAuditRow } from '@/mock/donorOps';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<DonorAuditRow>('donor.audit', seedDonorAudit);
const filterStatus = ref('all');

const crud = useCrudList<DonorAuditRow>({
  store,
  idPrefix: 'DA',
  searchFields: ['id', 'donorCode', 'stage', 'owner'],
  customFilter: (r) => filterStatus.value === 'all' || r.status === filterStatus.value,
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '供体编码', key: 'donorCode' },
    { title: '节点', key: 'stage' },
    { title: '责任人', key: 'owner' },
    { title: '截止', key: 'dueAt' },
    { title: '状态', key: 'status' }
  ],
  exportName: 'donor-audit'
});

const k = computed(() => donorAuditKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '进行中', value: k.value.ing, tone: 'primary', trend: '推进中' },
  { label: '已通过', value: k.value.pass, tone: 'success', trend: '可流转' },
  { label: '阻塞', value: k.value.block, tone: 'danger', trend: '需处置' },
  { label: '近 2 日到期', value: k.value.dueSoon, tone: 'warning', trend: '注意 SLA' }
]);

const fields: FieldDef[] = [
  { key: 'donorCode', label: '供体编码', required: true },
  { key: 'stage', label: '节点', required: true, placeholder: '伦理初审 / 医学评估 / 感染科会诊' },
  { key: 'owner', label: '责任人' },
  { key: 'dueAt', label: '截止', placeholder: '2026-04-20 18:00' },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: ['进行中', '已通过', '阻塞'].map((v) => ({ label: v, value: v }))
  }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 100 },
  { title: '供体编码', dataIndex: 'donorCode', width: 150 },
  { title: '节点', dataIndex: 'stage', width: 180 },
  { title: '责任人', dataIndex: 'owner', width: 150 },
  { title: '截止', dataIndex: 'dueAt', width: 170 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: DonorAuditRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '已通过' ? 'green' : record.status === '阻塞' ? 'red' : 'arcoblue';
      return h(T, { color: c }, () => record.status);
    }
  }
];
</script>
<style scoped>.sel{width:130px}</style>
