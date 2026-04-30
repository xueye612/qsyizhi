/**
 * 通用 CRUD 列表页 composable：把「演示数据 store + 搜索/筛选 + 选中 + 增删改 + CSV 导出 + 加载/错误态」收成一个 hook，
 * 让每个模块页只需要传入 store / 列定义 / 表单 schema 即可获得一致体验。
 */
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { downloadCSV, type CsvColumn } from './csv';
import { nextId, type DemoStore } from './demoStore';

export type CrudListOptions<T extends { id: string | number }> = {
  store: DemoStore<T>;
  /** id 前缀，用于自动生成新 id（如 'PT'） */
  idPrefix: string;
  /** 文本搜索时关心的字段 */
  searchFields?: Array<keyof T>;
  /** 自定义额外过滤器（接收当前行，返回是否保留） */
  customFilter?: (row: T) => boolean;
  /** 导出 CSV 时使用的列 */
  csvColumns: CsvColumn<T>[];
  /** 导出文件名（不含扩展名） */
  exportName?: string;
  /** 默认排序 (rows) => sorted rows，可选 */
  sortFn?: (rows: T[]) => T[];
};

export type CrudListReturn<T extends { id: string | number }> = {
  // 数据
  allRows: ComputedRef<T[]>;
  rows: ComputedRef<T[]>;
  total: ComputedRef<number>;
  // 状态
  loading: Ref<boolean>;
  errorText: Ref<string | null>;
  searchKey: Ref<string>;
  // 选中（单选 = 详情联动）
  selectedId: Ref<T['id'] | null>;
  selected: ComputedRef<T | null>;
  // 多选（批量删除）
  checked: Ref<Array<T['id']>>;
  // 抽屉
  drawerVisible: Ref<boolean>;
  drawerMode: Ref<'create' | 'edit' | 'view'>;
  drawerRecord: Ref<T | null>;
  // 行点击/操作
  onRowClick: (row: T) => void;
  rowClass: (row: T) => string;
  openCreate: () => void;
  openEdit: (row: T) => void;
  openView: (row: T) => void;
  closeDrawer: () => void;
  // 提交（来自 MedRecordDrawer）
  onSubmit: (values: Record<string, any>) => void;
  // 删除
  removeRow: (id: T['id']) => void;
  removeChecked: () => void;
  // 工具
  refresh: () => void;
  exportCSV: () => void;
};

export function useCrudList<T extends { id: string | number }>(opts: CrudListOptions<T>): CrudListReturn<T> {
  const { store, idPrefix, searchFields = [], customFilter, csvColumns, exportName, sortFn } = opts;

  const loading = ref(false);
  const errorText = ref<string | null>(null);
  const searchKey = ref('');
  const selectedId = ref<T['id'] | null>(null);
  const checked = ref<Array<T['id']>>([]);

  const drawerVisible = ref(false);
  const drawerMode = ref<'create' | 'edit' | 'view'>('create');
  const drawerRecord = ref<T | null>(null) as Ref<T | null>;

  const allRows = computed(() => {
    const list = sortFn ? sortFn([...store.rows.value]) : store.rows.value;
    return list as T[];
  });

  const rows = computed(() => {
    let list = [...allRows.value];
    const q = searchKey.value.trim().toLowerCase();
    if (q && searchFields.length) {
      list = list.filter((r) =>
        searchFields.some((k) => {
          const v = (r as any)[k];
          return v != null && String(v).toLowerCase().includes(q);
        })
      );
    }
    if (customFilter) list = list.filter(customFilter);
    return list;
  });

  const total = computed(() => rows.value.length);

  const selected = computed(() => {
    const id = selectedId.value;
    if (id == null) return null;
    return store.rows.value.find((r) => r.id === id) ?? null;
  });

  watch(
    rows,
    (next) => {
      if (next.length === 0) {
        selectedId.value = null;
        return;
      }
      const exist = next.some((r) => r.id === selectedId.value);
      if (!exist) selectedId.value = next[0]!.id;
    },
    { immediate: true }
  );

  function onRowClick(row: T) {
    selectedId.value = row.id;
  }
  function rowClass(row: T) {
    return row.id === selectedId.value ? 'row-selected' : '';
  }
  function openCreate() {
    drawerMode.value = 'create';
    drawerRecord.value = null;
    drawerVisible.value = true;
  }
  function openEdit(row: T) {
    drawerMode.value = 'edit';
    drawerRecord.value = row;
    drawerVisible.value = true;
  }
  function openView(row: T) {
    drawerMode.value = 'view';
    drawerRecord.value = row;
    drawerVisible.value = true;
  }
  function closeDrawer() {
    drawerVisible.value = false;
  }
  function onSubmit(values: Record<string, any>) {
    if (drawerMode.value === 'create') {
      const id = nextId(idPrefix, store.rows.value as Array<{ id: string }>);
      const row = { id, ...values } as unknown as T;
      store.add(row);
      Message.success('已新增 1 条记录');
      selectedId.value = row.id;
    } else if (drawerMode.value === 'edit' && drawerRecord.value) {
      store.update(drawerRecord.value.id, values as Partial<T>);
      Message.success('已保存修改');
    }
    drawerVisible.value = false;
  }
  function removeRow(id: T['id']) {
    if (store.remove(id)) {
      Message.success('已删除 1 条记录');
      checked.value = checked.value.filter((c) => c !== id);
    }
  }
  function removeChecked() {
    if (!checked.value.length) return;
    const n = store.removeMany(checked.value);
    checked.value = [];
    Message.success(`已批量删除 ${n} 条记录`);
  }
  function refresh() {
    loading.value = true;
    errorText.value = null;
    setTimeout(() => {
      store.restore();
      loading.value = false;
      Message.info('已重新加载演示数据');
    }, 320);
  }
  function exportCSV() {
    if (!rows.value.length) {
      Message.warning('当前没有可导出的数据');
      return;
    }
    downloadCSV(exportName || idPrefix, rows.value, csvColumns);
    Message.success(`已导出 ${rows.value.length} 条记录`);
  }

  return {
    allRows,
    rows,
    total,
    loading,
    errorText,
    searchKey,
    selectedId,
    selected,
    checked,
    drawerVisible,
    drawerMode,
    drawerRecord,
    onRowClick,
    rowClass,
    openCreate,
    openEdit,
    openView,
    closeDrawer,
    onSubmit,
    removeRow,
    removeChecked,
    refresh,
    exportCSV
  };
}
