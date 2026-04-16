export type MenuItem = {
  key: string;
  label: string;
  icon?: string;
  /** public 下静态页路径；点击菜单时在新标签页打开（如 /screens/data_screen.html） */
  embedSrc?: string;
};

export type MenuGroup = {
  groupKey: string;
  group: string;
  icon?: string;
  items: MenuItem[];
};

/**
 * 菜单结构：字段不可变（groupKey/group/icon/items/key/label/icon）
 */
export const MENU: MenuGroup[] = [
  {
    groupKey: 'wb',
    group: '工作台',
    icon: 'mdi:view-dashboard-outline',
    items: [
      { key: 'wb.todo', label: '工作台首页', icon: 'mdi:checkbox-marked-circle-outline' },
      { key: 'wb.abnormal', label: '异常患者', icon: 'mdi:alert-circle-outline' },
      { key: 'wb.recent', label: '最近更新', icon: 'mdi:history' }
    ]
  },
  {
    groupKey: 'patients',
    group: '患者管理',
    icon: 'mdi:account-heart-outline',
    items: [
      { key: 'patients.list', label: '患者列表', icon: 'mdi:format-list-bulleted' },
      { key: 'patients.new', label: '新增患者', icon: 'mdi:account-plus-outline' },
      { key: 'patients.tags', label: '患者标签', icon: 'mdi:tag-outline' }
    ]
  },
  {
    groupKey: 'follow',
    group: '随访管理',
    icon: 'mdi:clipboard-text-outline',
    items: [
      { key: 'follow.tasks', label: '随访任务', icon: 'mdi:calendar-check-outline' },
      { key: 'follow.records', label: '随访记录', icon: 'mdi:note-text-outline' },
      { key: 'follow.plan', label: '监护计划', icon: 'mdi:shield-account-outline' },
      { key: 'follow.wxlog', label: '企业微信推送记录', icon: 'mdi:wechat' }
    ]
  },
  {
    groupKey: 'report',
    group: '报告中心',
    icon: 'mdi:file-document-outline',
    items: [
      { key: 'report.upload', label: '报告上传', icon: 'mdi:upload-outline' },
      { key: 'report.parse', label: '报告解析', icon: 'mdi:file-search-outline' },
      { key: 'report.trend', label: '指标趋势', icon: 'mdi:chart-line' },
      { key: 'report.archive', label: '数据归档', icon: 'mdi:archive-outline' }
    ]
  },
  {
    groupKey: 'ai',
    group: 'AI辅助',
    icon: 'mdi:robot-outline',
    items: [
      { key: 'ai.chat', label: 'AI问诊', icon: 'mdi:chat-processing-outline' },
      { key: 'ai.risk', label: '风险识别', icon: 'mdi:shield-alert-outline' },
      { key: 'ai.alert', label: '异常报警', icon: 'mdi:bell-alert-outline' },
      { key: 'ai.interpret', label: '指标解读', icon: 'mdi:information-outline' },
      { key: 'ai.intervene', label: 'AI干预记录', icon: 'mdi:clipboard-pulse-outline' }
    ]
  },
  {
    groupKey: 'donor',
    group: '供体管理',
    icon: 'mdi:heart-pulse',
    items: [
      { key: 'donor.info', label: '供体信息', icon: 'mdi:heart-outline' },
      { key: 'donor.family', label: '家属信息', icon: 'mdi:account-group-outline' },
      { key: 'donor.audit', label: '审核流程', icon: 'mdi:clipboard-check-outline' }
    ]
  },
  {
    groupKey: 'settle',
    group: '结算中心',
    icon: 'mdi:currency-cny',
    items: [
      { key: 'settle.pay', label: '抚恤金支付', icon: 'mdi:credit-card-outline' },
      { key: 'settle.receiver', label: '受体费用管理', icon: 'mdi:receipt-text-outline' },
      { key: 'settle.fund', label: '资金监管', icon: 'mdi:bank-outline' },
      { key: 'settle.recon', label: '对账系统', icon: 'mdi:clipboard-list-outline' }
    ]
  },
  {
    groupKey: 'research',
    group: '科研分析',
    icon: 'mdi:flask-outline',
    items: [
      { key: 'research.db', label: '科研数据库', icon: 'mdi:database-outline' },
      { key: 'research.filter', label: '患者筛选', icon: 'mdi:filter-variant' },
      { key: 'research.survey', label: '问卷管理', icon: 'mdi:clipboard-text-outline' },
      { key: 'research.export', label: '数据导出', icon: 'mdi:download-outline' },
      { key: 'research.stats', label: '统计分析', icon: 'mdi:chart-box-outline' }
    ]
  },
  {
    groupKey: 'screen',
    group: '可视化大屏',
    icon: 'mdi:monitor-dashboard',
    items: [
      { key: 'screen.data', label: '数据大屏', icon: 'mdi:television-play', embedSrc: '/screens/data_screen.html' },
      { key: 'screen.followup', label: 'AI 随访计划', icon: 'mdi:calendar-heart', embedSrc: '/screens/ai_followup_plan.html' },
      { key: 'screen.risk', label: 'AI 风险预警', icon: 'mdi:shield-pulse', embedSrc: '/screens/ai_risk_alert_v2.html' },
      { key: 'screen.patient', label: '患者端视图', icon: 'mdi:account-heart', embedSrc: '/screens/patient_pc.html' },
      { key: 'screen.doctor', label: '医生端视图', icon: 'mdi:stethoscope', embedSrc: '/screens/doctor_pc.html' }
    ]
  },
  {
    groupKey: 'sys',
    group: '系统管理',
    icon: 'mdi:cog-outline',
    items: [
      { key: 'sys.users', label: '用户管理', icon: 'mdi:account-multiple-outline' },
      { key: 'sys.roles', label: '角色权限', icon: 'mdi:lock-outline' },
      { key: 'sys.consent', label: '知情同意', icon: 'mdi:file-sign' },
      { key: 'sys.audit', label: '操作日志', icon: 'mdi:clipboard-list-outline' },
      { key: 'sys.cfg', label: '系统配置', icon: 'mdi:tune-variant' }
    ]
  }
];

