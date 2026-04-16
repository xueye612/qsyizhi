/**
 * 随访任务模拟数据 — 字段对齐常见移植/慢病随访工作台（计划日、渠道、责任人、风险分层）
 */
export type FollowTaskStatus = '待执行' | '进行中' | '已完成' | '已逾期' | '已取消';

export type FollowTaskRow = {
  id: string;
  patientId: string;
  patientName: string;
  visitId: string;
  surgeryDate: string;
  planDate: string;
  taskType: '电话随访' | '门诊复查' | '微信问卷' | '上门访视';
  owner: string;
  status: FollowTaskStatus;
  priority: '高' | '中' | '低';
  riskTag: '稳定' | '关注' | '高危';
  lastContact: string;
};

const owners = ['李敏（随访护士）', '王浩（主治医师）', '陈静（个案管理师）', '赵磊（住院总）'];

export function seedFollowTasks(): FollowTaskRow[] {
  const base: FollowTaskRow[] = [
    {
      id: 'FT-20260416-001',
      patientId: 'P20260415008',
      patientName: '刘洋',
      visitId: 'V2026-0416-01',
      surgeryDate: '2026-02-10',
      planDate: '2026-04-16',
      taskType: '门诊复查',
      owner: owners[1],
      status: '待执行',
      priority: '高',
      riskTag: '高危',
      lastContact: '2026-04-10 电话未接通'
    },
    {
      id: 'FT-20260416-002',
      patientId: 'P20260415012',
      patientName: '张蕾',
      visitId: 'V2026-0416-02',
      surgeryDate: '2026-01-22',
      planDate: '2026-04-15',
      taskType: '电话随访',
      owner: owners[0],
      status: '已逾期',
      priority: '高',
      riskTag: '关注',
      lastContact: '2026-04-08 Scr 略升'
    },
    {
      id: 'FT-20260416-003',
      patientId: 'P20260415003',
      patientName: '李明',
      visitId: 'V2026-0416-03',
      surgeryDate: '2025-11-05',
      planDate: '2026-04-17',
      taskType: '微信问卷',
      owner: owners[2],
      status: '进行中',
      priority: '中',
      riskTag: '稳定',
      lastContact: '问卷已推送'
    },
    {
      id: 'FT-20260416-004',
      patientId: 'P20260415019',
      patientName: '任欣',
      visitId: 'V2026-0416-04',
      surgeryDate: '2026-03-01',
      planDate: '2026-04-14',
      taskType: '上门访视',
      owner: owners[0],
      status: '已完成',
      priority: '中',
      riskTag: '关注',
      lastContact: '2026-04-14 访视完成'
    },
    {
      id: 'FT-20260416-005',
      patientId: 'P20260415007',
      patientName: '郑敏',
      visitId: 'V2026-0416-05',
      surgeryDate: '2026-02-28',
      planDate: '2026-04-18',
      taskType: '门诊复查',
      owner: owners[3],
      status: '待执行',
      priority: '中',
      riskTag: '稳定',
      lastContact: '—'
    },
    {
      id: 'FT-20260416-006',
      patientId: 'P20260415015',
      patientName: '宋雨',
      visitId: 'V2026-0416-06',
      surgeryDate: '2025-12-12',
      planDate: '2026-04-12',
      taskType: '电话随访',
      owner: owners[1],
      status: '已逾期',
      priority: '高',
      riskTag: '高危',
      lastContact: 'Tac 浓度偏低待复测'
    },
    {
      id: 'FT-20260416-007',
      patientId: 'P20260415001',
      patientName: '王芳',
      visitId: 'V2026-0416-07',
      surgeryDate: '2026-04-01',
      planDate: '2026-04-19',
      taskType: '微信问卷',
      owner: owners[2],
      status: '待执行',
      priority: '低',
      riskTag: '稳定',
      lastContact: '—'
    },
    {
      id: 'FT-20260416-008',
      patientId: 'P20260415011',
      patientName: '马超',
      visitId: 'V2026-0416-08',
      surgeryDate: '2026-01-15',
      planDate: '2026-04-16',
      taskType: '门诊复查',
      owner: owners[1],
      status: '进行中',
      priority: '高',
      riskTag: '关注',
      lastContact: '已到院抽血'
    }
  ];
  return base;
}

export function followTaskKpis(rows: FollowTaskRow[]) {
  const today = '2026-04-16';
  const pendingToday = rows.filter((r) => r.planDate === today && (r.status === '待执行' || r.status === '进行中')).length;
  const overdue = rows.filter((r) => r.status === '已逾期').length;
  const doneWeek = rows.filter((r) => r.status === '已完成').length;
  const highRiskOpen = rows.filter((r) => r.riskTag === '高危' && r.status !== '已完成' && r.status !== '已取消').length;
  return { pendingToday, overdue, doneWeek, highRiskOpen, total: rows.length };
}
