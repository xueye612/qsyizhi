<template>
  <a-drawer
    :visible="visible"
    :width="560"
    :mask-closable="true"
    unmount-on-close
    :footer="false"
    @cancel="close"
  >
    <template #title>
      <div class="ttl">
        <div class="name">{{ patientView.name }} <span class="id">（{{ patientView.id }}）</span></div>
        <div class="meta">
          {{ patientView.sex || '—' }} / {{ Number.isFinite(patientView.age) ? patientView.age : '—' }} 岁
          · {{ patientView.status || '—' }}
          <span v-if="postopDays != null"> · 术后 {{ postopDays }} 天</span>
        </div>
      </div>
    </template>

    <div class="body">
      <a-tabs v-model:active-key="tab" type="rounded">
        <a-tab-pane key="basic" title="基本信息">
          <a-card class="card" :bordered="false">
            <template #title>患者信息</template>
            <a-form :model="formBasic" layout="horizontal" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
              <a-form-item label="姓名">
                <a-input v-model="formBasic.name" />
              </a-form-item>
              <a-form-item label="患者ID">
                <a-input v-model="formBasic.id" disabled />
              </a-form-item>
              <a-form-item label="性别">
                <a-select v-model="formBasic.sex" placeholder="选择">
                  <a-option value="男">男</a-option>
                  <a-option value="女">女</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="年龄">
                <a-input-number v-model="formBasic.age" :min="0" :max="130" style="width: 100%;" />
              </a-form-item>
              <a-form-item label="患者状态">
                <a-select v-model="formBasic.status" placeholder="选择">
                  <a-option value="术前">术前</a-option>
                  <a-option value="术后">术后</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="手术日期">
                <a-date-picker v-model="formBasic.surgeryDate" style="width: 100%;" />
              </a-form-item>
              <a-form-item label="供体信息">
                <a-input v-model="formBasic.donorInfo" />
              </a-form-item>
              <a-form-item label="联系方式">
                <a-input v-model="formBasic.phone" />
              </a-form-item>
            </a-form>
          </a-card>

          <a-card class="card" :bordered="false" style="margin-top: 14px;">
            <template #title>状态与风险</template>
            <div class="badges">
              <a-tag color="blue">{{ patientView.status || '—' }}</a-tag>
              <a-tag :color="abnTagColor">{{ abnText }}</a-tag>
              <a-tag :color="riskColor">{{ riskText }}</a-tag>
            </div>
            <div class="metrics">
              <div class="metric">
                <div class="k">Scr</div>
                <div class="v">{{ lastLab?.scr ?? '—' }}</div>
                <div class="u">μmol/L</div>
              </div>
              <div class="metric">
                <div class="k">eGFR</div>
                <div class="v">{{ lastLab?.egfr ?? '—' }}</div>
                <div class="u">ml/min</div>
              </div>
            </div>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="labs" title="指标">
          <a-card class="card" :bordered="false">
            <template #title>检验指标</template>
            <a-table
              :data="patientView.records.labs"
              :columns="labColumns"
              :pagination="false"
              :scroll="{ x: 520 }"
              row-key="ts"
            />
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="meds" title="用药">
          <a-card class="card" :bordered="false">
            <template #title>用药记录</template>
            <a-table
              :data="patientView.records.meds"
              :columns="medColumns"
              :pagination="false"
              :scroll="{ x: 520 }"
              row-key="ts"
            />
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="risk" title="风险">
          <a-card class="card" :bordered="false">
            <template #title>风险摘要</template>
            <div class="riskList">
              <div v-if="riskItems.length === 0" class="muted">暂无明显异常</div>
              <div v-for="it in riskItems" :key="it.k" class="riskItem">
                <span class="dot" />
                <div class="txt">
                  <div class="rk">{{ it.k }}</div>
                  <div class="rm">{{ it.m }}</div>
                </div>
              </div>
            </div>
          </a-card>

          <a-card class="card" :bordered="false" style="margin-top: 14px;">
            <template #title>建议</template>
            <a-alert
              type="info"
              show-icon
              :title="suggestionTitle"
              :content="suggestionBody"
            />
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="plan" title="计划">
          <a-card class="card" :bordered="false">
            <template #title>随访计划（模拟）</template>
            <a-form :model="formPlan" layout="horizontal" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
              <a-form-item label="随访频次">
                <a-select v-model="formPlan.freq">
                  <a-option value="48h复查">48h复查</a-option>
                  <a-option value="每周一次">每周一次</a-option>
                  <a-option value="每月一次">每月一次</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="关注指标">
                <a-select v-model="formPlan.focus" multiple allow-clear>
                  <a-option value="Scr">Scr</a-option>
                  <a-option value="eGFR">eGFR</a-option>
                  <a-option value="Tac">Tac</a-option>
                  <a-option value="蛋白尿">蛋白尿</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="备注">
                <a-textarea v-model="formPlan.note" :auto-size="{ minRows: 4, maxRows: 8 }" />
              </a-form-item>
            </a-form>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { TableColumnData } from '@arco-design/web-vue';

