/** 系统管理演示数据 */

export type SysUserRow = {
  id: string;
  login: string;
  displayName: string;
  dept: string;
  role: string;
  status: '正常' | '锁定' | '待激活';
};

export type SysRoleRow = {
  id: string;
  name: string;
  menuNodes: number;
  dataScopes: number;
  updatedAt: string;
};

export type SysConsentRow = {
  id: string;
  title: string;
  version: string;
  signedCount: number;
  status: '生效' | '草稿' | '废止';
};

export type SysAuditRow = {
  id: string;
  operator: string;
  action: string;
  target: string;
  at: string;
};

export type SysCfgRow = {
  id: string;
  paramKey: string;
  paramValue: string;
  scope: string;
  updatedAt: string;
};

export function seedSysUsers(): SysUserRow[] {
  return [
    { id: 'U-01', login: 'wang.hao', displayName: '王浩', dept: '移植外科', role: '主治医师', status: '正常' },
    { id: 'U-02', login: 'li.min', displayName: '李敏', dept: '随访中心', role: '随访护士', status: '正常' },
    { id: 'U-03', login: 'zhou.y', displayName: '周洋', dept: '信息科', role: '系统管理员', status: '锁定' }
  ];
}

export function sysUserKpis(rows: SysUserRow[]) {
  const ok = rows.filter((r) => r.status === '正常').length;
  const locked = rows.filter((r) => r.status === '锁定').length;
  const pending = rows.filter((r) => r.status === '待激活').length;
  const adminish = rows.filter((r) => r.role.includes('管理')).length;
  return { ok, locked, pending, adminish, total: rows.length };
}

export function seedSysRoles(): SysRoleRow[] {
  return [
    { id: 'R-01', name: '移植医师', menuNodes: 42, dataScopes: 3, updatedAt: '2026-04-15' },
    { id: 'R-02', name: '随访专员', menuNodes: 28, dataScopes: 2, updatedAt: '2026-04-10' },
    { id: 'R-03', name: '科研只读', menuNodes: 12, dataScopes: 1, updatedAt: '2026-04-01' }
  ];
}

export function sysRoleKpis(rows: SysRoleRow[]) {
  const menus = rows.reduce((s, r) => s + r.menuNodes, 0);
  const wide = rows.filter((r) => r.menuNodes >= 35).length;
  return { menus, wide, roles: rows.length, total: rows.length };
}

export function seedSysConsent(): SysConsentRow[] {
  return [
    { id: 'C-01', title: '肾移植随访知情同意', version: 'v2026.1', signedCount: 1280, status: '生效' },
    { id: 'C-02', title: '科研数据二次使用授权', version: 'v2025.3', signedCount: 420, status: '生效' },
    { id: 'C-03', title: '远程问诊补充条款', version: 'v2026.0-draft', signedCount: 0, status: '草稿' }
  ];
}

export function sysConsentKpis(rows: SysConsentRow[]) {
  const active = rows.filter((r) => r.status === '生效').length;
  const draft = rows.filter((r) => r.status === '草稿').length;
  const signed = rows.reduce((s, r) => s + r.signedCount, 0);
  return { active, draft, signed, total: rows.length };
}

export function seedSysAudit(): SysAuditRow[] {
  return [
    { id: 'A-01', operator: 'zhou.y', action: '修改角色权限', target: 'role:移植医师', at: '2026-04-16 10:12' },
    { id: 'A-02', operator: 'wang.hao', action: '导出患者列表', target: 'module:patients.list', at: '2026-04-16 09:40' },
    { id: 'A-03', operator: 'li.min', action: '登录失败锁定', target: 'user:guest3', at: '2026-04-15 22:01' }
  ];
}

export function sysAuditKpis(rows: SysAuditRow[]) {
  const today = rows.filter((r) => r.at.startsWith('2026-04-16')).length;
  const sensitive = rows.filter((r) => r.action.includes('权限') || r.action.includes('导出')).length;
  return { today, sensitive, events: rows.length, total: rows.length };
}

export function seedSysCfg(): SysCfgRow[] {
  return [
    { id: 'CFG-01', paramKey: 'follow.overdue.days', paramValue: '7', scope: '随访', updatedAt: '2026-04-12' },
    { id: 'CFG-02', paramKey: 'ai.safety.strict_mode', paramValue: 'true', scope: 'AI', updatedAt: '2026-04-14' },
    { id: 'CFG-03', paramKey: 'export.max_rows', paramValue: '50000', scope: '导出', updatedAt: '2026-03-20' }
  ];
}

export function sysCfgKpis(rows: SysCfgRow[]) {
  const ai = rows.filter((r) => r.scope === 'AI').length;
  const boolish = rows.filter((r) => r.paramValue === 'true' || r.paramValue === 'false').length;
  return { ai, boolish, params: rows.length, total: rows.length };
}
