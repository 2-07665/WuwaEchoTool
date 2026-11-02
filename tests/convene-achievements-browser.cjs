// 仅使用临时浏览器与合成存档，检查三语收藏柜、SVG/Canvas 和分享；不连接真实账号。
const fs=require('node:fs'),path=require('node:path'),A=require('node:assert/strict');
const {createServer}=require('../scripts/serve.cjs'),C=require('../js/convene-core.js'),V=require('../js/convene-visuals.js'),Cab=require('../js/convene-cabinet.js'),M=require('../js/convene-i18n.js');
let pw;try{pw=require('playwright');}catch(_){pw=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');}
const out=path.resolve('artifacts/convene-achievements-20261102');fs.mkdirSync(out,{recursive:true});
const raw=Array.from({length:66},(_,i)=>({time:new Date(Date.UTC(2026,8,30,9,0,i)).toISOString().slice(0,19).replace('T',' '),resourceId:i%5===0?'1311':'21010013',name:'合成测试',resourceType:i%5===0?'角色':'武器',qualityLevel:i%5===0?5:3,cardPoolType:'generic'})).reverse();
const fixture={version:1,accounts:[C.mergeAccount(null,{uid:'799999982',server:'achievement-fixture',region:'cn'},1,raw).account]};
const familyNames={voyage:'远航里程',gold:'五星宝藏',early:'出金节奏',endurance:'保底与坚守',recovery:'逆境转运',companions:'角色旅伴',armory:'武器收藏',devotion:'角色羁绊',otherworld:'异界交汇',fourStar:'四星收藏',time:'时间记录',upVictory:'小保胜利',adversity:'逆风战绩'};
const t=M.create('zh-CN'),escape=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const gallery='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>共鸣成就 · 42 枚语义徽章</title><style>body{margin:0;background:#101b22;color:#e9ece6;font:15px/1.6 "Segoe UI","Microsoft YaHei",sans-serif}main{max-width:1300px;margin:auto;padding:42px}h1{font-size:30px;margin:0 0 12px}p{color:#aebfbd;margin:4px 0}h2{margin:34px 0 15px;font-size:20px;color:var(--metal)}section{--metal:#adc8cf}section>div{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}article{padding:20px 12px;background:linear-gradient(145deg,#20323b,#14232a);border:1px solid color-mix(in srgb,var(--metal) 35%,transparent);border-radius:14px;text-align:center}article>.large{width:112px;height:112px;display:block;margin:0 auto 10px}svg{width:100%;height:100%}.sizes{display:flex;align-items:center;justify-content:center;gap:14px;height:48px;margin:12px 0 0}.sizes span{display:block;width:40px;height:40px}.sizes span+span{width:24px;height:24px}h3{font-size:17px;margin:3px;color:var(--metal)}small{color:#afc0bf}.note{margin-top:28px}@media(max-width:650px){main{padding:22px 16px}section>div{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}article{padding:16px 6px}article>.large{width:94px;height:94px}h3{font-size:15px}}</style><main><h1>共鸣成就 · 42 枚语义徽章</h1><p>主图案表达条件，相关进阶共用主题；外框与金属色只表达稀有度。</p><p>每枚同时展示 112 / 40 / 24 像素效果。本页为样式预览，不代表玩家解锁。</p>'+Cab.tiers.map(r=>'<section style="--metal:'+V.ACHIEVEMENT_COLORS[r]+'"><h2>'+escape(t('rarity.'+r))+'</h2><div>'+V.achievementKeys.filter(k=>Cab.rarity[k]===r).map(k=>'<article data-preview-key="'+k+'"><span class="large">'+V.achievementIcon(k)+'</span><h3>'+escape(t(k==='pity'?'pityAch':k))+'</h3><small>'+familyNames[V.achievementArtwork(k).family]+'</small><div class="sizes"><span>'+V.achievementIcon(k)+'</span><span>'+V.achievementIcon(k)+'</span></div></article>').join('')+'</div></section>').join('')+'<p class="note">SVG 页面和 Canvas 分享共用同一套图案路径，无随机分配或索引循环。</p></main></html>';
fs.writeFileSync(path.join(out,'icon-gallery.html'),gallery);
let server,browser,last;const pageErrors=[],flows=[];
(async()=>{
 server=await createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await pw.chromium.launch({channel:'msedge',headless:true});
 const base='http://127.0.0.1:'+server.address().port;
 for(const width of [1440,390])for(const locale of ['zh-CN','zh-TW','en']){
  const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  const p=last=await ctx.newPage();p.on('pageerror',e=>pageErrors.push(e.message));
  await p.goto(base+'/convene.html?view=register&fixture=1&lang='+locale);
  await p.locator('.cv-tabs [data-view=cabinet]').waitFor();await p.locator('.cv-tabs [data-view=cabinet]').click();
  A.equal(await p.locator('.cv-collectible').count(),42);A.equal(await p.locator('[data-state=unlocked]').count(),0);
  await p.evaluate(d=>ConveneStore.create().update(()=>d),fixture);await p.reload();
  await p.locator('.cv-tabs [data-view=cabinet]').click();
  const saved=await p.evaluate(async()=>JSON.stringify(await ConveneStore.create().read()));
  const cards=await p.evaluate(()=>[...document.querySelectorAll('.cv-collectible')].map(el=>({key:el.dataset.achievementKey,state:el.dataset.state,rarity:el.dataset.rarity,name:el.querySelector('h3').textContent,condition:el.querySelector('.cv-collectible-copy p').textContent})));
  const expected=Cab.items(C.analyse(fixture.accounts[0]));A.equal(cards.length,42);
  A.ok(cards.slice(0,4).every(x=>x.rarity==='mythic'));
  A.equal(cards.find(x=>x.key==='afterPity7').state,'notReached');
  A.equal(cards.find(x=>x.key==='upWin7').state,'unlocked');A.equal(cards.find(x=>x.key==='early5').state,'unlocked');A.equal(cards.find(x=>x.key==='consecutive3').state,'notReached');
  const shelves=await p.evaluate(()=>[...document.querySelectorAll('[data-rarity-shelf]')].map(e=>({rarity:e.dataset.rarityShelf,label:e.querySelector('h2').textContent,color:getComputedStyle(e).getPropertyValue('--shelf').trim()})));
  A.deepEqual(shelves.map(x=>x.rarity),Cab.tiers);for(const shelf of shelves){A.equal(shelf.color,V.ACHIEVEMENT_COLORS[shelf.rarity]);A.equal(shelf.label,M.create(locale)('rarity.'+shelf.rarity));}
  A.equal(await p.locator('.cv-vault-header h1,.cv-vault-header p,.cv-vault-header>div>small').count(),0);
  A.equal(await p.locator('.cv-vault-header>progress').getAttribute('max'),'42');
  A.equal(await p.locator('.cv-vault-header>progress').getAttribute('value'),String(expected.filter(x=>x.state==='unlocked').length));
  A.ok(await p.locator('.cv-vault-header').evaluate(el=>el.getBoundingClientRect().height<=40));
  for(const [i,card]of cards.entries()){A.equal(card.key,expected[i].key);A.equal(card.state,expected[i].state);A.equal(card.rarity,expected[i].rarity);A.notEqual(card.condition,'condition.'+card.key);}
  A.equal(cards.find(x=>x.key==='upWin5').state,'unlocked');A.equal(cards.find(x=>x.key==='upLoss3').state,'notReached');
  A.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(locale==='zh-TW'){await p.screenshot({path:path.join(out,'cabinet-'+width+'-'+locale+'.png'),fullPage:true});await p.screenshot({path:path.join(out,'cabinet-header-'+width+'.png')});}
  const rendering=await p.evaluate(async()=>{
   const a=(await ConveneStore.create().read()).accounts[0],stats=ConveneCore.analyse(a),t=ConveneMessages.create(document.documentElement.lang),artErrors=[];
   const svgCanvas=document.createElement('canvas');svgCanvas.width=100;svgCanvas.height=100;const x=svgCanvas.getContext('2d');
   // 每枚 SVG 与 Canvas 都实际解析绘制，且中心区域必须包含可见像素。
   for(const key of ConveneVisuals.achievementKeys){
    const blob=new Blob([ConveneVisuals.achievementIcon(key).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ')],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),img=new Image();
    try{img.src=url;await img.decode();x.clearRect(0,0,100,100);x.drawImage(img,0,0,100,100);const svgPixels=x.getImageData(0,0,100,100).data.slice();x.clearRect(0,0,100,100);ConveneVisuals.drawAchievement(x,key,0,0,100);const pixels=x.getImageData(0,0,100,100).data;
     if(!pixels.some((v,i)=>i%4===3&&v>0))artErrors.push(key+':empty');
     // 渐变的SVG坐标与Canvas相同，允许抗锯齿差异，只检查主体覆盖形状。
     let mismatch=0;for(let i=3;i<pixels.length;i+=4)if((pixels[i]>128)!==(svgPixels[i]>128))mismatch++;if(mismatch>160)artErrors.push(key+':shape '+mismatch);
    }catch(e){artErrors.push(key+':'+e.message);}finally{URL.revokeObjectURL(url);}
   }
   const shares=[];for(const detailed of [false,true]){const r=await ConveneShare.render({stats,t,detailed,fixture:true});shares.push({detailed,valid:r.layout.every(l=>l.x>=0&&l.y>0&&l.y<r.canvas.height&&l.width<=l.limit+2),png:r.dataURL});}
   return {artErrors,shares};
  });
  A.deepEqual(rendering.artErrors,[]);A.ok(rendering.shares.every(x=>x.valid));
  if(width===1440&&locale==='zh-TW')for(const s of rendering.shares)fs.writeFileSync(path.join(out,'share-'+(s.detailed?'detailed':'compact')+'.png'),Buffer.from(s.png.split(',')[1],'base64'));
  A.equal(await p.evaluate(async()=>JSON.stringify(await ConveneStore.create().read())),saved);
  flows.push({width,locale,count:42,storageUnchanged:true,svgCanvas:42,shares:2});await ctx.close();
 }
 const p=last=await browser.newPage({viewport:{width:1440,height:1000}});await p.setContent(gallery);A.equal(await p.locator('[data-preview-key]').count(),42);await p.screenshot({path:path.join(out,'icon-gallery.png'),fullPage:true});
 await p.evaluate(samples=>{
  const cards=samples.map(({key,color})=>{const card=document.querySelector('[data-preview-key="'+key+'"]').cloneNode(true);card.style.setProperty('--metal',color);return card;});
  document.querySelector('main').innerHTML='<h1>成就图示 · 内容决定主图案</h1><p>神话采用白金虹彩与放射星环；传说延续桂冠框，中心图案对应各自条件。</p><p>外框和金属色只表示稀有度；下方附 40 / 24 像素缩略效果。样式预览不代表玩家解锁。</p><section><div></div></section>';
  document.querySelector('section>div').append(...cards);
 },['upWin7','early5','consecutive3','afterPity7','early4','consecutive2','afterPity3','fiveCharacters20'].map(key=>({key,color:V.ACHIEVEMENT_COLORS[Cab.rarity[key]]})));
 await p.locator('main').screenshot({path:path.join(out,'icon-samples.png')});
 A.deepEqual(pageErrors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({flows,pageErrors,allDataSynthetic:true},null,2));console.log('PASS 42 semantic icons, 6 cabinet viewport/language flows, 252 SVG/Canvas comparisons, 12 share layouts, unchanged storage.');
})().catch(async e=>{console.error(e);await last?.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});process.exitCode=1;}).finally(async()=>{await browser?.close();server?.close();});
