/**
 * 演示数据 store：把静态 seed 包成响应式 ref，提供 add / update / remove / restore。
 *
 * - 默认 **不持久化**（`persist: false`）：保证演示数据每次刷新都干净；
 * - 注册到全局 `__demoStores__` 表，方便 Topbar / 系统配置「重置演示数据」一键还原。
 */

import { ref, type Ref } from 'vue';

export type DemoStore<T extends { id: string | number }> = {
  /** 当前数据（响应式） */
  rows: Ref<T[]>;
  /** 在头部插入一条 */
  add: (row: T) => void;
  /** 按 id 更新（部分字段） */
  update: (id: T['id'], patch: Partial<T>) => boolean;
  /** 按 id 删除 */
  remove: (id: T['id']) => boolean;
  /** 批量删除 */
  removeMany: (ids: Array<T['id']>) => number;
  /** 整体替换 */
  replaceAll: (rows: T[]) => void;
  /** 还原到 seed 初始数据 */
  restore: () => void;
  /** 唯一 key */
  key: string;
};

type GlobalRegistry = {
  __demoStores__?: Record<string, DemoStore<any>>;
};

function getRegistry(): Record<string, DemoStore<any>> {
  const g = globalThis as unknown as GlobalRegistry;
  if (!g.__demoStores__) g.__demoStores__ = {};
  return g.__demoStores__;
}

/**
 * 创建/获取一个演示 store。同一 key 多次调用返回同一实例（保证页面间数据联动）。
 */
export function createDemoStore<T extends { id: string | number }>(
  key: string,
  seedFn: () => T[]
): DemoStore<T> {
  const reg = getRegistry();
  if (reg[key]) return reg[key] as DemoStore<T>;

  const rows = ref<T[]>(seedFn()) as Ref<T[]>;

  const store: DemoStore<T> = {
    key,
    rows,
    add(row) {
      rows.value = [row, ...rows.value];
    },
    update(id, patch) {
      const i = rows.value.findIndex((r) => r.id === id);
      if (i < 0) return false;
      rows.value = rows.value.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
      return true;
    },
    remove(id) {
      const before = rows.value.length;
      rows.value = rows.value.filter((r) => r.id !== id);
      return rows.value.length < before;
    },
    removeMany(ids) {
      const set = new Set(ids);
      const before = rows.value.length;
      rows.value = rows.value.filter((r) => !set.has(r.id));
      return before - rows.value.length;
    },
    replaceAll(next) {
      rows.value = [...next];
    },
    restore() {
      rows.value = seedFn();
    }
  };

  reg[key] = store;
  return store;
}

/** 一键重置全部已注册的演示 store */
export function resetAllDemoStores(): string[] {
  const reg = getRegistry();
  const keys = Object.keys(reg);
  for (const k of keys) reg[k].restore();
  return keys;
}

/** 生成下一个递增 id（演示用，不参与持久化）。 */
export function nextId(prefix: string, rows: Array<{ id: string }>): string {
  const re = new RegExp('^' + prefix + '-(\\d+)$');
  let max = 0;
  for (const r of rows) {
    const m = re.exec(r.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
}
