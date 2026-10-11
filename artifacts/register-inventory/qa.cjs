/* 隔离存档验证背包选择，不触碰用户浏览器资料。 */
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:8765';await page.goto(base+'/artifacts/register-share/seed.html');await page.locator('#seed').click();
 const fixture=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('mcData'));d.unusedEchoes=[structuredClone(d.role[0].costList[0]),structuredClone(d.role[0].costList[4])];d.unusedEchoes.forEach((e,i)=>e.costId=800+i);d.role[0].costList.pop();localStorage.setItem('mcData',JSON.stringify(d));return d;});
 for(const lang of ['zh-TW','zh-CN','en']){
  await page.goto(base+`/register-workspace.html?view=register&mode=echo&roleid=101&lang=${lang}`);
  await page.locator('[name="catalog"]').selectOption('59');await page.locator('[name="main"]').selectOption('暴击22%');
  const url=page.url();await page.locator('[data-open-inventory]').click();assert.equal(page.url(),url);
  assert.equal(await page.locator('[data-picker-select]').count(),2);assert.ok(await page.locator('[data-picker-select="800"]').isDisabled());assert.ok(await page.locator('[data-picker-select="801"]').isEnabled());
  await page.locator('[data-picker-search]').fill('NO MATCH');assert.equal(await page.locator('[data-picker-select]').count(),0);await page.locator('[data-picker-search]').fill('');
  await page.locator('[data-picker-cost]').selectOption('Cost1');assert.equal(await page.locator('[data-picker-select]').count(),1);await page.locator('[data-picker-cost]').selectOption('');
  await page.locator('[data-picker-select="801"]').click();assert.ok(await page.locator('[data-picker-confirm]').isEnabled());
  await page.screenshot({path:path.join(__dirname,`desktop-${lang}.png`)});
  await page.keyboard.press('Escape');assert.equal(await page.locator('[name="main"]').inputValue(),'暴击22%');assert.ok(await page.locator('[data-open-inventory]').evaluate(e=>e===document.activeElement));
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('mcData'))),fixture);
 }
 await page.setViewportSize({width:390,height:844});await page.locator('[data-open-inventory]').click();await page.locator('[data-picker-select="801"]').click();
 assert.ok(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));await page.screenshot({path:path.join(__dirname,'mobile-en.png')});
 await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('mcData'));d.unusedEchoes[1].suite='';localStorage.setItem('mcData',JSON.stringify(d));});
 await page.locator('[data-picker-confirm]').click();assert.ok(await page.locator('[data-picker-error]').textContent());assert.ok(await page.locator('[data-picker-confirm]').isDisabled());
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mcData')).role[0].costList.length),4);
 await page.locator('[data-picker-refresh]').click();await page.locator('[data-picker-select="801"]').click();await page.locator('[data-picker-confirm]').click();await page.waitForURL('**/mccost.html?*');
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('mcData')));assert.equal(after.role[0].costList.length,5);assert.equal(after.role[0].costList[4].costId,801);assert.equal(after.unusedEchoes.length,1);assert.equal(after.unusedEchoes[0].costId,800);
 await page.goto(base+'/register-workspace.html?view=register&mode=echo&roleid=103&lang=en');await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('mcData'));d.unusedEchoes=[];localStorage.setItem('mcData',JSON.stringify(d));});await page.locator('[data-open-inventory]').click();assert.equal(await page.locator('[data-picker-select]').count(),0);assert.ok(await page.locator('[data-picker-confirm]').isDisabled());await page.screenshot({path:path.join(__dirname,'empty-mobile.png')});
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: three locales, no navigation on open, filters, Cost restrictions, cancel retains form and focus, no preview writes, stale-source rejection, refresh and equip, empty inventory, mobile layout');
})().catch(e=>{console.error(e);process.exit(1);});
