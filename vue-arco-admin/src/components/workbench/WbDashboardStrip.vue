<template>
  <div class="wb-dash">
    <!-- 风险分层 -->
    <div class="dash-card c-fade-up">
      <div class="dash-head">
        <span class="title">风险分层</span>
        <span class="sub">实时 · 按风控引擎计算</span>
      </div>
      <div class="dash-body donut-body">
        <MedChartCard :option="riskOption" :height="158" class="chart" />
        <div class="legend-list">
          <div v-for="r in riskRows" :key="r.key" class="legend-row" :class="r.key">
            <span class="dot" :style="{ background: r.color }" />
            <span class="lab">{{ r.label }}</span>
            <span class="val tabular">{{ r.value }}</span>
            <span class="pct">{{ r.pct }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 30 天移植量 -->
    <div class="dash-card c-fade-up">
      <div class="dash-head">
        <span class="title">近 30 天移植量</span>
        <span class="sub">单位：例 · 含活体 + DCD</span>
        <span class="head-stat">
          <span class="big tabular">{{ volumeTotal }}</span>
          <span class="delta up">↑ {{ volumeDelta }}%</span>
        </span>
      </div>
      <div class="dash-body">
        <MedChartCard :option="volumeOption" :height="170" />
      </div>
    </div>

    <!-- 今日随访漏斗 -->
    <div class="dash-card c-fade-up">
      <div class="dash-head">
        <span class="title">今日随访漏斗</span>
        <span class="sub">{{ today }} · 触达 / 应答 / 闭环</span>
      </div>
      <div class="dash-body funnel-body">
        <div v-for="(f, i) in funnel" :key="f.key" class="funnel-row">
          <div class="funnel-meta">
            <span class="step">{{ i + 1 }}</span>
            <span class="lab">{{ f.label }}</span>
          </div>
          <div class="funnel-bar">
            <div
              class="funnel-fill"
              :style="{ width: f.pct + '%', background: f.color }"
            />
          </div>
          <div class="funnel-val">
            <span class="num tabular">{{ f.value }}</span>
            <span class="pct">{{ f.pct }}%</span>
          </div>
        </div>
        <div class="funnel-foot">
          <div class="ff-cell">
            <span class="k">触达率</span>
            <span class="v ok tabular">{{ funnelMetrics.reach }}%</span>
          </div>
          <div class="ff-cell">
            <span class="k">应答率</span>
            <span class="v warn tabular">{{ funnelMetrics.ans }}%</span>
          </div>
          <div class="ff-cell">
            <span class="k">闭环率</span>
            <span class="v brand tabular">{{ funnelMetrics.close }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 紧急告警 -->
    <div class="dash-card c-fade-up alert-card">
      <div class="dash-head">
        <span class="title">紧急告警</span>
        <span class="sub">需即时处置</span>
        <span class="head-stat">
          <span class="badge-critical c-pulse">{{ criticalCount }}</span>
        </span>
      </div>
      <div class="dash-body alert-list">
        <div v-for="a in alerts" :key="a.id" class="alert-row" :class="a.kind">
          <span class="alert-dot" />
          <div class="alert-text">
            <div class="alert-title">{{ a.title }}</div>
            <div class="alert-meta">
              <span class="patient">{{ a.patient }}</span>
              <span class="time">{{ a.time }}</span>
            </div>
          </div>
          <span class="alert-tag" :class="a.kind">{{ tagText(a.kind) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MedChartCard from '@/components/MedChartCard.vue';
import type { WorkbenchPatient, WorkbenchTask } from '@/mock/workbenchData';

const props = defineProps<{
  patients: WorkbenchPatient[];
  tasks: WorkbenchTask[];
  riskCounts: { high: number; mid: number; low: number };
}>();

const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });

const riskRows = computed(() => {
  const total = props.riskCounts.high + props.riskCounts.mid + props.riskCounts.low || 1;
  const rows = [
    { key: 'high', label: '高风险', value: props.riskCounts.high, color: '#d4380d' },
    { key: 'mid', label: '中风险', value: props.riskCounts.mid, color: '#d46b08' },
    { key: 'low', label: '低风险', value: props.riskCounts.low, color: '#389e0d' }
  ];
  return rows.map((r) => ({ ...r, pct: Math.round((r.value / total) * 100) }));
});

const riskOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { show: false },
  series: [
    {
      type: 'pie',
      radius: ['58%', '82%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'center',
        formatter: () => {
          const total = riskRows.value.reduce((s, r) => s + r.value, 0);
          return `{a|${total}}\n{b|患者总数}`;
        },
        rich: {
          a: { fontSize: 24, fontWeight: 700, color: '#1f2937', lineHeight: 28 },
          b: { fontSize: 11, color: '#6b7280', lineHeight: 16 }
        }
      },
      labelLine: { show: false },
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      data: riskRows.value.map((r) => ({ value: r.value, name: r.label, itemStyle: { color: r.color } }))
    }
  ]
}));

