<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader :title="pageTitle" :desc="subtitle" />

      <div class="queryBar">
        <div class="qItem">
          <div class="qlabel">搜索</div>
          <a-input v-model="q" allow-clear class="q" placeholder="标题 / 编号 / 备注" />
        </div>
        <div class="qItem">
          <div class="qlabel">状态</div>
          <a-select v-model="status" class="sel">
            <a-option value="all">全部</a-option>
            <a-option value="进行中">进行中</a-option>
            <a-option value="待审核">待审核</a-option>
            <a-option value="已完成">已完成</a-option>
            <a-option value="已暂停">已暂停</a-option>
            <a-option value="待分配">待分配</a-option>
          </a-select>
        </div>
      </div>

      <div class="kpi-grid">
        <MedStatCard
          v-for="(k, idx) in kpiMedDefs"
          :key="idx"
          :label="k.label"
          :value="k.value"
          :tone="k.tone"
          :trend="k.trend"
          trend-dir="flat"
        />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="列表" desc="点击行选中 · 右侧展示当前条目与流程提示（模拟）">
        <a-table
          :data="rowsFiltered"
          :columns="columns"
          :pagination="{ pageSize: 10, showTotal: true }"
          :row-key="(r: any) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 880 }"
          @row-click="onRowClick"
        />
      </MedTableCard>

      <div class="rightCol">
        <MedPageSection title="当前条目" :desc="selected ? selected.title : '—'">
          <div v-if="selected" class="detailLines">
            <div class="line"><b>编号</b><span class="mono">{{ selected.id }}</span></div>
            <div class="line"><b>状态</b>{{ selected.status }}</div>
            <div class="line"><b>责任人</b>{{ selected.owner }}</div>
            <div class="line"><b>更新</b>{{ fmt(selected.updatedAt) }}</div>
            <div class="line"><b>备注</b>{{ selected.remark }}</div>
          </div>
          <div v-else class="empty">请从左侧列表选择一条记录。</div>
        </MedPageSection>

        <MedAiSuggest :items="aiSuggestItems" />

        <MedPageSection title="操作" desc="流程占位">
          <div class="btns">
            <a-button type="primary" class="btn-primary" :disabled="!selected">处理（占位）</a-button>
            <a-button :disabled="!selected">导出（占位）</a-button>
          </div>
        </MedPageSection>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { TableColumnData } from '@arco-design/web-vue';
import { MENU } from '@/menu/menu';
import MedPageHeader from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import { moduleKpis, moduleRows, moduleSubtitle, type ModuleRow } from '@/mock/modulePages';

const route = useRoute();

const routeKey = computed(() => String(route.name || ''));
const pageTitle = computed(() => String(route.meta?.title || routeKey.value || '模块'));
const groupName = computed(() => {
  const g = MENU.find((x) => x.items.some((it) => it.key === routeKey.value));
  return g?.group || '';
});

const subtitle = computed(() => moduleSubtitle(routeKey.value, groupName.value));

const allRows = computed(() => moduleRows(routeKey.value, pageTitle.value));
const kpiDefs = computed(() => moduleKpis(routeKey.value));

const q = ref('');
const status = ref<string>('all');
const selectedId = ref<string | null>(null);

watch(
  [allRows, routeKey],
  () => {
    selectedId.value = allRows.value[0]?.id ?? null;
  },
  { immediate: true }
);

const selected = computed(() => allRows.value.find((r) => r.id === selectedId.value) ?? null);

const rowsFiltered = computed(() => {
  let list = [...allRows.value];
  const qq = q.value.trim().toLowerCase();
  if (qq) {
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(qq) ||
        r.id.toLowerCase().includes(qq) ||
        r.remark.toLowerCase().includes(qq)
    );
  }
  if (status.value !== 'all') list = list.filter((r) => r.status === status.value);
  return list;
});

