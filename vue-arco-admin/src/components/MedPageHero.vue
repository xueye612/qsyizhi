<!--
  通用「页面 Hero 大标题」：对齐工作台 wb-topbar 的视觉量级
  - 左色条（按分组主题色）+ 圆形图标 + 标题/副标题
  - 中部 meta 数字（chips 自动派生为 K-V 数据条）
  - 右侧状态丸（就绪 / 加载中 / 加载失败 / 自定义）
  - props 兼容 MedPageHeader：title / desc / breadcrumb / badge / chips
-->
<template>
  <header class="med-hero" :class="`hero--${groupKey || 'default'}`">
    <div class="hero-accent" />
    <div class="hero-icon">
      <component :is="iconComp" />
    </div>

    <div class="hero-main">
      <nav v-if="breadcrumb && breadcrumb.length" class="bc" aria-label="breadcrumb">
        <template v-for="(b, i) in breadcrumb" :key="i">
          <span class="bc-i">{{ b }}</span>
          <span v-if="i < breadcrumb.length - 1" class="bc-sep">/</span>
        </template>
      </nav>
      <div class="title-line">
        <h1 class="title">{{ title }}</h1>
        <span v-if="badge" class="badge" :class="`badge--${badgeTone || 'primary'}`">{{ badge }}</span>
      </div>
      <p v-if="desc" class="desc">{{ desc }}</p>
    </div>

    <div v-if="metaChips.length" class="hero-meta">
      <template v-for="(c, i) in metaChips" :key="`m${i}`">
        <div class="meta-cell" :class="`meta--${c.tone || 'default'}`" :title="c.tip || ''">
          <span class="m-k">{{ c.label }}</span>
          <span class="m-v tabular">{{ c.value }}</span>
        </div>
        <div v-if="i < metaChips.length - 1" class="meta-sep" />
      </template>
    </div>

    <div class="hero-right">
      <span v-for="(p, i) in statusPills" :key="`p${i}`" class="pill" :class="`pill--${p.tone}`">
        <i class="d" />{{ p.text }}
      </span>
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  IconApps,
  IconArchive,
  IconBook,
  IconCalendar,
  IconCheckCircle,
  IconCommon,
  IconDashboard,
  IconExclamationCircle,
  IconFile,
  IconFolder,
  IconHistory,
  IconHome,
  IconNotification,
  IconRobot,
  IconSettings,
  IconStorage,
  IconThunderbolt,
  IconUser
} from '@arco-design/web-vue/es/icon';
import type { HeaderChip, HeaderChipTone } from './MedPageHeader.vue';

type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'default';

const props = withDefaults(
  defineProps<{
    title: string;
    desc?: string;
    breadcrumb?: string[];
    chips?: HeaderChip[];
    badge?: string;
    badgeTone?: HeaderChipTone;
    /** 显式分组主题（不传则按面包屑第二段或 group 名兜底） */
    groupKey?: string;
    /** 显式状态丸（不传则按 chips 自动派生：就绪 / 加载中 / 加载异常） */
    statusPills?: { text: string; tone: StatusTone }[];
  }>(),
  {
    desc: '',
    breadcrumb: () => [],
    chips: () => [],
    badge: '',
    badgeTone: 'primary',
    groupKey: '',
    statusPills: () => []
  }
);

/** 分组 -> 主题色 key（CSS 变量决定） */
const GROUP_THEME: Record<string, string> = {
  工作台: 'wb',
  患者管理: 'patient',
  随访管理: 'follow',
  报告中心: 'report',
  AI辅助: 'ai',
  供体管理: 'donor',
  财务结算: 'fin',
  科研中心: 'research',
  系统管理: 'sys'
};

const groupKey = computed(() => {
  if (props.groupKey) return props.groupKey;
  const seg = props.breadcrumb?.[1] || '';
  return GROUP_THEME[seg] || 'default';
});