// === 30 天移植量 ===
const volumeData = (() => {
  const arr: number[] = [];
  let seed = 7;
  for (let i = 0; i < 30; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    arr.push(2 + Math.floor((seed / 233280) * 6));
  }
  return arr;
})();
const volumeTotal = volumeData.reduce((s, v) => s + v, 0);
const volumeDelta = 12;

const volumeOption = computed(() => ({
  grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: false },
  xAxis: {
    type: 'category',
    data: volumeData.map((_, i) => `D-${30 - i}`),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false }
  },
  yAxis: { type: 'value', show: false },
  tooltip: { trigger: 'axis', formatter: (p: any) => `${p[0].axisValue}: ${p[0].value} 例` },
  series: [
    {
      type: 'bar',
      data: volumeData,
      barCategoryGap: '32%',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#1F6FEB' },
            { offset: 1, color: '#7eb0ff' }
          ]
        },
        borderRadius: [3, 3, 0, 0]
      },
      emphasis: { itemStyle: { color: '#0958d9' } }
    }
  ]
}));

// === 随访漏斗 ===
const funnel = computed(() => {
  const total = props.tasks.filter((t) => t.kind === 'follow').length || 24;
  const reach = Math.round(total * 0.92);
  const ans = Math.round(total * 0.74);
  const close = Math.round(total * 0.58);
  const rows = [
    { key: 'plan', label: '计划任务', value: total, color: '#1F6FEB' },
    { key: 'reach', label: '已触达', value: reach, color: '#13a8a8' },
    { key: 'ans', label: '应答', value: ans, color: '#fa8c16' },
    { key: 'close', label: '闭环', value: close, color: '#389e0d' }
  ];
  const max = rows[0].value || 1;
  return rows.map((r) => ({ ...r, pct: Math.round((r.value / max) * 100) }));
});

const funnelMetrics = computed(() => {
  const f = funnel.value;
  return {
    reach: f[1].pct,
    ans: Math.round((f[2].value / Math.max(f[1].value, 1)) * 100),
    close: Math.round((f[3].value / Math.max(f[0].value, 1)) * 100)
  };
});

// === 紧急告警 ===
const alerts = computed(() => {
  const now = Date.now();
  const fmt = (mAgo: number) => {
    const d = new Date(now - mAgo * 60000);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };
  return [
    {
      id: 'a1',
      kind: 'critical',
      title: 'Tac 浓度超阈：14.8 ng/mL',
      patient: props.patients[0]?.name ?? '—',
      time: fmt(8)
    },
    {
      id: 'a2',
      kind: 'critical',
      title: 'Scr 24h 上升 ≥ 30%',
      patient: props.patients[1]?.name ?? '—',
      time: fmt(22)
    },
    {
      id: 'a3',
      kind: 'warning',
      title: '随访逾期 ≥ 48h',
      patient: props.patients[2]?.name ?? '—',
      time: fmt(64)
    },
    {
      id: 'a4',
      kind: 'warning',
      title: 'eGFR 趋势下降',
      patient: props.patients[3]?.name ?? '—',
      time: fmt(96)
    },
    {
      id: 'a5',
      kind: 'caution',
      title: 'CMV-DNA 复查窗口逾期',
      patient: props.patients[4]?.name ?? '—',
      time: fmt(150)
    }
  ];
});

const criticalCount = computed(() => alerts.value.filter((a) => a.kind === 'critical').length);

function tagText(k: string) {
  return k === 'critical' ? '危急' : k === 'warning' ? '预警' : '注意';
}
</script>

<style scoped>
.wb-dash {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}

.dash-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  box-shadow: var(--c-shadow-1);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  min-height: 220px;
  transition: box-shadow var(--c-dur) var(--c-ease), transform var(--c-dur) var(--c-ease);
}
.dash-card:hover {
  box-shadow: var(--c-shadow-3);
  transform: translateY(-1px);
}

