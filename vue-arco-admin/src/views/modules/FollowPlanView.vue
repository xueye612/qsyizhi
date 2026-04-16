<!--
  【1. 模块理解】个体化监护计划将复查节律/路径模板/责任人固化，驱动随访任务生成与质控（演示）。
  【2. 行业调研】字段：周期、下次复查、路径版本、状态；KPI：生效计划、将到期、加强路径覆盖、待启动。
  【3. 页面设计】路径分布 + KPI + 计划表；右侧「AI辅助建议」提示复查窗口冲突与路径切换风险（克制风格）。
  【4. 页面代码】采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader
        title="监护计划配置中心"
        desc="路径模板 · 复查节律 · 责任人绑定（演示数据，基准日 2026-04-16）"
      />

      <div class="pathBar" aria-label="路径分布">
        <div v-for="p in pathStats" :key="p.k" class="pathSeg" :style="{ flex: p.n }">
          <span class="pathLab">{{ p.k }}</span>
          <span class="pathVal">{{ p.n }}</span>
        </div>
      </div>

      <div class="queryBar">
        <a-input v-model="q" allow-clear class="q" placeholder="患者 / 计划编号" />
        <a-select v-model="st" class="sel">
          <a-option value="all">全部状态</a-option>
          <a-option value="生效中">生效中</a-option>
          <a-option value="待启动">待启动</a-option>
          <a-option value="已暂停">已暂停</a-option>
        </a-select>
      </div>

      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="生效中计划" hint="状态=生效中" :value="kpi.active" tone="success" trend="作为主驱动" trend-dir="flat" />
        <MedStatCard label="近日将复查" hint="下次≤2026-04-18 且生效" :value="kpi.dueSoon" tone="danger" trend="避免堆叠" trend-dir="flat" />
        <MedStatCard label="高危加强路径" hint="路径=高危加强且生效" :value="kpi.highPath" tone="warning" trend="关注号源" trend-dir="flat" />
        <MedStatCard label="待启动" hint="需签署/排期后启用" :value="kpi.pendingStart" tone="default" trend="启动前核对" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="计划列表" desc="点击行选中 · 右侧提示节律一致性与重叠复查风险（演示）">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="{ pageSize: 8, showTotal: true }"
          :row-key="(r: FollowPlanRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1100 }"
          @row-click="onRow"
        />
      </MedTableCard>

      <div data-testid="ai-decision" class="rightCol">
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
import { followPlanKpis, seedFollowPlans, type FollowPlanRow } from '@/mock/followPlan';

const plans = ref(seedFollowPlans());
const q = ref('');
const st = ref('all');
const sel = ref<string | null>(plans.value[0]?.id ?? null);

const kpi = computed(() => followPlanKpis(plans.value));

const pathStats = computed(() => {
  const m: Record<string, number> = {};
  for (const r of plans.value) {
    if (r.status !== '生效中') continue;
    m[r.pathway] = (m[r.pathway] || 0) + 1;
  }
  return Object.entries(m).map(([k, n]) => ({ k, n: Math.max(1, n) }));
});

const rows = computed(() => {
  let list = [...plans.value];
  const qq = q.value.trim().toLowerCase();
  if (qq) {
    list = list.filter(
      (r) =>
        r.patientName.toLowerCase().includes(qq) ||
        r.patientId.toLowerCase().includes(qq) ||
        r.id.toLowerCase().includes(qq)
    );
  }
  if (st.value !== 'all') list = list.filter((r) => r.status === st.value);
  return list;
});

const selected = computed(() => plans.value.find((p) => p.id === sel.value) ?? null);

const aiText = computed(() => {
  const r = selected.value;
  if (!r) return '';
  if (r.status === '已暂停') return `计划「${r.planName}」处于暂停，建议核对暂停原因是否影响关键复查窗口。`;
  if (r.pathway === '高危加强路径' && r.cycle.includes('周')) return '高危路径下复查频次较高，请关注门诊号源与检验 TAT，避免计划日堆叠。';
  return '当前计划与路径匹配度良好；建议在下次复查前 48h 拉取最新实验室与用药清单做预审核。';
});

const aiActs = computed(() => {
  const r = selected.value;
  if (!r) return [];
  const a: string[] = [];
  if (r.nextReview <= '2026-04-18') a.push(`下次复查 ${r.nextReview} 前预生成任务，并短信/企微双通道提醒（演示）。`);
  if (r.pathway === '合并糖尿病路径') a.push('同步内分泌共同管理目标：空腹血糖与 eGFR 联合趋势。');
  a.push('路径变更需记录版本号并通知个案管理师，避免任务仍按旧周期生成。');
  return a;
});

const aiSuggestItems = computed(() => {
  if (!selected.value) return ['请选择一条计划记录查看建议。', 'AI辅助建议仅供流程提示。'];
  return [aiText.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: FollowPlanRow) {
  sel.value = r.id;
}

function rowClass(r: FollowPlanRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns = computed<TableColumnData[]>(() => [
  { title: '计划ID', dataIndex: 'id', width: 150 },
  { title: '患者ID', dataIndex: 'patientId', width: 120 },
  { title: '姓名', dataIndex: 'patientName', width: 90 },
  { title: '计划名称', dataIndex: 'planName', ellipsis: true, tooltip: true },
  { title: '路径', dataIndex: 'pathway', width: 140, ellipsis: true, tooltip: true },
  { title: '周期', dataIndex: 'cycle', width: 120 },
  { title: '下次复查', dataIndex: 'nextReview', width: 120 },
  { title: '责任人', dataIndex: 'owner', width: 120, ellipsis: true, tooltip: true },
  {
    title: '状态',
    dataIndex: 'status',
    width: 88,
    render: ({ record }: { record: FollowPlanRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '生效中' ? 'green' : record.status === '已暂停' ? 'gray' : 'orangered';
      return h(T, { color: c }, () => record.status);
    }
  }
]);
</script>

<style scoped>
.med-page{
  box-sizing:border-box;
  padding: var(--med-page-pad);
  display:flex;
  flex-direction:column;
  gap: var(--med-gap);
  min-width:0;
}
.pathBar{
  margin-top: 12px;
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pathSeg{
  min-width: 120px;
  border: 1px solid var(--med-border);
  border-radius: var(--med-radius);
  padding: 10px 12px;
  background: var(--med-surface);
  display:flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--med-text);
}
.pathLab{
  font-size: 13px;
  color: var(--med-text-2);
}
.pathVal{
  font-size: 13px;
  font-weight: 600;
  color: var(--med-text);
}
.queryBar{
  margin-top: 12px;
  display:flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items:center;
}
.q{ width: 260px; }
.sel{ width: 140px; }
.kpi-grid{
  margin-top: 12px;
  display:grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: var(--med-gap);
  align-items: stretch;
}
.split{
  display:flex;
  gap: var(--med-gap);
  align-items: stretch;
  min-width:0;
}
.rightCol{
  width: 360px;
  flex-shrink:0;
  display:flex;
}
@media (max-width: 1100px){
  .split{ flex-direction: column; }
  .rightCol{ width: 100%; }
  .kpi-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
  .q{ width: 100%; }
}
:deep(.row-selected .arco-table-td){
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>

