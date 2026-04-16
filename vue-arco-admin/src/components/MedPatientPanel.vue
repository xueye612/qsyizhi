<template>
  <div class="panel">
    <a-card :bordered="false" class="card">
      <div class="hero">
        <a-avatar :size="40" class="av">{{ patient.name.slice(0, 1) }}</a-avatar>
        <div class="hero-mid">
          <div class="name">{{ patient.name }} <span class="pid">{{ patient.id }}</span></div>
          <div class="meta">
            {{ patient.sex }} · {{ patient.age }} 岁
            <span v-if="patient.status"> · {{ patient.status }}</span>
          </div>
        </div>
        <RiskTag :level="riskLevel" compact />
      </div>

      <a-collapse :default-active-key="['risk', 'labs']" :bordered="false" class="collapse">
        <a-collapse-item key="risk" header="风险总览">
          <ul class="reasons">
            <li v-for="(r, i) in visibleReasons" :key="i">{{ r }}</li>
          </ul>
          <a-button
            v-if="patient.riskReasons.length > reasonLimit"
            type="text"
            size="mini"
            class="more-btn"
            @click="reasonExpanded = !reasonExpanded"
          >
            {{ reasonExpanded ? '收起' : `还有 ${patient.riskReasons.length - reasonLimit} 条…` }}
          </a-button>
        </a-collapse-item>

        <a-collapse-item key="labs" header="实验室趋势">
          <a-tabs v-model:active-key="labTab" type="rounded" size="small" class="lab-tabs">
            <a-tab-pane key="scr" title="Scr" />
            <a-tab-pane key="egfr" title="eGFR" />
            <a-tab-pane key="tac" title="Tac" />
          </a-tabs>
          <div ref="chartRef" class="chart-one" />
        </a-collapse-item>

        <a-collapse-item key="meds" header="当前用药">
          <ul class="meds">
            <li v-for="(m, i) in patient.meds" :key="i" :class="{ anomaly: m.anomaly }">
              <span class="mn">{{ m.name }}</span>
              <span class="md">{{ m.dose }}</span>
              <span v-if="m.anomaly" class="bad">异常</span>
              <div v-if="m.reason" class="mr">{{ m.reason }}</div>
            </li>
          </ul>
        </a-collapse-item>

        <a-collapse-item key="care" header="监护执行率">
          <div class="bars">
            <div class="bar-row">
              <span class="bl">用药依从</span>
              <a-progress :percent="patient.compliance.medication" :stroke-width="8" color="#165dff" />
            </div>
            <div class="bar-row">
              <span class="bl">饮食方案</span>
              <a-progress :percent="patient.compliance.diet" :stroke-width="8" color="#00b42a" />
            </div>
            <div class="bar-row">
              <span class="bl">运动康复</span>
              <a-progress :percent="patient.compliance.exercise" :stroke-width="8" color="#ff7d00" />
            </div>
          </div>
        </a-collapse-item>
      </a-collapse>

      <div v-if="activeTask" class="task-foot">
        <div class="task-foot-t">{{ activeTask.title }}</div>
        <div class="task-foot-a">
          <a-button
            type="primary"
            size="small"
            class="btn-pri"
            :disabled="activeTask.state !== 'todo'"
            @click="emit('markDone')"
          >
            标记完成
          </a-button>
          <a-button size="small" @click="emit('openDetail')">详情</a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import type { WorkbenchPatient, WorkbenchTask } from '@/mock/workbenchData';
import RiskTag from '@/components/RiskTag.vue';

const props = defineProps<{
  patient: WorkbenchPatient;
  riskLevel: 'high' | 'mid' | 'low';
  activeTask?: WorkbenchTask | null;
}>();

const emit = defineEmits<{
  (e: 'markDone'): void;
  (e: 'openDetail'): void;
}>();

const reasonLimit = 3;
const reasonExpanded = ref(false);
const visibleReasons = computed(() =>
  reasonExpanded.value ? props.patient.riskReasons : props.patient.riskReasons.slice(0, reasonLimit)
);

type LabKey = 'scr' | 'egfr' | 'tac';
const labTab = ref<LabKey>('scr');
const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

const seriesMeta: Record<
  LabKey,
  {
    name: string;
    color: string;
    fill: string;
    pick: (x: { scr?: number | null; egfr?: number | null; tac?: number | null }) => number | null;
  }
