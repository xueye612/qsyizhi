/** 指标趋势监测 + 数据归档批次（演示） */

export type TrendRow = {
  id: string;
  patientId: string;
  patientName: string;
  indicator: 'Scr' | 'eGFR' | 'Tac' | 'Hb';
  unit: string;
  baseline: number;
  latest: number;
  deltaPct: number;
  trend: '上升' | '平台' | '下降';
  seriesHint: string;
  lastLabDate: string;
  alert: '无' | '关注' | '预警';
};

export type ArchiveRow = {
  id: string;
  batchName: string;
  archiveDate: string;
  recordCount: number;
  storageTier: '热' | '温' | '冷';
  retentionYears: number;
  legalHold: boolean;
  status: '校验中' | '已封存' | '可回迁';
};

export function seedTrendRows(): TrendRow[] {
  return [
    {
      id: 'TR-01',
      patientId: 'P20260415008',
      patientName: '刘洋',
      indicator: 'Scr',
      unit: 'μmol/L',
      baseline: 95,
      latest: 118,
      deltaPct: 24.2,
      trend: '上升',
      seriesHint: '95→102→110→118（近4次）',
      lastLabDate: '2026-04-15',
      alert: '预警'
    },
    {
      id: 'TR-02',
      patientId: 'P20260415012',
      patientName: '张蕾',
      indicator: 'eGFR',
      unit: 'ml/min',
      baseline: 58,
      latest: 52,
      deltaPct: -10.3,
      trend: '下降',
      seriesHint: '58→56→54→52',
      lastLabDate: '2026-04-14',
      alert: '关注'
    },
    {
      id: 'TR-03',
      patientId: 'P20260415001',
      patientName: '王芳',
      indicator: 'Tac',
      unit: 'ng/mL',
      baseline: 6.2,
      latest: 6.4,
      deltaPct: 3.2,
      trend: '平台',
      seriesHint: '6.1→6.2→6.3→6.4',
      lastLabDate: '2026-04-12',
      alert: '无'
    },
    {
      id: 'TR-04',
      patientId: 'P20260415015',
      patientName: '宋雨',
      indicator: 'Scr',
      unit: 'μmol/L',
      baseline: 132,
      latest: 128,
      deltaPct: -3.0,
      trend: '平台',
      seriesHint: '138→135→130→128',
      lastLabDate: '2026-04-13',
      alert: '关注'
    }
  ];
}

export function trendKpis(rows: TrendRow[]) {
  const monitored = rows.length;
  const warn = rows.filter((r) => r.alert === '预警').length;
  const worsen = rows.filter((r) => (r.indicator === 'Scr' && r.deltaPct > 15) || (r.indicator === 'eGFR' && r.deltaPct < -10)).length;
  const complete = 94;
  return { monitored, warn, worsen, complete };
}

export function seedArchiveRows(): ArchiveRow[] {
  return [
    {
      id: 'AR-2026-Q1-01',
      batchName: '2026Q1-检验报告归档',
      archiveDate: '2026-04-10',
      recordCount: 128_400,
      storageTier: '冷',
      retentionYears: 15,
      legalHold: false,
      status: '已封存'
    },
    {
      id: 'AR-2026-Q1-02',
      batchName: '2026Q1-影像元数据',
      archiveDate: '2026-04-12',
      recordCount: 45_200,
      storageTier: '温',
      retentionYears: 15,
      legalHold: true,
      status: '校验中'
    },
    {
      id: 'AR-2025-FY-09',
      batchName: '2025财年-病历 PDF',
      archiveDate: '2026-01-20',
      recordCount: 892_000,
      storageTier: '冷',
      retentionYears: 30,
      legalHold: false,
      status: '可回迁'
    }
  ];
}

export function archiveKpis(rows: ArchiveRow[]) {
  const batches = rows.length;
  const coldShare = rows.filter((r) => r.storageTier === '冷').length;
  const legalHold = rows.filter((r) => r.legalHold).length;
  const pendingVerify = rows.filter((r) => r.status === '校验中').length;
  return { batches, coldShare, legalHold, pendingVerify, totalRecords: rows.reduce((s, r) => s + r.recordCount, 0) };
}
