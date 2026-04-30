<!-- AI 干预记录 -->
<template>
  <MedCrudPage
    title="AI 干预记录"
    desc="情境 / AI 建议 / 临床决策（采纳/部分采纳/未采纳）"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="干预条目"
    search-placeholder="患者 / 情境 / 编号"
    create-text="新增干预"
    :scroll-x="1400"
    can-view
  >
    <template #filters>
      <a-select v-model="filterAdopted" class="sel">
        <a-option value="all">全部决策</a-option>
        <a-option value="采纳">采纳</a-option>
        <a-option value="部分采纳">部分采纳</a-option>
        <a-option value="未采纳">未采纳</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { aiInterveneKpis, seedAiIntervenes, type AiInterveneRow } from '@/mock/aiAssist';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<AiInterveneRow>('ai.intervene', seedAiIntervenes);
const filterAdopted = ref('all');

const crud = useCrudList<AiInterveneRow>({
  store,
  idPrefix: 'IV',
  searchFields: ['id', 'patientId', 'patientName', 'context', 'aiProposal'],
  customFilter: (r) => filterAdopted.value === 'all' || r.adopted === filterAdopted.value,
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '情境', key: 'context' },
    { title: 'AI 建议', key: 'aiProposal' },
    { title: '决策', key: 'adopted' },
    { title: '复核人', key: 'reviewer' },
    { title: '决策时间', key: 'decidedAt' }
  ],
  exportName: 'ai-intervene'
});

const k = computed(() => aiInterveneKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '采纳', value: k.value.full, tone: 'success', trend: '完全执行' },
  { label: '部分采纳', value: k.value.partial, tone: 'warning', trend: '调整后执行' },
  { label: '未采纳', value: k.value.none, tone: 'danger', trend: '需复盘' },
  { label: '今日条目', value: k.value.recent, tone: 'primary', trend: '近 24h' }
]);

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  { key: 'context', label: '情境', span: 24 },
  { key: 'aiProposal', label: 'AI 建议', span: 24, type: 'textarea' },
  {
    key: 'adopted',
    label: '决策',
    type: 'select',
    options: ['采纳', '部分采纳', '未采纳'].map((v) => ({ label: v, value: v }))
  },
  { key: 'reviewer', label: '复核人' },
  { key: 'decidedAt', label: '决策时间' }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 130 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '情境', dataIndex: 'context', width: 200, ellipsis: true, tooltip: true },
  { title: 'AI 建议', dataIndex: 'aiProposal', ellipsis: true, tooltip: true },
  {
    title: '决策',
    dataIndex: 'adopted',
    width: 110,
    render: ({ record }: { record: AiInterveneRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.adopted === '采纳' ? 'green' : record.adopted === '部分采纳' ? 'orangered' : 'red';
      return h(T, { color: c }, () => record.adopted);
    }
  },
  { title: '复核人', dataIndex: 'reviewer', width: 90 },
  { title: '决策时间', dataIndex: 'decidedAt', width: 150 }
];
</script>
<style scoped>.sel{width:130px}</style>
