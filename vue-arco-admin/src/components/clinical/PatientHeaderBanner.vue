<template>
  <div class="phb c-fade-up" :class="`phb--${tone}`">
    <!-- 主条 -->
    <div class="row">
      <div class="avatar">
        <span class="initial">{{ initial }}</span>
        <span v-if="hasCritical" class="dot c-pulse" />
      </div>

      <div class="ident">
        <div class="line1">
          <h2 class="name">{{ p.name }}</h2>
          <span class="sex" :class="`sex--${p.sex || 'M'}`">{{ p.sex || '—' }}</span>
          <span class="age c-data">{{ p.age ?? '—' }}<small>岁</small></span>
          <span v-if="c?.bloodType" class="blood">{{ c.bloodType }}</span>
          <span class="mrn">MRN {{ c?.mrn || p.id }}</span>
        </div>
        <div class="line2">
          <span class="kv"><i>身高</i><b class="c-data">{{ c?.height ?? '—' }}</b><u>cm</u></span>
          <span class="kv"><i>体重</i><b class="c-data">{{ c?.weight ?? '—' }}</b><u>kg</u></span>
          <span class="kv"><i>BMI</i><b class="c-data">{{ c?.bmi ?? '—' }}</b></span>
          <span class="kv"><i>电话</i><b>{{ c?.contact?.phone || '—' }}</b></span>
          <span class="kv"><i>医保</i><b>{{ c?.insurance?.type || '—' }}</b></span>
        </div>
      </div>

      <div class="trans" v-if="c?.transplant">
        <div class="trans-h">
          <span class="organ-pill">{{ c.transplant.organ }}移植</span>
          <span class="donor-pill">{{ c.transplant.donorType }}</span>
        </div>
        <div class="trans-d">
          <div><i>术后</i><b class="c-data">{{ c.transplant.postopDays }}</b><u>天</u></div>
          <div><i>HLA</i><b>{{ c.transplant.hlaMatch }}</b></div>
          <div><i>主刀</i><b>{{ c.transplant.surgeon }}</b></div>
        </div>
      </div>

      <div class="alerts">
        <a-tooltip v-if="allergies.length" content="过敏史">
          <span class="alg" :class="`alg--${worstAllergy}`">
            <IconExclamation />
            <span>过敏 ×{{ allergies.length }}</span>
          </span>
        </a-tooltip>
        <a-tooltip v-else content="无已知过敏">
          <span class="alg alg--ok"><IconCheckCircle />无过敏</span>
        </a-tooltip>
        <span v-for="t in flagTags" :key="t.code" class="c-chip" :class="`c-chip--${t.tone}`">
          {{ t.label }}
        </span>
      </div>

      <div class="ops">
        <a-button type="primary" size="small">病程记录</a-button>
        <a-button size="small">下医嘱</a-button>
        <a-button size="small">发起会诊</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IconExclamation, IconCheckCircle } from '@arco-design/web-vue/es/icon';
import type { Patient, ClinicalProfile } from '@/mock/patients';

const props = defineProps<{ patient: Patient }>();
const p = computed(() => props.patient);
const c = computed<ClinicalProfile | undefined>(() => p.value.clinical);
const initial = computed(() => p.value.name?.slice(0, 1) || '?');

const allergies = computed(() => c.value?.allergies || []);
const worstAllergy = computed(() => {
  if (allergies.value.some((a) => a.severity === 'critical')) return 'critical';
  if (allergies.value.some((a) => a.severity === 'warning')) return 'warning';
  return 'caution';
});
const hasCritical = computed(() => (c.value?.alerts || []).some((a) => a.level === 'critical'));

const flagTags = computed(() => {
  const arr: { code: string; label: string; tone: 'critical' | 'warning' | 'caution' | 'normal' | 'info' }[] = [];
  const lab = c.value?.labs?.[c.value.labs.length - 1];
  if (lab) {
    if (lab.scr && lab.scr > 130) arr.push({ code: 'scr', label: `Scr ${lab.scr}`, tone: 'critical' });
    if (lab.tac != null && (lab.tac < 4 || lab.tac > 10)) arr.push({ code: 'tac', label: `Tac ${lab.tac}`, tone: 'warning' });
    if (lab.egfr && lab.egfr < 45) arr.push({ code: 'egfr', label: `eGFR ${lab.egfr}`, tone: 'warning' });
  }
  if ((c.value?.compliance?.medication ?? 100) < 85) arr.push({ code: 'adh', label: '依从下降', tone: 'caution' });
  if (!arr.length) arr.push({ code: 'ok', label: '指标平稳', tone: 'normal' });
  return arr;
});

const tone = computed<'critical' | 'warning' | 'normal'>(() => {
  if (hasCritical.value) return 'critical';
  if ((c.value?.alerts || []).some((a) => a.level === 'warning')) return 'warning';
  return 'normal';
});
</script>

