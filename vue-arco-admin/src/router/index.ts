import type { Component } from 'vue';
import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type RouteRecordRaw
} from 'vue-router';
import Layout from '@/layouts/Layout.vue';
import { MENU, type MenuItem } from '@/menu/menu';
import PatientsList from '@/views/patients/PatientsList.vue';
import PatientsNew from '@/views/patients/PatientsNew.vue';
import PatientsTags from '@/views/patients/PatientsTags.vue';
import WbTodo from '@/views/workbench/WbTodo.vue';
import WbAbnormal from '@/views/workbench/WbAbnormal.vue';
import WbRecent from '@/views/workbench/WbRecent.vue';
import DonorInfo from '@/views/modules/DonorInfoView.vue';
import StandardModuleView from '@/views/StandardModuleView.vue';
import FollowTasksView from '@/views/modules/FollowTasksView.vue';
import FollowRecordsView from '@/views/modules/FollowRecordsView.vue';
import FollowPlanView from '@/views/modules/FollowPlanView.vue';
import FollowWxlogView from '@/views/modules/FollowWxlogView.vue';
import ReportUploadView from '@/views/modules/ReportUploadView.vue';
import ReportParseView from '@/views/modules/ReportParseView.vue';
import ReportTrendView from '@/views/modules/ReportTrendView.vue';
import ReportArchiveView from '@/views/modules/ReportArchiveView.vue';
import AiChatView from '@/views/modules/AiChatView.vue';
import AiRiskView from '@/views/modules/AiRiskView.vue';
import AiAlertView from '@/views/modules/AiAlertView.vue';
import AiInterpretView from '@/views/modules/AiInterpretView.vue';
import AiInterveneView from '@/views/modules/AiInterveneView.vue';
import DonorFamilyView from '@/views/modules/DonorFamilyView.vue';
import DonorAuditView from '@/views/modules/DonorAuditView.vue';
import SettlePayView from '@/views/modules/SettlePayView.vue';
import SettleReceiverView from '@/views/modules/SettleReceiverView.vue';
import SettleFundView from '@/views/modules/SettleFundView.vue';
import SettleReconView from '@/views/modules/SettleReconView.vue';
import ResearchDbView from '@/views/modules/ResearchDbView.vue';
import ResearchFilterView from '@/views/modules/ResearchFilterView.vue';
import ResearchSurveyView from '@/views/modules/ResearchSurveyView.vue';
import ResearchExportView from '@/views/modules/ResearchExportView.vue';
import ResearchStatsView from '@/views/modules/ResearchStatsView.vue';
import SysUsersView from '@/views/modules/SysUsersView.vue';
import SysRolesView from '@/views/modules/SysRolesView.vue';
import SysConsentView from '@/views/modules/SysConsentView.vue';
import SysAuditView from '@/views/modules/SysAuditView.vue';
import SysCfgView from '@/views/modules/SysCfgView.vue';

const PAGE_MAP: Record<string, Component> = {
  'patients.list': PatientsList,
  'patients.new': PatientsNew,
  'patients.tags': PatientsTags,
  'wb.todo': WbTodo,
  'wb.abnormal': WbAbnormal,
  'wb.recent': WbRecent,
  'donor.info': DonorInfo,
  'follow.tasks': FollowTasksView,
  'follow.records': FollowRecordsView,
  'follow.plan': FollowPlanView,
  'follow.wxlog': FollowWxlogView,
  'report.upload': ReportUploadView,
  'report.parse': ReportParseView,
  'report.trend': ReportTrendView,
  'report.archive': ReportArchiveView,
  'ai.chat': AiChatView,
  'ai.risk': AiRiskView,
  'ai.alert': AiAlertView,
  'ai.interpret': AiInterpretView,
  'ai.intervene': AiInterveneView,
  'donor.family': DonorFamilyView,
  'donor.audit': DonorAuditView,
  'settle.pay': SettlePayView,
  'settle.receiver': SettleReceiverView,
  'settle.fund': SettleFundView,
  'settle.recon': SettleReconView,
  'research.db': ResearchDbView,
  'research.filter': ResearchFilterView,
  'research.survey': ResearchSurveyView,
  'research.export': ResearchExportView,
  'research.stats': ResearchStatsView,
  'sys.users': SysUsersView,
  'sys.roles': SysRolesView,
  'sys.consent': SysConsentView,
  'sys.audit': SysAuditView,
  'sys.cfg': SysCfgView
};

/** 浏览器地址栏 / 编程式导航使用的绝对路径，如 /wb/todo */
function routePathFromKey(key: string) {
  return '/' + key.replace(/\./g, '/');
}

/** Layout 子路由必须用相对路径（不以 / 开头），否则 Vue Router 4 不按嵌套解析，刷新/直链易异常 */
function childSegmentFromKey(key: string) {
  return key.replace(/\./g, '/');
}

function titleFromKey(key: string) {
  for (const g of MENU) {
    for (const it of g.items) {
      if (it.key === key) return it.label;
    }
  }
  return key;
}

/** 带 embedSrc 的菜单项仅新窗口打开静态页，不注册 SPA 子路由 */
const children: RouteRecordRaw[] = MENU.flatMap((g) =>
  g.items
    .filter((it: MenuItem) => !it.embedSrc)
    .map((it: MenuItem) => ({
      path: childSegmentFromKey(it.key),
      name: it.key,
      component: PAGE_MAP[it.key] ?? StandardModuleView,
      meta: {
        title: it.label,
        group: g.group,
        groupKey: g.groupKey
      }
    }))
);

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', redirect: { name: 'wb.todo' } },
      ...children
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

/** 静态托管无法配置「所有路径回退 index.html」时，在 .env 中设置 VITE_ROUTER_HASH=true（地址栏会带 #） */
const useHashRouter =
  import.meta.env.VITE_ROUTER_HASH === 'true' || import.meta.env.VITE_ROUTER_HASH === '1';

const router = createRouter({
  history: useHashRouter
    ? createWebHashHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL),
  routes
});

const APP_TITLE = '器官移植全流程管理平台';

router.afterEach((to) => {
  const title = (to.meta?.title as string) || titleFromKey(String(to.name || ''));
  document.title = title ? `${title} · ${APP_TITLE}` : APP_TITLE;
});

export default router;

