<!--
  【1. 模块理解】随访任务台：计划随访日、渠道、责任人与风险分层绑定，支撑优先级执行与逾期闭环（演示）。
  【2. 行业调研】常见维度：计划日期、随访方式、执行人、状态（待执行/逾期/完成）；KPI：当日待办、逾期、高危覆盖、周完成。
  【3. 页面设计】KPI 概览 + 筛选；任务表；右侧「AI辅助建议」输出风险摘要与下一步动作（克制风格）。
  【4. 页面代码】采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader
        title="随访任务工作台"
        desc="计划驱动 · 逾期预警 · 高危优先（演示数据：基准日 2026-04-16）"
      />

      <div class="queryBar">
        <a-input v-model="q" allow-clear class="q" placeholder="患者姓名 / 患者ID / 任务编号" />
        <a-select v-model="status" class="sel" placeholder="状态">
          <a-option value="all">全部状态</a-option>
          <a-option value="待执行">待执行</a-option>
          <a-option value="进行中">进行中</a-option>
          <a-option value="已完成">已完成</a-option>
          <a-option value="已逾期">已逾期</a-option>
        </a-select>
        <a-select v-model="risk" class="sel">
          <a-option value="all">全部分层</a-option>
          <a-option value="高危">高危</a-option>
          <a-option value="关注">关注</a-option>
          <a-option value="稳定">稳定</a-option>
        </a-select>
        <a-button type="primary" class="btn-primary queryBar-action">批量提醒（演示）</a-button>
      </div>

      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="今日待执行" hint="计划日=当日且未完结" :value="kpi.pendingToday" tone="primary" trend="当日清零" trend-dir="flat" />
        <MedStatCard label="已逾期任务" hint="需优先闭环与记录原因" :value="kpi.overdue" tone="danger" trend="建议当日处理" trend-dir="flat" />
        <MedStatCard label="本周已完成" hint="统计窗口：本周内标记完成" :value="kpi.doneWeek" tone="success" trend="保持节律" trend-dir="flat" />
        <MedStatCard label="高危未关单" hint="分层=高危且状态≠已完成" :value="kpi.highRiskOpen" tone="danger" trend="优先复核" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="任务队列" desc="支持行选 · 字段对齐随访任务单（演示）">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="{ pageSize: 8, showTotal: true }"
          :row-key="(r: FollowTaskRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1180 }"
          @row-click="onRow"
        />
      </MedTableCard>

      <div data-testid="ai-decision" class="rightCol">
        <MedAiSuggest :items="aiSuggestItems" />
        <MedPageSection title="执行要点" :desc="selected ? '用于随访执行的简要抓手（演示）' : '—'">
          <div class="execBrief">{{ selected ? execBrief : '—' }}</div>
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
import { followTaskKpis, seedFollowTasks, type FollowTaskRow } from '@/mock/followTasks';

const tasks = ref(seedFollowTasks());
const q = ref('');
const status = ref<string>('all');
const risk = ref<string>('all');
const selectedId = ref<string | null>(tasks.value[0]?.id ?? null);

const kpi = computed(() => followTaskKpis(tasks.value));

const rows = computed(() => {
  let list = [...tasks.value];
  const qq = q.value.trim().toLowerCase();
  if (qq) {
    list = list.filter(
      (r) =>
        r.patientName.toLowerCase().includes(qq) ||
        r.patientId.toLowerCase().includes(qq) ||
        r.id.toLowerCase().includes(qq)
    );
  }
  if (status.value !== 'all') list = list.filter((r) => r.status === status.value);
  if (risk.value !== 'all') list = list.filter((r) => r.riskTag === risk.value);
  return list;
});

const selected = computed(() => tasks.value.find((t) => t.id === selectedId.value) ?? null);

const aiText = computed(() => {
  const r = selected.value;
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
  const r = selected.value;
  if (!r) return '';
  return `【${r.taskType}】${r.owner} 负责 · 最近动态：${r.lastContact}`;
});

const aiSuggestItems = computed(() => {
  const r = selected.value;
  if (!r) return ['请选择一个任务行查看建议。', 'AI辅助建议仅供流程提示。'];
  return [aiText.value.risk, ...aiText.value.actions].slice(0, 3);
});

function onRow(row: FollowTaskRow) {
  selectedId.value = row.id;
}

function rowClass(row: FollowTaskRow) {
  return row.id === selectedId.value ? 'row-selected' : '';
}

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
    width: 88,
    render: ({ record }: { record: FollowTaskRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '已逾期' ? 'red' : record.status === '已完成' ? 'green' : 'arcoblue';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '最近动态', dataIndex: 'lastContact', ellipsis: true, tooltip: true }
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
.queryBar{
  margin-top: 12px;
  display:flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items:center;
}
.queryBar-action{
  margin-left: auto;
}
.btn-primary{
  background: var(--med-primary);
  border-color: var(--med-primary);
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
.execBrief{
  font-size: var(--med-fz-body);
  color: var(--med-text);
  line-height: 1.65;
}
@media (max-width: 1100px){
  .split{ flex-direction: column; }
  .rightCol{ width: 100%; }
  .kpi-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
  .q{ width: 100%; }
  .sel{ width: 100%; max-width: 320px; }
  .queryBar-action{ margin-left: 0; }
}
:deep(.row-selected .arco-table-td){
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>

