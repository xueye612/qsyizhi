<!--
  兼容包装：MedPageHeader 保留为薄壳，转发到 MedPageHero。
  HeaderChip / HeaderChipTone 类型继续从此文件导出，避免破坏 30+ 处既有 import。
-->
<template>
  <MedPageHero
    :title="title"
    :desc="desc"
    :breadcrumb="breadcrumb"
    :chips="chips"
    :badge="badge"
    :badge-tone="badgeTone"
  >
    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
  </MedPageHero>
</template>

<script setup lang="ts">
import MedPageHero from './MedPageHero.vue';

export type HeaderChipTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export interface HeaderChip {
  label: string;
  value: string | number;
  tone?: HeaderChipTone;
  tip?: string;
}

defineProps<{
  title: string;
  desc?: string;
  breadcrumb?: string[];
  chips?: HeaderChip[];
  badge?: string;
  badgeTone?: HeaderChipTone;
}>();
</script>
