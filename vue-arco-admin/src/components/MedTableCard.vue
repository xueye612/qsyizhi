<template>
  <MedPageSection :title="title" :desc="desc">
    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
    <div class="tableWrap" :class="[`density-${density}`]">
      <slot />
    </div>
  </MedPageSection>
</template>

<script setup lang="ts">
import MedPageSection from './MedPageSection.vue';

withDefaults(
  defineProps<{
    title: string;
    desc?: string;
    density?: 'comfortable' | 'compact';
  }>(),
  { density: 'comfortable' }
);
</script>

<style scoped>
.tableWrap{
  min-width: 0;
  width: 100%;
  overflow: hidden;
}
.tableWrap :deep(.arco-table-th) {
  background: #fafafa !important;
  font-weight: 600;
  color: var(--med-text-2, #4e5969);
}
.tableWrap :deep(.arco-table-tr:hover .arco-table-td) {
  background: #f5f7fa !important;
}
/* 紧凑密度 */
.tableWrap.density-compact :deep(.arco-table-td),
.tableWrap.density-compact :deep(.arco-table-th) {
  padding: 6px 10px !important;
}

.tableWrap :deep(.arco-table-container) {
  border-radius: var(--med-radius, 8px);
}

.tableWrap :deep(.arco-table-content-scroll-x) {
  overflow-x: auto;
}

.tableWrap :deep(.arco-table-pagination) {
  padding: 0 2px;
}

@media (max-width: 720px) {
  .tableWrap :deep(.arco-table-td),
  .tableWrap :deep(.arco-table-th) {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}
/* 行左侧色条（语义色调） */
.tableWrap :deep(.row-tone--danger .arco-table-td:first-child) {
  box-shadow: inset 3px 0 0 0 #f53f3f;
}
.tableWrap :deep(.row-tone--warning .arco-table-td:first-child) {
  box-shadow: inset 3px 0 0 0 #ff7d00;
}
.tableWrap :deep(.row-tone--success .arco-table-td:first-child) {
  box-shadow: inset 3px 0 0 0 #00b42a;
}
.tableWrap :deep(.row-tone--info .arco-table-td:first-child) {
  box-shadow: inset 3px 0 0 0 #1F6FEB;
}
</style>

