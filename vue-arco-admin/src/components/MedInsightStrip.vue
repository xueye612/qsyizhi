<!--
  通用「页面仪表带」：在 hero 与 KPI 之间提供一条紧凑的洞察条
  - 卡 A：主分类分布（按可猜列：level/status/kind/type/priority）
  - 卡 B：时间趋势（按可猜日期列：createdAt/evaluatedAt/updatedAt/scheduledAt/...）
  - 卡 C：聚焦列表（按时间倒序前 3 条；标题列自适应）
  零配置：传入 rows + columns 即可工作；可通过 props 显式覆盖。
-->
<template>
  <div v-if="show" class="med-insight-strip">
    <!-- 分布 -->
    <section v-if="dist.length" class="ins-card ins-dist">
      <header class="ins-hd">
        <span class="ins-title">{{ distTitle }}</span>
        <span class="ins-sub">分布</span>
      </header>
      <div class="bar-stack" :title="distTitle">
        <span
          v-for="(d, i) in dist"
          :key="d.key"
          class="bar-seg"
          :class="`seg-${i % 6}`"
          :style="{ width: d.pct + '%' }"
          :title="`${d.key}: ${d.count} (${d.pct}%)`"
        />
      </div>
      <ul class="legend">
        <li v-for="(d, i) in dist" :key="`l${d.key}`" class="lg-i">
          <span class="lg-d" :class="`seg-${i % 6}`" />
          <span class="lg-k">{{ d.key }}</span>
          <span class="lg-v tabular">{{ d.count }}</span>
        </li>
      </ul>
    </section>

    <!-- 趋势 -->
    <section v-if="trend.points.length > 1" class="ins-card ins-trend">
      <header class="ins-hd">
        <span class="ins-title">{{ trend.title }}</span>
        <span class="ins-sub">近 {{ trend.points.length }} 期 · {{ trend.unit }}</span>
      </header>
      <svg class="spark" viewBox="0 0 200 60" preserveAspectRatio="none">
        <polyline
          :points="trendPolyline"
          fill="none"
          stroke="#1F6FEB"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
        <polyline
          :points="trendPolylineFill"
          fill="rgba(31,111,235,.10)"
          stroke="none"
        />
      </svg>
      <div class="t-foot">
        <span class="tabular">合计 {{ trend.total }}</span>
        <span class="tabular muted">峰值 {{ trend.peak }}</span>
      </div>
    </section>

    <!-- 聚焦 -->
    <section v-if="focus.length" class="ins-card ins-focus">
      <header class="ins-hd">
        <span class="ins-title">最新动态</span>
        <span class="ins-sub">{{ focus.length }} 条</span>
      </header>
      <ul class="focus-list">
        <li v-for="(f, i) in focus" :key="`f${i}`" class="focus-i">
          <span class="dot" />
          <span class="ftxt" :title="f.label">{{ f.label }}</span>
          <span class="ftime tabular">{{ f.time }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ColLike { dataIndex?: string; title?: string }
const props = withDefaults(
  defineProps<{
    rows: any[];
    columns?: ColLike[];
    /** 显式分布字段；不传则在 columns 中自动猜测 */
    distField?: string;
    /** 显式日期字段；不传则自动猜测 */
    dateField?: string;
    /** 显式聚焦显示字段；不传则取 patientName/name/title/label 兜底 id */
    focusField?: string;
    /** 趋势单位文案，默认 "条" */
    trendUnit?: string;
  }>(),
  {
    columns: () => [],
    distField: '',
    dateField: '',
    focusField: '',
    trendUnit: '条'
  }
);

const DIST_KEYS = /^(level|status|kind|type|priority|risk|grade|stage|state)$/i;
const DATE_KEYS = /(at|date|time|day)$/i;
const FOCUS_KEYS = ['patientName', 'name', 'title', 'label', 'reviewer'];

const distFieldFinal = computed<string>(() => {
  if (props.distField) return props.distField;
  const cols = props.columns || [];
  const c = cols.find((x) => x.dataIndex && DIST_KEYS.test(String(x.dataIndex)));
  return c?.dataIndex || '';
});
const distTitle = computed<string>(() => {
  const cols = props.columns || [];
  const c = cols.find((x) => x.dataIndex === distFieldFinal.value);
  return c?.title || distFieldFinal.value || '类别';
});

const dateFieldFinal = computed<string>(() => {
  if (props.dateField) return props.dateField;
  const cols = props.columns || [];
  const c = cols.find((x) => x.dataIndex && DATE_KEYS.test(String(x.dataIndex)));
  return c?.dataIndex || '';
});

const focusFieldFinal = computed<string>(() => {
  if (props.focusField) return props.focusField;
  const cols = props.columns || [];
  for (const k of FOCUS_KEYS) {
    if (cols.some((x) => x.dataIndex === k)) return k;
  }
  return cols[0]?.dataIndex || 'id';
});

interface DistItem { key: string; count: number; pct: number }
const dist = computed<DistItem[]>(() => {
  const f = distFieldFinal.value;
  if (!f || !props.rows?.length) return [];
  const map = new Map<string, number>();
  for (const r of props.rows) {
    const v = r?.[f];
    if (v == null || v === '') continue;
    const k = String(v);
    map.set(k, (map.get(k) || 0) + 1);
  }
  const total = Array.from(map.values()).reduce((a, b) => a + b, 0) || 1;
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
});

interface Trend { title: string; unit: string; points: number[]; total: number; peak: number }
const trend = computed<Trend>(() => {
  const f = dateFieldFinal.value;
  const cols = props.columns || [];
  const colTitle = cols.find((x) => x.dataIndex === f)?.title || '记录';
  const empty: Trend = { title: `${colTitle}趋势`, unit: props.trendUnit, points: [], total: 0, peak: 0 };
  if (!f || !props.rows?.length) return empty;
  // 桶到「日」
  const map = new Map<string, number>();
  for (const r of props.rows) {
    const raw = r?.[f];
    if (!raw) continue;
    const day = String(raw).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    map.set(day, (map.get(day) || 0) + 1);
  }
  if (map.size < 2) return empty;
  const days = Array.from(map.keys()).sort();
  const series = days.map((d) => map.get(d) || 0);
  const last = series.slice(-12);
  return {
    title: `${colTitle}趋势`,
    unit: props.trendUnit,
    points: last,
    total: last.reduce((a, b) => a + b, 0),
    peak: last.reduce((a, b) => Math.max(a, b), 0)
  };
});

const trendPolyline = computed(() => {
  const pts = trend.value.points;
  if (!pts.length) return '';
  const max = Math.max(1, ...pts);
  const w = 200, h = 60, pad = 4;
  return pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * (w - pad * 2) + pad;
      const y = h - pad - (v / max) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
});
const trendPolylineFill = computed(() => {
  const line = trendPolyline.value;
  if (!line) return '';
  const w = 200, h = 60;
  return `0,${h} ${line} ${w},${h}`;
});

interface FocusItem { label: string; time: string }
const focus = computed<FocusItem[]>(() => {
  const dF = dateFieldFinal.value;
  const lF = focusFieldFinal.value;
  if (!props.rows?.length) return [];
  const sorted = [...props.rows];
  if (dF) {
    sorted.sort((a, b) => String(b?.[dF] || '').localeCompare(String(a?.[dF] || '')));
  }
  return sorted.slice(0, 3).map((r) => ({
    label: String(r?.[lF] ?? r?.id ?? '—'),
    time: dF ? String(r?.[dF] || '').slice(0, 16) : ''
  }));
});

const show = computed(() => dist.value.length > 0 || trend.value.points.length > 1 || focus.value.length > 0);
</script>

<style scoped>
.med-insight-strip {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 10px;
  min-width: 0;
}
.ins-card {
  border: 1px solid var(--med-border, #e5e6eb);
  border-radius: var(--med-radius, 8px);
  background: #fff;
  padding: 10px 12px;
  min-height: 96px;
  display: flex; flex-direction: column; gap: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .02);
  min-width: 0;
}
.ins-hd { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.ins-title { font-size: 13px; font-weight: 600; color: var(--med-text, #1d2129); }
.ins-sub { font-size: 11px; color: var(--med-muted, #86909c); }

/* 分布条 */
.bar-stack {
  width: 100%; height: 10px; border-radius: 6px;
  background: #f2f3f5; overflow: hidden; display: flex;
}
.bar-seg { height: 100%; transition: width .25s ease; }
.legend { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 6px 12px; }
.lg-i { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--med-text-2, #4e5969); }
.lg-d { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
.lg-v { font-weight: 700; color: var(--med-text, #1d2129); }
.seg-0, .lg-d.seg-0 { background: #1F6FEB; }
.seg-1, .lg-d.seg-1 { background: #f59e0b; }
.seg-2, .lg-d.seg-2 { background: #38a169; }
.seg-3, .lg-d.seg-3 { background: #f53f3f; }
.seg-4, .lg-d.seg-4 { background: #722ed1; }
.seg-5, .lg-d.seg-5 { background: #13c2c2; }

/* 趋势 */
.spark { width: 100%; height: 60px; display: block; }
.t-foot { display: flex; justify-content: space-between; font-size: 11px; color: var(--med-text-2, #4e5969); }
.t-foot .muted { color: var(--med-muted, #86909c); }

/* 聚焦 */
.focus-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.focus-i {
  display: grid; grid-template-columns: 6px 1fr auto;
  align-items: center; gap: 8px; font-size: 12px;
}
.dot { width: 6px; height: 6px; border-radius: 50%; background: #1F6FEB; }
.ftxt { color: var(--med-text, #1d2129); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ftime { color: var(--med-muted, #86909c); font-size: 11px; }

@media (max-width: 1100px) {
  .med-insight-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ins-focus { grid-column: 1 / -1; }
}

@media (max-width: 720px) {
  .med-insight-strip { grid-template-columns: 1fr; }
  .ins-focus { grid-column: auto; }
  .ins-card { min-height: auto; }
}
</style>
