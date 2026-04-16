<!--
  ①模块理解：异常报警将检验/设备/规则引擎触发的越阈事件汇总，驱动随访与临床处置闭环。
  ②行业调研：严重度、通知渠道、确认/误报状态、触发时间与指标口径为常见字段。
  ③页面设计：KPI 概览 + 报警队列表；右侧以「AI辅助建议」提示分级响应与误报回填（克制风格）。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="异常报警中心" desc="阈值 breach · 通知渠道 · 处置与误报标注（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="待处置" hint="需跟进" :value="kpi.pending" tone="danger" trend="建议定义 SLA" trend-dir="flat" />
        <MedStatCard label="高严重度" hint="优先处置" :value="kpi.high" tone="danger" trend="双通道确认" trend-dir="flat" />
        <MedStatCard label="已确认" hint="闭环留痕" :value="kpi.confirmed" tone="success" trend="记录处置" trend-dir="flat" />
        <MedStatCard label="误报" hint="规则调优" :value="kpi.falsePositive" tone="default" trend="需回填原因" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="报警队列" desc="点击行选中 · 右侧给出分级响应与渠道建议">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: AiAlertRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1100 }"
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
import { aiAlertKpis, seedAiAlerts, type AiAlertRow } from '@/mock/aiAssist';

const data = ref(seedAiAlerts());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => aiAlertKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `报警「${r.metric}」：${r.breach}。严重度「${r.severity}」，建议按渠道「${r.channel}」在 SLA 内响应并留痕。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.severity === '高' ? '高严重度：优先电话 + 主管医师双通道确认。' : '中低严重度：可先企业微信触达并记录已读。',
    r.status === '误报' ? '误报需回填原因，供规则团队调优阈值或加白名单。' : '非误报建议关联随访任务/医嘱调整并可追溯。',
    '对外说明避免“AI 诊断/替代临床判断”等表述。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一条报警。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: AiAlertRow) {
  sel.value = r.id;
}

function rowClass(r: AiAlertRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const sevColor = (s: AiAlertRow['severity']) => (s === '高' ? 'red' : s === '中' ? 'orangered' : 'arcoblue');

const columns: TableColumnData[] = [
  { title: '报警ID', dataIndex: 'id', width: 130 },
  { title: '患者ID', dataIndex: 'patientId', width: 118 },
  { title: '姓名', dataIndex: 'patientName', width: 72 },
  { title: '指标', dataIndex: 'metric', width: 130, ellipsis: true, tooltip: true },
  { title: '越阈', dataIndex: 'breach', ellipsis: true, tooltip: true },
  {
    title: '严重度',
    dataIndex: 'severity',
    width: 88,
    render: ({ record }: { record: AiAlertRow }) => {
      const T = resolveComponent('a-tag') as any;
      return h(T, { color: sevColor(record.severity) }, () => record.severity);
    }
  },
  { title: '渠道', dataIndex: 'channel', width: 150, ellipsis: true, tooltip: true },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: AiAlertRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '待处置' ? 'red' : record.status === '已确认' ? 'green' : 'gray';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '触发时间', dataIndex: 'firedAt', width: 145 }
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