/** 分组 -> 图标 */
const GROUP_ICON: Record<string, any> = {
  wb: IconDashboard,
  patient: IconUser,
  follow: IconCalendar,
  report: IconFile,
  ai: IconRobot,
  donor: IconHome,
  fin: IconStorage,
  research: IconBook,
  sys: IconSettings,
  default: IconCommon
};
const iconComp = computed(() => GROUP_ICON[groupKey.value] || IconCommon);

/** meta 区：取自 chips（最多 4 个），保留 K-V */
const metaChips = computed<HeaderChip[]>(() => (props.chips || []).slice(0, 4));

/** 状态丸：未显式传则按 chips 自动派生 */
const statusPills = computed(() => {
  if (props.statusPills && props.statusPills.length) return props.statusPills;
  const out: { text: string; tone: StatusTone }[] = [];
  const errChip = (props.chips || []).find((c) => String(c.value).includes('异常'));
  const loadingChip = (props.chips || []).find((c) => String(c.value).includes('加载中'));
  const emptyChip = (props.chips || []).find((c) => String(c.value).includes('暂无'));
  if (errChip) out.push({ text: '加载失败', tone: 'danger' });
  else if (loadingChip) out.push({ text: '加载中', tone: 'info' });
  else if (emptyChip) out.push({ text: '暂无数据', tone: 'warning' });
  else out.push({ text: '数据就绪', tone: 'success' });
  out.push({ text: '响应 < 100ms', tone: 'default' });
  return out;
});
</script>

