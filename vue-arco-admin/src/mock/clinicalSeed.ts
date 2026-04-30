/**
 * 临床数据扩展种子（v2）
 * 为每个患者按确定性方式生成：体征、检验时间序列、用药、过敏、问题、随访、影像、记录、风险评分、依从性、警示
 * 生成器全部采用「seeded random」，刷新页面结果稳定
 */

export type Severity = 'critical' | 'warning' | 'caution' | 'normal';

export type VitalPoint = { ts: string; sys: number; dia: number; hr: number; temp: number; rr: number; spo2: number; weight: number };
export type LabPoint = {
  ts: string;
  scr?: number;
  egfr?: number;
  bun?: number;
  k?: number;
  na?: number;
  hb?: number;
  wbc?: number;
  plt?: number;
  alt?: number;
  ast?: number;
  tac?: number;
  prot?: number;
  glu?: number;
};
export type Allergy = { substance: string; reaction: string; severity: Severity };
export type Problem = { icd?: string; name: string; onset: string; status: 'active' | 'resolved' | 'remission' };
export type Medication = {
  name: string;
  dose: string;
  freq: string;
  route: '口服' | '静脉' | '皮下' | '吸入' | '外用';
  startDate: string;
  endDate?: string;
  indication: string;
  category: '免疫抑制' | '降压' | '降糖' | '抗感染' | '辅助' | '其他';
  adherence: number; // 0-100
};
export type Encounter = { date: string; type: '门诊' | '住院' | '急诊' | '随访' | '手术'; dept: string; dx: string; note: string };
export type Imaging = { ts: string; modality: 'US' | 'CT' | 'MR' | 'X' | 'PET'; site: string; finding: string; impression: string };
export type ClinicalNote = { ts: string; author: string; role: '主治' | '住院' | '专科护士' | '协调员'; type: 'SOAP' | '随访' | '出院' | '会诊'; content: string };
export type RiskScores = { rejection: number; infection: number; cardiovascular: number; mortality: number };
export type Compliance = { medication: number; followup: number; lab: number; weekly: number[] };
export type Alert = { id: string; level: 'critical' | 'warning' | 'info'; code: string; message: string; since: string };
export type EmergencyContact = { name: string; relation: string; phone: string };
export type TransplantInfo = {
  organ: '肾' | '肝' | '心' | '肺';
  donorType: 'DCD' | '活体' | 'DBD';
  donorId?: string;
  surgeryDate?: string;
  surgeon: string;
  hospital: string;
  postopDays: number;
  coldIschemiaH: number;
  warmIschemiaMin: number;
  hlaMatch: string;
  pra: number;
  inductionRegimen: string;
  currentImmuno: string[];
};

export type ClinicalProfile = {
  mrn: string;
  height: number;
  weight: number;
  bmi: number;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  ethnicity: string;
  marriage: string;
  occupation: string;
  contact: { phone: string; address: string; emergency: EmergencyContact };
  insurance: { type: string; no: string };
  transplant?: TransplantInfo;
  allergies: Allergy[];
  problems: Problem[];
  vitals: VitalPoint[];
  labs: LabPoint[];
  meds: Medication[];
  encounters: Encounter[];
  imaging: Imaging[];
  notes: ClinicalNote[];
  risk: RiskScores;
  compliance: Compliance;
  alerts: Alert[];
};

