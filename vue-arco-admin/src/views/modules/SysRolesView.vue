<!-- 系统角色 -->
<template>
  <MedCrudPage
    title="角色管理"
    desc="菜单节点 · 数据范围 · 角色定义"
    :kpis="kpis" :columns="columns" :fields="fields" :crud="crud"
    table-title="角色列表" search-placeholder="角色名 / 编号"
    create-text="新建角色" :scroll-x="1000" can-view
  />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { seedSysRoles, sysRoleKpis, type SysRoleRow } from '@/mock/sysMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';
const store = createDemoStore<SysRoleRow>('sys.roles', seedSysRoles);
const crud = useCrudList<SysRoleRow>({
  store, idPrefix: 'R', searchFields: ['id', 'name'],
  csvColumns: [
    { title: '编号', key: 'id' }, { title: '角色名', key: 'name' },
    { title: '菜单节点', key: 'menuNodes' }, { title: '数据范围', key: 'dataScopes' }, { title: '更新时间', key: 'updatedAt' }
  ],
  exportName: 'sys-roles'
});
const k = computed(() => sysRoleKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '角色数', value: k.value.roles, tone: 'primary', trend: '权限模型' },
  { label: '菜单节点合计', value: k.value.menus, tone: 'success', trend: 'Σ menuNodes' },
  { label: '宽权限角色(≥35)', value: k.value.wide, tone: 'warning', trend: '注意最小化' },
  { label: '总数', value: k.value.total, tone: 'default', trend: '台账' }
]);
const fields: FieldDef[] = [
  { key: 'name', label: '角色名', required: true, span: 24 },
  { key: 'menuNodes', label: '菜单节点数', type: 'number', min: 0, max: 200 },
  { key: 'dataScopes', label: '数据范围数', type: 'number', min: 0, max: 20 },
  { key: 'updatedAt', label: '更新时间', type: 'date' }
];
const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 80 },
  { title: '角色名', dataIndex: 'name', width: 200 },
  { title: '菜单节点', dataIndex: 'menuNodes', width: 110 },
  { title: '数据范围', dataIndex: 'dataScopes', width: 110 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 130 }
];
</script>