<style scoped>
.med-hero {
  position: relative;
  display: grid;
  grid-template-columns: auto auto 1fr auto auto;
  align-items: center;
  gap: 14px;
  padding: 14px 18px 14px 22px;
  margin-bottom: 14px;
  border: 1px solid var(--med-border, #e5e6eb);
  border-radius: 12px;
  background:
    linear-gradient(135deg, var(--hero-bg-1, #f4f8ff) 0%, #ffffff 60%, var(--hero-bg-2, #fafbfc) 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, .03), 0 4px 12px rgba(31, 111, 235, .04);
  overflow: hidden;
}
.hero-accent {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--hero-accent-1, #1F6FEB), var(--hero-accent-2, #36cfc9));
}
.hero-icon {
  width: 44px; height: 44px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 12px;
  background: var(--hero-icon-bg, rgba(31,111,235,.1));
  color: var(--hero-accent-1, #1F6FEB);
  font-size: 22px;
  flex-shrink: 0;
}
.hero-main { min-width: 0; }
.bc {
  font-size: 12px;
  color: var(--med-muted, #86909c);
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  margin-bottom: 4px;
}
.bc-sep { opacity: .5; }
.bc-i:last-of-type { color: var(--med-text-2, #4e5969); font-weight: 500; }
.title-line { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--med-text, #1d2129);
  letter-spacing: -.01em;
}
.badge {
  font-size: 11px; font-weight: 600;
  padding: 1px 8px; border-radius: 999px;
  border: 1px solid; line-height: 18px;
}
.badge--default { color:#4e5969; border-color:#e5e6eb; background:#f7f8fa; }
.badge--primary { color:#1F6FEB; border-color:rgba(31,111,235,.3); background:rgba(31,111,235,.08); }
.badge--success { color:#237804; border-color:rgba(56,158,13,.3); background:rgba(56,158,13,.08); }
.badge--warning { color:#d25f00; border-color:rgba(212,107,8,.35); background:rgba(250,140,22,.08); }
.badge--danger  { color:#cb2634; border-color:rgba(245,63,63,.35); background:rgba(245,63,63,.06); }
.badge--info    { color:#08979c; border-color:rgba(19,194,194,.35); background:rgba(19,194,194,.08); }
.desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--med-muted, #86909c);
  line-height: 1.5;
}

.hero-meta {
  display: flex; align-items: center; gap: 14px;
  padding: 0 8px;
}
.meta-cell {
  display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
  min-width: 56px;
}
.m-k { font-size: 11px; color: var(--med-muted, #86909c); }
.m-v { font-size: 18px; font-weight: 700; color: var(--med-text, #1d2129); line-height: 1.1; }
.meta--primary .m-v { color: #1F6FEB; }
.meta--success .m-v { color: #237804; }
.meta--warning .m-v { color: #d25f00; }
.meta--danger  .m-v { color: #cb2634; }
.meta--info    .m-v { color: #08979c; }
.meta-sep { width: 1px; height: 28px; background: var(--med-border, #e5e6eb); }

.hero-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; line-height: 22px;
  padding: 0 10px; border-radius: 999px;
  border: 1px solid var(--med-border, #e5e6eb);
  background: #fff;
  color: var(--med-text-2, #4e5969);
}
.pill .d { width: 6px; height: 6px; border-radius: 50%; background: #c9cdd4; }
.pill--success { color: #237804; border-color: rgba(56,158,13,.3); background: rgba(56,158,13,.06); }
.pill--success .d { background: #38a169; }
.pill--warning { color: #d25f00; border-color: rgba(212,107,8,.35); background: rgba(250,140,22,.06); }
.pill--warning .d { background: #f59e0b; }
.pill--danger  { color: #cb2634; border-color: rgba(245,63,63,.35); background: rgba(245,63,63,.06); }
.pill--danger  .d { background: #f53f3f; }
.pill--info    { color: #08979c; border-color: rgba(19,194,194,.35); background: rgba(19,194,194,.06); }
.pill--info    .d { background: #13c2c2; }

/* 主题：分组配色（背景渐变 + 色条 + 图标底色） */
.hero--wb       { --hero-bg-1:#eef4ff; --hero-bg-2:#f7faff; --hero-accent-1:#1F6FEB; --hero-accent-2:#36cfc9; --hero-icon-bg:rgba(31,111,235,.1); }
.hero--patient  { --hero-bg-1:#fff0f4; --hero-bg-2:#fff7f9; --hero-accent-1:#eb3b5a; --hero-accent-2:#fa8c16; --hero-icon-bg:rgba(235,59,90,.1); }
.hero--follow   { --hero-bg-1:#fff5e6; --hero-bg-2:#fffaf2; --hero-accent-1:#fa8c16; --hero-accent-2:#ffd666; --hero-icon-bg:rgba(250,140,22,.12); }
.hero--report   { --hero-bg-1:#e6fffb; --hero-bg-2:#f5fffe; --hero-accent-1:#13c2c2; --hero-accent-2:#1F6FEB; --hero-icon-bg:rgba(19,194,194,.12); }
.hero--ai       { --hero-bg-1:#f0e6ff; --hero-bg-2:#faf5ff; --hero-accent-1:#722ed1; --hero-accent-2:#1F6FEB; --hero-icon-bg:rgba(114,46,209,.1); }
.hero--donor    { --hero-bg-1:#e6f9ee; --hero-bg-2:#f4fbf6; --hero-accent-1:#389e0d; --hero-accent-2:#13c2c2; --hero-icon-bg:rgba(56,158,13,.1); }
.hero--fin      { --hero-bg-1:#fffbe6; --hero-bg-2:#fffef5; --hero-accent-1:#d4a017; --hero-accent-2:#fa8c16; --hero-icon-bg:rgba(212,160,23,.12); }
.hero--research { --hero-bg-1:#e6f4ff; --hero-bg-2:#f5faff; --hero-accent-1:#0958d9; --hero-accent-2:#722ed1; --hero-icon-bg:rgba(9,88,217,.1); }
.hero--sys      { --hero-bg-1:#f5f5f5; --hero-bg-2:#fafafa; --hero-accent-1:#4e5969; --hero-accent-2:#86909c; --hero-icon-bg:rgba(78,89,105,.1); }
.hero--default  { --hero-bg-1:#f4f8ff; --hero-bg-2:#fafbfc; --hero-accent-1:#1F6FEB; --hero-accent-2:#36cfc9; --hero-icon-bg:rgba(31,111,235,.1); }

@media (max-width: 1100px) {
  .med-hero { grid-template-columns: auto 1fr auto; }
  .hero-icon { grid-row: 1 / 3; }
  .hero-meta { grid-column: 1 / -1; padding: 0; }
  .hero-right { grid-column: 1 / -1; justify-content: flex-end; }
}
</style>
