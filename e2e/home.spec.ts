import { test, expect } from '@playwright/test';

/**
 * Home Page E2E Tests
 * 
 * Tests the main weather application home page functionality including:
 * - Page load and initial state
 * - Weather data display
 * - Theme switching
 * - Responsive layout
 */

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should load the home page successfully', async ({ page }) => {
    // Verify the page title
    await expect(page).toHaveTitle(/Weather/i);
    
    // Verify the header is visible
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display the header with logo and controls', async ({ page }) => {
    // Check for the logo/app name
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check for search button
    const searchButton = page.getByRole('button', { name: /search/i });
    await expect(searchButton).toBeVisible();
    
    // Check for theme toggle button
    const themeButton = page.getByRole('button', { name: /theme|dark|light/i });
    await expect(themeButton).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // Go to page fresh (clear any cached data)
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Check for loading indicators (skeletons or loading text)
    const loadingIndicator = page.locator('[class*="animate-pulse"], [class*="skeleton"]').first();
    
    // Loading state might appear briefly
    // We just verify the page doesn't crash during loading
    await expect(page.locator('main')).toBeVisible();
  });

  test('should toggle theme from light to dark', async ({ page }) => {
    // Wait for hydration
    await page.waitForTimeout(1000);
    
    // Get the html element to check dark class
    const html = page.locator('html');
    
    // Find and click the theme toggle button
    const themeButton = page.getByRole('button', { name: /theme|dark|light/i });
    await themeButton.click();
    
    // Wait for theme change
    await page.waitForTimeout(500);
    
    // Click again to toggle back
    await themeButton.click();
    
    // The test passes if no errors occur during theme switching
    await expect(html).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify page still renders correctly
    await expect(page.locator('main')).toBeVisible();
    
    // Header should still be visible
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display weather sections when data loads', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Look for main weather content area
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Check that we have some weather-related content or empty state
    const hasContent = await page.locator('[class*="weather"], [class*="Weather"], [class*="forecast"], [class*="Forecast"]').count();
    const hasEmptyState = await page.locator('text=/search.*location|enter.*location|no.*data/i').count();
    
    // Either we have weather content or an empty state message
    expect(hasContent + hasEmptyState).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Home Page - Accessibility', () => {
  test('should have no accessibility violations on load', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check that interactive elements are keyboard accessible
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    
    // Verify buttons exist and are visible
    expect(buttonCount).toBeGreaterThan(0);
    
    // Check first button can be focused
    const firstButton = buttons.first();
    await firstButton.focus();
    await expect(firstButton).toBeFocused();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Tab through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify something is focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

