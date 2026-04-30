<!-- 参数配置 -->
<template>
  <MedCrudPage
    title="参数配置"
    desc="系统参数键值对 · 模块范围 · 更新留痕"
    :kpis="kpis" :columns="columns" :fields="fields" :crud="crud"
    table-title="参数列表" search-placeholder="键名 / 范围 / 编号"
    create-text="新建参数" :scroll-x="1100" can-view
  />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedCrudPage, { type KpiDef } from '@/components/MedCrudPage.vue';
import type { FieldDef } from '@/components/MedRecordDrawer.vue';
import { seedSysCfg, sysCfgKpis, type SysCfgRow } from '@/mock/sysMocks';
import { createDemoStore } from '@/utils/demoStore';
import { useCrudList } from '@/utils/useCrudList';
const store = createDemoStore<SysCfgRow>('sys.cfg', seedSysCfg);
const crud = useCrudList<SysCfgRow>({
  store, idPrefix: 'CFG', searchFields: ['id', 'paramKey', 'scope'],
  csvColumns: [
    { title: '编号', key: 'id' }, { title: '键名', key: 'paramKey' },
    { title: '取值', key: 'paramValue' }, { title: '范围', key: 'scope' }, { title: '更新时间', key: 'updatedAt' }
  ],
  exportName: 'sys-cfg'
});
const k = computed(() => sysCfgKpis(crud.allRows.value));
const kpis = computed<KpiDef[]>(() => [
  { label: '参数总数', value: k.value.params, tone: 'primary', trend: '配置项' },
  { label: 'AI 类参数', value: k.value.ai, tone: 'default', trend: '安全/策略' },
  { label: '布尔型', value: k.value.boolish, tone: 'success', trend: '开关项' },
  { label: '总数', value: k.value.total, tone: 'default', trend: '台账' }
]);
const fields: FieldDef[] = [
  { key: 'paramKey', label: '键名', required: true, placeholder: 'follow.overdue.days', span: 24 },
  { key: 'paramValue', label: '取值', required: true, span: 24 },
  { key: 'scope', label: '范围', placeholder: '随访 / AI / 导出 / 安全' },
  { key: 'updatedAt', label: '更新时间', type: 'date' }
];
const columns: TableColumnData[] = [
  { title: '编号', dataIndex: 'id', width: 100 },
  { title: '键名', dataIndex: 'paramKey', width: 220, ellipsis: true, tooltip: true },
  { title: '取值', dataIndex: 'paramValue', width: 160, ellipsis: true, tooltip: true },
  { title: '范围', dataIndex: 'scope', width: 110 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 130 }
];
</script>
