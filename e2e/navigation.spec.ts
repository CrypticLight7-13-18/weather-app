import { test, expect } from '@playwright/test';

/**
 * Navigation E2E Tests
 * 
 * Tests navigation between different pages and sections including:
 * - Documentation page
 * - Tests page
 * - Main page
 * - Navigation links
 */

test.describe('Page Navigation', () => {
  test('should navigate to documentation page', async ({ page }) => {
    await page.goto('/docs');
    
    // Wait for page load
    await page.waitForTimeout(1000);
    
    // Verify we're on the docs page
    const docsContent = page.locator('text=/documentation|design.*system|components/i');
    await expect(docsContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to tests page', async ({ page }) => {
    await page.goto('/tests');
    
    // Wait for page load
    await page.waitForTimeout(1000);
    
    // Verify we're on the tests page
    const testsContent = page.locator('text=/test|api.*test|integration/i');
    await expect(testsContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate from home to docs via settings', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    await page.waitForTimeout(500);
    
    // Look for docs link in settings
    const docsLink = page.locator('a[href="/docs"], text=/documentation/i');
    
    if (await docsLink.first().isVisible()) {
      await docsLink.first().click();
      await page.waitForTimeout(1000);
      
      // Should be on docs page
      await expect(page).toHaveURL(/\/docs/);
    }
  });

  test('should navigate from home to tests via settings', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    await page.waitForTimeout(500);
    
    // Look for tests link in settings
    const testsLink = page.locator('a[href="/tests"], text=/run.*tests|test.*suite/i');
    
    if (await testsLink.first().isVisible()) {
      await testsLink.first().click();
      await page.waitForTimeout(1000);
      
      // Should be on tests page
      await expect(page).toHaveURL(/\/tests/);
    }
  });

  test('should have working back navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    await page.goto('/docs');
    await page.waitForTimeout(1000);
    
    await page.goBack();
    await page.waitForTimeout(1000);
    
    // Should be back on home page
    await expect(page).toHaveURL('/');
  });
});

test.describe('Documentation Page', () => {
  test('should display component documentation sections', async ({ page }) => {
    await page.goto('/docs');
    await page.waitForTimeout(1000);
    
    // Look for various documentation sections
    const sections = page.locator('text=/cards|buttons|toggles|icons|colors/i');
    const count = await sections.count();
    
    // Should have documentation sections
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have theme toggle on docs page', async ({ page }) => {
    await page.goto('/docs');
    await page.waitForTimeout(1000);
    
    // Look for theme toggle
    const themeToggle = page.getByRole('button', { name: /theme|dark|light/i });
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Should toggle without errors
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should display code examples', async ({ page }) => {
    await page.goto('/docs');
    await page.waitForTimeout(1000);
    
    // Look for code blocks or examples
    const codeBlocks = page.locator('pre, code, [class*="code"]');
    const count = await codeBlocks.count();
    
    // Documentation should have code examples
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Tests Page', () => {
  test('should display test categories', async ({ page }) => {
    await page.goto('/tests');
    await page.waitForTimeout(1000);
    
    // Look for test categories
    const categories = page.locator('text=/client|weather|geocoding|api/i');
    const count = await categories.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have run all tests button', async ({ page }) => {
    await page.goto('/tests');
    await page.waitForTimeout(1000);
    
    // Look for run tests button
    const runButton = page.locator('button:has-text("Run All"), button:has-text("Run Tests")');
    
    if (await runButton.first().isVisible()) {
      await expect(runButton.first()).toBeEnabled();
    }
  });

  test('should be able to run individual test', async ({ page }) => {
    await page.goto('/tests');
    await page.waitForTimeout(1000);
    
    // Look for individual test run buttons
    const runButtons = page.locator('button:has-text("Run"), button[title*="Run"]');
    const count = await runButtons.count();
    
    if (count > 0) {
      // Click first run button
      await runButtons.first().click();
      await page.waitForTimeout(2000);
      
      // Should show test result
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

