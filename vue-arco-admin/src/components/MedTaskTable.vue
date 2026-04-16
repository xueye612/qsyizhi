<template>
  <a-table
    data-testid="biz-table"
    :data="data"
    :columns="columns"
    :pagination="false"
    :row-key="(r: WorkbenchTask) => r.id"
    :row-class="rowClass"
    :scroll="{ x: 1020 }"
    @row-click="(r: WorkbenchTask) => emit('rowClick', r)"
  />
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import type { WorkbenchPatient, WorkbenchTask } from '@/mock/workbenchData';
import { patientLabTags, taskOverdue } from '@/mock/workbenchData';
import { riskLevelOf } from '@/mock/patients';
import RiskTag from '@/components/RiskTag.vue';

const props = defineProps<{
  data: WorkbenchTask[];
  patientMap: Map<string, WorkbenchPatient>;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  (e: 'rowClick', row: WorkbenchTask): void;
}>();

function patientName(pid: string) {
  return props.patientMap.get(pid)?.name ?? '—';
}

function riskOf(pid: string) {
  const p = props.patientMap.get(pid);
  return p ? riskLevelOf(p) : 'low';
}

function kindLabel(k: WorkbenchTask['kind']) {
  return k === 'follow' ? '随访' : k === 'lab' ? '复查' : '用药';
}

const columns = computed<TableColumnData[]>(() => [
  {
    title: '分级',
    width: 108,
    render: ({ record }: { record: WorkbenchTask }) => {
      const risk = riskOf(record.patientId);
      const overdue = taskOverdue(record);
      const hiU = record.urgency === 'high';
      const children: any[] = [h(RiskTag, { level: risk, compact: true })];
      if (hiU) {
        children.push(
          h(
            'span',
            { class: 'wb-meta wb-meta--urgent', title: '高紧急' },
            '急'
          )
        );
      }
      if (overdue) {
        children.push(
          h(
            'span',
            { class: 'wb-meta wb-meta--overdue', title: '已逾期' },
            '逾'
          )
        );
      }
      return h('div', { class: 'wb-grade' }, children);
    }
  },
  {
    title: '患者',
    width: 100,
    ellipsis: true,
    tooltip: true,
    render: ({ record }: { record: WorkbenchTask }) =>
      h('div', { class: 'wb-patient-cell' }, [
        h('div', { class: 'wb-pname-only' }, patientName(record.patientId))
      ])
  },
  {
    title: '待办',
    minWidth: 220,
    ellipsis: true,
    tooltip: true,
    render: ({ record }: { record: WorkbenchTask }) => {
      const tip = `${kindLabel(record.kind)} · ${record.title}\n${record.desc}`;
      return h('div', { class: 'wb-todo-cell', title: tip }, [
        h('div', { class: 'wb-todo-head' }, [
          h('span', { class: 'wb-kind' }, kindLabel(record.kind)),
          h('span', { class: 'wb-ttl' }, record.title)
        ]),
        h('div', { class: 'wb-desc' }, record.desc)
      ]);
    }
  },
  {
    title: '线索',
    width: 148,
    render: ({ record }: { record: WorkbenchTask }) => {
      const p = props.patientMap.get(record.patientId);
      const labs = p ? patientLabTags(p) : [];
      const chips: any[] = [];
      for (const t of labs) {
        chips.push(h('span', { class: 'wb-clue wb-clue--lab' }, t));
      }
      chips.push(h('span', { class: 'wb-clue wb-clue--ai' }, record.aiTag));
      return h('div', { class: 'wb-clues' }, chips.length ? chips : [h('span', { class: 'wb-dash' }, '—')]);
    }
  },
  {
    title: '到期',
    dataIndex: 'due',
    width: 76,
    align: 'left',
    render: ({ record }: { record: WorkbenchTask }) =>
      h('span', { class: { 'wb-due': true, 'wb-due--over': record.due === '已逾期' } }, record.due)
  },
  {
    title: '状态',
    dataIndex: 'state',
    width: 80,
    align: 'center',
    render: ({ record }: { record: WorkbenchTask }) => {
      const todo = record.state === 'todo';
      return h(
        'span',
        { class: todo ? 'wb-state wb-state--todo' : 'wb-state wb-state--done' },
        todo ? '待办' : '完成'
      );
    }
  }
]);

function rowClass(r: WorkbenchTask) {
  const risk = riskOf(r.patientId);
  const sel = r.id === props.selectedId ? 'row-selected' : '';
  return [sel, `row-risk-${risk}`].filter(Boolean).join(' ');
}
</script>

<style scoped>
.wb-grade {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 0;
}
:deep(.wb-meta) {
  font-size: 11px;
  font-weight: 600;
  padding: 0 5px;
  line-height: 18px;
  border-radius: 4px;
  border: 1px solid var(--med-border, #e5e6eb);
  color: var(--med-text-2, #4e5969);
  background: #f7f8fa;
}
:deep(.wb-meta--urgent) {
  border-color: rgba(255, 125, 0, 0.45);
  color: #d25f00;
  background: rgba(255, 125, 0, 0.06);
}
:deep(.wb-meta--overdue) {
  border-color: rgba(245, 63, 63, 0.45);
  color: #cb2634;
  background: rgba(245, 63, 63, 0.06);
}

/* 多行单元格时顶对齐，避免「到期」等与正文错位 */
:deep(.arco-table-td) {
  vertical-align: top;
}

.wb-patient-cell {
  min-width: 0;
  padding: 4px 0;
}
.wb-pname-only {
  font-size: 13px;
  font-weight: 600;
  color: var(--med-text, #1d2129);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wb-todo-cell {
  min-width: 0;
  padding: 4px 0;
}
.wb-todo-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.wb-kind {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--med-muted, #86909c);
}
.wb-ttl {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--med-text, #1d2129);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wb-desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--med-text-2, #4e5969);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wb-clues {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 0;
}
.wb-clue {
  font-size: 11px;
  line-height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  border: 1px solid var(--med-border, #e5e6eb);
  color: var(--med-text-2, #4e5969);
  background: #fafafa;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wb-clue--lab {
  border-color: rgba(245, 63, 63, 0.22);
  color: #c02929;
  background: rgba(245, 63, 63, 0.04);
}
.wb-clue--ai {
  border-color: rgba(22, 93, 255, 0.22);
  color: #165dff;
  background: rgba(22, 93, 255, 0.04);
}
.wb-dash {
  font-size: 12px;
  color: var(--med-muted, #86909c);
}

.wb-due {
  display: inline-block;
  padding: 4px 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--med-text, #1d2129);
}
.wb-due--over {
  color: #cb2634;
  font-weight: 600;
}

.wb-state {
  display: inline-block;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--med-border, #e5e6eb);
}
.wb-state--todo {
  color: #d25f00;
  border-color: rgba(255, 125, 0, 0.35);
  background: rgba(255, 125, 0, 0.06);
}
.wb-state--done {
  color: #237804;
  border-color: rgba(0, 180, 42, 0.28);
  background: rgba(0, 180, 42, 0.06);
}

:deep(.row-selected .arco-table-td) {
  background: rgba(22, 93, 255, 0.08) !important;
}
:deep(tr.row-risk-high td:first-child) {
  box-shadow: inset 3px 0 0 #f53f3f;
}
:deep(tr.row-risk-mid td:first-child) {
  box-shadow: inset 3px 0 0 #ff7d00;
}
:deep(tr.row-risk-low td:first-child) {
  box-shadow: inset 3px 0 0 #00b42a;
}
</style>
