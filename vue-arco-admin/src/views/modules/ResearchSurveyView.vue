<!--
  ①模块理解：问卷管理跟踪发放量与回收率，支撑科研随访质量评估。
  ②行业调研：问卷标题、发放数、回收率、收集中/关闭/分析中状态。
  ③页面设计：问卷表 + 右侧提示低回收率干预。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="问卷管理" desc="发放 · 回收率 · 状态（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="收集中" hint="活跃问卷" :value="kpi.collecting" tone="danger" trend="触达跟进" trend-dir="flat" />
        <MedStatCard label="平均回收率%" hint="队列均值" :value="kpi.avgRatePct" tone="primary" trend="质量指标" trend-dir="flat" />
        <MedStatCard label="低回收(<60%)" hint="需干预" :value="kpi.low" tone="warning" trend="随访优化" trend-dir="flat" />
        <MedStatCard label="问卷数" hint="列表条数" :value="kpi.total" tone="default" trend="全量" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="问卷列表" desc="点击行选中 · 右侧为触达与版本管理提示">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: ResearchSurveyRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 920 }"
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
import { researchSurveyKpis, seedResearchSurvey, type ResearchSurveyRow } from '@/mock/researchMocks';

const data = ref(seedResearchSurvey());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => researchSurveyKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  const pct = Math.round(r.responseRate * 100);
  return `问卷「${r.title}」已发放 ${r.sent}，回收率约 ${pct}%，状态「${r.status}」。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.responseRate < 0.6 ? '低回收：可增加短信提醒或缩短问卷长度。' : '回收尚可：关注无应答偏倚分析。',
    '关闭前需锁定版本号避免题目漂移。',
    '企业微信触达需符合患者同意范围。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一行问卷。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: ResearchSurveyRow) {
  sel.value = r.id;
}

function rowClass(r: ResearchSurveyRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 72 },
  { title: '标题', dataIndex: 'title', ellipsis: true, tooltip: true },
  { title: '发放', dataIndex: 'sent', width: 72 },
  {
    title: '回收率',
    dataIndex: 'responseRate',
    width: 100,
    render: ({ record }: { record: ResearchSurveyRow }) =>
      `${Math.round(record.responseRate * 100)}%`
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: ResearchSurveyRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c =
        record.status === '收集中' ? 'arcoblue' : record.status === '已关闭' ? 'green' : 'orangered';
      return h(T, { color: c }, () => record.status);
    }
  }
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
