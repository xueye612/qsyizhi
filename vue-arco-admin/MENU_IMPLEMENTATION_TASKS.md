# 菜单独立页实施任务清单（按 `src/menu/menu.ts` 顺序）

规则：每批 2 个叶子菜单；已有独立页不覆盖；新页放在 `src/views/modules/`；每页含四步注释 + KPI + 表格 + AI 决策区 + `data-testid`；每批合并后跑 `npm run build` 与 `npx playwright test`。

## 跳过（已有独立页，勿覆盖）

| key | 说明 |
|-----|------|
| wb.todo / wb.abnormal / wb.recent | 工作台专页 |
| patients.list / patients.new / patients.tags | 患者管理 |
| donor.info | 供体信息 |

## 批次进度

| 批次 | 菜单 key | 组件文件 | 状态 |
|------|-----------|----------|------|
| B01 | follow.tasks | FollowTasksView.vue |已完成 |
| B01 | follow.records | FollowRecordsView.vue | 已完成 |
| B02 | follow.plan | FollowPlanView.vue | 已完成 |
| B02 | follow.wxlog | FollowWxlogView.vue | 已完成 |
| B03 | report.upload | ReportUploadView.vue | 已完成 |
| B03 | report.parse | ReportParseView.vue | 已完成 |
| B04 | report.trend | ReportTrendView.vue | 已完成 |
| B04 | report.archive | ReportArchiveView.vue | 已完成 |
| B05 | ai.chat | AiChatView.vue | 已完成 |
| B05 | ai.risk | AiRiskView.vue | 已完成 |
| B06 | ai.alert | AiAlertView.vue | 已完成 |
| B06 | ai.interpret | AiInterpretView.vue | 已完成 |
| B07 | ai.intervene | AiInterveneView.vue | 已完成 |
| B07 | donor.family | DonorFamilyView.vue | 已完成 |
| B08 | donor.audit | DonorAuditView.vue | 已完成 |
| B08 | settle.pay | SettlePayView.vue | 已完成 |
| B09 | settle.receiver | SettleReceiverView.vue | 已完成 |
| B09 | settle.fund | SettleFundView.vue | 已完成 |
| B10 | settle.recon | SettleReconView.vue | 已完成 |
| B10 | research.db | ResearchDbView.vue | 已完成 |
| B11 | research.filter | ResearchFilterView.vue | 已完成 |
| B11 | research.survey | ResearchSurveyView.vue | 已完成 |
| B12 | research.export | ResearchExportView.vue | 已完成 |
| B12 | research.stats | ResearchStatsView.vue | 已完成 |
| B13 | sys.users | SysUsersView.vue | 已完成 |
| B13 | sys.roles | SysRolesView.vue | 已完成 |
| B14 | sys.consent | SysConsentView.vue | 已完成 |
| B14 | sys.audit | SysAuditView.vue | 已完成 |
| B15 | sys.cfg | SysCfgView.vue | 已完成 |

## 仍走通用壳（待替换）

当前 `MENU` 中列出的叶子菜单均已映射独立组件；若后续新增菜单项且未加入 `PAGE_MAP`，将仍回退到 `StandardModuleView.vue`。

## 测试

- 配置：`playwright.config.ts`
- 用例：`tests/menu-auto.spec.ts`（每新增一批追加 2 个 `test`）
- 命令：`npm run build` → `npx playwright test`