<style scoped>
.phb {
  position: relative;
  background: linear-gradient(180deg, #ffffff 0%, var(--c-surface-2) 100%);
  border: 1px solid var(--c-border);
  border-radius: var(--c-radius-lg);
  box-shadow: var(--c-shadow-2);
  overflow: hidden;
}
.phb::before {
  content: '';
  position: absolute; inset: 0 0 auto 0; height: 4px;
  background: linear-gradient(90deg, var(--c-brand), var(--c-accent));
}
.phb--critical::before { background: linear-gradient(90deg, var(--c-critical), var(--c-warning)); }
.phb--warning::before { background: linear-gradient(90deg, var(--c-warning), var(--c-signal)); }

.row {
  display: grid;
  grid-template-columns: auto 1.2fr 1fr auto auto;
  gap: var(--c-sp-5);
  padding: var(--c-sp-4) var(--c-sp-5);
  align-items: center;
}

.avatar {
  position: relative;
  width: 56px; height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-brand-soft), var(--c-accent-soft));
  border: 2px solid #fff;
  box-shadow: var(--c-shadow-2);
  display: grid; place-items: center;
}
.initial { font-size: 22px; font-weight: 700; color: var(--c-brand-2); }
.dot {
  position: absolute; right: -2px; top: -2px;
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--c-critical); border: 2px solid #fff;
}

.ident { min-width: 0; }
.line1 { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.name {
  margin: 0; font-size: 22px; font-weight: 700; line-height: 1.2;
  color: var(--c-text); letter-spacing: .5px;
}
.sex {
  font-size: 11px; padding: 1px 6px; border-radius: var(--c-radius-pill);
  background: var(--c-info-bg); color: var(--c-info); border: 1px solid var(--c-info-border);
}
.sex--女 { background: #fff0f6; color: #c41d7f; border-color: #ffadd2; }
.age { font-size: 16px; color: var(--c-text-2); font-weight: 600; }
.age small { font-size: 11px; color: var(--c-text-3); margin-left: 2px; font-weight: 500; }
.blood {
  background: var(--c-critical-bg); color: var(--c-critical);
  border: 1px solid var(--c-critical-border);
  padding: 1px 8px; border-radius: var(--c-radius-pill);
  font-size: 12px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.mrn { font-family: ui-monospace, Menlo, monospace; font-size: 12px; color: var(--c-text-3); margin-left: auto; }

.line2 { margin-top: 6px; display: flex; gap: 18px; flex-wrap: wrap; }
.kv { display: inline-flex; align-items: baseline; gap: 4px; font-size: 12px; color: var(--c-text-3); }
.kv i { font-style: normal; color: var(--c-text-muted); }
.kv b { color: var(--c-text); font-weight: 600; font-size: 13px; }
.kv u { text-decoration: none; color: var(--c-text-muted); font-size: 11px; }

.trans {
  background: var(--c-surface-3); border-radius: var(--c-radius);
  padding: 10px 14px; min-width: 220px;
  border: 1px dashed var(--c-border);
}
.trans-h { display: flex; gap: 6px; }
.organ-pill {
  background: var(--c-brand); color: #fff; padding: 2px 10px; border-radius: var(--c-radius-pill);
  font-size: 12px; font-weight: 600;
}
.donor-pill {
  background: var(--c-accent-soft); color: var(--c-accent);
  border: 1px solid var(--c-accent); padding: 2px 8px; border-radius: var(--c-radius-pill);
  font-size: 11px; font-weight: 500;
}
.trans-d { display: flex; gap: 14px; margin-top: 6px; flex-wrap: wrap; }
.trans-d > div { font-size: 11px; color: var(--c-text-3); display: inline-flex; align-items: baseline; gap: 3px; }
.trans-d i { font-style: normal; color: var(--c-text-muted); }
.trans-d b { color: var(--c-text); font-size: 13px; font-weight: 700; }
.trans-d u { text-decoration: none; color: var(--c-text-muted); font-size: 10px; margin-left: 1px; }

.alerts { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
.alg {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: var(--c-radius-pill);
  font-size: 12px; font-weight: 600;
}
.alg--critical { background: var(--c-critical-bg); color: var(--c-critical); border: 1px solid var(--c-critical-border); }
.alg--warning  { background: var(--c-warning-bg);  color: var(--c-warning);  border: 1px solid var(--c-warning-border); }
.alg--caution  { background: var(--c-caution-bg);  color: var(--c-caution);  border: 1px solid var(--c-caution-border); }
.alg--ok       { background: var(--c-normal-bg);   color: var(--c-normal);   border: 1px solid var(--c-normal-border); }

.ops { display: flex; flex-direction: column; gap: 6px; }
.ops :deep(.arco-btn) { min-width: 96px; }

@media (max-width: 1280px) {
  .row { grid-template-columns: auto 1fr 1fr; }
  .alerts, .ops { grid-column: 1 / -1; flex-direction: row; flex-wrap: wrap; align-items: center; }
}
</style>
