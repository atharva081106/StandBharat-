const { chromium } = require('@playwright/test');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\athar\\.gemini\\antigravity-ide\\brain\\4fba5148-5551-4252-84be-790928081af1';

async function verifyAlignedUI() {
  console.log('Capturing updated Command Center and Modals with standard dark palette...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  // 1. Authenticate via Mock Auth in Landing Modal
  console.log('1. Authenticating...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => {
    window.dispatchEvent(new Event('open-auth-login'));
  });
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', 'demo@standbharat.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // 2. Command Center with 2-Column Funnel & Normal Dark "All caught up!" card
  console.log('2. Navigating to Command Center (/app/command-center)...');
  await page.goto('http://localhost:3000/app/command-center', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);

  const shot1 = path.join(ARTIFACT_DIR, 'command_center_aligned_palette.png');
  await page.screenshot({ path: shot1 });
  console.log('Captured Command Center:', shot1);

  // 3. Open Autonomous Sprint Modal via "Run Sprint" button in Column 3 header
  console.log('3. Opening Autonomous Sprint Modal...');
  const sprintBtn = await page.$('button:has-text("Run Sprint")');
  if (sprintBtn) {
    await sprintBtn.click();
    await page.waitForTimeout(1000);
    const shotSprint = path.join(ARTIFACT_DIR, 'sprint_modal_aligned.png');
    await page.screenshot({ path: shotSprint });
    console.log('Captured Sprint Modal:', shotSprint);

    const closeSprint = await page.$('button:has-text("Cancel")');
    if (closeSprint) {
      await closeSprint.click();
      await page.waitForTimeout(500);
    }
  }

  // 4. Open Fast Approvals Modal via "Inspect Deliverables Queue"
  console.log('4. Opening Fast Approvals Queue Modal...');
  const approvalsBtn = await page.$('button:has-text("Inspect Deliverables Queue")');
  if (approvalsBtn) {
    await approvalsBtn.click();
    await page.waitForTimeout(1000);
    const shotApprovals = path.join(ARTIFACT_DIR, 'approvals_queue_aligned.png');
    await page.screenshot({ path: shotApprovals });
    console.log('Captured Approvals Queue (LinkedIn preview):', shotApprovals);

    // Switch to Twitter preview
    const twitterBtn = await page.$('button:has-text("X (Twitter)")');
    if (twitterBtn) {
      await twitterBtn.click();
      await page.waitForTimeout(600);
      const shotTwitter = path.join(ARTIFACT_DIR, 'approvals_twitter_aligned.png');
      await page.screenshot({ path: shotTwitter });
      console.log('Captured Approvals (Twitter preview):', shotTwitter);
    }

    // Switch to Google SERP preview
    const serpBtn = await page.$('button:has-text("Google SERP")');
    if (serpBtn) {
      await serpBtn.click();
      await page.waitForTimeout(600);
      const shotSerp = path.join(ARTIFACT_DIR, 'approvals_serp_aligned.png');
      await page.screenshot({ path: shotSerp });
      console.log('Captured Approvals (SERP preview):', shotSerp);
    }

    const closeBtn = await page.$('button:has-text("Review Later")');
    if (closeBtn) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  await browser.close();
  console.log('Validation completed successfully!');
}

verifyAlignedUI().catch(err => {
  console.error('Validation error:', err);
  process.exit(1);
});
