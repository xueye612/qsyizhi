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
      <slot name="filters" />
    </div>
    <div class="right">
      <slot name="extra" />
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
  IconSearch
} from '@arco-design/web-vue/es/icon';

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
    selectedCount: 0
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'create'): void;
  (e: 'export'): void;
  (e: 'refresh'): void;
  (e: 'batchDelete'): void;
}>();

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v)
});
</script>

<style scoped>
.med-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.left,
.right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.search {
  width: 260px;
  max-width: 100%;
  border-radius: 8px;
}
@media (max-width: 720px) {
  .search {
    width: 100%;
  }
}
</style>
