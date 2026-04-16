<!--
  ①模块理解：系统配置集中管理字典、阈值与功能开关类参数。
  ②行业调研：参数键、值、作用域、更新时间。
  ③页面设计：参数表 + 右侧提示变更窗口与回滚。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="系统配置" desc="参数键 · 值 · 作用域（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="AI 相关" hint="作用域=AI" :value="kpi.ai" tone="primary" trend="灰度谨慎" trend-dir="flat" />
        <MedStatCard label="布尔型" hint="开关类" :value="kpi.boolish" tone="default" trend="配置项" trend-dir="flat" />
        <MedStatCard label="参数条数" hint="非合计" :value="kpi.params" tone="warning" trend="变更面" trend-dir="flat" />
        <MedStatCard label="合计" hint="全量" :value="kpi.total" tone="success" trend="目录" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="参数列表" desc="点击行选中 · 右侧为变更风险评估提示">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: SysCfgRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1000 }"
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
import { seedSysCfg, sysCfgKpis, type SysCfgRow } from '@/mock/sysMocks';

const data = ref(seedSysCfg());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => sysCfgKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `参数 ${r.paramKey} = ${r.paramValue}，作用域「${r.scope}」，更新 ${r.updatedAt}。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.scope === 'AI' ? 'AI 参数：建议先在沙箱验证再灰度。' : '业务参数：评估对随访/计费链路的影响面。',
    '变更需保留前后值对与审批单号（占位）。',
    '禁止在生产直接修改未文档化键名。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一行参数。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: SysCfgRow) {
  sel.value = r.id;
}

function rowClass(r: SysCfgRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 88 },
  { title: '参数键', dataIndex: 'paramKey', ellipsis: true, tooltip: true },
  { title: '值', dataIndex: 'paramValue', width: 120 },
  { title: '作用域', dataIndex: 'scope', width: 88 },
  { title: '更新', dataIndex: 'updatedAt', width: 110 }
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
