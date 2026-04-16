/** AI 问诊会话队列 + 风险识别结果（演示，非真实模型输出） */

export type AiChatSession = {
  id: string;
  patientId: string;
  patientName: string;
  topic: string;
  model: string;
  turns: number;
  lastAt: string;
  status: '草稿' | '待医师审签' | '已归档';
  safetyFlag: '无' | '需复核';
};

export type AiRiskHit = {
  id: string;
  patientId: string;
  patientName: string;
  score: number;
  level: '低' | '中' | '高';
  factors: string;
  ruleHits: string;
  evaluatedAt: string;
  reviewer: string;
};

export function seedAiChatSessions(): AiChatSession[] {
  return [
    {
      id: 'CH-20260416-01',
      patientId: 'P20260415008',
      patientName: '刘洋',
      topic: '术后水肿与利尿剂调整问答',
      model: '临床助手-演示',
      turns: 6,
      lastAt: '2026-04-16 10:22',
      status: '待医师审签',
      safetyFlag: '需复核'
    },
    {
      id: 'CH-20260416-02',
      patientId: 'P20260415001',
      patientName: '王芳',
      topic: '免疫抑制剂常见不良反应科普',
      model: '临床助手-演示',
      turns: 4,
      lastAt: '2026-04-16 09:40',
      status: '草稿',
      safetyFlag: '无'
    },
    {
      id: 'CH-20260415-03',
      patientId: 'P20260415012',
      patientName: '张蕾',
      topic: '复查化验单指标解读（草稿）',
      model: '临床助手-演示',
      turns: 9,
      lastAt: '2026-04-15 16:10',
      status: '已归档',
      safetyFlag: '无'
    }
  ];
}

export function aiChatKpis(rows: AiChatSession[]) {
  const pendingSign = rows.filter((r) => r.status === '待医师审签').length;
  const safety = rows.filter((r) => r.safetyFlag === '需复核').length;
  const archived = rows.filter((r) => r.status === '已归档').length;
  const drafts = rows.filter((r) => r.status === '草稿').length;
  return { pendingSign, safety, archived, drafts, total: rows.length };
}

export function seedAiRiskHits(): AiRiskHit[] {
  return [
    {
      id: 'RK-20260416-01',
      patientId: 'P20260415008',
      patientName: '刘洋',
      score: 82,
      level: '高',
      factors: 'Scr 周环比↑、Tac 谷浓度偏低、随访逾期',
      ruleHits: 'R-SCR-DELTA-15 | R-TAC-LOW | R-FU-OVERDUE',
      evaluatedAt: '2026-04-16 08:00',
      reviewer: '—'
    },
    {
      id: 'RK-20260416-02',
      patientId: 'P20260415015',
      patientName: '宋雨',
      score: 64,
      level: '中',
      factors: '血压控制欠佳、依从性记录差',
      ruleHits: 'R-BP-HIGH | R-ADHERENCE',
      evaluatedAt: '2026-04-16 07:30',
      reviewer: '王浩'
    },
    {
      id: 'RK-20260415-03',
      patientId: 'P20260415001',
      patientName: '王芳',
      score: 28,
      level: '低',
      factors: '指标稳定、随访按时',
      ruleHits: '—',
      evaluatedAt: '2026-04-15 18:00',
      reviewer: '李敏'
    }
  ];
}

export function aiRiskKpis(rows: AiRiskHit[]) {
  const high = rows.filter((r) => r.level === '高').length;
  const mid = rows.filter((r) => r.level === '中').length;
  const unreviewed = rows.filter((r) => r.reviewer === '—').length;
  const avgScore = Math.round(rows.reduce((s, r) => s + r.score, 0) / Math.max(1, rows.length));
  return { high, mid, unreviewed, avgScore, total: rows.length };
}

/** 异常报警 */
export type AiAlertRow = {
  id: string;
  patientId: string;
  patientName: string;
  metric: string;
  breach: string;
  severity: '高' | '中' | '低';
  channel: string;
  status: '待处置' | '已确认' | '误报';
  firedAt: string;
};

export function seedAiAlerts(): AiAlertRow[] {
  return [
    {
      id: 'AL-20260416-01',
      patientId: 'P20260415008',
      patientName: '刘洋',
      metric: 'Scr 周环比',
      breach: '+18% > 阈值15%',
      severity: '高',
      channel: '随访医师+护士长',
      status: '待处置',
      firedAt: '2026-04-16 09:10'
    },
    {
      id: 'AL-20260416-02',
      patientId: 'P20260415015',
      patientName: '宋雨',
      metric: 'Tac 谷浓度',
      breach: '4.2 < 下限5.0',
      severity: '中',
      channel: '主管医师',
      status: '已确认',
      firedAt: '2026-04-16 08:40'
    },
    {
      id: 'AL-20260415-03',
      patientId: 'P20260415001',
      patientName: '王芳',
      metric: '收缩压 7日均值',
      breach: '142 > 阈值135',
      severity: '低',
      channel: '企业微信',
      status: '误报',
      firedAt: '2026-04-15 19:00'
    }
  ];
}

