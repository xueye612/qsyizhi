<!--
  通用 CRUD 列表页骨架：
  - 顶部：标题 / 副标题 / KPI 卡片
  - 工具条：搜索 / 新增 / 导出 CSV / 刷新 / 批量删除
  - 主体：a-table + 内置「编辑 / 删除」操作列
  - 抽屉：MedRecordDrawer 支持新增 / 编辑 / 查看
  - 状态：加载 / 错误 / 空态
  让 28 个业务模块只需提供 schema 即可获得一致体验。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader :title="title" :desc="desc" />

      <div v-if="kpis && kpis.length" data-testid="kpi-region" class="kpi-grid">
        <MedStatCard
          v-for="(k, i) in kpis"
          :key="k.label + i"
          :label="k.label"
          :hint="k.hint"
          :value="k.value"
          :tone="k.tone || 'default'"
          :trend="k.trend || ''"
          trend-dir="flat"
        />
      </div>
    </MedPageSection>

    <MedTableCard :title="tableTitle || '数据列表'" :desc="tableDesc">
      <MedListToolbar
        v-model="crud.searchKey.value"
        :search-placeholder="searchPlaceholder"
        :selected-count="crud.checked.value.length"
        :batch-deletable="true"
        :create-text="createText"
        @create="crud.openCreate"
        @export="crud.exportCSV"
        @refresh="crud.refresh"
        @batch-delete="crud.removeChecked"
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
        @retry="crud.refresh"
      >
        <a-table
          data-testid="biz-table"
          :data="crud.rows.value"
          :columns="finalColumns"
          :pagination="pagination"
          :row-key="rowKey"
          :row-class="crud.rowClass"
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
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedPageHeader from './MedPageHeader.vue';
import MedPageSection from './MedPageSection.vue';
import MedTableCard from './MedTableCard.vue';
import MedStatCard from './MedStatCard.vue';
import MedListToolbar from './MedListToolbar.vue';
import MedPageStates from './MedPageStates.vue';
import MedRecordDrawer, { type FieldDef } from './MedRecordDrawer.vue';
import MedRowActions from './MedRowActions.vue';
import type { CrudListReturn } from '@/utils/useCrudList';

export type KpiDef = {
  label: string;
  hint?: string;
  value: string | number;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  trend?: string;
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
    canEdit?: boolean;
    canDelete?: boolean;
    canView?: boolean;
    selectable?: boolean;
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
    selectable: true
  }
);

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
  const cols = [...props.columns];
  if (props.canEdit || props.canDelete || props.canView) {
    cols.push({
      title: '操作',
      dataIndex: '__actions',
      width: opsWidth(),
      fixed: 'right',
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

const rowSelection = computed(() =>
  props.selectable
    ? {
        type: 'checkbox' as const,
        showCheckedAll: true,
        width: 44
      }
    : undefined
);

// resolveComponent 调用以避免 unused 警告（保留以便未来扩展）
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
