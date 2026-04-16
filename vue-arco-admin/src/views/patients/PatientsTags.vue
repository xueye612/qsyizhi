<template>
  <div class="med-page">
    <MedPageSection>
      <MedPageHeader title="患者标签" desc="分层管理 · 风险分组 · 随访效率提升" />

      <div class="queryBar">
        <div class="qItem">
          <div class="qlabel">搜索</div>
          <a-input v-model="q" allow-clear class="q" placeholder="标签名称 / 描述" />
        </div>
        <div class="qItem">
          <div class="qlabel">等级</div>
          <a-select v-model="tier" class="sel">
            <a-option value="all">全部</a-option>
            <a-option value="A">A</a-option>
            <a-option value="B">B</a-option>
            <a-option value="C">C</a-option>
          </a-select>
        </div>
        <div class="qItem">
          <div class="qlabel">风险</div>
          <a-select v-model="risk" class="sel">
            <a-option value="all">全部</a-option>
            <a-option value="high">高风险</a-option>
            <a-option value="mid">中风险</a-option>
            <a-option value="low">低风险</a-option>
          </a-select>
        </div>
        <div class="qActions">
          <a-button type="primary" class="btn-primary" @click="createTag">新增标签</a-button>
        </div>
      </div>

      <div class="kpi-grid">
        <MedStatCard label="标签总数" :value="kpi.total" tone="primary" trend="统一口径" trend-dir="flat" />
        <MedStatCard label="高风险标签" :value="kpi.high" tone="danger" trend="优先治理" trend-dir="flat" />
        <MedStatCard label="覆盖患者" :value="kpi.covered" tone="success" trend="提升效率" trend-dir="flat" />
        <MedStatCard label="未分组" :value="kpi.ungrouped" tone="default" trend="逐步清零" trend-dir="flat" />
      </div>
    </MedPageSection>

    <div class="split">
      <MedTableCard title="标签列表" desc="点击行选中 · 右侧查看策略与操作">
        <a-table
          :data="rows"
          :columns="columns"
          :pagination="false"
          :row-key="(r: any) => r.id"
          :row-class="rowClass"
          @row-click="onRowClick"
        />
      </MedTableCard>

      <div class="rightCol">
        <MedPageSection title="当前标签" desc="分层策略 · 风险提示">
          <div v-if="selected" class="tagHero">
            <div class="name">
              <span class="n">{{ selected.name }}</span>
              <span class="id">（{{ selected.code }}）</span>
            </div>
            <div class="meta">{{ selected.desc }}</div>
            <div class="badges">
              <a-tag color="blue">等级 {{ selected.tier }}</a-tag>
              <RiskTag :level="selected.risk" />
              <a-tag color="gray">覆盖 {{ selected.count }} 人</a-tag>
            </div>
            <div class="lines">
              <div class="line"><b>适用人群</b>{{ selected.scope }}</div>
              <div class="line"><b>随访建议</b>{{ selected.plan }}</div>
            </div>
          </div>
          <div v-else class="empty">请选择一个标签查看详情。</div>
        </MedPageSection>

        <MedAiSuggest :items="aiSuggestItems" />

        <MedPageSection title="操作" desc="编辑 / 归档 / 应用策略">
          <div class="btns">
            <a-button type="primary" class="btn-primary" :disabled="!selected" @click="editTag">编辑标签</a-button>
            <a-button :disabled="!selected" @click="applyTag">应用到患者（占位）</a-button>
            <a-divider style="margin: 10px 0;" />
            <a-button status="danger" :disabled="!selected" @click="archiveTag">归档</a-button>
          </div>
        </MedPageSection>
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
import RiskTag from '@/components/RiskTag.vue';

type Risk = 'high' | 'mid' | 'low';
type TagRow = {
  id: string;
  code: string;
  name: string;
  tier: 'A' | 'B' | 'C';
  risk: Risk;
  count: number;
  desc: string;
  scope: string;
  plan: string;
};

const q = ref('');
const tier = ref<'all' | 'A' | 'B' | 'C'>('all');
const risk = ref<'all' | Risk>('all');

const tags = ref<TagRow[]>([
  { id:'G001', code:'TAG-A1', name:'术后早期高风险', tier:'A', risk:'high', count:18, desc:'术后 1-30 天，Scr 波动明显或异常标记', scope:'术后早期患者', plan:'48h复查 Scr/eGFR，必要时完善尿检+超声' },
  { id:'G002', code:'TAG-B2', name:'指标波动关注', tier:'B', risk:'mid', count:42, desc:'Scr≥115 或 eGFR<60，趋势波动', scope:'需关注趋势患者', plan:'缩短复查间隔，强化用药依从与感染筛查' },
  { id:'G003', code:'TAG-C1', name:'随访稳定', tier:'C', risk:'low', count:120, desc:'核心指标稳定，风险低', scope:'常规随访患者', plan:'按常规频次随访，持续记录症状与用药' },
  { id:'G004', code:'TAG-A2', name:'蛋白尿升高', tier:'A', risk:'high', count:9, desc:'蛋白尿≥10%，需进一步评估', scope:'蛋白尿升高人群', plan:'完善尿检分型，评估肾功能与免疫抑制方案' }
]);

