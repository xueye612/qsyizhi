<template>
  <div class="med-toolbar">
    <div class="left">
      <a-input
        v-if="searchable"
        v-model="modelValueProxy"
        allow-clear
        :placeholder="searchPlaceholder"
        class="search"
      >
        <template #prefix>
          <icon-search />
        </template>
      </a-input>
      <div v-if="views && views.length" class="views">
        <button
          v-for="v in views"
          :key="v.key"
          type="button"
          class="view-chip"
          :class="{ 'view-chip--active': v.key === activeView }"
          :title="v.tip || ''"
          @click="onPickView(v.key)"
        >
          <span class="vt">{{ v.label }}</span>
          <span v-if="v.count != null" class="vc">{{ v.count }}</span>
        </button>
      </div>
      <div class="filters">
        <slot name="filters" />
      </div>
    </div>
    <div class="right">
      <slot name="extra" />
      <div v-if="densityToggle" class="density">
        <button
          type="button"
          class="dn"
          :class="{ 'dn--active': density === 'comfortable' }"
          title="标准密度"
          @click="onDensity('comfortable')"
        >标准</button>
        <button
          type="button"
          class="dn"
          :class="{ 'dn--active': density === 'compact' }"
          title="紧凑密度"
          @click="onDensity('compact')"
        >紧凑</button>
      </div>
      <a-dropdown v-if="columnOptions && columnOptions.length" trigger="click" :hide-on-select="false">
        <a-button title="列设置">
          <template #icon><icon-settings /></template>
          列 ({{ columnOptions.length - hiddenColumns.length }}/{{ columnOptions.length }})
        </a-button>
        <template #content>
          <div class="col-pop">
            <div class="col-pop-hd">
              <span>显示列</span>
              <a class="col-pop-rs" @click="resetColumns">重置</a>
            </div>
            <div class="col-pop-list">
              <label v-for="c in columnOptions" :key="c.key" class="col-pop-row">
                <a-checkbox
                  :model-value="!hiddenColumns.includes(c.key)"
                  @change="(v: any) => toggleCol(c.key, v)"
                />
                <span class="col-pop-lbl">{{ c.label }}</span>
              </label>
            </div>
          </div>
        </template>
      </a-dropdown>
      <a-button v-if="exportable" @click="$emit('export')">
        <template #icon><icon-download /></template>
        导出 CSV
      </a-button>
      <a-button v-if="refreshable" @click="$emit('refresh')">
        <template #icon><icon-refresh /></template>
        刷新
      </a-button>
      <a-popconfirm
        v-if="batchDeletable"
        content="确认删除已选中的多条记录？此操作不可撤销。"
        ok-text="删除"
        type="warning"
        @ok="$emit('batchDelete')"
      >
        <a-button status="danger" :disabled="!selectedCount">
          <template #icon><icon-delete /></template>
          批量删除 <span v-if="selectedCount">({{ selectedCount }})</span>
        </a-button>
      </a-popconfirm>
      <a-button v-if="creatable" type="primary" @click="$emit('create')">
        <template #icon><icon-plus /></template>
        {{ createText }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  IconDelete,
  IconDownload,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSettings
} from '@arco-design/web-vue/es/icon';

export type ToolbarDensity = 'comfortable' | 'compact';
export interface ToolbarView {
  key: string;
  label: string;
  count?: number;
  tip?: string;
}
export interface ToolbarColumnOption {
  key: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    searchPlaceholder?: string;
    searchable?: boolean;
    creatable?: boolean;
    createText?: string;
    exportable?: boolean;
    refreshable?: boolean;
    batchDeletable?: boolean;
    selectedCount?: number;
    views?: ToolbarView[];
    activeView?: string;
    densityToggle?: boolean;
    density?: ToolbarDensity;
    columnOptions?: ToolbarColumnOption[];
    hiddenColumns?: string[];
  }>(),
  {
    modelValue: '',
    searchPlaceholder: '搜索关键词',
    searchable: true,
    creatable: true,
    createText: '新增',
    exportable: true,
    refreshable: true,
    batchDeletable: false,
    selectedCount: 0,
    views: () => [],
    activeView: '',
    densityToggle: false,
    density: 'comfortable',
    columnOptions: () => [],
    hiddenColumns: () => []
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'update:activeView', v: string): void;
  (e: 'update:density', v: ToolbarDensity): void;
  (e: 'update:hiddenColumns', v: string[]): void;
  (e: 'create'): void;
  (e: 'export'): void;
  (e: 'refresh'): void;
  (e: 'batchDelete'): void;
  (e: 'pickView', v: string): void;
}>();

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v)
});

