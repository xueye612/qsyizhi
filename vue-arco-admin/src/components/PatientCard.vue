<template>
  <a-card :bordered="false" class="card" :class="{ 'card--clinical': variant === 'clinical' }">
    <div class="top">
      <a-avatar :size="44" class="av">{{ patient.name.slice(0, 1) }}</a-avatar>
      <div class="id">
        <div class="name">
          {{ patient.name }}
          <span class="pid">（{{ patient.id }}）</span>
        </div>
        <div class="meta">
          {{ patient.sex || '—' }} · {{ Number.isFinite(patient.age) ? patient.age : '—' }} 岁
          <span v-if="postopDays != null"> · 术后 {{ postopDays }} 天</span>
        </div>
      </div>
      <div class="tags">
        <a-tag color="blue">{{ patient.status || '—' }}</a-tag>
        <a-tag :color="patient.flags?.abnormal ? 'red' : 'green'">{{ patient.flags?.abnormal ? '异常' : '正常' }}</a-tag>
      </div>
    </div>

    <div class="risk" :class="`risk-${riskLevel}`">
      <div class="rk">风险等级</div>
      <div class="rv">
        <RiskTag :level="riskLevel" />
      </div>
      <div class="rs">基于 Scr / eGFR / 异常标记</div>
    </div>

    <div class="metrics">
      <div class="m">
        <div class="k">Scr</div>
        <div class="v">{{ lastLab?.scr ?? '—' }}</div>
        <div class="u">μmol/L</div>
      </div>
      <div class="m">
        <div class="k">eGFR</div>
        <div class="v">{{ lastLab?.egfr ?? '—' }}</div>
        <div class="u">ml/min</div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import RiskTag from './RiskTag.vue';

type Lab = { ts: string; scr?: number | null; egfr?: number | null; tac?: number | null; prot?: number | null };
type Patient = {
  id: string;
  name: string;
  sex?: string;
  age?: number;
  status?: string;
  surgeryDate?: string;
  flags?: { abnormal?: boolean };
  records?: { labs?: Lab[] };
};

const props = defineProps<{
  patient: Patient;
  riskLevel: 'high' | 'mid' | 'low';
  /** 轻医疗后台：低对比阴影与字号 */
  variant?: 'default' | 'clinical';
}>();

function postopDaysOf(surgeryDate?: string) {
  if (!surgeryDate) return null;
  const d0 = new Date(String(surgeryDate));
  if (Number.isNaN(d0.getTime())) return null;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d0.getTime()) / (24 * 3600 * 1000));
  return Math.max(0, diff);
}

const postopDays = computed(() => postopDaysOf(props.patient.surgeryDate));
const lastLab = computed(() => {
  const labs = props.patient.records?.labs || [];
  return labs.length ? labs[labs.length - 1] : null;
});
</script>

<style scoped>
/* 默认：保持列表/工作台既有视觉 */
.card {
  border-radius: 12px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.1);
}
.top {
  display: flex;
  gap: 12px;
  align-items: center;
}
.av {
  background: rgba(22, 119, 255, 0.12);
  color: #0b1b40;
  font-weight: 900;
}
.id {
  min-width: 0;
  flex: 1;
}
.name {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.2;
}
.pid {
  font-size: 12px;
  color: rgba(100, 116, 139, 0.95);
  font-weight: 500;
}
.meta {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(100, 116, 139, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.risk {
  margin-top: 12px;
  border-radius: 12px;
  padding: 12px;
}
.rk {
  font-size: 12px;
  opacity: 0.9;
}
.rv {
  margin-top: 4px;
}
.rs {
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.9;
}
.risk-high {
  background: rgba(239, 68, 68, 0.12);
  color: #991b1b;
}
.risk-mid {
  background: rgba(249, 115, 22, 0.14);
  color: #9a3412;
}
.risk-low {
  background: rgba(22, 163, 74, 0.12);
  color: #166534;
}

.metrics {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.m {
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}
.k {
  font-size: 12px;
  color: rgba(100, 116, 139, 0.95);
}
.v {
  margin-top: 4px;
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
}
.u {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(100, 116, 139, 0.95);
}

/* clinical：轻医疗后台（仅新增患者等页） */
.card--clinical {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}
.card--clinical .av {
  background: rgba(22, 119, 255, 0.08);
  color: #1677ff;
  font-weight: 600;
}
.card--clinical .name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  word-break: break-word;
}
.card--clinical .pid {
  color: #8c8c8c;
  font-weight: 400;
}
.card--clinical .meta {
  font-size: 13px;
  font-weight: 400;
  color: #8c8c8c;
}
.card--clinical .risk {
  border-radius: 8px;
  border: 1px solid transparent;
}
.card--clinical .rk {
  opacity: 1;
  font-size: 13px;
  font-weight: 500;
  color: #595959;
}
.card--clinical .rs {
  opacity: 1;
  font-size: 12px;
  font-weight: 400;
  color: #8c8c8c;
}
.card--clinical .risk-high {
  background: rgba(255, 77, 79, 0.06);
  border-color: rgba(255, 77, 79, 0.2);
  color: #cf1322;
}
.card--clinical .risk-mid {
  background: rgba(250, 173, 20, 0.08);
  border-color: rgba(250, 173, 20, 0.25);
  color: #d48806;
}
.card--clinical .risk-low {
  background: rgba(82, 196, 26, 0.08);
  border-color: rgba(82, 196, 26, 0.22);
  color: #389e0d;
}
.card--clinical .m {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: none;
}
.card--clinical .k {
  font-size: 13px;
  font-weight: 500;
  color: #8c8c8c;
}
.card--clinical .v {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  text-align: right;
}
.card--clinical .u {
  text-align: right;
  color: #8c8c8c;
}
.card--clinical .metrics {
  gap: 12px;
}
</style>

