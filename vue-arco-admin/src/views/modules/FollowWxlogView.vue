<!--
  【1. 模块理解】企微/服务通知推送日志用于审计触达、失败重试与患者体验管理，满足随访闭环留痕（演示）。
  【2. 行业调研】字段：模板ID/名称、发送时间、掩码ID、送达/已读、失败原因；KPI：日推送量、失败率、待确认回执。
  【3. 页面设计】日志型台账 + KPI；右侧「AI辅助建议」提示触达策略与合规边界（克制风格）。
  【4. 页面代码】采用全站轻医疗组件（Med*）统一样式。
-->
<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="企业微信推送记录" desc="模板消息 · 送达状态 · 失败审计（演示数据）" />

      <div class="queryBar">
        <a-input v-model="q" allow-clear class="q" placeholder="患者 / 模板 / 日志编号" />
        <a-select v-model="st" class="sel">
          <a-option value="all">全部状态</a-option>
          <a-option value="已送达">已送达</a-option>
          <a-option value="失败">失败</a-option>
          <a-option value="已读">已读</a-option>
          <a-option value="待确认">待确认</a-option>
        </a-select>
      </div>

      <div data-testid="kpi-region" class="kpi-grid">
        <MedStatCard label="今日推送" hint="发送日期含当日" :value="kpi.today" tone="primary" trend="关注失败率" trend-dir="flat" />
        <MedStatCard label="失败条数" hint="需重试或人工补触达" :value="kpi.failed" tone="danger" trend="备用通道" trend-dir="flat" />
        <MedStatCard label="已读条数" hint="回执维度（演示）" :value="kpi.readRate" tone="success" trend="评估标题长度" trend-dir="flat" />
        <MedStatCard label="待用户确认" hint="需点击确认类" :value="kpi.pending" tone="default" trend="控制频次" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="推送日志" desc="点击行选中 · 右侧提示失败原因与触达策略（演示）">
        <a-table
          data-testid="biz-table"
          :data="rows"
          :columns="columns"
          :pagination="{ pageSize: 8, showTotal: true }"
          :row-key="(r: FollowWxlogRow) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 1020 }"
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
import { followWxlogKpis, seedFollowWxlog, type FollowWxlogRow } from '@/mock/followWxlog';

const logs = ref(seedFollowWxlog());
const q = ref('');
const st = ref('all');
const sel = ref<string | null>(logs.value[0]?.id ?? null);

const kpi = computed(() => followWxlogKpis(logs.value));

const rows = computed(() => {
  let list = [...logs.value];
  const qq = q.value.trim().toLowerCase();
  if (qq) {
    list = list.filter(
      (r) =>
        r.patientName.toLowerCase().includes(qq) ||
        r.template.toLowerCase().includes(qq) ||
        r.id.toLowerCase().includes(qq)
    );
  }
  if (st.value !== 'all') list = list.filter((r) => r.status === st.value);
  return list;
});

const selected = computed(() => logs.value.find((r) => r.id === sel.value) ?? null);

const aiText = computed(() => {
  const r = selected.value;
  if (!r) return '';
  if (r.status === '失败') return `发送失败（${r.errMsg || '未知'}）：建议启用备用通道（短信/IVR）并记录患者偏好。`;
  if (r.template.includes('问卷')) return '问卷类模板需控制频次，避免患者标记骚扰导致后续模板拒收。';
  return '送达类模板可结合打开率评估标题与摘要长度，提高关键随访动作完成率。';
});

const aiActs = computed(() => {
  const r = selected.value;
  if (!r) return [];
  const a: string[] = [];
  if (r.status === '失败') a.push('将失败日志关联到随访任务单，自动生成「人工外呼」子任务（演示）。');
  a.push('敏感内容模板建议走医务科/信息科双审（演示说明）。');
  a.push(`掩码 ID ${r.maskId} 仅用于演示脱敏，生产环境须对接统一患者主索引。`);
  return a;
});

const aiSuggestItems = computed(() => {
  if (!selected.value) return ['请选择一条推送日志查看建议。', 'AI辅助建议仅供流程提示。'];
  return [aiText.value, ...aiActs.value].slice(0, 3);
});

function onRow(r: FollowWxlogRow) {
  sel.value = r.id;
}

function rowClass(r: FollowWxlogRow) {
  return r.id === sel.value ? 'row-selected' : '';
}

const columns = computed<TableColumnData[]>(() => [
  { title: '日志编号', dataIndex: 'id', width: 140 },
  { title: '患者ID', dataIndex: 'patientId', width: 120 },
  { title: '姓名', dataIndex: 'patientName', width: 80 },
  { title: '模板', dataIndex: 'template', ellipsis: true, tooltip: true },
  { title: '发送时间', dataIndex: 'sentAt', width: 165 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 88,
    render: ({ record }: { record: FollowWxlogRow }) => {
      const T = resolveComponent('a-tag') as any;
      const c = record.status === '失败' ? 'red' : record.status === '已读' ? 'green' : record.status === '待确认' ? 'orangered' : 'arcoblue';
      return h(T, { color: c }, () => record.status);
    }
  },
  { title: '掩码ID', dataIndex: 'maskId', width: 120, ellipsis: true, tooltip: true },
  { title: '失败原因', dataIndex: 'errMsg', ellipsis: true, tooltip: true }
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

