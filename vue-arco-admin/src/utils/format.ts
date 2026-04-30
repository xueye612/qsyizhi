/** 通用日期 / 数值格式化工具 */

export function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function fmtDate(d: Date | string | number | null | undefined): string {
  if (!d) return '';
  const dt = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return String(d);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

export function fmtDateTime(d: Date | string | number | null | undefined): string {
  if (!d) return '';
  const dt = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return String(d);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())} ${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
}

/** 演示用基准日：2026-04-16，保证表格里"今日待办"等口径稳定 */
export const DEMO_TODAY = new Date('2026-04-16T09:00:00');

export function daysBefore(n: number, base: Date = DEMO_TODAY): Date {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() - n);
  return d;
}

export function daysAfter(n: number, base: Date = DEMO_TODAY): Date {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + n);
  return d;
}

export function fmtMoney(n: number, digits = 2): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return n.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
