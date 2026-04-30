<!--
  随访任务工作台（Batch 1 升级版）
  - 接入 useCrudList：新增 / 编辑 / 删除 / 批量删 / CSV 导出 / 刷新
  - KPI / 状态 / 风险分层筛选
  - 右侧保留「AI 辅助建议」与执行要点
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader
        title="随访任务工作台"
        desc="计划驱动 · 逾期预警 · 高危优先（演示数据：基准日 2026-04-16）"
        :breadcrumb="['工作台', '随访管理', '随访任务']"
        :badge="`共 ${crud.allRows.value.length} 条`"
        badge-tone="primary"
        :chips="headerChips"
      >
        <template #actions>
          <a-button @click="crud.exportCSV">
            <template #icon><icon-download /></template>
            导出 CSV
          </a-button>
          <a-button type="primary" @click="crud.openCreate">
            <template #icon><icon-plus /></template>
            新建任务
          </a-button>
        </template>
      </MedPageHeader>
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="今日待执行" hint="计划日=当日且未完结" :value="kpi.pendingToday" tone="primary" trend="当日清零" trend-dir="flat" :sparkline="spark(1, kpi.pendingToday)" clickable :selected="activeView === 'today'" @click="pickKpi('today')" />
        <MedStatCard label="已逾期任务" hint="需优先闭环与记录原因" :value="kpi.overdue" tone="danger" trend="建议当日处理" trend-dir="flat" :sparkline="spark(2, kpi.overdue)" clickable :selected="activeView === 'overdue'" @click="pickKpi('overdue')" />
        <MedStatCard label="本周已完成" hint="本周内标记完成" :value="kpi.doneWeek" tone="success" trend="保持节律" trend-dir="flat" :sparkline="spark(3, kpi.doneWeek)" clickable :selected="activeView === 'done'" @click="pickKpi('done')" />
        <MedStatCard label="高危未关单" hint="高危且未完成" :value="kpi.highRiskOpen" tone="danger" trend="优先复核" trend-dir="flat" :sparkline="spark(4, kpi.highRiskOpen)" clickable :selected="activeView === 'highrisk'" @click="pickKpi('highrisk')" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="任务队列" desc="支持搜索 / 筛选 / 增删改查 · CSV 导出" :density="density">
        <MedListToolbar
          v-model="crud.searchKey.value"
          search-placeholder="患者姓名 / 患者ID / 任务编号"
          :selected-count="crud.checked.value.length"
          :batch-deletable="true"
          create-text="新建任务"
          :views="viewChips"
          v-model:active-view="activeView"
          density-toggle
          v-model:density="density"
          @create="crud.openCreate"
          @export="crud.exportCSV"
          @refresh="crud.refresh"
          @batch-delete="crud.removeChecked"
        >
          <template #filters>
            <a-select v-model="filterStatus" class="sel" placeholder="状态">
              <a-option value="all">全部状态</a-option>
              <a-option value="待执行">待执行</a-option>
              <a-option value="进行中">进行中</a-option>
              <a-option value="已完成">已完成</a-option>
              <a-option value="已逾期">已逾期</a-option>
              <a-option value="已取消">已取消</a-option>
            </a-select>
            <a-select v-model="filterRisk" class="sel">
              <a-option value="all">全部分层</a-option>
              <a-option value="高危">高危</a-option>
              <a-option value="关注">关注</a-option>
              <a-option value="稳定">稳定</a-option>
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
            :row-key="(r: FollowTaskRow) => r.id"
            :row-class="crud.rowClass"
            :row-selection="{ type: 'checkbox', showCheckedAll: true, width: 44 }"
            :selected-keys="crud.checked.value"
            :scroll="{ x: 1300 }"
            @row-click="crud.onRowClick"
            @selection-change="(keys: any) => (crud.checked.value = keys)"
          />
        </MedPageStates>
      </MedTableCard>

      <div data-testid="ai-decision" class="rightCol">
        <MedAiSuggest :items="aiSuggestItems" />
        <MedPageSection title="执行要点" :desc="crud.selected.value ? '用于随访执行的简要抓手（演示）' : '—'">
          <div class="execBrief">{{ crud.selected.value ? execBrief : '—' }}</div>
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
import { IconDownload, IconPlus } from '@arco-design/web-vue/es/icon';
import MedPageHeader, { type HeaderChip } from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import MedListToolbar, { type ToolbarDensity, type ToolbarView } from '@/components/MedListToolbar.vue';
import MedPageStates from '@/components/MedPageStates.vue';
import MedRecordDrawer, { type FieldDef } from '@/components/MedRecordDrawer.vue';
import MedRowActions from '@/components/MedRowActions.vue';
import { followTaskKpis, seedFollowTasks, type FollowTaskRow } from '@/mock/followTasks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<FollowTaskRow>('follow.tasks', seedFollowTasks);

