<!-- 系统用户 -->
<template>
  <MedCrudPage
    title="系统用户"
    desc="登录账号 · 部门 · 角色 · 状态"
    :kpis="kpis" :columns="columns" :fields="fields" :crud="crud"
    table-title="用户列表" search-placeholder="账号 / 姓名 / 部门"
    create-text="新建用户" :scroll-x="1100" can-view
  >
    <template #filters>
      <a-select v-model="filterStatus" class="sel">
        <a-option value="all">全部状态</a-option>
        <a-option value="正常">正常</a-option>
        <a-option value="锁定">锁定</a-option>
        <a-option value="待激活">待激活</a-option>
      </a-select>
    </template>
  </MedCrudPage>
</template>
<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { seedSysUsers, sysUserKpis, type SysUserRow } from '@/mock/sysMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';
const store = createDemoStore<SysUserRow>('sys.users', seedSysUsers);
const filterStatus = ref('all');
const crud = useCrudList<SysUserRow>({
  store, idPrefix: 'U', searchFields: ['id', 'login', 'displayName', 'dept', 'role'],
  customFilter: (r) => filterStatus.value === 'all' || r.status === filterStatus.value,
  csvColumns: [
    { title: '编号', key: 'id' }, { title: '账号', key: 'login' }, { title: '姓名', key: 'displayName' },
    { title: '部门', key: 'dept' }, { title: '角色', key: 'role' }, { title: '状态', key: 'status' }
  ],
  exportName: 'sys-users'
});
const k = computed(() => sysUserKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '正常', value: k.value.ok, tone: 'success', trend: '可用' },
  { label: '锁定', value: k.value.locked, tone: 'danger', trend: '需解锁' },
  { label: '待激活', value: k.value.pending, tone: 'warning', trend: '邀请中' },
  { label: '管理类账号', value: k.value.adminish, tone: 'primary', trend: '高权限' }
]);
const fields: FieldDef[] = [
  { key: 'login', label: '账号', required: true, placeholder: 'wang.hao' },
  { key: 'displayName', label: '姓名', required: true },
  { key: 'dept', label: '部门' },
  { key: 'role', label: '角色' },
  { key: 'status', label: '状态', type: 'select', options: ['正常', '锁定', '待激活'].map((v) => ({ label: v, value: v })) }
];
const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 80 },
  { title: '账号', dataIndex: 'login', width: 150 },
  { title: '姓名', dataIndex: 'displayName', width: 100 },
  { title: '部门', dataIndex: 'dept', width: 130 },
  { title: '角色', dataIndex: 'role', width: 130 },
  { title: '状态', dataIndex: 'status', width: 100, render: ({ record }: { record: SysUserRow }) => {
    const T = resolveComponent('a-tag') as any;
    const c = record.status === '正常' ? 'green' : record.status === '锁定' ? 'red' : 'orangered';
    return h(T, { color: c }, () => record.status);
  } }
];
</script>
<style scoped>.sel{width:130px}</style>
