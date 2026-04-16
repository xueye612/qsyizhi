<!--
  【1. 模块理解】报告解析将非结构化 PDF/DICOM/图片转为可计算字段，供趋势、规则引擎与 AI 风险使用。
  【2. 行业调研】常见：OCR/结构化状态、置信度、人工复核队列、字段映射（检验项代码）。
  【3. 页面设计】解析流水线 KPI + 任务表；右侧 AI 建议强调复核与合规边界。
  【4. 页面代码】采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="报告解析任务" desc="OCR / 结构化 / 人工复核队列（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="队列中" hint="待处理 + 解析中" :value="kpi.queue" tone="danger" trend="需优先分流" trend-dir="flat" />
        <MedStatCard label="解析成功" hint="可写回患者时间轴" :value="kpi.success" tone="success" trend="可触发规则引擎" trend-dir="flat" />
        <MedStatCard label="需人工" hint="低置信度/冲突" :value="kpi.manual" tone="warning" trend="建议并排复核原图" trend-dir="flat" />
        <MedStatCard label="抽取字段数" hint="累计（演示）" :value="kpi.fields" tone="primary" trend="字段映射可审计" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="解析任务" desc="点击行选中 · 右侧给出复核与下游风险提示">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: ReportParseRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1320 }"
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
import { reportParseKpis, seedReportParse, type ReportParseRow } from '@/mock/reportCenter';

const data = ref(seedReportParse());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => reportParseKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  if (r.ocrStatus === '需人工') return `任务需人工：${r.structFields}。建议并排展示原图与识别文本，逐项复核后再写回。`;
  if (r.ocrStatus === '解析中') return '解析中：避免重复触发；向上传方展示进度，减少重复提交。';
  return '解析成功：可写回患者时间轴，并触发规则（如 Scr 突增>20% 进入异常患者工作台）。';
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  const a: string[] = [];
  if (r.ocrStatus === '成功') a.push('写回结构化字段时记录解析版本号与来源文件摘要。');
  a.push('DICOM 解析需记录 SeriesInstanceUID，便于影像科双签追溯（演示）。');
  return a;
});

const aiSuggestItems = computed(() => {
  const r = cur.value;
  if (!r) return ['请先从左侧选择一条解析任务。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value, 'AI辅助建议仅供流程提示，不替代临床与合规复核。'].slice(0, 3);
});

function onRow(r: ReportParseRow) {
  sel.value = r.id;
}

function rowClass(r: ReportParseRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: '任务ID', dataIndex: 'id', width: 140 },
  { title: '源上传', dataIndex: 'sourceId', width: 150, ellipsis: true, tooltip: true },
  { title: '患者ID', dataIndex: 'patientId', width: 130, ellipsis: true, tooltip: true },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '模态', dataIndex: 'modality', width: 120, ellipsis: true, tooltip: true },
  {
    title: '状态',
    dataIndex: 'ocrStatus',
    width: 92,
    align: 'center',
    render: ({ record }: { record: ReportParseRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c =
        record.ocrStatus === '成功'
          ? 'green'
          : record.ocrStatus === '需人工'
            ? 'orangered'
            : record.ocrStatus === '解析中'
              ? 'arcoblue'
              : 'gray';
      return h(T, { color: c }, () => record.ocrStatus);
    }
  },
  { title: '结构化字段', dataIndex: 'structFields', ellipsis: true, tooltip: true, minWidth: 160 },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: 178,
    render: ({ record }: { record: ReportParseRow }) =>
      h('span', { class: 'parse-time-cell' }, record.updatedAt)
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
:deep(.parse-time-cell) {
  white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
}
</style>