const filterStatus = ref<string>('all');
const filterRisk = ref<string>('all');
const activeView = ref<string>('all');
const density = ref<ToolbarDensity>('comfortable');

function pickKpi(k: string) {
  activeView.value = activeView.value === k ? 'all' : k;
}

const crud = useCrudList<FollowTaskRow>({
  store,
  idPrefix: 'FT',
  searchFields: ['id', 'patientId', 'patientName', 'visitId'],
  customFilter: (r) => {
    if (filterStatus.value !== 'all' && r.status !== filterStatus.value) return false;
    if (filterRisk.value !== 'all' && r.riskTag !== filterRisk.value) return false;
    if (activeView.value === 'overdue' && r.status !== '已逾期') return false;
    else if (activeView.value === 'today' && r.status !== '待执行' && r.status !== '进行中') return false;
    else if (activeView.value === 'highrisk' && r.riskTag !== '高危') return false;
    else if (activeView.value === 'done' && r.status !== '已完成') return false;
    return true;
  },
  csvColumns: [
    { title: '任务编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '手术日', key: 'surgeryDate' },
    { title: '计划随访日', key: 'planDate' },
    { title: '方式', key: 'taskType' },
    { title: '责任人', key: 'owner' },
    { title: '分层', key: 'riskTag' },
    { title: '状态', key: 'status' },
    { title: '优先级', key: 'priority' },
    { title: '最近动态', key: 'lastContact' }
  ],
  exportName: 'follow-tasks'
});

const kpi = computed(() => followTaskKpis(crud.allRows.value));

function countAll(pred: (r: FollowTaskRow) => boolean) {
  return crud.allRows.value.filter(pred).length;
}
const viewChips = computed<ToolbarView[]>(() => [
  { key: 'all', label: '全部', count: crud.allRows.value.length },
  { key: 'today', label: '待执行', count: countAll((r) => r.status === '待执行' || r.status === '进行中'), tip: '今日/进行中' },
  { key: 'overdue', label: '已逾期', count: countAll((r) => r.status === '已逾期') },
  { key: 'highrisk', label: '高危', count: countAll((r) => r.riskTag === '高危') },
  { key: 'done', label: '已完成', count: countAll((r) => r.status === '已完成') }
]);
const headerChips = computed<HeaderChip[]>(() => {
  const out: HeaderChip[] = [
    { label: '今日待办', value: kpi.value.pendingToday, tone: kpi.value.pendingToday > 0 ? 'primary' : 'default' },
    { label: '逾期', value: kpi.value.overdue, tone: kpi.value.overdue > 0 ? 'danger' : 'success' },
    { label: '高危未关', value: kpi.value.highRiskOpen, tone: kpi.value.highRiskOpen > 0 ? 'warning' : 'success' }
  ];
  if (crud.checked.value.length) out.push({ label: '已选中', value: crud.checked.value.length, tone: 'warning' });
  return out;
});
function spark(seed: number, value: number) {
  const arr: number[] = [];
  let v = Math.max(20, Math.min(120, value * 6 + 20));
  for (let i = 0; i < 12; i++) {
    v += Math.sin((i + seed * 1.7) * 0.65) * 6 + ((seed + i) % 4) - 1;
    arr.push(Math.max(0, Math.round(v)));
  }
  return arr;
}

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true, placeholder: '如 P20260415001' },
  { key: 'patientName', label: '姓名', required: true },
  { key: 'visitId', label: '随访单号', placeholder: '如 V2026-0420-01' },
  { key: 'surgeryDate', label: '手术日', type: 'date' },
  { key: 'planDate', label: '计划随访日', type: 'date', required: true },
  {
    key: 'taskType',
    label: '方式',
    type: 'select',
    required: true,
    options: [
      { label: '电话随访', value: '电话随访' },
      { label: '门诊复查', value: '门诊复查' },
      { label: '微信问卷', value: '微信问卷' },
      { label: '上门访视', value: '上门访视' }
    ]
  },
  { key: 'owner', label: '责任人', required: true },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    required: true,
    options: ['待执行', '进行中', '已完成', '已逾期', '已取消'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'priority',
    label: '优先级',
    type: 'select',
    options: ['高', '中', '低'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'riskTag',
    label: '风险分层',
    type: 'select',
    options: ['稳定', '关注', '高危'].map((v) => ({ label: v, value: v }))
  },
  { key: 'lastContact', label: '最近动态', type: 'textarea', span: 24 }
];

