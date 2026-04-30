# Vue3 + Arco Design 医疗后台（器官移植全流程）

基于 **Vite + Vue 3 + Vue Router 4 + Arco Design** 的医疗后台演示项目，包含「器官移植患者工作台」等模块页。该仓库以 **医生决策工作台** 为中心，强化风险优先级、待办处置与 AI 分级建议。

---

## 技术栈

- **前端框架**：Vue 3
- **路由**：Vue Router 4（默认 History，可切 Hash）
- **UI**：Arco Design Vue
- **构建**：Vite
- **趋势图**：ECharts
- **E2E**：Playwright

---

## 快速开始

在项目根目录执行：

```bash
npm i
npm run dev
```

默认访问：`http://localhost:5173/`

---

## 常用脚本

```bash
# 开发
npm run dev

# 生产构建（含 vue-tsc 类型检查）
npm run build

# 本地预览 dist（Vite Preview）
npm run preview

# 以“静态 SPA 回退模式”启动 dist（解决直链 404，适合验证部署）
npm run serve:dist

# E2E
npm run test:e2e
```

---

## 核心页面：器官移植患者工作台

### 目标定位

- 从“统计展示页”升级为“**医生决策工作台**”
- 信息更密但层级清晰：先风险/紧急，再线索，再处置
- 强化 **风险优先级** 与 **AI 辅助建议（分级 + 原因）**

### 页面入口

- **工作台首页**：`/wb/todo`

### 关键实现文件

- **页面结构**：`src/views/workbench/WbTodo.vue`
- **模拟数据与排序/筛选/AI 建议**：`src/mock/workbenchData.ts`
- **待办表（密集信息、分级/线索/到期/状态）**：`src/components/MedTaskTable.vue`
- **患者面板（折叠分区、趋势 Tab 单图、用药异常、执行率）**：`src/components/MedPatientPanel.vue`
- **KPI 卡片（支持点击筛选）**：`src/components/MedStatCard.vue`
- **AI 建议（高/中/低 + 必含原因，兼容旧 string[]）**：`src/components/MedAiSuggest.vue`

### 数据规模（控制可读性）

为避免首屏“太乱”，工作台默认构造 **约 15 条待办**（每位患者 1 条待办），仍包含：

- Scr / eGFR / Tac 指标序列
- 风险等级（高/中/低）
- 用药状态（异常标记 + 原因）
- 监护计划执行率（用药/饮食/运动）

---

## 路由与菜单

- **菜单结构**：`src/menu/menu.ts`
  - 字段保持：`groupKey/group/icon/items/key/label/icon`
  - `embedSrc` 的菜单项会以新窗口打开 `public/screens/` 下的静态页面，不注册为 SPA 路由
- **路由生成**：`src/router/index.ts`
  - 菜单 `key` 自动映射路径（`.` → `/`），例如 `wb.todo` → `/wb/todo`
  - 子路由使用**相对路径段**（例如 `wb/todo`），以符合 Vue Router 4 的嵌套解析规则

---

## 生产部署：解决“直链 / 刷新 404”

现象：从首页点击进入 `/wb/todo` 正常，但在地址栏直接访问 `http://<host>/wb/todo` 返回 **404**。  
原因：History 路由下，服务器需要将未知路径回退到 `index.html`，否则会尝试查找真实文件路径。

### 方案 A（推荐）：服务器回退到 index.html

#### Nginx

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

#### Apache

项目已提供 `public/.htaccess`（打包后会进 `dist/`，确保部署时携带并允许 `.htaccess` 生效）。

#### IIS

项目已提供 `public/web.config`（打包后会进 `dist/`）。

### 方案 B（无需改服务器）：切换 Hash 路由

在构建环境变量中设置：

```env
VITE_ROUTER_HASH=true
```

访问方式变为：`http://<host>/#/wb/todo`

---

## public/screens 文案说明

`public/screens/` 下静态大屏/演示页已将 **产品标题类**文案从“肾移植”统一为“器官移植”；  
涉及科室的“**肾移植科**”等表述按需求保持不改。

---

## 备份/清理建议

如需“只保留前端项目本体”再做备份，建议删除以下可再生成内容：

- `node_modules/`
- `dist/`
- `test-results/`、`playwright-report/`
- `coverage/`、`.vite/`、`*.log`

保留源码与配置：`src/`、`public/`、`tests/`、`package*.json`、`vite.config.ts`、`tsconfig*.json` 等。

---

## Phase 5 模块页统一升级（视觉 / 信息密度）

为让 30+ 个业务模块页（AI / 报告 / 科研 / 系统 / 财务 / 捐献 / 随访）获得一致、专业的医疗后台外观，
本轮以 **`MedCrudPage` 通用骨架** 为杠杆点，一次升级，全量受益。

