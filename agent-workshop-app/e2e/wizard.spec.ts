import { test, expect } from '@playwright/test';

test.describe('Wizard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens wizard from homepage', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Building' }).click();
    await expect(page.getByRole('heading', { name: 'Choose Domain' })).toBeVisible();
    await expect(page.getByText('What type of agent do you want to build?')).toBeVisible();
  });

  test('completes domain selection', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Building' }).click();
    
    // Select Development domain
    await page.getByText('Development').click();
    await expect(page.getByText('Choose Your Starting Template')).toBeVisible();
    await expect(page.getByText('Showing templates for: Development')).toBeVisible();
  });

  test('selects template', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Building' }).click();
    await page.getByText('Development').click();
    
    // Select first template (Legacy Code Modernization Agent)
    await page.getByText('Legacy Code Modernization Agent').first().click();
    await expect(page.getByText('Choose Your AI Provider')).toBeVisible();
  });

  test('configures SDK', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Building' }).click();
    await page.getByText('Development').click();
    await page.getByText('Legacy Code Modernization Agent').first().click();
    
    // Select Claude
    await page.getByText('Claude Agent SDK').first().click();
    await expect(page.getByRole('heading', { name: 'Select Model' })).toBeVisible();
    
    // Select first model
    await page.getByRole('button', { name: /Claude Sonnet/ }).first().click();
  });

  test('configures tools and permissions', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Building' }).click();
    await page.getByText('Development').click();
    await page.getByText('Legacy Code Modernization Agent').first().click();
    await page.getByText('Claude Agent SDK').first().click();
    await page.getByRole('button', { name: /Claude Sonnet/ }).first().click();
    
    // Set Balanced permissions
    await page.getByRole('button', { name: 'Balanced' }).click();
    await expect(page.getByText('Available Tools')).toBeVisible();
    
    // Enable a tool, e.g., Read File (assuming it's toggleable by clicking the checkbox-like button)
    await page.getByTestId('toggle-read-file').click();
    await expect(page.getByText('Configure Agent Capabilities')).toBeVisible();
  });

  test('fills project settings', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Building' }).click();
    await page.getByText('Development').click();
    await page.getByText('Legacy Code Modernization Agent').first().click();
    await page.getByText('Claude Agent SDK').first().click();
    await page.getByRole('button', { name: /Claude Sonnet/ }).first().click();
    await page.getByRole('button', { name: 'Balanced' }).click();
    await page.getByRole('button', { name: 'Next' }).click(); // Assume Next after tools
    
    // Fill forms
    await page.fill('input[placeholder="My Development Assistant"]', 'Test Agent');
    await page.getByRole('button', { name: 'Auto' }).click(); // generate project name
    await page.fill('input[placeholder="Your Name"]', 'Test User');
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByRole('heading', { name: 'Preview & Generate Agent' })).toBeVisible();
  });

  test('views preview', async ({ page }) => {
    // Full flow to preview
    await page.getByRole('button', { name: 'Start Building' }).click();
    await page.getByText('Development').click();
    await page.getByText('Legacy Code Modernization Agent').first().click();
    await page.getByText('Claude Agent SDK').first().click();
    await page.getByRole('button', { name: /Claude Sonnet/ }).first().click();
    await page.getByRole('button', { name: 'Balanced' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    
    await page.fill('input[placeholder="My Development Assistant"]', 'Test Agent');
    await page.getByRole('button', { name: 'Auto' }).click();
    await page.fill('input[placeholder="Your Name"]', 'Test User');
    await page.getByRole('button', { name: 'Next' }).click();
    
    // Click Preview Code
    await page.getByRole('button', { name: 'Preview Code' }).click();
    // Verify preview modal or content (adjust locator for ProjectPreview)
    await expect(page.getByRole('heading', { name: 'Agent Overview' })).toBeVisible();
  });

  test('triggers download', async ({ page, context }) => {
    // Full flow to generate
    await page.getByRole('button', { name: 'Start Building' }).click();
    await page.getByText('Development').click();
    await page.getByText('Legacy Code Modernization Agent').first().click();
    await page.getByText('Claude Agent SDK').first().click();
    await page.getByRole('button', { name: /Claude Sonnet/ }).first().click();
    await page.getByRole('button', { name: 'Balanced' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    
    await page.fill('input[placeholder="My Development Assistant"]', 'Test Agent');
    await page.getByRole('button', { name: 'Auto' }).click();
    await page.fill('input[placeholder="Your Name"]', 'Test User');
    await page.getByRole('button', { name: 'Next' }).click();
    
    // Expect download
    const downloadPromise = context.expectDownload();
    await page.getByRole('button', { name: 'Generate & Download' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/test-agent.zip/);
  });
});
