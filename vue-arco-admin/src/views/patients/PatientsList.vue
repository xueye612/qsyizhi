<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader :title="pageTitle" :desc="pageSub" />
      <div class="queryBar">
        <div class="qItem">
          <div class="qlabel">搜索</div>
          <a-input v-model="q" allow-clear class="q" placeholder="姓名 / 患者ID" />
        </div>
        <div class="qItem">
          <div class="qlabel">状态</div>
          <a-select v-model="status" class="sel" :trigger-props="{ autoFitPopupMinWidth: true }">
            <a-option value="all">全部</a-option>
            <a-option value="术前">术前</a-option>
            <a-option value="术后">术后</a-option>
          </a-select>
        </div>
        <div class="qItem">
          <div class="qlabel">异常</div>
          <a-select
            v-model="abn"
            class="sel"
            :disabled="preset === 'abnormal'"
            :trigger-props="{ autoFitPopupMinWidth: true }"
          >
            <a-option value="all">全部</a-option>
            <a-option value="abn">仅异常</a-option>
          </a-select>
        </div>
        <a-tag v-if="preset === 'abnormal'" color="orangered" size="small">已锁定：异常标记 / 中高风险检验</a-tag>
        <a-tag v-if="preset === 'recent'" color="arcoblue" size="small">默认：最近更新时间倒序</a-tag>
        <div class="qActions">
          <a-button type="primary" class="btn-primary" @click="go('patients.new')">新增患者</a-button>
          <a-button :disabled="!selected" @click="openDetail">查看详情</a-button>
        </div>
      </div>

      <div class="kpi-grid">
        <template v-if="preset === 'default'">
          <MedStatCard label="总患者" hint="当前列表" :value="kpi.total" tone="primary" trend="列表口径" trend-dir="flat" />
          <MedStatCard label="异常患者" hint="异常标记" :value="kpi.abn" tone="danger" trend="优先复核" trend-dir="flat" />
          <MedStatCard label="高风险" hint="分层=高" :value="kpi.high" tone="danger" trend="当日关注" trend-dir="flat" />
          <MedStatCard label="最近更新" hint="日期" :value="kpi.updated" tone="default" trend="按列表排序" trend-dir="flat" />
        </template>
        <template v-else-if="preset === 'abnormal'">
          <MedStatCard label="纳入人数" hint="关注队列" :value="kpi.total" tone="primary" trend="队列规模" trend-dir="flat" />
          <MedStatCard label="异常标记" hint="需处置" :value="kpi.abnFlag" tone="danger" trend="结构化复核" trend-dir="flat" />
          <MedStatCard label="中高风险" hint="分层" :value="kpi.midHigh" tone="warning" trend="缩短窗口" trend-dir="flat" />
          <MedStatCard label="危急阈值" hint="Scr/eGFR 等" :value="kpi.critical" tone="danger" trend="优先评估" trend-dir="flat" />
        </template>
        <template v-else>
          <MedStatCard label="更新队列" hint="当前列表" :value="kpi.total" tone="primary" trend="变更追踪" trend-dir="flat" />
          <MedStatCard label="近24小时" hint="更新活跃" :value="kpi.last24" tone="success" trend="高频变更" trend-dir="flat" />
          <MedStatCard label="近72小时" hint="更新窗口" :value="kpi.last72" tone="default" trend="滚动观察" trend-dir="flat" />
          <MedStatCard label="队列内高风险" hint="分层=高" :value="kpi.high" tone="danger" trend="优先随访" trend-dir="flat" />
        </template>
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard :title="tableTitle" :desc="tableSub">
        <a-table
          :data="rows"
          :columns="columns"
          :pagination="pagination"
          :row-key="(r: any) => r.id"
          :scroll="{ x: 1260 }"
          :row-class="rowClass"
          @row-click="onRowClick"
          @sorter-change="onSorterChange"
        />
      </MedTableCard>

      <div class="rightCol">
        <PatientCard v-if="selected" variant="clinical" :patient="selected" :risk-level="riskLevelNow" />
        <MedPageSection v-else title="患者卡片" desc="—">
          <div class="empty">{{ emptyPrimaryHint }}</div>
        </MedPageSection>

        <MedPageSection :title="riskPanelTitle" :desc="riskPanelSub">
          <div v-if="selected" class="riskList">
            <div v-if="riskItemsDisplay.length === 0" class="empty2">暂无明显异常</div>
            <div v-for="it in riskItemsDisplay" :key="it.k" class="riskItem">
              <IconExclamationCircleFill class="riskIcon" />
              <div class="riskTxt">
                <div class="rk">{{ it.k }}</div>
                <div class="rm">{{ it.m }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty2">—</div>
        </MedPageSection>

        <MedPageSection v-if="preset === 'recent'" title="操作记录" desc="模拟审计时间轴（按时间倒序）">
          <div v-if="selected" class="auditList">
            <div v-for="(ev, idx) in auditEvents" :key="idx" class="auditItem">
              <div class="auditTime mono">{{ ev.ts }}</div>
              <div class="auditTxt">
                <div class="auditTitle">{{ ev.title }}</div>
                <div class="auditMeta">{{ ev.meta }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty2">—</div>
        </MedPageSection>

        <MedAiSuggest :items="aiSuggestItems" />

        <MedPageSection title="操作区" desc="查看 / 编辑 / 补录 / 删除">
          <div class="btns">
            <a-button type="primary" class="btn-primary" :disabled="!selected" @click="openDetail">查看详情</a-button>
            <a-button :disabled="!selected" @click="go('patients.new')">编辑患者</a-button>
            <a-button :disabled="!selected" @click="openDetail">补录数据</a-button>
            <a-divider style="margin: 10px 0;" />
            <a-button status="danger" :disabled="!selected" @click="removeSelected">删除</a-button>
          </div>
        </MedPageSection>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, h, resolveComponent, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IconExclamationCircleFill } from '@arco-design/web-vue/es/icon';
import PatientCard from '@/components/PatientCard.vue';
import MedPageHeader from '@/components/MedPageHeader.vue';
import MedPageSection from '@/components/MedPageSection.vue';
import MedTableCard from '@/components/MedTableCard.vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import type { TableColumnData } from '@arco-design/web-vue';
import { seedPatients, riskLevelOf, getLastLab, type Patient } from '@/mock/patients';

type PagePreset = 'default' | 'abnormal' | 'recent';
const props = withDefaults(defineProps<{ preset?: PagePreset }>(), { preset: 'default' });

const router = useRouter();
const route = useRoute();
const patients = ref<Patient[]>(seedPatients());

const q = ref(String(route.query.q || ''));
const status = ref<'all' | '术前' | '术后'>('all');
const abn = ref<'all' | 'abn'>('all');

type SortState = { field?: string; direction?: 'ascend' | 'descend' };
const sortState = reactive<SortState>({ field: 'updatedAt', direction: 'descend' });

const selectedId = ref<string | null>(patients.value[0]?.id || null);
const selected = computed(() => patients.value.find((p) => p.id === selectedId.value) || null);

const pageTitle = computed(() => {
  if (props.preset === 'abnormal') return '异常患者';
  if (props.preset === 'recent') return '最近更新';
  return '患者列表';
});
const pageSub = computed(() => {
  if (props.preset === 'abnormal') return '工作台 · 关注队列';
  if (props.preset === 'recent') return '工作台 · 变更追踪';
  return '按姓名、患者ID、状态与异常标记筛选';
});
const tableTitle = computed(() => {
  if (props.preset === 'abnormal') return '异常 / 中高风险患者';
  if (props.preset === 'recent') return '按更新时间排序';
  return '患者列表';
});
const tableSub = computed(() => {
  if (props.preset === 'abnormal') return '默认纳入：异常标记 或 中高风险检验（可继续筛选状态/搜索）';
  if (props.preset === 'recent') return '点击行选中 · 支持筛选/排序 · 右侧可查看模拟操作记录';
  return '点击行选中 · 支持筛选/排序';
});
const riskPanelTitle = computed(() => (props.preset === 'abnormal' ? '风险研判' : '风险摘要'));
const riskPanelSub = computed(() => {
  if (props.preset === 'abnormal') return '结构化要点：标记 / 风险分层 / 关键阈值 / 趋势线索';
  return '异常指标清单（最近检验）';
});
const emptyPrimaryHint = computed(() => {
  if (props.preset === 'abnormal') return '从左侧队列点击选择患者，进入异常处置路径（摘要会更“临床化”）。';
  if (props.preset === 'recent') return '从左侧更新队列选择患者，右侧可查看模拟操作记录时间轴。';
  return '从左侧列表点击选择一个患者，即可查看风险摘要与操作入口。';
});

function applyWorkbenchPreset() {
  if (props.preset === 'abnormal') {
    abn.value = 'abn';
    sortState.field = 'updatedAt';
    sortState.direction = 'descend';
  } else if (props.preset === 'recent') {
    abn.value = 'all';
    sortState.field = 'updatedAt';
    sortState.direction = 'descend';
  }
}

applyWorkbenchPreset();
watch(
  () => props.preset,
  () => {
    applyWorkbenchPreset();
    ensureSelectionInView();
  }
);

function go(key: string) {
  router.push('/' + key.replace(/\./g, '/'));
}

function openDetail() {
  if (!selected.value) return;
}

function riskLevel(p: Patient) {
  return riskLevelOf(p);
}

const riskLevelNow = computed(() => (selected.value ? riskLevel(selected.value) : 'low'));

const riskItems = computed(() => {
  const p = selected.value;
  if (!p) return [];
  const lab = p.records?.labs?.[p.records.labs.length - 1];
  if (!lab) return [];
  const items: Array<{ k: string; m: string }> = [];
  const scr = typeof lab.scr === 'number' ? lab.scr : null;
  const egfr = typeof lab.egfr === 'number' ? lab.egfr : null;
  const tac = typeof lab.tac === 'number' ? lab.tac : null;
  const prot = typeof lab.prot === 'number' ? lab.prot : null;
  if (scr != null && scr >= 115) items.push({ k: 'Scr升高', m: `Scr ${scr} μmol/L` });
  if (egfr != null && egfr < 60) items.push({ k: 'eGFR下降', m: `eGFR ${egfr} ml/min` });
  if (tac != null && tac < 5.0) items.push({ k: 'Tac偏低', m: `Tac ${tac}` });
  if (prot != null && prot >= 10) items.push({ k: '蛋白尿升高', m: `蛋白尿 ${prot}%` });
  return items.slice(0, 4);
});

const riskItemsAbnormal = computed(() => {
  const p = selected.value;
  if (!p) return [];
  const out: Array<{ k: string; m: string }> = [];

  const flagged = !!p.flags?.abnormal;
  out.push({
    k: '异常标记',
    m: flagged ? '患者已标记为异常（建议优先复核用药/感染/排斥线索）' : '未标记异常（以检验阈值与趋势为准）'
  });

  const lvl = riskLevel(p);
  out.push({
    k: '风险分层',
    m:
      lvl === 'high'
        ? '高风险：建议当日处置/加急沟通'
        : lvl === 'mid'
          ? '中风险：建议 24-48h 内复查/随访'
          : '低风险：维持常规随访节奏'
  });

  const labs = p.records?.labs || [];
  const prev = labs.length >= 2 ? labs[labs.length - 2] : null;
  const last = labs.length ? labs[labs.length - 1] : null;
  if (prev && last) {
    const ds =
      typeof last.scr === 'number' && typeof prev.scr === 'number'
        ? Math.round((last.scr - prev.scr) * 10) / 10
        : null;
    const de =
      typeof last.egfr === 'number' && typeof prev.egfr === 'number'
        ? Math.round((last.egfr - prev.egfr) * 10) / 10
        : null;
    if (ds != null || de != null) {
      out.push({
        k: '短期趋势',
        m: `对比上一次：Scr ${ds == null ? '—' : `${ds >= 0 ? '+' : ''}${ds}`}；eGFR ${de == null ? '—' : `${de >= 0 ? '+' : ''}${de}`}`
      });
    }
  }

  const lab = last;
  if (lab) {
    const scr = typeof lab.scr === 'number' ? lab.scr : null;
    const egfr = typeof lab.egfr === 'number' ? lab.egfr : null;
    if (scr != null && scr >= 134)
      out.push({ k: '危急阈值（Scr）', m: `Scr ${scr} μmol/L（建议结合尿量/血压/免疫抑制剂浓度）` });
    if (egfr != null && egfr < 45)
      out.push({ k: '危急阈值（eGFR）', m: `eGFR ${egfr} ml/min（建议评估急性损伤 vs 慢性进展）` });
  }

  const merged = [...out];
  for (const it of riskItems.value) {
    if (!merged.some((x) => x.k === it.k)) merged.push(it);
  }
  return merged.slice(0, 8);
});

const riskItemsDisplay = computed(() => (props.preset === 'abnormal' ? riskItemsAbnormal.value : riskItems.value));

function toMillis(v: unknown) {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const s = String(v);
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

function compareField(a: any, b: any, field: string) {
  if (field === 'age') {
    const av = typeof a.age === 'number' ? a.age : null;
    const bv = typeof b.age === 'number' ? b.age : null;
    if (av != null && bv != null) return av - bv;
  }
  if (field === 'updatedAt' || field === 'surgeryDate') {
    const at = toMillis(a[field]);
    const bt = toMillis(b[field]);
    if (at != null && bt != null) return at - bt;
  }
  return String(a[field] ?? '').localeCompare(String(b[field] ?? ''));
}

const rows = computed(() => {
  const qq = q.value.trim().toLowerCase();
  let list = [...patients.value];
  if (qq) {
    list = list.filter((p) => p.name.toLowerCase().includes(qq) || p.id.toLowerCase().includes(qq));
  }
  if (status.value !== 'all') list = list.filter((p) => p.status === status.value);

  if (props.preset === 'abnormal') {
    list = list.filter((p) => !!p.flags?.abnormal || riskLevel(p) !== 'low');
  } else if (abn.value === 'abn') {
    list = list.filter((p) => !!p.flags?.abnormal);
  }

  const { field, direction } = sortState;
  if (field && direction) {
    const mul = direction === 'ascend' ? 1 : -1;
    list.sort((a: any, b: any) => compareField(a, b, field) * mul);
  }
  return list;
});

function fmtTs(iso?: string) {
  const s = String(iso || '');
  return s ? s.slice(0, 19).replace('T', ' ') : '—';
}

function hoursAgoFrom(iso?: string) {
  const t = toMillis(iso);
  if (t == null) return Number.POSITIVE_INFINITY;
  return (Date.now() - t) / (3600 * 1000);
}

const kpi = computed(() => {
  const list = rows.value;
  const total = list.length;
  const abn0 = list.filter((p) => !!p.flags?.abnormal).length;
  const high = list.filter((p) => riskLevel(p) === 'high').length;
  const midHigh = list.filter((p) => {
    const lvl = riskLevel(p);
    return lvl === 'high' || lvl === 'mid';
  }).length;
  const critical = list.filter((p) => {
    const lab = getLastLab(p);
    const scr = typeof lab?.scr === 'number' ? lab.scr : null;
    const egfr = typeof lab?.egfr === 'number' ? lab.egfr : null;
    return !!p.flags?.abnormal || (scr != null && scr >= 134) || (egfr != null && egfr < 45);
  }).length;
  const updated = list
    .map((p) => String(p.updatedAt || ''))
    .sort((a, b) => b.localeCompare(a))[0];
  const last24 = list.filter((p) => hoursAgoFrom(p.updatedAt) <= 24).length;
  const last72 = list.filter((p) => hoursAgoFrom(p.updatedAt) <= 72).length;
  return {
    total,
    abn: abn0,
    abnFlag: abn0,
    midHigh,
    critical,
    high,
    last24,
    last72,
    updated: updated ? updated.slice(0, 10) : '—'
  };
});

const auditEvents = computed(() => {
  const p = selected.value;
  if (!p) return [];
  const base = String(p.updatedAt || '');
  const t0 = fmtTs(base);
  const actor = '系统/当班医生';
  return [
    { ts: t0, title: '数据更新', meta: `${actor} · 同步检验/随访字段` },
    {
      ts: fmtTs(base ? new Date(Date.parse(base) - 2 * 3600 * 1000).toISOString() : ''),
      title: '风险复核',
      meta: `${actor} · 触发阈值提示（Scr/eGFR/Tac）`
    },
    {
      ts: fmtTs(base ? new Date(Date.parse(base) - 26 * 3600 * 1000).toISOString() : ''),
      title: '随访记录',
      meta: `${actor} · 电话随访 / 用药核对（模拟）`
    }
  ];
});

const aiSuggestItems = computed(() => {
  const p = selected.value;
  if (!p) return ['请从左侧列表选择患者。', 'AI辅助建议仅供流程提示。'];
  const lvl = riskLevel(p);
  const lines: string[] = [];
  if (lvl === 'high') lines.push('高风险：建议优先联系主管医师并核对近期检验与用药调整。');
  else if (lvl === 'mid') lines.push('中风险：建议 24–48h 内安排复查或结构化电话随访。');
  else lines.push('低风险：维持常规随访节律，关注症状与依从性变化。');
  if (p.flags?.abnormal) lines.push('已标记异常：建议复核检验来源、单位与阈值口径，避免误判。');
  if (riskItemsDisplay.value.length)
    lines.push(`近期检验关注点：${riskItemsDisplay.value[0].k} — ${riskItemsDisplay.value[0].m}`);
  if (lines.length < 3) lines.push('具体操作请以科室规范为准；AI 仅辅助流程提示。');
  return lines.slice(0, 3);
});

function ensureSelectionInView() {
  const ids = new Set(rows.value.map((p) => p.id));
  if (selectedId.value && ids.has(selectedId.value)) return;
  selectedId.value = rows.value[0]?.id || null;
}

watch(rows, () => ensureSelectionInView(), { flush: 'post' });

const pagination = reactive({
  pageSize: 10,
  showTotal: true
});

const columns = computed<TableColumnData[]>(() => [
  { title: '患者ID', dataIndex: 'id', width: 160, sortable: { sortDirections: ['ascend', 'descend'] } },
  { title: '姓名', dataIndex: 'name', width: 120 },
  { title: '性别', dataIndex: 'sex', width: 70 },
  { title: '年龄', dataIndex: 'age', width: 70, sortable: { sortDirections: ['ascend', 'descend'] } },
  { title: '患者状态', dataIndex: 'status', width: 110 },
  {
    title: '状态/风险',
    dataIndex: 'flags',
    width: 180,
    render: ({ record }: any) => {
      const p = record as Patient;
      const lvl = riskLevel(p);
      const risk = lvl === 'high' ? '高' : lvl === 'mid' ? '中' : '低';
      const riskTag = lvl === 'high' ? 'red' : lvl === 'mid' ? 'orange' : 'green';
      const abnF = !!p.flags?.abnormal;
      const ATag = resolveComponent('a-tag') as any;
      return h(
        'div',
        { style: 'display:flex;gap:8px;align-items:center;' },
        [
          h(ATag, { color: abnF ? 'red' : 'green' }, () => (abnF ? '异常' : '正常')),
          h(ATag, { color: riskTag }, () => `风险 ${risk}`)
        ]
      );
    }
  },
  { title: '手术时间', dataIndex: 'surgeryDate', width: 150, sortable: { sortDirections: ['ascend', 'descend'] } },
  {
    title: '供体信息',
    dataIndex: 'donorInfo',
    width: 148,
    minWidth: 148,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '最近更新',
    dataIndex: 'updatedAt',
    width: 178,
    minWidth: 178,
    sortable: { sortDirections: ['ascend', 'descend'] },
    render: ({ record }: any) =>
      h(
        'span',
        { class: 'mono cell-nowrap' },
        String((record as Patient).updatedAt || '').slice(0, 19).replace('T', ' ')
      )
  }
]);

function onRowClick(record: any) {
  selectedId.value = record.id;
}

function onSorterChange(dataIndex: string, direction: 'ascend' | 'descend' | '') {
  sortState.field = direction ? dataIndex : undefined;
  sortState.direction = direction || undefined;
}

function rowClass(record: any) {
  return record.id === selectedId.value ? 'row-selected' : '';
}

function removeSelected() {
  if (!selected.value) return;
  const ok = window.confirm(`确认删除患者：${selected.value.name}（${selected.value.id}）？`);
  if (!ok) return;
  patients.value = patients.value.filter((p) => p.id !== selected.value!.id);
  selectedId.value = patients.value[0]?.id || null;
}
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
.qActions {
  margin-left: auto;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.btn-primary {
  background: var(--med-primary);
  border-color: var(--med-primary);
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
  min-width: 0;
}
.riskList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.riskItem {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.riskIcon {
  margin-top: 2px;
  color: var(--med-warning);
  flex-shrink: 0;
}
.riskTxt .rk {
  font-size: 13px;
  font-weight: 600;
  color: var(--med-text);
}
.riskTxt .rm {
  margin-top: 2px;
  font-size: 13px;
  color: var(--med-muted);
  line-height: 1.5;
}
.auditList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.auditItem {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 10px 12px;
  border-radius: var(--med-radius);
  border: 1px solid var(--med-border);
  background: var(--med-bg);
}
.auditTime {
  font-size: 12px;
  color: var(--med-muted);
  padding-top: 1px;
}
.auditTitle {
  font-size: 13px;
  font-weight: 600;
  color: var(--med-text);
  line-height: 1.25;
}
.auditMeta {
  margin-top: 3px;
  font-size: 12px;
  color: var(--med-muted);
  line-height: 1.45;
}
.btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.empty,
.empty2 {
  font-size: 13px;
  color: var(--med-muted);
  line-height: 1.6;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
@media (max-width: 1100px) {
  .qActions {
    margin-left: 0;
  }
  .q {
    width: 100%;
  }
  .sel {
    width: 100%;
    max-width: 320px;
  }
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .split {
    flex-direction: column;
  }
  .rightCol {
    width: 100%;
  }
}
:deep(.row-selected .arco-table-td) {
  background: rgba(22, 119, 255, 0.06) !important;
}
:deep(.cell-nowrap) {
  white-space: nowrap;
}
</style>
