<!--
  【1. 模块理解】随访记录台账沉淀结构化结论（渠道、体征、检验关注点、依从性、症状与下一步），服务质控与追溯（演示）。
  【2. 行业调研】常含随访时间、方式、随访人、生命体征、实验室关键值、用药依从、主诉、处理与复访计划。
  【3. 页面设计】KPI 概览 + 筛选；台账表；右侧「AI辅助建议」输出解读与可执行建议（克制风格）。
  【4. 页面代码】采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="随访记录中心" desc="结构化台账 · 体征/检验/依从 · 支持 AI 标记复核（演示数据）">
        <template #extra>
          <div class="headBtns">
            <a-button type="outline">导出选中（演示）</a-button>
            <a-button type="primary" class="btn-primary">新建随访记录（演示）</a-button>
          </div>
        </template>
      </MedPageHeader>

      <div class="queryBar queryBar--row">
        <a-input v-model="q" allow-clear class="q" placeholder="患者 / 记录编号 / 症状关键词" />
        <a-select v-model="channel" class="sel">
          <a-option value="all">全部渠道</a-option>
          <a-option value="门诊">门诊</a-option>
          <a-option value="电话">电话</a-option>
          <a-option value="微信">微信</a-option>
          <a-option value="住院">住院</a-option>
        </a-select>
        <a-select v-model="flag" class="sel">
          <a-option value="all">全部 AI 标记</a-option>
          <a-option value="无">无</a-option>
          <a-option value="指标异常">指标异常</a-option>
          <a-option value="依从风险">依从风险</a-option>
        </a-select>
      </div>

      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="近端记录数" hint="当前列表样本量（演示集）" :value="kpi.last7" tone="primary" trend="窗口：7日" trend-dir="flat" />
        <MedStatCard label="AI·指标异常" hint="需检验复核条目" :value="kpi.abnormalLabs" tone="danger" trend="优先复核" trend-dir="flat" />
        <MedStatCard label="依从风险条目" hint="含依从差或 AI 依从风险" :value="kpi.adherenceRisk" tone="danger" trend="随访强化" trend-dir="flat" />
        <MedStatCard label="门诊随访占比" hint="门诊/总条数" :value="`${kpi.outpatientShare}/${kpi.total}`" tone="success" trend="渠道结构" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="随访记录表" desc="真实字段示例：生命体征、Scr、依从、症状与计划">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="{ pageSize: 8, showTotal: true }"
          :row-key="(r: FollowRecordRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1420 }"
          @row-click="onRow"
        />
      </MedTableCard>

      <div data-testid="ai-decision" class="rightCol">
        <MedAiSuggest :items="aiSuggestItems" />
        <MedPageSection title="时间轴（演示）" desc="用于回顾本次随访与下一步计划">
          <a-timeline>
            <a-timeline-item label="本次随访" dot-color="#2563eb">
              {{ selected?.visitAt ?? '—' }}
            </a-timeline-item>
            <a-timeline-item label="下一步计划" dot-color="#94a3b8">
              {{ selected?.planNext ?? '—' }}
            </a-timeline-item>
          </a-timeline>
        </MedPageSection>
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
import { followRecordKpis, seedFollowRecords, type FollowRecordRow } from '@/mock/followRecords';

const records = ref(seedFollowRecords());
const q = ref('');
const channel = ref<string>('all');
const flag = ref<string>('all');
const selectedId = ref<string | null>(records.value[0]?.id ?? null);

const kpi = computed(() => followRecordKpis(records.value));

const rows = computed(() => {
  let list = [...records.value];
  const qq = q.value.trim().toLowerCase();
  if (qq) {
    list = list.filter(
      (r) =>
        r.patientName.toLowerCase().includes(qq) ||
        r.patientId.toLowerCase().includes(qq) ||
        r.id.toLowerCase().includes(qq) ||
        r.symptom.toLowerCase().includes(qq)
    );
  }
  if (channel.value !== 'all') list = list.filter((r) => r.channel === channel.value);
  if (flag.value !== 'all') list = list.filter((r) => r.aiFlag === flag.value);
  return list;
});

const selected = computed(() => records.value.find((r) => r.id === selectedId.value) ?? null);

