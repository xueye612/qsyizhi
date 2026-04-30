<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="随访记录中心" desc="结构化台账 · 体征/检验/依从 · 支持 AI 标记复核（演示数据）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="近端记录数" hint="当前列表样本量" :value="kpi.last7" tone="primary" trend="窗口：7日" trend-dir="flat" />
        <MedStatCard label="AI·指标异常" hint="需检验复核条目" :value="kpi.abnormalLabs" tone="danger" trend="优先复核" trend-dir="flat" />
        <MedStatCard label="依从风险条目" hint="含依从差或 AI 依从风险" :value="kpi.adherenceRisk" tone="danger" trend="随访强化" trend-dir="flat" />
        <MedStatCard label="门诊随访占比" hint="门诊/总条数" :value="`${kpi.outpatientShare}/${kpi.total}`" tone="success" trend="渠道结构" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="随访记录表" desc="生命体征 / Scr / 依从 / 症状 / 下一步">
        <MedListToolbar
          v-model="crud.searchKey.value"
          search-placeholder="患者 / 记录编号 / 症状关键词"
          :selected-count="crud.checked.value.length"
          :batch-deletable="true"
          create-text="新建随访记录"
          @create="crud.openCreate"
          @export="crud.exportCSV"
          @refresh="crud.refresh"
          @batch-delete="crud.removeChecked"
        >
          <template #filters>
            <a-select v-model="filterChannel" class="sel">
              <a-option value="all">全部渠道</a-option>
              <a-option value="门诊">门诊</a-option>
              <a-option value="电话">电话</a-option>
              <a-option value="微信">微信</a-option>
              <a-option value="住院">住院</a-option>
            </a-select>
            <a-select v-model="filterFlag" class="sel">
              <a-option value="all">全部 AI 标记</a-option>
              <a-option value="无">无</a-option>
              <a-option value="指标异常">指标异常</a-option>
              <a-option value="依从风险">依从风险</a-option>
            </a-select>
          </template>
        </MedListToolbar>

        <MedPageStates
          :loading="crud.loading.value"
          :error="crud.errorText.value"
          :empty="!crud.loading.value && crud.rows.value.length === 0"
          @retry="crud.refresh"
        >
          <a-table
            data-testid="biz-table"
            :data="crud.rows.value"
            :columns="columns"
            :pagination="{ pageSize: 10, showTotal: true }"
            :row-key="(r: FollowRecordRow) => r.id"
            :row-class="crud.rowClass"
            :row-selection="{ type: 'checkbox', showCheckedAll: true, width: 44 }"
            :selected-keys="crud.checked.value"
            :scroll="{ x: 1500 }"
            @row-click="crud.onRowClick"
            @selection-change="(keys: any) => (crud.checked.value = keys)"
          />
        </MedPageStates>
      </MedTableCard>

      <div data-testid="ai-decision" class="rightCol">
        <MedAiSuggest :items="aiSuggestItems" />
        <MedPageSection title="时间轴" desc="本次随访与下一步计划">
          <a-timeline>
            <a-timeline-item label="本次随访" dot-color="#2563eb">{{ crud.selected.value?.visitAt ?? '—' }}</a-timeline-item>
            <a-timeline-item label="下一步计划" dot-color="#94a3b8">{{ crud.selected.value?.planNext ?? '—' }}</a-timeline-item>
          </a-timeline>
        </MedPageSection>
      </div>
    </div>

    <MedRecordDrawer
      v-model:visible="crud.drawerVisible.value"
      :mode="crud.drawerMode.value"
      :fields="fields"
      :record="crud.drawerRecord.value"
      @submit="crud.onSubmit"
    />
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
import MedListToolbar from '@/components/MedListToolbar.vue';
import MedPageStates from '@/components/MedPageStates.vue';
import MedRecordDrawer, { type FieldDef } from '@/components/MedRecordDrawer.vue';
import MedRowActions from '@/components/MedRowActions.vue';
import { followRecordKpis, seedFollowRecords, type FollowRecordRow } from '@/mock/followRecords';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<FollowRecordRow>('follow.records', seedFollowRecords);
const filterChannel = ref<string>('all');
const filterFlag = ref<string>('all');

