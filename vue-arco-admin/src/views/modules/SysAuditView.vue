<!--
  ①模块理解：操作日志记录关键行为、对象与时间，支撑安全审计。
  ②行业调研：操作人、动作、目标资源、时间。
  ③页面设计：事件表 + 右侧提示敏感操作告警。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="操作日志" desc="行为 · 目标 · 时间（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="今日事件" hint="当日口径" :value="kpi.today" tone="primary" trend="活跃追踪" trend-dir="flat" />
        <MedStatCard label="敏感类" hint="高风险动作" :value="kpi.sensitive" tone="danger" trend="重点复核" trend-dir="flat" />
        <MedStatCard label="事件数" hint="去重后" :value="kpi.events" tone="default" trend="列表" trend-dir="flat" />
        <MedStatCard label="合计" hint="全量" :value="kpi.total" tone="success" trend="归档" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="审计记录" desc="点击行选中 · 右侧为异常行为模式提示">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: SysAuditRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1020 }"
          @row-click="onRow"
        />
      </MedTableCard>

      <div data-testid="ai-decision" class="ai-col">
        <MedAiSuggest :items="aiSuggestItems" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedPageHeader from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import { seedSysAudit, sysAuditKpis, type SysAuditRow } from '@/mock/sysMocks';

const data = ref(seedSysAudit());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => sysAuditKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `${r.operator} 于 ${r.at} 执行「${r.action}」，目标 ${r.target}。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.action.includes('导出') ? '导出类：确认是否经审批且脱敏策略生效。' : '权限变更：建议关联工单号。',
    '夜间或非工作时段批量操作可提高风险评分（占位）。',
    '日志应异地留存并防篡改。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一行日志。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: SysAuditRow) {
  sel.value = r.id;
}

function rowClass(r: SysAuditRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 72 },
  { title: '操作人', dataIndex: 'operator', width: 100 },
  { title: '动作', dataIndex: 'action', ellipsis: true, tooltip: true },
  { title: '目标', dataIndex: 'target', ellipsis: true, tooltip: true },
  { title: '时间', dataIndex: 'at', width: 145 }
];
</script>

<style scoped>
.med-page {
  box-sizing: border-box;
  padding: var(--med-page-pad);
  display: flex;
  flex-direction: column;
  gap: var(--med-gap);
  min-width: 0;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--med-gap);
  align-items: stretch;
}
.split {
  display: flex;
  gap: var(--med-gap);
  align-items: stretch;
  min-width: 0;
}
.ai-col {
  width: 360px;
  flex-shrink: 0;
  display: flex;
}
@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .split {
    flex-direction: column;
  }
  .ai-col {
    width: 100%;
  }
}
:deep(.row-selected .arco-table-td) {
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>
