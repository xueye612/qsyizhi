<template>
  <div class="med-page wb-home">
    <header class="wb-topbar">
      <div class="tb-accent" />
      <div class="tb-left">
        <div class="tb-icon"><IconCommon /></div>
        <div class="tb-text">
          <h1 class="tb-title">器官移植患者工作台</h1>
          <span class="tb-sub">实时监控 · 智能预警 · 全流程随访</span>
        </div>
      </div>
      <div class="tb-meta">
        <div class="tb-stat">
          <span class="k">在管患者</span>
          <span class="v tabular">{{ patients.length }}</span>
        </div>
        <div class="tb-divider" />
        <div class="tb-stat">
          <span class="k">今日待办</span>
          <span class="v tabular">{{ tasks.length }}</span>
        </div>
        <div class="tb-divider" />
        <div class="tb-stat">
          <span class="k">已闭环</span>
          <span class="v tabular ok">{{ doneCount }}</span>
        </div>
      </div>
      <div class="tb-right">
        <span class="tb-pill on"><i class="d g" />引擎在线</span>
        <span class="tb-pill"><i class="d b" />延迟 &lt; 2s</span>
      </div>
    </header>

    <div data-testid="kpi-region" class="kpi-row">
      <MedStatCard
        label="高风险患者"
        hint="点击筛选待办"
        :value="countRisk.high"
        tone="danger"
        :clickable="true"
        :selected="kpiFilter === 'risk-high'"
        trend="科室口径"
        trend-dir="flat"
        @click="toggleKpi('risk-high')"
      >
        <template #icon><IconExclamationCircle /></template>
      </MedStatCard>
      <MedStatCard
        label="中风险患者"
        hint="点击筛选"
        :value="countRisk.mid"
        tone="warning"
        :clickable="true"
        :selected="kpiFilter === 'risk-mid'"
        trend="趋势随访"
        trend-dir="flat"
        @click="toggleKpi('risk-mid')"
      >
        <template #icon><IconInfoCircle /></template>
      </MedStatCard>
      <MedStatCard
        label="低风险患者"
        hint="点击筛选"
        :value="countRisk.low"
        tone="success"
        :clickable="true"
        :selected="kpiFilter === 'risk-low'"
        trend="常规计划"
        trend-dir="flat"
        @click="toggleKpi('risk-low')"
      >
        <template #icon><IconCheckCircle /></template>
      </MedStatCard>
      <MedStatCard
        label="今日紧急待处理"
        hint="高急 / 逾期"
        :value="countUrgent"
        tone="danger"
        :clickable="true"
        :selected="kpiFilter === 'urgent'"
        trend="⚠ 优先队列"
        trend-dir="flat"
        @click="toggleKpi('urgent')"
      >
        <template #icon><IconThunderbolt /></template>
      </MedStatCard>
    </div>

    <WbDashboardStrip
      :patients="patients"
      :tasks="tasks"
      :risk-counts="countRisk"
    />

    <div class="split wb-split">
      <MedTableCard title="待办列表" desc="按风险、逾期与紧急度排序；左色条表示患者分层">
        <template #actions>
          <div class="todo-toolbar">
            <div class="todo-stats">
              <span class="ts-item"><span class="d todo" />待办 <b class="tabular">{{ todoCount }}</b></span>
              <span class="ts-item"><span class="d done" />闭环 <b class="tabular">{{ doneCount }}</b></span>
              <span class="ts-item"><span class="d over" />逾期 <b class="tabular">{{ overdueCount }}</b></span>
              <span class="ts-item"><span class="d urg" />高急 <b class="tabular">{{ urgentCount }}</b></span>
            </div>
            <div class="todo-filter">
              <span
                v-for="f in kindFilters"
                :key="f.key"
                class="chip"
                :class="{ active: kindFilter === f.key }"
                @click="toggleKind(f.key)"
              >
                {{ f.label }}
                <b class="tabular">{{ f.count }}</b>
              </span>
            </div>
          </div>
        </template>
        <MedTaskTable
          :data="displayTasks"
          :patient-map="patientMap"
          :selected-id="selectedId"
          @row-click="onRowClick"
        />
      </MedTableCard>

      <div class="rightCol">
        <MedPatientPanel
          v-if="selectedPatient"
          :patient="selectedPatient"
          :risk-level="riskLevelOf(selectedPatient)"
          :active-task="selectedTask"
          @mark-done="markDone"
          @open-detail="openDetail"
        />
        <MedPageSection v-else title="患者详情" desc="—">
          <div class="empty">请选择左侧待办查看患者面板。</div>
        </MedPageSection>

        <div data-testid="ai-decision" class="ai-col-nested">
          <MedAiSuggest :items="aiItems" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import MedTaskTable from '@/components/MedTaskTable.vue';
