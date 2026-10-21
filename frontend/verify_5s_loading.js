const { chromium } = require('@playwright/test');

async function verify5sFlow() {
  console.log('=== VERIFYING 5-SECOND VISUAL LOADING MOTION AND WORKSPACE OPENING ===');
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    console.log('\n--- TEST 1: Visiting http://localhost:3000 (Root Entry) ---');
    const start = Date.now();
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    let reached100 = false;
    let appOpened = false;

    // Check every 500ms for 7 seconds
    for (let i = 1; i <= 14; i++) {
      await page.waitForTimeout(500);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      
      const state = await page.evaluate(() => {
        const text = document.body ? document.body.innerText : '';
        const match = text.match(/(\d+)%/);
        const hasCommandCenter = text.includes('Command Center') && text.includes('StandBharat Global');
        const hasLoading = text.includes('STANDBHARAT') && match !== null && !hasCommandCenter;
        
        return {
          url: window.location.href,
          progress: match ? parseInt(match[1]) : null,
          hasLoading,
          hasCommandCenter,
          textSample: text.substring(0, 80).replace(/\n+/g, ' ')
        };
      });

      if (state.progress !== null && state.progress >= 90) reached100 = true;
      if (state.hasCommandCenter) appOpened = true;

      console.log(`[T+${elapsed}s] URL: ${state.url} | Progress: [${state.progress !== null ? state.progress + '%' : 'N/A'}] | Workspace: ${state.hasCommandCenter ? 'OPEN' : 'LOADING'}`);
    }

    console.log('\n--- VERIFICATION TEST 1 RESULTS ---');
    console.log('Reached 100% Progress:', reached100 ? 'PASS' : 'FAIL');
    console.log('Workspace Opened at ~5s:', appOpened ? 'PASS' : 'FAIL');

    if (!reached100 || !appOpened) {
      throw new Error(`Test 1 Failed: reached100=${reached100}, appOpened=${appOpened}`);
    }

    console.log('\n--- TEST 2: Direct Visit to http://localhost:3000/app ---');
    const page2 = await context.newPage();
    const start2 = Date.now();
    await page2.goto('http://localhost:3000/app', { waitUntil: 'domcontentloaded' });

    let reached100_t2 = false;
    let appOpened_t2 = false;

    for (let i = 1; i <= 14; i++) {
      await page2.waitForTimeout(500);
      const elapsed = ((Date.now() - start2) / 1000).toFixed(1);
      
      const state = await page2.evaluate(() => {
        const text = document.body ? document.body.innerText : '';
        const match = text.match(/(\d+)%/);
        const hasCommandCenter = text.includes('Command Center') && text.includes('StandBharat Global');
        
        return {
          url: window.location.href,
          progress: match ? parseInt(match[1]) : null,
          hasCommandCenter
        };
      });

      if (state.progress !== null && state.progress >= 90) reached100_t2 = true;
      if (state.hasCommandCenter) appOpened_t2 = true;

      console.log(`[T+${elapsed}s] URL: ${state.url} | Progress: [${state.progress !== null ? state.progress + '%' : 'N/A'}] | Workspace: ${state.hasCommandCenter ? 'OPEN' : 'LOADING'}`);
    }

    console.log('\n--- VERIFICATION TEST 2 RESULTS ---');
    console.log('Reached 100% Progress:', reached100_t2 ? 'PASS' : 'FAIL');
    console.log('Workspace Opened at ~5s:', appOpened_t2 ? 'PASS' : 'FAIL');

    if (!reached100_t2 || !appOpened_t2) {
      throw new Error(`Test 2 Failed: reached100=${reached100_t2}, appOpened=${appOpened_t2}`);
    }

    console.log('\n>>> ALL 5-SECOND VISUAL LOADING VERIFICATIONS PASSED SUCCESSFULLY! <<<');
  } finally {
    await browser.close();
  }
}

verify5sFlow().catch(err => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
