<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="供体信息" desc="供体档案 · 血型 / HLA · 审核状态" />
      <div class="queryBar">
        <div class="qItem">
          <div class="qlabel">搜索</div>
          <a-input v-model="q" allow-clear class="q" placeholder="编号 / HLA 片段" />
        </div>
        <div class="qItem">
          <div class="qlabel">来源</div>
          <a-select v-model="source" class="sel">
            <a-option value="all">全部</a-option>
            <a-option value="DCD">DCD</a-option>
            <a-option value="活体">活体</a-option>
          </a-select>
        </div>
        <div class="qItem">
          <div class="qlabel">状态</div>
          <a-select v-model="status" class="sel">
            <a-option value="all">全部</a-option>
            <a-option value="待审">待审</a-option>
            <a-option value="已通过">已通过</a-option>
            <a-option value="已拒绝">已拒绝</a-option>
          </a-select>
        </div>
      </div>
      <div class="kpi-grid">
        <MedStatCard label="供体数" hint="当前筛选结果" :value="kpi.total" tone="primary" trend="列表口径" trend-dir="flat" />
        <MedStatCard label="待审" hint="需流程推进" :value="kpi.pending" tone="warning" trend="优先补齐材料" trend-dir="flat" />
        <MedStatCard label="已通过" hint="可关联受体" :value="kpi.passed" tone="success" trend="档案闭环" trend-dir="flat" />
        <MedStatCard label="已拒绝" hint="需归档原因" :value="kpi.rejected" tone="danger" trend="留痕可审计" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="供体列表" desc="点击行选中 · 右侧查看摘要与审核要点">
        <a-table
          :data="rows"
          :columns="columns"
          :pagination="{ pageSize: 10, showTotal: true }"
          :row-key="(r: any) => r.id"
          :row-class="rowClass"
          :scroll="{ x: 900 }"
          @row-click="onRowClick"
        />
      </MedTableCard>

      <div class="rightCol">
        <template v-if="selected">
          <DonorCard
            :kind="selected.source"
            :blood="`血型${selected.blood}`"
            :hla="selected.hla"
            :cmv="selected.cmv"
            :age="selected.age"
            :note="selected.note"
            :donor-text="donorSummaryText(selected)"
          />
        </template>
        <MedPageSection v-else title="供体摘要" desc="—">
          <div class="empty">请从左侧列表选择一个供体，查看摘要与审核要点。</div>
        </MedPageSection>

        <MedAiSuggest :items="aiSuggestItems" />

        <MedPageSection title="审核摘要" desc="结构化要点（模拟）">
          <div v-if="selected" class="lines">
            <div class="line"><b>编号</b><span class="mono">{{ selected.code }}</span></div>
            <div class="line"><b>状态</b>{{ selected.status }}</div>
            <div class="line"><b>最近更新</b>{{ fmt(selected.updatedAt) }}</div>
            <div class="line"><b>建议</b>{{ auditHint }}</div>
          </div>
          <div v-else class="empty">—</div>
        </MedPageSection>

        <MedPageSection title="操作" desc="流程占位 · 可对接真实工作流">
          <div class="btns">
            <a-button type="primary" class="btn-primary" :disabled="!selected">提交审核（占位）</a-button>
            <a-button :disabled="!selected">导出摘要（占位）</a-button>
          </div>
        </MedPageSection>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent, watch } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import DonorCard from '@/components/DonorCard.vue';
import MedPageHeader from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import { donorSummaryText, seedDonors, type Donor } from '@/mock/donors';

const donors = ref<Donor[]>(seedDonors());
const q = ref('');
const source = ref<'all' | 'DCD' | '活体'>('all');
const status = ref<'all' | Donor['status']>('all');
const selectedId = ref<string | null>(donors.value[0]?.id ?? null);

const selected = computed(() => donors.value.find((d) => d.id === selectedId.value) ?? null);

const rows = computed(() => {
  let list = [...donors.value];
  const qq = q.value.trim().toLowerCase();
  if (qq) {
    list = list.filter((d) => d.code.toLowerCase().includes(qq) || d.hla.toLowerCase().includes(qq));
  }
  if (source.value !== 'all') list = list.filter((d) => d.source === source.value);
  if (status.value !== 'all') list = list.filter((d) => d.status === status.value);
  return list;
});

const kpi = computed(() => {
  const list = rows.value;
  return {
    total: list.length,
    pending: list.filter((d) => d.status === '待审').length,
    passed: list.filter((d) => d.status === '已通过').length,
    rejected: list.filter((d) => d.status === '已拒绝').length
  };
});

const auditHint = computed(() => {
  const d = selected.value;
  if (!d) return '—';
  if (d.status === '待审') return '补齐检验与伦理材料，关注 CMV 与感染指标。';
  if (d.status === '已拒绝') return '记录拒绝原因，归档供体档案。';
  return '档案齐全，可关联受体与手术排期。';
});

const aiSuggestItems = computed(() => {
  if (!selected.value) return ['请从左侧选择供体。', 'AI辅助建议仅供流程提示。'];
  return [
    `审核建议：${auditHint.value}`,
    '供体档案关键变更建议保留伦理与医学双轨留痕（演示）。',
    'AI辅助建议仅供提示，不替代院内流程。'
  ].slice(0, 3);
});

function fmt(iso: string) {
  return iso ? iso.slice(0, 19).replace('T', ' ') : '—';
}

function onRowClick(record: Donor) {
  selectedId.value = record.id;
}

function rowClass(record: Donor) {
  return record.id === selectedId.value ? 'row-selected' : '';
}

const columns = computed<TableColumnData[]>(() => [
  { title: '编号', dataIndex: 'code', width: 150 },
  { title: '来源', dataIndex: 'source', width: 80 },
  { title: '血型', dataIndex: 'blood', width: 70 },
  { title: '年龄', dataIndex: 'age', width: 70 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: ({ record }: any) => {
      const d = record as Donor;
      const ATag = resolveComponent('a-tag') as any;
      const color = d.status === '已通过' ? 'green' : d.status === '待审' ? 'orangered' : 'red';
      return h(ATag, { color }, () => d.status);
    }
  },
  { title: 'HLA（节选）', dataIndex: 'hla', ellipsis: true, tooltip: true },
  {
    title: '最近更新',
    dataIndex: 'updatedAt',
    width: 170,
    render: ({ record }: any) => fmt((record as Donor).updatedAt)
  }
]);

watch(rows, () => {
  const ids = new Set(rows.value.map((r) => r.id));
  if (selectedId.value && !ids.has(selectedId.value)) selectedId.value = rows.value[0]?.id ?? null;
});
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
.queryBar {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.qItem {
  display: flex;
  align-items: center;
  gap: 10px;
}
.qlabel {
  font-size: 13px;
  color: var(--med-muted);
}
.kpi-grid {
  margin-top: 12px;
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
.rightCol {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--med-gap);
}
.lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.line {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 10px;
  font-size: var(--med-fz-body);
  line-height: 1.6;
  color: var(--med-text);
}
.line b {
  font-weight: 500;
  color: var(--med-text-2);
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.empty {
  font-size: var(--med-fz-body);
  color: var(--med-muted);
  line-height: 1.6;
}
.btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn-primary {
  background: var(--med-primary);
  border-color: var(--med-primary);
}
@media (max-width: 1100px) {
  .split {
    flex-direction: column;
  }
  .rightCol {
    width: 100%;
  }
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .q {
    width: 100%;
  }
}
:deep(.row-selected .arco-table-td) {
  background: rgba(22, 119, 255, 0.06) !important;
}
</style>
