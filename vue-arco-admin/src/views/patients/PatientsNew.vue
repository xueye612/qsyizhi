<template>
  <div class="med-page">
    <!-- 页头 + KPI：统一 grid，卡片等高 -->
    <a-card :bordered="false" class="med-card med-card--hero">
      <header class="page-head">
        <h1 class="page-title">新增患者</h1>
        <p class="page-desc">录入基本信息 · 自动生成风险预览（演示）</p>
      </header>
      <div class="kpi-grid">
        <MedStatCard
          label="当前风险"
          hint="基于 Scr / eGFR / 异常标记"
          :value="riskText"
          :tone="riskKpiTone"
          :trend="riskTrendText"
          trend-dir="flat"
        />
        <MedStatCard
          label="Scr"
          hint="μmol/L · 模拟录入"
          :value="lab.scr ?? '—'"
          :trend="scrTrend.text"
          :trend-dir="scrTrend.dir"
        />
        <MedStatCard
          label="eGFR"
          hint="ml/min · 模拟录入"
          :value="lab.egfr ?? '—'"
          :trend="egfrTrend.text"
          :trend-dir="egfrTrend.dir"
        />
        <MedStatCard
          label="异常标记"
          hint="随开关更新"
          :value="form.abnormal ? '是' : '否'"
          :tone="form.abnormal ? 'danger' : 'success'"
          trend="与列表展示联动"
          trend-dir="flat"
        />
      </div>
    </a-card>

    <div class="layout">
      <div class="main-col">
        <a-card :bordered="false" class="med-card med-card--section">
          <header class="block-head">
            <h2 class="block-title">患者信息</h2>
            <p class="block-desc">对齐文书字段，减少来回核对</p>
          </header>
          <a-form
            :model="form"
            layout="horizontal"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            class="med-form"
          >
            <a-form-item label="姓名" required>
              <a-input v-model="form.name" placeholder="请输入姓名" />
            </a-form-item>
            <a-form-item label="性别" required>
              <a-select v-model="form.sex" placeholder="请选择">
                <a-option value="男">男</a-option>
                <a-option value="女">女</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="年龄" required>
              <a-input-number v-model="form.age" :min="0" :max="130" class="fullw" />
            </a-form-item>
            <a-form-item label="患者状态" required>
              <a-select v-model="form.status">
                <a-option value="术前">术前</a-option>
                <a-option value="术后">术后</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="手术日期">
              <a-date-picker v-model="form.surgeryDate" class="fullw" />
            </a-form-item>
            <a-form-item label="供体信息" required>
              <a-input v-model="form.donorInfo" placeholder="如：DCD · 血型O" />
            </a-form-item>
            <a-form-item label="异常标记">
              <a-switch v-model="form.abnormal" />
            </a-form-item>
          </a-form>
        </a-card>

        <a-card :bordered="false" class="med-card med-card--section">
          <header class="block-head">
            <h2 class="block-title">关键指标</h2>
            <p class="block-desc">模拟检验录入，用于右侧预览与风险规则（非真实 LIS）</p>
          </header>
          <div class="lab-grid">
            <div class="lab-cell">
              <div class="lab-label">Scr</div>
              <a-input-number v-model="lab.scr" :min="0" :max="800" class="fullw" />
            </div>
            <div class="lab-cell">
              <div class="lab-label">eGFR</div>
              <a-input-number v-model="lab.egfr" :min="0" :max="150" class="fullw" />
            </div>
            <div class="lab-cell">
              <div class="lab-label">Tac</div>
              <a-input-number v-model="lab.tac" :min="0" :max="30" :precision="1" class="fullw" />
            </div>
            <div class="lab-cell">
              <div class="lab-label">蛋白尿(%)</div>
              <a-input-number v-model="lab.prot" :min="0" :max="100" :precision="1" class="fullw" />
            </div>
          </div>
          <footer class="form-actions">
            <a-button type="primary" class="btn-primary" @click="save">保存（模拟）</a-button>
            <a-button @click="reset">重置</a-button>
          </footer>
        </a-card>
      </div>

      <aside class="side-col">
        <PatientCard :patient="previewPatient" :risk-level="riskLevel" variant="clinical" />

        <a-card :bordered="false" class="med-card med-card--section">
          <header class="block-head">
            <h2 class="block-title">诊疗摘要</h2>
            <p class="block-desc">随表单与指标联动刷新，仅供录入参考</p>
          </header>
          <div class="summary-body">
            <p class="summary-line"><span class="summary-k">风险判断：</span>{{ riskText }}</p>
            <p class="summary-line">
              <span class="summary-k">核心依据：</span>Scr {{ lab.scr ?? '—' }}、eGFR {{ lab.egfr ?? '—' }}、Tac
              {{ lab.tac ?? '—' }}
            </p>
            <p class="summary-line"><span class="summary-k">建议动作：</span>{{ suggestion }}</p>
          </div>
        </a-card>

        <MedAiSuggest :items="aiItems" />

        <a-card :bordered="false" class="med-card med-card--section">
          <header class="block-head">
            <h2 class="block-title">快捷操作</h2>
            <p class="block-desc">保存后可返回列表继续补录</p>
          </header>
          <div class="side-actions">
            <a-button type="primary" class="btn-primary" block @click="goList">返回患者列表</a-button>
            <a-button block @click="goList">继续补录（占位）</a-button>
          </div>
        </a-card>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import MedStatCard from '@/components/MedStatCard.vue';