.dash-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--c-divider);
  margin-bottom: 10px;
}
.dash-head .title {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
  letter-spacing: -.01em;
}
.dash-head .sub {
  font-size: 11px;
  color: var(--c-text-3);
}
.dash-head .head-stat {
  margin-left: auto;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.dash-head .head-stat .big {
  font-size: 18px;
  font-weight: 700;
  color: var(--c-text);
}
.dash-head .head-stat .delta.up {
  font-size: 11px;
  color: var(--c-normal);
  font-weight: 600;
}

.dash-body { flex: 1; min-height: 0; }

/* 风险卡 */
.donut-body {
  display: grid;
  grid-template-columns: 1fr 0.8fr;
  gap: 8px;
  align-items: center;
}
.donut-body .chart { width: 100%; }
.legend-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.legend-row {
  display: grid;
  grid-template-columns: 10px 1fr auto auto;
  gap: 8px;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}
.legend-row:hover { background: var(--c-surface-3); }
.legend-row .dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-row .lab { color: var(--c-text-2); }
.legend-row .val { font-weight: 700; color: var(--c-text); font-size: 13px; }
.legend-row .pct { font-size: 11px; color: var(--c-text-3); min-width: 32px; text-align: right; }

/* 漏斗 */
.funnel-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 6px;
  height: 100%;
}
.funnel-row { display: grid; grid-template-columns: 80px 1fr 64px; gap: 10px; align-items: center; min-height: 26px; }
.funnel-meta { display: inline-flex; align-items: center; gap: 6px; }
.funnel-meta .step {
  display: inline-flex;
  width: 20px; height: 20px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background: var(--c-surface-3);
  color: var(--c-text-3);
  font-size: 11px;
  font-weight: 700;
}
.funnel-meta .lab { font-size: 12px; color: var(--c-text-2); font-weight: 500; }
.funnel-bar { height: 12px; border-radius: 999px; background: var(--c-surface-3); overflow: hidden; }
.funnel-fill { height: 100%; border-radius: 999px; transition: width 600ms var(--c-ease-out); box-shadow: inset 0 -2px 0 rgba(0, 0, 0, .06); }
.funnel-val { text-align: right; }
.funnel-val .num { font-weight: 700; font-size: 14px; color: var(--c-text); }
.funnel-val .pct { font-size: 11px; color: var(--c-text-3); margin-left: 4px; }

.funnel-foot {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--c-divider);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.funnel-foot .ff-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 0;
  border-radius: 6px;
  background: var(--c-surface-2);
}
.funnel-foot .ff-cell .k { font-size: 10px; color: var(--c-text-3); }
.funnel-foot .ff-cell .v { font-size: 14px; font-weight: 700; letter-spacing: -.02em; }
.funnel-foot .ff-cell .v.ok    { color: var(--c-normal); }
.funnel-foot .ff-cell .v.warn  { color: var(--c-warning); }
.funnel-foot .ff-cell .v.brand { color: var(--med-primary); }

/* 告警 */
.badge-critical {
  display: inline-flex;
  align-items: center; justify-content: center;
  min-width: 22px; height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--c-critical);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}
.alert-list { display: flex; flex-direction: column; gap: 4px; max-height: 170px; overflow: auto; }
.alert-row {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  border-left: 3px solid transparent;
  transition: background-color 120ms var(--c-ease);
}
.alert-row:hover { background: var(--c-surface-3); }
.alert-row.critical { border-left-color: var(--c-critical); }
.alert-row.warning  { border-left-color: var(--c-warning); }
.alert-row.caution  { border-left-color: var(--c-caution); }
.alert-dot { width: 6px; height: 6px; border-radius: 50%; }
.alert-row.critical .alert-dot { background: var(--c-critical); }
.alert-row.warning  .alert-dot { background: var(--c-warning); }
.alert-row.caution  .alert-dot { background: var(--c-caution); }
.alert-text { min-width: 0; }
.alert-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.alert-meta { font-size: 11px; color: var(--c-text-3); display: flex; gap: 6px; margin-top: 1px; }
.alert-meta .patient { color: var(--c-text-2); font-weight: 500; }
.alert-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid transparent;
}
.alert-tag.critical { color: var(--c-critical); background: var(--c-critical-bg); border-color: var(--c-critical-border); }
.alert-tag.warning  { color: var(--c-warning);  background: var(--c-warning-bg);  border-color: var(--c-warning-border); }
.alert-tag.caution  { color: var(--c-caution);  background: var(--c-caution-bg);  border-color: var(--c-caution-border); }

@media (max-width: 1280px) {
  .wb-dash { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 720px) {
  .wb-dash { grid-template-columns: 1fr; }
}
</style>
