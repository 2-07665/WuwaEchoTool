const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../js/convene-core.js'),R=require('../js/convene-character-rating.js');
const {build,events}=require('./convene-journey-fixture.cjs');
test('战报逐阶重算含歪成本，默认最高阶段并把第八次起独立统计',()=>{
 const a=build(events),raw=JSON.stringify(a),j=R.journey(a,'1304');A.equal(j.total,9);A.equal(j.active.target,6);A.equal(j.stages.length,7);A.deepEqual(j.entries.map(e=>e.draws),[20,40,30,50,20,60,40,20,50]);A.equal(j.entries[1].losses,1);A.equal(j.completion.draws,260);A.equal(j.completion.score,R.score(260,7));A.equal(j.excess.length,2);A.equal(j.excessDraws,70);A.equal(j.excess[0].stage,'+1');A.equal(R.journey(a,'1304',1).active.draws,60);A.equal(JSON.stringify(a),raw);
 const base=build(Object.fromEntries(Object.entries(events).filter(([i])=>Number(i)<=260)));A.deepEqual(R.journey(base,'1304').completion,j.completion);
});
test('第一个目标只取最近前置五星边界，不把最早无关历史计入',()=>{
 const j=R.journey(build({0:1205,70:1505,80:1304}),'1304');A.equal(j.entries[0].draws,10);A.equal(j.active.draws,10);A.equal(j.active.score,R.score(10,1));
});
test('首段未知保留后续单次投入，累计不伪造，断档和无关UP不得混入',()=>{
 const j=R.journey(build({0:1304,40:1304,80:1304}),'1304');A.equal(j.entries[0].draws,null);A.equal(j.entries[1].draws,40);A.equal(j.active.draws,null);A.equal(j.active.score,null);A.equal(j.mainKnownDraws,80);
 A.equal(R.journey(build({0:1505,20:1304,40:1205,60:1304}),'1304').entries[1].draws,null);
 const a=build(events);a.spans=[{pool:1,first:a.records[0].id,last:a.records[99].id},{pool:1,first:a.records[100].id,last:a.records.at(-1).id}];A.equal(R.journey(a,'1304').entries[3].draws,null);
});
test('未达到的目标和跨池记录不虚构评分，旧档重复导入和原评分保持不变',()=>{
 const a=build({0:1505,20:1304}),s=C.analyse(a),before=JSON.stringify(a),pending=R.journey(a,'1304',6);A.equal(pending.active.reached,false);A.equal(pending.active.score,null);A.equal(pending.excess.length,0);A.equal(R.journey(build({0:1304},3),'1304').active.score,null);
 const merged=C.combine({version:1,accounts:[a]},{version:1,accounts:[a]}).accounts[0];A.deepEqual(R.journey(a,'1304'),R.journey(merged,'1304'));A.deepEqual(C.analyse(a).luck,s.luck);A.equal(JSON.stringify(a),before);A.equal(C.VERSION,1);A.throws(()=>R.journey(a,'1304',7));
});
