<template>
  <a-card
    :bordered="false"
    class="med-stat-card"
    :class="{ 'med-stat-card--clickable': clickable, 'med-stat-card--selected': selected }"
    @click="onClick"
  >
    <div class="inner">
      <div v-if="$slots.icon" class="icon-wrap" :class="toneClass">
        <slot name="icon" />
      </div>
      <div class="mid">
        <div class="label">{{ label }}</div>
        <div class="value" :class="toneClass">{{ displayValue }}</div>
        <div v-if="hint" class="hint">{{ hint }}</div>
      </div>
      <div v-if="sparkline && sparkline.length > 1" class="spark">
        <svg :viewBox="`0 0 ${sparkW} ${sparkH}`" preserveAspectRatio="none" :width="sparkW" :height="sparkH" aria-hidden="true">
          <path :d="sparkArea" :fill="sparkFill" />
          <path :d="sparkLine" :stroke="sparkStroke" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div v-if="trend" class="trend">
        <span class="trend-link" :class="trendDirClass">
          <span class="trend-arrow" aria-hidden="true">{{
            trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'
          }}</span>
          {{ trend }}
        </span>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
  trendDir?: 'up' | 'down' | 'flat';
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'magenta';
  /** 可点击（如 KPI 筛选） */
  clickable?: boolean;
  selected?: boolean;
  /** sparkline 数据点 */
  sparkline?: number[];
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

function onClick() {
  if (props.clickable) emit('click');
}

const displayValue = computed(() =>
  props.value === '' || props.value === null || props.value === undefined ? '—' : props.value
);

const toneClass = computed(() => props.tone ?? 'default');
const trendDirClass = computed(() => props.trendDir ?? 'flat');

/* sparkline */
const sparkW = 64;
const sparkH = 28;
const toneColorMap: Record<string, string> = {
  default: '#86909c',
  primary: '#1F6FEB',
  success: '#00b42a',
  warning: '#ff7d00',
  danger: '#f53f3f',
  purple: '#722ed1',
  magenta: '#eb2f96'
};
const sparkStroke = computed(() => toneColorMap[props.tone ?? 'default'] || '#86909c');
const sparkFill = computed(() => {
  const c = sparkStroke.value;
  return c.startsWith('#')
    ? `${c}1f`
    : 'rgba(31,111,235,0.12)';
});
function sparkPoints() {
  const data = props.sparkline ?? [];
  if (data.length < 2) return [] as Array<[number, number]>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = sparkW / (data.length - 1);
  const padY = 2;
  return data.map((v, i) => {
    const x = i * stepX;
    const y = sparkH - padY - ((v - min) / range) * (sparkH - padY * 2);
    return [x, y] as [number, number];
  });
}
const sparkLine = computed(() => {
  const pts = sparkPoints();
  if (!pts.length) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
});
const sparkArea = computed(() => {
  const pts = sparkPoints();
  if (!pts.length) return '';
  const head = `M${pts[0][0].toFixed(1)} ${sparkH}`;
  const line = pts.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const tail = `L${pts[pts.length - 1][0].toFixed(1)} ${sparkH} Z`;
  return `${head} ${line} ${tail}`;
});
</script>

<style scoped>
.med-stat-card {
  width: 100%;
  min-width: 0;
  height: 100%;
  border-radius: var(--med-radius, 10px);
  border: 1px solid var(--med-border, #e5e6eb);
  box-shadow: var(--med-shadow, 0 1px 2px rgba(0, 0, 0, 0.04));
  background: var(--med-surface, #fff);
}

.med-stat-card--clickable {
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.med-stat-card--clickable:hover {
  border-color: rgba(22, 93, 255, 0.35);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.med-stat-card--selected {
  border-color: rgb(var(--primary-6, 22, 93, 255));
  box-shadow: inset 0 0 0 1px rgba(22, 93, 255, 0.12);
}

.med-stat-card :deep(.arco-card-body) {
  box-sizing: border-box;
  padding: 12px 14px;
  min-height: 84px;
  height: 100%;
}

.inner {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  min-height: 58px;
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.icon-wrap :deep(svg) {
  display: block;
}

.icon-wrap.default {
  background: rgba(134, 144, 156, 0.12);
  color: var(--med-muted, #86909c);
}
.icon-wrap.primary {
  background: color-mix(in srgb, var(--med-primary, #165dff) 14%, white);
  color: var(--med-primary, #165dff);
}
.icon-wrap.success {
  background: color-mix(in srgb, var(--med-success, #00b42a) 14%, white);
  color: var(--med-success, #00b42a);
}
.icon-wrap.warning {
  background: color-mix(in srgb, var(--med-warning, #ff7d00) 14%, white);
  color: var(--med-warning, #ff7d00);
}
.icon-wrap.danger {
  background: color-mix(in srgb, var(--med-danger, #f53f3f) 14%, white);
  color: var(--med-danger, #f53f3f);
}
.icon-wrap.purple {
  background: color-mix(in srgb, #722ed1 14%, white);
  color: #722ed1;
}
.icon-wrap.magenta {
  background: color-mix(in srgb, #eb2f96 14%, white);
  color: #eb2f96;
}

.mid {
  flex: 1;
  min-width: 0;
}

.label {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
  color: var(--med-text, #1d2129);
  opacity: 0.88;
}

.hint {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.3;
  color: var(--med-muted, #86909c);
}

.value {
  margin-top: 2px;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--med-text, #1d2129);
  font-variant-numeric: tabular-nums;
}

.value.default {
  color: var(--med-text, #1d2129);
}
.value.primary {
  color: var(--med-primary, #165dff);
}
.value.success {
  color: var(--med-success, #00b42a);
}
.value.warning {
  color: var(--med-warning, #ff7d00);
}
.value.danger {
  color: var(--med-danger, #f53f3f);
}
.value.purple {
  color: #722ed1;
}
.value.magenta {
  color: #eb2f96;
}

.trend {
  flex-shrink: 0;
  align-self: center;
  max-width: 36%;
  text-align: right;
}

.trend-link {
  font-size: 11px;
  font-weight: 400;
  line-height: 1.3;
  color: var(--med-muted, #86909c);
  white-space: nowrap;
}

.trend-arrow {
  margin-right: 2px;
}

.trend-link.up {
  color: var(--med-success, #00b42a);
}

.trend-link.down {
  color: var(--med-danger, #f53f3f);
}

.trend-link.flat {
  color: var(--med-muted, #86909c);
}

.spark {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-right: 2px;
  opacity: .9;
}
.spark svg { display: block; }
</style>
