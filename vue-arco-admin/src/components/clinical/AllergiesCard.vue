<template>
  <div class="ac">
    <div v-if="!list.length" class="ac-empty">
      <span class="ok">✓</span> 无已知过敏
    </div>
    <div v-else>
      <div v-for="a in list" :key="a.substance" class="ac-row" :class="`sev-${a.severity}`">
        <span class="ac-sub">{{ a.substance }}</span>
        <span class="ac-rx">{{ a.reaction }}</span>
        <span class="c-chip" :class="`c-chip--${chipTone(a.severity)}`">{{ sevLabel(a.severity) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Patient } from '@/mock/patients';

const props = defineProps<{ patient: Patient }>();
const list = computed(() => props.patient.clinical?.allergies || []);
function chipTone(s: string) { return s === 'critical' ? 'critical' : s === 'warning' ? 'warning' : 'caution'; }
function sevLabel(s: string) { return s === 'critical' ? '严重' : s === 'warning' ? '中度' : '轻度'; }
</script>

<style scoped>
.ac-empty { padding: 12px; text-align: center; color: var(--c-normal); font-size: 13px; font-weight: 500; }
.ac-empty .ok { display: inline-block; width: 18px; height: 18px; line-height: 18px; border-radius: 50%; background: var(--c-normal-bg); border: 1px solid var(--c-normal-border); margin-right: 6px; }
.ac-row {
  display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: center;
  padding: 6px 8px; border-radius: var(--c-radius-sm); margin-bottom: 4px;
}
.sev-critical { background: var(--c-critical-bg); border: 1px solid var(--c-critical-border); }
.sev-warning  { background: var(--c-warning-bg);  border: 1px solid var(--c-warning-border); }
.sev-caution  { background: var(--c-caution-bg);  border: 1px solid var(--c-caution-border); }
.ac-sub { font-size: 13px; font-weight: 600; color: var(--c-text); }
.ac-rx  { font-size: 11px; color: var(--c-text-3); }
</style>
