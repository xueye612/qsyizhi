<!-- AI 问诊会话 -->
<template>
  <MedCrudPage
    title="AI 问诊会话"
    desc="临床助手对话队列 · 待医师审签 · 安全标记"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="会话列表"
    search-placeholder="患者 / 主题 / 编号"
    create-text="新建会话"
    :scroll-x="1300"
    can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="草稿">草稿</a-option>
        <a-option value="待医师审签">待医师审签</a-option>
        <a-option value="已归档">已归档</a-option>
      </a-select>
      <a-select v-model="filterSafety" class="sel">
        <a-option value="all">全部安全标记</a-option>
        <a-option value="无">无</a-option>
        <a-option value="需复核">需复核</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { aiChatKpis, seedAiChatSessions, type AiChatSession } from '@/mock/aiAssist';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<AiChatSession>('ai.chat', seedAiChatSessions);
const filterStatus = ref('all');
const filterSafety = ref('all');

const crud = useCrudList<AiChatSession>({
  store,
  idPrefix: 'CH',
  searchFields: ['id', 'patientId', 'patientName', 'topic'],
  customFilter: (r) =>
    (filterStatus.value === 'all' || r.status === filterStatus.value) &&
    (filterSafety.value === 'all' || r.safetyFlag === filterSafety.value),
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '主题', key: 'topic' },
    { title: '模型', key: 'model' },
    { title: '轮次', key: 'turns' },
    { title: '最近时间', key: 'lastAt' },
    { title: '状态', key: 'status' },
    { title: '安全', key: 'safetyFlag' }
  ],
  exportName: 'ai-chat-sessions'
});

const k = computed(() => aiChatKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '待审签', value: k.value.pendingSign, tone: 'warning', trend: '医师阅读' },
  { label: '需复核', value: k.value.safety, tone: 'danger', trend: '安全标记' },
  { label: '草稿数', value: k.value.drafts, tone: 'default', trend: '继续整理' },
  { label: '已归档', value: k.value.archived, tone: 'success', trend: '闭环存档' }
]);

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  { key: 'topic', label: '主题', required: true, span: 24 },
  { key: 'model', label: '模型', placeholder: '临床助手-演示' },
  { key: 'turns', label: '轮次', type: 'number', min: 0, max: 200 },
  { key: 'lastAt', label: '最近时间', placeholder: '2026-04-20 09:00' },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: ['草稿', '待医师审签', '已归档'].map((v) => ({ label: v, value: v }))
  },
  {
    key: 'safetyFlag',
    label: '安全标记',
    type: 'select',
    options: ['无', '需复核'].map((v) => ({ label: v, value: v }))
  }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 150 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '主题', dataIndex: 'topic', width: 280, ellipsis: true, tooltip: true },
  { title: '模型', dataIndex: 'model', width: 130 },
  { title: '轮次', dataIndex: 'turns', width: 70 },
  { title: '最近时间', dataIndex: 'lastAt', width: 150 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    render: ({ record }: { record: AiChatSession }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '已归档' ? 'green' : record.status === '待医师审签' ? 'orangered' : 'arcoblue';
      return h(T, { color: c }, () => record.status);
    }
  },
  {
    title: '安全',
    dataIndex: 'safetyFlag',
    width: 90,
    render: ({ record }: { record: AiChatSession }) => {
      const T = resolveComponent('a-tag') as any;
      return h(T, { color: record.safetyFlag === '需复核' ? 'red' : 'gray' }, () => record.safetyFlag);
    }
  }
];
</script>
<style scoped>.sel{width:140px}</style>
