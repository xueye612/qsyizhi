<template>
  <header class="med-page-header">
    <h1 class="title">{{ title }}</h1>
    <p v-if="desc" class="desc">{{ desc }}</p>
    <div v-if="$slots.extra" class="extra">
      <slot name="extra" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  desc?: string;
}>();
</script>

<style scoped>
.med-page-header{
  padding-top: 2px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--med-border);
}
.title{
  margin: 0;
  font-size: var(--med-fz-page-title);
  font-weight: var(--med-fw-page-title);
  line-height: 1.45;
  color: var(--med-text);
}
.desc{
  margin: 8px 0 0;
  font-size: var(--med-fz-body);
  font-weight: var(--med-fw-body);
  line-height: 1.5;
  color: var(--med-muted);
  max-width: 720px;
}
.extra{
  margin-top: 12px;
}
</style>

