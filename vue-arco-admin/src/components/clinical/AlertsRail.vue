<template>
  <div class="ar">
    <div class="ar-h">
      <span class="ar-t">临床警示</span>
      <span class="ar-cnt">{{ list.length }}</span>
    </div>
    <div v-if="!list.length" class="ar-empty">
      <span>暂无活动警示</span>
    </div>
    <div v-else class="ar-body">
      <div v-for="a in list" :key="a.id" class="alert" :class="`alert--${a.level}`">
        <span class="al-bar" />
        <div class="al-icon">
          <span v-if="a.level === 'critical'" class="dot c-pulse" />
          <span v-else>!</span>
        </div>
        <div class="al-body">
          <div class="al-row">
            <span class="al-code">{{ a.code }}</span>
            <span class="al-msg">{{ a.message }}</span>
          </div>
          <div class="al-meta">
            <span>{{ levelLabel(a.level) }}</span>
            <span>·</span>
            <span>起 {{ a.since }}</span>
          </div>
        </div>
        <div class="al-act">
          <a-button size="mini" type="text">处理</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Patient } from '@/mock/patients';

const props = defineProps<{ patient: Patient }>();
const list = computed(() => {
  const arr = props.patient.clinical?.alerts || [];
  const order: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  return [...arr].sort((a, b) => (order[a.level] ?? 9) - (order[b.level] ?? 9));
});
function levelLabel(l: string) { return l === 'critical' ? '危急' : l === 'warning' ? '警示' : '提示'; }
</script>

<style scoped>
.ar {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  padding: 10px 12px;
}
.ar-h { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.ar-t { font-size: 13px; font-weight: 600; color: var(--c-text); }
.ar-cnt {
  background: var(--c-critical-bg); color: var(--c-critical);
  border: 1px solid var(--c-critical-border);
  font-size: 11px; padding: 0 6px; border-radius: var(--c-radius-pill);
  font-variant-numeric: tabular-nums; font-weight: 700;
  margin-left: auto;
}
.ar-empty { padding: 18px 0; text-align: center; color: var(--c-text-muted); font-size: 12px; }
.ar-body { display: flex; flex-direction: column; gap: 6px; }

.alert {
  position: relative;
  display: grid; grid-template-columns: auto auto 1fr auto;
  gap: 8px; align-items: center;
  padding: 8px 10px 8px 12px;
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  background: var(--c-surface-2);
  overflow: hidden;
  transition: transform var(--c-dur) var(--c-ease);
}
.alert:hover { transform: translateX(2px); box-shadow: var(--c-shadow-2); }
.al-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: currentColor; }
.alert--critical { background: var(--c-critical-bg); border-color: var(--c-critical-border); color: var(--c-critical); }
.alert--warning  { background: var(--c-warning-bg);  border-color: var(--c-warning-border);  color: var(--c-warning); }
.alert--info     { background: var(--c-info-bg);     border-color: var(--c-info-border);     color: var(--c-info); }

.al-icon {
  width: 22px; height: 22px; border-radius: 6px;
  background: currentColor;
  display: grid; place-items: center;
  font-weight: 700; font-size: 12px; color: #fff;
  position: relative;
}
.al-icon .dot {
  width: 8px; height: 8px; border-radius: 50%; background: #fff;
}

.al-body { min-width: 0; }
.al-row { display: flex; align-items: baseline; gap: 8px; }
.al-code {
  font-family: ui-monospace, monospace; font-size: 10px;
  background: rgba(0,0,0,.06); color: inherit;
  padding: 1px 6px; border-radius: 4px; font-weight: 700;
}
.al-msg { font-size: 12.5px; color: var(--c-text); font-weight: 500; }
.al-meta { display: flex; gap: 4px; font-size: 10px; color: var(--c-text-3); margin-top: 2px; }
.al-act :deep(.arco-btn) { color: inherit !important; }
</style>
