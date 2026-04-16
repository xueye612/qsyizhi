<template>
  <div class="menu-shell" :class="{ collapsed }">
    <a-menu
      class="med-menu"
      :selected-keys="selectedKeys"
      :open-keys="openKeys"
      :collapsed="collapsed"
      accordion
      auto-open-selected
      :level-indent="18"
      style="background: transparent;"
      @menu-item-click="onMenuItemClick"
      @sub-menu-click="onSubMenuClick"
    >
      <a-sub-menu v-for="g in menu" :key="g.groupKey" class="menu-group">
        <template #icon>
          <component :is="toArcoIcon(g.icon, 'app')" />
        </template>
        <template #title>
          <span class="group-title">{{ g.group }}</span>
        </template>

        <a-menu-item v-for="it in g.items" :key="it.key" class="menu-item">
          <template #icon>
            <component :is="toArcoIcon(it.icon, 'normal')" />
          </template>
          <span class="item-title">{{ it.label }}</span>
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import type { MenuGroup } from '@/menu/menu';
import {
  IconApps,
  IconArchive,
  IconBook,
  IconCalendar,
  IconCheckCircle,
  IconDashboard,
  IconExclamationCircle,
  IconFile,
  IconFolder,
  IconHistory,
  IconHome,
  IconNotification,
  IconSearch,
  IconSettings,
  IconTag,
  IconTool,
  IconUpload,
  IconUser
} from '@arco-design/web-vue/es/icon';

const props = defineProps<{
  menu: MenuGroup[];
  collapsed: boolean;
  selectedKeys: string[];
  openKeys: string[];
}>();

const emit = defineEmits<{
  (e: 'update:openKeys', v: string[]): void;
  (e: 'itemClick', key: string): void;
}>();

function onMenuItemClick(key: string) {
  emit('itemClick', key);
}

function onSubMenuClick(key: string) {
  // accordion 已保证只开一个，这里同步 openKeys（用于外部状态/路由联动）
  emit('update:openKeys', [key]);
}

/**
 * 字段不可变：menu.icon 为 mdi 字符串
 * 这里仅做“展示使用 Arco icon”的映射层
 */
function toArcoIcon(mdi: string | undefined, fallback: 'app' | 'normal') {
  const key = String(mdi || '');
  const map: Record<string, any> = {
    'mdi:view-dashboard-outline': IconDashboard,
    'mdi:checkbox-marked-circle-outline': IconCheckCircle,
    'mdi:alert-circle-outline': IconExclamationCircle,
    'mdi:history': IconHistory,

    'mdi:account-heart-outline': IconHome,
    'mdi:format-list-bulleted': IconBook,
    'mdi:account-plus-outline': IconCheckCircle,
    'mdi:tag-outline': IconTag,

    'mdi:clipboard-text-outline': IconTool,
    'mdi:calendar-check-outline': IconCalendar,
    'mdi:note-text-outline': IconFile,
    'mdi:shield-account-outline': IconSettings,
    'mdi:wechat': IconNotification,

    'mdi:file-document-outline': IconFile,
    'mdi:upload-outline': IconUpload,
    'mdi:file-search-outline': IconSearch,
    'mdi:chart-line': IconDashboard,
    'mdi:archive-outline': IconArchive,

    'mdi:robot-outline': IconTool,
    'mdi:chat-processing-outline': IconSearch,
    'mdi:shield-alert-outline': IconExclamationCircle,
    'mdi:bell-alert-outline': IconNotification,
    'mdi:information-outline': IconHome,
    'mdi:clipboard-pulse-outline': IconTool,

    'mdi:heart-pulse': IconExclamationCircle,
    'mdi:heart-outline': IconHome,
    'mdi:account-group-outline': IconUser,
    'mdi:clipboard-check-outline': IconCheckCircle,

    'mdi:currency-cny': IconFolder,
    'mdi:credit-card-outline': IconArchive,
    'mdi:receipt-text-outline': IconFile,
    'mdi:bank-outline': IconFolder,
    'mdi:clipboard-list-outline': IconTool,

    'mdi:flask-outline': IconSettings,
    'mdi:database-outline': IconFolder,
    'mdi:filter-variant': IconSearch,
    'mdi:download-outline': IconArchive,
    'mdi:chart-box-outline': IconDashboard,

    'mdi:monitor-dashboard': IconDashboard,
    'mdi:television-play': IconArchive,
    'mdi:calendar-heart': IconCalendar,
    'mdi:shield-pulse': IconExclamationCircle,
    'mdi:account-heart': IconHome,
    'mdi:stethoscope': IconTool,

    'mdi:cog-outline': IconSettings,
    'mdi:account-multiple-outline': IconUser,
    'mdi:lock-outline': IconSettings,
    'mdi:file-sign': IconFile,
    'mdi:tune-variant': IconSettings
  };
  return map[key] || (fallback === 'app' ? IconApps : IconFolder);
}
</script>

