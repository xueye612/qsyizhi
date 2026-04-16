/** 个体化监护/复查计划 — 周期、下次触达日、路径状态（演示） */
export type PlanStatus = '生效中' | '待启动' | '已暂停' | '已结束';

export type FollowPlanRow = {
  id: string;
  patientId: string;
  patientName: string;
  planName: string;
  cycle: string;
  nextReview: string;
  owner: string;
  status: PlanStatus;
  pathway: '标准移植路径' | '高危加强路径' | '合并糖尿病路径';
  lastReview: string;
};

export function seedFollowPlans(): FollowPlanRow[] {
  return [
    {
      id: 'PL-2026-0416-01',
      patientId: 'P20260415008',
      patientName: '刘洋',
      planName: '术后 3–6 月密集复查',
      cycle: '每 2 周',
      nextReview: '2026-04-20',
      owner: '李敏',
      status: '生效中',
      pathway: '高危加强路径',
      lastReview: '2026-04-06'
    },
    {
      id: 'PL-2026-0416-02',
      patientId: 'P20260415001',
      patientName: '王芳',
      planName: '稳定期长程随访',
      cycle: '每 4 周',
      nextReview: '2026-05-10',
      owner: '陈静',
      status: '生效中',
      pathway: '标准移植路径',
      lastReview: '2026-04-01'
    },
    {
      id: 'PL-2026-0416-03',
      patientId: 'P20260415012',
      patientName: '张蕾',
      planName: '肾功能波动加强监测',
      cycle: '每周',
      nextReview: '2026-04-17',
      owner: '王浩',
      status: '生效中',
      pathway: '高危加强路径',
      lastReview: '2026-04-08'
    },
    {
      id: 'PL-2026-0416-04',
      patientId: 'P20260415015',
      patientName: '宋雨',
      planName: '合并 2 型 DM 代谢管理',
      cycle: '每 3 周',
      nextReview: '2026-04-22',
      owner: '赵磊',
      status: '待启动',
      pathway: '合并糖尿病路径',
      lastReview: '—'
    },
    {
      id: 'PL-2026-0416-05',
      patientId: 'P20260415003',
      patientName: '李明',
      planName: '免疫抑制剂浓度优化期',
      cycle: '每 10 天',
      nextReview: '2026-04-18',
      owner: '王浩',
      status: '已暂停',
      pathway: '标准移植路径',
      lastReview: '2026-03-28'
    }
  ];
}

export function followPlanKpis(rows: FollowPlanRow[]) {
  const active = rows.filter((r) => r.status === '生效中').length;
  const dueSoon = rows.filter((r) => r.nextReview <= '2026-04-18' && r.status === '生效中').length;
  const highPath = rows.filter((r) => r.pathway === '高危加强路径' && r.status === '生效中').length;
  const pendingStart = rows.filter((r) => r.status === '待启动').length;
  return { active, dueSoon, highPath, pendingStart, total: rows.length };
}
