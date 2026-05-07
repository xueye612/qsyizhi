<!-- AI 异常报警 -->
<template>
  <MedCrudPage
    title="AI 异常报警中心"
    desc="阈值 breach · 通知渠道 · 处置与误报标注（演示）"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="报警队列"
    search-placeholder="患者 / 指标 / 编号"
    create-text="新增报警"
    :scroll-x="1200"
    can-view
  >
    <template #drawer-view="{ record }">
      <div class="detail" v-if="record">
        <div class="detail__head">
          <div>
            <div class="detail__title">{{ record.metric }} 报警</div>
            <div class="detail__meta">{{ record.patientName }}（{{ record.patientId }}）· 触发 {{ record.firedAt }}</div>
          </div>
          <a-tag :color="record.severity === '高' ? 'red' : record.severity === '中' ? 'orangered' : 'arcoblue'">{{ record.severity }}严重度</a-tag>
        </div>

        <div class="detail__grid">
          <div class="detail__card">
            <div class="detail__card-title">报警信息</div>
            <div class="detail__line">报警编号：{{ record.id }}</div>
            <div class="detail__line">报警指标：{{ record.metric }}</div>
            <div class="detail__line">越阈说明：{{ record.breach }}</div>
          </div>
          <div class="detail__card">
            <div class="detail__card-title">处置信息</div>
            <div class="detail__line">通知渠道：{{ record.channel }}</div>
            <div class="detail__line">当前状态：{{ record.status }}</div>
            <div class="detail__line">建议动作：{{ record.status === '待处置' ? '优先确认并记录处置结论' : record.status === '已确认' ? '继续跟踪闭环' : '回溯阈值并优化规则' }}</div>
          </div>
        </div>
      </div>
    </template>

    <template #filters>
      <a-select v-model="filterSeverity" class="sel">
        <a-option value="all">全部严重度</a-option>
        <a-option value="高">高</a-option>
        <a-option value="中">中</a-option>
        <a-option value="低">低</a-option>
      </a-select>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="待处置">待处置</a-option>
        <a-option value="已确认">已确认</a-option>
        <a-option value="误报">误报</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { aiAlertKpis, seedAiAlerts, type AiAlertRow } from '@/mock/aiAssist';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<AiAlertRow>('ai.alerts', seedAiAlerts);
const filterSeverity = ref('all');
const filterStatus = ref('all');

const crud = useCrudList<AiAlertRow>({
  store,
  idPrefix: 'AL',
  searchFields: ['id', 'patientId', 'patientName', 'metric'],
  customFilter: (r) =>
    (filterSeverity.value === 'all' || r.severity === filterSeverity.value) &&
    (filterStatus.value === 'all' || r.status === filterStatus.value),
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '指标', key: 'metric' },
    { title: '越阈', key: 'breach' },
    { title: '严重度', key: 'severity' },
    { title: '渠道', key: 'channel' },
    { title: '状态', key: 'status' },
    { title: '触发时间', key: 'firedAt' }
  ],
  exportName: 'ai-alerts'
});

const k = computed(() => aiAlertKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '待处置', value: k.value.pending, tone: 'danger', trend: '需跟进' },
  { label: '高严重度', value: k.value.high, tone: 'danger', trend: '双通道确认' },
  { label: '已确认', value: k.value.confirmed, tone: 'success', trend: '闭环留痕' },
  { label: '误报', value: k.value.falsePositive, tone: 'default', trend: '阈值调优' }
]);

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  { key: 'metric', label: '指标', required: true },
  { key: 'breach', label: '越阈', span: 24 },
  {
    key: 'severity',
    label: '严重度',
    type: 'select',
    required: true,
    options: ['高', '中', '低'].map((v) => ({ label: v, value: v }))
  },
  { key: 'channel', label: '通知渠道' },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: ['待处置', '已确认', '误报'].map((v) => ({ label: v, value: v }))
  },
  { key: 'firedAt', label: '触发时间', placeholder: '2026-04-20 09:00' }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 130 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '指标', dataIndex: 'metric', width: 130, ellipsis: true, tooltip: true },
  { title: '越阈', dataIndex: 'breach', ellipsis: true, tooltip: true },
  {
    title: '严重度',
    dataIndex: 'severity',
    width: 90,
    render: ({ record }: { record: AiAlertRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.severity === '高' ? 'red' : record.severity === '中' ? 'orangered' : 'arcoblue';
      return h(T, { color: c }, () => record.severity);
    }
  },
  { title: '渠道', dataIndex: 'channel', width: 150, ellipsis: true, tooltip: true },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: AiAlertRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '待处置' ? 'red' : record.status === '已确认' ? 'green' : 'gray';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '触发时间', dataIndex: 'firedAt', width: 150 }
];
</script>
<style scoped>
.sel{width:130px}

.detail { display: grid; gap: 10px; }
.detail__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fff6f6 0%, #fff0f0 100%);
  border: 1px solid #ffd8d8;
}
.detail__title { font-size: 14px; font-weight: 700; color: #1d2129; }
.detail__meta { margin-top: 4px; font-size: 12px; color: #4e5969; }
.detail__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.detail__card { padding: 10px; border-radius: 10px; border: 1px solid #e5e6eb; background: #fff; }
.detail__card-title { font-size: 12px; font-weight: 700; color: #1d2129; margin-bottom: 8px; }
.detail__line { font-size: 12px; color: #4e5969; line-height: 1.7; }
@media (max-width: 720px) {
  .detail__grid { grid-template-columns: 1fr; }
}
</style>
