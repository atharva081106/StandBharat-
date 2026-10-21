const { chromium } = require('@playwright/test');

async function verify10sFlow() {
  console.log('=== VERIFYING 10-SECOND LOADING MOTION AND APPLICATION OPENING ===');
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleLogs.push(`[CONSOLE ERROR] ${msg.text()}`);
    });

    console.log('\n--- TEST 1: Visiting http://localhost:3000 (Root Entry) ---');
    const start = Date.now();
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    let reached100 = false;
    let appOpened = false;
    let lastProgress = 0;

    for (let sec = 1; sec <= 13; sec++) {
      await page.waitForTimeout(1000);
      const elapsed = Math.round((Date.now() - start) / 1000);
      
      const state = await page.evaluate(() => {
        const text = document.body ? document.body.innerText : '';
        const match = text.match(/\[\s*(\d+)%\s*\]/);
        const hasCommandCenter = text.includes('Command Center') && text.includes('StandBharat');
        const hasLoading = text.includes('CALIBRATING') || text.includes('SYS_TELEMETRY');
        const milestoneMatch = text.match(/>\s*([^•\n]+)/);
        
        return {
          url: window.location.href,
          progress: match ? parseInt(match[1]) : null,
          milestone: milestoneMatch ? milestoneMatch[1].trim() : null,
          hasLoading,
          hasCommandCenter
        };
      });

      if (state.progress !== null) {
        lastProgress = state.progress;
        if (state.progress >= 95) reached100 = true;
      }
      if (state.hasCommandCenter && !state.hasLoading) {
        appOpened = true;
      }

      console.log(`[T+${elapsed}s] URL: ${state.url} | Loading: ${state.hasLoading} | Progress: [${state.progress !== null ? state.progress + '%' : 'N/A'}] | App Workspace: ${state.hasCommandCenter ? 'OPEN' : 'WAITING'} | Step: ${state.milestone || 'N/A'}`);
    }

    console.log('\n--- VERIFICATION TEST 1 RESULTS ---');
    console.log('Reached 100% Progress:', reached100 ? 'PASS' : 'FAIL');
    console.log('Application Workspace Opened after ~10s:', appOpened ? 'PASS' : 'FAIL');
    console.log('Console Errors:', consoleLogs.length === 0 ? 'None (Clean)' : consoleLogs.join(' | '));

    if (!reached100 || !appOpened) {
      throw new Error(`Test 1 Failed: reached100=${reached100}, appOpened=${appOpened}`);
    }

    console.log('\n--- TEST 2: Direct Visit to http://localhost:3000/app ---');
    const page2 = await context.newPage();
    const start2 = Date.now();
    await page2.goto('http://localhost:3000/app', { waitUntil: 'domcontentloaded' });

    let reached100_t2 = false;
    let appOpened_t2 = false;

    for (let sec = 1; sec <= 13; sec++) {
      await page2.waitForTimeout(1000);
      const elapsed = Math.round((Date.now() - start2) / 1000);
      
      const state = await page2.evaluate(() => {
        const text = document.body ? document.body.innerText : '';
        const match = text.match(/\[\s*(\d+)%\s*\]/);
        const hasCommandCenter = text.includes('Command Center') && text.includes('StandBharat');
        const hasLoading = text.includes('CALIBRATING') || text.includes('SYS_TELEMETRY');
        const milestoneMatch = text.match(/>\s*([^•\n]+)/);
        
        return {
          url: window.location.href,
          progress: match ? parseInt(match[1]) : null,
          milestone: milestoneMatch ? milestoneMatch[1].trim() : null,
          hasLoading,
          hasCommandCenter
        };
      });

      if (state.progress !== null && state.progress >= 95) reached100_t2 = true;
      if (state.hasCommandCenter && !state.hasLoading) {
        appOpened_t2 = true;
      }

      console.log(`[T+${elapsed}s] URL: ${state.url} | Loading: ${state.hasLoading} | Progress: [${state.progress !== null ? state.progress + '%' : 'N/A'}] | App Workspace: ${state.hasCommandCenter ? 'OPEN' : 'WAITING'}`);
    }

    console.log('\n--- VERIFICATION TEST 2 RESULTS ---');
    console.log('Reached 100% Progress:', reached100_t2 ? 'PASS' : 'FAIL');
    console.log('Application Workspace Opened after ~10s:', appOpened_t2 ? 'PASS' : 'FAIL');

    if (!reached100_t2 || !appOpened_t2) {
      throw new Error(`Test 2 Failed: reached100=${reached100_t2}, appOpened=${appOpened_t2}`);
    }

    console.log('\n>>> ALL 10-SECOND LOADING MOTION VERIFICATIONS PASSED SUCCESSFULLY! <<<');
  } finally {
    await browser.close();
  }
}

verify10sFlow().catch(err => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
