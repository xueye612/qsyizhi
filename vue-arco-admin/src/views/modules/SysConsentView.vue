<!-- 知情同意 -->
<template>
  <MedCrudPage
    title="知情同意管理"
    desc="模板版本 · 签署数 · 状态"
    :kpis="kpis" :columns="columns" :fields="fields" :crud="crud"
    table-title="模板列表" search-placeholder="标题 / 版本"
    create-text="新建模板" :scroll-x="1000" can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="生效">生效</a-option>
        <a-option value="草稿">草稿</a-option>
        <a-option value="废止">废止</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>
<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { seedSysConsent, sysConsentKpis, type SysConsentRow } from '@/mock/sysMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';
const store = createDemoStore<SysConsentRow>('sys.consent', seedSysConsent);
const filterStatus = ref('all');
const crud = useCrudList<SysConsentRow>({
  store, idPrefix: 'C', searchFields: ['id', 'title', 'version'],
  customFilter: (r) => filterStatus.value === 'all' || r.status === filterStatus.value,
  csvColumns: [
    { title: '编号', key: 'id' }, { title: '标题', key: 'title' },
    { title: '版本', key: 'version' }, { title: '签署数', key: 'signedCount' }, { title: '状态', key: 'status' }
  ],
  exportName: 'sys-consent'
});
const k = computed(() => sysConsentKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '生效模板', value: k.value.active, tone: 'success', trend: '当前可用' },
  { label: '草稿', value: k.value.draft, tone: 'warning', trend: '编辑中' },
  { label: '累计签署', value: k.value.signed.toLocaleString(), tone: 'primary', trend: '历史签署' },
  { label: '总模板', value: k.value.total, tone: 'default', trend: '版本数' }
]);
const fields: FieldDef[] = [
  { key: 'title', label: '标题', required: true, span: 24 },
  { key: 'version', label: '版本', placeholder: 'v2026.1' },
  { key: 'signedCount', label: '签署数', type: 'number', min: 0 },
  { key: 'status', label: '状态', type: 'select', options: ['生效', '草稿', '废止'].map((v) => ({ label: v, value: v })) }
];
const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 80 },
  { title: '标题', dataIndex: 'title', width: 240 },
  { title: '版本', dataIndex: 'version', width: 120 },
  { title: '签署数', dataIndex: 'signedCount', width: 110 },
  { title: '状态', dataIndex: 'status', width: 100, render: ({ record }: { record: SysConsentRow }) => {
    const T = resolveComponent('a-tag') as any;
    const c = record.status === '生效' ? 'green' : record.status === '草稿' ? 'orangered' : 'gray';
    return h(T, { color: c }, () => record.status);
  } }
];
</script>
<style scoped>.sel{width:130px}</style>