const aiNarrative = computed(() => {
  const r = selected.value;
  if (!r) return '';
  const lab = r.scr ? `Scr ${r.scr} μmol/L` : 'Scr 未填写';
  const bp =
    r.sbp && r.dbp ? `血压 ${r.sbp}/${r.dbp}` : r.sbp ? `收缩压 ${r.sbp}` : r.dbp ? `舒张压 ${r.dbp}` : '血压未填写';
  const adh = r.adherence === '差' ? '依从较差，需强化提醒与用药核对。' : '依从尚可，建议保持随访节律。';
  return `本次随访（${r.channel}）记录：${bp}，${lab}，AI 标记「${r.aiFlag}」。${adh}`;
});

const aiActions = computed(() => {
  const r = selected.value;
  if (!r) return [];
  const a: string[] = [];
  if (r.aiFlag === '指标异常') a.push('建议复核检验来源与单位，必要时安排 48–72h 复测同源实验室。');
  if (r.aiFlag === '依从风险') a.push('建议询问漏服原因并记录，必要时引入家属提醒或用药盒方案（演示）。');
  if (r.planNext) a.push(`按计划：${r.planNext}`);
  if (a.length === 0) a.push('按科室 SOP 补齐关键体征与用药变动字段，便于后续追溯。');
  return a;
});

const aiSuggestItems = computed(() => {
  if (!selected.value) return ['请选择一条随访记录。', 'AI辅助建议仅供流程提示。'];
  return [aiNarrative.value, ...aiActions.value].slice(0, 3);
});

function onRow(row: FollowRecordRow) {
  selectedId.value = row.id;
}

function rowClass(row: FollowRecordRow) {
  return row.id === selectedId.value ? 'row-selected' : '';
}

const columns = computed<TableColumnData[]>(() => [
  { title: '记录编号', dataIndex: 'id', width: 150 },
  { title: '患者ID', dataIndex: 'patientId', width: 148, ellipsis: true, tooltip: true },
  { title: '姓名', dataIndex: 'patientName', width: 90 },
  { title: '随访时间', dataIndex: 'visitAt', width: 155 },
  {
    title: '渠道',
    dataIndex: 'channel',
    width: 88,
    render: ({ record }: { record: FollowRecordRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.channel === '门诊' ? 'arcoblue' : record.channel === '电话' ? 'orangered' : 'gray';
      return h(T, { color: c }, () => record.channel);
    }
  },
  {
    title: '血压',
    dataIndex: 'sbp',
    width: 110,
    render: ({ record }: { record: FollowRecordRow }) =>
      record.sbp && record.dbp ? `${record.sbp}/${record.dbp}` : record.sbp ? `${record.sbp}/—` : record.dbp ? `—/${record.dbp}` : '—'
  },
  { title: 'Scr', dataIndex: 'scr', width: 90 },
  {
    title: '依从',
    dataIndex: 'adherence',
    width: 88,
    render: ({ record }: { record: FollowRecordRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.adherence === '差' ? 'red' : record.adherence === '一般' ? 'orangered' : 'green';
      return h(T, { color: c }, () => record.adherence);
    }
  },
  {
    title: 'AI 标记',
    dataIndex: 'aiFlag',
    width: 100,
    render: ({ record }: { record: FollowRecordRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.aiFlag === '指标异常' ? 'red' : record.aiFlag === '依从风险' ? 'orangered' : 'gray';
      return h(T, { color: c }, () => record.aiFlag);
    }
  },
  { title: '症状', dataIndex: 'symptom', ellipsis: true, tooltip: true },
  { title: '下一步', dataIndex: 'planNext', ellipsis: true, tooltip: true }
]);
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
.headBtns{
  display:flex;
  gap: 12px;
  flex-wrap: wrap;
}
.btn-primary{
  background: var(--med-primary);
  border-color: var(--med-primary);
}
.queryBar{
  margin-top: 12px;
  display:flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items:center;
}
.queryBar--row{
  flex-wrap: nowrap;
}
@media (max-width: 900px){
  .queryBar--row{ flex-wrap: wrap; }
}
.kpi-grid{
  margin-top: 12px;
  display:grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: var(--med-gap);
  align-items: stretch;
}
.split{
  display:flex;
  gap: var(--med-gap);
  align-items: stretch;
  min-width:0;
}
.rightCol{
  width: 360px;
  flex-shrink:0;
  display:flex;
  flex-direction:column;
  gap: var(--med-gap);
}
@media (max-width: 1100px){
  .split{ flex-direction: column; }
  .rightCol{ width: 100%; }
  .kpi-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
  .q{ width: 100%; }
  .sel{ width: 100%; max-width: 320px; }
}
:deep(.row-selected .arco-table-td){
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>

