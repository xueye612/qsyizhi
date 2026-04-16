import type { Patient, RiskLevel } from '@/mock/patients';
import { daysAgo, getLastLab, riskLevelOf } from '@/mock/patients';

export type TaskUrgency = 'high' | 'mid' | 'low';
export type TaskKind = 'follow' | 'lab' | 'med';

export type PatientMed = {
  name: string;
  dose: string;
  anomaly?: boolean;
  reason?: string;
};

export type MedCompliance = {
  medication: number;
  diet: number;
  exercise: number;
};

export type WorkbenchPatient = Patient & {
  meds: PatientMed[];
  compliance: MedCompliance;
  /** 与风险分层一致的文字原因，供右栏展示 */
  riskReasons: string[];
};

export type WorkbenchTask = {
  id: string;
  patientId: string;
  title: string;
  desc: string;
  due: string;
  /** 用于逾期判断（日末） */
  dueAt: string;
  state: 'todo' | 'done';
  kind: TaskKind;
  urgency: TaskUrgency;
  /** AI 提示标签（表格列） */
  aiTag: string;
};

const NAMES: [string, string][] = [
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
  ['沈峰', '男'],
  ['丁悦', '女'],
  ['罗斌', '男']
];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function isoDay(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function mkLabsSeries(scr: number, egfr: number, tac: number, worsening: boolean) {
  const f = worsening ? 1 : -1;
  return [
    { ts: daysAgo(14), scr, egfr, tac, prot: 5 },
    { ts: daysAgo(10), scr: scr + 4 * f, egfr: egfr - 3 * f, tac: tac - 0.2 * f, prot: 5.5 },
    { ts: daysAgo(7), scr: scr + 8 * f, egfr: egfr - 5 * f, tac: tac - 0.35 * f, prot: 6.2 },
    { ts: daysAgo(4), scr: scr + 11 * f, egfr: egfr - 8 * f, tac: tac - 0.5 * f, prot: 7 },
    { ts: daysAgo(1), scr: scr + 14 * f, egfr: egfr - 10 * f, tac: tac - 0.65 * f, prot: 7.8 }
  ];
}

function reasonsFor(p: Patient, level: RiskLevel): string[] {
  const lab = getLastLab(p);
  const scr = lab?.scr ?? null;
  const egfr = lab?.egfr ?? null;
  const tac = lab?.tac ?? null;
  const r: string[] = [];
  if (p.flags?.abnormal) r.push('检验或临床标记为异常，需结合症状复核。');
  if (scr != null && scr >= 134) r.push(`Scr ${scr} μmol/L 超过警戒阈值，提示肾功能负荷偏高。`);
  else if (scr != null && scr >= 115) r.push(`Scr ${scr} μmol/L 呈上升趋势，建议缩短复查间隔。`);
  if (egfr != null && egfr < 45) r.push(`eGFR ${egfr} ml/min 偏低，符合高风险肾功能分层。`);
  else if (egfr != null && egfr < 60) r.push(`eGFR ${egfr} ml/min 未达理想区间。`);
  if (tac != null && (tac < 5 || tac > 10)) r.push(`Tac ${tac} ng/mL 偏离目标窗，需排查依从性与药物相互作用。`);
  if (r.length === 0) {
    if (level === 'low') r.push('关键指标相对稳定，维持当前随访节奏。');
    else r.push('综合评分处于灰区，建议结合尿蛋白与血压趋势评估。');
  }
  return r.slice(0, 4);
}

function defaultMeds(level: RiskLevel): PatientMed[] {
  const tacLow = level === 'high';
  return [
    { name: '他克莫司', dose: '2mg bid', anomaly: tacLow, reason: tacLow ? '血药浓度偏低，需核对服药时间与吸收' : undefined },
    { name: '吗替麦考酚酯', dose: '0.75g bid', anomaly: false },
    { name: '泼尼松', dose: '10mg qd', anomaly: level === 'high', reason: level === 'high' ? '感染风险窗口期，评估是否需调整' : undefined }
  ];
}

function defaultCompliance(level: RiskLevel): MedCompliance {
  if (level === 'high') return { medication: 62, diet: 55, exercise: 48 };
  if (level === 'mid') return { medication: 78, diet: 72, exercise: 65 };
  return { medication: 92, diet: 88, exercise: 80 };
}

/** 构造工作台演示患者（约 15 人，控制列表行数） */
export function buildWorkbenchPatients(): WorkbenchPatient[] {
  const donors = ['DCD·O', 'DCD·A', '活体亲属', 'DCD·B', '活体配偶'];
  return NAMES.slice(0, 15).map(([name, sex], i) => {
    const id = `P20260416${String(i + 1).padStart(3, '0')}`;
    const age = 26 + (i * 2) % 40;
    const worsening = i % 5 === 0 || i % 7 === 0;
    const baseScr = 78 + (i % 10) * 5 + (worsening ? 22 : 0);
    const baseEgfr = 82 - (i % 9) * 5 - (worsening ? 14 : 0);
    const baseTac = 6.0 + (i % 5) * 0.35 - (worsening ? 1.2 : 0);
    const labs = mkLabsSeries(baseScr, baseEgfr, baseTac, worsening);
    const last = labs[labs.length - 1];
    const abnormal = worsening || (last.scr ?? 0) >= 115 || (last.egfr ?? 99) < 60;
    const status = i % 8 === 0 ? '术前' : '术后';
    const surgeryDate = status === '术前' ? undefined : daysAgo(30 + (i % 90));

    const p: Patient = {
      id,
      name,
      sex,
      age,
      status,
      surgeryDate,
      donorInfo: donors[i % donors.length],
      flags: { abnormal },
      updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
      records: { labs }
    };
    const level = riskLevelOf(p);
    return {
      ...p,
      meds: defaultMeds(level),
      compliance: defaultCompliance(level),
      riskReasons: reasonsFor(p, level)
    };
  });
}

const TASK_TITLES: { k: TaskKind; t: string; d: string }[] = [
  { k: 'lab', t: '复查 Scr/eGFR', d: '空腹抽血，复核肾功能趋势' },
  { k: 'follow', t: '术后随访电话', d: '症状、血压、尿量结构化问询' },
  { k: 'med', t: 'Tac 浓度解读', d: '结合肝肾功调整服药提醒' },
  { k: 'lab', t: '尿蛋白定量', d: '24h 尿蛋白复查' },
  { k: 'follow', t: '门诊加号评估', d: '高风险提前面诊' },
  { k: 'med', t: '抗排异方案复核', d: '药物相互作用筛查' },
  { k: 'follow', t: '营养与运动指导', d: '监护计划执行回访' },
  { k: 'lab', t: 'CMV-DNA 复查', d: '免疫抑制下病毒感染监测' }
];

const AI_TAGS = ['剂量窗', '复查链', '依从性', '排斥信号', '感染筛查', '血压管理'];

export function buildWorkbenchTasks(patients: WorkbenchPatient[]): WorkbenchTask[] {
  const tasks: WorkbenchTask[] = [];
  let n = 0;
  for (let i = 0; i < patients.length; i++) {
    const p = patients[i];
    const level = riskLevelOf(p);
    const tmpl = TASK_TITLES[i % TASK_TITLES.length];
    const urgency: TaskUrgency = level === 'high' ? 'high' : level === 'mid' ? 'mid' : 'low';
    const overdue = level === 'high' && i % 3 === 0;
    const dueOffset = overdue ? -1 : i % 4 === 0 ? 0 : 1;
    const dueAt = isoDay(dueOffset) + 'T23:59:59';
    const state: 'todo' | 'done' = i % 10 === 0 ? 'done' : 'todo';
    tasks.push({
      id: `WB-${String(++n).padStart(4, '0')}`,
      patientId: p.id,
      title: tmpl.t,
      desc: tmpl.d,
      due: dueOffset < 0 ? '已逾期' : dueOffset === 0 ? '今日' : '明日',
      dueAt,
      state,
      kind: tmpl.k,
      urgency,
      aiTag: AI_TAGS[i % AI_TAGS.length]
    });
  }
  return tasks;
}

export function patientLabTags(p: WorkbenchPatient): string[] {
  const labs = p.records?.labs || [];
  if (labs.length < 2) return [];
  const a = labs[labs.length - 2];
  const b = labs[labs.length - 1];
  const tags: string[] = [];
  if ((b.scr ?? 0) > (a.scr ?? 0) + 5) tags.push('Scr↑');
  if ((b.egfr ?? 999) < (a.egfr ?? 0) - 3) tags.push('eGFR↓');
  if ((b.tac ?? 0) < (a.tac ?? 0) - 0.3) tags.push('Tac↓');
  if ((b.tac ?? 0) > (a.tac ?? 0) + 0.5) tags.push('Tac↑');
  return tags;
}

export function taskOverdue(t: WorkbenchTask): boolean {
  if (t.state !== 'todo') return false;
  return Date.now() > new Date(t.dueAt).getTime();
}

/** 高风险优先 → 逾期 → 紧急度 → 患者风险 */
export function sortWorkbenchTasks(
  tasks: WorkbenchTask[],
  patientMap: Map<string, WorkbenchPatient>
): WorkbenchTask[] {
  const rankRisk: Record<RiskLevel, number> = { high: 0, mid: 1, low: 2 };
  const rankU: Record<TaskUrgency, number> = { high: 0, mid: 1, low: 2 };
  return [...tasks].sort((a, b) => {
    const pa = patientMap.get(a.patientId);
    const pb = patientMap.get(b.patientId);
    const ra = pa ? riskLevelOf(pa) : 'low';
    const rb = pb ? riskLevelOf(pb) : 'low';
    if (rankRisk[ra] !== rankRisk[rb]) return rankRisk[ra] - rankRisk[rb];
    const oa = taskOverdue(a) ? 0 : 1;
    const ob = taskOverdue(b) ? 0 : 1;
    if (oa !== ob) return oa - ob;
    if (rankU[a.urgency] !== rankU[b.urgency]) return rankU[a.urgency] - rankU[b.urgency];
    return a.id.localeCompare(b.id);
  });
}

export type KpiFilterKey = 'all' | 'risk-high' | 'risk-mid' | 'risk-low' | 'urgent';

export function filterTasksByKpi(tasks: WorkbenchTask[], key: KpiFilterKey, patientMap: Map<string, WorkbenchPatient>): WorkbenchTask[] {
  if (key === 'all') return tasks;
  return tasks.filter((t) => {
    const p = patientMap.get(t.patientId);
    const r = p ? riskLevelOf(p) : 'low';
    if (key === 'risk-high') return r === 'high';
    if (key === 'risk-mid') return r === 'mid';
    if (key === 'risk-low') return r === 'low';
    if (key === 'urgent') return t.state === 'todo' && (t.urgency === 'high' || taskOverdue(t));
    return true;
  });
}

export type AiSuggestItem = {
  priority: 'high' | 'mid' | 'low';
  title: string;
  reason: string;
};

export function buildAiSuggestions(p: WorkbenchPatient | null, t: WorkbenchTask | null): AiSuggestItem[] {
  if (!p || !t) {
    return [
      {
        priority: 'mid',
        title: '请选择待办',
        reason: '选中表格行后，系统根据患者指标与任务类型生成分级建议。'
      }
    ];
  }
  const level = riskLevelOf(p);
  const tags = patientLabTags(p);
  const overdue = taskOverdue(t);
  const items: AiSuggestItem[] = [];

  if (overdue) {
    items.push({
      priority: 'high',
      title: '优先处理逾期任务',
      reason: `任务「${t.title}」已超过计划完成时间，高风险患者处置延迟会放大肾功能波动。`
    });
  }
  if (level === 'high') {
    items.push({
      priority: 'high',
      title: '缩短复查与面诊间隔',
      reason: '当前分层为高风险，Scr/eGFR 或 Tac 窗异常，需48h 内实验室复核并记录症状。'
    });
  }
  if (tags.includes('Scr↑') || tags.includes('eGFR↓')) {
    items.push({
      priority: 'high',
      title: '肾功能趋势复核',
      reason: `指标标签 ${tags.join('、')} 提示移植肾负荷上升，需排除排斥、感染及药物毒性。`
    });
  }
  if (tags.includes('Tac↓')) {
    items.push({
      priority: 'mid',
      title: '他克莫司暴露不足',
      reason: 'Tac 下行可能与依从性、腹泻或药物相互作用有关，建议抽血时点标准化后复测。'
    });
  }
  if (t.kind === 'follow') {
    items.push({
      priority: 'mid',
      title: '结构化随访记录',
      reason: '电话随访需固定记录血压、尿量、体重及用药漏服次数，便于 AI 下次比对基线。'
    });
  }
  if (t.kind === 'med') {
    items.push({
      priority: 'mid',
      title: '用药教育强化',
      reason: '免疫抑制剂剂量窗窄，建议向患者复述服药时间与禁食要求并留痕。'
    });
  }
  items.push({
    priority: 'low',
    title: '监护计划回顾',
    reason: `用药执行率 ${p.compliance.medication}%：可适当推送饮食/运动提醒，改善中长期依从性。`
  });

  const order = { high: 0, mid: 1, low: 2 };
  items.sort((a, b) => order[a.priority] - order[b.priority]);
  return items.slice(0, 8);
}

/** 保留与旧 seed的兼容（若其它页仍引用） */
export function getWorkbenchDataset() {
  const patients = buildWorkbenchPatients();
  const patientMap = new Map(patients.map((p) => [p.id, p]));
  const tasks = sortWorkbenchTasks(buildWorkbenchTasks(patients), patientMap);
  return { patients, patientMap, tasks };
}