<style scoped>
.menu-shell{
  padding: 10px 10px 14px;
}

/* 分组之间“更明显”：每组是一个轻卡片块（非纯 border 分割） */
:deep(.med-menu .arco-menu-inner){
  display:flex;
  flex-direction:column;
  gap:8px;
}
:deep(.med-menu .menu-group){
  background: rgba(255,255,255,.78);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
  padding: 4px;
}

/* 组头：更像飞书/阿里云控制台（轻背景 + hover 提示） */
:deep(.med-menu .menu-group > .arco-menu-inline-header){
  border-radius: 12px;
  padding: 8px 10px;
  background: rgba(15,23,42,.02);
  transition: background-color .18s ease, color .18s ease;
}
:deep(.med-menu .menu-group > .arco-menu-inline-header:hover){
  background: rgba(22,119,255,.08);
}

/* 子菜单容器：内嵌块（弱边界、强调层级） */
:deep(.med-menu .menu-group .arco-menu-inline-content){
  margin-top: 6px;
  background: rgba(255,255,255,.70);
  border-radius: 12px;
  padding: 6px 6px;
  box-shadow: inset 0 0 0 1px rgba(148,163,184,.18);
}

/* hover 背景过渡 */
:deep(.med-menu .arco-menu-item){
  border-radius: 10px;
  transition: background-color .18s ease, color .18s ease, box-shadow .18s ease;
}
:deep(.med-menu .arco-menu-item:hover){
  background: rgba(22,119,255,.08);
}

/*
 * Arco Design Vue 3：选中类名为 .arco-menu-item.arco-menu-selected（不是 arco-menu-item-selected）
 */
:deep(.med-menu .arco-menu-item.arco-menu-selected){
  background: rgba(22,119,255,.10) !important;
  position: relative;
  font-weight: 700;
  color: #0f172a !important;
  box-shadow: inset 0 0 0 1px rgba(22,119,255,.18);
}
:deep(.med-menu .arco-menu-item.arco-menu-selected::before){
  content: "";
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 999px;
  background: rgb(var(--primary-6));
  box-shadow: 0 0 0 1px rgba(255,255,255,.35);
}
:deep(.med-menu .arco-menu-item.arco-menu-selected .arco-menu-icon){
  color: rgb(var(--primary-6));
}

/* 含当前选中子项的分组标题：轻微高亮 */
:deep(.med-menu .menu-group:has(.arco-menu-item.arco-menu-selected) > .arco-menu-inline-header){
  background: rgba(22,119,255,.10);
  color: #0f172a;
}

/* 子菜单缩进层级（不靠简单 padding 拉开，而是配合 Arco level-indent） */
:deep(.med-menu .arco-menu-item .arco-menu-icon){
  margin-right: 10px;
}

/* 展开/收起动画：Arco 内置，但这里让 easing 更“产品化” */
:deep(.med-menu .arco-menu-inline-content){
  transition: height .22s cubic-bezier(.2,.8,.2,1), opacity .22s ease;
}

.group-title{font-weight: 700;}
.item-title{font-weight: 500;}
</style>

