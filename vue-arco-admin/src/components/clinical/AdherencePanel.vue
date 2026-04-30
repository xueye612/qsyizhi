<template>
  <div class="ad">
    <div class="ad-rows">
      <div v-for="r in rows" :key="r.k" class="row">
        <span class="lab">{{ r.label }}</span>
        <div class="bar"><div class="fill" :style="{ width: r.v + '%', background: color(r.v) }" /></div>
        <span class="val c-data">{{ r.v }}<small>%</small></span>
      </div>
    </div>
    <div class="hm">
      <div class="hm-head">最近 12 周服药热力</div>
      <div class="hm-cells">
        <div v-for="(w, i) in weekly" :key="i" class="cell" :title="`第 ${i + 1} 周 · ${w}%`" :style="{ background: heat(w) }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Patient } from '@/mock/patients';

const props = defineProps<{ patient: Patient }>();
const c = computed(() => props.patient.clinical?.compliance);
const rows = computed(() => {
  const x = c.value;
  if (!x) return [];
  return [
    { k: 'med', label: '服药', v: x.medication },
    { k: 'flw', label: '随访', v: x.followup },
    { k: 'lab', label: '化验', v: x.lab }
  ];
});
const weekly = computed(() => c.value?.weekly || []);
function color(v: number) { return v >= 90 ? 'var(--c-normal)' : v >= 80 ? 'var(--c-caution)' : 'var(--c-warning)'; }
function heat(v: number) {
  const a = Math.max(0.15, Math.min(1, v / 100));
  return `rgba(31, 111, 235, ${a})`;
}
</script>

<style scoped>
.ad { display: flex; flex-direction: column; gap: 10px; }
.ad-rows { display: flex; flex-direction: column; gap: 6px; }
.row { display: grid; grid-template-columns: 40px 1fr auto; gap: 8px; align-items: center; }
.lab { font-size: 12px; color: var(--c-text-2); }
.bar { height: 6px; background: var(--c-surface-3); border-radius: 3px; overflow: hidden; }
.fill { height: 100%; transition: width var(--c-dur-slow) var(--c-ease); }
.val { font-size: 13px; color: var(--c-text); }
.val small { font-size: 10px; color: var(--c-text-muted); margin-left: 1px; font-weight: 400; }

.hm-head { font-size: 11px; color: var(--c-text-3); margin-bottom: 4px; }
.hm-cells { display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; }
.cell { aspect-ratio: 1 / 1; border-radius: 3px; transition: transform var(--c-dur-fast) var(--c-ease); }
.cell:hover { transform: scale(1.15); }
</style>
