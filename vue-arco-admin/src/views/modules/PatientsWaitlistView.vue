<template>
  <MedCrudPage
    title="等待配型患者"
    desc="等待周期通常 1-2 年 · 半年度复查提醒 · 外院上传与本院结果调取（演示）"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="配型等待队列"
    search-placeholder="姓名 / 患者ID / HLA"
    create-text="新增待配型患者"
    :scroll-x="1300"
    can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="待配型">待配型</a-option>
        <a-option value="配型中">配型中</a-option>
        <a-option value="待复查">待复查</a-option>
        <a-option value="已入组手术">已入组手术</a-option>
      </a-select>
      <a-select v-model="filterRisk" class="sel">
        <a-option value="all">全部风险</a-option>
        <a-option value="高">高</a-option>
        <a-option value="中">中</a-option>
        <a-option value="低">低</a-option>
      </a-select>
      <a-select v-model="filterExternal" class="sel">
        <a-option value="all">外院资料</a-option>
        <a-option value="待上传">待上传</a-option>
        <a-option value="已上传">已上传</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';
import { seedWaitlistPatients, waitlistKpis, type WaitlistPatientRow } from '@/mock/waitlistPatients';

const store = createDemoStore<WaitlistPatientRow>('patients.waitlist', seedWaitlistPatients);
const filterStatus = ref('all');
const filterRisk = ref('all');
const filterExternal = ref('all');

const crud = useCrudList<WaitlistPatientRow>({
  store,
  idPrefix: 'WL',
  searchFields: ['id', 'patientId', 'patientName', 'hla'],
  customFilter: (r) => {
    if (filterStatus.value !== 'all' && r.status !== filterStatus.value) return false;
    if (filterRisk.value !== 'all' && r.riskLevel !== filterRisk.value) return false;
    if (filterExternal.value !== 'all' && r.externalResultStatus !== filterExternal.value) return false;
    return true;
  },
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '血型', key: 'bloodType' },
    { title: 'HLA', key: 'hla' },
    { title: '等待起始', key: 'waitSince' },
    { title: '等待天数', key: 'waitDays' },
    { title: '风险', key: 'riskLevel' },
    { title: '上次复查', key: 'lastReviewAt' },
    { title: '下次复查', key: 'nextReviewAt' },
    { title: '复查周期', key: 'followupCycle' },
    { title: '外院结果', key: 'externalResultStatus' },
    { title: '本院调取', key: 'internalResultStatus' },
    { title: '健康宣教', key: 'educationStatus' },
    { title: '状态', key: 'status' },
    { title: '协调员', key: 'coordinator' }
  ],
  exportName: 'patients-waitlist'
});

const k = computed(() => waitlistKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '总等待人数', value: k.value.total, tone: 'primary', trend: '配型池' },
  { label: '高风险', value: k.value.high, tone: 'danger', trend: '优先随访' },
  { label: '待复查', value: k.value.pendingReview, tone: 'warning', trend: '临期处理' },
  { label: '外院待上传', value: k.value.externalPending, tone: 'warning', trend: '资料补齐' },
  { label: '宣教待完成', value: k.value.educationPending, tone: 'default', trend: '教育跟进' },
  { label: '等待>=180天', value: k.value.longWait, tone: 'default', trend: '关注时长' }
]);

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  {
    key: 'bloodType',
    label: '血型',
    type: 'select',
    required: true,
    options: ['A', 'B', 'AB', 'O'].map((v) => ({ label: v, value: v }))
  },
  { key: 'hla', label: 'HLA摘要', required: true },
  { key: 'waitSince', label: '等待起始日', type: 'date' },
  { key: 'waitDays', label: '等待天数', type: 'number', min: 0 },
  {
    key: 'riskLevel',
    label: '风险',
    type: 'select',
    options: ['高', '中', '低'].map((v) => ({ label: v, value: v }))
  },
  { key: 'lastReviewAt', label: '上次复查日', type: 'date' },
  { key: 'nextReviewAt', label: '下次复查日', type: 'date' },
  {
    key: 'followupCycle',
    label: '复查周期',
    type: 'select',
    options: [{ label: '半年复查', value: '半年复查' }]
  },
  {
    key: 'externalResultStatus',
    label: '外院结果',
    type: 'select',
    options: ['待上传', '已上传'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'internalResultStatus',
    label: '本院调取',
    type: 'select',
    options: ['待调取', '已调取'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'educationStatus',
    label: '健康宣教',
    type: 'select',
    options: ['待完成', '已完成'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: ['待配型', '配型中', '待复查', '已入组手术'].map((v) => ({ label: v, value: v }))
  },
  { key: 'coordinator', label: '协调员' }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 110 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 100 },
  { title: '血型', dataIndex: 'bloodType', width: 80 },
  { title: 'HLA摘要', dataIndex: 'hla', width: 180 },
  { title: '等待起始', dataIndex: 'waitSince', width: 120 },
  { title: '等待天数', dataIndex: 'waitDays', width: 100 },
  {
    title: '风险',
    dataIndex: 'riskLevel',
    width: 90,
    render: ({ record }: { record: WaitlistPatientRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.riskLevel === '高' ? 'red' : record.riskLevel === '中' ? 'orange' : 'green';
      return h(T, { color: c }, () => record.riskLevel);
    }
  },
  { title: '上次复查', dataIndex: 'lastReviewAt', width: 130 },
  { title: '下次复查', dataIndex: 'nextReviewAt', width: 130 },
  { title: '复查周期', dataIndex: 'followupCycle', width: 110 },
  {
    title: '外院结果',
    dataIndex: 'externalResultStatus',
    width: 110,
    render: ({ record }: { record: WaitlistPatientRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.externalResultStatus === '待上传' ? 'orange' : 'green';
      return h(T, { color: c }, () => record.externalResultStatus);
    }
  },
  {
    title: '本院调取',
    dataIndex: 'internalResultStatus',
    width: 110,
    render: ({ record }: { record: WaitlistPatientRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.internalResultStatus === '待调取' ? 'arcoblue' : 'green';
      return h(T, { color: c }, () => record.internalResultStatus);
    }
  },
  {
    title: '健康宣教',
    dataIndex: 'educationStatus',
    width: 110,
    render: ({ record }: { record: WaitlistPatientRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.educationStatus === '待完成' ? 'purple' : 'green';
      return h(T, { color: c }, () => record.educationStatus);
    }
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: ({ record }: { record: WaitlistPatientRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '待复查' ? 'orangered' : record.status === '配型中' ? 'arcoblue' : 'gray';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '协调员', dataIndex: 'coordinator', width: 100 }
];
</script>

<style scoped>
.sel { width: 140px; }
</style>
