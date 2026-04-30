<!-- 报告解析：OCR / 结构化任务（演示） -->
<template>
  <MedCrudPage
    title="报告解析中心"
    desc="OCR / DICOM / 结构化字段抽取 · 状态可追踪"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="解析任务"
    search-placeholder="患者 / 编号 / 来源"
    create-text="新增解析任务"
    :scroll-x="1200"
    can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="待处理">待处理</a-option>
        <a-option value="解析中">解析中</a-option>
        <a-option value="成功">成功</a-option>
        <a-option value="需人工">需人工</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { reportParseKpis, seedReportParse, type ReportParseRow } from '@/mock/reportCenter';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<ReportParseRow>('report.parse', seedReportParse);
const filterStatus = ref('all');
const crud = useCrudList<ReportParseRow>({
  store,
  idPrefix: 'PR',
  searchFields: ['id', 'sourceId', 'patientId', 'patientName', 'modality'],
  customFilter: (r) => filterStatus.value === 'all' || r.ocrStatus === filterStatus.value,
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '来源', key: 'sourceId' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '模态', key: 'modality' },
    { title: '状态', key: 'ocrStatus' },
    { title: '结构化字段', key: 'structFields' },
    { title: '更新时间', key: 'updatedAt' }
  ],
  exportName: 'report-parse'
});

const k = computed(() => reportParseKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '排队/解析中', value: k.value.queue, tone: 'warning', trend: '关注耗时' },
  { label: '解析成功', value: k.value.success, tone: 'success', trend: '可入库' },
  { label: '需人工', value: k.value.manual, tone: 'danger', trend: '复核入口' },
  { label: '已抽取字段数', value: k.value.fields, tone: 'primary', trend: '结构化沉淀' }
]);

const fields: FieldDef[] = [
  { key: 'sourceId', label: '来源单号', required: true },
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  { key: 'modality', label: '模态' },
  {
    key: 'ocrStatus',
    label: '状态',
    type: 'select',
    options: ['待处理', '解析中', '成功', '需人工'].map((v) => ({ label: v, value: v }))
  },
  { key: 'structFields', label: '结构化字段', span: 24, placeholder: 'Scr,eGFR,...' },
  { key: 'updatedAt', label: '更新时间' }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 150 },
  { title: '来源', dataIndex: 'sourceId', width: 150 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '模态', dataIndex: 'modality', width: 130 },
  {
    title: '状态',
    dataIndex: 'ocrStatus',
    width: 110,
    render: ({ record }: { record: ReportParseRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.ocrStatus === '成功' ? 'green' : record.ocrStatus === '需人工' ? 'red' : 'arcoblue';
      return h(T, { color: c }, () => record.ocrStatus);
    }
  },
  { title: '结构化字段', dataIndex: 'structFields', ellipsis: true, tooltip: true },
  { title: '更新时间', dataIndex: 'updatedAt', width: 165 }
];
</script>
<style scoped>.sel{width:140px}</style>
