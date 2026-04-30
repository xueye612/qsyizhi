<template>
  <div class="med-states">
    <div v-if="loading" class="state loading">
      <a-spin :size="28" />
      <div class="msg">{{ loadingText }}</div>
    </div>
    <div v-else-if="error" class="state error">
      <icon-exclamation-circle-fill class="icon" />
      <div class="msg">{{ errorText }}</div>
      <a-button type="outline" status="warning" @click="$emit('retry')">重试</a-button>
    </div>
    <div v-else-if="empty" class="state empty">
      <svg width="120" height="84" viewBox="0 0 120 84" fill="none" aria-hidden="true">
        <rect x="14" y="20" width="92" height="50" rx="8" fill="#F2F4F8" />
        <rect x="24" y="32" width="50" height="6" rx="3" fill="#D9DEE6" />
        <rect x="24" y="44" width="72" height="6" rx="3" fill="#E5E9EF" />
        <rect x="24" y="56" width="36" height="6" rx="3" fill="#E5E9EF" />
        <circle cx="92" cy="22" r="10" fill="#DDE6F5" />
        <path d="M88 22h8M92 18v8" stroke="#1677FF" stroke-width="2" stroke-linecap="round" />
      </svg>
      <div class="msg">{{ emptyText }}</div>
      <slot name="empty-action" />
    </div>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { IconExclamationCircleFill } from '@arco-design/web-vue/es/icon';

withDefaults(
  defineProps<{
    loading?: boolean;
    error?: string | null | false;
    empty?: boolean;
    loadingText?: string;
    emptyText?: string;
    errorText?: string;
  }>(),
  {
    loading: false,
    error: null,
    empty: false,
    loadingText: '加载中…',
    emptyText: '暂无数据',
    errorText: '加载失败，请稍后重试'
  }
);

defineEmits<{
  (e: 'retry'): void;
}>();
</script>

<style scoped>
.med-states {
  width: 100%;
}
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 36px 16px;
}
.state.error .icon {
  color: #f53f3f;
  font-size: 28px;
}
.state .msg {
  color: var(--med-muted);
  font-size: 13px;
}
</style>
