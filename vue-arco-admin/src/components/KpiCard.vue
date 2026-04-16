<template>
  <a-card :bordered="false" class="kpi" :class="{ hover }">
    <div class="body">
      <div class="k">{{ label }}</div>
      <div class="v" :class="tone">{{ value }}</div>
      <div class="foot">
        <span v-if="hint" class="h">{{ hint }}</span>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'normal' | 'danger' | 'muted';
  hover?: boolean;
}>();
</script>

<style scoped>
/* 网格子项需 min-width:0，避免在部分浏览器下有效宽度塌成极窄导致中文/数字逐字竖排 */
.kpi {
  width: 100%;
  min-width: 0;
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}
/* 勿对 card-body 做 flex 居中：Arco 卡片内部宽度链路易出现异常窄列 */
.kpi :deep(.arco-card-body) {
  box-sizing: border-box;
  padding: 14px 16px;
  min-height: 104px;
  height: 100%;
  display: block;
}
.body {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-height: 76px;
  box-sizing: border-box;
}
.kpi.hover {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.kpi.hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.08);
}
.k {
  font-size: 12px;
  line-height: 1.35;
  color: rgba(100, 116, 139, 0.95);
}
.v {
  font-size: 24px;
  font-weight: 900;
  line-height: 1.2;
  color: #0f172a;
   word-break: normal;
  overflow-wrap: normal;
}
.v.danger {
  color: #b91c1c;
}
.v.muted {
  color: #334155;
}
.foot {
  min-height: 18px;
}
.h {
  font-size: 12px;
  line-height: 1.35;
  color: rgba(100, 116, 139, 0.92);
  word-break: normal;
  overflow-wrap: normal;
}

@media (prefers-reduced-motion: reduce) {
  .kpi.hover {
    transition: none;
  }
  .kpi.hover:hover {
    transform: none;
  }
}
</style>
