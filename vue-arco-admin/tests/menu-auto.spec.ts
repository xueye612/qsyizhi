import { test, expect } from '@playwright/test';

function aiTitleLocator(page: import('@playwright/test').Page) {
  // 过渡期兼容：历史页「AI 决策辅助」→ 统一组件「AI辅助建议」
  return page.getByText(/AI\s*(决策辅助|辅助建议)/);
}

/** 侧栏中展开「随访管理」分组 */
async function expandFollowGroup(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByText('随访管理', { exact: true }).click();
}

async function expandReportGroup(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByText('报告中心', { exact: true }).click();
}

async function expandAIGroup(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByText('AI辅助', { exact: true }).click();
}

async function expandDonorGroup(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByText('供体管理', { exact: true }).click();
}

async function expandSettleGroup(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByText('结算中心', { exact: true }).click();
}

async function expandResearchGroup(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByText('科研分析', { exact: true }).click();
}

async function expandSysGroup(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByText('系统管理', { exact: true }).click();
}

test.describe('菜单页自动化（独立页回归）', () => {
  test('follow.tasks：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandFollowGroup(page);
    await page.getByText('随访任务', { exact: true }).click();

    await expect(page).toHaveURL(/\/follow\/tasks/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('follow.records：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandFollowGroup(page);
    await page.getByText('随访记录', { exact: true }).click();

    await expect(page).toHaveURL(/\/follow\/records/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('follow.plan：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandFollowGroup(page);
    await page.getByText('监护计划', { exact: true }).click();

    await expect(page).toHaveURL(/\/follow\/plan/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('follow.wxlog：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandFollowGroup(page);
    await page.getByText('企业微信推送记录', { exact: true }).click();

    await expect(page).toHaveURL(/\/follow\/wxlog/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('report.upload：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandReportGroup(page);
    await page.getByText('报告上传', { exact: true }).click();
    await expect(page).toHaveURL(/\/report\/upload/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('report.parse：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandReportGroup(page);
    await page.getByText('报告解析', { exact: true }).click();
    await expect(page).toHaveURL(/\/report\/parse/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('report.trend：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandReportGroup(page);
    await page.getByText('指标趋势', { exact: true }).click();
    await expect(page).toHaveURL(/\/report\/trend/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('report.archive：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandReportGroup(page);
    await page.getByText('数据归档', { exact: true }).click();
    await expect(page).toHaveURL(/\/report\/archive/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('ai.chat：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandAIGroup(page);
    await page.getByText('AI问诊', { exact: true }).click();
    await expect(page).toHaveURL(/\/ai\/chat/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('ai.risk：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandAIGroup(page);
    await page.getByText('风险识别', { exact: true }).click();
    await expect(page).toHaveURL(/\/ai\/risk/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('ai.alert：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandAIGroup(page);
    await page.getByText('异常报警', { exact: true }).click();
    await expect(page).toHaveURL(/\/ai\/alert/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('ai.interpret：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandAIGroup(page);
    await page.getByText('指标解读', { exact: true }).click();
    await expect(page).toHaveURL(/\/ai\/interpret/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('ai.intervene：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandAIGroup(page);
    await page.getByText('AI干预记录', { exact: true }).click();
    await expect(page).toHaveURL(/\/ai\/intervene/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('donor.family：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandDonorGroup(page);
    await page.getByText('家属信息', { exact: true }).click();
    await expect(page).toHaveURL(/\/donor\/family/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('donor.audit：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandDonorGroup(page);
    await page.getByText('审核流程', { exact: true }).click();
    await expect(page).toHaveURL(/\/donor\/audit/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('settle.pay：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandSettleGroup(page);
    await page.getByText('抚恤金支付', { exact: true }).click();
    await expect(page).toHaveURL(/\/settle\/pay/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('settle.receiver：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandSettleGroup(page);
    await page.getByText('受体费用管理', { exact: true }).click();
    await expect(page).toHaveURL(/\/settle\/receiver/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('settle.fund：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandSettleGroup(page);
    await page.getByText('资金监管', { exact: true }).click();
    await expect(page).toHaveURL(/\/settle\/fund/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('settle.recon：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandSettleGroup(page);
    await page.getByText('对账系统', { exact: true }).click();
    await expect(page).toHaveURL(/\/settle\/recon/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('research.db：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandResearchGroup(page);
    await page.getByText('科研数据库', { exact: true }).click();
    await expect(page).toHaveURL(/\/research\/db/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('research.filter：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandResearchGroup(page);
    await page.getByText('患者筛选', { exact: true }).click();
    await expect(page).toHaveURL(/\/research\/filter/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('research.survey：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandResearchGroup(page);
    await page.getByText('问卷管理', { exact: true }).click();
    await expect(page).toHaveURL(/\/research\/survey/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('research.export：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandResearchGroup(page);
    await page.getByText('数据导出', { exact: true }).click();
    await expect(page).toHaveURL(/\/research\/export/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('research.stats：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandResearchGroup(page);
    await page.getByText('统计分析', { exact: true }).click();
    await expect(page).toHaveURL(/\/research\/stats/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('sys.users：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandSysGroup(page);
    await page.getByText('用户管理', { exact: true }).click();
    await expect(page).toHaveURL(/\/sys\/users/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('sys.roles：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandSysGroup(page);
    await page.getByText('角色权限', { exact: true }).click();
    await expect(page).toHaveURL(/\/sys\/roles/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('sys.consent：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandSysGroup(page);
    await page.getByText('知情同意', { exact: true }).click();
    await expect(page).toHaveURL(/\/sys\/consent/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('sys.audit：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandSysGroup(page);
    await page.getByText('操作日志', { exact: true }).click();
    await expect(page).toHaveURL(/\/sys\/audit/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });

  test('sys.cfg：可访问、KPI、表格、AI 决策区、菜单高亮', async ({ page }) => {
    await expandSysGroup(page);
    await page.getByText('系统配置', { exact: true }).click();
    await expect(page).toHaveURL(/\/sys\/cfg/);
    await expect(page.getByTestId('kpi-region')).toBeVisible();
    await expect(page.getByTestId('biz-table')).toBeVisible();
    await expect(page.locator('.arco-table, table').first()).toBeVisible();
    await expect(page.getByTestId('ai-decision')).toBeVisible();
    await expect(aiTitleLocator(page)).toBeVisible();
    await expect(page.locator('.arco-menu-selected').first()).toBeVisible();
  });
});
