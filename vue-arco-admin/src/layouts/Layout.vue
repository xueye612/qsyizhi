<template>
  <a-layout style="height: 100vh;">
    <a-layout-sider
      :collapsed="collapsed"
      collapsible
      :width="264"
      :collapsed-width="72"
      :hide-trigger="true"
      style="background: #f0f4fc; border-right: 1px solid rgba(148,163,184,0.18);"
    >
      <div class="brand" :class="{ collapsed }">
        <div class="logo">器</div>
        <div v-if="!collapsed" class="brand-text">
          <div class="brand-title">器官移植全流程管理平台</div>
          <div class="brand-sub">随访 · 风险 · 报告 · 科研 · 结算</div>
        </div>
      </div>

      <SidebarMenu
        :menu="MENU"
        :collapsed="collapsed"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        @update:openKeys="setOpenKeys"
        @itemClick="onMenuItemClick"
      />
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="topbar">
        <div class="topbar-left">
          <a-button type="text" class="iconbtn collapse-btn" @click="collapsed = !collapsed">
            <component :is="collapsed ? IconMenuUnfold : IconMenuFold" />
          </a-button>
          <div class="page-titles">
            <div class="breadcrumb">{{ breadcrumb }}</div>
            <div class="page-title">{{ pageTitle }}</div>
          </div>
        </div>

        <div class="topbar-mid">
          <a-input
            v-model="globalQuery"
            allow-clear
            class="global-search"
            placeholder="全局搜索：姓名 / 患者ID / 关键词"
            @press-enter="goPatientsListWithQuery"
          >
            <template #prefix>
              <IconSearch />
            </template>
          </a-input>
        </div>

        <div class="topbar-right">
          <a-popover trigger="click" position="br" content-class="notify-pop">
            <a-badge :count="unreadCount" :offset="[-4, 4]" :dot="false">
              <a-button type="text" class="iconbtn" aria-label="通知中心">
                <IconNotification />
              </a-button>
            </a-badge>
            <template #content>
              <div class="notify-panel">
                <div class="notify-head">
                  <div class="t">通知中心</div>
                  <a-link :hoverable="false" :disabled="!unreadCount" @click="markAllRead">全部已读</a-link>
                </div>
                <div v-if="!notifyList.length" class="notify-empty">暂无通知</div>
                <a-list v-else :bordered="false" :max-height="380" size="small">
                  <a-list-item
                    v-for="n in notifyList"
                    :key="n.id"
                    class="notify-item"
                    :class="{ unread: !n.read }"
                    @click="onNotifyClick(n)"
                  >
                    <a-list-item-meta :title="n.title" :description="n.desc">
                      <template #avatar>
                        <a-avatar :style="{ background: notifyColor(n.kind) }" :size="32">
                          {{ notifyEmoji(n.kind) }}
                        </a-avatar>
                      </template>
                    </a-list-item-meta>
                    <template #extra>
                      <span class="notify-ts">{{ n.ts.slice(5) }}</span>
                    </template>
                  </a-list-item>
                </a-list>
                <div class="notify-foot">
                  <a-link :hoverable="false" @click="resetDemoAndNotify">重置演示数据</a-link>
                </div>
              </div>
            </template>
          </a-popover>

          <a-dropdown trigger="click" position="br">
            <a-button type="text" class="userbtn" aria-label="账号菜单">
              <a-avatar :size="28" :style="{ background: '#1677FF' }">医</a-avatar>
              <span class="uname">陈主任</span>
            </a-button>
            <template #content>
              <a-doption disabled>账号：chen.zhuren</a-doption>
              <a-doption disabled>角色：临床主任</a-doption>
              <a-doption disabled>科室：器官移植中心</a-doption>
              <a-divider style="margin: 4px 0" />
              <a-doption @click="goPersonal">个人中心</a-doption>
              <a-doption @click="goSettings">系统配置</a-doption>
              <a-doption @click="resetDemoAndNotify">重置演示数据</a-doption>
              <a-divider style="margin: 4px 0" />
              <a-doption @click="onLogout">
                <template #icon><IconExport /></template>
                退出登录
              </a-doption>
            </template>
          </a-dropdown>
          <div class="clock">{{ clock }}</div>
        </div>
      </a-layout-header>

      <a-layout-content class="content">
        <RouterView />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message, Modal } from '@arco-design/web-vue';
import { MENU } from '@/menu/menu';
import SidebarMenu from '@/components/SidebarMenu.vue';
import { IconExport, IconMenuFold, IconMenuUnfold, IconNotification, IconSearch } from '@arco-design/web-vue/es/icon';
import { seedNotifications, type NotifyItem, type NotifyKind } from '@/mock/notifications';
import { resetAllDemoStores } from '@/utils/demoStore';

const route = useRoute();
const router = useRouter();

const collapsed = ref(false);
const globalQuery = ref('');

const selectedKeys = computed(() => [String(route.name || '')]);
const openKeys = ref<string[]>([]);

function ensureOpenKeyFromRoute() {
  const name = String(route.name || '');
  const g = MENU.find((x) => x.items.some((it) => it.key === name));
  openKeys.value = g ? [g.groupKey] : [];
}

function setOpenKeys(keys: string[]) {
  openKeys.value = keys;
}

watch(
  () => route.name,
  () => ensureOpenKeyFromRoute(),
  { immediate: true }
);

function routePathFromKey(key: string) {
  return '/' + key.replace(/\./g, '/');
}

function embedSrcForKey(key: string): string | undefined {
  for (const g of MENU) {
    const it = g.items.find((x) => x.key === key);
    if (it?.embedSrc) return it.embedSrc;
  }
  return undefined;
}

