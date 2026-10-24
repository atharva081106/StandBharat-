import { test, expect } from '@playwright/test';

test.describe('Real User Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Avoid triggering the initial 5.2s cinematic animation on every automated test page
    await page.addInitScript(() => {
      sessionStorage.setItem('standbharat_session_loaded', 'true');
    });
  });

  test('1. Landing page loads on root (/) with hero & value proposition', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page.locator('text=StandBharat').first()).toBeVisible({ timeout: 10000 });
  });

  test('2. Command Center (/app) loads workspace dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/app');
    await expect(page.locator('text=StandBharat').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Command Center').first()).toBeVisible({ timeout: 10000 });
  });

  test('3. AI CMO (/app/ai-cmo) loads with chat interface', async ({ page }) => {
    await page.goto('http://localhost:3000/app/ai-cmo');
    await expect(page.locator('text=AI CMO').first()).toBeVisible({ timeout: 10000 });
  });

  test('4. AI Agents catalog (/app/agents) displays agent fleet', async ({ page }) => {
    await page.goto('http://localhost:3000/app/agents');
    await expect(page.locator('text=AI Agents').first()).toBeVisible({ timeout: 10000 });
  });

  test('5. Agent Log (/app/agent-log) displays execution telemetry', async ({ page }) => {
    await page.goto('http://localhost:3000/app/agent-log');
    await expect(page.locator('text=Agent Log').first()).toBeVisible({ timeout: 10000 });
  });

  test('6. Content Studio (/app/content) loads content projects', async ({ page }) => {
    await page.goto('http://localhost:3000/app/content');
    await expect(page.locator('text=Content Studio').first()).toBeVisible({ timeout: 10000 });
  });

  test('7. Approvals Queue (/app/approvals) displays approval pipeline', async ({ page }) => {
    await page.goto('http://localhost:3000/app/approvals');
    await expect(page.locator('text=Approvals').first()).toBeVisible({ timeout: 10000 });
  });

  test('8. Opportunities (/app/opportunities) displays autonomous recommendations', async ({ page }) => {
    await page.goto('http://localhost:3000/app/opportunities');
    await expect(page.locator('text=Opportunities').first()).toBeVisible({ timeout: 10000 });
  });

  test('9. Brand Brain (/app/brand-brain) loads core context', async ({ page }) => {
    await page.goto('http://localhost:3000/app/brand-brain');
    await expect(page.locator('text=Brand Brain').first()).toBeVisible({ timeout: 10000 });
  });

  test('10. Competitor Tracking (/app/competitors) loads competitor matrix', async ({ page }) => {
    await page.goto('http://localhost:3000/app/competitors');
    await expect(page.locator('text=Competitors').first()).toBeVisible({ timeout: 10000 });
  });

  test('11. Revenue ROI (/app/revenue) loads attribution metrics', async ({ page }) => {
    await page.goto('http://localhost:3000/app/revenue');
    await expect(page.locator('text=Revenue ROI').first()).toBeVisible({ timeout: 10000 });
  });

  test('12. Integrations Hub (/app/integrations) displays connection matrix', async ({ page }) => {
    await page.goto('http://localhost:3000/app/integrations');
    await expect(page.locator('text=Integrations').first()).toBeVisible({ timeout: 10000 });
  });

  test('13. Settings (/app/settings) loads workspace preferences', async ({ page }) => {
    await page.goto('http://localhost:3000/app/settings');
    await expect(page.locator('text=Settings').first()).toBeVisible({ timeout: 10000 });
  });

  test('14. Express 1-Step Onboarding (/onboarding) steps through cleanly', async ({ page }) => {
    await page.addInitScript(() => {
      // Clear workspace so onboarding page does not auto-redirect
      localStorage.removeItem('standbharat_token');
    });
    await page.goto('http://localhost:3000/onboarding');

    // 1-Step Express Setup
    await expect(page.locator('text=Launch your Autonomous Marketing Engine')).toBeVisible({ timeout: 10000 });
    await page.fill('input[placeholder*="BharatOrganics"]', 'Vedic Health Diagnostics');
    await page.fill('input[placeholder*="yourbrand.in"]', 'https://vedichealth.ai');
    await page.click('button:has-text("Launch Autonomous AI Engine")');
    await expect(page.locator('text=Synthesizing AI Workspace')).toBeVisible({ timeout: 5000 });
  });
});
