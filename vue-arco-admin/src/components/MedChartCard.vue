<template>
  <div class="med-chart-wrap">
    <header v-if="title || (ranges && ranges.length) || $slots.actions" class="hd">
      <div class="hd-l">
        <div v-if="title" class="ttl">{{ title }}</div>
        <div v-if="desc" class="sub">{{ desc }}</div>
      </div>
      <div class="hd-r">
        <div v-if="ranges && ranges.length" class="rg">
          <button
            v-for="r in ranges"
            :key="r.key"
            type="button"
            class="rg-i"
            :class="{ 'rg-i--active': r.key === activeRange }"
            @click="onPickRange(r.key)"
          >{{ r.label }}</button>
        </div>
        <slot name="actions" />
      </div>
    </header>
    <div ref="el" class="med-chart" :style="{ height: heightVal }" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
  CanvasRenderer
]);

export interface ChartRange {
  key: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    option: any;
    height?: number | string;
    title?: string;
    desc?: string;
    ranges?: ChartRange[];
    activeRange?: string;
  }>(),
  { height: 260, ranges: () => [], activeRange: '' }
);

const emit = defineEmits<{
  (e: 'update:activeRange', v: string): void;
  (e: 'pickRange', v: string): void;
}>();

const el = ref<HTMLDivElement | null>(null);
const chart = shallowRef<echarts.ECharts | null>(null);
const heightVal = typeof props.height === 'number' ? `${props.height}px` : props.height;

let ro: ResizeObserver | null = null;

function init() {
  if (!el.value) return;
  chart.value = echarts.init(el.value);
  chart.value.setOption(props.option || {});
  ro = new ResizeObserver(() => chart.value?.resize());
  ro.observe(el.value);
}

function onPickRange(k: string) {
  emit('update:activeRange', k);
  emit('pickRange', k);
}

onMounted(() => init());

watch(
  () => props.option,
  (v) => {
    chart.value?.setOption(v || {}, true);
  },
  { deep: true }
);

onBeforeUnmount(() => {
  ro?.disconnect();
  chart.value?.dispose();
  chart.value = null;
});
</script>

<style scoped>
.med-chart-wrap { display: flex; flex-direction: column; min-width: 0; }
.hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.hd-l { min-width: 0; }
.ttl { font-size: 13px; font-weight: 600; color: var(--med-text, #1d2129); line-height: 1.4; }
.sub { font-size: 11px; color: var(--med-muted, #86909c); line-height: 1.3; margin-top: 1px; }
.hd-r { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.rg {
  display: inline-flex;
  border: 1px solid var(--med-border, #e5e6eb);
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}
.rg-i {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0 10px;
  height: 24px;
  font-size: 11px;
  color: var(--med-text-2, #4e5969);
  cursor: pointer;
  font-variant-numeric: tabular-nums;
}
.rg-i + .rg-i { border-left: 1px solid var(--med-border, #e5e6eb); }
.rg-i--active { background: rgba(31,111,235,.08); color: #1F6FEB; font-weight: 600; }

.med-chart {
  width: 100%;
  min-height: 200px;
}
</style>
