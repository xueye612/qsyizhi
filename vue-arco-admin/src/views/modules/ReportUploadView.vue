<!-- 报告上传：文件队列 / 病毒扫描 / 元信息（演示） -->
<template>
  <MedCrudPage
    title="报告上传中心"
    desc="检验 / 影像 / 病理 / 文书 · 病毒扫描 · 元信息留痕"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="上传队列"
    search-placeholder="患者 / 文件名 / 编号"
    create-text="新增上传记录"
    :scroll-x="1200"
    can-view
  >
    <template #filters>
      <a-select v-model="filterType" class="sel">
        <a-option value="all">全部类型</a-option>
        <a-option value="检验">检验</a-option>
        <a-option value="影像">影像</a-option>
        <a-option value="病理">病理</a-option>
        <a-option value="出院小结">出院小结</a-option>
      </a-select>
      <a-select v-model="filterScan" class="sel">
        <a-option value="all">全部扫描状态</a-option>
        <a-option value="通过">通过</a-option>
        <a-option value="待扫描">待扫描</a-option>
        <a-option value="隔离">隔离</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { reportUploadKpis, seedReportUploads, type ReportUploadRow } from '@/mock/reportCenter';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<ReportUploadRow>('report.upload', seedReportUploads);
const filterType = ref('all');
const filterScan = ref('all');

const crud = useCrudList<ReportUploadRow>({
  store,
  idPrefix: 'UP',
  searchFields: ['id', 'patientId', 'patientName', 'fileName'],
  customFilter: (r) =>
    (filterType.value === 'all' || r.reportType === filterType.value) &&
    (filterScan.value === 'all' || r.virusScan === filterScan.value),
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '类型', key: 'reportType' },
    { title: '文件名', key: 'fileName' },
    { title: '上传人', key: 'uploadBy' },
    { title: '上传时间', key: 'uploadAt' },
    { title: '体积(MB)', key: 'sizeMb' },
    { title: '病毒扫描', key: 'virusScan' }
  ],
  exportName: 'report-uploads'
});

const k = computed(() => reportUploadKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '今日上传', value: k.value.today, tone: 'primary', trend: '当日量' },
  { label: '待扫描/隔离', value: k.value.pendingScan, tone: 'warning', trend: '需排查' },
  { label: '影像类', value: k.value.imaging, tone: 'default', trend: '体积较大' },
  { label: '检验类', value: k.value.lab, tone: 'success', trend: '结构化基础' }
]);

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  {
    key: 'reportType',
    label: '类型',
    type: 'select',
    required: true,
    options: ['检验', '影像', '病理', '出院小结'].map((v) => ({ label: v, value: v }))
  },
  { key: 'fileName', label: '文件名', required: true, span: 24 },
  { key: 'uploadBy', label: '上传人' },
  { key: 'uploadAt', label: '上传时间', placeholder: '2026-04-20 09:00:00' },
  { key: 'sizeMb', label: '体积(MB)', type: 'number', min: 0, step: 0.1 },
  {
    key: 'virusScan',
    label: '病毒扫描',
    type: 'select',
    options: ['通过', '待扫描', '隔离'].map((v) => ({ label: v, value: v }))
  }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 150 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '类型', dataIndex: 'reportType', width: 100 },
  { title: '文件名', dataIndex: 'fileName', width: 220, ellipsis: true, tooltip: true },
  { title: '上传人', dataIndex: 'uploadBy', width: 100 },
  { title: '上传时间', dataIndex: 'uploadAt', width: 165 },
  { title: '体积(MB)', dataIndex: 'sizeMb', width: 95 },
  {
    title: '病毒扫描',
    dataIndex: 'virusScan',
    width: 110,
    render: ({ record }: { record: ReportUploadRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.virusScan === '通过' ? 'green' : record.virusScan === '隔离' ? 'red' : 'orangered';
      return h(T, { color: c }, () => record.virusScan);
    }
  }
];
</script>
<style scoped>.sel{width:140px}</style>
