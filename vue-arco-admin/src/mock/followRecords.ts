/**
 * 随访记录台账 — 对齐 HIS/随访系统常见结构化字段（渠道、生命体征摘要、用药依从、实验室关注点）
 */
export type FollowRecordRow = {
  id: string;
  patientId: string;
  patientName: string;
  visitAt: string;
  channel: '门诊' | '电话' | '微信' | '住院';
  nurse: string;
  sbp?: number;
  dbp?: number;
  weightKg?: number;
  scr?: number;
  adherence: '良好' | '一般' | '差';
  symptom: string;
  planNext: string;
  aiFlag: '无' | '指标异常' | '依从风险';
};

export function seedFollowRecords(): FollowRecordRow[] {
  return [
    {
      id: 'FR-20260415-01',
      patientId: 'P20260415008',
      patientName: '刘洋',
      visitAt: '2026-04-15 09:30',
      channel: '门诊',
      nurse: '李敏',
      sbp: 128,
      dbp: 78,
      weightKg: 62.5,
      scr: 118,
      adherence: '一般',
      symptom: '轻度水肿，乏力',
      planNext: '3 日内复查 Scr / 电解质，调整利尿剂沟通主管医师',
      aiFlag: '指标异常'
    },
    {
      id: 'FR-20260414-02',
      patientId: 'P20260415012',
      patientName: '张蕾',
      visitAt: '2026-04-14 15:10',
      channel: '电话',
      nurse: '王浩',
      adherence: '良好',
      symptom: '无不适',
      planNext: '维持当前免疫抑制方案，2周后门诊',
      aiFlag: '无'
    },
    {
      id: 'FR-20260413-03',
      patientId: 'P20260415003',
      patientName: '李明',
      visitAt: '2026-04-13 11:00',
      channel: '微信',
      nurse: '陈静',
      weightKg: 70.2,
      scr: 95,
      adherence: '良好',
      symptom: '—',
      planNext: '推送用药清单核对，完成 SF-36 量表',
      aiFlag: '无'
    },
    {
      id: 'FR-20260412-04',
      patientId: 'P20260415015',
      patientName: '宋雨',
      visitAt: '2026-04-12 08:45',
      channel: '住院',
      nurse: '赵磊',
      sbp: 142,
      dbp: 88,
      scr: 132,
      adherence: '差',
      symptom: '血压偏高，漏服他克莫司 2 次',
      planNext: '药学会诊 + Tac 谷浓度复测，床旁宣教',
      aiFlag: '依从风险'
    },
    {
      id: 'FR-20260410-05',
      patientId: 'P20260415001',
      patientName: '王芳',
      visitAt: '2026-04-10 10:20',
      channel: '门诊',
      nurse: '李敏',
      sbp: 118,
      dbp: 72,
      weightKg: 55.0,
      scr: 88,
      adherence: '良好',
      symptom: '—',
      planNext: '常规随访，4 周复查血常规肝肾功能',
      aiFlag: '无'
    },
    {
      id: 'FR-20260409-06',
      patientId: 'P20260415019',
      patientName: '任欣',
      visitAt: '2026-04-09 16:00',
      channel: '电话',
      nurse: '陈静',
      adherence: '一般',
      symptom: '胃纳差',
      planNext: '消化科会诊建议，记录进食量 3 天',
      aiFlag: '无'
    }
  ];
}

export function followRecordKpis(rows: FollowRecordRow[]) {
  const last7 = rows.length;
  const abnormalLabs = rows.filter((r) => r.aiFlag === '指标异常').length;
  const adherenceRisk = rows.filter((r) => r.aiFlag === '依从风险' || r.adherence === '差').length;
  const outpatientShare = rows.filter((r) => r.channel === '门诊').length;
  return { last7, abnormalLabs, adherenceRisk, outpatientShare, total: rows.length };
}
