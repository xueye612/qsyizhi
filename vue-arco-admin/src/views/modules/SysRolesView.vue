<!--
  ①模块理解：角色权限配置汇总菜单节点数与数据域范围，支撑 RBAC。
  ②行业调研：角色名、菜单授权数量、数据范围数量、更新时间。
  ③页面设计：角色表 + 右侧提示权限膨胀风险。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="角色权限" desc="菜单节点 · 数据范围（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="菜单节点合计" hint="授权汇总" :value="kpi.menus" tone="default" trend="膨胀监控" trend-dir="flat" />
        <MedStatCard label="宽角色(≥35)" hint="需收敛" :value="kpi.wide" tone="danger" trend="拆分建议" trend-dir="flat" />
        <MedStatCard label="角色数" hint="目录" :value="kpi.roles" tone="primary" trend="RBAC" trend-dir="flat" />
        <MedStatCard label="条目" hint="全量" :value="kpi.total" tone="success" trend="列表" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="角色列表" desc="点击行选中 · 右侧为权限收敛与复核提示">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: SysRoleRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 920 }"
          @row-click="onRow"
        />
      </MedTableCard>

      <div data-testid="ai-decision" class="ai-col">
        <MedAiSuggest :items="aiSuggestItems" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedPageHeader from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import { seedSysRoles, sysRoleKpis, type SysRoleRow } from '@/mock/sysMocks';

const data = ref(seedSysRoles());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => sysRoleKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `角色「${r.name}」授权菜单节点 ${r.menuNodes}，数据范围 ${r.dataScopes}，更新 ${r.updatedAt}。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.menuNodes >= 35 ? '宽角色：建议拆分为业务子角色并按岗组合。' : '范围适中：仍需定期复审离职人员绑定。',
    '数据域>2 时检查是否违反最小够用。',
    '变更需双人复核并写审计日志。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一行角色。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: SysRoleRow) {
  sel.value = r.id;
}

function rowClass(r: SysRoleRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 72 },
  { title: '角色', dataIndex: 'name', width: 120 },
  { title: '菜单节点', dataIndex: 'menuNodes', width: 100 },
  { title: '数据范围', dataIndex: 'dataScopes', width: 100 },
  { title: '更新', dataIndex: 'updatedAt', width: 110 }
];
</script>

<style scoped>
.med-page {
  box-sizing: border-box;
  padding: var(--med-page-pad);
  display: flex;
  flex-direction: column;
  gap: var(--med-gap);
  min-width: 0;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--med-gap);
  align-items: stretch;
}
.split {
  display: flex;
  gap: var(--med-gap);
  align-items: stretch;
  min-width: 0;
}
.ai-col {
  width: 360px;
  flex-shrink: 0;
  display: flex;
}
@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .split {
    flex-direction: column;
  }
  .ai-col {
    width: 100%;
  }
}
:deep(.row-selected .arco-table-td) {
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>
