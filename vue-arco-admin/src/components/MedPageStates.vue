<template>
  <div class="med-states">
    <div v-if="loading" class="state loading">
      <a-spin :size="28" />
      <div class="msg">{{ loadingText }}</div>
      <div v-if="loadingHint" class="sub">{{ loadingHint }}</div>
    </div>
    <div v-else-if="error" class="state error">
      <icon-exclamation-circle-fill class="icon" />
      <div class="msg">{{ errorText }}</div>
      <div v-if="errorHint" class="sub">{{ errorHint }}</div>
      <a-button type="outline" status="warning" @click="$emit('retry')">
        <template #icon><icon-refresh /></template>
        重试
      </a-button>
    </div>
    <div v-else-if="empty" class="state empty">
      <svg width="140" height="96" viewBox="0 0 140 96" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="med-empty-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#F5F8FF" />
            <stop offset="1" stop-color="#EAF2FF" />
          </linearGradient>
        </defs>
        <rect x="14" y="22" width="112" height="60" rx="10" fill="url(#med-empty-bg)" stroke="#DDE6F5" />
        <rect x="26" y="34" width="56" height="7" rx="3.5" fill="#D9E2F0" />
        <rect x="26" y="48" width="86" height="7" rx="3.5" fill="#E5ECF7" />
        <rect x="26" y="62" width="42" height="7" rx="3.5" fill="#E5ECF7" />
        <circle cx="108" cy="24" r="12" fill="#1F6FEB" fill-opacity="0.12" />
        <path d="M103 24h10M108 19v10" stroke="#1F6FEB" stroke-width="2" stroke-linecap="round" />
      </svg>
      <div class="msg">{{ emptyText }}</div>
      <div v-if="emptyHint" class="sub">{{ emptyHint }}</div>
      <slot name="empty-action" />
    </div>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { IconExclamationCircleFill, IconRefresh } from '@arco-design/web-vue/es/icon';

withDefaults(
  defineProps<{
    loading?: boolean;
    error?: string | null | false;
    empty?: boolean;
    loadingText?: string;
    loadingHint?: string;
    emptyText?: string;
    emptyHint?: string;
    errorText?: string;
    errorHint?: string;
  }>(),
  {
    loading: false,
    error: null,
    empty: false,
    loadingText: '加载中…',
    loadingHint: '',
    emptyText: '暂无数据',
    emptyHint: '可调整筛选条件或新增一条记录',
    errorText: '加载失败，请稍后重试',
    errorHint: '请检查网络连接或联系管理员'
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
  gap: 8px;
  padding: 40px 16px;
}
.state.error .icon {
  color: #f53f3f;
  font-size: 28px;
}
.state .msg {
  color: var(--med-text, #1d2129);
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
}
.state .sub {
  color: var(--med-muted, #86909c);
  font-size: 12px;
  margin-top: -2px;
  margin-bottom: 6px;
}
</style>
