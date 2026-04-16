<template>
  <a-card :bordered="false" style="box-shadow: 0 10px 30px rgba(0,0,0,0.06); border-radius: 14px;">
    <a-typography-title :heading="5" style="margin: 0 0 8px 0;">
      {{ title }}
    </a-typography-title>
    <a-typography-text type="secondary">
      该模块为占位页：后续可按优先级逐步实现具体业务功能。
    </a-typography-text>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = computed(() => String(route.meta.title || route.name || '模块'));
</script>