/* -------------------- 工具 -------------------- */
function pad2(n: number) { return String(n).padStart(2, '0'); }
function ymd(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function ymdh(d: Date) { return `${ymd(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
function shiftDate(days: number) { const d = new Date(); d.setDate(d.getDate() - days); return d; }

// 简易 mulberry32 种子随机
function rng(seed: number) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick<T>(rand: () => number, arr: T[]): T { return arr[Math.floor(rand() * arr.length)]; }
function around(rand: () => number, base: number, jitter: number, decimals = 0) {
  const v = base + (rand() * 2 - 1) * jitter;
  const m = Math.pow(10, decimals);
  return Math.round(v * m) / m;
}

/* -------------------- 字典 -------------------- */
const ORGANS: TransplantInfo['organ'][] = ['肾', '肝', '心', '肺'];
const DOCS = ['张景明', '李文博', '王怀仁', '陈思齐', '赵敏行', '孙乐尧'];
const NURSES = ['林淑华', '何婉清', '杨蓉'];
const COORDS = ['周协调', '吴随访', '徐管理'];
const HOSPITALS = ['同济医学院附属医院', '协和器官移植中心', '北方移植中心', '华东附二院'];
const BLOODS: ClinicalProfile['bloodType'][] = ['A+', 'B+', 'O+', 'AB+', 'A-', 'O-'];
const OCCUPATIONS = ['公司职员', '教师', '工程师', '退休', '自由职业', '公务员', '医务工作者', '务农'];
const ALLERGY_LIB: Allergy[] = [
  { substance: '青霉素', reaction: '皮疹 / 瘙痒', severity: 'warning' },
  { substance: '磺胺类', reaction: '口腔溃疡', severity: 'caution' },
  { substance: '碘造影剂', reaction: '过敏性休克史', severity: 'critical' },
  { substance: '海鲜', reaction: '荨麻疹', severity: 'caution' },
  { substance: '芒果', reaction: '口周接触性皮炎', severity: 'caution' }
];
const PROBLEM_LIB: Omit<Problem, 'onset'>[] = [
  { icd: 'I10', name: '原发性高血压', status: 'active' },
  { icd: 'E11', name: '2 型糖尿病', status: 'active' },
  { icd: 'N18', name: '慢性肾脏病 5 期 (移植前)', status: 'remission' },
  { icd: 'I25', name: '冠状动脉粥样硬化', status: 'active' },
  { icd: 'B18.1', name: '慢性乙型肝炎', status: 'active' },
  { icd: 'E78', name: '高脂血症', status: 'active' },
  { icd: 'D64', name: '慢性病性贫血', status: 'remission' }
];
const IMMUNO = ['他克莫司', '吗替麦考酚酯', '泼尼松'];
const HYPERTEN = [
  { name: '苯磺酸氨氯地平', dose: '5 mg', freq: 'qd', cat: '降压' as const, indi: '高血压' },
  { name: '缬沙坦', dose: '80 mg', freq: 'qd', cat: '降压' as const, indi: '高血压' }
];
const ANTI_INFECT = [
  { name: '复方磺胺甲噁唑', dose: '480 mg', freq: 'qd', cat: '抗感染' as const, indi: 'PCP 预防' },
  { name: '更昔洛韦', dose: '450 mg', freq: 'bid', cat: '抗感染' as const, indi: 'CMV 预防' }
];
const AUX = [
  { name: '碳酸钙D3', dose: '600 mg', freq: 'qd', cat: '辅助' as const, indi: '骨质保护' },
  { name: '叶酸', dose: '5 mg', freq: 'qd', cat: '辅助' as const, indi: '同型半胱氨酸' }
];
const DBT = [
  { name: '门冬胰岛素', dose: '8 U', freq: '三餐前', cat: '降糖' as const, indi: '糖尿病' }
];

/* -------------------- 主生成器 -------------------- */
export function buildClinicalProfile(opts: {
  index: number;
  id: string;
  name: string;
  sex: string;
  age: number;
  status: '术前' | '术后' | string;
  surgeryDate?: string;
  trend: -1 | 0 | 1;
}): ClinicalProfile {
  const rand = rng(hashCode(opts.id) || (opts.index + 1) * 7919);
  const isPostop = opts.status === '术后';
  const postopDays = (() => {
    if (!opts.surgeryDate) return 0;
    const t = new Date(opts.surgeryDate).getTime();
    if (Number.isNaN(t)) return 0;
    return Math.max(0, Math.floor((Date.now() - t) / 86400000));
  })();

  // 体型
  const heightCm = opts.sex === '男' ? around(rand, 172, 6) : around(rand, 161, 5);
  const weightKg = opts.sex === '男' ? around(rand, 68, 7, 1) : around(rand, 56, 6, 1);
  const bmi = Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10;

  // 移植信息
  const organ = pick(rand, ORGANS);
  const donorType = pick<TransplantInfo['donorType']>(rand, ['DCD', '活体', 'DCD', 'DBD']);
  const transplant: TransplantInfo | undefined = isPostop ? {
    organ,
    donorType,
    donorId: 'D' + (10000 + Math.floor(rand() * 8999)).toString(),
    surgeryDate: opts.surgeryDate,
    surgeon: pick(rand, DOCS),
    hospital: pick(rand, HOSPITALS),
    postopDays,
    coldIschemiaH: around(rand, 8, 4, 1),
    warmIschemiaMin: around(rand, 5, 3, 1),
    hlaMatch: `${Math.floor(rand() * 4) + 2}/6 匹配`,
    pra: around(rand, 8, 8),
    inductionRegimen: pick(rand, ['ATG', '巴利昔单抗', '巴利昔单抗 + 甲泼尼龙']),
    currentImmuno: IMMUNO
  } : undefined;

  // 过敏
  const allergyCount = rand() < 0.45 ? 1 : rand() < 0.7 ? 2 : 0;
  const allergies: Allergy[] = [];
  const allergyPool = ALLERGY_LIB.slice();
  for (let i = 0; i < allergyCount && allergyPool.length; i++) {
    const idx = Math.floor(rand() * allergyPool.length);
    allergies.push(allergyPool.splice(idx, 1)[0]);
  }

  // 问题列表
  const problemCount = 2 + Math.floor(rand() * 3);
  const problemPool = PROBLEM_LIB.slice();
  const problems: Problem[] = [];
  for (let i = 0; i < problemCount && problemPool.length; i++) {
    const idx = Math.floor(rand() * problemPool.length);
    const p = problemPool.splice(idx, 1)[0];
    problems.push({ ...p, onset: ymd(shiftDate(180 + Math.floor(rand() * 1500))) });
  }

  // 体征 30 天 × 1 点/天
  const vitals: VitalPoint[] = [];
  const sysBase = around(rand, 128, 8);
  const diaBase = around(rand, 78, 6);
  const hrBase = around(rand, 78, 6);
  for (let d = 29; d >= 0; d--) {
    const day = shiftDate(d);
    const noise = (rand() - 0.5) * 6;
    const trendBoost = opts.trend === 1 ? (29 - d) * 0.4 : 0;
    vitals.push({
      ts: ymd(day),
      sys: Math.round(sysBase + noise + trendBoost),
      dia: Math.round(diaBase + noise * 0.6),
      hr: Math.round(hrBase + (rand() - 0.5) * 8 + (opts.trend === 1 ? 4 : 0)),
      temp: Math.round((36.4 + rand() * 0.7 + (opts.trend === 1 && d < 5 ? 0.6 : 0)) * 10) / 10,
      rr: Math.round(16 + (rand() - 0.5) * 4),
      spo2: Math.round(96 + rand() * 3),
      weight: Math.round((weightKg + (rand() - 0.5) * 1.5) * 10) / 10
    });
  }

  // 检验 90 天 × 每 5 天一次
  const labs: LabPoint[] = [];
  const scrBase = around(rand, 96, 18);
  const egfrBase = around(rand, 70, 14);
  const tacBase = around(rand, 6.5, 1.2, 1);
  const protBase = around(rand, 4.5, 1.6, 1);
  for (let d = 90; d >= 0; d -= 5) {
    const day = shiftDate(d);
    const factor = opts.trend === 1 ? (90 - d) / 90 : opts.trend === -1 ? -(90 - d) / 200 : 0;
    labs.push({
      ts: ymd(day),
      scr: Math.round(scrBase + factor * 50 + (rand() - 0.5) * 8),
      egfr: Math.max(20, Math.round(egfrBase - factor * 22 + (rand() - 0.5) * 4)),
      bun: Math.round((6 + factor * 4 + (rand() - 0.5) * 2) * 10) / 10,
      k: Math.round((4.2 + (rand() - 0.5) * 0.6) * 10) / 10,
      na: Math.round(140 + (rand() - 0.5) * 4),
      hb: Math.round(125 + (rand() - 0.5) * 18 - factor * 12),
      wbc: Math.round((6.5 + (rand() - 0.5) * 2.4) * 10) / 10,
      plt: Math.round(220 + (rand() - 0.5) * 60),
      alt: Math.round(28 + (rand() - 0.5) * 18 + (factor > 0.4 ? 20 : 0)),
      ast: Math.round(26 + (rand() - 0.5) * 15),
      tac: Math.round((tacBase - factor * 1.6 + (rand() - 0.5) * 0.8) * 10) / 10,
      prot: Math.round((protBase + factor * 8 + (rand() - 0.5) * 1.2) * 10) / 10,
      glu: Math.round((5.6 + (rand() - 0.5) * 1.4) * 10) / 10
    });
  }
  const lastLab = labs[labs.length - 1];

  // 用药
  const meds: Medication[] = [];
  if (transplant) {
    meds.push(
      { name: '他克莫司', dose: lastLab.tac && lastLab.tac > 7 ? '1.5 mg' : '2 mg', freq: 'q12h', route: '口服', startDate: opts.surgeryDate || ymd(shiftDate(60)), indication: '抗排异', category: '免疫抑制', adherence: 88 + Math.floor(rand() * 11) },
      { name: '吗替麦考酚酯', dose: '500 mg', freq: 'q12h', route: '口服', startDate: opts.surgeryDate || ymd(shiftDate(60)), indication: '抗排异', category: '免疫抑制', adherence: 85 + Math.floor(rand() * 13) },
      { name: '泼尼松', dose: postopDays > 60 ? '5 mg' : '15 mg', freq: 'qd', route: '口服', startDate: opts.surgeryDate || ymd(shiftDate(60)), indication: '抗排异', category: '免疫抑制', adherence: 90 + Math.floor(rand() * 9) }
    );
  }
  if (problems.some((p) => p.name.includes('高血压'))) meds.push({ ...HYPERTEN[Math.floor(rand() * HYPERTEN.length)], route: '口服', startDate: ymd(shiftDate(120)), category: '降压', indication: '高血压', adherence: 78 + Math.floor(rand() * 18) } as any);
  if (problems.some((p) => p.name.includes('糖尿病'))) meds.push({ ...DBT[0], route: '皮下', startDate: ymd(shiftDate(200)), category: '降糖', indication: '糖尿病', adherence: 72 + Math.floor(rand() * 22) } as any);
  if (transplant) {
    meds.push({ ...ANTI_INFECT[0], route: '口服', startDate: opts.surgeryDate || ymd(shiftDate(60)), category: '抗感染', indication: 'PCP 预防', adherence: 92 + Math.floor(rand() * 7) } as any);
    if (postopDays < 90) meds.push({ ...ANTI_INFECT[1], route: '口服', startDate: opts.surgeryDate || ymd(shiftDate(60)), category: '抗感染', indication: 'CMV 预防', adherence: 88 + Math.floor(rand() * 10) } as any);
  }
  meds.push({ ...AUX[0], route: '口服', startDate: ymd(shiftDate(150)), category: '辅助', indication: '骨质保护', adherence: 80 + Math.floor(rand() * 18) } as any);

  // 就诊
  const encounters: Encounter[] = [];
  if (opts.surgeryDate) encounters.push({ date: opts.surgeryDate, type: '手术', dept: '器官移植科', dx: `${organ}移植术`, note: `${donorType} 供体, HLA ${transplant?.hlaMatch}` });
  for (let i = 0; i < 4; i++) {
    encounters.push({
      date: ymd(shiftDate(7 + i * 14 + Math.floor(rand() * 4))),
      type: pick(rand, ['随访', '门诊', '门诊', '随访']) as Encounter['type'],
      dept: pick(rand, ['器官移植科', '肾内科', '心内科', '感染科']),
      dx: pick(rand, ['移植后随访', '免疫抑制方案调整', '感染监测', '电解质复查']),
      note: pick(rand, ['Tac 谷值在窗内', '血压偏高，调整剂量', 'Scr 轻度升高，观察', '依从性良好'])
    });
  }
  encounters.sort((a, b) => (a.date < b.date ? 1 : -1));

  // 影像
  const imaging: Imaging[] = isPostop ? [
    { ts: ymd(shiftDate(7)), modality: 'US', site: '移植肾', finding: '阻力指数 0.62, 血流良好', impression: '未见异常' },
    { ts: ymd(shiftDate(35)), modality: 'CT', site: '胸部低剂量', finding: '双肺纹理清晰, 未见结节', impression: '未见明显异常' }
  ] : [];

  // 病程记录
  const notes: ClinicalNote[] = [];
  for (let i = 0; i < 3; i++) {
    notes.push({
      ts: ymdh(new Date(Date.now() - (i * 6 + 2) * 3600 * 1000)),
      author: pick(rand, DOCS),
      role: pick(rand, ['主治', '住院', '专科护士']),
      type: pick(rand, ['SOAP', '随访', '会诊']),
      content: pick(rand, [
        '主诉：无明显不适。查体：T 36.6 BP 128/82。Tac 谷值 6.8 ng/mL。继续当前方案。',
        '随访：依从性良好，体重稳定。建议两周后复查肝肾功能。',
        '会诊意见：建议加用 ACEI，监测 K+ 与 Scr。',
        '出院小结：术后恢复良好，按方案出院，门诊随访。'
      ])
    });
  }

  // 风险评分（与 trend 关联）
  const tBoost = opts.trend === 1 ? 35 : opts.trend === -1 ? -10 : 0;
  const risk: RiskScores = {
    rejection: clamp01(around(rand, 30 + tBoost, 12)),
    infection: clamp01(around(rand, 28 + (transplant && postopDays < 60 ? 15 : 0), 12)),
    cardiovascular: clamp01(around(rand, 35 + (problems.some((p) => p.name.includes('高血压')) ? 12 : 0), 10)),
    mortality: clamp01(around(rand, 18 + tBoost / 2, 8))
  };

  // 依从性（最近 12 周）
  const compliance: Compliance = {
    medication: 80 + Math.floor(rand() * 18),
    followup: 78 + Math.floor(rand() * 20),
    lab: 82 + Math.floor(rand() * 15),
    weekly: Array.from({ length: 12 }, () => 70 + Math.floor(rand() * 30))
  };

  // 警示
  const alerts: Alert[] = [];
  if (allergies.some((a) => a.severity === 'critical')) alerts.push({ id: 'a1', level: 'critical', code: 'ALG', message: `严重过敏：${allergies.find((a) => a.severity === 'critical')!.substance}`, since: ymd(shiftDate(400)) });
  if (lastLab.scr && lastLab.scr > 130) alerts.push({ id: 'a2', level: 'critical', code: 'SCR', message: `Scr 升高至 ${lastLab.scr} μmol/L (基线 ${Math.round(scrBase)})`, since: lastLab.ts });
  if (lastLab.tac && (lastLab.tac < 4 || lastLab.tac > 10)) alerts.push({ id: 'a3', level: 'warning', code: 'TAC', message: `Tac 谷值偏离窗 (${lastLab.tac} ng/mL)`, since: lastLab.ts });
  if (vitals[vitals.length - 1].sys > 140) alerts.push({ id: 'a4', level: 'warning', code: 'BP', message: `近期收缩压偏高 ${vitals[vitals.length - 1].sys} mmHg`, since: vitals[vitals.length - 1].ts });
  if (vitals[vitals.length - 1].temp >= 37.5) alerts.push({ id: 'a5', level: 'warning', code: 'TMP', message: `体温升高 ${vitals[vitals.length - 1].temp}℃，需排除感染`, since: vitals[vitals.length - 1].ts });
  if (compliance.medication < 85) alerts.push({ id: 'a6', level: 'info', code: 'ADH', message: `近 12 周服药依从性 ${compliance.medication}%`, since: ymd(shiftDate(7)) });

  return {
    mrn: 'MRN' + opts.id.slice(-7),
    height: heightCm,
    weight: weightKg,
    bmi,
    bloodType: pick(rand, BLOODS),
    ethnicity: '汉族',
    marriage: rand() > 0.3 ? '已婚' : '未婚',
    occupation: pick(rand, OCCUPATIONS),
    contact: {
      phone: '138' + String(Math.floor(rand() * 100000000)).padStart(8, '0'),
      address: pick(rand, ['北京市朝阳区', '上海市徐汇区', '武汉市江岸区', '广州市天河区', '成都市锦江区']),
      emergency: { name: pick(rand, ['张爱华', '李建国', '陈秀兰', '刘志强']), relation: pick(rand, ['配偶', '父亲', '母亲', '子女']), phone: '139' + String(Math.floor(rand() * 100000000)).padStart(8, '0') }
    },
    insurance: { type: pick(rand, ['职工医保', '居民医保', '商业保险']), no: 'INS' + String(Math.floor(rand() * 1e9)).padStart(9, '0') },
    transplant,
    allergies,
    problems,
    vitals,
    labs,
    meds,
    encounters,
    imaging,
    notes,
    risk,
    compliance,
    alerts
  };
}

function clamp01(n: number) { return Math.max(0, Math.min(100, Math.round(n))); }
function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
