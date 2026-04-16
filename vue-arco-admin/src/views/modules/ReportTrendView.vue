<!--
  ①模块理解：指标趋势页支撑移植后关键检验纵向对比，识别 Scr/eGFR/浓度恶化轨迹。
  ②行业调研：基线值、最近值、变化率、趋势等级、与临床事件关联。
  ③页面设计：KPI 概览 + 趋势明细表；右侧以「AI辅助建议」解释变化率与复查窗口（克制风格）。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="指标趋势监测" desc="关键检验纵向对比 · 变化率 · 分层预警（演示集）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="在监测条目" hint="患者-指标行" :value="kpi.monitored" tone="primary" trend="覆盖关键指标" trend-dir="flat" />
        <MedStatCard label="预警条目" hint="alert=预警" :value="kpi.warn" tone="danger" trend="建议缩短复查" trend-dir="flat" />
        <MedStatCard label="显著恶化" hint="Scr↑>15% 或 eGFR↓>10%" :value="kpi.worsen" tone="danger" trend="优先复核" trend-dir="flat" />
        <MedStatCard label="数据完整度" hint="近30天有值比例" :value="`${kpi.complete}%`" tone="success" trend="缺失会误判" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="趋势明细" desc="点击行选中 · 右侧解读变化率与建议复查窗口">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: TrendRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1200 }"
          @row-click="onRow"
        />
      </MedTableCard>

      <div data-testid="ai-decision" class="ai-col">
        <MedAiSuggest :items="aiSuggestItems" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedPageHeader from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import { seedTrendRows, trendKpis, type TrendRow } from '@/mock/reportTrendArchive';

const data = ref(seedTrendRows());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => trendKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  if (r.indicator === 'Scr' && r.deltaPct > 15) {
    return `Scr 较基线上升 ${r.deltaPct.toFixed(1)}%，序列「${r.seriesHint}」呈持续上扬，需结合尿量与免疫抑制剂浓度排查急性肾损伤与 CNI 毒性。`;
  }
  if (r.indicator === 'eGFR' && r.deltaPct < -10) {
    return `eGFR 较基线下滑 ${Math.abs(r.deltaPct).toFixed(1)}%，提示肾功能储备下降，应核对血压、蛋白尿与感染征象。`;
  }
  return `指标「${r.indicator}」变化率在随访观察区间，建议保持既有复查节律并记录症状。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  const a: string[] = [];
  if (r.alert === '预警') a.push('72 小时内复测同源实验室，避免方法学差导致误判。');
  a.push(`参考序列 ${r.seriesHint}，在时间轴标注用药调整与感染事件（演示）。`);
  return a;
});

const aiSuggestItems = computed(() => {
  const r = cur.value;
  if (!r) return ['请先从左侧选择一条趋势行。', 'AI辅助建议仅供随访流程提示。'];
  return [aiTxt.value, ...aiActs.value, 'AI辅助建议仅供提示，不替代临床判断。'].slice(0, 3);
});

function onRow(r: TrendRow) {
  sel.value = r.id;
}

function rowClass(r: TrendRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: '行ID', dataIndex: 'id', width: 90 },
  { title: '患者ID', dataIndex: 'patientId', width: 118 },
  { title: '姓名', dataIndex: 'patientName', width: 72 },
  {
    title: '指标',
    dataIndex: 'indicator',
    width: 72,
    render: ({ record }: { record: TrendRow }) => {
      const T = resolveComponent('a-tag') as any;
      return h(T, { color: 'arcoblue' }, () => record.indicator);
    }
  },
  { title: '基线', dataIndex: 'baseline', width: 72 },
  { title: '最近', dataIndex: 'latest', width: 72 },
  {
    title: '变化率',
    dataIndex: 'deltaPct',
    width: 88,
    render: ({ record }: { record: TrendRow }) => `${record.deltaPct > 0 ? '+' : ''}${record.deltaPct.toFixed(1)}%`
  },
  {
    title: '趋势',
    dataIndex: 'trend',
    width: 72,
    render: ({ record }: { record: TrendRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.trend === '上升' ? 'red' : record.trend === '下降' ? 'orangered' : 'gray';
      return h(T, { color: c }, () => record.trend);
    }
  },
  { title: '序列(简)', dataIndex: 'seriesHint', ellipsis: true, tooltip: true },
  { title: '末次检验', dataIndex: 'lastLabDate', width: 110 },
  {
    title: '预警',
    dataIndex: 'alert',
    width: 72,
    render: ({ record }: { record: TrendRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.alert === '预警' ? 'red' : record.alert === '关注' ? 'orangered' : 'green';
      return h(T, { color: c }, () => record.alert);
    }
  }
];
</script>

<style scoped>
.med-page{
  box-sizing:border-box;
  padding: var(--med-page-pad);
  display:flex;
  flex-direction:column;
  gap: var(--med-gap);
  min-width:0;
}
.kpi-grid{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--med-gap);
  align-items: stretch;
}
.split{
  display:flex;
  gap: var(--med-gap);
  align-items: stretch;
  min-width:0;
}
.ai-col{
  width: 360px;
  flex-shrink:0;
  display:flex;
}
@media (max-width: 1100px){
  .kpi-grid{grid-template-columns: repeat(2, minmax(0,1fr))}
  .split{flex-direction: column}
  .ai-col{width: 100%}
}

:deep(.row-selected .arco-table-td){
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>

