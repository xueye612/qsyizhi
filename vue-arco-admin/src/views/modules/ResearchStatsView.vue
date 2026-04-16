<!--
  ①模块理解：统计分析页登记已生成图表类型、分析主题与刷新时间（占位）。
  ②行业调研：分析名称、图表类型、负责人、刷新时间。
  ③页面设计：分析清单表 + 右侧提示结果解释边界。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="统计分析" desc="图表类型 · 刷新时间（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="今日刷新" hint="当日" :value="kpi.today" tone="primary" trend="时效" trend-dir="flat" />
        <MedStatCard label="生存分析" hint="KM 类" :value="kpi.km" tone="warning" trend="方法学" trend-dir="flat" />
        <MedStatCard label="报告数" hint="条目" :value="kpi.reports" tone="default" trend="产出" trend-dir="flat" />
        <MedStatCard label="合计" hint="全量" :value="kpi.total" tone="success" trend="目录" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="分析列表" desc="点击行选中 · 右侧为统计解读与对外展示提示">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: ResearchStatsRow) => r.id"
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
import { researchStatsKpis, seedResearchStats, type ResearchStatsRow } from '@/mock/researchMocks';

const data = ref(seedResearchStats());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => researchStatsKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `分析「${r.analysis}」图表 ${r.chartType}，负责人 ${r.owner}，刷新 ${r.refreshedAt}。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.chartType.includes('KM') ? '生存曲线：注意删失定义与比例风险假设。' : '描述图表：需报告置信区间或误差条（如适用）。',
    '对外展示须脱敏并附方法学附录。',
    'AI 摘要不能替代统计师签字版报告。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一行分析。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: ResearchStatsRow) {
  sel.value = r.id;
}

function rowClass(r: ResearchStatsRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 88 },
  { title: '分析', dataIndex: 'analysis', ellipsis: true, tooltip: true },
  { title: '图表', dataIndex: 'chartType', width: 100 },
  { title: '负责人', dataIndex: 'owner', width: 120 },
  { title: '刷新', dataIndex: 'refreshedAt', width: 145 }
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
