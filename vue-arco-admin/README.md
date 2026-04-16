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