function onPickView(key: string) {
  emit('update:activeView', key);
  emit('pickView', key);
}
function onDensity(d: ToolbarDensity) {
  emit('update:density', d);
}
function toggleCol(key: string, visible: boolean) {
  const set = new Set(props.hiddenColumns || []);
  if (visible) set.delete(key);
  else set.add(key);
  emit('update:hiddenColumns', Array.from(set));
}
function resetColumns() {
  emit('update:hiddenColumns', []);
}
</script>

<style scoped>
.med-toolbar {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1 1 0;
  min-width: 0;
  overflow: visible;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
  margin-left: auto;
  justify-content: flex-end;
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1 1 auto;
  min-width: 0;
}

.search {
  width: 220px;
  flex: 0 0 220px;
  max-width: 100%;
  border-radius: 8px;
}

.views {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 auto;
  flex-wrap: wrap;
}
.view-chip {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--med-border, #e5e6eb);
  background: #fff;
  color: var(--med-text-2, #4e5969);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 140ms cubic-bezier(.2,.9,.25,1);
}
.view-chip:hover { border-color: rgba(31,111,235,.4); color: #1F6FEB; }
.view-chip--active {
  background: #1F6FEB;
  border-color: #1F6FEB;
  color: #fff;
  box-shadow: 0 2px 6px rgba(31,111,235,.25);
}
.view-chip .vc {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 11px;
  padding: 0 5px;
  border-radius: 8px;
  background: rgba(0,0,0,.06);
}
.view-chip--active .vc { background: rgba(255,255,255,.22); }

.density {
  display: inline-flex;
  border: 1px solid var(--med-border, #e5e6eb);
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}
.dn {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0 10px;
  height: 28px;
  font-size: 12px;
  color: var(--med-text-2, #4e5969);
  cursor: pointer;
}
.dn + .dn { border-left: 1px solid var(--med-border, #e5e6eb); }
.dn--active { background: rgba(31,111,235,.08); color: #1F6FEB; font-weight: 600; }

.filters :deep(.arco-select),
.filters :deep(.arco-picker) {
  width: 148px;
  max-width: 100%;
}

@media (max-width: 980px) {
  .med-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .left,
  .right {
    width: 100%;
    min-width: 0;
  }
  .right {
    justify-content: flex-start;
    margin-left: 0;
  }
}

@media (max-width: 720px) {
  .right :deep(.arco-btn),
  .right > .density,
  .right :deep(.arco-dropdown) {
    flex: 1 1 auto;
  }
  .search {
    width: 100%;
    flex-basis: 100%;
  }
  .filters :deep(.arco-select),
  .filters :deep(.arco-picker) {
    width: 100%;
  }
}
</style>

<style>
/* 列设置下拉（渲染到 body，需要非 scoped） */
.col-pop {
  width: 220px;
  padding: 6px 4px;
}
.col-pop-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px 8px;
  border-bottom: 1px solid #f2f3f5;
  font-size: 12px;
  color: #4e5969;
  font-weight: 600;
}
.col-pop-rs {
  font-size: 12px;
  color: #1F6FEB;
  cursor: pointer;
  font-weight: 500;
}
.col-pop-rs:hover { text-decoration: underline; }
.col-pop-list {
  max-height: 260px;
  overflow-y: auto;
  padding: 4px 0;
}
.col-pop-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  cursor: pointer;
  border-radius: 4px;
}
.col-pop-row:hover { background: #f5f7fa; }
.col-pop-lbl {
  font-size: 13px;
  color: #1d2129;
}
</style>
