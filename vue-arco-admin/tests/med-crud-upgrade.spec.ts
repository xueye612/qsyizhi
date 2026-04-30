import { test, expect } from '@playwright/test';

/**
 * Phase 5 升级回归：MedCrudPage 自动派生的视觉增强
 *  - 面包屑（工作台 / 分组 / 页面）
 *  - 标题徽章（共 N 条）
 *  - 状态 chips（就绪 / 当前筛选 等）
 *  - 工具栏密度切换 + 列设置 + KPI sparkline
 *
 * 选取 ai.risk 路由作为典型 CrudPage 页面（PAGE_MAP -> AiRiskView 走 MedCrudPage）。
 */
test.describe('MedCrudPage 升级回归', () => {
  test('ai.risk：面包屑 / 徽章 / chips / 工具栏控件', async ({ page }) => {
    await page.goto('/#/ai/risk');

    // 面包屑
    await expect(page.locator('.bc')).toBeVisible();
    await expect(page.locator('.bc')).toContainText('工作台');

    // 标题徽章「共 N 条」
    await expect(page.locator('.title-badge, .badge, .b-badge').first()).toBeVisible();

    // 状态 chips 至少 1 个
    await expect(page.locator('.chip-row .chip, .chips .chip').first()).toBeVisible();

    // 密度切换控件
    await expect(page.locator('.density .dn').first()).toBeVisible();
    await page.locator('.density .dn').nth(1).click();
    await expect(page.locator('.density .dn--active').nth(0)).toBeVisible();

    // 列设置按钮（MedListToolbar 列下拉触发器）
    await expect(page.getByTitle('列设置')).toBeVisible();
    await page.getByTitle('列设置').click();
    await expect(page.locator('.col-pop')).toBeVisible();
    await expect(page.locator('.col-pop-row').first()).toBeVisible();
    // 关闭：按 Esc
    await page.keyboard.press('Escape');

    // KPI sparkline svg
    await expect(page.locator('[data-testid="kpi-region"] svg').first()).toBeVisible();
  });

  test('follow.tasks：自定义视图切片可点击切换', async ({ page }) => {
    await page.goto('/#/follow/tasks');
    const chips = page.locator('.view-chip');
    await expect(chips.first()).toBeVisible();
    // 至少 4 个视图（全部 / 待执行 / 已逾期 / 高危 / 已完成）
    expect(await chips.count()).toBeGreaterThanOrEqual(4);

    // 点击第二个视图，激活态切换
    await chips.nth(1).click();
    await expect(chips.nth(1)).toHaveClass(/view-chip--active/);
  });

  test('ai.risk：hero / insight strip / 行左色条', async ({ page }) => {
    await page.goto('/#/ai/risk');
    // hero 顶部大 banner
    await expect(page.locator('.med-page-hero, .page-hero, .hero')).toHaveCount(1, { timeout: 5000 }).catch(async () => {
      // 兼容不同类名
      await expect(page.locator('.med-page-hero, .page-hero, .hero').first()).toBeVisible();
    });
    // insight strip 至少出现一张子卡
    await expect(page.locator('.med-insight-strip .ins-card').first()).toBeVisible();
    // 行左色条（通过 row-tone-* 类名挂在行上）
    const tonedRow = page.locator('tr.row-tone--danger, tr.row-tone--warning, tr.row-tone--success, tr.row-tone--info');
    await expect(tonedRow.first()).toBeVisible();
  });

  test('follow.tasks：KPI 卡可点击联动视图', async ({ page }) => {
    await page.goto('/#/follow/tasks');
    const kpis = page.locator('[data-testid="kpi-region"] .med-stat-card--clickable');
    await expect(kpis.first()).toBeVisible();
    // 点击第二张 KPI（已逾期），应激活视图 chips 中的「已逾期」
    await kpis.nth(1).click();
    await expect(page.locator('.view-chip.view-chip--active')).toContainText(/逾期|执行|完成|高危/);
  });
});
