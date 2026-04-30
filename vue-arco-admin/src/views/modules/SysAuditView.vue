<!-- 审计日志 -->
<template>
  <MedCrudPage
    title="审计日志"
    desc="操作流水 · 敏感动作筛选 · 留痕可追溯"
    :kpis="kpis" :columns="columns" :fields="fields" :crud="crud"
    table-title="日志列表" search-placeholder="操作员 / 动作 / 目标"
    create-text="补录条目" :scroll-x="1100" can-view
  />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { seedSysAudit, sysAuditKpis, type SysAuditRow } from '@/mock/sysMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';
const store = createDemoStore<SysAuditRow>('sys.audit', seedSysAudit);
const crud = useCrudList<SysAuditRow>({
  store, idPrefix: 'A', searchFields: ['id', 'operator', 'action', 'target'],
  csvColumns: [
    { title: '编号', key: 'id' }, { title: '操作员', key: 'operator' },
    { title: '动作', key: 'action' }, { title: '目标', key: 'target' }, { title: '时间', key: 'at' }
  ],
  exportName: 'sys-audit'
});
const k = computed(() => sysAuditKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '今日事件', value: k.value.today, tone: 'primary', trend: '当日量' },
  { label: '敏感操作', value: k.value.sensitive, tone: 'danger', trend: '权限/导出' },
  { label: '日志总数', value: k.value.events, tone: 'success', trend: '历史' },
  { label: '总数', value: k.value.total, tone: 'default', trend: '台账' }
]);
const fields: FieldDef[] = [
  { key: 'operator', label: '操作员', required: true },
  { key: 'action', label: '动作', required: true, span: 24 },
  { key: 'target', label: '目标', span: 24 },
  { key: 'at', label: '时间', placeholder: '2026-04-20 09:00' }
];
const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 80 },
  { title: '操作员', dataIndex: 'operator', width: 130 },
  { title: '动作', dataIndex: 'action', width: 200, ellipsis: true, tooltip: true },
  { title: '目标', dataIndex: 'target', ellipsis: true, tooltip: true },
  { title: '时间', dataIndex: 'at', width: 160 }
];
</script>
