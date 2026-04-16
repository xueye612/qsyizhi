<!--
  ①模块理解：用户管理维护登录名、科室、角色与账号状态。
  ②行业调研：显示名、科室、角色、正常/锁定/待激活。
  ③页面设计：用户表 + 右侧提示账号安全与最小权限。
  ④页面代码：采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="用户管理" desc="科室 · 角色 · 状态（演示）" />
      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="正常" hint="可用账号" :value="kpi.ok" tone="success" trend="基线" trend-dir="flat" />
        <MedStatCard label="锁定" hint="需核查" :value="kpi.locked" tone="danger" trend="安全" trend-dir="flat" />
        <MedStatCard label="待激活" hint="待开通" :value="kpi.pending" tone="default" trend="开通" trend-dir="flat" />
        <MedStatCard label="管理员类" hint="高权限" :value="kpi.adminish" tone="warning" trend="MFA 建议" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="账号列表" desc="点击行选中 · 右侧为账号风险与最小权限提示">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: SysUserRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1000 }"
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
import { computed, h, ref, resolveComponent } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import MedPageHeader from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import { seedSysUsers, sysUserKpis, type SysUserRow } from '@/mock/sysMocks';

const data = ref(seedSysUsers());
const sel = ref<string | null>(data.value[0]?.id ?? null);
const kpi = computed(() => sysUserKpis(data.value));
const rows = computed(() => data.value);
const cur = computed(() => data.value.find((r) => r.id === sel.value) ?? null);

const aiTxt = computed(() => {
  const r = cur.value;
  if (!r) return '';
  return `用户 ${r.displayName}（${r.login}）科室 ${r.dept}，角色「${r.role}」，状态「${r.status}」。`;
});

const aiActs = computed(() => {
  const r = cur.value;
  if (!r) return [];
  return [
    r.status === '锁定' ? '锁定账号：核查是否暴力破解或离职未交接。' : '正常：建议90 天强制定期改密（策略占位）。',
    r.role.includes('管理') ? '高权限：启用 MFA 与操作审计加强。' : '按岗位分配数据域，避免泛化授权。',
    '禁用共享账号与弱口令。'
  ];
});

const aiSuggestItems = computed(() => {
  if (!cur.value) return ['请先从左侧选择一行用户。', 'AI辅助建议仅供流程提示。'];
  return [aiTxt.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: SysUserRow) {
  sel.value = r.id;
}

function rowClass(r: SysUserRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns: TableColumnData[] = [
  { title: 'ID', dataIndex: 'id', width: 72 },
  { title: '登录名', dataIndex: 'login', width: 120 },
  { title: '姓名', dataIndex: 'displayName', width: 88 },
  { title: '科室', dataIndex: 'dept', width: 120 },
  { title: '角色', dataIndex: 'role', width: 120 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 88,
    render: ({ record }: { record: SysUserRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c =
        record.status === '正常' ? 'green' : record.status === '锁定' ? 'red' : 'orangered';
      return h(T, { color: c }, () => record.status);
    }
  }
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
