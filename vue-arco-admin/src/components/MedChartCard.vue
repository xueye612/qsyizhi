<template>
  <div ref="el" class="med-chart" :style="{ height: heightVal }" />
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

const props = withDefaults(
  defineProps<{
    option: any;
    height?: number | string;
  }>(),
  { height: 260 }
);

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
.med-chart {
  width: 100%;
  min-height: 200px;
}
</style>
