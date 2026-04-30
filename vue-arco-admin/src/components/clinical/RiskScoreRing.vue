<template>
  <div class="rsr">
    <div v-for="r in rings" :key="r.key" class="ring" :class="`ring--${r.tone}`">
      <svg viewBox="0 0 60 60" class="svg">
        <circle cx="30" cy="30" r="24" fill="none" stroke="var(--c-surface-3)" stroke-width="6" />
        <circle
          cx="30" cy="30" r="24" fill="none" :stroke="r.color" stroke-width="6"
          stroke-linecap="round"
          :stroke-dasharray="`${r.dash} 999`"
          transform="rotate(-90 30 30)"
        />
        <text x="30" y="32" text-anchor="middle" dominant-baseline="middle" class="tx">{{ r.value }}</text>
      </svg>
      <div class="rb">
        <div class="rl">{{ r.label }}</div>
        <div class="rh">{{ r.tag }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Patient } from '@/mock/patients';

const props = defineProps<{ patient: Patient }>();
const C = 2 * Math.PI * 24;

function tone(v: number) {
  if (v >= 60) return { tone: 'critical', color: 'var(--c-critical)', tag: '高' };
  if (v >= 35) return { tone: 'warning', color: 'var(--c-warning)', tag: '中' };
  return { tone: 'normal', color: 'var(--c-normal)', tag: '低' };
}

const rings = computed(() => {
  const r = props.patient.clinical?.risk;
  if (!r) return [];
  const items = [
    { key: 'rejection', label: '排斥', value: r.rejection },
    { key: 'infection', label: '感染', value: r.infection },
    { key: 'cardiovascular', label: '心血管', value: r.cardiovascular },
    { key: 'mortality', label: '死亡', value: r.mortality }
  ];
  return items.map((it) => ({ ...it, ...tone(it.value), dash: (it.value / 100) * C }));
});
</script>

<style scoped>
.rsr {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--c-sp-3);
}
.ring {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  padding: 10px;
  display: flex; align-items: center; gap: 10px;
  transition: all var(--c-dur) var(--c-ease);
}
.ring:hover { box-shadow: var(--c-shadow-2); transform: translateY(-1px); }
.svg { width: 56px; height: 56px; flex: 0 0 56px; }
.tx { font-size: 14px; font-weight: 700; fill: var(--c-text); font-family: ui-monospace, monospace; }
.rb { display: flex; flex-direction: column; min-width: 0; }
.rl { font-size: 12px; color: var(--c-text-2); font-weight: 500; }
.rh { font-size: 11px; padding: 1px 6px; border-radius: var(--c-radius-pill); display: inline-block; width: fit-content; margin-top: 2px; }
.ring--critical .rh { background: var(--c-critical-bg); color: var(--c-critical); border: 1px solid var(--c-critical-border); }
.ring--warning .rh  { background: var(--c-warning-bg);  color: var(--c-warning);  border: 1px solid var(--c-warning-border); }
.ring--normal .rh   { background: var(--c-normal-bg);   color: var(--c-normal);   border: 1px solid var(--c-normal-border); }

@media (max-width: 720px) { .rsr { grid-template-columns: repeat(2, 1fr); } }
</style>