const aiText = computed(() => {
  const r = crud.selected.value;
  if (!r) return { risk: '', actions: [] as string[] };
  let riskTxt = '';
  if (r.status === '已逾期') {
    riskTxt = `该任务已逾期，患者「${r.patientName}」为${r.riskTag}分层，延迟随访可能错过 Scr/血压等关键窗口。`;
  } else if (r.riskTag === '高危') {
    riskTxt = '高危分层：免疫抑制与感染平衡更敏感，需确认近期实验室与用药依从。';
  } else if (r.riskTag === '关注') {
    riskTxt = '关注分层：建议核对上次随访结论与检验趋势，避免「稳定」误判。';
  } else {
    riskTxt = '稳定分层：按路径完成常规随访即可，仍需记录关键体征与用药变动。';
  }
  const actions: string[] = [];
  if (r.status === '已逾期') {
    actions.push('今日内联系患者或家属，说明复查紧迫性并改约最近门诊/检验。');
    actions.push('补记逾期原因（拒接/交通/病情）便于质控统计。');
  }
  if (r.taskType === '门诊复查') actions.push('到院前核对：空腹项目、抽血时点与复查注意事项。');
  if (r.taskType === '电话随访') actions.push('电话脚本：症状 + 用药漏服次数 + 何时复查。');
  if (r.riskTag === '高危') actions.push('必要时同步主管医师，出现排斥/感染征象优先急诊评估路径。');
  if (actions.length === 0) actions.push('按科室 SOP 完成任务并结构化记录，便于后续复盘与质控。');
  return { risk: riskTxt, actions };
});

const execBrief = computed(() => {
  const r = crud.selected.value;
  if (!r) return '';
  return `【${r.taskType}】${r.owner} 负责 · 最近动态：${r.lastContact}`;
});

const aiSuggestItems = computed(() => {
  const r = crud.selected.value;
  if (!r) return ['请选择一个任务行查看建议。', 'AI辅助建议仅供流程提示。'];
  return [aiText.value.risk, ...aiText.value.actions].slice(0, 3);
});

const columns = computed<TableColumnData[]>(() => [
  { title: '任务编号', dataIndex: 'id', width: 150 },
  { title: '患者ID', dataIndex: 'patientId', width: 120 },
  { title: '姓名', dataIndex: 'patientName', width: 90 },
  { title: '手术日', dataIndex: 'surgeryDate', width: 110 },
  { title: '计划随访日', dataIndex: 'planDate', width: 120 },
  { title: '方式', dataIndex: 'taskType', width: 100 },
  { title: '责任人', dataIndex: 'owner', width: 130, ellipsis: true, tooltip: true },
  {
    title: '分层',
    dataIndex: 'riskTag',
    width: 72,
    render: ({ record }: { record: FollowTaskRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.riskTag === '高危' ? 'red' : record.riskTag === '关注' ? 'orangered' : 'green';
      return h(T, { color: c }, () => record.riskTag);
    }
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 90,
    render: ({ record }: { record: FollowTaskRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '已逾期' ? 'red' : record.status === '已完成' ? 'green' : record.status === '已取消' ? 'gray' : 'arcoblue';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '最近动态', dataIndex: 'lastContact', ellipsis: true, tooltip: true },
  {
    title: '操作',
    dataIndex: '__ops',
    width: 168,
    render: ({ record }: { record: FollowTaskRow }) =>
      h(MedRowActions as any, {
        onView: () => crud.openView(record),
        onEdit: () => crud.openEdit(record),
        onDelete: () => crud.removeRow(record.id)
      })
  }
]);
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
  margin-top: 12px;
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
.rightCol {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--med-gap);
}
.execBrief {
  font-size: var(--med-fz-body);
  color: var(--med-text);
  line-height: 1.65;
}
.sel {
  width: 140px;
}
@media (max-width: 1100px) {
  .split { flex-direction: column; }
  .rightCol { width: 100%; }
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
:deep(.row-selected .arco-table-td) {
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>
