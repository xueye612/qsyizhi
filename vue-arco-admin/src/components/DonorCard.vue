<template>
  <a-card :bordered="false" class="card">
    <div class="head">
      <div class="left">
        <div class="t">供体摘要</div>
        <div class="s">{{ subtitle }}</div>
      </div>
      <a-space size="mini">
        <a-tag v-if="parsed.kind" color="arcoblue" size="small">{{ parsed.kind }}</a-tag>
        <a-tag v-if="parsed.blood" color="purple" size="small">{{ parsed.blood }}</a-tag>
      </a-space>
    </div>

    <a-divider style="margin: 12px 0;" />

    <div class="grid2">
      <div class="kv">
        <div class="k">HLA</div>
        <div class="v mono">{{ hlaText }}</div>
      </div>
      <div class="kv">
        <div class="k">CMV</div>
        <div class="v">{{ cmvText }}</div>
      </div>
      <div class="kv">
        <div class="k">年龄</div>
        <div class="v">{{ ageText }}</div>
      </div>
      <div class="kv">
        <div class="k">备注</div>
        <div class="v">{{ noteText }}</div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 例如：`DCD · 血型O`（患者 mock 字段） */
    donorText?: string;
    /** 结构化字段（有则优先展示） */
    kind?: string;
    blood?: string;
    hla?: string;
    cmv?: '阳性' | '阴性' | '未知' | string;
    age?: number | null;
    note?: string;
  }>(),
  {
    donorText: '',
    kind: '',
    blood: '',
    hla: '',
    cmv: '未知',
    age: null,
    note: ''
  }
);

function parseDonorText(s: string) {
  const t = String(s || '').trim();
  const kind = t.includes('活体') ? '活体' : t.includes('DCD') ? 'DCD' : '';
  const m = t.match(/血型([ABO]+)/i);
  const blood = m?.[1] ? `血型${String(m[1]).toUpperCase()}` : '';
  return { kind, blood, raw: t };
}

const parsed = computed(() => parseDonorText(props.donorText));

const subtitle = computed(() => {
  if (props.kind || props.blood) return '结构化字段（优先）+ 文本摘要（兜底）';
  return parsed.value.raw ? '从患者字段解析（供体/结算批次可替换为真实供体表）' : '暂无供体摘要';
});

const hlaText = computed(() => props.hla || '—');
const cmvText = computed(() => props.cmv || '—');
const ageText = computed(() => (typeof props.age === 'number' ? `${props.age} 岁` : '—'));
const noteText = computed(() => props.note || parsed.value.raw || '—');
</script>

<style scoped>
.card {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.left {
  min-width: 0;
}
.t {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}
.s {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(100, 116, 139, 0.95);
  line-height: 1.5;
}
.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 12px;
}
.kv {
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.22);
  background: #fff;
}
.k {
  font-size: 12px;
  color: rgba(100, 116, 139, 0.95);
}
.v {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  word-break: break-word;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
</style>
