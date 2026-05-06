<template>
  <MedCrudPage
    title="等待配型患者"
    desc="等待周期通常 1-2 年 · 半年度复查提醒 · 外院上传与本院结果调取（演示）"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    :row-class="waitlistRowClass"
    table-title="配型等待队列"
    search-placeholder="姓名 / 患者ID / HLA"
    create-text="新增待配型患者"
    :scroll-x="1300"
    can-view
  >
    <template #pre-table>
      <div class="wait-visual">
        <div class="wait-flow">
          <div class="wait-flow__step"><span class="wait-flow__idx">1</span><div><div class="wait-flow__title">入组等待</div><div class="wait-flow__desc">进入配型候选池</div></div></div>
          <div class="wait-flow__step"><span class="wait-flow__idx">2</span><div><div class="wait-flow__title">半年复查</div><div class="wait-flow__desc">动态评估病情变化</div></div></div>
          <div class="wait-flow__step"><span class="wait-flow__idx">3</span><div><div class="wait-flow__title">外院上传</div><div class="wait-flow__desc">补齐关键检查资料</div></div></div>
          <div class="wait-flow__step"><span class="wait-flow__idx">4</span><div><div class="wait-flow__title">本院调取</div><div class="wait-flow__desc">统一调阅核心指标</div></div></div>
          <div class="wait-flow__step"><span class="wait-flow__idx">5</span><div><div class="wait-flow__title">进入配型</div><div class="wait-flow__desc">按风险优先级推进</div></div></div>
        </div>

        <div class="wait-status-grid">
          <div class="wait-status wait-status--blue"><div class="wait-status__label">待配型</div><div class="wait-status__value">{{ statusCount.pendingMatch }}</div></div>
          <div class="wait-status wait-status--cyan"><div class="wait-status__label">配型中</div><div class="wait-status__value">{{ statusCount.matching }}</div></div>
          <div class="wait-status wait-status--amber"><div class="wait-status__label">待复查</div><div class="wait-status__value">{{ statusCount.review }}</div></div>
          <div class="wait-status wait-status--red"><div class="wait-status__label">高风险</div><div class="wait-status__value">{{ statusCount.high }}</div></div>
        </div>

        <div class="wait-focus">
          <div class="wait-focus__title">重点关注（高风险）</div>
          <div v-if="highFocus.length" class="wait-focus__list">
            <div v-for="r in highFocus" :key="r.id" class="wait-focus__item">
              {{ r.patientName }}（{{ r.patientId }}）· 等待 {{ r.waitDays }} 天 · 下次复查 {{ r.nextReviewAt }}
            </div>
          </div>
          <div v-else class="wait-focus__empty">暂无高风险患者</div>
        </div>
      </div>
    </template>

    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="待配型">待配型</a-option>
        <a-option value="配型中">配型中</a-option>
        <a-option value="待复查">待复查</a-option>
        <a-option value="已入组手术">已入组手术</a-option>
      </a-select>
      <a-select v-model="filterRisk" class="sel">
        <a-option value="all">全部风险</a-option>
        <a-option value="高">高</a-option>
        <a-option value="中">中</a-option>
        <a-option value="低">低</a-option>
      </a-select>
      <a-select v-model="filterExternal" class="sel">
        <a-option value="all">外院资料</a-option>
        <a-option value="待上传">待上传</a-option>
        <a-option value="已上传">已上传</a-option>
      </a-select>
    </template>

    <template #drawer-view="{ record }">
      <div class="wait-drawer" v-if="record">
        <div class="wait-drawer__head">
          <div>
            <div class="wait-drawer__title">{{ record.patientName }}（{{ record.patientId }}）</div>
            <div class="wait-drawer__meta">等待 {{ record.waitDays }} 天 · 协调员 {{ record.coordinator }}</div>
          </div>
          <a-tag :color="record.riskLevel === '高' ? 'red' : record.riskLevel === '中' ? 'orange' : 'green'">{{ record.riskLevel }}风险</a-tag>
        </div>

        <div class="wait-drawer__grid">
          <div class="wait-drawer__card">
            <div class="wait-drawer__card-title">基础信息</div>
            <div class="wait-drawer__line">血型：{{ record.bloodType }}</div>
            <div class="wait-drawer__line">HLA：{{ record.hla }}</div>
            <div class="wait-drawer__line">等待起始：{{ record.waitSince }}</div>
          </div>

          <div class="wait-drawer__card">
            <div class="wait-drawer__card-title">复查与配型</div>
            <div class="wait-drawer__line">复查周期：{{ record.followupCycle }}</div>
            <div class="wait-drawer__line">上次复查：{{ record.lastReviewAt }}</div>
            <div class="wait-drawer__line">下次复查：{{ record.nextReviewAt }}</div>
            <div class="wait-drawer__line">当前状态：{{ record.status }}</div>
          </div>

          <div class="wait-drawer__card wait-drawer__card--wide">
            <div class="wait-drawer__card-title">资料与宣教</div>
            <div class="wait-drawer__tags">
              <a-tag :color="record.externalResultStatus === '待上传' ? 'orange' : 'green'">外院结果：{{ record.externalResultStatus }}</a-tag>
              <a-tag :color="record.internalResultStatus === '待调取' ? 'arcoblue' : 'green'">本院调取：{{ record.internalResultStatus }}</a-tag>
              <a-tag :color="record.educationStatus === '待完成' ? 'purple' : 'green'">健康宣教：{{ record.educationStatus }}</a-tag>
            </div>
            <div class="wait-drawer__hint">提示：建议先补齐外院结果与本院调取，再进入配型复核。</div>
          </div>
        </div>
      </div>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';
