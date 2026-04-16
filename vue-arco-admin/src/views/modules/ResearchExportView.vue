<!--
  ①模块理解：数据导出任务管理格式、水印策略与生成状态，满足科研合规取数。
  ②行业调研：任务号、格式、水印文案、排队/生成/可下载。
  ③页面设计：导出任务表 + 右侧提示水印与审批。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="数据导出" desc="格式 · 水印 · 任务状态（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="可下载" hint="已完成" :value="kpi.ready" tone="success" trend="可取数" trend-dir="flat" />
        <MedStatCard label="进行中" hint="生成/排队" :value="kpi.busy" tone="danger" trend="勿提前外传" trend-dir="flat" />
        <MedStatCard label="含水印" hint="策略命中" :value="kpi.withWm" tone="default" trend="合规" trend-dir="flat" />
        <MedStatCard label="任务数" hint="列表条数" :value="kpi.total" tone="primary" trend="全量" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="导出任务" desc="点击行选中 · 右侧为导出风控提示">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: ResearchExportRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1200 }"
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
import { researchExportKpis, seedResearchExport, type ResearchExportRow } from '@/mock/researchMocks';

const data = ref(seedResearchExport());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => researchExportKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `任务 ${r.jobId}，格式 ${r.format}，水印「${r.watermark}」，状态「${r.status}」，创建 ${r.createdAt}。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.status === '可下载' ? '可下载：记录下载人、IP 与文件哈希（占位）。' : '未完成：禁止提前外传临时文件。',
    '水印应含项目编号与「内部科研」字样。',
    '跨科室导出需信息科备案。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一行导出任务。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: ResearchExportRow) {
  sel.value = r.id;
}

function rowClass(r: ResearchExportRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  {
    title: '任务号',
    dataIndex: 'jobId',
    width: 172,
    minWidth: 172,
    ellipsis: true,
    tooltip: true
  },
  { title: '格式', dataIndex: 'format', width: 92 },
  { title: '水印', dataIndex: 'watermark', ellipsis: true, tooltip: true, minWidth: 120 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    align: 'center',
    render: ({ record }: { record: ResearchExportRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c =
        record.status === '可下载' ? 'green' : record.status === '生成中' ? 'orangered' : 'gray';
      return h(T, { color: c }, () => record.status);
    }
  },
  {
    title: '创建',
    dataIndex: 'createdAt',
    width: 178,
    minWidth: 178,
    render: ({ record }: { record: ResearchExportRow }) =>
      h('span', { class: 'table-mono-nowrap' }, record.createdAt)
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
