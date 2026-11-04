const fs=require('fs'),path=require('path'),A=require('node:assert/strict'),{createServer}=require('../scripts/serve.cjs'),{build,events}=require('./convene-journey-fixture.cjs');
let pw;try{pw=require('playwright');}catch(_){pw=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');}
const out=path.resolve('artifacts/convene-journey-20261102');
(async()=>{fs.mkdirSync(out,{recursive:true});const server=await createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{browser=await pw.chromium.launch({channel:'msedge',headless:true});const errors=[];
for(const width of [1440,390,360])for(const locale of ['zh-TW','zh-CN','en']){
 const page=await browser.newPage({viewport:{width,height:1000}});page.on('pageerror',e=>errors.push(e.message));await page.route(/^https:\/\//,r=>r.abort());
 await page.goto('http://127.0.0.1:'+server.address().port+'/convene.html?view=register&lang='+locale);await page.locator('[data-view=data]').waitFor();
 const fixture={version:1,accounts:[build(events)]};await page.evaluate(async d=>{const store=ConveneStore.create();await store.update(()=>d);store.close();},fixture);await page.reload();await page.locator('[data-view=characters]').first().click();await page.locator('[data-character]').selectOption('1304');
 A.equal(await page.locator('[data-route-stage]').count(),7);A.equal(await page.locator('.cv-extra-list article').count(),2);A.equal(await page.locator('[data-journey-target="6"]').getAttribute('aria-pressed'),'true');A.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:path.join(out,width+'-'+locale+'.png'),fullPage:true});
 await page.locator('[data-journey-target="0"]').click();A.equal(await page.locator('[data-journey-target="0"]').getAttribute('aria-pressed'),'true');A.ok((await page.locator('.cv-acquisition-score').textContent()).includes('88.1'));await page.locator('[data-journey-target="6"]').click();
 if(width===1440&&locale==='zh-TW'||width===390&&locale==='en'){
  for(const mode of ['current','full','excess']){
   await page.locator('[data-journey-mode="'+mode+'"]').click();
   for(const variant of ['compact','detailed']){await page.locator('[data-share-version]').selectOption(variant);await page.locator('[data-png]:not([disabled])').waitFor();const pending=page.waitForEvent('download');await page.locator('[data-png]').click();const download=await pending,dest=path.join(out,width+'-'+locale+'-'+mode+'-'+variant+'.png');A.ok(download.suggestedFilename().includes('Journey-'+mode));await download.saveAs(dest);A.equal(fs.readFileSync(dest).toString('base64'),(await page.locator('.cv-share-image img').getAttribute('src')).split(',')[1]);}
   await page.locator('[data-close]').click();
  }
  const layout=await page.evaluate(async()=>{const store=ConveneStore.create(),data=await store.read();store.close();const report=ConveneCharacterRating.journey(data.accounts[0],'1304'),image=await ConveneCharacterShare.renderJourney({report,t:ConveneMessages.create(document.documentElement.lang),name:'今汐',detailed:true});return {layout:image.layout,height:image.canvas.height};});A.ok(layout.layout.every(v=>v.width<=v.limit+1&&v.y<layout.height));
 }
 A.deepEqual(await page.evaluate(async()=>await ConveneStore.create().read()),fixture);
 if(width===1440&&locale==='zh-TW'||width===390&&locale==='en'){
  const originalScore=await page.locator('.cv-acquisition-score').textContent();await page.locator('.cv-journey-manual>summary').click();
  await page.locator('[name=manualItem]').selectOption('1304');await page.locator('[name=manualCount]').fill('2');await page.locator('[name=manualTime]').fill('2026-10-01T12:00');await page.locator('[data-manual-acquisition] button[type=submit]').click();await page.waitForFunction(()=>document.querySelectorAll('[data-manual-delete]').length===2);
  A.equal(await page.locator('.cv-acquisition-score').textContent(),originalScore);A.equal(await page.locator('.cv-extra-list article').count(),4);A.equal(await page.locator('.cv-journey-history [data-manual-delete]').count(),0);
  const added=await page.evaluate(async()=>await ConveneStore.create().read());A.deepEqual(added.accounts[0].records,fixture.accounts[0].records);A.deepEqual(added.accounts[0].spans,fixture.accounts[0].spans);A.equal(added.accounts[0].manualAcquisitions.length,2);
  A.deepEqual(await page.evaluate(d=>ConveneCore.validate(JSON.stringify(d)),added),added);
  A.equal(await page.evaluate(async()=>{const d=await ConveneStore.create().read();try{ConveneCore.removeManualAcquisition(d.accounts[0],d.accounts[0].records[0].id);return false;}catch(_){return true;}}),true);
  await page.screenshot({path:path.join(out,width+'-'+locale+'-manual.png'),fullPage:true});
  await page.locator('[data-manual-delete]').first().click();await page.waitForFunction(()=>document.querySelectorAll('[data-manual-delete]').length===1);await page.reload();await page.locator('[data-view=characters]').first().click();await page.locator('[data-character]').selectOption('1304');await page.locator('.cv-journey-manual>summary').click();A.equal(await page.locator('[data-manual-delete]').count(),1);
  await page.locator('[name=manualItem]').selectOption('1205');await page.locator('[name=manualCount]').fill('2');await page.locator('[name=manualSource]').selectOption('manual');await page.locator('[name=manualTime]').fill('2026-10-02T12:00');await page.locator('[data-manual-acquisition] button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('[data-character]').value==='1205');
  A.ok((await page.locator('.cv-acquisition-score').textContent()).includes('—'));A.equal(await page.locator('[data-manual-delete]').count(),2);await page.locator('[data-journey-mode=current]').click();await page.locator('[data-png]:not([disabled])').waitFor();await page.locator('[data-close]').click();
  A.deepEqual((await page.evaluate(async()=>await ConveneStore.create().read())).accounts[0].records,fixture.accounts[0].records);A.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 if(locale==='zh-TW'&&width===390){const partial={version:1,accounts:[build({0:1304,40:1304,80:1304})]};await page.evaluate(async d=>{const store=ConveneStore.create();await store.update(()=>d);store.close();},partial);await page.reload();await page.locator('[data-view=characters]').first().click();A.ok((await page.locator('.cv-acquisition-score').textContent()).includes('—'));A.equal(await page.locator('[data-journey-mode=full]').isDisabled(),true);A.equal(await page.locator('[data-journey-mode=excess]').isDisabled(),true);await page.screenshot({path:path.join(out,'390-zh-TW-incomplete.png'),fullPage:true});}
 await page.close();
}A.deepEqual(errors,[]);console.log('通过：9组三语/视口，R0–R6切换、满链后独立、三种战报分享、缺段与原存档不变。');
}finally{await browser?.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
