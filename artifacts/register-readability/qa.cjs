/* 使用隔离浏览器存储和合成存档验证真实渲染、下载及原有操作。 */
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=__dirname,base='http://127.0.0.1:8765',report=[];
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1100},acceptDownloads:true});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(base+'/artifacts/register-share/seed.html');await page.locator('#seed').click();
 await page.goto(base+'/mccost.html?roleid=101&view=register&lang=zh-TW');
 const fixture=await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem('mcData'));
  d.unusedEchoes=d.role[0].costList.slice(0,4).map((e,i)=>({...structuredClone(e),costId:800+i}));
  d.unusedEchoes[0].propertyList=[{property:'暴击',value:'10.5%'},{property:'暴伤',value:'15.0%'},{property:'技能伤害',value:'10.1%'},{property:'小攻击',value:'40'},{property:'共鸣效率',value:'7.5%'}];
  const english=EchoI18n.create({language:'en'});const longest=costList.reduce((a,b)=>english.entity('echoes',a.id,a.name).length>english.entity('echoes',b.id,b.name).length?a:b);
  Object.assign(d.unusedEchoes[1],{costListId:longest.id,imgCode:longest.imgCode,type:longest.type});
  d.unusedEchoes[2].propertyList=[{property:'技能伤害',value:'10.1%'}];d.unusedEchoes[2].mainAtrri='';d.unusedEchoes[2].suite='';
  localStorage.setItem('mcData',JSON.stringify(d));return d;
 });
 async function share(locale,mode,file,before=false,role=101){
  await page.goto(base+`/mccost.html?roleid=${role}&view=register&lang=${locale}`);
  if(before)await page.addScriptTag({content:fs.readFileSync(path.join(out,'register-share-before.js'),'utf8')});
  await page.locator('[data-rr-share]').click();
  await page.locator('.rr-share-choices button').nth(mode==='compact'?0:1).click();
  const save=page.locator('.rr-dialog-actions button').nth(1);await page.waitForFunction(()=>!document.querySelector('.rr-dialog-actions button:nth-child(2)').disabled);
  const canvas=await page.locator('.rr-share-dialog canvas').evaluate(c=>({data:c.toDataURL().split(',')[1],width:c.width,height:c.height}));
  const dl=page.waitForEvent('download');await save.click();await(await dl).saveAs(path.join(out,file));
  assert.ok(Buffer.from(canvas.data,'base64').equals(fs.readFileSync(path.join(out,file))),'Preview/download mismatch');
  report.push({file,width:canvas.width,height:canvas.height,previewMatchesDownload:true});
  await page.keyboard.press('Escape');
 }
 await share('zh-TW','detailed','detailed-before.png',true);
 await share('zh-TW','compact','compact-before.png',true);
 await share('zh-TW','compact','compact-after.png');
 assert.ok(fs.readFileSync(path.join(out,'compact-before.png')).equals(fs.readFileSync(path.join(out,'compact-after.png'))));
 for(const locale of ['zh-TW','zh-CN','en'])await share(locale,'detailed',`detailed-${locale}.png`);
 await share('en','detailed','detailed-missing.png',false,104);
 await share('en','detailed','detailed-empty.png',false,103);
 await share('en','detailed','detailed-unknown-model.png',false,105);
 const library=locale=>base+`/register-workspace.html?view=register&mode=library&lang=${locale}`;
 async function noOverflow(){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(await page.locator('.rw-stat-cell').evaluateAll(nodes=>nodes.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent)),[]);}
 await page.route('**/js/register-secondary-views.js',r=>r.fulfill({path:path.join(out,'register-secondary-views-before.js')}));
 await page.route('**/css/register-workspace.css',r=>r.fulfill({path:path.join(out,'register-workspace-before.css')}));
 await page.goto(library('zh-TW'));await page.locator('[data-library-select="800"]').click();await page.screenshot({path:path.join(out,'library-before.png'),fullPage:true});
 await page.unroute('**/js/register-secondary-views.js');await page.unroute('**/css/register-workspace.css');
 for(const locale of ['zh-TW','zh-CN','en']){
  await page.setViewportSize({width:1440,height:1100});await page.goto(library(locale));await page.locator('[data-library-select="800"]').click();
  assert.equal(await page.locator('.rw-detail-substats .rw-stat-cell').count(),5);await noOverflow();
  await page.screenshot({path:path.join(out,`library-desktop-${locale}.png`),fullPage:true});
  await page.locator('[data-library-select="802"]').click();await page.locator('.rw-inspector').screenshot({path:path.join(out,`library-missing-${locale}.png`)});
  for(const width of [768,390]){
   await page.setViewportSize({width,height:844});await page.goto(library(locale));await noOverflow();
   await page.screenshot({path:path.join(out,`library-list-${width}-${locale}.png`),fullPage:true});
   await page.locator('[data-library-select="800"]').click();await noOverflow();
   await page.screenshot({path:path.join(out,`library-inspector-${width}-${locale}.png`),fullPage:true});
   await page.locator('[data-library-close]').click();assert.ok(await page.locator('[data-library-select="800"]').evaluate(e=>e===document.activeElement));
  }
 }
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('mcData'))),fixture);
 await page.setViewportSize({width:1440,height:1100});await page.goto(library('en'));
 await page.locator('[data-library-filter="search"]').fill('NO_MATCH');assert.equal(await page.locator('[data-library-select]').count(),0);await page.locator('[data-library-filter="search"]').fill('');
 for(const [filter,val] of [['cost','Cost4'],['suite','光套'],['main','crit_rate'],['completeness','complete']]){
  await page.locator(`[data-library-filter="${filter}"]`).selectOption(val);assert.ok(await page.locator('[data-library-select]').count()>0);await page.locator(`[data-library-filter="${filter}"]`).selectOption('');
 }
 await page.locator('[data-library-filter="completeness"]').selectOption('incomplete');assert.ok(await page.locator('[data-library-select="802"]').count());await page.locator('[data-library-filter="completeness"]').selectOption('');
 await page.locator('[data-library-select="800"]').click();await page.locator('.rw-inspector a').click();await page.locator('select[name="value0"]').selectOption('8.1');await page.locator('form[data-action="echo"] button[type="submit"]').click();await page.waitForURL('**/*mode=library*');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mcData')).unusedEchoes.find(e=>e.costId===800).propertyList[0].value),'8.1%');
 await page.locator('[data-library-select="800"]').click();await page.locator('[data-library-field="compareRole"]').selectOption('101');await page.locator('[data-library-field="position"]').selectOption('1');await page.locator('[data-library-compare]').click();await page.waitForURL('**/*draft=*');await page.locator('[data-rr-share]').waitFor();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mcData')).unusedEchoes.length),4);
 await page.goto(library('en'));await page.locator('[data-library-select="800"]').click();await page.locator('[data-library-field="equipRole"]').selectOption('103');await page.locator('[data-equip="800"]').click();await page.waitForURL('**/mccost.html?*');
 const result=await page.evaluate(()=>JSON.parse(localStorage.getItem('mcData')));assert.equal(result.unusedEchoes.length,3);assert.equal(result.role.find(r=>r.roleId===103).costList[0].costId,800);
 assert.deepEqual(errors,[]);report.push({compactByteIdentical:true,locales:['zh-TW','zh-CN','en'],widths:[1440,768,390],search:true,filters:true,edit:true,compare:true,equip:true,viewingDoesNotWrite:true,pageErrors:errors});
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();console.log('PASS',JSON.stringify(report));
})().catch(e=>{console.error(e);process.exit(1);});
