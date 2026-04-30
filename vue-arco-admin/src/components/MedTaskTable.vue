<template>
  <a-table
    data-testid="biz-table"
    :data="data"
    :columns="columns"
    :pagination="false"
    :row-key="(r: WorkbenchTask) => r.id"
    :row-class="rowClass"
    :scroll="{ x: 1040 }"
    @row-click="(r: WorkbenchTask) => emit('rowClick', r)"
  />
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';
import type { WorkbenchPatient, WorkbenchTask } from '@/mock/workbenchData';
import { patientLabTags, taskOverdue } from '@/mock/workbenchData';
import { getLastLab, riskLevelOf } from '@/mock/patients';
import RiskTag from '@/components/RiskTag.vue';

const props = defineProps<{
  data: WorkbenchTask[];
  patientMap: Map<string, WorkbenchPatient>;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  (e: 'rowClick', row: WorkbenchTask): void;
  (e: 'quickAct', row: WorkbenchTask): void;
}>();

function patientOf(pid: string) {
  return props.patientMap.get(pid) ?? null;
}

function riskOf(pid: string) {
  const p = patientOf(pid);
  return p ? riskLevelOf(p) : 'low';
}

function kindLabel(k: WorkbenchTask['kind']) {
  return k === 'follow' ? '随访' : k === 'lab' ? '复查' : '用药';
}
function kindIcon(k: WorkbenchTask['kind']) {
  return k === 'follow' ? '☎' : k === 'lab' ? '⚗' : '☥';
}
function postOpDays(p: WorkbenchPatient | null): string | null {
  if (!p?.surgeryDate) return null;
  const d = new Date(p.surgeryDate as any);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
  return `术后 ${diff}d`;
}
function quickActText(k: WorkbenchTask['kind']) {
  return k === 'follow' ? '发随访' : k === 'lab' ? '出单' : '调量';
}