import MedPatientPanel from '@/components/MedPatientPanel.vue';
import WbDashboardStrip from '@/components/workbench/WbDashboardStrip.vue';
import {
  IconCheckCircle,
  IconCommon,
  IconExclamationCircle,
  IconInfoCircle,
  IconThunderbolt
} from '@arco-design/web-vue/es/icon';
import { riskLevelOf } from '@/mock/patients';
import {
  buildAiSuggestions,
  filterTasksByKpi,
  getWorkbenchDataset,
  sortWorkbenchTasks,
  taskOverdue,
  type KpiFilterKey,
  type WorkbenchTask
} from '@/mock/workbenchData';

const dataset = getWorkbenchDataset();
const patients = ref(dataset.patients);
const patientMap = dataset.patientMap;
const tasks = ref(dataset.tasks);

const kpiFilter = ref<KpiFilterKey>('all');
const kindFilter = ref<'all' | WorkbenchTask['kind']>('all');

function toggleKpi(key: KpiFilterKey) {
  kpiFilter.value = kpiFilter.value === key ? 'all' : key;
}
function toggleKind(key: 'all' | WorkbenchTask['kind']) {
  kindFilter.value = kindFilter.value === key ? 'all' : key;
}

const countRisk = computed(() => {
  let high = 0;
  let mid = 0;
  let low = 0;
  for (const p of patients.value) {
    const r = riskLevelOf(p);
    if (r === 'high') high++;
    else if (r === 'mid') mid++;
    else low++;
  }
  return { high, mid, low };
});

const countUrgent = computed(
  () => tasks.value.filter((t) => t.state === 'todo' && (t.urgency === 'high' || taskOverdue(t))).length
);

const displayTasks = computed(() => {
  let filtered = filterTasksByKpi(tasks.value, kpiFilter.value, patientMap);
  if (kindFilter.value !== 'all') {
    filtered = filtered.filter((t) => t.kind === kindFilter.value);
  }
  return sortWorkbenchTasks(filtered, patientMap);
});

const todoCount = computed(() => tasks.value.filter((t) => t.state === 'todo').length);
const doneCount = computed(() => tasks.value.filter((t) => t.state === 'done').length);
const overdueCount = computed(() => tasks.value.filter((t) => t.state === 'todo' && taskOverdue(t)).length);
const urgentCount = computed(() => tasks.value.filter((t) => t.state === 'todo' && t.urgency === 'high').length);

const kindFilters = computed(() => [
  { key: 'all' as const,    label: '全部', count: tasks.value.length },
  { key: 'follow' as const, label: '随访', count: tasks.value.filter((t) => t.kind === 'follow').length },
  { key: 'lab' as const,    label: '复查', count: tasks.value.filter((t) => t.kind === 'lab').length },
  { key: 'med' as const,    label: '用药', count: tasks.value.filter((t) => t.kind === 'med').length }
]);

const selectedId = ref<string | null>(displayTasks.value[0]?.id ?? null);

