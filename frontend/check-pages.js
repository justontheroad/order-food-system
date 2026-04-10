const { chromium } = require('playwright');

async function checkPages() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  const consoleMessages = [];

  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('Page Error:', error.message);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push(msg.text());
      console.error('Console Error:', msg.text());
    }
  });

  const pages = [
    { name: 'Home', url: 'http://localhost:3001/home' },
    { name: 'Menu', url: 'http://localhost:3001/menu' },
    { name: 'Cart', url: 'http://localhost:3001/cart' },
    { name: 'Login', url: 'http://localhost:3001/login' },
    { name: 'Profile (需登录)', url: 'http://localhost:3001/profile' },
  ];

  for (const pageInfo of pages) {
    console.log(`\n检查页面: ${pageInfo.name} (${pageInfo.url})`);
    errors.length = 0;
    consoleMessages.length = 0;

    try {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(2000);

      if (errors.length > 0) {
        console.log(`  ❌ 错误: ${errors.length} 个`);
        errors.forEach(e => console.log(`     - ${e}`));
      } else {
        console.log(`  ✅ 无错误`);
      }

      if (consoleMessages.length > 0) {
        console.log(`  ⚠️ 控制台警告: ${consoleMessages.length} 个`);
        consoleMessages.forEach(m => console.log(`     - ${m}`));
      }
    } catch (e) {
      console.log(`  ❌ 加载失败: ${e.message}`);
    }
  }

  await browser.close();
}

checkPages().catch(console.error);