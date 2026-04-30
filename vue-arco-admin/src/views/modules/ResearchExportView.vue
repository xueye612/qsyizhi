<!-- 导出工具 -->
<template>
  <MedCrudPage
    title="导出工具"
    desc="导出任务 · 水印 · 状态追踪"
    :kpis="kpis" :columns="columns" :fields="fields" :crud="crud"
    table-title="导出任务" search-placeholder="任务号 / 编号"
    create-text="新增导出" :scroll-x="1100" can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="排队">排队</a-option>
        <a-option value="生成中">生成中</a-option>
        <a-option value="可下载">可下载</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>
<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { researchExportKpis, seedResearchExport, type ResearchExportRow } from '@/mock/researchMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';
const store = createDemoStore<ResearchExportRow>('research.export', seedResearchExport);
const filterStatus = ref('all');
const crud = useCrudList<ResearchExportRow>({
  store, idPrefix: 'RE', searchFields: ['id', 'jobId', 'format', 'watermark'],
  customFilter: (r) => filterStatus.value === 'all' || r.status === filterStatus.value,
  csvColumns: [
    { title: '编号', key: 'id' }, { title: '任务号', key: 'jobId' }, { title: '格式', key: 'format' },
    { title: '水印', key: 'watermark' }, { title: '状态', key: 'status' }, { title: '创建时间', key: 'createdAt' }
  ],
  exportName: 'research-export'
});
const k = computed(() => researchExportKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '可下载', value: k.value.ready, tone: 'success', trend: '可分发' },
  { label: '排队/生成中', value: k.value.busy, tone: 'warning', trend: '处理中' },
  { label: '含水印', value: k.value.withWm, tone: 'primary', trend: '可追溯' },
  { label: '总任务', value: k.value.total, tone: 'default', trend: '历史' }
]);
const fields: FieldDef[] = [
  { key: 'jobId', label: '任务号', required: true, placeholder: 'EX-20260420-01' },
  { key: 'format', label: '格式', placeholder: 'CSV / Parquet / SAS7BDAT' },
  { key: 'watermark', label: '水印描述', span: 24 },
  { key: 'status', label: '状态', type: 'select', options: ['排队', '生成中', '可下载'].map((v) => ({ label: v, value: v })) },
  { key: 'createdAt', label: '创建时间' }
];
const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 100 },
  { title: '任务号', dataIndex: 'jobId', width: 170 },
  { title: '格式', dataIndex: 'format', width: 120 },
  { title: '水印', dataIndex: 'watermark', ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'status', width: 100, render: ({ record }: { record: ResearchExportRow }) => {
    const T = resolveComponent('a-tag') as any;
    const c = record.status === '可下载' ? 'green' : record.status === '生成中' ? 'arcoblue' : 'orangered';
    return h(T, { color: c }, () => record.status);
  } },
  { title: '创建时间', dataIndex: 'createdAt', width: 160 }
];
</script>
<style scoped>.sel{width:130px}</style>
