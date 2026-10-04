import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Agent Workshop/)
})

test('offers an honest learning path from the homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Four Agent Runtimes.')).toBeVisible()
  await expect(page.getByText('Free, open-source builder. Provider usage may cost money.')).toBeVisible()
  await page.getByRole('link', { name: 'Follow the learning path: build, observe, evaluate' }).click()
  await expect(page.getByRole('heading', { name: 'Learning path: build, observe, evaluate' })).toBeVisible()
  await expect(page.getByText('Establish a baseline.', { exact: true })).toBeVisible()
  await expect(page.getByText('What is not generated for you', { exact: true })).toBeVisible()
})

test('provider guide distinguishes examples from supported integrations', async ({ page }) => {
  await page.goto('/docs/guide/sdk-configuration')
  await expect(page.getByRole('heading', { name: 'HuggingFace tiny-agents', exact: true })).toBeVisible()
  await expect(page.getByText('claude-sonnet-4-5-20250929', { exact: true })).toBeVisible()
  await expect(page.getByText('gpt-5.1', { exact: true })).toBeVisible()
  await expect(page.getByText('The scaffold does not apply temperature or output-token controls.', { exact: false })).toBeVisible()
  await expect(page.getByText('128K tokens', { exact: true })).toHaveCount(0)
})
