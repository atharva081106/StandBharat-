const { chromium } = require('@playwright/test');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\athar\\.gemini\\antigravity-ide\\brain\\4fba5148-5551-4252-84be-790928081af1';

async function captureVisualProof() {
  console.log('Capturing screenshots of 5s visual-only loading motion...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // 1. Capture midway at ~2.5s
  await page.waitForTimeout(2500);
  const shot1 = path.join(ARTIFACT_DIR, 'loading_motion_visual_5s.png');
  await page.screenshot({ path: shot1 });
  console.log('Captured 2.5s screenshot:', shot1);

  // 2. Wait until T=5.8s when workspace opens
  await page.waitForTimeout(3500);
  const shot2 = path.join(ARTIFACT_DIR, 'workspace_open_after_5s.png');
  await page.screenshot({ path: shot2 });
  console.log('Captured 5.8s workspace screenshot:', shot2);

  await browser.close();
  console.log('Visual proof capture complete!');
}

captureVisualProof().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
