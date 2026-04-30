<template>
  <div class="pp">
    <!-- 顶部固定 Banner -->
    <div class="pp-sticky">
      <a class="pp-back" @click="goBack">
        <IconLeft /> <span>返回患者列表</span>
      </a>
      <PatientHeaderBanner v-if="patient" :patient="patient" />
    </div>

    <div v-if="!patient" class="pp-empty">
      未找到该患者档案。
    </div>

    <div v-else class="pp-grid">
      <!-- 左主列 -->
      <div class="pp-main">
        <section class="sec">
          <header class="sec-h">
            <h3>生命体征</h3>
            <small>近 14 天 · 自动取最近一次记录</small>
          </header>
          <VitalsStrip :patient="patient" />
        </section>

        <section class="sec">
          <header class="sec-h">
            <h3>风险与依从</h3>
            <small>结构化评分 + 服药/随访依从性</small>
          </header>
          <div class="risk-row">
            <RiskScoreRing :patient="patient" />
            <div class="risk-card">
              <div class="risk-card-h">依从性概览</div>
              <AdherencePanel :patient="patient" />
            </div>
          </div>
        </section>

        <a-tabs v-model:active-key="tab" type="rounded" class="pp-tabs">
          <a-tab-pane key="overview" title="临床概览">
            <section class="sec">
              <header class="sec-h"><h3>关键指标趋势</h3><small>多指标叠加 · 支持时间窗 / 切换</small></header>
              <LabTrendPanel :patient="patient" />
            </section>
            <section class="sec">
              <header class="sec-h"><h3>临床时间轴</h3><small>手术 / 就诊 / 检验警示 / 病程记录</small></header>
              <ClinicalTimeline :patient="patient" :limit="12" />
            </section>
          </a-tab-pane>

          <a-tab-pane key="labs" title="检验明细">
            <section class="sec">
              <header class="sec-h"><h3>检验记录</h3><small>最近 90 天 · 共 {{ labRows.length }} 行</small></header>
              <a-table
                :data="labRows"
                :columns="labCols"
                :pagination="{ pageSize: 10, showTotal: true }"
                :scroll="{ x: 1100 }"
                size="small"
              />
            </section>
          </a-tab-pane>

          <a-tab-pane key="meds" title="用药方案">
            <section class="sec">
              <header class="sec-h"><h3>当前用药</h3><small>按治疗类别分组 · 含依从性追踪</small></header>
              <MedicationList :patient="patient" />
            </section>
          </a-tab-pane>

          <a-tab-pane key="enc" title="就诊与随访">
            <section class="sec">
              <header class="sec-h"><h3>就诊记录</h3><small>近期门诊 / 住院 / 随访 / 手术</small></header>
              <a-table :data="patient.clinical?.encounters || []" :columns="encCols" :pagination="false" size="small" />
            </section>
            <section class="sec">
              <header class="sec-h"><h3>影像报告</h3><small>近期影像学检查</small></header>
              <a-table :data="patient.clinical?.imaging || []" :columns="imgCols" :pagination="false" size="small" />
            </section>
          </a-tab-pane>

          <a-tab-pane key="notes" title="病程记录">
            <section class="sec">
              <header class="sec-h"><h3>SOAP / 随访 / 会诊</h3><small>近 3 条临床记录</small></header>
              <div class="notes">
                <div v-for="n in patient.clinical?.notes || []" :key="n.ts" class="note-card">
                  <div class="note-h">
                    <span class="c-chip c-chip--info">{{ n.type }}</span>
                    <span class="who">{{ n.role }} · {{ n.author }}</span>
                    <span class="ts">{{ n.ts }}</span>
                  </div>
                  <p class="note-c">{{ n.content }}</p>
                </div>
              </div>
            </section>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 右副列 -->
      <aside class="pp-side">
        <section class="sec">
          <header class="sec-h"><h3>临床警示</h3><small>需关注 / 处置项</small></header>
          <AlertsRail :patient="patient" />
        </section>
        <section class="sec">
          <header class="sec-h"><h3>问题清单</h3><small>诊断 / 既往</small></header>
          <ProblemList :patient="patient" />
        </section>
        <section class="sec">
          <header class="sec-h"><h3>过敏史</h3><small>药物 / 食物 / 造影剂</small></header>
          <AllergiesCard :patient="patient" />
        </section>
        <section class="sec">
          <header class="sec-h"><h3>紧急联系人</h3><small>—</small></header>
          <div class="emer">
            <div class="emer-row"><i>姓名</i><b>{{ patient.clinical?.contact?.emergency?.name || '—' }}</b></div>
            <div class="emer-row"><i>关系</i><b>{{ patient.clinical?.contact?.emergency?.relation || '—' }}</b></div>
            <div class="emer-row"><i>电话</i><b>{{ patient.clinical?.contact?.emergency?.phone || '—' }}</b></div>
            <div class="emer-row"><i>地址</i><b>{{ patient.clinical?.contact?.address || '—' }}</b></div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IconLeft } from '@arco-design/web-vue/es/icon';