import { seedWaitlistPatients, waitlistKpis, type WaitlistPatientRow } from '@/mock/waitlistPatients';

const store = createDemoStore<WaitlistPatientRow>('patients.waitlist', seedWaitlistPatients);
const filterStatus = ref('all');
const filterRisk = ref('all');
const filterExternal = ref('all');

const crud = useCrudList<WaitlistPatientRow>({
  store,
  idPrefix: 'WL',
  searchFields: ['id', 'patientId', 'patientName', 'hla'],
  customFilter: (r) => {
    if (filterStatus.value !== 'all' && r.status !== filterStatus.value) return false;
    if (filterRisk.value !== 'all' && r.riskLevel !== filterRisk.value) return false;
    if (filterExternal.value !== 'all' && r.externalResultStatus !== filterExternal.value) return false;
    return true;
  },
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '血型', key: 'bloodType' },
    { title: 'HLA', key: 'hla' },
    { title: '等待起始', key: 'waitSince' },
    { title: '等待天数', key: 'waitDays' },
    { title: '风险', key: 'riskLevel' },
    { title: '上次复查', key: 'lastReviewAt' },
    { title: '下次复查', key: 'nextReviewAt' },
    { title: '复查周期', key: 'followupCycle' },
    { title: '外院结果', key: 'externalResultStatus' },
    { title: '本院调取', key: 'internalResultStatus' },
    { title: '健康宣教', key: 'educationStatus' },
    { title: '状态', key: 'status' },
    { title: '协调员', key: 'coordinator' }
  ],
  exportName: 'patients-waitlist'
});

const k = computed(() => waitlistKpis(crud.allRows.value));
const statusCount = computed(() => {
  const rows = crud.allRows.value;
  return {
    pendingMatch: rows.filter((r) => r.status === '待配型').length,
    matching: rows.filter((r) => r.status === '配型中').length,
    review: rows.filter((r) => r.status === '待复查').length,
    high: rows.filter((r) => r.riskLevel === '高').length
  };
});

const highFocus = computed(() =>
  crud.allRows.value
    .filter((r) => r.riskLevel === '高')
    .sort((a, b) => b.waitDays - a.waitDays)
    .slice(0, 2)
);

function waitlistRowClass(row: WaitlistPatientRow) {
  if (row.riskLevel === '高') return 'wait-row wait-row--high';
  if (row.riskLevel === '中') return 'wait-row wait-row--warn';
  return 'wait-row wait-row--normal';
}

