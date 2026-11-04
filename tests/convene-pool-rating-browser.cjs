const fs=require('fs'),path=require('path'),A=require('node:assert/strict'),{createServer}=require('../scripts/serve.cjs'),{archive}=require('./convene-fixture.cjs');
let pw;try{pw=require('playwright');}catch(_){pw=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');}
const out=path.resolve('artifacts/convene-pool-rating-20261102');
(async()=>{fs.mkdirSync(out,{recursive:true});const server=await createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{browser=await pw.chromium.launch({channel:'msedge',headless:true});const errors=[];
for(const width of [1440,390,360])for(const locale of ['zh-TW','zh-CN','en']){
 const page=await browser.newPage({viewport:{width,height:1000}});page.on('pageerror',e=>errors.push(e.message));await page.route(/^https:\/\//,r=>r.abort());
 await page.goto('http://127.0.0.1:'+server.address().port+'/convene.html?view=register&lang='+locale);
 await page.locator('[data-view=data]').waitFor();const fixture=archive();
 await page.evaluate(async d=>{const store=ConveneStore.create();await store.update(()=>d);store.close();},fixture);await page.reload();await page.locator('[data-pool-rating="1"]').waitFor();
 A.equal(await page.locator('[data-pool-rating]').count(),2);A.ok(await page.locator('.cv-overview>.cv-hero').isVisible());
 for(const pool of [1,2]){const card=page.locator('[data-pool-card="'+pool+'"]'),title=await card.getAttribute('data-pool-tier');A.equal(await card.locator('.cv-panel-engraving').count(),0);A.equal(await card.locator('[data-frame-tier="'+title+'"]').count(),2);A.equal(await card.locator('.cv-badge').getAttribute('data-family'),pool===1?'pool-character':'pool-weapon');}
 A.equal(await page.locator('[data-pool-rating="2"]').getAttribute('data-rating-status'),'insufficient');
 A.equal(await page.locator('.cv-pool-rating-copy>p').count(),0);
 const expected=await page.evaluate(async()=>{const store=ConveneStore.create(),data=await store.read();store.close();const t=ConveneMessages.create(document.documentElement.lang),l=ConveneCore.poolLuck(ConveneCore.analyse(data.accounts[0]),2);return t(l.title);});
 A.equal(await page.locator('[data-pool-rating="2"] h4').textContent(),expected);
 A.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:path.join(out,width+'-'+locale+'.png'),fullPage:true});
 await page.locator('[data-pool-card="1"] [data-focus-pool]').click();A.equal(await page.locator('[data-pool-rating]').count(),1);
 const focused=page.locator('[data-pool-card="1"]');A.equal(await focused.locator('.cv-pool-actions button').count(),1);
 if(width===1440)A.ok(await focused.evaluate(e=>{const rating=e.querySelector('.cv-pool-rating').getBoundingClientRect(),core=e.querySelector('.cv-pool-core').getBoundingClientRect();return rating.right<=core.left&&e.getBoundingClientRect().height<750;}),'desktop analysis groups information in two compact columns');
 A.ok(await focused.evaluate(e=>{const card=e.getBoundingClientRect(),footer=e.querySelector('.cv-pool-bottom'),latest=footer.querySelector('.cv-pool-latest').getBoundingClientRect(),actions=footer.querySelector('.cv-pool-actions').getBoundingClientRect();return e.scrollWidth<=e.clientWidth+1&&actions.right<=card.right&&actions.bottom<=card.bottom&&!(actions.left<latest.right&&actions.right>latest.left&&actions.top<latest.bottom&&actions.bottom>latest.top);}));
 if(locale==='zh-TW'||locale==='en')await focused.screenshot({path:path.join(out,width+'-'+locale+'-analysis-layout.png')});
 await page.locator('[data-view=overview]').first().click();await page.locator('[data-share=overall]').click();await page.locator('[data-png]:not([disabled])').waitFor();await page.locator('[data-close]').click();
 if(width===1440&&locale==='zh-TW'||width===390&&locale==='en')for(const pool of [1,2]){
  await page.locator('[data-share-pool="'+pool+'"]').click();
  for(const variant of ['compact','detailed']){
   await page.locator('[data-share-version]').selectOption(variant);await page.locator('[data-png]:not([disabled])').waitFor();
   const download=page.waitForEvent('download');await page.locator('[data-png]').click();const file=await download;A.ok(file.suggestedFilename().includes('Pool-'+pool));
   const dest=path.join(out,width+'-'+locale+'-pool-'+pool+'-'+variant+'.png');await file.saveAs(dest);
   A.equal(fs.readFileSync(dest).toString('base64'),(await page.locator('.cv-share-image img').getAttribute('src')).split(',')[1]);
  }
  await page.locator('[data-close]').click();
 }
 await page.locator('[data-view=cabinet]').first().click();
 A.equal(await page.locator('.cv-achievement-card').count(),46);
 const totalProgress=await page.locator('.cv-vault-count').textContent();
 if(locale==='zh-TW'&&width!==360)await page.screenshot({path:path.join(out,width+'-'+locale+'-achievements-all.png'),fullPage:true});
 for(const [scope,count] of [['limitedCharacter',28],['limitedWeapon',10],['standard',8]]){
  await page.locator('[data-achievement-filter=scope]').selectOption(scope);A.equal(await page.locator('.cv-achievement-card').count(),count);
  const keys=await page.locator('.cv-achievement-card').evaluateAll(nodes=>nodes.map(e=>e.dataset.achievementKey));A.ok(keys.every(key=>key.startsWith(scope+'.')));
  A.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(locale==='zh-TW'&&width!==360)await page.screenshot({path:path.join(out,width+'-'+locale+'-achievements-'+scope+'.png'),fullPage:true});
 }
 await page.locator('[data-achievement-filter=rarity]').selectOption('mythic');A.equal(await page.locator('.cv-achievement-card').count(),0);A.ok(await page.locator('.cv-achievement-empty').isVisible());
 A.equal(await page.locator('.cv-vault-count').textContent(),totalProgress);
 await page.locator('[data-achievement-reset]').click();A.equal(await page.locator('.cv-achievement-card').count(),46);
 await page.locator('[data-achievement-filter=state]').selectOption('unlocked');A.ok((await page.locator('.cv-achievement-card').evaluateAll(nodes=>nodes.map(e=>e.dataset.state))).every(state=>state==='unlocked'));
 await page.locator('[data-achievement-reset]').click();
 A.deepEqual(await page.evaluate(async()=>await ConveneStore.create().read()),fixture);
 await page.close();
}
// 只读视觉图鉴：集中检查八阶、待观测及两类图纹，不写入账号。
{const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto('http://127.0.0.1:'+server.address().port+'/convene.html?view=register&lang=zh-TW');await page.locator('[data-view=data]').waitFor();
await page.evaluate(()=>{const V=ConveneVisuals,t=ConveneMessages.create('zh-TW'),host=document.getElementById('convene-app');host.innerHTML='<h1>限定卡池圖紋 · 八階與待觀測</h1><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px">'+['observing',...ConveneCore.RATING_RULES.tiers.slice().reverse().map(v=>v.title)].flatMap(title=>[1,2].map(pool=>'<section class="cv-card cv-pool-summary" data-pool-tier="'+title+'" data-pool-level="'+V.geometry(title).level+'" style="position:relative;min-height:260px;padding:36px;--cv-accent:'+V.COLORS[title]+';--cv-theme:'+V.COLORS[title]+'">'+V.poolFrame(title,pool)+'<div style="position:relative;display:flex;align-items:center;gap:30px">'+V.badge(title,pool===1?'pool-character':'pool-weapon',t(title))+'<div><small>'+t(pool===1?'limitedPool':'weaponPool')+'</small><h2>'+t(title)+'</h2></div></div></section>')).join('')+'</div>';host.querySelectorAll('.cv-badge').forEach(e=>{e.style.width='140px';e.style.height='170px';});});
await page.screenshot({path:path.join(out,'pool-frame-tiers.png'),fullPage:true});await page.close();}
A.deepEqual(errors,[]);console.log('通过：9组三语/视口、独立卡池边框/徽章、整体主卡、独立分享、存档不变。');
}finally{await browser?.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});

