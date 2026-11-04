/* Character-only settlement report. Overall and target renderers are independent. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./convene-visuals.js'),require('./convene-report.js'));else root.ConveneCharacterShare=factory(root.ConveneVisuals,root.ConveneReport);})(globalThis,function(Visuals,Report){
'use strict';
const number=n=>n==null?'—':Number(n).toFixed(1).replace(/\.0$/,'');
async function render({stats,character,name='',portrait=null,t,account=null,detailed=false,showUID=false,fixture=false,document:doc=globalThis.document}){
 if(!character)throw Error('IMAGE_FAILED');
 const entries=Report.acquisitions(character),cols=detailed?2:entries.length>24?4:3,w=entries.length>24?1440:1200,m=54,inner=w-m*2,gap=14,cardW=(inner-gap*(cols-1))/cols,cardH=detailed?188:112,rows=Math.ceil(entries.length/cols),gridY=detailed?874:828,end=gridY+rows*(cardH+gap)-gap,h=end+(detailed?194:138);
 if(h>30000)throw Error('IMAGE_TOO_LARGE');
 await doc.fonts?.ready;const c=doc.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(!x)throw Error('IMAGE_FAILED');
 const title=character.luck.title,accent=Visuals.COLORS[title]||Visuals.COLORS.observing,ink='#edf0e7',muted='#a5bcb9',metal='#dccca9',layout=[];
 function text(value,px,py,size=24,color=ink,max=inner,weight=500){let s=String(value),font=size;const set=()=>x.font=weight+' '+font+'px "Segoe UI","Microsoft JhengHei",sans-serif';set();while(x.measureText(s).width>max&&font>15){font--;set();}while(x.measureText(s).width>max&&s.length)s=s.slice(0,-1);if(s!==String(value))s=s.slice(0,-1)+'…';x.fillStyle=color;x.fillText(s,px,py);layout.push({text:s,x:px,y:py,font,width:x.measureText(s).width,limit:max});}
 function line(y){x.strokeStyle=accent+'45';x.beginPath();x.moveTo(m,y);x.lineTo(w-m,y);x.stroke();}
 function box(px,py,pw,ph){const g=x.createLinearGradient(px,py,px+pw,py+ph);g.addColorStop(0,'#20393d');g.addColorStop(1,'#172a32');x.fillStyle=g;x.strokeStyle=accent+'48';x.lineWidth=1;x.beginPath();x.roundRect(px,py,pw,ph,7);x.fill();x.stroke();}
 const bg=x.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#12212e');bg.addColorStop(.5,'#183335');bg.addColorStop(1,'#0c1e25');x.fillStyle=bg;x.fillRect(0,0,w,h);
 text('WUWA ECHO TOOL',m,46,16,metal);text(t('characterAutomatic'),m,76,16,muted);
 Visuals.drawFrame(x,title,24,98,w-48,516);
 // Portrait and name share a dedicated identity panel.
 x.save();x.beginPath();x.rect(45,112,400,486);x.clip();
 const src=portrait||'image/convene/character-fallback.svg';let loaded=false;
 if(/^(?:image\/characters\/[\w-]+\.(?:webp|png|jpe?g|avif)|image\/convene\/character-fallback\.svg)$/.test(src)){const image=new (doc.defaultView?.Image||globalThis.Image)();image.src=src;let timer;try{await Promise.race([image.decode(),new Promise((_,reject)=>timer=setTimeout(()=>reject(Error()),4000))]);const scale=Math.min(380/image.naturalWidth,410/image.naturalHeight),iw=image.naturalWidth*scale,ih=image.naturalHeight*scale;x.drawImage(image,62+(360-iw)/2,574-ih,iw,ih);loaded=true;}catch(_){}finally{clearTimeout(timer)}}
 if(!loaded)Visuals.drawBadge(x,'observing',240,330,190,'character');x.restore();
 const nameBg=x.createLinearGradient(0,482,0,598);nameBg.addColorStop(0,'#10232b00');nameBg.addColorStop(.6,'#10232be0');nameBg.addColorStop(1,'#10232b');x.fillStyle=nameBg;x.fillRect(48,482,392,116);
 text(name||character.name,68,558,49,ink,350,650);text('RESONATOR · 5★',70,587,13,metal,350);
 const cx=440+(w-480)/2;
 Visuals.drawBadge(x,title,cx,271,278,'character');
 const titleText=t('bond.'+title);x.font='600 42px "Segoe UI","Microsoft JhengHei",sans-serif';const titleWidth=Math.min(w-500,x.measureText(titleText).width);text(titleText,cx-titleWidth/2,455,42,accent,w-500,600);
 const score=character.luck.score==null?'—':character.luck.score.toFixed(1),label=score+' / 100';x.font='500 43px "Segoe UI","Microsoft JhengHei",sans-serif';text(label,cx-x.measureText(label).width/2,518,43,ink,w-500);
 text(t('characterSample',{n:character.luck.samples}),470,559,17,muted,w-520);
 text(t('bond.'+title+'.desc'),470,589,16,muted,w-520);
 const metrics=[['acquired',character.total],['avg',number(character.average)],['fast',number(character.min)],['slow',number(character.max)]];
 if(detailed)metrics.push(['sumIntervals',character.knownSpend]);
 metrics.forEach(([key,value],i)=>{const xx=m+i*inner/metrics.length;text(t(key),xx,660,16,muted,inner/metrics.length-18);text(value,xx,706,34,ink,inner/metrics.length-18,600)});
 line(733);text(t('allAcquisitions'),m,777,25,metal,inner-240,600);text(t('allShown',{n:entries.length}),w-286,777,16,muted,232);
 if(detailed)text(t('sumIntervalsNote'),m,825,15,muted);
 entries.forEach((r,i)=>{const xx=m+(i%cols)*(cardW+gap),yy=gridY+Math.floor(i/cols)*(cardH+gap);box(xx,yy,cardW,cardH);
  // A medal-like index connects the chronological acquisition to the hero seal.
  x.strokeStyle=accent+'90';x.beginPath();x.moveTo(xx+17,yy+16);x.lineTo(xx+47,yy+16);x.lineTo(xx+53,yy+27);x.lineTo(xx+47,yy+38);x.lineTo(xx+17,yy+38);x.stroke();
  text(String(r.ordinal).padStart(2,'0'),xx+22,yy+32,14,metal,30,600);
  text(t('acquisitionOrdinal',{n:r.ordinal}),xx+66,yy+32,16,muted,cardW-88);
  const value=r.interval!=null?String(r.interval):r.lowerBound!=null?'≥ '+r.lowerBound:'—';
  text(value,xx+20,yy+83,42,r.interval!=null?accent:muted,cardW*.45,600);
  text(t(r.anomaly?'intervalAnomaly':r.interval!=null?'exactShort':r.lowerBound!=null?'lowerBoundShort':'unknownInterval'),xx+cardW*.49,yy+81,14,muted,cardW*.51-20);
  if(detailed){text(r.time,xx+20,yy+121,18,ink,cardW-40);const p=stats.pools.find(p=>p.pool===r.pool);text(p?.displayName||t((p?.rule.key||'unknown')+'Pool'),xx+20,yy+151,16,muted,cardW-40);text(t(r.outcomeKey||r.upResult||'unknown'),xx+20,yy+175,14,muted,cardW-40);}
 });
 const coverage=Report.coverage(stats),unknown=entries.filter(r=>r.interval==null).length;line(end+25);
 text(t('reportCoverage',{n:unknown,gaps:coverage.gaps}),m,end+59,16,muted);
 if(detailed)text(t('optionalTargetSeparate'),m,end+95,16,muted);
 text(fixture?t('sample'):t('archiveScope'),m,h-30,14,muted,inner-230);
 if(showUID&&account)text('UID '+Report.maskUID(account.uid),w-290,h-30,14,muted,236);
 return {canvas:c,dataURL:c.toDataURL('image/png'),pages:1,page:0,layout,acquisitionCount:entries.length,acquisitionIDs:entries.map(r=>r.id),coverage,highlights:[],rating:{title,score:character.luck.score},badgeSize:278};
}
// 新战报与页面读取同一个归属模型，满链后的记录不会进入 R6 效率。
async function renderJourney({report,mode='current',name='',portrait=null,t,account=null,detailed=false,showUID=false,page=0,document:doc=globalThis.document}){
 if(!report||!['current','full','excess'].includes(mode))throw Error('IMAGE_FAILED');
 const history=mode==='excess'?report.excess:detailed?report.entries:[],pages=Math.max(1,Math.ceil(history.length/12)),currentPage=Math.min(Math.max(0,page),pages-1),rows=history.slice(currentPage*12,currentPage*12+12),extra=mode==='excess',active=mode==='full'||extra?report.completion:report.active,title=active.tier;
 await doc.fonts?.ready;const c=doc.createElement('canvas');c.width=1200;c.height=(extra?850:1480)+(rows.length?70+rows.length*52:0);const x=c.getContext('2d');if(!x)throw Error('IMAGE_FAILED');
 const accent=Visuals.COLORS[title],ink='#edf3ef',muted='#a9bec6',layout=[],value=n=>n==null?'—':number(n);
 function text(value,px,py,size=24,color=ink,max=1088){let s=String(value),font=size;const set=()=>x.font='500 '+font+'px "Segoe UI","Microsoft JhengHei",sans-serif';set();while(x.measureText(s).width>max&&font>14){font--;set();}while(x.measureText(s).width>max&&s.length)s=s.slice(0,-1);x.fillStyle=color;x.fillText(s,px,py);layout.push({text:s,x:px,y:py,font,width:x.measureText(s).width,limit:max});}
 function metric(label,n,px,py){text(t(label),px,py,20,muted,325);text(value(n),px,py+66,49,ink,325);}
 const bg=x.createLinearGradient(0,0,1200,c.height);bg.addColorStop(0,'#1b303b');bg.addColorStop(1,'#0b181f');x.fillStyle=bg;x.fillRect(0,0,1200,c.height);
 text('WUWA ECHO TOOL',56,54,18,accent);text(t(extra?'jExtras':'jTitle'),56,88,20,muted);
 Visuals.drawFrame(x,title,28,110,1144,370);
 let loaded=false;if(portrait&&/^image\/characters\/[\w-]+\.(webp|png|jpe?g|avif)$/.test(portrait)){const img=new (doc.defaultView?.Image||globalThis.Image)();img.src=portrait;let timer;try{await Promise.race([img.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error()),4000);})]);const ratio=Math.min(290/img.naturalWidth,315/img.naturalHeight);x.drawImage(img,58+(290-img.naturalWidth*ratio)/2,448-img.naturalHeight*ratio,img.naturalWidth*ratio,img.naturalHeight*ratio);loaded=true;}catch(_){}finally{clearTimeout(timer);}}
 if(!loaded)Visuals.drawBadge(x,title,205,295,245,'character');
 text(name,380,184,42,ink,730);text(extra?t('jExtraCount'):'R'+active.target+' · '+t('jEfficiency'),380,230,21,muted,520);
 text(extra?'+'+report.excess.length:value(active.score),380,337,94,accent,450);if(!extra)text('/ 100',710,337,23,muted,160);
 text(t(extra?'jProgress':active.score==null?(active.reached&&active.drawnCopies===0?'jManualOnly':'jNoScore'):'bond.'+title,{n:report.currentTarget}),380,407,28,ink,500);text(t('jSources',{drawn:report.drawnCount,manual:report.manualCount}),380,444,16,muted,500);Visuals.drawBadge(x,title,1015,320,200,'character');
 metric('jCopies',report.total,56,548);metric(extra?'jExtraCost':mode==='full'?'jFullCost':'jCurrentCost',extra?report.excessDraws:active.draws,420,548);metric('jExtraCount',report.excess.length,784,548);
 let yy=730;
 if(!extra){
  text(t('jRoute'),56,yy,28,accent);yy+=54;
  [ ['jStage',56],['jCopyCost',290],['jCumulative',545],['jLosses',785],['jEfficiency',985] ].forEach(([key,px])=>text(t(key),px,yy,17,muted,key==='jEfficiency'?160:210));yy+=25;
  report.stages.forEach(stage=>{yy+=57;x.strokeStyle=accent+'30';x.beginPath();x.moveTo(56,yy+15);x.lineTo(1144,yy+15);x.stroke();text(stage.stage,56,yy,25,stage.target===active.target?accent:ink,180);text(stage.entry?.manual?t(stage.entry.source==='coral'?'jSourceCoral':'jSourceManual'):value(stage.entry?.draws),290,yy,stage.entry?.manual?16:25,ink,210);text(value(stage.draws),545,yy,25);text(value(stage.entry?.losses),785,yy,25);text(value(stage.score),985,yy,25,accent,150);});
  yy+=66;text(t('jMissingCount',{n:report.missing}),56,yy,19,muted);yy+=42;
 }
 if(rows.length){text(t(extra?'jExtras':'acquisitionTimeline')+' · '+(currentPage+1)+' / '+pages,56,yy,24,accent);yy+=48;rows.forEach(entry=>{text(entry.stage,56,yy,23,ink,150);text(entry.time,220,yy,20,muted,510);text(entry.manual?t(entry.source==='coral'?'jSourceCoral':'jSourceManual'):t('jCopyCost')+' '+value(entry.draws),790,yy,19,ink,350);yy+=52;});}
 text(t('jProgress',{n:report.currentTarget??0}),56,c.height-78,18,muted);text(t('selfMade'),56,c.height-36,15,muted,790);if(showUID&&account)text('UID '+Report.maskUID(account.uid),890,c.height-36,16,muted,250);
 return {canvas:c,dataURL:c.toDataURL('image/png'),pages,page:currentPage,layout,rating:{title,score:extra?null:active.score},mode,acquisitionIDs:rows.map(r=>r.id)};
}
// 纪念卡与展示墙使用链数称号，不绘制抽数、效率或超额取得数据。
async function renderChain({collection=[],chain=null,mode='character',t,account=null,showUID=false,page=0,document:doc=globalThis.document}){
 const gallery=mode==='gallery',owned=collection.filter(r=>r.total),pages=gallery?Math.max(1,Math.ceil(owned.length/9)):1,currentPage=Math.min(Math.max(0,page),pages-1),rows=gallery?owned.slice(currentPage*9,currentPage*9+9):[chain];
 if(rows.some(r=>!r)||!rows.length)throw Error('IMAGE_FAILED');await doc.fonts?.ready;
 const c=doc.createElement('canvas');c.width=1200;c.height=gallery?160+Math.ceil(rows.length/3)*470:1350;const x=c.getContext('2d');if(!x)throw Error('IMAGE_FAILED');const layout=[];
 function text(value,px,py,size,color='#edf3ef',max=1088){let s=String(value),font=size;const set=()=>x.font='500 '+font+'px "Segoe UI","Microsoft JhengHei",sans-serif';set();while(x.measureText(s).width>max&&font>14){font--;set();}while(x.measureText(s).width>max&&s.length)s=s.slice(0,-1);x.fillStyle=color;x.fillText(s,px,py);layout.push({text:s,x:px,y:py,font,width:x.measureText(s).width,limit:max});}
 async function load(src){if(!/^image\/(?:characters\/[\w-]+\.(?:webp|png|jpe?g|avif)|convene\/character-fallback\.svg)$/.test(src||''))return null;const img=new (doc.defaultView?.Image||globalThis.Image)();img.src=src;let timer;try{await Promise.race([img.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error()),4000);})]);return img;}catch(_){return null;}finally{clearTimeout(timer);}}
 function centered(value,cx,py,size,color,max){let font=size;x.font='500 '+font+'px "Segoe UI","Microsoft JhengHei",sans-serif';while(x.measureText(String(value)).width>max&&font>14){font--;x.font='500 '+font+'px "Segoe UI","Microsoft JhengHei",sans-serif';}text(value,cx-x.measureText(String(value)).width/2,py,font,color,max);}
 function nameplate(value,cx,py,size,max){let font=size;x.font='500 '+font+'px "Segoe UI","Microsoft JhengHei",sans-serif';while(x.measureText(String(value)).width>max&&font>14){font--;x.font='500 '+font+'px "Segoe UI","Microsoft JhengHei",sans-serif';}const width=x.measureText(String(value)).width;x.fillStyle='#08161ee8';x.strokeStyle='#bcd0d438';x.lineWidth=1;x.beginPath();x.roundRect(cx-width/2-14,py-font-7,width+28,font+19,8);x.fill();x.stroke();centered(value,cx,py,font,'#f4f7f5',max);}
 const images=await Promise.all(rows.map(r=>load(r.portrait))),bg=x.createLinearGradient(0,0,1200,c.height);bg.addColorStop(0,'#1b303b');bg.addColorStop(1,'#0a1720');x.fillStyle=bg;x.fillRect(0,0,1200,c.height);
 text('WUWA ECHO TOOL',48,48,16,'#a9bec6');
 for(let i=0;i<rows.length;i++){
  const r=rows[i],accent=Visuals.COLORS[r.art],px=gallery?48+(i%3)*376:48,py=gallery?94+Math.floor(i/3)*470:88,w=gallery?352:1104,h=gallery?440:1180,img=images[i];
  x.strokeStyle=accent+'80';x.lineWidth=gallery?1:2;x.strokeRect(px,py,w,h);
  const glow=x.createRadialGradient(px+w/2,py+h*.35,0,px+w/2,py+h*.35,w*.7);glow.addColorStop(0,accent+'23');glow.addColorStop(1,accent+'00');x.fillStyle=glow;x.fillRect(px,py,w,h);
  if(img){const scale=Math.min((w-16)/img.naturalWidth,(h*.65)/img.naturalHeight);x.drawImage(img,px+(w-img.naturalWidth*scale)/2,py+12,img.naturalWidth*scale,img.naturalHeight*scale);}
  const shade=x.createLinearGradient(0,py+h*.65,0,py+h);shade.addColorStop(0,'#10212b00');shade.addColorStop(.5,'#10212be8');shade.addColorStop(1,'#0c1924');x.fillStyle=shade;x.fillRect(px+1,py+h*.65,w-2,h*.35-1);
  nameplate(r.name,px+w/2,py+h-(gallery?155:405),gallery?23:45,w-56);
  Visuals.drawBadge(x,r.art,px+w/2,py+h-(gallery?102:285),gallery?76:180,'chain');
  centered(t('chain.'+r.title),px+w/2,py+h-(gallery?40:135),gallery?28:60,accent,w-40);
  x.fillStyle=accent;x.fillRect(px+w/2-(gallery?26:60),py+h-(gallery?22:100),gallery?52:120,2);
  const date=r.milestones[r.stage]?.date;if(!gallery&&date)centered(t('chainDate')+' · '+date.slice(0,10),px+w/2,py+h-55,21,'#a9bec6',w-40);
  Visuals.drawChainFrame(x,r.art,px,py,w,h);
 }
 text(gallery?t('chainWall'):t('selfMade'),48,c.height-28,15,'#a9bec6',850);if(gallery)text((currentPage+1)+' / '+pages,1040,c.height-28,16,'#a9bec6',110);if(showUID&&account)text('UID '+Report.maskUID(account.uid),890,c.height-52,16,'#a9bec6',250);
 return {canvas:c,dataURL:c.toDataURL('image/png'),pages,page:currentPage,layout,items:rows.map(r=>r.item),mode};
}
return {render,renderJourney,renderChain};
});
