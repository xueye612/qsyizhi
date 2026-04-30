<!-- 问卷工具 -->
<template>
  <MedCrudPage
    title="问卷工具"
    desc="患者问卷 · 应答率 · 状态追踪"
    :kpis="kpis" :columns="columns" :fields="fields" :crud="crud"
    table-title="问卷列表" search-placeholder="标题 / 编号"
    create-text="新建问卷" :scroll-x="1000" can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="收集中">收集中</a-option>
        <a-option value="分析中">分析中</a-option>
        <a-option value="已关闭">已关闭</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>
<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { researchSurveyKpis, seedResearchSurvey, type ResearchSurveyRow } from '@/mock/researchMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';
const store = createDemoStore<ResearchSurveyRow>('research.survey', seedResearchSurvey);
const filterStatus = ref('all');
const crud = useCrudList<ResearchSurveyRow>({
  store, idPrefix: 'RS', searchFields: ['id', 'title'],
  customFilter: (r) => filterStatus.value === 'all' || r.status === filterStatus.value,
  csvColumns: [
    { title: '编号', key: 'id' }, { title: '标题', key: 'title' },
    { title: '发放数', key: 'sent' }, { title: '应答率', key: 'responseRate' }, { title: '状态', key: 'status' }
  ],
  exportName: 'research-survey'
});
const k = computed(() => researchSurveyKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '收集中', value: k.value.collecting, tone: 'primary', trend: '正在采集' },
  { label: '平均应答率', value: `${k.value.avgRatePct}%`, tone: 'success', trend: '人群参与' },
  { label: '低应答(<60%)', value: k.value.low, tone: 'warning', trend: '需催办' },
  { label: '总问卷', value: k.value.total, tone: 'default', trend: '工具数量' }
]);
const fields: FieldDef[] = [
  { key: 'title', label: '问卷标题', required: true, span: 24 },
  { key: 'sent', label: '发放数', type: 'number', min: 0 },
  { key: 'responseRate', label: '应答率', type: 'number', min: 0, max: 1, step: 0.01, placeholder: '0.62' },
  { key: 'status', label: '状态', type: 'select', options: ['收集中', '分析中', '已关闭'].map((v) => ({ label: v, value: v })) }
];
const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 100 },
  { title: '标题', dataIndex: 'title', width: 240 },
  { title: '发放数', dataIndex: 'sent', width: 100 },
  { title: '应答率', dataIndex: 'responseRate', width: 100, render: ({ record }: { record: ResearchSurveyRow }) => `${Math.round(record.responseRate * 100)}%` },
  { title: '状态', dataIndex: 'status', width: 110, render: ({ record }: { record: ResearchSurveyRow }) => {
    const T = resolveComponent('a-tag') as any;
    const c = record.status === '收集中' ? 'arcoblue' : record.status === '分析中' ? 'orangered' : 'gray';
    return h(T, { color: c }, () => record.status);
  } }
];
</script>
<style scoped>.sel{width:130px}</style>
