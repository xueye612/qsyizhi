<!--
  ①模块理解：数据归档批次管理，满足病历/检验/影像长期留存、冷存储与法务冻结要求。
  ②行业调研：批次号、归档日、条数、存储层级、留存年限、legal hold、校验/封存状态。
  ③页面设计：KPI 概览 + 批次台账表；右侧以「AI辅助建议」提示留存到期与冻结约束（克制风格）。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="数据归档中心" desc="批次封存 · 存储层级 · 法定留存与法务冻结（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="归档批次数" hint="当前列表批次" :value="kpi.batches" tone="primary" trend="批次维度治理" trend-dir="flat" />
        <MedStatCard label="冷存储批次" hint="tier=冷" :value="kpi.coldShare" tone="warning" trend="回迁需 SLA" trend-dir="flat" />
        <MedStatCard label="法务冻结批次" hint="legalHold=true" :value="kpi.legalHold" tone="danger" trend="操作受控" trend-dir="flat" />
        <MedStatCard label="待校验批次" hint="status=校验中" :value="kpi.pendingVerify" tone="default" trend="校验后封存" trend-dir="flat" />
      </div>

      <div class="subline">
        <span class="sub-lab">演示累计归档记录条数</span>
        <span class="sub-val">{{ totalFmt }}</span>
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="归档批次台账" desc="点击行选中 · 右侧提示合规与运维注意事项">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: ArchiveRow) => r.id"
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
import { archiveKpis, seedArchiveRows, type ArchiveRow } from '@/mock/reportTrendArchive';

const data = ref(seedArchiveRows());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => archiveKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const totalFmt = computed(() => kpi.value.totalRecords.toLocaleString('zh-CN'));

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  if (r.legalHold) return `批次「${r.batchName}」处于法务冻结：删除/覆盖/迁移应被策略拦截，仅允许追加审计日志与受控回迁。`;
  if (r.storageTier === '冷') return '冷存储适合低频访问：建议预计算回迁 SLA，并在调阅链路提示延迟。';
  return `批次状态「${r.status}」：${r.status === '校验中' ? '完成哈希/条数核对后再改为已封存。' : '可在运维窗口执行抽检与索引重建。'}`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  const a: string[] = [];
  a.push(`法定留存 ${r.retentionYears} 年：到期前 90 天触发续存或销毁审批流（演示）。`);
  if (r.recordCount > 500000) a.push('大批量建议分片校验与断点续传，避免单次任务超时。');
  return a;
});

const aiSuggestItems = computed(() => {
  const r = cur.value;
  if (!r) return ['请先从左侧选择一个归档批次。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value, '涉及法务冻结与留存策略时，请遵循院内制度。'].slice(0, 3);
});

function onRow(r: ArchiveRow) {
  sel.value = r.id;
}

function rowClass(r: ArchiveRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: '批次ID', dataIndex: 'id', width: 130 },
  { title: '批次名称', dataIndex: 'batchName', ellipsis: true, tooltip: true },
  { title: '归档日', dataIndex: 'archiveDate', width: 110 },
  {
    title: '条数',
    dataIndex: 'recordCount',
    width: 100,
    render: ({ record }: { record: ArchiveRow }) => record.recordCount.toLocaleString('zh-CN')
  },
  {
    title: '层级',
    dataIndex: 'storageTier',
    width: 72,
    render: ({ record }: { record: ArchiveRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.storageTier === '冷' ? 'arcoblue' : record.storageTier === '温' ? 'orangered' : 'green';
      return h(T, { color: c }, () => record.storageTier);
    }
  },
  { title: '留存(年)', dataIndex: 'retentionYears', width: 88 },
  {
    title: '冻结',
    dataIndex: 'legalHold',
    width: 72,
    render: ({ record }: { record: ArchiveRow }) => {
      const T = resolveComponent('a-tag') as any;
      return h(T, { color: record.legalHold ? 'red' : 'gray' }, () => (record.legalHold ? '是' : '否'));
    }
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 88,
    render: ({ record }: { record: ArchiveRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '已封存' ? 'green' : record.status === '校验中' ? 'orangered' : 'arcoblue';
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
.subline{
  margin-top: 12px;
  font-size: var(--med-fz-body);
  color: var(--med-text-2);
  display:flex;
  gap: 10px;
  align-items: baseline;
  flex-wrap: wrap;
}
.sub-lab{
  color: var(--med-muted);
}
.sub-val{
  font-weight: 600;
  color: var(--med-text);
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

