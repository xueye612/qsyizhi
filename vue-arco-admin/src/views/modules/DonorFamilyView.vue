<!--
  ①模块理解：家属信息页维护供体关联联系人、伦理材料与同意书版本，支撑沟通与合规。
  ②行业调研：关系、脱敏电话、同意书编号、材料完整度状态。
  ③页面设计：联系人表 + 右侧以「AI辅助建议」提示伦理沟通边界（克制风格）。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="供体家属信息" desc="联系人 · 伦理材料 · 同意书关联（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="材料完整" hint="可随访" :value="kpi.ok" tone="success" trend="可推进沟通" trend-dir="flat" />
        <MedStatCard label="待补件" hint="材料不齐" :value="kpi.need" tone="danger" trend="先补齐文书" trend-dir="flat" />
        <MedStatCard label="同意书过期" hint="需更新版本" :value="kpi.expired" tone="warning" trend="避免流程穿透" trend-dir="flat" />
        <MedStatCard label="已脱敏电话" hint="展示级" :value="kpi.withPhone" tone="primary" trend="外呼走院内线路" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="家属联系人" desc="点击行选中 · 右侧提示伦理沟通清单与边界">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: DonorFamilyRow) => r.id"
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
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedPageHeader from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import { donorFamilyKpis, seedDonorFamily, type DonorFamilyRow } from '@/mock/donorOps';

const data = ref(seedDonorFamily());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => donorFamilyKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `供体 ${r.donorCode} 联系人「${r.contactName}」（${r.relation}），同意书 ${r.consentDoc}，材料状态「${r.status}」。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.status !== '完整' ? '材料不齐：暂停对外披露供体识别信息，优先补齐伦理文书。' : '材料完整：可按规程安排沟通时间窗。',
    '电话为脱敏展示；外呼需走院内录音线路并留痕（演示）。',
    '禁止向家属作出超出伦理审查范围的承诺表述。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一条联系人记录。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: DonorFamilyRow) {
  sel.value = r.id;
}

function rowClass(r: DonorFamilyRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 72 },
  { title: '供体编号', dataIndex: 'donorCode', width: 130 },
  { title: '联系人', dataIndex: 'contactName', width: 88 },
  { title: '关系', dataIndex: 'relation', width: 72 },
  { title: '电话', dataIndex: 'phone', width: 130 },
  { title: '同意书', dataIndex: 'consentDoc', width: 120 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 88,
    render: ({ record }: { record: DonorFamilyRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '完整' ? 'green' : record.status === '待补' ? 'orangered' : 'red';
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

