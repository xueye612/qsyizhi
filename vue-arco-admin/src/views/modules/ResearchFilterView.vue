<!-- 条件筛选 -->
<template>
  <MedCrudPage
    title="条件筛选 / 队列构建"
    desc="入排标准 · n 值 · 更新时间"
    :kpis="kpis" :columns="columns" :fields="fields" :crud="crud"
    table-title="队列定义" search-placeholder="队列名 / 编号 / 标准"
    create-text="新增队列" :scroll-x="1100" can-view
  />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { researchFilterKpis, seedResearchFilter, type ResearchFilterRow } from '@/mock/researchMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';
const store = createDemoStore<ResearchFilterRow>('research.filter', seedResearchFilter);
const crud = useCrudList<ResearchFilterRow>({
  store, idPrefix: 'RF', searchFields: ['id', 'cohortName', 'inclusion'],
  csvColumns: [
    { title: '编号', key: 'id' }, { title: '队列名', key: 'cohortName' },
    { title: '入排标准', key: 'inclusion' }, { title: '样本数', key: 'n' }, { title: '更新时间', key: 'updatedAt' }
  ],
  exportName: 'research-filter'
});
const k = computed(() => researchFilterKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '队列数', value: k.value.cohorts, tone: 'primary', trend: '入库定义' },
  { label: '总样本量', value: k.value.nSum.toLocaleString(), tone: 'success', trend: 'Σ n' },
  { label: '大队列(≥200)', value: k.value.large, tone: 'default', trend: '可独立分析' },
  { label: '近期更新', value: k.value.fresh, tone: 'warning', trend: '4-15 起' }
]);
const fields: FieldDef[] = [
  { key: 'cohortName', label: '队列名', required: true, span: 24 },
  { key: 'inclusion', label: '入排标准', span: 24, type: 'textarea' },
  { key: 'n', label: '样本数', type: 'number', min: 0 },
  { key: 'updatedAt', label: '更新时间', type: 'date' }
];
const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 100 },
  { title: '队列名', dataIndex: 'cohortName', width: 200 },
  { title: '入排标准', dataIndex: 'inclusion', ellipsis: true, tooltip: true },
  { title: '样本数', dataIndex: 'n', width: 100 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 120 }
];
</script>
