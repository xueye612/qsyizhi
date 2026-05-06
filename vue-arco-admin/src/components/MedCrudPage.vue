<!--
  通用 CRUD 列表页骨架：
  - 顶部：面包屑 / 标题 / 状态 chips / KPI（带 sparkline）
  - 工具条：搜索 / 视图切片 / 密度切换 / 新增 / 导出 / 刷新 / 批量删
  - 主体：a-table + 内置「编辑 / 删除」操作列
  - 抽屉：MedRecordDrawer 支持新增 / 编辑 / 查看
  - 状态：加载 / 错误 / 空态
-->
<template>
  <div class="med-page">
    <MedPageHero
      :title="title"
      :desc="desc"
      :breadcrumb="breadcrumbFinal"
      :badge="badgeFinal"
      badge-tone="primary"
      :chips="chipsFinal"
    >
      <template v-if="$slots['header-actions']" #actions>
        <slot name="header-actions" />
      </template>
    </MedPageHero>

    <MedInsightStrip
      v-if="insights !== false"
      :rows="crud?.allRows?.value || []"
      :columns="columns"
    />

    <div v-if="kpis && kpis.length" data-testid="kpi-region" class="kpi-grid">
      <MedStatCard
        v-for="(k, i) in kpis"
        :key="k.label + i"
        :label="k.label"
        :hint="k.hint"
        :value="k.value"
        :tone="k.tone || 'default'"
        :trend="k.trend || ''"
        :sparkline="k.sparkline || autoSpark(i, k.value)"
        trend-dir="flat"
        :clickable="!!k.viewKey"
        :selected="!!k.viewKey && activeViewProxy === k.viewKey"
        @click="onKpiClick(k)"
      />
    </div>

    <slot name="pre-table" />

    <MedTableCard :title="tableTitle || '数据列表'" :desc="tableDesc" :density="density">
      <MedListToolbar
        v-model="crud.searchKey.value"
        :search-placeholder="searchPlaceholder"
        :selected-count="crud.checked.value.length"
        :batch-deletable="true"
        :create-text="createText"
        :views="views"
        v-model:active-view="activeViewProxy"
        density-toggle
        v-model:density="density"
        :column-options="columnOptions"
        v-model:hidden-columns="hiddenColumns"
        @create="crud.openCreate"
        @export="crud.exportCSV"
        @refresh="crud.refresh"
        @batch-delete="crud.removeChecked"
        @pick-view="(k: string) => $emit('pickView', k)"
      >
        <template #filters>
          <slot name="filters" />
        </template>
        <template #extra>
          <slot name="toolbar-extra" />
        </template>
      </MedListToolbar>

      <MedPageStates
        :loading="crud.loading.value"
        :error="crud.errorText.value"
        :empty="!crud.loading.value && !crud.errorText.value && crud.rows.value.length === 0"
        :empty-hint="emptyHint"
        @retry="crud.refresh"
      >
        <template #empty-action>
          <a-button type="primary" @click="crud.openCreate">{{ createText }}</a-button>
        </template>
        <a-table
          data-testid="biz-table"
          :data="crud.rows.value"
          :columns="finalColumns"
          :pagination="pagination"
          :row-key="rowKey"
          :row-class="combinedRowClass"
          :row-selection="rowSelection"
          :selected-keys="crud.checked.value"
          :scroll="{ x: scrollX }"
          @row-click="crud.onRowClick"
          @selection-change="(keys: any) => (crud.checked.value = keys)"
        />
      </MedPageStates>
    </MedTableCard>

    <slot name="extra" :selected="crud.selected.value" />

    <MedRecordDrawer
      v-model:visible="crud.drawerVisible.value"
      :mode="crud.drawerMode.value"
      :fields="fields"
      :record="crud.drawerRecord.value"
      :title="drawerTitleFinal"
      @submit="crud.onSubmit"
    >
      <template #view="sp">
        <slot name="drawer-view" :record="sp.record" :mode="sp.mode" />
      </template>
    </MedRecordDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import { useRoute } from 'vue-router';
