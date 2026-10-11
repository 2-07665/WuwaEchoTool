/* 压力样本只存在隔离浏览器内，不修改目录或用户存档。 */
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1100},acceptDownloads:true});
 await page.goto('http://127.0.0.1:8765/artifacts/register-share/seed.html');await page.locator('#seed').click();
 await page.goto('http://127.0.0.1:8765/mccost.html?roleid=101&view=register&lang=en');
 await page.evaluate(()=>{
  const data=JSON.parse(localStorage.getItem('mcData')),role=data.role[0];role.costList=role.costList.slice(0,2);role.costList[0].costListId=999999;role.costList[0].name='Long Echo Name / Resonance Guardian of the Distant Celestial Night';role.costList[1].propertyList=[];
  data.unusedEchoes=[structuredClone(role.costList[0])];data.unusedEchoes[0].costListId=59;data.unusedEchoes[0].costId=800;
  localStorage.setItem('mcData',JSON.stringify(data));
 });
 await page.reload();await page.locator('[data-rr-share]').click();await page.locator('.rr-share-choices button').nth(1).click();await page.waitForFunction(()=>!document.querySelector('.rr-dialog-actions button:nth-child(2)').disabled);
 const download=page.waitForEvent('download');await page.locator('.rr-dialog-actions button').nth(1).click();await(await download).saveAs(path.join(__dirname,'detailed-long-partial.png'));
 await page.keyboard.press('Escape');await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:8765/register-workspace.html?view=register&mode=library&lang=en');
 await page.locator('[data-library-select="800"]').evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:path.join(__dirname,'mobile-five-stats.png')});
 await page.locator('[data-library-select="800"]').click();await page.locator('.rw-inspector-main').evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:path.join(__dirname,'mobile-detail-stats.png')});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.setViewportSize({width:1024,height:900});assert.ok(await page.locator('.rw-echo-index').isVisible());assert.ok(await page.locator('.rw-inspector').isVisible());
 assert.deepEqual(await page.locator('.rw-stat-cell').evaluateAll(nodes=>nodes.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent)),[]);
 await page.screenshot({path:path.join(__dirname,'library-1024.png'),fullPage:true});
 await browser.close();console.log('PASS long Echo name, two occupied slots, missing substats, mobile five-stat viewport and 1024px columns');
})().catch(e=>{console.error(e);process.exit(1);});
