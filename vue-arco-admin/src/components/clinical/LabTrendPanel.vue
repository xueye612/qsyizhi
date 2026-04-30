<template>
  <div class="ltp">
    <div class="ltp-toolbar">
      <a-radio-group v-model="range" type="button" size="mini">
        <a-radio value="14">14 天</a-radio>
        <a-radio value="30">30 天</a-radio>
        <a-radio value="90">全程</a-radio>
      </a-radio-group>
      <div class="legends">
        <label v-for="m in metricsList" :key="m.key" class="lg" :style="{ '--lc': m.color }">
          <input type="checkbox" :checked="active[m.key]" @change="toggle(m.key)" />
          <span class="dot" />
          <span>{{ m.label }}</span>
          <small v-if="lastValues[m.key] != null">{{ lastValues[m.key] }}<i>{{ m.unit }}</i></small>
        </label>
      </div>
    </div>
    <div ref="chartRef" class="ltp-chart"></div>
    <div class="ltp-summary">
      <div v-for="m in metricsList" v-show="active[m.key]" :key="m.key" class="sm">
        <span class="sm-name" :style="{ background: m.color + '22', color: m.color }">{{ m.label }}</span>
        <span class="sm-row">
          <i>min</i><b class="c-data">{{ stat(m.key).min }}</b>
          <i>max</i><b class="c-data">{{ stat(m.key).max }}</b>
          <i>均值</i><b class="c-data">{{ stat(m.key).avg }}</b>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import * as echarts from 'echarts';
import type { Patient } from '@/mock/patients';

const props = defineProps<{ patient: Patient; height?: number }>();

type MetricDef = { key: 'scr' | 'egfr' | 'tac' | 'prot' | 'hb' | 'k'; label: string; unit: string; color: string; ref: { low: number; high: number }; axis?: 'right' };
const metricsList: MetricDef[] = [
  { key: 'scr',  label: 'Scr',   unit: 'μmol/L', color: '#1f6feb', ref: { low: 60, high: 110 } },
  { key: 'egfr', label: 'eGFR',  unit: 'ml/min', color: '#13a8a8', ref: { low: 60, high: 120 }, axis: 'right' },
  { key: 'tac',  label: 'Tac',   unit: 'ng/mL',  color: '#722ed1', ref: { low: 5,  high: 10 }, axis: 'right' },
  { key: 'prot', label: '尿蛋白', unit: 'mg/dL', color: '#fa541c', ref: { low: 0,  high: 8 } },
  { key: 'hb',   label: 'Hb',    unit: 'g/L',    color: '#fa8c16', ref: { low: 110, high: 160 } },
  { key: 'k',    label: 'K⁺',    unit: 'mmol/L', color: '#52c41a', ref: { low: 3.5, high: 5.5 }, axis: 'right' }
];

type MetKey = MetricDef['key'];
const active = reactive<Record<MetKey, boolean>>({ scr: true, egfr: true, tac: true, prot: false, hb: false, k: false });
const range = ref<'14' | '30' | '90'>('30');

const labs = computed(() => props.patient.clinical?.labs || []);
const sliced = computed(() => {
  if (range.value === '90') return labs.value;
  const days = range.value === '14' ? 14 : 30;
  return labs.value.filter((p) => {
    const dt = new Date(p.ts).getTime();
    return Date.now() - dt <= days * 86400000;
  });
});

const lastValues = computed(() => {
  const last = labs.value[labs.value.length - 1] as any;
  const out: Record<string, number | undefined> = {};
  for (const m of metricsList) out[m.key] = last?.[m.key];
  return out;
});

function toggle(k: MetKey) { active[k] = !active[k]; }

function stat(k: MetKey) {
  const arr = sliced.value.map((p: any) => p[k]).filter((v: any) => v != null) as number[];
  if (!arr.length) return { min: '—', max: '—', avg: '—' };
  const min = Math.min(...arr), max = Math.max(...arr), avg = arr.reduce((s, n) => s + n, 0) / arr.length;
  const dec = k === 'tac' || k === 'k' ? 1 : 0;
  return { min: min.toFixed(dec), max: max.toFixed(dec), avg: avg.toFixed(dec) };
}