const selectedTask = computed(() => tasks.value.find((t) => t.id === selectedId.value) || null);
const selectedPatient = computed(() => {
  const t = selectedTask.value;
  if (!t) return null;
  return patientMap.get(t.patientId) ?? null;
});

const aiItems = computed(() => buildAiSuggestions(selectedPatient.value, selectedTask.value));

function onRowClick(r: WorkbenchTask) {
  selectedId.value = r.id;
}

function markDone() {
  const t = selectedTask.value;
  if (!t) return;
  const row = tasks.value.find((x) => x.id === t.id);
  if (row) row.state = 'done';
}

function openDetail() {
  /* 占位 */
}
</script>

<style scoped>
.med-page {
  box-sizing: border-box;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.med-page.wb-home {
  --med-primary: #1F6FEB;
  --med-success: #389e0d;
  --med-warning: #d46b08;
  --med-danger: #d4380d;
  --med-text: #1d2129;
  --med-text-2: #4e5969;
  --med-muted: #86909c;
  --med-border: #e5e6eb;
  --med-surface: #ffffff;
  --med-ai-bg: #f0f5ff;
  --med-ai-border: #d6e4ff;
  --med-radius: 8px;
  margin: -8px -12px 0;
  padding: 20px 24px 16px;
  min-height: 100%;
  background: #f4f7f9;
  gap: 16px;
}

.wb-hero {
  display: none;
}

.wb-topbar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 20px;
  border-radius: 12px;
  background:
    radial-gradient(circle at 92% 0%, rgba(31, 111, 235, .14), transparent 55%),
    radial-gradient(circle at 8% 100%, rgba(19, 168, 168, .10), transparent 60%),
    linear-gradient(135deg, #f4f8ff 0%, #ffffff 60%, #f3fbfa 100%);
  border: 1px solid #e6efff;
  box-shadow: 0 1px 0 rgba(15, 23, 42, .02);
  overflow: hidden;
}
.wb-topbar .tb-accent {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #1F6FEB 0%, #13a8a8 100%);
}
.wb-topbar .tb-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.wb-topbar .tb-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1F6FEB 0%, #4f8af0 100%);
  color: #fff;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(31, 111, 235, .25);
}
.wb-topbar .tb-text { display: flex; flex-direction: column; gap: 2px; }
.wb-topbar .tb-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -.01em;
  color: var(--med-text);
  line-height: 1.25;
}
.wb-topbar .tb-sub {
  font-size: 12px;
  color: var(--med-text-2);
  letter-spacing: .02em;
}
.wb-topbar .tb-meta {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 0 16px;
}
.wb-topbar .tb-stat { display: inline-flex; flex-direction: column; align-items: flex-start; line-height: 1.15; }
.wb-topbar .tb-stat .k { font-size: 11px; color: var(--med-muted); }
.wb-topbar .tb-stat .v { font-size: 18px; font-weight: 700; color: var(--med-text); margin-top: 2px; letter-spacing: -.02em; }
.wb-topbar .tb-stat .v.ok { color: var(--c-normal); }
.wb-topbar .tb-divider { width: 1px; height: 28px; background: rgba(15, 23, 42, .08); }
.wb-topbar .tb-right { display: inline-flex; gap: 8px; }
.wb-topbar .tb-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 11px;
  color: var(--med-text-2);
  background: rgba(255, 255, 255, .8);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(31, 111, 235, .14);
  border-radius: 999px;
}
.wb-topbar .tb-pill .d {
  width: 6px; height: 6px; border-radius: 50%;
  display: inline-block;
}
.wb-topbar .tb-pill .d.g { background: var(--c-normal); box-shadow: 0 0 0 3px rgba(56, 158, 13, .18); }
.wb-topbar .tb-pill .d.b { background: var(--med-primary); }

