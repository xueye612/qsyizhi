<template>
  <div class="med-page wb-home">
    <MedPageSection>
      <div class="wb-hero">
        <MedPageHeader
          title="器官移植患者工作台" 
        />
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
      </div>
    </MedPageSection>

    <div class="split wb-split">
      <MedTableCard title="待办列表" desc="按风险、逾期与紧急度排序；左色条表示患者分层">
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
import MedPageHeader from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import MedTaskTable from '@/components/MedTaskTable.vue';
import MedPatientPanel from '@/components/MedPatientPanel.vue';
import {
  IconCheckCircle,
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

function toggleKpi(key: KpiFilterKey) {
  kpiFilter.value = kpiFilter.value === key ? 'all' : key;
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
  const filtered = filterTasksByKpi(tasks.value, kpiFilter.value, patientMap);
  return sortWorkbenchTasks(filtered, patientMap);
});

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
  --med-primary: #165dff;
  --med-success: #00b42a;
  --med-warning: #ff7d00;
  --med-danger: #f53f3f;
  --med-text: #1d2129;
  --med-text-2: #4e5969;
  --med-muted: #86909c;
  --med-border: #e5e6eb;
  --med-surface: #ffffff;
  --med-ai-bg: #f0f5ff;
  --med-ai-border: #d6e4ff;
  --med-radius: 8px;
  margin: -12px -16px -16px;
  padding: calc(12px + 16px) calc(16px + 16px) calc(16px + 16px);
  min-height: calc(100vh - 60px);
  background: #f4f7f9;
  gap: 16px;
}

.wb-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.wb-hero :deep(.med-page-header) {
  text-align: center;
  width: 100%;
  padding-bottom: 8px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--med-border);
}
.wb-hero :deep(.med-page-header .desc) {
  margin-left: auto;
  margin-right: auto;
  max-width: 560px;
  text-align: center;
}

.kpi-row {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.wb-home :deep(.med-stat-card) {
  box-shadow: none;
}
.wb-home .kpi-row :deep(.med-stat-card .trend) {
  display: none;
}
.wb-home .kpi-row :deep(.med-stat-card .arco-card-body) {
  padding: 10px 12px;
  min-height: 0;
}
.wb-home .kpi-row :deep(.med-stat-card .inner) {
  min-height: 52px;
  gap: 10px;
}
.wb-home .kpi-row :deep(.med-stat-card .icon-wrap) {
  width: 40px;
  height: 40px;
  font-size: 18px;
}
.wb-home .kpi-row :deep(.med-stat-card .value) {
  font-size: 20px;
}
.wb-home .kpi-row :deep(.med-stat-card .hint) {
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.3;
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
  background: rgba(22, 93, 255, 0.1) !important;
}

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
