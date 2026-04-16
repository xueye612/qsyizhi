export type DonorStatus = '待审' | '已通过' | '已拒绝';

export type Donor = {
  id: string;
  code: string;
  source: 'DCD' | '活体';
  blood: 'A' | 'B' | 'O' | 'AB';
  age: number;
  hla: string;
  cmv: '阴性' | '阳性' | '未知';
  status: DonorStatus;
  updatedAt: string;
  note?: string;
};

function isoHoursAgo(h: number) {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

export function donorSummaryText(d: Donor) {
  return `${d.source} · 血型${d.blood}`;
}

export function seedDonors(): Donor[] {
  const base: Omit<Donor, 'id' | 'updatedAt'>[] = [
    { code: 'D20260415001', source: 'DCD', blood: 'O', age: 34, hla: 'A*02:01 / B*40:01 / DRB1*09:01', cmv: '阴性', status: '已通过', note: '脑死亡捐献，器官获取顺利' },
    { code: 'D20260415002', source: 'DCD', blood: 'A', age: 41, hla: 'A*11:01 / B*15:01 / DRB1*12:01', cmv: '阳性', status: '待审', note: '等待伦理与实验室复核' },
    { code: 'D20260415003', source: '活体', blood: 'B', age: 52, hla: 'A*24:02 / B*44:03 / DRB1*07:01', cmv: '阴性', status: '已通过', note: '亲属供体，术前评估完成' },
    { code: 'D20260415004', source: 'DCD', blood: 'AB', age: 29, hla: 'A*01:01 / B*08:01 / DRB1*03:01', cmv: '未知', status: '待审', note: '血清学待补全' },
    { code: 'D20260415005', source: '活体', blood: 'O', age: 38, hla: 'A*03:01 / B*35:01 / DRB1*11:01', cmv: '阴性', status: '已拒绝', note: '医学禁忌（模拟）' },
    { code: 'D20260415006', source: 'DCD', blood: 'A', age: 46, hla: 'A*33:01 / B*14:01 / DRB1*13:01', cmv: '阴性', status: '已通过', note: '冷缺血时间可控' },
    { code: 'D20260415007', source: 'DCD', blood: 'B', age: 31, hla: 'A*02:06 / B*51:01 / DRB1*15:01', cmv: '阳性', status: '待审', note: '需感染科会诊意见' },
    { code: 'D20260415008', source: '活体', blood: 'O', age: 44, hla: 'A*02:03 / B*13:01 / DRB1*04:01', cmv: '阴性', status: '已通过', note: '配偶供体' }
  ];

  return base.map((b, i) => ({
    ...b,
    id: `donor-${i + 1}`,
    updatedAt: isoHoursAgo(i * 3 + (i % 5))
  }));
}
