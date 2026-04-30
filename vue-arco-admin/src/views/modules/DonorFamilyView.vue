<!-- 供体家属信息 -->
<template>
  <MedCrudPage
    title="供体家属信息"
    desc="联系人 · 关系 · 知情同意状态"
    :kpis="kpis"
    :columns="columns"
    :fields="fields"
    :crud="crud"
    table-title="家属台账"
    search-placeholder="供体编码 / 姓名 / 关系"
    create-text="新增家属"
    :scroll-x="1100"
    can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="完整">完整</a-option>
        <a-option value="待补">待补</a-option>
        <a-option value="过期">过期</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { donorFamilyKpis, seedDonorFamily, type DonorFamilyRow } from '@/mock/donorOps';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';

const store = createDemoStore<DonorFamilyRow>('donor.family', seedDonorFamily);
const filterStatus = ref('all');

const crud = useCrudList<DonorFamilyRow>({
  store,
  idPrefix: 'DF',
  searchFields: ['id', 'donorCode', 'contactName', 'relation'],
  customFilter: (r) => filterStatus.value === 'all' || r.status === filterStatus.value,
  csvColumns: [
    { title: '编号', key: 'id' },
    { title: '供体编码', key: 'donorCode' },
    { title: '联系人', key: 'contactName' },
    { title: '关系', key: 'relation' },
    { title: '电话', key: 'phone' },
    { title: '知情同意编号', key: 'consentDoc' },
    { title: '状态', key: 'status' }
  ],
  exportName: 'donor-family'
});

const k = computed(() => donorFamilyKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '资料完整', value: k.value.ok, tone: 'success', trend: '可用' },
  { label: '待补充', value: k.value.need, tone: 'warning', trend: '催办' },
  { label: '已过期', value: k.value.expired, tone: 'danger', trend: '需重签' },
  { label: '总联系人', value: k.value.total, tone: 'primary', trend: '台账规模' }
]);

const fields: FieldDef[] = [
  { key: 'donorCode', label: '供体编码', required: true },
  { key: 'contactName', label: '联系人', required: true },
  { key: 'relation', label: '关系', required: true, placeholder: '配偶 / 子女 / 兄弟' },
  { key: 'phone', label: '电话', placeholder: '139****8832' },
  { key: 'consentDoc', label: '知情同意编号' },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: ['完整', '待补', '过期'].map((v) => ({ label: v, value: v }))
  }
];

const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 100 },
  { title: '供体编码', dataIndex: 'donorCode', width: 150 },
  { title: '联系人', dataIndex: 'contactName', width: 120 },
  { title: '关系', dataIndex: 'relation', width: 100 },
  { title: '电话', dataIndex: 'phone', width: 150 },
  { title: '知情同意编号', dataIndex: 'consentDoc', width: 160 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: { record: DonorFamilyRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '完整' ? 'green' : record.status === '过期' ? 'red' : 'orangered';
      return h(T, { color: c }, () => record.status);
    }
  }
];
</script>
<style scoped>.sel{width:130px}</style>
