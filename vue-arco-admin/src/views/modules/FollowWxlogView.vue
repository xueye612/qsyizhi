<!-- 企业微信推送记录：模板、状态、错误原因（演示） -->
<template>
  <MedCrudPage
    title="企业微信推送记录"
    desc="患者侧消息触达 · 模板/状态/错误原因可追溯"
    :kpis="kpiList"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="推送日志"
    table-desc="支持搜索 / 状态筛选 / 增删改查 / CSV 导出"
    search-placeholder="患者 / 模板 / 编号"
    create-text="新增推送记录"
    :scroll-x="1100"
    can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="已送达">已送达</a-option>
        <a-option value="已读">已读</a-option>
        <a-option value="失败">失败</a-option>
        <a-option value="待确认">待确认</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { followWxlogKpis, seedFollowWxlog, type FollowWxlogRow } from '@/mock/followWxlog';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<FollowWxlogRow>('follow.wxlog', seedFollowWxlog);
const filterStatus = ref<string>('all');

const crud = useCrudList<FollowWxlogRow>({
  store,
  idPrefix: 'WX',
  searchFields: ['id', 'patientId', 'patientName', 'template'],
  customFilter: (r) => filterStatus.value === 'all' || r.status === filterStatus.value,
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '患者ID', key: 'patientId' },
    { title: '姓名', key: 'patientName' },
    { title: '模板', key: 'template' },
    { title: '发送时间', key: 'sentAt' },
    { title: '状态', key: 'status' },
    { title: '错误原因', key: 'errMsg' },
    { title: 'maskID', key: 'maskId' }
  ],
  exportName: 'wx-push-log'
});

const kpi = computed(() => followWxlogKpis(crud.allRows.value));
const kpiList = computed<KpiDef[]>(() => [
  { label: '今日推送', hint: '当日触达条数', value: kpi.value.today, tone: 'primary', trend: '当日量' },
  { label: '失败条目', hint: '需排查', value: kpi.value.failed, tone: 'danger', trend: '黑名单/限流' },
  { label: '已读条目', hint: '回执命中', value: kpi.value.readRate, tone: 'success', trend: '触达成功' },
  { label: '待确认', hint: '需用户回填', value: kpi.value.pending, tone: 'warning', trend: '催办' }
]);

const fields: FieldDef[] = [
  { key: 'patientId', label: '患者ID', required: true },
  { key: 'patientName', label: '姓名', required: true },
  { key: 'template', label: '模板', required: true, span: 24 },
  { key: 'sentAt', label: '发送时间', required: true, placeholder: '2026-04-20 09:00:00' },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    required: true,
    options: ['已送达', '已读', '失败', '待确认'].map((v) => ({ label: v, value: v }))
  },
  { key: 'errMsg', label: '错误原因', span: 24 },
  { key: 'maskId', label: 'maskID' }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 160 },
  { title: '患者ID', dataIndex: 'patientId', width: 130 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '模板', dataIndex: 'template', width: 200, ellipsis: true, tooltip: true },
  { title: '发送时间', dataIndex: 'sentAt', width: 180 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: FollowWxlogRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '失败' ? 'red' : record.status === '已读' ? 'green' : record.status === '待确认' ? 'orangered' : 'arcoblue';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '错误原因', dataIndex: 'errMsg', ellipsis: true, tooltip: true },
  { title: 'maskID', dataIndex: 'maskId', width: 110 }
];
</script>

<style scoped>
.sel { width: 140px; }
</style>
