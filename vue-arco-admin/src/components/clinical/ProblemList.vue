<template>
  <div class="pl">
    <div v-for="p in items" :key="p.name + p.onset" class="pl-row" :class="`pl-row--${p.status}`">
      <span class="pl-icd">{{ p.icd || '—' }}</span>
      <div class="pl-name">{{ p.name }}</div>
      <span class="pl-onset">{{ p.onset }}</span>
      <span class="c-chip" :class="statusChip(p.status)">{{ statusLabel(p.status) }}</span>
    </div>
    <div v-if="!items.length" class="pl-empty">无活动诊断</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Patient } from '@/mock/patients';

const props = defineProps<{ patient: Patient }>();
const items = computed(() => props.patient.clinical?.problems || []);
function statusChip(s: string) { return s === 'active' ? 'c-chip--warning' : s === 'remission' ? 'c-chip--info' : 'c-chip--normal'; }
function statusLabel(s: string) { return s === 'active' ? '活动' : s === 'remission' ? '缓解' : '已愈'; }
</script>

<style scoped>
.pl { display: flex; flex-direction: column; }
.pl-row {
  display: grid;
  grid-template-columns: 64px 1fr auto auto;
  gap: 10px; align-items: center;
  padding: 8px 4px;
  border-bottom: 1px dashed var(--c-divider);
}
.pl-row:last-child { border-bottom: none; }
.pl-icd {
  font-family: ui-monospace, monospace; font-size: 11px;
  color: var(--c-brand-2); background: var(--c-brand-soft);
  padding: 1px 6px; border-radius: 4px; text-align: center; font-weight: 600;
}
.pl-name { font-size: 13px; color: var(--c-text); font-weight: 500; }
.pl-onset { font-size: 11px; color: var(--c-text-3); font-family: ui-monospace, monospace; }
.pl-empty { padding: 18px 0; text-align: center; color: var(--c-text-muted); font-size: 12px; }
</style>
