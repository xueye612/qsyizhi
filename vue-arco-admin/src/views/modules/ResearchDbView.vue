<!-- 科研数据库 -->
<template>
  <MedCrudPage
    title="科研数据库"
    desc="脱敏数据集 · 敏感分级 · 审计追溯"
    :kpis="kpis" :columns="columns" :fields="fields" :crud="crud"
    table-title="数据集列表" search-placeholder="名称 / 编号"
    create-text="新增数据集" :scroll-x="1100" can-view
  >
    <template #filters>
      <a-select v-model="filterSens" class="sel">
        <a-option value="all">全部敏感度</a-option>
        <a-option value="公开">公开</a-option>
        <a-option value="受限">受限</a-option>
        <a-option value="核心">核心</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>
<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { researchDbKpis, seedResearchDb, type ResearchDbRow } from '@/mock/researchMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';
const store = createDemoStore<ResearchDbRow>('research.db', seedResearchDb);
const filterSens = ref('all');
const crud = useCrudList<ResearchDbRow>({
  store, idPrefix: 'RDB', searchFields: ['id', 'name'],
  customFilter: (r) => filterSens.value === 'all' || r.sensitivity === filterSens.value,
  csvColumns: [
    { title: '编号', key: 'id' }, { title: '名称', key: 'name' }, { title: '行数', key: 'rowCount' },
    { title: '敏感度', key: 'sensitivity' }, { title: '上次审计', key: 'lastAudit' }
  ],
  exportName: 'research-db'
});
const k = computed(() => researchDbKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '数据集数', value: k.value.sets, tone: 'primary', trend: '统计入库' },
  { label: '受限/核心', value: k.value.restricted, tone: 'warning', trend: '需审批' },
  { label: '总行数', value: k.value.rowsSum.toLocaleString(), tone: 'success', trend: '规模' },
  { label: '近月审计', value: k.value.recentAudit, tone: 'default', trend: '合规' }
]);
const fields: FieldDef[] = [
  { key: 'name', label: '数据集名', required: true, span: 24 },
  { key: 'rowCount', label: '行数', type: 'number', min: 0 },
  { key: 'sensitivity', label: '敏感度', type: 'select', options: ['公开', '受限', '核心'].map((v) => ({ label: v, value: v })) },
  { key: 'lastAudit', label: '上次审计', type: 'date' }
];
const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 100 },
  { title: '名称', dataIndex: 'name', ellipsis: true, tooltip: true },
  { title: '行数', dataIndex: 'rowCount', width: 130, render: ({ record }: { record: ResearchDbRow }) => record.rowCount.toLocaleString() },
  { title: '敏感度', dataIndex: 'sensitivity', width: 100, render: ({ record }: { record: ResearchDbRow }) => {
    const T = resolveComponent('a-tag') as any;
    const c = record.sensitivity === '核心' ? 'red' : record.sensitivity === '受限' ? 'orangered' : 'green';
    return h(T, { color: c }, () => record.sensitivity);
  } },
  { title: '上次审计', dataIndex: 'lastAudit', width: 120 }
];
</script>
<style scoped>.sel{width:140px}</style>
