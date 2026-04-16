<!--
  ①模块理解：知情同意模板与签署记录，跟踪版本、签署人数与生效状态。
  ②行业调研：标题、版本号、签署量、生效/草稿/废止；电子签需留痕可追溯。
  ③页面设计：KPI 概览 + 模板表；右侧以「AI辅助建议」呈现合规提示（克制风格）。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="知情同意" desc="模板版本 · 签署量 · 生效状态（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="生效中" hint="当前可用于签署" :value="kpi.active" tone="success" trend="版本变更需公告" trend-dir="flat" />
        <MedStatCard label="草稿" hint="禁止用于签署" :value="kpi.draft" tone="warning" trend="需法务复核" trend-dir="flat" />
        <MedStatCard label="签署合计" hint="历史累计" :value="kpi.signed" tone="primary" trend="保留追溯链路" trend-dir="flat" />
        <MedStatCard label="模板数" hint="全部版本" :value="kpi.total" tone="default" trend="建议定期清理" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="模板列表" desc="点击行选中 · 右侧给出合规提示（演示）">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: SysConsentRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 980 }"
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
import { seedSysConsent, sysConsentKpis, type SysConsentRow } from '@/mock/sysMocks';

const data = ref(seedSysConsent());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => sysConsentKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `模板「${r.title}」版本 ${r.version}，累计签署 ${r.signedCount}，状态「${r.status}」。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.status === '草稿' ? '草稿禁止用于实际签署流程。' : '生效版本变更需通知在组患者并评估重签策略。',
    '对外文案需法务审核留痕。',
    '电子签需满足可靠时间戳与身份认证（占位）。'
  ];
});

const aiSuggestItems = computed(() => {
  const r = cur.value;
  if (!r) return ['请先从左侧选择一条模板。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value, 'AI辅助建议仅供流程提示，不替代法务与临床判断。'].slice(0, 3);
});

function onRow(r: SysConsentRow) {
  sel.value = r.id;
}

function rowClass(r: SysConsentRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 72 },
  { title: '标题', dataIndex: 'title', ellipsis: true, tooltip: true },
  { title: '版本', dataIndex: 'version', width: 100 },
  { title: '签署数', dataIndex: 'signedCount', width: 88 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 88,
    render: ({ record }: { record: SysConsentRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '生效' ? 'green' : record.status === '草稿' ? 'orangered' : 'gray';
      return h(T, { color: c }, () => record.status);
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
  min-width: 0;
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

