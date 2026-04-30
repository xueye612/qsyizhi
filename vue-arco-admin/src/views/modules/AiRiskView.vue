<!-- 风险识别 -->
<template>
  <MedCrudPage
    title="风险识别"
    desc="基于规则 + 模型分数的患者风险分层（演示）"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="风险评分"
    search-placeholder="患者 / 因素 / 编号"
    create-text="新增评估"
    :scroll-x="1300"
    can-view
  >
    <template #filters>
      <a-select v-model="filterLevel" class="sel">
        <a-option value="all">全部等级</a-option>
        <a-option value="高">高</a-option>
        <a-option value="中">中</a-option>
        <a-option value="低">低</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { aiRiskKpis, seedAiRiskHits, type AiRiskHit } from '@/mock/aiAssist';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<AiRiskHit>('ai.risk', seedAiRiskHits);
const filterLevel = ref('all');

const crud = useCrudList<AiRiskHit>({
  store,
  idPrefix: 'RK',
  searchFields: ['id', 'patientId', 'patientName', 'factors', 'ruleHits'],
  customFilter: (r) => filterLevel.value === 'all' || r.level === filterLevel.value,
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '分数', key: 'score' },
    { title: '等级', key: 'level' },
    { title: '主要因素', key: 'factors' },
    { title: '命中规则', key: 'ruleHits' },
    { title: '评估时间', key: 'evaluatedAt' },
    { title: '复核人', key: 'reviewer' }
  ],
  exportName: 'ai-risk'
});

const k = computed(() => aiRiskKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '高风险', value: k.value.high, tone: 'danger', trend: '优先随访' },
  { label: '中风险', value: k.value.mid, tone: 'warning', trend: '动态跟踪' },
  { label: '未复核', value: k.value.unreviewed, tone: 'default', trend: '需指派' },
  { label: '平均分', value: k.value.avgScore, tone: 'primary', trend: '0–100' }
]);

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  { key: 'score', label: '分数', type: 'number', min: 0, max: 100 },
  {
    key: 'level',
    label: '等级',
    type: 'select',
    options: ['高', '中', '低'].map((v) => ({ label: v, value: v }))
  },
  { key: 'factors', label: '主要因素', span: 24, type: 'textarea' },
  { key: 'ruleHits', label: '命中规则', span: 24 },
  { key: 'evaluatedAt', label: '评估时间' },
  { key: 'reviewer', label: '复核人' }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 130 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '分数', dataIndex: 'score', width: 80 },
  {
    title: '等级',
    dataIndex: 'level',
    width: 80,
    render: ({ record }: { record: AiRiskHit }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.level === '高' ? 'red' : record.level === '中' ? 'orangered' : 'green';
      return h(T, { color: c }, () => record.level);
    }
  },
  { title: '主要因素', dataIndex: 'factors', ellipsis: true, tooltip: true },
  { title: '命中规则', dataIndex: 'ruleHits', width: 220, ellipsis: true, tooltip: true },
  { title: '评估时间', dataIndex: 'evaluatedAt', width: 150 },
  { title: '复核人', dataIndex: 'reviewer', width: 100 }
];
</script>
<style scoped>.sel{width:130px}</style>