type Lab = { ts: string; scr?: number | null; egfr?: number | null; tac?: number | null; prot?: number | null };
type Med = { ts: string; name: string; dose?: string; freq?: string; note?: string };
type Patient = {
  id: string;
  name: string;
  sex?: string;
  age?: number;
  status?: string;
  surgeryDate?: string;
  donorInfo?: string;
  phone?: string;
  flags?: { abnormal?: boolean };
  records?: { labs?: Lab[]; meds?: Med[] };
};

const props = defineProps<{
  visible: boolean;
  patient?: Patient | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
}>();

const tab = ref<'basic' | 'labs' | 'meds' | 'risk' | 'plan'>('basic');

function close() {
  emit('update:visible', false);
}

function nowIso() {
  return new Date().toISOString();
}

function mockPatient(): Patient {
  return {
    id: 'P20260415001',
    name: '王芳',
    sex: '女',
    age: 46,
    status: '术后',
    surgeryDate: '2026-03-12',
    donorInfo: 'DCD · 血型O',
    phone: '13800000001',
    flags: { abnormal: true },
    records: {
      labs: [
        { ts: '2026-04-12', scr: 102, egfr: 62, tac: 6.2, prot: 8.1 },
        { ts: '2026-04-14', scr: 109, egfr: 59, tac: 7.6, prot: 9.4 }
      ],
      meds: [
        { ts: '2026-04-14', name: '他克莫司', dose: '1mg', freq: 'bid', note: '按时服用' },
        { ts: '2026-04-14', name: '吗替麦考酚酯', dose: '0.5g', freq: 'bid', note: '' }
      ]
    }
  };
}

const patientView = computed(() => {
  const p = props.patient || null;
  const mp = mockPatient();
  const merged: Patient = {
    ...mp,
    ...(p || {}),
    records: {
      labs: p?.records?.labs?.length ? p!.records!.labs : mp.records!.labs,
      meds: p?.records?.meds?.length ? p!.records!.meds : mp.records!.meds
    }
  };
  return {
    ...merged,
    records: {
      labs: (merged.records?.labs || []).slice().sort((a, b) => String(b.ts).localeCompare(String(a.ts))),
      meds: (merged.records?.meds || []).slice().sort((a, b) => String(b.ts).localeCompare(String(a.ts)))
    }
  } as Required<Patient> & { records: { labs: Lab[]; meds: Med[] } };
});

watch(
  () => props.visible,
  (v) => {
    if (v) tab.value = 'basic';
  }
);

const formBasic = reactive({
  name: '',
  id: '',
  sex: '',
  age: 0 as number | null,
  status: '',
  surgeryDate: '',
  donorInfo: '',
  phone: ''
});

const formPlan = reactive({
  freq: '48h复查',
  focus: ['Scr', 'eGFR'] as string[],
  note: '48小时复测 Scr/eGFR，必要时完善尿检与超声。'
});

watch(
  () => patientView.value,
  (p) => {
    formBasic.name = p.name || '';
    formBasic.id = p.id || '';
    formBasic.sex = p.sex || '';
    formBasic.age = Number.isFinite(p.age) ? (p.age as number) : null;
    formBasic.status = p.status || '';
    formBasic.surgeryDate = p.surgeryDate || '';
    formBasic.donorInfo = p.donorInfo || '';
    formBasic.phone = p.phone || '';
  },
  { immediate: true }
);

const lastLab = computed(() => patientView.value.records.labs[0] || null);

function postopDaysOf(surgeryDate?: string) {
  if (!surgeryDate) return null;
  const d0 = new Date(String(surgeryDate));
  if (Number.isNaN(d0.getTime())) return null;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d0.getTime()) / (24 * 3600 * 1000));
  return Math.max(0, diff);
}
const postopDays = computed(() => postopDaysOf(patientView.value.surgeryDate));