### 1. `MedCrudPage` 自动派生的视觉增强

只需保持原有 `title / desc / kpis / columns / fields / crud` 调用方式，下列特性会自动出现：

- **面包屑**：`工作台 / 分组 / 页面`，从 `useRoute() + MENU` 自动推导（也可显式传 `breadcrumb` 覆盖）。
- **标题徽章**：自动显示 `共 N 条`（`badge` 可覆盖；`badgeTone` 控制色阶）。
- **状态 chips**：根据 `crud.loading / errorText / 当前筛选 / 已选中` 自动派生。
  - 也可显式传 `chips: HeaderChip[]` 覆盖。
- **KPI sparkline**：每张 `MedStatCard` 自动渲染近 12 期迷你曲线，按 `tone` 着色。
  - 自定义曲线：在 `KpiDef` 上传 `sparkline: number[]`。
- **密度切换**：工具栏右侧 `标准 / 紧凑` 段控件，联动 `MedTableCard` 表格行高与字号。
- **列设置**：工具栏 `列 (N/M)` 下拉，按 `dataIndex` 隐藏/显示列、重置。
- **空态升级**：带渐变插画 + 主标题 + 上下文化提示（搜索词 / 筛选 / 全空）+ CTA 「新增」按钮。
- **错误态**：附带「重试」按钮 + 错误副提示。

### 2. 视图切片（可选）

业务页可按状态字段提供「视图切片」药丸：

```vue
<MedCrudPage
  :views="[
    { key: 'all', label: '全部', count: total },
    { key: 'overdue', label: '已逾期', count: overdueCount },
    { key: 'highrisk', label: '高危', count: hrCount, tip: '风险=高' }
  ]"
  v-model:active-view="activeView"
  ...
/>
```

切换时 `activeView` 通过 v-model 双向绑定，业务在 `useCrudList.customFilter` 中按其过滤即可。

### 3. 顶部 actions 槽

可向 `MedPageHeader` 注入页头右上角额外按钮（与工具栏的 新增/导出/刷新 互不冲突）：

```vue
<MedCrudPage ...>
  <template #header-actions>
    <a-button type="primary"><template #icon><icon-plus/></template>新建</a-button>
  </template>
</MedCrudPage>
```

### 4. 图表区间切换

`MedChartCard` 支持 `ranges + v-model:activeRange`：

```vue
<MedChartCard
  :option="opt"
  title="指标趋势"
  :ranges="[
    { key: 'all', label: '全部' },
    { key: 'last4', label: '近4次' }
  ]"
  v-model:active-range="range"
/>
```

已落地：`ReportTrendView`（全部 / 近 4·3·2 次）、`FollowPlanView`（4·8·12 周）、`SettleFundView`（当前筛选 / 全部）。

### 5. 单独升级（不走 MedCrudPage 的页面）

- `views/patients/PatientsList.vue`（按 default / abnormal / recent 三种 preset 切换面包屑、chips、KPI sparkline）
- `views/patients/PatientsTags.vue`
- `views/modules/FollowTasksView.vue`（5 视图切片：全部 / 待执行 / 已逾期 / 高危 / 已完成）
- `views/modules/FollowRecordsView.vue`（5 视图切片：全部 / 指标异常 / 依从风险 / 门诊 / 微信）
- `views/donor/DonorInfo.vue`

### 6. 新增 / 增强的组件 API 速查

- `MedPageHeader`：`breadcrumb?: string[]`、`badge?: string`、`badgeTone?: HeaderChipTone`、`chips?: HeaderChip[]`，槽 `actions / chips / extra`。
- `MedListToolbar`：`views? + v-model:activeView`、`densityToggle + v-model:density`、`columnOptions? + v-model:hiddenColumns`。
- `MedTableCard`：`density?: 'comfortable'|'compact'`。
- `MedStatCard`：`sparkline?: number[]`。
- `MedChartCard`：`title?, desc?, ranges?, v-model:activeRange`。
- `MedPageStates`：`loadingHint? / emptyHint? / errorHint?`，空态升级为渐变插画 + CTA 槽。
- `MedCrudPage`：以上特性自动启用，可通过 props 显式覆盖。

### 7. E2E 回归

`tests/med-crud-upgrade.spec.ts` 覆盖：

- `ai.risk` 页面：面包屑 / 徽章 / chips / 密度切换 / 列设置 / KPI sparkline 渲染。
- `follow.tasks` 页面：视图切片可点击切换激活态。

运行：`npm run test:e2e`（需要先 `npm run dev` 或 Playwright 自动 `webServer`）。


