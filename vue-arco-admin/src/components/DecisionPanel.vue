<template>
  <div class="wrap">
    <slot name="primary" />
    <div v-if="$slots.secondary" class="gap" />
    <slot name="secondary" />
    <div v-if="$slots.actions" class="gap" />
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.wrap{
  display:flex;
  flex-direction:column;
  gap:16px;
}
.gap{height:0}
</style>