function riskLevel(): 'high' | 'mid' | 'low' {
  const p = patientView.value;
  const ab = !!p.flags?.abnormal;
  const lab = lastLab.value;
  const scr = typeof lab?.scr === 'number' ? lab!.scr : null;
  const egfr = typeof lab?.egfr === 'number' ? lab!.egfr : null;
  if (ab || (scr != null && scr >= 134) || (egfr != null && egfr < 45)) return 'high';
  if ((scr != null && scr >= 115) || (egfr != null && egfr < 60)) return 'mid';
  return 'low';
}

const riskText = computed(() => {
  const lvl = riskLevel();
  return lvl === 'high' ? '高风险' : lvl === 'mid' ? '中风险' : '低风险';
});
const riskColor = computed(() => {
  const lvl = riskLevel();
  return lvl === 'high' ? 'red' : lvl === 'mid' ? 'orange' : 'green';
});
const abnText = computed(() => (patientView.value.flags?.abnormal ? '异常' : '正常'));
const abnTagColor = computed(() => (patientView.value.flags?.abnormal ? 'red' : 'green'));

const riskItems = computed(() => {
  const lab = lastLab.value;
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
  if (patientView.value.flags?.abnormal && items.length === 0) items.push({ k: '异常标记', m: '存在异常标记，建议结合病程与复查综合判断' });
  return items.slice(0, 5);
});

const suggestionTitle = computed(() => {
  const lvl = riskLevel();
  return lvl === 'high' ? '需优先处理：肾功能波动风险' : lvl === 'mid' ? '建议关注：指标趋势波动' : '随访稳定：按计划复查';
});

const suggestionBody = computed(() => {
  const lvl = riskLevel();
  if (lvl === 'high') return '建议尽快复查 Scr/eGFR，结合用药依从性与感染/排斥相关检查进行评估。';
  if (lvl === 'mid') return '建议缩短复查间隔，重点关注 Scr/eGFR/Tac 变化趋势，必要时调整随访计划。';
  return '按常规随访频次复查，持续监测核心指标并记录症状与用药。';
});

const labColumns: TableColumnData[] = [
  { title: '日期', dataIndex: 'ts', width: 120 },
  { title: 'Scr', dataIndex: 'scr', width: 90 },
  { title: 'eGFR', dataIndex: 'egfr', width: 90 },
  { title: 'Tac', dataIndex: 'tac', width: 90 },
  { title: '蛋白尿(%)', dataIndex: 'prot', width: 110 }
];

const medColumns: TableColumnData[] = [
  { title: '日期', dataIndex: 'ts', width: 120 },
  { title: '药品', dataIndex: 'name', width: 160 },
  { title: '剂量', dataIndex: 'dose', width: 90 },
  { title: '频次', dataIndex: 'freq', width: 90 },
  { title: '备注', dataIndex: 'note' }
];
</script>

<style scoped>
.ttl{display:flex;flex-direction:column;gap:2px}
.name{font-size:16px;font-weight:700;color:#0f172a}
.id{font-size:12px;color:rgba(100,116,139,.95);font-weight:500}
.meta{font-size:12px;color:rgba(100,116,139,.95)}

.body{padding-right:2px}
.card{
  border-radius:14px;
  box-shadow:0 10px 30px rgba(0,0,0,0.06);
}

.badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
.metrics{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.metric{background:rgba(22,119,255,.04);border:1px solid rgba(22,119,255,.14);border-radius:12px;padding:10px 12px}
.metric .k{font-size:12px;color:rgba(100,116,139,.95)}
.metric .v{margin-top:4px;font-size:22px;font-weight:800;color:#0f172a;line-height:1}
.metric .u{margin-top:6px;font-size:12px;color:rgba(100,116,139,.95)}

.riskList{display:flex;flex-direction:column;gap:10px}
.riskItem{display:flex;gap:10px;align-items:flex-start}
.dot{margin-top:6px;width:8px;height:8px;border-radius:50%;background:rgba(249,115,22,.85)}
.txt .rk{font-size:13px;font-weight:600;color:#0f172a}
.txt .rm{margin-top:2px;font-size:12px;color:rgba(100,116,139,.95);line-height:1.35}
.muted{font-size:13px;color:rgba(100,116,139,.95)}

:deep(.arco-drawer-body){padding:16px}
:deep(.arco-tabs-content){padding-top:12px}
</style>

