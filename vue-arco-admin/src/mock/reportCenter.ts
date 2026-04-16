/** 报告中心：上传队列与解析任务（演示） */
export type ReportUploadRow = {
  id: string;
  patientId: string;
  patientName: string;
  reportType: '检验' | '影像' | '病理' | '出院小结';
  fileName: string;
  uploadBy: string;
  uploadAt: string;
  sizeMb: number;
  virusScan: '通过' | '待扫描' | '隔离';
};

export type ReportParseRow = {
  id: string;
  sourceId: string;
  patientId: string;
  patientName: string;
  modality: string;
  ocrStatus: '待处理' | '解析中' | '成功' | '需人工';
  structFields: string;
  updatedAt: string;
};

export function seedReportUploads(): ReportUploadRow[] {
  return [
    {
      id: 'UP-20260416-01',
      patientId: 'P20260415008',
      patientName: '刘洋',
      reportType: '检验',
      fileName: '生化_20260415.pdf',
      uploadBy: '李敏',
      uploadAt: '2026-04-16 09:12:00',
      sizeMb: 1.2,
      virusScan: '通过'
    },
    {
      id: 'UP-20260416-02',
      patientId: 'P20260415012',
      patientName: '张蕾',
      reportType: '影像',
      fileName: '肺部CT_20260414.dcm.zip',
      uploadBy: '王浩',
      uploadAt: '2026-04-16 08:40:22',
      sizeMb: 210,
      virusScan: '待扫描'
    },
    {
      id: 'UP-20260415-03',
      patientId: 'P20260415001',
      patientName: '王芳',
      reportType: '出院小结',
      fileName: 'discharge_summary.pdf',
      uploadBy: '陈静',
      uploadAt: '2026-04-15 16:05:00',
      sizeMb: 0.8,
      virusScan: '通过'
    }
  ];
}

export function reportUploadKpis(rows: ReportUploadRow[]) {
  const today = rows.filter((r) => r.uploadAt.startsWith('2026-04-16')).length;
  const pendingScan = rows.filter((r) => r.virusScan !== '通过').length;
  const imaging = rows.filter((r) => r.reportType === '影像').length;
  const lab = rows.filter((r) => r.reportType === '检验').length;
  return { today, pendingScan, imaging, lab, total: rows.length };
}

export function seedReportParse(): ReportParseRow[] {
  return [
    {
      id: 'PR-20260416-01',
      sourceId: 'UP-20260416-01',
      patientId: 'P20260415008',
      patientName: '刘洋',
      modality: '检验 PDF',
      ocrStatus: '成功',
      structFields: 'Scr,eGFR,ALT,空腹血糖',
      updatedAt: '2026-04-16 09:18:33'
    },
    {
      id: 'PR-20260416-02',
      sourceId: 'UP-20260416-02',
      patientId: 'P20260415012',
      patientName: '张蕾',
      modality: '影像 DICOM',
      ocrStatus: '解析中',
      structFields: '—',
      updatedAt: '2026-04-16 09:25:10'
    },
    {
      id: 'PR-20260415-03',
      sourceId: 'UP-20260415-03',
      patientId: 'P20260415001',
      patientName: '王芳',
      modality: '文书 OCR',
      ocrStatus: '需人工',
      structFields: '出院诊断(置信度低)',
      updatedAt: '2026-04-15 17:00:01'
    }
  ];
}

export function reportParseKpis(rows: ReportParseRow[]) {
  const queue = rows.filter((r) => r.ocrStatus === '待处理' || r.ocrStatus === '解析中').length;
  const success = rows.filter((r) => r.ocrStatus === '成功').length;
  const manual = rows.filter((r) => r.ocrStatus === '需人工').length;
  const fields = rows.reduce((n, r) => n + (r.structFields === '—' ? 0 : r.structFields.split(',').length), 0);
  return { queue, success, manual, fields, total: rows.length };
}
