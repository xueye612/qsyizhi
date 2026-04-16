<template>
  <a-card :bordered="false" class="med-card">
    <header v-if="title" class="head">
      <h2 class="t">{{ title }}</h2>
      <p v-if="desc" class="s">{{ desc }}</p>
      <div v-if="$slots.actions" class="actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="body">
      <slot />
    </div>
  </a-card>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  desc?: string;
}>();
</script>

<style scoped>
.med-card{
  border-radius: var(--med-radius);
  border: 1px solid var(--med-border);
  background: var(--med-surface);
  box-shadow: var(--med-shadow);
}
.med-card :deep(.arco-card-body){
  padding: var(--med-card-pad);
}
.head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.t{
  margin:0;
  font-size: var(--med-fz-section-title);
  font-weight: var(--med-fw-section-title);
  line-height: 1.4;
  color: var(--med-text);
}
.s{
  margin:6px 0 0;
  font-size: var(--med-fz-body);
  font-weight: var(--med-fw-body);
  line-height: 1.5;
  color: var(--med-muted);
  max-width: 720px;
}
.actions{
  flex: 0 0 auto;
}
.body{min-width:0}
</style>

