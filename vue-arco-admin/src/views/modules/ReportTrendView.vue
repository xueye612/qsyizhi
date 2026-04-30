<!-- 指标趋势：基线/最新/Δ% / ECharts 趋势曲线 -->
<template>
  <MedCrudPage
    title="指标趋势监测"
    desc="Scr/eGFR/Tac/Hb · 基线对比 · ECharts 趋势曲线"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="趋势记录"
    search-placeholder="患者 / 指标 / 编号"
    create-text="新增趋势记录"
    :scroll-x="1300"
    can-view
  >
    <template #filters>
      <a-select v-model="filterIndicator" class="sel">
        <a-option value="all">全部指标</a-option>
        <a-option value="Scr">Scr</a-option>
        <a-option value="eGFR">eGFR</a-option>
        <a-option value="Tac">Tac</a-option>
        <a-option value="Hb">Hb</a-option>
      </a-select>
      <a-select v-model="filterAlert" class="sel">
        <a-option value="all">全部预警</a-option>
        <a-option value="无">无</a-option>
        <a-option value="关注">关注</a-option>
        <a-option value="预警">预警</a-option>
      </a-select>
    </template>
    <template #extra>
      <MedPageSection :title="`选中：${selName}`" desc="近 4 次实验室结果（基于 seriesHint 拆解）">
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
import { seedTrendRows, trendKpis, type TrendRow } from '@/mock/reportTrendArchive';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<TrendRow>('report.trend', seedTrendRows);
const filterIndicator = ref('all');
const filterAlert = ref('all');

const crud = useCrudList<TrendRow>({
  store,
  idPrefix: 'TR',
  searchFields: ['id', 'patientId', 'patientName', 'indicator'],
  customFilter: (r) =>
    (filterIndicator.value === 'all' || r.indicator === filterIndicator.value) &&
    (filterAlert.value === 'all' || r.alert === filterAlert.value),
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '指标', key: 'indicator' },
    { title: '单位', key: 'unit' },
    { title: '基线', key: 'baseline' },
    { title: '最新', key: 'latest' },
    { title: 'Δ%', key: 'deltaPct' },
    { title: '趋势', key: 'trend' },
    { title: '近4次', key: 'seriesHint' },
    { title: '末次化验', key: 'lastLabDate' },
    { title: '预警', key: 'alert' }
  ],
  exportName: 'report-trend'
});

const k = computed(() => trendKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '监控指标行', value: k.value.monitored, tone: 'primary', trend: '当前样本' },
  { label: '预警条目', value: k.value.warn, tone: 'danger', trend: '需复核' },
  { label: '恶化项目', hint: 'Scr Δ>15% 或 eGFR Δ<-10%', value: k.value.worsen, tone: 'warning', trend: '动态跟进' },
  { label: '记录完整度', value: `${k.value.complete}%`, tone: 'success', trend: '数据治理' }
]);

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  {
    key: 'indicator',
    label: '指标',
    type: 'select',
    required: true,
    options: ['Scr', 'eGFR', 'Tac', 'Hb'].map((v) => ({ label: v, value: v }))
  },
  { key: 'unit', label: '单位' },
  { key: 'baseline', label: '基线', type: 'number' },
  { key: 'latest', label: '最新', type: 'number' },
  { key: 'deltaPct', label: 'Δ%', type: 'number', step: 0.1 },
  {
    key: 'trend',
    label: '趋势',
    type: 'select',
    options: ['上升', '平台', '下降'].map((v) => ({ label: v, value: v }))
  },
  { key: 'seriesHint', label: '近 4 次序列', placeholder: '95→102→110→118', span: 24 },
  { key: 'lastLabDate', label: '末次化验', type: 'date' },
  {
    key: 'alert',
    label: '预警',
    type: 'select',
    options: ['无', '关注', '预警'].map((v) => ({ label: v, value: v }))
  }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 100 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '指标', dataIndex: 'indicator', width: 90 },
  { title: '单位', dataIndex: 'unit', width: 100 },
  { title: '基线', dataIndex: 'baseline', width: 80 },
  { title: '最新', dataIndex: 'latest', width: 80 },
  {
    title: 'Δ%',
    dataIndex: 'deltaPct',
    width: 80,
    render: ({ record }: { record: TrendRow }) => {
      const c = record.deltaPct > 0 ? '#F53F3F' : record.deltaPct < 0 ? '#00B42A' : '#86909C';
      return h('span', { style: { color: c, fontVariantNumeric: 'tabular-nums' } }, `${record.deltaPct > 0 ? '+' : ''}${record.deltaPct}%`);
    }
  },
  { title: '近 4 次', dataIndex: 'seriesHint', ellipsis: true, tooltip: true },
  { title: '末次化验', dataIndex: 'lastLabDate', width: 110 },
  {
    title: '预警',
    dataIndex: 'alert',
    width: 90,
    render: ({ record }: { record: TrendRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.alert === '预警' ? 'red' : record.alert === '关注' ? 'orangered' : 'gray';
      return h(T, { color: c }, () => record.alert);
    }
  }
];

// 选中行 → 折线图数据
const selName = computed(() => (crud.selected.value ? `${crud.selected.value.patientName} · ${crud.selected.value.indicator}` : '—'));
const chartOption = computed(() => {
  const r = crud.selected.value;
  const data = r ? r.seriesHint.split(/[→,\s]+/).map((s) => Number(s)).filter((n) => !Number.isNaN(n)) : [];
  return {
    grid: { left: 36, right: 12, top: 24, bottom: 28 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map((_, i) => `T-${data.length - i}`) },
    yAxis: { type: 'value', scale: true },
    series: [
      {
        type: 'line',
        smooth: true,
        data,
        lineStyle: { color: '#1677FF', width: 2 },
        itemStyle: { color: '#1677FF' },
        areaStyle: { color: 'rgba(22,119,255,0.1)' }
      }
    ]
  };
});
</script>
<style scoped>.sel{width:130px}</style>
