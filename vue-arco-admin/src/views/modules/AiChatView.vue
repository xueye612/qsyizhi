<!--
  ①模块理解：AI 问诊辅助将医患沟通草稿、知识库回答与医师审签串联，降低科普与随访解释工作量。
  ②行业调研：会话主题、轮次、模型版本、安全复核标记、审签状态；KPI 常见为待审签量、安全命中、归档量。
  ③页面设计：会话队列表 + 右侧强调「不得替代诊断」与审签责任。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="AI 问诊工作台" desc="会话草稿 · 模型输出 · 医师审签与安全复核（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="待医师审签" hint="status=待医师审签" :value="kpi.pendingSign" tone="danger" trend="优先处理" trend-dir="flat" />
        <MedStatCard label="安全需复核" hint="safetyFlag=需复核" :value="kpi.safety" tone="danger" trend="合规核对" trend-dir="flat" />
        <MedStatCard label="草稿会话" hint="未提交审签" :value="kpi.drafts" tone="warning" trend="待归档" trend-dir="flat" />
        <MedStatCard label="已归档" hint="可追溯留痕" :value="kpi.archived" tone="default" trend="闭环" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="会话队列" desc="点击行选中 · 审签前请核对模型输出与安全标记">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: AiChatSession) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1080 }"
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
import { aiChatKpis, seedAiChatSessions, type AiChatSession } from '@/mock/aiAssist';

const data = ref(seedAiChatSessions());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => aiChatKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  if (r.safetyFlag === '需复核') {
    return `会话「${r.topic}」已标安全复核：AI 输出可能涉及剂量/诊断性表述，审签医师须逐条核对知识库版本与患者个体数据。`;
  }
  return `当前状态「${r.status}」：建议在归档前保留完整多轮上下文与引用条文，满足事后监管抽查。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    '禁止向患者端直接发送未审签内容；对外通道仅展示医师确认版本。',
    `模型「${r.model}」输出需记录时间戳与 prompt摘要（演示字段可扩展）。`,
    '若涉及检验解读，必须附带「以主管医师解释为准」免责声明。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一行会话。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: AiChatSession) {
  sel.value = r.id;
}

function rowClass(r: AiChatSession) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: '会话ID', dataIndex: 'id', width: 140 },
  { title: '患者ID', dataIndex: 'patientId', width: 118 },
  { title: '姓名', dataIndex: 'patientName', width: 72 },
  { title: '主题', dataIndex: 'topic', ellipsis: true, tooltip: true },
  { title: '模型', dataIndex: 'model', width: 120, ellipsis: true, tooltip: true },
  { title: '轮次', dataIndex: 'turns', width: 64 },
  { title: '最后活动', dataIndex: 'lastAt', width: 145 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    render: ({ record }: { record: AiChatSession }) => {
      const T = resolveComponent('a-tag') as any;
      const c =
        record.status === '待医师审签' ? 'orangered' : record.status === '已归档' ? 'green' : 'arcoblue';
      return h(T, { color: c }, () => record.status);
    }
  },
  {
    title: '安全',
    dataIndex: 'safetyFlag',
    width: 88,
    render: ({ record }: { record: AiChatSession }) => {
      const T = resolveComponent('a-tag') as any;
      return h(T, { color: record.safetyFlag === '需复核' ? 'red' : 'gray' }, () => record.safetyFlag);
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