function onMenuItemClick(key: string) {
  const src = embedSrcForKey(key);
  if (src) {
    const url = new URL(src, window.location.origin).href;
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  router.push(routePathFromKey(key));
}

/* ===== 通知中心 ===== */
const notifyList = ref<NotifyItem[]>(seedNotifications());
const unreadCount = computed(() => notifyList.value.filter((n) => !n.read).length);

function notifyColor(kind: NotifyKind) {
  switch (kind) {
    case 'alert':
      return '#F53F3F';
    case 'task':
      return '#FF7D00';
    case 'system':
      return '#86909C';
    case 'message':
      return '#1677FF';
    default:
      return '#1677FF';
  }
}
function notifyEmoji(kind: NotifyKind) {
  switch (kind) {
    case 'alert':
      return '!';
    case 'task':
      return '√';
    case 'system':
      return 'S';
    case 'message':
      return 'M';
    default:
      return 'i';
  }
}
function markAllRead() {
  notifyList.value = notifyList.value.map((n) => ({ ...n, read: true }));
  Message.success('已标记全部为已读');
}
function onNotifyClick(n: NotifyItem) {
  notifyList.value = notifyList.value.map((x) => (x.id === n.id ? { ...x, read: true } : x));
  if (n.link) router.push(n.link);
}

/* ===== 用户菜单 ===== */
function goPersonal() {
  Message.info('个人中心：演示模式，暂未开放');
}
function goSettings() {
  router.push(routePathFromKey('sys.cfg'));
}
function onLogout() {
  Modal.confirm({
    title: '退出登录',
    content: '当前为演示模式，确认退出后将刷新页面以重置状态。',
    okText: '退出',
    cancelText: '取消',
    onOk() {
      window.location.reload();
    }
  });
}
function resetDemoAndNotify() {
  const keys = resetAllDemoStores();
  notifyList.value = seedNotifications();
  Message.success(`已重置 ${keys.length} 个演示数据集`);
}

function goPatientsListWithQuery() {
  const q = globalQuery.value.trim();
  if (!q) return;
  router.push(routePathFromKey('patients.list') + `?q=${encodeURIComponent(q)}`);
}

const pageTitle = computed(() => String(route.meta?.title || route.name || '模块'));
const breadcrumb = computed(() => {
  const g = MENU.find((x) => x.items.some((it) => it.key === String(route.name || '')));
  return `工作台 / ${g?.group || '功能'} / ${pageTitle.value}`;
});

const clock = ref('—');
let timer: number | null = null;
function tick() {
  const d = new Date();
  const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(
    d.getHours()
  ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  clock.value = s;
}

onMounted(() => {
  tick();
  timer = window.setInterval(tick, 1000);
});
onUnmounted(() => {
  if (timer) window.clearInterval(timer);
});

// 图标映射已下沉到 SidebarMenu 组件
</script>

<style scoped>
.brand{
  height:64px;
  box-sizing:border-box;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 16px;
  background: #f0f4fc;
  border-bottom:1px solid rgba(148,163,184,0.18);
  position: relative;
}
.brand::after{
  content: '';
  position: absolute;
  bottom: 0; left: 16px; right: 16px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(22,119,255,0.2), transparent);
}
.brand.collapsed{justify-content:center;padding:0 8px}
.logo{
  flex-shrink:0;
  width:32px;height:32px;border-radius:10px;
  background: linear-gradient(135deg,#1677FF 0%,#0f52c8 100%);
  display:flex;align-items:center;justify-content:center;
  box-shadow: 0 2px 8px rgba(22,119,255,0.35);
  font-size:14px;color:#fff;font-weight:900;letter-spacing:-0.02em;
  user-select:none;
}
.brand-text{min-width:0}
.brand-title{font-weight:750;font-size:14px;line-height:1.3;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.brand-sub{margin-top:2px;font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:0.01em}

.menu-wrap{padding:10px}

.topbar{
  min-height:60px;
  box-sizing:border-box;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  padding:10px 18px;
  border-bottom:1px solid rgba(148,163,184,0.18);
}
.topbar-left{display:flex;align-items:center;gap:10px;min-width:0}
.collapse-btn{
  flex:0 0 auto;
  width:36px;
  height:36px;
  margin:0;
  padding:0;
  border-radius:10px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  line-height:1;
}
.collapse-btn :deep(.arco-btn-icon){
  margin:0;
}
.collapse-btn :deep(svg){
  display:block;
}
.page-titles{display:flex;flex-direction:column;gap:6px;min-width:0;justify-content:center;padding:2px 0}
.page-title{font-size:17px;font-weight:800;line-height:1.25;letter-spacing:-0.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.breadcrumb{font-size:12px;line-height:1.35;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.topbar-mid{flex:1;display:flex;justify-content:center;min-width:0;padding:0 8px}
.global-search{width:100%;max-width:min(400px,36vw);border-radius:999px}

.topbar-right{display:flex;align-items:center;gap:10px}
.iconbtn{border-radius:10px}
.userbtn{border-radius:999px}
.uname{margin-left:6px}
.clock{font-size:12px;color:var(--muted);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}

.content{
  padding:12px 16px 16px;
  overflow:auto;
}

.notify-panel{
  width: 360px;
}
.notify-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 10px 12px 6px;
  border-bottom: 1px solid rgba(148,163,184,0.18);
}
.notify-head .t{font-weight:700;color:#0f172a;font-size:14px}
.notify-empty{padding:30px 12px;text-align:center;color:var(--med-muted);font-size:13px}
.notify-item{cursor:pointer;padding:10px 12px}
.notify-item.unread{background:rgba(22,119,255,0.04)}
.notify-ts{font-size:12px;color:var(--med-muted);font-variant-numeric:tabular-nums}
.notify-foot{padding:8px 12px;border-top:1px solid rgba(148,163,184,0.18);text-align:right}
</style>

