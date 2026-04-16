<!--
  【1. 模块理解】报告上传是临床资料进入系统的入口，需类型、患者绑定、体积与安全扫描，支撑后续解析与趋势。
  【2. 行业调研】常见：报告类别、上传人、时间、文件名校验、病毒/敏感扫描、与就诊关联。
  【3. 页面设计】KPI 概览 + 上传记录表；右侧以「AI辅助建议」提示大文件与合规要点（克制风格）。
  【4. 页面代码】采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="报告上传中心" desc="类型分流 · 安全扫描 · 患者主索引关联（演示）">
        <template #extra>
          <div class="toolbar">
            <a-button type="primary" class="btn-primary">选择文件上传（演示）</a-button>
            <a-button>批量导入规则（演示）</a-button>
          </div>
        </template>
      </MedPageHeader>

      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="今日上传" hint="上传时间含当日" :value="kpi.today" tone="primary" trend="入口质量影响下游" trend-dir="flat" />
        <MedStatCard label="待/未过扫描" hint="病毒或策略扫描未完成" :value="kpi.pendingScan" tone="danger" trend="扫描前禁止解析" trend-dir="flat" />
        <MedStatCard label="影像类条数" hint="大文件与长期存储" :value="kpi.imaging" tone="warning" trend="建议分片上传" trend-dir="flat" />
        <MedStatCard label="检验类条数" hint="优先走解析流水线" :value="kpi.lab" tone="success" trend="字段映射可审计" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="上传记录" desc="点击行选中 · 右侧给出命名/体积/扫描的合规提示">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: ReportUploadRow) => r.id"
          :row-class="rowClass"
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
import { reportUploadKpis, seedReportUploads, type ReportUploadRow } from '@/mock/reportCenter';

const data = ref(seedReportUploads());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => reportUploadKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  if (r.sizeMb > 100) return `文件 ${r.sizeMb}MB 体积较大：建议启用分片上传与后台扫描队列，避免浏览器超时。`;
  if (r.virusScan === '待扫描') return '安全扫描未完成前勿触发自动解析，避免风险载荷进入 OCR 管道。';
  return `类型「${r.reportType}」建议校验文件名是否含院内患者ID/就诊号，便于自动归档。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  const a: string[] = [];
  if (r.reportType === '检验') a.push('上传完成后自动入队「检验解析」并映射检验项编码（演示）。');
  a.push('禁止在文件名中使用完整身份证号；推荐院内患者 ID。');
  return a;
});

const aiSuggestItems = computed(() => {
  const r = cur.value;
  if (!r) return ['请先从左侧选择一条上传记录。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value, 'AI辅助建议仅供流程提示，不替代院内合规策略。'].slice(0, 3);
});

function onRow(r: ReportUploadRow) {
  sel.value = r.id;
}

function rowClass(r: ReportUploadRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: '上传ID', dataIndex: 'id', width: 130 },
  { title: '患者ID', dataIndex: 'patientId', width: 118 },
  { title: '姓名', dataIndex: 'patientName', width: 72 },
  {
    title: '类型',
    dataIndex: 'reportType',
    width: 88,
    render: ({ record }: { record: ReportUploadRow }) => {
      const T = resolveComponent('a-tag') as any;
      return h(T, { color: 'arcoblue' }, () => record.reportType);
    }
  },
  { title: '文件名', dataIndex: 'fileName', ellipsis: true, tooltip: true },
  { title: '上传人', dataIndex: 'uploadBy', width: 72 },
  { title: '时间', dataIndex: 'uploadAt', width: 155 },
  { title: '大小MB', dataIndex: 'sizeMb', width: 80 },
  {
    title: '扫描',
    dataIndex: 'virusScan',
    width: 88,
    render: ({ record }: { record: ReportUploadRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.virusScan === '通过' ? 'green' : record.virusScan === '隔离' ? 'red' : 'orangered';
      return h(T, { color: c }, () => record.virusScan);
    }
  }
];
</script>

<style scoped>
.med-page{
  box-sizing:border-box;
  padding: var(--med-page-pad);
  display:flex;
  flex-direction:column;
  gap: var(--med-gap);
  min-width:0;
}
.toolbar{
  display:flex;
  gap: 12px;
  flex-wrap: wrap;
}
.btn-primary{
  background: var(--med-primary);
  border-color: var(--med-primary);
}
.kpi-grid{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--med-gap);
  align-items: stretch;
}
.split{
  display:flex;
  gap: var(--med-gap);
  align-items: stretch;
  min-width:0;
}
.ai-col{
  width: 360px;
  flex-shrink:0;
  display:flex;
}
@media (max-width: 1100px){
  .kpi-grid{grid-template-columns: repeat(2, minmax(0,1fr))}
  .split{flex-direction: column}
  .ai-col{width: 100%}
}

:deep(.row-selected .arco-table-td){
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>

