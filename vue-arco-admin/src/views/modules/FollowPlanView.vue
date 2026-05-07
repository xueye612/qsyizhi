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
    <template #drawer-view="{ record }">
      <div class="detail" v-if="record">
        <div class="detail__head">
          <div>
            <div class="detail__title">{{ record.planName }}</div>
            <div class="detail__meta">{{ record.patientName }}（{{ record.patientId }}）· 负责人 {{ record.owner }}</div>
          </div>
          <a-tag :color="record.status === '生效中' ? 'green' : record.status === '待启动' ? 'arcoblue' : record.status === '已暂停' ? 'orangered' : 'gray'">{{ record.status }}</a-tag>
        </div>

        <div class="detail__grid">
          <div class="detail__card">
            <div class="detail__card-title">计划信息</div>
            <div class="detail__line">计划编号：{{ record.id }}</div>
            <div class="detail__line">随访路径：{{ record.pathway }}</div>
            <div class="detail__line">随访周期：{{ record.cycle }}</div>
          </div>
          <div class="detail__card">
            <div class="detail__card-title">节点信息</div>
            <div class="detail__line">上次随访：{{ record.lastReview }}</div>
            <div class="detail__line">下次随访：{{ record.nextReview }}</div>
            <div class="detail__line">当前状态：{{ record.status }}</div>
          </div>
        </div>
      </div>
    </template>

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
      <MedPageSection title="计划完成率趋势" desc="右上可切换窗口：4 / 8 / 12 周">
        <MedChartCard
          :option="chartOption"
          :height="220"
          title="完成率"
          :ranges="chartRanges"
          v-model:active-range="chartRange"
        />
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

// 演示用完成率（可切换 4/8/12 周窗口）
const chartRange = ref<'4w' | '8w' | '12w'>('12w');
const chartRanges = [
  { key: '4w', label: '4周' },
  { key: '8w', label: '8周' },
  { key: '12w', label: '12周' }
];
const chartOption = computed(() => {
  const wks = chartRange.value === '4w' ? 4 : chartRange.value === '8w' ? 8 : 12;
  const weeks = Array.from({ length: wks }, (_, i) => `W${i + 1}`);
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

.detail { display: grid; gap: 10px; }
.detail__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f4f8ff 0%, #ecf3ff 100%);
  border: 1px solid #dbe7ff;
}
.detail__title { font-size: 14px; font-weight: 700; color: #1d2129; }
.detail__meta { margin-top: 4px; font-size: 12px; color: #4e5969; }
.detail__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.detail__card { padding: 10px; border-radius: 10px; border: 1px solid #e5e6eb; background: #fff; }
.detail__card-title { font-size: 12px; font-weight: 700; color: #1d2129; margin-bottom: 8px; }
.detail__line { font-size: 12px; color: #4e5969; line-height: 1.7; }
@media (max-width: 720px) {
  .detail__grid { grid-template-columns: 1fr; }
}
</style>
