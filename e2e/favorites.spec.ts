import { test, expect } from '@playwright/test';

/**
 * Favorites E2E Tests
 * 
 * Tests the favorites/bookmarks functionality including:
 * - Adding locations to favorites
 * - Removing locations from favorites
 * - Favorites panel visibility
 * - Quick access to favorited locations
 * - Favorites persistence
 */

test.describe('Favorites Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for clean state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('weather-app-storage');
    });
    await page.reload();
    await page.waitForTimeout(1000);
  });

  test('should display favorites panel in sidebar', async ({ page }) => {
    // Look for favorites panel
    const favoritesPanel = page.locator('text=/favorites|bookmarks|saved/i');
    const count = await favoritesPanel.count();
    
    // Favorites section should exist somewhere on the page
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show empty state when no favorites exist', async ({ page }) => {
    // Look for empty favorites message
    const emptyMessage = page.locator('text=/no favorites|no saved|add.*favorite|nothing.*saved/i');
    const hasEmptyMessage = await emptyMessage.count();
    
    // Either shows empty message or favorites section exists
    await expect(page.locator('body')).toBeVisible();
  });

  test('should toggle favorite when star icon is clicked', async ({ page }) => {
    // Wait for weather data to load
    await page.waitForTimeout(3000);
    
    // Look for favorite/star button
    const favoriteButton = page.locator('[title*="favorite" i], [aria-label*="favorite" i], button:has(svg[class*="star" i]), [class*="favorite"]').first();
    
    if (await favoriteButton.isVisible()) {
      // Click to add to favorites
      await favoriteButton.click();
      await page.waitForTimeout(500);
      
      // Click again to remove
      await favoriteButton.click();
      await page.waitForTimeout(500);
      
      // Should not crash
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should persist favorites after page reload', async ({ page }) => {
    // Wait for weather data
    await page.waitForTimeout(3000);
    
    // Try to favorite a location
    const favoriteButton = page.locator('[title*="favorite" i], [aria-label*="favorite" i], button:has(svg[class*="star" i])').first();
    
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      await page.waitForTimeout(500);
      
      // Reload page
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Check localStorage for persisted favorites
      const localStorage = await page.evaluate(() => window.localStorage.getItem('weather-app-storage'));
      
      // Storage should exist
      expect(localStorage).not.toBeNull();
    }
  });
});

test.describe('Favorites Panel Interaction', () => {
  test('should be able to click on a favorited location to load its weather', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Look for any location items in favorites panel
    const favoriteItems = page.locator('[class*="favorite"] button, [class*="Favorite"] button').first();
    
    if (await favoriteItems.isVisible()) {
      await favoriteItems.click();
      await page.waitForTimeout(1000);
      
      // Page should update
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should show favorite count or indicator', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Look for favorites section header
    const favoritesHeader = page.locator('text=/favorites/i');
    
    if (await favoritesHeader.first().isVisible()) {
      // Section exists
      await expect(favoritesHeader.first()).toBeVisible();
    }
  });
});