export function aiAlertKpis(rows: AiAlertRow[]) {
  const pending = rows.filter((r) => r.status === '待处置').length;
  const high = rows.filter((r) => r.severity === '高').length;
  const falsePositive = rows.filter((r) => r.status === '误报').length;
  const confirmed = rows.filter((r) => r.status === '已确认').length;
  return { pending, high, falsePositive, confirmed, total: rows.length };
}

/** 指标解读 */
export type AiInterpretRow = {
  id: string;
  patientId: string;
  patientName: string;
  indicator: string;
  valueText: string;
  reference: string;
  aiSummary: string;
  status: '待复核' | '已发布' | '已驳回';
  updatedAt: string;
};

export function seedAiInterprets(): AiInterpretRow[] {
  return [
    {
      id: 'IN-20260416-01',
      patientId: 'P20260415008',
      patientName: '刘洋',
      indicator: 'Scr',
      valueText: '156 μmol/L',
      reference: '参考44–133',
      aiSummary: '较基线上升，需结合尿量与免疫抑制剂浓度评估急性肾损伤风险。',
      status: '待复核',
      updatedAt: '2026-04-16 10:05'
    },
    {
      id: 'IN-20260416-02',
      patientId: 'P20260415012',
      patientName: '张蕾',
      indicator: '他克莫司谷浓度',
      valueText: '6.8 ng/mL',
      reference: '目标 5–8',
      aiSummary: '处于目标窗内，建议维持方案并关注药物相互作用与肝功能。',
      status: '已发布',
      updatedAt: '2026-04-16 09:20'
    },
    {
      id: 'IN-20260415-03',
      patientId: 'P20260415001',
      patientName: '王芳',
      indicator: 'eGFR (CKD-EPI)',
      valueText: '58 mL/min/1.73m²',
      reference: '个体基线 62',
      aiSummary: '轻度下降，可能与容量或化验误差相关，建议复查并核对用药。',
      status: '已驳回',
      updatedAt: '2026-04-15 16:30'
    }
  ];
}

export function aiInterpretKpis(rows: AiInterpretRow[]) {
  const pending = rows.filter((r) => r.status === '待复核').length;
  const published = rows.filter((r) => r.status === '已发布').length;
  const rejected = rows.filter((r) => r.status === '已驳回').length;
  const needDoctor = rows.filter((r) => r.aiSummary.includes('肾') || r.aiSummary.includes('浓度')).length;
  return { pending, published, rejected, needDoctor, total: rows.length };
}

/** AI 干预记录 */
export type AiInterveneRow = {
  id: string;
  patientId: string;
  patientName: string;
  context: string;
  aiProposal: string;
  adopted: '采纳' | '部分采纳' | '未采纳';
  reviewer: string;
  decidedAt: string;
};

export function seedAiIntervenes(): AiInterveneRow[] {
  return [
    {
      id: 'IV-20260416-01',
      patientId: 'P20260415008',
      patientName: '刘洋',
      context: '随访逾期 + Scr 波动',
      aiProposal: '建议 48h 内复查肾功能并电话随访用药依从性',
      adopted: '采纳',
      reviewer: '王浩',
      decidedAt: '2026-04-16 09:00'
    },
    {
      id: 'IV-20260416-02',
      patientId: 'P20260415015',
      patientName: '宋雨',
      context: '血压控制欠佳',
      aiProposal: '建议调整降压方案并记录家庭血压7 日',
      adopted: '部分采纳',
      reviewer: '李敏',
      decidedAt: '2026-04-16 08:15'
    },
    {
      id: 'IV-20260415-03',
      patientId: 'P20260415001',
      patientName: '王芳',
      context: '化验解读争议',
      aiProposal: '建议暂缓调药，等待门诊评估',
      adopted: '未采纳',
      reviewer: '周洋',
      decidedAt: '2026-04-15 17:40'
    }
  ];
}

export function aiInterveneKpis(rows: AiInterveneRow[]) {
  const full = rows.filter((r) => r.adopted === '采纳').length;
  const partial = rows.filter((r) => r.adopted === '部分采纳').length;
  const none = rows.filter((r) => r.adopted === '未采纳').length;
  const recent = rows.filter((r) => r.decidedAt.startsWith('2026-04-16')).length;
  return { full, partial, none, recent, total: rows.length };
}
