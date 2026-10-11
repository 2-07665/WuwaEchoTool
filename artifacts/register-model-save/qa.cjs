/* 使用隔离存档覆盖自动保存、重载、失败重试与并发冲突。 */
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage(),base='http://127.0.0.1:8765';
 await page.goto(base+'/artifacts/register-share/seed.html');await page.locator('#seed').click();
 const original=await page.evaluate(()=>localStorage.getItem('mcData'));
 for(const [catalog,field,value] of [[49,'damageMode','fusion'],[51,'extraEnergy','60'],[62,'referenceHealth','55000'],[1,'ming','3']]){
  for(const imported of [false,true]){
   await page.evaluate(({original,catalog,imported})=>{const d=JSON.parse(original);d.role[0].roleListId=catalog;d.role[0].isImport=imported;localStorage.setItem('mcData',JSON.stringify(d));},{original,catalog,imported});
   await page.goto(base+`/${imported?'mccost-readonly':'mccost'}.html?roleid=101&view=register&lang=zh-TW`);
   const control=page.locator(`[data-rr-model="${field}"]`);await control.waitFor();
   const before=await page.evaluate(()=>localStorage.getItem('mcData'));await page.reload();assert.equal(await page.evaluate(()=>localStorage.getItem('mcData')),before);
   if(field==='damageMode'||field==='ming')await control.selectOption(value);else {await control.fill(value);await control.press('Tab');}
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mcData')));assert.equal(String(saved.role[0][field]),value);assert.deepEqual(saved.role.slice(1),JSON.parse(before).role.slice(1));
   assert.ok((await page.locator('.rr-model-note').textContent()).includes('已自動儲存'));await page.reload();assert.equal(await control.inputValue(),value);
  }
 }
 await page.evaluate(original=>localStorage.setItem('mcData',original),original);await page.goto(base+'/mccost.html?roleid=101&view=register&lang=en');
 await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='mcData')throw new DOMException('full','QuotaExceededError');return window.originalSetItem.call(this,key,value);};});
 await page.locator('[data-rr-model="ming"]').selectOption('2');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mcData')).role[0].ming),0);assert.ok(await page.locator('[data-rr-save-model]').isVisible());
 await page.evaluate(()=>Storage.prototype.setItem=window.originalSetItem);await page.locator('[data-rr-save-model]').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mcData')).role[0].ming),2);
 await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('mcData'));d.role[0].ming=5;localStorage.setItem('mcData',JSON.stringify(d));});await page.locator('[data-rr-model="ming"]').selectOption('3');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mcData')).role[0].ming),5);assert.ok((await page.locator('.rr-model-note').textContent()).includes('not saved'));
 await page.locator('[data-rr-reset]').click();assert.equal(await page.locator('[data-rr-model="ming"]').inputValue(),'5');await page.locator('[data-rr-model="ming"]').selectOption('6');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mcData')).role[0].ming),6);
 await browser.close();console.log('PASS manual/import models: mode, chain, energy, health persist across reload; no load writes; unrelated roles retained; quota failure/retry and conflict restore');
})().catch(e=>{console.error(e);process.exit(1);});
