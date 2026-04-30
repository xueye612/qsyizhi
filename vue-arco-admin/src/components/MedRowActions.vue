<template>
  <a-space :size="4">
    <a-button v-if="canView" type="text" size="mini" @click.stop="$emit('view')">查看</a-button>
    <a-button v-if="canEdit" type="text" size="mini" @click.stop="$emit('edit')">编辑</a-button>
    <a-popconfirm
      v-if="canDelete"
      content="确认删除该记录？此操作不可撤销。"
      ok-text="删除"
      type="warning"
      @ok="$emit('delete')"
    >
      <a-button type="text" size="mini" status="danger" @click.stop>删除</a-button>
    </a-popconfirm>
    <slot />
  </a-space>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    canView?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
  }>(),
  { canView: true, canEdit: true, canDelete: true }
);

defineEmits<{
  (e: 'view'): void;
  (e: 'edit'): void;
  (e: 'delete'): void;
}>();
</script>
