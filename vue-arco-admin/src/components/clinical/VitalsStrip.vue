<template>
  <div class="vs">
    <div v-for="m in metrics" :key="m.key" class="vs-cell c-fade-up" :class="`tone-${m.tone}`">
      <div class="vs-head">
        <span class="vs-icon" :style="{ background: m.color + '22', color: m.color }">
          <component :is="m.icon" />
        </span>
        <span class="vs-label">{{ m.label }}</span>
        <span class="vs-tone c-chip" :class="`c-chip--${m.tone}`">{{ m.toneLabel }}</span>
      </div>
      <div class="vs-body">
        <div class="vs-value">
          <span class="c-data" :style="{ fontSize: 'var(--c-num-lg)' }">{{ m.value }}</span>
          <span class="vs-unit">{{ m.unit }}</span>
        </div>
        <Spark :data="m.series" :color="m.color" />
      </div>
      <div class="vs-foot">
        <span>参考 {{ m.ref }}</span>
        <span class="vs-delta" :class="m.delta > 0 ? 'up' : m.delta < 0 ? 'down' : ''">
          {{ m.delta > 0 ? '↑' : m.delta < 0 ? '↓' : '·' }} {{ Math.abs(m.delta).toFixed(1) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, type FunctionalComponent } from 'vue';
import {
  IconHeart,
  IconThunderbolt,
  IconFire,
  IconCloud,
  IconCommon,
  IconScissor
} from '@arco-design/web-vue/es/icon';
import type { Patient } from '@/mock/patients';

const props = defineProps<{ patient: Patient }>();

const Spark: FunctionalComponent<{ data: number[]; color: string }> = (p) => {
  const w = 110, h2 = 32;
  if (!p.data?.length) return h('svg', { width: w, height: h2 });
  const min = Math.min(...p.data), max = Math.max(...p.data);
  const span = max - min || 1;
  const stepX = w / (p.data.length - 1 || 1);
  const pts = p.data.map((v, i) => `${(i * stepX).toFixed(1)},${(h2 - ((v - min) / span) * (h2 - 4) - 2).toFixed(1)}`).join(' ');
  const last = p.data[p.data.length - 1];
  const lastY = h2 - ((last - min) / span) * (h2 - 4) - 2;
  return h('svg', { width: w, height: h2, class: 'spark' }, [
    h('polyline', { points: pts, fill: 'none', stroke: p.color, 'stroke-width': 1.6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
    h('circle', { cx: w - 0.5, cy: lastY, r: 2.4, fill: p.color })
  ]);
};

function band(v: number, low: number, high: number, critLow: number, critHigh: number): { tone: 'critical' | 'warning' | 'normal'; toneLabel: string } {
  if (v <= critLow || v >= critHigh) return { tone: 'critical', toneLabel: '危急' };
  if (v < low || v > high) return { tone: 'warning', toneLabel: '偏离' };
  return { tone: 'normal', toneLabel: '正常' };
}

const metrics = computed(() => {
  const v = props.patient.clinical?.vitals || [];
  if (!v.length) return [];
  const last = v[v.length - 1];
  const prev = v[v.length - 2] || last;

  const sysSeries = v.slice(-14).map((x) => x.sys);
  const hrSeries = v.slice(-14).map((x) => x.hr);
  const tempSeries = v.slice(-14).map((x) => x.temp);
  const rrSeries = v.slice(-14).map((x) => x.rr);
  const spo2Series = v.slice(-14).map((x) => x.spo2);
  const wtSeries = v.slice(-14).map((x) => x.weight);

  const bpBand = band(last.sys, 110, 135, 90, 160);
  const hrBand = band(last.hr, 60, 95, 45, 120);
  const tBand = band(last.temp, 36.0, 37.2, 35.0, 38.5);
  const rBand = band(last.rr, 12, 20, 8, 28);
  const sBand = band(last.spo2, 95, 100, 90, 100);

  return [
    { key: 'bp', label: '血压', value: `${last.sys}/${last.dia}`, unit: 'mmHg', ref: '90~140 / 60~90', series: sysSeries, color: 'var(--c-vital-bp)', icon: IconHeart, delta: last.sys - prev.sys, ...bpBand },
    { key: 'hr', label: '心率', value: last.hr, unit: 'bpm', ref: '60~100', series: hrSeries, color: 'var(--c-vital-hr)', icon: IconThunderbolt, delta: last.hr - prev.hr, ...hrBand },
    { key: 'temp', label: '体温', value: last.temp.toFixed(1), unit: '℃', ref: '36~37.2', series: tempSeries, color: 'var(--c-vital-temp)', icon: IconFire, delta: +(last.temp - prev.temp).toFixed(1), ...tBand },
    { key: 'rr', label: '呼吸', value: last.rr, unit: '次/分', ref: '12~20', series: rrSeries, color: 'var(--c-vital-rr)', icon: IconCommon, delta: last.rr - prev.rr, ...rBand },
    { key: 'spo2', label: 'SpO₂', value: last.spo2, unit: '%', ref: '≥95%', series: spo2Series, color: 'var(--c-vital-spo2)', icon: IconCloud, delta: last.spo2 - prev.spo2, ...sBand },
    { key: 'wt', label: '体重', value: last.weight.toFixed(1), unit: 'kg', ref: '基线 ±2kg', series: wtSeries, color: 'var(--c-accent)', icon: IconScissor, delta: +(last.weight - prev.weight).toFixed(1), tone: Math.abs(last.weight - (v[0]?.weight ?? last.weight)) > 2 ? 'warning' : 'normal' as any, toneLabel: Math.abs(last.weight - (v[0]?.weight ?? last.weight)) > 2 ? '波动' : '稳定' }
  ];
});
</script>

<style scoped>
.vs {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--c-sp-3);
}
@media (max-width: 1280px) { .vs { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 720px)  { .vs { grid-template-columns: repeat(2, 1fr); } }

.vs-cell {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  padding: 10px 12px;
  display: flex; flex-direction: column; gap: 4px;
  position: relative; overflow: hidden;
  transition: all var(--c-dur) var(--c-ease);
}
.vs-cell::after {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: currentColor; opacity: .8;
}
.tone-normal   { color: var(--c-normal); }
.tone-warning  { color: var(--c-warning); background: linear-gradient(180deg, #fffaf0 0%, #fff 60%); }
.tone-critical { color: var(--c-critical); background: linear-gradient(180deg, #fff5f5 0%, #fff 60%); }
.vs-cell:hover { box-shadow: var(--c-shadow-3); transform: translateY(-1px); }

.vs-head { display: flex; align-items: center; gap: 6px; }
.vs-icon {
  width: 22px; height: 22px; border-radius: 6px;
  display: grid; place-items: center; font-size: 13px;
}
.vs-label { font-size: 12px; color: var(--c-text-2); font-weight: 500; }
.vs-tone { margin-left: auto; font-size: 10px; padding: 1px 6px; }

.vs-body { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; margin-top: 2px; }
.vs-value { display: flex; align-items: baseline; gap: 3px; }
.vs-unit { font-size: 11px; color: var(--c-text-muted); margin-left: 2px; }
:deep(.spark) { flex: 0 0 110px; }

.vs-foot { display: flex; justify-content: space-between; font-size: 10px; color: var(--c-text-muted); }
.vs-delta.up   { color: var(--c-critical); font-weight: 600; }
.vs-delta.down { color: var(--c-normal);   font-weight: 600; }
</style>
