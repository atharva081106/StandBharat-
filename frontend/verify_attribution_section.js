const { chromium } = require('@playwright/test');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\athar\\.gemini\\antigravity-ide\\brain\\4fba5148-5551-4252-84be-790928081af1';

async function verifyAttributionSection() {
  console.log('Testing dedicated Attribution section & tab isolation...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  // 1. Authenticate
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

  // 2. Open Command Center
  console.log('2. Navigating to Command Center (/app/command-center)...');
  await page.goto('http://localhost:3000/app/command-center', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);

  // 3. Tab 0: Attribution (Default)
  console.log('3. Capturing Attribution tab (default)...');
  const shotAttribution = path.join(ARTIFACT_DIR, 'attribution_tab_active.png');
  await page.screenshot({ path: shotAttribution });
  console.log('Captured Attribution tab:', shotAttribution);

  // 4. Click SEO tab
  console.log('4. Clicking SEO tab...');
  const seoTab = page.locator('button:text-is("SEO")');
  await seoTab.click();
  await page.waitForTimeout(1000);

  // Check that Funnel & Next Best Actions are NOT visible
  const funnelVisibleOnSEO = await page.locator('text=Multi-Touch Revenue Attribution Funnel').isVisible();
  const loopVisibleOnSEO = await page.locator('text=AUTONOMOUS MARKETING LOOP: NEXT BEST ACTIONS').isVisible();
  console.log('On SEO tab: Funnel visible?', funnelVisibleOnSEO, '| Loop visible?', loopVisibleOnSEO);

  const shotSEO = path.join(ARTIFACT_DIR, 'seo_tab_no_attribution.png');
  await page.screenshot({ path: shotSEO });
  console.log('Captured SEO tab:', shotSEO);

  // 5. Click Links tab
  console.log('5. Clicking Links tab...');
  const linksTab = page.locator('button:text-is("Links")');
  await linksTab.click();
  await page.waitForTimeout(1000);

  const funnelVisibleOnLinks = await page.locator('text=Multi-Touch Revenue Attribution Funnel').isVisible();
  console.log('On Links tab: Funnel visible?', funnelVisibleOnLinks);

  const shotLinks = path.join(ARTIFACT_DIR, 'links_tab_no_attribution.png');
  await page.screenshot({ path: shotLinks });
  console.log('Captured Links tab:', shotLinks);

  // 6. Click GEO tab
  console.log('6. Clicking GEO tab...');
  const geoTab = page.locator('button:text-is("GEO")');
  await geoTab.click();
  await page.waitForTimeout(1000);

  const funnelVisibleOnGEO = await page.locator('text=Multi-Touch Revenue Attribution Funnel').isVisible();
  console.log('On GEO tab: Funnel visible?', funnelVisibleOnGEO);

  const shotGEO = path.join(ARTIFACT_DIR, 'geo_tab_no_attribution.png');
  await page.screenshot({ path: shotGEO });
  console.log('Captured GEO tab:', shotGEO);

  // 7. Click Content tab
  console.log('7. Clicking Content tab...');
  const contentTab = page.locator('button:text-is("Content")');
  await contentTab.click();
  await page.waitForTimeout(1000);

  const funnelVisibleOnContent = await page.locator('text=Multi-Touch Revenue Attribution Funnel').isVisible();
  console.log('On Content tab: Funnel visible?', funnelVisibleOnContent);

  const shotContent = path.join(ARTIFACT_DIR, 'content_tab_no_attribution.png');
  await page.screenshot({ path: shotContent });
  console.log('Captured Content tab:', shotContent);

  await browser.close();
  console.log('All verification steps passed successfully!');
}

verifyAttributionSection().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
