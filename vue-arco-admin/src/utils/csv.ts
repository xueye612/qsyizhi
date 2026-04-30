/**
 * 简易 CSV 导出工具：用于演示数据导出，零依赖。
 * - 字段含 , " \r \n 时按 RFC4180 转义；
 * - 加 UTF-8 BOM 兼容 Excel 中文乱码。
 */

export type CsvColumn<T> = {
  /** 表头展示名 */
  title: string;
  /** 字段 key 或自定义取值函数 */
  key: keyof T | ((row: T) => unknown);
};

function toCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (/[",\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function toCSV<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => toCell(c.title)).join(',');
  const lines = rows.map((r) =>
    columns
      .map((c) => {
        const v = typeof c.key === 'function' ? (c.key as (row: T) => unknown)(r) : (r as any)[c.key];
        return toCell(v);
      })
      .join(',')
  );
  return [header, ...lines].join('\r\n');
}

export function downloadCSV<T>(filename: string, rows: T[], columns: CsvColumn<T>[]) {
  const csv = toCSV(rows, columns);
  // BOM 兼容 Excel
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 200);
}