const columns = computed<TableColumnData[]>(() => [
  {
    title: '分级',
    width: 110,
    render: ({ record }: { record: WorkbenchTask }) => {
      const risk = riskOf(record.patientId);
      const overdue = taskOverdue(record);
      const hiU = record.urgency === 'high';
      const children: any[] = [h(RiskTag, { level: risk, compact: true })];
      if (hiU) {
        children.push(
          h('span', { class: 'wb-meta wb-meta--urgent', title: '高紧急' }, '急')
        );
      }
      if (overdue) {
        children.push(
          h('span', { class: 'wb-meta wb-meta--overdue', title: '已逾期' }, '逾')
        );
      }
      return h('div', { class: 'wb-grade' }, children);
    }
  },
  {
    title: '患者',
    width: 168,
    ellipsis: true,
    tooltip: true,
    render: ({ record }: { record: WorkbenchTask }) => {
      const p = patientOf(record.patientId);
      const name = p?.name ?? '—';
      const initial = name.slice(-1) || name.charAt(0);
      const risk = riskOf(record.patientId);
      const meta: string[] = [];
      if (p?.sex) meta.push(p.sex);
      if (p?.age != null) meta.push(`${p.age}岁`);
      const post = postOpDays(p);
      if (post) meta.push(post);
      else if (p?.status) meta.push(p.status);
      return h('div', { class: 'wb-pcell' }, [
        h('div', { class: ['wb-avatar', `risk-${risk}`] }, initial),
        h('div', { class: 'wb-pmeta' }, [
          h('div', { class: 'wb-pname' }, name),
          h('div', { class: 'wb-psub' }, meta.join(' · ') || '—')
        ])
      ]);
    }
  },
  {
    title: '待办事项',
    minWidth: 220,
    ellipsis: false,
    render: ({ record }: { record: WorkbenchTask }) => {
      const tip = `${kindLabel(record.kind)} · ${record.title}\n${record.desc}`;
      return h('div', { class: 'wb-todo-cell', title: tip }, [
        h('div', { class: 'wb-todo-head' }, [
          h('span', { class: ['wb-kind-pill', `k-${record.kind}`] }, [
            h('span', { class: 'ki' }, kindIcon(record.kind)),
            h('span', { class: 'kt' }, kindLabel(record.kind))
          ]),
          h('span', { class: 'wb-ttl' }, record.title)
        ]),
        h('div', { class: 'wb-desc' }, record.desc)
      ]);
    }
  },
  {
    title: '关键指标',
    width: 208,
    render: ({ record }: { record: WorkbenchTask }) => {
      const p = patientOf(record.patientId);
      const lab = p ? getLastLab(p) : null;
      const trend = p ? patientLabTags(p) : [];
      const chips: any[] = [];
      const fmt = (v: number | null | undefined, digits = 0) =>
        v == null ? null : digits > 0 ? Number(v).toFixed(digits) : Math.round(Number(v)).toString();
      const mk = (label: string, val: string | null, abnormal: boolean, dir?: '↑' | '↓') => {
        if (val == null) return;
        chips.push(
          h('span', { class: ['wb-vchip', abnormal ? 'wb-vchip--bad' : 'wb-vchip--ok'] }, [
            h('span', { class: 'k' }, label),
            h('span', { class: 'v' }, val),
            dir ? h('span', { class: 'd' }, dir) : null
          ])
        );
      };
      if (lab) {
        const scrUp = trend.includes('Scr↑');
        const egfrDown = trend.includes('eGFR↓');
        const tacAbn = trend.includes('Tac↑') || trend.includes('Tac↓');
        mk('Scr', fmt(lab.scr), scrUp || (lab.scr ?? 0) > 115, scrUp ? '↑' : undefined);
        mk('eGFR', fmt(lab.egfr), egfrDown || (lab.egfr ?? 999) < 60, egfrDown ? '↓' : undefined);
        mk('Tac', fmt(lab.tac, 1), tacAbn || (lab.tac ?? 0) < 5 || (lab.tac ?? 0) > 10, trend.includes('Tac↑') ? '↑' : trend.includes('Tac↓') ? '↓' : undefined);
      }
      chips.push(h('span', { class: 'wb-vchip wb-vchip--ai' }, [h('span', { class: 'v' }, record.aiTag)]));
      return h('div', { class: 'wb-vchips' }, chips);
    }
  },
  {
    title: '到期',
    dataIndex: 'due',
    width: 90,
    align: 'left',
    render: ({ record }: { record: WorkbenchTask }) => {
      const overdue = record.due === '已逾期';
      const today = record.due === '今日';
      return h('div', { class: 'wb-due-cell' }, [
        h('span', { class: ['wb-due', overdue ? 'wb-due--over' : today ? 'wb-due--today' : ''] }, record.due),
        h('span', { class: 'wb-due-sub' }, '23:59')
      ]);
    }
  },
  {
    title: '状态',
    dataIndex: 'state',
    width: 100,
    align: 'center',
    render: ({ record }: { record: WorkbenchTask }) => {
      const todo = record.state === 'todo';
      return h(
        'span',
        { class: todo ? 'wb-state wb-state--todo' : 'wb-state wb-state--done' },
        todo ? '待办' : '完成'
      );
    }
  },
  {
    title: '操作',
    width: 110,
    align: 'center',
    render: ({ record }: { record: WorkbenchTask }) => {
      if (record.state === 'done') return h('span', { class: 'wb-act-done' }, '✓ 已闭环');
      return h(
        'button',
        {
          class: 'wb-act',
          onClick: (e: MouseEvent) => {
            e.stopPropagation();
            emit('quickAct', record);
          }
        },
        quickActText(record.kind)
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

/* === \u589e\u5f3a\u884c\u5185\u5bb9 === */
.wb-pcell {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  min-width: 0;
}
.wb-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -.02em;
  background: #1F6FEB;
  box-shadow: 0 0 0 2px #fff, 0 0 0 3px rgba(31, 111, 235, .25);
}
.wb-avatar.risk-high { background: linear-gradient(135deg, #d4380d, #ff7a45); box-shadow: 0 0 0 2px #fff, 0 0 0 3px rgba(212, 56, 13, .25); }
.wb-avatar.risk-mid  { background: linear-gradient(135deg, #d46b08, #fa8c16); box-shadow: 0 0 0 2px #fff, 0 0 0 3px rgba(212, 107, 8, .25); }
.wb-avatar.risk-low  { background: linear-gradient(135deg, #389e0d, #73d13d); box-shadow: 0 0 0 2px #fff, 0 0 0 3px rgba(56, 158, 13, .25); }
.wb-pmeta { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.wb-pname { font-size: 13px; font-weight: 600; color: var(--med-text, #1d2129); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wb-psub  { font-size: 11px; color: var(--med-muted, #86909c); line-height: 1.3; white-space: nowrap; }

.wb-kind-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  border: 1px solid;
}
.wb-kind-pill .ki { font-size: 10px; }
.wb-kind-pill.k-follow { color: #096dd9; background: #e6f4ff; border-color: #bae0ff; }
.wb-kind-pill.k-lab    { color: #08979c; background: #e6fffb; border-color: #87e8de; }
.wb-kind-pill.k-med    { color: #722ed1; background: #f9f0ff; border-color: #d3adf7; }

.wb-vchips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 0;
}
.wb-vchip {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  font-size: 11px;
  line-height: 18px;
  padding: 0 7px;
  border-radius: 4px;
  border: 1px solid;
  background: #fafafa;
  font-variant-numeric: tabular-nums;
}
.wb-vchip .k { font-size: 10px; color: var(--med-muted, #86909c); font-weight: 500; }
.wb-vchip .v { font-size: 12px; font-weight: 700; letter-spacing: -.01em; color: var(--med-text, #1d2129); }
.wb-vchip .d { font-size: 10px; font-weight: 700; }
.wb-vchip--ok  { border-color: #d9d9d9; }
.wb-vchip--bad {
  border-color: rgba(212, 56, 13, .35);
  background: rgba(212, 56, 13, .04);
}
.wb-vchip--bad .v { color: #c02929; }
.wb-vchip--bad .d { color: #d4380d; }
.wb-vchip--ai {
  border-color: rgba(31, 111, 235, .25);
  background: rgba(31, 111, 235, .05);
  color: #1F6FEB;
}
.wb-vchip--ai .v { color: #1F6FEB; font-weight: 600; font-size: 11px; }

.wb-due-cell { display: flex; flex-direction: column; gap: 1px; padding: 4px 0; }
.wb-due-sub  { font-size: 10px; color: var(--med-muted, #86909c); }
.wb-due--today { color: #1F6FEB; font-weight: 600; }

.wb-act {
  appearance: none;
  border: 1px solid var(--med-primary, #1F6FEB);
  background: rgba(31, 111, 235, .06);
  color: var(--med-primary, #1F6FEB);
  font-size: 12px;
  font-weight: 600;
  padding: 3px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 140ms cubic-bezier(.2,.9,.25,1);
}
.wb-act:hover {
  background: var(--med-primary, #1F6FEB);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(31, 111, 235, .25);
}
.wb-act-done {
  font-size: 11px;
  color: var(--med-muted, #86909c);
}

/* 行高 + 垂直居中 */
:deep(.arco-table-td) { padding: 10px 8px !important; }
:deep(.arco-table-th) { padding: 10px 8px !important; }
</style>

<!-- 非 scoped：a-table 通过 column.render 产生的 DOM 不在本 SFC scope 内 -->
<style>
.wb-pcell {
  display: flex !important;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  min-width: 0;
}
.wb-pcell .wb-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -.02em;
  background: #1F6FEB;
  box-shadow: 0 0 0 2px #fff, 0 0 0 3px rgba(31, 111, 235, .25);
}
.wb-pcell .wb-avatar.risk-high { background: linear-gradient(135deg, #d4380d, #ff7a45); box-shadow: 0 0 0 2px #fff, 0 0 0 3px rgba(212, 56, 13, .25); }
.wb-pcell .wb-avatar.risk-mid  { background: linear-gradient(135deg, #d46b08, #fa8c16); box-shadow: 0 0 0 2px #fff, 0 0 0 3px rgba(212, 107, 8, .25); }
.wb-pcell .wb-avatar.risk-low  { background: linear-gradient(135deg, #389e0d, #73d13d); box-shadow: 0 0 0 2px #fff, 0 0 0 3px rgba(56, 158, 13, .25); }
.wb-pcell .wb-pmeta { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.wb-pcell .wb-pname { font-size: 13px; font-weight: 600; color: #1d2129; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wb-pcell .wb-psub  { font-size: 11px; color: #86909c; line-height: 1.3; white-space: nowrap; }

.wb-todo-cell .wb-todo-head {
  display: flex !important;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.wb-todo-cell .wb-kind-pill {
  display: inline-flex !important;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  border: 1px solid;
}
.wb-todo-cell .wb-kind-pill .ki { font-size: 11px; }
.wb-todo-cell .wb-kind-pill.k-follow { color: #096dd9; background: #e6f4ff; border-color: #bae0ff; }
.wb-todo-cell .wb-kind-pill.k-lab    { color: #08979c; background: #e6fffb; border-color: #87e8de; }
.wb-todo-cell .wb-kind-pill.k-med    { color: #722ed1; background: #f9f0ff; border-color: #d3adf7; }

.wb-vchips {
  display: flex !important;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 0;
}
.wb-vchip {
  display: inline-flex !important;
  align-items: baseline;
  gap: 4px;
  font-size: 11px;
  line-height: 18px;
  padding: 1px 7px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: #fafafa;
  font-variant-numeric: tabular-nums;
}
.wb-vchip > .k { font-size: 10px; color: #86909c; font-weight: 500; }
.wb-vchip > .v { font-size: 12px; font-weight: 700; letter-spacing: -.01em; color: #1d2129; }
.wb-vchip > .d { font-size: 10px; font-weight: 700; }
.wb-vchip.wb-vchip--bad {
  border-color: rgba(212, 56, 13, .35);
  background: rgba(212, 56, 13, .04);
}
.wb-vchip.wb-vchip--bad > .v { color: #c02929; }
.wb-vchip.wb-vchip--bad > .d { color: #d4380d; }
.wb-vchip.wb-vchip--ai {
  border-color: rgba(31, 111, 235, .25);
  background: rgba(31, 111, 235, .05);
}
.wb-vchip.wb-vchip--ai > .v { color: #1F6FEB; font-weight: 600; font-size: 11px; }

.wb-due-cell { display: flex !important; flex-direction: column; gap: 1px; padding: 4px 0; }
.wb-due-cell .wb-due { font-size: 13px; font-weight: 500; color: #1d2129; line-height: 1.4; }
.wb-due-cell .wb-due--over { color: #cb2634; font-weight: 600; }
.wb-due-cell .wb-due--today { color: #1F6FEB; font-weight: 600; }
.wb-due-cell .wb-due-sub  { font-size: 10px; color: #86909c; }

button.wb-act {
  appearance: none;
  border: 1px solid #1F6FEB;
  background: rgba(31, 111, 235, .06);
  color: #1F6FEB;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 140ms cubic-bezier(.2,.9,.25,1);
}
button.wb-act:hover {
  background: #1F6FEB;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(31, 111, 235, .25);
}
.wb-act-done { font-size: 11px; color: #86909c; }

/* 状态徽标兜底 */
.wb-state {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid;
}
.wb-state.wb-state--todo {
  color: #d25f00;
  border-color: rgba(212, 107, 8, .35);
  background: rgba(250, 140, 22, .08);
}
.wb-state.wb-state--done {
  color: #237804;
  border-color: rgba(56, 158, 13, .28);
  background: rgba(56, 158, 13, .08);
}
</style>
