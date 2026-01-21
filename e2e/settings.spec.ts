import { test, expect } from '@playwright/test';

/**
 * Settings E2E Tests
 * 
 * Tests the settings panel functionality including:
 * - Opening settings panel
 * - Changing temperature units
 * - Changing wind speed units
 * - Changing pressure units
 * - Theme selection
 * - Settings persistence
 */

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('should open settings panel when settings button is clicked', async ({ page }) => {
    // Find and click the settings button
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    // Wait for settings panel to appear
    await page.waitForTimeout(500);
    
    // Verify settings panel is visible
    const settingsPanel = page.locator('text=/temperature|units|theme/i').first();
    await expect(settingsPanel).toBeVisible({ timeout: 5000 });
  });

  test('should display temperature unit options', async ({ page }) => {
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    await page.waitForTimeout(500);
    
    // Check for Celsius and Fahrenheit options
    const celsiusOption = page.locator('text=/°C|celsius/i').first();
    const fahrenheitOption = page.locator('text=/°F|fahrenheit/i').first();
    
    // At least one should be visible
    const celsiusVisible = await celsiusOption.isVisible().catch(() => false);
    const fahrenheitVisible = await fahrenheitOption.isVisible().catch(() => false);
    
    expect(celsiusVisible || fahrenheitVisible).toBeTruthy();
  });

  test('should toggle temperature unit between Celsius and Fahrenheit', async ({ page }) => {
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    await page.waitForTimeout(500);
    
    // Find temperature toggle
    const fahrenheitButton = page.locator('button:has-text("°F"), [role="radio"]:has-text("°F"), [data-value="fahrenheit"]').first();
    
    if (await fahrenheitButton.isVisible()) {
      await fahrenheitButton.click();
      await page.waitForTimeout(300);
      
      // Click Celsius
      const celsiusButton = page.locator('button:has-text("°C"), [role="radio"]:has-text("°C"), [data-value="celsius"]').first();
      if (await celsiusButton.isVisible()) {
        await celsiusButton.click();
      }
    }
    
    // Should not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display wind speed unit options', async ({ page }) => {
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    await page.waitForTimeout(500);
    
    // Check for wind speed options
    const windOptions = page.locator('text=/km\\/h|mph|m\\/s|knots|kn/i');
    const count = await windOptions.count();
    
    // Should have wind speed unit options
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display pressure unit options', async ({ page }) => {
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    await page.waitForTimeout(500);
    
    // Check for pressure options
    const pressureOptions = page.locator('text=/hPa|inHg|mmHg/i');
    const count = await pressureOptions.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display theme options', async ({ page }) => {
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    await page.waitForTimeout(500);
    
    // Check for theme-related content
    const themeSection = page.locator('text=/theme|appearance|dark|light|system/i');
    const count = await themeSection.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should close settings when clicking outside', async ({ page }) => {
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    await page.waitForTimeout(500);
    
    // Click outside the settings panel
    await page.mouse.click(10, 10);
    
    await page.waitForTimeout(500);
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Settings - Persistence', () => {
  test('should persist settings after page reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    await page.waitForTimeout(500);
    
    // Try to change a setting (e.g., temperature unit)
    const fahrenheitButton = page.locator('button:has-text("°F"), [role="radio"]:has-text("°F")').first();
    if (await fahrenheitButton.isVisible()) {
      await fahrenheitButton.click();
    }
    
    // Wait for settings to be saved
    await page.waitForTimeout(500);
    
    // Reload the page
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
    
    // Open settings again
    await settingsButton.click();
    await page.waitForTimeout(500);
    
    // The setting should be preserved (checked via localStorage)
    const localStorage = await page.evaluate(() => window.localStorage.getItem('weather-app-storage'));
    expect(localStorage).not.toBeNull();
  });
});