import { seedPatients } from '@/mock/patients';
import PatientHeaderBanner from '@/components/clinical/PatientHeaderBanner.vue';
import VitalsStrip from '@/components/clinical/VitalsStrip.vue';
import LabTrendPanel from '@/components/clinical/LabTrendPanel.vue';
import AlertsRail from '@/components/clinical/AlertsRail.vue';
import RiskScoreRing from '@/components/clinical/RiskScoreRing.vue';
import MedicationList from '@/components/clinical/MedicationList.vue';
import ProblemList from '@/components/clinical/ProblemList.vue';
import ClinicalTimeline from '@/components/clinical/ClinicalTimeline.vue';
import AllergiesCard from '@/components/clinical/AllergiesCard.vue';
import AdherencePanel from '@/components/clinical/AdherencePanel.vue';

const route = useRoute();
const router = useRouter();

const all = seedPatients();
const id = computed(() => String(route.params.id || ''));
const patient = computed(() => all.find((p) => p.id === id.value) || all[0]);

const tab = ref<'overview' | 'labs' | 'meds' | 'enc' | 'notes'>('overview');

const labRows = computed(() => (patient.value.clinical?.labs || []).slice().reverse());
const labCols = [
  { title: '日期', dataIndex: 'ts', width: 110 },
  { title: 'Scr', dataIndex: 'scr' },
  { title: 'eGFR', dataIndex: 'egfr' },
  { title: 'BUN', dataIndex: 'bun' },
  { title: 'K⁺', dataIndex: 'k' },
  { title: 'Na⁺', dataIndex: 'na' },
  { title: 'Hb', dataIndex: 'hb' },
  { title: 'WBC', dataIndex: 'wbc' },
  { title: 'PLT', dataIndex: 'plt' },
  { title: 'ALT', dataIndex: 'alt' },
  { title: 'AST', dataIndex: 'ast' },
  { title: 'Tac', dataIndex: 'tac' },
  { title: '尿蛋白', dataIndex: 'prot' }
];
const encCols = [
  { title: '日期', dataIndex: 'date', width: 110 },
  { title: '类型', dataIndex: 'type', width: 80 },
  { title: '科室', dataIndex: 'dept', width: 130 },
  { title: '诊断 / 主题', dataIndex: 'dx' },
  { title: '记录', dataIndex: 'note' }
];
const imgCols = [
  { title: '日期', dataIndex: 'ts', width: 110 },
  { title: '检查', dataIndex: 'modality', width: 80 },
  { title: '部位', dataIndex: 'site', width: 130 },
  { title: '所见', dataIndex: 'finding' },
  { title: '印象', dataIndex: 'impression' }
];

function goBack() { router.push({ name: 'patients.list' }); }
</script>

<style scoped>
.pp {
  background: var(--c-surface-sunken);
  min-height: calc(100vh - 64px);
  padding: 16px 20px 32px;
}
.pp-sticky {
  position: sticky; top: 0; z-index: 10;
  background: var(--c-surface-sunken);
  padding-bottom: 12px;
  margin-bottom: 16px;
}
.pp-back {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--c-text-3); cursor: pointer;
  margin-bottom: 8px; padding: 4px 8px; border-radius: 6px;
  transition: all var(--c-dur) var(--c-ease);
}
.pp-back:hover { background: var(--c-surface-3); color: var(--c-brand); }

.pp-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
}
@media (max-width: 1280px) { .pp-grid { grid-template-columns: 1fr; } }

.pp-main, .pp-side { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

.sec {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius-lg);
  padding: 14px 16px;
  box-shadow: var(--c-shadow-1);
  animation: c-fadeUp var(--c-dur-slow) var(--c-ease-out) both;
}
.sec-h { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
.sec-h h3 { margin: 0; font-size: 14px; font-weight: 600; color: var(--c-text); }
.sec-h h3::before {
  content: ''; display: inline-block; width: 3px; height: 14px;
  background: var(--c-brand); margin-right: 6px; border-radius: 2px;
  vertical-align: -2px;
}
.sec-h small { color: var(--c-text-muted); font-size: 11px; }

.risk-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 1024px) { .risk-row { grid-template-columns: 1fr; } }
.risk-card {
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius);
  padding: 10px 12px;
}
.risk-card-h { font-size: 12px; color: var(--c-text-2); font-weight: 600; margin-bottom: 8px; }

.pp-tabs :deep(.arco-tabs-nav) { padding-left: 4px; }

.notes { display: flex; flex-direction: column; gap: 10px; }
.note-card {
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  border-left: 3px solid var(--c-brand);
  border-radius: var(--c-radius);
  padding: 10px 12px;
}
.note-h { display: flex; align-items: center; gap: 8px; }
.note-h .who { font-size: 12px; color: var(--c-text-2); }
.note-h .ts { margin-left: auto; font-size: 11px; color: var(--c-text-muted); font-family: ui-monospace, monospace; }
.note-c { margin: 6px 0 0; font-size: 12.5px; color: var(--c-text-2); line-height: 1.6; }

.emer { display: flex; flex-direction: column; gap: 6px; }
.emer-row { display: flex; gap: 6px; font-size: 12px; }
.emer-row i { font-style: normal; color: var(--c-text-muted); width: 32px; flex-shrink: 0; }
.emer-row b { color: var(--c-text); font-weight: 500; }

.pp-empty { padding: 80px 0; text-align: center; color: var(--c-text-muted); }
</style>
