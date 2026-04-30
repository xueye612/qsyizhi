<template>
  <div class="ml">
    <div v-for="(group, cat) in grouped" :key="cat" class="ml-group">
      <div class="ml-cat">
        <span class="dot" :style="{ background: catColor(String(cat)) }" />
        <span>{{ cat }}</span>
        <small>{{ group.length }} 项</small>
      </div>
      <div class="ml-list">
        <div v-for="m in group" :key="m.name + m.startDate" class="ml-card">
          <div class="ml-row1">
            <span class="ml-name">{{ m.name }}</span>
            <span class="ml-dose c-data">{{ m.dose }}</span>
            <span class="ml-freq">{{ m.freq }}</span>
            <span class="ml-route">{{ m.route }}</span>
          </div>
          <div class="ml-row2">
            <span>适应证 · {{ m.indication }}</span>
            <span>起 {{ m.startDate }}</span>
          </div>
          <div class="ml-adh">
            <div class="bar"><div class="fill" :style="{ width: m.adherence + '%', background: adhColor(m.adherence) }" /></div>
            <small>依从 <b class="c-data">{{ m.adherence }}%</b></small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Patient } from '@/mock/patients';
import type { Medication } from '@/mock/clinicalSeed';

const props = defineProps<{ patient: Patient }>();

const grouped = computed<Record<string, Medication[]>>(() => {
  const out: Record<string, Medication[]> = {};
  for (const m of props.patient.clinical?.meds || []) {
    (out[m.category] ||= []).push(m);
  }
  return out;
});

function catColor(c: string) {
  return ({
    免疫抑制: '#722ed1',
    降压: '#1f6feb',
    降糖: '#fa8c16',
    抗感染: '#d4380d',
    辅助: '#13a8a8',
    其他: '#8c8c8c'
  } as Record<string, string>)[c] || '#8c8c8c';
}
function adhColor(v: number) {
  if (v >= 90) return 'var(--c-normal)';
  if (v >= 80) return 'var(--c-caution)';
  return 'var(--c-warning)';
}
</script>

<style scoped>
.ml { display: flex; flex-direction: column; gap: 12px; }
.ml-cat {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--c-text-2); font-weight: 600;
  margin-bottom: 4px;
}
.ml-cat .dot { width: 8px; height: 8px; border-radius: 2px; }
.ml-cat small { color: var(--c-text-muted); font-weight: 500; margin-left: auto; }
.ml-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
@media (max-width: 720px) { .ml-list { grid-template-columns: 1fr; } }
.ml-card {
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  padding: 8px 10px;
  display: flex; flex-direction: column; gap: 4px;
  transition: all var(--c-dur) var(--c-ease);
}
.ml-card:hover { background: var(--c-surface); box-shadow: var(--c-shadow-2); }
.ml-row1 { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.ml-name { font-size: 13px; font-weight: 600; color: var(--c-text); }
.ml-dose { color: var(--c-brand-2); font-size: 12px; }
.ml-freq { font-size: 11px; color: var(--c-text-3); padding: 1px 6px; background: var(--c-info-bg); border-radius: 4px; }
.ml-route { font-size: 11px; color: var(--c-text-3); }
.ml-row2 { display: flex; justify-content: space-between; font-size: 11px; color: var(--c-text-muted); }
.ml-adh { display: flex; align-items: center; gap: 8px; }
.ml-adh .bar { flex: 1; height: 4px; background: var(--c-surface-3); border-radius: 2px; overflow: hidden; }
.ml-adh .fill { height: 100%; transition: width var(--c-dur-slow) var(--c-ease); }
.ml-adh small { font-size: 10px; color: var(--c-text-muted); }
.ml-adh small b { color: var(--c-text); margin: 0 1px; }
</style>
