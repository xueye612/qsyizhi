<template>
  <a-layout style="height: 100vh;">
    <a-layout-sider
      :collapsed="collapsed"
      collapsible
      :width="264"
      :collapsed-width="72"
      :hide-trigger="true"
      style="border-right: 1px solid rgba(148,163,184,0.22);"
    >
      <div class="brand" :class="{ collapsed }">
        <div class="logo" />
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
          <a-button type="text" class="iconbtn" @click="notify">
            <IconNotification />
          </a-button>
          <a-dropdown>
            <a-button type="text" class="userbtn">
              <IconUser />
              <span class="uname">医生</span>
            </a-button>
            <template #content>
              <a-doption disabled>账号：医生</a-doption>
              <a-doption disabled>角色：临床用户</a-doption>
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
import { MENU } from '@/menu/menu';
import SidebarMenu from '@/components/SidebarMenu.vue';
import { IconMenuFold, IconMenuUnfold, IconNotification, IconSearch, IconUser } from '@arco-design/web-vue/es/icon';

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

function notify() {
  window.alert('通知中心：占位（可接入消息/提醒）。');
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
  height:60px;
  box-sizing:border-box;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 14px;
  border-bottom:1px solid rgba(148,163,184,0.18);
}
.brand.collapsed{justify-content:center}
.logo{
  width:28px;height:28px;border-radius:10px;background:var(--blue);
}
.brand-text{min-width:0}
.brand-title{font-weight:750;font-size:15px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.brand-sub{margin-top:2px;font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

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
</style>

