/**
 * Seed 扩充工具：根据少量原始 seed 行，确定性地合成出 30~80 条演示数据。
 * 通过 hash + 字段池保证每次刷新结果稳定，但又足够丰富。
 */

const NAMES: Array<[string, string]> = [
  ['王芳', '女'], ['赵玲', '女'], ['李明', '男'], ['陈凯', '男'],
  ['孙倩', '女'], ['周强', '男'], ['刘洋', '男'], ['郑敏', '女'],
  ['何静', '女'], ['黄磊', '男'], ['张蕾', '女'], ['马超', '男'],
  ['宋雨', '女'], ['徐晨', '男'], ['蒋雪', '女'], ['彭浩', '男'],
  ['唐琳', '女'], ['曹军', '男'], ['任欣', '女'], ['沈峰', '男'],
  ['董婧', '女'], ['林涛', '男'], ['周晗', '男'], ['范雨', '女'],
  ['程峰', '男'], ['薛丽', '女'], ['白宇', '男'], ['许静', '女'],
  ['段宏', '男'], ['冯莹', '女'], ['苏晴', '女'], ['崔阳', '男']
];

export function getDemoNames() {
  return NAMES;
}

export function pickName(i: number): [string, string] {
  return NAMES[i % NAMES.length];
}

export function patientIdAt(i: number): string {
  return `P20260415${String((i % 999) + 1).padStart(3, '0')}`;
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function dateStr(offsetDays: number, base = new Date('2026-04-16T09:00:00')): string {
  const d = new Date(base);
  d.setDate(d.getDate() - offsetDays);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function dateTimeStr(offsetMin: number, base = new Date('2026-04-16T09:00:00')): string {
  const d = new Date(base.getTime() - offsetMin * 60_000);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function pickFrom<T>(arr: readonly T[], i: number): T {
  return arr[Math.abs(i) % arr.length]!;
}

/** 简单确定性 PRNG，便于扩充 seed */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/** 在已有 seed 后追加 N 条同结构数据 */
export function expandSeed<T>(originals: T[], extraCount: number, makeOne: (i: number) => T): T[] {
  const extras: T[] = [];
  for (let i = 0; i < extraCount; i++) extras.push(makeOne(i));
  return [...originals, ...extras];
}