import MedAiSuggest from '@/components/MedAiSuggest.vue';
import PatientCard from '@/components/PatientCard.vue';
import type { Patient, RiskLevel } from '@/mock/patients';
import { riskLevelOf } from '@/mock/patients';

const router = useRouter();

const REF_SCR = 97;
const REF_EGFR = 62;

const form = reactive({
  name: '',
  sex: '女',
  age: 46,
  status: '术后',
  surgeryDate: '2026-03-12',
  donorInfo: 'DCD · 血型O',
  abnormal: false
});

const lab = reactive<{ scr: number | null; egfr: number | null; tac: number | null; prot: number | null }>({
  scr: 109,
  egfr: 59,
  tac: 7.6,
  prot: 9.4
});

const previewPatient = computed<Patient>(() => ({
  id: 'P20260415021',
  name: form.name || '未命名患者',
  sex: form.sex,
  age: form.age,
  status: form.status,
  surgeryDate: form.surgeryDate || undefined,
  donorInfo: form.donorInfo,
  flags: { abnormal: form.abnormal },
  updatedAt: new Date().toISOString(),
  records: { labs: [{ ts: new Date().toISOString().slice(0, 10), scr: lab.scr, egfr: lab.egfr, tac: lab.tac, prot: lab.prot }] }
}));

const riskLevel = computed<RiskLevel>(() => riskLevelOf(previewPatient.value));
const riskText = computed(() => (riskLevel.value === 'high' ? '高风险' : riskLevel.value === 'mid' ? '中风险' : '低风险'));

const riskKpiTone = computed(() =>
  riskLevel.value === 'high' ? 'danger' : riskLevel.value === 'mid' ? 'warning' : 'success'
);

const riskTrendText = computed(() => '随指标实时演算');

function pctTrend(current: number | null, ref: number) {
  if (current == null || !Number.isFinite(current)) {
    return { text: '暂无对比基线', dir: 'flat' as const };
  }
  const p = Math.round(((current - ref) / ref) * 100);
  const text = `较参考 ${p >= 0 ? '+' : ''}${p}%`;
  const dir = p > 0 ? ('up' as const) : p < 0 ? ('down' as const) : ('flat' as const);
  return { text, dir };
}

const scrTrend = computed(() => pctTrend(lab.scr, REF_SCR));
const egfrTrend = computed(() => pctTrend(lab.egfr, REF_EGFR));

const suggestion = computed(() => {
  if (riskLevel.value === 'high') return '尽快复查 Scr/eGFR，结合感染/排斥检查评估。';
  if (riskLevel.value === 'mid') return '缩短复查间隔，关注 Scr/eGFR/Tac 趋势波动。';
  return '按常规随访频次复查，持续监测核心指标。';
});

const aiItems = computed(() => [
  `当前风险预览为「${riskText.value}」：请以主管医师评估为准，演示规则不可用于真实诊疗决策。`,
  suggestion.value,
  '保存前建议核对供体信息、手术日期与文书编号是否一致。'
]);

function save() {
  Message.success('已保存（演示数据，存储于浏览器本地）');
}

function reset() {
  form.name = '';
  form.sex = '女';
  form.age = 46;
  form.status = '术后';
  form.surgeryDate = '2026-03-12';
  form.donorInfo = 'DCD · 血型O';
  form.abnormal = false;
  lab.scr = 109;
  lab.egfr = 59;
  lab.tac = 7.6;
  lab.prot = 9.4;
}

function goList() {
  router.push('/patients/list');
}
</script>

<style scoped>
.med-page {
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
  background: #fafafa;
}

.med-card {
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.med-card :deep(.arco-card-body) {
  padding: 16px;
}

.med-card--hero :deep(.arco-card-body) {
  padding: 16px;
}

.page-head {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: #262626;
}

.page-desc {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  color: #8c8c8c;
  max-width: 640px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  align-items: stretch;
}

@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.layout {
  display: flex;
  align-items: stretch;
  gap: 20px;
  min-width: 0;
}

.main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.side-col {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 1100px) {
  .layout {
    flex-direction: column;
  }
  .side-col {
    width: 100%;
  }
}

.block-head {
  margin-bottom: 16px;
}

.block-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #262626;
}

.block-desc {
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  color: #8c8c8c;
}

.med-form :deep(.arco-form-item-label) {
  font-size: 13px;
  font-weight: 400;
  color: #595959;
}

.med-form :deep(.arco-input),
.med-form :deep(.arco-select-view-single),
.med-form :deep(.arco-picker) {
  font-size: 13px;
}

.lab-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.lab-cell {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
  transition: background-color 0.15s ease;
}

.lab-cell:hover {
  background: #f5f5f5;
}

.lab-label {
  font-size: 13px;
  font-weight: 500;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.fullw {
  width: 100%;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.summary-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-line {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.65;
  color: #434343;
}

.summary-k {
  font-weight: 500;
  color: #595959;
}

.side-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary {
  background-color: #1677ff;
  border-color: #1677ff;
}

.btn-primary:hover {
  background-color: #4096ff;
  border-color: #4096ff;
}
</style>
