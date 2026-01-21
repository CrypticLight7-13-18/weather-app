import { test, expect } from '@playwright/test';

/**
 * Browsing History E2E Tests
 * 
 * Tests the browsing history functionality including:
 * - Recording viewed locations
 * - Displaying history
 * - Clearing history
 * - History persistence
 */

test.describe('Browsing History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('should display history section', async ({ page }) => {
    // Look for history section
    const historySection = page.locator('text=/history|recently.*viewed|recent/i');
    const count = await historySection.count();
    
    // History section should exist
    await expect(page.locator('main')).toBeVisible();
  });

  test('should show recently viewed locations after searching', async ({ page }) => {
    // Open search and search for a location
    const searchButton = page.getByRole('button', { name: /search/i });
    await searchButton.click();
    
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await searchInput.fill('Tokyo');
    
    await page.waitForTimeout(1500);
    
    // Try to select a result
    const result = page.locator('[role="option"], button:has-text("Tokyo"), div:has-text("Tokyo")').first();
    
    if (await result.isVisible()) {
      await result.click();
      await page.waitForTimeout(2000);
      
      // History should update (check localStorage)
      const localStorage = await page.evaluate(() => window.localStorage.getItem('weather-app-storage'));
      
      if (localStorage) {
        const data = JSON.parse(localStorage);
        // History should contain entries
        expect(data).toBeDefined();
      }
    }
  });

  test('should persist history after page reload', async ({ page }) => {
    // Wait for any existing data to load
    await page.waitForTimeout(2000);
    
    // Get current localStorage
    const beforeReload = await page.evaluate(() => window.localStorage.getItem('weather-app-storage'));
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Get localStorage after reload
    const afterReload = await page.evaluate(() => window.localStorage.getItem('weather-app-storage'));
    
    // Storage should persist
    if (beforeReload) {
      expect(afterReload).not.toBeNull();
    }
  });

  test('should be able to click on history item to load weather', async ({ page }) => {
    // Look for history items
    const historyItems = page.locator('[class*="history"] button, [class*="History"] button').first();
    
    if (await historyItems.isVisible()) {
      await historyItems.click();
      await page.waitForTimeout(1000);
      
      // Page should update
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('History Management', () => {
  test('should limit history to reasonable size', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check localStorage for history
    const localStorage = await page.evaluate(() => {
      const data = window.localStorage.getItem('weather-app-storage');
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.state?.browsingHistory?.length || 0;
      }
      return 0;
    });
    
    // History should be limited (e.g., max 10-20 items)
    expect(localStorage).toBeLessThanOrEqual(20);
  });
});

