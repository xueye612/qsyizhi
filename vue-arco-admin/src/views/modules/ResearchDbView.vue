<!--
  ①模块理解：科研数据库目录登记脱敏数据集规模、敏感级别与最近审计日期。
  ②行业调研：行数、敏感标签、审计时间、访问控制级别。
  ③页面设计：数据集表 + 右侧提示访问审批与最小够用原则。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="科研数据库" desc="脱敏集 · 敏感级别 · 审计（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="非公开集" hint="受限/核心" :value="kpi.restricted" tone="danger" trend="访问控制" trend-dir="flat" />
        <MedStatCard label="总行数" hint="演示累计" :value="kpi.rowsSum" tone="primary" trend="规模口径" trend-dir="flat" />
        <MedStatCard label="近期已审计" hint="最近批次" :value="kpi.recentAudit" tone="default" trend="合规留痕" trend-dir="flat" />
        <MedStatCard label="数据集" hint="目录条数" :value="kpi.sets" tone="success" trend="按目录" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="数据集目录" desc="点击行选中 · 右侧为数据治理提示">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: ResearchDbRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 960 }"
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
import { researchDbKpis, seedResearchDb, type ResearchDbRow } from '@/mock/researchMocks';

const data = ref(seedResearchDb());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => researchDbKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `数据集「${r.name}」约 ${r.rowCount} 行，敏感级别「${r.sensitivity}」，最近审计 ${r.lastAudit}。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.sensitivity === '核心' ? '核心集：导出需 PI 双批 + 信息科备案。' : '受限/公开：按院内数据分级规程授权。',
    '对外合作须重新评估脱敏与水印策略。',
    '演示环境勿载入真实标识符。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一行数据集。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: ResearchDbRow) {
  sel.value = r.id;
}

function rowClass(r: ResearchDbRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 88 },
  { title: '名称', dataIndex: 'name', ellipsis: true, tooltip: true },
  { title: '行数', dataIndex: 'rowCount', width: 100 },
  {
    title: '敏感',
    dataIndex: 'sensitivity',
    width: 88,
    render: ({ record }: { record: ResearchDbRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c =
        record.sensitivity === '核心' ? 'red' : record.sensitivity === '受限' ? 'orangered' : 'green';
      return h(T, { color: c }, () => record.sensitivity);
    }
  },
  { title: '最近审计', dataIndex: 'lastAudit', width: 120 }
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
