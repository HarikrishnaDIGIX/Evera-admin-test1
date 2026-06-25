import { test, expect } from '@playwright/test';

test.describe('Admin E2E Verification Flow', () => {
  test('Super Admin Flow: Manage Admins, Support Workers and Tickets', async ({ page }) => {
    const id = Date.now().toString().slice(-6);
    const workerName = `E2E Support Agent ${id}`;
    const workerEmail = `e2e_agent_${id}@evera.com`;
    const workerEmpId = `EMP-E2E-${id}`;

    const adminName = `E2E Operations Admin ${id}`;
    const adminEmail = `e2e_ops_${id}@evera.com`;

    const customerName = `E2E Customer Name ${id}`;
    const customerEmail = `e2e_customer_${id}@example.com`;
    const ticketSubject = `E2E Manual Ticket Subject ${id}`;

    // 1. Visit App & Login as Super Admin
    await page.goto('http://localhost:3001/');
    
    // Quick dev login as Super Admin
    await page.getByRole('button', { name: 'super@evera.com' }).click();
    
    // Verify dashboard is visible
    await expect(page.locator('header')).toContainText('Dashboard Overview', { ignoreCase: true });

    // 2. Go to Support Workers Directory
    await page.getByRole('button', { name: 'Support Workers' }).click();
    await expect(page.locator('header')).toContainText('Support Workers Overview', { ignoreCase: true });

    // Create a new support worker
    await page.getByRole('button', { name: 'Create Worker' }).click();
    await page.getByLabel('Full Name *').fill(workerName);
    await page.getByLabel('Employee ID *').fill(workerEmpId);
    await page.getByLabel('Email Address *').fill(workerEmail);
    await page.getByLabel('Phone Number *').fill(`+91 9999${id}`);
    
    // Toggle check on "Resolve Tickets" and "Contact Users" permissions
    await page.locator('text=Resolve Tickets').first().click();
    await page.locator('text=Contact Users').first().click();
    
    // Submit worker
    await page.getByRole('button', { name: 'Create Worker' }).click();
    
    // Verify notification or presence in directory
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText(workerName);
    
    // 3. Go to Platform Administrator Governance
    await page.getByRole('button', { name: 'Admins' }).click();
    await expect(page.locator('header')).toContainText('admins Overview', { ignoreCase: true });
    await expect(page.locator('body')).toContainText('Platform Administrator Governance', { ignoreCase: true });

    // Create a new Administrator
    await page.getByRole('button', { name: 'Add Administrator' }).click();
    await page.getByLabel('Full Name *').fill(adminName);
    await page.getByLabel('Email Address *').fill(adminEmail);
    
    // Select role via the specific admin-role-select dropdown (not the global header role-switcher)
    await page.locator('#admin-role-select').selectOption('OPERATIONS_ADMIN');
    await page.getByRole('button', { name: 'Create Administrator' }).click();

    // Verify presence in list
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText(adminName);

    // 4. Go to Tickets Management & Manually Create Ticket
    await page.getByRole('button', { name: 'Tickets' }).click();
    await expect(page.locator('header')).toContainText('Tickets Overview', { ignoreCase: true });

    // Create ticket manually
    await page.getByRole('button', { name: 'Create Ticket' }).click();
    await page.getByPlaceholder('Enter customer name').fill(customerName);
    await page.getByPlaceholder('customer@example.com').fill(customerEmail);
    await page.getByPlaceholder('e.g. Booking payment checkout failure').fill(ticketSubject);
    await page.getByPlaceholder('Provide a detailed description').fill('E2E Manual Ticket Detailed Description');
    await page.getByRole('button', { name: 'Create Ticket' }).click();

    // Verify ticket is in active tickets list
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText(ticketSubject);
    await expect(page.locator('body')).toContainText(customerName);
    await expect(page.locator('body')).toContainText(customerEmail);

    // Open the created ticket
    await page.locator(`text=${ticketSubject}`).first().click();
    
    // Verify customer details and assignee controls
    await expect(page.locator('h4').filter({ hasText: customerName })).toContainText(customerName);
    await expect(page.locator('p.text-xs').filter({ hasText: customerEmail })).toContainText(customerEmail);

    // Post a comment
    await page.getByPlaceholder('Write a reply to the customer...').fill('E2E Support reply comment content');
    await page.getByRole('button', { name: 'Send to Customer' }).click();

    // Verify comment is added
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText('E2E Support reply comment content');

    console.log('E2E Verification script completed successfully!');
  });
});
