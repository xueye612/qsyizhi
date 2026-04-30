<!-- 科研统计 -->
<template>
  <MedCrudPage
    title="科研统计"
    desc="分析报告 · 图表类型 · 责任人"
    :kpis="kpis" :columns="columns" :fields="fields" :crud="crud"
    table-title="分析任务" search-placeholder="分析名 / 编号 / 责任人"
    create-text="新增分析" :scroll-x="1100" can-view
  />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { researchStatsKpis, seedResearchStats, type ResearchStatsRow } from '@/mock/researchMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';
const store = createDemoStore<ResearchStatsRow>('research.stats', seedResearchStats);
const crud = useCrudList<ResearchStatsRow>({
  store, idPrefix: 'RST', searchFields: ['id', 'analysis', 'owner'],
  csvColumns: [
    { title: '编号', key: 'id' }, { title: '分析名', key: 'analysis' },
    { title: '图表类型', key: 'chartType' }, { title: '责任人', key: 'owner' }, { title: '更新时间', key: 'refreshedAt' }
  ],
  exportName: 'research-stats'
});
const k = computed(() => researchStatsKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '今日刷新', value: k.value.today, tone: 'primary', trend: '日内更新' },
  { label: 'KM 曲线', value: k.value.km, tone: 'default', trend: '生存分析' },
  { label: '总分析数', value: k.value.reports, tone: 'success', trend: '工作量' },
  { label: '已发布', value: k.value.reports, tone: 'success', trend: '可分享' }
]);
const fields: FieldDef[] = [
  { key: 'analysis', label: '分析名', required: true, span: 24 },
  { key: 'chartType', label: '图表类型', placeholder: '箱线图 / KM 曲线 / 热图' },
  { key: 'owner', label: '责任人' },
  { key: 'refreshedAt', label: '更新时间' }
];
const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 100 },
  { title: '分析名', dataIndex: 'analysis', width: 240 },
  { title: '图表类型', dataIndex: 'chartType', width: 120 },
  { title: '责任人', dataIndex: 'owner', width: 130 },
  { title: '更新时间', dataIndex: 'refreshedAt', width: 160 }
];
</script>