import type { TableColumnData } from '@arco-design/web-vue';
import MedPageHeader, { type HeaderChip } from './MedPageHeader.vue';
import MedPageHero from './MedPageHero.vue';
import MedInsightStrip from './MedInsightStrip.vue';
// MedPageHeader / MedPageSection kept imported for backward-compat & types
void MedPageHeader;
import MedPageSection from './MedPageSection.vue';
void MedPageSection;
import MedTableCard from './MedTableCard.vue';
import MedStatCard from './MedStatCard.vue';
import MedListToolbar, { type ToolbarDensity, type ToolbarView, type ToolbarColumnOption } from './MedListToolbar.vue';
import MedPageStates from './MedPageStates.vue';
import MedRecordDrawer, { type FieldDef } from './MedRecordDrawer.vue';
import MedRowActions from './MedRowActions.vue';
import { MENU } from '@/menu/menu';
import type { CrudListReturn } from '@/utils/useCrudList';

export type KpiDef = {
  label: string;
  hint?: string;
  value: string | number;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  trend?: string;
  /** 可选：自定义 sparkline 数据（不传则自动生成） */
  sparkline?: number[];
  /** 可选：点击后切换到该视图切片（需与 views[].key 对应） */
  viewKey?: string;
};

const props = withDefaults(
  defineProps<{
    title: string;
    desc?: string;
    tableTitle?: string;
    tableDesc?: string;
    drawerTitle?: string;
    searchPlaceholder?: string;
    createText?: string;
    kpis?: KpiDef[];
    columns: TableColumnData[];
    fields: FieldDef[];
    crud: CrudListReturn<any>;
    pagination?: any;
    scrollX?: number;
    rowKey?: string;
    rowClass?: (row: any) => string;
    canEdit?: boolean;
    canDelete?: boolean;
    canView?: boolean;
    selectable?: boolean;
    /** 顶部状态 chips（不传则自动生成「共 N 条 / 已选 / 当前 / 已过滤」） */
    chips?: HeaderChip[];
    views?: ToolbarView[];
    activeView?: string;
    /** 面包屑（不传则从路由 + MENU 自动生成） */
    breadcrumb?: string[];
    /** 标题旁徽章（不传则显示总条数） */
    badge?: string;
    /** 是否显示 hero 下方的洞察条（分布 / 趋势 / 聚焦），默认显示 */
    insights?: boolean;
  }>(),
  {
    desc: '',
    tableTitle: '',
    tableDesc: '点击行选中 · 行末可执行查看 / 编辑 / 删除',
    drawerTitle: '',
    searchPlaceholder: '搜索关键词',
    createText: '新增',
    kpis: () => [],
    pagination: () => ({ pageSize: 10, showTotal: true, showJumper: false }),
    scrollX: 1100,
    rowKey: 'id',
    canEdit: true,
    canDelete: true,
    canView: false,
    selectable: true,
    chips: () => [],
    views: () => [],
    activeView: '',
    breadcrumb: () => [],
    badge: '',
    insights: true
  }
);

const emit = defineEmits<{
  (e: 'update:activeView', v: string): void;
  (e: 'pickView', v: string): void;
}>();

const density = ref<ToolbarDensity>('comfortable');
const hiddenColumns = ref<string[]>([]);

const columnOptions = computed<ToolbarColumnOption[]>(() =>
  props.columns
    .filter((c: any) => c && c.dataIndex && c.title)
    .map((c: any) => ({ key: String(c.dataIndex), label: String(c.title) }))
);

const activeViewProxy = computed({
  get: () => props.activeView,
  set: (v: string) => emit('update:activeView', v)
});

const route = useRoute();
const breadcrumbFinal = computed(() => {
  if (props.breadcrumb && props.breadcrumb.length) return props.breadcrumb;
  const key = String(route?.name || '');
  const g = MENU.find((x) => x.items.some((it) => it.key === key));
  const groupName = g?.group || '';
  return groupName ? ['工作台', groupName, props.title] : ['工作台', props.title];
});

const emptyHint = computed(() => {
  const total = props.crud?.allRows?.value?.length ?? 0;
  const sk = String(props.crud?.searchKey?.value ?? '').trim();
  if (sk) return `没有匹配「${sk}」的记录，可清除搜索或调整筛选`;
  if (total > 0) return '当前筛选条件下没有数据，可重置筛选';
  return '可以点击「' + props.createText + '」创建第一条记录';
});

const badgeFinal = computed(() => {
  if (props.badge) return props.badge;
  const total = props.crud?.allRows?.value?.length ?? 0;
  return total > 0 ? `共 ${total} 条` : '';
});

