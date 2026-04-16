<!--
  ①模块理解：风险识别将会话外数据（检验、随访、依从）规则化/模型化打分，支撑分诊与主管医师优先处理。
  ②行业调研：风险分、等级、规则命中码、因子解释、评估时间、复核人；KPI：高/中风险数、未复核量、均分。
  ③页面设计：风险队列表 + 右侧说明规则局限与人工复核必达场景。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="AI 风险识别" desc="规则引擎 + 风险评分（演示）· 结果需人工确认后进入处置流程" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="高风险条目" hint="level=高" :value="kpi.high" tone="danger" trend="优先处置" trend-dir="flat" />
        <MedStatCard label="中风险条目" hint="level=中" :value="kpi.mid" tone="warning" trend="缩短窗口" trend-dir="flat" />
        <MedStatCard label="待复核（未分配）" hint="reviewer=—" :value="kpi.unreviewed" tone="danger" trend="待分配" trend-dir="flat" />
        <MedStatCard label="队列均分" hint="0–100 演示评分" :value="kpi.avgScore" tone="primary" trend="队列口径" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="风险队列" desc="点击行选中 · 分数与规则命中需结合原始数据复核">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: AiRiskHit) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1180 }"
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
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedPageHeader from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import { aiRiskKpis, seedAiRiskHits, type AiRiskHit } from '@/mock/aiAssist';

const data = ref(seedAiRiskHits());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => aiRiskKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `评分 ${r.score}（${r.level}风险）：驱动因子「${r.factors}」。规则命中 ${r.ruleHits} 仅反映当前数据切片，若实验室时间戳滞后或缺项，可能出现假阳/假阴。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  const a: string[] = [];
  if (r.level === '高') a.push('建议4 小时内由主管医师或值班三线确认，并同步「异常患者」工作台。');
  a.push('复核时拉取同源检验与原始报告 PDF，禁止仅凭分数调整免疫抑制方案。');
  a.push(`当前复核人：${r.reviewer === '—' ? '待分配' : r.reviewer}。`);
  return a;
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一行风险条目。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: AiRiskHit) {
  sel.value = r.id;
}

function rowClass(r: AiRiskHit) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: '评估ID', dataIndex: 'id', width: 130 },
  { title: '患者ID', dataIndex: 'patientId', width: 118 },
  { title: '姓名', dataIndex: 'patientName', width: 72 },
  { title: '评分', dataIndex: 'score', width: 64 },
  {
    title: '等级',
    dataIndex: 'level',
    width: 72,
    render: ({ record }: { record: AiRiskHit }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.level === '高' ? 'red' : record.level === '中' ? 'orangered' : 'green';
      return h(T, { color: c }, () => record.level);
    }
  },
  { title: '因子', dataIndex: 'factors', ellipsis: true, tooltip: true },
  { title: '规则命中', dataIndex: 'ruleHits', ellipsis: true, tooltip: true },
  { title: '评估时间', dataIndex: 'evaluatedAt', width: 145 },
  { title: '复核人', dataIndex: 'reviewer', width: 72 }
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
