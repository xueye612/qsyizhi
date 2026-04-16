export type Lab = {
  ts: string;
  scr?: number | null;
  egfr?: number | null;
  tac?: number | null;
  prot?: number | null;
};

export type Patient = {
  id: string;
  name: string;
  sex?: string;
  age?: number;
  status?: '术前' | '术后' | string;
  surgeryDate?: string;
  donorInfo?: string;
  flags?: { abnormal?: boolean };
  updatedAt?: string;
  records?: { labs?: Lab[] };
};

export type RiskLevel = 'high' | 'mid' | 'low';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function mkLabs(baseScr: number, baseEgfr: number, baseTac: number, baseProt: number, trend: -1 | 0 | 1) {
  const scr2 = Math.max(60, Math.round(baseScr + trend * 8));
  const egfr2 = Math.max(25, Math.round(baseEgfr - trend * 4));
  const tac2 = Math.max(3.2, Math.round((baseTac + (trend === 1 ? -0.6 : trend === -1 ? 0.4 : 0)) * 10) / 10);
  const prot2 = Math.max(1, Math.round((baseProt + (trend === 1 ? 2.2 : trend === -1 ? -1.2 : 0)) * 10) / 10);
  return [
    { ts: daysAgo(3), scr: baseScr, egfr: baseEgfr, tac: baseTac, prot: baseProt },
    { ts: daysAgo(1), scr: scr2, egfr: egfr2, tac: tac2, prot: prot2 }
  ];
}

export function getLastLab(p: Patient) {
  const labs = p.records?.labs || [];
  return labs.length ? labs[labs.length - 1] : null;
}

export function riskLevelOf(p: Patient): RiskLevel {
  const ab = !!p.flags?.abnormal;
  const lab = getLastLab(p);
  const scr = typeof lab?.scr === 'number' ? lab.scr : null;
  const egfr = typeof lab?.egfr === 'number' ? lab.egfr : null;
  if (ab || (scr != null && scr >= 134) || (egfr != null && egfr < 45)) return 'high';
  if ((scr != null && scr >= 115) || (egfr != null && egfr < 60)) return 'mid';
  return 'low';
}

export function seedPatients(): Patient[] {
  const names = [
    ['王芳', '女'],
    ['赵玲', '女'],
    ['李明', '男'],
    ['陈凯', '男'],
    ['孙倩', '女'],
    ['周强', '男'],
    ['刘洋', '男'],
    ['郑敏', '女'],
    ['何静', '女'],
    ['黄磊', '男'],
    ['张蕾', '女'],
    ['马超', '男'],
    ['宋雨', '女'],
    ['徐晨', '男'],
    ['蒋雪', '女'],
    ['彭浩', '男'],
    ['唐琳', '女'],
    ['曹军', '男'],
    ['任欣', '女'],
    ['沈峰', '男']
  ] as const;

  const donors = ['DCD · 血型O', 'DCD · 血型A', 'DCD · 血型B', '活体 · 亲属供体', '活体 · 配偶', '活体 · 朋友'];

  const list: Patient[] = names.map(([nm, sex], i) => {
    const id = `P20260415${String(i + 1).padStart(3, '0')}`;
    const age = 24 + ((i * 3) % 43);
    const status = i % 6 === 0 ? '术前' : '术后';
    const surgeryDate = status === '术前' ? '' : daysAgo(10 + (i % 45));
    const donorInfo = donors[i % donors.length];
    const trend = (i % 5 === 0 ? 1 : i % 7 === 0 ? -1 : 0) as -1 | 0 | 1;
    const baseScr = 78 + (i % 9) * 6 + (trend === 1 ? 18 : 0);
    const baseEgfr = 78 - (i % 8) * 4 - (trend === 1 ? 10 : 0);
    const baseTac = 6.2 + (i % 6) * 0.4 - (trend === 1 ? 1.0 : 0);
    const baseProt = 4.8 + (i % 6) * 1.1 + (trend === 1 ? 3.0 : 0);
    const labs = mkLabs(Math.round(baseScr), Math.round(baseEgfr), Math.round(baseTac * 10) / 10, Math.round(baseProt * 10) / 10, trend);
    const last = labs[labs.length - 1];
    const abnormal = trend === 1 || (last.scr ?? 0) >= 115 || (last.egfr ?? 999) < 60;

    return {
      id,
      name: nm,
      sex,
      age,
      status,
      surgeryDate: surgeryDate || undefined,
      donorInfo,
      flags: { abnormal },
      // 人为拉开更新时间，便于“最近更新”工作台排序/时间轴展示
      updatedAt: new Date(Date.now() - i * 55 * 60 * 1000 - (i % 9) * 7 * 60 * 1000).toISOString(),
      records: { labs }
    };
  });

  // 明显高风险样本
  list[2].records = { labs: mkLabs(128, 48, 8.2, 12.9, 1) };
  list[2].flags = { abnormal: true };
  list[7].records = { labs: mkLabs(142, 42, 4.6, 15.1, 1) };
  list[7].flags = { abnormal: true };
  list[11].records = { labs: mkLabs(118, 58, 4.4, 10.8, 1) };
  list[11].flags = { abnormal: true };

  return list;
}