watch(rowsFiltered, () => {
  const ids = new Set(rowsFiltered.value.map((r) => r.id));
  if (selectedId.value && !ids.has(selectedId.value)) {
    selectedId.value = rowsFiltered.value[0]?.id ?? null;
  }
});

function fmt(iso: string) {
  return iso ? iso.slice(0, 19).replace('T', ' ') : '—';
}

function onRowClick(record: ModuleRow) {
  selectedId.value = record.id;
}

function rowClass(record: ModuleRow) {
  return record.id === selectedId.value ? 'row-selected' : '';
}

const kpiMedDefs = computed(() => {
  return kpiDefs.value.map((k) => {
    const tone = k.tone === 'danger' ? 'danger' : 'default';
    const trend = k.label === '预警' ? (Number(k.value) > 0 ? '存在预警：建议优先核对' : '暂无预警') : '—';
    return { label: k.label, value: k.value, tone, trend } as const;
  });
});

const decisionHint = computed(() => {
  const r = selected.value;
  if (!r) return '';
  if (r.status === '待审核') return '建议完成合规核对后再变更状态。';
  if (r.status === '待分配') return '可指定责任人并设置处理时限。';
  if (r.status === '已暂停') return '确认暂停原因并记录恢复条件。';
  if (r.status === '已完成') return '可归档或生成摘要供随访引用。';
  return '按科室规范推进，并保留关键操作痕迹。';
});

const aiSuggestItems = computed(() => {
  const r = selected.value;
  if (!r) return ['请先从左侧列表选择一条记录。', 'AI辅助建议仅供流程提示。'];
  return [
    `状态「${r.status}」：${decisionHint.value}`,
    '建议在关键环节保留审批链路与可追溯日志（演示）。',
    'AI辅助建议仅供提示，不替代业务/临床/财务规则。'
  ];
});

const columns = computed<TableColumnData[]>(() => [
  { title: '编号', dataIndex: 'id', width: 140 },
  { title: '事项', dataIndex: 'title', ellipsis: true, tooltip: true },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: any) => {
      const r = record as ModuleRow;
      const ATag = resolveComponent('a-tag') as any;
      const color =
        r.status === '已完成'
          ? 'green'
          : r.status === '待审核'
            ? 'orangered'
            : r.status === '已暂停'
              ? 'gray'
              : 'arcoblue';
      return h(ATag, { color }, () => r.status);
    }
  },
  { title: '责任人', dataIndex: 'owner', width: 100 },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: 170,
    render: ({ record }: any) => fmt((record as ModuleRow).updatedAt)
  },
  { title: '备注', dataIndex: 'remark', width: 120, ellipsis: true, tooltip: true }
]);
</script>

<style scoped>
.med-page{
  box-sizing: border-box;
  padding: var(--med-page-pad);
  display: flex;
  flex-direction: column;
  gap: var(--med-gap);
  min-width: 0;
}

.queryBar{
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.qItem{
  display: flex;
  align-items: center;
  gap: 10px;
}
.qlabel{
  font-size: 13px;
  color: var(--med-muted);
}

.kpi-grid{
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--med-gap);
  align-items: stretch;
}

.split{
  display: flex;
  gap: var(--med-gap);
  align-items: stretch;
  min-width: 0;
}
.rightCol{
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--med-gap);
}

.detailLines{
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: var(--med-fz-body);
  color: var(--med-text);
  line-height: 1.6;
}
.line{
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 10px;
}
.line b{
  font-weight: 500;
  color: var(--med-text-2);
}
.mono{
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.empty{
  font-size: var(--med-fz-body);
  color: var(--med-muted);
  line-height: 1.6;
}

.btns{
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn-primary{
  background: var(--med-primary);
  border-color: var(--med-primary);
}

@media (max-width: 1100px){
  .split{ flex-direction: column; }
  .rightCol{ width: 100%; }
  .kpi-grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .q{ width: 100%; }
}

:deep(.row-selected .arco-table-td){
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>

