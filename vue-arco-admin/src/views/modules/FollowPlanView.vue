<!-- 监护计划：路径化随访周期与下次复查日（演示数据） -->
<template>
  <MedCrudPage
    title="监护计划"
    desc="个体化监护与复查节律 · 路径管理 · 下次随访触达"
    :kpis="kpiList"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="计划列表"
    table-desc="按路径分类 · 支持新增 / 编辑 / 删除 / 导出"
    search-placeholder="患者 / 计划名 / 编号"
    create-text="新增计划"
    :scroll-x="1300"
    can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="生效中">生效中</a-option>
        <a-option value="待启动">待启动</a-option>
        <a-option value="已暂停">已暂停</a-option>
        <a-option value="已结束">已结束</a-option>
      </a-select>
      <a-select v-model="filterPathway" class="sel sel-wide">
        <a-option value="all">全部路径</a-option>
        <a-option value="标准移植路径">标准移植路径</a-option>
        <a-option value="高危加强路径">高危加强路径</a-option>
        <a-option value="合并糖尿病路径">合并糖尿病路径</a-option>
      </a-select>
    </template>

    <template #extra>
      <MedPageSection title="计划完成率（近 12 周）" desc="基于演示数据的趋势示意">
        <MedChartCard :option="chartOption" :height="220" />
      </MedPageSection>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedChartCard from '@/components/MedChartCard.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { followPlanKpis, seedFollowPlans, type FollowPlanRow } from '@/mock/followPlan';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<FollowPlanRow>('follow.plan', seedFollowPlans);
const filterStatus = ref<string>('all');
const filterPathway = ref<string>('all');

const crud = useCrudList<FollowPlanRow>({
  store,
  idPrefix: 'PL',
  searchFields: ['id', 'patientId', 'patientName', 'planName'],
  customFilter: (r) => {
    if (filterStatus.value !== 'all' && r.status !== filterStatus.value) return false;
    if (filterPathway.value !== 'all' && r.pathway !== filterPathway.value) return false;
    return true;
  },
  csvColumns: [
    { title: '计划编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '计划名', key: 'planName' },
    { title: '周期', key: 'cycle' },
    { title: '下次随访', key: 'nextReview' },
    { title: '负责人', key: 'owner' },
    { title: '状态', key: 'status' },
    { title: '路径', key: 'pathway' },
    { title: '上次随访', key: 'lastReview' }
  ],
  exportName: 'follow-plans'
});

const kpi = computed(() => followPlanKpis(crud.allRows.value));

const kpiList = computed<KpiDef[]>(() => [
  { label: '生效中计划', hint: '当前活跃', value: kpi.value.active, tone: 'primary', trend: '继续监测' },
  { label: '近期到期', hint: '4-18 前到期', value: kpi.value.dueSoon, tone: 'warning', trend: '注意触达' },
  { label: '高危加强路径', hint: '生效中', value: kpi.value.highPath, tone: 'danger', trend: '优先随访' },
  { label: '待启动计划', hint: '需配置', value: kpi.value.pendingStart, tone: 'default', trend: '及时启动' }
]);

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  { key: 'planName', label: '计划名', required: true, span: 24 },
  { key: 'cycle', label: '周期', placeholder: '如 每 2 周' },
  { key: 'nextReview', label: '下次随访日', type: 'date' },
  { key: 'owner', label: '负责人' },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    required: true,
    options: ['生效中', '待启动', '已暂停', '已结束'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'pathway',
    label: '随访路径',
    type: 'select',
    required: true,
    options: ['标准移植路径', '高危加强路径', '合并糖尿病路径'].map((v) => ({ label: v, value: v }))
  },
  { key: 'lastReview', label: '上次随访' }
];

const columns: TableColumnData[] = [
  { title: '计划编号', dataIndex: 'id', width: 150 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '计划名', dataIndex: 'planName', width: 200, ellipsis: true, tooltip: true },
  { title: '周期', dataIndex: 'cycle', width: 100 },
  { title: '下次随访', dataIndex: 'nextReview', width: 120 },
  { title: '负责人', dataIndex: 'owner', width: 110 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: FollowPlanRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '生效中' ? 'green' : record.status === '待启动' ? 'arcoblue' : record.status === '已暂停' ? 'orangered' : 'gray';
      return h(T, { color: c }, () => record.status);
    }
  },
  {
    title: '路径',
    dataIndex: 'pathway',
    width: 150,
    render: ({ record }: { record: FollowPlanRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.pathway === '高危加强路径' ? 'red' : record.pathway === '合并糖尿病路径' ? 'orange' : 'arcoblue';
      return h(T, { color: c }, () => record.pathway);
    }
  },
  { title: '上次随访', dataIndex: 'lastReview', width: 120 }
];

// 演示用 12 周完成率（基于 seed 数据计算近似值）
const chartOption = computed(() => {
  const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
  const total = crud.allRows.value.length || 1;
  const baseDone = Math.max(1, Math.floor(total * 0.7));
  const data = weeks.map((_, i) => Math.max(0, Math.min(100, Math.round((baseDone / total) * 100 + ((i * 7) % 18) - 8))));
  return {
    grid: { left: 36, right: 12, top: 28, bottom: 28 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: weeks, axisTick: { alignWithLabel: true } },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      {
        name: '完成率',
        type: 'line',
        smooth: true,
        data,
        lineStyle: { color: '#1677FF' },
        areaStyle: { color: 'rgba(22,119,255,0.12)' },
        itemStyle: { color: '#1677FF' }
      }
    ]
  };
});
</script>

<style scoped>
.sel { width: 130px; }
.sel-wide { width: 160px; }
</style>
