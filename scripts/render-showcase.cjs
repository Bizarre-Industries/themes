#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'showcase/assets/generated');
const pageUrl = 'file://' + path.join(root, 'showcase/index.html');

async function screenshot(locator, file) {
  await locator.scrollIntoViewIfNeeded();
  await locator.screenshot({ path: path.join(outDir, file), animations: 'disabled' });
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });

  await screenshot(page.locator('[data-shot="hero"]'), 'hero.png');
  await screenshot(page.locator('[data-shot="variants"]'), 'variants.png');
  await screenshot(page.locator('[data-shot="syntax"]'), 'syntax.png');

  await browser.close();
  console.log('rendered showcase/assets/generated/hero.png');
  console.log('rendered showcase/assets/generated/variants.png');
  console.log('rendered showcase/assets/generated/syntax.png');
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