const selectedId = ref<string | null>(tags.value[0]?.id || null);
const selected = computed(() => tags.value.find((t) => t.id === selectedId.value) || null);

const rows = computed(() => {
  const qq = q.value.trim().toLowerCase();
  let list = [...tags.value];
  if (tier.value !== 'all') list = list.filter((t) => t.tier === tier.value);
  if (risk.value !== 'all') list = list.filter((t) => t.risk === risk.value);
  if (qq) list = list.filter((t) => t.name.toLowerCase().includes(qq) || t.desc.toLowerCase().includes(qq) || t.code.toLowerCase().includes(qq));
  return list;
});

const kpi = computed(() => {
  const all = tags.value;
  return { total: all.length, high: all.filter((t) => t.risk === 'high').length, covered: all.reduce((s, t) => s + t.count, 0), ungrouped: 0 };
});

const aiSuggestItems = computed(() => {
  const t = selected.value;
  if (!t) return ['请选择一个标签查看建议。', 'AI辅助建议仅供流程提示。'];
  const riskTxt = t.risk === 'high' ? '高风险标签：建议绑定更短的随访节律与复查窗口。' : t.risk === 'mid' ? '中风险标签：建议结合趋势触发复查。' : '低风险标签：保持常规路径即可。';
  return [riskTxt, `覆盖 ${t.count} 人：建议定期复核标签口径与入组条件（演示）。`, 'AI辅助建议仅供提示，不替代临床判断。'];
});

const columns: TableColumnData[] = [
  { title: '编码', dataIndex: 'code', width: 120 },
  { title: '名称', dataIndex: 'name', width: 180 },
  { title: '等级', dataIndex: 'tier', width: 80 },
  { title: '风险', dataIndex: 'risk', width: 100, render: ({ record }: any) => (record.risk === 'high' ? '高' : record.risk === 'mid' ? '中' : '低') },
  { title: '覆盖人数', dataIndex: 'count', width: 100 },
  { title: '描述', dataIndex: 'desc' }
];

function onRowClick(r: any) { selectedId.value = r.id; }
function rowClass(r: any) { return r.id === selectedId.value ? 'row-selected' : ''; }

function createTag(){ window.alert('新增标签（占位）'); }
function editTag(){ if (!selected.value) return; window.alert(`编辑标签（占位）：${selected.value.name}`); }
function applyTag(){ if (!selected.value) return; window.alert('应用到患者（占位）'); }
function archiveTag(){
  if (!selected.value) return;
  const ok = window.confirm(`确认归档：${selected.value.name}？`);
  if (!ok) return;
  tags.value = tags.value.filter((t) => t.id !== selected.value!.id);
  selectedId.value = tags.value[0]?.id || null;
}
</script>

<style scoped>
.med-page{box-sizing:border-box;padding:var(--med-page-pad);display:flex;flex-direction:column;gap:var(--med-gap);min-width:0}
.queryBar{margin-top:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.qItem{display:flex;align-items:center;gap:10px}
.qlabel{font-size:13px;color:var(--med-muted)}
.qActions{margin-left:auto}
.btn-primary{background:var(--med-primary);border-color:var(--med-primary)}
.kpi-grid{margin-top:12px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--med-gap);align-items:stretch}
.split{display:flex;gap:var(--med-gap);align-items:stretch;min-width:0}
.rightCol{width:360px;flex-shrink:0;display:flex;flex-direction:column;gap:var(--med-gap)}
.tagHero .name{display:flex;gap:6px;align-items:baseline}
.tagHero .n{font-size:16px;font-weight:600;color:var(--med-text)}
.tagHero .id{font-size:13px;color:var(--med-muted)}
.tagHero .meta{margin-top:6px;font-size:13px;color:var(--med-text-2);line-height:1.6}
.badges{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap}
.lines{margin-top:10px;display:flex;flex-direction:column;gap:8px}
.line{display:grid;grid-template-columns:58px minmax(0,1fr);gap:10px;font-size:13px;line-height:1.6;color:var(--med-text)}
.line b{font-weight:500;color:var(--med-text-2)}
.btns{display:flex;flex-direction:column;gap:10px}
.empty{font-size:13px;color:var(--med-muted);line-height:1.6}
@media (max-width:1100px){.split{flex-direction:column}.rightCol{width:100%}.kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.q{width:100%}}
:deep(.row-selected .arco-table-td){background:rgba(22,119,255,0.06) !important;}
</style>

