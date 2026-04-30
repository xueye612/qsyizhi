<template>
  <div class="ct">
    <div v-for="(ev, i) in events" :key="i" class="ct-row" :class="`ct-row--${ev.kind}`">
      <div class="ct-time">
        <span class="d">{{ shortDay(ev.ts) }}</span>
        <span class="m">{{ shortMonth(ev.ts) }}</span>
      </div>
      <div class="ct-axis">
        <span class="ct-dot" />
        <span v-if="i < events.length - 1" class="ct-line" />
      </div>
      <div class="ct-card">
        <div class="ct-h">
          <span class="kind" :class="`kind--${ev.kind}`">{{ kindLabel(ev.kind) }}</span>
          <span class="title">{{ ev.title }}</span>
          <span class="who">{{ ev.who }}</span>
        </div>
        <div v-if="ev.note" class="note">{{ ev.note }}</div>
      </div>
    </div>
    <div v-if="!events.length" class="empty">暂无时间轴事件</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Patient } from '@/mock/patients';

const props = defineProps<{ patient: Patient; limit?: number }>();

type EvKind = 'surgery' | 'encounter' | 'lab' | 'imaging' | 'note' | 'med';
type Ev = { ts: string; kind: EvKind; title: string; who?: string; note?: string };

const events = computed<Ev[]>(() => {
  const c = props.patient.clinical;
  if (!c) return [];
  const arr: Ev[] = [];
  for (const e of c.encounters || []) {
    arr.push({ ts: e.date, kind: e.type === '手术' ? 'surgery' : 'encounter', title: `${e.type} · ${e.dx}`, who: e.dept, note: e.note });
  }
  for (const im of c.imaging || []) arr.push({ ts: im.ts, kind: 'imaging', title: `${im.modality} · ${im.site}`, note: im.impression });
  for (const n of c.notes || []) arr.push({ ts: n.ts.slice(0, 10), kind: 'note', title: `${n.type} 记录`, who: `${n.role} ${n.author}`, note: n.content });
  for (const a of (c.alerts || []).slice(0, 5)) arr.push({ ts: a.since, kind: 'lab', title: `${a.code} · ${a.message}`, note: '系统警示' });
  arr.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  return arr.slice(0, props.limit ?? 14);
});

function shortDay(s: string) { const d = new Date(s); return Number.isNaN(d.getTime()) ? '--' : String(d.getDate()).padStart(2, '0'); }
function shortMonth(s: string) { const d = new Date(s); return Number.isNaN(d.getTime()) ? '--' : `${d.getMonth() + 1}月`; }
function kindLabel(k: EvKind) {
  return ({ surgery: '手术', encounter: '就诊', lab: '检验', imaging: '影像', note: '记录', med: '用药' } as Record<EvKind, string>)[k];
}
</script>

<style scoped>
.ct { display: flex; flex-direction: column; }
.ct-row { display: grid; grid-template-columns: 56px 24px 1fr; gap: 8px; align-items: stretch; padding: 4px 0; }
.ct-time { text-align: right; padding-top: 4px; }
.ct-time .d { display: block; font-family: ui-monospace, monospace; font-size: 16px; font-weight: 700; color: var(--c-text); line-height: 1; }
.ct-time .m { display: block; font-size: 10px; color: var(--c-text-muted); margin-top: 2px; }
.ct-axis { position: relative; display: flex; flex-direction: column; align-items: center; padding-top: 6px; }
.ct-dot {
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--c-brand); border: 2px solid #fff;
  box-shadow: 0 0 0 2px var(--c-brand-soft);
  z-index: 2;
}
.ct-line { flex: 1; width: 2px; background: var(--c-divider); margin-top: 4px; }
.ct-card {
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  padding: 8px 10px;
  margin-bottom: 6px;
  transition: all var(--c-dur) var(--c-ease);
}
.ct-card:hover { background: var(--c-surface); box-shadow: var(--c-shadow-2); }
.ct-h { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.kind { font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 600; }
.kind--surgery   { background: var(--c-critical-bg); color: var(--c-critical); }
.kind--encounter { background: var(--c-info-bg);     color: var(--c-info); }
.kind--lab       { background: var(--c-warning-bg);  color: var(--c-warning); }
.kind--imaging   { background: var(--c-accent-soft); color: var(--c-accent); }
.kind--note      { background: var(--c-surface-3);   color: var(--c-text-2); }
.kind--med       { background: #f9f0ff;              color: #722ed1; }
.title { font-size: 12.5px; color: var(--c-text); font-weight: 500; }
.who { font-size: 11px; color: var(--c-text-3); margin-left: auto; }
.note { font-size: 11.5px; color: var(--c-text-3); margin-top: 4px; line-height: 1.5; }

.ct-row--surgery .ct-dot { background: var(--c-critical); box-shadow: 0 0 0 2px var(--c-critical-bg); }
.ct-row--imaging .ct-dot { background: var(--c-accent);   box-shadow: 0 0 0 2px var(--c-accent-soft); }
.ct-row--lab .ct-dot     { background: var(--c-warning);  box-shadow: 0 0 0 2px var(--c-warning-bg); }

.empty { padding: 24px 0; text-align: center; color: var(--c-text-muted); font-size: 12px; }
</style>
