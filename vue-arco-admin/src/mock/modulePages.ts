/** 标准模块页：副标题与表格列文案（路由 name === menu item key） */

export const MODULE_SUBTITLE: Record<string, string> = {
  'follow.tasks': '任务分派、到期提醒与随访闭环',
  'follow.records': '电话 / 门诊 / 住院随访记录检索',
  'follow.plan': '个体化监护与复查计划配置',
  'follow.wxlog': '企业微信模板消息与触达记录',

  'report.upload': '检验 / 影像 / 文书上传与归档',
  'report.parse': 'OCR 与结构化解析任务队列（模拟）',
  'report.trend': 'Scr、eGFR、免疫抑制剂浓度等趋势',
  'report.archive': '报告版本与合规留存',

  'ai.chat': '问诊草稿与知识库辅助（模拟）',
  'ai.risk': '基于规则与模型的风险分层提示',
  'ai.alert': '阈值与异常事件报警列表',
  'ai.interpret': '指标含义与处置建议话术',
  'ai.intervene': 'AI 建议采纳与人工复核记录',

  'donor.family': '供体家属联系人与伦理材料关联',
  'donor.audit': '供体伦理 / 医学评估流程节点',

  'settle.pay': '抚恤金批次与支付状态',
  'settle.receiver': '受体住院 / 门诊费用汇总（模拟）',
  'settle.fund': '专项资金流水与冻结记录',
  'settle.recon': '对账差异与调账占位',

  'research.db': '脱敏科研数据集与访问审计（模拟）',
  'research.filter': '入排标准与队列筛选',
  'research.survey': '随访问卷与回收率',
  'research.export': '导出任务与文件水印策略',
  'research.stats': '描述性统计与图表占位',

  'sys.users': '账号、科室与状态管理',
  'sys.roles': '菜单与数据权限配置',
  'sys.consent': '知情同意模板与签署记录',
  'sys.audit': '关键操作留痕与检索',
  'sys.cfg': '字典、阈值与系统参数'
};

export function moduleSubtitle(routeKey: string, groupName: string) {
  return MODULE_SUBTITLE[routeKey] || `${groupName} · 模拟数据展示，可对接真实接口`;
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export function moduleKpis(routeKey: string) {
  const h = hashCode(routeKey);
  const warn = h % 5;
  return [
    { label: '在办', value: 6 + (h % 14), tone: 'normal' as const },
    { label: '待处理', value: 1 + (h % 8), tone: 'normal' as const },
    { label: '本周完成', value: 12 + (h % 24), tone: 'normal' as const },
    { label: '预警', value: warn, tone: warn > 0 ? ('danger' as const) : ('muted' as const) }
  ];
}

export type ModuleRow = {
  id: string;
  title: string;
  status: string;
  owner: string;
  updatedAt: string;
  remark: string;
};

const STATUS_POOL = ['进行中', '待审核', '已完成', '已暂停', '待分配'];

export function moduleRows(routeKey: string, pageTitle: string): ModuleRow[] {
  const h = hashCode(routeKey);
  const n = 8;
  return Array.from({ length: n }, (_, i) => {
    const id = `${routeKey.replace(/\./g, '').toUpperCase().slice(0, 6)}-${String(h + i).slice(-4)}`;
    return {
      id,
      title: `${pageTitle} ·事项 ${i + 1}`,
      status: STATUS_POOL[(h + i) % STATUS_POOL.length],
      owner: ['王芳', '李强', '陈静', '赵磊', '周洋'][(h + i) % 5],
      updatedAt: new Date(Date.now() - (i * 47 + (h % 20)) * 3600 * 1000).toISOString(),
      remark: i % 3 === 0 ? '可接入审批流' : i % 3 === 1 ? '模拟数据' : '占位备注'
    };
  });
}