const kpis = computed<KpiDef[]>(() => [
  { label: '总等待人数', value: k.value.total, tone: 'primary', trend: '配型池' },
  { label: '高风险', value: k.value.high, tone: 'danger', trend: '优先随访' },
  { label: '待复查', value: k.value.pendingReview, tone: 'warning', trend: '临期处理' },
  { label: '外院待上传', value: k.value.externalPending, tone: 'warning', trend: '资料补齐' },
  { label: '宣教待完成', value: k.value.educationPending, tone: 'default', trend: '教育跟进' },
  { label: '等待>=180天', value: k.value.longWait, tone: 'default', trend: '关注时长' }
]);

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  {
    key: 'bloodType',
    label: '血型',
    type: 'select',
    required: true,
    options: ['A', 'B', 'AB', 'O'].map((v) => ({ label: v, value: v }))
  },
  { key: 'hla', label: 'HLA摘要', required: true },
  { key: 'waitSince', label: '等待起始日', type: 'date' },
  { key: 'waitDays', label: '等待天数', type: 'number', min: 0 },
  {
    key: 'riskLevel',
    label: '风险',
    type: 'select',
    options: ['高', '中', '低'].map((v) => ({ label: v, value: v }))
  },
  { key: 'lastReviewAt', label: '上次复查日', type: 'date' },
  { key: 'nextReviewAt', label: '下次复查日', type: 'date' },
  {
    key: 'followupCycle',
    label: '复查周期',
    type: 'select',
    options: [{ label: '半年复查', value: '半年复查' }]
  },
  {
    key: 'externalResultStatus',
    label: '外院结果',
    type: 'select',
    options: ['待上传', '已上传'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'internalResultStatus',
    label: '本院调取',
    type: 'select',
    options: ['待调取', '已调取'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'educationStatus',
    label: '健康宣教',
    type: 'select',
    options: ['待完成', '已完成'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: ['待配型', '配型中', '待复查', '已入组手术'].map((v) => ({ label: v, value: v }))
  },
  { key: 'coordinator', label: '协调员' }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 110 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 100 },
  { title: '血型', dataIndex: 'bloodType', width: 80 },
  { title: 'HLA摘要', dataIndex: 'hla', width: 180 },
  { title: '等待起始', dataIndex: 'waitSince', width: 120 },
  { title: '等待天数', dataIndex: 'waitDays', width: 100 },
  {
    title: '风险',
    dataIndex: 'riskLevel',
    width: 90,
    render: ({ record }: { record: WaitlistPatientRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.riskLevel === '高' ? 'red' : record.riskLevel === '中' ? 'orange' : 'green';
      return h(T, { color: c }, () => record.riskLevel);
    }
  },
  { title: '上次复查', dataIndex: 'lastReviewAt', width: 130 },
  { title: '下次复查', dataIndex: 'nextReviewAt', width: 130 },
  { title: '复查周期', dataIndex: 'followupCycle', width: 110 },
  {
    title: '外院结果',
    dataIndex: 'externalResultStatus',
    width: 110,
    render: ({ record }: { record: WaitlistPatientRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.externalResultStatus === '待上传' ? 'orange' : 'green';
      return h(T, { color: c }, () => record.externalResultStatus);
    }
  },
  {
    title: '本院调取',
    dataIndex: 'internalResultStatus',
    width: 110,
    render: ({ record }: { record: WaitlistPatientRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.internalResultStatus === '待调取' ? 'arcoblue' : 'green';
      return h(T, { color: c }, () => record.internalResultStatus);
    }
  },
  {
    title: '健康宣教',
    dataIndex: 'educationStatus',
    width: 110,
    render: ({ record }: { record: WaitlistPatientRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.educationStatus === '待完成' ? 'purple' : 'green';
      return h(T, { color: c }, () => record.educationStatus);
    }
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: ({ record }: { record: WaitlistPatientRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '待复查' ? 'orangered' : record.status === '配型中' ? 'arcoblue' : 'gray';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '协调员', dataIndex: 'coordinator', width: 100 }
];
</script>

<style scoped>
.sel { width: 140px; }

.wait-visual {
  display: grid;
  gap: 10px;
  margin: 10px 0 14px;
}

.wait-flow {
  display: grid;
  gap: 8px;
  padding: 10px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f7fbff 0%, #eef7ff 100%);
  border: 1px solid #d7e7ff;
}

.wait-flow__step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e8eef8;
}

.wait-flow__idx {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #1f6feb;
  background: #eaf3ff;
  border: 1px solid #cfe1ff;
}

.wait-flow__title { font-size: 12px; font-weight: 700; color: #1d2129; }
.wait-flow__desc { font-size: 11px; color: #86909c; margin-top: 2px; }

.wait-status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.wait-status {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e5e6eb;
}

.wait-status__label { font-size: 11px; font-weight: 700; }
.wait-status__value { font-size: 18px; line-height: 1.1; margin-top: 4px; font-weight: 700; }

.wait-status--blue { background: linear-gradient(135deg, #eef6ff 0%, #e2efff 100%); }
.wait-status--blue .wait-status__label,
.wait-status--blue .wait-status__value { color: #1f6feb; }

.wait-status--cyan { background: linear-gradient(135deg, #edfcff 0%, #e1f8ff 100%); }
.wait-status--cyan .wait-status__label,
.wait-status--cyan .wait-status__value { color: #0f7f9d; }

.wait-status--amber { background: linear-gradient(135deg, #fff8ec 0%, #fff2df 100%); }
.wait-status--amber .wait-status__label,
.wait-status--amber .wait-status__value { color: #ad6800; }

.wait-status--red { background: linear-gradient(135deg, #fff2f2 0%, #ffe9e9 100%); }
.wait-status--red .wait-status__label,
.wait-status--red .wait-status__value { color: #cb2634; }

.wait-focus {
  padding: 10px;
  border-radius: 10px;
  background: #fff7f7;
  border: 1px solid #ffd8d8;
}

.wait-focus__title { font-size: 12px; font-weight: 700; color: #cb2634; margin-bottom: 6px; }
.wait-focus__list { display: grid; gap: 4px; }
.wait-focus__item { font-size: 12px; color: #4e5969; }
.wait-focus__empty { font-size: 12px; color: #86909c; }

.wait-drawer { display: grid; gap: 10px; }
.wait-drawer__head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
  padding: 10px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f3f8ff 0%, #ebf3ff 100%);
  border: 1px solid #dbe7ff;
}
.wait-drawer__title { font-size: 14px; font-weight: 700; color: #1d2129; }
.wait-drawer__meta { margin-top: 4px; font-size: 12px; color: #4e5969; }

.wait-drawer__grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.wait-drawer__card {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e5e6eb;
  background: #fff;
}
.wait-drawer__card--wide { grid-column: 1 / -1; }
.wait-drawer__card-title { font-size: 12px; font-weight: 700; color: #1d2129; margin-bottom: 8px; }
.wait-drawer__line { font-size: 12px; color: #4e5969; line-height: 1.7; }
.wait-drawer__tags { display: flex; flex-wrap: wrap; gap: 8px; }
.wait-drawer__hint { margin-top: 8px; font-size: 12px; color: #86909c; }

@media (max-width: 720px) {
  .wait-drawer__grid { grid-template-columns: 1fr; }
}

:deep(.wait-row .arco-table-td) {
  background: linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.98) 100%);
}

:deep(.wait-row--high .arco-table-td:first-child) {
  box-shadow: inset 4px 0 0 #f53f3f;
}

:deep(.wait-row--warn .arco-table-td:first-child) {
  box-shadow: inset 4px 0 0 #ff7d00;
}

:deep(.wait-row--normal .arco-table-td:first-child) {
  box-shadow: inset 4px 0 0 #00b42a;
}

:deep(.wait-row--high .arco-table-td) {
  background: linear-gradient(90deg, rgba(255, 244, 244, 0.88) 0%, rgba(255,255,255,0.98) 60%);
}

:deep(.wait-row--warn .arco-table-td) {
  background: linear-gradient(90deg, rgba(255, 247, 237, 0.9) 0%, rgba(255,255,255,0.98) 60%);
}

:deep(.wait-row--normal .arco-table-td) {
  background: linear-gradient(90deg, rgba(240, 255, 244, 0.88) 0%, rgba(255,255,255,0.98) 60%);
}
</style>
