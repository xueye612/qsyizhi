export type WaitlistStatus = '待配型' | '配型中' | '待复查' | '已入组手术';

export type WaitlistPatientRow = {
  id: string;
  patientId: string;
  patientName: string;
  bloodType: 'A' | 'B' | 'AB' | 'O';
  hla: string;
  waitSince: string;
  waitDays: number;
  riskLevel: '高' | '中' | '低';
  lastReviewAt: string;
  nextReviewAt: string;
  followupCycle: '半年复查';
  externalResultStatus: '待上传' | '已上传';
  internalResultStatus: '待调取' | '已调取';
  educationStatus: '待完成' | '已完成';
  status: WaitlistStatus;
  coordinator: string;
};

const coordinators = ['李敏', '王浩', '陈静', '赵磊'];

export function seedWaitlistPatients(): WaitlistPatientRow[] {
  return [
    {
      id: 'WL-0001',
      patientId: 'PT20260110',
      patientName: '王林',
      bloodType: 'O',
      hla: 'A2/B46/DR9',
      waitSince: '2025-09-10',
      waitDays: 238,
      riskLevel: '高',
      lastReviewAt: '2025-11-15',
      nextReviewAt: '2026-05-15',
      followupCycle: '半年复查',
      externalResultStatus: '待上传',
      internalResultStatus: '已调取',
      educationStatus: '待完成',
      status: '待复查',
      coordinator: coordinators[0]
    },
    {
      id: 'WL-0002',
      patientId: 'PT20260218',
      patientName: '李萍',
      bloodType: 'A',
      hla: 'A11/B40/DR4',
      waitSince: '2025-12-21',
      waitDays: 136,
      riskLevel: '中',
      lastReviewAt: '2025-12-01',
      nextReviewAt: '2026-06-01',
      followupCycle: '半年复查',
      externalResultStatus: '已上传',
      internalResultStatus: '已调取',
      educationStatus: '已完成',
      status: '待配型',
      coordinator: coordinators[1]
    },
    {
      id: 'WL-0003',
      patientId: 'PT20260307',
      patientName: '张成',
      bloodType: 'B',
      hla: 'A24/B13/DR15',
      waitSince: '2025-11-02',
      waitDays: 185,
      riskLevel: '中',
      lastReviewAt: '2025-11-28',
      nextReviewAt: '2026-05-28',
      followupCycle: '半年复查',
      externalResultStatus: '待上传',
      internalResultStatus: '待调取',
      educationStatus: '待完成',
      status: '配型中',
      coordinator: coordinators[2]
    },
    {
      id: 'WL-0004',
      patientId: 'PT20260402',
      patientName: '周倩',
      bloodType: 'AB',
      hla: 'A2/B58/DR8',
      waitSince: '2026-01-10',
      waitDays: 116,
      riskLevel: '低',
      lastReviewAt: '2025-12-16',
      nextReviewAt: '2026-06-16',
      followupCycle: '半年复查',
      externalResultStatus: '已上传',
      internalResultStatus: '已调取',
      educationStatus: '已完成',
      status: '待配型',
      coordinator: coordinators[3]
    },
    {
      id: 'WL-0005',
      patientId: 'PT20260415',
      patientName: '陈浩',
      bloodType: 'O',
      hla: 'A26/B54/DR12',
      waitSince: '2025-10-03',
      waitDays: 215,
      riskLevel: '高',
      lastReviewAt: '2025-11-11',
      nextReviewAt: '2026-05-11',
      followupCycle: '半年复查',
      externalResultStatus: '待上传',
      internalResultStatus: '待调取',
      educationStatus: '待完成',
      status: '配型中',
      coordinator: coordinators[0]
    }
  ];
}

export function waitlistKpis(rows: WaitlistPatientRow[]) {
  const high = rows.filter((r) => r.riskLevel === '高').length;
  const pendingReview = rows.filter((r) => r.status === '待复查').length;
  const externalPending = rows.filter((r) => r.externalResultStatus === '待上传').length;
  const educationPending = rows.filter((r) => r.educationStatus === '待完成').length;
  const longWait = rows.filter((r) => r.waitDays >= 180).length;
  return { total: rows.length, high, pendingReview, externalPending, educationPending, longWait };
}
