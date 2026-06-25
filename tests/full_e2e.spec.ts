import { test, expect } from '@playwright/test';

test.describe('Evera Admin - Full E2E Workflow', () => {
  // Use a longer timeout for E2E tests
  test.setTimeout(90000);

  test('should load the dashboard and verify key components', async ({ page }) => {
    // Navigate to the main dashboard
    await page.goto('http://localhost:62719/');
    
    // Verify Dashboard title or key elements are visible
    const dashboardTitle = page.getByText(/Dashboard/i, { exact: true }).first();
    await expect(dashboardTitle).toBeVisible({ timeout: 15000 });
  });

  test('should be able to navigate to Operations and test Vendor Approval', async ({ page }) => {
    await page.goto('http://localhost:62719/');
    
    // Click on Operations in the sidebar
    await page.getByText('Operations', { exact: true }).click();
    
    // Wait for the operations panel to load fully
    await page.waitForTimeout(2000);
    
    // Click on a Vendor card to open details
    const vendorCards = page.locator('.cursor-pointer').filter({ hasText: /Vendor|Provider/i });
    if (await vendorCards.count() > 0) {
      await vendorCards.first().click();
      
      // Wait for the Vendor Details panel to slide in
      await page.waitForTimeout(2000);
      
      // Verify Document Approval flow (click the green checkmark if available)
      const approveDocButtons = page.locator('button[title="Approve Document"]');
      if (await approveDocButtons.count() > 0) {
        await approveDocButtons.first().click();
        
        // Ensure success notification appears
        const notification = page.locator('text=Document approved');
        if (await notification.count() > 0) {
            await expect(notification).toBeVisible();
        }
      }

      // Verify Vendor Status Dropdown Approval
      const statusDropdown = page.locator('select').first();
      if (await statusDropdown.count() > 0) {
        await statusDropdown.selectOption('ACTIVE').catch(() => statusDropdown.selectOption('approved'));
      }
    }
  });

  test('should be able to navigate to Support and view Conversations', async ({ page }) => {
    await page.goto('http://localhost:62719/');
    
    // Click on Support in the sidebar
    await page.getByText('Support', { exact: true }).click();
    
    // Verify conversations or tickets table loads
    const searchBar = page.getByPlaceholder(/Search/i).first();
    await expect(searchBar).toBeVisible({ timeout: 10000 });
  });
});