.kpi-row {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.wb-home :deep(.med-stat-card) {
  box-shadow: var(--c-shadow-1);
}
.wb-home .kpi-row :deep(.med-stat-card .arco-card-body) {
  padding: 14px 16px;
}
.wb-home .kpi-row :deep(.med-stat-card .inner) {
  min-height: 64px;
  gap: 12px;
}
.wb-home .kpi-row :deep(.med-stat-card .icon-wrap) {
  width: 44px;
  height: 44px;
  font-size: 20px;
}
.wb-home .kpi-row :deep(.med-stat-card .value) {
  font-size: 26px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -.02em;
}
.wb-home .kpi-row :deep(.med-stat-card .label) {
  font-size: 12px;
  font-weight: 500;
}
.wb-home .kpi-row :deep(.med-stat-card .hint) {
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.3;
}
.wb-home .kpi-row :deep(.med-stat-card .trend) {
  font-size: 11px;
  color: var(--med-muted);
}

.split {
  display: flex;
  gap: 16px;
  align-items: stretch;
  min-width: 0;
}

.wb-split {
  flex: 1 1 auto;
  min-height: 0;
}

.wb-home .wb-split > :first-child {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  align-self: stretch;
}

.wb-home .wb-split > :first-child :deep(.arco-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.wb-home .wb-split > :first-child :deep(.arco-card-body) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.wb-home .wb-split > :first-child :deep(.med-card .body) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.wb-home .wb-split > :first-child :deep(.tableWrap) {
  flex: 1 1 auto;
  min-height: min(380px, calc(100vh - 420px));
}

.rightCol {
  width: clamp(340px, 36vw, 460px);
  flex: 0 0 clamp(340px, 36vw, 460px);
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.ai-col-nested {
  flex: 1 1 auto;
  min-height: 140px;
  display: flex;
  flex-direction: column;
}
.ai-col-nested :deep(.med-ai-card) {
  flex: 1;
  min-height: 0;
}

.empty {
  font-size: 13px;
  color: var(--med-muted);
  line-height: 1.6;
}

.wb-home :deep(.tableWrap .arco-table-th) {
  background: #f7f8fa !important;
  font-weight: 600;
}
.wb-home :deep(.tableWrap .arco-table-tr:hover .arco-table-td) {
  background: #f2f3f5 !important;
}
.wb-home :deep(.row-selected .arco-table-td) {
  background: rgba(31, 111, 235, 0.10) !important;
}

/* === \u5f85\u529e\u5217\u8868\u9876\u90e8 toolbar === */
.todo-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.todo-stats {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 6px 14px;
  background: var(--c-surface-3);
  border-radius: 999px;
}
.todo-stats .ts-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--med-text-2);
}
.todo-stats .ts-item b {
  font-weight: 700;
  color: var(--med-text);
  font-size: 13px;
  letter-spacing: -.01em;
}
.todo-stats .d {
  width: 8px; height: 8px; border-radius: 50%;
}
.todo-stats .d.todo { background: var(--med-primary); }
.todo-stats .d.done { background: var(--c-normal); }
.todo-stats .d.over { background: var(--c-critical); }
.todo-stats .d.urg  { background: var(--c-warning); }

.todo-filter {
  display: inline-flex;
  gap: 6px;
}
.todo-filter .chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--med-text-2);
  background: #fff;
  border: 1px solid var(--med-border);
  border-radius: 999px;
  cursor: pointer;
  transition: all 140ms var(--c-ease);
  user-select: none;
}
.todo-filter .chip b {
  font-size: 11px;
  color: var(--med-muted);
  font-weight: 600;
}
.todo-filter .chip:hover {
  border-color: rgba(31, 111, 235, .35);
  color: var(--med-primary);
}
.todo-filter .chip.active {
  background: var(--med-primary);
  border-color: var(--med-primary);
  color: #fff;
}
.todo-filter .chip.active b { color: rgba(255, 255, 255, .85); }

@media (max-width: 1100px) {
  .split {
    flex-direction: column;
  }
  .rightCol {
    width: 100%;
    max-width: none;
    flex: 1 1 auto;
  }
  .kpi-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
