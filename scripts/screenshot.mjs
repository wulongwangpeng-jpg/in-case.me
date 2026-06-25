import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

mkdirSync('screenshots', { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

const pages = [
  { path: '/', name: 'homepage' },
  { path: '/inventory', name: 'inventory' },
  { path: '/letters', name: 'letters' },
  { path: '/settings', name: 'settings' },
  { path: '/faq', name: 'faq' },
  { path: '/about', name: 'about' },
  { path: '/pricing', name: 'pricing' },
];

for (const { path, name } of pages) {
  await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle', timeout: 30000 });
  const title = await page.title();
  console.log(`[${name}] ${path} → "${title}"`);
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
}

if (errors.length > 0) {
  console.log(`\n⚠ Console errors (${errors.length}):`);
  errors.forEach(e => console.log('  -', e));
} else {
  console.log('\n✅ No console errors');
}

await browser.close();
console.log('Done — screenshots saved to screenshots/');
