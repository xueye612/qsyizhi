<template>
  <a-drawer
    :visible="visible"
    :width="width"
    :title="drawerTitle"
    :ok-text="mode === 'view' ? '关闭' : '保存'"
    :cancel-text="mode === 'view' ? undefined : '取消'"
    :hide-cancel="mode === 'view'"
    :mask-closable="mode === 'view'"
    @ok="onOk"
    @cancel="onClose"
    @close="onClose"
  >
    <a-form :model="form" layout="vertical" auto-label-width @submit-success="onOk">
      <a-row :gutter="16">
        <a-col
          v-for="f in fields"
          :key="f.key"
          :span="f.span ?? (f.type === 'textarea' ? 24 : 12)"
        >
          <a-form-item
            :field="f.key"
            :label="f.label"
            :required="!!f.required"
            :validate-trigger="['blur', 'change']"
            :rules="buildRules(f)"
            :tooltip="f.tip"
          >
            <a-input
              v-if="!f.type || f.type === 'input'"
              v-model="form[f.key]"
              :placeholder="f.placeholder || `请输入${f.label}`"
              :disabled="mode === 'view' || f.readonly"
              allow-clear
            />
            <a-input-number
              v-else-if="f.type === 'number'"
              v-model="form[f.key]"
              :min="f.min"
              :max="f.max"
              :step="f.step ?? 1"
              :placeholder="f.placeholder || `请输入${f.label}`"
              :disabled="mode === 'view' || f.readonly"
              style="width: 100%"
            />
            <a-textarea
              v-else-if="f.type === 'textarea'"
              v-model="form[f.key]"
              :placeholder="f.placeholder || `请输入${f.label}`"
              :auto-size="{ minRows: 3, maxRows: 6 }"
              :disabled="mode === 'view' || f.readonly"
              allow-clear
            />
            <a-select
              v-else-if="f.type === 'select'"
              v-model="form[f.key]"
              :options="f.options || []"
              :placeholder="f.placeholder || `请选择${f.label}`"
              :disabled="mode === 'view' || f.readonly"
              allow-clear
            />
            <a-date-picker
              v-else-if="f.type === 'date'"
              v-model="form[f.key]"
              :placeholder="f.placeholder || `请选择${f.label}`"
              :disabled="mode === 'view' || f.readonly"
              style="width: 100%"
            />
            <a-switch
              v-else-if="f.type === 'switch'"
              v-model="form[f.key]"
              :disabled="mode === 'view' || f.readonly"
            />
            <a-tag v-else>{{ form[f.key] ?? '—' }}</a-tag>
          </a-form-item>
        </a-col>
      </a-row>
      <slot name="footer" :form="form" :mode="mode" />
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

export type FieldDef = {
  key: string;
  label: string;
  type?: 'input' | 'number' | 'textarea' | 'select' | 'date' | 'switch';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  min?: number;
  max?: number;
  step?: number;
  span?: number;
  tip?: string;
  readonly?: boolean;
};

const props = withDefaults(
  defineProps<{
    visible: boolean;
    mode: 'create' | 'edit' | 'view';
    title?: string;
    fields: FieldDef[];
    record?: Record<string, any> | null;
    width?: number | string;
  }>(),
  {
    title: '',
    record: () => ({}),
    width: 560
  }
);

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'submit', v: Record<string, any>): void;
  (e: 'close'): void;
}>();

const form = reactive<Record<string, any>>({});

function reset() {
  for (const k of Object.keys(form)) delete form[k];
  for (const f of props.fields) {
    form[f.key] = props.record?.[f.key] ?? (f.type === 'switch' ? false : f.type === 'number' ? null : '');
  }
}

watch(
  () => [props.visible, props.record, props.fields],
  () => {
    if (props.visible) reset();
  },
  { immediate: true, deep: true }
);

const drawerTitle = computed(() => {
  if (props.title) return props.title;
  return props.mode === 'create' ? '新增记录' : props.mode === 'edit' ? '编辑记录' : '查看详情';
});

function buildRules(f: FieldDef) {
  const rules: any[] = [];
  if (f.required) {
    rules.push({ required: true, message: `${f.label}不能为空` });
  }
  if (f.type === 'number' && (f.min !== undefined || f.max !== undefined)) {
    rules.push({ type: 'number', min: f.min, max: f.max, message: `${f.label}超出范围` });
  }
  return rules;
}

const submitting = ref(false);

async function onOk() {
  if (props.mode === 'view') {
    onClose();
    return;
  }
  // 简单必填校验
  for (const f of props.fields) {
    if (f.required) {
      const v = form[f.key];
      if (v === '' || v === null || v === undefined) {
        // 让 a-form 自带提示出现（依赖 rules），同时阻止提交
        return;
      }
    }
  }
  submitting.value = true;
  try {
    emit('submit', { ...form });
  } finally {
    submitting.value = false;
  }
}

function onClose() {
  emit('update:visible', false);
  emit('close');
}
</script>
