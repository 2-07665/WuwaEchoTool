const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../js/convene-core.js'),R=require('../js/convene-character-rating.js'),M=require('../js/convene-i18n.js'),{build}=require('./convene-journey-fixture.cjs');
const get=a=>R.collection(a).find(r=>r.item==='1304');
test('七阶称号章有独立中心图案，不复用限定池图纹',()=>{
 const V=require('../js/convene-visuals.js'),shapes=new Set();for(const art of R.CHAIN_ART){const shape=V.artwork(art,'chain');shapes.add(JSON.stringify(shape));A.notDeepEqual(shape,V.artwork(art,'pool-character'));A.ok(V.badge(art,'chain').includes('data-family="chain"'));}A.equal(shapes.size,7);
});
test('展示墙七阶边框各不相同，页面和分享复用相同路径',()=>{
 const V=require('../js/convene-visuals.js'),shapes=new Set(),original=global.Path2D;global.Path2D=class{constructor(d){this.d=d;}};
 try{let previous=0;for(const art of R.CHAIN_ART){const paths=V.chainFrameArtwork(art),painted=[],ctx={save(){},restore(){},translate(){},scale(){},fill(){},stroke(p){painted.push(p.d);}};A.ok(paths.length>previous);previous=paths.length;shapes.add(JSON.stringify(paths));V.drawChainFrame(ctx,art,0,0,400,540);A.deepEqual(painted,paths.map(p=>p.d));}}finally{if(original===undefined)delete global.Path2D;else global.Path2D=original;}A.equal(shapes.size,7);
});
test('首次取得为R0，七份为R6，额外取得不升级称号也不改日期',()=>{
 A.equal(get(null).stage,null);A.equal(get(null).title,null);A.equal(R.CHAIN_TITLES.length,7);A.equal(new Set(R.CHAIN_TITLES).size,7);
 let completed;
 for(let n=1;n<=9;n++){const a=build(Object.fromEntries(Array.from({length:n},(_,i)=>[i*10,1304]))),r=get(a);A.equal(r.stage,Math.min(6,n-1));A.equal(r.title,R.CHAIN_TITLES[Math.min(6,n-1)]);A.equal(r.total,n);A.equal(Object.hasOwn(r,'score'),false);if(n===7)completed=r.completedAt;if(n>7)A.equal(r.completedAt,completed);}
});
test('称号与抽数和运势无关，三语七阶完整，墙名单排除常驻和漂泊者',()=>{
 A.equal(get(build({0:1304,1:1304})).title,get(build({0:1304,79:1304})).title);
 for(const locale of ['zh-TW','zh-CN','en'])for(const key of R.CHAIN_TITLES)A.notEqual(M.create(locale)('chain.'+key),'chain.'+key);
 const roster=C.limitedCharacters();A.equal(new Set(roster.map(r=>r.resourceId)).size,roster.length);A.ok(!roster.some(r=>['1104','1203','1301','1405','1503','1501','1502'].includes(r.resourceId)));
});
test('补登按真实提供的时间参与达成日期，未知日期不冒充补登当天',()=>{
 const a=build({0:1304}),before=JSON.stringify(a),added=C.addManualAcquisitions(a,{item:'1304',source:'history',count:6,time:'2026-10-01 12:00:00'}),r=get(added);A.equal(r.stage,6);A.equal(r.completedAt,'2026-10-01 12:00:00');A.equal(r.manualCount,6);A.equal(r.drawnCount,1);A.equal(JSON.stringify(a),before);
 const unknown=C.addManualAcquisitions(a,{item:'1304',source:'history',count:6,time:null});A.equal(get(unknown).stage,6);A.equal(get(unknown).completedAt,null);A.equal(get(unknown).unknownDates,6);A.ok(get(unknown).milestones.every(m=>m.date===null));A.deepEqual(C.validate({version:1,accounts:[unknown]}).accounts[0].manualAcquisitions,unknown.manualAcquisitions);
});
test('手动删除只改变展示进度，原始记录、统计与成就不变，重复导入幂等',()=>{
 const a=build({0:1304}),added=C.addManualAcquisitions(a,{item:'1304',source:'coral',count:6,time:'2026-10-01 12:00:00'}),removed=C.removeManualAcquisition(added,added.manualAcquisitions[0].id);A.equal(get(removed).stage,5);A.deepEqual(removed.records,a.records);A.deepEqual(C.analyse(removed),C.analyse(a));A.throws(()=>C.removeManualAcquisition(added,a.records[0].id),/INVALID_MANUAL_ENTRY/);
 const duplicate=C.combine({version:1,accounts:[added]},{version:1,accounts:[added]}).accounts[0];A.deepEqual(R.collection(duplicate),R.collection(added));
});
