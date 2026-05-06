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
  // accordion 宸蹭繚璇佸彧寮€涓€涓紝杩欓噷鍚屾 openKeys锛堢敤浜庡閮ㄧ姸鎬?璺敱鑱斿姩锛?
  emit('update:openKeys', [key]);
}

/**
 * 瀛楁涓嶅彲鍙橈細menu.icon 涓?mdi 瀛楃涓?
 * 杩欓噷浠呭仛鈥滃睍绀轰娇鐢?Arco icon鈥濈殑鏄犲皠灞?
 */
function toArcoIcon(mdi: string | undefined, fallback: 'app' | 'normal') {
  const key = String(mdi || '');
  const map: Record<string, any> = {
    'mdi:view-dashboard-outline': IconDashboard,
    'mdi:checkbox-marked-circle-outline': IconCheckCircle,
    'mdi:alert-circle-outline': IconExclamationCircle,
    'mdi:history': IconHistory,

    'mdi:account-heart-outline': IconHome,
    'mdi:account-clock-outline': IconHistory,
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
    'mdi:cellphone': IconNotification,
    'mdi:tablet-dashboard': IconDashboard,

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
/* ===== 鑿滃崟澶栧３ ===== */
.menu-shell {
  padding: 8px 8px 20px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: rgba(148,163,184,0.3) transparent;
}
.menu-shell::-webkit-scrollbar { width: 4px; }
.menu-shell::-webkit-scrollbar-track { background: transparent; }
.menu-shell::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.35); border-radius: 4px; }

/* ===== arco-menu 鍩虹閲嶇疆 ===== */
:deep(.med-menu .arco-menu-inner) {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
}

/* ===== 鍒嗙粍鍧?===== */
:deep(.med-menu .menu-group) {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  margin-bottom: 2px;
}

/* 鍒嗙粍鏍囬 鈫?杞诲崱鐗囨劅锛屽甫宸︿晶褰╂潯 */
:deep(.med-menu .menu-group > .arco-menu-inline-header) {
  border-radius: 10px;
  padding: 8px 10px 8px 12px;
  margin: 2px 0;
  background: rgba(255,255,255,0.6);
  border: 1px solid rgba(148,163,184,0.14);
  transition: background .15s, border-color .15s, color .15s;
  position: relative;
}
:deep(.med-menu .menu-group > .arco-menu-inline-header:hover) {
  background: rgba(255,255,255,0.9);
  border-color: rgba(22,119,255,0.2);
}
/* 鍚€変腑椤圭殑鍒嗙粍澶?*/
:deep(.med-menu .menu-group:has(.arco-menu-item.arco-menu-selected) > .arco-menu-inline-header) {
  background: rgba(22,119,255,0.08);
  border-color: rgba(22,119,255,0.22);
  color: #1d4ed8;
}
:deep(.med-menu .menu-group:has(.arco-menu-item.arco-menu-selected) > .arco-menu-inline-header .arco-menu-icon) {
  color: #1677ff;
}

/* 鍒嗙粍鏍囬鏂囧瓧 */
.group-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  letter-spacing: 0.01em;
}

/* 鍒嗙粍鍐呭鍖?*/
:deep(.med-menu .menu-group .arco-menu-inline-content) {
  margin-top: 0;
  background: rgba(255,255,255,0.45);
  border-radius: 0 0 10px 10px;
  padding: 3px 4px 5px;
  box-shadow: none;
  border: 1px solid rgba(148,163,184,0.12);
  border-top: none;
}

/* ===== 鑿滃崟椤?===== */
:deep(.med-menu .arco-menu-item) {
  border-radius: 8px;
  margin: 1px 0;
  padding: 8px 10px 8px 14px;
  font-size: 13px;
  color: #374151;
  transition: background .14s, color .14s;
  position: relative;
}
:deep(.med-menu .arco-menu-item:hover) {
  background: rgba(22,119,255,0.08);
  color: #1565d8;
}
:deep(.med-menu .arco-menu-item:hover .arco-menu-icon) {
  color: #1677ff;
}

/* ===== 閫変腑椤?===== */
:deep(.med-menu .arco-menu-item.arco-menu-selected) {
  background: linear-gradient(90deg, rgba(22,119,255,0.15) 0%, rgba(22,119,255,0.06) 100%) !important;
  color: #1565d8 !important;
  font-weight: 600;
}
:deep(.med-menu .arco-menu-item.arco-menu-selected::before) {
  content: '';
  position: absolute;
  left: 5px;
  top: 7px;
  bottom: 7px;
  width: 3px;
  border-radius: 3px;
  background: linear-gradient(180deg, #60a5fa, #1677ff);
  box-shadow: 0 0 6px rgba(22,119,255,0.45);
}
:deep(.med-menu .arco-menu-item.arco-menu-selected .arco-menu-icon) {
  color: #1677ff;
}

/* ===== 鍥炬爣 ===== */
:deep(.med-menu .arco-menu-item .arco-menu-icon) {
  color: #6b7280;
  margin-right: 9px;
  transition: color .14s;
  font-size: 15px;
}
:deep(.med-menu .menu-group > .arco-menu-inline-header .arco-menu-icon) {
  color: #6b7aaa;
  font-size: 16px;
}

/* ===== 灞曞紑鏀惰捣鍔ㄧ敾 ===== */
:deep(.med-menu .arco-menu-inline-content) {
  transition: height .2s cubic-bezier(.4,0,.2,1), opacity .2s ease;
}

/* ===== 瀛愰」鏂囧瓧 ===== */
.item-title {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
}
</style>


