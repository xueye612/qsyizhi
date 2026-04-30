<!-- AI 指标解读 -->
<template>
  <MedCrudPage
    title="AI 指标解读"
    desc="化验/参考/AI 摘要 · 待复核 → 已发布 → 已驳回"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="解读列表"
    search-placeholder="患者 / 指标 / 编号"
    create-text="新增解读"
    :scroll-x="1300"
    can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="待复核">待复核</a-option>
        <a-option value="已发布">已发布</a-option>
        <a-option value="已驳回">已驳回</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { aiInterpretKpis, seedAiInterprets, type AiInterpretRow } from '@/mock/aiAssist';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<AiInterpretRow>('ai.interpret', seedAiInterprets);
const filterStatus = ref('all');

const crud = useCrudList<AiInterpretRow>({
  store,
  idPrefix: 'IN',
  searchFields: ['id', 'patientId', 'patientName', 'indicator', 'aiSummary'],
  customFilter: (r) => filterStatus.value === 'all' || r.status === filterStatus.value,
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '指标', key: 'indicator' },
    { title: '数值', key: 'valueText' },
    { title: '参考', key: 'reference' },
    { title: 'AI 摘要', key: 'aiSummary' },
    { title: '状态', key: 'status' },
    { title: '更新时间', key: 'updatedAt' }
  ],
  exportName: 'ai-interpret'
});

const k = computed(() => aiInterpretKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '待复核', value: k.value.pending, tone: 'warning', trend: '医师阅读' },
  { label: '已发布', value: k.value.published, tone: 'success', trend: '可见患者' },
  { label: '已驳回', value: k.value.rejected, tone: 'danger', trend: '调整模板' },
  { label: '需医师重读', value: k.value.needDoctor, tone: 'default', trend: '关键指标' }
]);

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  { key: 'indicator', label: '指标', required: true },
  { key: 'valueText', label: '数值' },
  { key: 'reference', label: '参考' },
  { key: 'aiSummary', label: 'AI 摘要', span: 24, type: 'textarea' },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: ['待复核', '已发布', '已驳回'].map((v) => ({ label: v, value: v }))
  },
  { key: 'updatedAt', label: '更新时间' }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 140 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '指标', dataIndex: 'indicator', width: 140, ellipsis: true, tooltip: true },
  { title: '数值', dataIndex: 'valueText', width: 130 },
  { title: '参考', dataIndex: 'reference', width: 120 },
  { title: 'AI 摘要', dataIndex: 'aiSummary', ellipsis: true, tooltip: true },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: AiInterpretRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '已发布' ? 'green' : record.status === '已驳回' ? 'red' : 'orangered';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '更新时间', dataIndex: 'updatedAt', width: 150 }
];
</script>
<style scoped>.sel{width:130px}</style>
