/* 验证角色新增入口的来源选择与返回路径。 */
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1100}}),base='http://127.0.0.1:8765';
 await page.goto(base+'/artifacts/register-share/seed.html');await page.locator('#seed').click();
 const initial=await page.evaluate(()=>localStorage.getItem('mcData'));
 for(const lang of ['zh-TW','zh-CN','en']){
  await page.goto(base+`/mccost.html?roleid=103&view=register&lang=${lang}`);
  await page.locator('[data-slot-position="1"] .rr-slot-trigger').click();
  const add=page.locator('.rr-analysis-content a[href*="mode=echo"]');await add.click();
  assert.equal(await page.locator('.rr-add-source .rr-share-choices button').count(),2);
  assert.ok(page.url().includes('mccost.html'));
  await page.screenshot({path:path.join(__dirname,`source-menu-${lang}.png`)});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(__dirname,`source-menu-mobile-${lang}.png`)});await page.setViewportSize({width:1440,height:1100});
  await page.keyboard.press('Escape');assert.ok(await add.evaluate(e=>e===document.activeElement));
  await add.click();await page.locator('.rr-add-source .rr-share-choices button').first().click();await page.waitForURL('**/register-workspace.html?*');assert.equal(await page.locator('[data-action="echo"]').count(),1);assert.equal(await page.locator('.rw-inventory-dialog').count(),0);
  await page.goto(base+`/mccost.html?roleid=103&view=register&lang=${lang}`);await page.locator('[data-slot-position="1"] .rr-slot-trigger').click();await page.locator('.rr-analysis-content a[href*="mode=echo"]').click();await page.locator('.rr-add-source .rr-share-choices button').nth(1).click();await page.locator('.rw-inventory-dialog[open]').waitFor();
  assert.equal(await page.locator('[data-action="echo"]').count(),0);assert.ok(page.url().includes('inventory=1'));await page.locator('[data-picker-close]').click();await page.waitForURL('**/mccost.html?*');
 }
 assert.equal(await page.evaluate(()=>localStorage.getItem('mcData')),initial);await browser.close();console.log('PASS source menu, manual form, direct inventory, cancel returns to character, three locales and no writes');
})().catch(e=>{console.error(e);process.exit(1);});
