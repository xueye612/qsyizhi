/** 科研分析演示数据 */

export type ResearchDbRow = {
  id: string;
  name: string;
  rowCount: number;
  sensitivity: '公开' | '受限' | '核心';
  lastAudit: string;
};

export type ResearchFilterRow = {
  id: string;
  cohortName: string;
  inclusion: string;
  n: number;
  updatedAt: string;
};

export type ResearchSurveyRow = {
  id: string;
  title: string;
  sent: number;
  responseRate: number;
  status: '收集中' | '已关闭' | '分析中';
};

export type ResearchExportRow = {
  id: string;
  jobId: string;
  format: string;
  watermark: string;
  status: '排队' | '生成中' | '可下载';
  createdAt: string;
};

export type ResearchStatsRow = {
  id: string;
  analysis: string;
  chartType: string;
  owner: string;
  refreshedAt: string;
};

export function seedResearchDb(): ResearchDbRow[] {
  return [
    { id: 'RDB-01', name: '肾移植随访脱敏库', rowCount: 12840, sensitivity: '受限', lastAudit: '2026-04-10' },
    { id: 'RDB-02', name: '免疫抑制剂浓度子集', rowCount: 5620, sensitivity: '核心', lastAudit: '2026-04-15' },
    { id: 'RDB-03', name: '化验指标宽表（演示）', rowCount: 99300, sensitivity: '公开', lastAudit: '2026-03-28' }
  ];
}

export function researchDbKpis(rows: ResearchDbRow[]) {
  const restricted = rows.filter((r) => r.sensitivity !== '公开').length;
  const rowsSum = rows.reduce((s, r) => s + r.rowCount, 0);
  const recentAudit = rows.filter((r) => r.lastAudit.startsWith('2026-04')).length;
  return { restricted, rowsSum, recentAudit, sets: rows.length, total: rows.length };
}

export function seedResearchFilter(): ResearchFilterRow[] {
  return [
    { id: 'RF-01', cohortName: '术后90天肾功能稳定', inclusion: 'eGFR≥45 且无急性排斥', n: 412, updatedAt: '2026-04-16' },
    { id: 'RF-02', cohortName: '高龄受体亚组', inclusion: '年龄≥60', n: 128, updatedAt: '2026-04-14' },
    { id: 'RF-03', cohortName: 'CMV 阳性供体匹配', inclusion: '供体CMV+ & 受体-', n: 56, updatedAt: '2026-04-12' }
  ];
}

export function researchFilterKpis(rows: ResearchFilterRow[]) {
  const nSum = rows.reduce((s, r) => s + r.n, 0);
  const large = rows.filter((r) => r.n >= 200).length;
  const fresh = rows.filter((r) => r.updatedAt >= '2026-04-15').length;
  return { nSum, large, fresh, cohorts: rows.length, total: rows.length };
}

export function seedResearchSurvey(): ResearchSurveyRow[] {
  return [
    { id: 'RS-01', title: '生活质量 SF-36', sent: 220, responseRate: 0.62, status: '收集中' },
    { id: 'RS-02', title: '用药依从性简表', sent: 180, responseRate: 0.71, status: '已关闭' },
    { id: 'RS-03', title: '营养筛查', sent: 95, responseRate: 0.54, status: '分析中' }
  ];
}

export function researchSurveyKpis(rows: ResearchSurveyRow[]) {
  const collecting = rows.filter((r) => r.status === '收集中').length;
  const avgRate = Math.round((rows.reduce((s, r) => s + r.responseRate, 0) / Math.max(1, rows.length)) * 100);
  const low = rows.filter((r) => r.responseRate < 0.6).length;
  return { collecting, avgRatePct: avgRate, low, total: rows.length };
}

export function seedResearchExport(): ResearchExportRow[] {
  return [
    { id: 'RE-01', jobId: 'EX-20260416-01', format: 'CSV', watermark: '内部科研-可追溯', status: '可下载', createdAt: '2026-04-16 08:00' },
    { id: 'RE-02', jobId: 'EX-20260415-02', format: 'SAS7BDAT', watermark: '受限数据集', status: '生成中', createdAt: '2026-04-15 19:10' },
    { id: 'RE-03', jobId: 'EX-20260414-03', format: 'Parquet', watermark: '脱敏批次A', status: '排队', createdAt: '2026-04-14 11:00' }
  ];
}

export function researchExportKpis(rows: ResearchExportRow[]) {
  const ready = rows.filter((r) => r.status === '可下载').length;
  const busy = rows.filter((r) => r.status === '生成中' || r.status === '排队').length;
  const withWm = rows.filter((r) => r.watermark.length > 0).length;
  return { ready, busy, withWm, total: rows.length };
}

export function seedResearchStats(): ResearchStatsRow[] {
  return [
    { id: 'RST-01', analysis: 'eGFR 轨迹分组比较', chartType: '箱线图', owner: '统计室-陈静', refreshedAt: '2026-04-16 07:30' },
    { id: 'RST-02', analysis: '排斥事件发生率', chartType: 'KM 曲线', owner: '统计室-赵磊', refreshedAt: '2026-04-15 16:00' },
    { id: 'RST-03', analysis: '化验指标相关性热图', chartType: '热图', owner: '统计室-陈静', refreshedAt: '2026-04-14 09:45' }
  ];
}

export function researchStatsKpis(rows: ResearchStatsRow[]) {
  const today = rows.filter((r) => r.refreshedAt.startsWith('2026-04-16')).length;
  const km = rows.filter((r) => r.chartType.includes('KM')).length;
  return { today, km, reports: rows.length, total: rows.length };
}
