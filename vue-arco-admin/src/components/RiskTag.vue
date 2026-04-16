<template>
  <a-tag :color="color" :size="compact ? 'small' : 'medium'" class="riskTag" :class="{ compact }">{{ text }}</a-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Level = 'high' | 'mid' | 'low';

const props = defineProps<{
  level: Level;
  /** 表格等密集场景：短文案 + 小尺寸 */
  compact?: boolean;
}>();

const color = computed(() => (props.level === 'high' ? 'red' : props.level === 'mid' ? 'orange' : 'green'));
const text = computed(() => {
  if (props.compact) {
    return props.level === 'high' ? '高' : props.level === 'mid' ? '中' : '低';
  }
  return props.level === 'high' ? '高风险' : props.level === 'mid' ? '中风险' : '低风险';
});
</script>

<style scoped>
.riskTag {
  font-weight: 600;
  border-radius: 999px;
}
.riskTag.compact {
  font-weight: 600;
  line-height: 1.2;
}
</style>

