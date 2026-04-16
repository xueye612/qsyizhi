/** 结算中心相关演示数据 */

export type SettlePayRow = {
  id: string;
  batch: string;
  beneficiaries: number;
  amountWan: number;
  status: '待拨付' | '处理中' | '已完成';
  plannedAt: string;
};

export type SettleReceiverRow = {
  id: string;
  patientId: string;
  patientName: string;
  feeType: string;
  amountYuan: number;
  period: string;
  status: '待结' | '已结' | '争议';
};

export type SettleFundRow = {
  id: string;
  fundName: string;
  flowType: '入金' | '出金' | '冻结';
  amountWan: number;
  balanceWan: number;
  at: string;
};

export type SettleReconRow = {
  id: string;
  period: string;
  bankTotal: string;
  sysTotal: string;
  diffYuan: number;
  status: '待调账' | '已平账' | '复核中';
};

export function seedSettlePay(): SettlePayRow[] {
  return [
    { id: 'SP-01', batch: 'B-202604-03', beneficiaries: 12, amountWan: 186.4, status: '待拨付', plannedAt: '2026-04-18' },
    { id: 'SP-02', batch: 'B-202604-02', beneficiaries: 9, amountWan: 142.1, status: '处理中', plannedAt: '2026-04-16' },
    { id: 'SP-03', batch: 'B-202603-09', beneficiaries: 15, amountWan: 210.0, status: '已完成', plannedAt: '2026-03-28' }
  ];
}

export function settlePayKpis(rows: SettlePayRow[]) {
  const pending = rows.filter((r) => r.status === '待拨付').length;
  const doing = rows.filter((r) => r.status === '处理中').length;
  const done = rows.filter((r) => r.status === '已完成').length;
  const sum = rows.reduce((s, r) => s + r.amountWan, 0);
  return { pending, doing, done, sumWan: Math.round(sum * 10) / 10, total: rows.length };
}

export function seedSettleReceiver(): SettleReceiverRow[] {
  return [
    { id: 'SR-01', patientId: 'P20260415008', patientName: '刘洋', feeType: '住院', amountYuan: 42800, period: '2026-04', status: '待结' },
    { id: 'SR-02', patientId: 'P20260415001', patientName: '王芳', feeType: '门诊', amountYuan: 3200, period: '2026-04', status: '已结' },
    { id: 'SR-03', patientId: 'P20260415012', patientName: '张蕾', feeType: '住院', amountYuan: 51200, period: '2026-03', status: '争议' }
  ];
}

export function settleReceiverKpis(rows: SettleReceiverRow[]) {
  const open = rows.filter((r) => r.status === '待结').length;
  const closed = rows.filter((r) => r.status === '已结').length;
  const dispute = rows.filter((r) => r.status === '争议').length;
  const sum = rows.reduce((s, r) => s + r.amountYuan, 0);
  return { open, closed, dispute, sumYuan: sum, total: rows.length };
}

export function seedSettleFund(): SettleFundRow[] {
  return [
    { id: 'SF-01', fundName: '移植专项', flowType: '入金', amountWan: 50, balanceWan: 320.5, at: '2026-04-16 09:00' },
    { id: 'SF-02', fundName: '移植专项', flowType: '出金', amountWan: 30, balanceWan: 270.5, at: '2026-04-15 15:20' },
    { id: 'SF-03', fundName: '风险准备金', flowType: '冻结', amountWan: 10, balanceWan: 88.2, at: '2026-04-14 11:05' }
  ];
}

export function settleFundKpis(rows: SettleFundRow[]) {
  const inflow = rows.filter((r) => r.flowType === '入金').length;
  const outflow = rows.filter((r) => r.flowType === '出金').length;
  const frozen = rows.filter((r) => r.flowType === '冻结').length;
  const bal = rows.length ? rows[rows.length - 1].balanceWan : 0;
  return { inflow, outflow, frozen, lastBalanceWan: bal, total: rows.length };
}

export function seedSettleRecon(): SettleReconRow[] {
  return [
    { id: 'RC-01', period: '2026-04-上', bankTotal: '1,204,300.00', sysTotal: '1,204,180.00', diffYuan: 120, status: '待调账' },
    { id: 'RC-02', period: '2026-03-下', bankTotal: '986,020.00', sysTotal: '986,020.00', diffYuan: 0, status: '已平账' },
    { id: 'RC-03', period: '2026-03-上', bankTotal: '1,010,000.00', sysTotal: '1,009,850.00', diffYuan: 150, status: '复核中' }
  ];
}

export function settleReconKpis(rows: SettleReconRow[]) {
  const open = rows.filter((r) => r.status === '待调账').length;
  const ok = rows.filter((r) => r.status === '已平账').length;
  const review = rows.filter((r) => r.status === '复核中').length;
  const diffSum = rows.reduce((s, r) => s + Math.abs(r.diffYuan), 0);
  return { open, ok, review, diffSum, total: rows.length };
}
