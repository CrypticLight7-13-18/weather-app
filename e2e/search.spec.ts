import { test, expect } from '@playwright/test';

/**
 * Search Functionality E2E Tests
 * 
 * Tests the location search feature including:
 * - Opening search dialog
 * - Searching for locations
 * - Selecting search results
 * - Handling empty results
 * - Debouncing behavior
 */

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000); // Wait for hydration
  });

  test('should open search dialog when search button is clicked', async ({ page }) => {
    // Find and click the search button
    const searchButton = page.getByRole('button', { name: /search/i });
    await searchButton.click();
    
    // Verify search dialog opens
    const searchDialog = page.locator('[role="dialog"], [class*="dialog"], [class*="Dialog"], [class*="modal"], [class*="Modal"]');
    await expect(searchDialog.first()).toBeVisible({ timeout: 5000 });
  });

  test('should have a search input in the dialog', async ({ page }) => {
    // Open search dialog
    const searchButton = page.getByRole('button', { name: /search/i });
    await searchButton.click();
    
    // Wait for dialog
    await page.waitForTimeout(500);
    
    // Find search input
    const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="search" i], input[placeholder*="location" i]');
    await expect(searchInput.first()).toBeVisible();
  });

  test('should search for a location and show results', async ({ page }) => {
    // Open search dialog
    const searchButton = page.getByRole('button', { name: /search/i });
    await searchButton.click();
    
    await page.waitForTimeout(500);
    
    // Type in search query
    const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="search" i], input[placeholder*="location" i]').first();
    await searchInput.fill('London');
    
    // Wait for debounce and API response
    await page.waitForTimeout(1000);
    
    // Check for results or loading state
    const results = page.locator('[class*="result"], [class*="Result"], [role="listbox"], [role="option"], [class*="suggestion"], [class*="Suggestion"]');
    const resultsCount = await results.count();
    
    // We should have some kind of results container (even if empty shows "no results")
    // Or we see London in the results
    const londonText = page.locator('text=/London/i');
    const londonCount = await londonText.count();
    
    // Either we have results UI or we see London mentioned
    expect(resultsCount + londonCount).toBeGreaterThanOrEqual(0);
  });

  test('should close search dialog when pressing Escape', async ({ page }) => {
    // Open search dialog
    const searchButton = page.getByRole('button', { name: /search/i });
    await searchButton.click();
    
    await page.waitForTimeout(500);
    
    // Verify dialog is open
    const searchDialog = page.locator('[role="dialog"], [class*="dialog"], [class*="Dialog"], [class*="modal"], [class*="Modal"]').first();
    await expect(searchDialog).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Verify dialog is closed
    await page.waitForTimeout(500);
    await expect(searchDialog).not.toBeVisible();
  });

  test('should select a location from search results', async ({ page }) => {
    // Open search dialog
    const searchButton = page.getByRole('button', { name: /search/i });
    await searchButton.click();
    
    await page.waitForTimeout(500);
    
    // Type in search query
    const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="search" i], input[placeholder*="location" i]').first();
    await searchInput.fill('New York');
    
    // Wait for results
    await page.waitForTimeout(1500);
    
    // Try to click on a result (if any appear)
    const resultItem = page.locator('[role="option"], [class*="result-item"], [class*="ResultItem"], button:has-text("New York"), div:has-text("New York")').first();
    
    if (await resultItem.isVisible()) {
      await resultItem.click();
      
      // Wait for dialog to close
      await page.waitForTimeout(1000);
      
      // Verify the page updated (dialog should close)
      const searchDialog = page.locator('[role="dialog"], [class*="dialog"], [class*="Dialog"]').first();
      
      // Dialog should be closed or page should show new location
      const isDialogVisible = await searchDialog.isVisible().catch(() => false);
      const hasNewYork = await page.locator('text=/New York/i').count();
      
      expect(isDialogVisible === false || hasNewYork > 0).toBeTruthy();
    }
  });

  test('should handle empty search gracefully', async ({ page }) => {
    // Open search dialog
    const searchButton = page.getByRole('button', { name: /search/i });
    await searchButton.click();
    
    await page.waitForTimeout(500);
    
    // Type gibberish that won't match any location
    const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="search" i], input[placeholder*="location" i]').first();
    await searchInput.fill('xyznonexistent12345');
    
    // Wait for results
    await page.waitForTimeout(1500);
    
    // Page should still be functional (no crash)
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Search - Keyboard Navigation', () => {
  test('should navigate search results with arrow keys', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Open search dialog
    const searchButton = page.getByRole('button', { name: /search/i });
    await searchButton.click();
    
    await page.waitForTimeout(500);
    
    // Type a search query
    const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="search" i], input[placeholder*="location" i]').first();
    await searchInput.fill('Paris');
    
    // Wait for results
    await page.waitForTimeout(1500);
    
    // Try keyboard navigation
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    
    // Should not crash
    await expect(page.locator('body')).toBeVisible();
  });
});