> = {
  scr: {
    name: 'Scr',
    color: '#f53f3f',
    fill: 'rgba(245,63,63,0.08)',
    pick: (x) => x.scr ?? null
  },
  egfr: {
    name: 'eGFR',
    color: '#165dff',
    fill: 'rgba(22,93,255,0.08)',
    pick: (x) => x.egfr ?? null
  },
  tac: {
    name: 'Tac',
    color: '#722ed1',
    fill: 'rgba(114,46,209,0.08)',
    pick: (x) => x.tac ?? null
  }
};

function buildOption(p: WorkbenchPatient, tab: LabKey) {
  const labs = p.records?.labs || [];
  const dates = labs.map((x) => x.ts.slice(5));
  const meta = seriesMeta[tab];
  const data = labs.map((x) => meta.pick(x));

  return {
    animationDuration: 200,
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 16, top: 28, bottom: 28 },
    xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', name: meta.name, nameTextStyle: { fontSize: 11 } },
    series: [
      {
        name: meta.name,
        type: 'line',
        data,
        smooth: true,
        showSymbol: true,
        lineStyle: { color: meta.color, width: 2 },
        itemStyle: { color: meta.color },
        areaStyle: { color: meta.fill }
      }
    ]
  };
}

function resize() {
  chart?.resize();
}

onMounted(() => {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  chart.setOption(buildOption(props.patient, labTab.value));
  window.addEventListener('resize', resize);
});

onUnmounted(() => {
  window.removeEventListener('resize', resize);
  chart?.dispose();
  chart = null;
});

watch(
  () => props.patient,
  (p) => {
    if (chart && p) chart.setOption(buildOption(p, labTab.value), true);
  },
  { deep: true }
);

watch(labTab, (tab) => {
  if (chart) chart.setOption(buildOption(props.patient, tab), true);
});

watch(
  () => props.patient.id,
  () => {
    reasonExpanded.value = false;
  }
);
</script>

<style scoped>
.panel {
  min-width: 0;
}
.card {
  border-radius: 8px;
  border: 1px solid var(--med-border, #e5e6eb);
  box-shadow: none;
}
.card :deep(.arco-card-body) {
  padding: 12px;
}

.hero {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--med-border, #e5e6eb);
}
.hero-mid {
  flex: 1;
  min-width: 0;
}
.av {
  flex-shrink: 0;
  background: rgba(22, 93, 255, 0.12);
  color: #165dff;
  font-weight: 700;
}
.name {
  font-size: 14px;
  font-weight: 700;
  color: #1d2129;
}
.pid {
  font-size: 12px;
  font-weight: 500;
  color: #86909c;
}
.meta {
  margin-top: 2px;
  font-size: 12px;
  color: #4e5969;
}

.collapse {
  background: transparent;
}
.collapse :deep(.arco-collapse-item-header) {
  font-size: 13px;
  font-weight: 600;
  padding: 8px 4px;
}
.collapse :deep(.arco-collapse-item-content) {
  padding: 0 4px 12px;
}
.collapse :deep(.arco-collapse-item-content-box) {
  padding: 0;
}

.reasons {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.55;
  color: #4e5969;
}
.reasons li + li {
  margin-top: 6px;
}
.more-btn {
  margin-top: 6px;
  padding: 0 !important;
  height: auto !important;
  font-size: 12px;
}

.lab-tabs {
  margin-bottom: 8px;
}
.lab-tabs :deep(.arco-tabs-nav-tab) {
  font-size: 12px;
}

.chart-one {
  width: 100%;
  height: 200px;
}

.meds {
  margin: 0;
  padding: 0;
  list-style: none;
}
.meds li {
  padding: 8px 10px;
  border-radius: 8px;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  font-size: 12px;
}
.meds li + li {
  margin-top: 8px;
}
.meds li.anomaly {
  border-color: rgba(245, 63, 63, 0.35);
  background: #fff5f5;
}
.mn {
  font-weight: 600;
  color: #1d2129;
}
.md {
  margin-left: 8px;
  color: #4e5969;
}
.bad {
  margin-left: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #cb2634;
}
.mr {
  margin-top: 6px;
  color: #86909c;
  line-height: 1.45;
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bar-row {
  display: grid;
  grid-template-columns: 72px 1fr;
  align-items: center;
  gap: 10px;
}
.bl {
  font-size: 12px;
  color: #4e5969;
}

.task-foot {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--med-border, #e5e6eb);
}
.task-foot-t {
  font-size: 12px;
  color: #4e5969;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.task-foot-a {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.btn-pri {
  background: #165dff !important;
  border-color: #165dff !important;
}
</style>