const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

function buildOption() {
  const xs = sliced.value.map((p) => p.ts);
  const series: any[] = metricsList.filter((m) => active[m.key]).map((m) => ({
    name: m.label,
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 5,
    yAxisIndex: m.axis === 'right' ? 1 : 0,
    showSymbol: false,
    emphasis: { focus: 'series' },
    lineStyle: { width: 2, color: m.color },
    itemStyle: { color: m.color },
    areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: m.color + '40' },
      { offset: 1, color: m.color + '00' }
    ]) },
    markLine: m.ref ? {
      silent: true,
      symbol: 'none',
      lineStyle: { color: m.color, type: 'dashed', opacity: .35 },
      data: [{ yAxis: m.ref.high, yAxisIndex: m.axis === 'right' ? 1 : 0 }]
    } : undefined,
    data: sliced.value.map((p: any) => p[m.key])
  }));

  return {
    grid: { left: 36, right: 36, top: 16, bottom: 28 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, backgroundColor: 'rgba(255,255,255,.96)', borderColor: '#e5e8ef', textStyle: { color: '#1f2937', fontSize: 12 } },
    xAxis: { type: 'category', data: xs, boundaryGap: false, axisLine: { lineStyle: { color: '#e5e8ef' } }, axisLabel: { color: '#6b7280', fontSize: 10 }, axisTick: { show: false } },
    yAxis: [
      { type: 'value', scale: true, axisLine: { show: false }, splitLine: { lineStyle: { color: '#eef0f4', type: 'dashed' } }, axisLabel: { color: '#6b7280', fontSize: 10 } },
      { type: 'value', scale: true, axisLine: { show: false }, splitLine: { show: false }, axisLabel: { color: '#6b7280', fontSize: 10 } }
    ],
    series
  };
}

function render() {
  if (!chart) return;
  chart.setOption(buildOption(), true);
}

onMounted(() => {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  render();
  const ro = new ResizeObserver(() => chart?.resize());
  ro.observe(chartRef.value);
  (chart as any)._ro = ro;
});
onBeforeUnmount(() => {
  (chart as any)?._ro?.disconnect?.();
  chart?.dispose();
  chart = null;
});
watch([range, () => ({ ...active }), () => props.patient?.id], render, { deep: true });
</script>

<style scoped>
.ltp {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 10px;
}
.ltp-toolbar { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.legends { display: flex; gap: 10px; flex-wrap: wrap; margin-left: auto; }
.lg {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--c-text-2);
  cursor: pointer; user-select: none;
}
.lg input { display: none; }
.lg .dot { width: 10px; height: 10px; border-radius: 3px; background: var(--lc); display: inline-block; opacity: .35; }
.lg input:checked ~ .dot { opacity: 1; }
.lg input:checked ~ span { color: var(--c-text); font-weight: 600; }
.lg small { color: var(--c-text-3); font-family: ui-monospace, monospace; font-weight: 600; margin-left: 2px; }
.lg small i { font-style: normal; color: var(--c-text-muted); font-weight: 400; margin-left: 1px; }

.ltp-chart { width: 100%; height: 280px; }

.ltp-summary { display: flex; gap: 14px; flex-wrap: wrap; padding-top: 6px; border-top: 1px dashed var(--c-divider); }
.sm { display: inline-flex; gap: 8px; align-items: center; font-size: 12px; }
.sm-name { padding: 2px 8px; border-radius: var(--c-radius-pill); font-size: 11px; font-weight: 600; }
.sm-row { display: inline-flex; gap: 8px; color: var(--c-text-3); align-items: baseline; }
.sm-row i { font-style: normal; color: var(--c-text-muted); font-size: 10px; margin-right: 1px; }
.sm-row b { color: var(--c-text); }
</style>