const crud = useCrudList<FollowRecordRow>({
  store,
  idPrefix: 'FR',
  searchFields: ['id', 'patientId', 'patientName', 'symptom'],
  customFilter: (r) => {
    if (filterChannel.value !== 'all' && r.channel !== filterChannel.value) return false;
    if (filterFlag.value !== 'all' && r.aiFlag !== filterFlag.value) return false;
    return true;
  },
  csvColumns: [
    { title: '记录编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '随访时间', key: 'visitAt' },
    { title: '渠道', key: 'channel' },
    { title: '随访人', key: 'nurse' },
    { title: '收缩压', key: 'sbp' },
    { title: '舒张压', key: 'dbp' },
    { title: '体重kg', key: 'weightKg' },
    { title: 'Scr', key: 'scr' },
    { title: '依从', key: 'adherence' },
    { title: '症状', key: 'symptom' },
    { title: '下一步', key: 'planNext' },
    { title: 'AI标记', key: 'aiFlag' }
  ],
  exportName: 'follow-records'
});

const kpi = computed(() => followRecordKpis(crud.allRows.value));

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  { key: 'visitAt', label: '随访时间', required: true, placeholder: '2026-04-20 09:30' },
  {
    key: 'channel',
    label: '渠道',
    type: 'select',
    required: true,
    options: ['门诊', '电话', '微信', '住院'].map((v) => ({ label: v, value: v }))
  },
  { key: 'nurse', label: '随访人' },
  { key: 'sbp', label: '收缩压', type: 'number', min: 60, max: 220 },
  { key: 'dbp', label: '舒张压', type: 'number', min: 30, max: 140 },
  { key: 'weightKg', label: '体重(kg)', type: 'number', min: 30, max: 180, step: 0.1 },
  { key: 'scr', label: 'Scr (μmol/L)', type: 'number', min: 30, max: 1000 },
  {
    key: 'adherence',
    label: '依从',
    type: 'select',
    options: ['良好', '一般', '差'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'aiFlag',
    label: 'AI 标记',
    type: 'select',
    options: ['无', '指标异常', '依从风险'].map((v) => ({ label: v, value: v }))
  },
  { key: 'symptom', label: '症状', type: 'textarea', span: 24 },
  { key: 'planNext', label: '下一步', type: 'textarea', span: 24 }
];

const aiSuggestItems = computed(() => {
  const r = crud.selected.value;
  if (!r) return ['请选择一条随访记录。', 'AI辅助建议仅供流程提示。'];
  const lab = r.scr ? `Scr ${r.scr} μmol/L` : 'Scr 未填写';
  const bp = r.sbp && r.dbp ? `血压 ${r.sbp}/${r.dbp}` : '血压未填写';
  const adh = r.adherence === '差' ? '依从较差，需强化提醒与用药核对。' : '依从尚可，保持随访节律。';
  const items = [`本次随访（${r.channel}）：${bp}，${lab}，AI 标记「${r.aiFlag}」。${adh}`];
  if (r.aiFlag === '指标异常') items.push('建议复核检验来源与单位，必要时安排 48–72h 复测同源实验室。');
  if (r.aiFlag === '依从风险') items.push('询问漏服原因并记录，必要时引入家属提醒或用药盒方案（演示）。');
  if (r.planNext) items.push(`计划：${r.planNext}`);
  return items.slice(0, 3);
});

const columns = computed<TableColumnData[]>(() => [
  { title: '记录编号', dataIndex: 'id', width: 150 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '随访时间', dataIndex: 'visitAt', width: 145 },
  {
    title: '渠道',
    dataIndex: 'channel',
    width: 80,
    render: ({ record }: { record: FollowRecordRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.channel === '门诊' ? 'arcoblue' : record.channel === '电话' ? 'orangered' : 'gray';
      return h(T, { color: c }, () => record.channel);
    }
  },
  {
    title: '血压',
    dataIndex: 'sbp',
    width: 100,
    render: ({ record }: { record: FollowRecordRow }) =>
      record.sbp && record.dbp ? `${record.sbp}/${record.dbp}` : '—'
  },
  { title: 'Scr', dataIndex: 'scr', width: 80 },
  {
    title: '依从',
    dataIndex: 'adherence',
    width: 80,
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
  { title: '下一步', dataIndex: 'planNext', ellipsis: true, tooltip: true },
  {
    title: '操作',
    dataIndex: '__ops',
    width: 168,
    fixed: 'right',
    render: ({ record }: { record: FollowRecordRow }) =>
      h(MedRowActions as any, {
        onView: () => crud.openView(record),
        onEdit: () => crud.openEdit(record),
        onDelete: () => crud.removeRow(record.id)
      })
  }
]);
</script>

<style scoped>
.med-page { box-sizing: border-box; padding: var(--med-page-pad); display: flex; flex-direction: column; gap: var(--med-gap); min-width: 0; }
.kpi-grid { margin-top: 12px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--med-gap); }
.split { display: flex; gap: var(--med-gap); min-width: 0; }
.rightCol { width: 360px; flex-shrink: 0; display: flex; flex-direction: column; gap: var(--med-gap); }
.sel { width: 140px; }
@media (max-width: 1100px) {
  .split { flex-direction: column; }
  .rightCol { width: 100%; }
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
:deep(.row-selected .arco-table-td) { background: rgba(22, 119, 255, 0.06) !important; }
</style>
