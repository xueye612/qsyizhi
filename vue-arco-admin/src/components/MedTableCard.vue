<template>
  <MedPageSection :title="title" :desc="desc">
    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
    <div class="tableWrap">
      <slot />
    </div>
  </MedPageSection>
</template>

<script setup lang="ts">
import MedPageSection from './MedPageSection.vue';

defineProps<{
  title: string;
  desc?: string;
}>();
</script>

<style scoped>
.tableWrap :deep(.arco-table-th){
  background: #fafafa !important;
}
.tableWrap :deep(.arco-table-tr:hover .arco-table-td){
  background: #f5f5f5 !important;
}
</style>