const chipsFinal = computed<HeaderChip[]>(() => {
  if (props.chips && props.chips.length) return props.chips;
  const total = props.crud?.allRows?.value?.length ?? 0;
  const filtered = props.crud?.rows?.value?.length ?? 0;
  const checked = props.crud?.checked?.value?.length ?? 0;
  const out: HeaderChip[] = [];
  if (filtered !== total) {
    out.push({ label: '当前筛选', value: filtered, tone: 'primary' });
  }
  if (checked > 0) {
    out.push({ label: '已选中', value: checked, tone: 'warning' });
  }
  if (props.crud?.errorText?.value) {
    out.push({ label: '状态', value: '加载异常', tone: 'danger' });
  } else if (props.crud?.loading?.value) {
    out.push({ label: '状态', value: '加载中', tone: 'info' });
  } else if (total === 0) {
    out.push({ label: '提示', value: '暂无数据', tone: 'info' });
  } else {
    out.push({ label: '状态', value: '就绪', tone: 'success' });
  }
  return out;
});

function onKpiClick(k: KpiDef) {
  if (!k.viewKey) return;
  const next = activeViewProxy.value === k.viewKey && (props.views?.find((v) => v.key === 'all'))
    ? 'all'
    : k.viewKey;
  emit('update:activeView', next);
  emit('pickView', next);
}

function autoSpark(seed: number, value: string | number) {
  const base = typeof value === 'number'
    ? Math.max(20, Math.min(100, Math.round(value * 5) || 40))
    : 40 + ((String(value).length * 7) % 30);
  const arr: number[] = [];
  let v = base;
  for (let i = 0; i < 12; i++) {
    v += Math.sin((i + seed * 1.3) * 0.7) * 6 + ((seed + i) % 5) - 2;
    arr.push(Math.max(0, Math.round(v)));
  }
  return arr;
}

const drawerTitleFinal = computed(
  () =>
    props.drawerTitle ||
    (props.crud.drawerMode.value === 'create'
      ? `新增${props.title}`
      : props.crud.drawerMode.value === 'edit'
      ? `编辑${props.title}`
      : `查看${props.title}详情`)
);

const finalColumns = computed<TableColumnData[]>(() => {
  const hidden = new Set(hiddenColumns.value);
  const cols = props.columns.filter((c: any) => !hidden.has(String(c?.dataIndex || '')));
  if (props.canEdit || props.canDelete || props.canView) {
    cols.push({
      title: '操作',
      dataIndex: '__actions',
      width: opsWidth(),
      render: ({ record }: { record: any }) => {
        return h(MedRowActions as any, {
          canView: props.canView,
          canEdit: props.canEdit,
          canDelete: props.canDelete,
          onView: () => props.crud.openView(record),
          onEdit: () => props.crud.openEdit(record),
          onDelete: () => props.crud.removeRow(record.id)
        });
      }
    });
  }
  return cols;
});

function opsWidth() {
  let w = 16;
  if (props.canView) w += 52;
  if (props.canEdit) w += 52;
  if (props.canDelete) w += 60;
  return w;
}

/** 行左侧色条：从 row 中嗅探 level/risk/status/priority 字段的词面，返回语义色调类 */
function toneFromRow(row: any): string {
  if (!row) return '';
  const fields = ['level', 'risk', 'priority', 'status', 'state', 'grade'];
  for (const f of fields) {
    const v = row[f];
    if (v == null || v === '') continue;
    const s = String(v);
    if (/(高|红|危|危重|逐严|危险|逐重|critical|high|danger|fail|error|reject|overdue|逾期)/i.test(s)) return 'row-tone--danger';
    if (/(中|黄|警|警告|warn|warning|pending|待|处理中)/i.test(s)) return 'row-tone--warning';
    if (/(低|绿|优|正常|成功|已完成|已通过|done|success|ok|pass|approved|active)/i.test(s)) return 'row-tone--success';
    return 'row-tone--info';
  }
  return '';
}
function combinedRowClass(row: any): string {
  const base = props.crud.rowClass(row) || '';
  const extra = props.rowClass?.(row) || '';
  const tone = toneFromRow(row);
  return [base, extra, tone].filter(Boolean).join(' ');
}

const rowSelection = computed(() =>
  props.selectable
    ? {
        type: 'checkbox' as const,
        showCheckedAll: true,
        width: 44
      }
    : undefined
);

void resolveComponent;
</script>

<style scoped>
.med-page {
  box-sizing: border-box;
  padding: var(--med-page-pad);
  display: flex;
  flex-direction: column;
  gap: var(--med-gap);
  min-width: 0;
}
.kpi-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--med-gap);
  align-items: stretch;
}
@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
:deep(.row-selected .arco-table-td) {
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>
