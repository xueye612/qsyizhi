/** 供体家属与审核流程（演示） */

export type DonorFamilyRow = {
  id: string;
  donorCode: string;
  contactName: string;
  relation: string;
  phone: string;
  consentDoc: string;
  status: '完整' | '待补' | '过期';
};

export type DonorAuditRow = {
  id: string;
  donorCode: string;
  stage: string;
  owner: string;
  dueAt: string;
  status: '进行中' | '已通过' | '阻塞';
};

export function seedDonorFamily(): DonorFamilyRow[] {
  return [
    {
      id: 'DF-01',
      donorCode: 'D20260415001',
      contactName: '刘敏',
      relation: '配偶',
      phone: '138****1201',
      consentDoc: 'IC-2026-0412',
      status: '完整'
    },
    {
      id: 'DF-02',
      donorCode: 'D20260415002',
      contactName: '陈刚',
      relation: '兄弟',
      phone: '139****8832',
      consentDoc: '—',
      status: '待补'
    },
    {
      id: 'DF-03',
      donorCode: 'D20260415003',
      contactName: '赵莉',
      relation: '子女',
      phone: '137****5510',
      consentDoc: 'IC-2026-0398',
      status: '过期'
    }
  ];
}

export function donorFamilyKpis(rows: DonorFamilyRow[]) {
  const ok = rows.filter((r) => r.status === '完整').length;
  const need = rows.filter((r) => r.status === '待补').length;
  const expired = rows.filter((r) => r.status === '过期').length;
  const withPhone = rows.filter((r) => r.phone.includes('*')).length;
  return { ok, need, expired, withPhone, total: rows.length };
}

export function seedDonorAudit(): DonorAuditRow[] {
  return [
    {
      id: 'DA-01',
      donorCode: 'D20260415002',
      stage: '伦理初审',
      owner: '伦理办-王芳',
      dueAt: '2026-04-17 18:00',
      status: '进行中'
    },
    {
      id: 'DA-02',
      donorCode: 'D20260415001',
      stage: '医学评估汇总',
      owner: '移植组-李强',
      dueAt: '2026-04-16 12:00',
      status: '已通过'
    },
    {
      id: 'DA-03',
      donorCode: 'D20260415007',
      stage: '感染科会诊',
      owner: '感染科-周洋',
      dueAt: '2026-04-18 10:00',
      status: '阻塞'
    }
  ];
}

/** 演示基准日（与随访任务等页面一致），用于「近两日到期」口径 */
const DEMO_ANCHOR_DAY = '2026-04-16';

function dueDateKey(dueAt: string) {
  return dueAt.trim().slice(0, 10);
}

function ymdAddDays(ymd: string, days: number) {
  const [y, m, d] = ymd.split('-').map(Number);
  const t = new Date(y, m - 1, d + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

const DEMO_DUE_END = ymdAddDays(DEMO_ANCHOR_DAY, 2);

/** 截止日在 [基准日, 基准日+2 天] 内（含）的节点数 */
export function donorAuditKpis(rows: DonorAuditRow[]) {
  const ing = rows.filter((r) => r.status === '进行中').length;
  const pass = rows.filter((r) => r.status === '已通过').length;
  const block = rows.filter((r) => r.status === '阻塞').length;
  const dueSoon = rows.filter((r) => {
    const d = dueDateKey(r.dueAt);
    return d >= DEMO_ANCHOR_DAY && d <= DEMO_DUE_END;
  }).length;
  return { ing, pass, block, dueSoon, total: rows.length };
}
